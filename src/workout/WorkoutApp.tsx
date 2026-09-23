import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { beginWorkout, changeWorkout, discardWorkout, openWorkspace, workoutDb } from './db'
import { finishWorkout } from './finish'
import { Instellingen } from './Instellingen'
import { Klaar } from './Klaar'
import { huidigSchema, isRunning, localDate, type Workout } from './model'
import { Oefening, Oefeningen, Programma } from './Programma'
import { tabVan, useRoute, type Route, type Tab } from './route'
import { Sessie } from './Sessie'
import { vandaagToestand, volgendeTrainingsdag } from './rules'
import { Vandaag } from './Vandaag'
import { Historie, Voortgang } from './Voortgang'

export function WorkoutApp() {
  const [route, ga] = useRoute()
  const [fout, setFout] = useState<string | null>(null)
  const vandaag = localDate()

  useEffect(() => { void openWorkspace().catch(() => setFout('De opslag kon niet geopend worden.')) }, [])

  // Alles in één keer: voor één persoon op één toestel is dit een handvol rijen, en zo
  // ziet elk scherm dezelfde stand van zaken.
  const data = useLiveQuery(async () => {
    const sessions = await workoutDb.sessions.toArray()
    const outcomes = await workoutDb.outcomes.orderBy('finishedAt').toArray()
    return {
      sessions,
      outcomes,
      actief: sessions.find(isRunning),
      laatste: outcomes.at(-1),
      sets: await workoutDb.sets.toArray(),
      drafts: await workoutDb.drafts.toArray(),
      voorstellen: (await workoutDb.proposals.toArray()).filter(item => !item.superseded),
      toestanden: await workoutDb.exerciseStates.toArray(),
      vervangingen: (await workoutDb.workspace.get('main'))?.vervangingen ?? {},
    }
  }, [])

  /*
   * Een sessie- of klaarscherm zonder bijbehorende sessie heeft geen inhoud: terug naar
   * Vandaag, zonder een lege stap in de geschiedenis achter te laten.
   *
   * Niet beslissen op de livequery alleen. Vlak na starten of afronden loopt die nog
   * achter op de opslag, en dan stuurde dit je terug van een sessie die net begonnen
   * was. Starten en afronden wachten hun transactie af voordat ze navigeren, dus een
   * verse lezing uit de opslag geeft hier het echte antwoord.
   */
  const lijktLeeg = data && (
    (route.naam === 'sessie' && !data.actief)
    || (route.naam === 'klaar' && !data.outcomes.some(item => item.sessionId === route.sessionId))
  )
  useEffect(() => {
    if (!lijktLeeg) return
    let geldig = true
    void (async () => {
      const leeg = route.naam === 'sessie'
        ? !(await workoutDb.sessions.toArray()).some(isRunning)
        : route.naam === 'klaar' && !(await workoutDb.outcomes.get(route.sessionId))
      if (geldig && leeg) ga({ naam: 'vandaag' }, { vervang: true })
    })()
    return () => { geldig = false }
  }, [lijktLeeg])

  if (!data) return <div className="screen"><div className="body"><p>Bezig met laden…</p></div></div>

  const vanSessie = (id?: string) => id ? data.sets.filter(item => item.sessionId === id) : []
  const schema = huidigSchema(data.vervangingen)
  const laatsteSessieDag = data.laatste?.sessionDay ?? null
  const actieveSets = vanSessie(data.actief?.id)
  const toestand = vandaagToestand({
    openSessie: data.actief
      ? { sessieDag: localDate(new Date(data.actief.startedAt)), laatsteActiviteit: laatsteActiviteit(data.actief, actieveSets) }
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
      ga({ naam: 'sessie' })
    } catch (error) {
      setFout(error instanceof Error ? error.message : 'Starten lukte niet.')
    }
  }

  async function afrondenVanuitVandaag() {
    if (!data?.actief) return
    try {
      await finishWorkout({ sessionId: data.actief.id, action: 'abort' })
      ga({ naam: 'klaar', sessionId: data.actief.id })
    } catch (error) {
      setFout(error instanceof Error ? error.message : 'Afronden lukte niet.')
    }
  }

  async function weggooien() {
    if (!data?.actief) return
    try { await discardWorkout(data.actief.id, data.actief.revision) }
    catch (error) { setFout(error instanceof Error ? error.message : 'Weggooien lukte niet. Er is niets verwijderd.') }
  }

  const melding = fout && (
    <div className="body" style={{ paddingBottom: 0, flex: '0 0 auto' }}>
      <p className="fout" onClick={() => setFout(null)}>{fout}</p>
    </div>
  )

  if (route.naam === 'sessie' && data.actief) {
    const id = data.actief.id
    return (
      <>
        {melding}
        <Sessie
          session={data.actief} sets={actieveSets} drafts={data.drafts.filter(item => item.sessionId === id)}
          onFout={setFout}
          // Na afronden hoort terug niet naar een sessie die er niet meer is.
          onKlaar={() => ga({ naam: 'klaar', sessionId: id }, { vervang: true })}
        />
      </>
    )
  }

  return (
    <div className="screen">
      {melding}
      {scherm(route)}
      <Tabs actief={tabVan(route)} ga={ga} />
    </div>
  )

  function scherm(huidig: Route) {
    switch (huidig.naam) {
      case 'klaar': {
        const outcome = data!.outcomes.find(item => item.sessionId === huidig.sessionId)
        const session = data!.sessions.find(item => item.id === huidig.sessionId)
        if (!outcome || !session) return null
        return (
          <Klaar
            outcome={outcome} session={session} sets={vanSessie(session.id)}
            voorstellen={data!.voorstellen} toestanden={data!.toestanden}
            onTerug={() => ga({ naam: 'vandaag' })}
            onFout={setFout}
          />
        )
      }
      case 'programma':
        return <Programma schema={schema} outcomes={data!.outcomes} vandaag={vandaag} ga={ga} />
      case 'oefeningen':
        return <Oefeningen schema={schema} toestanden={data!.toestanden} ga={ga} />
      case 'oefening':
        return (
          <Oefening
            exerciseId={huidig.exerciseId} van={huidig.van} schema={schema}
            toestanden={data!.toestanden} vervangingen={data!.vervangingen}
            ga={ga} onFout={setFout}
          />
        )
      case 'voortgang':
        return (
          <Voortgang schema={schema} outcomes={data!.outcomes} sessions={data!.sessions}
            sets={data!.sets} toestanden={data!.toestanden} ga={ga} />
        )
      case 'historie':
        return (
          <Historie sessionId={huidig.sessionId} outcomes={data!.outcomes}
            sessions={data!.sessions} sets={data!.sets} ga={ga} />
        )
      case 'instellingen':
        return <Instellingen ga={ga} onFout={setFout} />
      default:
        return (
          <Vandaag
            toestand={toestand}
            vandaag={vandaag}
            session={data!.actief}
            sets={actieveSets}
            voorstellen={data!.voorstellen}
            laatsteSessieDag={laatsteSessieDag}
            volgendeDag={laatsteSessieDag ? volgendeTrainingsdag(laatsteSessieDag) : null}
            onFout={setFout}
            onStart={naarSessie}
            onAfronden={afrondenVanuitVandaag}
            onWeggooien={weggooien}
          />
        )
    }
  }
}

/** De tabbalk verdwijnt tijdens een sessie: je bent ergens in, niet ergens bij. */
function Tabs({ actief, ga }: { actief: Tab; ga: (route: Route) => void }) {
  const tab = (naam: Tab, label: string) => (
    <button className={actief === naam ? 'on' : undefined} onClick={() => ga({ naam })}>
      <span className="ico" />{label}
    </button>
  )
  return <div className="tabs">{tab('vandaag', 'Vandaag')}{tab('programma', 'Programma')}{tab('voortgang', 'Voortgang')}</div>
}

/** Het tijdstip van de laatste vastgelegde set, of de start als er niets staat. */
function laatsteActiviteit(session: Workout, sets: { sessionId: string; recordedAt: string }[]) {
  const eigen = sets.filter(item => item.sessionId === session.id)
  const laatste = eigen.map(item => Date.parse(item.recordedAt)).sort((a, b) => b - a)[0]
  return laatste ?? Date.parse(session.startedAt)
}
