---
name: pitch-deck-scroll
description: Skill pour créer des pitch decks scroll-based avec rigueur VC et conformité santé. Lire AVANT de construire /pitch ou /decouvrir.
---

# Pitch Deck Scroll — Le deck du futur

Lis ce fichier + les 3 références AVANT de construire.

## Framework narratif — 10 sections (page /pitch VCs)

1. HERO (100vh) — Titre mot par mot + mockup React géant (3 pathologies)
2. PROBLÈME — Citation cas réel + 3 compteurs géants sourcés
3. INSIGHT — "Aucun outil ne rend du temps" en serif italic, fade-blur, espace blanc massif
4. SOLUTION — Sticky scroll 300vh, 3 scènes patient (anorexie/obésité/épilepsie)
5. ARCHITECTURE TECHNIQUE — Fond sombre, 4 couches empilées, ambient glow
6. TRACTION — Timeline + cards institutionnelles honnêtes ("aucun engagement formel")
7. MARCHÉ — Fond sombre, compteurs géants (237 200 médecins, 4 000 MSP, 269 PCR, 20M patients)
8. PRICING — Face-à-face Doctolib 149€ barré vs Nami 0€ en gradient géant + 5 tiers
9. FONDATRICE — Split avatar + bio + citation + vélocité
10. CTA — Fond sombre, ambient glow pulsant, 1 bouton blanc

## Framework narratif — 8 sections (page /decouvrir hôpitaux)

1. HERO — "Quand votre patient voit 5 soignants..." + mockup
2. PROBLÈME — 3 pathologies, même défaut de coordination
3. COMMENT ÇA MARCHE — 3 étapes (Invitez, Documentez, Coordonnez)
4. SOLUTION — Même sticky scroll 3 pathologies
5. BASE DOCUMENTAIRE — Mockup recherche + compteurs animés
6. SÉCURITÉ — 6 éléments grille (HDS, chiffrement, secret pro, IA, audit, pas DM)
7. PRICING — Même face-à-face + 5 tiers
8. FONDATRICE + CTA — Combiné sur fond sombre

## Règles absolues
- Problème AVANT solution. Toujours.
- Chaque chiffre = une source (petit, italic, muted)
- Chaque section = UN message
- Mockups = composants React vivants (jamais des images)
- Titres GÉANTS : clamp(3rem, 8vw, 6rem) — ne pas être timide
- Sections 100vh minimum
- Le sticky scroll de la démo est OBLIGATOIRE — c'est le moment wow
- Statuts de validation HONNÊTES : jamais "intéressé" comme "client"
- JAMAIS de fond #000000 — utiliser #1A1A2E

## Rythme des fonds
Hero=#FAFAF8 → Problème=#F5F3EF → Insight=#FAFAF8 → Solution=#FAFAF8 → Archi=#1A1A2E → Traction=#FAFAF8 → Marché=#1A1A2E → Pricing=#F5F3EF → Fondatrice=#FAFAF8 → CTA=#1A1A2E

## Composants clés (src/components/pitch/)
- `WordByWordTitle` — titre mot par mot (80ms/mot, IntersectionObserver, gradient sur mots clés)
- `PitchStickyDemo` — wrapper 300vh sticky, 3 scènes (0-33%/33-67%/67-100% scroll), crossfade
- `PatientScene` — scène patient réutilisable (AnimatedSVGCurve, avatars, métriques, phase)
- `AnimatedSVGCurve` — trait SVG qui se dessine à chaque fois que la scène devient active
- `AmbientGlow` — orbes de glow flous animés (sections sombres uniquement)
- `PitchPricing` — comparaison Doctolib barré vs Nami 0€ en gradient + 5 tiers

## Mots interdits sur ces pages
surveillance, monitoring, alerte clinique, alerte santé, signaux, vigilance, scoring, détecter, prévenir, sécuriser, risque clinique, drapeaux rouges, care gaps, suivi longitudinal, continuité de prise en charge, IA clinique, aide à la décision, dispositif médical (sauf pour dire que Nami N'EN EST PAS un)

## Références
- references/vc-rigor.md — Frameworks VC, benchmarks, questions pièges, chiffres marché
- references/design-patterns.md — Patterns visuels par section, CSS patterns, anti-patterns
- references/compliance-integration.md — Conformité comme MOAT, deux vocabulaires
