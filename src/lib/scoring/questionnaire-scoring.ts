/**
 * Moteur de scoring — questionnaires validés
 *
 * PHQ-9  : Kroenke & Spitzer 2001 — dépression (9 items, 0-3, max 27)
 * GAD-7  : Spitzer et al. 2006 — anxiété généralisée (7 items, 0-3, max 21)
 * EAT-26 : Garner et al. 1982 — comportement alimentaire (26 items, 0-3, max 78)
 * SCOFF  : Morgan et al. 1999 — dépistage TCA (5 items, 0/1, max 5)
 *
 * [LEGAL] Les résultats sont des indicateurs de complétude, jamais des diagnostics.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeverityBand {
  label: string;
  min: number;
  max: number;
  color: "green" | "yellow" | "orange" | "red" | "purple";
  description: string;
}

export interface QuestionnaireDefinition {
  key: string;                // clé catalog (ex: "phq9")
  metricKey: string;          // clé observation (ex: "phq9_score")
  label: string;
  shortLabel: string;
  source: string;
  maxScore: number;
  itemCount: number;
  scale: "likert4" | "binary"; // 0-3 ou 0/1
  scaleLabels?: string[];      // libellés du scale
  bands: SeverityBand[];
  items: string[];
  note?: string;
}

// ─── PHQ-9 ───────────────────────────────────────────────────────────────────

export const PHQ9: QuestionnaireDefinition = {
  key: "phq9",
  metricKey: "phq9_score",
  label: "PHQ-9 — Questionnaire sur la santé du patient",
  shortLabel: "PHQ-9",
  source: "Kroenke & Spitzer, 2001 — traduit et validé en français",
  maxScore: 27,
  itemCount: 9,
  scale: "likert4",
  scaleLabels: ["Jamais", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"],
  bands: [
    { label: "Minimal",        min: 0,  max: 4,  color: "green",  description: "Symptômes dépressifs minimes ou absents" },
    { label: "Léger",          min: 5,  max: 9,  color: "yellow", description: "Symptômes dépressifs légers" },
    { label: "Modéré",         min: 10, max: 14, color: "orange", description: "Symptômes dépressifs modérés" },
    { label: "Modéré-Sévère",  min: 15, max: 19, color: "red",    description: "Symptômes dépressifs modérément sévères" },
    { label: "Sévère",         min: 20, max: 27, color: "purple", description: "Symptômes dépressifs sévères" },
  ],
  items: [
    "Peu d'intérêt ou de plaisir pour faire des choses",
    "Se sentir triste, déprimé(e) ou sans espoir",
    "Difficultés à s'endormir, rester endormi(e), ou dormir trop",
    "Se sentir fatigué(e) ou manquer d'énergie",
    "Peu d'appétit ou manger trop",
    "Mauvaise opinion de soi, sentiment d'être nul(le) ou d'avoir déçu sa famille ou soi-même",
    "Difficultés à se concentrer (ex : lire, regarder la télévision)",
    "Bouger ou parler si lentement que les autres l'ont remarqué, ou au contraire être si agité(e) que l'on bouge beaucoup plus que d'habitude",
    "Penser qu'il vaudrait mieux mourir ou se faire du mal d'une façon ou d'une autre",
  ],
  note: "Item 9 : en cas de réponse positive (≥ 1), une évaluation du risque suicidaire est recommandée.",
};

// ─── GAD-7 ───────────────────────────────────────────────────────────────────

export const GAD7: QuestionnaireDefinition = {
  key: "gad7",
  metricKey: "gad7_score",
  label: "GAD-7 — Échelle d'anxiété généralisée",
  shortLabel: "GAD-7",
  source: "Spitzer et al., 2006 — traduit et validé en français",
  maxScore: 21,
  itemCount: 7,
  scale: "likert4",
  scaleLabels: ["Jamais", "Plusieurs jours", "Plus de la moitié du temps", "Presque tous les jours"],
  bands: [
    { label: "Minimal",  min: 0,  max: 4,  color: "green",  description: "Anxiété minime ou absente" },
    { label: "Léger",    min: 5,  max: 9,  color: "yellow", description: "Anxiété légère" },
    { label: "Modéré",   min: 10, max: 14, color: "orange", description: "Anxiété modérée" },
    { label: "Sévère",   min: 15, max: 21, color: "red",    description: "Anxiété sévère" },
  ],
  items: [
    "Vous sentir nerveux(se), anxieux(se) ou à bout",
    "Ne pas être capable d'arrêter de vous inquiéter ou de contrôler vos inquiétudes",
    "Vous inquiéter trop à propos de sujets différents",
    "Avoir du mal à vous détendre",
    "Être tellement agité(e) qu'il est difficile de tenir en place",
    "Devenir facilement contrarié(e) ou irritable",
    "Avoir peur que quelque chose d'horrible ne se passe",
  ],
};

// ─── EAT-26 ──────────────────────────────────────────────────────────────────

export const EAT26: QuestionnaireDefinition = {
  key: "eat26",
  metricKey: "eat26_score",
  label: "EAT-26 — Comportements alimentaires",
  shortLabel: "EAT-26",
  source: "Garner et al., 1982",
  maxScore: 78,
  itemCount: 26,
  scale: "likert4",
  scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent / Toujours"],
  bands: [
    { label: "Normal",       min: 0,  max: 19, color: "green",  description: "Comportement alimentaire dans la norme" },
    { label: "Élevé",        min: 20, max: 39, color: "orange", description: "Score ≥ 20 — comportements alimentaires problématiques, évaluation clinique recommandée" },
    { label: "Très élevé",   min: 40, max: 78, color: "red",    description: "Score ≥ 40 — comportements alimentaires sévèrement perturbés" },
  ],
  items: [
    "J'ai terriblement peur d'être en surpoids",
    "J'évite de manger quand j'ai faim",
    "Je me trouve préoccupé(e) par la nourriture",
    "J'ai eu des épisodes de gavage au cours desquels j'ai le sentiment de ne pas pouvoir m'arrêter de manger",
    "Je coupe mes aliments en petits morceaux",
    "Je suis attentif(ve) à la teneur en calories des aliments que je mange",
    "J'évite les aliments riches en glucides (pain, riz, pommes de terre…)",
    "Je sens que les autres aimeraient que je mange davantage",
    "Je vomis après avoir mangé",
    "Je me sens extrêmement coupable après avoir mangé",
    "Je suis préoccupé(e) par le désir d'être plus mince",
    "Je pense à brûler des calories lorsque je fais de l'exercice",
    "Les autres pensent que je suis trop mince",
    "Je suis préoccupé(e) par l'idée d'avoir de la graisse sur mon corps",
    "Je mets plus de temps que les autres pour prendre mes repas",
    "J'évite les aliments qui contiennent du sucre",
    "Je mange des aliments de régime",
    "Je sens que la nourriture contrôle ma vie",
    "Je contrôle mon alimentation",
    "Je sens que les autres me poussent à manger",
    "Je passe trop de temps à penser à la nourriture",
    "Je me sens mal à l'aise après avoir mangé des sucreries",
    "Je suis actuellement au régime",
    "J'aime avoir l'estomac vide",
    "J'aime essayer de nouveaux aliments riches (cet item est inversé)",
    "J'ai envie de vomir après les repas",
  ],
  note: "Item 25 est inversé : Toujours/Souvent=0, Parfois=1, Rarement=2, Jamais=3.",
};

// ─── SCOFF ───────────────────────────────────────────────────────────────────

export const SCOFF: QuestionnaireDefinition = {
  key: "scoff",
  metricKey: "scoff_score",
  label: "SCOFF — Dépistage rapide des TCA",
  shortLabel: "SCOFF",
  source: "Morgan et al., 1999 — version française Bydlowski & Chambry 2000 (recommandée HAS)",
  maxScore: 5,
  itemCount: 5,
  scale: "binary",
  scaleLabels: ["Non", "Oui"],
  bands: [
    { label: "Absence de suspicion", min: 0, max: 1, color: "green",  description: "Pas de critère TCA identifié" },
    { label: "Suspicion TCA",        min: 2, max: 5, color: "orange", description: "≥ 2 réponses OUI — évaluation approfondie recommandée" },
  ],
  items: [
    "Vous faites-vous vomir parce que vous vous sentez mal d'avoir trop mangé ?",
    "Vous inquiétez-vous d'avoir perdu le contrôle de ce que vous mangez ?",
    "Avez-vous récemment perdu plus de 6 kg en 3 mois ?",
    "Pensez-vous que vous êtes gros(se) alors que d'autres vous trouvent trop mince ?",
    "Diriez-vous que la nourriture domine votre vie ?",
  ],
};

// ─── Catalog ─────────────────────────────────────────────────────────────────

export const QUESTIONNAIRE_CATALOG: Record<string, QuestionnaireDefinition> = {
  phq9: PHQ9,
  gad7: GAD7,
  eat26: EAT26,
  scoff: SCOFF,
};

// ─── Moteur de scoring ────────────────────────────────────────────────────────

export function computeScore(
  def: QuestionnaireDefinition,
  answers: Record<number, number>
): number {
  // EAT-26 item 25 (index 24) est inversé
  if (def.key === "eat26") {
    let total = 0;
    for (let i = 0; i < def.itemCount; i++) {
      const v = answers[i] ?? 0;
      total += i === 24 ? (3 - v) : v; // inversion item 25
    }
    return total;
  }
  return Object.values(answers).reduce((acc, v) => acc + (v ?? 0), 0);
}

export function getBand(def: QuestionnaireDefinition, score: number): SeverityBand {
  return def.bands.find((b) => score >= b.min && score <= b.max) ?? def.bands[def.bands.length - 1];
}

export function isComplete(def: QuestionnaireDefinition, answers: Record<number, number>): boolean {
  return Object.keys(answers).length === def.itemCount;
}

export const BAND_COLORS: Record<string, string> = {
  green:  "bg-green-100 text-green-800 border border-green-200",
  yellow: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  orange: "bg-orange-100 text-orange-800 border border-orange-200",
  red:    "bg-red-100 text-red-700 border border-red-200",
  purple: "bg-purple-100 text-purple-800 border border-purple-200",
};
