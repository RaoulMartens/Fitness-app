import { useRef, useState } from 'react'
import { Sheet } from '../components/Sheet'
import { storageMessage } from '../components/SetForm'
import { adjustWorkout, changeAppointment, type AdjustmentCommand, type AppointmentCommand } from './db'
import { dateLabel, localDate, pendingTargets, starterProgram, type Appointment, type DraftVersions, type Workout } from './model'

export type AdjustmentView = 'adjust' | 'swap' | 'busy' | 'material' | 'pain' | 'skip' | 'time' | 'time-review' | 'hard' | 'structural' | 'weight' | 'postpone' | 'postpone-review' | 'skip-day' | 'undo'
export type AdjustmentContext = { view: AdjustmentView; session?: Workout; appointment?: Appointment; drafts: DraftVersions }
export function AdjustmentSheet({ context, onClose, onBusy, onStop }: {
  context: AdjustmentContext; onClose: () => void; onBusy: (value: boolean) => void; onStop: () => void
}) {
  const [view, setView] = useState(context.view)
  const [selection, setSelection] = useState<string[]>(context.appointment?.omittedSlots ?? [])
  const [reason, setReason] = useState<'day' | 'technique' | 'structural'>('day')
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(context.appointment?.date ?? localDate())
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const saving = useRef(false)
  const [operationId] = useState(() => crypto.randomUUID())
  const session = context.session
  const open = session ? pendingTargets(session) : []
  const slots = session ? session.snapshot.slots.filter(slot => open.some(item => item.slot.id === slot.id)) : starterProgram.slots
  const current = open[0]
  const next = open.find(item => item.slot.id !== current?.slot.id)
  const count = (id: string) => session ? open.filter(item => item.slot.id === id).length : starterProgram.slots.find(slot => slot.id === id)!.sets.length
  const titles: Record<AdjustmentView, string> = { adjust: 'Wat is er anders vandaag?', swap: 'Wat is er?', busy: 'Apparaat bezet', material: 'Geen materiaal', pain: 'Stop deze oefening', skip: 'Oefening overslaan', time: 'Minder tijd vandaag', 'time-review': 'Dit verandert vandaag', hard: 'Zwaarder dan verwacht', structural: 'Structureel te zwaar', weight: 'Alleen vandaag aanpassen', postpone: 'Training verplaatsen', 'postpone-review': 'Deze afspraak verplaatsen?', 'skip-day': 'Vandaag overslaan?', undo: 'Aanpassing terugdraaien?' }
  async function save(workoutCommand: AdjustmentCommand | null, appointmentCommand?: AppointmentCommand) {
    if (saving.current) return
    saving.current = true; setBusy(true); onBusy(true); setError('')
    try {
      if (session && workoutCommand) await adjustWorkout(session.id, session.revision, operationId, context.drafts, workoutCommand)
      else if (context.appointment && appointmentCommand) await changeAppointment(context.appointment.id, context.appointment.revision, operationId, appointmentCommand)
      else throw new Error('Open de actuele training opnieuw.')
      onBusy(false); onClose()
    } catch (cause) { setError(storageMessage(cause)) }
    finally { saving.current = false; setBusy(false); onBusy(false) }
  }
  const choose = (target: AdjustmentView) => { setError(''); setView(target) }
  const reasonButton = (label: string, value: typeof reason) => <button disabled={busy} onClick={() => { setReason(value); choose('weight') }}>{label}</button>
  const timeChanged = session ? selection.length > 0 : [...selection].sort().join() !== [...(context.appointment?.omittedSlots ?? [])].sort().join()
  return <Sheet title={titles[view]} onClose={() => { if (!saving.current) onClose() }}>
    {error && <p role="alert" className="error">{error}</p>}
    <fieldset className="adjustment-fields" disabled={busy}>
      {view === 'adjust' && <><button onClick={() => choose('time')}>Ik heb minder tijd</button><button onClick={() => choose('postpone')}>Training verplaatsen</button><button onClick={() => choose('skip-day')}>Ik sla vandaag over</button></>}
      {view === 'swap' && <><button onClick={() => choose('busy')}>Bezet</button><button onClick={() => choose('material')}>Geen materiaal</button><button onClick={() => choose('pain')}>Pijn</button></>}
      {view === 'busy' && (next ? <><dl className="change-list"><div><dt>Nu</dt><dd>{next.slot.name}</dd></div><div><dt>Daarna</dt><dd>{current?.slot.name} achteraan</dd></div></dl><p className="note">Alleen vandaag.</p><button className="primary" onClick={() => void save({ kind: 'later' })}>Later doen</button></> : <><p>Er staat geen andere oefening meer open.</p><button className="primary" onClick={onClose}>Bij deze oefening blijven</button><button onClick={() => choose('skip')}>Oefening overslaan</button></>)}
      {(['material', 'pain', 'skip'] as AdjustmentView[]).includes(view) && current && <>
        {view === 'pain' && <p>Sla deze oefening over of stop de training.</p>}
        {view === 'material' && <p>Nog geen gecontroleerd alternatief beschikbaar.</p>}
        <p>{current.slot.name} · {count(current.slot.id)} open sets vervallen vandaag.</p>
        <button className="primary" onClick={() => void save({ kind: 'skip', reason: view === 'pain' ? 'pain' : view === 'material' ? 'material' : 'skip' })}>Resterende sets overslaan</button><button onClick={onStop}>Training stoppen</button>
      </>}
      {view === 'time' && <><p>Wat sla je vandaag over?</p>{slots.map(slot => <label className="check choice" key={slot.id}><input type="checkbox" checked={selection.includes(slot.id)} onChange={event => setSelection(value => event.target.checked ? [...value, slot.id] : value.filter(id => id !== slot.id))} />{slot.name} · {count(slot.id)} open sets</label>)}<p className="note">Alleen vandaag.</p><button className="primary" disabled={!timeChanged} onClick={() => choose('time-review')}>Bekijk het gevolg</button></>}
      {view === 'time-review' && <><section className="plain-panel"><h3>Vervalt</h3><ul>{slots.filter(slot => selection.includes(slot.id)).map(slot => <li key={slot.id}>{slot.name} · {count(slot.id)} sets</li>)}</ul>{!selection.length && <p>Niets.</p>}<h3>Blijft</h3><p>{slots.filter(slot => !selection.includes(slot.id)).map(slot => slot.name).join(', ') || 'Geen open oefeningen. Je rondt af met wat je hebt gedaan.'}</p></section><p>Volgende training ongewijzigd.</p><button className="primary" onClick={() => void save({ kind: 'time', slots: selection }, { kind: 'time', slots: selection })}>Accepteren</button><button onClick={() => choose('time')}>Zelf aanpassen</button></>}
      {view === 'hard' && <><p>Hoe komt dat volgens jou?</p>{reasonButton('Dagvorm', 'day')}{reasonButton('Techniek onzeker', 'technique')}<button onClick={() => choose('structural')}>Structureel te zwaar</button></>}
      {view === 'structural' && <><p>Je plan aanpassen is nog niet beschikbaar. Je kunt wel het doel voor vandaag wijzigen.</p>{reasonButton('Alleen vandaag aanpassen', 'structural')}<button onClick={onClose}>Niets veranderen</button></>}
      {view === 'weight' && <><p>Volgende training ongewijzigd.</p><label className="adjustment-input">Doelgewicht (kg)<input inputMode="decimal" autoComplete="off" value={weight} onChange={event => setWeight(event.target.value)} /></label><button className="primary" onClick={() => void save({ kind: 'weight', weight, reason })}>Doel vandaag gebruiken</button><button onClick={() => choose('skip')}>Oefening overslaan</button></>}
      {view === 'undo' && <><p>Herstel de laatste aanpassing. Gedane sets blijven staan.</p><button className="primary" onClick={() => void save({ kind: 'undo' })}>Terugdraaien</button></>}
      {view === 'postpone' && <><p>Eenmalig. Je vaste trainingsdagen blijven staan.</p><label className="adjustment-input">Nieuwe datum<input type="date" min={localDate()} value={date} onChange={event => setDate(event.target.value)} /></label><button className="primary" disabled={!date || date < localDate() || date === context.appointment?.date} onClick={() => choose('postpone-review')}>Bekijk het gevolg</button></>}
      {view === 'postpone-review' && context.appointment && <><dl className="change-list"><div><dt>Van</dt><dd>{dateLabel(context.appointment.date)}</dd></div><div><dt>Naar</dt><dd>{dateLabel(date)}</dd></div></dl><button className="primary" onClick={() => void save(null, { kind: 'move', date })}>Verplaatsen</button></>}
      {view === 'skip-day' && context.appointment && <><p>{dateLabel(context.appointment.date)} vervalt. Geen inhaaltraining.</p><button className="primary" onClick={() => void save(null, { kind: 'skip' })}>Ja, deze training overslaan</button></>}
    </fieldset>
  </Sheet>
}
