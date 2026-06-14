# INIT-02 — Page de connexion **Patient** (P2)

> **Parent** : [INIT-MASTER](./INIT-MASTER.md)  •  **Statut** : Phase 0 — spec  •  **Owner** : Margot Vire  •  **Mascotte Nami = ICI uniquement**

---

## 1. Audience & contexte

**Qui se connecte ici** : adolescent en parcours TCA, adulte obésité complexe, parent qui se connecte pour son enfant, sénior accompagné. **Profil émotionnel** : variable, charge cognitive et émotionnelle élevées. **Contexte typique** : mobile, soir, dans un moment d'inquiétude ou de routine. **Tolérance à la friction** : très basse. **Sensibilité au vocabulaire** : extrême (zéro mot anxiogène, jamais d'infantilisation pour les ados TCA).

**Promesse à tenir en 3 secondes d'écran** : *« Tu n'es pas seul·e. Ton équipe est là. »*

---

## 2. Signature visuelle — proposition « Le fil te retrouve »

### 2.1 Concept

À l'ouverture de la page, la **mascotte Nami** (le logo vivant) est centrée en haut de l'écran et **suit doucement le curseur / le doigt** (max ±12 px, easing breathe `cubic-bezier(0.4, 0, 0.6, 1)`, 2 s cycle). Elle a une **respiration discrète** : opacité 0.95–1, scale 1.00–1.02, 4 s par cycle.

En dessous, le formulaire de connexion est dans une **carte chaleureuse** ronde radius 28, surface `#FFFFFF`, ombre douce. Une **ligne de couture en pointillé** part du « cœur » de la mascotte et descend coudre le titre puis le formulaire — animation 800 ms à l'arrivée, easing expo-out.

Au submit, la mascotte **fait un sourire imperceptible** (variant SVG, 200 ms), le fil de couture **se tend** vers la home patient, et la transition est portée par un fade-up de 220 ms.

> **Garde-fou ado TCA** : la mascotte doit *jamais* être présentée comme « ton amie » ni « ton coach ». C'est *un repère visuel*, pas une relation parasociale.

### 2.2 Palette spécifique

- **Fond** : gradient mesh chaud `#FAFAF8` → `#F5F3EF` → `#EEEDFB` (très léger tint violet en bas).
- **Carte** : `#FFFFFF`, bordure `rgba(91,78,196,0.08)`, ombre `0 12px 40px rgba(91,78,196,0.06)`.
- **Mascotte** : couleurs natives du logo Nami, sans altération.
- **Fil de couture** : `rgba(91,78,196,0.45)` solid (plus marqué que côté soignant pour signaler la chaleur).
- **CTA** : violet primary `#5B4EC4`, plein, label *« Retrouver mon équipe »*.
- **Texte** : `#1A1A2E` (titres), `#3A3A4E` (body), `#6B6B7E` (helper).

### 2.3 Typographie

- **H1** : Plus Jakarta Sans 28/700 (un cran sous le soignant — plus chaleureux, moins exec).
- **Touche émotionnelle (sous-titre)** : Playfair Display 18/400 italic, *« on continue, à votre rythme »*.
- **Labels** : DM Sans 14/500 (pas uppercase ici — plus doux).
- **CTA** : DM Sans 16/600.

### 2.4 Microcopy (voix chaleureuse — règle stricte : « avec vous », jamais « bienvenue »)

| Slot | Copy |
|------|------|
| H1 | Vous revoilà. |
| Sous-titre (Playfair italic) | on continue, à votre rythme. |
| Label email | Votre adresse email |
| Placeholder email | vous@exemple.fr |
| Label password | Votre mot de passe |
| CTA | Retrouver mon équipe |
| Link forgot | J'ai oublié mon mot de passe |
| Footer trust | Vos données restent à vous. Hébergement sécurisé en France. |
| Error generic | On n'a pas reconnu ces identifiants. Vous pouvez réessayer ou les réinitialiser. |

**Mots strictement bannis ici** : *score, niveau, progression, badge, performance, suivi, surveillance, contrôle, objectif chiffré*.

---

## 3. Specs techniques

### 3.1 Composants à créer

```
src/app/login/_2050/patient/
├── PatientLoginCard.tsx
├── NamiMascot.tsx               # SVG animé respirant + curseur
├── ThreadFromMascot.tsx         # SVG path de couture vers le form
├── PatientTrustFooter.tsx
└── __tests__/
```

### 3.2 Mascotte Nami — specs animation

- **Source** : `/public/nami-mascot.png` (présent) OU SVG si dispo. Si seul PNG existe : étape Phase 1 = recréer un SVG propre (skill `brandkit`).
- **Respiration** : `transform: scale(1) ↔ scale(1.02)` + `opacity: 0.95 ↔ 1`, 4 s ease-in-out infinite.
- **Suivi curseur** : `transform: translate(x,y)` où `x = clamp(mouseX-centerX, -12, 12) * 0.15`, `y = clamp(mouseY-centerY, -12, 12) * 0.15`, easing CSS `transition: transform 600ms cubic-bezier(0.4, 0, 0.6, 1)`.
- **Tactile** : sur mobile, suit le gyroscope (`DeviceOrientationEvent` avec permission iOS) — fallback : pas de mouvement, juste respiration.
- **Reduced-motion** : tout désactivé, mascotte statique, opacité 1.
- **Performance** : pas de re-render React, manipulation directe via `useRef` + CSS variables.

### 3.3 Fil de couture vers le form

- SVG `<path>` allant du centre-bas de la mascotte au centre-haut de la carte.
- Animé via `stroke-dasharray` + `stroke-dashoffset`, durée 800 ms expo-out, delay 200 ms après mount.
- Coupé visuellement par les éléments traversés (effet « le fil entre dans le titre »).

### 3.4 A11y

- Mascotte = `aria-hidden="true"`.
- Si une copie verbale est nécessaire pour lecteurs d'écran : *« Bienvenue dans votre espace patient. »* dans un `<span class="sr-only">`.
- Tab order : email → password → forgot → CTA.
- Erreurs : `role="alert"`, focus auto.
- Test obligatoire : VoiceOver iOS sur iPhone bas de gamme.

### 3.5 Sécurité & RGPD

- Aucune télémétrie spécifique côté patient en V1 (pas de PostHog `identify` avant auth).
- Aucune ressource externe (mascotte servie depuis `/public`, fonts auto-hébergées via Next).
- Audit `nami-compliance-audit` obligatoire avant merge (DM Sans + Plus Jakarta servies en self-host).

---

## 4. Critères d'acceptation

- [ ] Test corridor 3 patients (dont 1 ado TCA en cohorte test) : **0 / 3 disent « infantilisant »**. Si 1 le dit → toggle « apparence sobre » obligatoire en V1.
- [ ] Lighthouse mobile : LCP < 2.0 s, perf ≥ 95, A11y = 100.
- [ ] Mascotte respire sans CLS (Cumulative Layout Shift = 0).
- [ ] `prefers-reduced-motion` : mascotte statique, fil figé.
- [ ] VoiceOver iOS : flow complet utilisable sans voir l'écran.
- [ ] Bundle delta sur `/login` patient ≤ +18 ko gzipped (mascotte SVG inclus).
- [ ] Audit `nami-compliance-audit` : zéro P0/P1.

---

## 5. Tâches Phase 4 (prototype)

1. Récupérer / régénérer le SVG mascotte propre (Phase 1 via `brandkit`).
2. Scaffold `src/app/login/_2050/patient/`.
3. Implémenter `NamiMascot.tsx` (respiration + suivi).
4. Implémenter `ThreadFromMascot.tsx` (path animé).
5. Implémenter `PatientLoginCard.tsx`.
6. Tests RTL + Playwright (clavier + VoiceOver simulé via axe).
7. Test corridor 3 patients dont 1 ado TCA.
8. Capture vidéo 15 s pour Notion.

**Estimation rough** : 2 jours de dev + 1 jour de test utilisateur.

---

## 6. Hors-périmètre

- Pas de redesign du onboarding patient post-auth.
- Pas de redesign de l'app mobile React Native (init dédiée).
- Pas de version « invité » / liens magiques (init dédiée).

---

## 7. Questions ouvertes

1. **Mascotte** : on part du PNG existant ou on régénère un SVG propre en Phase 1 ?
2. **Suivi gyroscope** sur iOS : demande la permission utilisateur. On la demande dès la page login (intrusif) ou plus tard (mascotte sans suivi tactile en V1) ?
3. **Toggle « apparence sobre »** : prévu en V1 ou en V2 ?

À trancher avec founder avant Phase 4.
