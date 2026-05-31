import { describe, it, expect } from "vitest";
import { deriveEventUiStatus } from "../useEvent";

const futureIso = new Date(Date.now() + 86_400_000).toISOString();
const pastIso = new Date(Date.now() - 86_400_000).toISOString();
const futureEnd = new Date(Date.now() + 86_400_000 + 3_600_000).toISOString();

describe("deriveEventUiStatus", () => {
  it("CANCELLED prime sur tout", () => {
    expect(
      deriveEventUiStatus({
        status: "CANCELLED",
        startAt: futureIso,
        endAt: futureEnd,
        maxParticipants: 10,
        participantsCount: 3,
      }),
    ).toBe("CANCELLED");
  });

  it("endAt passé → PAST", () => {
    expect(
      deriveEventUiStatus({
        status: "PUBLISHED",
        startAt: pastIso,
        endAt: pastIso,
        maxParticipants: null,
        participantsCount: 0,
      }),
    ).toBe("PAST");
  });

  it("COMPLETED → PAST", () => {
    expect(
      deriveEventUiStatus({
        status: "COMPLETED",
        startAt: futureIso,
        endAt: futureEnd,
        maxParticipants: null,
        participantsCount: 0,
      }),
    ).toBe("PAST");
  });

  it("DRAFT futur → SCHEDULED", () => {
    expect(
      deriveEventUiStatus({
        status: "DRAFT",
        startAt: futureIso,
        endAt: futureEnd,
        maxParticipants: null,
        participantsCount: 0,
      }),
    ).toBe("SCHEDULED");
  });

  it("PUBLISHED + place dispo → OPEN", () => {
    expect(
      deriveEventUiStatus({
        status: "PUBLISHED",
        startAt: futureIso,
        endAt: futureEnd,
        maxParticipants: 10,
        participantsCount: 3,
      }),
    ).toBe("OPEN");
  });

  it("PUBLISHED + maxParticipants atteint → FULL", () => {
    expect(
      deriveEventUiStatus({
        status: "PUBLISHED",
        startAt: futureIso,
        endAt: futureEnd,
        maxParticipants: 5,
        participantsCount: 5,
      }),
    ).toBe("FULL");
  });

  it("PUBLISHED sans cap → OPEN même avec beaucoup d'inscrits", () => {
    expect(
      deriveEventUiStatus({
        status: "PUBLISHED",
        startAt: futureIso,
        endAt: futureEnd,
        maxParticipants: null,
        participantsCount: 999,
      }),
    ).toBe("OPEN");
  });
});
