# UC-005 — Zwaarder dan verwacht (flowchart)

```mermaid
graph TD
    Set[Set vastgelegd] --> Check{Actual effort boven target effort, of zelf gemeld?}
    Check -->|Nee| Continue>Geen extra vraag]
    Check -->|Ja| Ask([Eén gerichte vraag: hoe kwam dat?])
    Ask --> Reason{Verklaring}
    Reason -->|Dagvorm| Day[Tijdelijk lichter vandaag]
    Reason -->|Techniek| Tech[Cues en lichter gewicht deze oefening]
    Reason -->|Structureel te zwaar| Struct[Voorstel voor komende trainingen]
    Day --> Effect([Toon gevolg voor rest van de sessie])
    Tech --> Effect
    Struct --> Duration([Kies duur van de aanpassing en terugkeer])
    Duration --> Effect
    Effect --> Verdict{Sporter beslist}
    Verdict -->|Accepteren| Apply>Aanpassing vastgelegd met zichtbare reikwijdte]
    Verdict -->|Corrigeren| Reason
    Verdict -->|Afwijzen| Keep>Registratie blijft, plan blijft]
    Apply --> Exercise[Volgende oefening]
    Keep --> Exercise
    Continue --> Exercise

    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    classDef decision fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef action fill:#d4edda,stroke:#28a745,stroke-width:1px
    class Set,Day,Tech,Struct,Exercise screen
    class Check,Reason,Verdict decision
    class Ask,Effect,Duration action
```

Bereikbaar via de knop 'Te zwaar' bij de oefening zelf, als sheet.
Alleen doorvragen wanneer het antwoord de vervolgstap verandert. Een slechte dag mag het
langetermijndoel niet ongemerkt wijzigen. [B p.7 en p.19, principe 6]
