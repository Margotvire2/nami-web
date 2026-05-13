import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge (taches)", () => {
  it("affiche 'À faire' pour PENDING", () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText("À faire")).toBeInTheDocument();
  });

  it("affiche 'En cours' pour IN_PROGRESS", () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText("En cours")).toBeInTheDocument();
  });

  it("affiche 'Terminée' pour COMPLETED", () => {
    render(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText("Terminée")).toBeInTheDocument();
  });

  it("affiche 'Annulée' pour CANCELLED", () => {
    render(<StatusBadge status="CANCELLED" />);
    expect(screen.getByText("Annulée")).toBeInTheDocument();
  });

  it("fallback : affiche la valeur brute pour statut inconnu", () => {
    render(<StatusBadge status="EXOTIC" />);
    expect(screen.getByText("EXOTIC")).toBeInTheDocument();
  });

  it("a un aria-label dédié pour l'accessibilité", () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByLabelText("Statut : À faire")).toBeInTheDocument();
  });

  it("applique la couleur SOLID 'pending' pour PENDING", () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    expect(container.querySelector(".bg-\\[\\#FBF1DD\\]")).toBeTruthy();
    expect(container.querySelector(".text-\\[\\#B07820\\]")).toBeTruthy();
  });

  it("applique la couleur SOLID 'active' pour IN_PROGRESS", () => {
    const { container } = render(<StatusBadge status="IN_PROGRESS" />);
    expect(container.querySelector(".bg-\\[\\#E6F4F1\\]")).toBeTruthy();
    expect(container.querySelector(".text-\\[\\#1a8a7e\\]")).toBeTruthy();
  });

  it("applique la couleur SOLID 'terminal' pour COMPLETED et CANCELLED", () => {
    const { container, rerender } = render(
      <StatusBadge status="COMPLETED" />,
    );
    expect(container.querySelector(".bg-\\[\\#F3F4F6\\]")).toBeTruthy();
    expect(container.querySelector(".text-\\[\\#6B7280\\]")).toBeTruthy();
    rerender(<StatusBadge status="CANCELLED" />);
    expect(container.querySelector(".bg-\\[\\#F3F4F6\\]")).toBeTruthy();
  });
});
