# M3 - bestaande use cases voor het persoonlijke schema

Fase 1: voortzetting van de bestaande UC-003 t/m UC-006 uit `../use-cases.md`, op verzoek
'ga door met de volgende stap'. Geen uitbreiding naar nieuwe use cases of visueel ontwerp.
Nieuwe concrete tekst/regelkeuzes zijn voorstel, geen vastgesteld trainingsvoorschrift.

| ID | Situatie | Actoren | Voorwaarde | Hoofdflow | Alternatieven/fouten | Resultaat |
| --- | --- | --- | --- | --- | --- | --- |
| UC-003 | Minder tijd | Raoul, app | Afspraak gepland of sessie actief | Selecteer open oefeningen; bekijk wat vervalt/blijft; bevestig | Sluiten behoudt origineel; niets gekozen geeft geen bevestiging; alles weglaten leidt naar afronden | Alleen open sets vervallen vandaag; gedane sets en weekdoel blijven |
| UC-004 | Oefening lukt niet | Raoul, app | Actieve oefening | Kies reden; bekijk later doen/overslaan; bevestig | Laatste oefening kan niet later; geen gecontroleerde vervanger; pijn biedt geen veilig verklaard alternatief | Open sets later of overgeslagen; concept aan oorspronkelijke oefening; reikwijdte zichtbaar |
| UC-005 | Te zwaar | Raoul, app | Actieve oefening, zelf gemeld | Kies dagvorm/techniek/structureel; kies eigen doel vandaag; bevestig | Ongeldig gewicht blijft in sheet; niets veranderen; overslaan; structurele dosering nog open | Doel vandaag gewijzigd, prestatie apart, geen stille niveauwijziging |
| UC-006 | Onderbreken of niet trainen | Raoul, app | Geplande afspraak of actieve sessie | Gepland: nieuwe datum/overslaan bevestigen; actief: pauzeren/hervatten/afronden/afbreken | Terug/Sluiten stopt niets; fout bewaart oorspronkelijke status | Afspraakstatus en uitvoeringsstatus gescheiden; geen inhaalschuld |

Acties worden in de latere hoofdapp lokaal verwerkt, zonder servervoorwaarde. Het klikmodel
bewijst alleen de interactie met voorbeeldgegevens, geen IndexedDB-migratie of synchronisatie.
