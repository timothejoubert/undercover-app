# Roadmap — Undercover Online

## Mode pass-the-phone (local, sans BDD)

### Lobby & setup
- [x] Init projet Nuxt 4 + TypeScript
- [x] Config NuxtUI v4 + Tailwind CSS v4
- [x] Config SCSS Modules (include-media, variables, breakpoints)
- [x] Page `/` : créer une room (UI)
- [x] Lobby : liste des joueurs, bouton "Ajouter un joueur"
- [x] Bouton "Lancer la partie" (hôte seulement, min. 3 joueurs)
- [x] Architecture `useGame()` — interface stable pour transition Phase 2 BDD

### Distribution des rôles
- [x] Attribution aléatoire des rôles (civil / undercover)
- [x] Banque de 20 paires de mots
- [x] Chaque joueur voit son mot en privé (pass-the-phone, lock screen)
- [x] Bouton "retour" si un joueur a oublié son mot
- [x] Persistance localStorage (résiste au refresh)

### Phase de description
- [x] Chaque joueur donne un indice à tour de rôle (pass-the-phone)
- [x] Lock screen entre joueurs (confidentialité)
- [x] Indicateur de progression (X / N indices)
- [x] Compteur de manche
- [x] Récapitulatif de tous les indices avant le vote

### Phase de vote
- [x] Chaque joueur vote en secret (pass-the-phone, lock screen)
- [x] Indicateur de progression (X / N votes)
- [x] Récapitulatif des votes avant révélation
- [x] Révélation de l'éliminé + son rôle
- [x] Gestion des égalités (premier dans la liste)

### Conditions de victoire
- [x] Civils gagnent si tous les undercovers sont éliminés
- [x] Undercovers gagnent si undercovers ≥ civils restants
- [x] Écran de résultat : vainqueur + révélation de tous les rôles
- [x] Bouton "Nouvelle partie"

### À faire — pass-the-phone
- [ ] **Mr. White** : assigner le rôle (1 pour 5+ joueurs, option activable)
- [ ] **Mr. White éliminé** : écran de devinette — il tente de deviner le mot civil
- [ ] **Mr. White gagne** s'il devine correctement, sinon les civils gagnent
- [ ] **Timer optionnel** pour la phase de description (30s / 60s / libre)
- [ ] **Banque de mots étendue** : 200+ paires avec catégories (nourriture, sport, nature…)
- [ ] **Mots personnalisés** : l'hôte saisit ses propres paires avant de lancer

---

## Mode connecté — Phase 2 (Supabase + Netlify)

> Toute la logique est déjà annotée `Phase 2:` dans `use-game.ts`.
> Les pages ne changent pas — seuls les internals du composable sont à remplacer.

- [ ] Setup Supabase (projet, tables `rooms` / `players` / `descriptions` / `votes`, RLS)
- [ ] Netlify Function `create-room` → remplace `createRoom()` local
- [ ] Netlify Function `join-room` → active `joinRoom()` (actuellement stub)
- [ ] Netlify Function `start-game` → remplace `startGame()` local
- [ ] RLS Supabase : chaque joueur ne voit que son propre mot
- [ ] Realtime : mise à jour live de la liste des joueurs dans le lobby
- [ ] Netlify Function `submit-description` + Realtime broadcast
- [ ] Netlify Function `submit-vote` + résolution server-side
- [ ] Retirer `addPlayer()` (remplacé par `joinRoom()` multi-device)
- [ ] Page 404 / room expirée / joueur déconnecté en cours de partie

---

## UX & polish
- [ ] Animations de transition entre les phases
- [ ] Son / feedback visuel sur les actions clés (vote confirmé, élimination…)
- [ ] Mode spectateur / vue partagée (dashboard projetable sur TV)

## Optionnel / nice to have
- [ ] Système de score sur plusieurs parties
- [ ] Historique des parties
- [ ] Mode tournoi (plusieurs manches)
- [ ] Partage de résultat (screenshot / carte de fin)
