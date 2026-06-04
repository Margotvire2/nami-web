import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * POST /api/contact-support — F-PAGE-CONTACT-SUPPORT-V1.
 *
 * Reçoit un message du formulaire /contact, valide côté serveur, applique un
 * rate limit en mémoire (anti-spam basique) et envoie deux emails Resend :
 *   1. notification interne → support@namipourlavie.com
 *   2. accusé de réception → l'expéditeur
 *
 * Si RESEND_API_KEY n'est pas configurée, le handler log et renvoie 200 pour
 * ne pas bloquer le formulaire (le contact direct par mailto reste documenté
 * en UI).
 *
 * Discipline MDR/RGPD :
 * - Aucune donnée clinique n'est traitée par ce canal (rappel UI au patient).
 * - Pas de stockage long terme côté Next.js (les logs Resend font foi).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@namipourlavie.com";
const FROM_EMAIL = process.env.CONTACT_SUPPORT_FROM || "Nami Support <noreply@namipourlavie.com>";

// ─── Rate limit en mémoire ──────────────────────────────────────────────────
// Anti-spam basique : 5 messages / heure / IP. Suffisant pour bloquer un
// scraper naïf. Pour un hardening avancé (Redis, fingerprint), ticket V2.

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1h
const RATE_LIMIT_MAX = 5;

type RateBucket = { count: number; resetAt: number };
const buckets = new Map<string, RateBucket>();

function takeToken(ip: string, now: number): { ok: true } | { ok: false; resetAt: number } {
  const bucket = buckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true };
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return { ok: false, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return { ok: true };
}

// Purge passive (déclenchée à chaque take) pour limiter la taille Map.
function purgeExpired(now: number) {
  if (buckets.size < 1000) return;
  for (const [k, v] of buckets) {
    if (now >= v.resetAt) buckets.delete(k);
  }
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "anon";
}

// ─── Validation ─────────────────────────────────────────────────────────────

const ALLOWED_SUBJECTS = new Set([
  "patient",
  "soignant",
  "compte",
  "rgpd",
  "partenariat",
  "autre",
]);

const SUBJECT_LABELS: Record<string, string> = {
  patient: "Patient ou proche",
  soignant: "Professionnel de santé",
  compte: "Question sur mon compte",
  rgpd: "Protection des données (RGPD)",
  partenariat: "Partenariat ou institutionnel",
  autre: "Autre",
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ContactBody = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function parseBody(raw: unknown): ContactBody | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name.trim() : "";
  const email = typeof r.email === "string" ? r.email.trim() : "";
  const subject = typeof r.subject === "string" ? r.subject.trim() : "";
  const message = typeof r.message === "string" ? r.message.trim() : "";

  if (name.length < 2 || name.length > 120) return null;
  if (!isValidEmail(email)) return null;
  if (!ALLOWED_SUBJECTS.has(subject)) return null;
  if (message.length < 10 || message.length > 4000) return null;

  return { name, email, subject, message };
}

// ─── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const now = Date.now();
  purgeExpired(now);

  const ip = clientIp(req);
  const limit = takeToken(ip, now);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error:
          "Trop de demandes envoyées récemment. Merci de réessayer dans une heure ou écrivez à support@namipourlavie.com.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.max(1, Math.ceil((limit.resetAt - now) / 1000)).toString(),
        },
      },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide." }, { status: 400 });
  }

  const body = parseBody(raw);
  if (!body) {
    return NextResponse.json(
      { error: "Champs invalides ou manquants. Vérifiez le formulaire." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Mode degradé : pas d'envoi mais on ne bloque pas l'UX. Le mailto
    // direct reste documenté en UI.
    console.warn(
      "[contact-support] RESEND_API_KEY absent — message reçu mais non envoyé",
      { subject: body.subject, email: body.email },
    );
    return NextResponse.json({ success: true, mode: "logged-only" });
  }

  const resend = new Resend(apiKey);
  const subjectLabel = SUBJECT_LABELS[body.subject] ?? body.subject;
  const safeName = escapeHtml(body.name);
  const safeEmail = escapeHtml(body.email);
  const safeSubject = escapeHtml(subjectLabel);
  const safeMessage = escapeHtml(body.message).replace(/\n/g, "<br />");

  try {
    const results = await Promise.allSettled([
      // Notification interne
      resend.emails.send({
        from: FROM_EMAIL,
        to: SUPPORT_EMAIL,
        replyTo: body.email,
        subject: `[Contact ${subjectLabel}] ${body.name}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="font-size: 18px; color: #1A1A2E; margin: 0 0 16px;">Nouveau message de contact</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #6B7280; font-size: 13px; width: 120px;">Nom</td><td style="padding: 6px 0; color: #1A1A2E; font-size: 14px;">${safeName}</td></tr>
              <tr><td style="padding: 6px 0; color: #6B7280; font-size: 13px;">Email</td><td style="padding: 6px 0;"><a href="mailto:${safeEmail}" style="color: #5B4EC4;">${safeEmail}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #6B7280; font-size: 13px;">Sujet</td><td style="padding: 6px 0; color: #1A1A2E; font-size: 14px;">${safeSubject}</td></tr>
            </table>
            <div style="margin-top: 16px; padding: 16px; background: #F5F3EF; border-radius: 8px;">
              <p style="font-size: 13px; color: #6B7280; margin: 0 0 6px;">Message</p>
              <p style="font-size: 14px; color: #1A1A2E; margin: 0; line-height: 1.6;">${safeMessage}</p>
            </div>
          </div>
        `,
      }),
      // Accusé de réception
      resend.emails.send({
        from: FROM_EMAIL,
        to: body.email,
        subject: "Nami — bien reçu, nous revenons vers vous",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="font-size: 18px; color: #1A1A2E; margin: 0 0 12px;">Bonjour ${safeName},</h2>
            <p style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0 0 14px;">
              Nous avons bien reçu votre message (sujet : <strong>${safeSubject}</strong>). Notre équipe vous répondra sous 48 heures ouvrées.
            </p>
            <p style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0 0 14px;">
              <strong>En cas d'urgence vitale</strong>, ce canal n'est pas adapté : appelez le <strong>15</strong> (SAMU), le <strong>112</strong> (urgences européennes), ou le <strong>3114</strong> (prévention du suicide).
            </p>
            <p style="font-size: 12px; color: #6B7280; margin: 16px 0 0;">
              Nami n'est pas un dispositif médical. Aucune information fournie ne constitue un avis médical.
            </p>
          </div>
        `,
      }),
    ]);

    // Si la notification interne a échoué, on signale une erreur — l'accusé
    // de réception seul ne sert à rien si l'équipe ne voit pas le message.
    if (results[0].status === "rejected") {
      console.error("[contact-support] notif support a échoué", results[0].reason);
      return NextResponse.json(
        {
          error:
            "Impossible d'envoyer votre message pour le moment. Merci d'écrire directement à support@namipourlavie.com.",
        },
        { status: 502 },
      );
    }
    if (results[1].status === "rejected") {
      console.warn("[contact-support] accusé de réception a échoué", results[1].reason);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact-support] erreur inattendue", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// Helpers exportés pour les tests.
export const __test__ = {
  parseBody,
  isValidEmail,
  ALLOWED_SUBJECTS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
};
