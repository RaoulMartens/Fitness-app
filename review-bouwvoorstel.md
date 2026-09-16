# Review — bouwvoorstel van 15 september 2026

Gelezen naast `bouwbrief.md`, de productbrief en de wireflow in `ux-flows/`.

## Oordeel

Vakwerk op het technische deel. Maar dit is geen technisch voorstel: het is een **productwijziging
met een technisch voorstel eraan vast**. Akkoord geven op "M1 en de stack" betekent in de huidige
vorm ook akkoord geven op een ander trainingsprogramma dan waarop alle 33 schermen en elf use cases
zijn gebouwd. Die twee moeten uit elkaar.

Advies: **ja tegen de techniek, nog niet tegen het programma.**

---

## Wat er goed in zit

Dit is geen beleefdheid; deze punten zijn beter dan wat er in de bouwbrief stond.

1. **Hij verzint niets.** Geen begingewichten uit ervaring of lichaamsdoel, geen
   warming-uppercentage zonder bekend werkgewicht, geen automatische verhoging bij ontbrekende
   inspanningsinformatie. Precies de regel uit hoofdstuk 8 van de brief, en hij past hem ook toe
   waar de brief het niet expliciet zei.
2. **Concept en uitvoering gescheiden.** Afspraakstatus versus uitvoeringsstatus, en een
   invoerdraft naast een bevestigde set. Dat lost een echt probleem op dat in mijn datamodel
   verstopt zat: een datum verplaatsen is geen training, en half ingetypte cijfers zijn geen
   prestatie.
3. **Synchronisatie is serieus doordacht.** Idempotentiesleutel én basisrevisie, conflicten die
   beide versies bewaren, en verwijderen als versieerbare wijziging zodat een oud toestel niets
   terugzet. Dat laatste zat niet in mijn brief en is terecht.
4. **Hij prikt door Supabase heen.** "Dit is geen automatische offline-oplossing" klopt: offline en
   conflictafhandeling moet je zelf bouwen, welke dienst je er ook onder zet.
5. **Hij ziet het mediaprobleem.** Een YouTube-link is geen offline videobestand, en die bundel is
   nooit geleverd. Dat blokkeert straks de offline-test — goed dat hij het nu zegt en niet in M6.
6. **Hij vond een gat in mijn datamodel.** Het PPL-programma kent setschema's als 4/6/8 binnen één
   oefening en 8-10 plus 4-6 binnen een combinatie. Mijn model kende alleen "repbereik" of "vaste
   reps". Zijn setvoorschrift per set is de juiste oplossing.

---

## Wat eerst opgelost moet worden

### 1. Er is een intake geweest die nergens staat — *blokkerend*

Het document opent met "persoonlijke gegevens in paragraaf 1.1 van die brief zijn bevestigd".
**Die paragraaf bestaat niet.** De bouwbrief heeft geen persoonlijke gegevens; hoofdstuk 1 gaat over
wat het product is.

Overal duiken feiten op die alleen uit een gesprek kunnen komen: woensdag als vaste dag, een
optioneel weekend, 90 beschikbare minuten, bovenlichaam als aandachtspunt, beginner, en een
acceptatiecriterium waarin "12 kg" wordt ingevoerd. Dat is waarschijnlijk gewoon waar — maar het
staat in geen enkel document, en daarmee is het niet controleerbaar en niet overdraagbaar.

**Vraag terug:** schrijf die intake uit als hoofdstuk 1 van de bouwbrief, in dezelfde vorm als de
rest: wat is gevraagd, wat is geantwoord, wanneer. Dan pas kan iemand beoordelen of full-body
tweemaal per week de juiste conclusie is.

### 2. Als full-body doorgaat, klopt de wireflow niet meer — *blokkerend*

De 33 schermen tonen Pull #1, een cyclus van tien dagen, trainingsdagen di/do/za, een planvoorstel
dat Push/Pull/Legs heet, en een push-upregel die op "je Push-dag" hangt. Bij full-body op woensdag
klopt daar niets meer van.

Het voorstel noemt dit zelf, in één zin: de schermen "bevatten voorbeelden die nog niet met dit
voorstel overeenkomen". Dat is te licht. Dit is een ontwerpronde, geen tekstcorrectie: de
voorbeelddata, het planvoorstel, het compromisscherm en de push-upregel moeten opnieuw.

**Vraag terug:** benoem expliciet dat dit gebeurt vóór M2, en door wie. Niet door de bouwer, want
dat is precies wat hoofdstuk 6 en 9 van de brief verbieden.

### 3. Push-ups uitstellen is jouw besluit, en de reden klopt maar half

Het argument is dat de regel met een "push-dag" niet past bij full-body. Waar. Maar de conclusie
zou eerder andersom moeten zijn: bij full-body twee keer per week **pers je in elke sessie**, dus
de wisselwerking met dagelijkse push-ups wordt belangrijker, niet minder relevant. De regel moet
herschreven worden, niet geparkeerd.

**Vraag terug:** een nieuwe versie van R8 die bij full-body past — bijvoorbeeld "op een
trainingsdag geen push-ups, de dag erna half" — in plaats van uitstel naar na de basisversie. Als
jij het wél wil uitstellen: prima, maar dan omdat jij dat kiest.

### 4. Het einde van de rust heeft geen kanaal meer

"Live Activities horen niet bij deze standaard-PWA" is technisch correct. Maar daarmee verdwijnt de
oplossing voor precies de bevinding die uit de interactiecheck kwam: je rusttimer loopt af terwijl
je telefoon in je zak zit, en er is niets dat je bereikt. Het voorstel noemt de beperking en laat
het daarbij.

**Vraag terug:** een ontwerpantwoord. Opties: het scherm wakker houden tijdens de rust, de
Notification API waar die werkt, of eerlijk accepteren dat je de app open moet houden en dat in de
interface zeggen. Kies, en leg uit wat je verliest.

### 5. Twee bronverwijzingen, één geverifieerd

De ACSM-pagina bestaat en klopt: gepubliceerd 17 maart 2026, eerste update in zeventien jaar, en
ondersteunt de drie claims die hij eruit haalt — individualisering, alle grote spiergroepen
minstens twee keer per week, en niet elke set tot falen.

De tweede link (PMC12965823) kon ik niet openen; die gaf een botcontrole in plaats van het artikel.
Dat betekent niet dat hij nep is, maar geverifieerd is hij niet.

**Vraag terug:** vervang die link door de position stand zoals die in *Medicine & Science in Sports
& Exercise* staat, met titel en jaar, of laat hem weg. En let op: dit is een bron van buiten de
geleverde documenten. Dat mag, maar dan wel expliciet, zodat later duidelijk is welke regel uit het
handboek komt en welke uit ACSM.

### 6. De UX-regels worden niet bevestigd

Hoofdstuk 6 van de brief stelt drie dingen die makkelijk stuk gaan tijdens het bouwen: sheets zijn
geen aparte routes, er zijn drie verschillende navigatiehandelingen tijdens een sessie, en de
schermteksten worden niet herschreven. Het voorstel raakt alleen de tweede aan, in één
acceptatiecriterium.

**Vraag terug:** een expliciete bevestiging op alle drie.

### 7. Export en verwijderen zakken weg

"Vragen een eigen uitwerking" — maar het is een harde eis uit je productbrief. Zo verdwijnt het
stilletjes uit de planning.

**Vraag terug:** zet het in M6 met een acceptatiecriterium.

### 8. Hoofdstuk 9 van de brief wordt genegeerd

Profiel en instellingen, herstel na langere uitval, het zwakke punt op de arm-dag en toestemming
voor meldingen staan in de brief als "nog niet ontworpen, niet zelf bouwen". Het voorstel noemt ze
niet. Bij full-body vervalt de arm-dag waarschijnlijk, maar de andere drie niet.

**Vraag terug:** bevestig die grens.

### 9. Klein, maar hij heeft gelijk

"Rekenkundig geldt altijd: 3 x 13 = 39." Klopt — mijn 40 was slordig afgerond. Ik pas dat aan in de
brief. De toon van die zin hoort niet in een bouwvoorstel, maar de inhoud is juist.

---

## Wat ik zou antwoorden

> Akkoord op de techniek: React, TypeScript, Vite, Dexie boven IndexedDB, service worker en Cache
> Storage, en Supabase pas wanneer accounts aan de beurt zijn. Akkoord om M1 te bouwen met één
> oefening en echte opslag.
>
> Nog geen akkoord op het trainingsprogramma. Schrijf eerst de intake uit als hoofdstuk 1 van de
> bouwbrief, zodat full-body op woensdag een vastgelegde conclusie wordt in plaats van een aanname.
> De wireframes worden daarna bijgewerkt; bouw ze niet zelf om.
>
> Graag ook: een herschreven push-upregel die bij full-body past, een ontwerpantwoord voor het einde
> van de rust zonder Live Activities, de tweede bron vervangen of verifiëren, export en verwijderen
> in M6, en een bevestiging op hoofdstuk 6 en 9 van de brief.

---

## Wat dit voor jouw kant betekent

Gaat full-body door, dan raakt het deze documenten: de bouwbrief (hoofdstuk 1 en R1, R6, R8), de
wireframes met voorbeelddata, het planvoorstel en het compromisscherm uit de onboarding, de
push-upschermen, en `plan.html`. De interactiecheck blijft geldig: die ging over gedrag, niet over
welk programma eronder ligt.
