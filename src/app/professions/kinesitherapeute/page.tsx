"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#5B4EC4", teal: "#2BA89C", bg: "#FAFAF8", bgAlt: "#F5F3EF",
  dark: "#1A1A2E", text: "#1A1A2E", textSec: "#4A4A5A", textMut: "#8A8A96",
  border: "rgba(26,26,46,0.06)", grad: "linear-gradient(135deg,#5B4EC4,#2BA89C)",
};
const f = "'Plus Jakarta Sans',sans-serif";
const fi = "'Inter',sans-serif";

function useVis(t = 0.08): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: t });
    obs.observe(el);
    return () => obs.disconnect();
  }, [t]);
  return [ref, vis];
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, vis] = useVis();
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)", transition: `opacity .6s cubic-bezier(.16,1,.3,1) ${delay}s, transform .6s cubic-bezier(.16,1,.3,1) ${delay}s` }}>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, letterSpacing: ".03em", background: `${C.primary}12`, color: C.primary, fontFamily: fi }}>{children}</span>;
}

function Card({ icon, title, desc, delay = 0 }: { icon: string; title: string; desc: string; delay?: number }) {
  const [hov, setHov] = useState(false);
  return (
    <Fade delay={delay}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
        background: "#fff", borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.border}`,
        transition: "all .3s cubic-bezier(.16,1,.3,1)", transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? "0 16px 32px rgba(91,78,196,.08)" : "0 2px 8px rgba(26,26,46,.03)", height: "100%",
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>{icon}</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: f, lineHeight: 1.3 }}>{title}</h3>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: C.textSec, margin: 0, fontFamily: fi }}>{desc}</p>
      </div>
    </Fade>
  );
}

function Tier({ name, price, sub, features, highlighted = false, cta, delay = 0 }: {
  name: string; price: string; sub: string; features: string[]; highlighted?: boolean; cta: string; delay?: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <Fade delay={delay}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
        background: highlighted ? C.dark : "#fff", borderRadius: 20, padding: "32px 24px 28px",
        border: highlighted ? "none" : `1px solid ${C.border}`,
        transition: "all .3s cubic-bezier(.16,1,.3,1)", transform: hov ? "translateY(-4px)" : "none",
        boxShadow: highlighted ? "0 20px 40px rgba(91,78,196,.15)" : hov ? "0 12px 28px rgba(26,26,46,.06)" : "0 2px 8px rgba(26,26,46,.03)",
        position: "relative", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column",
      }}>
        {highlighted && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.grad }} />}
        {highlighted && <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", background: `${C.teal}20`, color: C.teal, marginBottom: 14, alignSelf: "flex-start", fontFamily: fi }}>Recommandé</span>}
        <h4 style={{ fontSize: 15, fontWeight: 700, color: highlighted ? "#fff" : C.text, marginBottom: 6, fontFamily: f }}>{name}</h4>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: highlighted ? "#fff" : C.text, fontFamily: f, letterSpacing: "-.03em" }}>{price}</span>
          {price !== "0€" && <span style={{ fontSize: 14, color: highlighted ? "rgba(255,255,255,.5)" : C.textMut, marginLeft: 4, fontFamily: fi }}>/mois</span>}
        </div>
        <p style={{ fontSize: 12, color: highlighted ? "rgba(255,255,255,.55)" : C.textMut, marginBottom: 20, lineHeight: 1.4, fontFamily: fi }}>{sub}</p>
        <div style={{ flex: 1 }}>
          {features.map((feat, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, fontSize: 13, color: highlighted ? "rgba(255,255,255,.8)" : C.textSec, lineHeight: 1.45, fontFamily: fi }}>
              <span style={{ color: C.teal, flexShrink: 0, marginTop: 2, fontSize: 12 }}>✓</span><span>{feat}</span>
            </div>
          ))}
        </div>
        <button style={{ width: "100%", padding: 12, borderRadius: 10, border: highlighted ? "none" : `1.5px solid ${C.primary}`, background: highlighted ? C.grad : "transparent", color: highlighted ? "#fff" : C.primary, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 20, fontFamily: f }}>{cta}</button>
      </div>
    </Fade>
  );
}

function FaqItem({ q, a, delay = 0 }: { q: string; a: string; delay?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Fade delay={delay}>
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 0" }}>
        <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, gap: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: f, lineHeight: 1.4 }}>{q}</span>
          <span style={{ fontSize: 18, color: C.textMut, flexShrink: 0, transition: "transform .3s ease", transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
        </button>
        <div style={{ maxHeight: open ? 400 : 0, overflow: "hidden", transition: "max-height .4s cubic-bezier(.16,1,.3,1)" }}>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: C.textSec, paddingTop: 10, fontFamily: fi, margin: 0 }}>{a}</p>
        </div>
      </div>
    </Fade>
  );
}

function TimeCalc() {
  const tasks = [
    { id: "cr", label: "Bilans initiaux, comptes-rendus au médecin prescripteur", d: 40 },
    { id: "coord", label: "Appeler le chirurgien, l'orthopédiste, le MG pour le contexte", d: 30 },
    { id: "prog", label: "Adapter les programmes de rééducation, noter la progression", d: 35 },
    { id: "ordonnances", label: "Renouvellements d'ordonnances, démarches administratives", d: 25 },
    { id: "msg", label: "Messages patients (douleurs, questions sur les exercices)", d: 20 },
    { id: "fact", label: "Facturation AMK, cotations, télétransmission", d: 25 },
    { id: "annul", label: "Annulations, reports, gestion du planning", d: 20 },
    { id: "form", label: "Se former, nouvelles techniques, congrès", d: 15 },
  ];
  const [vals, setVals] = useState<Record<string, number>>(() => {
    const v: Record<string, number> = {};
    tasks.forEach(t => { v[t.id] = t.d; });
    return v;
  });
  const tot = Object.values(vals).reduce((a, b) => a + b, 0);
  const daily = Math.round(tot / 5);
  const weekH = (tot / 60).toFixed(1);
  const yearH = Math.round(tot / 60 * 52);

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "28px 20px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.primary, marginBottom: 20, fontFamily: fi }}>Votre temps invisible par semaine</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tasks.map(t => (
          <div key={t.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: C.text, fontFamily: fi, lineHeight: 1.35, flex: 1, paddingRight: 12 }}>{t.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.primary, fontFamily: fi, minWidth: 45, textAlign: "right" }}>{vals[t.id]} min</span>
            </div>
            <input type="range" min={0} max={120} step={5} value={vals[t.id]}
              onChange={e => setVals(v => ({ ...v, [t.id]: parseInt(e.target.value) }))}
              style={{ width: "100%", height: 4, borderRadius: 2, outline: "none", cursor: "pointer", accentColor: C.primary }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, padding: "18px", borderRadius: 14, background: C.dark, color: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          {([[`${daily}min`, "par jour"], [`${weekH}h`, "par semaine"], [`${yearH}h`, "par an"]] as [string, string][]).map(([v, l], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: f }}>{v}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", fontFamily: fi }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(255,255,255,.06)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", margin: 0, fontFamily: fi, lineHeight: 1.6 }}>
            <span style={{ color: "#fff", fontWeight: 700 }}>{daily} min/jour</span> hors séances, non rémunéré.
            {" "}Nami en automatise une part, pour <span style={{ color: C.teal, fontWeight: 700 }}>79€/mois</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function KinesitherapeutePage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${C.primary}22; color: ${C.primary}; }
      `}</style>


      <section style={{ paddingTop: 40, paddingBottom: 24, paddingLeft: 24, paddingRight: 24, textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
        <Fade><Badge>Pour les kinésithérapeutes</Badge></Fade>
        <Fade delay={0.08}>
          <h1 style={{ fontSize: "clamp(2rem,5.5vw,3.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.06, letterSpacing: "-.035em", marginTop: 20, marginBottom: 16, fontFamily: f }}>
            Vous voyez la progression.<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Le chirurgien doit le savoir.
            </span>
          </h1>
        </Fade>
        <Fade delay={0.14}>
          <p style={{ fontSize: "clamp(.95rem,2vw,1.1rem)", lineHeight: 1.65, color: C.textSec, maxWidth: 580, margin: "0 auto 20px", fontFamily: fi }}>
            Post-opératoire, AVC, lombalgie chronique, réhab cardiaque, vous êtes celui qui voit le patient 3 à 5 fois par semaine. Le chirurgien, le neurologue, le cardiologue n&apos;ont qu&apos;un bilan trimestriel. Nami leur transmet ce que vous observez, sans décrocher le téléphone.
          </p>
        </Fade>
        <Fade delay={0.18}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            {["Post-opératoire ortho", "Rééducation AVC", "Réhab cardiaque", "Lombalgie chronique", "Neurologie", "Respiratoire"].map(p => (
              <span key={p} style={{ padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, background: "#fff", border: `1px solid ${C.border}`, color: C.textSec, fontFamily: fi }}>{p}</span>
            ))}
          </div>
        </Fade>
        <Fade delay={0.22}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "14px 28px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: f, boxShadow: "0 4px 16px rgba(91,78,196,.2)" }}>Commencer gratuitement</button>
          </div>
        </Fade>
      </section>

      <section style={{ background: C.dark, padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-.03em", fontFamily: f }}>
                J+45 post-ligamentoplastie.<br />
                <span style={{ color: C.teal }}>Le chirurgien a le bilan avant de vous rappeler.</span>
              </h2>
            </div>
          </Fade>
          <Fade delay={0.15}>
            <div style={{ background: "#fff", borderRadius: 18, padding: "24px 20px", border: `1px solid ${C.border}`, maxWidth: 520, margin: "0 auto" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.primary, marginBottom: 8, fontFamily: fi }}>
                Théo, 24 ans — Ligamentoplastie LCA J+45
              </div>
              {[
                { label: "Séance du 8 mai", note: "Flexion 95°. Extension complète acquise. Appui monopodal stable. Quadriceps : 72% côté sain. Proprioception en progression.", color: C.teal },
                { label: "Séance du 5 mai", note: "Épanchement résiduel léger. Massage cicatriciel débuté. Vélo ergomètre 15min toléré sans douleur.", color: "#3498db" },
                { label: "Objectif à 3 mois", note: "Reprise course à pied. Seuil actuel : 65% force musculaire côté sain. Protocole de renforcement progressif en cours.", color: C.primary },
              ].map((e, i) => (
                <div key={i} style={{ padding: "12px 14px", borderRadius: 10, borderLeft: `3px solid ${e.color}`, background: C.bgAlt, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: e.color, marginBottom: 4, fontFamily: fi }}>{e.label}</div>
                  <p style={{ fontSize: 13, color: C.text, margin: 0, fontFamily: fi, lineHeight: 1.5 }}>{e.note}</p>
                </div>
              ))}
              <div style={{ padding: "10px 14px", borderRadius: 8, background: `${C.primary}06`, border: `1px solid ${C.primary}12`, marginTop: 4 }}>
                <p style={{ fontSize: 12, color: C.primary, margin: 0, fontFamily: fi, fontWeight: 600 }}>
                  Le chirurgien voit la progression en temps réel. Il adapte son suivi sans vous appeler.
                </p>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      <section style={{ padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Badge>Ce qui change</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Votre expertise est précieuse. L&apos;équipe doit l&apos;avoir.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {[
              { b: "Vous rééduquez un patient post-AVC pendant 3 mois. Le neurologue ne sait pas où en est la motricité avant la consultation.", a: "Vous documentez la progression (équilibre, marche, force) dans Nami. Le neurologue voit le bilan avant chaque RDV. Pas de consultation à l'aveugle." },
              { b: "Le patient doit reprendre la course. Mais il a mal. Vous l'avez signalé au chirurgien par téléphone. Il n'a pas eu votre message.", a: "Vous documentez dans Nami. Le chirurgien voit votre observation immédiatement. La décision est prise sans délai." },
              { b: "Vous recevez un patient post-opératoire. Vous n'avez pas le compte-rendu. Quelles précautions ? Quel protocole ?", a: "Le chirurgien partage le CR dans Nami. Vous arrivez à la séance avec le contexte : type d'intervention, contraintes, objectifs." },
              { b: "Le patient fait de la rééducation chez vous ET voit un ergothérapeute. Vous ne savez pas ce que l'ergothérapeute travaille.", a: "L'ergothérapeute documente ses séances dans Nami. Vous voyez ses objectifs fonctionnels. Vous coordonnez sans appel." },
            ].map((item, i) => (
              <Fade key={i} delay={i * 0.08}>
                <div style={{ background: "#fff", borderRadius: 14, padding: "22px 20px", border: `1px solid ${C.border}`, height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                    <span style={{ color: "#e74c3c", fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✗</span>
                    <p style={{ fontSize: 13, color: C.textMut, margin: 0, fontFamily: fi, lineHeight: 1.5, textDecoration: "line-through", textDecorationColor: "rgba(231,76,60,.3)" }}>{item.b}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: C.teal, fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <p style={{ fontSize: 13, color: C.text, margin: 0, fontFamily: fi, lineHeight: 1.5, fontWeight: 500 }}>{item.a}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "32px 24px 36px", background: C.bgAlt }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <Badge>Le temps invisible</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Bilans, courriers, appels, ordonnances à renouveler...
              </h2>
              <p style={{ fontSize: 14, color: C.textSec, marginTop: 6, fontFamily: fi }}>Ce n&apos;est pas compris dans le prix de la séance AMK.</p>
            </div>
          </Fade>
          <Fade delay={0.1}><TimeCalc /></Fade>
        </div>
      </section>

      <section style={{ padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <Badge>Vos outils</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>
                Rééduquez. Transmettez. Coordonnez.
              </h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            <Card icon="📈" title="Traçage de la progression" desc="Amplitude, force, endurance, douleur, objectifs fonctionnels : documentés séance par séance. Le chirurgien ou le médecin voient l'évolution avant chaque consultation." delay={0} />
            <Card icon="🏥" title="Lien chirurgien/prescripteur" desc="Compte-rendu opératoire accessible avant la première séance. Vos bilans remontent au chirurgien. La coordination ville-hôpital est fluidifiée." delay={0.06} />
            <Card icon="🤝" title="Coordination pluridisciplinaire" desc="L'ergothérapeute, le neuropsychologue, l'APA travaillent sur le même patient ? Vous voyez leurs objectifs. Ils voient vos bilans. Pas de doublon." delay={0.12} />
            <Card icon="📋" title="Adressages entrants structurés" desc="Quand un chirurgien vous adresse un patient, vous recevez le CR, les précautions, le protocole post-op. Vous démarrez informé." delay={0.18} />
            <Card icon="💶" title="Facturation AMK simplifiée" desc="Cotations AMK, bilans initiaux, ALD, télétransmission Sesam-Vitale. Généré automatiquement à chaque séance." delay={0.24} />
            <Card icon="✅" title="Complétude du parcours" desc="Renouvellement d'ordonnance dû ? Bilan de fin de rééducation à envoyer ? L'indicateur vous le rappelle." delay={0.3} />
          </div>
        </div>
      </section>

      <section style={{ background: C.bgAlt, padding: "24px 24px 28px", textAlign: "center" }}>
        <Fade>
          <p style={{ fontSize: "clamp(1rem,2.2vw,1.25rem)", fontStyle: "italic", color: C.text, maxWidth: 560, margin: "0 auto", lineHeight: 1.55, fontFamily: "'Playfair Display',serif" }}>
            &ldquo;Le kinésithérapeute voit le patient 4 fois par semaine. Ce qu&apos;il observe est ce que le chirurgien ne voit jamais. Nami fait passer l&apos;information.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: C.textMut, marginTop: 12, fontFamily: fi }}>Margot Vire, Diététicienne, fondatrice de Nami</p>
        </Fade>
      </section>

      <section style={{ padding: "32px 24px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <Badge>Tarifs</Badge>
              <h2 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: "-.03em", marginTop: 12, fontFamily: f }}>Commencez gratuitement.</h2>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, alignItems: "stretch" }}>
            <Tier name="Gratuit" price="0€" sub="Agenda, messagerie, annuaire" features={["Agenda + prise de RDV", "Messagerie patients & médecins", "Annuaire soignants", "Fiche patient basique"]} cta="Commencer" delay={0} />
            <Tier name="Coordination" price="79€" sub="Traçage progression + équipe" features={["Tout Gratuit inclus", "Traçage de la progression séance/séance", "Lien chirurgien/prescripteur", "Adressages entrants", "App patient", "Essai 14 jours gratuit"]} cta="Essai gratuit" delay={0.12} />
            <Tier name="Intelligence" price="149€" sub="IA + protocoles + analyse" features={["Tout Coordination", "Enregistrement bilan IA", "Protocoles rééducation HAS", "60 000+ sources cliniques"]} cta="Découvrir" highlighted delay={0.18} />
            <Tier name="Pilotage" price="299€" sub="Le cockpit financier" features={["Tout Intelligence", "CA + charges temps réel", "Pré-déclarations fiscales", "Export comptable"]} cta="Découvrir" delay={0.18} />
          </div>
        </div>
      </section>

      <section style={{ padding: "28px 24px 32px", background: C.bgAlt }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Fade><h2 style={{ fontSize: "clamp(1.3rem,2.5vw,1.6rem)", fontWeight: 800, color: C.text, marginBottom: 24, fontFamily: f, textAlign: "center" }}>Questions fréquentes</h2></Fade>
          <FaqItem q="Comment envoyer mes bilans au chirurgien prescripteur ?" a="Vous rédigez votre bilan dans Nami, vous choisissez de le partager avec le chirurgien (ou le médecin prescripteur). Il le reçoit immédiatement dans son dossier. Plus de courrier postal, plus de fax, plus de délai." />
          <FaqItem q="Les autres kinés du cabinet peuvent-ils partager les dossiers ?" a="Oui. Les kinés d'un même cabinet peuvent partager les dossiers patients. Si votre collègue remplace pendant vos congés, il reprend les dossiers avec le contexte complet : progression, protocole, objectifs." delay={0.05} />
          <FaqItem q="Et pour les patients en HAD ?" a="Nami fonctionne pour la kinésithérapie à domicile et en HAD. La coordination avec le médecin coordinateur et l'équipe HAD est centralisée dans le même dossier." delay={0.1} />
          <FaqItem q="La facturation AMK est-elle adaptée aux bilans initiaux ?" a="Oui. AMK 7 (bilan initial), AMK par séance, majoration DEP (déplacement), tiers payant, ALD. Tout est géré dans Nami. La cotation est suggérée selon l'acte documenté." delay={0.15} />
        </div>
      </section>

      <section style={{ padding: "32px 24px 40px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.4rem)", fontWeight: 800, color: C.text, lineHeight: 1.08, letterSpacing: "-.035em", marginBottom: 12, fontFamily: f }}>
            Vous voyez la progression.<br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>L&apos;équipe doit le savoir.</span>
          </h2>
        </Fade>
        <Fade delay={0.1}>
          <button style={{ padding: "16px 36px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: f, boxShadow: "0 6px 24px rgba(91,78,196,.25)", marginTop: 8 }}>Commencer gratuitement</button>
        </Fade>
      </section>

      <footer style={{ padding: "20px 24px", textAlign: "center", borderTop: "1px solid rgba(26,26,46,0.06)", background: "#FAFAF8" }}>
        <p style={{ fontSize: 11, color: "#8A8A96", fontFamily: "'Inter',sans-serif" }}>
          Outil de coordination · Non dispositif médical · Conforme RGPD · © 2026 Nami
        </p>
      </footer>

    </div>
  );
}
