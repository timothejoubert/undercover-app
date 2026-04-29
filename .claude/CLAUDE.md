# CLAUDE.md — Undercover Game

## Stack

| Couche | Techno |
|---|---|
| Frontend | Nuxt 4 + Vue 3 + TypeScript |
| UI Components | NuxtUI v4 (Tailwind CSS v4) |
| Styling custom | SCSS Modules + include-media |
| Backend | Supabase v2 (Postgres + Realtime) |
| Serverless | Netlify Functions (`server/api/`) |
| Node | 24.15.0 LTS (`n lts`) |

## Commands

```bash
pnpm dev        # serveur de développement
pnpm build      # build production
pnpm lint       # ESLint + StyleLint
pnpm lint-fix   # auto-fix
```

---

## Architecture CSS

Deux couches distinctes, ne pas les mélanger :

| Couche | Fichier | Usage |
|---|---|---|
| NuxtUI + Tailwind | `assets/css/main.css` | Composants UI (`UButton`, `UCard`...) |
| SCSS custom | `assets/scss/main.scss` | Layouts de pages, composants jeu |

**Règle** : tout ce qui est composant UI générique → NuxtUI. Tout ce qui est spécifique au jeu (carte de rôle, timer, badge joueur) → `<style lang="scss" module>`.

---

## Code conventions

### Composants Vue

- `script setup` avec TypeScript
- `withDefaults(defineProps<{...}>(), {...})` pour les props
- Composants custom en PascalCase préfixés `V` (ex: `VPlayerCard`)
- Composants NuxtUI utilisés tels quels : `UButton`, `UInput`, `UCard`, etc.
- 4 espaces, guillemets simples, pas de point-virgule

### CSS Modules (SCSS)

Toujours bracket notation, même sans tiret :

```vue
<!-- ✅ correct -->
<div :class="$style['root']">
<div :class="$style['card-footer']">

<!-- ❌ incorrect -->
<div :class="$style.root">
```

Classes conditionnelles avec `&&`, pas la syntaxe objet :

```vue
<!-- ✅ correct -->
:class="[$style['root'], isActive && $style['root--active']]"

<!-- ❌ incorrect -->
:class="[$style['root'], { [$style['root--active']]: isActive }]"
```

### Breakpoints (include-media)

```scss
// ✅ breakpoints — opérateur requis
@include media('>=md') { ... }
@include media('>=lg') { ... }

// ✅ expressions custom — sans opérateur
@include media('hover') { ... }

// ❌ manque l'opérateur
@include media('md') { ... }
```

Breakpoints dispo : `xs` 375px · `sm` 480px · `md` 768px · `lg` 1024px · `vl` 1280px · `xl` 1440px · `xxl` 1600px · `hd` 1920px

### SCSS

- `<style lang="scss" module>` dans chaque composant custom
- Classes BEM-like : `root`, `root--modifier`, `root__child`
- Variables SCSS (`$color-primary`) disponibles dans les `<style module>` via `_resources.scss`
- CSS custom properties NuxtUI (`var(--ui-primary)`, `var(--ui-text-muted)`...) dans les styles globaux et modules
- Pas de variables SCSS dans les fichiers globaux — uniquement `var()` et valeurs littérales

### TypeScript

- Pas de `any`
- Types explicites pour props, emits et retours de fonctions
- `useId()` pour les IDs d'éléments de formulaire
- Types Supabase générés dans `app/types/database.types.ts`

### État (pas de Pinia)

```ts
// État partagé entre composants
const phase = useState<GamePhase>('game-phase', () => 'lobby')

// Persistance localStorage
const playerId = useLocalStorage('undercover:player-id', () => crypto.randomUUID())

// État serveur = Supabase Realtime uniquement, pas de store
```

### Theming NuxtUI

Configuré dans `app/app.config.ts`. Couleurs : `primary` (violet), `neutral` (zinc).
Pour personnaliser ponctuellement un composant NuxtUI, utiliser la prop `class` avec des classes Tailwind.

---

## Points d'attention

- `devtools: false` — bug IPC avec Node 24 + Nuxt 4.4.x, à réactiver quand corrigé
- `.env` requis au démarrage même avec placeholders — `@nuxtjs/supabase` crashe sinon
- `@nuxtjs/supabase` v2 : types DB dans `app/types/database.types.ts`
- `include-media` : `$media-expressions` doit être passé dans `@forward ... with (...)`, pas défini après
