# Schema Templates — JSON-LD pour articles SEO santé

## 1. MedicalWebPage (article sur une pathologie)

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "[Meta title]",
  "headline": "[H1]",
  "description": "[Meta description]",
  "url": "https://[domaine]/blog/[slug]",
  "datePublished": "[YYYY-MM-DD]",
  "dateModified": "[YYYY-MM-DD]",
  "inLanguage": "fr",
  "author": {
    "@type": "Organization",
    "name": "[Nom équipe]",
    "url": "https://[domaine]/equipe"
  },
  "publisher": {
    "@type": "Organization",
    "name": "[Nom du site]",
    "url": "https://[domaine]",
    "logo": {
      "@type": "ImageObject",
      "url": "https://[domaine]/logo.png"
    }
  },
  "medicalAudience": {
    "@type": "PatientAudience",
    "audienceType": "patient"
  },
  "about": {
    "@type": "MedicalCondition",
    "name": "[Nom de la pathologie]",
    "alternateName": "[Synonyme courant]"
  },
  "lastReviewed": "[YYYY-MM-DD]",
  "reviewedBy": {
    "@type": "Organization",
    "name": "[Nom équipe]"
  }
}
```

## 2. Article (sujet non médical — nutrition, coordination, parcours)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[H1]",
  "description": "[Meta description]",
  "url": "https://[domaine]/blog/[slug]",
  "datePublished": "[YYYY-MM-DD]",
  "dateModified": "[YYYY-MM-DD]",
  "inLanguage": "fr",
  "author": {
    "@type": "Organization",
    "name": "[Nom équipe]",
    "url": "https://[domaine]/equipe"
  },
  "publisher": {
    "@type": "Organization",
    "name": "[Nom du site]",
    "url": "https://[domaine]",
    "logo": {
      "@type": "ImageObject",
      "url": "https://[domaine]/logo.png"
    }
  },
  "image": {
    "@type": "ImageObject",
    "url": "https://[domaine]/images/blog/[slug].webp",
    "width": 1200,
    "height": 630
  },
  "wordCount": "[nombre de mots]",
  "keywords": "[mot-clé 1, mot-clé 2, mot-clé 3]"
}
```

## 3. FAQPage (toujours en complément de l'article)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question 1 — exactement comme dans l'article]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Réponse 1 — texte brut, pas de HTML]"
      }
    },
    {
      "@type": "Question",
      "name": "[Question 2]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Réponse 2]"
      }
    },
    {
      "@type": "Question",
      "name": "[Question 3]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Réponse 3]"
      }
    }
  ]
}
```

## 4. BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://[domaine]"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://[domaine]/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[Catégorie]",
      "item": "https://[domaine]/blog/categorie/[slug-categorie]"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "[Titre de l'article]",
      "item": "https://[domaine]/blog/[slug]"
    }
  ]
}
```

## 5. Template @graph complet — À utiliser systématiquement

C'est le format obligatoire pour tous les articles. Un seul `@graph` remplace les 3 balises séparées. Remplacer TOUS les placeholders `[EN_MAJUSCULES]` — ne jamais laisser un placeholder non rempli en publication.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalWebPage",
      "name": "[META_TITLE]",
      "headline": "[H1]",
      "description": "[META_DESCRIPTION]",
      "url": "https://namipourlavie.com/blog/[SLUG]",
      "datePublished": "[YYYY-MM-DD]",
      "dateModified": "[YYYY-MM-DD]",
      "inLanguage": "fr",
      "author": {
        "@type": "Organization",
        "name": "Comité de professionnels de santé Nami",
        "url": "https://namipourlavie.com/equipe"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Nami",
        "url": "https://namipourlavie.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://namipourlavie.com/nami-mascot.png"
        }
      },
      "medicalAudience": {
        "@type": "PatientAudience",
        "audienceType": "patient"
      },
      "about": {
        "@type": "MedicalCondition",
        "name": "[NOM_PATHOLOGIE]"
      },
      "lastReviewed": "[YYYY-MM-DD]",
      "reviewedBy": {
        "@type": "Organization",
        "name": "Comité de professionnels de santé Nami",
        "url": "https://namipourlavie.com/equipe"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "[QUESTION_1_exacte_comme_article]",
          "acceptedAnswer": { "@type": "Answer", "text": "[REPONSE_1_texte_brut_sans_HTML]" }
        },
        {
          "@type": "Question",
          "name": "[QUESTION_2]",
          "acceptedAnswer": { "@type": "Answer", "text": "[REPONSE_2]" }
        },
        {
          "@type": "Question",
          "name": "[QUESTION_3]",
          "acceptedAnswer": { "@type": "Answer", "text": "[REPONSE_3]" }
        },
        {
          "@type": "Question",
          "name": "[QUESTION_4]",
          "acceptedAnswer": { "@type": "Answer", "text": "[REPONSE_4]" }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://namipourlavie.com" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://namipourlavie.com/blog" },
        { "@type": "ListItem", "position": 3, "name": "[CATEGORIE_LABEL]", "item": "https://namipourlavie.com/blog/categorie/[CATEGORIE_SLUG]" },
        { "@type": "ListItem", "position": 4, "name": "[H1]", "item": "https://namipourlavie.com/blog/[SLUG]" }
      ]
    }
  ]
}
```

**Pour un article non médical (Article au lieu de MedicalWebPage)** — remplacer le premier nœud par :

```json
{
  "@type": "Article",
  "headline": "[H1]",
  "description": "[META_DESCRIPTION]",
  "url": "https://namipourlavie.com/blog/[SLUG]",
  "datePublished": "[YYYY-MM-DD]",
  "dateModified": "[YYYY-MM-DD]",
  "inLanguage": "fr",
  "author": {
    "@type": "Organization",
    "name": "Comité de professionnels de santé Nami",
    "url": "https://namipourlavie.com/equipe"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Nami",
    "url": "https://namipourlavie.com",
    "logo": { "@type": "ImageObject", "url": "https://namipourlavie.com/nami-mascot.png" }
  },
  "wordCount": [NOMBRE_MOTS],
  "keywords": "[mot-cle-1, mot-cle-2, mot-cle-3]"
}
```

## 6. Validation

Toujours tester avec :
- Google Rich Results Test : https://search.google.com/test/rich-results
- Schema.org Validator : https://validator.schema.org/

Erreurs fréquentes :
- `datePublished` mal formatée (doit être ISO 8601 : YYYY-MM-DD)
- `logo` manquant dans publisher
- FAQ `text` contenant du HTML (doit être texte brut)
- `url` sans https://
