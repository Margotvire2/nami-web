"use client"

import { useState, useEffect, useCallback } from "react"
import { HAPNav } from "../HAPNav"

const C = {
  nami: "#5B4EC4", namiH: "#4c44b0", teal: "#2BA89C",
  bg: "#FAFAF8", bgAlt: "#F5F3EF", dark: "#1A1A2E",
  t1: "#1A1A2E", t2: "#4A4A5A", tm: "#8A8A96",
  bl: "rgba(26,26,46,0.06)",
}
const G: React.CSSProperties = {
  background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
}

function Slide({ bg = C.bg, dark = false, children }: { bg?: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      width: "100%", height: "100svh", background: bg,
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "clamp(24px,5vh,60px) clamp(16px,6vw,80px)",
      paddingTop: "calc(clamp(24px,5vh,60px) + 60px)",
      position: "relative", overflow: "hidden",
      color: dark ? "#fff" : C.t1, boxSizing: "border-box",
    }}>
      {children}
    </div>
  )
}

function Eye({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: light ? "rgba(255,255,255,0.35)" : C.nami, marginBottom: 12 }}>
      {children}
    </div>
  )
}

function Glow({ x = "30%", y = "40%", size = 500, color = C.nami, opacity = 0.15 }: { x?: string; y?: string; size?: number; color?: string; opacity?: number }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%",
      background: `radial-gradient(circle, ${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")} 0%, transparent 60%)`,
      transform: "translate(-50%,-50%)", pointerEvents: "none",
    }} />
  )
}

function S1() {
  return (
    <Slide bg={C.dark} dark>
      <Glow x="55%" y="35%" size={600} opacity={0.12} />
      <Glow x="72%" y="65%" size={400} color="#2BA89C" opacity={0.08} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: C.nami, letterSpacing: "-0.03em", marginBottom: 32 }}>nami</div>
        <h1 style={{ fontSize: "clamp(36px,5.5vw,60px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 20 }}>
          La coordination<br />que vos équipes<br /><span style={G}>méritent</span>
        </h1>
        <p style={{ fontSize: "clamp(14px,1.5vw,17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 480 }}>
          Plateforme de coordination des parcours de soins pluridisciplinaires
        </p>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 32, fontFamily: "var(--font-inter), Inter, sans-serif" }}>
          Outil de coordination · Non dispositif médical · Conforme RGPD
        </p>
      </div>
    </Slide>
  )
}

function S2() {
  return (
    <Slide bg={C.bgAlt}>
      <Eye>Le constat</Eye>
      <h2 style={{ fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, marginBottom: 8 }}>
        Cinq professionnels autour d&apos;un même enfant.
      </h2>
      <h2 style={{ fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, marginBottom: 20, ...G }}>
        Aucun ne sait ce que l&apos;autre a fait.
      </h2>
      <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.6, maxWidth: 520, marginBottom: 28 }}>
        En pédiatrie, chaque parcours complexe implique 4 à 8 professionnels. La coordination repose sur le téléphone, le mail, et les parents.
      </p>
      <div style={{ display: "flex", gap: 16 }}>
        {[
          { n: "6+", l: "Professionnels", s: "par parcours" },
          { n: "5+", l: "Outils ouverts", s: "par jour" },
          { n: "40%", l: "Temps soignant", s: "en coordination" },
        ].map((st, i) => (
          <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 12, border: `1px solid ${C.bl}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "20px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", fontFamily: "var(--font-inter), Inter, sans-serif", color: C.nami, lineHeight: 1 }}>{st.n}</div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{st.l}</div>
            <div style={{ fontSize: 10, color: C.tm, marginTop: 2 }}>{st.s}</div>
          </div>
        ))}
      </div>
    </Slide>
  )
}

function S3() {
  return (
    <Slide bg={C.bg}>
      <Eye>L&apos;observation</Eye>
      <p style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "clamp(28px,3.5vw,38px)", fontStyle: "italic", lineHeight: 1.3, letterSpacing: "-0.01em", maxWidth: 650, margin: "16px 0" }}>
        « Ce n&apos;était pas un manque de compétence. C&apos;était un défaut d&apos;orchestration. »
      </p>
      <div style={{ marginTop: 28 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.t2 }}>— Margot Vire, diététicienne-nutritionniste, fondatrice de Nami</p>
        <p style={{ fontSize: 11, color: C.tm, marginTop: 4, fontFamily: "var(--font-inter), Inter, sans-serif" }}>Master 2 Recherche en Santé publique — AP-HP / Université Paris-Saclay</p>
      </div>
    </Slide>
  )
}

function S4() {
  return (
    <Slide bg={C.bgAlt}>
      <Eye>Parcours type</Eye>
      <h2 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 24 }}>Léa, 3 ans — trouble alimentaire pédiatrique</h2>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Aujourd&apos;hui — chacun dans son silo</div>
          {[
            { pro: "🩺 Pédiatre", action: "Détecte une cassure de courbe de poids", problem: "Adresse au gastropédiatre. Aucun retour ensuite." },
            { pro: "🔬 Gastropédiatre", action: "Teste les intolérances (APLV, etc.), suspecte un trouble alimentaire", problem: "Envoie vers la diét et l'ortho — mais ne sait pas ce qu'ils font." },
            { pro: "🥗 Diététicienne", action: "Travaille la reprise pondérale, ajuste les apports", problem: "Ne sait pas que l'ortho travaille la sensorialité en parallèle." },
            { pro: "🗣 Orthophoniste", action: "Travaille la sensorialité et la motricité orale", problem: "Ne sait pas où en est la reprise pondérale côté diét." },
          ].map((s, i) => (
            <div key={i} style={{ padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(220,38,38,0.1)" : "none" }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{s.pro}</div>
              <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.4 }}>{s.action}</div>
              <div style={{ fontSize: 11, color: "#DC2626", fontWeight: 600, marginTop: 2 }}>→ {s.problem}</div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Avec Nami — un parcours, une équipe</div>
          <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.bl}`, padding: 16, boxShadow: "0 2px 8px rgba(26,26,46,0.04)" }}>
            {[
              { icon: "👁", text: "Chaque pro voit ce que les autres font — en temps réel" },
              { icon: "📋", text: "Le parcours est structuré : qui fait quoi, quand, dans quel ordre" },
              { icon: "🔔", text: "La diét adapte ses apports en fonction de ce que l'ortho observe sur la sensorialité" },
              { icon: "📊", text: "Le pédiatre suit la courbe de poids et voit la progression de chaque intervenant" },
              { icon: "💬", text: "Les échanges sont dans le dossier — pas dans 4 boîtes mail séparées" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: i < 4 ? `1px solid ${C.bl}` : "none" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: C.t1, lineHeight: 1.45 }}>{item.text}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10, color: C.tm, marginTop: 10, fontStyle: "italic", fontFamily: "var(--font-inter), Inter, sans-serif" }}>
            4 professionnels. 1 parcours. Chacun sait ce que l&apos;autre fait.
          </p>
        </div>
      </div>
    </Slide>
  )
}

function S5() {
  const features = [
    { icon: "🎙", title: "Scribe ambiant", desc: "Enregistrement consultation → note structurée en 10 types + brouillons d'ordonnance" },
    { icon: "📋", title: "Parcours guidé", desc: "Étapes sourcées HAS/ESPGHAN, complétude en temps réel, prochaines actions" },
    { icon: "💬", title: "Coordination", desc: "Messagerie dans le dossier, adressage structuré, visibilité partagée" },
  ]
  return (
    <Slide bg={C.bg}>
      <Eye>Nami</Eye>
      <h2 style={{ fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>Un seul espace. Toute l&apos;équipe.</h2>
      <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.6, marginBottom: 28, maxWidth: 480 }}>
        Chaque professionnel renseigne depuis son téléphone. Toute l&apos;équipe a la même visibilité.
      </p>
      <div style={{ display: "flex", gap: 16 }}>
        {features.map((f, i) => (
          <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 12, border: `1px solid ${C.bl}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "22px 20px" }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </Slide>
  )
}

function S6() {
  const steps = [
    "Appuyer sur « Enregistrer »", "Consulter normalement", "Arrêter l'enregistrement",
    "L'IA structure la note en 10 types", "Brouillons d'ordonnance générés", "Valider, corriger, signer — 30s",
  ]
  const outputs = ["Motif", "Anamnèse", "Examen clinique", "Décisions", "Ordonnance 🔖"]
  return (
    <Slide bg={C.bgAlt}>
      <Eye>Consultation</Eye>
      <h2 style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 24 }}>Le médecin consulte. Nami écoute.</h2>
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ flex: 1 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 13, color: i === 3 || i === 4 ? C.nami : C.t1, fontWeight: i === 3 || i === 4 ? 700 : 400 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: i === 3 || i === 4 ? C.nami : "#fff", color: i === 3 || i === 4 ? "#fff" : C.tm, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, border: `1px solid ${C.bl}` }}>{i + 1}</span>
              {s}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: "#fff", borderRadius: 12, border: `1px solid ${C.bl}`, boxShadow: "0 4px 16px rgba(26,26,46,0.06)", padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.nami, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Structuration automatique</div>
          {outputs.map((o, i) => (
            <div key={i} style={{ background: C.bgAlt, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.t2, marginBottom: 6 }}>{o}</div>
          ))}
          <p style={{ fontSize: 9, color: C.tm, marginTop: 10, fontStyle: "italic", fontFamily: "var(--font-inter), Inter, sans-serif" }}>Brouillon IA — à vérifier par le praticien</p>
        </div>
      </div>
    </Slide>
  )
}

function S7() {
  const results = [
    { t: "Borréliose de Lyme — antibiothérapie recommandée", s: "HAS Fiche pratique 2025", sc: "0.97" },
    { t: "Prophylaxie post-piqûre de tique chez l'enfant", s: "SPILF / GPIP 2024 §3.2", sc: "0.93" },
    { t: "Doxycycline chez l'enfant < 8 ans — risque dentaire", s: "AAP Red Book 2024, IDSA 2020", sc: "0.89" },
  ]
  return (
    <Slide bg={C.bg}>
      <Eye>Base documentaire</Eye>
      <h2 style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Un doute clinique ?</h2>
      <h2 style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8, ...G }}>60 000+ sources. 2 secondes.</h2>
      <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.6, marginBottom: 24, maxWidth: 520 }}>
        HAS · DSM-5 · ESPGHAN · EAACI · NICE · FFAB · SPILF · GPIP · Orphanet · BDPM
      </p>
      <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.bl}`, boxShadow: "0 4px 16px rgba(26,26,46,0.06)", padding: 20, maxWidth: 700 }}>
        <div style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.bl}`, marginBottom: 14, fontSize: 12, color: C.t2 }}>🔍  morsure de tique enfant 8 ans prophylaxie doxycycline</div>
        {results.map((r, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.bl}` : "none", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{r.t}</div>
              <div style={{ fontSize: 10, color: C.nami, marginTop: 2, fontFamily: "var(--font-inter), Inter, sans-serif" }}>{r.s}</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, fontFamily: "var(--font-inter), Inter, sans-serif", flexShrink: 0 }}>{r.sc}</div>
          </div>
        ))}
        <p style={{ fontSize: 10, color: C.tm, marginTop: 12, fontFamily: "var(--font-inter), Inter, sans-serif", fontStyle: "italic" }}>
          Au lieu de débattre 45 min sur WhatsApp — la source HAS, en 2 secondes, dans le dossier.
        </p>
      </div>
    </Slide>
  )
}

function S8() {
  return (
    <Slide bg={C.dark} dark>
      <Glow x="50%" y="45%" size={600} opacity={0.12} />
      <Glow x="80%" y="60%" size={350} color="#2BA89C" opacity={0.06} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Eye light>Ville ↔ Hôpital</Eye>
        <h2 style={{ fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>Nami pousse les murs<br />de l&apos;hôpital</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 32, maxWidth: 520, lineHeight: 1.6 }}>
          Votre DPI gère l&apos;intrahospitalier. Mais quand le patient est en ville, l&apos;information ne suit pas. Nami fait le lien — sans toucher à vos systèmes.
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1, borderRadius: 12, padding: "20px 18px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Aujourd&apos;hui</div>
            {[
              { icon: "🏥", text: "L'hôpital a son DPI", sub: "Orbis, GmAHP, Crossway…" },
              { icon: "🩺", text: "Le libéral a… rien", sub: "WhatsApp, mail, téléphone" },
              { icon: "🚫", text: "Quand le patient sort", sub: "Son dossier reste sur place. Pas lui." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{item.text}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, borderRadius: 12, padding: "20px 18px", border: "1.5px solid rgba(91,78,196,0.35)", background: "rgba(91,78,196,0.06)", position: "relative" }}>
            <div style={{ position: "absolute", top: -10, right: 16, background: C.nami, color: "#fff", padding: "3px 12px", borderRadius: 6, fontSize: 9, fontWeight: 800, fontFamily: "var(--font-inter), Inter, sans-serif", letterSpacing: "0.05em" }}>NAMI</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Avec Nami</div>
            {[
              { icon: "🔗", text: "Le parcours suit le patient", sub: "À travers tous ses soignants, ville et hôpital" },
              { icon: "📥", text: "Le libéral adresse vers l'hôpital", sub: "Adressage structuré → nouveaux patients qualifiés" },
              { icon: "📊", text: "L'hôpital garde la visibilité", sub: "Suivi post-sortie, coordination ambulatoire, données" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 2 ? "1px solid rgba(91,78,196,0.12)" : "none" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{item.text}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 20, fontStyle: "italic", textAlign: "center" }}>
          Nami ne remplace pas votre DPI. Il étend votre rayonnement au-delà de vos murs.
        </p>
      </div>
    </Slide>
  )
}

function S9() {
  return (
    <Slide bg={C.bg}>
      <Eye>Nouveau modèle</Eye>
      <h2 style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Vos services de niche<br />deviennent <span style={G}>rentables</span></h2>
      <p style={{ fontSize: 14, color: C.t2, marginBottom: 28, maxWidth: 540, lineHeight: 1.6 }}>
        Un service spécialisé n&apos;est rentable qu&apos;avec du volume. Ce volume vient des libéraux et des autres structures de la région — s&apos;ils savent que vous existez et s&apos;ils peuvent coordonner le suivi.
      </p>
      <div style={{ display: "flex", gap: 16 }}>
        {[
          { icon: "🏥→🩺", title: "Adressage entrant", desc: "Les pédiatres de ville, les services hospitaliers identifient un besoin spécialisé. Nami structure l'adressage vers votre service — avec le dossier complet." },
          { icon: "🔄", title: "Suivi partagé", desc: "Le patient est suivi en ville ET à l'hôpital. L'équipe hospitalière garde la visibilité sans que le patient vienne physiquement." },
          { icon: "📈", title: "Volume qualifié", desc: "Votre service devient la référence régionale. Les libéraux adressent spontanément car la coordination fonctionne." },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 12, border: `1px solid ${C.bl}`, padding: "20px 18px" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: C.tm, marginTop: 20, fontStyle: "italic", fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        Le patient n&apos;était pas le vôtre. Grâce à la coordination, il le devient — et il reste suivi après la sortie.
      </p>
    </Slide>
  )
}

function S10() {
  const items = [
    { icon: "🇪🇺", title: "Données en Europe", desc: "Hébergé en UE. Trajectoire HDS." },
    { icon: "🔒", title: "Chiffrement", desc: "Au repos et en transit." },
    { icon: "👤", title: "19 rôles cliniques", desc: "Chacun ne voit que ce qu'il doit." },
    { icon: "🏥", title: "Non dispositif médical", desc: "Coordination, pas diagnostic." },
  ]
  return (
    <Slide bg={C.bgAlt}>
      <Eye>Confiance &amp; conformité</Eye>
      <h2 style={{ fontSize: "clamp(26px,3vw,36px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 36 }}>Construit pour le secret médical,<br />pas adapté après coup.</h2>
      <div style={{ display: "flex", gap: 20 }}>
        {items.map((t, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: C.tm, lineHeight: 1.5 }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </Slide>
  )
}

function S11() {
  const points = [
    "Diététicienne-nutritionniste — Hôpital Américain de Paris & exercice libéral",
    "Recherche AP-HP : impact de la télésurveillance sur les parcours ville-hôpital",
    "Recherche Paul-Brousse / FFAB : conséquences somatiques de l'anorexie précoce",
    "DU TCA enfants & adolescents · Nutrition & obésité pédiatrique",
    "ESSEC Business School · HSBC Investment Banking · Startups seed & scale",
    "A construit l'intégralité de la plateforme — 94 modèles de données, 3 repos",
  ]
  return (
    <Slide bg={C.bg}>
      <Eye>Fondatrice</Eye>
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: `linear-gradient(135deg, ${C.nami}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 800, flexShrink: 0 }}>MV</div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 2 }}>Margot Vire</h2>
          <p style={{ fontSize: 14, color: C.nami, fontWeight: 600, marginBottom: 16 }}>Diététicienne-nutritionniste · Fondatrice de Nami</p>
          {points.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: C.t2, lineHeight: 1.5, padding: "3px 0" }}>
              <span style={{ color: C.teal, fontWeight: 700, flexShrink: 0 }}>✓</span>{p}
            </div>
          ))}
          <div style={{ height: 1, background: C.bl, margin: "16px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "Incubée par Wilco — incubateur santé, Paris",
              "Accompagnée par Le Catalyseur Santé",
              "Accompagnée par Medicen — pôle de compétitivité santé Île-de-France",
              "Soutenue par la Ville de Suresnes",
            ].map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: C.t2, lineHeight: 1.5 }}>
                <span style={{ color: C.nami, fontWeight: 700, flexShrink: 0 }}>✓</span>{p}
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontStyle: "italic", fontSize: 13, color: C.tm, marginTop: 16, maxWidth: 460 }}>
            « Le founder-market fit le plus dur à répliquer : une clinicienne qui code, qui soigne, et qui utilise son propre produit. »
          </p>
        </div>
      </div>
    </Slide>
  )
}

function S12() {
  return (
    <Slide bg={C.dark} dark>
      <Glow x="50%" y="45%" size={600} opacity={0.13} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2 style={{ fontSize: "clamp(32px,4.5vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>Prêts à coordonner<br />autrement ?</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginBottom: 32, lineHeight: 1.6 }}>Un pilote. Votre équipe. Vos patients.<br />Deux mois pour voir la différence.</p>
        <a href="mailto:margot@namipourlavie.com" style={{ background: "#fff", color: C.nami, padding: "12px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, boxShadow: "0 8px 40px rgba(91,78,196,0.12)", textDecoration: "none" }}>Planifier une démo →</a>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 20 }}>margot@namipourlavie.com</p>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", marginTop: 28, fontFamily: "var(--font-inter), Inter, sans-serif", lineHeight: 1.6 }}>
          Nami · Coordination des parcours de soins<br />Conforme RGPD · Non dispositif médical · Données hébergées en UE
        </p>
      </div>
    </Slide>
  )
}

const SLIDES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12]

export function PitchDeckHAPClient() {
  const [current, setCurrent] = useState(0)
  const [animDir, setAnimDir] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  const go = useCallback((dir: number) => {
    const next = current + dir
    if (next < 0 || next >= SLIDES.length) return
    setAnimDir(dir)
    setAnimKey((k) => k + 1)
    setCurrent(next)
  }, [current])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(1) }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [go])

  const SC = SLIDES[current]

  return (
    <div style={{ width: "100%", height: "100svh", overflow: "hidden", position: "relative", fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes nps-${animKey} {
          from { opacity: 0; transform: translateX(${animDir > 0 ? "30" : "-30"}px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .nps-anim-${animKey} { animation: nps-${animKey} 0.3s cubic-bezier(0.16,1,0.3,1); }
        .nps-nav-btn { min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; }
        .nps-dot-wrap { padding: 8px 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
      `}</style>

      <HAPNav />

      <div className={`nps-anim-${animKey}`} style={{ width: "100%", height: "100%" }}>
        <SC />
      </div>

      {/* Navigation dots + arrows */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "8px 0 max(16px, env(safe-area-inset-bottom))", background: "linear-gradient(transparent, rgba(0,0,0,0.15))", zIndex: 50 }}>
        <button
          onClick={() => go(-1)} disabled={current === 0} className="nps-nav-btn"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "none", color: current === 0 ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 16, cursor: current === 0 ? "default" : "pointer", borderRadius: 8 }}
        >←</button>
        <div style={{ display: "flex", gap: 0 }}>
          {SLIDES.map((_, i) => (
            <div key={i} className="nps-dot-wrap"
              onClick={() => { setAnimDir(i > current ? 1 : -1); setAnimKey((k) => k + 1); setCurrent(i) }}
            >
              <div style={{ width: i === current ? 20 : 7, height: 7, borderRadius: 4, background: i === current ? C.nami : i < current ? "rgba(91,78,196,0.5)" : "rgba(255,255,255,0.25)", transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
          ))}
        </div>
        <button
          onClick={() => go(1)} disabled={current === SLIDES.length - 1} className="nps-nav-btn"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "none", color: current === SLIDES.length - 1 ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 16, cursor: current === SLIDES.length - 1 ? "default" : "pointer", borderRadius: 8 }}
        >→</button>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter), Inter, sans-serif" }}>{current + 1}/{SLIDES.length}</span>
      </div>
    </div>
  )
}
