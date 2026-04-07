import reperageTca from './reperage-tca.json'
import pecInitialeTca from './pec-initiale-tca.json'
import urgencesSomatiquesTca from './urgences-somatiques-tca.json'
import suiviAmbulatoireTca from './suivi-ambulatoire-tca.json'
import complicationsSomatiquesTca from './complications-somatiques-tca.json'
import comorbiditesPsychiatriquesTca from './comorbidites-psychiatriques-tca.json'
import pharmacologieTca from './pharmacologie-tca.json'
import populationsSpecifiquesTca from './populations-specifiques-tca.json'
import annonceAllianceTca from './annonce-alliance-tca.json'
import nutritionRenutritionTca from './nutrition-renutrition-tca.json'
import psychotherapiesTca from './psychotherapies-tca.json'
import etiopathogenieTca from './etiopathogenie-tca.json'
import educationTherapeutiqueTca from './education-therapeutique-tca.json'
import bilansBiologiquesTca from './bilans-biologiques-tca.json'
import protocoleRenutritionChiffres from './protocole-renutrition-chiffres.json'
import parcoursSoinsQuiFaitQuoi from './parcours-soins-qui-fait-quoi.json'
import sensationsAlimentaires from './sensations-alimentaires.json'
import tcaObesite from './tca-obesite.json'
import retablissementChronicite from './retablissement-chronicite.json'
import tcaMiciCoeliaque from './tca-mici-coeliaque.json'
import pecDentaireTca from './pec-dentaire-tca.json'
import consequencesAnDetaillees from './consequences-an-detaillees.json'
import recherchePistesTca from './recherche-pistes-tca.json'
import pecHospitalierePratique from './pec-hospitaliere-pratique.json'
import tcdDetaillee from './tcd-detaillee.json'
import psychopathoAdolescentTca from './psychopatho-adolescent-tca.json'
import neurosciences from './neurosciences-alimentaires.json'
import groupes from './groupes-therapeutiques.json'
import juridique from './aspects-juridiques-tca.json'
import centreExpert from './evaluation-centre-expert.json'
import vieQuotidienne from './vie-quotidienne-tca.json'

export const decisionTrees = {
  'reperage-tca': reperageTca,
  'pec-initiale-tca': pecInitialeTca,
  'urgences-somatiques-tca': urgencesSomatiquesTca,
  'suivi-ambulatoire-tca': suiviAmbulatoireTca,
  'complications-somatiques-tca': complicationsSomatiquesTca,
  'comorbidites-psychiatriques-tca': comorbiditesPsychiatriquesTca,
  'pharmacologie-tca': pharmacologieTca,
  'populations-specifiques-tca': populationsSpecifiquesTca,
  'annonce-alliance-tca': annonceAllianceTca,
  'nutrition-renutrition-tca': nutritionRenutritionTca,
  'psychotherapies-tca': psychotherapiesTca,
  'etiopathogenie-tca': etiopathogenieTca,
  'education-therapeutique-tca': educationTherapeutiqueTca,
  'bilans-biologiques-tca': bilansBiologiquesTca,
  'protocole-renutrition-chiffres': protocoleRenutritionChiffres,
  'parcours-soins-qui-fait-quoi': parcoursSoinsQuiFaitQuoi,
  'sensations-alimentaires': sensationsAlimentaires,
  'tca-obesite': tcaObesite,
  'retablissement-chronicite': retablissementChronicite,
  'tca-mici-coeliaque': tcaMiciCoeliaque,
  'pec-dentaire-tca': pecDentaireTca,
  'consequences-an-detaillees': consequencesAnDetaillees,
  'recherche-pistes-tca': recherchePistesTca,
  'pec-hospitaliere-pratique': pecHospitalierePratique,
  'tcd-detaillee': tcdDetaillee,
  'psychopatho-adolescent-tca': psychopathoAdolescentTca,
  'neurosciences-alimentaires': neurosciences,
  'groupes-therapeutiques': groupes,
  'aspects-juridiques-tca': juridique,
  'evaluation-centre-expert': centreExpert,
  'vie-quotidienne-tca': vieQuotidienne,
} as const

export type DecisionTreeId = keyof typeof decisionTrees

export interface DecisionTreeNode {
  type: 'question' | 'checklist' | 'action' | 'result'
  text: string
  info?: string
  options?: { label: string; description?: string; next: string }[]
  items?: string[]
  actions?: string[]
  sections?: { title: string; items: string[] }[]
  tools?: { name: string; items: string[]; threshold?: string }[]
  severity?: 'critical' | 'high' | 'moderate' | 'low'
  next?: string
}

export interface DecisionTree {
  id: string
  title: string
  version: string
  sources: string[]
  root: string
  nodes: Record<string, DecisionTreeNode>
}
