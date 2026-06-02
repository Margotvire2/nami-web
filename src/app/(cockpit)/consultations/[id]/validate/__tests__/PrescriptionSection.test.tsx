import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { PrescriptionSection } from "../PrescriptionSection";
import * as apiModule from "@/lib/api";
import type { PrescriptionDraft } from "@/lib/api";

vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({ accessToken: "test-token" }),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
}

function makeDraft(over: Partial<PrescriptionDraft> = {}): PrescriptionDraft {
  return {
    id: "draft-1",
    careCaseId: "case-1",
    patientId: "p-1",
    prescriberId: "doc-1",
    clinicalNoteId: "note-1",
    sourceTranscriptDocId: null,
    status: "DRAFT",
    content: {
      medications: [
        {
          name: "Sertraline",
          genericName: null,
          brandName: null,
          dosage: "50 mg",
          form: "comprimé",
          route: "oral",
          frequency: "1x/jour",
          duration: "30 jours",
          startDate: null,
          instructions: "Le matin",
          confidence: 0.92,
          sourceSpan: "…",
        },
      ],
      complementaryActs: [],
      warnings: [],
    },
    extractionConfidence: 0.9,
    prescriberNotes: null,
    signedAt: null,
    signatureMethod: null,
    signatureHash: null,
    pdfDocumentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...over,
  };
}

describe("PrescriptionSection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders the medication list and the sign CTA for a DRAFT", async () => {
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      prescriptionDrafts: {
        list: vi.fn().mockResolvedValue({ drafts: [makeDraft()], count: 1 }),
        sign: vi.fn(),
      },
    } as never);

    render(
      <PrescriptionSection careCaseId="case-1" clinicalNoteId="note-1" />,
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByText(/Sertraline/i)).toBeInTheDocument();
    });
    expect(screen.getByTestId("prescription-sign")).toBeInTheDocument();
  });

  it("calls prescriptionDrafts.sign on confirm and shows success state", async () => {
    const sign = vi.fn().mockResolvedValue({
      ok: true,
      draft: { ...makeDraft(), status: "SIGNED" },
      pdfUrl: "https://example/pdf",
      pdfDocumentId: "doc-1",
      signedAt: new Date().toISOString(),
    });

    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      prescriptionDrafts: {
        list: vi.fn().mockResolvedValue({ drafts: [makeDraft()], count: 1 }),
        sign,
      },
    } as never);

    render(
      <PrescriptionSection careCaseId="case-1" clinicalNoteId="note-1" />,
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByTestId("prescription-sign")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("prescription-sign"));
    fireEvent.click(screen.getByTestId("prescription-sign-confirm"));

    await waitFor(() => {
      expect(sign).toHaveBeenCalledWith("draft-1");
    });
    await waitFor(() => {
      expect(screen.getByText(/Ordonnance signée/i)).toBeInTheDocument();
    });
  });

  it("filters out drafts whose clinicalNoteId does not match the consultation", async () => {
    const otherNote = makeDraft({ id: "draft-other", clinicalNoteId: "note-OTHER" });
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      prescriptionDrafts: {
        list: vi.fn().mockResolvedValue({ drafts: [otherNote], count: 1 }),
        sign: vi.fn(),
      },
    } as never);

    render(
      <PrescriptionSection careCaseId="case-1" clinicalNoteId="note-1" />,
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Aucune ordonnance détectée pour cette consultation/i),
      ).toBeInTheDocument();
    });
  });

  it("returns null when provider is not a prescriber (403)", async () => {
    const error = Object.assign(new Error("Forbidden"), { status: 403 });
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      prescriptionDrafts: {
        list: vi.fn().mockRejectedValue(error),
        sign: vi.fn(),
      },
    } as never);

    const { container } = render(
      <PrescriptionSection careCaseId="case-1" clinicalNoteId="note-1" />,
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
