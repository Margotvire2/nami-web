"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Users, FileText, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/store";

// ─── Slides ────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    icon: <Users size={32} strokeWidth={1.5} />,
    title: "Bienvenue sur Nami",
    subtitle: "La plateforme de coordination des parcours de soins pluridisciplinaires",
    points: [
      "Un dossier de coordination partagé entre tous les soignants",
      "Un parcours structuré, lisible, sans WhatsApp",
      "Une équipe qui sait ce que chacun a fait",
    ],
    cta: "Découvrir →",
  },
  {
    icon: <FileText size={32} strokeWidth={1.5} />,
    title: "Votre premier dossier vous attend",
    subtitle: "Nous avons préparé un dossier de démonstration pour vous faire découvrir Nami en conditions réelles",
    points: [
      "Parcours anorexie — équipe de 5 soignants",
      "Observations, documents, notes de consultation",
      "Parcours de soins structuré avec jalons",
    ],
    cta: "Ouvrir le dossier →",
  },
  {
    icon: <Sparkles size={32} strokeWidth={1.5} />,
    title: "Explorez librement",
    subtitle: "Ce dossier est fictif — vous pouvez tout explorer, modifier, tester sans risque",
    points: [],
    cta: "Accéder au dossier maintenant",
  },
] as const;

// ─── Page ───────────────────────────────────────────────────────────────────

export default function WelcomePage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useAuthStore();
  const caseId       = searchParams.get("caseId");

  const [step, setStep]         = useState(0);
  const [animating, setAnimating] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  function next() {
    if (step < SLIDES.length - 1) {
      setAnimating(true);
      setTimeout(() => { setStep((s) => s + 1); setAnimating(false); }, 220);
    } else {
      // Dernier slide — aller au patient démo
      if (caseId) {
        router.push(`/patients/${caseId}`);
      } else {
        router.push("/aujourd-hui");
      }
    }
  }

  const slide = SLIDES[step];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#FAFAF8" }}
    >
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-content { animation: slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes ring-slow {
          0%, 100% { transform: scale(1);    opacity: 0.08; }
          50%       { transform: scale(1.06); opacity: 0.14; }
        }
        .ring { position: absolute; border-radius: 50%; animation: ring-slow 5s ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-[520px]">

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                width:      i === step ? 24 : 8,
                height:     8,
                borderRadius: 4,
                background: i <= step ? "#5B4EC4" : "rgba(91,78,196,0.15)",
                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "#FFFFFF",
            border:     "1px solid rgba(26,26,46,0.06)",
            boxShadow:  "0 4px 32px rgba(91,78,196,0.08)",
          }}
        >
          {/* Ambient rings (step 0 only) */}
          {step === 0 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="ring" style={{ width: 220, height: 220, top: -60, right: -60, border: "1px solid rgba(91,78,196,0.2)" }} />
              <div className="ring" style={{ width: 320, height: 320, top: -110, right: -110, border: "1px solid rgba(43,168,156,0.12)", animationDelay: "1.5s" }} />
            </div>
          )}

          <div
            className={`slide-content p-10 ${animating ? "opacity-0" : ""}`}
            key={step}
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(91,78,196,0.08)", color: "#5B4EC4" }}
            >
              {slide.icon}
            </div>

            {/* Text */}
            <h1
              className="text-2xl font-extrabold mb-3 tracking-tight"
              style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta, 'Plus Jakarta Sans', sans-serif)" }}
            >
              {slide.title}
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#4A4A5A" }}>
              {slide.subtitle}
            </p>

            {/* Points */}
            {slide.points.length > 0 && (
              <ul className="space-y-3 mb-8">
                {slide.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: "#2BA89C" }} />
                    <span className="text-sm" style={{ color: "#4A4A5A" }}>{pt}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA */}
            <button
              onClick={next}
              className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background:  "#5B4EC4",
                color:       "#FFFFFF",
                boxShadow:   "0 2px 12px rgba(91,78,196,0.3)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(91,78,196,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(91,78,196,0.3)";
              }}
            >
              {slide.cta}
              <ArrowRight size={15} />
            </button>

            {/* Skip (pas sur le dernier slide) */}
            {step < SLIDES.length - 1 && (
              <button
                onClick={() => caseId ? router.push(`/patients/${caseId}`) : router.push("/aujourd-hui")}
                className="w-full mt-3 h-9 text-xs font-medium"
                style={{ color: "#8A8A96" }}
              >
                Passer l'introduction
              </button>
            )}
          </div>
        </div>

        {/* Legal footer */}
        <p className="text-center text-[11px] mt-6" style={{ color: "#B0B0BA" }}>
          Nami n'est pas un dispositif médical · En cas d'urgence : 15 / 112
        </p>
      </div>
    </div>
  );
}
