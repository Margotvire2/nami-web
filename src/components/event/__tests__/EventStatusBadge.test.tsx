import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventStatusBadge } from "../EventStatusBadge";

describe("EventStatusBadge", () => {
  it("rend chaque statut avec son label FR", () => {
    const cases: Array<[
      "SCHEDULED" | "OPEN" | "FULL" | "CANCELLED" | "PAST",
      RegExp,
    ]> = [
      ["SCHEDULED", /brouillon/i],
      ["OPEN", /inscriptions ouvertes/i],
      ["FULL", /complet/i],
      ["CANCELLED", /annulé/i],
      ["PAST", /terminé/i],
    ];
    for (const [status, regex] of cases) {
      const { unmount } = render(<EventStatusBadge status={status} />);
      expect(screen.getByText(regex)).toBeInTheDocument();
      const el = screen.getByTestId("event-status-badge");
      expect(el).toHaveAttribute("data-status", status);
      unmount();
    }
  });

  it("supporte size=md (padding renforcé)", () => {
    render(<EventStatusBadge status="OPEN" size="md" />);
    const el = screen.getByTestId("event-status-badge");
    expect(el.className).toMatch(/px-2\.5/);
  });
});
