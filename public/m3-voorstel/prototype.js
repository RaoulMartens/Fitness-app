const KEY = 'training-m3-review-v1'
const names = ['Leg press', 'Leg curl', 'Chest press', 'Zittende row', 'Lat pulldown', 'Biceps curl', 'Triceps pushdown']
const app = document.querySelector('#app')
const dialog = document.querySelector('#sheet')
const content = document.querySelector('#sheet-content')
const storageError = document.querySelector('#storage-error')
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c])
const button = (label, action, primary = false) => `<button data-action="${action}"${primary ? ' class="primary"' : ''}>${label}</button>`
const fresh = active => ({ version:1, status:active ? 'active' : 'planned', appointment:'2026-09-23', originalDate:'2026-09-23', order:names.map((_,i) => i), sets:active ? [{slot:0,number:1},{slot:0,number:2},{slot:1,number:1},{slot:1,number:2}] : [], skipped:[], drafts:{}, weights:{}, changes:[], undo:null })
let state = fresh(true)
let sheet = null
let selection = []
let reason = ''
let view = ['today','exercise','plan','summary'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'exercise'
try {
  const saved = sessionStorage.getItem(KEY)
  if (saved) {
    const parsed = JSON.parse(saved)
    if (parsed.version !== 1 || !Array.isArray(parsed.order) || !Array.isArray(parsed.sets) || !Array.isArray(parsed.skipped) || !parsed.drafts || !parsed.weights || !Array.isArray(parsed.changes)) throw new Error('Onbekend voorbeeldformaat')
    state = parsed
  }
} catch (error) {
  storageError.hidden = false
  storageError.textContent = `Het opgeslagen voorbeeld kon niet worden geopend. Een nieuw voorbeeld staat klaar. ${error.message}`
}
function persist(next) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next))
    storageError.hidden = true
    return true
  } catch (error) {
    storageError.hidden = false
    storageError.textContent = `Proefkeuze niet opgeslagen. Houd dit tabblad open en probeer opnieuw. ${error.message}`
    return false
  }
}
const remaining = slot => [1,2].filter(number => !state.sets.some(s => s.slot === slot && s.number === number) && !state.skipped.some(s => s.slot === slot && s.number === number))
const openSlots = () => state.order.filter(slot => remaining(slot).length)
const current = () => openSlots()[0]
const draft = () => state.drafts[current()] ?? { weight:'', reps:'' }
const dateLabel = date => new Intl.DateTimeFormat('nl-NL', { weekday:'long',day:'numeric',month:'long' }).format(new Date(`${date}T12:00:00`))
const active = () => ['active','paused'].includes(state.status)
function tabs() { return `<nav class="wf-tab-bar" aria-label="Hoofdnavigatie"><button data-action="nav-today" ${view === 'today' ? 'aria-current="page"' : ''}>Vandaag</button><button data-action="nav-plan" ${view === 'plan' ? 'aria-current="page"' : ''}>Plan</button></nav>` }
function changeNotice() { return state.changes.length ? `<div class="notice"><strong>Alleen vandaag</strong><p>${escape(state.changes.at(-1))}</p>${state.undo && (active() || state.status === 'planned') ? button('Aanpassing terugdraaien','undo') : ''}</div>` : '' }
function render() {
  let body = ''
  if (view === 'today') {
    const statusText = {active:'Je training loopt',paused:'Je training is gepauzeerd',planned:'Je volgende training',skipped:'Training bewust overgeslagen',completed:'Training afgerond',aborted:'Training afgebroken'}[state.status]
    body = `<h1 tabindex="-1">Vandaag</h1><section class="wf-card"><h2>${statusText}</h2><p>Full-body · ${dateLabel(state.appointment)}</p>${active() ? `<p>${state.sets.length} sets gedaan</p>${button('Verder trainen','resume',true)}` : state.status === 'planned' ? button('Start training','start',true) : `<p>Geen inhaalverplichting.</p>${button('Bekijk het resultaat','nav-summary')}`}</section>${state.status === 'planned' ? button('Pas vandaag aan','open-adjust') : ''}${changeNotice()}`
  } else if (view === 'plan') {
    body = `<h1 tabindex="-1">Plan</h1><section class="wf-card"><h2>Je trainingsweek</h2><p>Woensdag · vaste training<br>Weekend · nog niet gepland</p></section><section class="wf-card"><h3>Volgende afspraak</h3><p>${dateLabel(state.appointment)}</p>${state.appointment !== state.originalDate ? `<p>Eenmalig verplaatst vanaf ${dateLabel(state.originalDate)}.</p>` : ''}<p>${state.status === 'skipped' ? 'Bewust overgeslagen' : state.status === 'planned' ? 'Gepland' : 'Bekijk je uitvoering op Vandaag'}</p></section>`
  } else if (view === 'summary') {
    body = `<h1 tabindex="-1">${state.status === 'aborted' ? 'Training afgebroken' : state.status === 'skipped' ? 'Training overgeslagen' : 'Je resultaat'}</h1><div class="wf-card"><p>${state.status === 'skipped' ? 'Deze afspraak is bewust overgeslagen. Er is geen training gestart.' : `${state.sets.length} sets gedaan · ${state.skipped.length} overgeslagen · ${14-state.sets.length-state.skipped.length} niet afgemaakt.`}</p><p class="muted">Geen inhaaltraining.</p></div><ul>${state.changes.map(c => `<li>${escape(c)}</li>`).join('')}</ul>${button('Naar Vandaag','nav-today',true)}`
  } else if (!active()) {
    body = `<h1 tabindex="-1">Geen lopende training</h1>${button('Naar Vandaag','nav-today',true)}`
  } else if (state.status === 'paused') {
    body = `<h1 tabindex="-1">Training gepauzeerd</h1>${button('Verder trainen','resume',true)}`
  } else if (current() === undefined) {
    body = `<h1 tabindex="-1">Je bent klaar voor vandaag</h1><p>${state.sets.length} sets gedaan · ${state.skipped.length} overgeslagen.</p>${changeNotice()}${button('Sessie afronden','open-complete',true)}`
  } else {
    const slot = current()
    body = `<nav class="wf-nav"><span>Training · ${state.sets.length}/14 sets</span>${button('Naar Vandaag','nav-today')}</nav><h1 tabindex="-1">${names[slot]}</h1><div class="prescription"><span><strong>${remaining(slot)[0]} / 2</strong>set</span><span><strong>${[1,5,6].includes(slot) ? '10–15' : '8–12'}</strong>herhalingen</span></div><p class="muted">Houd 2–3 herhalingen over.</p>${state.weights[slot] ? `<div class="notice">Doel vandaag: ${escape(state.weights[slot])} kg</div>` : ''}${changeNotice()}<form id="set-form" class="group"><div class="fields"><label>Gewicht (kg)<input name="weight" inputmode="decimal" value="${escape(draft().weight)}" autocomplete="off"></label><label>Herhalingen<input name="reps" inputmode="numeric" value="${escape(draft().reps)}" autocomplete="off"></label></div><p id="form-error" role="alert" class="error" hidden></p><button type="submit" class="primary">Set vastleggen</button></form><div class="support-actions">${button('Lukt niet','open-swap')}${button('Te zwaar','open-hard')}${button('Minder tijd','open-time')}</div><div class="session-tools"><details><summary>Hierna</summary><ol>${openSlots().map(s => `<li>${names[s]} · ${remaining(s).length} sets</li>`).join('')}</ol></details><button data-action="open-interrupt" class="text-action">Pauzeren / stoppen</button></div>`
  }
  app.innerHTML = `${body}${tabs()}`
}
function navigate(target) {
  view = target
  history.pushState({ view }, '', `#${view}`)
  render()
  app.querySelector('h1')?.focus()
  window.scrollTo(0,0)
}
function openSheet(name) {
  if (!sheet) history.pushState({ view, sheet:true }, '', `#${view}`)
  sheet = name
  renderSheet()
  if (!dialog.open) dialog.showModal()
  content.querySelector('h2')?.focus()
}
function closeSheet() {
  if (!sheet) return
  sheet = null
  dialog.close()
  history.back()
}
function applyChange(text, mutate) {
  const next = structuredClone(state)
  next.undo = { order:[...state.order], skipped:structuredClone(state.skipped), weights:{...state.weights}, changes:[...state.changes] }
  mutate(next)
  next.changes.push(text)
  if (!persist(next)) return
  state = next
  closeSheet()
  render()
}
function skipSlots(next, slots, why) {
  for (const slot of slots) for (const number of remaining(slot)) next.skipped.push({ slot,number,reason:why })
}
function renderSheet() {
  const slot = current()
  let title = '', body = ''
  if (sheet === 'about') {
    title = 'Over dit prototype'
    body = `<p>Je test de flow met voorbeeldgegevens. Je echte training blijft in de hoofdapp.</p><p class="muted">Alleen opslag in dit tabblad. Geen rusttimer; de training begint met vier fictieve sets.</p>${button('Voorbeeld tijdens training','reset-active')}${button('Voorbeeld voor de training','reset-planned')}<a href="../">Naar de werkende app</a><a href="./wireframes/today.html">Statische wireframes</a>`
  } else if (sheet === 'adjust') {
    title = 'Wat is er anders vandaag?'
    body = `${button('Ik heb minder tijd','open-time')}${button('Training verplaatsen','open-postpone')}${button('Ik sla vandaag over','open-skip-day')}`
  } else if (sheet === 'swap') {
    title = 'Wat is er?'
    body = `${button('Bezet','open-busy')}${button('Geen materiaal','open-material')}${button('Pijn','open-pain')}`
  } else if (sheet === 'busy') {
    title = 'Apparaat bezet'
    const next = openSlots()[1]
    body = next === undefined ? `<p>Er staat geen andere oefening meer open.</p>${button('Bij deze oefening blijven','close',true)}${button('Oefening overslaan','open-skip')}` : `<dl class="change-list"><div><dt>Nu</dt><dd>${names[next]}</dd></div><div><dt>Daarna</dt><dd>${names[slot]} achteraan</dd></div></dl><p class="muted">Alleen vandaag.</p>${button('Later doen','apply-later',true)}`
  } else if (sheet === 'material' || sheet === 'pain' || sheet === 'skip') {
    title = sheet === 'pain' ? 'Stop deze oefening' : sheet === 'material' ? 'Geen materiaal' : 'Oefening overslaan'
    body = `${sheet === 'pain' ? '<p>Sla deze oefening over of stop de training.</p>' : sheet === 'material' ? '<p>Nog geen gecontroleerd alternatief beschikbaar.</p>' : ''}<p>${names[slot]} · ${remaining(slot).length} open sets vervallen vandaag.</p>${button('Resterende sets overslaan',`apply-skip-${sheet}`,true)}${button('Training stoppen','open-interrupt')}`
  } else if (sheet === 'time') {
    title = 'Minder tijd vandaag'
    body = `<p>Wat sla je vandaag over?</p><div class="group">${openSlots().map(s => `<label class="choice"><input type="checkbox" data-slot="${s}" ${selection.includes(s) ? 'checked' : ''}>${names[s]} · ${remaining(s).length} open sets</label>`).join('')}</div><p class="muted">Alleen vandaag.</p><button data-action="open-time-review" class="primary" ${selection.length ? '' : 'disabled'}>Bekijk het gevolg</button>`
  } else if (sheet === 'time-review') {
    title = 'Dit verandert vandaag'
    body = `<div class="wf-card"><h3>Vervalt</h3><ul>${selection.map(s => `<li>${names[s]} · ${remaining(s).length} sets</li>`).join('')}</ul><h3>Blijft</h3><p>${openSlots().filter(s => !selection.includes(s)).map(s => names[s]).join(', ') || 'Geen open oefeningen. Je rondt af met wat je hebt gedaan.'}</p></div><p>Volgende training ongewijzigd.</p>${button('Accepteren','apply-time',true)}${button('Zelf aanpassen','open-time')}`
  } else if (sheet === 'hard') {
    title = 'Zwaarder dan verwacht'
    body = `<p>Hoe komt dat volgens jou?</p>${button('Dagvorm','reason-day')}${button('Techniek onzeker','reason-technique')}${button('Structureel te zwaar','open-structural')}`
  } else if (sheet === 'structural') {
    title = 'Structureel te zwaar'
    body = `<p>Je plan aanpassen is nog niet beschikbaar. Je kunt wel het doel voor vandaag wijzigen.</p>${button('Alleen vandaag aanpassen','reason-structural',true)}${button('Niets veranderen','close')}`
  } else if (sheet === 'weight') {
    title = 'Alleen vandaag aanpassen'
    body = `<p>${reason === 'day' ? 'Volgende training ongewijzigd.' : reason === 'technique' ? 'Je kunt ook deze oefening overslaan.' : 'Je plan blijft ongewijzigd.'}</p><label>Doelgewicht (kg)<input id="target-weight" inputmode="decimal" autocomplete="off"></label><p id="sheet-error" role="alert" hidden></p>${button('Doel vandaag gebruiken','apply-weight',true)}${button('Oefening overslaan','open-skip')}`
  } else if (sheet === 'interrupt') {
    title = 'Pauzeren of stoppen'
    body = `<p class="wf-label">SESSIE BEWAREN</p>${button('Terug naar Vandaag','keep-going')}${button('Pauzeren','pause')}<p class="wf-label">SESSIE BEEINDIGEN</p>${button('Afronden met wat ik heb gedaan','open-complete')}${button('Afbreken','open-abort')}`
  } else if (['complete','abort'].includes(sheet)) {
    title = sheet === 'complete' ? 'Training afronden?' : 'Training afbreken?'
    body = `<p>${state.sets.length} sets bewaard · ${14-state.sets.length-state.skipped.length} niet afgemaakt.</p>${Object.values(state.drafts).some(d => d.weight || d.reps) ? '<p>Je open invoer telt niet als gedane set.</p>' : ''}${button(sheet === 'complete' ? 'Ja, afronden' : 'Ja, afbreken',`finish-${sheet}`,true)}`
  } else if (sheet === 'postpone') {
    title = 'Training verplaatsen'
    body = `<p>Eenmalig. Je vaste trainingsdagen blijven staan.</p><label>Nieuwe datum<input type="date" id="new-date" min="2026-09-17" value="${state.appointment}"></label><p id="sheet-error" role="alert" hidden></p>${button('Bekijk het gevolg','review-date',true)}`
  } else if (sheet === 'postpone-review') {
    title = 'Deze afspraak verplaatsen?'
    body = `<dl class="change-list"><div><dt>Van</dt><dd>${dateLabel(state.appointment)}</dd></div><div><dt>Naar</dt><dd>${dateLabel(selection)}</dd></div></dl>${button('Verplaatsen','apply-date',true)}`
  } else if (sheet === 'skip-day') {
    title = 'Vandaag overslaan?'
    body = `<p>${dateLabel(state.appointment)} vervalt. Geen inhaaltraining.</p>${button('Ja, deze training overslaan','apply-skip-day',true)}`
  }
  content.innerHTML = `<div class="sheet-head"><h2 id="sheet-title" tabindex="-1">${title}</h2>${button('Sluiten','close')}</div><div class="group">${body}</div>`
}
function positiveWeight(value) { return /^\d+(?:[.,]\d{1,2})?$/.test(value) && Number(value.replace(',','.')) > 0 }
document.addEventListener('input', event => {
  if (!event.target.matches('#set-form input')) return
  state.drafts[current()] = { weight:document.querySelector('[name=weight]').value, reps:document.querySelector('[name=reps]').value }
  persist(state)
})
document.addEventListener('change', event => {
  if (!event.target.matches('[data-slot]')) return
  const slot = Number(event.target.dataset.slot)
  selection = event.target.checked ? [...selection,slot] : selection.filter(s => s !== slot)
  content.querySelector('[data-action=open-time-review]').disabled = !selection.length
})
document.addEventListener('submit', event => {
  if (event.target.id !== 'set-form') return
  event.preventDefault()
  const d = draft()
  if (!positiveWeight(d.weight) || !/^\d+$/.test(d.reps) || Number(d.reps) < 1 || Number(d.reps) > 100) {
    const error = document.querySelector('#form-error')
    error.hidden = false
    error.textContent = 'Vul een gewicht boven 0 en 1 tot 100 hele herhalingen in.'
    return
  }
  const next = structuredClone(state)
  next.sets.push({ slot:current(),number:remaining(current())[0],weight:d.weight,reps:d.reps })
  delete next.drafts[current()]
  if (persist(next)) { state = next; render() }
})
document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]')?.dataset.action
  if (!action) return
  if (action.startsWith('reset-')) {
    const next = fresh(action === 'reset-active')
    if (!persist(next)) return
    state = next
    sheet = null
    dialog.close()
    view = action === 'reset-active' ? 'exercise' : 'today'
    history.replaceState({view},'',`#${view}`)
    render()
  } else if (action.startsWith('nav-')) navigate(action.slice(4))
  else if (action === 'close') closeSheet()
  else if (action.startsWith('open-')) {
    if (action === 'open-time' && sheet !== 'time-review') selection = []
    openSheet(action.slice(5))
  } else if (action.startsWith('reason-')) { reason = action.slice(7); openSheet('weight') }
  else if (action === 'apply-later') applyChange(`${names[current()]} komt later terug.`, next => { next.order = [...state.order.filter(s => s !== current()),current()] })
  else if (action.startsWith('apply-skip-') && action !== 'apply-skip-day') applyChange(`${names[current()]}: resterende sets overgeslagen (${action.slice(11) === 'pain' ? 'pijn' : 'niet mogelijk'}).`, next => skipSlots(next,[current()],action.slice(11)))
  else if (action === 'apply-time') applyChange(`Minder tijd: ${selection.map(s => names[s]).join(', ')} vervalt vandaag.`, next => skipSlots(next,selection,'time'))
  else if (action === 'apply-weight') {
    const value = document.querySelector('#target-weight').value.trim()
    if (!positiveWeight(value)) { const error = document.querySelector('#sheet-error'); error.hidden = false; error.textContent = 'Vul zelf een geldig gewicht boven 0 in.'; return }
    applyChange(`${names[current()]}: doel vandaag ${value} kg (${({day:'dagvorm',technique:'techniek onzeker',structural:'structureel gemeld; alleen vandaag aangepast'})[reason]}).`, next => { next.weights[current()] = value })
  } else if (action === 'undo' && state.undo) {
    const next = structuredClone(state)
    Object.assign(next,next.undo)
    next.skipped = next.skipped.filter(s => !next.sets.some(done => done.slot === s.slot && done.number === s.number))
    next.undo = null
    if (persist(next)) { state = next; render() }
  } else if (action === 'review-date') {
    const value = document.querySelector('#new-date').value
    if (!value || value < '2026-09-17' || value === state.appointment) { const error = document.querySelector('#sheet-error'); error.hidden = false; error.textContent = 'Kies een andere datum vanaf 17 september 2026 voor dit voorbeeld.'; return }
    selection = value
    openSheet('postpone-review')
  } else if (['apply-date','apply-skip-day','pause','keep-going'].includes(action) || action.startsWith('finish-')) {
    const next = structuredClone(state)
    if (action === 'apply-date') next.appointment = selection
    if (action === 'apply-skip-day') next.status = 'skipped'
    if (action === 'pause') next.status = 'paused'
    if (action.startsWith('finish-')) next.status = action === 'finish-complete' ? 'completed' : 'aborted'
    if (!persist(next)) return
    state = next
    closeSheet()
    // popstate returns to the underlying view first, then chooses the confirmed destination.
    destinationAfterClose = action.startsWith('finish-') ? 'summary' : 'today'
  } else if (['start','resume'].includes(action)) {
    const next = structuredClone(state)
    next.status = 'active'
    if (persist(next)) { state = next; navigate('exercise') }
  }
})
let destinationAfterClose = null
dialog.addEventListener('cancel', event => { event.preventDefault(); closeSheet() })
window.addEventListener('popstate', () => {
  sheet = null
  dialog.close()
  view = ['today','exercise','plan','summary'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'today'
  if (destinationAfterClose) {
    view = destinationAfterClose
    destinationAfterClose = null
    history.replaceState({view},'',`#${view}`)
  }
  render()
})
history.replaceState({view},'',`#${view}`)
render()
