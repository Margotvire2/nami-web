# Nami — Pricing (source canonique)

> **Source canonique unique des tarifs Nami.**
> Toute modification de tarif (montant, périmètre, intitulé d'un tier) doit
> être faite ICI en premier, puis répliquée sur les surfaces listées dans
> la procédure §5 ci-dessous.
>
> Dernière mise à jour : **2026-05-26** — voir §6 Historique.

---

## 1. Les 5 tiers Nami (V1)

| Tier | Prix | Cible | Inclus |
|---|---|---|---|
| **GRATUIT** | 0 €/mois | Soignant libéral isolé | Agenda, prise de RDV, référencement annuaire 582K, messagerie patients, messagerie soignants, téléexpertise, réseau |
| **ESSENTIEL** | 19 €/mois | Libéral non-médecin facturant | + Facturation non-médecin + Visio/téléconsultation (0 % commission) |
| **COORDINATION** | 79 €/mois | Libéral coordonnant un parcours patient | + Adressage structuré + App patient (IA photos repas, transmission docs) + Dashboard flux financiers KPIs soignant |
| **INTELLIGENCE** | 149 €/mois | Libéral expert ou cabinet pluri-pro | + Synthèses IA sourcées + Extraction bio auto + Base documentaire 22K + Moteur de complétude + App soignant mobile complète + Analytics financiers structures |
| **RÉSEAU** | 499 €/mois + 79 €/utilisateur | CPTS, MSP, réseau de soins, hôpital | + Configuration parcours complexes sur mesure + Vue pilote avancement + Multi-équipes + Parcours HAS + Dashboard KPIs structures financières + Admin & accès |

**Règles d'application :**
- Tous les tarifs sont **HT** sauf mention contraire explicite.
- Aucun engagement de durée minimum sur les tiers individuels (GRATUIT → INTELLIGENCE).
- Le tier RÉSEAU implique un contrat dédié — les modalités (engagement, périmètre, facturation) sont définies contractuellement.
- Patients : l'usage de Nami est **100 % gratuit** pour les patients et leurs proches (jamais facturés à aucun moment).

---

## 2. Forfaits structures et partenariats

Pour les acteurs institutionnels (ARS, CPTS, hôpitaux, mutuelles, réseaux de soins, DAC), la tarification est :

- **Adaptée au volume et au périmètre** du partenariat (nombre de soignants, nombre de patients suivis, territoire, durée du contrat).
- **Aucune grille publique** publiée — un devis personnalisé est établi après un premier échange.
- **Phase pilote** sans engagement long terme systématiquement proposée avant déploiement complet.

Voir `/partenaires` (page publique) pour le détail des modalités de partenariat institutionnel.

---

## 3. Conventions terminologiques (figées V1)

Ces formulations sont **canoniques** — ne pas paraphraser sur les surfaces publiques sans valider ici d'abord :

- **GRATUIT** (majuscules) — pas « Free », pas « Essai gratuit », pas « Découverte »
- **0 €/mois** — pas « gratuit à vie », pas « offert »
- **19 €/mois**, **79 €/mois**, **149 €/mois**, **499 €/mois + 79 €/utilisateur** — toujours avec le format exact `XX €/mois` (espace insécable entre montant et `€` accepté visuellement, mais ASCII `XX €/mois` dans les fichiers source pour grep / cohérence)
- **« 0 % commission »** sur la visio — formulation exacte, pas « sans commission »
- **« Référencement annuaire 582K »** — toujours le chiffre exact `582K` (582 000 soignants référencés FINESS+RPPS+ADELI), mis à jour ici si le chiffre évolue.
- **« Base documentaire 22K »** — chiffre rond (22 308 entrées au 2026-05-26).
- **« Parcours HAS »** — pas « parcours médical », pas « protocole médical »
- **« Synthèses IA sourcées »** — pas « résumés cliniques », pas « comptes rendus IA »
- **« Brouillon IA — à vérifier »** — wording légal MDR figé (CLAUDE.md §Wording légal obligatoire)

---

## 4. Paysage concurrentiel — benchmark

Référence interne pour le pitch et les pages publiques. À mettre à jour ici si un concurrent change ses tarifs.

| Acteur | Tarif comparable | Périmètre | Lecture Nami |
|---|---|---|---|
| **Doctolib** | 149 €/mois | Agenda + RDV + messagerie | Nami GRATUIT couvre ce périmètre |
| **Omnidoc** | Acte par acte (téléexpertise) | Téléexpertise unitaire | Nami GRATUIT inclut la téléexpertise dans le réseau |
| **Paaco-Globule** | Gratuit (financé ARS) | Coordination régionale | UX très pauvre, adoption faible (constat terrain) |
| **Santélien** | Variable | Coordination MSP uniquement | Pas d'IA, pas de base documentaire |
| **Lifen** | Variable | Échange de documents sécurisés | Tuyau sans intelligence de parcours |

**Positionnement Nami :** coordination pluridisciplinaire ville-hôpital + intelligence clinique intégrée — la case vide du marché.

---

## 5. Procédure de modification d'un tarif

**Avant** de modifier un montant ou un périmètre d'un tier, suivre cet ordre strict :

1. **Mettre à jour `PRICING.md`** (ce fichier) — la source unique.
2. **Mettre à jour le résumé rapide** dans `CLAUDE.md` (section `## Pricing` → ligne résumé V1).
3. **Répliquer sur toutes les surfaces publiques** affichant les tarifs :
   - `src/app/(public)/pricing/` (si la page existe)
   - `src/app/pitch/` (section pricing du deck VC)
   - `src/app/decouvrir/` (page hôpitaux)
   - `src/app/soignants-liberaux/` (landing libéraux)
   - `src/app/professionnels/*/` (landings par spécialité)
   - `src/app/partenaires/` (page institutionnelle — vérifier cohérence du message « tarification adaptée »)
   - `src/app/pour-les-proches/` (vérifier absence de tarif patient — doit rester silent)
   - `src/app/comment-ca-marche/` (si tarifs cités)
   - `src/app/faq/` (questions sur le pricing)
   - `src/app/presse/` (si boilerplate cite tarifs)
   - Tout fichier `*-data.ts` ou `*-data.tsx` contenant les montants
4. **Mettre à jour le mobile** (`~/nami-mobile/`) si une page tarifs y existe.
5. **Mettre à jour le backend** (`~/nami/`) uniquement si une logique de billing en dépend (Stripe price IDs, plan enum Prisma). Ne pas toucher au schema Prisma sans validation Margot.
6. **Mettre à jour `docs/INDEX.md` + `docs/FEATURES.md`** (côté backend `~/nami/docs/`) si la nouvelle grille déclenche un ticket ou retire une feature.
7. **Communication externe** (CRM Notion, deck, propales en cours) — à la charge de Margot, hors scope dev.

**Vérification de cohérence (script grep mental) :**
- Tous les fichiers cités doivent référencer **exactement** les mêmes montants que §1.
- Aucune surface publique ne doit afficher un tarif absent de §1.

---

## 6. Historique des versions

### V1 — 2026-05-26
- Création de `PRICING.md` comme source canonique unique.
- Extraction de la section pricing depuis `CLAUDE.md` (lignes 15-20 historiques) → remplacée par un pointer vers ce fichier.
- Grille V1 figée : 5 tiers GRATUIT / ESSENTIEL 19 € / COORDINATION 79 € / INTELLIGENCE 149 € / RÉSEAU 499 € + 79 €/utilisateur.
- Aucune modification de montant ni de périmètre — pure unification documentaire.

---

> **Maintenance :** ce fichier est sous la responsabilité de Margot Vire (fondatrice).
> Toute proposition de modification passe par une review explicite avant merge.
