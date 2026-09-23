import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addExtraSet, adjustWorkout, beginWorkout, changeWorkout, correctSet, discardWorkout, logSet, openWorkspace, removeSet, updateWeekend, WorkoutDatabase, writeDraft } from './db'
import { exercise } from './exercises'
import { plannedSlot } from './finish'
import { pendingTargets, recordId, restRemaining, restSlot, starterProgram, targets, type Workout } from './model'

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

describe('corrigeren en een set erbij', () => {
  it('past een vastgelegde set aan, merkt hem als gecorrigeerd en is herhaalbaar', async () => {
    const input = await draft('20', '110')
    const record = await logSet(input, session.revision, database)
    const versie = (await database.sessions.get(session.id))!.revision
    const verbeterd = await correctSet(record.id, 20, 11, versie, database)
    expect(verbeterd.reps).toBe(11)
    expect(verbeterd.correctedAt).toBeTruthy()
    expect(await database.sets.count()).toBe(1)
    // Tweede keer met dezelfde waarden: geen nieuwe revisie, geen fout.
    const opnieuw = await correctSet(record.id, 20, 11, versie, database)
    expect(opnieuw.correctedAt).toBe(verbeterd.correctedAt)
  })
  it('weigert een correctie op een oude revisie of met onmogelijke waarden', async () => {
    const record = await logSet(await draft(), session.revision, database)
    const versie = (await database.sessions.get(session.id))!.revision
    await expect(correctSet(record.id, 20, 10, versie - 1, database)).rejects.toThrow()
    await expect(correctSet(record.id, 20, 0.5, versie, database)).rejects.toThrow('heel aantal')
    expect((await database.sets.get(record.id))?.reps).toBe(10)
  })
  it('zet een extra set achter de sets van dezelfde oefening en telt niet als werkset', async () => {
    const eerste = targets(session.snapshot)[0].slot
    const voor = (await database.sessions.get(session.id))!
    const na = await addExtraSet(session.id, voor.revision, eerste.id, database)
    const extra = na.snapshot.slots.find(item => item.id === eerste.id)!.sets.at(-1)!
    expect(extra.kind).toBe('extra')
    const open = na.pendingIds!
    const eigen = open.filter(id => id.startsWith(`${session.id}:${eerste.id}:`))
    expect(eigen.at(-1)).toBe(recordId(session.id, eerste.id, extra.number))
    // De rest van de sessie schuift niet: alleen deze oefening krijgt er een rij bij.
    expect(open.length).toBe(voor.pendingIds!.length + 1)
    expect(plannedSlot(na, eerste.id)?.plannedSets).toBe(plannedSlot(voor, eerste.id)?.plannedSets)
  })
})

describe('een andere oefening voor vandaag', () => {
  it('neemt naam, stap en laagste gewicht van de vervanger over en laat het schema staan', async () => {
    const voor = (await database.sessions.get(session.id))!
    const na = await adjustWorkout(session.id, voor.revision, crypto.randomUUID(), {},
      { kind: 'vervangen', exerciseId: 'hack-squat' }, database)
    const slot = na.snapshot.slots[0]
    expect(slot.exerciseId).toBe('hack-squat')
    expect(slot.originalExerciseId).toBe('leg-press')
    expect(slot.step).toBe(exercise('hack-squat').step)
    expect(slot.sets.every(target => target.weight === null)).toBe(true)
    expect(starterProgram.slots[0].exerciseId).toBe('leg-press')
    expect(na.adjustments?.at(-1)?.kind).toBe('vervangen')
  })
  it('weigert vervangen zodra er een set op die oefening staat', async () => {
    await logSet(await draft(), session.revision, database)
    // Aanpassen kan pas als de rust voorbij is; die staat het vastleggen anders in de weg.
    let nu = (await database.sessions.get(session.id))!
    nu = await changeWorkout(nu.id, nu.revision, 'next-set', undefined, database)
    await expect(adjustWorkout(session.id, nu.revision, crypto.randomUUID(), {},
      { kind: 'vervangen', exerciseId: 'hack-squat' }, database)).rejects.toThrow('voordat je begint')
  })
})

describe('waar de lopende rust bij hoort', () => {
  it('blijft bij dezelfde oefening zolang die nog een set open heeft', async () => {
    await logSet(await draft(), session.revision, database)
    const nu = (await database.sessions.get(session.id))!
    const eerste = targets(nu.snapshot)[0].slot
    expect(restSlot(nu)?.id).toBe(eerste.id)
    // De volgende set staat op hetzelfde apparaat, dus er is niets om naartoe te gaan.
    expect(pendingTargets(nu)[0].slot.id).toBe(eerste.id)
  })
  it('wijst naar de afgelopen oefening zodra de volgende set op een ander apparaat staat', async () => {
    let nu = (await database.sessions.get(session.id))!
    const eerste = targets(nu.snapshot)[0].slot
    for (let index = 0; index < eerste.sets.length; index++) {
      nu = (await database.sessions.get(session.id))!
      if (nu.rest) nu = await changeWorkout(nu.id, nu.revision, 'next-set', undefined, database)
      session = nu
      await logSet(await draft(), nu.revision, database)
    }
    nu = (await database.sessions.get(session.id))!
    expect(restSlot(nu)?.id).toBe(eerste.id)
    expect(pendingTargets(nu)[0].slot.id).not.toBe(eerste.id)
  })
})

describe('een set weghalen', () => {
  it('haalt eerst de toegevoegde set weg, daarna een geplande, en stopt bij de laatste', async () => {
    const eerste = targets(session.snapshot)[0].slot
    let nu = await addExtraSet(session.id, session.revision, eerste.id, database)
    const metExtra = nu.snapshot.slots[0].sets.length

    nu = await removeSet(session.id, nu.revision, eerste.id, database)
    expect(nu.snapshot.slots[0].sets.length).toBe(metExtra - 1)
    expect(nu.snapshot.slots[0].sets.some(target => target.kind === 'extra')).toBe(false)
    // De geplande werksets staan er nog, dus het aantal is terug bij af.
    expect(plannedSlot(nu, eerste.id)?.plannedSets).toBe(2)

    nu = await removeSet(session.id, nu.revision, eerste.id, database)
    expect(plannedSlot(nu, eerste.id)?.plannedSets).toBe(1)
    await expect(removeSet(session.id, nu.revision, eerste.id, database))
      .rejects.toThrow('minstens één werkset')
  })
  it('neemt de conceptinvoer van de weggehaalde set mee', async () => {
    const eerste = targets(session.snapshot)[0].slot
    // Doorwerken tot alleen de laatste werkset nog openstaat: alleen de set die aan
    // de beurt is neemt conceptinvoer aan, en weghalen pakt de laatste openstaande.
    for (let index = 0; index < 2; index++) {
      await logSet(await draft(), session.revision, database)
      session = (await database.sessions.get(session.id))!
      session = await changeWorkout(session.id, session.revision, 'next-set', undefined, database)
    }
    const huidig = pendingTargets(session)[0]
    expect(huidig.slot.id).toBe(eerste.id)
    await writeDraft({ id: huidig.id, sessionId: session.id, weight: '30', reps: '9', revision: 0, updatedAt: new Date().toISOString() }, 0, database)

    const na = await removeSet(session.id, session.revision, eerste.id, database)
    expect(await database.drafts.get(huidig.id)).toBeUndefined()
    expect(na.pendingIds).not.toContain(huidig.id)
    // Wat al vastligt blijft staan, en telt als de volledige oefening van vandaag.
    expect(plannedSlot(na, eerste.id)?.plannedSets).toBe(1)
    expect(await database.sets.where('sessionId').equals(session.id).count()).toBe(2)
  })
})

describe('een open sessie weggooien', () => {
  it('laat geen sets, concepten of wachtrij achter en laat je daarna gewoon opnieuw beginnen', async () => {
    await logSet(await draft(), session.revision, database)
    session = (await database.sessions.get(session.id))!
    session = await changeWorkout(session.id, session.revision, 'next-set', undefined, database)
    await draft('25', '9')                        // concept op de volgende set

    await discardWorkout(session.id, session.revision, database)
    expect(await database.sessions.get(session.id)).toBeUndefined()
    expect(await database.sets.where('sessionId').equals(session.id).count()).toBe(0)
    expect(await database.drafts.where('sessionId').equals(session.id).count()).toBe(0)
    expect(await database.outbox.where('entityId').equals(session.id).count()).toBe(0)
    expect(await database.outcomes.count()).toBe(0)
    expect(await database.proposals.count()).toBe(0)
    expect((await database.workspace.get('main'))?.sessionId).toBeNull()

    // Zonder die laatste stap zou dit falen met 'Je training ontbreekt'.
    const nieuw = await beginWorkout(database)
    expect(nieuw.id).not.toBe(session.id)
  })
  it('is herhaalbaar en weigert een verouderde revisie', async () => {
    await expect(discardWorkout(session.id, session.revision - 1, database)).rejects.toThrow()
    await discardWorkout(session.id, session.revision, database)
    await discardWorkout(session.id, session.revision, database)
    expect(await database.sessions.count()).toBe(0)
  })
})
