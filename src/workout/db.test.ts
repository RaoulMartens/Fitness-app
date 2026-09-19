import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { beginWorkout, changeWorkout, logSet, openWorkspace, updateWeekend, WorkoutDatabase, writeDraft } from './db'
import { recordId, restRemaining, starterProgram, targets, type Workout } from './model'

let database: WorkoutDatabase
let session: Workout
beforeEach(async () => { database = new WorkoutDatabase(`m2-test-${crypto.randomUUID()}`); await openWorkspace(database); session = await beginWorkout(database); session = await changeWorkout(session.id, session.revision, 'begin-exercise', undefined, database) })
afterEach(async () => { vi.restoreAllMocks(); await database.delete() })
async function draft(weight = '12,5', reps = '10', revision = 0) {
  const { slot, target } = targets(session.snapshot)[session.cursor]
  return writeDraft({ id: recordId(session.id, slot.id, target.number), sessionId: session.id, weight, reps, revision, updatedAt: new Date().toISOString() }, revision, database)
}

describe('M2 blijvende sessies', () => {
  it('gelijktijdig starten maakt geen tweede sessie en voorschriften blijven een snapshot', async () => {
    const results = await Promise.all([beginWorkout(database), beginWorkout(database)])
    expect(results.map(item => item.id)).toEqual([session.id, session.id])
    const originalName = starterProgram.slots[0].name
    try {
      starterProgram.slots[0].name = 'Nieuw schema'
      expect((await database.sessions.get(session.id))?.snapshot.slots[0].name).toBe(originalName)
    } finally { starterProgram.slots[0].name = originalName }
  })
  it('bewaart set, sessiecursor, rust en outbox atomair en dedupliceert bevestiging', async () => {
    const before = await database.outbox.count()
    const input = await draft()
    const records = await Promise.all([logSet(input, session.revision, database), logSet(input, session.revision, database)])
    expect(records[0]).toEqual(records[1])
    expect(await database.sets.count()).toBe(1)
    expect(await database.drafts.count()).toBe(0)
    const saved = await database.sessions.get(session.id)
    expect(saved?.cursor).toBe(1)
    expect(saved?.rest?.afterSetId).toBe(input.id)
    expect(saved && restRemaining(saved)).toBeGreaterThan(110_000)
    expect(await database.outbox.count()).toBe(before + 2)
    await expect(logSet({ ...input, weight: '14' }, session.revision, database)).rejects.toThrow('ander venster')
  })
  it('rolt de hele bevestiging terug bij falen van de uitgaande wachtrij', async () => {
    const input = await draft()
    const fail = () => { throw new Error('Schijf vol') }
    database.outbox.hook('creating', fail)
    await expect(logSet(input, session.revision, database)).rejects.toThrow('Schijf vol')
    expect(await database.sets.count()).toBe(0)
    expect((await database.sessions.get(session.id))?.cursor).toBe(0)
    expect(await database.drafts.get(input.id)).toEqual(input)
    database.outbox.hook('creating').unsubscribe(fail)
    await logSet(input, session.revision, database)
    expect(await database.sets.count()).toBe(1)
  })
  it('weigert oude conceptinvoer en bewaart de nieuwere invoer', async () => {
    const first = await draft()
    await expect(draft('14', '11')).rejects.toThrow('andere conceptinvoer')
    expect((await database.drafts.get(first.id))?.weight).toBe('12,5')
    await logSet(first, session.revision, database)
    await expect(writeDraft(first, first.revision, database)).rejects.toThrow('ander venster')
  })
  it('gebruikt een eindtijd voor rust en bevriest alleen expliciet gepauzeerde rust', async () => {
    let now = 2_000_000
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    await logSet(await draft(), session.revision, database)
    session = (await database.sessions.get(session.id))!
    now += 20_000
    expect(restRemaining(session)).toBe(100_000)
    session = await changeWorkout(session.id, session.revision, 'pause', undefined, database)
    now += 600_000
    expect(restRemaining(session)).toBe(100_000)
    session = await changeWorkout(session.id, session.revision, 'resume', undefined, database)
    expect(restRemaining(session)).toBe(100_000)
    now += 101_000
    expect(restRemaining(session)).toBe(0)
    session = await changeWorkout(session.id, session.revision, 'extra-rest', undefined, database)
    expect(restRemaining(session)).toBe(30_000)
  })
  it('doorloopt alle sets zonder voortijdig af te ronden', async () => {
    for (let index = 0; index < targets(starterProgram).length; index++) {
      await logSet(await draft(), session.revision, database)
      session = (await database.sessions.get(session.id))!
      if (session.rest) session = await changeWorkout(session.id, session.revision, 'next-set', undefined, database)
    }
    expect(session.status).toBe('active')
    expect(session.rest).toBeNull()
    session = await changeWorkout(session.id, session.revision, 'complete', undefined, database)
    expect(session.status).toBe('completed')
    expect(await database.sets.count()).toBe(targets(starterProgram).length)
    expect((await beginWorkout(database)).id).not.toBe(session.id)
    expect(await database.sessions.count()).toBe(2)
  })
  it.each(['complete', 'abort'] as const)('bewaart geregistreerde sets bij %s en verwerpt ongeziene conceptwijzigingen', async action => {
    await logSet(await draft(), session.revision, database)
    session = (await database.sessions.get(session.id))!
    session = await changeWorkout(session.id, session.revision, 'next-set', undefined, database)
    const original = await draft('15,', '')
    const newer = await draft('16', '9', original.revision)
    await expect(changeWorkout(session.id, session.revision, action, original.revision, database)).rejects.toThrow('nieuwe conceptinvoer')
    const ended = await changeWorkout(session.id, session.revision, action, newer.revision, database)
    expect(ended.status).toBe(action === 'abort' ? 'aborted' : 'completed')
    expect(ended.cursor).toBe(1)
    expect(await database.sets.count()).toBe(1)
    expect(await database.drafts.count()).toBe(0)
    expect((await database.workspace.get('main'))?.weekend).toBeNull()
  })
  it('planning past geen lopende training aan en weigert verouderde wijzigingen', async () => {
    await updateWeekend('Zondag', 0, database)
    expect(await database.sessions.get(session.id)).toEqual(session)
    await expect(updateWeekend('Zaterdag', 0, database)).rejects.toThrow('ander venster')
    expect((await database.workspace.get('main'))?.weekend).toBe('Zondag')
  })
})
