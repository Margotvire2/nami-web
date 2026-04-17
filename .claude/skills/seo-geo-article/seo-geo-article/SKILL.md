---
name: seo-geo-article
description: "Rédiger, corriger ou auditer des articles de blog SEO/GEO 10/10 pour un site santé français. Utiliser cette skill chaque fois que l'utilisateur demande d'écrire un article de blog, corriger un article existant, créer du contenu SEO, optimiser un article pour le référencement, rédiger du contenu santé YMYL, planifier un calendrier éditorial, auditer la qualité SEO d'un contenu, produire des meta titles/descriptions, structurer des FAQ schema, ou toute tâche impliquant la rédaction web optimisée pour le référencement naturel et local. Également déclencher pour : 'article de blog', 'contenu SEO', 'optimisation SEO', 'rédaction web', 'meta description', 'mots-clés', 'longue traîne', 'maillage interne', 'schema markup', 'FAQ', 'EEAT', 'YMYL', 'référencement local', 'GEO', 'SEO local', 'Google Business Profile', 'sitemap', 'Search Console'."
---

# SEO/GEO Article — Rédaction 10/10

Skill de rédaction d'articles de blog SEO/GEO conformes aux standards Google 2025-2026, spécialisé santé YMYL mais applicable à tous les secteurs.

## Table of Contents

1. Workflow — Quel mode utiliser
2. Les 7 piliers d'un article 10/10
3. Process de correction d'un article existant
4. Process de création d'un nouvel article
5. Livrable standard — Format de sortie
6. Reference files

---

## 1. Workflow — Quel mode utiliser

| L'utilisateur demande... | Mode | Action |
|--------------------------|------|--------|
| "Écris un article sur X" | **Création** | Lire `references/creation-process.md` → suivre le process complet |
| "Corrige cet article" | **Correction** | Lire `references/correction-checklist.md` → audit + réécriture |
| "Audite cet article" | **Audit seul** | Lire `references/scoring-grille.md` → produire la note /10 + recommandations |
| "Fais les metas pour X" | **Meta seul** | Lire `references/meta-rules.md` → produire meta title + description + schema |
| "Planifie X articles" | **Planning** | Lire `references/planning-editorial.md` → produire le calendrier |
| "Script de correction batch" | **Batch** | Lire `references/batch-prompt.md` → produire le prompt système réutilisable |

**Toujours lire le reference file correspondant avant de produire quoi que ce soit.**

---

## 2. Les 7 piliers d'un article 10/10

### Pilier 1 — Architecture SEO

**URL / Slug** : 3-5 mots, mot-clé principal, sans stop words, sans accents.
```
✅ /blog/anorexie-parcours-soins
❌ /blog/l-anorexie-mentale-comprendre-le-parcours-de-soins-en-france
```

**Balises titres** — Hiérarchie stricte :
- **H1** : un seul par page, mot-clé principal en début, 50-65 caractères
- **H2** : sections principales, chacune cible une intention de recherche secondaire
- **H3** : sous-sections, ne jamais sauter de niveau (pas de H1 → H3)
- **H4** : rarement nécessaire, uniquement pour structurer un H3 long

**Densité mot-clé** : Le mot-clé principal apparaît dans le H1, l'introduction (100 premiers mots), 1 H2, la conclusion. Densité totale < 1% (3-5 occurrences pour 1 500 mots). Varier systématiquement avec synonymes, reformulations patient, longue traîne.

**Longueur** :
| Type d'article | Mots | Rôle |
|----------------|------|------|
| Pilier | 1 500 - 2 500 | Autorité thématique, cible un mot-clé compétitif |
| Satellite | 800 - 1 200 | Longue traîne, supporte un pilier via lien interne |
| GEO local | 600 - 1 000 | Référencement local, cible "[service] + [ville]" |
| FAQ / Glossaire | 300 - 600 | Réponse directe, position 0 Google |

### Pilier 2 — Meta tags

> Lire `references/meta-rules.md` pour les règles complètes.

**Meta title** (balise `<title>`) :
- 50-65 caractères (coupé à 60 dans les SERP)
- Mot-clé principal en début
- Peut différer du H1 (optimisé CTR)
- Inclure le nom du site à la fin : "| Nami"
- Pattern gagnant professionnel : `[Mot-clé] : [Bénéfice] | Nami`
- Pattern gagnant patient (CTR +30%) : `[Question directe du patient] | Nami`

```
✅ "Comment traiter le RGO de mon bébé ? | Nami"          ← article patient
✅ "RGO nourrisson : traitement et prise en charge | Nami" ← article professionnel
❌ "Le RGO du nourrisson chez l'enfant : tout savoir | Nami"
```

**Meta description** (balise `<meta name="description">`) :
- 145-155 caractères
- Mot-clé principal (apparaît en gras dans les SERP)
- Verbe d'action + bénéfice lecteur
- Pas de promesse vide ni de phrase template
- Pattern : `[Contexte chiffré]. [Ce que l'article couvre]. [CTA implicite].`

```
✅ "L'anorexie touche 1,4% des femmes en France. Parcours de soins, professionnels à consulter et coordination : guide complet pour les patients et familles."
❌ "Découvrez tout ce qu'il faut savoir sur l'anorexie mentale. Cliquez pour en savoir plus."
```

### Pilier 3 — Maillage interne et liens

**Règle des 4 liens minimum par article** :
1. **2-3 liens internes** vers d'autres articles du blog (ancres naturelles, pas "cliquez ici")
2. **1 lien vers une page de service** du site
3. **1 lien vers la page équipe/à propos** (signal EEAT)

**Ancres de liens** — Ce qui est interdit vs autorisé :
```
❌ "cliquez ici", "en savoir plus", "lire la suite"
❌ URL nue : "https://namipourlavie.com/blog/xxx"
✅ "le parcours de soins en obésité complexe" (ancre descriptive)
✅ "comme le recommande la HAS" (ancre contextualisée)
```

**Ancres spécifiques pour les liens Nami** — règle critique EEAT :
```
❌ "sur Nami"             → trop vague, signal publicitaire
❌ "via Nami"             → idem
❌ "avec Nami"            → idem
❌ "la plateforme Nami"   → promotionnel
✅ "trouver un pédiatre spécialisé"               → ancre descriptive /trouver-un-soignant
✅ "coordonner le suivi pluridisciplinaire"        → ancre contextuelle
✅ "partager le dossier avec l'équipe soignante"   → ancre contextuelle
✅ "rechercher un gastro-entérologue pédiatrique"  → ancre descriptive /trouver-un-soignant
✅ "comprendre l'APLV"                             → ancre descriptive /pathologies/aplv
```

**Liens externes** :
- Uniquement vers des sources de rang 1 (voir Pilier 6)
- En `target="_blank" rel="noopener"` 
- Jamais de lien vers un concurrent direct
- Pas plus de 3-5 liens externes par article

**Redirections** :
- Article supprimé avec URL indexée → 301 vers l'article thématiquement le plus proche
- Article supprimé sans remplacement → 410 Gone (PAS de 301 vers l'accueil pour des centaines de pages)
- Changement de slug → 301 de l'ancien vers le nouveau
- Jamais de chaîne de redirections (A → B → C)

### Pilier 4 — FAQ et données structurées

**FAQ Schema — 4 règles impératives** :

1. **3-5 questions par article** issues de vraies recherches (Google "People Also Ask", Semrush, AlsoAsked.com)
2. **Chaque réponse apporte une info NOUVELLE** non présente dans le corps de l'article
3. **40-60 mots par réponse** — assez pour être utile, assez court pour la position 0
4. **Jamais de reformulation du H2** en question — la FAQ complète l'article, elle ne le duplique pas

```
❌ H2 : "Qu'est-ce que la boulimie ?" → FAQ : "Qu'est-ce que la boulimie ?" (doublon)
✅ H2 : "Qu'est-ce que la boulimie ?" → FAQ : "La boulimie est-elle fréquente chez les hommes ?" (info nouvelle)
```

**Schema markup obligatoire** — Voir `references/schema-templates.md` pour les JSON-LD complets :
- `MedicalWebPage` ou `Article` (selon le sujet)
- `FAQPage`
- `BreadcrumbList`
- `MedicalCondition` (si article pathologie)
- `Organization` (author/publisher)

### Pilier 5 — EEAT (Experience, Expertise, Authoritativeness, Trustworthiness)

Google évalue chaque page YMYL (santé, finance, juridique) sur ces 4 critères. Un article 10/10 les couvre tous :

**Experience** (vécu) :
- Intégrer des insights issus de la pratique clinique (sans données patient)
- Mentionner le contexte concret : "En consultation, nous observons souvent que..."
- Les articles purement théoriques sans ancrage pratique scorent moins

**Expertise** :
- Auteur identifié avec nom, titre, credentials
- Lien vers une page auteur/équipe avec biographie
- Signature : "Équipe Nami — Diététiciens-nutritionnistes et professionnels de santé"
- Ne pas publier sur un sujet sans expertise démontrable

**Authoritativeness** :
- Sources de rang 1 exclusivement (voir Pilier 6)
- Liens entrants (backlinks) depuis des sites de confiance du secteur
- Cohérence thématique du site (ne pas mélanger dermatologie et nutrition si l'expertise est nutritionnelle)

**Trustworthiness** :
- Date de publication ET date de dernière mise à jour
- Mentions légales / CGU accessibles
- HTTPS
- Pas de publicité agressive ni de pop-ups intrusifs
- Politique de confidentialité
- Disclaimer médical en fin d'article

### Pilier 6 — Sources et références

**Hiérarchie des sources** (du plus fiable au moins fiable) :

| Rang | Type | Exemples | Usage |
|------|------|----------|-------|
| 1 | Autorités nationales | HAS, ANSM, ANSES, InVS/SPF | Toujours citer en priorité |
| 1 | Sociétés savantes | SFNEP, SFNCM, FFAB, SPILF, SFP | Recommandations officielles |
| 1 | Organismes internationaux | OMS, Cochrane, NICE, ESPGHAN | Si pas de reco française |
| 2 | Revues à comité de lecture | PubMed, Lancet, BMJ, JAMA | Données chiffrées, études |
| 2 | Bases de données médicales | Vidal, BDPM, CIM-11 | Monographies, classifications |
| 3 | Manuels de référence | DSM-5-TR, Harrison, Collège | Définitions, critères |
| 4 | Sites institutionnels | Ameli.fr, ARS, CPAM | Aspects administratifs |
| ❌ | Interdit | Wikipédia, forums, blogs, Doctissimo | Jamais en source unique |

**Format de citation** :
```
Haute Autorité de Santé. *Guide du parcours de soins : surpoids et obésité de l'adulte*. 2023.
[Lien : https://www.has-sante.fr/...]
```
- Minimum 3 sources par article
- Chaque affirmation clinique doit être rattachable à une source
- Si pas de recommandation française → dire explicitement "selon les recommandations européennes/internationales"

### Pilier 7 — Angle différenciant

Chaque article doit avoir **un angle qui le distingue des 3 premiers résultats Google**. Sans angle, l'article est générique et ne rankera pas.

**Les 6 types d'angles — choisir celui qui correspond au sujet :**

| Type | Description | Exemple |
|------|-------------|---------|
| `arbre_decisionnel` | Guide le lecteur étape par étape selon sa situation | "RGO léger ou sévère ? Voici le bon parcours selon les symptômes" |
| `tableau_comparatif` | Compare des options, traitements, ou spécialistes côte à côte | "Lait AR vs lait hydrolysé : lequel pour votre bébé ?" |
| `donnee_rare` | Chiffre ou fait clinique peu connu, sourcé rang 1 | "95 % des RGO disparaissent avant 12 mois — ce que les parents ignorent" |
| `eclairage_coordination` | Explique comment les professionnels se coordonnent autour du patient | "Qui fait quoi entre le pédiatre, le gastro et la diét ?" |
| `vecu_terrain` | Ancrage dans la pratique clinique réelle ("En consultation, nous observons...") | "Ce que les parents nous disent lors des premières consultations RGO" |
| `infographie` | Structure l'information visuellement (tableau, liste étapes, checklist) | "Checklist : 7 signes qui imposent de consulter en urgence" |

**Règles :**
- Indiquer l'angle dans le champ `angle_unique` du frontmatter
- L'angle doit apparaître clairement dans le H1 ou l'introduction
- Un article sans angle identifiable = critère 41 de la grille = 0 point

---

### Pilier 8 — SEO Local / GEO

**Quand faire du GEO** :
- Service localisé (consultation, cabinet, réseau)
- Requêtes "[spécialité] + [ville]" avec volume de recherche
- Structures locales à référencer (CPTS, ARS, hôpitaux)

**Optimisations GEO dans l'article** :
- Mentionner naturellement la zone : "en Île-de-France", "à Paris", "dans les Hauts-de-Seine"
- Nommer les structures locales pertinentes quand c'est utile
- Créer des variantes géolocalisées pour les articles à fort potentiel
- Ne pas forcer le GEO quand le sujet est national/universel

**Google Business Profile** (hors article mais critique) :
- Catégorie principale exacte
- Description avec mots-clés
- Photos régulières
- Google Posts hebdomadaires (résumé des articles publiés)
- Avis et réponses aux avis

**Schema LocalBusiness** — sur les pages de service uniquement (pas sur les articles de blog).

---

## 3. Process de correction — Vue d'ensemble

> Lire `references/correction-checklist.md` pour le process détaillé.

1. **Diagnostic** : périmètre, audience, longueur, qualité
2. **Réécriture structurelle** : H1, H2/H3, sections manquantes
3. **Réécriture rédactionnelle** : phrases template, variantes mot-clé, transitions
4. **SEO technique** : metas, maillage, schema, images/alt
5. **Livrable** : article complet + metas + schema + suggestions visuelles

---

## 4. Process de création — Vue d'ensemble

> Lire `references/creation-process.md` pour le process détaillé.

1. **Brief éditorial** : mot-clé, volume, intention, audience, angle
2. **Plan détaillé** : H1/H2/H3 + sources + FAQ + CTA
3. **Rédaction** : selon les 7 piliers
4. **Optimisation finale** : relecture EEAT, maillage, metas, schema

---

## 5. Livrable standard — Format de sortie

Tout article produit par cette skill doit être livré dans CE format exact :

```markdown
---
meta_title: "[50-65 chars] | Nami"
meta_description: "[145-155 chars]"
slug: "[3-5 mots-en-slug]"
mot_cle_principal: ""
mots_cles_secondaires: ["", "", ""]
categorie: ""
type: "pilier | satellite | geo"
angle_unique: "arbre_decisionnel | tableau_comparatif | donnee_rare | eclairage_coordination | vecu_terrain | infographie"
date_publication: "YYYY-MM-DD"
date_revision: "YYYY-MM-DD"
---

# [H1]

[Introduction 100-150 mots]

## [H2 — Section 1]
[Contenu]

## [H2 — Section 2]
[Contenu]

[... sections selon le plan ...]

## Quand consulter ?
[Toujours présent dans un article santé]

## Questions fréquentes

**[Question 1]**
[Réponse 40-60 mots — info nouvelle]

**[Question 2]**
[Réponse]

**[Question 3]**
[Réponse]

## Sources
1. [Format complet]
2. [Format complet]
3. [Format complet]

---
*Article révisé le [date]. Contenu informatif — ne remplace pas un avis médical.
Consultez votre médecin traitant pour une évaluation personnalisée.*
*[Comité de professionnels de santé Nami](/equipe) — diététiciens-nutritionnistes, médecins, psychologues*
```

Suivi du Schema JSON-LD dans un bloc code séparé.

---

## 6. Reference files

| Fichier | Contenu | Quand le lire |
|---------|---------|---------------|
| `references/meta-rules.md` | Règles exhaustives meta title, meta description, Open Graph, Twitter Cards | Mode Meta, Création, Correction |
| `references/correction-checklist.md` | Checklist de correction en 5 étapes avec critères binaires | Mode Correction |
| `references/creation-process.md` | Process complet de création avec brief, plan, rédaction | Mode Création |
| `references/schema-templates.md` | Templates JSON-LD pour tous les types de schema | Tous les modes |
| `references/scoring-grille.md` | Grille de notation /10 avec 40 critères pondérés | Mode Audit |
| `references/batch-prompt.md` | Prompt système pour correction en masse via script | Mode Batch |
| `references/planning-editorial.md` | Méthode de planification éditoriale et calendrier | Mode Planning |
| `references/redaction-rules.md` | Règles rédactionnelles, ton, formulations interdites | Tous les modes |
