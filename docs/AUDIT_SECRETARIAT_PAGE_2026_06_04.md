# AUDIT — Espace `/secretariat` (état de l'art 2026-06-04)

> **Mission** : audit exhaustif read-only de l'espace secrétariat (Next.js `(secretariat)` group) — pages, composants, hooks, routes, bugs visibles en prod, et plan de refonte séquencé.
>
> **Méthode** : lecture intégrale du worktree `audit-secretariat-page-2026-06-04` (branche `docs/audit-secretariat-page-2026-06-04` issue de `origin/main` au commit `844472b`). Cross-référencement avec le backend `nami/src/routes/secretary.ts` pour identifier la source des bugs frontend.
>
> **Verdict** : l'espace est en état **shell** — 2 pages réelles (Agenda + Tâches) sur 5 annoncées dans la sidebar. 3 routes 404 (Patients, Salle d'attente, Paramètres), 1 cloche en double, 1 composant orphelin (`MyLinksSection`), une régression backend producteur de "Inconnu" pour TOUS les soignants gérés. Refonte recommandée en P0 sur 5 chantiers ciblés.
>
> **Auteur** : Claude (audit délégué via /audit-secretariat)
> **Date** : 2026-06-04

---

## Table des matières

1. [Inventaire UI actuel](#1-inventaire-ui-actuel)
2. [Routes / pages manquantes (404)](#2-routes--pages-manquantes-404)
3. [Bugs identifiés + causes racines](#3-bugs-identifiés--causes-racines)
4. [Cohérence data — Person, soignant link, agenda](#4-cohérence-data--person-soignant-link-agenda)
5. [Composants partagés réutilisables (cockpit → secrétariat)](#5-composants-partagés-réutilisables-cockpit--secrétariat)
6. [Plan de refonte séquencé (P0 → P1 → P2)](#6-plan-de-refonte-séquencé)
7. [Décisions Margot attendues](#7-décisions-margot-attendues)
8. [Annexes](#8-annexes)

---

## 1. Inventaire UI actuel

### 1.1 Arborescence fichiers `src/app/(secretariat)/`

```
src/app/(secretariat)/
├── __tests__/
│   └── layout.test.tsx                  ✅ couvre auth-guard + sidebar + cloche
├── error.tsx                            ✅ error boundary Sentry tagged `boundary=secretariat`
├── layout.tsx                           ✅ sidebar + header + auth-guard SECRETARY|ADMIN
└── secretariat/
    ├── page.tsx                         ✅ AGENDA jour (colonnes multi-soignants)
    ├── taches/
    │   └── page.tsx                     ✅ Tâches /tasks/mine (statut PENDING|COMPLETED|ALL)
    └── _components/
        ├── MyLinksSection.tsx           ⚠️ ORPHELIN — composant écrit + testé mais JAMAIS importé
        └── __tests__/MyLinksSection.test.tsx
```

**Décompte** : 2 pages, 1 layout, 1 composant orphelin, 1 error boundary, 4 tests.

### 1.2 Sidebar (déclarée dans [layout.tsx:19-25](../src/app/(secretariat)/layout.tsx#L19-L25))

| # | href                              | Label            | Cible           | Statut         |
|---|-----------------------------------|------------------|-----------------|----------------|
| 1 | `/secretariat`                    | Agenda           | `page.tsx`      | ✅ Existe      |
| 2 | `/secretariat/taches`             | Tâches           | `taches/page.tsx`| ✅ Existe      |
| 3 | `/secretariat/patients`           | Patients         | (rien)          | ❌ **404**     |
| 4 | `/secretariat/salle-attente`      | Salle d'attente  | (rien)          | ❌ **404**     |
| 5 | `/secretariat/parametres`         | Paramètres       | (rien)          | ❌ **404**     |

→ **3 entrées sur 5 (60 %) mènent à un 404 Next.js** (page introuvable, fallback global).

### 1.3 Page Agenda — `/secretariat`

Fichier : [src/app/(secretariat)/secretariat/page.tsx](../src/app/(secretariat)/secretariat/page.tsx) (659 lignes)

Sections :

| Zone                    | Source                                | Particularités                                                       |
|-------------------------|---------------------------------------|----------------------------------------------------------------------|
| Header date             | `useState(new Date())` + `date-fns`  | Boutons ChevronLeft/Right, badge "Aujourd'hui", bouton "Aujourd'hui" |
| Badge salle attente     | `api.getWaitingRoom()` 30 s polling   | `<Armchair>` + nombre — header droit                                 |
| **Cloche notifs (in-page)** | `SecretariatNotifBell` (composant #1) | 🐛 **DOUBLE** avec la cloche du layout                              |
| Refresh manuel          | `RefreshCw` invalidate React Query    |                                                                      |
| Axe horaire             | `7h → 20h`, `SLOT_HEIGHT=60px`        | Hardcodé                                                             |
| Colonnes soignants      | `api.getAgendas(date)` 30 s polling   | 🐛 `providerName = "Inconnu"` (cf. §3.4)                            |
| RDV blocks              | `apptToStyle()` interne               | 12 statuts mappés `STATUS_CONFIG`                                    |
| Modal création RDV      | `CreateApptModal` (interne)           | Recherche patient debounced 300 ms                                   |
| Modal détail RDV        | `ApptDetailModal` (interne)           | Cancel + Mark Arrived                                                |
| Sidebar droite          | Salle d'attente + `SecretariatSignedDocsSection` | Largeur 256 px fixe                                  |
| Pill statut consultation | `CONSULTATION_LIFECYCLE_STATUSES`     | IN_PROGRESS / COMPLETED / CANCELLED_BY_PROVIDER                      |

**Vue actuelle = vue JOUR uniquement.** Aucune sélecteur Jour/Semaine. Aucun raccourci clavier. Aucun drag & drop.

### 1.4 Page Tâches — `/secretariat/taches`

Fichier : [src/app/(secretariat)/secretariat/taches/page.tsx](../src/app/(secretariat)/secretariat/taches/page.tsx) (48 lignes — minimaliste)

- Header avec compteur "X tâches en attente"
- `<SecretariatTasksSection>` (composant partagé `src/components/secretariat/`)
- 3 filtres : **À faire** / **Fait** / **Toutes**
- Action unique par tâche : "Marquer fait" (PATCH `/care-cases/:cid/tasks/:tid` `{status:"COMPLETED"}`)
- Empty state : "Aucune tâche assignée"

**Pas de :** création tâche, édition prio/échéance, filtre par soignant, recherche, vue groupée par patient. Wording légal MDR-safe (cf. JSDoc en haut du composant).

### 1.5 Layout / Sidebar

Fichier : [src/app/(secretariat)/layout.tsx](../src/app/(secretariat)/layout.tsx)

Structure :

```
<div flex>
  <aside w-56 fixed left-0 top-0>  // sidebar
    Logo "Nami / Secrétariat"
    NAV_ITEMS (5 entrées)
    Profil + déconnexion (sticky bottom)
  </aside>
  <main ml-56>
    <header sticky top-0 h-14>
      <SecretaryNotificationBell />  // cloche #2 (vraie cloche feed)
    </header>
    {children}
  </main>
</div>
```

**Auth-guard** : `useEffect` qui `router.replace("/login")` si pas de token, et `router.replace("/aujourd-hui")` si role ≠ SECRETARY/ADMIN.

⚠️ **Anti-pattern Zustand SSR race** (cf. mémoire INIT-207, layouts encore fragiles) : ce layout NE GÈRE PAS `hasHydrated`. Sur hard reload, possible flicker → redirect login → re-login. À vérifier post-fix.

### 1.6 Couverture des hooks dédiés

| Hook                              | Endpoint backend                                          | Usage                                       | Statut         |
|-----------------------------------|-----------------------------------------------------------|---------------------------------------------|----------------|
| `useSecretaryNotifications`       | `GET /secretary/notifications/feed?limit=N` (PR #173)     | Cloche layout                               | ✅ Live PR #173 |
| `useSecretariatTasks`             | `GET /tasks/mine?status=...` + `PATCH /care-cases/.../tasks/...` | Section Tâches                  | ✅ Live (PR #172 scope étendu) |
| `useSecretariatLinks`             | `GET /me/secretariat-links?status=...`                    | `MyLinksSection` (orphelin)                 | ⚠️ Backend OK, frontend non câblé |
| `useSecretariatSignedDocs`        | `GET /secretary/signed-documents`                         | Section docs signés                         | ✅ Live PR #185 (router monté `app.use("/secretary", secretarySignedDocumentsRouter)`) |
| `useProviderSearchLight`          | `GET /providers/search-light`                             | Wizard signup secrétaire                    | ✅ Live          |

### 1.7 Endpoints frontend `secretaryApi` (api.ts:4798-4847)

```
GET    /secretary/agendas?date=YYYY-MM-DD     → { date, agendas[] }
POST   /secretary/appointments                → SecretaryAppointment
PATCH  /secretary/appointments/:id            → SecretaryAppointment
DELETE /secretary/appointments/:id            → { success }
POST   /secretary/appointments/:id/arrived    → { success }
GET    /secretary/waiting-room                → SecretaryWaitingEntry[]
GET    /secretary/patients/search?q=...       → SecretaryPatientResult[]
GET    /secretary/patients/:id                → { patient, appointments }
GET    /secretary/notifications/feed?limit=N  → SecretaryNotificationFeed
```

**Endpoint absent** côté `secretaryApi` mais utilisé par `SecretariatNotifBell` (composant in-page) : `GET /secretary/notifications` (legacy, distinct du `/feed`). Cette duplication est la source du bug double cloche (§3.2).

---

## 2. Routes / pages manquantes (404)

### 2.1 `/secretariat/patients` — Liste patients de l'équipe

| Item            | Détail                                                                                                                                  |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| Annoncé dans    | [layout.tsx:22](../src/app/(secretariat)/layout.tsx#L22), [error.tsx:12](../src/app/(secretariat)/error.tsx#L12)                       |
| Page existante  | ❌ — aucun fichier `src/app/(secretariat)/secretariat/patients/page.tsx`                                                                |
| Backend         | ✅ `GET /secretary/patients/search?q=...` + `GET /secretary/patients/:id` existent ([secretary.ts:348-426](#))                          |
| Composant cockpit réutilisable | `src/app/(cockpit)/patients/page.tsx` + `empty-state.tsx` + `create-patient-modal.tsx` (mais scope diffère : la secrétaire voit les patients de ses soignants liés, pas de scope `My`) |
| Décision prod ? | La secrétaire doit-elle pouvoir **CRÉER** un patient ? **MODIFIER** ? Juste **CONSULTER** + **CHERCHER** ? À trancher §7.              |

### 2.2 `/secretariat/salle-attente` — Vue salle d'attente plein écran

| Item            | Détail                                                                                                                |
|-----------------|-----------------------------------------------------------------------------------------------------------------------|
| Annoncé dans    | [layout.tsx:23](../src/app/(secretariat)/layout.tsx#L23) (label « Salle d'attente »)                                  |
| Page existante  | ❌                                                                                                                    |
| Backend         | ✅ `GET /secretary/waiting-room` retourne `SecretaryWaitingEntry[]` ([secretary.ts:312](#))                            |
| Affichage actuel | Sidebar 256 px droite de l'agenda + badge header (compteur)                                                          |
| Question        | Une page dédiée plein écran est-elle nécessaire si la sidebar suffit ? OU : la sidebar agenda devient « Salle d'attente » et `/secretariat/salle-attente` devient la vue plein écran (utile sur poste secrétariat dédié) ? |

🛑 **Incohérence wording — voir aussi §7** : l'utilisateur parle de « liste-attente » dans son brief, le code utilise `salle-attente`. **« Salle d'attente » est correct** (sémantique métier : patient déjà arrivé physiquement, en attente de la consultation). « Liste d'attente » = futur RDV non confirmé, différent.

### 2.3 `/secretariat/parametres` — Paramètres du compte secrétaire

| Item            | Détail                                                                                                                |
|-----------------|-----------------------------------------------------------------------------------------------------------------------|
| Annoncé dans    | [layout.tsx:24](../src/app/(secretariat)/layout.tsx#L24)                                                              |
| Page existante  | ❌                                                                                                                    |
| Composant prêt à brancher | **`MyLinksSection`** ([src/app/(secretariat)/secretariat/_components/MyLinksSection.tsx](../src/app/(secretariat)/secretariat/_components/MyLinksSection.tsx)) — 305 lignes, 3 sections (ACTIVE/PENDING/HISTORY), modale révoquer, tests ✅ — **mais JAMAIS importé** |
| Backend         | ✅ `GET /me/secretariat-links?role=SECRETARY&status=...` + `DELETE /secretariat-links/:id` ([api.ts:5109-5135](#))    |
| Symétrie soignant | Côté soignant : page `/reglages/secretariat` existe ([src/app/(cockpit)/reglages/secretariat/page.tsx](../src/app/(cockpit)/reglages/secretariat/page.tsx), 288 lignes). |
| Recommandation  | **Câbler `MyLinksSection` dans `/secretariat/parametres`** (action quasi gratuite — composant fait, testé, hook prêt). |

### 2.4 Cohérence avec `error.tsx`

[error.tsx:12-13](../src/app/(secretariat)/error.tsx#L12-L13) déclare en JSDoc :
> « Intercepte les erreurs des pages secrétariat (/secretariat, /secretariat/patients, /secretariat/salle-attente, /secretariat/parametres) »

→ L'intention produit existe explicitement dans la doc du code. C'est juste **non livré**.

---

## 3. Bugs identifiés + causes racines

### 3.1 BUG#SEC-01 — `/secretariat/patients` 404

- **Diagnostic** : `<Link href="/secretariat/patients">` rendu par [layout.tsx:22](../src/app/(secretariat)/layout.tsx#L22), aucun `page.tsx` correspondant.
- **Maillon cassé** : routing Next.js — pas de bug logique, juste un dossier vide.
- **Sentry** : remonte en erreur 404 sur `boundary=secretariat` à chaque clic.
- **Fix minimal** : créer `src/app/(secretariat)/secretariat/patients/page.tsx` (cf. §6).
- **Fix temporaire 0 effort** : retirer l'entrée du `NAV_ITEMS` jusqu'à livraison.

### 3.2 BUG#SEC-02 — Double cloche notifications sur `/secretariat`

**Reproduction** : se logguer en SECRETARY, ouvrir `/secretariat`, regarder le header → 2 icônes 🔔 visibles côte-à-côte dans la zone droite du header.

**Cause racine — deux composants distincts, deux endpoints distincts** :

| Cloche                                       | Fichier                                                                                       | Endpoint                                  | Monté dans                                                              |
|----------------------------------------------|-----------------------------------------------------------------------------------------------|-------------------------------------------|-------------------------------------------------------------------------|
| #1 **`SecretaryNotificationBell`**           | [src/components/notifications/SecretaryNotificationBell.tsx](../src/components/notifications/SecretaryNotificationBell.tsx) | `GET /secretary/notifications/feed?limit=20` (PR #173) | **layout** [layout.tsx:125](../src/app/(secretariat)/layout.tsx#L125) |
| #2 **`SecretariatNotifBell`**                | [src/components/secretariat/SecretariatNotifBell.tsx](../src/components/secretariat/SecretariatNotifBell.tsx)               | `GET /secretary/notifications` (legacy)   | **agenda page** [secretariat/page.tsx:571](../src/app/(secretariat)/secretariat/page.tsx#L571) |

**Conséquences** :
- Sur `/secretariat` : 2 cloches affichées
- Sur `/secretariat/taches` : 1 seule cloche (la layout) → comportement INCOHÉRENT entre pages
- 2 polling 30s simultanés sur 2 endpoints différents → double charge réseau / coût Railway

**Maillon cassé** : duplication historique. PR #173 a livré le nouveau feed unifié `/feed` mais le composant legacy `SecretariatNotifBell` (F-CROSS-GAP-Notification-SECRETARIAT) n'a pas été retiré du `secretariat/page.tsx`.

**Fix minimal (P0)** : retirer l'import + l'usage de `SecretariatNotifBell` dans [secretariat/page.tsx:24,571](../src/app/(secretariat)/secretariat/page.tsx#L24). Conserver uniquement la cloche du layout. Supprimer ensuite le composant `SecretariatNotifBell.tsx` ET les tests associés ([src/components/secretariat/__tests__/SecretariatNotifBell.test.tsx](#)). Sur le backend : déprécier `GET /secretary/notifications` ou le laisser tant qu'il est gratuit (à arbitrer).

**Effet de bord à vérifier** : `SecretariatNotifBell` consomme `/secretary/notifications` (sans `/feed`). Si ce endpoint legacy retourne des notifications non couvertes par le nouveau feed (ex: PUSH spécifiques), risque de **régression silencieuse**. → CHECK backend `secretary.ts:430+` avant suppression.

### 3.3 BUG#SEC-03 — Click sur le nom du soignant (« Sophie Le Maire ») ne déclenche rien

**Reproduction** : ouvrir `/secretariat`, cliquer sur le nom d'un soignant dans l'en-tête de sa colonne d'agenda OU dans une carte de salle d'attente.

**Cause racine — le nom est rendu en `<p>` plat, sans handler** :

- [secretariat/page.tsx:384](../src/app/(secretariat)/secretariat/page.tsx#L384) (header colonne agenda) :
  ```tsx
  <p className="text-[11px] font-semibold text-[#1A1A2E] truncate">
    {agenda.providerName}
  </p>
  ```
- [secretariat/page.tsx:637](../src/app/(secretariat)/secretariat/page.tsx#L637) (carte salle d'attente sidebar) :
  ```tsx
  <p className="text-[9px] text-[#6B7280] truncate">{entry.providerName}</p>
  ```

Aucun `<Link href>`, `onClick`, ni `<button>`. Le maillon cassé est **côté UI** : le composant n'a jamais été conçu pour être interactif.

**Question produit (cf. §7)** :
- Vers quoi devrait pointer le clic ? Profil soignant (annuaire) ? Configuration des permissions agenda secrétaire ? Modal récap ?
- Côté annuaire cockpit : `src/app/(cockpit)/annuaire/[id]/page.tsx` existe, mais scopé soignants RÉSEAU, pas soignants gérés par la secrétaire.

**Fix minimal (P1) — proposition** :
- Cliquer = modal léger 300 px (téléphone, email, spécialités, lien « Paramètres rattachement »).
- OU : `Link href="/secretariat/parametres?provider={providerId}"` qui pré-scrolle/highlight la card du soignant.
- Choix à arbitrer Margot.

### 3.4 BUG#SEC-04 — `providerName === "Inconnu"` sur TOUS les soignants gérés

**Reproduction** : se logguer en SECRETARY avec ≥1 `managedProviders`. Ouvrir `/secretariat`. Les colonnes affichent toutes « Inconnu » dans le header au lieu du vrai nom du soignant.

**Cause racine — bug BACKEND** (mais visible côté frontend). Fichier `nami/src/routes/secretary.ts` :

```ts
// Ligne 25-39 : middleware
async function requireSecretary(req, res, next) {
  // ...
  const profile = await prisma.secretaryProfile.findUnique({
    where: { personId: req.user.personId },
    include: { managedProviders: true },  // ⚠️ pas de provider.person !
  });
  (req as any).secretaryProfile = profile;
  next();
}

// Ligne 66+ : endpoint /agendas
router.get("/agendas", requireAuth, requireSecretary, async (req, res) => {
  const profile = req.secretaryProfile;
  // ...
  const agendas = providerIds.map((pid) => {
    const mp = profile?.managedProviders.find((m) => m.providerId === pid);
    return {
      providerId: pid,
      providerName: mp?.provider?.person     // ← mp.provider est undefined !
        ? `${mp.provider.person.firstName} ${mp.provider.person.lastName}`
        : "Inconnu",                          // ← FALLBACK toujours pris
      specialties: mp?.provider?.specialties ?? [],  // ← idem, toujours []
      // ...
    };
  });
});
```

Le middleware ne fait `include: { managedProviders: true }` qu'au niveau 1 — donc `mp.provider` (ProviderProfile) n'est pas chargé, et `mp.provider.person` n'existe pas. Le fallback `"Inconnu"` est pris pour TOUS les soignants à chaque requête.

**Pourquoi « Inconnu inconnu » (double) ?** Deux hypothèses :
1. Le rendu colonne empile **providerName** sur une ligne + **specialties[0]** sur une seconde ligne ([page.tsx:384-385](../src/app/(secretariat)/secretariat/page.tsx#L384-L385)). Si la specialty est vide (pareil bug : `mp.provider.specialties` non chargé → fallback `[]` → `specialties[0]` = `undefined` → rendu vide) — on devrait voir « Inconnu » + blanc. Possible que l'utilisateur ait perçu « Inconnu » dupliqué visuellement.
2. Plusieurs colonnes affichées = plusieurs « Inconnu » côte-à-côte (« Inconnu | Inconnu » → lu « Inconnu inconnu »).

**Maillon cassé** : middleware backend.

**Fix backend (P0)** :
```ts
// secretary.ts ligne 32-35
const profile = await prisma.secretaryProfile.findUnique({
  where: { personId: req.user.personId },
  include: {
    managedProviders: {
      include: {
        provider: {
          select: {
            id: true,
            specialties: true,
            person: { select: { firstName: true, lastName: true, photoUrl: true } },
          },
        },
      },
    },
  },
});
```

→ Une seule ligne de diff. Validable par curl.

**Vérification post-fix** :
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://nami-production-f268.up.railway.app/secretary/agendas?date=2026-06-04 \
  | jq '.agendas[] | { providerName, specialties }'
```
→ Doit retourner les vrais noms et spécialités.

**Effets de bord à investiguer** :
- Cette même payload `req.secretaryProfile` est lue dans 6+ endpoints (`POST/PATCH/DELETE /appointments`, `/appointments/:id/arrived`, `/waiting-room`, `/notifications`, etc.). Le champ utilisé est uniquement `managedProviders.providerId` (pas `provider`). → Aucune régression attendue, l'include élargi est sans risque.
- Coût Prisma : +1 join `Person`. Négligeable.

### 3.5 BUG#SEC-05 — Vue jour seulement (pas de vue semaine)

**Constat** : [secretariat/page.tsx:494-658](../src/app/(secretariat)/secretariat/page.tsx#L494-L658) ne propose qu'une **vue jour** (axe horaire `DAY_START=7` à `DAY_END=20`, colonnes = soignants).

Aucune semaine, aucun switch. Comparer avec [src/app/(cockpit)/agenda/components/WeekGrid.tsx](../src/app/(cockpit)/agenda/components/WeekGrid.tsx) qui rend une vue 7 jours côté soignant.

**Décision produit** : la vue jour est-elle volontaire (densité = jour de travail réel d'une secrétaire) ou un manque ?

- **Argument pro jour** : la secrétaire travaille à l'heure, jamais en planning de semaine. Densité d'info supérieure.
- **Argument pro semaine** : prise de RDV anticipée → besoin de voir « lundi prochain à 14h ? ». Aujourd'hui : 7 clicks « jour suivant ».

**Recommandation** : conserver jour par défaut + **ajouter un sélecteur Jour / Semaine en haut à droite du header agenda** (réutiliser `AgendaHeader.tsx` du cockpit, vue semaine = `WeekGrid` cockpit). Effort moyen, valeur produit forte.

### 3.6 BUG#SEC-06 — `MyLinksSection` composant orphelin

- Fichier : 305 lignes, 3 sections, modale confirmation révocation, **tests passants**, hook prêt.
- Usages : 0 import dans `page.tsx` / `layout.tsx`.
- **Le travail est fait, il manque juste 2 lignes de code pour le brancher** dans `/secretariat/parametres/page.tsx` futur.

### 3.7 BUG#SEC-07 (mineur) — `SecretariatSignedDocsSection` V1 « shell » mais endpoint backend EXISTE depuis PR #185

[useSecretariatSignedDocs.ts:46-55](../src/hooks/useSecretariatSignedDocs.ts#L46-L55) prévoit de retourner `[]` en cas de 404/501/5xx. Or `app.use("/secretary", secretarySignedDocumentsRouter)` est monté dans `nami/src/app.ts:376` — donc l'endpoint **existe en prod**. À vérifier sur namipourlavie.com en se loggant en SECRETARY :

- Si la section affiche « Aucune ordonnance signée à transmettre » alors que des prescriptions SIGNED existent dans la DB → bug data scope (à investiguer côté `secretarySignedDocuments.ts`).
- Si la section affiche les docs → bug fantôme, le wording du JSDoc est obsolète.

**Action audit** : marquer le commentaire « V1 shell gracieux » comme **obsolète** (PR #185 a livré le backend) et tester scope.

### 3.8 BUG#SEC-08 (mineur) — Zustand SSR race sur hard reload

- [layout.tsx:104-114](../src/app/(secretariat)/layout.tsx#L104-L114) : auth-guard `useEffect` qui peut tirer `router.replace("/login")` avant hydratation Zustand.
- Pattern documenté en mémoire INIT-207 : « Layouts encore fragiles: (patient), (secretariat), welcome, onboarding, validation-en-cours ».
- **Symptôme** : hard reload sur `/secretariat` → flash redirect `/login`.
- **Fix** : ajouter `hasHydrated` flag dans le store Zustand (pattern déjà appliqué côté `(cockpit)`).

### 3.9 BUG#SEC-09 (UX) — Modal création RDV : zéro consultationType

Le `CreateApptModal` ([secretariat/page.tsx:87-255](../src/app/(secretariat)/secretariat/page.tsx#L87-L255)) ne propose AUCUN sélecteur de `consultationTypeId`, alors que le backend `POST /secretary/appointments` l'accepte ([secretary.ts:139](#)). Conséquence : tous les RDV créés par la secrétaire arrivent avec `consultationType: null` → la colonne agenda affiche « RDV » générique sans le nom du type (suivi, première, urgence, etc.).

**Comparer** avec le cockpit [src/app/(cockpit)/agenda/components/CreateAppointmentModal.tsx](../src/app/(cockpit)/agenda/components/CreateAppointmentModal.tsx) qui fournit un `consultationTypes: ConsultationTypeDTO[]` complet + `locationType`.

---

## 4. Cohérence data — Person, soignant link, agenda

### 4.1 Modèle de données impliqué (résumé Prisma)

```
SecretaryProfile
  ├── personId       → Person (la secrétaire)
  ├── organizationId
  └── managedProviders[] → ManagedProvider
                              ├── providerId    → ProviderProfile
                              │                     ├── id
                              │                     ├── specialties[]
                              │                     └── person       → Person (le soignant, ex Sophie Le Maire)
                              └── canManageAgenda
```

### 4.2 Chaîne data complète — Agenda colonne

1. **Login** SECRETARY → JWT contient `personId`
2. `GET /secretary/agendas?date=...` → middleware `requireSecretary` charge `secretaryProfile.managedProviders` (sans `provider.person` ⚠️)
3. Endpoint construit `agendas[]` avec `providerName` (cassé : "Inconnu") + `appointments[]` (correct car appointment.include.provider.person OK)
4. Frontend `useQuery({ queryKey: ["secretary-agendas", date] })` → 30 s polling
5. `<AgendaColumn agenda={...} />` → rend `agenda.providerName` (toujours "Inconnu") + `agenda.specialties[0]` (toujours `undefined`)

→ La **payload appointments est correcte** (le patient name s'affiche bien dans les RDV), mais le **header colonne est cassé**. Différence : appointments fait un `include.provider.person` LOCAL à `prisma.appointment.findMany` (lignes 84-94), pas la lookup dans `profile.managedProviders`.

### 4.3 Chaîne data — Soignant link (rattachement)

Côté secrétaire :
```
GET /me/secretariat-links?role=SECRETARY&status=ACTIVE
  → SecretariatLinksResponse { asRole, links: SecretariatLink[] }
      ├── id
      ├── status (ACTIVE | PENDING | REJECTED | REVOKED)
      ├── scope[] (APPOINTMENTS | DOCUMENTS | MESSAGES)
      ├── counterpart { id, firstName, lastName, email, phone? }
      ├── requestedAt
      ├── acceptedAt
      └── revokedAt
```

→ Cette donnée existe et est correctement servie. Elle est simplement non rendue (composant `MyLinksSection` orphelin §3.6).

### 4.4 Cohérence Person — sources possibles d'« Inconnu »

| Source                                             | Probabilité                                                  | Action recommandée                                       |
|----------------------------------------------------|--------------------------------------------------------------|----------------------------------------------------------|
| Middleware backend ne charge pas `provider.person` | 🟢 **CONFIRMÉ — racine principale**                          | Fix `include` middleware (cf. §3.4)                       |
| Person.firstName / Person.lastName null            | 🟡 Possible si seed/import partiel — à vérifier en prod      | `select firstName, lastName from "Person" where roleType='PROVIDER' and (firstName is null or lastName is null);` |
| Person.firstName = "Inconnu" littéral en seed      | 🔴 Improbable — `grep "Inconnu"` retourne uniquement les 2 occurrences fallback dans le code | n/a |

### 4.5 Schéma de référence — providerName dans `secretary.ts`

```
Ligne 105-107  : "/agendas"         → mp.provider.person      ⚠️ CASSÉ (middleware)
Ligne 339      : "/waiting-room"    → a.provider.person       ✅ OK (include local)
Ligne 414, 422 : "/notifications"   → r/a.provider.person     ✅ OK
Ligne 503      : "/notifications"   → a.provider.person       ✅ OK
```

→ **Seul `/agendas` est cassé**. Le diff backend est minime (cf. §3.4) et corrige toute la chaîne.

---

## 5. Composants partagés réutilisables (cockpit → secrétariat)

### 5.1 Inventaire `src/components/` exploitable

| Catégorie                | Composant                                                        | Fichier                                                                                            | Pertinence pour refonte secrétariat                        |
|--------------------------|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|------------------------------------------------------------|
| **Agenda**               | `WeekGrid`                                                       | [src/app/(cockpit)/agenda/components/WeekGrid.tsx](../src/app/(cockpit)/agenda/components/WeekGrid.tsx) | ⭐ Vue semaine 7 jours, axe horaire, multi-locations — branchable derrière switch Jour/Semaine |
|                          | `AppointmentBlock`                                               | [.../AppointmentBlock.tsx](../src/app/(cockpit)/agenda/components/AppointmentBlock.tsx)           | ⭐ Block RDV avec colorClass + locationColor                |
|                          | `AgendaHeader`                                                   | [.../AgendaHeader.tsx](../src/app/(cockpit)/agenda/components/AgendaHeader.tsx)                   | ⭐ Header navigation + "New" bouton                          |
|                          | `CreateAppointmentModal`                                         | [.../CreateAppointmentModal.tsx](../src/app/(cockpit)/agenda/components/CreateAppointmentModal.tsx) | ⭐⭐ Modal RDV avec `consultationTypes` (résout BUG#SEC-09) |
|                          | `CancelAppointmentModal`                                         | [.../CancelAppointmentModal.tsx](../src/app/(cockpit)/agenda/components/CancelAppointmentModal.tsx) | ⭐ Confirmation cancel                                       |
|                          | `useAgenda` hook                                                 | [.../hooks/useAgenda.ts](../src/app/(cockpit)/agenda/hooks/useAgenda.ts)                          | ⚠️ Scopé `providerId` unique — à étendre pour multi-providers secrétariat |
| **Tâches**               | `TaskCard`                                                       | [src/components/taches/TaskCard.tsx](../src/components/taches/TaskCard.tsx)                       | ⭐ Pattern glass-soft (vs `SecretariatTasksSection` minimaliste)        |
|                          | `TaskFilterBar`                                                  | [src/components/taches/TaskFilterBar.tsx](../src/components/taches/TaskFilterBar.tsx)             | ⭐ Chips filtre (vs 3 boutons actuels)                         |
|                          | `TaskDetailSheet`                                                | [src/components/taches/TaskDetailSheet.tsx](../src/components/taches/TaskDetailSheet.tsx)         | ⚠️ Édition prio/desc — interdite pour SECRETARY V1            |
|                          | `OverdueSection`                                                 | [src/components/taches/OverdueSection.tsx](../src/components/taches/OverdueSection.tsx)           | ⭐ Section "En retard" — UX critique pour secrétaire           |
|                          | `TaskPeriodSection`                                              | [src/components/taches/TaskPeriodSection.tsx](../src/components/taches/TaskPeriodSection.tsx)     | ⭐ Section "Aujourd'hui / Cette semaine / Plus tard"           |
|                          | `PriorityPill`, `StatusBadge`, `TaskCancelModal`                 | [src/components/taches/](../src/components/taches/)                                              | ⭐ Pills standard                                                |
| **EmptyStates**          | `EmptyState` (nami)                                              | [src/components/nami/EmptyState.tsx](../src/components/nami/EmptyState.tsx)                       | ⭐ Composant nami unifié — à utiliser dans toutes les pages secrétariat |
|                          | `EmptyState` (base)                                              | [src/components/EmptyState.tsx](../src/components/EmptyState.tsx)                                | ⚠️ Variant historique, préférer `nami/`                        |
| **Patients**             | `create-patient-modal`                                           | [src/app/(cockpit)/patients/create-patient-modal.tsx](../src/app/(cockpit)/patients/create-patient-modal.tsx) | ⭐⭐ Modal création patient — directement réutilisable          |
|                          | `patients/empty-state`                                           | [src/app/(cockpit)/patients/empty-state.tsx](../src/app/(cockpit)/patients/empty-state.tsx)       | ⭐ État vide patients + bouton import                            |
|                          | `patients/import-modal`                                          | [src/app/(cockpit)/patients/import/import-modal.tsx](../src/app/(cockpit)/patients/import/import-modal.tsx) | 🟡 Import Doctolib — à scoper côté secrétariat ? (P2)        |
| **Notifications**        | `SecretaryNotificationBell`                                      | [src/components/notifications/SecretaryNotificationBell.tsx](../src/components/notifications/SecretaryNotificationBell.tsx) | ✅ Déjà utilisé (layout) — c'est le BON                       |
|                          | `SecretariatNotifBell`                                           | [src/components/secretariat/SecretariatNotifBell.tsx](../src/components/secretariat/SecretariatNotifBell.tsx) | ❌ À supprimer (BUG#SEC-02)                                       |
| **UI primitives**        | `NamiInput`, `AnimatedTabs`, `Button`, `Sheet`, `Dialog`         | [src/components/ui/](../src/components/ui/)                                                       | ⭐ Standard cockpit — utiliser systématiquement                   |
|                          | `glass-surface`                                                  | [src/components/ui/glass-surface.tsx](../src/components/ui/glass-surface.tsx)                     | ⭐ Pour l'effet « medical 2026 »                                  |
|                          | `ScrollReveal`, `StaggerList`                                    | [src/components/ui/](../src/components/ui/)                                                       | 🟡 Optionnel — à éviter sur un agenda dense                      |

### 5.2 Hooks réutilisables

| Hook                     | Usage cockpit                | Usage secrétariat suggéré                                |
|--------------------------|------------------------------|---------------------------------------------------------|
| `useSecretaryNotifications` | n/a (dédié secrétariat)    | ✅ Déjà câblé layout                                     |
| `useSecretariatTasks`       | n/a                         | ✅ Déjà câblé `/secretariat/taches`                       |
| `useSecretariatLinks`       | `/reglages/secretariat`     | 🟡 À câbler `/secretariat/parametres` via `MyLinksSection` |
| `useSecretariatSignedDocs`  | n/a                         | ✅ Déjà câblé sidebar droite agenda                       |
| `apiWithToken().tasks.update` | `(cockpit)/taches/*`     | ✅ Déjà utilisé via `useCompleteSecretariatTask`         |

### 5.3 Patterns à PRÉSERVER (ne pas mutualiser à tort)

- **Wording légal MDR** : le secrétariat applique une **discipline plus stricte** que le cockpit (interdiction « intervention », « alerte clinique », « à signer », « à valider »). Voir JSDoc en haut de `SecretariatTasksSection.tsx` et `SecretariatSignedDocsSection.tsx`. **Ne pas copier-coller du wording cockpit**.
- **Édition restreinte** : la secrétaire ne peut PAS éditer prio/desc/dueDate des tâches. `TaskDetailSheet` du cockpit l'autorise → ne pas l'importer tel quel ; faire un variant `TaskReadOnlySheet` si besoin.
- **Scope multi-providers** : le secrétariat affiche N soignants ; le cockpit affiche 1 seul. `useAgenda` cockpit assume `providerId` unique — à ne pas réutiliser directement, ré-écrire pour `providerIds[]` (ou utiliser `getAgendas` direct sans le hook).

---

## 6. Plan de refonte séquencé

### 🚨 P0 — Bugs bloquants (à fixer AVANT toute refonte UX)

Ordre d'exécution :

#### P0.1 — **Backend** : fix middleware `requireSecretary` (BUG#SEC-04)

- Fichier : `nami/src/routes/secretary.ts:32-35`
- Diff : `include: { managedProviders: true }` → `include: { managedProviders: { include: { provider: { select: { id, specialties, person: { select: { firstName, lastName, photoUrl }}}}}}}`
- Test : `curl /secretary/agendas?date=2026-06-04 | jq '.agendas[].providerName'` doit retourner les vrais noms
- **Effort** : 10 min
- **PR** : nami backend, dédiée, isolée

#### P0.2 — **Frontend** : supprimer la cloche en double (BUG#SEC-02)

- Fichier : `nami-web/src/app/(secretariat)/secretariat/page.tsx`
- Diff : retirer `import { SecretariatNotifBell }` ligne 24 + bloc `{accessToken && <SecretariatNotifBell .../>}` ligne 571
- Bonus : supprimer le composant `SecretariatNotifBell.tsx` + tests (après vérification que `/secretary/notifications` legacy n'apporte rien que `/feed` ne fait)
- Test : ouvrir `/secretariat` → 1 seule 🔔 dans le header
- **Effort** : 15 min
- **PR** : nami-web, dédiée

#### P0.3 — **Frontend** : retirer (OU livrer) les 3 entrées sidebar 404 (BUG#SEC-01)

Option A — Retirer temporairement :
- Fichier : `nami-web/src/app/(secretariat)/layout.tsx:19-25`
- Diff : commenter les 3 lignes `patients` / `salle-attente` / `parametres`
- **Effort** : 5 min
- Risque : la barre de nav passe de 5 → 2 entrées, l'espace semble très vide

Option B — Livrer un shell minimal pour les 3 routes :
- 3 × `page.tsx` (un par dossier)
- Chacune retourne un `<EmptyState>` « Bientôt disponible »
- **Effort** : 30 min
- Avantage : pas de régression visuelle, prépare le terrain P1

**Recommandation : Option B** (effort comparable, signal produit meilleur).

#### P0.4 — **Frontend** : câbler `MyLinksSection` dans `/secretariat/parametres` (BUG#SEC-06)

- Si Option B P0.3 retenue : transformer le shell `/secretariat/parametres` en page concrète qui rend `<MyLinksSection />`
- 1 import + 1 ligne JSX
- **Effort** : 10 min (composant déjà prêt et testé)
- Valeur : la secrétaire peut révoquer ses rattachements en autonomie

#### P0.5 — **Frontend** : fix Zustand SSR race (BUG#SEC-08)

- Fichier : `layout.tsx`
- Diff : ajouter `hasHydrated` flag (pattern INIT-207)
- **Effort** : 20 min
- Bonus : appliquer aux autres layouts fragiles cités (`(patient)`, `welcome`, etc.) — hors scope ce ticket

**Total P0** : ~1 h. À livrer en 1 ou 2 PRs (1 backend, 1 frontend).

---

### 🟡 P1 — Pages manquantes + UX cohérence (semaine)

#### P1.1 — Page `/secretariat/patients` réelle

- Liste patients agrégée sur les soignants liés (déduplication côté frontend)
- Recherche debounced (réutiliser `searchPatients`)
- Bouton « Nouveau patient » → modal `create-patient-modal` cockpit (sous réserve scope OK)
- Click ligne → `/secretariat/patients/[id]` (vue détail légère : RDV passés/futurs, coordonnées, équipe — PAS de PHI clinique)
- **Effort** : 1-2 j

#### P1.2 — Page `/secretariat/salle-attente` plein écran

- Vue full-page de `getWaitingRoom()` (cards larges, temps d'attente coloré, action « Marquer parti »)
- Auto-refresh 15 s (densité plus haute que 30 s)
- Bouton « Vue compacte » pour réactiver la sidebar agenda
- **Effort** : 0.5-1 j

#### P1.3 — Switch Jour / Semaine sur l'agenda (BUG#SEC-05)

- Importer `WeekGrid` cockpit
- Ajouter switch dans le header
- Garder le providerName clickable (résout BUG#SEC-03 en P1)
- **Effort** : 1 j

#### P1.4 — Click providerName ouvre un modal récap (BUG#SEC-03)

- Modal léger : photo, spécialités, téléphone (cliquable `tel:`), email, lien « Mes rattachements »
- Réutiliser `<Dialog>` UI primitive
- **Effort** : 0.5 j

#### P1.5 — `consultationType` dans modal création RDV (BUG#SEC-09)

- Ajouter sélecteur depuis `GET /consultation-types?providerId=...` (route à confirmer côté backend)
- **Effort** : 0.5 j

**Total P1** : ~4-5 j.

---

### 🟢 P2 — Expérience premium (sprint suivant)

- **P2.1** Drag & drop RDV agenda (déplacement)
- **P2.2** Vue annuelle compacte (mini-calendrier sidebar gauche)
- **P2.3** Raccourcis clavier (n=new, j/k=jour précédent/suivant, t=today, esc)
- **P2.4** Page `/secretariat/parametres` enrichie : préférences notifs, choix vue agenda par défaut, langue/fuseau
- **P2.5** Import patients Doctolib scopé secrétariat (P2 — à scoper produit)
- **P2.6** Notifications PUSH desktop (Web Push API)
- **P2.7** Logger d'actions audit (qui a créé/annulé quoi quand) — utile compliance

---

## 7. Décisions Margot attendues

### Décision 1 — Scope `/secretariat/patients`

> La secrétaire peut-elle **créer** un patient ? **modifier** ses coordonnées ? **archiver** ? Ou seulement **consulter** + **chercher** ?

Hypothèse audit : créer + consulter, pas modifier sauf coordonnées (RGPD ok). Confirmer ou amender.

### Décision 2 — Comportement click `providerName`

> Quand la secrétaire clique sur le nom d'un soignant dans son agenda, que doit-il se passer ?

Options : (a) modal récap fiche soignant, (b) navigation `/secretariat/parametres?provider={id}`, (c) ouverture d'un drawer latéral avec l'historique du soignant (planning passé, congés).

Recommandation : (a) modal léger en P1, drawer riche en P2.

### Décision 3 — Vue agenda par défaut

> Jour ou Semaine ?

Recommandation : Jour par défaut, switch Semaine accessible en 1 click, mémorisé en localStorage.

### Décision 4 — Salle d'attente : sidebar agenda OU page plein écran OU les deux ?

Recommandation : les deux. Sidebar par défaut (compact) + page plein écran (poste secrétariat dédié, écran second moniteur).

### Décision 5 — Conserver / supprimer le legacy `/secretary/notifications` backend ?

Hypothèse : déprécier. Vérifier qu'aucun consumer mobile ou autre ne l'utilise (`grep /secretary/notifications` cross-repos).

### Décision 6 — Wording « Rattachements » vs « Soignants liés » vs « Mes secrétaires (côté provider) »

Aujourd'hui : `MyLinksSection` parle de « Soignants rattachés », `/reglages/secretariat` côté cockpit parle de « Mes secrétaires ». Cohérence ?

Recommandation : maintenir la dualité (la sémantique change selon le rôle), mais documenter dans `docs/FEATURES.md`.

### Décision 7 — Onboarding secrétaire post-signup → où atterrit-elle ?

Le wizard signup ([signup/secretary/page.tsx:162](../src/app/signup/secretary/page.tsx#L162)) push vers `/secretariat`. Mais tant que 0 rattachement n'est accepté, l'agenda est vide (« Aucun soignant affecté »). 

Recommandation : ajouter un **état vide pédagogique** sur `/secretariat` quand `managedProviders.length === 0` : message clair « En attente d'acceptation par X soignant(s) » + lien `/secretariat/parametres`.

### Décision 8 — Cloche notifs : niveau d'action exposé

Aujourd'hui : la cloche `SecretaryNotificationBell` n'expose AUCUNE action (pas de mark-read individuel, pas de « voir tout »). Voulons-nous l'enrichir en P1 ?

---

## 8. Annexes

### Annexe A — Reproduction des bugs en local

```bash
# Login secrétaire de test (à créer en seed si pas existant)
EMAIL=secretary@nami-demo.fr
PASS=Demo2024!

# 1) BUG#SEC-04 — providerName "Inconnu"
TOKEN=$(curl -s -X POST https://nami-production-f268.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | jq -r .accessToken)
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://nami-production-f268.up.railway.app/secretary/agendas?date=2026-06-04" \
  | jq '.agendas[] | {providerName, specialties, nApts:(.appointments|length)}'
# → attendu post-fix : "Sophie Le Maire", spécialités peuplées

# 2) BUG#SEC-02 — double cloche
# Ouvrir https://namipourlavie.com/secretariat dans le navigateur connecté SECRETARY
# Inspecter le header : 2 boutons aria-label "Notifications"
```

### Annexe B — Diff backend minimal (P0.1)

```diff
--- a/src/routes/secretary.ts
+++ b/src/routes/secretary.ts
@@ -30,7 +30,17 @@ async function requireSecretary(req, res, next) {
   if (req.user.roleType === "ADMIN") return next();
 
   const profile = await prisma.secretaryProfile.findUnique({
     where: { personId: req.user.personId },
-    include: { managedProviders: true },
+    include: {
+      managedProviders: {
+        include: {
+          provider: {
+            select: {
+              id: true,
+              specialties: true,
+              person: { select: { firstName: true, lastName: true, photoUrl: true } },
+            },
+          },
+        },
+      },
+    },
   });
   if (!profile) return res.status(403).json({ error: "Profil secrétaire introuvable" });
```

### Annexe C — Composants à supprimer (post-P0.2)

```
src/components/secretariat/SecretariatNotifBell.tsx
src/components/secretariat/__tests__/SecretariatNotifBell.test.tsx
```

(Après vérification que `/secretary/notifications` legacy backend n'a pas de consumer mobile.)

### Annexe D — Cohérence avec audit cross-espaces (rappel mémoire)

Les commentaires inline du code mentionnent un « audit cross-espaces » de référence. Les tickets liés :

- `F-SECRETAIRE-SIGNUP-FLOW-V1` → signup wizard ✅ livré (PR #169)
- `F-TASK V2` → `/tasks/mine` scope étendu ✅ livré (PR #172)
- `F-SECRETARIAT-NOTIFICATIONS-BACKEND-V1` → feed notifs ✅ livré (PR #173) — d'où la duplication avec le legacy `SecretariatNotifBell`
- `F-DOC-SIGNED-SECRETARY-SCOPE-BACKEND` → backend doc signés ✅ livré (PR #185 « SECRETARIAT — surface docs signés (shell V1) »)
- `F-CROSS-GAP-Task-SECRETARIAT` → `SecretariatTasksSection` ✅ livré
- `F-CROSS-GAP-Notification-SECRETARIAT` → ⚠️ legacy, à déprécier post-PR #173
- `F-CROSS-GAP-Document-SIGNED-SECRETARIAT` → V1 shell — backend désormais OK, JSDoc obsolète

→ Cette refonte clôt la phase « shell » (PR #185 dernière) et ouvre la phase « production-ready » (P0 + P1 ci-dessus).

### Annexe E — Métriques d'effort (estimation)

| Phase | Tickets | Effort estimé   | Bénéfice                                          |
|-------|---------|-----------------|---------------------------------------------------|
| P0    | 5       | ~1 h            | Espace utilisable, 0 404 dans la nav, 0 régression |
| P1    | 5       | 4-5 j           | Parité fonctionnelle avec besoins de base secrétariat |
| P2    | 7       | 2-3 sprints     | Expérience premium, démos prod-ready                |

---

**Fin de l'audit.** Document à lire en parallèle de [`docs/FEATURES.md`](./FEATURES.md) et de la dernière colonne du Notion « Secrétariat — Roadmap ».
