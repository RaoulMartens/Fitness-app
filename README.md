# Training: werkend low-fidelity prototype

M3a: de volledige sessieflow en aanpassingen voor vandaag met blijvende lokale opslag.
De compacte, grijze schermen volgen `ux-flows/m2/` en het goedgekeurde `ux-flows/m3/`.
Het startschema bevat zeven oefeningen en veertien werksets.
Gecontroleerde apparaatinstructies en demonstraties ontbreken nog.

De telefooncontrole van M2 is op 17 september door Raoul bevestigd. Na beoordeling van het
compacte [M3a-ontwerpvoorstel](m3-ontwerpvoorstel.md) is M3a in de hoofdapp gebouwd.
Het afzonderlijke klikmodel op `/m3-voorstel/` blijft een referentie met eigen tabbladopslag.
[Flows](ux-flows/m3/UX-FLOWS.md) en [implementatiecontrole](ux-flows/m3/IMPLEMENTATIE.md).
Wie vanuit een eerder gecachete app bij de voorstelroute toch M2 ziet, kiest eerst
'Nieuwe versie openen'; de nieuwe service worker houdt beide voorstelroutes buiten de appcache.

## Starten

Node.js 22.12+ of een ondersteunde nieuwere versie.

```sh
npm ci
npm run dev
```

De ontwikkelserver is voor snelle wijzigingen. De service worker is daar uitgeschakeld zodat
oud gecachete code het ontwikkelen niet verstoort. Voor offline gebruik en installatie:

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Open http://127.0.0.1:4173. Wacht de eerste keer op 'App offline beschikbaar'. Gebruik bij
terugkomen dezelfde browser en hetzelfde adres: localhost en 127.0.0.1 hebben afzonderlijke opslag.
Installatie op een echte telefoon vraagt een bereikbaar HTTPS-adres; de lokale preview is
niet vanaf een andere telefoon bereikbaar. De testversie wordt bij elke wijziging op `main`
automatisch gepubliceerd via GitHub Pages op https://raoulmartens.github.io/Fitness-app/.
Open die link op je iPhone in Safari en voeg de app via Deel > Zet op beginscherm toe.
Wacht voor een offline test tot de app 'App offline beschikbaar' meldt. Gegevens blijven alleen
op dat toestel en in die browser bewaard.

## Wat werkt

De hoofdapp opent op Vandaag: starten of hervatten, met een optioneel sessie-overzicht.
Plan bevat de trainingsweek en een afzonderlijke bewerkstap voor de optionele weekendtraining.
Het oorspronkelijke [ontwerpvoorstel](m2-ontwerpvoorstel.md) blijft beschikbaar op `/m2-voorstel/`.
Dat aparte klikmodel gebruikt tijdelijke tabbladopslag; de hoofdapp gebruikt IndexedDB.

- Warming-up, zeven oefeningen, rust, expliciet afronden of afbreken, resultaat en volgende keer.
- Gewicht (ook 12 of 12,5 kg) en gehele herhalingen invoeren; geen verzonnen begingewichten.
- Conceptinvoer per toetsaanslag in IndexedDB bewaren, ook lege of halve invoer zoals '12,'.
- Valideren bij bevestiging; een set en de bijbehorende uitgaande opdracht atomair opslaan.
- Dubbele bevestiging zonder dubbele log; revisiecontrole tegen stille overschrijvingen.
- Rust op basis van een eindtijd: blijft correct na sluiten; expliciet pauzeren bevriest de resttijd.
- Scherm aanhouden tijdens rust waar ondersteund, met zichtbare terugval bij weigering.
- Opgeslagen sets en concepten hervatten na sluiten en offline heropenen.
- Een uitlegsheet openen met behoud van de invoer; terug naar Vandaag en weer verder.
- Volledig of gedeeltelijk afronden; eerdere registraties en vorige uitvoering teruglezen.
- Weekendplanning expliciet opslaan of annuleren, zonder een lopende training te wijzigen.
- Bezet: open sets van de huidige oefening later doen, met behoud van conceptinvoer.
- Resterende sets overslaan bij pijn of ontbrekend materiaal; zelf oefeningen weglaten bij minder tijd.
- Handmatig doelgewicht voor vandaag, gescheiden van het werkelijk geregistreerde gewicht.
- Laatste aanpassing terugdraaien zonder inmiddels uitgevoerde sets te verwijderen.
- Een nog niet gestarte afspraak verplaatsen, inkorten of overslaan, met behoud van geschiedenis.
- Zichtbare opslagfouten met mogelijkheid opnieuw te proberen. Alleen geslaagde schrijfacties
  krijgen de status 'op apparaat opgeslagen'.

De hoofdapp staat in `src/workout/`: `model.ts` bevat het startschema en de types, `db.ts` de
transacties, `AdjustmentSheet.tsx` de aanpassingen, `WorkoutSetForm.tsx` de setinvoer en
`WorkoutApp.tsx` de schermen. Stijlen staan in `src/styles.css`.
Een setbevestiging bewaart set, sessiecursor, rust en uitgaande opdracht in dezelfde transactie.
Elke sessie heeft een vast voorschriftsnapshot; latere programmawijzigingen herschrijven dat niet.

M1 blijft bereikbaar via `/?m1=1` en via 'Over deze versie'. Die testweergave houdt zijn eigen
database `training-m1`; de hoofdapp gebruikt `training-m2`, nu versie 2. De migratie kopieert
M2-sessies, sets, concepten, planning en wachtrij atomair naar afzonderlijke M3-tabellen. Alle
oude tabellen blijven staan. Oude gecachete M2-code kan daardoor geen M3-uitvoering overschrijven.
Invoer die een oud tabblad na de migratie toevoegt, wordt zichtbaar gemeld en apart getoond;
die wordt niet automatisch samengevoegd. Herstel gebruikt M3-compatibele code: M2-code ziet
alleen de oorspronkelijke tabellen. M1 en klikmodeldata worden niet geimporteerd.
Er is geen backend en er worden geen trainingsgegevens verstuurd. De uitgaande wachtrij is alleen
een lokale voorbereiding op M6; cloudsynchronisatie is niet geimplementeerd.

## Tests

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

De browsertests gebruiken de productiepreview. Ze controleren de volledige invoerflow, offline
gebruik, dubbel tikken, correcties, opslagfouten, gelijktijdige vensters en het volledig sluiten
en opnieuw starten van een browser met hetzelfde profiel. Playwright gebruikt eigen testprofielen.

Een aparte WebKit-controle staat klaar:

```sh
npx playwright install webkit
npm run test:e2e:webkit
```

Verificatie 17 september: build en 31 opslagtests slagen. Alle 15 Chromium-browsertests en de
4 nieuwe M3a-tests in WebKit slagen. Die controleren ook annuleren, meerdere vensters en herstel
na een opslagfout. De laatste correctie aan het openen van een aanpassing is opnieuw in beide
browsers gecontroleerd. De bestaande WebKit-suite had bij M2 drie navigatiefouten met
`context.setOffline(true)`; die volledige suite is voor M3a niet opnieuw als geslaagd aangemerkt.

Een afzonderlijke controle schakelt daarom de lokale webserver echt uit, zonder offline-emulatie:

```sh
node scripts/check-offline-webkit.mjs
```

Die controle slaagt in WebKit: herladen en volledig sluiten/heropenen bewaren de aangepaste
oefenvolgorde; terugdraaien herstelt de oefening inclusief halve conceptinvoer terwijl de server
onbereikbaar is. Draai eerst een lokale build (zonder
`GITHUB_PAGES=1`). Deze test start een eigen tijdelijke server en gebruikt een eigen browserprofiel.
De bestaande M1-registraties zijn ook na een echte serviceworker-update naar M2 visueel behouden.
Raoul heeft M2 op telefoon bevestigd. M3a vraagt nog een afzonderlijke echte iPhone-test.

## Bewuste grenzen

Geen echte demonstratievideo, apparaatinstructies, automatische progressie, onboarding of serverlogin.
De demo meldt eerlijk dat het bestand ontbreekt. Nieuwe gewichten worden niet automatisch verhoogd.
Geen gegarandeerd rustsignaal met vergrendeld scherm. Gegevens zijn uitsluitend lokaal; wissen van
browsergegevens wist de registratie. Export/verwijderen en synchronisatie blijven in M6.
De definitieve appstijl volgt later. `bouwbrief.md` en `bouwvoorstel.md` houden de besluiten bij.
