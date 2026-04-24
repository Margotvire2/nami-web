"use client"

import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { AmbientGlowCTA } from "@/components/pitch/AmbientGlow"
import { HAPNav } from "./HAPNav"

const C = {
  nami: "#5B4EC4", teal: "#2BA89C",
  bg: "#FAFAF8", bgAlt: "#F5F3EF", dark: "#1A1A2E",
  t1: "#1A1A2E", t2: "#374151", tm: "#6B7280",
  bl: "rgba(26,26,46,0.06)", bm: "rgba(26,26,46,0.12)",
}
const GRAD: React.CSSProperties = {
  background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
}
const CTR: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 80px)" }
const EYE = (light = false): React.CSSProperties => ({
  fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
  color: light ? "rgba(255,255,255,0.4)" : C.nami, marginBottom: 16,
})
const FJ = "var(--font-jakarta, system-ui, sans-serif)"
const FI = "var(--font-inter, Inter, sans-serif)"

// ── Browser Frame ──────────────────────────────────────────────────────────────
function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 100px rgba(26,26,46,0.16), 0 8px 24px rgba(26,26,46,0.08)", border: "1px solid rgba(26,26,46,0.08)", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ background: "#F1F3F5", padding: "9px 14px", display: "flex", gap: 6, alignItems: "center" }}>
        {["#FF6058", "#FFBC2E", "#29CA41"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#E8E8ED", borderRadius: 6, padding: "3px 40px", fontSize: 10, color: "#6B7280", fontFamily: FI }}>app.namipourlavie.com</div>
        </div>
      </div>
      <div style={{ background: "#fff", minHeight: 360 }}>{children}</div>
    </div>
  )
}

// ── Sidebar mini ──────────────────────────────────────────────────────────────
function MiniSidebar({ active }: { active: string }) {
  const items = [
    { icon: "📅", label: "Aujourd'hui", id: "today" },
    { icon: "🫀", label: "Patients", id: "patients" },
    { icon: "💬", label: "Messages", id: "messages" },
    { icon: "🧠", label: "Intelligence", id: "intelligence" },
    { icon: "📋", label: "Facturation", id: "billing" },
  ]
  return (
    <div className="demo-hap-sidebar" style={{ width: 160, background: "#fff", borderRight: `1px solid ${C.bl}`, padding: "12px 8px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", marginBottom: 16 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: C.nami, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 9, fontWeight: 800 }}>N</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: C.t1 }}>Nami</span>
      </div>
      {items.map(it => (
        <div key={it.id} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, marginBottom: 2,
          background: active === it.id ? "rgba(91,78,196,0.08)" : "transparent",
          color: active === it.id ? C.nami : C.t2,
          fontSize: 11, fontWeight: active === it.id ? 600 : 500,
        }}>
          <span style={{ fontSize: 13 }}>{it.icon}</span>{it.label}
        </div>
      ))}
    </div>
  )
}

// ── Step 1: Dashboard ─────────────────────────────────────────────────────────
function MockDashboard() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <MiniSidebar active="today" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Bonjour, Dr. Bellaiche 👋</div>
        <div style={{ fontSize: 11, color: C.tm, marginBottom: 16, fontFamily: FI }}>Lundi 21 avril 2026 · Hôpital Américain de Paris</div>
        <div className="demo-hap-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { n: "18", l: "Patients actifs", c: C.nami },
            { n: "5", l: "Consultations aujourd'hui", c: C.teal },
            { n: "3", l: "Adressages en attente", c: "#F59E0B" },
            { n: "91%", l: "Complétude dossiers", c: "#10B981" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: `1px solid ${C.bl}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.c, fontFamily: FI }}>{s.n}</div>
              <div style={{ fontSize: 9, color: C.tm, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: C.t2 }}>Consultations du jour</div>
        {[
          { time: "09:00", name: "Léa Bernard, 4 ans", badge: "APLV + retard langage", color: "#DC2626" },
          { time: "10:00", name: "Noah Petit, 8 mois", badge: "Suivi prématurité", color: C.nami },
          { time: "11:00", name: "Chloé Martin, 6 ans", badge: "Épilepsie — contrôle", color: "#7C3AED" },
          { time: "14:00", name: "Adam Leroy, 2 ans", badge: "Allergie complexe", color: "#F59E0B" },
          { time: "15:30", name: "Inès Moreau, 12 ans", badge: "Bilan TCA", color: "#DC2626" },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < 4 ? `1px solid ${C.bl}` : "none" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.nami, width: 36, fontFamily: FI }}>{a.time}</span>
            <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{a.name}</span>
            <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: `${a.color}15`, color: a.color }}>{a.badge}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step 2: Scribe ────────────────────────────────────────────────────────────
function MockScribe() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <MiniSidebar active="patients" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>LB</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Léa Bernard, 4 ans</div>
            <div style={{ fontSize: 10, color: C.tm }}>APLV · Retard de langage · Suivi pluridisciplinaire</div>
          </div>
        </div>
        <div style={{ background: "rgba(91,78,196,0.04)", border: `1px solid rgba(91,78,196,0.15)`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: "#fff" }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626" }}>Enregistrement en cours</div>
              <div style={{ fontSize: 10, color: C.tm, fontFamily: FI }}>09:12 — Consultation avec la maman</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              {[0.3, 0.7, 0.5, 0.9, 0.4, 0.8, 0.6, 0.3, 0.7, 0.5].map((h, i) => (
                <div key={i} style={{ width: 3, height: 12 * h + 4, background: "#DC2626", borderRadius: 2, opacity: 0.4 + h * 0.4 }} />
              ))}
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.5, fontStyle: "italic" }}>
            &quot;...elle a bien toléré le lait de riz cette semaine, pas de réaction cutanée. Par contre la maman signale qu&apos;elle dit très peu de mots pour son âge, peut-être 15-20 mots seulement...&quot;
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.nami, marginBottom: 8 }}>↓ Après arrêt — structuration automatique</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { type: "Motif", text: "Suivi APLV + point développement langage" },
            { type: "Anamnèse", text: "Tolérance lait de riz confirmée, pas de réaction. Vocabulaire limité (15-20 mots à 4 ans)" },
            { type: "Décisions", text: "Adressage orthophoniste (Virginie Le Muet), bilan diététique complet (Margot Vire)" },
            { type: "Ordonnance", text: "📋 Brouillon : bilan allergologique de contrôle (IgE spécifiques lait, caséine, β-lactoglobuline)" },
          ].map((item, i) => (
            <div key={i} style={{ background: C.bgAlt, borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.nami, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{item.type}</div>
              <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.4 }}>{item.text}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 9, color: C.tm, fontFamily: FI, fontStyle: "italic" }}>
          Brouillon IA — à vérifier et valider par le praticien avant intégration au dossier
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Care pathway ──────────────────────────────────────────────────────
function MockParcours() {
  const steps = [
    { phase: "ÉVALUATION", label: "Bilan allergologique initial", status: "done", delay: "J+0", ref: "ESPGHAN 2022 §2" },
    { phase: "ÉVALUATION", label: "Bilan nutritionnel diététique", status: "done", delay: "J+7", ref: "HAS 2017 §3.1" },
    { phase: "ÉVALUATION", label: "Bilan orthophonique langage", status: "late", delay: "J+14", ref: "HAS 2020 TND" },
    { phase: "SUBSTITUTION", label: "Introduction hydrolysat poussé / lait végétal", status: "done", delay: "J+3", ref: "ESPGHAN 2022 §4" },
    { phase: "SUBSTITUTION", label: "Contrôle croissance M+1", status: "done", delay: "J+30", ref: "OMS courbes 2006" },
    { phase: "RÉINTRODUCTION", label: "TPO lait cuit (test de provocation)", status: "pending", delay: "J+180", ref: "EAACI 2023" },
    { phase: "SUIVI", label: "Contrôle IgE spécifiques + prick-test", status: "pending", delay: "J+365", ref: "ESPGHAN 2022 §6" },
  ]
  const statusStyle = (s: string) =>
    s === "done"  ? { bg: "#D1FAE5", color: "#065F46", label: "Réalisé" } :
    s === "late"  ? { bg: "#FEE2E2", color: "#991B1B", label: "En retard" } :
                   { bg: "#F3F4F6", color: "#6B7280", label: "À venir" }

  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <MiniSidebar active="patients" />
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Parcours — Léa Bernard</div>
        <div style={{ fontSize: 11, color: C.tm, marginBottom: 4 }}>APLV + Retard de langage · ESPGHAN 2022 + HAS 2020 TND</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 6, background: "#E5E7EB", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ width: "64%", height: "100%", background: `linear-gradient(90deg, ${C.nami}, ${C.teal})`, borderRadius: 100 }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.nami, fontFamily: FI }}>64%</span>
          <span style={{ fontSize: 9, color: C.tm }}>complétude</span>
        </div>
        {steps.map((step, i) => {
          const st = statusStyle(step.status)
          const showPhase = i === 0 || steps[i - 1].phase !== step.phase
          return (
            <div key={i}>
              {showPhase && <div style={{ fontSize: 9, fontWeight: 800, color: C.nami, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: i > 0 ? 12 : 0, marginBottom: 6 }}>{step.phase}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${C.bl}` }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: st.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: st.color, flexShrink: 0 }}>
                  {step.status === "done" ? "✓" : step.status === "late" ? "!" : "○"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{step.label}</div>
                  <div style={{ fontSize: 9, color: C.tm, fontFamily: FI }}>{step.delay} · {step.ref}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: st.bg, color: st.color }}>{st.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 4: Team messaging ────────────────────────────────────────────────────
function MockMessages() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <MiniSidebar active="messages" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Équipe de Léa Bernard</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { ini: "MB", name: "Dr Bellaiche", role: "Gastropédiatre", bg: C.nami },
            { ini: "AG", name: "Pr Gervaix", role: "Chef de service péd.", bg: "#4F46E5" },
            { ini: "MV", name: "M. Vire", role: "Diététicienne", bg: "#059669" },
            { ini: "VL", name: "V. Le Muet", role: "Orthophoniste", bg: "#7C3AED" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, border: `1px solid ${C.bl}`, background: "#fff" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 8, fontWeight: 700 }}>{m.ini}</div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 8, color: C.tm }}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${C.bl}`, paddingTop: 12 }}>
          {[
            { ini: "MV", bg: "#059669", name: "Margot Vire", text: "Bilan nutritionnel fait. La diversification avance bien avec le lait de riz. Apports calciques à compléter — je recommande une supplémentation. CR dans le dossier.", time: "10:42", role: "Diététicienne" },
            { ini: "VL", bg: "#7C3AED", name: "Virginie Le Muet", text: "Premier bilan réalisé. Retard de langage confirmé, environ 18 mois de décalage. Je propose un suivi hebdomadaire. Compte rendu à venir.", time: "11:15", role: "Orthophoniste" },
            { ini: "AG", bg: "#4F46E5", name: "Pr Gervaix", text: "Merci pour les CR. Je valide la prise en charge pluridisciplinaire. On centralise tout dans le dossier Nami — les parents doivent avoir un seul point de contact.", time: "13:10", role: "Chef de service péd." },
            { ini: "MB", bg: C.nami, name: "Dr Bellaiche", text: "Parfait. Je programme le contrôle IgE à M+6 et le bilan gastro de contrôle. Point d'équipe le 15 mai pour coordonner la suite.", time: "14:30", role: "Gastropédiatre" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{m.ini}</div>
              <div style={{ background: C.bgAlt, borderRadius: "10px 10px 10px 3px", padding: "8px 12px", maxWidth: "75%" }}>
                <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>{m.name} · <span style={{ fontWeight: 500, color: C.tm }}>{m.role}</span></div>
                <div style={{ fontSize: 12, lineHeight: 1.5, color: C.t1 }}>{m.text}</div>
                <div style={{ fontSize: 9, color: C.tm, marginTop: 3, fontFamily: FI }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 5: Knowledge base ────────────────────────────────────────────────────
function MockKnowledge() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <MiniSidebar active="intelligence" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Base documentaire</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.bm}`, marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: C.tm }}>🔍</span>
          <span style={{ fontSize: 12, color: C.t2 }}>allergie protéines lait de vache réintroduction enfant</span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.nami, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>3 résultats · 22 308 sources consultées</div>
        {[
          { title: "Réintroduction des PLV — protocole gradué", source: "ESPGHAN 2022 §5.2", score: 0.96, excerpt: "TPO au lait cuit dès 12 mois si IgE < 2 kUA/L. Progression : lait cuit → fromage cuit → yaourt → lait cru. Intervalle minimum 3-6 mois entre paliers." },
          { title: "APLV IgE-médiée — suivi biologique", source: "EAACI Guidelines 2023", score: 0.91, excerpt: "Contrôle IgE spécifiques (caséine, β-lactoglobuline, α-lactalbumine) à 12 et 24 mois. Prick-test cutané : papule < 3mm = bon pronostic de tolérance." },
          { title: "Besoins nutritionnels en cas d'éviction — enfant 2-6 ans", source: "HAS 2017 Nutrition pédiatrique §3.4", score: 0.87, excerpt: "Apports calciques : 500 mg/j (2-3 ans), 800 mg/j (4-6 ans). Supplémentation vitamine D systématique. Surveillance croissance staturo-pondérale trimestrielle." },
        ].map((r, i) => (
          <div key={i} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.bl}`, marginBottom: 8, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{r.title}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.teal, fontFamily: FI }}>Score {r.score}</div>
            </div>
            <div style={{ fontSize: 10, color: C.nami, fontFamily: FI, marginBottom: 4 }}>{r.source}</div>
            <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.5 }}>{r.excerpt}</div>
          </div>
        ))}
        <div style={{ fontSize: 9, color: C.tm, fontFamily: FI, marginTop: 8, fontStyle: "italic" }}>
          Documentation structurée pour cliniciens. Sources cliquables. Pas de recommandation automatique.
        </div>
      </div>
    </div>
  )
}

// ── Step 6: Growth + patient data ─────────────────────────────────────────────
function MockPatientData() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <MiniSidebar active="patients" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Léa Bernard — Suivi</div>
        <div style={{ fontSize: 10, color: C.tm, marginBottom: 16 }}>Courbes de croissance OMS + données parentales</div>
        <div style={{ background: "#fff", border: `1px solid ${C.bl}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8 }}>Poids (kg) — courbe OMS filles 0-5 ans</div>
          <svg viewBox="0 0 400 100" style={{ width: "100%", height: 70 }}>
            <rect x="20" y="15" width="360" height="15" fill="rgba(16,185,129,0.06)" rx="2" />
            <rect x="20" y="30" width="360" height="25" fill="rgba(16,185,129,0.04)" rx="2" />
            <text x="385" y="24" fontSize="7" fill={C.tm} textAnchor="end">P97</text>
            <text x="385" y="42" fontSize="7" fill={C.tm} textAnchor="end">P50</text>
            <text x="385" y="68" fontSize="7" fill={C.tm} textAnchor="end">P3</text>
            <polyline fill="none" stroke="#E5E7EB" strokeWidth="1" points="20,65 100,58 180,52 260,48 340,45 380,43" />
            <polyline fill="none" stroke="#D1D5DB" strokeWidth="1" points="20,40 100,35 180,32 260,30 340,28 380,27" />
            <polyline fill="none" stroke="#E5E7EB" strokeWidth="1" points="20,20 100,18 180,16 260,15 340,14 380,13" />
            <polyline fill="none" stroke={C.nami} strokeWidth="2.5" points="20,62 100,57 180,54 220,55 260,53 340,50 380,48" />
            {[[20,62],[100,57],[180,54],[220,55],[260,53],[340,50],[380,48]].map(([x,y], i) =>
              <circle key={i} cx={x} cy={y} r="3" fill={C.nami} />
            )}
            <line x1="220" y1="55" x2="220" y2="75" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
            <text x="222" y="82" fontSize="7" fill="#F59E0B">Gastro-entérite</text>
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.tm, fontFamily: FI, marginTop: 4 }}>
            <span>Naissance</span><span>6 mois</span><span>1 an</span><span>18 mois</span><span>2 ans</span><span>3 ans</span><span>4 ans</span>
          </div>
        </div>
        <div className="demo-hap-metric-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { icon: "🍼", label: "Repas renseignés", value: "6/7 j.", sub: "par la maman", color: C.teal },
            { icon: "😴", label: "Sommeil moyen", value: "10h30", sub: "stable cette semaine", color: C.nami },
            { icon: "📏", label: "Taille", value: "98 cm", sub: "P25 OMS", color: "#F59E0B" },
          ].map((d, i) => (
            <div key={i} style={{ background: C.bgAlt, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{d.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: d.color, fontFamily: FI }}>{d.value}</div>
              <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 2 }}>{d.label}</div>
              <div style={{ fontSize: 8, color: C.tm }}>{d.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(91,78,196,0.04)", borderRadius: 8, border: `1px solid rgba(91,78,196,0.1)` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.nami, marginBottom: 4 }}>🤖 Résumé IA — Brouillon à vérifier</div>
          <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.5 }}>
            Croissance entre P3 et P25. Tolérance lait de riz confirmée. Retard de langage (15-20 mots à 4 ans, attendu ~300). Bilan orthophonique en cours. IgE de contrôle à programmer (J+180). Prochain point d&apos;équipe : 15 mai.
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "1", eyebrow: "8H30 — ARRIVÉE",
    title: "Il ouvre Nami. Tout est là.",
    desc: "Le dashboard affiche les rendez-vous du jour, les tâches en attente, l'activité récente de l'équipe pluridisciplinaire. En un coup d'œil, il sait si quelqu'un a bougé dans un dossier depuis hier.",
    mock: <MockDashboard />,
  },
  {
    num: "2", eyebrow: "9H00 — CONSULTATION",
    title: "Il consulte. Nami structure.",
    desc: "Il appuie sur « Enregistrer » au début de la consultation. Il parle avec la maman et l'enfant normalement. À la fin, l'IA structure la note — motif, anamnèse, décisions, brouillons d'ordonnance et d'adressage. Il valide, corrige, signe. 30 secondes.",
    mock: <MockScribe />,
  },
  {
    num: "3", eyebrow: "10H30 — PARCOURS",
    title: "Il vérifie le parcours. Rien n'est oublié.",
    desc: "Chaque étape du parcours est sourcée sur les référentiels (ESPGHAN, HAS, EAACI). Le moteur de complétude identifie les étapes manquantes ou en retard. Le bilan orthophonique est en retard — visible immédiatement.",
    mock: <MockParcours />,
  },
  {
    num: "4", eyebrow: "11H00 — ÉQUIPE",
    title: "Dr Bellaiche et son équipe. Dans un seul dossier.",
    desc: "La diététicienne, l'orthophoniste, Pr Gervaix — tous dans le même dossier de coordination. Chaque message est tracé, horodaté. Les parents ont un seul point de contact.",
    mock: <MockMessages />,
  },
  {
    num: "5", eyebrow: "11H30 — RECHERCHE",
    title: "Un doute clinique. 2 secondes.",
    desc: "22 308 sources médicales structurées — ESPGHAN, EAACI, HAS, Orphanet, BDPM. Le protocole de réintroduction des PLV avec les seuils IgE, en quelques mots.",
    mock: <MockKnowledge />,
  },
  {
    num: "6", eyebrow: "14H00 — SUIVI",
    title: "Les données de l'enfant viennent à lui.",
    desc: "Courbes de croissance OMS, repas renseignés par la maman, sommeil, taille — tout remonte dans le dossier. Le résumé IA intègre les données parentales avec les observations de l'équipe.",
    mock: <MockPatientData />,
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────
export function DemoWalkthroughHAPClient() {
  return (
    <div style={{ fontFamily: FJ, color: C.t1, background: C.bg, overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 479px) {
          .demo-hap-sidebar { display: none !important; }
          .demo-hap-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .demo-hap-metric-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <HAPNav />

      {/* HERO */}
      <section style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 60px" }}>
        <div style={{ maxWidth: 800 }}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <div style={EYE()}>Clinique Pédiatrique · Hôpital Américain de Paris</div>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.08} duration={0.6}>
            <h1 style={{ fontSize: "clamp(2.2rem, 7.5vw, 5rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: 20 }}>
              Une journée<br />sur <span style={GRAD}>Nami</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.16} duration={0.6}>
            <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.15rem)", lineHeight: 1.6, color: C.t2, maxWidth: 520, margin: "0 auto 32px" }}>
              De l&apos;arrivée à la clinique à la dernière consultation — voici comment l&apos;équipe pédiatrique de Pr Gervaix et Dr Bellaiche utilise Nami au quotidien.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.24} duration={0.6}>
            <p style={{ fontSize: 12, fontFamily: FI, color: C.tm }}>Outil de coordination · Non dispositif médical · Conforme RGPD</p>
          </ScrollReveal>
        </div>
      </section>

      {/* STEPS */}
      {STEPS.map((step, i) => (
        <section key={i} style={{ padding: "clamp(60px, 8vw, 100px) 0", background: i % 2 === 0 ? C.bgAlt : C.bg }}>
          <div style={CTR}>
            <ScrollReveal variant="fade-up" duration={0.6}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.nami}, ${C.teal})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: FI, flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <div style={{ ...EYE(), marginBottom: 0 }}>{step.eyebrow}</div>
              </div>
              <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 12 }}>
                {step.title}
              </h2>
              <p style={{ fontSize: 16, color: C.t2, lineHeight: 1.6, maxWidth: 600, marginBottom: 40 }}>
                {step.desc}
              </p>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.15} duration={0.6}>
              <BrowserFrame>{step.mock}</BrowserFrame>
            </ScrollReveal>
          </div>
        </section>
      ))}

      {/* TRANSITION VERS PITCH */}
      <section style={{ padding: "clamp(40px, 6vw, 80px) 0", background: C.bgAlt, textAlign: "center" }}>
        <div style={{ ...CTR }}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <p style={{ fontSize: 14, color: C.t2, marginBottom: 12 }}>
              Vous avez vu comment ça marche.
            </p>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.03em", color: C.t1, marginBottom: 20 }}>
              Maintenant, voyons pourquoi c&apos;est{" "}
              <span style={{ background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                stratégique
              </span>
            </h2>
            <a
              href="/demo-hap/pitch"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", background: C.nami, color: "#fff",
                borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(91,78,196,0.30)",
              }}
            >
              Voir la vision · 3 min →
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "clamp(80px, 12vw, 160px) 0", background: C.dark, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <AmbientGlowCTA />
        <div style={{ ...CTR, position: "relative", zIndex: 1 }}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16 }}>
              Prêt à essayer ?
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.08} duration={0.6}>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
              On peut vous faire une démo personnalisée de 15 minutes.<br />Avec vos patients, votre équipe, votre spécialité.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.16} duration={0.6}>
            <a
              href="mailto:margot@namipourlavie.com"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", background: "#fff", color: C.nami,
                borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 8px 40px rgba(91,78,196,0.12)", fontFamily: FJ,
              }}
            >
              Planifier une démo →
            </a>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.24} duration={0.6}>
            <p style={{ marginTop: 48, fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: FI, lineHeight: 1.6 }}>
              Nami · Coordination des parcours de soins<br />
              Conforme RGPD · Non dispositif médical · Données hébergées en UE
            </p>
          </ScrollReveal>
        </div>
      </section>

      <footer style={{ padding: "20px 0", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", background: C.dark, borderTop: "1px solid rgba(255,255,255,0.05)", fontFamily: FI }}>
        © 2026 Nami · namipourlavie.com · Outil de coordination de parcours · Non dispositif médical
      </footer>

    </div>
  )
}
