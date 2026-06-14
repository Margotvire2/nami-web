# INIT-03 — Page de connexion **Structure** (P3)

> **Parent** : [INIT-MASTER](./INIT-MASTER.md)  •  **Statut** : Phase 0 — spec  •  **Owner** : Margot Vire  •  **Sans mascotte**

---

## 1. Audience & contexte

**Qui se connecte ici** : directeur de structure (CPTS, MSP, réseaux de soins, hôpitaux, AHP), responsable qualité, coordinateur réseau, animateur ARS. **Profil émotionnel** : posé, institutionnel, attentif aux indicateurs et au sérieux médical. **Contexte typique** : desktop, en bureau, avec d'autres outils ouverts en parallèle (ARS e-parcours, Excel, Outlook). **Sensibilité** : forte au sérieux ; faible au ludique. Doit voir *« plateforme de pilotage »*, pas *« joli SaaS »*.

**Promesse à tenir en 3 secondes d'écran** : *« Vous allez voir votre réseau d'un coup d'œil. »*

---

## 2. Signature visuelle — proposition « Le réseau qui s'éclaire »

### 2.1 Concept

Le fond montre une **carte stylisée du territoire** (France entière, ou région si on connaît la structure) avec **les nœuds de la structure qui s'éclairent un par un** au scroll-in : praticiens, antennes, points de coordination. Le « fil de couture » Nami parcourt la carte pour relier les nœuds — vitesse 1.2 s, easing expo-out. Une fois l'animation terminée, la carte respire doucement (drift ±2 px sur les nœuds, 8 s par cycle).

Le formulaire d'auth est placé en **panneau latéral droit** (desktop) ou en **modal bottom** (mobile), surface `#FFFFFF`, max-width 440 px. La carte reste visible et active derrière, glass medium 28 px de blur uniquement sur la zone du formulaire.

Au submit, les nœuds **convergent** vers le centre du formulaire avec un effet « zoom in », puis la home structure s'ouvre.

### 2.2 Palette spécifique

- **Fond** : `#FAFAF8` avec carte SVG monochrome `rgba(91,78,196,0.08)`.
- **Nœuds éteints** : `rgba(91,78,196,0.15)`.
- **Nœuds allumés** : gradient radial `#5B4EC4` → `#3DC5B7`, halo `rgba(91,78,196,0.4)` blur 12 px.
- **Fil de couture** : `#5B4EC4` solid stroke 1.5 px, opacité 0.5.
- **Panneau form** : `#FFFFFF`, ombre `0 8px 32px rgba(26,26,46,0.08)`, bordure `rgba(91,78,196,0.1)`.
- **CTA** : violet primary plein.
- **Footer institutionnel** : `#6B6B7E`.

### 2.3 Typographie

- **H1** : Plus Jakarta Sans 32/700, *« Votre console de pilotage. »*
- **Sous-titre** : DM Sans 15/400 color helper, *« Vue d'ensemble du réseau, indicateurs PCR, complétude des parcours. »*
- **Labels** : DM Sans 13/500 uppercase.
- **CTA** : DM Sans 15/600.

### 2.4 Microcopy (voix institutionnelle / factuelle)

| Slot | Copy |
|------|------|
| H1 | Votre console de pilotage. |
| Sous-titre | Vue d'ensemble du réseau, en un coup d'œil. |
| Label email | Adresse email professionnelle |
| Placeholder | direction@structure.fr |
| CTA | Accéder à la console |
| Footer trust | Plateforme hébergée HDS · Conforme RGPD · Indicateurs alignés HAS |
| Switch link | Connexion soignant individuel → `/login` |
| Error | Identifiants non reconnus. Vérifiez l'orthographe ou contactez votre administrateur de structure. |

---

## 3. Specs techniques

### 3.1 Composants à créer

```
src/app/login/_2050/structure/
├── StructureLoginPanel.tsx
├── NetworkMapCanvas.tsx        # SVG/Canvas2D de la carte + nœuds
├── NodeIgnition.tsx            # animation d'allumage séquentiel
├── StructureTrustFooter.tsx
└── __tests__/
```

### 3.2 Carte territoriale — algorithme V1

- SVG statique pré-rendu de la France (≤ 8 ko gzipped, depuis topojson simplifié).
- 8 à 14 nœuds positionnés en pseudo-random (graine fixe = `hash(structureSlug || "default")` pour stabilité).
- Allumage : `setTimeout` chaîné de 120 ms par nœud, total ≤ 1.5 s.
- Halo via SVG filter `<feGaussianBlur stdDeviation="6">`.
- `prefers-reduced-motion` : tous nœuds allumés instantanément à t=0, pas de drift.

### 3.3 Pré-remplissage si structureSlug en URL

- Si `/login?structure=<slug>` : afficher en haut du panneau *« Vous vous connectez à : <Nom Structure> »*.
- Si slug invalide : afficher le login générique sans badge.
- Aucun appel API exposant la liste des structures.

### 3.4 A11y

- Carte = `aria-hidden="true"`.
- Panneau = `<aside role="region" aria-labelledby="structure-login-title">`.
- Tab order standard.

### 3.5 Sécurité

- Aucun changement au flow auth.
- Pas d'exposition de liste de structures côté client.
- CSP standard.

---

## 4. Critères d'acceptation

- [ ] Lighthouse desktop : LCP < 1.2 s, perf ≥ 95, A11y = 100.
- [ ] Test corridor 2 directeurs de structure : 2/2 disent *« on dirait un outil de pilotage »* (pas *« joli »*).
- [ ] Carte territoire ne crée aucun CLS.
- [ ] `prefers-reduced-motion` : carte figée, nœuds allumés sans séquence.
- [ ] Bundle delta sur `/login` structure ≤ +20 ko gzipped (carte SVG inclus).
- [ ] Compliance : zéro P0/P1.

---

## 5. Tâches Phase 5 (prototype)

1. Récupérer topojson France simplifié (≤ 8 ko).
2. Scaffold `src/app/login/_2050/structure/`.
3. Implémenter `NetworkMapCanvas.tsx`.
4. Implémenter `NodeIgnition.tsx` (séquence + halo).
5. Implémenter `StructureLoginPanel.tsx` (form latéral / modal mobile).
6. Tests RTL + Playwright.
7. Capture vidéo 15 s pour Notion.

**Estimation rough** : 1.5 jour de dev + 0.5 jour de polish.

---

## 6. Hors-périmètre

- Pas de SSO / SAML structure (init dédiée si demandé par CPTS).
- Pas de redesign de l'écran `/structure/select` (sélection multi-structure post-auth).

---

## 7. Questions ouvertes

1. La carte affiche-t-elle la **France entière** ou la **région de la structure** (si connue) ?
2. Faut-il un **mode démo** sur cette page pour les RDV commerciaux ARS ?
3. Le pré-remplissage `?structure=<slug>` est-il accepté par sécurité (énumération possible) ?

À trancher avec founder avant Phase 5.
