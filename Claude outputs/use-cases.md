# Use cases — persoonlijke trainingsapp

Fase 1 van de ux-flow-designer skill. Afbakening voor deze ronde: **smal en diep** rond
trainen → registreren → afwijken. Onboarding, planvoorstel en progressie zitten er als dunne
rand omheen, zodat zichtbaar is waar de sessie vandaan komt en waar hij in landt.

Bronnen: [B] UX-benchmark, [T1] Hypertrophy Handbook, [T2] PPL-programma, [T4] PPL-xlsx.
Actoren: **Sporter** (Raoul), **App** (planner + registratie, lokaal), **Sync** (gesimuleerd backend).

---

## Kern

### UC-001 — Sessie van vandaag starten
- **Actoren:** Sporter, App
- **Precondities:** Er is een actief plan; vandaag staat een sessie gepland; plan en oefenuitleg staan lokaal klaar.
- **Hoofdflow:**
  1. Sporter opent de app en ziet de sessie van vandaag als voorkeursactie.
  2. App toont naam, geschatte duur, oefeningen in volgorde en de reden voor deze sessie in één regel.
  3. App toont de status van de voorbereiding: opgeslagen op toestel, video's klaar.
  4. Sporter start de sessie; App markeert hem als actief en beschermt hem tegen herplanning. [B p.4 — Fitbod-frictie]
  5. App toont de warming-up (algemeen + oefening-specifiek) als af te vinken stap. [T2 p.3]
- **Alternatieve flows:**
  - A1 Sporter wil vandaag niet deze sessie → uitweg naar "pas vandaag aan" (UC-003/004/005).
  - A2 Er is geen sessie gepland (rustdag) → rustdag krijgt eigen waarde, geen leeg scherm. [B p.18]
  - A3 Een onderbroken sessie staat nog open → App biedt hervatten voor starten (UC-006).
- **Postcondities:** Actieve sessie bestaat lokaal; latere planwijzigingen raken hem niet.

### UC-002 — Set uitvoeren en registreren
- **Actoren:** Sporter, App
- **Precondities:** Sessie is actief; oefening is aan de beurt.
- **Hoofdflow:**
  1. App toont de huidige oefening: setnummer, richtlijn (reps-bereik, Early/Last set, RPE, rust) en de vorige uitvoering ernaast. [B p.3 — Hevy; T1 p.9]
  2. Sporter kan de vorige waarde overnemen of gewicht en reps zelf invullen.
  3. Sporter legt de set vast; App slaat direct lokaal op en start de rusttimer.
  4. Bij de laatste set vraagt App de ervaren zwaarte (RPE, met korte uitleg).
  5. App toont bij een volle reeks het progressievoorstel: eerst reps opbouwen binnen het bereik, pas bij de bovenkant gewicht erbij. Bij vaste reps: gewicht erbij. [T1 p.11-12]
- **Alternatieve flows:**
  - A1 Sporter wil de demo zien → video speelt inline af met herhaalknop en tekstcues; registratie blijft staan. [T2 p.2; T4 A5]
  - A2 Video ontbreekt of is niet gedownload → cues blijven zichtbaar, App biedt opnieuw downloaden.
  - A3 Sporter corrigeert een eerder vastgelegde set → wijziging zichtbaar, niet stilzwijgend.
  - A4 Sporter slaat een set over → geldt als overgeslagen, niet als mislukt.
- **Postcondities:** Setresultaten staan lokaal, gemarkeerd als nog te synchroniseren.

### UC-003 — Minder tijd vandaag
- **Actoren:** Sporter, App
- **Precondities:** Sessie is gepland of actief.
- **Hoofdflow:**
  1. Sporter meldt: minder tijd, met hoeveel.
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
  1. Sporter stopt of sluit de app halverwege; App bewaart de sessie lokaal als onderbroken.
  2. Bij heropenen biedt App hervatten op de set waar het stopte, met alle ingevoerde waarden.
  3. Sporter kiest: hervatten, afronden met wat er is, of afbreken.
  4. App onderscheidt uitstellen, bewust overslaan, afbreken en hervatten als aparte gebeurtenissen met eigen gevolg. [B p.19 principe 4]
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
  4. Resultaten gaan naar de wachtrij voor synchronisatie; status blijft zichtbaar.
- **Alternatieve flows:**
  - A1 Geen verbinding → alles blijft lokaal, duidelijk gemarkeerd als nog te synchroniseren.
  - A2 Synchronisatie mislukt of dubbelt → App maakt het herstelbaar, zonder dubbele logs.
  - A3 Login verlopen → lokaal werk blijft staan; opnieuw inloggen is alleen voor synchronisatie.
- **Postcondities:** Sessie afgesloten; gevolgen zichtbaar en corrigeerbaar.

---

## Dunne rand

### UC-008 — Plan en trainingsdagen begrijpen en bijstellen
Sporter opent het plan, ziet waarom de verdeling zo is en welke aannames eronder zitten, en past
trainingsdagen of tijd per dag aan. App herplant met zichtbaar gevolg en overschrijft geen eigen
aanpassingen of actieve sessie. Het PPL-programma loopt in een cyclus van tien dagen; dat is input,
geen verplichte indeling. [Brief p.1; T2 p.2]

### UC-009 — Vooruitgang bekijken
Sporter bekijkt consistentie (gepland versus uitgevoerd), prestaties (gewicht en reps per oefening,
zelfde variant), doelontwikkeling en herstel als **vier gescheiden dingen**, nooit als één score.
Bij weinig data zegt App eerlijk dat een trend nog niet te bepalen is. [Brief p.3; B p.19 principe 7]

---

## Doorlopende toestanden (in alle use cases)
Leeg (nog geen historie), offline, downloadstatus van video's, synchronisatiestatus, en fout of
conflict. Deze worden in fase 2 als state diagrams uitgewerkt en in fase 3 als aparte schermen
of schermvarianten getoond.

## Wat dit prototype niet bewijst
Gesimuleerd: planning, login en synchronisatie. Echt: lokaal bewaarde invoer. De trainingsregels
komen uit T1/T2 en zijn hier UX-gedrag, geen gevalideerd algoritme. De benchmark levert
hypotheses, geen geteste effecten.
