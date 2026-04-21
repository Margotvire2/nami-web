# Spécification fonctionnelle — Adressages (Références médicales)
> Document de référence pour la refonte UX/UI. Explique le POURQUOI de chaque élément, la logique métier, les sources de données et les routes API. Ne pas redesigner sans avoir lu ce document.

---

## Vue d'ensemble

L'adressage est **le cœur fonctionnel de Nami**. Toute la raison d'être de la plateforme tient dans cette fonctionnalité : permettre à un soignant de passer la main à un confrère de façon structurée, traçable et conforme, sans passer par SMS ou email non sécurisé.

**Avant Nami :** le soignant envoyait un courrier papier, appelait le confrère, ou laissait un message. La suite du parcours disparaissait dans un trou noir — le soignant expéditeur ne savait jamais si le patient avait vraiment été reçu.

**Avec Nami :** chaque adressage a un état, une priorité, un historique. Le soignant expéditeur suit l'avancement en temps réel : accepté → patient contacté → RDV pris → première consultation effectuée.

---

## 1. Les deux modes d'adressage

### Mode DIRECT
Le soignant cible un confrère précis. Il sélectionne "Dr. Dupont, psychiatre" et lui envoie directement la demande.

**Quand l'utiliser :** le soignant a déjà un réseau, il sait exactement à qui adresser.

### Mode POOL (diffusion)
Le soignant diffuse la demande à plusieurs confrères en parallèle. Le premier à accepter prend en charge.

**Quand l'utiliser :** le soignant cherche n'importe quel psychiatre disponible rapidement dans la zone. Utile pour l'urgence ou quand le réseau est encore à construire.

**Règle "premier arrivé" :** dès qu'un candidat accepte, l'adressage passe à ACCEPTED. Les autres candidats ne sont pas notifiés de ce refus implicite — ils peuvent toujours voir l'adressage dans leur liste mais l'action "Accepter" sera bloquée.

---

## 2. Les trois niveaux de priorité

| Priorité | Délai attendu | Cas d'usage |
|----------|--------------|-------------|
| **ROUTINE** | 4 à 6 semaines | Suivi planifié, coordination standard |
| **URGENT** | Sous 15 jours | Diagnostic récent nécessitant un spécialiste rapidement |
| **EMERGENCY** | 48 à 72 heures | Situation aiguë, risque potentiel d'hospitalisation |

**Impact UX :** les adressages EMERGENCY doivent être immédiatement visibles dans la liste du destinataire. La couleur et la position dans la liste (toujours en tête) ne sont pas un choix esthétique — ils ont un impact clinique direct.

---

## 3. La machine à états (12 statuts)

### Schéma des transitions

```
DRAFT
  ↓ (expéditeur envoie)
SENT
  ↓ (destinataire voit)
RECEIVED
  ↓ (destinataire examine)
UNDER_REVIEW
  ↓
 ┌─────────────────────────────┐
 ↓                             ↓
ACCEPTED                   DECLINED ✖ (terminal)
  ↓ (expéditeur suit)
PATIENT_CONTACTED
  ↓
APPOINTMENT_INVITED
  ↓
APPOINTMENT_BOOKED
  ↓
FIRST_VISIT_COMPLETED ✓ (terminal — succès)

À tout moment (tant que non terminal) :
CANCELLED ✖ (terminal — expéditeur annule)
EXPIRED ✖ (terminal — délai dépassé)
```

### Signification clinique de chaque statut

| Statut | Qui agit | Signification réelle |
|--------|----------|---------------------|
| **DRAFT** | Expéditeur | Brouillon non envoyé |
| **SENT** | — | Demande envoyée, pas encore vue |
| **RECEIVED** | Destinataire | Destinataire a ouvert la demande |
| **UNDER_REVIEW** | Destinataire | Examen en cours (consultation de son agenda, etc.) |
| **ACCEPTED** | Destinataire | Accepte de prendre en charge |
| **DECLINED** | Destinataire | Refuse (terminal) |
| **PATIENT_CONTACTED** | Expéditeur | Le destinataire a contacté le patient |
| **APPOINTMENT_INVITED** | Expéditeur | RDV proposé au patient |
| **APPOINTMENT_BOOKED** | Expéditeur | RDV confirmé avec date |
| **FIRST_VISIT_COMPLETED** | Expéditeur | Première consultation effectuée (terminal — succès) |
| **EXPIRED** | Système | Délai expiré sans réponse (terminal) |
| **CANCELLED** | Expéditeur | Annulé par l'expéditeur (terminal) |

**Pourquoi 12 statuts et pas 3 (envoyé/accepté/terminé) :** parce que chaque statut intermédiaire déclenche des actions différentes et que l'expéditeur a besoin de savoir PRÉCISÉMENT où en est la coordination. "Accepté" et "RDV pris" sont deux états très différents — l'un montre que le confrère est d'accord, l'autre que le patient a vraiment un rendez-vous.

### Statuts terminaux — ne jamais proposer un retour en arrière

DECLINED, EXPIRED, CANCELLED et FIRST_VISIT_COMPLETED sont **irréversibles**. L'UI ne doit jamais proposer de bouton "Réouvrir" ou "Annuler le refus". Si un adressage est refusé ou annulé, il faut en créer un nouveau.

---

## 4. Ce qui se passe automatiquement à l'acceptation

L'acceptation d'un adressage déclenche une **cascade automatique** :

### 4.1 Ajout à la care team (autoAddToTeam)

Si `autoAddToTeam: true` (valeur par défaut) :
→ Le destinataire est **automatiquement ajouté à la care team** du patient
→ Role dans le dossier : "Soignant adressé"
→ Statut : ACCEPTED, avec la date d'entrée dans l'équipe

**Pourquoi automatique :** si quelqu'un accepte de prendre en charge un patient, il doit immédiatement avoir accès au dossier. Demander une deuxième étape "ajouter à l'équipe" créerait une friction inutile et un risque de trou dans la coordination.

**Vérification de doublon :** si le soignant est déjà dans la care team (parce qu'il avait été invité manuellement avant), l'ajout automatique est ignoré.

### 4.2 Création du RDV si `proposedDate` fourni

Si le destinataire fournit une date lors de l'acceptation :
→ Un `Appointment` est créé automatiquement
→ Statut : CONFIRMED, durée 45 min par défaut
→ `bookingSource: REFERRAL` (traçabilité — ce RDV vient d'un adressage)
→ `isFirstConsultation: true`
→ L'adressage avance automatiquement à `APPOINTMENT_BOOKED`
→ Email envoyé à l'expéditeur avec la date du RDV

### 4.3 Log d'activité

Chaque transition crée une ligne dans l'ActivityLog visible dans la timeline du patient :
- `REFERRAL_CREATED` : "Adressage envoyé à Dr. Dupont"
- `REFERRAL_ACCEPTED` : "Dr. Dupont a accepté l'adressage"
- `APPOINTMENT_CREATED` : "RDV créé le 15 mai à 14h"

Ces logs sont **immuables** — ils constituent la preuve de la coordination pour le dossier médical.

---

## 5. La lettre d'adressage IA

### 5.1 Pourquoi

Une lettre d'adressage professionnelle prend 10-15 minutes à rédiger. Le soignant doit résumer l'histoire du patient, les raisons de l'adressage, les éléments cliniques pertinents. En pratique, beaucoup envoient juste "Merci de recevoir Mme X pour TCA".

La génération IA produit un brouillon professionnel en quelques secondes. Le soignant relit, corrige, envoie.

### 5.2 Comment ça fonctionne

```
Soignant clique "Générer la lettre d'adressage"
         ↓
POST /intelligence/referral-letter/:careCaseId
  { clinicalReason, urgency, targetSpecialty, targetProviderName }
         ↓
Backend charge le contexte du dossier :
  - Informations patient (âge, sexe)
  - Équipe soignante actuelle
  - 3 dernières notes (300 caractères max chacune)
  - 5 tâches en cours
         ↓
Pseudonymisation RGPD :
  - Nom du patient → anonymisé dans le prompt
  - Nom de l'expéditeur → anonymisé dans le prompt
  (les données cliniques, elles, sont conservées)
         ↓
Prompt Claude Sonnet :
  - Génère une lettre médicale professionnelle en français
  - Inclut : contexte clinique, raison de l'adressage, urgence,
    recommandations, date courante
         ↓
Retourne : { letter: "..." } (Markdown)
         ↓
Pré-remplit le champ "Motif clinique" dans le formulaire
Badge obligatoire : "Brouillon — à relire et valider avant envoi"
```

### 5.3 Ce que le designer ne doit jamais supprimer

- Le badge "Brouillon — à relire et valider avant envoi" est **obligatoire légalement** (AI Act Art. 50)
- Le champ doit rester **éditable** après la génération — jamais read-only
- Il doit être **visuellement clair** que le contenu vient d'une IA et attend une validation humaine

---

## 6. Architecture de la page /adressages

### 6.1 Layout deux colonnes

**Colonne gauche — liste :**
- 3 onglets compteurs : **En attente** (DRAFT/SENT/RECEIVED/UNDER_REVIEW) | **En cours** (ACCEPTED/PATIENT_CONTACTED/APPOINTMENT_INVITED/APPOINTMENT_BOOKED) | **Terminés** (FIRST_VISIT_COMPLETED/EXPIRED/CANCELLED/DECLINED)
- Filtre direction : Tous | Reçus | Envoyés
- Liste de ReferralCards triées par date de création (les plus récents en tête, EMERGENCY toujours en haut)

**Colonne droite — panneau détail :**
S'ouvre au clic sur une card. Contient toutes les informations + les actions disponibles selon le statut et le rôle de l'utilisateur.

**Pourquoi un panneau et pas une page dédiée :** le soignant traite souvent plusieurs adressages de suite. Le panneau lui permet de passer de l'un à l'autre sans recharger la page.

### 6.2 Contenu d'une ReferralCard (liste)

```
┌─────────────────────────────────────────┐
│ [REÇU] [EMERGENCY]         il y a 2h   │  ← badge direction + badge priorité + temps
│                                         │
│ Suivi TCA — Léa Bernard                 │  ← titre du CareCase (pas le nom du patient)
│ De : Dr. Martin → Vers : Dr. Dupont     │  ← connexion entre soignants
│ "Adressage pour bilan psychiatrique…"   │  ← début du motif clinique (2 lignes max)
│ [SENT]                                  │  ← statut actuel
└─────────────────────────────────────────┘
```

**Pourquoi le titre du CareCase et pas le nom du patient :** le CareCase peut avoir un alias ("Suivi TCA adolescente") qui ne dévoile pas d'information privée à première vue. Le nom complet du patient n'apparaît que dans le panneau détail pour les utilisateurs ayant le bon niveau d'accès.

### 6.3 Contenu du panneau détail

**En-tête :**
- Titre du CareCase + type de cas (badge)
- Statut actuel + priorité (badges)
- Direction (REÇU / ENVOYÉ)

**Stepper de progression (5 étapes) :**
```
Envoyé → Reçu → Accepté → RDV pris → 1re consultation
```
Les étapes franchies sont surlignées, l'étape courante est animée, les étapes futures sont grises.

**Informations cliniques :**
- Motif clinique complet
- Note d'urgence si renseignée
- Documents joints (liste + accès)
- Message personnel (uniquement visible par le destinataire)

**Informations de coordination :**
- Expéditeur : avatar + nom + spécialité
- Destinataire : avatar + nom + spécialité
- Date souhaitée de RDV (si renseignée)
- Note de réponse (si le destinataire a répondu)
- Timestamps : créé le, répondu le

**Actions (selon statut et rôle) :**

| Situation | Boutons disponibles |
|-----------|-------------------|
| Je suis le destinataire, statut SENT/RECEIVED/UNDER_REVIEW | **Accepter** + **Décliner** |
| Je suis l'expéditeur, statut SENT/RECEIVED/UNDER_REVIEW | **Annuler** |
| Je suis l'expéditeur, statut ACCEPTED | **Patient contacté** (→ PATIENT_CONTACTED) |
| Je suis l'expéditeur, statut PATIENT_CONTACTED | **RDV proposé** (→ APPOINTMENT_INVITED) |
| Je suis l'expéditeur, statut APPOINTMENT_INVITED | **RDV confirmé** (→ APPOINTMENT_BOOKED) |
| Je suis l'expéditeur, statut APPOINTMENT_BOOKED | **1re consultation effectuée** (→ FIRST_VISIT_COMPLETED) |
| Statut terminal | Aucune action disponible |

**Acceptation — modale inline :**
- Champ texte "Note de réponse" (optionnel pour acceptation)
- Datepicker "Date proposée pour le RDV" (optionnel — si renseigné, crée automatiquement le RDV)
- Bouton "Confirmer l'acceptation"

**Refus — modale inline :**
- Champ texte "Raison du refus" (obligatoire)
- Bouton "Confirmer le refus"

---

## 7. Flux depuis la fiche patient

### 7.1 Onglet Coordination → sous-onglet Adressages

Dans le contexte d'un patient spécifique, l'onglet Coordination → sous-onglet Adressages affiche :
- Tous les adressages liés à CE CareCase (entrants et sortants)
- Compteur : adressages en attente pour ce patient
- Bouton "Adresser ce patient" → ouvre le wizard de création

**Différence avec /adressages :** dans la fiche patient, la liste est filtrée sur un seul CareCase. Sur /adressages, tous les adressages de tous les patients sont agrégés.

### 7.2 Le wizard de création depuis la fiche patient

**Étape 1 — Choisir le destinataire**

Deux onglets :
- **Mes contacts Nami** : confrères déjà sur Nami (call `GET /providers/my-colleagues`)
  - Affiche : avatar, nom, spécialité, badge "Sur Nami", patients communs si applicable
- **Recherche annuaire** : recherche dans les 564K professionnels (call `GET /providers/public?specialty=...`)
  - Affiche : nom, spécialité, ville, badge "Téléconsult" si applicable, badge de vérification RPPS

**Étape 2 — Renseigner le motif**

- Récapitulatif du destinataire sélectionné (non modifiable, avec lien "Changer")
- **Motif clinique** : textarea libre
  - Bouton "Générer la lettre d'adressage" (IA) sous le champ
  - Si IA utilisée : champ pré-rempli avec badge "Brouillon — à relire"
- **Urgence** : 3 boutons radio visuels
  - Routine (vert pâle) — "4 à 6 semaines"
  - Urgent - 15j (amber) — "Dans les 15 jours"
  - Urgent - 48h (rouge pâle) — "Dans les 48 à 72 heures"
- **Message personnel** (optionnel) : visible uniquement par le destinataire
- **Consentement patient** : checkbox obligatoire + mention légale (art. L.1110-4 CSP)

**Étape 3 — Confirmation**
- Icône succès + résumé (destinataire, patient, urgence)
- Bouton "Fermer"

**Wording adapté selon le rôle :**
- Si l'expéditeur est médecin → "Adressage" / "Adresser ce patient"
- Si l'expéditeur est diététicien ou psy → "Demande de coordination" / "Demander une coordination pour"

---

## 8. Intégration dans /aujourd-hui

### 8.1 Badge dans l'en-tête

Un badge amber dans la section "À faire" : "N adressage(s) en attente". Clic → navigate vers /adressages.

### 8.2 Section "Adressages reçus"

Pour les soignants ayant des adressages entrants non traités (statut SENT) :

Mini-cards compactes avec :
- Nom de l'expéditeur
- Initiales du patient (jamais le nom complet dans /aujourd-hui)
- Type de cas
- Priorité (badge)
- Boutons "Accepter" / "Décliner" inline

Ces actions depuis /aujourd-hui déclenchent exactement les mêmes effets en cascade (ajout à l'équipe, log d'activité, email à l'expéditeur).

Lien "Tout voir" → /adressages.

---

## 9. Contraintes d'accès et de visibilité

### 9.1 Qui peut créer un adressage

- Rôle : PROVIDER ou ADMIN
- Tier : COORDINATION minimum (pas le tier gratuit PRESENCE)
- Le consentement patient est obligatoire — impossible de créer sans cocher `patientConsent: true`

### 9.2 Qui peut répondre

- Mode DIRECT : uniquement le `targetProviderId`
- Mode POOL : uniquement les candidats listés dans `candidates`
- Toute autre personne → 403 Forbidden

### 9.3 Qui peut avancer le statut post-acceptation

- Uniquement l'expéditeur original (`senderPersonId`) ou un ADMIN
- Le destinataire ne peut pas avancer les statuts PATIENT_CONTACTED / APPOINTMENT_INVITED / etc. — c'est l'expéditeur qui suit et met à jour

### 9.4 Paywall tier PRESENCE (soignant gratuit)

Un soignant avec le tier gratuit peut recevoir un adressage mais voit le détail du patient partiellement masqué :
- Nom du patient → initiales seulement ("P. L.")
- Âge visible
- Type de cas visible
- Expéditeur visible
- Motif clinique visible (pour qu'il puisse évaluer la pertinence)

Affichage d'un bandeau upgrade avec lien `/upgrade?trigger=referral_received`.

**Pour le designer :** ce masquage est une décision commerciale. Le soignant doit voir assez pour comprendre qu'un adressage important arrive, mais pas assez pour travailler sans upgrader.

---

## 10. Emails automatiques

### Email au destinataire (adressage reçu)

Déclenché à la création en mode DIRECT si l'email du destinataire est connu.

**Sujet :** "[Titre du CareCase] Dr. Martin vous invite à coordonner le suivi d'un patient"

**Contenu :** Pas de nom de patient dans l'email (conformité RGPD art. L.1110-4 CSP). Juste l'invitation à se connecter sur Nami.

**Lien :** `/adressages?id={referralId}`

### Email à l'expéditeur (adressage accepté)

**Sujet :** "Bonne nouvelle — [Prénom patient] est pris en charge"

**Contenu :** Nom du destinataire qui a accepté + date du RDV si proposée.

**Note :** le prénom du patient peut apparaître dans cet email car l'expéditeur est un soignant du dossier et le connaît déjà.

### Refus : pas d'email

Un refus est silencieux côté email. Le soignant expéditeur le voit dans son panneau /adressages mais n'est pas notifié par email. **Raison :** éviter les notifications intempestives pour des refus qui peuvent arriver pour des raisons anodines (agenda plein, hors zone géographique).

---

## 11. Conformité RGPD

### Art. L.1110-4 CSP — Consentement obligatoire

La case "Le patient a consenti au partage de ses informations avec ce soignant" est **non optionnelle**. L'API rejette toute création avec `patientConsent: false` (400 Bad Request). C'est la traduction de l'article L.1110-4 du Code de la Santé Publique.

### Pseudonymisation dans la génération IA

Quand la lettre d'adressage est générée par Claude, les données nominatives (nom, prénom du patient, nom de l'expéditeur) sont **anonymisées avant d'être envoyées dans le prompt**. Seules les données cliniques (observations, tâches, notes) sont transmises. C'est une obligation Art. 4(5) RGPD.

### Données dans les emails

Les emails ne contiennent jamais le nom complet du patient ni sa date de naissance. Le lien dans l'email mène à Nami (authentifié) pour consulter le détail.

---

## 12. Routes API complètes

```
POST  /referrals
      → Créer un adressage (DIRECT ou POOL)
      → Body : { careCaseId, targetProviderId?, mode, priority, clinicalReason,
                 urgencyNote?, patientConsent, autoAddToTeam, documentIds?,
                 candidateProviderIds?, personalMessage?, desiredAppointmentDate? }
      → Crée avec statut SENT, envoie email si DIRECT

GET   /referrals/outgoing
      → Liste des adressages envoyés par le soignant connecté
      → Query : ?status=SENT&careCaseId=xxx

GET   /referrals/incoming
      → Liste des adressages reçus (DIRECT + POOL où je suis candidat)
      → Query : ?status=SENT
      → Triés par priorité DESC puis date DESC

GET   /referrals/:id
      → Détail complet (données patient masquées si tier PRESENCE)

PATCH /referrals/:id/respond
      → Accepter ou décliner (destinataire uniquement)
      → Body : { decision: "ACCEPTED"|"DECLINED", responseNote?, proposedDate? }
      → Si ACCEPTED + proposedDate → crée Appointment automatiquement
      → Si ACCEPTED + autoAddToTeam → crée CareCaseMember

PATCH /referrals/:id/candidates/:candidateId/respond
      → Répondre à un adressage POOL (candidat uniquement)
      → Body : { decision: "ACCEPTED"|"DECLINED", responseNote? }

PATCH /referrals/:id/status
      → Avancer le statut post-acceptation (expéditeur uniquement)
      → Body : { status: "PATIENT_CONTACTED"|"APPOINTMENT_INVITED"|
                          "APPOINTMENT_BOOKED"|"FIRST_VISIT_COMPLETED"|"CANCELLED" }

POST  /intelligence/referral-letter/:careCaseId
      → Générer la lettre d'adressage IA
      → Body : { clinicalReason, urgency?, targetSpecialty?, targetProviderName? }
      → Retourne : { letter: "markdown..." }
      → Inputs pseudonymisés côté backend (RGPD)
```

---

## 13. Points critiques à ne jamais perdre dans la refonte

1. **12 statuts avec un sens clinique distinct** — ne pas les regrouper en 3 ou 4 pour "simplifier". Un soignant qui voit "APPOINTMENT_BOOKED" sait que son patient a vraiment un rendez-vous. "En cours" ne lui dit rien.

2. **EMERGENCY toujours en tête de liste** — pas de tri alphabétique ou chronologique qui pourrait enterrer un adressage d'urgence sous des adressages ROUTINE.

3. **Statuts terminaux irréversibles** — DECLINED, CANCELLED, EXPIRED ne peuvent pas être "réouverts". L'UI ne doit jamais proposer ce bouton.

4. **L'ajout à la care team est automatique à l'acceptation** — ne pas créer une "étape d'ajout à l'équipe" séparée. Si quelqu'un accepte de prendre en charge, il doit avoir accès immédiatement.

5. **Le consentement patient est obligatoire légalement** — la checkbox ne peut pas être pré-cochée, cachée, ou présentée comme optionnelle.

6. **Badge "Brouillon" obligatoire sur la lettre IA** — AI Act Art. 50. Jamais auto-envoyé sans validation humaine.

7. **Le destinataire ne peut pas avancer les statuts post-acceptation** — uniquement l'expéditeur suit la progression PATIENT_CONTACTED → FIRST_VISIT_COMPLETED. Ce n'est pas un bug, c'est volontaire : l'expéditeur garde la main sur le suivi.

8. **Le masquage du nom patient (tier PRESENCE)** — le destinataire doit voir assez pour évaluer la pertinence de l'adressage (motif, priorité, type de cas) mais pas assez pour travailler sans upgrader.

9. **Le refus est silencieux (pas d'email)** — ne pas ajouter une notification email de refus "pour informer". Ce choix est délibéré.

10. **Les documents joints sont accessibles au destinataire** — l'accès aux pièces jointes d'un adressage ne dépend pas du tier. Si des documents sont attachés, le destinataire doit pouvoir les consulter pour décider d'accepter ou non.

---

## 14. Opportunités d'amélioration UX

- **Stepper plus proéminent** : le stepper de progression est le différenciateur de Nami vs. email/SMS. Il doit être la pièce centrale du panneau détail, pas un élément secondaire.

- **Vue kanban optionnelle** : pour les coordinateurs qui gèrent beaucoup d'adressages (CPTS, HAP), une vue kanban par statut serait plus efficace que la liste.

- **Rappel automatique configurable** : si un adressage est en statut SENT depuis N jours sans réponse, proposer d'envoyer un rappel au destinataire.

- **Historique des adressages par patient** : dans la fiche patient, montrer tous les adressages passés avec leur issue finale (accepté, refusé, terminé). La trajectoire d'adressage d'un patient TCA sur 12 mois est cliniquement significative.

- **Mode POOL dans l'UI** : le mode POOL existe en backend mais l'UI ne propose peut-être pas une sélection multi-destinataires claire. C'est une opportunité pour les soignants en début de réseau.
