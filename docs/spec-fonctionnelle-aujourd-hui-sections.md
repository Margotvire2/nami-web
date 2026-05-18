# Spec fonctionnelle — /aujourd-hui — Référentiel sections & checklist

> **Annexe** de [`spec-fonctionnelle-aujourd-hui.md`](./spec-fonctionnelle-aujourd-hui.md).
> Référentiel d'exécution pour les **Étape 1 (refacto / cleanup)** et **Étape 2 (extraction sous-composants)** du ticket de refonte.
> **Lire la spec principale en premier** pour la vision globale, les contraintes transverses et les points de fragilité avant d'attaquer ce document.
>
> Ce fichier décrit :
> - §3.1 à §3.9 — Détail exhaustif des 9 sous-sections rendues (données, états, actions, mutations, animations, sources)
> - §8 — Checklist post-refacto (~80 items tickables, organisée par sous-section)

---

## Table des matières

### §3 — Détail des sous-sections

- [3.1 — Header (Bonjour + KnowledgeSearch + 3 pills)](#31--header-bonjour--knowledgesearch--3-pills-daction-rapide)
- [3.2 — IncomingReferralsSection (DEMANDES DE COORDINATION)](#32--incomingreferralssection-demandes-de-coordination)
- [3.3 — IncomingRequestsSection (DEMANDES DE PATIENTS)](#33--incomingrequestssection-demandes-de-patients)
- [3.4 — MA JOURNÉE (consultations du jour avec gap-finder)](#34--ma-journée-consultations-du-jour-avec-gap-finder)
- [3.5 — TachesSection (À FAIRE — top 5 tâches cross-careCase)](#35--tachessection-à-faire--top-5-tâches-cross-carecase)
- [3.6 — AppointmentRequestsSection (DEMANDES DE RENDEZ-VOUS)](#36--appointmentrequestssection-demandes-de-rendez-vous)
- [3.7 — NEWS_ITEMS (ACTUALITÉS — static, pas de backend)](#37--news_items-actualités--static-pas-de-backend)
- [3.8 — ProMessagesSection (MESSAGES — 3 dernières conversations)](#38--promessagessection-messages--3-dernières-conversations)
- [3.9 — ConsultationDrawer (panneau latéral au clic sur RDV)](#39--consultationdrawer-panneau-latéral-au-clic-sur-rdv)

### §8 — Checklist post-refacto

- [8.1 Header](#81-header)
- [8.2 IncomingReferralsSection](#82-incomingreferralssection)
- [8.3 IncomingRequestsSection](#83-incomingrequestssection)
- [8.4 MA JOURNÉE](#84-ma-journée)
- [8.5 TachesSection](#85-tachessection)
- [8.6 AppointmentRequestsSection](#86-appointmentrequestssection)
- [8.7 ACTUALITÉS](#87-actualités)
- [8.8 ProMessagesSection](#88-promessagessection)
- [8.9 ConsultationDrawer](#89-consultationdrawer)

---

## 3. SECTIONS DE LA PAGE (détail)

> Voir la spec principale §3 pour la vue d'ensemble (table récapitulative des 9 sections, ordre, colonnes, conditions d'affichage).

---

### 3.1 — Header (Bonjour + KnowledgeSearch + 3 pills d'action rapide)

**Pourquoi clinique.** Le header est la première chose vue après chargement. Il combine une accroche personnelle (« Bonjour, Margot ») avec un accès permanent à la base de connaissances (KnowledgeSearch) et trois pills d'action rapide qui agissent comme un *« en un coup d'œil »* synthétique : nombre de consultations du jour, nombre d'adressages en attente, identité du prochain patient.

**Position dans le layout.** En haut, pleine largeur, fond blanc, border-bottom `#E8ECF4`. Hauteur fixe (`shrink-0`), padding `px-6 py-5`. C'est la seule zone non scrollable de la page.

**Données affichées.**
- `user.firstName` (depuis `useAuthStore`) → injecté dans le titre si présent, sinon « Bonjour » sec
- `totalToday: number` (depuis `useDashboard()`) → nombre total de RDV du jour
- `pendingOutgoing.length: number` (depuis `referrals.outgoing()` filtré sur `["SENT", "RECEIVED", "UNDER_REVIEW"]`) → nombre d'adressages partis en attente de réponse
- `nextConsult: DashboardConsultation | undefined` (premier RDV non passé du jour, status === `"next"`) → patient + heure

**États possibles.**
- Loading : pills s'affichent quand même (pendingOutgoing = 0 par défaut tant que la query n'a pas répondu — pill masquée). La pill « X consultation aujourd'hui » s'affiche dès que `useDashboard()` retourne (placeholder `0 consultations aujourd'hui` possible).
- Empty : si aucune consultation → pill « 0 consultations aujourd'hui » (cliquable vers `/agenda`). Si pas d'adressage pending → pill cachée. Si pas de prochain RDV → pill « Prochain » cachée.
- Error : non gérée explicitement au niveau du header (la pill consultation affichera la valeur courante).
- Données présentes : 1 à 3 pills visibles côte à côte.

**Actions utilisateur.**
- Clic sur le titre / KnowledgeSearch : recherche full-text dans la base documentaire (composant externe `<KnowledgeSearch />`, autonome, navigue vers le résultat sélectionné)
- Clic pill « X consultation(s) aujourd'hui » → `Link href="/agenda"`
- Clic pill « X adressage(s) en attente » → `Link href="/adressages"`
- Clic pill « Prochain · {patient} · {time} » → `setSelectedId(nextConsult.id)` → ouvre le ConsultationDrawer

**Mutations déclenchées.** Aucune.

**Navigations déclenchées.**
- `/agenda` (via pill RDV)
- `/adressages` (via pill adressage)
- Pas de navigation pour la pill « Prochain » — ouverture du drawer en local

**Animations / micro-interactions.**
- Bloc complet : `motion.div` avec `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}`
- Hover pills : transition `bg-{color}-50` → `bg-{color}-100`
- Le KnowledgeSearch est responsive : caché en `< sm` (mobile), visible `sm:block` (≥ 640px)

**Sources de données (hooks/APIs).**
- `useAuthStore()` → `{ user, accessToken }`
- `useDashboard()` → `{ totalToday, nextConsultation }` (alias `nextConsult`)
- `useQuery(["referrals-outgoing-pending"])` → `api.referrals.outgoing()` filtré côté client sur `PENDING_REFERRAL_STATUSES = ["SENT", "RECEIVED", "UNDER_REVIEW"]`, `refetchInterval: 60_000`

**Conditions d'affichage.** Header toujours rendu. Pills conditionnelles :
- Pill RDV : toujours (même avec `totalToday === 0`)
- Pill adressage : seulement si `pendingOutgoing.length > 0`
- Pill prochain : seulement si `nextConsult` défini

---

### 3.2 — IncomingReferralsSection (DEMANDES DE COORDINATION)

**Pourquoi clinique.** Quand un confrère adresse un patient à ce soignant (par exemple : médecin traitant adresse un patient à la diététicienne pour suspicion de TCA), il a besoin d'une réponse rapide — *« j'accepte ce patient »* ou *« je ne peux pas »*. Cette section centralise toutes les demandes de coordination reçues, avec leur motif clinique, leur priorité (Routine / Sous 15j / Urgent) et un panel détail dépliable.

**Position dans le layout.** Colonne gauche, premier bloc sous le header. Card blanche `rounded-2xl p-5` border `#E8ECF4`.

**Données affichées.** Pour chaque adressage `Referral` :
- Initiales du sender (`ref.sender.firstName[0]` + `ref.sender.lastName[0]`) dans pastille indigo
- Nom complet du sender + texte « vous adresse » + `ref.careCase.caseTitle`
- `ref.clinicalReason` (en italic, line-clamp-1 par défaut)
- Badge priorité : `ROUTINE` (vert emerald) / `URGENT` → label « Sous 15j » (amber) / `EMERGENCY` → label « Urgent » (red)
- Si panel détail ouvert (via `ReferralDetailPanel`) :
  - Patient (avec âge calculé depuis `birthDate`)
  - RDV souhaité (`r.desiredAppointmentDate`)
  - Note d'urgence (`r.urgencyNote`) dans encart amber si présente
  - Motif clinique complet (whitespace-pre-wrap)
  - Message personnel du sender (encart indigo)
  - Spécialité souhaitée / Zone souhaitée (pills)

**États possibles.**
- Loading : la query retourne un tableau vide tant que pas répondu — section masquée par défaut (return null si `pending.length === 0`).
- Empty : section entière non rendue (`return null`).
- Mode décliner : un seul adressage à la fois peut être en mode décliner (`declRefId`). Textarea + bouton « Confirmer le refus » désactivé tant que `declRefReason.trim()` vide.
- Panel détail : un seul à la fois peut être ouvert (`detailRefId`). Loading interne (`detailLoading`) avec spinner pendant le fetch.

**Actions utilisateur.**
- Bouton « Accepter » → `acceptRefMut.mutate(ref.id)`
- Bouton « Décliner » → `setDeclRefId(ref.id)` → bascule en mode formulaire refus
- Bouton « Voir le dossier » / « Fermer » → toggle `detailRefId` → ouvre/ferme `ReferralDetailPanel`
- En mode décliner :
  - Textarea « Motif du refus (obligatoire) » → `setDeclRefReason`
  - Bouton « Confirmer le refus » → `declineRefMut.mutate({ id, note })` (disabled si motif vide)
  - Bouton « Annuler » → reset `declRefId` et `declRefReason`
- Lien « Tout voir » → `/adressages`

**Mutations déclenchées.**
- `acceptRefMut` : `api.referrals.respond(id, "ACCEPTED")` → `onSuccess` invalide `["referrals-incoming"]`
- `declineRefMut` : `api.referrals.respond(id, "DECLINED", note)` → `onSuccess` invalide `["referrals-incoming"]`
- Aucun toast n'est affiché sur succès — feedback uniquement par disparition de l'item de la liste
- Pas de gestion `onError` explicite (les erreurs réseau ne déclenchent pas de toast)

**Navigations déclenchées.** `/adressages` (lien « Tout voir »).

**Animations / micro-interactions.**
- Bloc parent : `motion.div` avec `delay: 0.25`
- Pas d'animation par item
- Mention légale obligatoire en mode refus : *« Le refus discriminatoire est passible de sanctions (art. L.1110-3 CSP) »* — wording légal en clair, **à ne pas modifier sans validation `nami-legal`**

**Sources de données (hooks/APIs).**
- `useQuery(["referrals-incoming"])` → `api.referrals.incoming({ status: "SENT" })`
- `useQuery(["referral-detail", detailRefId])` → `api.referrals.get(detailRefId!)`, `enabled: !!detailRefId`, `staleTime: 60_000`
- Filtre côté client : `["SENT", "RECEIVED", "UNDER_REVIEW"].includes(r.status)` (note : redondant avec le filtre backend qui ne renvoie que `SENT`)

**Conditions d'affichage.** Section masquée entièrement (`return null`) si `pending.length === 0`.

---

### 3.3 — IncomingRequestsSection (DEMANDES DE PATIENTS)

**Pourquoi clinique.** Un patient peut envoyer une demande de prise en charge directe au soignant via l'application patient (ConnectionRequest). Cette section affiche les demandes en attente et permet d'accepter (création automatique du dossier de coordination) ou de décliner.

**Position dans le layout.** Colonne gauche, sous IncomingReferralsSection. Card blanche `rounded-2xl p-5`.

**Données affichées.** Pour chaque `ConnectionRequest` :
- Pastille gradient `from-[#6366F1] to-[#8B5CF6]` avec initiales `cr.patient.firstName[0]` + `cr.patient.lastName[0]`
- Nom complet patient
- Raison de la demande (`cr.reason || "Demande de suivi"`)
- Temps écoulé : « aujourd'hui » / « hier » / « il y a Xj » (calcul `Math.floor((Date.now() - createdAt) / 86400000)`)
- Compteur total en badge violet `#5B4EC4` à côté du titre

**États possibles.**
- Loading : query retourne `undefined` → `pending = []` → section masquée.
- Empty : `return null` si `pending.length === 0`.
- Présent : 1 à N cartes empilées.

**Actions utilisateur.**
- Bouton « Accepter » → `acceptMut.mutate()`
- Bouton « Décliner » → `declineMut.mutate()`

**Mutations déclenchées.**
- `acceptMut` : `api.connectionRequests.respond(cr.id, { decision: "ACCEPTED" })` → invalide `["connection-requests-pending"]` + `["care-cases"]`. **Toast succès** : `Demande de ${firstName} acceptée — dossier créé`. **Toast error** : `Erreur`.
- `declineMut` : `api.connectionRequests.respond(cr.id, { decision: "DECLINED" })` → invalide `["connection-requests-pending"]`. **Toast succès** : `Demande déclinée`. **Toast error** : `Erreur`.

**Navigations déclenchées.** Aucune (le toast d'acceptation n'a pas d'action de navigation, contrairement à AppointmentRequests).

**Animations / micro-interactions.**
- Bloc parent : `motion.div` avec `delay: 0.25` (collision avec IncomingReferralsSection — même délai)
- Boutons désactivés (`disabled`) pendant `isPending`

**Sources de données (hooks/APIs).**
- `useQuery(["connection-requests-pending"])` → `api.connectionRequests.incoming("PENDING")`, `refetchInterval: 30_000` (plus rapide que la moyenne — 30s au lieu de 60s)

**Conditions d'affichage.** Section masquée entièrement si 0 demande pending.

---

### 3.4 — MA JOURNÉE (consultations du jour avec gap-finder)

**Pourquoi clinique.** C'est le cœur opérationnel de la page. Le soignant doit voir ses RDV du jour dans l'ordre chronologique, identifier visuellement *« où je suis maintenant »* (le RDV `next` avec un dot violet pulsant), repérer les trous libres (gap >= 45min affichés en pointillés) pour caser une urgence, et déclencher l'action principale : *Démarrer la consultation* dès que le RDV devient imminent.

**Position dans le layout.** Colonne gauche, sous les demandes. Card blanche `rounded-2xl p-6` (padding plus large que les autres sections), titre `MA JOURNÉE`.

**Données affichées.** Pour chaque `DashboardConsultation` (issue de `useDashboard()`) :
- `c.time` (format `HH:mm`)
- Dot statut :
  - `past` → cercle gris rempli + check blanc
  - `next` → cercle violet `#5B4EC4` plein, **animé** (pulse `scale: [1, 1.2, 1]` infini, durée 2s)
  - `upcoming` → cercle borduré violet, vide
- Avatar coloré (hash du nom → 5 couleurs : indigo / violet / rose / teal / amber)
- Nom du patient (`c.patient`)
- Badge `caseType` coloré via `getCareType(c.caseType)` (label + bg + color)
- Badge `alertCount` (amber, ⚠) si tâches en retard ou dues aujourd'hui sur ce careCase
- Pill `c.typeLabel` (Suivi / 1ère consultation / Téléconsultation) coloré via `TYPE_PILL`
- Durée (`c.duration` au format `45min` ou `1h30`)
- Mode (`c.mode` : Téléconsultation / Téléphone / Présentiel) avec icône Video/MapPin
- Si `isNext(c)` → label « Maintenant » amber animé (opacity pulse)
- Bouton **Préparer** (toujours visible si careCaseId)
- Bouton **Démarrer** (visible si `imminent(c) && c.careCaseId`)
- ChevronRight (visible au hover sur le bloc)
- Gap-finder : si écart entre fin du RDV précédent et début du RDV courant >= 45 min → ligne de séparation pointillée avec label « Xh libres » / « Xmin libres »

**États possibles.**
- Loading : `isLoading === true` → spinner `border-2 border-[#5B4EC4]` centré, hauteur 40
- Error : `isError === true` → texte rouge « Erreur de chargement — » + lien `Réessayer` (déclenche `refetch()`)
- Empty : 0 consultation → texte gris « Aucune consultation aujourd'hui »
- Présent : liste des consultations dans l'ordre chronologique
- `past` (terminé) : opacité 0.5, durée grisée
- `next` (en cours ou prochain) : fond `bg-indigo-50/50`, dot animé, badge « Maintenant »
- `upcoming` : standard, hover `bg-[#F8FAFC]`
- Sélectionné (clic) : ring `ring-2 ring-[#5B4EC4]`

**Actions utilisateur.**
- Clic sur l'avatar → `router.push("/patients/" + careCaseId)` (si careCaseId présent)
- Clic sur la zone infos patient → `setSelectedId(c.id)` → ouvre ConsultationDrawer
- Clic « Préparer » → `window.dispatchEvent(new CustomEvent("nami-prep-mode", { detail: { careCaseId, patientName, time } }))` → PrepMode (mounted dans le layout cockpit) écoute et s'active
- Clic « Démarrer » → `handleStartConsultation(c)` → `startConsultation({ careCaseId, patientName })` via `useConsultation()`
- Clic ChevronRight → `setSelectedId(c.id)` → ouvre drawer

**Mutations déclenchées.**
- Démarrer consultation : `startConsultation()` (du ConsultationContext, side-effects côté contexte global)
- En cas d'erreur : **Toast error** `err.message || "Impossible de démarrer"`
- Aucune mutation backend depuis cette section (pas d'update direct du RDV ici)

**Navigations déclenchées.**
- `/patients/[careCaseId]` au clic avatar

**Animations / micro-interactions.**
- Bloc parent : `motion.div` avec `delay: 0.1`
- Chaque item : `motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}` avec stagger `0.15 + i * 0.05`, durée 0.2
- Dot `next` : `scale: [1, 1.2, 1]`, `repeat: Infinity`, durée 2s
- Badge « Maintenant » : `opacity: [0.7, 1, 0.7]`, `repeat: Infinity`, durée 2s
- ChevronRight : `opacity-0 group-hover:opacity-100`
- Spinner loading : `animate-spin`

**Sources de données (hooks/APIs).**
- `useDashboard()` (hook custom dans `src/hooks/useDashboard.ts`) :
  - Wrap `useQuery(["dashboard-appointments", personId, from])` sur `appointmentsApi.list(token, { providerId, from, to })`
  - `from` = `startOfDay(today)`, `to` = `endOfDay(today)`
  - `staleTime: 60_000`, `refetchInterval: 60_000`
  - Mapping API → `DashboardConsultation[]` : tri chronologique, dérivation `status` (past si endAt < now, next si premier non-past, upcoming sinon), `type` (premiere / teleconsult / suivi), formatage time et duration via date-fns
- `useQuery(["tasks-mine"])` → `api.tasksMine.list()` (consommé via `taskAlertByCase`)
- Le calcul de `taskAlertByCase` agrège, par careCaseId, les tâches dont `dueDate <= today.endOfDay`

**Conditions d'affichage.** Section toujours visible (même avec 0 RDV → message vide explicite).

---

### 3.5 — TachesSection (À FAIRE — top 5 tâches cross-careCase)

**Pourquoi clinique.** Les tâches qui ne sont pas attachées à la consultation du jour mais qui pèsent sur le soignant : *envoyer un courrier d'adressage*, *appeler le confrère du patient X*, *relancer la diét pour le bilan*. Cette section affiche les 5 tâches les plus urgentes du provider, tous careCases confondus, avec priorité sur celles en retard.

**Position dans le layout.** Colonne gauche, sous MA JOURNÉE. Card blanche `rounded-2xl p-6`.

**Données affichées.** Pour chaque `TaskWithContext` (limite : 5 premières du tri) :
- Checkbox carrée 4×4 (`rounded border-2`) — vide par défaut, check emerald si `isCompleting`
- Titre de la tâche (`t.title`) tronqué
- Sous-ligne : nom complet du patient (`t.careCase.patient.firstName lastName`) en violet cliquable
- Date :
  - Si dueDate < today.startOfDay → « En retard (Xj) » en rouge `text-red-500 font-semibold`
  - Si dueDate <= today.endOfDay → « Aujourd'hui » en amber `text-amber-600 font-medium`
  - Sinon → date formatée `dd MMM` (ex: `28 avr`) en gris `text-[#94A3B8]`

**États possibles.**
- Empty (0 tâche pending) : `return null` → section masquée entièrement
- isCompleting (mutation en cours sur une tâche) : checkbox emerald + check visible + bouton disabled

**Actions utilisateur.**
- Clic checkbox → `completeMut.mutate(t)` → marque la tâche `COMPLETED`
- Clic sur le nom patient → `router.push("/patients/" + careCase.id)`
- Clic « Tout voir → » → `Link href="/taches"`

**Mutations déclenchées.**
- `completeMut` : `api.tasks.update(careCaseId, taskId, { status: "COMPLETED" })` → `onSuccess` invalide `["tasks-mine"]`
- Aucun toast n'est affiché (succès silencieux, feedback uniquement par disparition de l'item)

**Navigations déclenchées.**
- `/patients/[careCaseId]` (clic patient)
- `/taches` (lien « Tout voir »)

**Animations / micro-interactions.**
- Bloc parent : `motion.div` avec `delay: 0.18`
- Pas d'animation par item
- Hover item : `hover:bg-[#F8FAFC]`
- Checkbox hover : `hover:border-[#5B4EC4]`

**Sources de données (hooks/APIs).**
- Pas de query interne — reçoit `tasks: TaskWithContext[]` en prop, déjà filtré et trié dans `DashboardPage` :
  ```ts
  pendingTasks = allTasks
    .filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED")
    .sort((a, b) => {
      // overdue first, then by PRIORITY_ORDER (URGENT < HIGH < MEDIUM < LOW)
    })
  ```
- Le `useQuery(["tasks-mine"])` est défini dans `DashboardPage` avec `refetchInterval: 60_000`

**Conditions d'affichage.** Masquée si `tasks.length === 0`.

---

### 3.6 — AppointmentRequestsSection (DEMANDES DE RENDEZ-VOUS)

**Pourquoi clinique.** À distinguer des DEMANDES DE PATIENTS (3.3) : ici, un patient (existant ou nouveau) demande un créneau de RDV précis (`requestedDate`) avec un motif. Le soignant accepte ou décline. L'acceptation crée le RDV dans l'agenda + le dossier de coordination si nécessaire.

**Position dans le layout.** Colonne droite, premier bloc. Card blanche `rounded-2xl p-5`.

**Données affichées.** Pour chaque `AppointmentRequest` :
- Pastille gradient `from-[#7C3AED] to-[#A78BFA]` (violet — distinct du indigo des connection requests) avec initiales
- Nom complet `ar.patientFirstName ar.patientLastName`
- Motif (`ar.motif || "Demande de RDV"`)
- Date demandée formatée (ex: `lun. 28 avr. 14:30`) si `ar.requestedDate` présent
- Temps écoulé : « aujourd'hui » / « hier » / « il y a Xj »
- Compteur total en badge `bg-[#7C3AED]` à côté du titre

**États possibles.**
- Empty : section masquée (`return null`)
- isPending sur acceptMut : bouton « Accepter » devient « … »

**Actions utilisateur.**
- Bouton « Accepter » → `acceptMut.mutate()`
- Bouton « Décliner » → `declineMut.mutate()`

**Mutations déclenchées.**
- `acceptMut` : `api.appointmentRequests.accept(ar.id)` → invalide `["appointment-requests-pending"]` + `["care-cases"]`. **Toast succès** avec **action contextuelle** : label « Voir le dossier », `onClick` → `router.push("/patients/" + careCaseId)`. Le message du toast vient du backend (`data.message`).
- `declineMut` : `api.appointmentRequests.decline(ar.id)` → invalide `["appointment-requests-pending"]`. **Toast succès** : `Demande de RDV déclinée`. **Toast error** : `Erreur`.

**Navigations déclenchées.**
- `/patients/[careCaseId]` (via l'action du toast d'acceptation)

**Animations / micro-interactions.**
- Bloc parent : `motion.div` avec `delay: 0.3`
- Boutons désactivés pendant `isPending`

**Sources de données (hooks/APIs).**
- `useQuery(["appointment-requests-pending"])` → `api.appointmentRequests.list("PENDING")`, `refetchInterval: 30_000`

**Conditions d'affichage.** Masquée si 0 demande pending.

---

### 3.7 — NEWS_ITEMS (ACTUALITÉS — static, pas de backend)

**Pourquoi clinique.** Donner au soignant un fil d'actualités professionnel (CHU, CPTS, réseau régional) pour qu'il sente le rythme de son écosystème. **Aucune donnée backend** : la liste est codée en dur dans le fichier (3 items). Ce sera remplacé par un vrai fil (à brancher) dans une itération future.

**Position dans le layout.** Colonne droite, sous AppointmentRequestsSection. Card blanche `rounded-2xl p-5`.

**Données affichées.** Les 3 items statiques de `NEWS_ITEMS` :
1. 🏥 **CHU Necker** — *Nouvelle procédure HAD pour TCA* — Publiée hier · 2 min de lecture — `isNew: true`
2. 📍 **CPTS Paris 14** — *Réunion plénière — 28 avril* — Inscription ouverte — `isNew: false`
3. 🔬 **Réseau Obésité IDF** — *Webinaire chirurgie bariatrique* — Jeudi 17 avril · 18h00 — `isNew: false`

Pour chaque item :
- Emoji
- Entité (sous-titre gris)
- Titre principal
- Méta (date / durée / contexte)
- Badge « Nouveau » indigo si `isNew`
- ChevronRight (au hover)

**États possibles.** Aucun — données statiques.

**Actions utilisateur.**
- Clic sur un item : **aucun handler** — la card est `cursor-pointer hover:bg-[#F8FAFC]` mais le clic ne navigue nulle part (bug / TODO ?)
- Clic « Tout voir → » → `/reseau`

**Mutations déclenchées.** Aucune.

**Navigations déclenchées.** `/reseau` uniquement (lien « Tout voir »).

**Animations / micro-interactions.**
- Bloc parent : `motion.div` avec `delay: 0.3` (collision avec AppointmentRequestsSection)
- Hover item : `hover:bg-[#F8FAFC]`
- ChevronRight : `opacity-0 group-hover:opacity-100`

**Sources de données.** Constante statique `NEWS_ITEMS` au top du fichier.

**Conditions d'affichage.** Rendue si `NEWS_ITEMS.length > 0` (toujours vrai en l'état).

---

### 3.8 — ProMessagesSection (MESSAGES — 3 dernières conversations)

**Pourquoi clinique.** Le soignant échange en messagerie sécurisée avec ses confrères (ProMessages). Cette section donne un aperçu des 3 conversations les plus récentes pour qu'il puisse y revenir d'un clic sans aller dans `/messages`.

**Position dans le layout.** Colonne droite, dernier bloc. Card blanche `rounded-2xl p-5`.

**Données affichées.** Top 3 conversations (filtre `lastMessage` défini, tri `updatedAt` desc) :
- Avatar (gradient indigo → violet) avec initiales calculées via `convInitials(conv)` :
  - DIRECT → autres membres → 2 premières initiales prénom+nom
  - GROUP → 2 premières lettres du nom
- Nom de la conversation (`convName(conv)`) : `conv.name` si présent, sinon le membre autre que l'utilisateur courant, sinon « Groupe »
- Temps relatif : « à l'instant » / « il y a Xmin » / « il y a Xh » / « hier » / « il y a Xj »
- Contenu du dernier message (`conv.lastMessage.content`) tronqué
- Badge `Xnon lu(s)` violet si `unreadCount > 0`
- Badge total non lus à côté du titre `MESSAGES` (somme de tous les `unreadCount` de toutes les conversations, pas seulement les 3 affichées)

**États possibles.**
- Empty (0 conversation avec lastMessage) : `return null`
- Présent : 1 à 3 cartes

**Actions utilisateur.**
- Clic sur une conversation → `Link href="/messages"` (pas de routing vers la conversation précise — toujours la page index `/messages`)
- Clic « Tout voir → » → `/messages`

**Mutations déclenchées.** Aucune.

**Navigations déclenchées.** `/messages` uniquement.

**Animations / micro-interactions.**
- Bloc parent : `motion.div` avec `delay: 0.35`
- Hover item : `hover:bg-[#F8FAFC]`
- ChevronRight au hover

**Sources de données (hooks/APIs).**
- `useQuery(["pro-conversations-dashboard"])` → `api.proMessages.getConversations()`, `refetchInterval: 30_000`

**Conditions d'affichage.** Masquée si aucune conversation a de `lastMessage`.

---

### 3.9 — ConsultationDrawer (panneau latéral au clic sur RDV)

**Pourquoi clinique.** Quand le soignant clique sur un RDV dans MA JOURNÉE, un panneau latéral coulisse depuis la droite pour afficher les infos patient et lui permettre de démarrer la consultation ou d'ouvrir le dossier complet.

**Position dans le layout.** Overlay fixe : backdrop `fixed inset-0 bg-black/20 z-40` + panneau `fixed right-0 top-0 h-full w-96 z-50`. **Pas dans le flow** de la page.

**Données affichées.** Pour `selected: DashboardConsultation` :
- Avatar coloré 12×12 (rounded-2xl)
- Nom du patient
- Âge + date de naissance (`selected.detail.age` ans · `selected.detail.dob`)
- Téléphone (`selected.detail.phone`)
- Email (`selected.detail.email`)
- Bloc « Consultation du jour » : heure + durée, mode (Téléconsultation / Présentiel), typeLabel

**États possibles.**
- Fermé (`selectedId === null`) : drawer non monté (AnimatePresence)
- Ouvert : drawer visible avec backdrop
- careCaseId absent : bouton « Démarrer la consultation » disabled (fond gris `#94A3B8`), tooltip « Aucun dossier de coordination lié à ce RDV »

**Actions utilisateur.**
- Clic backdrop → `setSelectedId(null)` (ferme le drawer)
- Bouton X (top right) → `setSelectedId(null)`
- Bouton « Démarrer la consultation » :
  - Si `careCaseId` → `handleStartConsultation(selected)` → `startConsultation()` du ConsultationContext
  - Si pas de `careCaseId` → bouton désactivé
- Bouton « Voir le dossier » (si careCaseId) → `setSelectedId(null) + router.push("/patients/" + careCaseId)`
- Bouton « Voir les patients » (si pas de careCaseId) → `setSelectedId(null) + router.push("/patients")`

**Mutations déclenchées.**
- `startConsultation()` (side-effects côté ConsultationContext)
- Toast error si échec : `err.message || "Impossible de démarrer"`

**Navigations déclenchées.**
- `/patients/[careCaseId]` ou `/patients`

**Animations / micro-interactions.**
- AnimatePresence pour mount/unmount
- Backdrop : `opacity 0 → 1`
- Panneau : slide-in depuis la droite (`x: "100%" → 0`), spring `damping: 30 stiffness: 300`
- Aucun focus trap (voir spec principale §5)
- Aucun raccourci clavier Escape natif (voir spec principale §5)

**Sources de données.** `selected` est dérivé localement : `consultations.find((c) => c.id === selectedId)`. Pas de fetch dédié — toutes les infos viennent de `useDashboard()`.

**Conditions d'affichage.** Rendu uniquement si `selected !== null`. Pas de scroll body lock (la page derrière reste scrollable).

---

## 8. CHECKLIST POST-REFACTO

> Items vérifiables visuellement ou par interaction. Voix active, présent indicatif. Pas de « doit / devrait ».

### 8.1 Header

- [ ] Le titre affiche `Bonjour, {prénom}` si user connecté, sinon `Bonjour`
- [ ] Le composant KnowledgeSearch est rendu en `sm:` et au-delà (caché en mobile)
- [ ] La pill RDV affiche le nombre total (`X consultation(s) aujourd'hui`) avec pluriel correct
- [ ] La pill RDV navigue vers `/agenda` au clic
- [ ] La pill adressage est masquée si 0 adressage outgoing en attente
- [ ] La pill adressage navigue vers `/adressages` au clic
- [ ] La pill « Prochain » est masquée s'il n'y a pas de RDV `next`
- [ ] La pill « Prochain » ouvre le drawer (pas une navigation)

### 8.2 IncomingReferralsSection

- [ ] La section est totalement absente du DOM si 0 adressage pending
- [ ] Chaque item affiche les initiales du sender dans la pastille indigo
- [ ] Le badge priorité affiche `Routine` / `Sous 15j` / `Urgent` selon `ROUTINE` / `URGENT` / `EMERGENCY`
- [ ] Le bouton Accepter déclenche `referrals.respond(id, "ACCEPTED")`
- [ ] Le bouton Décliner ouvre le formulaire textarea
- [ ] Le bouton « Confirmer le refus » est désactivé tant que motif vide (trim)
- [ ] La mention `art. L.1110-3 CSP` est affichée en mode décliner
- [ ] Le bouton « Voir le dossier » charge le panel détail (avec spinner)
- [ ] Le panel détail affiche patient + RDV souhaité + urgency + motif + message + zone/spécialité

### 8.3 IncomingRequestsSection

- [ ] La section est masquée si 0 demande pending
- [ ] Le compteur en badge violet affiche `pending.length`
- [ ] Le toast d'acceptation affiche `Demande de {prénom} acceptée — dossier créé`
- [ ] Le toast de refus affiche `Demande déclinée`
- [ ] Les boutons sont désactivés pendant la mutation (`isPending`)
- [ ] Le temps affiché est « aujourd'hui » / « hier » / « il y a Xj »

### 8.4 MA JOURNÉE

- [ ] Affiche un spinner pendant `isLoading`
- [ ] Affiche `Erreur de chargement — Réessayer` si `isError`, et `Réessayer` déclenche `refetch()`
- [ ] Affiche `Aucune consultation aujourd'hui` si liste vide
- [ ] Chaque RDV affiche heure, dot statut, avatar coloré, nom, badge caseType, pill type, durée, mode
- [ ] Le RDV `past` est à 0.5 opacity avec dot gris + check
- [ ] Le RDV `next` a un dot violet pulsant (animation 2s infinie) et fond `bg-indigo-50/50`
- [ ] Le RDV `next` a un badge `Maintenant` qui pulse en amber (caché en `< sm`)
- [ ] Le badge ⚠ apparaît si tâches du careCase en retard ou dues aujourd'hui
- [ ] Le gap-finder affiche une ligne pointillée `Xh libres` ou `Xmin libres` si gap >= 45 min
- [ ] Le bouton Préparer dispatch `nami-prep-mode` avec `{careCaseId, patientName, time}`
- [ ] Le bouton Démarrer apparaît si `isImminent(c) && careCaseId`
- [ ] Le bouton Démarrer appelle `startConsultation()` (ConsultationContext)
- [ ] Le clic sur l'avatar navigue vers `/patients/{careCaseId}`
- [ ] Le clic sur la zone infos patient ouvre le drawer (`setSelectedId`)
- [ ] La ChevronRight n'est visible qu'au hover

### 8.5 TachesSection

- [ ] La section est masquée si 0 tâche
- [ ] La liste affiche au maximum 5 tâches
- [ ] Le tri place les overdue en premier, puis trie par PRIORITY_ORDER
- [ ] La checkbox déclenche `tasks.update(careCaseId, taskId, {status: "COMPLETED"})`
- [ ] La checkbox affiche l'animation emerald pendant la mutation
- [ ] Le clic sur le nom patient navigue vers `/patients/{careCaseId}`
- [ ] La date affiche `En retard (Xj)` en rouge si overdue
- [ ] La date affiche `Aujourd'hui` en amber si due aujourd'hui
- [ ] La date affiche `dd MMM` en gris sinon
- [ ] Le lien `Tout voir →` navigue vers `/taches`

### 8.6 AppointmentRequestsSection

- [ ] La section est masquée si 0 demande pending
- [ ] Le compteur en badge `#7C3AED` affiche `pending.length`
- [ ] La pastille utilise le gradient violet `from-[#7C3AED] to-[#A78BFA]`
- [ ] La date demandée s'affiche au format `lun. 28 avr. 14:30` si présente
- [ ] Le toast d'acceptation propose une action `Voir le dossier` qui navigue vers `/patients/{careCaseId}`
- [ ] Le toast de refus affiche `Demande de RDV déclinée`
- [ ] Le bouton Accepter affiche `…` pendant `isPending`

### 8.7 ACTUALITÉS

- [ ] La section affiche les 3 items statiques de `NEWS_ITEMS`
- [ ] Le badge `Nouveau` apparaît uniquement sur l'item `isNew: true`
- [ ] Le lien `Tout voir →` navigue vers `/reseau`
- [ ] **Le clic sur un item ne navigue nulle part** (comportement actuel — voir spec principale §9)

### 8.8 ProMessagesSection

- [ ] La section est masquée s'il n'y a aucune conversation avec lastMessage
- [ ] Le tri affiche les 3 conversations les plus récentes (`updatedAt` desc)
- [ ] Le badge total `unreadTotal` est calculé sur **toutes** les conversations (pas seulement les 3 affichées)
- [ ] Pour une DIRECT, le nom affiché est celui de l'autre membre
- [ ] Pour un GROUP, le nom utilisé est `conv.name` ou « Groupe »
- [ ] Le clic sur une conversation navigue vers `/messages` (pas vers la conversation précise)
- [ ] Le temps relatif affiche `à l'instant` / `il y a Xmin` / `il y a Xh` / `hier` / `il y a Xj`

### 8.9 ConsultationDrawer

- [ ] Le drawer est monté uniquement si `selectedId !== null`
- [ ] Le backdrop ferme le drawer au clic
- [ ] Le bouton X ferme le drawer
- [ ] L'avatar utilise la même couleur que dans MA JOURNÉE (hash déterministe)
- [ ] Le bloc affiche âge + DOB + phone + email
- [ ] Le bouton `Démarrer la consultation` est désactivé sans careCaseId avec tooltip
- [ ] Le bouton `Démarrer la consultation` appelle `startConsultation()`
- [ ] Le bouton `Voir le dossier` apparaît si careCaseId, sinon `Voir les patients`
- [ ] La navigation reset `selectedId` à `null`
- [ ] L'animation : backdrop fade, panel slide-in spring (damping 30, stiffness 300)

---

> **Fin du référentiel.** Document figé en v1.0 au 2026-05-18.
> Pour la vision globale, les contraintes transverses et les **points de fragilité** (§9 — base pour les tickets dérivés) : voir [`spec-fonctionnelle-aujourd-hui.md`](./spec-fonctionnelle-aujourd-hui.md).
