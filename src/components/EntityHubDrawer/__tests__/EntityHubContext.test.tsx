import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  EntityHubProvider,
  useEntityHubControls,
} from "@/contexts/EntityHubContext";

vi.mock("@/lib/store", () => ({
  useAuthStore: (
    selector: (s: { accessToken: string; user: { id: string } }) => unknown,
  ) =>
    selector({
      accessToken: "test-token",
      user: { id: "patient-1" },
    }),
}));

vi.mock("@/lib/api", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    apiWithToken: () => ({
      patient: {
        careCaseHub: {
          provider: vi.fn().mockResolvedValue(null),
          consultation: vi.fn().mockResolvedValue(null),
          document: vi.fn().mockResolvedValue(null),
        },
      },
    }),
  };
});

function wrap() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <EntityHubProvider>{children}</EntityHubProvider>
    </QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
}

describe("EntityHubProvider — back stack", () => {
  it("commence avec stack vide (current=null, canGoBack=false)", () => {
    const { result } = renderHook(() => useEntityHubControls(), {
      wrapper: wrap(),
    });
    expect(result.current.current).toBeNull();
    expect(result.current.canGoBack).toBe(false);
  });

  it("openEntityHub empile une entité (current = top, canGoBack=false sur 1 seul)", () => {
    const { result } = renderHook(() => useEntityHubControls(), {
      wrapper: wrap(),
    });
    act(() => {
      result.current.openEntityHub({
        type: "provider",
        careCaseId: "cc-1",
        entityId: "prov-1",
      });
    });
    expect(result.current.current?.type).toBe("provider");
    expect(result.current.current?.entityId).toBe("prov-1");
    expect(result.current.canGoBack).toBe(false);
  });

  it("empilage successif : canGoBack=true dès 2 entités, current=top", () => {
    const { result } = renderHook(() => useEntityHubControls(), {
      wrapper: wrap(),
    });
    act(() => {
      result.current.openEntityHub({
        type: "provider",
        careCaseId: "cc-1",
        entityId: "prov-1",
      });
    });
    act(() => {
      result.current.openEntityHub({
        type: "consultation",
        careCaseId: "cc-1",
        entityId: "cons-1",
      });
    });
    expect(result.current.current?.type).toBe("consultation");
    expect(result.current.canGoBack).toBe(true);
  });

  it("backEntityHub dépile au précédent (provider → consultation → back = provider)", () => {
    const { result } = renderHook(() => useEntityHubControls(), {
      wrapper: wrap(),
    });
    act(() => {
      result.current.openEntityHub({
        type: "provider",
        careCaseId: "cc-1",
        entityId: "prov-1",
      });
      result.current.openEntityHub({
        type: "consultation",
        careCaseId: "cc-1",
        entityId: "cons-1",
      });
    });
    act(() => {
      result.current.backEntityHub();
    });
    expect(result.current.current?.type).toBe("provider");
    expect(result.current.current?.entityId).toBe("prov-1");
    expect(result.current.canGoBack).toBe(false);
  });

  it("closeEntityHub vide toute la pile", () => {
    const { result } = renderHook(() => useEntityHubControls(), {
      wrapper: wrap(),
    });
    act(() => {
      result.current.openEntityHub({
        type: "provider",
        careCaseId: "cc-1",
        entityId: "prov-1",
      });
      result.current.openEntityHub({
        type: "document",
        careCaseId: "cc-1",
        entityId: "doc-1",
      });
    });
    act(() => {
      result.current.closeEntityHub();
    });
    expect(result.current.current).toBeNull();
    expect(result.current.canGoBack).toBe(false);
  });

  it("back depuis une pile à 1 entité = pile vide (drawer se ferme)", () => {
    const { result } = renderHook(() => useEntityHubControls(), {
      wrapper: wrap(),
    });
    act(() => {
      result.current.openEntityHub({
        type: "provider",
        careCaseId: "cc-1",
        entityId: "prov-1",
      });
    });
    act(() => {
      result.current.backEntityHub();
    });
    expect(result.current.current).toBeNull();
  });
});
