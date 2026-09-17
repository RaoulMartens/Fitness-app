import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'

// Export the existing render functions so the static reference cannot acquire different screen copy.
// The skill template supplies wf-* navigation classes; its desktop canvas is adapted to 375px.
const root = new URL('../', import.meta.url)
const source = await readFile(new URL('public/m2-voorstel/prototype.js', root), 'utf8')
const css = await readFile(new URL('public/m2-voorstel/style.css', root), 'utf8')
const output = new URL('public/m2-voorstel/wireframes/', root)
await mkdir(output, { recursive: true })
const screens = {
  today: ['Vandaag', 'UC-001, UC-006'],
  overview: ['Sessie-overzicht', 'UC-001'],
  warmup: ['Warming-up', 'UC-001'],
  exercise: ['Oefening', 'UC-002'],
  summary: ['Sessieresultaat', 'UC-007'],
  consequences: ['Volgende keer', 'UC-007'],
  plan: ['Plan', 'UC-008'],
  'plan-edit': ['Trainingsdagen aanpassen', 'UC-008'],
  proposal: ['Planvoorstel beoordelen', 'UC-010'],
  compromise: ['Compromis', 'UC-010'],
}
const actions = { start: 'warmup', 'begin-exercise': 'exercise', 'save-plan': 'plan', 'return-app': 'today' }
const inventory = []
for (const [view, [name, useCase]] of Object.entries(screens)) {
  const app = { innerHTML: '' }
  const session = ['warmup', 'exercise', 'summary', 'consequences'].includes(view)
    ? { status: ['summary', 'consequences'].includes(view) ? 'completed' : 'active', phase: view === 'warmup' ? 'warmup' : 'exercise', warmed: false, sets: [], draft: { weight: '', reps: '' }, rest: null }
    : null
  const context = {
    document: { visibilityState: 'hidden', querySelector: selector => selector === '#app' ? app : selector === '#review-proposal' ? {} : null },
    sessionStorage: { getItem: () => null },
    snapshot: { view, session, weekend: null, planDraft: { weekend: null }, compromise: null, reviewReturn: 'today' },
  }
  runInNewContext(`${source.slice(0, source.indexOf("document.addEventListener('click'"))}\nstate = snapshot; render();`, context)
  const links = new Set()
  let content = app.innerHTML.replace(/<button\b([^>]*)>([\s\S]*?)<\/button>/g, (_, attributes, label) => {
    const action = attributes.match(/data-action="([^"]+)"/)?.[1]
    const target = action in screens ? action : actions[action]
    const href = target ? `${target}.html` : '../#today'
    links.add(href)
    const style = attributes.match(/class="([^"]+)"/)?.[1] ?? ''
    const current = attributes.includes('aria-current="page"') ? ' aria-current="page"' : ''
    return `<a href="${href}" class="wf-link ${style}${action?.startsWith('return') ? ' wf-back' : ''}"${current}>${label}${target ? '' : ' (in klikmodel)'}</a>`
  })
  content = content.replace(/<form\b[^>]*>/g, '<section class="group">').replace(/<\/form>/g, '</section>')
    .replace(/<footer class="footer">[\s\S]*?<\/footer>/, `<footer class="footer">${view}.html · ${useCase} · statisch voorbeeld, geen opgeslagen training</footer>`)
    .replace('class="nav"', 'class="nav wf-nav"').replace('class="tabs"', 'class="tabs wf-tab-bar"')
    .replaceAll('class="panel"', 'class="panel wf-card"').replaceAll('class="exercise-list"', 'class="exercise-list wf-list-item"')
    .replace('tabindex="-1"', 'tabindex="-1" class="wf-header"')
  const document = `<!doctype html>
<html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${name} - M2 wireframe</title>
<style>${css}
.app,.review-bar { max-width:375px; } .wf-link { display:block; text-align:center; padding:12px; min-height:44px; } .tabs .wf-link { flex:1; } .tabs [aria-current] { font-weight:600; text-decoration:underline; } .wf-link.primary { border:1px dashed #777; } .wf-link.secondary { border:1px dashed #888; } .wf-nav .wf-link { font-size:12px; }
</style></head><body><aside class="review-bar"><strong>Statisch M2-wireframe</strong><p>De links tonen de schermflow. Probeer opslaan, invoer, sheets en timers in het werkende klikmodel.</p><div class="review-links"><a class="wf-link" href="../">Werkend klikmodel</a><a class="wf-link" href="proposal.html">Planvoorstel beoordelen</a></div></aside><main class="app">${content}</main></body></html>`
  await writeFile(new URL(`${view}.html`, output), document)
  inventory.push(`| ${name} | [${view}.html](../../public/m2-voorstel/wireframes/${view}.html) | ${useCase} | ${[...links].join(', ')} |`)
}
await writeFile(new URL('ux-flows/m2/wireframes-INDEX.md', root), `# M2 - statische HTML-wireframes\n\nGegenereerd uit de renderfuncties van het werkende klikmodel. Zelfstandige HTML met inline CSS,\n375px canvas, gewone links, zonder scripts of formulierverzending. Niet-navigatieacties verwijzen\nexpliciet naar het werkende klikmodel; alleen daar zijn invoer, opslag, sheets en timers actief.\nHet oefen- en resultatenscherm tonen lege voorbeeldsets. Geen persoonlijke trainingshistorie.\n\nOpnieuw genereren: \`node scripts/export-m2-wireframes.mjs\`.\n\n| Scherm | Bestand | Use case | Uitgaande links |\n| --- | --- | --- | --- |\n${inventory.join('\n')}\n`)
console.log(`Exported ${inventory.length} self-contained M2 wireframes.`)
