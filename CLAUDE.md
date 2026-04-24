# NAMI — Règles pour Claude Code

## Identité du projet
Nami est une plateforme de coordination des parcours de soins complexes — le système nerveux du parcours de soin.
Deux interfaces : cockpit soignant (web + mobile) et espace patient (mobile + web).
Domaine : namipourlavie.com
Stack : Next.js App Router, TypeScript, Tailwind, Prisma, Supabase (eu-west-3), Railway

## Architecture technique — 4 couches
1. Référentiel médical vectorisé (22 308 entrées : HAS, DSM-5, FFAB, Orphanet, BDPM, ICD-11 — 116 000 relations cliniques typées avec grades de preuve)
2. Pipeline RAG hybride (vectoriel large → reranking pertinence → traversée automatique du graphe de connaissances)
3. Moteur de règles temps réel (exécuté sur chaque mise à jour du dossier — complétude, anomalies temporelles — chaque exécution loguée et auditable)
4. Framework d'évaluation automatique (5 métriques : couverture sources, taux hallucination, complétude, actionnabilité, cohérence)

## Pricing — 5 tiers
- GRATUIT (0€) : Agenda, prise de RDV, référencement annuaire 582K, messagerie patients, messagerie soignants, téléexpertise, réseau
- ESSENTIEL (19€/mois) : + Facturation non-médecin + Visio/téléconsultation (0% commission)
- COORDINATION (79€/mois) : + Adressage structuré + App patient (IA photos repas, transmission docs) + Dashboard flux financiers KPIs soignant
- INTELLIGENCE (149€/mois) : + Synthèses IA sourcées + Extraction bio auto + Base documentaire 22K + Moteur de complétude + App soignant mobile complète + Analytics financiers structures
- RÉSEAU (499€/mois + 79€/utilisateur) : + Configuration parcours complexes sur mesure + Vue pilote avancement + Multi-équipes + Parcours HAS + Dashboard KPIs structures financières + Admin & accès

## 3 pathologies de démonstration
- Gabrielle M., 16 ans — Anorexie mentale (psychiatre, diét, psy, MT, endocrino)
- Marc D., 52 ans — Obésité complexe PCR (endocrino, diét, psy, APA, MT)
- Léo R., 8 ans — Épilepsie pédiatrique (neuropédiatre, neuropsy, orthophoniste, enseignant, MT)

## Règles absolues

### Mots interdits (risque requalification DM / télésurveillance)
JAMAIS dans l'UI, le marketing, les CGU, le deck, ou les outputs IA :
- surveillance, monitoring, suivi longitudinal
- alerte clinique, alerte santé, signaux, vigilance
- drapeaux rouges, care gaps, scoring
- détecter, prévenir, sécuriser, réduire les risques
- continuité de prise en charge
- probable, recommander, à surveiller, non observance, anormal, danger, risque, urgence (outputs IA)

Remplacements safe : coordination, organisation, centraliser, structurer, documenter, faciliter, indicateur de complétude, notification organisationnelle, continuité de coordination, dossier de coordination, brouillon IA, synthèse structurée

### Wording légal obligatoire
- Dossier = "dossier de coordination" (JAMAIS "dossier médical")
- Résumé IA = badge "Brouillon IA — à vérifier" + bouton "Voir les sources"
- Indicateurs = tooltip "Indicateurs non cliniques destinés à l'organisation du dossier"
- Messagerie patient = bannière "En cas d'urgence vitale : 15 / 112" visible en permanence
- Footer toutes pages publiques = "Nami n'est pas un dispositif médical"

### Deux vocabulaires selon le contexte
- Page scroll publique / UI : "synthèses structurées", "indicateurs de complétude", "base documentaire", "coordination"
- Meeting VC / directeur médical : "moteur d'intelligence clinique", "taux d'hallucination mesuré", "graphe 116K relations", "pipeline RAG hybride"
Le vocabulaire technique sert en meeting. Les pages publiques utilisent le vocabulaire safe.

### Palette Nami
- Primaire : #5B4EC4 (violet doux)
- Secondaire : #2BA89C (teal)
- Fond principal : #FAFAF8 (crème chaud — PAS de noir dominant)
- Fond alterné : #F5F3EF
- Section sombre : #1A1A2E (max 2 par page, JAMAIS #000000)
- Surface sombre : #252540
- Texte : #1A1A2E (titres), #374151 (body), #6B7280 (muted — WCAG AA 4.6:1)
- Cards : #FFFFFF avec border rgba(26,26,46,0.06)
- Font : Plus Jakarta Sans
- Gradient text : linear-gradient(135deg, #5B4EC4, #2BA89C)

### Design — pages pitch/decouvrir
- Sections 100vh minimum sur les pages scroll (pitch, decouvrir)
- Titres géants : clamp(3rem, 8vw, 6rem) — ne pas être timide
- Animations : WordByWordTitle (80ms/mot), StickyScrollContainer (300vh, 3 scènes), AnimatedCounter, ScrollReveal
- Easing : cubic-bezier(0.16, 1, 0.3, 1) partout
- Hover cards : translateY(-6px) + shadow dramatique 0 20px 60px rgba(26,26,46,0.12)
- PAS de Framer Motion — CSS transitions + IntersectionObserver + requestAnimationFrame
- Mockups = composants React vivants (PAS des images)
- Ambient glow orbs sur les sections sombres
- Responsive obligatoire : mobile 390px, tablet 768px, desktop 1280px+

### Code
- TypeScript strict, 0 erreur TSC
- Check : /Users/margotvire/nami-web/node_modules/.bin/tsc -p /Users/margotvire/nami-web/tsconfig.json --noEmit
- Prisma migrations uniquement (JAMAIS db push en prod — risque sur index knowledge)
- router.refresh() au lieu de window.location.reload()
- Pas de texte hardcodé quand une variable existe
- Format de debug : DIAGNOSTIC → BROKEN LINK → FIX → PROOF

### Comptes démo
- margot.vire@namihealth.com / Demo2024! (soignante fondatrice)
- lea.rousseau@patient.com / Patient2024! (patient démo)

## Stack complète

| Élément | Valeur |
|---------|--------|
| Framework | Next.js 16 + React 19 (App Router) |
| State | TanStack Query v5 + Zustand |
| CSS | Tailwind 4 + CSS variables |
| Fonts | Plus Jakarta Sans (UI) + Inter (data/labels) |
| Animations | ScrollReveal + AnimatedCounter (nouvelles pages) · Framer Motion (cockpit existant) |
| Backend | nami-production-f268.up.railway.app |
| Deploy | Vercel auto-deploy sur push main |
| GitHub | Margotvire2/nami-web |

## Paysage concurrentiel
- Doctolib : 149€/mois pour agenda+RDV+messagerie. Nami offre tout ça GRATUITEMENT.
- Omnidoc : téléexpertise acte par acte. Pas de parcours continu.
- Paaco-Globule : coordination gratuite (financée ARS). UX très pauvre, adoption faible.
- Santélien : coordination MSP uniquement. Pas d'IA, pas de KB.
- Lifen : échange de documents. Tuyau sans intelligence.
Nami remplit la case vide : coordination pluridisciplinaire ville-hôpital + intelligence clinique intégrée.

## Architecture pages

### Espace public
/ → Landing | /pathologies → Liste | /pathologies/[slug] → Fiche | /trouver-un-soignant → Annuaire
/login /signup /invite/[token] | /cgu /confidentialite /mentions-legales
/pitch → Deck VC (non-indexé) | /decouvrir → Page hôpitaux (non-indexé)

### Cockpit soignant /(cockpit)/
/aujourd-hui /patients /patients/[id] /agenda /messages /documents
/equipe /adressages /facturation /intelligence /protocoles /taches /reglages

### Espace patient /(patient)/
/accueil /rendez-vous /mes-documents /mes-messages /mon-compte

## Skills de référence
- Avant de construire une page pitch ou investisseur : lire docs/pitch-deck-scroll/SKILL.md et ses references/
- Avant d'écrire du copy marketing ou UI : respecter les mots interdits ci-dessus
- Avant de toucher au design : palette Nami + proportions premium (sections 100vh, titres géants)
