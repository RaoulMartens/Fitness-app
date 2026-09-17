# UC-010 - toestanden

```mermaid
stateDiagram-v2
  [*] --> Concept
  Concept --> Concept: antwoord of terug
  Concept --> Knelt: beschikbare tijd te kort
  Concept --> NietOndersteund: andere context
  Concept --> Voorstel: antwoorden passen
  Knelt --> Voorstel: gebruiker bevestigt meer tijd
  Knelt --> NietOndersteund: beschikbare tijd behouden
  NietOndersteund --> Concept: antwoord corrigeren
  Voorstel --> Concept: iets aanpassen
  Voorstel --> Opslaan: Zo beginnen
  Opslaan --> Fout: opslag geweigerd
  Fout --> Opslaan: opnieuw proberen
  Opslaan --> Geaccepteerd: opgeslagen
  Geaccepteerd --> Concept: antwoorden aanpassen
  Concept --> Geaccepteerd: wijzigingen laten vervallen
```

Een geaccepteerd voorbeeld blijft bestaan tijdens het bewerken. Een nieuw concept overschrijft
dit pas na opnieuw 'Zo beginnen'. Echte planversies en actieve sessies vallen buiten het klikmodel.
