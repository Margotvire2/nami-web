"use client"

import { useState } from "react"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { AmbientGlow, AmbientGlowCTA } from "@/components/pitch/AmbientGlow"

// ── Design tokens ──────────────────────────────────────────────────────────────

const C = {
  nami:   "#5B4EC4",
  namiH:  "#4c44b0",
  teal:   "#2BA89C",
  bg:     "#FAFAF8",
  bgAlt:  "#F5F3EF",
  dark:   "#1A1A2E",
  t1:     "#1A1A2E",
  t2:     "#4A4A5A",
  tm:     "#8A8A96",
  bl:     "rgba(26,26,46,0.06)",
}

const GRAD: React.CSSProperties = {
  background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}

const CTR: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 clamp(20px, 5vw, 80px)",
}

const EYE = (light = false): React.CSSProperties => ({
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: light ? "rgba(255,255,255,0.4)" : C.nami,
  marginBottom: 16,
})

const TITLE = (color = C.t1): React.CSSProperties => ({
  fontSize: "clamp(2rem, 5vw, 3.8rem)",
  fontWeight: 800,
  letterSpacing: "-0.03em",
  lineHeight: 1.15,
  textAlign: "center",
  marginBottom: 16,
  color,
})

const SUB = (color = C.t2): React.CSSProperties => ({
  textAlign: "center",
  color,
  fontSize: 16,
  maxWidth: 560,
  margin: "0 auto 56px",
  lineHeight: 1.6,
})

const FONT_PLAYFAIR = "var(--font-playfair, 'Playfair Display', Georgia, serif)"
const FONT_INTER    = "var(--font-inter, Inter, sans-serif)"
const FONT_JAKARTA  = "var(--font-jakarta, system-ui, sans-serif)"

// ── Tab contents ───────────────────────────────────────────────────────────────

function TabSuivi() {
  const rows = [
    { ini: "SL", bg: "#7C3AED", name: "Sophie L.",  detail: "AM restrictive · IMC 14.2 · Sortie HC J+18",   pct: 85, barColor: C.teal,    badge: "Parcours actif",             bBg: "#D1FAE5", bTxt: "#065F46" },
    { ini: "MB", bg: "#2563EB", name: "Marie B.",   detail: "Boulimie · IMC 19.8 · Suivi ambulatoire",      pct: 60, barColor: "#F59E0B",  badge: "Consultation manquante",     bBg: "#FEF3C7", bTxt: "#92400E" },
    { ini: "CT", bg: "#DC2626", name: "Clara T.",   detail: "AM restrictive · IMC 13.1 · Post-HC M+2",      pct: 30, barColor: "#EF4444",  badge: "Perdue de vue (6 sem.)",     bBg: "#FEE2E2", bTxt: "#991B1B" },
    { ini: "AB", bg: "#059669", name: "Anaïs B.",   detail: "ARFID · IMC 15.9 · HDJ hebdomadaire",          pct: 95, barColor: C.teal,    badge: "Parcours complet",           bBg: "#D1FAE5", bTxt: "#065F46" },
  ]
  return (
    <>
      <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 14, color: C.tm, fontFamily: FONT_INTER }}>
        File active — Service Nutrition Clinique
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: i < rows.length - 1 ? `1px solid ${C.bl}` : "none", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#fff", flexShrink: 0 }}>{r.ini}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: C.tm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.detail}</div>
          </div>
          <div style={{ width: 72, height: 5, background: "#E5E7EB", borderRadius: 100, overflow: "hidden", flexShrink: 0 }}>
            <div style={{ width: `${r.pct}%`, height: "100%", borderRadius: 100, background: r.barColor }} />
          </div>
          <div style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", fontFamily: FONT_INTER, background: r.bBg, color: r.bTxt }}>{r.badge}</div>
        </div>
      ))}
    </>
  )
}

function TabCoordination() {
  const msgs = [
    { ini: "MH", bg: "#7C3AED", name: "Pr Hanachi · Nutritionniste", text: "Patiente adressée par les urgences de Bicêtre, AM restrictive, IMC 11.8. Stabilisation en cours. Avis psy souhaité pour orientation post-HC.", time: "10:42" },
    { ini: "CR", bg: "#2563EB", name: "Dr Ringot · Psychiatre",      text: "Merci. Je peux voir la patiente jeudi matin. Elle a un suivi psy antérieur ?",                                                                       time: "10:58" },
    { ini: "SD", bg: "#059669", name: "Sophie D. · Diététicienne",   text: "Bilan nutritionnel fait ce matin. CR dans le parcours. Renutrition progressive en cours, tolérance correcte.",                                       time: "11:15" },
  ]
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: `1px solid ${C.bl}`, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, background: C.nami, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>R</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Réseau TCA Francilien — Cas complexes</div>
          <div style={{ fontSize: 12, color: C.tm, fontFamily: FONT_INTER }}>23 membres · Discussion rattachée au parcours</div>
        </div>
      </div>
      {msgs.map((m, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{m.ini}</div>
          <div style={{ background: C.bgAlt, borderRadius: "10px 10px 10px 3px", padding: "10px 14px", maxWidth: "72%" }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{m.name}</div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>
            <div style={{ fontSize: 10, color: C.tm, marginTop: 3, fontFamily: FONT_INTER }}>{m.time}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 20, padding: "12px 16px", background: C.bgAlt, borderRadius: 8, fontSize: 12, color: C.tm, lineHeight: 1.5, fontFamily: FONT_INTER }}>
        💬 Chaque message est rattaché au dossier de coordination — traçable, horodaté, accessible à toute l&apos;équipe autorisée.
      </div>
    </>
  )
}

function TabCompletude() {
  const consultations = [
    { ok: true,  text: "Diététicienne — hebdo (4/4)" },
    { ok: true,  text: "Psychiatre — bimensuel (2/2)" },
    { ok: false, text: "Psychologue — hebdo (2/4 manquées)" },
    { ok: true,  text: "Médecin traitant — mensuel (1/1)" },
    { ok: null,  text: "Kinésithérapeute — à planifier" },
  ]
  const donnees = [
    { ok: true,  text: "Poids : 42.3 kg (+1.8 kg depuis sortie)" },
    { ok: true,  text: "IMC : 14.2 (objectif 16.5)" },
    { ok: true,  text: "Bilan bio M+1 réalisé" },
    { ok: null,  text: "Ostéodensitométrie — à programmer" },
    { ok: true,  text: "ECG de contrôle : normal" },
  ]
  const icon = (ok: boolean | null) =>
    ok === true ? { sym: "✓", color: "#10B981" } : ok === false ? { sym: "✗", color: "#EF4444" } : { sym: "◎", color: "#F59E0B" }

  return (
    <>
      <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 14, color: C.tm, fontFamily: FONT_INTER }}>
        Complétude du parcours — Sophie L.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {[
          { title: "Consultations prévues (M+1)", items: consultations },
          { title: "Données de suivi",            items: donnees },
        ].map((col, ci) => (
          <div key={ci} style={{ border: `1px solid ${C.bl}`, borderRadius: 10, padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{col.title}</h4>
            {col.items.map((item, ii) => {
              const { sym, color } = icon(item.ok)
              return (
                <div key={ii} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13 }}>
                  <span style={{ color, fontWeight: 700 }}>{sym}</span>
                  {item.text}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: "12px 16px", background: C.bgAlt, borderRadius: 8, fontSize: 12, color: C.tm, lineHeight: 1.5, fontFamily: FONT_INTER }}>
        📋 Chaque seuil et chaque recommandation est sourcé sur les référentiels HAS. Les indicateurs sont organisationnels, pas diagnostiques.
      </div>
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function PitchTcaClient() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div style={{ fontFamily: FONT_JAKARTA, color: C.t1, background: C.bg, overflowX: "hidden" }}>
      <style>{`
        @keyframes pitch-tca-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pitch-tca-anim { animation: pitch-tca-fade-up 0.4s cubic-bezier(0.16,1,0.3,1); }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(250,250,248,0.88)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.bl}`, padding: "14px 0",
      }}>
        <div style={{ ...CTR, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "1.25rem", fontWeight: 900, color: C.nami, letterSpacing: "-0.03em" }}>nami</span>
          <span style={{ fontSize: 12, fontFamily: FONT_INTER, color: C.tm, fontWeight: 500 }}>Coordination des parcours TCA</span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px" }}>
        <div style={{ maxWidth: 840 }}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <div style={EYE()}>Parcours TCA</div>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.08} duration={0.6}>
            <h1 style={{ fontSize: "clamp(2.2rem, 7.5vw, 5.8rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: 24, fontFamily: FONT_JAKARTA }}>
              La coordination<br />que vos équipes<br />
              <span style={GRAD}>méritent</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.16} duration={0.6}>
            <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", lineHeight: 1.6, color: C.t2, maxWidth: 560, margin: "0 auto 40px" }}>
              Vos professionnels sont compétents.<br />
              Ils manquent d&apos;une infrastructure pour se coordonner.<br />
              Nami est cette infrastructure.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.24} duration={0.6}>
            <a
              href="#probleme"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", background: C.nami, color: "#fff",
                borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(91,78,196,0.30)", fontFamily: FONT_JAKARTA,
                transition: "background 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.namiH; e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = C.nami;  e.currentTarget.style.transform = "translateY(0)" }}
            >
              Découvrir →
            </a>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.32} duration={0.6}>
            <p style={{ marginTop: 32, fontSize: 12, fontFamily: FONT_INTER, color: C.tm }}>
              Outil de coordination · Non dispositif médical · Conforme RGPD
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── PROBLÈME ── */}
      <section id="probleme" style={{ padding: "clamp(60px,10vw,120px) 0", background: C.bgAlt }}>
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <div style={{ ...EYE(), textAlign: "center" as const }}>Le constat</div>
            <p style={{ fontFamily: FONT_PLAYFAIR, fontSize: "clamp(1.3rem, 2.8vw, 2rem)", fontStyle: "italic", lineHeight: 1.5, textAlign: "center", maxWidth: 700, margin: "0 auto 32px" }}>
              Cinq professionnels autour d&apos;une même patiente.<br />
              Chacun excellent dans son domaine.<br />
              <em style={{ fontStyle: "normal", fontWeight: 700, ...GRAD }}>Aucun ne sait ce que l&apos;autre a fait.</em>
            </p>
            <p style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 48px", color: C.t2, lineHeight: 1.6, fontSize: 15 }}>
              Les TCA exigent une prise en charge transdisciplinaire — nutritionniste, psychiatre, psychologue, diététicien, médecin traitant. Aujourd&apos;hui, la coordination entre eux repose sur le téléphone, le mail, et la bonne volonté.
            </p>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { num: "50%", label: "Non dépistés",             desc: "des TCA passent inaperçus en soins primaires",                                                                   src: "Source : FFAB / HAS 2019" },
              { num: "6+",  label: "Professionnels par parcours", desc: "Psychiatre, nutritionniste, psychologue, diététicien, MT, kiné, AS..." },
              { num: "5+",  label: "Outils ouverts par jour",  desc: "DPI, téléexpertise, Doctolib, messagerie, Excel — mais rien qui relie le parcours dans la durée" },
            ].map((s, i) => (
              <ScrollReveal key={i} variant="fade-up" delay={i * 0.08} duration={0.6}>
                <div
                  style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.bl}`, boxShadow: "0 1px 3px rgba(0,0,0,.05)", padding: 32, textAlign: "center", transition: "all 240ms cubic-bezier(0.16,1,0.3,1)", height: "100%" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 0 1px rgba(91,78,196,.12),0 4px 12px rgba(91,78,196,.08),0 12px 32px rgba(91,78,196,.06)"; e.currentTarget.style.transform = "translateY(-4px) scale(1.005)"; e.currentTarget.style.borderColor = "rgba(91,78,196,.18)" }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.05)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = C.bl }}
                >
                  <div style={{ fontSize: "clamp(3rem,6vw,5.5rem)", fontWeight: 800, letterSpacing: "-0.04em", fontFamily: FONT_INTER, color: C.nami, lineHeight: 1, marginBottom: 8 }}>{s.num}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 14, color: C.t2, lineHeight: 1.5 }}>{s.desc}</div>
                  {s.src && <div style={{ fontSize: 12, fontFamily: FONT_INTER, color: C.tm, marginTop: 8 }}>{s.src}</div>}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSIGHT ── */}
      <section style={{ padding: "clamp(80px,12vw,160px) 0", background: C.bg, textAlign: "center" }}>
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <div style={EYE()}>L&apos;observation</div>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.08} duration={0.7}>
            <p style={{ fontFamily: FONT_PLAYFAIR, fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", fontStyle: "italic", lineHeight: 1.4, maxWidth: 680, margin: "0 auto 20px" }}>
              « Ce n&apos;était pas un manque de compétence.<br />
              C&apos;était un défaut d&apos;orchestration. »
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.16} duration={0.6}>
            <p style={{ fontSize: 14, color: C.t2, fontWeight: 500 }}>
              — Margot Vire, diététicienne-nutritionniste, fondatrice de Nami
              <span style={{ display: "block", fontSize: 12, color: C.tm, marginTop: 4, fontFamily: FONT_INTER }}>
                Master 2 Recherche en Santé publique — AP-HP / Université Paris-Saclay
              </span>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── RUPTURE ── */}
      <section style={{ padding: "clamp(60px,10vw,120px) 0", background: C.bgAlt }}>
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <div style={{ ...EYE(), textAlign: "center" as const }}>Parcours type</div>
            <h2 style={TITLE()}>Où le parcours se casse</h2>
            <p style={SUB()}>Le même schéma se répète — quel que soit le professionnel, quel que soit le TCA.</p>
          </ScrollReveal>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 620, margin: "0 auto" }}>
            {[
              { num: "1", bad: false, label: "Le médecin traitant adresse la patiente",      text: "Courrier, mail, téléphone — ou tout simplement « allez voir une diététicienne »." },
              { num: "✗", bad: true,  label: "La patiente ne consulte pas",                  text: "Dans le déni, elle se dit que ce n'est peut-être pas nécessaire. L'urgence du suivi n'est pas perçue." },
              { num: "2", bad: false, label: "La diététicienne la voit",                     text: "Elle fait son bilan, commence un travail. Mais elle ne connaît pas le médecin traitant. Pas de retour, pas de lien." },
              { num: "✗", bad: true,  label: "Le médecin passe à autre chose",              text: "Il a adressé, il considère que c'est pris en charge. Il a d'autres patients. Le compte rendu de la diététicienne ne lui parvient pas." },
              { num: "3", bad: false, label: "Un suivi pluripro serait nécessaire",          text: "Diététicienne, psychologue, médecin traitant — tous devraient avancer au même rythme, avec la même information. Mais chacun travaille dans son coin, sans outil commun." },
              { num: "✗", bad: true,  label: "La patiente décroche — personne ne le voit",  text: "Elle arrête la psy, puis la diét. Le déni reprend. Rechute silencieuse. Personne ne le sait avant qu'elle revienne aux urgences, des mois plus tard." },
            ].map((step, i) => (
              <ScrollReveal key={i} variant="fade-up" delay={i * 0.07} duration={0.55}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "20px 0", position: "relative" }}>
                  {i < 5 && (
                    <div style={{ position: "absolute", left: 19, top: 58, bottom: 0, width: 2, background: "linear-gradient(to bottom, rgba(91,78,196,0.3), rgba(91,78,196,0.06))" }} />
                  )}
                  <div style={{ width: 40, height: 40, background: step.bad ? "#DC2626" : C.nami, color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {step.num}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: step.bad ? "#DC2626" : C.t1 }}>{step.label}</h4>
                    <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.55 }}>{step.text}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section id="solution" style={{ padding: "clamp(60px,10vw,120px) 0", background: C.bg }}>
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <div style={{ ...EYE(), textAlign: "center" as const }}>Nami</div>
            <h2 style={TITLE()}>Un seul espace.<br />Toute l&apos;équipe.</h2>
            <p style={{ ...SUB(), marginBottom: 40 }}>
              Chaque professionnel renseigne depuis son téléphone. Toute l&apos;équipe a la même visibilité sur le parcours.
            </p>
          </ScrollReveal>

          {/* Tabs */}
          <ScrollReveal variant="fade-up" delay={0.08} duration={0.6}>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
              {["Suivi du parcours", "Coordination équipe", "Complétude"].map((label, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  style={{
                    padding: "10px 20px", borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${activeTab === i ? C.nami : "rgba(26,26,46,0.12)"}`,
                    background: activeTab === i ? C.nami : "transparent",
                    color: activeTab === i ? "#fff" : C.tm,
                    fontSize: 14, fontWeight: 600, fontFamily: FONT_JAKARTA,
                    boxShadow: activeTab === i ? "0 4px 20px rgba(91,78,196,0.30)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Browser frame */}
          <ScrollReveal variant="fade-up" delay={0.16} duration={0.6}>
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 100px rgba(26,26,46,0.16), 0 8px 24px rgba(26,26,46,0.08)", border: "1px solid rgba(26,26,46,0.08)", maxWidth: 900, margin: "0 auto" }}>
              <div style={{ background: "#F1F3F5", padding: "9px 14px", display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF6058" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBC2E" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#29CA41" }} />
              </div>
              <div style={{ background: "#fff", padding: 24, minHeight: 380 }}>
                <div className="pitch-tca-anim" key={activeTab}>
                  {activeTab === 0 && <TabSuivi />}
                  {activeTab === 1 && <TabCoordination />}
                  {activeTab === 2 && <TabCompletude />}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── COMPARAISON (dark) ── */}
      <section style={{ padding: "clamp(60px,10vw,120px) 0", background: C.dark, position: "relative", overflow: "hidden" }}>
        <AmbientGlow />
        <div style={{ ...CTR, position: "relative", zIndex: 1 }}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <div style={{ ...EYE(true), textAlign: "center" as const }}>Positionnement</div>
            <h2 style={TITLE("#fff")}>Complémentaire,<br />pas concurrent</h2>
            <p style={{ ...SUB("rgba(255,255,255,0.5)") }}>
              La téléexpertise répond à « est-ce un TCA ? »<br />Nami répond à « le parcours TCA est-il suivi ? »
            </p>
          </ScrollReveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 820, margin: "0 auto" }}>
            <ScrollReveal variant="fade-up" delay={0} duration={0.6}>
              <div style={{ borderRadius: 12, padding: 32, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Téléexpertise</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>Avis ponctuel entre professionnels</p>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {["Demande d'avis sur un cas précis", "Échange entre 2 médecins", "Réponse en quelques heures", "Patient absent de l'outil", "Pas de suivi longitudinal"].map((item, i) => (
                    <li key={i} style={{ padding: "7px 0", fontSize: 14, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.4 }}>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                    </li>
                  ))}
                </ul>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 16, fontFamily: FONT_INTER }}>Ex : Omnidoc, CARE-TCA IDF</p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.1} duration={0.6}>
              <div style={{ borderRadius: 12, padding: 32, border: "1px solid rgba(91,78,196,0.4)", background: "rgba(91,78,196,0.08)", backdropFilter: "blur(8px)", position: "relative" }}>
                <div style={{ position: "absolute", top: -11, right: 20, background: C.nami, color: "#fff", padding: "4px 14px", borderRadius: 8, fontSize: 11, fontWeight: 800, fontFamily: FONT_INTER, letterSpacing: "0.03em" }}>
                  NAMI
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Coordination de parcours</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>Orchestration longitudinale pluriprofessionnelle</p>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {["Suivi continu sur des semaines, des mois", "6+ professionnels en simultané", "Visibilité partagée sur le parcours", "Communication intégrée au dossier", "Indicateurs de complétude automatiques", "Synthèses structurées sourcées HAS"].map((item, i) => (
                    <li key={i} style={{ padding: "7px 0", fontSize: 14, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.4 }}>
                      <span style={{ color: C.teal, fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal variant="fade-up" delay={0.2} duration={0.6}>
            <p style={{ textAlign: "center", marginTop: 40, fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              Omnidoc structure l&apos;avis. Nami structure le parcours.<br />Les deux sont nécessaires.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── RÉSEAU ── */}
      <section id="reseau" style={{ padding: "clamp(60px,10vw,120px) 0", background: C.bg }}>
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <div style={{ ...EYE(), textAlign: "center" as const }}>Pour les réseaux</div>
            <h2 style={TITLE()}>L&apos;infrastructure qui manque<br />à votre réseau</h2>
            <p style={SUB()}>
              200 professionnels, des dizaines de structures, des centaines de patients.<br />Nami structure ce qui existe déjà.
            </p>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
            {[
              { icon: "🔀", title: "Adressage structuré",               desc: "Des règles d'entrée par structure, des formulaires standardisés. Plus de mails au fil de l'eau." },
              { icon: "👁",  title: "Visibilité partagée",               desc: "Chaque professionnel du réseau voit où en est le parcours du patient qu'il suit — sans appeler personne." },
              { icon: "💬", title: "Discussion rattachée au parcours",   desc: "Les échanges sur un cas sont dans le dossier de coordination. Pas dans un groupe WhatsApp à 47 messages." },
              { icon: "📊", title: "Indicateurs pour l'ARS",            desc: "File active coordonnée, taux de perdus de vue, délais d'adressage. Les données sortent automatiquement." },
            ].map((card, i) => (
              <ScrollReveal key={i} variant="fade-up" delay={i * 0.08} duration={0.55}>
                <div
                  style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.bl}`, boxShadow: "0 1px 3px rgba(0,0,0,.05)", padding: 28, transition: "all 200ms ease", height: "100%" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(91,78,196,.10)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.borderColor = "rgba(91,78,196,.2)" }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.05)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = C.bl }}
                >
                  <div style={{ width: 44, height: 44, background: C.bgAlt, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>{card.icon}</div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{card.title}</h4>
                  <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.55 }}>{card.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONFIANCE ── */}
      <section style={{ padding: "clamp(50px,8vw,100px) 0", background: C.bgAlt }}>
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, textAlign: "center" }}>Construit pour la confiance</h2>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, maxWidth: 900, margin: "40px auto 0" }}>
            {[
              { icon: "🇪🇺", title: "Données en Europe",       desc: "Infrastructure hébergée en UE. Trajectoire HDS." },
              { icon: "🔒", title: "Chiffrement",              desc: "Au repos et en transit. Secret professionnel par architecture." },
              { icon: "👤", title: "Accès par rôle",           desc: "19 rôles cliniques. Chaque professionnel ne voit que ce qu'il doit voir." },
              { icon: "🏥", title: "Non dispositif médical",   desc: "Outil de coordination organisationnelle. Pas de diagnostic, pas de prescription." },
            ].map((item, i) => (
              <ScrollReveal key={i} variant="fade-up" delay={i * 0.08} duration={0.55}>
                <div style={{ textAlign: "center", padding: "24px 16px" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</h4>
                  <p style={{ fontSize: 13, color: C.tm, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "clamp(80px,12vw,160px) 0", background: C.dark, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <AmbientGlowCTA />
        <div style={{ ...CTR, position: "relative", zIndex: 1 }}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <h2 style={{ fontSize: "clamp(2rem,5vw,3.8rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16 }}>
              Prêts à coordonner<br />autrement ?
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.08} duration={0.6}>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
              Un pilote. Votre équipe. Vos patients.<br />Deux mois pour voir la différence.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.16} duration={0.6}>
            <a
              href="mailto:margot@namipourlavie.com"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", background: "#fff", color: C.nami,
                borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 8px 40px rgba(91,78,196,0.12)", fontFamily: FONT_JAKARTA,
                transition: "background 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.bgAlt; e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff";  e.currentTarget.style.transform = "translateY(0)" }}
            >
              Planifier une démo →
            </a>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.24} duration={0.6}>
            <p style={{ marginTop: 48, fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: FONT_INTER, lineHeight: 1.6 }}>
              Nami · Coordination des parcours de soins<br />
              Conforme RGPD · Non dispositif médical · Données hébergées en UE
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "20px 0", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", background: C.dark, borderTop: "1px solid rgba(255,255,255,0.05)", fontFamily: FONT_INTER }}>
        © 2026 Nami — namipourlavie.com · Outil de coordination de parcours · Non dispositif médical
      </footer>
    </div>
  )
}
