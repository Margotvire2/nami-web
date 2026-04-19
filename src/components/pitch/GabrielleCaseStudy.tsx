"use client"

import { useEffect } from "react"

export function GabrielleCaseStudy() {
  useEffect(() => {
    // Progress bar
    const pb = document.getElementById("pb")
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (pb && h > 0) pb.style.transform = `scaleX(${window.scrollY / h})`

      // Hero orb parallax
      const s = window.scrollY
      const orb1 = document.querySelector(".hero-orb-1") as HTMLElement | null
      const orb2 = document.querySelector(".hero-orb-2") as HTMLElement | null
      if (orb1) orb1.style.transform = `translate(${Math.sin(s * 0.002) * 30}px,${s * 0.15 * -0.5}px)`
      if (orb2) orb2.style.transform = `translate(${Math.sin(s * 0.002) * -25}px,${s * 0.1 * -0.5}px)`
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    // Mouse spotlight
    const hs = document.getElementById("hs")
    const hsp = document.getElementById("hsp")
    const onMouse = (e: MouseEvent) => {
      if (hsp) {
        hsp.style.setProperty("--mx", e.clientX + "px")
        hsp.style.setProperty("--my", e.clientY + "px")
      }
    }
    hs?.addEventListener("mousemove", onMouse)

    // Reveal IntersectionObserver
    const ro = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            ro.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    )
    document.querySelectorAll(".reveal,.reveal-left,.reveal-right,.reveal-scale,.reveal-blur").forEach((el) =>
      ro.observe(el)
    )

    // Animated counter
    function animateCounter(el: HTMLElement) {
      const t = parseInt(el.dataset.count ?? "0")
      if (isNaN(t)) return
      const prefix = el.dataset.prefix ?? ""
      const duration = 1800
      const startTime = performance.now()
      function tick(now: number) {
        const progress = Math.min((now - startTime) / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 4)
        const current = Math.round(t * ease)
        el.textContent = t >= 1000 ? `${prefix}${current.toLocaleString("fr-FR")}` : `${prefix}${current}`
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).querySelectorAll("[data-count]").forEach((el) =>
              animateCounter(el as HTMLElement)
            )
            co.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )
    document.querySelectorAll(".cc,.sg").forEach((el) => co.observe(el))

    return () => {
      window.removeEventListener("scroll", onScroll)
      hs?.removeEventListener("mousemove", onMouse)
      ro.disconnect()
      co.disconnect()
    }
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');

        :root {
          --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
          --font-serif: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
          --nami-purple: #5B4EC4;
          --nami-purple-light: #7B6FD4;
          --nami-purple-dark: #3D3294;
          --nami-teal: #2DD4BF;
          --nami-teal-soft: #5EEAD4;
          --bg-deep: #08060F;
          --bg-dark: #0E0B18;
          --bg-elevated: #161225;
          --bg-surface: rgba(91,78,196,0.06);
          --bg-light: #F7F6FB;
          --text-white: #FAFAFA;
          --text-light: rgba(255,255,255,0.75);
          --text-muted: rgba(255,255,255,0.4);
          --text-dark: #1a1a2e;
          --text-dark-secondary: #6b7280;
          --red: #F43F5E;
          --amber: #F59E0B;
          --green: #10B981;
          --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
          --ease-smooth: cubic-bezier(0.4, 0, 0, 1);
          --section-pad: clamp(100px, 14vh, 200px);
        }

        .gabrielle-page * { box-sizing: border-box; }
        .gabrielle-page { font-family: var(--font-body); color: var(--text-white); background: var(--bg-deep); overflow-x: hidden; line-height: 1.7; }

        .gabrielle-page .reveal { opacity: 0; transform: translateY(50px); transition: opacity 1s var(--ease-out-expo), transform 1s var(--ease-out-expo); will-change: opacity, transform; }
        .gabrielle-page .reveal.visible { opacity: 1; transform: translateY(0); }
        .gabrielle-page .reveal-left { opacity: 0; transform: translateX(-80px); transition: opacity 1s var(--ease-out-expo), transform 1s var(--ease-out-expo); }
        .gabrielle-page .reveal-left.visible { opacity: 1; transform: translateX(0); }
        .gabrielle-page .reveal-right { opacity: 0; transform: translateX(80px); transition: opacity 1s var(--ease-out-expo), transform 1s var(--ease-out-expo); }
        .gabrielle-page .reveal-right.visible { opacity: 1; transform: translateX(0); }
        .gabrielle-page .reveal-scale { opacity: 0; transform: scale(0.85); transition: opacity 1s var(--ease-out-expo), transform 1s var(--ease-out-expo); }
        .gabrielle-page .reveal-scale.visible { opacity: 1; transform: scale(1); }
        .gabrielle-page .reveal-blur { opacity: 0; filter: blur(12px); transform: translateY(30px); transition: opacity 0.9s var(--ease-out-expo), filter 0.9s var(--ease-out-expo), transform 0.9s var(--ease-out-expo); }
        .gabrielle-page .reveal-blur.visible { opacity: 1; filter: blur(0); transform: translateY(0); }
        .gabrielle-page .d1{transition-delay:.1s}.gabrielle-page .d2{transition-delay:.2s}.gabrielle-page .d3{transition-delay:.3s}.gabrielle-page .d4{transition-delay:.4s}

        .gabrielle-page .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem; position: relative; overflow: hidden; }
        .gabrielle-page .hero-spotlight { position: absolute; inset: 0; background: radial-gradient(800px circle at var(--mx,50%) var(--my,40%), rgba(91,78,196,0.12), transparent 50%); pointer-events: none; transition: background 0.3s ease; }
        .gabrielle-page .hero-orb-1, .gabrielle-page .hero-orb-2 { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; }
        .gabrielle-page .hero-orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(91,78,196,0.2) 0%, transparent 70%); top: 10%; left: -10%; animation: g-of1 12s var(--ease-smooth) infinite alternate; }
        .gabrielle-page .hero-orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%); bottom: 10%; right: -5%; animation: g-of2 15s var(--ease-smooth) infinite alternate; }
        @keyframes g-of1{0%{transform:translate(0,0) scale(1)}100%{transform:translate(60px,-40px) scale(1.15)}}
        @keyframes g-of2{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-50px,30px) scale(1.1)}}

        .gabrielle-page .hero-eyebrow { font-family: var(--font-display); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--nami-teal); margin-bottom: 2rem; position: relative; opacity:0;transform:translateY(20px);animation:g-fu .8s var(--ease-out-expo) .3s forwards; }
        .gabrielle-page .hero h1 { font-family: var(--font-serif); font-size: clamp(3rem,9vw,7rem); font-weight: 900; line-height: 1; letter-spacing: -0.04em; position: relative; opacity:0;transform:translateY(40px);animation:g-fu 1s var(--ease-out-expo) .5s forwards; margin: 0; }
        .gabrielle-page .hero h1 em { font-style: italic; font-weight: 400; color: var(--text-light); }
        .gabrielle-page .hero-sub { font-size: clamp(1rem,1.6vw,1.2rem); color: var(--text-light); max-width: 520px; margin-top: 2rem; position: relative; opacity:0;transform:translateY(20px);animation:g-fu .8s var(--ease-out-expo) .8s forwards; }
        @keyframes g-fu{to{opacity:1;transform:translateY(0)}}

        .gabrielle-page .scroll-cue { position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: .75rem; opacity:0;animation:g-fu .6s var(--ease-out-expo) 1.4s forwards; }
        .gabrielle-page .scroll-cue span { font-size: .65rem; letter-spacing: .15em; text-transform: uppercase; color: var(--text-muted); }
        .gabrielle-page .scroll-line { width: 1px; height: 40px; background: linear-gradient(to bottom, var(--nami-purple), transparent); animation: g-sp 2s ease-in-out infinite; }
        @keyframes g-sp{0%,100%{opacity:.3;transform:scaleY(.6)}50%{opacity:1;transform:scaleY(1)}}

        .gabrielle-page section { padding: var(--section-pad) clamp(1.5rem,5vw,4rem); }
        .gabrielle-page .cn { max-width: 680px; margin: 0 auto; }
        .gabrielle-page .cw { max-width: 1080px; margin: 0 auto; }

        .gabrielle-page .narrative p { font-size: clamp(1rem,1.4vw,1.15rem); color: var(--text-light); margin-bottom: 1.5rem; }
        .gabrielle-page .narrative .accent { color: var(--text-white); font-weight: 600; }
        .gabrielle-page .narrative .si { font-family: var(--font-display); font-weight: 800; color: var(--nami-teal); }

        .gabrielle-page .qw { border-top: 1px solid rgba(91,78,196,0.15); border-bottom: 1px solid rgba(91,78,196,0.15); position: relative; overflow: hidden; }
        .gabrielle-page .qw::before { content: '\\201C'; position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-family: var(--font-serif); font-size: 15rem; color: rgba(91,78,196,0.06); pointer-events: none; line-height: 1; }
        .gabrielle-page .bq { font-family: var(--font-serif); font-size: clamp(1.5rem,4vw,2.8rem); font-weight: 400; font-style: italic; line-height: 1.35; text-align: center; max-width: 800px; margin: 0 auto; position: relative; }
        .gabrielle-page .bq .hl { color: var(--nami-teal); font-weight: 700; font-style: normal; }
        .gabrielle-page .qa { text-align: center; margin-top: 1.5rem; font-size: .85rem; color: var(--text-muted); letter-spacing: .05em; }

        .gabrielle-page .ts { background: var(--bg-dark); }
        .gabrielle-page .st { text-align: center; margin-bottom: 4rem; }
        .gabrielle-page .st h2 { font-family: var(--font-display); font-size: clamp(2rem,4.5vw,3.2rem); font-weight: 800; letter-spacing: -0.03em; margin: 0; }
        .gabrielle-page .st p { color: var(--text-muted); margin-top: 1rem; font-size: 1rem; }
        .gabrielle-page .ln { width: 48px; height: 3px; background: linear-gradient(90deg, var(--nami-purple), var(--nami-teal)); margin: 1.5rem auto 0; border-radius: 2px; }

        .gabrielle-page .tl { position: relative; max-width: 780px; margin: 0 auto; }
        .gabrielle-page .tl::before { content: ''; position: absolute; left: 23px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, var(--nami-purple) 0%, var(--red) 30%, var(--amber) 60%, var(--nami-teal) 100%); opacity: .25; }
        .gabrielle-page .ti { position: relative; padding-left: 60px; padding-bottom: 2.5rem; }
        .gabrielle-page .td { position: absolute; left: 14px; top: 6px; width: 20px; height: 20px; border-radius: 50%; border: 3px solid; background: var(--bg-dark); transition: box-shadow .4s ease; }
        .gabrielle-page .ti:hover .td { box-shadow: 0 0 16px currentColor; }
        .gabrielle-page .td.cp{border-color:var(--nami-purple);color:var(--nami-purple)}
        .gabrielle-page .td.cr{border-color:var(--red);color:var(--red)}
        .gabrielle-page .td.ca{border-color:var(--amber);color:var(--amber)}
        .gabrielle-page .td.ct{border-color:var(--nami-teal);color:var(--nami-teal)}
        .gabrielle-page .tl-date { font-size: .7rem; font-weight: 700; color: var(--text-muted); letter-spacing: .1em; text-transform: uppercase; margin-bottom: .4rem; }
        .gabrielle-page .tl-t { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; margin-bottom: .5rem; }
        .gabrielle-page .tl-b { font-size: .92rem; color: var(--text-light); line-height: 1.65; }
        .gabrielle-page .tag { display: inline-block; padding: .2rem .65rem; border-radius: 100px; font-size: .65rem; font-weight: 700; letter-spacing: .04em; margin-top: .7rem; text-transform: uppercase; }
        .gabrielle-page .tr{background:rgba(244,63,94,.12);color:var(--red);border:1px solid rgba(244,63,94,.25)}
        .gabrielle-page .tda{background:rgba(245,158,11,.12);color:var(--amber);border:1px solid rgba(245,158,11,.25)}
        .gabrielle-page .tm{background:rgba(91,78,196,.12);color:var(--nami-purple-light);border:1px solid rgba(91,78,196,.25)}

        .gabrielle-page .pg { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-top: 3rem; }
        .gabrielle-page .pc { background: var(--bg-elevated); border: 1px solid rgba(91,78,196,.1); border-radius: 20px; padding: 2rem; position: relative; overflow: hidden; transition: transform .4s var(--ease-out-expo), border-color .4s ease, box-shadow .4s ease; }
        .gabrielle-page .pc::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--red), var(--amber)); opacity: 0; transition: opacity .4s ease; }
        .gabrielle-page .pc:hover { transform: translateY(-4px); border-color: rgba(244,63,94,.25); box-shadow: 0 20px 60px rgba(0,0,0,.4); }
        .gabrielle-page .pc:hover::before { opacity: 1; }
        .gabrielle-page .pe { font-size: 1.8rem; margin-bottom: 1rem; display: block; }
        .gabrielle-page .pc h3 { font-family: var(--font-display); font-size: 1rem; font-weight: 700; margin-bottom: .75rem; margin-top: 0; }
        .gabrielle-page .pc p { font-size: .88rem; color: var(--text-light); line-height: 1.6; margin: 0; }

        .gabrielle-page .cs { position: relative; overflow: hidden; }
        .gabrielle-page .cs .glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(244,63,94,.08) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-50%); filter: blur(60px); pointer-events: none; }
        .gabrielle-page .cc { text-align: center; position: relative; z-index: 1; }
        .gabrielle-page .cn-big { font-family: var(--font-display); font-size: clamp(3.5rem,12vw,8rem); font-weight: 800; letter-spacing: -0.04em; background: linear-gradient(135deg, var(--red), #F97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
        .gabrielle-page .cl { font-size: 1.15rem; color: var(--text-light); margin-top: .75rem; }
        .gabrielle-page .cx { margin-top: 2rem; font-size: 1rem; color: var(--text-muted); max-width: 500px; margin-left: auto; margin-right: auto; }

        .gabrielle-page .nl { background: var(--bg-light); color: var(--text-dark); position: relative; }
        .gabrielle-page .nl::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(91,78,196,.2), transparent); }
        .gabrielle-page .nl h2 { font-family: var(--font-display); font-size: clamp(2rem,4.5vw,3rem); font-weight: 800; letter-spacing: -0.03em; text-align: center; color: var(--text-dark); margin: 0; }
        .gabrielle-page .nl .sub { text-align: center; color: var(--text-dark-secondary); font-size: 1.05rem; max-width: 550px; margin: 1rem auto 3.5rem; }

        .gabrielle-page .cg { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; max-width: 920px; margin: 0 auto; }
        @media(max-width:768px){.gabrielle-page .cg{grid-template-columns:1fr}}
        .gabrielle-page .col { border-radius: 20px; padding: 2rem; }
        .gabrielle-page .col.s { background: #FEF2F2; border: 1px solid #FECACA; }
        .gabrielle-page .col.a { background: #ECFDF5; border: 1px solid #A7F3D0; }
        .gabrielle-page .col h3 { font-family: var(--font-display); font-size: .75rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 1.5rem; display: flex; align-items: center; gap: .5rem; margin-top: 0; }
        .gabrielle-page .col.s h3{color:#DC2626}
        .gabrielle-page .col.a h3{color:#059669}
        .gabrielle-page .col h3 .dt { width: 8px; height: 8px; border-radius: 50%; animation: g-pl 2s ease-in-out infinite; }
        .gabrielle-page .col.s h3 .dt{background:#DC2626}
        .gabrielle-page .col.a h3 .dt{background:#059669}
        @keyframes g-pl{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        .gabrielle-page .ci { display: flex; gap: .65rem; align-items: flex-start; margin-bottom: .85rem; font-size: .88rem; color: #374151; line-height: 1.55; }
        .gabrielle-page .ck { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .6rem; font-weight: 800; margin-top: 2px; }
        .gabrielle-page .col.s .ck{background:#FECACA;color:#991B1B}
        .gabrielle-page .col.a .ck{background:#A7F3D0;color:#065F46}

        .gabrielle-page .sg { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: rgba(91,78,196,.1); border-radius: 20px; overflow: hidden; max-width: 900px; margin: 3.5rem auto 0; }
        @media(max-width:640px){.gabrielle-page .sg{grid-template-columns:repeat(2,1fr)}}
        .gabrielle-page .sb { background: var(--bg-light); padding: 2rem 1.5rem; text-align: center; }
        .gabrielle-page .sn { font-family: var(--font-display); font-size: clamp(1.5rem,3vw,2.2rem); font-weight: 800; color: var(--nami-purple); line-height: 1; }
        .gabrielle-page .sl { font-size: .78rem; color: var(--text-dark-secondary); margin-top: .5rem; line-height: 1.35; }

        .gabrielle-page .fin { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; position: relative; overflow: hidden; }
        .gabrielle-page .fin-glow { position: absolute; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(91,78,196,.12) 0%, transparent 65%); top: 50%; left: 50%; transform: translate(-50%,-50%); filter: blur(80px); pointer-events: none; animation: g-of1 10s var(--ease-smooth) infinite alternate; }
        .gabrielle-page .fin h2 { font-family: var(--font-serif); font-size: clamp(2rem,5.5vw,3.8rem); font-weight: 700; line-height: 1.15; max-width: 720px; position: relative; margin: 0; }
        .gabrielle-page .fin h2 .tl2 { background: linear-gradient(135deg, var(--nami-teal), var(--nami-purple-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .gabrielle-page .fin-sub { font-size: 1.1rem; color: var(--text-light); margin-top: 2rem; max-width: 480px; position: relative; }
        .gabrielle-page .pill { display: inline-flex; align-items: center; gap: .6rem; margin-top: 3rem; padding: .65rem 1.6rem; border-radius: 100px; background: rgba(91,78,196,.12); border: 1px solid rgba(91,78,196,.25); font-family: var(--font-display); font-size: .85rem; font-weight: 700; color: var(--nami-purple-light); position: relative; letter-spacing: .02em; backdrop-filter: blur(10px); }
        .gabrielle-page .pill .dlv { width: 6px; height: 6px; border-radius: 50%; background: var(--nami-teal); animation: g-pl 1.5s ease-in-out infinite; }

        .gabrielle-page .foot { padding: 3rem 2rem; text-align: center; }
        .gabrielle-page .foot-ln { height: 1px; background: linear-gradient(90deg, transparent, rgba(91,78,196,.15), transparent); max-width: 300px; margin: 0 auto 2rem; }
        .gabrielle-page .foot p { font-size: .7rem; color: var(--text-muted); letter-spacing: .06em; margin: 0; }
      `}</style>

      {/* Fixed progress bar */}
      <div
        id="pb"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "2px",
          width: "100%",
          background: "linear-gradient(90deg, #5B4EC4, #2DD4BF)",
          zIndex: 10000,
          transformOrigin: "left",
          transform: "scaleX(0)",
          willChange: "transform",
        }}
      />

      <div className="gabrielle-page">
        {/* Hero */}
        <section className="hero" id="hs">
          <div className="hero-spotlight" id="hsp" />
          <div className="hero-orb-1" />
          <div className="hero-orb-2" />
          <div className="hero-eyebrow">Case study — Parcours de soins réel</div>
          <h1>Gabrielle, <em>10 ans</em></h1>
          <p className="hero-sub">
            L&apos;histoire d&apos;un parcours de soins où la compétence était là. La volonté aussi. Mais pas l&apos;infrastructure.
          </p>
          <div className="scroll-cue">
            <span>Défiler</span>
            <div className="scroll-line" />
          </div>
        </section>

        {/* Narrative */}
        <section className="narrative">
          <div className="cn">
            <p className="reveal">
              Gabrielle a 10 ans. Elle vit en région parisienne avec ses parents. Elle aime l&apos;équitation, les animaux, et veut sauver la planète.
            </p>
            <p className="reveal d1">
              Tout a commencé par du harcèlement scolaire. Puis, insidieusement, le contrôle alimentaire s&apos;est installé. Les assiettes se vident à moitié. La nourriture se cache dans les poches. Les repas deviennent des négociations.
            </p>
            <p className="accent reveal d2">Gabrielle souffre d&apos;anorexie mentale restrictive.</p>
            <p className="reveal d3">
              Au plus bas : <span className="si">27,6 kg</span> pour 1m39. Un âge osseux en retard. Les mains deviennent violettes à la récréation — le sang ne circule plus jusqu&apos;au bout des doigts. À chaque consultation, l&apos;hospitalisation est évoquée.
            </p>
            <p className="reveal d4">
              Autour d&apos;elle, une équipe : son pédiatre, une diététicienne-nutritionniste, une psychologue, le réseau TCA francilien, et l&apos;hôpital de référence. Cinq acteurs compétents, engagés, mobilisés.
            </p>
          </div>
        </section>

        {/* Quote 1 */}
        <section className="qw">
          <div className="cn" style={{ padding: "var(--section-pad) 2rem" }}>
            <blockquote className="bq reveal-blur">
              Autour de Gabrielle, il y a une équipe compétente. Mais une équipe qui <span className="hl">ne se parle pas.</span>
            </blockquote>
          </div>
        </section>

        {/* Timeline */}
        <section className="ts">
          <div className="cw">
            <div className="st reveal">
              <h2>Chronologie des ruptures</h2>
              <p>6 mois de suivi. 8 points de rupture de coordination documentés.</p>
              <div className="ln" />
            </div>
            <div className="tl">

              <div className="ti reveal">
                <div className="td cp" />
                <div className="tl-date">Décembre 2025</div>
                <div className="tl-t">Première consultation nutritionnelle</div>
                <div className="tl-b">27,6 kg, 1m39. La diététicienne identifie un profil d&apos;anorexie restrictive et recommande des compléments alimentaires pour protéger la masse osseuse — fenêtre critique à 10 ans. Le pédiatre, spécialisé TCA ados mais moins habitué aux enfants de cet âge, préfère attendre.</div>
                <span className="tag tm">Désaccord thérapeutique non arbitré</span>
              </div>

              <div className="ti reveal">
                <div className="td cr" />
                <div className="tl-date">Janvier 2026</div>
                <div className="tl-t">Le poids est invisible entre les consultations</div>
                <div className="tl-b">Gabrielle ne se pèse qu&apos;en cabinet médical — jamais à la maison. Entre deux rendez-vous, aucun praticien ne sait où elle en est. La diététicienne n&apos;a pas accès au poids enregistré chez le pédiatre. La donnée critique du parcours TCA reste cloisonnée.</div>
                <span className="tag tr">Information cloisonnée</span>
              </div>

              <div className="ti reveal">
                <div className="td cr" />
                <div className="tl-date">Février 2026</div>
                <div className="tl-t">–1 kg chez les grands-parents</div>
                <div className="tl-b">Gabrielle passe une semaine chez ses grands-parents. L&apos;anorexie négocie, manipule, profite du changement d&apos;environnement. Résultat : –1 kg. Personne ne le sait avant la pesée suivante chez le pédiatre. Aucun système de détection entre les consultations.</div>
                <span className="tag tr">Dégradation non détectée</span>
              </div>

              <div className="ti reveal">
                <div className="td ca" />
                <div className="tl-date">Février 2026</div>
                <div className="tl-t">Les mains violettes — signal clinique non partagé</div>
                <div className="tl-b">À la récréation, les mains de Gabrielle deviennent violettes. Les enfants s&apos;inquiètent. Les parents l&apos;apprennent par Gabrielle. La diététicienne l&apos;apprend en consultation, deux semaines plus tard. Signe de dénutrition visible — mais non transmis en temps réel à l&apos;équipe.</div>
                <span className="tag tda">Délai de transmission</span>
              </div>

              <div className="ti reveal">
                <div className="td cr" />
                <div className="tl-date">Fin février — Mai 2026</div>
                <div className="tl-t">RCP déclenché tard, puis blocage administratif</div>
                <div className="tl-b">Un RCP est enfin déclenché avec le réseau TCA francilien — fin février, soit deux mois après le premier signal. La diététicienne était en consultation au moment de la réunion. L&apos;hôpital de référence demande ensuite une évaluation complète. Le dossier est bloqué par un courrier manquant. L&apos;évaluation est reportée de mars à mai.</div>
                <span className="tag tr">3 mois de délai</span>
              </div>

              <div className="ti reveal">
                <div className="td ca" />
                <div className="tl-date">Janvier — Mars 2026</div>
                <div className="tl-t">Suivi psychologique sans visibilité</div>
                <div className="tl-b">La psychologue voit Gabrielle chaque semaine. Mais aucun autre praticien ne sait ce qui se passe en séance — pas de compte-rendu partagé, pas de lien visible avec le protocole TCA. Le pédiatre le sait. La diététicienne le sait. Mais personne ne voit concrètement le travail effectué.</div>
                <span className="tag tm">Absence de visibilité inter-praticiens</span>
              </div>

              <div className="ti reveal">
                <div className="td ca" />
                <div className="tl-date">Tout le parcours</div>
                <div className="tl-t">Les parents comme seul lien entre praticiens</div>
                <div className="tl-b">Chaque consultation commence par un debrief parental. Les parents transmettent les résultats d&apos;examens, les décisions, les prescriptions. Ils sont devenus — malgré eux et en plus de leur charge émotionnelle — le système de coordination du parcours de leur fille.</div>
                <span className="tag tr">Parents = middleware</span>
              </div>

              <div className="ti reveal">
                <div className="td cr" />
                <div className="tl-date">Décembre 2025 — Mars 2026</div>
                <div className="tl-t">3 mois pour démarrer les compléments alimentaires</div>
                <div className="tl-b">La diététicienne recommande les compléments dès décembre — la masse osseuse se constitue à cet âge, il ne faut pas laisser la dénutrition s&apos;installer. Le pédiatre ne prescrit pas immédiatement. Il accepte en février. En mars, Gabrielle en a bu « une demi-gorgée ». L&apos;anorexie a gagné du temps.</div>
                <span className="tag tda">Fenêtre critique perdue</span>
              </div>

            </div>
          </div>
        </section>

        {/* 4 structural defects */}
        <section>
          <div className="cw">
            <div className="st reveal">
              <h2>Les 4 défauts structurels</h2>
              <p>Pas un manque de compétence. Un manque d&apos;infrastructure.</p>
              <div className="ln" />
            </div>
            <div className="pg">
              <div className="pc reveal">
                <span className="pe">🔇</span>
                <h3>Information cloisonnée</h3>
                <p>Le poids — donnée vitale dans un TCA — n&apos;est visible que chez le pédiatre. Les résultats d&apos;examens arrivent par les parents. Chaque praticien travaille avec une vue partielle du parcours.</p>
              </div>
              <div className="pc reveal d1">
                <span className="pe">⏳</span>
                <h3>Boucles ouvertes</h3>
                <p>Une prescription de compléments sans suivi de prise. Une demande d&apos;évaluation hospitalière sans traçabilité. Un suivi psychologique sans compte-rendu partagé. Chaque action ouvre une boucle que personne ne ferme.</p>
              </div>
              <div className="pc reveal d2">
                <span className="pe">👁️</span>
                <h3>Pas de vue d&apos;ensemble</h3>
                <p>La diététicienne ne voit pas les décisions du pédiatre. Le pédiatre ne voit pas le travail de la psychologue. Le RCP arrive fin février — deux mois après le premier signal. La coordination repose sur la charge mentale des parents.</p>
              </div>
              <div className="pc reveal d3">
                <span className="pe">🚨</span>
                <h3>Aucune détection proactive</h3>
                <p>Quand Gabrielle perd 1 kg chez ses grands-parents, aucun système ne l&apos;alerte. Quand ses mains deviennent violettes, aucun partage automatique. Chaque signe est découvert a posteriori, en consultation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cost counter */}
        <section className="cs">
          <div className="glow" />
          <div className="cc reveal-scale">
            <div className="cn-big" data-count="180000" data-prefix="€" id="costNum">
              €0
            </div>
            <div className="cl">Coût d&apos;une hospitalisation pour anorexie sévère</div>
            <p className="cx">
              Mais surtout, c&apos;est un échec. L&apos;hospitalisation n&apos;est pas un traitement de premier recours — c&apos;est la preuve qu&apos;on a échoué à coordonner en amont.
            </p>
          </div>
        </section>

        {/* Before / After */}
        <section className="nl">
          <div className="cw">
            <h2 className="reveal">Et si Gabrielle avait eu Nami ?</h2>
            <p className="sub reveal d1">Le même parcours. La même équipe. Mais avec une infrastructure de coordination.</p>
            <div className="cg">
              <div className="col s reveal-left">
                <h3><span className="dt" /> Sans coordination</h3>
                <div className="ci"><div className="ck">✕</div><div>Le poids n&apos;est visible que chez le médecin, avec des semaines de retard</div></div>
                <div className="ci"><div className="ck">✕</div><div>La diététicienne découvre les décisions du pédiatre via les parents</div></div>
                <div className="ci"><div className="ck">✕</div><div>La perte de poids chez les grands-parents passe inaperçue</div></div>
                <div className="ci"><div className="ck">✕</div><div>La demande hospitalière est bloquée 3 mois par un courrier manquant</div></div>
                <div className="ci"><div className="ck">✕</div><div>Le suivi psychologique est invisible pour le reste de l&apos;équipe</div></div>
                <div className="ci"><div className="ck">✕</div><div>Les compléments alimentaires arrivent 3 mois trop tard</div></div>
              </div>
              <div className="col a reveal-right">
                <h3><span className="dt" /> Avec Nami</h3>
                <div className="ci"><div className="ck">✓</div><div>Chaque pesée est partagée en temps réel avec toute l&apos;équipe</div></div>
                <div className="ci"><div className="ck">✓</div><div>Les décisions de chaque praticien apparaissent dans une timeline commune</div></div>
                <div className="ci"><div className="ck">✓</div><div>La courbe pondérale déclenche un indicateur de complétude dès –500g</div></div>
                <div className="ci"><div className="ck">✓</div><div>La demande hospitalière est tracée — le système identifie la boucle ouverte à J+14</div></div>
                <div className="ci"><div className="ck">✓</div><div>Chaque praticien voit les comptes-rendus des autres, filtrés par pertinence</div></div>
                <div className="ci"><div className="ck">✓</div><div>L&apos;écart entre recommandation diététique et prescription est visible immédiatement</div></div>
              </div>
            </div>
            <div className="sg reveal">
              <div className="sb"><div className="sn" data-count="8">0</div><div className="sl">ruptures de coordination documentées</div></div>
              <div className="sb"><div className="sn">4 mois</div><div className="sl">de délai évitables</div></div>
              <div className="sb"><div className="sn" data-count="5">0</div><div className="sl">praticiens sans vue partagée</div></div>
              <div className="sb"><div className="sn" data-count="0">0</div><div className="sl">outil de coordination utilisé</div></div>
            </div>
          </div>
        </section>

        {/* Quote 2 */}
        <section className="qw">
          <div className="cn" style={{ padding: "var(--section-pad) 2rem" }}>
            <blockquote className="bq reveal-blur">
              Ce n&apos;était pas un manque de compétence. C&apos;était un <span className="hl">défaut d&apos;orchestration.</span>
            </blockquote>
            <div className="qa reveal d2">— Margot Viré, fondatrice de Nami</div>
          </div>
        </section>

        {/* Final */}
        <section className="fin">
          <div className="fin-glow" />
          <h2 className="reveal">
            Nami est l&apos;infrastructure<br />qui manquait à <span className="tl2">Gabrielle.</span>
          </h2>
          <p className="fin-sub reveal d2">
            Des Gabrielle, il y en a des millions. Chaque parcours de soins complexe mérite une coordination à la hauteur de la compétence des soignants.
          </p>
          <div className="pill reveal d3">
            <span className="dlv" />
            nami — Coordination Intelligence Engine
          </div>
        </section>

        <footer className="foot">
          <div className="foot-ln" />
          <p>NAMI — Case study clinique — Données issues de consultations réelles anonymisées — Avril 2026</p>
        </footer>
      </div>
    </>
  )
}
