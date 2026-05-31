import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BienvenuePage from "../page";
import { faqContainsMot, FORBIDDEN_MOTS } from "./_helpers";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockUseCareCases = vi.fn();

vi.mock("@/hooks/usePatientCareCases", () => ({
  usePatientCareCases: () => mockUseCareCases(),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({
      user: {
        id: "u1",
        firstName: "Léa",
        lastName: "Rousseau",
        email: "lea@example.com",
        roleType: "PATIENT",
      },
      accessToken: "test-token",
    }),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // Simule <img> sans optimisation Next pour test jsdom
    const { src, alt, width, height } = props as {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        data-testid="next-image"
      />
    );
  },
}));

vi.mock("next/link", () => ({
  __esModule: true,
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

// ─── Helpers de render ──────────────────────────────────────────────────────

function renderWithQC() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <BienvenuePage />
    </QueryClientProvider>,
  );
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("BienvenuePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le hero avec mascotte et le prénom de l'utilisateur", () => {
    mockUseCareCases.mockReturnValue({ data: [], isLoading: false });
    renderWithQC();

    // Mascotte
    const mascot = screen.getByTestId("next-image");
    expect(mascot).toHaveAttribute("src", "/nami-mascot.png");

    // Titre avec prénom
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /bienvenue sur nami,\s*léa/i,
      }),
    ).toBeInTheDocument();

    // Sub-text valeur principale
    expect(
      screen.getByText(/coordonner votre santé avec votre équipe soignante/i),
    ).toBeInTheDocument();
  });

  it("0 CareCase : affiche CTA 'Trouver un soignant' + 3 étapes onboarding", () => {
    mockUseCareCases.mockReturnValue({ data: [], isLoading: false });
    renderWithQC();

    // CTA principal
    const cta = screen.getByRole("link", { name: /trouver un soignant/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/trouver-un-soignant");

    // 3 étapes visibles (getAllByText car certains libellés apparaissent
    // aussi dans le CTA / aside)
    expect(screen.getByText(/comment ça marche/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/trouvez un soignant/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/prenez rendez-vous/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/votre soignant créera votre parcours/i),
    ).toBeInTheDocument();

    // PAS de CTA "Mon accueil" sur cette branche
    expect(
      screen.queryByRole("link", { name: /^mon accueil$/i }),
    ).not.toBeInTheDocument();
  });

  it("N CareCases : affiche CTA 'Mon accueil' + liste des parcours", () => {
    mockUseCareCases.mockReturnValue({
      data: [
        {
          id: "cc-1",
          caseTitle: "Suivi nutritionnel",
          caseType: "NUTRITION",
          status: "ACTIVE",
          startDate: "2026-05-01",
          organizationId: "org-1",
          organizationName: "Cabinet Margot Vire",
        },
        {
          id: "cc-2",
          caseTitle: "Suivi pédiatrique",
          caseType: "PEDIATRIC",
          status: "ACTIVE",
          startDate: "2026-04-15",
          organizationId: null,
          organizationName: null,
        },
      ],
      isLoading: false,
    });
    renderWithQC();

    // CTA principal vers hub
    const accueilCta = screen.getByRole("link", { name: /mon accueil/i });
    expect(accueilCta).toBeInTheDocument();
    expect(accueilCta).toHaveAttribute("href", "/accueil");

    // Liste parcours visible
    expect(
      screen.getByRole("link", { name: /suivi nutritionnel/i }),
    ).toHaveAttribute("href", "/parcours/cc-1");
    expect(
      screen.getByRole("link", { name: /suivi pédiatrique/i }),
    ).toHaveAttribute("href", "/parcours/cc-2");

    // Organization name affichée
    expect(screen.getByText(/cabinet margot vire/i)).toBeInTheDocument();

    // PAS de CTA "Trouver un soignant" sur cette branche
    expect(
      screen.queryByRole("link", { name: /^trouver un soignant$/i }),
    ).not.toBeInTheDocument();
  });

  it("loading state : affiche un Loader2 centré", () => {
    mockUseCareCases.mockReturnValue({ data: undefined, isLoading: true });
    renderWithQC();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/chargement de vos parcours/i)).toBeInTheDocument();
  });

  it("wording MDR-safe : aucun mot interdit dans le DOM rendu", () => {
    mockUseCareCases.mockReturnValue({ data: [], isLoading: false });
    const { container } = renderWithQC();
    const text = container.textContent ?? "";

    for (const mot of FORBIDDEN_MOTS) {
      expect(
        faqContainsMot(text, mot),
        `Mot interdit détecté dans /bienvenue: "${mot}"`,
      ).toBe(false);
    }
  });
});
