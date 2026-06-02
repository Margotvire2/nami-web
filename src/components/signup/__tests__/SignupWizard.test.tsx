import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SignupWizard } from "../SignupWizard";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), back: vi.fn() }),
}));

function wrap() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
}

describe("SignupWizard — navigation et submit", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("bloque le passage à l'étape 2 tant qu'aucun type n'est choisi", () => {
    render(<SignupWizard />, { wrapper: wrap() });
    fireEvent.click(screen.getByTestId("wizard-next"));
    // Reste à l'étape 1 — message d'erreur visible.
    expect(screen.getByText(/Sélectionnez le type/i)).toBeInTheDocument();
  });

  it("appelle l'API et redirige vers /pour-structures/merci au submit valide", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "app-123",
            status: "PENDING_REVIEW",
            trackingToken: "trk-abc-789",
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        ),
      );

    render(<SignupWizard />, { wrapper: wrap() });

    // Étape 1 — choisir CPTS (pas de FINESS).
    fireEvent.click(screen.getByTestId("org-type-CPTS"));
    fireEvent.click(screen.getByTestId("wizard-next"));

    // Étape 2 — identité légale.
    fireEvent.change(screen.getByTestId("org-name"), {
      target: { value: "CPTS Paris Nord" },
    });
    fireEvent.change(screen.getByTestId("siret-input"), {
      target: { value: "12345678900012" },
    });
    fireEvent.change(screen.getByTestId("org-address"), {
      target: { value: "12 rue de l'Hôpital" },
    });
    fireEvent.change(screen.getByTestId("org-zip"), {
      target: { value: "75001" },
    });
    fireEvent.change(screen.getByTestId("org-city"), {
      target: { value: "Paris" },
    });
    fireEvent.click(screen.getByTestId("wizard-next"));

    // Étape 3 — profil (tout optionnel).
    fireEvent.click(screen.getByTestId("wizard-next"));

    // Étape 4 — contact.
    fireEvent.change(screen.getByTestId("contact-firstname"), {
      target: { value: "Margot" },
    });
    fireEvent.change(screen.getByTestId("contact-lastname"), {
      target: { value: "Vire" },
    });
    fireEvent.change(screen.getByTestId("contact-email"), {
      target: { value: "margot@cpts-pn.fr" },
    });
    fireEvent.change(screen.getByTestId("contact-role"), {
      target: { value: "Coordinateur·rice" },
    });
    fireEvent.click(screen.getByTestId("wizard-next"));

    // Étape 5 — CGU.
    fireEvent.click(screen.getByTestId("cgu-terms"));
    fireEvent.click(screen.getByTestId("cgu-rgpd"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("wizard-submit"));
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/organization-applications$/);
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.proposedType).toBe("CPTS");
    expect(body.proposedSiret).toBe("12345678900012"); // espaces strippés
    expect(body.proposedFiness).toBeNull(); // CPTS n'exige pas FINESS
    expect(body.acceptedTerms).toBe(true);
    expect(body.acceptedRgpd).toBe(true);
    expect(body.cguVersion).toBeTruthy();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/pour-structures/merci?token=trk-abc-789",
      );
    });
  });

  it("affiche le message d'erreur backend en cas de 429", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const onSubmitted = vi.fn();
    render(<SignupWizard onSubmitted={onSubmitted} />, { wrapper: wrap() });

    // Saute étapes 1→4 avec un minimum valide (CPTS, pas de FINESS).
    fireEvent.click(screen.getByTestId("org-type-CPTS"));
    fireEvent.click(screen.getByTestId("wizard-next"));
    fireEvent.change(screen.getByTestId("org-name"), {
      target: { value: "CPTS Test" },
    });
    fireEvent.change(screen.getByTestId("siret-input"), {
      target: { value: "12345678900012" },
    });
    fireEvent.change(screen.getByTestId("org-address"), {
      target: { value: "1 rue Test" },
    });
    fireEvent.change(screen.getByTestId("org-zip"), {
      target: { value: "75001" },
    });
    fireEvent.change(screen.getByTestId("org-city"), {
      target: { value: "Paris" },
    });
    fireEvent.click(screen.getByTestId("wizard-next"));
    fireEvent.click(screen.getByTestId("wizard-next")); // étape 3 vide → 4
    fireEvent.change(screen.getByTestId("contact-firstname"), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByTestId("contact-lastname"), {
      target: { value: "User" },
    });
    fireEvent.change(screen.getByTestId("contact-email"), {
      target: { value: "test@example.fr" },
    });
    fireEvent.change(screen.getByTestId("contact-role"), {
      target: { value: "Coordinateur·rice" },
    });
    fireEvent.click(screen.getByTestId("wizard-next"));
    fireEvent.click(screen.getByTestId("cgu-terms"));
    fireEvent.click(screen.getByTestId("cgu-rgpd"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("wizard-submit"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("api-error")).toBeInTheDocument();
    });
    expect(screen.getByTestId("api-error").textContent).toMatch(/Trop de/i);
    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it("interdit le passage à l'étape 3 si SIRET invalide", () => {
    render(<SignupWizard />, { wrapper: wrap() });
    fireEvent.click(screen.getByTestId("org-type-CPTS"));
    fireEvent.click(screen.getByTestId("wizard-next"));

    fireEvent.change(screen.getByTestId("org-name"), {
      target: { value: "CPTS" },
    });
    fireEvent.change(screen.getByTestId("siret-input"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByTestId("org-address"), {
      target: { value: "1 rue X" },
    });
    fireEvent.change(screen.getByTestId("org-zip"), {
      target: { value: "75001" },
    });
    fireEvent.change(screen.getByTestId("org-city"), {
      target: { value: "Paris" },
    });
    fireEvent.click(screen.getByTestId("wizard-next"));

    expect(screen.getByText(/SIRET invalide/i)).toBeInTheDocument();
  });

  it("exige le FINESS si HOSPITAL choisi à l'étape 1", () => {
    render(<SignupWizard />, { wrapper: wrap() });
    fireEvent.click(screen.getByTestId("org-type-HOSPITAL"));
    fireEvent.click(screen.getByTestId("wizard-next"));

    fireEvent.change(screen.getByTestId("org-name"), {
      target: { value: "Hôpital Test" },
    });
    fireEvent.change(screen.getByTestId("siret-input"), {
      target: { value: "12345678900012" },
    });
    fireEvent.change(screen.getByTestId("org-address"), {
      target: { value: "1 rue X" },
    });
    fireEvent.change(screen.getByTestId("org-zip"), {
      target: { value: "75001" },
    });
    fireEvent.change(screen.getByTestId("org-city"), {
      target: { value: "Paris" },
    });
    // Pas de FINESS → doit bloquer.
    fireEvent.click(screen.getByTestId("wizard-next"));
    expect(screen.getByText(/FINESS requis/i)).toBeInTheDocument();
  });
});
