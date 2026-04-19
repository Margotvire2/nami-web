"use client"

import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { AmbientGlowCTA } from "@/components/pitch/AmbientGlow"

const C = {
  nami: "#5B4EC4", namiH: "#4c44b0", teal: "#2BA89C",
  bg: "#FAFAF8", bgAlt: "#F5F3EF", dark: "#1A1A2E",
  t1: "#1A1A2E", t2: "#4A4A5A", tm: "#8A8A96",
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
          <div style={{ background: "#E8E8ED", borderRadius: 6, padding: "3px 40px", fontSize: 10, color: "#8A8A96", fontFamily: FI }}>app.namipourlavie.com</div>
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
    <div style={{ width: 160, background: "#fff", borderRight: `1px solid ${C.bl}`, padding: "12px 8px", flexShrink: 0 }}>
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
          fontSize: 11, fontWeight: active === it.id ? 600 : 500, cursor: "pointer",
        }}>
          <span style={{ fontSize: 13 }}>{it.icon}</span>
          {it.label}
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
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Bonjour, Pr Hanachi 👋</div>
        <div style={{ fontSize: 11, color: C.tm, marginBottom: 16, fontFamily: FI }}>Lundi 21 avril 2026</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { n: "12", l: "Patients actifs", c: C.nami },
            { n: "4", l: "Consultations aujourd'hui", c: C.teal },
            { n: "2", l: "Adressages en attente", c: "#F59E0B" },
            { n: "87%", l: "Complétude dossiers", c: "#10B981" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: `1px solid ${C.bl}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.c, fontFamily: FI }}>{s.n}</div>
              <div style={{ fontSize: 9, color: C.tm, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: C.t2 }}>Consultations du jour</div>
        {[
          { time: "09:00", name: "Léa Bernard", badge: "Suivi péd.", color: "#059669" },
          { time: "10:00", name: "Marc Dubois", badge: "Obésité PCR", color: "#F59E0B" },
          { time: "11:30", name: "Sophie Laurent", badge: "TCA", color: "#DC2626" },
          { time: "14:00", name: "Emma Petit", badge: "Bilan initial", color: C.nami },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < 3 ? `1px solid ${C.bl}` : "none" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.nami, width: 36, fontFamily: FI }}>{a.time}</span>
            <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{a.name}</span>
            <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: `${a.color}15`, color: a.color }}>{a.badge}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Step 2: Consultation scribe ───────────────────────────────────────────────
function MockScribe() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <MiniSidebar active="patients" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>SL</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Sophie Laurent</div>
            <div style={{ fontSize: 10, color: C.tm }}>AM restrictive · IMC 14.8 · Suivi M+3</div>
          </div>
        </div>
        <div style={{ background: "rgba(91,78,196,0.04)", border: `1px solid rgba(91,78,196,0.15)`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: "#fff" }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626" }}>Enregistrement en cours</div>
              <div style={{ fontSize: 10, color: C.tm, fontFamily: FI }}>14:23 — Consultation en cours</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              {[0.3, 0.7, 0.5, 0.9, 0.4, 0.8, 0.6, 0.3, 0.7, 0.5].map((h, i) => (
                <div key={i} style={{ width: 3, height: 12 * h + 4, background: "#DC2626", borderRadius: 2, opacity: 0.4 + h * 0.4 }} />
              ))}
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.5, fontStyle: "italic" }}>
            &quot;...elle mange un peu mieux cette semaine, elle a repris les yaourts et le pain au petit-déjeuner. Par contre elle reste anxieuse avant les repas du soir...&quot;
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.nami, marginBottom: 8 }}>↓ Après arrêt — structuration automatique</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { type: "Motif", text: "Suivi TCA M+3 post-hospitalisation" },
            { type: "Anamnèse", text: "Amélioration alimentaire partielle, anxiété pré-prandiale persistante" },
            { type: "Décisions", text: "Maintien suivi hebdomadaire diététique, ajout TCC ciblée" },
            { type: "Ordonnance", text: "📋 Brouillon : bilan bio contrôle (K, albumine, NFS)" },
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
    { phase: "ÉVALUATION", label: "Bilan initial pluridisciplinaire", status: "done", delay: "J+0", ref: "HAS 2010 §3.2" },
    { phase: "ÉVALUATION", label: "Bilan biologique complet", status: "done", delay: "J+3", ref: "HAS 2010 §4.1" },
    { phase: "ÉVALUATION", label: "Évaluation psychiatrique", status: "done", delay: "J+7", ref: "NICE NG69 §1.5" },
    { phase: "THÉRAPIE", label: "Début suivi diététique hebdomadaire", status: "done", delay: "J+14", ref: "HAS 2010 §5.2" },
    { phase: "THÉRAPIE", label: "Début psychothérapie (TCC)", status: "late", delay: "J+21", ref: "NICE NG69 §1.6" },
    { phase: "SUIVI", label: "Bilan biologique de contrôle", status: "pending", delay: "J+42", ref: "HAS 2010 §6.1" },
    { phase: "SUIVI", label: "Réévaluation pluridisciplinaire", status: "pending", delay: "J+90", ref: "HAS 2010 §7" },
  ]
  const statusStyle = (s: string) =>
    s === "done"    ? { bg: "#D1FAE5", color: "#065F46", label: "Réalisé" } :
    s === "late"    ? { bg: "#FEE2E2", color: "#991B1B", label: "En retard" } :
                     { bg: "#F3F4F6", color: "#6B7280", label: "À venir" }

  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <MiniSidebar active="patients" />
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Parcours — Sophie Laurent</div>
        <div style={{ fontSize: 11, color: C.tm, marginBottom: 4 }}>Anorexie mentale · adolescente · Template HAS 2010 + NICE NG69</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 6, background: "#E5E7EB", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ width: "57%", height: "100%", background: `linear-gradient(90deg, ${C.nami}, ${C.teal})`, borderRadius: 100 }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.nami, fontFamily: FI }}>57%</span>
          <span style={{ fontSize: 9, color: C.tm }}>complétude</span>
        </div>
        {steps.map((step, i) => {
          const st = statusStyle(step.status)
          const showPhase = i === 0 || steps[i - 1].phase !== step.phase
          return (
            <div key={i}>
              {showPhase && (
                <div style={{ fontSize: 9, fontWeight: 800, color: C.nami, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: i > 0 ? 12 : 0, marginBottom: 6 }}>{step.phase}</div>
              )}
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
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Équipe de Sophie Laurent</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { ini: "AH", name: "Pr Hanachi", role: "Cheffe de service nutrition", bg: C.nami },
            { ini: "SD", name: "S. Degrange", role: "Diététicienne", bg: "#059669" },
            { ini: "CR", name: "Dr Ringot", role: "Psychiatre", bg: "#2563EB" },
            { ini: "AY", name: "A. Yeganyan", role: "Psychologue", bg: "#7C3AED" },
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
            { ini: "SD", bg: "#059669", name: "Sophie Degrange", text: "Bilan nutritionnel fait ce matin. Apports caloriques en hausse (+200 kcal/j vs semaine dernière). Elle accepte mieux les collations.", time: "10:42", role: "Diététicienne" },
            { ini: "CR", bg: "#2563EB", name: "Dr Ringot", text: "Vu en consultation hier. Anxiété pré-prandiale persistante. On démarre la TCC ciblée la semaine prochaine.", time: "11:15", role: "Psychiatre" },
            { ini: "AH", bg: C.nami, name: "Pr Hanachi", text: "Merci pour les retours. Je prescris un contrôle bio avant la réévaluation pluridisciplinaire du 15 mai.", time: "14:30", role: "Cheffe de service nutrition" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{m.ini}</div>
              <div style={{ background: C.bgAlt, borderRadius: "10px 10px 10px 3px", padding: "8px 12px", maxWidth: "75%" }}>
                <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>{m.name} · <span style={{ fontWeight: 500, color: C.tm }}>{m.role}</span></div>
                <div style={{ fontSize: 12, lineHeight: 1.5, color: C.t1 }}>{m.text}</div>
                <div style={{ fontSize: 9, color: C.tm, marginTop: 3, fontFamily: FI }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: C.tm, fontFamily: FI, marginTop: 8, fontStyle: "italic" }}>
          Chaque message est rattaché au dossier de coordination — traçable, horodaté, conforme RGPD.
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
          <span style={{ fontSize: 12, color: C.t2 }}>critères hospitalisation anorexie mentale adolescente</span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.nami, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>3 résultats · 22 308 sources consultées</div>
        {[
          { title: "Critères d'hospitalisation en urgence — AM", source: "HAS 2010 §8.4", score: 0.94, excerpt: "IMC < 14, FC < 40 bpm, K+ < 2.5 mmol/L, hypothermie < 35°C, trouble du rythme cardiaque, idéation suicidaire active" },
          { title: "Admission criteria for medical stabilisation", source: "NICE NG69 §1.5.3", score: 0.89, excerpt: "BMI below 2nd centile for age, rapid weight loss >1kg/week, acute food refusal, syncope, significant electrolyte imbalance" },
          { title: "Seuils biologiques d'alerte — dénutrition sévère", source: "FFAB Consensus 2019", score: 0.86, excerpt: "Albumine < 30 g/L, préalbumine < 110 mg/L, phosphore < 0.65 mmol/L (risque SRI), magnésium, NFS" },
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

// ── Step 6: Patient data ──────────────────────────────────────────────────────
function MockPatientData() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <MiniSidebar active="patients" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Sophie Laurent — Suivi</div>
        <div style={{ fontSize: 10, color: C.tm, marginBottom: 16 }}>Données auto-rapportées + observations soignant</div>
        <div style={{ background: "#fff", border: `1px solid ${C.bl}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8 }}>Poids (kg) — 6 derniers mois</div>
          <svg viewBox="0 0 400 80" style={{ width: "100%", height: 60 }}>
            <polyline fill="none" stroke={C.nami} strokeWidth="2" points="20,70 80,65 140,58 200,52 260,48 320,45 380,43" />
            <polyline fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" points="20,30 380,30" />
            <text x="385" y="33" fontSize="8" fill={C.tm}>Obj: 48kg</text>
            {[[20,70],[80,65],[140,58],[200,52],[260,48],[320,45],[380,43]].map(([x,y], i) =>
              <circle key={i} cx={x} cy={y} r="3" fill={C.nami} />
            )}
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.tm, fontFamily: FI }}>
            <span>Oct 2025</span><span>Nov</span><span>Déc</span><span>Jan 2026</span><span>Fév</span><span>Mars</span><span>Avr</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { icon: "🍽", label: "Repas photographiés", value: "18/21", sub: "cette semaine", color: C.teal },
            { icon: "😊", label: "Score bien-être", value: "6.2/10", sub: "moyenne 7j", color: "#F59E0B" },
            { icon: "🚶", label: "Activité physique", value: "3 séances", sub: "marche + yoga", color: C.nami },
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
            Progression pondérale régulière (+5.2 kg depuis oct. 2025). Apports caloriques en hausse. Anxiété pré-prandiale persistante — TCC ciblée à initier. Bilan bio de contrôle à prévoir (K, albumine, NFS). Prochaine réévaluation pluridisciplinaire : 15 mai.
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Steps data ────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "1",
    eyebrow: "8H30 — ARRIVÉE",
    title: "Il ouvre Nami. Tout est là.",
    desc: "Le dashboard affiche ses rendez-vous du jour, les tâches en attente, l'activité récente de son équipe. En un coup d'œil, il sait si quelqu'un a bougé dans un dossier depuis hier.",
    mock: <MockDashboard />,
  },
  {
    num: "2",
    eyebrow: "9H00 — CONSULTATION",
    title: "Il consulte. Nami écoute.",
    desc: "Il appuie sur « Enregistrer » au début de la consultation. Il parle avec son patient normalement. À la fin, l'IA structure automatiquement la note — motif, anamnèse, décisions, brouillons d'ordonnance. Il valide, corrige, signe. 30 secondes.",
    mock: <MockScribe />,
  },
  {
    num: "3",
    eyebrow: "10H30 — PARCOURS",
    title: "Il vérifie le parcours. Rien n'est oublié.",
    desc: "Chaque étape du parcours de soins est sourcée sur les référentiels (HAS, NICE). Le moteur de complétude identifie les étapes manquantes ou en retard. Pas d'alerte clinique — un indicateur de complétude du dossier.",
    mock: <MockParcours />,
  },
  {
    num: "4",
    eyebrow: "11H00 — ÉQUIPE",
    title: "Il parle à son équipe. Dans le dossier.",
    desc: "La messagerie est rattachée au patient. La diététicienne donne ses retours, le psychiatre signale un point d'attention, le pédiatre ajuste le plan. Tout est tracé, horodaté, dans le dossier de coordination.",
    mock: <MockMessages />,
  },
  {
    num: "5",
    eyebrow: "11H30 — RECHERCHE",
    title: "Un doute clinique. 2 secondes.",
    desc: "22 308 sources médicales structurées — HAS, DSM-5, NICE, FFAB, Orphanet, BDPM. Recherche en langage naturel, résultats sourcés avec extraits originaux. De la documentation, pas des recommandations automatiques.",
    mock: <MockKnowledge />,
  },
  {
    num: "6",
    eyebrow: "14H00 — SUIVI",
    title: "Les données du patient viennent à lui.",
    desc: "Poids, repas photographiés, score de bien-être, activité physique — tout ce que le patient renseigne depuis l'app mobile remonte dans le dossier. Le résumé IA intègre ces données avec les observations de l'équipe.",
    mock: <MockPatientData />,
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────
export function DemoWalkthroughClient() {
  return (
    <div style={{ fontFamily: FJ, color: C.t1, background: C.bg, overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(250,250,248,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.bl}`, padding: "14px 0",
      }}>
        <div style={{ ...CTR, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "1.25rem", fontWeight: 900, color: C.nami, letterSpacing: "-0.03em" }}>nami</span>
          <span style={{ fontSize: 12, fontFamily: FI, color: C.tm, fontWeight: 500 }}>Démo · Une journée sur Nami</span>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 60px" }}>
        <div style={{ maxWidth: 800 }}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <div style={EYE()}>Démo interactive</div>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.08} duration={0.6}>
            <h1 style={{ fontSize: "clamp(2.2rem, 7.5vw, 5rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: 20 }}>
              Une journée<br />sur <span style={GRAD}>Nami</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.16} duration={0.6}>
            <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.15rem)", lineHeight: 1.6, color: C.t2, maxWidth: 520, margin: "0 auto 32px" }}>
              De l&apos;arrivée au cabinet à la dernière consultation — voici comment un médecin utilise Nami au quotidien. Rien à installer, rien à apprendre.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.24} duration={0.6}>
            <p style={{ fontSize: 12, fontFamily: FI, color: C.tm }}>
              Outil de coordination · Non dispositif médical · Conforme RGPD
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* STEPS */}
      {STEPS.map((step, i) => (
        <section
          key={i}
          style={{
            padding: "clamp(60px, 8vw, 100px) 0",
            background: i % 2 === 0 ? C.bgAlt : C.bg,
          }}
        >
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
                <div style={EYE()}>{step.eyebrow}</div>
              </div>
              <h2 style={{
                fontSize: "clamp(1.6rem, 4vw, 2.8rem)", fontWeight: 800,
                letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 12,
              }}>
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
              On peut vous faire une démo personnalisée de 15 minutes.<br />Avec vos cas, votre spécialité, votre équipe.
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
