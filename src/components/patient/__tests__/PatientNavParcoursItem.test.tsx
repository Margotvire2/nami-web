import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PatientNavParcoursItem } from "../PatientNavParcoursItem";
import type { PatientCareCaseSummary } from "@/lib/api";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockPathname = vi.fn(() => "/accueil");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

const mockCareCases = vi.fn<() => { data: PatientCareCaseSummary[] | undefined; isLoading: boolean }>();

vi.mock("@/hooks/usePatientCareCases", () => ({
  usePatientCareCases: () => mockCareCases(),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function makeCareCase(id: string, title: string): PatientCareCaseSummary {
  return {
    id,
    caseTitle: title,
    caseType: "TCA",
    status: "ACTIVE",
    startDate: "2026-01-01T00:00:00.000Z",
    organizationId: null,
    organizationName: null,
  };
}

beforeEach(() => {
  mockPathname.mockReturnValue("/accueil");
  mockCareCases.mockReset();
});

// ═══════════════════════════════════════════════════════════════════════════
// Test 1 — Branche 0 CareCase : disabled + tooltip "Bientôt — démarrez..."
// ═══════════════════════════════════════════════════════════════════════════

describe("PatientNavParcoursItem", () => {
  it("1. renders disabled with tooltip when 0 CareCase", () => {
    mockCareCases.mockReturnValue({ data: [], isLoading: false });

    renderWithClient(<PatientNavParcoursItem />);

    const node = screen.getByText("Mon parcours").closest('[aria-disabled="true"]');
    expect(node).not.toBeNull();
    expect(node).toHaveAttribute("title", "Bientôt — démarrez avec un soignant");
    // Pas de <a> link — non-cliquable
    expect(screen.queryByRole("link")).toBeNull();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 2 — Branche 1 CareCase : lien direct vers /parcours/[id]
  // ═════════════════════════════════════════════════════════════════════════
  it("2. renders direct link when 1 CareCase", () => {
    mockCareCases.mockReturnValue({
      data: [makeCareCase("cc-abc-1", "Parcours TCA Gabrielle")],
      isLoading: false,
    });

    renderWithClient(<PatientNavParcoursItem />);

    const link = screen.getByRole("link", { name: /Mon parcours/i });
    expect(link).toHaveAttribute("href", "/parcours/cc-abc-1");
    // Label reste "Mon parcours" (pas le caseTitle pour 1 carecase)
    expect(screen.getByText("Mon parcours")).toBeInTheDocument();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 3 — Branche N>1 : "Mes parcours" + badge count
  // ═════════════════════════════════════════════════════════════════════════
  it("3. renders 'Mes parcours' with count badge when N>1", () => {
    mockCareCases.mockReturnValue({
      data: [
        makeCareCase("cc-1", "Parcours A"),
        makeCareCase("cc-2", "Parcours B"),
        makeCareCase("cc-3", "Parcours C"),
      ],
      isLoading: false,
    });

    renderWithClient(<PatientNavParcoursItem />);

    const button = screen.getByRole("button", { name: /Mes parcours/i });
    expect(button).toBeInTheDocument();
    // Badge count visible
    expect(screen.getByLabelText("3 parcours")).toHaveTextContent("3");
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 4 — Accordion toggle on click expands sub-items
  // ═════════════════════════════════════════════════════════════════════════
  it("4. accordion toggle on click expands sub-items", () => {
    mockCareCases.mockReturnValue({
      data: [
        makeCareCase("cc-1", "Parcours A"),
        makeCareCase("cc-2", "Parcours B"),
      ],
      isLoading: false,
    });

    renderWithClient(<PatientNavParcoursItem />);

    const button = screen.getByRole("button", { name: /Mes parcours/i });

    // Par défaut fermé (pathname = /accueil ≠ /parcours)
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Toggle ouverture
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Sous-items visibles dans le DOM
    expect(screen.getByText("Parcours A")).toBeInTheDocument();
    expect(screen.getByText("Parcours B")).toBeInTheDocument();

    // Toggle fermeture
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 5 — Sub-item href matches /parcours/[careCaseId]
  // ═════════════════════════════════════════════════════════════════════════
  it("5. sub-item href matches /parcours/[careCaseId]", () => {
    mockCareCases.mockReturnValue({
      data: [
        makeCareCase("cc-xyz-1", "Premier parcours"),
        makeCareCase("cc-xyz-2", "Second parcours"),
      ],
      isLoading: false,
    });

    renderWithClient(<PatientNavParcoursItem />);

    // Ouvre l'accordéon
    fireEvent.click(screen.getByRole("button", { name: /Mes parcours/i }));

    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/parcours/cc-xyz-1");
    expect(hrefs).toContain("/parcours/cc-xyz-2");
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 6 — Wording strict MDR-safe (aucun terme clinique interdit)
  // ═════════════════════════════════════════════════════════════════════════
  it("6. wording strict — aucun terme clinique interdit", () => {
    const forbiddenTerms = [
      "suspicion",
      "diagnostic",
      "pathologie",
      "anorexie",
      "boulimie",
      "ARFID",
      "hyperphagie",
      "surveillance",
      "monitoring",
      "alerte",
    ];

    // Branche 0
    mockCareCases.mockReturnValue({ data: [], isLoading: false });
    const { unmount: u1 } = renderWithClient(<PatientNavParcoursItem />);
    const text0 = document.body.textContent ?? "";
    for (const term of forbiddenTerms) {
      expect(text0.toLowerCase()).not.toContain(term.toLowerCase());
    }
    u1();

    // Branche N — labels caseTitle inclus mais NEUTRES dans le test
    mockCareCases.mockReturnValue({
      data: [
        makeCareCase("cc-1", "Parcours coordination A"),
        makeCareCase("cc-2", "Parcours coordination B"),
      ],
      isLoading: false,
    });
    const { unmount: u2 } = renderWithClient(<PatientNavParcoursItem />);
    fireEvent.click(screen.getByRole("button", { name: /Mes parcours/i }));
    const textN = document.body.textContent ?? "";
    for (const term of forbiddenTerms) {
      expect(textN.toLowerCase()).not.toContain(term.toLowerCase());
    }
    u2();
  });
});
