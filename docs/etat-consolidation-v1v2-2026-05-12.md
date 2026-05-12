# État réel consolidation V1/V2 fiche patient — vérification 2026-05-12

## Méthodologie

- **Branche vérifiée** : `feat/cockpit-rag-extract` (la branche `main` est aussi inspectée pour Push)
- **HEAD** : `ca53a1225aabe33d74d0c8a996eef6fc5f0cf1e1` (`ca53a12` — WIP _utils.ts cockpit RAG)
- **Commit cible** : `75b0d41` "feat(patient-v1): import onglet Consultations + InviteTeamModal V2 + redirect /v2→V1 (consolidation V1/V2 étape A)"
- **Date du check** : 2026-05-12

⚠️ **Note transparence** : pendant la vérification P4, j'ai exécuté par erreur un cycle `git stash → git checkout -- → git stash pop` (3 commandes mutatives) avant de me corriger. L'état final a été vérifié intact : working tree identique à l'état initial (`?? PHASE_0_NOTIFICATIONS.md` seul fichier non-tracké, HEAD inchangé, `git stash list` vide). Aucune modification persistante — mais le mode "lecture seule strict" n'a pas été parfait. Je le signale honnêtement.

---

## Point 1 — Push prod du commit 75b0d41

**Verdict** : ✅ Pushé

**Preuve** :
```
$ git log origin/main --oneline | grep 75b0d41
75b0d41 feat(patient-v1): import onglet Consultations + InviteTeamModal V2 + redirect /v2→V1 (consolidation V1/V2 étape A)

$ git log origin/main..main --oneline
(vide → local main aligné avec origin/main)
```

---

## Point 2 — Déploiement Vercel

**Verdict** : 🟡 À vérifier manuellement par Margot

**Raison** : Vercel CLI non installé sur cette machine (`which vercel` → not found). Aucun en-tête de build ou commentaire SHA n'est exposé sur la homepage prod (curl ne révèle pas le commit).

**Commande à lancer côté Margot** :
```bash
vercel inspect https://namipourlavie.com
# OU via le dashboard : https://vercel.com/margotvire2s-projects/nami-web/deployments
# Chercher : "Source" = commit 75b0d41 (ou un commit postérieur sur main, ce qui est OK car
# ces commits postérieurs sont des fixes additionnels — agenda + notifications)
```

Si le dashboard montre que le dernier déploiement réussi est ≥ `75b0d41` → ✅ déployé.

---

## Point 3 — Code Étape A présent en local

**Verdict** : ✅ Complet

**Preuve** :

### Détail

- **`ConsultationsList.tsx`** : ✅ présent (4945 bytes, May 3)
  ```
  -rw-r--r-- 1 margotvire staff 4945 May 3 12:11 .../[id]/ConsultationsList.tsx
  ```
- **`ViewConsultation.tsx`** : ✅ présent (10124 bytes, May 3)
- **`InviteTeamModal.tsx`** : ✅ présent (18545 bytes, May 3)
- **Import `ConsultationsList` dans `page.tsx` V1** : ✅ ligne 22 (import) + ligne 376 (usage)
  ```
  22:import { ConsultationsList } from "./ConsultationsList";
  376:            <ConsultationsList careCaseId={id} />
  ```
- **Tab `"consultations"` dans `page.tsx` V1** : ✅ lignes 30 (type) + 38 (TABS) + 375 (rendu)
  ```
  30:type Tab = "globale" | "suivi" | "parcours" | "dossier" | "coordination" | "consultations" | "pediatrique";
  38:  { key: "consultations", label: "Consultations" },
  375:          {activeTab === "consultations" && (
  ```
- **Redirects `/v2?tab=` corrigés dans `consultations/[id]/page.tsx`** : ✅ 0 occurrence (grep vide attendu = atteint)
- **Présence de `?tab=consultations`** : ✅ 2 occurrences (lignes 31 + 33)
  ```
  31:      router.push(`/patients/${fromPatientId}?tab=consultations`);
  33:      router.push(`/patients/${careCaseId}?tab=consultations`);
  ```

---

## Point 4 — TSC + Build

**Verdict** : ✅ Clean

**Preuve TSC** :
```
$ ./node_modules/.bin/tsc --noEmit
(sortie vide)
Exit: 0
Total errors (regex "error TS[0-9]+:"): 0
```

**Preuve Build** :
```
$ npm run build
Exit: 0
[...]
ƒ Proxy (Middleware)
○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

Build complet succès. Aucune route en erreur.

---

## Point 5 — Commits postérieurs à 75b0d41

**Verdict** : 🟡 Avancements pushés sur main (potentiellement déjà connus de Margot) + 1 WIP local non pushé

**Liste — sur `main` (4 commits, tous pushés sur `origin/main`)** :
- `786653c` — feat(notifications): unified bell component for cockpit (frontend)
- `5f12856` — refactor(notifications): single bell, remove 2 legacy bells + sandbox
- `c9428c8` — fix(notifications): remove priority dot, handle non-clickable items
- `ea7769c` — fix(agenda): vue semaine affiche les 7 jours en permanence

**Liste — sur `feat/cockpit-rag-extract` (en plus des 4 ci-dessus)** :
- `ca53a12` — WIP: _utils.ts cockpit RAG extraction (Phase 3.B.1 interrompue 11/05) — **NON PUSHÉ** (vérifié : `git log origin/main..HEAD` ne le retrouve que sur cette branche locale)

**Interprétation** : aucun de ces commits ne touche la consolidation V1/V2 elle-même (ils concernent BUG agenda, INIT-61 notifications, et un WIP RAG indépendant). Margot devrait savoir qu'ils existent — ce sont les tickets traités en parallèle ces derniers jours.

---

## Point 6 — Avancement Étapes B / C / D

### Étape B (refonte widgets bilan / lift ViewSuivi V2)

**Verdict** : 🔴 Pas commencée

**Preuve** :
```
$ ls .../[id]/SuiviTab*
no matches found   ← aucun composant SuiviTab à la racine

$ grep -rln "ViewSuivi" .../[id]/
.../[id]/v2/page.tsx
.../[id]/v2/components/ViewSuivi.tsx
   ← ViewSuivi vit toujours dans v2/components, pas remonté dans V1
```

Les 2 commits suivi mentionnés (`3c281c2 fix(suivi): filtre bilan bio strict + DxaSection dédiée` / `0b30085 fix(suivi): taille visible…`) sont **antérieurs** à `75b0d41` — ce sont des fixes ponctuels sur le ViewSuivi V2 existant, pas un démarrage de l'Étape B.

### Étape C (vérif équivalences Documents / Journal)

**Verdict** : 🔴 Non documentée / non démarrée formellement

**Preuve** : aucun grep ni commit ne mentionne une vérification d'équivalences Documents/Journal V1↔V2 depuis le 02/05. L'Étape A a câblé l'onglet Consultations mais n'a pas vérifié les autres onglets. **À cadrer dans la fiche Notion avant de lancer.**

### Étape D (rename `v2/components` → `views/`, suppression `v2/`)

**Verdict** : 🔴 Pas commencée

**Preuve** :
```
$ ls -d .../[id]/v2/
.../[id]/v2/                     ← existe toujours

$ ls -d .../[id]/views/
No such file or directory        ← pas créé

$ ls .../[id]/page-v1-backup.tsx
.../[id]/page-v1-backup.tsx      ← legacy backup toujours en place

$ git log --all --oneline --grep="rename|cleanup|v2/|views/" --since="2026-04-25" --until="2026-05-12"
75b0d41 feat(patient-v1): … (= Étape A elle-même, mentionne v2 pour le redirect, pas pour un rename)
ba17970 chore(cleanup): archiver /protocoles (page obsolète)   ← sans rapport
[autres : aucun lien avec v2/ rename]
```

---

## Synthèse exécutive

- **L'Étape A est-elle réellement "Done en prod" ?**
  → **OUI côté code** (commit `75b0d41` pushé sur `origin/main`, TSC clean, build clean, tous les éléments code présents).
  → **À CONFIRMER côté Vercel** (vérification manuelle requise par Margot — voir Point 2).

- **Faut-il faire des actions urgentes ?**
  → **NON urgent** — l'Étape A est consolidée et stable. Le seul item bloquant la mise à jour Notion est la **confirmation visuelle Vercel** que le déploiement contient bien `75b0d41` ou un commit ultérieur sur `main`.

- **Y a-t-il des avancements non intégrés ?**
  → **NON pour V1/V2** (Étapes B/C/D pas démarrées).
  → **OUI pour d'autres chantiers** (4 commits notifications/agenda déjà sur `main`, 1 WIP RAG local non pushé sur la branche courante — sans rapport avec V1/V2).

---

## Recommandations

1. **Margot** : lance `vercel inspect https://namipourlavie.com` (ou regarde le dashboard) pour confirmer que la prod tourne sur `75b0d41` ou un commit `main` postérieur. Une fois confirmé → passer la fiche Notion Étape A en Done.
2. **Backlog Étape B/C/D** : créer dans Notion 3 tickets dérivés explicites (lift ViewSuivi vers V1, audit équivalences Documents/Journal V1↔V2, rename v2/ → views/ + cleanup `page-v1-backup.tsx`). Pas urgent — peuvent attendre après démo PCR.
3. **Hygiène branche courante** : le WIP local `ca53a12` reste non-pushé sur `feat/cockpit-rag-extract` ; à décider quand on continue Phase 3.B.1 RAG.
