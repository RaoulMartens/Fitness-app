import { useRef, useState, type FormEvent } from 'react'
import { confirmSet, saveDraft } from '../db'
import { formatWeight, setId, type Draft, type Session, type SetRecord, type SetTarget } from '../model'

export function SetForm({ session, target, saved, initialDraft, onSaved, onBusy }: {
  session: Session; target: SetTarget; saved?: SetRecord; initialDraft?: Draft
  onSaved: () => void; onBusy: (busy: boolean) => void
}) {
  const [draft, setDraft] = useState<Draft>(() => initialDraft ?? {
    id: setId(session.id, target.number), sessionId: session.id,
    weight: formatWeight(saved?.weight ?? target.weight), reps: String(saved?.reps ?? target.reps),
    baseRevision: saved?.revision ?? 0, updatedAt: new Date().toISOString(),
  })
  const [status, setStatus] = useState(initialDraft ? 'Concept op apparaat opgeslagen' : saved ? 'Op apparaat opgeslagen' : 'Voorgevuld met testwaarden')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const busy = useRef(false)
  const sequence = useRef(0)

  function update(field: 'weight' | 'reps', value: string) {
    const next = { ...draft, [field]: value, updatedAt: new Date().toISOString() }
    setDraft(next)
    setError('')
    setStatus('Invoer opslaan…')
    const current = ++sequence.current
    onBusy(true)
    // Start the IndexedDB write on every input event, not on blur or page unload.
    const write = saveDraft(next)
    void write.then(() => {
      if (current === sequence.current) { setStatus('Concept op apparaat opgeslagen'); onBusy(false) }
    }, cause => {
      if (current === sequence.current) { setError(storageMessage(cause)); setStatus('Invoer niet opgeslagen'); onBusy(false) }
    })
  }

  function step(field: 'weight' | 'reps', change: number) {
    const value = Number(draft[field].replace(',', '.'))
    const next = Math.max(field === 'weight' ? 0 : 1, Math.min(field === 'weight' ? 9999 : 999, (Number.isFinite(value) ? value : 0) + change))
    update(field, field === 'weight' ? formatWeight(next) : String(Math.round(next)))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy.current || confirmed) return
    busy.current = true
    setSaving(true)
    onBusy(true)
    setError('')
    try {
      // Retry the latest draft too: a previous storage failure must not poison retries.
      await saveDraft(draft)
      await confirmSet(session.id, target.number, draft)
      setConfirmed(true)
      setStatus('Op apparaat opgeslagen')
      onSaved()
    } catch (cause) {
      setError(storageMessage(cause))
      setStatus('Set niet vastgelegd')
    } finally {
      busy.current = false
      setSaving(false)
      onBusy(false)
    }
  }

  return <form onSubmit={submit} noValidate className="set-form">
    <h2>{saved ? 'Set aanpassen' : `Set ${target.number}${target.number === session.prescription.sets.length ? ' · laatste' : ''}`}</h2>
    <p className="target">Testdoel: <strong>{target.reps} reps op {formatWeight(target.weight)} kg.</strong></p>
    <fieldset disabled={saving || confirmed} className="fields">
      <legend className="sr-only">Set {target.number} registreren</legend>
      <div className="field-group">
        <label htmlFor="weight">Gewicht <span>kg</span></label>
        <div className="stepper">
          <button type="button" aria-label="Gewicht verlagen" onClick={() => step('weight', -session.prescription.weightStep)}>−</button>
          <input id="weight" type="text" inputMode="decimal" autoComplete="off" value={draft.weight} onChange={event => update('weight', event.target.value)} aria-describedby={error ? 'set-error' : undefined} />
          <button type="button" aria-label="Gewicht verhogen" onClick={() => step('weight', session.prescription.weightStep)}>+</button>
        </div>
      </div>
      <div className="field-group">
        <label htmlFor="reps">Herhalingen <span>reps</span></label>
        <div className="stepper">
          <button type="button" aria-label="Herhalingen verlagen" onClick={() => step('reps', -1)}>−</button>
          <input id="reps" type="text" inputMode="numeric" autoComplete="off" value={draft.reps} onChange={event => update('reps', event.target.value)} aria-describedby={error ? 'set-error' : undefined} />
          <button type="button" aria-label="Herhalingen verhogen" onClick={() => step('reps', 1)}>+</button>
        </div>
      </div>
    </fieldset>
    {error && <p role="alert" id="set-error" className="error">{error}</p>}
    <button type="submit" className="primary" disabled={saving || confirmed}>{saving ? 'Vastleggen…' : confirmed ? 'Set vastgelegd' : saved ? 'Wijziging vastleggen' : 'Set vastleggen'}</button>
    <p className="save-status" role="status">{status}</p>
  </form>
}

export function storageMessage(cause: unknown) {
  if (cause instanceof Error) {
    if (cause.name === 'QuotaExceededError') return 'De opslag is vol. Je invoer staat nog in beeld. Maak ruimte vrij en probeer opnieuw.'
    return cause.message
  }
  return 'Opslaan is niet gelukt. Je invoer staat nog in beeld. Probeer opnieuw.'
}
