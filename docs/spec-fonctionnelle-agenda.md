# Spécification fonctionnelle — Module Agenda
> Document de référence pour la refonte UX/UI. Explique le POURQUOI de chaque élément, la logique métier, les sources de données et les routes API. Ne pas redesigner sans avoir lu ce document.

---

## Vue d'ensemble

L'agenda de Nami n'est pas un simple calendrier. C'est le **pivot de coordination** entre trois flux :
1. **Le temps du soignant** — ses créneaux disponibles, ses absences, sa charge
2. **Le parcours du patient** — chaque RDV est lié à un CareCase, lui-même lié à un PathwayTemplate
3. **L'espace de travail clinique** — avant/pendant/après chaque RDV, des outils (PrepMode, ConsultationWidget) s'activent automatiquement

L'agenda est aussi le **point d'entrée public** via l'annuaire : un patient peut prendre rendez-vous depuis `/soignants/[slug]`, et ce RDV atterrit dans l'agenda du soignant via un flux d'acceptation contrôlé.

---

## 1. Architecture globale de l'agenda

### 1.1 La grille semaine (WeekGrid)

**Pourquoi une grille à la minute ?**
La grille est construite en pixels par minute (2px/min) entre 8h et 21h (780 minutes = 1560px de hauteur). Cette précision permet de positionner les blocs exactement selon leur durée réelle — un RDV de 45min occupe 90px, un de 30min occupe 60px. Une grille par "cases" de 30min serait trop rigide pour les spécialités comme la nutrition (souvent 50-90min) ou la psy (50min standard).

**Ce qu'affiche la grille :**
- Colonnes : une par jour de la semaine visible (5 jours par défaut, navigable)
- Lignes : marqueurs horaires toutes les 30 minutes
- Blocs : RDV colorés par statut
- Ligne rouge : heure courante (aujourd'hui seulement)
- Zones grisées : en dehors des AvailabilitySlots configurés

**Couleurs des blocs par statut :**
| Statut | Couleur | Signification clinique |
|--------|---------|----------------------|
| PENDING | Jaune/Amber | Demande en attente d'acceptation |
| CONFIRMED | Indigo/Violet | RDV confirmé |
| PATIENT_ARRIVED | Vert vif | Patient présent en salle d'attente |
| COMPLETED | Gris neutre | Consultation terminée |
| CANCELLED | Rouge barré | Annulé (source dans les metadata) |
| NO_SHOW | Orange foncé | Patient absent sans prévenir |
| ABSENCE | Gris hachuré | Bloc d'indisponibilité soignant |

**Ne jamais supprimer ces couleurs** : elles ont une valeur clinique immédiate (le soignant voit d'un coup d'œil si un patient est arrivé, si des RDV sont en attente de confirmation).

### 1.2 L'AppointmentBlock

Chaque bloc RDV affiche :
- Nom du patient (si durée ≥ 20min) ou initiales
- Heure de début
- Badge CareCase si lié à un parcours structuré (⚡ ou 🏃)
- Icône PrepMode disponible si notes/obs récentes existent

**Interaction :**
- Clic → ouvre AppointmentDrawer (panneau latéral)
- Hover → tooltip avec motif, durée, statut

### 1.3 L'AppointmentDrawer

Panneau latéral (pas une modale) qui s'ouvre à droite de la grille au clic sur un RDV.

**Contenu :**
- En-tête : nom patient + avatar + statut actuel
- Infos : date/heure, durée, type, motif saisi par le patient
- Boutons d'action selon le statut :
  - PENDING → Accepter / Refuser
  - CONFIRMED → Marquer Arrivé / Annuler / Préparer la consultation (→ PrepMode)
  - PATIENT_ARRIVED → Démarrer consultation (→ ConsultationWidget) / No-show
  - COMPLETED → Voir le compte-rendu (→ fiche patient onglet Dossier)
- Lien direct vers la fiche patient
- Historique des RDV avec ce patient

**Pourquoi un drawer et pas une modale ?** Le soignant garde la grille visible pour contextualiser (voir les autres RDV de la journée, évaluer les transitions).

---

## 2. La logique de l'agenda intelligent (Smart Slots)

### 2.1 Le problème que ça résout

Sans optimisation, les prises de RDV publiques créent des "îlots" : un patient réserve à 9h, le suivant à 14h, laissant des trous inutilisables de 4h. Le soignant perd du temps de travail effectif.

### 2.2 L'algorithme d'adjacence

**Activation :** `agendaSmartCompact: true` dans les settings du soignant.

**Paramètre :** `agendaBuffer` (0 à 20 minutes) — la tolérance de gap entre deux RDV pour considérer qu'ils sont "adjacents".

**Fonctionnement en 4 étapes :**

```
ÉTAPE 1 — Expansion des templates
  AvailabilitySlots configurés (ex: "Lundi 9h-12h")
  → Expansion sur 14 jours glissants
  → Liste de créneaux atomiques (durée = durée standard du soignant)

ÉTAPE 2 — Filtrage des créneaux déjà pris
  Pour chaque créneau atomique :
  → Vérifier absence de Appointment CONFIRMED/PENDING qui se chevauche
  → Vérifier absence de bloc ABSENCE qui couvre la période
  → Résultat : liste de créneaux libres

ÉTAPE 3 — Scoring par proximité
  Pour chaque créneau libre :
  → Chercher les Appointments existants dans la même journée
  → Calculer gap = min(|créneau.start - rdv_existant.end|, |créneau.end - rdv_existant.start|)
  → Si gap ≤ agendaBuffer → score = "recommended" (affiché en priorité dans la liste publique)
  → Sinon → score = "available" (affiché mais sans badge recommandé)

ÉTAPE 4 — Réponse API
  GET /appointment-requests/availability/:providerId
  → Retourne { recommended: Slot[], available: Slot[] }
  → Le frontend (booking-section.tsx) affiche d'abord les "recommended"
```

**Exemple concret :**
- RDV existant : Dr. Dupont, Lundi 10h-10h50
- agendaBuffer : 10min
- Créneau libre 11h-11h50 → gap = 10min ≤ 10min → **recommandé**
- Créneau libre 14h-14h50 → gap = 190min > 10min → disponible

### 2.3 Ce que le designer ne doit pas supprimer

Dans la vue publique `/soignants/[slug]` :
- Le badge "Recommandé" ou "Créneau optimal" sur les smart slots
- La distinction visuelle entre créneaux recommandés et disponibles
- L'ordre d'affichage (recommandés en haut)

Ces éléments ne sont pas décoratifs : ils réduisent les trous dans l'agenda du soignant et augmentent son taux d'occupation.

---

## 3. Configuration de l'agenda (Paramétrage)

### 3.1 Onboarding — AgendaSetup (3 étapes)

La première fois qu'un soignant accède à l'agenda sans configuration, il voit un wizard 3 étapes :

**Étape 1 — Disponibilités générales**
- Jours de la semaine actifs (toggle par jour)
- Horaires globaux (ex: 8h-18h)
- Durée de consultation par défaut (15/20/30/45/60/90min)

**Étape 2 — Plages spécifiques**
- Créneaux dérogatoires (un mercredi matin de libre, par exemple)
- Blocs de non-disponibilité récurrents (réunion staff chaque lundi 12h-13h)

**Étape 3 — Préférences agenda intelligent**
- Activer/désactiver agendaSmartCompact
- Régler agendaBuffer (slider 0-20min)
- Choisir délai de préavis minimum (ex: 24h → aucun RDV public possible dans les 24h)

**Pourquoi ce wizard est obligatoire :** sans AvailabilitySlots configurés, l'API de smart slots retourne vide. Le soignant doit définir son cadre avant que les patients puissent réserver.

### 3.2 Page Paramétrage (4 onglets)

Accessible via `/agenda/parametrage` :

| Onglet | Contenu |
|--------|---------|
| Disponibilités | Éditer les AvailabilitySlots, ajouter des exceptions |
| Consultations | Types de RDV, durées, couleurs par type, tarifs associés |
| Agenda intelligent | agendaSmartCompact, agendaBuffer, préavis minimum |
| Notifications | Rappels automatiques aux patients (J-1, J-7), rappels pour le soignant |

**Ne pas fusionner ces 4 onglets** : ce sont des domaines de configuration différents. Un soignant peut vouloir changer son buffer sans toucher à ses disponibilités.

---

## 4. Création de RDV manuels (CreateAppointmentModal)

### 4.1 Deux types de créations

**RDV patient :**
- Sélecteur patient (search dans la liste de patients de l'organisation)
- Date/heure (picker sur la grille)
- Durée (override de la durée par défaut)
- Type de consultation (dropdown : première consultation, suivi, RCP, téléconsultation…)
- Motif (texte libre)
- Lien vers un CareCase existant (optionnel — si ce RDV s'inscrit dans un parcours structuré)

**Bloc d'absence :**
- Date/heure début-fin
- Motif (formation, congé, réunion — reste privé, n'est pas visible par les patients)
- Récurrence (aucune, quotidienne, hebdomadaire)

**Pourquoi distinguer les deux :** les blocs d'absence doivent bloquer les créneaux publics sans créer un "RDV" dans les stats de consultation. L'API les gère via un champ `type: 'ABSENCE'`.

### 4.2 Validation métier

- Vérification de chevauche-ment : l'API refuse si un autre RDV existe sur la même plage
- Vérification disponibilité : warning si hors AvailabilitySlots (la création reste possible — override manuel)
- Création atomique : si le patient n'existe pas encore, une création Patient + invitation CareTeam peut être déclenchée en cascade

---

## 5. Espace secrétaire

### 5.1 Pourquoi une vue secrétaire distincte

La secrétaire a besoin de :
- Voir les agendas de **plusieurs soignants** simultanément
- Gérer la salle d'attente (qui est arrivé, qui attend depuis combien de temps)
- Créer des RDV et annuler des RDV
- Vérifier les informations administratives des patients (coordonnées, mutuelle)

Elle **ne doit pas** avoir accès à :
- Les notes cliniques
- Les observations (poids, biologie, BIA)
- Les prescriptions
- Les adressages
- Le journal patient

Ce cloisonnement est une exigence RGPD (secret médical, accès limité à la care team clinique).

### 5.2 RBAC secrétaire

Rôle : `SECRETARY`

**Permissions :**
```
✅ Lecture/écriture : Appointments (CRUD)
✅ Lecture/écriture : AvailabilitySlots (pour gérer les dispo des soignants)
✅ Lecture : Patients (coordonnées, admin uniquement — pas les données cliniques)
✅ Lecture : AppointmentRequests (voir les demandes en attente)
✅ Écriture : AppointmentRequests (accepter/refuser au nom du soignant)
✅ Lecture : Organisation (annuaire interne)
❌ Zéro accès : Notes, Observations, Prescriptions, Journal, Adressages, RCP
```

**Implémentation backend :** middleware `requireSecretary` sur les routes secretary. Les routes patients retournent uniquement les champs `patientProfile` (non cliniques) quand le rôle est SECRETARY.

### 5.3 Vue multi-soignants

La secrétaire voit par défaut **toutes les colonnes** des soignants de son organisation en parallèle (une colonne par soignant, ou une colonne par jour/soignant en mode semaine).

Filtres disponibles :
- Par soignant (afficher/masquer certains praticiens)
- Par statut de RDV (voir uniquement les PENDING pour traitement rapide)
- Par jour (vue jour multi-soignants pour la gestion du jour J)

**Ne pas imposer la vue soignant à la secrétaire** : elle a besoin de la vue multi-colonnes pour faire son travail efficacement.

### 5.4 Salle d'attente

Tableau dédié accessible depuis l'agenda secrétaire :

| Colonne | Contenu |
|---------|---------|
| Patient | Nom + avatar |
| RDV | Heure prévue + soignant concerné |
| Statut | CONFIRMED / PATIENT_ARRIVED |
| Attente | Durée depuis marquage "arrivé" |
| Action | Bouton "Marquer arrivé" / "Prévenir le soignant" |

Le bouton "Marquer arrivé" → `PATCH /appointments/:id/status { status: 'PATIENT_ARRIVED' }` → notification push au soignant ("Votre patient [X] est arrivé").

**Routes secretary :**
```
GET  /secretary/appointments          → RDV du jour (tous soignants de l'org)
GET  /secretary/waiting-room          → Patients avec statut PATIENT_ARRIVED
PATCH /secretary/appointments/:id     → Modifier statut, détails admin
GET  /secretary/providers             → Liste des soignants de l'organisation
GET  /secretary/appointment-requests  → Demandes en attente
PATCH /secretary/appointment-requests/:id/accept → Accepter au nom du soignant
PATCH /secretary/appointment-requests/:id/decline → Refuser
```

---

## 6. PrepMode — Préparer la consultation

### 6.1 Déclenchement

PrepMode s'ouvre depuis :
1. Le bouton "Préparer la consultation" dans AppointmentDrawer (statut CONFIRMED)
2. La page `/aujourd-hui` → clic sur "Préparer" dans la liste des RDV du jour
3. Automatiquement proposé à l'ouverture de l'agenda si un RDV démarre dans moins de 15min

### 6.2 Contenu de PrepMode

PrepMode est une **modale plein écran** (pas un panneau latéral) qui rassemble tout ce dont le soignant a besoin avant d'appeler le patient.

**Section 1 — Résumé IA (Brouillon)**

Appel à `POST /patients/:id/ai-summary` → Claude Sonnet génère un résumé extractif des 30 derniers jours :
- Dernières observations pertinentes (poids, BIA si récent, biologie)
- Notes récentes (structurées via structureNote)
- Journal patient : tendances des 7 derniers jours (humeur, repas)
- Adressages en cours

Affiché avec le badge obligatoire **"Brouillon IA — à vérifier"**.

**Section 2 — Deltas depuis la dernière consultation**

Compare automatiquement les Observations entre le RDV actuel et le RDV précédent avec ce patient :
- Poids : Δ en kg (flèche + couleur selon DELTA_POLARITY)
- IMC, masse grasse, masse musculaire (si BIA disponible)
- Dernière biologie marquante

**Section 3 — Tâches en cours (Tasks)**

Liste des Tasks assignées à ce patient avec statut `PENDING` ou `IN_PROGRESS`. Le soignant peut les cocher directement depuis PrepMode → `PATCH /tasks/:id { status: 'COMPLETED' }`.

**Section 4 — Points à aborder (generés par NoteAnalysisBanner)**

Si la dernière note a généré des `suggestedTasks` ou `flaggedItems`, ils apparaissent ici comme aide-mémoire.

**Section 5 — Historique des RDV**

Chronologie compacte des 5 derniers RDV avec ce patient, avec motif et durée.

### 6.3 Ce que PrepMode n'est pas

PrepMode **ne prend pas de décisions cliniques** — il centralise et regroupe. Il ne dit jamais "ce patient est à risque" ou "il faut faire X". Il dit "voici ce qui s'est passé depuis la dernière fois".

---

## 7. ConsultationWidget — Pendant la consultation

### 7.1 Déclenchement

S'active depuis :
1. AppointmentDrawer → bouton "Démarrer consultation" (statut PATIENT_ARRIVED)
2. `/aujourd-hui` → bouton "Démarrer" sur le RDV du jour

### 7.2 Présentation visuelle

**Widget flottant draggable** positionné par défaut en bas à droite de l'écran. Le soignant peut le déplacer pour ne pas masquer la fiche patient qu'il consulte en parallèle.

**Pourquoi flottant et non modal :** le soignant doit pouvoir consulter les notes, les observations, le journal du patient PENDANT la consultation, tout en gardant le widget d'enregistrement visible.

### 7.3 États du widget

```
IDLE (rouge) → bouton REC central
  ↓ clic REC
RECORDING (animation waveform + chrono) → bouton PAUSE + bouton STOP
  ↓ clic STOP
PROCESSING → spinner "Transcription en cours..."
  ↓ résultat
DONE → transcript affiché + bouton "Générer note IA"
  ↓ clic Générer
AI_GENERATING → spinner + "Structuration de la note..."
  ↓ résultat
NOTE_READY → brouillon de note affiché + bouton "Insérer dans le dossier"
```

### 7.4 Pipeline audio → note

```
1. MediaRecorder Web API → chunks audio en RAM (pas de fichier temporaire)
2. STOP → POST /consultations/:id/transcribe
   → Backend : conversion audio → texte (Whisper v2 si dispo, sinon API externe)
   → Retourne : { transcript: string }
3. POST /consultations/:id/generate-note
   → Backend : Claude Sonnet + transcript + contexte patient (pseudonymisé)
   → Prompt : "Extrait une note de consultation structurée : motif, observations, plan"
   → Retourne : { structuredNote: NoteStructured }
4. Affichage brouillon → soignant valide/modifie
5. POST /notes { content, type: 'CONSULTATION', sourceTranscript: true, appointmentId }
```

### 7.5 Inputs pseudonymisés (RGPD)

Le prompt envoyé à Claude **ne contient jamais** le nom, prénom, date de naissance ou adresse du patient. Uniquement les données cliniques (poids, scores, symptômes) et le transcript. C'est une obligation Art. 50 AI Act + Art. 4(5) RGPD (pseudonymisation).

### 7.6 Ce que le designer ne doit pas toucher

- Le widget doit rester **draggable** (le soignant en a besoin pour naviguer librement)
- Le badge "Brouillon IA — à vérifier" sur la note générée est **obligatoire légalement** (AI Act Art. 50)
- Le bouton de validation doit être **distinct et explicite** (jamais auto-insert sans action humaine)

---

## 8. La page /aujourd-hui — Tableau de bord du jour

### 8.1 Rôle

`/aujourd-hui` est la **page d'atterrissage post-login** pour le soignant. Elle répond à une seule question : "Que dois-je faire aujourd'hui ?"

Ce n'est pas un deuxième agenda. C'est un **hub d'action** organisé par urgence et chronologie.

### 8.2 Structure de la page

**Bloc 1 — Mes RDV d'aujourd'hui (2/3 de la largeur)**

Liste chronologique des Appointments du jour avec :
- Heure + durée + nom patient
- Statut avec badge coloré
- Bouton contextuel selon statut :
  - CONFIRMED + heure proche → "Préparer" (→ PrepMode)
  - PATIENT_ARRIVED → "Démarrer" (→ ConsultationWidget)
  - COMPLETED → "Voir dossier"
- Badge CareCase si le RDV est dans un parcours structuré

**Bloc 2 — À faire (1/3 de la largeur)**

Agrégation des Tasks `PENDING` ou `IN_PROGRESS` sur tous les patients :
- Tâches en retard (date limite dépassée) → badge rouge
- Tâches du jour → badge amber
- Adressages en attente de réponse → badge violet
- Demandes de RDV en attente (AppointmentRequests) → badge jaune

**Bloc 3 — Demandes de RDV en attente (si >0)**

Tableau compact des AppointmentRequests non traitées :
- Patient (nom + date de la demande)
- Créneau demandé
- Motif saisi par le patient
- Boutons Accepter / Refuser / Proposer un autre créneau

**Bloc 4 — Activité récente (si espace disponible)**

Feed des dernières actions : notes créées, observations reçues, messages, entrées journal patient.

### 8.3 Logique de priorité des tâches

L'ordre d'affichage dans "À faire" :
1. Adressages urgents (flag `URGENT`)
2. Tâches en retard (`dueDate < aujourd'hui`)
3. Demandes de RDV non traitées (par ancienneté)
4. Tâches du jour
5. Tâches sans date limite (par dernière modification)

**Ce classement est déterministe et basé sur des métadonnées** — pas sur une IA. Il n'y a pas d'analyse de risque clinique. Les priorités sont définies par les soignants eux-mêmes (dueDate, flag URGENT).

---

## 9. Flow de prise de RDV public

### 9.1 Vue d'ensemble

```
/soignants/[slug]                         Page publique du soignant
      ↓ Clic "Prendre rendez-vous"
Sélection du créneau (SmartSlots)
      ↓ Clic sur un créneau
Authentification (login ou inscription)    Gate obligatoire
      ↓ Authentifié
Saisie du motif                           Texte libre, non clinique
      ↓ Confirmer
POST /appointment-requests                Création AppointmentRequest
      ↓
Email au soignant : "Nouvelle demande"
      ↓
Soignant accepte (AppointmentDrawer ou /aujourd-hui)
PATCH /appointment-requests/:id/accept
      ↓ Transaction atomique en DB :
      ├── Patient créé (si n'existe pas)
      ├── CareCase créé (ou associé si existant)
      ├── Appointment créé (CONFIRMED)
      ├── Invitation CareTeam envoyée
      ├── Email confirmation patient
      └── Push notification patient (Expo)
```

### 9.2 La page /soignants/[slug]

**Contenu :**
- Profil public : photo, nom, spécialités, bio courte
- Affiliations CPTS/réseaux déclarées (conformité R4127-19-1)
- Langues parlées
- Tarifs (si renseignés — optionnel)
- Localisation + carte
- Section SmartSlots : créneaux recommandés + disponibles

**Ce qui est interdit sur cette page (conformité légale) :**
- Avis patients / notations → no_go (R4127-19-1)
- Comparaison avec d'autres soignants → no_go
- Badge "Recommandé par Nami" → no_go (R4127-80)
- Classement basé sur des critères payants → no_go

**Ce qui est autorisé :**
- Affiliations CPTS déclarées par le soignant lui-même ✅
- Filtres objectifs (spécialité, langue, disponibilité) ✅
- Badge "Créneau optimal" basé sur l'algorithme d'adjacence ✅ (critère neutre documenté)

### 9.3 La gate d'authentification

Si le visiteur n'est pas connecté et clique sur un créneau → modale d'auth :

1. **Connexion** (compte existant) → directement au motif
2. **Inscription** (nouveau compte) → formulaire minimal (email + nom + mdp) → vérification email obligatoire → retour sur le créneau sélectionné (le créneau est gardé en sessionStorage)

**Pourquoi la vérification email est obligatoire ici :** un rendez-vous non honoré (no-show) a un coût pour le soignant. L'email vérifié garantit un minimum de sérieux et permet les rappels automatiques.

### 9.4 Transaction atomique à l'acceptation

Quand le soignant accepte une AppointmentRequest, la logique est :

```typescript
// Pseudo-code de /appointment-requests/:id/accept
await db.$transaction(async (tx) => {
  // 1. Vérifier que le créneau est encore libre
  const conflicts = await tx.appointment.findMany({ /* overlap check */ });
  if (conflicts.length > 0) throw new ConflictError("Créneau déjà pris");

  // 2. Créer ou retrouver le patient
  const patient = await tx.patient.upsert({ /* by email */ });

  // 3. Créer ou retrouver le CareCase
  const careCase = await tx.careCase.upsert({ /* by patient + provider */ });

  // 4. Créer l'Appointment
  const appointment = await tx.appointment.create({
    data: { status: 'CONFIRMED', careCaseId: careCase.id, ... }
  });

  // 5. Créer l'invitation CareTeam (si nouveau patient)
  await tx.careTeamMember.upsert({ /* soignant + patient */ });

  // 6. Marquer la request comme ACCEPTED
  await tx.appointmentRequest.update({ status: 'ACCEPTED' });
});

// Hors transaction (side effects)
await sendConfirmationEmail(patient.email, appointment);
await sendPushNotification(patient.expoPushToken, appointment);
```

**Pourquoi une transaction :** si l'une des étapes échoue (email déjà pris, créneau déjà occupé), rien n't est créé. La cohérence DB est garantie.

---

## 10. Lien agenda ↔ Adressages

### 10.1 Création de RDV depuis un adressage accepté

Quand un soignant **accepte un adressage** (PATCH /referrals/:id/accept) :
- L'adressage passe au statut `ACCEPTED`
- Une tâche est créée automatiquement : "Planifier le rendez-vous avec [patient]" (type: `APPOINTMENT_SCHEDULE`)
- La tâche apparaît dans "À faire" sur `/aujourd-hui`
- Un bouton "Créer le RDV" depuis la tâche → ouvre CreateAppointmentModal pré-rempli avec le nom du patient et le motif de l'adressage

**Pourquoi pas de création automatique du RDV :** le soignant destinataire doit choisir son créneau. L'adressage ne peut pas présupposer les disponibilités du destinataire.

### 10.2 Suivi de l'adressage via l'agenda

Sur la fiche patient, dans l'onglet Coordination → section Adressages :
- Si l'adressage est `ACCEPTED` + un Appointment est créé → le RDV apparaît avec sa date
- Si l'adressage est `ACCEPTED` + aucun Appointment → badge "En attente de planification"
- Le `careCaseId` est partagé entre l'adressage et l'appointment pour maintenir la continuité du parcours

### 10.3 Adressage urgent

Si l'adressage a le flag `priority: 'URGENT'` :
- Il remonte en tête de la section "À faire" sur `/aujourd-hui`
- Le soignant destinataire reçoit une notification push immédiate (pas uniquement email)
- L'agenda intelligent exclut les créneaux avec un gap > 48h (force une proposition dans les 2 jours)

---

## 11. Liens entre l'agenda et la fiche patient

### 11.1 Le CareCase comme pivot

Chaque Appointment est lié à un `careCaseId`. Le CareCase est lui-même lié à un Patient et à un ou plusieurs soignants. Cette structure permet :

- Depuis la **fiche patient** → voir tous les RDV passés et futurs avec chaque soignant (onglet Dossier → Historique)
- Depuis **l'agenda** → clic sur un RDV → lien direct vers la fiche patient
- Dans les **stats du dashboard** → calculer le nombre de RDV par CareCase (intensité du suivi)

### 11.2 ActivityLog automatique

Chaque changement de statut d'un Appointment crée une ligne dans `ActivityLog` :
- `CONFIRMED` → "RDV confirmé par [soignant/secrétaire]"
- `COMPLETED` → "Consultation terminée"
- `NO_SHOW` → "Patient absent"

Ces logs apparaissent dans la **timeline** de la fiche patient (onglet Dossier → Timeline), permettant au soignant suivant de voir l'historique de présence.

### 11.3 PrepMode contextuel

PrepMode est déclenché depuis l'agenda **mais il lit des données de la fiche patient** :
- Appel `GET /patients/:id/summary` → résumé des 30 derniers jours
- Appel `GET /patients/:id/observations?limit=5` → dernières observations
- Appel `GET /patients/:id/journal?days=7` → entrées journal récentes
- Appel `GET /tasks?patientId=:id&status=PENDING` → tâches en cours

Ces 4 appels sont **parallèles** (Promise.all) pour minimiser le temps de chargement de PrepMode.

---

## 12. Jobs planifiés (pg-boss)

L'agenda déclenche plusieurs jobs asynchrones via pg-boss (scheduleur PostgreSQL distribué, multi-instance safe) :

| Job | Déclencheur | Action |
|-----|-------------|--------|
| `send-appointment-reminder-24h` | J-1 à 9h | Email + push patient rappel RDV |
| `send-appointment-reminder-2h` | J à H-2 | Push patient uniquement |
| `auto-complete-appointments` | Cron horaire | Passe CONFIRMED → COMPLETED si heure dépassée de 2h sans action |
| `send-no-show-notification` | Manuel (soignant clique NO_SHOW) | Email notification au soignant + log |
| `schedule-push-questionnaire` | Défini par le soignant | Envoi questionnaire programmé au patient mobile |

**Pourquoi pg-boss et pas un cron classique :** plusieurs instances de Railway peuvent tourner en parallèle. pg-boss utilise des advisory locks PostgreSQL pour garantir qu'un job ne s'exécute qu'une fois même sur N instances.

---

## 13. Routes API complètes

### Agenda soignant
```
GET  /appointments                          → RDV de la semaine courante (auth soignant)
GET  /appointments/:id                      → Détail d'un RDV
POST /appointments                          → Créer un RDV manuel
PATCH /appointments/:id                     → Modifier (statut, motif, durée)
DELETE /appointments/:id                    → Annuler (soft delete → statut CANCELLED)
PATCH /appointments/:id/status              → Changer statut (ARRIVED, COMPLETED, NO_SHOW)
GET  /appointments/today                    → RDV du jour courant
```

### Disponibilités
```
GET  /availability-slots                    → Slots configurés du soignant connecté
POST /availability-slots                    → Créer un slot récurrent
PUT  /availability-slots/:id               → Modifier
DELETE /availability-slots/:id             → Supprimer
POST /availability-slots/exception          → Ajouter une exception (absent le X)
```

### AppointmentRequests (flux public)
```
GET  /appointment-requests/availability/:providerId  → Smart slots (public, no auth)
POST /appointment-requests                           → Créer une demande (auth patient)
GET  /appointment-requests                           → Liste des demandes du soignant
PATCH /appointment-requests/:id/accept               → Accepter (transaction atomique)
PATCH /appointment-requests/:id/decline              → Refuser
PATCH /appointment-requests/:id/propose              → Proposer un autre créneau
```

### Secrétaire
```
GET  /secretary/appointments                → RDV du jour (tous providers de l'org)
GET  /secretary/waiting-room               → Patients en salle d'attente
PATCH /secretary/appointments/:id          → Modifier admin (statut, notes admin)
GET  /secretary/providers                  → Soignants de l'organisation
GET  /secretary/appointment-requests       → Demandes en attente
PATCH /secretary/appointment-requests/:id/accept  → Accepter au nom du soignant
PATCH /secretary/appointment-requests/:id/decline → Refuser
```

### Consultation (widget)
```
POST /consultations/:appointmentId/transcribe     → Whisper audio → transcript
POST /consultations/:appointmentId/generate-note  → Claude transcript → note structurée
POST /consultations/:appointmentId/complete       → Marquer la consultation terminée
GET  /consultations/:appointmentId                → État courant du widget
```

### PrepMode
```
GET  /patients/:id/prep-summary             → Résumé IA pré-consultation (30 derniers jours)
```

---

## 14. Points critiques à ne jamais perdre dans la refonte

1. **La grille est en px/minute** — toute refonte doit maintenir cette précision. Une grille en "cases" de 30min est une régression fonctionnelle.

2. **Les couleurs de statut ont une valeur clinique** — PATIENT_ARRIVED en vert vif n'est pas un choix décoratif. Le soignant lit d'un regard qui est en salle.

3. **L'AppointmentDrawer est un panel, pas une modale** — l'accès à la grille doit rester visible. Si on passe en modale, le soignant perd le contexte de sa journée.

4. **Les Smart Slots ont deux catégories** — "recommandés" et "disponibles" doivent rester visuellement distincts. Ne pas les mélanger dans une liste unique.

5. **La secrétaire voit plusieurs soignants en parallèle** — sa vue ne peut pas être la même que celle du soignant. Une seule colonne = une régression fonctionnelle.

6. **PrepMode charge 4 sources en parallèle** — ne pas sérialiser ces appels. L'ordre d'affichage ne dépend pas de l'ordre de réponse.

7. **ConsultationWidget est draggable** — le soignant doit pouvoir naviguer dans la fiche patient pendant l'enregistrement. Un overlay bloquant est impossible.

8. **Le badge "Brouillon IA" est obligatoire légalement** (AI Act Art. 50) — jamais supprimer ce badge sur les notes générées, même pour des raisons esthétiques.

9. **La transaction d'acceptation est atomique** — si le UI laisse penser que l'acceptation est instantanée mais que la transaction a échoué, le soignant peut croire avoir confirmé un RDV qui n'existe pas. Toujours attendre la réponse 200 avant d'afficher la confirmation.

10. **pg-boss sur PostgreSQL** — les rappels automatiques dépendent de cron jobs horaires. Ne pas changer la logique de déclenchement sans tester le scheduler.
