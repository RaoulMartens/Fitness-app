# M2 - schermrollen en navigatie

Deze gerichte kaart vervangt de gemengde navigatie in het M2-klikmodel. De volledige productkaart
blijft [../diagrams/screen-map.md](../diagrams/screen-map.md); PPL-voorbeeldinhoud blijft daar referentie.

```mermaid
flowchart TD
    Today[Vandaag] <-->|Tabbalk| Plan[Plan: trainingsweek]
    Today -->|Bekijk de sessie| Overview[Sessie-overzicht]
    Overview -->|Terug| Today
    Today -->|Start training| Warmup[Warming-up]
    Overview -->|Start training| Warmup
    Warmup --> Exercise[Oefening en rust]
    Exercise --> Summary[Sessie afgerond of afgebroken]
    Summary --> Consequences[Volgende keer]
    Consequences -->|Terug naar sessie| Summary
    Summary --> Today
    Consequences --> Today
    Exercise -->|Sessie blijft lopen| Today
    Today -.->|Verder trainen| Resume[Hervatsheet]
    Resume --> Exercise
    Plan -->|Trainingsdagen aanpassen| Edit[Dagen aanpassen]
    Edit -->|Opslaan of annuleren| Plan
    Review[Beoordelingsbalk buiten de app] --> Proposal[Planvoorstel]
    Proposal --> Compromise[Compromis]
    Compromise --> Proposal
    Proposal -->|Terug naar de app| Origin[Eerder geopend scherm]
    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    classDef sheet fill:#f0f0f0,stroke:#999,stroke-dasharray:4 3
    class Today,Plan,Overview,Warmup,Exercise,Summary,Consequences,Edit,Proposal,Compromise screen
    class Resume sheet
```

Hervatten keert terug naar de opgeslagen fase; dat kan ook warming-up zijn. Rust blijft een
substate bij de oefening. Sheets sluiten laat het scherm eronder staan. De tabbalk is alleen op
Vandaag en Plan zichtbaar. Beide zijn hoofdbestemmingen en hebben geen kunstmatige terugknop.
Plan biedt geen duplicaat van de sessielijst en geen ingang naar onboarding.

Het klikmodel toont een woensdagvoorbeeld, geen kalendergestuurde planner. De weekendkeuze
plant geen tweede uitvoerbare sessie in dit model; dat blijft werk voor de echte M2/planning.
