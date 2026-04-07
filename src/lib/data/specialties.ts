export type SpecialtyCategory = {
  id:    string
  label: string
  color: string
  items: Specialty[]
}

export type Specialty = {
  id:        string
  label:     string
  rppsCode?: string
  subItems?: string[]
}

export const SPECIALTY_CATEGORIES: SpecialtyCategory[] = [
  {
    id:    "medical",
    label: "Médecins",
    color: "blue",
    items: [
      { id: "med_generale",           label: "Médecine générale" },
      { id: "anesthesie",             label: "Anesthésie-Réanimation" },
      { id: "cardiologie",            label: "Cardiologie" },
      { id: "chirurgie_generale",     label: "Chirurgie générale" },
      { id: "chirurgie_cardio",       label: "Chirurgie cardiovasculaire" },
      { id: "chirurgie_digestive",    label: "Chirurgie digestive" },
      { id: "chirurgie_ortho",        label: "Chirurgie orthopédique" },
      { id: "chirurgie_pediatrique",  label: "Chirurgie pédiatrique" },
      { id: "chirurgie_plastique",    label: "Chirurgie plastique" },
      { id: "chirurgie_thoracique",   label: "Chirurgie thoracique" },
      { id: "chirurgie_urologique",   label: "Chirurgie urologique" },
      { id: "chirurgie_vasculaire",   label: "Chirurgie vasculaire" },
      { id: "dermatologie",           label: "Dermatologie" },
      { id: "endocrinologie",         label: "Endocrinologie & Diabétologie" },
      { id: "gastro",                 label: "Gastro-entérologie & Hépatologie" },
      { id: "geriatrie",              label: "Gériatrie" },
      { id: "gynecologie_med",        label: "Gynécologie médicale" },
      { id: "gynecologie_obst",       label: "Gynécologie-Obstétrique" },
      { id: "hematologie",            label: "Hématologie" },
      { id: "hepato_gastro",          label: "Hépato-gastroentérologie" },
      { id: "infectiologie",          label: "Infectiologie" },
      { id: "medecine_interne",       label: "Médecine interne" },
      { id: "medecine_nuc",           label: "Médecine nucléaire" },
      { id: "medecine_physique",      label: "Médecine physique & Réadaptation" },
      { id: "medecine_travail",       label: "Médecine du travail" },
      { id: "medecine_urgences",      label: "Médecine d'urgence" },
      { id: "nephrologie",            label: "Néphrologie" },
      { id: "neurochirurgie",         label: "Neurochirurgie" },
      { id: "neurologie",             label: "Neurologie" },
      { id: "oncologie_med",          label: "Oncologie médicale" },
      { id: "oncologie_radio",        label: "Oncologie radiothérapique" },
      { id: "ophtalmologie",          label: "Ophtalmologie" },
      { id: "orl",                    label: "ORL & Chirurgie cervicofaciale" },
      { id: "pediatrie",              label: "Pédiatrie" },
      { id: "pneumologie",            label: "Pneumologie" },
      { id: "psychiatrie",            label: "Psychiatrie adulte" },
      { id: "psychiatrie_enfant",     label: "Psychiatrie enfant & adolescent" },
      { id: "radiologie",             label: "Radiologie & Imagerie médicale" },
      { id: "rhumatologie",           label: "Rhumatologie" },
      { id: "stomatologie",           label: "Stomatologie" },
      { id: "urologie",               label: "Urologie" },
    ],
  },

  {
    id:    "sante_mentale",
    label: "Santé mentale",
    color: "purple",
    items: [
      { id: "psychologie_clinique",   label: "Psychologie clinique" },
      { id: "psychologie_sante",      label: "Psychologie de la santé" },
      { id: "psychologie_neuro",      label: "Neuropsychologie" },
      { id: "psychologie_enfant",     label: "Psychologie enfant & adolescent" },
      { id: "psychologie_couple",     label: "Psychologie couple & famille" },
      { id: "psychanalyse",           label: "Psychanalyse" },
      { id: "psychotherapie",         label: "Psychothérapie" },
      { id: "psychiatrie_adulte",     label: "Psychiatrie adulte" },
      { id: "psychiatrie_pedopsy",    label: "Pédopsychiatrie" },
      { id: "addictologie",           label: "Addictologie" },
      { id: "sexologie",              label: "Sexologie" },
    ],
  },

  {
    id:    "paramedicaux",
    label: "Paramédicaux",
    color: "green",
    items: [
      { id: "infirmier",              label: "Infirmier(e)" },
      { id: "infirmier_psy",          label: "Infirmier(e) en psychiatrie" },
      { id: "infirmier_anesthesiste", label: "Infirmier(e) anesthésiste" },
      { id: "infirmier_bloc",         label: "Infirmier(e) de bloc opératoire" },
      { id: "infirmier_puericultrice",label: "Puéricultrice" },
      { id: "masseur_kinesitherapeute",label: "Masseur-kinésithérapeute" },
      { id: "ortho_langage",          label: "Orthophoniste" },
      { id: "ortho_optiste",          label: "Orthoptiste" },
      { id: "ergotherapeute",         label: "Ergothérapeute" },
      { id: "psychomotricien",        label: "Psychomotricien(ne)" },
      { id: "dieteticien",            label: "Diététicien(ne)" },
      { id: "pedicure_podologue",     label: "Pédicure-Podologue" },
      { id: "aide_soignant",          label: "Aide-soignant(e)" },
      { id: "auxiliaire_puericulture",label: "Auxiliaire de puériculture" },
      { id: "manipulateur_radio",     label: "Manipulateur en électroradiologie" },
      { id: "technicien_labo",        label: "Technicien de laboratoire" },
      { id: "preparateur_pharma",     label: "Préparateur en pharmacie" },
    ],
  },

  {
    id:    "reeducation",
    label: "Rééducation & Thérapies manuelles",
    color: "orange",
    items: [
      { id: "osteopathe",             label: "Ostéopathe" },
      { id: "chiropracteur",          label: "Chiropracteur" },
      { id: "etiopathe",              label: "Étiopathe" },
      { id: "acupuncteur",            label: "Acupuncteur" },
    ],
  },

  {
    id:    "dentaire",
    label: "Chirurgiens-dentistes",
    color: "cyan",
    items: [
      { id: "chirurgien_dentiste",    label: "Chirurgien-dentiste" },
      { id: "orthodontiste",          label: "Orthodontiste" },
      { id: "stomatologue",           label: "Stomatologue" },
      { id: "parodontiste",           label: "Parodontiste" },
      { id: "implantologue",          label: "Implantologue" },
    ],
  },

  {
    id:    "pharmacie",
    label: "Pharmaciens & Biologistes",
    color: "yellow",
    items: [
      { id: "pharmacien_officine",    label: "Pharmacien d'officine" },
      { id: "pharmacien_hopital",     label: "Pharmacien hospitalier" },
      { id: "biologiste",             label: "Biologiste médical" },
    ],
  },

  {
    id:    "sage_femme",
    label: "Sages-femmes",
    color: "pink",
    items: [
      { id: "sage_femme",             label: "Sage-femme" },
    ],
  },

  {
    id:    "social_medico",
    label: "Social & Médico-social",
    color: "teal",
    items: [
      { id: "assistant_social",       label: "Assistant(e) de service social" },
      { id: "educateur_specialise",   label: "Éducateur(rice) spécialisé(e)" },
      { id: "moniteur_educateur",     label: "Moniteur éducateur" },
      { id: "cesf",                   label: "CESF" },
      { id: "animateur_social",       label: "Animateur social" },
      { id: "mandataire_judiciaire",  label: "Mandataire judiciaire" },
      { id: "coordinateur_parcours",  label: "Coordinateur de parcours" },
    ],
  },

  {
    id:    "sport_bien_etre",
    label: "Sport & Bien-être thérapeutique",
    color: "lime",
    items: [
      { id: "apa",                    label: "Enseignant en APA (Activité Physique Adaptée)" },
      { id: "coach_sante",            label: "Coach santé" },
    ],
  },
]

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
