import { describe, it, expect } from "vitest";
import {
  requiresFiness,
  SIRET_REGEX,
  FINESS_REGEX,
  ZIP_REGEX,
  RPPS_REGEX,
  CGU_VERSION,
} from "@/hooks/useSubmitApplication";
import { isValidSiret } from "../SiretInput";
import { isValidFiness } from "../FinessInput";
import { isValidEmail, isValidRpps } from "../ContactSection";

describe("requiresFiness — règle métier (mirror backend)", () => {
  it("retourne true pour HOSPITAL, CLINIC, HEALTH_CENTER, HOSPITAL_SERVICE", () => {
    expect(requiresFiness("HOSPITAL")).toBe(true);
    expect(requiresFiness("CLINIC")).toBe(true);
    expect(requiresFiness("HEALTH_CENTER")).toBe(true);
    expect(requiresFiness("HOSPITAL_SERVICE")).toBe(true);
  });

  it("retourne false pour les structures non sanitaires identifiées", () => {
    expect(requiresFiness("CPTS")).toBe(false);
    expect(requiresFiness("MSP")).toBe(false);
    expect(requiresFiness("NETWORK")).toBe(false);
    expect(requiresFiness("ASSOCIATION")).toBe(false);
    expect(requiresFiness("PRIVATE_PRACTICE")).toBe(false);
    expect(requiresFiness("FEDERATION")).toBe(false);
    expect(requiresFiness("INSTITUTIONNEL")).toBe(false);
    expect(requiresFiness("PROFESSIONAL_GROUP")).toBe(false);
    expect(requiresFiness("ACCELERATEUR")).toBe(false);
  });
});

describe("Regex backend mirror", () => {
  it("SIRET exige exactement 14 chiffres", () => {
    expect(SIRET_REGEX.test("12345678900012")).toBe(true);
    expect(SIRET_REGEX.test("123456789")).toBe(false);
    expect(SIRET_REGEX.test("1234567890001A")).toBe(false);
    expect(SIRET_REGEX.test("123 456 789 00012")).toBe(false); // les espaces doivent être strippés AVANT
  });

  it("FINESS exige exactement 9 chiffres", () => {
    expect(FINESS_REGEX.test("123456789")).toBe(true);
    expect(FINESS_REGEX.test("12345678")).toBe(false);
    expect(FINESS_REGEX.test("1234567890")).toBe(false);
  });

  it("ZIP exige 5 chiffres", () => {
    expect(ZIP_REGEX.test("75001")).toBe(true);
    expect(ZIP_REGEX.test("7500")).toBe(false);
    expect(ZIP_REGEX.test("75001A")).toBe(false);
  });

  it("RPPS exige 11 chiffres", () => {
    expect(RPPS_REGEX.test("12345678901")).toBe(true);
    expect(RPPS_REGEX.test("1234567890")).toBe(false);
  });

  it("CGU_VERSION est défini et non vide", () => {
    expect(CGU_VERSION).toBeDefined();
    expect(CGU_VERSION.length).toBeGreaterThan(0);
  });
});

describe("isValidSiret — accepte la valeur formatée avec espaces", () => {
  it("accepte 14 chiffres bruts", () => {
    expect(isValidSiret("12345678900012")).toBe(true);
  });
  it("accepte 14 chiffres avec espaces (format affiché)", () => {
    expect(isValidSiret("123 456 789 00012")).toBe(true);
  });
  it("rejette une chaîne incomplète", () => {
    expect(isValidSiret("123 456 789")).toBe(false);
  });
  it("rejette une chaîne avec lettres", () => {
    expect(isValidSiret("12345678900A0B")).toBe(false);
  });
});

describe("isValidFiness", () => {
  it("accepte 9 chiffres", () => {
    expect(isValidFiness("123456789")).toBe(true);
  });
  it("rejette 8 chiffres", () => {
    expect(isValidFiness("12345678")).toBe(false);
  });
  it("rejette une chaîne vide", () => {
    expect(isValidFiness("")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepte un email standard", () => {
    expect(isValidEmail("contact@mastructure.fr")).toBe(true);
  });
  it("accepte un email avec plus et sous-domaine", () => {
    expect(isValidEmail("a.b+c@sub.example.co.uk")).toBe(true);
  });
  it("rejette une chaîne sans arobase", () => {
    expect(isValidEmail("contact-mastructure.fr")).toBe(false);
  });
  it("rejette une chaîne sans TLD", () => {
    expect(isValidEmail("contact@mastructure")).toBe(false);
  });
  it("ignore les espaces autour", () => {
    expect(isValidEmail("  contact@mastructure.fr  ")).toBe(true);
  });
});

describe("isValidRpps", () => {
  it("accepte 11 chiffres", () => {
    expect(isValidRpps("12345678901")).toBe(true);
  });
  it("rejette 10 chiffres", () => {
    expect(isValidRpps("1234567890")).toBe(false);
  });
});
