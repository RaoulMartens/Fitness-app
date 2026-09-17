# UC-008 - Plan

```mermaid
flowchart TD
    Today[Vandaag] <-->|Tabbalk| Plan[Trainingsweek]
    Plan -->|Trainingsdagen aanpassen| Edit[Dagen aanpassen]
    Edit --> Choice{Keuze}
    Choice --> Saturday[Zaterdag]
    Choice --> Sunday[Zondag]
    Choice --> None[Nog niet inplannen]
    Saturday --> Save[Planning opslaan]
    Sunday --> Save
    None --> Save
    Save --> Plan
    Edit -->|Annuleren of terug| Plan
    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    class Today,Plan,Edit screen
```
