# Audit SuiviTab — F-SUIVI-TAB-AUDIT-POLISH

Date : 2026-05-25
Branche : `feat/suivi-tab-polish`

## Verdict : Cas B (cockpit uniquement)

`SuiviTab` n'est consommé qu'a un seul endroit, dans le cockpit soignant.
Aucun consommateur dans `src/app/(patient)/**`. Conformement au ticket,
aucune modification de code n'a ete apportee — PR doc-only.

## Phase 0 — Preuves

### Composant

- Chemin : `src/components/patient/SuiviTab.tsx`
- Lignes : 792
- Export nomme : `SuiviTab`

### Props (verbatim L23-31)

```ts
interface Props {
  careCaseId: string
  pathwayKey: string
  personId?: string
  patient: { firstName: string; lastName: string; birthDate: string | null; sex?: string }
  height: number | null
  napValue: number | null
  napDescription: string | null
}
```

Les props sont strictement cockpit : `careCaseId` est une entite non exposee
cote patient ; `pathwayKey` vient de `careCase.pathwayTemplateId` ; `height`,
`napValue`, `napDescription` sont des champs configures par le soignant.

### Consommateurs

`grep -rn "SuiviTab" src --include="*.tsx" --include="*.ts"` :

| Fichier | Ligne | Role |
|---------|-------|------|
| `src/components/patient/SuiviTab.tsx` | 119 | definition |
| `src/app/(cockpit)/patients/[id]/page.tsx` | 16 | import |
| `src/app/(cockpit)/patients/[id]/page.tsx` | 356 | usage dans `activeTab === "suivi"` |

Total : 1 seul consommateur, dans `(cockpit)`.

### Etat a11y observe

- Pas de `role="tabpanel"` sur le wrapper racine (L278)
- Pas de `aria-labelledby` reliant au tab parent
- Pas de `focus-visible:ring-*` explicite — les boutons shadcn fournissent
  un focus-visible par defaut, mais pas coherent avec la couleur `#5B4EC4` PR #62
- Pas de `aria-label` sur les boutons d'icone `<Pencil>` (L283, L299)
- Dialogs : a11y correcte via Radix shadcn

### Etats loading / empty observes

- Loading : skeleton OK (L275)
- Empty bilan biologique : OK (L535-542) — "Aucun bilan biologique importe."
- Empty questionnaires : OK (L417-419) — "Aucun questionnaire complete."
- Empty BiaHistorySection : gere (L318)
- Empty DxaSection : gere par early return (L717)
- Error : aucune gestion explicite d'erreur `useQuery`

### Wording observe (verbatim)

| Ligne | Wording |
|-------|---------|
| 282 | "Synthese clinique" |
| 538 | "Dernier bilan biologique" |
| 57-62 | Labels IMC en contexte TCA |
| 67-70 | Labels IMC en contexte obesite |
| 351-353 | Labels FC repos (bradycardie / limite basse / normal) |
| 767-769 | Labels T-score (osteoporose / osteopenie / normal) |
| 307 | "Donnees insuffisantes pour calculer les besoins" |

Plusieurs labels sont des classifications automatiques deduites de seuils.
A confronter au lexique MDR Nami — hors scope de ce ticket mais signale.

## Tickets derives recommandes

### F-SUIVI-TAB-A11Y-COCKPIT

Polish a11y du composant cockpit. Scope :

- `role="tabpanel"` + `aria-labelledby` sur le wrapper racine
- `aria-label` sur boutons d'icone (L299 notamment)
- `focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40` coherent PR #62
- `transition-colors duration-150` sur hover/focus
- Quand : apres V1 patient (post 7 juillet 2026)

### F-SUIVI-TAB-MDR-WORDING

Adoucir les classifications automatiques en faveur de libelles organisationnels
+ brouillon IA. A confronter a la skill `nami-legal`.

### F-EXTRACT-PATIENT-SUIVI

Si V2 patient veut une vue suivi patient, creer un composant distinct dans
`src/app/(patient)/suivi/`. Modeles mentaux trop differents.

## Notes hors scope

- Fichier 792 lignes -> candidat a decoupage `BioSection`, `BiaHistorySection`,
  `DxaSection`, `DeltaCard` dans leurs propres fichiers
- Emplacement `src/components/patient/` trompeur — devrait etre
  `src/components/cockpit/` ou `src/components/care-case/`
- Hardcoded `process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"` L184
- 4 `useQuery` paralleles sans coordination — verifier waterfall avec
  skill `nami-request-optimizer`

## Validation

- Aucune modif source -> pas de diff de code
- `npm run lint` + `npx tsc --noEmit` documentes dans le PR body
