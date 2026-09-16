import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { confirmSet, finishSession, saveDraft, startSession, TrainingDatabase } from './db'
import { parseInput, setId, type Draft } from './model'

let database: TrainingDatabase
let sessionId: string
const draft = (number = 1, values: Partial<Draft> = {}): Draft => ({
  id: setId(sessionId, number), sessionId, weight: '12', reps: '10', baseRevision: 0,
  updatedAt: new Date().toISOString(), ...values,
})
beforeEach(async () => { database = new TrainingDatabase(`test-${crypto.randomUUID()}`); sessionId = await startSession(database) })
afterEach(async () => { await database.delete() })

describe('local-first registratie', () => {
  it('herstelt dezelfde sessie en een gedeeltelijk ingevuld concept', async () => {
    await saveDraft(draft(1, { weight: '12,' }), database)
    database.close()
    await database.open()
    expect(await startSession(database)).toBe(sessionId)
    expect((await database.drafts.get(setId(sessionId, 1)))?.weight).toBe('12,')
    expect(await database.sets.count()).toBe(0)
  })
  it('legt tweemaal bevestigen atomair vast als een set en een uitgaande opdracht', async () => {
    await saveDraft(draft(), database)
    await Promise.all([confirmSet(sessionId, 1, draft(), database), confirmSet(sessionId, 1, draft(), database)])
    expect(await database.sets.count()).toBe(1)
    expect(await database.outbox.count()).toBe(1)
    expect(await database.drafts.count()).toBe(0)
  })
  it('laat alle wijzigingen terugrollen als de uitgaande opdracht niet kan worden bewaard', async () => {
    await saveDraft(draft(), database)
    database.outbox.hook('creating', () => { throw new Error('Opslagfout') })
    await expect(confirmSet(sessionId, 1, draft(), database)).rejects.toThrow('Opslagfout')
    expect(await database.sets.count()).toBe(0)
    expect(await database.drafts.count()).toBe(1)
  })
  it('bewaart revisies bij correcties en weigert een verouderde overschrijving', async () => {
    await confirmSet(sessionId, 1, draft(), database)
    const update = draft(1, { weight: '12,5', reps: '11', baseRevision: 1 })
    await saveDraft(update, database)
    await confirmSet(sessionId, 1, update, database)
    await expect(confirmSet(sessionId, 1, draft(1, { reps: '9' }), database)).rejects.toThrow('ander venster')
    expect((await database.sets.get(setId(sessionId, 1)))?.weight).toBe(12.5)
    expect(await database.outbox.count()).toBe(2)
  })
  it('weigert laat opgeslagen concepten na bevestiging vanuit een ander venster', async () => {
    await confirmSet(sessionId, 1, draft(), database)
    await expect(saveDraft(draft(), database)).rejects.toThrow('ander venster')
  })
  it('rondt alleen volledige sessies zonder concepten af en bewaart oude sessies', async () => {
    await expect(finishSession(sessionId, database)).rejects.toThrow('alle testsets')
    for (const number of [1, 2, 3]) await confirmSet(sessionId, number, draft(number), database)
    await saveDraft(draft(1, { baseRevision: 1, reps: '11' }), database)
    await expect(finishSession(sessionId, database)).rejects.toThrow('conceptwijziging')
    await confirmSet(sessionId, 1, draft(1, { baseRevision: 1, reps: '11' }), database)
    await finishSession(sessionId, database)
    expect(await startSession(database, true)).not.toBe(sessionId)
    expect(await database.sessions.count()).toBe(2)
    expect(await database.sets.count()).toBe(3)
  })
  it('start bij gelijktijdig openen maar een actieve sessie', async () => {
    expect(await Promise.all([startSession(database, true), startSession(database, true)])).toEqual([sessionId, sessionId])
  })
  it('accepteert vrije kg-invoer, maar geen gedeeltelijke of ongeldige bevestiging', () => {
    expect(parseInput('12', '10')).toEqual({ weight: 12, reps: 10 })
    expect(parseInput('12,5', '10')).toEqual({ weight: 12.5, reps: 10 })
    for (const weight of ['', '12,', '-1', 'Infinity']) expect(() => parseInput(weight, '10')).toThrow()
    for (const reps of ['', '0', '2.5', '-1']) expect(() => parseInput('12', reps)).toThrow()
  })
})
