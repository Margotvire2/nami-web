import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Client as NotionClient } from "@notionhq/client";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type LeadPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialty: string;
  structure?: string;
  patientVolume?: string;
  source?: string;
  message?: string;
  isHot: boolean;
};

// ─── Sub-task 1 : stockage DB via backend Express ────────────────────────────
async function saveToBackend(data: LeadPayload): Promise<{ id: string }> {
  const res = await fetch(`${BACKEND_URL}/demo-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Backend /demo-requests returned ${res.status}`);
  }
  return res.json();
}

// ─── Sub-task 2 : push Notion (skip si vars manquantes) ──────────────────────
async function pushToNotion(data: LeadPayload): Promise<void> {
  const apiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_DEMO_DB_ID;
  if (!apiKey || !dbId) {
    console.warn("[notion] Skipped — NOTION_API_KEY ou NOTION_DEMO_DB_ID manquant");
    return;
  }
  const notion = new NotionClient({ auth: apiKey });
  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Name: { title: [{ text: { content: `${data.firstName} ${data.lastName}` } }] },
      Email: { email: data.email },
      ...(data.phone ? { Téléphone: { phone_number: data.phone } } : {}),
      Spécialité: { rich_text: [{ text: { content: data.specialty } }] },
      ...(data.structure
        ? { Structure: { rich_text: [{ text: { content: data.structure } }] } }
        : {}),
      ...(data.patientVolume
        ? { "Volume patients": { rich_text: [{ text: { content: data.patientVolume } }] } }
        : {}),
      ...(data.source
        ? { Source: { rich_text: [{ text: { content: data.source } }] } }
        : {}),
      ...(data.message
        ? { Message: { rich_text: [{ text: { content: data.message } }] } }
        : {}),
      Score: { select: { name: data.isHot ? "🔥 Chaud" : "📋 Standard" } },
    },
  });
}

// ─── Sub-task 3 : email Margot (notification immédiate) ──────────────────────
async function sendEmailToMargot(
  resend: Resend,
  data: LeadPayload,
  scoreLabel: string,
): Promise<void> {
  await resend.emails.send({
    from: "Nami <noreply@namipourlavie.com>",
    to: "margot@namipourlavie.com",
    subject: `${scoreLabel} — ${data.firstName} ${data.lastName} (${data.specialty})`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FAFAF8; border-radius: 12px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 800; color: #5B4EC4;">nami</span>
          <span style="font-size: 14px; font-weight: 600; padding: 4px 12px; border-radius: 100px; background: ${data.isHot ? "#FEF3C7" : "#EDE9FF"}; color: ${data.isHot ? "#92400E" : "#5B4EC4"};">${scoreLabel}</span>
        </div>
        <h2 style="font-size: 20px; color: #1A1A2E; margin: 0 0 20px;">Nouvelle demande de démo</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px; width: 140px;">Prénom / Nom</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px; font-weight: 600;">${data.firstName} ${data.lastName}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #5B4EC4;">${data.email}</a></td></tr>
          ${data.phone ? `<tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Téléphone</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px;">${data.phone}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Spécialité</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px;">${data.specialty}</td></tr>
          ${data.structure ? `<tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Structure</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px;">${data.structure}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Volume patients</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px; font-weight: ${data.isHot ? "700" : "400"};">${data.patientVolume || "Non précisé"}</td></tr>
          ${data.source ? `<tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Source</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px;">${data.source}</td></tr>` : ""}
        </table>
        ${data.message ? `<div style="margin-top: 16px; padding: 16px; background: #F5F3EF; border-radius: 8px;"><p style="font-size: 13px; color: #6B7280; margin: 0 0 6px;">Message</p><p style="font-size: 14px; color: #1A1A2E; margin: 0; line-height: 1.6;">${data.message}</p></div>` : ""}
        <div style="margin-top: 24px;">
          <a href="mailto:${data.email}?subject=Votre demande de démo Nami" style="display: inline-block; background: #5B4EC4; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none;">Répondre à ${data.firstName}</a>
        </div>
      </div>
    `,
  });
}

// ─── Sub-task 4 : auto-reply demandeur ───────────────────────────────────────
async function sendAutoReply(resend: Resend, data: LeadPayload): Promise<void> {
  await resend.emails.send({
    from: "Nami <noreply@namipourlavie.com>",
    to: data.email,
    subject: `Votre demande de démo Nami — confirmation`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
        <div style="margin-bottom: 28px;">
          <span style="font-size: 22px; font-weight: 800; color: #5B4EC4;">nami</span>
        </div>
        <h2 style="font-size: 20px; color: #1A1A2E; margin: 0 0 12px;">Bonjour ${data.firstName},</h2>
        <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 16px;">
          Merci pour votre intérêt pour Nami. J'ai bien reçu votre demande et je vous recontacte personnellement dans les 24 heures pour organiser une démo adaptée à votre contexte.
        </p>
        <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0 0 24px;">
          En attendant, vous pouvez explorer les fiches pathologies et l'annuaire des soignants en accès libre sur namipourlavie.com.
        </p>
        <a href="https://namipourlavie.com/pathologies" style="display: inline-block; background: #5B4EC4; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 32px;">Explorer les pathologies</a>
        <div style="border-top: 1px solid rgba(26,26,46,0.08); padding-top: 20px;">
          <p style="font-size: 13px; color: #6B7280; margin: 0; line-height: 1.6;">
            Margot Vire — Fondatrice de Nami<br />
            Diététicienne spécialisée TCA<br />
            <a href="mailto:margot@namipourlavie.com" style="color: #5B4EC4;">margot@namipourlavie.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Route handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await req.json();
    const {
      firstName, lastName, email, phone,
      specialty, structure, patientVolume, source, message,
    } = body;

    if (!firstName || !lastName || !email || !specialty) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const isHot =
      patientVolume === "Plus de 100" || patientVolume === "Je coordonne un réseau";
    const scoreLabel = isHot ? "🔥 LEAD CHAUD" : "📋 Lead standard";

    const data: LeadPayload = {
      firstName, lastName, email, phone,
      specialty, structure, patientVolume, source, message,
      isHot,
    };

    // 4 destinations en parallèle, aucune ne bloque les autres
    const results = await Promise.allSettled([
      saveToBackend(data),                       // 0. DB (source de vérité)
      sendEmailToMargot(resend, data, scoreLabel), // 1. notification Margot
      sendAutoReply(resend, data),               // 2. auto-reply demandeur
      pushToNotion(data),                        // 3. CRM Notion
    ]);

    // Log toute défaillance partielle
    const labels = ["DB backend", "email Margot", "auto-reply", "Notion"];
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.warn(`[demo-request] ${labels[i]} a échoué:`, r.reason);
      }
    });

    // Si la DB ET l'email Margot ont échoué = lead réellement perdu → 500
    if (results[0].status === "rejected" && results[1].status === "rejected") {
      return NextResponse.json(
        { error: "Impossible de traiter votre demande, réessayez ou contactez margot@namipourlavie.com" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[demo-request] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
