# UC-011 — Dagelijkse push-ups (flowchart)

```mermaid
graph TD
    Today[Vandaag of Rustdag] --> Card([Kaart: 26 van 40])
    Card --> Known{Max bekend?}
    Known -->|Nee| Test[Max testen]
    Test --> Set([Eén set tot bijna falen])
    Set --> Target>Dagdoel: 3 sets van ~40% van je max]
    Target --> Sheet[Push-ups vandaag]
    Known -->|Ja| Sheet
    Sheet --> Push{Wat is er vandaag?}
    Push -->|Push-dag in het programma| Skip>Vandaag overgeslagen, geen streakbreuk]
    Push -->|Dag na een zware push-sessie| Half>Doel gehalveerd]
    Push -->|Gewone dag| Full>Doel staat op 40]
    Full --> Log([Set gedaan])
    Half --> Log
    Log --> More{Dagdoel gehaald?}
    More -->|Nee| Sheet
    More -->|Ja| Done>Dag afgevinkt in Volgehouden]
    Skip --> Today
    Done --> Today
    Sheet -->|Elke 3 weken| Test

    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    classDef overlay fill:#f0f0f0,stroke:#999,stroke-dasharray:4 3
    classDef decision fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef action fill:#d4edda,stroke:#28a745,stroke-width:1px
    class Today screen
    class Sheet,Test overlay
    class Known,Push,More decision
    class Card,Set,Log action
```

Het dagdoel deelt belasting met het programma: op een Push-dag slaat de app de push-ups over, de
dag erna halveert hij ze. Dat is wat de brief vraagt over het bewaken van volgorde, herstel en
totale belasting, ook over weekgrenzen. [Brief p.1]

Het is nadrukkelijk **geen** gedeelde sturing: de app claimt niet dat push-ups en het
krachtprogramma samen naar één uitkomst gestuurd worden. De benchmark laat zien dat samen
aanbieden iets anders is dan samen plannen, en dat weer iets anders dan samen sturen. [B p.17]
