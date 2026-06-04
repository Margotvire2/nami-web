# content/blog/ — Articles SEO/GEO source

Ce dossier contient les **fichiers source markdown** des articles SEO/GEO produits manuellement pour le blog Nami.

> ⚠️ Le blog Nami est servi par l'API backend (`/blog/articles`) depuis la table `Article` côté PostgreSQL.
> Les fichiers de ce dossier **ne sont pas rendus directement** par Next.js — ils servent de source de vérité versionnée à ingérer dans la base.

## Pourquoi ce dossier ?

- Versioning Git des contenus « 10/10 » produits manuellement (les contenus générés en masse via le pipeline SEO v2 restent côté backend).
- Relecture en pull request facilitée pour les articles à enjeu (YMYL santé, MDR, EDE-Q…).
- Découplage temporaire entre rédaction et ingestion DB.

## Format

Chaque article est un fichier `.md` avec **frontmatter YAML** + corps en markdown. Le frontmatter mappe directement les champs de la table `Article` côté backend :

```yaml
---
slug: string                # unique, kebab-case
title: string               # affiché H1
metaTitle: string           # ≤ 60 caractères (SEO)
metaDescription: string     # 150–160 caractères
excerpt: string             # affiché sur la liste
category: string            # "TCA" | "Coordination" | "Pédiatrie" | ...
audience: "patient" | "professional"
tags: string[]
keywords: string[]          # SEO
sources: string[]           # libellés
sourceUrls: string[]        # URLs vérifiées
publishedAt: "YYYY-MM-DD"
authorName: string
authorRole: string | null
reviewedBy: string | null   # à compléter par le ou la soignant·e relecteur·rice
pathologySlug: string | null
faqItems:                   # JSON-LD FAQPage généré côté frontend
  - question: string
    answer: string
---

# H1

… corps markdown …

## Sources

… liens vérifiables …
```

## Ingestion en base

L'ingestion dans la table `Article` se fait via un script backend dédié (à créer, branche `feat/ingest-seo-articles-batch` côté `nami`). Trois approches possibles :

1. **Script Prisma direct** côté backend, qui lit ce dossier (via path absolu ou copie) et `upsert` dans la table `Article`. Méthode la plus simple en CI/CD.
2. **Endpoint admin** côté backend (`POST /blog/admin/articles/import`) qui ingère un payload JSON construit à partir des MD. Méthode la plus orchestrable.
3. **CLI dédié** dans `nami/scripts/import-seo-articles.ts` exécutable en local par la fondatrice avant chaque vague de publication. Méthode pragmatique pour le pre-launch.

Tant que l'ingestion n'est pas en place, ces fichiers sont :
- Lisibles en revue de PR.
- Versionnés et donc auditables.
- Référencés par le calendrier édito (cf. `docs/SEO_GEO_CALENDRIER_EDITO_2026Q3.md`).

## Workflow de relecture

1. Article rédigé par l'équipe Nami → commit + PR.
2. Relecture **soignant·e externe** (Margot ou relecteur spécialiste) : champ `reviewedBy` complété, modifications proposées si besoin.
3. Validation merge sur main.
4. Ingestion dans la table `Article` côté backend (script ou admin).
5. Publication effective (`publishedAt` figé, status `PUBLISHED`).
6. Indexation Search Console manuelle dans la semaine.

## Conventions

- **Pas de placeholder**. Un article merge sur main = un article 100 % rédigé.
- **5–8 sources réelles** par article. URL HAS, ANSM, Santé publique France, sociétés savantes (FFAB, SFP, SFE, etc.), PubMed peer-reviewed.
- **Disclaimer YMYL** systématique en bas d'article.
- **Wording MDR-safe** — pas de « diagnostic », « surveillance clinique », « alerte clinique ». Privilégier « observation », « repérage », « complétude ».
- **3 à 5 maillages internes** : autres articles du dossier, pages produit (`/professions`, `/clinique-pediatrique`, `/trouver-un-soignant`, `/signup`).
- **Géo signal** : au moins une mention territoriale FR (ARS, CPTS, région) par article.

## Statut Q3 2026

8 articles rédigés (batch initial, juillet-août 2026). 5 articles restants au calendrier (août-septembre 2026), cf. `docs/SEO_GEO_CALENDRIER_EDITO_2026Q3.md`.

| # | Slug | Audience | Statut |
|---|------|----------|--------|
| 1 | `tca-adolescent-reconnaitre-signes-famille` | patient | ✅ |
| 2 | `parcours-soins-coordonne-liberal-pluridisciplinaire` | soignant | ✅ |
| 3 | `ede-q-questionnaire-eating-disorder-examination` | soignant | ✅ |
| 4 | `mon-enfant-trouble-alimentaire-par-ou-commencer` | patient | ✅ |
| 5 | `rcp-liberale-reunion-concertation-pluridisciplinaire-ville` | soignant | ✅ |
| 6 | `orthorexie-quand-le-sain-devient-pathologique` | patient | ✅ |
| 7 | `coordination-ville-hopital-pediatrie-best-practices-2026` | soignant | ✅ |
| 8 | `micro-coaching-parental-tca-pediatriques` | patient | ✅ |

## Sitemap

Une fois les articles ingérés en base, l'endpoint `/blog/sitemap` côté backend les expose automatiquement à `sitemap.xml`. Aucune action manuelle sur `public/sitemap.xml` n'est requise tant que la pipeline DB → sitemap fonctionne (vérifié en juin 2026).
