import { KEY, fresh, steps, views, decide, validate, validState } from './model.js'
import { screen, aboutContent, button } from './screens.js'

const app = document.querySelector('#app')
const dialog = document.querySelector('#sheet')
const content = document.querySelector('#sheet-content')
const storageError = document.querySelector('#storage-error')
let state = fresh()
let error = ''
let readFailed = false
let sheet = null
let previousFocus = null

function storageMessage(text) { storageError.hidden = false; storageError.textContent = text }
function persist(next) {
  if (readFailed) return false
  try { sessionStorage.setItem(KEY, JSON.stringify(next)); storageError.hidden = true; return true }
  catch { storageMessage('Je antwoorden zijn niet opgeslagen. Houd dit tabblad open en probeer opnieuw.'); return false }
}
function restore() {
  try {
    const saved = sessionStorage.getItem(KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (!validState(parsed)) throw new Error('Onbekend voorbeeldformaat')
      state = parsed
    }
    readFailed = false; storageError.hidden = true
  } catch {
    readFailed = true
    storageMessage('Je bewaarde antwoorden konden niet worden geopend. Er is niets overschreven.')
  }
}
function guarded(view) {
  if (!views.includes(view)) return state.view
  if (['today', 'plan', 'overview'].includes(view)) return state.accepted ? view : 'start'
  const index = steps.indexOf(view)
  if (index >= 0) return steps.slice(0, index).find(step => validate(state.draft, step)) ?? view
  if (['proposal', 'compromise', 'unsupported'].includes(view)) {
    const decision = decide(state.draft)
    return view === 'unsupported' && decision.reason === 'time' ? view : decision.view
  }
  return view
}
function render(focus = false) {
  app.innerHTML = readFailed ? `<h1 tabindex="-1">Je antwoorden openen lukt niet</h1><p>Probeer opnieuw, of begin bewust met een leeg voorbeeld.</p><div class="actions">${button('Opnieuw proberen', 'retry-read', true)}${button('Begin met een leeg voorbeeld', 'reset-blank')}</div>` : screen(state, error)
  document.title = `M4 · ${app.querySelector('h1')?.textContent ?? 'Jouw startplan'}`
  if (focus) { app.querySelector('h1')?.focus(); window.scrollTo(0, 0) }
}
function navigate(view, next = state, replace = false) {
  const destination = { ...next, view }
  if (!persist(destination)) return
  state = destination; error = ''
  history[replace ? 'replaceState' : 'pushState'](null, '', `#${view}`)
  render(true)
}
function closeSheet() { if (sheet) history.back() }
function hideSheet() {
  if (!sheet) return
  sheet = null; dialog.close(); previousFocus?.focus()
}
function openSheet(kind) {
  previousFocus = document.activeElement
  sheet = kind
  content.innerHTML = kind === 'about' ? aboutContent() : `<div class="sheet-head"><h2 id="sheet-title">Wat wil je aanpassen?</h2>${button('Sluiten', 'close')}</div><div class="choices">${button('Doel', 'edit-goal')}${button('Ervaring', 'edit-experience')}${button('Dagen en tijd', 'edit-week')}${button('Trainingsplek', 'edit-context')}</div>`
  history.pushState({ sheet: kind }, '', location.hash)
  dialog.showModal()
}
function edit(view) {
  const fromPlan = ['plan', 'today', 'overview'].includes(state.view)
  const next = { ...state, editReturn: fromPlan ? 'plan' : state.editReturn ?? 'proposal', draft: fromPlan && !state.editReturn ? structuredClone(state.accepted.answers) : state.draft }
  const wasSheet = Boolean(sheet)
  if (wasSheet) hideSheet()
  navigate(view, next, wasSheet)
}
function nextStep() {
  error = validate(state.draft, state.view)
  if (error) { render(); app.querySelector('[role=alert]')?.scrollIntoView({ block: 'nearest' }); return }
  const index = steps.indexOf(state.view)
  navigate(state.editReturn || index === 3 ? decide(state.draft).view : steps[index + 1])
}
function reset(known) {
  const next = fresh(known)
  // A failed read may only be replaced after the explicit reset action.
  const failed = readFailed; readFailed = false
  if (!persist(next)) { readFailed = failed; return }
  hideSheet(); state = next; error = ''
  history.replaceState(null, '', '#start'); render(true)
}
document.addEventListener('input', event => {
  const input = event.target
  if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) || !Object.hasOwn(state.draft, input.name)) return
  state = { ...state, draft: { ...state.draft, [input.name]: input.value } }
  persist(state); error = ''
  if (input instanceof HTMLTextAreaElement) return
  const name = input.name, value = input.value
  const disclosure = Array.from(app.querySelectorAll('details')).map(item => item.open)
  render()
  app.querySelectorAll('details').forEach((item, index) => { item.open = disclosure[index] ?? false })
  Array.from(app.querySelectorAll('input')).find(item => item.name === name && item.value === value)?.focus()
})
document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]')?.dataset.action
  if (!action) return
  if (action === 'retry-read') { restore(); render(true); return }
  if (action.startsWith('reset-')) { reset(action === 'reset-known'); return }
  if (action === 'close') { closeSheet(); return }
  if (readFailed) return
  if (action === 'next') { nextStep(); return }
  if (action === 'back') {
    if (state.editReturn) { navigate(guarded(state.editReturn === 'plan' ? 'plan' : 'proposal')); return }
    navigate(steps[steps.indexOf(state.view) - 1] ?? 'start'); return
  }
  if (action.startsWith('nav-')) { navigate(guarded(action.slice(4))); return }
  if (action.startsWith('edit-')) { edit(action.slice(5)); return }
  if (action === 'open-edit') { openSheet('edit'); return }
  if (action === 'allow-time') {
    const next = { ...state, draft: { ...state.draft, minutes: '60' } }
    navigate(decide(next.draft).view, next); return
  }
  if (action === 'keep-time') { navigate('unsupported'); return }
  if (action === 'accept') {
    const decision = decide(state.draft)
    if (decision.view !== 'proposal') { navigate(decision.view); return }
    navigate('today', { ...state, accepted: { answers: structuredClone(state.draft), at: new Date().toISOString() }, editReturn: null }); return
  }
  if (action === 'discard' && state.accepted) navigate('plan', { ...state, draft: structuredClone(state.accepted.answers), editReturn: null })
})
document.querySelector('#about').addEventListener('click', () => openSheet('about'))
dialog.addEventListener('cancel', event => { event.preventDefault(); closeSheet() })
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return
  const bounds = dialog.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeSheet()
})
window.addEventListener('popstate', () => {
  if (sheet) { hideSheet(); return }
  const view = guarded(location.hash.slice(1))
  const next = { ...state, view }
  if (!persist(next)) { history.replaceState(null, '', `#${state.view}`); return }
  state = next; error = ''
  history.replaceState(null, '', `#${view}`); render(true)
})
restore()
if (!readFailed) {
  state.view = guarded(location.hash.slice(1) || state.view)
  history.replaceState(null, '', `#${state.view}`)
}
render()
