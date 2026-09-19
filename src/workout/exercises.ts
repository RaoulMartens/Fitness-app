/**
 * De oefeningen als eigen gegeven, los van het schema. Nodig voor het oefeningscherm,
 * de vervangfunctie en de video's. Zie bouwdocument-v1.md sectie 3.1.
 *
 * `step` en `minWeight` horen bij het apparaat, niet bij de oefening in het algemeen:
 * ze zijn ingevuld met 2,5 kg als aanname en moeten in de sportschool worden nagelopen.
 */
export interface Exercise {
  id: string
  name: string
  muscles: string
  helper?: string
  why: string
  cues: string[]
  /** Leeg, een pad naar public/video/, of een youtube-nocookie insluiting. */
  videoUrl?: string
  /** Kleinste verhoging op dit apparaat, in kilogram. */
  step: number
  /** Laagste gewicht dat dit apparaat kan. Een voorstel gaat hier nooit onder. */
  minWeight: number
  restSeconds: number
  /** Ids van oefeningen die dezelfde spieren dekken, voor 'Andere oefening'. */
  alternatives: string[]
}

export const exercises: Exercise[] = [
  {
    id: 'leg-press',
    name: 'Leg press',
    muscles: 'Bovenbenen en billen',
    helper: 'Je kuiten helpen mee.',
    why: 'De zwaarste beenoefening in je schema. Staat vooraan omdat je er fris voor moet zijn.',
    cues: ['Voeten op schouderbreedte', 'Knieën niet helemaal strekken', 'Onderrug tegen de leuning'],
    step: 5,
    minWeight: 20,
    restSeconds: 120,
    alternatives: ['hack-squat', 'goblet-squat'],
  },
  {
    id: 'leg-curl',
    name: 'Leg curl',
    muscles: 'Hamstrings',
    why: 'De tegenhanger van de leg press. Zonder deze train je de achterkant van je benen nauwelijks.',
    cues: ['Heupen tegen het kussen', 'Rustig terug laten komen'],
    step: 2.5,
    minWeight: 10,
    restSeconds: 120,
    alternatives: ['romanian-deadlift'],
  },
  {
    id: 'chest-press',
    name: 'Chest press',
    muscles: 'Borst en voorste schouder',
    helper: 'Je triceps helpt mee.',
    why: 'De grootste duwbeweging in je schema, en de oefening die je aandachtspunt bovenlichaam draagt.',
    cues: ['Rug tegen de leuning', 'Ellebogen niet verder naar achteren dan je schouders', 'Laatste stukje niet doorstrekken'],
    step: 2.5,
    minWeight: 10,
    restSeconds: 120,
    alternatives: ['dumbbell-press', 'incline-press', 'push-up'],
  },
  {
    id: 'row',
    name: 'Zittende row',
    muscles: 'Rug en achterste schouder',
    helper: 'Je biceps helpt mee.',
    why: 'Trekken naar je toe. Houdt je schouders in balans met al het duwwerk.',
    cues: ['Borst omhoog', 'Ellebogen langs je lichaam', 'Niet met je rug meeslingeren'],
    step: 2.5,
    minWeight: 10,
    restSeconds: 120,
    alternatives: ['chest-supported-row'],
  },
  {
    id: 'pulldown',
    name: 'Lat pulldown',
    muscles: 'Latissimus, de brede rugspier',
    why: 'Trekken van boven. Andere hoek dan de row, zelfde spiergroep.',
    cues: ['Tot je borst, niet achter je nek', 'Schouders omlaag houden'],
    step: 2.5,
    minWeight: 10,
    restSeconds: 120,
    alternatives: ['pull-up', 'row'],
  },
  {
    id: 'biceps-curl',
    name: 'Biceps curl',
    muscles: 'Biceps',
    why: 'Je biceps krijgt bij het trekken al werk; dit is de gerichte aanvulling.',
    cues: ['Ellebogen op hun plek', 'Niet met je bovenlichaam meehelpen'],
    step: 2.5,
    minWeight: 5,
    restSeconds: 90,
    alternatives: ['hammer-curl'],
  },
  {
    id: 'triceps-pushdown',
    name: 'Triceps pushdown',
    muscles: 'Triceps',
    why: 'Sluit het duwwerk af. Kleine spier, dus achteraan.',
    cues: ['Ellebogen tegen je zij', 'Volledig strekken zonder door te slaan'],
    step: 2.5,
    minWeight: 5,
    restSeconds: 90,
    alternatives: ['overhead-extension'],
  },
]

const index = new Map(exercises.map(exercise => [exercise.id, exercise]))

export function exercise(id: string): Exercise {
  const found = index.get(id)
  if (!found) throw new Error(`Onbekende oefening: ${id}`)
  return found
}

export const findExercise = (id: string) => index.get(id)
