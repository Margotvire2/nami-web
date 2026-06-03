import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategorieFilter } from "../CategorieFilter";

const counts = {
  BILANS: 4,
  ORDONNANCES: 2,
  COMPTES_RENDUS: 1,
  EXAMENS: 0,
  ALL: 7,
};

describe("CategorieFilter", () => {
  it("rend les 5 chips (4 catégories + Tous) avec leur count", () => {
    render(<CategorieFilter current="BILANS" counts={counts} />);
    expect(screen.getByRole("link", { name: /Mes bilans/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mes ordonnances/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mes comptes-rendus/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mes examens/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tous mes documents/i })).toBeInTheDocument();
  });

  it("marque la chip active avec aria-current=page", () => {
    render(<CategorieFilter current="BILANS" counts={counts} />);
    const active = screen.getByRole("link", { name: /Mes bilans/i });
    expect(active).toHaveAttribute("aria-current", "page");

    const other = screen.getByRole("link", { name: /Mes ordonnances/i });
    expect(other).not.toHaveAttribute("aria-current");
  });

  it("affiche un lien retour vers la grid racine /mes-documents", () => {
    render(<CategorieFilter current="ALL" counts={counts} />);
    const back = screen.getByRole("link", { name: /Retour à toutes les catégories/i });
    expect(back).toHaveAttribute("href", "/mes-documents");
  });
});
