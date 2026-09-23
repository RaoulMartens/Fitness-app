import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { leesBackup, maakBackup, sessiesIn, zetBackupTerug } from './backup'
import { beginWorkout, changeWorkout, logSet, openWorkspace, wisAlles, WorkoutDatabase, writeDraft } from './db'
import { finishWorkout } from './finish'
import { pendingTargets, type Workout } from './model'

let database: WorkoutDatabase
let session: Workout

beforeEach(async () => {
  database = new WorkoutDatabase(`backup-test-${crypto.randomUUID()}`)
  await openWorkspace(database)
  session = await beginWorkout(database)
  session = await changeWorkout(session.id, session.revision, 'begin-exercise', undefined, database)
})
afterEach(async () => { await database.delete() })

async function log(weight: string, reps: string) {
  const current = pendingTargets(session)[0]
  const draft = await writeDraft({ id: current.id, sessionId: session.id, weight, reps, revision: 0, updatedAt: new Date().toISOString() }, 0, database)
  await logSet(draft, session.revision, database)
  session = (await database.sessions.get(session.id))!
  if (session.rest) session = await changeWorkout(session.id, session.revision, 'next-set', undefined, database)
}

describe('back-up', () => {
  it('zet na wissen alles terug zoals het was, en de volgende sessie begint op het voorstel', async () => {
    await log('20', '12'); await log('80', '12'); await log('80', '12')
    await finishWorkout({ sessionId: session.id }, database)
    const tekst = JSON.stringify(await maakBackup(database))

    await wisAlles(database)
    expect(await database.outcomes.count()).toBe(0)

    const backup = leesBackup(tekst, database)
    expect(sessiesIn(backup)).toBe(1)
    await zetBackupTerug(backup, database)
    expect(await database.sets.count()).toBe(3)
    expect((await database.exerciseStates.get('leg-press'))?.currentWeight).toBe(85)
    expect((await database.workspace.get('main'))?.laatsteBackup).toBe(backup.gemaaktOp)

    const volgende = await beginWorkout(database)
    expect(volgende.snapshot.slots[0].sets.filter(target => target.kind === 'work').map(target => target.weight)).toEqual([85, 85])
  })

  it('weigert rommel, een ander bestand en een nieuwere versie zonder iets aan te raken', async () => {
    await log('20', '12')
    const voor = await database.sets.count()
    expect(() => leesBackup('geen json', database)).toThrow('niet te lezen')
    expect(() => leesBackup(JSON.stringify({ app: 'iets anders' }), database)).toThrow('geen back-up van deze app')
    const echt = await maakBackup(database)
    expect(() => leesBackup(JSON.stringify({ ...echt, versie: database.verno + 1 }), database)).toThrow('nieuwere versie')
    expect(() => leesBackup(JSON.stringify({ ...echt, tabellen: { onbekend: [] } }), database)).toThrow('niet kent')
    expect(await database.sets.count()).toBe(voor)
  })

  it('laat alles staan als terugzetten halverwege faalt', async () => {
    await log('20', '12')
    const backup = await maakBackup(database)
    const kapot = { ...backup, tabellen: { ...backup.tabellen, workoutSets: [{ zonder: 'sleutel' }] } }
    await expect(zetBackupTerug(kapot, database)).rejects.toThrow()
    expect(await database.sets.count()).toBe(1)
    expect(await database.sessions.get(session.id)).toBeDefined()
  })
})
