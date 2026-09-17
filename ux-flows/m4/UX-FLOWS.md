# M4 - onboarding en eerste plan

Uitwerking van bestaande UC-010 met ux-flow-designer, na Raouls M3a-telefooncontrole en opdracht
verder te gaan. Volgorde: [use case](use-cases.md), [diagrammen](diagrams/INDEX.md),
[scherminventaris](wireframes-INDEX.md), klikmodel en dit handoffdocument.

- [Interactief voorstel](https://raoulmartens.github.io/Fitness-app/m4-voorstel/)
- [Statische start](../../public/m4-voorstel/wireframes/start.html)
- [Ontwerpkeuzes en grenzen](../../m4-ontwerpvoorstel.md)
- [Screen map](diagrams/screen-map.md)

## Schermrollen

| Scherm | Beslissing of taak | Belangrijkste actie |
| --- | --- | --- |
| Start | Bekende antwoorden controleren of een lege intake beginnen | Controleer mijn antwoorden |
| Doel | Spiermassa, kracht of beide; extra voorkeuren op verzoek | Volgende |
| Ervaring | Trainingsniveau aangeven, geen gewichten opzoeken | Volgende |
| Week | Vaste dag, expliciet extra weekend en beschikbare tijd | Volgende |
| Context | Materiaal en eventuele beperking aangeven | Bekijk mijn plan |
| Compromis | Tijdknelpunt zien en zelf kiezen | Ik kan 60 minuten vrijmaken |
| Nog geen passend plan | Ontbrekende programmavariant herkennen | Relevant antwoord aanpassen |
| Planvoorstel | Week en geschatte duur beoordelen; oefeningen op verzoek | Zo beginnen |
| Vandaag | Eerste afspraak openen | Bekijk de sessie |
| Sessie-overzicht | Inhoud van die training bekijken | Terug naar Vandaag |
| Plan | Week en bevestigde antwoorden terugvinden | Antwoorden aanpassen |

## Herkomst en copy

Gebruikt: `ux-flows/diagrams/uc-010-onboarding/` en de vier intakewireframes, het planvoorstel,
compromis en eerste-download. Het bestaande PPL-voorbeeld wordt niet als persoonlijk voorschrift
overgenomen. Het huidige full-bodyschema staat centraal. De vier intakeonderwerpen en de keuze
voor bevestiging blijven; de oorspronkelijke login en download ontbreken omdat die inhoud en
diensten er niet zijn. Geen gefingeerde voortgangsbalk of sessievoorbereiding.

Een scherm stelt zijn actuele vraag. Alleen beslisrelevante uitleg staat direct in beeld.
Voorkeuren en planonderbouwing zijn uitklapbaar; prototype-uitleg staat achter de infoknop.
Het 45-minutenpad noemt de beperking voordat de gebruiker bevestigt. Er staan geen
spiergroeibeloftes of onbewezen gelijkwaardigheden tussen trainingsfrequenties.

## Navigatie en opslag

Terug bewaart antwoorden. Browser-terug sluit de sheet, zonder een plan te activeren.
Directe links kunnen incomplete stappen en ontbrekende bevestiging niet overslaan.
Een concept kan een geaccepteerd voorbeeld niet stil overschrijven. Wijzigingen laten vervallen
herstelt de geaccepteerde antwoorden. Opnieuw bevestigen gebruikt de actuele antwoorden;
een verouderd planvoorstel kan na gewijzigde tijd of context niet worden geaccepteerd.

`training-m4-review-v1` in sessionStorage bewaart alleen dit klikmodel. Geen IndexedDB, account
of hoofdappwijziging. Opslagfouten zijn zichtbaar; bevestiging sluit pas na geslaagd bewaren.
Bij onleesbare opslag wordt niet stil gereset. Beginnen met een leeg voorbeeld is een expliciete
keuze. De service worker houdt M4 buiten de hoofdappcache, net als M2 en M3.

## Vervolg

Beoordelen: vraagvolgorde, compacte teksten, onderscheid tussen beschikbaarheid en voorstel,
en het compromis. Daarna profiel en planactivatie met blijvende opslag implementeren.
Een korter schema, andere apparatuur, meer ervaring en beperkingen vragen inhoudelijke
uitwerking. De huidige app blijft M3a; dit voorstel claimt niet alle M4-programmavarianten.

Een Figma-export is optioneel op verzoek. Voor latere visuele uitwerking kan ui-ux-pro-max
worden toegevoegd; voor deze low-fidelity flow is geen extra installatie nodig.
