# Training: werkend low-fidelity prototype

M1: een oefening met drie expliciete testsets. De grijze vormgeving volgt
`ux-flows/wireframes/exercise.html`. Dit is nog geen persoonlijk trainingsschema.

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
niet vanaf een andere telefoon bereikbaar. Er is nog geen externe hosting ingericht.

## Wat werkt

- Gewicht (ook 12 of 12,5 kg) en gehele herhalingen invoeren en stapsgewijs wijzigen.
- Conceptinvoer per toetsaanslag in IndexedDB bewaren, ook lege of halve invoer zoals '12,'.
- Valideren bij bevestiging; een set en de bijbehorende uitgaande opdracht atomair opslaan.
- Dubbele bevestiging zonder dubbele log; correcties met revisies, geen stille overschrijving
  van een nieuwere set uit een ander venster.
- Opgeslagen sets en concepten hervatten na sluiten en offline heropenen.
- Een uitlegsheet openen met behoud van de invoer; terug naar Vandaag en weer verder.
- Testsessie afronden, nieuwe testsessie starten en eerdere registraties teruglezen.
- Zichtbare opslagfouten met mogelijkheid opnieuw te proberen. Alleen geslaagde schrijfacties
  krijgen de status 'op apparaat opgeslagen'.

Het testvoorschrift staat in `src/model.ts`, de opslag in `src/db.ts`, de setinvoer in
`src/components/SetForm.tsx`, de schermstructuur in `src/App.tsx` en alle stijlen in `src/styles.css`.
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

Op de huidige Windows-machine blokkeert Application Control het laden van `harfbuzz.dll` uit
de WebKit-testbrowser. Dat is een omgevingsblokkade, geen geslaagde WebKit-test. Beveiligingsbeleid
is niet aangepast. Voer deze controle uit op een geschikte omgeving; echte iPhone-installatie,
toetsenbord en heropenen moeten ook op het toestel worden gecontroleerd.

## Bewuste grenzen

Geen echte demonstratievideo, rusttimer, persoonlijk programma, onboarding of serverlogin in M1.
De demo meldt eerlijk dat het bestand ontbreekt. Gegevens zijn uitsluitend lokaal; wissen van
browsergegevens wist de registratie. Export/verwijderen en synchronisatie blijven in M6.
De definitieve appstijl volgt later. `bouwbrief.md` en `bouwvoorstel.md` houden de besluiten bij.
