import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MonComptePage from "../page";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockPatchPerson = vi.fn();
const mockPatientMe = vi.fn();
const mockForgotPassword = vi.fn();
const mockSwitchableProfiles = vi.fn();
const mockConsentsMatrix = vi.fn();
const mockGrantConsent = vi.fn();
const mockDataExport = vi.fn();
const mockDeleteGdpr = vi.fn();
const mockLogout = vi.fn();

vi.mock("@/lib/api", async () => {
  // On garde GLOBAL_SCOPE_KEY (utilisé par le code) — re-exporté tel quel.
  return {
    apiWithToken: () => ({
      patient: {
        me: mockPatientMe,
        switchableProfiles: mockSwitchableProfiles,
      },
      persons: {
        patch: mockPatchPerson,
        consentsMatrix: mockConsentsMatrix,
        grantConsent: mockGrantConsent,
        dataExport: mockDataExport,
        deleteGdpr: mockDeleteGdpr,
      },
    }),
    authApi: {
      forgotPassword: (email: string) => mockForgotPassword(email),
    },
    GLOBAL_SCOPE_KEY: "__global__",
  };
});

// next/navigation : useSearchParams pour ?profile=X (pattern F6)
let mockSearchParamsString = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockSearchParamsString),
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
      logout: mockLogout,
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
  mockSwitchableProfiles.mockReset();
  mockConsentsMatrix.mockReset();
  mockGrantConsent.mockReset();
  mockDataExport.mockReset();
  mockDeleteGdpr.mockReset();
  mockLogout.mockReset();
  mockSearchParamsString = "";
  mockPatientMe.mockResolvedValue(FAKE_ME);
  // Par défaut : self seul (Section 3 masquée, Section 4 = self)
  mockSwitchableProfiles.mockResolvedValue([
    {
      personId: "u1",
      firstName: "Marie",
      lastName: "Dubois",
      birthDate: null,
      isSelf: true,
      delegationScopes: null,
    },
  ]);
  // Matrice par défaut : tout false (état initial backend)
  mockConsentsMatrix.mockResolvedValue({
    AI_PROCESSING: {
      transcription_audio: false,
      note_summarization: false,
      bio_extraction: false,
      __global__: false,
    },
    DATA_SHARING: {
      care_team: false,
      referral_partner: false,
      family_pediatric_parent: false,
      __global__: false,
    },
    NOTIFICATIONS: {
      appointment_reminder: false,
      message_alert: false,
      __global__: false,
    },
    RGPD_PROCESSING: { __global__: false },
    CARE_COORDINATION: { __global__: false },
    MARKETING: { __global__: false },
  });
});

// Profils étendus avec un enfant pour les tests Section 3/4 délégation
const PROFILES_WITH_CHILD_MANAGE = [
  {
    personId: "u1",
    firstName: "Marie",
    lastName: "Dubois",
    birthDate: null,
    isSelf: true,
    delegationScopes: null,
  },
  {
    personId: "lea",
    firstName: "Léa",
    lastName: "Dubois",
    birthDate: "2016-03-15T00:00:00.000Z",
    isSelf: false,
    delegationScopes: ["BOOK_APPOINTMENTS", "MANAGE_CONSENTS"],
  },
];

const PROFILES_WITH_CHILD_NO_MANAGE = [
  {
    personId: "u1",
    firstName: "Marie",
    lastName: "Dubois",
    birthDate: null,
    isSelf: true,
    delegationScopes: null,
  },
  {
    personId: "ines",
    firstName: "Inès",
    lastName: "Dubois",
    birthDate: "2009-06-20T00:00:00.000Z",
    isSelf: false,
    delegationScopes: ["BOOK_APPOINTMENTS"], // PAS de MANAGE_CONSENTS
  },
];

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

// ═══════════════════════════════════════════════════════════════════════════
// D2.B — Section 3 Mes profils (lecture seule)
// ═══════════════════════════════════════════════════════════════════════════

describe("MonComptePage — Section 3 Mes profils (D2.B)", () => {
  it("6. masquée si 1 seul profil disponible (pas de délégation)", async () => {
    // mock par défaut = self seul → Section 3 ne doit pas apparaître
    renderWithClient(<MonComptePage />);

    await waitFor(() => {
      expect(screen.getByText("Mes informations")).toBeInTheDocument();
    });

    expect(screen.queryByText("Mes profils")).not.toBeInTheDocument();
  });

  it("7. affichée avec liste read-only des profils + scopes FR si délégation active", async () => {
    mockSwitchableProfiles.mockResolvedValue(PROFILES_WITH_CHILD_MANAGE);

    renderWithClient(<MonComptePage />);

    await waitFor(() => {
      expect(screen.getByText("Mes profils")).toBeInTheDocument();
    });

    // Profil self affiché en premier avec badge "Vous"
    expect(screen.getByText("Vous")).toBeInTheDocument();

    // Profil enfant Léa avec scopes FR
    expect(screen.getByText("Léa Dubois")).toBeInTheDocument();
    expect(screen.getByText("Prendre des rendez-vous")).toBeInTheDocument();
    expect(screen.getByText("Gérer les consentements")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// D2.B — Section 4 Mes consentements (matrice F4 G5, accordéon)
// ═══════════════════════════════════════════════════════════════════════════

describe("MonComptePage — Section 4 Mes consentements (D2.B)", () => {
  it("8. accordéon : les 6 types ConsentType sont rendus avec labels FR + résumé X/N actifs", async () => {
    renderWithClient(<MonComptePage />);

    await waitFor(() => {
      expect(screen.getByText("Mes consentements")).toBeInTheDocument();
    });

    // Attendre la résolution de la matrix query
    await waitFor(() => {
      expect(screen.getByText("Traitement par intelligence artificielle")).toBeInTheDocument();
    });

    expect(screen.getByText("Partage de données")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Traitement des données personnelles")).toBeInTheDocument();
    expect(screen.getByText("Coordination des soins")).toBeInTheDocument();
    expect(screen.getByText("Communications marketing")).toBeInTheDocument();
  });

  it("9. toggle d'un scope appelle persons.grantConsent avec scope correct + granted true", async () => {
    mockGrantConsent.mockResolvedValueOnce({
      id: "c-1",
      consentType: "AI_PROCESSING",
      granted: true,
      grantedAt: "2026-05-23T00:00:00.000Z",
      scope: "transcription_audio",
      delegationId: null,
    });

    renderWithClient(<MonComptePage />);

    await waitFor(() => {
      expect(screen.getByText("Traitement par intelligence artificielle")).toBeInTheDocument();
    });

    // Déplier AI_PROCESSING
    fireEvent.click(screen.getByText("Traitement par intelligence artificielle"));

    await waitFor(() => {
      expect(screen.getByText("Transcription audio")).toBeInTheDocument();
    });

    // Toggle "Transcription audio" (role=switch, currently false → click → true)
    const toggles = screen.getAllByRole("switch");
    const transcriptionToggle = toggles.find((t) =>
      t.getAttribute("aria-label")?.includes("Transcription audio"),
    );
    expect(transcriptionToggle).toBeDefined();
    expect(transcriptionToggle).toHaveAttribute("aria-checked", "false");

    fireEvent.click(transcriptionToggle!);

    await waitFor(() => {
      expect(mockGrantConsent).toHaveBeenCalledTimes(1);
    });
    const [calledPersonId, calledData] = mockGrantConsent.mock.calls[0];
    expect(calledPersonId).toBe("u1"); // self
    expect(calledData.consentType).toBe("AI_PROCESSING");
    expect(calledData.scope).toBe("transcription_audio");
    expect(calledData.granted).toBe(true);
  });

  it("10. affiche message 'pas les droits' si profil sélectionné sans MANAGE_CONSENTS", async () => {
    mockSwitchableProfiles.mockResolvedValue(PROFILES_WITH_CHILD_NO_MANAGE);
    mockSearchParamsString = "profile=ines"; // simule URL ?profile=ines

    renderWithClient(<MonComptePage />);

    await waitFor(() => {
      expect(screen.getByText("Mes consentements")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Vous n'avez pas les droits pour gérer les consentements de/i),
      ).toBeInTheDocument();
    });

    // Inès est mentionnée dans le message
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Inès");

    // La matrix n'a PAS été appelée (proactif via delegationScopes)
    expect(mockConsentsMatrix).not.toHaveBeenCalled();
  });

  it("11. matrice cible le profil enfant si ?profile=lea + MANAGE_CONSENTS présent", async () => {
    mockSwitchableProfiles.mockResolvedValue(PROFILES_WITH_CHILD_MANAGE);
    mockSearchParamsString = "profile=lea";

    renderWithClient(<MonComptePage />);

    await waitFor(() => {
      expect(mockConsentsMatrix).toHaveBeenCalledWith("lea");
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// D2.C — Section 5 Mes données (export Art. 15/20)
// ═══════════════════════════════════════════════════════════════════════════

describe("MonComptePage — Section 5 Mes données (D2.C)", () => {
  beforeEach(() => {
    // Stub createObjectURL / revokeObjectURL pour jsdom (non implémentés)
    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn(() => "blob:fake");
    } else {
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fake");
    }
    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    }
  });

  it("12. clic 'Télécharger mes données' appelle persons.dataExport(user.id)", async () => {
    mockDataExport.mockResolvedValueOnce({
      person: { id: "u1", firstName: "Marie" },
      careCases: [],
    });

    renderWithClient(<MonComptePage />);

    await waitFor(() => {
      expect(screen.getByText("Mes données")).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole("button", { name: /Télécharger mes données/i });
    expect(exportBtn).toBeInTheDocument();

    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(mockDataExport).toHaveBeenCalledTimes(1);
    });
    expect(mockDataExport).toHaveBeenCalledWith("u1");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// D2.C — Section 6 Supprimer mon compte (Art. 17) + modal
// ═══════════════════════════════════════════════════════════════════════════

describe("MonComptePage — Section 6 Supprimer mon compte (D2.C)", () => {
  it("13. clic 'Supprimer mon compte' ouvre le DeleteAccountModal", async () => {
    renderWithClient(<MonComptePage />);

    // Attendre la résolution data via un texte unique (description Section 6),
    // pour éviter la collision "Supprimer mon compte" (titre + bouton).
    await waitFor(() => {
      expect(
        screen.getByText(/La suppression de votre compte est/i),
      ).toBeInTheDocument();
    });

    // Le titre du modal n'est pas encore visible
    expect(
      screen.queryByText(/Cette action est définitive et irréversible/i),
    ).not.toBeInTheDocument();

    // Section 6 contient un bouton + le modal (fermé) — on cherche le bouton de
    // la section (le seul qui n'est PAS dans un dialog)
    const buttons = screen.getAllByRole("button", { name: /^Supprimer mon compte$/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Cette action est définitive et irréversible/i),
      ).toBeInTheDocument();
    });
  });

  it("14. garde-fou doux : affiche les parcours actifs si careCases ACTIVE non vide (étape 1)", async () => {
    // FAKE_ME a 1 careCase ACTIVE "Suivi nutrition" → garde-fou doit s'afficher
    renderWithClient(<MonComptePage />);

    // Section title + bouton ont le même texte → on attend la résolution data via
    // un texte unique (description Section 6), puis clique sur le bouton ciblé.
    await waitFor(() => {
      expect(
        screen.getByText(/La suppression de votre compte est/i),
      ).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole("button", { name: /^Supprimer mon compte$/i });
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Vous avez 1 parcours en cours/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Suivi nutrition/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Je comprends, continuer/i })).toBeInTheDocument();
  });

  it("15. SAUTE le garde-fou si aucun parcours actif (direct à étape SUPPRIMER)", async () => {
    // Override : 0 careCases actifs
    mockPatientMe.mockResolvedValueOnce({
      ...FAKE_ME,
      careCases: [],
    });

    renderWithClient(<MonComptePage />);

    // Section title + bouton ont le même texte → on attend la résolution data via
    // un texte unique (description Section 6), puis clique sur le bouton ciblé.
    await waitFor(() => {
      expect(
        screen.getByText(/La suppression de votre compte est/i),
      ).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole("button", { name: /^Supprimer mon compte$/i });
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Tapez/i)).toBeInTheDocument();
    });

    // Pas d'avertissement parcours
    expect(screen.queryByText(/parcours en cours/i)).not.toBeInTheDocument();
  });

  it("16. bouton 'Supprimer définitivement' désactivé tant que input !== 'SUPPRIMER'", async () => {
    mockPatientMe.mockResolvedValueOnce({ ...FAKE_ME, careCases: [] });

    renderWithClient(<MonComptePage />);

    // Section title + bouton ont le même texte → on attend la résolution data via
    // un texte unique (description Section 6), puis clique sur le bouton ciblé.
    await waitFor(() => {
      expect(
        screen.getByText(/La suppression de votre compte est/i),
      ).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole("button", { name: /^Supprimer mon compte$/i });
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByLabelText(/Tapez SUPPRIMER pour confirmer/i)).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole("button", { name: /Supprimer définitivement/i });
    expect(confirmBtn).toBeDisabled();

    // Saisie partielle
    const input = screen.getByLabelText(/Tapez SUPPRIMER pour confirmer/i);
    fireEvent.change(input, { target: { value: "SUPPRI" } });
    expect(confirmBtn).toBeDisabled();

    // Saisie incorrecte (minuscules)
    fireEvent.change(input, { target: { value: "supprimer" } });
    expect(confirmBtn).toBeDisabled();

    // Saisie exacte (majuscules)
    fireEvent.change(input, { target: { value: "SUPPRIMER" } });
    expect(confirmBtn).not.toBeDisabled();
  });

  it("17. saisie SUPPRIMER + clic appelle deleteGdpr → logout", async () => {
    mockPatientMe.mockResolvedValueOnce({ ...FAKE_ME, careCases: [] });
    mockDeleteGdpr.mockResolvedValueOnce({
      message: "Anonymisé",
      anonymizedAt: "2026-05-23T17:00:00.000Z",
      retained: [],
      deleted: [],
    });

    // Stub window.location.href (assignation = navigation)
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "" },
    });

    renderWithClient(<MonComptePage />);

    // Section title + bouton ont le même texte → on attend la résolution data via
    // un texte unique (description Section 6), puis clique sur le bouton ciblé.
    await waitFor(() => {
      expect(
        screen.getByText(/La suppression de votre compte est/i),
      ).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole("button", { name: /^Supprimer mon compte$/i });
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByLabelText(/Tapez SUPPRIMER pour confirmer/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Tapez SUPPRIMER pour confirmer/i), {
      target: { value: "SUPPRIMER" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Supprimer définitivement/i }));

    await waitFor(() => {
      expect(mockDeleteGdpr).toHaveBeenCalledWith("u1");
    });

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    // Restore window.location
    Object.defineProperty(window, "location", { writable: true, value: originalLocation });
  });
});
