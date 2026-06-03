import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEntityHub } from "../useEntityHub";
import type {
  EntityHubConsultation,
  EntityHubDocument,
  EntityHubProvider as EntityHubProviderPayload,
} from "@/lib/api";

vi.mock("@/lib/store", () => ({
  useAuthStore: (
    selector: (s: { accessToken: string; user: { id: string } }) => unknown,
  ) =>
    selector({
      accessToken: "test-token",
      user: { id: "patient-1" },
    }),
}));

const providerMock = vi.fn();
const consultationMock = vi.fn();
const documentMock = vi.fn();

vi.mock("@/lib/api", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    apiWithToken: () => ({
      patient: {
        careCaseHub: {
          provider: (...args: unknown[]) => providerMock(...args),
          consultation: (...args: unknown[]) => consultationMock(...args),
          document: (...args: unknown[]) => documentMock(...args),
        },
      },
    }),
  };
});

function wrap() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
}

function makeProvider(): EntityHubProviderPayload {
  return {
    provider: {
      id: "prov-1",
      firstName: "Ana",
      lastName: "Doe",
      specialty: "Endocrinologie",
      photoUrl: null,
      locations: [],
    },
    appointments: { upcoming: [], past: [] },
    documents: { sentByMe: [], sharedByThem: [] },
    messages: { threadId: "dm:person-1", unreadCount: 0, lastMessage: null },
    actions: { canBook: true, canDM: true },
  };
}

function makeConsultation(): EntityHubConsultation {
  return {
    consultation: {
      id: "cons-1",
      startedAt: "2026-05-01T10:00:00Z",
      completedAt: "2026-05-01T10:45:00Z",
      status: "COMPLETED",
      provider: {
        id: "prov-1",
        firstName: "Ana",
        lastName: "Doe",
        specialty: "Endocrinologie",
      },
    },
    clinicalNote: null,
    documents: [],
    observations: [],
    nextAppointment: null,
    prescriptions: [],
  };
}

function makeDocument(): EntityHubDocument {
  return {
    document: {
      id: "doc-1",
      documentType: "REPORT",
      title: "CR",
      fileUrl: "https://signed.example/doc-1",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      summaryAi: null,
      createdAt: "2026-05-01T10:00:00Z",
    },
    source: { uploadedBy: "unknown" },
    consultation: null,
    observations: [],
    sharing: { isSharedWithTeam: false, teamMembers: [] },
    signedUrlError: false,
  };
}

beforeEach(() => {
  providerMock.mockReset();
  consultationMock.mockReset();
  documentMock.mockReset();
});

describe("useEntityHub", () => {
  it("ne fetch rien quand target=null (drawer fermé)", async () => {
    const { result } = renderHook(() => useEntityHub(null), { wrapper: wrap() });
    await new Promise((r) => setTimeout(r, 0));
    expect(providerMock).not.toHaveBeenCalled();
    expect(consultationMock).not.toHaveBeenCalled();
    expect(documentMock).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it("route vers le fetcher provider quand type=provider", async () => {
    providerMock.mockResolvedValue(makeProvider());
    const { result } = renderHook(
      () =>
        useEntityHub({
          type: "provider",
          careCaseId: "cc-1",
          entityId: "prov-1",
        }),
      { wrapper: wrap() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(providerMock).toHaveBeenCalledWith("cc-1", "prov-1");
    expect(consultationMock).not.toHaveBeenCalled();
    expect(documentMock).not.toHaveBeenCalled();
    expect(result.current.data?.provider.id).toBe("prov-1");
  });

  it("route vers le fetcher consultation quand type=consultation", async () => {
    consultationMock.mockResolvedValue(makeConsultation());
    const { result } = renderHook(
      () =>
        useEntityHub({
          type: "consultation",
          careCaseId: "cc-1",
          entityId: "cons-1",
        }),
      { wrapper: wrap() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(consultationMock).toHaveBeenCalledWith("cc-1", "cons-1");
    expect(result.current.data?.consultation.id).toBe("cons-1");
  });

  it("route vers le fetcher document quand type=document", async () => {
    documentMock.mockResolvedValue(makeDocument());
    const { result } = renderHook(
      () =>
        useEntityHub({
          type: "document",
          careCaseId: "cc-1",
          entityId: "doc-1",
        }),
      { wrapper: wrap() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(documentMock).toHaveBeenCalledWith("cc-1", "doc-1");
    expect(result.current.data?.document.id).toBe("doc-1");
  });

  it("ne retry pas sur 404 (anti-énumération backend)", async () => {
    const err = Object.assign(new Error("Not found"), { status: 404 });
    providerMock.mockRejectedValue(err);
    const { result } = renderHook(
      () =>
        useEntityHub({
          type: "provider",
          careCaseId: "cc-1",
          entityId: "ghost",
        }),
      { wrapper: wrap() },
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(providerMock).toHaveBeenCalledTimes(1);
  });
});
