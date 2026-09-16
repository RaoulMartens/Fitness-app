# Interactiecheck — prototype trainingsapp

Uitgevoerd op 14 september 2026, op versie 5 van de wireflow. Theorie: introcollege Interaction
Design & Ontwerpstudies, CMD voltijd, cursus 7.

## 1. Wat er nagelopen is

**Schermen.** Alle 21 wireframes uit `wireframes/`, stuk voor stuk gelezen: negen primaire schermen,
acht sheets en substates, vier systeemstates.

**Kerninteracties.** Vijf actieve werkwoorden met een doel:

1. **Een set vastleggen** — de kern. Herhaalt zich ongeveer zestien keer per sessie.
2. **Een training starten of hervatten.**
3. **Een afwijking melden en het voorstel beoordelen** — minder tijd, lukt niet, te zwaar.
4. **Trainingsdagen bijstellen.**
5. **Vooruitgang lezen.**

**Gebruikscontext.** Telefoon, in de sportschool, staand, tussen twee sets in. Vaak één hand vrij,
soms zweterige handen, telefoon tussendoor in de broekzak. Korte aandachtsspanne van tien tot
dertig seconden. Verbinding kan slecht of afwezig zijn. Thuis wordt vooral het plan bekeken en
vooruitgang gelezen, met meer rust en twee handen.

---

## 2. Belangrijkste bevindingen

### 1. De app rekent de progressie wel uit, maar niet op het moment dat het telt — *frictie*
`exercise.html` toont "SET 3 VAN 3 · 10-12 REPS · TARGET RPE 10" en daarnaast "vorige keer
27,5 × 10". Wat er niet staat is wat je nú moet halen. De app kent de regel van dubbele progressie
wel: op `consequences.html` legt hij hem uit ("gaat naar 12 reps. Haal je die op alle sets, dan gaat
het gewicht naar 30 kg"). Alleen komt die uitleg ná de training. Tijdens de set moet de sporter zelf
de vertaalslag maken van "vorige keer 10" naar "dus nu 11 of 12". Precies die rekenstap zou de app
overnemen — dat is de kernbelofte uit de brief. Dit is de breedste kloof in het hele ontwerp.

### 2. De enige keer dat het systeem het initiatief neemt, heeft het geen kanaal — *frictie*
`rest.html` telt af van 2:14 naar nul. Op dat moment ligt de telefoon meestal in een broekzak of op
een bankje. Er is geen trilling, geen geluid, geen melding op het vergrendelscherm ontworpen. Het
aflopen van de timer is de enige gebeurtenis in de app die uit het systeem komt in plaats van uit de
gebruiker, en juist daar is geen output gekozen. Zie ook bril 2 en 12.

### 3. Dezelfde vorm betekent drie verschillende dingen — *frictie*
De grijze pil met stippellijn is op `exercise.html` een link ("Lukt niet", "Te zwaar", "Minder
tijd"), op `adjust-time.html` een keuzeoptie ("30 min", "45 min", "Zelf"), op `plan-edit.html` een
aan/uit-schakelaar voor dagen ("ma di wo do vr za zo") en op `progress.html` een filter ("Sessie",
"Week", "Langer"). Vier betekenissen, één signifier. Dat is precies waar de theorie voor waarschuwt:
signifiers horen het aantal mogelijke interpretaties te verkleinen, niet te vergroten.

### 4. Geen enkel scherm heeft een loading state — *gemiste kans, structureel*
Nul van de eenentwintig. Terwijl er wel degelijk gewacht wordt: het herberekenen na "Herplannen"
(`plan-edit.html`), het downloaden van een video (`offline.html`), synchroniseren (`sync.html`), een
video die buffert. De UI Stack noemt dit een van de vijf persoonlijkheden van elk scherm. Zie de
tabel in deel 4.

### 5. Er is geen scherm voor "vandaag train je niet" — *gemiste kans*
In het diagram `uc-001-sessie-starten/flow.md` staat een tak "Rustdag met eigen waarde", en de brief
vraagt expliciet dat rust als gepland onderdeel waarde krijgt. Maar `today.html` bestaat alleen in de
variant met een sessie. De rustdag is nergens getekend, dus ook niet te beoordelen.

---

## 3. Per bril

### 1. Mens-product-interactiemodel
Per kerninteractie klopt de wisselwerking. Set vastleggen: input is een tap op de vorige waarde of
getypte cijfers, output is een vinkje in de rij, de regel "Op apparaat opgeslagen" en de rusttimer.
Afwijking melden: input is een aanleiding, output is een voorstel met reden en reikwijdte.

Wat opvalt is dat vrijwel alle input van de gebruiker komt. Het college noemt nadrukkelijk ook input
uit andere bronnen. De app gebruikt er één: tijd, in de rusttimer. Onbenut blijven bijvoorbeeld het
moment van heropenen (wel gebruikt voor "Sessie loopt" op `today.html`, dat is goed), de
verstreken tijd sinds de vorige set als signaal dat je bent afgeleid, en of er verbinding is.

### 2. Modaliteiten
Het ontwerp spreekt één zintuig aan: zien. Alles is tap en lezen. In deze gebruikscontext is dat een
echte beperking. Tussen sets kijk je niet naar je telefoon; je ademt uit, je loopt rond, je legt hem
weg. Voelen (trilling) en horen (korte toon, of via oordopjes) zijn precies de kanalen die hier
passen, en die zijn nergens ingezet. Zie bevinding 2.

Tweede punt: de zwaarste fijne-motoriektaak staat op het slechtste moment. Het invoerveld "kg ×
reps" op `exercise.html` vraagt om typen op een toetsenbord, met zweterige of krijtige handen,
direct na een set tot bijna falen.

### 3. Conversational design
Als gesprek gelezen loopt het verrassend natuurlijk. De app begint ("Vandaag: Pull #1, want dag 4 van
de cyclus van 10"), de sporter zegt "start", de app instrueert per set, de sporter antwoordt met
cijfers, de app bevestigt en zegt wat er straks komt.

Twee plekken waar het gesprek hapert. Op `swap.html` vraagt de app "WAT IS ER AAN DE HAND?" met drie
opties, maar geeft alle drie de antwoorden al tegelijk in beeld: bezet, geen materiaal én pijn staan
allemaal uitgeklapt. Als gesprek is dat iemand die zijn drie antwoorden geeft voordat je gekozen
hebt. Hetzelfde op `hard.html`, waar "GEKOZEN: STRUCTUREEL" al onder de vraag staat. Dat is deels een
wireframe-artefact, maar het moet in de visuele fase echt stap voor stap.

Verder zwijgt de app op één moment waarop een mens iets zou zeggen: direct na "Set vastleggen" komt
alleen "Op apparaat opgeslagen". Dat je een rep meer deed dan vorige week wordt pas op `rest.html`
genoemd.

### 4. Useful & usable
**Useful:** ja, en scherp afgebakend. De app neemt oefenkeuze, volume, rust en progressie over; dat
is de belofte uit de brief. `warmup.html` is hier het beste voorbeeld: de app rekent 60% van je
werkgewicht uit in plaats van de regel te citeren.

**Usable:** grotendeels. Het oefenscherm past binnen één telefoonscherm, er is per scherm één
voorkeursactie, en de uitwegen zijn bereikbaar zonder tussenmenu. Twee usability-punten: het
gecombineerde invoerveld (zie bril 2) en de dubbelzinnige signifiers (bevinding 3).

Belangrijk onderscheid voor de verdediging van dit ontwerp: de app is useful zonder dat de
trainingslogica klopt, en usable zonder dat hij useful is. Dit prototype toont vooral de usable-kant.
Of de programmering goed is, bewijst het niet.

### 5. Conceptual & mental models
Het represented model is sterk gekozen: programma → sessie → oefening → set. Dat is exact het model
uit het handboek en het PPL-schema, en dus ook het model dat in het hoofd van de sporter zit. Iemand
die volgens dit programma traint, hoeft niets nieuws te leren.

Op drie plekken lekt het implementatiemodel naar de oppervlakte:

- **De synchronisatiestatussen.** "Op apparaat opgeslagen", "Synchroniseren", "Gesynchroniseerd",
  "Probleem met synchroniseren" (`sync.html`) zijn de namen van systeemtoestanden. De vraag van de
  sporter is een andere: *ben ik mijn sets kwijt?* De brief eist dat de drie statussen zichtbaar
  blijven, en dat is terecht, maar de woorden zijn nu die van de techniek.
- **"Minimaliseren"** (`exercise.html`, `warmup.html`) komt uit de wereld van vensters op een
  desktop. Op een telefoon minimaliseer je niets.
- **"Target effort" en "actual effort"** zijn Engels in een verder Nederlandse interface, en het zijn
  bedachte termen: het handboek zelf gebruikt gewoon RPE. Het onderscheid is goed, de woorden nog niet.

### 6. Discoverability
- **Affordances.** De echte mogelijkheden zijn beperkt en duidelijk: tikken, invullen, uitklappen.
- **Signifiers.** Het zwakste punt, zie bevinding 3. Daarnaast: de uitklapregels ("Waarom deze
  sessie?", "Hoe de app dit bepaalt") gebruiken een klein driehoekje. Dat werkt, maar ze zien er niet
  uit als iets dat meer informatie bevat; het college noemt dit precies de kloof tussen waarheid en
  perceptie.
- **Constraints.** Vrijwel afwezig. Niets houdt tegen dat je 275 kg invult in plaats van 27,5, of
  9 reps waar het bereik 10-12 is. Bij een wireframe is dat te verwachten, maar de invoer van een set
  is dé plek voor constraints: stappen van 1,25 kg, reps binnen of net buiten het bereik.
- **Mappings.** Kloppen, met één uitzondering: op `rest.html` is "Volgende set" een grote knop en
  "Dit was de laatste set van de sessie" een tekstlink, terwijl de tweede veel meer gevolgen heeft.
  Het gewicht van de bediening past niet bij het gewicht van het gevolg.
- **Feedback.** Aanwezig maar mager: een vinkje en een statusregel. Zie bril 12.

### 7. Cognitieve belasting
Tussen twee sets hoeft de sporter weinig te onthouden: gewicht, reps en target staan in beeld. Dat is
goed gedaan.

Eén rekenstap blijft wel bij de gebruiker liggen, en het is net de belangrijkste (bevinding 1).

Per scherm geteld vragen de meeste schermen twee tot vier dingen tegelijk om aandacht, wat prima is.
Twee uitzonderingen: `swap.html` toont drie aanleidingen met elk hun eigen uitwerking, samen zes
blokken; en `sync.html` toont vier statussen, een actuele stand en een uitklapper. Die laatste is een
systeemstate die je zelden ziet, dus dat weegt licht.

### 8. Zeven fasen van actie
Uitgewerkt voor **een set vastleggen**, de kerninteractie.

| Fase | Wat er gebeurt | Oordeel |
|---|---|---|
| Doel vormen | "Deze set goed doen en vastleggen" | Duidelijk |
| Intentie | "Ik doe deze set" | Duidelijk |
| Keuze | *Welk gewicht, hoeveel reps?* | **Hier is de kloof** — de app zegt niet wat het doel van deze set is |
| Actie | Tik op de vorige waarde, of typ | Werkt, maar typen is zwaar in deze context |
| Wereld verandert | Set opgeslagen | — |
| Waarnemen | Vinkje, "Op apparaat opgeslagen", rusttimer | Aanwezig |
| Interpreteren | "Was dit goed?" | Deels: `rest.html` toont vorige keer ernaast |
| Evalueren | "Lig ik op koers?" | Pas na de sessie, op `consequences.html` |

De gulf of execution is dus breder dan de gulf of evaluation, en zit helemaal aan de kant van de
keuze. Dat is goed nieuws: het is op te lossen met één regel tekst op de juiste plek.

De flow zelf is gesloten en kort: Vandaag → Warming-up → Oefening → Rust → Oefening → Afronden.
Je wordt nergens uit de route gegooid.

### 9. Design patterns & guidelines
Gebruikte patronen: tabbalk onderin met drie items, bottom sheets met een grab-handle, de
vorige-uitvoering-kolom naast de huidige set (het Hevy-patroon uit de benchmark), en uitklapregels
voor extra uitleg. Die worden consistent toegepast.

Eén bewuste afwijking verdient een bestaand patroon. Tijdens een actieve sessie verdwijnt de tabbalk
en heet de uitweg "Minimaliseren". Apple heeft hier een patroon voor dat het college ook noemt:
**Live Activities**. In Apple's richtlijnen staat dat een Live Activity bedoeld is om "the progress
of an activity, event, or task at a glance" te volgen, dat je ze moet aanbieden "for tasks and events
that have a defined beginning and end", en het eerste voorbeeld dat Apple zelf noemt is "real-time
fitness metrics and interactive controls to pause or cancel a workout". Ze werken het best voor
activiteiten "that don't exceed eight hours" — een trainingssessie past daar ruim binnen.

Dat maakt "Minimaliseren" niet fout, maar wel onvolledig: op iOS hoort een lopende sessie zichtbaar
te blijven op het vergrendelscherm en in de Dynamic Island, met de rusttimer erin. Dan lost hetzelfde
patroon meteen bevinding 2 op. Let wel op Apple's regel dat je de activiteit ook echt moet
beëindigen zodra de sessie klaar is.

Tweede punt: bottom sheets sluiten op iOS en Android normaal ook door omlaag te vegen. Nu is er
alleen een kruisje linksboven — de minst bereikbare hoek voor een duim.

### 10. UI Stack
Zie de tabel in deel 4. Kort: de ideal state is overal ontworpen, empty en error deels, partial
mager, loading nergens.

### 11. Spatial & transitional
Het ruimtelijke model is helder: Vandaag is thuis, de sessie ligt dieper, sheets komen van onderen
over de context heen, en systeemstates liggen ernaast. De sheet-balk bovenaan elke sheet maakt dat
ook zichtbaar ("Overlay / sheet over Oefening").

Drie plekken kloppen niet helemaal:

- **`rest.html` gedraagt zich als een vol scherm.** Hij is gemodelleerd als substate van de oefening,
  maar vervangt de oefening volledig. Tijdens rust wil je juist je vorige sets kunnen zien. In de
  visuele fase hoort de timer waarschijnlijk óver de oefening te liggen, of erin.
- **`adjust-time.html` heeft twee ouders.** De sheet-balk zegt "over Vandaag of Oefening", maar
  sluiten brengt je altijd naar `exercise.html`. Wie hem vanaf Vandaag opent vóór de training, belandt
  dus in een sessie die nog niet gestart is. In een wireflow zonder JavaScript is dat lastig anders op
  te lossen, maar het is wel een fout in het model en het hoort in de bouw twee varianten te zijn.
- **`resume.html` is een sheet die als doorgang werkt.** Hij komt van onderen over Vandaag, maar
  brengt je dieper de sessie in. Twijfelgeval: of het is een sheet die na de keuze weer sluit, of het
  is een doorgang en dan hoort hij zijwaarts te bewegen.

### 12. Microinteracties
Drie momenten uitgewerkt volgens trigger, regels, feedback, loops en modes.

**Een set vastleggen.** Trigger: tik op "Set vastleggen". Regels: waarde wordt lokaal opgeslagen, de
rij krijgt een vinkje, de rusttimer start. Feedback: vinkje plus "Op apparaat opgeslagen". Loops en
modes: herhaalt per set; bij de laatste set komt de vraag naar actual effort erbij.
*Ontbreekt:* een voelbare bevestiging, en een zichtbare manier om een net vastgelegde set te
corrigeren. In de use cases staat correctie wel beschreven (UC-002, A3), op het scherm niet.

**De rusttimer.** Trigger: een set is vastgelegd. Regels: telt op, richtlijn 2-3 minuten, verlengen
kan. Feedback: cijfers en een balk. Loops en modes: per set opnieuw.
*Ontbreekt:* het belangrijkste moment, namelijk dat de tijd om is. Geen einde ontworpen, in geen
enkele modaliteit. Ook niet beschreven wat er gebeurt als je de app sluit terwijl de timer loopt.

**Vorige waarde overnemen.** Trigger: tik op de grijze cel met "27,5 × 10". Regels: neemt gewicht en
reps over in het invoerveld. Feedback: *niet ontworpen*. Er staat wel de instructie "Tik op de vorige
waarde om die over te nemen", maar niet wat je ziet gebeuren. Dit is het duidelijkste voorbeeld van
de meest voorkomende vondst uit het college: een microinteractie zonder feedback.

### 13. UX copy
**Motivatie vóór de actie.** Goed. "Start training" is een actief werkwoord, en de regel eronder
geeft een reden ("Dag 4 van de cyclus van 10. Rug is 3 dagen hersteld").

**Instructie tijdens.** Meestal op de juiste plek, zoals "Tik op de vorige waarde om die over te
nemen". Uitzondering is de placeholder "kg × reps": dat is één veld dat om twee getallen vraagt
zonder te laten zien hoe.

**Feedback erna.** Hier zit het meeste werk. De knop zegt "Set vastleggen", de bevestiging zegt "Op
apparaat opgeslagen". Twee verschillende woorden voor hetzelfde moment: de bevestiging beantwoordt
niet de vraag die de knop opriep. "Vastgelegd" zou dat wel doen, en de opslagstatus mag daaronder.

Losse punten:
- "Klaar" op `summary.html` is dubbelzinnig: klaar met dit scherm, of klaar met de sessie?
- "Toch dagvorm, niets veranderen" op `hard.html` stopt twee beslissingen in één knop.
- "Later oplossen" op `error.html` is goed: het zegt wat er gebeurt en belooft niets.
- De lege staat op `empty.html` is sterk geschreven: hij legt uit wat er niet is en waarom, en geeft
  toch een handeling ("Kies een gewicht waarbij 10 tot 12 reps zwaar aanvoelen").

---

## 4. UI Stack-tabel

Alleen de negen primaire schermen plus de substate, want sheets erven de toestand van hun ouder.
● ontworpen · ◐ gedeeltelijk · ○ ontbreekt · – niet van toepassing

| Scherm | Ideal | Empty | Error | Partial | Loading |
|---|---|---|---|---|---|
| today.html | ● | ○ geen rustdag, geen "plan nog niet af" | ○ | ◐ toont wel een lopende sessie | ○ |
| session-overview.html | ● | – | ○ | ○ | ○ |
| warmup.html | ● | – | – | – | – |
| exercise.html | ● | ◐ via `empty.html` | ○ invoerfout | ◐ sets deels ingevuld | ○ |
| rest.html | ● | – | – | – | – |
| summary.html | ● | ○ sessie zonder enige set | ○ | ◐ "3 van 6 oefeningen" staat in `interrupt.html` | ○ |
| consequences.html | ● | ○ niets veranderd | ○ herberekening mislukt | ○ | ○ berekening loopt |
| plan.html | ● | ○ nog geen plan | ○ | ○ | ○ |
| plan-edit.html | ● | – | ○ combinatie kan niet | ○ | ○ herplannen duurt even |
| progress.html | ● | ◐ via `empty.html` | ○ | ◐ "nog geen trend" genoemd | ○ |

Systeemstates apart: `empty.html`, `error.html` en `offline.html` bestaan en zijn goed uitgewerkt.
Ze dekken alleen niet alle schermen waar die toestand kan optreden.

**Wat dit laat zien.** Loading is een blinde vlek: nul van de tien. Empty en error zijn opgelost als
losse schermen, maar niet per scherm doordacht — `plan.html` zonder plan en `summary.html` zonder
sets bestaan simpelweg niet. Partial is het vaakst half aanwezig: het ontwerp erkent wel dat er te
weinig data kan zijn, maar toont dat maar op twee plekken.

---

## 5. Alternatieve interacties

Voor de twee interacties die het zwakst uit deze check komen. Per stuk drie alternatieven, waarbij
elk volgend alternatief niet mag hergebruiken wat het vorige gebruikte. Geen winnaar: dat is een
aparte beslissing, ná het toetsen.

### A. Een set vastleggen

**A1 — Bevestigen in plaats van invullen.**
De app zet het doel van deze set al klaar als voorgevulde waarde: "27,5 kg × 12". Eén grote knop
"Gehaald", en eronder klein "Ging anders…" voor wie moet afwijken.
*Wint:* één tap per set, geen toetsenbord, en de progressieregel staat eindelijk op het juiste moment
in beeld. Lost bevinding 1 op.
*Verliest:* nodigt uit tot klakkeloos bevestigen. Wie net niet haalde, drukt misschien toch.
*Past bij:* iemand die het programma trouw volgt en zijn telefoon zo min mogelijk wil aanraken.

**A2 — Twee duimschuiven en een veeg.**
Geen toetsenbord en geen voorgevulde waarde, maar twee schuiven onder elkaar: gewicht in stappen van
1,25 kg, reps in stappen van 1. Je zet ze met je duim en veegt de rij naar rechts om vast te leggen.
*Wint:* met één hand te bedienen, constraints zitten in de bediening zelf (je kúnt geen 275 kg kiezen),
en vegen is een groter, onnauwkeuriger gebaar dat past bij trillende handen.
*Verliest:* vegen is minder ontdekbaar dan een knop, en het kost meer seconden per set dan A1.
*Past bij:* wie regelmatig afwijkt van het voorstel en dus echt kiest.

**A3 — Zonder scherm.**
De telefoon blijft in je zak. Je sluit een set af met een druk op de volumeknop, of je zegt "elf"
tegen je oordopjes. De telefoon trilt één keer ter bevestiging en de rusttimer start meteen.
*Wint:* handen en ogen vrij, sluit het dichtst aan bij wat er in de sportschool echt gebeurt, en het
gebruikt eindelijk voelen en horen in plaats van alleen zien.
*Verliest:* spraak werkt slecht in een lawaaiige ruimte en voelt gek met mensen om je heen; een
hardwareknop is onzichtbaar en moet je leren. Correctie achteraf wordt lastiger.
*Past bij:* drukke sportscholen waar je toch al oordopjes in hebt, en bij sporters die het programma
uit hun hoofd kennen.

### B. Weten dat de rust voorbij is

**B1 — Het systeem tikt je aan.**
Trilling plus een korte toon als de rusttijd om is, en de timer loopt zichtbaar door op het
vergrendelscherm als Live Activity.
*Wint:* je hoeft niet te kijken; het lost het gat uit bevinding 2 op met een bestaand platformpatroon.
*Verliest:* een melding die je niet wilt is irritant, en Apple's eigen richtlijn waarschuwt dat
onverwachte Live Activities juist storen. Het moet dus uit kunnen.
*Past bij:* iedereen die de telefoon wegstopt tussen sets.

**B2 — Geen timer, maar achteraf meten.**
De app telt wel, maar zegt niets. Als je terugkomt bij het scherm zie je hoe lang je hebt gerust en of
dat binnen de richtlijn viel: "3:10 — iets langer dan de 2-3 min".
*Wint:* nul onderbrekingen, en het past bij het principe dat de app alleen praat als het de volgende
stap verandert. Rust wordt context in plaats van een opdracht.
*Verliest:* je stuurt niet meer op rust, terwijl rusttijd wel invloed heeft op de training.
*Past bij:* sporters die van nature lang genoeg rusten en zich gecommandeerd voelen door een aftelklok.

**B3 — De rust begint pas als jij dat zegt.**
De timer start niet automatisch na het vastleggen, maar op het moment dat je hem start. Daarvoor staat
er alleen "klaar om te rusten".
*Wint:* de app doet geen aanname over wat er in de zaal gebeurt (je loopt nog weg, iemand praat tegen
je), en de gemeten rust klopt beter met de werkelijkheid.
*Verliest:* een extra handeling per set, precies waar we die juist weg wilden hebben.
*Past bij:* onderzoek naar hoe rust er in de praktijk echt uitziet, meer dan als eindoplossing.

---

## 6. Open vragen

Deze check kan een aantal dingen niet beslissen. Die moeten met gebruikers getoetst worden.

1. **Helpt een voorgevuld doel per set, of maakt het lui?** A1 lost de grootste kloof op, maar kan
   registratie veranderen in wegklikken. Alleen te zien door mensen echt te laten trainen.
2. **Wanneer moet actual effort gevraagd worden?** Na iedere set, alleen bij de laatste, of achteraf
   per oefening. Dit stond al open en deze check verandert daar niets aan.
3. **Wil iemand een trilling bij het einde van de rust, of voelt dat als een baas?** B1 en B2 zijn
   bijna tegengesteld in toon.
4. **Zijn de vier blokken op `progress.html` te begrijpen zonder uitleg?** Ze zijn theoretisch goed
   gescheiden, maar het onderscheid tussen "oefenprestatie" en "ontwikkeling van het trainingsplan"
   is voor Raoul helder omdat hij het ontworpen heeft.
5. **Hoeveel reden is genoeg?** De drie informatieniveaus zijn overal gelijk toegepast. Waar het
   middelste niveau overbodig is, is alleen te zien bij echt gebruik.

## Wat deze check niet is

Een toets op basis van theorie, niet op basis van gebruik. Het college levert handvatten en
hypotheses; niets hier is bewezen gedrag. Er is geen gebruikerstest gedaan, geen tijd gemeten en geen
enkele tap geteld. De bevindingen zijn aanwijzingen over waar het waarschijnlijk misgaat, en de
alternatieven zijn studiemateriaal om keuzes op te baseren — geen aanbevelingen.

---

## 7. Wat hiervan is doorgevoerd (versie 6)

Deze check is uitgevoerd op versie 5. Daarna is het prototype aangepast. De tabel houdt bij wat er
met elke bevinding gebeurd is, zodat de verantwoording naast de check blijft staan.

| Bevinding | Status | Oplossing |
|---|---|---|
| 1. Progressieregel kwam pas na de sessie | Doorgevoerd | `exercise.html` toont het doel van de set boven de invoer, met het gevolg erbij |
| 2. Einde van de rust had geen kanaal | Doorgevoerd, met een keuze | `rest.html` heeft een eindtoestand met trilling, korte toon en Live Activity. Dat is alternatief B1; B2 en B3 zijn niet gebouwd |
| 3. Eén pil betekende vier dingen | Doorgevoerd | Vier vormen, beschreven in `wireframes/INDEX.md` |
| 4. Geen loading states | Deels | Eén wachtpatroon als systeemstate (`loading.html`), gebruikt bij herplannen en doorrekenen. Nog niet per scherm doordacht |
| 5. Geen rustdag | Doorgevoerd | `today-rustdag.html` |
| Bril 2: alleen zien | Deels | Trilling en geluid alleen bij het einde van de rust; de rest van de app blijft visueel |
| Bril 5: systeemtaal | Doorgevoerd | "Sessie blijft lopen" in plaats van "Minimaliseren"; doel en zwaarte in het Nederlands; `sync.html` begint met wat het voor jou betekent |
| Bril 6: geen constraints | Doorgevoerd | Twee velden met stappen van 1,25 kg en 1 rep |
| Bril 11: rusttimer verving de oefening | Doorgevoerd | Sets blijven zichtbaar onder de timer |
| Bril 11: `adjust-time.html` had twee ouders | Deels | Sluiten gaat nu naar Vandaag, met een regel die uitlegt waar je uitkomt. In de bouw horen dit twee varianten te zijn |
| Bril 12: overnemen zonder feedback | Deels | De instructie is korter en de invoer staat voorgevuld, waardoor overnemen minder vaak nodig is. De feedback zelf is nog niet getekend |
| Bril 13: knop en bevestiging in andere woorden | Doorgevoerd | "Set vastleggen" → "Set 2 vastgelegd"; "Klaar" → "Terug naar Vandaag"; dubbele knop op `hard.html` gesplitst |
| Bril 3: alle antwoorden tegelijk in beeld | Deels | `swap.html` en `hard.html` tonen nu een gekozen staat met een regel die uitlegt waarom de rest ook zichtbaar is. Echt stap voor stap kan pas met werkende schermen |
| Bril 9: sheets sluiten alleen met een kruisje | Niet | Vegen is niet te tekenen zonder JavaScript; staat als aandachtspunt voor de bouw |

**Bewust niet doorgevoerd.** De alternatieven A2 (duimschuiven met veeg), A3 (volumeknop of spraak),
B2 (achteraf meten) en B3 (rust start op jouw teken) zijn ontwerpkeuzes, geen verbeteringen. Ze
vragen om een test met echte trainingen voordat je er een kiest.
