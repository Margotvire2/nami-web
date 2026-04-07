/**
 * NAMI — Lexique de mots interdits / autorisés
 *
 * Ce fichier sert de base pour :
 * 1. Un lint automatique sur les strings UI / pages marketing / CGU
 * 2. Un guide de rédaction pour le marketing et le produit
 * 3. Un check CI/CD avant chaque release
 *
 * RÈGLE : si un mot interdit apparaît dans l'UI ou le marketing,
 * il faut le remplacer par son équivalent safe.
 */

export interface ForbiddenWord {
  /** Le mot ou l'expression interdite */
  interdit: string;
  /** Le(s) remplacement(s) autorisé(s) */
  remplacements: string[];
  /** Pourquoi c'est interdit */
  raison: string;
  /** Contextes d'application */
  contextes: ("ui" | "marketing" | "cgu" | "deck" | "onboarding" | "api" | "tous")[];
  /** Sévérité : 'bloquant' = ne doit jamais apparaître, 'avertissement' = à vérifier */
  severite: "bloquant" | "avertissement";
}

// ============================================================================
// MOTS INTERDITS — RISQUE DE REQUALIFICATION DM / TÉLÉSURVEILLANCE
// ============================================================================

export const dmRequalificationWords: ForbiddenWord[] = [
  {
    interdit: "suivi longitudinal",
    remplacements: ["coordination dans la durée", "organisation du parcours"],
    raison: "Trop proche de 'surveillance clinique' → bascule DM/télésurveillance.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "surveillance",
    remplacements: ["coordination", "organisation"],
    raison: "Mot directement associé à la télésurveillance médicale (Art. R6316-1 CSP).",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "monitoring",
    remplacements: ["coordination", "suivi organisationnel"],
    raison: "Anglicisme équivalent à 'surveillance'.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "continuité de prise en charge",
    remplacements: ["continuité de coordination", "continuité informationnelle"],
    raison: "'Prise en charge' implique une promesse clinique opposable.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "alerte clinique",
    remplacements: ["notification organisationnelle", "rappel"],
    raison: "'Clinique' + 'alerte' = bascule DM logiciel quasi-automatique (MDCG 2019-11).",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "alerte santé",
    remplacements: ["notification organisationnelle"],
    raison: "Même risque que 'alerte clinique'.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "signaux",
    remplacements: ["indicateurs de complétude", "activité du dossier"],
    raison: "'Signal' implique une information clinique actionnable.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "vigilance",
    remplacements: ["checklist de coordination", "à compléter"],
    raison: "Vocabulaire de pharmacovigilance/matériovigilance.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "drapeaux rouges",
    remplacements: ["éléments à compléter"],
    raison: "'Red flag' = tri clinique = DM.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "points de vigilance",
    remplacements: ["checklist de coordination", "points d'organisation"],
    raison: "Implique un tri/priorisation clinique.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "care gaps",
    remplacements: ["complétude du dossier", "éléments manquants"],
    raison: "'Care gap' implique une norme de soin → recommandation déguisée → DM.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "scoring",
    remplacements: ["indicateur de complétude"],
    raison: "Tout score basé sur données de santé = requalification MDR quasi-automatique.",
    contextes: ["tous"],
    severite: "bloquant",
  },
];

// ============================================================================
// MOTS INTERDITS — PROMESSE IMPLICITE / TROMPERIE
// ============================================================================

export const promiseWords: ForbiddenWord[] = [
  {
    interdit: "détecter",
    remplacements: ["mettre en évidence des éléments manquants"],
    raison: "'Détection' = création d'information nouvelle = possible DM + promesse.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "identifier",
    remplacements: ["mettre en évidence", "lister"],
    raison: "Dans le contexte santé, 'identifier' implique un diagnostic/tri.",
    contextes: ["marketing", "ui", "deck"],
    severite: "avertissement",
  },
  {
    interdit: "prévenir",
    remplacements: ["centraliser", "structurer", "documenter"],
    raison: "'Prévention' = finalité médicale au sens MDR.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "sécuriser",
    remplacements: ["structurer", "organiser"],
    raison: "Promesse de sécurité = opposable en cas d'incident.",
    contextes: ["marketing", "deck", "ui"],
    severite: "bloquant",
  },
  {
    interdit: "réduire les risques",
    remplacements: ["faciliter la coordination"],
    raison: "Promesse de résultat clinique non prouvée.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "éviter les complications",
    remplacements: ["faciliter l'organisation du parcours"],
    raison: "Allégation clinique sans preuve = tromperie.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "filet de sécurité",
    remplacements: ["outil de coordination"],
    raison: "Crée une attente de protection/surveillance.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "tranquillité d'esprit",
    remplacements: ["meilleure organisation"],
    raison: "Promesse implicite de sécurité.",
    contextes: ["marketing", "deck"],
    severite: "bloquant",
  },
  {
    interdit: "ne laissez plus rien passer",
    remplacements: ["centralisez vos informations"],
    raison: "Promesse de complétude/surveillance.",
    contextes: ["marketing", "deck"],
    severite: "bloquant",
  },
  {
    interdit: "on s'assure que",
    remplacements: ["nous facilitons"],
    raison: "Promesse de résultat.",
    contextes: ["marketing", "deck"],
    severite: "bloquant",
  },
];

// ============================================================================
// MOTS INTERDITS — IA / OUTPUTS
// ============================================================================

export const aiOutputWords: ForbiddenWord[] = [
  {
    interdit: "probable",
    remplacements: ["(ne pas utiliser — supprimer du résumé)"],
    raison: "Implique un diagnostic/hypothèse = DM.",
    contextes: ["api"],
    severite: "bloquant",
  },
  {
    interdit: "recommander",
    remplacements: ["(ne pas utiliser)"],
    raison: "Recommandation = aide à la décision médicale.",
    contextes: ["api", "ui"],
    severite: "bloquant",
  },
  {
    interdit: "à surveiller",
    remplacements: ["(ne pas utiliser)"],
    raison: "Implique une action de surveillance clinique.",
    contextes: ["api", "ui"],
    severite: "bloquant",
  },
  {
    interdit: "urgence",
    remplacements: ["(ne pas utiliser dans un output IA)"],
    raison: "Un output IA qui dit 'urgence' crée une responsabilité directe.",
    contextes: ["api"],
    severite: "bloquant",
  },
  {
    interdit: "non observance",
    remplacements: ["(ne pas utiliser)"],
    raison: "Inférence clinique = DM.",
    contextes: ["api", "ui"],
    severite: "bloquant",
  },
  {
    interdit: "risque",
    remplacements: ["(ne pas utiliser dans un output patient)"],
    raison: "Évaluation de risque = aide à la décision médicale.",
    contextes: ["api", "ui"],
    severite: "bloquant",
  },
  {
    interdit: "danger",
    remplacements: ["(ne pas utiliser)"],
    raison: "Implique surveillance/détection.",
    contextes: ["api", "ui"],
    severite: "bloquant",
  },
  {
    interdit: "anormal",
    remplacements: ["(ne pas utiliser)"],
    raison: "Jugement clinique = DM.",
    contextes: ["api", "ui"],
    severite: "bloquant",
  },
];

// ============================================================================
// VERBES INTERDITS (MARKETING / UI)
// ============================================================================

export const forbiddenVerbs: ForbiddenWord[] = [
  {
    interdit: "surveiller",
    remplacements: ["coordonner", "organiser"],
    raison: "Télésurveillance.",
    contextes: ["tous"],
    severite: "bloquant",
  },
  {
    interdit: "alerter",
    remplacements: ["notifier (organisationnel)", "rappeler"],
    raison: "Alerte = DM si liée à un état patient.",
    contextes: ["tous"],
    severite: "bloquant",
  },
];

// ============================================================================
// MOTS AUTORISÉS (SAFE) — À UTILISER LIBREMENT
// ============================================================================

export const safeWords: string[] = [
  // Verbes
  "centraliser",
  "structurer",
  "partager",
  "documenter",
  "coordonner",
  "tracer",
  "faciliter",
  "organiser",
  "consolider",
  "préparer",
  // Noms
  "coordination",
  "organisation",
  "consolidation",
  "complétude",
  "checklist",
  "récapitulatif",
  "notification organisationnelle",
  "rappel",
  "dossier de coordination",
  "équipe de prise en charge",
  "continuité informationnelle",
  "continuité de coordination",
  "indicateur de complétude",
  "activité du dossier",
  "brouillon IA",
  "synthèse automatique",
];

// ============================================================================
// EXPORT COMPLET
// ============================================================================

export const allForbiddenWords: ForbiddenWord[] = [
  ...dmRequalificationWords,
  ...promiseWords,
  ...aiOutputWords,
  ...forbiddenVerbs,
];

/**
 * Vérifie si un texte contient des mots interdits.
 * Utilisable dans un lint CI/CD ou un check pré-release.
 *
 * @returns Liste des violations trouvées
 */
export function checkTextCompliance(
  text: string,
  contexte: ForbiddenWord["contextes"][number] = "tous"
): { mot: string; severite: string; remplacement: string[] }[] {
  const violations: { mot: string; severite: string; remplacement: string[] }[] = [];
  const lowerText = text.toLowerCase();

  for (const word of allForbiddenWords) {
    if (
      word.contextes.includes(contexte) ||
      word.contextes.includes("tous")
    ) {
      if (lowerText.includes(word.interdit.toLowerCase())) {
        violations.push({
          mot: word.interdit,
          severite: word.severite,
          remplacement: word.remplacements,
        });
      }
    }
  }

  return violations;
}

/**
 * Test simple : le texte est-il "safe" ?
 */
export function isTextCompliant(
  text: string,
  contexte: ForbiddenWord["contextes"][number] = "tous"
): boolean {
  return checkTextCompliance(text, contexte).filter((v) => v.severite === "bloquant").length === 0;
}
