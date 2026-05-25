"use client";

import Link from "next/link";
import { Route, ArrowRight, Sparkles } from "lucide-react";

export default function ParcoursPage() {
  return (
    <div
      style={{
        padding: "36px 28px 96px",
        maxWidth: 680,
        margin: "0 auto",
        background: "var(--nami-bg)",
        minHeight: "100vh",
      }}
      aria-label="Mon parcours de soins"
    >
      <header style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: "var(--nami-dark)",
            letterSpacing: "-0.04em",
            fontFamily: "var(--font-jakarta)",
          }}
        >
          Mon parcours
        </h1>
        <p style={{ fontSize: 15, color: "var(--nami-text-muted)", marginTop: 6 }}>
          Suivez les étapes de votre prise en charge avec votre équipe soignante.
        </p>
      </header>

      <section
        style={{
          background: "var(--nami-card)",
          borderRadius: 20,
          border: "1px solid var(--nami-border)",
          padding: "48px 32px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--nami-primary-light)",
            color: "var(--nami-primary)",
            marginBottom: 20,
          }}
          aria-hidden="true"
        >
          <Route size={28} strokeWidth={1.8} />
        </div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--nami-dark)",
            marginBottom: 12,
            fontFamily: "var(--font-jakarta)",
          }}
        >
          Bientôt disponible
        </h2>

        <p
          style={{
            fontSize: 15,
            color: "var(--nami-text-muted)",
            lineHeight: 1.6,
            maxWidth: 420,
            margin: "0 auto 24px",
          }}
        >
          Cette page affichera bientôt les étapes de votre parcours
          (consultations, examens, suivis). En attendant, retrouvez vos rendez-vous
          et messages depuis le menu.
        </p>

        <Link
          href="/accueil"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 100,
            background: "var(--nami-primary)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
            transition: "background 0.2s",
          }}
        >
          Retour à l&apos;accueil
          <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </section>

      <aside
        style={{
          marginTop: 24,
          padding: "16px 20px",
          borderRadius: 14,
          background: "var(--nami-primary-light)",
          border: "1px solid rgba(91,78,196,0.16)",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <Sparkles
          size={18}
          strokeWidth={1.8}
          style={{ color: "var(--nami-primary)", flexShrink: 0, marginTop: 2 }}
          aria-hidden="true"
        />
        <p style={{ fontSize: 13, color: "var(--nami-dark)", lineHeight: 1.5, margin: 0 }}>
          Nous travaillons activement à enrichir cette page pour vous proposer
          une vue claire de votre parcours.
        </p>
      </aside>
    </div>
  );
}
