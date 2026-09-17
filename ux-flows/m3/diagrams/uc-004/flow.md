# UC-004 - Oefening lukt niet

```mermaid
flowchart TD
  A[Oefening] --> B[Bezet, geen materiaal of pijn - sheet]
  B --> C[Later doen of overslaan bekijken]
  C --> D{Bevestigen?}
  D -->|Nee of Sluiten| E[Volgorde en sets gelijk]
  E --> A
  D -->|Ja| F[Open oefening later of overgeslagen]
  F --> A
  C -->|Bijstellen| B
  classDef screen fill:#f5f5f5,stroke:#888
  classDef sheet fill:#e8e8e8,stroke:#888,stroke-dasharray:5 5
  class A,F,E screen
  class B,C sheet
```
