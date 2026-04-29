# Roadmap — Undercover Online

## Phase 1 — Setup & Lobby

- [x] Init projet Nuxt 4 + TypeScript
- [x] Config NuxtUI v4 + Tailwind CSS v4
- [x] Config SCSS Modules (include-media, variables, breakpoints)
- [x] Page `/` : créer une room ou rejoindre avec un code (UI)
- [ ] Setup Supabase (projet, tables, RLS policies)
- [ ] Netlify Function `create-room` : génère un code court unique
- [ ] Netlify Function `join-room` : valide et ajoute le joueur
- [ ] Brancher les actions "Créer" et "Rejoindre" sur les functions
- [ ] Page `/room/[code]` : lobby, liste des joueurs en temps réel
- [ ] Realtime : affichage live des joueurs qui rejoignent le lobby
- [ ] Bouton "Lancer la partie" (hôte seulement)

## Phase 2 — Distribution des rôles

- [ ] Netlify Function `start-game` : assigne rôles + mots aléatoirement
- [ ] RLS Supabase : chaque joueur ne voit que son propre mot
- [ ] Page `/room/[code]/game` : affichage du mot secret au joueur
- [ ] Transition lobby → jeu côté Realtime

## Phase 3 — Phase de description

- [ ] Interface de saisie de description (1 mot / courte expression)
- [ ] Affichage des descriptions au fil de l'eau pour tous
- [ ] Gestion de l'ordre de passage
- [ ] Option timer par joueur (30s / 60s / libre)
- [ ] Blocage des soumissions hors tour

## Phase 4 — Phase de vote

- [ ] Interface de vote (sélectionner un joueur vivant)
- [ ] Vote simultané et secret (pas de révélation avant que tous aient voté)
- [ ] Netlify Function `resolve-vote` : calcul de l'élimination
- [ ] Gestion des égalités (selon option choisie)
- [ ] Révélation du rôle du joueur éliminé

## Phase 5 — Mr. White & Conditions de victoire

- [ ] Détection si Mr. White est éliminé → écran de devinette
- [ ] Netlify Function `mr-white-guess` : validation de la réponse
- [ ] Détection des conditions de victoire après chaque élimination
- [ ] Page résultat : révélation de tous les rôles + mots

## Phase 6 — UX & polish

- [ ] Animations de transition entre les phases
- [ ] Son / feedback visuel sur les actions clés
- [ ] Mode spectateur / vue partagée (dashboard projetable)
- [ ] Gestion de déconnexion (joueur qui quitte en cours de partie)
- [ ] Page 404 / room expirée

## Phase 7 — Contenu

- [ ] Banque de mots pré-définis (200+ paires) avec catégories
- [ ] Mode mots personnalisés (l'hôte saisit ses propres paires)
- [ ] Thèmes : nourriture, pop culture, sport, nature, métiers...

## Phase 8 — Optionnel / nice to have

- [ ] Système de score sur plusieurs parties
- [ ] Historique des parties
- [ ] Mode tournoi (plusieurs manches)
- [ ] Partage de résultat (screenshot / carte de fin)
