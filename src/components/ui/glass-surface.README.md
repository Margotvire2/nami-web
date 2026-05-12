# GlassSurface — Liquid Glass × Nami

Composant + utilities Tailwind v4 pour appliquer le design Liquid Glass au cockpit Nami.

## Règle d'or

**Glass pour l'ambiance et la navigation. Solid pour la donnée clinique.**

- ✅ Glass : sidebar, filtres, cards de scan, sheets, overlays, command palette
- ❌ Solid obligatoire : pills priorité, badges statut, indicateurs consentement, chiffres cliniques (IMC, FC, glycémie, doses)

## Architecture

| Concept | Emplacement |
|---|---|
| Tokens (`@theme`) | `src/app/globals.css` (bloc `@theme inline`) |
| Utilities (`@utility`) | `src/app/globals.css` (en fin de fichier) |
| Composant React | `src/components/ui/glass-surface.tsx` |

## Variantes

| Variante | Blur | Saturate | Usage |
|---|---|---|---|
| `glass-soft` | 20px | 1.6 | Cards de liste, chips, ghost buttons |
| `glass-medium` | 28px | 1.8 | Sidebar, barres filtres, navigation |
| `glass-strong` | 44px | 2.0 | Sheets, modals, command palette |
| `glass-backdrop` | 6px | — | Overlay derrière un sheet/modal (assombrissement léger) |

## Usage

### Tailwind utility (cas simple, 80% des usages)

```tsx
<div className="glass-soft rounded-2xl p-4">
  Card simple sans highlight
</div>
```

### Composant React (cas complexe avec highlight, 20%)

```tsx
<GlassSurface variant="strong" withHighlight className="rounded-3xl p-6">
  <h2>Sheet de détail</h2>
  <p>Avec gradient spéculaire haut + z-index enfants géré</p>
</GlassSurface>
```

Le `withHighlight` active le gradient blanc translucide sur le tiers supérieur de la surface. À utiliser uniquement sur sheets/modals/palettes plein écran, **jamais sur cards de liste** (surcharge visuelle).

## À ne JAMAIS faire

- ❌ Mettre du glass sur des données cliniques (statut, priorité, consentement, chiffres IMC/FC/glycémie)
- ❌ Empiler 3+ niveaux de glass dans le même rendu (perf catastrophique, surtout Safari)
- ❌ Utiliser `glass-strong` sur >5 éléments dans le même viewport
- ❌ Mélanger `glass-*` et `bg-white/X backdrop-blur-X` en inline (cohérence cassée)
- ❌ Ajouter un nouveau niveau (`glass-extra-strong`, etc.) sans validation design

## Performance

`backdrop-filter` est coûteux sur Safari et Firefox. Règles :
- 1 surface `glass-strong` plein écran : OK
- 5-10 cards `glass-soft` : OK
- 20+ cards `glass-soft` simultanées : à mesurer, possible jank au scroll

Si jank détecté : virtualiser la liste (react-virtuoso) ou passer en `bg-white/95` (faux glass mais performant).
