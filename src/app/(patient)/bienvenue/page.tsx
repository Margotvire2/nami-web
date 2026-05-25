"use client";

import Link from "next/link";
import {
  Calendar,
  MessageCircle,
  FileText,
  Bell,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

// Palette Nami CLAUDE.md (hex inline car CSS vars --nami-* non définies globalement).
// Cohérent avec /mes-documents/page.tsx, /accueil/page.tsx, /mes-messages/page.tsx.
const C = {
  primary: "#5B4EC4",
  primaryLight: "rgba(91,78,196,0.08)",
  primaryBorder: "rgba(91,78,196,0.16)",
  dark: "#1A1A2E",
  text: "#374151",
  muted: "#6B7280",
  border: "rgba(26,26,46,0.06)",
  card: "#FFFFFF",
};

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: Calendar,
    title: "Mes rendez-vous",
    description:
      "Retrouvez vos consultations à venir et passées avec votre équipe soignante.",
    href: "/rendez-vous",
  },
  {
    icon: MessageCircle,
    title: "Mes messages",
    description:
      "Échangez avec vos soignants en toute simplicité, en dehors des consultations.",
    href: "/mes-messages",
  },
  {
    icon: FileText,
    title: "Mes documents",
    description:
      "Centralisez vos ordonnances, bilans biologiques et comptes-rendus médicaux.",
    href: "/mes-documents",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Recevez les rappels avant vos rendez-vous et restez informé(e) des mises à jour.",
    href: "/notifications",
  },
];

export default function BienvenuePage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName ?? "";

  return (
    <main
      style={{
        padding: "36px 28px 96px",
        maxWidth: 720,
        margin: "0 auto",
        minHeight: "100vh",
      }}
      aria-label="Bienvenue dans votre espace patient"
    >
      {/* Hero */}
      <header style={{ marginBottom: 40, textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: C.primaryLight,
            color: C.primary,
            marginBottom: 20,
          }}
          aria-hidden="true"
        >
          <Sparkles size={28} strokeWidth={1.8} />
        </div>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: C.dark,
            letterSpacing: "-0.04em",
            marginBottom: 12,
            margin: "0 0 12px 0",
          }}
        >
          {firstName ? `Bienvenue ${firstName}` : "Bienvenue sur Nami"} 👋
        </h1>

        <p
          style={{
            fontSize: 16,
            color: C.muted,
            lineHeight: 1.6,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          Votre espace personnel pour coordonner vos soins avec votre équipe
          soignante. Voici comment Nami va vous accompagner au quotidien.
        </p>
      </header>

      {/* Features grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
        aria-label="Fonctionnalités de votre espace patient"
      >
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.title}
              href={feature.href}
              style={{
                display: "block",
                padding: 24,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
                textDecoration: "none",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
              }}
              className="hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: C.primaryLight,
                  color: C.primary,
                  marginBottom: 16,
                }}
                aria-hidden="true"
              >
                <Icon size={22} strokeWidth={1.8} />
              </div>

              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: C.dark,
                  marginBottom: 8,
                  margin: "0 0 8px 0",
                }}
              >
                {feature.title}
              </h2>

              <p
                style={{
                  fontSize: 14,
                  color: C.muted,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </Link>
          );
        })}
      </section>

      {/* CTA primary + secondary */}
      <section style={{ textAlign: "center" }} aria-label="Actions">
        <Link
          href="/accueil"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 32px",
            borderRadius: 100,
            background: C.primary,
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
            transition: "opacity 0.2s",
            marginBottom: 16,
          }}
          className="hover:opacity-90"
        >
          Découvrir mon espace
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>

        <div>
          <Link
            href="/accueil"
            style={{
              fontSize: 13,
              color: C.muted,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Plus tard
          </Link>
        </div>
      </section>

      {/* Hint card */}
      <aside
        style={{
          marginTop: 40,
          padding: "16px 20px",
          borderRadius: 14,
          background: C.primaryLight,
          border: `1px solid ${C.primaryBorder}`,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
        aria-label="Information complémentaire"
      >
        <Sparkles
          size={18}
          strokeWidth={1.8}
          style={{ color: C.primary, flexShrink: 0, marginTop: 2 }}
          aria-hidden="true"
        />
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.dark,
              margin: "0 0 4px 0",
            }}
          >
            Votre équipe soignante vous accompagne
          </p>
          <p
            style={{
              fontSize: 13,
              color: C.text,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Nami est un outil de coordination — votre médecin et vos soignants
            restent vos interlocuteurs pour toute question médicale.
          </p>
        </div>
      </aside>
    </main>
  );
}
