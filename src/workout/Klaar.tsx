import { useState } from 'react'
import { findExercise } from './exercises'
import { inSchema, kiesPlateau, vastgelopen, type PlateauBesluit } from './finish'
import { naPlateau } from './rules'
import { formatWeight, minutenLabel, type ExerciseState, type Proposal, type SessionOutcome, type Workout, type WorkoutSet } from './model'

interface Props {
  outcome: SessionOutcome
  session: Workout
  sets: WorkoutSet[]
  voorstellen: Proposal[]
  toestanden: ExerciseState[]
  onTerug: () => void
  onFout: (melding: string) => void
}

const REDEN: Record<Proposal['reason'], string> = {
  'boven-bereik': 'bovenkant van je bereik',
  'onder-bereik': 'onder je bereik',
  'vasthouden': 'binnen je bereik',
  'pauze': 'eerste sessie na je pauze',
  'plateau': 'opnieuw opbouwen',
}

export function Klaar({ outcome, session, sets, voorstellen, toestanden, onTerug, onFout }: Props) {
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

  // Alleen wat deze sessie heeft opgeleverd. Openstaande voorstellen van oefeningen die
  // je vandaag niet deed horen hier niet: die komen van een eerdere keer.
  const vanNu = voorstellen.filter(item => item.sessionId === session.id)
  const zichtbaar = vanNu.filter(item => item.from !== item.to || item.reason !== 'vasthouden')
  const plateau = vastgelopen(outcome, vanNu, toestanden)[0]

  return (
    <div className="body">
      <p className="muted">{datum} · {minutenLabel(duur)}</p>
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

      {plateau && (
        <Plateau
          key={plateau} session={session} exerciseId={plateau}
          state={toestanden.find(item => item.exerciseId === plateau)}
          onFout={onFout}
        />
      )}
    </div>
  )
}

/**
 * Sectie 4.2. Dichttikken geldt als zo laten, met dezelfde vastlegging: anders komt
 * de vraag na een herberekening terug over iets waar je al overheen stapte.
 */
export function Plateau({ session, exerciseId, state, onFout }: {
  session: Workout
  exerciseId: string
  state?: ExerciseState
  onFout: (melding: string) => void
}) {
  const [stap, setStap] = useState<'keuze' | 'vervangen'>('keuze')
  const slot = session.snapshot.slots.find(item => item.exerciseId === exerciseId)
  const gewicht = state?.currentWeight
  if (!slot || gewicht == null) return null

  const lager = naPlateau('terug', gewicht, slot).weight
  const bovenkant = slot.sets.find(target => target.kind === 'work')?.repsMax
  const vervangbaar = inSchema(slot.id)
  const alternatieven = (findExercise(exerciseId)?.alternatives ?? [])
    .map(findExercise)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter(item => !session.snapshot.slots.some(other => other.exerciseId === item.id))

  async function kies(besluit: PlateauBesluit) {
    try { await kiesPlateau(session.id, exerciseId, besluit) }
    catch (error) { onFout(error instanceof Error ? error.message : 'Je keuze is niet opgeslagen.') }
  }

  return (
    <div className="sheet-wrap" onClick={() => kies({ keuze: 'laten' })}>
      <div className="sheet" onClick={event => event.stopPropagation()}>
        <div className="grip" />
        {stap === 'keuze' ? (
          <>
            <h1>{slot.name} staat stil</h1>
            <p className="sub">
              {state?.stalls ?? 3} sessies op rij op {formatWeight(gewicht)} kg zonder de {bovenkant} herhalingen
              te halen die je nodig hebt om zwaarder te gaan. Doorgaan op dit gewicht levert
              waarschijnlijk niets op.
            </p>
            {/* Op het laagste gewicht van het apparaat valt er niets terug te zetten. */}
            <button className="opt" disabled={lager >= gewicht} onClick={() => kies({ keuze: 'terug' })}>
              <span className="lbl">{lager < gewicht ? `Terug naar ${formatWeight(lager)} kg` : 'Terugzetten'}</span>
              <span className="eff">
                {lager < gewicht ? 'Opnieuw opbouwen, meestal kom je hoger uit' : 'Kan niet lager op dit apparaat'}
              </span>
            </button>
            <button className="opt" disabled={!vervangbaar || !alternatieven.length} onClick={() => setStap('vervangen')}>
              <span className="lbl">Andere oefening</span>
              <span className="eff">
                {!vervangbaar ? 'Staat niet in je schema' : alternatieven.length ? 'Zelfde spieren, ander apparaat' : 'Geen vervanger bekend'}
              </span>
            </button>
            <button className="opt" onClick={() => kies({ keuze: 'laten' })}>
              <span className="lbl">Zo laten</span>
              <span className="eff">Nog een keer {formatWeight(gewicht)} kg proberen</span>
            </button>
          </>
        ) : (
          <>
            <h1>Andere oefening</h1>
            <p className="sub">In plaats van {slot.name}, vanaf je volgende sessie</p>
            <div className="list2">
              {alternatieven.map(item => (
                <button className="kies" key={item.id} onClick={() => kies({ keuze: 'vervangen', door: item.id })}>
                  <span className="nm">{item.name}</span>
                  <span className="mt">{item.verschil}</span>
                </button>
              ))}
            </div>
            <p className="next">De nieuwe oefening neemt de plek van {slot.name} in je schema over, met eigen gewichten.</p>
          </>
        )}
      </div>
    </div>
  )
}
