# Training: werkend low-fidelity prototype

M2: de volledige sessieflow met blijvende lokale opslag. De grijze vormgeving en schermrollen
volgen `ux-flows/m2/`. Het getoonde startschema bevat zeven oefeningen en veertien werksets.
Gecontroleerde apparaatinstructies en demonstraties ontbreken nog.

De telefooncontrole van M2 is op 17 september door Raoul bevestigd. De volgende stap staat als
afzonderlijk [M3a-ontwerpvoorstel](m3-ontwerpvoorstel.md) op `/m3-voorstel/`: bezet materiaal,
minder tijd, dagvorm en onderbreken. Dit is een klikmodel met eigen tabbladopslag, geen uitbreiding
van de productieopslag. De hoofdapp blijft M2. [Flows en controle](ux-flows/m3/UX-FLOWS.md).
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
- Zichtbare opslagfouten met mogelijkheid opnieuw te proberen. Alleen geslaagde schrijfacties
  krijgen de status 'op apparaat opgeslagen'.

M2 staat in `src/workout/`: `model.ts` bevat het startschema en de types, `db.ts` de transacties,
`WorkoutSetForm.tsx` de setinvoer en `WorkoutApp.tsx` de schermen. Stijlen staan in `src/styles.css`.
Een setbevestiging bewaart set, sessiecursor, rust en uitgaande opdracht in dezelfde transactie.
Elke sessie heeft een vast voorschriftsnapshot; latere programmawijzigingen herschrijven dat niet.

M1 blijft bereikbaar via `/?m1=1` en via 'Over deze versie'. Die testweergave houdt zijn eigen
database `training-m1`; M2 gebruikt `training-m2`. Er wordt niets gewist of automatisch overgenomen
uit M1 of het klikmodel. Een terugrol van de appcode laat beide databases bestaan. De opslagtests
controleren behoud van een M1-set, concept en wachtrij na M2-gebruik en opnieuw openen.
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

Verificatie 17 september: build en 18 opslagtests slagen. Alle 11 Chromium-browsertests slagen.
WebKit start inmiddels: 8 van 11 tests slagen, waaronder alle M2-interacties behalve offline
heropenen. Drie tests (ook bestaande M1-tests) geven bij `context.setOffline(true)` een interne
WebKit-navigatiefout. Dat is geen geslaagde offline-test; de precieze oorzaak is niet vastgesteld.

Een afzonderlijke controle schakelt daarom de lokale webserver echt uit, zonder offline-emulatie:

```sh
node scripts/check-offline-webkit.mjs
```

Die controle slaagt in WebKit: herladen en volledig sluiten/heropenen bewaren de sessie en
conceptinvoer terwijl de server onbereikbaar is. Draai eerst een lokale build (zonder
`GITHUB_PAGES=1`). Deze test start een eigen tijdelijke server en gebruikt een eigen browserprofiel.
De bestaande M1-registraties zijn ook na een echte serviceworker-update naar M2 visueel behouden.
Raoul heeft het M2-klikmodel op telefoon bevestigd; de nieuwe blijvende opslag, pauze en rust
vragen nog een afzonderlijke echte iPhone-test.

## Bewuste grenzen

Geen echte demonstratievideo, apparaatinstructies, automatische progressie, onboarding of serverlogin.
De demo meldt eerlijk dat het bestand ontbreekt. Nieuwe gewichten worden niet automatisch verhoogd.
Geen gegarandeerd rustsignaal met vergrendeld scherm. Gegevens zijn uitsluitend lokaal; wissen van
browsergegevens wist de registratie. Export/verwijderen en synchronisatie blijven in M6.
De definitieve appstijl volgt later. `bouwbrief.md` en `bouwvoorstel.md` houden de besluiten bij.
