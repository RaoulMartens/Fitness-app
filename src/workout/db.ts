import Dexie, { type Table } from 'dexie'
import { parseInput, isRunning, recordId, restRemaining, starterProgram, targets, pendingIds, pendingTargets, localDate, lastUndoable, draftVersions, type Appointment, type AdjustmentState, type DraftVersions, type PendingChange, type Workout, type WorkoutDraft, type WorkoutSet, type WorkoutWorkspace, type Proposal, type ExerciseState, type SessionOutcome } from './model'

export class WorkoutDatabase extends Dexie {
  sessions!: Table<Workout, string>
  sets!: Table<WorkoutSet, string>
  drafts!: Table<WorkoutDraft, string>
  outbox!: Table<PendingChange, string>
  workspace!: Table<WorkoutWorkspace, string>
  appointments!: Table<Appointment, string>
  migration!: Table<{ id: string; baseline: Record<string, string> }, string>
  proposals!: Table<Proposal, string>
  exerciseStates!: Table<ExerciseState, string>
  outcomes!: Table<SessionOutcome, string>

  constructor(name = 'training-m2') {
    super(name)
    this.version(1).stores({ sessions: 'id, startedAt', sets: 'id, sessionId', drafts: 'id, sessionId', outbox: 'id, entityId, status', workspace: 'id' })
    this.version(2).stores({ workouts: 'id, startedAt', workoutSets: 'id, sessionId', workoutDrafts: 'id, sessionId', workoutOutbox: 'id, entityId, status', workoutWorkspace: 'id', appointments: 'id, date, status', migration: 'id' }).upgrade(async transaction => {
      const baseline: Record<string, string> = {}
      for (const [oldName, newName] of [['sessions', 'workouts'], ['sets', 'workoutSets'], ['drafts', 'workoutDrafts'], ['outbox', 'workoutOutbox'], ['workspace', 'workoutWorkspace']]) {
        const records = await transaction.table<{ id: string }>(oldName).toArray()
        await transaction.table(newName).bulkPut(records)
        for (const record of records) baseline[`${oldName}:${record.id}`] = JSON.stringify(record)
      }
      await transaction.table<Workout>('workouts').toCollection().modify(session => { session.pendingIds = pendingIds(session) })
      await transaction.table('migration').put({ id: 'm2', baseline })
    })
    // Versie 3: schone start voor v1. Bewuste, eenmalige overgang — de oude tabellen
    // gaan in één transactie leeg. Een sessie uit het oude model heeft geen sessieplan
    // en kan dus niet worden voortgezet; hem laten staan zou een half werkende sessie
    // opleveren die de app tijdens gebruik tegenkomt.
    this.version(3).stores({
      workouts: 'id, startedAt', workoutSets: 'id, sessionId', workoutDrafts: 'id, sessionId',
      workoutOutbox: 'id, entityId, status', workoutWorkspace: 'id', appointments: 'id, date, status',
      migration: 'id',
      proposals: 'id, exerciseId, [exerciseId+sessionDay]',
      exerciseStates: 'exerciseId',
      outcomes: 'sessionId, finishedAt',
      // Tabellen uit M1 vervallen.
      sessions: null, sets: null, drafts: null, outbox: null, workspace: null,
    }).upgrade(async transaction => {
      for (const naam of ['workouts', 'workoutSets', 'workoutDrafts', 'workoutOutbox', 'appointments', 'migration']) {
        await transaction.table(naam).clear()
      }
      await transaction.table('workoutWorkspace').clear()
    })

    this.sessions = this.table('workouts')
    this.sets = this.table('workoutSets')
    this.drafts = this.table('workoutDrafts')
    this.outbox = this.table('workoutOutbox')
    this.workspace = this.table('workoutWorkspace')
  }
}
export const workoutDb = new WorkoutDatabase()
export async function readLegacyChanges(database = workoutDb) {
  const baseline = (await database.migration.get('m2'))?.baseline ?? {}
  const changes: string[] = []
  for (const draft of await database.table<WorkoutDraft>('drafts').toArray()) {
    if (baseline[`drafts:${draft.id}`] !== JSON.stringify(draft)) changes.push(`Concept ${draft.id}: ${draft.weight || 'geen gewicht'} kg · ${draft.reps || 'geen'} herhalingen.`)
  }
  for (const set of await database.table<WorkoutSet>('sets').toArray()) {
    if (baseline[`sets:${set.id}`] !== JSON.stringify(set)) changes.push(`Set ${set.number}: ${set.weight} kg × ${set.reps} (${set.slotId}).`)
  }
  for (const session of await database.table<Workout>('sessions').toArray()) {
    if (baseline[`sessions:${session.id}`] !== JSON.stringify(session)) changes.push(`Oude training ${new Date(session.startedAt).toLocaleString('nl-NL')}: ${session.status}, ${session.cursor} sets.`)
  }
  for (const workspace of await database.table<WorkoutWorkspace>('workspace').toArray()) {
    if (baseline[`workspace:${workspace.id}`] !== JSON.stringify(workspace)) changes.push(`Oude planning: weekend ${workspace.weekend ?? 'niet gekozen'}.`)
  }
  return changes
}
const changed = () => new Error('Deze training is in een ander venster gewijzigd. Je invoer is niet overschreven. Open de actuele training opnieuw.')

export async function openWorkspace(database = workoutDb) {
  return database.transaction('rw', database.workspace, database.appointments, database.sessions, database.outbox, async () => {
    if (!(await database.workspace.get('main'))) await database.workspace.add({ id: 'main', sessionId: null, weekend: null, revision: 0 })
    const workspace = (await database.workspace.get('main'))!
    if (!workspace.appointmentId) {
      const active = workspace.sessionId ? await database.sessions.get(workspace.sessionId) : undefined
      const appointment = makeAppointment(workspace.weekend)
      if (active && isRunning(active)) {
        appointment.date = appointment.originalDate = localDate(new Date(active.startedAt))
        appointment.status = 'started'; appointment.sessionId = active.id
        active.appointmentId = appointment.id; active.revision++
        await queueSession(active, database)
      }
      await queueAppointment(appointment, database)
      await database.workspace.put({ ...workspace, appointmentId: appointment.id })
    }
  })
}

async function queueSession(session: Workout, database: WorkoutDatabase) {
  await database.sessions.put(session)
  await database.outbox.put({ id: `${session.id}:v${session.revision}`, entityId: session.id, entity: 'session', payload: session, status: 'local', createdAt: new Date().toISOString() })
}

export async function beginWorkout(database = workoutDb) {
  return database.transaction('rw', database.workspace, database.sessions, database.appointments, database.outbox, async () => {
    const workspace = await database.workspace.get('main')
    if (!workspace) throw new Error('Open de app opnieuw om je planning te laden.')
    if (workspace.sessionId) {
      const existing = await database.sessions.get(workspace.sessionId)
      if (!existing) throw new Error('Je training ontbreekt. Er is niets overschreven.')
      if (isRunning(existing)) return existing
    }
    let appointment = workspace.appointmentId ? await database.appointments.get(workspace.appointmentId) : undefined
    if (!appointment) throw new Error('Je afspraak ontbreekt. Open de app opnieuw.')
    if (appointment.status !== 'planned') {
      appointment = makeAppointment(workspace.weekend, appointment.date)
      workspace.appointmentId = appointment.id
    }
    const session: Workout = { id: crypto.randomUUID(), startedAt: new Date().toISOString(), status: 'active', phase: 'warmup', warmed: false, cursor: 0, revision: 1, snapshot: structuredClone(starterProgram), rest: null, appointmentId: appointment.id }
    session.pendingIds = pendingIds(session)
    if (appointment.omittedSlots.length) {
      const before = adjustmentState(session)
      const omitted = pendingTargets(session).filter(item => appointment.omittedSlots.includes(item.slot.id))
      session.skipped = Object.fromEntries(omitted.map(item => [item.id, { reason: 'time', at: session.startedAt }]))
      session.pendingIds = session.pendingIds.filter(id => !session.skipped?.[id])
      session.adjustments = [{ id: crypto.randomUUID(), kind: 'time', reason: 'time', scope: 'today', label: 'Minder tijd: geselecteerde oefeningen vervallen vandaag.', createdAt: session.startedAt, before, after: adjustmentState(session) }]
    }
    appointment.status = 'started'; appointment.sessionId = session.id; appointment.revision++
    await queueAppointment(appointment, database)
    await queueSession(session, database)
    await database.workspace.put({ ...workspace, sessionId: session.id })
    return session
  })
}

function currentTarget(session: Workout) {
  const current = pendingTargets(session)[0]
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
    session.pendingIds = pendingIds(session).filter(pending => pending !== id)
    session.revision++
    session.rest = session.pendingIds.length ? { afterSetId: id, endAt: Date.now() + slot.restSeconds * 1000, remainingMs: slot.restSeconds * 1000 } : null
    await queueSession(session, database)
    return record
  })
}

export type SessionAction = 'begin-exercise' | 'pause' | 'resume' | 'next-set' | 'extra-rest' | 'complete' | 'abort' | 'warmup-on' | 'warmup-off'
export async function changeWorkout(id: string, revision: number, action: SessionAction, draftRevision?: number | DraftVersions, database = workoutDb) {
  return database.transaction('rw', database.sessions, database.drafts, database.outbox, database.appointments, database.workspace, async () => {
    const session = await database.sessions.get(id)
    if (!session || session.revision !== revision || !isRunning(session)) throw changed()
    if (action === 'complete' || action === 'abort') {
      const drafts = await database.drafts.where('sessionId').equals(id).toArray()
      if (typeof draftRevision === 'object' ? !sameDrafts(drafts, draftRevision) : drafts.length > 1 || drafts.some(draft => draft.revision !== draftRevision)) throw new Error('Er staat nieuwe conceptinvoer. Controleer die voordat je de sessie beëindigt.')
      session.status = action === 'abort' ? 'aborted' : 'completed'
      session.endedAt = new Date().toISOString()
      session.rest = null
      await database.drafts.where('sessionId').equals(id).delete()
      if (session.appointmentId) {
        const appointment = await database.appointments.get(session.appointmentId)
        if (!appointment) throw new Error('Je afspraak ontbreekt. Er is niets gewijzigd.')
        appointment.status = session.status; appointment.revision++
        await queueAppointment(appointment, database)
        const workspace = await database.workspace.get('main')
        if (workspace?.appointmentId === appointment.id) {
          const next = makeAppointment(workspace.weekend, appointment.date)
          await queueAppointment(next, database)
          await database.workspace.put({ ...workspace, appointmentId: next.id })
        }
      }
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
  return database.transaction('rw', database.workspace, database.appointments, database.outbox, async () => {
    const current = await database.workspace.get('main')
    if (!current || current.revision !== revision) throw new Error('Je planning is in een ander venster aangepast. Open Plan opnieuw voordat je opslaat.')
    const workspace = { ...current, weekend, revision: revision + 1 }
    const appointment = current.appointmentId ? await database.appointments.get(current.appointmentId) : undefined
    if (appointment?.status === 'planned' && !appointment.history.some(event => event.action === 'move')) {
      const next = makeAppointment(weekend)
      if (appointment.date !== next.date) {
        appointment.date = appointment.originalDate = next.date
        appointment.revision++
        await queueAppointment(appointment, database)
      }
    }
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

function sameDrafts(drafts: WorkoutDraft[], expected: DraftVersions) {
  const actual = draftVersions(drafts)
  return Object.keys(actual).length === Object.keys(expected).length && Object.entries(actual).every(([id, revision]) => expected[id] === revision)
}
function adjustmentState(session: Workout): AdjustmentState {
  return structuredClone({ pendingIds: pendingIds(session), skipped: session.skipped ?? {}, todayWeights: session.todayWeights ?? {} })
}
export type AdjustmentCommand =
  | { kind: 'later' }
  | { kind: 'skip'; reason: 'pain' | 'material' | 'skip' }
  | { kind: 'time'; slots: string[] }
  | { kind: 'weight'; weight: string; reason: 'day' | 'technique' | 'structural' }
  | { kind: 'undo' }
export async function adjustWorkout(id: string, revision: number, operationId: string, expectedDrafts: DraftVersions, command: AdjustmentCommand, database = workoutDb) {
  return database.transaction('rw', database.sessions, database.sets, database.drafts, database.outbox, async () => {
    const session = await database.sessions.get(id)
    if (!session) throw changed()
    if (session.adjustments?.some(item => item.id === operationId)) return session
    if (session.revision !== revision || !isRunning(session)) throw changed()
    if (session.rest || (session.status === 'paused' && command.kind !== 'undo')) throw new Error('Hervat je training en rond de rust af voordat je aanpast.')
    if (!sameDrafts(await database.drafts.where('sessionId').equals(id).toArray(), expectedDrafts)) throw new Error('Er staat nieuwe conceptinvoer in een ander venster. Sluit dit voorstel en controleer je invoer.')
    const before = adjustmentState(session)
    const open = pendingTargets(session)
    const current = open[0]
    const createdAt = new Date().toISOString()
    let label = '', reason: string = command.kind, undoOf: string | undefined
    if (command.kind === 'undo') {
      const previous = lastUndoable(session)
      if (!previous) throw new Error('Er is geen aanpassing om terug te draaien.')
      const recorded = new Set((await database.sets.where('sessionId').equals(id).toArray()).map(set => set.id))
      session.pendingIds = previous.before.pendingIds.filter(key => !recorded.has(key))
      session.skipped = Object.fromEntries(Object.entries(previous.before.skipped).filter(([key]) => !recorded.has(key)))
      session.todayWeights = previous.before.todayWeights
      undoOf = previous.id; label = 'Laatste aanpassing teruggedraaid. Gedane sets blijven staan.'
    } else {
      if (!current) throw new Error('Er staan geen sets meer open.')
      if (command.kind === 'later') {
        if (!open.some(item => item.slot.id !== current.slot.id)) throw new Error('Er staat geen andere oefening meer open.')
        session.pendingIds = [...open.filter(item => item.slot.id !== current.slot.id), ...open.filter(item => item.slot.id === current.slot.id)].map(item => item.id)
        label = `${current.slot.name} komt later terug.`
      } else if (command.kind === 'weight') {
        const weight = parseInput(command.weight, '1').weight
        if (weight <= 0) throw new Error('Vul een gewicht boven 0 in.')
        session.todayWeights = { ...session.todayWeights, ...Object.fromEntries(open.filter(item => item.slot.id === current.slot.id).map(item => [item.id, weight])) }
        reason = command.reason; label = `${current.slot.name}: doel vandaag ${command.weight} kg.`
      } else {
        const slots = command.kind === 'time' ? command.slots : [current.slot.id]
        if (!slots.length || new Set(slots).size !== slots.length || slots.some(slot => !open.some(item => item.slot.id === slot))) throw new Error('Kies alleen oefeningen die nog open staan.')
        reason = command.kind === 'skip' ? command.reason : 'time'
        const omitted = open.filter(item => slots.includes(item.slot.id))
        session.skipped = { ...session.skipped, ...Object.fromEntries(omitted.map(item => [item.id, { reason, at: createdAt }])) }
        session.pendingIds = open.filter(item => !slots.includes(item.slot.id)).map(item => item.id)
        label = `${[...new Set(omitted.map(item => item.slot.name))].join(', ')}: open sets overgeslagen${reason === 'pain' ? ' wegens pijn' : ''}.`
      }
    }
    session.adjustments = [...(session.adjustments ?? []), { id: operationId, kind: command.kind, reason, scope: 'today', label, createdAt, before, after: adjustmentState(session), undoOf }]
    session.revision++
    await queueSession(session, database)
    return session
  })
}

function makeAppointment(weekend: WorkoutWorkspace['weekend'], after?: string): Appointment {
  const date = new Date(`${localDate()}T12:00:00`)
  if (after && after >= localDate()) { date.setTime(new Date(`${after}T12:00:00`).getTime()); date.setDate(date.getDate() + 1) }
  const days = [3, ...(weekend ? [weekend === 'Zaterdag' ? 6 : 0] : [])]
  while (!days.includes(date.getDay())) date.setDate(date.getDate() + 1)
  const day = localDate(date)
  return { id: crypto.randomUUID(), date: day, originalDate: day, status: 'planned', revision: 1, omittedSlots: [], history: [] }
}
async function queueAppointment(appointment: Appointment, database: WorkoutDatabase) {
  await database.appointments.put(appointment)
  await database.outbox.put({ id: `${appointment.id}:v${appointment.revision}`, entityId: appointment.id, entity: 'appointment', payload: appointment, status: 'local', createdAt: new Date().toISOString() })
}
export type AppointmentCommand = { kind: 'move'; date: string } | { kind: 'skip' } | { kind: 'time'; slots: string[] }
export async function changeAppointment(id: string, revision: number, operationId: string, command: AppointmentCommand, database = workoutDb) {
  return database.transaction('rw', database.appointments, database.workspace, database.sessions, database.outbox, async () => {
    const appointment = await database.appointments.get(id)
    if (!appointment) throw new Error('Je afspraak is niet gevonden.')
    if (appointment.history.some(event => event.id === operationId)) return appointment
    const workspace = await database.workspace.get('main')
    const session = workspace?.sessionId ? await database.sessions.get(workspace.sessionId) : undefined
    if (appointment.revision !== revision || appointment.status !== 'planned' || workspace?.appointmentId !== id || isRunning(session)) throw new Error('Deze afspraak is intussen gewijzigd of gestart. Open Vandaag opnieuw.')
    let from = appointment.date, to = appointment.date
    if (command.kind === 'move') {
      const date = new Date(`${command.date}T12:00:00`)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(command.date) || !Number.isFinite(date.getTime()) || localDate(date) !== command.date || command.date < localDate() || command.date === appointment.date) throw new Error('Kies een andere geldige datum vanaf vandaag.')
      appointment.date = to = command.date
    } else if (command.kind === 'skip') { appointment.status = 'skipped'; to = 'skipped' }
    else {
      if (new Set(command.slots).size !== command.slots.length || command.slots.some(slot => !starterProgram.slots.some(item => item.id === slot))) throw new Error('Kies bestaande oefeningen.')
      from = appointment.omittedSlots.join(','); to = command.slots.join(','); appointment.omittedSlots = command.slots
    }
    appointment.history.push({ id: operationId, action: command.kind, from, to, createdAt: new Date().toISOString() })
    appointment.revision++
    await queueAppointment(appointment, database)
    return appointment
  })
}
export async function nextAppointment(id: string, database = workoutDb) {
  return database.transaction('rw', database.workspace, database.appointments, database.outbox, async () => {
    const workspace = await database.workspace.get('main')
    if (!workspace?.appointmentId) throw new Error('Open Vandaag opnieuw.')
    if (workspace.appointmentId !== id) return
    const previous = await database.appointments.get(id)
    if (!previous || previous.status === 'planned' || previous.status === 'started') throw new Error('Deze afspraak loopt nog.')
    const appointment = makeAppointment(workspace.weekend, previous.date)
    await queueAppointment(appointment, database)
    await database.workspace.put({ ...workspace, appointmentId: appointment.id })
  })
}
