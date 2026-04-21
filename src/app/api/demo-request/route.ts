import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, email, phone,
      specialty, structure, patientVolume, source, message,
    } = body;

    if (!firstName || !lastName || !email || !specialty) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const isHot = patientVolume === "Plus de 100" || patientVolume === "Je coordonne un réseau";
    const scoreLabel = isHot ? "🔥 LEAD CHAUD" : "📋 Lead standard";

    // Email to Margot
    await resend.emails.send({
      from: "Nami <noreply@namipourlavie.com>",
      to: "margot.vire.pro@gmail.com",
      subject: `${scoreLabel} — ${firstName} ${lastName} (${specialty})`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FAFAF8; border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 800; color: #5B4EC4;">nami</span>
            <span style="font-size: 14px; font-weight: 600; padding: 4px 12px; border-radius: 100px; background: ${isHot ? "#FEF3C7" : "#EDE9FF"}; color: ${isHot ? "#92400E" : "#5B4EC4"};">${scoreLabel}</span>
          </div>
          <h2 style="font-size: 20px; color: #1A1A2E; margin: 0 0 20px;">Nouvelle demande de démo</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #8A8A96; font-size: 13px; width: 140px;">Prénom / Nom</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px; font-weight: 600;">${firstName} ${lastName}</td></tr>
            <tr><td style="padding: 8px 0; color: #8A8A96; font-size: 13px;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #5B4EC4;">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; color: #8A8A96; font-size: 13px;">Téléphone</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px;">${phone}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #8A8A96; font-size: 13px;">Spécialité</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px;">${specialty}</td></tr>
            ${structure ? `<tr><td style="padding: 8px 0; color: #8A8A96; font-size: 13px;">Structure</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px;">${structure}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #8A8A96; font-size: 13px;">Volume patients</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px; font-weight: ${isHot ? "700" : "400"};">${patientVolume || "Non précisé"}</td></tr>
            ${source ? `<tr><td style="padding: 8px 0; color: #8A8A96; font-size: 13px;">Source</td><td style="padding: 8px 0; color: #1A1A2E; font-size: 14px;">${source}</td></tr>` : ""}
          </table>
          ${message ? `<div style="margin-top: 16px; padding: 16px; background: #F5F3EF; border-radius: 8px;"><p style="font-size: 13px; color: #8A8A96; margin: 0 0 6px;">Message</p><p style="font-size: 14px; color: #1A1A2E; margin: 0; line-height: 1.6;">${message}</p></div>` : ""}
          <div style="margin-top: 24px;">
            <a href="mailto:${email}?subject=Votre demande de démo Nami" style="display: inline-block; background: #5B4EC4; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none;">Répondre à ${firstName}</a>
          </div>
        </div>
      `,
    });

    // Auto-reply to requester
    await resend.emails.send({
      from: "Margot de Nami <margot@namipourlavie.com>",
      to: email,
      subject: `Votre demande de démo Nami — confirmation`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
          <div style="margin-bottom: 28px;">
            <span style="font-size: 22px; font-weight: 800; color: #5B4EC4;">nami</span>
          </div>
          <h2 style="font-size: 20px; color: #1A1A2E; margin: 0 0 12px;">Bonjour ${firstName},</h2>
          <p style="font-size: 15px; color: #4A4A5A; line-height: 1.7; margin: 0 0 16px;">
            Merci pour votre intérêt pour Nami. J'ai bien reçu votre demande et je vous recontacte personnellement dans les 24 heures pour organiser une démo adaptée à votre contexte.
          </p>
          <p style="font-size: 15px; color: #4A4A5A; line-height: 1.7; margin: 0 0 24px;">
            En attendant, vous pouvez explorer les fiches pathologies et l'annuaire des soignants en accès libre sur namipourlavie.com.
          </p>
          <a href="https://namipourlavie.com/pathologies" style="display: inline-block; background: #5B4EC4; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 32px;">Explorer les pathologies</a>
          <div style="border-top: 1px solid rgba(26,26,46,0.08); padding-top: 20px;">
            <p style="font-size: 13px; color: #8A8A96; margin: 0; line-height: 1.6;">
              Margot Vire — Fondatrice de Nami<br />
              Diététicienne spécialisée TCA<br />
              <a href="mailto:margot@namipourlavie.com" style="color: #5B4EC4;">margot@namipourlavie.com</a>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("demo-request error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
