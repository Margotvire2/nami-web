# SKILL — Nami Pitch Deck Scroll

## Objectif

Construire la page `/pitch` : un pitch deck interactif en scroll pour les investisseurs VC (seed/pré-seed).  
Inspiré des grandes landing pages produit (Linear, Vercel, Stripe) — chaque section = 1 slide du deck, révélée au scroll.

## Contexte

- **Audience cible** : partenaires VC (Boris Golden / Partech, fonds santé numérique)
- **Objectif de la page** : convaincre en 3 minutes de scroll sans présentation orale
- **Ton** : sobre, précis, ambitieux — jamais promotionnel
- **Contrainte légale** : aucun mot interdit MDR (voir `compliance-integration.md`)

## Structure narrative (ordre des sections)

```
1. HOOK          → La phrase qui stoppe le scroll. Le problème en 1 ligne.
2. PATIENT        → Gabrielle. L'histoire fondatrice. Émotionnel + concret.
3. PROBLÈME       → Pourquoi le système échoue. Données chiffrées.
4. SOLUTION       → Ce que fait Nami. Workflow-first, pas médical.
5. PRODUIT        → Screenshots / démo animée. Ce qu'on a vraiment construit.
6. TRACTION       → Ce qui prouve que ça marche. Métriques réelles.
7. MARCHÉ         → Taille + wedge. TCA/obésité → nutrition → pluridisciplinaire.
8. MOAT           → Pourquoi Nami ne se copie pas. Network effect + données.
9. ÉQUIPE         → Margot. Insider unique. Diét TCA = première utilisatrice.
10. ROADMAP       → Ce qu'on build. HAP, HDS, appel obésité.
11. ASK           → Montant, usage des fonds, next milestone.
12. CTA           → Prendre RDV / Demander accès démo.
```

## Règles de design pour cette page

- Fond sombre (`#1A1A2E`) pour les sections hero/hook/équipe
- Fond clair (`#FAFAF8`) pour les sections produit/métriques
- Alternance dark/light crée le rythme de lecture
- Chaque section = `min-h-screen` ou `min-h-[80vh]`
- Animations : `ScrollReveal` (fade-up, fade-scale) — jamais de carousel
- Stats : `AnimatedCounter` au scroll
- Mobile-first : la page doit fonctionner sur téléphone (VC lit souvent sur mobile)

## Fichiers de référence

- `references/vc-rigor.md` — ce qui convainc vs ce qui agace un VC
- `references/design-patterns.md` — patterns visuels qui fonctionnent
- `references/compliance-integration.md` — intégration conformité MDR dans le pitch

## Fichiers à créer

```
src/app/pitch/page.tsx        ← Page principale (Server Component + "use client" sections)
src/app/pitch/layout.tsx      ← Layout minimal (pas de sidebar cockpit)
```

## Checklist avant livraison

- [ ] Aucun mot interdit MDR (surveiller, alerte clinique, scoring...)
- [ ] Histoire Gabrielle présente et émotionnelle
- [ ] Métriques réelles uniquement (pas de projections non sourcées)
- [ ] CTA clair avec calendly ou email direct
- [ ] tsc : 0 erreur
- [ ] Build Vercel : OK
- [ ] Testé sur mobile (responsive)
