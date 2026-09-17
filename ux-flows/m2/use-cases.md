# M2 - navigatiecorrectie

16 september 2026. Gerichte herziening met ux-flow-designer van bestaande UC-001, UC-008 en
UC-010. Raouls opdracht "fix het" volgt op het besproken onderscheid tussen Vandaag, Plan en
planvoorstel en geeft akkoord op deze correctie. Het persoonlijke programma blijft een voorstel.
De bouwbrief en bestaande wireframes vervangen een nieuwe PRD/intake. De bestaande map
`ux-flows/` blijft de documentatieplek; we maken geen tweede boom onder `docs/`.

## UC-001 - Sessie van vandaag starten

- Actoren: Raoul, klikmodel.
- Voorwaarde: het woensdagvoorbeeld is beschikbaar.
- Hoofdflow: Vandaag -> Start training -> warming-up -> oefening -> rust -> volgende set.
- Alternatief: Bekijk de sessie -> oefeningen en duur -> Start training, of terug naar Vandaag.
- Alternatief: actieve/gepauzeerde sessie -> Verder trainen -> hervatsheet -> dezelfde sessie.
- Alternatief: navigeren naar Vandaag of Plan bewaart sets, conceptinvoer en rusttijd.
- Resultaat: alleen expliciet starten begint de training; bekijken start niets. Alleen expliciet
  afronden/afbreken beeindigt de sessie. Browser-terug verandert geen trainingsstatus.

## UC-008 - Trainingsweek bekijken en weekend kiezen

- Actoren: Raoul, klikmodel.
- Voorwaarde: woensdag staat vast in het huidige persoonlijke voorstel.
- Hoofdflow: tab Plan -> trainingsweek -> Trainingsdagen aanpassen -> weekendkeuze -> opslaan -> Plan.
- Alternatief: annuleren/terug laat de vorige planning staan; herladen bewaart de conceptkeuze.
- Alternatief: geen weekend inplannen maakt geen gemiste sessie of inhaalafspraak.
- Alternatief: opslag niet beschikbaar geeft de bestaande zichtbare foutmelding.
- Resultaat: dezelfde weekendkeuze staat in Plan en Vandaag; een actieve sessie blijft intact.
- Afbakening: alleen de al aanwezige optionele weekendkeuze is bewerkbaar. Woensdag, duur,
  oefeningen en frequentie-algoritmen krijgen geen nieuwe regels. Volledig herplannen hoort bij M5.

## UC-010 - Planvoorstel beoordelen

- Actoren: Raoul als beoordelaar, klikmodel.
- Voorwaarde: de beoordelingsbalk staat buiten de appnavigatie.
- Hoofdflow: Planvoorstel beoordelen -> voorstel -> eventueel compromis -> terug naar voorstel -> terug naar de app.
- Alternatief: terugkeerpunt is het scherm waar de beoordeling geopend is, ook na herladen.
- Alternatief: geen compromiskeuze -> zichtbare uitleg om eerst een keuze te maken.
- Resultaat: beoordelen start geen sessie, wijzigt het plan niet en geldt niet als programma-akkoord.

## Vaardigheden en scope

De skill noemt ui-ux-pro-max als optionele vervolgstap voor visuele uitwerking; die is niet
geinstalleerd en niet nodig voor deze low-fidelity correctie. De bestaande bouwbrief en use cases
maken product-manager-toolkit eveneens overbodig voor deze opdracht. Geen Figma-export gevraagd.
