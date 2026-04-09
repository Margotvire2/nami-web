export interface PathologyMeta {
  slug: string
  title: string
  shortTitle: string
  description: string
  keywords: string[]
  category: "tca" | "metabolique" | "pediatrie" | "psy" | "cardio"
  cim11?: string
  emoji: string
}

export const PATHOLOGIES: PathologyMeta[] = [
  {
    slug: "anorexie-mentale",
    title: "Anorexie mentale — Diagnostic, prise en charge et parcours de soins",
    shortTitle: "Anorexie mentale",
    description: "Tout savoir sur l'anorexie mentale : critères diagnostiques DSM-5, signes d'alerte, bilan biologique, traitement, hospitalisation, parcours de soins pluridisciplinaire. Source HAS, FFAB.",
    keywords: ["anorexie mentale", "anorexia nervosa", "TCA", "trouble alimentaire", "perte de poids", "IMC bas", "dénutrition", "renutrition"],
    category: "tca",
    cim11: "6B80",
    emoji: "🩺",
  },
  {
    slug: "hyperphagie-boulimique-bed",
    title: "Hyperphagie boulimique (BED) — Diagnostic et prise en charge",
    shortTitle: "Hyperphagie boulimique (BED)",
    description: "Comprendre l'hyperphagie boulimique (Binge Eating Disorder) : critères, différence avec la boulimie, lien avec l'obésité, traitement TCC, parcours de soins.",
    keywords: ["hyperphagie boulimique", "BED", "binge eating", "crises boulimiques", "obésité", "TCA", "compulsions alimentaires"],
    category: "tca",
    cim11: "6B82",
    emoji: "🍽️",
  },
  {
    slug: "arfid",
    title: "ARFID — Trouble de l'alimentation évitante/restrictive chez l'enfant et l'adulte",
    shortTitle: "ARFID",
    description: "ARFID (Avoidance/Restrictive Food Intake Disorder) : diagnostic, différence avec l'anorexie, trouble de l'oralité, sélectivité alimentaire, prise en charge.",
    keywords: ["ARFID", "trouble oralité", "sélectivité alimentaire", "refus morceaux", "néophobie", "enfant ne mange pas"],
    category: "tca",
    cim11: "6B83",
    emoji: "🧒",
  },
  {
    slug: "night-eating-syndrome",
    title: "Night Eating Syndrome — Syndrome d'alimentation nocturne",
    shortTitle: "Night Eating Syndrome",
    description: "Night Eating Syndrome : hyperphagie nocturne, réveils pour manger, lien avec l'obésité et la dépression, critères diagnostiques, traitement.",
    keywords: ["night eating syndrome", "alimentation nocturne", "manger la nuit", "hyperphagie nocturne", "TCA"],
    category: "tca",
    emoji: "🌙",
  },
  {
    slug: "diabete-type-2",
    title: "Diabète de type 2 — Diagnostic, suivi et parcours de soins",
    shortTitle: "Diabète type 2",
    description: "Diabète type 2 : critères diagnostiques, HbA1c, complications, traitement, suivi pluridisciplinaire, lien avec l'obésité. Source HAS.",
    keywords: ["diabète type 2", "DT2", "glycémie", "HbA1c", "insulinorésistance", "metformine", "obésité", "syndrome métabolique"],
    category: "metabolique",
    cim11: "5A11",
    emoji: "🩸",
  },
  {
    slug: "sopk",
    title: "SOPK — Syndrome des Ovaires Polykystiques : diagnostic et prise en charge",
    shortTitle: "SOPK",
    description: "SOPK (Syndrome des Ovaires Polykystiques) : critères de Rotterdam, hyperandrogénie, irrégularités menstruelles, lien obésité/insulinorésistance, traitement.",
    keywords: ["SOPK", "ovaires polykystiques", "hyperandrogénie", "acné", "hirsutisme", "aménorrhée", "infertilité", "insulinorésistance"],
    category: "metabolique",
    cim11: "5A80",
    emoji: "♀️",
  },
  {
    slug: "nafld-nash",
    title: "NAFLD / NASH — Stéatose hépatique et stéatohépatite non alcoolique",
    shortTitle: "NAFLD / NASH",
    description: "NAFLD et NASH : stéatose hépatique non alcoolique, fibrose, diagnostic, FibroScan, traitement, lien avec obésité et syndrome métabolique.",
    keywords: ["NAFLD", "NASH", "stéatose hépatique", "foie gras", "fibrose", "FibroScan", "obésité", "transaminases"],
    category: "metabolique",
    emoji: "🫁",
  },
  {
    slug: "hta",
    title: "HTA — Hypertension artérielle : diagnostic et suivi",
    shortTitle: "HTA",
    description: "Hypertension artérielle : seuils diagnostiques, bilan initial, traitement, suivi, comorbidités (obésité, diabète, SAHOS). Source HAS/ESC.",
    keywords: ["HTA", "hypertension", "tension artérielle", "pression artérielle", "risque cardiovasculaire"],
    category: "cardio",
    cim11: "BA00",
    emoji: "❤️",
  },
  {
    slug: "sahos",
    title: "SAHOS — Syndrome d'Apnées du Sommeil : diagnostic et traitement",
    shortTitle: "SAHOS",
    description: "SAHOS (Syndrome d'Apnées-Hypopnées Obstructives du Sommeil) : ronflements, somnolence, polysomnographie, PPC, lien avec obésité.",
    keywords: ["SAHOS", "apnée du sommeil", "ronflements", "PPC", "somnolence", "polysomnographie", "Epworth", "obésité"],
    category: "metabolique",
    emoji: "😴",
  },
  {
    slug: "depression",
    title: "Dépression — Diagnostic, traitement et parcours de soins",
    shortTitle: "Dépression",
    description: "Dépression : critères DSM-5, PHQ-9, antidépresseurs, psychothérapie, comorbidités TCA/obésité, risque suicidaire. Source HAS.",
    keywords: ["dépression", "épisode dépressif", "PHQ-9", "antidépresseur", "ISRS", "psychothérapie", "risque suicidaire"],
    category: "psy",
    cim11: "6A70",
    emoji: "🧠",
  },
  {
    slug: "trouble-anxieux-generalise",
    title: "Trouble Anxieux Généralisé (TAG) — Diagnostic et prise en charge",
    shortTitle: "Trouble anxieux généralisé",
    description: "TAG (Trouble Anxieux Généralisé) : inquiétude excessive, GAD-7, traitement (TCC, ISRS), comorbidités, parcours de soins.",
    keywords: ["trouble anxieux", "TAG", "anxiété généralisée", "GAD-7", "inquiétude", "TCC", "anxiolytique"],
    category: "psy",
    cim11: "6B00",
    emoji: "😰",
  },
]

export function getPathologyBySlug(slug: string): PathologyMeta | undefined {
  return PATHOLOGIES.find((p) => p.slug === slug)
}

export const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  tca: { label: "Troubles du Comportement Alimentaire", color: "indigo" },
  metabolique: { label: "Comorbidités métaboliques", color: "amber" },
  pediatrie: { label: "Pédiatrie", color: "emerald" },
  psy: { label: "Santé mentale", color: "purple" },
  cardio: { label: "Cardiovasculaire", color: "red" },
}
