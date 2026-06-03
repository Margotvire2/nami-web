import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TendancesCard } from "../TendancesCard";

describe("TendancesCard", () => {
  it("affiche un empty state quand 0 entrée cette semaine", () => {
    render(<TendancesCard entriesCount7d={0} entriesCountPrev7d={0} />);
    expect(screen.getByText(/Aucune note ces 7 derniers jours/i)).toBeInTheDocument();
  });

  it("affiche 'stable' quand la semaine est identique à la précédente", () => {
    render(<TendancesCard entriesCount7d={3} entriesCountPrev7d={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("stable")).toBeInTheDocument();
  });

  it("affiche '+2 cette semaine' quand 5 vs 3 la semaine précédente", () => {
    render(<TendancesCard entriesCount7d={5} entriesCountPrev7d={3} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("+2 cette semaine")).toBeInTheDocument();
  });
});
