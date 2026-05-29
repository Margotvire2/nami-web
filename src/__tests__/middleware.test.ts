import { describe, it, expect, vi } from "vitest";

// Mock léger de NextResponse — on capture juste les redirections et les
// pass-through pour vérifier la logique de routing côté middleware.
const captured: { redirectUrl?: string; passThrough?: boolean } = {};

vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => {
      captured.passThrough = true;
      return { __kind: "next" } as unknown;
    }),
    redirect: vi.fn((url: URL) => {
      captured.redirectUrl = url.toString();
      return { __kind: "redirect", url: url.toString() } as unknown;
    }),
  },
}));

import { middleware } from "@/middleware";

type FakeCookies = Record<string, string>;

function makeRequest(opts: {
  pathname: string;
  cookies?: FakeCookies;
  authHeader?: string;
}) {
  const url = `https://app.example/${opts.pathname.replace(/^\//, "")}`;
  const cookies = opts.cookies ?? {};
  return {
    nextUrl: new URL(url),
    url,
    cookies: {
      get: (name: string) =>
        cookies[name] !== undefined ? { value: cookies[name] } : undefined,
    },
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "authorization" ? opts.authHeader ?? null : null,
    },
  } as unknown as Parameters<typeof middleware>[0];
}

function reset() {
  captured.redirectUrl = undefined;
  captured.passThrough = undefined;
}

describe("middleware — routing role-based post-login", () => {
  it("ORG_ADMIN pur (sans providerProfile) → redirect /structure/[firstAdminOrgId]/admin depuis /aujourd-hui", () => {
    reset();
    middleware(
      makeRequest({
        pathname: "/aujourd-hui",
        cookies: {
          "nami-access-token": "tok",
          "nami-user-role": "ORG_ADMIN",
          "nami-has-provider": "0",
          "nami-admin-org-ids": "org-rtf,org-ffab",
        },
      })
    );
    expect(captured.redirectUrl).toBe("https://app.example/structure/org-rtf/admin");
  });

  it("PROVIDER + admin membership → passe-through sur /aujourd-hui (le switcher gère côté client)", () => {
    reset();
    middleware(
      makeRequest({
        pathname: "/aujourd-hui",
        cookies: {
          "nami-access-token": "tok",
          "nami-user-role": "PROVIDER",
          "nami-has-provider": "1",
          "nami-admin-org-ids": "org-rtf",
        },
      })
    );
    expect(captured.passThrough).toBe(true);
    expect(captured.redirectUrl).toBeUndefined();
  });

  it("PROVIDER simple (sans admin membership) → passe-through sur /aujourd-hui", () => {
    reset();
    middleware(
      makeRequest({
        pathname: "/aujourd-hui",
        cookies: {
          "nami-access-token": "tok",
          "nami-user-role": "PROVIDER",
          "nami-has-provider": "1",
        },
      })
    );
    expect(captured.passThrough).toBe(true);
    expect(captured.redirectUrl).toBeUndefined();
  });

  it("ORG_ADMIN pur sans admin-org-ids cookie → passe-through (fallback layout client-side)", () => {
    reset();
    middleware(
      makeRequest({
        pathname: "/aujourd-hui",
        cookies: {
          "nami-access-token": "tok",
          "nami-user-role": "ORG_ADMIN",
          "nami-has-provider": "0",
        },
      })
    );
    expect(captured.passThrough).toBe(true);
    expect(captured.redirectUrl).toBeUndefined();
  });

  it("Pas de token → redirect /login avec ?from=", () => {
    reset();
    middleware(
      makeRequest({ pathname: "/aujourd-hui" })
    );
    expect(captured.redirectUrl).toBe("https://app.example/login?from=%2Faujourd-hui");
  });
});
