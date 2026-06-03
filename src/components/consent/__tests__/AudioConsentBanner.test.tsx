import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { AudioConsentBanner } from "../AudioConsentBanner";
import * as apiModule from "@/lib/api";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

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

function mockApi(grantImpl?: (...args: unknown[]) => unknown) {
  const matrixFn = vi.fn().mockResolvedValue({ AI_PROCESSING: { __global__: false } });
  const grantFn = vi.fn().mockImplementation(grantImpl ?? (async () => ({ id: "c1" })));
  vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
    persons: {
      consentsMatrix: matrixFn,
      grantConsent: grantFn,
    },
  } as never);
  return { matrixFn, grantFn };
}

describe("AudioConsentBanner", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when open=false", () => {
    mockApi();
    const Wrapper = makeWrapper();
    const { container } = render(
      <AudioConsentBanner
        patientPersonId="p1"
        patientName="Léa Rousseau"
        open={false}
        onAccepted={() => {}}
        onRefused={() => {}}
        onClose={() => {}}
      />,
      { wrapper: Wrapper },
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("renders dialog with patient name and links to /ai-act when open", () => {
    mockApi();
    const Wrapper = makeWrapper();
    render(
      <AudioConsentBanner
        patientPersonId="p1"
        patientName="Léa Rousseau"
        open
        onAccepted={() => {}}
        onRefused={() => {}}
        onClose={() => {}}
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Léa Rousseau/)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Transparence IA/i });
    expect(link).toHaveAttribute("href", "/ai-act");
  });

  it("Accepter calls grantConsent then onAccepted", async () => {
    const { grantFn } = mockApi();
    const onAccepted = vi.fn();
    const Wrapper = makeWrapper();
    render(
      <AudioConsentBanner
        patientPersonId="p1"
        patientName="Léa Rousseau"
        open
        onAccepted={onAccepted}
        onRefused={() => {}}
        onClose={() => {}}
      />,
      { wrapper: Wrapper },
    );

    fireEvent.click(screen.getByRole("button", { name: /Accepter/i }));

    await waitFor(() => expect(onAccepted).toHaveBeenCalled());
    expect(grantFn).toHaveBeenCalledWith("p1", expect.objectContaining({
      consentType: "AI_PROCESSING",
      granted: true,
      scope: "transcription_audio",
    }));
  });

  it("Refuser calls grantConsent(granted=false) then onRefused", async () => {
    const { grantFn } = mockApi();
    const onRefused = vi.fn();
    const Wrapper = makeWrapper();
    render(
      <AudioConsentBanner
        patientPersonId="p1"
        patientName="Léa Rousseau"
        open
        onAccepted={() => {}}
        onRefused={onRefused}
        onClose={() => {}}
      />,
      { wrapper: Wrapper },
    );

    fireEvent.click(screen.getByRole("button", { name: /Refuser/i }));

    await waitFor(() => expect(onRefused).toHaveBeenCalled());
    expect(grantFn).toHaveBeenCalledWith("p1", expect.objectContaining({
      consentType: "AI_PROCESSING",
      granted: false,
      scope: "transcription_audio",
    }));
  });

  it("surfaces a clear French message when API rejects with 403", async () => {
    const rejection = Object.assign(new Error("forbidden"), {
      status: 403,
      body: { error: "Accès refusé" },
    });
    mockApi(async () => {
      throw rejection;
    });

    const Wrapper = makeWrapper();
    render(
      <AudioConsentBanner
        patientPersonId="p1"
        patientName="Léa Rousseau"
        open
        onAccepted={() => {}}
        onRefused={() => {}}
        onClose={() => {}}
      />,
      { wrapper: Wrapper },
    );

    fireEvent.click(screen.getByRole("button", { name: /Accepter/i }));

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert.textContent ?? "").toMatch(/Mon compte/);
    });
  });
});
