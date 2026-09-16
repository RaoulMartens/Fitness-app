# M1 - verificatie, 16 september 2026

Werkende low-fidelity versie op basis van exercise.html, met expliciete testdata.
Persoonlijk programma, timer, daadwerkelijke video's en accounts vallen buiten deze stap.

## Uitgevoerd

- TypeScript-controle en productiebuild inclusief PWA-manifest en service worker.
- Acht opslagtests: herstel, dubbel bevestigen, transactie terugrollen, revisies/conflicten,
  verouderde concepten, afronden met concepten, dubbele sessiestart en invoervalidatie.
- Vier Chromium-browsertests: volledige setflow met sheet en correctie, offline herladen,
  oude registraties, zichtbare opslagfout en herstel, twee vensters, volledige browserherstart
  met hetzelfde profiel terwijl het toestel offline is.
- Visuele inspectie op 375px en desktop. Grijstinten, eenvoudige randen en bestaande hiërarchie;
  geen definitieve branding of decoratieve animaties. Schermafbeeldingen staan in deze map.
- Browsercontrole via agent-browser: pagina laadt, echte invoervelden aanwezig, geen consolefouten.

## Grenzen

WebKit kon op deze Windows-machine niet starten: Windows Application Control blokkeert
harfbuzz.dll. Beveiligingsbeleid is niet veranderd. De WebKit-tests staan apart klaar en zijn
niet als geslaagd geteld. Raoul bevestigde op 16 september 2026 na de instructie om de app op
zijn iPhone te installeren, te sluiten/heropenen en offline te proberen: 'Ja het werkt volledig,
dus we kunnen door'. De telefoontest is daarmee door de gebruiker bevestigd. Toestelmodel,
iOS-versie en afzonderlijke teststappen zijn niet door Codex vastgelegd.

Het eerste browserherstartonderzoek gebruikte een te lang profielpad onder test-results.
Een kort, tijdelijk browserprofiel verhelpt het Windows-padprobleem. De test bewaart het profiel
tussen afsluiten en heropenen en verwijdert alleen zijn eigen gecontroleerde tijdelijke map.

Lokale gegevens blijven afhankelijk van de browseropslag. Geen cloudsynchronisatie of export
in deze versie. Er zijn geen gegevens naar een server verstuurd.
