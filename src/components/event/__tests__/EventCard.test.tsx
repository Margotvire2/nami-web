import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCard } from "../EventCard";
import type { EventListItem } from "@/hooks/useOrgEvents";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function makeEvent(overrides: Partial<EventListItem> = {}): EventListItem {
  const start = new Date(Date.now() + 86_400_000).toISOString(); // demain
  const end = new Date(Date.now() + 86_400_000 + 3_600_000).toISOString();
  return {
    id: "evt_1",
    type: "RCP_ELARGIE",
    title: "RCP TCA juin",
    description: null,
    startAt: start,
    endAt: end,
    format: "VISIO",
    locationLabel: null,
    visioUrl: "https://meet.example.com/x",
    visibility: "ORGANIZATION_MEMBERS",
    status: "PUBLISHED",
    maxParticipants: null,
    isDpcEligible: false,
    dpcReferenceCode: null,
    workingGroupConvId: null,
    acceptsPatientSubmissions: false,
    patientSubmissionDeadline: null,
    cancelledAt: null,
    cancelReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: { id: "u1", firstName: "Alice", lastName: "Doe", photoUrl: null },
    _count: { participants: 3, patientSubmissions: 0 },
    ...overrides,
  };
}

describe("EventCard", () => {
  it("rend le titre et le type", () => {
    render(<EventCard event={makeEvent()} href="/evt/1" />);
    expect(screen.getByText("RCP TCA juin")).toBeInTheDocument();
    expect(screen.getByText(/rcp élargie/i)).toBeInTheDocument();
  });

  it("statut UI = OPEN pour PUBLISHED dans le futur sans cap", () => {
    render(<EventCard event={makeEvent()} href="/x" />);
    expect(screen.getByText(/inscriptions ouvertes/i)).toBeInTheDocument();
  });

  it("statut UI = FULL quand maxParticipants atteint", () => {
    render(
      <EventCard
        event={makeEvent({ maxParticipants: 3, _count: { participants: 3, patientSubmissions: 0 } })}
        href="/x"
      />,
    );
    expect(screen.getByText(/complet/i)).toBeInTheDocument();
  });

  it("statut UI = CANCELLED quand status=CANCELLED", () => {
    render(
      <EventCard event={makeEvent({ status: "CANCELLED" })} href="/x" />,
    );
    expect(screen.getByText(/annulé/i)).toBeInTheDocument();
  });

  it("affiche le badge DPC quand isDpcEligible", () => {
    render(
      <EventCard
        event={makeEvent({ isDpcEligible: true, dpcReferenceCode: "DPC-2026-001" })}
        href="/x"
      />,
    );
    expect(screen.getByText(/éligible dpc/i)).toBeInTheDocument();
    expect(screen.getByText(/dpc-2026-001/i)).toBeInTheDocument();
  });

  it("asLink=false → rend une carte non cliquable", () => {
    render(<EventCard event={makeEvent()} asLink={false} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("affiche le compteur de soumissions quand acceptsPatientSubmissions", () => {
    render(
      <EventCard
        event={makeEvent({
          acceptsPatientSubmissions: true,
          _count: { participants: 5, patientSubmissions: 2 },
        })}
        href="/x"
      />,
    );
    expect(screen.getByText(/2 dossiers soumis/i)).toBeInTheDocument();
  });
});
