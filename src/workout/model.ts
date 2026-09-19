import { exercise as catalogue } from './exercises'
export interface Target {
  number: number
  repsMin: number
  repsMax: number
  weight: number | null
  rir: { min: number; max: number }
  /** Warming-up en extra tellen niet mee voor progressie. Zie bouwdocument sectie 4.0. */
  kind: 'warmup' | 'work' | 'extra'
}
export interface Slot {
  id: string
  exerciseId: string
  name: string
  restSeconds: number
  /** Gekopieerd uit de catalogus, zodat een latere wijziging aan een apparaat
   *  oude sessies niet met terugwerkende kracht anders laat uitvallen. */
  step: number
  minWeight: number
  /** Gevuld zodra je deze oefening vandaag hebt vervangen; het schema zelf blijft gelijk. */
  originalExerciseId?: string
  sets: Target[]
}
export interface Program {
  id: string
  version: number
  name: string
  slots: Slot[]
}
export type View = 'today' | 'overview' | 'warmup' | 'exercise' | 'summary' | 'consequences' | 'plan' | 'plan-edit'
export interface Workout {
  id: string
  startedAt: string
  endedAt?: string
  status: 'active' | 'paused' | 'completed' | 'aborted'
  phase: 'warmup' | 'exercise'
  warmed: boolean
  cursor: number
  revision: number
  snapshot: Program
  rest: { afterSetId: string; endAt: number; remainingMs: number } | null
  appointmentId?: string
  pendingIds?: string[]
  skipped?: Record<string, { reason: string; at: string }>
  todayWeights?: Record<string, number>
  adjustments?: Adjustment[]
}
export interface AdjustmentState {
  pendingIds: string[]
  skipped: NonNullable<Workout['skipped']>
  todayWeights: Record<string, number>
}
export interface Adjustment {
  id: string
  kind: 'later' | 'skip' | 'time' | 'weight' | 'vervangen' | 'undo'
  reason: string
  scope: 'today'
  label: string
  createdAt: string
  before: AdjustmentState
  after: AdjustmentState
  undoOf?: string
}
export interface Appointment {
  id: string
  date: string
  originalDate: string
  status: 'planned' | 'started' | 'completed' | 'aborted' | 'skipped'
  sessionId?: string
  revision: number
  omittedSlots: string[]
  history: { id: string; action: 'move' | 'skip' | 'time'; from: string; to: string; createdAt: string }[]
}
export type DraftVersions = Record<string, number>
export interface WorkoutDraft {
  id: string
  sessionId: string
  weight: string
  reps: string
  revision: number
  updatedAt: string
}
export interface WorkoutSet {
  id: string
  sessionId: string
  slotId: string
  exerciseId: string
  number: number
  weight: number
  reps: number
  target: Target
  recordedAt: string
  /** Warming-up en extra tellen niet mee voor progressie. Zie bouwdocument sectie 4.0. */
  kind?: 'warmup' | 'work' | 'extra'
  correctedAt?: string
}

/**
 * Het plan van één oefening zoals het gold tijdens die sessie. Bewaard bij de sessie,
 * niet opgezocht in de catalogus: een latere wijziging aan een apparaat mag oude
 * sessies niet met terugwerkende kracht anders laten uitvallen.
 */
export interface SessionSlot {
  slotId: string
  exerciseId: string
  originalExerciseId?: string
  plannedSets: number
  originalSets: number
  order: number
  step: number
  minWeight: number
  repsMin: number
  repsMax: number
  startWeight: number | null
}

/** Eén voorstel per sessie per oefening, zodat een correctie van een oude sessie
 *  een nieuwer voorstel niet overschrijft. */
export interface Proposal {
  id: string
  exerciseId: string
  sessionId: string
  sessionDay: string
  from: number | null
  to: number
  reason: 'boven-bereik' | 'onder-bereik' | 'vasthouden' | 'pauze' | 'plateau'
  createdAt: string
  appliedInSessionId?: string
  superseded: boolean
}

/** Cache boven de sets. Alles hierin moet herleidbaar zijn uit sets plus outcomes. */
export interface ExerciseState {
  exerciseId: string
  /** Het voorstel voor de volgende keer. */
  currentWeight: number | null
  /** Wat je de vorige sessie daadwerkelijk tilde. Nodig om te zien of je echt
   *  zwaarder bent gaan tillen: currentWeight is een voornemen, dit is werk. */
  lastUsedWeight: number | null
  startWeight: number | null
  preBreakWeight: number | null
  increases: number
  stalls: number
  lastWorkedDay: string | null
}

/** Keuzes die geen set veranderen en dus anders bij herberekening zouden verdwijnen. */
export interface SessionOutcome {
  sessionId: string
  sessionDay: string
  finishedAt: string
  finishedPartially: boolean
  wasBreakSession: boolean
  plateauChoice?: Record<string, 'terug' | 'vervangen' | 'laten'>
}
export interface WorkoutWorkspace {
  id: 'main'
  sessionId: string | null
  weekend: 'Zaterdag' | 'Zondag' | null
  revision: number
  planDraft?: { weekend: 'Zaterdag' | 'Zondag' | null; baseRevision: number }
  appointmentId?: string
}
export type PendingChange = { id: string; entityId: string; status: 'local'; createdAt: string } & (
  { entity: 'session'; payload: Workout } | { entity: 'set'; payload: WorkoutSet } | { entity: 'planning'; payload: WorkoutWorkspace } | { entity: 'appointment'; payload: Appointment }
)

export const starterProgram: Program = {
  id: 'full-body-start', version: 1, name: 'Full-body',
  slots: ([
    { id: 'leg-press', reps: [8, 12] },
    { id: 'leg-curl', reps: [10, 15] },
    { id: 'chest-press', reps: [8, 12] },
    { id: 'row', reps: [8, 12] },
    { id: 'pulldown', reps: [8, 12] },
    { id: 'biceps-curl', reps: [10, 15] },
    { id: 'triceps-pushdown', reps: [10, 15] },
  ] as const).map(entry => {
    const exercise = catalogue(entry.id)
    return {
    id: entry.id, exerciseId: entry.id, name: exercise.name, restSeconds: exercise.restSeconds,
    step: exercise.step, minWeight: exercise.minWeight,
    sets: [
      { number: 0, repsMin: 10, repsMax: 15, weight: null, rir: { min: 4, max: 6 }, kind: 'warmup' as const },
      ...[1, 2].map(number => ({ number, repsMin: entry.reps[0], repsMax: entry.reps[1], weight: null, rir: { min: 2, max: 3 }, kind: 'work' as const })),
    ],
  } }),
}

export const targets = (program: Program) => program.slots.flatMap(slot => slot.sets.map(target => ({ slot, target })))
export const recordId = (sessionId: string, slotId: string, number: number) => `${sessionId}:${slotId}:${number}`
export const pendingIds = (session: Workout) => session.pendingIds ?? targets(session.snapshot).slice(session.cursor).map(({ slot, target }) => recordId(session.id, slot.id, target.number))
export function pendingTargets(session: Workout) {
  const indexed = new Map(targets(session.snapshot).map(item => [recordId(session.id, item.slot.id, item.target.number), item]))
  return pendingIds(session).map(id => {
    const item = indexed.get(id)
    if (!item) throw new Error('Deze training bevat een onbekende set. Er is niets overschreven.')
    return { ...item, id, target: { ...item.target, weight: session.todayWeights?.[id] ?? item.target.weight } }
  })
}
export const draftVersions = (drafts: WorkoutDraft[]): DraftVersions => Object.fromEntries(drafts.map(draft => [draft.id, draft.revision]))
export const lastUndoable = (session: Workout) => [...(session.adjustments ?? [])].reverse().find(item => item.kind !== 'undo' && !session.adjustments?.some(undo => undo.undoOf === item.id))
export function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
export const dateLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
export const isRunning = (session: Workout | undefined) => session?.status === 'active' || session?.status === 'paused'
export function restRemaining(session: Workout, now = Date.now()) {
  if (!session.rest) return 0
  return session.status === 'paused' ? session.rest.remainingMs : Math.max(0, session.rest.endAt - now)
}
/**
 * Hoe lang de rust die nu loopt in totaal duurt. Er staat alleen een eindtijd
 * opgeslagen, zodat de klok het sluiten van de app overleeft; voor een balk die
 * leegloopt is de duur ook nodig. Die hoort bij de oefening van de set die net
 * is vastgelegd, en dat is na de laatste set niet de oefening die hierna komt.
 */
export function restTotal(session: Workout) {
  if (!session.rest) return 0
  const slot = session.snapshot.slots.find(item => session.rest!.afterSetId.includes(`:${item.id}:`))
  return (slot?.restSeconds ?? 0) * 1000
}
export function resultLabel(session: Workout) {
  return session.status === 'aborted' ? 'Sessie afgebroken' : session.cursor === targets(session.snapshot).length ? 'Sessie afgerond' : 'Sessie deels afgerond'
}
export function timerLabel(milliseconds: number) {
  const seconds = Math.ceil(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function parseInput(weight: string, reps: string) {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(weight.trim())) {
    throw new Error('Vul een gewicht in met maximaal twee decimalen, bijvoorbeeld 12 of 12,5.')
  }
  if (!/^\d+$/.test(reps.trim()) || Number(reps) < 1 || Number(reps) > 999) {
    throw new Error('Vul een heel aantal herhalingen in tussen 1 en 999.')
  }
  const value = Number(weight.replace(',', '.'))
  if (!Number.isFinite(value) || value > 9999) {
    throw new Error('Vul een gewicht in tussen 0 en 9999 kg.')
  }
  return { weight: value, reps: Number(reps) }
}

export function formatWeight(value: number) {
  return value.toLocaleString('nl-NL', { maximumFractionDigits: 2 })
}
