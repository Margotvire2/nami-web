import Link from "next/link";
import type { Metadata } from "next";
import { Users, TrendingUp, Send, BookOpen } from "lucide-react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Nami — Coordination des parcours de soins complexes",
  description:
    "Nami orchestre les parcours de soins complexes entre professionnels de santé. TCA, obésité, pédiatrie, nutrition pluridisciplinaire. Dossier partagé, adressage, base de connaissances.",
  openGraph: {
    title: "Nami — Coordination des parcours de soins complexes",
    description:
      "Nami centralise et structure l'information de coordination au sein de l'équipe pluridisciplinaire.",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
};

const PILLARS = [
  {
    icon: Users,
    title: "Coordination d'équipe",
    description:
      "Un dossier partagé, une activité commune. Chaque soignant voit ce que les autres ont documenté.",
  },
  {
    icon: TrendingUp,
    title: "Organisation du parcours",
    description:
      "Courbes de poids, bilans biologiques, indicateurs de progression. L'histoire du patient en un coup d'œil.",
  },
  {
    icon: Send,
    title: "Adressage structuré",
    description:
      "Orientez vers le bon confrère en 3 clics. Lettre d'adressage générée automatiquement. Traçabilité complète.",
  },
  {
    icon: BookOpen,
    title: "Base de connaissances",
    description:
      "22 308 fiches de référence. Recommandations HAS, FFAB, ESPGHAN. Recherche sémantique pendant la consultation.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <PublicNavbar />

      {/* ── Hero ── */}
      <section className="px-6 md:px-12 pt-20 pb-16 md:pt-28 md:pb-20 max-w-4xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-8"
          style={{ background: "rgba(91,78,196,0.07)", color: "#5B4EC4", border: "1px solid rgba(91,78,196,0.15)", letterSpacing: "0.08em" }}
        >
          Coordination des parcours complexes
        </div>

        <h1
          className="text-4xl md:text-5xl font-extrabold leading-[1.08] tracking-tight mb-6"
          style={{ color: "#1A1A2E" }}
        >
          Le soin est fragmenté.<br />
          <span style={{ background: "linear-gradient(135deg,#5B4EC4,#2BA89C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Nami le coud.
          </span>
        </h1>

        <p className="text-lg leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: "#4A4A5A" }}>
          Nami coordonne les soignants autour des patients qui en ont le plus besoin.
          TCA, obésité, nutrition pluridisciplinaire — toutes les cartes en main pour l&apos;équipe.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/landing-page"
            className="border text-sm font-medium px-6 py-3 rounded-full transition-all"
            style={{ borderColor: "rgba(91,78,196,0.2)", color: "#5B4EC4", background: "rgba(91,78,196,0.05)" }}
          >
            Découvrir Nami
          </Link>
          <Link
            href="/signup"
            className="text-white text-sm font-semibold px-6 py-3 rounded-full transition-all"
            style={{ background: "#5B4EC4", boxShadow: "0 2px 10px rgba(91,78,196,0.3)" }}
          >
            Créer un compte gratuit
          </Link>
        </div>
      </section>

      {/* ── Le Problème ── */}
      <section className="px-6 md:px-12 pb-20 max-w-3xl mx-auto">
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.07)", boxShadow: "0 1px 4px rgba(26,26,46,0.05)" }}
        >
          <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: "#1A1A2E" }}>
            Gabrielle a 10 ans, une anorexie, 3 soignants.
            Ils se coordonnent par SMS. Personne ne sait ce que l&apos;autre a fait.
            Les informations passent entre les mailles.
          </p>
          <p className="text-sm font-semibold" style={{ color: "#5B4EC4" }}>
            Ce n&apos;est pas un manque de compétence. C&apos;est un défaut d&apos;orchestration.
          </p>
        </div>
      </section>

      {/* ── 4 Piliers ── */}
      <section id="piliers" className="px-6 md:px-12 pb-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-xl p-7 transition-all"
                style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.07)", boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(91,78,196,0.09)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(91,78,196,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(26,26,46,0.04)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,26,46,0.07)"; }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "rgba(91,78,196,0.08)" }}
                >
                  <Icon size={20} style={{ color: "#5B4EC4" }} />
                </div>
                <h3 className="text-base font-bold mb-1.5" style={{ color: "#1A1A2E" }}>
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#4A4A5A" }}>
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Chiffres ── */}
      <section className="px-6 md:px-12 pb-20 max-w-3xl mx-auto text-center">
        <p className="text-sm leading-relaxed" style={{ color: "#8A8A96" }}>
          865 000+ soignants en annuaire · 22 308 fiches de référence · 116 000 liens de knowledge graph · 121 parcours structurés.
          <br />
          Construit pour la coordination, pas adapté après coup.
        </p>
      </section>

      {/* ── CTA final ── */}
      <section
        className="px-6 md:px-12 py-20 text-center"
        style={{ background: "#1A1A2E" }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "#EEECEA", letterSpacing: "-0.03em" }}>
          Prêt à orchestrer le parcours ?
        </h2>
        <p className="text-sm mb-8" style={{ color: "rgba(238,236,234,0.5)" }}>
          Accès gratuit. Rejoignez les premiers soignants sur Nami.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="text-white text-sm font-semibold px-8 py-3 rounded-full transition-all"
            style={{ background: "#5B4EC4", boxShadow: "0 4px 16px rgba(91,78,196,0.4)" }}
          >
            Créer un compte gratuit
          </Link>
          <Link
            href="/trouver-un-soignant"
            className="text-sm font-medium px-6 py-3 rounded-full transition-all"
            style={{ color: "rgba(238,236,234,0.6)", border: "1.5px solid rgba(238,236,234,0.15)" }}
          >
            Annuaire des soignants
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
