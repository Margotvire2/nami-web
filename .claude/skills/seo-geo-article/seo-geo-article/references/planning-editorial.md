# Planning Éditorial — Méthode et calendrier

## Principes de planification

### Rythme de publication — Ce que Google attend

| Signal | Interprétation Google | Risque |
|--------|----------------------|--------|
| 2 200 articles en 1 jour | Spam / contenu généré automatiquement | Pénalité algorithmique ou manuelle |
| 50+ articles/jour | Suspect | Crawl budget gaspillé, évaluation négative |
| 15 articles/jour (jours ouvrés) | Rédaction avec équipe / reprise éditoriale | Acceptable si qualité OK |
| 3-5 articles/jour | Publication normale d'un média | Idéal |
| 2-4 articles/semaine | Blog d'entreprise actif | Standard pour un site de niche |

**Recommandation pour une republication massive après correction** : 15/jour est le maximum raisonnable. Au-delà, Google peut interpréter comme du spam même si le contenu est bon.

**Recommandation pour la production courante (après la republication)** : 2-4 articles/semaine pour maintenir la fraîcheur.

### Variété thématique

Ne jamais publier 30 articles sur le même sujet d'affilée. Google pourrait interpréter ça comme du keyword stuffing à l'échelle du site.

**Règle** : alterner les catégories. Si tu as 5 catégories, publier dans l'ordre rotatif : A, B, C, D, E, A, B, C...

### Timing de publication

- **Jours** : lundi à vendredi (plus crédible, meilleur crawl)
- **Heures** : varier entre 6h et 18h (pas tout à minuit)
- **Éviter** : publier le dimanche à 3h du matin (signal bot)

---

## Méthode de construction du calendrier

### Étape 1 — Inventaire des contenus existants

```sql
-- Adapter à ton schéma
SELECT 
  category,
  COUNT(*) as nb_articles,
  AVG(LENGTH(content)) as longueur_moyenne,
  MIN(published_at) as plus_ancien,
  MAX(published_at) as plus_recent
FROM articles
GROUP BY category
ORDER BY nb_articles DESC;
```

### Étape 2 — Priorisation

**Matrice de priorité** :

| | Volume de recherche ÉLEVÉ | Volume de recherche FAIBLE |
|---|---|---|
| **Difficulté SEO FAIBLE** | PUBLIER EN PREMIER (quick wins) | Publier en phase 2 |
| **Difficulté SEO ÉLEVÉE** | Publier en phase 2-3 (long terme) | Publier en dernier ou ignorer |

**Ordre de publication recommandé** :
1. Articles piliers sur les mots-clés à difficulté faible/moyenne et volume élevé
2. Articles satellites qui supportent les piliers (maillage interne)
3. Articles GEO locaux
4. Articles piliers sur les mots-clés compétitifs
5. Articles restants par ordre de pertinence

### Étape 3 — Interleaving (alternance des catégories)

```
Semaine 1 :
  Lun : TCA (pilier) — 5 articles
  Mar : Obésité (pilier) — 5 articles
  Mer : Nutrition (satellite) — 5 articles
  Jeu : Coordination (pilier) — 5 articles
  Ven : GEO local — 5 articles

Semaine 2 :
  Lun : Gastro (satellite) — 5 articles
  Mar : TCA (satellite) — 5 articles
  Mer : Obésité (satellite) — 5 articles
  Jeu : Santé mentale — 5 articles
  Ven : Pédiatrie — 5 articles
  
[Répéter en rotation]
```

### Étape 4 — Dates et heures

Pour chaque article, assigner :
- Une date (lundi-vendredi)
- Une heure pseudo-aléatoire entre 6h et 18h
- Un numéro de semaine pour le suivi

---

## Template de calendrier éditorial

```csv
semaine,date,heure,titre,slug,categorie,type,mot_cle_principal,statut
1,2026-04-21,08:30,Anorexie : parcours de soins complet,anorexie-parcours-soins,tca,pilier,anorexie parcours de soins,ready
1,2026-04-21,10:15,Boulimie : signes et prise en charge,boulimie-signes-prise-charge,tca,pilier,boulimie prise en charge,ready
1,2026-04-21,14:45,Le rôle du diététicien dans les TCA,dieteticien-tca-role,tca,satellite,diététicien TCA,ready
...
```

---

## Suivi et ajustements

### KPIs hebdomadaires (Search Console)

| Métrique | Où la trouver | Objectif |
|----------|--------------|----------|
| Pages indexées | Coverage → Valid | En hausse progressive |
| Impressions | Performance → Total impressions | En hausse à partir du mois 2 |
| Clics organiques | Performance → Total clicks | En hausse à partir du mois 3-4 |
| Position moyenne | Performance → Average position | < 30 sur les mots-clés cibles |
| Erreurs de crawl | Coverage → Excluded | Stable ou en baisse |

### Ajustements en cours de route

**Si le trafic ne décolle pas après 3 mois** :
- Vérifier l'indexation (toutes les pages sont-elles indexées ?)
- Vérifier les backlinks (0 backlink = difficulté à ranker)
- Analyser les positions : si beaucoup de mots-clés en position 10-20, optimiser ces articles en priorité

**Si Google ralentit le crawl** :
- Réduire le rythme de publication (passer de 15/jour à 10/jour)
- Vérifier les erreurs serveur (500) dans les logs
- Soumettre manuellement les URLs importantes dans Search Console

**Si des pénalités sont détectées** :
- Vérifier les "Manual Actions" dans Search Console
- Si "Thin content" → accélérer la correction des articles restants
- Si "Spammy content" → dépublier les articles non corrigés immédiatement

---

## Calendrier type pour 2 200 articles à 15/jour

```
Phase 1 — Dépublication totale : Jour 0
Phase 2 — Correction en continu : Jour 1 à Jour 44 (50 articles/jour avec Claude)
Phase 3 — Republication : Jour 7 à ~Jour 155 (15/jour, jours ouvrés = ~31 semaines)

Timeline :
  Avril 2026    : Dépublication + début correction
  Avril-Mai     : Correction intensive + début republication
  Mai-Novembre  : Republication progressive 15/jour
  Décembre 2026 : 2 200 articles republié, passage en mode production (2-4/semaine)

Premiers résultats SEO attendus :
  Mois 2-3 : Premiers mouvements en SERP
  Mois 4-6 : Trafic organique mesurable
  Mois 6-9 : Positions page 1 sur longue traîne
  Mois 9-12 : Autorité thématique établie
```
