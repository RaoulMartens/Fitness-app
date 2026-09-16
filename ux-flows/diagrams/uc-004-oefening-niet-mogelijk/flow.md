# UC-004 — Oefening niet mogelijk (flowchart)

```mermaid
graph TD
    Exercise[Oefening] -->|Knop 'Lukt niet' bij de oefening| Cant([Kan deze oefening niet doen])
    Cant --> Why{Wat is de aanleiding?}
    Why -->|Materiaal bezet| Reorder[Andere volgorde voorstellen]
    Why -->|Materiaal ontbreekt| Subs[Substituties tonen]
    Why -->|Pijn| Pain[Pijnroute]
    Reorder --> BackLater>Later terugkomen op deze oefening]
    BackLater --> Exercise
    Subs --> PickSub{Optie 1 of optie 2?}
    PickSub --> Scope{Alleen vandaag of blijvend?}
    Scope -->|Vandaag| TodayOnly>Eenmalige vervanging]
    Scope -->|Blijvend| Pref>Voorkeur opgeslagen, terug te draaien]
    TodayOnly --> Exercise
    Pref --> Exercise
    Pain --> PainOpts{Wat wil de sporter?}
    PainOpts -->|Overslaan| Skip>Oefening vervalt, gevolg zichtbaar]
    PainOpts -->|Stoppen| Interrupt[[Onderbreken: UC-006]]
    PainOpts -->|Andere oefening| Subs
    Skip --> Exercise
    Subs -->|Geen passend alternatief| Skip

    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    classDef decision fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef action fill:#d4edda,stroke:#28a745,stroke-width:1px
    class Exercise,Subs,Reorder,Pain screen
    class Why,PickSub,Scope,PainOpts decision
    class Cant action
```

De app stelt geen diagnose. Pijn leidt tot overslaan of stoppen, nooit tot een oordeel over
de sporter of een automatische verlaging van het niveau. [Brief p.2; T1 p.27]

Dit is een sheet over de oefening: sluiten brengt je terug bij de set, zonder dat er
iets aan de sessie verandert.
