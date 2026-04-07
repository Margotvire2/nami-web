/**
 * NAMI — Stratégie VC-compatible & conforme
 *
 * Comment maximiser la valeur produit pour les investisseurs
 * TOUT EN respectant le cadre réglementaire.
 *
 * Principe : la conformité n'est pas un frein, c'est un MOAT.
 * Un produit santé conforme a une barrière à l'entrée massive.
 */

export interface StrategyItem {
  id: string;
  titre: string;
  /** Le narrative VC */
  narratifVC: string;
  /** Comment le réaliser en restant conforme */
  executionConforme: string;
  /** Ce qu'il NE FAUT PAS dire/faire */
  pieges: string[];
  /** Impact fundraising */
  impactVC: "fort" | "moyen" | "faible";
}

export const vcStrategy: StrategyItem[] = [
  // ========================================================================
  // POSITIONNEMENT GLOBAL
  // ========================================================================
  {
    id: "VC_POSITIONING",
    titre: "Positionnement : 'Infrastructure de coordination' (pas 'outil clinique')",
    narratifVC:
      "Nami est l'infrastructure de coordination des parcours de soins complexes. Comme Slack pour le travail, Nami est le 'tissu connectif' entre les consultations. Le marché est énorme : coordination pluridisciplinaire, parcours chroniques, TCA, obésité, santé mentale — des millions de patients sans outil dédié.",
    executionConforme:
      "Rester fermement dans la 'coordination / organisation / documentation'. C'est un positionnement qui (1) évite le DM, (2) est plus rapide à déployer, (3) a un TAM plus large (pas limité aux actes médicaux remboursés), (4) et permet d'ajouter des briques réglementées plus tard depuis une base installée.",
    pieges: [
      "NE PAS dire : 'on surveille les patients entre deux consultations'",
      "NE PAS dire : 'on détecte les risques / les complications'",
      "NE PAS dire : 'on fait de la télésurveillance light'",
      "NE PAS promettre des outcomes cliniques sans preuves",
    ],
    impactVC: "fort",
  },
  {
    id: "VC_MOAT",
    titre: "La conformité comme MOAT compétitif",
    narratifVC:
      "La conformité santé (HDS, RGPD, anti-DM, RBAC, audit logs) est une barrière à l'entrée massive. Les concurrents qui ne l'ont pas ne peuvent pas vendre aux établissements. Nami est 'built for compliance' dès le jour 1 — c'est un avantage structural, pas un coût.",
    executionConforme:
      "Investir tôt dans : HDS certifié, DPIA, RBAC, audit logs, break-glass, DPA clients. Ce sont des assets commerciaux qui débloquent les ventes B2B santé et les appels d'offres.",
    pieges: [
      "NE PAS présenter la conformité comme 'un truc qu'on fera plus tard'",
      "NE PAS sous-estimer : les établissements éliminent sur HDS/RGPD en premier",
    ],
    impactVC: "fort",
  },

  // ========================================================================
  // STRATÉGIE PRODUIT
  // ========================================================================
  {
    id: "VC_LAND_EXPAND",
    titre: "Land & Expand : coordination d'abord, briques réglementées ensuite",
    narratifVC:
      "V1 = plateforme de coordination (hors DM, déploiement rapide). V2+ = ajout progressif de briques à plus haute valeur (télésurveillance certifiée, IA clinique avec marquage CE) depuis une base installée. C'est le playbook classique : capturer l'usage d'abord, monétiser la valeur clinique ensuite.",
    executionConforme:
      "V1 100% coordination : timeline, notes, tâches, messagerie non urgente, agenda, répertoire neutre, résumés IA (brouillons). V2+ : si besoin d'alertes cliniques ou de scoring → lancer le processus MDR (12-24 mois) depuis une position de force (base installée + données d'usage + feedback clinique).",
    pieges: [
      "NE PAS mettre des features 'DM' en V1 en espérant que 'personne ne regardera'",
      "NE PAS promettre aux investisseurs des features cliniques en V1 si elles nécessitent un marquage CE",
    ],
    impactVC: "fort",
  },
  {
    id: "VC_AI_NARRATIVE",
    titre: "IA : 'productivity layer' (pas 'clinical AI')",
    narratifVC:
      "L'IA de Nami réduit le temps administratif des soignants : résumés automatiques, structuration de dossier, complétude. C'est une couche de productivité, pas de l'IA clinique. Le gain est mesurable : X minutes gagnées par consultation, X% de dossiers mieux documentés.",
    executionConforme:
      "IA = résumé extractif + structuration + complétude admin. Affiché comme brouillon. Validation humaine. Jamais d'interprétation clinique. DPA no-training avec le fournisseur LLM. Traçabilité complète.",
    pieges: [
      "NE PAS dire : 'notre IA détecte les patients à risque'",
      "NE PAS dire : 'notre IA fait du diagnostic assisté'",
      "NE PAS utiliser le mot 'clinical AI' dans le deck",
      "OK de dire : 'notre IA structure et résume les informations existantes pour gagner du temps'",
    ],
    impactVC: "fort",
  },
  {
    id: "VC_DATA_MOAT",
    titre: "Data moat : la coordination génère des données uniques",
    narratifVC:
      "Nami capture des données de coordination qui n'existent nulle part ailleurs : timeline inter-consultations, flux de communication entre pros, parcours patient longitudinaux. C'est un dataset unique pour comprendre les parcours complexes — sans exploiter les données cliniques.",
    executionConforme:
      "Analytics STRICTEMENT techniques et agrégées : nombre de coordinations, temps moyen entre événements, taux de complétude des dossiers, adoption par module. JAMAIS de données cliniques dans les analytics. Pipeline séparé, pseudonymisé, agrégé. Data Use Policy : no training, no benchmarking cross-structure.",
    pieges: [
      "NE PAS promettre du 'benchmarking clinique' ou des 'insights population'",
      "NE PAS entraîner un modèle sur les données clients",
      "NE PAS exploiter les données patient pour de l'analytics produit (sauf métriques techniques anonymisées)",
    ],
    impactVC: "moyen",
  },

  // ========================================================================
  // GO-TO-MARKET
  // ========================================================================
  {
    id: "VC_GTM_SEGMENTS",
    titre: "GTM : commencer par les libéraux / petites structures, pas les CHU",
    narratifVC:
      "Les libéraux et petites structures pluridisciplinaires (cabinets de groupe, MSP, réseaux TCA) ont des besoins urgents de coordination et moins d'exigences d'intégration SI. C'est le meilleur segment pour valider le PMF et accumuler de l'usage avant d'attaquer les établissements.",
    executionConforme:
      "Les libéraux sont RT → Nami ST. Le modèle contractuel est plus simple. HDS + RBAC + DPIA suffisent. Pas besoin d'interop DPI, de SSO d'établissement, ou de marchés publics.",
    pieges: [
      "NE PAS attaquer les CHU en premier (cycles de vente 12-18 mois, exigences SI lourdes)",
      "NE PAS négliger la conformité pour aller vite : même les libéraux sont audités par la CNIL",
    ],
    impactVC: "moyen",
  },
  {
    id: "VC_NOSHOW",
    titre: "No-show / paiement : revenue stream + rétention",
    narratifVC:
      "Le no-show est un vrai problème pour les professionnels (5-15% de consultations perdues). Nami intègre nativement la garantie de RDV via PSP : c'est une source de revenus (commission transaction) et un fort levier de rétention pro.",
    executionConforme:
      "Architecture PSP (Stripe/Adyen), jamais de stockage carte. Consentement explicite patient + conditions claires. Prélèvement déclenché par le pro (pas automatique). Validation déontologique par profession. Désactivé par défaut pour les mineurs.",
    pieges: [
      "NE PAS faire de prélèvement automatique ('si pas check-in → prélève')",
      "NE PAS présenter Nami comme 'recouvrant' des créances",
      "ATTENTION : très sensible en santé (perception 'marchandisation'). Le wording doit être parfait.",
    ],
    impactVC: "moyen",
  },
  {
    id: "VC_NETWORK_EFFECTS",
    titre: "Effets de réseau : répertoire + adressage = flywheel",
    narratifVC:
      "Le répertoire de professionnels + l'adressage inter-pros crée un effet de réseau : plus de pros sur Nami → meilleur adressage → plus de pros rejoignent. C'est une plateforme biface (pro→pro, pro→patient) avec des network effects défendables.",
    executionConforme:
      "Répertoire neutre (alphabétique/distance), filtres objectifs, pas de pay-to-rank. L'adressage est un acte du professionnel. Monétisation indépendante du ranking (abonnement plateforme, pas commission d'adressage). Vérification KYP (RPPS/ADELI) pour la qualité.",
    pieges: [
      "NE JAMAIS monétiser le positionnement dans le répertoire",
      "NE PAS créer de 'marketplace' de soins (c'est un autre cadre réglementaire)",
      "OK de monétiser : abonnement pro, features premium, volume de coordination",
    ],
    impactVC: "fort",
  },

  // ========================================================================
  // MÉTRIQUES & PREUVES
  // ========================================================================
  {
    id: "VC_METRICS",
    titre: "Métriques à présenter aux VCs (conformes)",
    narratifVC:
      "Des métriques d'usage et de valeur mesurables, sans exploitation de données cliniques.",
    executionConforme:
      "Métriques autorisées : DAU/MAU pro, nombre de dossiers actifs, messages de coordination/semaine, taux de complétude des dossiers, temps moyen entre RDV et CR partagé, NPS pro/patient, rétention mensuelle, ARPU, CAC/LTV. Toutes issues de métriques techniques agrégées, pas de données cliniques.",
    pieges: [
      "NE PAS présenter de 'clinical outcomes' sans étude validée",
      "NE PAS utiliser les données patient pour construire des dashboards investisseurs",
      "OK : 'nos utilisateurs documentent 3x plus vite' / 'taux de complétude dossier +40%'",
    ],
    impactVC: "fort",
  },
];

// ============================================================================
// PHRASES CLÉS POUR LE DECK
// ============================================================================

export const deckPhrases = {
  oneLiner:
    "Nami est l'infrastructure de coordination des parcours de soins complexes — le Slack de la santé pluridisciplinaire.",
  problem:
    "Les parcours chroniques et pluridisciplinaires sont fragmentés : information cloisonnée, coordination inexistante entre les consultations, patients livrés à eux-mêmes pour faire circuler l'info.",
  solution:
    "Nami centralise, structure et partage l'information de coordination au sein de l'équipe de prise en charge, entre les consultations.",
  whyNow:
    "Explosion des parcours chroniques (TCA, obésité, santé mentale) + cadre réglementaire enfin stabilisé (MDR, AI Act, HDS) + demande massive des pros pour un outil dédié.",
  moat:
    "Conformité native (HDS, RGPD, anti-DM), effets de réseau (répertoire + adressage), données de coordination uniques.",
  notSaying: [
    "On ne dit PAS : 'on surveille les patients'",
    "On ne dit PAS : 'notre IA détecte les risques'",
    "On ne dit PAS : 'on fait de la télésurveillance'",
    "On dit : 'on facilite la coordination et la continuité informationnelle'",
  ],
};

// ============================================================================
// HELPERS
// ============================================================================

export function getHighImpactStrategies(): StrategyItem[] {
  return vcStrategy.filter((s) => s.impactVC === "fort");
}
