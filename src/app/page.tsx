import Link from "next/link";
import {
  ArrowRight, Eye, Sparkles,
  ArrowLeftRight, CheckCircle2,
} from "lucide-react";

const PILLARS = [
  {
    icon: ArrowLeftRight,
    title: "Coordination",
    description: "Adressages structurés, équipes pluripro, passage de relais fluide entre soignants.",
    metric: "12 statuts de workflow",
  },
  {
    icon: Eye,
    title: "Visibilité clinique",
    description: "Timeline unifiée, journal patient, notes de coordination. Tout le parcours en un coup d'oeil.",
    metric: "10 vues par patient",
  },
  {
    icon: Sparkles,
    title: "Intelligence",
    description: "Détection automatique des lacunes du parcours. Résumé IA structuré. Alertes proactives.",
    metric: "9 détecteurs de gaps",
  },
];

const STATS = [
  { value: "92", label: "Endpoints API" },
  { value: "22", label: "Modèles de données" },
  { value: "4", label: "Patients de démo" },
  { value: "9", label: "Détecteurs IA" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F8]">
      {/* ── Nav ── */}
      <nav className="bg-white px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <span className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: "var(--font-jakarta), system-ui" }}>
            Nami
          </span>
        </div>
        <Link
          href="/login"
          className="bg-[#4F46E5] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#3B55E0] transition-colors flex items-center gap-2"
        >
          Accéder au cockpit <ArrowRight size={16} />
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="px-8 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span className="text-xs font-semibold text-[#64748B]">Plateforme live — version beta</span>
        </div>

        <h1
          className="text-5xl font-extrabold text-[#1E293B] leading-tight tracking-tight"
          style={{ fontFamily: "var(--font-jakarta), system-ui" }}
        >
          La coordination clinique
          <br />
          <span className="text-[#4F46E5]">entre deux consultations</span>
        </h1>

        <p className="text-lg text-[#64748B] mt-6 max-w-2xl mx-auto leading-relaxed">
          Nami est l'infrastructure de pilotage des parcours de soins complexes.
          Visibilité longitudinale, coordination pluripro, intelligence clinique.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            href="/login"
            className="bg-[#4F46E5] text-white text-sm font-semibold px-8 py-3.5 rounded-xl hover:bg-[#3B55E0] transition-colors flex items-center gap-2"
          >
            Accéder au cockpit <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="bg-white text-[#4F46E5] text-sm font-semibold px-8 py-3.5 rounded-xl hover:bg-[#EEF1FF] transition-colors"
          >
            Voir la démo
          </Link>
        </div>

        <p className="text-xs text-[#94A3B8] mt-4">
          Compte démo : dr.suela@nami-demo.fr / nami1234demo
        </p>
      </section>

      {/* ── Pillars ── */}
      <section className="px-8 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="bg-white rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl bg-[#EEF1FF] flex items-center justify-center mb-5">
                  <Icon size={24} className="text-[#4F46E5]" />
                </div>
                <h3
                  className="text-lg font-bold text-[#1E293B] mb-2"
                  style={{ fontFamily: "var(--font-jakarta), system-ui" }}
                >
                  {p.title}
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed mb-4">{p.description}</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5]">
                  <CheckCircle2 size={14} /> {p.metric}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-8 pb-24 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8] text-center mb-8">
            Infrastructure produit
          </p>
          <div className="grid grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className="text-4xl font-bold text-[#1E293B] tracking-tight"
                  style={{ fontFamily: "var(--font-jakarta), system-ui" }}
                >
                  {s.value}
                </p>
                <p className="text-sm text-[#64748B] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Wedge ── */}
      <section className="px-8 pb-24 max-w-3xl mx-auto text-center">
        <h2
          className="text-2xl font-bold text-[#1E293B] mb-4"
          style={{ fontFamily: "var(--font-jakarta), system-ui" }}
        >
          Le wedge : nutrition et TCA
        </h2>
        <p className="text-sm text-[#64748B] leading-relaxed max-w-xl mx-auto">
          Premier marché cible : parcours de soins complexes en nutrition, obésité et troubles du comportement alimentaire.
          Coordination pluriprofessionnelle entre médecins, diététicien·ne·s, psychologues, endocrinologues.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          {["TCA", "Obésité", "Nutrition clinique", "Pédiatrie", "Pluriprofessionnel"].map((tag) => (
            <span key={tag} className="bg-[#EEF1FF] text-[#4F46E5] text-xs font-semibold px-4 py-1.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white px-8 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-[#4F46E5] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">N</span>
          </div>
          <span className="text-sm font-bold text-[#1E293B]">Nami</span>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Infrastructure de coordination des parcours de soins complexes
        </p>
      </footer>
    </div>
  );
}
