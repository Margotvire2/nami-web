import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MonComptePage from "../page";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockPatchPerson = vi.fn();
const mockPatientMe = vi.fn();
const mockForgotPassword = vi.fn();

vi.mock("@/lib/api", () => ({
  apiWithToken: () => ({
    patient: { me: mockPatientMe },
    persons: { patch: mockPatchPerson },
  }),
  authApi: {
    forgotPassword: (email: string) => mockForgotPassword(email),
  },
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({
      accessToken: "test-token",
      user: {
        id: "u1",
        firstName: "Marie",
        lastName: "Dubois",
        email: "marie@example.com",
        roleType: "PATIENT",
      },
      logout: vi.fn(),
    }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const FAKE_ME = {
  person: {
    id: "u1",
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie@example.com",
    phone: "0612345678",
    birthDate: "1985-04-12T00:00:00.000Z",
    sex: "FEMALE",
    photoUrl: null,
  },
  careCases: [
    {
      id: "cc1",
      caseTitle: "Suivi nutrition",
      caseType: "NUTRITION",
      status: "ACTIVE",
      startDate: "2024-01-15T00:00:00.000Z",
      members: [{ id: "m1", personId: "p1", roleInCase: "LEAD", person: {} }],
    },
  ],
};

beforeEach(() => {
  mockPatchPerson.mockReset();
  mockPatientMe.mockReset();
  mockForgotPassword.mockReset();
  mockPatientMe.mockResolvedValue(FAKE_ME);
});

// ═══════════════════════════════════════════════════════════════════════════
// Test 1 — Les 2 sections sont rendues (Infos + Sécurité)
// ═══════════════════════════════════════════════════════════════════════════

describe("MonComptePage — structure D2.A", () => {
  it("1. rend les 2 sections : Mes informations + Sécurité", async () => {
    renderWithClient(<MonComptePage />);

    // Attendre fin du loader
    await waitFor(() => {
      expect(screen.getByText("Mes informations")).toBeInTheDocument();
    });

    expect(screen.getByText("Sécurité")).toBeInTheDocument();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 2 — Section "Mon suivi" / careCases PLUS affichée
  // ═════════════════════════════════════════════════════════════════════════
  it("2. la section 'Mon suivi' / detail careCases n'est PLUS affichée (retiré D2.A)", async () => {
    renderWithClient(<MonComptePage />);

    await waitFor(() => {
      expect(screen.getByText("Mes informations")).toBeInTheDocument();
    });

    // Le titre de section et le détail careCase ne doivent PAS être présents
    expect(screen.queryByText("Mon suivi")).not.toBeInTheDocument();
    expect(screen.queryByText("Suivi nutrition")).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Test 3-4 — Section Mes informations : édition + email read-only
// ═══════════════════════════════════════════════════════════════════════════

describe("MonComptePage — Section Mes informations (Art. 16)", () => {
  it("3. firstName/lastName ÉDITABLES + email READ-ONLY en mode édition", async () => {
    renderWithClient(<MonComptePage />);

    await waitFor(() => {
      expect(screen.getByText("Mes informations")).toBeInTheDocument();
    });

    // Entrer en mode édition
    const editBtn = screen.getByRole("button", { name: /Modifier mes informations/i });
    fireEvent.click(editBtn);

    // firstName et lastName : éditables (input non-disabled)
    const firstNameInput = screen.getByRole("textbox", { name: /Prénom/i }) as HTMLInputElement;
    expect(firstNameInput).toBeInTheDocument();
    expect(firstNameInput).not.toBeDisabled();
    expect(firstNameInput.value).toBe("Marie");

    const lastNameInput = screen.getByRole("textbox", { name: /^Nom$/i }) as HTMLInputElement;
    expect(lastNameInput).not.toBeDisabled();
    expect(lastNameInput.value).toBe("Dubois");

    // Email : input présent mais disabled + readOnly + mention
    const emailInput = screen.getByLabelText(/Email \(non modifiable\)/i) as HTMLInputElement;
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveAttribute("readonly");
    expect(emailInput.value).toBe("marie@example.com");
    expect(screen.getByText(/Pour changer votre email, contactez le support/i)).toBeInTheDocument();
  });

  it("4. submit appelle api.persons.patch (Art. 16) avec firstName/lastName/phone/birthDate/sex (PAS email)", async () => {
    mockPatchPerson.mockResolvedValueOnce({ id: "u1", firstName: "Maria" });

    renderWithClient(<MonComptePage />);
    await waitFor(() => {
      expect(screen.getByText("Mes informations")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Modifier mes informations/i }));

    // Changer firstName
    const firstNameInput = screen.getByRole("textbox", { name: /Prénom/i });
    fireEvent.change(firstNameInput, { target: { value: "Maria" } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /Enregistrer/i }));

    await waitFor(() => {
      expect(mockPatchPerson).toHaveBeenCalledTimes(1);
    });

    const [calledId, calledData] = mockPatchPerson.mock.calls[0];
    expect(calledId).toBe("u1");
    expect(calledData.firstName).toBe("Maria");
    expect(calledData.lastName).toBe("Dubois");
    // L'email ne doit JAMAIS être envoyé via cette mutation
    expect(calledData.email).toBeUndefined();
    // Sex normalisé en enum backend
    expect(calledData.sex).toBe("FEMALE");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Test 5 — Section Sécurité : bouton reset password → forgotPassword
// ═══════════════════════════════════════════════════════════════════════════

describe("MonComptePage — Section Sécurité (Option A)", () => {
  it("5. clic 'Réinitialiser mon mot de passe' appelle authApi.forgotPassword(user.email)", async () => {
    mockForgotPassword.mockResolvedValueOnce({ message: "OK" });

    renderWithClient(<MonComptePage />);

    await waitFor(() => {
      expect(screen.getByText("Sécurité")).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole("button", { name: /Réinitialiser mon mot de passe/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledTimes(1);
    });
    expect(mockForgotPassword).toHaveBeenCalledWith("marie@example.com");
  });

  it("5-bis. mention 'lien sécurisé par email' affichée dans la section Sécurité", async () => {
    renderWithClient(<MonComptePage />);

    await waitFor(() => {
      expect(screen.getByText("Sécurité")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Vous recevrez un lien sécurisé par email pour définir un nouveau mot de passe/i),
    ).toBeInTheDocument();
  });
});
