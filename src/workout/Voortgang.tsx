import { findExercise } from './exercises'
import { afgerondeOefeningen } from './finish'
import {
  formatWeight, minutenLabel,
  type ExerciseState, type Program, type SessionOutcome, type Workout, type WorkoutSet,
} from './model'
import type { Route } from './route'

type Ga = (route: Route, opties?: { vervang?: boolean }) => void

const duur = (session: Workout, outcome: SessionOutcome) =>
  Math.max(1, Math.round((Date.parse(outcome.finishedAt) - Date.parse(session.startedAt)) / 60_000))

/** "Donderdag 18 sep", zonder de punt die nl-NL achter de afkorting zet. */
const korteDatum = (dag: string) => {
  const tekst = new Date(`${dag}T12:00:00`)
    .toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'short' })
    .replace('.', '')
  return tekst.charAt(0).toUpperCase() + tekst.slice(1)
}

/**
 * Per oefening waar je staat, en elke sessie die je hebt gedaan. Rekent niets nieuws
 * uit: alles komt uit de toestand die afronden al heeft bijgehouden.
 */
export function Voortgang({ schema, outcomes, sessions, sets, toestanden, ga }: {
  schema: Program
  outcomes: SessionOutcome[]
  sessions: Workout[]
  sets: WorkoutSet[]
  toestanden: ExerciseState[]
  ga: Ga
}) {
  if (!outcomes.length) {
    return (
      <div className="body">
        <h1>Voortgang</h1>
        <p>Na je eerste sessie zie je hier per oefening waar je staat, en elke sessie die je hebt gedaan.</p>
      </div>
    )
  }

  // Eerst in de volgorde van het schema, daarna wat je ooit achteraan toevoegde.
  const volgorde = schema.slots.map(slot => slot.exerciseId)
  const rangorde = (id: string) => { const plek = volgorde.indexOf(id); return plek === -1 ? volgorde.length : plek }
  const oefeningen = toestanden
    .filter(state => state.lastUsedWeight !== null)
    .sort((a, b) => rangorde(a.exerciseId) - rangorde(b.exerciseId) || a.exerciseId.localeCompare(b.exerciseId))
  const nieuwsteEerst = [...outcomes].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))
  const eersteDag = outcomes.map(item => item.sessionDay).sort()[0]

  return (
    <div className="body">
      <p className="muted">
        Sinds {new Date(`${eersteDag}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
        {' · '}{outcomes.length} {outcomes.length === 1 ? 'sessie' : 'sessies'}
      </p>

      <div className="list2">
        {oefeningen.map(state => {
          const nu = state.lastUsedWeight!
          const doel = state.currentWeight
          const omlaag = doel !== null && doel < nu
          return (
            <button className="p2" key={state.exerciseId}
              onClick={() => ga({ naam: 'oefening', exerciseId: state.exerciseId, van: 'voortgang' })}>
              <span className="top">
                <b>{findExercise(state.exerciseId)?.name ?? state.exerciseId}</b>
                <span className="now">{formatWeight(nu)} kg</span>
              </span>
              <span className="bot">
                {state.startWeight !== null && <span>start {formatWeight(state.startWeight)}</span>}
                {/* Zoals op Klaar: zonder verhoging leest een los blokje als een lege checkbox. */}
                {state.increases > 0 && (
                  <span className="steps">
                    {Array.from({ length: Math.min(state.increases, 8) }, (_, index) => <i className="on" key={index} />)}
                    <i className={omlaag ? 'back' : 'next'} />
                  </span>
                )}
                <span className="doel">
                  {doel === null ? '' : doel > nu ? `doel ${formatWeight(doel)}` : omlaag ? `terug naar ${formatWeight(doel)}` : 'eerst vasthouden'}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <h2>Sessies</h2>
      <div className="list2">
        {nieuwsteEerst.map(outcome => {
          const session = sessions.find(item => item.id === outcome.sessionId)
          if (!session) return null
          const eigen = sets.filter(item => item.sessionId === session.id)
          const afgerond = afgerondeOefeningen(session, eigen)
          const totaal = session.snapshot.slots.length
          return (
            <button className="kies" key={outcome.sessionId}
              onClick={() => ga({ naam: 'historie', sessionId: outcome.sessionId })}>
              <span className="nm">{korteDatum(outcome.sessionDay)}</span>
              <span className="mt">
                {duur(session, outcome)} min · {afgerond === totaal ? 'compleet' : `${afgerond} van ${totaal} oefeningen`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Een afgelopen sessie terugkijken. Alleen lezen: achteraf aanpassen blijft buiten v1
 * (bouwdocument sectie 11), omdat een wijziging een voorstel kan veranderen dat een
 * latere sessie al gebruikt heeft.
 */
export function Historie({ sessionId, outcomes, sessions, sets, ga }: {
  sessionId: string
  outcomes: SessionOutcome[]
  sessions: Workout[]
  sets: WorkoutSet[]
  ga: Ga
}) {
  const session = sessions.find(item => item.id === sessionId)
  const outcome = outcomes.find(item => item.sessionId === sessionId)
  const balk = (titel: string) => (
    <div className="bar">
      <button className="terug" onClick={() => ga({ naam: 'voortgang' })}>‹ Terug</button>
      <span className="title">{titel}</span>
      <span />
    </div>
  )
  if (!session || !outcome) {
    return <>{balk('Sessie')}<div className="body"><p>Deze sessie bestaat niet meer.</p></div></>
  }

  const eigen = sets.filter(item => item.sessionId === sessionId)
  const afgerond = afgerondeOefeningen(session, eigen)
  const totaal = session.snapshot.slots.length

  return (
    <>
      {balk(korteDatum(outcome.sessionDay))}
      <div className="body">
        <p className="muted">
          {minutenLabel(duur(session, outcome))} · {afgerond === totaal ? `alle ${totaal} oefeningen` : `${afgerond} van ${totaal} oefeningen`}
        </p>
        {session.snapshot.slots.map(slot => {
          const gedaan = slot.sets
            .map(target => ({ target, record: eigen.find(item => item.slotId === slot.id && item.number === target.number) }))
            .filter(item => item.record)
          if (!gedaan.length) return null
          let teller = 0
          return (
            <div key={slot.id} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <h2>{slot.name}</h2>
              <div className="set head hist"><span>Set</span><span>Kg</span><span>Herh</span></div>
              {gedaan.map(({ target, record }) => {
                const warmup = target.kind === 'warmup'
                if (!warmup) teller++
                return (
                  <div className="set done hist" key={target.number}>
                    <span className={warmup ? 'num w' : 'num'}>{warmup ? 'warming-up' : teller}</span>
                    <span className="in">{formatWeight(record!.weight)}</span>
                    <span className="in">{record!.reps}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </>
  )
}
