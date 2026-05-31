import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { ConsoleStatCard } from "../ConsoleStatCard";

describe("ConsoleStatCard", () => {
  it("rend le label et la valeur", () => {
    render(<ConsoleStatCard icon={Users} label="Membres actifs" value={42} />);
    expect(screen.getByText("Membres actifs")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("affiche le hint quand fourni", () => {
    render(
      <ConsoleStatCard
        icon={Users}
        label="Membres actifs"
        value={3}
        hint="soignants dans la structure"
      />
    );
    expect(screen.getByText("soignants dans la structure")).toBeInTheDocument();
  });

  it("comingSoon → affiche un placeholder et le badge Bientôt", () => {
    render(
      <ConsoleStatCard
        icon={Users}
        label="Actus publiées"
        value={0}
        comingSoon
      />
    );
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText(/bientôt/i)).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
