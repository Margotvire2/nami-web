# T21 — Tech debt ESLint post-migration Next 16

> **Ticket Notion** : https://www.notion.so/36243f4a3b1d81c2b131c043af0e8f1d
> **Priorité** : P1 — XL
> **Deadline** : **30 juin 2026**
> **Créé** : 16 mai 2026 (PR `chore/eslint-flat-config-next16`)
> **Statut initial** : 0 erreurs, **514 warnings** (post-PR migration flat config)

---

## Contexte

La migration Next.js 14 → 16 (~mi-avril 2026) a cassé le CI Lint :

- `next lint` n'existe plus en Next 16 → script `npm run lint` retournait exit 1 sans rien linter
- `FlatCompat.extends("next/core-web-vitals")` crashe avec `eslint-config-next` v16 (déjà au format flat natif) : `TypeError: Converting circular structure to JSON`
- Pendant ~30 jours, **aucune PR front n'a eu de check ESLint effectif** → 514 warnings + 3 erreurs critiques se sont accumulés

La PR `chore/eslint-flat-config-next16` **débloque le CI** mais préserve le périmètre `chore` (pas de fix code applicatif massif). Les 514 warnings restants sont la dette T21 à résorber dégressivement d'ici fin juin 2026.

---

## Règles dégradées en `warn` dans cette PR

Pour absorber 482/517 problèmes préexistants sans corrompre le scope `chore`, les 4 règles suivantes ont été dégradées de `error` → `warn` dans `eslint.config.mjs` :

| Règle | Occurrences | Raison de la dégradation |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | **182** | Refactor TypeScript strict massif requis (typage exhaustif de payloads API, mappers, fixtures). Hors scope chore CI. |
| `react/no-unescaped-entities` | **123** | Apostrophes/guillemets français non escapés dans du JSX (`L'équipe`, `aujourd'hui`). Cosmétique HTML — pas d'impact runtime. Refactor mécanique par sed possible mais à valider visuellement page par page. |
| `react-hooks/purity` | 20 (baseline) | Détecte effets de bord pendant render. Peut révéler de **vrais bugs runtime React 19 strict mode**. À investiguer fichier par fichier — pas safe en bulk. |
| `react-hooks/set-state-in-effect` | 14 (baseline) | `setState` dans useEffect sans deps → boucle infinie potentielle. Vrais bugs latents possibles. À investiguer cas par cas. |

> ⚠️ Note : `react-hooks/purity` et `react-hooks/set-state-in-effect` ont 0 occurrence détectée après bascule en flat config (vs 20+14 au baseline FlatCompat). À reconfirmer après une vraie session de scan — la différence vient probablement de subset de règles activées entre legacy vs flat. Si elles réapparaissent, garder en `warn` jusqu'à T21c/d.

---

## Erreurs runtime-critiques fixées dans cette PR

Décision Margot session 16 mai 2026 (post diagnostic Phase 4.2) : 3 erreurs `error`-level non couvertes par les dégradations ci-dessus ont été **fixées inline** car elles révélaient de vrais bugs runtime potentiels.

| # | Fichier | Règle | Fix | Impact |
|---|---|---|---|---|
| 1 | `src/app/(cockpit)/agenda/components/AppointmentDrawer.tsx:44` | `react-hooks/rules-of-hooks` | `useRouter()` déplacé avant `if (!apt) return null` | Évite crash React strict mode (hook conditionnel) |
| 2 | `src/contexts/ConsultationContext.tsx:242` | `react-hooks/refs` (Cannot access refs during render) | Mutation `saveNotesRef.current` déplacée dans `useEffect` | **Corrige bug latent React 19 strict mode** : double mount recréait le debounced function → save notes consultation droppée silencieusement |
| 3 | `src/hooks/__tests__/useRagConsensus.test.tsx:43` | `react/display-name` | Wrapper extrait en const nommée + `Wrapper.displayName = "QueryWrapper"` | Cosmétique DevTools (fichier de test) |

---

## Inventaire des 514 warnings résiduels

### Par règle (top breakdown)

| Règle | Occurrences | Sous-ticket |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | 182 | **T21a** |
| `@typescript-eslint/no-unused-vars` | 145 | T21e (mécanique) |
| `react/no-unescaped-entities` | 123 | **T21b** |
| `@next/next/no-img-element` | 14 | T21f (migration `<Image />`) |
| `react-hooks/exhaustive-deps` | 10 | T21g (review cas par cas) |
| `@typescript-eslint/no-unused-expressions` | 3 | T21e |
| `jsx-a11y/role-has-required-aria-props` | 1 | T21h (a11y) |
| Autres (non détectées par grep simple) | ~36 | À auditer |

### Top 15 fichiers concentrant le plus de warnings

```
49  src/app/(cockpit)/patients/[id]/page-v1-backup.tsx   ⚠️ FICHIER ARCHIVÉ — à supprimer (-49 d'un coup)
43  src/app/_archived/protocoles-archived-20260501/page.tsx ⚠️ FICHIER ARCHIVÉ — à supprimer (-43)
28  src/app/(cockpit)/patients/[id]/v2/components/ViewDossier.tsx
22  src/app/demo-tca/pitch/PitchDeckTCAClient.tsx
13  src/app/(cockpit)/patients/[id]/v2/components/ViewGlobale.tsx
12  src/app/(cockpit)/aujourd-hui/page.tsx
10  src/app/(cockpit)/admin/internal-reference/page.tsx
 9  src/lib/api.ts
 9  src/app/(cockpit)/patients/[id]/v2/components/ViewSuivi.tsx
 8  src/components/pitch/CliniquePedPage.tsx
 8  src/app/onboarding/page.tsx
 8  src/app/(cockpit)/patients/[id]/v2/components/ViewCoordination.tsx
 8  src/app/(cockpit)/patients/[id]/referral-modal.tsx
 7  src/hooks/useCareSocket.ts
 7  src/app/(secretariat)/secretariat/page.tsx
```

**Quick win** : supprimer les 2 fichiers archivés (`page-v1-backup.tsx` et `_archived/protocoles-archived-20260501/`) = -92 warnings d'un coup. À traiter en PR dédiée `chore/cleanup-archived-files`.

---

## Objectif dégressif `--max-warnings`

| Date | Seuil `--max-warnings` | Action |
|---|---|---|
| **Aujourd'hui (16 mai 2026)** | `999` | PR `chore/eslint-flat-config-next16` mergée, CI vert |
| **Fin mai 2026 (31 mai)** | `500` | T21a (no-explicit-any) + suppression fichiers archivés |
| **Mi-juin 2026 (15 juin)** | `100` | T21b (no-unescaped-entities) + T21e (unused-vars) |
| **Fin juin 2026 (30 juin)** | `0` | T21c, T21d, T21f, T21g, T21h — clean définitif |

À chaque jalon : abaisser le seuil dans `package.json` script `lint` + ajouter règle CI gating.

---

## Sous-tickets recommandés

| ID | Règle | Effort estimé | Approche |
|---|---|---|---|
| **T21a** | `@typescript-eslint/no-explicit-any` (182) | 2-3j | Typage progressif par module : commencer par `src/lib/api.ts` (typage payloads), puis composants de view |
| **T21b** | `react/no-unescaped-entities` (123) | 0.5j | Refactor mécanique par sed sur apostrophes françaises : `'` → `&apos;` ou `'`. À valider visuellement page par page. |
| **T21c** | `react-hooks/purity` (20 baseline) | 1j | **Surveillance spéciale** — révèle de vrais bugs runtime. Cas par cas, pas en bulk. |
| **T21d** | `react-hooks/set-state-in-effect` (14 baseline) | 1j | **Surveillance spéciale** — boucles infinies potentielles. Cas par cas. |
| **T21e** | `@typescript-eslint/no-unused-vars` (145) | 0.5j | Mécanique : suppression imports inutilisés + variables `_ignored` |
| **T21f** | `@next/next/no-img-element` (14) | 0.5j | Migration `<img>` → `next/image` (avec dimensions + alt) |
| **T21g** | `react-hooks/exhaustive-deps` (10) | 0.5j | Review cas par cas (ajouter dep OU justifier omission via `useEvent`-like pattern) |
| **T21h** | `jsx-a11y/role-has-required-aria-props` (1) | 5 min | Ajouter prop ARIA manquante |

**Total estimé** : ~6 jours-homme étalés sur 6 semaines.

---

## Surveillance spéciale (revue CI hebdomadaire)

Deux règles méritent un coup d'œil **chaque semaine** sur le log CI :

1. **`react-hooks/purity`** : si le warning count augmente, c'est qu'un nouveau composant lit/écrit un état mutable pendant render → bug latent potentiel React 19 strict mode (double render → comportement non déterministe).

2. **`react-hooks/set-state-in-effect`** : si le warning count augmente, c'est qu'un nouveau `setState(...)` apparait dans un `useEffect` sans deps array adéquat → risque de boucle infinie ou de re-renders inutiles.

Action : à la prochaine session sprint, ajouter un step CI qui FAIL si l'une de ces deux règles dépasse son baseline (snapshot dans un fichier `.eslint-baseline.json`).

---

## Notes techniques pour la résorption

- **Fichiers archivés** : `src/app/_archived/` et `src/app/(cockpit)/patients/[id]/page-v1-backup.tsx` sont des reliquats. Sauf usage actif (à vérifier avec Margot), supprimer purement et simplement (-92 warnings sans coût).
- **`src/lib/api.ts` (9 warnings)** : fichier central de typage. Le linter sur ce fichier impacte indirectement la qualité de typage de **tout le frontend**. Prioriser T21a sur ce fichier.
- **Components View*` (50+ warnings cumulés)** : la stack `patients/[id]/v2/components/View*` est un legacy module — vérifier s'il y a une roadmap de refonte avant d'investir dans le typage.

---

## Historique

| Date | Évènement | Auteur |
|---|---|---|
| 2026-05-16 | Création du doc + PR migration flat config + 3 fixes runtime | Margot + Claude (session #3) |
| _futur_ | T21a démarré | _à compléter_ |
