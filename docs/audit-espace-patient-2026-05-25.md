# F1 — Audit Espace Patient · 2026-05-25

> **Périmètre** : 5 pages codées dans `src/app/(patient)/` + layout + 24 composants `src/components/patient/`. Read-only.
> **Worktree** : `audit/espace-patient-2026-05-25` depuis `origin/main` à `43f67c6`.
> **Objectif** : préparer Tier 2 (R1-R6 + Action 3) en mesurant la dette restante côté Espace Patient avant tout nouveau code.

---

## TL;DR — décisions à trancher

| # | Sujet | Recommandation IA | Effort |
|---|-------|-------------------|--------|
| 1 | Doublon `/annuaire-public` vs `/trouver-un-soignant` | **Merger** sous `/trouver-un-soignant` (route applicative, palette Nami, déjà branchée 10+ surfaces). Garder `/annuaire-public/[slug]` comme sous-arbre SEO Ameli legacy → 301 vers `/trouver-un-soignant?specialty=...&city=...` | M |
| 2 | Sidebar patient (7 items) vs bottom-nav (4+4) | **Garder 7 sidebar + 4 PRIMARY bottom**. Conformité Information Architecture OK. Activer `/parcours` et `/suivi` quand wireframes V5 codés, supprimer `/trouver-un-soignant` du sidebar patient (le patient atteint l'annuaire via `/accueil` ou Plus menu) | S |
| 3 | Lacunes F2 backend pour R4 (booking mineur) | **Ajouter `Appointment.bookedByPersonId` + `bookedByDelegationId`** (audit trail délégation). `Delegation` polymorphique existe (G2 ✅), pas besoin de FK `Person.legalGuardianId`. Renommage `LegalGuardian` → `LegalRepresentative` reste un sprint dédié (legacy encore présent) | M |
| 4 | DS Liquid Glass × Nami v1.0 | **Non appliqué** sur les 5 pages patient. Blur 28px / mesh 4 blobs / rgba(.45) absents. Refonte visuelle Tier 2 indispensable avant pitch | L |
| 5 | Footer MDR "Outil de coordination · Non DM · RGPD" | **Absent des 5 pages patient**. Ajouter via `PatientLayout` (composant unique) — non-bloquant Tier 2 mais bloquant pré-démo | S |

---

## 1 · Qualité actuelle des 5 pages codées

| Page | LOC | Composant principal | DS Liquid Glass | Wording MDR | Footer MDR | Notes |
|------|-----|---------------------|-----------------|-------------|------------|-------|
| `/accueil` | 241 | inline (Card local) | ❌ blanc opaque `#FFFFFF` + bordure 6%, pas de blur, pas de mesh, gradient avatars hardcodés | ✅ "votre parcours", "équipe soignante", "Messagerie avec mon équipe" | ❌ aucun | Avatars couleur via `name.charCodeAt(0) % 5` (pas tokens DS) · Tokens locaux `C = { primary, primaryLight }` dupliqués depuis 4 autres pages |
| `/mes-documents` | 132 | inline | ❌ même pattern blanc + bord 8% | ✅ "Bilan biologique", "Ordonnance", "Compte-rendu" — neutres | ❌ aucun | Classe `nami-patient-card` utilisée → existe dans globals.css ? non vérifié exhaustivement |
| `/mes-messages` | 193 | inline | ❌ pas de blur | ✅ Bannière jaune urgences 15/112 ✅ ⚠️ MDR safe | ❌ aucun (bannière 15/112 ne couvre pas le footer DM) | Polling 15s sur `messages` → cohérent V1 |
| `/mon-compte` | 1063 | inline + `DeleteAccountModal` + `ProfileSwitcher` | ❌ même pattern | ✅ Bloc commenté explicitement "vocabulaire MDR-safe" L159-161, labels `CONSENT_TYPE_LABELS_FR` neutres ("Notifications de messages" pas "Alertes") | ❌ aucun | Page la plus aboutie (D2.A + D2.B + D2.C livrés). Switcher profils ✅, consentements granulaires ✅, export RGPD + delete Art.17 ✅ |
| `/rendez-vous` | 168 | `AppointmentCard` + `CancelAppointmentModal` + `ProfileSwitcher` | ⚠️ utilise `var(--nami-bg)` + `var(--nami-primary)` (tokens CSS) mais pas de glass — mix Tailwind/CSS vars | ✅ "À venir", "Passés", "Contactez votre soignant" | ❌ aucun | Profile switcher dans page + dans header → duplication possible (cf. `PatientHeader.tsx:92`) |
| `(patient)/layout.tsx` | 42 | — | ⚠️ `bg-[#FAFAF8]` opaque (pas mesh) ; `PatientHeader` utilise `bg-white/85 backdrop-blur-md` (medium blur ≠ blur 28px Liquid Glass spec) | n/a | n/a | Auth guard sans `hasHydrated` → potentielle race Zustand SSR (memoire `feedback_zustand_ssr_race.md`). Sidebar hidden md+, bottom-nav md- ✅ |

**Constats globaux** :
- **0 footer compliance** sur les 5 pages → infraction CLAUDE.md « Footer toutes pages publiques = "Nami n'est pas un dispositif médical" ».
- **0 usage des classes `nami-patient-card-glass` / `liquid-glass-*`** sur les 5 pages → la promesse DS Liquid Glass × Nami v1.0 (cf. brief Tier 2) n'a pas commencé.
- **Tokens dupliqués** : `const C = { primary, primaryLight, text, textSoft, border, card, bg }` recopié dans 4 fichiers — `mes-documents`, `mes-messages`, `accueil`, `mon-compte`. À factoriser dans `@/lib/patient-tokens.ts` ou consommer les CSS vars `--nami-primary`.
- **Wording MDR** : RAS. Les seules occurrences "Alertes" sont dans `StructuredContextFallback.tsx` (composant placé dans `components/patient/` mais utilisé uniquement côté cockpit, à vérifier — actuellement orphelin, aucun import dans `src/app`).
- **Wording wedge** : « parcours », « équipe soignante », « équipe de soins » utilisés cohéramment.

---

## 2 · Écart vs 8 wireframes V5 Notion

> Les wireframes V5 ne sont pas exportés dans le repo (`find -name "v5-*.html"` → 0). Décompte ci-dessous reconstitué à partir des entrées sidebar + bottom-nav + composants existants.

| # | Wireframe V5 attendu | Codé ? | Chemin Next.js actuel | Écart visuel principal |
|---|----------------------|--------|------------------------|------------------------|
| 1 | Accueil patient | ✅ | `src/app/(patient)/accueil/page.tsx` | Manque DS Liquid Glass (mesh, glass cards), avatars génériques (`charCodeAt`), pas de Nami mascot intégrée hors header |
| 2 | Mes rendez-vous | ✅ | `src/app/(patient)/rendez-vous/page.tsx` | Mix `var(--nami-*)` + classes Tailwind → cohérence à arbitrer. Pas de "carte verre" |
| 3 | Mes documents | ✅ | `src/app/(patient)/mes-documents/page.tsx` | Filtres "chips" présents ✅, icônes emoji par type ✅, mais cards plates blanches |
| 4 | Mes messages | ✅ | `src/app/(patient)/mes-messages/page.tsx` | Bubble chat OK, mais palette `C.primary` `#5B4EC4` flat sans glass. Bannière 15/112 ⚠️ jaune (à confirmer = wireframe ?) |
| 5 | Mon compte | ✅ | `src/app/(patient)/mon-compte/page.tsx` | Le plus complet fonctionnellement, mais 1063 LOC monolithiques → refacto en sous-composants alignés DS Liquid Glass |
| 6 | Prendre RDV (booking flow) | ❌ | **manquant** | Tier 2 R1-R3 — sera créé sous `/prendre-rdv/[providerSlug]` ou route inline |
| 7 | Mon parcours | ❌ | sidebar entry `/parcours` disabled "Bientôt" | À créer — view longitudinale pathway |
| 8 | Mon suivi (évolution) | ❌ | sidebar entry `/suivi` disabled "Bientôt" + bottom-nav More menu | À créer — courbes BIA, anthropo, biologie patient-visible |

**Décompte final** : 5/8 wireframes codés, 3 manquants (`/prendre-rdv`, `/parcours`, `/suivi`). Aucun des 5 codés n'est aligné DS Liquid Glass v1.0.

**Note IA cohérence (I5 — 4 surfaces)** :
- Sidebar `Mon parcours` → route `/parcours` → breadcrumb absent → UI mock-up V5 = "Mon parcours". Cohérent.
- Sidebar `Mon suivi` → route `/suivi` → wireframe V5 nommé "Mon évolution" ? Vérifier label final avec Margot (suivi vs évolution).

---

## 3 · Décision IA — collision `/annuaire-public` vs `/trouver-un-soignant`

### 3.1 État des deux routes

| Critère | `/annuaire-public` | `/trouver-un-soignant` |
|---------|---------------------|------------------------|
| LOC | 188 (root) + 248 (`[slug]`) = 436 | 396 (root) + 47 (layout) = 443 |
| Type | Server component (SEO statique) | Client component (`"use client"`) |
| Source données | Annuaire Santé Ameli/CNAM — 564 000+ praticiens (data.gouv.fr) | `providerDirectoryApi.search()` — soignants Nami enrolled uniquement |
| Palette | Legacy `#4F46E5`, `bg-[#F0F2FA]`, classes Tailwind gray-x00 | Nami DS `#5B4EC4`, `#FAFAF8`, `var(--font-jakarta)` |
| Intent | SEO long tail "diététicien Paris", "pédiatre Lyon" — pages statiques par spécialité × ville | Discovery + demande de connexion par patient connecté |
| JSON-LD | ✅ complet (WebPage + ItemList + BreadcrumbList) | ❌ aucun |
| Sitemap | ✅ `/annuaire-public` + `/annuaire-public/[slug]` × spécialités × villes | ✅ `/trouver-un-soignant` priority 0.9 |
| Liens entrants (sitewide) | Internes au sous-arbre `/annuaire-public/*` uniquement | **10+ surfaces** : `/page.tsx` (homepage CTA), `PublicFooter`, `HomeNav`, `PublicNavbar`, `/pathologies/[slug]` (CTA), `/blog/[slug]` (CTA), `/professions`, sidebar patient (`PatientSidebar.tsx:17`), bottom-nav patient (`PatientBottomNav.tsx:34`), middleware public route |
| Layout web | Navbar inline `nami` lowercase + Login bouton — **incohérent** vs reste site | Hero premium aligné design system |

### 3.2 Recommandation : merger sous `/trouver-un-soignant`

**Raison IA cohérence (I5 + skill nami-information-architecture)** :
- L'utilisateur a UNE seule intention "trouver un soignant". Deux URLs = duplication d'intention IA.
- 10+ surfaces du site pointent déjà vers `/trouver-un-soignant`. Inverser le sens (= migrer tout vers `/annuaire-public`) coûterait plus que migrer le SEO.
- La palette Nami v1.0 est sur `/trouver-un-soignant`. Garder `/annuaire-public` avec `#4F46E5` legacy = dette visuelle qui grossit.

**Plan d'exécution** (à valider Margot avant ticket) :

1. **`/trouver-un-soignant`** devient route canonique applicative et SEO.
2. **`/annuaire-public/[slug]`** (les 16 spécialités × 12 villes × 15 cross) → conserver tant que pages SEO indexées, mais générer un `redirect()` Next.js 301 vers `/trouver-un-soignant?specialty={slug}&city={city}`. Préserve les ~200 URLs déjà dans Google Search Console.
3. **`/annuaire-public` (root)** → 301 vers `/trouver-un-soignant`.
4. **Sitemap.ts** : retirer `/annuaire-public` root, conserver `/annuaire-public/[slug]` durant 6 mois de transition SEO.
5. **`/trouver-un-soignant`** doit gagner :
   - les query params `?specialty=X&city=Y` (lecture URL → setState)
   - le JSON-LD ItemList (héritage `/annuaire-public`)
   - la couverture 564 000+ Ameli derrière un toggle "Soignants Nami uniquement" vs "Tous les soignants France" (mode discovery brand vs mode annuaire ouvert)

**Risque** : la donnée Ameli (564K praticiens) n'est pas dans la même table Prisma que `ProviderProfile` (enrolled Nami). Soit double source + onglet, soit on perd le SEO long tail. **À arbitrer avec Phase 0 Tier 2.**

**Alternative minimale (si pas de bande passante)** : garder les deux, mais retirer `/trouver-un-soignant` de la sidebar patient (déjà disabled) ET retirer `/annuaire-public` des liens publics. Les deux routes vivent en silos. Pas recommandé — dette IA s'accumule.

---

## 4 · Décision sidebar patient (max 8 entrées) + bottom-nav (max 5)

### 4.1 État actuel `PatientSidebar.tsx`

```ts
NAV_ITEMS = [
  Accueil           → /accueil                  ✅
  Trouver soignant  → /trouver-un-soignant      ⏸️ disabled "Bientôt"
  Mes rendez-vous   → /rendez-vous              ✅
  Mon parcours      → /parcours                 ⏸️ disabled "Bientôt"
  Mon suivi         → /suivi                    ⏸️ disabled "Bientôt"
  Mes messages      → /mes-messages             ✅
  Mes documents     → /mes-documents            ✅
]  // 7 entrées
```

`Mon compte` n'est PAS dans sidebar — atteint via `PatientAvatarMenu` (top-right) **ET** bottom-nav Plus menu. Cohérent avec convention web/mobile.

### 4.2 État actuel `PatientBottomNav.tsx`

```ts
PRIMARY = [Accueil, RDV, Parcours⏸, Messages]     // 4 visibles + bouton Plus
SECONDARY_IN_MORE_MENU = [Trouver soignant⏸, Suivi⏸, Documents, Mon compte]  // 4 dans Plus
```

**4 PRIMARY ≤ 5 = conforme norme IA mobile** ✅. **Sidebar 7 items < 8 = conforme** ✅.

### 4.3 Recommandation V1

**Sidebar (web)** — garder 7 entrées :
| # | Label | Route | Statut V1 |
|---|-------|-------|-----------|
| 1 | Accueil | `/accueil` | ✅ |
| 2 | Mes rendez-vous | `/rendez-vous` | ✅ |
| 3 | Mon parcours | `/parcours` | À coder Tier 2 R5 |
| 4 | Mon suivi | `/suivi` | À coder Tier 2 R6 |
| 5 | Mes messages | `/mes-messages` | ✅ |
| 6 | Mes documents | `/mes-documents` | ✅ |
| 7 | Trouver un soignant | `/trouver-un-soignant` | ✅ existe (annuaire public) — **à activer** après décision #3 ci-dessus |

**Décision IA** : `Trouver un soignant` est valide en V1 si la décision #3 (merge annuaire) est tranchée. Sinon, retirer du sidebar (l'annuaire n'a pas besoin d'être dans la nav patient — un patient cherche un nouveau soignant rarement, et le bouton "Prendre RDV" sur `/accueil` ou un bouton secondaire suffit).

**Bottom-nav (mobile)** — garder 4 PRIMARY + Plus :
| # | Label | Route | Notes |
|---|-------|-------|-------|
| 1 | Accueil | `/accueil` | Home par défaut |
| 2 | RDV | `/rendez-vous` | Pluriel implicite — `RDV` est court mobile |
| 3 | Parcours | `/parcours` | À activer |
| 4 | Messages | `/mes-messages` | |
| + | Plus | sheet | contient : Mon suivi, Documents, Trouver soignant, Mon compte |

### 4.4 Anti-pattern à éviter

Le commentaire mémoire `nami-information-architecture` mentionne "tab bar mobile patient à 10 tabs déjà au-dessus norme 5". À l'audit du code actuel **ce risque n'existe PAS** — PatientBottomNav a 4 PRIMARY + 1 More, soit 5 zones visibles. Mémoire potentiellement obsolète OU concerne l'app React Native `nami-mobile/` (audit séparé requis).

---

## 5 · Lacunes F2 multi-profils backend (pour R4 booking mineur)

### 5.1 État backend `prisma/schema.prisma` (côté `~/nami/`)

| Champ / Modèle | Statut | Ligne | Notes |
|----------------|--------|-------|-------|
| `Delegation` polymorphique (G2 F1) | ✅ existe | `4137-4174` | Foundation V1 G2 mergé. `onBehalfOfType` (PERSON/PROVIDER_PROFILE), `onBehalfOfId`, `kind` (LEGAL_GUARDIAN_MINOR / LEGAL_GUARDIAN_PROTECTED / TUTOR / CURATOR / FUTURE_PROTECTION_MANDATE / TRUSTED_PERSON_VIEW_ONLY / CAREGIVER / SECRETARY_DELEGATION / ASSOCIATE_PHYSICIAN), `scopes: DelegationScope[]` incl. `BOOK_APPOINTMENTS` |
| `Person.legalGuardianId` FK directe | ❌ n'existe pas | — | **Pas nécessaire** : couvert par `Delegation` polymorphique. Pas de migration à ajouter |
| `LegalRepresentative` (renommé de `LegalGuardian`) | ❌ pas renommé | — | Modèle legacy `LegalGuardian` toujours présent ligne `2050-2074` avec commentaire « à drop en sprint suivant ». Sprint dédié requis (cleanup + migration) |
| `Appointment.bookedByPersonId` | ❌ **manquant** | `657-713` | **Critique pour R4** : aujourd'hui on a `cancelledByPersonId` mais aucun champ qui dit qui a créé le RDV. Pour un mineur dont la mère prend RDV, on perd la traçabilité |
| `Appointment.bookedByDelegationId` | ❌ **manquant** | — | **Recommandé pour audit RGPD/HDS** : prouver à un instant T qu'un RDV a été pris dans le cadre d'une délégation active. Sinon, la révocation d'une délégation laisse les RDV passés sans contexte |
| `BookingSource` enum | ✅ existe | `668` | `PROVIDER_CREATED / PATIENT_PORTAL / DOCTOLIB / EXTERNAL / SECRETARY`... (à valider valeurs exactes) — couvre la source mais pas l'acteur précis |
| `Delegation.scopes` contient `BOOK_APPOINTMENTS` | ✅ | `4199` | OK |
| Route API `GET /patient/switchable-profiles` | ✅ existe (utilisée par `ProfileSwitcher`) | n/a | Cf. `apiWithToken.patient.switchableProfiles()` utilisé dans `PatientHeader.tsx:22` et `rendez-vous/page.tsx:32` |
| Route API `POST /patient/appointments` avec `onBehalfOf` | ⚠️ partiel | n/a | `appointments.list({ onBehalfOf })` existe en lecture, à vérifier que la création passe aussi le param + valide la délégation côté backend |

### 5.2 Migrations Prisma additionnelles requises pour Tier 2 R4

**Migration #1 — `bookedByPersonId` sur Appointment** (obligatoire R4) :

```prisma
model Appointment {
  // ...
  bookedAt          DateTime?  // optionnel — peut différer de createdAt si import
  bookedByPersonId  String?
  bookedBy          Person?    @relation("AppointmentsBooked", fields: [bookedByPersonId], references: [id])
  bookedByDelegationId String?
  bookedByDelegation   Delegation? @relation(fields: [bookedByDelegationId], references: [id])
}
```

Side-effects :
- Person : ajouter `appointmentsBooked Appointment[] @relation("AppointmentsBooked")`
- Delegation : ajouter `appointmentsBooked Appointment[]`
- Backfill des lignes existantes : `bookedByPersonId = patientId` par défaut (compromise sûr — le patient adulte se prend lui-même son RDV)

**Migration #2 — cleanup LegalGuardian → LegalRepresentative** (NON-bloquante R4) :

Reporter à un sprint dédié post-Tier 2. Le modèle `LegalGuardian` reste utilisé par `PediatricProfile.guardians` (ligne `2036`). Drop nécessite :
- Migration data : `LegalGuardian.* → Delegation` (kind=LEGAL_GUARDIAN_MINOR, scopes={BOOK_APPOINTMENTS,...})
- Refactor `PediatricProfile.guardians` → query sur Delegation
- Réactivation `LegalGuardian` legacy bloquerait le drop, à vérifier

### 5.3 Verdict R4 booking mineur

**F1 G2 a couvert l'essentiel** : la délégation polymorphique est en prod, le scope `BOOK_APPOINTMENTS` existe, `ProfileSwitcher` + `switchableProfiles` côté frontend sont câblés.

**Reste à faire backend avant code R4 frontend** :
1. ✅ Ticket migration `add_booking_audit_trail` : ajouter `Appointment.bookedByPersonId` + `bookedByDelegationId`
2. ✅ Ticket service `AppointmentService.create()` : valider que `delegate` a une `Delegation` active avec `BOOK_APPOINTMENTS` dans `scopes` quand `patientId ≠ requester.personId`
3. ✅ Ticket tests intégration : adulte prenant RDV pour lui (cas trivial) + parent prenant RDV pour mineur (cas R4) + tentative sans délégation → 403
4. ⏸️ Renommage `LegalGuardian` → `LegalRepresentative` : différer sprint dédié

---

## Annexe — Commandes exécutées

```bash
find "src/app/(patient)" -name "page.tsx" -o -name "layout.tsx"
wc -l src/app/\(patient\)/*/page.tsx
grep -rni "surveillance|alerte|détection|risque clinique|monitoring|signaux"
grep -rn "rgba|backdrop-blur" src/app/\(patient\)
grep -rn "Non dispositif médical|outil de coordination"
grep -rn "annuaire-public|trouver-un-soignant" src/
grep -n "legalGuardianId|LegalRepresentative|bookedByPersonId|onBehalfOf" ~/nami/prisma/schema.prisma
```

## Annexe — Fichiers inspectés en lecture intégrale

- `src/app/(patient)/layout.tsx` (42 LOC)
- `src/app/(patient)/accueil/page.tsx` (241 LOC)
- `src/app/(patient)/mes-documents/page.tsx` (132 LOC)
- `src/app/(patient)/mes-messages/page.tsx` (193 LOC)
- `src/app/(patient)/rendez-vous/page.tsx` (168 LOC)
- `src/app/(patient)/mon-compte/page.tsx` (1063 LOC, partial 1-200 + grep MDR)
- `src/components/patient/PatientSidebar.tsx` (67 LOC)
- `src/components/patient/PatientBottomNav.tsx` (159 LOC)
- `src/components/patient/PatientHeader.tsx` (119 LOC)
- `src/app/annuaire-public/page.tsx` (188 LOC)
- `src/app/trouver-un-soignant/page.tsx` (396 LOC, partial)
- `~/nami/prisma/schema.prisma` — `Person` (14-86), `Appointment` (657-713), `LegalGuardian` (2050-2074), `Delegation` + enums (4133-4220)

---

**Livrable Notion attendu** : décisions #1-#5 tranchées par Margot → ouverture tickets d'exécution dans Notion (F2 backend migrations · R1-R6 Tier 2 frontend · Action 3 footer MDR · refonte DS Liquid Glass).
