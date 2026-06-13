# INIT-01 — Page de connexion **Soignant** (P1)

> **Parent** : [INIT-MASTER](./INIT-MASTER.md)  •  **Statut** : Phase 0 — spec  •  **Owner** : Margot Vire  •  **Sans mascotte**

---

## 1. Audience & contexte

**Qui se connecte ici** : PUPH, médecins libéraux, diététiciens, psychologues, pédiatres, endocrinologues, IPA, coordinateurs PCR. **Profil émotionnel** : pressé, méfiant envers les outils, allergique à la sur-promesse. **Contexte de connexion typique** : entre deux consultations, sur mobile pendant un transport, ou le matin avant la première patiente sur desktop au cabinet.

**Promesse à tenir en 3 secondes d'écran** : *« Ce n'est pas encore un logiciel. C'est un cockpit qui a du goût. »*

---

## 2. Signature visuelle — proposition « Cockpit qui coud »

### 2.1 Concept

Un **canvas interactif plein écran** affiche la signature Nami du « fil de couture » : un trait continu, animé en boucle douce, qui **trace en permanence un réseau de soignants connectés** (nœuds = membres de care team, edges = liens de coordination). Le trait s'épaissit subtilement au mouvement de la souris (desktop) ou au gyroscope (mobile) — sans jamais distraire la saisie.

Le formulaire d'auth est dans une **carte centrée** (max-width 420 px), surface chaude `#FFFFFF` sur fond `#FAFAF8`, ombre douce, radius 24, avec une **bordure « fil cousu » animée** : un pointillé qui parcourt la carte au scroll-in (350 ms, easing expo-out), puis se fige.

Au submit, le trait se **rétracte vers le centre de la carte** puis **explose vers la home** comme une vraie transition (220 ms), avec page-fade simultané.

### 2.2 Palette spécifique

- **Fond** : `#FAFAF8` (jour) / `#1A1A2E` (mode sombre soignant — réservé au cockpit, opt-in via préférence système).
- **Carte** : `#FFFFFF` (jour), bordure `rgba(91,78,196,0.12)`.
- **Fil de couture** : gradient `#5B4EC4` → `#3DC5B7` (violet primary → teal canonique), opacité 0.35–0.6.
- **CTA** : violet primary `#5B4EC4` plein, hover `#4A3FB5`, focus ring `#3DC5B7` 2 px.
- **Texte** : `#1A1A2E` (titres), `#3A3A4E` (body), `#6B6B7E` (helper). Contraste AAA partout.

### 2.3 Typographie

- **Titre H1** : Plus Jakarta Sans 32/700, kerning -0.02em, *« Bon retour, on continue ensemble. »*
- **Sous-titre** : DM Sans 16/400, color helper, *« Votre cockpit Nami se prépare. »*
- **Labels champs** : DM Sans 13/500 uppercase letter-spacing 0.5.
- **CTA** : DM Sans 15/600.

### 2.4 Microcopy (voix pragmatique)

| Slot | Copy |
|------|------|
| H1 | Bon retour. |
| Sous-titre | Votre équipe vous attend. |
| Label email | Adresse email professionnelle |
| Placeholder email | nom@cabinet.fr |
| Label password | Mot de passe |
| CTA | Entrer dans le cockpit |
| Link forgot | Mot de passe oublié |
| Footer trust | Chiffré bout en bout · Hébergé HDS · Conforme RGPD |
| Error generic | Identifiants incorrects. Réessayez ou réinitialisez votre mot de passe. |

---

## 3. Specs techniques

### 3.1 Composants à créer

```
src/app/login/
├── page.tsx                          # refonte (derrière flag NEXT_PUBLIC_LOGIN_2050)
├── _2050/
│   ├── SoignantLoginCard.tsx         # carte formulaire
│   ├── ThreadCanvas.tsx              # canvas2D du « fil »
│   ├── CardSeam.tsx                  # bordure fil animée de la carte
│   ├── TrustFooter.tsx               # HDS / RGPD / chiffrement
│   └── useReducedMotion.ts           # hook respect a11y
└── _2050/__tests__/                  # tests RTL + Playwright
```

### 3.2 Canvas du fil — algorithme V1 (Canvas2D)

- 7 à 12 nœuds positionnés en pseudo-random stable (seed = `Date.now() % 7` cappé) sur grille 12 col.
- Trait = courbe de Bézier cubique entre nœuds adjacents (graphe partiellement connecté, max degré 3).
- Animation : `requestAnimationFrame` à 60 fps cap, déplacement < 2 px / frame par nœud (drift Perlin-noise).
- Sur `prefers-reduced-motion: reduce` → état figé, fade-in 350 ms puis aucune animation.
- Sur mobile en mode économie batterie → fallback gradient mesh statique (image WebP 30 ko).
- **Budget** : ≤ 4 ko JS gzipped pour `ThreadCanvas.tsx`.

### 3.3 Feature flag & rollout

```ts
// src/lib/featureFlags.ts (à créer si absent)
export const LOGIN_2050 = process.env.NEXT_PUBLIC_LOGIN_2050 === '1';
```

- Phase 3 dev : flag ON en local + preview Railway.
- Phase 3 → 4 : flag ON pour 10 % du trafic via Edge config PostHog.
- Phase 4 : 100 % si pas de régression Sentry / Lighthouse.

### 3.4 A11y

- Carte = `<main role="main">` avec `<form aria-labelledby="login-title">`.
- Canvas = `aria-hidden="true"`, jamais focusable.
- Tab order : email → password → forgot link → CTA submit.
- Erreurs : `role="alert"`, focus auto sur le premier champ en erreur.
- Skip-link en haut de page : *« Aller au formulaire »*.

### 3.5 Sécurité

- Aucun changement sur le flow auth (`/api/auth/login`), MFA, rate limit côté serveur.
- CSP : `script-src 'self'` strict ; le canvas est inline JS = OK car bundle Next.
- Pas de `dangerouslySetInnerHTML`.
- Audit `security-guardian` à la PR.

---

## 4. Critères d'acceptation

- [ ] Lighthouse mobile : LCP < 2.0 s, perf ≥ 95, A11y = 100.
- [ ] Time-to-first-input ≤ 1.2 s (p50).
- [ ] Test corridor 3 soignants : 2/3 disent *« joli »* sans qu'on demande.
- [ ] `prefers-reduced-motion` honoré → canvas figé, vérifié manuellement.
- [ ] Tab seul → connexion possible sans souris.
- [ ] NVDA + VoiceOver iOS : aucun élément interactif sans label.
- [ ] Aucune régression sur taux de succès login (PostHog J-7 vs J+7).
- [ ] Bundle delta sur `/login` ≤ +12 ko gzipped.
- [ ] Audit `nami-compliance-audit` : zéro P0/P1.

---

## 5. Tâches Phase 2 (prototype)

1. Setup feature flag `NEXT_PUBLIC_LOGIN_2050`.
2. Scaffold `src/app/login/_2050/` (5 fichiers).
3. Implémenter `ThreadCanvas.tsx` V1 (Canvas2D, 60 fps cap, reduced-motion fallback).
4. Implémenter `SoignantLoginCard.tsx` (form + bordure animée).
5. Implémenter `CardSeam.tsx` (SVG pointillé qui s'anime au mount).
6. Implémenter `TrustFooter.tsx`.
7. Câbler dans `page.tsx` derrière le flag (fallback = page actuelle).
8. Tests RTL : rendu, submit OK, submit KO, reduced-motion.
9. Test Playwright : nominal clavier-seul + capture Lighthouse.
10. Capture vidéo 15 s pour Notion.

**Estimation rough** : 1.5 jour de dev + 0.5 jour de polish.

---

## 6. Hors-périmètre

- Pas de touche « Connexion Pro Santé » / e-CPS dans cette init (à traiter en init `psc-foundation` déjà ouverte).
- Pas de redesign de la page `forgot-password` ni `reset-password` ici.
- Pas de redesign du signup soignant (`/signup/professional`).

---

## 7. Questions ouvertes

1. Le **mode sombre cockpit** est-il opt-in via préférence système ou désactivé en V1 ?
2. La **vidéo de connexion** (capture animée) doit-elle être hébergée sur Notion ou dans le repo `/docs/initiatives/login-redesign-2050/media/` ?
3. Faut-il **un texte de connexion alternatif** pour les soignants en validation (`/validation-en-cours`) ?

À trancher avec founder avant Phase 2.
