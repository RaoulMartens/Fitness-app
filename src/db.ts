import Dexie, { type Table } from 'dexie'
import { type Draft, type OutboxItem, type Session, type SetRecord, type Workspace, parseInput, setId, testPrescription } from './model'

export class TrainingDatabase extends Dexie {
  sessions!: Table<Session, string>
  sets!: Table<SetRecord, string>
  drafts!: Table<Draft, string>
  outbox!: Table<OutboxItem, string>
  workspace!: Table<Workspace, string>

  constructor(name = 'training-m1') {
    super(name)
    this.version(1).stores({
      sessions: 'id, createdAt',
      sets: 'id, sessionId, [sessionId+number]',
      drafts: 'id, sessionId',
      outbox: 'id, entityId, status',
      workspace: 'id',
    })
  }
}

export const db = new TrainingDatabase()

export async function startSession(database = db, newSession = false): Promise<string> {
  return database.transaction('rw', database.workspace, database.sessions, async () => {
    const workspace = await database.workspace.get('main')
    if (workspace) {
      const current = await database.sessions.get(workspace.activeSessionId)
      if (!current) throw new Error('Je testsessie ontbreekt. Er is niets overschreven. Probeer opnieuw te openen.')
      if (!newSession || current.status === 'active') return current.id
    }
    const session: Session = {
      id: crypto.randomUUID(), kind: 'test', createdAt: new Date().toISOString(),
      status: 'active', prescription: structuredClone(testPrescription),
    }
    await database.sessions.add(session)
    await database.workspace.put({ id: 'main', activeSessionId: session.id })
    return session.id
  })
}

export async function saveDraft(draft: Draft, database = db) {
  return database.transaction('rw', database.sessions, database.sets, database.drafts, async () => {
    const session = await database.sessions.get(draft.sessionId)
    if (!session || session.status !== 'active') throw new Error('Deze testsessie is niet meer actief. Open de sessie opnieuw.')
    const current = await database.sets.get(draft.id)
    if ((current?.revision ?? 0) !== draft.baseRevision) {
      throw new Error('Deze set is in een ander venster gewijzigd. Je invoer staat nog in beeld; open de actuele set voordat je verdergaat.')
    }
    await database.drafts.put(draft)
  })
}

export async function confirmSet(sessionId: string, number: number, draft: Draft, database = db) {
  const values = parseInput(draft.weight, draft.reps)
  return database.transaction('rw', database.sessions, database.sets, database.drafts, database.outbox, async () => {
    const session = await database.sessions.get(sessionId)
    if (!session || session.status !== 'active') throw new Error('Deze testsessie is niet meer actief.')
    const target = session.prescription.sets.find(set => set.number === number)
    const id = setId(sessionId, number)
    if (!target || draft.id !== id || draft.sessionId !== sessionId) throw new Error('Deze set hoort niet bij de actieve oefening.')
    const current = await database.sets.get(id)
    // Repeated confirmation of the same operation is a no-op, including across tabs.
    if (current && current.revision === draft.baseRevision + 1 && current.weight === values.weight && current.reps === values.reps) return current
    if ((current?.revision ?? 0) !== draft.baseRevision) throw new Error('Deze set is al gewijzigd in een ander venster. Je invoer is niet over de andere versie heen opgeslagen.')
    const record: SetRecord = {
      id, sessionId, exerciseId: session.prescription.exerciseId, number, ...values,
      target, revision: draft.baseRevision + 1, recordedAt: new Date().toISOString(),
    }
    await database.sets.put(record)
    await database.outbox.add({ id: `${id}:v${record.revision}`, entityId: id, baseRevision: draft.baseRevision, status: 'local', payload: record })
    await database.drafts.delete(id)
    return record
  })
}

export async function finishSession(sessionId: string, database = db) {
  await database.transaction('rw', database.sessions, database.sets, database.drafts, async () => {
    const session = await database.sessions.get(sessionId)
    if (!session) throw new Error('De testsessie is niet gevonden.')
    const sets = await database.sets.where('sessionId').equals(sessionId).toArray()
    const drafts = await database.drafts.where('sessionId').equals(sessionId).count()
    if (session.prescription.sets.some(target => !sets.some(set => set.number === target.number))) {
      throw new Error('Leg eerst alle testsets vast.')
    }
    if (drafts > 0) throw new Error('Er staat nog een conceptwijziging open. Bevestig deze eerst.')
    await database.sessions.update(sessionId, { status: 'completed', completedAt: new Date().toISOString() })
  })
}
