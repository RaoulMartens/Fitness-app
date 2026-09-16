# M2 - persoonlijke sessie, ter beoordeling

16 september 2026. Raoul heeft de M1-telefoontest bevestigd en wil verder. Dit voorstel maakt
de nog open programmakeuze en wijzigingen aan de wireflows concreet. Het is geen vastgesteld
trainingsprogramma. Het klikmodel staat in `public/m2-voorstel/` en is bereikbaar via
https://raoulmartens.github.io/Fitness-app/m2-voorstel/.

## De keuze in gewone taal

Voorstel: woensdag een herkenbare full-bodytraining, met extra aandacht voor het bovenlichaam.
Het weekend wordt alleen een tweede training als Raoul die zelf kiest. Richtduur circa 60 minuten,
met ruimte tot de beschikbare 90 minuten om apparaten te leren kennen. De werkelijk benodigde
tijdsduur is nog niet gemeten. Geen inhaalschuld als het optionele weekend niet wordt ingepland.

Het voorstel uit bouwvoorstel.md wordt inhoudelijk behouden:

| Volgorde | Oefening | Werksets | Herhalingen | Rust |
| --- | --- | --- | --- | --- |
| 1 | Leg press | 2 | 8-12 | 2 minuten |
| 2 | Leg curl | 2 | 10-15 | 2 minuten |
| 3 | Chest press | 2 | 8-12 | 2 minuten |
| 4 | Zittende row | 2 | 8-12 | 2 minuten |
| 5 | Lat pulldown | 2 | 8-12 | 2 minuten |
| 6 | Biceps curl | 2 | 10-15 | 90 seconden |
| 7 | Triceps pushdown | 2 | 10-15 | 90 seconden |

Voor beide dagen dezelfde basis. Vooraf 5-10 minuten rustig opwarmen en lichte proefsets bij
onbekende oefeningen/apparaten. Het werkgewicht blijft leeg tot het ter plaatse is gekozen;
geen percentage van een onbekend gewicht. Richtinspanning uit het bestaande voorstel: ongeveer
2-3 herhalingen overhouden met goede techniek, met uitleg dat dit een onzekere inschatting is.
De exacte warming-up per oefening, apparaatconfiguraties en gewichtsstappen moeten nog worden ingevuld.

Dit is een startbasis. Gerichte schouder-, romp- en heupdominante oefeningen ontbreken nog;
het voorstel is dus niet het complete eindprogramma voor het atletische doel. De algemene
onderbouwing blijft [ACSM 2026](https://acsm.org/resistance-training-guidelines-update-2026/),
opnieuw geraadpleegd op 16 september. ACSM onderbouwt individualisering en regelmatige training
van de grote spiergroepen; deze precieze selectie, dosering en rust zijn ons voorstel. Een vaste
en een optionele dag geven niet gegarandeerd de trainingsfrequentie van twee vaste dagen.

## Wat Raoul nu kan beoordelen

1. Past deze woensdagtraining als eerste routine, met het weekend echt optioneel?
2. Is de begeleiding per stap duidelijk genoeg: eerst apparaat leren kennen, dan set, dan rust?
3. Is open en zichtbaar rusten acceptabel, met optioneel scherm aanhouden waar dat werkt?

Het beslismoment betreft het hele voorstel, inclusief de teksten in het klikmodel. Geen
herhaalde intake nodig: doel, ervaring, locatie, tijd en ontbreken van blessures zijn al bekend.
Het app-ontwerp kan na beoordeling worden gebouwd. Gebruiksklaar voor een echte training is het
pas wanneer apparaten, passende instructies en rechtmatig beschikbare demonstratiemedia kloppen.

## Schermen en wijzigingen ten opzichte van de PPL-wireflows

| Scherm in het klikmodel | Bestaande referentie | Voorgestelde wijziging / voorkeursactie | Use case |
| --- | --- | --- | --- |
| Vandaag | today.html | Woensdag full-body; hervatten vervangt de startactie als er al een sessie loopt. Weekend pas na eigen keuze. | UC-001, UC-006 |
| Je full-body training | session-overview.html | Zeven oefeningen en 14 werksets uit hetzelfde voorstel. Start training. | UC-001 |
| Warm worden | warmup.html | Geen verzonnen 17,5 kg; kennismaken met apparaat en lichte proefset. Naar oefening 1. | UC-001 |
| Oefening | exercise.html | Repbereik en circa 2-3 reps over in plaats van falen; lege eerste gewichten, geen nepvorige prestatie. Set vastleggen. | UC-002 |
| Rust | rest.html | Inline substate bij dezelfde oefening; opgeslagen eindtijd, blijvend zichtbaar eindsignaal, extra rust, verder op eigen initiatief. | UC-002 |
| Oefenuitleg | exercise-video.html | Overlay boven de invoer. Ontbrekende demo expliciet benoemd. | UC-002 |
| Verder trainen | resume.html | Overlay boven Vandaag. Dezelfde sessie, sets, draft en timer hervatten. | UC-006 |
| Pauzeren of stoppen | interrupt.html | Doorlopen, echt pauzeren en expliciet beeindigen afzonderlijk. Bevestigen voordat de sessie eindigt. | UC-006 |
| Klaar / afgebroken | summary.html | Werkelijke voorbeeldsets; ongedane sets leeg. Geen verzonnen duur of prestatieverbetering. | UC-007 |
| Volgende keer | consequences.html | Geen verhoging bij ontbrekende apparaat- of inspanningsinformatie. Restsets niet doorschuiven. | UC-007 |
| Je plan | plan.html | Woensdag vast, weekend optioneel. Geen tien-dagencyclus of vaste deloadweek. | UC-008 |
| Je startvoorstel | plan-voorstel.html | Dezelfde oefeningen, rust en beschikbare tijd als de sessie. | UC-010 |
| Als 60 minuten niet past | plan-compromis.html | Frequentie, tijd of prioriteit kiezen; geen beloofde 45-minutenvariant of claim over tragere armgroei. | UC-010 |

Dit is een gerichte uitbreiding van de bestaande visuele wereld: grijs, gestippelde randen,
systeemtypografie en duidelijke knoppen, Operate-modus. De eerste viewport toont Vandaag en de
enige relevante trainingsactie. De belangrijkste interactie is een set vastleggen waarna rust
op dezelfde oefening verschijnt; een sheet bewaart de context. Geen nieuwe branding of animaties.

De originele HTML-bestanden en diagrammen blijven als baseline staan. Na akkoord worden INDEX,
UX-FLOWS en UC-001, UC-002, UC-006, UC-007 en de planvoorbeelden UC-008/010 definitief afgestemd.
Onboarding wordt pas in M4 geimplementeerd; het plan/compromis is hier een samenhangend ontwerpvoorbeeld.

## Precies gedrag voor de sessie

- Start maakt eenmaal een sessie met een onveranderlijke snapshot van de voorschriften.
- Sheet sluiten raakt de sessie, conceptinvoer en timer niet. Sheets zijn geen aparte routes.
- Naar Vandaag gaat alleen naar een ander scherm. Een actieve rusttimer loopt door.
- Sessie pauzeren bewaart de plek en resterende rust. Hervatten start die resterende tijd weer.
- Terugkeer na appvergrendeling berekent rust uit de eindtijd; de browser hoeft niet te blijven tikken.
- Na de laatste set zijn de sets klaar, maar de sessie eindigt pas via Sessie afronden.
- Ook bij een onvolledige sessie zijn afronden en afbreken expliciete eindacties. De sets blijven
  bij beide bewaard als prestaties; de sessiestatus en mate van voltooiing zijn afzonderlijk.
- Onbevestigde invoer telt nooit als een prestatie. Voor beeindigen verschijnt een waarschuwing
  als er nog een draft openstaat, met een uitweg om terug te keren.
- Afronden/afbreken maakt geen inhaalafspraak, vervangende oefening of blijvende niveauverlaging.
- De precieze frequentie van inspanningsvragen blijft een open ontwerpkeuze. Tot die informatie
  betrouwbaar beschikbaar is, doet de app geen automatische progressie. Het klikmodel laat dat zien.

Verplaatsen, overslaan, bezette apparaten, alternatieven en minder tijd tijdens de sessie horen
bij M3. Ze worden niet stilzwijgend als nulsets of als een tweede sessie uitgevoerd. Push-ups
blijven een afzonderlijk M5/R8-besluit; dit voorstel keurt geen uitstel of nieuwe push-upregel goed.

## Rust en iPhone

De rust blijft op het oefenscherm, met de vorige sets zichtbaar. Bij nul blijft 'Rust voorbij'
staan totdat Raoul doorgaat. '30 seconden extra rust' verlengt de nog resterende rust of begint
opnieuw vanaf nu wanneer die al voorbij is. Vroeger verdergaan is een expliciete keuze.

De tekst uit bouwvoorstel.md staat erbij: 'Houd de app open tijdens je rust. Met een vergrendeld
scherm is een rustsignaal niet gegarandeerd.' Geen Live Activity of gegarandeerd achtergrondalarm.
Scherm aanhouden is optioneel en meldt alleen succes als het systeem het verzoek heeft ingewilligd.
Weigering, intrekking en ontbreken van ondersteuning krijgen een zichtbare fallback. Bij
navigeren, pauzeren en beeindigen wordt het verzoek vrijgegeven. Terugkeer kan opnieuw aanvragen
zolang Raoul de optie heeft aangezet. Zie [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API).

## Wat het klikmodel wel en niet bewijst

Alle schermen zijn doorklikbaar; setinvoer, timer, extra rust, pauzeren, hervatten en afsluiten
reageren echt. Het model gebruikt een eigen `sessionStorage`-sleutel en raakt de M1-database niet.
Herladen in hetzelfde tabblad herstelt het voorbeeld. Het is geen trainingslog, offline-app of
datamigratie. De banner maakt dit onderscheid permanent zichtbaar. Er is geen toestemming voor
het programma af te leiden uit het klikken op Start training in dit voorstel.

Na inhoudelijk akkoord volgt de echte M2-implementatie: meervoudige oefeningen en setvoorschriften,
duurzame sessiestatus en timer in IndexedDB, behoud van alle M1-historie, atomiciteit en herstel.
De acceptatie omvat volledige en gedeeltelijke afronding, pauzeren versus navigeren, dubbel
vastleggen, appherstart tijdens rust, sheets en iPhonegedrag bij vergrendelen/geweigerde wake lock.

M1 is op de telefoon door Raoul bevestigd. Dat bewijst nog geen werking van deze nieuwe timer
op zijn iPhone; die krijgt zijn eigen praktijktest zodra M2 is gebouwd.
