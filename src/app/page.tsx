import Link from "next/link";
import type { Metadata } from "next";
import { Users, TrendingUp, Send, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Nami — Le cockpit clinique des parcours de soins complexes",
  description:
    "Coordination pluridisciplinaire, suivi longitudinal, intelligence clinique. Nami organise le soin pour les patients qui en ont le plus besoin.",
  openGraph: {
    title: "Nami — Le cockpit clinique des parcours de soins complexes",
    description:
      "Coordination pluridisciplinaire, suivi longitudinal, intelligence clinique.",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
};

const PILLARS = [
  {
    icon: Users,
    title: "Coordination clinique",
    description:
      "Une équipe, un dossier, une timeline. Chaque soignant voit ce que les autres ont fait.",
  },
  {
    icon: TrendingUp,
    title: "Suivi longitudinal",
    description:
      "Courbes cliniques, métriques, questionnaires. L'évolution du patient en un coup d'oeil.",
  },
  {
    icon: Send,
    title: "Adressage intelligent",
    description:
      "Orientez vos patients vers le bon confrère en 3 clics. Traçabilité complète.",
  },
  {
    icon: Zap,
    title: "Intelligence clinique",
    description:
      "Détection des trous de suivi, alertes automatiques, résumés IA du dossier.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <nav className="px-6 md:px-12 h-16 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-[#4F46E5] flex items-center justify-center">
            <span className="text-white text-xs font-extrabold">N</span>
          </div>
          <span
            className="text-base font-bold text-gray-900 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Nami
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/soignants"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:inline"
          >
            Annuaire
          </Link>
          <Link
            href="/pathologies"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:inline"
          >
            Pathologies
          </Link>
          <Link
            href="/blog"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:inline"
          >
            Blog
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="bg-[#4F46E5] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 md:px-12 pt-20 pb-16 md:pt-28 md:pb-20 max-w-4xl mx-auto text-center">
        <h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Le cockpit clinique des
          <br />
          <span className="text-[#4F46E5]">parcours de soins complexes</span>
        </h1>

        <p className="text-lg text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed">
          Nami coordonne les soignants autour des patients qui en ont le plus
          besoin. TCA, obésité, nutrition pluridisciplinaire — enfin un suivi
          qui ne lâche pas.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10">
          <a
            href="#piliers"
            className="border border-gray-200 text-gray-700 text-sm font-medium px-6 py-3 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            Découvrir Nami
          </a>
          <Link
            href="/signup"
            className="bg-[#4F46E5] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </section>

      {/* ── Le Problème ── */}
      <section className="px-6 md:px-12 pb-20 max-w-3xl mx-auto">
        <div className="bg-gray-50 rounded-2xl p-8 md:p-10 border border-gray-100">
          <p
            className="text-base md:text-lg text-gray-700 leading-relaxed"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Aujourd&apos;hui, 3 soignants suivent Gabrielle, 16 ans, anorexie.
            Ils se coordonnent par email, SMS et Post-it. Personne ne sait ce
            que l&apos;autre a fait. Les informations passent entre les mailles.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Ce n&apos;est pas un manque de compétence. C&apos;est un défaut
            d&apos;orchestration.
          </p>
        </div>
      </section>

      {/* ── 4 Piliers ── */}
      <section id="piliers" className="px-6 md:px-12 pb-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-5">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="bg-white rounded-xl border border-gray-100 p-7 hover:border-[#4F46E5]/20 hover:shadow-[0_2px_12px_rgba(79,70,229,0.06)] transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#4F46E5]" />
                </div>
                <h3
                  className="text-base font-bold text-gray-900 mb-1.5"
                  style={{ fontFamily: "var(--font-jakarta)" }}
                >
                  {p.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Preuve technique ── */}
      <section className="px-6 md:px-12 pb-20 max-w-3xl mx-auto text-center">
        <p className="text-sm text-gray-400 leading-relaxed">
          49 modèles cliniques. 13 parcours de soin. 247 métriques. 57 règles
          d&apos;alerte.
          <br />
          Construit pour la santé, pas adapté après coup.
        </p>
      </section>

      {/* ── CTA final ── */}
      <section className="px-6 md:px-12 pb-24 max-w-3xl mx-auto text-center">
        <h2
          className="text-2xl font-bold text-gray-900 mb-3"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Vous coordonnez des parcours complexes ?
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Rejoignez les premiers soignants sur Nami.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-[#4F46E5] text-white text-sm font-semibold px-8 py-3 rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            Créer un compte
          </Link>
          <Link
            href="/soignants"
            className="text-sm text-[#4F46E5] font-medium hover:underline"
          >
            Voir l&apos;annuaire
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#4F46E5] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">N</span>
            </div>
            <span className="text-sm text-gray-400">
              © 2026 Nami
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/soignants" className="hover:text-gray-600 transition-colors">
              Annuaire
            </Link>
            <Link href="/pathologies" className="hover:text-gray-600 transition-colors">
              Pathologies
            </Link>
            <Link href="/blog" className="hover:text-gray-600 transition-colors">
              Blog
            </Link>
            <Link href="/login" className="hover:text-gray-600 transition-colors">
              Connexion
            </Link>
            <a href="mailto:margot@nami.health" className="hover:text-gray-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
