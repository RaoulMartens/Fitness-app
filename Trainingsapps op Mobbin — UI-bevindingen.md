# Trainingsapps op Mobbin — UI-bevindingen

2026-09-18 · @Raoul

## Methode en wat Mobbin gratis wél geeft

Een gratis Mobbin-account toont **6 screens per zoekopdracht**; Flows zijn geblurd en de keyword-filter ("Deep Search") zit achter Pro (€8–10 per maand). Op een app-pagina zijn dat altijd dezelfde zes, meestal onboarding.

De workaround die wél werkt: zet **de appnaam én de feature samen in de AI-zoekbalk**. Elke andere formulering levert zes ándere screens van diezelfde app op. Zo zijn alle bevindingen hieronder verzameld.

Twee beperkingen om te onthouden:

- **Strong staat niet in de Mobbin-library.** Zoeken op "Strong" geeft alleen Peloton Strength+. De vergelijking Hevy ↔ Strong kan hier dus niet gemaakt worden.
- Van de trainings- en voedingsapps zijn alleen **Hevy, Fitbod, MacroFactor, Lifesum, Future Pro, Noom, Garmin Connect en Oura** ontgrendeld. Ladder, Fitplan en pushr zitten op slot.

De screenshots blijven in de browser en zijn niet als bestand mee te geven. De zoekopdrachten in dit document zijn wel reproduceerbaar.

## Hevy — actieve workout

De rust-timer is geen van beide opties: niet vast onderaan en niet als overlay. Het is een **inline regel in de kop van elk oefeningblok** — blauw, `⏱ Rest Timer: 2min 30s`, per oefening instelbaar. Een ander scherm toont dezelfde regel als `Rest Timer: OFF`. De lopende countdown zit achter het wekker-icoon in de header en kwam in de gratis set niet in beeld; wel gevonden is een aparte sheet "Select Timer Sound" (Default, Alarm, Futuristic, Ting Ting, Boxing Bell).

**Alle sets van de actieve oefening staan tegelijk in beeld**, geen carrousel. Vier rijen zichtbaar (W, 1, 2, 3) plus `+ Add Set`, en dat blijft zo met het toetsenbord open.

De settabel:

| Kolom | Inhoud |
| --- | --- |
| SET | `W` voor warming-up in goud, daarna 1, 2, 3 genummerd |
| PREVIOUS | Grijs, waarde van vorige keer, `-` als er geen historie is |
| KG | Invoerveld, actief veld krijgt een verticale mini-slider |
| REPS | Invoerveld |
| ✓ | Vinkje om de set af te vinken |

Rijen hebben zebra-striping. De header bevat een chevron om de oefening in te klappen, de verstreken tijd (`3min 0s`), het wekker-icoon en een blauwe Finish-knop.

**De vorige-keer-waarde staat ernaast, in een eigen kolom** — niet als placeholder in het invoerveld. Dat is de belangrijkste observatie voor jouw invoerontwerp.

Invoer gebeurt via het iOS-numpad, met daarboven een toolbar met twee knoppen: "Calculator" (opent een plate calculator als sheet, met schijfgewichten en bar-keuze) en een toetsenbord-dismiss. Boven de tabel staat nog een vrije notitieregel per oefening ("Knees felt a little wobbly on the way up").

## Fitbod — oefening-detail

Fitbods oefening-detail **opent op data, niet op uitleg**. Van boven naar beneden: grote titel ("Ab Crunch Machine"), rechtsboven een kleine thumbnail (foto van de machine met een anatomie-figuurtje eroverheen), dan "Projected 1 Rep Max Record" met een area-chart, daaronder Weight Record / Volume Record / Repetition Record, en onderaan "EXERCISE HISTORY".

De eigenlijke uitleg zit achter de rode **ⓘ** rechtsboven — één niveau dieper dan het detailscherm zelf.

Waar de uitleg-onderdelen zitten:

- **Tekst.** Niet op het detailscherm. Het "waarom" is uitbesteed aan een **help-center webview in de app**: een artikel "How Fitbod Recommends Weight to New Users" met breadcrumb, zoekveld en Follow-knop. Native uitleg is dus dunner dan verwacht.
- **Spierdiagram.** Zit niet in het detail, maar in een eigen **Muscle Recovery**-tab: Main en Accessory muscle groups als lijst, per spier een figuurtje met die spier gemarkeerd plus een herstelpercentage (100%, 50%).
- **Video.** Niet aangetroffen in de vrije screens. Wel een foto of illustratie per oefening in de workout-lijst en als thumbnail in het detail.
- **Diepte.** Ondiep op het scherm zelf, diep zodra je doorklikt — maar die diepte is een support-artikel, geen ontworpen schermlaag.

## MacroFactor — en waar voeding wél naast training staat

MacroFactor doet **geen training**. Het is puur voedings- en gewichtslogging, dus voor de vraag "hoe zit voeding naast training in één app" is het het verkeerde voorbeeld.

De tabbar is `Dashboard | Food Log | (+) | Strategy | More`; **Dashboard is de hoofdtab**. Daarop staan Energy Balance (Nutrition − Expenditure = Difference, met een 30-daagse balkgrafiek), Body Metrics en een Nutrition-blok met calorieën, eiwit, vet en koolhydraten.

De log-flow is strak opgebouwd: een segmented row `Scan / Search / AI / Quick Add / Library` boven de zoekresultaten, resultaten gesplitst in Common en Branded, en per item een scherm met **"Impact on Targets"** — hoeveel procent van je dagdoelen dit item opeet (5% cal, 7% protein) — vóór je opslaat. Dat laatste is het patroon dat het meest overdraagbaar is: consequentie tonen op het moment van invoeren.

Twee apps in de ontgrendelde set combineren voeding en training wél:

| App | Hoofdstructuur | Hoe voeding en training samenkomen |
| --- | --- | --- |
| Future Pro | `Home / Progress / Messages / Friends / Profile` | Progress-tab met Goals en Metrics; "Workout Consistency" als kalender-heatmap naast de doelen |
| Noom | `Today / Health / Success kit` | Één dagscherm waarop movement-logging en nutrition naast elkaar staan, met een "Completed movement"-blok en macro-breakdown |

## De vier patronen naast elkaar

| Patroon | Hevy | Fitbod | MacroFactor |
| --- | --- | --- | --- |
| Vorige-keer-waarde | Eigen kolom `PREVIOUS` naast het invoerveld, grijs | Niet in de settabel; historie zit in het oefening-detail | Niet van toepassing |
| Rust-timer | Inline regel per oefening, instelbaar of `OFF`; countdown achter wekker-icoon | Niet aangetroffen in de vrije screens | Niet van toepassing |
| Sets in beeld | Alle sets tegelijk, 4 rijen plus `+ Add Set` | Sets per oefening als regel (`4 sets • 10 reps • 50 lb`) in de workout-lijst | Niet van toepassing |
| Uitleg-diepte | `How to`-tab in het oefening-detail, naast Summary / History / Leaderboard | Achter de ⓘ; het waarom in een help-center webview | Uitleg als "Impact on Targets" op het invoermoment |

Hevy zet uitleg dus *naast* de data (vier tabs op gelijk niveau: Summary, History, How to, Leaderboard), Fitbod zet uitleg *achter* de data. Dat is het duidelijkste verschil tussen de twee.

## Wat dit betekent voor de trainingsapp

Drie dingen zijn na dit rondje beslisbaar:

1. **Vorige-keer-waarde krijgt een eigen kolom, geen placeholder.** Hevy laat zien dat een grijze kolom naast het invoerveld werkt zonder dat het veld zelf dubbelop wordt gebruikt. Een placeholder verdwijnt zodra je typt; een kolom blijft staan terwijl je vergelijkt.
2. **Rust-timer als inline regel per oefening.** Niet als vaste balk onderaan, die kost permanent verticale ruimte in een scherm dat al een tabel plus toetsenbord moet dragen. Inline betekent ook dat de timer per oefening kan verschillen — en uit kan.
3. **Alle sets tegelijk tonen.** Vier rijen blijven leesbaar met het toetsenbord open. Dat is meteen de bovengrens van wat past.

Twee dingen blijven open:

- Hoe de **lopende** countdown eruitziet in Hevy is niet gevonden; dat vraagt een Pro-account of de app zelf installeren.
- Voor de Voortgang-tab is nog geen empty state bekeken. Die zoekopdracht is nog niet gedaan.

De vergelijking met Strong vervalt zolang die app niet in Mobbin staat. Als dat patroon er echt toe doet, is de app zelf even installeren sneller dan hier verder zoeken.
