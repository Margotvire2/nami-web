"use client";

import { useState, useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

// ─── AnimatedCounter ──────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const DURATION = 2200;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const raf = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = progress < 1 ? 1 - Math.pow(1 - progress, 5) : 1;
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [started, target]);

  return <span ref={ref}>{value.toLocaleString("fr-FR")}{suffix}</span>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#5B4EC4", marginBottom: 14 }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.025em", lineHeight: 1.2, margin: 0 }}>
      {children}
    </h2>
  );
}

function Grad({ children }: { children: string }) {
  return (
    <span style={{
      background: "linear-gradient(135deg, #5B4EC4, #2BA89C)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    } as CSSProperties}>
      {children}
    </span>
  );
}

// ─── HoverCard ────────────────────────────────────────────────────────────────

function HoverCard({ icon, iconBg, title, text }: { icon: string; iconBg: string; title: string; text: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 16,
        padding: "28px 24px",
        height: "100%",
        transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 48px rgba(91,78,196,0.12)" : "0 2px 8px rgba(26,26,46,0.04)",
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1A1A2E", margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontSize: "0.875rem", color: "#4A4A5A", lineHeight: 1.65, margin: 0 }}>{text}</p>
    </div>
  );
}

// ─── BrowserFrame ─────────────────────────────────────────────────────────────

function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid rgba(26,26,46,0.10)",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(26,26,46,0.08)",
    }}>
      <div style={{ background: "#F5F3EF", padding: "10px 16px", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
        {(["#FFB3B3", "#FFE0B3", "#B3F0E0"] as const).map((bg) => (
          <div key={bg} style={{ width: 10, height: 10, borderRadius: "50%", background: bg }} />
        ))}
      </div>
      <div style={{ padding: "24px 20px" }}>{children}</div>
    </div>
  );
}

// ─── SECTION 1 — HERO ─────────────────────────────────────────────────────────

function HeroSection() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <section style={{
      background: "#FAFAF8",
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      padding: "0 clamp(20px, 5vw, 80px)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        top: "-200px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "800px",
        height: "600px",
        background: "radial-gradient(ellipse at center, rgba(91,78,196,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: 80,
        paddingBottom: 60,
        position: "relative",
        zIndex: 1,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(24px)",
        transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#EDE9FE",
          border: "1px solid rgba(91,78,196,0.2)",
          borderRadius: 100,
          padding: "6px 14px",
          fontSize: 12,
          fontWeight: 700,
          color: "#5B4EC4",
          marginBottom: 28,
          width: "fit-content",
        }}>
          🏥 Hôpital Américain de Paris · Clinique Pédiatrique
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
          fontWeight: 800,
          color: "#1A1A2E",
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          margin: "0 0 20px",
          maxWidth: 780,
        }}>
          Des soignants mieux connectés.<br />
          Des patients mieux <Grad>accompagnés.</Grad>
        </h1>

        {/* Subtitle */}
        <div style={{ marginBottom: 36 }}>
          {[
            "Coordonner vos spécialistes en vacations.",
            "Relier la ville à l'hôpital.",
            "Faire entrer le volume qui rend l'excellence accessible.",
          ].map((line, i) => (
            <p key={i} style={{ fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)", color: "#4A4A5A", lineHeight: 1.7, margin: "0 0 2px" }}>
              {line}
            </p>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#produit"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#5B4EC4",
            color: "#fff",
            borderRadius: 100,
            padding: "13px 28px",
            fontSize: "0.9rem",
            fontWeight: 700,
            textDecoration: "none",
            width: "fit-content",
            transition: "background 0.2s, transform 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#4c44b0"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#5B4EC4"; e.currentTarget.style.transform = "none"; }}
        >
          Découvrir Nami →
        </a>

        {/* Legal */}
        <p style={{ marginTop: 24, fontSize: "0.72rem", color: "#8A8A96", lineHeight: 1.5 }}>
          Plateforme de coordination des parcours · Art. L.1110-12 CSP · Données hébergées en Europe
        </p>
      </div>
    </section>
  );
}

// ─── SECTION 2 — CE QUE NAMI APPORTE ─────────────────────────────────────────

const APPORT_CARDS = [
  {
    icon: "🔗", iconBg: "#EDE9FE",
    title: "Coordination interne fluide",
    text: "Un dossier partagé entre tous les spécialistes. Chacun voit ce que les autres ont fait depuis sa dernière consultation — sans appeler, sans chercher, sans attendre.",
  },
  {
    icon: "🏙️", iconBg: "#CCFBF1",
    title: "Réseau ville-hôpital structuré",
    text: "Les médecins de ville adressent en un clic, reçoivent le retour en temps réel, et gardent la visibilité sur leur patient. Le réseau existe parce que l'infrastructure existe.",
  },
  {
    icon: "👨‍👩‍👧", iconBg: "#FEF9C3",
    title: "Parents intégrés au parcours",
    text: "Un carnet de santé digital où les parents saisissent biberons, sommeil, selles — et tout remonte aux soignants. Aucune perte de données entre deux consultations.",
  },
];

function ApportSection() {
  return (
    <section style={{ background: "#F5F3EF", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>CE QUE NAMI APPORTE</Eyebrow>
          <SectionTitle>Une équipe transdisciplinaire. Un parcours sans rupture.</SectionTitle>
          <p style={{ fontSize: "1rem", color: "#4A4A5A", lineHeight: 1.7, marginTop: 12, marginBottom: 48, maxWidth: 600 }}>
            L'excellence clinique existe déjà. Nami la rend visible, partagée et continue — entre vos murs et au-delà.
          </p>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {APPORT_CARDS.map((card, i) => (
            <ScrollReveal key={i} variant="fade-up" delay={i * 0.1} duration={0.7}>
              <HoverCard {...card} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 3 — PRODUIT (tabs) ───────────────────────────────────────────────

function TabDossier() {
  const NOTES = [
    { color: "#5B4EC4", author: "Dr Marchand · Gastro-pédiatre", body: "Suspicion APLV — coliques + eczéma + selles hétérogènes. Éviction PLV démarrée, contrôle prick-tests prévu dans 4 semaines.", date: "Mardi 15 avril" },
    { color: "#2BA89C", author: "Dr Lambert · Allergo-pédiatre", body: "Prick-tests lait de vache positifs (6mm). IgE spécifiques en attente. Confirmation APLV IgE-médiée probable.", date: "Jeudi 17 avril" },
    { color: "#F59E0B", author: "Margot Vire · Diététicienne", body: "Transition hydrolysat poussé. Prise pondérale +180g cette semaine. Mère rassurée, adhésion bonne au nouveau lait.", date: "Vendredi 18 avril" },
  ];
  return (
    <div style={{ opacity: 1, animation: "fadeTabUp 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
      <BrowserFrame>
        {/* Patient header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #F5F3EF" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👶</div>
          <div>
            <div style={{ fontWeight: 700, color: "#1A1A2E", fontSize: "0.95rem" }}>Léa Bernard · 2 mois</div>
            <div style={{ fontSize: "0.72rem", color: "#8A8A96" }}>Allergo-péd · Gastro-péd · Nutrition</div>
          </div>
        </div>
        {/* Notes */}
        {NOTES.map((note, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${note.color}`, paddingLeft: 14, marginBottom: i < NOTES.length - 1 ? 14 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 8 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1A1A2E" }}>{note.author}</span>
              <span style={{ fontSize: "0.72rem", color: "#8A8A96", flexShrink: 0 }}>{note.date}</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#4A4A5A", lineHeight: 1.6, margin: 0 }}>{note.body}</p>
          </div>
        ))}
        {/* AI summary */}
        <div style={{ background: "#EDE9FE", borderRadius: 10, padding: "12px 16px", marginTop: 14 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#5B4EC4", marginBottom: 6 }}>✨ Résumé</div>
          <p style={{ fontSize: "0.82rem", color: "#4A4A5A", lineHeight: 1.6, margin: 0 }}>
            APLV confirmée (prick+), éviction PLV en cours, bonne tolérance hydrolysat, croissance rassurante. Prochaine étape : IgE spécifiques + consultation de contrôle M3.
          </p>
        </div>
      </BrowserFrame>
      <p style={{ marginTop: 20, fontSize: "0.88rem", color: "#4A4A5A", lineHeight: 1.7, maxWidth: 640 }}>
        Chaque spécialiste ouvre le dossier et voit immédiatement ce que les autres ont fait. Le résumé se génère automatiquement — le soignant valide avant diffusion.
      </p>
    </div>
  );
}

function TabCarnet() {
  const ENTRIES = [
    { icon: "🍼", label: "Biberon · 110 ml", time: "8h12" },
    { icon: "😴", label: "Sieste · 1h45", time: "9h30" },
    { icon: "👶", label: "Couche · Selles jaune d'or", time: "11h05" },
  ];
  const FEATURES = [
    ["📈", "Courbes de croissance OMS intégrées"],
    ["💉", "Calendrier vaccinal 2025 avec rappels"],
    ["📋", "19 examens obligatoires digitalisés"],
    ["🍼", "Suivi alimentation, sommeil, selles"],
    ["📄", "Documents et ordonnances partagés"],
    ["👥", "Équipe soignante visible par le parent"],
  ];
  return (
    <div>
      <style>{`
        @media (max-width: 700px) {
          .carnet-layout { grid-template-columns: 1fr !important; }
          .carnet-phone  { margin: 0 auto !important; }
        }
      `}</style>
      <div className="carnet-layout" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 48, alignItems: "start" }}>
        {/* Phone */}
        <div className="carnet-phone" style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: "#1A1A2E", borderRadius: 28, padding: 8, boxShadow: "0 20px 60px rgba(26,26,46,0.20)" }}>
            <div style={{ background: "#FAFAF8", borderRadius: 22, overflow: "hidden", padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: "0.65rem", color: "#8A8A96" }}>
                <span>9:41</span><span>nami</span>
              </div>
              <div style={{ textAlign: "center", fontSize: 40, marginBottom: 6 }}>🐣</div>
              <div style={{ textAlign: "center", fontWeight: 700, fontSize: "0.82rem", color: "#1A1A2E", marginBottom: 14 }}>Léa a 2 mois et 3 jours</div>
              {ENTRIES.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "7px 10px", marginBottom: 6, border: "1px solid #F0EEF8" }}>
                  <span style={{ fontSize: 14 }}>{e.icon}</span>
                  <span style={{ fontSize: "0.72rem", color: "#1A1A2E", flex: 1 }}>{e.label}</span>
                  <span style={{ fontSize: "0.65rem", color: "#8A8A96" }}>{e.time}</span>
                </div>
              ))}
              <div style={{ background: "#EDE9FE", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#5B4EC4" }}>Prochain RDV</div>
                <div style={{ fontSize: "0.72rem", color: "#1A1A2E" }}>Dr Marchand · Mardi 15h</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 8, borderTop: "1px solid #F0EEF8" }}>
                {["☀️", "📓", "👶", "📚", "⚙️"].map((icon, i) => (
                  <div key={i} style={{ fontSize: i === 0 ? 16 : 13, opacity: i === 0 ? 1 : 0.45 }}>{icon}</div>
                ))}
              </div>
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#8A8A96", marginTop: 10 }}>App parent · Saisie en 10 secondes</p>
        </div>
        {/* Description */}
        <div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1A1A2E", margin: "0 0 14px" }}>Le carnet de santé, digital et partagé</h3>
          <p style={{ fontSize: "0.88rem", color: "#4A4A5A", lineHeight: 1.7, marginBottom: 20 }}>
            Dès la naissance, l'enfant a son carnet de santé sur l'app Nami — relié aux soignants de l'Américain quand il est rattaché à un parcours de soins.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FEATURES.map(([icon, text], i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.875rem", color: "#4A4A5A" }}>
                <span style={{ flexShrink: 0 }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 20, fontSize: "0.9rem", fontWeight: 700, color: "#2BA89C" }}>
            → Les soignants ont déjà de la matière pour travailler avant même la consultation.
          </p>
        </div>
      </div>
    </div>
  );
}

function TabAdressage() {
  type Step = { icon: string; title: string; sub: string };
  const FLOW: (Step | null)[] = [
    { icon: "👨‍⚕️", title: "Dr Petit", sub: "Pédiatre, Neuilly" },
    null,
    { icon: "📋", title: "Adressage", sub: "Lettre générée depuis le dossier" },
    null,
    { icon: "🏥", title: "Allergo-péd", sub: "Hôpital Américain" },
    null,
    { icon: "✓", title: "Retour", sub: "CR visible en temps réel" },
  ];
  return (
    <div>
      <BrowserFrame>
        <div style={{ display: "flex", alignItems: "stretch", overflowX: "auto", paddingBottom: 8 }}>
          {FLOW.map((step, i) => {
            if (step === null) return (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "0 8px", color: "#8A8A96", fontSize: 18, flexShrink: 0 }}>→</div>
            );
            return (
              <div key={i} style={{ background: "#FAFAF8", border: "1px solid rgba(26,26,46,0.06)", borderRadius: 12, padding: "16px 14px", textAlign: "center", minWidth: 120, flexShrink: 0 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#1A1A2E", marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: "0.72rem", color: "#8A8A96", lineHeight: 1.4 }}>{step.sub}</div>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: 16, fontSize: "0.82rem", color: "#4A4A5A", lineHeight: 1.6, margin: "16px 0 0" }}>
          Un médecin de ville adresse en 30 secondes. Il garde la visibilité sur son patient. Il reçoit le compte-rendu. Il adressera plus facilement la prochaine fois.
        </p>
      </BrowserFrame>
      <p style={{ marginTop: 20, fontSize: "0.88rem", color: "#4A4A5A", lineHeight: 1.7, maxWidth: 640 }}>
        Le réseau ne se décrète pas — il se construit quand les médecins de ville ont un canal simple pour adresser et un retour structuré. Nami crée ce canal.
      </p>
    </div>
  );
}

function TabIA() {
  type Step = { icon: string; title: string; sub: string };
  const FLOW: (Step | null)[] = [
    { icon: "🎙️", title: "Enregistrement", sub: "Le soignant parle pendant la consultation" },
    null,
    { icon: "📝", title: "Note structurée", sub: "Compte-rendu rédigé automatiquement" },
    null,
    { icon: "📤", title: "Documents générés", sub: "Ordonnance, lettre d'adressage, PAI" },
    null,
    { icon: "✅", title: "Tâches créées", sub: "RDV, rappels, questionnaires" },
  ];
  return (
    <div>
      <BrowserFrame>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#5B4EC4", marginBottom: 6 }}>APRÈS LA CONSULTATION</div>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1A2E" }}>Le soignant a parlé. Nami a structuré.</div>
        </div>
        <div style={{ display: "flex", alignItems: "stretch", overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
          {FLOW.map((step, i) => {
            if (step === null) return (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "0 8px", color: "#8A8A96", fontSize: 18, flexShrink: 0 }}>→</div>
            );
            return (
              <div key={i} style={{ background: "#FAFAF8", border: "1px solid rgba(26,26,46,0.06)", borderRadius: 12, padding: "16px 14px", textAlign: "center", minWidth: 120, flexShrink: 0 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#1A1A2E", marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: "0.72rem", color: "#8A8A96", lineHeight: 1.4 }}>{step.sub}</div>
              </div>
            );
          })}
        </div>
        <div style={{ background: "#EDE9FE", borderRadius: 10, padding: "12px 16px" }}>
          <p style={{ fontSize: "0.82rem", color: "#5B4EC4", fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
            Tout est un brouillon. Le soignant valide chaque élément avant diffusion. Rien ne part sans son accord.
          </p>
        </div>
      </BrowserFrame>
      <p style={{ marginTop: 20, fontSize: "0.88rem", color: "#4A4A5A", lineHeight: 1.7, maxWidth: 640 }}>
        Plus de paperasse post-consultation. Plus d'ordonnances oubliées. Plus de lettres d'adressage à rédiger à la main. Le soignant parle, Nami structure — le soignant vérifie et valide.
      </p>
    </div>
  );
}

const TABS = ["Dossier partagé", "Carnet de santé", "Adressage réseau", "IA consultation"];

function ProduitSection() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <section id="produit" style={{ background: "#FAFAF8", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <style>{`
        @keyframes fadeTabUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>LE PRODUIT</Eyebrow>
          <SectionTitle>Concrètement, voilà ce que ça fait</SectionTitle>
        </ScrollReveal>

        {/* Tab buttons */}
        <div style={{ display: "flex", gap: 8, marginTop: 32, marginBottom: 36, flexWrap: "wrap" }}>
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "9px 18px",
                borderRadius: 100,
                border: activeTab === i ? "none" : "1px solid rgba(26,26,46,0.12)",
                background: activeTab === i ? "#5B4EC4" : "#fff",
                color: activeTab === i ? "#fff" : "#4A4A5A",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div key={activeTab} style={{ animation: "fadeTabUp 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
          {activeTab === 0 && <TabDossier />}
          {activeTab === 1 && <TabCarnet />}
          {activeTab === 2 && <TabAdressage />}
          {activeTab === 3 && <TabIA />}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 4 — DISCOURS UNIFIÉ ─────────────────────────────────────────────

const DISCOURS_CARDS = [
  { icon: "📚", iconBg: "#EDE9FE", title: "60 000 fiches sourcées", text: "HAS, ESPGHAN, OMS — chaque recommandation est traçable. Un soignant s'appuie sur la même base que ses collègues." },
  { icon: "🔄", iconBg: "#CCFBF1", title: "Un message unifié", text: "Le pédiatre, la diététicienne et la puéricultrice donnent les mêmes consignes — pas des versions contradictoires qui inquiètent les parents." },
  { icon: "📖", iconBg: "#FEF9C3", title: "Fiches accessibles aux parents", text: "Les parents consultent les mêmes informations que les soignants, en langage clair. Même source, même message." },
];

function DiscoursSection() {
  return (
    <section style={{ background: "#F5F3EF", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>DISCOURS UNIFIÉ</Eyebrow>
          <SectionTitle>Toute l&apos;équipe tient le même discours</SectionTitle>
          <p style={{ fontSize: "1rem", color: "#4A4A5A", lineHeight: 1.7, marginTop: 12, marginBottom: 48, maxWidth: 600 }}>
            La mère sort de l&apos;hôpital. Elle doit savoir si c&apos;est bien d&apos;allaiter, combien de temps, comment. Chaque soignant doit dire la même chose — pas 5 versions contradictoires.
          </p>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {DISCOURS_CARDS.map((card, i) => (
            <ScrollReveal key={i} variant="fade-up" delay={i * 0.1} duration={0.7}>
              <HoverCard {...card} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 5 — CHIFFRES ─────────────────────────────────────────────────────

const STATS = [
  { target: 297, suffix: "", label: "Fonctionnalités en production" },
  { target: 6, suffix: "", label: "Parcours pédiatriques structurés par âge" },
  { target: 60, suffix: "k+", label: "Fiches cliniques sourcées" },
  { target: 19, suffix: "", label: "Examens pédiatriques digitalisés" },
];

function ChiffresSection() {
  return (
    <section style={{ background: "#1A1A2E", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
          {STATS.map((s, i) => (
            <ScrollReveal key={i} variant="fade-up" delay={i * 0.1} duration={0.7} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 800,
                background: "linear-gradient(135deg, #5B4EC4, #2BA89C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.1,
                marginBottom: 10,
              } as CSSProperties}>
                <AnimatedCounter target={s.target} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{s.label}</div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 6 — PARCOURS & PROTOCOLES ───────────────────────────────────────

const PARCOURS_CARDS = [
  { icon: "🗺️", iconBg: "#EDE9FE", title: "Parcours structurés par pathologie", text: "Allergie alimentaire, trouble oralité, suivi post-néonat, obésité pédiatrique — chaque parcours a ses phases, ses jalons, ses spécialistes référents. Pas d'improvisation." },
  { icon: "📐", iconBg: "#CCFBF1", title: "Protocoles sourcés et traçables", text: "Chaque protocole s'appuie sur les recommandations officielles (HAS, ESPGHAN, OMS). Les décisions sont documentées, les orientations tracées." },
  { icon: "👁️", iconBg: "#FEF9C3", title: "Visibilité pour toute l'équipe", text: "Chaque soignant sait où en est le patient dans son parcours, quelles étapes ont été faites, lesquelles restent à compléter. Plus de zones grises." },
];

function ParcoursSection() {
  return (
    <section style={{ background: "#FAFAF8", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>PARCOURS & PROTOCOLES</Eyebrow>
          <SectionTitle>Chaque projet a son parcours. Chaque parcours a son cadre.</SectionTitle>
          <p style={{ fontSize: "1rem", color: "#4A4A5A", lineHeight: 1.7, marginTop: 12, marginBottom: 48, maxWidth: 680 }}>
            Chacun dans l&apos;équipe a des idées — de nouveaux protocoles, des parcours à structurer, des projets à lancer. Nami donne un cadre à chaque initiative : un parcours clair, des étapes définies, des rôles attribués, et une visibilité pour que tout le monde s&apos;y retrouve.
          </p>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {PARCOURS_CARDS.map((card, i) => (
            <ScrollReveal key={i} variant="fade-up" delay={i * 0.1} duration={0.7}>
              <HoverCard {...card} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 7 — CE QUE NAMI FAIT AU QUOTIDIEN ───────────────────────────────

// Composant de flow réutilisable (étapes + flèches)
type FlowStep = { icon: string; title: string; sub: string };

function StepFlow({ steps }: { steps: (FlowStep | null)[] }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", overflowX: "auto", paddingBottom: 4, gap: 0 }}>
      {steps.map((step, i) => {
        if (step === null) return (
          <div key={i} style={{ display: "flex", alignItems: "center", padding: "0 10px", color: "#8A8A96", fontSize: 18, flexShrink: 0 }}>→</div>
        );
        return (
          <div key={i} style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.07)", borderRadius: 12, padding: "16px 14px", textAlign: "center", minWidth: 130, flexShrink: 0 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#1A1A2E", marginBottom: 4 }}>{step.title}</div>
            <div style={{ fontSize: "0.72rem", color: "#8A8A96", lineHeight: 1.4 }}>{step.sub}</div>
          </div>
        );
      })}
    </div>
  );
}

// 7a — En consultation
function Section7a() {
  const STEPS: (FlowStep | null)[] = [
    { icon: "🎙️", title: "Vous parlez", sub: "Consultation normale, micro activé" },
    null,
    { icon: "📝", title: "Note structurée", sub: "Compte-rendu rédigé automatiquement" },
    null,
    { icon: "📤", title: "Documents", sub: "Ordonnance, lettre d'adressage, PAI" },
    null,
    { icon: "✅", title: "Tâches", sub: "RDV, rappels, questionnaires assignés" },
  ];
  return (
    <section style={{ background: "#F5F3EF", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>EN CONSULTATION</Eyebrow>
          <SectionTitle>Vous parlez. Le reste est fait.</SectionTitle>
          <p style={{ fontSize: "1rem", color: "#4A4A5A", lineHeight: 1.7, marginTop: 12, marginBottom: 36, maxWidth: 580 }}>
            Vous enregistrez votre consultation. À la fin, vos documents sont prêts — il ne reste qu&apos;à vérifier et valider.
          </p>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={0.1} duration={0.7}>
          <StepFlow steps={STEPS} />
          <div style={{ marginTop: 20, background: "#EDE9FE", borderRadius: 12, padding: "14px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "0.88rem", color: "#5B4EC4", fontWeight: 600, margin: 0 }}>
              Tout est un brouillon. Rien ne part sans votre validation.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// 7b — Carnet de santé & parcours
const CARNET_FEATURES = [
  { icon: "📈", title: "Courbes de croissance OMS", text: "Poids, taille, PC, IMC — mises à jour à chaque pesée." },
  { icon: "💉", title: "Calendrier vaccinal 2025", text: "Généré automatiquement, rappels programmés." },
  { icon: "📋", title: "19 examens obligatoires", text: "De J8 à 16 ans. Statut : fait, programmé, en retard." },
  { icon: "📄", title: "Documents partagés", text: "Ordonnances, CR, courriers — visibles par parents et équipe." },
  { icon: "🔗", title: "Parcours de soins greffables", text: "Un soignant active un module (allergie, nutrition, TND, gastro…) → l'équipe s'élargit, les saisies s'adaptent, le parcours est structuré." },
  { icon: "👥", title: "Équipe visible", text: "Le parent voit qui suit son enfant. Messagerie intégrée." },
];

function Section7b() {
  const MINI_CARDS = [
    { icon: "📈", label: "Courbes de croissance", value: "OMS · P50" },
    { icon: "💉", label: "Prochain vaccin", value: "Hexavalent · M2" },
    { icon: "📋", label: "Prochain examen", value: "M2 · dans 3 jours" },
    { icon: "🍼", label: "Alimentation 7j", value: "780 ml/jour moy." },
    { icon: "👥", label: "Équipe", value: "3 soignants" },
  ];
  return (
    <section style={{ background: "#FAFAF8", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <style>{`
        @media (max-width: 700px) {
          .s7b-layout { grid-template-columns: 1fr !important; }
          .s7b-phone  { margin: 0 auto !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>CARNET DE SANTÉ & PARCOURS</Eyebrow>
          <SectionTitle>Un carnet digital dès la naissance. Des parcours de soins qui se greffent dessus.</SectionTitle>
        </ScrollReveal>
        <div className="s7b-layout" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 48, alignItems: "start", marginTop: 40 }}>
          {/* Phone mockup */}
          <div className="s7b-phone" style={{ flexShrink: 0 }}>
            <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.08)", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(26,26,46,0.07)" }}>
              <div style={{ textAlign: "center", fontSize: 36, marginBottom: 6 }}>🐣</div>
              <div style={{ textAlign: "center", fontWeight: 700, fontSize: "0.9rem", color: "#1A1A2E", marginBottom: 14 }}>Léa · 2 mois</div>
              {MINI_CARDS.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, background: "#FAFAF8", border: "1px solid #F0EEF8", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.78rem", color: "#4A4A5A" }}>{c.icon} {c.label}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#5B4EC4" }}>{c.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 10, borderTop: "1px solid #F0EEF8", marginTop: 8 }}>
                {["☀️", "📓", "👶", "📚", "⚙️"].map((icon, i) => (
                  <div key={i} style={{ fontSize: i === 0 ? 16 : 13, opacity: i === 0 ? 1 : 0.45 }}>{icon}</div>
                ))}
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#8A8A96", marginTop: 10 }}>App parent · Toutes tranches d&apos;âge</p>
          </div>
          {/* Features */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1A1A2E", margin: "0 0 20px" }}>Le carnet de santé de chaque enfant, relié à son équipe</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {CARNET_FEATURES.map((f, i) => (
                <ScrollReveal key={i} variant="fade-up" delay={i * 0.07} duration={0.6}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1A1A2E", marginBottom: 2 }}>{f.title}</div>
                      <div style={{ fontSize: "0.82rem", color: "#4A4A5A", lineHeight: 1.6 }}>{f.text}</div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 7c — Entre les consultations (2 sous-tabs)
function Section7c() {
  const [activeSubTab, setActiveSubTab] = useState(0);

  const ADULTE_LEFT = [
    { icon: "📸", title: "Repas avec photo", text: "Photo, faim/satiété, contexte. Ce qu'il mange vraiment." },
    { icon: "⚖️", title: "Poids", text: "Courbe mise à jour entre les consultations." },
    { icon: "🩺", title: "Symptômes", text: "Type, intensité, durée, déclencheur — horodatés." },
    { icon: "😔", title: "Émotions", text: "Humeur, énergie, triggers. Patterns visibles." },
    { icon: "🏃", title: "Activité physique", text: "Type, durée, intensité, plaisir, douleurs." },
    { icon: "📋", title: "Questionnaires", text: "PHQ-9, GAD-7, EAT-26, EDE-Q, SCOFF — score automatique." },
  ];

  const COCKPIT_CARDS = [
    { icon: "🍽️", label: "Repas tracés", value: "14 repas · 2 crises" },
    { icon: "📊", label: "PHQ-9", value: "12 → 9 ↓3" },
    { icon: "⚖️", label: "Poids 7j", value: "78.2 → 77.5 kg" },
    { icon: "😴", label: "Sommeil", value: "6h42 · 3/5" },
    { icon: "🏃", label: "Activité", value: "3 séances · 2h15" },
  ];

  const PED_LEFT = [
    { icon: "🍼", title: "Alimentation", text: "Biberon (volume, heure), tétée (durée, sein), diversification (aliment, réaction). Apports réels sur 14 jours." },
    { icon: "😴", title: "Sommeil", text: "'Il dort mal' → '6 fragments de 45 min' ou '8h avec 2 réveils'." },
    { icon: "👶", title: "Couches", text: "Couleur, consistance. Journal objectif pour suspicion APLV ou RGO." },
    { icon: "⚖️", title: "Pesées maison", text: "Arrivent en 'à valider'. 6 points sur la courbe au lieu de 2." },
    { icon: "🌡️", title: "Événements", text: "Fièvre, régurgitations, réactions — notés quand ça se passe." },
    { icon: "🏅", title: "Jalons", text: "Premier sourire, tenue de tête, premiers mots. Avec la date." },
  ];

  const PED_RIGHT = [
    { date: "📅 J15", text: "780 ml/jour, selles jaunes, 14h sommeil en 6 siestes, 2 régurgitations à J+8 et J+12. Questions ciblées en 2 min au lieu de 15." },
    { date: "📅 M1", text: "Courbe avec 6 points, pas 2. Reprise régulière ou plateau — vous le voyez." },
    { date: "📅 M4", text: "Jalons acquis documentés avec dates. Vous vérifiez les manquants directement." },
  ];

  return (
    <section style={{ background: "#F5F3EF", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <style>{`
        @media (max-width: 700px) {
          .s7c-layout { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeSubTab {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>ENTRE LES CONSULTATIONS</Eyebrow>
          <SectionTitle>Votre patient vous parle en continu</SectionTitle>
          <p style={{ fontSize: "1rem", color: "#4A4A5A", lineHeight: 1.7, marginTop: 12, marginBottom: 28, maxWidth: 580 }}>
            L&apos;app s&apos;adapte au parcours : nourrisson, enfant, ado, adulte. Chaque pathologie active les saisies pertinentes.
          </p>
        </ScrollReveal>

        {/* Sub-tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 36, flexWrap: "wrap" }}>
          {["Adultes & adolescents", "Nourrissons & enfants"].map((label, i) => (
            <button key={i} onClick={() => setActiveSubTab(i)}
              style={{ padding: "8px 18px", borderRadius: 100, border: activeSubTab === i ? "none" : "1px solid rgba(26,26,46,0.12)", background: activeSubTab === i ? "#5B4EC4" : "#fff", color: activeSubTab === i ? "#fff" : "#4A4A5A", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Adultes */}
        {activeSubTab === 0 && (
          <div key="adulte" className="s7c-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, animation: "fadeSubTab 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1A1A2E", margin: "0 0 16px" }}>Ce que le patient fait</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ADULTE_LEFT.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "0.84rem", color: "#1A1A2E" }}>{item.title}</span>
                      <span style={{ fontSize: "0.82rem", color: "#4A4A5A" }}> — {item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1A1A2E", margin: "0 0 16px" }}>Ce que vous recevez</h3>
              <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.07)", borderRadius: 14, padding: "16px 18px", boxShadow: "0 4px 16px rgba(26,26,46,0.06)" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1A1A2E", marginBottom: 12 }}>Semaine de Thomas Dupont</div>
                {COCKPIT_CARDS.map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 8, background: "#FAFAF8", border: "1px solid #F0EEF8", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.78rem", color: "#4A4A5A" }}>{c.icon} {c.label}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1A1A2E" }}>{c.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, background: "#EDE9FE", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5B4EC4", marginBottom: 4 }}>Parcours pluridisciplinaires</div>
                  <p style={{ fontSize: "0.78rem", color: "#4A4A5A", lineHeight: 1.6, margin: 0 }}>Le psy voit les émotions. La diét voit les repas. Le médecin voit les bilans. L'APA voit l'activité. Chacun dans le même dossier — le patient ne fait plus le lien entre vous.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pédiatrie */}
        {activeSubTab === 1 && (
          <div key="ped" className="s7c-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, animation: "fadeSubTab 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1A1A2E", margin: "0 0 6px" }}>Ce que le parent fait</h3>
              <p style={{ fontSize: "0.82rem", color: "#8A8A96", marginBottom: 16 }}>Il observe 24h/24 ce que vous ne pouvez pas observer en consultation.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PED_LEFT.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#CCFBF1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "0.84rem", color: "#1A1A2E" }}>{item.title}</span>
                      <span style={{ fontSize: "0.82rem", color: "#4A4A5A" }}> — {item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1A1A2E", margin: "0 0 16px" }}>Ce que ça change en consultation</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PED_RIGHT.map((item, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#5B4EC4", marginBottom: 6 }}>{item.date}</div>
                    <p style={{ fontSize: "0.82rem", color: "#4A4A5A", lineHeight: 1.6, margin: 0 }}>{item.text}</p>
                  </div>
                ))}
                <div style={{ background: "#CCFBF1", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2BA89C", marginBottom: 4 }}>Pour les parents</div>
                  <p style={{ fontSize: "0.82rem", color: "#4A4A5A", lineHeight: 1.6, margin: 0 }}>Tracer rassure. Voir les tendances rassure. Savoir que vous voyez les données réduit les appels anxieux.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// 7d — Documents & bilans
const DOCS_CARDS = [
  { icon: "🧪", iconBg: "#EDE9FE", title: "Bilan biologique", text: "PDF déposé → hémoglobine, HbA1c, ferritine extraits avec la date. Vous validez." },
  { icon: "📊", iconBg: "#CCFBF1", title: "Impédancemétrie", text: "48 métriques extraites. Conversion automatique des unités." },
  { icon: "📷", iconBg: "#FEF9C3", title: "Ordonnance scannée", text: "Photo → médicaments, doses, fréquences structurés." },
  { icon: "📈", iconBg: "#EDE9FE", title: "Carnet de santé", text: "Scan → points placés sur les courbes OMS avec la date." },
];

function Section7d() {
  return (
    <section style={{ background: "#FAFAF8", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>DOCUMENTS & BILANS</Eyebrow>
          <SectionTitle>Zéro saisie manuelle</SectionTitle>
          <p style={{ fontSize: "1rem", color: "#4A4A5A", lineHeight: 1.7, marginTop: 12, marginBottom: 48, maxWidth: 560 }}>
            Les bilans sont extraits. Les ordonnances sont scannées. Tout arrive en attente de validation.
          </p>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {DOCS_CARDS.map((card, i) => (
            <ScrollReveal key={i} variant="fade-up" delay={i * 0.1} duration={0.7}>
              <HoverCard {...card} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// 7e — Synthèse & coordination
const SYNTH_CARDS = [
  { icon: "✨", iconBg: "#EDE9FE", title: "Résumé en 1 clic", text: "Dossier croisé avec les recommandations HAS/ESPGHAN/SFP. Ce qui a évolué, ce qui manque. 2 min au lieu de 40 pages." },
  { icon: "📨", iconBg: "#CCFBF1", title: "Adressage en 2 min", text: "Spécialité, motif, urgence. Le confrère rejoint l'équipe avec accès au dossier." },
  { icon: "📋", iconBg: "#FEF9C3", title: "Questionnaires", text: "Envoyés depuis le dossier, remplis sur téléphone, score automatique comparé au précédent." },
  { icon: "🔍", iconBg: "#EDE9FE", title: "Complétude", text: "RDV planifié ? Note récente ? Équipe complète ? Tâches en retard ? Adressage sans réponse ?" },
];

function Section7e() {
  return (
    <section style={{ background: "#F5F3EF", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>SYNTHÈSE & COORDINATION</Eyebrow>
          <SectionTitle>Vous ouvrez le dossier. Tout est déjà là.</SectionTitle>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 40 }}>
          {SYNTH_CARDS.map((card, i) => (
            <ScrollReveal key={i} variant="fade-up" delay={i * 0.1} duration={0.7}>
              <HoverCard {...card} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// 7f — Avant / après
const AVANT_APRES = [
  { avant: "Retranscription post-consultation · 15-20 min", apres: "Généré automatiquement · 0 min" },
  { avant: "Saisie manuelle bilan bio · 5-10 min", apres: "Extraction en 30 secondes" },
  { avant: "Synthèse avant consultation · 10-15 min", apres: "Résumé structuré en 2 minutes" },
  { avant: "Courrier d'adressage dicté", apres: "Adressage structuré en 2 minutes" },
  { avant: "Questionnaire papier → saisie → calcul", apres: "Envoyé sur téléphone, résultat auto" },
  { avant: "Dossier fragmenté entre 4 soignants", apres: "Un dossier de coordination partagé" },
  { avant: "Données patient de mémoire", apres: "Journal horodaté en temps réel" },
];

function Section7f() {
  return (
    <section style={{ background: "#1A1A2E", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", fontWeight: 700, color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.2, margin: "0 0 36px", textAlign: "center" }}>
            Ce que vous gagnez
          </h2>
        </ScrollReveal>
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ background: "rgba(220,38,38,0.12)", padding: "10px 20px", fontSize: "0.75rem", fontWeight: 700, color: "#FCA5A5", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              AVANT
            </div>
            <div style={{ background: "rgba(5,150,105,0.12)", padding: "10px 20px", fontSize: "0.75rem", fontWeight: 700, color: "#6EE7B7", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
              AVEC NAMI
            </div>
          </div>
          {AVANT_APRES.map((row, i) => (
            <ScrollReveal key={i} variant="fade-up" delay={i * 0.06} duration={0.6}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
                <div style={{ padding: "14px 20px", fontSize: "0.84rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5, background: "rgba(220,38,38,0.05)" }}>
                  {row.avant}
                </div>
                <div style={{ padding: "14px 20px", fontSize: "0.84rem", color: "#6EE7B7", lineHeight: 1.5, fontWeight: 500, background: "rgba(5,150,105,0.05)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                  ✓ {row.apres}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// 7g — Ce que Nami ne fait pas
function Section7g() {
  return (
    <section style={{ background: "#FAFAF8", padding: "64px clamp(20px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <Eyebrow>CE QUE NAMI NE FAIT PAS</Eyebrow>
          <SectionTitle>Intentionnellement</SectionTitle>
          <p style={{ fontSize: "1rem", color: "#4A4A5A", lineHeight: 1.8, marginTop: 20, maxWidth: 560, margin: "20px auto 0" }}>
            Nami ne pose pas de diagnostic, ne décide pas d&apos;un traitement, ne déclenche pas d&apos;alerte clinique. Tout ce qui est extrait arrive en statut &quot;à valider&quot;. Vous restez le seul décideur clinique.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── SECTION 8 — CTA ─────────────────────────────────────────────────────────

function CTASection() {
  const [hovered, setHovered] = useState(false);
  return (
    <section style={{ background: "#F5F3EF", padding: "80px clamp(20px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <ScrollReveal variant="fade-up" duration={0.7}>
          <div style={{
            background: "#fff",
            border: "1px solid rgba(26,26,46,0.06)",
            borderRadius: 20,
            padding: "52px 40px",
            boxShadow: "0 8px 32px rgba(26,26,46,0.06)",
          }}>
            <Eyebrow>PROCHAINE ÉTAPE</Eyebrow>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.025em", margin: "0 0 16px", lineHeight: 1.2 }}>
              Voir Nami en action
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#4A4A5A", lineHeight: 1.7, marginBottom: 32 }}>
              Nami est opérationnel. Je vous propose une démo de 30 minutes pour voir concrètement comment ça s&apos;intègre au projet de la clinique.
            </p>
            <a
              href="mailto:contact@margot-dieteticienne.fr?subject=Nami%20—%20Clinique%20pédiatrique%20Américain&body=Bonjour%20Margot%2C%0A%0AJe%20souhaite%20voir%20une%20démo%20de%20Nami%20pour%20la%20clinique%20pédiatrique.%0A%0A"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: hovered ? "#4c44b0" : "#5B4EC4",
                color: "#fff",
                borderRadius: 100,
                padding: "14px 32px",
                fontSize: "0.9rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "background 0.2s, transform 0.2s",
                transform: hovered ? "translateY(-1px)" : "none",
              }}
            >
              Planifier une démo →
            </a>
            <p style={{ marginTop: 20, fontSize: "0.75rem", color: "#8A8A96" }}>
              Margot Vire · Diététicienne · Hôpital Américain de Paris
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─── SECTION 9 — FOOTER ──────────────────────────────────────────────────────

const DISCLAIMER_LINES = [
  "Nami est une plateforme de coordination des parcours de soins (Art. L.1110-12 CSP).",
  "Ce n'est pas un dispositif médical au sens du règlement MDR 2017/745.",
  "Les synthèses structurées sont des brouillons soumis à validation humaine obligatoire.",
  "Données hébergées en Union Européenne · Conforme RGPD",
];

function FooterSection() {
  return (
    <footer style={{ background: "#FAFAF8", borderTop: "1px solid rgba(26,26,46,0.06)", padding: "40px clamp(20px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontWeight: 800, color: "#5B4EC4", fontSize: "1rem", marginBottom: 16 }}>
          Nami — namipourlavie.com
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {DISCLAIMER_LINES.map((line, i) => (
            <p key={i} style={{ fontSize: "0.72rem", color: "#8A8A96", margin: 0, lineHeight: 1.6 }}>{line}</p>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function CliniquePedPage() {
  return (
    <div style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>
      <PublicNavbar />
      <HeroSection />
      <ApportSection />
      <ProduitSection />
      <DiscoursSection />
      <ChiffresSection />
      <ParcoursSection />
      <Section7a />
      <Section7b />
      <Section7c />
      <Section7d />
      <Section7e />
      <Section7f />
      <Section7g />
      <CTASection />
      <FooterSection />
    </div>
  );
}
