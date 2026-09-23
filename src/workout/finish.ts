/**
 * Afronden van een sessie: sets omzetten naar voorstellen en tellers.
 *
 * Dit gebeurt in één transactie en is herhaalbaar. Twee keer afronden mag geen tellers
 * verdubbelen, en een onderbreking halverwege mag geen sessie zonder voorstel achterlaten.
 * Zie bouwdocument-v1.md sectie 4 en 8.
 */
import { changeWorkout, workoutDb, type WorkoutDatabase } from './db'
import { draftVersions, localDate, type ExerciseState, type Proposal, type SessionOutcome, type Workout, type WorkoutSet } from './model'
import {
  bereikGehaald, isPauzeSessie, naPauzeSessie, oefeningAfgerond, voorstel,
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

/** Of de eerstvolgende sessie de pauzekorting draagt. */
export async function pauzeSessieNodig(vandaag: string, database: WorkoutDatabase = workoutDb) {
  const laatste = await database.outcomes.orderBy('finishedAt').last()
  return isPauzeSessie(laatste?.sessionDay ?? null, vandaag)
}
