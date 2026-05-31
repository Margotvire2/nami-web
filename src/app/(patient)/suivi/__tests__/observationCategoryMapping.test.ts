import { describe, it, expect } from "vitest";
import {
  categorizeIndicator,
  shouldShowToPatient,
  needsInterpretationDisclaimer,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type PatientObservationCategory,
} from "../observationCategoryMapping";

describe("categorizeIndicator", () => {
  it("classe le poids en anthropométrie", () => {
    expect(categorizeIndicator({ slug: "poids", label: "Poids" })).toBe("anthropometry");
  });

  it("classe l'IMC en anthropométrie", () => {
    expect(categorizeIndicator({ slug: "imc", label: "IMC" })).toBe("anthropometry");
    expect(categorizeIndicator({ slug: "bmi", label: "Body Mass Index" })).toBe(
      "anthropometry",
    );
  });

  it("classe le tour de taille en anthropométrie", () => {
    expect(
      categorizeIndicator({ slug: "tour-de-taille", label: "Tour de taille" }),
    ).toBe("anthropometry");
  });

  it("classe la masse grasse en composition corporelle", () => {
    expect(
      categorizeIndicator({ slug: "masse-grasse", label: "Masse grasse" }),
    ).toBe("body_composition");
  });

  it("classe une mesure BIA en composition corporelle", () => {
    expect(
      categorizeIndicator({ slug: "bia-eau-corporelle", label: "Eau corporelle (BIA)" }),
    ).toBe("body_composition");
  });

  it("classe la fréquence cardiaque en signes vitaux", () => {
    expect(
      categorizeIndicator({
        slug: "frequence-cardiaque",
        label: "Fréquence cardiaque au repos",
      }),
    ).toBe("vital_signs");
  });

  it("classe la tension artérielle en signes vitaux", () => {
    expect(
      categorizeIndicator({ slug: "tension-systolique", label: "Tension (systolique)" }),
    ).toBe("vital_signs");
  });

  it("classe le potassium en biologie", () => {
    expect(categorizeIndicator({ slug: "potassium", label: "Potassium" })).toBe(
      "biology",
    );
  });

  it("classe la CRP en biologie", () => {
    expect(
      categorizeIndicator({ slug: "crp", label: "C-Réactive Protéine (CRP)" }),
    ).toBe("biology");
  });

  it("classe la créatinine en biologie", () => {
    expect(categorizeIndicator({ slug: "creatinine", label: "Créatinine" })).toBe(
      "biology",
    );
  });

  it("classe la ferritine en biologie", () => {
    expect(categorizeIndicator({ slug: "ferritine", label: "Ferritine" })).toBe(
      "biology",
    );
  });

  it("classe EAT-26 en score", () => {
    expect(categorizeIndicator({ slug: "eat-26", label: "EAT-26" })).toBe("score");
  });

  it("classe BDI en score", () => {
    expect(categorizeIndicator({ slug: "bdi", label: "BDI" })).toBe("score");
  });

  it("retourne other pour un libellé inconnu", () => {
    expect(
      categorizeIndicator({ slug: "indicateur-inconnu", label: "Indicateur inconnu" }),
    ).toBe("other");
  });

  it("priorise biologie sur signes vitaux (hémoglobine glyquée)", () => {
    // HbA1c contient "frequence"? non, mais on s'assure que biologie a la
    // priorité — un libellé biologie ne doit jamais tomber en vital_signs.
    expect(
      categorizeIndicator({ slug: "hba1c", label: "Hémoglobine glyquée HbA1c" }),
    ).toBe("biology");
  });
});

describe("shouldShowToPatient", () => {
  it("affiche anthropométrie", () => {
    expect(shouldShowToPatient("anthropometry")).toBe(true);
  });

  it("affiche composition corporelle", () => {
    expect(shouldShowToPatient("body_composition")).toBe(true);
  });

  it("affiche signes vitaux", () => {
    expect(shouldShowToPatient("vital_signs")).toBe(true);
  });

  it("affiche biologie", () => {
    expect(shouldShowToPatient("biology")).toBe(true);
  });

  it("affiche other", () => {
    expect(shouldShowToPatient("other")).toBe(true);
  });

  it("cache les scores cliniques en V1 launch", () => {
    expect(shouldShowToPatient("score")).toBe(false);
  });
});

describe("needsInterpretationDisclaimer", () => {
  it("exige le disclaimer pour la biologie", () => {
    expect(needsInterpretationDisclaimer("biology")).toBe(true);
  });

  it("n'exige pas le disclaimer pour anthropométrie", () => {
    expect(needsInterpretationDisclaimer("anthropometry")).toBe(false);
  });

  it("n'exige pas le disclaimer pour composition corporelle", () => {
    expect(needsInterpretationDisclaimer("body_composition")).toBe(false);
  });

  it("n'exige pas le disclaimer pour signes vitaux", () => {
    expect(needsInterpretationDisclaimer("vital_signs")).toBe(false);
  });

  it("n'exige pas le disclaimer pour other", () => {
    expect(needsInterpretationDisclaimer("other")).toBe(false);
  });
});

describe("CATEGORY_LABELS — vocabulaire MDR-safe", () => {
  const FORBIDDEN = [
    "anorexie",
    "boulimie",
    "arfid",
    "pica",
    "orthorexie",
    "hyperphagie",
    "dyskaliémie",
    "dyskaliemie",
    "anémie ferriprive",
    "anemie ferriprive",
    "dysmétabolisme",
    "dysmetabolisme",
  ];

  for (const cat of Object.keys(CATEGORY_LABELS) as PatientObservationCategory[]) {
    it(`libellé de "${cat}" ne contient aucun mot clinique anxiogène`, () => {
      const label = CATEGORY_LABELS[cat].toLowerCase();
      for (const word of FORBIDDEN) {
        expect(label).not.toContain(word);
      }
    });
  }
});

describe("CATEGORY_ORDER", () => {
  it("place l'anthropométrie en premier", () => {
    expect(CATEGORY_ORDER[0]).toBe("anthropometry");
  });

  it("place la composition corporelle juste après l'anthropométrie", () => {
    expect(CATEGORY_ORDER[1]).toBe("body_composition");
  });

  it("place les signes vitaux avant la biologie", () => {
    const vitalIdx = CATEGORY_ORDER.indexOf("vital_signs");
    const bioIdx = CATEGORY_ORDER.indexOf("biology");
    expect(vitalIdx).toBeLessThan(bioIdx);
  });

  it("inclut toutes les catégories", () => {
    const all: PatientObservationCategory[] = [
      "anthropometry",
      "body_composition",
      "vital_signs",
      "biology",
      "score",
      "other",
    ];
    for (const cat of all) {
      expect(CATEGORY_ORDER).toContain(cat);
    }
  });
});
