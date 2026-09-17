# M3a - verificatie van het ontwerpvoorstel

17 september 2026.

## Uitgevoerd

- Build inclusief TypeScript en service worker: geslaagd.
- Bestaande opslagtests: 18/18 geslaagd.
- Bestaande Chromium-tests van M1/M2: 11/11 geslaagd, inclusief offline heropenen.
- 21 statische HTML-wireframes: 87 lokale links bestaan; geen scripts of formulieren.
- Syntaxcontrole van het interactieve model: geslaagd.
- Browsercontrole: 17,5 kg / 10 reps ingevoerd bij chest press; bezet > later doen bracht
  de row in beeld. Herladen behield de volgorde; terugdraaien herstelde chest press en invoer.
- Minder tijd: twee oefeningen kiezen; gevolg toont expliciet vervalt/blijft. Browser-terug
  annuleerde zonder invoerverlies. Bij een tweede poging bevestigde Accepteren de selectie.
- Dagvorm: leeg gewicht gaf zichtbare validatie. Doel 15 kg vandaag werd apart getoond;
  bestaande werkelijke conceptinvoer 17,5 kg bleef staan. Pauzeren/hervatten behield beide.
- Afspraak: woensdag 23 september eenmalig verplaatst naar donderdag 24 september.
  Vandaag toont de nieuwe datum; Plan behoudt de vaste woensdag en herkomst van de afspraak.
- Mobiele browserbreedte 375px: sheet visueel bekeken, bevestigingsknoppen bereikbaar,
  gemeten bodybreedte 360px en dialogbreedte 322px; geen horizontale overloop in deze sheet.
- Bestaande lokale service worker onderschepte aanvankelijk de nieuwe voorstelroute. De
  uitsluiting is aangevuld voor M3; na 'Nieuwe versie openen' opende de juiste pagina.
  Het voorstel wordt niet geprecachet als onderdeel van de offline trainingsapp.

## Grenzen

Dit is een beoordeelbaar klikmodel, geen M3-uitbreiding van de hoofdapp. Geen IndexedDB-opslag
voor aanpassingen, server, timer, gecontroleerde vervangers of structureel trainingsalgoritme.
De geautomatiseerde 18/11 tests toetsen de bestaande hoofdapp, niet alle nieuwe klikmodelpaden.
Foutinjectie, alle combinaties van overslaan/herstel, WebKit en een echte iPhone zijn voor dit
nieuwe voorstel niet volledig getest. De browsercontrole hierboven is geen native-iOS-garantie.
Het klikmodel bewaart voorbeelden per tabblad; sluiten van het tabblad kan die gegevens wissen.

## Beoordeling door Raoul

Open `/m3-voorstel/`. Verschijnt de oude hoofdapp, kies 'Nieuwe versie openen'.
Probeer vooral Lukt niet > Bezet, Minder tijd en Te zwaar > Dagvorm.
Via de infoknop is ook 'Voorbeeld voor de training' bereikbaar voor datum/overslaan.
Pas na beoordeling volgt implementatie met blijvende opslag in de hoofdapp.

## Vereenvoudigde beoordeling, 17 september

Na feedback van Raoul zijn de beoordelingsbalk en herhaalde voetnoten vervangen door een
klein Prototype-label en een infoknop. Schermteksten zijn ingekort; setdoel en hoofdactie
krijgen voorrang. Bij 375px is het oefenscherm visueel bekeken, zonder horizontale overloop.
Gewicht 17,5 en 10 herhalingen bleven behouden bij openen/sluiten van de nieuwe infosheet
en daarna openen van Minder tijd. De keuzelijst en reikwijdte blijven zichtbaar.
Build en syntaxcontrole slagen. De 22 statische schermen zijn opnieuw uit dezelfde teksten
gegenereerd. De M2-hoofdapp en opslaglogica zijn niet gewijzigd; de eerdere 18/11-testresultaten
hierboven zijn niet opnieuw gedraaid voor deze presentatiecorrectie.
