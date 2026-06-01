/**
 * Tests CC #V1-MES-BILANS-CARECASE-GROUPING (Sprint V1.1, suite PR #133).
 *
 * 4 scénarios + wording MDR-safe :
 *  1. Affiche caseTitle dans le header (fallback car patientFacingTitle
 *     n'existe pas sur PatientCareCaseSummary V1)
 *  2. Empty state interne quand 0 bilan rattaché au CareCase
 *  3. Rendu de la liste quand bilans présents
 *  4. HubLinkButton présent + ciblage /parcours/[id]#bilans
 *  5. Wording strict : aucun mot interdit MDR/clinique
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BilansCareCaseSection } from "../BilansCareCaseSection";
import type { PatientBilan, PatientCareCaseSummary } from "@/lib/api";

// ScrollReveal utilise IntersectionObserver — on stub pour jsdom.
vi.mock("@/components/ui/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function makeCareCase(
  id: string,
  caseTitle: string,
): PatientCareCaseSummary {
  return {
    id,
    caseTitle,
    caseType: "OBESITY",
    status: "ACTIVE",
    startDate: "2026-01-01T00:00:00.000Z",
    organizationId: null,
    organizationName: null,
  };
}

function makeBilan(id: string, title: string, careCaseId: string): PatientBilan {
  return {
    id,
    title,
    documentType: "BILAN_BIO",
    fileUrl: `https://example.test/${id}.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 124_500,
    createdAt: "2026-05-15T10:00:00.000Z",
    careCaseId,
    uploadedBy: {
      firstName: "Léa",
      lastName: "Rousseau",
      roleType: "PATIENT",
    },
    analysisStatus: "completed",
    observationsCount: 12,
  };
}

describe("BilansCareCaseSection", () => {
  it("affiche le caseTitle dans le header (V1 sans patientFacingTitle)", () => {
    const careCase = makeCareCase("cc-1", "Parcours coordination ville-hôpital");
    render(
      <BilansCareCaseSection
        careCase={careCase}
        bilans={[makeBilan("b1", "Bilan biologique standard", "cc-1")]}
      />,
    );
    expect(
      screen.getByRole("heading", {
        name: "Parcours coordination ville-hôpital",
      }),
    ).toBeInTheDocument();
  });

  it("affiche l'empty state interne quand aucun bilan", () => {
    const careCase = makeCareCase("cc-2", "Parcours nutrition");
    render(<BilansCareCaseSection careCase={careCase} bilans={[]} />);
    expect(
      screen.getByText(/aucun bilan n'est rattaché à ce parcours/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Aucun bilan")).toBeInTheDocument();
  });

  it("rend la liste des bilans quand fournis", () => {
    const careCase = makeCareCase("cc-3", "Parcours endocrino");
    render(
      <BilansCareCaseSection
        careCase={careCase}
        bilans={[
          makeBilan("b1", "Bilan biologique janvier", "cc-3"),
          makeBilan("b2", "Bilan biologique mars", "cc-3"),
        ]}
      />,
    );
    expect(screen.getByText("Bilan biologique janvier")).toBeInTheDocument();
    expect(screen.getByText("Bilan biologique mars")).toBeInTheDocument();
    expect(screen.getByText("2 bilans")).toBeInTheDocument();
  });

  it("expose un HubLinkButton ciblant /parcours/[id]#bilans", () => {
    const careCase = makeCareCase("cc-4", "Parcours coordination");
    render(
      <BilansCareCaseSection
        careCase={careCase}
        bilans={[makeBilan("b1", "Bilan", "cc-4")]}
      />,
    );
    const link = screen.getByRole("link", {
      name: /ouvrir le parcours parcours coordination/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/parcours/cc-4#bilans");
  });

  it("respecte le wording MDR-safe (aucun mot interdit clinique)", () => {
    const careCase = makeCareCase("cc-5", "Parcours coordination");
    const { container } = render(
      <BilansCareCaseSection
        careCase={careCase}
        bilans={[makeBilan("b1", "Bilan biologique", "cc-5")]}
      />,
    );
    const text = container.textContent ?? "";
    // Mots interdits MDR : surveillance, suivi, vigilance, alerte, anomalie,
    // diagnostic, suspicion, pathologie, anorexie, boulimie, ARFID, hyperphagie.
    expect(text).not.toMatch(
      /surveillance|monitoring|vigilance|alerte|anomalie|suspicion|diagnostic|pathologie|anorexie|boulimie|arfid|hyperphagie/i,
    );
  });
});
