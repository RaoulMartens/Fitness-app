# UX Flows — persoonlijke trainingsapp

Uitwerking van de core UX uit Productbrief 01 (14-09-2026), gemaakt met de ux-flow-designer skill.
Afbakening van deze ronde: **smal en diep** rond trainen → registreren → afwijken.
Plan en Vooruitgang zijn een dunne rand. Mobile-first, 375px.

Startscherm voor een nieuwe gebruiker: [wireframes/start.html](wireframes/start.html).
Voor een terugkerende gebruiker: [wireframes/today.html](wireframes/today.html).

## Master screen map
[diagrams/screen-map.md](diagrams/screen-map.md) — alle 33 schermen en de navigatie ertussen.

## Schermoverzicht

Een wireframebestand is niet automatisch een scherm in het product. Drie soorten:

| Soort | Aantal | Wat het is |
|---|---|---|
| Onboarding | 9 | Loopt één keer: vier vragen, een voorstel, account en eerste download |
| Primair scherm | 10 | Eigen plek in de app, eigen navigatie |
| Sheet of substate | 9 | Ligt over een primair scherm; de context eronder blijft |
| Systeemstate | 5 | Een toestand, geen bestemming; hoort niet in de gewone navigatie |

Volledige tabel met voorkeursactie, elementen en uitgaande links:
[wireframes/INDEX.md](wireframes/INDEX.md)

**Onboarding (UC-010):** [Welkom](wireframes/start.html) &middot;
[Doel](wireframes/intake-doel.html) &middot; [Ervaring](wireframes/intake-ervaring.html) &middot;
[Dagen en tijd](wireframes/intake-week.html) &middot;
[Waar en beperkingen](wireframes/intake-context.html) &middot;
[Planvoorstel](wireframes/plan-voorstel.html) &middot;
[Compromis](wireframes/plan-compromis.html) &middot; [Aanmelden](wireframes/aanmelden.html) &middot;
[Klaarzetten](wireframes/eerste-download.html)

**Primaire schermen:** [Vandaag](wireframes/today.html) &middot;
[Sessie-overzicht](wireframes/session-overview.html) &middot;
[Warming-up](wireframes/warmup.html) &middot; [Oefening](wireframes/exercise.html) &middot;
[Afronden](wireframes/summary.html) &middot; [Gevolgen](wireframes/consequences.html) &middot;
[Plan](wireframes/plan.html) &middot; [Dagen aanpassen](wireframes/plan-edit.html) &middot;
[Vooruitgang](wireframes/progress.html) &middot;
[Vandaag geen training](wireframes/today-rustdag.html)

**Sheets en substates:** [Rusttimer](wireframes/rest.html) (substate van Oefening) &middot;
[Oefening lukt niet](wireframes/swap.html) &middot;
[Zwaarder dan verwacht](wireframes/hard.html) &middot; [Minder tijd](wireframes/adjust-time.html) &middot;
[Pauzeren of stoppen](wireframes/interrupt.html) &middot; [Pas vandaag aan](wireframes/adjust.html) &middot;
[Verder trainen](wireframes/resume.html) &middot;
[Push-ups vandaag](wireframes/pushups.html) &middot;
[Max testen](wireframes/pushups-test.html)

**Systeemstates:** [Opslag en synchronisatie](wireframes/sync.html) &middot;
[Offline en downloads](wireframes/offline.html) &middot;
[Probleem met synchroniseren](wireframes/error.html) &middot;
[Nog geen historie](wireframes/empty.html) &middot;
[Even wachten](wireframes/loading.html)

## Onboarding: vier vragen, dan een voorstel

De brief vraagt om doelen en prioriteit, ervaring, dagen, tijd, materiaal en beperkingen. Dat is nu
vier schermen met één vraag per keer, in de toon van een intake bij een trainer.

Drie keuzes die uitleg verdienen:

- **Geen begingewichten in de intake.** Die leert de app tijdens de eerste sessie. Dat volgt het
  uitgangspunt uit de brief om later gegevens te verzamelen wanneer die een beslissing verbeteren,
  en het scheelt de sporter opzoekwerk voordat hij iets aan de app heeft.
- **Conditie, mobiliteit en explosiviteit staan niet in de doelenlijst.** Die vragen eigen meet- en
  programmeerregels en vallen buiten deze versie.
- **Bij een knelpunt kiest de app niet.** Passen de wensen niet samen, dan benoemt hij het
  compromis in frequentie, duur of prioriteit en legt de keuze terug. Dat is
  [plan-compromis.html](wireframes/plan-compromis.html).

Aanmelden en de eerste download zitten aan het eind, niet aan het begin: je ziet eerst wat je krijgt.

## De route vanaf Vandaag

De standaardroute is kort: **Vandaag → Start training → Warming-up → Oefening**. Het
sessie-overzicht is een zijpad voor wie eerst wil zien wat er komt, geen verplichte tussenstap.

De warming-up is begeleid maar niet administratief. De algemene warming-up staat er als lijstje;
alleen de warming-upsets uit het programma zijn afvinkbaar, en ook dat is optioneel.

## M2-voorstel na de persoonlijke intake

De bestaande PPL-schermen hieronder blijven de oorspronkelijke referentie. Het afzonderlijke
[M2-ontwerpvoorstel](../m2-ontwerpvoorstel.md) werkt Vandaag, sessie, rust, hervatten, afronden en
de samenhangende planvoorbeelden uit voor het voorgestelde full-bodyprogramma. Het klikmodel in
`public/m2-voorstel/` is ter beoordeling; het vervangt deze baseline pas na vaststelling.
De beloofde Live Activity en het gegarandeerde rustsignaal op het vergrendelscherm uit de oude
interactiecheck zijn geen geldige PWA-eisen: zie bouwvoorstel.md hoofdstuk 5 en het M2-voorstel.

## Navigatie tijdens een actieve sessie

| Handeling | Waar | Gevolg voor de sessie |
|---|---|---|
| Sheet sluiten | Kruisknop linksboven op elke sheet | Geen |
| Minimaliseren | Rechtsboven op Warming-up en Oefening | Geen; sessie loopt door, terug te vinden op Vandaag |
| Afronden, afbreken, verplaatsen, overslaan | Alleen via Pauzeren of stoppen | Sessie eindigt of verschuift |

Een gewone terugknop verandert nooit de trainingsstatus. Dat was de belangrijkste correctie
in deze ronde.

## Wat de interactiecheck heeft veranderd

De volledige check staat in [interactiecheck.md](interactiecheck.md). Dit is doorgevoerd:

| Bevinding | Wat er nu staat |
|---|---|
| De progressieregel werd pas ná de sessie uitgelegd | Het doel van de set staat boven de invoer: "27,5 kg × 12 reps. Gehaald? Dan volgende keer 30 kg" |
| Invoer was één veld voor twee getallen, zonder grenzen | Twee velden met stappen van 1,25 kg en 1 rep, voorgevuld op het doel |
| Het einde van de rust had geen kanaal | De rusttimer heeft nu een eindtoestand: trilling, korte toon en de sessie op het vergrendelscherm |
| De rusttimer verving de oefening | De sets blijven eronder zichtbaar |
| Eén grijze pil betekende vier dingen | Vier vormen: chip met pijl (link), keuzerondje (optie), vlak (aan/uit), onderstreepte tekst (tekstlink) |
| Geen enkel scherm had een loading state | Eén wachtpatroon als systeemstate, gebruikt bij herplannen en bij het doorrekenen van gevolgen |
| De rustdag bestond alleen in een diagram | Eigen scherm, met rust als onderdeel van het programma |
| Systeemtaal aan de oppervlakte | "Minimaliseren" werd "Sessie blijft lopen"; target/actual effort werd "doel" en "hoe zwaar was deze set"; sync begint met "Je trainingen zijn veilig" |
| Knop en bevestiging gebruikten andere woorden | "Set vastleggen" → "Set 2 vastgelegd"; "Klaar" werd "Terug naar Vandaag" |

Niet doorgevoerd, want dat zijn keuzes die getoetst moeten worden: spraak of een hardwareknop om een
set af te sluiten, en de twee rust-varianten waarbij de app juist niets zegt. Die staan als
alternatieven in de check.

## Dagelijkse push-ups

Een tweede spoor naast het programma, voor de dagen dat de zaal er niet in zit. Drie keuzes:

- **Het dagdoel komt uit een testset**, niet uit een rond getal. Drie sets van ongeveer 40 procent
  van je max, verspreid over de dag. Elke drie weken opnieuw testen; dat is meteen de progressie.
- **De belasting wordt gedeeld met het programma.** Op een Push-dag slaat de app de push-ups over,
  de dag erna halveert hij ze. Push-ups zijn dezelfde beweging als je Push-training; een dagelijks
  doel dat dat negeert, werkt je programma tegen. [Brief p.1]
- **De streak bewijst niets over je lichaam.** Het aantal dagen op rij staat onder *volgehouden*;
  je max in één set staat bij *oefenprestatie*. Die twee worden niet opgeteld. [B p.19, principe 7]

Wat dit bewust níet is: gedeelde sturing. De app claimt niet dat push-ups en het krachtprogramma
samen naar één uitkomst gestuurd worden — de benchmark laat zien dat samen aanbieden iets anders is
dan samen plannen, en dat weer iets anders dan samen sturen. [B p.17]

## De demo

De video staat groot op het oefenscherm en speelt daar. Er is geen apart demoscherm meer: dat bestond
alleen omdat de video eerst achter een knop zat. Schermvullend kijken doet de speler van het toestel
zelf.

## Uitwegen: voor of tijdens

Voor de training is **Pas vandaag aan** het verzamelpunt: minder tijd, een oefening die niet lukt,
overslaan, of dagen die niet meer kloppen. Tijdens de training is dat menu juist in de weg. Daar
staan **Lukt niet**, **Te zwaar** en **Minder tijd** direct bij de oefening, als sheet.

## Het voorschrift en wat je zelf ervoer

Het programma schrijft RPE voor: early sets ongeveer 9, de laatste set 10. Wat de sporter ervaart is
iets anders. Die twee staan apart op het oefenscherm en gebruiken verschillende woorden: het doel
staat boven de invoer, de vraag "hoe zwaar?" staat eronder.

**Nog niet vastgelegd:** wanneer actual effort wordt gevraagd — na iedere set, alleen bij de laatste
set, of achteraf per oefening. Dat blijft expres open om visueel te toetsen.

## Use case-diagrammen
Index: [diagrams/INDEX.md](diagrams/INDEX.md). Per kern-use-case een flowchart, een state diagram
en een sequence diagram; UC-008 en UC-009 alleen een flowchart.

## Belangrijkste prototypelinks

| Van | Element | Naar |
|---|---|---|
| today.html | Bekijk sessie | session-overview.html |
| today.html | Hervatten | resume.html |
| session-overview.html | Start sessie | warmup.html |
| warmup.html | Naar oefening 1 | exercise.html |
| exercise.html | Set vastleggen | rest.html |
| exercise.html | Lukt niet | swap.html |
| exercise.html | Te zwaar | hard.html |
| rest.html | Volgende set | exercise.html |
| adjust.html | Ik heb minder tijd | adjust-time.html |
| summary.html | Bekijk wat dit betekent | consequences.html |
| consequences.html | Accepteren | sync.html |
| sync.html | Nu proberen | error.html |

## Tekst: de app praat als een trainer

Na een leesronde over het hele prototype is alle tekst teruggebracht tot wat de gebruiker op dat
moment nodig heeft. Uitgangspunt is conversational design: de app is iemand die naast je staat in de
zaal, niet een handleiding.

Drie niveaus, en ze zien er anders uit:

| Niveau | Vorm | Voorbeeld |
|---|---|---|
| Wat je nu moet weten | Gewone tekst, kort | "12 reps op 27,5 kg. Ga tot falen." |
| De reden | Eén regel, grijs | "Je rug is drie dagen hersteld." |
| De onderbouwing | Uitklapregel, op verzoek | "Hoe ik dit bepaal" |

Wat eruit is: schermen die zichzelf uitleggen ("Dit scherm is extra uitleg"), tekst die het
ontwerp verantwoordt in plaats van de gebruiker helpt ("Deze vier worden niet opgeteld tot één
score"), en herhaling van wat de knop al zegt. Gedrag dat je niet kunt tekenen — trilling, een
vergrendelscherm, wat er na vijf seconden gebeurt — staat nu als **notitie** onderaan het scherm,
cursief en duidelijk buiten de interface.

Gemiddeld 56 woorden interfacetekst per scherm.

## Navigatiepatronen
- **Tabbalk** alleen op Vandaag, Plan en Vooruitgang. Tijdens een actieve sessie verdwijnt die.
- **E&eacute;n voorkeursactie per context**, met uitwegen eronder als secundaire knoppen.
- **Sheets over de context**, niet ernaast: je verliest nooit waar je was.
- **Reikwijdte staat bij de keuze**, niet in instellingen: vandaag of blijvend.
- **Drie informatieniveaus** op elk scherm dat iets uitlegt: de actie zelf, daaronder &eacute;&eacute;n
  regel reden, en pas op verzoek de uitgebreide onderbouwing. In de wireframes is dat laatste een
  uitklapregel. Zo blijft het oppervlak licht terwijl de onderbouwing er wel is.
- **Synchronisatie is stil.** Op apparaat opgeslagen, synchroniseren en gesynchroniseerd staan klein
  in beeld en vragen niets. Alleen een echt probleem is een bestemming.

## Hoe de vijf toetscriteria uit de brief terugkomen

| Criterium | Waar te zien |
|---|---|
| 1. Dagen en doelen aanpassen, plan begrijpen | start.html → intake → plan-voorstel.html (doelen en randvoorwaarden), plus plan.html → plan-edit.html (dagen bijstellen) |
| 2. Trainen, video bekijken, registreren | today.html → warmup.html → exercise.html (video staat daar groot) → rest.html |
| 3. Afwijking verklaren en gevolgen beoordelen | Vanaf exercise.html: swap.html, hard.html, adjust-time.html, interrupt.html |
| 4. Invoer terugvinden na heropenen | today.html (kaart 'Sessie loopt') → resume.html |
| 5. Consistentie, prestaties en herstel scheiden | progress.html: consistentie, oefenprestatie, ontwikkeling van het trainingsplan, herstel en context |

Toestanden apart te beoordelen: empty.html (leeg), offline.html (offline en downloads),
sync.html (drie opslagstatussen en verlopen login), error.html (conflict).

## Open vragen voor de visuele fase
1. **Hoeveel redenering standaard zichtbaar is.** De app moet kunnen uitleggen wat er verandert,
   zonder voortdurend zijn eigen logica toe te lichten. De drie niveaus (actie, korte reden, uitleg
   op verzoek) zijn nu overal hetzelfde toegepast. Te toetsen: waar mag niveau twee weg, en waar is
   niveau drie juist te diep weggestopt?
2. **Wanneer actual effort wordt gevraagd.** Per set, alleen bij de laatste set, of achteraf per
   oefening. Elk moment heeft een andere prijs in onderbreking.
3. **Registratie-invoer.** De skill schrijft wireframes zonder JavaScript voor; de brief vraagt dat
   lokale demo-invoer echt bewaard blijft. Nu getekend, niet werkend. De enige eis uit de brief die
   dit prototype niet zelf aantoont.
4. **Maakt een voorgevuld doel lui?** De invoer staat nu al op het doel. Dat haalt de rekenstap weg,
   maar kan registratie veranderen in wegklikken. Alleen te zien door mensen echt te laten trainen.
5. **Wil iemand een trilling als de rust voorbij is?** Nu wel gekozen, met een Live Activity erbij.
   De check beschrijft twee tegenovergestelde alternatieven waarin de app juist zwijgt.
6. **Geminimaliseerde sessie.** Nu een kaart bovenaan Vandaag. Een blijvende balk onderin is een
   alternatief, maar kost permanent ruimte.
7. **Warming-up.** Nu grotendeels lezen. Te toetsen of de optionele vinkjes overbodig blijken.
8. **Vorige uitvoering.** Nu altijd dezelfde oefeningvariant, zonder instelling. Hevy laat die keuze
   aan een instelling; de benchmark noemt dat een bron van verwarring.
9. **Rustdag.** Heeft nu een eigen scherm; of de toon klopt is nog niet getoetst.
10. **Herstelblok op Vooruitgang.** Nu alleen zelfrapportage en context. Zonder wearables blijft dat zo.

## Wat dit prototype niet bewijst
Planning, login en synchronisatie zijn gesimuleerd. De trainingsregels komen uit het handboek en
het PPL-programma en zijn hier UX-gedrag, geen gevalideerd algoritme. De benchmark levert
hypotheses, geen geteste effecten. Echte offline media, accountbeveiliging en trainingslogica
moeten later apart gebouwd en getest worden.

## Bronnen
[B] UX-benchmark-persoonlijke-trainingsapp.pdf, p. 1-7 en 16-20 &middot;
[T1] The_Hypertrophy_Handbook.pdf, p. 11-12 (dubbele progressie), p. 20 (kolommen), p. 27 (substituties) &middot;
[T2] The_Pure_Bodybuilding_Program_-_PPL.pdf, p. 2-3 en voorbeeldsessie p. 6 &middot;
[T4] Pure_Bodybuilding_-_PPL.xlsx, tab PPL &middot; Productbrief 01.
