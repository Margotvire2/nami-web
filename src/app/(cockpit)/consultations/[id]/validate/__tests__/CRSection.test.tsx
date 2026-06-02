import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { CRSection } from "../CRSection";
import * as apiModule from "@/lib/api";
import type { ConsultationDetail, FinalizeConsultationResult } from "@/lib/api";

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

function makeConsultation(over: Partial<ConsultationDetail> = {}): ConsultationDetail {
  return {
    id: "cons-1",
    careCaseId: "case-1",
    providerId: "prov-1",
    appointmentId: null,
    notes: null,
    aiSummary: "Synthèse",
    aiSummaryStatus: "DONE",
    status: "COMPLETED",
    startedAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    completedAt: new Date().toISOString(),
    audioDurationSec: 600,
    generatedNote: {
      id: "note-1",
      body: "Compte-rendu structuré test",
      createdAt: new Date().toISOString(),
    },
    transcript: null,
    audioUrl: null,
    ...over,
  };
}

describe("CRSection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it("displays the brouillon IA badge + body and exposes the finalize CTA", () => {
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      notes: { patch: vi.fn() },
      consultations: { finalize: vi.fn() },
    } as never);

    render(<CRSection consultation={makeConsultation()} careCaseId="case-1" />, {
      wrapper: makeWrapper(),
    });

    expect(screen.getByText(/Brouillon IA — à vérifier/i)).toBeInTheDocument();
    expect(screen.getByText(/Compte-rendu structuré test/i)).toBeInTheDocument();
    expect(screen.getByTestId("cr-finalize")).toBeInTheDocument();
  });

  it("calls consultations.finalize and shows the distribution count on success", async () => {
    const finalize = vi.fn().mockResolvedValue({
      consultationId: "cons-1",
      clinicalNoteId: "note-1",
      wasAlreadyFinalized: false,
      distribution: {
        clinicalNoteId: "note-1",
        careCaseId: "case-1",
        activeMembers: 3,
        optedOut: 0,
        skippedAuthor: 1,
        notificationsCreated: 2,
        notificationsBlockedByPreference: 0,
        durationMs: 12,
      },
    } satisfies FinalizeConsultationResult);

    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      notes: { patch: vi.fn() },
      consultations: { finalize },
    } as never);

    render(<CRSection consultation={makeConsultation()} careCaseId="case-1" />, {
      wrapper: makeWrapper(),
    });

    fireEvent.click(screen.getByTestId("cr-finalize"));

    await waitFor(() => {
      expect(finalize).toHaveBeenCalledWith("case-1", "cons-1");
    });
    await waitFor(() => {
      expect(screen.getByText(/2 membres de l'équipe notifiés/i)).toBeInTheDocument();
    });
  });

  it("enters edit mode and calls notes.patch with the updated body", async () => {
    const patch = vi.fn().mockResolvedValue({
      id: "note-1",
      noteType: "EVOLUTION",
      title: "Compte-rendu",
      body: "Compte-rendu modifié",
      visibility: "CARE_TEAM",
      createdAt: new Date().toISOString(),
      author: { id: "a-1", firstName: "M", lastName: "V" },
    });

    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      notes: { patch },
      consultations: { finalize: vi.fn() },
    } as never);

    render(<CRSection consultation={makeConsultation()} careCaseId="case-1" />, {
      wrapper: makeWrapper(),
    });

    fireEvent.click(screen.getByText(/Modifier/i));
    const editor = screen.getByTestId("cr-editor") as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: "Compte-rendu modifié" } });
    fireEvent.click(screen.getByText(/Enregistrer/i));

    await waitFor(() => {
      expect(patch).toHaveBeenCalledWith("case-1", "note-1", { body: "Compte-rendu modifié" });
    });
  });

  it("falls back to an empty-state message when no generatedNote", () => {
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      notes: { patch: vi.fn() },
      consultations: { finalize: vi.fn() },
    } as never);

    render(
      <CRSection
        consultation={makeConsultation({ generatedNote: null })}
        careCaseId="case-1"
      />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByText(/Aucun compte-rendu n'a été généré/i)).toBeInTheDocument();
    expect(screen.queryByTestId("cr-finalize")).not.toBeInTheDocument();
  });
});
