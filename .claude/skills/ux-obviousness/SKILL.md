---
name: ux-obviousness
description: "Audit, challenge et refonte de l'expérience utilisateur Nami pour atteindre l'évidence absolue. Utiliser cette skill chaque fois qu'on travaille sur un écran, un flux, une page, un composant, un parcours utilisateur, une navigation, ou une interaction de la plateforme Nami (web ou mobile). Déclencher aussi pour : 'c'est pas clair', 'trop d'informations', 'comment simplifier', 'le user va pas comprendre', 'c'est pas évident', 'refonte UX', 'architecture de page', 'parcours utilisateur', 'information architecture', 'simplifier l'interface', 'réduire la charge cognitive', 'progressive disclosure', 'je trouve que c'est trop chargé', 'on peut faire plus simple', 'c'est un peu le bordel'. Cette skill est le FILTRE obligatoire avant tout travail UI/UX sur Nami — elle challenge chaque pixel, chaque mot, chaque interaction avec un seul critère : est-ce ÉVIDENT ?"
---

# UX OBVIOUSNESS — Le Framework de l'Évidence Absolue

## LA THÈSE

L'évidence n'est pas une fonctionnalité. C'est un résultat. Quand un soignant ouvre Nami et sait exactement quoi faire sans réfléchir, c'est que chaque décision de design a été prise POUR lui, pas DEVANT lui.

Ce framework inverse la logique : on part de ce que le soignant CHERCHE à faire, pas de ce que le système PEUT faire.

---

## LES 7 LOIS DE L'ÉVIDENCE

### Loi 1 — L'Écran Unique Question
Chaque écran répond à UNE question en max 8 mots.
```
/aujourd-hui    → "Qu'est-ce que je dois faire maintenant ?"
/patients       → "Où en sont mes patients ?"
/patients/[id]  → "Qu'est-ce qui se passe avec CE patient ?"
/agenda         → "Quand est mon prochain truc ?"
/intelligence   → "Que disent les guidelines sur ce sujet ?"
/adressages     → "Où en sont mes orientations ?"
```

### Loi 2 — Le Test des 3 Secondes
Un utilisateur qui arrive sur un écran pour la première fois comprend en 3 secondes : où il est (contexte), ce qu'il voit (contenu principal), ce qu'il peut faire (action principale). 1 seul bouton primaire (#5B4EC4) par écran.

### Loi 3 — La Hiérarchie Radicale
3 niveaux max. Niveau 1 = l'essentiel (60% attention), Niveau 2 = l'utile (30%), Niveau 3 = l'optionnel (10%, caché derrière un clic). Si tout est au même niveau, rien n'est important.

### Loi 4 — Le Progressive Disclosure Agressif
Couche 0 = scan (5-7 éléments max au chargement). Couche 1 = clic (panneau, drawer, expansion). Couche 2 = navigation (page dédiée). Les Couche 0 doivent suffire à 80% des visites.

### Loi 5 — La Grammaire d'Interaction
Chaque type d'action a UN pattern, toujours le même, partout. VOIR DÉTAILS → panneau latéral. CRÉER → bouton "+" en haut à droite. MODIFIER → inline edit ou icône au hover. SUPPRIMER → menu "..." + confirmation. NAVIGUER → clic sur titre. FILTRER → barre sticky. CHERCHER → ⌘K.

### Loi 6 — Le Mot Juste
Max 3 mots pour un bouton. Labels en langage soignant, pas en jargon technique. "Mes patients" pas "Gestion des patients". "Enregistrer" pas "Soumettre la saisie".

### Loi 7 — Le Vide Est Un Signal
Padding intérieur cards ≥ 20px. Gap entre cards ≥ 16px. Sections séparées par 32-48px de vide. Max 5-7 éléments distincts visibles sans scroll.

---

## GARDE-FOUS FONCTIONNELS (non négociables)

Ces règles viennent des specs fonctionnelles. Tout redesign DOIT les respecter.

### Éléments JAMAIS supprimables
- **6 boutons du header patient** : Note · Tâche · Questionnaire · Adresser · Enregistrer · Synthèse — JAMAIS cachés derrière un menu
- **Badge "Brouillon IA — à vérifier"** — obligatoire légalement (AI Act Art. 50) sur TOUT output IA
- **Triple barrière urgence messagerie** — bannière 15/112 permanente, pas de "lu/vu", push sans contenu
- **Consentement patient dans ReferralModal** — checkbox JAMAIS pré-cochée (Art. L.1110-4 CSP)
- **Soft delete notes** — toast "Annuler" 30 secondes (obligation données de santé)
- **Disclaimer MDR** sur toute réponse QA clinique — non minimisable
- **Sources citées** dans le QA clinique — bouton "Voir sources" obligatoire (AI Act Art. 50)

### Logiques métier à respecter
- **NoteInline** — inline sous le header (PAS modal) — le soignant voit le dossier derrière
- **DELTA_POLARITY** — la couleur dépend de la MÉTRIQUE, pas de la direction (anorexie: poids ↑ = rouge)
- **Statut MISSING** — aussi important que CRITICAL (dossier incomplet = risque)
- **Journal patient** — source MOBILE uniquement, jamais de saisie soignant dans cet onglet
- **Badge confidence IA photos repas** — 🟢/🟡/🔴 toujours visible et éditable
- **Accordéon bio** — ouverture automatique sur les valeurs anormales (pas tous fermés)
- **Couleurs statut CIE** — FUTURE/APPROACHING/IN_WINDOW/OVERDUE/COMPLETED/SKIPPED = sens clinique
- **Couleurs statut RDV** — PENDING/CONFIRMED/ARRIVED/COMPLETED/CANCELLED/NO_SHOW/ABSENCE = sens clinique
- **Grille agenda** — pixel/minute (2px/min), pas de cases 30min fixes
- **ConsultationWidget** — draggable, jamais un overlay bloquant
- **PrepMode** — 4 appels en parallèle (Promise.all), jamais sérialisés
- **Secrétaire** — zéro contenu clinique visible
- **Adressages EMERGENCY** — toujours en tête de liste, jamais enterrés
- **12 statuts adressage** — sens clinique distinct, ne pas regrouper en 3
- **Statuts terminaux** — DECLINED/CANCELLED/EXPIRED/FIRST_VISIT_COMPLETED = irréversibles

### Wording interdit (compliance MDR)
Jamais "alerte clinique" → "indicateur de complétude". Jamais "surveillance" → "centraliser". Jamais "risque clinique" → "coordination". Jamais "détecter" → "observer/noter". Aucun score de risque patient affiché (Art. 5 AI Act).

---

## SCORES D'ÉVIDENCE — AUDIT AVRIL 2026

```
ÉCRAN                    AVANT  CIBLE  PROBLÈME PRINCIPAL
/aujourd-hui              4/10   8/10  Dashboard sapin de noël, KPIs non actionnables
/agenda (semaine)         8/10   9/10  Meilleur écran. Prochain RDV ne pop pas assez
/agenda (paramètres)      8/10   9/10  Bien. Ajouter onglets Agenda intelligent + Notifs
/patients (liste)         7/10   8/10  Bien. Trop de boutons action en haut
/patients/[id] vue glob.  2/10   8/10  27 sections = 8 screenshots. CHANTIER #1
/patients/[id] suivi      6/10   8/10  Chevauchement Vue globale, bio critique absente
/patients/[id] parcours   3/10   8/10  Mur de 28 étapes en liste plate
/patients/[id] dossier    5/10   7/10  5 sous-onglets justifiés, ligne de vie = doublons
/patients/[id] coord.     6/10   8/10  Messages sans barrière urgence visible
/intelligence             5/10   8/10  Data mal formatée (chunks PDF brut)
/adressages               7/10   8/10  Layout correct, priorité non visible, motif déborde
```

---

## DÉCISIONS DE REDESIGN VALIDÉES

### /aujourd-hui
- VIRÉ : KPIs en haut, "Mes patients" (doublon), activité récente du main
- MONTÉ : adressages en zone prioritaire (expansibles avec détail patient/motif)
- GARDÉ : "Ma journée" + "À faire"
- AJOUTÉ : sidebar droite (Actualités réseau + Messages)

### /patients/[id] — Vue globale
- 27 sections → 4 blocs : badge risque, jauges critiques, situation 2 phrases, actions 48h
- Résumé IA complet → "Voir le résumé complet →" (Couche 1)
- TrajectoryDeviationBanner (z-scores, sparklines, dismissable temporairement)
- DeltaTickerBanner (DELTA_POLARITY respecté)
- KeyIndicatorsGrid par domaine avec statuts OK/ALERT/CRITICAL/MISSING
- Sidebar : à faire, Infos patient, Conditions (PRIMARY/COMORBIDITY/SUSPECTED), Équipe

### /patients/[id] — Suivi
- Sections collapsibles : Anthropo (ouvert), Bio (ouvert auto si alertes), BIA (fermé), Questionnaires
- Courbe pondérale avec seuil IMC en pointillé
- Heatmap journal alimentaire 56 jours

### /patients/[id] — Parcours
- Barre progression + onglets par phase + "Votre prochaine étape" hero
- "À anticiper" (trouver psy, prescrire ECG)
- 6 statuts CIE, badges acte clinique, expand détail par étape
- Double profil expert (scanne) / novice (suit pas à pas)

### /patients/[id] — Dossier (5 sous-onglets conservés)
- Notes : bordure gauche par type, badges Transcription/Extraction
- Journal : bandeau mobile, KPIs, analyse IA photos, confidence badge
- Ligne de vie : entrées groupées, filtres
- Documents : "🧪 Extraire" uniquement sur bio/BIA
- Ordonnances : empty state + scanner

### /patients/[id] — Coordination (4 sous-onglets conservés)
- Messages : triple barrière, pas de lu/vu
- Adressages : séparation suggestions IA vs réels
- RCP : async/sync
- Équipe : LEAD badge, dernier contact

### /agenda
- Toggle Jour/Semaine
- Vue semaine : blocs avec bordure pathologie, badge statut, drawer latéral
- Vue jour : cards riches avec contexte clinique, boutons Préparer/Démarrer
- PrepMode : modal plein écran, 5 sections
- ConsultationWidget : flottant, cycle IDLE → RECORDING → NOTE_READY

### /agenda/parametrage (5 onglets)
- Lieux, Disponibilités (grille hebdo + exceptions), Consultations (accordion), Agenda intelligent (toggle + buffer + aperçu), Notifications (rappels patients/soignant)

### /intelligence
- Toggle Recherche documentaire / QA Clinique
- Recherche : bordure gauche par catégorie (REF > ALGO > PCR > KE > SEM), badge qualité source
- QA : réponse RAG structurée, citations, confidence, disclaimer MDR
- Chunks mal formatés → warning + redirection QA

### /adressages
- Liste/détail (panneau), KPIs cliquables, badge priorité visible, motif tronqué 2 lignes
- Tri par priorité, stepper avec timestamps, modales inline acceptation/refus

---

## LE PARCOURS DE SOINS — CŒUR UX

### 2 types de parcours
SÉQUENTIEL (HDJ) — frise horizontale, 3-8 étapes. PARALLÈLE (anorexie, PCR) — vue par phase, 15-30+ étapes.

### 3 niveaux de valeur
GUIDAGE (MG qui ne sait pas) — mode d'emploi par étape. COORDINATION (soignants ensemble) — signaux contextuels. INTELLIGENCE (futur) — seuils calculés.

### 2 profils utilisateur
EXPERT — scanne, vérifie la complétude. NOVICE — suit pas à pas, a besoin du "comment faire" et de "à anticiper".

### La coordination ≠ blocage
Le parcours HAS avance quoi qu'il arrive. Les signaux sont des messages ancrés dans le parcours, pas des dépendances bloquantes.

---

## PROCESSUS D'AUDIT

Pour chaque écran : (1) Formuler la question ≤ 8 mots. (2) Test 3 secondes. (3) Classer Niveau 1/2/3. (4) Le prochain clic est-il visible ? (5) Test d'enlèvement. (6) Cohérence avec les autres pages.

---

## ARTICULATION SKILLS
```
ux-obviousness     = QUOI montrer, QUOI cacher (toujours EN PREMIER)
ux-platform        = COMMENT construire (composants, animations)
ux-onboarding      = COMMENT accueillir (onboarding, first-run)
react-native-ux    = COMMENT adapter au mobile
nami-brand-copy    = COMMENT écrire (wording, compliance)
apple-premium-site = COMMENT rendre premium (animations, typo)
```

## PROTOTYPES DE RÉFÉRENCE (avril 2026)
```
nami-redesign-final.jsx        → Dashboard + Patient Vue globale + Suivi
nami-patient-part2.jsx          → Patient Parcours + Dossier + Coordination
nami-agenda-redesign.jsx        → Agenda semaine + jour + PrepMode + ConsultationWidget
nami-agenda-settings.jsx        → Paramètres agenda (5 onglets)
nami-intelligence-redesign.jsx  → Références cliniques + QA Clinique
nami-adressages-redesign.jsx    → Adressages (identité visuelle à harmoniser)
```
