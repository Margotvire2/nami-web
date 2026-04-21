# Spécification fonctionnelle — Section patient Nami
> Document de référence pour la refonte UX/UI. Ne jamais redesigner une page sans avoir lu la section correspondante.  
> Dernière mise à jour : avril 2026

---

## Principe fondamental à ne jamais oublier

Nami n'est **pas** un dossier médical. C'est un **outil de coordination**. Chaque élément de l'interface existe pour réduire la charge cognitive du soignant, pas pour stocker de l'information. La distinction est importante : un redesign qui "simplifie" en retirant des éléments peut casser un flux clinique complet.

---

## Architecture globale de la fiche patient

```
/patients/[careCaseId]
│
├── PatientHeader (permanent, sticky)
│   └── 6 boutons d'action rapide
│
├── NoteInline (conditionnel — apparaît au clic "Note")
├── NoteAnalysisBanner (conditionnel — apparaît après création d'une note)
│
└── 6 tabs
    ├── Vue Globale       → photo instantanée du patient
    ├── Suivi             → données longitudinales structurées
    ├── Dossier           → 5 sous-onglets (notes, journal, timeline, docs, ordonnances)
    ├── Coordination      → 4 sous-onglets (messages, adressages, RCP, équipe)
    ├── Parcours          → chemin clinique structuré (CIE)
    └── Pédiatrie         → conditionnel (uniquement si caseType = PEDIATRIC)
```

**Pourquoi 6 tabs ?** Chaque tab correspond à un moment différent du travail clinique :
- **Vue Globale** → avant la consultation (briefing)
- **Suivi** → pendant ou après (données objectives)
- **Dossier** → après (documentation)
- **Coordination** → entre les consultations (relais équipe)
- **Parcours** → vision long terme (où en est-on ?)

---

## PatientHeader — Barre d'actions rapides

### Ce que c'est
Barre sticky en haut de toutes les vues du patient. Toujours visible, jamais scrollable.

### Ce qu'elle affiche
- **Identité** : Prénom Nom · âge calculé en temps réel depuis `birthDate` · sexe · poids actuel (dernière Observation `weight_kg`) · delta poids vs mesure précédente (↑ ou ↓ en %, coloré)
- **IMC** calculé à la volée depuis poids + taille
- **Badge condition primaire** : condition de type PRIMARY du dossier → cliquable → renvoie vers la fiche pathologie publique (SEO) si un match CIM-11 existe

### Les 6 boutons — logique de chacun

| Bouton | Ce qui se passe | Pourquoi ici |
|--------|----------------|--------------|
| ✏️ Note | Affiche `NoteInline` sous le header (inline, pas de modal) | Saisie rapide sans perdre le contexte de l'écran courant |
| ☑️ Tâche | Ouvre `QuickTaskModal` | Créer une tâche en 10 secondes depuis n'importe quelle vue |
| 📋 Questionnaire | Ouvre `ScheduleQuestionnaireModal` | Programmer un EDE-Q/PHQ-9/etc. directement depuis le dossier |
| ↗️ Adresser | Ouvre `ReferralModal` (3 étapes) | Adressage = action fréquente, doit être accessible de partout |
| 🎙️ Enregistrer | Démarre l'enregistrement audio de consultation | Génère une Transcription + Note automatiquement |
| ✨ Synthèse | Lance le job async de génération de résumé IA | Préparer un briefing avant RCP ou avant consultation |

**Règle de design** : ces 6 boutons ne doivent JAMAIS être cachés derrière un menu. Ce sont les 6 actions les plus fréquentes de toute la plateforme.

---

## NoteInline + NoteAnalysisBanner

### NoteInline
Apparaît **sous le header** (pas en modal) quand on clique ✏️. C'est intentionnel : le soignant peut voir le dossier derrière pendant qu'il écrit.

**Ce qui se passe à la validation** :
1. `POST /care-cases/{id}/notes` → type = EVOLUTION
2. Le champ disparaît
3. NoteAnalysisBanner apparaît automatiquement

### NoteAnalysisBanner
**Logique** : dès qu'une note est créée, Claude (Haiku) analyse le texte en arrière-plan. Le banner fait du polling toutes les 2 secondes, timeout à 5 minutes.

**Ce que l'IA cherche** :
- Tâches à créer (suggéstedTasks) : "Prévoir bilan lipidique dans 3 semaines"
- Éléments à signaler (flaggedItems) : mentions de comportements, symptômes, décisions

**Pourquoi ce pattern** : la saisie de notes est le flux le plus fréquent. Le soignant écrit, et Nami structure en arrière-plan sans interrompre.

**Design critique** : le banner doit rester discret (ne jamais prendre plus de 80px de hauteur), dismissable par X, et ne jamais bloquer l'accès aux tabs.

---

## Tab 1 — Vue Globale

### Logique produit
C'est la vue de **briefing pré-consultation**. Le soignant ouvre cette page 5 minutes avant de voir le patient. Tout ce dont il a besoin pour savoir "où en est ce patient aujourd'hui" doit être visible sans scroll.

### Résumé clinique IA

**Ce que c'est** : synthèse narrative générée par Claude Sonnet à partir de l'ensemble du dossier (notes, observations, parcours, conditions).

**Comment ça marche** :
1. Bouton "Générer" → `POST /intelligence/summarize-job/{id}` → retourne un `jobId`
2. Polling toutes les 3s sur `GET /intelligence/summarize-job/{jobId}/status`
3. Quand `status = COMPLETED` → affiche le texte, badge "Brouillon IA — à valider"
4. Rating ★ (1-5) → `POST /intelligence/summary-feedback` → améliore le modèle

**Pourquoi le badge "Brouillon"** : obligation légale (Art. 50 AI Act + déontologie). Jamais présenter un output IA comme vérité clinique.

**Design critique** : le résumé est encrypté en base (chiffrement clinique). Il est TOUJOURS présenté avec le badge brouillon et la date de génération.

### TrajectoryDeviationBanner

**Ce que c'est** : bandeau qui signale des métriques qui s'écartent significativement de la trajectoire attendue.

**Comment ça marche** :
- Backend calcule une régression OLS (moindres carrés) sur les 20 dernières mesures de chaque métrique
- Si l'écart en z-score est ≥ 3σ → critique (rouge)
- Si ≥ 2σ → alerte (ambre)
- Chaque métrique a un sparkline SVG (ligne prédite en pointillé + données réelles + bandes ±2σ)

**Pourquoi** : le soignant ne peut pas surveiller 50 métriques manuellement. Ce bandeau fait la surveillance statistique et présente seulement les déviations significatives.

**Design critique** : le bouton X masque TEMPORAIREMENT (state local, disparaît au rechargement). C'est volontaire — il faut que le soignant revoie la déviation à la prochaine visite.

### DeltaTickerBanner

**Ce que c'est** : bandeau défilant horizontal des variations récentes (poids, scores questionnaires).

**Logique couleurs** : la direction n'est pas toujours "vert = bon". Dépend de `DELTA_POLARITY` :
- Pour `weight_kg` : `lower_is_better` → baisse = vert
- Pour `phq9_score` : `lower_is_better` → baisse = vert (moins de dépression)
- Pour `muscle_mass` : `higher_is_better` → hausse = vert

**Design critique** : ne jamais changer les couleurs sans vérifier la logique de polarity. Un delta rouge n'est pas toujours mauvais.

### KeyIndicatorsGrid

**Ce que c'est** : grille des métriques clés du patient, groupées par domaine.

**Statuts** :
- 🟢 OK → dans les normes
- 🟡 ALERT → hors norme légère
- 🔴 CRITICAL → hors norme significative
- ⬜ MISSING → donnée absente (date de dernière mesure trop ancienne ou jamais saisie)

**Design critique** : le statut MISSING est aussi important que CRITICAL. Un dossier incomplet est un risque clinique.

### Conditions cliniques

**Ce que c'est** : liste des diagnostics actifs du patient.

**Types** :
- PRIMARY (violet) → diagnostic principal
- COMORBIDITY (gris) → comorbidité
- SUSPECTED (ambre) → suspicion, pas encore confirmée
- ALLERGY (rouge) → allergie
- BACKGROUND (gris clair) → antécédent

**Comment ajouter** : champ de recherche dans le catalogue CIM-11 → sélection type + sévérité (mild/moderate/severe) → `POST /care-cases/{id}/conditions`

**Comment résoudre** : hover sur la condition → bouton X → `PATCH .../conditions/{id}/resolve`

**Design critique** : les conditions SUSPECTED en ambre doivent rester visibles même si "résolues" — elles ont une valeur historique pour les futurs soignants.

### Équipe de soins

**Ce que c'est** : liste des membres de la care team avec leur dernière interaction.

**Logique "dernier contact"** : Nami parse les 100 dernières notes et cherche `authorId` pour calculer la date du dernier contact par personne.

**Valeurs affichées** : "Aujourd'hui", "Hier", "Il y a 3j", ou la date.

**Pourquoi** : le soignant voit en un coup d'œil qui a été actif récemment. Si le psy n'a pas eu de contact depuis 3 semaines, c'est un signal d'action.

### Courbes de croissance (pédiatrie)

**Condition d'affichage** : `ageMonths < 216` (moins de 18 ans) ET sexe connu.

**Données** : fichiers JSON statiques OMS (0-36 mois) importés directement. Pas d'appel API.

**Pourquoi statique** : les normes OMS ne changent pas. Inutile de les stocker en base ou de les fetcher.

---

## Tab 2 — Suivi

### Logique produit
Vue des **données objectives longitudinales**. S'utilise pendant ou après la consultation pour documenter les mesures et visualiser les tendances.

### Courbe de poids

**Données** : toutes les Observations avec `metricKey = weight_kg`, triées par date.

**Logique delta** : compare `values[0]` (le plus récent) à `values[values.length-1]` (le plus ancien de la série). Ce n'est PAS un delta vs la séance précédente — c'est l'évolution sur toute la période.

**Design critique** : l'axe Y ne commence JAMAIS à 0 (serait illisible pour un poids humain). Il est auto-scalé à ±10% des valeurs de la série.

### BIA (Impédancemétrie)

**Ce que c'est** : mesures de composition corporelle issues d'un appareil d'impédancemétrie (Biody Manager, InBody, etc.).

**Comment les données arrivent** : 
1. Le soignant uploade un PDF de rapport BIA
2. `extractBioFromBuffer()` l'envoie à Claude Haiku avec un prompt spécialisé
3. Claude extrait 48 métriques standardisées (keys normalisées via `BIA_KEY_ALIASES`)
4. Fix automatique kJ→kcal (valeurs BMR/TDEE > 4000 sont en kJ, pas en kcal)
5. Observations créées en batch avec `source = AUTO_EXTRACTED`, `reconStatus = PENDING_VALIDATION`

**Les 8 catégories** :
1. Composition corporelle (FM, FFM, SMM, protéines, minéraux)
2. Indices corporels (IMC, FFMI, ASMI, SMI)
3. Hydratation (TBW, ECW, ICW, ratios)
4. Métabolisme (BMR, TEE, apports énergétiques)
5. Ratios & marqueurs (Phase angle, impédance ratio)
6. Écarts de référence (fat gap, muscle gap, water gap)
7. Scores de risque (cardiovasculaire, métabolique)
8. Impédances brutes (Z5-Z500)

**Format d'affichage** : tableau avec 5 colonnes (sessions), chaque cellule = valeur + delta coloré. `DELTA_POLARITY` détermine si hausse = bien ou mal pour chaque métrique.

**Design critique** : la logique `DELTA_POLARITY` est fondamentale. Pour `bia_fat_mass_kg`, une baisse est verte. Pour `bia_skeletal_muscle_mass`, une hausse est verte. Ne JAMAIS styliser les deltas sans cette map.

### Bilan biologique

**Comment les données arrivent** :
- **Auto** : upload PDF → Claude Haiku extrait toutes les valeurs numériques → Observations créées
- **Manuel** : soignant peut valider/corriger via modal `extract-bio` → `validate-bio`

**Groupement** : par `examType` (BLOOD_HEMATOLOGY, BLOOD_LIPID, ECG, DXA, etc.). L'accordéon s'ouvre automatiquement sur le premier panel contenant des valeurs anormales.

**Couleurs** : vert si dans refMin/refMax, ambre si hors norme, rouge si critique.

**Design critique** : l'accordéon qui s'ouvre sur les valeurs anormales est un comportement intentionnel — ne pas le remplacer par un accordéon "tous fermés par défaut".

### Heatmap journal alimentaire

**Ce que c'est** : calendrier style "GitHub contributions" sur les 56 derniers jours. Chaque case = un jour, couleur = nombre de repas enregistrés.

**Logique couleurs** : 0=gris, 1=violet clair, 2=violet moyen, 3+=violet foncé.

**Pourquoi** : vue de l'observance du journal. Un soignant voit en 2 secondes si le patient utilise l'app régulièrement ou pas. Particulièrement important en TCA.

---

## Tab 3 — Dossier (5 sous-onglets)

### 3.1 Notes cliniques

**Types de notes** :
- CONSULTATION → compte-rendu de consultation
- SOAP → format Subjectif/Objectif/Analyse/Plan
- PROGRESS → note de progression
- TEAM → message d'équipe (partagé)
- AI_SUMMARY → résumé généré par IA
- PHONE_CALL → appel téléphonique documenté

Chaque type a une couleur de bordure gauche différente. C'est le seul indicateur visuel du type — il doit rester visible dans tout redesign.

**Badge Transcription 🎙️** : la note a été générée depuis un enregistrement audio.

**Badge Extraction ✨** : la note a été analysée par Claude et des éléments ont été extraits.

**Soft delete** : la suppression n'est pas immédiate. Toast avec "Annuler" pendant 30 secondes → `POST .../notes/{noteId}/restore`. Après 30 jours → suppression définitive (RGPD).

**Design critique** : le bouton "Annuler" dans le toast est une feature légale (données de santé). Ne pas le supprimer.

### 3.2 Journal patient

**⚠️ Concept fondamental à comprendre avant tout redesign**

Le journal n'est pas saisi par le soignant. Il est saisi par le **patient sur l'application mobile**. Le soignant le consulte en lecture, peut analyser et annoter.

**Ce qui remonte de l'app mobile** :
| Type | Contenu |
|------|---------|
| MEAL | Description du repas, photo optionnelle, faim (1-10), satiété, plaisir |
| EMOTION | Météo (sunny/cloudy/rainy/stormy), énergie (0-100%), émotions listées |
| PHYSICAL_ACTIVITY | Type d'activité, durée, intensité, plaisir, douleur |
| SYMPTOM | Description, intensité, localisation |
| POSITIVE_THOUGHT | Texte libre |
| CRISIS_EVENT | Outcome : résisté / partiel / crise complète |
| NOTE | Note texte libre |

**L'analyse IA sur les photos de repas — flux complet** :

```
Patient prend une photo → Mobile → API
                                    ↓
                          POST /journal/{id}/nutrition-analysis
                                    ↓
                          Claude Sonnet VISION :
                          - Analyse la photo (aliments visibles)
                          - Lit la description texte (compléments)
                          - Estime les portions (standards ANSES/CIQUAL)
                          - Calcule macros (kcal, protéines, glucides, lipides)
                          - Vérifie cohérence : kcal = P×4 + G×4 + L×9
                          - Note sa confiance : high / medium / low
                                    ↓
                          Sauvegardé dans payload.nutritionAnalysis
                          (BROUILLON — jamais une Observation directement)
                                    ↓
                          Soignant voit : badge 🤖 + kcal + macros + confidence
                          Soignant peut : modifier les items, valider, créer Observations
```

**Deux niveaux d'analyse** :
1. **Individuelle** (bouton "Analyser" sur un repas) → analyse ce repas
2. **Batch** (bouton "Analyser N repas") → analyse jusqu'à 10 repas non analysés en parallèle

**Hiérarchie d'affichage des macros** (priorité décroissante) :
1. PhotoMacros validés par le soignant (badge vert "✓ Analysé")
2. Nutrition Analysis IA (badge "🤖 Analyse IA" + confidence 🟢/🟡/🔴)
3. Bouton "Analyser" si rien encore

**La confidence IA** :
- 🟢 High → photo claire, aliments identifiables, portions estimables
- 🟡 Medium → photo floue ou description ambiguë
- 🔴 Low → photo illisible ou description insuffisante

**Surveillance anorexie** (comportement spécifique) :
Si `pathway.includes("anorex")` ET phase in `["evaluation", "stabilization", "weight_recovery"]` :
- Alerte si activité physique > 420 min/semaine
- Alerte si activité physique sans plaisir (durée > 60 min ET plaisir = 0)
- Ces alertes s'affichent en bandeau dans la vue journal

**La vue par semaine** :
- Navigation ← → entre semaines
- 3 widgets : humeur+énergie (7 jours) · top émotions · activité physique
- Grille 7 colonnes : une colonne par jour, chaque repas dans sa colonne

**Design critique pour le designer** :
- Les entrées viennent d'une app mobile → ne jamais concevoir un "formulaire de saisie" dans le cockpit soignant pour ce tab
- L'analyse IA sur les photos est une feature centrale — le badge confidence doit rester visible
- La navigation semaine par semaine doit rester (le soignant prépare ses consultations semaine par semaine)
- Ne jamais afficher le contenu des CRISIS_EVENT en clair par défaut (permission `canSeeCrisisDetail`)

### 3.3 Ligne de vie (Timeline)

**Ce que c'est** : historique chronologique de tout ce qui s'est passé dans le dossier.

**Types d'événements** :
| Type | Icône | Ce que ça représente |
|------|-------|---------------------|
| APPOINTMENT | 📅 | Consultation effectuée |
| REFERRAL | ↗️ | Adressage envoyé/reçu |
| ALERT | ⚠️ | Alerte déclenchée |
| OBSERVATION | 🧪 | Mesure biologique enregistrée |
| DOCUMENT | 📄 | Document uploadé |
| NOTE | 📝 | Note clinique créée |
| STEP | ✅ | Étape du parcours complétée |
| TASK | ☑️ | Tâche créée ou complétée |
| JOURNAL | 📱 | Entrée journal patient |

**Filtres** : Tout / RDV / Adressages / Rappels

**Groupement** : par mois (décroissant, le plus récent en haut)

**Design critique** : la timeline est la seule vue qui donne une vision chronologique complète. Elle ne doit jamais être masquée derrière un accordéon "voir plus" avec moins de 20 items.

### 3.4 Documents

**Ce que c'est** : stockage de tous les fichiers liés au patient.

**Types** : BIOLOGICAL_REPORT, IMPEDANCE_REPORT, DXA_REPORT, ECG_REPORT, PRESCRIPTION, CONSULTATION_REPORT, IMAGING, LETTER, TRANSCRIPTION, OTHER.

**Le bouton "🧪 Extraire les données"** (sur les rapports bio/BIA) :
```
POST /documents/{docId}/extract-bio
    ↓
Claude Haiku analyse le PDF
    ↓
Retourne des "candidates" (liste de métriques avec valeurs)
    ↓
Modal de validation : soignant coche/décoche chaque métrique
    ↓
POST /documents/{docId}/validate-bio
    ↓
Observations créées en base → visibles dans tab Suivi
```

**Design critique** : le bouton d'extraction n'apparaît que sur les types BIOLOGICAL_REPORT et IMPEDANCE_REPORT. Ne jamais l'afficher sur tous les types de documents.

### 3.5 Ordonnances

**Ce que c'est** : `PrescriptionDraftEditor` — rédaction et export PDF d'ordonnances.

**Bouton compact 💊** → expand inline (pas de modal). Format NABM footer pour les ordonnances de biologie.

---

## Tab 4 — Coordination

### Logique produit
Ce tab est utilisé **entre les consultations**, pas pendant. C'est là que l'équipe pluridisciplinaire coordonne sans avoir à se téléphoner.

### 4.1 Messages

**Ce que c'est** : messagerie de l'équipe soignante sur ce dossier. Visible uniquement par les membres de la care team.

**Triple barrière anti-urgence** (légale) :
1. Bannière permanente "En cas d'urgence médicale : 15 / 112"
2. Pas de statut "lu/vu" (évite la fausse sécurité "il a vu mon message")
3. Notifications push : titre "Nouveau message" uniquement, JAMAIS le contenu

**Pourquoi pas de "lu/vu"** : si un soignant voit que son message a été lu mais n'obtient pas de réponse en urgence, il pourrait ne pas appeler le 15. C'est un risque médicolégal.

**Design critique** : le warning 15/112 ne peut pas être retiré. C'est une exigence légale (marquage CE futur potentiel).

### 4.2 Adressages

**Ce que c'est** : gestion des demandes d'adressage vers d'autres spécialistes.

**Deux sources d'adressages** :
1. **Suggérés par Nami (IA)** : le moteur CIE détecte des liens entre diagnostics et spécialités manquantes → affiché en haut en violet clair
2. **Envoyés manuellement** : via ReferralModal

**Statuts** : PENDING → SENT → ACCEPTED / DECLINED → COMPLETED

**Design critique** : les adressages suggérés par l'IA doivent visuellement se distinguer des adressages réels. Ne jamais les mélanger dans la même liste.

### ReferralModal — Détail du workflow

**Étape 1 : Choisir le destinataire**
- Onglet "Mes contacts" → `GET /providers/my-colleagues` (soignants déjà dans Nami)
- Onglet "Annuaire" → `GET /providers/public?specialty=X` (recherche par spécialité, données ANS/RPPS)

**Étape 2 : Détails cliniques**
- Motif clinique (texte libre)
- Bouton "Générer lettre d'adressage" → `POST /intelligence/referral-letter/{id}` → Claude rédige une lettre formelle (brouillon)
- Urgence : ROUTINE (délai 2-4 semaines) / URGENT (48-72h) / EMERGENCY (< 24h)
- Message personnel (optionnel, visible uniquement du destinataire)
- **Consentement patient** (checkbox obligatoire) → texte légal Art. L.1110-4 CSP

**Étape 3 : Confirmation**

**Design critique** : la checkbox de consentement ne peut jamais être pré-cochée. C'est une obligation légale.

### 4.3 RCP

**Ce que c'est** : gestion des Réunions de Concertation Pluridisciplinaire.

**Types** : ASYNC (chaque membre répond quand il peut) / SYNC (réunion en temps réel).

**Bouton "Nouvelle RCP"** → navigue vers `/patients/{id}/rcp` (page dédiée avec formulaire complet).

### 4.4 Équipe

**Ce que c'est** : membres de la care team avec leurs rôles.

**Rôles** : LEAD (responsable du dossier), MEMBER, CONSULTANT.

**Bouton "Inviter"** → navigue vers `/equipe` (gestion globale de l'équipe).

---

## Tab 5 — Parcours (CIE)

### Logique produit
C'est la vue **stratégique long terme**. Elle montre où en est le patient dans son parcours de soins structuré, quelles étapes sont en retard, lesquelles approchent.

### Deux modes d'affichage

**Mode "Blueprint"** (parcours non démarré) :
- Affiche les étapes du template (phases + étapes prévues avec décalages en jours)
- Bouton "Démarrer le parcours" → `POST /care-cases/{id}/pathway/instantiate`

**Mode "Instances CIE"** (parcours démarré) :
- Affiche les nœuds réels avec leurs statuts temps-réel

### Statuts des nœuds

| Statut | Couleur | Signification |
|--------|---------|---------------|
| FUTURE | Gris | Pas encore dans la fenêtre temporelle |
| APPROACHING | Violet clair | Dans les 7 jours |
| IN_WINDOW | Vert | À faire maintenant |
| OVERDUE | Rouge | En retard |
| COMPLETED | Teal | Fait |
| SKIPPED | Gris barré | Délibérément sauté |

### Types d'actes

Chaque nœud a un `clinicalActType` : CONSULTATION · BILAN · QUESTIONNAIRE · PRESCRIPTION · SUIVI · DOCUMENT

**Design critique** : les couleurs de statut sont des indicateurs cliniques. Ne jamais les changer pour des raisons esthétiques.

---

## Tab 6 — Pédiatrie (conditionnel)

**Condition d'affichage** : `careCase.caseType === "PEDIATRIC"`

Voir document séparé `spec-fonctionnelle-pediatrie.md` pour le détail complet du module.

---

## Routes API complètes — référence

```
# Dossier
GET    /care-cases/{id}                          Données patient + résumé IA + équipe + config
PATCH  /care-cases/{id}                          Mise à jour métadonnées
POST   /care-cases/{id}/share-link               Lien partage temporaire (7 jours)

# Notes
GET    /care-cases/{id}/notes                    Liste des notes
POST   /care-cases/{id}/notes                    Créer une note (type, body)
DELETE /care-cases/{id}/notes/{noteId}           Soft delete (reason optionnel)
POST   /care-cases/{id}/notes/{noteId}/restore   Annuler suppression (30j)
GET    /notes/{careCaseId}/{noteId}/analysis     Résultat analyse IA (polling 2s)

# Journal
GET    /care-cases/{id}/journal                  Entrées journal (entryType optionnel)
POST   /journal/{entryId}/nutrition-analysis     Analyser repas (photo + texte) → Claude Vision
PATCH  /journal/{entryId}/nutrition-analysis     Modifier analyse IA (soignant)
POST   /journal/{entryId}/validate-meal-analysis Valider → créer Observations
POST   /care-cases/{id}/nutrition-batch-analyze  Batch analyser N repas (max 10 en //)

# Documents
GET    /care-cases/{id}/documents                Liste documents
POST   /care-cases/{id}/documents/upload         Upload (FormData: file, title, type)
POST   /documents/{docId}/extract-bio            Extraction IA → candidates (brouillon)
POST   /documents/{docId}/validate-bio           Valider candidates → créer Observations
GET    /care-cases/{id}/documents/{docId}/download Télécharger
DELETE /care-cases/{id}/documents/{docId}        Supprimer

# Observations & Trajectoires
GET    /care-cases/{id}/observations             Toutes les observations
GET    /care-cases/{id}/observations/trajectory  Analyse OLS z-score par métrique
GET    /care-cases/{id}/observations/sessions    Sessions BIA (prefix=bia_)

# Timeline & Conditions
GET    /care-cases/{id}/timeline                 Timeline chronologique (limit=100)
GET    /care-cases/{id}/conditions               Diagnostics + comorbidités
POST   /care-cases/{id}/conditions               Ajouter condition (conditionCode, type, severity)
PATCH  /care-cases/{id}/conditions/{id}/resolve  Résoudre condition

# Coordination
GET    /care-cases/{id}/messages                 Messages équipe
POST   /care-cases/{id}/messages                 Envoyer message
GET    /care-cases/{id}/referrals                Historique adressages
POST   /referrals                                Créer adressage (workflow ReferralModal)
GET    /care-cases/{id}/rcps                     Liste RCP
GET    /care-cases/{id}/team                     Membres équipe de soins

# Parcours (CIE)
GET    /care-cases/{id}/patient-config           Config: pathway + équipe + prochain RDV
GET    /care-cases/{id}/pathway-graph            Nœuds instanciés (si parcours démarré)
GET    /care-cases/{id}/pathway-template-steps   Blueprint template (si pas démarré)
POST   /care-cases/{id}/pathway/instantiate      Démarrer le parcours
PATCH  /care-cases/{id}/pathway                  Changer de template

# Intelligence IA
POST   /intelligence/summarize-job/{id}          Lancer génération résumé (async → jobId)
GET    /intelligence/summarize-job/{jobId}/status Polling statut (PENDING/COMPLETED/ERROR)
POST   /intelligence/referral-letter/{id}        Générer lettre d'adressage (brouillon)

# Providers (annuaire)
GET    /providers/my-colleagues                  Contacts Nami du soignant
GET    /providers/public?specialty=X             Recherche annuaire (ANS/RPPS)
```

---

## Points critiques à ne jamais perdre dans la refonte

1. **Les 6 boutons du header** : ne jamais les cacher ou les déplacer dans un menu
2. **NoteInline** : inline (pas modal), le soignant doit voir le dossier derrière
3. **Le journal vient du mobile** : pas de saisie soignant dans ce tab
4. **L'analyse IA sur photos** : badge confidence toujours visible, toujours éditable
5. **DELTA_POLARITY** : la couleur d'un delta dépend de la métrique, pas de la direction
6. **L'accordéon BIA sur valeurs anormales** : ouverture automatique sur l'anormal
7. **Le consentement dans ReferralModal** : jamais pré-coché, jamais retiré
8. **Le soft delete des notes** : toast avec Annuler pendant 30s
9. **Les couleurs de statut CIE** : signification clinique, pas esthétique
10. **Triple barrière urgence dans la messagerie** : non négociable légalement
