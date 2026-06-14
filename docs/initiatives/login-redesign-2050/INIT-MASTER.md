# INIT — Refonte pages de connexion Nami « 2050 »

> **Statut** : Phase 0 — cadrage  •  **Créé le** : 2026-06-13  •  **Owner** : Margot Vire  •  **Branch** : `feat/login-redesign-2050-2026-06-13`  •  **Worktree** : `nami-web-worktrees/login-redesign-2050-2026-06-13`

---

## 1. Pourquoi cette initiative

La page de connexion `app.namipourlavie.com/login` (et ses variantes patient / structure / secrétariat) constitue **la première impression authentifiée** du produit. Aujourd'hui l'écran est fonctionnel mais perçu comme « vieux » : peu d'ambiance, peu de mouvement, peu de signature. Or la première connexion est aussi le moment où l'utilisateur décide inconsciemment si Nami est *« encore un logiciel de plus »* ou *« un produit fait en 2026 par des gens qui savent »*.

Objectif : transformer chacune des quatre portes d'entrée en une **expérience signature**, alignée sur le brief design V2026 (Apple / Linear / Stripe / Rauno / Arc / Raycast — puis transcendé), tout en respectant les contraintes santé/RGPD/HDS et sans casser l'existant.

> **Phrase pivot.** *« On ne se connecte pas à un outil. On entre dans une équipe. »*

---

## 2. Périmètre — 4 surfaces

| # | Surface | Route(s) actuelle(s) | Priorité | Spécificité |
|---|---------|----------------------|----------|-------------|
| 1 | **Soignant** (PUPH, libéral, diét., psy., médecin…) | `/login` (rôle pro) | **P1 — démarrage** | Voix pragmatique, densité maîtrisée, *zéro mascotte* |
| 2 | **Patient** | `/login` (rôle patient) → espace `(patient)` | P2 | Mascotte Nami animée = **logo vivant côté patient uniquement** |
| 3 | **Structure** (CPTS / réseaux / hôpitaux / directeurs) | `/login` (rôle admin de structure) + `/structure/select` | P3 | Voix institutionnelle, ambiance « cockpit de pilotage » |
| 4 | **Secrétariat** | `/login` (rôle secrétaire) → `(secretariat)` | P4 | Switcher de casquette ultra-lisible (multi-praticiens) |

**Hors périmètre de cette init** : signup, forgot/reset password, MFA setup, validation-en-cours. Ils seront traités dans une init `auth-flows-2050` séparée si la refonte login est validée.

---

## 3. Ambition design — signature 2050

Le brief design V2026 fixe la barre : **« ne pas s'arrêter à Apple-class. Aller plus loin. »** Pour ces 4 logins, cela se traduit par :

- **Le fil de couture** comme primitive motrice. Un trait continu, vivant, animé sur le canvas (Three.js / Canvas2D / SVG morph) qui *coud* les éléments de l'écran : champs, CTA, illustration de fond, transition vers la home après auth. Variation par surface (cf. INIT par surface).
- **Lumière chaude, jamais corporate-dark**. Surfaces `#FAFAF8` / `#F5F3EF` dominantes. Le `#1A1A2E` autorisé uniquement par ponctuation côté soignant pour la signature « cockpit ».
- **Motion qui a un sens**. Toute animation doit *relier*, *guider* ou *confirmer*. Aucune anim décorative. Easing universel `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Typographies déjà en place** (zéro nouvelle dépendance) : Plus Jakarta Sans (display), DM Sans (UI), Inter (data), Playfair Display (touche émotionnelle).
- **Pas de glassmorphism gratuit**. Le glass V2 Nami (soft/medium/strong) est autorisé, mais seulement si justifié par la profondeur de la composition.
- **Une signature unique par surface**, reconnaissable à 3 secondes. Cf. INIT-01 à INIT-04.

**Anti-objectifs** :
- Pas de *dark mode SaaS générique*.
- Pas d'illustration 3D Lottie « stocky ».
- Pas d'animation qui retarde la saisie du champ email de plus de **150 ms après LCP**.
- Pas de dépendance JS > 30 ko gzipped ajoutée aux 4 routes auth.

---

## 4. Décisions prises en Phase 0

| # | Décision | Raison |
|---|----------|--------|
| D1 | **Démarrer par le soignant** | Audience cible 7 juillet 2026 ; pas de mascotte = moins de risque émotionnel ; pose la grammaire du fil pour les 3 autres surfaces. |
| D2 | **Mascotte Nami = patient uniquement** | Confirmé par founder ; côté pro = pragmatisme, pas de tendresse. |
| D3 | **Stack** : Next.js App Router 15 (existant) + Tailwind v4 CSS-first + design tokens Nami v2 + CSS animations natives + Canvas2D (ou WebGL si justifié) pour le fil | Zero-new-dep, respecte la règle `nami-pages-scroll` (pas de framer-motion sur surfaces non-app). |
| D4 | **Pas de big-bang** | Refonte par surface, A/B switch via feature flag (`NEXT_PUBLIC_LOGIN_2050=1`), rollback < 5 min. |
| D5 | **Une seule route `/login`** conservée | Détection du rôle après auth → redirection. On enrichit visuellement la même route, on ne fragmente pas. |
| D6 | **Mobile-first** | 60 %+ des connexions soignant en mobilité (estimation à valider). |

---

## 5. Critères de succès

**Quantitatif (à mesurer avant / après via PostHog)** :
- Time-to-first-input ≤ **1.2 s** (median).
- Taux d'abandon avant submit ≤ **8 %** sur 7 jours (baseline à mesurer).
- Lighthouse LCP < **2.0 s** mobile / **1.2 s** desktop.
- Lighthouse A11y **100/100**, performance **≥ 95**.
- Zéro régression sur le taux de succès MFA.

**Qualitatif** :
- Test corridor 5 soignants : **3/5 minimum** disent *« on dirait pas un logiciel médical »* (formulation libre).
- Compliance : audit `nami-compliance-audit` passé sans P0/P1 sur les 4 surfaces.
- A11y manuelle : NVDA + VoiceOver iOS OK, navigation clavier complète.

---

## 6. Risques & mitigation

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Anim « 2050 » casse la perf mobile bas de gamme | Friction conversion, page rage-quit | Budget JS strict ; `prefers-reduced-motion` honoré ; fallback statique testé sur Moto G4. |
| Glass/blur cassent la lisibilité a11y | Échec audit, exclusion seniors | Contraste WCAG AAA forcé sur tous textes ; jamais de texte sur blur dynamique. |
| Mascotte côté patient interprétée comme infantilisante (ado TCA) | Désengagement | Test utilisateurs ado TCA AVANT déploiement V1 patient ; toggle « apparence sobre » prévu. |
| Founder en crunch (soutenance 28 juin, lancement 7 juillet) | Retard | Ordre P1→P4 strict ; chaque surface livrable indépendamment ; pas de dépendance bloquante entre INITs. |
| Régression sécurité (XSS via SVG inline, CSP) | P0 sécurité | Skill `security-guardian` invoquée à chaque PR ; CSP renforcée ; pas de `dangerouslySetInnerHTML`. |

---

## 7. Stack technique retenue

- **Frontend** : Next.js 15 (App Router), React 19, TypeScript strict.
- **Style** : Tailwind v4 CSS-first (existant), design tokens `nami-design-v2`.
- **Motion** : CSS keyframes + IntersectionObserver + rAF. **Pas de framer-motion sur les 4 routes login**.
- **Canvas (signature « fil »)** : Canvas2D natif (~3 ko) en V1. WebGL/Three.js réservé à la V2 si l'effet visé ne tient pas en 2D.
- **Build** : feature flag `NEXT_PUBLIC_LOGIN_2050` (default OFF en prod jusqu'à validation founder).
- **Test** : Playwright e2e (login soignant nominal + clavier seul + reduced-motion) ; axe-core ; Lighthouse CI.
- **Telemetry** : PostHog events `login_2050_viewed`, `login_2050_submit`, `login_2050_error`.

---

## 8. Plan d'exécution (haut niveau)

1. **Phase 0 — Cadrage (ce document)** ✅ *2026-06-13*
2. **Phase 1 — Moodboards image par surface** (skill `imagegen-frontend-web`, 3 directions × 4 surfaces) → choix founder.
3. **Phase 2 — INIT-01 Soignant : prototype HTML/CSS isolé** dans `docs/initiatives/login-redesign-2050/proto/soignant/`.
4. **Phase 3 — INIT-01 Soignant : intégration `/login` derrière flag**, tests, audit, A/B.
5. **Phase 4 — INIT-02 Patient** (mascotte intégrée).
6. **Phase 5 — INIT-03 Structure** + INIT-04 Secrétariat (livrables en parallèle).
7. **Phase 6 — Suppression du flag, dépose de l'ancien code, doc finale.**

Chaque phase = 1 PR atomique, 1 commit signé, 1 entrée WORKLOG.md.

---

## 9. Skills à mobiliser (référence)

- **Design / UI** : `magic` MCP, `emil-design-eng`, `apple-premium-site`, `ui-ux-pro-max`, `gpt-taste`, `high-end-visual-design`, `impeccable`.
- **UX / IA** : `ux-obviousness`, `nami-information-architecture`.
- **Image** : `imagegen-frontend-web` (moodboards par surface).
- **Code review** : `simplify`, `web-design-guidelines`.
- **Compliance** : `nami-compliance-audit`, `security-guardian`.
- **Cadrage** : `nami-platform-coherence`, `nami-ticket-lifecycle`.
- **Motion** : `gsap`, `css-animations`, `waapi`, `three`, `lottie`.

---

## 10. Livrables Notion attendus

Cette initiative produit en sortie de Phase 0 :

1. **INIT-MASTER.md** (ce fichier) — vision globale, à coller en page parent Notion.
2. **INIT-01-soignant.md** — détail surface P1, à coller en sous-page.
3. **INIT-02-patient.md** — détail surface P2 (mascotte).
4. **INIT-03-structure.md** — détail surface P3.
5. **INIT-04-secretaire.md** — détail surface P4.
6. **WORKLOG.md** — journal chronologique, à coller en sous-page « Logs ».

**Convention de remontée Notion** : un bloc *Toggle* par section pour les sections > 10 lignes ; tableaux markdown convertis natifs par Notion ; emojis interdits dans le titre Notion (cohérence avec base Notion existante).

---

## 11. Prochaine action

**Validation founder requise sur** :

- [ ] D1 à D6 (décisions Phase 0).
- [ ] Ordre P1 → P4.
- [ ] Mise en route Phase 1 : génération moodboards image (4 surfaces × 3 directions).

Une fois ces 3 cases cochées, on passe à Phase 1 sur ce même worktree.
