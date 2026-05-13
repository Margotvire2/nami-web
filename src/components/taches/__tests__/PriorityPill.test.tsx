import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriorityPill } from "../PriorityPill";

describe("PriorityPill (taches)", () => {
  it("affiche 'Urgent' pour URGENT", () => {
    render(<PriorityPill priority="URGENT" />);
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });

  it("affiche 'Haute' pour HIGH", () => {
    render(<PriorityPill priority="HIGH" />);
    expect(screen.getByText("Haute")).toBeInTheDocument();
  });

  it("affiche 'Moyenne' pour MEDIUM", () => {
    render(<PriorityPill priority="MEDIUM" />);
    expect(screen.getByText("Moyenne")).toBeInTheDocument();
  });

  it("affiche 'Basse' pour LOW", () => {
    render(<PriorityPill priority="LOW" />);
    expect(screen.getByText("Basse")).toBeInTheDocument();
  });

  it("a un pulse-dot uniquement pour URGENT", () => {
    const { container, rerender } = render(<PriorityPill priority="URGENT" />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
    rerender(<PriorityPill priority="HIGH" />);
    expect(container.querySelector(".animate-pulse")).toBeNull();
    rerender(<PriorityPill priority="MEDIUM" />);
    expect(container.querySelector(".animate-pulse")).toBeNull();
    rerender(<PriorityPill priority="LOW" />);
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });

  it("retourne null pour valeur inconnue (fallback gracieux)", () => {
    const { container } = render(<PriorityPill priority="UNKNOWN_VALUE" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("applique les couleurs SOLID (jamais glass)", () => {
    const { container, rerender } = render(<PriorityPill priority="URGENT" />);
    expect(container.querySelector(".bg-\\[\\#FCE9E9\\]")).toBeTruthy();
    expect(container.querySelector(".text-\\[\\#D14545\\]")).toBeTruthy();
    rerender(<PriorityPill priority="MEDIUM" />);
    expect(container.querySelector(".bg-\\[\\#EFEDF8\\]")).toBeTruthy();
    expect(container.querySelector(".text-\\[\\#5B4EC4\\]")).toBeTruthy();
  });
});
