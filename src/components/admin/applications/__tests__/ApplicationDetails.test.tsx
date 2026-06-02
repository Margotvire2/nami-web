import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplicationDetails } from "../ApplicationDetails";
import type { ApplicationDetail } from "@/hooks/useAdminApplications";

const base: ApplicationDetail = {
  id: "app-1",
  proposedName: "CPTS Paris-Sud",
  proposedType: "CPTS",
  proposedSiret: "12345678900012",
  proposedFiness: "750012345",
  proposedAddress: "12 rue de la Santé",
  proposedCity: "Paris",
  proposedZipCode: "75014",
  proposedRegion: "Île-de-France",
  proposedDescription: "Communauté professionnelle territoriale de santé.",
  proposedMissionStatement: "Coordination des soins primaires.",
  proposedSpecialty: "Médecine générale",
  proposedWebsite: "https://cpts-paris-sud.fr",
  proposedSince: "2024-01-15T00:00:00Z",
  proposedTier: "COORDINATION",
  applicantEmail: "marie.dupont@cpts.fr",
  applicantFirstName: "Marie",
  applicantLastName: "Dupont",
  applicantPhone: "+33612345678",
  applicantRoleInOrg: "Coordinatrice",
  applicantHasRpps: true,
  applicantRpps: "10100012345",
  status: "PENDING_REVIEW",
  reviewedByPersonId: null,
  reviewedAt: null,
  reviewNotes: null,
  rejectionReason: null,
  approvedAt: null,
  withdrawnAt: null,
  trackingToken: "tok-xyz",
  createdOrganizationId: null,
  createdAdminPersonId: null,
  acceptedTermsAt: "2026-06-01T10:00:00Z",
  acceptedRgpdAt: "2026-06-01T10:00:00Z",
  cguVersion: "v1.2",
  createdAt: "2026-06-01T10:00:00Z",
  updatedAt: "2026-06-01T10:00:00Z",
  reviewedBy: null,
  createdOrganization: null,
  createdAdminPerson: null,
};

describe("ApplicationDetails", () => {
  it("affiche les sections structure, référent, CGU avec données complètes", () => {
    render(<ApplicationDetails application={base} />);
    expect(screen.getByRole("heading", { level: 1, name: "CPTS Paris-Sud" })).toBeInTheDocument();
    expect(screen.getAllByText(/CPTS/).length).toBeGreaterThan(0);
    expect(screen.getByText("12345678900012")).toBeInTheDocument();
    expect(screen.getByText("750012345")).toBeInTheDocument(); // FINESS
    expect(screen.getByText(/12 rue de la Santé/)).toBeInTheDocument();
    expect(screen.getByText(/75014/)).toBeInTheDocument();
    expect(screen.getByText(/Marie Dupont/)).toBeInTheDocument();
    expect(screen.getByText(/Coordinatrice/)).toBeInTheDocument();
    expect(screen.getByText(/marie\.dupont@cpts\.fr/)).toBeInTheDocument();
    expect(screen.getByText("10100012345")).toBeInTheDocument(); // RPPS
    expect(screen.getByText("v1.2")).toBeInTheDocument(); // CGU version
    expect(screen.getByText(/Offre demandée/i)).toBeInTheDocument(); // tier label rendered
  });

  it("status REJECTED → affiche section motif de rejet", () => {
    render(
      <ApplicationDetails
        application={{
          ...base,
          status: "REJECTED",
          rejectionReason: "SIRET non vérifiable",
        }}
      />,
    );
    expect(screen.getByText(/motif de rejet/i)).toBeInTheDocument();
    expect(screen.getByText(/SIRET non vérifiable/)).toBeInTheDocument();
  });

  it("status APPROVED + createdOrganization + createdAdminPerson → liens vers entités créées", () => {
    render(
      <ApplicationDetails
        application={{
          ...base,
          status: "APPROVED",
          createdOrganizationId: "org-99",
          createdAdminPersonId: "person-99",
          approvedAt: "2026-06-02T10:00:00Z",
          createdOrganization: { id: "org-99", name: "CPTS Paris-Sud", type: "CPTS" },
          createdAdminPerson: {
            id: "person-99",
            firstName: "Marie",
            lastName: "Dupont",
            email: "marie.dupont@cpts.fr",
          },
        }}
      />,
    );
    expect(screen.getByText(/entités créées après approbation/i)).toBeInTheDocument();
    const orgLink = screen.getByRole("link", { name: /CPTS Paris-Sud/i });
    expect(orgLink).toHaveAttribute("href", "/structure/org-99");
    const adminLink = screen.getByRole("link", { name: /Marie Dupont/i });
    expect(adminLink.getAttribute("href")).toContain("personId=person-99");
  });
});
