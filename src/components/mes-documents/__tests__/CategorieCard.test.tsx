import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategorieCard } from "../CategorieCard";
import { GRID_CATEGORIES } from "../grid-categories";

const BILANS = GRID_CATEGORIES.find((c) => c.key === "BILANS")!;

describe("CategorieCard", () => {
  it("affiche le label, l'emoji et le count > 0", () => {
    render(<CategorieCard meta={BILANS} count={7} />);
    expect(screen.getByText("Mes bilans")).toBeInTheDocument();
    expect(screen.getByText("Résultats biologiques")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("affiche 'Aucun document' quand count = 0", () => {
    render(<CategorieCard meta={BILANS} count={0} />);
    expect(screen.getByText("Aucun document")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("génère un href vers /mes-documents?cat=<key>", () => {
    render(<CategorieCard meta={BILANS} count={3} />);
    const link = screen.getByRole("link", { name: /Mes bilans/i });
    expect(link).toHaveAttribute("href", "/mes-documents?cat=BILANS");
  });
});
