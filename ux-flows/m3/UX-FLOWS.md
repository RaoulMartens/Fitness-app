# M3 - afwijken zonder je training kwijt te raken

17 september 2026. Uitwerking met ux-flow-designer, voortbouwend op de bestaande use cases en
de M2-schermrollen. Bron: bouwbrief hoofdstuk 4 (R7), 6, 7 (M3), bouwvoorstel hoofdstuk 3.

Op Raouls verzoek is de beoordelingsweergave vervolgens opgeschoond: alleen een klein
Prototype-label en infoknop buiten de flow. Uitleg, scenario's en referentielinks staan in
'Over dit prototype'. Het oefenscherm toont set en herhalingen als twee compacte vlakken,
een dominante registratieknop, drie kleinere uitwegen en een ondergeschikte pauze/stopactie.
Sheets bewaren korte gevolgen en reikwijdte; technische en herhaalde uitleg is verwijderd.
Dit is een presentatiecorrectie, geen nieuw trainings- of opslaggedrag.

## Ingangen

- [Interactief voorstel](https://raoulmartens.github.io/Fitness-app/m3-voorstel/)
- [Statische HTML](../../public/m3-voorstel/wireframes/today.html)
- [Beslisvoorstel](../../m3-ontwerpvoorstel.md)
- [Use cases](use-cases.md), [screen map](screen-map.md), [diagramindex](diagrams/INDEX.md)
- [Scherminventaris](wireframes-INDEX.md), [verificatie](VERIFICATIE.md)

## Schermrollen en routes

| Van | Actie | Bestemming/context |
| --- | --- | --- |
| Vandaag, afspraak nog niet gestart | Pas vandaag aan | Sheet: minder tijd / verplaatsen / overslaan |
| Vandaag, sessie actief of gepauzeerd | Verder trainen | Dezelfde uitvoering en bewaarde invoer |
| Oefening | Lukt niet | Sheet: bezet / geen materiaal / pijn |
| Bezet | Later doen | Eerstvolgende open oefening; huidige open sets achteraan |
| Geen materiaal / pijn | Overslaan bevestigen | Volgende open oefening of einde; gedane sets blijven |
| Oefening | Minder tijd | Selectie resterende oefeningen, dan gevolg bevestigen |
| Oefening | Te zwaar | Reden, dan handmatig doel vandaag of overslaan |
| Oefening | Pauzeren of stoppen | Sheet met onderscheiden statusacties |
| Geplande afspraak | Verplaatsen | Datum kiezen, gevolg, expliciet bevestigen |
| Plan | Vandaag-tab | Sessie-ingang, geen dubbele oefeningenlijst |
| Elke sheet | Sluiten / browser-terug | Onderliggend scherm, geen onbevestigde wijziging |

De bestaande wireframes `swap.html`, `hard.html`, `adjust-time.html`, `interrupt.html` en
`adjust.html` zijn inhoudelijk gelezen. Behouden: aanleiding eerst, zichtbare reikwijdte,
gevolg voor bevestiging, directe ingangen tijdens trainen en een sheet boven de context.
Aangepast ter beoordeling: PPL-vervangers, RPE 9/10, automatische 25 kg voor twee weken en
verschuiving naar zaterdag vervallen uit het voorstel. Het persoonlijke schema onderbouwt die niet.

## Interactie en opslag

De interactieve variant gebruikt echte dialogen met focusbegrenzing en Escape. Browser-terug
sluit een sheet; gewone navigatie laat de sessie lopen. Conceptwaarden blijven per oefening
bewaard na verplaatsen en herladen. 'Aanpassing terugdraaien' herstelt de laatste aanpassing
zonder later gedane sets te verwijderen. Voorbeeldopslag: `training-m3-review-v1` in sessionStorage.
Geen toegang tot de databases van M1/M2. Opslagfout wordt zichtbaar gemeld; bevestigde acties
veranderen pas na geslaagd opslaan. De huidige invoer blijft bij een fout in beeld.

Statische exports gebruiken gewone links, inline CSS en geen scripts. De skill-templateklassen
zijn aangepast naar dezelfde mobiele 375px-basis als M2. Een sheetbestand toont context en
overlay als afbeelding van de interactie; het is geen routevoorstel voor de toekomstige app.
Regenereren: `node scripts/export-m3-wireframes.mjs`.

## Nog te beslissen

M3a vraagt beoordeling van de concrete flow en tekst. Gecontroleerde alternatieven,
blijvende voorkeuren en tijdelijke planversies bij structurele overbelasting zijn nog open.
Daarom is dit geen oplevering van de volledige M3-hoofdapp. Apparaatinstructies en demo's
blijven nodig voor echte trainingsbegeleiding. Geen automatisch tijds- of gewichtsalgoritme.

Voor een latere visuele fase is ui-ux-pro-max optioneel te installeren; voor deze low-fidelity
stap is dat niet nodig. Figma-export is optioneel op verzoek; er is geen Figma-actie uitgevoerd.
