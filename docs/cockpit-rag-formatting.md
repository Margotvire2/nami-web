# Cockpit RAG Formatting — Documentation

> Sprint Formatting Cockpit RAG, Phases 3.B.1 → 3.B.4. État au 12 mai 2026.

## Vue d'ensemble

La page `/cockpit/intelligence` du cockpit soignant Nami expose deux modes :

1. **Recherche documentaire** — recherche sémantique dans la base unifiée Nami
   (FFAB, HAS, Fiches pathologies, Algorithmes, PCR, références) avec rendu
   formaté (cards, badges, sheet latérale détail).
2. **QA Clinique** — question/réponse libre en langage naturel avec sources
   citées, niveau de confiance et disclaimer MDR.

Objectifs transverses :

- **Lisibilité** — palette Nami (violet `#5B4EC4`, teal `#2BA89C`, fond crème
  `#FAFAF8`), Plus Jakarta Sans + Inter, animations cubic-bezier(0.16,1,0.3,1)
- **Compliance MDR** — badge "Brouillon IA — à vérifier", footer "Outil de
  coordination · Non dispositif médical · Conforme RGPD", lexique strict
  (interdiction des termes "alerte clinique", "surveillance", "détecter",
  "scoring", "risque", "drapeau rouge", "care gap", "monitoring", "vigilance")
- **Performance** — preprocess cleanup universel des chunks RAG, rendering
  conditionnel des Views, filtre PNDS hors-scope TCA

## Architecture des composants

```
src/app/(cockpit)/intelligence/
├── page.tsx                    Root — search bar, modes, Tabs custom, footer MDR
└── nami-keyframes.css          Animations CSS (namiBreathe, stagger, etc.)

src/components/intelligence/
├── _utils.ts                   slugToCategory, CATEGORY_META, SOURCE_ICON (partagés)
├── QualityDashboard.tsx        Bandeau qualité IA en haut du mode Recherche
├── QAClinique.tsx              Mode QA + disclaimer MDR non-masquable
├── RagConsensusBlock.tsx       Ligne 1 V4 — consensus critères chiffrés multi-sources
├── RagKbHint.tsx               Ligne 3 V4 — bandeau hint clavier J/K/Enter/Esc
├── ResultCard.tsx              Carte résultat (clean snippet, badge source, score)
├── KnowledgeDetailModal.tsx    Sheet latérale détail (ui/sheet shadcn)
├── KnowledgeContentRenderer.tsx Rendering markdown + slide-deck si marqueurs
└── atoms/
    ├── _tokens.ts              NAMI palette + ease tokens
    ├── _criteria.ts            Tokenisation critères chiffrés (regex)
    ├── SourceBadgeRag.tsx      Badge catégorie (SEM/ALGO/KE/PCR/REF)
    ├── DraftAIBadge.tsx        Badge "Brouillon IA" (ALGO + extracts NAMI)
    ├── ClinicalCriterion.tsx   Token chiffré "IMC < 14 kg/m²" (sympathie hover)
    ├── RelevanceBar.tsx        Barre score pertinence
    └── AmbientGlowFrame.tsx    Frame glow décoratif (cards focused)

src/hooks/
└── useRagKeyboardNav.ts        Hook clavier J/K/↵/Esc pour la liste RAG

src/lib/
├── ragContentCleanup.ts        Helper preprocess (cleanRagContent,
│                               hasSlideMarkers, splitSlides) — pure function
└── __tests__/
    └── ragContentCleanup.test.ts  19 tests verts (node:test)
```

## Flux de données

```
User query (search bar)
   │
   ▼
apiWithToken.intelligence.knowledgeSearch(q, { limit: 10 })
   │
   ▼
GET /knowledge/semantic-search → top-10 chunks (pgvector + reranker)
   │
   ▼
setResults(data.results)
   │
   ▼
pndsScopedResults = isTcaQuery(query) ? results.filter(!horsScope) : results
   │
   ▼
filteredResults = activeSource ? pndsScopedResults.filter(by source) : pndsScopedResults
   │
   ▼
ResultCard map (stagger animation cubic-bezier)
   │
   ▼ (click ou Enter sur card focused via J/K)
   ▼
KnowledgeDetailModal (sheet latérale)
   │
   ▼
KnowledgeContentRenderer
   │
   ├── cleanRagContent(content) — strip puces 9/x/■▪▫●◦, rupture \n/
   │
   ├── hasSlideMarkers(content) ? splitSlides() → render par slide
   │
   └── sinon → parser markdown ligne par ligne
```

## Helpers et tokens

### `_tokens.ts`

Variables JS reflétant la palette Nami pour usage en `style={{...}}` dynamique
(quand le Tailwind statique ne suffit pas) :
- `NAMI.violet = "#5B4EC4"`
- `NAMI.teal = "#2BA89C"`
- `NAMI.bg, NAMI.bgAlt, NAMI.text, NAMI.textMuted, NAMI.textFaint, NAMI.border, NAMI.borderStrong`
- `NAMI.ease = "cubic-bezier(0.16, 1, 0.3, 1)"`

### `_criteria.ts`

Tokenisation regex naïve pour les critères chiffrés (IMC < 14 kg/m², K+ < 3
mmol/L, FC < 40 /min, etc.). Utilisé par `ClinicalCriterion` pour highlight
inter-cards via sympathie hover (`onSympathy`). **Limite connue** : pas un
parseur sémantique, faux positifs possibles sur des nombres non-cliniques.
Ticket dérivé D10.

### `ragContentCleanup.ts`

Pure function 0 dépendance. Trois exports :

- `cleanRagContent(content, options?)` — strip artefacts PPT
- `hasSlideMarkers(content)` — detect `--- Slide N ---`
- `splitSlides(content)` — split en blocs `SlideBlock { slideNumber, title, content }`

Motifs traités (M1, M2, M4, M5, M8) et NON traités (M3, M6, M7, M9 — faux
positifs trop coûteux) documentés en commentaire du module.

## Compliance MDR

### Lexique strict

9 termes interdits dans les wrappers Nami (pas dans le content source cité) :
- `alerte` / `alerte clinique`
- `surveillance`
- `détecter`
- `scoring` / `score de risque` / `risk score`
- `drapeau rouge`
- `care gap`
- `monitoring`
- `vigilance`

Audit `rg -in` sur les 14 fichiers du sprint cumulés. Audit Phase 3.B.4 :
1 finding restant dans `QAClinique.tsx:76` (string `EXAMPLES`, hors scope
3.B.4 — ticket dérivé à ouvrir).

### Badge "Brouillon IA — à vérifier"

Présent sur :
- Catégorie `ALGO` (algorithmes diagnostiques générés)
- Extracts NAMI (synthèses)
- Disclaimer amber `QAClinique` (non-masquable, AI Act Art. 50)

### Footer légal

```
Outil de coordination · Non dispositif médical · Conforme RGPD
```

Présent en bas du mode Recherche dans `page.tsx`.

### Filtre PNDS hors-scope TCA (Phase 3.B.4)

Stratégie C — slug blacklist ciblée, déclenchée uniquement quand la query
contient un mot-clé TCA (anorexie, boulimie, hyperphagie, TCA, comportement
alimentaire, restriction alimentaire, compulsion alimentaire).

Patterns blacklist actuels :
- `^pnds_amp` — PNDS Aide Médicale à la Procréation
- `procreation` — variantes
- `assistance.medicale.procreation`

Pas de seuil dur sur le score — on préserve les résultats à faible pertinence
qui peuvent rester utiles cliniquement. Compteur "N résultat(s) hors-scope
masqué(s)" affiché discrètement en bas pour transparence.

## Limitations connues

| ID | Limitation | Statut |
|---|---|---|
| D2 | `sourceUrl` absent du payload knowledge | Ouvert |
| D5 | Bug 503 backend embeddings en local | Ouvert |
| D6 | `useRagKeyboardNav` raccourcis E / ⌘C non implémentés | Reporté (texte hint aligné en 3.B.4) |
| D7 | Animation `namiBreathe` peut distraire en cockpit clinique | Ouvert (à monitorer en usage réel) |
| D8 | Contrastes WCAG AA `#8A8A96` sur `#FAFAF8` à la limite | Voir Audit a11y ci-dessous |
| D9 | `MOCK_CONSENSUS` hardcodé dans `page.tsx` | Ouvert (hook `useRagConsensus` à créer) |
| D10 | `tokenizeSnippet` regex naïve | Ouvert |
| D11 | `QAClinique.tsx:76` wording "alerte" dans `EXAMPLES` | Nouveau ticket à ouvrir |
| D12 | `sex` 485 patients absents en DB | Ouvert (hors scope cockpit RAG) |

## Audit accessibilité (Phase 3.B.4)

### Contrastes (calculs)

| Texte | Sur fond | Ratio | WCAG AA texte normal (≥4.5:1) | WCAG AA texte large 18pt+ (≥3:1) |
|---|---|---|---|---|
| `#1A1A2E` titres | `#FAFAF8` | ~16.5:1 | ✅ | ✅ |
| `#4A4A5A` body | `#FAFAF8` | ~8.4:1 | ✅ | ✅ |
| `#5B4EC4` violet | `#FAFAF8` | ~6.0:1 | ✅ | ✅ |
| `#FFFFFF` blanc | `#5B4EC4` bouton | ~6.0:1 | ✅ | ✅ |
| `#6B7280` muted | `#FAFAF8` | ~5.3:1 | ✅ | ✅ |
| `#8A8A96` faint (footer, compteur PNDS) | `#FAFAF8` | ~3.7:1 | ❌ (insuffisant 4.5:1) | ✅ (texte large 18pt+ uniquement) |

**Finding** : `#8A8A96` est utilisé pour le footer MDR (11px) et le compteur
PNDS (11px) — taille texte normal, sous le seuil 4.5:1. À renforcer (ex.
`#6B7280` à 5.3:1, ou darker). Ticket dérivé D8 ouvert.

### Focus visible

- Search bar : focus ring violet 30% `focus:ring-2 focus:ring-[#5B4EC4]/30` ✅
- Card focused via J/K : `focused` prop passe `data-focused="true"` à
  `ResultCard` qui applique un border + glow violet ✅ (à vérifier visuellement)
- Sheet (ui/sheet shadcn) : focus trap natif Radix UI ✅
- Boutons header/mode toggle : default browser outline, OK mais peu visible
  sur fond clair — à renforcer (Ticket D8)

### Sémantique HTML

- `<h1>` "Intelligence clinique" en haut ✅
- `<kbd>` dans `RagKbHint` pour les touches clavier ✅
- `<button>` partout pour les actions interactives ✅
- `aria-hidden` sur les icônes décoratives ✅
- `aria-label` sur les boutons icon-only ⚠️ (à vérifier sur le bouton `X` du
  clear input search bar — pas critique mais améliorable)

### Navigation clavier

- Tab atteint tous les éléments interactifs ✅
- Esc ferme la sheet ✅ (via shadcn) et reset le focus liste si pas de sheet
  ouverte ✅
- J/K naviguent dans la liste sans interférer avec la saisie input (guard
  `document.activeElement instanceof HTMLInputElement`) ✅
- Enter active la card focused ✅
- Pas de focus trap involontaire détecté ✅

## Évolution future

### V2 Pédiatrie
- Adapter le lexique forbidden (pédiatrie peut avoir des termes spécifiques)
- Sources prioritaires : Orphanet, AAP guidelines, RCP

### V3 Endocrinologie
- Adapter le reranker (poids différents : durée d'évolution chronique)
- Sources : HAS, SFE, ENDOCRINE

### V4 Onco-pédiatrie
- Sources prioritaires : Curie, Gustave Roussy, SIOP
- Scope tagging plus strict (séparation onco adulte vs pédiatrique)

## Sprint résumé

| Phase | Commit | Livraison |
|---|---|---|
| 3.B.1 | `1a6c1e0` | Extraction 5 composants + `_utils.ts` (zéro régression) |
| 3.B.2 | `dcc8250` | Preprocess universel + détection FFAB par contenu + 19 tests |
| 3.B.3 (WIP) | `a57a8e9` | Atoms + hook clavier + ResultCard refonte |
| 3.B.3 (final) | `823b806` | Sheet migration + renderer V4 + page wiring |
| 3.B.4 | _ce commit_ | Filtre PNDS + alignement hint + doc + audit MDR + audit a11y |
