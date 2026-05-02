# NAMI — Référence pages scroll publiques
> Généré le 29/04/2026 depuis lecture directe du code source.
> But : permettre à un nouveau Claude de recréer une page scroll cohérente avec l'existant.

---

## 1. ARCHITECTURE DES PAGES SCROLL

Les pages sont des **shells minimalistes** qui composent des sections depuis `@/components/pitch/`.

```
app/pitch/page.tsx           → 34 lignes, zéro CSS propre
app/decouvrir/page.tsx       → 116 lignes, quelques sections inline
app/demo-tca/page.tsx        → 13 lignes → DemoWalkthroughTCAClient.tsx (402 lignes)
```

### /pitch (VC) — structure complète
```tsx
<PitchHero variant="vc" />
<PitchProblem variant="vc" />
<PitchInsight />
<PitchStickyDemo />
<PitchArchitecture />
<PitchTraction />
<PitchMarket />
<PitchPricing variant="vc" />
<PitchFounder />
<PitchCTA variant="vc" />
```

### /decouvrir (hôpital) — structure complète
```tsx
<PitchHero variant="hospital" />
<PitchProblem variant="hospital" />
<HowItWorks />
<PitchStickyDemo />
<KnowledgeSearch />    {/* dans section #F5F3EF */}
<SecurityGrid />       {/* dans section #FAFAF8 */}
<PitchPricing variant="hospital" note="Tarif fondateur pour structures pilotes. Déploiement accompagné. Formation incluse." />
<PitchFounder variant="dark" />  {/* dans section #1A1A2E */}
<PitchCTA variant="hospital" embedded />
```

---

## 2. DESIGN TOKENS — VALEURS EXACTES

### Couleurs (toutes extraites du code réel)
```
Fond principal    : #FAFAF8   (crème chaud)
Fond alterné      : #F5F3EF   (sections gris-chaud)
Section sombre    : #1A1A2E   (max 2 par page — jamais #000)
Surface sombre    : #252540

Titres            : #1A1A2E
Corps             : #374151
Muted             : #6B7280   (WCAG AA 4.6:1)

Violet principal  : #5B4EC4
Teal              : #2BA89C
Gradient          : linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)

Cards bg          : #FFFFFF
Cards border      : rgba(26,26,46,0.08)   ou   rgba(26,26,46,0.06)
Divider sombre    : rgba(255,255,255,0.08)

Stats violet      : #5B4EC4
Stats teal        : #2BA89C
Stats bleu        : #2563EB
```

### Typographie
```
Font              : var(--font-jakarta)  →  Plus Jakarta Sans
Font data/labels  : Inter (rare, dans cockpit)

H1 hero           : clamp(2.2rem, 7.5vw, 5.8rem)
                    fontWeight: 800
                    letterSpacing: "-0.04em"
                    lineHeight: 1.08

H2 section        : clamp(2rem, 5vw, 3.8rem)
                    fontWeight: 800
                    letterSpacing: "-0.03em"
                    lineHeight: 1.1

H2 citation       : clamp(1.6rem, 4vw, 3rem)
                    fontFamily: "Georgia, 'Times New Roman', serif"
                    fontStyle: "italic"

Eyebrow           : fontSize: 11, fontWeight: 800, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "#5B4EC4"

Body              : fontSize: 16, lineHeight: 1.6, color: "#374151"
Subtitle hero     : clamp(14px, 1.8vw, 18px), lineHeight: 1.65

Stats géantes     : clamp(3.5rem, 7vw, 6rem), fontWeight: 800, letterSpacing: "-0.04em"
Stats label       : fontSize: 14, color: "#374151", fontWeight: 500
Stats source      : fontSize: 11, color: "#6B7280", fontStyle: "italic"

Caption bottom    : fontSize: 12, color: "#6B7280"
Légal footer      : fontSize: 11, color: "#6B7280"
```

### Spacing & Layout
```
Section padding   : padding: "80px clamp(24px, 5vw, 80px)"
Content max-width : maxWidth: 1100  (sections)  ou  1200  (hero)
                    margin: "0 auto", width: "100%"

Section min-height: minHeight: "100vh"   (sections principales)
                    minHeight: "80vh"    (sections secondaires)

Stats grid        : gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32
Divider           : height: 1, background: "rgba(255,255,255,0.08)", margin: "56px 0"
```

### Boutons CTA
```tsx
// CTA primaire — pill violet
padding: "14px 30px"
borderRadius: 100
background: "#5B4EC4"
color: "#fff"
fontSize: 15
fontWeight: 700
boxShadow: "0 4px 20px rgba(91,78,196,0.30)"
minHeight: 48

// CTA secondaire / lien discret
fontSize: 14
color: "#6B7280"
textDecoration: "none"
minHeight: 44
display: "inline-flex", alignItems: "center"
```

### Browser mockup frame
```tsx
borderRadius: 16
overflow: "hidden"
boxShadow: "0 40px 100px rgba(26,26,46,0.16), 0 8px 24px rgba(26,26,46,0.08)"
border: "1px solid rgba(26,26,46,0.08)"
background: "#fff"

// Browser bar
background: "#F1F3F5"
padding: "9px 14px"
// dots macOS : "#FF6058", "#FFBC2E", "#29CA41"  (10px chacun)
// URL bar : "app.namipourlavie.com" ou "app.namipourlavie.com/patients/gabriel"

// Card légère
boxShadow: "0 24px 64px rgba(26,26,46,0.14), 0 4px 12px rgba(26,26,46,0.06)"
```

---

## 3. ANIMATIONS — CODE RÉEL

### Easing universel
```
cubic-bezier(0.16, 1, 0.3, 1)   ← utilisé PARTOUT, sur tout
```

### ScrollReveal (`src/components/ui/ScrollReveal.tsx`)
```tsx
// 5 variants :
"fade-up"    → translateY(40px)→0
"fade-left"  → translateX(-50px)→0
"fade-right" → translateX(50px)→0
"fade-scale" → scale(0.92)→1
"fade-blur"  → blur(8px) + translateY(20px)→0

// Usage
<ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
  {children}
</ScrollReveal>

// Internals : IntersectionObserver threshold: 0.1
// Hook : src/hooks/useScrollReveal.ts  → { ref, isVisible }
// willChange: "opacity, transform"
```

### WordByWordTitle (`src/components/pitch/WordByWordTitle.tsx`)
```tsx
// Chaque mot : opacity 0→1, translateY(24px)→0, scale(0.95)→1
// Stagger : initialDelay=100ms + wordDelay=80ms * index
// Gradient optionnel sur mots ciblés : gradientWords prop
// Trigger : IntersectionObserver threshold 0.1 (une seule fois)
// Easing : cubic-bezier(0.16,1,0.3,1) sur 0.55s

<WordByWordTitle
  lines={["Ligne un", "Ligne deux"]}
  gradientWords={["deux"]}
  initialDelay={100}
  wordDelay={80}
/>
```

### Hero — animation d'entrée séquentielle (inline dans PitchHero)
```tsx
const [visible, setVisible] = useState(false)
useEffect(() => {
  const timer = setTimeout(() => setVisible(true), 80)
  return () => clearTimeout(timer)
}, [])

// Délais par élément :
// Eyebrow      : 0ms
// H1 mots     : 80 + wordIdx*80 ms
// Subtitle    : 600ms
// CTAs        : 760ms
// Footer note : 900ms
// Mockup      : 500ms (opacity + translateY(40px)→0, 0.8s)

// Transition mot H1 : 0.55s cubic-bezier(0.16,1,0.3,1)
// opacity 0→1, translateY(28px)→0, scale(0.96)→1
```

### Quote line-by-line (PitchProblem)
```tsx
// Chaque ligne : stagger 400ms
// Effect : opacity + blur(8px)→0 + translateY(20px)→0 + scale(0.98)→1
// Trigger : IntersectionObserver threshold 0.3
setTimeout(() => setLineVisible(prev => { next[idx] = true; return next }), idx * 400)
```

### PitchStickyDemo — scroll sticky 3 scènes
```tsx
// Container : height: "300vh"  (3x viewport = 3 scènes)
// Inner     : position: "sticky", top: 0, height: "100vh"
// Progress  : const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
// Scènes    : progress < 0.34 → 0 | < 0.67 → 1 | else → 2
// Transition: opacity + translateY(±16px), 0.55s cubic-bezier(0.16,1,0.3,1)
// Dots nav  : largeur 8px→28px animée, couleur selon scène active
// Mobile    : isMobile(768) → 3 scènes empilées statiques
```

### AmbientGlow (`src/components/pitch/AmbientGlow.tsx`)
```tsx
// Orbe violet : top: "-10%", left: "-5%", 580px, rgba(91,78,196,0.14), blur(80px)
//              animation nami-orb-drift-a 12s (translate ±30px)
// Orbe teal   : bottom: "-10%", right: "-5%", 420px, rgba(43,168,156,0.10), blur(70px)
//              animation nami-orb-drift-b 9s

// AmbientGlowCTA (sections CTA) : orbe centré 700px, rgba(91,78,196,0.18), blur(100px)
//                                  animation pulse 6s scale 1→1.12

// Usage sur sections sombres :
<section style={{ position: "relative" }}>
  <AmbientGlow intensity="medium" />   {/* position absolute, inset 0, zIndex 0 */}
  <div style={{ position: "relative", zIndex: 1 }}>contenu</div>
</section>
```

---

## 4. CONTENU — EXTRAITS RÉELS DU CODE

### PitchHero variant="vc"
```
eyebrow  : "SEED 2026 · VIRAGE AMBULATOIRE"
H1 ligne1: "L'hôpital a des couloirs."
H1 ligne2: "Les libéraux n'en ont pas."
gradient : "couloirs."
subtitle : "La France pousse les patients hors de l'hôpital. Mais le virage ambulatoire
            ne fonctionne que si 5 libéraux se coordonnent aussi bien qu'une équipe
            hospitalière. Aujourd'hui, ils n'ont aucun outil commun. Nami est ce couloir."
CTA1     : "Demander un meeting →"   → mailto:contact@namipourlavie.com
CTA2     : "contact@namipourlavie.com"
footer   : "Conforme RGPD · Art. L.1110-12 CSP · Hors DM au sens du règlement (UE) 2017/745"
```

### PitchHero variant="hospital"
```
eyebrow  : "PARCOURS AMBULATOIRE COORDONNÉ"
H1 ligne1: "Vos patients sortent plus tôt."
H1 ligne2: "Le relais en ville, lui, est toujours cassé."
gradient : "cassé."
subtitle : "5 libéraux prennent le relais à la sortie. Aucun outil commun. Chacun travaille
            en silo. Nami crée le couloir ambulatoire — dossier partagé, synthèses IA
            traçables, coordination structurée."
CTA1     : "Demander une démo →"   → mailto:contact@namipourlavie.com
CTA2     : "Voir en 3 minutes ↓"   → #demo
footer   : "Conforme RGPD · Hébergement européen · Art. L.1110-12 CSP"
```

### PitchProblem stats variant="vc"
```
100 Md€  "dépensés chaque année en hospitalisation — que le virage ambulatoire veut réduire"
          Source : Comptes de la santé 2024   color: #5B4EC4
63 %     "d'informations perdues entre deux consultations en ville-hôpital"
          Source : Coord. ville-hôpital 2023  color: #2BA89C
5,2      "soignants en moyenne par parcours complexe sans outil commun"
          Source : Étude terrain 2025         color: #5B4EC4
```

### PitchProblem stats variant="hospital"
```
47 j     "de délai moyen entre détection et prise en charge"      Source : HAS 2023   color: #5B4EC4
63 %     "d'informations perdues entre deux consultations"         Source : HAS 2023   color: #2BA89C
8        "outils différents pour un seul patient (WhatsApp, email, Doctolib, fax...)"
          Source : Terrain 2025                                                        color: #5B4EC4
```

### Citations extraites
```
"Nami n'est pas un outil dans un marché existant.
 Nami est l'infrastructure qui crée le marché du parcours ambulatoire coordonné."

"Marc, 52 ans, obésité complexe — même problème.
 Léo, 8 ans, épilepsie — même problème.
 La pathologie change. Le défaut de coordination, jamais."
```

### Sections /decouvrir — headlines exactes
```
S5 eyebrow : "BASE DOCUMENTAIRE"
S5 H2      : "22 308 sources cliniques.\nUne seule recherche."
S5 body    : "Protocoles HAS, consensus internationaux, fiches parcours — tout structuré
              et consultable en quelques secondes."

S6 eyebrow : "CONFIANCE"
S6 H2      : "Construit pour le secret médical,\npas adapté après coup."
S6 body    : "La conformité n'est pas une case à cocher. C'est l'architecture de base."
```

### 3 pathologies démo (PitchStickyDemo)
```
{ label: "Anorexie — Gabrielle", color: "#5B4EC4" }
{ label: "Obésité — Marc",       color: "#2BA89C" }
{ label: "Épilepsie — Léo",      color: "#2563EB" }
```

### Caption sticky demo
```
"60 000+ sources cliniques indexées · 425 pathologies · 131 parcours structurés"
```

---

## 5. TEMPLATE — NOUVELLE PAGE SCROLL

```tsx
// app/pitch-[nom]/page.tsx
import type { Metadata } from "next"
import { PitchHero } from "@/components/pitch/PitchHero"
import { PitchStickyDemo } from "@/components/pitch/PitchStickyDemo"
import { PitchPricing } from "@/components/pitch/PitchPricing"
import { PitchFounder } from "@/components/pitch/PitchFounder"
import { PitchCTA } from "@/components/pitch/PitchCTA"
import { AmbientGlow } from "@/components/pitch/AmbientGlow"
import { ScrollReveal } from "@/components/ui/ScrollReveal"

export const metadata: Metadata = {
  title: "Nami — [Titre] · [Contexte]",
  description: "...",
  robots: { index: false, follow: false },
}

export default function PitchNomPage() {
  return (
    <div style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>

      {/* S1 — HERO */}
      <PitchHero variant="hospital" />  {/* ou "vc" */}

      {/* S2 — SECTION CUSTOM */}
      <section style={{
        background: "#F5F3EF",         // alterner #FAFAF8 / #F5F3EF / #1A1A2E
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "80px clamp(24px, 5vw, 80px)",
        position: "relative",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
          <ScrollReveal variant="fade-up" duration={0.7}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", marginBottom: 14 }}>
              EYEBROW
            </div>
            <h2 style={{
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#1A1A2E",
              lineHeight: 1.1,
              margin: "0 0 14px",
              fontFamily: "var(--font-jakarta)",
            }}>
              Titre de section.<br />
              <span style={{
                background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Mot en gradient.
              </span>
            </h2>
            <p style={{ fontSize: 16, color: "#374151", marginBottom: 48, maxWidth: 480, lineHeight: 1.6 }}>
              Corps de section.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.15} duration={0.7}>
            {/* Contenu : grid, mockup, stats... */}
          </ScrollReveal>
        </div>
      </section>

      {/* S3 — STICKY DEMO */}
      <PitchStickyDemo />

      {/* S4 — PRICING */}
      <PitchPricing variant="hospital" note="..." />

      {/* S5 — FONDATRICE + CTA (section sombre) */}
      <section style={{
        background: "#1A1A2E",
        padding: "80px clamp(24px, 5vw, 80px)",
        position: "relative",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <AmbientGlow />
          <div style={{ position: "relative", zIndex: 1 }}>
            <PitchFounder variant="dark" />
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "56px 0" }} />
            <PitchCTA variant="hospital" embedded />
          </div>
        </div>
      </section>

    </div>
  )
}
```

---

## 6. COMPOSANTS DISPONIBLES

| Composant | Props clés | Description |
|-----------|-----------|-------------|
| `PitchHero` | `variant: "vc" \| "hospital"` | Hero 100vh, word-by-word, mockup |
| `PitchProblem` | `variant: "vc" \| "hospital"` | Citation + 3 stats géantes AnimatedCounter |
| `PitchInsight` | — | Section insight (VC) |
| `PitchStickyDemo` | `caption?` | 300vh sticky scroll, 3 scènes (Gabrielle/Marc/Léo) |
| `PitchArchitecture` | — | 4 couches tech (vocabulaire VC) |
| `PitchTraction` | — | Traction & signaux commerciaux |
| `PitchMarket` | — | Taille marché |
| `PitchPricing` | `variant`, `note?` | 5 tiers pricing |
| `PitchFounder` | `variant?: "dark"` | Bio Margot + photo |
| `PitchCTA` | `variant`, `embedded?` | CTA final |
| `HowItWorks` | — | 3 étapes |
| `KnowledgeSearch` | — | Démo recherche KB interactive |
| `SecurityGrid` | — | Grille sécurité/conformité |
| `WordByWordTitle` | `lines[]`, `gradientWords[]`, `initialDelay?`, `wordDelay?` | Titre animé mot par mot |
| `AmbientGlow` | `intensity?: "low" \| "medium" \| "high"` | 2 orbes ambient (sombres) |
| `AmbientGlowCTA` | — | Orbe centré (sections CTA) |
| `ScrollReveal` | `variant?`, `delay?`, `duration?` | Wrapper animation scroll |
| `AnimatedCounter` | `target`, `suffix?`, `duration?` | Compteur animé |

### Hooks
```
src/hooks/useScrollReveal.ts    → { ref, isVisible }   IntersectionObserver
src/lib/hooks/useIsMobile.ts    → useIsMobile(768)      boolean
```

---

## 7. RÈGLES NON NÉGOCIABLES

```
✅ CSS transitions + IntersectionObserver + rAF — PAS Framer Motion sur pages publiques
✅ Fond #1A1A2E max 2 sections par page — jamais fond #000 dominant
✅ Mockups = composants React vivants (PatientScene, PitchMockup) — PAS d'images
✅ Responsive : mobile 390px, tablet 768px, desktop 1280px+
✅ robots: { index: false, follow: false } sur pitch/demo
✅ Footer légal : "Nami n'est pas un dispositif médical" sur toutes pages publiques

❌ "surveillance"           → ✅ "coordination"
❌ "alerte clinique"        → ✅ "indicateur de complétude"
❌ "détecter / prévenir"    → ✅ "centraliser / structurer"
❌ "continuité de prise en charge" → ✅ "continuité de coordination"
❌ "anormal"               → ✅ "à vérifier"
```
