# UC-006 — Pauzeren, stoppen of overslaan (flowchart)

Herzien: minimaliseren, be&euml;indigen en een sheet sluiten zijn drie verschillende dingen.

```mermaid
graph TD
    Active[Actieve sessie] --> What{Wat wil de sporter?}

    What -->|Sheet dichtdoen| CloseSheet([Sluiten])
    CloseSheet --> Active

    What -->|Even weg uit de app| Minimize([Minimaliseren])
    Minimize --> Today[Vandaag met kaart 'Sessie loopt']
    Today -->|Verder trainen| Resume[/Verder trainen/]
    Resume --> Active

    What -->|App sluit onverwacht| Saved>Alles op apparaat bewaard]
    Saved --> Today

    What -->|Echt stoppen| Stop[/Pauzeren of stoppen/]
    Stop --> How{Hoe stoppen?}
    How -->|Afronden met wat er is| Summary[Afronden]
    How -->|Afbreken| Abort>Invoer blijft, telt niet als uitgevoerd]
    How -->|Verplaatsen naar andere dag| Move>Week schuift, geen inhaalschuld]
    How -->|Bewust overslaan| Skip>Telt mee in consistentie, niets in te halen]
    Abort --> Today
    Move --> Today
    Skip --> Today

    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    classDef overlay fill:#f0f0f0,stroke:#999,stroke-dasharray:4 3
    classDef decision fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef action fill:#d4edda,stroke:#28a745,stroke-width:1px
    class Active,Today,Summary screen
    class Stop,Resume overlay
    class What,How decision
    class CloseSheet,Minimize action
```

Alleen de takken onder &laquo;Echt stoppen&raquo; veranderen de status van de sessie.
[B p.19, principe 4]
