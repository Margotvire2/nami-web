# Spécification fonctionnelle — Collaboration (Messages + ProConversations + RCP)
> Document de référence pour la refonte UX/UI. Explique le POURQUOI de chaque élément, la logique métier, les sources de données et les routes API. Ne pas redesigner sans avoir lu ce document.

---

## Clarification préalable : 3 systèmes de communication distincts

Nami a **trois systèmes de communication** qui coexistent et qui n'ont pas le même périmètre, les mêmes règles ni les mêmes utilisateurs :

| Système | Où | Portée | Participants | IA |
|---------|----|---------|-----------|----|
| **Messages** | `/messages` | Un patient précis | Care team de ce patient | Non |
| **Collaboration** (ProConversations) | `/collaboration` | Réseau professionnel | Soignants d'une organisation ou groupe | Non |
| **RCP Virtuelles** | `/patients/[id]/rcp` | Un patient précis | Intervenants sélectionnés | Oui (3 features) |

**Pourquoi trois systèmes séparés :**
- Les **Messages** sont soumis au secret médical (art. L1110-4 CSP) — accès limité à la care team du patient concerné
- La **Collaboration** est de la communication professionnelle générale — pas de données patient
- Les **RCP** sont des réunions collégiales réglementées (art. R4127-33 CSP) — décisions traçables avec CR obligatoire

Un designer qui fusionne ces trois concepts crée un risque juridique réel.

---

## 1. Messages — coordination par patient

### 1.1 Rôle

La messagerie patient permet aux membres de la care team de communiquer sur un patient spécifique, dans le contexte de son dossier. C'est l'équivalent numérique du "peut-on se dire deux mots sur Mme Martin ?" — mais structuré, tracé, et réservé aux soignants qui ont un rôle explicite dans le dossier.

**Ce que ce n'est pas :** un chat général, une messagerie patient-soignant, un canal d'urgence.

### 1.2 Qui peut accéder

Uniquement les membres de la care team avec statut ACCEPTED sur ce CareCase. Ni l'admin technique, ni un soignant d'une autre organisation, ni le patient.

### 1.3 Structure des messages

Deux niveaux :
- **Messages racine** : messages principaux, affichés en ordre chronologique
- **Réponses** : imbriquées sous le message parent via `parentId` (structure arbre)

Chaque message a des **accusés de lecture** individuels (une ligne `MessageRead` par personne par message). Ce n'est pas un "vu" vert comme WhatsApp — c'est une traçabilité interne. On ne montre pas au patient si le soignant a lu.

### 1.4 La bannière anti-urgence (obligatoire)

En bas de l'espace de saisie, une bannière **permanente** amber :

> "Espace de coordination professionnelle — en cas d'urgence patient : 15 ou 112."

**Cette bannière ne peut jamais disparaître.** C'est une exigence légale et éthique. La messagerie Nami n'est pas monitorée en temps réel — un message envoyé à 23h ne sera pas lu avant le lendemain matin. Un soignant qui utilise Nami pour signaler une urgence en pensant que quelqu'un va voir immédiatement met le patient en danger. La bannière est le rappel permanent que ce n'est pas le bon canal.

### 1.5 Notifications push

Quand un message est envoyé, tous les membres de la care team (sauf l'expéditeur) reçoivent une notification push :
- **Contenu :** "[Prénom Nom du soignant] + aperçu 60 caractères du message"
- **Route mobile :** `{ screen: "messages", careCaseId, messageId }`

Les **termes médicaux sont filtrés des notifications** (liste de termes interdits dans le contenu des notifications) pour éviter de faire fuiter des données cliniques dans les aperçus de notification visibles sur l'écran verrouillé.

### 1.6 Temps réel

Socket.io (pas de polling). Événements :
- `message` → nouveau message dans un CareCase
- `message_read` → quelqu'un a lu un message

### 1.7 Layout de la page /messages

**Colonne gauche (280px fixe) :**
- Liste des CareCases avec des messages non lus en priorité
- Preview du dernier message + temps relatif
- Badge de compteur non lus (bleu)
- Recherche par nom de patient ou titre du cas

**Colonne droite :**
- En-tête : avatar patient + nom + badge type de cas
- Séparateurs de date (format français : "lundi 15 avril")
- Bulles : mes messages à droite, ceux des autres à gauche
- Bouton "Répondre" au survol d'un message
- Zone de saisie : textarea multi-lignes (Enter = envoi, Shift+Enter = saut de ligne)
- Bannière anti-urgence permanente

### 1.8 Routes API — Messages

```
POST  /care-cases/:careCaseId/messages
      → Body : { body: string, parentId?: string }
      → Tier requis : COORDINATION
      → Retourne le message créé avec sender + reads + reply count

GET   /care-cases/:careCaseId/messages
      → Messages triés par createdAt asc
      → Optionnel : ?parentId=<id> pour les réponses d'un message

GET   /care-cases/:careCaseId/messages/:id
      → Détail avec arbre de réponses complet

POST  /care-cases/:careCaseId/messages/:id/read
      → Marque comme lu (crée MessageRead)
      → Retourne : { ok: true }

DELETE /care-cases/:careCaseId/messages/:id
      → Soft delete (auteur ou admin uniquement)
```

---

## 2. Collaboration — espaces professionnels (ProConversations)

### 2.1 Rôle

La Collaboration est l'espace de **communication professionnelle sans patient**. Un soignant peut y parler avec ses confrères d'une CPTS, partager des ressources, organiser des formations, coordonner des pratiques — sans jamais mentionner de patient.

**Ce que c'est :** LinkedIn + Slack professionnel pour les soignants d'un même réseau.

**Ce que ce n'est pas :** un dossier patient, un canal d'urgence, un outil de prescription.

### 2.2 Types d'espaces (ProConversation)

| Type | Usage | Création |
|------|-------|---------|
| `DIRECT` | DM 1:1 entre deux soignants | Depuis le profil d'un confrère |
| `GROUP` | Groupe ad hoc informel | Bouton "Créer un espace" |
| `CLINICAL_NETWORK` | Réseau clinique (ex: Réseau TCA Francilien) | Bouton "Créer un espace" |
| `CPTS` | Espace CPTS | Bouton "Créer un espace" |
| `HOSPITAL` | Service hospitalier | Bouton "Créer un espace" |
| `PRACTICE` | Cabinet ou groupe de praticiens | Bouton "Créer un espace" |
| `ALUMNI` | Réseau de formation | Bouton "Créer un espace" |
| `COMMUNITY` | Communauté thématique | Bouton "Créer un espace" |
| `RCP` | **Auto-créé lors de l'ouverture d'une RCP** | Automatique |

Le type `RCP` est particulier : il n'est jamais créé manuellement. Il est créé automatiquement par le backend lorsqu'une RCP Virtuelle est ouverte, pour avoir un espace de discussion associé à la RCP.

### 2.3 Layout de la page /collaboration

**Sidebar gauche (280px fixe) :**

```
[Collaboration]  [+ Créer]
[Barre de recherche]

Mes espaces
├─ 🕸  Réseau TCA Francilien     3 (non lus)
├─ 🏛  CPTS Santé Mental
└─ 🏥  CHU Pédiatrie

Messages directs
├─ (avatar) Dr. Jean Dupont      1
├─ (avatar) Dr. Marie Curie
└─ Aucun message direct
```

- Icônes colorées par type (Réseau = teal, Hôpital = indigo, CPTS = vert…)
- Badge rouge compteur non lus
- Dernier message : temps relatif, aligné à droite
- Espace sélectionné : fond primaire léger

**Zone droite :**
- En-tête : icône + nom + nb membres + description (optionnelle)
- Bannière amber : "Espace de coordination professionnelle — en cas d'urgence : 15 ou 112."
- Messages groupés par date
- Avatar uniquement sur le premier message d'une séquence du même expéditeur
- Heure au survol (niveau groupe)
- Messages système : italique, centré ("RCP ouverte", "Membre ajouté")
- Réactions : emoji + compteur, clic pour toggle

### 2.4 Modale de création d'espace

```
Type (grille 2×3 de boutons avec icônes) :
  [🕸] Réseau clinique    [🏛] CPTS
  [🏥] Hôpital / Service  [🏘] Cabinet
  [🎓] Alumni / Formation [👥] Communauté

Nom * (max 100 caractères)
Description (optionnel, max 500 caractères)

[Annuler]  [Créer l'espace]
```

Le créateur est automatiquement ajouté comme ADMIN de l'espace.

### 2.5 Réactions emoji

Chaque message ProConversation peut recevoir des réactions. Le clic sur un emoji :
- Si je n'ai pas encore réagi avec cet emoji → ajoute ma réaction
- Si j'ai déjà réagi avec cet emoji → retire ma réaction (toggle)

La contrainte d'unicité est `(messageId, userId, emoji)` — un utilisateur ne peut pas réagir deux fois avec le même emoji au même message.

### 2.6 Audit trail

Chaque action sur un ProMessage génère une ligne dans `ProMessageAuditLog` (table insert-only) :
- SENT, READ, DELETED, EDITED

Cette table ne peut pas être modifiée ou supprimée — elle constitue la trace légale des communications professionnelles.

### 2.7 Filtrage des notifications

Termes interdits dans le contenu des notifications push de Collaboration :
`patient`, `résultat`, `bilan`, `urgence`, `douleur`, `symptôme`, `diagnostic`, `traitement`, `ordonnance`

**Pourquoi :** l'espace de collaboration est professionnel et ne devrait pas contenir de données patients. Si un soignant glisse malgré tout un nom de patient dans un message, le terme ne doit pas apparaître dans l'aperçu de notification visible sur l'écran verrouillé d'un téléphone.

### 2.8 Routes API — ProConversations

```
GET   /pro-messages/conversations
      → Liste des espaces de l'utilisateur + dernier message + nb non lus
      → Triés par updatedAt desc

GET   /pro-messages/conversations/:id/messages
      → Messages non supprimés + réactions + expéditeur
      → Triés par createdAt asc

POST  /pro-messages/conversations/:id/messages
      → Body : { content: string, contentType?: "TEXT"|"FILE"|"SYSTEM" }
      → Retourne : ProMessage
      → Side effect : met à jour updatedAt de la conversation + lastReadAt de l'expéditeur

POST  /pro-messages/conversations/new-direct
      → Body : { targetUserId: string }
      → Retourne une conversation existante ou en crée une nouvelle
      → Empêche les DM avec soi-même

POST  /pro-messages/conversations/new-group
      → Body : { name, description?, memberIds[], type? }
      → Créateur auto-ajouté comme ADMIN
      → Retourne : ProConversation

PATCH /pro-messages/conversations/:id/read
      → Met à jour lastReadAt du membre → efface les non lus

DELETE /pro-messages/messages/:id
      → Soft delete (auteur ou admin uniquement)

POST  /pro-messages/messages/:id/reactions
      → Body : { emoji: string }
      → Toggle : existe → supprime | n'existe pas → crée
      → Retourne : { action: "added" | "removed" }
```

---

## 3. RCP Virtuelles — réunions de concertation pluridisciplinaire

### 3.1 Rôle et contexte légal

Une RCP (Réunion de Concertation Pluridisciplinaire) est une réunion collégiale où plusieurs spécialistes se prononcent collectivement sur la prise en charge d'un patient. Elles sont réglementées par l'art. R4127-33 CSP et génèrent un **compte rendu obligatoire** qui doit être versé au dossier.

**Ce que Nami ajoute :** le mode asynchrone. Une RCP classique réunit tout le monde en salle à la même heure. Une RCP Virtuelle sur Nami permet à chaque participant de donner son avis dans un délai donné (routine = 7 jours, urgent = 48h) depuis son agenda, sans synchronisation préalable. L'IA synthétise les avis et génère un brouillon de CR.

**Obligation de traçabilité :** chaque opinion est stockée comme une `ClinicalNote` (type `RCP_OPINION`), immuable. La décision finale est stockée comme une `ClinicalNote` (type `RCP_CONCLUSION`). Ces données ne peuvent pas être supprimées.

### 3.2 Les 5 statuts d'une RCP

```
OPEN          → Ouverte, en attente d'avis
IN_PROGRESS   → Au moins un avis reçu, pas encore tous
PENDING_DECISION → Tous les participants ont répondu, en attente de la décision
CLOSED        → Décision prise, CR généré, tâches créées
CANCELLED     → Annulée par l'initiateur
```

La transition `IN_PROGRESS` → `PENDING_DECISION` est **automatique** dès que tous les participants ont donné leur avis.

### 3.3 Les 3 niveaux d'urgence

| Urgence | Délai par défaut | Signification |
|---------|-----------------|---------------|
| `ROUTINE` | +7 jours | Coordination non urgente |
| `URGENT` | +48 heures | Décision rapide nécessaire |
| `EMERGENCY` | Immédiat | Situation critique |

L'urgence définit la deadline suggérée mais ne bloque pas — le système ne ferme pas automatiquement une RCP après la deadline (c'est l'initiateur qui décide).

### 3.4 Les 4 positions d'avis

Chaque participant choisit une position avant de rédiger son avis :

| Position | Couleur | Signification |
|----------|---------|---------------|
| `AGREE` | Vert | Je suis d'accord avec l'orientation proposée |
| `DISAGREE` | Rouge | Je ne suis pas d'accord |
| `NEUTRAL` | Gris | Je n'ai pas de position tranchée |
| `NEED_MORE_INFO` | Amber | Il me manque des informations pour me prononcer |

Ces positions ne sont pas des votes binaires — un participant "neutre" ou "besoin d'info" est tout aussi valuable qu'un accord/désaccord. La synthèse IA tient compte de toutes les nuances.

### 3.5 Les 3 modes de décision

À la clôture, l'initiateur choisit le mode de décision :

| Mode | Signification |
|------|--------------|
| `CONSENSUS` | Tous étaient d'accord |
| `MAJORITY` | La majorité était d'accord (décision majoritaire) |
| `INITIATOR_DECISION` | L'initiateur tranche (désaccord non résolu) |

Ce mode apparaît dans le CR et dans la note de conclusion — il donne au lecteur le contexte de la décision.

### 3.6 Création d'une RCP (wizard)

```
Titre *
  ex: "RCP Gabrielle — Reprise pondérale M3"

Type + Urgence (deux colonnes)
  Asynchrone | Synchrone (visio)
  Routine (7j) | Urgent (48h) | Urgence (immédiat)

Date limite (si asynchrone) ou date de visio (si synchrone)

Contexte clinique
  ☐ Générer via IA
  [Textarea — ou laissé vide pour génération IA]

Questions posées à l'équipe
  [Input + bouton "Ajouter"]
  • Faut-il envisager une hospitalisation ?  ✕
  • L'objectif pondéral est-il réaliste ?    ✕

Participants * (checkboxes — membres de la care team)
  ☑ Dr. Jean Dupont — Psychiatre
  ☐ Marie Curie — Psychologue
  ☑ Paul Martin — Médecin généraliste
```

**L'option "Générer le contexte via IA"** charge les 15 dernières observations et 5 alertes du patient et génère une synthèse factuelle de 3 phrases. Ce brouillon peut être modifié avant d'ouvrir la RCP.

### 3.7 Vue liste des RCP (dans la fiche patient)

**Deux sections :**

**En cours** (statuts OPEN, IN_PROGRESS, PENDING_DECISION) :
```
┌─────────────────────────────────────────┐
│ RCP Gabrielle — Reprise pondérale M3   │
│ [URGENT] [ASYNCHRONE]  ⏳ Mon avis attendu│
│ "Contexte : patiente de 15 ans..."     │  ← 2 lignes max
│ 2/4 avis · Échéance : 18 avr.         │
└─────────────────────────────────────────┘
```

**Historique** (statuts CLOSED, CANCELLED) :
```
┌─────────────────────────────────────────┐
│ RCP Janvier 2025 — Bilan 6 mois        │
│ [CLÔTURÉE] ✅ Consensus                │
└─────────────────────────────────────────┘
```

Le badge "⏳ Mon avis attendu" est visible uniquement si je suis participant et que je n'ai pas encore donné mon avis. C'est l'information la plus importante pour que le soignant ne laisse pas traîner sa participation.

### 3.8 Vue détail d'une RCP

**Header :**
- Titre + statut + urgence + type (ASYNC/SYNC) + initiateur
- Deadline ou date de visio (si non clôturée)
- Boutons d'action selon le statut (voir §3.9)
- Barre de progression : "Participation : N/M avis reçus" avec avatars (vert = a répondu, gris = en attente)

**Layout 2 colonnes :**

**Colonne gauche — Contexte :**
1. **Contexte & Questions** (collapsible) : texte de contexte + liste numérotée des questions
2. **Indicateurs actifs** (si applicable) : badges de complétude du dossier — **pas d'alertes cliniques**
3. **Dernières mesures** : 15 dernières observations (label | valeur | unité | date)
4. **Synthèse IA** (si générée) : carte violette avec icône ✨, markdown avec 3 sections (convergences, divergences, recommandation)

**Colonne droite — Avis & Décision :**
1. **Avis collectés** : par participant — position badge + texte + date
2. **Formulaire d'avis** (si pas encore donné + RCP non clôturée) : 4 boutons position + textarea + "Envoyer mon avis"
3. **Décision collégiale** (si clôturée) : carte verte + mode de décision + texte markdown de la décision

### 3.9 Boutons d'action selon le statut

| Statut | Initiateur | Participant | Non-participant |
|--------|-----------|-------------|----------------|
| OPEN | Clôturer · Annuler | Donner mon avis | Lecture seule |
| IN_PROGRESS | Synthèse IA · Clôturer · Annuler | Donner/modifier mon avis | Lecture seule |
| PENDING_DECISION | Synthèse IA · Brouillon CR IA · Clôturer · Annuler | Voir les avis | Lecture seule |
| CLOSED | Exporter PDF | Exporter PDF | — |
| CANCELLED | — | — | — |

### 3.10 Clôture d'une RCP

La clôture est l'étape la plus riche fonctionnellement. L'initiateur :

1. Saisit la **décision finale** (markdown, obligatoire)
2. Choisit le **mode de décision** (CONSENSUS / MAJORITY / INITIATOR_DECISION)
3. Peut ajouter des **actions** (tâches) à créer automatiquement :
   - Titre + description + assignée à + date limite + priorité
4. Clique "Clôturer et générer le CR"

**Ce qui se passe automatiquement :**
- Statut → CLOSED, `closedAt` = maintenant
- Note `RCP_CONCLUSION` créée (auto-formatée en markdown, versée au dossier)
- `Task` records créés pour chaque action (assignés aux soignants désignés)
- Message système dans la ProConversation associée : "RCP clôturée — Décision (mode) : [extrait]"
- `conclusionNoteId` + `taskIds` mis à jour dans le record RCP

### 3.11 Les 3 features IA de la RCP

#### Feature 1 — Génération du contexte clinique

**Déclencheur :** case à cocher "Générer via IA" dans le wizard de création

**Entrées (pseudonymisées) :**
- Titre + type + motif principal + niveau de risque du CareCase
- 15 dernières observations (label + valeur + unité)
- 5 alertes ouvertes (sévérité + titre)

**Sortie :** résumé factuel de 3 phrases maximum (300 tokens max)

**Sécurité :** non-diagnostique, ne mentionne jamais de risque, uniquement des faits observés. Fail-silent si l'API Claude est indisponible (retourne une chaîne vide, le soignant remplit manuellement).

#### Feature 2 — Synthèse des avis (Synthèse clinique)

**Déclencheur :** bouton "Synthèse clinique" (disponible dès qu'il y a au moins un avis)

**Entrées :**
- Tous les avis `RCP_OPINION` (positions + textes)
- Noms des auteurs **anonymisés** avant envoi à Claude ("Avis 1", "Avis 2"…)

**Sortie markdown en 3 parties :**
1. Points de convergence (ce sur quoi tout le monde s'accorde)
2. Divergences et incertitudes (points de désaccord)
3. Recommandation de décision (suggestion de l'IA)

**Affichage :** carte violette avec ✨ dans la colonne gauche du détail RCP

**Ce qui ne peut jamais disparaître :** la mention "Synthèse IA — à valider" sur cette carte.

#### Feature 3 — Brouillon de compte rendu (Brouillon CR IA)

**Déclencheur :** bouton "Brouillon CR IA" (disponible à l'initiateur, RCP non clôturée)

**Entrées (pseudonymisées) :**
- Contexte complet du patient via `buildFullContext` (notes, observations, timeline — max 2500 chars)
- Questions de la RCP
- Tous les avis (noms anonymisés)

**Sortie markdown structurée en 6 sections :**
```
1. Date et participants (à compléter)
2. Contexte clinique
3. Questions soumises à l'équipe
4. Synthèse des avis
5. Décision proposée (brouillon à valider)
6. Plan d'action
```

**Affichage :** modale "Brouillon CR — à vérifier et valider"

**Bannière obligatoire (AI Act Art. 50 + MDR) :**
> "Brouillon IA — validation humaine obligatoire avant tout usage"

**Action disponible :** "Utiliser comme décision" → pré-remplit le champ décision dans la modale de clôture. L'initiateur doit tout de même valider explicitement.

#### Pseudonymisation RGPD dans les 3 features

Avant tout appel à Claude, les données nominatives (nom du patient, nom des participants) sont anonymisées. Seules les données cliniques (valeurs, dates, textes d'avis) sont transmises. C'est une obligation Art. 4(5) RGPD.

### 3.12 Export PDF

**Bouton "Exporter PDF"** disponible une fois la RCP clôturée (ou si `draftCr` est présent).

**Contenu du PDF :**
- En-tête : titre de la RCP + patient (anonymisé ou nom si consenti) + date
- Section contexte clinique
- Questions posées
- Avis par participant (position + texte)
- Décision collégiale + mode
- Plan d'action (tâches créées)

**Nom du fichier :** `CR_RCP_{NomPatient}_{date}.pdf`

### 3.13 ProConversation auto-créée avec chaque RCP

À l'ouverture d'une RCP, une ProConversation de type `RCP` est automatiquement créée. Elle sert d'espace d'échange libre entre les participants en marge des avis formels.

Messages système automatiques dans cette conversation :
- À l'ouverture : "RCP ouverte : [titre]"
- À chaque avis reçu : "[Prénom Nom] a donné son avis"
- À la clôture : "RCP clôturée — Décision ([mode]) : [extrait]"
- À l'annulation : "RCP annulée"

### 3.14 Routes API — RCP

```
POST  /care-cases/:careCaseId/rcps
      → Créer une RCP
      → Body : { title, rcpType?, urgency?, context?, questions?,
                 participantIds, deadline?, scheduledAt?, generateContext? }
      → Crée automatiquement une ProConversation de type RCP
      → Poste un message système dans la conversation

GET   /care-cases/:careCaseId/rcps
      → Liste des RCP du dossier
      → Retourne : RcpSummary[] avec { opinionsCount, myOpinionGiven, waitingForMyOpinion }

GET   /rcps/:id
      → Détail complet de la RCP
      → Retourne : { ...RcpSummary, opinions[], alerts[], observations[], participants[], canClose }
      → Auth : initiateur ou participant uniquement

POST  /rcps/:id/opinions
      → Donner ou mettre à jour son avis
      → Body : { content, position?: "AGREE"|"DISAGREE"|"NEUTRAL"|"NEED_MORE_INFO" }
      → Crée ou met à jour une ClinicalNote (type: RCP_OPINION)
      → Si tous les participants ont répondu → auto-transition PENDING_DECISION
      → Poste message système dans la conversation

POST  /rcps/:id/close
      → Clôturer la RCP (initiateur uniquement)
      → Body : { decision, decisionType, actions?: [{title, assignedToPersonId?, dueDate?, priority?}] }
      → Crée ClinicalNote (type: RCP_CONCLUSION)
      → Crée les Task records depuis actions[]
      → Poste message système dans la conversation
      → Retourne : { rcp, conclusionNote, tasksCreated }

POST  /rcps/:id/summarize
      → Générer la synthèse IA des avis
      → Anonymise les auteurs avant envoi à Claude
      → Stocke dans Rcp.aiSummary
      → Retourne : { aiSummary: string }

POST  /rcps/:id/draft-cr
      → Générer le brouillon de CR
      → Charge le contexte complet du patient (buildFullContext)
      → Anonymise avant envoi à Claude
      → Stocke dans Rcp.draftCr
      → Retourne : { draft: string }

POST  /rcps/:id/cancel
      → Annuler la RCP (initiateur uniquement)
      → Poste message système dans la conversation

PATCH /rcps/:id
      → Modifier une RCP ouverte (initiateur uniquement)
      → Body : { title?, urgency?, context?, questions?, deadline?, participantIds? }
      → Interdit si CLOSED ou CANCELLED

GET   /rcps/:id/export-pdf
      → Télécharger le PDF du CR
      → Requiert : draftCr OU decision
      → Content-Type: application/pdf
```

---

## 4. Comparaison des trois systèmes

| | Messages | Collaboration | RCP |
|--|----------|---------------|-----|
| **Portée** | Un patient | Réseau professionnel | Un patient |
| **Participants** | Care team du patient | Membres de l'espace | Sélectionnés par l'initiateur |
| **Données patient** | Oui (contexte care case) | Non (interdit) | Oui (contexte clinique) |
| **Threading** | Racine + réponses imbriquées | Linéaire (pas de threads) | Avis structurés + décision |
| **IA** | Non | Non | Oui (3 features) |
| **Export** | Non | Non | PDF du CR |
| **Temps réel** | Socket.io | Socket.io | Socket.io (via ProConversation) |
| **Audit** | ActivityLog | ProMessageAuditLog | ClinicalNote (immuable) |
| **Cadre légal** | Art. L1110-4 CSP | Communication pro | Art. R4127-33 CSP |

---

## 5. Points critiques à ne jamais perdre dans la refonte

1. **La bannière anti-urgence est obligatoire** sur Messages ET Collaboration — permanente, jamais en tooltip, jamais masquable. Sa suppression est une faute éthique.

2. **Les 3 systèmes ne peuvent pas être fusionnés** — Messages (care case), Collaboration (réseau pro) et RCP (décision collégiale) ont des règles d'accès, des données et des obligations légales différentes.

3. **Les avis RCP sont immuables** — stockés comme ClinicalNote, ils ne peuvent pas être supprimés. L'UI peut permettre une "mise à jour" (qui crée une nouvelle version) mais pas une suppression.

4. **La transition PENDING_DECISION est automatique** — quand tous les participants ont répondu, le statut change sans action de l'initiateur. L'UI doit refléter ce changement en temps réel (polling ou socket).

5. **Le badge "⏳ Mon avis attendu"** est l'élément le plus important de la liste de RCP — c'est ce qui pousse le soignant à agir. Ne pas le réduire à un détail typographique.

6. **La bannière "Brouillon IA"** sur le brouillon de CR est obligatoire légalement (AI Act Art. 50 + MDR) — jamais en gris clair, jamais masquable.

7. **L'export PDF** n'est disponible qu'après clôture (ou si draftCr existe) — ne pas proposer un export de RCP en cours, ce serait un brouillon incomplet présenté comme un CR officiel.

8. **La ProConversation RCP est auto-créée** — il ne faut jamais demander à l'utilisateur de créer manuellement un espace de discussion pour une RCP. C'est automatique.

9. **Les termes médicaux filtrés dans les notifications** de Collaboration ne doivent pas être contournés côté UI — si un message contient un terme interdit, la notification est envoyée mais son contenu est tronqué/remplacé.

10. **Le mode de décision (CONSENSUS / MAJORITY / INITIATOR_DECISION)** doit apparaître dans le CR et dans la liste — il donne le contexte de la décision aux soignants qui consulteront le dossier plus tard.

---

## 6. Opportunités d'amélioration UX

### Messages
- **Indicateur "en train d'écrire"** : visible dans les autres systèmes de messagerie modernes, absent ici
- **Recherche dans les messages** : trouver un message d'il y a 3 semaines est impossible actuellement

### Collaboration
- **Notifications en cloche** pour les mentions (@nom) qui devraient être plus proéminentes que les messages ordinaires
- **Pinning de messages** importants (annonce, ressource) dans un espace réseau

### RCP
- **Rappel automatique** aux participants qui n'ont pas donné leur avis à J-1 de la deadline
- **Comparaison d'avis côte à côte** : voir les positions de tous les participants d'un coup d'œil (tableau plutôt que liste)
- **Modèles de RCP** : une RCP "bilan à 3 mois TCA" avec les questions pré-remplies éviterait de retaper les mêmes questions à chaque fois
