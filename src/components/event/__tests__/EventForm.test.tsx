import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventForm } from "../EventForm";

describe("EventForm", () => {
  it("rend tous les champs principaux", () => {
    render(<EventForm onSubmit={() => {}} />);
    expect(screen.getByLabelText(/type d'événement/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^titre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^début/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^fin/i)).toBeInTheDocument();
  });

  it("bloque la soumission si fin <= début", () => {
    const onSubmit = vi.fn();
    render(<EventForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/^titre/i), {
      target: { value: "RCP test" },
    });
    fireEvent.change(screen.getByLabelText(/^début/i), {
      target: { value: "2026-12-01T10:00" },
    });
    fireEvent.change(screen.getByLabelText(/^fin/i), {
      target: { value: "2026-12-01T09:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /créer l'événement/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/la fin doit être après le début/i)).toBeInTheDocument();
  });

  it("appelle onSubmit avec le payload sérialisé quand valide", () => {
    const onSubmit = vi.fn();
    render(<EventForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/^titre/i), {
      target: { value: "RCP TCA" },
    });
    fireEvent.change(screen.getByLabelText(/^début/i), {
      target: { value: "2026-12-15T14:00" },
    });
    fireEvent.change(screen.getByLabelText(/^fin/i), {
      target: { value: "2026-12-15T16:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /créer l'événement/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.title).toBe("RCP TCA");
    expect(payload.type).toBe("RCP_ELARGIE");
    expect(payload.format).toBe("VISIO");
    expect(typeof payload.startAt).toBe("string");
  });

  it("WORKING_GROUP_MEET → exige workingGroupConvId", () => {
    const onSubmit = vi.fn();
    render(<EventForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/type d'événement/i), {
      target: { value: "WORKING_GROUP_MEET" },
    });
    fireEvent.change(screen.getByLabelText(/^titre/i), {
      target: { value: "Groupe TCA" },
    });
    fireEvent.change(screen.getByLabelText(/^début/i), {
      target: { value: "2026-12-15T14:00" },
    });
    fireEvent.change(screen.getByLabelText(/^fin/i), {
      target: { value: "2026-12-15T16:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /créer l'événement/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(/identifiant du groupe de travail requis/i),
    ).toBeInTheDocument();
  });

  it("RCP_ELARGIE → toggle acceptsPatientSubmissions visible", () => {
    render(<EventForm onSubmit={() => {}} />);
    expect(
      screen.getByText(/accepter des soumissions de dossiers/i),
    ).toBeInTheDocument();
  });
});
