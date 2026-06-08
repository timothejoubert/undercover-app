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

### 🐛 Bugs
- [ ] **Vote ne fonctionne pas** : l'action de voter contre un joueur est bloquée — à investiguer et corriger

### Options de partie (écran de config dans le lobby avant de lancer)
- [ ] **Nombre d'undercovers configurable** : slider ou +/- avec recommandations selon le nombre de joueurs
  - Recommandations : 1 pour 3–6 joueurs · 2 pour 7–10 · 3 pour 11–12
- [ ] **Nombre de Mr. White configurable** : 0 par défaut, max 2
  - Recommandations : 0 pour ≤4 joueurs · 1 pour 5–9 · 2 pour 10+
  - Mr. White ne reçoit **aucun mot** (contrairement à l'undercover qui reçoit le mot undercover)
- [ ] **L'undercover sait-il qu'il est undercover ?** : option toggle
  - Désactivé par défaut → l'undercover voit son mot mais pas son rôle (il doit deviner qu'il est suspect)
  - Activé → l'undercover voit explicitement son badge "Undercover"

### Mr. White (dépend des options ci-dessus)
- [ ] **Distribution** : Mr. White voit un écran "Tu n'as pas de mot — tu es Mr. White. Écoute et déduis !"
- [ ] **Mr. White éliminé** : écran de devinette — il tente de deviner le mot civil
- [ ] **Mr. White gagne** s'il devine correctement · civils gagnent s'il rate · undercovers gagnent si condition remplie

### Contenu & UX
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
