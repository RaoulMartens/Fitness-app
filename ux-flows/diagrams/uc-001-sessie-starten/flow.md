# UC-001 — Sessie van vandaag starten (flowchart)

Herzien: de snelste route staat voorop. Het sessie-overzicht is uitleg, geen verplichte stap.

```mermaid
graph TD
    Start((Open app)) --> Today[Vandaag]
    Today --> Running{Loopt er al een sessie?}
    Running -->|Ja, geminimaliseerd| Resume[/Verder trainen/]
    Running -->|Nee| Planned{Sessie gepland vandaag?}
    Planned -->|Nee| RestDay>Rustdag met eigen waarde]
    Planned -->|Ja| Choice([Vandaag toont naam, duur en korte reden])
    Choice -->|Voorkeursactie| StartNow([Start training])
    Choice -->|Wil eerst zien| Overview[Sessie-overzicht]
    Choice -->|Wil meer weten| Why>Waarom deze sessie, op verzoek]
    Overview --> StartNow
    Overview -->|Past niet vandaag| Adjust[/Pas vandaag aan/]
    Why --> Choice
    StartNow --> Lock>Sessie actief en beschermd tegen herplanning]
    Lock --> Warmup[Warming-up]
    Warmup --> Exercise[Oefening 1]
    Resume --> Exercise
    RestDay --> Today

    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    classDef overlay fill:#f0f0f0,stroke:#999,stroke-dasharray:4 3
    classDef decision fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef action fill:#d4edda,stroke:#28a745,stroke-width:1px
    class Today,Overview,Warmup,Exercise screen
    class Resume,Adjust overlay
    class Running,Planned decision
    class Choice,StartNow action
```

De warming-up is begeleid maar niet administratief: alleen de warming-upsets zijn afvinkbaar,
en ook dat is optioneel. [T1 p.20; T2 p.3]
