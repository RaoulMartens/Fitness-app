import { useCallback, useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Sheet } from '../components/Sheet'
import { storageMessage } from '../components/SetForm'
import { formatWeight } from '../model'
import { beginWorkout, cancelPlanDraft, changeWorkout, nextAppointment, openWorkspace, readLegacyChanges, workoutDb, type SessionAction } from './db'
import { isRunning, recordId, restRemaining, resultLabel, starterProgram, targets, timerLabel, pendingTargets, draftVersions, lastUndoable, dateLabel, type DraftVersions, type Program, type View, type Workout, type WorkoutDraft, type WorkoutSet } from './model'
import { AdjustmentSheet, type AdjustmentContext, type AdjustmentView } from './AdjustmentSheet'
import { PlanEditor } from './PlanEditor'
import { WorkoutSetForm } from './WorkoutSetForm'
import { useWakeLock } from './useWakeLock'

type Route = { view: View; sessionId?: string }
type Overlay = 'info' | 'demo' | 'resume' | 'interrupt' | 'finish' | 'abort' | 'legacy' | null
function readRoute(): Route {
  const [view, sessionId] = location.hash.slice(1).split('/')
  if (view === 'overview' || view === 'warmup' || view === 'exercise' || view === 'summary' || view === 'consequences' || view === 'plan' || view === 'plan-edit') return { view, sessionId }
  return { view: 'today' }
}
const routeHash = (route: Route) => `#${route.view}${route.sessionId ? `/${route.sessionId}` : ''}`

export function WorkoutApp() {
  const [route, setRoute] = useState(readRoute)
  const [sheet, setSheet] = useState<Overlay>(null)
  const ending = useRef<{ revision: number; draftRevision?: DraftVersions } | null>(null)
  const [adjustment, setAdjustment] = useState<AdjustmentContext | null>(null)
  const afterAdjustment = useRef<Overlay>(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [recovery, setRecovery] = useState<WorkoutDraft | null>(null)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [now, setNow] = useState(Date.now())
  const [online, setOnline] = useState(navigator.onLine)
  const [wakeRequested, setWakeRequested] = useState(false)
  const [swControlled, setSwControlled] = useState(Boolean(navigator.serviceWorker?.controller))
  const [swError, setSwError] = useState(false)
  const { offlineReady: [offlineReady], needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({ onRegisterError: () => setSwError(true) })
  const onBusy = useCallback((value: boolean) => { busyRef.current = value; setBusy(value) }, [])

  useEffect(() => {
    let mounted = true
    void openWorkspace().then(() => { if (mounted) { setReady(true); setError('') } }, cause => { if (mounted) setError(storageMessage(cause)) })
    return () => { mounted = false }
  }, [attempt])
  useEffect(() => {
    const update = () => { setNow(Date.now()); setOnline(navigator.onLine) }
    const controlled = () => setSwControlled(Boolean(navigator.serviceWorker.controller))
    const interval = window.setInterval(update, 500)
    document.addEventListener('visibilitychange', update)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    navigator.serviceWorker?.addEventListener('controllerchange', controlled)
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', update); window.removeEventListener('online', update); window.removeEventListener('offline', update); navigator.serviceWorker?.removeEventListener('controllerchange', controlled) }
  }, [])
  useEffect(() => {
    const back = () => {
      if (busyRef.current) { history.replaceState(null, '', routeHash(route)); setError('Je invoer wordt nog opgeslagen. Probeer daarna opnieuw terug te gaan.'); return }
      const next = readRoute()
      setSheet(afterAdjustment.current); afterAdjustment.current = null; setAdjustment(null); setRoute(next)
      if (route.view === 'plan-edit' && next.view !== 'plan-edit') void cancelPlanDraft().catch(cause => setError(storageMessage(cause)))
    }
    window.addEventListener('popstate', back)
    return () => window.removeEventListener('popstate', back)
  }, [route])
  useEffect(() => { document.querySelector<HTMLElement>('.workout h1')?.focus(); window.scrollTo(0, 0) }, [route])

  const state = useLiveQuery(async () => {
    if (!ready) return null
    try {
      return await workoutDb.transaction('r', workoutDb.tables, async () => {
        const workspace = await workoutDb.workspace.get('main')
        if (!workspace) throw new Error('Je planning ontbreekt. Open de app opnieuw.')
        const sessions = await workoutDb.sessions.orderBy('startedAt').reverse().toArray()
        const activeSession = sessions.find(session => session.id === workspace.sessionId)
        if (workspace.sessionId && !activeSession) throw new Error('Je opgeslagen training ontbreekt. Er is niets overschreven.')
        const session = route.sessionId ? sessions.find(item => item.id === route.sessionId) : activeSession
        if (route.sessionId && !session) throw new Error('Deze opgeslagen training is niet gevonden.')
        const sets = session ? await workoutDb.sets.where('sessionId').equals(session.id).toArray() : []
        const drafts = session ? await workoutDb.drafts.where('sessionId').equals(session.id).toArray() : []
        let previous: WorkoutSet | undefined
        const current = session && pendingTargets(session)[0]
        if (current && !session.rest) {
          for (const prior of sessions.filter(item => item.id !== session.id && !isRunning(item) && item.snapshot.id === session.snapshot.id && item.snapshot.version === session.snapshot.version)) {
            previous = await workoutDb.sets.get(recordId(prior.id, current.slot.id, current.target.number))
            if (previous) break
          }
        }
        const appointment = workspace.appointmentId ? await workoutDb.appointments.get(workspace.appointmentId) : undefined
        const appointments = await workoutDb.appointments.orderBy('date').reverse().toArray()
        const legacyChanges = await readLegacyChanges()
        return { workspace, session, activeSession, sessions, sets, drafts, previous, appointment, appointments, legacyChanges, failure: null }
      })
    } catch (cause) { return { failure: storageMessage(cause) } }
  }, [ready, route.sessionId, attempt])
  const session = state?.failure === null ? state.session : undefined
  const training = route.view === 'exercise' || route.view === 'warmup'
  const wakeMessage = useWakeLock(wakeRequested && route.view === 'exercise' && session?.status === 'active' && Boolean(session.rest))

  function go(view: View, sessionId?: string) {
    if (busyRef.current) return
    const next = { view, sessionId }
    setRoute(next); setSheet(null); setError('')
    if (routeHash(next) !== location.hash) history.pushState(null, '', routeHash(next))
  }
  async function action(task: () => Promise<unknown>, after?: () => void) {
    if (busyRef.current) return
    onBusy(true); setError('')
    try { await task(); onBusy(false); after?.() }
    catch (cause) { setError(storageMessage(cause)) }
    finally { onBusy(false) }
  }
  function change(command: SessionAction, destination?: View) {
    if (!session) return
    const draftRevision = state?.failure === null ? draftVersions(state.drafts) : undefined
    const confirmation = command === 'complete' || command === 'abort' ? ending.current : null
    void action(() => changeWorkout(session.id, confirmation?.revision ?? session.revision, command, confirmation ? confirmation.draftRevision : draftRevision), () => {
      if (destination) go(destination)
      else setSheet(null)
    })
  }
  function openSheet(next: Overlay) {
    if ((next === 'finish' || next === 'abort') && session) ending.current = { revision: session.revision, draftRevision: state?.failure === null ? draftVersions(state.drafts) : undefined }
    setSheet(next)
  }
  function start() {
    void action(async () => { const next = await beginWorkout(); onBusy(false); go(next.phase) })
  }
  const failure = state?.failure || (!ready && error)
  if (failure) return <main className="app loading"><h1>Je invoer openen lukt niet</h1><p role="alert">{failure}</p><p>Er is niets gewist. Controleer of deze browser lokale opslag toestaat.</p><button className="primary" onClick={() => setAttempt(value => value + 1)}>Opnieuw proberen</button></main>
  if (!ready || !state || state.failure !== null) return <main className="app loading"><h1>Training</h1><p role="status">Je invoer openen…</p></main>
  const { workspace, sets, drafts, sessions, activeSession, appointment, appointments } = state
  const running = isRunning(session)
  const safeView = training && !running ? session ? 'summary' : 'today' : ['summary', 'consequences'].includes(route.view) && (!session || running) ? 'today' : route.view
  const program = session?.snapshot ?? starterProgram
  const allTargets = targets(program)
  const count = allTargets.length
  const open = session ? pendingTargets(session) : []
  const current = open[0] ?? allTargets[count - 1]
  const displayed = session?.rest ? allTargets.find(item => recordId(session.id, item.slot.id, item.target.number) === session.rest?.afterSetId) ?? current : current
  const draft = session ? drafts.find(item => item.id === recordId(session.id, current.slot.id, current.target.number)) : undefined
  const completed = sessions.filter(item => !isRunning(item))
  const remaining = session ? restRemaining(session, now) : 0
  const back = safeView === 'plan-edit' ? () => void action(() => cancelPlanDraft(), () => go('plan')) : safeView === 'consequences' ? () => go('summary', route.sessionId) : () => go('today')
  const showBack = !['today', 'plan'].includes(safeView)
  const pendingDraft = drafts.some(item => item.weight || item.reps)
  function openAdjustment(view: AdjustmentView, planned = false) {
    if (busyRef.current) return
    void action(async () => {
      // Autosave or resume can finish before the live-query render. Capture one committed snapshot.
      const context = await workoutDb.transaction('r', workoutDb.sessions, workoutDb.drafts, workoutDb.appointments, async () => ({
        view,
        session: session && !planned ? await workoutDb.sessions.get(session.id) : undefined,
        appointment: appointment && planned ? await workoutDb.appointments.get(appointment.id) : undefined,
        drafts: draftVersions(session && !planned ? await workoutDb.drafts.where('sessionId').equals(session.id).toArray() : []),
      }))
      history.pushState({ adjustment: true }, '', location.hash)
      setAdjustment(context)
    })
  }
  function closeAdjustment() { setAdjustment(null); history.back() }
  const adjustmentNotice = session?.adjustments?.length ? <aside className="adjustment-notice"><strong>Alleen vandaag</strong><p>{session.adjustments.at(-1)?.label}</p>{running && !session.rest && lastUndoable(session) && <button className="text-button" disabled={busy} onClick={() => openAdjustment('undo')}>Aanpassing terugdraaien</button>}</aside> : null
  function reloadInput() { setRecovery(null); onBusy(false); setAttempt(value => value + 1); setSheet(null); setError('') }
  if (recovery && (!session || session.status !== 'active' || session.rest || !open.length || recordId(session.id, current.slot.id, current.target.number) !== recovery.id)) return <main className="app loading"><h1>Je training is elders gewijzigd</h1><p role="alert">Deze invoer kon niet worden opgeslagen en is niet als set vastgelegd.</p><p>Jouw invoer: {recovery.weight || 'geen gewicht'} kg · {recovery.reps || 'geen'} herhalingen.</p><p>Neem de waarden zo nodig over voordat je de actuele sessie opent.</p><button className="primary" onClick={reloadInput}>Actuele sessie openen</button></main>

  return <main className="app workout">
    <header className="topbar"><span>Training</span><button className="text-button" disabled={busy} aria-label="Over deze versie" onClick={() => setSheet('info')}>i</button></header>
    <nav className="workout-nav" aria-label="Sessie"><span>{training && session ? `${session.cursor}/${count} sets${online ? '' : ' · offline'}` : online ? 'Op dit apparaat' : 'Offline · op dit apparaat'}</span>{showBack && <button className="text-button" disabled={busy} aria-label={training && running ? 'Naar Vandaag · sessie blijft lopen' : undefined} onClick={back}>{training && running ? 'Naar Vandaag' : safeView === 'plan-edit' ? 'Terug naar Plan' : safeView === 'consequences' ? 'Terug naar je sessie' : 'Terug naar Vandaag'}</button>}</nav>
    <div className="content">
      {error && <div role="alert" className="error"><p>{error}</p><button onClick={() => setError('')}>Sluiten</button></div>}
      {!!state.legacyChanges.length && <aside className="error"><p>Een oudere appversie heeft nog invoer opgeslagen.</p><button disabled={busy} onClick={() => setSheet('legacy')}>Oude invoer bekijken</button></aside>}
      {safeView === 'today' && <>
        <h1 tabIndex={-1}>Vandaag</h1>
        {isRunning(activeSession) && activeSession ? <section className="plain-panel"><h2>{activeSession.status === 'paused' ? 'Sessie gepauzeerd' : 'Sessie loopt'}</h2><p>{activeSession.snapshot.name} · {activeSession.cursor} van {targets(activeSession.snapshot).length} sets vastgelegd</p><p className="muted">{activeSession.phase === 'warmup' ? 'Je was bij de warming-up.' : !open.length ? 'Je kunt je sessie afronden.' : `${current.slot.name} · set ${current.target.number}${draft ? ' · concept bewaard' : ''}`}</p><button className="primary" disabled={busy} onClick={() => setSheet('resume')}>Verder trainen</button></section>
          : <section className="plain-panel"><h2>{appointment?.status === 'skipped' ? 'Training overgeslagen' : 'Full-body'}</h2>{appointment && <p>{dateLabel(appointment.date)}</p>}<p>7 oefeningen · ongeveer 60 minuten</p><p className="muted">Je hele lichaam, met extra aandacht voor je bovenlichaam.</p><button className="primary" disabled={busy} onClick={appointment?.status === 'skipped' ? () => void action(() => nextAppointment(appointment.id)) : start}>{appointment?.status === 'skipped' ? 'Volgende training bekijken' : activeSession ? 'Volgende training starten' : 'Start training'}</button><button className="text-button" onClick={() => go('overview')}>Bekijk de sessie</button>{appointment?.status === 'planned' && <button disabled={busy} onClick={() => openAdjustment('adjust', true)}>Pas vandaag aan</button>}{!!appointment?.omittedSlots.length && <p className="note">Alleen deze afspraak: {appointment.omittedSlots.map(id => starterProgram.slots.find(slot => slot.id === id)?.name).join(', ')} vervalt.</p>}</section>}
        <section className="group"><h2>Je weekend</h2><p>{workspace.weekend ? `${workspace.weekend} staat in je planning.` : 'Nog niets gepland. Je kiest zelf of je een tweede keer gaat.'}</p><button className="text-button" onClick={() => go('plan')}>Bekijk je trainingsweek</button></section>
        {!!completed.length && <section className="history"><h2>Eerdere trainingen</h2>{completed.map(item => <button key={item.id} className="history-button" onClick={() => go('summary', item.id)}><span>{new Date(item.startedAt).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })} · {resultLabel(item)}</span><span>Bekijk je sessie</span></button>)}</section>}
      </>}
      {safeView === 'overview' && <><h1 tabIndex={-1}>Je full-body training</h1><p>7 oefeningen · 14 werksets · richtduur 60 minuten</p><ExerciseList program={starterProgram} /><p className="note">Neem de eerste keren ruimte voor uitleg en apparaten instellen. Je hebt maximaal 90 minuten beschikbaar.</p><button className="primary" disabled={busy} onClick={running ? () => setSheet('resume') : start}>{running ? 'Verder trainen' : 'Start training'}</button></>}
      {safeView === 'plan' && <><h1 tabIndex={-1}>Je plan</h1><p>Full-body · extra aandacht voor je bovenlichaam</p><section className="plain-panel"><h2>Je trainingsweek</h2><ul className="exercise-list"><li><div><strong>Woensdag</strong><p className="note">Full-body · ongeveer 60 minuten</p></div><span>Vaste training</span></li><li><div><strong>{workspace.weekend ?? 'Weekend'}</strong><p className="note">{workspace.weekend ? 'Full-body · ongeveer 60 minuten' : 'Een tweede training als jij daarvoor kiest.'}</p></div><span>{workspace.weekend ? 'Ingepland' : 'Niet ingepland'}</span></li></ul></section><section className="plain-panel"><h2>Afspraken</h2>{appointments.map(item => <div key={item.id}><p>{dateLabel(item.date)} · {({ planned: 'Gepland', started: 'Gestart', completed: 'Afgerond', aborted: 'Afgebroken', skipped: 'Overgeslagen' })[item.status]}</p>{item.originalDate !== item.date && <p className="note">Eenmalig verplaatst vanaf {dateLabel(item.originalDate)}.</p>}</div>)}</section><button className="primary" onClick={() => go('plan-edit')}>Trainingsdagen aanpassen</button><details><summary>Waarom deze verdeling?</summary><p>Je begint met weinig ervaring, wilt vooral je bovenlichaam ontwikkelen en hebt woensdag als vaste dag. Beide sessies bevatten ook benen. Dezelfde oefeningen geven je gelegenheid de apparaten te leren kennen.</p></details><details><summary>Hoe zit het met vooruitgang?</summary><p>We gebruiken de trainingen die je echt uitvoert. Een weekend dat je niet inplant, is geen gemiste training.</p></details></>}
      {safeView === 'plan-edit' && <PlanEditor workspace={workspace} onBusy={onBusy} onDone={() => go('plan')} onCancel={back} />}
      {safeView === 'warmup' && session && <><h1 tabIndex={-1}>Warm worden</h1><p>5 tot 10 minuten rustig opwarmen.</p><label className="check"><input type="checkbox" disabled={busy || session.status === 'paused'} checked={session.warmed} onChange={event => change(event.target.checked ? 'warmup-on' : 'warmup-off')} />Gedaan</label><section className="group"><h2>{open[0] ? `Daarna: ${open[0].slot.name}` : 'Geen oefeningen meer gepland'}</h2><p>Maak eerst kennis met de instelling en een lichte proefset.</p><p className="muted">Je werkgewicht staat nog niet vast. Daarom vullen we geen kilo’s voor je in.</p></section><button className="primary" disabled={busy} onClick={() => session.status === 'paused' ? change('resume', 'warmup') : change('begin-exercise', 'exercise')}>{session.status === 'paused' ? 'Verder trainen' : open.length ? 'Naar oefening 1' : 'Naar afronden'}</button><button className="text-button" onClick={() => setSheet('interrupt')}>Pauzeren of stoppen</button></>}
      {safeView === 'exercise' && session && <>
        <h1 tabIndex={-1}>{!open.length && !session.rest ? 'Je training' : displayed.slot.name}</h1>
        {session.status === 'paused' ? <section className="plain-panel"><h2>Sessie gepauzeerd</h2><p>Je plek, invoer en resterende rust zijn bewaard.</p><button className="primary" disabled={busy} onClick={() => change('resume', 'exercise')}>Verder trainen</button></section>
          : session.rest ? <section className="rest" aria-label="Rust"><h2>{remaining > 0 ? 'Rust' : 'Rust voorbij'}</h2><div className="timer" role="timer">{timerLabel(remaining)}</div><p role="status">{remaining > 0 ? 'Je set is vastgelegd. Neem je rust.' : 'Je kunt verder. Neem extra rust als je die nodig hebt.'}</p><p>Hierna: {current.slot.name} · set {current.target.number}</p><button className="primary" disabled={busy} onClick={() => change('next-set')}>Verder trainen</button><button className="text-button" disabled={busy} onClick={() => change('extra-rest')}>30 seconden extra rust</button><label className="check"><input type="checkbox" checked={wakeRequested} onChange={event => setWakeRequested(event.target.checked)} />Scherm aanhouden tijdens rust</label><p className="note" role="status">{wakeRequested ? wakeMessage : 'Uit'}</p><p className="note">Houd de app open tijdens je rust. Met een vergrendeld scherm is een rustsignaal niet gegarandeerd.</p></section>
          : !open.length ? <section className="group"><h2>{sets.length === count ? 'Alle sets vastgelegd' : 'Klaar voor vandaag'}</h2><p>Je sessie loopt nog tot je deze afrondt.</p><button className="primary" disabled={busy} onClick={() => openSheet('finish')}>Sessie afronden</button></section>
          : session.phase !== 'exercise' ? <p role="status">Je oefening openen…</p>
          : <WorkoutSetForm key={`${recordId(session.id, current.slot.id, current.target.number)}:${attempt}`} session={session} slot={current.slot} target={current.target} initialDraft={draft} previous={state.previous} onBusy={onBusy} onSaved={() => setError('')} onRecovery={setRecovery} onReload={reloadInput} />}
        {session.status === 'active' && !session.rest && !!open.length && <div className="support-actions"><button disabled={busy} onClick={() => openAdjustment('swap')}>Lukt niet</button><button disabled={busy} onClick={() => openAdjustment('hard')}>Te zwaar</button><button disabled={busy} onClick={() => openAdjustment('time')}>Minder tijd</button></div>}
        {adjustmentNotice}
        <button className="text-button" disabled={busy} onClick={() => setSheet('interrupt')}>Pauzeren of stoppen</button>
        {(!!open.length || session.rest) && <section className="exercise-support"><button className="text-button exercise-help" disabled={busy} onClick={() => setSheet('demo')}>Oefendemonstratie en uitleg</button>
        <details open={Boolean(session.rest)}><summary>Sets bekijken</summary><table className="set-table"><thead><tr><th>Set</th><th>Doel</th><th>Vastgelegd</th></tr></thead><tbody>{displayed.slot.sets.map(target => { const record = sets.find(item => item.slotId === displayed.slot.id && item.number === target.number); return <tr key={target.number}><th scope="row">{target.number}</th><td>{target.repsMin}–{target.repsMax} reps</td><td>{record ? `${formatWeight(record.weight)} kg × ${record.reps}` : session.skipped?.[recordId(session.id, displayed.slot.id, target.number)] ? 'Overgeslagen' : 'Nog niet'}</td></tr> })}</tbody></table></details></section>}
      </>}
      {safeView === 'summary' && session && <><h1 tabIndex={-1}>{resultLabel(session)}</h1><p>{sets.length} van {count} werksets vastgelegd.</p><p className="muted">{sets.length < count ? 'Niet-uitgevoerde sets blijven leeg. Je uitgevoerde sets blijven zichtbaar.' : 'Je hebt alle werksets doorlopen.'}</p><Results session={session} sets={sets} /><p className="note">{Object.keys(session.skipped ?? {}).length} overgeslagen · {count - sets.length - Object.keys(session.skipped ?? {}).length} niet afgemaakt.</p>{adjustmentNotice}<button className="primary" onClick={() => go('consequences', session.id)}>Wat betekent dit?</button><button className="text-button" onClick={() => go('today')}>Terug naar Vandaag</button></>}
      {safeView === 'consequences' && session && <><h1 tabIndex={-1}>Volgende keer</h1><p>Je vorige uitvoering komt naast je nieuwe set te staan.</p><section className="group"><h2>Je doel blijft voorlopig gelijk</h2><p>We hebben nog geen betrouwbare informatie over de inspanning en het apparaat. Daarom verhogen we je gewicht niet automatisch.</p></section><section className="group"><h2>Je planning</h2><p>{workspace.weekend ? `${workspace.weekend} is de tweede sessie die je zelf koos.` : 'Woensdag blijft je vaste dag. Het weekend is nog niet ingepland.'}</p><p>Overgebleven sets worden niet doorgeschoven.</p></section><button className="primary" onClick={() => go('today')}>Terug naar Vandaag</button></>}
    </div>
    <footer className="footer"><span>{offlineReady || swControlled ? 'App offline beschikbaar' : swError ? 'Offline app nog niet beschikbaar' : import.meta.env.DEV ? 'Ontwikkelversie · offline app via preview' : 'App voorbereiden voor offline gebruik…'}</span></footer>
    {['today', 'plan'].includes(safeView) && <nav className="tabs" aria-label="Hoofdnavigatie"><button aria-current={safeView === 'today' ? 'page' : undefined} onClick={() => go('today')}>Vandaag</button><button aria-current={safeView === 'plan' ? 'page' : undefined} onClick={() => go('plan')}>Plan</button></nav>}
    {needRefresh && <aside className="update"><p>Een nieuwe appversie staat klaar. Je opgeslagen invoer blijft behouden.</p><button disabled={busy} onClick={() => void updateServiceWorker(true)}>Nieuwe versie openen</button></aside>}
    {adjustment && <AdjustmentSheet context={adjustment} onBusy={onBusy} onClose={closeAdjustment} onStop={() => { afterAdjustment.current = 'interrupt'; closeAdjustment() }} />}
    {sheet && <Sheet title={{ info: 'Over deze versie', demo: 'Oefenuitleg', resume: 'Verder trainen', interrupt: 'Pauzeren of stoppen', finish: 'Sessie afronden?', abort: 'Sessie afbreken?', legacy: 'Invoer uit de oude versie' }[sheet]} onClose={() => { if (!busy) setSheet(null) }}>
      {sheet === 'legacy' && <><p>Deze invoer is apart bewaard en niet automatisch overgenomen. Sluit oude tabbladen en controleer de waarden voordat je verdergaat.</p><ul>{state.legacyChanges.map((item, index) => <li key={`${index}:${item}`}>{item}</li>)}</ul></>}
      {error && <p className="error" role="alert">{error}</p>}
      {sheet === 'info' && <><p>Low fidelity, echte opslag. Je sessie, setinvoer en rusttijd blijven op dit apparaat bewaard.</p><p>Apparaatinstructies en demonstraties zijn nog niet beschikbaar. Laat de instelling en uitvoering bij de eerste training ter plaatse uitleggen.</p><a href={`${import.meta.env.BASE_URL}?m1=1`}>M1-testregistraties bekijken</a><a href={`${import.meta.env.BASE_URL}m4-voorstel/`}>M4: je startplan bekijken</a><p className="note">Dit is nog geen cloudsynchronisatie. Wissen van browsergegevens verwijdert lokale registraties.</p></>}
      {sheet === 'demo' && <><p>{displayed.slot.name}</p><p>Hier komen een demonstratie, instelhulp en korte aanwijzingen voor jouw apparaat.</p><p>Die inhoud is nog niet beschikbaar. Laat de instelling en uitvoering bij de eerste training ter plaatse uitleggen.</p><button className="primary" onClick={() => setSheet(null)}>Terug naar de set</button></>}
      {sheet === 'resume' && session && <><p>Full-body · {session.cursor} van {count} sets vastgelegd.</p><p>{session.status === 'paused' ? 'Je sessie is gepauzeerd. Je rusttijd gaat verder bij hervatten.' : session.rest ? `Je rust loopt door. Nog ${timerLabel(remaining)}.` : 'Je hervat op dezelfde plek.'}</p><button className="primary" disabled={busy} onClick={() => change('resume', session.phase)}>Verder trainen</button></>}
      {sheet === 'interrupt' && session && <><section className="group"><h3>{session.status === 'paused' ? 'Sessie gepauzeerd' : 'Sessie blijft lopen'}</h3><p>{session.status === 'paused' ? 'Je plek en resterende rust blijven bewaard.' : 'Ook je rusttimer loopt door.'}</p><button disabled={busy} onClick={() => go('today')}>Terug naar Vandaag</button></section><section className="group"><h3>Even pauze</h3><p>Bewaar je plek en zet een lopende rusttimer stil.</p><button disabled={busy || session.status === 'paused'} onClick={() => change('pause', 'today')}>Sessie pauzeren</button></section><section className="group"><h3>Sessie beëindigen</h3><button disabled={busy} onClick={() => openSheet('finish')}>Afronden met wat ik heb gedaan</button><button disabled={busy} onClick={() => openSheet('abort')}>Afbreken</button></section></>}
      {(sheet === 'finish' || sheet === 'abort') && session && <><p>Je hebt {sets.length} van {count} werksets vastgelegd. {sets.length < count ? 'De rest blijft niet uitgevoerd.' : 'Alle werksets zijn klaar.'}</p>{pendingDraft && <p className="error">Er staat nog invoer die niet is vastgelegd. Die telt niet als uitgevoerde set en vervalt als je nu beëindigt.</p>}<p>De vastgelegde sets blijven bewaard. Je sessie krijgt de status {sheet === 'abort' ? 'afgebroken' : sets.length === count ? 'afgerond' : 'deels afgerond'}.</p><button className="primary" disabled={busy} onClick={() => change(sheet === 'abort' ? 'abort' : 'complete', 'summary')}>{sheet === 'abort' ? 'Sessie afbreken' : 'Sessie afronden'}</button><button disabled={busy} onClick={() => setSheet(null)}>Verder trainen</button></>}
    </Sheet>}
  </main>
}

function ExerciseList({ program }: { program: Program }) {
  return <ol className="exercise-list">{program.slots.map(slot => <li key={slot.id}><strong>{slot.name}</strong><span>{slot.sets.length} × {slot.sets[0].repsMin}–{slot.sets[0].repsMax}</span></li>)}</ol>
}
function Results({ session, sets }: { session: Workout; sets: WorkoutSet[] }) {
  return <ul className="exercise-list">{session.snapshot.slots.map(slot => { const records = sets.filter(item => item.slotId === slot.id).sort((a, b) => a.number - b.number); return <li key={slot.id}><div><strong>{slot.name}</strong>{records.length ? records.map(record => <p className="note" key={record.id}>Set {record.number}: {formatWeight(record.weight)} kg × {record.reps}</p>) : <p className="note">{slot.sets.some(target => session.skipped?.[recordId(session.id, slot.id, target.number)]) ? 'Overgeslagen' : 'Niet uitgevoerd'}</p>}</div><span>{records.length}/{slot.sets.length}</span></li> })}</ul>
}
