/**
 * Tests de la route /api/contact-support — F-PAGE-CONTACT-SUPPORT-V1.
 *
 * Couvre :
 *  - parseBody() : validation serveur (nom, email, sujet whitelist, message)
 *  - ALLOWED_SUBJECTS : whitelist server-side miroir du client
 *  - constantes rate limit (5 req / heure)
 */

import { describe, it, expect } from "vitest";
import { __test__ } from "../route";

const { parseBody, isValidEmail, ALLOWED_SUBJECTS, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } = __test__;

describe("contact-support — parseBody", () => {
  const valid = {
    name: "Margot Vire",
    email: "margot@nami.fr",
    subject: "soignant",
    message: "Bonjour, je voudrais en savoir plus sur la coordination Nami.",
  };

  it("accepte un payload valide", () => {
    expect(parseBody(valid)).toEqual(valid);
  });

  it("trim les espaces autour des champs", () => {
    expect(
      parseBody({
        ...valid,
        name: "  Margot Vire  ",
        email: "  margot@nami.fr  ",
        message: "  Bonjour, message valide ici.  ",
      }),
    ).toMatchObject({
      name: "Margot Vire",
      email: "margot@nami.fr",
      message: "Bonjour, message valide ici.",
    });
  });

  it("rejette un nom trop court", () => {
    expect(parseBody({ ...valid, name: "A" })).toBeNull();
  });

  it("rejette un nom trop long (>120)", () => {
    expect(parseBody({ ...valid, name: "a".repeat(121) })).toBeNull();
  });

  it("rejette un email invalide", () => {
    expect(parseBody({ ...valid, email: "pas-un-email" })).toBeNull();
  });

  it("rejette un sujet hors whitelist", () => {
    expect(parseBody({ ...valid, subject: "bidon" })).toBeNull();
    expect(parseBody({ ...valid, subject: "" })).toBeNull();
    expect(parseBody({ ...valid, subject: "PATIENT" })).toBeNull();
  });

  it("rejette un message trop court", () => {
    expect(parseBody({ ...valid, message: "Coucou" })).toBeNull();
  });

  it("rejette un message dépassant 4000 chars", () => {
    expect(parseBody({ ...valid, message: "a".repeat(4001) })).toBeNull();
  });

  it("rejette un payload non-objet", () => {
    expect(parseBody(null)).toBeNull();
    expect(parseBody("string")).toBeNull();
    expect(parseBody(42)).toBeNull();
  });

  it("rejette les types incorrects", () => {
    expect(parseBody({ ...valid, name: 42 })).toBeNull();
    expect(parseBody({ ...valid, email: null })).toBeNull();
  });
});

describe("contact-support — isValidEmail", () => {
  it("accepte un email standard", () => {
    expect(isValidEmail("test@nami.fr")).toBe(true);
  });
  it("rejette une string vide", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("contact-support — ALLOWED_SUBJECTS", () => {
  it("contient les 6 sujets attendus (miroir client)", () => {
    expect(ALLOWED_SUBJECTS.size).toBe(6);
    for (const v of ["patient", "soignant", "compte", "rgpd", "partenariat", "autre"]) {
      expect(ALLOWED_SUBJECTS.has(v)).toBe(true);
    }
  });
});

describe("contact-support — rate limit constants", () => {
  it("expose une fenêtre d'1 heure et un quota de 5 messages", () => {
    expect(RATE_LIMIT_WINDOW_MS).toBe(60 * 60 * 1000);
    expect(RATE_LIMIT_MAX).toBe(5);
  });
});
