import { describe, it, expect } from "vitest";
import { aggregate } from "../useMaSante";
import type { JournalEntry } from "@/lib/api";

const NOW = new Date("2026-06-03T12:00:00.000Z");

function daysAgo(n: number): string {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
}

function entry(
  daysBack: number,
  payload: Record<string, unknown>,
  entryType: JournalEntry["entryType"] = "EMOTION",
): JournalEntry {
  return {
    id: `e-${daysBack}`,
    careCaseId: "cc-1",
    entryType,
    payload,
    occurredAt: daysAgo(daysBack),
    sharedWithTeam: true,
    createdAt: daysAgo(daysBack),
    author: { id: "p-1", firstName: "Gabrielle", lastName: "Martin" },
    photoUrl: null,
    photoAnalyzed: false,
    photoValidated: false,
    photoMacros: null,
  };
}

describe("aggregate (useMaSante)", () => {
  it("retourne des valeurs vides quand aucune entrée", () => {
    const result = aggregate([], NOW);
    expect(result.latestMood).toBeNull();
    expect(result.latestEnergy).toBeNull();
    expect(result.averageEnergy7d).toBeNull();
    expect(result.energyPoints7d).toEqual([]);
    expect(result.entriesCount7d).toBe(0);
    expect(result.entriesCountPrev7d).toBe(0);
  });

  it("agrège correctement quand toutes les entrées sont dans les 7j courants", () => {
    const entries = [
      entry(1, { mood: "sunny", energy: 80 }),
      entry(3, { mood: "cloudy", energy: 40 }),
      entry(5, { mood: "rainy", energy: 20 }),
    ];
    const result = aggregate(entries, NOW);
    expect(result.latestMood).toBe("sunny");
    expect(result.latestEnergy).toBe(80);
    expect(result.entriesCount7d).toBe(3);
    expect(result.entriesCountPrev7d).toBe(0);
    expect(result.energyPoints7d).toEqual([20, 40, 80]); // tri chronologique
    expect(result.averageEnergy7d).toBe(47); // round((20+40+80)/3)
  });

  it("sépare les counts 7j courants et 7j précédents", () => {
    const entries = [
      entry(2, { mood: "sunny", energy: 70 }),
      entry(5, { mood: "cloudy", energy: 40 }),
      entry(9, { mood: "rainy", energy: 30 }),
      entry(12, { mood: "stormy", energy: 20 }),
    ];
    const result = aggregate(entries, NOW);
    expect(result.entriesCount7d).toBe(2);
    expect(result.entriesCountPrev7d).toBe(2);
    expect(result.latestMood).toBe("sunny");
    expect(result.energyPoints7d).toEqual([40, 70]);
    expect(result.averageEnergy7d).toBe(55);
  });

  it("ignore mood absent et tombe sur entrée antérieure pour le latestMood", () => {
    const entries = [
      entry(1, { energy: 60 }), // pas de mood — la plus récente
      entry(3, { mood: "partly_cloudy", energy: 75 }),
    ];
    const result = aggregate(entries, NOW);
    expect(result.latestMood).toBe("partly_cloudy"); // fallback sur précédente
    expect(result.latestEnergy).toBe(60); // énergie de la plus récente
    expect(result.entriesCount7d).toBe(2);
    expect(result.energyPoints7d).toEqual([75, 60]);
  });

  it("ignore les entrées non-EMOTION", () => {
    const entries = [
      entry(1, { mood: "sunny", energy: 80 }, "MEAL"),
      entry(2, { mood: "cloudy", energy: 40 }, "EMOTION"),
    ];
    const result = aggregate(entries, NOW);
    expect(result.entriesCount7d).toBe(1);
    expect(result.latestMood).toBe("cloudy");
  });
});
