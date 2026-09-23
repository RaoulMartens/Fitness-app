/**
 * De oefeningen als eigen gegeven, los van het schema. Nodig voor het oefeningscherm,
 * de vervangfunctie en de video's. Zie bouwdocument-v1.md sectie 3.1.
 *
 * `step` en `minWeight` horen bij het apparaat, niet bij de oefening in het algemeen:
 * ze zijn ingevuld met 2,5 kg als aanname en moeten in de sportschool worden nagelopen.
 *
 * De eerste zeven staan in het schema; de rest bestaat alleen als vervanger. Oefeningen
 * op puur lichaamsgewicht staan er niet in: elke set heeft hier een gewicht, en een
 * push-up zonder gewicht zou de progressieregels betekenisloos maken.
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
  /** Waarin deze zich onderscheidt van de rest. Staat in de vervangerslijst, waar
   *  de spiergroep niets toevoegt omdat die per definitie gelijk is. */
  verschil: string
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
    verschil: 'vaste baan',
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
    verschil: 'apparaat',
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
    verschil: 'vaste baan',
    alternatives: ['dumbbell-press', 'incline-press'],
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
    verschil: 'vrij zittend',
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
    verschil: 'van boven',
    alternatives: ['chest-supported-row', 'row'],
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
    verschil: 'handpalmen omhoog',
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
    verschil: 'naar beneden',
    alternatives: ['overhead-extension'],
  },
  {
    id: 'hack-squat',
    name: 'Hack squat',
    muscles: 'Bovenbenen en billen',
    why: 'Zelfde werk als de leg press, met je rug tegen een schuine steun.',
    cues: ['Voeten iets naar voren', 'Knieën in lijn met je tenen'],
    step: 5,
    minWeight: 20,
    restSeconds: 120,
    verschil: 'rug gesteund',
    alternatives: ['leg-press', 'goblet-squat'],
  },
  {
    id: 'goblet-squat',
    name: 'Goblet squat',
    muscles: 'Bovenbenen en billen',
    helper: 'Je romp werkt mee om rechtop te blijven.',
    why: 'Met een losse halter, voor als beide beenapparaten bezet zijn.',
    cues: ['Halter tegen je borst', 'Rechtop blijven', 'Hakken op de grond'],
    step: 2.5,
    minWeight: 5,
    restSeconds: 120,
    verschil: 'losse halter',
    alternatives: ['leg-press', 'hack-squat'],
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian deadlift',
    muscles: 'Hamstrings en billen',
    why: 'Rekt de achterkant van je benen onder belasting. Alternatief voor de leg curl.',
    cues: ['Lichte kniebuiging vasthouden', 'Heupen naar achteren', 'Rug recht'],
    step: 2.5,
    minWeight: 20,
    restSeconds: 120,
    verschil: 'vrije oefening',
    alternatives: ['leg-curl'],
  },
  {
    id: 'dumbbell-press',
    name: 'Dumbbell press',
    muscles: 'Borst en voorste schouder',
    helper: 'Je triceps helpt mee.',
    why: 'Losse gewichten, dus elke kant doet zijn eigen werk.',
    cues: ['Polsen recht boven je ellebogen', 'Niet tegen elkaar tikken bovenin'],
    step: 2.5,
    minWeight: 5,
    restSeconds: 120,
    verschil: 'losse gewichten',
    alternatives: ['chest-press', 'incline-press'],
  },
  {
    id: 'incline-press',
    name: 'Incline press',
    muscles: 'Bovenste borst en schouder',
    helper: 'Je triceps helpt mee.',
    why: 'Zelfde duwbeweging onder een andere hoek.',
    cues: ['Rug tegen de leuning', 'Ellebogen iets naar binnen'],
    step: 2.5,
    minWeight: 10,
    restSeconds: 120,
    verschil: 'andere hoek',
    alternatives: ['chest-press', 'dumbbell-press'],
  },
  {
    id: 'chest-supported-row',
    name: 'Chest supported row',
    muscles: 'Rug en achterste schouder',
    why: 'Trekken met je borst tegen een steun, zodat je onderrug niet meedoet.',
    cues: ['Borst tegen het kussen', 'Schouderbladen naar elkaar'],
    step: 2.5,
    minWeight: 10,
    restSeconds: 120,
    verschil: 'borst gesteund',
    alternatives: ['row', 'pulldown'],
  },
  {
    id: 'hammer-curl',
    name: 'Hammer curl',
    muscles: 'Biceps en onderarm',
    why: 'Zelfde beweging met je duimen omhoog, waardoor je onderarm meer werk krijgt.',
    cues: ['Ellebogen op hun plek', 'Rustig laten zakken'],
    step: 2.5,
    minWeight: 5,
    restSeconds: 90,
    verschil: 'duimen omhoog',
    alternatives: ['biceps-curl'],
  },
  {
    id: 'overhead-extension',
    name: 'Triceps extension boven je hoofd',
    muscles: 'Triceps',
    why: 'Andere hoek dan de pushdown, waardoor de lange kop van je triceps meer werk krijgt.',
    cues: ['Ellebogen naar voren gericht', 'Niet in je nek laten zakken'],
    step: 2.5,
    minWeight: 5,
    restSeconds: 90,
    verschil: 'boven je hoofd',
    alternatives: ['triceps-pushdown'],
  },
]

const index = new Map(exercises.map(exercise => [exercise.id, exercise]))

export function exercise(id: string): Exercise {
  const found = index.get(id)
  if (!found) throw new Error(`Onbekende oefening: ${id}`)
  return found
}

export const findExercise = (id: string) => index.get(id)
