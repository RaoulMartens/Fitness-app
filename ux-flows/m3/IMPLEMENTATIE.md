# M3a - implementatiecontrole

17 september 2026. Bouwakkoord: Raoul vraagt na beoordeling van het compacte voorstel
door te gaan naar de volgende bouwstap. De hoofdapp bevat nu de M3a-flow met IndexedDB-opslag.
De referentie op `/m3-voorstel/` blijft gescheiden en gebruikt nog steeds sessionStorage.

## Gedrag

- Later doen herschikt alleen open sets; concepten blijven bij hun oorspronkelijke set.
- Overslaan en minder tijd markeren alleen open sets. Uitgevoerde sets blijven onveranderd.
- Een handmatig doelgewicht geldt voor de open sets van die oefening, alleen vandaag.
  Het oorspronkelijke voorschrift en het werkelijk geregistreerde gewicht blijven apart.
- Terugdraaien herstelt de laatste aanpassing, met uitzondering van inmiddels vastgelegde sets.
- Verplaatsen of overslaan betreft een afspraak die nog niet gestart is. Het weekritme blijft
  staan; een volgende afspraak ontstaat zonder inhaalsets. Weekendkeuze werkt een nog niet
  gestarte, niet bewust verplaatste afspraak bij.
- Elke bevestiging controleert revisies en slaat de aanpassing met de lokale wachtrij atomair
  op. Mislukte opslag sluit de sheet niet. Browser-terug annuleert een onbevestigde aanpassing.
- Tijdens registreren staat de set centraal. Hulpacties staan eronder; extra uitleg en het
  setoverzicht zijn ondergeschikt. Geen definitieve visuele stijl toegevoegd.

## Overgang van M2

Database `training-m2` gaat naar versie 2. Bestaande `sessions`, `sets`, `drafts`, `outbox`
en `workspace` worden eenmalig in dezelfde upgradetransactie gekopieerd naar `workouts`,
`workoutSets`, `workoutDrafts`, `workoutOutbox` en `workoutWorkspace`. De oude tabellen blijven
intact. De open setvolgorde wordt afgeleid van het oude voorschrift en de sessiecursor.
`appointments` bewaart afspraken; `migration` bewaart de vergelijkingsbasis van M2.

Dexie kan oude clients opnieuw verbinden met een hogere databaseversie. Daarom schrijven
M2 en M3 bewust verschillende tabellen. Oude clients kunnen M3-data niet overschrijven.
Latere wijzigingen door oude clients worden gemeld met de waarden ter controle; er is geen
automatische samenvoeging. Sluit oude tabbladen voordat je verder traint in de nieuwe versie.
Herstel vereist M3-compatibele code. Oude M2-code ziet alleen de oude tabellen. Er is geen
destructieve opruiming; M1 blijft eveneens behouden.

## Bewijs en grenzen

- `npm test`: 31 tests geslaagd. Inclusief migratie, oude schrijver, idempotentie, terugdraaien
  na een uitgevoerde set, meerdere concepten, verouderde bevestigingen en atomair foutherstel.
- `npm run build`: geslaagd, inclusief typecontrole.
- Chromium mobiel: 15 browsertests geslaagd, inclusief bestaande M1/M2-regressietests.
- Nieuwe M3a-flow: 4 tests per browser geslaagd in Chromium en WebKit. Na de laatste
  correctie aan het lezen van de bevestigingscontext opnieuw uitgevoerd.
- `node scripts/check-offline-webkit.mjs`: geslaagd met werkelijk uitgeschakelde webserver.
  Volledige browserherstart bewaart de verplaatste oefening; terugdraaien herstelt ook `18,`
  als conceptinvoer. Geen afhankelijkheid van WebKits problematische offline-emulatie.
- Mobiele schermafbeelding visueel gecontroleerd; registratie staat vooraan en geen
  horizontale overflow in de bestaande mobiele flowcontrole.

Bij eerdere M2-controles faalden drie WebKit-tests op gesimuleerde offline navigatie.
De volledige WebKit-suite wordt hier niet als geslaagd geclaimd. Een echte telefoontoets
van deze nieuwe M3a-versie staat nog open; de eerdere bevestiging gold voor M2.
Gecontroleerde oefenalternatieven, apparaatinstructies, video's en structurele planwijzigingen
vallen buiten deze bouwstap. Er is geen backend of cloudsynchronisatie.
