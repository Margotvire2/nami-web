# PHASE 0 — Diagnostic INIT-61 / BUG #062 — Refonte panneau notifications

> Lecture seule. Aucun fichier de code modifié.
> Branche : `main` HEAD `6f7adc9c`.

---

## 1. Les 2 cloches actuelles (P0.1)

### Cloche A — `NotificationCenter` (sidebar)

- **Fichier** : `/Users/margotvire/nami-web/src/components/NotificationCenter.tsx` (~210 lignes)
- **Rendu dans** : `src/components/sidebar.tsx` ligne **73** (entête sidebar, à côté du logo "Nami")
- **Bibliothèque** : `useQuery` (TanStack Query), polling 60s, `staleTime` 30s
- **Source** : `notificationsApi.list(accessToken)` → `GET /notifications` ([api.ts:1354-1362](src/lib/api.ts#L1354))
- **Activités lues** : NOTE_ADDED, DOCUMENT_UPLOADED, TASK_COMPLETED, REFERRAL_CREATED/ACCEPTED/DECLINED, ALERT_TRIGGERED, TEAM_MEMBER_ADDED, CARE_CASE_CREATED
- **Vocation** : majoritairement **ACTIVITÉ RÉCENTE** (déjà arrivé)
- **Unread** : localStorage `nami_notif_seen_at`

Extrait (lignes 1-20) :
```tsx
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { notificationsApi, type NotificationItem } from "@/lib/api";
import { Bell, FileText, Upload, CheckSquare, ArrowLeftRight,
         AlertTriangle, UserPlus, FolderOpen, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
const LS_KEY = "nami_notif_seen_at";
const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  NOTE_ADDED:        { icon: FileText, label: "Note ajoutée", color: "#5B4EC4" },
  DOCUMENT_UPLOADED: { icon: Upload, label: "Document ajouté", color: "#2563EB" },
  ...
};
```

### Cloche B — `ActivityFeedBell` + panneau `ActivityFeed` (header cockpit)

- **Fichier** : `/Users/margotvire/nami-web/src/components/ui/ActivityFeed.tsx` (exporte **deux** symboles : `ActivityFeedBell` et `ActivityFeed`)
- **`ActivityFeedBell`** rendu dans : `src/components/CockpitHeader.tsx` ligne **8** (import) — bouton dans la barre du haut
- **`ActivityFeed`** (panneau) rendu dans : `src/app/(cockpit)/layout.tsx` ligne **120** (mount global du panneau)
- **Communication** : custom event `window.dispatchEvent(new Event('nami-feed-toggle'))` (la cloche dans le header émet, le panneau dans le layout écoute)
- **Bibliothèque** : `useQuery` (TanStack Query)
- **Sources** : 3 queries séparées
  - `api.tasksMine.list()` (TaskWithContext)
  - `api.referrals.incoming()` (Referral)
  - `api.cases.*` (CareCase)
- **Vocation** : majoritairement **À FAIRE** (tâches en attente, adressages reçus, dossiers actifs)
- **Type item interne** : `"task" | "referral_in" | "patient"`

Extrait (lignes 1-22) :
```tsx
"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { apiWithToken, type TaskWithContext, type Referral } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { format, isToday, isYesterday, parseISO, differenceInHours } from "date-fns"
import { fr } from "date-fns/locale"
import { X, CheckSquare, Bell } from "lucide-react"

type FeedItem = {
  id: string
  type: "task" | "referral_in" | "patient"
  emoji: string
  ...
}
```

### Observation transversale

Une **séparation embryonnaire des rôles existe déjà** :
- Cloche A (sidebar) ≈ ACTIVITÉ RÉCENTE
- Cloche B (header) ≈ À FAIRE

Le ticket consiste à **fusionner les 2 cloches en une**, avec ces 2 sections explicitement présentées. La cloche A (sidebar) reste l'emplacement le plus cohérent (cf. recommandation P0.7 #1).

### Autres "Bell" en repo, non concernés par le ticket

- `src/components/ui/ActivityFeed.tsx:10` — icône Bell de l'empty state du panneau lui-même (à conserver)
- `src/components/nami/messaging/index.tsx` — Bell pour la messagerie patient (hors scope)
- `src/app/(cockpit)/reseau/page.tsx` — Bell décorative dans la page Réseau (hors scope)
- `src/app/(cockpit)/patients/[id]/page-v1-backup.tsx` — Bell dans un fichier de backup inactif (déjà documenté lors du précédent audit sécurité)
- `src/app/demo-hap/DemoWalkthroughHAPClient.tsx` — Bell d'une démo HAP (hors scope)
- `src/app/_archived/alertes-archived-mdr-20260501/page.tsx` — page archivée pour conformité MDR (hors scope)

---

## 2. Routes backend existantes (P0.2)

### Routes actuelles

| Mount | Path | Source |
|---|---|---|
| `app.ts:308` | `GET /notifications` (✅ existant) | `src/routes/notifications.ts:33` |
| `app.ts:228` | `GET /appointment-requests` | `src/routes/appointmentRequests.ts` |
| `app.ts:239` | `GET /care-cases/:id/activities` | `src/routes/activities.ts:10` |
| `app.ts:242` | `GET /care-cases/:id/tasks` | `src/routes/tasks.ts:49` |
| `app.ts:243` | `GET /care-cases/:id/alerts` | `src/routes/alerts.ts:110` |
| `app.ts:244` | `GET /me/alerts` (global) | `src/routes/alerts.ts` (globalAlertsRouter) |
| `app.ts:253` | `GET /referrals/*` | `src/routes/referrals.ts` |
| `app.ts:258` | `/pro-messages` | `src/routes/proMessages.ts` |
| `app.ts:271` | `/tasks` (tasksMine) | `src/routes/tasksMine.ts` |

### Détail `GET /notifications` existant

[src/routes/notifications.ts:33](src/routes/notifications.ts#L33) :
- Auth : `requireAuth + requireValidated`
- Query params : `limit` (def 30, max 50), `since` (ISO date)
- Lit la table `Activity` filtrée :
  - `personId: { not: personId }` (exclut les actions du user lui-même)
  - filtrée par les `careCase` où le user est membre
  - types ∈ `NOTIFIABLE_TYPES` (les 9 types listés cloche A)
- Retourne `{ items: NotificationItem[]; total: number }`

### Verdict P0.2

> **ÉTENDRE** la route existante `GET /notifications`. **NE PAS CRÉER** `/api/cockpit/notifications/feed` :
> 1. Le préfixe `/api/cockpit/` proposé par le brief **n'est utilisé nulle part ailleurs dans Nami** (aucune autre route ne commence par `/api/cockpit/`). Introduire ce préfixe = incohérence d'architecture.
> 2. Le path canonique Nami pour les notifications est déjà `/notifications` (monté en app.ts:308).
> 3. La route actuelle couvre déjà la moitié du besoin (ACTIVITÉ RÉCENTE via table `Activity`).
>
> **Recommandation** : créer `GET /notifications/feed` (ou enrichir `GET /notifications` avec un paramètre `?shape=feed`). Le path `/notifications` reste en place pour rétro-compat le temps du Sprint 3 cleanup.
>
> Anti-collision : `rg "/notifications" src/app.ts` confirme qu'aucune autre route n'occupe `/notifications/feed`.

---

## 3. Hooks frontend (P0.3)

```
src/hooks/
├── useAppointments.ts
├── useCareSocket.ts
├── useDashboard.ts
├── useMessages.ts
├── usePatientDashboard.ts
├── useReferrals.ts
├── useScrollReveal.ts
└── useTimeline.ts
```

**Aucun** hook nommé `useNotification*` / `useActivity*` / `useAlert*` / `useFeed*` n'existe. Les requêtes notifications sont **inline** dans les 2 composants cloches via `useQuery`.

### Verdict P0.3

> **CRÉER** `src/hooks/useNotificationFeed.ts`. Aucune consolidation préalable nécessaire — il n'y a rien à fusionner. Les `useQuery` inline des 2 cloches actuelles seront supprimés en Sprint 3 lors de la suppression des composants legacy.
>
> Pattern à respecter : TanStack Query v5 + Zustand (stack Nami, cf. CLAUDE.md ligne 87-95) — **pas SWR**.

---

## 4. Statut V1/V2 fiche patient (P0.4)

| Fichier | Statut |
|---|---|
| `src/app/(cockpit)/patients/[id]/page.tsx` | **V2 actif** (production) |
| `src/app/(cockpit)/patients/[id]/page-v1-backup.tsx` | **V1 backup inactif** (déjà identifié lors du précédent audit sécurité A1) |

Les 2 cloches du cockpit (`NotificationCenter` sidebar + `ActivityFeedBell` header) sont **toutes deux au niveau layout/sidebar englobant**, pas dans la fiche patient. **Aucun lien direct avec la consolidation V1/V2 fiche patient (INIT séparée).**

### Verdict P0.4

> Ce ticket peut avancer **indépendamment** du chantier V1/V2 fiche patient. Aucune dépendance bloquante.

---

## 5. Autres consommateurs des 8 sources backend (P0.5)

| Modèle Prisma | Endroits principaux | Risque régression nouvelle route |
|---|---|---|
| `Activity` | `src/routes/activities.ts` (CRUD par dossier), `src/routes/notifications.ts` (déjà agrégateur), `src/services/care-team.service.ts` (création), `src/routes/alerts.ts` (création) | **Faible** — la nouvelle route lit, ne modifie pas |
| `Task` | `src/services/dashboard.service.ts` (lecture KPIs), `src/services/action-executor.service.ts` (création), `src/routes/tasks.ts` + `src/routes/tasksMine.ts` (CRUD) | **Faible** |
| `Alert` | `src/services/alertEngine.ts` (création/lecture jobs), `src/routes/alerts.ts` (CRUD), `src/jobs/alertEngine.ts` (cron) | **Faible** |
| `AppointmentRequest` | `src/routes/appointmentRequests.ts` uniquement (CRUD complet) | **Faible** — surface concentrée |
| `Referral` | `src/services/careCasePdfService.ts` (export PDF), `src/jobs/alertEngine.ts` (cron staleReferrals), `src/services/action-executor.service.ts` (création), `src/routes/referrals.ts` (CRUD) | **Faible** |
| `CareCaseMember` | `src/services/context-engine.service.ts`, `src/services/socketService.ts`, `src/services/pediatric-access.service.ts`, `src/services/care-team.service.ts` | **Faible** |
| `ProMessage` | `src/routes/proMessages.ts` uniquement | **Faible** |
| `CoordinationAnomaly` | `src/services/context-engine.service.ts`, `src/services/conformance-engine.service.ts`, `src/services/cad.service.ts` (création + count) | **Faible** |

### Verdict P0.5

> La nouvelle route agrégée est **read-only sur 8 modèles**. Aucun write, aucune modification du schéma Prisma. **Risque de régression sur agenda / dossier patient / coordination : très faible** (les écrans existants gardent leurs routes propres ; la route agrégée n'est qu'un consommateur additionnel).

---

## 6. Chaîne de JOIN Person-centric (P0.6)

[prisma/schema.prisma:144-146](prisma/schema.prisma#L144) :
```prisma
model ProviderProfile {
  id        String @id @default(cuid())
  personId  String @unique
  ...
}
```

**Invariant** : `ProviderProfile.id ≠ Person.id`. La relation est portée par `personId`.

**Pattern canonique déjà appliqué dans `/notifications`** ([notifications.ts:48-52](src/routes/notifications.ts#L48)) :
```ts
const personId = req.user!.personId;
const provider = await prisma.providerProfile.findUnique({
  where: { personId },
  select: { id: true },
});
if (!provider) return res.json({ items: [], total: 0 });
// puis utiliser provider.id pour filtrer Task, Referral, etc.
```

### Chaîne JOIN par source

| Source | Chaîne | Champ filtré |
|---|---|---|
| `Activity` | `Activity → CareCase → CareCaseMember.personId = req.user.personId` (ACCEPTED) | `personId` |
| `Task` | `Task → assigneeId = ProviderProfile.id` (via lookup personId → providerId) | `providerId` |
| `Alert` | `Alert → CareCase → CareCaseMember.personId = req.user.personId` | `personId` |
| `AppointmentRequest` | `AppointmentRequest → providerId = ProviderProfile.id` | `providerId` |
| `Referral` (received) | `Referral → recipientPersonId = req.user.personId` OU `recipientProviderId = ProviderProfile.id` (selon schema, à confirmer Sprint 1) | mix |
| `CareCaseMember` (invitations PENDING) | `CareCaseMember.personId = req.user.personId AND status = PENDING` | `personId` |
| `ProMessage` (si retenu) | `ProMessage → recipientPersonId = req.user.personId` | `personId` |
| `CoordinationAnomaly` | `CoordinationAnomaly → CareCase → CareCaseMember.personId = req.user.personId AND status = ACTIVE` | `personId` |

> ⚠️ Les sources **`Task`** et **`AppointmentRequest`** sont sur `ProviderProfile.id` (pas `Person.id`). La nouvelle route doit faire le lookup `personId → providerId` une seule fois et router selon la source. **Pattern déjà implémenté dans `/notifications` ligne 48-52.**

---

## 7. Questions ouvertes pour Margot (P0.7)

### Q1. Path canonique de la nouvelle route

Le brief propose `GET /api/cockpit/notifications/feed`. Mais **aucune autre route Nami n'utilise le préfixe `/api/cockpit/`** (vérifié par `rg "/api/cockpit" src/app.ts` → 0 hit). Le préfixe canonique des notifications est `/notifications` (app.ts:308).

**Options** :
- A. `GET /notifications/feed` — respecte l'existant. Recommandé.
- B. `GET /notifications?shape=feed` — extension paramétrée de la route existante.
- C. `GET /api/cockpit/notifications/feed` — comme dans le brief, introduit un préfixe d'architecture nouveau.

**Ma recommandation : option A.**

### Q2. Cohabitation avec `GET /notifications` existant

Si on crée `/notifications/feed` :
- La cloche A consomme actuellement `GET /notifications` (= ACTIVITÉ RÉCENTE essentiellement)
- La nouvelle cloche unifiée consommera `/notifications/feed` (À FAIRE + ACTIVITÉ)
- L'ancienne route `/notifications` devient redondante après Sprint 3

**Options** :
- A. Garder `/notifications` (deprecated) pour 1 release puis supprimer
- B. Supprimer immédiatement après Sprint 3 (atomicité)
- C. Garder définitivement comme API publique stable

**Ma recommandation : option A** (deprecation banner sur le code, suppression après une release de stabilité).

### Q3. Wording `urgency` vs CLAUDE.md mots interdits

Le brief impose un champ `urgency: 'high' | 'medium' | 'low'`. Or **CLAUDE.md ligne 32-36** interdit `urgence`, `risque`, `danger` (outputs IA). Le label UI ne doit pas afficher "Urgence haute" car ça frôle le mot interdit.

**Options** :
- A. Renommer le champ en `priority` côté API ET libellés UI "Priorité haute / moyenne / standard"
- B. Garder `urgency` côté code (technique) mais labels UI "Priorité haute / moyenne / standard"
- C. Garder tel quel `urgency` (risque de requalification DM mineur sur cloche d'organisation, mais cohérence wording globale Nami compromise)

**Ma recommandation : option A** — strict respect de la doctrine `priority`, jamais `urgency` à aucun niveau.

---

## 📋 Synthèse — décisions à prendre par Margot avant Sprint 1

| # | Décision | Recommandation |
|---|---|---|
| Q1 | Path nouvelle route | `GET /notifications/feed` |
| Q2 | Sort de `/notifications` legacy | Deprecation 1 release puis suppression |
| Q3 | Wording `urgency` → `priority` | Renommer partout (champ + label UI) |

---

**Phase 0 complète, en attente de validation Margot.**

Aucune ligne de code modifiée. Aucun commit. Aucun fichier supprimé. Le rapport est dupliqué à la racine des 2 repos (`/Users/margotvire/nami/PHASE_0_NOTIFICATIONS.md` et `/Users/margotvire/nami-web/PHASE_0_NOTIFICATIONS.md`).
