# UC-008 - Planning en concept

```mermaid
stateDiagram-v2
    [*] --> Weekoverzicht
    Weekoverzicht --> Concept: Dagen aanpassen
    Concept --> Concept: Kiezen of herladen
    Concept --> Weekoverzicht: Annuleren, vorige keuze behouden
    Concept --> Weekoverzicht: Opslaan, nieuwe keuze zichtbaar
    Concept --> Beoordelen: Planvoorstel beoordelen
    Beoordelen --> Concept: Terug naar de app, concept behouden
```
