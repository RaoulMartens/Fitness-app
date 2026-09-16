# UC-010 — Onboarding en eerste plan (flowchart)

```mermaid
graph TD
    Start((Eerste keer)) --> Welcome[Welkom]
    Welcome -->|Heb al een account| Login[Aanmelden]
    Welcome --> Q1[Doel]
    Q1 --> Q2[Ervaring]
    Q2 --> Q3[Dagen en tijd]
    Q3 --> Q4[Waar en beperkingen]
    Q4 --> Build([Plan samenstellen])
    Build --> Fits{Past het binnen de randvoorwaarden?}
    Fits -->|Ja| Proposal[Planvoorstel]
    Fits -->|Nee| Tradeoff[Compromis: frequentie, duur of prioriteit]
    Tradeoff --> Choose([Sporter kiest])
    Choose --> Proposal
    Proposal -->|Iets aanpassen| Tradeoff
    Proposal -->|Zo beginnen| Login
    Login --> Download[Eerste download]
    Download --> Today[Vandaag]
    Download -.->|Geen wifi| Partial>Tekstcues staan er wel, trainen kan]
    Partial --> Today

    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    classDef decision fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef action fill:#d4edda,stroke:#28a745,stroke-width:1px
    class Welcome,Q1,Q2,Q3,Q4,Proposal,Tradeoff,Login,Download,Today screen
    class Fits decision
    class Build,Choose action
```

Vier vragen, niet meer. Gewichten worden bewust niet gevraagd: die leert de app tijdens de eerste
sessie kennen. Dat volgt het uitgangspunt uit de brief om later extra gegevens te verzamelen
wanneer die een beslissing verbeteren. [Brief p.1]
