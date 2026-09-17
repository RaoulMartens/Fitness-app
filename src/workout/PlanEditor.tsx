import { useRef, useState } from 'react'
import { storageMessage } from '../components/SetForm'
import { savePlanDraft, updateWeekend } from './db'
import type { WorkoutWorkspace } from './model'

export function PlanEditor({ workspace, onBusy, onDone, onCancel }: { workspace: WorkoutWorkspace; onBusy: (value: boolean) => void; onDone: () => void; onCancel: () => void }) {
  const [weekend, setWeekend] = useState(workspace.planDraft?.baseRevision === workspace.revision ? workspace.planDraft.weekend : workspace.weekend)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const baseRevision = useRef(workspace.revision)
  const pending = useRef(false)
  async function apply(value: WorkoutWorkspace['weekend'], commit = false) {
    if (pending.current) return
    pending.current = true; setBusy(true); onBusy(true); setError('')
    if (!commit) setWeekend(value)
    try {
      if (commit) { await updateWeekend(value, baseRevision.current); onBusy(false); onDone() }
      else await savePlanDraft(value, baseRevision.current)
    } catch (cause) { setError(storageMessage(cause)) }
    finally { pending.current = false; setBusy(false); onBusy(false) }
  }
  return <>
    <h1 tabIndex={-1}>Trainingsdagen aanpassen</h1>
    <section className="plain-panel"><h2>Woensdag</h2><p>Je vaste training · ongeveer 60 minuten</p><p className="note">Woensdag blijft de basis van dit voorstel.</p></section>
    <fieldset className="choices" disabled={busy}><legend>Je optionele weekendtraining</legend>
      {([null, 'Zaterdag', 'Zondag'] as const).map(day => <label className="choice" key={day ?? 'none'}><input type="radio" name="weekend" checked={weekend === day} onChange={() => void apply(day)} />{day ?? 'Nog niet inplannen'}</label>)}
    </fieldset>
    <p>Alleen jouw keuze maakt dit een geplande tweede training.</p>
    {error && <p className="error" role="alert">{error}</p>}
    <button className="primary" disabled={busy} onClick={() => void apply(weekend, true)}>Planning opslaan</button>
    <button className="text-button" disabled={busy} onClick={onCancel}>Annuleren</button>
  </>
}
