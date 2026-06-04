import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PrintHeader } from "../PrintHeader";

describe("PrintHeader — letterhead Nami", () => {
  it("rend la marque Nami et le tagline générique (pas de PHI)", () => {
    const { container } = render(
      <PrintHeader documentLabel="Compte-rendu de consultation" />,
    );
    expect(container.textContent).toContain("Nami");
    expect(container.textContent).toContain(
      "Coordination des parcours de soins",
    );
    expect(container.textContent).toContain("Compte-rendu de consultation");
  });

  it("affiche la référence interne si fournie", () => {
    const { container } = render(
      <PrintHeader documentLabel="Ordonnance" reference="cons-abc-123" />,
    );
    expect(container.textContent).toContain("Réf. cons-abc-123");
  });

  it("omet la référence si non fournie", () => {
    const { container } = render(
      <PrintHeader documentLabel="Ordonnance" />,
    );
    expect(container.textContent).not.toContain("Réf.");
  });

  it("le bloc est marqué print-only et caché à l'écran", () => {
    const { container } = render(
      <PrintHeader documentLabel="Compte-rendu de consultation" />,
    );
    const root = container.firstElementChild;
    expect(root?.className).toContain("print-only");
    expect(root?.className).toContain("print-letterhead");
    expect(root?.getAttribute("aria-hidden")).toBe("true");
  });

  it("ne contient aucun mot interdit MDR", () => {
    const { container } = render(
      <PrintHeader documentLabel="Compte-rendu de consultation" />,
    );
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\balerte\b/i);
    expect(text).not.toMatch(/\bsurveillance\b/i);
    expect(text).not.toMatch(/\bdétecter\b/i);
    expect(text).not.toMatch(/\bdiagnostic\b/i);
  });
});
