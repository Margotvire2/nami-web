"use client";

import { useState } from "react";

const VIOLET = "#5B4EC4";
const TEAL = "#2BB5A0";
const BG = "#FAFAF8";
const CARD = "#FFFFFF";
const MUTED = "#94909A";
const DARK = "#1A1625";

const pipeline = [
  {
    id: "source",
    emoji: "✍️",
    title: "1 ARTICLE SOURCE",
    subtitle: "45 min avec Claude",
    color: VIOLET,
    description:
      "Tu écris UN article de blog SEO par semaine avec ce prompt. Format pilier (1500-2500 mots) ou satellite (800-1200 mots). C'est la seule chose que tu crées toi-même.",
    template: `## Template article source

**Prompt à utiliser :**
"Écris un article pilier SEO/GEO pour Nami sur [SUJET].
Mot-clé principal : [MOT-CLÉ]
Audience : [soignants / patients / mixte]
Angle : [préciser l'angle unique]
Applique les 7 piliers SEO et les règles de compliance Nami."

**Checklist avant publication :**
☐ Meta title (50-65 chars) avec mot-clé en début
☐ Meta description (145-155 chars) avec verbe d'action
☐ Slug court (3-5 mots)
☐ H1 unique + H2/H3 hiérarchisés
☐ 3+ sources rang 1 (HAS, FFAB, OMS)
☐ 4 liens internes minimum
☐ FAQ schema (3-5 questions, info NOUVELLE)
☐ Disclaimer médical en fin d'article
☐ ZÉRO mot interdit (surveillance, alerte clinique...)
☐ Publié sur namipourlavie.com/blog/[slug]`,
  },
  {
    id: "linkedin",
    emoji: "💼",
    title: "2 POSTS LINKEDIN",
    subtitle: "Voix soignant · cockpit",
    color: VIOLET,
    description:
      "Déclinés automatiquement depuis l'article. Un carrousel éducatif (5-8 slides) + un post narratif fondatrice. Publiés mardi et jeudi, 8h30.",
    template: `## Template LinkedIn — Post carrousel éducatif

**Prompt :**
"À partir de cet article [COLLER L'ARTICLE], crée un carrousel LinkedIn de 6 slides pour Nami.
Voix soignant (cockpit). Sobre, factuel, jamais vendeur.
Slide 1 : hook accrocheur (question ou stat choc)
Slides 2-5 : les points clés, 1 idée par slide, max 40 mots/slide
Slide 6 : CTA soft ('Lien dans les commentaires')
Applique les mots safe Nami. Zéro mot interdit."

**Format post accompagnant :**
[Hook en 1 ligne — stat ou question]

[3-4 lignes de contexte issu de l'article]

[Insight personnel de fondatrice — 2 lignes]

↓ Carrousel complet ci-dessous

#CoordinationDesSoins #ParcoursComplexe #Santé

**Horaire :** Mardi 8h30
**KPI :** Engagement rate > 3%

---

## Template LinkedIn — Post narratif fondatrice

**Prompt :**
"À partir de cet article [COLLER], écris un post LinkedIn narratif au nom de Margot, fondatrice de Nami.
Format : storytelling personnel lié au sujet de l'article.
Commence par une phrase choc ou une anecdote.
Max 1300 caractères. Pas de hashtags dans le corps.
Termine par une question ouverte pour l'engagement.
Voix : authentique, passionnée, jamais corporate."

**Horaire :** Jeudi 8h30
**KPI :** Commentaires > 10`,
  },
  {
    id: "instagram",
    emoji: "📸",
    title: "3-4 CONTENUS INSTAGRAM",
    subtitle: "Voix patient · chaleureuse",
    color: TEAL,
    description:
      "1 carrousel patient-friendly + 3 stories interactives. Déclinés depuis l'article avec la voix patient. La mascotte peut apparaître.",
    template: `## Template Instagram — Carrousel patient

**Prompt :**
"À partir de cet article [COLLER], crée un carrousel Instagram pour Nami côté patient.
Voix chaleureuse, empathique, jamais infantilisante.
5 slides max, vocabulaire simple, pas de jargon médical.
Slide 1 : accroche émotionnelle ('Vous en avez marre de...')
Slides 2-4 : conseils concrets issus de l'article
Slide 5 : 'Tout votre parcours, un seul endroit. Lien en bio.'
Design : fond clair (#FAFAF8), violet Nami (#5B4EC4), typo ronde."

**Horaire :** Mercredi 12h ou Samedi 10h
**KPI :** Saves > 20, Shares > 10

---

## Template Instagram — 3 Stories interactives

**Prompt :**
"À partir de cet article [COLLER], crée 3 stories Instagram pour Nami :
Story 1 : Sondage ('Vous avez déjà dû répéter votre histoire à un nouveau soignant ?' Oui/Non)
Story 2 : 'Le saviez-vous ?' (1 stat clé de l'article, design impactant)
Story 3 : Question ouverte ('Qu'est-ce qui vous manque le plus dans votre suivi ?')
Voix patient. Fond coloré (violet ou teal). Texte gros et lisible."

**Horaire :** Lundi + Mercredi + Vendredi
**KPI :** Réponses stories, taux complétion`,
  },
  {
    id: "facebook",
    emoji: "👥",
    title: "1 POST FACEBOOK",
    subtitle: "Groupes pros · valeur d'abord",
    color: "#1877F2",
    description:
      "Post adapté pour les groupes de soignants. Jamais de promo directe — apporter un insight de l'article, poser une question, générer une discussion.",
    template: `## Template Facebook — Post groupe professionnel

**Prompt :**
"À partir de cet article [COLLER], crée un post Facebook pour un groupe de soignants (type 'Diététiciens de France' ou 'Coordination santé').
Ton : collègue à collègue. Pas de promo.
Format :
- Observation terrain (1-2 lignes)
- Question qui fait réfléchir
- Lien vers l'article en commentaire (PAS dans le post — l'algo pénalise)
Max 500 caractères. Conversationnel."

**Exemple de structure :**
"Petite question pour les collègues qui coordonnent des parcours complexes :
comment vous faites quand votre patient voit 4 professionnels et que personne n'a les mêmes infos ?

J'ai écrit un truc là-dessus qui pourrait intéresser, je mets le lien en commentaire si ça vous dit 👇"

**Horaire :** Mercredi 13h
**KPI :** Commentaires, clics lien en commentaire`,
  },
  {
    id: "newsletter",
    emoji: "📧",
    title: "1 BLOC NEWSLETTER",
    subtitle: "Bi-mensuelle · nurture",
    color: "#E84855",
    description:
      "L'article alimente la section principale de ta newsletter bi-mensuelle. Format : 1 insight + 1 extrait article + 1 CTA. Envoyée le mardi, semaines paires.",
    template: `## Template Newsletter — Bloc article

**Prompt :**
"À partir de cet article [COLLER], crée le bloc principal de la newsletter Nami.
Format :
- Titre accrocheur (pas le même que l'article)
- 3-4 phrases de teasing (le meilleur insight, reformulé)
- Bouton CTA : 'Lire l'article complet →'
- 1 phrase de transition vers la section suivante
Voix : mix soignant/patient selon l'article. Directe, pas de blabla."

**Structure newsletter complète :**
1. 📌 Insight de la semaine [EXTRAIT ARTICLE]
2. 📰 Actualité coordination (1 news HAS/ARS commentée)
3. 💡 Tip Nami (1 feature, 2 lignes)
4. 📅 Événement (webinar à venir ou replay)

**Outil :** Brevo (gratuit jusqu'à 300 emails/jour)
**Horaire :** Mardi 10h, semaines paires
**KPI :** Open rate > 35%, CTR > 5%`,
  },
  {
    id: "shorts",
    emoji: "🎬",
    title: "1 SHORT VIDÉO",
    subtitle: "YouTube + Reels · optionnel",
    color: "#FF0000",
    description:
      "Optionnel en phase 1. Un script de 60 secondes extrait de l'article. Tu le tournes face caméra en 5 min ou tu fais un motion design simple.",
    template: `## Template Short vidéo (60s)

**Prompt :**
"À partir de cet article [COLLER], crée un script vidéo de 60 secondes pour Nami.
Format face caméra ou voix off + texte à l'écran.
Structure :
- Hook (3s) : question choc ou stat
- Contexte (10s) : pourquoi c'est un problème
- 3 points clés (30s) : 10s chacun, phrases courtes
- CTA (5s) : 'Lien en bio' ou 'Abonne-toi'
Voix : selon audience (soignant sobre OU patient chaleureuse).
ZÉRO mot interdit Nami."

**Option low-effort :**
Utilise Canva pour faire un motion design texte animé.
Pas besoin de te filmer au début — le texte + musique suffit.

**Horaire :** Jeudi ou Vendredi
**Plateformes :** YouTube Shorts + Instagram Reels + TikTok (même vidéo)
**KPI :** Vues > 500, rétention > 50%`,
  },
];

const weeklyCalendar = [
  { day: "Lundi",   tasks: ["📸 Stories Instagram (story 1/3)"],                                                                         time: "10 min" },
  { day: "Mardi",   tasks: ["💼 LinkedIn carrousel", "📧 Newsletter (sem. paires)"],                                                      time: "15 min" },
  { day: "Mercredi",tasks: ["📸 Stories Instagram (2/3)", "👥 Facebook groupe", "📸 Carrousel Instagram"],                                time: "20 min" },
  { day: "Jeudi",   tasks: ["💼 LinkedIn narratif fondatrice", "🎬 Short vidéo (optionnel)"],                                             time: "15 min" },
  { day: "Vendredi",tasks: ["📸 Stories Instagram (3/3)"],                                                                               time: "10 min" },
  { day: "Weekend", tasks: ["✍️ Écrire l'article source (45 min)", "📋 Générer les déclinaisons avec Claude (30 min)", "📅 Programmer tout dans Buffer (15 min)"], time: "1h30" },
];

function PipelineStep({
  step,
  isActive,
  onClick,
}: {
  step: (typeof pipeline)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 18px",
        background: isActive ? step.color + "12" : CARD,
        border: isActive ? `2px solid ${step.color}` : "2px solid #E8E6EE",
        borderRadius: 14,
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ fontSize: 24 }}>{step.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: isActive ? step.color : DARK,
            letterSpacing: "0.02em",
          }}
        >
          {step.title}
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{step.subtitle}</div>
      </div>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          background: isActive ? step.color : "#E8E6EE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isActive ? "#fff" : MUTED,
          fontSize: 14,
          fontWeight: 700,
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}
      >
        {isActive ? "↓" : "→"}
      </div>
    </button>
  );
}

export default function AdminContenuPage() {
  const [activeStep, setActiveStep] = useState("source");
  const [view, setView] = useState<"pipeline" | "calendar" | "checklist">("pipeline");
  const active = pipeline.find((s) => s.id === activeStep);

  return (
    <div style={{ fontFamily: "var(--font-jakarta, system-ui, sans-serif)", background: BG, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${VIOLET}, ${TEAL})`,
            color: "#fff",
            padding: "6px 16px",
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          La Machine Nami
        </div>
        <h1
          style={{
            fontFamily: "var(--font-jakarta, system-ui, sans-serif)",
            fontSize: 28,
            fontWeight: 800,
            color: DARK,
            margin: "0 0 8px 0",
            lineHeight: 1.2,
          }}
        >
          1 article → 10 contenus
        </h1>
        <p
          style={{
            color: MUTED,
            fontSize: 14,
            margin: "0 auto",
            maxWidth: 400,
            lineHeight: 1.5,
          }}
        >
          Système Create Once Distribute Everywhere.
          <br />
          2h/semaine. Tous tes canaux alimentés.
        </p>
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          background: "#E8E6EE",
          borderRadius: 12,
          padding: 4,
        }}
      >
        {(
          [
            { id: "pipeline",  label: "Pipeline" },
            { id: "calendar",  label: "Calendrier" },
            { id: "checklist", label: "Checklist" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              borderRadius: 10,
              background: view === tab.id ? CARD : "transparent",
              color: view === tab.id ? DARK : MUTED,
              fontFamily: "inherit",
              fontWeight: view === tab.id ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: view === tab.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PIPELINE ─────────────────────────────────────────────── */}
      {view === "pipeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pipeline.map((step) => (
              <PipelineStep
                key={step.id}
                step={step}
                isActive={activeStep === step.id}
                onClick={() => setActiveStep(step.id)}
              />
            ))}
          </div>

          {active && (
            <div
              style={{
                background: CARD,
                borderRadius: 16,
                padding: 24,
                border: `2px solid ${active.color}20`,
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{active.emoji}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: DARK }}>
                    {active.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: active.color, fontWeight: 600 }}>
                    {active.subtitle}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#4A4458", lineHeight: 1.6, margin: "0 0 20px 0" }}>
                {active.description}
              </p>
              <div
                style={{
                  background: DARK,
                  borderRadius: 12,
                  padding: 20,
                  color: "#E8E6EE",
                  fontSize: 12.5,
                  lineHeight: 1.7,
                  fontFamily: "var(--font-inter, 'Courier New', monospace)",
                  whiteSpace: "pre-wrap",
                  overflowX: "auto",
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                {active.template}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CALENDRIER ───────────────────────────────────────────── */}
      {view === "calendar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${VIOLET}15, ${TEAL}15)`,
              borderRadius: 14,
              padding: 16,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: VIOLET }}>
              Temps total par semaine
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: DARK,
                fontFamily: "var(--font-jakarta, system-ui)",
              }}
            >
              ~2h10
            </div>
            <div style={{ fontSize: 12, color: MUTED }}>
              1h30 le weekend (création) + 40 min en semaine (scheduling)
            </div>
          </div>

          {weeklyCalendar.map((day) => (
            <div
              key={day.day}
              style={{
                background: CARD,
                borderRadius: 14,
                padding: "14px 18px",
                border: "1px solid #E8E6EE",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <div style={{ minWidth: 72, fontWeight: 700, fontSize: 13, color: DARK, paddingTop: 2 }}>
                {day.day}
              </div>
              <div style={{ flex: 1 }}>
                {day.tasks.map((task, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#4A4458", lineHeight: 1.8 }}>
                    {task}
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: `${TEAL}15`,
                  color: TEAL,
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {day.time}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CHECKLIST ────────────────────────────────────────────── */}
      {view === "checklist" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            {
              title: "Setup initial (à faire une seule fois)",
              color: VIOLET,
              items: [
                "Créer un compte Buffer (gratuit) → connecter LinkedIn, Instagram, Facebook",
                "Créer un compte Brevo ou Substack (gratuit) pour la newsletter",
                "Créer 5 templates Canva : carrousel LinkedIn (1080×1080), carrousel Instagram (1080×1350), story Instagram (1080×1920), banner newsletter, thumbnail YouTube",
                "Sauvegarder le prompt marketing Nami dans tes projets Claude",
                "Configurer les couleurs Nami dans Canva : #5B4EC4, #2BB5A0, #FAFAF8, #1A1625",
                "Préparer ta page LinkedIn perso (bio fondatrice + lien Nami)",
                "Créer la page LinkedIn Nami (logo, banner, description)",
                "Configurer le blog sur namipourlavie.com/blog (si pas fait)",
              ],
            },
            {
              title: "Workflow hebdomadaire (chaque weekend)",
              color: TEAL,
              items: [
                "Choisir le sujet de l'article de la semaine",
                "Écrire l'article avec Claude (prompt SEO/GEO) — 45 min",
                "Générer les déclinaisons avec Claude (coller l'article + prompt par canal) — 20 min",
                "Créer les visuels dans Canva avec les templates — 15 min",
                "Programmer tous les posts dans Buffer — 10 min",
                "Préparer le bloc newsletter (semaines paires) — 5 min",
                "Relire tout une dernière fois (filtre compliance) — 5 min",
              ],
            },
            {
              title: "Les 4 premiers articles à écrire",
              color: "#E84855",
              items: [
                "Semaine 1 : PCR Obésité Complexe — tout comprendre sur le nouveau parcours",
                "Semaine 2 : Pourquoi votre parcours TCA est fragmenté (et comment y remédier)",
                "Semaine 3 : 5 outils que les soignants utilisent pour se coordonner (et pourquoi ça casse)",
                "Semaine 4 : Ce que j'ai appris en créant une healthtech seule en France",
              ],
            },
          ].map((section) => (
            <div
              key={section.title}
              style={{
                background: CARD,
                borderRadius: 16,
                padding: 20,
                border: "1px solid #E8E6EE",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px 0",
                  fontSize: 14,
                  fontWeight: 800,
                  color: section.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: section.color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {section.title}
              </h3>
              {section.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom:
                      i < section.items.length - 1 ? "1px solid #F0EEF4" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: "2px solid #D4D0DC",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  />
                  <span style={{ fontSize: 13, color: "#4A4458", lineHeight: 1.5 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: 32,
          padding: "16px 0",
          borderTop: "1px solid #E8E6EE",
        }}
      >
        <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          La Machine Nami — Create Once, Distribute Everywhere
          <br />
          Chaque contenu passe les 3 filtres : Émotion · Clarté · Compliance
        </p>
      </div>
    </div>
  );
}
