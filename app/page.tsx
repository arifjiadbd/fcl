"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Theme detection — works with class ("dark"/"light"), data-theme,   */
/*  localStorage("theme") or OS preference. Does NOT depend on the     */
/*  Tailwind `dark:` variant, so it follows your navbar toggle exactly */
/* ------------------------------------------------------------------ */
function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const read = () => {
      const h = document.documentElement;
      const b = document.body;
      const dt = (
        h.getAttribute("data-theme") ||
        h.getAttribute("data-mode") ||
        b.getAttribute("data-theme") ||
        ""
      ).toLowerCase();
      if (dt === "dark" || dt === "light") return dt === "dark";

      const cls = `${h.className} ${b.className}`.toLowerCase();
      if (/\blight\b/.test(cls)) return false;
      if (/\bdark\b/.test(cls)) return true;

      const scheme = h.style.colorScheme;
      if (scheme === "light" || scheme === "dark") return scheme === "dark";

      try {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") return saved === "dark";
      } catch {}

      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    };

    const update = () => setIsDark(read());
    update();

    const obs = new MutationObserver(update);
    const opts = { attributes: true, attributeFilter: ["class", "data-theme", "data-mode", "style"] };
    obs.observe(document.documentElement, opts);
    obs.observe(document.body, opts);
    window.addEventListener("storage", update);

    return () => {
      obs.disconnect();
      window.removeEventListener("storage", update);
    };
  }, []);

  return isDark;
}

/* ------------------------------------------------------------------ */
/*  Preloader Component (5s FCL Logo Animation)                       */
/* ------------------------------------------------------------------ */
function Preloader({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617] transition-opacity duration-700 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="absolute h-64 w-64 rounded-full bg-blue-600/20 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-blue-500/40 bg-[#0b1220] shadow-[0_0_30px_rgba(37,99,235,0.4)] animate-pulse">
          <img
            src="/fcl-logo.png"
            alt="FCL Logo"
            className="h-20 w-20 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] animate-bounce"
          />
        </div>

        <h2 className="mt-6 text-xl font-black tracking-wider text-white">
          FCL <span className="text-amber-400">CRICKET</span>
        </h2>
        <p className="mt-1 text-xs font-semibold text-slate-400">Loading Experience...</p>

        <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 animate-[loadingBar_5s_linear_forwards]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll-reveal hook — fades/lifts an element in once it enters view */
/* ------------------------------------------------------------------ */
function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(el);
          }
        });
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ------------------------------------------------------------------ */
/*  Reusable premium gateway card — tilt-on-hover + shimmer + reveal   */
/* ------------------------------------------------------------------ */
type GatewayCardProps = {
  href?: string;
  color: string;
  badgeText: string;
  badgeIcon: string;
  cornerIcon: string;
  title: string;
  description: string;
  footerText: string;
  delay?: number;
  comingSoon?: boolean;
};

function GatewayCard({
  href,
  color,
  badgeText,
  badgeIcon,
  cornerIcon,
  title,
  description,
  footerText,
  delay = 0,
  comingSoon = false,
}: GatewayCardProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -9, y: px * 9 });
  }

  const Wrapper = comingSoon ? "div" : Link;
  const wrapperProps = comingSoon ? {} : { href: href as string };

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
      }}
      className="transition-all duration-700 ease-out"
    >
      {/* @ts-ignore - polymorphic wrapper (Link vs div) */}
      <Wrapper
        {...wrapperProps}
        onMouseEnter={() => setHover(true)}
        onMouseMove={handleMove}
        onMouseLeave={() => {
          setHover(false);
          setTilt({ x: 0, y: 0 });
        }}
        style={
          {
            "--c": color,
            borderColor: hover ? color : `${color}66`,
            ...(hover ? { boxShadow: `0 0 50px ${color}33, 0 30px 60px -20px ${color}40` } : {}),
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${
              hover ? -8 : 0
            }px) scale(${hover ? 1.015 : 1})`,
            transition: hover
              ? "transform 80ms linear, box-shadow 300ms ease, border-color 300ms ease"
              : "transform 500ms cubic-bezier(.2,.8,.2,1), box-shadow 400ms ease, border-color 400ms ease",
          } as React.CSSProperties
        }
        className={`fcl-card group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[2.5rem] border-2 p-8 ${
          comingSoon ? "cursor-pointer" : ""
        }`}
      >
        {/* ambient tint */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(circle at 30% 0%, ${color}22, transparent 60%)`,
          }}
        />
        {/* shimmer sweep */}
        <div className="fcl-shimmer pointer-events-none absolute inset-y-0 left-[-60%] w-1/2 -skew-x-12 transition-transform duration-700 ease-out group-hover:translate-x-[220%]" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <span
              className="fcl-ink rounded-xl border px-3.5 py-1.5 text-xs font-black uppercase"
              style={{ borderColor: `${color}80`, backgroundColor: `${color}22` }}
            >
              {badgeIcon} {badgeText}
            </span>
            <span className="text-2xl transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              {cornerIcon}
            </span>
          </div>
          <h4 className={`mt-8 text-2xl font-black transition sm:text-3xl ${hover ? "fcl-ink" : "fcl-head"}`}>
            {title}
          </h4>
          <p className="fcl-body mt-3 text-sm leading-relaxed">{description}</p>
        </div>

        <div
          className="relative mt-8 flex items-center justify-between border-t pt-4"
          style={{ borderColor: `${color}33` }}
        >
          <span className="fcl-ink text-xs font-bold">{footerText}</span>
          <span className="fcl-ink transform text-lg font-black transition-transform duration-300 group-hover:translate-x-2">
            {comingSoon ? "⚡" : "→"}
          </span>
        </div>
      </Wrapper>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                             */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [loading, setLoading] = useState(true);
  const isDark = useIsDark();

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("fcl_visited");
    if (hasVisited) {
      setLoading(false);
    }
  }, []);

  const handlePreloadFinish = () => {
    sessionStorage.setItem("fcl_visited", "true");
    setLoading(false);
  };

  const hero = useReveal<HTMLDivElement>(0.05);
  const heroArt = useReveal<HTMLDivElement>(0.05);
  const sectionHead = useReveal<HTMLDivElement>(0.2);

  const cards: GatewayCardProps[] = [
    {
      href: "/rankings",
      color: "#f59e0b",
      badgeText: "LEADERBOARD",
      badgeIcon: "👑",
      cornerIcon: "⭐",
      title: "Rankings & MVP",
      description:
        "Explore all-time player rankings, MVP pinnacle ratings, and elite championship leaderboards.",
      footerText: "Enter Portal",
    },
    {
      href: "/records",
      color: "#1877F2",
      badgeText: "RECORD CABINET",
      badgeIcon: "🏆",
      cornerIcon: "📜",
      title: "Hall of Fame & Records",
      description:
        "Discover historical benchmarks, most runs, highest wickets, hat-tricks, and legendary milestones.",
      footerText: "Enter Portal",
    },
    {
      href: "/birthday",
      color: "#ec4899",
      badgeText: "BIRTHDAY CORNER",
      badgeIcon: "🎂",
      cornerIcon: "🎉",
      title: "Birthday Celebration",
      description:
        "Celebrate FCL stars! View birthday dates, play festive wishes, and download auto-generated greeting cards.",
      footerText: "Enter Corner",
    },
    {
      href: "/matches",
      color: "#22c55e",
      badgeText: "MATCH ARCHIVE",
      badgeIcon: "📅",
      cornerIcon: "🏟️",
      title: "Match Directory & History",
      description:
        "Browse tournament home pages, series games, friendly matches, and test match archives across years.",
      footerText: "Enter Portal",
    },
    {
      href: "/memories",
      color: "#f472b6",
      badgeText: "NOSTALGIA",
      badgeIcon: "📖",
      cornerIcon: "🎞️",
      title: "FCL Memories & Adda",
      description:
        "Relive the golden days, funny moments, community stories, and nostalgic photo galleries.",
      footerText: "Enter Portal",
    },
    {
      href: "/players",
      color: "#38bdf8",
      badgeText: "SQUAD DIRECTORY",
      badgeIcon: "👥",
      cornerIcon: "🏏",
      title: "Players & Stat Cards",
      description:
        "Browse all registered players, examine official player statistics cards, and download PNG cards.",
      footerText: "Enter Portal",
    },
    {
      href: "/rules",
      color: "#c084fc",
      badgeText: "RULEBOOK",
      badgeIcon: "📜",
      cornerIcon: "⚖️",
      title: "Rules & Match Formats",
      description:
        "Read official tournament guidelines, T20/ODI/Test systems, and power-play regulations.",
      footerText: "Enter Portal",
    },
    {
      href: "/play",
      color: "#1877F2",
      badgeText: "FCL ONLINE",
      badgeIcon: "🏏",
      cornerIcon: "🎮",
      title: "Play The Game",
      description:
        "Login to FCL Online, join matches and experience the original Facebook Cricket League game.",
      footerText: "Enter FCL Online",
    },
    {
      href: "/thrillers",
      color: "#a855f7",
      badgeText: "THRILLER",
      badgeIcon: "⚡",
      cornerIcon: "🔥",
      title: "High Voltage Matches",
      description:
        "Relive the most intense nail-biting matches, thrilling finishes, and heroic nail-biting tournament victories.",
      footerText: "Explore Matches",
    },
    {
      href: "/extraordinary",
      color: "#22d3ee",
      badgeText: "HEROICS",
      badgeIcon: "🌟",
      cornerIcon: "💎",
      title: "Extraordinary Performance",
      description:
        "Witness jaw-dropping individual masterclasses, match-winning hat-tricks, and explosive 50+ knocks.",
      footerText: "Explore Masterclasses",
    },
    {
      href: "/gallery",
      color: "#3b82f6",
      badgeText: "MEDIA HUB",
      badgeIcon: "🖼️",
      cornerIcon: "📸",
      title: "Player Photo Gallery",
      description: "Browse official player photos, filter by name, and download high-resolution portrait files instantly.",
      footerText: "Explore Gallery",
    },
  ];

  return (
    <>
      {loading && <Preloader onFinish={handlePreloadFinish} />}

      <main
        className={`fcl-root ${isDark ? "fcl-dark" : "fcl-light"} min-h-screen selection:bg-[#1877F2]/30 font-sans pb-20 sm:pb-0 ${
          loading ? "hidden" : "block"
        }`}
      >
        <style jsx global>{`
          /* ============ THEME TOKENS ============ */
          .fcl-root {
            /* LIGHT (default) */
            --bg: #ffffff;
            --bg-alt: #f1f5f9;
            --head: #0f172a;
            --text: #475569;
            --muted: #64748b;
            --line: #e2e8f0;
            --eyebrow: #0369a1;
            --blue1: #1d4ed8;
            --blue2: #1d4ed8;
            --amber: #b45309;
            --rose: #e11d48;
            --frame-bg: #ffffff;
            --frame-line: #e2e8f0;
            --frame-shadow: 0 30px 80px rgba(15, 23, 42, 0.14);
            --card-a: #ffffff;
            --card-b: #f8fafc;
            --card-shadow: 0 6px 24px rgba(15, 23, 42, 0.07);
            --mcard: #ffffff;
            --pill-bg: rgba(255, 255, 255, 0.96);
            --pill-line: #e2e8f0;
            --pill-sub: #64748b;
            --shimmer: rgba(15, 23, 42, 0.06);
            --grid-line: rgba(100, 116, 139, 0.12);
            background: var(--bg);
            color: var(--head);
            transition: background 0.3s ease, color 0.3s ease;
          }
          .fcl-root.fcl-dark {
            --bg: #020617;
            --bg-alt: #02050b;
            --head: #ffffff;
            --text: #94a3b8;
            --muted: #94a3b8;
            --line: #172033;
            --eyebrow: #38bdf8;
            --blue1: #93c5fd;
            --blue2: #60a5fa;
            --amber: #f59e0b;
            --rose: #fb7185;
            --frame-bg: #080d17;
            --frame-line: rgba(255, 255, 255, 0.08);
            --frame-shadow: 0 40px 120px rgba(0, 0, 0, 0.7);
            --card-a: #0f172a;
            --card-b: #0b1220;
            --card-shadow: none;
            --mcard: #081020;
            --pill-bg: rgba(11, 18, 32, 0.9);
            --pill-line: rgba(255, 255, 255, 0.1);
            --pill-sub: #94a3b8;
            --shimmer: rgba(255, 255, 255, 0.1);
            --grid-line: rgba(148, 163, 184, 0.06);
          }

          /* ============ THEMED UTILITIES ============ */
          .fcl-head { color: var(--head); }
          .fcl-body { color: var(--text); }
          .fcl-muted { color: var(--muted); }
          .fcl-eyebrow { color: var(--eyebrow); }
          .fcl-blue1 { color: var(--blue1); }
          .fcl-blue2 { color: var(--blue2); }
          .fcl-amber { color: var(--amber); }
          .fcl-rose { color: var(--rose); }
          .fcl-pill-sub { color: var(--pill-sub); }
          .fcl-hero { background: var(--bg-alt); border-color: var(--line); }
          .fcl-section { background: var(--bg); }
          .fcl-frame {
            background: var(--frame-bg);
            border: 1px solid var(--frame-line);
            box-shadow: var(--frame-shadow);
          }
          .fcl-pill {
            background: var(--pill-bg);
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
          }
          .fcl-dark .fcl-pill { box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); }
          .fcl-pill-line { border-color: var(--pill-line); }
          .fcl-card {
            background: linear-gradient(to bottom, var(--card-a), var(--card-b));
            box-shadow: var(--card-shadow);
          }
          .fcl-mcard {
            background: var(--mcard);
            box-shadow: var(--card-shadow);
          }
          .fcl-shimmer {
            background: linear-gradient(90deg, transparent, var(--shimmer), transparent);
          }
          .fcl-bn { color: var(--blue2); }
          .fcl-bn:hover { color: #ffffff; }

          /* accent text: darker on white, original colour on dark */
          .fcl-ink { color: color-mix(in srgb, var(--c) 58%, #0f172a); }
          .fcl-dark .fcl-ink { color: var(--c); }

          /* ============ ANIMATIONS ============ */
          @keyframes float-a {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(24px, -32px) scale(1.05); }
          }
          @keyframes float-b {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-28px, 26px) scale(1.06); }
          }
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes chip-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes fcl-zoom-pulse {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(34,211,238,0.5)); }
            50% { transform: scale(1.18); filter: drop-shadow(0 0 25px rgba(34,211,238,0.9)); }
          }
          @keyframes fcl-color-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes mobile-glow {
            0%, 100% { opacity: .45; transform: scale(1); }
            50% { opacity: .75; transform: scale(1.08); }
          }
          .fcl-orb-a { animation: float-a 11s ease-in-out infinite; }
          .fcl-orb-b { animation: float-b 13s ease-in-out infinite; }
          .fcl-gradient-text {
            background-size: 200% 200%;
            animation: gradient-shift 6s ease-in-out infinite;
          }
          .fcl-chip { animation: chip-float 5s ease-in-out infinite; }
          .fcl-chip-delay { animation-delay: 1.4s; }
          .fcl-grid-bg {
            background-image:
              linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
              linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
            background-size: 56px 56px;
            -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%);
            mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%);
          }
          .fcl-zoom-text {
            background: linear-gradient(90deg, #60a5fa, #22d3ee, #f59e0b, #8b5cf6, #60a5fa);
            background-size: 300% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: fcl-color-shift 4s ease infinite, fcl-zoom-pulse 2.5s ease-in-out infinite;
            display: inline-block;
          }
          /* light mode: deeper colours so "FCL." pops on white */
          .fcl-light .fcl-zoom-text {
            background: linear-gradient(90deg, #1d4ed8, #0891b2, #d97706, #7c3aed, #1d4ed8);
            background-size: 300% auto;
            -webkit-background-clip: text;
            background-clip: text;
          }
          .fcl-mobile-glow { animation: mobile-glow 5s ease-in-out infinite; }
          @media (min-width: 640px) {
            .fcl-mobile-only { display: none !important; }
          }
        `}</style>

        {/* ================================================================
            DESKTOP HERO
            ================================================================ */}
        <section className="fcl-hero relative hidden min-h-[calc(100vh-76px)] overflow-hidden border-b sm:block">
          <div className="absolute inset-0 fcl-grid-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(37,99,235,0.12),transparent_34%)]" />
          <div className="fcl-orb-a absolute right-[-15%] top-[-20%] h-[650px] w-[650px] rounded-full bg-[#7c3aed]/10 blur-[130px]" />
          <div className="fcl-orb-b absolute left-[-20%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-[#1877F2]/10 blur-[130px]" />

          <div className="relative mx-auto min-h-[calc(100vh-76px)] max-w-[1500px] px-6 flex items-center">
            <div className="grid w-full items-center lg:grid-cols-[0.85fr_1.15fr] gap-12 py-12">
              <div ref={hero.ref} style={{ opacity: hero.visible ? 1 : 0, transform: hero.visible ? "translateY(0)" : "translateY(24px)" }} className="relative z-30 text-center transition-all duration-700 ease-out lg:text-left">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-4 py-2 backdrop-blur-xl">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_14px_rgba(34,197,94,0.8)]" />
                  <span className="fcl-blue1 text-[10px] font-bold uppercase tracking-[0.3em]">FCL • DIGITAL GATEWAY HUB</span>
                </div>
                <h2 className="fcl-head text-5xl font-black leading-[0.93] tracking-[-0.05em] sm:text-6xl md:text-7xl lg:text-[76px]">
                  <span className="block">THE GAME LIVES</span>
                  <span className="fcl-gradient-text block bg-gradient-to-r from-blue-600 via-[#1877F2] to-purple-600 bg-clip-text text-transparent">BEYOND THE FIELD.</span>
                  <span className="fcl-amber mt-4 block text-[0.42em] font-bold leading-tight tracking-[-0.02em]">One Game. One Community. <span className="fcl-zoom-text text-[1.45em] font-black tracking-[-0.04em]">FCL.</span></span>
                </h2>
                <p className="fcl-body mx-auto mt-6 max-w-[540px] text-sm leading-7 md:text-base lg:mx-0">Welcome to the official portal of Facebook Cricket League. Explore rankings, historical record cabinets, memories, and high-voltage match summaries through our dedicated gateways below.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:justify-start">
                  <a href="#gateways" className="group relative overflow-hidden rounded-xl bg-[#1877F2] px-7 py-3.5 text-center text-sm font-bold text-white shadow-[0_12px_40px_rgba(24,119,242,0.25)] transition hover:bg-[#0d6fe8]"><span className="relative z-10">Explore Portals ↓</span><span className="absolute inset-y-0 left-[-60%] w-1/2 -skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-[280%]" /></a>
                  <Link href="/bn" className="fcl-bn rounded-xl border border-blue-500/40 bg-blue-500/10 px-7 py-3.5 text-center text-sm font-bold transition hover:bg-[#1877F2]">💙 বাংলা ভার্সন</Link>
                </div>
              </div>

              <div ref={heroArt.ref} style={{ opacity: heroArt.visible ? 1 : 0, transform: heroArt.visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)" }} className="relative h-[420px] sm:h-[480px] lg:h-[550px] w-full transition-all duration-700 ease-out">
                <div className="fcl-frame absolute inset-0 overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] flex items-center justify-center p-4"><img src="/fcl-room.png" alt="FCL Room" className="h-full w-full object-contain object-center" /></div>
                <div className="fcl-chip fcl-pill fcl-pill-line absolute -left-2 sm:-left-6 top-6 sm:top-10 flex items-center gap-2.5 rounded-2xl border px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#22c55e]" /><div><span className="fcl-head text-[10px] sm:text-xs font-bold block">FCL LIVE</span><span className="fcl-blue1 text-[9px] sm:text-[10px]">Team Phoenix · 14/2</span></div></div>
                <div className="fcl-chip fcl-chip-delay fcl-pill absolute -right-2 sm:-right-4 top-24 sm:top-36 flex items-center gap-2 rounded-2xl border border-rose-500/40 px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white font-black text-xs">6</div><div><span className="fcl-rose text-[10px] sm:text-xs font-black block tracking-wider">OUT</span><span className="fcl-pill-sub text-[9px] sm:text-[10px]">Ball 1</span></div></div>
                <div className="fcl-chip fcl-pill absolute -left-2 sm:-left-6 bottom-16 sm:bottom-20 flex items-center gap-2 rounded-2xl border border-blue-500/40 px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1877F2] text-white font-black text-xs">4</div><div><span className="fcl-blue2 text-[10px] sm:text-xs font-bold block">+4 RUN</span><span className="fcl-pill-sub text-[9px] sm:text-[10px]">Ball 2</span></div></div>
                <div className="fcl-chip fcl-chip-delay fcl-pill absolute -right-2 sm:-right-4 bottom-4 sm:bottom-8 flex flex-col gap-0.5 rounded-2xl border border-amber-500/40 px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl"><div className="flex items-center gap-1.5"><span className="text-xs sm:text-sm">🎯</span><span className="fcl-amber text-[11px] sm:text-xs font-bold">Need 56 off 24</span></div><span className="fcl-pill-sub text-[10px] sm:text-[11px] font-semibold">Target 70</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            MOBILE HOME APP
            ================================================================ */}
        <section className="fcl-hero relative overflow-hidden border-b px-4 pb-7 pt-5 sm:hidden">
          <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-[90px]" />
          <div className="pointer-events-none absolute -left-28 bottom-0 h-64 w-64 rounded-full bg-purple-500/10 blur-[90px]" />
          <div className="mt-5 px-1">
            <span className="fcl-eyebrow text-[9px] font-black uppercase tracking-[0.28em]">FCL Digital Platform</span>
            <h2 className="fcl-head mt-2 text-[31px] font-black leading-[.98] tracking-[-0.045em]">THE GAME LIVES<br /><span className="bg-gradient-to-r from-blue-600 via-[#1877F2] to-purple-600 bg-clip-text text-transparent">BEYOND THE FIELD.</span></h2>
            <p className="fcl-body mt-3 max-w-[340px] text-[11px] leading-5">Explore the official FCL archive, players, rankings, records, memories and the online game.</p>
          </div>

          <div className="fcl-frame mt-5 overflow-hidden rounded-[22px]">
            <img src="/fcl-room.png" alt="FCL Online" className="h-[185px] w-full object-cover object-center" />
          </div>
        </section>

        {/* ================================================================
            DESKTOP PORTALS
            ================================================================ */}
        <section id="gateways" className="fcl-section relative hidden overflow-hidden px-6 py-28 sm:block">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[150px]" />
          <div className="mx-auto max-w-7xl relative z-10">
            <div ref={sectionHead.ref} style={{ opacity: sectionHead.visible ? 1 : 0, transform: sectionHead.visible ? "translateY(0)" : "translateY(24px)" }} className="text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ease-out">
              <span className="fcl-eyebrow text-xs font-bold uppercase tracking-[0.35em]">FCL Navigation Portals</span>
              <h3 className="fcl-head mt-3 text-4xl sm:text-5xl font-black tracking-tight">Choose Your Destination</h3>
              <p className="fcl-body mt-3 text-sm sm:text-base">Click any gateway below to enter the dedicated section instantly.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card, i) => <GatewayCard key={card.title} {...card} delay={i * 90} />)}
            </div>
          </div>
        </section>

        {/* ================================================================
            MOBILE PORTALS
            ================================================================ */}
        <section id="mobile-gateways" className="fcl-section relative overflow-hidden px-4 pb-8 pt-6 sm:hidden">
          <div className="mb-4 flex items-end justify-between px-1">
            <div>
              <span className="fcl-eyebrow text-[8px] font-black uppercase tracking-[0.28em]">FCL Navigation</span>
              <h3 className="fcl-head mt-1 text-[24px] font-black tracking-tight">Choose Your Destination</h3>
            </div>
            <span className="fcl-muted text-[9px] font-semibold">10 Portals</span>
          </div>

          <div className="space-y-3">
            {cards.map((card, i) => {
              const colors = ["#f59e0b", "#1877F2", "#ec4899", "#22c55e", "#f472b6", "#38bdf8", "#c084fc", "#1877F2", "#a855f7", "#22d3ee"];
              const color = colors[i];
              const content = (
                <div
                  className="fcl-mcard relative flex min-h-[112px] items-center gap-3.5 overflow-hidden rounded-[21px] border p-3.5"
                  style={{ "--c": color, borderColor: `${color}66` } as React.CSSProperties}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[17px] border" style={{ borderColor: `${color}55`, backgroundColor: `${color}15` }}>
                    <span className="text-[26px]">{card.badgeIcon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="fcl-ink rounded-md border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wide" style={{ borderColor: `${color}55`, backgroundColor: `${color}12` }}>{card.badgeText}</span>
                      {card.comingSoon && <span className="rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[7px] font-black text-purple-600">SOON</span>}
                    </div>
                    <h4 className="fcl-head mt-1.5 truncate text-[16px] font-black">{card.title}</h4>
                    <p className="fcl-body mt-1 line-clamp-2 text-[9px] leading-4">{card.description}</p>
                  </div>
                  <span className="fcl-ink shrink-0 text-lg font-black">{card.comingSoon ? "⚡" : "→"}</span>
                </div>
              );
              return card.comingSoon ? <div key={card.title}>{content}</div> : <Link key={card.title} href={card.href as string}>{content}</Link>;
            })}
          </div>
        </section>
      </main>
    </>
  );
}