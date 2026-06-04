import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { SecretariatSignedDocsSection } from "../SecretariatSignedDocsSection";

function withQuery(children: ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

const fixtureItems = [
  {
    id: "doc-1",
    title: "Ordonnance - Léa Rousseau",
    signedAt: "2026-06-04T09:00:00Z",
    patient: { id: "p1", firstName: "Léa", lastName: "Rousseau" },
  },
  {
    id: "doc-2",
    title: "Ordonnance - Marc Dupont",
    signedAt: "2026-06-04T11:30:00Z",
    patient: { id: "p2", firstName: "Marc", lastName: "Dupont" },
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SecretariatSignedDocsSection", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("affiche l'état vide quand backend renvoie 404 (V1 shell)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Not Found", { status: 404 })),
    );
    render(
      withQuery(
        <SecretariatSignedDocsSection accessToken="t1" userId="u1" />,
      ),
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("signed-docs-empty-state"),
      ).toHaveTextContent(/Aucune ordonnance signée à transmettre/i);
    });
    // Aucun badge count quand vide
    expect(screen.queryByTestId("signed-docs-count-badge")).toBeNull();
  });

  it("affiche la liste des documents signés et un badge count", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ items: fixtureItems }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
    render(
      withQuery(
        <SecretariatSignedDocsSection accessToken="t1" userId="u1" />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByTestId("signed-doc-row-doc-1")).toBeInTheDocument();
      expect(screen.getByTestId("signed-doc-row-doc-2")).toBeInTheDocument();
    });
    expect(screen.getByTestId("signed-docs-count-badge")).toHaveTextContent(
      "2",
    );
    expect(screen.getByText("Léa Rousseau")).toBeInTheDocument();
    expect(screen.getByText("Marc Dupont")).toBeInTheDocument();
  });

  it("le clic 'Marquer envoyé' met à jour le state local (UI-only V1)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ items: fixtureItems }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
    const user = userEvent.setup();
    render(
      withQuery(
        <SecretariatSignedDocsSection accessToken="t1" userId="u1" />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByTestId("signed-doc-row-doc-1")).toBeInTheDocument();
    });

    // Avant clic : bouton "Marquer envoyé" actif
    const btn = screen.getByRole("button", {
      name: /Marquer "Ordonnance - Léa Rousseau" comme envoyé/i,
    });
    expect(btn).toBeEnabled();
    expect(btn).toHaveTextContent(/Marquer envoyé/i);

    await user.click(btn);

    // Après clic : bouton désactivé + texte "Envoyé"
    await waitFor(() => {
      expect(btn).toBeDisabled();
      expect(btn).toHaveTextContent(/Envoyé/i);
    });

    // L'autre ligne (doc-2) reste cliquable
    const btn2 = screen.getByRole("button", {
      name: /Marquer "Ordonnance - Marc Dupont" comme envoyé/i,
    });
    expect(btn2).toBeEnabled();
  });

  it("n'affiche pas la liste tant qu'il n'y a pas de token", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(
      withQuery(
        <SecretariatSignedDocsSection accessToken={null} userId={null} />,
      ),
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(
      screen.getByTestId("signed-docs-empty-state"),
    ).toBeInTheDocument();
  });
});
