# UC-006 - Onderbreken en afspraak wijzigen

```mermaid
flowchart TD
  A[Vandaag of Oefening] --> B[Geplande afspraak of actieve uitvoering - sheet]
  B --> C[Datum of eindstatus bevestigen]
  C --> D{Bevestigen?}
  D -->|Nee of Sluiten| E[Sessie en afspraak blijven]
  E --> A
  D -->|Ja| F[Afspraak of uitvoering zichtbaar bijgewerkt]
  F --> A
  C -->|Bijstellen| B
  classDef screen fill:#f5f5f5,stroke:#888
  classDef sheet fill:#e8e8e8,stroke:#888,stroke-dasharray:5 5
  class A,F,E screen
  class B,C sheet
```
