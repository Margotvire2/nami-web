/**
 * Metadata SEO pour les 26 pages /professions/[slug].
 *
 * Chaque page profession est un composant `"use client"` — impossible
 * d'exporter `metadata` depuis le page.tsx. On crée un sibling
 * `layout.tsx` par profession qui importe ce map.
 *
 * Toutes les chaînes respectent le wording MDR (pas de "surveillance",
 * "alerte", etc. — voir CLAUDE.md).
 */

export type ProfessionSlug =
  | "allergologue"
  | "cardiologue"
  | "chirurgien-bariatrique"
  | "dermatologue"
  | "dieteticien"
  | "endocrinologue"
  | "ergotherapeute"
  | "gastro-enterologue"
  | "geriatre"
  | "gynecologue"
  | "infectiologue"
  | "infirmier"
  | "kinesitherapeute"
  | "medecin-generaliste"
  | "medecin-nutritionniste"
  | "nephrologue"
  | "neurologue"
  | "oncologue"
  | "orthophoniste"
  | "pediatre"
  | "pneumologue"
  | "podologue"
  | "psychiatre"
  | "psychologue"
  | "rhumatologue"
  | "sage-femme"

export type ProfessionMeta = {
  label: string
  metaTitle: string
  metaDescription: string
  serviceType: string
  keywords: string[]
}

export const PROFESSIONS_META: Record<ProfessionSlug, ProfessionMeta> = {
  allergologue: {
    label: "Allergologue",
    metaTitle: "Allergologue — coordination pluridisciplinaire | Nami",
    metaDescription:
      "Allergies alimentaires, asthme, dermatite atopique : coordonnez le parcours avec diététicien·ne, pédiatre, dermatologue sur Nami.",
    serviceType: "Allergologie",
    keywords: ["allergologue", "allergies alimentaires", "asthme", "dermatite atopique", "coordination"],
  },
  cardiologue: {
    label: "Cardiologue",
    metaTitle: "Cardiologue — coordination ville-hôpital | Nami",
    metaDescription:
      "Maladies cardiovasculaires, HTA, insuffisance cardiaque : coordonnez avec MG, diététicien·ne, APA sur la plateforme Nami.",
    serviceType: "Cardiologie",
    keywords: ["cardiologue", "HTA", "insuffisance cardiaque", "maladie cardiovasculaire", "coordination ville-hôpital"],
  },
  "chirurgien-bariatrique": {
    label: "Chirurgien bariatrique",
    metaTitle: "Chirurgien bariatrique — parcours pré et post-opératoire | Nami",
    metaDescription:
      "Sleeve, bypass : organisez le parcours obésité pré et post-opératoire avec endocrino, diététicien·ne, psychologue, APA sur Nami.",
    serviceType: "Chirurgie bariatrique",
    keywords: ["chirurgie bariatrique", "sleeve gastrectomie", "bypass gastrique", "obésité", "parcours pré-opératoire"],
  },
  dermatologue: {
    label: "Dermatologue",
    metaTitle: "Dermatologue — coordination dermatites et nutrition | Nami",
    metaDescription:
      "Dermatite atopique, psoriasis, acné sévère : coordonnez avec allergologue, pédiatre, diététicien·ne sur Nami.",
    serviceType: "Dermatologie",
    keywords: ["dermatologue", "dermatite atopique", "psoriasis", "acné sévère", "coordination"],
  },
  dieteticien: {
    label: "Diététicien·ne",
    metaTitle: "Diététicien·ne — coordination TCA, obésité, nutrition | Nami",
    metaDescription:
      "TCA, obésité, dénutrition, nutrition thérapeutique : centralisez votre dossier de coordination pluridisciplinaire sur Nami. Gratuit.",
    serviceType: "Diététique",
    keywords: ["diététicien", "diététicienne TCA", "obésité", "anorexie", "boulimie", "nutrition thérapeutique"],
  },
  endocrinologue: {
    label: "Endocrinologue",
    metaTitle: "Endocrinologue — diabète, SOPK, thyroïde, obésité | Nami",
    metaDescription:
      "Diabète, SOPK, thyroïde, obésité hormonale : coordonnez avec diététicien·ne, gynéco, psychologue sur la plateforme Nami.",
    serviceType: "Endocrinologie",
    keywords: ["endocrinologue", "diabète", "SOPK", "thyroïde", "obésité hormonale"],
  },
  ergotherapeute: {
    label: "Ergothérapeute",
    metaTitle: "Ergothérapeute — coordination handicap et réhabilitation | Nami",
    metaDescription:
      "Handicap moteur, réhabilitation, adaptation environnement : coordonnez avec MG, kiné, neurologue, MPR sur Nami.",
    serviceType: "Ergothérapie",
    keywords: ["ergothérapeute", "handicap moteur", "réhabilitation", "adaptation environnement"],
  },
  "gastro-enterologue": {
    label: "Gastro-entérologue",
    metaTitle: "Gastro-entérologue — MICI, Crohn, colopathie | Nami",
    metaDescription:
      "MICI, Crohn, RCH, colopathie fonctionnelle : coordonnez avec diététicien·ne, psychologue, MG sur Nami.",
    serviceType: "Gastro-entérologie",
    keywords: ["gastro-entérologue", "MICI", "maladie de Crohn", "RCH", "colopathie fonctionnelle"],
  },
  geriatre: {
    label: "Gériatre",
    metaTitle: "Gériatre — dénutrition du sujet âgé, polypathologie | Nami",
    metaDescription:
      "Dénutrition du sujet âgé, sarcopénie, polypathologie : coordonnez avec MG, kiné, diététicien·ne sur Nami.",
    serviceType: "Gériatrie",
    keywords: ["gériatre", "dénutrition sujet âgé", "sarcopénie", "polypathologie"],
  },
  gynecologue: {
    label: "Gynécologue",
    metaTitle: "Gynécologue — SOPK, ménopause, nutrition périnatale | Nami",
    metaDescription:
      "SOPK, ménopause, nutrition périnatale : coordonnez avec endocrinologue, diététicien·ne, sage-femme sur Nami.",
    serviceType: "Gynécologie",
    keywords: ["gynécologue", "SOPK", "ménopause", "nutrition périnatale"],
  },
  infectiologue: {
    label: "Infectiologue",
    metaTitle: "Infectiologue — VIH, immunodépression et dénutrition | Nami",
    metaDescription:
      "VIH, immunodépression, dénutrition associée : coordonnez avec MG, diététicien·ne, psychologue sur Nami.",
    serviceType: "Infectiologie",
    keywords: ["infectiologue", "VIH", "immunodépression", "dénutrition associée"],
  },
  infirmier: {
    label: "Infirmier·ère",
    metaTitle: "Infirmier·ère — coordination clinique et éducation thérapeutique | Nami",
    metaDescription:
      "Soins de coordination, suivi clinique, éducation thérapeutique : centralisez le dossier pluridisciplinaire sur Nami.",
    serviceType: "Soins infirmiers",
    keywords: ["infirmier", "infirmière", "ETP", "éducation thérapeutique", "soins coordination"],
  },
  kinesitherapeute: {
    label: "Kinésithérapeute",
    metaTitle: "Kinésithérapeute — APA, réhabilitation, troubles MS | Nami",
    metaDescription:
      "Réhabilitation, APA, troubles musculo-squelettiques : coordonnez avec MG, rhumatologue, ergothérapeute sur Nami.",
    serviceType: "Kinésithérapie",
    keywords: ["kinésithérapeute", "APA", "réhabilitation", "troubles musculo-squelettiques"],
  },
  "medecin-generaliste": {
    label: "Médecin généraliste",
    metaTitle: "Médecin généraliste — coordination des parcours complexes | Nami",
    metaDescription:
      "Coordination, prévention, pathologies chroniques : adressez et coordonnez votre patientèle pluridisciplinaire sur Nami. Gratuit.",
    serviceType: "Médecine générale",
    keywords: ["médecin généraliste", "MG", "coordination", "prévention", "pathologies chroniques"],
  },
  "medecin-nutritionniste": {
    label: "Médecin nutritionniste",
    metaTitle: "Médecin nutritionniste — obésité complexe, dénutrition | Nami",
    metaDescription:
      "Obésité complexe, dénutrition sévère, nutrition artificielle : coordonnez avec endocrino, diététicien·ne, psychologue sur Nami.",
    serviceType: "Nutrition médicale",
    keywords: ["médecin nutritionniste", "obésité complexe", "dénutrition sévère", "nutrition artificielle"],
  },
  nephrologue: {
    label: "Néphrologue",
    metaTitle: "Néphrologue — coordination maladie rénale chronique | Nami",
    metaDescription:
      "Maladie rénale chronique, nutrition rénale : coordonnez avec MG, diététicien·ne, endocrinologue sur Nami.",
    serviceType: "Néphrologie",
    keywords: ["néphrologue", "maladie rénale chronique", "nutrition rénale"],
  },
  neurologue: {
    label: "Neurologue",
    metaTitle: "Neurologue — coordination épilepsie, SEP, neurodégénératives | Nami",
    metaDescription:
      "Épilepsie, SEP, maladies neurodégénératives : coordonnez avec neuropédiatre, MG, orthophoniste sur Nami.",
    serviceType: "Neurologie",
    keywords: ["neurologue", "épilepsie", "SEP", "maladies neurodégénératives"],
  },
  oncologue: {
    label: "Oncologue",
    metaTitle: "Oncologue — nutrition oncologique et support | Nami",
    metaDescription:
      "Nutrition en oncologie, cachexie, support nutritionnel : coordonnez avec diététicien·ne, MG, psychologue sur Nami.",
    serviceType: "Oncologie",
    keywords: ["oncologue", "nutrition oncologique", "cachexie", "support nutritionnel"],
  },
  orthophoniste: {
    label: "Orthophoniste",
    metaTitle: "Orthophoniste — dysphagie, troubles du langage | Nami",
    metaDescription:
      "Dysphagie, troubles de déglutition, retard de langage : coordonnez avec pédiatre, neurologue, ORL sur Nami.",
    serviceType: "Orthophonie",
    keywords: ["orthophoniste", "dysphagie", "troubles de déglutition", "retard de langage"],
  },
  pediatre: {
    label: "Pédiatre",
    metaTitle: "Pédiatre — coordination pédiatrique pluridisciplinaire | Nami",
    metaDescription:
      "Croissance, APLV, cassure de courbe, nutrition infantile : coordonnez avec MG, diététicien·ne, allergologue sur Nami.",
    serviceType: "Pédiatrie",
    keywords: ["pédiatre", "croissance enfant", "APLV", "cassure de courbe", "nutrition infantile"],
  },
  pneumologue: {
    label: "Pneumologue",
    metaTitle: "Pneumologue — BPCO, mucoviscidose, nutrition respiratoire | Nami",
    metaDescription:
      "BPCO, mucoviscidose, nutrition respiratoire : coordonnez avec MG, diététicien·ne, kiné, infirmier·ère sur Nami.",
    serviceType: "Pneumologie",
    keywords: ["pneumologue", "BPCO", "mucoviscidose", "nutrition respiratoire"],
  },
  podologue: {
    label: "Podologue",
    metaTitle: "Podologue — pied diabétique, troubles podologiques | Nami",
    metaDescription:
      "Pied diabétique, troubles podologiques, rhumatologie : coordonnez avec MG, endocrinologue, rhumatologue sur Nami.",
    serviceType: "Podologie",
    keywords: ["podologue", "pied diabétique", "troubles podologiques"],
  },
  psychiatre: {
    label: "Psychiatre",
    metaTitle: "Psychiatre — coordination TCA, dépression, addictions | Nami",
    metaDescription:
      "TCA, dépression, anxiété, addictions alimentaires : coordonnez avec diététicien·ne, psychologue, MG sur Nami.",
    serviceType: "Psychiatrie",
    keywords: ["psychiatre", "TCA", "dépression", "anxiété", "addictions alimentaires"],
  },
  psychologue: {
    label: "Psychologue",
    metaTitle: "Psychologue — coordination TCA, obésité, thérapies | Nami",
    metaDescription:
      "TCA, obésité, thérapies comportementales : coordonnez avec psychiatre, diététicien·ne, MG sur Nami.",
    serviceType: "Psychologie",
    keywords: ["psychologue", "TCA", "obésité", "thérapies comportementales", "TCC"],
  },
  rhumatologue: {
    label: "Rhumatologue",
    metaTitle: "Rhumatologue — coordination polyarthrite, ostéoporose | Nami",
    metaDescription:
      "Polyarthrite, ostéoporose, maladies inflammatoires : coordonnez avec MG, kiné, diététicien·ne sur Nami.",
    serviceType: "Rhumatologie",
    keywords: ["rhumatologue", "polyarthrite", "ostéoporose", "maladies inflammatoires"],
  },
  "sage-femme": {
    label: "Sage-femme",
    metaTitle: "Sage-femme — nutrition périnatale et grossesse | Nami",
    metaDescription:
      "Nutrition périnatale, grossesse, allaitement : coordonnez avec gynécologue, MG, diététicien·ne sur Nami.",
    serviceType: "Maïeutique",
    keywords: ["sage-femme", "nutrition périnatale", "grossesse", "allaitement"],
  },
}
