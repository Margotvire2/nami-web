/**
 * Tests V2-SUIVI-INDICATEURS-CARECASE-SCOPING (PR-B frontend).
 *
 * 3 scénarios + wording MDR-safe :
 *  1. Indicateurs présents → IndicatorsGrid + HubLinkButton vers le hub
 *  2. Empty state interne → "Aucun indicateur enregistré dans ce parcours"
 *  3. Loading state → spinner role=status visible
 *  + Wording strict : aucun mot clinique côté patient
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SuiviCareCaseSection } from "../SuiviCareCaseSection";
import type { PatientCareCaseSummary, PatientIndicator } from "@/lib/api";

// ─── Mock du hook usePatientObservations ────────────────────────────────────
const mockUseObservations = vi.fn();
vi.mock("@/hooks/usePatientObservations", () => ({
  usePatientObservations: (
    ...args: [string, string?]
  ) => mockUseObservations(...args),
}));

// ─── Helpers fixtures ───────────────────────────────────────────────────────
function makeCareCase(id: string, caseTitle: string): PatientCareCaseSummary {
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

function makeIndicator(slug: string, label: string): PatientIndicator {
  return {
    slug,
    label,
    unit: "kg",
    latestValue: 70,
    latestDate: "2026-05-15",
    trend: "stable",
    measurements: [
      { date: "2026-04-15", value: 70 },
      { date: "2026-05-15", value: 70 },
    ],
  };
}

// ─── Scénarios ──────────────────────────────────────────────────────────────
describe("SuiviCareCaseSection", () => {
  it("affiche le titre, les indicateurs et le HubLinkButton (sectionAnchor=suivi)", () => {
    mockUseObservations.mockReturnValueOnce({
      data: [makeIndicator("poids", "Poids")],
      isLoading: false,
      error: null,
    });
    const cc = makeCareCase("cc-1", "Mon parcours coordination");
    render(<SuiviCareCaseSection careCase={cc} period="3m" />);

    expect(screen.getByText("Mon parcours coordination")).toBeInTheDocument();
    // HubLinkButton pattern : "Voir dans {careCaseLabel} →"
    expect(
      screen.getByLabelText(/Ouvrir le parcours Mon parcours coordination/i),
    ).toBeInTheDocument();
    // Le hook a bien été appelé avec careCaseId scope
    expect(mockUseObservations).toHaveBeenCalledWith("3m", "cc-1");
  });

  it("affiche un empty state interne si aucun indicateur pour ce parcours", () => {
    mockUseObservations.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: null,
    });
    const cc = makeCareCase("cc-empty", "Parcours sans données");
    render(<SuiviCareCaseSection careCase={cc} period="3m" />);

    expect(
      screen.getByText(/Aucun indicateur enregistré dans ce parcours/i),
    ).toBeInTheDocument();
  });

  it("affiche un loading state quand isLoading=true", () => {
    mockUseObservations.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
    });
    const cc = makeCareCase("cc-load", "Parcours chargement");
    render(<SuiviCareCaseSection careCase={cc} period="3m" />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/Chargement des indicateurs/i);
  });

  it("ne contient aucun wording clinique côté patient", () => {
    mockUseObservations.mockReturnValueOnce({
      data: [makeIndicator("poids", "Poids")],
      isLoading: false,
      error: null,
    });
    const cc = makeCareCase("cc-wording", "Mon parcours");
    const { container } = render(
      <SuiviCareCaseSection careCase={cc} period="3m" />,
    );

    const text = container.textContent ?? "";
    const FORBIDDEN = [
      "suspicion",
      "diagnostic",
      "pathologie",
      "anorexie",
      "boulimie",
      "ARFID",
      "hyperphagie",
      "surveillance",
      "monitoring",
      "alerte clinique",
    ];
    for (const word of FORBIDDEN) {
      expect(text.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });
});
