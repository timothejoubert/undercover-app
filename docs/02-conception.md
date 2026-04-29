# Conception technique — Undercover Online

## Stack

| Couche | Techno |
|---|---|
| Frontend | Nuxt 4 + Vue 3 + TypeScript |
| UI Components | NuxtUI v4 (Tailwind CSS v4) |
| Styling custom | SCSS Modules (include-media, variables) |
| Backend / DB | Supabase v2 (Postgres + Realtime) |
| Serverless logic | Netlify Functions |
| Hosting | Netlify (free tier) |
| Node | 24.15.0 LTS |

---

## Architecture CSS (deux couches)

```
app/assets/css/main.css     ← @import "tailwindcss" + @import "@nuxt/ui"
app/assets/scss/main.scss   ← styles globaux custom (typography, theme)
```

**Règle** : les composants UI (boutons, inputs, cards...) utilisent les composants NuxtUI (`UButton`, `UInput`, `UCard`...). Le SCSS sert uniquement pour les layouts de pages et les composants spécifiques au jeu (carte de rôle, timer, badge joueur...).

---

## Modèle de données (Supabase)

### `rooms`
```sql
id          uuid PRIMARY KEY
code        varchar(6) UNIQUE   -- code court pour rejoindre
host_id     uuid                -- joueur hôte
status      enum('lobby', 'playing', 'voting', 'result', 'ended')
options     jsonb               -- config de la partie
word_pair   jsonb               -- { civil: string, undercover: string }
created_at  timestamp
```

### `players`
```sql
id          uuid PRIMARY KEY
room_id     uuid REFERENCES rooms
name        varchar(32)
role        enum('civil', 'undercover', 'mr_white') -- jamais exposé côté client
word        text                -- null si Mr. White
is_alive    boolean DEFAULT true
joined_at   timestamp
```

### `rounds`
```sql
id          uuid PRIMARY KEY
room_id     uuid REFERENCES rooms
number      int
status      enum('describing', 'voting', 'ended')
```

### `descriptions`
```sql
id          uuid PRIMARY KEY
round_id    uuid REFERENCES rounds
player_id   uuid REFERENCES players
content     text
created_at  timestamp
```

### `votes`
```sql
id          uuid PRIMARY KEY
round_id    uuid REFERENCES rounds
voter_id    uuid REFERENCES players
target_id   uuid REFERENCES players
```

---

## Architecture des pages Nuxt

```
/                       → Landing : créer ou rejoindre une room
/room/[code]            → Lobby (attente des joueurs)
/room/[code]/game       → Partie en cours
/room/[code]/result     → Fin de partie, révélation des rôles
```

---

## Flux temps réel (Supabase Realtime)

Chaque client s'abonne au channel de sa room :

```
room:{code}
  ├── player:joined       → un joueur rejoint le lobby
  ├── player:left         → un joueur quitte
  ├── game:started        → l'hôte lance la partie
  ├── round:new           → nouveau tour
  ├── description:added   → quelqu'un a décrit
  ├── vote:cast           → quelqu'un a voté
  ├── player:eliminated   → résultat du vote
  └── game:ended          → fin de partie + révélation
```

---

## Logique serveur (Netlify Functions)

Les actions sensibles passent par des fonctions serverless pour éviter la triche côté client :

| Fonction | Route | Rôle |
|---|---|---|
| `create-room` | POST /api/room | Créer room + code unique |
| `join-room` | POST /api/room/join | Rejoindre avec un code |
| `start-game` | POST /api/room/start | Distribuer rôles + mots |
| `submit-vote` | POST /api/vote | Enregistrer un vote |
| `resolve-vote` | POST /api/vote/resolve | Calculer élimination |
| `mr-white-guess` | POST /api/mr-white | Valider tentative de Mr. White |

---

## Sécurité

- Les rôles et mots ne sont **jamais exposés côté client** dans la DB publique
- Supabase RLS (Row Level Security) : chaque joueur ne voit que son propre mot
- Validation de toutes les actions côté Netlify Function

---

## Gestion de l'état côté client

Pas de store dédié (Pinia retiré) — on utilise les primitives Nuxt + VueUse :

```ts
// État partagé entre composants
const phase = useState<GamePhase>('game-phase', () => 'lobby')

// Persistance localStorage (survit aux rechargements)
const playerId = useLocalStorage('undercover:player-id', () => crypto.randomUUID())
const playerName = useLocalStorage('undercover:player-name', () => '')

// État serveur → Supabase Realtime uniquement
```

---

## Theming NuxtUI

Configuré dans `app/app.config.ts` :

```ts
export default defineAppConfig({
    ui: {
        colors: {
            primary: 'violet',
            neutral: 'zinc',
        },
    },
})
```

Les CSS custom properties NuxtUI (`--ui-primary`, `--ui-text-muted`...) sont utilisables dans les `<style module>` SCSS.

---

## Responsive / UX

- Conçu **mobile-first** : chaque joueur joue sur son propre téléphone
- Vue partageable sur grand écran pour suivre la partie (mode spectateur)
