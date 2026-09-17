# M2 - navigatie en handoff

16 september 2026. Uitgewerkt met ux-flow-designer vanuit de bestaande wireframes en Raouls
opdracht om de verwarrende flow te herstellen. Low fidelity blijft de visuele afspraak.

## Ingangen

- [Werkend klikmodel](http://127.0.0.1:4173/m2-voorstel/): opslag binnen dit tabblad, invoer, sheets, rust en sessiestatus.
- [Statisch HTML-prototype](../../public/m2-voorstel/wireframes/today.html): gewone links, zonder JavaScript.
- [Use cases en afbakening](use-cases.md).
- [Screen map](screen-map.md), [diagramindex](diagrams/INDEX.md), [HTML-inventaris](wireframes-INDEX.md).

## Schermrollen

| Scherm | Doel | Referentie | Voorkeursactie |
| --- | --- | --- | --- |
| Vandaag | De training van vandaag starten of hervatten | today.html | Start training / Verder trainen |
| Sessie-overzicht | Vooraf oefeningen en duur bekijken | session-overview.html | Start training |
| Plan | De trainingsweek begrijpen | plan.html | Trainingsdagen aanpassen |
| Trainingsdagen aanpassen | Een weekendkeuze maken en expliciet opslaan | plan-edit.html | Planning opslaan |
| Planvoorstel | Inhoud beoordelen buiten de dagelijkse navigatie | plan-voorstel.html | Terug naar de app |
| Compromis | De afweging bij minder beschikbare tijd bekijken | plan-compromis.html | Bekijk het gevolg |
| Warming-up en oefening | De bestaande trainingsflow uitvoeren | warmup.html, exercise.html | Volgende handeling |
| Sessieresultaat en gevolgen | Afsluiting en volgende keer begrijpen | summary.html, consequences.html | Naar Vandaag |

Referenties zijn de bestanden in `ux-flows/wireframes/`; actuele varianten staan in de HTML-inventaris.

## Klikroutes

| Van | Bediening | Naar |
| --- | --- | --- |
| Vandaag | Start training | Warming-up |
| Vandaag | Bekijk de sessie | Sessie-overzicht |
| Sessie-overzicht | Terug | Vandaag |
| Vandaag / Plan | Tabbalk | Andere hoofdbestemming |
| Plan | Trainingsdagen aanpassen | Dagen aanpassen |
| Dagen aanpassen | Opslaan / Annuleren / Terug | Plan |
| Beoordelingsbalk | Planvoorstel beoordelen | Voorstel, met herkomst bewaard |
| Voorstel | Minder tijd | Compromis |
| Compromis | Terug | Voorstel |
| Voorstel | Terug naar de app | Scherm van herkomst |
| Oefening | Naar Vandaag | Vandaag; sessie blijft lopen |
| Gevolgen | Terug naar je sessie | Sessieresultaat |

## Navigatieafspraken

- Vandaag en Plan zijn gelijkwaardige hoofdbestemmingen. Geen terugknop tussen tabs.
- Plan linkt niet naar de lijst van de sessie van vandaag en niet naar het planvoorstel.
- De beoordelingsbalk is gereedschap voor dit klikmodel, geen toekomstige appfunctie.
- Een terugknop verandert nooit de sessiestatus; browser-terug herstelt ook de schermweergave.
- Sheets blijven overlays. Het sluiten van een sheet bewaart invoer en sessiecontext.
- Conceptplanning verandert pas bij opslaan. Terug/annuleren gooit alleen de conceptkeuze weg.
- Beoordeling vanuit het planningsformulier behoudt de conceptkeuze bij terugkeer.
- De woensdag en trainingsinhoud blijven het bestaande voorstel. Vrij herplannen en planversies
  zijn nog geen werkende M5-functionaliteit.

## HTML-wireframes

De skill vraagt zelfstandige HTML met gewone links. Er zijn tien snapshots met inline CSS
gegenereerd uit de renderfuncties van het bestaande model, zodat teksten niet uiteenlopen.
De wf-structuur uit het skilltemplate is aangepast van diens desktopvariant naar 375px.
Acties die opslag, invoer of sheets vragen linken expliciet naar het werkende klikmodel.
Het bestaande model houdt JavaScript voor de door Raoul gevraagde echte werking.

Regenereren na schermwijzigingen: `node scripts/export-m2-wireframes.mjs`, daarna `npm run build`.

## Verificatie en resterende grenzen

Zie [VERIFICATIE.md](VERIFICATIE.md) voor de uitgevoerde controles. Dit is een navigatiecorrectie
in het M2-ontwerpvoorstel; geen nieuwe M2-productieopslag en geen vastgesteld trainingsprogramma.
Apparaatinstructies, demonstraties en de persoonlijke programmakeuze blijven open zoals eerder.

Optioneel kan een latere visuele uitwerking de aanvullende ui-ux-pro-max-skill gebruiken;
die is niet nodig voor deze correctie. De wireframes zijn beschikbaar voor een later expliciet
gevraagde Figma-export. Er zijn geen skills geinstalleerd of Figma-acties uitgevoerd.
