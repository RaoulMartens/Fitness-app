# Use cases — persoonlijke trainingsapp

Fase 1 van de ux-flow-designer skill. Afbakening voor deze ronde: **smal en diep** rond
trainen → registreren → afwijken. Onboarding, planvoorstel en progressie zitten er als dunne
rand omheen, zodat zichtbaar is waar de sessie vandaan komt en waar hij in landt.

Bronnen: [B] UX-benchmark, [T1] Hypertrophy Handbook, [T2] PPL-programma, [T4] PPL-xlsx.
UC-010 is later toegevoegd: de invoerkant ontbrak nog, terwijl de brief die expliciet vraagt.
Actoren: **Sporter** (Raoul), **App** (planner + registratie, lokaal), **Sync** (gesimuleerd backend).

---

## Kern

### UC-001 — Sessie van vandaag starten
- **Actoren:** Sporter, App
- **Precondities:** Er is een actief plan; vandaag staat een sessie gepland; plan en oefenuitleg staan lokaal klaar.
- **Hoofdflow:**
  1. Sporter opent de app en ziet de sessie van vandaag als voorkeursactie: **Start training**.
  2. App toont naam, geschatte duur en in één regel de reden. De uitgebreide onderbouwing zit
     achter een uitklapregel, niet standaard in beeld.
  3. Sporter start direct. Wie eerst wil zien wat er komt, kan via **Bekijk sessie** naar het
     sessie-overzicht; dat is een zijpad, geen verplichte stap.
  4. App markeert de sessie als actief en beschermt hem tegen herplanning. [B p.4 — Fitbod-frictie]
  5. App toont de warming-up begeleid, niet administratief: de algemene warming-up is om te lezen,
     alleen de warming-upsets zijn optioneel af te vinken. [T1 p.20; T2 p.3]
- **Alternatieve flows:**
  - A1 Sporter wil vandaag niet deze sessie → uitweg naar "pas vandaag aan" (UC-003/004/005).
  - A2 Er is geen sessie gepland (rustdag) → rustdag krijgt eigen waarde, geen leeg scherm. [B p.18]
  - A3 Een onderbroken sessie staat nog open → App biedt hervatten voor starten (UC-006).
- **Postcondities:** Actieve sessie bestaat lokaal; latere planwijzigingen raken hem niet.

### UC-002 — Set uitvoeren en registreren
- **Actoren:** Sporter, App
- **Precondities:** Sessie is actief; oefening is aan de beurt.
- **Hoofdflow:**
  1. App toont de huidige oefening: setnummer, richtlijn (repbereik, Early/Last set, rust) en het
     **target effort** uit het programma, met de vorige uitvoering ernaast. [B p.3 — Hevy; T1 p.9]
  2. Sporter kan de vorige waarde overnemen of gewicht en reps zelf invullen.
  3. Sporter legt de set vast; App slaat direct lokaal op en start de rusttimer.
  4. App vraagt het **actual effort**: wat de sporter zelf ervoer, apart van het voorschrift.
     Wanneer dat gevraagd wordt — per set, alleen bij de laatste set of achteraf per oefening —
     ligt bewust nog niet vast en moet in de visuele fase getoetst worden.
  5. App toont bij een volle reeks het progressievoorstel: eerst reps opbouwen binnen het bereik, pas bij de bovenkant gewicht erbij. Bij vaste reps: gewicht erbij. [T1 p.11-12]
- **Alternatieve flows:**
  - A1 Sporter wil de demo zien → video speelt inline af met herhaalknop en tekstcues; registratie blijft staan. [T2 p.2; T4 A5]
  - A2 Video ontbreekt of is niet gedownload → cues blijven zichtbaar, App biedt opnieuw downloaden.
  - A3 Sporter corrigeert een eerder vastgelegde set → wijziging zichtbaar, niet stilzwijgend.
  - A4 Sporter slaat een set over → geldt als overgeslagen, niet als mislukt.
  - A5 Er loopt iets mis → Lukt niet, Te zwaar en Minder tijd staan direct bij de oefening,
    als sheet over de context heen. Geen algemeen probleemmenu tijdens het trainen.
- **Postcondities:** Setresultaten staan op het apparaat. Synchroniseren gebeurt stil op de achtergrond.

### UC-003 — Minder tijd vandaag
- **Actoren:** Sporter, App
- **Precondities:** Sessie is gepland of actief.
- **Hoofdflow:**
  1. Sporter meldt minder tijd: vóór de training via "Pas vandaag aan", tijdens de training via de
     knop bij de oefening zelf.
  2. App toont één aangepast voorstel plus wat vervalt of verschuift en wat behouden blijft.
  3. App benoemt dat dit alleen vandaag geldt en het ingeschatte niveau niet verlaagt. [Brief p.2; B p.19 principe 2 en 9]
  4. Sporter accepteert, past aan of wijst af.
- **Alternatieve flows:**
  - A1 Sporter wijst af → oorspronkelijke sessie blijft, geen stille wijziging.
  - A2 Het verzoek past niet → App benoemt het compromis (frequentie, duur of prioriteit) en laat kiezen. [Brief p.1]
- **Postcondities:** Sessie van vandaag is ingekort; plan en doel ongewijzigd; keuze terugdraaibaar.

### UC-004 — Oefening niet mogelijk
- **Actoren:** Sporter, App
- **Precondities:** Sessie actief; oefening is aan de beurt.
- **Hoofdflow:**
  1. Sporter geeft de aanleiding: materiaal bezet, materiaal ontbreekt, of pijn.
  2. App onderscheidt praktische hinder van pijn en stelt geen diagnose. [Brief p.2]
  3. App biedt de twee substituties van het programma, of een andere volgorde bij bezet materiaal. [T1 p.27]
  4. Sporter kiest en geeft aan: alleen vandaag of blijvende voorkeur. [B p.16 — drie niveaus van controle]
- **Alternatieve flows:**
  - A1 Pijn → App biedt overslaan of stoppen, zonder oordeel en zonder inhaalschuld.
  - A2 Geen passend alternatief → oefening vervalt, gevolg zichtbaar in de sessie.
- **Postcondities:** Vervanging vastgelegd met zichtbare reikwijdte (vandaag / blijvend).

### UC-005 — Zwaarder dan verwacht
- **Actoren:** Sporter, App
- **Precondities:** Minstens één set vastgelegd met een RPE boven de richtlijn, of Sporter meldt het zelf.
- **Hoofdflow:**
  1. App vraagt gericht door, alleen wanneer het antwoord de vervolgstap verandert. [B p.7 — TrainerRoad; p.19 principe 6]
  2. Sporter kiest een verklaring: dagvorm, techniek of structureel te zwaar.
  3. App toont wat dit betekent voor de rest van de sessie en voor de komende trainingen.
  4. Bij een tijdelijke aanpassing legt App een duidelijke duur vast en een moment van terugkeer. [B p.6 — Runna]
- **Alternatieve flows:**
  - A1 Sporter spreekt de interpretatie van de App tegen → interpretatie van de Sporter wint.
  - A2 Sporter wil niets veranderen → registratie blijft, plan blijft.
- **Postcondities:** Eén slechte dag wijzigt het langetermijndoel niet ongemerkt.

### UC-006 — Onderbreken, overslaan of hervatten
- **Actoren:** Sporter, App
- **Precondities:** Sessie actief of gepland en niet uitgevoerd.
- **Hoofdflow:**
  1. App onderscheidt drie handelingen die niet door elkaar mogen lopen: een sheet sluiten (raakt
     niets), **minimaliseren** (sessie blijft actief, je komt terug op Vandaag) en de sessie
     **beëindigen**.
  2. Een geminimaliseerde of onderbroken sessie staat bovenaan Vandaag als "Sessie loopt".
  3. Bij terugkeren biedt App verdergaan op de set waar het stopte, met alle ingevoerde waarden.
  4. Beëindigen kan alleen bewust: afronden met wat er is, afbreken, verplaatsen of bewust
     overslaan. Elk met een eigen gevolg. [B p.19 principe 4]
- **Alternatieve flows:**
  - A1 Sporter stelt uit naar een andere dag → App toont het gevolg voor de week, bouwt geen inhaalschuld op. [Brief p.2]
  - A2 Meerdere gemiste sessies → App biedt herzien van het plan als keuze over haalbaarheid, niet als inhaalplicht. [B p.19 principe 9]
- **Postcondities:** Reden en status vastgelegd; niets stilzwijgend verdwenen.

### UC-007 — Sessie afronden en feedback
- **Actoren:** Sporter, App, Sync
- **Precondities:** Sessie is uitgevoerd of afgebroken.
- **Hoofdflow:**
  1. App toont een korte samenvatting: wat is gedaan, wat is veranderd ten opzichte van vorige keer.
  2. App stelt alleen de vraag die een onzekere interpretatie oplost.
  3. App toont wat dit verandert aan de komende trainingen; Sporter accepteert, corrigeert of wijst af.
  4. Synchroniseren gebeurt op de achtergrond. De statussen op apparaat opgeslagen, synchroniseren
     en gesynchroniseerd staan klein in beeld en vragen niets.
- **Alternatieve flows:**
  - A1 Geen verbinding → alles blijft op het apparaat, stil gemarkeerd.
  - A2 Synchronisatie mislukt of dubbelt → dit is het enige moment dat sync de sporter onderbreekt;
    App maakt het herstelbaar, zonder dubbele logs.
  - A3 Login verlopen → lokaal werk blijft staan; opnieuw inloggen is alleen voor synchronisatie.
- **Postcondities:** Sessie afgesloten; gevolgen zichtbaar en corrigeerbaar.

---

### UC-010 — Onboarding en eerste plan
- **Actoren:** Sporter, App, Planner, Sync
- **Precondities:** Eerste keer openen, online, nog geen profiel of plan.
- **Hoofdflow:**
  1. App legt in twee zinnen uit wat er gaat gebeuren: vier vragen, daarna een voorstel.
  2. Sporter beantwoordt vier vragen, één per scherm: doel en prioriteit, ervaring, trainingsdagen
     en tijd per dag, plek en eventuele beperkingen. [Brief p.1]
  3. App vraagt bewust **niet** naar begingewichten. Die leert hij tijdens de eerste sessie kennen.
  4. App stelt een plan samen en toont het voorstel met één regel reden; de onderbouwing zit achter
     een uitklapregel.
  5. Sporter accepteert; App vraagt een account aan zodat het plan bewaard blijft.
  6. App zet de eerste sessie offline klaar en wijst op installeren op het beginscherm.
- **Alternatieve flows:**
  - A1 De wensen passen niet samen → App benoemt het knelpunt en biedt drie uitwegen: langere
    sessies, een extra dag, of een onderdeel minder vaak. De app kiest niet zelf. [Brief p.1]
  - A2 Sporter heeft al een account → direct naar aanmelden.
  - A3 Geen wifi bij de eerste download → trainen kan alsnog; de tekstcues staan er wel.
  - A4 Sporter gaat terug naar een eerdere vraag → antwoorden blijven staan.
- **Postcondities:** Profiel, plan en eerste sessie staan lokaal en bij het account. Het langetermijn-
  doel en de randvoorwaarden staan apart vastgelegd, zodat een drukke dag later het doel niet wijzigt.

### UC-011 — Dagelijkse push-ups
- **Actoren:** Sporter, App
- **Precondities:** Er is een actief programma; de sporter wil elke dag iets doen buiten de zaal om.
- **Hoofdflow:**
  1. Sporter doet eenmalig een testset push-ups tot bijna falen.
  2. App leidt daar een dagdoel uit af: drie sets van ongeveer 40 procent van de max, verspreid over
     de dag. Genoeg om iets te doen, weinig genoeg om het morgen weer te kunnen.
  3. Op Vandaag staat een kaart met het doel en wat er al staat; op een rustdag krijgt die kaart de
     hoofdrol.
  4. Sporter legt per set één tik vast. Meer, minder of niet gelukt kan ook.
  5. App verrekent de belasting met het programma: op een Push-dag slaat hij de push-ups over, de
     dag erna halveert hij het doel. [Brief p.1, bewaken van volgorde, herstel en totale belasting]
  6. Elke drie weken vraagt App om een nieuwe testset. Gaat de max omhoog, dan gaat het dagdoel mee.
- **Alternatieve flows:**
  - A1 Nog geen max bekend → App vraagt eerst om de testset en toont geen doel dat hij niet kan
    onderbouwen.
  - A2 Sporter haalt het doel niet → telt als gemiste dag in consistentie, zonder oordeel en zonder
    inhaalschuld.
  - A3 App slaat een dag over wegens de Push-training → dat telt niet als gemist; het was een besluit
    van de app.
- **Postcondities:** De dag is afgevinkt in **Volgehouden**. De max in één set staat bij
  **oefenprestatie**. Die twee worden nooit opgeteld: een streak bewijst geen ontwikkeling.
  [B p.19, principe 7]

## Dunne rand

### UC-008 — Plan en trainingsdagen begrijpen en bijstellen
Sporter opent het plan, ziet waarom de verdeling zo is en welke aannames eronder zitten, en past
trainingsdagen of tijd per dag aan. App herplant met zichtbaar gevolg en overschrijft geen eigen
aanpassingen of actieve sessie. Het PPL-programma loopt in een cyclus van tien dagen; dat is input,
geen verplichte indeling. [Brief p.1; T2 p.2]

### UC-009 — Vooruitgang bekijken
Sporter bekijkt vier gescheiden dingen, nooit als één score: **consistentie** (gepland versus
uitgevoerd), **oefenprestatie** (gewicht en reps per oefening, zelfde variant), **ontwikkeling van
het trainingsplan** (waar het programma staat: repbereiken, gewichtsverhogingen, blok en week) en
**herstel en context** (actual effort, lichaamsgewicht als context, omstandigheden).

Geen samengestelde doelontwikkeling: de bronnen onderbouwen niet dat spiergroei of vetverlies uit
gewicht en reps af te leiden is. Bij weinig data zegt App eerlijk dat een trend nog niet te bepalen
is. [Brief p.3; B p.19 principe 7]

---

## Doorlopende toestanden (in alle use cases)
Leeg (nog geen historie), offline, downloadstatus van video's, synchronisatiestatus, en fout of
conflict. Dit zijn **systeemstates**, geen bestemmingen: ze horen niet in de gewone navigatie en
onderbreken alleen bij een echt probleem. In het prototype zijn ze los te bekijken via een blok
onderaan Vandaag dat als prototypenavigatie gemarkeerd staat.

## Drie informatieniveaus
Overal waar de app iets uitlegt, gelden drie niveaus: (1) de actie of het cijfer zelf, (2) één regel
reden eronder, (3) de uitgebreide onderbouwing pas op verzoek. Hoeveel er standaard zichtbaar moet
zijn is een open ontwerpvraag voor de visuele fase.

## Wat dit prototype niet bewijst
Gesimuleerd: planning, login, synchronisatie en registratie. De statische HTML bewaart geen
lokale invoer. De beschreven trainingsregels bevatten bronprincipes en productkeuzes en zijn
hier UX-gedrag, geen gevalideerd algoritme. Zie bouwbrief.md en bouwvoorstel.md voor de correcties.
De benchmark levert
hypotheses, geen geteste effecten.
