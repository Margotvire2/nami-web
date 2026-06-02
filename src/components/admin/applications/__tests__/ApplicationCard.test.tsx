import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplicationCard } from "../ApplicationCard";
import type { ApplicationListItem } from "@/hooks/useAdminApplications";

const base: ApplicationListItem = {
  id: "app-1",
  proposedName: "CPTS Paris-Sud",
  proposedType: "CPTS",
  proposedCity: "Paris",
  proposedSiret: "12345678900012",
  applicantEmail: "marie.dupont@cpts.fr",
  applicantFirstName: "Marie",
  applicantLastName: "Dupont",
  applicantRoleInOrg: "Coordinatrice",
  status: "PENDING_REVIEW",
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  reviewedAt: null,
};

describe("ApplicationCard", () => {
  it("affiche nom, type, ville, SIRET et applicant", () => {
    render(<ApplicationCard application={base} />);
    expect(screen.getByText("CPTS Paris-Sud")).toBeInTheDocument();
    expect(screen.getByText(/SIRET 12345678900012/)).toBeInTheDocument();
    expect(screen.getByText(/^Marie Dupont$/)).toBeInTheDocument();
    expect(screen.getByText(/Coordinatrice/)).toBeInTheDocument();
    expect(screen.getByText(/marie\.dupont@cpts\.fr/)).toBeInTheDocument();
  });

  it("badge \"Nouveau\" affiché ssi showNewBadge=true ET status=PENDING_REVIEW", () => {
    const { rerender } = render(<ApplicationCard application={base} showNewBadge />);
    expect(screen.getByTestId("new-badge")).toBeInTheDocument();

    rerender(<ApplicationCard application={base} showNewBadge={false} />);
    expect(screen.queryByTestId("new-badge")).not.toBeInTheDocument();

    rerender(
      <ApplicationCard
        application={{ ...base, status: "IN_REVIEW" }}
        showNewBadge
      />,
    );
    expect(screen.queryByTestId("new-badge")).not.toBeInTheDocument();
  });

  it("href pointe vers /admin/organization-applications/[id]", () => {
    render(<ApplicationCard application={base} />);
    const card = screen.getByTestId("application-card");
    expect(card).toHaveAttribute("href", "/admin/organization-applications/app-1");
  });

  it("StatusBadge inclut le bon data-status", () => {
    render(<ApplicationCard application={{ ...base, status: "IN_REVIEW" }} />);
    const badge = screen.getByTestId("application-status-badge");
    expect(badge).toHaveAttribute("data-status", "IN_REVIEW");
  });
});
