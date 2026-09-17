# UC-004 - toestanden

```mermaid
stateDiagram-v2
  [*] --> Ongewijzigd
  Ongewijzigd --> Concept: sheet openen
  Concept --> Ongewijzigd: sluiten of terug
  Concept --> Bevestigen: geldig voorstel
  Bevestigen --> Concept: bijstellen
  Bevestigen --> Opslaan: akkoord
  Opslaan --> Fout: opslag mislukt
  Fout --> Opslaan: opnieuw proberen
  Fout --> Ongewijzigd: annuleren
  Opslaan --> Aangepast: lokaal opgeslagen
  Aangepast --> Ongewijzigd: aanpassing herstellen waar toegestaan
```

Bij UC-006: pauzeren is hervatbaar, afronden/afbreken is een expliciete eindstatus.
In het klikmodel zijn afspraakverplaatsingen en eindstatussen niet terugdraaibaar; alleen
sessieaanpassingen hebben herstel zolang de uitvoering actief of gepauzeerd is.
