import { useRef, useState, type FormEvent } from 'react'
import { storageMessage } from '../components/SetForm'
import { formatWeight } from '../model'
import { logSet, writeDraft } from './db'
import { recordId, type Slot, type Target, type Workout, type WorkoutDraft, type WorkoutSet } from './model'

export function WorkoutSetForm({ session, slot, target, initialDraft, previous, onBusy, onSaved, onRecovery, onReload }: {
  session: Workout; slot: Slot; target: Target; initialDraft?: WorkoutDraft
  previous?: WorkoutSet
  onBusy: (busy: boolean) => void; onSaved: () => void
  onRecovery: (draft: WorkoutDraft | null) => void; onReload: () => void
}) {
  const [input, setInput] = useState(() => ({ weight: initialDraft?.weight ?? '', reps: initialDraft?.reps ?? '' }))
  const [status, setStatus] = useState(initialDraft ? 'Concept op apparaat opgeslagen' : 'Vul je uitgevoerde set in.')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const revision = useRef(initialDraft?.revision ?? 0)
  const queue = useRef(Promise.resolve())
  const sequence = useRef(0)
  const submitting = useRef(false)
  const unsaved = useRef(false)

  function makeDraft(value: typeof input): WorkoutDraft {
    return { id: recordId(session.id, slot.id, target.number), sessionId: session.id, ...value, revision: revision.current, updatedAt: new Date().toISOString() }
  }
  function update(field: 'weight' | 'reps', value: string) {
    const next = { ...input, [field]: value }
    setInput(next)
    setStatus('Invoer opslaan…')
    setError('')
    onBusy(true)
    const writeNumber = ++sequence.current
    queue.current = queue.current.then(async () => {
      try {
        const saved = await writeDraft(makeDraft(next), revision.current)
        revision.current = saved.revision
        unsaved.current = false
        if (writeNumber === sequence.current) { setStatus('Concept op apparaat opgeslagen'); setError(''); onRecovery(null) }
      } catch (cause) {
        unsaved.current = true
        if (writeNumber === sequence.current) { setError(storageMessage(cause)); setStatus('Invoer niet opgeslagen'); onRecovery(makeDraft(next)) }
      } finally { if (writeNumber === sequence.current && !submitting.current) onBusy(unsaved.current) }
    })
  }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setSaving(true)
    onBusy(true)
    setError('')
    try {
      await queue.current
      const draft = await writeDraft(makeDraft(input), revision.current)
      revision.current = draft.revision
      unsaved.current = false
      onRecovery(null)
      await logSet(draft, session.revision)
      onSaved()
    } catch (cause) { setError(storageMessage(cause)); setStatus('Set niet vastgelegd') }
    finally { submitting.current = false; setSaving(false); onBusy(unsaved.current) }
  }
  return <form className="set-form" onSubmit={submit} noValidate>
    <h2>Set {target.number} van {slot.sets.length}</h2>
    <p>{target.repsMin}–{target.repsMax} herhalingen. Houd ongeveer {target.rir.min}–{target.rir.max} herhalingen over met goede techniek.</p>
    <p className="note">Eerste training: kies je gewicht na een lichte proefset. Bij twijfel vraag je hulp bij het apparaat.</p>
    <p className="note">{previous ? `Vorige registratie van set ${target.number}: ${formatWeight(previous.weight)} kg × ${previous.reps}. Alleen vergelijkbaar op hetzelfde apparaat.` : 'Nog geen vorige registratie van deze set.'}</p>
    <fieldset className="workout-fields" disabled={saving}>
      <legend className="sr-only">Set registreren</legend>
      <label>Gewicht (kg)<input inputMode="decimal" autoComplete="off" value={input.weight} onChange={event => update('weight', event.target.value)} placeholder="Vul in" /></label>
      <label>Herhalingen<input inputMode="numeric" autoComplete="off" value={input.reps} onChange={event => update('reps', event.target.value)} placeholder="Vul in" /></label>
    </fieldset>
    {error && <div className="error" role="alert"><p>{error}</p>{unsaved.current && <><p>Je kunt opnieuw proberen. Of laad de opgeslagen invoer; daarmee vervang je de invoer hierboven.</p><button type="button" onClick={onReload}>Opgeslagen invoer laden</button></>}</div>}
    <button className="primary" disabled={saving} type="submit">{saving ? 'Vastleggen…' : 'Set vastleggen'}</button>
    <p className="save-status" role="status">{status}</p>
  </form>
}
