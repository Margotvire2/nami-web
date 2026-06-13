# WORKLOG — Refonte pages de connexion Nami « 2050 »

> Journal chronologique de l'initiative. Une entrée par étape franchie. À reporter en sous-page Notion *« Logs »*.

---

## 2026-06-13 — Phase 0 : Cadrage initial

**Auteur** : Claude (Opus 4.7) en duo avec Margot.
**Worktree** : `nami-web-worktrees/login-redesign-2050-2026-06-13`
**Branch** : `feat/login-redesign-2050-2026-06-13` (basée sur `origin/main` @ `906bc05`).

**Actions réalisées** :

1. Création du worktree dédié à partir de `origin/main` propre (zéro pollution depuis les autres worktrees en cours).
2. Inventaire des pages de connexion existantes :
   - Une seule route `/login` (`src/app/login/page.tsx`, 468 lignes) qui sert tous les rôles. Détection du rôle après auth → redirection.
   - Groupe `(auth)` pour `forgot-password` et `reset-password`.
   - Espaces post-auth : `(patient)`, `(secretariat)`, `structure/[orgId]`.
3. Inventaire du design system existant (`src/styles/nami-design-v2/`) :
   - Tokens couleurs + typo + composants déjà codés.
   - Fonts : Plus Jakarta Sans (display), DM Sans (UI), Inter (data), Playfair Display (touche émotionnelle).
   - Palette : violet primary `#5B4EC4`, teal `#3DC5B7` (canonique) ou `#2BA89C` (legacy à unifier — dette token #1), surfaces chaudes `#FAFAF8` / `#F5F3EF`.
   - Motion : 13 keyframes Nami (`nami-page-in`, `nami-card-in`, `nami-orb-drift`…) + easing universel `cubic-bezier(0.16, 1, 0.3, 1)`.
4. Lecture du `BRIEF-DESIGN-NAMI-V2026.md` (§1 à §4) pour aligner la grammaire visuelle : signature *« fil de couture »*, manifeste 5 règles, contrainte « chaleur d'abord, jamais corporate-dark ».
5. Création des 5 livrables de cadrage :
   - `INIT-MASTER.md` (vision, décisions, périmètre, plan d'exécution).
   - `INIT-01-soignant.md` (P1, démarrage).
   - `INIT-02-patient.md` (mascotte Nami, garde-fous ado TCA).
   - `INIT-03-structure.md` (carte territoire + réseau qui s'éclaire).
   - `INIT-04-secretaire.md` (sélecteur de casquettes / Delegation).

**Décisions structurantes prises** (cf. INIT-MASTER §4) :

| # | Décision |
|---|----------|
| D1 | Démarrer par le soignant (P1) |
| D2 | Mascotte = patient uniquement |
| D3 | Stack : Next.js 15 + Tailwind v4 CSS-first + tokens Nami v2 + Canvas2D, zéro nouvelle dépendance |
| D4 | Pas de big-bang, feature flag `NEXT_PUBLIC_LOGIN_2050`, rollback < 5 min |
| D5 | Une seule route `/login` conservée |
| D6 | Mobile-first |

**Risques identifiés** : crunch founder (soutenance 28 juin, lancement 7 juillet), interprétation infantilisante mascotte côté ado TCA, perf mobile bas de gamme, dette token teal à unifier.

**Skills mobilisées en Phase 0** : aucune skill code (cadrage uniquement). Pour les phases suivantes : `imagegen-frontend-web`, `magic` MCP, `emil-design-eng`, `apple-premium-site`, `ui-ux-pro-max`, `nami-design-system`, `nami-compliance-audit`, `security-guardian`, `ux-obviousness`.

**Bloquants** : aucun.

**Prochaine action attendue** : validation founder sur D1 à D6 + accord pour démarrer Phase 1 (moodboards image, 3 directions × 4 surfaces).

---

## Template entrée WORKLOG (à dupliquer pour chaque étape suivante)

```
## YYYY-MM-DD — Phase N : <Nom de la phase>

**Auteur** :
**Worktree** : nami-web-worktrees/login-redesign-2050-2026-06-13
**Commit(s)** :

**Actions réalisées** :
1.
2.

**Décisions prises** :
| # | Décision | Raison |
|---|----------|--------|

**Risques apparus** :

**Skills mobilisées** :

**Bloquants** :

**Prochaine action** :
```
