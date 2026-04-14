# NAMI WEB — Contexte frontend pour Claude Code
> Repo frontend uniquement. Ne pas modifier sans validation de Margot.

---

## Vision produit

Nami est le système nerveux du parcours de soins complexes.
Les soignants sont excellents dans leur silo. Le problème : l'information ne circule pas entre silos. Le patient devient coordinateur de son propre parcours. Nami transfère cette charge vers les professionnels.

**Positionnement** : infrastructure d'orchestration multi-spécialités — pas un logiciel médical, pas un CRM santé.  
**Wedge** : obésité, TCA, nutrition pluridisciplinaire.  
**Cas fondateur** : Gabrielle, 10 ans, anorexie + harcèlement scolaire. Médecin + psy + diét. Parents coordinateurs par SMS. 4 mois perdus. Défaut d'orchestration, pas de compétence.  
**Fondatrice** : Margot Vire, diététicienne spécialisée TCA, première utilisatrice.

---

## Stack & Infrastructure

| Élément | Valeur |
|---------|--------|
| Framework | Next.js 16 + React 19 (App Router) |
| State | TanStack Query v5 + Zustand |
| CSS | Tailwind 4 + CSS variables |
| Fonts | Plus Jakarta Sans (UI) + Inter (data/labels) |
| Animations | ScrollReveal (nouvelles pages) + Framer Motion (cockpit existant) |
| Backend | `nami-production-f268.up.railway.app` |
| Deploy | Vercel auto-deploy sur push `main` |
| GitHub | `Margotvire2/nami-web` |

**Local dev** : `npm run dev` → port 3001  
**Build prod** : `npm run build`  
**TypeScript check** : `./node_modules/.bin/tsc -p tsconfig.json --noEmit`

---

## Design System — Medical 2026

### Palette (CSS variables dans `globals.css`)
```
Primary      : #5B4EC4  (violet Nami)
Primary light: rgba(91,78,196,0.08)
Teal accent  : #2BA89C
Background   : #FAFAF8
Dark sections: #1A1A2E
Text         : #1A1A2E  (dark) / #8A8A96 (soft)
Border       : rgba(26,26,46,0.08)
Card bg      : #FFFFFF  border: #E8ECF4
```

### Severity (désaturée, jamais criard)
```
Critical : #DC2626  bg #FEF2F2  border #FECACA
High     : #D97706  bg #FFFBEB  border #FDE68A
Info     : #2563EB  bg #EFF6FF  border #BFDBFE
Success  : #059669  bg #F0FDF4  border #BBF7D0
```

### Composants
- Cards : `rounded-xl`, shadow subtile, hover lift + border violet
- CSS classes : `.nami-card`, `.nami-card-interactive`, `.nami-pillar-card`, `.nami-patient-card`, `.nami-stagger-item`
- Hover cards : `box-shadow 0 4px 16px rgba(91,78,196,0.10)` + `translateY(-1px)`
- Animations : `ScrollReveal` (fade-up/left/right/scale/blur) + `AnimatedCounter`

### ❌ Ne jamais utiliser
- Couleurs hardcodées hors composants locaux (utiliser CSS variables)
- `#4F46E5` ou `#0F766E` (anciennes palettes)
- `#F0F2FA` comme fond (utiliser `#FAFAF8`)

---

## Règles absolues

```
1. Lire les fichiers existants ENTIÈREMENT avant toute modification
2. Ne jamais réécrire une page entière — Edit, pas Write sur fichier existant
3. Ajouter uniquement ce qui manque — ne pas écraser
4. ./node_modules/.bin/tsc -p tsconfig.json --noEmit AVANT et APRÈS → 0 erreur
5. "use client" obligatoire si : useState, useEffect, event handlers, hooks
6. export const metadata → Server Component uniquement (incompatible avec "use client")
7. Event handlers (onMouseOver, onClick inline) → interdit dans Server Components
8. CATEGORY_LABELS (et tout Record de labels) doit être exhaustif par rapport aux union types
9. Jamais de secrets dans le code (clés API, JWT)
10. Toute feature doit renforcer : Coordination, Visibilité clinique, Passage de relais, ou Pilotage longitudinal
```

---

## Wording légal — conforme MDR/DM

| ❌ Interdit | ✅ Autorisé |
|------------|------------|
| Alerte clinique | Indicateur de complétude |
| Surveiller / Monitoring | Centraliser / Organiser |
| Détecter | Observer / Noter |
| Risque clinique | Complétude du dossier |
| Anormal | À vérifier |
| Scoring automatique | Feedback soignant |
| Surveillance | Cadences de suivi |

**Disclaimers obligatoires :**
- Footer public : "Nami n'est pas un dispositif médical. En cas d'urgence, appelez le 15 ou le 112."
- Messagerie patient : bannière permanente urgences 15/112
- Messagerie pro : "Cette messagerie est réservée à la coordination entre professionnels."
- Toute sortie IA : label "Brouillon — à valider par le soignant"

---

## Architecture pages

### Espace public (`/`)
```
/                    → Landing page (SSG, "use client")
/pathologies         → Liste pathologies (Server Component)
/pathologies/[slug]  → Fiche détail (SSG, generateStaticParams)
/trouver-un-soignant → Annuaire public
/blog                → Liste articles
/blog/[slug]         → Article
/login               → Connexion
/signup              → Inscription soignant
/invite/[token]      → Rejoindre une care team
/cgu /confidentialite /mentions-legales → Légal
```

### Cockpit soignant (`/(cockpit)/`)
```
/aujourd-hui         → Dashboard principal (Framer Motion, 2/3 + 1/3)
/patients            → Liste patients (grid cards + table)
/patients/[id]       → Dossier patient V2
/agenda              → Agenda plein écran
/messages            → Messagerie coordination (2 colonnes)
/documents           → Documents
/equipe              → Réseau soignant (RPPS)
/adressages          → Adressages
/facturation         → Facturation SESAM-Vitale
/intelligence        → Base de connaissances RAG
/protocoles          → Protocoles HAS
/taches              → Tâches cross-dossiers
/reglages            → Paramètres
```

### Espace patient (`/(patient)/`)
```
/accueil             → Dashboard patient
/rendez-vous         → Mes RDV (maxWidth 720px)
/mes-documents       → Mes documents (maxWidth 720px)
/mes-messages        → Messagerie + disclaimer urgences
/mon-compte          → Profil
```

---

## Comptes de démonstration

```
Soignant (Margot Vire — diététicienne fondatrice) :
  email    : margot.vire@namihealth.com
  password : Demo2024!

Patient démo :
  email    : lea.rousseau@patient.com
  password : Patient2024!
```

---

## Conventions frontend

### Server vs Client Components
- Par défaut : Server Component (pas de "use client")
- Ajouter "use client" si : hooks React, event handlers, localStorage, window
- `export const metadata` → seulement dans Server Components
- Hover effects en Server Component → CSS classes uniquement (`.nami-pillar-card:hover`)

### Data fetching
- Cockpit : TanStack Query (`useQuery`, `useMutation`)
- Pages publiques statiques : `generateStaticParams` + `fetch` direct
- Auth : `useAuthStore` (Zustand) → `accessToken` → `apiWithToken(token)`

### Animations
- Nouvelles pages : `ScrollReveal` (`src/components/ui/ScrollReveal.tsx`)
- Compteurs animés : `AnimatedCounter` (`src/components/ui/AnimatedCounter.tsx`)
- Cockpit existant : Framer Motion (ne pas mélanger dans un même fichier)
- Stagger CSS pur : classe `.nami-stagger-item` + `animationDelay: \`${idx * 0.05}s\``

### Déploiement Vercel
- Chaque push sur `main` → build auto + déploiement
- Pas besoin de redéployer manuellement (sauf changement de variables d'env sans push)
- Build fail → le commit suivant corrigé suffit (Vercel prend le snapshot complet du code)

---

## Anti-patterns interdits

```
❌ Write sur un fichier existant sans Read d'abord
❌ Event handlers dans un Server Component (onMouseOver, onMouseEnter...)
❌ "use client" sur une page qui exporte metadata
❌ Couleur hardcodée #4F46E5 (ancienne) ou #0F766E (teal patient)
❌ Record de labels incomplet par rapport au union type TypeScript
❌ Modifier 5 fichiers quand 1 suffit
❌ Dire "livré" sans vérification tsc
❌ Mots interdits MDR dans l'UI (voir tableau wording)
❌ Messagerie sans disclaimer urgences
```

---

## Format de réponse obligatoire

```
### DIAGNOSTIC
- Fichier(s) concerné(s) : [path:ligne]
- PROBLÈME : "[maillon cassé précis]"

### FIX
- Fichier : [un seul si possible]
- Ligne : [avant → après]
- Raison : [pourquoi ça fixe]

### PREUVE
- tsc : 0 erreur

### EFFETS DE BORD
- Aucun / Liste
```
