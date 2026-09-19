# UX-review — Fitnessapp-prototype

Prototype: [Schermenlijst](https://fitnessapp-rose-zeta.vercel.app/proto/index.html)

**De basisindeling is logisch. De grootste zwakte zit in de gevolgen van acties:** die zijn soms onduidelijk of komen niet overeen met wat de knop belooft.

Ik heb eerst de ontwerpkeuzes gelezen, daarna de hoofdlus en alle genoemde toestanden bekeken en doorgeklikt. De vergelijkingspagina’s heb ik als afwegingen behandeld. Dit is een browserreview van het telefoonframe; bediening op een echte iPhone is hiermee niet getest.

1. **Blokkerend in het prototype — meerdere keuzes krijgen de verkeerde vervolgtoestand**  
   **Schermen:** Sessie → rust, Oefening aanpassen, Oefening toevoegen, Vastgelopen.  
   “Verder met Zittende row” brengt me terug bij Chest press. “Andere oefening” verplaatst Chest press naar achteren. Kuitheffen kiezen voegt Crunch toe. Na “Terug naar 25 kg” staat op Klaar nog 30 kg. Daardoor kan ik niet beoordelen of deze taken werkelijk logisch aflopen.  
   **Richting:** maak voor iedere verschillende uitkomst een passende vervolgtoestand. Daarvoor is geen werkende trainingslogica nodig. Dit zijn beperkingen van de klikroutes, niet automatisch fouten in het appconcept.

2. **Blokkerend in het prototype — setcorrectie heeft geen bereikbare ingang**  
   **Schermen:** Sessie → Set corrigeren.  
   Het correctiescherm bestaat, maar tikken op de vastgelegde waarde opent het niet. De ingevulde vakken lijken bovendien niet duidelijk bewerkbaar. Een verkeerd geregistreerde set kan ik vanuit de training dus niet herstellen.  
   **Richting:** laat tikken op een vastgelegde waarde de bestaande correctietoestand openen. Houd de herkenbaarheid van bewerkbare waarden gelijk aan die van de actieve set.

3. **Frictie — vervroegen en extra trainen worden door elkaar gehaald**  
   **Scherm:** [Nu trainen](https://fitnessapp-rose-zeta.vercel.app/proto/nu-trainen.html).  
   Bovenaan vervangt vandaag de training van maandag. Onderaan blijven maandag en donderdag staan en train je drie keer. Dat zijn verschillende gevolgen. Ook blijft onduidelijk hoe trainen op vrijdag aansluit op de training van donderdag en de vastgelegde rustregel.  
   **Richting:** toon één concrete planning die de gekozen regel volgt. Benoem expliciet welke sessie wordt verplaatst en wanneer je daarna traint.

4. **Frictie — vroeg afronden oogt als alles voltooid hebben**  
   **Schermen:** Afronden → Klaar.  
   Ik stop bij oefening 3 van 7, maar krijg “Full-body afgerond” met zeven gevulde segmenten. Volgens de vastgelegde beeldtaal betekenen die segmenten oefeningsvoortgang. Het resultaat weerspreekt dus wat ik heb gedaan.  
   **Richting:** geef gedeeltelijk afronden een eigen resultaattoestand met de werkelijke voortgang. Maak ook duidelijk dat van de huidige oefening nog een set openstond; alleen “vier oefeningen niet aangeraakt” vertelt niet alles.

5. **Frictie — inkorten is een beslissing zonder duidelijk gevolg**  
   **Scherm:** [Afronden](https://fitnessapp-rose-zeta.vercel.app/proto/afronden.html), “Ik heb minder tijd”.  
   “Minder sets, de rest blijft staan” vertelt niet welke sets vervallen. Na de tik kom ik terug zonder zichtbare uitleg van de aanpassing. Daardoor weet ik niet welk korter programma ik nu volg.  
   **Richting:** benoem vóór de keuze concreet wat overblijft, bijvoorbeeld één werkset per resterende oefening **als dat de bedoelde regel is**. Laat die wijziging daarna terugkomen in de sessie.

6. **Frictie — de uitzondering voor grote getalcorrecties ontbreekt**  
   **Schermen:** Setinvoer en Set corrigeren.  
   In de keuzes staat “Getal intypen”, maar op deze schermen ontbreekt die bediening. Het correctievoorbeeld bevat 110 herhalingen: met stappen van één vraagt corrigeren naar 11 om 99 tikken.  
   **Richting:** voeg de al afgesproken directe invoer toe, bijvoorbeeld door op het getal te tikken. Tijdens de sessie bestaat “Set 1 opslaan”; in historie ontbreekt zo’n bevestiging. Kies ook daarvoor één herkenbare opslagwerkwijze.

7. **Frictie — bij de eerste training belooft de primaire knop de verkeerde actie**  
   **Scherm:** [Sessie zonder historie](https://fitnessapp-rose-zeta.vercel.app/proto/sessie-eerste.html).  
   Alle waarden zijn leeg en geen set is duidelijk actief, maar de primaire actie heet al “Set vastleggen”. Die opent vervolgens invoer. Je moet dus eerst raden waar je begint en daarna ontdekken dat “vastleggen” hier iets anders betekent.  
   **Richting:** maak de eerste in te vullen set actief. Gebruik “Set vastleggen” pas wanneer er daadwerkelijk iets vast te leggen is.

8. **Frictie — tijdens rust verdwijnt de oefeningscontext**  
   **Scherm:** [Sessie — rust](https://fitnessapp-rose-zeta.vercel.app/proto/sessie-rust.html).  
   De oefeningnaam verdwijnt uit de kop, terwijl de tabel en video blijven staan. “Oefening aanpassen” verwijst daardoor naar een oefening die nergens meer wordt genoemd. Daarnaast leiden “Overslaan” en “Verder met Zittende row” naar dezelfde bestemming, zonder duidelijk verschil.  
   **Richting:** behoud de huidige oefeningnaam naast de ruststatus, zoals het overzicht beschrijft. Maak duidelijk of “Verder” de rust beëindigt of alvast de volgende oefening opent; voeg de acties samen als ze hetzelfde doen.

9. **Gemiste kans — Klaar geeft een verklaring die niet uit de invoer volgt**  
   **Scherm:** [Klaar](https://fitnessapp-rose-zeta.vercel.app/proto/klaar.html).  
   Bij Leg curl staat “voelde zwaar”, maar nergens in de doorlopen invoer geef ik dat aan. De app lijkt daardoor mijn ervaring te kennen. “Bereik gehaald” bij Chest press is ook minder precies dan “bovenkant van je bereik” elders.  
   **Richting:** verklaar voorstellen met daadwerkelijk vastgelegde gegevens en gebruik overal dezelfde formulering voor dezelfde trainingsregel. Extra gevoelsinvoer is hiervoor niet nodig.

**Wat goed werkt:** de eigen kolom voor vorige prestaties ondersteunt vergelijken zonder iets te onthouden. De keuze om een open sessie bewust te hervatten geeft controle. Ook de scheiding tussen oefening aanpassen en sessie afronden is logisch: iedere ingang heeft een herkenbare scope.
