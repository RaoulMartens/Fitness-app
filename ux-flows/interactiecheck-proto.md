# Interactiecheck — prototype public/proto

19 september 2026. Nagelopen: het low-fi prototype op `localhost:5174`.

## 1. Wat er nagelopen is

**Schermen.** `vandaag`, `vandaag-hervatten`, `vandaag-rustdag`, `sessie`, `sessie-rust`,
`aanpassen`, `afronden`, `klaar`, `programma-oefening`, `sessie-kop` (variantenblad).
Elk bestand is gelezen, niet alleen de index.

**Kerninteracties.**

1. Een set vastleggen — gewicht en herhalingen invoeren en bevestigen.
2. Een sessie starten of hervatten.
3. Een oefening aanpassen terwijl je bezig bent.
4. Een sessie afronden.
5. Begrijpen wat een oefening is en waarom hij er staat.

**Gebruikscontext.** Eén gebruiker, in een sportschool, staand bij een apparaat. Telefoon in
één hand, vaak zweterige vingers. Tussen sets, met een hartslag die nog omlaag moet. Rumoerig,
dus geluid is onbetrouwbaar. Offline mogelijk; alles staat lokaal op het toestel.

## 2. De belangrijkste bevindingen

### B1 · blokkerend — de kernhandeling is niet ontworpen

`sessie.html`. De tabel toont `35` en `—` in vakjes, maar nergens is ontworpen hóé je die
waarde verandert. Geen toetsenbord, geen stapknoppen, geen actieve staat van een veld. De set
kan dus niet worden ingevuld.

Dit weegt extra zwaar omdat we `te zwaar` en `te licht` uit de aanpassen-sheet hebben gehaald
mét het argument dat je het getal gewoon in de tabel wijzigt. Die redenering klopt alleen als
dat wijzigen ook echt getekend is.

### B2 · blokkerend — het oefeningscherm is onbereikbaar

`programma-oefening.html` bestaat, maar geen enkel scherm linkt ernaartoe. De videoregel die
dat deed is weggehaald toen de video full width werd. Vanuit `sessie` kom je er niet, vanuit
`vandaag` gaat de link naar `programma-dag.html` dat nog niet bestaat.

Daarmee is de vijfde kerninteractie — begrijpen waarom je iets doet — feitelijk afwezig,
terwijl dat het onderscheidende deel van dit product is.

### B3 · frictie — geen enkele bevestiging dat er iets bewaard is

Nergens in de flow staat dat je invoer veilig is. De oude app zei `Alles bewaard`. Als je
telefoon uitvalt tussen set 7 en 8 weet je niet of je werk er nog is. In een app die bewust
alleen lokaal opslaat, is dat de grootste onzekerheid die je kunt laten bestaan.

### B4 · gemiste kans — rust vraagt om je ogen, precies als je die niet hebt

`sessie-rust.html`. De aftelling is puur visueel. Tussen sets leg je je telefoon neer, drink
je, kijk je om je heen. De enige manier om te weten dat je rust voorbij is, is kijken. Trilling
is de voor de hand liggende modaliteit en is nergens belegd.

### B5 · frictie — na een aanpassing zegt het systeem niets

`aanpassen.html`. Alle drie de opties gaan terug naar `sessie.html`, dat er identiek uitziet.
Je koos iets, er gebeurde zichtbaar niets. In het echte product moet daar een zichtbaar gevolg
staan; in het prototype kan dat nu niet getoetst worden.

## 3. Per bril

### 1. Mens-product-interactiemodel

Per kerninteractie, input en output:

| Interactie | Input van de gebruiker | Andere input | Output van het systeem |
| --- | --- | --- | --- |
| Set vastleggen | gewicht, herhalingen, bevestiging | vorige prestatie, richtbereik | **ontbreekt** — alleen een statisch vinkje |
| Hervatten | keuze verder of afronden | tijd sinds onderbreking, voortgang | kaart met balkjes en tijdsindicatie |
| Aanpassen | één keuze uit drie | positie in de sessie | **ontbreekt** |
| Afronden | bevestiging | aantal gedane sets | telling van wat je laat liggen |
| Oefening begrijpen | openen | — | cijfers, spiergroep, video |

Het is grotendeels eenrichtingsverkeer: de gebruiker duwt, het systeem toont. De enige echte
wisselwerking zit in `klaar.html`, waar wat je deed het voorstel voor de volgende keer stuurt.
Dat is het sterkste stuk van het ontwerp.

Niet-menselijke input wordt goed benut op `vandaag-hervatten` (tijd sinds onderbreking) en in
de rustaftelling (eindtijd). Verbinding en accu worden nergens gebruikt, terwijl offline
gebruik een uitgangspunt is.

### 2. Modaliteiten

Alles is visueel. Zien wordt gevraagd op momenten dat het oog beschikbaar is — tijdens invoer —
maar ook op het moment dat het dat niet is: het einde van de rust. Zie B4.

Horen is bewust uitgesloten: de video staat stil, en in een sportschool is geluid onbetrouwbaar.
Dat is een verdedigbare keuze. Voelen is niet uitgesloten maar ook niet gebruikt, en dat is een
gat: trilling werkt door je broekzak heen en stoort niemand anders.

### 3. Conversational design

Uitgeschreven als gesprek verloopt de sessie zo:

> **App:** Chest press. Hierna Zittende row. Vorige keer 35 kilo, tien keer.
> **Jij:** *(vult in)* 35, elf keer.
> **App:** *(zwijgt)*
> **Jij:** Vastleggen.
> **App:** Rust, 1:23.

Het systeem zwijgt precies op het moment dat een mens iets zou zeggen: na jouw invoer. Geen
"genoteerd", geen "dat is er één meer dan vorige keer". Pas aan het eind, op `klaar`, begint
het te praten — en dan meteen goed.

Het systeem vraagt niets dat het al weet. Dat is netjes: de kolom `Vorige` vult zichzelf, en
er is geen intake die je dingen vraagt die al vastliggen.

### 4. Useful & usable

**Useful.** Ja, voor de hoofdtaak. De app helpt je precies één ding: vandaag trainen volgens je
schema en vastleggen wat je deed. Alles wat daar niet aan bijdraagt is eruit gesloopt.
De koppeling naar de volgende keer (`klaar`) maakt het nuttiger dan een logboek.

**Usable.** Deels. De schermen zijn rustig en de hiërarchie klopt. Maar de centrale handeling
is niet bedienbaar (B1), en het scherm dat het "waarom" draagt is niet te bereiken (B2). Dus:
bruikbaar in opzet, niet bruikbaar in uitvoering.

### 5. Conceptual & mental models

Het uitgestraalde model is: *een sessie is een lijst oefeningen, elke oefening is een rijtje
sets, je vinkt ze af.* Dat sluit goed aan bij hoe iemand met een papieren schema denkt.

Er lekt weinig techniek naar de oppervlakte. Geen synchronisatiestatus, geen versies, geen
"opgeslagen in IndexedDB". Dat is winst ten opzichte van de oude app, waar `Op dit apparaat`
en `Ontwikkelversie · offline app via preview` gewoon in beeld stonden.

Eén term wringt: `W` in de eerste setrij. Dat is het implementatiemodel — het systeem noemt het
een warming-upset — en de gebruiker moet zelf raden waar de W voor staat. Zie ook bril 6.

### 6. Discoverability

**Affordances.** De tabelvakjes zien eruit als velden en zijn dat niet. Dat is een valse
affordance: het ontwerp belooft bewerkbaarheid die er niet is.

**Signifiers.** Sterk waar ze er zijn: de doorgetrokken rand om de actieve setrij, het dikke
vinkje voor gedaan, de donkere kop tijdens rust. Zwak bij `W`, bij `Overslaan ›` (een chevron
belooft navigatie, niet een actie) en bij de balkjes, die geen enkel signaal geven of je erop
kunt tikken — nu terecht, want dat kan niet meer.

**Constraints.** Vrijwel afwezig. Niets houdt tegen dat je 3500 kilo invult of 0 herhalingen.
Bij een lege set is onduidelijk of vastleggen mag.

**Mappings.** Goed. De aanpassen-sheet komt van onderen en wordt van onderen aangeroepen.
De balkjes lopen van links naar rechts zoals de sessie loopt. Het derde balkje vult zich op het
moment dat je de derde oefening afmaakt.

**Feedback.** De zwakste van de vijf. Zie B3 en B5.

**Visuele hiërarchie.** Op `vandaag-hervatten` klopt hij nu: context klein, onderwerp groot,
voortgang visueel, detail klein, actie groot. Op `sessie` is de grootste knop ook de
belangrijkste handeling. Op `klaar` trekt de verandering van het gewicht terecht de aandacht.

### 7. Cognitieve belasting

Per scherm tellen wat tegelijk om aandacht vraagt:

| Scherm | Dingen tegelijk | Oordeel |
| --- | --- | --- |
| `vandaag` | 3 | rustig |
| `vandaag-hervatten` | 5 | past |
| `sessie` | 5 (kop, video, tabel, knop, twee links) | bovengrens |
| `aanpassen` | 3 opties | rustig |
| `klaar` | 1 + 3 kaarten | past |
| `programma-oefening` | 5 | bovengrens |

Wat de gebruiker moet onthouden tussen stappen: bijna niets. Het richtbereik `8–12` is uit het
sessiescherm gehaald, dus je moet zelf weten of elf herhalingen goed is. De kolom `Vorige`
vangt dat deels op, maar niet helemaal — daar staat wat je deed, niet wat je moet halen.

Zelf uitrekenen hoeft nergens, behalve dat `Vorige` `35 × 10` twee getallen in één cel propt
terwijl er twee kolommen naast staan.

### 8. Zeven fasen van actie — een set vastleggen

| Fase | Wat er gebeurt | Kloof |
| --- | --- | --- |
| Doel | "ik heb net elf keer geduwd met 35 kilo" | — |
| Intentie | dat vastleggen | duidelijk |
| Keuze | welke vakjes, welke knop | **breed** — het herhalingenvak toont `—` en nodigt niet uit |
| Uitvoering | tikken, typen, bevestigen | **breed** — niet ontworpen |
| Verandering | set staat vast, rust begint | gebeurt |
| Waarnemen | kop wordt donker, rij krijgt vinkje | goed |
| Interpreteren | "hij loopt, ik mag rusten" | goed |
| Evalueren | "is het bewaard? was elf goed?" | **breed** — geen bevestiging, geen oordeel |

De kloof van uitvoering is het breedst en dat is precies B1. Daarna volgt de kloof van
evaluatie: je ziet dát er iets gebeurde, niet dat het veilig is of dat het goed was.

### 9. Design patterns & guidelines

Gebruikte patronen: bottom sheet, tabbalk, segmented progress, tabel met rijen, bevestigings-
sheet voor een handeling met verlies. Allemaal consistent toegepast.

Twee dingen tegen Apple's Human Interface Guidelines:

- **Aanraakdoelen.** HIG houdt 44×44 punten aan. De knoppen en sheetopties halen dat. `Overslaan ›`
  in de rustkop niet: dat staat in een regel van 26 punten hoog. Ook de balkjes zijn 6 punten;
  dat gaf eerder aanleiding tot een vergroting die daarna weer is teruggedraaid — terecht, want
  er valt nu niets meer op te tikken.
- **Modaliteit.** De tabbalk verdwijnt tijdens de sessie. Dat volgt de richtlijn voor modale
  taken netjes: je bent ergens in, en er is één weg eruit. Bewuste, goede afwijking van het
  "tabs staan altijd" patroon.

### 10. UI Stack

| Scherm | Ideal | Empty | Error | Partial | Loading |
| --- | --- | --- | --- | --- | --- |
| `vandaag` | ✓ | — | — | — | — |
| `vandaag-hervatten` | ✓ | n.v.t. | — | ✓ (dit ís de partial) | — |
| `vandaag-rustdag` | ✓ | ✓ (bewust leeg, met vooruitblik) | — | — | — |
| `sessie` | ✓ | — (eerste sessie ooit: alle `Vorige` leeg) | — | — | — |
| `sessie-rust` | ✓ | n.v.t. | — | — | — |
| `aanpassen` | ✓ | n.v.t. | — | — | — |
| `afronden` | ✓ | n.v.t. | — | — | — |
| `klaar` | ✓ | — (sessie zonder enige set) | — | — | — |
| `programma-oefening` | ✓ | — (nog nooit gedaan: geen `laatste`) | — | — | — |

Vier van de vijf kolommen zijn vrijwel leeg. De belangrijkste ontbrekende toestanden:

- **Empty bij `sessie`.** De allereerste sessie heeft geen historie. De kolom `Vorige` staat dan
  zeven keer op `—`, en `programma-oefening` heeft geen `laatste gewicht`. Juist dan heb je
  houvast nodig, en juist dan geeft het ontwerp het minst.
- **Error.** Opslag kan mislukken, de video kan ontbreken, de schatting `nog ongeveer 35 minuten`
  kan er niet zijn. Nergens ontworpen.
- **Loading.** Zeven video's op een sportschool-wifi. Een video die niet laadt is de meest
  waarschijnlijke lege plek in het hele scherm.

Dit is het grootste gat van de hele check, en het is ook het makkelijkst te dichten.

### 11. Spatial & transitional

Het ruimtelijke model klopt grotendeels:

- `aanpassen` en `afronden` komen van onderen en worden onderin aangeroepen. Ze horen ook naar
  onderen te verdwijnen. Consistent.
- `programma-oefening` gebruikt `‹ Terug` linksboven, dus het ligt rechts van waar je vandaan
  kwam. Dat klopt — maar het is nu alleen vanuit `sessie` gelinkt, terwijl het scherm bij
  Programma hoort. Dan moet Terug terug naar Programma, en vanuit de sessie hoort het eerder
  van onderen te komen, als sheet. Dit moet gekozen worden.
- De sessie ligt "in" Vandaag: tabs weg, geen terugpijl. Dat betekent dat er geen weg terug is
  zonder af te ronden. Bewust, maar het maakt B2 erger: je kunt tijdens een sessie niets opzoeken.

### 12. Microinteracties

**Set vastleggen.** Trigger: de knop. Regels: onbekend — mag je met een leeg herhalingenveld
vastleggen? Feedback: vinkje en donkere kop. Loops en modes: veertien keer per sessie, en de
laatste keer zou geen rust meer moeten starten maar naar afronden moeten leiden. Dat laatste is
niet ontworpen; `sessie-rust` biedt gewoon weer `Verder met Zittende row`.

**Rust.** Trigger: automatisch na vastleggen. Regels: 2:00, per oefening instelbaar via
`programma-oefening`. Feedback: aftelling in de kop. Ontbreekt: wat er gebeurt bij nul. Modes:
de app kan ondertussen op de achtergrond staan — dan is er helemaal geen feedback.

**Oefening aanpassen.** Trigger: tekstlink onderin. Regels: drie keuzes met elk een genoemd
gevolg — dit is goed gedaan, elke optie zegt wat er verandert. Feedback: geen. Zie B5.

### 13. UX copy

| Moment | Waar | Oordeel |
| --- | --- | --- |
| Motivatie vóór | `vandaag`: "Start training" | duidelijk, zegt wat er gebeurt |
| Instructie tijdens | `sessie`: kolomkoppen `Set Vorige Kg Herh` | kort en helder, behalve `W` |
| Feedback erna | — | ontbreekt |
| Bevestiging | `afronden`: "Je hebt 5 van de 14 sets gedaan… Wat je hebt ingevuld blijft bewaard." | sterk: benoemt verlies én wat veilig is |
| Resultaat | `klaar`: "Twee sets op 11 en 10 herhalingen gehaald, bovenkant van je bereik." | sterk: zegt wat je deed en wat daaruit volgt |

Twee losse dingen:

- De knop op `klaar` heet `Klaar`, net als de schermtitel. Een knop hoort te zeggen wat er
  gebeurt, niet waar je bent. `Terug naar Vandaag` is preciezer.
- `Toch nu trainen` op `vandaag-rustdag` start een ongeplande sessie zonder enige bevestiging,
  terwijl afronden er wel een heeft. Scheef: de onomkeerbare handeling vraagt bevestiging, de
  handeling die je herstelplanning doorkruist niet.

## 4. Alternatieve interacties

De twee zwakste kerninteracties zijn **een set vastleggen** en **rust**.

### Een set vastleggen

**Alternatief 1 — invoer met stappen naast het veld.**
Je tikt op het gewichtvak, het toetsenbord komt op, en boven het toetsenbord staan `−2,5` en
`+2,5`. Herhalingen krijgen `−1` en `+1`. De ✓ per rij legt vast.
*Wint:* vertrouwd, precies, werkt met natte vingers omdat de stapknoppen groot zijn.
*Verliest:* het toetsenbord eet het halve scherm, inclusief de video.
*Past bij:* iemand die zijn gewichten fijnmazig stuurt en per set afwijkt.

**Alternatief 2 — bevestigen in plaats van invoeren.**
De rij staat al ingevuld met wat je vorige keer deed. De grote knop zegt `Zoals vorige keer:
35 kg, 10 keer`. Klopte het niet, dan tik je de rij aan en corrigeer je.
*Wint:* de meeste sets kosten nul invoer. Eén tik met één hand, zonder toetsenbord.
*Verliest:* het nodigt uit om niet na te denken, en je bouwt makkelijk maanden hetzelfde gewicht.
*Past bij:* een vast schema waar je meestal herhaalt wat je deed — precies dit programma.

**Alternatief 3 — de telefoon blijft in je zak.**
Je legt de set vast met een fysieke knop: volume omlaag, of een tik op je oortje. De app neemt
aan dat je het richtaantal haalde en noteert dat. Afwijken doe je achteraf, op `klaar`.
*Wint:* je hoeft je telefoon niet aan te raken tussen sets; geen zweet op je scherm.
*Verliest:* je legt vast wat je zou moeten doen, niet wat je deed. Nauwkeurigheid inleveren.
*Past bij:* drukke sportschool, koud weer, of iemand die zijn telefoon niet wil vasthouden.

### Rust

**Alternatief 1 — trilling in plaats van kijken.**
Bij nul trilt de telefoon twee keer. Het scherm hoeft niet aan te staan, de app mag op de
achtergrond.
*Wint:* de enige modaliteit die werkt terwijl je niet kijkt en niemand stoort.
*Verliest:* werkt niet als de telefoon op een bankje ligt in plaats van in je zak.
*Past bij:* standaardgebruik in een rumoerige ruimte.

**Alternatief 2 — geen timer, maar meten.**
De app telt niet af. Hij registreert alleen hoe lang je er daadwerkelijk over deed en zegt dat
achteraf: "je rustte gemiddeld 2:40". Jij bepaalt wanneer je begint.
*Wint:* geen enkele onderbreking, geen scherm dat om aandacht vraagt, minder gehaast gevoel.
*Verliest:* rusttijd is een trainingsvariabele; zonder sturing zwabbert die alle kanten op.
*Past bij:* iemand die op gevoel traint en niet op de klok.

**Alternatief 3 — de volgende set komt naar je toe.**
Als de rust voorbij is, verandert het scherm vanzelf: de volgende setrij springt open en wordt
actief. Geen melding, geen knop — het scherm is simpelweg klaar voor je als jij terugkijkt.
*Wint:* geen handeling nodig, en het scherm vertelt je de toestand zonder alarm.
*Verliest:* als je niet kijkt, merk je niets. Werkt alleen samen met alternatief 1.
*Past bij:* combinatie met trilling, als visuele helft van hetzelfde signaal.

## 5. Open vragen

Wat deze check niet kan beslissen en met gebruik getoetst moet worden:

1. **Is `Vorige` genoeg houvast zonder het richtbereik?** Nu staat `8–12` alleen op het
   oefeningscherm. Of dat tijdens de set gemist wordt, weet je pas na een paar sessies.
2. **Klopt de schatting `nog ongeveer 35 minuten`?** Die belofte staat op twee plekken. Zit de
   app er structureel naast, dan is geen getal beter dan een fout getal.
3. **Hoe vaak gebruik je de aanpassen-sheet echt?** Drie opties is nu de aanname. Misschien
   gebruik je er één, en hoort die één gewoon in het sessiescherm.
4. **Kijk je de video tijdens de sessie, of één keer en daarna nooit meer?** Daar hangt van af
   of de video full width in de sessie hoort of alleen op het oefeningscherm.
5. **Is het teruggeven van de rustinstelling naar Programma vervelend in de praktijk?** Bij een
   apparaat dat bezet is wil je misschien tér plekke korter rusten.
