import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RSVPButton } from "../RSVPButton";
import { ApiError } from "@/lib/api";

const okRsvp = vi.fn().mockResolvedValue({
  id: "p1",
  status: "REGISTERED" as const,
});
const conflict = vi.fn().mockRejectedValue(new ApiError(409, "Déjà inscrit"));
const okUnregister = vi.fn().mockResolvedValue({});

describe("RSVPButton", () => {
  it("rend rien pour uiStatus=PAST / CANCELLED / SCHEDULED", () => {
    const { container, rerender } = render(
      <RSVPButton
        uiStatus="PAST"
        isFull={false}
        myStatus={null}
        onRsvp={okRsvp}
        onUnregister={okUnregister}
      />,
    );
    expect(container.firstChild).toBeNull();
    rerender(
      <RSVPButton
        uiStatus="CANCELLED"
        isFull={false}
        myStatus={null}
        onRsvp={okRsvp}
        onUnregister={okUnregister}
      />,
    );
    expect(container.firstChild).toBeNull();
    rerender(
      <RSVPButton
        uiStatus="SCHEDULED"
        isFull={false}
        myStatus={null}
        onRsvp={okRsvp}
        onUnregister={okUnregister}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("OPEN + not registered → bouton S'inscrire activé", () => {
    render(
      <RSVPButton
        uiStatus="OPEN"
        isFull={false}
        myStatus={null}
        onRsvp={okRsvp}
        onUnregister={okUnregister}
      />,
    );
    const btn = screen.getByTestId("rsvp-button-register");
    expect(btn).toBeEnabled();
    expect(btn).toHaveTextContent(/S'inscrire/i);
  });

  it("FULL → bouton désactivé avec label Complet", () => {
    render(
      <RSVPButton
        uiStatus="FULL"
        isFull={true}
        myStatus={null}
        onRsvp={okRsvp}
        onUnregister={okUnregister}
      />,
    );
    const btn = screen.getByTestId("rsvp-button-register");
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/Complet/i);
  });

  it("REGISTERED → bouton Se désinscrire", () => {
    render(
      <RSVPButton
        uiStatus="OPEN"
        isFull={false}
        myStatus="REGISTERED"
        onRsvp={okRsvp}
        onUnregister={okUnregister}
      />,
    );
    expect(screen.getByTestId("rsvp-button-unregister")).toHaveTextContent(
      /Se désinscrire/i,
    );
  });

  it("CONFIRMED → désinscription impossible + info post-DPC", () => {
    render(
      <RSVPButton
        uiStatus="OPEN"
        isFull={false}
        myStatus="CONFIRMED"
        onRsvp={okRsvp}
        onUnregister={okUnregister}
      />,
    );
    expect(screen.getByTestId("rsvp-button-confirmed")).toBeDisabled();
    expect(
      screen.getByText(/n'est plus possible après confirmation/i),
    ).toBeInTheDocument();
  });

  it("RSVP ok → bascule sur le statut renvoyé", async () => {
    render(
      <RSVPButton
        uiStatus="OPEN"
        isFull={false}
        myStatus={null}
        onRsvp={okRsvp}
        onUnregister={okUnregister}
      />,
    );
    fireEvent.click(screen.getByTestId("rsvp-button-register"));
    await waitFor(() =>
      expect(screen.getByTestId("rsvp-button-unregister")).toBeInTheDocument(),
    );
  });

  it("RSVP 409 → considère REGISTERED + message inscription déjà existante", async () => {
    render(
      <RSVPButton
        uiStatus="OPEN"
        isFull={false}
        myStatus={null}
        onRsvp={conflict}
        onUnregister={okUnregister}
      />,
    );
    fireEvent.click(screen.getByTestId("rsvp-button-register"));
    await waitFor(() =>
      expect(screen.getByTestId("rsvp-button-unregister")).toBeInTheDocument(),
    );
    expect(screen.getByText(/déjà inscrit/i)).toBeInTheDocument();
  });

  it("Unregister ok → bascule sur 'S'inscrire'", async () => {
    render(
      <RSVPButton
        uiStatus="OPEN"
        isFull={false}
        myStatus="REGISTERED"
        onRsvp={okRsvp}
        onUnregister={okUnregister}
      />,
    );
    fireEvent.click(screen.getByTestId("rsvp-button-unregister"));
    await waitFor(() =>
      expect(screen.getByTestId("rsvp-button-register")).toBeInTheDocument(),
    );
  });
});
