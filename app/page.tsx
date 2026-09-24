"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";

interface Player {
  id?: number;
  name: string;
  nickName?: string;
  role: string;
  totalTournament?: number;
  matches: number;
  runs: number;
  wickets: number;
  innings?: number;
  notOut?: number;
  fours?: number;
  sixes?: number;
  hatTricks?: number;
  mom?: number;
  cpom?: number;
  mot?: number;
  cpot?: number;
  champion?: number;
  runnersUp?: number;
  totalFinal?: number;
  lastPlayed?: string;
  highestRunScorer?: number;
  topWicketTaker?: number;
  debutYear?: string;
  debutTournament?: string;
  debutTeam?: string;
  maxRuns?: number;
  maxWickets?: number;
  runAvg?: string;
  wkAvg?: string;
  photoUrl?: string;
}

// 🎯 FCL 100% Authentic Tournament Point Formula
export const calculateFclPoints = (p: Player): number => {
  const runs = Number(p.runs) || 0;
  const sixes = Number(p.sixes) || 0;
  const fours = Number(p.fours) || 0;
  const wickets = Number(p.wickets) || 0;
  const matches = Number(p.matches) || 0;
  const champion = Number(p.champion) || 0;
  const runnersUp = Number(p.runnersUp) || 0;
  const motCpot = (Number(p.mot) || 0) + (Number(p.cpot) || 0);
  const highestRuns = Number(p.highestRunScorer) || 0;
  const topWickets = Number(p.topWicketTaker) || 0;

  return Math.round(
    runs * 1 +
    sixes * 2 +
    fours * 1 +
    wickets * 20 +
    matches * 2 +
    champion * 100 +
    runnersUp * 40 +
    motCpot * 60 +
    highestRuns * 30 +
    topWickets * 30
  );
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [playersData, setPlayersData] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [downloading, setDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlayersData(data);
        } else if (data.players && Array.isArray(data.players)) {
          setPlayersData(data.players);
        }
      })
      .catch((err) => console.error("Error fetching live Excel data:", err));
  }, []);

  const handleDownloadCard = async () => {
    if (!cardRef.current || !selectedPlayer) return;

    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      const safeName = (selectedPlayer.nickName || selectedPlayer.name || "player")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
      link.download = `fcl-stat-card-${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export card image:", err);
      alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setDownloading(false);
    }
  };

  // 🔥 Top 3 All-Time MVPs
  const top3Mvp = [...playersData]
    .sort((a, b) => calculateFclPoints(b) - calculateFclPoints(a))
    .slice(0, 3);

  // 8 Iconic Record Pillars
  const mostChampionshipPlayer = [...playersData].sort((a, b) => (b.champion || 0) - (a.champion || 0))[0];
  const topRunScorer = [...playersData].sort((a, b) => b.runs - a.runs)[0];
  const topWicketTaker = [...playersData].sort((a, b) => b.wickets - a.wickets)[0];
  const mostFinalsPlayer = [...playersData].sort((a, b) => (b.totalFinal || 0) - (a.totalFinal || 0))[0];
  const mostMatchesPlayer = [...playersData].sort((a, b) => b.matches - a.matches)[0];
  const mostSixesPlayer = [...playersData].sort((a, b) => (b.sixes || 0) - (a.sixes || 0))[0];
  const topHatTrickPlayer = [...playersData].sort((a, b) => (b.hatTricks || 0) - (a.hatTricks || 0))[0];
  const mostMotPlayer = [...playersData].sort((a, b) => ((b.mot || 0) + (b.cpot || 0)) - ((a.mot || 0) + (a.cpot || 0)))[0];

  const totalCommunityRuns = playersData.reduce((acc, curr) => acc + (curr.runs || 0), 0);
  const totalCommunityWickets = playersData.reduce((acc, curr) => acc + (curr.wickets || 0), 0);

  const getRank = (player: Player, type: "mvp" | "runs" | "wickets" | "sixes" | "champion") => {
    const sorted = [...playersData].sort((a, b) => {
      if (type === "mvp") return calculateFclPoints(b) - calculateFclPoints(a);
      if (type === "runs") return b.runs - a.runs;
      if (type === "wickets") return b.wickets - a.wickets;
      if (type === "sixes") return (b.sixes || 0) - (a.sixes || 0);
      if (type === "champion") return (b.champion || 0) - (a.champion || 0);
      return 0;
    });
    const index = sorted.findIndex((p) => p.name === player.name);
    return index !== -1 ? index + 1 : "—";
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-[#1877F2]/30 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border border-[#1877F2]/40 bg-[#111936] shadow-lg shadow-[#1877F2]/10">
              <img
                src="/fcl-logo.png"
                alt="FCL Logo"
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-xl">🏏</span>';
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white">
                  Facebook <span className="text-[#1877F2]">Cricket League</span>
                </h1>
                <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#f59e0b]">
                  FCL
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#94a3b8]">Official FCL Digital Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="text-sm font-semibold text-white transition hover:text-[#1877F2]">
              Home
            </Link>
            <Link href="#about" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">
              About FCL
            </Link>
            <Link href="/rules" className="text-sm font-medium text-[#38bdf8] transition hover:text-white">
              Rules & Formats
            </Link>
            <Link href="/players" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">
              Players
            </Link>
            <Link href="/rankings" className="text-sm font-medium text-[#f59e0b] transition hover:text-white">
              Rankings & MVP
            </Link>
            <Link href="/records" className="text-sm font-medium text-[#fbbf24] transition hover:text-white">
              Hall of Fame
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-3 py-1.5 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#1877F2] shadow-lg shadow-[#1877F2]" />
              <span className="text-xs font-semibold text-[#1877F2]">Live</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e293b] bg-[#0b1220] text-white transition hover:border-[#1877F2]/50 lg:hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <span className="text-xl font-bold">✕</span> : <span className="text-xl">☰</span>}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#1e293b] bg-[#030712] px-6 py-5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1877F2]/10">
                🏠 Home
              </Link>
              <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#94a3b8] transition hover:bg-[#1877F2]/10">
                ℹ️ About FCL
              </Link>
              <Link href="/rules" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#38bdf8] transition hover:bg-[#1877F2]/10">
                📜 Rules & Match Formats
              </Link>
              <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#60a5fa] transition hover:bg-[#1877F2]/10">
                👥 Players Directory
              </Link>
              <Link href="/rankings" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#f59e0b] transition hover:bg-[#f59e0b]/10">
                👑 All-Time Rankings & MVP
              </Link>
              <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#fbbf24] transition hover:bg-[#f59e0b]/10">
                🏆 Records & Hall of Fame
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[calc(100vh-76px)] overflow-hidden border-b border-[#172033] bg-[#02050b]">
        <div className="absolute inset-0 bg-[#02050b]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(37,99,235,0.16),transparent_34%)]" />
        <div className="absolute right-[-15%] top-[-20%] h-[650px] w-[650px] rounded-full bg-[#7c3aed]/10 blur-[130px]" />
        <div className="absolute left-[-20%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-[#1877F2]/10 blur-[130px]" />

        <div className="relative mx-auto min-h-[calc(100vh-76px)] max-w-[1500px] px-6">
          <div className="grid min-h-[calc(100vh-76px)] items-center lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative z-30 py-20 text-center lg:text-left">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_14px_rgba(34,197,94,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#93c5fd]">
                  FCL • VIRTUAL CRICKET
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.38em] text-[#64748b]">Facebook Cricket League</p>

              <h2 className="mt-5 text-5xl font-black leading-[0.91] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl lg:text-[78px]">
                <span className="block">THE GAME LIVES</span>
                <span className="block bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">
                  BEYOND THE FIELD.
                </span>
                <span className="mt-4 block text-[0.42em] font-bold leading-tight tracking-[-0.02em] text-[#f59e0b]">
                  One Game. One Community.{" "}
                  <span className="inline-block text-[1.45em] font-black tracking-[-0.04em] text-transparent bg-gradient-to-r from-[#60a5fa] via-[#22d3ee] to-[#8b5cf6] bg-clip-text drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] animate-[fclPulse_2.2s_ease-in-out_infinite]">
                    FCL.
                  </span>
                </span>
              </h2>

              <p className="mx-auto mt-7 max-w-[540px] text-sm leading-7 text-[#94a3b8] md:text-base lg:mx-0">
                From different districts of Bangladesh to different corners of the world, we play, compete and connect
                through FCL. Distance may separate us, but the game brings us together.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/players"
                  className="group relative overflow-hidden rounded-xl bg-[#1877F2] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_rgba(24,119,242,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#0d6fe8]"
                >
                  <span className="relative z-10">Explore Players & Cards →</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full" />
                </Link>

                <Link
                  href="/rankings"
                  className="rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-7 py-3.5 text-sm font-bold text-[#fbbf24] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-[#f59e0b] hover:text-black"
                >
                  👑 All-Time MVP & Rankings
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#475569]">Connected from</span>
                <span className="rounded-full border border-[#1e293b] bg-[#0b1220]/80 px-3 py-1.5 text-[10px] text-[#cbd5e1]">
                  🇧🇩 Bangladesh
                </span>
                <span className="text-[#334155]">+</span>
                <span className="rounded-full border border-[#1e293b] bg-[#0b1220]/80 px-3 py-1.5 text-[10px] text-[#cbd5e1]">
                  🌍 Abroad
                </span>
                <span className="text-[#334155]">→</span>
                <span className="rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-3 py-1.5 text-[10px] font-bold text-[#60a5fa]">
                  ONE COMMUNITY
                </span>
              </div>

              <div className="mt-9 flex max-w-[460px] divide-x divide-[#1e293b] rounded-2xl border border-[#1e293b] bg-[#0b1220]/70 px-2 py-4 backdrop-blur-xl">
                <div className="w-1/3 px-4">
                  <p className="text-xl font-black text-white">{playersData.length || "211+"}</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#64748b]">Players</p>
                </div>
                <div className="w-1/3 px-4">
                  <p className="text-xl font-black text-[#22c55e]">24+</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#64748b]">Tournaments</p>
                </div>
                <div className="w-1/3 px-4">
                  <p className="text-xl font-black text-[#f59e0b]">2013-26</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#64748b]">Active Era</p>
                </div>
              </div>
            </div>

            <div className="relative h-[680px] w-full hidden sm:block">
              <div className="absolute inset-y-[30px] right-[-40px] w-[760px] overflow-hidden rounded-[3rem] border border-white/[0.08] bg-[#080d17] shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
                <img
                  src="/fcl-room.png"
                  alt="Young player playing FCL virtual cricket on smartphone"
                  className="h-full w-full object-contain object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#02050b] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02050b]/80 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#1877F2]/5 via-transparent to-[#7c3aed]/10" />
              </div>

              <div className="absolute left-[4%] top-[21%] z-30 animate-[fclFloat_4s_ease-in-out_infinite] rounded-2xl border border-[#22c55e]/30 bg-[#06131c]/95 px-5 py-4 shadow-[0_15px_45px_rgba(34,197,94,0.12)] backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#4ade80]">FCL LIVE</span>
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <p className="text-3xl font-black text-white">
                    14<span className="text-[#ef4444]">/2</span>
                  </p>
                  <p className="mb-1 text-[8px] font-bold text-[#64748b]">1.0 OV</p>
                </div>
                <p className="mt-1 text-[8px] text-[#64748b]">Team Phoenix</p>
              </div>

              <div className="absolute right-[1%] top-[34%] z-40 animate-[fclFloat_5s_ease-in-out_infinite_reverse] rounded-2xl border border-[#1877F2]/30 bg-[#07101f]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2]/15 text-sm font-black text-[#60a5fa]">
                    4
                  </div>
                  <div>
                    <p className="text-base font-black text-[#4ade80]">+4 RUN</p>
                    <p className="text-[7px] text-[#64748b]">Bat ≠ Ball</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[22%] left-[3%] z-40 animate-[fclFloat_5s_ease-in-out_infinite] rounded-2xl border border-[#ef4444]/30 bg-[#180910]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ef4444]/15 text-sm font-black text-[#f87171]">
                    6
                  </div>
                  <div>
                    <p className="text-base font-black text-[#f87171]">OUT</p>
                    <p className="text-[7px] text-[#64748b]">Bat = Ball</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[10%] right-[9%] z-50 w-[220px] rounded-2xl border border-[#334155] bg-[#020617]/95 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">FCL MATCH</p>
                    <p className="mt-1 text-xs font-black text-white">#104</p>
                  </div>
                  <span className="rounded-full bg-[#22c55e]/10 px-2 py-1 text-[7px] font-bold text-[#4ade80]">
                    LIVE
                  </span>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-[7px] font-bold uppercase tracking-widest text-[#64748b]">Bat Sequence</p>
                  <div className="grid grid-cols-6 gap-1">
                    {["6", "4", "3", "2", "1", "6"].map((num, index) => (
                      <div
                        key={index}
                        className="flex h-7 items-center justify-center rounded-lg border border-[#1877F2]/20 bg-[#1877F2]/10 text-[9px] font-black text-[#60a5fa]"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#1e293b] pt-3">
                  <span className="text-[8px] text-[#64748b]">CURRENT SCORE</span>
                  <span className="text-sm font-black text-white">14 / 2</span>
                </div>
              </div>

              <div className="absolute bottom-[4%] left-[12%] z-40 rounded-2xl border border-[#334155] bg-[#07101f]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <p className="text-[7px] font-bold uppercase tracking-widest text-[#64748b]">FCL COMMUNITY</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm">🇧🇩</span>
                  <span className="text-[10px] font-bold text-white">Bangladesh</span>
                  <span className="text-[#475569]">•</span>
                  <span className="text-sm">🌍</span>
                  <span className="text-[10px] font-bold text-white">Worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[#1e293b]/70 bg-[#020617]/75 backdrop-blur-xl">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-[#1e293b] md:grid-cols-4">
            <div className="px-5 py-3 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">VIRTUAL CRICKET</p>
              <p className="mt-1 text-[11px] font-semibold text-white">Play Anywhere</p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">COMMUNITY</p>
              <p className="mt-1 text-[11px] font-semibold text-white">Connected Through FCL</p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">LOCATIONS</p>
              <p className="mt-1 text-[11px] font-semibold text-white">Bangladesh + Abroad</p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">FCL SPIRIT</p>
              <p className="mt-1 text-[11px] font-semibold text-[#f59e0b]">Unity Through FCL</p>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fclFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          @keyframes fclPulse {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.12); filter: brightness(1.35); }
          }
        `}</style>
      </section>

      {/* ABOUT FCL */}
      <section id="about" className="relative overflow-hidden border-b border-[#172033] bg-[#030712] py-24">
        <div className="absolute left-[-180px] top-20 h-[400px] w-[400px] rounded-full bg-[#1877F2]/10 blur-[120px]" />
        <div className="absolute right-[-180px] bottom-10 h-[400px] w-[400px] rounded-full bg-[#7c3aed]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-[1200px] px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#60a5fa]">About FCL</span>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
              Cricket Beyond{" "}
              <span className="bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">
                The Field.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#94a3b8] md:text-base">
              Facebook Cricket League is a virtual cricket community where players compete through numbers, strategy
              and teamwork.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#1877F2]/40 hover:bg-[#0d1627]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1877F2]/20 bg-[#1877F2]/10 text-2xl">
                🏏
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Virtual Cricket</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                A unique cricket format played through numbers, decisions and strategy instead of a physical field.
              </p>
            </div>

            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#22d3ee]/40 hover:bg-[#0d1627]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#22d3ee]/20 bg-[#22d3ee]/10 text-2xl">
                🌍
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">One Community</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                Players connect from different districts of Bangladesh and from different corners of the world.
              </p>
            </div>

            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/40 hover:bg-[#0d1627]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f59e0b]/20 bg-[#f59e0b]/10 text-2xl">
                🤝
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Unity Through FCL</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                Competition, friendship and fun — bringing people together through one shared game.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-[#1877F2]/30 bg-gradient-to-r from-[#0b1220] via-[#0d1830] to-[#0b1220] p-6 sm:p-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">Rulebook & Formats</span>
              <h4 className="text-xl font-bold text-white mt-1">Want to learn how to play FCL?</h4>
              <p className="text-xs text-[#94a3b8] mt-1">Check out T20, ODI, Test match systems and Power Play rules.</p>
            </div>
            <Link
              href="/rules"
              className="shrink-0 rounded-xl bg-[#1877F2] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:bg-[#0d6fe8]"
            >
              Official Rules Guide →
            </Link>
          </div>
        </div>
      </section>

      {/* 🌟 ALL-TIME TOP 3 MVP PODIUM (GOLD, SILVER, BRONZE) */}
      <section id="mvp-podium" className="relative overflow-hidden border-t border-[#172033] bg-[#020617] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[#f59e0b]/10 blur-[130px]" />

          <div className="relative mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#f59e0b] shadow-lg shadow-[#f59e0b]/60 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f59e0b]">
                  FCL Pinnacle Rating
                </p>
              </div>
              <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                All-Time Top 3 MVP Legends
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                The highest-impact players in FCL history, dynamically evaluated through total runs, wickets, tournament championships, and awards. Click any card to inspect full stats.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/rankings"
                className="rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-5 py-2.5 text-xs font-extrabold text-[#fbbf24] shadow-lg shadow-[#f59e0b]/15 transition hover:bg-[#f59e0b] hover:text-black"
              >
                👑 View Complete MVP Leaderboard →
              </Link>
            </div>
          </div>

          {/* 3 PODIUM CARDS: GOLD (#1), SILVER (#2), BRONZE (#3) */}
          <div className="relative grid gap-6 md:grid-cols-3">
            {top3Mvp.map((player, idx) => {
              const rank = idx + 1;
              const points = calculateFclPoints(player);

              const badgeColors =
                rank === 1
                  ? {
                      border: "border-2 border-[#f59e0b]/60 hover:border-[#f59e0b]",
                      bg: "bg-gradient-to-b from-[#241804] via-[#140e02] to-[#070501]",
                      shadow: "hover:shadow-2xl hover:shadow-[#f59e0b]/25",
                      tag: "border-[#f59e0b]/40 bg-[#f59e0b]/20 text-[#fbbf24]",
                      badge: "bg-[#f59e0b] text-black shadow-md shadow-[#f59e0b]/30",
                      glow: "via-[#f59e0b]",
                      highlight: "text-[#fbbf24] drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]",
                      icon: "👑",
                      label: "GOLD MEDALIST • #01 MVP",
                    }
                  : rank === 2
                  ? {
                      border: "border border-[#94a3b8]/50 hover:border-white",
                      bg: "bg-gradient-to-b from-[#1b2230] via-[#0d121c] to-[#04060a]",
                      shadow: "hover:shadow-2xl hover:shadow-[#94a3b8]/20",
                      tag: "border-[#94a3b8]/40 bg-[#94a3b8]/20 text-[#e2e8f0]",
                      badge: "bg-[#cbd5e1] text-black shadow-md shadow-[#cbd5e1]/30",
                      glow: "via-[#cbd5e1]",
                      highlight: "text-[#f1f5f9] drop-shadow-[0_0_15px_rgba(203,213,225,0.4)]",
                      icon: "🥈",
                      label: "SILVER MEDALIST • #02 MVP",
                    }
                  : {
                      border: "border border-[#d97706]/40 hover:border-[#f59e0b]/80",
                      bg: "bg-gradient-to-b from-[#211406] via-[#120a02] to-[#050301]",
                      shadow: "hover:shadow-2xl hover:shadow-[#d97706]/20",
                      tag: "border-[#d97706]/40 bg-[#d97706]/20 text-[#fcd34d]",
                      badge: "bg-[#b45309] text-white shadow-md shadow-[#b45309]/30",
                      glow: "via-[#d97706]",
                      highlight: "text-[#fbbf24] drop-shadow-[0_0_15px_rgba(217,119,6,0.4)]",
                      icon: "🥉",
                      label: "BRONZE MEDALIST • #03 MVP",
                    };

              return (
                <div
                  key={player.name + idx}
                  onClick={() => setSelectedPlayer(player)}
                  className={`group relative cursor-pointer overflow-hidden rounded-3xl ${badgeColors.border} ${badgeColors.bg} p-6 transition-all duration-300 hover:-translate-y-2 ${badgeColors.shadow}`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent ${badgeColors.glow} to-transparent`}
                  />

                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${badgeColors.tag}`}
                    >
                      {badgeColors.icon} {badgeColors.label}
                    </span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black ${badgeColors.badge}`}
                    >
                      #{rank}
                    </span>
                  </div>

                  {/* Profile Header */}
                  <div className="mt-6 flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/10 bg-[#0b1329] p-0.5 shadow-lg group-hover:scale-105 transition">
                      <img
                        src={`/players/${(player.nickName || "").toLowerCase().trim()}.jpg`}
                        alt={player.name}
                        className="h-full w-full rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = `<div class="flex h-full w-full items-center justify-center text-3xl">${badgeColors.icon}</div>`;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xl font-black text-white group-hover:text-[#60a5fa] transition break-words leading-snug">
                        {player.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#94a3b8] truncate mt-0.5">
                        @{player.nickName || player.name} • {player.role || "All-Rounder"}
                      </p>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        {player.matches} Matches • {player.champion || 0}x Champion
                      </p>
                    </div>
                  </div>

                  {/* 🔥 HIGHLIGHTED MVP POINTS HERO BOX */}
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/60 p-4 text-center">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#94a3b8]">
                      All-Time Performance Rating
                    </p>
                    <p className={`mt-1 text-3xl sm:text-4xl font-black ${badgeColors.highlight}`}>
                      {points.toLocaleString()} <span className="text-sm font-bold text-[#94a3b8]">PTS</span>
                    </p>
                  </div>

                  {/* Key Supporting Numbers */}
                  <div className="mt-4 grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                      <p className="text-base font-black text-[#22c55e]">{player.runs?.toLocaleString() ?? 0}</p>
                      <p className="text-[9px] uppercase tracking-wider text-[#64748b] mt-0.5">Runs</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                      <p className="text-base font-black text-[#f59e0b]">{player.wickets ?? 0}</p>
                      <p className="text-[9px] uppercase tracking-wider text-[#64748b] mt-0.5">Wickets</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                      <p className="text-base font-black text-[#38bdf8]">{player.champion ?? 0}x</p>
                      <p className="text-[9px] uppercase tracking-wider text-[#64748b] mt-0.5">Trophies</p>
                    </div>
                  </div>

                  {/* Card Bottom Link */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-[#94a3b8]">
                    <span>FCL League Rating</span>
                    <span className="font-extrabold text-white group-hover:underline">Open Official Card →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🏆 FCL RECORD CORNER (BALANCED 4x2 GRID - 8 ICONIC BENCHMARKS) */}
      <section id="records" className="relative overflow-hidden border-t border-[#172033] bg-[#02050b] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#1877F2]/10 blur-[130px]" />

          <div className="relative mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#1877F2] shadow-lg shadow-[#1877F2]/50" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1877F2]">
                  FCL Statistics & Benchmarks
                </p>
              </div>
              <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                FCL Record Corner
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                All-time historical benchmarks, individual records and milestone stats directly synced from tournament records.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/records"
                className="rounded-xl border border-[#1877F2]/40 bg-[#1877F2]/10 px-5 py-2.5 text-xs font-extrabold text-[#60a5fa] transition hover:bg-[#1877F2] hover:text-white"
              >
                View Hall of Fame Cabinet →
              </Link>
            </div>
          </div>

          {/* 🌟 4x2 SYMMETRICAL ULTRA-PREMIUM GRID (8 MAJOR BENCHMARKS) */}
          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. MOST CHAMPIONSHIPS */}
            <div
              onClick={() => mostChampionshipPlayer && setSelectedPlayer(mostChampionshipPlayer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#eab308]/40 bg-gradient-to-b from-[#211704] to-[#0c0801] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#eab308] hover:shadow-2xl hover:shadow-[#eab308]/20 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#eab308] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#eab308]/30 bg-[#eab308]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#fde047]">
                    🏆 Champion
                  </span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#eab308]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Titles Won</p>
                  <p className="mt-1 text-4xl font-black text-[#fde047] drop-shadow-[0_0_15px_rgba(253,224,71,0.45)]">
                    {mostChampionshipPlayer?.champion || 6}
                  </p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">6x Tournament Winner</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#eab308]/30 bg-[#1f1707] text-2xl group-hover:scale-105 transition">
                    ⭐
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Record Holder</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#fde047] transition break-words leading-tight">
                      {mostChampionshipPlayer?.name || "Arif Ziad"}
                    </h4>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#2e2008] pt-3 text-[10px] text-[#64748b]">
                  <span>Most Titles</span>
                  <span className="text-[#fde047] font-bold group-hover:underline">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 2. ALL-TIME RUNS (JAHIN SHAHRIA CHOWDHURY - FULL NAME) */}
            <div
              onClick={() => topRunScorer && setSelectedPlayer(topRunScorer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#1877F2]/40 bg-gradient-to-b from-[#0b1329] to-[#040817] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#1877F2] hover:shadow-2xl hover:shadow-[#1877F2]/20 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1877F2] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#1877F2]/30 bg-[#1877F2]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#60a5fa]">
                    🏏 All-Time Runs
                  </span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#1877F2]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Career Record Runs</p>
                  <p className="mt-1 text-4xl font-black text-[#60a5fa] drop-shadow-[0_0_15px_rgba(96,165,250,0.45)]">
                    {topRunScorer?.runs?.toLocaleString() || "3,317"}
                  </p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">In {topRunScorer?.matches || 168} Mat • Avg {topRunScorer?.runAvg || "15.22"}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#1877F2]/30 bg-[#111936] text-2xl group-hover:scale-105 transition">
                    👑
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Record Holder</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#60a5fa] transition break-words leading-tight">
                      {topRunScorer?.name || "Jahin Shahriar Chowdhury"}
                    </h4>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#17233f] pt-3 text-[10px] text-[#64748b]">
                  <span>Run King</span>
                  <span className="text-[#60a5fa] font-bold group-hover:underline">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 3. ALL-TIME WICKETS */}
            <div
              onClick={() => topWicketTaker && setSelectedPlayer(topWicketTaker)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#f59e0b]/40 bg-gradient-to-b from-[#211603] to-[#0c0801] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#f59e0b] hover:shadow-2xl hover:shadow-[#f59e0b]/20 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#fbbf24]">
                    🎯 All-Time Wickets
                  </span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#f59e0b]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Career Record Wickets</p>
                  <p className="mt-1 text-4xl font-black text-[#fbbf24] drop-shadow-[0_0_15px_rgba(245,158,11,0.45)]">
                    {topWicketTaker?.wickets || 332}
                  </p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">In {topWicketTaker?.matches || 167} Mat • Avg {topWicketTaker?.wkAvg || "1.99"}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#f59e0b]/30 bg-[#1f1707] text-2xl group-hover:scale-105 transition">
                    ⚡
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Record Holder</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#fbbf24] transition break-words leading-tight">
                      {topWicketTaker?.name || "Zaheed Hasan"}
                    </h4>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#2e2008] pt-3 text-[10px] text-[#64748b]">
                  <span>Strike Bowler</span>
                  <span className="text-[#fbbf24] font-bold group-hover:underline">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 4. TOTAL FINALS PLAYED */}
            <div
              onClick={() => mostFinalsPlayer && setSelectedPlayer(mostFinalsPlayer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#38bdf8]/40 bg-gradient-to-b from-[#081a29] to-[#020912] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#38bdf8] hover:shadow-2xl hover:shadow-[#38bdf8]/20 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#38bdf8]">
                    ⚔️ Total Finals
                  </span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#38bdf8]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Final Appearances</p>
                  <p className="mt-1 text-4xl font-black text-[#38bdf8] drop-shadow-[0_0_15px_rgba(56,189,248,0.45)]">
                    {mostFinalsPlayer?.totalFinal || 9}
                  </p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">5x Champion • 4x Runner-Up</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#38bdf8]/30 bg-[#0c2438] text-2xl group-hover:scale-105 transition">
                    🛡️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Record Holder</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#38bdf8] transition break-words leading-tight">
                      {mostFinalsPlayer?.name || "Tanvir Shakib"}
                    </h4>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#132d42] pt-3 text-[10px] text-[#64748b]">
                  <span>Big Match Legend</span>
                  <span className="text-[#38bdf8] font-bold group-hover:underline">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 5. MOST MATCHES */}
            <div
              onClick={() => mostMatchesPlayer && setSelectedPlayer(mostMatchesPlayer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#22c55e]/40 bg-gradient-to-b from-[#091f13] to-[#020d07] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#22c55e] hover:shadow-2xl hover:shadow-[#22c55e]/20 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#4ade80]">
                    ⚡ Most Matches
                  </span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#22c55e]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Caps Played</p>
                  <p className="mt-1 text-4xl font-black text-[#4ade80] drop-shadow-[0_0_15px_rgba(34,197,94,0.45)]">
                    {mostMatchesPlayer?.matches || 171}
                  </p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">261 Career Wickets</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#22c55e]/30 bg-[#0f2416] text-2xl group-hover:scale-105 transition">
                    🛡️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Iron Man of FCL</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#4ade80] transition break-words leading-tight">
                      {mostMatchesPlayer?.name || "Sadrul Anam"}
                    </h4>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#122e1b] pt-3 text-[10px] text-[#64748b]">
                  <span>Appearances</span>
                  <span className="text-[#4ade80] font-bold group-hover:underline">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 6. MOST SIXES */}
            <div
              onClick={() => mostSixesPlayer && setSelectedPlayer(mostSixesPlayer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#8b5cf6]/40 bg-gradient-to-b from-[#18112d] to-[#070410] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#8b5cf6] hover:shadow-2xl hover:shadow-[#8b5cf6]/20 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#c084fc]">
                    💥 Six Machine
                  </span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#8b5cf6]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Total Sixes Cleared</p>
                  <p className="mt-1 text-4xl font-black text-[#c084fc] drop-shadow-[0_0_15px_rgba(192,132,252,0.45)]">
                    {mostSixesPlayer?.sixes || 176}
                  </p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">{mostSixesPlayer?.runs || 2745} Career Runs</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#8b5cf6]/30 bg-[#1e153b] text-2xl group-hover:scale-105 transition">
                    💣
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Power Hitter</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#c084fc] transition break-words leading-tight">
                      {mostSixesPlayer?.name || "Shahriar Khokon"}
                    </h4>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#251845] pt-3 text-[10px] text-[#64748b]">
                  <span>Maximum Sixes</span>
                  <span className="text-[#c084fc] font-bold group-hover:underline">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 7. HAT-TRICK MASTER */}
            <div
              onClick={() => topHatTrickPlayer && setSelectedPlayer(topHatTrickPlayer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#ec4899]/40 bg-gradient-to-b from-[#240a16] to-[#0c0207] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#ec4899] hover:shadow-2xl hover:shadow-[#ec4899]/20 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ec4899] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#ec4899]/30 bg-[#ec4899]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#f472b6]">
                    🔥 Hat-Tricks
                  </span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#ec4899]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Career Hat-Tricks</p>
                  <p className="mt-1 text-4xl font-black text-[#f472b6] drop-shadow-[0_0_15px_rgba(244,114,182,0.45)]">
                    {topHatTrickPlayer?.hatTricks || 12}x
                  </p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">All-Time Bowling Record</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#ec4899]/30 bg-[#2b0f1d] text-2xl group-hover:scale-105 transition">
                    🎯
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Hat-Trick Hero</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#f472b6] transition break-words leading-tight">
                      {topHatTrickPlayer?.name || "Zaheed Hasan"}
                    </h4>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#361324] pt-3 text-[10px] text-[#64748b]">
                  <span>Record Bowler</span>
                  <span className="text-[#f472b6] font-bold group-hover:underline">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 8. MOT / CPOT AWARDS */}
            <div
              onClick={() => mostMotPlayer && setSelectedPlayer(mostMotPlayer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#f59e0b]/40 bg-gradient-to-b from-[#211603] to-[#0c0801] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#f59e0b] hover:shadow-2xl hover:shadow-[#f59e0b]/20 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#fbbf24]">
                    ⭐ MOT / CPOT
                  </span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#f59e0b]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Tournament Best</p>
                  <p className="mt-1 text-4xl font-black text-[#fbbf24] drop-shadow-[0_0_15px_rgba(245,158,11,0.45)]">
                    {(mostMotPlayer?.mot || 0) + (mostMotPlayer?.cpot || 0)}x
                  </p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">Tournament MVP Honors</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#f59e0b]/30 bg-[#1f1707] text-2xl group-hover:scale-105 transition">
                    🎖️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Award Winner</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#fbbf24] transition break-words leading-tight">
                      {mostMotPlayer?.name || "Player of Tournament"}
                    </h4>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#2e2008] pt-3 text-[10px] text-[#64748b]">
                  <span>Tournament MVP</span>
                  <span className="text-[#fbbf24] font-bold group-hover:underline">Open Card →</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 LEAGUE COMMUNITY STATS BANNER */}
          <div className="mt-10 rounded-3xl border border-[#22c55e]/40 bg-gradient-to-r from-[#041a0f] via-[#092b1a] to-[#041a0f] p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-[#22c55e]/50 bg-[#0e2a1b] text-3xl shadow-lg shadow-[#22c55e]/30">
                  📊
                </div>
                <div>
                  <span className="rounded-md border border-[#22c55e]/40 bg-[#22c55e]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#4ade80]">
                    FCL Community Benchmark
                  </span>
                  <h4 className="mt-1.5 text-2xl sm:text-3xl font-black text-white">
                    {totalCommunityRuns ? `${totalCommunityRuns.toLocaleString()}+ Runs` : "127,387+ Runs"}
                  </h4>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Scored across 24+ tournaments by over {playersData.length || 205} registered players in FCL history.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="rounded-2xl border border-[#22c55e]/30 bg-black/60 px-6 py-3.5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Total Wickets</p>
                  <p className="text-3xl sm:text-4xl font-black text-[#4ade80] drop-shadow-[0_0_12px_rgba(74,222,128,0.5)]">
                    {totalCommunityWickets ? `${totalCommunityWickets.toLocaleString()}` : "10,303"}
                  </p>
                  <span className="text-[10px] text-[#22c55e] font-semibold">Active League Legacy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
            <p className="mt-1 text-xs text-[#64748b]">The Game Lives Beyond The Field</p>
          </div>
          <p className="text-xs text-[#94a3b8]">
            © 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.
          </p>
        </div>
      </footer>

      {/* ================================================== */}
      {/* FULLSCREEN STAT CARD MODAL (WITH MVP BADGE) */}
      {/* ================================================== */}
      {selectedPlayer && (
        <div
          onClick={() => setSelectedPlayer(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className="relative flex h-[94vh] sm:h-auto sm:max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-[#38bdf8]/40 bg-[#0f172a] shadow-2xl shadow-[#0284c7]/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* STICKY TOP CONTROLS */}
            <div className="shrink-0 flex items-center justify-between border-b border-[#1e293b] bg-[#0b1329] px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-xs font-bold text-[#38bdf8]">FCL Digital Stat Card</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-3 py-1.5 text-xs font-bold text-white shadow hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {downloading ? "Saving..." : "📥 Download"}
                </button>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-white/10 bg-[#070b16] text-xs sm:text-sm font-bold text-white hover:bg-white/20"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* SCROLLABLE CARD BODY */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 sm:p-4">
              <div
                ref={cardRef}
                className="mx-auto rounded-2xl border border-[#1e293b] bg-[#0b132b] p-3.5 sm:p-5 text-white space-y-3.5"
              >
                {/* Banner */}
                <div className="flex items-center justify-between border-b border-[#38bdf8]/30 pb-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-xl border border-[#38bdf8]/50 bg-[#080d1a] p-1 shadow-md shrink-0">
                      <img
                        src="/fcl-logo.png"
                        alt="FCL"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = '<span class="text-xl">🏏</span>';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-2xl font-black uppercase tracking-wider text-[#e0f2fe]">
                        Player Statistics Card
                      </h3>
                      <p className="text-[10px] sm:text-xs font-semibold tracking-wide text-[#38bdf8]">
                        Facebook Cricket League (FCL)
                      </p>
                    </div>
                  </div>

                  <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-[#f59e0b] shrink-0">
                    OFFICIAL
                  </span>
                </div>

                {/* Profile Top Row */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="relative flex items-center justify-center rounded-xl border-2 border-[#38bdf8]/40 bg-[#070b16] p-1.5 aspect-square">
                    <img
                      src={`/players/${(selectedPlayer.nickName || "").toLowerCase().trim()}.jpg`}
                      alt={selectedPlayer.name}
                      className="h-full w-full rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML =
                          '<div class="flex flex-col items-center justify-center h-full text-center"><span class="text-3xl sm:text-4xl">🏏</span><span class="text-[9px] sm:text-[10px] text-[#94a3b8] mt-1">Player</span></div>';
                      }}
                    />
                    {selectedPlayer.nickName && (
                      <div className="absolute bottom-1 right-1 rounded bg-[#0284c7] px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                        {selectedPlayer.nickName}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 rounded-xl border border-[#1e293b] bg-[#070b16] p-3 sm:p-3.5 flex flex-col justify-center">
                    <span className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Player Name</span>
                    <h4 className="text-sm sm:text-xl font-black text-white truncate mt-0.5">
                      {selectedPlayer.name}
                    </h4>
                    {selectedPlayer.nickName && (
                      <p className="text-xs sm:text-sm font-semibold text-[#38bdf8] truncate mt-0.5">
                        @{selectedPlayer.nickName}
                      </p>
                    )}
                    <div className="mt-2 pt-2 border-t border-[#1e293b] flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] uppercase text-[#94a3b8]">Role:</span>
                      <span className="text-xs sm:text-sm font-bold text-[#f59e0b] truncate">
                        {selectedPlayer.role}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-1 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-2.5 sm:p-3 flex flex-row sm:flex-col justify-between sm:justify-center items-center text-center">
                    <span className="text-[10px] uppercase tracking-wider text-[#cbd5e1]">Total Final</span>
                    <p className="text-xl sm:text-3xl font-black text-[#f59e0b] my-0.5">
                      {selectedPlayer.totalFinal ?? 0}
                    </p>
                    <span className="text-[9px] text-[#94a3b8]">Finals Played</span>
                  </div>
                </div>

                {/* Debut & Tournaments */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-center">
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-semibold text-[#64748b]">Debut Date</p>
                    <p className="font-extrabold text-[#38bdf8] text-xs sm:text-sm mt-1 truncate">
                      {selectedPlayer.debutYear || "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-semibold text-[#64748b]">Debut Tournament</p>
                    <p className="font-extrabold text-white text-xs sm:text-sm mt-1 leading-tight break-words">
                      {selectedPlayer.debutTournament || "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-semibold text-[#64748b]">Debut Team</p>
                    <p className="font-extrabold text-white text-xs sm:text-sm mt-1 leading-tight break-words">
                      {selectedPlayer.debutTeam || "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-semibold text-[#64748b]">Total Tournaments</p>
                    <p className="font-black text-[#22c55e] text-base sm:text-xl mt-0.5">
                      {selectedPlayer.totalTournament ?? 0}
                    </p>
                  </div>
                </div>

                {/* All-Time League Rankings + MVP Rating Badge */}
                <div className="rounded-2xl border border-[#f59e0b]/40 bg-gradient-to-r from-[#171103] via-[#241804] to-[#171103] p-3 text-center shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#f59e0b]/20 pb-2">
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#f59e0b]">
                      ⭐ ALL-TIME LEAGUE RANKINGS
                    </p>
                    <span className="rounded-lg bg-[#f59e0b]/20 px-2 py-0.5 text-[10px] font-black text-[#fbbf24]">
                      👑 #{getRank(selectedPlayer, "mvp")} MVP ({calculateFclPoints(selectedPlayer).toLocaleString()} Pts)
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-xl bg-black/50 p-2 border border-[#f59e0b]/25">
                      <p className="text-[10px] uppercase font-semibold text-[#94a3b8]">Runs Rank</p>
                      <p className="text-sm sm:text-base font-black text-[#22c55e] mt-1">
                        #{getRank(selectedPlayer, "runs")}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/50 p-2 border border-[#f59e0b]/25">
                      <p className="text-[10px] uppercase font-semibold text-[#94a3b8]">Wickets Rank</p>
                      <p className="text-sm sm:text-base font-black text-[#f59e0b] mt-1">
                        #{getRank(selectedPlayer, "wickets")}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/50 p-2 border border-[#f59e0b]/25">
                      <p className="text-[10px] uppercase font-semibold text-[#94a3b8]">6s Rank</p>
                      <p className="text-sm sm:text-base font-black text-[#c084fc] mt-1">
                        #{getRank(selectedPlayer, "sixes")}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/50 p-2 border border-[#f59e0b]/25">
                      <p className="text-[10px] uppercase font-semibold text-[#94a3b8]">Trophy Rank</p>
                      <p className="text-sm sm:text-base font-black text-[#38bdf8] mt-1">
                        #{getRank(selectedPlayer, "champion")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-3 sm:p-3.5 space-y-1.5 text-xs sm:text-[13px]">
                    <div className="flex justify-between border-b border-[#172033] pb-1.5">
                      <span className="text-[#94a3b8]">Total Match:</span>
                      <strong className="text-white font-extrabold">{selectedPlayer.matches}</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1.5">
                      <span className="text-[#94a3b8]">Total Runs & Max:</span>
                      <strong className="text-[#22c55e] font-extrabold">
                        {selectedPlayer.runs}{" "}
                        <span className="text-[#64748b] font-normal">
                          ({selectedPlayer.maxRuns ? selectedPlayer.maxRuns : "—"})
                        </span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1.5">
                      <span className="text-[#94a3b8]">Total Wickets & Max:</span>
                      <strong className="text-[#f59e0b] font-extrabold">
                        {selectedPlayer.wickets}{" "}
                        <span className="text-[#64748b] font-normal">
                          ({selectedPlayer.maxWickets ? selectedPlayer.maxWickets : "—"})
                        </span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1.5">
                      <span className="text-[#94a3b8]">Innings / Not Out:</span>
                      <strong className="text-white font-extrabold">
                        {selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1.5">
                      <span className="text-[#94a3b8]">Boundaries (4&apos;s / 6&apos;s):</span>
                      <strong className="text-white font-extrabold">
                        <span className="text-[#38bdf8]">{selectedPlayer.fours ?? 0}</span> /{" "}
                        <span className="text-[#c084fc]">{selectedPlayer.sixes ?? 0}</span>
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Hat-Trick:</span>
                      <strong className="text-[#ec4899] font-extrabold">{selectedPlayer.hatTricks ?? 0}</strong>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-3 sm:p-3.5 space-y-1.5 text-xs sm:text-[13px]">
                    <div className="flex justify-between border-b border-[#172033] pb-1.5">
                      <span className="text-[#94a3b8]">Batting / Bowling Avg:</span>
                      <strong className="text-white font-extrabold">
                        {selectedPlayer.runAvg} / {selectedPlayer.wkAvg}
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1.5">
                      <span className="text-[#94a3b8]">Champion / Runner-Up:</span>
                      <strong className="text-white font-extrabold">
                        🏆 <span className="text-[#f59e0b]">{selectedPlayer.champion ?? 0}</span> / 🥈{" "}
                        <span className="text-[#cbd5e1]">{selectedPlayer.runnersUp ?? 0}</span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1.5">
                      <span className="text-[#94a3b8]">MOT / CPOT:</span>
                      <strong className="text-white font-extrabold">
                        ⭐ <span className="text-[#c084fc]">{selectedPlayer.mot ?? 0}</span> /{" "}
                        <span className="text-[#94a3b8]">{selectedPlayer.cpot ?? 0}</span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1.5">
                      <span className="text-[#94a3b8]">MOM / CPOM:</span>
                      <strong className="text-white font-extrabold">
                        🎖️ <span className="text-[#38bdf8]">{selectedPlayer.mom ?? 0}</span> /{" "}
                        <span className="text-[#94a3b8]">{selectedPlayer.cpom ?? 0}</span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1.5">
                      <span className="text-[#94a3b8]">Highest Run Scorer:</span>
                      <strong className="text-white font-extrabold">
                        {selectedPlayer.highestRunScorer ?? 0}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Top Wicket Taker:</span>
                      <strong className="text-white font-extrabold">{selectedPlayer.topWicketTaker ?? 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-[#1e293b] pt-2 text-[10px] sm:text-xs text-[#64748b]">
                  <span className="truncate">
                    Last Played:{" "}
                    <strong className="text-white">{selectedPlayer.lastPlayed || "—"}</strong>
                  </span>
                  <span className="shrink-0 font-semibold">FCL Official Card</span>
                </div>
              </div>
            </div>

            {/* STICKY BOTTOM ACTION BAR */}
            <div className="shrink-0 flex gap-2 border-t border-[#1e293b] bg-[#0b1329] p-2.5 sm:p-3">
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#1877F2] to-[#0284c7] py-2.5 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                {downloading ? "Downloading Card..." : "📥 Download Card as Image"}
              </button>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="rounded-xl border border-[#1e293b] bg-[#070b16] px-4 py-2.5 text-xs font-bold text-[#94a3b8] transition hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}