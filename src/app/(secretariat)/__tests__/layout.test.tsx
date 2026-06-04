import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import SecretariatLayout from "../layout";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/secretariat",
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

// useAuthStore is read both as factory: useAuthStore() and selector:
// useAuthStore((s) => s.x). Cover both call sites used in the layout.
const authState = {
  accessToken: "test-token" as string | null,
  user: {
    id: "sec-1",
    firstName: "Aline",
    lastName: "Dubois",
    email: "aline@cab.fr",
    roleType: "SECRETARY" as "SECRETARY" | "ADMIN" | "PROVIDER" | "PATIENT",
  } as { id: string; firstName: string; lastName: string; email: string; roleType: string } | null,
  logout: vi.fn(),
};

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector?: (s: typeof authState) => unknown) =>
    selector ? selector(authState) : authState,
}));

// SecretaryNotificationBell is exercised by its own tests; here we only assert
// that the layout mounts it. Stub it so the layout test stays focused.
vi.mock("@/components/notifications/SecretaryNotificationBell", () => ({
  SecretaryNotificationBell: () => (
    <button type="button" data-testid="secretary-bell-stub" aria-label="Notifications">
      bell
    </button>
  ),
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

describe("SecretariatLayout", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    authState.accessToken = "test-token";
    authState.user = {
      id: "sec-1",
      firstName: "Aline",
      lastName: "Dubois",
      email: "aline@cab.fr",
      roleType: "SECRETARY",
    };
  });
  afterEach(() => {
    cleanup();
  });

  it("mounts the notification bell in the header when authenticated as SECRETARY", () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <SecretariatLayout>
          <div data-testid="page-content">Agenda</div>
        </SecretariatLayout>
      </Wrapper>,
    );

    expect(screen.getByTestId("secretary-bell-stub")).toBeInTheDocument();
    expect(screen.getByLabelText("En-tête secrétariat")).toBeInTheDocument();
  });

  it("renders the sidebar nav and the children when authenticated", () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <SecretariatLayout>
          <div data-testid="page-content">contenu agenda</div>
        </SecretariatLayout>
      </Wrapper>,
    );

    expect(screen.getByRole("link", { name: /Agenda/ })).toHaveAttribute("href", "/secretariat");
    expect(screen.getByRole("link", { name: /Tâches/ })).toHaveAttribute("href", "/secretariat/taches");
    expect(screen.getByTestId("page-content")).toHaveTextContent("contenu agenda");
  });

  it("renders nothing when there is no access token", () => {
    authState.accessToken = null;

    const Wrapper = makeWrapper();
    const { container } = render(
      <Wrapper>
        <SecretariatLayout>
          <div data-testid="page-content">Agenda</div>
        </SecretariatLayout>
      </Wrapper>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });

  it("redirects to /aujourd-hui when role is not SECRETARY nor ADMIN", () => {
    authState.user = {
      id: "p-1",
      firstName: "Léa",
      lastName: "R",
      email: "lea@x.fr",
      roleType: "PATIENT",
    };

    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <SecretariatLayout>
          <div data-testid="page-content">Agenda</div>
        </SecretariatLayout>
      </Wrapper>,
    );

    expect(replaceMock).toHaveBeenCalledWith("/aujourd-hui");
  });
});
