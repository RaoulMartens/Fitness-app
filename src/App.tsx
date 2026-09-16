import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { db, finishSession, startSession } from './db'
import { formatWeight, setId, type Session } from './model'
import { SetForm, storageMessage } from './components/SetForm'
import { Sheet } from './components/Sheet'

export function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [view, setView] = useState<'exercise' | 'today'>('exercise')
  const [sheet, setSheet] = useState<'demo' | 'info' | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [savedNumber, setSavedNumber] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [swError, setSwError] = useState(false)
  const [swControlled, setSwControlled] = useState(Boolean(navigator.serviceWorker?.controller))
  const { offlineReady: [offlineReady], needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisterError: () => setSwError(true),
  })
  const formBusy = useRef(false)

  useEffect(() => {
    let active = true
    void startSession().then(() => { if (active) { setReady(true); setError('') } }, cause => { if (active) setError(storageMessage(cause)) })
    return () => { active = false }
  }, [attempt])

  useEffect(() => {
    const connection = () => setOnline(navigator.onLine)
    const control = () => setSwControlled(Boolean(navigator.serviceWorker.controller))
    window.addEventListener('online', connection)
    window.addEventListener('offline', connection)
    navigator.serviceWorker?.addEventListener('controllerchange', control)
    return () => {
      window.removeEventListener('online', connection)
      window.removeEventListener('offline', connection)
      navigator.serviceWorker?.removeEventListener('controllerchange', control)
    }
  }, [])

  const state = useLiveQuery(async () => {
    if (!ready) return null
    try {
      const workspace = await db.workspace.get('main')
      const session = workspace && await db.sessions.get(workspace.activeSessionId)
      if (!session) throw new Error('De testsessie is niet gevonden. Je gegevens zijn niet overschreven.')
      const [sets, drafts, sessions] = await Promise.all([
        db.sets.where('sessionId').equals(session.id).sortBy('number'),
        db.drafts.where('sessionId').equals(session.id).toArray(),
        db.sessions.orderBy('createdAt').reverse().toArray(),
      ])
      return { session, sets, drafts, sessions, failure: null }
    } catch (cause) {
      return { failure: storageMessage(cause) }
    }
  }, [ready, attempt])

  function changeView(next: 'exercise' | 'today') {
    if (formBusy.current) return
    setView(next)
    setSelected(null)
    setSavedNumber(null)
    setEditing(false)
  }

  async function action(task: () => Promise<unknown>) {
    if (busy) return
    setBusy(true)
    setError('')
    try { await task() } catch (cause) { setError(storageMessage(cause)) } finally { setBusy(false) }
  }

  const loadError = state?.failure || (!ready && error)
  if (loadError) return <main className="app loading"><h1>Je invoer openen lukt niet</h1><p role="alert">{loadError}</p><p>Er is niets gewist. Controleer of deze browser lokale opslag toestaat.</p><button className="primary" onClick={() => setAttempt(value => value + 1)}>Opnieuw proberen</button></main>
  if (!ready || !state || state.failure !== null) return <main className="app loading"><h1>Training</h1><p role="status">Je invoer openen…</p></main>

  const { session, sets, drafts, sessions } = state
  const firstOpen = session.prescription.sets.find(target => !sets.some(record => record.number === target.number))
  const firstDraft = session.prescription.sets.find(target => drafts.some(draft => draft.id === setId(session.id, target.number)))
  const currentNumber = selected ?? firstDraft?.number ?? firstOpen?.number ?? 1
  const target = session.prescription.sets.find(target => target.number === currentNumber)!
  const saved = sets.find(record => record.number === currentNumber)
  const draft = drafts.find(draft => draft.id === setId(session.id, currentNumber))
  const complete = sets.length === session.prescription.sets.length
  const showForm = session.status === 'active' && savedNumber === null && (editing || !saved || Boolean(draft))

  return <main className="app">
    <header className="topbar">
      <span>Werkend wireframe · M1</span>
      <button className="text-button" onClick={() => setSheet('info')}>Over deze versie</button>
    </header>
    <div className="test-note">Testgegevens · nog geen persoonlijk trainingsschema</div>
    <div className="content">
      <nav className="session-nav" aria-label="Sessie">
        <span>{online ? 'Op dit apparaat' : 'Offline · op dit apparaat'}</span>
        <button className="text-button" disabled={busy} onClick={() => changeView(view === 'exercise' ? 'today' : 'exercise')}>{view === 'exercise' ? 'Naar Vandaag' : 'Terug naar oefening'}</button>
      </nav>
      {error && <div className="error" role="alert">{error}<button onClick={() => setError('')}>Sluiten</button></div>}
      {view === 'today' ? <>
        <h1>Vandaag</h1>
        <section className="plain-panel">
          <h2>{session.status === 'completed' ? 'Testsessie afgerond' : 'Je testsessie staat klaar'}</h2>
          <p>{session.prescription.name}</p>
          <p>{sets.length} van {session.prescription.sets.length} sets vastgelegd{drafts.length ? ' · concept bewaard' : ''}.</p>
          <button className="primary" onClick={() => changeView('exercise')}>{session.status === 'completed' ? 'Registratie bekijken' : 'Verder trainen'}</button>
        </section>
        <p className="muted">Navigeren verandert je registratie niet.</p>
        <History sessions={sessions} />
      </> : <>
        <section className="exercise-heading">
          <h1>{session.prescription.name}</h1>
          <p className="muted">Oefening 1 van 1 · {session.prescription.sets.length} testsets</p>
        </section>
        <button className="demo-placeholder" onClick={() => setSheet('demo')} aria-label="Oefenuitleg bekijken">
          <span>Oefendemo</span><span>Video nog niet beschikbaar</span><span className="underlined">Bekijk de aanwijzingen</span>
        </button>
        <section aria-label="Setregistraties">
          <table className="set-table"><thead><tr><th>Set</th><th>Testdoel</th><th>Vastgelegd</th><th><span className="sr-only">Actie</span></th></tr></thead>
            <tbody>{session.prescription.sets.map(item => {
              const record = sets.find(set => set.number === item.number)
              const hasDraft = drafts.some(draft => draft.id === setId(session.id, item.number))
              return <tr key={item.number} className={showForm && item.number === currentNumber ? 'current' : undefined}>
                <th scope="row">{item.number}</th><td>{formatWeight(item.weight)} × {item.reps}</td>
                <td>{record ? `${formatWeight(record.weight)} × ${record.reps}` : '—'}{hasDraft && <small>Concept</small>}</td>
                <td>{session.status === 'active' && (record || hasDraft) ? <button className="text-button" disabled={busy} onClick={() => {
                  setSelected(item.number); setSavedNumber(null); setEditing(true); setFormKey(value => value + 1)
                }} aria-label={`Set ${item.number} aanpassen`}>Wijzig</button> : record ? <span aria-label="Opgeslagen">✓</span> : null}</td>
              </tr>
            })}</tbody>
          </table>
          <p className="table-unit">Gewicht in kg × herhalingen. Geen eerdere prestaties verzonnen.</p>
        </section>
        <hr />
        {showForm ? <SetForm key={`${session.id}:${currentNumber}:${formKey}`} session={session} target={target} saved={saved} initialDraft={draft}
          onBusy={value => { formBusy.current = value; setBusy(value) }} onSaved={() => { setSavedNumber(currentNumber); setEditing(false) }} />
          : session.status === 'completed' ? <section className="result" aria-labelledby="completed-heading">
            <h2 id="completed-heading">Testsessie afgerond</h2><p>Alle {sets.length} sets staan op dit apparaat.</p>
            <button className="primary" disabled={busy} onClick={() => void action(async () => {
              await startSession(db, true); setSelected(null); setSavedNumber(null); setEditing(false); setFormKey(value => value + 1)
            })}>Nieuwe testsessie</button>
            <p className="muted">Je vorige registratie blijft bewaard.</p>
          </section> : <section className="result" aria-labelledby="saved-heading">
            <h2 id="saved-heading">{savedNumber ? `Set ${savedNumber} vastgelegd` : 'Alle testsets vastgelegd'}</h2>
            <p role="status">Op apparaat opgeslagen</p>
            {(firstDraft || firstOpen) ? <button className="primary" disabled={busy} onClick={() => {
              setSelected((firstDraft ?? firstOpen)!.number); setSavedNumber(null); setEditing(false); setFormKey(value => value + 1)
            }}>{firstDraft ? 'Concept afmaken' : 'Volgende set'}</button> : complete ? <button className="primary" disabled={busy} onClick={() => void action(() => finishSession(session.id))}>Testsessie afronden</button> : null}
          </section>}
      </>}
    </div>
    <footer className="footer"><span>{offlineReady || swControlled ? 'App offline beschikbaar' : swError ? 'Offline app nog niet beschikbaar' : import.meta.env.DEV ? 'Ontwikkelversie · offline app via preview' : 'App voorbereiden voor offline gebruik…'}</span><span>Lokale opslag · geen cloudsynchronisatie</span></footer>
    {needRefresh && <aside className="update"><p>Een nieuwe appversie staat klaar. Je opgeslagen invoer blijft behouden.</p><button disabled={busy} onClick={() => void updateServiceWorker(true)}>Nieuwe versie openen</button></aside>}
    {sheet === 'demo' && <Sheet title="Oefenuitleg" onClose={() => setSheet(null)}>
      <p>Een demonstratievideo is nog niet toegevoegd.</p>
      <ul className="cues">{session.prescription.cues.map(cue => <li key={cue}>{cue}</li>)}</ul>
      <p className="muted">Aanwijzingen uit de wireflow. Deze versie test registratie, niet jouw trainingsprogramma.</p>
      <button className="primary" onClick={() => setSheet(null)}>Terug naar de set</button>
    </Sheet>}
    {sheet === 'info' && <Sheet title="Over deze versie" onClose={() => setSheet(null)}>
      <p>Low fidelity, echte opslag. Je test gewicht en herhalingen invullen, vastleggen, corrigeren en terugkomen.</p>
      <p>De testwaarden zijn geen trainingsadvies. Timer, persoonlijk schema, echte video's en synchronisatie volgen in latere stappen.</p>
      <h3>Op je beginscherm</h3><p>Open de app in Safari, kies Deel en vervolgens Zet op beginscherm. Op Android vind je Installeren in het browsermenu.</p>
      <p className="muted">Installeren en offline werken vragen HTTPS of localhost en een eerste bezoek met verbinding. Wissen van browsergegevens verwijdert lokale registraties.</p>
      <button className="primary" onClick={() => setSheet(null)}>Terug naar de app</button>
    </Sheet>}
  </main>
}

function History({ sessions }: { sessions: Session[] }) {
  const [opened, setOpened] = useState<string | null>(null)
  const records = useLiveQuery(() => opened ? db.sets.where('sessionId').equals(opened).sortBy('number') : [], [opened])
  const completed = sessions.filter(session => session.status === 'completed')
  if (!completed.length) return null
  return <section className="history"><h2>Eerdere testsessies</h2>{completed.map(session => <div key={session.id}>
    <button className="history-button" aria-expanded={opened === session.id} onClick={() => setOpened(opened === session.id ? null : session.id)}>
      {new Date(session.createdAt).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}<span>{opened === session.id ? 'Sluiten' : 'Bekijk sets'}</span>
    </button>
    {opened === session.id && <ul>{records?.map(record => <li key={record.id}>Set {record.number}: {formatWeight(record.weight)} kg × {record.reps} reps</li>)}</ul>}
  </div>)}</section>
}
