import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyParticipationBadge } from "../MyParticipationBadge";
import type { ParticipantStatus } from "@/hooks/useEvent";

describe("MyParticipationBadge", () => {
  it("rend chaque statut avec son label FR", () => {
    const cases: Array<[ParticipantStatus, RegExp]> = [
      ["REGISTERED", /inscrit/i],
      ["WAITLIST", /liste d'attente/i],
      ["CONFIRMED", /confirmé/i],
      ["CANCELLED", /désinscrit/i],
      ["NO_SHOW", /absent/i],
    ];
    for (const [status, regex] of cases) {
      const { unmount } = render(<MyParticipationBadge status={status} />);
      expect(screen.getByText(regex)).toBeInTheDocument();
      const el = screen.getByTestId("my-participation-badge");
      expect(el).toHaveAttribute("data-status", status);
      unmount();
    }
  });

  it("size=md applique le padding renforcé", () => {
    render(<MyParticipationBadge status="REGISTERED" size="md" />);
    expect(screen.getByTestId("my-participation-badge").className).toMatch(
      /px-2\.5/,
    );
  });
});
