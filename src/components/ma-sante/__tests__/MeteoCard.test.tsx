import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MeteoCard } from "../MeteoCard";

describe("MeteoCard", () => {
  it("affiche le label MDR-safe 'Belle journée' pour sunny", () => {
    render(<MeteoCard mood="sunny" />);
    expect(screen.getByText("Belle journée")).toBeInTheDocument();
  });

  it("affiche le label 'Plus difficile aujourd'hui' pour rainy", () => {
    render(<MeteoCard mood="rainy" />);
    expect(screen.getByText("Plus difficile aujourd'hui")).toBeInTheDocument();
  });

  it("affiche un empty state explicite quand mood est null", () => {
    render(<MeteoCard mood={null} />);
    expect(screen.getByText(/Aucune note récente/i)).toBeInTheDocument();
  });
});
