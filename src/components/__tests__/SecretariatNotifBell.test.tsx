import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { SecretariatNotifBell } from "../secretariat/SecretariatNotifBell";

function withQuery(children: ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

const fixtureItems = [
  {
    id: "req:abc",
    kind: "appointment_request_pending" as const,
    createdAt: "2026-06-03T08:00:00Z",
    providerName: "Dr Hanachi",
    patientName: "Léa Rousseau",
    label: "Nouvelle demande de RDV",
  },
  {
    id: "cancel:def",
    kind: "appointment_cancelled_by_patient" as const,
    createdAt: "2026-06-02T16:00:00Z",
    providerName: "Dr Bellaiche",
    patientName: "Marc Dupont",
    label: "RDV annulé — à reprogrammer",
  },
];

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify({ items: fixtureItems, unread: fixtureItems.length }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SecretariatNotifBell", () => {
  it("affiche le badge unread quand l'API renvoie des items", async () => {
    render(withQuery(<SecretariatNotifBell accessToken="t1" />));
    await waitFor(() => {
      expect(screen.getByTestId("notif-unread-badge")).toHaveTextContent("2");
    });
  });

  it("ne rend pas de badge quand unread = 0", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ items: [], unread: 0 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    render(withQuery(<SecretariatNotifBell accessToken="t1" />));
    await waitFor(() => {
      expect(screen.queryByTestId("notif-unread-badge")).toBeNull();
    });
  });

  it("plafonne l'affichage à '9+' au-delà de 9 unread", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ items: [], unread: 12 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    render(withQuery(<SecretariatNotifBell accessToken="t1" />));
    await waitFor(() => {
      expect(screen.getByTestId("notif-unread-badge")).toHaveTextContent("9+");
    });
  });

  it("ouvre le dropdown au clic et affiche les items", async () => {
    const user = userEvent.setup();
    render(withQuery(<SecretariatNotifBell accessToken="t1" />));
    await waitFor(() => {
      expect(screen.getByTestId("notif-unread-badge")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Notifications du secrétariat/i }));
    expect(screen.getByRole("dialog", { name: /Liste des notifications/i })).toBeInTheDocument();
    expect(screen.getByText("Nouvelle demande de RDV")).toBeInTheDocument();
    expect(screen.getByText("RDV annulé — à reprogrammer")).toBeInTheDocument();
  });

  it("affiche un état vide quand aucune notification", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ items: [], unread: 0 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const user = userEvent.setup();
    render(withQuery(<SecretariatNotifBell accessToken="t1" />));
    await user.click(screen.getByRole("button", { name: /Notifications du secrétariat/i }));
    expect(screen.getByText(/Aucune notification/i)).toBeInTheDocument();
  });
});
