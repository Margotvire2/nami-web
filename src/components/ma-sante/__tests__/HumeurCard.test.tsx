import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HumeurCard } from "../HumeurCard";

describe("HumeurCard", () => {
  it("affiche un empty state MDR-safe quand aucune donnée", () => {
    render(<HumeurCard moodAvg7d={null} moodPoints7d={[]} />);
    expect(screen.getByText(/Aucune note récente/i)).toBeInTheDocument();
    expect(screen.getByText(/Notez comment vous vous sentez/i)).toBeInTheDocument();
  });

  it("affiche le titre 'Mon humeur'", () => {
    render(<HumeurCard moodAvg7d={4.5} moodPoints7d={[4, 5, 5]} />);
    expect(screen.getByText("Mon humeur")).toBeInTheDocument();
  });

  it("affiche la moyenne 7 j et l'unité /6", () => {
    render(<HumeurCard moodAvg7d={4.5} moodPoints7d={[4, 5, 5]} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText(/\/ 6 · moyenne 7 j/)).toBeInTheDocument();
  });
});
