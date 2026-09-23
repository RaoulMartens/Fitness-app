/**
 * Afronden van een sessie: sets omzetten naar voorstellen en tellers.
 *
 * Dit gebeurt in één transactie en is herhaalbaar. Twee keer afronden mag geen tellers
 * verdubbelen, en een onderbreking halverwege mag geen sessie zonder voorstel achterlaten.
 * Zie bouwdocument-v1.md sectie 4 en 8.
 */
import { changeWorkout, workoutDb, type WorkoutDatabase } from './db'
import { findExercise } from './exercises'
import { draftVersions, localDate, starterProgram, type ExerciseState, type Proposal, type SessionOutcome, type Workout, type WorkoutSet } from './model'
import {
  bereikGehaald, isPauzeSessie, naPauzeSessie, naPlateau, oefeningAfgerond, plateauBereikt, voorstel,
  type LoggedSet, type PlannedSlot,
} from './rules'

/** Het plan van een oefening zoals het gold tijdens déze sessie. */
export function plannedSlot(session: Workout, slotId: string): PlannedSlot | null {
  const slot = session.snapshot.slots.find(item => item.id === slotId)
  if (!slot) return null
  const work = slot.sets.filter(target => target.kind === 'work')
  if (!work.length) return null
  const overgeslagen = new Set(Object.keys(session.skipped ?? {}))
  const gepland = work.filter(target => !overgeslagen.has(`${session.id}:${slot.id}:${target.number}`))
  return {
    exerciseId: slot.exerciseId,
    plannedSets: gepland.length,
    repsMin: work[0].repsMin,
    repsMax: work[0].repsMax,
    step: slot.step ?? 2.5,
    minWeight: slot.minWeight ?? 0,
  }
}

const toLogged = (records: WorkoutSet[]): LoggedSet[] =>
  records.map(record => ({ kind: record.kind ?? 'work', weight: record.weight, reps: record.reps }))

const leegState = (exerciseId: string): ExerciseState => ({
  exerciseId, currentWeight: null, lastUsedWeight: null, startWeight: null,
  preBreakWeight: null, increases: 0, stalls: 0, lastWorkedDay: null,
})

/** Het zwaarste gewicht dat in deze sessie op deze oefening is getild. */
const getild = (logged: LoggedSet[]) => {
  const work = logged.filter(set => set.kind === 'work')
  return work.length ? Math.max(...work.map(set => set.weight)) : null
}

export interface FinishInput {
  sessionId: string
  /** 'abort' bij vroeg stoppen; de berekening is verder gelijk. */
  action?: 'complete' | 'abort'
  now?: Date
}

/**
 * Rondt af en schrijft voorstellen, tellers en de uitkomst weg. Roep je dit twee keer
 * aan, dan krijg je dezelfde uitkomst terug zonder iets opnieuw te verwerken.
 */
export async function finishWorkout(input: FinishInput, database: WorkoutDatabase = workoutDb) {
  const now = input.now ?? new Date()
  return database.transaction('rw',
    [database.sessions, database.sets, database.drafts, database.outbox, database.appointments,
     database.workspace, database.proposals, database.exerciseStates, database.outcomes],
    async () => {
      const bestaand = await database.outcomes.get(input.sessionId)
      if (bestaand) return bestaand

      let session = await database.sessions.get(input.sessionId)
      if (!session) throw new Error('Deze training ontbreekt. Er is niets overschreven.')

      // De sessie sluiten hoort in dezelfde transactie als de berekening. Anders kan een
      // onderbreking een afgeronde sessie zonder voorstel achterlaten.
      if (session.status === 'active' || session.status === 'paused') {
        const drafts = await database.drafts.where('sessionId').equals(session.id).toArray()
        session = await changeWorkout(session.id, session.revision, input.action ?? 'complete',
          draftVersions(drafts), database)
      }

      const sets = await database.sets.where('sessionId').equals(session.id).toArray()
      const perSlot = new Map<string, WorkoutSet[]>()
      for (const record of sets) {
        perSlot.set(record.slotId, [...(perSlot.get(record.slotId) ?? []), record])
      }

      const sessionDay = localDate(new Date(session.startedAt))
      const alleGepland = session.snapshot.slots.length
      let afgerond = 0

      for (const [slotId, records] of perSlot) {
        const slot = plannedSlot(session, slotId)
        if (!slot) continue
        const logged = toLogged(records)
        if (oefeningAfgerond(logged, slot)) afgerond++

        const state = (await database.exerciseStates.get(slot.exerciseId)) ?? leegState(slot.exerciseId)
        const vorig = state.currentWeight
        const nuGetild = getild(logged)

        // Welke oefeningen met korting begonnen staat bij de sessie zelf. Voor die
        // oefeningen gaat de pauzeregel voor op gewone progressie en plateau.
        const pauzeVan = session.snapshot.slots.find(item => item.id === slotId)?.pauzeVan
        if (pauzeVan !== undefined) {
          const uitkomst = naPauzeSessie(logged, slot, pauzeVan)
          await database.exerciseStates.put({
            ...state,
            currentWeight: uitkomst.weight,
            lastUsedWeight: nuGetild ?? state.lastUsedWeight,
            startWeight: state.startWeight ?? uitkomst.weight,
            preBreakWeight: uitkomst.preBreakWeight,
            lastWorkedDay: sessionDay,
          })
          if (uitkomst.weight !== null) {
            await schrijfVoorstel(database, {
              id: `${session.id}:${slot.exerciseId}`, exerciseId: slot.exerciseId, sessionId: session.id,
              sessionDay, from: vorig, to: uitkomst.weight, reason: 'pauze',
              createdAt: now.toISOString(), superseded: false,
            })
          }
          continue
        }

        const resultaat = voorstel(logged, slot)
        if (!resultaat) continue

        // increases telt werk, geen voornemens: vergelijk met wat je vorige keer echt
        // tilde, niet met het voorstel dat daarna is opgeschreven.
        const zwaarderDanVorigeKeer = state.lastUsedWeight !== null
          && nuGetild !== null && nuGetild > state.lastUsedWeight
        await database.exerciseStates.put({
          ...state,
          currentWeight: resultaat.weight,
          lastUsedWeight: nuGetild ?? state.lastUsedWeight,
          startWeight: state.startWeight ?? nuGetild,
          increases: zwaarderDanVorigeKeer ? state.increases + 1 : state.increases,
          stalls: resultaat.stalls(state.stalls),
          lastWorkedDay: sessionDay,
        })
        await schrijfVoorstel(database, {
          id: `${session.id}:${slot.exerciseId}`, exerciseId: slot.exerciseId, sessionId: session.id,
          sessionDay, from: vorig, to: resultaat.weight, reason: resultaat.reason,
          createdAt: now.toISOString(), superseded: false,
        })
      }

      // Een oefening die met korting begon maar niet is gedaan houdt die korting tot
      // hij wel een keer gedaan is (sectie 4.3). De pauzesessie zelf is met afronden
      // verbruikt, dus zonder deze aantekening zou hij de volgende keer vol beginnen.
      for (const item of session.snapshot.slots) {
        if (item.pauzeVan === undefined || perSlot.has(item.id)) continue
        const state = (await database.exerciseStates.get(item.exerciseId)) ?? leegState(item.exerciseId)
        if (state.preBreakWeight === null) {
          await database.exerciseStates.put({ ...state, preBreakWeight: item.pauzeVan })
        }
      }

      const outcome: SessionOutcome = {
        sessionId: session.id,
        sessionDay,
        finishedAt: now.toISOString(),
        finishedPartially: afgerond < alleGepland,
        wasBreakSession: Boolean(session.pauzeSessie),
      }
      await database.outcomes.put(outcome)
      return outcome
    })
}

/** Het jongste voorstel per oefening telt; oudere blijven staan voor herberekening. */
async function schrijfVoorstel(database: WorkoutDatabase, proposal: Proposal) {
  const ouder = await database.proposals.where('exerciseId').equals(proposal.exerciseId).toArray()
  for (const oud of ouder) {
    if (oud.id !== proposal.id && !oud.superseded && oud.sessionDay <= proposal.sessionDay) {
      await database.proposals.put({ ...oud, superseded: true })
    }
  }
  await database.proposals.put(proposal)
}

/**
 * Welke oefeningen bij afronden omhoog zouden gaan. Voor de waarschuwing bij
 * weggooien: "vijf sets" zegt weinig, "de verhoging van Leg press" wel.
 */
export function verdiendeVerhogingen(session: Workout, sets: WorkoutSet[]) {
  const namen: string[] = []
  for (const slot of session.snapshot.slots) {
    const plan = plannedSlot(session, slot.id)
    if (!plan) continue
    const logged = toLogged(sets.filter(item => item.slotId === slot.id))
    const omhoog = slot.pauzeVan !== undefined
      ? oefeningAfgerond(logged, plan) && bereikGehaald(logged, plan)
      : voorstel(logged, plan)?.reason === 'boven-bereik'
    if (omhoog) namen.push(slot.name)
  }
  return namen
}

/**
 * Sectie 4.2: oefeningen uit deze sessie die stilstaan en waarover nog niet beslist is.
 * Na een keuze staat de teller op nul en is de keuze vastgelegd. Dat tweede is nodig
 * omdat een herberekening de teller anders weer op drie zou zetten, en dan kwam de
 * vraag terug over iets wat je al besloten had.
 */
export function vastgelopen(outcome: SessionOutcome, voorstellen: Proposal[], toestanden: ExerciseState[]) {
  return voorstellen
    .filter(item => item.sessionId === outcome.sessionId && item.reason === 'vasthouden')
    .filter(item => !outcome.plateauChoice?.[item.exerciseId])
    .filter(item => plateauBereikt(toestanden.find(state => state.exerciseId === item.exerciseId)?.stalls ?? 0))
    .map(item => item.exerciseId)
}

export type PlateauBesluit = { keuze: 'terug' } | { keuze: 'vervangen'; door: string } | { keuze: 'laten' }

/** Of een oefening een vaste plek in het schema heeft, en dus voorgoed te vervangen is. */
export const inSchema = (slotId: string) => starterProgram.slots.some(slot => slot.id === slotId)

/**
 * Het besluit bij een plateau, in één transactie: teller op nul en keuze vastgelegd,
 * met het gevolg van de keuze erbij. Terugzetten past ook het voorstel van deze sessie
 * aan, zodat het Klaar-scherm meteen het nieuwe gewicht toont. Vervangen geldt vanaf
 * de volgende sessie en wordt in de werkruimte bewaard, op de plek in het schema.
 */
export async function kiesPlateau(sessionId: string, exerciseId: string, besluit: PlateauBesluit, database: WorkoutDatabase = workoutDb) {
  return database.transaction('rw',
    [database.outcomes, database.exerciseStates, database.proposals, database.sessions, database.workspace],
    async () => {
      const outcome = await database.outcomes.get(sessionId)
      if (!outcome) throw new Error('Deze sessie is nog niet afgerond.')
      if (outcome.plateauChoice?.[exerciseId]) return outcome
      const state = await database.exerciseStates.get(exerciseId)
      const slot = (await database.sessions.get(sessionId))?.snapshot.slots.find(item => item.exerciseId === exerciseId)
      if (!state || !slot) throw new Error('Deze oefening zat niet in de sessie.')

      let volgende: ExerciseState = { ...state, stalls: 0 }
      if (besluit.keuze === 'terug' && state.currentWeight !== null) {
        const uitkomst = naPlateau('terug', state.currentWeight, slot)
        volgende = { ...volgende, currentWeight: uitkomst.weight, deloadFrom: uitkomst.deloadFrom ?? null }
        const voorstel = await database.proposals.get(`${sessionId}:${exerciseId}`)
        if (voorstel) await database.proposals.put({ ...voorstel, to: uitkomst.weight, reason: 'plateau' })
      }
      if (besluit.keuze === 'vervangen') {
        const door = findExercise(besluit.door)
        if (!door) throw new Error('Die oefening staat niet in je lijst.')
        if (!inSchema(slot.id)) throw new Error(`${slot.name} staat niet in je schema; die voeg je zelf toe.`)
        const workspace = await database.workspace.get('main')
        if (!workspace) throw new Error('Open de app opnieuw om je planning te laden.')
        await database.workspace.put({ ...workspace, vervangingen: { ...workspace.vervangingen, [slot.id]: door.id } })
      }
      await database.exerciseStates.put(volgende)
      const bijgewerkt: SessionOutcome = { ...outcome, plateauChoice: { ...outcome.plateauChoice, [exerciseId]: besluit.keuze } }
      await database.outcomes.put(bijgewerkt)
      return bijgewerkt
    })
}

/** Hoeveel oefeningen van een sessie helemaal gedaan zijn, volgens dezelfde regel als afronden. */
export function afgerondeOefeningen(session: Workout, sets: WorkoutSet[]) {
  return session.snapshot.slots.filter(slot => {
    const plan = plannedSlot(session, slot.id)
    return plan !== null && oefeningAfgerond(toLogged(sets.filter(item => item.slotId === slot.id)), plan)
  }).length
}

/** Of de eerstvolgende sessie de pauzekorting draagt. */
export async function pauzeSessieNodig(vandaag: string, database: WorkoutDatabase = workoutDb) {
  const laatste = await database.outcomes.orderBy('finishedAt').last()
  return isPauzeSessie(laatste?.sessionDay ?? null, vandaag)
}
