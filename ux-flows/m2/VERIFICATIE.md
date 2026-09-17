# M2 - controle van de navigatiecorrectie

16 september 2026. Getest op de lokale preview op poort 4173, na een productiebuild.

## Uitgevoerd in de browser

- Vandaag -> Bekijk de sessie toont de oefeningen zonder een sessie te starten; browser-terug
  keert terug naar Vandaag met Start training.
- Plan toont de trainingsweek en Trainingsdagen aanpassen; geen duplicaat van de sessielijst.
- Zaterdag als concept kiezen en herladen behoudt het concept. Voorstel -> compromis -> terug
  naar de app bewaart die conceptkeuze en keert terug naar het planningsformulier.
- Annuleren na die keuze houdt het weekend ongepland. Zondag opslaan toont Zondag in Plan en Vandaag.
- Start training gaat rechtstreeks naar warming-up en daarna oefening 1.
- Gewicht 12,5 en 10 herhalingen als testinvoer blijven behouden na Vandaag -> Plan -> Vandaag
  -> hervatsheet -> oefening, en na herladen. Dit zijn testwaarden, geen begingewichten.
- Een vastgelegde set opent de rust. Extra rust, pauzeren, Plan openen, herladen en hervatten
  behouden de set en tonen weer de gepauzeerde resterende rusttijd.
- Alle 14 sets doorlopen. Pas de expliciete afrondbevestiging geeft het resultaat 'Klaar'.
- 'Wat betekent dit?' opent Volgende keer; 'Terug naar je sessie' keert naar het resultaat terug.
- Eigen testvoorbeeld opnieuw beginnen en herladen geeft Vandaag zonder oude testinvoer;
  URL en scherm blijven gelijk.
- Vandaag, Plan en Trainingsdagen aanpassen visueel bekeken op 375px. Geen horizontale overflow;
  de app behoudt grijstinten en eenvoudige wireframeranden.
- Geen waargenomen browserfouten of waarschuwingen tijdens deze controles.

## Geautomatiseerde controles

- `npm run build`: geslaagd (TypeScript, Vite en PWA-output).
- `npm test`: 8 tests geslaagd.
- `npm run test:e2e`: 4 bestaande Chromium-tests geslaagd, inclusief offline heropenen en behoud
  van M1-registraties. Deze vier tests dekken M1; de M2-routes zijn apart hierboven gecontroleerd.
- `node --check public/m2-voorstel/prototype.js`: geslaagd.
- `node scripts/export-m2-wireframes.mjs`: 10 zelfstandige HTML-wireframes gegenereerd.

## Grenzen

Dit bewijst geen iPhone-/WebKit-gedrag en geen volledige offline M2-opslag. De werkende
M1-app is ongemoeid gelaten. Het M2-model bewaart voorbeelden in sessionStorage binnen dit
tabblad. Op 16 september was de correctie alleen lokaal gebouwd en gecontroleerd.
Op 17 september is de publicatiestap gestart via de bestaande GitHub Pages-workflow;
de workflowstatus en de gepubliceerde schermen worden afzonderlijk gecontroleerd.
