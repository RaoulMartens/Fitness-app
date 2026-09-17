# M2 - statische HTML-wireframes

Gegenereerd uit de renderfuncties van het werkende klikmodel. Zelfstandige HTML met inline CSS,
375px canvas, gewone links, zonder scripts of formulierverzending. Niet-navigatieacties verwijzen
expliciet naar het werkende klikmodel; alleen daar zijn invoer, opslag, sheets en timers actief.
Het oefen- en resultatenscherm tonen lege voorbeeldsets. Geen persoonlijke trainingshistorie.

Opnieuw genereren: `node scripts/export-m2-wireframes.mjs`.

| Scherm | Bestand | Use case | Uitgaande links |
| --- | --- | --- | --- |
| Vandaag | [today.html](../../public/m2-voorstel/wireframes/today.html) | UC-001, UC-006 | warmup.html, overview.html, plan.html, today.html |
| Sessie-overzicht | [overview.html](../../public/m2-voorstel/wireframes/overview.html) | UC-001 | today.html, warmup.html |
| Warming-up | [warmup.html](../../public/m2-voorstel/wireframes/warmup.html) | UC-001 | today.html, exercise.html, ../#today |
| Oefening | [exercise.html](../../public/m2-voorstel/wireframes/exercise.html) | UC-002 | today.html, ../#today |
| Sessieresultaat | [summary.html](../../public/m2-voorstel/wireframes/summary.html) | UC-007 | today.html, consequences.html |
| Volgende keer | [consequences.html](../../public/m2-voorstel/wireframes/consequences.html) | UC-007 | summary.html, today.html |
| Plan | [plan.html](../../public/m2-voorstel/wireframes/plan.html) | UC-008 | plan-edit.html, today.html, plan.html |
| Trainingsdagen aanpassen | [plan-edit.html](../../public/m2-voorstel/wireframes/plan-edit.html) | UC-008 | plan.html |
| Planvoorstel beoordelen | [proposal.html](../../public/m2-voorstel/wireframes/proposal.html) | UC-010 | today.html, compromise.html |
| Compromis | [compromise.html](../../public/m2-voorstel/wireframes/compromise.html) | UC-010 | proposal.html, ../#today |
