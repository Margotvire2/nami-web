import { describe, it, expect, vi, beforeEach } from "vitest";

import { organizationsApi, isRcpPickerEligible } from "@/lib/api";

function makeJsonResponse<T>(body: T, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function lastFetchCall(spy: ReturnType<typeof vi.spyOn>) {
  const calls = spy.mock.calls;
  return calls[calls.length - 1];
}

describe("organizationsApi.membersForRcpPicker (INIT-489)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /organizations/:orgId/members/for-rcp-picker", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      makeJsonResponse({
        organization: { id: "org-1", name: "Réseau X", type: "NETWORK", logoUrl: null },
        members: [],
      })
    );

    await organizationsApi.membersForRcpPicker("tok", "org-1");

    const [url, init] = lastFetchCall(fetchSpy);
    expect(url).toContain("/organizations/org-1/members/for-rcp-picker");
    expect((init as RequestInit).method ?? "GET").toBe("GET");
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: "Bearer tok",
    });
  });

  it("retourne le payload typé { organization, members[] }", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      makeJsonResponse({
        organization: { id: "org-1", name: "Réseau X", type: "NETWORK", logoUrl: null },
        members: [
          {
            personId: "p-1",
            firstName: "Anna",
            lastName: "Durand",
            photoUrl: null,
            specialty: "Psychiatrie",
            memberRole: "PROVIDER",
          },
        ],
      })
    );

    const res = await organizationsApi.membersForRcpPicker("tok", "org-1");
    expect(res.organization.name).toBe("Réseau X");
    expect(res.members).toHaveLength(1);
    expect(res.members[0].specialty).toBe("Psychiatrie");
  });
});

describe("organizationsApi.membersDirectory (INIT-494)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /organizations/:orgId/members/directory sans filtre", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      makeJsonResponse({
        organization: { id: "org-1", name: "Réseau X", type: "NETWORK", logoUrl: null },
        viewer: "MEMBER",
        members: [],
      })
    );

    await organizationsApi.membersDirectory("tok", "org-1");

    const [url] = lastFetchCall(fetchSpy);
    expect(url).toContain("/organizations/org-1/members/directory");
    expect(url).not.toContain("?");
  });

  it("encode les filtres specialty + city en query params", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      makeJsonResponse({
        organization: { id: "org-1", name: "Réseau X", type: "NETWORK", logoUrl: null },
        viewer: "MEMBER",
        members: [],
      })
    );

    await organizationsApi.membersDirectory("tok", "org-1", {
      specialty: "Diététique",
      city: "Lyon",
    });

    const [url] = lastFetchCall(fetchSpy);
    const urlStr = url as string;
    expect(urlStr).toContain("specialty=Di%C3%A9t%C3%A9tique");
    expect(urlStr).toContain("city=Lyon");
  });

  it("ignore les filtres vides", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      makeJsonResponse({
        organization: { id: "org-1", name: "Réseau X", type: "NETWORK", logoUrl: null },
        viewer: "ANON",
        members: [],
      })
    );

    await organizationsApi.membersDirectory("tok", "org-1", { specialty: "", city: undefined });

    const [url] = lastFetchCall(fetchSpy);
    expect(url).not.toContain("?");
  });
});

describe("isRcpPickerEligible — whitelist alignée backend PR #81", () => {
  it.each([
    ["NETWORK", true],
    ["FEDERATION", true],
    ["CPTS", true],
    ["HOSPITAL", true],
    ["HOSPITAL_SERVICE", true],
    ["MSP", true],
    ["PRIVATE_PRACTICE", false],
    ["CLINIC", false],
    ["HEALTH_CENTER", false],
    ["ASSOCIATION", false],
    ["INTERNAL", false],
    ["ACCELERATEUR", false],
    ["UNKNOWN_TYPE", false],
  ])("kind %s → %s", (kind, expected) => {
    expect(isRcpPickerEligible(kind)).toBe(expected);
  });
});
