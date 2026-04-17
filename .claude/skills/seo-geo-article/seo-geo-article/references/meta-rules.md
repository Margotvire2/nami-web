# Meta Rules — Règles exhaustives des meta tags

## Meta Title (`<title>`)

### Règles techniques
- **Longueur** : 50-65 caractères (Google coupe à ~60 dans les SERP desktop, ~55 mobile)
- **Mot-clé principal** : en début de titre (les premiers mots pèsent plus)
- **Unicité** : chaque page du site a un meta title unique
- **Marque** : le nom du site à la fin, séparé par " | " ou " — "

### Patterns gagnants par type d'article

**Article pilier** :
```
[Mot-clé principal] : Guide complet [Année] | Nami
[Mot-clé] : comprendre et agir | Nami
```

**Article satellite** :
```
[Mot-clé longue traîne] : [bénéfice] | Nami
[Question patient] — Réponses d'experts | Nami
```

**Article GEO** :
```
[Spécialité] à [Ville] : [bénéfice local] | Nami
[Service] en [Région] : guide pratique | Nami
```

### Erreurs fatales
```
❌ Trop long : "Tout ce que vous devez absolument savoir sur l'anorexie mentale et le parcours de soins en France en 2026 | Nami" (98 chars)
❌ Pas de mot-clé : "Notre guide santé | Nami"
❌ Keyword stuffing : "Anorexie anorexie mentale anorexie traitement | Nami"
❌ Duplicate : même title sur 2 pages différentes
❌ Absence de marque : "Anorexie : guide complet" (sans | Nami)
```

---

## Meta Description (`<meta name="description">`)

### Règles techniques
- **Longueur** : 145-155 caractères (Google coupe à ~155 desktop, ~120 mobile)
- **Mot-clé principal** : présent (apparaît en **gras** dans les SERP quand il matche la requête)
- **Unicité** : chaque page a une meta description unique
- **Pas de guillemets doubles** (Google coupe la description aux guillemets)

### Structure optimale
```
[Donnée chiffrée ou contexte]. [Ce que l'article couvre concrètement]. [CTA implicite ou bénéfice].
```

### Exemples commentés
```
✅ "L'anorexie touche 1,4% des femmes en France. Parcours de soins, spécialistes et coordination : tout comprendre pour agir."
   → Chiffre (crédibilité) + contenu concret + CTA implicite — 142 chars

✅ "Obésité pédiatrique : quand consulter, quel parcours suivre et quels professionnels impliquer. Guide basé sur les recommandations HAS 2023."
   → Questions patient + autorité source — 149 chars

❌ "Découvrez tout sur l'obésité chez l'enfant. N'hésitez pas à nous contacter pour plus d'informations."
   → Vide, générique, aucun bénéfice concret
```

### Formulations interdites en meta description
- "Découvrez tout sur..."
- "N'hésitez pas à..."
- "Cliquez ici pour..."
- "Dans cet article, nous allons voir..."
- "Il est important de savoir que..."
- Toute phrase qui pourrait décrire n'importe quel article

---

## Open Graph (Facebook, LinkedIn)

```html
<meta property="og:title" content="[Peut être plus long que le meta title — 60-90 chars]">
<meta property="og:description" content="[Peut différer de la meta desc — 150-200 chars]">
<meta property="og:image" content="[URL image 1200x630px]">
<meta property="og:url" content="[URL canonique]">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Nami">
<meta property="article:published_time" content="[ISO 8601]">
<meta property="article:modified_time" content="[ISO 8601]">
<meta property="article:author" content="[URL page auteur]">
<meta property="article:section" content="[Catégorie]">
<meta property="article:tag" content="[Tag 1]">
```

**Image OG** : 1200×630px, texte lisible en miniature, pas de texte trop petit, inclure le logo du site.

---

## Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[50-60 chars]">
<meta name="twitter:description" content="[120-150 chars]">
<meta name="twitter:image" content="[URL image 1200x630px]">
```

---

## Canonical URL

```html
<link rel="canonical" href="https://namipourlavie.com/blog/[slug]">
```
- Toujours en HTTPS
- Toujours sans trailing slash (cohérence)
- Toujours l'URL principale si plusieurs URLs mènent au même contenu

---

## Balise robots

```html
<!-- Par défaut pour un article publié -->
<meta name="robots" content="index, follow">

<!-- Pour un article en brouillon ou dépublié -->
<meta name="robots" content="noindex, nofollow">
```

---

## Hreflang (si multilingue)

```html
<link rel="alternate" hreflang="fr" href="https://namipourlavie.com/blog/[slug]">
<link rel="alternate" hreflang="x-default" href="https://namipourlavie.com/blog/[slug]">
```

---

## Checklist meta — à valider pour chaque article

- [ ] Meta title : 50-65 chars, mot-clé en début, unique, marque en fin
- [ ] Meta description : 145-155 chars, mot-clé présent, bénéfice concret, unique
- [ ] OG title + description + image configurés
- [ ] Twitter card configurée
- [ ] URL canonique correcte
- [ ] Balise robots = index, follow
- [ ] Slug optimisé : 3-5 mots, sans stop words, sans accents
