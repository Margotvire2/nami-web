# Calendrier éditorial SEO/GEO Q3 2026 — Blog Nami

> **Période** : juillet, août, septembre 2026 (13 semaines)
> **Cadence** : 1 article par semaine
> **Mix** : 60 % patient (8 articles) — 40 % soignant (5 articles)
> **Cible géo** : France (mentions ARS, CPTS, libéral, secteur 1/2, territoires)
> **Statut** : 8 premiers articles rédigés dans `content/blog/` — les 5 suivants à produire en juillet/août.

---

## Cadre transverse

### Compliance YMYL santé
- Sources obligatoires : HAS, ANSM, Santé publique France, sociétés savantes (FFAB, ESPGHAN, SFP, SFE), PubMed peer-reviewed.
- Disclaimer en bas de chaque article : « Informatif, ne se substitue pas à un avis médical. Urgence : 15 ou 112. »
- Pas de promesse thérapeutique, pas de mention « diagnostic Nami » / « traitement Nami ».
- Wording MDR-safe (cf. CLAUDE.md backend, lexique interdit).

### Structure article 10/10
- Frontmatter complet (title, metaTitle ≤ 60 ch., metaDescription 150–160 ch., slug, audience, tags, keywords, sources, faqItems, publishedAt, authorName, reviewedBy).
- H1 + 8–12 H2/H3 hiérarchie sémantique.
- 1500–2500 mots.
- 5–8 sources réelles (URL HAS/ANSM/PubMed vérifiables).
- 3–5 maillages internes (autres articles, pages Nami : `/blog`, `/professions`, `/trouver-un-soignant`, `/clinique-pediatrique`, `/pathologies/...`).
- 1 CTA contextuel (patient → « Trouver un soignant », soignant → « Créer un compte »).
- FAQ 4–6 questions (alimente le schema FAQPage).
- Schema.org JSON-LD : `MedicalWebPage` + `BreadcrumbList` + `FAQPage` (déjà gérés côté rendering dans `src/app/blog/[slug]/page.tsx`).

### Conventions slug
- Tout en minuscules, séparé par tirets.
- Pas d'accents, pas de stop-words inutiles.
- Inclure le keyword principal en début de slug.

### Conventions auteur
- `authorName: "Équipe Nami"` par défaut.
- `reviewedBy` : nom du soignant relecteur (à compléter avant publication réelle).

---

## Calendrier Q3 2026

| # | Semaine | Date pub. | Slug | Audience | Keyword principal | Intent | Statut |
|---|---------|-----------|------|----------|-------------------|--------|--------|
| 1 | S27 | 2026-07-06 | `tca-adolescent-reconnaitre-signes-famille` | patient | reconnaître TCA adolescent signes | informationnel | ✅ rédigé |
| 2 | S28 | 2026-07-13 | `parcours-soins-coordonne-liberal-pluridisciplinaire` | soignant | parcours de soins coordonné libéral | informationnel | ✅ rédigé |
| 3 | S29 | 2026-07-20 | `ede-q-questionnaire-eating-disorder-examination` | soignant | EDE-Q questionnaire TCA | comparatif/outil | ✅ rédigé |
| 4 | S30 | 2026-07-27 | `mon-enfant-trouble-alimentaire-par-ou-commencer` | patient | mon enfant trouble alimentaire | informationnel/transactionnel | ✅ rédigé |
| 5 | S31 | 2026-08-03 | `rcp-liberale-reunion-concertation-pluridisciplinaire-ville` | soignant | RCP libérale ville | informationnel | ✅ rédigé |
| 6 | S32 | 2026-08-10 | `orthorexie-quand-le-sain-devient-pathologique` | patient | orthorexie symptômes | informationnel | ✅ rédigé |
| 7 | S33 | 2026-08-17 | `coordination-ville-hopital-pediatrie-best-practices-2026` | soignant | coordination ville-hôpital pédiatrie | informationnel | ✅ rédigé |
| 8 | S34 | 2026-08-24 | `micro-coaching-parental-tca-pediatriques` | patient | micro-coaching parental TCA | informationnel | ✅ rédigé |
| 9 | S35 | 2026-08-31 | `obesite-adolescent-suivi-pluridisciplinaire-parcours-has` | patient | obésité adolescent parcours | informationnel | 🟡 à rédiger |
| 10 | S36 | 2026-09-07 | `dieteticien-liberal-adressage-medecin-traitant-protocole` | soignant | adressage diététicien libéral | informationnel | 🟡 à rédiger |
| 11 | S37 | 2026-09-14 | `aplv-nourrisson-diagnostic-reintroduction-parents` | patient | APLV nourrisson reconnaître | informationnel | 🟡 à rédiger |
| 12 | S38 | 2026-09-21 | `cpts-comment-rejoindre-coordination-territoriale` | soignant | rejoindre CPTS libéral | informationnel | 🟡 à rédiger |
| 13 | S39 | 2026-09-28 | `puberte-precoce-fille-quand-consulter-endocrinologue` | patient | puberté précoce fille quand consulter | informationnel | 🟡 à rédiger |

---

## Détail des 13 articles

### Article 1 — TCA et adolescent : reconnaître les signes en famille
- **Persona** : parent d'adolescent (12–17 ans), inquiétude diffuse, recherche « ma fille mange plus rien que faire ».
- **Intent** : informationnel → orientation vers soignant.
- **Mots-clés longue traîne** : « reconnaître anorexie ado », « signes TCA fille adolescente », « comment savoir trouble alimentaire enfant ».
- **Outline H2** : (1) Pourquoi l'adolescence est une période-clé, (2) Les 7 signes à noter, (3) Ce qu'il ne faut **pas** dire, (4) Quand consulter et qui, (5) Le rôle de la famille dans le parcours, (6) FAQ.
- **Sources clés** : HAS RBP anorexie mentale (2010, mise à jour 2024), FFAB, INSERM, *Lancet Psychiatry* (épidémio post-COVID).
- **CTA** : « Trouver un soignant TCA près de chez vous » → `/trouver-un-soignant?specialty=tca`.

### Article 2 — Comment construire un parcours de soins coordonné en libéral ?
- **Persona** : médecin généraliste libéral, diététicienne libérale, psychiatre installé secteur 1/2.
- **Intent** : informationnel → conversion compte Nami.
- **Mots-clés** : « parcours coordonné libéral », « pluridisciplinarité ville sans hôpital », « adressage soignant libéral », « coordination CPTS ».
- **Outline H2** : (1) Le contexte 2026 (Loi Khattabi/Rist, virage ambulatoire), (2) Les 4 piliers d'un parcours coordonné, (3) Construire une équipe en 5 étapes, (4) Outils légaux (consentement, MSS, DMP, ENS), (5) Le piège du « WhatsApp clinique », (6) FAQ.
- **Sources clés** : HAS « Parcours de soins », Loi Khattabi 2024, CNOM, ANS (annuaire santé), R.4127-80 CSP.
- **CTA** : « Créer un compte soignant » → `/signup?role=provider`.

### Article 3 — L'EDE-Q en pratique : outil et interprétation
- **Persona** : psychologue, médecin nutritionniste, psychiatre TCA — junior à expérimenté.
- **Intent** : informationnel/outil (très intentionnel — niche).
- **Mots-clés** : « EDE-Q interprétation », « questionnaire eating disorder examination français », « cut-off EDE-Q », « 4 subscales EDE-Q ».
- **Outline H2** : (1) Présentation Fairburn 1994 et évolutions, (2) Les 4 subscales (restraint, eating concern, weight concern, shape concern), (3) Comment l'administrer (28 items, fenêtre 28 jours), (4) Interprétation cut-off (≥ 4 = pathologique), (5) EDE-Q vs SCOFF vs EAT-26, (6) Cas clinique commenté, (7) FAQ.
- **Sources clés** : Fairburn 1994 (PubMed), validation française Carrard et al. 2015, HAS, *International Journal of Eating Disorders*.
- **CTA** : « Découvrir les outils Nami pour TCA » → `/professions/dieteticiens`.

### Article 4 — Mon enfant a un trouble alimentaire : par où commencer ?
- **Persona** : parent paniqué, vient de comprendre, googlise frénétiquement.
- **Intent** : informationnel + transactionnel fort (besoin urgent).
- **Mots-clés** : « mon enfant ne mange plus », « par où commencer trouble alimentaire enfant », « parcours TCA enfant », « qui consulter TCA enfant ».
- **Outline H2** : (1) Première règle : ne rester seul·e, (2) Les 4 premiers pas (24h, 1 semaine, 1 mois), (3) Qui consulter (le bon ordre médecin → pédiatre → équipe), (4) Le rôle critique du médecin traitant, (5) Ce qu'il faut préparer pour la première consultation, (6) Le piège des cliniques privées non spécialisées, (7) FAQ.
- **Sources clés** : HAS RBP anorexie, FFAB annuaire spécialisé, Santé publique France, Académie nationale de médecine 2023.
- **CTA** : « Trouver un médecin spécialisé TCA enfant » → `/trouver-un-soignant?specialty=tca&pediatrique=1`.

### Article 5 — RCP libérale : comment l'organiser sans hospitalier ?
- **Persona** : médecin coordinateur CPTS, diététicienne MSP, psychiatre libéral.
- **Intent** : informationnel/processuel.
- **Mots-clés** : « RCP libérale », « réunion de concertation pluridisciplinaire ville », « RCP sans hôpital », « organiser RCP CPTS ».
- **Outline H2** : (1) Définition juridique (R.6123-89), (2) Pourquoi la RCP ville fait sens en 2026, (3) Les 4 prérequis (quorum, secret partagé, traçabilité, CR), (4) Étapes pratiques d'organisation, (5) Tarification (forfait coordination MSP, CCAM-DET-RCP), (6) Modèle de compte rendu, (7) FAQ.
- **Sources clés** : R.6123-89 CSP, HAS « Conditions de réalisation RCP » 2019, ARS Île-de-France, Avenant 9 médecins libéraux.
- **CTA** : « Organiser ma RCP avec Nami » → `/signup?role=provider`.

### Article 6 — L'orthorexie : quand le « sain » devient pathologique
- **Persona** : 25–45 ans urbain·e, lecteur·rice de sites bien-être, doute sur sa propre relation à l'alimentation.
- **Intent** : informationnel + auto-évaluation.
- **Mots-clés** : « orthorexie symptômes », « différence orthorexie anorexie », « test orthorexie », « obsession alimentation saine ».
- **Outline H2** : (1) Bratman 1997 — histoire du concept, (2) Statut nosographique (pas dans DSM-5-TR), (3) Les 5 signes à reconnaître, (4) Auto-test (ORTO-15 simplifié), (5) Pourquoi l'orthorexie n'est pas une « simple alimentation saine », (6) Quand consulter, (7) FAQ.
- **Sources clés** : Bratman 1997, ORTO-15 Donini 2005, FFAB position 2022, *Eating and Weight Disorders* (Springer).
- **CTA** : « Trouver un·e diététicien·ne formé·e aux TCA » → `/trouver-un-soignant?specialty=tca-dieteticien`.

### Article 7 — Coordination ville-hôpital en pédiatrie : best practices 2026
- **Persona** : pédiatre hospitalier, pédiatre libéral, médecin DIM, cadre santé.
- **Intent** : informationnel/expert.
- **Mots-clés** : « coordination ville hôpital pédiatrie », « DMP enfant », « parcours pédiatrique complexe », « adressage retour ville hôpital ».
- **Outline H2** : (1) Le constat 2026 (rapport ANS, virage ambulatoire pédiatrique), (2) Les 3 ruptures classiques (préadmission, sortie, suivi long), (3) DMP enfant + Mon espace santé : où on en est, (4) Les 4 leviers concrets (CR de sortie typé, alerte ville, RCP visio, micro-coaching), (5) Cas d'usage : Gabrielle (anorexie pédiatrique), (6) FAQ.
- **Sources clés** : ANS DMP 2025, HAS « Pertinence parcours », Académie nationale médecine 2024, SFP recommandations.
- **CTA** : « Découvrir Nami clinique pédiatrique » → `/clinique-pediatrique`.

### Article 8 — Le micro-coaching parental : un levier pour les TCA pédiatriques
- **Persona** : parent d'enfant pris en charge pour TCA, soignant TCA qui prescrit du suivi parental.
- **Intent** : informationnel + auto-coaching.
- **Mots-clés** : « micro-coaching parental TCA », « famille thérapeutique TCA enfant », « FBT family based treatment français », « aider mon enfant TCA quotidien ».
- **Outline H2** : (1) Pourquoi la famille est centrale (Maudsley/FBT), (2) Définition micro-coaching, (3) Les 5 micro-gestes du quotidien, (4) Ce qu'il ne faut pas dire (liste réelle), (5) Les rituels qui aident (repas, ressentis, soutien), (6) Quand la famille épuise — savoir passer la main, (7) FAQ.
- **Sources clés** : Lock & Le Grange (FBT manual), HAS, FFAB, *Eating Disorders Review*.
- **CTA** : « Trouver une équipe TCA pédiatrique » → `/trouver-un-soignant?specialty=tca&pediatrique=1`.

### Article 9 — Obésité adolescent : suivi pluridisciplinaire selon la HAS
- **Persona** : parent ado obèse, médecin généraliste, pédiatre libéral.
- **Intent** : informationnel + parcours.
- **Mots-clés** : « obésité adolescent HAS », « suivi pluridisciplinaire ado », « CSO centre spécialisé obésité », « parcours obésité enfant ».
- **Outline H2** : (1) RBP HAS 2025 sur l'obésité pédiatrique, (2) Les 3 niveaux de recours, (3) Le rôle de chaque soignant (généraliste, pédiatre, diététicien, APA, psy), (4) IMC IOTF — interpréter sans stigmatiser, (5) CSO et 269 structures (PNNS), (6) FAQ.
- **Sources clés** : HAS RBP obésité 2025, PNNS 2019-2023, Inserm 2023.

### Article 10 — Diététicien libéral : adressage par le médecin traitant, mode d'emploi
- **Persona** : diététicien libéral, médecin traitant.
- **Intent** : informationnel + outil.
- **Mots-clés** : « adressage diététicien libéral », « lettre adressage MT », « secret partagé diététicien », « facturation diététicien remboursement ».
- **Outline H2** : (1) Cadre légal R.4127-80 + L.1110-4, (2) Contenu d'une lettre d'adressage utile, (3) Codes CCAM/NABM diététique (état 2026), (4) Retour au MT — quel format ?, (5) Cas d'usage TCA, obésité, IRC.
- **Sources clés** : ANS, CNOM, Avenant 9, AFDN.

### Article 11 — APLV du nourrisson : diagnostic et réintroduction expliqués aux parents
- **Persona** : parents de bébé 0–12 mois suspect APLV.
- **Intent** : informationnel.
- **Mots-clés** : « APLV nourrisson symptômes », « test éviction réintroduction lait », « hydrolysat extensif bébé », « APLV diagnostic ».
- **Outline H2** : (1) Définition (IgE vs non-IgE), (2) Symptômes typiques, (3) Test d'éviction-réintroduction, (4) Hydrolysats : lesquels en France, (5) Suivi diététique, (6) Quand revoir un allergo, (7) FAQ.
- **Sources clés** : ESPGHAN 2024, HAS, GFHGNP, *Pediatric Allergy and Immunology*.

### Article 12 — Comment rejoindre une CPTS en libéral ?
- **Persona** : soignant libéral (toutes spécialités).
- **Intent** : informationnel/transactionnel.
- **Mots-clés** : « rejoindre CPTS libéral », « CPTS comment ça marche », « adhésion CPTS soignant », « rémunération CPTS ».
- **Outline H2** : (1) Définition CPTS post-Loi Rist, (2) Trouver sa CPTS (annuaire ARS), (3) Adhésion : formulaires et étapes, (4) Ce que ça change (rémunération, coordination), (5) Cas d'usage parcours complexe, (6) FAQ.
- **Sources clés** : ACI CPTS 2023, ANS, Fédération CPTS, ARS Île-de-France.

### Article 13 — Puberté précoce chez la fille : quand consulter un endocrinologue ?
- **Persona** : parents fille 6–10 ans avec signes précoces.
- **Intent** : informationnel.
- **Mots-clés** : « puberté précoce fille », « seins 7 ans », « quand consulter endocrinologue pédiatrique », « test LHRH ».
- **Outline H2** : (1) Définition (Tanner 2 avant 8 ans), (2) Causes (centrale vs périphérique), (3) Examens (radio âge osseux, IRM, LHRH), (4) Traitement (analogues GnRH), (5) Suivi pluridisciplinaire (endocrino, psy, diét), (6) FAQ.
- **Sources clés** : SFEDP, ESPE 2023, HAS, *Lancet Diabetes Endocrinology*.

---

## Maillage interne — règles

À chaque article :
- 1 lien vers la **landing dédiée** correspondant à la pathologie ou au métier (`/pathologies/<slug>` ou `/professions/<slug>`).
- 1 lien vers `/blog` ou un article voisin du calendrier (priorité au sujet **sœur** : article 1 ↔ article 4 ↔ article 8 ; article 2 ↔ article 5 ↔ article 7 ↔ article 10 ↔ article 12).
- 1 lien CTA produit (`/signup`, `/trouver-un-soignant`, `/clinique-pediatrique`).

## Géo signaux

Chaque article patient devrait au moins une fois nommer un repère territorial (« en Île-de-France », « en région Auvergne-Rhône-Alpes », « via votre CPTS locale », « contactez votre ARS de région »). Chaque article soignant doit mentionner au moins une institution publique (ARS, CPAM, CNOM, ANS, HAS) avec un lien sortant nofollow.

## Suivi des publications

| Sem. | Action | Responsable |
|------|--------|-------------|
| Avant publication | Relecture soignant pour articles cliniques | Margot + relecteur soignant |
| Publication | `status: PUBLISHED` + `publishedAt` figé | Backend cron / admin |
| Semaine +1 | Indexation Google Search Console manuelle | Margot |
| Mois +1 | Audit positionnement keyword principal | SEO référent |
| Trimestre +1 | Mise à jour si recommandations HAS modifiées | Équipe Nami |

---

**Dernière mise à jour** : 2026-06-04 — Branche `content/seo-articles-batch-2026-06-04`.
