import type { Metadata } from "next";
import Link from "next/link";
import { HomeNav } from "@/components/home/HomeNav";
import { HomeSticky } from "@/components/home/HomeSticky";
import { Reveal } from "@/components/home/HomeReveal";

export const metadata: Metadata = {
  title: "Le soin est fragmenté. Nami le coud.",
  description: "Nami coordonne les parcours de soins complexes entre professionnels de santé. TCA, obésité, pédiatrie, nutrition pluridisciplinaire. Annuaire de 564 000+ professionnels en France.",
  openGraph: {
    title: "Nami — Le soin est fragmenté. Nami le coud.",
    description: "Coordination pluridisciplinaire des parcours de soins complexes. Diét, psy, médecin, pédiatre — une équipe alignée.",
    url: "https://namipourlavie.com",
  },
  alternates: { canonical: "/" },
};

const FEATURES: { icon: string; title: string; desc: string }[] = [
  { icon: "🎙️", title: "Dictez. L'IA structure. Vous validez.", desc: "Enregistrez votre consultation. L'IA transcrit et produit un brouillon structuré. Fini les CR rédigés à 21h." },
  { icon: "👁️", title: "5 soignants. 1 seul écran.", desc: "Tout ce que la diét, le psy, le MG, le kiné ont fait. Avant votre consultation. Plus jamais sans contexte." },
  { icon: "🔬", title: "Bilans centralisés", desc: "Bio, DXA, ECG, IRM : scannez ou importez. Les valeurs sont extraites et structurées automatiquement." },
  { icon: "💊", title: "Photo → médicaments extraits", desc: "Photographiez une ordonnance. Les médicaments sont reconnus. 15 millions de références BDPM." },
  { icon: "📖", title: "60 000 sources cliniques", desc: "HAS, PNDS, DSM-5, ESPGHAN. Recherche pendant la consultation. Chaque recommandation sourcée." },
  { icon: "📱", title: "Le patient est partenaire", desc: "L'app patient montre le parcours, l'équipe, les RDV. Photos de repas, humeur, questionnaires. Le patient n'est plus coordinateur — il est informé." },
];

const STEPS = [
  { n: "01", tag: "L'ÉQUIPE SE FORME", title: "En 2 clics", body: "Ajoutez vos confrères et votre patient au dossier de coordination. Chaque rôle voit ce qui le concerne." },
  { n: "02", tag: "L'INFORMATION CIRCULE", title: "En temps réel", body: "Dictez, importez, partagez. Bilans, CR, ordonnances. Tout est en un seul endroit. Plus de courrier perdu." },
  { n: "03", tag: "LE PATIENT AVANCE", title: "Sans répéter", body: "Plus personne ne travaille sans contexte. Le parcours progresse. Le patient n'est plus le messager." },
];

const SPECIALTIES = [
  { icon: "🌱", label: "TCA", sub: "Anorexie · Boulimie · ARFID · BED", href: "/professions/dieteticien" },
  { icon: "⚖️", label: "Obésité", sub: "Pédiatrique · Grade II/III · PCR", href: "/professions/medecin-nutritionniste" },
  { icon: "👶", label: "Pédiatrie", sub: "Cassure de courbe · Crohn · APLV", href: "/professions/pediatre" },
  { icon: "🧠", label: "Santé mentale", sub: "TSA · TDAH · Anxiété alimentaire", href: "/professions/psychiatre" },
  { icon: "🩺", label: "Maladies chroniques", sub: "MICI · Diabète · Pathologies rares", href: "/professions/medecin-generaliste" },
  { icon: "💊", label: "Post-traitement", sub: "Réhabilitation · Suivi à long terme", href: "/professions/kinesitherapeute" },
];

const SECURITY = [
  { icon: "🇪🇺", label: "Hébergement en Europe", sub: "Migration HDS en cours" },
  { icon: "🔒", label: "Chiffrement bout en bout", sub: "Données en transit et au repos" },
  { icon: "🤖", label: "IA — brouillon uniquement", sub: "Validation humaine obligatoire" },
  { icon: "👥", label: "Secret professionnel", sub: "Architecture dédiée aux soignants" },
];

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,opsz,wght@0,6..18,300..800;1,6..18,300..800&display=swap');
        :root {
          --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
          --nami-primary: #5B4EC4;
          --nami-secondary: #2BA89C;
          --nami-white: #FAFAF8;
          --nami-bg-alt: #F5F3EF;
          --nami-dark: #1A1A2E;
          --nami-dark-2: #252540;
          --nami-text: #1A1A2E;
          --nami-text-2: #4A4A5A;
          --nami-text-3: #8A8A96;
        }
        * { box-sizing: border-box; }
        .nami-gradient-text {
          background: linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nami-gradient-text-dark {
          background: linear-gradient(135deg, #7B6FD4 0%, #45C4B8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .float-slow { animation: floatSlow 9s ease-in-out infinite alternate; }
        @keyframes floatSlow { 0% { transform: translate(0,0); } 100% { transform: translate(30px,-24px); } }
        .pulse { animation: pulse 3s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        .card-hover {
          transition: transform 0.3s var(--ease-expo), box-shadow 0.3s var(--ease-expo), border-color 0.3s;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(91,78,196,0.1);
          border-color: rgba(91,78,196,0.25) !important;
        }
        .btn-primary {
          transition: transform 0.2s var(--ease-expo), box-shadow 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(91,78,196,0.35);
        }
        .btn-primary:active { transform: scale(0.98); }
        .btn-secondary {
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(91,78,196,0.06) !important;
          border-color: rgba(91,78,196,0.4) !important;
          color: #5B4EC4 !important;
        }
        .specialty-card {
          transition: box-shadow 0.25s, border-color 0.25s;
        }
        .specialty-card:hover {
          box-shadow: 0 6px 24px rgba(91,78,196,0.1) !important;
          border-color: rgba(91,78,196,0.2) !important;
        }
        .footer-nav-link:hover { color: rgba(238,236,234,0.8) !important; }
        .cta-annuaire:hover {
          color: #EEECEA !important;
          border-color: rgba(238,236,234,0.35) !important;
        }
        @keyframes scrollBounce {
          0%,100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(10px); opacity: 0.15; }
        }
        .scroll-dot { animation: scrollBounce 2s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
        .nav-enter { animation: fadeIn 0.6s var(--ease-expo) 0.1s both; }
        .hero-eyebrow { animation: fadeIn 0.7s var(--ease-expo) 0.3s both; }
        .hero-title { animation: fadeIn 0.9s var(--ease-expo) 0.5s both; }
        .hero-sub { animation: fadeIn 0.8s var(--ease-expo) 0.8s both; }
        .hero-cta { animation: fadeIn 0.8s var(--ease-expo) 1.0s both; }
        .hero-scroll { animation: fadeIn 0.8s var(--ease-expo) 1.4s both; }

        @media (max-width: 767px) {
          .landing-nav-links, .landing-nav-auth { display: none !important; }
          .landing-nav-burger { display: flex !important; }
          .landing-sticky-grid { grid-template-columns: 1fr !important; gap: 24px !important; padding: 0 20px !important; }
          .landing-sticky-right { display: none !important; }
          .landing-features-grid { grid-template-columns: 1fr !important; }
          .landing-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 28px !important; }
          .landing-steps-grid { grid-template-columns: 1fr !important; }
          .landing-specialties-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .landing-security-grid { grid-template-columns: 1fr !important; }
          .landing-charge-grid { grid-template-columns: 1fr !important; }
          .landing-charge-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .landing-footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .landing-footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
          .landing-cta-btns { flex-direction: column !important; align-items: stretch !important; }
          .landing-cta-btns a { justify-content: center !important; }
          .landing-hero-cta { flex-direction: column !important; align-items: stretch !important; }
          .landing-hero-cta a { justify-content: center !important; }
        }
        @media (min-width: 768px) {
          .landing-nav-burger { display: none !important; }
          .landing-nav-mobile { display: none !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .landing-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .landing-specialties-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", background: "var(--nami-white)", color: "var(--nami-text)" }}>

        {/* NAV — client component */}
        <HomeNav />

        {/* ═══ HERO ════════════════════════════════════════════════════════ */}
        <section style={{
          minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", textAlign: "center", padding: "140px 24px 100px",
          position: "relative", overflow: "hidden",
          background: "linear-gradient(180deg, #FAFAF8 0%, #F5F3EF 100%)",
        }}>
          <div className="float-slow" style={{ position: "absolute", top: "5%", left: "10%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,78,196,0.07) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "8%", right: "8%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(43,168,156,0.07) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", animation: "floatSlow 12s ease-in-out infinite alternate-reverse" }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 840 }}>
            <div className="hero-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, border: "1px solid rgba(91,78,196,0.2)", background: "rgba(91,78,196,0.06)", marginBottom: 32 }}>
              <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B4EC4", display: "inline-block" }} />
              <span style={{ color: "#5B4EC4", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Coordination des parcours complexes</span>
            </div>

            <h1 className="hero-title" style={{ fontSize: "clamp(2.8rem,7vw,5.5rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.06, color: "var(--nami-text)", marginBottom: 28 }}>
              Le soin est fragmenté.<br />
              <span className="nami-gradient-text">Nami le coud.</span>
            </h1>

            <p className="hero-sub" style={{ fontSize: "clamp(1.05rem,1.8vw,1.3rem)", color: "var(--nami-text-2)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 44px" }}>
              Gabrielle a 10 ans, une anorexie, 3 soignants.
              Ils se coordonnent par SMS. 4 mois perdus.<br />
              <span style={{ color: "var(--nami-text)", fontWeight: 600 }}>Ce n&apos;est pas un manque de compétence. C&apos;est un défaut d&apos;orchestration.</span>
            </p>

            <div className="hero-cta landing-hero-cta" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/demander-une-demo" className="btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--nami-primary)", color: "#fff", fontSize: 15, fontWeight: 700, padding: "15px 38px", borderRadius: 100, textDecoration: "none", boxShadow: "0 4px 16px rgba(91,78,196,0.3)" }}
              >
                Demander une démo
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/login" className="btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1.5px solid rgba(91,78,196,0.2)", color: "var(--nami-text-2)", fontSize: 15, fontWeight: 500, padding: "15px 30px", borderRadius: 100, textDecoration: "none", background: "transparent" }}
              >Connexion soignant</Link>
            </div>
          </div>

          <div className="hero-scroll" style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--nami-text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Scroll</span>
            <div className="scroll-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--nami-primary)" }} />
          </div>
        </section>

        {/* STICKY — client component */}
        <HomeSticky />

        {/* ═══ FEATURES BENTO ═════════════════════════════════════════════ */}
        {/* ═══ LA CHARGE INVISIBLE ════════════════════════════════════════ */}
        <section style={{ padding: "120px 24px", background: "var(--nami-white)" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#E69342", textTransform: "uppercase", marginBottom: 18, padding: "5px 16px", border: "1px solid rgba(230,147,66,0.2)", borderRadius: 100, background: "rgba(230,147,66,0.06)" }}>LA CHARGE INVISIBLE</div>
            <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08, color: "var(--nami-text)" }}>
              Le patient ne devrait pas être<br />
              <span className="nami-gradient-text">le coordinateur de son propre parcours.</span>
            </h2>
          </Reveal>
          <div style={{ maxWidth: 720, margin: "0 auto 40px" }}>
            <Reveal>
              <p style={{ textAlign: "center", fontSize: 15, color: "var(--nami-text-2)", lineHeight: 1.7, marginBottom: 36 }}>
                Entre chaque consultation, c&apos;est le patient — ou ses parents — qui fait le travail de coordination. Pas par choix. Par absence d&apos;outil.
              </p>
            </Reveal>
            <div className="landing-charge-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              {[
                { icon: "📋", task: "Apporter l'ordonnance", detail: "\"Vous pouvez ramener ce que le gastro vous a prescrit ?\"" },
                { icon: "🔄", task: "Répéter son histoire", detail: "Chaque nouveau soignant, tout reprendre de zéro. Dates, traitements, allergies." },
                { icon: "📞", task: "Relancer les soignants", detail: "Appeler le secrétariat. Vérifier que le courrier est arrivé. Relancer pour les résultats." },
                { icon: "🧠", task: "Se souvenir de tout", detail: "Le psy a dit quoi ? Le bilan montrait quoi ? Le traitement a changé quand ?" },
                { icon: "📬", task: "Transmettre les bilans", detail: "Le MG les a, personne d'autre. Scanner, envoyer, espérer que ça arrive." },
                { icon: "😔", task: "Gérer les contradictions", detail: "La diét dit 2000 kcal. L'endocrinologue dit 1600. Lequel suivre ?" },
              ].map((item, i) => (
                <Reveal key={item.task} delay={i * 60} from="bottom">
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "20px 18px", borderRadius: 16, background: "var(--nami-bg-alt)", border: "1px solid rgba(26,26,46,0.05)" }}>
                    <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--nami-text)", marginBottom: 4 }}>{item.task}</p>
                      <p style={{ fontSize: 13, color: "var(--nami-text-3)", lineHeight: 1.55, margin: 0, fontStyle: "italic" }}>{item.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={360}>
            <div style={{ maxWidth: 720, margin: "0 auto 40px", background: "var(--nami-dark)", borderRadius: 24, padding: "40px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,78,196,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ fontSize: "clamp(1.4rem,3.5vw,2.2rem)", fontWeight: 800, color: "#EEECEA", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 14 }}>
                  Nami absorbe cette charge.
                </h3>
                <p style={{ fontSize: 15, color: "rgba(238,236,234,0.5)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
                  L&apos;information circule entre les soignants. Le patient reste informé, pas coordinateur. Peu importe où il consulte — hôpital, cabinet, visio — chaque soignant est relié au même parcours.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={420}>
            <div className="landing-charge-stats" style={{ maxWidth: 720, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
              {[
                { value: "60 000+", label: "Sources cliniques" },
                { value: "131", label: "Parcours structurés" },
                { value: "2 362", label: "Étapes sourcées" },
                { value: "116 000+", label: "Relations cliniques" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: "clamp(1.2rem,2.5vw,1.6rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--nami-primary)" }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "var(--nami-text-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ═══ FEATURES — FOND SOMBRE ═════════════════════════════════════ */}
        <section id="features" style={{ padding: "130px 24px", background: "var(--nami-dark)" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#45C4B8", textTransform: "uppercase", marginBottom: 18, padding: "5px 16px", border: "1px solid rgba(69,196,184,0.2)", borderRadius: 100, background: "rgba(69,196,184,0.06)" }}>FONCTIONNALITÉS</div>
            <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#EEECEA" }}>
              WhatsApp n&apos;est pas un outil<br />
              <span className="nami-gradient-text-dark">de coordination.</span>
            </h2>
          </Reveal>
          <div className="landing-features-grid" style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 60} from="scale">
                <div className="card-hover" style={{ padding: "32px 28px", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", height: "100%", cursor: "default" }}>
                  <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#EEECEA", marginBottom: 10, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{f.title}</h3>
                  <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: "rgba(238,236,234,0.45)", margin: 0 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ COMMENT ÇA MARCHE ═══════════════════════════════════════════ */}
        <section style={{ padding: "120px 24px", background: "var(--nami-bg-alt)" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-secondary)", textTransform: "uppercase", marginBottom: 18, padding: "5px 16px", border: "1px solid rgba(43,168,156,0.2)", borderRadius: 100, background: "rgba(43,168,156,0.06)" }}>EN PRATIQUE</div>
            <h2 style={{ fontSize: "clamp(2rem,4.5vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, color: "var(--nami-text)" }}>
              Du premier RDV au<br />
              <span className="nami-gradient-text">parcours complet.</span>
            </h2>
          </Reveal>
          <div className="landing-steps-grid" style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 100} from="bottom">
                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(26,26,46,0.06)", padding: "32px 28px", position: "relative", boxShadow: "0 1px 4px rgba(26,26,46,0.05)" }}>
                  <div style={{ fontSize: "3.5rem", fontWeight: 900, letterSpacing: "-0.05em", color: "rgba(91,78,196,0.07)", lineHeight: 1, marginBottom: 16 }}>{step.n}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-primary)", textTransform: "uppercase", marginBottom: 12 }}>{step.tag}</div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--nami-text)", marginBottom: 10, letterSpacing: "-0.02em" }}>{step.title}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--nami-text-2)", lineHeight: 1.7 }}>{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ QUOTE ═══════════════════════════════════════════════════════ */}
        <section style={{ padding: "140px 24px", background: "var(--nami-white)" }}>
          <Reveal>
            <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#5B4EC4,#2BA89C)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 22, fontWeight: 900, color: "#fff" }}>M</div>
              <blockquote style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.45, color: "var(--nami-text)", marginBottom: 32, fontStyle: "normal" }}>
                <span className="nami-gradient-text">&ldquo;J&apos;ai vécu le problème en première personne.</span>
                <br />
                <span>Alors j&apos;ai construit l&apos;outil que j&apos;aurais voulu avoir.&rdquo;</span>
              </blockquote>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--nami-text)" }}>Margot Vire</p>
              <p style={{ fontSize: 13, color: "var(--nami-text-3)", marginTop: 4 }}>Diététicienne TCA · Fondatrice de Nami · AP-HP</p>
            </div>
          </Reveal>
        </section>

        {/* ═══ SPÉCIALITÉS ═════════════════════════════════════════════════ */}
        <section style={{ padding: "110px 24px", background: "var(--nami-bg-alt)" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-primary)", textTransform: "uppercase", marginBottom: 18, padding: "5px 16px", border: "1px solid rgba(91,78,196,0.2)", borderRadius: 100, background: "rgba(91,78,196,0.06)" }}>CONÇU POUR</div>
            <h2 style={{ fontSize: "clamp(1.9rem,4.5vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, color: "var(--nami-text)" }}>
              Les pathologies qui<br />
              <span className="nami-gradient-text">demandent une équipe.</span>
            </h2>
          </Reveal>
          <div className="landing-specialties-grid" style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {SPECIALTIES.map((s, i) => (
              <Reveal key={s.label} delay={i * 55} from="scale">
                <Link href={s.href} className="specialty-card" style={{ display: "block", background: "#fff", borderRadius: 18, border: "1px solid rgba(26,26,46,0.06)", padding: "26px 22px", textDecoration: "none", boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--nami-text)", marginBottom: 5 }}>{s.label}</p>
                  <p style={{ fontSize: 12, color: "var(--nami-text-3)" }}>{s.sub}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ SÉCURITÉ ════════════════════════════════════════════════════ */}
        <section style={{ padding: "100px 24px", background: "var(--nami-white)" }}>
          <Reveal>
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nami-primary)", textTransform: "uppercase", marginBottom: 18, padding: "5px 16px", border: "1px solid rgba(91,78,196,0.2)", borderRadius: 100, background: "rgba(91,78,196,0.06)" }}>VOS DONNÉES</div>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, color: "var(--nami-text)", marginBottom: 48 }}>
                Construits pour la conformité<br />
                <span className="nami-gradient-text">dès le jour 1.</span>
              </h2>
              <div className="landing-security-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, textAlign: "left" }}>
                {SECURITY.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "20px", background: "var(--nami-bg-alt)", borderRadius: 14, border: "1px solid rgba(26,26,46,0.05)" }}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--nami-text)", marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: "var(--nami-text-3)" }}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══ CTA FINAL ═══════════════════════════════════════════════════ */}
        <section style={{ padding: "160px 24px", background: "var(--nami-dark)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,78,196,0.18) 0%, transparent 60%)", filter: "blur(80px)", pointerEvents: "none" }} />
          <Reveal>
            <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
              <h2 style={{ fontSize: "clamp(2.4rem,6vw,4.5rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.07, color: "#EEECEA", marginBottom: 22 }}>
                Prêt à orchestrer<br />
                <span className="nami-gradient-text-dark">le parcours ?</span>
              </h2>
              <p style={{ fontSize: "1.15rem", color: "rgba(238,236,234,0.5)", marginBottom: 44, lineHeight: 1.65 }}>
                Rejoignez les premiers soignants sur Nami.<br />Accès gratuit. Aucune carte de crédit.
              </p>
              <div className="landing-cta-btns" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/demander-une-demo" className="btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--nami-primary)", color: "#fff", fontSize: 16, fontWeight: 700, padding: "17px 44px", borderRadius: 100, textDecoration: "none", boxShadow: "0 4px 24px rgba(91,78,196,0.4)" }}
                >
                  Demander une démo
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
                <Link href="/trouver-un-soignant" className="cta-annuaire"
                  style={{ display: "inline-flex", alignItems: "center", border: "1.5px solid rgba(238,236,234,0.15)", color: "rgba(238,236,234,0.55)", fontSize: 15, fontWeight: 500, padding: "17px 32px", borderRadius: 100, textDecoration: "none", transition: "all 0.2s", background: "transparent" }}
                >Annuaire des soignants</Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══ FOOTER ══════════════════════════════════════════════════════ */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "56px 24px 36px", background: "var(--nami-dark-2)" }}>
          <div className="landing-footer-grid" style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 44, marginBottom: 44 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <img src="/nami-mascot.png" alt="Nami" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "contain" }} />
                <span style={{ color: "#EEECEA", fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Nami</span>
              </div>
              <p style={{ color: "rgba(238,236,234,0.35)", fontSize: 13, lineHeight: 1.7, maxWidth: 240 }}>
                Le système nerveux des parcours de soins complexes. Coordination, visibilité, passage de relais.
              </p>
            </div>
            {[
              { title: "Produit", links: [{ l: "Fonctionnalités", h: "/fonctionnalites" }, { l: "Connexion", h: "/login" }, { l: "Demander une démo", h: "/demander-une-demo" }] },
              { title: "Ressources", links: [{ l: "Annuaire", h: "/trouver-un-soignant" }, { l: "Spécialités", h: "/professions" }, { l: "Pathologies", h: "/pathologies" }, { l: "Blog", h: "/blog" }] },
              { title: "Légal", links: [{ l: "CGU", h: "/cgu" }, { l: "Confidentialité", h: "/confidentialite" }, { l: "Mentions légales", h: "/mentions-legales" }] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(238,236,234,0.2)", marginBottom: 18 }}>{col.title}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {col.links.map(({ l, h }) => (
                    <Link key={l} href={h} className="footer-nav-link"
                      style={{ fontSize: 13, color: "rgba(238,236,234,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                    >{l}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="landing-footer-bottom" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(238,236,234,0.2)" }}>© 2026 Nami — Margot Vire</span>
            <span style={{ fontSize: 12, color: "rgba(238,236,234,0.15)" }}>Coordination des parcours de soins complexes</span>
          </div>
        </footer>

      </div>
    </>
  );
}
