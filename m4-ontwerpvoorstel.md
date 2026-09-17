# M4 - van jouw antwoorden naar een startplan

17 september 2026. Raoul heeft M3a op telefoon bevestigd en gevraagd M4 uit te werken volgens
de aangeleverde UX-flow. Dit is het aangekondigde klikbare ontwerpvoorstel, geen nieuwe
productieplanner. [Klikmodel](https://raoulmartens.github.io/Fitness-app/m4-voorstel/).

## Wat te beoordelen

1. Vier schermen: doel, ervaring, week en trainingsplek. De bekende intake is voorgevuld en
   blijft corrigeerbaar. Niet gekozen: een prioriteit tussen kracht en spiermassa.
2. Een vaste dag en een expliciete optionele weekenddag. Geen automatische weekendverplichting.
3. Voorstel met weekindeling, geschatte sessieduur en oefeningen op verzoek. Alleen 'Zo beginnen'
   accepteert de getoonde antwoorden en het voorstel binnen het klikmodel.
4. Bij 45 minuten: kies expliciet ongeveer 60 minuten beschikbaar, pas je week aan of houd
   45 minuten aan. In dat laatste geval blijft een passend kort schema een open inhoudelijke
   beslissing. Meer dagen of een andere prioriteit verkorten het bestaande schema niet vanzelf.
5. Vandaag biedt de ingang naar de sessie. Plan toont de week en antwoorden. Het sessie-overzicht
   is een zijpad van Vandaag; Plan herhaalt niet hetzelfde oefeningenoverzicht.

## Gebruik van de bron

UC-010 en de bestanden `intake-doel`, `intake-ervaring`, `intake-week`, `intake-context`,
`plan-voorstel`, `plan-compromis` en `eerste-download` zijn gelezen. Vier vragen, een vraag per
scherm, behouden antwoorden bij teruggaan, compromis voor bevestiging en uitleg op verzoek blijven.
De PPL-cyclus, automatische armprioritering, spiergroeibelofte, aanmelding en een gefingeerde
videodownload vervallen. Het full-body-startschema uit de huidige hoofdapp vervangt de PPL-inhoud.
De tijdkeuzes zijn 45, 60 en 90 minuten; 60 sluit aan op de bestaande richtduur, niet de oude 70.

Het doel krijgt spiermassa, kracht of beide; bij beide blijft prioriteit een expliciete keuze
met 'Nog geen voorkeur'. Bovenlichaam is een corrigeerbaar aandachtspunt uit de intake. Voor de
eerste sessies blijft het programma gelijk: de app suggereert geen al uitgewerkte doelvarianten.
Andere apparatuur, ruime ervaring of gemelde beperkingen leiden naar 'Nog geen passend plan'
en een gerichte correctiemogelijkheid. Er is geen claim dat dit alle trainingssituaties ondersteunt.

## Grenzen en vervolgbouw

Eigen sessionStorage, geen toegang tot IndexedDB of de huidige trainingshistorie. Herladen in
hetzelfde tabblad bewaart antwoorden, de stap en het geaccepteerde voorbeeld. Opslagfouten blijven
zichtbaar en blokkeren bevestiging. De hoofdapp blijft M3a. De infoknop bevat prototype-uitleg,
de lege intake en het opnieuw laden van bekende antwoorden; geen ontwerpinstructies in de flow.

Na beoordeling volgt implementatie van profiel en planactivatie in blijvende opslag, inclusief
bescherming van actieve sessies. Een compact 45-minutenschema, alternatieve apparatuur en
structurele prioriteitsvarianten vereisen inhoudelijke uitwerking. Geen nieuwe trainingsregels
worden door dit klikmodel vastgesteld. [Handoff](ux-flows/m4/UX-FLOWS.md).
