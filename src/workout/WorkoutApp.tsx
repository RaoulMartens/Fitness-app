import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { beginWorkout, changeWorkout, openWorkspace, workoutDb } from './db'
import { finishWorkout } from './finish'
import { Klaar } from './Klaar'
import { isRunning, localDate, type Workout } from './model'
import { Sessie } from './Sessie'
import { vandaagToestand, volgendeTrainingsdag } from './rules'
import { Vandaag } from './Vandaag'

type Scherm = 'vandaag' | 'sessie' | 'klaar'

export function WorkoutApp() {
  const [scherm, setScherm] = useState<Scherm>('vandaag')
  const [fout, setFout] = useState<string | null>(null)
  const [klaarVoorSessie, setKlaarVoorSessie] = useState<string | null>(null)
  const vandaag = localDate()

  useEffect(() => { void openWorkspace().catch(() => setFout('De opslag kon niet geopend worden.')) }, [])

  const data = useLiveQuery(async () => {
    const sessions = await workoutDb.sessions.toArray()
    const actief = sessions.find(isRunning)
    const outcomes = await workoutDb.outcomes.orderBy('finishedAt').toArray()
    const laatste = outcomes.at(-1)
    const zichtbaar = klaarVoorSessie ?? actief?.id ?? laatste?.sessionId
    return {
      actief,
      laatste,
      sets: zichtbaar ? await workoutDb.sets.where('sessionId').equals(zichtbaar).toArray() : [],
      drafts: actief ? await workoutDb.drafts.where('sessionId').equals(actief.id).toArray() : [],
      voorstellen: (await workoutDb.proposals.toArray()).filter(item => !item.superseded),
      toestanden: await workoutDb.exerciseStates.toArray(),
      sessieVoorKlaar: zichtbaar ? sessions.find(item => item.id === zichtbaar) : undefined,
    }
  }, [klaarVoorSessie])

  if (!data) return <div className="screen"><div className="body"><p>Bezig met laden…</p></div></div>

  const laatsteSessieDag = data.laatste?.sessionDay ?? null
  const toestand = vandaagToestand({
    openSessie: data.actief
      ? { sessieDag: localDate(new Date(data.actief.startedAt)), laatsteActiviteit: laatsteActiviteit(data.actief, data.sets) }
      : null,
    nu: Date.now(),
    vandaag,
    // In v1 staat het ritme vast op om de drie dagen; dagen aanpassen komt later.
    isTrainingsdag: laatsteSessieDag === null || volgendeTrainingsdag(laatsteSessieDag) <= vandaag,
    laatsteSessieDag,
  })

  /**
   * Zorgt dat er een lopende sessie is die invoer accepteert. De oude opzet had een
   * apart warming-upscherm; in het nieuwe ontwerp is de warming-up de eerste setrij,
   * dus die fase slaan we meteen over.
   */
  async function naarSessie() {
    try {
      let sessie = data?.actief ?? await beginWorkout()
      if (sessie.phase === 'warmup') {
        sessie = await changeWorkout(sessie.id, sessie.revision, 'begin-exercise')
      }
      setScherm('sessie')
    } catch (error) {
      setFout(error instanceof Error ? error.message : 'Starten lukte niet.')
    }
  }

  async function afrondenVanuitVandaag() {
    if (!data?.actief) return
    try {
      await finishWorkout({ sessionId: data.actief.id, action: 'abort' })
      setKlaarVoorSessie(data.actief.id)
      setScherm('klaar')
    } catch (error) {
      setFout(error instanceof Error ? error.message : 'Afronden lukte niet.')
    }
  }

  const melding = fout && (
    <div className="body" style={{ paddingBottom: 0, flex: '0 0 auto' }}>
      <p className="fout" onClick={() => setFout(null)}>{fout}</p>
    </div>
  )

  if (scherm === 'sessie' && data.actief) {
    return (
      <>
        {melding}
        <Sessie
          session={data.actief} sets={data.sets} drafts={data.drafts}
          onFout={setFout}
          onKlaar={() => { setKlaarVoorSessie(data.actief!.id); setScherm('klaar') }}
        />
      </>
    )
  }

  if (scherm === 'klaar' && data.laatste && data.sessieVoorKlaar) {
    return (
      <div className="screen">
        {melding}
        <Klaar
          outcome={data.laatste} session={data.sessieVoorKlaar} sets={data.sets}
          voorstellen={data.voorstellen} toestanden={data.toestanden}
          onTerug={() => { setKlaarVoorSessie(null); setScherm('vandaag') }}
        />
        <Tabs />
      </div>
    )
  }

  return (
    <div className="screen">
      {melding}
      <Vandaag
        toestand={toestand}
        vandaag={vandaag}
        session={data.actief}
        sets={data.sets}
        voorstellen={data.voorstellen}
        laatsteSessieDag={laatsteSessieDag}
        volgendeDag={laatsteSessieDag ? volgendeTrainingsdag(laatsteSessieDag) : null}
        onFout={setFout}
        onStart={naarSessie}
        onAfronden={afrondenVanuitVandaag}
      />
      <Tabs />
    </div>
  )
}

/** De tabbalk verdwijnt tijdens een sessie: je bent ergens in, niet ergens bij. */
function Tabs() {
  return (
    <div className="tabs">
      <button className="on"><span className="ico" />Vandaag</button>
      <button disabled title="Komt in stap 5"><span className="ico" />Programma</button>
      <button disabled title="Komt in stap 5"><span className="ico" />Voortgang</button>
    </div>
  )
}

/** Het tijdstip van de laatste vastgelegde set, of de start als er niets staat. */
function laatsteActiviteit(session: Workout, sets: { sessionId: string; recordedAt: string }[]) {
  const eigen = sets.filter(item => item.sessionId === session.id)
  const laatste = eigen.map(item => Date.parse(item.recordedAt)).sort((a, b) => b - a)[0]
  return laatste ?? Date.parse(session.startedAt)
}
