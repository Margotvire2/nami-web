import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { RecipientsTable } from "../RecipientsTable";
import type { BroadcastRecipient } from "@/hooks/useBroadcast";

function makeRecipient(over: Partial<BroadcastRecipient> = {}): BroadcastRecipient {
  return {
    id: "r-" + Math.random().toString(36).slice(2),
    personId: "p-" + Math.random().toString(36).slice(2),
    emailSent: true,
    notifSent: false,
    optedOut: false,
    openedAt: null,
    createdAt: "2026-06-02T14:30:00Z",
    person: { firstName: "Jean", lastName: "Dupont", email: "j@d.fr" },
    ...over,
  };
}

const sample: BroadcastRecipient[] = [
  makeRecipient({
    id: "r-opened",
    openedAt: "2026-06-02T15:00:00Z",
    person: { firstName: "Alice", lastName: "Opened", email: "a@o.fr" },
  }),
  makeRecipient({
    id: "r-sent",
    person: { firstName: "Bob", lastName: "Sent", email: "b@s.fr" },
  }),
  makeRecipient({
    id: "r-opted",
    optedOut: true,
    emailSent: false,
    person: { firstName: "Chloé", lastName: "Optout", email: "c@o.fr" },
  }),
  makeRecipient({
    id: "r-failed",
    emailSent: false,
    person: { firstName: "Diane", lastName: "Failed", email: "d@f.fr" },
  }),
];

describe("RecipientsTable", () => {
  it("affiche tous les destinataires par défaut", () => {
    render(<RecipientsTable recipients={sample} />);
    expect(screen.getByText("Alice Opened")).toBeInTheDocument();
    expect(screen.getByText("Bob Sent")).toBeInTheDocument();
    expect(screen.getByText("Chloé Optout")).toBeInTheDocument();
    expect(screen.getByText("Diane Failed")).toBeInTheDocument();
  });

  it("compteurs par catégorie sont corrects", () => {
    render(<RecipientsTable recipients={sample} />);
    expect(screen.getByRole("tab", { name: "Tous (4)" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Ouverts (1)" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Envoyés (1)" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Désinscrits (1)" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Non envoyés (1)" }),
    ).toBeInTheDocument();
  });

  it("filtre 'opened' ne montre que les ouverts", () => {
    render(<RecipientsTable recipients={sample} />);
    fireEvent.click(screen.getByRole("tab", { name: "Ouverts (1)" }));
    expect(screen.getByText("Alice Opened")).toBeInTheDocument();
    expect(screen.queryByText("Bob Sent")).not.toBeInTheDocument();
    expect(screen.queryByText("Diane Failed")).not.toBeInTheDocument();
  });

  it("filtre 'failed' ne montre que les non-envoyés", () => {
    render(<RecipientsTable recipients={sample} />);
    fireEvent.click(screen.getByRole("tab", { name: "Non envoyés (1)" }));
    expect(screen.getByText("Diane Failed")).toBeInTheDocument();
    expect(screen.queryByText("Alice Opened")).not.toBeInTheDocument();
  });

  it("opted-out prend la priorité sur emailSent", () => {
    render(<RecipientsTable recipients={sample} />);
    fireEvent.click(screen.getByRole("tab", { name: "Désinscrits (1)" }));
    expect(screen.getByText("Chloé Optout")).toBeInTheDocument();
  });

  it("liste vide → message neutre", () => {
    render(<RecipientsTable recipients={[]} />);
    expect(screen.getByText(/aucun destinataire/i)).toBeInTheDocument();
  });

  it("filtre sans match → message neutre dans la catégorie", () => {
    render(<RecipientsTable recipients={[makeRecipient()]} />);
    fireEvent.click(screen.getByRole("tab", { name: "Ouverts (0)" }));
    const table = screen.getByRole("table");
    expect(within(table).getByText(/aucun destinataire/i)).toBeInTheDocument();
  });
});
