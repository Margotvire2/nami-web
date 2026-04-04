"use client";

import { useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  CheckCircle2, ArrowRight, Users, Shield,
  Stethoscope, Heart, Clock,
} from "lucide-react";

/*
  Page publique /invite/:token
  Le soignant invité arrive ici via un lien.
  Si déjà compte → bouton "Se connecter"
  Si nouveau → signup express en 3 champs (nom, spécialité, mdp)
*/

// Mock : données de l'invitation (en prod, fetch depuis le backend avec le token)
const MOCK_INVITE = {
  inviter: {
    firstName: "Amélie",
    lastName: "Suela",
    specialty: "Médecin généraliste",
    establishment: "Cabinet Necker, Paris",
  },
  message: "Bonjour, je souhaiterais collaborer avec vous sur le suivi de nos patients en nutrition et TCA. Rejoignez Nami pour faciliter notre coordination !",
  teamSize: 4,
  sharedPatients: 3,
};

const SPECIALTIES = [
  "Médecin généraliste", "Diététicien(ne)", "Psychologue", "Psychiatre",
  "Endocrinologue", "Pédiatre", "Cardiologue", "Néphrologue",
  "Kinésithérapeute", "Infirmier(ère)", "Autre",
];

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "signup" | "done">("welcome");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const inv = MOCK_INVITE;

  async function handleSignup() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) return;
    setLoading(true);
    // Simule le signup (en prod : appel API avec le token d'invitation)
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep("done");
    toast.success("Bienvenue sur Nami !");
  }

  return (
    <div className="min-h-screen bg-[#F0F2FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[520px]">

        {/* ── Step 1 : Welcome ── */}
        {step === "welcome" && (
          <div className="space-y-6">
            {/* Card principale */}
            <div className="bg-white rounded-2xl p-8 space-y-6" style={{ border: "1px solid #E8ECF4" }}>
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[12px] bg-[#4F46E5] flex items-center justify-center">
                  <span className="text-white text-sm font-extrabold">N</span>
                </div>
                <span className="text-lg font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>Nami</span>
              </div>

              {/* Invitation */}
              <div>
                <h1 className="text-[24px] font-bold text-[#0F172A] leading-tight tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
                  {inv.inviter.firstName} {inv.inviter.lastName} vous invite à collaborer
                </h1>
                <p className="text-sm text-[#64748B] mt-2 flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-[#94A3B8]" />
                  {inv.inviter.specialty} · {inv.inviter.establishment}
                </p>
              </div>

              {/* Message personnalisé */}
              {inv.message && (
                <div className="bg-[#F0F2FA] rounded-xl p-4">
                  <p className="text-sm text-[#374151] leading-relaxed italic">"{inv.message}"</p>
                </div>
              )}

              {/* Stats équipe */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Users size={14} className="text-[#4F46E5]" />
                  <span><span className="font-semibold text-[#0F172A]">{inv.teamSize}</span> membres</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Heart size={14} className="text-[#4F46E5]" />
                  <span><span className="font-semibold text-[#0F172A]">{inv.sharedPatients}</span> patients partagés</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <button
                  onClick={() => setStep("signup")}
                  className="w-full h-12 rounded-xl bg-[#4F46E5] text-white text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors"
                >
                  Créer mon compte <ArrowRight size={16} />
                </button>
                <Link
                  href="/login"
                  className="w-full h-12 rounded-xl bg-white text-[#4F46E5] text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#EEF2FF] transition-colors"
                  style={{ border: "1px solid #E8ECF4" }}
                >
                  J'ai déjà un compte
                </Link>
              </div>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-6 text-[12px] text-[#94A3B8]">
              <span className="flex items-center gap-1"><Shield size={12} /> Données sécurisées</span>
              <span className="flex items-center gap-1"><Clock size={12} /> Inscription en 45 sec</span>
            </div>
          </div>
        )}

        {/* ── Step 2 : Signup express ── */}
        {step === "signup" && (
          <div className="bg-white rounded-2xl p-8 space-y-6" style={{ border: "1px solid #E8ECF4" }}>
            <div>
              <button onClick={() => setStep("welcome")} className="text-xs text-[#64748B] hover:text-[#4F46E5] transition-colors mb-3">← Retour</button>
              <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>Créer votre compte</h2>
              <p className="text-sm text-[#64748B] mt-1">Rejoignez l'équipe de {inv.inviter.firstName} {inv.inviter.lastName} en 3 étapes.</p>
            </div>

            <div className="space-y-4">
              {/* Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Prénom</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" autoFocus className="w-full h-10 mt-1.5 rounded-[10px] bg-[#F0F2FA] px-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Nom</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" className="w-full h-10 mt-1.5 rounded-[10px] bg-[#F0F2FA] px-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Email professionnel</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="vous@cabinet.fr" className="w-full h-10 mt-1.5 rounded-[10px] bg-[#F0F2FA] px-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
              </div>

              {/* Spécialité */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Spécialité</label>
                <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full h-10 mt-1.5 rounded-[10px] bg-[#F0F2FA] px-4 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20">
                  <option value="">Choisir votre spécialité</option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Mot de passe</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Min. 8 caractères" className="w-full h-10 mt-1.5 rounded-[10px] bg-[#F0F2FA] px-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20" />
              </div>
            </div>

            <button
              onClick={handleSignup}
              disabled={loading || !firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()}
              className={`w-full h-12 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 transition-colors ${
                !loading && firstName.trim() && lastName.trim() && email.trim() && password.trim()
                  ? "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                  : "bg-[#E8ECF4] text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              {loading ? "Création du compte…" : "Rejoindre l'équipe"}
            </button>

            <p className="text-[11px] text-[#94A3B8] text-center leading-relaxed">
              En créant votre compte, vous acceptez les conditions d'utilisation de Nami.
            </p>
          </div>
        )}

        {/* ── Step 3 : Done ── */}
        {step === "done" && (
          <div className="bg-white rounded-2xl p-8 text-center space-y-6" style={{ border: "1px solid #E8ECF4" }}>
            <div className="w-16 h-16 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-[#059669]" />
            </div>

            <div>
              <h2 className="text-[22px] font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
                Bienvenue, {firstName} !
              </h2>
              <p className="text-sm text-[#64748B] mt-2 leading-relaxed max-w-sm mx-auto">
                Vous faites maintenant partie de l'équipe de {inv.inviter.firstName} {inv.inviter.lastName}. Vous pouvez accéder aux dossiers partagés et coordonner vos prises en charge.
              </p>
            </div>

            <div className="bg-[#F0F2FA] rounded-xl p-4 space-y-2 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]" style={{ fontFamily: "var(--font-inter)" }}>Votre équipe</p>
              <div className="flex items-center gap-2">
                {[inv.inviter, { firstName, lastName }].map((m, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
                    {m.firstName[0]}{m.lastName[0]}
                  </div>
                ))}
                <span className="text-xs text-[#64748B]">+ {inv.teamSize - 1} autres</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/login")}
              className="w-full h-12 rounded-xl bg-[#4F46E5] text-white text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors"
            >
              Accéder au cockpit <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
