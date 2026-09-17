export interface Target {
  number: number
  repsMin: number
  repsMax: number
  weight: number | null
  rir: { min: number; max: number }
}
export interface Slot {
  id: string
  exerciseId: string
  name: string
  restSeconds: number
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
  kind: 'later' | 'skip' | 'time' | 'weight' | 'undo'
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
  slots: [
    { id: 'leg-press', name: 'Leg press', reps: [8, 12], rest: 120 },
    { id: 'leg-curl', name: 'Leg curl', reps: [10, 15], rest: 120 },
    { id: 'chest-press', name: 'Chest press', reps: [8, 12], rest: 120 },
    { id: 'row', name: 'Zittende row', reps: [8, 12], rest: 120 },
    { id: 'pulldown', name: 'Lat pulldown', reps: [8, 12], rest: 120 },
    { id: 'biceps-curl', name: 'Biceps curl', reps: [10, 15], rest: 90 },
    { id: 'triceps-pushdown', name: 'Triceps pushdown', reps: [10, 15], rest: 90 },
  ].map(exercise => ({
    id: exercise.id, exerciseId: exercise.id, name: exercise.name, restSeconds: exercise.rest,
    sets: [1, 2].map(number => ({ number, repsMin: exercise.reps[0], repsMax: exercise.reps[1], weight: null, rir: { min: 2, max: 3 } })),
  })),
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
export function resultLabel(session: Workout) {
  return session.status === 'aborted' ? 'Sessie afgebroken' : session.cursor === targets(session.snapshot).length ? 'Sessie afgerond' : 'Sessie deels afgerond'
}
export function timerLabel(milliseconds: number) {
  const seconds = Math.ceil(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
