# UC-010 - lokale voorbeeldopslag

```mermaid
sequenceDiagram
  actor U as Gebruiker
  participant UI as Vier vragen
  participant M as Ondersteund startschema
  participant S as Eigen tabbladopslag
  U->>UI: Antwoord wijzigen
  UI->>S: Concept en stap bewaren
  U->>UI: Bekijk mijn plan
  UI->>M: Antwoorden controleren
  M-->>UI: Voorstel, tijdknelpunt of ontbrekende variant
  UI-->>U: Gevolg en keuze
  U->>UI: Zo beginnen
  UI->>S: Antwoorden en voorstel samen bewaren
  alt Opslag slaagt
    S-->>UI: Opgeslagen
    UI-->>U: Vandaag met eerste afspraak
  else Opslag mislukt
    S-->>UI: Fout
    UI-->>U: Zelfde voorstel, opnieuw proberen
  end
```

Geen HTTP, accountaanmaak of videodownload. Voor de latere hoofdapp moet dit een atomaire
IndexedDB-transactie met planversie, basisrevisie en bescherming van een actieve sessie worden.
