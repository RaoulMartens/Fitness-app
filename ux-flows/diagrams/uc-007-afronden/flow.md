# UC-007 — Sessie afronden en feedback (flowchart)

Herzien: synchronisatie loopt op de achtergrond. Alleen een echt probleem onderbreekt.

```mermaid
graph TD
    Last[Laatste set vastgelegd] --> Summary[Afronden]
    Summary --> Diff([Toon verschil met vorige keer])
    Diff --> NeedQ{Onzekere interpretatie?}
    NeedQ -->|Nee| Straight>Geen vragenlijst]
    NeedQ -->|Ja| Ask([Eén gerichte vraag])
    Ask --> Consequences[Gevolgen]
    Straight --> Consequences
    Consequences --> Short([Korte reden per wijziging])
    Short --> Deep>Uitgebreidere uitleg alleen op verzoek]
    Short --> Verdict{Sporter beslist}
    Verdict -->|Accepteren| Apply>Nieuwe planversie, vorige bewaard]
    Verdict -->|Corrigeren| Ask
    Verdict -->|Afwijzen| Keep>Plan ongewijzigd, registratie blijft]
    Apply --> Today[Vandaag]
    Keep --> Today

    Apply -.-> Sync[Systeemstate: synchroniseren]
    Sync -.->|Lukt| Quiet>Stil: gesynchroniseerd]
    Sync -.->|Geen verbinding| Queue>Stil: op apparaat opgeslagen]
    Sync -.->|Probleem| Problem[Probleem met synchroniseren]
    Problem --> Today

    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    classDef system fill:#f6f6f6,stroke:#bbb,stroke-dasharray:2 2
    classDef decision fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef action fill:#d4edda,stroke:#28a745,stroke-width:1px
    class Last,Summary,Consequences,Today screen
    class Sync,Problem system
    class NeedQ,Verdict decision
    class Diff,Ask,Short action
```

De drie stille statussen (op apparaat opgeslagen, synchroniseren, gesynchroniseerd) staan klein in
beeld en vragen niets. Alleen &laquo;probleem met synchroniseren&raquo; is een bestemming.
