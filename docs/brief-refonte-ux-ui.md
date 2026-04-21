# Brief UX/UI — Refonte complète de Nami
> Document destiné à Claude.ai ou à un designer pour proposer une refonte de l'interface. Contient le contexte produit, les personas, l'architecture d'information, les contraintes fonctionnelles et légales, et les opportunités d'amélioration page par page.

---

## 1. Contexte produit

### Ce qu'est Nami

Nami est l'**infrastructure de coordination des parcours de soins complexes multi-spécialités**. Ce n'est pas un logiciel médical, pas un CRM santé, pas un dossier patient. C'est le système nerveux qui fait circuler l'information entre les soignants qui s'occupent du même patient.

**Cas fondateur :** Gabrielle, 10 ans, anorexie. Médecin + psychologue + diététicienne. Chacun compétent dans son silo. Les parents coordonnaient les soins par SMS. 4 mois perdus avant une décision collective. Pas un manque de compétence — un défaut d'orchestration.

**Ce que Nami transfère :** la charge de coordination du patient (ou de ses parents) vers les professionnels.

**Wedge marché :** obésité, TCA (Troubles du Comportement Alimentaire), nutrition pluridisciplinaire.

**Fondatrice :** Margot Vire, diététicienne spécialisée TCA, première utilisatrice réelle de Nami.

### Positionnement légal (impacte le design)

Nami est positionné comme **outil de coordination**, pas comme dispositif médical (DM). Cette distinction détermine des contraintes de wording et de design qui ne sont pas négociables :
- Jamais de "alertes cliniques" → "indicateurs de complétude"
- Jamais de "surveiller" → "centraliser / organiser"
- Jamais de "détecter un risque" → "observer / noter"
- Tout output IA = brouillon avec badge "Brouillon IA — à vérifier" obligatoire
- Aucun score de risque patient affiché (Art. 5 AI Act)

---

## 2. Personas

### Persona 1 — Le soignant libéral (cœur de cible)
**Profil :** Diététicienne, psychologue, médecin généraliste en cabinet. 20-60 patients actifs. Travaille seul ou en petit cabinet.
**Contexte d'usage :** Entre deux consultations (3-5 min), pendant la consultation (consulte en parallèle), le soir (administratif).
**Douleurs actuelles :** Jongle entre email, SMS, WhatsApp et logiciel métier. Ne sait pas ce que les autres soignants ont fait. Les parents appellent pour "juste une question rapide" et ça prend 20 min.
**Ce qu'il/elle attend de Nami :** Voir en 30 secondes ce qui s'est passé pour un patient depuis la dernière consultation. Envoyer un adressage sans décrocher le téléphone. Préparer une consultation en 2 minutes.
**Device :** Desktop principalement. Parfois mobile entre deux RDV.

### Persona 2 — Le soignant hospitalier / réseau
**Profil :** Pédiatre, médecin en HAP (Hospitalisation À Domicile), gastro-entérologue. Suit des patients en parcours complexe avec de nombreux intervenants.
**Contexte d'usage :** Bureau d'hôpital (desktop), parfois tablette en visite.
**Douleurs actuelles :** Les comptes-rendus arrivent en retard ou pas du tout. Ne sait pas qui est dans l'équipe soignante d'un patient. Les RCP (Réunions de Concertation Pluridisciplinaire) sont organisées par email avec 10 pièces jointes.
**Ce qu'il/elle attend de Nami :** Voir toute la care team d'un patient et ce que chacun a fait. Organiser une RCP avec une synthèse IA automatique. Valider les recommandations en 1 clic.

### Persona 3 — La secrétaire médicale
**Profil :** Gère l'agenda d'un ou plusieurs soignants. Accueille les patients.
**Contexte d'usage :** Desktop toute la journée.
**Ce qu'elle doit pouvoir faire :** Gérer les RDV, accueillir les patients, voir qui est en salle d'attente. **Jamais** accéder aux notes cliniques, prescriptions, observations.
**Ce qu'elle ne doit pas voir :** Tout le contenu clinique — uniquement les informations administratives.

### Persona 4 — Le patient (mobile)
**Profil :** Adulte ou parent d'enfant en parcours complexe TCA/obésité. Utilise l'app mobile, pas le web.
**Contexte d'usage :** Application mobile exclusivement.
**Ce qu'il/elle fait :** Journal alimentaire + émotions + activité + photos repas. Répond aux questionnaires envoyés par le soignant. Prend des RDV via l'annuaire public.
**Important :** Le patient ne voit JAMAIS le cockpit web. Tout ce qu'il produit (journal, photos) remonte dans la fiche patient côté soignant.

---

## 3. Architecture d'information actuelle

### Navigation principale (sidebar fixe gauche)

```
MON ACTIVITÉ
├── Aujourd'hui        (dashboard du jour)
├── Agenda             (calendrier + smart slots)
└── Facturation        (FSE + honoraires libres)

MES PATIENTS
├── Patients           (liste + filtres)
├── Tâches             (cross-patients tasks)
├── Adressages         (envoi/réception de références)
├── Base documentaire  (knowledge clinique interne)
└── Documents          (documents patients centralisés)

MON RÉSEAU
├── Messages           (messagerie de coordination)
├── Vue réseau         (tableau tous patients du réseau)
├── Collaboration      (Hub Réseaux CPTS/associations)
├── Équipe             (confrères, RPPS, invitations)
└── Annuaire           (à venir)
```

### Pages publiques (hors cockpit)

```
/soignants/[slug]      (profil public + prise de RDV)
/pitch                 (deck VC scroll)
/decouvrir             (page hôpital/réseau)
/professionnels/[spec] (landing pages par spécialité)
/blog/[slug]           (articles SEO pathologies)
/gabrielle             (case study)
```

### Fiche patient (6 onglets)

```
Vue Globale    → résumé IA, deltas, trajectoire
Suivi          → BIA, biologie, anthropo, heatmap
Dossier        → notes, journal, timeline, documents, ordonnances
Coordination   → messages, adressages, RCP, équipe
Parcours       → CIE (pathway steps), conformité
Intelligence   → recherche knowledge clinique contextuelle
```

---

## 4. Design system actuel

### Couleurs
```
Primary :     #5B4EC4  (violet doux — actions primaires, liens, focus)
Secondary :   #2BA89C  (teal — éléments secondaires, validations)
Background :  #FAFAF8  (crème très légère — fond global)
Alt BG :      #F5F3EF  (fond alternatif, cards légèrement marquées)
Cards :       #FFFFFF  avec border rgba(26,26,46,0.06)
Text dark :   #1A1A2E
Text body :   #4A4A5A
Text muted :  #8A8A96
Primary light: #EEEDFB (violet très clair — hover, highlights)

Severity (désaturée — pour ne pas alarmer) :
Critical :    #DC2626 (rouge)
High :        #D97706 (orange/amber)
Info :        #2563EB (bleu)
Success :     #059669 (vert)
```

### Typographie
```
Headings / UI : Plus Jakarta Sans (Google Fonts)
Data / Labels : Inter
Taille base :   16px (jamais moins sur mobile)
Line-height :   1.5–1.75 sur le body
```

### Composants existants
- `NamiCard` : card avec variants depth/lift, hover shadow indigo
- `ShimmerCard` : placeholder loading animé
- `CompletenessPlant` : indicateur de complétude sous forme de plante qui grandit
- `TaskCheckbox` : checkbox animée pour les tâches
- `ActivityFeed` : feed d'activité flottant
- `PrepMode` : modale plein écran pré-consultation
- `ConsultationWidget` : widget flottant draggable d'enregistrement
- `CommandPalette` : recherche globale (Cmd+K)

### Animations
- Framer Motion pour les transitions de pages
- CSS transitions 150-300ms pour micro-interactions
- `prefers-reduced-motion` respecté

---

## 5. Description fonctionnelle page par page

### 5.1 /aujourd-hui — Tableau de bord du jour

**Rôle :** Page d'atterrissage post-login. Répond à "Que dois-je faire aujourd'hui ?"

**Blocs actuels :**
- Mes RDV du jour (chronologiques, avec boutons contextuels : Préparer / Démarrer / Voir dossier)
- À faire : tâches en retard + tâches du jour + adressages en attente + demandes de RDV
- Activité récente du réseau
- Statistiques rapides : nb patients actifs, nb tâches, nb messages non lus

**Contraintes :**
- Les boutons d'action changent selon le statut du RDV — ne jamais les simplifier en un seul bouton
- La priorité des tâches est déterministe (retard > urgent > today > sans date) — ne pas réorganiser au hasard
- Aucun score de risque clinique ne peut apparaître ici (ni "patients à surveiller", ni "risque élevé")

**Opportunités de redesign :**
- La page actuelle est dense et peu hiérarchisée — trouver un meilleur équilibre entre "voir l'agenda" et "gérer les urgences"
- Le soignant doit pouvoir saisir d'un coup d'œil : combien de RDV aujourd'hui, combien de choses urgentes
- Potentiel pour un "mode focus" (uniquement le prochain RDV + une action)

---

### 5.2 /agenda — Agenda intelligent

**Rôle :** Calendrier semaine avec grille pixel/minute + gestion des RDV + smart slots.

**Blocs actuels :**
- Grille semaine (2px/minute, 8h-21h, une colonne par jour)
- Blocs colorés par statut (PENDING/CONFIRMED/ARRIVED/COMPLETED/CANCELLED/NO_SHOW)
- AppointmentDrawer (panneau latéral au clic sur un bloc)
- CreateAppointmentModal (RDV patient ou bloc absence)
- AgendaHeader (navigation semaine prev/next, vue jour/semaine)
- Paramétrage accessible via /agenda/parametrage

**Contraintes :**
- La grille doit rester en pixel/minute (pas de cases de 30min fixes)
- Les couleurs de statut sont cliniquement signifiantes — ne pas les changer pour des raisons esthétiques
- Le drawer reste visible avec la grille (pas de modale plein écran qui cache le contexte)
- Le badge "Créneau recommandé" sur les smart slots est fonctionnel (algorithme d'adjacence), pas décoratif

**Opportunités :**
- L'AgendaHeader est actuellement peu visible — améliorer la navigation temporelle
- Affichage de la charge de la semaine en un coup d'œil (nombre de RDV, heures pleines/creuses)
- Vue jour possible pour les journées chargées

---

### 5.3 /patients — Liste des patients

**Rôle :** Répertoire central de tous les patients avec statuts, niveaux de risque et activité.

**Blocs actuels :**
- Tabs : Tous / Actifs / Prioritaires (Critical+High risk) / En pause / Clôturés
- Filtres : niveau de risque, type de cas, activité (récente/inactive/jamais)
- Bannière "patients inactifs" (>7j sans activité, 5 noms affichés)
- Vue tableau (compact, triable) ou vue cartes (sparkline poids, badge risque, plante complétude)
- Export CSV
- Bouton import (Doctolib) + création manuelle

**Éléments de chaque carte patient :**
- Avatar + nom + prénom
- Badge type de cas (TCA / Obésité / Nutrition / etc.)
- Plante complétude (CompletenessPlant — visuel de l'état du dossier)
- Badge risque (Critical / High / Medium / Low / None)
- Sparkline poids (mini-graphe des 30 derniers jours si mesures disponibles)
- Nb membres de l'équipe soignante
- Dernière activité (relative : "il y a 2 jours")

**Contraintes :**
- Le badge risque reflète un niveau défini manuellement par le soignant, jamais calculé par IA
- La plante complétude est basée sur des métadonnées (présence/absence de champs), jamais sur des données cliniques
- L'export CSV n'exporte pas les données cliniques — uniquement les métadonnées admin

**Opportunités :**
- La vue carte est riche mais peut être surchargée pour les gros portefeuilles (>50 patients)
- Un mode "liste compacte" plus rapide pour scanner 80 patients pourrait être utile
- Le filtre "inactifs" mériterait d'être plus proéminent (patients perdus de vue = risque coordination)

---

### 5.4 /patients/[id] — Fiche patient (6 onglets)

**Rôle :** Centre de gravité de la coordination. Tout ce qu'on sait sur un patient, toutes les actions qu'on peut faire.

**Voir le fichier `docs/spec-fonctionnelle-patient.md` pour la description complète.**

**Résumé des onglets :**

| Onglet | Contenu principal | Spécificité |
|--------|------------------|-------------|
| Vue Globale | Résumé IA, deltas, trajectoire OLS, conditions | Résumé = brouillon IA toujours |
| Suivi | BIA (48 métriques), biologie, anthropo | BIA extrait depuis PDF par Claude Haiku |
| Dossier | Notes inline, journal, timeline, documents, ordonnances | Journal = source mobile uniquement |
| Coordination | Messages, adressages, RCP, équipe | Triple barrière anti-urgence sur messagerie |
| Parcours | Steps du pathway (CIE), statuts, conformité | Statuts = sens clinique, pas esthétique |
| Intelligence | Recherche knowledge contextuelle au patient | Résultats = chunks RAG, pas de décision IA |

**6 boutons du PatientHeader jamais à supprimer :**
1. Préparer la consultation (→ PrepMode)
2. Démarrer l'enregistrement (→ ConsultationWidget)
3. Nouveau message (→ messagerie)
4. Créer une tâche
5. Adresser le patient
6. Voir le parcours

**Contraintes critiques :**
- Les notes sont inline (pas en modale) — le soignant doit voir le contexte pendant qu'il écrit
- Le journal patient = toujours des entrées mobile. Jamais un champ de saisie soignant dans cet onglet
- Le badge "Brouillon IA" est obligatoire légalement sur tous les résumés/notes générées
- DELTA_POLARITY : la flèche verte ne signifie pas toujours "augmentation" — dépend de la métrique

---

### 5.5 /documents — Documents centralisés

**Rôle :** Hub de tous les documents (ordonnances, bilans, comptes-rendus) de tous les patients.

**Blocs actuels :**
- Liste unifiée de tous les documents (tous care cases confondus)
- Recherche par titre ou type
- Badges par type : consultation (bleu), biologie (teal), prescription (violet), hospitalisation (orange)
- Badge "Extraction Bio disponible" sur les bilans biologiques
- Modal d'extraction biologique (multi-étapes : scan IA → tableau éditable → valider)

**La modal d'extraction bio :**
1. Claude Haiku analyse le PDF du bilan
2. Tableau éditable : valeur, unité, référence, confidence (icône couleur)
3. Checkboxes pour inclure/exclure chaque valeur
4. Date de prélèvement + laboratoire éditables
5. Valider → crée des Observations en base

**Contraintes :**
- Le score de confiance par valeur ne peut pas disparaître — il est obligatoire pour la validation humaine
- "Valider" doit être une action explicite — jamais auto-import
- Les types de documents doivent rester distincts visuellement (différents types = différentes actions possibles)

**Opportunités :**
- La liste est actuellement peu structurée (tous patients mélangés) — un regroupement par patient ou par date serait utile
- Le flux d'extraction bio est multi-étapes mais peut être simplifié visuellement

---

### 5.6 /intelligence — Base de connaissances cliniques

**Rôle :** Moteur de recherche sur les guidelines cliniques internes (FFAB, HAS, arbres décisionnels, pathologies, PCR).

**Blocs actuels :**
- Dashboard qualité (collapsible) : score moyen RAG, taux hallucination, couverture, tendance 30j
- Barre de recherche + suggestions prédéfinies
- Filtres par source : SEM (sémantique), ALGO (algorithmique), KE (knowledge expert), PCR (protocoles de coordination), REF (références)
- Cartes résultat : badge source, titre section, score (5 points), preview texte, "Voir plus"
- Modal détail : markdown complet avec tables, listes, sections

**Contraintes :**
- Le dashboard qualité doit rester accessible (il montre la fiabilité du système au soignant)
- Les badges source sont importants : SEM vs KE vs PCR n'ont pas la même valeur d'autorité
- Aucun résultat de recherche ne peut être présenté comme une "recommandation" — c'est une documentation clinique
- Le bouton "Voir sources" doit rester accessible (traçabilité AI Act Art. 50)

**Opportunités :**
- La page ressemble à un moteur de recherche générique — elle mériterait d'être plus contextualisée à la spécialité de l'utilisateur
- Le dashboard qualité est technique — intéressant pour Margot mais peut intimider d'autres utilisateurs

---

### 5.7 /reseau — Hub Réseau

**Rôle :** Découvrir et rejoindre des réseaux de soins (CPTS, MSP, associations, hôpitaux), voir les patients du réseau commun.

**3 onglets :**

**Mes réseaux :** organisations que le soignant a rejointes. Cards avec nom, type, nb membres, conversations actives.

**Explorer :** catalogue de toutes les organisations. Filtres par type (CPTS, réseau, hôpital, MSP, cabinet). Cards avec bouton "Rejoindre" (direct) ou "Demander à rejoindre" (avec message d'approbation). Statuts : Membre / Demande en attente / Rejoindre.

**Vue réseau (coordinateur) :** tableau de tous les patients actifs dans son réseau. KPIs en haut (patients actifs, tâches en retard, RDV aujourd'hui). Tableau : nom, type de cas, statut, âge, stade du parcours, tâches pendantes, alertes, prochain RDV, taille de l'équipe. Auto-refresh 60s.

**Contraintes légales (critiques) :**
- Jamais de "Recommandé" ou "Top" sur les organisations
- Jamais de classement basé sur un critère payant
- L'affiliation CPTS est affichée car déclarée par le soignant lui-même (R4127-19-1)
- La "Vue réseau" n'est accessible qu'aux membres — les non-membres voient une invitation

**Contraintes fonctionnelles :**
- Le bouton "Rejoindre" a 4 états possibles selon le statut de la demande — ils doivent tous être visuellement distincts
- L'auto-refresh de la vue réseau est nécessaire pour les coordinateurs de soins (charge de travail temps réel)

**Opportunités :**
- Les 3 onglets sont très différents dans leur nature (annuaire vs. tableau de bord) — envisager une navigation plus explicite
- La vue réseau mériterait d'être plus mise en avant pour les structures type HAP/CPTS

---

### 5.8 /equipe — Équipe et annuaire professionnel

**Rôle :** Gérer ses collègues sur Nami, ses structures, rechercher dans l'annuaire RPPS, envoyer des invitations.

**4 onglets :**
- **Confrères :** soignants déjà sur Nami, patients communs, lien direct vers leurs messages
- **Structures :** organisations dans lesquelles le soignant est inscrit
- **Annuaire RPPS :** recherche dans 564K professionnels de santé français (nom, spécialité, ville, secteur)
- **Invitations :** invitations envoyées avec statut (Acceptée / En attente / Expirée) + bouton renvoyer

**InviteModal :** 2 méthodes : email avec message personnalisé, ou lien d'invitation copiable. Validité 7 jours.

**Contraintes :**
- L'annuaire RPPS ne peut afficher que des informations objectives : nom, spécialité, ville, secteur de convention — pas de classement, pas de notation
- Le bouton "Inviter" sur l'annuaire RPPS envoie une invitation Nami, pas un email médical de présentation

**Opportunités :**
- Les 4 onglets sont de nature très différente (gestion vs. annuaire) — la navigation pourrait être plus claire
- L'InviteModal est un moment d'acquisition utilisateur — il mériterait plus de soin UX

---

### 5.9 /facturation — Module de facturation

**Rôle :** Gérer les Feuilles de Soins Électroniques (FSE) et les notes d'honoraires libres.

**4 onglets :**
- **Feuilles de soins :** layout liste/détail. Créer une FSE : patient + date + mode paiement + ALD + actes NGAP/CCAM. Cycle de vie : DRAFT → READY → SIGNED → TRANSMITTED → ACKNOWLEDGED → PAID/REJECTED/CANCELLED
- **Note d'honoraires libre :** formulaire simple (prestations libres, calcul auto, PDF)
- **Dashboard :** KPIs facturation, revenus, taux d'impayés
- **Paramètres :** RPPS, numéro AM, FINESS, SIRET, secteur conventionnel, OPTAM

**Contraintes :**
- Les statuts FSE sont des étapes d'un workflow réglementé — ne pas les simplifier
- Le cycle de vie de la FSE doit être linéaire et irréversible visuellement (on ne "dévalide" pas une FSE transmise)
- Le panneau liste/détail doit rester — le soignant compare des factures en parallèle

**Opportunités :**
- Le module facturation est fonctionnel mais visuellement austère — il peut être modernisé
- Le dashboard de facturation (onglet 3) mériterait d'être plus visuel (graphes CA mensuel, répartition par type d'acte)

---

### 5.10 Page soignant publique /soignants/[slug]

**Rôle :** Profil public du soignant + prise de RDV pour les patients.

**Blocs actuels :**
- Profil : photo, nom, spécialités, bio, langues, affiliations CPTS/réseaux
- Localisation + carte
- Smart slots : créneaux "recommandés" + "disponibles"
- Authentification gate (login/signup obligatoire avant de finaliser)
- Saisie du motif
- Confirmation (après acceptation par le soignant)

**Contraintes légales (non négociables) :**
- Aucune notation / avis patient (R4127-19-1)
- Aucun badge "Recommandé par Nami" (R4127-80)
- Les affiliations CPTS/réseaux = affichage factuel d'adhésions déclarées par le professionnel
- Le badge "Créneau optimal" = critère neutre documenté (algorithme d'adjacence)

---

## 6. Composants globaux du cockpit

### CommandPalette (Cmd+K)
Recherche globale : patients, tâches, notes, navigation. Accessible depuis n'importe quelle page.

### ActivityFeed
Panneau latéral droit (optionnel) : flux d'activité en temps réel (notes créées, messages reçus, tâches complétées).

### RecordingWidget / ConsultationWidget
Widget flottant draggable : enregistrement audio + transcription + génération de note IA. Accessible depuis la fiche patient et depuis /aujourd-hui. **Doit rester draggable** (le soignant navigue dans la fiche pendant l'enregistrement).

### PrepMode
Modale plein écran : résumé pré-consultation (IA + deltas + tâches + historique RDV). Chargement de 4 sources en parallèle. Badge "Brouillon IA" obligatoire.

### Banners (header)
- Banner email non vérifié (amber)
- Banner MFA non activé (amber)
- Banner diff-aware summary (après une note qui a détecté un changement)

---

## 7. Contraintes de design non négociables

### Légales (AI Act Art. 50 + MDR)
1. **Badge "Brouillon IA — à vérifier"** obligatoire sur TOUT output IA (résumés, notes générées, extractions)
2. **Bouton validation humaine explicite** avant tout insert IA dans le dossier — jamais auto-insert
3. **Lien "Voir sources"** accessible sur les résultats de recherche knowledge
4. **Aucun score de risque patient** affiché (Art. 5 AI Act — scoring social interdit)
5. **Aucune "recommandation clinique"** dans les outputs IA — uniquement des "brouillons"

### Cliniques
6. **Couleurs de statut RDV** signifiantes — PATIENT_ARRIVED en vert vif n'est pas un choix esthétique
7. **CIE statuts** (FUTURE/APPROACHING/IN_WINDOW/OVERDUE) — sens clinique à préserver dans les couleurs
8. **DELTA_POLARITY** — la flèche verte ≠ toujours "hausse". Dépend de la métrique (masse grasse : vert = baisse)
9. **Triple barrière anti-urgence** sur la messagerie — bannière + interstitiel + microcopy "Pas une urgence"
10. **Statut "Délivré"** (pas "Lu") sur les messages — ne jamais montrer un statut "lu" au patient

### Fonctionnelles
11. **Grille agenda en pixel/minute** — pas de cases de 30min fixes
12. **ConsultationWidget draggable** — overlay bloquant interdit
13. **PrepMode charge 4 appels en parallèle** — ne pas sérialiser
14. **Journal patient = source mobile uniquement** — jamais un champ de saisie soignant
15. **Secrétaire = zéro contenu clinique** — son interface ne doit jamais afficher notes, observations, prescriptions

---

## 8. Problèmes UX actuels identifiés

### Navigation
- La sidebar à 3 niveaux peut être confuse (trop d'items, pas de hiérarchie visuelle claire)
- "Base documentaire" et "Documents" sont deux choses distinctes mais leur nom est similaire
- Le switch entre pages lose le contexte (retour arrière = retour au début de la liste)

### Densité d'information
- La fiche patient est très dense — 6 onglets avec beaucoup de contenu par onglet
- La page /aujourd-hui essaie de tout faire (agenda + tâches + actualités + stats)
- /intelligence ressemble à un moteur de recherche générique sans personnalisation

### Onboarding
- Le soignant qui arrive pour la première fois ne comprend pas immédiatement où créer son premier patient
- L'AgendaSetup wizard est bien pensé mais arrive trop tôt (avant que le soignant ait des patients)

### Mobile (cockpit web)
- Le cockpit web n'est pas pensé pour mobile — certaines pages sont inutilisables sur téléphone
- Mais le soignant veut parfois vérifier son agenda depuis son téléphone entre deux RDV

### Espace secrétaire
- Il n'y a pas de "mode secrétaire" clairement identifié — la secrétaire navigue dans le même cockpit que le soignant mais avec des permissions réduites, ce qui crée de la confusion

---

## 9. Ce que la refonte doit impérativement réussir

1. **Hiérarchie visuelle claire** : le soignant sait en 3 secondes ce qui est urgent vs. secondaire
2. **Réduction de la charge cognitive** : moins d'informations simultanées, plus de progressivité
3. **Cohérence du design system** : les mêmes patterns partout (cards, drawers, modales, états)
4. **Accessibilité** : contraste 4.5:1 minimum, focus visible, labels aria, taille texte ≥ 16px mobile
5. **Performance perçue** : skeleton loading partout, pas de flash de contenu vide
6. **Espace secrétaire distinct** : vue clairement différenciée pour la secrétaire, pas une version dégradée du cockpit soignant
7. **PrepMode comme moment signature** : c'est THE interaction différenciante de Nami — elle doit être belle
8. **Plante complétude** : conserver cet élément de gamification — c'est un différenciateur émotionnel fort
9. **Respect du positionnement** : l'interface ne doit jamais ressembler à un logiciel médical ou à un EHR — elle doit ressembler à un outil de coordination moderne
10. **Wording** : ne jamais laisser passer un mot interdit (surveiller, alerter, risque, anormal) dans les labels, placeholders ou empty states

---

## 10. Demande spécifique pour la refonte

### Périmètre de la refonte
- Cockpit soignant complet (toutes les pages listées ci-dessus)
- Espace secrétaire (vue dédiée)
- Page publique soignant (/soignants/[slug])
- Design system unifié applicable aux 3 contextes

### Ce qui peut changer
- Layout global et navigation
- Composants visuels (cards, tableaux, modales, drawers)
- Hiérarchie de l'information dans chaque page
- Couleurs secondaires et palette d'interface (primary #5B4EC4 et teal #2BA89C sont à conserver)
- Typographie (Plus Jakarta Sans + Inter sont à conserver)
- Animations et transitions

### Ce qui NE peut PAS changer
- Les couleurs de statut clinique (RDV, CIE, sévérité)
- Le badge "Brouillon IA — à vérifier"
- La nature draggable du ConsultationWidget
- La distinction "Délivré" vs "Lu" sur la messagerie
- La triple barrière anti-urgence
- La source mobile du journal patient (pas de champ de saisie soignant)

### Format attendu
Pour chaque page : wireframe ou mockup avec annotations expliquant les choix UX. Pour les composants clés (fiche patient, agenda, PrepMode) : flux interactif si possible.

---

## Annexes

- `docs/spec-fonctionnelle-patient.md` — Spécification complète de la fiche patient
- `docs/spec-fonctionnelle-agenda.md` — Spécification complète du module agenda
- `.claude/skills/nami-legal/references/claude-ai-export.md` — Framework légal complet (MDR, RGPD, AI Act, annuaire/CPTS)
