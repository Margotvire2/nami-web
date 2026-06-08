---
name: nami-design
description: Use this skill to generate well-branded interfaces and assets for Nami (« Le soin est fragmenté. Nami le coud. »), a care-coordination platform for complex pathways (TCA, obesity, pediatrics, nutrition). Use for production code or throwaway prototypes/mocks. Contains design tokens, colors, type, fonts, component CSS, the "fil" signature, MDR-safe copy rules, and UI exemplars.
user-invocable: true
---

# Nami design skill

Read **`README.md`** first — it holds the doctrine (the "couture vivante" thesis, content/tone rules incl. the **MDR lexicon**, visual foundations, iconography, product invariants). Then explore:

- **`colors_and_type.css`** — design tokens v2 (CSS custom properties: colors, type, spacing, radii, shadows, motion, woven matter). Single source of truth. Includes a React Native theme mapping at the bottom.
- **`components.css`** — reusable atomic classes (btn, card, input, chip, tag, badge-ia, the fil, lab rows, acting banner, tabs, empty-state).
- **`preview/`** — design-system reference cards (colors, type, spacing, components, brand).
- **Hi-fi exemplars** at the project root (`Nami Cockpit — Le Fil (hi-fi).html`, `Nami Agenda — *.html`, `Nami Dossier patient (hi-fi).html`) — read these to see the tokens & the fil in real screens.

## How to use
- **Production code** — import `colors_and_type.css` then `components.css` (or paste the `:root` block into your Tailwind v4 `@theme` / globals; for RN copy the theme mapping). Re-skin the existing shadcn base-nova on these tokens. Never hardcode hex — use the vars.
- **Prototypes / mocks / slides** — copy the two CSS files + any `preview/` or hi-fi exemplar, and build static HTML.

## Non-negotiables (read README §MDR before writing any copy)
1. **MDR lexicon** — Nami is a coordination *channel*, **not** a medical device. Never: alerte, surveillance, détecter, scoring/score, diagnostic, recommander. Prefer: coordonner, centraliser, structurer, complétude, documenter. Every AI output carries **« Brouillon IA — à vérifier »** + human validation. Legal footer always: *Outil de coordination · Non dispositif médical · Conforme RGPD.*
2. **The fil** — the violet→teal gradient is reserved for the fil and the pivot word; never spread it elsewhere. Motion must relie/guide/confirme, never decorate. Easing `cubic-bezier(.16,1,.3,1)`.
3. **Warmth + matter, not glass** — warm neutrals, mat surfaces, the woven `--weft` background; the fil is the only "light". No glassmorphism, no ambient orbs, no dark-by-default.
4. **Person-centric** — navigate by *parcours* (isolated), not by global patient. Materialize multi-parcours / multi-casquette / délégation (ActingAsBanner). Empty-states warm, never guilt-tripping.

If invoked with no guidance, ask what to build, ask a few questions, and act as an expert Nami designer — output HTML artifacts or production code per the need.
