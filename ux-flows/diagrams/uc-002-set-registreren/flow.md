# UC-002 — Set uitvoeren en registreren (flowchart)

Herzien: target effort en actual effort zijn twee verschillende dingen, en de uitwegen zijn
contextueel bereikbaar vanaf de oefening zelf.

```mermaid
graph TD
    Exercise[Oefening] --> Show([Toon voorschrift: reps, rust en target effort])
    Show --> Prev([Toon vorige uitvoering naast de huidige set])
    Prev --> Choice{Wat doet de sporter?}
    Choice -->|Waarde invullen| Fill([Gewicht en reps])
    Choice -->|Lukt niet| Swap[/Oefening lukt niet/]
    Choice -->|Te zwaar| Hard[/Zwaarder dan verwacht/]
    Choice -->|Minder tijd| Time[/Minder tijd/]
    Fill --> Save([Set vastleggen])
    Save --> Local>Direct op apparaat opgeslagen]
    Local --> Rest[/Rusttimer/]
    Rest --> More{Nog een set?}
    More -->|Ja| Exercise
    More -->|Nee| Actual([Actual effort vastleggen])
    Actual --> Compare{Wijkt actual af van target?}
    Compare -->|Ja| Hard
    Compare -->|Nee| Next{Nog een oefening?}
    Next -->|Ja| Exercise
    Next -->|Nee| Summary[Afronden]

    classDef screen fill:#e8e8e8,stroke:#999,stroke-width:2px
    classDef overlay fill:#f0f0f0,stroke:#999,stroke-dasharray:4 3
    classDef decision fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef action fill:#d4edda,stroke:#28a745,stroke-width:1px
    class Exercise,Summary screen
    class Swap,Hard,Time,Rest overlay
    class Choice,More,Compare,Next decision
    class Show,Prev,Fill,Save,Actual action
```

**Open in deze fase:** wanneer actual effort wordt gevraagd — na iedere set, alleen bij de laatste
set, of achteraf per oefening. Dat blijft expres onbeslist zodat het visueel te toetsen is.

De demo is geen apart scherm: de video staat groot op het oefenscherm en speelt daar.
Schermvullend kijken doet de speler van het toestel zelf.

Progressie blijft dubbele progressie: eerst reps opbouwen binnen het bereik, daarna gewicht.
Bij vaste reps alleen gewicht. [T1 p.11-12]
