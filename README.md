# Trainingsapp

Persoonlijke trainings-PWA voor één gebruiker. Nederlands, telefoon, alles lokaal op het
toestel. Geen server, geen accounts.

De app wordt op dit moment herbouwd volgens [bouwdocument-v1.md](bouwdocument-v1.md).
Het ontwerp ligt vast als klikbaar low-fi prototype; de schermen worden daar één voor één
op gebouwd.

## Waar wat staat

| Pad | Wat |
| --- | --- |
| `public/proto/` | Het klikbare ontwerp. Begin bij `index.html`, de onderbouwing staat in `overzicht.html` |
| `src/workout/` | De app: opslag, model, trainingsregels |
| `bouwdocument-v1.md` | Wat er gebouwd wordt, in welke volgorde, en waarom |
| `ux-flows/` | Flows, use cases en de interactiechecks |

## Starten

Node.js 22.12 of nieuwer.

```sh
npm ci
npm run dev          # de app, op http://127.0.0.1:5173
npx vite public/proto --port 5174   # het prototype, op http://localhost:5174
```

Voor offline gebruik en installatie:

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Gebruik bij terugkomen hetzelfde adres: `localhost` en `127.0.0.1` hebben elk hun eigen opslag.

## Testen

```sh
npm test                          # model, regels en opslag
npm run test:e2e                  # Playwright op mobiel formaat
```

De trainingsregels uit sectie 4 van het bouwdocument staan als pure functies in
`src/workout/rules.ts`, met een test per geval in `rules.test.ts`.

## Publiceren

Elke push naar `main` rolt uit naar Vercel:

- **App:** https://fitnessapp-rose-zeta.vercel.app
- **Prototype:** https://fitnessapp-rose-zeta.vercel.app/proto/index.html

De app staat open. Afschermen is teruggedraaid: zie sectie 6.5 van het bouwdocument.

GitHub Pages staat niet aan voor deze repo; de workflow `Publish test app` faalt daarom.
Vercel is het werkende kanaal.

## Stand van zaken

Stap 1 en 2 van het bouwdocument zijn af: de M1-code en de oude voorstelroutes zijn weg, de
opslag is in één keer schoon overgegaan naar versie 3, en de oefeningencatalogus plus alle
trainingsregels staan er met tests. De schermen zelf komen in stap 3; tot die tijd toont de
app een tijdelijk scherm.
