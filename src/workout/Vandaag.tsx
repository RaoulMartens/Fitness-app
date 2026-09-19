import { findExercise } from './exercises'
import { formatWeight, localDate, targets, type Proposal, type Workout, type WorkoutSet } from './model'
import { dagenTussen, type VandaagToestand } from './rules'

interface Props {
  toestand: VandaagToestand
  vandaag: string
  session?: Workout
  sets: WorkoutSet[]
  voorstellen: Proposal[]
  laatsteSessieDag: string | null
  volgendeDag: string | null
  onFout: (melding: string) => void
  onStart: () => void
  onAfronden: () => void
}

const WEEKDAG = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

/** Zeven dagen vanaf vandaag, met de geplande trainingsdagen gevuld. */
function Weekstrook({ vandaag, trainingsdagen }: { vandaag: string; trainingsdagen: string[] }) {
  const dagen = Array.from({ length: 7 }, (_, index) => {
    const datum = new Date(`${vandaag}T12:00:00`)
    datum.setDate(datum.getDate() + index)
    return datum
  })
  return (
    <div className="week">
      {dagen.map(datum => {
        const dag = localDate(datum)
        const klassen = ['day']
        if (trainingsdagen.includes(dag)) klassen.push('train')
        if (dag === vandaag) klassen.push('today')
        return (
          <div className={klassen.join(' ')} key={dag}>
            <b>{datum.getDate()}</b>
            <span>{WEEKDAG[datum.getDay()]}</span>
          </div>
        )
      })}
    </div>
  )
}

export function Vandaag(props: Props) {
  const { toestand, vandaag, session, sets, voorstellen } = props
  const datumTekst = new Date(`${vandaag}T12:00:00`)
    .toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
  const trainingsdagen = props.volgendeDag ? [props.volgendeDag] : []
  if (toestand === 'trainen' || toestand === 'terug') trainingsdagen.push(vandaag)

  return (
    <div className="body">
      <p className="sub">{datumTekst}</p>
      <Weekstrook vandaag={vandaag} trainingsdagen={trainingsdagen} />

      {toestand === 'hervatten' && session && (
        <div className="card">
          <p className="muted">Onderbroken{session.startedAt ? `, ${hoelang(session.startedAt)}` : ''}</p>
          <h1>{session.snapshot.name}</h1>
          <div style={{ height: 10 }} />
          <Voortgang session={session} sets={sets} />
          <div style={{ height: 12 }} />
          <button className="btn" onClick={props.onStart}>Verder trainen</button>
          <button className="link" onClick={props.onAfronden}>Afronden zoals het nu is</button>
        </div>
      )}

      {toestand === 'vergeten' && session && (
        <>
          <div className="card">
            <p className="muted">Niet afgerond, {hoelang(session.startedAt)}</p>
            <h1>{session.snapshot.name}</h1>
            <div style={{ height: 10 }} />
            <Voortgang session={session} sets={sets} />
            <div style={{ height: 12 }} />
            <button className="btn" onClick={props.onAfronden}>Afronden zoals het was</button>
          </div>
          <p className="next">
            Verder trainen kan niet meer: tussen die sessie en nu zit te veel tijd om dit
            als één training te tellen.
          </p>
        </>
      )}

      {(toestand === 'trainen' || toestand === 'terug') && (
        <div className="card">
          {toestand === 'terug' && props.laatsteSessieDag && (
            <p className="muted">
              Eerste sessie sinds {new Date(`${props.laatsteSessieDag}T12:00:00`)
                .toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
            </p>
          )}
          <h1>Full-body</h1>
          <p className="sub">7 oefeningen · ongeveer 60 minuten</p>

          {toestand === 'terug'
            ? <>
                <div style={{ height: 12 }} />
                <div className="lab">Rustiger beginnen</div>
                <p className="sub" style={{ marginTop: 4 }}>
                  Alle oefeningen staan één stap lager. Haal je je bereik, dan sta je
                  volgende sessie weer op je oude gewicht.
                </p>
              </>
            : <Nieuw voorstellen={voorstellen} />}

          <div style={{ height: 16 }} />
          <button className="btn" onClick={props.onStart}>Start training</button>
        </div>
      )}

      {toestand === 'rustdag' && (
        <div className="card">
          <div className="lab">Geen training vandaag</div>
          <h1>Full-body</h1>
          <p className="sub">
            {props.volgendeDag
              ? `${new Date(`${props.volgendeDag}T12:00:00`).toLocaleDateString('nl-NL', { weekday: 'long' })}, ${beschrijfOver(vandaag, props.volgendeDag)}`
              : 'Nog niet ingepland'}
          </p>
        </div>
      )}
    </div>
  )
}

/** Wat er sinds je vorige sessie is veranderd aan de gewichten. */
function Nieuw({ voorstellen }: { voorstellen: Proposal[] }) {
  const gewijzigd = voorstellen.filter(item => item.from !== null && item.from !== item.to)
  if (!gewijzigd.length) return null
  return (
    <>
      <div style={{ height: 14 }} />
      <div className="lab">Nieuw vandaag</div>
      {gewijzigd.slice(0, 3).map(item => (
        <div className="mini" key={item.id}>
          <span>{findExercise(item.exerciseId)?.name ?? item.exerciseId}</span>
          <b>
            <i className={item.to > (item.from ?? 0) ? 'ar up' : 'ar down'}>
              {item.to > (item.from ?? 0) ? '↑' : '↓'}
            </i>
            {formatWeight(item.to)} kg
          </b>
        </div>
      ))}
      {gewijzigd.length > 3 && (
        <p className="plus">+ {gewijzigd.length - 3} andere oefeningen ook aangepast</p>
      )}
    </>
  )
}

function Voortgang({ session, sets }: { session: Workout; sets: WorkoutSet[] }) {
  const gedaan = new Set(sets.map(item => item.slotId))
  const volledig = new Set(
    session.snapshot.slots
      .filter(slot => slot.sets.every(target => sets.some(item => item.slotId === slot.id && item.number === target.number)))
      .map(slot => slot.id))
  const gedaanAantal = sets.length
  const totaal = targets(session.snapshot).length
  return (
    <>
      <div className="segs">
        {session.snapshot.slots.map(slot => (
          <i key={slot.id} className={volledig.has(slot.id) ? 'on' : gedaan.has(slot.id) ? 'half' : ''} />
        ))}
      </div>
      <p className="sub" style={{ marginTop: 6 }}>{gedaanAantal} van {totaal} sets vastgelegd</p>
    </>
  )
}

function hoelang(vanaf: string) {
  const minuten = Math.round((Date.now() - Date.parse(vanaf)) / 60_000)
  if (minuten < 60) return `${minuten} minuten geleden`
  const uren = Math.round(minuten / 60)
  if (uren < 24) return `${uren} uur geleden`
  return `${Math.round(uren / 24)} dagen geleden`
}

function beschrijfOver(vandaag: string, dag: string) {
  const dagen = dagenTussen(vandaag, dag)
  if (dagen <= 0) return 'vandaag'
  if (dagen === 1) return 'morgen'
  return `over ${dagen} dagen`
}
