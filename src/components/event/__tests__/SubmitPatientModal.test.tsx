import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SubmitPatientModal } from "../SubmitPatientModal";
import type { CareCase } from "@/lib/api";

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { accessToken: string }) => unknown) =>
    selector({ accessToken: "test-token" }),
}));

const mockListFn = vi.fn();
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    careCasesApi: {
      ...actual.careCasesApi,
      list: (...args: unknown[]) => mockListFn(...args),
    },
  };
});

function makeCase(overrides: Partial<CareCase> = {}): CareCase {
  return {
    id: "cc-1",
    caseTitle: "Suivi obésité",
    caseType: "OBESITY",
    status: "ACTIVE",
    riskLevel: "UNKNOWN",
    lastActivityAt: null,
    startDate: new Date().toISOString(),
    patient: {
      id: "p-1",
      firstName: "Marc",
      lastName: "Dupont",
      email: "marc@example.com",
    },
    leadProvider: null,
    _count: { members: 2, activities: 5 },
    ...overrides,
  };
}

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
}

describe("SubmitPatientModal", () => {
  beforeEach(() => {
    mockListFn.mockReset();
  });

  it("ne rend rien quand isOpen=false", () => {
    mockListFn.mockResolvedValue([]);
    const { container } = render(
      <SubmitPatientModal
        eventId="e-1"
        eventTitle="RCP TCA"
        isOpen={false}
        onClose={() => {}}
        onSubmit={vi.fn()}
      />,
      { wrapper: makeWrapper() },
    );
    expect(container.firstChild).toBeNull();
  });

  it("affiche l'event title + liste mes care cases", async () => {
    mockListFn.mockResolvedValue([makeCase()]);
    render(
      <SubmitPatientModal
        eventId="e-1"
        eventTitle="RCP TCA juin"
        isOpen
        onClose={() => {}}
        onSubmit={vi.fn()}
      />,
      { wrapper: makeWrapper() },
    );
    expect(screen.getByText(/RCP TCA juin/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/Suivi obésité/i)).toBeInTheDocument(),
    );
  });

  it("empty state quand aucun care case", async () => {
    mockListFn.mockResolvedValue([]);
    render(
      <SubmitPatientModal
        eventId="e-1"
        eventTitle="RCP TCA"
        isOpen
        onClose={() => {}}
        onSubmit={vi.fn()}
      />,
      { wrapper: makeWrapper() },
    );
    await waitFor(() =>
      expect(screen.getByText(/Aucun dossier patient actif/i)).toBeInTheDocument(),
    );
  });

  it("submit désactivé tant que rien n'est sélectionné", async () => {
    mockListFn.mockResolvedValue([makeCase()]);
    render(
      <SubmitPatientModal
        eventId="e-1"
        eventTitle="RCP TCA"
        isOpen
        onClose={() => {}}
        onSubmit={vi.fn()}
      />,
      { wrapper: makeWrapper() },
    );
    await waitFor(() =>
      expect(screen.getByTestId("care-case-picker-item-cc-1")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("submit-patient-confirm")).toBeDisabled();
  });

  it("flow complet : sélection + justification + onSubmit appelé avec payload exact", async () => {
    mockListFn.mockResolvedValue([makeCase()]);
    const onSubmit = vi
      .fn()
      .mockResolvedValue({ id: "sub-1", status: "SUBMITTED" });
    const onClose = vi.fn();
    render(
      <SubmitPatientModal
        eventId="e-1"
        eventTitle="RCP TCA"
        isOpen
        onClose={onClose}
        onSubmit={onSubmit}
      />,
      { wrapper: makeWrapper() },
    );
    await waitFor(() =>
      expect(screen.getByTestId("care-case-picker-item-cc-1")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId("care-case-picker-item-cc-1"));
    fireEvent.change(screen.getByLabelText(/Justification clinique/i), {
      target: { value: "Cas complexe nécessitant un avis pluridisciplinaire" },
    });
    fireEvent.click(screen.getByTestId("submit-patient-confirm"));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        careCaseId: "cc-1",
        reasonForSubmission:
          "Cas complexe nécessitant un avis pluridisciplinaire",
      }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
});
