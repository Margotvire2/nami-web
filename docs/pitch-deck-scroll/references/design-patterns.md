# Design Patterns — Pages Pitch Scroll

## Principe directeur
Pense Linear, Stripe, Vercel. Chaque scroll est un moment de conviction.
Les titres REMPLISSENT l'écran. Les espaces RESPIRENT. Les animations MARQUENT.

## Ce qui est timide (à NE PAS faire)
- Titres en text-3xl avec padding modeste → clamp(3rem, 8vw, 6rem) minimum
- Cards plates sans hover → translateY(-6px) + shadow dramatique sur chaque card
- Animations fade-up partout pareil → varier blur, scale, stagger, mot par mot
- Sections qui se ressemblent → alterner crème / alt / sombre / crème
- Mockup dans un petit cadre → les mockups DOMINENT leur section (80% largeur)
- Fond #000000 → utiliser #1A1A2E

## CSS Variables
```css
--nami-cream: #FAFAF8;
--nami-cream-alt: #F5F3EF;
--nami-deep: #1A1A2E;
--nami-deep-surface: #252540;
--nami-violet: #5B4EC4;
--nami-violet-light: #7B6FD4;
--nami-teal: #2BA89C;
--nami-glow-violet: rgba(91,78,196,0.15);
--nami-glow-teal: rgba(43,168,156,0.12);
```

## Typographie (ne pas être timide)
```css
.pitch-hero-title  { font-size: clamp(3rem, 8vw, 6rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; }
.pitch-section-title { font-size: clamp(2rem, 5vw, 4rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; }
.pitch-quote       { font-size: clamp(1.5rem, 3.5vw, 2.5rem); font-family: Georgia, serif; font-style: italic; line-height: 1.4; }
.pitch-stat        { font-size: clamp(3.5rem, 8vw, 7rem); font-weight: 800; letter-spacing: -0.04em; }
.pitch-eyebrow     { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
```

## Gradient text
```css
.pitch-gradient-text {
  background: linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## Animations par section

### Hero — Entrance dramatique
- Titre : mot par mot, 80ms entre chaque mot, fade-up + scale 0.95→1
- Sous-titre : fade-in 400ms après dernier mot
- Boutons : fade-in 200ms après
- Mockup : slide-up depuis bas, delay 600ms

### Citations (Problème, Insight) — Révélation progressive
- Chaque LIGNE : fade-blur (blur 8px→0 + opacity 0→1 + translateY 20px→0)
- 400ms de délai entre les lignes
- Easing : cubic-bezier(0.16, 1, 0.3, 1)

### Sticky Demo — Le moment wow (300vh)
- Section 300vh, sticky inner 100vh
- 3 scènes crossfade à 0→33%, 33→66%, 66→100% du scroll
- Courbe SVG : se dessine (stroke-dashoffset) à chaque activation de scène
- 3 dots indicator de scène active (pill animé)

### Architecture (fond sombre) — Revelation bas→haut
- Couches : stagger 200ms, fade-up + scale 0.96→1
- Ordre : couche 1 d'abord, puis 2, 3, 4
- Ambient glow : orbs flous qui dérivent lentement (animation 12s)

### Compteurs (Problème, Marché) — Impact maximal
- AnimatedCounter ease-out-quint 2.5s
- Taille : clamp(3.5rem, 8vw, 7rem)
- Couleurs alternées : violet / teal / violet

### Cards — Hover dramatique
```css
transition: transform 0.25s cubic-bezier(0.16,1,0.3,1),
            box-shadow 0.25s cubic-bezier(0.16,1,0.3,1),
            border-color 0.25s ease;
:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(26,26,46,0.12), 0 4px 16px rgba(91,78,196,0.08);
  border-color: rgba(91,78,196,0.25);
}
```

### Ambient Glow (sections sombres uniquement)
```css
@keyframes pitch-orb-drift {
  0%, 100% { transform: translate(0, 0); }
  33%       { transform: translate(40px, -30px); }
  66%       { transform: translate(-30px, 20px); }
}
.glow-orb {
  position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
  animation: pitch-orb-drift 12s ease-in-out infinite;
}
```

## Patterns par section

### S1 Hero — Fond crème, titre géant, mockup dominant
- Logo discret haut gauche
- 2 lignes de titre mot par mot, "système nerveux" en gradient
- Sous-titre : max-w 560px, 18px, muted
- 2 boutons : pill violet + lien email muted
- Mockup 85% largeur, ombre 0 40px 100px rgba(26,26,46,0.15)

### S2 Problème — Fond alt, citation + compteurs
- Citation GÉANTE centrée (serif, 60% hauteur), ligne par ligne
- 3 compteurs clamp(3.5rem, 8vw, 7rem) en colonnes
- Sources : 11px, muted, sous chaque compteur

### S3 Insight — Fond crème, espace blanc massif
- Citation seule au milieu
- Chaque ligne apparaît en fade-blur séquentiellement
- 2 paragraphes max après

### S4 Démo Sticky — 300vh, browser frame premium
- Mockup centré 85% largeur dans browser frame
- Ombre massive sur le frame
- 3 dots de scène indicator (pill animé)
- Contenu change au scroll

### S5 Architecture — Fond sombre, 4 couches empilées
- Background #1A1A2E + ambient glow (violet haut-gauche, teal bas-droite)
- 4 blocs : rgba(255,255,255,0.04), border rgba(255,255,255,0.08), radius 16
- Apparaissent en stagger 200ms du bas vers le haut

### S6 Traction — Fond crème, timeline premium
- Dots connectés avec ligne horizontale
- Cards avec border-left 4px colorée + hover lift
- Disclaimer honnête en muted en fin

### S7 Marché — Fond sombre, compteurs géants
- Same ambient glow
- 4 compteurs 7rem en grid
- Tailwinds en liste muted

### S8 Pricing — Fond alt, face-à-face nucléaire
- Doctolib : fond gris, "149€" barré, liste features simple
- Nami : fond blanc, border violet 2px, "0€" gradient GÉANT
- 5 tiers en grille sous le face-à-face

### S9 Fondatrice — Fond crème, split dramatique
- Cercle avatar 200px, gradient violet→teal, ombre
- Citation serif ~2rem
- "26 500 lignes. 10 jours. Seule." en petit muted

### S10 CTA — Fond sombre, ambient glow géant pulsant
- 1 titre, 1 sous-titre, 1 bouton blanc pill
- Bouton hover: glow-shadow violet + scale 1.02
- Disclaimer légal très muted
