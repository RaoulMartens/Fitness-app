# M4 - schermrollen

```mermaid
flowchart TD
  S[Startpunt] --> D[1 Doel]
  D --> E[2 Ervaring]
  E --> W[3 Week]
  W --> C[4 Context]
  C --> K{Voorstel beschikbaar?}
  K -->|Ja| V[Planvoorstel]
  K -->|Te weinig tijd| X[Compromis]
  K -->|Andere context| N[Nog geen passend plan]
  X -->|60 minuten bevestigen| V
  X -->|45 minuten behouden| N
  X -->|Week aanpassen| W
  N -->|Antwoord aanpassen| D
  V -->|Antwoorden aanpassen| D
  V -->|Zo beginnen| T[Vandaag]
  T --> O[Sessie-overzicht]
  O --> T
  T <--> P[Plan en antwoorden]
  P -->|Antwoorden aanpassen| D
  classDef screen fill:#f5f5f5,stroke:#888
  class S,D,E,W,C,V,X,N,T,P,O screen
```

UC-010: intake en plan. Vandaag en Plan behouden hun M2-rollen. De infoknop opent een echte
sheet; die is geen nieuwe route. Account en download horen niet in deze lokaal werkende stap.
