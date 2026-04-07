/**
 * NAMI — Base de données juridique & réglementaire
 *
 * Point d'entrée unique pour toute la conformité Nami.
 *
 * Usage :
 *   import { legalRegistry, getBlockingActions, checkTextCompliance } from '@/lib/data/legal'
 *
 * Structure :
 *   - legal-registry.ts     → Registre de conformité par module (11 modules)
 *   - forbidden-words.ts    → Lexique de mots interdits / autorisés (lint CI/CD)
 *   - compliance-checklist.ts → Checklist GO/NO-GO par feature
 *   - legal-frameworks.ts   → Cadre juridique théorique (lois, articles, seuils)
 *   - vc-strategy.ts        → Stratégie VC-compatible & conforme
 *
 * Sources :
 *   - Legal Nami (analyse juridique appliquée, avril 2026)
 *   - Cours M2 Droit de la santé numérique, Paris 8 (2024-2025)
 *     - Droit des contrats informatiques appliqués à la santé (Mathilde Croze)
 *     - Droit, numérique et santé / RGPD / CNIL
 *     - Dispositifs médicaux logiciels (MDR, MDCG, ANSM)
 *     - IA en santé (AI Act)
 *     - HDS / Hébergement de données de santé
 *     - Télémédecine / Télésurveillance
 *     - E-santé (bibliographie Irdes)
 */

// Registre de conformité (11 modules)
export {
  legalRegistry,
  getBlockingActions,
  getAllForbiddenWords,
  getAllDisclaimers,
  getModulesByRisk,
  getAllMissingDocuments,
  // Modules individuels
  positioningModule,
  dmBoundaryModule,
  aiModule,
  messagingModule,
  patientJournalModule,
  accessModule,
  notesDocsModule,
  appointmentModule,
  orientationModule,
  hdsModule,
  rgpdModule,
} from "./legal-registry";

// Types
export type {
  RiskLevel,
  ModuleStatus,
  ActionPriority,
  LegalRisk,
  LegalAction,
  WordingRule,
  LegalModule,
} from "./legal-registry";

// Lexique de mots interdits / autorisés
export {
  allForbiddenWords,
  dmRequalificationWords,
  promiseWords,
  aiOutputWords,
  forbiddenVerbs,
  safeWords,
  checkTextCompliance,
  isTextCompliant,
} from "./forbidden-words";

export type { ForbiddenWord } from "./forbidden-words";

// Checklist de conformité par feature
export {
  featureCompliance,
  getBlockedFeatures,
  getConditionalFeatures,
  getUnverifiedChecks,
  getComplianceSummary,
} from "./compliance-checklist";

export type {
  FeatureStatus,
  ComplianceCheck,
  FeatureCompliance,
} from "./compliance-checklist";

// Cadre juridique théorique
export {
  legalFrameworks,
  getFrameworksByTheme,
  getCriticalFrameworks,
  getAllTextes,
} from "./legal-frameworks";

export type { LegalFramework } from "./legal-frameworks";

// Stratégie VC
export {
  vcStrategy,
  deckPhrases,
  getHighImpactStrategies,
} from "./vc-strategy";

export type { StrategyItem } from "./vc-strategy";
