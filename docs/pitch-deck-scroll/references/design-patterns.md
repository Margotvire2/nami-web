# Design Patterns — Page pitch scroll

## Principes généraux

La page `/pitch` n'est pas une landing page marketing. C'est un deck interactif.  
Chaque section doit pouvoir vivre seule — comme une slide qu'on pourrait extraire.

---

## Patterns par section

### HOOK (section 1)
```
- Fond : #1A1A2E (sombre)
- Texte hero : 52-64px, font-jakarta, font-extrabold, tracking -0.04em
- 1 phrase. Pas de sous-titre immédiat.
- Scroll indicator : petite flèche animée en bas (pulse)
- Pas de CTA ici — le CTA vient à la fin
```

### PATIENT / Histoire Gabrielle (section 2)
```
- Fond : blanc ou légèrement crème (#FAFAF8)
- Layout : 2 colonnes sur desktop — texte gauche, illustration droite
- Illustration : SVG ou image épurée (pas de photo stock médicale)
- Texte : voix narrative, présent ou passé récent, jamais impersonnel
- Quote de Gabrielle (ou des parents) si disponible — entre guillemets, italic
- Transition : fade-up au scroll
```

### PROBLÈME (section 3)
```
- Fond : #1A1A2E
- Stats en grand : 3 chiffres clés avec AnimatedCounter
  Exemple : "4 mois" · "3 soignants" · "0 outil commun"
- Source sous chaque stat (petite, opacity 0.4)
- Pas de bullet points — les chiffres parlent seuls
```

### SOLUTION (section 4)
```
- Fond : #FAFAF8
- Titre : "Ce que fait Nami" — simple, direct
- 3 piliers max avec icône + titre + 1 ligne
  Coordination | Visibilité | Passage de relais
- Pas de liste de features — des bénéfices soignants
```

### PRODUIT (section 5)
```
- Fond : blanc avec border subtile
- Screenshot du cockpit ou GIF de démo (pas de maquette Figma)
- Frame browser (optionnel) pour crédibilité
- Caption sous l'image : ce qu'on voit, pas ce que ça fait
- Sur mobile : screenshot portrait ou crop adapté
```

### TRACTION (section 6)
```
- Fond : #1A1A2E ou dégradé vers violet
- Métriques réelles uniquement — 3 max
- Format : grand chiffre + label + contexte
  "12 soignants actifs · pré-seed · 0 churn sur 60j"
- Si métriques faibles : les contextualiser ("alpha fermé, 12 early adopters choisis")
- Ne pas avoir de section traction vide — soit on met des vraies métriques, soit on fusionne avec Équipe
```

### MARCHÉ (section 7)
```
- Fond : #FAFAF8
- Diagramme simple : cercle concentrique ou entonnoir
  Wedge (TCA/obésité FR) → Nutrition pluri → Parcours complexes → Système de soins
- Chiffres : sourcer HAS, CNAM, DREES — jamais de "marché mondial de X milliards"
- 1 slide = 1 argument de taille de marché, pas 3
```

### MOAT (section 8)
```
- Fond : blanc
- 2-3 avantages défendables, formulés comme des barrières à l'entrée :
  "Le graphe de coordination devient propriétaire après 6 mois d'usage."
  "Margot est la seule fondatrice diét-TCA qui a construit cet outil."
- Pas de buzzwords ("IA propriétaire", "algorithme breveté")
```

### ÉQUIPE (section 9)
```
- Fond : #1A1A2E
- Photo Margot (professionnelle, naturelle)
- 2-3 lignes : rôle, expertise, why her
- Advisory / partenaires si pertinent
- Pas de logos d'écoles sauf si top-tier et pertinent
```

### ROADMAP (section 10)
```
- Fond : #FAFAF8
- Timeline horizontale : Construit | En cours | Avec le financement
- Uniquement ce qui est réaliste à 18 mois
- Mentions : HAP, HDS, appel obésité si avancé
```

### ASK (section 11)
```
- Fond : dégradé #1A1A2E → #1E1A3C
- Montant en grand
- 3 usages des fonds (pas plus)
- Milestone cible : "X soignants actifs / certification HDS / appel obésité gagné"
```

### CTA (section 12)
```
- Fond : violet Nami #5B4EC4 → dégradé vers teal #2BA89C
- 1 bouton principal : "Prendre un RDV" → Calendly ou email
- 1 lien secondaire : "Accéder à la démo" → /login ou /signup
- Pas de formulaire long
```

---

## CSS / Animation

```css
/* Chaque section */
.pitch-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 80px 24px;
}

/* Stats grandes */
.pitch-stat {
  font-family: var(--font-jakarta);
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 900;
  letter-spacing: -0.04em;
}

/* Scroll reveal : utiliser ScrollReveal avec delay stagger */
/* delay 0, 0.1, 0.2 entre les éléments d'une même section */
```

## Responsive

- Desktop : 2 colonnes pour sections produit/équipe
- Tablet : 1 colonne, padding réduit
- Mobile : stats centrées, images pleine largeur, font-size réduit (-20%)
- `max-width: 1100px; margin: 0 auto` sur tous les contenus

---

## Ce qu'il ne faut PAS faire

- ❌ Carousel / slider (le scroll est le rythme, pas les flèches)
- ❌ Vidéo en autoplay (trop lourd, bloque la lecture)
- ❌ Parallax agressif (distrait du contenu)
- ❌ Animations infinies en arrière-plan (annoying, brûle la batterie)
- ❌ Plus de 3 polices ou tailles de font
- ❌ Contenu >800px de largeur sur mobile
