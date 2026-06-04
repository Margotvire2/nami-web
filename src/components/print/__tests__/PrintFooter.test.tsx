import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PrintFooter } from "../PrintFooter";

describe("PrintFooter — pied de page imprimable", () => {
  it("affiche la date d'édition au format fr-FR", () => {
    const fixed = new Date("2026-06-04T10:00:00Z");
    const { container } = render(<PrintFooter date={fixed} />);
    // Format attendu : "4 juin 2026" (fr-FR long).
    expect(container.textContent).toMatch(/Édité le \d+ \w+ \d{4}/);
  });

  it("utilise le signatureLabel par défaut 'Signature'", () => {
    const { container } = render(<PrintFooter />);
    expect(container.textContent).toContain("Signature");
  });

  it("accepte un signatureLabel personnalisé (nom du prescripteur)", () => {
    const { container } = render(
      <PrintFooter signatureLabel="Signature — Dr Marie Dubois" />,
    );
    expect(container.textContent).toContain("Signature — Dr Marie Dubois");
  });

  it("affiche la mention légale 'Nami n'est pas un dispositif médical'", () => {
    const { container } = render(<PrintFooter />);
    expect(container.textContent).toContain(
      "Nami n'est pas un dispositif médical",
    );
  });

  it("le bloc est marqué print-only et caché à l'écran", () => {
    const { container } = render(<PrintFooter />);
    const root = container.firstElementChild;
    expect(root?.className).toContain("print-only");
    expect(root?.className).toContain("print-footer");
    expect(root?.getAttribute("aria-hidden")).toBe("true");
  });

  it("ne contient aucun mot interdit MDR", () => {
    const { container } = render(<PrintFooter />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\balerte\b/i);
    expect(text).not.toMatch(/\bsurveillance\b/i);
    expect(text).not.toMatch(/\bdétecter\b/i);
    expect(text).not.toMatch(/\bdiagnostic\b/i);
    expect(text).not.toMatch(/\banormal\b/i);
  });
});
