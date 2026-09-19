import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { beginWorkout, changeWorkout, logSet, openWorkspace, WorkoutDatabase, writeDraft } from './db'
import { finishWorkout, pauzeSessieNodig } from './finish'
import { pendingTargets, recordId, targets, type Workout } from './model'

let database: WorkoutDatabase
let session: Workout

beforeEach(async () => {
  database = new WorkoutDatabase(`finish-test-${crypto.randomUUID()}`)
  await openWorkspace(database)
  session = await beginWorkout(database)
  session = await changeWorkout(session.id, session.revision, 'begin-exercise', undefined, database)
})
afterEach(async () => { await database.delete() })

/** Legt de eerstvolgende openstaande set vast met de gegeven waarden. */
async function log(weight: string, reps: string) {
  const current = pendingTargets(session)[0]
  const draft = await writeDraft(
    { id: current.id, sessionId: session.id, weight, reps, revision: 0, updatedAt: new Date().toISOString() },
    0, database)
  await logSet(draft, session.revision, database)
  session = (await database.sessions.get(session.id))!
  if (session.rest) session = await changeWorkout(session.id, session.revision, 'next-set', undefined, database)
}

/** Werkt één hele oefening af: warming-up plus twee werksets. */
async function oefening(weight: string, reps: [string, string]) {
  await log('20', '12')
  await log(weight, reps[0])
  await log(weight, reps[1])
}

describe('afronden', () => {
  it('verhoogt het gewicht als beide werksets de bovenkant halen', async () => {
    await oefening('80', ['12', '12'])
    await finishWorkout({ sessionId: session.id }, database)

    const voorstel = await database.proposals.where('exerciseId').equals('leg-press').first()
    expect(voorstel).toMatchObject({ from: null, to: 85, reason: 'boven-bereik', superseded: false })
    expect((await database.exerciseStates.get('leg-press'))?.currentWeight).toBe(85)
  })

  it('houdt vast en telt de stilstand op binnen het bereik', async () => {
    await oefening('80', ['10', '9'])
    await finishWorkout({ sessionId: session.id }, database)
    expect((await database.exerciseStates.get('leg-press'))?.stalls).toBe(1)
    expect((await database.proposals.where('exerciseId').equals('leg-press').first())?.reason).toBe('vasthouden')
  })

  it('negeert de warming-up, ook als die onder het bereik ligt', async () => {
    await log('20', '3')          // warming-up met weinig herhalingen
    await log('80', '12')
    await log('80', '12')
    await finishWorkout({ sessionId: session.id }, database)
    expect((await database.proposals.where('exerciseId').equals('leg-press').first())?.reason).toBe('boven-bereik')
  })

  it('laat een onafgeronde oefening zonder voorstel', async () => {
    await log('20', '12')
    await log('80', '12')         // maar één van de twee werksets
    await finishWorkout({ sessionId: session.id }, database)
    expect(await database.proposals.count()).toBe(0)
    expect(await database.exerciseStates.count()).toBe(0)
  })

  it('markeert gedeeltelijk afronden als zodanig', async () => {
    await oefening('80', ['12', '12'])
    const uitkomst = await finishWorkout({ sessionId: session.id }, database)
    expect(uitkomst.finishedPartially).toBe(true)
  })

  it('verdubbelt niets als je twee keer afrondt', async () => {
    await oefening('80', ['12', '12'])
    const eerste = await finishWorkout({ sessionId: session.id }, database)
    const tweede = await finishWorkout({ sessionId: session.id, now: new Date(Date.now() + 60_000) }, database)

    expect(tweede).toEqual(eerste)
    expect(await database.proposals.count()).toBe(1)
    expect((await database.exerciseStates.get('leg-press'))?.increases).toBe(0)
    expect((await database.exerciseStates.get('leg-press'))?.currentWeight).toBe(85)
  })

  it('telt een verhoging pas als het zwaardere gewicht echt is gebruikt', async () => {
    await oefening('80', ['12', '12'])
    await finishWorkout({ sessionId: session.id }, database)
    expect((await database.exerciseStates.get('leg-press'))?.increases).toBe(0)

    // Tweede sessie op het voorgestelde gewicht: nu is het echt getild.
    session = await beginWorkout(database)
    session = await changeWorkout(session.id, session.revision, 'begin-exercise', undefined, database)
    await oefening('85', ['12', '12'])
    await finishWorkout({ sessionId: session.id }, database)
    expect((await database.exerciseStates.get('leg-press'))?.increases).toBe(1)
  })

  it('zet een ouder voorstel opzij zodra er een nieuwer is', async () => {
    await oefening('80', ['12', '12'])
    await finishWorkout({ sessionId: session.id }, database)

    session = await beginWorkout(database)
    session = await changeWorkout(session.id, session.revision, 'begin-exercise', undefined, database)
    await oefening('85', ['12', '12'])
    await finishWorkout({ sessionId: session.id }, database)

    const alle = await database.proposals.where('exerciseId').equals('leg-press').toArray()
    expect(alle).toHaveLength(2)
    expect(alle.filter(item => !item.superseded)).toHaveLength(1)
    expect(alle.find(item => !item.superseded)?.to).toBe(90)
  })

  it('volgt tijdens een pauzesessie de pauzeregel en niet de gewone progressie', async () => {
    await oefening('80', ['12', '12'])
    await finishWorkout({ sessionId: session.id }, database)   // staat nu op 85
    await database.exerciseStates.update('leg-press', { preBreakWeight: 85, currentWeight: 80 })

    session = await beginWorkout(database)
    session = await changeWorkout(session.id, session.revision, 'begin-exercise', undefined, database)
    await oefening('80', ['12', '12'])   // bovenkant gehaald, maar het is een pauzesessie
    await finishWorkout({ sessionId: session.id, wasBreakSession: true }, database)

    const state = (await database.exerciseStates.get('leg-press'))!
    expect(state.currentWeight).toBe(85)        // terug naar het oude gewicht, niet 82,5
    expect(state.preBreakWeight).toBeNull()
    expect((await database.proposals.where('exerciseId').equals('leg-press').filter(item => !item.superseded).first())?.reason).toBe('pauze')
  })

  it('meldt een pauze pas na tien dagen zonder afgeronde sessie', async () => {
    await oefening('80', ['12', '12'])
    await finishWorkout({ sessionId: session.id, now: new Date('2026-09-01T18:00:00') }, database)
    const outcome = (await database.outcomes.toArray())[0]
    await database.outcomes.put({ ...outcome, sessionDay: '2026-09-01' })

    expect(await pauzeSessieNodig('2026-09-11', database)).toBe(false)
    expect(await pauzeSessieNodig('2026-09-12', database)).toBe(true)
  })

  it('werkt elke afgeronde oefening af, niet alleen de eerste', async () => {
    for (let index = 0; index < targets(session.snapshot).length; index++) {
      const current = pendingTargets(session)[0]
      const isWarmup = current.target.kind === 'warmup'
      await log(isWarmup ? '20' : '50', isWarmup ? '12' : '12')
    }
    await finishWorkout({ sessionId: session.id }, database)
    expect(await database.proposals.count()).toBe(session.snapshot.slots.length)
    const uitkomst = await database.outcomes.get(session.id)
    expect(uitkomst?.finishedPartially).toBe(false)
  })

  it('slaat een overgeslagen oefening over zonder voorstel', async () => {
    const overgeslagen = recordId(session.id, 'leg-press', 1)
    expect(overgeslagen).toContain('leg-press')
    await oefening('80', ['12', '12'])
    await finishWorkout({ sessionId: session.id }, database)
    expect(await database.proposals.where('exerciseId').equals('leg-curl').count()).toBe(0)
  })
})
