import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParticipantsList } from "../ParticipantsList";

describe("ParticipantsList", () => {
  it("rend les compteurs", () => {
    render(
      <ParticipantsList
        participantsCount={7}
        patientSubmissionsCount={2}
        acceptsPatientSubmissions={true}
        isDpcEligible={false}
      />,
    );
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("hint DPC quand isDpcEligible", () => {
    render(
      <ParticipantsList
        participantsCount={0}
        patientSubmissionsCount={0}
        acceptsPatientSubmissions={false}
        isDpcEligible={true}
      />,
    );
    expect(screen.getByText(/confirmations dpc/i)).toBeInTheDocument();
  });

  it("indique la limitation backend pour la liste nominative", () => {
    render(
      <ParticipantsList
        participantsCount={1}
        patientSubmissionsCount={0}
        acceptsPatientSubmissions={false}
        isDpcEligible={false}
      />,
    );
    expect(screen.getByText(/liste nominative.*prochaine itération/i)).toBeInTheDocument();
  });
});
