import Dexie, { type Table } from 'dexie'
import { parseInput } from '../model'
import { isRunning, recordId, restRemaining, starterProgram, targets, type PendingChange, type Workout, type WorkoutDraft, type WorkoutSet, type WorkoutWorkspace } from './model'

export class WorkoutDatabase extends Dexie {
  sessions!: Table<Workout, string>
  sets!: Table<WorkoutSet, string>
  drafts!: Table<WorkoutDraft, string>
  outbox!: Table<PendingChange, string>
  workspace!: Table<WorkoutWorkspace, string>

  constructor(name = 'training-m2') {
    super(name)
    this.version(1).stores({ sessions: 'id, startedAt', sets: 'id, sessionId', drafts: 'id, sessionId', outbox: 'id, entityId, status', workspace: 'id' })
  }
}
export const workoutDb = new WorkoutDatabase()
const changed = () => new Error('Deze training is in een ander venster gewijzigd. Je invoer is niet overschreven. Open de actuele training opnieuw.')

export async function openWorkspace(database = workoutDb) {
  return database.transaction('rw', database.workspace, async () => {
    if (!(await database.workspace.get('main'))) await database.workspace.add({ id: 'main', sessionId: null, weekend: null, revision: 0 })
  })
}

async function queueSession(session: Workout, database: WorkoutDatabase) {
  await database.sessions.put(session)
  await database.outbox.put({ id: `${session.id}:v${session.revision}`, entityId: session.id, entity: 'session', payload: session, status: 'local', createdAt: new Date().toISOString() })
}

export async function beginWorkout(database = workoutDb) {
  return database.transaction('rw', database.workspace, database.sessions, database.outbox, async () => {
    const workspace = await database.workspace.get('main')
    if (!workspace) throw new Error('Open de app opnieuw om je planning te laden.')
    if (workspace.sessionId) {
      const existing = await database.sessions.get(workspace.sessionId)
      if (!existing) throw new Error('Je training ontbreekt. Er is niets overschreven.')
      if (isRunning(existing)) return existing
    }
    const session: Workout = { id: crypto.randomUUID(), startedAt: new Date().toISOString(), status: 'active', phase: 'warmup', warmed: false, cursor: 0, revision: 1, snapshot: structuredClone(starterProgram), rest: null }
    await queueSession(session, database)
    await database.workspace.put({ ...workspace, sessionId: session.id })
    return session
  })
}

function currentTarget(session: Workout) {
  const current = targets(session.snapshot)[session.cursor]
  if (!current) throw new Error('Alle sets zijn al vastgelegd.')
  return { ...current, id: recordId(session.id, current.slot.id, current.target.number) }
}

export async function writeDraft(input: WorkoutDraft, expectedRevision: number, database = workoutDb) {
  return database.transaction('rw', database.sessions, database.sets, database.drafts, async () => {
    const session = await database.sessions.get(input.sessionId)
    if (!session || session.status !== 'active' || session.phase !== 'exercise' || session.rest) throw changed()
    if (currentTarget(session).id !== input.id || await database.sets.get(input.id)) throw changed()
    const saved = await database.drafts.get(input.id)
    if ((saved?.revision ?? 0) !== expectedRevision) throw new Error('Er staat andere conceptinvoer in een ander venster. Je invoer staat nog in beeld; open de actuele set opnieuw.')
    const next = { ...input, revision: expectedRevision + 1, updatedAt: new Date().toISOString() }
    await database.drafts.put(next)
    return next
  })
}

export async function logSet(draft: WorkoutDraft, sessionRevision: number, database = workoutDb) {
  const values = parseInput(draft.weight, draft.reps)
  return database.transaction('rw', database.sessions, database.sets, database.drafts, database.outbox, async () => {
    const existing = await database.sets.get(draft.id)
    if (existing) {
      if (existing.weight === values.weight && existing.reps === values.reps) return existing
      throw changed()
    }
    const session = await database.sessions.get(draft.sessionId)
    if (!session || session.revision !== sessionRevision || session.status !== 'active' || session.phase !== 'exercise' || session.rest) throw changed()
    const { slot, target, id } = currentTarget(session)
    const saved = await database.drafts.get(id)
    if (id !== draft.id || !saved || saved.revision !== draft.revision || saved.weight !== draft.weight || saved.reps !== draft.reps) throw changed()
    const record: WorkoutSet = { id, sessionId: session.id, slotId: slot.id, exerciseId: slot.exerciseId, number: target.number, ...values, target, recordedAt: new Date().toISOString() }
    await database.sets.add(record)
    await database.outbox.add({ id: `${id}:record`, entity: 'set', entityId: id, payload: record, status: 'local', createdAt: record.recordedAt })
    await database.drafts.delete(id)
    session.cursor++
    session.revision++
    session.rest = session.cursor < targets(session.snapshot).length ? { afterSetId: id, endAt: Date.now() + slot.restSeconds * 1000, remainingMs: slot.restSeconds * 1000 } : null
    await queueSession(session, database)
    return record
  })
}

export type SessionAction = 'begin-exercise' | 'pause' | 'resume' | 'next-set' | 'extra-rest' | 'complete' | 'abort' | 'warmup-on' | 'warmup-off'
export async function changeWorkout(id: string, revision: number, action: SessionAction, draftRevision?: number, database = workoutDb) {
  return database.transaction('rw', database.sessions, database.drafts, database.outbox, async () => {
    const session = await database.sessions.get(id)
    if (!session || session.revision !== revision || !isRunning(session)) throw changed()
    if (action === 'complete' || action === 'abort') {
      const drafts = await database.drafts.where('sessionId').equals(id).toArray()
      if (drafts.some(draft => draft.revision !== draftRevision)) throw new Error('Er staat nieuwe conceptinvoer. Controleer die voordat je de sessie beëindigt.')
      session.status = action === 'abort' ? 'aborted' : 'completed'
      session.endedAt = new Date().toISOString()
      session.rest = null
      await database.drafts.where('sessionId').equals(id).delete()
    } else if (action === 'resume') {
      if (session.status === 'paused' && session.rest) session.rest.endAt = Date.now() + session.rest.remainingMs
      session.status = 'active'
    } else {
      if (session.status !== 'active') throw new Error('Hervat je training voordat je verdergaat.')
      if (action === 'pause') {
        if (session.rest) session.rest.remainingMs = restRemaining(session)
        session.status = 'paused'
      } else if (action === 'begin-exercise') session.phase = 'exercise'
      else if (action === 'warmup-on' || action === 'warmup-off') session.warmed = action === 'warmup-on'
      else {
        if (!session.rest) throw new Error('Er loopt geen rust meer. Open de actuele set opnieuw.')
        if (action === 'next-set') session.rest = null
        else session.rest.endAt = Math.max(Date.now(), session.rest.endAt) + 30_000
      }
    }
    session.revision++
    await queueSession(session, database)
    return session
  })
}

export async function updateWeekend(weekend: WorkoutWorkspace['weekend'], revision: number, database = workoutDb) {
  return database.transaction('rw', database.workspace, database.outbox, async () => {
    const current = await database.workspace.get('main')
    if (!current || current.revision !== revision) throw new Error('Je planning is in een ander venster aangepast. Open Plan opnieuw voordat je opslaat.')
    const workspace = { ...current, weekend, revision: revision + 1 }
    delete workspace.planDraft
    await database.workspace.put(workspace)
    await database.outbox.put({ id: `planning:v${workspace.revision}`, entityId: 'main', entity: 'planning', payload: workspace, status: 'local', createdAt: new Date().toISOString() })
  })
}

export async function savePlanDraft(weekend: WorkoutWorkspace['weekend'], revision: number, database = workoutDb) {
  await database.transaction('rw', database.workspace, async () => {
    const current = await database.workspace.get('main')
    if (!current || current.revision !== revision) throw new Error('Je planning is intussen gewijzigd. Open Plan opnieuw.')
    await database.workspace.put({ ...current, planDraft: { weekend, baseRevision: revision } })
  })
}
export async function cancelPlanDraft(database = workoutDb) {
  await database.transaction('rw', database.workspace, async () => {
    const current = await database.workspace.get('main')
    if (current?.planDraft) { delete current.planDraft; await database.workspace.put(current) }
  })
}
