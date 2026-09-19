# Bouwdocument v1 — de trainingslus werkend maken

19 september 2026. Doel: het low-fi ontwerp uit `public/proto/` werkend krijgen zodat je het in
de sportschool kunt gebruiken. Het uiterlijk blijft grijs en gestippeld; alleen het gedrag wordt
echt. Visueel afmaken komt daarna.

## 1 · Afbakening

**Wel in v1 — de trainingslus.**
Vandaag, sessie starten, sets vastleggen met stappers, rust, oefening aanpassen, afronden,
en het resultaat met het voorstel voor de volgende keer. Plus hervatten, corrigeren,
extra set, en de vergeten sessie.

**Niet in v1.** Programma en Voortgang zijn zichtbaar maar tonen vaste gegevens.
Instellingen, export, herinneringen, herstelpercentages en dagen aanpassen komen later.
De reden: je wil zo snel mogelijk met dit ding tussen de apparaten staan, en alles wat je
daar niet gebruikt kan wachten.

**Grens die ik bewaak:** geen enkele functie in v1 die je niet tijdens een training nodig hebt.

## 2 · Wat blijft van de bestaande app

De huidige M3a-app heeft een hoop opgelost dat we niet opnieuw gaan doen.

| Bestand | Wat het doet | Actie |
| --- | --- | --- |
| `src/workout/db.ts` | Dexie-opslag, atomair opslaan van set plus sessie, revisiecontrole tegen dubbel opslaan | **Houden**, uitbreiden |
| `src/workout/model.ts` | Datamodel, `starterProgram`, resttijdberekening op eindtijd | **Houden**, uitbreiden |
| `src/workout/useWakeLock.ts` | Scherm aan tijdens rust, met zichtbare terugval | **Houden** |
| `vite.config.ts` | PWA, service worker, offline | **Houden** |
| `src/workout/db.test.ts`, `adjustments.test.ts` | 31 tests op opslag en aanpassingen | **Houden**, uitbreiden |
| `.github/workflows` | Tests en build bij elke push | **Houden** |

| Bestand | Actie |
| --- | --- |
| `src/workout/WorkoutApp.tsx` | **Vervangen** — bevat de oude schermindeling |
| `src/workout/WorkoutSetForm.tsx` | **Vervangen** — invoer wordt stappers |
| `src/workout/AdjustmentSheet.tsx` | **Herschrijven** — van vier opties naar twee |
| `src/workout/PlanEditor.tsx` | **Verwijderen** — dagen aanpassen zit niet in v1 |
| `src/App.tsx`, `src/db.ts`, `src/model.ts`, `src/components/` | **Verwijderen** — dat is M1, niet meer in gebruik |
| `public/m2-voorstel/`, `m3-voorstel/`, `m4-voorstel/` | **Verwijderen** — afgesloten voorstellen |

`public/proto/` blijft staan als referentie en als plek voor nieuwe ontwerpen.

## 3 · Wijzigingen in het datamodel

### 3.1 Oefeningen worden een eigen ding

Nu zit de oefening opgesloten in `starterProgram`. Voor het oefeningscherm, de vervangfunctie
en de video's is een catalogus nodig.

```ts
export interface Exercise {
  id: string
  name: string
  muscles: string          // 'Borst en voorste schouder'
  helper?: string          // 'Je triceps helpt mee.'
  why: string              // waarom deze in dit schema staat
  cues: string[]           // waar je op let
  videoUrl?: string        // lokaal bestand of YouTube, zie 6.4
  step: number             // stapgrootte in kg, standaard 2.5
  minWeight: number        // laagste gewicht dat dit apparaat kan
  restSeconds: number      // standaardrust, kan per slot afwijken
  alternatives: string[]   // ids voor 'Andere oefening'
}
```

`Slot` krijgt `exerciseId` als verwijzing; naam en resttijd komen uit de catalogus.

### 3.2 Sets kunnen buiten het schema vallen

```ts
export interface WorkoutSet {
  // bestaand: id, sessionId, slotId, exerciseId, number, weight, reps, target, recordedAt
  kind: 'warmup' | 'work' | 'extra'   // vervangt het losse extra-veld
  correctedAt?: string                 // gezet bij achteraf corrigeren
}
```

`kind` vervangt het eerdere `extra`, omdat een warming-up en een toegevoegde set allebei
buiten de progressie vallen maar niet hetzelfde zijn.

**De sessie bewaart haar eigen plan.** `snapshot` bestaat al; die moet meegroeien met wat er
tijdens de sessie verandert, zodat achteraf te zien is wat gepland stond:

```ts
export interface SessionSlot {
  slotId: string
  exerciseId: string
  originalExerciseId?: string   // gezet bij vervangen
  plannedSets: number           // na inkorten het ingekorte aantal
  originalSets: number
  order: number                 // verandert bij 'Later doen'
  step: number                  // gekopieerd, zodat een cataloguswijziging
  repsMin: number               // oude sessies niet met terugwerkende kracht
  repsMax: number               // anders laat uitvallen
  startWeight: number | null
}
```

### 3.3 Het voorstel voor de volgende keer wordt opgeslagen

Nu bestaat dat alleen in beeld. `Vandaag` moet het tonen (*Nieuw vandaag: Chest press 37,5 kg*),
dus het moet de sessie overleven.

```ts
export interface Proposal {
  id: string                    // sessionId + exerciseId
  exerciseId: string
  sessionId: string
  sessionDay: string            // voor de volgorde bij herberekening
  from: number
  to: number
  reason: 'boven-bereik' | 'onder-bereik' | 'vasthouden' | 'pauze' | 'plateau'
  createdAt: string
  appliedInSessionId?: string   // gevuld zodra het gewicht echt is gebruikt
  superseded: boolean
}
```

Dexie-tabel `proposals`, sleutel `id`, index op `[exerciseId+sessionDay]`. Het **actuele**
voorstel is het jongste met `superseded: false`.

Waarom niet één rij per oefening: corrigeer je een set uit een oudere sessie, dan wordt het
voorstel van díé sessie herberekend. Met één rij per oefening zou dat het nieuwere voorstel
overschrijven en je gewicht terugzetten.

### 3.4 Stilstand tellen

Voor `vastgelopen` is nodig hoe vaak een oefening op hetzelfde gewicht bleef:

```ts
export interface ExerciseState {
  exerciseId: string
  currentWeight: number | null
  startWeight: number | null       // gevuld bij de eerste vastgelegde werkset
  preBreakWeight: number | null    // bewaard tijdens een pauzesessie
  increases: number                // verhogingen die daadwerkelijk zijn gebruikt
  stalls: number
  lastWorkedDay: string | null
}
```

**ExerciseState is een cache, geen bron.** Alles erin moet herleidbaar zijn uit sets plus de
keuzes die bij de sessie zijn vastgelegd:

```ts
export interface SessionOutcome {
  sessionId: string
  plateauChoice?: Record<string, 'terug' | 'vervangen' | 'laten'>
  wasBreakSession: boolean
  finishedAt: string
  finishedPartially: boolean
}
```

Zonder die tweede tabel is de belofte "herberekenbaar" niet waar: *zo laten* bij een plateau
zet `stalls` op nul zonder dat er een set verandert, dus die keuze verdwijnt bij herberekening
en het plateauscherm komt terug.

## 4 · De regels, precies

Dit zijn de beslissingen uit het ontwerp, omgezet naar iets dat een computer kan uitvoeren.
Elke regel krijgt een test. De voorstellen hieronder zijn mijn keuze; wijk ervan af als je
het anders wil, maar laat geen geval open.

### 4.0 Begrippen, één keer vastgelegd

| Begrip | Definitie |
| --- | --- |
| **werkset** | een set met `kind: 'work'`. De warming-up (`kind: 'warmup'`) en een toegevoegde set (`kind: 'extra'`) tellen nooit mee voor progressie |
| **oefening afgerond** | alle werksets uit het **sessieplan** zijn vastgelegd. Na inkorten is dat het ingekorte aantal, niet het oorspronkelijke |
| **bereik gehaald** | elke werkset ligt op of boven `repsMin` |
| **bovenkant gehaald** | elke werkset ligt op of boven `repsMax` |
| **dag** | lokale kalenderdatum in `Europe/Amsterdam`, via `localDate()` |
| **sessiedag** | de kalenderdatum van `startedAt`, ook als je na middernacht doorgaat |

### 4.1 Progressie

Gekeken naar de werksets van een **afgeronde** oefening, op het gewicht van de zwaarste werkset:

| Situatie | Gewicht | Reden | `stalls` |
| --- | --- | --- | --- |
| bovenkant gehaald | omhoog met `step` | `boven-bereik` | 0 |
| bereik gehaald, bovenkant niet | blijft | `vasthouden` | +1 |
| een werkset onder `repsMin` | omlaag met `step` | `onder-bereik` | 0 |
| oefening niet afgerond | **geen voorstel**, gewicht blijft | — | ongewijzigd |
| geen enkele werkset vastgelegd | **geen voorstel** | — | ongewijzigd |

Twee grenzen: nooit onder `exercise.minWeight` (het laagste dat het apparaat kan), en een
handmatig ingevoerd gewicht buiten de stappenreeks wordt geaccepteerd zoals ingevoerd — de
volgende stap gaat vanaf dat getal verder.

`increases` stijgt pas wanneer het hogere gewicht **daadwerkelijk is gebruikt** in een sessie,
niet wanneer het voorstel ontstaat. Anders tellen de stapblokjes voornemens in plaats van werk.

### 4.2 Plateau

`stalls >= 3` na het afronden → `vastgelopen` verschijnt. Elke uitkomst zet `stalls` op nul:

| Keuze | Gevolg |
| --- | --- |
| Terugzetten | gewicht min twee stappen, `deloadFrom` bewaren |
| Andere oefening | vervanger vanaf de volgende sessie, eigen historie |
| Zo laten | niets, maar wel vastgelegd als `plateauChoice` bij de sessie |
| Sheet gesloten zonder keuze | geldt als *zo laten*, met dezelfde vastlegging |

Die vastlegging is nodig omdat `stalls` anders bij herberekening terugspringt naar drie en het
scherm opnieuw verschijnt.

### 4.3 Terug na een pauze

De pauze geldt **per training, niet per oefening**. Maatstaf is de laatste afgeronde sessie,
niet `lastSessionAt` per oefening — anders meldt een overgeslagen Leg curl een pauze die er
niet is.

- Meer dan tien dagen sinds de laatste afgeronde sessie → de eerstvolgende sessie is een
  **pauzesessie**: elk gewicht één stap lager, oude waarde bewaard als `preBreakWeight`.
- De pauzesessie is **verbruikt zodra je hem afrondt**, ook gedeeltelijk. Starten alleen is
  niet genoeg, anders raak je de korting kwijt door de app te openen.
- Per oefening: bereik gehaald → terug naar `preBreakWeight`. Bereik niet gehaald → het
  verlaagde gewicht wordt het nieuwe gewicht en `preBreakWeight` vervalt.
- Tijdens een pauzesessie geldt **geen gewone progressie en geen plateau**. De pauzeregel gaat
  voor.
- Overgeslagen oefeningen houden hun `preBreakWeight` tot ze een keer zijn gedaan.
- Een vervanger zonder historie krijgt geen korting; die begint gewoon.

### 4.4 Kalender en planning

- **Rust tussen sessies:** minimaal twee volledige kalenderdagen ertussen. Train je op dag 0,
  dan is dag 3 de eerstvolgende mogelijke dag.
- **Vervroegd trainen:** de reeks schuift mee vanaf de sessiedag, met behoud van dat minimum.
  Bij twee sessies per week houdt de app het ritme van drie en vier dagen aan.
- **Een oude sessie vandaag afronden** telt voor de planning als de **sessiedag**, niet als
  vandaag. Je hebt gisteren getraind.
- **Weggooien** laat geen sporen na: geen sets, geen voorstel, geen invloed op de pauzeteller.
  De planning valt terug op de sessie daarvoor.

### 4.5 Vergeten sessie

Een openstaande sessie kan niet worden voortgezet als de **sessiedag voorbij is én er meer dan
zes uur** sinds de laatste vastgelegde set is verstreken. Die tweede voorwaarde vangt de sessie
af die om 23.50 begint en om 00.10 doorloopt.

Alleen afronden met wat er staat, of weggooien.

### 4.6 Invoer

| Geval | Regel |
| --- | --- |
| Leeg of nul herhalingen | mag als concept bestaan, kan niet worden vastgelegd |
| Negatieve waarden | onmogelijk: de stapper gaat niet onder nul |
| Decimalen bij herhalingen | niet toegestaan, stap is altijd 1 |
| Gewicht met decimaal | toegestaan, één cijfer achter de komma |
| Gewicht buiten de stappenreeks | toegestaan bij handmatige invoer |

### 4.7 Schermvoorrang op Vandaag

Meerdere toestanden kunnen tegelijk waar zijn. Volgorde:

1. open sessie van vandaag → `vandaag-hervatten`
2. open sessie van een eerdere dag → `vandaag-vergeten`
3. meer dan tien dagen pauze en het is een trainingsdag → `vandaag-terug`
4. trainingsdag → `vandaag`
5. anders → `vandaag-rustdag`

## 5 · Schermen in v1

| Scherm in het prototype | Toestand in de app |
| --- | --- |
| `vandaag` | trainingsdag, geen open sessie |
| `vandaag-hervatten` | open sessie van vandaag |
| `vandaag-vergeten` | open sessie van een eerdere dag |
| `vandaag-rustdag` | geen trainingsdag (zonder herstelpercentages in v1) |
| `vandaag-terug` | meer dan tien dagen niet getraind |
| `sessie` | lopende sessie, geen actieve invoer |
| `sessie-invoer` | een setrij staat open |
| `sessie-rust` | rust loopt |
| `sessie-eerste` | geen historie op deze oefening |
| `sessie-set-extra` | extra set toegevoegd |
| `sessie-aangepast` / `sessie-vervangen` / `sessie-ingekort` | na een keuze in een sheet |
| `aanpassen`, `afronden`, `afronden-compleet` | sheets |
| `klaar`, `klaar-gedeeltelijk`, `klaar-deload` | resultaat |
| `sessie-corrigeren` | een vastgelegde set opnieuw open |

Programma en Voortgang worden gebouwd met vaste gegevens uit `starterProgram` en de catalogus.
Ze zijn dus zichtbaar en kloppen, maar rekenen nog niets uit.

## 6 · Techniek per onderdeel

### 6.1 Stappers in plaats van invoervelden

De actieve rij toont `− waarde +` voor gewicht en herhalingen. Stap voor gewicht is
`exercise.step`, voor herhalingen één. Tikken op de waarde opent een `input` met
`inputmode="decimal"` voor de uitzondering.

Elke tik schrijft een concept weg, net als nu (`writeDraft`), zodat halve invoer een crash
overleeft. Vastleggen gebeurt met de bestaande `logSet`, die de set en de sessie in één
transactie opslaat.

Knoppen minimaal 40 bij 44 punten. Ingedrukt houden herhaalt niet — dat leidt tot ongelukken.

### 6.2 Rust

De bestaande aanpak blijft: opslaan als eindtijd, niet als aftellende teller. Dan klopt hij
na het sluiten van de app.

De **zichtbare ruststatus in de kop is de betrouwbare basis.** Trillen is een extraatje:
`navigator.vibrate` werkt niet in Safari op iOS, en een wake lock houdt het scherm aan maar
waarschuwt je niet als je ergens anders kijkt. Bouw dus niets dat afhangt van een signaal.

Overgangen die vastgelegd moeten zijn:

| Situatie | Gedrag |
| --- | --- |
| Set vastleggen | rust start, eindtijd = nu plus `restSeconds` |
| Laatste set van de laatste oefening | geen rust, direct naar afronden |
| Laatste set van een oefening | rust start wel, de knop wordt *Verder met …* |
| Rust overslaan | eindtijd op nu, telt als verstreken |
| Een set corrigeren | **geen** nieuwe rust, je bent al uitgerust |
| App heropenen na afloop van de rust | geen melding achteraf, alleen de gewone toestand |

### 6.3 Offline en de overgang van het oude model

De service worker blijft, maar niet ongewijzigd: zie 6.4 voor de video's.

**De migratiebeslissing valt vóór stap 2, niet in stap 7.** Nieuwe tabellen en nieuwe
oefening-id's ontwerpen terwijl nog open is wat er met bestaande gegevens gebeurt, levert
een model op dat daarna alsnog verandert.

Twee wegen, allebei expliciet:

| Keuze | Wat er gebeurt |
| --- | --- |
| **Schoon beginnen** | Dexie-versie omhoog, `upgrade` leegt de oude tabellen in één transactie. Eenmalig, zichtbaar, geen half-gemigreerde staat |
| **Overnemen** | oude sets krijgen een `kind` op basis van hun setnummer, `exerciseId` blijft gelijk, open sessies worden gesloten als *vergeten* |

Open sessies zijn het gevaarlijkste geval: een sessie van het oude model heeft geen
`SessionSlot` en kan dus niet worden voortgezet. Die moet de migratie afsluiten, niet de app
tijdens gebruik tegenkomen.

Let ook op dat een oude, nog geopende tab de vorige service worker kan blijven draaien.
`skipWaiting` staat uit; de app vraagt om vernieuwen. Dat blijft zo.

### 6.4 Video's

`videoUrl` per oefening kan drie vormen aan. Het ontwerp verandert daar niet door: het grijze
vlak blijft hetzelfde, tikken start het afspelen, geluid uit.

| Vorm | Wanneer | Offline |
| --- | --- | --- |
| `/video/chest-press.mp4` | je hebt het bestand: uit je aankoop of zelf gefilmd | ja, via de service worker |
| `https://www.youtube-nocookie.com/embed/...` | je hebt alleen de link uit de pdf | nee |
| leeg | nog niets | het vlak blijft leeg, geen foutmelding |

Lokale bestanden komen in `public/video/`, maar die worden **niet vanzelf** gecachet:

- `globPatterns` bevat standaard geen `mp4`. Toevoegen.
- De standaardlimiet per bestand is 2 MiB. `maximumFileSizeToCacheInBytes` omhoog, of de
  video's onder die grens houden — twintig seconden op 720p haalt dat ruim.
- Video wordt met bereikaanvragen opgehaald bij doorspoelen. Zonder afhandeling daarvan
  speelt een gecachet bestand offline alsnog niet af. Workbox heeft daar een aparte
  aanpak voor.

Alleen cachen tijdens afspelen is niet genoeg: dan werkt het pas de tweede keer, en offline
nooit.

**Test die dit moet afvangen:** telefoon in vliegtuigstand, app openen, video starten en
doorspoelen. Niet alleen "hij laadt".

Voor de YouTube-vorm gebruiken we `youtube-nocookie.com` in een `iframe`, met `playsinline`
zodat iOS hem niet schermvullend opent.

**Wat we niet doen:** YouTube-video's downloaden en zelf hosten. Dat is in strijd met de
voorwaarden van YouTube, ongeacht of je het programma hebt gekocht, en op een openbaar adres
is het ook geen eigen gebruik meer. Heb je bij je aankoop echte videobestanden gekregen, dan
zijn dat jouw bestanden en kun je ze gewoon in `public/video/` zetten.

### 6.5 De app afschermen

De app staat op een openbaar adres. Zolang er alleen wireframes op staan is dat niets, maar
zodra er video's en je trainingsgegevens in zitten hoort er een slot op.

`middleware.ts` doet dat met HTTP-basisauthenticatie op Vercel. `scripts/check-middleware.mts`
test de randgevallen; draai dat voor elke wijziging.

- **Productie zonder `APP_PASSWORD` blijft dicht.** Een vergeten instelling zet de app niet
  stilzwijgend open. Lokaal en in previews valt het slot weg.
- **`/proto/` blijft open.** Geen persoonlijke gegevens, geen video's, en zo kun je het
  ontwerp blijven delen.
- De uitzonderingen staan als exacte patronen in de code, niet in de matcher. Een matcher met
  `(?!proto)` laat ook `/prototype-iets` door.
- Het gebruikersnaamveld wordt genegeerd: vul in wat je wil, alleen het wachtwoord telt.

**Wat dit wel en niet beschermt.** Het slot beschermt de bestanden die Vercel uitlevert: de
app, de video's. Het beschermt **niet** wat al op een toestel staat. Je trainingsgegevens
zitten in IndexedDB op jouw telefoon; iemand anders die de URL opent krijgt zijn eigen lege
opslag, niet die van jou. En een geïnstalleerde app kan via de service worker antwoorden
zonder Vercel te bereiken.

**Twee dingen om te testen vóór de praktijktest, niet erna:**

1. Het PWA-manifest wordt standaard zonder inloggegevens opgehaald en krijgt dan een 401.
   Zet `useCredentials: true` in de PWA-instelling van `vite.config.ts`.
2. Of Safari het wachtwoord onthoudt in de **geïnstalleerde** app, niet alleen in de browser.
   Dat is niet hetzelfde.

Dit is een slot, geen kluis. Genoeg om toevallige bezoekers en zoekmachines buiten te houden.

## 7 · Bouwvolgorde

Elke stap eindigt met iets dat werkt. Niet doorgaan voor het klaar is.

1. **Opschonen en de migratie beslissen.** M1-code en de drie voorstelroutes eruit. De
   Dexie-overgang uit 6.3 vastleggen en uitvoeren.
   *Klaar als:* de app start op een model waarvan je weet wat erin zit.
2. **Model en beslismatrix.** De catalogus, `SessionSlot`, `Proposal`, `SessionOutcome`,
   en de regels uit sectie 4 als functies met tests — nog zonder scherm.
   *Klaar als:* elke regel uit 4.1 tot 4.6 een test heeft die faalt als je de regel omdraait.
3. **De kleinste volledige lus.** Eerste gebruik zonder historie → invoer met stappers →
   rust → hervatten en corrigeren → afronden → resultaat met voorstel.
   *Klaar als:* je een hele sessie kunt doen, de app kunt sluiten, heropenen, en het
   voorstel op Vandaag ziet staan.
4. **Aanpassingen en randen.** Aanpassen-sheet, inkorten, extra set, oefening toevoegen en
   vervangen, plateau, pauzesessie, vergeten sessie.
   *Klaar als:* elke keuze een opgeslagen gevolg heeft dat een herstart overleeft.
5. **Programma en Voortgang.** Vaste gegevens, kalender, oefeningscherm met video.
   *Klaar als:* alle links werken en niets doodloopt.

**Stap 3 is het moment om in de sportschool te gaan staan** — niet stap 2, want dan kun je
niets afronden, en niet stap 5, want dan heb je weken gewacht. Eerste gebruik zit in stap 3
en niet bij de randgevallen: als je schoon begint, is dat je allereerste scherm.

De combinatie van basisauthenticatie en de geïnstalleerde PWA testen we aan het eind van
stap 1, niet vlak voor de eerste training.

## 8 · Tests

De huidige tests dekken opslag en aanpassingen. Uitkomsten testen is niet genoeg — de fouten
die je pas na weken merkt zitten in de **overgangen**: een teller die twee keer optelt, een
voorstel dat terugkomt, een datum die over middernacht verschuift.

| Groep | Gevallen |
| --- | --- |
| **Progressie** | exact op `repsMin` en `repsMax`; gemengde uitkomsten binnen één oefening; lege, gedeeltelijke en ingekorte oefening; warming-up uitgesloten; verschillende gewichten binnen één oefening; grens `minWeight` |
| **Plateau** | van 2 naar 3; reset na elke uitkomst; sheet sluiten zonder keuze; heropenen zonder dubbele verwerking |
| **Pauze** | exact tien dagen en daarboven; geen historie; gedeeltelijk afgeronde pauzesessie; terug naar `preBreakWeight` versus gewone progressie; nooit twee verlagingen |
| **Correctie** | omhoog wordt vasthouden of omlaag; tellers herstellen; extra set blijft uitgesloten; een al toegepast voorstel |
| **Aanpassingen** | volgorde na *Later doen* overleeft heropenen; vervangen vóór en na een gelogde set; vervanger houdt eigen historie; het schema blijft ongewijzigd |
| **Opslag** | twee keer afronden; onderbreking midden in afronden; concept schrijven tijdens vastleggen; weggooien laat niets meetellends achter |
| **Datums** | sessie over middernacht; oude sessie vandaag afronden; rustgrens; vervroegd trainen en de volgende datum |
| **Middleware** | `scripts/check-middleware.mts`, draait al |
| **Op het toestel** | manifest achter het slot; verse installatie; offline herstart; app-update met een open sessie; video offline én doorspoelen |

**Afronden moet atomair en herhaalbaar zijn.** Sets, voorstel, `ExerciseState` en
`SessionOutcome` gaan in één transactie. Twee keer afronden mag geen tellers verdubbelen, en
een concept dat later binnenkomt mag een vastgelegde set niet terugdraaien.

Een Playwright-test op mobiel formaat is geen vervanging voor een test op je eigen iPhone in
de geïnstalleerde app. Dat laatste doe je met de hand, één keer per stap.

## 9 · Wat ik bewust niet in dit plan zet

Herstelpercentages op de rustdag, herinneringen, export, dagen aanpassen, een tweede
trainingsvariant, structureel een oefening vervangen, en fout- en laadtoestanden.
Alles daarvan is ontworpen of benoemd, maar niets ervan heb je nodig om te trainen.

## 10 · Wat jij nog moet beslissen

1. **Overnemen of schoon beginnen.** Eerst, vóór stap 2. Schoon is eenvoudiger en je historie
   is kort.
2. **De teksten per oefening.** Wat train je, waarom staat hij er, twee of drie
   uitvoeringspunten. Ik kan een voorzet maken uit de pdf; jij weet wat klopt bij jouw apparaten.
3. **`step` en `minWeight` per apparaat.** Standaard 2,5 kg. Welke van je zeven wijken af, en
   wat is het laagste dat elk apparaat kan?
4. **Welke video's je hebt.** Echte bestanden uit je aankoop, of alleen YouTube-links.
5. **De regels in sectie 4.** Die zijn nu ingevuld met mijn keuzes. Loop vooral 4.1, 4.3 en
   4.5 na: dat zijn de plekken waar jouw manier van trainen bepaalt wat klopt.

## 11 · Wat ik na de beoordeling heb aangepast

De technische beoordeling van 19 september wees elf punten aan. Wat daarvan is verwerkt:

| Punt | Verwerkt |
| --- | --- |
| Herberekening niet reproduceerbaar | `SessionOutcome` erbij; `proposals` per sessie in plaats van per oefening |
| Contract oefening en sessie incompleet | `SessionSlot` met eigen plan, `kind` op de set, `restSeconds` en `minWeight` in de catalogus |
| Progressieregel meerduidig | sectie 4 herschreven als beslismatrix, negen open gevallen ingevuld |
| `stalls` tegenstrijdig | één definitie, per uitkomst vastgelegd; `increases` telt gebruik, niet voornemens |
| Pauzeregel botst met progressie | pauze geldt per training, heeft voorrang, en is verbruikt bij afronden |
| Kalenderregels niet sluitend | kalenderdag plus zes uur voor een vergeten sessie; sessiedag telt voor planning |
| Transactie beschermt nieuwe afhandeling niet | afronden atomair en herhaalbaar, in sectie 8 |
| Migratie te laat | naar stap 1, met beide wegen uitgeschreven |
| Stap 3 te vroeg bruikbaar | bouwvolgorde van zeven naar vijf stappen, afronden zit nu in stap 3 |
| Offline video niet geregeld | globPatterns, bestandsgrootte en bereikaanvragen benoemd |
| Bescherming overschat | wat het slot wel en niet dekt; manifest en productie zonder wachtwoord |
| Fouten in de middleware | alle vijf gerepareerd, met een testscript |

Twee dingen uit de beoordeling zijn bewust **niet** overgenomen: een historische editor voor
oude sessies blijft buiten v1, en het datummodel gebruikt lokale kalenderdatums in plaats van
tijdstempels met tijdzone — dat laatste is eenvoudiger en past bij een app die op één toestel
in één land draait.
