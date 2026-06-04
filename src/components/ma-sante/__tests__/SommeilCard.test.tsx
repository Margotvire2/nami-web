import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SommeilCard } from "../SommeilCard";

describe("SommeilCard", () => {
  it("affiche un empty state MDR-safe quand aucune donnée", () => {
    render(
      <SommeilCard
        latestSleepHours={null}
        sleepHours7d={null}
        sleepPoints7d={[]}
      />,
    );
    expect(screen.getByText(/Aucune note récente/i)).toBeInTheDocument();
    expect(screen.getByText(/Notez vos nuits/i)).toBeInTheDocument();
  });

  it("affiche le titre 'Mon sommeil'", () => {
    render(
      <SommeilCard
        latestSleepHours={7.5}
        sleepHours7d={7.2}
        sleepPoints7d={[6, 7.5, 8]}
      />,
    );
    expect(screen.getByText("Mon sommeil")).toBeInTheDocument();
  });

  it("formate '7 h 30' pour 7.5 heures et affiche la moyenne 7 j", () => {
    render(
      <SommeilCard
        latestSleepHours={7.5}
        sleepHours7d={7.2}
        sleepPoints7d={[6, 7.5, 8]}
      />,
    );
    expect(screen.getByText("7 h 30")).toBeInTheDocument();
    expect(screen.getByText("7 h 12")).toBeInTheDocument();
  });

  it("formate '8 h' (sans minutes) pour une valeur entière", () => {
    render(
      <SommeilCard
        latestSleepHours={8}
        sleepHours7d={8}
        sleepPoints7d={[8]}
      />,
    );
    expect(screen.getAllByText("8 h").length).toBeGreaterThan(0);
  });
});
