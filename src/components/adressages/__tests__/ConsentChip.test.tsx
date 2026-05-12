import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConsentChip } from "../ConsentChip";

describe("ConsentChip", () => {
  it("affiche 'Consentement' (vert) pour hasConsent=true", () => {
    const { container } = render(<ConsentChip hasConsent={true} />);
    expect(screen.getByText("Consentement")).toBeInTheDocument();
    expect(container.querySelector(".text-\\[\\#1a8a7e\\]")).toBeTruthy();
  });

  it("affiche 'Consentement manquant' (rouge) pour hasConsent=false", () => {
    const { container } = render(<ConsentChip hasConsent={false} />);
    expect(screen.getByText("Consentement manquant")).toBeInTheDocument();
    expect(container.querySelector(".text-\\[\\#D14545\\]")).toBeTruthy();
  });

  it("affiche 'Consentement à vérifier' (ambre) pour hasConsent=null", () => {
    const { container } = render(<ConsentChip hasConsent={null} />);
    expect(screen.getByText("Consentement à vérifier")).toBeInTheDocument();
    expect(container.querySelector(".text-\\[\\#B07820\\]")).toBeTruthy();
  });

  it("affiche 'Consentement à vérifier' pour undefined", () => {
    render(<ConsentChip hasConsent={undefined} />);
    expect(screen.getByText("Consentement à vérifier")).toBeInTheDocument();
  });

  it("règle d'or MDR : JAMAIS pré-coché par défaut (état null ≠ état true)", () => {
    const { container } = render(<ConsentChip hasConsent={null} />);
    expect(screen.queryByText("Consentement")).toBeNull();
    expect(container.querySelector(".text-\\[\\#1a8a7e\\]")).toBeFalsy();
  });
});
