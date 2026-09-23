import { herstelOefening } from './db'
import { findExercise } from './exercises'
import {
  formatWeight, localDate, starterProgram, timerLabel, TOEGEVOEGD,
  type ExerciseState, type Program, type SessionOutcome,
} from './model'
import type { Route } from './route'
import { geplandeDagen } from './rules'
import { Video } from './Video'

type Ga = (route: Route, opties?: { vervang?: boolean }) => void

const WEEKDAGEN = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

/** Wat je doet en wanneer. Het schema zelf is in v1 vast; de kalender volgt je sessies. */
export function Programma({ schema, outcomes, vandaag, ga }: {
  schema: Program
  outcomes: SessionOutcome[]
  vandaag: string
  ga: Ga
}) {
  // Vorige, deze en volgende week. Beginnen bij deze week zou op maandag geen enkele
  // gedane sessie laten zien, en je laatste training van zondag viel er dan af.
  const start = new Date(`${vandaag}T12:00:00`)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 7)
  const dagen = Array.from({ length: 21 }, (_, index) => {
    const datum = new Date(start)
    datum.setDate(start.getDate() + index)
    return datum
  })
  const laatsteDag = localDate(dagen[20])
  const gedaan = new Set(outcomes.map(item => item.sessionDay))
  const laatste = outcomes.map(item => item.sessionDay).sort().at(-1) ?? null
  const gepland = new Set(geplandeDagen(laatste, vandaag, laatsteDag))

  const maand = (datum: Date) => datum.toLocaleDateString('nl-NL', { month: 'long' })
  const eerste = maand(dagen[0]), tweede = maand(dagen[20])
  const kop = eerste === tweede ? eerste : `${eerste} – ${tweede}`

  return (
    <div className="body">
      <h1>{schema.name}</h1>
      <p>
        Ongeveer twee keer per week je hele lichaam, met extra aandacht voor je bovenlichaam.
        Tussen twee sessies zitten minstens twee dagen rust.
      </p>
      <button className="nav" onClick={() => ga({ naam: 'oefeningen' })}>
        <div><b>De oefeningen</b><span>{schema.slots.length} stuks · ongeveer 60 minuten</span></div>
      </button>

      <h2>{kop.charAt(0).toUpperCase() + kop.slice(1)}</h2>
      <div className="calbox">
        <div className="calrow head">{WEEKDAGEN.map(dag => <span key={dag}>{dag}</span>)}</div>
        {[0, 1, 2].map(week => (
          <div className="calrow" key={week}>
            {dagen.slice(week * 7, week * 7 + 7).map(datum => {
              const dag = localDate(datum)
              const klassen = ['cday']
              if (gedaan.has(dag)) klassen.push('done')
              else if (gepland.has(dag)) klassen.push('plan')
              if (dag === vandaag) klassen.push('today')
              return <span className={klassen.join(' ')} key={dag}>{datum.getDate()}</span>
            })}
          </div>
        ))}
      </div>

      <button className="nav" onClick={() => ga({ naam: 'instellingen' })}>
        <div><b>Instellingen</b><span>De vaste regels, en je gegevens wissen</span></div>
      </button>
    </div>
  )
}

/** De oefeningen van het schema, in de volgorde waarin je ze doet. */
export function Oefeningen({ schema, toestanden, ga }: {
  schema: Program
  toestanden: ExerciseState[]
  ga: Ga
}) {
  return (
    <>
      <div className="bar">
        <button className="terug" onClick={() => ga({ naam: 'programma' })}>‹ Terug</button>
        <span className="title">De oefeningen</span>
        <span />
      </div>
      <div className="body">
        <div className="facts">
          <div><b>{schema.slots.length}</b><span>oefeningen</span></div>
          <div><b>±60</b><span>minuten</span></div>
        </div>
        <div className="list2">
          {schema.slots.map((slot, index) => {
            const werksets = slot.sets.filter(target => target.kind === 'work').length
            const getild = toestanden.find(item => item.exerciseId === slot.exerciseId)?.lastUsedWeight
            return (
              <button className="kies" key={slot.id}
                onClick={() => ga({ naam: 'oefening', exerciseId: slot.exerciseId, van: 'programma' })}>
                <span className="n">{index + 1}</span>
                <span className="nm">{slot.name}</span>
                <span className="mt">{getild != null ? `${werksets} × ${formatWeight(getild)} kg` : 'nog niet gedaan'}</span>
              </button>
            )
          })}
        </div>
        <p className="next">Benen eerst, dan duwen, dan trekken, armen als laatste. Rechts staat wat je vorige keer deed.</p>
      </div>
    </>
  )
}

/**
 * Waarom deze oefening, en hoe. Vanuit Voortgang kan hier ook een oefening staan die
 * niet in het schema zit; dan gelden de vaste waarden van een toegevoegde oefening.
 */
export function Oefening({ exerciseId, van, schema, toestanden, vervangingen, ga, onFout }: {
  exerciseId: string
  van: 'programma' | 'voortgang'
  schema: Program
  toestanden: ExerciseState[]
  vervangingen: Record<string, string>
  ga: Ga
  onFout: (melding: string) => void
}) {
  const terug = () => ga(van === 'programma' ? { naam: 'oefeningen' } : { naam: 'voortgang' })
  const exercise = findExercise(exerciseId)
  const balk = (titel: string) => (
    <div className="bar">
      <button className="terug" onClick={terug}>‹ Terug</button>
      <span className="title">{titel}</span>
      <span />
    </div>
  )
  if (!exercise) {
    return <>{balk('Oefening')}<div className="body"><p>Deze oefening staat niet meer in de lijst.</p></div></>
  }

  const slot = schema.slots.find(item => item.exerciseId === exerciseId)
  const werk = slot?.sets.filter(target => target.kind === 'work') ?? []
  const bereik = werk[0] ?? { repsMin: TOEGEVOEGD.repsMin, repsMax: TOEGEVOEGD.repsMax, rir: { min: 2, max: 3 } }
  const getild = toestanden.find(item => item.exerciseId === exerciseId)?.lastUsedWeight
  // Staat deze oefening op de plek van een andere, dan kun je die plek teruggeven.
  const origineel = slot && vervangingen[slot.id] ? starterProgram.slots.find(item => item.id === slot.id) : undefined

  async function herstel() {
    if (!slot || !origineel) return
    try {
      await herstelOefening(slot.id)
      ga({ naam: 'oefening', exerciseId: origineel.exerciseId, van }, { vervang: true })
    } catch (error) {
      onFout(error instanceof Error ? error.message : 'Terugzetten lukte niet.')
    }
  }

  return (
    <>
      {balk(exercise.name)}
      <div className="body">
        <div className="facts">
          <div><b>{werk.length || TOEGEVOEGD.sets}</b><span>werksets</span></div>
          <div><b>{bereik.repsMin}–{bereik.repsMax}</b><span>herhalingen</span></div>
          <div><b>{getild != null ? `${formatWeight(getild)} kg` : '—'}</b><span>laatste</span></div>
        </div>
        <p className="next">Stop elke set met {bereik.rir.min} tot {bereik.rir.max} herhalingen over.</p>

        <div className="muscle">
          <div className="figure" />
          <div>
            <p><b>{exercise.muscles}</b></p>
            {exercise.helper && <p className="sub">{exercise.helper}</p>}
            <p className="sub">{exercise.why}</p>
          </div>
        </div>

        <Video url={exercise.videoUrl} />
        <div className="rest"><span>Rust na elke set</span><span className="t">{timerLabel(exercise.restSeconds * 1000)}</span></div>

        {origineel && (
          <>
            <p className="next">Staat in je schema op de plek van {origineel.name}.</p>
            <button className="link" onClick={herstel}>Terug naar {origineel.name}</button>
          </>
        )}
        {van === 'programma' && (
          <button className="link" onClick={() => ga({ naam: 'voortgang' })}>Je verloop op deze oefening</button>
        )}
      </div>
    </>
  )
}
