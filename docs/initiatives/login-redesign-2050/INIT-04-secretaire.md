# INIT-04 — Page de connexion **Secrétariat** (P4)

> **Parent** : [INIT-MASTER](./INIT-MASTER.md)  •  **Statut** : Phase 0 — spec  •  **Owner** : Margot Vire  •  **Sans mascotte**

---

## 1. Audience & contexte

**Qui se connecte ici** : secrétaire médicale opérationnelle, souvent **multi-comptes** (gère plusieurs soignants via `Delegation`), parfois multi-structures. **Profil émotionnel** : pragmatique, rapide, allergique à toute friction inutile. **Contexte typique** : desktop, plein écran, 9h–18h en continu, beaucoup de tabs ouverts. **Sensibilité** : forte au temps perdu ; faible au décoratif. Veut *« j'arrive, je bascule sur la bonne casquette, je travaille »*.

**Promesse à tenir en 3 secondes d'écran** : *« Vos praticiens, prêts. Vous choisissez. »*

---

## 2. Signature visuelle — proposition « Le sélecteur de casquettes »

### 2.1 Concept

Une fois l'email + mot de passe saisis, l'écran ne redirige pas direct vers une home : il révèle un **sélecteur visuel de casquettes** (les soignants que la secrétaire gère par `Delegation`). Chaque casquette = une **carte cousue par un fil**, avec photo (ou initiales), nom, spécialité, nombre de RDV du jour, dernière action.

Avant l'auth, l'écran montre déjà un **aperçu silhouetté** des casquettes (sans données identifiantes, juste 3-4 silhouettes flottantes reliées par le fil de couture) — signal *« vous allez retrouver vos praticiens »*.

Au submit auth réussi, transition **morph** : les silhouettes deviennent les vraies cartes praticiens (220 ms, fade-in stagger 60 ms par carte). La secrétaire clique une casquette → home avec contexte praticien chargé.

### 2.2 Palette spécifique

- **Fond** : `#FAFAF8` (jour) avec léger motif de couture en filigrane `rgba(91,78,196,0.04)`.
- **Cartes casquettes** : `#FFFFFF`, bordure `rgba(91,78,196,0.1)`, ombre `0 4px 16px rgba(26,26,46,0.04)`, hover : élévation + bordure `#5B4EC4`.
- **Fil entre cartes** : pointillé `rgba(91,78,196,0.35)`, animé subtilement.
- **Indicateur RDV du jour** : pastille teal `#3DC5B7`, count blanc.
- **CTA auth** : violet primary plein.
- **Badge structure** (si multi-structure) : `rgba(43,168,156,0.12)` fond, texte `#1A6E66`.

### 2.3 Typographie

- **H1** : Plus Jakarta Sans 28/700, *« Vous gérez aujourd'hui : »*.
- **Nom praticien sur carte** : DM Sans 16/600.
- **Spécialité** : DM Sans 13/400 helper.
- **Compteur RDV** : Inter 22/800 (cohérent avec `.text-stat-number`).
- **CTA auth** : DM Sans 15/600.

### 2.4 Microcopy (voix pragmatique)

| Slot | Copy |
|------|------|
| H1 (avant auth) | Bon retour. |
| Sous-titre (avant auth) | Vos praticiens vous attendent. |
| Label email | Adresse email |
| Placeholder | secretariat@cabinet.fr |
| CTA auth | Voir mes praticiens |
| H1 (après auth) | Vous gérez aujourd'hui : |
| Carte praticien — compteur | 12 RDV aujourd'hui |
| Carte praticien — last | Dernière action il y a 2h |
| Empty state (aucun praticien) | Aucun praticien ne vous a encore délégué l'accès. Demandez à votre praticien de référence d'activer votre compte. |
| Footer | Vous agissez toujours au nom du praticien sélectionné. Vos actions sont tracées. |
| Error | Identifiants non reconnus. Réessayez ou réinitialisez votre mot de passe. |

---

## 3. Specs techniques

### 3.1 Composants à créer

```
src/app/login/_2050/secretaire/
├── SecretariatLoginScreen.tsx       # 2 étapes : auth → sélecteur casquettes
├── SilhouettePreview.tsx            # silhouettes avant auth
├── DelegationCard.tsx               # carte praticien post-auth
├── ThreadBetweenCards.tsx           # fil entre cartes (SVG)
├── SecretariatFooter.tsx
└── __tests__/
```

### 3.2 Flow auth → sélecteur

- L'étape 1 (silhouettes + form) tient en 1 viewport mobile.
- À l'auth réussi, appel `GET /api/delegations/me` (existe déjà côté backend).
- L'étape 2 fade-in en 220 ms, stagger 60 ms par carte.
- Sélection d'une casquette → `POST /api/delegations/activate/:practitionerId` → redirect `/(secretariat)/secretariat/dashboard`.
- État *« j'agis pour le compte de X »* (Delegation Banner) affiché en haut sur **toutes** les pages secrétariat (cohérence ADN).

### 3.3 Multi-structure

- Si la secrétaire est rattachée à plusieurs structures : grouper les casquettes par structure avec un **séparateur** (chip nom de structure).
- Compteur de RDV total par structure visible en header de groupe.

### 3.4 A11y

- Sélecteur casquettes = `<ul role="list">` + `<li><button aria-label="Activer le compte de Dr. X">…</button></li>`.
- Navigation clavier : flèches haut/bas/gauche/droite pour naviguer la grille des cartes ; Enter pour activer.
- Le passage de l'étape auth → sélecteur annonce le changement de contexte via `aria-live="polite"`.

### 3.5 Sécurité

- Aucun changement au flow auth.
- L'endpoint `/api/delegations/me` est déjà sécurisé (vérifie cookie session + scope secrétaire).
- Pas d'exposition d'identités de praticiens avant auth (silhouettes = SVG vides, pas de fetch).
- Audit `nami-compliance-audit` obligatoire (zone Delegation = sensible RGPD).

---

## 4. Critères d'acceptation

- [ ] Lighthouse desktop : LCP < 1.2 s, perf ≥ 95, A11y = 100.
- [ ] Test corridor 2 secrétaires : 2/2 disent *« je sais où cliquer pour ma première praticienne »* en < 3 s.
- [ ] Navigation clavier complète testée.
- [ ] Multi-structure : 3 praticiens × 2 structures rendus sans casser le viewport.
- [ ] `prefers-reduced-motion` : pas de stagger, cartes apparaissent ensemble.
- [ ] Bundle delta sur `/login` secrétaire ≤ +15 ko gzipped.
- [ ] Audit compliance : zéro P0/P1.

---

## 5. Tâches Phase 5 (prototype, en parallèle de INIT-03)

1. Scaffold `src/app/login/_2050/secretaire/`.
2. Implémenter `SilhouettePreview.tsx`.
3. Implémenter `SecretariatLoginScreen.tsx` (2 étapes).
4. Implémenter `DelegationCard.tsx` + `ThreadBetweenCards.tsx`.
5. Câbler `GET /api/delegations/me` + `POST /activate`.
6. Tests RTL : flow nominal, multi-structure, empty state, clavier.
7. Playwright e2e : login secrétaire → sélection casquette → home secrétariat.
8. Capture vidéo 20 s pour Notion.

**Estimation rough** : 2 jours de dev + 0.5 jour de polish.

---

## 6. Hors-périmètre

- Pas de redesign du **Delegation Banner** présent dans l'app post-auth (init dédiée si besoin).
- Pas d'écran de demande d'activation par un praticien (init dédiée `secretariat-onboarding`).
- Pas de switch « casquette en cours » depuis le header (déjà existant ailleurs).

---

## 7. Questions ouvertes

1. **Photos praticiens** : on affiche la photo officielle (si dispo) ou seulement des initiales colorées par profession ?
2. Si la secrétaire gère **plus de 12 praticiens** : pagination, recherche, ou scroll vertical naturel ?
3. Le **footer trust** doit-il rappeler explicitement la traçabilité Delegation ou est-ce redondant avec le Banner post-auth ?

À trancher avec founder avant Phase 5.
