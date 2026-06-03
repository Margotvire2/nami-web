# AUDIT — `/cockpit/patients/[id]` — État de l'art au 2026-06-04

> **Scope** : audit read-only de la page cockpit "fiche patient" côté soignant.
> **Branche** : `docs/audit-cockpit-patient-page-2026-06-04` depuis `origin/main` (sha `e94d348`).
> **Méthode** : lecture intégrale de tous les fichiers `.tsx` du dossier `src/app/(cockpit)/patients/[id]/` (~9 631 lignes), vérification croisée des imports, inspection des hooks/endpoints/tests.
> **Auteur** : Claude Opus (audit machine, à valider par Margot).
> **Aucune modification de code, aucune création de composant.** Livrable unique = ce document.

---

## TL;DR

La page est le **point central du cockpit soignant** : elle agrège dossier clinique, parcours structuré, coordination, consultations et (conditionnellement) dossier pédiatrique. Elle fonctionne en production avec 6 tabs de navigation + 1 tab conditionnel.

**État global** :
- 18 fichiers, ~9 631 lignes, 4 vues de ~500-1400 lignes (ViewGlobale, ViewDossier, ViewParcours, ViewCoordination) + 1 héritage non-refactor (PatientJournalView 1441 lignes).
- **3 fichiers de code mort confirmés** (`views/InviteTeamModal.tsx` 468 LOC, `QuickMessageModal.tsx` 83 LOC, `ClinicalTimeline.tsx` 217 LOC) → **768 LOC à supprimer sans risque**.
- **1 fichier mal placé** (`ViewConsultation.tsx` 237 LOC) utilisé uniquement depuis `/consultations/[id]/page.tsx` — à déplacer vers `/consultations/[id]/`.
- **Zéro test unitaire ni e2e ne couvre directement la page** : `PatientLayout.test.tsx` cible `@/components/patient/PatientHeader.tsx` (surface patient mobile), pas `views/PatientHeader.tsx` (cockpit). Aucun spec Playwright ne navigue vers `/cockpit/patients/<id>`. Couverture concrète = **0 %**.
- **Pattern navigation** : URL state minimal (`?tab=` lu à l'init seulement, jamais réécrit) → **deep-linking cassé**. Refresh = retour à `globale`. Sous-onglets de Dossier et Coordination = pure state local, invisibles depuis l'URL.
- **API client incohérent** : `ViewParcours` + `PatientJournalView` + ViewCoordination utilisent `apiWithToken(accessToken!)` ; le reste utilise le singleton `api`. Pattern dual qui complique l'authentification.
- **Charge UX dense mais qui marche** : la majorité des features fonctionnent ; les pain points sont concentrés sur la profondeur (3 niveaux d'onglets), la cohabitation modal-inline et la perte d'état au refresh.

**Reco refonte** : **PARTIELLE** — pas de big-bang. Trois chantiers ciblés à séquencer (nettoyage mort code → URL state → découpage ViewGlobale). Détaillés Section 8.

---

## Section 1 — Inventaire exhaustif

### 1.1 Arborescence physique

```
src/app/(cockpit)/patients/[id]/
├── page.tsx                          452 LOC   Route shell + tabs + modals racine
├── views/
│   ├── PatientHeader.tsx             228 LOC   En-tête (démographique + 6 quick actions)
│   ├── ViewGlobale.tsx              1178 LOC   Tab "Vue globale" (résumé IA, indicateurs, équipe, conditions, actions)
│   ├── ViewDossier.tsx               968 LOC   Tab "Dossier" (sous-onglets notes/journal/timeline/documents/ordonnances)
│   ├── ViewParcours.tsx             1367 LOC   Tab "Parcours" (CIE nodes + StepProtocol + recurrence grouping)
│   ├── ViewCoordination.tsx          474 LOC   Tab "Coordination" (sous-onglets messages/adressages/rcp/equipe)
│   └── InviteTeamModal.tsx           468 LOC   ⚠ CODE MORT (0 imports)
├── PatientJournalView.tsx           1441 LOC   Journal patient affiché dans tab "Dossier > Journal"
├── ClinicalTimeline.tsx              217 LOC   ⚠ CODE MORT (0 imports — TimelinePanel inline ds ViewDossier le remplace)
├── ConsultationsList.tsx             124 LOC   Tab "Consultations"
├── ViewConsultation.tsx              237 LOC   ⚠ MAL PLACÉ (importé uniquement par /consultations/[id])
├── EditPatientModal.tsx              237 LOC   Modal édition Person (firstName/last/email/phone/birth/sex/title)
├── QuickTaskModal.tsx                157 LOC   Modal création tâche + assignation
├── QuickMessageModal.tsx              83 LOC   ⚠ CODE MORT (0 imports)
├── ScheduleQuestionnaireModal.tsx    269 LOC   Programmation questionnaire patient (push notification)
├── referral-modal.tsx                493 LOC   Modal adressage 3-step (cible → motif/lettre IA → confirmation)
├── rcp/
│   ├── page.tsx                      511 LOC   Liste RCPs du patient + modal création
│   └── [rcpId]/page.tsx              727 LOC   Détail RCP + avis + synthèse IA + brouillon CR + clôture
                                    ───────
                                    9 631 LOC totales
```

### 1.2 `page.tsx` — Le shell

**Composant** : `PatientV2Page({ params: Promise<{ id }> })` — client component (`"use client"`).

**Sous-composants définis inline** :
- `NoteInline` (l.44) — Textarea attachée en haut de page pour créer une note clinique, mutation `api.notes.create(careCaseId, { noteType: "EVOLUTION", body })`.
- `NoteAnalysisBanner` (l.102) — Bandeau polling `api.notes.analysis(careCaseId, noteId)` toutes les 2 s pendant `PENDING` ; affiche état (loading / done / error / no items) ; texte "Nami a identifié N éléments à valider — brouillon, validation humaine requise" (wording MDR-safe).

**State local** :
```ts
activeTab               : Tab          // "globale" | "suivi" | "parcours" | "dossier" | "coordination" | "consultations" | "pediatrique"
noteOpen                : boolean      // affiche NoteInline
referralOpen            : boolean      // ouvre referral-modal.tsx
taskModalOpen           : boolean      // ouvre QuickTaskModal
questionnaireModalOpen  : boolean      // ouvre ScheduleQuestionnaireModal
editPatientOpen         : boolean      // ouvre EditPatientModal
pendingUploadType       : string|null  // front-door upload : passe à ViewDossier qui ouvre l'upload picker
analysisNote            : {noteId, careCaseId}|null  // alimente NoteAnalysisBanner après note créée
aiStreaming             : boolean      // état du polling /intelligence/summarize-job
```

**Hooks de données** :
- `useQuery(["care-case", id])` → `api.careCases.get(id)` (cœur de page, retry: 1, enabled si accessToken).
- `usePatientDashboard(id)` → wrapper React Query (`@/hooks/usePatientDashboard.ts`) qui retourne `PatientDashboard` (patient, pathway, alerts, screenings, indicators, questionnaires, actions, recentActivity). Fallback dash inerte si `undefined`.
- `useCareSocket(id)` → temps réel (notes, journal, observations, messages).
- `useAudioConsentGate(personId, fullName)` → renvoie `{ check, banner }` ; gate sur startRecording.
- `useRecording()` (context) → `startRecording(careCaseId, label)`.
- `useConsultation()` (context) → `startConsultation({ careCaseId, patientName })` async.

**Polling AI** (`handleAiSummarize`, l.231) :
1. POST `/intelligence/summarize-job/{id}` → reçoit `{ jobId }`.
2. Poll `/intelligence/summarize-job/{jobId}/status` toutes les 3 s, deadline 5 min.
3. Sur `completed` → invalide `["care-case", id]`, `["notes", id]`, `["timeline", id]`.
4. Sur `failed` ou timeout → toast.error.

**URL state** :
- ✅ Lu une fois à l'init : `searchParams.get("tab") as Tab ?? "globale"` (l.192).
- ❌ Jamais réécrit : le changement de tab via `setActiveTab` n'utilise pas `router.replace`. Conséquence : deep-link `/cockpit/patients/X?tab=parcours` fonctionne au premier load, mais reload après navigation → retour `globale`.
- ❌ Pas d'`?subtab=` pour les sous-onglets de Dossier (notes/journal/timeline/documents/ordonnances) ni de Coordination (messages/adressages/rcp/equipe).

**Tabs déclarés** (`TABS` const + injection conditionnelle) :
1. `globale` → Vue globale
2. `suivi` → composant `SuiviTab` de `@/components/patient/SuiviTab` (812 LOC, hors scope audit)
3. `parcours` → `ViewParcours`
4. `dossier` → `ViewDossier`
5. `coordination` → `ViewCoordination`
6. `consultations` → `ConsultationsList`
7. `pediatrique` → `PediatricDossier` de `@/components/patient/pediatric/PediatricDossier` (147 LOC), **conditionnel** sur `careCase.caseType === "PEDIATRIC"`.

**Layout structurel** :
```
<div h-full flex flex-col overflow-hidden>
  <PatientHeader />                         (sticky top — démographique + actions)
  {noteOpen && <NoteInline />}              (slide-in horizontal layer)
  {analysisNote && <NoteAnalysisBanner />}  (bandeau MDR-safe)
  <AnimatedTabs />                          (tabs horizontaux)
  <div flex-1 overflow-y-auto>              (scroll viewport)
    <div p-6>
      {activeTab === "..." && <ViewXxx />}
    </div>
  </div>
  <ReferralModal />
  <QuickTaskModal />
  <ScheduleQuestionnaireModal />
  <EditPatientModal />
  {audioConsentBanner}                      (positionné par useAudioConsentGate)
</div>
```

### 1.3 `PatientHeader.tsx` — 228 LOC

- Sticky top, 1 ligne démographique compacte (age, sexe, taille, poids + delta, IMC, badge condition primaire link `/pathologies/<slug>`).
- 6 actions packées dans `flex gap-1.5` :
  1. ✏️ Note → `onAddNote`
  2. ☑️ Tâche → `onTask` (QuickTaskModal)
  3. 📋 Questionnaire → `onQuestionnaire` (ScheduleQuestionnaireModal)
  4. ↗️ Adresser → `onReferral` (referral-modal)
  5. 🎙️ Enregistrer (accent purple) → `onRecord` gated par `gateAudioConsent`
  6. ✨ Synthèse IA → `onAiSummarize`, disabled si `aiStreaming`
- `ExportPdfButton` (interne) : extrait token brut depuis `localStorage["nami-auth"]` (try/catch silencieux) puis `fetch /care-cases/{id}/export/pdf`. ⚠ Bypass de l'API client.
- Bouton crayon → `onEdit` (EditPatientModal).
- 1 query : `["conditions", careCaseId]` (cache 5 min).
- Pas de RBAC interne.

### 1.4 `ViewGlobale.tsx` — 1178 LOC (la plus grosse vue)

15 sous-composants internes (`ClinicalSummaryCard`, `DeltaTickerBanner`, `KeyIndicatorsGrid`, `IndicatorTile`, `ActionsPanel`, `PatientInfoCard`, `ConditionsCard`, `CareTeamCard`, `FlagsBanner` ← **neutralisé MDR**, `TrajectoryDeviationBanner`, `TrajSparkMini`, `AddObservationModal`, `MiniChart`, `Chevron`, `fv`).

Layout `grid grid-cols-1 lg:grid-cols-4` : 3 colonnes contenu + 1 colonne `ActionsPanel`.

Queries :
- `["care-case", id]` (refetch local pour `clinicalSummary` + `updatedAt`, cast type sur `updatedAt` car absent du type `CareCaseDetail` — commentaire l.257 : *"hack hors scope"*).
- `["obs-trajectory", id]`
- `["conditions", id]` + `["conditions-catalog", id]` (catalog enabled seulement si modal ouverte)
- `["team", id]` (staleTime 2 min)
- `["notes-authors", id]` (limit=100, staleTime 2 min) — utilisé seulement pour map "dernier contact" sur l'équipe.

Mutations : génération synthèse (polling job), feedback rating 1–5, addCondition, resolveCondition (PATCH), addObservation.

Modals : `AddObservationModal` (saisie rapide). Tout le reste = expand/collapse inline.

`useSpecialtyView()` filtre les indicateurs par métier (diététicienne ≠ médecin ≠ psychologue).

⚠ Détails :
- `FlagsBanner` retourne `null` par design (commentaire MDR : risque requalification dispositif médical) → 50 LOC mortes à supprimer.
- Double query `["team"]` + `["notes-authors"]` pour reconstruire un mapping `personId → lastContactDate` côté frontend (overhead réseau).
- Hardcodes `#5B4EC4`, `#2BA89C` dans plusieurs sparklines (devrait être tokens design system).

### 1.5 `ViewDossier.tsx` — 968 LOC

5 sous-onglets gérés par `useState<DossierTab>` :
- `notes` → `NotesPanel` (recherche, suppression soft 30 j + undo 10 s toast, RBAC delete = `author || ADMIN`)
- `journal` → `<PatientJournalView />` (1441 LOC, voir 1.7)
- `timeline` → `TimelinePanel` (groupé par mois, filtres all/rdv/referral/alert) — c'est ce TimelinePanel inline qui rend `ClinicalTimeline.tsx` redondant
- `documents` → `DocumentsPanel` (grille responsive 1/2/3 col, filtres all/shared/mine/patient/transcriptions, upload 9 types, extraction bio Vision)
- `ordonnances` → `<PrescriptionDraftEditor />`

Modals internes : `TranscriptionModal`, delete confirmation custom (cockpit-glass-overlay), bio validation modal (extract → candidates → validate → invalide 8 queryKeys).

⚠ Détails :
- 2 patterns confirmation incohérents : modal custom (suppression note + reason) vs sonner undo toast (suppression douce).
- Prop `pendingUploadType` reçue de page.tsx → auto-switch sur tab `documents` + ouverture file picker → callback `onPendingUploadConsumed` pour reset.
- Erreur `UPGRADE_REQUIRED` traitée en dur dans `validateMutation.onError` (l.503-510).
- `console.error` laissé en production.

### 1.6 `ViewParcours.tsx` — 1367 LOC (la deuxième plus grosse vue)

11 sous-composants : `PathwayHeader`, `CIEStepsSection`, `NextStepHero`, `CIENodeRow`, `CIEPhaseGroup`, `RecurrenceGroupCard`, `TemplateStepsSection`, `TemplatePhaseGroup`, `PathwayAssignPanel`, `StepProtocolPanel` (importé d'un niveau parent), `AnticipateSection`, `EmptyState`, `ActBadge`, helpers `groupRecurrences`, `stepCountLabel`.

Modes d'affichage :
- **Pas de pathway assigné** → `EmptyState` avec CTA "Assigner un parcours structuré" (gradient teal).
- **Pathway assigné, pas encore instancié** → `TemplateStepsSection` blueprint mode (étapes statiques par phase).
- **Instancié** → `CIEStepsSection` : `NextStepHero` (1 carte hero priorité OVERDUE > IN_WINDOW > APPROACHING) + groupes par phase collapsibles + recurrence grouping (3+ occurrences identiques compressées en 1 carte + progress bar + expand).

Queries :
- `["patient-config", id]` (staleTime 60 s) — fetch brut `GET /care-cases/{id}/patient-config` via `fetch` natif (pas l'API client !).
- `["pathway-graph", id]` (30 s)
- `["pathway-template-steps", id]` (300 s, enabled si `!hasNodes`)
- `["pathways-all-slim"]` (5 min, pour catalog du PathwayAssignPanel).

Mutations : `instantiatePathway`, `patchNode` (status=COMPLETED + realizedDate=now), `assignPathway`.

NODE_STATUS_CFG mappe `FUTURE | APPROACHING | IN_WINDOW | OVERDUE | COMPLETED | SKIPPED` → couleur+icon+label.

⚠ Détails :
- Utilise `apiWithToken(accessToken!)` au lieu de `api` (incohérence) + `fetch` direct pour patient-config (encore un autre pattern).
- 4 états locaux (selectedNodeId / showChangePanel / heroProtocolOpen / expanded recurrence) → impossible à deep-linker.
- `StepProtocolPanel` (inline drawer "Comment faire") avec placeholder hardcodé *"Protocole en cours de génération"* mais aucun polling pour vérifier la disponibilité.
- Pas d'`aria-expanded` sur les groupes de phases.

### 1.7 `PatientJournalView.tsx` — 1441 LOC

Composant le plus volumineux du dossier. Importé uniquement par `ViewDossier` (tab "journal"). Pas d'utilisation dans page.tsx.

Affiche journal patient (entries quotidiennes) groupé par jour + sensations / repas avec photos / nutrition macros (validées ou IA) / notes / crises / alertes.

13 sous-composants internes : `Badge`, `MicroBar`, `MacroBar`, `NutritionDetailEditable`, `StatCard`, `CompactMealCard`, `CompactNoteCard`, `DayNutritionSummary`, `DayColumn`, `AlertBanner`, `CrisisCard`.

Queries / mutations : `["journal", careCaseId]` + `analyzeNutrition` + `updateNutritionAnalysis`. Hook `useSpecialtyView()` pour gating métier.

Props `permissions` : `canSeeAiMacros`, `canSeeWeight` (référencé mais jamais affiché), `canSeeCrisisDetail`.

Filtres période : 7 j / 30 j / all (state local).

⚠ Détails :
- Aucun test, aucune doc, palette de couleurs très granulaire (V/T/S/VL/TL/SL).
- Pas d'annulation après "Modifier" → tape, abandonne, perdu.
- Recalcul kcal à chaque keystroke sur édition macro.
- Pas de gestion d'erreur visible sur `analyzeNutrition` (silent fail).
- Code candidat à découpage en sous-fichiers (`/journal/` directory).

### 1.8 `ViewCoordination.tsx` — 474 LOC

4 sous-onglets `subTab` :
- `messages` → `MessagesPanel` (textarea + emergency banner 15/112, auto-scroll bottom)
- `adressages` → `AdressagesPanel` (referrals list + suggestedReferrals AI avec CTA "Inviter")
- `rcp` → `RcpPanel` (cards RCP, navigation `/patients/[id]/rcp` et `/patients/[id]/rcp/[rcpId]`)
- `equipe` → `EquipePanel` (membres + last contact)

Modals : `InviteModal` interne (annuaire OU lien magique copy-clipboard) + `InviteTeamModal` importé depuis `@/components/InviteTeamModal` (différent du `views/InviteTeamModal.tsx` mort).

Queries : `["messages"]`, `["referrals"]`, `["rcps"]`, `["team"]` — toutes chargées dès l'arrivée sur l'onglet (pas de lazy).

Mutations : send message, create referral.

Navigation router.push vers sous-routes RCP.

⚠ Détails :
- `copyLink` génère URL avec `window.location.origin` hardcodé (typeof window check) → fragile si SSR.
- `searchQuery` directory mode : pas de debounce visible (debounce indirect via min 2 chars).
- AdressagesPanel reconsomme `dashboard.actions.suggestedReferrals` et `api.referrals.list(id)` → 2 sources qui peuvent dériver.

### 1.9 `referral-modal.tsx` — 493 LOC

Wizard 3 étapes : (1) qui ? (2) détails (motif, urgence, message, lettre IA générée) (3) confirmation.

Queries : `["my-colleagues"]`, `["provider-search", searchQuery]` (public).
Mutation : `api.referrals.create(...)`.
Fetch direct : `POST /intelligence/referral-letter/{careCaseId}` (génère brouillon lettre IA).

⚠ Bug confirmé :
- Ligne 153 : `setClinicalReason(data.letter)` — devrait être `setLetterDraft(data.letter)`. La lettre IA écrase le motif clinique.
- `patientConsent: true` hardcodé dans la mutation alors que la checkbox UI est affichée → la checkbox sert d'affichage légal mais ne bloque pas le submit (à confirmer côté backend).

Wording adapté selon `senderRoleType` : "Adressage" si PHYSICIAN, "Demande de coordination" sinon.

### 1.10 `rcp/page.tsx` (511 LOC) + `rcp/[rcpId]/page.tsx` (727 LOC)

Sous-routes nested. Liste RCPs + Détail RCP avec :
- Avis (`OpinionForm` : AGREE / DISAGREE / NEUTRAL / NEED_MORE_INFO + textarea — sérialisé en `[POSITION] texte`).
- Synthèse IA des opinions (`api.rcps.summarize`).
- Brouillon CR IA (`api.rcps.draftCr` → modal lecture + bouton "Utiliser comme décision").
- Clôture (`CloseRcpModal` : décision + mode CONSENSUS/MAJORITY/INITIATOR_DECISION + actions à créer).
- Annulation, export PDF (`fetch` direct hors API client).

URL search `?create=1` ouvre `CreateRcpModal` puis `router.replace` nettoie l'URL (idempotent).

⚠ Détails :
- Pas d'invalidation `["rcp", rcpId]` post-`opinion.mutate` (peut afficher état stale).
- Pas de polling/socket pour avis collègues live.
- Position `NEED_MORE_INFO` label très long → affichage badge cassé.

### 1.11 Modals utilitaires (EditPatientModal, QuickTaskModal, ScheduleQuestionnaireModal)

**EditPatientModal (237)** — Mutation 2-étapes (Person + CareCase si patientFacingTitle change), diff-based (ne POST que les champs modifiés), validation email regex basique, gestion 403/409.

**QuickTaskModal (157)** — 6 task types, 4 priorités, optional dueDate + assignedToPersonId (défaut "Moi-même", filtre team status === "ACCEPTED"). ⚠ Inline CSS objects (pas Tailwind), typo `"Tache creee"` (sans accents). Invalide 3 queryKeys.

**ScheduleQuestionnaireModal (269)** — 5 questionnaires hardcodés (EDE-Q, PHQ-9, EAT-26, GAD-7, SCOFF), routing par pathway family (25+ familles), age gating (EDE-Q ≥14, SCOFF ≥15, etc.), datetime picker `min = now + 5 min`, message custom 500 chars, info banner push notification.

### 1.12 Code mort confirmé (vérifié par grep)

| Fichier | LOC | Imports | Status |
|---|---:|---:|---|
| `views/InviteTeamModal.tsx` | 468 | **0** | DEAD — un autre `InviteTeamModal` existe à `@/components/InviteTeamModal` (importé par ViewCoordination). Doublon V1/V2 reliquat de la consolidation. |
| `QuickMessageModal.tsx` | 83 | **0** | DEAD — fonctionnalité reprise dans `ViewCoordination.MessagesPanel`. Reliquat des P0 démo. |
| `ClinicalTimeline.tsx` | 217 | **0** | DEAD — `TimelinePanel` inline dans `ViewDossier` remplit le même rôle. |
| `ViewConsultation.tsx` | 237 | **1 (hors patient/[id])** | MAL PLACÉ — importé par `src/app/(cockpit)/consultations/[id]/page.tsx`. Devrait vivre dans `/consultations/[id]/`. |

**Total LOC mort/mal placé : 1 005 LOC.**

---

## Section 2 — Pattern de navigation actuel + URL state

### 2.1 Trois niveaux d'onglets cohabitent

```
Niveau 1 — Tabs racine (page.tsx)
  globale | suivi | parcours | dossier | coordination | consultations | pediatrique?
  → AnimatedTabs (composant partagé, 61 LOC)
  → URL : ?tab=<key> (lu UNE fois à l'init, jamais réécrit)

Niveau 2 — Sous-onglets de Dossier (ViewDossier)
  notes | journal | timeline | documents | ordonnances
  → bordure colorée custom inline
  → URL : aucune (state local DossierTab)

Niveau 2bis — Sous-onglets de Coordination (ViewCoordination)
  messages | adressages | rcp | equipe
  → bordure colorée + badges de count
  → URL : aucune (state local subTab)

Niveau 3 — Sous-routes Next.js (rcp)
  /patients/[id]/rcp           → liste
  /patients/[id]/rcp/[rcpId]   → détail
  → URL : true routing (vraies routes)
```

### 2.2 Problèmes du pattern actuel

| # | Problème | Conséquence concrète |
|---|---|---|
| P1 | Tab `?tab=` jamais réécrit | Refresh navigateur depuis "Parcours" → atterrissage sur "Vue globale". Bookmark cassé. |
| P2 | Sous-onglets sans URL | Impossible d'envoyer un lien direct vers "Dossier > Journal" ou "Coordination > Messages". |
| P3 | Modals sans URL state | Impossible de partager "ouvre directement l'adressage" via lien. |
| P4 | 3 niveaux d'onglets visuellement distincts | Charge cognitive : 3 grammaires UI différentes pour la même opération "je change ce que je regarde". |
| P5 | Tab `pediatrique` conditionnel et placé en queue | Soignant pédiatrique doit scroller au bout pour trouver SA tab principale. |
| P6 | RCP nested route mais Coordination est un onglet | Incohérence : pourquoi RCP a une vraie URL mais pas Messages ? |

### 2.3 Composant `AnimatedTabs` (référence)

61 LOC, `@/components/ui/AnimatedTabs.tsx`. Props : `tabs[]`, `activeTab`, `onTabChange`, `className`. Animation de l'indicateur (slide horizontal). N'expose pas de mécanique URL-state — il appartient au parent de le câbler.

---

## Section 3 — Features fonctionnelles à PRÉSERVER absolument

Liste honnête de ce qui marche et que toute refonte doit conserver, sans dégradation visible côté soignant :

### 3.1 Boucle clinique courte (PatientHeader → action)
- **Note inline 1 clic** (NoteInline ouvert directement, pas modal) + analyse Nami banner (PENDING/DONE/ERROR/NO_ITEMS).
- **Adressage 3-step** avec génération lettre IA + sélection contact OU annuaire public + consentement patient affiché.
- **Tâche rapide** : assignation + dueDate + priorité en 1 modal.
- **Questionnaire programmable** : 5 questionnaires, age gating, push notification expliquée.
- **Enregistrement consultation** : gated par `useAudioConsentGate` (banner si non consenti, single CTA si OK).
- **Synthèse IA streaming** : job + polling + invalidation cohérente des 3 caches (care-case / notes / timeline).

### 3.2 Vue globale (ViewGlobale)
- Résumé IA structuré (excerpt → full mode 2 colonnes) avec feedback rating 1–5.
- Indicateurs hiérarchisés par métier via `useSpecialtyView` (le diététicien voit poids/IMC en primary, le psy voit anxiété/EDE-Q en primary).
- Sparklines SVG performantes.
- TrajectoryDeviationBanner avec sessionStorage dismiss (non-intrusif).
- ActionsPanel droite : tâches urgentes / RDV à venir / adressages pending + suggérés.
- Wording MDR-safe (FlagsBanner neutralisé exprès, "indicateur de complétude" partout).

### 3.3 Dossier (ViewDossier)
- **Soft delete + undo 10 s** sur notes (RBAC author||ADMIN).
- Upload 9 types document + extraction bio Vision (extract → candidates → validate → cascade d'invalidation 8 keys).
- ConsultationNoteDisplay éditable inline (rendu markdown).
- Front-door `pendingUploadType` qui auto-bascule sur le bon onglet et ouvre le file picker.
- PrescriptionDraftEditor en onglet dédié.

### 3.4 Parcours (ViewParcours)
- **Hero NextStep prioritisé** OVERDUE > IN_WINDOW > APPROACHING.
- **Recurrence grouping** : 12 séances de psy compressées en 1 carte avec progress bar.
- Phase groups collapsibles avec compteurs completed/overdue.
- Status color-coding cohérent (NODE_STATUS_CFG) sur 6 états.
- EmptyState avec CTA quand aucun parcours assigné.
- PathwayAssignPanel groupé par famille (TCA, Obésité, Pédiatrie…).

### 3.5 Coordination (ViewCoordination)
- Emergency banner permanent sur messages (15/112 — conformité réglementaire).
- Sub-tab badges avec compteurs (referrals pending, messages non lus → à confirmer).
- InviteModal lien magique copy-clipboard.
- Navigation vers RCP nested.

### 3.6 RCP nested
- 4 positions d'avis (AGREE/DISAGREE/NEUTRAL/NEED_MORE_INFO) + texte libre.
- Synthèse IA des opinions distinct du brouillon CR IA.
- Export PDF.
- Clôture structurée (décision + mode + actions à créer).
- Création depuis liste OU depuis `?create=1` (URL deep-link).

### 3.7 Conditionnel pédiatrique
- Tab `pediatrique` apparaît si `caseType === "PEDIATRIC"` (sans recharger), composant `PediatricDossier`.

### 3.8 Plomberie temps réel et auth
- `useCareSocket(id)` : push live notes / journal / observations / messages.
- Banner email non vérifié + MFA non activé en haut du layout cockpit.
- Audio consent gate avec banner persistant.

**Tout ce qui précède doit survivre à n'importe quelle refonte.**

---

## Section 4 — Pain points UX honnêtes

Identifiés strictement par lecture du code, sans projection.

### 4.1 Navigation
- **P1 — URL state cassé** : `?tab=` non-réécrit + 0 sous-onglet URLisé → deep-linking impossible au-delà du premier load.
- **P2 — 3 grammaires d'onglets** : tabs racine animés / sous-onglets bordure colorée Dossier / sous-onglets badge Coordination. Trois visuels différents pour la même opération.
- **P3 — Tab Pédiatrie en queue** : pour un cas pédiatrique, la tab spécifique apparaît en 7ᵉ position après 6 onglets génériques. Faut scroller.
- **P4 — RCP nested vs reste flat** : incohérence d'URL design.
- **P5 — 6 actions header sans hiérarchie** : Note / Tâche / Questionnaire / Adresser / Enregistrer / Synthèse IA toutes au même niveau visuel, alors que "Enregistrer une consultation" et "Note" sont les actions 99 % du temps.

### 4.2 Architecture composants
- **P6 — ViewGlobale = 1178 LOC, 15 sous-composants** : difficile à maintenir, beaucoup de re-renders potentiels (pas de `memo`).
- **P7 — ViewParcours = 1367 LOC** : recurrence grouping + protocol panel + assign panel + template fallback = 11 sous-composants imbriqués.
- **P8 — PatientJournalView = 1441 LOC dans un seul fichier** : 13 sous-composants, candidat évident à splitting.
- **P9 — Code mort 768 LOC** : trois fichiers non importés polluent le dossier et trompent les agents qui les analysent (cf. cet audit où une IA a affirmé que ClinicalTimeline était utilisé).
- **P10 — ViewConsultation mal placé** : crée une dépendance inversée (`/consultations/[id]` importe depuis `/patients/[id]/`).

### 4.3 Cohérence technique
- **P11 — Triple pattern API** : singleton `api` / factory `apiWithToken(token)` / `fetch` direct (patient-config, export PDF, intelligence/summarize-job).
- **P12 — Cast type hack** `updatedAt` dans ViewGlobale (commentaire l.257 "hack hors scope").
- **P13 — FlagsBanner neutralisé** mais composant et types laissés en place (50 LOC + dependencies).
- **P14 — `console.error` en production** (ViewDossier validation bio).
- **P15 — Hardcode couleurs** `#5B4EC4` et `#2BA89C` éparpillés (ViewGlobale sparklines, ViewParcours, ViewDossier tabs) au lieu de tokens design.
- **P16 — QuickTaskModal en CSS inline objects** (pas Tailwind) : incohérent avec le reste du dossier.
- **P17 — Typos français sans accents** : "Tache creee", "Message envoye" → suggère manque relecture wording (ironique vu lexique MDR strict).

### 4.4 UX micro-frictions
- **P18 — referral-modal ligne 153** : la génération de lettre IA écrase le motif clinique (`setClinicalReason(data.letter)` au lieu de `setLetterDraft`). Bug à confirmer.
- **P19 — Édition macro PatientJournalView** : pas de Cancel/Reset après "Modifier" → modification abandonnée = perdue silencieusement.
- **P20 — Bio extraction modal** : `max-h-[55vh]` avec scroll interne sur > 10 candidats → scroll fighting.
- **P21 — Recurrence grouping clé fragile** : `${actLabel}__${specialty}__${clinicalActType}` — sensible aux espaces et casse.
- **P22 — Pas d'`aria-expanded`** sur phase groups (ViewParcours), pas de focus management sur ouverture de modals.
- **P23 — Pas de polling protocol** : "Protocole en cours de génération" affiché sans rafraîchissement.
- **P24 — Pas d'optimistic UI** sur les mutations principales (note, tâche, observation) → spinner systématique.

### 4.5 Doublons de données
- **P25 — `["team"]` + `["notes-authors"]`** pour reconstruire un mapping côté front, alors qu'un seul endpoint enrichi suffirait.
- **P26 — `dashboard.actions.referrals` vs `["referrals", id]`** : 2 sources possibles dans ViewCoordination/AdressagesPanel.

### 4.6 Ce qui n'est PAS un pain point malgré apparences
- La taille du dossier ne témoigne pas d'un manque de cohérence — `page.tsx` est étonnamment clair (452 LOC bien structurées).
- La cascade d'invalidations React Query (jusqu'à 8 keys après validation bio) **est correcte** et reflète la nature relationnelle des données. À ne pas "optimiser" naïvement.
- L'usage de 2 contextes (Recording + Consultation) est légitime — ils gèrent des widgets globaux du layout.

---

## Section 5 — Composants partagés (réutilisables vs spécifiques)

### 5.1 Composants partagés importés depuis l'extérieur du dossier

| Composant | Path | Usage dans le dossier |
|---|---|---|
| `AnimatedTabs` | `@/components/ui/AnimatedTabs` | page.tsx (tabs racine) |
| `Button` | `@/components/ui/button` | partout |
| `Textarea` | `@/components/ui/textarea` | page.tsx (NoteInline), referral-modal, RCP, ViewCoordination, modals |
| `Input` | `@/components/ui/input` | RCP modals |
| `Dialog*` | `@/components/ui/dialog` | RCP modals (Dialog/Content/Header/Title/Footer) |
| `Skeleton` | `@/components/ui/skeleton` | PatientJournalView, ClinicalTimeline (mort) |
| `MarkdownContent` | `@/components/MarkdownContent` | ViewGlobale (résumé), ViewDossier (aiAnalysis), RCP detail, ViewConsultation |
| `AiDisclaimer` | `@/components/AiDisclaimer` | ViewGlobale |
| `ProtocolBanner` | `@/components/protocol/ProtocolBanner` | ViewGlobale |
| `ConsultationNoteDisplay` | `@/components/consultation-note` | ViewDossier (NotesPanel) |
| `PrescriptionDraftEditor` | `@/components/PrescriptionDraftEditor` | ViewDossier (tab ordonnances) |
| `RcpPickerNetworkGroup` | `@/components/cockpit/RcpPickerNetworkGroup` | rcp/page.tsx |
| `GrowthCharts` | `@/components/patient/GrowthCharts` | ViewGlobale (si mineur + sex) |
| `SuiviTab` | `@/components/patient/SuiviTab` | page.tsx (tab suivi, 812 LOC, hors scope) |
| `PediatricDossier` | `@/components/patient/pediatric/PediatricDossier` | page.tsx (tab pediatrique, 147 LOC) |
| `InviteTeamModal` (vrai) | `@/components/InviteTeamModal` | ViewCoordination (EquipePanel) |

### 5.2 Composants définis dans le dossier et candidats à extraction

| Composant local | Fichier | Réutilisable ailleurs ? |
|---|---|---|
| `NoteInline` | page.tsx | Probable (utilisable depuis le widget Consultation aussi) |
| `NoteAnalysisBanner` | page.tsx | Probable (toute interface créant des notes) |
| `KeyIndicatorsGrid` + `IndicatorTile` + `MiniChart` | ViewGlobale | Très probable (dashboard équipe, vue Aujourd'hui) |
| `ClinicalSummaryCard` | ViewGlobale | Probable (vue équipe, RCP) |
| `ActionsPanel` | ViewGlobale | Probable (dashboard) |
| `CareTeamCard` | ViewGlobale | Possible (page équipe globale) |
| `TimelinePanel` | ViewDossier | Doublonne `ClinicalTimeline.tsx` mort → unifier |
| `NextStepHero` + `CIENodeRow` + `CIEPhaseGroup` + `RecurrenceGroupCard` | ViewParcours | Très probable (vue Aujourd'hui, mobile) |
| `AddObservationModal` | ViewGlobale | Probable (déjà 2 entry points : Vue globale + Suivi backbone) |
| `MessagesPanel` | ViewCoordination | Possible (page Messages globale ?) |
| `OpinionForm` | rcp/[rcpId]/page.tsx | Très probable (RCP est un workflow d'équipe transverse) |

### 5.3 Patterns CSS non-tokenisés détectés

| Pattern | Occurrences | Recommandation |
|---|---|---|
| `#5B4EC4` (primary purple) en dur | ViewGlobale, ViewParcours, ViewDossier, PatientJournalView | Token `--color-primary` |
| `#2BA89C` (teal) en dur | ViewGlobale, ViewParcours | Token `--color-secondary` |
| `cockpit-glass-overlay` class | ViewDossier (delete modal) | OK c'est tokenisé |
| Inline `style={{ fontFamily: "'Plus Jakarta Sans'..." }}` | QuickTaskModal | Migrer Tailwind |

---

## Section 6 — Tests actuels : couverture

### 6.1 Constat

**Zéro test cible directement ce dossier.**

- `e2e/` : 0 spec navigue vers `/cockpit/patients/<id>` (vérifié par grep). Les spec mentionnent "patient" mais visent la surface patient (`/accueil`, `/ma-sante`, `/mes-documents`) ou les guards d'auth.
- `e2e/a11y/` : 6 specs a11y, aucune sur le cockpit patient (existe pour `cockpit/mes-evenements`, `landing-public`, `patient-ma-sante`, etc.).
- `src/**/__tests__/` : 30 fichiers `.test.tsx`, **0 dans ce dossier** ni sur ses composants.
- Le `PatientLayout.test.tsx` qui apparaît dans les recherches teste `@/components/patient/PatientHeader.tsx` (surface PATIENT mobile) — **homonyme** du `views/PatientHeader.tsx` du cockpit. Source de confusion.

### 6.2 Infra disponible (à exploiter dans une refonte)

- Vitest 4 (`npm run test`)
- React Testing Library (`render`, `screen`, `fireEvent`, `waitFor`)
- Playwright 1.60 (`npm run test:e2e`)
- `@axe-core/playwright` pour a11y

### 6.3 Risque

Toute modification (même légère) sur ces ~9 600 LOC tombe **sans filet** : pas de smoke test, pas de snapshot, pas d'a11y check. Le seul filet est la couverture e2e sur les workflows d'auth.

---

## Section 7 — Recommandation refonte : **PARTIELLE**

### 7.1 Position

**Pas de refonte big-bang.** Refondre la page entière (~9 600 LOC) introduit un risque démesuré par rapport au gain — la majorité du code fonctionne et porte des features critiques pour la démo VC / Hanachi / HAP.

Cependant, **plusieurs zones méritent un travail ciblé** parce qu'elles bloquent l'UX ou la maintenabilité immédiatement.

### 7.2 Argumentaire

**Pourquoi NON à un big-bang** :
1. Zéro test sur la page → toute refonte = régressions invisibles en prod.
2. Features critiques pour les démos imminentes (Phase 0 nami-platform-coherence : ne pas casser l'existant en l'absence de filet).
3. La structure 6 tabs + sub-tabs **est lisible une fois apprise** ; les soignants ont été formés dessus (Léa, Margot elle-même).
4. Wording MDR a été audité (FlagsBanner neutralisé, banners "brouillon validation humaine requise") — refonte = re-audit légal.
5. RCP nested route fonctionne (export PDF, opinions, synthèse IA, clôture) — fragile à reconstruire.

**Pourquoi OUI à des chantiers ciblés** :
1. Code mort + mal placé (1 005 LOC) → suppression nette = zéro risque, baisse de la charge cognitive.
2. URL state incomplet → deep-linking cassé = mauvaise pratique web 2026 + bloque le partage de liens entre soignants (use case Coordination).
3. ViewGlobale 1178 LOC → split en sous-composants externalisés permet (a) tests unitaires possibles (b) réutilisation page Aujourd'hui / mobile (c) edition sans peur.
4. Triple pattern API → consolidation simple, gains de cohérence.
5. Hiérarchisation header (6 actions plates → 2 primaires + 4 secondaires en menu) → réduit la charge visuelle sans toucher la logique.

### 7.3 Verdict

**REFONTE PARTIELLE**, en **3 chantiers indépendants et séquençables**, chacun avec son propre PR isolé. Détails Section 8.

---

## Section 8 — Si refonte recommandée : scope précis + chemin sans-perte

### 8.1 Vue d'ensemble des 3 chantiers

| # | Chantier | Risque | Gain | LOC touchées | Durée estimée |
|---|---|---|---|---:|---|
| **C1** | Cleanup code mort + ViewConsultation déplacé | **Très bas** | Visibilité, charge mentale | ~1 005 LOC supprimées / déplacées | 0.5 j |
| **C2** | URL state complet (tab + sub-tab) + deep-link modals | Bas | Deep-linking, partage liens, refresh non destructif | ~100 LOC modifiées | 1 j |
| **C3** | Split ViewGlobale (1178→~300) en sous-composants externalisés + tests vitest | Moyen | Maintenabilité, réutilisation, filet de test | ~1500 LOC mouvées + ~400 LOC tests | 3-4 j |

Total : **5 j** au maximum avec PR séparées et review entre chaque.

### 8.2 Chantier C1 — Cleanup code mort (Phase 0 + plan)

#### Phase 0 hyper détaillée

```
Étape 0.1 — Vérifications avant suppression
  → git log -- src/app/(cockpit)/patients/[id]/views/InviteTeamModal.tsx
    (vérifie historique : reliquat consolidation V1/V2 commit 75b0d41 ?)
  → git grep -n "InviteTeamModal" -- src/  (depuis racine, pas worktree)
    (confirme 0 import en main branch + main remote)
  → idem pour QuickMessageModal, ClinicalTimeline
  → Test build local : `npm run build` baseline OK (capturer durée et taille bundle)

Étape 0.2 — Vérifier ViewConsultation est ENCORE utilisé
  → grep "from.*ViewConsultation" src/  → confirme seul caller = /consultations/[id]
  → vérifier qu'aucun import dynamique : grep "import(" src/ | grep -i consultation
  → confirmer qu'aucune doc ne le mentionne dans patient/[id] (FEATURES.md, AUDIT_REPORT.md)

Étape 0.3 — Snapshot UI sans modification
  → Capture screen Storybook / Playwright des 6 tabs + 6 modals SI possible
  → SINON : capture manuelle Léa/Margot pour comparaison post-changement

Étape 0.4 — Build typecheck baseline
  → npx tsc --noEmit > baseline.txt
  → npm run lint > lint-baseline.txt
```

#### Plan d'exécution

```
1. git rm src/app/(cockpit)/patients/[id]/views/InviteTeamModal.tsx
2. git rm src/app/(cockpit)/patients/[id]/QuickMessageModal.tsx
3. git rm src/app/(cockpit)/patients/[id]/ClinicalTimeline.tsx
4. git mv src/app/(cockpit)/patients/[id]/ViewConsultation.tsx \
         src/app/(cockpit)/consultations/[id]/ViewConsultation.tsx
   → Édit src/app/(cockpit)/consultations/[id]/page.tsx :
     import { ViewConsultation } from "./ViewConsultation";
5. Édit ViewGlobale.tsx : SUPPRIMER FlagsBanner (50 LOC commentées + le composant + son call)
   → Vérifier que zéro autre fichier ne le référence
6. npx tsc --noEmit → 0 erreur
7. npm run lint → 0 warning supplémentaire
8. npm run build → succès, comparer bundle size vs baseline
9. Smoke test manuel : ouvrir /cockpit/patients/<id démo Léa>, parcourir 6 tabs
10. PR avec titre "chore(cockpit-patient): cleanup code mort 1005 LOC [INIT-CLEANUP-PATIENT-V1]"
```

#### Critères d'acceptation
- 4 fichiers supprimés/déplacés.
- Bundle size cockpit -2 à -5 % attendu.
- Aucune régression visuelle sur les 6 tabs.
- Tsc + lint vert.

### 8.3 Chantier C2 — URL state complet

#### Phase 0 hyper détaillée

```
Étape 0.1 — Cartographie de l'état actuel
  → Recenser TOUS les useState UI que devrait porter l'URL :
    page.tsx : activeTab (oui), noteOpen, referralOpen, taskModalOpen,
              questionnaireModalOpen, editPatientOpen
    ViewDossier : activeTab DossierTab (notes/journal/timeline/documents/ordonnances)
    ViewCoordination : subTab (messages/adressages/rcp/equipe)
  → Décider quels modals méritent URL state (deep-link)
    Reco : modals d'action (referral, task) NE doivent PAS être URL-stateful
           (transient). Modals de lecture/édition (editPatient) NON plus.
           SEULES les tabs et sub-tabs en URL.

Étape 0.2 — Définir le schéma final
  /cockpit/patients/[id]?tab=globale
  /cockpit/patients/[id]?tab=dossier&sub=notes
  /cockpit/patients/[id]?tab=coordination&sub=rcp
  → "sub" lu seulement si tab connait la notion (dossier, coordination)
  → router.replace avec scroll: false sur chaque setActiveTab/setSubTab

Étape 0.3 — Capturer les redirections actuelles
  → Aujourd'hui, qui linke vers ?tab=... ? : grep "tab=" src/
  → Confirmer qu'on ne casse pas les links existants

Étape 0.4 — Préparer tests Playwright
  → Spec /e2e/cockpit-patient-deep-link.spec.ts
    test 1 : visit ?tab=parcours → page parcours s'affiche
    test 2 : visit ?tab=dossier&sub=documents → tab dossier + sub documents
    test 3 : navigation interne change l'URL
    test 4 : refresh restaure l'état
```

#### Plan d'exécution

```
1. Créer hook src/hooks/useTabUrlState.ts (générique, 30 LOC)
   - useTabUrlState({ key, defaultTab }) → [tab, setTab]
   - utilise useSearchParams + router.replace avec scroll: false
2. Refactor page.tsx :
   - Remplacer useState<Tab> par useTabUrlState({ key: "tab", defaultTab: "globale" })
3. Refactor ViewDossier.tsx :
   - Ajouter useTabUrlState({ key: "sub", defaultTab: "notes" })
4. Refactor ViewCoordination.tsx :
   - Ajouter useTabUrlState({ key: "sub", defaultTab: "messages" })
5. Modifier les call-sites internes qui setActiveTab via prop (page.tsx → handleAddDocument)
   pour passer aussi le sub. Ou laisser l'inner décider à l'init via prop pendingUploadType.
6. Ajouter les 4 specs Playwright deep-link
7. tsc / lint / build
8. PR "feat(cockpit-patient): URL state complet (tab + sub) — deep-link [INIT-COCKPIT-URL-STATE-V1]"
```

#### Critères d'acceptation
- Refresh navigateur restaure le tab + sub-tab.
- Liens `?tab=dossier&sub=documents` fonctionnent en première visite.
- Sticky URL : la barre d'URL est toujours à jour pendant la navigation.
- 4 spec Playwright vertes.

### 8.4 Chantier C3 — Split ViewGlobale + filet de tests

#### Phase 0 hyper détaillée

```
Étape 0.1 — Cartographie des sous-composants
  Sous-composant            LOC actuel   Réutilisable ailleurs   Test pertinent
  ClinicalSummaryCard       ~170         Oui (page équipe)       Snapshot + polling job
  DeltaTickerBanner         ~60          Oui                     Snapshot
  KeyIndicatorsGrid +
   IndicatorTile + MiniChart ~280        OUI (3 endroits)        Render + edge empty
  ActionsPanel              ~120         Oui                     Render + click handlers
  PatientInfoCard           ~80          Probable                Snapshot
  ConditionsCard            ~150         Probable                Add/resolve flows
  CareTeamCard              ~120         Possible                Last-contact map
  TrajectoryDeviationBanner ~70          Possible                Dismiss sessionStorage
  AddObservationModal       ~80          OUI                     Submit + parse float
  Helpers (fv, Chevron)     ~10          —                       —

Étape 0.2 — Décider du target structurel
  Reco :
    src/components/cockpit/patient-overview/
      ├── ClinicalSummaryCard.tsx
      ├── KeyIndicators/{KeyIndicatorsGrid,IndicatorTile,MiniChart}.tsx
      ├── ActionsPanel.tsx
      ├── PatientInfoCard.tsx
      ├── ConditionsCard.tsx
      ├── CareTeamCard.tsx
      ├── TrajectoryDeviationBanner.tsx
      ├── AddObservationModal.tsx
      └── __tests__/

  ViewGlobale.tsx devient un orchestrateur de ~300 LOC qui assemble les
  cartes dans la grille.

Étape 0.3 — Tests vitest avant refactor
  → Pour ClinicalSummaryCard : mock api.intelligence + polling deadline
  → Pour IndicatorTile : valeur, delta+, delta-, empty, sparkline=null
  → Pour ActionsPanel : urgentTasks click toggle, pending referrals, suggestedReferrals
  → Pour ConditionsCard : add/resolve flows + RBAC if applicable
  → Pour TrajectoryDeviationBanner : sessionStorage dismiss/restore
  → Pour AddObservationModal : parseFloat NaN guard, submit success/error

  Tests AVANT refactor = baseline comportement.

Étape 0.4 — Inventorier les références externes
  → Aucun composant interne actuel n'est importé hors ViewGlobale (vérifier)

Étape 0.5 — Identifier les hooks data réutilisables
  ["care-case"], ["obs-trajectory"], ["conditions"], ["team"], ["notes-authors"]
  → Aucun à extraire en hook standalone à ce stade (rester focus split).
```

#### Plan d'exécution

```
1. Créer dossier src/components/cockpit/patient-overview/ + tests/
2. Pour chaque sous-composant (10 unités) :
   a. Créer fichier dans nouveau dossier (copier-coller depuis ViewGlobale)
   b. Identifier props minimales (passer dashboard, careCaseId, callbacks)
   c. Écrire 2-3 tests vitest critiques (render, empty, principal flow)
   d. tsc check à chaque étape
3. Refactor ViewGlobale.tsx en orchestrateur (~300 LOC) :
   - Imports nouveau dossier
   - Grille layout préservée
   - Props passing préservé
4. Suppression des sous-composants inline
5. Vérifier build + smoke manuel sur compte Léa
6. PR "refactor(cockpit-patient): split ViewGlobale en 10 composants externalisés
       + tests vitest [INIT-COCKPIT-VIEWGLOBALE-SPLIT]"
```

#### Critères d'acceptation
- ViewGlobale.tsx ≤ 350 LOC.
- 10 nouveaux composants dans `@/components/cockpit/patient-overview/`.
- ≥ 20 tests vitest verts.
- Aucune régression visuelle.
- Bundle size cockpit ± 0 %.

### 8.5 Chantiers non retenus (à reporter)

| Chantier | Pourquoi reporter |
|---|---|
| Split ViewParcours (1367 LOC) | Logique CIE + recurrence grouping + protocols est fragile, refonte = risque démo. Faire SI besoin, AVEC tests préalables sur seeds Gabrielle/Léa. |
| Split PatientJournalView (1441 LOC) | Composant peu touché récemment, mobile-only dans le cockpit. Réviser quand sprint pédiatrie suivant arrive. |
| Refonte navigation 3 niveaux → 1 niveau plat | UX impactante, risque d'écrasement formations utilisateurs (Léa). Réserver à un workshop UX dédié avec Margot + 1 soignant. |
| Hiérarchie 6 actions header | Décision UX produit. Réserver à un sprint UX dédié (skill ux-obviousness). |
| Consolidation API client (3 patterns) | Touche infra auth, scope large. Sprint infra dédié, hors refonte page. |

### 8.6 Garde-fous transverses pour les 3 chantiers

1. Chaque chantier = 1 PR dédiée, draft d'abord, review Margot avant merge.
2. `npx tsc --noEmit` doit retourner 0 erreur AVANT et APRÈS chaque commit.
3. Smoke manuel obligatoire sur compte Léa (Gabrielle 10 ans TCA) — les 6 tabs + 6 actions header.
4. Tagger les PRs avec ticket Notion + skill `nami-platform-coherence` + `nami-ticket-lifecycle`.
5. Pas de modification de wording MDR sans validation `nami-legal`.

---

## Annexes

### A. Inventaire API endpoints consommés par le dossier

```
api.careCases.get(id)
api.careCases.update(id, body)
api.careCases.timeline(id, page, limit)
api.careCases.pathwayGraph(id)
api.careCases.pathwayTemplateSteps(id)
api.consultations.listByCareCase(id)
api.journal.list(id) / listEntries(id)
api.journal.analyzeNutrition(entryId)
api.journal.updateNutritionAnalysis(entryId, items)
api.journal.nutritionBatchAnalyze(id)
api.messages.send(id, body)
api.notes.create(id, { noteType, body })
api.notes.analysis(id, noteId)
api.persons.patch(personId, patch)
api.rcps.list(id) / get(rcpId) / create / summarize / draftCr / opinion / close / cancel
api.referrals.create(...)
api.tasks.create(id, taskInput)
api.tasks.scheduleQuestionnaire(id, { questionnaireCode, scheduledAt, patientMessage })
api.team.list(id)

Fetch direct (hors api client) :
  POST /intelligence/summarize-job/{id}
  GET  /intelligence/summarize-job/{jobId}/status
  POST /intelligence/referral-letter/{careCaseId}
  POST /referrals (referral-modal alternate path ?)
  GET  /providers/my-colleagues
  GET  /providers/public
  GET  /providers/nami?q=...
  POST /care-cases/{id}/team/invite
  GET  /care-cases/{id}/team?includeAllStatuses=true
  GET  /care-cases/{id}/conditions
  POST /care-cases/{id}/conditions, PATCH .../{conditionId}
  POST /documents (multipart)
  POST /documents/{id}/extract-bio
  POST /documents/{id}/validate-bio
  GET  /care-cases/{id}/patient-config
  POST /care-cases/{id}/messages
  POST /observations
  POST /intelligence/summary-feedback
  GET  /rcps/{id}/export-pdf
  GET  /organizations/mine
  GET  /organizations/{orgId}/members-for-rcp-picker
```

### B. Hooks React Query — liste des keys

```
["care-case", id]
["dashboard", id] / ["dashboard"] (global)
["timeline", id, "clinical"?]
["notes", id]
["notes-authors", id]
["note-analysis", noteId]
["documents", id]
["conditions", id]
["conditions-catalog", id]
["team", id] / ["team-guard", id]
["messages", id]
["referrals", id] / ["referrals"]
["rcps", id]
["rcp", rcpId]
["pathway-graph", id]
["pathway-template-steps", id]
["pathways-all-slim"]
["patient-config", id]
["consultations", "by-care-case", id]
["journal", id]
["obs-trajectory", id]
["observations-bio", id]
["observations-latest", id]
["observations-delta", id]
["observations-history", id]
["bia-sessions", id]
["trajectory", id]
["my-colleagues"]
["provider-search", query]
["organizations", "mine"]
["organizations", orgId, "for-rcp-picker"]
["tasks", id]
["tasks-mine"]
```

### C. Récap dead code à supprimer (Chantier C1)

| Fichier | LOC | Action |
|---|---:|---|
| `views/InviteTeamModal.tsx` | 468 | `git rm` |
| `QuickMessageModal.tsx` | 83 | `git rm` |
| `ClinicalTimeline.tsx` | 217 | `git rm` |
| `ViewConsultation.tsx` | 237 | `git mv` → `/consultations/[id]/` |
| `FlagsBanner` dans `ViewGlobale.tsx` | ~50 | Suppression inline |
| **TOTAL** | **~1 055 LOC** | |

### D. Décisions à prendre par Margot

1. Valider scope C1 (cleanup) — risque zéro, peut être mergé semaine prochaine.
2. Valider scope C2 (URL state) — utile pour Coordination (partage liens entre soignants).
3. Valider scope C3 (split ViewGlobale) — investissement maintenabilité, à séquencer après démos VC imminentes.
4. Trancher : RCP doit-il rester en route nested ou devenir un sous-onglet de Coordination ? (cohérence URL).
5. Trancher : Pédiatrie en 7ᵉ position ou en 1ʳᵉ si caseType === "PEDIATRIC" ? (UX coordinatrice pédiatrique).
6. Trancher : ScheduleQuestionnaireModal questionnaires hardcodés — à externaliser en base ?
7. Confirmer le bug referral-modal ligne 153 (`setClinicalReason(data.letter)` vs `setLetterDraft`).
