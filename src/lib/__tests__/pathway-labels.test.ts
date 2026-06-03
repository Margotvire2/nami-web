import { describe, it, expect } from "vitest";

import {
  PATHWAY_TERMS,
  phaseCountLabel,
  pathwayPhaseLabel,
  stepCountLabel,
} from "@/lib/pathway-labels";

describe("PATHWAY_TERMS", () => {
  it("expose 'phase' comme terme de groupe", () => {
    expect(PATHWAY_TERMS.phaseGroup.singular).toBe("phase");
    expect(PATHWAY_TERMS.phaseGroup.plural).toBe("phases");
  });

  it("expose 'étape' comme terme d'unité", () => {
    expect(PATHWAY_TERMS.stepUnit.singular).toBe("étape");
    expect(PATHWAY_TERMS.stepUnit.plural).toBe("étapes");
  });
});

describe("stepCountLabel", () => {
  it("retourne singulier pour 0 ou 1", () => {
    expect(stepCountLabel(0)).toBe("0 étape");
    expect(stepCountLabel(1)).toBe("1 étape");
  });

  it("retourne pluriel pour 2 ou plus", () => {
    expect(stepCountLabel(2)).toBe("2 étapes");
    expect(stepCountLabel(18)).toBe("18 étapes");
  });
});

describe("phaseCountLabel", () => {
  it("retourne singulier pour 0 ou 1", () => {
    expect(phaseCountLabel(0)).toBe("0 phase");
    expect(phaseCountLabel(1)).toBe("1 phase");
  });

  it("retourne pluriel pour 2 ou plus", () => {
    expect(phaseCountLabel(3)).toBe("3 phases");
  });
});

describe("pathwayPhaseLabel", () => {
  it("retourne 'Sans phase' pour null/undefined/vide", () => {
    expect(pathwayPhaseLabel(null)).toBe("Sans phase");
    expect(pathwayPhaseLabel(undefined)).toBe("Sans phase");
    expect(pathwayPhaseLabel("")).toBe("Sans phase");
  });

  it("résout les codes PCR Obésité (arrêté SFHS2604251A)", () => {
    expect(pathwayPhaseLabel("EVAL_MULTIDIM")).toBe("Évaluation multidimensionnelle");
    expect(pathwayPhaseLabel("SEQ1_INTENSIVE")).toBe("Séquence 1 — Prise en charge initiale intensive");
  });

  it("résout les codes génériques via pathwayFamilyLabels", () => {
    expect(pathwayPhaseLabel("BILAN")).toBe("Bilan");
    expect(pathwayPhaseLabel("ANNONCE_PLAN")).toBe("Annonce du plan de soins");
  });

  it("fallback Title Case pour codes SCREAMING_SNAKE inconnus", () => {
    expect(pathwayPhaseLabel("MON_CODE_INCONNU")).toBe("Mon code inconnu");
  });

  it("garde les chaînes déjà en français", () => {
    expect(pathwayPhaseLabel("Suivi nutritionnel")).toBe("Suivi nutritionnel");
  });
});
