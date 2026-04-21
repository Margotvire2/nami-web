# Spécification fonctionnelle — Base documentaire (Références cliniques + Base de connaissances)
> Document de référence pour la refonte UX/UI. Explique le POURQUOI de chaque élément, la logique métier, les sources de données et les routes API. Ne pas redesigner sans avoir lu ce document.

---

## Clarification préalable : 3 pages distinctes, 3 rôles différents

Avant tout, il faut distinguer trois concepts qui portent des noms proches mais qui servent des objectifs radicalement différents :

| Page | Chemin | Rôle |
|------|--------|------|
| **Références cliniques** | `/intelligence` | Le soignant cherche dans l'encyclopédie clinique de Nami ("Quels sont les critères d'hospitalisation en anorexie ?") |
| **Base de connaissances** | `/protocoles/knowledge` | L'admin/le validateur gère le cycle de vie des sources cliniques (ingestion → validation → publication) |
| **Documents** | `/documents` | Le soignant gère les documents médicaux de ses patients (ordonnances, bilans, comptes-rendus) |

**En une phrase :** Documents = dossier médical du patient. Références cliniques = encyclopédie clinique. Base de connaissances = back-office de cette encyclopédie.

Ce document couvre les deux premières (Références cliniques + Base de connaissances). Les Documents patients sont couverts dans `spec-fonctionnelle-patient.md`.

---

## 1. Références cliniques (/intelligence)

### 1.1 Rôle de la page

Le soignant pose une question clinique en langage naturel et obtient des extraits issus d'une base de 22 000 entrées (FFAB, HAS, DSM-5, Orphanet, BDPM, CIM-11, arbres décisionnels, protocoles de soins complexes).

**Ce n'est PAS :**
- Un chatbot qui génère des réponses (sauf le panneau QA clinique, voir §1.5)
- Un moteur de décision clinique ("faites ça pour ce patient")
- Un accès aux dossiers patients

**C'est :**
- Une bibliothèque clinique interrogeable par le soignant
- Un outil de préparation de consultation ("je veux relire les critères HAS avant de voir ce patient")
- Une source de vérification ("est-ce que ce seuil biologique correspond aux recommandations FFAB ?")

### 1.2 Pipeline de recherche (comment ça marche vraiment)

```
Soignant tape une question (min. 3 caractères)
         ↓
GET /knowledge/semantic-search?q=...&limit=10
         ↓
ÉTAPE 1 — Embedding
  La question est transformée en vecteur numérique
  via OpenAI text-embedding-3-small
         ↓
ÉTAPE 2 — HNSW top-40
  pgvector cherche les 40 chunks les plus proches
  dans l'index vectoriel (22K entrées)
         ↓
ÉTAPE 3 — Filtrage qualité
  On élimine les chunks avec qualityScore < 0.50
  (chunks mal structurés, incomplets, ou faible
   couverture de sources)
         ↓
ÉTAPE 4 — Blended scoring
  Score final = 70% similarité cosinus + 30% qualityScore
  → Les résultats très pertinents mais de faible qualité
    sont pénalisés
         ↓
ÉTAPE 5 — Reranker (optionnel)
  Si disponible : Cohere ou Jina rerank les résultats
  pour une meilleure pertinence sémantique
         ↓
ÉTAPE 6 — Top N résultats
  Retourne les meilleurs résultats avec :
  - id, slug, sectionTitle, content, score, qualityScore
```

**Pourquoi ce pipeline en 6 étapes ?** La recherche par mots-clés seule raterait des synonymes cliniques ("IMC" vs "indice de masse corporelle", "anorexie" vs "AN"). Le vecteur capture le sens, pas juste les mots. Le filtrage qualité évite de remonter des sources mal structurées.

### 1.3 Sources et badges de catégorie

Chaque résultat porte un badge indiquant sa source. Ces badges ne sont pas décoratifs — ils signalent l'autorité de la source.

| Badge | Catégorie | Source | Autorité |
|-------|-----------|--------|---------|
| **SEM** | Sémantique | Fiches pathologies Nami (FFAB + HAS enrichies) | Interprétation clinique éditorialisée |
| **ALGO** | Algorithmique | Arbres décisionnels HAS | Procédures officielles HAS |
| **KE** | Knowledge Expert | Fiches expert rédigées par des cliniciens | Opinion d'expert |
| **PCR** | Parcours de soins complexes | Protocoles PCR (obésité, TCA, TDAH…) | Protocoles institutionnels |
| **REF** | Références | Guidelines HAS brutes, DSM-5, CIM-11 | Standards internationaux |

**Pour le designer :** l'ordre d'autorité (REF > ALGO > PCR > KE > SEM) doit être perceptible. Un soignant qui voit un résultat SEM sait que c'est une interprétation Nami ; un résultat REF c'est directement la référence officielle.

### 1.4 Affichage des résultats

**ResultCard — ce qu'elle affiche :**
- Badge catégorie (coloré selon le tableau ci-dessus)
- Score de pertinence (5 points — de 1 point si score < 0.2 à 5 points si score > 0.8)
- Titre de la section (ex : "Critères d'hospitalisation — Anorexie Mentale")
- Preview texte (200 caractères max avec les termes de recherche surlignés)
- Bouton "Voir plus" (expand inline) et lien pour ouvrir la modale complète

**KnowledgeDetailModal — contenu complet :**
- Rendu Markdown complet avec styles personnalisés
- Sections avec émojis cliniques (🚨 urgence, 📊 seuils, ✅ critères…)
- Tables de données (seuils biologiques, critères diagnostics)
- Listes de critères DSM / ICD
- Bouton "Fermer" (Esc ou clic dehors)

**Pourquoi une modale et pas une nouvelle page ?** Le soignant veut consulter la référence sans perdre ses résultats de recherche. Il peut ouvrir et fermer plusieurs références pour comparer.

### 1.5 Panneau QA clinique (ClinicalQAPanel)

Il s'agit d'une fonctionnalité distincte de la recherche : au lieu de retourner des extraits, le soignant pose une question et obtient une **réponse structurée générée par IA avec citations**.

**Comment ça marche :**
```
Soignant pose une question (min. 5 caractères)
         ↓
POST /intelligence/clinical-qa
  { question: "...", context?: "..." }
         ↓
Backend :
  1. Embed la question
  2. Recherche les N chunks les plus pertinents (RAG)
  3. Prompt Claude Sonnet :
     "Tu es un assistant clinique spécialisé TCA/obésité.
      Réponds à la question [X] en te basant
      UNIQUEMENT sur ces sources [Y].
      Cite tes sources avec [Source N].
      Commence par un disclaimer MDR."
         ↓
Réponse :
  - answer : markdown avec citations [Source 1], [Source 2]…
  - sources : liste des chunks utilisés avec similarité
  - chunksFound : nombre de chunks RAG utilisés
  - ragConfidence : "high" (≥3 chunks) | "low" (<3 chunks)
  - disclaimer : texte légal MDR obligatoire
```

**Ce qui ne peut jamais disparaître dans l'UI :**
1. Le `disclaimer` affiché en entier sous la réponse
2. Les sources citées avec leur similarité (traçabilité AI Act Art. 50)
3. La distinction visuelle `ragConfidence: "low"` (réponse moins fiable)
4. Un bouton "Voir les sources" qui permet d'accéder aux chunks bruts

**Limite de taux :** 100 requêtes/heure global, 20 par utilisateur/heure. Si la limite est atteinte, afficher un message explicite ("Limite de questions atteinte pour cette heure — utilise la recherche classique").

### 1.6 Dashboard qualité (QualityDashboard)

Panneau repliable en haut de la page qui affiche les métriques de qualité du système RAG.

**Pourquoi ce dashboard est là :**
Nami est une infrastructure de soins. Les soignants ont le droit de savoir si le système qui leur sert des références cliniques est fiable. Ce dashboard est une exigence de transparence (AI Act Art. 50), pas une curiosité technique.

**Métriques affichées :**

| Métrique | Signification | Seuil acceptable |
|---------|--------------|-----------------|
| Score moyen global | Qualité moyenne des réponses RAG évaluées | > 0.75 |
| Taux d'hallucination | % de réponses contenant des informations inventées | < 5% |
| Couverture des sources | % de la question couverte par les chunks trouvés | > 70% |
| Complétude | % des critères demandés effectivement répondus | > 70% |
| Actionnabilité | % des réponses qui proposent une action clinique concrète | > 60% |
| Consistance | % des réponses cohérentes avec d'autres réponses similaires | > 80% |

**Visuels actuels :**
- Histogramme de distribution des scores (combien de réponses à 0.7-0.8, 0.8-0.9, etc.)
- Sparkline 14 jours (tendance de la qualité)
- Badges statut : reranker actif/inactif, nb chunks RAG moyen, nb relations du graph

**Pour le designer :** ce dashboard est techniquement dense. Il doit être repliable par défaut pour les soignants "utilisateurs", visible par défaut pour les comptes admin/validateurs.

### 1.7 Exemples de requêtes prédéfinis

Au chargement, avant toute recherche, la page propose des suggestions cliquables :
- "Critères d'hospitalisation anorexie"
- "Seuils biologiques TCA"
- "Protocole réalimentation"
- "Critères diagnostics obésité pédiatrique"
- "DSM-5 boulimie"

**Pourquoi :** le soignant ne sait pas toujours comment formuler sa question. Ces exemples lui montrent le type de questions que le système sait répondre et l'invitent à interagir.

### 1.8 Routes API — Références cliniques

```
GET  /knowledge/semantic-search?q=...&limit=10
     → Recherche sémantique (pgvector HNSW + blended scoring + reranker)
     → Public auth (soignant connecté uniquement)

GET  /knowledge/search?q=...&source=HAS&category=...
     → Recherche full-text (tsvector, websearch_to_tsquery)
     → Filtres : source (HAS/FFAB/etc.), catégorie, pathway, tag
     → Pagination

POST /intelligence/clinical-qa
     → { question: string, context?: string }
     → Réponse RAG générée par Claude Sonnet
     → Rate limit : 100/h global, 20/h par user
     → Retourne : { answer, sources, chunksFound, ragConfidence, disclaimer }

GET  /intelligence/evaluation-stats
     → Métriques du dashboard qualité
     → Retourne : { avgOverallScore, avgHallucinationRate, avgSourceCoverage,
                    avgCompleteness, avgActionability, avgConsistency,
                    scoreDistribution[], trend[], pipelineContext }
```

---

## 2. Base de connaissances (/protocoles/knowledge)

### 2.1 Rôle de la page

Cette page n'est pas destinée aux soignants utilisateurs — c'est le **back-office éditorial** qui permet à Margot (et aux validateurs cliniques) de gérer les sources qui alimentent la base de 22 000 entrées.

**Qui utilise cette page :**
- Margot (admin, fondatrice) : ingestion de nouvelles sources, validation
- Éventuellement : cliniciens référents invités à valider des guidelines dans leur spécialité
- Pas les soignants utilisateurs ordinaires

**Ce qu'on fait ici :**
- Voir toutes les sources cliniques et leur statut
- Faire avancer une source dans son cycle de vie (DRAFT → REVIEW → VALIDATED → PUBLISHED)
- Tester la QA clinique directement sur les sources en cours de validation
- Ingérer de nouvelles sources HAS

### 2.2 Cycle de vie d'une source clinique

```
Ingestion automatique ou manuelle
         ↓
DRAFT  →  REVIEW  →  VALIDATED  →  PUBLISHED
                              ↓
                          DEPRECATED
```

**Transitions et actions :**

| De | Vers | Action bouton | Ce qui se passe |
|----|------|--------------|-----------------|
| DRAFT | REVIEW | "Mettre en revue" | POST /knowledge-sources/:id/review → flag pour validation humaine |
| DRAFT / REVIEW | VALIDATED | "Valider" | POST /knowledge-sources/:id/validate → prêt à publier |
| VALIDATED | PUBLISHED | "Publier" | POST /knowledge-sources/:id/publish → déclenche knowledgePublisher (chunking + embedding + indexation pgvector) |
| N'importe quel statut | DEPRECATED | "Rejeter" | POST /knowledge-sources/:id/deprecate → exclu des résultats de recherche |

**Pourquoi ce workflow existe :**
Les guidelines cliniques peuvent contenir des recommandations erronées, obsolètes, ou mal interprétées lors de l'ingestion automatique. Une source publiée sans validation humaine pourrait donner de mauvais conseils à un soignant. Le cycle de validation est une exigence clinique ET légale (traçabilité AI Act Art. 50 — "qui a validé, quand").

### 2.3 Structure d'une SourceCard

Chaque carte source affiche :
- Titre de la source (ex: "FFAB — Recommandations nutrition TCA 2023")
- Type : FFAB / HAS / PUBMED / SNOMED / CIM11 / MANUAL
- Statut avec badge coloré (DRAFT gris, REVIEW amber, VALIDATED bleu, PUBLISHED vert, DEPRECATED rouge barré)
- Date d'ingestion + date de validation (si applicable) + personne ayant validé
- Aperçu du `structuredData` extrait (JSON — critères, seuils, recommandations structurées)
- Boutons d'action selon le statut actuel

### 2.4 Le structuredData — pourquoi c'est important

Lors de l'ingestion, un script extrait du contenu brut (PDF/HTML) une version **structurée JSON** :

```json
{
  "hospitalization_criteria": [
    "IMC < 14 kg/m²",
    "Bradycardie < 40 bpm",
    "Hypokaliémie < 2.5 mmol/L"
  ],
  "key_thresholds": {
    "imc_critical": 14,
    "heart_rate_min": 40,
    "potassium_min": 2.5
  },
  "recommendations": [
    "Réalimentation progressive 20 kcal/kg/j en phase 1",
    "Surveillance ECG biquotidienne"
  ]
}
```

**Pourquoi ce structuredData :**
1. Il permet au moteur RAG de cibler des données précises ("seuil IMC") sans devoir lire tout le texte
2. Il pourrait alimenter des "alertes de complétude" futures (ex: vérifier que le dossier contient bien un ECG si le patient a une bradycardie)
3. Il est la preuve que la source a été correctement interprétée lors de l'ingestion

### 2.5 Panneau QA clinique intégré

La page Base de connaissances contient aussi un **ClinicalQAPanel** en mode admin. Son but est différent du panneau utilisateur : ici, le validateur teste que la source qu'il vient de publier répond bien à des questions attendues.

**Exemple d'usage :**
"Je viens de publier les recommandations FFAB 2023. Est-ce que le système sait maintenant répondre correctement à 'Quels sont les critères d'hospitalisation en anorexie' ?"

Si la réponse est `ragConfidence: "low"` ou rate des critères connus, la source a peut-être mal été chunkée → revenir en VALIDATED et ajuster avant re-publication.

### 2.6 Ingestion de nouvelles sources

Bouton "Ingérer une source HAS" → déclenche `POST /knowledge/ingest/has`

**Ce que l'ingestion fait :**
1. Scraping / import du contenu HAS (PDF ou HTML)
2. Découpage en chunks sémantiques (taille cible ~400 tokens, overlap ~50 tokens)
3. Embedding de chaque chunk (OpenAI text-embedding-3-small)
4. Calcul du qualityScore initial (basé sur la longueur, la structure, la densité d'informations)
5. Sauvegarde dans KnowledgeChunk + KnowledgeEntry (pour la full-text search)
6. Création d'une KnowledgeSource avec statut DRAFT

**Pour refresh une source existante :** `POST /knowledge/ingest/has/:sourceId/refresh` → re-ingère en conservant l'historique de validation.

### 2.7 Routes API — Base de connaissances

```
GET  /knowledge/knowledge-sources?status=PUBLISHED&type=HAS
     → Liste des sources (filtrables par statut et type)
     → Pagination

GET  /knowledge/knowledge-sources/:id
     → Détail d'une source (structuredData, rawContent, historique)

POST /knowledge/knowledge-sources/:id/review
     → DRAFT → REVIEW

POST /knowledge/knowledge-sources/:id/validate
     → DRAFT|REVIEW → VALIDATED (log: validatedBy, validatedAt)

POST /knowledge/knowledge-sources/:id/publish
     → VALIDATED → PUBLISHED (déclenche knowledgePublisher async)
     → Side effect: rechunke, réembeds, réindexe pgvector

POST /knowledge/knowledge-sources/:id/deprecate
     → Tout statut → DEPRECATED (exclu des recherches)

POST /knowledge/ingest/has
     → Lance l'ingestion HAS (job pg-boss en background)

POST /knowledge/ingest/has/:sourceId/refresh
     → Re-ingestion d'une source existante
```

---

## 3. Liens entre les deux pages et le reste de la plateforme

### 3.1 Références cliniques ↔ Fiche patient

La page Références cliniques de la fiche patient (onglet 6) **n'est pas la même** que `/intelligence`. C'est une version contextualisée qui pré-filtre les résultats selon les pathologies du patient.

```
Fiche patient → onglet Intelligence
       ↓
Appel GET /knowledge/semantic-search?q=...&context=patientId
       ↓
Le contexte patient (diagnoses, cas type) est injecté
dans le prompt de recherche pour prioriser les résultats
pertinents pour CE patient spécifique
```

**Pour le designer :** sur la fiche patient, les résultats knowledge sont pré-filtrés et montrent en premier les guidelines relatives aux diagnostics du patient. Sur la page globale `/intelligence`, la recherche est ouverte et non contextualisée.

### 3.2 Base de connaissances ↔ PrepMode

PrepMode charge le résumé IA du patient depuis `/patients/:id/prep-summary`. Ce résumé utilise le RAG de la base de connaissances pour contextualiser les observations du patient.

**Exemple :** si le patient a un IMC de 13.5, le résumé peut inclure une note "Selon les recommandations FFAB [Source 1], ce seuil correspond aux critères d'hospitalisation". Cette note vient d'un chunk KE ou REF de la base de connaissances.

### 3.3 Base de connaissances ↔ Parcours (CIE)

Les 2362 steps de pathway sont eux-mêmes liés à des chunks de la base de connaissances. Quand un step apparaît en statut OVERDUE dans le parcours d'un patient, le soignant peut cliquer et voir directement la référence clinique qui justifie ce step.

### 3.4 Ingestion → Publication → Recherche : le flux complet

```
Script d'ingestion (externe ou bouton admin)
         ↓
KnowledgeSource (DRAFT) + KnowledgeChunks (non indexés)
         ↓
Validation manuelle (REVIEW → VALIDATED)
         ↓
Publication → knowledgePublisher :
  - Chunking final
  - Embedding (OpenAI)
  - Indexation pgvector (HNSW)
  - Full-text index (tsvector)
         ↓
Disponible dans /intelligence et dans la fiche patient
(délai d'environ 2-5 min selon la taille de la source)
```

---

## 4. Points critiques à ne jamais perdre dans la refonte

### Pour /intelligence (Références cliniques)

1. **Le disclaimer MDR est obligatoire légalement** sur toutes les réponses QA clinique — il ne peut pas être caché, minimisé ou mis en gris clair inaccessible. C'est une exigence réglementaire.

2. **Les sources citées dans le QA doivent rester accessibles** — le bouton "Voir sources" n'est pas optionnel. C'est la traçabilité exigée par AI Act Art. 50.

3. **La distinction `ragConfidence: "high" / "low"` doit être visible** — une réponse avec `low` est potentiellement incomplète. Le soignant doit le voir clairement, pas seulement dans un tooltip.

4. **Les badges de catégorie (SEM/ALGO/KE/PCR/REF) ont une valeur d'autorité** — ne pas les remplacer par des couleurs neutres ou des icônes génériques.

5. **Le score de pertinence (5 points) reflète la qualité réelle du match** — pas de faux top 10 avec des scores identiques. Les résultats peu pertinents doivent être visiblement moins saillants.

6. **Le QA clinique est limité en taux** — l'UI doit gérer proprement le cas de limite atteinte (message clair, pas de loading infini).

7. **Le dashboard qualité est un engagement de transparence** — même s'il est repliable, il doit rester accessible et lisible.

### Pour /protocoles/knowledge (Base de connaissances)

8. **Le cycle de vie des sources est irréversible dans certains sens** — on ne peut pas "dépublier" une source sans créer une nouvelle version. Ne jamais proposer un "retour en DRAFT" depuis PUBLISHED.

9. **"Publier" déclenche un job asynchrone** — le bouton doit se désactiver pendant le traitement (~2-5 min) et afficher un état "Publication en cours". Ne jamais laisser le soignant croire que la source est immédiatement disponible.

10. **Le `structuredData` JSON est lisible par un clinicien** — son affichage doit être formaté (pas du JSON brut), avec les seuils numériques mis en évidence.

11. **Le validateur (qui a validé, quand) doit apparaître** — c'est la traçabilité clinique et légale de la source.

---

## 5. Opportunités d'amélioration UX

### /intelligence

- **Personnalisation par spécialité** : aujourd'hui la page est identique pour tous. Un pédiatre devrait voir des suggestions différentes d'une diététicienne. Les badges de catégorie et les suggestions prédéfinies pourraient s'adapter au profil du soignant.

- **Sauvegarde des recherches** : le soignant revient souvent chercher les mêmes guidelines. Un historique de recherche ou des "favoris" cliniques réduirait la friction.

- **Intégration contextuelle** : le soignant devrait pouvoir lancer une recherche directement depuis la fiche patient ("Chercher les critères pour ce diagnostic") sans naviguer vers /intelligence.

- **Résultats comparables** : ouvrir deux résultats en parallèle (deux guidelines) pour les comparer côte à côte.

### /protocoles/knowledge

- **Visibilité du flux d'ingestion** : quand l'admin ingère une nouvelle source HAS, il ne sait pas exactement ce qui va se passer. Un aperçu du contenu brut détecté + nb de chunks estimé avant confirmation améliorerait la confiance.

- **Tests QA avant publication** : proposer 3-5 questions test à passer avant de publier une source, pour s'assurer qu'elle répond bien.

- **Historique des modifications** : afficher un diff entre la version précédente et la version re-ingérée d'une source.
