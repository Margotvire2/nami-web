"use client";

import { useState } from "react";
import Link from "next/link";

const SPECIALTIES = [
  "Diététicien(ne)-Nutritionniste",
  "Médecin généraliste",
  "Psychiatre",
  "Psychologue",
  "Endocrinologue",
  "Pédiatre",
  "Infirmier(ère) coordinateur(trice)",
  "Kinésithérapeute",
  "Orthophoniste",
  "Médecin spécialiste (autre)",
  "Paramédical (autre)",
  "Coordinateur(trice) de réseau / CPTS",
  "Directeur(trice) médical(e)",
  "Cadre de santé",
  "Autre",
];

const VOLUMES = [
  "Moins de 10",
  "10 à 30",
  "30 à 100",
  "Plus de 100",
  "Je coordonne un réseau / une structure",
];

const SOURCES = [
  "Recherche Google",
  "Bouche-à-oreille / Recommandation d'un confrère",
  "Réseau TCA Francilien / FFAB",
  "LinkedIn",
  "Congrès / Formation",
  "Annuaire Nami",
  "Article de blog",
  "Autre",
];

const HIGHLIGHTS = [
  { icon: "🎙️", title: "Dictée → compte rendu structuré", desc: "Enregistrez la consultation, Nami génère un brouillon à valider." },
  { icon: "🗺️", title: "Parcours guidés HAS", desc: "Chaque étape du parcours est planifiée, traçable, partageable entre soignants." },
  { icon: "👥", title: "Coordination de l'équipe", desc: "Adressages, messages, tâches — toute l'équipe dans un seul espace." },
  { icon: "📊", title: "Vision complète du dossier", desc: "Biologie, observations, questionnaires : plus rien ne se perd entre les consultations." },
];

type FormState = "idle" | "submitting" | "success" | "error";

export default function DemanderUneDemoPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    specialty: "", structure: "", patientVolume: "", source: "", message: "",
    acceptTerms: false,
  });
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) { setErrorMsg("Prénom et nom sont obligatoires."); return; }
    if (!form.email.includes("@")) { setErrorMsg("Veuillez renseigner un email valide."); return; }
    if (!form.specialty) { setErrorMsg("Veuillez sélectionner votre spécialité."); return; }
    if (!form.patientVolume) { setErrorMsg("Veuillez indiquer votre volume de patients."); return; }
    if (!form.source) { setErrorMsg("Veuillez indiquer comment vous avez connu Nami."); return; }
    if (!form.acceptTerms) { setErrorMsg("Veuillez accepter la politique de confidentialité."); return; }
    setState("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setState("success");
    } catch {
      setState("error");
      setErrorMsg("Une erreur est survenue. Veuillez réessayer ou écrire à margot@namipourlavie.com.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5B4EC4", background: "rgba(91,78,196,0.08)", padding: "6px 14px", borderRadius: 100, marginBottom: 16 }}>
            Démo personnalisée
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, color: "#1A1A2E", lineHeight: 1.2, margin: "0 0 16px" }}>
            Voyez Nami dans votre contexte clinique
          </h1>
          <p style={{ fontSize: 17, color: "#4A4A5A", maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
            30 minutes avec Margot. On part de votre parcours de soins le plus complexe et on construit le dossier ensemble.
          </p>
        </div>

        {/* 2-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>

          {/* Left — highlights */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }}>
              {HIGHLIGHTS.map(({ icon, title, desc }) => (
                <div key={title} style={{ display: "flex", gap: 14, padding: "20px 20px", background: "#fff", border: "1px solid rgba(26,26,46,0.06)", borderRadius: 14 }}>
                  <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", margin: "0 0 4px" }}>{title}</p>
                    <p style={{ fontSize: 13, color: "#8A8A96", margin: 0, lineHeight: 1.55 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div style={{ padding: "24px", background: "rgba(91,78,196,0.04)", border: "1px solid rgba(91,78,196,0.1)", borderRadius: 14 }}>
              <p style={{ fontSize: 14, color: "#4A4A5A", lineHeight: 1.7, margin: "0 0 14px", fontStyle: "italic" }}>
                &ldquo;On perdait 4 mois entre les soignants sur chaque dossier complexe. Avec Nami, toute l&apos;équipe voit l&apos;avancement du parcours en temps réel.&rdquo;
              </p>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#5B4EC4", margin: 0 }}>Pr A. Hanachi — Médecin interniste, Hôpital Paul Brousse</p>
            </div>
          </div>

          {/* Right — form */}
          <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.08)", borderRadius: 20, padding: "36px 32px", boxShadow: "0 4px 40px rgba(26,26,46,0.06)" }}>
            {state === "success" ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1A1A2E", margin: "0 0 12px" }}>Demande envoyée !</h2>
                <p style={{ fontSize: 15, color: "#4A4A5A", lineHeight: 1.65, margin: "0 0 24px" }}>
                  Margot vous recontacte personnellement dans les 24 heures. Vérifiez votre boîte mail.
                </p>
                <Link href="/" style={{ display: "inline-block", background: "#5B4EC4", color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 100, textDecoration: "none" }}>
                  Retour à l&apos;accueil
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1A1A2E", margin: "0 0 24px" }}>Vos informations</h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <Field label="Prénom *" name="firstName" value={form.firstName} onChange={handleChange} required />
                  <Field label="Nom *" name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>

                <Field label="Email professionnel *" name="email" type="email" value={form.email} onChange={handleChange} required style={{ marginBottom: 14 }} />
                <Field label="Téléphone" name="phone" type="tel" value={form.phone} onChange={handleChange} style={{ marginBottom: 14 }} />

                <SelectField label="Spécialité *" name="specialty" value={form.specialty} onChange={handleChange} options={SPECIALTIES} required style={{ marginBottom: 14 }} />
                <Field label="Structure / établissement" name="structure" value={form.structure} onChange={handleChange} style={{ marginBottom: 14 }} />

                <SelectField label="Nb patients coordonnés *" name="patientVolume" value={form.patientVolume} onChange={handleChange} options={VOLUMES} required style={{ marginBottom: 14 }} />
                <SelectField label="Comment avez-vous connu Nami ? *" name="source" value={form.source} onChange={handleChange} options={SOURCES} required style={{ marginBottom: 14 }} />

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#4A4A5A", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Message (optionnel)
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Décrivez votre cas d'usage ou vos questions..."
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid rgba(26,26,46,0.12)", borderRadius: 10, fontSize: 14, color: "#1A1A2E", background: "#FAFAF8", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, cursor: "pointer" }}>
                  <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={handleChange}
                    style={{ marginTop: 2, flexShrink: 0, accentColor: "#5B4EC4" }} />
                  <span style={{ fontSize: 12, color: "#8A8A96", lineHeight: 1.55 }}>
                    J&apos;accepte la{" "}
                    <Link href="/confidentialite" style={{ color: "#5B4EC4" }}>politique de confidentialité</Link>
                    {" "}et le traitement de mes données à des fins de démonstration.
                  </span>
                </label>

                {errorMsg && (
                  <p style={{ fontSize: 13, color: "#DC2626", marginBottom: 14, padding: "10px 14px", background: "#FEF2F2", borderRadius: 8 }}>{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={state === "submitting"}
                  style={{
                    width: "100%", padding: "14px 24px", background: state === "submitting" ? "#8A8A96" : "#5B4EC4",
                    color: "#fff", fontSize: 15, fontWeight: 700, borderRadius: 100, border: "none",
                    cursor: state === "submitting" ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 16px rgba(91,78,196,0.3)", transition: "all 0.2s",
                  }}
                >
                  {state === "submitting" ? "Envoi en cours…" : "Demander ma démo →"}
                </button>

                <p style={{ fontSize: 11, color: "#8A8A96", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
                  Réponse sous 24h. Aucun engagement, aucune carte de crédit.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function Field({
  label, name, value, onChange, type = "text", required = false, style = {},
}: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#4A4A5A", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange} required={required}
        style={{ width: "100%", padding: "10px 14px", border: "1.5px solid rgba(26,26,46,0.12)", borderRadius: 10, fontSize: 14, color: "#1A1A2E", background: "#FAFAF8", fontFamily: "inherit", boxSizing: "border-box" }}
      />
    </div>
  );
}

function SelectField({
  label, name, value, onChange, options, required = false, style = {},
}: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[]; required?: boolean; style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#4A4A5A", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      <select
        name={name} value={value} onChange={onChange} required={required}
        style={{ width: "100%", padding: "10px 14px", border: "1.5px solid rgba(26,26,46,0.12)", borderRadius: 10, fontSize: 14, color: value ? "#1A1A2E" : "#8A8A96", background: "#FAFAF8", fontFamily: "inherit", boxSizing: "border-box", appearance: "none" }}
      >
        <option value="">— Choisir —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
