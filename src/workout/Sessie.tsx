import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import { addExercise, addExtraSet, adjustWorkout, changeWorkout, correctSet, logSet, removeSet, workoutDb, writeDraft, type AdjustmentCommand } from './db'
import { exercises, findExercise, type Exercise } from './exercises'
import { finishWorkout } from './finish'
import {
  draftVersions, formatWeight, minutenLabel, pendingTargets, recordId, restRemaining, restSlot, restTotal, targets, timerLabel,
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
  // Tijdens rust blijf je op het apparaat waar je net stond: de rust hoort bij de
  // set die je net deed. Vooruitspringen naar de volgende oefening zou de sets die
  // je zojuist neerzette uit beeld halen, en een set erbij aan het verkeerde
  // apparaat hangen.
  const slot = (session.rest ? restSlot(session) : undefined) ?? huidig?.slot
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
  // Een set die je opnieuw opent staat los van de set die je nu doet: anders
  // overschrijft een correctie de waarden die al in de openstaande rij stonden.
  const [corrigeert, setCorrigeert] = useState<string | null>(null)
  const [correctieWeight, setCorrectieWeight] = useState(0)
  const [correctieReps, setCorrectieReps] = useState(0)

  // Bij een nieuwe set opnieuw beginnen bij wat er vorige keer stond.
  useEffect(() => {
    if (!huidig || gezet.current === huidig.id) return
    gezet.current = huidig.id
    setWeight(start.weight)
    setReps(start.reps)
  }, [huidig?.id, start.weight, start.reps])

  function openCorrectie(record: WorkoutSet) {
    setCorrigeert(record.id)
    setCorrectieWeight(record.weight)
    setCorrectieReps(record.reps)
  }

  async function correctieOpslaan() {
    if (!corrigeert) return
    if (!magVastleggen(correctieWeight, correctieReps)) return onFout('Vul een gewicht en een heel aantal herhalingen in.')
    try {
      await correctSet(corrigeert, correctieWeight, correctieReps, session.revision)
      setCorrigeert(null)
    } catch (error) {
      onFout(error instanceof Error ? error.message : 'De correctie is niet opgeslagen.')
    }
  }

  /**
   * Ergens anders tikken sluit de correctie af en bewaart hem. Het getal staat al
   * zichtbaar op de nieuwe waarde en verandert alleen door jouw tikken, dus wegklikken
   * is geen ongeluk. Annuleren blijft de weg om hem weg te gooien.
   *
   * De rij zelf, de opslaanknop en de annuleerknop dragen data-correctie en vallen
   * buiten deze luisteraar: hij loopt op pointerdown, dus zonder die uitzondering zou
   * de knop onder je vinger al vervangen zijn voordat de klik erop aankomt.
   */
  useEffect(() => {
    if (!corrigeert) return
    function buiten(event: PointerEvent) {
      if ((event.target as HTMLElement | null)?.closest('[data-correctie]')) return
      void correctieOpslaan()
    }
    document.addEventListener('pointerdown', buiten)
    return () => document.removeEventListener('pointerdown', buiten)
  }, [corrigeert, correctieWeight, correctieReps, session.revision])

  /**
   * Afgelopen rust gaat vanzelf door. Je staat bij het apparaat, niet met je telefoon
   * in je hand, en een aftelling die op 0:00 blijft staan vraagt een handeling voor
   * iets wat al besloten is. Per rust hoogstens één poging: het sleutelpaar afterSetId
   * en endAt verandert pas bij een volgende rust of bij rust erbij.
   *
   * Tijdens een correctie niet. Dan zou het scherm onder je handen van oefening
   * wisselen en de rij die je aan het aanpassen bent uit beeld halen.
   */
  const verdergegaan = useRef<string | null>(null)
  useEffect(() => {
    if (!session.rest) { verdergegaan.current = null; return }
    if (session.status !== 'active' || corrigeert) return
    const controle = setInterval(() => {
      if (!session.rest || restRemaining(session) > 0) return
      const sleutel = `${session.rest.afterSetId}:${session.rest.endAt}`
      if (verdergegaan.current === sleutel) return
      verdergegaan.current = sleutel
      // Mislukt dit, dan is de sessie intussen veranderd; de knop blijft de weg terug.
      void changeWorkout(session.id, session.revision, 'next-set').catch(() => {})
    }, 250)
    return () => clearInterval(controle)
  }, [session, corrigeert])

  if (!slot || !huidig) {
    return <Afgerond session={session} onFout={onFout} onKlaar={onKlaar} />
  }

  const exercise = findExercise(slot.exerciseId)
  const gedaanPerOefening = new Set(sets.map(item => item.slotId))
  // Wat hierna komt volgt uit de rij, niet uit de schemavolgorde: na 'Later doen'
  // staan die twee niet meer gelijk.
  const hierna = open.find(item => item.slot.id !== slot.id)?.slot

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

  async function setErbij() {
    try { await addExtraSet(session.id, session.revision, slot!.id) }
    catch (error) { onFout(error instanceof Error ? error.message : 'Er kon geen set bij.') }
  }

  async function setEraf() {
    try { await removeSet(session.id, session.revision, slot!.id) }
    catch (error) { onFout(error instanceof Error ? error.message : 'Er kon geen set af.') }
  }

  async function rustOverslaan() {
    try { await changeWorkout(session.id, session.revision, 'next-set') }
    catch (error) { onFout(error instanceof Error ? error.message : 'Er ging iets mis.') }
  }

  // Je bent met deze oefening klaar zodra de eerstvolgende set op een ander
  // apparaat staat. De set die je nu nog moet doen staat vooraan in de rij, dus
  // die mag niet uit de vergelijking vallen.
  const naarAnderApparaat = Boolean(session.rest) && huidig.slot.id !== slot.id
  // Een geplande werkset weghalen kort de oefening in; de laatste mag niet weg,
  // want zonder werkset valt er niets te vergelijken.
  const laatsteOpen = open.filter(item => item.slot.id === slot.id).at(-1)?.target
  const magEraf = Boolean(laatsteOpen) && (laatsteOpen!.kind === 'extra'
    || slot.sets.filter(target => target.kind === 'work').length > 1)
  const bereik = slot.sets.find(target => target.kind === 'work') ?? slot.sets[0]
  const rustDuur = restTotal(session)
  const deelRust = rustDuur > 0 ? Math.min(100, Math.max(0, (rust / rustDuur) * 100)) : 0

  return (
    <div className="screen">
      <div className={session.rest ? 'kop rust' : 'kop'}>
        {session.rest
          ? <div className="rustbalk"><i style={{ width: `${deelRust}%` }} /></div>
          : <div className="segs">
              {session.snapshot.slots.map(item => {
                const klaar = !open.some(open => open.slot.id === item.id)
                const bezig = gedaanPerOefening.has(item.id) && !klaar
                return <i key={item.id} className={klaar ? 'on' : bezig ? 'half' : ''} />
              })}
            </div>}
        <div className="line">
          <span className="big">{session.rest ? `Rust · ${timerLabel(rust)}` : slot.name}</span>
          <span className="sm">{session.rest ? slot.name : hierna ? `Hierna: ${hierna.name}` : 'Laatste oefening'}</span>
        </div>
      </div>

      <div className="body">
        <Video url={exercise?.videoUrl} />

        <div className="set head">
          <span>Set</span><span>Vorige</span><span>Kg</span>
          <span>Herh {bereik.repsMin}–{bereik.repsMax}</span><span />
        </div>

        {slot.sets.map((target, _index, rijen) => {
          const genummerd = rijen.filter(item => item.kind !== 'warmup')
          const id = recordId(session.id, slot.id, target.number)
          const record = sets.find(item => item.id === id)
          const eerder = vorigeSets.find(item => item.number === target.number)
          // Doorlopend genummerd in beeld. Het opgeslagen nummer is een kenmerk, geen
          // telling: haal je set 2 weg en zet je er een bij, dan slaat die 2 over.
          const label = target.kind === 'warmup' ? 'warming-up' : String(genummerd.indexOf(target) + 1)
          const naam = target.kind === 'warmup' ? 'de warming-up' : `set ${label}`
          // Alleen een geplande werkset heeft een tegenhanger in de vorige sessie.
          const vorigeTekst = target.kind === 'work' && eerder ? `${formatWeight(eerder.weight)} × ${eerder.reps}` : '—'

          if (record && corrigeert === id) {
            return (
              <Stappers
                key={target.number} corrigeert
                label={label} smal={target.kind === 'warmup'} vorige={vorigeTekst}
                exerciseId={slot.exerciseId}
                weight={correctieWeight} reps={correctieReps}
                onWeight={setCorrectieWeight} onReps={setCorrectieReps}
              />
            )
          }
          if (record) {
            return (
              <div className="set done" key={target.number}>
                <span className={target.kind === 'warmup' ? 'num w' : 'num'}>{label}</span>
                <span className="prev">{vorigeTekst}</span>
                <button className="in" onClick={() => openCorrectie(record)} aria-label={`Gewicht van ${naam} aanpassen`}>
                  {formatWeight(record.weight)}
                </button>
                <button className="in" onClick={() => openCorrectie(record)} aria-label={`Herhalingen van ${naam} aanpassen`}>
                  {record.reps}
                </button>
                <span className="tick">✓</span>
              </div>
            )
          }
          if (id !== huidig.id || session.rest || corrigeert) {
            return (
              <div className="set" key={target.number}>
                <span className={target.kind === 'warmup' ? 'num w' : 'num'}>{label}</span>
                <span className="prev">{vorigeTekst}</span>
                <span className="in">—</span><span className="in">—</span>
                <span className="tick">○</span>
              </div>
            )
          }
          return (
            <Stappers
              key={target.number}
              label={label} smal={target.kind === 'warmup'} vorige={vorigeTekst}
              exerciseId={slot.exerciseId}
              weight={weight} reps={reps}
              onWeight={setWeight} onReps={setReps}
            />
          )
        })}

        {!corrigeert && (
          <div className="setrij">
            <button className="addrow" onClick={setEraf} disabled={!magEraf}>− Set weghalen</button>
            <button className="addrow" onClick={setErbij}>+ Set toevoegen</button>
          </div>
        )}

        <div className="acties">
          {corrigeert
            ? <button className="btn" data-correctie onClick={correctieOpslaan}>Correctie opslaan</button>
            : session.rest
              ? <button className="btn" onClick={rustOverslaan}>
                  {naarAnderApparaat ? `Verder met ${huidig.slot.name}` : 'Verder'}
                </button>
              : <button className="btn" onClick={vastleggen}>Set vastleggen</button>}
          <div className="links">
            {corrigeert
              ? <button className="link" data-correctie onClick={() => setCorrigeert(null)}>Annuleren</button>
              : <>
                  <Afronden session={session} drafts={drafts} onFout={onFout} onKlaar={onKlaar} />
                  {!session.rest && <Aanpassen session={session} slot={slot} sets={sets} drafts={drafts} onFout={onFout} />}
                </>}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Wat je met de oefening van nu kunt doen zonder het schema te veranderen. Beide keuzes
 * gelden alleen vandaag. Een keuze die niet kan blijft staan met de reden ernaast: hem
 * weglaten zou de sheet per situatie van vorm laten veranderen.
 */
function Aanpassen({ session, slot, sets, drafts, onFout }: {
  session: Workout
  slot: Workout['snapshot']['slots'][number]
  sets: WorkoutSet[]
  drafts: WorkoutDraft[]
  onFout: (melding: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [stap, setStap] = useState<'keuze' | 'vervangen'>('keuze')
  const begonnen = sets.some(item => item.slotId === slot.id)
  const andereOpen = pendingTargets(session).some(item => item.slot.id !== slot.id)
  const exercise = findExercise(slot.exerciseId)
  // Wat al in de sessie zit valt af: een tweede Zittende row naast de eerste is geen vervanging.
  const alternatieven = (exercise?.alternatives ?? [])
    .map(findExercise)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter(item => !session.snapshot.slots.some(other => other.exerciseId === item.id))

  function sluit() { setOpen(false); setStap('keuze') }

  async function voer(command: AdjustmentCommand) {
    try {
      await adjustWorkout(session.id, session.revision, crypto.randomUUID(), draftVersions(drafts), command)
      sluit()
    } catch (error) {
      onFout(error instanceof Error ? error.message : 'De aanpassing is niet doorgevoerd.')
      sluit()
    }
  }

  return (
    <>
      <button className="link" onClick={() => setOpen(true)}>Oefening aanpassen</button>
      {open && (
        <div className="sheet-wrap" onClick={sluit}>
          <div className="sheet" onClick={event => event.stopPropagation()}>
            <div className="grip" />
            {stap === 'keuze' ? (
              <>
                <h1>{slot.name}</h1>
                <button className="opt" disabled={!andereOpen} onClick={() => voer({ kind: 'later' })}>
                  <span className="lbl">Later doen</span>
                  <span className="eff">{andereOpen ? 'Achteraan in de sessie' : 'Er staat niets anders meer open'}</span>
                </button>
                <button className="opt" disabled={begonnen || !alternatieven.length} onClick={() => setStap('vervangen')}>
                  <span className="lbl">Andere oefening</span>
                  <span className="eff">
                    {begonnen
                      ? 'Kan niet meer: je hebt hier al een set op staan'
                      : alternatieven.length ? 'Zelfde spieren, ander apparaat' : 'Geen vervanger bekend'}
                  </span>
                </button>
              </>
            ) : (
              <>
                <h1>Andere oefening</h1>
                <p className="sub">In plaats van {slot.name} · {exercise?.muscles.toLowerCase()}</p>
                <div className="list2">
                  {alternatieven.map(item => (
                    <button className="kies" key={item.id} onClick={() => voer({ kind: 'vervangen', exerciseId: item.id })}>
                      <span className="nm">{item.name}</span>
                      <span className="mt">{item.verschil}</span>
                    </button>
                  ))}
                </div>
                <p className="next">Alleen voor vandaag. Je schema houdt {slot.name}.</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
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
  smal: boolean
  corrigeert?: boolean
  vorige: string
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
    <div className="set inline" data-correctie={props.corrigeert ? '' : undefined}>
      <span className={props.smal ? 'num w' : 'num'}>{props.label}</span>
      <span className="prev">{props.vorige}</span>
      <button className="val" onClick={() => typen(weight, props.onWeight)} aria-label="Gewicht intypen">
        {formatWeight(weight)}
      </button>
      <button className="val" onClick={() => typen(props.reps, value => props.onReps(Math.round(value)))} aria-label="Herhalingen intypen">
        {props.reps}
      </button>
      <span className="tick">○</span>
      <span className="pad kg">
        <button onClick={() => props.onWeight(Math.max(minWeight, rond(weight - step)))} aria-label="Gewicht omlaag">−</button>
        <button onClick={() => props.onWeight(rond(weight + step))} aria-label="Gewicht omhoog">+</button>
      </span>
      <span className="pad herh">
        <button onClick={() => props.onReps(Math.max(1, props.reps - 1))} aria-label="Herhaling minder">−</button>
        <button onClick={() => props.onReps(props.reps + 1)} aria-label="Herhaling meer">+</button>
      </span>
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
  const [kiest, setKiest] = useState(false)
  const minuten = Math.max(1, Math.round((Date.now() - Date.parse(session.startedAt)) / 60_000))

  async function afronden() {
    try {
      await finishWorkout({ sessionId: session.id })
      onKlaar()
    } catch (error) {
      onFout(error instanceof Error ? error.message : 'Afronden lukte niet.')
    }
  }

  async function toevoegen(exerciseId: string) {
    try {
      await addExercise(session.id, session.revision, exerciseId)
      setKiest(false)
    } catch (error) {
      onFout(error instanceof Error ? error.message : 'De oefening is niet toegevoegd.')
    }
  }

  return (
    <div className="screen">
      <div className="kop">
        <div className="segs">{session.snapshot.slots.map(slot => <i key={slot.id} className="on" />)}</div>
        <div className="line"><span className="big">Alles gedaan</span><span className="sm">{session.snapshot.name}</span></div>
      </div>
      <div className="body">
        <p>{session.snapshot.slots.length} oefeningen · {minutenLabel(minuten)}</p>
        <div className="acties">
          <button className="btn" onClick={afronden}>Afronden</button>
          <button className="opt" onClick={() => setKiest(true)}>
            <span className="lbl">Nog een oefening erbij</span>
          </button>
        </div>
      </div>
      {kiest && <OefeningKiezen session={session} onKies={toevoegen} onSluit={() => setKiest(false)} />}
    </div>
  )
}

/**
 * Welke oefening erbij. Wat je eerder hebt gedaan staat bovenaan: aan het eind van
 * een sessie kies je meestal iets bekends. Oefeningen die al in deze sessie zitten
 * staan er niet in.
 */
function OefeningKiezen({ session, onKies, onSluit }: {
  session: Workout
  onKies: (exerciseId: string) => void
  onSluit: () => void
}) {
  const eerder = useLiveQuery(async () => new Set(await workoutDb.exerciseStates.toCollection().primaryKeys()), [])
  const inSessie = new Set(session.snapshot.slots.map(slot => slot.exerciseId))
  const beschikbaar = exercises.filter(item => !inSessie.has(item.id))
  const vaker = beschikbaar.filter(item => eerder?.has(item.id))
  const rest = beschikbaar.filter(item => !eerder?.has(item.id))

  const rij = (item: Exercise) => (
    <button className="kies" key={item.id} onClick={() => onKies(item.id)}>
      <span className="nm">{item.name}</span>
      <span className="mt">{item.muscles.toLowerCase()}</span>
    </button>
  )

  return (
    <div className="sheet-wrap" onClick={onSluit}>
      <div className="sheet" onClick={event => event.stopPropagation()}>
        <div className="grip" />
        <h1>Oefening toevoegen</h1>
        {vaker.length > 0 && <><h2>Vaker gedaan</h2><div className="list2">{vaker.map(rij)}</div></>}
        {rest.length > 0 && <>{vaker.length > 0 && <h2>Alle oefeningen</h2>}<div className="list2">{rest.map(rij)}</div></>}
        <p className="next">De oefening komt achteraan deze sessie, met twee sets. Je schema verandert er niet van.</p>
      </div>
    </div>
  )
}
