import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  membershipRequestsApi,
  organizationMembersApi,
  organizationsApi,
} from "@/lib/api";

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// Walker récursif pour grep dans src/ — utilisé par le test anti-régression.
function walkSrc(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === "dist") continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walkSrc(full, out);
    else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".test.ts") && !entry.endsWith(".test.tsx")) {
      out.push(full);
    }
  }
  return out;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("nouveaux endpoints membership (PR backend #73)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("membershipRequestsApi.create → POST /organizations/:orgId/membership-requests", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(makeJsonResponse({ id: "req-1", organizationId: "org-rtf", personId: "p-1", status: "PENDING", createdAt: "2026-05-29T10:00:00Z" }));

    await membershipRequestsApi.create("tok", "org-rtf", "Hello");

    const [url, init] = lastFetchCall(fetchSpy);
    expect(url).toContain("/organizations/org-rtf/membership-requests");
    expect((init as RequestInit).method).toBe("POST");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ message: "Hello" });
  });

  it("membershipRequestsApi.update → PATCH /membership-requests/:id", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(makeJsonResponse({ id: "req-1", organizationId: "org-rtf", personId: "p-1", status: "ACCEPTED", createdAt: "2026-05-29T10:00:00Z" }));

    await membershipRequestsApi.update("tok", "req-1", { status: "ACCEPTED" });

    const [url, init] = lastFetchCall(fetchSpy);
    expect(url).toContain("/membership-requests/req-1");
    expect((init as RequestInit).method).toBe("PATCH");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ status: "ACCEPTED" });
  });

  it("organizationMembersApi.update → PATCH /organization-members/:id (lifecycle)", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(makeJsonResponse({ id: "mem-1", organizationId: "org-rtf", personId: "p-1", memberRole: "MEMBER", status: "INACTIVE", directoryVisibility: "ORG_ONLY" }));

    await organizationMembersApi.update("tok", "mem-1", {
      status: "INACTIVE",
      directoryVisibility: "ORG_ONLY",
    });

    const [url, init] = lastFetchCall(fetchSpy);
    expect(url).toContain("/organization-members/mem-1");
    expect((init as RequestInit).method).toBe("PATCH");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      status: "INACTIVE",
      directoryVisibility: "ORG_ONLY",
    });
  });

  it("organizationsApi.mine → GET /organizations/mine", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(makeJsonResponse([]));

    await organizationsApi.mine("tok");

    const [url, init] = lastFetchCall(fetchSpy);
    expect(url).toContain("/organizations/mine");
    expect((init as RequestInit).method ?? "GET").toBe("GET");
  });
});

describe("anti-régression — endpoint deprecated PR #73", () => {
  it("aucun fichier src/ n'appelle PATCH /organizations/:id/members/:memberId", () => {
    const srcDir = join(process.cwd(), "src");
    const files = walkSrc(srcDir);
    // src/lib/api.ts garde une mention volontaire de l'ancien chemin dans le
    // commentaire de doc des nouveaux helpers (cf. PR breaking change #73)
    // → on l'exclut du scan.
    const exclude = new Set([join(srcDir, "lib", "api.ts")]);
    const regex = /\/organizations\/[^/\s'"]+\/members\/[^/\s'"`)]+/;
    const offenders: string[] = [];
    for (const f of files) {
      if (exclude.has(f)) continue;
      const content = readFileSync(f, "utf-8");
      if (regex.test(content)) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });
});
