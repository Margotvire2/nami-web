import { describe, it, expect } from "vitest";
import {
  mapDocTypeToGridCategory,
  isVisiblePatientDoc,
  filterDocsByGridCategory,
  computeGridCounts,
  parseGridCategoryParam,
} from "../grid-categories";

describe("grid-categories — mapDocTypeToGridCategory", () => {
  it("mappe les 4 types principaux sur leur catégorie", () => {
    expect(mapDocTypeToGridCategory("BIOLOGICAL_REPORT")).toBe("BILANS");
    expect(mapDocTypeToGridCategory("PRESCRIPTION")).toBe("ORDONNANCES");
    expect(mapDocTypeToGridCategory("CONSULTATION_REPORT")).toBe("COMPTES_RENDUS");
    expect(mapDocTypeToGridCategory("IMAGING")).toBe("EXAMENS");
  });

  it("bucketise IMAGING/ECG/IMPEDANCE/DXA/HOSPITAL_REPORT dans EXAMENS", () => {
    expect(mapDocTypeToGridCategory("HOSPITAL_REPORT")).toBe("EXAMENS");
    expect(mapDocTypeToGridCategory("ECG_REPORT")).toBe("EXAMENS");
    expect(mapDocTypeToGridCategory("IMPEDANCE_REPORT")).toBe("EXAMENS");
    expect(mapDocTypeToGridCategory("DXA_REPORT")).toBe("EXAMENS");
  });

  it("retourne null pour LETTER, OTHER et TRANSCRIPTION (pas dans grid V1)", () => {
    expect(mapDocTypeToGridCategory("LETTER")).toBeNull();
    expect(mapDocTypeToGridCategory("OTHER")).toBeNull();
    expect(mapDocTypeToGridCategory("TRANSCRIPTION")).toBeNull();
  });

  it("retourne null pour un type inconnu (defensive)", () => {
    expect(mapDocTypeToGridCategory("BOGUS_TYPE")).toBeNull();
  });
});

describe("grid-categories — isVisiblePatientDoc", () => {
  it("masque TRANSCRIPTION", () => {
    expect(isVisiblePatientDoc("TRANSCRIPTION")).toBe(false);
  });

  it("affiche tous les autres types", () => {
    expect(isVisiblePatientDoc("BIOLOGICAL_REPORT")).toBe(true);
    expect(isVisiblePatientDoc("LETTER")).toBe(true);
    expect(isVisiblePatientDoc("OTHER")).toBe(true);
  });
});

describe("grid-categories — filterDocsByGridCategory", () => {
  const docs = [
    { documentType: "BIOLOGICAL_REPORT" },
    { documentType: "BIOLOGICAL_REPORT" },
    { documentType: "PRESCRIPTION" },
    { documentType: "IMAGING" },
    { documentType: "ECG_REPORT" },
    { documentType: "LETTER" },
    { documentType: "TRANSCRIPTION" },
  ];

  it("filtre par BILANS", () => {
    expect(filterDocsByGridCategory(docs, "BILANS")).toHaveLength(2);
  });

  it("filtre par EXAMENS (bucket virtuel IMAGING + ECG)", () => {
    expect(filterDocsByGridCategory(docs, "EXAMENS")).toHaveLength(2);
  });

  it("ALL renvoie tout sauf TRANSCRIPTION", () => {
    const result = filterDocsByGridCategory(docs, "ALL");
    expect(result).toHaveLength(6);
    expect(result.every((d) => d.documentType !== "TRANSCRIPTION")).toBe(true);
  });

  it("ne renvoie jamais TRANSCRIPTION", () => {
    for (const cat of ["BILANS", "ORDONNANCES", "COMPTES_RENDUS", "EXAMENS", "ALL"] as const) {
      const result = filterDocsByGridCategory(docs, cat);
      expect(result.every((d) => d.documentType !== "TRANSCRIPTION")).toBe(true);
    }
  });
});

describe("grid-categories — computeGridCounts", () => {
  it("compte chaque bucket + total ALL (TRANSCRIPTION exclue)", () => {
    const docs = [
      { documentType: "BIOLOGICAL_REPORT" },
      { documentType: "BIOLOGICAL_REPORT" },
      { documentType: "PRESCRIPTION" },
      { documentType: "CONSULTATION_REPORT" },
      { documentType: "HOSPITAL_REPORT" },
      { documentType: "IMAGING" },
      { documentType: "LETTER" },
      { documentType: "TRANSCRIPTION" },
    ];
    const counts = computeGridCounts(docs);
    expect(counts.BILANS).toBe(2);
    expect(counts.ORDONNANCES).toBe(1);
    expect(counts.COMPTES_RENDUS).toBe(1);
    expect(counts.EXAMENS).toBe(2); // HOSPITAL_REPORT + IMAGING
    expect(counts.ALL).toBe(7); // total - 1 transcription
  });

  it("renvoie tous les counts à 0 pour un dataset vide", () => {
    const counts = computeGridCounts([]);
    expect(counts.BILANS).toBe(0);
    expect(counts.ALL).toBe(0);
  });
});

describe("grid-categories — parseGridCategoryParam", () => {
  it("accepte les 5 valeurs valides", () => {
    for (const v of ["BILANS", "ORDONNANCES", "COMPTES_RENDUS", "EXAMENS", "ALL"] as const) {
      expect(parseGridCategoryParam(v)).toBe(v);
    }
  });

  it("renvoie null pour null/vide/inconnu", () => {
    expect(parseGridCategoryParam(null)).toBeNull();
    expect(parseGridCategoryParam("")).toBeNull();
    expect(parseGridCategoryParam("BOGUS")).toBeNull();
    expect(parseGridCategoryParam("bilans")).toBeNull(); // case-sensitive
  });
});
