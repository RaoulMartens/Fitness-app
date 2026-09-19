import Dexie from 'dexie'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { adjustWorkout, beginWorkout, changeAppointment, changeWorkout, nextAppointment, openWorkspace, WorkoutDatabase, writeDraft, logSet, readLegacyChanges, updateWeekend } from './db'
import { draftVersions, pendingTargets, recordId, starterProgram, targets, type Workout } from './model'

let db: WorkoutDatabase
let session: Workout
beforeEach(async () => { db = new WorkoutDatabase(`m3-${crypto.randomUUID()}`); await openWorkspace(db); session = await beginWorkout(db); session = await changeWorkout(session.id, session.revision, 'begin-exercise', undefined, db) })
afterEach(async () => { vi.useRealTimers(); await db.delete() })
async function reload() { session = (await db.sessions.get(session.id))! }
async function versions() { return draftVersions(await db.drafts.where('sessionId').equals(session.id).toArray()) }
async function input(weight = '15,', reps = '') {
  const current = pendingTargets(session)[0]
  const previous = await db.drafts.get(current.id)
  return writeDraft({ id: current.id, sessionId: session.id, weight, reps, revision: previous?.revision ?? 0, updatedAt: '' }, previous?.revision ?? 0, db)
}
async function adjust(command: Parameters<typeof adjustWorkout>[4], id = crypto.randomUUID()) {
  session = await adjustWorkout(session.id, session.revision, id, await versions(), command, db)
}
async function record() {
  const draft = await input('12', '10')
  await logSet(draft, session.revision, db); await reload()
  if (session.rest) session = await changeWorkout(session.id, session.revision, 'next-set', undefined, db)
}
const TOTAAL = targets(starterProgram).length
const PER_OEFENING = starterProgram.slots[0].sets.length

describe('M3a aanpassingen', () => {
  it('weekendkeuze werkt de volgende afspraak bij maar behoudt een bewuste verplaatsing', async () => {
    vi.setSystemTime(new Date('2026-09-17T12:00:00'))
    await changeWorkout(session.id, session.revision, 'complete', {}, db)
    const workspace = (await db.workspace.get('main'))!
    await updateWeekend('Zaterdag', workspace.revision, db)
    let appointment = (await db.appointments.get(workspace.appointmentId!))!
    expect(appointment.date).toBe('2026-09-19')
    appointment = await changeAppointment(appointment.id, appointment.revision, crypto.randomUUID(), { kind: 'move', date: '2026-09-21' }, db)
    await updateWeekend('Zondag', workspace.revision + 1, db)
    expect((await db.appointments.get(appointment.id))?.date).toBe('2026-09-21')
  })
  it('later doen bewaart ids en halve invoer na heropenen; herhalen is idempotent', async () => {
    const draft = await input()
    const original = structuredClone(session.snapshot)
    const revision = session.revision, id = crypto.randomUUID(), expected = await versions()
    await adjust({ kind: 'later' }, id)
    expect(pendingTargets(session)[0].slot.id).toBe('leg-curl')
    expect(pendingTargets(session).at(-PER_OEFENING)?.id).toBe(draft.id)
    await adjustWorkout(session.id, revision, id, expected, { kind: 'later' }, db)
    expect((await db.sessions.get(session.id))?.adjustments).toHaveLength(1)
    db.close(); await db.open(); await reload()
    expect(await db.drafts.get(draft.id)).toEqual(draft)
    expect(session.snapshot).toEqual(original)
    await adjust({ kind: 'undo' })
    expect(pendingTargets(session)[0].id).toBe(draft.id)
  })
  it('terugdraaien na een nieuwe set behoudt prestaties en maakt geen dubbele open set', async () => {
    await adjust({ kind: 'later' }); await record()
    const result = (await db.sets.toArray())[0]
    await adjust({ kind: 'undo' })
    expect(pendingTargets(session)[0].slot.id).toBe('leg-press')
    expect(pendingTargets(session).map(item => item.id)).not.toContain(result.id)
    expect(pendingTargets(session)).toHaveLength(TOTAAL - 1)
    expect(await db.sets.get(result.id)).toEqual(result)
    expect(session.cursor).toBe(1)
  })
  it('overslaan wijzigt alleen open sets en alle aanpassingen kunnen teruggedraaid worden', async () => {
    await record()
    await adjust({ kind: 'skip', reason: 'pain' })
    expect(Object.keys(session.skipped!)).toEqual(
      Array.from({ length: PER_OEFENING - 1 }, (_, index) => recordId(session.id, 'leg-press', index + 1)))
    await adjust({ kind: 'time', slots: ['biceps-curl', 'triceps-pushdown'] })
    expect(Object.keys(session.skipped!)).toHaveLength(PER_OEFENING - 1 + PER_OEFENING * 2)
    await adjust({ kind: 'undo' }); await adjust({ kind: 'undo' })
    expect(Object.keys(session.skipped!)).toHaveLength(0)
    expect(pendingTargets(session)).toHaveLength(TOTAAL - 1)
    expect(await db.sets.count()).toBe(1)
  })
  it('doel voor vandaag is gescheiden van werkelijk gewicht en het oorspronkelijke voorschrift', async () => {
    await adjust({ kind: 'weight', weight: '10', reason: 'day' })
    expect(pendingTargets(session)[0].target.weight).toBe(10)
    await record()
    const set = (await db.sets.toArray())[0]
    expect(set.weight).toBe(12); expect(set.target.weight).toBe(10)
    expect(session.snapshot.slots[0].sets[0].weight).toBeNull()
    await adjust({ kind: 'undo' })
    expect(pendingTargets(session)[0].target.weight).toBeNull()
    expect((await db.sets.get(set.id))?.target.weight).toBe(10)
  })
  it('verouderde bevestigingen en ongeziene concepten worden afgewezen', async () => {
    const expected = await versions(), revision = session.revision
    await input()
    await expect(adjustWorkout(session.id, revision, crypto.randomUUID(), expected, { kind: 'later' }, db)).rejects.toThrow('nieuwe conceptinvoer')
    await adjust({ kind: 'later' })
    await expect(adjustWorkout(session.id, revision, crypto.randomUUID(), await versions(), { kind: 'later' }, db)).rejects.toThrow('ander venster')
  })
  it('opslagfout rolt aanpassing en uitgaande opdracht samen terug', async () => {
    const before = await db.sessions.get(session.id)
    const fail = () => { throw new Error('Schijf vol') }
    db.outbox.hook('creating', fail)
    await expect(adjust({ kind: 'later' })).rejects.toThrow('Schijf vol')
    expect(await db.sessions.get(session.id)).toEqual(before)
    db.outbox.hook('creating').unsubscribe(fail)
    await adjust({ kind: 'later' })
    expect(session.adjustments).toHaveLength(1)
  })
  it('meerdere concepten blijven bewaard en beëindigen controleert elk concept afzonderlijk', async () => {
    const first = await input(); await adjust({ kind: 'later' }); await input('20', '')
    const expected = await versions()
    await input('21', '')
    await expect(changeWorkout(session.id, session.revision, 'abort', expected, db)).rejects.toThrow('nieuwe conceptinvoer')
    expect(await db.drafts.get(first.id)).toEqual(first)
    session = await changeWorkout(session.id, session.revision, 'abort', await versions(), db)
    expect(session.status).toBe('aborted')
  })
  it('alle resterende oefeningen overslaan eindigt niet automatisch en maakt geen rusttimer', async () => {
    await record()
    await adjust({ kind: 'time', slots: session.snapshot.slots.map(slot => slot.id) })
    expect(pendingTargets(session)).toHaveLength(0)
    expect(session.status).toBe('active'); expect(session.rest).toBeNull()
    session = await changeWorkout(session.id, session.revision, 'complete', await versions(), db)
    expect(await db.sets.count()).toBe(1)
    expect(Object.keys(session.skipped!)).toHaveLength(TOTAAL - 1)
  })
  it('een afspraak verplaatsen of overslaan kan niet een actieve training verbergen', async () => {
    const appointment = (await db.appointments.get(session.appointmentId!))!
    await expect(changeAppointment(appointment.id, appointment.revision, crypto.randomUUID(), { kind: 'skip' }, db)).rejects.toThrow('gestart')
    expect((await db.sessions.get(session.id))?.status).toBe('active')
  })
  it('afspraakgeschiedenis en inkorting blijven behouden; nieuw schema krijgt geen aangepast gewicht', async () => {
    session = await changeWorkout(session.id, session.revision, 'complete', {}, db)
    await nextAppointment(session.appointmentId!, db)
    const workspace = (await db.workspace.get('main'))!
    let appointment = (await db.appointments.get(workspace.appointmentId!))!
    const originalDate = appointment.date
    const id = crypto.randomUUID(), revision = appointment.revision
    appointment = await changeAppointment(appointment.id, revision, id, { kind: 'move', date: '2099-06-20' }, db)
    await changeAppointment(appointment.id, revision, id, { kind: 'move', date: '2099-06-20' }, db)
    expect(appointment.originalDate).toBe(originalDate); expect(appointment.history).toHaveLength(1)
    appointment = await changeAppointment(appointment.id, appointment.revision, crypto.randomUUID(), { kind: 'time', slots: ['leg-press'] }, db)
    db.close(); await db.open()
    session = await beginWorkout(db)
    expect(pendingTargets(session)[0].slot.id).toBe('leg-curl')
    expect(session.snapshot.slots[0].sets[0].weight).toBeNull()
    expect(Object.keys(session.skipped!)).toHaveLength(PER_OEFENING)
    expect((await db.workspace.get('main'))?.weekend).toBeNull()
  })
  it('bewust overslaan bewaart de afspraak en maakt op verzoek alleen de volgende afspraak', async () => {
    session = await changeWorkout(session.id, session.revision, 'abort', {}, db)
    await nextAppointment(session.appointmentId!, db)
    const workspace = (await db.workspace.get('main'))!
    const appointment = (await db.appointments.get(workspace.appointmentId!))!
    await changeAppointment(appointment.id, appointment.revision, crypto.randomUUID(), { kind: 'skip' }, db)
    await nextAppointment(appointment.id, db); await nextAppointment(appointment.id, db)
    expect(await db.appointments.count()).toBe(3)
    expect((await db.appointments.get(appointment.id))?.status).toBe('skipped')
    expect(await db.sessions.count()).toBe(1)
  })
})

it('de overgang naar v1 maakt de oude opslag in één keer leeg', async () => {
  // Bewuste, eenmalige overgang: schoon beginnen. Een sessie uit het oude model heeft geen
  // sessieplan en kan niet worden voortgezet; die mag de app niet tijdens gebruik tegenkomen.
  const name = `legacy-${crypto.randomUUID()}`
  const old = new Dexie(name)
  old.version(1).stores({ sessions: 'id, startedAt', sets: 'id, sessionId', drafts: 'id, sessionId', outbox: 'id, entityId, status', workspace: 'id' })
  const legacySession: Workout = { id: 'old', status: 'active', phase: 'exercise', startedAt: '2026-09-16T18:00:00Z', warmed: true, cursor: 1, revision: 3, snapshot: structuredClone(starterProgram), rest: null }
  await old.table('sessions').add(legacySession)
  await old.table('drafts').add({ id: 'old:leg-press:2', sessionId: 'old', weight: '12,', reps: '', revision: 1, updatedAt: '' })
  await old.table('sets').add({ id: 'old:leg-press:1', sessionId: 'old', weight: 12, reps: 10 })
  await old.table('outbox').add({ id: 'old-operation', status: 'local', payload: legacySession })
  old.close()

  const upgraded = new WorkoutDatabase(name)
  try {
    await upgraded.open()
    expect(await upgraded.sessions.count()).toBe(0)
    expect(await upgraded.sets.count()).toBe(0)
    expect(await upgraded.drafts.count()).toBe(0)
    expect(await upgraded.outbox.count()).toBe(0)
    expect(await upgraded.appointments.count()).toBe(0)
    // De nieuwe tabellen bestaan en zijn bruikbaar.
    expect(await upgraded.proposals.count()).toBe(0)
    expect(await upgraded.exerciseStates.count()).toBe(0)
    expect(await upgraded.outcomes.count()).toBe(0)
    // Een verse sessie werkt na de overgang.
    await openWorkspace(upgraded)
    const session = await beginWorkout(upgraded)
    expect(session.snapshot.slots.length).toBe(starterProgram.slots.length)
  } finally { old.close(); await upgraded.delete() }
})
