import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventTypeIcon, eventTypeLabel } from "../EventTypeIcon";
import type { EventType } from "@/hooks/useOrgEvents";

describe("EventTypeIcon", () => {
  it.each<EventType>([
    "WEBINAR",
    "RCP_ELARGIE",
    "FORMATION_DPC",
    "WORKING_GROUP_MEET",
    "GENERAL",
  ])("rend l'icône pour %s", (type) => {
    render(<EventTypeIcon type={type} />);
    const el = screen.getByTestId("event-type-icon");
    expect(el).toHaveAttribute("data-type", type);
  });

  it("affiche le label quand showLabel=true", () => {
    render(<EventTypeIcon type="RCP_ELARGIE" showLabel />);
    expect(screen.getByText(/rcp élargie/i)).toBeInTheDocument();
  });

  it("eventTypeLabel renvoie la traduction FR", () => {
    expect(eventTypeLabel("WEBINAR")).toBe("Webinaire");
    expect(eventTypeLabel("FORMATION_DPC")).toBe("Formation DPC");
    expect(eventTypeLabel("WORKING_GROUP_MEET")).toBe("Groupe de travail");
  });
});
