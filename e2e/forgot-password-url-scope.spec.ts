import { test, expect, type APIRequestContext } from "@playwright/test";

// F-UX-PATIENT-V1-LAUNCH-1 — smoke E2E de /auth/forgot-password.
//
// Le contenu de l'email (URL scopée par rôle : patient → namipourlavie.com,
// soignant → app.namipourlavie.com) n'est pas observable depuis E2E sans
// boîte mail. On valide donc les invariants OBSERVABLES côté client qui
// garantissent l'anti-énumération (OWASP) :
//
//   1. Email PATIENT existant → réponse 200 + message neutre.
//   2. Email PROVIDER existant → réponse 200 + message neutre IDENTIQUE.
//   3. Email inexistant → réponse 200 + message neutre IDENTIQUE +
//      timing dans la même fenêtre que les cas existants (anti-énumération
//      par chronométrage).
//
// Le backend (constantTimingResponse) garantit `target = random(200, 400)` ms.
// On vérifie donc : (a) chaque appel se situe au-dessus du plancher 200 ms,
// (b) le delta entre cas existant et cas inexistant reste sous une borne
// raisonnable absorbant la variance intrinsèque du target aléatoire.
//
// Rate limit backend : passwordResetLimiter = 5 / 1 h / IP. La spec ne fait
// que 3 appels pour rester confortablement sous la limite et coexister avec
// les autres suites.

const API_BASE = "https://nami-production-f268.up.railway.app";

const PATIENT_EMAIL = "gabrielle.martin@nami-demo.fr";
const PROVIDER_EMAIL = "margot.vire.diet@nami-demo.fr";
const UNKNOWN_EMAIL = `e2e-unknown-${Date.now()}@nami-demo.invalid`;

const NEUTRAL_MESSAGE =
  "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.";

// Plancher imposé par constantTimingResponse (min 200ms) — on accepte 180ms
// pour absorber les imprécisions de mesure côté client.
const TIMING_FLOOR_MS = 180;
const TIMING_CEIL_MS = 1500; // plafond très large pour absorber la latence Railway.
// Delta max entre 2 appels. constantTimingResponse impose elapsed ≥ random(200,400),
// donc variance intrinsèque ~200ms + jitter réseau. Si on supprimait
// constantTimingResponse, l'écart valid-vs-invalid grimperait au-delà de 500ms
// (DB lookup absent côté inexistant). 450ms attrape cette régression sans
// flakiness.
const MAX_DELTA_MS = 450;

async function timedPost(
  request: APIRequestContext,
  email: string
): Promise<{ status: number; body: unknown; elapsedMs: number }> {
  const t0 = Date.now();
  const res = await request.post(`${API_BASE}/auth/forgot-password`, {
    data: { email },
    headers: { "content-type": "application/json" },
  });
  const elapsedMs = Date.now() - t0;
  const body = await res.json().catch(() => ({}));
  return { status: res.status(), body, elapsedMs };
}

function skipIfRateLimited(status: number, body: unknown): boolean {
  if (status === 429) {
    test.skip(
      true,
      `Rate limit passwordResetLimiter atteint (status ${status}, body ${JSON.stringify(body)}).`
    );
    return true;
  }
  return false;
}

test.describe("Forgot password — URL scope + anti-énumération", () => {
  test("email PATIENT existant → 200 + message neutre + timing >= 200ms", async ({
    request,
  }) => {
    const r = await timedPost(request, PATIENT_EMAIL);
    if (skipIfRateLimited(r.status, r.body)) return;

    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ message: NEUTRAL_MESSAGE });
    expect(r.elapsedMs).toBeGreaterThanOrEqual(TIMING_FLOOR_MS);
    expect(r.elapsedMs).toBeLessThanOrEqual(TIMING_CEIL_MS);
  });

  test("email PROVIDER existant → réponse strictement identique au cas patient", async ({
    request,
  }) => {
    const r = await timedPost(request, PROVIDER_EMAIL);
    if (skipIfRateLimited(r.status, r.body)) return;

    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ message: NEUTRAL_MESSAGE });
    expect(r.elapsedMs).toBeGreaterThanOrEqual(TIMING_FLOOR_MS);
    expect(r.elapsedMs).toBeLessThanOrEqual(TIMING_CEIL_MS);
  });

  test("email inexistant → 200 + même message + delta timing borné vs cas existant", async ({
    request,
  }) => {
    const existing = await timedPost(request, PATIENT_EMAIL);
    if (skipIfRateLimited(existing.status, existing.body)) return;

    const unknown = await timedPost(request, UNKNOWN_EMAIL);
    if (skipIfRateLimited(unknown.status, unknown.body)) return;

    expect(unknown.status).toBe(200);
    expect(unknown.body).toMatchObject({ message: NEUTRAL_MESSAGE });
    expect(unknown.elapsedMs).toBeGreaterThanOrEqual(TIMING_FLOOR_MS);
    expect(unknown.elapsedMs).toBeLessThanOrEqual(TIMING_CEIL_MS);

    const delta = Math.abs(existing.elapsedMs - unknown.elapsedMs);
    expect(
      delta,
      `delta=${delta}ms (existing=${existing.elapsedMs}ms, unknown=${unknown.elapsedMs}ms)`
    ).toBeLessThanOrEqual(MAX_DELTA_MS);
  });
});
