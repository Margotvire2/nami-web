"use client"

import { usePathname } from "next/navigation"
import { ScrollReveal } from "@/components/ui/ScrollReveal"
import { AmbientGlowCTA } from "@/components/pitch/AmbientGlow"

const C = { nami: "#5B4EC4", namiH: "#4c44b0", teal: "#2BA89C", bg: "#FAFAF8", bgAlt: "#F5F3EF", dark: "#1A1A2E", t1: "#1A1A2E", t2: "#4A4A5A", tm: "#8A8A96", bl: "rgba(26,26,46,0.06)", bm: "rgba(26,26,46,0.12)" }
const GRAD: React.CSSProperties = { background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
const CTR: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 80px)" }
const EYE = (light = false): React.CSSProperties => ({ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: light ? "rgba(255,255,255,0.35)" : C.nami, marginBottom: 16 })
const FJ = "var(--font-jakarta, system-ui, sans-serif)"
const FI = "var(--font-inter, Inter, sans-serif)"

function TCANav() {
  const pathname = usePathname()
  const isDemo = pathname === "/demo-tca"
  const isPitch = pathname?.includes("/pitch")
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,250,248,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${C.bl}`, padding: "14px 0" }}>
      <style>{`@media (max-width: 479px) { .tca-nav-discover { display: none !important; } }`}</style>
      <div style={{ ...CTR, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/demo-tca" style={{ fontSize: "1.25rem", fontWeight: 900, color: C.nami, letterSpacing: "-0.03em", textDecoration: "none" }}>nami</a>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="/demo-tca" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", background: isDemo ? "rgba(91,78,196,0.08)" : "transparent", color: isDemo ? C.nami : C.t2 }}>La plateforme</a>
          <a href="/demo-tca/pitch" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", background: isPitch ? "rgba(91,78,196,0.08)" : "transparent", color: isPitch ? C.nami : C.t2 }}>La vision</a>
        </div>
        <a href="https://namipourlavie.com" target="_blank" rel="noopener" className="tca-nav-discover" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.nami, border: "1px solid rgba(91,78,196,0.2)", textDecoration: "none" }}>Découvrir le site →</a>
      </div>
    </nav>
  )
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 100px rgba(26,26,46,0.16), 0 8px 24px rgba(26,26,46,0.08)", border: "1px solid rgba(26,26,46,0.08)", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ background: "#F1F3F5", padding: "9px 14px", display: "flex", gap: 6, alignItems: "center" }}>
        {["#FF6058","#FFBC2E","#29CA41"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#E8E8ED", borderRadius: 6, padding: "3px 40px", fontSize: 10, color: "#8A8A96", fontFamily: FI }}>app.namipourlavie.com</div>
        </div>
      </div>
      <div style={{ background: "#fff", minHeight: 340 }}>{children}</div>
    </div>
  )
}

function Sidebar({ active }: { active: string }) {
  return (
    <div className="demo-sidebar" style={{ width: 160, background: "#fff", borderRight: `1px solid ${C.bl}`, padding: "12px 8px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", marginBottom: 16 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: C.nami, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 9, fontWeight: 800 }}>N</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: C.t1 }}>Nami</span>
      </div>
      {[{ icon: "📅", label: "Aujourd'hui", id: "today" }, { icon: "👥", label: "Patients", id: "patients" }, { icon: "💬", label: "Messages", id: "messages" }, { icon: "🧠", label: "Intelligence", id: "intelligence" }].map(it => (
        <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, marginBottom: 2, background: active === it.id ? "rgba(91,78,196,0.08)" : "transparent", color: active === it.id ? C.nami : C.t2, fontSize: 11, fontWeight: active === it.id ? 600 : 500 }}>
          <span style={{ fontSize: 13 }}>{it.icon}</span>{it.label}
        </div>
      ))}
    </div>
  )
}

function MockDashboard() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <Sidebar active="today" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Bonjour, Pr. Hanachi 👋</div>
        <div style={{ fontSize: 11, color: C.tm, marginBottom: 16, fontFamily: FI }}>Mercredi 23 avril 2026</div>
        <div className="demo-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[{ n: "24", l: "Patients actifs", c: C.nami }, { n: "3", l: "Consultations aujourd'hui", c: C.teal }, { n: "4", l: "Adressages en attente", c: "#F59E0B" }, { n: "78%", l: "Complétude dossiers", c: "#10B981" }].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: `1px solid ${C.bl}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.c, fontFamily: FI }}>{s.n}</div>
              <div style={{ fontSize: 9, color: C.tm, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: C.t2 }}>File active — Service Nutrition Clinique</div>
        {[
          { time: "09:00", name: "Gabrielle M., 24 ans", badge: "AM restrictive · Post-HC M+1", color: "#DC2626" },
          { time: "10:30", name: "Sophie L., 19 ans", badge: "Boulimie · Suivi ambulatoire", color: "#F59E0B" },
          { time: "14:00", name: "Clara T., 32 ans", badge: "AM restrictive · IMC 13.1", color: "#DC2626" },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < 2 ? `1px solid ${C.bl}` : "none" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.nami, width: 36, fontFamily: FI }}>{a.time}</span>
            <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{a.name}</span>
            <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: `${a.color}15`, color: a.color }}>{a.badge}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockScribe() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <Sidebar active="patients" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>GM</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Gabrielle M., 24 ans</div>
            <div style={{ fontSize: 10, color: C.tm }}>AM restrictive · IMC 14.8 · Sortie HC J+28</div>
          </div>
        </div>
        <div style={{ background: "rgba(91,78,196,0.04)", border: "1px solid rgba(91,78,196,0.15)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: "#fff" }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626" }}>Enregistrement en cours</div>
              <div style={{ fontSize: 10, color: C.tm, fontFamily: FI }}>09:12 — Consultation de suivi M+1</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.5, fontStyle: "italic" }}>
            &quot;...elle a repris 800 grammes cette semaine, les collations du matin passent mieux. Par contre elle reste très anxieuse avant les repas du soir...&quot;
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.nami, marginBottom: 8 }}>↓ Structuration automatique</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { type: "Motif", text: "Suivi renutrition M+1 post-hospitalisation" },
            { type: "Anamnèse", text: "Reprise pondérale +800g/sem. Anxiété pré-prandiale persistante le soir" },
            { type: "Décisions", text: "Maintien NE nocturne 500 kcal, ajout TCC ciblée, rdv psy cette semaine" },
            { type: "Ordonnance", text: "🔖 Brouillon : bilan bio (K, albumine, NFS, P) + ostéodensitométrie" },
          ].map((item, i) => (
            <div key={i} style={{ background: C.bgAlt, borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.nami, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{item.type}</div>
              <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.4 }}>{item.text}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 9, color: C.tm, fontFamily: FI, fontStyle: "italic" }}>Brouillon IA — à vérifier par le praticien</div>
      </div>
    </div>
  )
}

function MockParcours() {
  const steps = [
    { phase: "STABILISATION", label: "Hospitalisation complète — renutrition", status: "done", delay: "J+0", ref: "HAS 2010 §8" },
    { phase: "STABILISATION", label: "Bilan biologique complet (K, P, Mg, alb, NFS)", status: "done", delay: "J+3", ref: "HAS 2010 §4.1" },
    { phase: "STABILISATION", label: "Évaluation psychiatrique", status: "done", delay: "J+7", ref: "NICE NG69 §1.5" },
    { phase: "TRANSITION", label: "Suivi diététique ambulatoire (hebdo)", status: "done", delay: "J+21", ref: "HAS 2010 §5.2" },
    { phase: "TRANSITION", label: "Psychothérapie TCC", status: "late", delay: "J+28", ref: "NICE NG69 §1.6" },
    { phase: "SUIVI", label: "Bilan biologique de contrôle M+1", status: "pending", delay: "J+42", ref: "HAS 2010 §6.1" },
    { phase: "SUIVI", label: "Ostéodensitométrie", status: "pending", delay: "J+90", ref: "HAS 2010 §4.3" },
    { phase: "SUIVI", label: "Réévaluation pluridisciplinaire M+3", status: "pending", delay: "J+90", ref: "HAS 2010 §7" },
  ]
  const ss = (s: string) => s === "done" ? { bg: "#D1FAE5", color: "#065F46", label: "Réalisé" } : s === "late" ? { bg: "#FEE2E2", color: "#991B1B", label: "En retard" } : { bg: "#F3F4F6", color: "#6B7280", label: "À venir" }
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <Sidebar active="patients" />
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Parcours — Gabrielle M.</div>
        <div style={{ fontSize: 11, color: C.tm, marginBottom: 4 }}>Anorexie mentale restrictive · HAS 2010 + NICE NG69</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 6, background: "#E5E7EB", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ width: "50%", height: "100%", background: `linear-gradient(90deg, ${C.nami}, ${C.teal})`, borderRadius: 100 }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.nami, fontFamily: FI }}>50%</span>
          <span style={{ fontSize: 9, color: C.tm }}>complétude</span>
        </div>
        {steps.map((step, i) => {
          const st = ss(step.status); const showPhase = i === 0 || steps[i - 1].phase !== step.phase
          return (
            <div key={i}>
              {showPhase && <div style={{ fontSize: 9, fontWeight: 800, color: C.nami, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: i > 0 ? 10 : 0, marginBottom: 5 }}>{step.phase}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: `1px solid ${C.bl}` }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: st.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: st.color, flexShrink: 0 }}>{step.status === "done" ? "✓" : step.status === "late" ? "!" : "○"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 500 }}>{step.label}</div>
                  <div style={{ fontSize: 9, color: C.tm, fontFamily: FI }}>{step.delay} · {step.ref}</div>
                </div>
                <span style={{ fontSize: 8, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: st.bg, color: st.color }}>{st.label}</span>
              </div>
            </div>
          )
        })}
        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(91,78,196,0.04)", borderRadius: 8, fontSize: 10, color: C.tm, lineHeight: 1.5, fontFamily: FI }}>
          💡 Ce parcours est le même pour un nutritionniste hospitalier ET pour un médecin de ville qui n&apos;est pas spécialisé TCA. Nami guide les étapes — le soignant n&apos;a pas besoin d&apos;être expert.
        </div>
      </div>
    </div>
  )
}

function MockMessages() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <Sidebar active="messages" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Équipe de Gabrielle M.</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { ini: "MH", name: "Pr Hanachi", role: "Nutritionniste · Paul-Brousse", bg: C.nami },
            { ini: "SD", name: "S. Degrange", role: "Diététicienne · Paul-Brousse", bg: "#059669" },
            { ini: "CR", name: "Dr Ringot", role: "Psychiatre · Paul-Brousse", bg: "#2563EB" },
            { ini: "AY", name: "A. Yeganyan", role: "Psychologue · Paul-Brousse", bg: "#7C3AED" },
            { ini: "MT", name: "Dr Martin", role: "Médecin traitant · Libéral", bg: "#F59E0B" },
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
            { ini: "SD", bg: "#059669", name: "Sophie Degrange", text: "Apports caloriques en hausse cette semaine (+200 kcal/j). Collations du matin OK. Anxiété pré-prandiale persistante au dîner.", time: "10:42", role: "Diététicienne" },
            { ini: "CR", bg: "#2563EB", name: "Dr Ringot", text: "Vu en consultation hier. TCC ciblée anxiété repas démarrée. Pas d'idéation suicidaire. Sommeil fragile.", time: "11:15", role: "Psychiatre" },
            { ini: "MT", bg: "#F59E0B", name: "Dr Martin", text: "Merci pour les retours. De mon côté je n'aurais pas su quoi surveiller sans le parcours structuré. Le bilan bio de contrôle est programmé.", time: "14:30", role: "Médecin traitant · Libéral" },
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
          Le médecin traitant en libéral a les mêmes informations que l&apos;équipe hospitalière. Le suivi ne se perd pas à la sortie.
        </div>
      </div>
    </div>
  )
}

function MockKnowledge() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <Sidebar active="intelligence" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Base documentaire</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.bm}`, marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: C.tm }}>🔍</span>
          <span style={{ fontSize: 12, color: C.t2 }}>bilan biologique anorexie mentale suivi ambulatoire</span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.nami, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>3 résultats · 60 000+ sources</div>
        {[
          { title: "Bilan biologique de suivi — AM ambulatoire", source: "HAS 2010 §6.1", score: 0.96, excerpt: "NFS, ionogramme (K, Na, P, Mg), albumine, préalbumine, bilan hépatique, ECG de contrôle. Fréquence : mensuel en post-HC, puis trimestriel." },
          { title: "Seuils biologiques d'alerte — dénutrition sévère", source: "FFAB Consensus 2019", score: 0.93, excerpt: "K+ < 2.5 mmol/L, P < 0.65 mmol/L (risque SRI), albumine < 30 g/L, préalbumine < 110 mg/L. Hospitalisation si 2+ critères." },
          { title: "Syndrome de renutrition inappropriée — prévention", source: "NICE NG69 §1.5.3", score: 0.89, excerpt: "Supplémentation phosphore + thiamine + magnésium systématique si IMC < 14 ou apports < 500 kcal/j depuis > 5 jours. Surveillance ECG quotidienne." },
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
          Un médecin de ville non spécialisé TCA sait exactement quoi surveiller. Pas besoin d&apos;être expert — les sources sont là.
        </div>
      </div>
    </div>
  )
}

function MockPatientData() {
  return (
    <div style={{ display: "flex", minHeight: 340 }}>
      <Sidebar active="patients" />
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Gabrielle M. — Suivi</div>
        <div style={{ fontSize: 10, color: C.tm, marginBottom: 16 }}>Données cliniques + auto-rapportées</div>
        <div style={{ background: "#fff", border: `1px solid ${C.bl}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8 }}>Poids (kg) — depuis hospitalisation</div>
          <svg viewBox="0 0 400 80" style={{ width: "100%", height: 60 }}>
            <polyline fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" points="20,20 380,20" />
            <text x="385" y="23" fontSize="8" fill={C.tm}>Obj: 48kg</text>
            <polyline fill="none" stroke={C.nami} strokeWidth="2.5" points="20,72 80,65 140,58 200,52 260,47 320,43 380,40" />
            {[[20,72],[80,65],[140,58],[200,52],[260,47],[320,43],[380,40]].map(([x,y], i) => <circle key={i} cx={x} cy={y} r="3" fill={C.nami} />)}
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.tm, fontFamily: FI, marginTop: 4 }}>
            <span>HC J+0</span><span>J+7</span><span>J+14</span><span>J+21</span><span>J+28</span><span>J+35</span><span>J+42</span>
          </div>
        </div>
        <div className="demo-metric-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { icon: "📊", label: "Score EDE-Q", value: "3.2", sub: "vs 4.1 à l'entrée", color: C.teal },
            { icon: "💛", label: "Score PHQ-9", value: "12", sub: "dépression modérée", color: "#F59E0B" },
            { icon: "🍽", label: "Repas renseignés", value: "5/7 j.", sub: "via l'app patient", color: C.nami },
          ].map((d, i) => (
            <div key={i} style={{ background: C.bgAlt, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{d.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: d.color, fontFamily: FI }}>{d.value}</div>
              <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 2 }}>{d.label}</div>
              <div style={{ fontSize: 8, color: C.tm }}>{d.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(91,78,196,0.04)", borderRadius: 8, border: "1px solid rgba(91,78,196,0.1)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.nami, marginBottom: 4 }}>🤖 Résumé IA — Brouillon à vérifier</div>
          <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.5 }}>
            Reprise pondérale progressive (+4.2 kg depuis sortie HC). NE nocturne maintenue. Anxiété pré-prandiale ciblée en TCC. Score EDE-Q en baisse. Bilan bio et ostéodensitométrie à programmer. Prochaine RCP : 15 mai.
          </div>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  { num: "1", eyebrow: "8H30 — ARRIVÉE", title: "Elle ouvre Nami. Tout est là.", desc: "Le dashboard affiche la file active du service, les adressages en attente, l'activité de l'équipe. Qui a vu qui, quelles notes ont été ajoutées, quels rendez-vous manquent — depuis l'hôpital et depuis la ville.", mock: <MockDashboard /> },
  { num: "2", eyebrow: "9H00 — CONSULTATION", title: "Elle consulte. Nami écoute.", desc: "Elle appuie sur « Enregistrer ». Elle parle avec la patiente normalement — rien ne change dans sa consultation. À la fin, l'IA structure la note en 10 types et génère les brouillons d'ordonnance. 30 secondes pour valider.", mock: <MockScribe /> },
  { num: "3", eyebrow: "10H30 — PARCOURS", title: "Le parcours guide — même sans être expert TCA.", desc: "Chaque étape est sourcée HAS/NICE. Un médecin de ville non spécialisé sait quoi faire : quels tests, quels bilans, vers qui orienter. Le moteur de complétude signale les retards. Pas besoin d'être expert — les étapes sont là.", mock: <MockParcours /> },
  { num: "4", eyebrow: "11H00 — ÉQUIPE", title: "L'hôpital et la ville partagent le même dossier.", desc: "La diététicienne de Paul-Brousse, la psychiatre du service, et le médecin traitant en ville — tous voient les mêmes informations. Le suivi ne se perd pas à la sortie de l'hôpital.", mock: <MockMessages /> },
  { num: "5", eyebrow: "11H30 — RECHERCHE", title: "Un doute clinique. 2 secondes.", desc: "60 000+ sources médicales structurées — HAS, NICE, FFAB, DSM-5. Le médecin de ville qui ne sait pas quoi surveiller dans un bilan TCA trouve la réponse sourcée immédiatement.", mock: <MockKnowledge /> },
  { num: "6", eyebrow: "14H00 — SUIVI", title: "Les données viennent au soignant.", desc: "Courbe pondérale, scores EDE-Q et PHQ-9, repas renseignés par la patiente via l'app. Le résumé IA intègre tout — y compris ce que les autres soignants ont noté.", mock: <MockPatientData /> },
]

export function DemoWalkthroughTCAClient() {
  return (
    <div style={{ fontFamily: FJ, color: C.t1, background: C.bg, overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 479px) {
          .demo-sidebar { display: none !important; }
          .demo-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .demo-metric-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
      <TCANav />
      <section style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 60px" }}>
        <div style={{ maxWidth: 800 }}>
          <ScrollReveal variant="fade-up" duration={0.6}><div style={EYE()}>Coordination TCA</div></ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.08} duration={0.6}>
            <h1 style={{ fontSize: "clamp(2.2rem, 7.5vw, 5rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: 20 }}>
              La coordination<br />que vos <span style={GRAD}>réseaux</span><br />méritent
            </h1>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.16} duration={0.6}>
            <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.15rem)", lineHeight: 1.6, color: C.t2, maxWidth: 540, margin: "0 auto 32px" }}>
              Que le soignant soit à l&apos;hôpital ou en libéral, spécialisé TCA ou non — Nami structure le parcours pour que chacun sache quoi faire. Le patient ne se perd plus entre deux consultations.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.24} duration={0.6}>
            <p style={{ fontSize: 12, fontFamily: FI, color: C.tm }}>Outil de coordination · Non dispositif médical · Conforme RGPD</p>
          </ScrollReveal>
        </div>
      </section>

      {STEPS.map((step, i) => (
        <section key={i} style={{ padding: "clamp(60px, 8vw, 100px) 0", background: i % 2 === 0 ? C.bgAlt : C.bg }}>
          <div style={CTR}>
            <ScrollReveal variant="fade-up" duration={0.6}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.nami}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: FI, flexShrink: 0 }}>{step.num}</div>
                <div style={{ ...EYE(), marginBottom: 0 }}>{step.eyebrow}</div>
              </div>
              <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 12 }}>{step.title}</h2>
              <p style={{ fontSize: 16, color: C.t2, lineHeight: 1.6, maxWidth: 600, marginBottom: 40 }}>{step.desc}</p>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.15} duration={0.6}>
              <BrowserFrame>{step.mock}</BrowserFrame>
            </ScrollReveal>
          </div>
        </section>
      ))}

      <section style={{ padding: "clamp(40px, 6vw, 80px) 0", background: C.bgAlt, textAlign: "center" }}>
        <div style={CTR}>
          <ScrollReveal variant="fade-up" duration={0.6}>
            <p style={{ fontSize: 14, color: C.t2, marginBottom: 12 }}>Vous avez vu comment ça marche.</p>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20 }}>
              Maintenant, voyons pourquoi c&apos;est <span style={GRAD}>stratégique</span>
            </h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <a href="/demo-tca/pitch" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: C.nami, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 20px rgba(91,78,196,0.30)" }}>Voir la vision · 3 min →</a>
              <a href="/gabrielle" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#fff", color: C.nami, borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", border: `1.5px solid rgba(91,78,196,0.2)`, boxShadow: "0 2px 12px rgba(91,78,196,0.08)" }}>Parcours de Gabrielle →</a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section style={{ padding: "clamp(80px, 12vw, 160px) 0", background: C.dark, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <AmbientGlowCTA />
        <div style={{ ...CTR, position: "relative", zIndex: 1 }}>
          <ScrollReveal variant="fade-up" duration={0.6}><h2 style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16 }}>Prêt à essayer ?</h2></ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.08} duration={0.6}><p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>Un pilote. Votre équipe. Vos patients.<br />Deux mois pour voir la différence.</p></ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.16} duration={0.6}>
            <a href="mailto:margot@namipourlavie.com" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "#fff", color: C.nami, borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 40px rgba(91,78,196,0.12)", fontFamily: FJ }}>Planifier une démo →</a>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.24} duration={0.6}><p style={{ marginTop: 48, fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: FI, lineHeight: 1.6 }}>Nami · Coordination des parcours de soins<br />Conforme RGPD · Non dispositif médical · Données hébergées en UE</p></ScrollReveal>
        </div>
      </section>
      <footer style={{ padding: "20px 0", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", background: C.dark, borderTop: "1px solid rgba(255,255,255,0.05)", fontFamily: FI }}>© 2026 Nami — namipourlavie.com · Outil de coordination de parcours · Non dispositif médical</footer>
    </div>
  )
}
