export const KEY = 'training-m4-review-v1'
export const days = [['ma', 'Maandag'], ['di', 'Dinsdag'], ['wo', 'Woensdag'], ['do', 'Donderdag'], ['vr', 'Vrijdag'], ['za', 'Zaterdag'], ['zo', 'Zondag']]
export const goals = { mass: 'Spiermassa opbouwen', strength: 'Sterker worden', both: 'Sterker en gespierder' }
export const priorities = { mass: 'Spiermassa eerst', strength: 'Kracht eerst', none: 'Nog geen voorkeur' }
export const experiences = { new: 'Net begonnen', under1: 'Minder dan een jaar', '1to3': 'Eén tot drie jaar', over3: 'Langer dan drie jaar' }
export const places = { machines: 'Sportschool met machines en kabels', free: 'Sportschool met vooral vrije gewichten', dumbbells: 'Thuis, met halters', home: 'Thuis, zonder materiaal' }
export const focuses = { upper: 'Armen en bovenlichaam', balanced: 'Geen extra aandachtspunt' }
export const exercises = [
  ['Leg press', '2 × 8–12'], ['Leg curl', '2 × 10–15'], ['Chest press', '2 × 8–12'],
  ['Zittende row', '2 × 8–12'], ['Lat pulldown', '2 × 8–12'], ['Biceps curl', '2 × 10–15'], ['Triceps pushdown', '2 × 10–15'],
]
export const knownAnswers = () => ({ goal: 'both', priority: 'none', focus: 'upper', experience: 'new', day: 'wo', weekend: 'none', minutes: '90', place: 'machines', notes: '' })
export const blankAnswers = () => ({ goal: '', priority: 'none', focus: 'balanced', experience: '', day: '', weekend: 'none', minutes: '', place: '', notes: '' })
export const fresh = (known = true) => ({ version: 1, draft: known ? knownAnswers() : blankAnswers(), accepted: null, view: 'start', editReturn: null, source: known ? 'known' : 'blank' })
export const steps = ['goal', 'experience', 'week', 'context']
export const views = ['start', ...steps, 'proposal', 'compromise', 'unsupported', 'today', 'plan', 'overview']
export const dayName = day => days.find(([id]) => id === day)?.[1] ?? ''
export function validate(answers, step) {
  if (step === 'goal') {
    if (!answers.goal) return 'Kies wat je wilt bereiken.'
    if (answers.goal === 'both' && !answers.priority) return 'Kies je voorkeur, of geef aan dat je die nog niet hebt.'
    if (!answers.focus) return 'Kies of je ergens extra aandacht voor wilt.'
  }
  if (step === 'experience' && !answers.experience) return 'Kies hoeveel ervaring je hebt.'
  if (step === 'week') {
    if (!answers.day) return 'Kies je vaste trainingsdag.'
    if (!answers.minutes) return 'Kies hoeveel tijd je per training hebt.'
    if (answers.day === answers.weekend) return 'Je extra training kan niet op dezelfde dag als je vaste training.'
  }
  if (step === 'context' && !answers.place) return 'Kies waar je gaat trainen.'
  return ''
}
export function decide(answers) {
  const incomplete = steps.find(step => validate(answers, step))
  if (incomplete) return { view: incomplete, reason: 'incomplete' }
  if (answers.notes.trim()) return { view: 'unsupported', reason: 'restriction' }
  if (answers.place !== 'machines') return { view: 'unsupported', reason: 'equipment' }
  if (['1to3', 'over3'].includes(answers.experience)) return { view: 'unsupported', reason: 'experience' }
  if (Number(answers.minutes) < 60) return { view: 'compromise', reason: 'time' }
  return { view: 'proposal', reason: 'fits' }
}
export function nextDate(answers, now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  const selected = [answers.day, answers.weekend]
  while (!selected.includes(days[(date.getDay() + 6) % 7][0])) date.setDate(date.getDate() + 1)
  return date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
}
export function validAnswers(value) {
  if (!value || typeof value !== 'object') return false
  const allowed = { goal: ['', ...Object.keys(goals)], priority: ['', ...Object.keys(priorities)], focus: ['', ...Object.keys(focuses)], experience: ['', ...Object.keys(experiences)], day: ['', ...days.map(([id]) => id)], weekend: ['none', 'za', 'zo'], minutes: ['', '45', '60', '90'], place: ['', ...Object.keys(places)] }
  return Object.entries(allowed).every(([key, options]) => options.includes(value[key])) && typeof value.notes === 'string' && value.notes.length <= 500
}
export function validState(value) {
  return value?.version === 1 && validAnswers(value.draft) && views.includes(value.view)
    && [null, 'proposal', 'plan'].includes(value.editReturn) && ['known', 'blank'].includes(value.source)
    && (value.accepted === null || (validAnswers(value.accepted?.answers) && decide(value.accepted.answers).view === 'proposal' && typeof value.accepted.at === 'string'))
}
