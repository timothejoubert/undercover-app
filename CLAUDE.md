# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Nuxt 4 + Vue 3 + TypeScript |
| UI Components | NuxtUI v4 (Tailwind CSS v4) |
| Custom styles | SCSS Modules + include-media |
| Backend | Supabase v2 (Postgres + Realtime) |
| Serverless | Netlify Functions (`server/api/`) |
| Node | 24.15.0 LTS |

## Commands

```bash
pnpm dev        # dev server
pnpm build      # production build
pnpm lint       # ESLint + StyleLint
pnpm lint-fix   # auto-fix
```

To regenerate Supabase types after schema changes:
```bash
supabase gen types typescript --local > app/types/database.types.ts
```

---

## Architecture

### Nuxt 4 structure

All app code lives under `app/` (Nuxt 4 convention). Server routes go in `server/api/`.

### Database schema (Supabase)

Four tables drive the entire game:

- **`rooms`** — `id`, `code` (6-char unique join code), `host_id`, `status` (`lobby | playing | voting | result | ended`), `options` (JSON config), `word_pair` (JSON `{ civil, undercover }`)
- **`players`** — `id`, `room_id`, `name`, `role` (`civil | undercover | mr_white`), `word`, `is_alive` — **role and word are never exposed to clients via RLS**
- **`rounds`** — `id`, `room_id`, `number`, `status` (`describing | voting | ended`)
- **`descriptions`** — `id`, `round_id`, `player_id`, `content`
- **`votes`** — `id`, `round_id`, `voter_id`, `target_id`

Security: roles and words are assigned server-side (Netlify Functions) and protected by Row Level Security. A player can only query their own `word` from `players`.

### Game phases

```
lobby → playing → voting → result → ended
```

Rounds cycle through `describing → voting → ended` until win condition met.

### State management

No Pinia. Three sources of truth:
- `useState<T>(key, init)` — shared reactive state between components in same Nuxt context
- `useLocalStorage(key, init)` from VueUse — player identity persisted across sessions (`undercover:player-id`, `undercover:player-name`, `undercover:room-code`)
- Supabase Realtime — live server state pushed to all clients in a room via channel `room:{code}`

### Realtime events

Events published on channel `room:{code}`: `player:joined`, `player:left`, `game:started`, `round:new`, `description:added`, `vote:cast`, `player:eliminated`, `game:ended`.

### Netlify Functions

All sensitive mutations go through `server/api/` (not direct client Supabase calls):
- Room creation (generates unique code)
- Game start (server-side role + word assignment)
- Vote resolution (validates voter is alive, applies elimination)
- Mr. White word guess validation

---

## CSS Architecture

Two distinct layers — do not mix them:

| Layer | File | Usage |
|---|---|---|
| NuxtUI + Tailwind | `assets/css/main.css` | Generic UI components (`UButton`, `UCard`…) |
| SCSS custom | `assets/scss/main.scss` | Page layouts, game-specific components |

Rule: generic UI component → NuxtUI. Game-specific (role card, timer, player badge) → `<style lang="scss" module>`.

---

## Code Conventions

### Vue components

- `script setup` with TypeScript
- `withDefaults(defineProps<{...}>(), {...})` for props
- Custom components in PascalCase prefixed `V` (e.g. `VPlayerCard`)
- 4 spaces, single quotes, no semicolons

### CSS Modules (SCSS)

Always use bracket notation, even without a hyphen:

```vue
<!-- ✅ -->
<div :class="$style['root']">
<div :class="$style['card-footer']">

<!-- ❌ -->
<div :class="$style.root">
```

Conditional classes with `&&`, not object syntax:

```vue
<!-- ✅ -->
:class="[$style['root'], isActive && $style['root--active']]"

<!-- ❌ -->
:class="[$style['root'], { [$style['root--active']]: isActive }]"
```

### Breakpoints (include-media)

```scss
@include media('>=md') { ... }   // ✅ operator required for named breakpoints
@include media('hover') { ... }  // ✅ no operator for media expressions
@include media('md') { ... }     // ❌ missing operator
```

Available: `xs` 375px · `sm` 480px · `md` 768px · `lg` 1024px · `vl` 1280px · `xl` 1440px · `xxl` 1600px · `hd` 1920px

### SCSS in components

- `<style lang="scss" module>` in every custom component
- BEM-like classes: `root`, `root--modifier`, `root__child`
- SCSS variables (`$color-primary`) available via globally injected `_resources.scss`
- CSS custom properties (`var(--ui-primary)`, `var(--color-civil)`) usable everywhere
- No SCSS variables in global files — use `var()` or literals only

### TypeScript

- No `any`
- Ne pas annoter les types de retour que TypeScript peut inférer — annoter uniquement quand l'inférence est impossible (ex : `readBody<T>`, `$fetch<T>`) ou ambiguë
- Types explicites pour les props et emits
- `useId()` pour les IDs d'éléments de formulaire
- Supabase-generated types in `app/types/database.types.ts`
- Types de réponse API partagés dans `app/types/api.ts` — utilisés côté client dans les `$fetch<T>()`, pas comme annotation de retour côté serveur

### NuxtUI theming

Configured in `app/app.config.ts`. Colors: `primary` → violet, `neutral` → zinc.
Customize a NuxtUI component inline with the `class` prop and Tailwind utilities.

---

## Known Issues / Gotchas

- `devtools: false` — IPC bug with Node 24 + Nuxt 4.4.x; re-enable when fixed upstream
- `.env` must exist at startup (even with placeholders) — `@nuxtjs/supabase` crashes without it
- `include-media`: `$media-expressions` must be passed via `@forward ... with (...)`, not defined after
