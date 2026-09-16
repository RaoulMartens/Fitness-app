# M2-ontwerpvoorstel - verificatie 16 september 2026

Dit bewijs betreft het afzonderlijke klikmodel in public/m2-voorstel, niet een voltooide M2-app.
Programma en schermwijzigingen zijn nog ter beoordeling. Bestaande M1-trainingen worden niet geraakt.

## Gecontroleerd

- TypeScript/productiebuild en JavaScript-syntaxcontrole slagen.
- Bestaande M1-regressie: 8 opslagtests en 4 Chromium-mobile browsertests geslaagd.
- Voorstel via Playwright CLI in Chromium: hele training met 14 werksets doorlopen; laatste set
  laat de sessie actief tot expliciete afronding; alle ingevoerde sets staan in de samenvatting.
- Draft blijft gelijk na uitleg-overlay, sluiten en herladen in hetzelfde tabblad.
- Naar Vandaag behoudt actieve status en absolute rusteindtijd. Pauzeren bewaart resterende rust;
  hervatten zet die resterende tijd voort. Getest met gecontroleerde browserklok.
- Rust verloopt naar blijvend 'Rust voorbij'; extra rust na afloop begint met 30 seconden vanaf nu.
- Afbreken heeft een eigen eindstatus. Open invoer geeft een waarschuwing en telt niet als prestatie.
- Weekend wordt pas gekozen door een expliciete actie en kan weer ongepland worden gemaakt.
- Het compromis voor twee vaste dagen wijzigt niet direct de weekendplanning.
- Geen JavaScript-runtimefouten tijdens de gehele flow. Geen horizontale overflow op 375px.
- Mobiel (375 x 812) en desktop (1280 x 900) visueel gecontroleerd op dezelfde rustflow.
- Screen Wake Lock-weigering gesimuleerd: duidelijke fallback, geen valse bevestiging.

## Review en gerichte herstelcontrole

Een afzonderlijke Impeccable-review vond focusverlies bij het vervangen van een form/sheet en
een inconsistente label voor gedeeltelijke afronding; daarnaast een decimale punt in gewichten.
Alle drie opgelost. Gerichte browserchecks bevestigen focus op de nieuwe heading, 'Sessie deels
afgerond' in samenvatting en Vandaag, en Nederlandse decimale komma's.
Reviewer-eindoordeel: ship op deze drie herstelpunten; geen claim van een volledige iPhone-audit.

Lokale captures staan in .impeccable/review/mobile.png, desktop.png en mobile-today.png.
De extra full-page modalcapture mobile-sheet.png is niet als bewijs gebruikt: scrollen verschoof
de vaste backdrop in die opname. De dialogfocus is via browserasserties gecontroleerd.
De mechanische Impeccable-detector had alleen regex-fallback beschikbaar en vond niets;
dat is geen berekende contrastcontrole of volledige toegankelijkheidsaudit.

## Grenzen

Geen fysieke iPhone-test van de nieuwe timer/wake lock. Geen media, definitieve apparaatinstructies,
trainingsdatabase-migratie, cloudsynchronisatie of productie-M2 gebouwd. Het voorbeeld gebruikt
alleen sessionStorage. De bestaande service worker cachet het voorstel niet en behandelt deze
route niet als M1-appnavigatie. Een reeds geopende oude M1-versie moet eerst de aangeboden nieuwe
versie activeren voordat die route-uitzondering beschikbaar is; de M1-data blijven behouden.
