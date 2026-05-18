# Spec fonctionnelle — /aujourd-hui (cockpit soignant)

> **Version** : v1.0
> **Source du code** : `src/app/(cockpit)/aujourd-hui/page.tsx` (1314 lignes)
> **Position dans l'IA cockpit** : page d'accueil par défaut du soignant (route racine après login)
> **Date** : 2026-05-18
> **Auteur** : INIT-272 (Phase 0 + spec)
> **Statut** : Document de référence pour le ticket de refacto. Ne pas redesigner sans avoir lu ce document.

---

## Table des matières

### Document principal (ce fichier)

- [§1 — En-tête](#1-en-tête)
- [§2 — Contrat fonctionnel](#2-contrat-fonctionnel)
- [§3 — Sections de la page (vue d'ensemble)](#3-sections-de-la-page-vue-densemble) — détail §3.1 à §3.9 dans l'annexe ↓
- [§4 — État global](#4-état-global)
- [§5 — Keyboard & A11y](#5-keyboard--a11y)
- [§6 — Intégrations externes](#6-intégrations-externes)
- [§7 — Constantes & données statiques](#7-constantes--données-statiques)
- [§9 — Points de fragilité](#9-points-de-fragilité) ← *base pour arbitrer les tickets dérivés*
- [§10 — Prochaines étapes](#10-prochaines-étapes)

### Annexe — référentiel d'exécution

→ [`spec-fonctionnelle-aujourd-hui-sections.md`](./spec-fonctionnelle-aujourd-hui-sections.md)

- §3.1 à §3.9 — Détail exhaustif des 9 sous-sections rendues
- §8 — Checklist post-refacto (~80 items tickables)

**Ordre de lecture recommandé** : ce fichier d'abord (vision, contraintes, fragilité, plan), puis l'annexe pendant l'exécution des Étapes 1 et 2.

---

## 1. EN-TÊTE

`/aujourd-hui` est le **cockpit opérationnel quotidien** du soignant. C'est la première page chargée après authentification, et celle où le soignant revient entre deux consultations. Elle n'a aucune ambition de pilotage longitudinal ni de gestion administrative : son seul rôle est de répondre, en moins de 10 secondes, à la question *« qu'est-ce que je fais maintenant ? »*.

Le fichier source contient **1314 lignes** dont **~1050 lignes effectivement rendues** et **~263 lignes de code mort** (composants définis mais jamais montés dans le JSX — voir §9).

La page consomme **7 endpoints distincts** via TanStack Query, monte **9 sous-sections visibles**, et dispatch **1 événement custom global** (`nami-prep-mode`) écouté par le composant `PrepMode` du layout cockpit.

---

## 2. CONTRAT FONCTIONNEL

### Audience

- **PROVIDER** (soignant exerçant — médecin, diététicien, psychologue, etc.) ou **SECRETARY** (secrétaire médicale rattachée à un cabinet)
- Au démarrage de sa journée clinique, entre deux consultations, ou en attente de l'arrivée d'un patient
- Mobile et tablette possibles mais l'expérience est pensée desktop d'abord (colonnes 2/3 + 1/3)

### Promesse < 10 secondes

> *« Qu'est-ce que je fais maintenant ? »*

Le soignant doit voir, sans scroller, et sans cliquer :

1. Son prochain RDV (avec patient, heure, mode)
2. S'il a des demandes urgentes à traiter (adressages reçus, demandes de patients, demandes de RDV)
3. Les tâches en retard qui pèsent sur son réseau

### Frontières — ce que la page ne fait PAS

- **Pas de planification long terme** → `/agenda` (vue semaine, configuration créneaux, absences)
- **Pas de gestion patient individuelle** → `/patients/[id]` (dossier complet, parcours, observations)
- **Pas d'administration de compte** → `/reglages`
- **Pas de coordination équipe profonde** → `/equipe`, `/messages`
- **Pas de pilotage du réseau / vue patients agrégée** → `/reseau` (anciennement le rôle de `PatientsTable` — voir §9)

### Hiérarchie d'attention (de haut en bas)

1. **Demandes entrantes** (DEMANDES DE COORDINATION, DEMANDES DE PATIENTS) — bloquant, exige une décision (Accepter / Décliner)
2. **Ma journée** — action en cours (RDV du jour, gap-finder, bouton Démarrer)
3. **À faire (tâches)** — action future proche (top 5 tâches cross-dossiers)
4. **Demandes de RDV / Actualités / Messages** — information à consulter mais pas bloquant

Cette hiérarchie est matérialisée par le layout : la colonne gauche (2/3 de largeur) contient les demandes + la journée + les tâches ; la colonne droite (1/3) contient les RDV / actus / messages.

---

## 3. SECTIONS DE LA PAGE (vue d'ensemble)

La page rend **9 sous-sections** dans cet ordre :

| # | Section | Type | Colonne | Conditionnelle ? |
|---|---------|------|---------|------------------|
| 3.1 | Header (titre + KnowledgeSearch + 3 pills) | inline DashboardPage | full width | toujours visible |
| 3.2 | IncomingReferralsSection | composant | gauche | masquée si 0 adressage pending |
| 3.3 | IncomingRequestsSection | composant | gauche | masquée si 0 demande pending |
| 3.4 | MA JOURNÉE | inline DashboardPage | gauche | toujours visible (avec états empty/error) |
| 3.5 | TachesSection | composant | gauche | masquée si 0 tâche pending |
| 3.6 | AppointmentRequestsSection | composant | droite | masquée si 0 demande pending |
| 3.7 | NEWS_ITEMS (ACTUALITÉS) | inline DashboardPage | droite | rendue si NEWS_ITEMS.length > 0 (toujours = 3, static) |
| 3.8 | ProMessagesSection | composant | droite | masquée si 0 conversation avec lastMessage |
| 3.9 | ConsultationDrawer | inline (AnimatePresence) | overlay right | rendu uniquement si selectedId !== null |

> **Détail exhaustif de chaque sous-section** (données, états, actions, mutations, animations, sources de données) :
> → [`spec-fonctionnelle-aujourd-hui-sections.md` §3.1 à §3.9](./spec-fonctionnelle-aujourd-hui-sections.md#3-sections-de-la-page-détail)

---

## 4. ÉTAT GLOBAL

### État local React (DashboardPage)

- `selectedId: string | null` — id du RDV sélectionné pour ouvrir le drawer. Reset à `null` à la fermeture. Persistance : aucune (état React local, perdu au reload).

### État local React (sous-composants)

- `IncomingReferralsSection` :
  - `declRefId: string | null` — id de l'adressage en cours de refus
  - `declRefReason: string` — texte du motif de refus
  - `detailRefId: string | null` — id de l'adressage dont le panel détail est ouvert

### Contextes React consommés

- **`useAuthStore()` (Zustand)** : récupère `{ user, accessToken }`. Utilisé partout pour authentifier les appels API. Persistance gérée par Zustand persist (localStorage).
- **`useConsultation()` (React Context)** : récupère `{ startConsultation }`. Le ConsultationContext gère un état global de consultation en cours (timer, recording, notes brouillon) — vivant côté layout cockpit, persistant entre navigations.

### TanStack Query (cache)

Les query keys utilisées par cette page (tout en cache global, partagé avec les autres pages cockpit) :
- `["dashboard-appointments", personId, from]` — `staleTime: 60_000`, `refetchInterval: 60_000`
- `["tasks-mine"]` — `refetchInterval: 60_000`
- `["network-overview"]` — `staleTime: 60_000`, `refetchInterval: 60_000` (⚠ fetché mais jamais utilisé visuellement — voir §9)
- `["referrals-outgoing-pending"]` — `refetchInterval: 60_000`
- `["referrals-incoming"]` — pas de refetchInterval
- `["referral-detail", id]` — `staleTime: 60_000`
- `["connection-requests-pending"]` — `refetchInterval: 30_000`
- `["appointment-requests-pending"]` — `refetchInterval: 30_000`
- `["pro-conversations-dashboard"]` — `refetchInterval: 30_000`
- `["notifications-recent"]` — `refetchInterval: 60_000` (⚠ consommé uniquement par `ActiviteRecente`, jamais rendue — voir §9)

### État partagé avec d'autres pages

- `accessToken` (auth) : utilisé partout dans cockpit
- `["care-cases"]` invalidé par les mutations d'acceptation (cette page peut donc déclencher une mise à jour de `/patients`, `/agenda`, etc.)
- L'event custom `nami-prep-mode` est consommé par `PrepMode` mounted dans le layout cockpit

### Persistance

| Type | Mécanisme | Survie au reload |
|------|-----------|------------------|
| Auth (accessToken, user) | Zustand persist (localStorage) | ✅ |
| TanStack Query cache | mémoire | ❌ (refetch au mount) |
| selectedId, declRefId, detailRefId | React state local | ❌ |
| ConsultationContext (consultation en cours) | mémoire (côté layout) | ❌ |

Aucun usage de `sessionStorage` dans cette page.

---

## 5. KEYBOARD & A11Y

### Raccourcis clavier

**Aucun raccourci clavier custom n'est implémenté dans cette page** :
- Le drawer ne se ferme **pas** avec Escape (testé visuellement : seuls le clic backdrop ou le bouton X fonctionnent)
- Aucun raccourci pour accepter/décliner une demande au clavier
- Aucun raccourci pour démarrer la prochaine consultation
- Le KnowledgeSearch peut avoir des raccourcis internes (Cmd+K) — externe au scope de cette page

### Attributs ARIA / rôles

- Aucun `aria-label` détecté sur les boutons sans texte (ex : bouton X du drawer, bouton checkbox des tâches)
- Aucun `role` explicite (drawer non marqué `role="dialog"`, backdrop non marqué `role="presentation"`)
- Aucun `aria-live` sur les zones de notification (badges count, toasts via sonner)
- Le `title` HTML est utilisé sur certains boutons :
  - Bouton ⚠ badge tâche : `title={`${alertCount} tâche${alertCount > 1 ? "s" : ""} en retard`}`
  - Bouton « Démarrer la consultation » (drawer) : `title={!careCaseId ? "Aucun dossier de coordination lié à ce RDV" : undefined}`

### Focus management

- Pas d'autofocus sur le KnowledgeSearch
- Pas de focus trap dans le drawer (l'utilisateur peut Tab hors du drawer dans la page derrière)
- Pas de restore focus au close du drawer (le focus retombe par défaut sur le body)
- Pas d'autofocus sur le textarea « motif du refus » (mode décliner d'un adressage)

### Tabindex

- Aucun `tabIndex` custom détecté
- L'ordre naturel du DOM dicte la navigation au Tab

### Niveau d'accessibilité observable

**Partial.** La page est lisible visuellement (contrastes corrects, tailles de police lisibles) mais l'usage clavier-only ou lecteur d'écran est dégradé :
- Drawer non annoncé comme `dialog`
- Boutons icon-only sans `aria-label`
- Pas d'Escape pour fermer le drawer
- Pas de focus trap

### Justification factuelle

Aucun audit a11y n'a été fait sur cette page (constat issu de la lecture statique du code). Un ticket dérivé `a11y` est recommandé.

---

## 6. INTÉGRATIONS EXTERNES

### Toasts (sonner)

Wordings exacts utilisés dans le fichier :
- ✅ `Demande de ${cr.patient.firstName} acceptée — dossier créé` (acceptConnectionRequest)
- ✅ `Demande déclinée` (declineConnectionRequest)
- ✅ `${data.message}` (acceptAppointmentRequest — wording renvoyé par le backend) avec **action** `Voir le dossier` → router.push
- ✅ `Demande de RDV déclinée` (declineAppointmentRequest)
- ❌ `Erreur` (3 occurrences : connectionRequests accept/decline, appointmentRequests decline)
- ❌ `Erreur lors de l'acceptation` (appointmentRequest accept)
- ❌ `Impossible de démarrer` (catch handleStartConsultation, fallback si pas de message d'erreur)
- ❌ `${err.message}` (handleStartConsultation, message d'erreur brut)

**Note** : aucun toast sur les mutations referrals (accept / decline) — feedback silencieux via disparition de l'item.

### Événements custom window

- **`nami-prep-mode`** :
  - **Dispatché par** : bouton « Préparer » dans MA JOURNÉE (ligne 301 de page.tsx)
  - **Detail** : `{ careCaseId: string, patientName: string, time: string }`
  - **Écouté par** : composant `<PrepMode />` (`src/components/ui/PrepMode.tsx`, ligne 75)
  - **Effet** : ouvre l'overlay PrepMode (mode préparation consultation : checklist, dernières observations, suggestions IA)
  - **Mounted où** : layout cockpit (`src/app/(cockpit)/layout.tsx` ligne 119)
  - **Pourquoi un event global et pas du contexte ?** Pour découpler le déclencheur (n'importe quelle page cockpit peut déclencher un prep mode) du consommateur (PrepMode au layout). Un autre déclencheur existe dans `src/app/(cockpit)/agenda/page.tsx`.

### Liens externes

- Aucun mailto / tel / lien externe dans cette page
- Les téléphone/email du patient (drawer) sont affichés en texte brut, **pas en `<a href="tel:...">`** ni `mailto:`

### Autres intégrations

- `framer-motion` : `motion.div`, `AnimatePresence` (drawer, animation d'entrée des items, dot pulsant)
- `lucide-react` : icônes (`Stethoscope`, `ArrowLeftRight`, `Clock`, `ChevronRight`, `X`, `MapPin`, `Video`, `Phone`, `Mail`, `Check`, `Play`, `ClipboardList`, `AlertTriangle`, `BookOpen`, `User`, `Calendar`)
- `date-fns` : pas d'usage direct ici (utilisé dans `useDashboard.ts` en amont)

---

## 7. CONSTANTES & DONNÉES STATIQUES

### NEWS_ITEMS (lignes 25-29)

```ts
const NEWS_ITEMS = [
  { id: "n1", emoji: "🏥", entity: "CHU Necker",        title: "Nouvelle procédure HAD pour TCA",      meta: "Publiée hier · 2 min de lecture", isNew: true  },
  { id: "n2", emoji: "📍", entity: "CPTS Paris 14",     title: "Réunion plénière — 28 avril",          meta: "Inscription ouverte",             isNew: false },
  { id: "n3", emoji: "🔬", entity: "Réseau Obésité IDF", title: "Webinaire chirurgie bariatrique",      meta: "Jeudi 17 avril · 18h00",          isNew: false },
];
```

### PENDING_REFERRAL_STATUSES (ligne 31)

```ts
const PENDING_REFERRAL_STATUSES = ["SENT", "RECEIVED", "UNDER_REVIEW"];
```
Filtre côté client pour les adressages outgoing considérés « en attente ».

### TYPE_PILL (lignes 37-41)

```ts
const TYPE_PILL: Record<string, { bg: string; text: string }> = {
  suivi:       { bg: "bg-indigo-50", text: "text-indigo-600" },
  premiere:    { bg: "bg-violet-50", text: "text-violet-600" },
  teleconsult: { bg: "bg-sky-50",    text: "text-sky-600" },
};
```
Mapping `type` → couleurs de pill pour MA JOURNÉE. Tous les autres types tombent en fallback `suivi`.

### PRIORITY_ORDER (ligne 45)

```ts
const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
```
Ordre de tri des tâches dans `pendingTasks`. Les non-trouvés tombent en 2 (MEDIUM).

### AVATAR_COLORS (lignes 47-52)

```ts
const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
];
```
La fonction `avatarColor(name)` hash le nom → index modulo 5 → couleur déterministe par patient.

### Constantes inline dans IncomingReferralsSection (lignes 866-873)

```ts
const PRI_BADGE: Record<string, string> = {
  ROUTINE: "bg-emerald-50 text-emerald-700",
  URGENT:  "bg-amber-50 text-amber-700",
  EMERGENCY: "bg-red-50 text-red-700",
};
const PRI_LABEL: Record<string, string> = {
  ROUTINE: "Routine",
  URGENT:  "Sous 15j",
  EMERGENCY: "Urgent",
};
```
**Note wording** : `URGENT → "Sous 15j"` et non « Urgent ». C'est `EMERGENCY` qui affiche « Urgent ». À ne pas inverser.

### ACTIVITY_ICON (lignes 1108-1120) — CODE MORT

```ts
const ACTIVITY_ICON: Record<string, string> = {
  TASK_ASSIGNED: "📋", TASK_COMPLETED: "✅", NOTE_CREATED: "📝",
  NOTE_UPDATED: "✏️", OBSERVATION_ADDED: "📊", MESSAGE_RECEIVED: "💬",
  DOCUMENT_UPLOADED: "📄", MEMBER_JOINED: "👋", APPOINTMENT_BOOKED: "📅",
  REFERRAL_RECEIVED: "🔀", PRESCRIPTION_DRAFT: "💊",
};
```
Consommée uniquement par `ActiviteRecente` qui n'est jamais rendue (voir §9).

### CASE_TYPE_LABEL (lignes 1188-1193) — CODE MORT

```ts
const CASE_TYPE_LABEL: Record<string, { label: string; bg: string; text: string }> = {
  TCA:      { label: "TCA",       bg: "bg-violet-50", text: "text-violet-700" },
  OBESITE:  { label: "Obésité",   bg: "bg-amber-50",  text: "text-amber-700" },
  EPILEPSY: { label: "Épilepsie", bg: "bg-blue-50",   text: "text-blue-700" },
  GENERIC:  { label: "Général",   bg: "bg-slate-50",  text: "text-slate-600" },
};
```
Consommée uniquement par `PatientsTable` jamais rendue. **À noter** : le caseType `OBESITE` (vs `OBESITY` côté backend) — incohérence avec le mapping unifié `getCareType()` dans `src/lib/caseType.ts`.

### Fonctions helpers locales

- `avatarColor(name)` : hash → AVATAR_COLORS[i]
- `formatGap(mins)` : `1h30` / `30min`
- `isImminent(c)` : `next` OU `upcoming && minsUntil <= 30`
- `relTime(dateStr)` (ligne 1122) : « à l'instant » / « il y a Xmin » / etc. — **dupliqué** avec `relativeTime` interne à `ProMessagesSection` (lignes 997-1005)

---

## 9. POINTS DE FRAGILITÉ

### 9.1 Code mort (~263 lignes / ~20% du fichier)

| Composant | Lignes | Taille | Statut | Données fetchées |
|-----------|--------|--------|--------|------------------|
| `StatCards` | 1050-1102 | ~52 lignes | défini, jamais rendu | aucune (props uniquement) |
| `ActiviteRecente` | 1132-1182 | ~50 lignes | défini, jamais rendu | `useQuery(["notifications-recent"])` orpheline |
| `PatientsTable` | 1195-1313 | ~118 lignes | défini, jamais rendu | aucune (props uniquement) |
| `ACTIVITY_ICON` | 1108-1120 | 13 lignes | constante orpheline | — |
| `CASE_TYPE_LABEL` | 1188-1193 | 6 lignes | constante orpheline | — |
| `relTime()` | 1122-1130 | 9 lignes | dupliquée avec `relativeTime()` interne à ProMessagesSection | — |
| `useQuery(["network-overview"])` | 113-120 | 7 lignes | fetche `networkApi.overview()` pour rien — `networkData` jamais utilisé | endpoint `/provider/network-overview` |

**Recommandation** : ouvrir un ticket dédié `INIT-CLEANUP-aujourd-hui` qui supprime ces 263 lignes + ces 2 queries inutiles pour ramener le fichier à ~1050 lignes (et déplacer `PatientsTable` vers `/reseau` si la fonctionnalité de vue agrégée patients y est encore pertinente).

### 9.2 Casts `any` détectés

- Ligne 860 : `const pending = (referrals as any[]).filter(...)`
- Ligne 861 : `(r: any) => [...].includes(r.status)`
- Ligne 885 : `{pending.map((ref: any) => ...)}`
- Ligne 908 : `onChange={(e: any) => setDeclRefReason(e.target.value)}`

→ Le type `Referral` existe dans `src/lib/api.ts` (ligne 419), à utiliser à la place.

### 9.3 Délais d'animation qui collisionnent

Plusieurs sections partagent le même `transition.delay` :
- `delay: 0.25` → IncomingReferralsSection + IncomingRequestsSection (les deux dans la colonne gauche)
- `delay: 0.3` → AppointmentRequestsSection + NEWS_ITEMS (les deux dans la colonne droite)

L'animation paraît OK visuellement (parce qu'elles sont dans des positions distinctes du layout), mais c'est un signal d'inattention au stagger.

### 9.4 Refetch interval hétérogène

- 30s : connection-requests, appointment-requests, pro-conversations
- 60s : dashboard-appointments, tasks-mine, network-overview, referrals-outgoing-pending, notifications-recent

Pas de standardisation. Pas dramatique fonctionnellement, mais pas conscient.

### 9.5 Wording legal sensible — à ne pas modifier sans `nami-legal`

- `Le refus discriminatoire est passible de sanctions (art. L.1110-3 CSP)` (ligne 911) — mention légale obligatoire en cas de refus d'adressage par un soignant
- Tout wording mentionnant « dossier de coordination » (ligne 412 du drawer, ligne 575 toast) — **ne jamais remplacer par « dossier médical » ou « dossier patient »** (interdit MDR / DM)

### 9.6 Hard-coded colors (palette dispersée)

Couleurs en dur (hex) dans le fichier au lieu de tokens CSS variables :
- `#5B4EC4`, `#4A3EA6` (primary + hover)
- `#E8ECF4` (border standard)
- `#0F172A`, `#64748B`, `#94A3B8`, `#CBD5E1` (texte gris)
- `#FAFAF8`, `#F8FAFC`, `#F1F5F9` (backgrounds)
- `#5B4EC4`, `#6366F1`, `#8B5CF6` (gradients)
- `#7C3AED`, `#6D28D9`, `#A78BFA` (variants violet pour AppointmentRequests)
- `#FAFBFF`, `#FAF9FF`, `#EEEDFB` (backgrounds très clairs)

À considérer pour passer sur Tailwind tokens / CSS variables dans la refacto. Le design system Medical 2026 du CLAUDE.md mentionne `#5B4EC4 primary` / `#FAFAF8 fond` comme valeurs de référence — cohérent ici, mais sans token central.

### 9.7 Comportements suspects observés

- **NEWS_ITEMS clic sans handler** : les items d'actualités ont `cursor-pointer hover:bg-[#F8FAFC]` mais aucun `onClick`. Le clic ne navigue nulle part → faux affordance. Bug ou feature inachevée.
- **Filtre redondant des referrals incoming** : `api.referrals.incoming({ status: "SENT" })` est appelé avec `status: "SENT"`, puis filtré côté client sur `["SENT", "RECEIVED", "UNDER_REVIEW"]` — au mieux inutile, au pire incohérent si un jour on veut afficher les `UNDER_REVIEW` (le backend ne les retournera pas).
- **`relTime` dupliqué** : la fonction `relTime` au niveau du fichier (ligne 1122) est identique à `relativeTime` définie en interne dans `ProMessagesSection` (ligne 997). La première est consommée uniquement par `ActiviteRecente` (code mort).
- **PatientsTable utilise `CASE_TYPE_LABEL` au lieu de `getCareType()`** : duplication du mapping caseType côté composant orphelin, alors qu'un helper unifié existe dans `src/lib/caseType.ts`. À unifier au moment de la refacto.
- **`useDashboard` ne s'appuie pas sur `nextConsultation`** au sens strict : `nextConsultation` est simplement le premier élément non-past de la liste, **pas** un check temporel sur l'imminence. La fonction `isImminent()` locale fait ce check (≤ 30 min) pour décider d'afficher le bouton Démarrer.
- **Pas de gestion d'erreur sur les mutations Referrals** : `acceptRefMut` et `declineRefMut` n'ont ni `onError` ni toast, contrairement aux ConnectionRequests et AppointmentRequests. Si une mutation échoue, l'utilisateur n'a aucun feedback visuel.

### 9.8 `sessionStorage` / `localStorage` non utilisés dans cette page

Cohérent avec une page « écran de bord » qui n'a pas vocation à mémoriser des états entre sessions. À noter par contraste : d'autres pages cockpit utilisent `sessionStorage` pour conserver des filtres (`/adressages`, `/agenda`).

### 9.9 Pas de `key` collision détectée

Toutes les listes utilisent `key={item.id}` (consultations, tasks, requests, referrals, conversations, news). OK.

---

## 10. PROCHAINES ÉTAPES

### Ticket dérivé n°1 — Cleanup code mort

**Titre** : `INIT-XXX — /aujourd-hui : cleanup 263 lignes de code mort`
**Scope** :
- Supprimer `StatCards`, `ActiviteRecente`, `PatientsTable` (composants jamais rendus)
- Supprimer `ACTIVITY_ICON`, `CASE_TYPE_LABEL`, `relTime` (constantes/helpers orphelins)
- Supprimer la query `["network-overview"]` (fetch inutile, ~60K/min de bande passante backend économisés)
- Supprimer la query `["notifications-recent"]` (consommée uniquement par ActiviteRecente)

**Impact attendu** : fichier source 1314 → ~1050 lignes, retrait de 2 endpoints du polling
**Risque** : 0 — aucun de ces composants n'est rendu nulle part dans le fichier
**Estimation** : 1h (suppression + tests d'intégration cockpit + tsc)

### Ticket dérivé n°2 — Extraction sous-composants

**Titre** : `INIT-XXX — /aujourd-hui : extraction sous-composants en fichiers séparés`
**Scope** :
- Extraire `IncomingReferralsSection`, `IncomingRequestsSection`, `AppointmentRequestsSection`, `ProMessagesSection`, `TachesSection`, `ConsultationDrawer` vers `src/app/(cockpit)/aujourd-hui/_sections/`
- Page.tsx devient un simple compositeur (~150 lignes)

**Impact attendu** : lisibilité, possibilité de tests unitaires par section, lazy-loading possible
**Estimation** : 2-3h

### Ticket dérivé n°3 — /aujourd-hui v2 — UX refonte

**Titre** : `INIT-XXX — /aujourd-hui v2 — refonte UX selon spec`
**Scope** : décisions UX hors scope de cette spec (cette spec décrit le statu quo). Items à arbitrer avec `ux-obviousness` et `nami-information-architecture` :
- Hiérarchie visuelle des demandes entrantes (Referrals vs ConnectionRequests vs AppointmentRequests : 3 sections distinctes ou fusion ?)
- A11y : Escape, focus trap, aria-label
- Wording legal en mode décliner (déplacer vers tooltip ?)
- NEWS_ITEMS : à brancher sur backend ou supprimer si pas de priorité ?
- Standardisation refetchInterval (30s vs 60s)

**Estimation** : à définir après audit UX

### Dépendances

- Tickets 1 et 2 sont **indépendants** entre eux (refacto interne au fichier)
- Ticket 3 dépend de Ticket 2 (refonte plus facile sur fichiers séparés)
- Aucune dépendance backend / DB / migration Prisma

### Risques

- **Tests d'intégration cockpit** à re-vérifier après ticket 1 (notamment les invalidations de query `["care-cases"]` qui peuvent affecter `/patients` et `/agenda`)
- **Régression visuelle** sur le drawer (animations spring) à valider en sandbox avant prod
- **Aucun risque DB / migration** — refacto pure frontend, lecture seule sauf mutations existantes

### Tickets associés (non-bloquants)

- `a11y /aujourd-hui` — drawer non `role="dialog"`, pas de focus trap, pas d'Escape (voir §5)
- `bug NEWS_ITEMS clic` — items cliquables sans handler (voir §9.7)
- `bug toast manquant Referrals` — pas de feedback sur succès/erreur des mutations adressage (voir §9.7)
- `cleanup caseType mapping` — unifier `CASE_TYPE_LABEL` orphelin avec `getCareType()` central (voir §9.7)

---

> **Fin de la spec principale.** Document figé en v1.0 au 2026-05-18.
> Pour le détail exécution (§3.1 à §3.9 + §8 checklist) : voir [`spec-fonctionnelle-aujourd-hui-sections.md`](./spec-fonctionnelle-aujourd-hui-sections.md).
> Toute modification ultérieure (changement comportement page, ajout/retrait de section) doit donner lieu à une révision et un bump de version sur les deux fichiers.
