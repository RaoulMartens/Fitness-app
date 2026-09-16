# Schermoverzicht

Aanvullend, ter beoordeling: [M2-ontwerpvoorstel](../../m2-ontwerpvoorstel.md) en het klikmodel
in `public/m2-voorstel/`. De 33 schermen hieronder zijn de oorspronkelijke PPL-baseline.
Het voorstel bevat een aparte scherm- en use-casematrix; er is nog geen programmakeuze vastgelegd.

Drieëndertig schermen in vier groepen. Startpunt voor een nieuwe gebruiker is **start.html**, voor
een terugkerende **today.html**. 375px, geen JavaScript.

## Onboarding en eerste plan (UC-010)
Loopt één keer, vóór alles. Vier vragen, dan een voorstel.

| Scherm | Bestand | Soort | Use cases | Voorkeursactie | Woorden | Belangrijkste elementen |
|---|---|---|---|---|---|---|
| Welkom | [start.html](start.html) | Primair scherm | UC-010 | Beginnen | 41 | Wat er gaat gebeuren, in twee zinnen |
| Wat wil je bereiken | [intake-doel.html](intake-doel.html) | Primair scherm | UC-010 | Volgende | 23 | Eén hoofddoel, prioriteit expliciet |
| Hoelang train je al | [intake-ervaring.html](intake-ervaring.html) | Primair scherm | UC-010 | Volgende | 51 | Ervaring nu, gewichten later |
| Je week | [intake-week.html](intake-week.html) | Primair scherm | UC-010 | Volgende | 29 | Dagen en tijd per dag, de randvoorwaarden die het plan sturen |
| Waar en waarmee | [intake-context.html](intake-context.html) | Primair scherm | UC-010 | Maak mijn plan | 48 | Materiaal en beperkingen, in één vraag |
| Je plan | [plan-voorstel.html](plan-voorstel.html) | Primair scherm | UC-010 | Zo beginnen | 124 | Het voorstel, de reden in één regel, en de keuze |
| Dit past niet helemaal | [plan-compromis.html](plan-compromis.html) | Primair scherm | UC-010 | Keuze maken | 74 | Het compromis benoemd in frequentie, duur of prioriteit — de sporter kiest |
| Aanmelden | [aanmelden.html](aanmelden.html) | Primair scherm | UC-010 | Plan bewaren | 41 | Account en eerste download in één moment |
| Klaarzetten | [eerste-download.html](eerste-download.html) | Primair scherm | UC-010 | Naar Vandaag | 39 | Eerste download, installeren op het beginscherm |

## De app zelf
| Scherm | Bestand | Soort | Use cases | Voorkeursactie | Woorden | Belangrijkste elementen |
|---|---|---|---|---|---|---|
| Vandaag | [today.html](today.html) | Primair scherm | UC-001, UC-006 | Start training | 79 | Sessie die loopt, vandaag, één reden, één knop, en de push-ups van vandaag |
| Vandaag geen training | [today-rustdag.html](today-rustdag.html) | Primair scherm | UC-001 | Geen; rust is de opdracht | 54 | Rust als onderdeel van het programma |
| Sessie-overzicht | [session-overview.html](session-overview.html) | Primair scherm | UC-001 | Start training | 92 | De zes oefeningen, verder niets |
| Warming-up | [warmup.html](warmup.html) | Primair scherm | UC-001 | Naar oefening 1 | 58 | Warm worden, één warming-upset, door naar oefening 1 |
| Oefening 1 van 6 | [exercise.html](exercise.html) | Primair scherm | UC-002 | Set vastleggen | 74 | De demo staat groot in beeld, daaronder de set die je nu doet |
| Sessie afronden | [summary.html](summary.html) | Primair scherm | UC-007 | Wat betekent dit? | 55 | Wat je deed, één vraag, door naar de gevolgen |
| Gevolgen | [consequences.html](consequences.html) | Primair scherm | UC-007 | Accepteren | 76 | Wat er donderdag verandert, de aanname erbij, en de keuze |
| Plan | [plan.html](plan.html) | Primair scherm | UC-008 | Trainingsdagen aanpassen | 71 | Waar je staat en wat eraan komt |
| Dagen aanpassen | [plan-edit.html](plan-edit.html) | Primair scherm | UC-008 | Herplannen | 68 | Dagen aan of uit, en wat dat verandert |
| Vooruitgang | [progress.html](progress.html) | Primair scherm | UC-009 | Geen; informatief | 92 | Vier betekenissen, apart gehouden |

## Sheets en substates
Liggen over een primair scherm heen; de context eronder blijft bestaan.

| Scherm | Bestand | Soort | Use cases | Voorkeursactie | Woorden | Belangrijkste elementen |
|---|---|---|---|---|---|---|
| Rust | [rest.html](rest.html) | Substate over Oefening | UC-002 | Volgende set | 46 | Timer, de sets blijven eronder staan, einde van de rust |
| Oefening lukt niet | [swap.html](swap.html) | Sheet over Oefening | UC-004 | Alternatief kiezen | 40 | Aanleiding kiezen, dan alleen het antwoord dat daarbij hoort |
| Zwaarder dan verwacht | [hard.html](hard.html) | Sheet over Oefening | UC-005 | Accepteren | 68 | Wat de app zag, de reden, en wat dat verandert |
| Minder tijd | [adjust-time.html](adjust-time.html) | Sheet over Vandaag of Oefening | UC-003 | Accepteren | 85 | Hoeveel tijd, wat er dan gebeurt, akkoord of niet |
| Pauzeren of stoppen | [interrupt.html](interrupt.html) | Sheet over Oefening | UC-006 | Terug naar Vandaag | 33 | Doorlopen, beëindigen of overslaan — drie groepen |
| Pas vandaag aan | [adjust.html](adjust.html) | Sheet over Vandaag | UC-003 t/m UC-006 | Kies wat er anders is | 33 | Vier aanleidingen, vóór de training |
| Verder trainen | [resume.html](resume.html) | Sheet over Vandaag | UC-006 | Verder bij oefening 3 | 44 | Waar je was, en verder |
| Push-ups vandaag | [pushups.html](pushups.html) | Sheet over Vandaag | UC-011 | Set van 13 gedaan | 100 | Dagdoel, wat je al deed, één tik per set, en waarom het vandaag dit aantal is |
| Je max testen | [pushups-test.html](pushups-test.html) | Sheet over Push-ups | UC-011 | Aantal vastleggen | 52 | Eén set tot bijna falen, en wat het dagdoel daarna wordt |

## Systeemstates
Toestanden, geen bestemmingen. Horen niet in de gewone navigatie.

| Scherm | Bestand | Soort | Use cases | Voorkeursactie | Woorden | Belangrijkste elementen |
|---|---|---|---|---|---|---|
| Opslag en synchronisatie | [sync.html](sync.html) | Systeemstate | UC-007 | Geen; informatief | 53 | Wat het voor de sporter betekent, daaronder pas de statussen |
| Offline en downloads | [offline.html](offline.html) | Systeemstate | UC-001, UC-002 | Opnieuw downloaden | 47 | Je kunt trainen, één video ontbreekt |
| Er ging iets mis | [error.html](error.html) | Systeemstate | UC-007 | Versie kiezen | 51 | Twee versies, jij kiest, niets gaat weg |
| Nog geen historie | [empty.html](empty.html) | Systeemstate | UC-002, UC-009 | Naar de oefening | 52 | Geen vorige uitvoering, geen verzonnen schatting |
| Even wachten | [loading.html](loading.html) | Systeemstate | UC-007, UC-008 | Geen; het systeem is bezig | 22 | Wat er gebeurt, de vorm van het antwoord, en een uitweg |

De kolom **woorden** telt alleen interfacetekst, dus zonder ontwerpnotities en voettekst.

## Tekst: wat er wel en niet op een scherm staat
De app praat als een trainer die naast je staat: kort, één ding tegelijk, alleen wat je nu nodig
hebt.

| Soort | Vorm | Voorbeeld |
|---|---|---|
| Wat je nu moet weten | Gewone tekst, kort | "12 reps op 27,5 kg. Ga tot falen." |
| De reden erachter | Eén regel, grijs | "Je rug is drie dagen hersteld." |
| De onderbouwing | Uitklapregel, op verzoek | "Hoe ik dit bepaal" |

Gedrag dat je niet kunt tekenen — trilling, vergrendelscherm, wat er na vijf seconden gebeurt —
staat als **notitie** onderaan het scherm. Dat is geen interfacetekst.

## Vier soorten bediening, vier vormen

| Vorm | Betekenis |
|---|---|
| Chip met `›` | Link naar een ander scherm of sheet |
| Keuzerondje | Optie waaruit je kiest |
| Vierkant vlak | Aan/uit-schakelaar |
| Onderstreepte tekst | Tekstlink, lichter dan een knop |
| Knop | De voorkeursactie, één per scherm |

## Navigatie tijdens een actieve sessie
Sheets sluiten met de kruisknop; dat raakt de sessie niet. Warming-up en Oefening hebben rechtsboven
**Sessie blijft lopen**. Beëindigen kan alleen via **Pauzeren of stoppen**; na de laatste set via de
rusttimer.

## Twee schermen buiten de flow
`empty.html` en `today-rustdag.html` zijn toestanden, geen bestemmingen. Ze zijn te openen vanaf de
overzichtspagina van het prototype.
