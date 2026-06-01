/**
 * Tests V1-MES-DOCUMENTS-CARECASE-GROUPING (PR 4 V1.1 cote frontend).
 *
 * 4 scenarios + wording strict MDR-safe :
 *  1. Header rendu : titre du parcours + count + HubLinkButton vers /parcours/[id]#documents
 *  2. Empty state interne : "Aucun document n'est rattache a ce parcours..."
 *  3. Rendu liste : N DocumentCard pour N documents
 *  4. patientFacingTitle prioritaire sur caseTitle quand fourni
 *  5. Wording strict : aucun mot interdit clinique (suspicion, diagnostic, pathologie, etc.)
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { DocumentsCareCaseSection } from "../DocumentsCareCaseSection";
import type { PatientCareCaseSummary, PatientDocument } from "@/lib/api";

// ─── Mock ScrollReveal pour eviter IntersectionObserver en jsdom ─────────
vi.mock("@/components/ui/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-reveal">{children}</div>
  ),
}));

// ─── Helpers fixtures ──────────────────────────────────────────────────────
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

function makeDoc(
  id: string,
  title: string,
  careCaseId: string | null,
  documentType: string = "BIOLOGICAL_REPORT",
): PatientDocument {
  return {
    id,
    title,
    documentType,
    fileUrl: `https://example.test/${id}.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 102400,
    createdAt: "2026-03-15T10:00:00.000Z",
    careCaseId,
    directRecipientPersonId: null,
    attachedCareCaseIds: [],
    uploadedBy: {
      firstName: "Marie",
      lastName: "Soignante",
      roleType: "PROVIDER",
    },
  };
}

describe("DocumentsCareCaseSection", () => {
  // ─── 1. Header avec titre + count + HubLinkButton ─────────────────────
  it("affiche le titre du parcours, le count, et un HubLinkButton vers /parcours/[id]#documents", () => {
    const careCase = makeCareCase("cc-1", "Coordination nutrition");
    const documents = [
      makeDoc("d1", "Bilan biologique janvier", "cc-1"),
      makeDoc("d2", "Bilan biologique fevrier", "cc-1"),
    ];

    render(
      <DocumentsCareCaseSection careCase={careCase} documents={documents} />,
    );

    // Titre = caseTitle (libelle administratif)
    expect(
      screen.getByRole("heading", { name: "Coordination nutrition" }),
    ).toBeInTheDocument();

    // Count "2 documents"
    expect(screen.getByText(/2 documents?/i)).toBeInTheDocument();

    // HubLinkButton : lien href correctement forme, label accessible inclus
    const link = screen.getByRole("link", {
      name: /Ouvrir le parcours Coordination nutrition/i,
    });
    expect(link).toHaveAttribute("href", "/parcours/cc-1#documents");
  });

  // ─── 2. Empty state interne ─────────────────────────────────────────
  it("affiche un message neutre 'Aucun document n'est rattache a ce parcours' quand documents vide", () => {
    const careCase = makeCareCase("cc-2", "Coordination du sommeil");

    render(<DocumentsCareCaseSection careCase={careCase} documents={[]} />);

    // Header toujours visible avec count = 0
    expect(
      screen.getByRole("heading", { name: "Coordination du sommeil" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Aucun document")).toBeInTheDocument();

    // Empty state interne (le libelle s'affiche meme si le count secondaire dit "Aucun document")
    expect(
      screen.getByText(/Aucun document.*rattach.*parcours pour le moment/i),
    ).toBeInTheDocument();

    // Aucune card document
    expect(screen.queryByTestId("scroll-reveal")).not.toBeInTheDocument();
  });

  // ─── 3. Rendu liste N cards ─────────────────────────────────────────
  it("rend une DocumentCard par document quand la liste est non-vide", () => {
    const careCase = makeCareCase("cc-3", "Coordination cardiologie");
    const documents = [
      makeDoc("d1", "Compte-rendu ECG", "cc-3", "ECG_REPORT"),
      makeDoc("d2", "Ordonnance traitement", "cc-3", "PRESCRIPTION"),
      makeDoc("d3", "Imagerie thorax", "cc-3", "IMAGING"),
    ];

    render(
      <DocumentsCareCaseSection careCase={careCase} documents={documents} />,
    );

    // 3 ScrollReveal wrappers (1 par doc)
    const wrappers = screen.getAllByTestId("scroll-reveal");
    expect(wrappers).toHaveLength(3);

    // Chaque titre de doc apparait
    expect(screen.getByText("Compte-rendu ECG")).toBeInTheDocument();
    expect(screen.getByText("Ordonnance traitement")).toBeInTheDocument();
    expect(screen.getByText("Imagerie thorax")).toBeInTheDocument();

    // Count "3 documents"
    expect(screen.getByText(/3 documents?/i)).toBeInTheDocument();
  });

  // ─── 4. patientFacingTitle prioritaire ────────────────────────────────
  it("utilise patientFacingTitle quand fourni, sinon retombe sur caseTitle", () => {
    const careCase = makeCareCase("cc-4", "Cas administratif #4");
    const documents = [makeDoc("d1", "Doc 1", "cc-4")];

    render(
      <DocumentsCareCaseSection
        careCase={careCase}
        documents={documents}
        patientFacingTitle="Mon parcours nutrition"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Mon parcours nutrition" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Cas administratif #4" }),
    ).not.toBeInTheDocument();

    // HubLinkButton utilise le libelle prefere
    const link = screen.getByRole("link", {
      name: /Ouvrir le parcours Mon parcours nutrition/i,
    });
    expect(link).toHaveAttribute("href", "/parcours/cc-4#documents");
  });

  // ─── 5. Wording strict MDR-safe ───────────────────────────────────────
  it("n'expose aucun mot interdit MDR/DM dans le rendu", () => {
    const careCase = makeCareCase("cc-5", "Coordination generale");
    const documents = [
      makeDoc("d1", "Bilan biologique", "cc-5"),
      makeDoc("d2", "Ordonnance", "cc-5", "PRESCRIPTION"),
    ];

    const { container } = render(
      <DocumentsCareCaseSection careCase={careCase} documents={documents} />,
    );

    const text = container.textContent ?? "";
    const forbiddenPatterns = [
      /suspicion/i,
      /diagnostic/i,
      /pathologie/i,
      /anorexie/i,
      /boulimie/i,
      /\bARFID\b/i,
      /hyperphagie/i,
      /surveillance/i,
      /monitoring/i,
      /alerte clinique/i,
      /vigilance/i,
      /scoring/i,
      /detecter/i,
      /pr[eé]venir/i,
      /risque/i,
      /urgence/i,
      /anormal/i,
    ];
    for (const re of forbiddenPatterns) {
      expect(text).not.toMatch(re);
    }
  });
});

// ─── Tests bonus : structure a11y ────────────────────────────────────────
describe("DocumentsCareCaseSection a11y", () => {
  it("expose un <section> avec aria-labelledby pointant vers le h2", () => {
    const careCase = makeCareCase("cc-a11y", "Coordination test");
    const { container } = render(
      <DocumentsCareCaseSection
        careCase={careCase}
        documents={[makeDoc("d1", "Doc 1", "cc-a11y")]}
      />,
    );

    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    const labelledBy = section?.getAttribute("aria-labelledby");
    expect(labelledBy).toBe("documents-care-case-cc-a11y-title");

    const heading = container.querySelector(`#${labelledBy}`);
    expect(heading).not.toBeNull();
    expect(within(heading as HTMLElement).getByText("Coordination test")).toBeInTheDocument();
  });
});
