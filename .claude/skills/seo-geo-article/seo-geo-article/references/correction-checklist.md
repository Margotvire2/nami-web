# Correction Checklist — Audit et réécriture en 5 étapes

## Étape 1 — Diagnostic (Go / No-Go)

Répondre à ces 4 questions avant toute correction. Si une réponse est "Non" → action spéciale.

| # | Question | Si Non |
|---|----------|--------|
| 1 | Le sujet est-il dans le périmètre d'expertise du site ? | Recommander suppression + 410 Gone, ou redirection 301 si un article proche existe |
| 2 | Le mot-clé principal correspond-il à une vraie intention de recherche (volume > 0) ? | Identifier le bon mot-clé avant de corriger |
| 3 | L'audience est-elle cohérente tout au long de l'article ? (patient OU professionnel, pas les deux) | Choisir l'audience et réécrire en conséquence |
| 4 | L'article apporte-t-il une valeur que le lecteur ne trouverait pas en 30 secondes sur Google ? | Enrichir substantiellement ou fusionner avec un autre article |

---

## Étape 2 — Réécriture structurelle

### H1
- [ ] Contient le mot-clé principal en début
- [ ] 50-65 caractères
- [ ] Pas de formule template ("Tout savoir sur...", "Guide complet de...")
- [ ] Donne envie de lire + promet un bénéfice

### Hiérarchie H2 / H3
- [ ] Chaque H2 cible une intention de recherche secondaire identifiable
- [ ] Pas de saut de niveau (H1 → H3 sans H2)
- [ ] Pas de H2 génériques ("Introduction", "Conclusion", "Développement")
- [ ] Les H2 fonctionneraient comme titres autonomes dans les SERP

### Sections obligatoires (article santé)
- [ ] Introduction avec donnée chiffrée (incidence/prévalence France)
- [ ] Section "Quand consulter" ou "Quand s'inquiéter"
- [ ] FAQ (3-5 questions avec infos nouvelles)
- [ ] Sources complètes
- [ ] Disclaimer médical en fin d'article

### Sections à supprimer
- [ ] Posologies (doses, voies d'administration) dans un article patient
- [ ] Plans numérotés mal nettoyés ("5.1", "3.2.a")
- [ ] Sections vides ou avec placeholder
- [ ] Contenu dupliqué entre le corps et la FAQ

---

## Étape 3 — Réécriture rédactionnelle

### Phrases template à éliminer systématiquement

Chacune de ces formulations doit être remplacée par du contenu spécifique et sourcé :

| Phrase template (SUPPRIMER) | Remplacement (ÉCRIRE) |
|---|---|
| "est une pathologie qui touche de nombreuses personnes" | "[Pathologie] concerne [X]% de la population française, soit environ [Y] personnes (Source, Année)" |
| "il est important de" | [Supprimer et aller droit au fait] |
| "n'hésitez pas à consulter" | "Consultez votre médecin traitant si [critère concret]" |
| "la prise en charge varie selon les cas" | "Le traitement repose sur [3 piliers concrets] adaptés au stade de la maladie" |
| "un suivi médical régulier améliore le pronostic" | "Un suivi tous les [X] mois avec [spécialiste] permet de [bénéfice concret] (Source)" |
| "est guérissable dans certains cas" | "[X]% des patients atteignent une rémission complète à [Y] ans (Source)" |
| "votre médecin traitant est le premier interlocuteur" | "Le diagnostic commence par votre médecin traitant, qui vous orientera vers [spécialiste] si [critère]" |
| "de nombreuses options de traitement existent" | "Les traitements recommandés par la [société savante] comprennent : [liste concrète]" |

### Variantes du mot-clé

Pour chaque article, produire un tableau de variantes :

```
Mot-clé principal : "parcours obésité complexe"
├── Synonyme médical : "prise en charge pluridisciplinaire de l'obésité"
├── Langage patient : "suivi pour problème de poids"  
├── Longue traîne 1 : "parcours obésité complexe adulte remboursement"
├── Longue traîne 2 : "qui consulter pour obésité sévère"
├── Longue traîne 3 : "équipe soins obésité comment ça marche"
└── Variante GEO : "parcours obésité Paris Île-de-France"
```

Utiliser chaque variante 1 fois dans l'article, naturellement.

### Ton et style

- Vouvoiement systématique
- "Nous" éditorial (jamais "je")
- Phrases de 15-20 mots en moyenne (Flesch-Kincaid adapté)
- Pas de jargon médical sans explication immédiate entre parenthèses
- Transitions entre chaque section (pas de juxtaposition sèche)
- Empathie sans condescendance : parler au lecteur comme à un adulte intelligent qui n'est pas spécialiste

---

## Étape 4 — SEO technique

### Maillage interne
- [ ] 2-3 liens vers d'autres articles du blog (ancres descriptives)
- [ ] 1 lien vers une page de service/fonctionnalité
- [ ] 1 lien vers la page équipe/à propos
- [ ] Aucune ancre "cliquez ici" ou "en savoir plus"
- [ ] Les liens sont distribués naturellement dans le texte (pas tous en fin d'article)

### Images et alt text
- [ ] Au moins 1 image/infographie par article pilier
- [ ] Alt text descriptif avec mot-clé quand naturel (pas de keyword stuffing)
- [ ] Format WebP ou AVIF pour la performance
- [ ] Lazy loading activé
- [ ] Nom de fichier descriptif (anorexie-parcours-soins.webp, pas IMG_4523.jpg)

### Meta tags
- [ ] Meta title : 50-65 chars, mot-clé en début, " | [Marque]" en fin
- [ ] Meta description : 145-155 chars, mot-clé, bénéfice, CTA implicite
- [ ] Slug : 3-5 mots, sans accents, sans stop words
- [ ] Canonical URL correcte

### Schema markup
- [ ] JSON-LD MedicalWebPage ou Article
- [ ] JSON-LD FAQPage
- [ ] JSON-LD BreadcrumbList
- [ ] Tester avec Google Rich Results Test avant publication

### Performance
- [ ] Temps de chargement < 3s (LCP)
- [ ] Pas de JavaScript bloquant le rendu de l'article
- [ ] Pas de pop-up/interstitiel sur mobile

---

## Étape 5 — Livrable

Pour chaque article corrigé, produire :

1. **L'article complet en markdown** avec le format standard (voir SKILL.md §5)
2. **Meta title + meta description** dans le frontmatter
3. **Schema JSON-LD** dans un bloc code séparé
4. **Liste des mots-clés** : principal + 3-5 secondaires
5. **Suggestions visuelles** : 1-2 idées d'images/infographies à créer
6. **Score /10** selon la grille (voir `scoring-grille.md`)
7. **Liens internes suggérés** : vers quels articles existants mailler

---

## Signaux d'alerte — Red flags qui indiquent un article généré non édité

Si PLUS DE 3 de ces signaux sont présents, l'article doit être réécrit de zéro, pas simplement édité :

1. Phrase d'ouverture template applicable à n'importe quelle pathologie
2. Le mot-clé exact est répété plus de 6 fois sans variation
3. Les FAQ recopient les titres H2 sous forme interrogative
4. Des numéros de section orphelins ("5.", "3.2")
5. Mélange d'audience (posologies + langage patient)
6. Aucune donnée chiffrée sourcée
7. Sources listées sans titre ni année ("HAS", "OMS")
8. Moins de 500 mots de contenu utile
9. Aucun lien interne ni externe
10. Le titre H1 est identique à la meta description
