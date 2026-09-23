/**
 * De trainingsregels uit bouwdocument-v1.md sectie 4, als pure functies.
 * Geen opslag, geen schermen: alles hier is te testen met gewone waarden.
 */
import { exercise } from './exercises'

export type SetKind = 'warmup' | 'work' | 'extra'

export interface LoggedSet {
  kind: SetKind
  weight: number
  reps: number
}

/** Het plan van één oefening binnen één sessie, zoals het gold tijdens die sessie. */
export interface PlannedSlot {
  exerciseId: string
  plannedSets: number
  repsMin: number
  repsMax: number
  step: number
  minWeight: number
}

export type ProposalReason = 'boven-bereik' | 'onder-bereik' | 'vasthouden' | 'pauze' | 'plateau'

export interface ProposalResult {
  weight: number
  reason: ProposalReason
  /** null betekent: geen voorstel, laat het gewicht ongemoeid. */
  changed: boolean
  stalls: (current: number) => number
}

export const PAUZE_DAGEN = 10
export const PLATEAU_GRENS = 3
export const RUSTDAGEN_TUSSEN_SESSIES = 2
export const VERGETEN_UREN = 6

const workSets = (sets: LoggedSet[]) => sets.filter(set => set.kind === 'work')

/** Elke werkset op of boven repsMin. */
export const bereikGehaald = (sets: LoggedSet[], slot: PlannedSlot) => {
  const work = workSets(sets)
  return work.length > 0 && work.every(set => set.reps >= slot.repsMin)
}

/** Elke werkset op of boven repsMax. */
export const bovenkantGehaald = (sets: LoggedSet[], slot: PlannedSlot) => {
  const work = workSets(sets)
  return work.length > 0 && work.every(set => set.reps >= slot.repsMax)
}

/** Afgerond betekent: alle geplande werksets van déze sessie zijn vastgelegd. */
export const oefeningAfgerond = (sets: LoggedSet[], slot: PlannedSlot) =>
  workSets(sets).length >= slot.plannedSets && slot.plannedSets > 0

/** Het gewicht waar de volgende stap vanaf gaat: de zwaarste werkset. */
export function huidigGewicht(sets: LoggedSet[]): number | null {
  const work = workSets(sets)
  if (!work.length) return null
  return Math.max(...work.map(set => set.weight))
}

const afronden = (value: number) => Math.round(value * 100) / 100

/**
 * Sectie 4.1. Geeft null als er geen voorstel hoort te komen: een onafgeronde
 * oefening of een oefening zonder vastgelegde werksets laat het gewicht met rust.
 */
export function voorstel(sets: LoggedSet[], slot: PlannedSlot): ProposalResult | null {
  const basis = huidigGewicht(sets)
  if (basis === null) return null
  if (!oefeningAfgerond(sets, slot)) return null

  if (bovenkantGehaald(sets, slot)) {
    return {
      weight: afronden(basis + slot.step),
      reason: 'boven-bereik',
      changed: true,
      stalls: () => 0,
    }
  }
  if (!bereikGehaald(sets, slot)) {
    return {
      weight: Math.max(slot.minWeight, afronden(basis - slot.step)),
      reason: 'onder-bereik',
      changed: true,
      stalls: () => 0,
    }
  }
  return { weight: basis, reason: 'vasthouden', changed: false, stalls: current => current + 1 }
}

/** Sectie 4.2. Het plateauscherm verschijnt bij drie keer achter elkaar vasthouden. */
export const plateauBereikt = (stalls: number) => stalls >= PLATEAU_GRENS

export type PlateauKeuze = 'terug' | 'vervangen' | 'laten'

/** Elke uitkomst zet de teller op nul; terugzetten gaat twee stappen omlaag. */
export function naPlateau(keuze: PlateauKeuze, gewicht: number, slot: Pick<PlannedSlot, 'step' | 'minWeight'>) {
  const weight = keuze === 'terug'
    ? Math.max(slot.minWeight, afronden(gewicht - slot.step * 2))
    : gewicht
  return { weight, stalls: 0, deloadFrom: keuze === 'terug' ? gewicht : undefined }
}

/**
 * Sectie 4.3. De pauze geldt per training, niet per oefening: maatstaf is de laatste
 * afgeronde sessie. Anders meldt een overgeslagen oefening een pauze die er niet is.
 */
export const isPauzeSessie = (laatsteSessieDag: string | null, vandaag: string) => {
  if (!laatsteSessieDag) return false
  return dagenTussen(laatsteSessieDag, vandaag) > PAUZE_DAGEN
}

/** Eén stap lager, met het oude gewicht bewaard zodat je er na de sessie op terug kunt. */
export function pauzeGewicht(gewicht: number | null, slot: Pick<PlannedSlot, 'step' | 'minWeight'>) {
  if (gewicht === null) return { weight: null, preBreakWeight: null }
  return {
    weight: Math.max(slot.minWeight, afronden(gewicht - slot.step)),
    preBreakWeight: gewicht,
  }
}

/**
 * Sectie 4.1 en 4.3: met welk gewicht een oefening vandaag begint.
 *
 * Normaal is dat het voorstel van de vorige keer. In een pauzesessie één stap lager,
 * en `pauzeVan` onthoudt waarvandaan, zodat afronden weet waar je naar terug kunt.
 * Een oefening die in de vorige pauzesessie is overgeslagen draagt zijn
 * `preBreakWeight` nog mee en krijgt de korting ook buiten een pauzesessie: die
 * blijft staan tot de oefening een keer gedaan is.
 *
 * Zonder historie is er niets om vanaf te rekenen. Dan geen gewicht en geen korting;
 * de sessie valt terug op het laagste gewicht van het apparaat.
 */
export function startgewicht(
  state: { currentWeight: number | null; preBreakWeight: number | null } | undefined,
  pauzeSessie: boolean,
  slot: Pick<PlannedSlot, 'step' | 'minWeight'>,
): { weight: number | null; pauzeVan?: number } {
  const basis = state?.preBreakWeight ?? state?.currentWeight ?? null
  if (basis === null) return { weight: null }
  if (pauzeSessie || state?.preBreakWeight != null) {
    return { weight: pauzeGewicht(basis, slot).weight, pauzeVan: basis }
  }
  return { weight: basis }
}

/**
 * Na een pauzesessie: bereik gehaald betekent terug naar het oude gewicht.
 * Niet gehaald betekent dat het verlaagde gewicht het nieuwe gewicht wordt.
 */
export function naPauzeSessie(sets: LoggedSet[], slot: PlannedSlot, preBreakWeight: number | null) {
  const basis = huidigGewicht(sets)
  if (basis === null) return { weight: preBreakWeight, preBreakWeight, hersteld: false }
  if (preBreakWeight !== null && bereikGehaald(sets, slot)) {
    return { weight: preBreakWeight, preBreakWeight: null, hersteld: true }
  }
  return { weight: basis, preBreakWeight: null, hersteld: false }
}

// --- kalender, sectie 4.4 en 4.5 -------------------------------------------------

/** Hele kalenderdagen tussen twee datums in formaat jjjj-mm-dd. */
export function dagenTussen(van: string, tot: string): number {
  const a = Date.parse(`${van}T12:00:00`)
  const b = Date.parse(`${tot}T12:00:00`)
  return Math.round((b - a) / 86_400_000)
}

/** Minimaal twee volledige rustdagen: train je op dag 0, dan mag dag 3 weer. */
export const magTrainenOp = (laatsteSessieDag: string | null, dag: string) =>
  laatsteSessieDag === null || dagenTussen(laatsteSessieDag, dag) > RUSTDAGEN_TUSSEN_SESSIES

export function volgendeTrainingsdag(laatsteSessieDag: string, ritmeDagen = 3): string {
  const stap = Math.max(ritmeDagen, RUSTDAGEN_TUSSEN_SESSIES + 1)
  const datum = new Date(`${laatsteSessieDag}T12:00:00`)
  datum.setDate(datum.getDate() + stap)
  return datum.toISOString().slice(0, 10)
}

/**
 * De trainingsdagen die nog komen, tot en met `tot`. Vanaf de dag na de laatste
 * afgeronde sessie volgens het ritme; is die dag al voorbij zonder dat je trainde, dan
 * is vandaag de eerstvolgende. Zonder sessie is vandaag de eerste dag.
 */
export function geplandeDagen(laatsteSessieDag: string | null, vandaag: string, tot: string): string[] {
  const dagen: string[] = []
  let dag = laatsteSessieDag ? volgendeTrainingsdag(laatsteSessieDag) : vandaag
  if (dag < vandaag) dag = vandaag
  while (dag <= tot) {
    dagen.push(dag)
    dag = volgendeTrainingsdag(dag)
  }
  return dagen
}

/**
 * Sectie 4.5. Een sessie is vergeten als de sessiedag voorbij is én er meer dan zes uur
 * sinds de laatste set is verstreken. Die tweede voorwaarde spaart de sessie die om
 * 23.50 begint en na middernacht doorloopt.
 */
export function isVergeten(input: { sessieDag: string; laatsteActiviteit: number; nu: number; vandaag: string }) {
  if (input.sessieDag === input.vandaag) return false
  return input.nu - input.laatsteActiviteit > VERGETEN_UREN * 3_600_000
}

// --- schermvoorrang, sectie 4.7 --------------------------------------------------

export type VandaagToestand = 'hervatten' | 'vergeten' | 'terug' | 'trainen' | 'rustdag'

export function vandaagToestand(input: {
  openSessie: { sessieDag: string; laatsteActiviteit: number } | null
  nu: number
  vandaag: string
  isTrainingsdag: boolean
  laatsteSessieDag: string | null
}): VandaagToestand {
  if (input.openSessie) {
    return isVergeten({ ...input.openSessie, nu: input.nu, vandaag: input.vandaag })
      ? 'vergeten'
      : 'hervatten'
  }
  if (input.isTrainingsdag && isPauzeSessie(input.laatsteSessieDag, input.vandaag)) return 'terug'
  return input.isTrainingsdag ? 'trainen' : 'rustdag'
}

// --- invoer, sectie 4.6 ----------------------------------------------------------

export function magVastleggen(weight: number | null, reps: number | null) {
  if (weight === null || reps === null) return false
  if (!Number.isInteger(reps) || reps < 1) return false
  return weight >= 0 && Number.isFinite(weight)
}

/** De stapper blijft binnen wat het apparaat kan. */
export const stap = (gewicht: number, richting: 1 | -1, exerciseId: string) => {
  const { step, minWeight } = exercise(exerciseId)
  return Math.max(minWeight, afronden(gewicht + step * richting))
}
