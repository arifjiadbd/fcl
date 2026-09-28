"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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
        style={{
          borderColor: hover ? color : `${color}66`,
          boxShadow: hover ? `0 0 50px ${color}33, 0 30px 60px -20px ${color}40` : "none",
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${
            hover ? -8 : 0
          }px) scale(${hover ? 1.015 : 1})`,
          transition: hover
            ? "transform 80ms linear, box-shadow 300ms ease, border-color 300ms ease"
            : "transform 500ms cubic-bezier(.2,.8,.2,1), box-shadow 400ms ease, border-color 400ms ease",
        }}
        className={`group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[2.5rem] border-2 bg-gradient-to-b p-8 ${
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
        <div
          className="pointer-events-none absolute inset-y-0 left-[-60%] w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[220%]"
        />

        <div className="relative">
          <div className="flex items-center justify-between">
            <span
              className="rounded-xl border px-3.5 py-1.5 text-xs font-black uppercase"
              style={{ borderColor: `${color}80`, backgroundColor: `${color}22`, color }}
            >
              {badgeIcon} {badgeText}
            </span>
            <span className="text-2xl transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              {cornerIcon}
            </span>
          </div>
          <h4
            className="mt-8 text-2xl font-black text-white transition sm:text-3xl"
            style={{ color: hover ? color : undefined }}
          >
            {title}
          </h4>
          <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">{description}</p>
        </div>

        <div
          className="relative mt-8 flex items-center justify-between border-t pt-4"
          style={{ borderColor: `${color}33` }}
        >
          <span className="text-xs font-bold" style={{ color }}>
            {footerText}
          </span>
          <span
            className="transform text-lg font-black transition-transform duration-300 group-hover:translate-x-2"
            style={{ color }}
          >
            {comingSoon ? "⚡" : "→"}
          </span>
        </div>
      </Wrapper>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const hero = useReveal<HTMLDivElement>(0.05);
  const heroArt = useReveal<HTMLDivElement>(0.05);
  const sectionHead = useReveal<HTMLDivElement>(0.2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      color: "#22c55e",
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
      color: "#38bdf8",
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
      color: "#a855f7",
      badgeText: "THRILLER",
      badgeIcon: "⚡",
      cornerIcon: "🔥",
      title: "High Voltage Matches",
      description:
        "Relive the most intense nail-biting matches, thrilling finishes, and epic tournament battles. (Coming Soon)",
      footerText: "Coming Soon",
      comingSoon: true,
    },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-[#1877F2]/30 selection:text-white font-sans pb-20 sm:pb-0">
      <style jsx global>{`
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
            linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px);
          background-size: 56px 56px;
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%);
          mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%);
        }
        .fcl-zoom-text {
          background: linear-gradient(90deg, #60a5fa, #22d3ee, #f59e0b, #8b5cf6, #60a5fa);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fcl-color-shift 4s ease infinite, fcl-zoom-pulse 2.5s ease-in-out infinite;
          display: inline-block;
        }
        .fcl-mobile-glow { animation: mobile-glow 5s ease-in-out infinite; }
        @media (min-width: 640px) {
          .fcl-mobile-only { display: none !important; }
        }
      `}</style>

      {/* ================================================================
          DESKTOP / TABLET HEADER — intentionally unchanged
         ================================================================ */}
      <header
        className={`hidden sm:block sticky top-0 z-40 border-b transition-all duration-500 ${
          scrolled
            ? "border-[#1e293b] bg-[#020617]/90 backdrop-blur-xl py-1 shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
            : "border-[#1e293b]/60 bg-[#020617]/70 backdrop-blur-md py-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border border-[#1877F2]/40 bg-[#111936] shadow-lg shadow-[#1877F2]/10 transition-transform duration-300 hover:scale-105 hover:rotate-3">
              <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain p-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white">
                  Facebook <span className="text-[#1877F2]">Cricket League</span>
                </h1>
                <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#f59e0b]">FCL</span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#94a3b8]">Official FCL Digital Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="text-sm font-semibold text-white transition hover:text-[#1877F2]">Home</Link>
            <Link href="#gateways" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">Portals</Link>
            <Link href="/rules" className="text-sm font-medium text-[#38bdf8] transition hover:text-white">Rules & Formats</Link>
            <Link href="/players" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">Players</Link>
            <Link href="/rankings" className="text-sm font-medium text-[#f59e0b] transition hover:text-white">Rankings</Link>
            <Link href="/records" className="text-sm font-medium text-[#fbbf24] transition hover:text-white">Hall of Fame</Link>
            <Link href="/memories" className="text-sm font-bold text-[#f472b6] transition hover:text-white flex items-center gap-1">Memories 📖</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/bn" className="flex items-center gap-1.5 rounded-full border border-[#1877F2]/40 bg-gradient-to-r from-[#1877F2] to-[#166fe5] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:brightness-110 hover:shadow-[0_0_25px_rgba(24,119,242,0.5)] active:scale-95">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#1877F2]">f</span>
              <span>বাংলা ভার্সন</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#1e293b] bg-[#0b1220] text-white transition hover:border-[#1877F2]/50">
              {mobileMenuOpen ? <span className="text-xl font-bold">✕</span> : <span className="text-xl">☰</span>}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#1e293b] bg-[#030712] px-6 py-5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-[#1877F2]/10">🏠 Home</Link>
              <Link href="/bn" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#1877F2]/20 border border-[#1877F2]/40 px-3 py-2 text-sm font-bold text-[#60a5fa]">💙 বাংলা ভার্সন</Link>
              <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#60a5fa] hover:bg-[#1877F2]/10">👥 Players Directory</Link>
              <Link href="/rankings" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#f59e0b] hover:bg-[#f59e0b]/10">👑 Rankings & MVP</Link>
              <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#fbbf24] hover:bg-[#f59e0b]/10">🏆 Records & Hall of Fame</Link>
              <Link href="/memories" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-[#f472b6] hover:bg-[#f472b6]/10">📖 FCL Memories & Nostalgia</Link>
            </nav>
          </div>
        )}
      </header>

      {/* ================================================================
          MOBILE APP HEADER — only below 640px
         ================================================================ */}
      <header className="sm:hidden sticky top-0 z-50 border-b border-[#18233b] bg-[#050a17]/95 backdrop-blur-xl">
        <div className="flex h-[68px] items-center justify-between px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#1877F2]/40 bg-[#101a35] shadow-[0_0_18px_rgba(24,119,242,.16)]">
              <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain p-1" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[14px] font-extrabold tracking-tight text-white">Facebook Cricket League</span>
                <span className="rounded border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1 py-0.5 text-[7px] font-black text-[#f59e0b]">FCL</span>
              </div>
              <p className="text-[8px] font-medium text-[#64748b]">Official FCL Digital Platform</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/bn" aria-label="বাংলা ভার্সন" className="flex h-9 items-center gap-1 rounded-full border border-[#1877F2]/40 bg-[#1877F2]/15 px-2.5 text-[9px] font-bold text-[#60a5fa]">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1877F2] text-[8px] font-black text-white">f</span>
              বাংলা
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1e293b] bg-[#0b1220] text-white">
              {mobileMenuOpen ? <span className="text-base font-bold">✕</span> : <span className="text-lg">☰</span>}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="border-t border-[#18233b] bg-[#070d1b] px-4 py-3 shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/rules" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3 py-2.5 text-[11px] font-semibold text-[#38bdf8]">⚖️ Rules & Formats</Link>
              <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3 py-2.5 text-[11px] font-semibold text-[#fbbf24]">🏆 Hall of Fame</Link>
              <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3 py-2.5 text-[11px] font-semibold text-[#60a5fa]">👥 Players</Link>
              <Link href="/memories" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3 py-2.5 text-[11px] font-semibold text-[#f472b6]">📖 Memories</Link>
            </div>
          </nav>
        )}
      </header>

      {/* ================================================================
          DESKTOP HERO — unchanged visual structure
         ================================================================ */}
      <section className="relative hidden min-h-[calc(100vh-76px)] overflow-hidden border-b border-[#172033] bg-[#02050b] sm:block">
        <div className="absolute inset-0 bg-[#02050b]" />
        <div className="absolute inset-0 fcl-grid-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(37,99,235,0.16),transparent_34%)]" />
        <div className="fcl-orb-a absolute right-[-15%] top-[-20%] h-[650px] w-[650px] rounded-full bg-[#7c3aed]/10 blur-[130px]" />
        <div className="fcl-orb-b absolute left-[-20%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-[#1877F2]/10 blur-[130px]" />

        <div className="relative mx-auto min-h-[calc(100vh-76px)] max-w-[1500px] px-6 flex items-center">
          <div className="grid w-full items-center lg:grid-cols-[0.85fr_1.15fr] gap-12 py-12">
            <div ref={hero.ref} style={{ opacity: hero.visible ? 1 : 0, transform: hero.visible ? "translateY(0)" : "translateY(24px)" }} className="relative z-30 text-center transition-all duration-700 ease-out lg:text-left">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_14px_rgba(34,197,94,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#93c5fd]">FCL • DIGITAL GATEWAY HUB</span>
              </div>
              <h2 className="text-5xl font-black leading-[0.93] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl lg:text-[76px]">
                <span className="block">THE GAME LIVES</span>
                <span className="fcl-gradient-text block bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">BEYOND THE FIELD.</span>
                <span className="mt-4 block text-[0.42em] font-bold leading-tight tracking-[-0.02em] text-[#f59e0b]">One Game. One Community. <span className="fcl-zoom-text text-[1.45em] font-black tracking-[-0.04em]">FCL.</span></span>
              </h2>
              <p className="mx-auto mt-6 max-w-[540px] text-sm leading-7 text-[#94a3b8] md:text-base lg:mx-0">Welcome to the official portal of Facebook Cricket League. Explore rankings, historical record cabinets, memories, and high-voltage match summaries through our dedicated gateways below.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <a href="#gateways" className="group relative overflow-hidden rounded-xl bg-[#1877F2] px-7 py-3.5 text-center text-sm font-bold text-white shadow-[0_12px_40px_rgba(24,119,242,0.25)] transition hover:bg-[#0d6fe8] hover:shadow-[0_18px_55px_rgba(24,119,242,0.4)]"><span className="relative z-10">Explore Portals ↓</span><span className="absolute inset-y-0 left-[-60%] w-1/2 -skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-[280%]" /></a>
                <Link href="/bn" className="rounded-xl border border-[#1877F2]/40 bg-[#1877F2]/15 px-7 py-3.5 text-center text-sm font-bold text-[#60a5fa] transition hover:bg-[#1877F2] hover:text-white">💙 বাংলা ভার্সন</Link>
              </div>
            </div>

            <div ref={heroArt.ref} style={{ opacity: heroArt.visible ? 1 : 0, transform: heroArt.visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)" }} className="relative h-[420px] sm:h-[480px] lg:h-[550px] w-full transition-all duration-700 ease-out">
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] border border-white/[0.08] bg-[#080d17] shadow-[0_40px_120px_rgba(0,0,0,0.7)] flex items-center justify-center p-4"><img src="/fcl-room.png" alt="FCL Room" className="h-full w-full object-contain object-center" /></div>
              <div className="fcl-chip absolute -left-2 sm:-left-6 top-6 sm:top-10 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0b1220]/90 px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl shadow-2xl"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.8)]" /><div><span className="text-[10px] sm:text-xs font-bold text-white block">FCL LIVE</span><span className="text-[9px] sm:text-[10px] text-[#93c5fd]">Team Phoenix · 14/2</span></div></div>
              <div className="fcl-chip fcl-chip-delay absolute -right-2 sm:-right-4 top-24 sm:top-36 flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-[#0b1220]/90 px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl shadow-2xl"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white font-black text-xs shadow-[0_0_10px_rgba(244,63,94,0.6)]">6</div><div><span className="text-[10px] sm:text-xs font-black text-rose-400 block tracking-wider">OUT</span><span className="text-[9px] sm:text-[10px] text-[#94a3b8]">Ball 1</span></div></div>
              <div className="fcl-chip absolute -left-2 sm:-left-6 bottom-16 sm:bottom-20 flex items-center gap-2 rounded-2xl border border-blue-500/40 bg-[#0b1220]/90 px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl shadow-2xl"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1877F2] text-white font-black text-xs shadow-[0_0_10px_rgba(24,119,242,0.6)]">4</div><div><span className="text-[10px] sm:text-xs font-bold text-[#60a5fa] block">+4 RUN</span><span className="text-[9px] sm:text-[10px] text-[#94a3b8]">Ball 2</span></div></div>
              <div className="fcl-chip fcl-chip-delay absolute -right-2 sm:-right-4 bottom-4 sm:bottom-8 flex flex-col gap-0.5 rounded-2xl border border-[#f59e0b]/30 bg-[#0b1220]/90 px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl shadow-2xl"><div className="flex items-center gap-1.5"><span className="text-xs sm:text-sm">🎯</span><span className="text-[11px] sm:text-xs font-bold text-[#fbbf24]">Need 56 off 24</span></div><span className="text-[10px] sm:text-[11px] font-semibold text-[#94a3b8]">Target 70</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          MOBILE HOME APP — only below 640px
         ================================================================ */}
      <section className="relative overflow-hidden border-b border-[#172033] bg-[#02050b] px-4 pb-7 pt-5 sm:hidden">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#1877F2]/15 blur-[90px] fcl-mobile-glow" />
        <div className="pointer-events-none absolute -left-28 bottom-0 h-64 w-64 rounded-full bg-[#7c3aed]/10 blur-[90px]" />

        <div className="relative rounded-[25px] border border-[#25345a] bg-gradient-to-b from-[#101a36] to-[#080f20] p-4 shadow-[0_22px_70px_rgba(0,0,0,.45)]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-[#fbbf24]">✨ Digital FCL Arena</span>
            <Link href="/rules" className="rounded-full border border-[#64748b]/30 bg-[#0b1220]/80 px-2.5 py-1 text-[8px] font-bold text-[#94a3b8]">ⓘ FCL Rules</Link>
          </div>
          <p className="mt-3 text-[11px] font-medium leading-5 text-[#cbd5e1]">Official Facebook Cricket League digital platform</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-lg bg-[#1877F2]/10 px-2 py-1 text-[8px] font-bold text-[#60a5fa]">2 Overs</span>
            <span className="rounded-lg bg-[#22c55e]/10 px-2 py-1 text-[8px] font-bold text-[#4ade80]">3 Wickets</span>
            <span className="rounded-lg bg-[#f59e0b]/10 px-2 py-1 text-[8px] font-bold text-[#fbbf24]">No. 5</span>
            <span className="rounded-lg bg-[#a855f7]/10 px-2 py-1 text-[8px] font-bold text-[#c084fc]">Auto Umpire</span>
          </div>
        </div>

        <div className="mt-5 px-1">
          <span className="text-[9px] font-black uppercase tracking-[0.28em] text-[#38bdf8]">FCL Digital Platform</span>
          <h2 className="mt-2 text-[31px] font-black leading-[.98] tracking-[-0.045em] text-white">THE GAME LIVES<br /><span className="bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#a78bfa] bg-clip-text text-transparent">BEYOND THE FIELD.</span></h2>
          <p className="mt-3 max-w-[340px] text-[11px] leading-5 text-[#94a3b8]">Explore the official FCL archive, players, rankings, records, memories and the online game.</p>
        </div>

        <div className="mt-5 overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#080d17] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <img src="/fcl-room.png" alt="FCL Online" className="h-[185px] w-full object-cover object-center" />
        </div>
      </section>

      {/* ================================================================
          DESKTOP PORTALS — original grid preserved
         ================================================================ */}
      <section id="gateways" className="relative hidden overflow-hidden bg-[#020617] px-6 py-28 sm:block">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#1877F2]/10 blur-[150px]" />
        <div className="mx-auto max-w-7xl relative z-10">
          <div ref={sectionHead.ref} style={{ opacity: sectionHead.visible ? 1 : 0, transform: sectionHead.visible ? "translateY(0)" : "translateY(24px)" }} className="text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ease-out">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#38bdf8]">FCL Navigation Portals</span>
            <h3 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-white">Choose Your Destination</h3>
            <p className="mt-3 text-sm sm:text-base text-[#94a3b8]">Click any gateway below to enter the dedicated section instantly.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, i) => <GatewayCard key={card.title} {...card} delay={i * 90} />)}
          </div>
        </div>
      </section>

      {/* ================================================================
          MOBILE PORTALS — compact app cards
         ================================================================ */}
      <section id="mobile-gateways" className="relative overflow-hidden bg-[#020617] px-4 pb-8 pt-6 sm:hidden">
        <div className="mb-4 flex items-end justify-between px-1">
          <div>
            <span className="text-[8px] font-black uppercase tracking-[0.28em] text-[#38bdf8]">FCL Navigation</span>
            <h3 className="mt-1 text-[24px] font-black tracking-tight text-white">Choose Your Destination</h3>
          </div>
          <span className="text-[9px] font-semibold text-[#64748b]">7 Portals</span>
        </div>

        <div className="space-y-3">
          {cards.map((card, i) => {
            const colors = ["#f59e0b", "#1877F2", "#f472b6", "#22c55e", "#38bdf8", "#1877F2", "#a855f7"];
            const color = colors[i];
            const content = (
              <div className="relative flex min-h-[112px] items-center gap-3.5 overflow-hidden rounded-[21px] border bg-[#081020] p-3.5 shadow-[0_12px_35px_rgba(0,0,0,.2)]" style={{ borderColor: `${color}66` }}>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[17px] border" style={{ borderColor: `${color}55`, backgroundColor: `${color}15` }}>
                  <span className="text-[26px]">{card.badgeIcon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wide" style={{ borderColor: `${color}55`, backgroundColor: `${color}12`, color }}>{card.badgeText}</span>
                    {card.comingSoon && <span className="rounded-md bg-[#a855f7]/10 px-1.5 py-0.5 text-[7px] font-black text-[#c084fc]">SOON</span>}
                  </div>
                  <h4 className="mt-1.5 truncate text-[16px] font-black text-white">{card.title}</h4>
                  <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-[#94a3b8]">{card.description}</p>
                </div>
                <span className="shrink-0 text-lg font-black" style={{ color }}>{card.comingSoon ? "⚡" : "→"}</span>
              </div>
            );
            return card.comingSoon ? <div key={card.title}>{content}</div> : <Link key={card.title} href={card.href as string}>{content}</Link>;
          })}
        </div>
      </section>

      {/* Footer — desktop unchanged, compact mobile version */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-4 py-7 sm:px-6 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center md:flex-row md:text-left">
          <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
          <p className="text-[10px] text-[#64748b] sm:text-xs">© 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.</p>
        </div>
      </footer>

      {/* ================================================================
          MOBILE FIXED BOTTOM NAV — no Profile/Online because those pages
          do not exist on the current site.
         ================================================================ */}
      <nav className="fixed bottom-0 left-0 right-0 z-[60] border-t border-[#1e293b] bg-[#050a17]/95 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl shadow-[0_-12px_40px_rgba(0,0,0,.45)] sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          <Link href="/" className="flex flex-col items-center gap-1 py-1 text-[#60a5fa]">
            <span className="flex h-7 items-center text-[20px]">⌂</span>
            <span className="text-[8px] font-bold">Home</span>
          </Link>
          <Link href="/play" className="flex flex-col items-center gap-1 py-1 text-[#64748b] transition hover:text-[#60a5fa]">
            <span className="flex h-7 items-center text-[18px]">🎮</span>
            <span className="text-[8px] font-semibold">Play</span>
          </Link>
          <Link href="/players" className="flex flex-col items-center gap-1 py-1 text-[#64748b] transition hover:text-[#60a5fa]">
            <span className="flex h-7 items-center text-[18px]">👥</span>
            <span className="text-[8px] font-semibold">Players</span>
          </Link>
          <Link href="/rankings" className="flex flex-col items-center gap-1 py-1 text-[#64748b] transition hover:text-[#fbbf24]">
            <span className="flex h-7 items-center text-[18px]">🏆</span>
            <span className="text-[8px] font-semibold">Ranking</span>
          </Link>
          <Link href="/memories" className="flex flex-col items-center gap-1 py-1 text-[#64748b] transition hover:text-[#f472b6]">
            <span className="flex h-7 items-center text-[18px]">📖</span>
            <span className="text-[8px] font-semibold">Memories</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
