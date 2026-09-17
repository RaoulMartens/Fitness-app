const exercises = [
  { name: 'Leg press', reps: '8–12', rest: 120 },
  { name: 'Leg curl', reps: '10–15', rest: 120 },
  { name: 'Chest press', reps: '8–12', rest: 120 },
  { name: 'Zittende row', reps: '8–12', rest: 120 },
  { name: 'Lat pulldown', reps: '8–12', rest: 120 },
  { name: 'Biceps curl', reps: '10–15', rest: 90 },
  { name: 'Triceps pushdown', reps: '10–15', rest: 90 },
]
const key = 'training-m2-design-v1'
const app = document.querySelector('#app')
const dialog = document.querySelector('#sheet')
const fresh = () => ({ view: 'today', session: null, weekend: null, planDraft: null, compromise: null, reviewReturn: 'today' })
const viewNames = ['today', 'overview', 'warmup', 'exercise', 'summary', 'consequences', 'plan', 'plan-edit', 'proposal', 'compromise']
const reviewing = view => ['proposal', 'compromise'].includes(view)
let state = fresh()
let wakeLock = null
let wakeRequested = false
let wakeMessage = 'Uit'
let wakePending = false
let storageFailed = false
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const weightLabel = value => Number(value).toLocaleString('nl-NL', { maximumFractionDigits: 2 })
const completionLabel = () => state.session.status === 'aborted' ? 'Sessie afgebroken' : state.session.sets.length === 14 ? 'Sessie afgerond' : 'Sessie deels afgerond'
const button = (text, action, style = 'secondary') => `<button class="${style}" data-action="${action}">${text}</button>`
const active = () => state.session && ['active', 'paused'].includes(state.session.status)
const current = () => exercises[Math.min(Math.floor((state.session?.sets.length ?? 0) / 2), 6)]
const displayed = () => state.session?.rest ? exercises[Math.floor((state.session.sets.length - 1) / 2)] : current()
const setNumber = () => (state.session?.sets.length ?? 0) % 2 + 1
const remaining = () => !state.session?.rest ? 0 : state.session.status === 'paused' ? state.session.rest.remaining : Math.max(0, state.session.rest.endAt - Date.now())
const time = ms => { const seconds = Math.ceil(ms / 1000); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }

function storageError(message) {
  storageFailed = true
  const error = document.querySelector('#storage-error')
  error.hidden = false
  error.textContent = message
}
try {
  const saved = sessionStorage.getItem(key)
  if (saved) {
    const parsed = JSON.parse(saved)
    if (!parsed || typeof parsed.view !== 'string' || !('session' in parsed) || (parsed.session && (!Array.isArray(parsed.session.sets) || typeof parsed.session.draft !== 'object'))) throw new Error('Invalid preview')
    state = { ...fresh(), ...parsed }
  }
} catch {
  storageError('Het eerdere voorbeeld kon niet worden geopend. Je ziet een nieuw voorbeeld; je M1-registraties zijn niet aangeraakt.')
}
function save() {
  try { sessionStorage.setItem(key, JSON.stringify(state)) }
  catch { storageError('Het voorbeeld blijft nu alleen in beeld. Herladen kan de invoer wissen: opslag in dit tabblad is niet beschikbaar.') }
}
function go(view) {
  if (view === 'plan-edit' && state.view !== view && !reviewing(state.view)) state.planDraft = { weekend: state.weekend }
  if (view === 'proposal' && !reviewing(state.view)) state.reviewReturn = state.view
  const changed = state.view !== view
  state.view = view
  render()
  save()
  if (changed) history.pushState({ m2View: state.view }, '', `#${state.view}`)
  else history.replaceState({ m2View: state.view }, '', `#${state.view}`)
  focusView()
}
function focusView() {
  window.scrollTo(0, 0)
  app.querySelector('h1')?.focus({ preventScroll: true })
}
const title = text => `<h1 tabindex="-1">${text}</h1>`
const list = () => `<ol class="exercise-list">${exercises.map(ex => `<li><strong>${ex.name}</strong><span>2 × ${ex.reps}</span></li>`).join('')}</ol>`
const tabs = page => `<nav class="tabs" aria-label="Hoofdnavigatie"><button data-action="today" ${page === 'today' ? 'aria-current="page"' : ''}>Vandaag</button><button data-action="plan" ${page === 'plan' ? 'aria-current="page"' : ''}>Plan</button></nav>`

function today() {
  const session = state.session
  return `${title('Vandaag')}${active() ? `<section class="panel"><h2>${session.status === 'paused' ? 'Sessie gepauzeerd' : 'Sessie loopt'}</h2><p>Full-body · ${session.sets.length} van 14 sets vastgelegd</p><p class="muted">${session.phase === 'warmup' ? 'Je was bij de warming-up.' : session.sets.length === 14 ? 'Je kunt je sessie afronden.' : `${current().name} · set ${setNumber()}${session.draft.weight || session.draft.reps ? ' · concept bewaard' : ''}`}</p>${button('Verder trainen', 'resume-sheet', 'primary')}</section>` : session ? `<section class="panel"><h2>${completionLabel()}</h2><p>${session.sets.length} van 14 sets vastgelegd in dit voorbeeld.</p>${button('Bekijk je sessie', 'summary', 'primary')}</section>` : `<section class="panel"><h2>Woensdag · full-body</h2><p>7 oefeningen · ongeveer 60 minuten</p><p class="muted">Je hele lichaam, met extra aandacht voor je bovenlichaam.</p>${button('Start training', 'start', 'primary')}${button('Bekijk de sessie', 'overview', 'text-button')}</section>`}
    <section class="group"><h2>Je weekend</h2><p>${state.weekend ? `Je koos ${state.weekend} in dit voorbeeld.` : 'Nog niets gepland. Je kiest zelf of je een tweede keer gaat.'}</p>${button('Bekijk je trainingsweek', 'plan', 'text-button')}</section>
    <details><summary>Waarom dit voorstel?</summary><p>Je begint met weinig ervaring, wilt vooral je bovenlichaam ontwikkelen en hebt woensdag als vaste dag. Beide sessies bevatten ook benen. Dezelfde oefeningen geven je gelegenheid de apparaten te leren kennen.</p></details>`
}
function overview() {
  return `${title('Je full-body training')}<p>7 oefeningen · 14 werksets · richtduur 60 minuten</p>${list()}<p class="note">Neem de eerste keren ruimte voor uitleg en apparaten instellen. Je hebt maximaal 90 minuten beschikbaar.</p>${button(active() ? 'Verder trainen' : 'Start training', active() ? 'resume' : 'start', 'primary')}<details><summary>Wat moet nog worden gecontroleerd?</summary><p>De apparaten bij Il Fiore, hun gewichtsstappen, instellingen en passende demonstraties. De namen en sets zijn nu een voorstel.</p></details>`
}
function warmup() {
  return `${title('Warm worden')}<p>5 tot 10 minuten rustig opwarmen.</p><label class="check"><input type="checkbox" id="warmup-done" ${state.session.warmed ? 'checked' : ''}> Gedaan</label><section class="group"><h2>Daarna: leg press</h2><p>Maak eerst kennis met de instelling en een lichte proefset.</p><p class="muted">Je werkgewicht staat nog niet vast. Daarom vullen we geen kilo’s voor je in.</p></section>${button('Naar oefening 1', 'begin-exercise', 'primary')}<details><summary>Hulp bij het apparaat</summary><p>Bij de eerste keer laat je de instelling en uitvoering bij jouw apparaat uitleggen. De apparaatgebonden instructies en warming-upsets komen hier na controle.</p></details>${button('Pauzeren of stoppen', 'interrupt', 'text-button')}`
}
function setTable() {
  const count = state.session.sets.length
  const index = Math.min(Math.floor((count - (state.session.rest ? 1 : 0)) / 2), 6)
  const ex = exercises[Math.max(0, index)]
  return `<table class="set-table"><thead><tr><th>Set</th><th>Doel</th><th>Vastgelegd</th></tr></thead><tbody>${[0, 1].map(n => {
    const record = state.session.sets[index * 2 + n]
    return `<tr><th scope="row">${n + 1}</th><td>${ex.reps} reps</td><td>${record ? `${weightLabel(record.weight)} kg × ${escape(record.reps)}` : 'Nog niet'}</td></tr>`
  }).join('')}</tbody></table>`
}
function exercise() {
  const session = state.session
  const count = session.sets.length
  const resting = Boolean(session.rest)
  const ex = resting ? exercises[Math.floor((count - 1) / 2)] : current()
  const allDone = count === 14
  return `${title(ex.name)}<p class="muted">Oefening ${resting ? Math.floor((count - 1) / 2) + 1 : Math.min(Math.floor(count / 2) + 1, 7)} van 7 · 2 werksets</p>
    <div class="demo"><strong>Oefendemonstratie</strong><p>Video en apparaatinstructies volgen na controle.</p>${button('Bekijk de uitleg', 'demo', 'text-button')}</div>
    ${setTable()}
    ${resting ? `<section class="rest" aria-label="Rust"><h2 id="rest-title" tabindex="-1">Rust</h2><div class="timer" id="timer" role="timer">${time(remaining())}</div><p id="rest-message" role="status">Set ${((count - 1) % 2) + 1} vastgelegd.</p><p>Hierna: ${current().name} · set ${setNumber()}</p>${button('Verder trainen', 'next-set', 'primary')}${button('30 seconden extra rust', 'extra-rest', 'text-button')}<label class="check"><input type="checkbox" id="wake" ${wakeRequested ? 'checked' : ''}> Scherm aanhouden tijdens rust</label><p class="note" id="wake-status">${wakeMessage}</p><p class="note">Houd de app open tijdens je rust. Met een vergrendeld scherm is een rustsignaal niet gegarandeerd.</p></section>`
      : allDone ? `<section class="group"><h2 id="finished-title" tabindex="-1">Alle sets vastgelegd</h2><p>Je sessie loopt nog tot je deze afrondt.</p>${button('Sessie afronden', 'finish-sheet', 'primary')}</section>`
      : `<form id="set-form" class="group"><h2>Set ${setNumber()} van 2</h2><p>${ex.reps} herhalingen. Houd ongeveer 2–3 herhalingen over met goede techniek.</p><p class="note">Eerste training: kies je gewicht na een lichte proefset. Bij twijfel vraag je hulp bij het apparaat.</p><div class="fields"><label>Gewicht (kg)<input name="weight" inputmode="decimal" autocomplete="off" value="${escape(session.draft.weight)}" placeholder="Vul in"></label><label>Herhalingen<input name="reps" inputmode="numeric" autocomplete="off" value="${escape(session.draft.reps)}" placeholder="Vul in"></label></div><p id="input-error" class="error" role="alert" hidden></p><button class="primary" type="submit">Set vastleggen</button><p class="note">Nog geen vorige uitvoering op dit apparaat.</p></form>`}
    ${button('Pauzeren of stoppen', 'interrupt', 'text-button')}`
}
function summary() {
  const session = state.session
  return `${title(session.status === 'completed' && session.sets.length === 14 ? 'Klaar' : completionLabel())}<p>${session.sets.length} van 14 werksets vastgelegd.</p><p class="muted">${session.sets.length < 14 ? 'Niet-uitgevoerde sets blijven leeg. Je uitgevoerde sets blijven zichtbaar.' : 'Je hebt alle voorgestelde werksets doorlopen.'}</p><ul class="exercise-list">${exercises.map((ex, index) => { const records = session.sets.slice(index * 2, index * 2 + 2); return `<li><div><strong>${ex.name}</strong><p class="note">${records.map((r, i) => `Set ${i + 1}: ${weightLabel(r.weight)} kg × ${escape(r.reps)}`).join('<br>') || 'Niet uitgevoerd'}</p></div><span>${records.length}/2</span></li>` }).join('')}</ul>${button('Wat betekent dit?', 'consequences', 'primary')}${button('Terug naar Vandaag', 'today', 'text-button')}`
}
function consequences() {
  return `${title('Volgende keer')}<p>Je vorige uitvoering komt naast je nieuwe set te staan.</p><section class="group"><h2>Je doel blijft voorlopig gelijk</h2><p>We hebben nog geen betrouwbare informatie over de inspanning en het apparaat. Daarom verhogen we je gewicht niet automatisch.</p></section><section class="group"><h2>Je planning</h2><p>${state.weekend ? `${state.weekend} is de tweede sessie die je zelf koos.` : 'Woensdag blijft je vaste dag. Het weekend is nog niet ingepland.'}</p><p>Overgebleven sets worden niet doorgeschoven.</p></section>${button('Terug naar Vandaag', 'today', 'primary')}<details><summary>Hoe komt een volgend doel tot stand?</summary><p>Pas als oefening, apparaat, gewicht, alle werksets en inspanningsinformatie vergelijkbaar zijn, kan de app een verhoging voorstellen. Je krijgt de reden te zien voordat je kiest.</p></details>`
}
function plan() {
  return `${title('Je plan')}<p>Full-body · extra aandacht voor je bovenlichaam</p><section class="panel"><h2>Je trainingsweek</h2><ul class="exercise-list"><li><div><strong>Woensdag</strong><p class="note">Full-body · ongeveer 60 minuten</p></div><span>Vaste training</span></li><li><div><strong>${state.weekend || 'Weekend'}</strong><p class="note">${state.weekend ? 'Full-body · ongeveer 60 minuten' : 'Een tweede training als jij daarvoor kiest.'}</p></div><span>${state.weekend ? 'Ingepland' : 'Niet ingepland'}</span></li></ul></section><p>Richtduur 60 minuten. Je houdt ruimte tot 90 minuten om rustig te beginnen.</p>${button('Trainingsdagen aanpassen', 'plan-edit', 'primary')}<details><summary>Waarom deze verdeling?</summary><p>Je begint met weinig ervaring, wilt vooral je bovenlichaam ontwikkelen en hebt woensdag als vaste dag. Beide sessies bevatten ook benen. Dezelfde oefeningen geven je gelegenheid de apparaten te leren kennen.</p></details><details><summary>Hoe zit het met vooruitgang?</summary><p>We gebruiken de trainingen die je echt uitvoert. Een weekend dat je niet inplant, is geen gemiste training.</p></details>`
}
function planEdit() {
  return `${title('Trainingsdagen aanpassen')}<section class="panel"><h2>Woensdag</h2><p>Je vaste training · ongeveer 60 minuten</p><p class="note">Woensdag blijft de basis van dit voorstel.</p></section><fieldset><legend>Je optionele weekendtraining</legend>${[
    ['', 'Nog niet inplannen'], ['Zaterdag', 'Zaterdag'], ['Zondag', 'Zondag'],
  ].map(([value, label]) => `<label class="choice"><input type="radio" name="weekend" value="${value}" ${(state.planDraft.weekend || '') === value ? 'checked' : ''}><span>${label}</span></label>`).join('')}</fieldset><p>Alleen jouw keuze maakt dit een geplande tweede training.</p>${button('Planning opslaan', 'save-plan', 'primary')}${button('Annuleren', 'plan', 'text-button')}`
}
function proposal() {
  return `${title('Je startvoorstel')}<p>Woensdag full-body. Een tweede sessie in het weekend als jij daarvoor kiest.</p><p>Een herkenbare basis voor je eerste weken: benen, borst, rug en extra armen.</p>${list()}<p>2 minuten rust bij de eerste vijf oefeningen; 90 seconden bij de arm-oefeningen. Extra rust blijft mogelijk.</p><p class="note">Dit is een eerste basis. Gerichte schouder-, romp- en heupdominante oefeningen vragen later een aanvulling; dit is nog geen volledig atletiekprogramma.</p>${button('Terug naar de app', 'return-app', 'primary')}${button('En als ik minder tijd wil plannen?', 'compromise', 'text-button')}<details><summary>Waarom deze opzet?</summary><p>Het voorstel houdt rekening met je beschikbare woensdag, beperkte ervaring en wens om bovenlichaam en armen te ontwikkelen. De exacte apparaten en media moeten nog worden bevestigd.</p></details>`
}
function compromise() {
  return `${title('Als 60 minuten niet past')}<p>We kunnen nog niet beloven dat alle zeven oefeningen in 45 minuten passen. Wat wil je dan aanpassen?</p><fieldset><legend>Een keuze voor het planvoorbeeld</legend>${[
    ['time', 'Meer tijd vrijhouden', 'De zeven oefeningen behouden; ruimte tot 90 minuten.'],
    ['frequency', 'Twee vaste dagen overwegen', 'Eerst de verdeling over twee dagen bekijken. Dit maakt het weekend nog niet verplicht.'],
    ['priority', 'Minder onderdelen per training', 'Eerst bekijken welke oefeningen vervallen en wat dat voor je prioriteiten betekent.'],
  ].map(([value, label, help]) => `<label class="choice"><input type="radio" name="compromise" value="${value}" ${state.compromise === value ? 'checked' : ''}><span><strong>${label}</strong><span class="note">${help}</span></span></label>`).join('')}</fieldset>${button('Bekijk het gevolg', 'compromise-result', 'primary')}<p class="note">Dit scherm hoort bij de latere planning. Tijdens een training wordt minder tijd apart behandeld.</p>`
}
function render() {
  if (!viewNames.includes(state.view)) state.view = 'today'
  if (['warmup', 'exercise'].includes(state.view) && !active()) state.view = state.session ? 'summary' : 'today'
  if (['summary', 'consequences'].includes(state.view) && (!state.session || active())) state.view = 'today'
  if (state.view === 'plan-edit') state.planDraft ??= { weekend: state.weekend }
  else if (!reviewing(state.view)) state.planDraft = null
  const training = ['warmup', 'exercise'].includes(state.view)
  const views = { today, overview, warmup, exercise, summary, consequences, plan, 'plan-edit': planEdit, proposal, compromise }
  const content = views[state.view] ?? today
  const back = {
    overview: ['Terug naar Vandaag', 'today'],
    'plan-edit': ['Terug naar Plan', 'plan'],
    proposal: ['Terug naar de app', 'return-app'],
    compromise: ['Terug naar het voorstel', 'proposal'],
    summary: ['Terug naar Vandaag', 'today'],
    consequences: ['Terug naar je sessie', 'summary'],
  }[state.view]
  const navigation = training ? button('Naar Vandaag · sessie blijft lopen', 'today', 'text-button') : back ? button(...back, 'text-button') : ''
  app.innerHTML = `<header class="nav"><span>${training ? 'Full-body' : reviewing(state.view) ? 'Planvoorstel beoordelen' : 'Training'}</span>${navigation}</header><div class="content">${content()}</div><footer class="footer">${storageFailed ? 'Voorbeeldopslag niet beschikbaar' : 'Klikmodel · bewaard in dit tabblad'} · ontwerp ter beoordeling</footer>${['today', 'plan'].includes(state.view) ? tabs(state.view) : ''}`
  document.querySelector('#review-proposal').hidden = reviewing(state.view)
  updateTimer()
  void updateWake()
}
function openSheet(name) {
  const session = state.session
  const variants = {
    resume: ['Verder trainen', () => `<p>Full-body · ${session.sets.length} van 14 sets vastgelegd.</p><p>${session.status === 'paused' ? 'Je sessie is gepauzeerd. Je rusttijd gaat verder bij hervatten.' : session.rest ? `Je rust loopt door. Nog ${time(remaining())}.` : 'Je hervat op dezelfde plek.'}</p>${button('Verder trainen', 'resume', 'primary')}`],
    interrupt: ['Pauzeren of stoppen', () => `<section class="group"><h3>Sessie blijft lopen</h3><p>Ook je rusttimer loopt door.</p>${button('Terug naar Vandaag', 'today')}</section><section class="group"><h3>Even pauze</h3><p>Bewaar je plek en zet een lopende rusttimer stil.</p>${button('Sessie pauzeren', 'pause')}</section><section class="group"><h3>Sessie beëindigen</h3>${button('Afronden met wat ik heb gedaan', 'finish-sheet')}${button('Afbreken', 'abort-sheet')}</section>`],
    finish: ['Sessie afronden?', () => `<p>Je hebt ${session.sets.length} van 14 werksets vastgelegd. ${session.sets.length < 14 ? 'De rest blijft niet uitgevoerd.' : 'Alle werksets zijn klaar.'}</p>${draftWarning()}<p>Je sessie krijgt de status ${session.sets.length === 14 ? 'afgerond' : 'deels afgerond'}.</p>${button('Sessie afronden', 'finish', 'primary')}${button('Verder trainen', 'close')}`],
    abort: ['Sessie afbreken?', () => `<p>De ${session.sets.length} vastgelegde sets blijven bewaard. De sessie krijgt de status afgebroken.</p>${draftWarning()}${button('Sessie afbreken', 'abort', 'primary')}${button('Verder trainen', 'close')}`],
    demo: ['Oefenuitleg', () => `<p>${displayed().name}</p><p>Hier komen een demonstratie, instelhulp en korte aanwijzingen voor jouw apparaat.</p><p>Die inhoud is nog niet beschikbaar. Laat de instelling en uitvoering bij de eerste training ter plaatse uitleggen.</p>${button('Terug naar de set', 'close', 'primary')}`],
    reset: ['Voorbeeld opnieuw beginnen?', () => `<p>Alleen de invoer van dit ontwerpvoorstel wordt gewist. Je registraties in de M1-app blijven behouden.</p>${button('Voorbeeld wissen', 'reset-confirm', 'primary')}${button('Terug', 'close')}`],
    compromise: ['Gevolg van je keuze', () => `<p>${({ time: 'Je houdt de zeven oefeningen en maakt meer tijd vrij. De werkelijke duur moeten we nog meten.', frequency: 'Er is eerst een nieuw verdelingsvoorstel nodig. Woensdag blijft vast; je weekend is nog niet veranderd.', priority: 'Er is eerst een korter schema nodig waarin zichtbaar staat welke onderdelen vervallen. Je huidige voorstel is nog niet veranderd.' })[state.compromise]}</p>${button('Terug naar het voorstel', 'proposal', 'primary')}`],
  }
  const variant = variants[name]
  if (!variant) return
  document.querySelector('#sheet-content').innerHTML = `<header class="sheet-header"><h2 id="sheet-title" tabindex="-1">${variant[0]}</h2>${button('Sluiten', 'close', 'text-button')}</header>${variant[1]()}`
  if (!dialog.open) dialog.showModal()
  document.querySelector('#sheet-title').focus()
}
function draftWarning() {
  return state.session.draft.weight || state.session.draft.reps ? '<p class="error">Er staat nog invoer die niet is vastgelegd. Die telt niet als uitgevoerde set en vervalt als je nu beëindigt.</p>' : ''
}
function updateTimer() {
  const timer = document.querySelector('#timer')
  if (!timer) return
  const ms = remaining()
  timer.textContent = time(ms)
  document.querySelector('#rest-title').textContent = ms > 0 ? 'Rust' : 'Rust voorbij'
  const message = ms > 0 ? 'Je set is vastgelegd. Neem je rust.' : 'Je kunt verder. Neem extra rust als je die nodig hebt.'
  const status = document.querySelector('#rest-message')
  if (status.textContent !== message) status.textContent = message
}
async function updateWake() {
  const shouldHold = wakeRequested && state.view === 'exercise' && state.session?.status === 'active' && Boolean(state.session.rest) && document.visibilityState === 'visible'
  if (!shouldHold && wakeLock) { await wakeLock.release(); wakeLock = null }
  if (shouldHold && !wakeLock && !wakePending) {
    if (!('wakeLock' in navigator)) wakeMessage = 'Scherm aanhouden wordt niet ondersteund. Houd zelf je scherm actief.'
    else {
      wakePending = true
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (wakeRequested && state.view === 'exercise' && state.session?.status === 'active' && state.session.rest && document.visibilityState === 'visible') {
          wakeLock = lock
          wakeMessage = 'Scherm blijft aan zolang dit verzoek actief is.'
          lock.addEventListener('release', () => { if (wakeLock === lock) { wakeLock = null; wakeMessage = 'Scherm-aanhouden is gestopt. Houd zelf je scherm actief.'; showWakeStatus() } })
        } else await lock.release()
      } catch { wakeMessage = 'Scherm aanhouden lukt niet. Houd zelf je scherm actief.' }
      finally { wakePending = false }
    }
  }
  if (!wakeRequested) wakeMessage = 'Uit'
  showWakeStatus()
}
function showWakeStatus() { const label = document.querySelector('#wake-status'); if (label) label.textContent = wakeMessage }

document.addEventListener('click', event => {
  const control = event.target.closest('[data-action]')
  if (!control) return
  const action = control.dataset.action
  if (action === 'close') { dialog.close(); return }
  if (action === 'reset') { openSheet('reset'); return }
  if (action === 'reset-confirm') { dialog.close(); state = fresh(); wakeRequested = false; go('today'); return }
  if (['resume-sheet', 'finish-sheet', 'abort-sheet'].includes(action)) { openSheet(action.replace('-sheet', '')); return }
  if (['interrupt', 'demo'].includes(action)) { openSheet(action); return }
  if (action === 'compromise-result') { if (state.compromise) openSheet('compromise'); else { document.querySelector('[name="compromise"]').focus(); document.querySelector('legend').textContent = 'Kies eerst wat je wilt aanpassen'; } return }
  dialog.close()
  if (action === 'start') {
    if (!active()) state.session = { status: 'active', phase: 'warmup', warmed: false, sets: [], draft: { weight: '', reps: '' }, rest: null }
    go(state.session.phase)
  } else if (action === 'resume') {
    if (state.session.status === 'paused' && state.session.rest) state.session.rest.endAt = Date.now() + state.session.rest.remaining
    state.session.status = 'active'
    go(state.session.phase)
  } else if (action === 'begin-exercise') { state.session.phase = 'exercise'; go('exercise') }
  else if (action === 'next-set') { state.session.rest = null; go('exercise') }
  else if (action === 'extra-rest') { state.session.rest.endAt = Math.max(Date.now(), state.session.rest.endAt) + 30000; save(); updateTimer() }
  else if (action === 'pause') {
    if (state.session.rest) state.session.rest.remaining = remaining()
    state.session.status = 'paused'
    go('today')
  } else if (action === 'finish' || action === 'abort') {
    state.session.status = action === 'abort' ? 'aborted' : 'completed'
    state.session.rest = null
    state.session.draft = { weight: '', reps: '' }
    go('summary')
  } else if (action === 'save-plan') {
    state.weekend = state.planDraft.weekend
    go('plan')
  } else if (action === 'return-app') {
    go(viewNames.includes(state.reviewReturn) && !reviewing(state.reviewReturn) ? state.reviewReturn : 'today')
  } else go(action)
})
document.addEventListener('input', event => {
  if (event.target.matches('#set-form input')) { state.session.draft[event.target.name] = event.target.value; save() }
})
document.addEventListener('change', event => {
  if (event.target.id === 'warmup-done') state.session.warmed = event.target.checked
  if (event.target.name === 'compromise') state.compromise = event.target.value
  if (event.target.name === 'weekend') state.planDraft.weekend = event.target.value || null
  if (event.target.id === 'wake') { wakeRequested = event.target.checked; void updateWake() }
  save()
})
document.addEventListener('submit', event => {
  if (event.target.id !== 'set-form') return
  event.preventDefault()
  const { weight, reps } = state.session.draft
  const normalizedWeight = weight.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalizedWeight) || Number(normalizedWeight) > 9999 || !/^\d+$/.test(reps.trim()) || Number(reps) < 1 || Number(reps) > 999) {
    const error = document.querySelector('#input-error')
    error.hidden = false
    error.textContent = 'Vul een gewicht in (bijvoorbeeld 12,5) en een heel aantal herhalingen van 1 tot 999.'
    return
  }
  const rest = current().rest
  state.session.sets.push({ weight: Number(normalizedWeight), reps: Number(reps) })
  state.session.draft = { weight: '', reps: '' }
  state.session.rest = state.session.sets.length < 14 ? { endAt: Date.now() + rest * 1000, remaining: rest * 1000 } : null
  save(); render()
  document.querySelector(state.session.rest ? '#rest-title' : '#finished-title').focus()
})
document.addEventListener('visibilitychange', () => { updateTimer(); void updateWake() })
window.addEventListener('pagehide', () => { if (wakeLock) void wakeLock.release() })
setInterval(updateTimer, 250)
window.addEventListener('popstate', event => {
  dialog.close()
  state.view = event.state?.m2View ?? location.hash.slice(1)
  render()
  save()
  history.replaceState({ m2View: state.view }, '', `#${state.view}`)
  focusView()
})
const initialView = location.hash.slice(1)
if (viewNames.includes(initialView)) state.view = initialView
render()
save()
history.replaceState({ m2View: state.view }, '', `#${state.view}`)
