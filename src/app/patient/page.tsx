import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Calendar,
  MessageCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Espace patient — Coordonnez vos soins | Nami",
  description:
    "Trouvez un soignant, prenez vos rendez-vous, organisez votre parcours et communiquez avec votre équipe soignante. L'espace patient Nami centralise votre santé.",
  keywords: [
    "espace patient",
    "coordination soins",
    "rendez-vous médical",
    "prendre rendez-vous médecin",
    "parcours soins",
    "messagerie soignant",
    "documents médicaux",
    "trouver soignant",
  ],
  alternates: { canonical: "/patient" },
  openGraph: {
    title: "Espace patient Nami — Coordonnez vos soins en un seul endroit",
    description:
      "Trouvez un soignant, prenez vos rendez-vous, organisez votre parcours. Nami centralise votre santé.",
    url: "https://namipourlavie.com/patient",
    type: "website",
    siteName: "Nami",
    locale: "fr_FR",
    images: [
      {
        url: "/og-image-patient.svg",
        width: 1200,
        height: 630,
        alt: "Nami — Espace patient",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Espace patient Nami — Coordonnez vos soins en un seul endroit",
    description:
      "Trouvez un soignant, prenez vos rendez-vous, organisez votre parcours.",
    images: ["/og-image-patient.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Espace patient Nami",
  description:
    "Coordonnez vos soins de santé : trouvez un soignant, prenez rendez-vous, communiquez avec votre équipe.",
  url: "https://namipourlavie.com/patient",
  isPartOf: {
    "@type": "WebSite",
    name: "Nami",
    url: "https://namipourlavie.com",
  },
};

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Search,
    title: "Trouvez le bon soignant",
    description:
      "Recherchez parmi les soignants Nami selon votre besoin, votre ville et vos disponibilités.",
  },
  {
    icon: Calendar,
    title: "Prenez rendez-vous facilement",
    description:
      "Réservez vos consultations en ligne en quelques clics, recevez des rappels J-1 et J-1h.",
  },
  {
    icon: MessageCircle,
    title: "Communiquez avec votre équipe",
    description:
      "Échangez avec vos soignants en dehors des consultations, en toute simplicité et confidentialité.",
  },
  {
    icon: FileText,
    title: "Centralisez vos documents",
    description:
      "Ordonnances, bilans biologiques, comptes-rendus : tout est rassemblé et accessible à votre équipe.",
  },
];

interface Step {
  number: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "Trouvez un soignant",
    description: "Recherchez un soignant Nami selon votre spécialité et votre ville.",
  },
  {
    number: 2,
    title: "Prenez rendez-vous",
    description: "Choisissez un créneau disponible et créez votre compte en quelques secondes.",
  },
  {
    number: 3,
    title: "Suivez votre parcours",
    description: "Retrouvez vos rendez-vous, vos documents et vos messages au même endroit.",
  },
];

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: "L'utilisation de Nami est-elle gratuite pour les patients ?",
    answer:
      "Oui, Nami est entièrement gratuit pour les patients. Vous accédez à votre espace, prenez rendez-vous et communiquez avec vos soignants sans aucun coût.",
  },
  {
    question: "Mes données de santé sont-elles sécurisées ?",
    answer:
      "Vos données sont hébergées en France et conformes au RGPD. Vous gardez le contrôle de ce que vous partagez avec votre équipe soignante grâce à des consentements granulaires.",
  },
  {
    question: "Mon médecin doit-il être inscrit sur Nami ?",
    answer:
      "Oui, pour bénéficier de la coordination complète, votre médecin et votre équipe soignante doivent être inscrits sur Nami. Si ce n'est pas encore le cas, vous pouvez leur parler de Nami — c'est gratuit pour les patients et avantageux pour la coordination.",
  },
  {
    question: "Nami remplace-t-il Doctolib ?",
    answer:
      "Nami est un outil de coordination des soins qui va au-delà de la simple prise de rendez-vous. Vous pouvez certes prendre rendez-vous, mais aussi suivre votre parcours, communiquer avec votre équipe et centraliser vos documents.",
  },
  {
    question: "Nami est-il un dispositif médical ?",
    answer:
      "Non. Nami est un outil de coordination des soins, pas un dispositif médical ni un outil d'aide à la décision. Votre médecin et vos soignants restent vos interlocuteurs pour toute question médicale.",
  },
];

export default function LandingPatientPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen" style={{ background: "#FAFAF8" }}>
        {/* ─── HERO ──────────────────────────────────────────────────────── */}
        <section
          style={{ padding: "80px 24px 60px", textAlign: "center" }}
          aria-label="Présentation de l'espace patient Nami"
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{
                background: "rgba(91,78,196,0.08)",
                color: "#5B4EC4",
                border: "1px solid rgba(91,78,196,0.15)",
              }}
            >
              <Sparkles size={12} aria-hidden="true" />
              Espace patient Nami
            </div>

            <h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
              style={{
                color: "#1A1A2E",
                fontFamily: "var(--font-jakarta)",
                lineHeight: 1.05,
              }}
            >
              Coordonnez vos soins
              <br />
              <span style={{ color: "#5B4EC4" }}>en un seul endroit</span>
            </h1>

            <p
              className="text-lg md:text-xl mb-10"
              style={{
                color: "#374151",
                lineHeight: 1.5,
                maxWidth: 540,
                margin: "0 auto 40px",
              }}
            >
              Trouvez un soignant, prenez vos rendez-vous, suivez votre parcours et
              communiquez avec votre équipe soignante.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link
                href="/trouver-un-soignant"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  background: "#5B4EC4",
                  boxShadow: "0 4px 16px rgba(91,78,196,0.3)",
                }}
              >
                <Search size={16} aria-hidden="true" />
                Trouver un soignant
              </Link>
              <Link
                href="/signup?role=patient" aria-label="Créer un compte patient"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors hover:bg-[rgba(91,78,196,0.04)]"
                style={{
                  border: "1.5px solid rgba(91,78,196,0.2)",
                  color: "#5B4EC4",
                  background: "transparent",
                }}
              >
                Créer mon compte
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FEATURES ──────────────────────────────────────────────────── */}
        <section
          style={{ padding: "60px 24px", background: "#fff" }}
          aria-label="Fonctionnalités de l'espace patient"
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
                style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
              >
                Pourquoi choisir Nami
              </h2>
              <p style={{ color: "#6B7280", fontSize: 16 }}>
                4 fonctionnalités pensées pour faciliter votre quotidien de patient.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    style={{
                      padding: "28px 24px",
                      background: "#FAFAF8",
                      border: "1px solid rgba(26,26,46,0.06)",
                      borderRadius: 16,
                    }}
                  >
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                      style={{ background: "rgba(91,78,196,0.08)", color: "#5B4EC4" }}
                      aria-hidden="true"
                    >
                      <Icon size={22} strokeWidth={1.8} />
                    </div>
                    <h3
                      className="text-base font-bold mb-2"
                      style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
                    >
                      {feature.title}
                    </h3>
                    <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.5 }}>
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── COMMENT ÇA MARCHE ─────────────────────────────────────────── */}
        <section
          style={{ padding: "60px 24px", background: "#FAFAF8" }}
          aria-label="Comment ça marche"
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
                style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
              >
                Comment ça marche
              </h2>
              <p style={{ color: "#6B7280", fontSize: 16 }}>
                3 étapes simples pour commencer votre parcours.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number} style={{ textAlign: "center" }}>
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 text-xl font-bold"
                    style={{
                      background: "#5B4EC4",
                      color: "#fff",
                      fontFamily: "var(--font-jakarta)",
                    }}
                    aria-hidden="true"
                  >
                    {step.number}
                  </div>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.5 }}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRUST BADGES ──────────────────────────────────────────────── */}
        <section
          style={{ padding: "40px 24px", background: "#fff" }}
          aria-label="Garanties Nami"
        >
          <div
            style={{ maxWidth: 900, margin: "0 auto" }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
          >
            <div className="flex items-center gap-2" style={{ color: "#374151", fontSize: 13 }}>
              <Shield size={16} style={{ color: "#5B4EC4" }} aria-hidden="true" />
              Hébergement France
            </div>
            <div className="flex items-center gap-2" style={{ color: "#374151", fontSize: 13 }}>
              <CheckCircle2 size={16} style={{ color: "#5B4EC4" }} aria-hidden="true" />
              Conforme RGPD
            </div>
            <div className="flex items-center gap-2" style={{ color: "#374151", fontSize: 13 }}>
              <Users size={16} style={{ color: "#5B4EC4" }} aria-hidden="true" />
              Coordination équipe soignante
            </div>
            <div className="flex items-center gap-2" style={{ color: "#374151", fontSize: 13 }}>
              <Clock size={16} style={{ color: "#5B4EC4" }} aria-hidden="true" />
              Rappels rendez-vous automatiques
            </div>
          </div>
        </section>

        {/* ─── FAQ ───────────────────────────────────────────────────────── */}
        <section
          style={{ padding: "60px 24px", background: "#FAFAF8" }}
          aria-label="Questions fréquentes"
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="text-center mb-10">
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
                style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
              >
                Questions fréquentes
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(26,26,46,0.06)",
                    borderRadius: 12,
                    padding: "16px 20px",
                  }}
                  className="group"
                >
                  <summary
                    className="cursor-pointer font-semibold flex items-center justify-between gap-3"
                    style={{ color: "#1A1A2E", fontSize: 15 }}
                  >
                    {faq.question}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-open:rotate-90 shrink-0"
                      style={{ color: "#5B4EC4" }}
                      aria-hidden="true"
                    />
                  </summary>
                  <p
                    style={{
                      color: "#6B7280",
                      fontSize: 14,
                      lineHeight: 1.6,
                      marginTop: 12,
                    }}
                  >
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ─────────────────────────────────────────────────── */}
        <section
          style={{ padding: "80px 24px", background: "#1A1A2E", textAlign: "center" }}
          aria-label="Commencer votre parcours"
        >
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
              style={{ color: "#FAFAF8", fontFamily: "var(--font-jakarta)" }}
            >
              Commencez votre parcours santé
            </h2>
            <p
              style={{
                color: "rgba(238,236,234,0.7)",
                fontSize: 16,
                marginBottom: 32,
              }}
            >
              Trouvez un soignant Nami et coordonnez vos soins dès aujourd&apos;hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link
                href="/trouver-un-soignant"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  background: "#5B4EC4",
                  boxShadow: "0 4px 24px rgba(91,78,196,0.4)",
                }}
              >
                <Search size={16} aria-hidden="true" />
                Trouver un soignant
              </Link>
              <Link
                href="/signup?role=patient" aria-label="Créer un compte patient"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-colors hover:bg-white/5"
                style={{
                  border: "1.5px solid rgba(238,236,234,0.2)",
                  color: "rgba(238,236,234,0.85)",
                }}
              >
                Créer mon compte
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <p
              style={{
                marginTop: 32,
                fontSize: 11,
                color: "rgba(238,236,234,0.4)",
                fontStyle: "italic",
              }}
            >
              Outil de coordination · Non dispositif médical · Conforme RGPD
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
