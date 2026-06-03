import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocumentHubContent } from "../DocumentHubContent";
import type { EntityHubDocument } from "@/lib/api";

// Le composant utilise useEntityHubControls (contexte) pour ouvrir une autre
// fiche au clic sur la consultation/provider. On stub le hook pour rendre les
// tests autonomes — on ne teste ici que le rendu conditionnel signedUrlError.
vi.mock("@/contexts/EntityHubContext", () => ({
  useEntityHubControls: () => ({
    openEntityHub: vi.fn(),
    closeEntityHub: vi.fn(),
    backEntityHub: vi.fn(),
    canGoBack: false,
    current: null,
  }),
}));

function makeDoc(overrides?: Partial<EntityHubDocument>): EntityHubDocument {
  return {
    document: {
      id: "doc-1",
      documentType: "BIOLOGY_REPORT",
      title: "Bilan biologique",
      fileUrl: "https://example.org/signed.pdf?token=abc",
      mimeType: "application/pdf",
      sizeBytes: 12_345,
      summaryAi: null,
      createdAt: new Date("2026-06-01T10:00:00Z").toISOString(),
    },
    source: { uploadedBy: "me" },
    consultation: null,
    observations: [],
    sharing: { isSharedWithTeam: false, teamMembers: [] },
    signedUrlError: false,
    ...overrides,
  };
}

function renderDoc(data: EntityHubDocument) {
  return render(
    <DocumentHubContent
      data={data}
      careCaseId="cc-1"
      onRefetch={() => {}}
    />,
  );
}

describe("DocumentHubContent — signedUrlError", () => {
  it("signedUrlError=false : affiche le bouton \"Ouvrir le document\" et pas de message d'erreur", () => {
    renderDoc(makeDoc({ signedUrlError: false }));
    expect(
      screen.getByRole("button", { name: /ouvrir le document/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/document temporairement inaccessible/i),
    ).not.toBeInTheDocument();
  });

  it("signedUrlError=true : affiche le message \"Document temporairement inaccessible\" et pas de bouton", () => {
    renderDoc(
      makeDoc({
        signedUrlError: true,
        document: {
          ...makeDoc().document,
          fileUrl: "",
        },
      }),
    );
    expect(
      screen.getByText(/document temporairement inaccessible/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ouvrir le document/i }),
    ).not.toBeInTheDocument();
  });
});
