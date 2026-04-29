# Undercover Online

Jeu Undercover multijoueur en ligne, jouable entre amis sur mobile.

## Stack

- **Frontend** : Nuxt 4 + Vue 3 + TypeScript
- **UI** : NuxtUI v4 + Tailwind CSS v4
- **Styling custom** : SCSS Modules (layouts, composants spécifiques au jeu)
- **Backend** : Supabase v2 (Postgres + Realtime) + Netlify Functions
- **Hosting** : Netlify (free tier)
- **Node** : 24.15.0 LTS (géré via `n`)

## Docs

- [Règles du jeu](docs/01-regles.md)
- [Conception technique](docs/02-conception.md)
- [Roadmap](docs/03-roadmap.md)

## Prérequis

```bash
n 24.15.0   # switcher sur la bonne version Node
```

## Installation

```bash
pnpm install
cp .env.example .env   # puis renseigner les vraies clés Supabase
pnpm dev
```

## Commandes

```bash
pnpm dev        # serveur de développement
pnpm build      # build production
pnpm lint       # ESLint + StyleLint
pnpm lint-fix   # auto-fix
```
