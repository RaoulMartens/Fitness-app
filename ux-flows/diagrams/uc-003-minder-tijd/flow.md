# UC-003 — Minder tijd vandaag (flowchart)

```mermaid
graph TD
    Before[Vandaag of Sessie-overzicht] --> Adjust[/Pas vandaag aan/]
    Adjust --> PickTime([Kies: minder tijd])
    During[Oefening tijdens de training] -->|Direct, zonder tussenmenu| PickTime
    PickTime --> HowMuch{Hoeveel tijd is er?}
    HowMuch -->|Ongeveer de helft| Proposal[Voorstel: ingekorte sessie]
    HowMuch -->|Een kwartier| Proposal
    HowMuch -->|Zelf invullen| Proposal
    Proposal --> ShowDiff([Toon wat vervalt, wat verschuift, wat blijft])
    ShowDiff --> Scope>Geldt alleen vandaag, niveau blijft gelijk]
    Scope --> Fits{Past de wens?}
    Fits -->|Nee| Tradeoff([Benoem compromis: frequentie, duur of prioriteit])
    Tradeoff --> Decide{Keuze van de sporter}
    Fits -->|Ja| Decide
    Decide -->|Accepteren| Exercise[Oefening met ingekorte sessie]
    Decide -->|Aanpassen| Proposal
    Decide -->|Afwijzen| Before

    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    classDef overlay fill:#f0f0f0,stroke:#999,stroke-dasharray:4 3
    classDef decision fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef action fill:#d4edda,stroke:#28a745,stroke-width:1px
    class Before,During,Proposal,Exercise screen
    class Adjust overlay
    class HowMuch,Fits,Decide decision
    class PickTime,ShowDiff,Tradeoff action
```

Voor de training is &laquo;Pas vandaag aan&raquo; het verzamelpunt. Tijdens het trainen staat 
Minder tijd direct bij de oefening, zodat niemand eerst door een probleemmenu hoeft.
