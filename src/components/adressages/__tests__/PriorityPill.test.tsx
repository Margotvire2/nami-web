import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriorityPill } from "../PriorityPill";

describe("PriorityPill", () => {
  it("affiche 'Urgence' pour EMERGENCY", () => {
    render(<PriorityPill priority="EMERGENCY" />);
    expect(screen.getByText("Urgence")).toBeInTheDocument();
  });

  it("affiche 'Urgent' pour URGENT", () => {
    render(<PriorityPill priority="URGENT" />);
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });

  it("affiche 'Routine' pour ROUTINE", () => {
    render(<PriorityPill priority="ROUTINE" />);
    expect(screen.getByText("Routine")).toBeInTheDocument();
  });

  it("a un pulse-dot uniquement pour EMERGENCY", () => {
    const { container, rerender } = render(<PriorityPill priority="EMERGENCY" />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
    rerender(<PriorityPill priority="URGENT" />);
    expect(container.querySelector(".animate-pulse")).toBeNull();
    rerender(<PriorityPill priority="ROUTINE" />);
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });

  it("applique les couleurs SOLID sacrées (pas glass)", () => {
    const { container, rerender } = render(<PriorityPill priority="EMERGENCY" />);
    expect(container.querySelector(".bg-\\[\\#FCE9E9\\]")).toBeTruthy();
    expect(container.querySelector(".text-\\[\\#D14545\\]")).toBeTruthy();
    rerender(<PriorityPill priority="URGENT" />);
    expect(container.querySelector(".bg-\\[\\#FBEEE7\\]")).toBeTruthy();
    expect(container.querySelector(".text-\\[\\#E07B5C\\]")).toBeTruthy();
    rerender(<PriorityPill priority="ROUTINE" />);
    expect(container.querySelector(".bg-\\[\\#EFEDF8\\]")).toBeTruthy();
    expect(container.querySelector(".text-\\[\\#5B4EC4\\]")).toBeTruthy();
  });
});
