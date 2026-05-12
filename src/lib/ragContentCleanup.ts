/**
 * ragContentCleanup — preprocess universel pour le contenu RAG affiché en cockpit.
 *
 * Pure function, 0 dépendance externe.
 *
 * Cible les artefacts d'extraction document (PowerPoint, PDF, OCR) qui
 * polluent le rendu markdown générique :
 *   M1 puce "9" (Wingdings) en début de ligne   → "• "
 *   M2 puce "x" (Symbols)   en début de ligne   → "• "
 *   M4 puces unicode "■▪▫●◦"                     → "• " en début, vide ailleurs
 *   M5 marqueurs "--- Slide N ---"               → préservés (utilisés par splitSlides)
 *   M8 sauts de ligne "\n/" mid-phrase           → recollés
 *
 * NON traités (faux positifs trop coûteux) :
 *   M3 puce "n"            : "n=", noms propres
 *   M6 mots collés         : "SantonicolaA" (nom propre), pas de dictionnaire
 *   M7 citations "Dec12;11(12):3038" : trop niche
 *   M9 sauts mid-phrase    : casse listes légitimes
 */

export interface CleanOptions {
  stripPptBullets?: boolean;  // default true
  fixLineBreaks?: boolean;    // default true
}

export interface SlideBlock {
  slideNumber: number;
  title?: string;
  content: string;
}

const SLIDE_MARKER = /^--- Slide \d+ ---$/m;
const SLIDE_SPLIT = /^--- Slide \d+ ---$/gm;

/**
 * Renvoie true si le contenu contient au moins un marqueur "--- Slide N ---".
 * Détection basée sur le contenu, pas sur le slug source — robuste à toute
 * source d'ingestion (FFAB, PPT générique, etc.).
 */
export function hasSlideMarkers(content: string): boolean {
  return SLIDE_MARKER.test(content);
}

/**
 * Découpe un contenu en blocs de slide. À utiliser seulement si
 * hasSlideMarkers() retourne true.
 *
 * Convention :
 *   - Le numéro de slide est extrait depuis le marqueur "--- Slide N ---"
 *   - La première ligne non vide après le marqueur est considérée comme titre
 *   - Le reste constitue le content du bloc
 *   - Le contenu avant le premier marqueur (s'il existe) est ignoré
 */
export function splitSlides(content: string): SlideBlock[] {
  const markers = [...content.matchAll(/^--- Slide (\d+) ---$/gm)];
  if (markers.length === 0) return [];

  const blocks: SlideBlock[] = [];
  for (let i = 0; i < markers.length; i++) {
    const m = markers[i];
    const slideNumber = parseInt(m[1], 10);
    const startIdx = m.index! + m[0].length;
    const endIdx = i + 1 < markers.length ? markers[i + 1].index! : content.length;
    const raw = content.slice(startIdx, endIdx).trim();
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);
    const title = lines.length > 0 ? lines[0].trim() : undefined;
    const body = lines.slice(1).join("\n");
    blocks.push({ slideNumber, title, content: body });
  }
  return blocks;
}

/**
 * Strip artefacts PowerPoint en début de ligne :
 *   "9Mort subite\n" → "• Mort subite\n"
 *   "xCytolyse\n"    → "• Cytolyse\n"
 *
 * Cas exclus :
 *   - "9. " (numérotation markdown légitime)
 *   - "x-rays" (mot débutant par x-)
 *   - "9" seul sur sa ligne
 */
function stripPptBullets(content: string): string {
  return content
    // M1 : "9" suivi d'une espace puis lettre majuscule = puce, sinon laisser
    .replace(/^9(?=[A-ZÀ-Ý])/gm, "• ")
    .replace(/^9 (?=[A-ZÀ-Ý])/gm, "• ")
    // M2 : "x" en début de ligne suivi d'une majuscule = puce, exclut "x-rays" / "x="
    .replace(/^x(?=[A-ZÀ-Ý])/gm, "• ")
    .replace(/^x (?=[A-ZÀ-Ý])/gm, "• ")
    // M4 : puces unicode en début de ligne → "• "
    .replace(/^[■▪▫●◦]\s*/gm, "• ")
    // M4 : puces unicode en milieu → vide
    .replace(/[■▪▫●◦]/g, "");
}

/**
 * Recolle les ruptures de ligne sur parenthèse fermante absente :
 *   "(critère\n/ DSM-5)" → "(critère / DSM-5)"
 */
function fixLineBreaks(content: string): string {
  return content.replace(/\n+\//g, " /");
}

/**
 * Applique tous les nettoyages au content brut.
 *
 * Idempotent : cleanRagContent(cleanRagContent(x)) === cleanRagContent(x).
 * Pure function — pas d'effet de bord.
 */
export function cleanRagContent(content: string, options: CleanOptions = {}): string {
  const opts = {
    stripPptBullets: options.stripPptBullets ?? true,
    fixLineBreaks: options.fixLineBreaks ?? true,
  };

  let result = content;
  if (opts.stripPptBullets) result = stripPptBullets(result);
  if (opts.fixLineBreaks) result = fixLineBreaks(result);
  return result;
}
