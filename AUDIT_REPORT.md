# Audit Nami Web — 16 avril 2026

**Auditeur** : Claude Code (session automatisée)
**Scope** : Cockpit soignant — 3 passes (grep statique → revue composant → corrections)
**Résultat** : 7 bugs corrigés, 0 bloquant restant, 0 erreur TSC

---

## Résumé exécutif

| Catégorie | Trouvé | Corrigé | Restant |
|-----------|--------|---------|---------|
| Mots interdits MDR | 1 | 1 | 0 |
| Navigation cassée | 2 | 2 | 0 |
| Données brutes (raw enum) | 3 | 3 | 0 |
| Prop manquante | 1 | 1 | 0 |
| Import orphelin | 1 | 1 | 0 |
| **Total** | **7** | **7** | **0** |

---

## Bugs corrigés

| # | Fichier | Description | Fix | Commit |
|---|---------|-------------|-----|--------|
| BUG#1 | `agenda/page.tsx:1065` | `window.location.reload()` interdit (CLAUDE.md) — rechargement brutal cassant le state React | `router.refresh()` | `d5cedda` |
| BUG#2 | `patients/page.tsx` | Tab label "À **surveiller**" — mot interdit MDR (requalification DM) | "Prioritaires" | `d5cedda` |
| BUG#3 | `patients/page.tsx` | Recherche sur `c.caseType` raw (`"OBESITY"`) au lieu du label traduit | `getCareTypeLabel(c.caseType)` | `d5cedda` |
| BUG#4 | `CommandPalette.tsx` | Même bug de recherche raw enum dans la palette ⌘K | `getCareTypeLabel(c.caseType)` | `d5cedda` |
| BUG#5 | `sidebar.tsx` | `/messages` absent du bloc NAV_NETWORK — page Messages injoignable depuis la nav | Entrée ajoutée avec `MessageSquare` | `d5cedda` |
| BUG#6 | `sidebar.tsx` | Icône `BookOpen` dupliquée (Références + Annuaire) | `ClipboardList` pour Références | `d5cedda` |
| BUG#7 | `ViewGlobale.tsx:55` | Prop `careCaseId` non transmise à `<GrowthCharts>` → bouton import carnet désactivé | `careCaseId={careCaseId}` | `4e9f1ad` |

---

## Bugs restants

Aucun bloquant identifié.

Observations mineures non corrigées (hors scope audit) :
- `PrescriptionDraftEditor.tsx` — composant volumineux (~570 lignes), refactor à planifier
- `patients/[id]/v2/components/ViewDossier.tsx` — 118 lignes modifiées en session courante, non auditées

---

## Recommandations

1. **Consolider les mappings caseType** — `src/lib/caseType.ts` est désormais la source unique. S'assurer que tout nouveau composant l'importe plutôt que de recréer un mapping local.

2. **Ajouter EPILEPSY, NUTRITION, TCA au seed Léo/Gabrielle** — certains caseTypes de démo ne correspondent pas encore aux libellés traduits.

3. **Audit wording MDR automatique** — ajouter un script `grep -rn "surveiller\|monitoring\|alerte clinique\|risque\|urgence" src/app` dans le CI pour prévenir les régressions.

4. **Test ⌘K en prod** — vérifier que la CommandPalette affiche correctement les labels traduits sur les 3 patients démo (Gabrielle TCA, Marc OBESITY, Léo EPILEPSY).

---

*Généré le 2026-04-16 — 2 commits (d5cedda, 4e9f1ad) — 0 erreur `tsc --noEmit`*
