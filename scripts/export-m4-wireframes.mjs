import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { fresh } from '../public/m4-voorstel/model.js'
import { screen } from '../public/m4-voorstel/screens.js'

const root = new URL('../', import.meta.url)
const output = new URL('public/m4-voorstel/wireframes/', root)
await mkdir(output, { recursive: true })
const css = await readFile(new URL('public/m4-voorstel/style.css', root), 'utf8')
const titles = { start: 'Startpunt', goal: 'Doel', experience: 'Ervaring', week: 'Week en tijd', context: 'Trainingsplek', proposal: 'Planvoorstel', compromise: 'Compromis', unsupported: 'Nog geen passend plan', today: 'Vandaag', plan: 'Plan', overview: 'Sessie-overzicht' }
const next = { goal: 'experience', experience: 'week', week: 'context', context: 'proposal' }
const previous = { goal: 'start', experience: 'goal', week: 'experience', context: 'week' }
const inventory = []
for (const [view, title] of Object.entries(titles)) {
  const state = fresh()
  state.view = view
  if (['compromise', 'unsupported'].includes(view)) state.draft.minutes = '45'
  if (['today', 'plan', 'overview'].includes(view)) state.accepted = { answers: structuredClone(state.draft), at: new Date().toISOString() }
  const links = new Set()
  const markup = screen(state).replace(/<button\b([^>]*)>([\s\S]*?)<\/button>/g, (_, attrs, label) => {
    const action = attrs.match(/data-action="([^"]+)"/)?.[1]
    let target = action?.startsWith('nav-') ? action.slice(4) : action?.startsWith('edit-') ? action.slice(5) : action === 'next' ? next[view] : action === 'back' ? previous[view] : ({ accept: 'today', 'allow-time': 'proposal', 'keep-time': 'unsupported', 'open-edit': 'goal' })[action]
    if (!(target in titles)) throw new Error(`Missing navigation: ${view} ${action}`)
    links.add(target)
    return `<a href="${target}.html" class="wf-link ${attrs.includes('primary') ? 'wf-button primary' : ''}">${label}</a>`
  }).replace(/<input\b([^>]*)>/g, '<input $1 disabled>').replace(/<textarea\b([^>]*)>/g, '<textarea $1 disabled>')
  const html = `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} - M4 wireframe</title><style>${css}\n.wf-screen,.review-meta{max-width:375px}.review-meta{margin:auto;padding:8px 16px;font-size:12px}a.wf-button{text-decoration:none}</style></head><body><details class="review-meta"><summary>Over dit wireframe</summary><p>${title} · UC-010 · statische momentopname.</p><a href="../index.html#${view}">Interactief prototype</a></details><main class="wf-screen">${markup}</main><footer class="review-meta">${view}.html · UC-010</footer></body></html>\n`
  await writeFile(new URL(`${view}.html`, output), html)
  inventory.push(`| ${title} | [${view}.html](../../public/m4-voorstel/wireframes/${view}.html) | ${[...links].map(target => titles[target]).join(', ')} |`)
}
for (const name of Object.keys(titles)) {
  const html = await readFile(new URL(`${name}.html`, output), 'utf8')
  if (/<script\b|<form\b|\son\w+=/.test(html)) throw new Error(`Interactive markup in ${name}`)
  for (const match of html.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)) await access(new URL(match[1], output))
}
await mkdir(new URL('ux-flows/m4/', root), { recursive: true })
await writeFile(new URL('ux-flows/m4/wireframes-INDEX.md', root), `# M4 - statische schermen\n\nAlle schermen horen bij UC-010. Gebaseerd op de mobiele wf-klassen uit het skilltemplate,\nmet 375px in plaats van de daarin aanwezige desktopvariant. Inline CSS, geen scripts of\nformulierverzending. De echte bediening en opslag zitten in het afzonderlijke klikmodel.\n\n| Scherm | Bestand | Uitgaande links |\n| --- | --- | --- |\n${inventory.join('\n')}\n`)
console.log(`${inventory.length} M4 wireframes generated; static navigation verified.`)
