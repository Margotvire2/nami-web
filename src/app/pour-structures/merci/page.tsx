"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";

function MerciInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [copied, setCopied] = useState(false);

  // En SSR / preview sans NEXT_PUBLIC_SITE_URL : on retombe sur le pathname
  // relatif. Suffisant pour copier le lien — le navigateur le résoudra.
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://namipourlavie.com";
  const trackingUrl = token ? `${base}/pour-structures/suivi/${token}` : "";

  async function copy() {
    if (!trackingUrl) return;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main
      style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        background: "#FAFAF8",
        color: "#1A1A2E",
        minHeight: "100vh",
        padding: "140px 24px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          aria-hidden
          style={{
            width: 72,
            height: 72,
            margin: "0 auto 24px",
            borderRadius: 999,
            background:
              "linear-gradient(135deg, #5B4EC4, #2BA89C)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: 32,
            fontWeight: 700,
            boxShadow: "0 10px 28px rgba(91,78,196,0.28)",
          }}
        >
          ✓
        </div>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
            fontWeight: 700,
            marginBottom: 12,
            letterSpacing: "-0.02em",
          }}
        >
          Votre demande a bien été reçue
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "#374151",
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          L&apos;équipe Nami examinera votre candidature et vous répondra par
          email sous <strong>24 à 48 heures</strong>. Conservez le lien de
          suivi ci-dessous pour consulter ou retirer votre demande à tout
          moment.
        </p>

        {token ? (
          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "#FFFFFF",
              border: "1px solid rgba(26,26,46,0.08)",
              textAlign: "left",
              marginBottom: 32,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Votre lien de suivi
            </span>
            <code
              data-testid="tracking-url"
              style={{
                display: "block",
                padding: "10px 12px",
                background: "#FAFAF8",
                borderRadius: 8,
                fontSize: 13,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, monospace",
                wordBreak: "break-all",
                color: "#1A1A2E",
                marginBottom: 12,
              }}
            >
              {trackingUrl}
            </code>
            <div
              style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
            >
              <button
                type="button"
                onClick={copy}
                data-testid="copy-tracking"
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(91,78,196,0.3)",
                  background: copied ? "#F2F0FB" : "#FFFFFF",
                  color: "#5B4EC4",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {copied ? "Lien copié ✓" : "Copier le lien"}
              </button>
              <Link
                href={`/pour-structures/suivi/${token}`}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  background:
                    "linear-gradient(135deg, #5B4EC4, #2BA89C)",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Voir le suivi
              </Link>
            </div>
          </div>
        ) : (
          <p
            style={{
              padding: 16,
              borderRadius: 12,
              background: "#FEF3C7",
              color: "#92400E",
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            Aucun lien de suivi détecté dans l&apos;URL. Vérifiez votre boîte
            mail — un email de confirmation contient votre lien de suivi.
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              padding: "12px 22px",
              borderRadius: 999,
              border: "1px solid rgba(26,26,46,0.12)",
              background: "#FFFFFF",
              color: "#1A1A2E",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function MerciPage() {
  return (
    <>
      <PublicNavbar />
      <Suspense
        fallback={
          <main style={{ minHeight: "100vh", padding: 120, textAlign: "center" }}>
            Chargement…
          </main>
        }
      >
        <MerciInner />
      </Suspense>
      <PublicFooter />
    </>
  );
}
