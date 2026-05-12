/**
 * Tests unitaires pour ragContentCleanup.
 *
 * Runner : node:test (built-in Node 22+, sans dépendance).
 * Exécution : npx tsx --test src/lib/__tests__/ragContentCleanup.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanRagContent,
  hasSlideMarkers,
  splitSlides,
} from "../ragContentCleanup";

// ── hasSlideMarkers ─────────────────────────────────────────────────────

test("hasSlideMarkers détecte '--- Slide 1 ---'", () => {
  assert.equal(hasSlideMarkers("--- Slide 1 ---\nAnorexie"), true);
});

test("hasSlideMarkers détecte '--- Slide 23 ---'", () => {
  assert.equal(hasSlideMarkers("intro\n--- Slide 23 ---\ndétails"), true);
});

test("hasSlideMarkers ignore 'Slide 1' sans tirets", () => {
  assert.equal(hasSlideMarkers("Slide 1\nAnorexie"), false);
});

test("hasSlideMarkers ignore '--- Slide ---' sans numéro", () => {
  assert.equal(hasSlideMarkers("--- Slide ---\ndétails"), false);
});

// ── splitSlides ─────────────────────────────────────────────────────────

test("splitSlides découpe 3 slides correctement", () => {
  const input = `--- Slide 1 ---
Anorexie
définition

--- Slide 2 ---
Boulimie
critères

--- Slide 3 ---
ARFID`;
  const blocks = splitSlides(input);
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].slideNumber, 1);
  assert.equal(blocks[0].title, "Anorexie");
  assert.equal(blocks[1].slideNumber, 2);
  assert.equal(blocks[1].title, "Boulimie");
  assert.equal(blocks[2].slideNumber, 3);
  assert.equal(blocks[2].title, "ARFID");
});

test("splitSlides extrait le titre si présent et laisse le body", () => {
  const input = `--- Slide 5 ---
Complications médicales
- Cytolyse
- Bradycardie`;
  const blocks = splitSlides(input);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].slideNumber, 5);
  assert.equal(blocks[0].title, "Complications médicales");
  assert.match(blocks[0].content, /Cytolyse/);
  assert.match(blocks[0].content, /Bradycardie/);
});

test("splitSlides ignore le contenu avant le premier marqueur", () => {
  const input = `intro à ignorer
--- Slide 1 ---
Titre`;
  const blocks = splitSlides(input);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].title, "Titre");
});

// ── cleanRagContent — M1 puce "9" Wingdings ─────────────────────────────

test("cleanRagContent strip puce '9' avec espace → '• '", () => {
  const result = cleanRagContent("9 Mort subite\nautre ligne");
  assert.equal(result, "• Mort subite\nautre ligne");
});

test("cleanRagContent strip puce '9' collée majuscule → '• '", () => {
  const result = cleanRagContent("9Mort subite\nautre ligne");
  assert.equal(result, "• Mort subite\nautre ligne");
});

test("cleanRagContent préserve '9. ' énumération markdown légitime", () => {
  const result = cleanRagContent("9. Premier point");
  assert.equal(result, "9. Premier point");
});

// ── cleanRagContent — M2 puce "x" Symbols ───────────────────────────────

test("cleanRagContent strip puce 'x' collée majuscule → '• '", () => {
  const result = cleanRagContent("xCytolyse hépatique\n");
  assert.equal(result, "• Cytolyse hépatique\n");
});

test("cleanRagContent préserve 'x-rays' (mot avec tiret)", () => {
  const result = cleanRagContent("x-rays montrent");
  assert.equal(result, "x-rays montrent");
});

// ── cleanRagContent — M4 puces unicode ──────────────────────────────────

test("cleanRagContent strip puce unicode '■' en début → '• '", () => {
  const result = cleanRagContent("■ Critère 1\n▪ Critère 2");
  assert.equal(result, "• Critère 1\n• Critère 2");
});

test("cleanRagContent strip puce unicode '●' en milieu → vide", () => {
  const result = cleanRagContent("texte ● avec puce");
  assert.equal(result, "texte  avec puce");
});

// ── cleanRagContent — M8 sauts de ligne / mid-phrase ───────────────────

test("cleanRagContent recolle '\\n/' rupture parenthèse", () => {
  const result = cleanRagContent("(critère\n/ DSM-5)");
  assert.equal(result, "(critère / DSM-5)");
});

// ── cleanRagContent — idempotence ───────────────────────────────────────

test("cleanRagContent est idempotent", () => {
  const input = "9Mort subite\nxCytolyse\n■ Bradycardie\n(critère\n/ DSM-5)";
  const once = cleanRagContent(input);
  const twice = cleanRagContent(once);
  assert.equal(twice, once);
});

// ── cleanRagContent — non-régression M6 / M7 (faux positifs préservés) ─

test("cleanRagContent préserve 'SantonicolaA' (nom propre, pas implémenté M6)", () => {
  const result = cleanRagContent("auteur SantonicolaA dans la revue");
  assert.equal(result, "auteur SantonicolaA dans la revue");
});

test("cleanRagContent préserve 'anorexianervosa' (mot collé, pas implémenté M6)", () => {
  const result = cleanRagContent("le terme anorexianervosa apparaît");
  assert.equal(result, "le terme anorexianervosa apparaît");
});

test("cleanRagContent préserve citation 'Dec12;11(12):3038' (pas implémenté M7)", () => {
  const result = cleanRagContent("Nature Dec12;11(12):3038");
  assert.equal(result, "Nature Dec12;11(12):3038");
});
