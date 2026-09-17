# M4 - controle van het klikmodel

17 september 2026. Dit bewijs betreft het aparte ontwerpvoorstel, niet blijvende M4-opslag
of een volledige planner in de hoofdapp.

## Gecontroleerd

- `node scripts/check-m4-model.mjs`: beslisregels voor bekende en lege intake, tijdknelpunt,
  andere apparatuur, ervaring en beperking; dubbele dagen, eerstvolgende datum, ongeldige
  opgeslagen gegevens, onafhankelijk bevestigd snapshot en veilig weergeven van vrije tekst.
- `node scripts/export-m4-wireframes.mjs`: 11 statische schermen, inline CSS, geen scripts of
  formulierverzending, alle uitgaande lokale links bestaan.
- `node --check public/m4-voorstel/prototype.js`: syntaxis in orde.
- `npm test`: 31 bestaande opslagtests geslaagd; geen gewijzigde trainingslogica of database.
- `npm run build`: typecontrole en productiebuild geslaagd.
- In-app browser op 375px: voorgevulde route, vragen 1-4, expliciet gekozen zaterdag,
  45-minutencompromis, beperking behouden, daarna 60 minuten bevestigen, voorstel herladen,
  sheet sluiten via browser-terug en pas na 'Zo beginnen' naar Vandaag.
- Plan toont bevestigde antwoorden; een nieuwe doelkeuze laten vervallen herstelt die
  antwoorden. Gericht dagen aanpassen opent de weekvraag. Dezelfde dag tweemaal wordt geweigerd.
- Lege intake: ontbrekend doel wordt gemeld; doel, ervaring en week ingevuld. Thuis zonder
  materiaal levert geen machineschema op. Na correctie wordt het plan expliciet bevestigd;
  herladen behoudt Vandaag en de gekozen woensdag zonder automatische weekendtraining.
- Geen horizontale overflow bij de gecontroleerde mobiele schermen; geen browserfouten gemeld.
  Schermhiërarchie is visueel bekeken. De mobiele viewport is na de controle hersteld.
- Een oude lokale service worker is via de normale knop 'Nieuwe versie openen' bijgewerkt;
  daarna opent `/m4-voorstel/` het correcte voorstel in plaats van de hoofdapp.

## Grenzen

M4-browsercontrole is uitgevoerd in de in-app browser; geen volledige WebKit-suite of echte
iPhone-controle van M4 geclaimd. De eerdere telefoonbevestiging van Raoul geldt voor M3a.
Opslagfoutafhandeling is aanwezig; foutinjectie in een echte browser is in deze ronde niet gedaan.
SessionStorage bewaart het voorbeeld in hetzelfde tabblad. De voorstelroute wordt niet voor
offline gebruik gecachet. Langdurige opslag en activering van het echte plan volgen na beoordeling.
