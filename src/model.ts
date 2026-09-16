export interface SetTarget {
  number: number
  weight: number
  reps: number
}

export interface Prescription {
  id: string
  version: number
  exerciseId: string
  name: string
  weightUnit: 'kg'
  weightStep: number
  cues: string[]
  sets: SetTarget[]
}

export interface Session {
  id: string
  kind: 'test'
  createdAt: string
  status: 'active' | 'completed'
  completedAt?: string
  prescription: Prescription
}

export interface Draft {
  id: string
  sessionId: string
  weight: string
  reps: string
  baseRevision: number
  updatedAt: string
}

export interface SetRecord {
  id: string
  sessionId: string
  exerciseId: string
  number: number
  weight: number
  reps: number
  target: SetTarget
  revision: number
  recordedAt: string
}

export interface OutboxItem {
  id: string
  entityId: string
  baseRevision: number
  status: 'local'
  payload: SetRecord
}

export interface Workspace {
  id: 'main'
  activeSessionId: string
}

export function setId(sessionId: string, number: number) {
  return `${sessionId}:exercise-1:set-${number}`
}

// Deliberately a fixture: these values are not a personal training prescription.
export const testPrescription: Prescription = {
  id: 'm1-test-v1',
  version: 1,
  exerciseId: 'cross-body-lat-pull-around',
  name: 'Cross-Body Lat Pull-Around',
  weightUnit: 'kg',
  weightStep: 1,
  cues: ['Kabel en pols op één lijn.', 'Diepe stretch bovenin.', 'Rustig terug, niet zwaaien.'],
  sets: [1, 2, 3].map(number => ({ number, weight: 12, reps: 10 })),
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
