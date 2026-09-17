# UC-010 - Beoordeling is geen programma-akkoord

```mermaid
stateDiagram-v2
    [*] --> App
    App --> Voorstel: Bewaar scherm van herkomst
    Voorstel --> Compromis: Minder tijd
    Compromis --> Compromis: Geen keuze, toon uitleg
    Compromis --> Gevolg: Bekijk gevolg van keuze
    Gevolg --> Compromis: Sheet sluiten
    Gevolg --> Voorstel: Terug naar voorstel
    Compromis --> Voorstel: Terug
    Voorstel --> App: Herstel scherm van herkomst
```
