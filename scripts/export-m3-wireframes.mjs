import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'

const root = new URL('../', import.meta.url)
const source = await readFile(new URL('public/m3-voorstel/prototype.js',root),'utf8')
const css = await readFile(new URL('public/m3-voorstel/style.css',root),'utf8')
const out = new URL('public/m3-voorstel/wireframes/',root)
await mkdir(out,{recursive:true})
const screens = {
  today:['Vandaag','UC-006'], exercise:['Oefening','UC-003, UC-004, UC-005, UC-006'], plan:['Plan','UC-006'], summary:['Resultaat','UC-006'],
  adjust:['Pas vandaag aan','UC-003, UC-006'], swap:['Lukt niet','UC-004'], busy:['Apparaat bezet','UC-004'], material:['Geen materiaal','UC-004'], pain:['Pijn','UC-004'], skip:['Oefening overslaan','UC-004'],
  time:['Minder tijd','UC-003'], 'time-review':['Gevolg minder tijd','UC-003'], hard:['Te zwaar','UC-005'], structural:['Structureel te zwaar','UC-005'], weight:['Doel vandaag','UC-005'],
  interrupt:['Pauzeren of stoppen','UC-006'], complete:['Afronden bevestigen','UC-006'], abort:['Afbreken bevestigen','UC-006'], postpone:['Datum kiezen','UC-006'], 'postpone-review':['Verplaatsen bevestigen','UC-006'], 'skip-day':['Overslaan bevestigen','UC-006'],
}
const inventory = []
for (const [id,[title,uc]] of Object.entries(screens)) {
  const base = ['today','exercise','plan','summary'].includes(id)
  const planned = ['today','adjust','postpone','postpone-review','skip-day','plan'].includes(id)
  const app = {innerHTML:''}, content = {innerHTML:''}
  const context = { document:{querySelector:s => s === '#app' ? app : s === '#sheet-content' ? content : {}, addEventListener(){}}, sessionStorage:{getItem:()=>null}, location:{hash:''}, Intl, structuredClone }
  runInNewContext(`${source.slice(0,source.indexOf("document.addEventListener('input'"))}\nstate = fresh(${!planned}); view = '${base ? id : planned ? 'today' : 'exercise'}'; selection = ${id === 'postpone-review' ? "'2026-09-24'" : '[5,6]'}; reason='day'; render(); sheet='${id}'; ${base ? '' : 'renderSheet();'}`,context)
  const links = new Set()
  function convert(html) {
    return html.replace(/<button\b([^>]*)>([\s\S]*?)<\/button>/g,(_,attrs,label) => {
      const action = attrs.match(/data-action="([^"]+)"/)?.[1] ?? ''
      let target = action.startsWith('nav-') ? action.slice(4) : action.startsWith('open-') ? action.slice(5) : action.startsWith('reason-') ? 'weight' : action === 'review-date' ? 'postpone-review' : action === 'close' ? (planned ? 'today' : 'exercise') : null
      if (!(target in screens)) target = null
      const href = target ? `${target}.html` : '../index.html'
      links.add(href)
      return `<a href="${href}" class="wf-link ${attrs.includes('primary') ? 'wf-button' : ''}">${label}${target ? '' : ' (in klikmodel)'}</a>`
    }).replace(/<form[^>]*>/g,'<section>').replace(/<\/form>/g,'</section>')
      .replace(/<input\b([^>]*)>/g,'<input $1 disabled>')
      .replace(/ data-\w+(?:-\w+)*="[^"]*"/g,'')
  }
  const body = base ? convert(app.innerHTML) : `<div class="wf-context" aria-hidden="true"><p>Voorbeeldcontext: ${planned ? 'Vandaag - afspraak woensdag 23 september' : 'Chest press - set 1 van 2, invoer blijft bewaard'}</p></div><section class="wf-sheet">${convert(content.innerHTML)}</section>`
  await writeFile(new URL(`${id}.html`,out),`<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} - M3 wireframe</title><style>${css}\n.wf-screen,.review-bar{max-width:375px}.wf-sheet{border-top:2px dashed #999;padding-top:16px}.wf-context{color:#777;background:#ddd;padding:12px}.wf-link{min-height:44px}</style></head><body><aside class="review-bar">Statisch M3-wireframe · ${uc}<p>Voorbeeld, geen opslag. Sheets hieronder tonen hun onderliggende context.</p><a href="../index.html">Naar het interactieve klikmodel</a></aside><main class="wf-screen">${body}<footer class="wf-footer">${id}.html · ${uc}</footer></main></body></html>\n`)
  inventory.push(`| ${title} | [${id}.html](../../public/m3-voorstel/wireframes/${id}.html) | ${base ? 'Scherm' : 'Sheet'} | ${uc} | ${[...links].join(', ')} |`)
}
await mkdir(new URL('ux-flows/m3/',root),{recursive:true})
await writeFile(new URL('ux-flows/m3/wireframes-INDEX.md',root),`# M3 - HTML-wireframes\n\nGegenereerd uit de teksten van het interactieve model. Inline CSS, 375px, geen scripts of\nformulierverzending. De wf-klassen van het skilltemplate volgen de bestaande mobiele app.\nInvullen en bevestigen verwijzen naar het interactieve model; sheets zijn visuele snapshots\nvan overlays, geen nieuwe bestemmingen in de hoofdapp.\n\n| Naam | Bestand | Soort | Use cases | Uitgaande links |\n| --- | --- | --- | --- | --- |\n${inventory.join('\n')}\n`)
console.log(`Exported ${inventory.length} M3 wireframes.`)

const cases = {
  'uc-003': { title:'Minder tijd', start:'Vandaag of Oefening', choice:'Resterende oefeningen kiezen', review:'Vervalt en blijft bekijken', result:'Open sets overslaan vandaag', cancel:'Selectie vervalt', entity:'aanpassing plus open setstatussen' },
  'uc-004': { title:'Oefening lukt niet', start:'Oefening', choice:'Bezet, geen materiaal of pijn', review:'Later doen of overslaan bekijken', result:'Open oefening later of overgeslagen', cancel:'Volgorde en sets gelijk', entity:'aanpassing plus volgorde of setstatussen' },
  'uc-005': { title:'Te zwaar', start:'Oefening', choice:'Dagvorm, techniek of structureel', review:'Eigen doel vandaag bekijken', result:'Alleen doel vandaag aangepast', cancel:'Doel en niveau gelijk', entity:'aanpassing plus doel voor open sets' },
  'uc-006': { title:'Onderbreken en afspraak wijzigen', start:'Vandaag of Oefening', choice:'Geplande afspraak of actieve uitvoering', review:'Datum of eindstatus bevestigen', result:'Afspraak of uitvoering zichtbaar bijgewerkt', cancel:'Sessie en afspraak blijven', entity:'afspraakgebeurtenis of uitvoeringsstatus' },
}
for (const [id,c] of Object.entries(cases)) {
  const folder = new URL(`ux-flows/m3/diagrams/${id}/`,root)
  await mkdir(folder,{recursive:true})
  await writeFile(new URL('flow.md',folder),`# ${id.toUpperCase()} - ${c.title}\n\n\`\`\`mermaid\nflowchart TD\n  A[${c.start}] --> B[${c.choice} - sheet]\n  B --> C[${c.review}]\n  C --> D{Bevestigen?}\n  D -->|Nee of Sluiten| E[${c.cancel}]\n  E --> A\n  D -->|Ja| F[${c.result}]\n  F --> A\n  C -->|Bijstellen| B\n  classDef screen fill:#f5f5f5,stroke:#888\n  classDef sheet fill:#e8e8e8,stroke:#888,stroke-dasharray:5 5\n  class A,F,E screen\n  class B,C sheet\n\`\`\`\n`)
  await writeFile(new URL('states.md',folder),`# ${id.toUpperCase()} - toestanden\n\n\`\`\`mermaid\nstateDiagram-v2\n  [*] --> Ongewijzigd\n  Ongewijzigd --> Concept: sheet openen\n  Concept --> Ongewijzigd: sluiten of terug\n  Concept --> Bevestigen: geldig voorstel\n  Bevestigen --> Concept: bijstellen\n  Bevestigen --> Opslaan: akkoord\n  Opslaan --> Fout: opslag mislukt\n  Fout --> Opslaan: opnieuw proberen\n  Fout --> Ongewijzigd: annuleren\n  Opslaan --> Aangepast: lokaal opgeslagen\n  Aangepast --> Ongewijzigd: aanpassing herstellen waar toegestaan\n\`\`\`\n\nBij UC-006: pauzeren is hervatbaar, afronden/afbreken is een expliciete eindstatus.\nIn het klikmodel zijn afspraakverplaatsingen en eindstatussen niet terugdraaibaar; alleen\nsessieaanpassingen hebben herstel zolang de uitvoering actief of gepauzeerd is.\n`)
  await writeFile(new URL('sequence.md',folder),`# ${id.toUpperCase()} - lokaal schrijven\n\nContract voor de latere hoofdapp, niet een bewijs van het klikmodel. Geen HTTP/server nodig.\n\n\`\`\`mermaid\nsequenceDiagram\n  actor U as Raoul\n  participant UI as Sheet boven context\n  participant DB as IndexedDB\n  U->>UI: Keuze maken\n  UI-->>U: Gevolg en reikwijdte tonen\n  U->>UI: Bevestigen\n  UI->>DB: Transactie met operatie-id en basisrevisie\n  Note over DB: ${c.entity} plus outbox\n  alt revisie klopt en opslag slaagt\n    DB-->>UI: Op apparaat opgeslagen\n    UI-->>U: Gewijzigde context\n  else fout of verouderde revisie\n    DB-->>UI: Geen gedeeltelijke wijziging\n    UI-->>U: Concept bewaren en herstel aanbieden\n  end\n\`\`\`\n`)
}
await writeFile(new URL('ux-flows/m3/diagrams/INDEX.md',root),`# M3 - diagrammen\n\n[Screen map](../screen-map.md).\n\n${Object.entries(cases).map(([id,c]) => `- ${id.toUpperCase()} ${c.title}: [flow](${id}/flow.md), [toestanden](${id}/states.md), [interactie](${id}/sequence.md).`).join('\n')}\n`)
