import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import PatientsPage from "../secretariat/patients/page";
import WaitingRoomPage from "../secretariat/salle-attente/page";

describe("Secretariat shell pages (P0 — fix 404 sidebar)", () => {
  afterEach(() => cleanup());

  it("renders /secretariat/patients shell with 'Bientôt disponible'", () => {
    render(<PatientsPage />);
    expect(screen.getByRole("heading", { name: "Patients" })).toBeInTheDocument();
    expect(screen.getByText(/Bientôt disponible/)).toBeInTheDocument();
  });

  it("renders /secretariat/salle-attente shell with 'Bientôt disponible'", () => {
    render(<WaitingRoomPage />);
    expect(screen.getByRole("heading", { name: /Salle d'attente/ })).toBeInTheDocument();
    expect(screen.getByText(/Bientôt disponible/)).toBeInTheDocument();
  });
});
