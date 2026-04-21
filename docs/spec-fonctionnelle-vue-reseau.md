# Spécification fonctionnelle — Vue réseau
> Document de référence pour la refonte UX/UI. Explique le POURQUOI de chaque élément, la logique métier, les sources de données et les routes API. Ne pas redesigner sans avoir lu ce document.

---

## Vue d'ensemble

La Vue réseau est une page à **trois onglets** très distincts dans leur nature et leurs utilisateurs cibles. Ils partagent une URL (`/reseau`) mais servent des besoins différents :

| Onglet | Qui l'utilise | Pour quoi faire |
|--------|--------------|-----------------|
| **Mes réseaux** | Tout soignant | Accéder à ses organisations (CPTS, réseaux, hôpitaux) |
| **Explorer** | Soignant en début de réseau | Découvrir et rejoindre des structures |
| **Réseau de soignants** | Coordinateur, HAP, CPTS référent | Tableau de bord de tous ses patients actifs |

**Pourquoi ces trois onglets sur la même page :** ils forment un continuum logique. Je découvre un réseau (Explorer) → je le rejoins (Mes réseaux) → je coordonne les patients avec mes confrères de ce réseau (Réseau de soignants).

---

## Contexte légal (impact direct sur le design)

L'affichage des organisations est encadré par les mêmes règles que le Hub Réseau (art. R4127-80 et R4127-19-1 CSP) :
- Jamais de classement basé sur un critère payant
- Jamais de badge "Recommandé par Nami"
- L'affiliation CPTS/réseau est affichée parce que **déclarée par le professionnel lui-même**
- Les filtres sont **objectifs** (type, spécialité, ville)

Et les indicateurs dans la vue coordinateur sont **uniquement des métadonnées organisationnelles** (nombre de tâches, présence d'un RDV) — jamais des données cliniques (symptômes, poids, résultats biologiques).

---

## 1. Modèle de données

### Organisation

Une organisation est une structure professionnelle de santé. Elle peut prendre 10 formes différentes :

| Type | Libellé | Description | Couleur UI |
|------|---------|-------------|------------|
| `NETWORK` | Réseau | Réseau clinique pour une pathologie/population | Violet #5B4EC4 |
| `HOSPITAL` | Hôpital | Établissement hospitalier | Teal #2BA89C |
| `HOSPITAL_SERVICE` | Service hospitalier | Service au sein d'un hôpital | Teal #2BA89C |
| `MSP` | MSP | Maison de Santé Pluridisciplinaire | Bleu #4F8FEC |
| `CPTS` | CPTS | Communauté Professionnelle Territoriale de Santé | Vert #10B981 |
| `ASSOCIATION` | Association | Association professionnelle | Amber #F59E0B |
| `PROFESSIONAL_GROUP` | Groupe pro | Groupe de professionnels informel | Gris #6B7280 |
| `CLINIC` | Clinique | Clinique privée | Violet #8B5CF6 |
| `HEALTH_CENTER` | Centre de santé | Centre de santé municipal | Cyan #06B6D4 |
| `PRIVATE_PRACTICE` | Cabinet | Cabinet libéral | Gris #9CA3AF |

**Pourquoi autant de types :** une CPTS et un cabinet privé n'ont pas les mêmes règles d'adhésion, les mêmes implications légales (la CPTS est financée par l'ACI, reconnue par la loi Santé 2016), ni le même niveau de confiance pour un soignant. Ces distinctions sont cliniquement et légalement significatives.

### Champs clés d'une organisation

```
id, name, type                    → Identité
description, specialty            → Contexte
city, address, zipCode, website   → Localisation
isPublic                          → Visible dans l'explorateur ou non
requiresApproval                  → Adhésion libre ou sur approbation
memberCount                       → Calculé dynamiquement
status                            → ACTIVE | SUSPENDED
```

### Adhésion (OrganizationMember)

```
personId + organizationId         → Qui est membre de quoi
memberRole                        → OWNER | ADMIN | PROVIDER | COORDINATOR | VIEWER
status                            → PENDING | ACCEPTED | REJECTED
joinedAt, respondedAt             → Traçabilité
message                           → Message envoyé lors de la demande d'adhésion
```

**Les 5 rôles d'adhésion :**
- `OWNER` : créateur de l'organisation, droits complets
- `ADMIN` : peut approuver des membres, modifier l'organisation
- `PROVIDER` : membre standard (soignant)
- `COORDINATOR` : accès étendu à la vue réseau
- `VIEWER` : accès lecture seule (non encore utilisé en V1)

---

## 2. Onglet 1 — Mes réseaux

### Rôle

Accéder rapidement aux organisations où le soignant est **membre accepté**. Point d'entrée vers les discussions, les membres et les informations de chaque structure.

### Contenu des cards

```
┌────────────────────────────────────┐
│ 🏛   CPTS Paris 14e          [CPTS]│  ← icône type + nom + badge type coloré
│      75014 · 48 membres           │  ← ville + compteur membres
│      3 discussions actives        │  ← si des conversations existent
└────────────────────────────────────┘
```

Clic sur la card → navigue vers `/reseau/[id]`

### État vide

Si aucune organisation rejointe : message "Vous n'avez rejoint aucun réseau" + bouton "Explorer les réseaux" qui bascule sur l'onglet Explorer.

### Chargement

`GET /organizations/mine` — retourne uniquement les organisations avec `status: ACCEPTED`.

---

## 3. Onglet 2 — Explorer

### Rôle

Découvrir les organisations publiques (`isPublic: true`) et en rejoindre de nouvelles. C'est le canal d'acquisition pour les soignants qui arrivent sur Nami et veulent connecter leur réseau existant.

### Filtres

- **Barre de recherche** (par nom ou description, insensible à la casse, debounce)
- **Boutons type** : Tous | Réseau | Hôpital | Service hosp. | MSP | CPTS | Association | Groupe pro

Les filtres s'appliquent en combinaison (recherche + type simultanément).

### Contenu des cards catalogue

```
┌────────────────────────────────────────┐
│ 🕸   Réseau Obésité IDF        [RÉSEAU]│
│      Coordination parcours obésité     │  ← description tronquée
│      Cardiologie · Paris · 34 membres  │  ← spécialité + ville + membres
│      [Adhésion libre]                  │  ← ou [Approbation requise]
│                                        │
│      [Rejoindre]                       │  ← bouton dont l'état change
└────────────────────────────────────────┘
```

### Machine à états du bouton "Rejoindre"

Le bouton a 4 états différents selon la situation :

| État de l'adhésion | Texte du bouton | Action au clic | Couleur |
|-------------------|-----------------|----------------|---------|
| Pas membre + adhésion libre | "Rejoindre" | POST /join → ACCEPTED immédiat | Violet primaire |
| Pas membre + approbation requise | "Demander à rejoindre" | Ouvre la modale | Violet outline |
| Demande en attente (PENDING) | "⏳ Demande en attente" | Aucune (désactivé) | Gris |
| Membre accepté | "Accéder →" | Navigate vers /reseau/[id] | Vert |

**Pourquoi 4 états distincts :** chaque état communique une information différente au soignant. "Demande en attente" lui dit qu'il doit attendre l'approbation d'un admin — si on affiche juste "Rejoindre" à nouveau, il cliquera et créera une deuxième demande en double.

### Modale de demande d'adhésion (approbation requise)

```
┌─────────────────────────────────────┐
│ 🏛  Demande d'adhésion              │
│     CPTS Paris 14e                  │
│                                     │
│ Ce réseau nécessite une approbation.│
│ Votre demande sera transmise        │
│ à l'administrateur.                 │
│                                     │
│ [Message optionnel                  │
│  Votre spécialité, votre structure, │
│  votre motivation...           ]    │
│                                     │
│ [Annuler]  [Envoyer la demande]     │
└─────────────────────────────────────┘
```

**Pourquoi un champ message :** le modérateur de la CPTS ne connaît pas forcément tous les soignants de son territoire. Le message permet au demandeur de se présenter ("Diététicienne libérale dans le 14e, spécialisée TCA, déjà en contact avec Dr. Dupont de votre réseau").

### Effet de bord lors de l'adhésion directe (sans approbation)

À l'acceptation immédiate (`requiresApproval: false`) :
→ L'utilisateur est ajouté à **toutes les conversations** de l'organisation en tant que membre
→ Il peut accéder immédiatement aux discussions depuis `/reseau/[id]`

---

## 4. Onglet 3 — Réseau de soignants (vue coordinateur)

### Rôle et utilisateur cible

Cet onglet est destiné aux **coordinateurs de soins** — soignants qui ont une vision transversale sur plusieurs patients en même temps. Typiquement :
- Diététicienne coordinatrice en réseau obésité
- Infirmière de coordination HAP
- Référent d'une CPTS qui suit les parcours complexes

**Ce que ça résout :** sans cet onglet, un coordinateur doit ouvrir chaque fiche patient une par une pour savoir si quelque chose est en attente. Ici, il voit en un coup d'œil tous ses patients actifs, les tâches en retard, les RDV du jour, et les alertes ouvertes.

### Quels patients apparaissent ici ?

Le tableau agrège tous les CareCases où le soignant connecté est :
- **Lead provider** (`leadProviderId`) — il est le soignant principal
- OU **membre accepté** de la care team (`CareCaseMember.status: ACCEPTED`)

**Ce qui est exclu :** CareCases avec statut ARCHIVED.

### Les 4 KPIs en haut de page

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  42              │ │  3               │ │  5               │ │  2               │
│  Patients actifs │ │  Tâches en retard│ │  RDV aujourd'hui │ │  Rappels ouverts │
│  → /patients     │ │  → /taches       │ │  → /agenda       │ │  → /patients     │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
  #5B4EC4             #D97706 (si >0)       #2BA89C               #DC2626 (si >0)
                      #059669 (si =0)                             #059669 (si =0)
```

**Signification de chaque KPI :**
- `Patients actifs` : nb total de CareCases non archivés dans le réseau
- `Tâches en retard` : somme des tâches avec `dueDate < aujourd'hui` sur tous les patients — si rouge, le coordinateur a des actions urgentes
- `RDV aujourd'hui` : nb de patients avec un RDV ce jour — pour préparer sa journée
- `Rappels ouverts` : somme des indicateurs de complétude ouverts sur tous les patients

**Couleur conditionnelle des KPIs "négatifs" :** quand tâches en retard = 0, la carte passe au vert (#059669) pour signaler que tout est à jour. Ce n'est pas un choix esthétique — c'est un signal d'état du réseau.

### Filtres du tableau

Trois filtres combinables :
1. **Recherche par nom** (prénom + nom du patient)
2. **Type de cas** : Tous | TCA | Obésité | Métabolique | Santé mentale | Pédiatrique | Douleur chronique | Autre
3. **Statut du dossier** : Tous | Actif | En pause | Clôturé | Archivé

### Colonnes du tableau patients

| Colonne | Données | Source | Notes |
|---------|---------|--------|-------|
| Avatar | Initiales sur fond dégradé | Calculé | Pas de photo |
| Nom | Prénom + Nom | Patient | Lien → /patients/[careCaseId] |
| Type | Badge coloré | CareCase.caseType | TCA=violet, Obésité=bleu, etc. |
| Statut | Point coloré + libellé | CareCase.status | ACTIVE=vert, ON_HOLD=amber |
| Âge | Calculé depuis birthDate | Patient | En années |
| Stade | Texte libre | CareCase.careStage | Ex: "Phase 1 — Stabilisation" |
| Tâches | Nb pending | Tasks count | Avec badge "(X en retard)" en orange si overdueTasksCount > 0 |
| Alertes | Nb open | Alerts count | Icône cloche + nb, masqué si 0 |
| Prochain RDV | Date/heure | Appointments | "Auj. 14h00" en violet si aujourd'hui |
| Équipe | Nb membres | CareCaseMember count | Icône users + nb |

**Tri par défaut :** aucun tri imposé — l'ordre reflète la `updatedAt` décroissante (les patients avec activité récente en haut).

### Ce que le tableau N'affiche PAS

- Poids, IMC, observations biologiques → données cliniques, interdites ici (MDR)
- Score de risque calculé par IA → Art. 5 AI Act (scoring social)
- Notes ou résumés de consultation → secret médical
- Historique des séances

**Ce que le tableau affiche :** uniquement des **métadonnées organisationnelles** (nombres, dates, statuts administratifs). Le pied de page le rappelle explicitement :
> "⏱️ Actualisé automatiquement · Indicateurs non cliniques destinés à l'organisation du dossier"

### Auto-refresh

Le tableau se rafraîchit automatiquement **toutes les 60 secondes** en arrière-plan. Le soignant ne le remarque pas (pas de spinner, pas de flash) — les données se mettent à jour silencieusement.

**Pourquoi 60 secondes :** un coordinateur peut laisser cette page ouverte toute la journée comme tableau de bord. Un refresh trop fréquent consommerait des ressources inutilement. Un refresh trop rare ferait manquer les nouveaux RDV du jour ou les tâches qui arrivent à échéance.

---

## 5. Page détail d'une organisation (/reseau/[id])

### Header

- Bouton retour vers /reseau
- Icône + nom de l'organisation + badge type
- Ville + nb membres
- Bouton de statut d'adhésion (même machine à états que dans l'explorateur)

### 4 onglets conditionnels

**Accueil** (visible par tous) :
- Description de l'organisation
- Aperçu des 3 discussions actives (si membre) — titre + nb messages
- Si non membre : message "Rejoignez ce réseau pour accéder au contenu" + bouton rejoindre

**Membres** (membres uniquement) :
- Grille de cards (3 colonnes desktop)
- Chaque card : avatar/initiales, nom, spécialité, rôle dans l'organisation
- **Pas de tri ni de classement** (alphabétique ou ordre d'arrivée uniquement) — conformité R4127-80

**Discussions** (membres uniquement) :
- Liste des conversations de l'organisation
- Titre, aperçu du premier message, nb de messages
- Clic → navigue vers la messagerie de cette conversation

**Infos** (visible par tous) :
- Adresse, site web, type d'adhésion (libre / approbation), nb membres
- Pas d'informations confidentielles pour les non-membres

### Visibilité conditionnelle des onglets

| Onglet | Non membre | Demande en attente | Membre accepté | Admin/Owner |
|--------|-----------|-------------------|----------------|------------|
| Accueil | ✅ (limité) | ✅ (limité) | ✅ (complet) | ✅ (complet) |
| Membres | ❌ | ❌ | ✅ | ✅ |
| Discussions | ❌ | ❌ | ✅ | ✅ |
| Infos | ✅ | ✅ | ✅ | ✅ |

**Pourquoi les discussions sont réservées aux membres :** les conversations professionnelles au sein d'un réseau de santé peuvent contenir des informations sur des patients. L'accès doit être contrôlé.

---

## 6. Cycle de vie d'une adhésion

```
Pas membre
    ↓ (clic "Rejoindre" ou "Demander")
    ├── requiresApproval: false → ACCEPTED directement
    └── requiresApproval: true → PENDING
                                    ↓ (Admin approuve)
                                  ACCEPTED
                                    ↓ (Admin rejette)
                                  REJECTED → peut re-demander
                                  
ACCEPTED → peut quitter (POST /organizations/:id/leave) → plus de membership
```

**Effet de bord ACCEPTED :**
→ Ajout automatique à toutes les conversations de l'organisation
→ La card dans "Mes réseaux" apparaît
→ Dans l'explorateur, le bouton devient "Accéder →"

---

## 7. Routes API complètes

```
GET   /organizations/mine
      → Organisations où l'utilisateur est ACCEPTED
      → Inclut : membres count, conversations actives

GET   /organizations?type=CPTS&search=paris
      → Catalogue public (isPublic: true)
      → Filtre par type + recherche textuelle
      → Inclut myMembership (statut de l'utilisateur connecté)

GET   /organizations/:id
      → Détail complet : membres, conversations, infos
      → Données conditionnelles selon le statut d'adhésion

POST  /organizations/:id/join
      → Body : { message?: string }
      → Si requiresApproval: false → status: ACCEPTED + ajout conversations
      → Si requiresApproval: true  → status: PENDING

POST  /organizations/:id/leave
      → Retrait de l'organisation

PATCH /organizations/:id/members/:memberId
      → Admin uniquement
      → Body : { action: "ACCEPT" | "REJECT" }
      → Si ACCEPT → ajout conversations + status: ACCEPTED + respondedAt

GET   /provider/network-overview
      → Vue coordinateur : stats + liste patients
      → Retourne : { stats: { totalActive, tasksOverdue, appointmentsToday, openAlerts },
                     patients: NetworkPatient[] }
      → Filtre : CareCases où l'utilisateur est lead ou membre accepté
      → Exclut : status ARCHIVED

POST  /organizations
      → Créer une organisation (ADMIN / ORG_ADMIN uniquement)

PATCH /organizations/:id
      → Modifier une organisation (ADMIN / ORG_ADMIN uniquement)
```

---

## 8. Points critiques à ne jamais perdre dans la refonte

1. **Les 3 onglets sont fondamentalement différents** — ne pas les traiter comme 3 vues du même concept. "Mes réseaux" est un annuaire personnel, "Explorer" est un catalogue, "Réseau de soignants" est un tableau de bord opérationnel.

2. **Les 4 états du bouton "Rejoindre"** sont tous nécessaires — un soignant avec une demande en attente qui voit "Rejoindre" va recliquer et créer un doublon. L'état "Demande en attente" est une information, pas un placeholder.

3. **La modale de demande d'adhésion** ne peut pas être supprimée pour les orgs avec `requiresApproval: true` — c'est le canal par lequel le soignant se présente à l'admin.

4. **Les couleurs des types d'organisations** ne sont pas décoratives — elles permettent de scanner visuellement une liste mixte (CPTS vertes, hôpitaux teals, MSP bleues). Un soignant cherchant une CPTS doit pouvoir la trouver en 2 secondes.

5. **Les KPIs en rouge quand > 0** — la couleur conditionnelle des KPIs "tâches en retard" et "rappels ouverts" est fonctionnelle. Rouge = action requise. Vert = tout est à jour. Ne jamais mettre une couleur neutre fixe.

6. **Le tableau coordinateur n'affiche que des métadonnées** — jamais de poids, de biologie, de notes. Si le designer veut "enrichir" le tableau avec des données cliniques pour le rendre "plus utile", ce serait une violation MDR. La mention en pied de page est obligatoire.

7. **L'auto-refresh à 60 secondes** est silencieux — pas de spinner, pas de flash, pas de bandeau "Données mises à jour". Le tableau se met à jour en arrière-plan.

8. **Les onglets Membres et Discussions sont masqués aux non-membres** — pas d'état "grisé mais visible". L'onglet n'existe pas visuellement pour un non-membre.

9. **Pas de classement dans la liste des membres** — les membres d'une organisation doivent être affichés en ordre alphabétique ou d'arrivée, jamais selon un critère de pertinence, d'activité ou de notation (R4127-80).

10. **Le lien entre la vue coordinateur et la fiche patient** — chaque ligne du tableau est cliquable et mène à `/patients/[careCaseId]`. Ce lien doit rester direct et sans friction : c'est le cas d'usage principal (je vois un patient avec 3 tâches en retard, je clique, j'ouvre son dossier).

---

## 9. Opportunités d'amélioration UX

- **Vue kanban pour le coordinateur** : certains coordinateurs gèrent 50+ patients. Une vue kanban par statut (Actif / En pause / À clôturer) pourrait être plus efficace que le tableau.

- **Notification d'approbation** : quand une demande d'adhésion est approuvée, le soignant n'est pas notifié en push — il découvre son nouveau statut en revenant sur la page. Un email ou une notification serait utile.

- **Recherche dans la vue coordinateur** : la recherche actuelle est par nom de patient. Une recherche par soignant ("montrer tous les patients où Dr. Dupont est dans l'équipe") serait utile pour les coordinateurs de réseau.

- **Indicateur de "nouveau"** dans "Mes réseaux" : si un réseau rejoint a publié une nouvelle discussion ou a de nouveaux membres depuis la dernière visite, un badge serait utile.

- **Tri configurable du tableau coordinateur** : permettre au coordinateur de trier par "tâches en retard" (les plus critiques en haut) ou par "prochain RDV" (les prochains RDV en haut) selon son mode de travail.
