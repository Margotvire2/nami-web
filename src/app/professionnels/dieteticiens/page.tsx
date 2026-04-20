"use client";

import { useState, useEffect, useRef } from "react";

const C = {
  primary: "#5B4EC4",
  primaryHover: "#4c44b0",
  teal: "#2BA89C",
  bg: "#FAFAF8",
  bgAlt: "#F5F3EF",
  dark: "#1A1A2E",
  text: "#1A1A2E",
  textSec: "#4A4A5A",
  textMut: "#8A8A96",
  border: "rgba(26,26,46,0.06)",
  grad: "linear-gradient(135deg, #5B4EC4, #2BA89C)",
};

function useInView(t = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const r = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = r.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: t });
    o.observe(el);
    return () => o.disconnect();
  }, [t]);
  return [r, v];
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [r, v] = useInView();
  return (
    <div ref={r} className={className} style={{
      opacity: v ? 1 : 0,
      transform: v ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>{children}</div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block", padding: "6px 16px", borderRadius: 100,
      fontSize: 13, fontWeight: 600, letterSpacing: "0.03em",
      background: `${C.primary}12`, color: C.primary,
      fontFamily: "'Inter', sans-serif",
    }}>{children}</span>
  );
}

function FeatureCard({ icon, title, desc, tag, delay = 0 }: { icon: string; title: string; desc: string; tag?: string; delay?: number }) {
  const [h, setH] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
        background: "#fff", borderRadius: 16, padding: "32px 28px",
        border: `1px solid ${C.border}`,
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        transform: h ? "translateY(-4px)" : "translateY(0)",
        boxShadow: h ? "0 20px 40px rgba(91,78,196,0.08)" : "0 2px 8px rgba(26,26,46,0.03)",
        height: "100%", position: "relative", overflow: "hidden",
      }}>
        {tag && (
          <span style={{
            position: "absolute", top: 16, right: 16,
            padding: "3px 10px", borderRadius: 100, fontSize: 11,
            fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
            background: `${C.teal}15`, color: C.teal,
            fontFamily: "'Inter', sans-serif",
          }}>{tag}</span>
        )}
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: C.grad,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, marginBottom: 20,
        }}>{icon}</div>
        <h3 style={{
          fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 10,
          fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.3,
        }}>{title}</h3>
        <p style={{
          fontSize: 15, lineHeight: 1.65, color: C.textSec, margin: 0,
          fontFamily: "'Inter', sans-serif",
        }}>{desc}</p>
      </div>
    </FadeIn>
  );
}

function Pricing({ name, price, sub, features, highlighted, cta, delay = 0 }: {
  name: string; price: string; sub: string; features: string[];
  highlighted?: boolean; cta: string; delay?: number;
}) {
  const [h, setH] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
        background: highlighted ? C.dark : "#fff", borderRadius: 20,
        padding: "36px 28px 32px",
        border: highlighted ? "none" : `1px solid ${C.border}`,
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        transform: h ? "translateY(-4px)" : "translateY(0)",
        boxShadow: highlighted ? "0 24px 48px rgba(91,78,196,0.15)" : h ? "0 16px 32px rgba(26,26,46,0.06)" : "0 2px 8px rgba(26,26,46,0.03)",
        position: "relative", overflow: "hidden", height: "100%",
        display: "flex", flexDirection: "column",
      }}>
        {highlighted && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.grad }} />}
        {highlighted && (
          <span style={{
            display: "inline-block", padding: "4px 12px", borderRadius: 100,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
            background: `${C.teal}20`, color: C.teal, marginBottom: 16,
            alignSelf: "flex-start", fontFamily: "'Inter', sans-serif",
          }}>Recommandé</span>
        )}
        <h4 style={{ fontSize: 16, fontWeight: 700, color: highlighted ? "#fff" : C.text, marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{name}</h4>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: highlighted ? "#fff" : C.text, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.03em" }}>{price}</span>
          {price !== "0€" && <span style={{ fontSize: 15, color: highlighted ? "rgba(255,255,255,0.5)" : C.textMut, marginLeft: 4, fontFamily: "'Inter', sans-serif" }}>/mois</span>}
        </div>
        <p style={{ fontSize: 13, color: highlighted ? "rgba(255,255,255,0.6)" : C.textMut, marginBottom: 24, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>{sub}</p>
        <div style={{ flex: 1 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, fontSize: 14, color: highlighted ? "rgba(255,255,255,0.85)" : C.textSec, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
              <span style={{ color: C.teal, flexShrink: 0, marginTop: 2 }}>✓</span><span>{f}</span>
            </div>
          ))}
        </div>
        <button style={{
          width: "100%", padding: 14, borderRadius: 10,
          border: highlighted ? "none" : `1.5px solid ${C.primary}`,
          background: highlighted ? C.grad : "transparent",
          color: highlighted ? "#fff" : C.primary,
          fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 24,
          fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s",
        }}>{cta}</button>
      </div>
    </FadeIn>
  );
}

function Step({ n, title, desc, delay = 0 }: { n: number; title: string; desc: string; delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", background: C.grad,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 16, fontWeight: 800, flexShrink: 0,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>{n}</div>
        <div style={{ paddingTop: 2 }}>
          <h4 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h4>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: C.textSec, margin: 0, fontFamily: "'Inter', sans-serif" }}>{desc}</p>
        </div>
      </div>
    </FadeIn>
  );
}

function Stat({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800,
          background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.03em", lineHeight: 1.1,
        }}>{value}</div>
        <div style={{ fontSize: 14, color: C.textMut, marginTop: 8, fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>{label}</div>
      </div>
    </FadeIn>
  );
}

function FAQItem({ q, a, delay = 0 }: { q: string; a: string; delay?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 0" }}>
        <button onClick={() => setOpen(!open)} style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, gap: 16,
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.4 }}>{q}</span>
          <span style={{ fontSize: 20, color: C.textMut, flexShrink: 0, transition: "transform 0.3s ease", transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
        </button>
        <div style={{ maxHeight: open ? 400 : 0, overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: C.textSec, paddingTop: 12, fontFamily: "'Inter', sans-serif", margin: 0 }}>{a}</p>
        </div>
      </div>
    </FadeIn>
  );
}

function PathologyTag({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "8px 18px", borderRadius: 100,
      fontSize: 14, fontWeight: 500, background: "#fff",
      border: `1px solid ${C.border}`, color: C.textSec,
      fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

export default function DieteticienGeneralPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${C.primary}22; color: ${C.primary}; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: `${C.bg}e8`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.border}`, padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: C.grad,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>N</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nami</span>
          </div>
          <button style={{
            padding: "10px 22px", borderRadius: 10, border: "none",
            background: C.primary, color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>Créer mon espace gratuit</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        paddingTop: "clamp(120px, 18vh, 180px)", paddingBottom: "clamp(60px, 8vh, 100px)",
        paddingLeft: 24, paddingRight: 24, textAlign: "center", maxWidth: 860, margin: "0 auto",
      }}>
        <FadeIn><Badge>Pour les diététiciens-nutritionnistes</Badge></FadeIn>
        <FadeIn delay={0.1}>
          <h1 style={{
            fontSize: "clamp(2.2rem, 6vw, 3.8rem)", fontWeight: 800, color: C.text,
            lineHeight: 1.08, letterSpacing: "-0.035em", marginTop: 24, marginBottom: 20,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Votre consultation ne s&apos;arrête pas
            <br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              à la porte du cabinet.
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p style={{
            fontSize: "clamp(1rem, 2.5vw, 1.15rem)", lineHeight: 1.7, color: C.textSec,
            maxWidth: 620, margin: "0 auto 28px", fontFamily: "'Inter', sans-serif",
          }}>
            Obésité, diabète, dyslipidémies, pathologies digestives, vos patients sont suivis par
            3 à 7 soignants. Nami structure cette coordination pour que chaque professionnel ait le
            contexte, sans un email de plus.
          </p>
        </FadeIn>
        <FadeIn delay={0.25}>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            {["Obésité", "Diabète type 2", "Dyslipidémies", "NASH / Stéatose", "Gastro & MICI", "Dénutrition", "Chirurgie bariatrique"].map((p) => (
              <PathologyTag key={p} label={p} />
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{
              padding: "16px 32px", borderRadius: 12, border: "none",
              background: C.primary, color: "#fff", fontSize: 16, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: "0 4px 16px rgba(91,78,196,0.2)",
            }}>Commencer gratuitement</button>
            <button style={{
              padding: "16px 32px", borderRadius: 12, border: `1.5px solid ${C.border}`,
              background: "transparent", color: C.text, fontSize: 16, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>Voir la démo</button>
          </div>
        </FadeIn>
      </section>

      {/* STATS */}
      <section style={{
        background: "#fff", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
        padding: "48px 24px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32 }}>
          <Stat value="0€" label="Agenda, RDV, messagerie" />
          <Stat value="19€" label="Facturation + visio" delay={0.1} />
          <Stat value="79€" label="Coordination complète" delay={0.2} />
          <Stat value="14j" label="Essai IA gratuit" delay={0.3} />
        </div>
      </section>

      {/* CASE STUDY */}
      <section style={{ padding: "clamp(64px, 10vh, 120px) 24px", maxWidth: 760, margin: "0 auto" }}>
        <FadeIn><Badge>Cas concret, Obésité complexe</Badge></FadeIn>
        <FadeIn delay={0.1}>
          <h2 style={{
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: C.text,
            lineHeight: 1.12, letterSpacing: "-0.03em", marginTop: 16, marginBottom: 12,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Marc, 52 ans. IMC 41. Diabète de type 2.
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.1rem)", lineHeight: 1.7, color: C.textSec,
            marginBottom: 44, fontFamily: "'Inter', sans-serif",
          }}>
            Son médecin traitant l&apos;adresse pour une prise en charge nutritionnelle.
            Vous découvrez qu&apos;il est aussi suivi par un endocrinologue, un psychologue et un
            éducateur APA. Quatre soignants, aucun ne sait exactement ce que les autres font.
            Avec Nami, tout le monde a les mêmes cartes en main.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <Step n={1} title="Vous enregistrez votre consultation"
            desc="En fin de séance, vous lancez l'enregistrement. Nami transcrit, structure vos observations en brouillon sourcé sur les référentiels HAS et IDF. Vous relisez, corrigez si besoin, et validez. 2 minutes au lieu de 15."
            delay={0.1} />
          <Step n={2} title="Le rendu de consultation part automatiquement"
            desc="Le compte-rendu structuré est généré : objectifs nutritionnels, apports relevés, ajustements proposés, prochaine étape. Le médecin traitant et l'endocrino le voient dans le dossier, plus de courrier à dicter, plus de fax."
            delay={0.2} />
          <Step n={3} title="L'endocrino ajuste en connaissance de cause"
            desc="L'endocrinologue voit vos observations nutritionnelles avant son prochain RDV avec Marc. Il voit l'HbA1c extraite automatiquement, votre plan alimentaire, la régularité de l'activité physique notée par l'APA. Il ajuste le traitement avec le contexte complet."
            delay={0.3} />
          <Step n={4} title="Marc suit sa progression sur son app"
            desc="Marc photographie ses repas, l'IA structure un récapitulatif nutritionnel. Il voit son équipe, ses prochains RDV, ses objectifs. Quand il oublie un RDV chez l'APA, Nami lui envoie un rappel. Le parcours avance."
            delay={0.4} />
          <Step n={5} title="L'indicateur de complétude fait le reste"
            desc="Le bilan lipidique de contrôle à 3 mois n'a pas été fait. L'indicateur de complétude le signale. Vous relancez via Nami. Personne ne se perd en chemin, même quand le parcours dure 12 mois."
            delay={0.5} />
        </div>
      </section>

      {/* CITATION */}
      <section style={{ background: C.bgAlt, padding: "clamp(48px, 8vh, 80px) 24px", textAlign: "center" }}>
        <FadeIn>
          <p style={{
            fontSize: "clamp(1.2rem, 3vw, 1.5rem)", fontStyle: "italic", color: C.text,
            maxWidth: 660, margin: "0 auto", lineHeight: 1.6,
            fontFamily: "'Playfair Display', serif", fontWeight: 400,
          }}>
            &ldquo;Ce n&apos;était pas un manque de compétence. C&apos;était un défaut d&apos;orchestration.
            Quatre mois perdus, parce qu&apos;aucun outil ne reliait les cinq soignants.&rdquo;
          </p>
          <p style={{ fontSize: 14, color: C.textMut, marginTop: 20, fontFamily: "'Inter', sans-serif" }}>
            Margot Vire, Diététicienne-nutritionniste, fondatrice de Nami
          </p>
        </FadeIn>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "clamp(64px, 10vh, 120px) 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <Badge>Vos outils au quotidien</Badge>
              <h2 style={{
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: C.text,
                lineHeight: 1.12, letterSpacing: "-0.03em", marginTop: 16,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Moins de temps administratif.
                <br />Plus de temps clinique.
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <FeatureCard icon="🎙️" title="Enregistrez, Nami structure"
              desc="Enregistrez votre consultation. L'IA transcrit et produit un brouillon structuré, sourcé sur les référentiels HAS, IDF et sociétés savantes. Vous validez, c'est tout."
              delay={0} />
            <FeatureCard icon="📄" title="Rendus de consultation automatiques"
              desc="Le compte-rendu part automatiquement vers l'équipe : objectifs, observations, ajustements, prochaine étape. Plus de courrier, plus de fax, plus de temps perdu."
              tag="Bientôt" delay={0.1} />
            <FeatureCard icon="👥" title="Vue équipe en temps réel"
              desc="L'endocrino, le MG, le psy, l'APA, chaque soignant voit les observations des autres. Le dossier vit entre les consultations, pas seulement pendant."
              delay={0.2} />
            <FeatureCard icon="📸" title="Photos repas par le patient"
              desc="Votre patient photographie ses repas. L'IA structure un récapitulatif nutritionnel. Vous arrivez en consultation avec un aperçu de la semaine, sans avoir rien demandé."
              delay={0.3} />
            <FeatureCard icon="📋" title="Adressage structuré"
              desc="Adressez un patient vers un endocrinologue ou un psychologue avec tout le contexte clinique. Le confrère reçoit le dossier structuré, pas un post-it."
              delay={0.4} />
            <FeatureCard icon="🔬" title="Extraction bio automatique"
              desc="Les résultats biologiques de votre patient (HbA1c, bilan lipidique, NFS) sont extraits et structurés automatiquement. Plus de saisie manuelle, plus d'erreurs de recopie."
              delay={0.5} />
          </div>
        </div>
      </section>

      {/* DOCTOLIB DARK SECTION */}
      <section style={{ background: C.dark, padding: "clamp(64px, 10vh, 100px) 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <Badge>Nami vs Doctolib</Badge>
            <h2 style={{
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, color: "#fff",
              lineHeight: 1.15, letterSpacing: "-0.03em", marginTop: 16, marginBottom: 12,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Ce que Doctolib facture 149€/mois,
              <br /><span style={{ color: C.teal }}>Nami l&apos;offre gratuitement.</span>
            </h2>
            <p style={{
              fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 44,
              fontFamily: "'Inter', sans-serif", lineHeight: 1.6,
            }}>
              Et tout ce que Doctolib ne fait pas, coordonner un parcours
              pluridisciplinaire avec l&apos;IA, c&apos;est Nami à partir de 79€.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden",
            }}>
              {[
                { f: "Agenda + Prise de RDV", d: "149€/mois", n: "Gratuit", nc: C.teal },
                { f: "Messagerie patients & soignants", d: "149€/mois", n: "Gratuit", nc: C.teal },
                { f: "Facturation (notes d'honoraires)", d: "307€/mois", n: "19€/mois", nc: C.teal },
                { f: "Visio, 0% commission", d: "307€ + 1% HT", n: "19€/mois", nc: C.teal },
                { f: "Coordination + vue équipe + adressage", d: "", n: "79€/mois", nc: "#fff" },
                { f: "Enregistrement + IA + sources cliniques", d: "", n: "149€/mois", nc: "#fff" },
              ].map((r, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16,
                  padding: "16px 24px", alignItems: "center",
                  borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", fontFamily: "'Inter', sans-serif", textAlign: "left" }}>{r.f}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", minWidth: 90, textAlign: "right" }}>{r.d}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: r.nc, fontFamily: "'Inter', sans-serif", minWidth: 90, textAlign: "right" }}>{r.n}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* LE VRAI PROBLÈME */}
      <section style={{ padding: "clamp(64px, 10vh, 100px) 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Badge>Le vrai problème</Badge>
              <h2 style={{
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, color: C.text,
                lineHeight: 1.12, letterSpacing: "-0.03em", marginTop: 16,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Vous n&apos;avez pas un problème de compétence.
                <br />Vous avez un problème de coordination.
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              { before: "Vous envoyez un courrier au MG. Il ne le reçoit jamais.", after: "Le MG voit vos observations dans le dossier partagé, en temps réel." },
              { before: "L'endocrino ajuste le traitement sans savoir ce que vous avez changé côté nutrition.", after: "L'endocrino lit votre plan nutritionnel avant son RDV avec le patient." },
              { before: "Le patient oublie son RDV APA. Personne ne s'en rend compte pendant 3 semaines.", after: "L'indicateur de complétude signale le RDV manqué. Vous relancez en un clic." },
              { before: "Vous passez 15 minutes à rédiger un compte-rendu que personne ne lira.", after: "Vous enregistrez, l'IA structure, le rendu part vers toute l'équipe automatiquement." },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{
                  background: "#fff", borderRadius: 16, padding: "28px 24px",
                  border: `1px solid ${C.border}`, height: "100%",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
                    <span style={{ color: "#e74c3c", fontSize: 14, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✗</span>
                    <p style={{ fontSize: 14, color: C.textMut, margin: 0, fontFamily: "'Inter', sans-serif", lineHeight: 1.5, textDecoration: "line-through", textDecorationColor: "rgba(231,76,60,0.3)" }}>{item.before}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: C.teal, fontSize: 14, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                    <p style={{ fontSize: 14, color: C.text, margin: 0, fontFamily: "'Inter', sans-serif", lineHeight: 1.5, fontWeight: 500 }}>{item.after}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "clamp(64px, 10vh, 120px) 24px", background: C.bgAlt }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <Badge>Tarifs</Badge>
              <h2 style={{
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: C.text,
                lineHeight: 1.12, letterSpacing: "-0.03em", marginTop: 16,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Choisissez votre rythme.
                <br />Upgradez quand le terrain l&apos;exige.
              </h2>
              <p style={{ fontSize: 15, color: C.textMut, marginTop: 12, fontFamily: "'Inter', sans-serif" }}>
                79€/mois ≈ 2 à 3% du CA moyen d&apos;un diététicien libéral.
              </p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, alignItems: "stretch" }}>
            <Pricing name="Gratuit" price="0€" sub="Tout ce que Doctolib facture 149€"
              features={["Agenda complet", "Prise de RDV en ligne", "Référencement annuaire Nami", "Messagerie patients & soignants", "Fiche patient basique"]}
              cta="Commencer" delay={0} />
            <Pricing name="Coordination" price="79€" sub="Le parcours pluri structuré"
              features={["Tout Gratuit + Essentiel inclus", "Adressage structuré avec contexte", "Téléexpertise tracée HAS", "Vue équipe patient partagée", "App patient + photos repas IA", "Réseau de confrères"]}
              cta="Essayer la Coordination" delay={0.1} />
            <Pricing name="Intelligence" price="149€" sub="L'IA qui structure vos consultations" highlighted
              features={["Tout Coordination inclus", "Enregistrement + transcription IA", "Rendus de consultation auto (bientôt)", "Base de 60 000+ sources cliniques", "Extraction bio automatique", "Essai gratuit 14 jours"]}
              cta="Essayer 14 jours gratuit" delay={0.2} />
            <Pricing name="Pilotage" price="299€" sub="Le cockpit financier du libéral"
              features={["Tout Intelligence inclus", "CA + charges temps réel", "Pré-déclarations fiscales", "Bilan, compte de résultat", "Export comptable structuré"]}
              cta="Découvrir le Pilotage" delay={0.3} />
          </div>
          <FadeIn delay={0.3}>
            <p style={{ textAlign: "center", fontSize: 13, color: C.textMut, marginTop: 24, fontFamily: "'Inter', sans-serif" }}>
              Essentiel à 19€/mois (facturation + visio) inclus dans Coordination et Intelligence.
              <br />Structures et réseaux : offre Réseau sur mesure à partir de 499€/mois.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "clamp(64px, 10vh, 100px) 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: C.text,
              lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 40,
              fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "center",
            }}>Questions fréquentes</h2>
          </FadeIn>
          {[
            { q: "Est-ce que Nami est adapté à l'obésité, au diabète et aux pathologies digestives ?",
              a: "Oui. Nami est conçu pour tout parcours pluridisciplinaire. Les parcours obésité complexe (PCR), diabète de type 2, dyslipidémies, NASH, MICI, dénutrition et chirurgie bariatrique impliquent tous une coordination entre 3 à 7 soignants, c'est exactement ce que Nami structure. Les indicateurs de complétude sont alignés sur les recommandations HAS par pathologie." },
            { q: "Comment fonctionne l'enregistrement de consultation ?",
              a: "Vous lancez l'enregistrement en fin de séance depuis l'app. Nami transcrit l'audio, structure les informations en brouillon sourcé, et vous le présente pour relecture. Vous validez, corrigez ou complétez. Le brouillon porte toujours le badge « Brouillon IA, à vérifier ». Rien ne part sans votre validation." },
            { q: "Mes confrères doivent-ils aussi être sur Nami ?",
              a: "Non. Vous pouvez adresser un patient à un confrère qui n'est pas encore sur Nami, il recevra une invitation par email. S'il est sur Nami en gratuit, il verra un aperçu de l'équipe et pourra communiquer avec vous. Pour le dossier complet, il passe à Coordination (79€). Et souvent, c'est le patient qui invite ses soignants via son app." },
            { q: "Les notes du psychologue sont-elles visibles ?",
              a: "Par défaut, seul le fait que la prise en charge psychologique est en cours est visible, date et statut uniquement. Le contenu des séances reste confidentiel. Le psychologue peut choisir de partager des observations spécifiques à l'équipe, mais c'est toujours son choix." },
            { q: "Qu'est-ce que le rendu de consultation automatique ?",
              a: "C'est une fonctionnalité à venir. Après validation de votre enregistrement, Nami génère automatiquement un compte-rendu structuré : objectifs, observations, ajustements, prochaine étape. Ce rendu est partagé avec l'équipe du patient. Fini les courriers à dicter, les fax, les comptes-rendus que personne ne lit." },
            { q: "Comment fonctionne la facturation à 19€/mois ?",
              a: "Le tier Essentiel couvre la facturation non conventionnée : notes d'honoraires, suivi des paiements, export comptable. C'est adapté aux diététiciens, psychologues, APA et toutes les professions non conventionnées. C'est inclus dans les tiers Coordination et Intelligence, pas besoin de payer en plus." },
          ].map((f, i) => <FAQItem key={i} q={f.q} a={f.a} delay={i * 0.06} />)}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "clamp(64px, 10vh, 120px) 24px", textAlign: "center", background: C.bgAlt }}>
        <FadeIn>
          <h2 style={{
            fontSize: "clamp(1.6rem, 4.5vw, 2.8rem)", fontWeight: 800, color: C.text,
            lineHeight: 1.1, letterSpacing: "-0.035em", marginBottom: 16,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Vos patients ont une équipe.
            <br />
            <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Donnez-leur un couloir.
            </span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p style={{ fontSize: 15, color: C.textMut, marginBottom: 32, fontFamily: "'Inter', sans-serif" }}>
            Créez votre espace en 2 minutes. Gratuit, sans engagement.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <button style={{
            padding: "18px 40px", borderRadius: 12, border: "none",
            background: C.primary, color: "#fff", fontSize: 17, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: "0 4px 24px rgba(91,78,196,0.25)",
          }}>Commencer gratuitement</button>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: C.textMut, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
          Outil de coordination · Non dispositif médical · Conforme RGPD
          <br />© 2026 Nami · Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
