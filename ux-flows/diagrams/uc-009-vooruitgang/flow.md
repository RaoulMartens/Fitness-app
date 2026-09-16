# UC-009 — Vooruitgang bekijken (flowchart, dunne rand)

Herzien: vier betekenissen, en geen samengestelde doelontwikkeling.

```mermaid
graph TD
    Today[Vandaag] --> Progress[Vooruitgang]
    Progress --> Four([Vier gescheiden blokken])
    Four --> C[Consistentie: gepland versus uitgevoerd]
    Four --> P[Oefenprestatie: gewicht en reps per oefening]
    Four --> T[Ontwikkeling van het trainingsplan]
    Four --> H[Herstel en context]
    C --> Scale{Welke tijdschaal?}
    P --> Scale
    T --> Scale
    H --> Scale
    Scale -->|Sessie| S1[Per sessie]
    Scale -->|Week| S2[Per week]
    Scale -->|Langer| S3[Langere termijn]
    S3 --> Enough{Genoeg data?}
    Enough -->|Nee| Honest[Nog geen historie]
    Enough -->|Ja| Trend>Trend met periode en meetbasis]

    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    classDef system fill:#f6f6f6,stroke:#bbb,stroke-dasharray:2 2
    classDef decision fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef action fill:#d4edda,stroke:#28a745,stroke-width:1px
    class Today,Progress,C,P,T,H,S1,S2,S3 screen
    class Honest system
    class Scale,Enough decision
    class Four action
```

**Ontwikkeling van het trainingsplan** gaat over waar het programma staat: repbereiken,
gewichtsverhogingen, blijvende vervangingen, blok en week. Dat is iets anders dan wat het lichaam
doet. Lichaamsgewicht staat onder herstel en context, expliciet als context en niet als meting van
spiergroei of vetverlies. De bronnen onderbouwen zo'n afleiding niet. [Brief p.3; B p.19, principe 7]
