import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BroadcastComposeModal } from "../BroadcastComposeModal";

// ── Router mock ──────────────────────────────────────────────────────────────

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// ── useOrgBroadcasts mock ────────────────────────────────────────────────────

const mutateAsync = vi.fn();
vi.mock("@/hooks/useOrgBroadcasts", () => ({
  useOrgBroadcasts: () => ({
    broadcasts: [],
    isLoading: false,
    isError: false,
    createDraft: {
      mutateAsync,
      isPending: false,
    },
    send: { mutateAsync: vi.fn(), isPending: false },
  }),
}));

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  pushMock.mockReset();
  mutateAsync.mockReset();
});

function renderModal(
  opts: { open?: boolean; memberCount?: number; orgId?: string } = {},
) {
  const onClose = vi.fn();
  const utils = render(
    <BroadcastComposeModal
      orgId={opts.orgId ?? "org-1"}
      memberCount={opts.memberCount ?? 42}
      open={opts.open ?? true}
      onClose={onClose}
    />,
  );
  return { ...utils, onClose };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("BroadcastComposeModal", () => {
  it("open=false → rien n'est rendu", () => {
    const { container } = renderModal({ open: false });
    expect(container.firstChild).toBeNull();
  });

  it("open=true → dialog accessible avec titre 'Nouveau broadcast'", () => {
    renderModal({ open: true });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(
      screen.getByRole("heading", { name: /Nouveau broadcast/i }),
    ).toBeInTheDocument();
  });

  it("affiche le compteur de destinataires basé sur memberCount", () => {
    renderModal({ memberCount: 42 });
    const counter = screen.getByTestId("broadcast-recipient-count");
    expect(counter).toHaveTextContent("42 destinataires");
  });

  it("memberCount=1 → singulier 'destinataire'", () => {
    renderModal({ memberCount: 1 });
    expect(
      screen.getByTestId("broadcast-recipient-count"),
    ).toHaveTextContent("1 destinataire");
    expect(
      screen.getByTestId("broadcast-recipient-count"),
    ).not.toHaveTextContent("destinataires");
  });

  it("'Tous les membres actifs' coché par défaut, options V2 désactivées", () => {
    renderModal();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    // Tous les membres actifs = checked
    const allActive = screen.getByRole("radio", {
      name: /Tous les membres actifs/i,
    });
    expect(allActive).toBeChecked();
    // Par rôle = disabled
    const byRole = screen.getByRole("radio", { name: /Par rôle/i });
    expect(byRole).toBeDisabled();
    // Par spécialité = disabled
    const bySpec = screen.getByRole("radio", { name: /Par spécialité/i });
    expect(bySpec).toBeDisabled();
  });

  it("submit → createDraft.mutateAsync appelé puis redirection vers /communications/[id]", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValueOnce({
      id: "draft-xyz",
      subject: "Réunion",
      status: "DRAFT",
    });

    const { onClose } = renderModal({ orgId: "org-rtf" });

    await user.type(
      screen.getByLabelText(/Objet de l'email/i),
      "Réunion mensuelle",
    );
    await user.type(
      screen.getByLabelText(/^Message$/i),
      "Bonjour,\n\nRDV le 15 juin.",
    );
    await user.click(
      screen.getByRole("button", { name: /Créer le brouillon/i }),
    );

    expect(mutateAsync).toHaveBeenCalledWith({
      subject: "Réunion mensuelle",
      body: "Bonjour,\n\nRDV le 15 juin.",
    });
    expect(pushMock).toHaveBeenCalledWith(
      "/structure/org-rtf/admin/communications/draft-xyz",
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("createDraft échoue → affiche le message d'erreur, pas de redirection", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValueOnce(new Error("network down"));

    const { onClose } = renderModal();

    await user.type(screen.getByLabelText(/Objet de l'email/i), "Sujet");
    await user.type(screen.getByLabelText(/^Message$/i), "Corps");
    await user.click(
      screen.getByRole("button", { name: /Créer le brouillon/i }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/network down/);
    expect(pushMock).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("click sur l'overlay (hors dialog) → onClose appelé", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    // L'overlay est le dialog root lui-même (role=dialog) — click direct sur le
    // backdrop hors du panel intérieur déclenche la fermeture.
    await user.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalled();
  });

  it("bouton Fermer → onClose appelé", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    await user.click(
      screen.getByRole("button", { name: /Fermer la fenêtre/i }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("wording MDR : pas de mots interdits dans la modale (signaux/alerte/surveillance/risque)", () => {
    const { container } = renderModal();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/signaux/i);
    expect(text).not.toMatch(/alerte clinique/i);
    expect(text).not.toMatch(/surveillance/i);
    expect(text).not.toMatch(/risque clinique/i);
    expect(text).not.toMatch(/anormal/i);
  });
});
