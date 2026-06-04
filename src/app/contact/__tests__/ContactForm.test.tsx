/**
 * Tests du formulaire de contact support — F-PAGE-CONTACT-SUPPORT-V1.
 *
 * Couvre :
 *   - validateContactForm() : nom, email, sujet, longueur message
 *   - isValidEmail() : edge cases
 *   - isValidSubject() : whitelist côté client
 *   - rendu React : interaction submit + erreurs affichées
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  ContactForm,
  CONTACT_SUBJECTS,
  isValidEmail,
  isValidSubject,
  validateContactForm,
} from "../ContactForm";

describe("isValidEmail", () => {
  it("accepte un email standard", () => {
    expect(isValidEmail("test@nami.fr")).toBe(true);
  });
  it("accepte un email avec sous-domaine et plus-tag", () => {
    expect(isValidEmail("a.b+c@sub.example.co.uk")).toBe(true);
  });
  it("rejette une chaîne sans arobase", () => {
    expect(isValidEmail("test-nami.fr")).toBe(false);
  });
  it("rejette une chaîne sans TLD valide", () => {
    expect(isValidEmail("test@nami")).toBe(false);
  });
  it("ignore les espaces autour", () => {
    expect(isValidEmail("  test@nami.fr  ")).toBe(true);
  });
});

describe("isValidSubject", () => {
  it("accepte chacune des valeurs de CONTACT_SUBJECTS", () => {
    for (const s of CONTACT_SUBJECTS) {
      expect(isValidSubject(s.value)).toBe(true);
    }
  });
  it("rejette une valeur hors whitelist", () => {
    expect(isValidSubject("bidon")).toBe(false);
    expect(isValidSubject("")).toBe(false);
    expect(isValidSubject("PATIENT")).toBe(false);
  });
});

describe("validateContactForm", () => {
  const validValues = {
    name: "Margot Vire",
    email: "margot@nami.fr",
    subject: "soignant" as const,
    message: "Bonjour, je voudrais en savoir plus sur Nami.",
  };

  it("retourne un objet vide quand tout est valide", () => {
    expect(validateContactForm(validValues)).toEqual({});
  });

  it("flag le nom trop court", () => {
    const errors = validateContactForm({ ...validValues, name: "A" });
    expect(errors.name).toBeDefined();
  });

  it("flag l'email invalide", () => {
    const errors = validateContactForm({ ...validValues, email: "pas-un-email" });
    expect(errors.email).toBeDefined();
  });

  it("flag un sujet manquant", () => {
    const errors = validateContactForm({ ...validValues, subject: "" });
    expect(errors.subject).toBeDefined();
  });

  it("flag un message trop court (<10 chars)", () => {
    const errors = validateContactForm({ ...validValues, message: "Coucou" });
    expect(errors.message).toBeDefined();
  });

  it("flag un message dépassant 4000 chars", () => {
    const errors = validateContactForm({
      ...validValues,
      message: "a".repeat(4001),
    });
    expect(errors.message).toBeDefined();
  });
});

describe("ContactForm — rendu et interaction", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      })),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("affiche la bannière d'urgence vitale 15 / 112 / 3114", () => {
    render(<ContactForm />);
    // 15 / 112 / 3114 doivent tous figurer pour respecter la consigne MDR.
    const note = screen.getByRole("note", { name: /urgence vitale/i });
    expect(note).toBeInTheDocument();
    expect(note.textContent).toMatch(/15/);
    expect(note.textContent).toMatch(/112/);
    expect(note.textContent).toMatch(/3114/);
  });

  it("expose l'email support@namipourlavie.com", () => {
    render(<ContactForm />);
    const link = screen.getByRole("link", { name: /support@namipourlavie\.com/i });
    expect(link).toHaveAttribute("href", "mailto:support@namipourlavie.com");
  });

  it("bloque le submit et affiche les erreurs si les champs sont invalides", async () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByRole("button", { name: /Envoyer le message/i }));

    await waitFor(() => {
      expect(screen.getByText(/Merci d'indiquer votre nom/i)).toBeInTheDocument();
      expect(screen.getByText(/Merci d'indiquer un email valide/i)).toBeInTheDocument();
      expect(screen.getByText(/Merci de choisir un sujet/i)).toBeInTheDocument();
      expect(screen.getByText(/au moins 10 caractères/i)).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("POST /api/contact-support avec les bonnes valeurs et affiche le message succès", async () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Nom et prénom/i), { target: { value: "Margot Vire" } });
    fireEvent.change(screen.getByLabelText(/^Email$/i), { target: { value: "margot@nami.fr" } });
    fireEvent.change(screen.getByLabelText(/Sujet/i), { target: { value: "soignant" } });
    fireEvent.change(screen.getByLabelText(/Votre message/i), {
      target: { value: "Bonjour, je voudrais en savoir plus sur la coordination." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Envoyer le message/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/contact-support",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    const fetchCall = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body as string);
    expect(body).toEqual({
      name: "Margot Vire",
      email: "margot@nami.fr",
      subject: "soignant",
      message: "Bonjour, je voudrais en savoir plus sur la coordination.",
    });

    await waitFor(() => {
      expect(screen.getByText(/Message envoyé/i)).toBeInTheDocument();
    });
  });

  it("affiche une erreur quand l'API renvoie 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 429,
        json: async () => ({ error: "rate limit" }),
      })),
    );

    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText(/Nom et prénom/i), { target: { value: "Margot Vire" } });
    fireEvent.change(screen.getByLabelText(/^Email$/i), { target: { value: "margot@nami.fr" } });
    fireEvent.change(screen.getByLabelText(/Sujet/i), { target: { value: "soignant" } });
    fireEvent.change(screen.getByLabelText(/Votre message/i), {
      target: { value: "Bonjour, je voudrais en savoir plus sur la coordination." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Envoyer le message/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toMatch(/Trop de demandes/i);
    });
  });
});
