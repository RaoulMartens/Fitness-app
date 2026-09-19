import { findExercise } from './exercises'
import { formatWeight, type ExerciseState, type Proposal, type SessionOutcome, type Workout, type WorkoutSet } from './model'

interface Props {
  outcome: SessionOutcome
  session: Workout
  sets: WorkoutSet[]
  voorstellen: Proposal[]
  toestanden: ExerciseState[]
  onTerug: () => void
}

const REDEN: Record<Proposal['reason'], string> = {
  'boven-bereik': 'bovenkant van je bereik',
  'onder-bereik': 'onder je bereik',
  'vasthouden': 'binnen je bereik',
  'pauze': 'eerste sessie na je pauze',
  'plateau': 'stond te lang stil',
}

export function Klaar({ outcome, session, sets, voorstellen, toestanden, onTerug }: Props) {
  const gedaan = new Set(sets.map(item => item.slotId))
  const volledig = new Set(
    session.snapshot.slots
      .filter(slot => slot.sets.every(target =>
        sets.some(item => item.slotId === slot.id && item.number === target.number)))
      .map(slot => slot.id))

  const duur = Math.max(1, Math.round(
    (Date.parse(outcome.finishedAt) - Date.parse(session.startedAt)) / 60_000))
  const datum = new Date(`${outcome.sessionDay}T12:00:00`)
    .toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

  const zichtbaar = voorstellen.filter(item => item.from !== item.to || item.reason !== 'vasthouden')

  return (
    <div className="body">
      <p className="muted">{datum} · {duur} minuten</p>
      <h1>{outcome.finishedPartially ? `${session.snapshot.name}, eerder gestopt` : `${session.snapshot.name} afgerond`}</h1>

      <div className="segs">
        {session.snapshot.slots.map(slot => (
          <i key={slot.id} className={volledig.has(slot.id) ? 'on' : gedaan.has(slot.id) ? 'half' : ''} />
        ))}
      </div>

      {zichtbaar.length > 0 && <h2>Volgende keer</h2>}
      {zichtbaar.length > 0 && (
        <div className="list2">
          {zichtbaar.map(item => {
            const naam = findExercise(item.exerciseId)?.name ?? item.exerciseId
            const state = toestanden.find(toestand => toestand.exerciseId === item.exerciseId)
            const omhoog = item.from !== null && item.to > item.from
            const omlaag = item.from !== null && item.to < item.from
            return (
              <div className="p2" key={item.id}>
                <span className="top">
                  <b>{naam}</b>
                  <span className="now">
                    {omhoog && <i className="ar up">↑ </i>}
                    {omlaag && <i className="ar down">↓ </i>}
                    {formatWeight(item.to)} kg
                  </span>
                </span>
                <span className="bot">
                  <span>{item.from === null ? 'eerste keer' : `was ${formatWeight(item.from)}`}</span>
                  {(state?.increases ?? 0) > 0 && (
                    <span className="steps">
                      {Array.from({ length: Math.min(state!.increases, 8) }, (_, index) => <i className="on" key={index} />)}
                      <i className={omlaag ? 'back' : 'next'} />
                    </span>
                  )}
                  <span className="doel">{REDEN[item.reason]}</span>
                </span>
              </div>
            )
          })}
        </div>
      )}

      {zichtbaar.length === 0 && (
        <p className="next">Geen gewicht verandert. Je zat overal binnen je bereik.</p>
      )}

      {outcome.finishedPartially && (
        <p className="next">
          Wat je niet hebt gedaan telt niet mee: die oefeningen blijven staan waar ze stonden.
        </p>
      )}

      <div style={{ marginTop: 'auto' }}>
        <button className="btn" onClick={onTerug}>Terug naar Vandaag</button>
      </div>
    </div>
  )
}
