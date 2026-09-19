import { useEffect, useRef, useState } from 'react'
import { changeWorkout, logSet, workoutDb, writeDraft } from './db'
import { findExercise } from './exercises'
import { finishWorkout } from './finish'
import {
  draftVersions, formatWeight, pendingTargets, recordId, restRemaining, targets, timerLabel,
  type Workout, type WorkoutDraft, type WorkoutSet,
} from './model'
import { magVastleggen } from './rules'
import { useWakeLock } from './useWakeLock'

interface Props {
  session: Workout
  sets: WorkoutSet[]
  drafts: WorkoutDraft[]
  onFout: (melding: string) => void
  onKlaar: () => void
}

/**
 * De waarden waarmee een set opent. Zonder historie het laagste gewicht van het
 * apparaat: een veld dat een getal toont maar leeg is, laat zich niet vastleggen.
 */
function beginwaarden(exerciseId: string, target: { weight: number | null; repsMin: number }, vorige?: WorkoutSet) {
  const minWeight = findExercise(exerciseId)?.minWeight ?? 0
  return {
    weight: target.weight ?? vorige?.weight ?? minWeight,
    reps: vorige?.reps ?? target.repsMin,
  }
}

export function Sessie({ session, sets, drafts, onFout, onKlaar }: Props) {
  const open = pendingTargets(session)
  const huidig = open[0]
  const slot = huidig?.slot
  const alle = targets(session.snapshot)
  const rust = restRemaining(session)

  useWakeLock(Boolean(session.rest))

  // Aftellen laten meelopen zonder de opslag aan te raken: de eindtijd staat vast.
  const [, tik] = useState(0)
  useEffect(() => {
    if (!session.rest) return
    const timer = setInterval(() => tik(value => value + 1), 500)
    return () => clearInterval(timer)
  }, [session.rest])

  const vorigeSets = useDeVorigeKeer(slot?.exerciseId)
  const vorige = vorigeSets.find(item => item.number === huidig?.target.number)
  const start = huidig ? beginwaarden(huidig.slot.exerciseId, huidig.target, vorige) : { weight: null, reps: 8 }

  const [weight, setWeight] = useState<number | null>(start.weight)
  const [reps, setReps] = useState<number>(start.reps)
  const gezet = useRef<string | null>(null)

  // Bij een nieuwe set opnieuw beginnen bij wat er vorige keer stond.
  useEffect(() => {
    if (!huidig || gezet.current === huidig.id) return
    gezet.current = huidig.id
    setWeight(start.weight)
    setReps(start.reps)
  }, [huidig?.id, start.weight, start.reps])

  if (!slot || !huidig) {
    return <Afgerond session={session} onFout={onFout} onKlaar={onKlaar} />
  }

  const exercise = findExercise(slot.exerciseId)
  const gedaanPerOefening = new Set(sets.map(item => item.slotId))
  const index = session.snapshot.slots.findIndex(item => item.id === slot.id)
  const hierna = session.snapshot.slots[index + 1]

  async function vastleggen() {
    if (!magVastleggen(weight, reps)) return onFout('Vul een gewicht en een heel aantal herhalingen in.')
    try {
      const concept = drafts.find(item => item.id === huidig.id)
      const geschreven = await writeDraft({
        id: huidig.id, sessionId: session.id,
        weight: String(weight).replace('.', ','), reps: String(reps),
        revision: concept?.revision ?? 0, updatedAt: new Date().toISOString(),
      }, concept?.revision ?? 0)
      await logSet(geschreven, session.revision)
    } catch (error) {
      onFout(error instanceof Error ? error.message : 'Er ging iets mis. Je invoer staat nog in beeld.')
    }
  }

  async function rustOverslaan() {
    try { await changeWorkout(session.id, session.revision, 'next-set') }
    catch (error) { onFout(error instanceof Error ? error.message : 'Er ging iets mis.') }
  }

  const laatsteVanOefening = !open.slice(1).some(item => item.slot.id === slot.id)

  return (
    <div className="screen">
      <div className={session.rest ? 'kop rust' : 'kop'}>
        <div className="segs">
          {session.snapshot.slots.map(item => {
            const klaar = !open.some(open => open.slot.id === item.id)
            const bezig = gedaanPerOefening.has(item.id) && !klaar
            return <i key={item.id} className={klaar ? 'on' : bezig ? 'half' : ''} />
          })}
        </div>
        <div className="line">
          <span className="big">{session.rest ? `Rust · ${timerLabel(rust)}` : slot.name}</span>
          <span className="sm">{session.rest ? slot.name : hierna ? `Hierna: ${hierna.name}` : 'Laatste oefening'}</span>
        </div>
      </div>

      <div className="body">
        <Video url={exercise?.videoUrl} />

        <div className="set head">
          <span>Set</span><span>Vorige</span><span>Kg</span>
          <span>Herh {huidig.target.repsMin}–{huidig.target.repsMax}</span><span />
        </div>

        {slot.sets.map(target => {
          const id = recordId(session.id, slot.id, target.number)
          const record = sets.find(item => item.id === id)
          const eerder = vorigeSets.find(item => item.number === target.number)
          const label = target.kind === 'warmup' ? 'W' : String(target.number)
          const vorigeTekst = target.kind === 'warmup'
            ? '—'
            : eerder ? `${formatWeight(eerder.weight)} × ${eerder.reps}` : '—'

          if (record) {
            return (
              <div className="set done" key={target.number}>
                <span className="num">{label}</span>
                <span className="prev">{vorigeTekst}</span>
                <span className="in">{formatWeight(record.weight)}</span>
                <span className="in">{record.reps}</span>
                <span className="tick">✓</span>
              </div>
            )
          }
          if (id !== huidig.id || session.rest) {
            return (
              <div className="set" key={target.number}>
                <span className="num">{label}</span>
                <span className="prev">{vorigeTekst}</span>
                <span className="in">—</span><span className="in">—</span>
                <span className="tick">○</span>
              </div>
            )
          }
          return (
            <Stappers
              key={target.number}
              label={vorigeTekst === '—' ? (target.kind === 'warmup' ? 'warming-up' : `set ${target.number}`) : vorigeTekst}
              exerciseId={slot.exerciseId}
              weight={weight} reps={reps}
              onWeight={setWeight} onReps={setReps}
            />
          )
        })}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {session.rest
            ? <button className="btn" onClick={rustOverslaan}>
                {laatsteVanOefening && hierna ? `Verder met ${hierna.name}` : 'Verder'}
              </button>
            : <button className="btn" onClick={vastleggen}>Set vastleggen</button>}
          <div className="links">
            <Afronden session={session} drafts={drafts} onFout={onFout} onKlaar={onKlaar} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** De sets van dezelfde oefening uit de vorige afgeronde sessie. */
function useDeVorigeKeer(exerciseId: string | undefined) {
  const [records, setRecords] = useState<WorkoutSet[]>([])
  useEffect(() => {
    let geldig = true
    if (!exerciseId) return
    void (async () => {
      const laatste = await workoutDb.outcomes.orderBy('finishedAt').reverse().first()
      if (!laatste) return
      const gevonden = await workoutDb.sets
        .where('sessionId').equals(laatste.sessionId)
        .filter(item => item.exerciseId === exerciseId)
        .toArray()
      if (geldig) setRecords(gevonden)
    })()
    return () => { geldig = false }
  }, [exerciseId])
  return records
}

function Stappers(props: {
  label: string
  exerciseId: string
  weight: number | null
  reps: number
  onWeight: (value: number) => void
  onReps: (value: number) => void
}) {
  const exercise = findExercise(props.exerciseId)
  const step = exercise?.step ?? 2.5
  const minWeight = exercise?.minWeight ?? 0
  const weight = props.weight ?? minWeight
  const rond = (value: number) => Math.round(value * 100) / 100

  return (
    <div className="set inline">
      <span className="num">{props.label}</span>
      <button onClick={() => props.onWeight(Math.max(minWeight, rond(weight - step)))} aria-label="Gewicht omlaag">−</button>
      <button className="val" onClick={() => typen(weight, props.onWeight)} aria-label="Gewicht intypen">{formatWeight(weight)}</button>
      <button onClick={() => props.onWeight(rond(weight + step))} aria-label="Gewicht omhoog">+</button>
      <button onClick={() => props.onReps(Math.max(1, props.reps - 1))} aria-label="Herhaling minder">−</button>
      <button className="val" onClick={() => typen(props.reps, value => props.onReps(Math.round(value)))} aria-label="Herhalingen intypen">{props.reps}</button>
      <button onClick={() => props.onReps(props.reps + 1)} aria-label="Herhaling meer">+</button>
    </div>
  )
}

/** De uitzondering: een getal ver van het huidige, bijvoorbeeld na een typefout. */
function typen(huidig: number, zet: (value: number) => void) {
  const antwoord = prompt('Getal intypen', String(huidig).replace('.', ','))
  if (antwoord === null) return
  const waarde = Number(antwoord.replace(',', '.'))
  if (Number.isFinite(waarde) && waarde >= 0) zet(waarde)
}

function Video({ url }: { url?: string }) {
  const [speelt, setSpeelt] = useState(false)
  if (!url) return <div className="video" aria-label="Nog geen video" />
  if (!speelt) return <button className="video" onClick={() => setSpeelt(true)} aria-label="Video afspelen" />
  if (url.endsWith('.mp4')) {
    return <div className="video speelt"><video src={url} autoPlay muted playsInline controls /></div>
  }
  return (
    <div className="video speelt">
      <iframe src={`${url}${url.includes('?') ? '&' : '?'}autoplay=1&mute=1&playsinline=1`}
        title="Uitvoering" allow="autoplay; encrypted-media" />
    </div>
  )
}

function Afronden({ session, drafts, onFout, onKlaar }: {
  session: Workout; drafts: WorkoutDraft[]; onFout: (m: string) => void; onKlaar: () => void
}) {
  const [vraagt, setVraagt] = useState(false)
  const open = pendingTargets(session)
  const alles = open.length === 0

  async function afronden() {
    try {
      await finishWorkout({ sessionId: session.id, action: alles ? 'complete' : 'abort' })
      onKlaar()
    } catch (error) {
      onFout(error instanceof Error ? error.message : 'Afronden lukte niet. Je sets staan nog opgeslagen.')
    }
  }

  return (
    <>
      <button className="link" onClick={() => setVraagt(true)}>Sessie afronden</button>
      {vraagt && (
        <div className="sheet-wrap" onClick={() => setVraagt(false)}>
          <div className="sheet" onClick={event => event.stopPropagation()}>
            <div className="grip" />
            <h1>{alles ? 'Alles gedaan' : 'Nu afronden?'}</h1>
            <p className="sub">
              {alles
                ? 'Je hebt alle oefeningen gehad.'
                : `Je hebt nog ${open.length} ${open.length === 1 ? 'set' : 'sets'} openstaan. Wat je hebt ingevuld blijft bewaard.`}
            </p>
            <button className="btn" onClick={afronden}>Afronden</button>
          </div>
        </div>
      )}
    </>
  )
}

/** Alles gedaan, maar nog niet afgerond. */
function Afgerond({ session, onFout, onKlaar }: { session: Workout; onFout: (m: string) => void; onKlaar: () => void }) {
  async function afronden() {
    try {
      await finishWorkout({ sessionId: session.id })
      onKlaar()
    } catch (error) {
      onFout(error instanceof Error ? error.message : 'Afronden lukte niet.')
    }
  }
  return (
    <div className="screen">
      <div className="kop">
        <div className="segs">{session.snapshot.slots.map(slot => <i key={slot.id} className="on" />)}</div>
        <div className="line"><span className="big">Alles gedaan</span><span className="sm">{session.snapshot.name}</span></div>
      </div>
      <div className="body">
        <p>Je hebt alle oefeningen gehad.</p>
        <div style={{ marginTop: 'auto' }}>
          <button className="btn" onClick={afronden}>Afronden</button>
        </div>
      </div>
    </div>
  )
}
