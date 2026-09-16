---
version: 1
slug: "public-m2-voorstel-index-html"
primary_target: "public/m2-voorstel/index.html"
related_targets: ["public/m2-voorstel/style.css","public/m2-voorstel/prototype.js"]
---

# M2-ontwerpvoorstel

Modus: Operate. Status: gebouwd klikmodel, ter beoordeling; geen goedgekeurd trainingsprogramma.

## Taak en richting

Raoul beoordeelt een full-bodytraining op woensdag en een tweede sessie in het weekend die hij zelf kiest. De bestaande grijze wireframewereld blijft leidend: systeemtypografie, gestippelde randen, eenvoudige vlakken, zichtbare focus en aanraakdoelen vanaf 44px. Dit is een gerichte uitbreiding, zonder nieuwe visuele identiteit. DESIGN.md en PRODUCT.md blijven de globale context; m2-ontwerpvoorstel.md bevat de inhoudelijke keuzes en open besluiten.

## Gebouwde surface

Vandaag toont de relevante start-, hervat- of samenvattingsactie. De hoofdstroom is Vandaag -> warming-up -> oefening met setinvoer -> inline rust -> volgende set/oefening -> expliciet afronden -> samenvatting en gevolgen. Het voorstel bevat zeven oefeningen met elk twee werksets. Eerste werkgewichten zijn leeg; eerdere prestaties worden niet verzonnen.

Rust blijft bij de oefening en de geregistreerde sets. De timer gebruikt een eindtijd; bij nul blijft de ruststatus zichtbaar totdat de gebruiker doorgaat. Extra rust voegt 30 seconden toe. Naar Vandaag navigeren laat de timer lopen; pauzeren bewaart de resterende tijd. Ook na de laatste set is afronden een aparte bevestigde actie. Afronden en afbreken bewaren bevestigde voorbeeldsets en waarschuwen voor open conceptinvoer.

Native HTML-dialogs functioneren als sheets voor uitleg, hervatten, weekendkeuze en bevestigingen. Ze openen boven de huidige context, plaatsen focus op de titel en sluiten zonder sets of concepten te veranderen. Vandaag en Plan vormen de hoofdnavigatie; planvoorstel en compromis zijn aanvullende beoordelingsschermen.

De telefoonweergave vult de beschikbare breedte; op grotere schermen blijft de surface maximaal 430px breed. De reviewbanner benoemt permanent dat dit een ontwerpvoorstel is. Scherm aanhouden tijdens rust is optioneel, met zichtbare melding bij ontbrekende ondersteuning, weigering of intrekking; een rustsignaal bij vergrendeling wordt niet beloofd.

## Grens en open punten

Alle invoer is previewdata in sessionStorage onder training-m2-design-v1. Herladen in hetzelfde tabblad herstelt het voorbeeld; dit is geen duurzame trainingshistorie of offline-app en raakt de M1-database niet. Opslagproblemen worden zichtbaar gemeld.

Programmagoedkeuring, apparaatinstellingen, gewichtsstappen, passende demonstratiemedia en precieze warming-upinstructies staan open. De demo benoemt ontbrekende inhoud. Automatische progressie blijft achterwege zolang apparaat- en inspanningsinformatie onvoldoende betrouwbaar zijn. Het klikmodel bewijst nog geen echte M2-opslag, herstel na appherstart of iPhonegedrag bij vergrendeling. Die implementatie en praktijktest volgen na beoordeling.
