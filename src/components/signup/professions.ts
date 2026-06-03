// F-SOIGNANT-SIGNUP-PAR-METIER — référentiel des 12 professions soignantes
// supportées par le wizard signup pro.
//
// IMPORTANT : la source de vérité est l'enum Prisma `Profession` côté backend.
// Toute modification ici doit être répliquée dans /Users/margotvire/nami/
// prisma/schema.prisma + une migration. La famille `identifierType` est
// dérivée côté backend (PROFESSION_TO_IDENTIFIER_TYPE) — on la duplique ici
// pour permettre au wizard de pré-afficher le bon champ sans round-trip.

export type Profession =
  | "MEDECIN"
  | "DIETICIEN"
  | "KINE"
  | "IDE"
  | "SAGE_FEMME"
  | "PSY"
  | "OSTEO"
  | "PHARMA"
  | "ORTHOPHONISTE"
  | "PEDICURE"
  | "ERGO"
  | "AIDE_SOIGNANT"

export type ProIdentifierType = "RPPS" | "ADELI" | "DEAS"

export type ProfessionMeta = {
  value:           Profession
  label:           string
  emoji:           string
  identifierType:  ProIdentifierType
  helper:          string
}

export const PROFESSIONS: ProfessionMeta[] = [
  { value: "MEDECIN",       label: "Médecin",              emoji: "🩺", identifierType: "RPPS",  helper: "Médecin généraliste ou spécialiste" },
  { value: "PEDICURE",      label: "Pédicure-podologue",   emoji: "🦶", identifierType: "ADELI", helper: "Soin des pieds et orthèses plantaires" },
  { value: "SAGE_FEMME",    label: "Sage-femme",           emoji: "🤰", identifierType: "RPPS",  helper: "Suivi de grossesse, accouchement, post-partum" },
  { value: "DIETICIEN",     label: "Diététicien·ne",       emoji: "🥗", identifierType: "ADELI", helper: "Nutrition, TCA, obésité" },
  { value: "PSY",           label: "Psy / Psychologue",    emoji: "🧠", identifierType: "ADELI", helper: "Psychologue, psychiatre, psychothérapeute" },
  { value: "KINE",          label: "Kinésithérapeute",     emoji: "💪", identifierType: "RPPS",  helper: "Rééducation, ostéo-articulaire, respiratoire" },
  { value: "IDE",           label: "Infirmier·ère",        emoji: "💉", identifierType: "RPPS",  helper: "IDE libérale ou hospitalière" },
  { value: "OSTEO",         label: "Ostéopathe",           emoji: "🖐️", identifierType: "ADELI", helper: "Ostéopathie D.O." },
  { value: "ORTHOPHONISTE", label: "Orthophoniste",        emoji: "🗣️", identifierType: "ADELI", helper: "Troubles du langage, déglutition, oralité" },
  { value: "ERGO",          label: "Ergothérapeute",       emoji: "🧩", identifierType: "ADELI", helper: "Autonomie, adaptation de l'environnement" },
  { value: "PHARMA",        label: "Pharmacien·ne",        emoji: "💊", identifierType: "RPPS",  helper: "Officine ou hospitalier" },
  { value: "AIDE_SOIGNANT", label: "Aide-soignant·e",      emoji: "🤝", identifierType: "DEAS",  helper: "Accompagnement quotidien des patients" },
]

export function getProfession(value: Profession | ""): ProfessionMeta | null {
  return PROFESSIONS.find((p) => p.value === value) ?? null
}

export const IDENTIFIER_TYPE_LABEL: Record<ProIdentifierType, string> = {
  RPPS:  "RPPS",
  ADELI: "ADELI",
  DEAS:  "DEAS",
}

export const IDENTIFIER_TYPE_HINT: Record<ProIdentifierType, string> = {
  RPPS:  "11 chiffres — figure sur votre carte CPS",
  ADELI: "9 chiffres — délivré par votre ARS",
  DEAS:  "Numéro de Diplôme d'État d'Aide-Soignant·e",
}

// Patterns dupliqués depuis le backend (providerSignup.service.ts) pour permettre
// au wizard de valider en temps réel avant l'appel API.
export const IDENTIFIER_PATTERNS: Record<ProIdentifierType, RegExp> = {
  RPPS:  /^\d{11}$/,
  ADELI: /^\d{9}$/,
  DEAS:  /^[A-Za-z0-9\-\/]{4,32}$/,
}

export type ExerciseMode = "LIBERAL" | "SALARIED" | "MIXED"

export const EXERCISE_MODES: { value: ExerciseMode; label: string; description: string; emoji: string }[] = [
  { value: "LIBERAL",  label: "Libéral·e",                 description: "Cabinet en nom propre ou SEL",                 emoji: "🏠" },
  { value: "SALARIED", label: "Salarié·e d'une structure", description: "Hôpital, clinique, CPTS, MSP, association",    emoji: "🏥" },
  { value: "MIXED",    label: "Exercice mixte",            description: "Combinaison libéral + salarié",                emoji: "🔀" },
]

export type SpecialtyView = "TCA" | "OBESITE" | "ENDOCRINO" | "PEDIA" | "GENERAL" | "AUTRE"

export const SPECIALTY_VIEWS: { value: SpecialtyView; label: string; description: string }[] = [
  { value: "TCA",       label: "TCA",                description: "Troubles du comportement alimentaire" },
  { value: "OBESITE",   label: "Obésité",            description: "Surpoids, obésité, chirurgie bariatrique" },
  { value: "ENDOCRINO", label: "Endocrinologie",     description: "Diabète, thyroïde, hormones" },
  { value: "PEDIA",     label: "Pédiatrie",          description: "Suivi enfants 0-18 ans" },
  { value: "GENERAL",   label: "Pratique généraliste", description: "Suivi global multi-pathologies" },
  { value: "AUTRE",     label: "Autre",              description: "Précisez plus tard dans votre profil" },
]
