# M3 - afwijken tijdens je training

17 september 2026. Raoul heeft de werkende M2 op zijn telefoon bevestigd en opdracht gegeven
door te gaan. Dit voorstel concretiseert de bestaande UC-003 t/m UC-006 uit de bouwbrief.
Geen nieuwe use cases: de eerder vastgelegde situaties vormen fase 1 van ux-flow-designer.

## Te beoordelen

Een afzonderlijk [klikmodel](public/m3-voorstel/index.html), low fidelity, met echte bediening
en voorbeeldgegevens in een eigen sessionStorage-sleutel. De hoofdapp en trainingshistorie
worden niet aangeraakt. [Handoff en diagrammen](ux-flows/m3/UX-FLOWS.md).

1. **Apparaat bezet:** huidige oefening achteraan zetten. De open sets en conceptinvoer blijven
   bij die oefening. Als er geen andere oefening over is: blijven, overslaan of stoppen.
2. **Geen materiaal of pijn:** resterende sets van deze oefening overslaan na bevestiging.
   Gedane sets blijven staan. Bij pijn worden geen vervangers aangeboden of veilig verklaard.
3. **Minder tijd:** zelf kiezen welke resterende oefeningen vervallen. Voor bevestiging ziet
   Raoul wat blijft en wat vervalt. Geen vaste minutenbesparing, ingekorte rust of verschuiving
   naar het weekend zonder onderbouwde regel. Geen belofte dat een selectie binnen de tijd past.
4. **Te zwaar:** eerst dagvorm, techniek of structureel onderscheiden. Bij dagvorm/techniek kan
   Raoul zelf een nieuw doelgewicht kiezen voor de resterende sets vandaag, of overslaan.
   Geen automatisch berekend percentage; werkelijk gebruikte kilo's worden apart geregistreerd.
5. **Niet trainen:** een nog niet gestarte afspraak verplaatsen naar een zelfgekozen datum,
   of bewust overslaan. Het weekpatroon blijft staan. Geen nieuwe verplichte weekendtraining.
6. **Al bezig:** pauzeren, naar Vandaag, afronden en afbreken blijven expliciete verschillende
   acties. Verplaatsen/overslaan van een afspraak kan niet een actieve uitvoering verbergen.

## Wat nadrukkelijk een open deel van M3 blijft

- Concrete vervangende oefeningen: apparaten, uitvoering en geschikte alternatieven moeten
  eerst worden gecontroleerd. Toon de beperking en een bruikbare uitweg; verzin geen lijst.
- Structureel te zwaar: aantal kilo's, duur, evaluatiemoment en terugkeerregel zijn nog niet
  vastgesteld. De sheet benoemt dat. Wel vandaag handmatig aanpassen; geen stille niveauverlaging.
- Blijvende voorkeuren en tijdelijke planversies: pas implementeren met bovenstaande afspraken.
  Dit voorstel heet daarom M3a; het is geen claim dat heel M3 daarmee af is.
- Oefeninstructies en offline demonstraties blijven een afzonderlijke M2-inhoudelijke afhankelijkheid.

## Interactiecontract

Sheets liggen over Vandaag of de oefening. Sluiten, Escape en browser-terug annuleren een
onbevestigde wijziging en bewaren de setinvoer. Na bevestiging toont het oefenscherm de wijziging
met reikwijdte 'alleen vandaag'. Het resultaat onderscheidt gedaan, overgeslagen en niet afgemaakt.
Een overgeslagen set is nooit nul herhalingen. Een wijziging is via 'Aanpassing terugdraaien'
herstelbaar zolang de sessie actief/gepauzeerd is. Terugdraaien verwijdert geen gedane sets.
Is inmiddels nieuw werk uitgevoerd, dan blijven die resultaten de waarheid.

Het klikmodel is een scenario-oefening: het begint bij de chest press, na vier fictieve sets.
Registreren werkt ter beoordeling, maar er is geen rusttimer of volledige M2-warming-up nagebouwd.
Op Vandaag kan ook een nog niet gestarte afspraak worden bekeken via de beoordelingsbalk.
Deze balk hoort niet bij de toekomstige app.

## Bouwcontract na beoordeling

Bewaar aanpassingen als gebeurtenissen met id, sessie/afspraak, reden, reikwijdte, slot-/set-ids,
oude/nieuwe waarde en revisie. Beginsnapshot en bevestigde setresultaten blijven onveranderd.
Een volgorde mag stabiele slot-/set-ids niet veranderen. Open concepten blijven aan die ids hangen.
Schrijf wijziging, cursor/volgorde en outbox atomair. Herhalen van een actie is idempotent.
Twee tabs mogen niet stil overschrijven; verouderde bevestiging vraagt een nieuw voorstel.
Opslagfout houdt de sheet open en de oude sessie bruikbaar. Planversies zijn een later deel van M3.

## Acceptatie voor de latere hoofdapp

- Bezet: dezelfde open sets en conceptinvoer komen later terug; geen dubbele set-id.
- Overslaan: alleen open sets veranderen status; gedane sets en oude doelen blijven leesbaar.
- Minder tijd: selectie is zichtbaar voor akkoord, annuleren doet niets, herstel blijft mogelijk.
- Dagvorm/techniek: uitsluitend vandaag; geen aangepast niveau of volgende trainingsdoelen.
- Verplaatsen/overslaan: afspraakstatus gescheiden van uitvoering; oorspronkelijke datum herleidbaar.
- Pauzeren/afbreken: bestaand M2-gedrag behouden; geen tweede uitvoering bij hervatten.
- Sluiten/heropenen/offline bewaart bevestigde aanpassingen in IndexedDB, niet alleen sessionStorage.

## Besluit

Beoordeel het klikmodel op drie routes: 'Lukt niet > Bezet', 'Minder tijd' en
'Te zwaar > Dagvorm'. Na akkoord volgt implementatie van M3a in de hoofdapp met blijvende opslag.
De open trainingsregels worden niet met dit akkoord automatisch ingevuld.
