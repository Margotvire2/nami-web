// ═══════════════════════════════════════════════════════════════════════════
// PROFESSIONS + DOMAINES D'EXPERTISE — Référentiel Nami
// Structure : Profession → Domaines pertinents → Diplômes
// ═══════════════════════════════════════════════════════════════════════════

// ─── Professions ────────────────────────────────────────────────────────────

export interface Profession {
  id: string
  label: string
  category: "medical" | "paramedical" | "sante_mentale" | "social" | "sport"
  hasRPPS: boolean
  hasADELI: boolean
  hasConvention: boolean
  hasCMU: boolean
}

export const PROFESSIONS: Profession[] = [
  // Médecins
  { id: "medecin_generaliste",  label: "Médecin généraliste",                  category: "medical",       hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },
  { id: "medecin_specialiste",  label: "Médecin spécialiste",                  category: "medical",       hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },
  { id: "psychiatre",           label: "Psychiatre",                           category: "medical",       hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },
  { id: "pedopsychiatre",       label: "Pédopsychiatre",                       category: "medical",       hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },
  { id: "endocrinologue",       label: "Endocrinologue",                       category: "medical",       hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },
  { id: "pediatre",             label: "Pédiatre",                             category: "medical",       hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },
  { id: "gastro_enterologue",   label: "Gastro-entérologue",                   category: "medical",       hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },
  { id: "cardiologue",          label: "Cardiologue",                          category: "medical",       hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },
  { id: "medecin_mpr",          label: "Médecin MPR (Réadaptation)",           category: "medical",       hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },
  { id: "medecin_sport",        label: "Médecin du sport",                     category: "medical",       hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },
  { id: "chirurgien_bariatrique",label: "Chirurgien bariatrique",              category: "medical",       hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },

  // Paramédicaux
  { id: "dieteticien",          label: "Diététicien(ne)",                      category: "paramedical",   hasRPPS: false, hasADELI: true,  hasConvention: false, hasCMU: false },
  { id: "infirmier",            label: "Infirmier(e)",                         category: "paramedical",   hasRPPS: false, hasADELI: true,  hasConvention: true,  hasCMU: true },
  { id: "kinesitherapeute",     label: "Masseur-kinésithérapeute",             category: "paramedical",   hasRPPS: false, hasADELI: true,  hasConvention: true,  hasCMU: true },
  { id: "orthophoniste",        label: "Orthophoniste",                        category: "paramedical",   hasRPPS: false, hasADELI: true,  hasConvention: true,  hasCMU: true },
  { id: "ergotherapeute",       label: "Ergothérapeute",                       category: "paramedical",   hasRPPS: false, hasADELI: true,  hasConvention: false, hasCMU: false },
  { id: "psychomotricien",      label: "Psychomotricien(ne)",                  category: "paramedical",   hasRPPS: false, hasADELI: true,  hasConvention: false, hasCMU: false },
  { id: "sage_femme",           label: "Sage-femme",                           category: "paramedical",   hasRPPS: true,  hasADELI: false, hasConvention: true,  hasCMU: true },
  { id: "pedicure_podologue",   label: "Pédicure-podologue",                   category: "paramedical",   hasRPPS: false, hasADELI: true,  hasConvention: true,  hasCMU: true },

  // Santé mentale (non médecin)
  { id: "psychologue",          label: "Psychologue",                          category: "sante_mentale", hasRPPS: false, hasADELI: true,  hasConvention: false, hasCMU: false },
  { id: "psychologue_neuro",    label: "Neuropsychologue",                     category: "sante_mentale", hasRPPS: false, hasADELI: true,  hasConvention: false, hasCMU: false },
  { id: "psychotherapeute",     label: "Psychothérapeute",                     category: "sante_mentale", hasRPPS: false, hasADELI: true,  hasConvention: false, hasCMU: false },

  // Social
  { id: "assistant_social",     label: "Assistant(e) de service social",       category: "social",        hasRPPS: false, hasADELI: false, hasConvention: false, hasCMU: false },
  { id: "educateur_specialise", label: "Éducateur(rice) spécialisé(e)",        category: "social",        hasRPPS: false, hasADELI: false, hasConvention: false, hasCMU: false },
  { id: "coordinateur_parcours",label: "Coordinateur de parcours",             category: "social",        hasRPPS: false, hasADELI: false, hasConvention: false, hasCMU: false },

  // Sport & bien-être
  { id: "apa",                  label: "Enseignant APA",                       category: "sport",         hasRPPS: false, hasADELI: false, hasConvention: false, hasCMU: false },
  { id: "coach_sante",          label: "Coach santé",                          category: "sport",         hasRPPS: false, hasADELI: false, hasConvention: false, hasCMU: false },
  { id: "osteopathe",           label: "Ostéopathe",                           category: "sport",         hasRPPS: false, hasADELI: true,  hasConvention: false, hasCMU: false },
]

// ─── Domaines d'expertise ───────────────────────────────────────────────────

export interface ExpertiseTheme {
  id: string
  label: string
  icon: string
  domains: ExpertiseDomain[]
}

export interface ExpertiseDomain {
  id: string
  label: string
}

export const EXPERTISE_THEMES: ExpertiseTheme[] = [
  {
    id: "tca_nutrition",
    label: "TCA & Nutrition",
    icon: "🍽",
    domains: [
      { id: "anorexie_mentale",       label: "Anorexie mentale" },
      { id: "boulimie",               label: "Boulimie" },
      { id: "hyperphagie_boulimique", label: "Hyperphagie boulimique (BED)" },
      { id: "arfid",                  label: "ARFID (restriction/évitement)" },
      { id: "orthorexie",             label: "Orthorexie" },
      { id: "tca_atypique",           label: "TCA atypique / OSFED" },
      { id: "tca_enfant",             label: "TCA de l'enfant" },
      { id: "tca_adolescent",         label: "TCA de l'adolescent" },
      { id: "tca_perinatal",          label: "TCA périnatal" },
      { id: "tca_sportif",            label: "TCA du sportif" },
      { id: "reeducation_alimentaire",label: "Rééducation alimentaire" },
      { id: "nutrition_therapeutique", label: "Nutrition thérapeutique" },
      { id: "alimentation_intuitive", label: "Alimentation intuitive" },
      { id: "education_therapeutique", label: "ETP (éducation thérapeutique)" },
    ],
  },
  {
    id: "obesite_metabolique",
    label: "Obésité & Métabolique",
    icon: "⚖️",
    domains: [
      { id: "obesite_adulte",         label: "Obésité adulte" },
      { id: "obesite_pediatrique",    label: "Obésité pédiatrique" },
      { id: "chirurgie_bariatrique",  label: "Suivi chirurgie bariatrique" },
      { id: "syndrome_metabolique",   label: "Syndrome métabolique" },
      { id: "diabete_type2",          label: "Diabète de type 2" },
      { id: "diabete_type1",          label: "Diabète de type 1" },
      { id: "dyslipidemia",           label: "Dyslipidémies" },
      { id: "nash",                   label: "Stéatose hépatique (NASH)" },
      { id: "insulinoresistance",     label: "Insulinorésistance / SOPK" },
    ],
  },
  {
    id: "sante_mentale",
    label: "Santé mentale",
    icon: "🧠",
    domains: [
      { id: "depression",             label: "Dépression" },
      { id: "anxiete",                label: "Troubles anxieux" },
      { id: "toc",                    label: "TOC" },
      { id: "trauma_ptsd",            label: "Trauma / PTSD" },
      { id: "psychosomatique",        label: "Troubles psychosomatiques" },
      { id: "estime_de_soi",          label: "Estime de soi / image corporelle" },
      { id: "addiction",              label: "Addictions" },
      { id: "tdah",                   label: "TDAH" },
      { id: "tsa",                    label: "Troubles du spectre autistique" },
      { id: "dys",                    label: "Troubles DYS" },
      { id: "harcelement",            label: "Harcèlement scolaire / cyberharcèlement" },
      { id: "deuil",                  label: "Deuil / perte" },
    ],
  },
  {
    id: "sante_femme",
    label: "Santé de la femme",
    icon: "♀️",
    domains: [
      { id: "sopk",                   label: "SOPK" },
      { id: "endometriose",           label: "Endométriose" },
      { id: "fertilite",              label: "Fertilité / PMA" },
      { id: "grossesse",              label: "Grossesse & nutrition prénatale" },
      { id: "post_partum",            label: "Post-partum" },
      { id: "allaitement",            label: "Allaitement" },
      { id: "menopause",              label: "Ménopause" },
      { id: "amenorrhee",             label: "Aménorrhée (hypothalamique, RED-S)" },
    ],
  },
  {
    id: "chronique",
    label: "Maladies chroniques",
    icon: "🏥",
    domains: [
      { id: "mici",                   label: "MICI (Crohn, RCH)" },
      { id: "maladie_coeliaque",      label: "Maladie coeliaque" },
      { id: "allergies_alimentaires", label: "Allergies alimentaires" },
      { id: "insuffisance_renale",    label: "Insuffisance rénale" },
      { id: "maladies_cardio",        label: "Maladies cardiovasculaires" },
      { id: "oncologie_nutrition",    label: "Oncologie & nutrition" },
      { id: "denutrition",            label: "Dénutrition" },
      { id: "nutrition_enterale",     label: "Nutrition entérale / parentérale" },
      { id: "geriatrie_nutrition",    label: "Gériatrie & nutrition" },
    ],
  },
  {
    id: "reeducation_sport",
    label: "Rééducation & Sport",
    icon: "🏃",
    domains: [
      { id: "reeducation_fonctionnelle", label: "Rééducation fonctionnelle" },
      { id: "activite_physique_adaptee", label: "Activité physique adaptée" },
      { id: "nutrition_sport",           label: "Nutrition du sport" },
      { id: "readaptation_cardiaque",    label: "Réadaptation cardiaque" },
      { id: "readaptation_respiratoire", label: "Réadaptation respiratoire" },
    ],
  },
  {
    id: "pediatrie_ado",
    label: "Pédiatrie & Adolescence",
    icon: "👶",
    domains: [
      { id: "diversification",        label: "Diversification alimentaire" },
      { id: "neonatologie_nutrition", label: "Néonatologie & nutrition" },
      { id: "croissance",             label: "Troubles de la croissance" },
      { id: "selectivite_alimentaire",label: "Sélectivité alimentaire" },
      { id: "ado_sante_mentale",      label: "Santé mentale de l'adolescent" },
    ],
  },
]

// ─── Mapping profession → thèmes pertinents ────────────────────────────────

const ALL_THEME_IDS = EXPERTISE_THEMES.map((t) => t.id)

export const PROFESSION_THEME_MAP: Record<string, string[]> = {
  // Médecins — tous les thèmes
  medecin_generaliste:   ALL_THEME_IDS,
  medecin_specialiste:   ALL_THEME_IDS,
  psychiatre:            ["sante_mentale", "tca_nutrition", "pediatrie_ado"],
  pedopsychiatre:        ["sante_mentale", "tca_nutrition", "pediatrie_ado"],
  endocrinologue:        ["obesite_metabolique", "sante_femme", "tca_nutrition"],
  pediatre:              ["pediatrie_ado", "tca_nutrition", "obesite_metabolique", "sante_mentale"],
  gastro_enterologue:    ["chronique", "obesite_metabolique", "tca_nutrition"],
  cardiologue:           ["chronique", "obesite_metabolique", "reeducation_sport"],
  medecin_mpr:           ["reeducation_sport", "chronique"],
  medecin_sport:         ["reeducation_sport", "tca_nutrition", "obesite_metabolique"],
  chirurgien_bariatrique:["obesite_metabolique"],

  // Paramédicaux
  dieteticien:           ["tca_nutrition", "obesite_metabolique", "chronique", "sante_femme", "pediatrie_ado", "reeducation_sport"],
  infirmier:             ["chronique", "tca_nutrition", "obesite_metabolique", "pediatrie_ado"],
  kinesitherapeute:      ["reeducation_sport", "chronique"],
  orthophoniste:         ["pediatrie_ado"],
  ergotherapeute:        ["reeducation_sport", "chronique", "pediatrie_ado"],
  psychomotricien:       ["pediatrie_ado", "sante_mentale"],
  sage_femme:            ["sante_femme", "pediatrie_ado"],
  pedicure_podologue:    ["chronique", "obesite_metabolique"],

  // Santé mentale
  psychologue:           ["sante_mentale", "tca_nutrition", "sante_femme", "pediatrie_ado"],
  psychologue_neuro:     ["sante_mentale", "pediatrie_ado"],
  psychotherapeute:      ["sante_mentale", "tca_nutrition"],

  // Social
  assistant_social:      ["chronique", "pediatrie_ado", "sante_mentale"],
  educateur_specialise:  ["pediatrie_ado", "sante_mentale"],
  coordinateur_parcours: ALL_THEME_IDS,

  // Sport
  apa:                   ["reeducation_sport", "obesite_metabolique", "tca_nutrition"],
  coach_sante:           ["reeducation_sport", "obesite_metabolique"],
  osteopathe:            ["reeducation_sport"],
}

// ─── Types de diplômes ──────────────────────────────────────────────────────

export const DIPLOMA_TYPES = [
  { id: "du",              label: "DU (Diplôme Universitaire)" },
  { id: "diu",             label: "DIU (Diplôme Inter-Universitaire)" },
  { id: "master",          label: "Master / M2" },
  { id: "desc",            label: "DESC / FST" },
  { id: "capacite",        label: "Capacité" },
  { id: "attestation",     label: "Attestation de formation" },
  { id: "certification",   label: "Certification professionnelle" },
  { id: "autre",           label: "Autre" },
] as const

// ─── Patient types ──────────────────────────────────────────────────────────

export const PATIENT_TYPE_LABELS: Record<string, string> = {
  adult:     "Adultes",
  child:     "Enfants (< 12 ans)",
  adolescent:"Adolescents (12-18 ans)",
  elderly:   "Personnes âgées",
  pregnant:  "Femmes enceintes",
  athlete:   "Sportifs",
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getProfession(id: string): Profession | undefined {
  return PROFESSIONS.find((p) => p.id === id)
}

export function getDomainsForProfession(professionId: string): ExpertiseTheme[] {
  const themeIds = PROFESSION_THEME_MAP[professionId] ?? []
  return EXPERTISE_THEMES.filter((t) => themeIds.includes(t.id))
}

export function getAllDomainIds(): string[] {
  return EXPERTISE_THEMES.flatMap((t) => t.domains.map((d) => d.id))
}

export function findDomain(id: string): { domain: ExpertiseDomain; theme: ExpertiseTheme } | undefined {
  for (const theme of EXPERTISE_THEMES) {
    const domain = theme.domains.find((d) => d.id === id)
    if (domain) return { domain, theme }
  }
  return undefined
}

// ─── Legacy compat (used by SpecialtyPicker + StepConfirmation) ─────────────

export type Specialty = {
  id: string
  label: string
  rppsCode?: string
  subItems?: string[]
}

export type SpecialtyCategory = {
  id: string
  label: string
  color: string
  items: Specialty[]
}

const CATEGORY_COLORS: Record<string, string> = {
  medical: "blue", paramedical: "green", sante_mentale: "purple", social: "teal", sport: "lime",
}

const CATEGORY_LABELS: Record<string, string> = {
  medical: "Médecins", paramedical: "Paramédicaux", sante_mentale: "Santé mentale", social: "Social & Médico-social", sport: "Sport & Bien-être",
}

export const SPECIALTY_CATEGORIES: SpecialtyCategory[] = (
  ["medical", "paramedical", "sante_mentale", "social", "sport"] as const
).map((cat) => ({
  id: cat,
  label: CATEGORY_LABELS[cat],
  color: CATEGORY_COLORS[cat],
  items: PROFESSIONS.filter((p) => p.category === cat).map((p) => ({ id: p.id, label: p.label })),
}))

export function getAllSpecialties(): Specialty[] {
  return SPECIALTY_CATEGORIES.flatMap((cat) => cat.items)
}

export function findSpecialty(id: string): Specialty | undefined {
  return getAllSpecialties().find((s) => s.id === id)
}

export function getCategoryForSpecialty(id: string): SpecialtyCategory | undefined {
  return SPECIALTY_CATEGORIES.find((cat) =>
    cat.items.some((s) => s.id === id)
  )
}
