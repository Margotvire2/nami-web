import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BroadcastCard } from "../BroadcastCard";
import type { BroadcastListItem } from "@/hooks/useOrgBroadcasts";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const baseBroadcast: BroadcastListItem = {
  id: "bc-1",
  subject: "Réunion mensuelle réseau TCA — 15 juin",
  status: "DRAFT",
  recipientCount: 0,
  sentAt: null,
  createdAt: "2026-06-01T10:00:00Z",
  senderPersonId: "p-sender",
  sender: { firstName: "Margot", lastName: "Vire" },
};

describe("BroadcastCard", () => {
  it("affiche sujet et nom de l'envoyeur", () => {
    render(<BroadcastCard orgId="org-1" broadcast={baseBroadcast} />);
    expect(screen.getByText(/réunion mensuelle/i)).toBeInTheDocument();
    expect(screen.getByText(/margot vire/i)).toBeInTheDocument();
  });

  it("DRAFT → badge Brouillon, masque le compteur destinataires", () => {
    render(<BroadcastCard orgId="org-1" broadcast={baseBroadcast} />);
    expect(screen.getByText(/brouillon/i)).toBeInTheDocument();
    expect(screen.queryByText(/destinataire/i)).not.toBeInTheDocument();
    expect(screen.getByText(/créé le/i)).toBeInTheDocument();
  });

  it("SENT → badge Envoyé + compteur destinataires + date d'envoi", () => {
    render(
      <BroadcastCard
        orgId="org-1"
        broadcast={{
          ...baseBroadcast,
          status: "SENT",
          recipientCount: 12,
          sentAt: "2026-06-02T14:30:00Z",
        }}
      />,
    );
    // Badge status "Envoyé" exact match (pas "Envoyé le ...")
    expect(screen.getByText("Envoyé")).toBeInTheDocument();
    expect(screen.getByText(/12 destinataires/i)).toBeInTheDocument();
    expect(screen.getByText(/envoyé le/i)).toBeInTheDocument();
  });

  it("FAILED → badge Échec", () => {
    render(
      <BroadcastCard
        orgId="org-1"
        broadcast={{ ...baseBroadcast, status: "FAILED" }}
      />,
    );
    expect(screen.getByText(/échec/i)).toBeInTheDocument();
  });

  it("lien pointe vers la page détail", () => {
    render(<BroadcastCard orgId="org-42" broadcast={baseBroadcast} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/structure/org-42/admin/communications/bc-1",
    );
  });

  it("sender null → affiche tiret", () => {
    render(
      <BroadcastCard
        orgId="org-1"
        broadcast={{ ...baseBroadcast, sender: null }}
      />,
    );
    expect(screen.getByText(/par —/i)).toBeInTheDocument();
  });
});
