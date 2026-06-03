import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnergieCard } from "../EnergieCard";

describe("EnergieCard", () => {
  it("affiche un empty state quand aucune donnée", () => {
    render(
      <EnergieCard
        latestEnergy={null}
        averageEnergy7d={null}
        energyPoints7d={[]}
      />,
    );
    expect(screen.getByText(/Aucune note récente/i)).toBeInTheDocument();
  });

  it("affiche la dernière énergie et la moyenne 7j", () => {
    render(
      <EnergieCard
        latestEnergy={72}
        averageEnergy7d={55}
        energyPoints7d={[20, 40, 72]}
      />,
    );
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();
  });
});
