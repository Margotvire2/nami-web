# Nami — Design System

> « Le soin est fragmenté. Nami le coud. »
> Couche de coordination des parcours de soins complexes (TCA, obésité, pédiatrie, nutrition pluridisciplinaire). Ce dépôt est la **source de vérité esthétique** pour restyler toute la plateforme de façon uniforme — web public, cockpit soignant, espace patient, espace secrétariat, espace structure, mobile.

Ce design system a été dérivé du `BRIEF-DESIGN-NAMI-V2026.md`, de la carte d'architecture fonctionnelle, et des maquettes haute-fidélité validées (cockpit « Le Fil », agenda, dossier patient + consultation persistante).

## Index
- **`colors_and_type.css`** — tous les tokens v2 (couleurs, type, espacement, rayons, ombres, motion, matière). Source unique de vérité. Inclut le mapping React Native.
- **`components.css`** — classes atomiques réutilisables (btn, card, input, chip, tag, badge IA, fil, lab, bandeau délégation, onglets, empty-state).
- **`SKILL.md`** — manifeste Agent Skill (Claude Code).
- **`preview/`** — cartes de prévisualisation (onglet Design System).
- **Maquettes hi-fi** (à la racine, exemplaires d'usage) : `Nami Cockpit — Le Fil (hi-fi).html`, `Nami Agenda — Semaine (hi-fi).html`, `Nami Agenda — Jour (hi-fi).html`, `Nami Régie — Équipe (hi-fi).html`, `Nami Dossier patient (hi-fi).html`, `Nami Agenda — Interactif.html`.

---

## La thèse — la couture vivante
La métaphore centrale de Nami n'est pas décorative : **c'est l'acte même du produit**. Coudre le soin fragmenté. Le **fil** est une grammaire à 3 niveaux :
- **Visuelle** — tracés de connexion entre membres d'une care team, étapes d'un parcours, nœuds d'un pathway.
- **Motrice** — les transitions « cousent » les éléments à l'entrée (un tracé qui se dessine).
- **De marque** — le dégradé **violet→teal** est « le fil teint ». **Réservé** au fil et au mot pivot ; partout ailleurs il banalise.

Le **contraste fondateur** : chaleur ET rigueur. Tendresse d'un compagnon côté patient, précision froide d'un cockpit côté soignant, sous le même ADN. Doux mais jamais mou ; dense mais jamais oppressant ; médical mais jamais hôpital.

En regardant un écran Nami 3 secondes : *« tout est relié, et je respire »*.

---

## CONTENT FUNDAMENTALS (ton & microcopy)
Nami ne décrit jamais une feature : il décrit un **soulagement**. Trois voix sous un même ADN :
- **Patient** — chaleureux, jamais infantilisant, jamais wellness toxique. *« Votre équipe communique. Vous avancez ensemble. »* · *« Tout votre parcours, un seul endroit. »* On dit **« vous »**, « votre équipe », « jamais seul ».
- **Soignant** — pragmatique, sobre, crédible. *« Le dossier complet en 5 secondes. »* · *« Dictez. L'IA structure. Vous validez. »* Pattern features = **« Plus besoin de… »** (le soulagement, pas la capability).
- **Institutionnel** — factuel, sourcé. *« Conforme à… »* · *« Sources : Cnam/HAS/DREES »* (3 stats max, jamais « étude interne »).

**Pattern signature** : la phrase pivot asymétrique **« X n'est pas Y. C'est Z. »** (une par page max ; dégradé sur le 2ᵉ fragment).
**Casse** : titres en sentence case ; labels en MAJUSCULES espacées (letter-spacing .06em). **Emoji : non** (sauf jamais côté clinique).
**Footer légal toujours présent** : *Outil de coordination · Non dispositif médical · Conforme RGPD.*

### Lexique MDR — NON NÉGOCIABLE
Nami = **canal de coordination**, **pas un dispositif médical**. Un seul mauvais mot = risque de requalification.
- **INTERDIT** (UI, microcopy, push, labels) : alerte / alerte clinique / de risque, signal clinique, surveillance / surveiller / télésurveillance, détecter / détection / dépister, scoring / score (de risque / patient), diagnostic / diagnostiquer, observance, prévention médicale. Verbes interdits : scorer, classer/évaluer (le patient), recommander, prescrire, contre-indiquer. Côté soignant éviter aussi : révolution, disruptif, ubérisation, gamification.
- **PRIVILÉGIÉ** : coordonner, centraliser / au même endroit, structurer, **complétude** (l'indicateur, pas un score), partager / dossier partagé, consolider, documenter, organiser, formaliser, transcrire, reformuler.
- Tout output IA porte **« Brouillon IA — à vérifier »** ; validation humaine obligatoire ; jamais présenté comme une décision.
- Exception : le **contenu sourcé** (HAS/ANSM/INCa/Cochrane affiché tel quel, avec citation + lien) est exempt — Nami est le canal, pas l'auteur. De même, une valeur de labo affichée avec **la plage de référence du laboratoire** est factuelle (« hors plage », jamais « critique »).

---

## VISUAL FOUNDATIONS
- **Couleurs** — neutres **chauds** dominants (`#FAF8F4` fond, `#FFFFFF` cartes, blanc cassé `#F4F1EA`). Primaire **violet `#5B4EC4`** (unifiée web↔mobile, on tranche le `#7C3AED` mobile legacy). Accent **teal `#3DC5B7`** (valeur canonique unique, on retire le `#2BA89C` legacy). Sévérité **désaturée**, usage rare, jamais pour juger le patient. Le **noir `#1F1E26` est une ponctuation**, jamais le mode par défaut. **Pas** de bleu hôpital, rose wellness, vert pharmacie.
- **Contraste** — viser **AAA** sur le texte courant (`--ink` sur `--paper`). Le teal pour le texte passe par `--teal-deep #1F9F92`.
- **Type** — **Plus Jakarta Sans** (UI + titres, weight 800, letter-spacing négatif sur les grands titres) · **Inter** (labels, corps dense, data) · **JetBrains Mono** (heures + chiffres cliniques, tabular-nums). **Playfair Display** : réservé éditorial/citations **côté patient uniquement** (à doser).
- **Espacement** — échelle modulaire 4 / 8 / 12 / 16 / 24 / 32 / 48. Cockpit : sidebar 220/64px repliée, header 56px, padding contenu 24px.
- **Rayons** — 6 / 9 / 13 / 18 / 24px + pill 100px. Cartes : `--r-lg` (18px).
- **Ombres** — **chaudes, basses, diffuses** (`rgba(60,50,40,…)`), jamais "glassy". 3 niveaux (`--sh-1/2/3`).
- **Matière (au-delà du glass)** — on quitte le glassmorphism omniprésent (effet 2021 daté). Fond **papier subtilement tramé** (`--weft`, deux gradients répétés très faibles). **Le fil est la seule "lumière"** de l'écran. Un seul rôle "verre" toléré : l'overlay ⌘K. Pas de glassmorphism gratuit, pas d'orbes ambiantes (cliché landing).
- **Backgrounds** — mats, chauds, alternance `--paper` / `--paper-2`. Max 2 sections sombres sur une page publique.
- **Bordures** — 1px `--line` sur cartes ; 1px `--line-2` sur contrôles ; filets internes `--hair`.
- **Animation** — easing signature **`cubic-bezier(.16,1,.3,1)`** (expo-out, ~90%). Durées : page 220ms, carte 350ms, onglet 260ms, panneau spring 400ms. **Signature motion = la couture** : un tracé qui se dessine pour relier (entrée de care team, liaison d'étapes, confirmation d'adressage). Tout motion **relie, guide ou confirme** — sinon il dégage. `prefers-reduced-motion` respecté : l'état final visible est l'état de base.
- **Hover** — élévation douce (`translateY(-1px)` + ombre montée), fonds qui s'éclaircissent (`--paper-2`). **Press** — pas de scale agressif.
- **Focus** — ring violet (`--focus-ring`), `outline-offset:2px`. Cibles tactiles ≥ 44px mobile.
- **Cartes** — `--surface`, bord `--line`, rayon 18px, ombre `--sh-1` (montée au survol si interactives).
- **Imagerie** — humaine, éditoriale (registre Kinfolk / One Medical), **jamais stock** « infirmière qui sourit en blouse ». Lumière chaude, diversité réelle. Placeholders : aplats tramés sobres avec mono explicatif.

### Anti-patterns (à éviter absolument)
Look SaaS générique (gradients clichés débordants, orbes ambiantes) · « CRM avec de belles ombres » (densité sans hiérarchie) · glassmorphism/neumorphism datés · dark mode par défaut · couleur médicale cliché · photos stock · UI qui ressemble à du monitoring/scoring/alerte (MDR) · mascotte côté soignant · mobile = web rétréci · dégradé violet→teal partout.

---

## ICONOGRAPHY
- **Base** : **Lucide** (web, `lucide-react`) — stroke 1.6–1.8, rounded linecap/linejoin, fill:none. Mobile : `@expo/vector-icons`.
- Dans ce dépôt, les icônes sont des **SVG inline Lucide-like** (stroke 1.7, rounded) — pas d'icon font custom embarquée. Pour la prod, brancher Lucide depuis le CDN ou le paquet.
- **Surcouche custom à dessiner** (opportunité signature) : ~15 concepts Nami (parcours, care team, adressage, casquette, délégation, RCP…) tracés avec le **motif "fil"**. L'icône **Le Fil** est déjà une onde cousue (`M3 12 C 7 6, 11 18, 15 12 S 19 6, 21 12`).
- **Emoji** : non. **Unicode** comme glyphes ponctuels (✕, ‹ ›, ⌘) toléré dans les contrôles.
- ⚠️ *Substitution signalée* : aucun jeu d'icônes propriétaire n'était fourni — Lucide est la base par défaut, à confirmer.

### Fontes
Plus Jakarta Sans, Inter, JetBrains Mono sont chargées via **Google Fonts** (cf. `@import` en tête de `colors_and_type.css`). ⚠️ *Si des fichiers de fontes propriétaires existent, les déposer dans `fonts/` et me les signaler pour mettre à jour l'`@import`.*

---

## Surfaces & invariants produit (à matérialiser visuellement)
- **Person-centric** : l'unité de navigation est le **parcours** (CareCase), pas le « patient global ».
- **Multi-parcours** : un patient = N parcours **isolés** (aucun leak visuel — exigence RGPD/HDS).
- **Multi-casquette** : une Person = N rôles ; CasquetteSwitcher lisible, registre visuel qui change patient↔cockpit.
- **Délégation** : `ActingAsBanner` permanent (« Vous agissez pour le compte de… »).
- **specialtyView** : vitrine, pas stock — on met en avant par métier, **tout reste à 1 clic**.
- **Empty-states** : chaleureux, orientés action, jamais culpabilisants (la prod est vide au lancement).
- **Architecture cockpit** : repliée à **5 destinations** (Le Fil · Personnes · Agenda · Coordination · Savoir) + **⌘K** comme colonne vertébrale ; le reste vit dans le dossier ou à une frappe.

---

*Pense à régler le type de fichier sur « Design System » dans le menu Partage pour que ton équipe puisse le consulter.*
