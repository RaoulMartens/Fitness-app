# Bouwbrief — persoonlijke trainingsapp

Voor wie dit bouwt. Dit document is de bron van waarheid: verandert er iets tijdens het bouwen, dan
gaat die verandering eerst hierin en pas daarna in de code.

Bij deze brief horen: de wireflow in `ux-flows/` (33 klikbare schermen), `ux-flows/UX-FLOWS.md`
(ontwerpbeslissingen), `ux-flows/use-cases.md` (elf use cases) en `ux-flows/wireframes/INDEX.md`
(elk scherm met zijn voorkeursactie en tekstregels). De wireframes zijn de intentie, geen
stijlvoorbeeld: ze zijn grijs en gestippeld omdat de visuele fase nog moet komen.

**Status 15 september 2026:** Raoul heeft opdracht gegeven te beginnen met bouwen en daarna
expliciet verduidelijkt: low fidelity, werkend en makkelijk aanpasbaar. Techniek en M1 zijn
daarmee akkoord. Het persoonlijke schema en uitstel van push-ups zijn niet afzonderlijk vastgesteld.
[bouwvoorstel.md](bouwvoorstel.md) bevat het concrete voorstel,
de beslisregels, het aangepaste datamodel en de voorgestelde bouwvolgorde. Na verwerking van
Claudes review zijn techniek/M1, trainingsprogramma en fasering van push-ups aparte besluiten.
Het bouwakkoord komt uit Raouls bericht, niet uit de review. Broncorrecties hieronder
zijn verwerkt; de oorspronkelijke PPL-inhoud is geen automatisch voorschrift voor Raoul.

**Vervolg 17 september 2026:** na publicatie van de gecorrigeerde M2-flow bevestigt Raoul:
"het werkt op telefoon dus we kunnen door". Dit is bouwakkoord voor de aangekondigde volledige
sessieflow met blijvende opslag, op basis van het getoonde startschema en de geteste schermrollen.
Er worden geen extra trainingsregels vastgesteld. Gecontroleerde apparaatinstructies en video's
blijven nodig voordat de begeleiding gebruiksklaar is voor een echte training.

M2 bewaart sessies, voorschriftsnapshots, concepten, sets, rust en een lokale uitgaande wachtrij
in een eigen IndexedDB-database `training-m2`. `training-m1` blijft ongewijzigd en bereikbaar via
de M1-testweergave. Er is geen destructieve migratie of automatische import van klikmodeldata.
Terugrollen naar M1 laat beide databases staan; een volgende M2-versie kan M2-gegevens heropenen.

---

## 1. Wat dit is

Een persoonlijke trainingsapp voor één gebruiker, die hem minder programmeer- en administratiewerk
geeft. De app vertaalt doel, mogelijkheden en zelfgekozen trainingsdagen naar een uitvoerbaar plan,
begeleidt de training, registreert wat er gebeurde en past het plan aan.

Installeerbare PWA, mobile-first, ontworpen op 375px. Buiten de appstores.

**Non-goals.** Geen appstore-publicatie, geen native app, geen sociaal netwerk of ranglijsten, geen
abonnementslaag, geen voedings- of caloriemodule, geen verplichte wearables, geen externe
kalenderkoppelingen, geen medische diagnose of revalidatie, en geen samengestelde fitnessscore.

---

### 1.1 Persoonlijke uitgangspunten uit de intake

Door Raoul aangegeven op 15 september 2026:

- **Doel:** een atletisch, functioneel en gebalanceerd lichaam, met extra aandacht voor armen
  en het bovenlichaam. Meer definitie is een wens; een precieze prioriteit tussen kracht en
  spiermassa is nog niet gekozen.
- **Ervaring:** minimale ervaring met krachttraining; momenteel nog geen vaste sportschoolroutine.
- **Beschikbaarheid:** woensdagavond als vaste trainingsmogelijkheid, eventueel een tweede
  training in het weekend. Er is ongeveer anderhalf uur per training beschikbaar; Raoul staat
  open voor een voorstel voor de daadwerkelijke duur.
- **Locatie en materiaal:** Il Fiore Panningen, 24/7 geopend en ongeveer twee minuten fietsen.
  Thuis is geen trainingsmateriaal. De exacte beschikbare apparaten moeten nog worden bevestigd.
- **Andere beweging:** af en toe hardlopen, de laatste tijd minder vanwege blaren bij afstanden
  boven ongeveer 10 km. Een hardloopschema is hiermee nog niet afgesproken.
- **Blessures:** Raoul meldt geen blessures. Dit is zelfrapportage uit de intake.
- **Gebruikscontext:** de sportschoolomgeving vormt een drempel. Duidelijke begeleiding moet
  helpen om te weten wat hij doet en met meer zekerheid te trainen.

### 1.2 Gevolgen voor de begeleiding

De app moet voor de eerste trainingen ondersteuning bieden bij het herkennen en instellen van
apparatuur, het begrijpen van de oefening en het kiezen van een begingewicht. Tijdens de training
staan de eerstvolgende handeling, een korte demonstratie en enkele uitvoeringsaanwijzingen centraal.
Bij bezet materiaal is een duidelijke uitweg nodig. Het product moet ook een week met alleen de
vaste woensdagtraining kunnen afhandelen, zonder automatische inhaalschuld.

Het gewenste gebruiksgevoel is dat van een vloeiende iOS-app: directe feedback, soepele sheets en
schermovergangen, en behoud van context en invoer. Dit moet op een echte iPhone worden getoetst.

### 1.3 Planningsrichting ter bespreking

Het voorstel na de intake is een training voor het hele lichaam op woensdag, met extra aandacht
voor het bovenlichaam, en een mogelijke tweede training in het weekend. Een eerste inschatting
is ongeveer 60 minuten, met ruimte binnen de beschikbare 90 minuten om uitleg te bekijken en
apparatuur te leren gebruiken. Duur en indeling zijn voorstellen, nog geen vastgestelde regels.

De actuele ACSM-richtlijn adviseert alle grote spiergroepen minstens tweemaal per week te trainen
en geleidelijk op te bouwen. De keuze voor een uitvoerbare start met woensdag als vaste basis en
een optionele weekendsessie is een voorstel voor Raouls situatie, geen gelijkstelling van een
en twee trainingen per week.
Bron: https://acsm.org/resistance-training-guidelines-update-2026/

De club vermeldt cardioapparatuur, vrije gewichten en Hammer Strength- en Panatta-apparatuur.
Dit bevestigt nog niet welke afzonderlijke oefeningen en alternatieven er mogelijk zijn.
Bron: https://ifhc.nl/locations/panningen/ (geraadpleegd 15 september 2026).

**Uitgewerkt ter goedkeuring:** trainingsverdeling, voorschriften, aanpassingsregels en datamodel
staan in [bouwvoorstel.md](bouwvoorstel.md). De oorspronkelijke structuur en PPL-regels hieronder
blijven herkenbaar als referentie. Alleen de afzonderlijk goedgekeurde onderdelen van het
persoonlijke voorstel worden bouwcontract;
tot die tijd is dit geen opdracht om het oorspronkelijke PPL-schema te implementeren.

---

## 2. Techniek

De keuze is aan jou, binnen deze randvoorwaarden:

- Installeerbare PWA, werkt op iOS Safari en Android Chrome.
- **Local-first.** Trainen en registreren werkt volledig zonder verbinding. Synchronisatie is een
  achtergrondproces, geen voorwaarde.
- Data blijft bewaard als de gebruiker de app sluit, offline is of opnieuw moet inloggen.
- Video's en oefenuitleg staan lokaal opgeslagen en spelen offline af.
- Eén gebruiker per installatie; accounts alleen om gegevens te bewaren en te synchroniseren.

**Doe eerst een voorstel voordat je bouwt:** welke stack, waarom, en wat het betekent voor offline
opslag, synchronisatie en accounts. Wacht op akkoord.

---

## 3. Datamodel

Dit is het oorspronkelijke model, bewaard als referentie. Het kan voorschriften per sessie en
per set onvoldoende vastleggen en mist onder andere de doelvervanging bij een aanpassing.
Bouw dit niet ongewijzigd. De voorgestelde vervanging staat in bouwvoorstel.md, hoofdstuk 4.

### profiel
`id`, `doel` (spiermassa | kracht | beide), `prioriteit` (welke van de twee eerst), `ervaring`
(net_begonnen | onder_1_jaar | 1_tot_3_jaar | boven_3_jaar), `trainingsdagen[]` (weekdagen),
`minuten_per_dag`, `locatie` (sportschool_machines | sportschool_vrij | thuis_halters),
`beperkingen` (vrije tekst, mag leeg), `aangemaakt_op`

### programma
`id`, `naam`, `cyclus_dagen` (10 voor PPL), `blokken[]` → `{ naam, weken, deload_week }`

### oefening (catalogus, komt uit het programma)
`id`, `naam`, `spiergroep`, `progressietype` (rep_bereik | vaste_reps), `reps_min`, `reps_max`,
`werksets`, `warmup_sets`, `rust_sec_min`, `rust_sec_max`, `rpe_early`, `rpe_last`,
`intensiteitstechniek`, `cues[]`, `video_id`, `substituties[]` (precies twee, gelijkwaardig)

### plan
`id`, `profiel_id`, `programma_id`, `versie`, `geldig_vanaf`, `reden`, `vorige_versie_id`

Een plan wordt nooit overschreven. Elke herplanning maakt een nieuwe versie met een reden en een
verwijzing naar de vorige, zodat terugdraaien altijd kan.

### geplande_sessie
`id`, `plan_id`, `datum`, `type` (push | pull | legs | arms), `status` (gepland | actief |
afgerond | afgebroken | uitgesteld | overgeslagen), `oefeningen[]` (volgorde van oefening_ids)

### sessie (de uitvoering)
`id`, `geplande_sessie_id`, `gestart_op`, `geeindigd_op`, `status`, `aanpassing_vandaag`
→ `{ reden, nieuwe_duur_minuten, vervallen[], verschoven[] }`

### set
`id`, `sessie_id`, `oefening_id`, `setnummer`, `gewicht`, `reps`, `is_warmup`, `target_rpe`,
`actual_rpe` (mag leeg), `vastgelegd_op`, `bron` (handmatig | overgenomen | voorgevuld)

### aanpassing
`id`, `type` (vervanging | lichter | minder_tijd | overslaan), `aanleiding` (dagvorm | techniek |
capaciteit | materiaal_bezet | materiaal_afwezig | pijn | tijd), `reikwijdte` (vandaag | periode |
blijvend), `duur_tot`, `oefening_id`, `aangemaakt_op`

### feedback
`id`, `sessie_id`, `vraag`, `antwoord`, `gevolg_geaccepteerd` (ja | gecorrigeerd | afgewezen)

### pushup_max en pushup_dag
`pushup_max`: `id`, `datum`, `reps`
`pushup_dag`: `datum`, `doel_totaal`, `doel_per_set`, `sets[]` (tijd + aantal), `status`
(open | gehaald | gemist | overgeslagen_door_app)

### sync_item
`entiteit`, `entiteit_id`, `status` (op_apparaat | bezig | gesynchroniseerd | probleem),
`idempotency_key`, `versie`

---

## 4. Trainingsregels

R1-R6 beschrijven bronprincipes van The Hypertrophy Handbook en het Pure Bodybuilding
PPL-programma, met de onderstaande beperkingen. R7 en R9 zijn productregels; R8 is een nog
onvoldoende onderbouwde productkeuze. Houd bronfeit en voorstel uit elkaar. Voor Raouls
beginnersschema staan afzonderlijke voorstellen in bouwvoorstel.md; neem PPL niet blind over.

**R1 — Dubbele progressie bij een repbereik.** Kies een gewicht dat zwaar is binnen het bereik.
Lukken alle sets op de bovenkant van het bereik, dan gaat het gewicht omhoog en zakken de reps terug
naar de onderkant. Anders: probeer per training één rep toe te voegen op minstens één set.

**R2 — Vaste reps.** Bij oefeningen zonder repbereik blijven de reps gelijk en gaat alleen het
gewicht omhoog wanneer dat kan zonder de uitvoering te verliezen.

**R3 — Warming-up.** Algemene warming-up van 5 tot 10 minuten, plus oefening-specifieke
warming-upsets zoals het programma per oefening voorschrijft: bij één set ongeveer 60 procent van
het werkgewicht, bij twee of drie sets een oplopende piramide. Warming-upsets zijn optioneel af te
vinken en tellen niet als werksets.

**R4 — Substituties in de PPL-bron.** Elke oefening heeft precies twee alternatieven uit het programma. Ze zijn
gelijkwaardig; presenteer ze niet als eerste en tweede keus. Geldige redenen: geen toegang tot het
materiaal, pijn, of de oefening echt niet voelen werken. De gebruiker geeft aan of het alleen
vandaag geldt of blijvend wordt. Bij pijn stopt de betreffende oefening; de app kan niet vaststellen
dat een alternatief veilig is. Voor het persoonlijke schema worden alternatieven afzonderlijk
gecontroleerd op beschikbaarheid en geschiktheid; het aantal twee is geen universele trainingsregel.

**R5 — Inspanning.** Het programma schrijft RPE voor: vroege sets rond 9, de laatste set meestal 10.
Wat de gebruiker zelf invult is iets anders en wordt apart opgeslagen (`target_rpe` en `actual_rpe`).
Neem hoge RPE's en intensiveringstechnieken niet blind over voor een laag startniveau.

**R6 — Cyclus en blokken van de PPL-bron.** De basiscyclus bevat acht trainingen en twee rustdagen
in tien dagen; deze is niet gelijk aan een kalenderweek. De bron bevat twee blokken van vijf
genummerde programmaweken. Alleen programmaweek 5 is een semi-deload; week 10 is geen automatische
tweede deload. Een app moet programmapositie en kalenderdatum afzonderlijk vastleggen. Voor het
persoonlijke full-bodyvoorstel wordt deze cyclus niet overgenomen.

**R7 — Afwijkingen.** Uitstellen, bewust overslaan, afbreken en hervatten zijn vier verschillende
gebeurtenissen met elk een eigen gevolg. Er ontstaat nooit automatisch een inhaalschuld. Alleen het
antwoord "structureel te zwaar" verlaagt het ingeschatte niveau, en dan met een zichtbare duur en
een terugkeermoment. Dagvorm en techniek gelden alleen voor vandaag.

**R8 — Dagelijkse push-ups, nog niet bouwrijp.** De volgende regel stond in de oorspronkelijke
brief, maar is niet als bronregel bevestigd en past nog niet bij full-body. Het voorstel om deze
functie later uit te werken is nog niet aangenomen; push-ups blijven daarom in de scope van M5.
Bij full-body moet ook de gezamenlijke belasting met het duwen in de sportschool worden afgewogen.
De oorspronkelijke intentie: het dagdoel komt uit een testset tot bijna falen: drie sets van
ongeveer 40 procent van de max, verspreid over de dag. Op een dag met een push-training slaat de app
de push-ups over; dat telt niet als gemiste dag. De dag erna is het doel gehalveerd. Elke drie weken
volgt een nieuwe testset; een hogere max verhoogt het dagdoel. Afronding, een lagere hertest en
de herstelregel bij full-body moeten eerst worden vastgesteld. Dagtotalen zijn altijd de som
van de setdoelen: drie sets van 13 zijn 39, niet 40. De bestaande schermvoorbeelden zijn niet normatief.

**R9 — Geen samengestelde score.** Consistentie, oefenprestatie, ontwikkeling van het plan en
herstel blijven vier aparte dingen. Tel ze nooit op tot één getal, en leid uit gewicht en reps geen
uitspraak over spiergroei of vetverlies af.

---

## 5. Opslag, offline en synchronisatie

- **Lokaal eerst.** Elke invoer wordt direct lokaal opgeslagen, voordat er iets naar een server gaat.
- **Vier statussen**, en de gebruiker ziet ze klein: op apparaat opgeslagen, bezig, gesynchroniseerd,
  probleem. Alleen de vierde onderbreekt hem.
- **Idempotent.** Elke schrijfactie draagt een sleutel, zodat opnieuw proberen geen dubbele logs
  oplevert.
- **Conflicten zijn zichtbaar en herstelbaar.** Twee versies van dezelfde sessie: de gebruiker kiest,
  de andere blijft bewaard.
- **Een verlopen login wist nooit lokaal werk.** Opnieuw inloggen is alleen nodig om te
  synchroniseren, niet om te trainen of te registreren.
- **Een actieve sessie is beschermd.** Nieuwe planinformatie mag een lopende of onderbroken sessie
  niet overschrijven, en eigen aanpassingen van de gebruiker evenmin.
- **Browseropslag kan gewist worden.** Controleer bij het openen of plan en video's er nog zijn en
  bied ontbrekende bestanden opnieuw aan.
- **Export en verwijderen** van alle gegevens moet mogelijk zijn.

---

## 6. Schermen

**Huidige bouwfase:** behoud de low-fidelity wireframe-stijl: grijstinten, eenvoudige randen,
bestaande hiërarchie en echte bediening. Geen nieuwe visuele identiteit, decoratieve animaties
of high-fidelity polish. Interactie, opslag en foutafhandeling moeten wel echt werken. M1 gebruikt
een als test gemarkeerd oefenscherm; ontbrekende latere functies worden niet als werkend voorgesteld.

`ux-flows/wireframes/INDEX.md` beschrijft alle 33 schermen met hun soort, voorkeursactie en
belangrijkste elementen. Drie dingen daaruit zijn geen detail:

**Niet elk bestand is een scherm.** Negentien zijn primaire schermen, negen zijn sheets die over een
scherm heen liggen (de context eronder blijft bestaan), vijf zijn systeemstates die geen bestemming
zijn. Bouw sheets niet als losse routes.

**Navigatie tijdens een actieve sessie kent drie verschillende handelingen:** een sheet sluiten
(raakt niets), de sessie laten lopen en terug naar Vandaag gaan, en de sessie beëindigen. Een gewone
terugknop mag nooit de trainingsstatus veranderen.

**De teksten zijn ontworpen.** Elke zin staat er om een reden en de app praat als een trainer die
naast je staat. Verbeter ze niet, vul ze niet aan en maak ze niet vriendelijker. Mis je een tekst
voor een situatie die nog niet bestaat, vraag erom.

De ontwerpnotities in de wireframes — cursief, met "notitie —" ervoor — beschrijven gewenst gedrag.
Ze zijn geen bewijs van platformondersteuning. Trilling is op iOS geen verplicht acceptatiecriterium
en native Live Activities vallen buiten deze PWA. Een achtergrondalarm is niet gegarandeerd.
De timer moet na terugkeer de juiste resterende tijd tonen en in de geopende app zichtbaar aflopen.
Onjuiste voorbeeldgetallen en PPL-specifieke teksten moeten na akkoord met het persoonlijke schema
worden aangepast; de bestaande teksten zijn daarvoor geen blokkade. Codex bereidt deze wijzigingen
als afzonderlijk ontwerpvoorstel voor; Raoul beoordeelt dit voor implementatie. Voor M2 moeten
de betrokken sessie-, plan- en onboardingflows samenhangend zijn herzien. Sheets, navigatiesemantiek
en vastgestelde teksten blijven verder behouden. Details en verantwoordelijkheden: bouwvoorstel.md,
hoofdstuk 6.1.

Het voorgestelde rustgedrag is de app open en zichtbaar houden, met optioneel scherm-aanhouden
waar ondersteund en een blijvend zichtbaar eindsignaal. Als het scherm niet kan worden aangehouden,
meldt de app dat; een signaal in de broekzak wordt niet beloofd. De uitleg en bediening
worden samen met de rustflow beoordeeld voor M2, zie bouwvoorstel.md, hoofdstuk 5.

---

## 7. Milestones

Dit is de oorspronkelijke fasering met gecorrigeerde criteria. Bouwvoorstel.md, hoofdstuk 6,
stelt de persoonlijke invulling voor, inclusief offline basis vanaf M1. Uitstel van push-ups
is een afzonderlijk open voorstel; tot een besluit blijven ze in M5. De stack en programmakeuze
wachten niet op hetzelfde besluit: techniek/M1 is akkoord, de programmakeuze blijft open.
Lever per stap iets dat werkt.

### M1 — Datamodel en registratie die echt bewaart
**Opgeleverd als low-fidelity testversie op 16 september 2026.** De implementatie staat in src/.
Opslag-, invoer- en offline browsercontroles staan in tests/ en src/db.test.ts. De technische
acceptatie is in Chromium gecontroleerd; WebKit is lokaal door Windows Application Control
geblokkeerd. Raoul bevestigde op 16 september 2026 na de gevraagde telefoontest: 'Ja het werkt
volledig, dus we kunnen door'. Dit is gebruikersbevestiging, geen geautomatiseerde WebKit-test.
Zie artifacts/m1/VERIFICATIE.md.

Het oefenscherm met twee velden en een duidelijk als test gemarkeerd voorschrift. M1 kan na
technisch akkoord onafhankelijk van de programmakeuze worden gebouwd. Testwaarden zoals 12 kg
zijn geen persoonlijke begingewichten; definitieve progressie volgt het vastgestelde programma.
*Klaar wanneer:* je een set vastlegt, de browser sluit, terugkomt en je invoer er nog staat; de
velden geldige gewichten van het gekozen apparaat toelaten (ook bijvoorbeeld 12 kg), herhalingen
als gehele aantallen registreren en het getoonde doel overeenkomt met het technische
testvoorschrift. Persoonlijke progressieregels zijn geen voorwaarde om deze opslagtest te halen.

### M2 — De sessieflow
**Gebouwd, 17 september 2026.** Na het vervolgakkoord (bovenaan) werkt de sessieflow in de
hoofdapp met IndexedDB. Vandaag en Plan hebben de beoordeelde rollen; veertien werksets,
rust, pauzeren/hervatten, expliciet deels of volledig afronden en afbreken zijn aangesloten.
Het voorstel hieronder beschrijft de eerdere beoordelingsfase. Instructies en demonstratiemedia
zijn nog niet gereed; de volledige nieuwe opslagflow vraagt een eigen controle op Raouls iPhone.

**In voorbereiding, 16 september 2026.** Het afzonderlijke [ontwerpvoorstel](m2-ontwerpvoorstel.md)
maakt het full-bodyvoorstel en de gewijzigde flow beoordeelbaar. Het klikmodel staat in
public/m2-voorstel/. Programma en schermwijzigingen zijn nog niet als vastgesteld gemarkeerd.
Raoul heeft vervolgens opdracht gegeven de navigatie te herstellen met ux-flow-designer:
Vandaag bevat de sessie-ingang, Plan de trainingsweek en planningskeuzes; beoordeling van het
planvoorstel staat buiten de dagelijkse appnavigatie. Dit akkoord geldt voor de flowcorrectie,
niet voor het trainingsprogramma. De uitwerking staat in [ux-flows/m2/UX-FLOWS.md](ux-flows/m2/UX-FLOWS.md).
Vandaag, warming-up, oefening, rust, afronden, gevolgen.
*Voorwaarde:* het persoonlijke programma en de betrokken wireflows zijn vastgesteld.
*Klaar wanneer:* je een hele sessie kunt doorlopen; de rusttimer zichtbaar afloopt en na terugkeer
klopt; de sessie blijft bestaan als je naar Vandaag gaat; pauzeren hervatbaar is; en alleen
expliciet afronden of afbreken een eindstatus geeft. Trilling is optioneel waar ondersteund.

### M3 — Afwijkingen
**Beoordelingsweergave, 17 september 2026:** Raoul vraagt expliciet de extra ontwerp- en
technische uitleg uit de schermen te halen om de flow te kunnen beoordelen. Dit autoriseert
compactere schermteksten en duidelijkere hierarchie in het M3-klikmodel. Prototype-uitleg en
testscenario's komen achter een infoknop. Essentiele gevolgen, reikwijdte en fouten blijven
zichtbaar op het relevante moment. Trainingsregels, opslag en de M2-hoofdapp veranderen niet.

**Ontwerpstap, 17 september 2026.** Raoul bevestigt dat de werkende M2-hoofdapp goed werkt op
zijn telefoon en vraagt door te gaan. M2's telefoontoets is daarmee door de gebruiker bevestigd;
dit is geen bewijs van alle offline- en achtergrondscenario's. De volgende stap werkt bestaande
UC-003 t/m UC-006 uit voor het full-bodyprogramma: zie `m3-ontwerpvoorstel.md` en `ux-flows/m3/`.
Het afzonderlijke klikmodel op `/m3-voorstel/` gebruikt alleen voorbeeldgegevens en eigen
tabbladopslag. Nieuwe teksten en keuzes worden beoordeeld voordat ze de hoofdapp veranderen.
Gecontroleerde vervangers en de dosering/duur bij structurele overbelasting blijven open;
het voorstel maakt die grenzen zichtbaar en doet geen automatische trainingsaanpassingen.

Lukt niet, te zwaar, minder tijd, pauzeren of stoppen.
*Klaar wanneer:* de vier gebeurtenissen uit R7 elk hun eigen gevolg hebben; een vervanging een
zichtbare reikwijdte krijgt; en een slechte dag het ingeschatte niveau niet verandert.

### M4 — Onboarding en planning
De vier vragen, het planvoorstel en het compromisscherm.
*Klaar wanneer:* een leeg profiel via vier vragen tot een plan leidt; een onmogelijke combinatie het
compromis benoemt in frequentie, duur of prioriteit; en de app die keuze niet zelf maakt.

### M5 — Plan, vooruitgang en push-ups
*Klaar wanneer:* herplannen een nieuwe planversie maakt met een reden en terugdraaien werkt; de vier
blokken op Vooruitgang gescheiden blijven. Push-ups kunnen pas worden gebouwd nadat de open
regels in R8 zijn vastgesteld; uitstel daarvan naar na de basisversie is onderdeel van het voorstel.

### M6 — PWA, offline en synchronisatie
*Klaar wanneer:* de app installeerbaar is; een hele sessie in vliegtuigmodus werkt inclusief video;
tweemaal synchroniseren geen dubbele logs oplevert; en een verlopen login niets wist.
Export en verwijderen zijn eveneens verplicht: een controleerbare export behoudt alle beschikbare
gebruikersgegevens, inclusief historie en conflicten; ontbrekende servergegevens zijn zichtbaar.
Bevestigd verwijderen wist de bedoelde lokale en servergegevens, toont nog openstaande
serververwijdering en voorkomt terugplaatsen door een oud toestel. Offline wordt geen volledige
serververwijdering geclaimd. De concrete controles staan in bouwvoorstel.md, hoofdstuk 6.1.

---

## 8. Hoe we samenwerken

1. **Verzin geen trainingsregels.** Staat het niet in hoofdstuk 4, vraag het dan.
2. **Herschrijf geen schermteksten.** Zie hoofdstuk 6.
3. **Voorstel vóór code** bij elke keuze die dit document niet dekt.
4. **Per milestone opleveren**, met de acceptatiecriteria erbij afgevinkt.
5. **Wijzigingen gaan eerst hierin**, daarna pas in de code.

---

## 9. Wat nog niet ontworpen is

Deze schermen bestaan nog niet. **Bouw ze niet op eigen houtje** — ze komen als wireframe.
Deze grens blijft gelden. Codex bereidt de nodige ontwerpvoorstellen voor ter beoordeling door
Raoul; profiel/instellingen inclusief export en verwijderen moeten voor M6 zijn uitgewerkt.
De keuze voor full-body verwijdert deze open punten niet automatisch.

- **Profiel en instellingen.** Blijvende voorkeuren terugdraaien, doelen bijstellen, export en
  verwijderen van gegevens.
- **Herstel na langere uitval.** Eén sessie overslaan is uitgewerkt; een week weg zijn en het plan
  hervatten niet.
- **Het kiezen van een zwak punt** op de arm-dag, dat het programma voorschrijft.
- **Toestemming vragen voor meldingen**, als er later een ondersteunde meldingsfunctie komt.
  Webpush-toestemming maakt een achtergrond-rusttimer niet vanzelf betrouwbaar.

Ook bewust nog open, te beslissen na een test met echte trainingen: wanneer de app vraagt hoe zwaar
een set was (per set, alleen bij de laatste, of achteraf per oefening), en hoeveel van zijn eigen
redenering de app standaard laat zien.

---

## 10. Wat het prototype niet bewijst

De wireflow toont gedrag, geen werking. Planning, login en synchronisatie zijn daarin gesimuleerd.
Ook lokale invoer wordt door de statische HTML niet werkelijk bewaard. Hoofdstuk 4 bevat zowel
bronprincipes als productregels; die zijn nog niet als algoritme getoetst.
De UX-benchmark waarop veel keuzes rusten levert hypotheses, geen bewezen effecten.
