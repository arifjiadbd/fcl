"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PlayerCardModal from "../components/PlayerCardModal";

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
}

interface TournamentRecord {
  name: string;
  playerName: string;
  tournament: string;
  team: string;
  matches: number;
  runs: number;
  wickets: number;
  innings: number;
  notOut: number;
  fours: number;
  sixes: number;
  hatTrick: number;
  mom: number;
  cpom: number;
  motCpot: string;
  chamRu: string;
  time: string;
  topScorer: number;
  topWicket: number;
}

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
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.players && Array.isArray(data.players)) setPlayersData(data.players);
        else if (Array.isArray(data)) setPlayersData(data);
        if (data.tournaments && Array.isArray(data.tournaments)) setTournamentsData(data.tournaments);
      })
      .catch((err) => console.error("Error fetching live Excel data:", err));
  }, []);

  const top3Mvp = [...playersData].sort((a, b) => calculateFclPoints(b) - calculateFclPoints(a)).slice(0, 3);
  const mostChampionshipPlayer = [...playersData].sort((a, b) => (b.champion || 0) - (a.champion || 0))[0];
  const topRunScorer = [...playersData].sort((a, b) => b.runs - a.runs)[0];
  const topWicketTaker = [...playersData].sort((a, b) => b.wickets - a.wickets)[0];
  const mostFinalsPlayer = [...playersData].sort((a, b) => (b.totalFinal || 0) - (a.totalFinal || 0))[0];
  const mostMatchesPlayer = [...playersData].sort((a, b) => b.matches - a.matches)[0];
  const mostSixesPlayer = [...playersData].sort((a, b) => (b.sixes || 0) - (a.sixes || 0))[0];
  const topHatTrickPlayer = [...playersData].sort((a, b) => (b.hatTricks || 0) - (a.hatTricks || 0))[0];

  const totalCommunityRuns = playersData.reduce((acc, curr) => acc + (curr.runs || 0), 0);
  const totalCommunityWickets = playersData.reduce((acc, curr) => acc + (curr.wickets || 0), 0);

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-[#1877F2]/30 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border border-[#1877F2]/40 bg-[#111936] shadow-lg shadow-[#1877F2]/10">
              <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain p-1" />
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
            <Link href="/" className="text-sm font-semibold text-white transition hover:text-[#1877F2]">Home</Link>
            <Link href="#about" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">About FCL</Link>
            <Link href="/rules" className="text-sm font-medium text-[#38bdf8] transition hover:text-white">Rules & Formats</Link>
            <Link href="/players" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">Players</Link>
            <Link href="/rankings" className="text-sm font-medium text-[#f59e0b] transition hover:text-white">Rankings & MVP</Link>
            <Link href="/records" className="text-sm font-medium text-[#fbbf24] transition hover:text-white">Hall of Fame</Link>
            <Link href="/memories" className="text-sm font-bold text-[#f472b6] transition hover:text-white flex items-center gap-1">Memories 📖</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/bn"
              className="flex items-center gap-1.5 rounded-full border border-[#1877F2]/40 bg-gradient-to-r from-[#1877F2] to-[#166fe5] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:brightness-110 active:scale-95"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#1877F2]">f</span>
              <span>বাংলা ভার্সন</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e293b] bg-[#0b1220] text-white lg:hidden"
            >
              {mobileMenuOpen ? <span className="text-xl font-bold">✕</span> : <span className="text-xl">☰</span>}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#1e293b] bg-[#030712] px-6 py-5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-[#1877F2]/10">🏠 Home</Link>
              <Link href="/bn" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#1877F2]/20 border border-[#1877F2]/40 px-3 py-2 text-sm font-bold text-[#60a5fa]">💙 বাংলা ভার্সন</Link>
              <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#94a3b8] hover:bg-[#1877F2]/10">ℹ️ About FCL</Link>
              <Link href="/rules" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#38bdf8] hover:bg-[#1877F2]/10">📜 Rules & Match Formats</Link>
              <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#60a5fa] hover:bg-[#1877F2]/10">👥 Players Directory</Link>
              <Link href="/rankings" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#f59e0b] hover:bg-[#f59e0b]/10">👑 All-Time Rankings & MVP</Link>
              <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#fbbf24] hover:bg-[#f59e0b]/10">🏆 Records & Hall of Fame</Link>
              <Link href="/memories" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-[#f472b6] hover:bg-[#f472b6]/10">📖 FCL Memories & Nostalgia</Link>
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
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#93c5fd]">FCL • VIRTUAL CRICKET</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.38em] text-[#64748b]">Facebook Cricket League</p>
              <h2 className="mt-5 text-5xl font-black leading-[0.91] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl lg:text-[78px]">
                <span className="block">THE GAME LIVES</span>
                <span className="block bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">BEYOND THE FIELD.</span>
                <span className="mt-4 block text-[0.42em] font-bold leading-tight tracking-[-0.02em] text-[#f59e0b]">
                  One Game. One Community.{" "}
                  <span className="inline-block text-[1.45em] font-black tracking-[-0.04em] text-transparent bg-gradient-to-r from-[#60a5fa] via-[#22d3ee] to-[#8b5cf6] bg-clip-text drop-shadow-[0_0_18px_rgba(34,211,238,0.45)]">FCL.</span>
                </span>
              </h2>
              <p className="mx-auto mt-7 max-w-[540px] text-sm leading-7 text-[#94a3b8] md:text-base lg:mx-0">
                From different districts of Bangladesh to different corners of the world, we play, compete and connect through FCL. Distance may separate us, but the game brings us together.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <Link href="/players" className="rounded-xl bg-[#1877F2] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_rgba(24,119,242,0.25)] hover:bg-[#0d6fe8] transition">
                  Explore Players & Cards →
                </Link>
                <Link href="/bn" className="rounded-xl border border-[#1877F2]/40 bg-[#1877F2]/15 px-7 py-3.5 text-sm font-bold text-[#60a5fa] hover:bg-[#1877F2] hover:text-white transition">
                  💙 বাংলা ভার্সন
                </Link>
              </div>
            </div>

            <div className="relative h-[680px] w-full hidden sm:block">
              <div className="absolute inset-y-[30px] right-[-40px] w-[760px] overflow-hidden rounded-[3rem] border border-white/[0.08] bg-[#080d17] shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
                <img src="/fcl-room.png" alt="FCL Room" className="h-full w-full object-contain object-center" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About FCL Section */}
      <section id="about" className="relative overflow-hidden border-b border-[#172033] bg-[#030712] py-24">
        <div className="absolute left-[-180px] top-20 h-[400px] w-[400px] rounded-full bg-[#1877F2]/10 blur-[120px]" />
        <div className="absolute right-[-180px] bottom-10 h-[400px] w-[400px] rounded-full bg-[#7c3aed]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-[1200px] px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#60a5fa]">About FCL</span>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
              Cricket Beyond <span className="bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">The Field.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#94a3b8] md:text-base">
              Facebook Cricket League is a virtual cricket community where players compete through numbers, strategy and teamwork.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#1877F2]/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1877F2]/20 bg-[#1877F2]/10 text-2xl">🏏</div>
              <h3 className="mt-6 text-lg font-bold text-white">Virtual Cricket</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">A unique cricket format played through numbers, decisions and strategy instead of a physical field.</p>
            </div>
            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#22d3ee]/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#22d3ee]/20 bg-[#22d3ee]/10 text-2xl">🌍</div>
              <h3 className="mt-6 text-lg font-bold text-white">One Community</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">Players connect from different districts of Bangladesh and from different corners of the world.</p>
            </div>
            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f59e0b]/20 bg-[#f59e0b]/10 text-2xl">🤝</div>
              <h3 className="mt-6 text-lg font-bold text-white">Unity Through FCL</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">Competition, friendship and fun — bringing people together through one shared game.</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-[#1877F2]/30 bg-gradient-to-r from-[#0b1220] via-[#0d1830] to-[#0b1220] p-6 sm:p-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">Rulebook & Formats</span>
              <h4 className="text-xl font-bold text-white mt-1">Want to learn how to play FCL?</h4>
              <p className="text-xs text-[#94a3b8] mt-1">Check out T20, ODI, Test match systems and Power Play rules.</p>
            </div>
            <Link href="/rules" className="shrink-0 rounded-xl bg-[#1877F2] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 hover:bg-[#0d6fe8] transition">
              Official Rules Guide →
            </Link>
          </div>
        </div>
      </section>

      {/* 🌟 ALL-TIME TOP 3 MVP LEGENDS PODIUM */}
      <section id="mvp-podium" className="relative overflow-hidden border-t border-[#172033] bg-[#020617] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[#f59e0b]/10 blur-[130px]" />

          <div className="relative mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b] shadow-lg shadow-[#f59e0b]/60 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f59e0b]">FCL PINNACLE RATING</p>
              </div>
              <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">All-Time Top 3 MVP Legends</h3>
            </div>
            <Link
              href="/rankings"
              className="rounded-xl border border-[#f59e0b]/50 bg-gradient-to-r from-[#2a1b04] to-[#170f02] px-6 py-3 text-xs font-black text-[#fbbf24] shadow-lg hover:border-[#f59e0b] transition"
            >
              👑 View Complete MVP Leaderboard →
            </Link>
          </div>

          <div className="relative grid gap-6 md:grid-cols-3">
            {top3Mvp.map((player, idx) => {
              const rank = idx + 1;
              const points = calculateFclPoints(player);
              const badgeColors =
                rank === 1
                  ? { border: "border-2 border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.25)]", bg: "bg-gradient-to-b from-[#1c1203] via-[#0d0901] to-[#040300]", tag: "border-[#f59e0b]/50 bg-[#f59e0b]/20 text-[#fbbf24]", badge: "bg-[#f59e0b] text-black font-black", highlight: "text-[#fbbf24]", icon: "👑", label: "GOLD MEDALIST • #01 MVP" }
                  : rank === 2
                  ? { border: "border-2 border-[#94a3b8] shadow-[0_0_30px_rgba(148,163,184,0.2)]", bg: "bg-gradient-to-b from-[#171d28] via-[#0c1017] to-[#030508]", tag: "border-[#94a3b8]/50 bg-[#94a3b8]/20 text-[#e2e8f0]", badge: "bg-[#cbd5e1] text-black font-black", highlight: "text-[#f1f5f9]", icon: "🥈", label: "SILVER MEDALIST • #02 MVP" }
                  : { border: "border-2 border-[#d97706] shadow-[0_0_30px_rgba(217,119,6,0.2)]", bg: "bg-gradient-to-b from-[#1a1005] via-[#0e0802] to-[#030200]", tag: "border-[#d97706]/50 bg-[#d97706]/20 text-[#fcd34d]", badge: "bg-[#d97706] text-white font-black", highlight: "text-[#fbbf24]", icon: "🥉", label: "BRONZE MEDALIST • #03 MVP" };

              return (
                <div
                  key={player.name + idx}
                  onClick={() => setSelectedPlayer(player)}
                  className={`group relative cursor-pointer overflow-hidden rounded-[2rem] ${badgeColors.border} ${badgeColors.bg} p-6 sm:p-7 transition-all duration-300 hover:-translate-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`rounded-xl border px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider ${badgeColors.tag}`}>
                      {badgeColors.icon} {badgeColors.label}
                    </span>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm ${badgeColors.badge}`}>#{rank}</span>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/10 bg-[#0f172a] text-3xl shadow-lg">
                      {badgeColors.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#60a5fa] transition break-words leading-tight">
                        {player.name}
                      </h4>
                      <p className="text-xs text-[#94a3b8] mt-0.5">@{player.nickName || player.name} • {player.role}</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/70 p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#94a3b8]">ALL-TIME PERFORMANCE RATING</p>
                    <p className={`mt-1 text-4xl sm:text-5xl font-black ${badgeColors.highlight}`}>
                      {points.toLocaleString()} <span className="text-base font-bold text-[#94a3b8]">PTS</span>
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-white/5 bg-black/50 p-2.5">
                      <p className="text-lg font-black text-[#22c55e]">{player.runs?.toLocaleString() ?? 0}</p>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#64748b] mt-0.5">RUNS</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/50 p-2.5">
                      <p className="text-lg font-black text-[#f59e0b]">{player.wickets ?? 0}</p>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#64748b] mt-0.5">WICKETS</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/50 p-2.5">
                      <p className="text-lg font-black text-[#38bdf8]">{player.champion ?? 0}x</p>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#64748b] mt-0.5">TROPHIES</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🏆 FCL RECORD CORNER (PREMIUM MVP CARD STYLE - 7 MAJOR RECORDS) */}
      <section id="records" className="relative overflow-hidden border-t border-[#172033] bg-[#02050b] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="relative mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                FCL STATISTICS & BENCHMARKS
              </div>
              <h3 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                FCL Record Corner
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Historic milestones and all-time record holders archive.
              </p>
            </div>
            <Link
              href="/records"
              className="rounded-xl border border-[#1877F2]/50 bg-gradient-to-r from-[#0d1c38] to-[#071124] px-6 py-3 text-xs font-black text-[#60a5fa] shadow-lg hover:border-[#1877F2] transition"
            >
              View Hall of Fame Cabinet →
            </Link>
          </div>

          {/* Grid Layout: MVP Card Aesthetics */}
          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            
            {/* 1. Champion Record */}
            <div
              onClick={() => setSelectedPlayer(mostChampionshipPlayer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#1c1303]/90 via-[#0d0902] to-[#040301] p-5 shadow-[0_0_30px_rgba(245,158,11,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                    🏆 CHAMPION
                  </span>
                  <span className="text-xs font-black text-amber-500/80">#01</span>
                </div>

                <div className="mt-4 flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-amber-950/40 text-3xl shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-105 transition">
                    👑
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-white group-hover:text-amber-300 transition break-words leading-tight">
                      {mostChampionshipPlayer?.name || "Arif Ziad"}
                    </h4>
                    <p className="text-xs font-bold text-amber-400 mt-0.5">
                      @{mostChampionshipPlayer?.nickName || "Arif"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#070501] border border-amber-500/20 p-3.5 text-center shadow-inner">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TITLES WON</p>
                  <p className="text-3xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] mt-0.5">
                    {mostChampionshipPlayer?.champion || 6}
                  </p>
                  <p className="text-[11px] font-medium text-amber-200/70 mt-0.5">6x Tournament Winner</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-amber-500/20 pt-3 text-xs">
                <span className="text-[11px] font-semibold text-slate-400">Most Titles</span>
                <span className="font-bold text-amber-400 group-hover:underline">Open Card →</span>
              </div>
            </div>

            {/* 2. All-Time Runs */}
            <div
              onClick={() => setSelectedPlayer(topRunScorer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-b from-[#09152e]/90 via-[#050b18] to-[#02050b] p-5 shadow-[0_0_30px_rgba(59,130,246,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-400 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-300">
                    🏏 ALL-TIME RUNS
                  </span>
                  <span className="text-xs font-black text-blue-500/80">#01</span>
                </div>

                <div className="mt-4 flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-500/20 to-blue-950/40 text-3xl shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-105 transition">
                    🏏
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-white group-hover:text-blue-300 transition break-words leading-tight">
                      {topRunScorer?.name || "Jahin Shahriar Chowdhury"}
                    </h4>
                    <p className="text-xs font-bold text-blue-400 mt-0.5">
                      @{topRunScorer?.nickName || "Jahin"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#02050c] border border-blue-500/20 p-3.5 text-center shadow-inner">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CAREER RECORD RUNS</p>
                  <p className="text-3xl font-black text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.6)] mt-0.5">
                    {topRunScorer?.runs?.toLocaleString() || "3,317"}
                  </p>
                  <p className="text-[11px] font-medium text-blue-200/70 mt-0.5">
                    In {topRunScorer?.matches || 168} Mat • Avg {topRunScorer?.runAvg || "15.22"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-blue-500/20 pt-3 text-xs">
                <span className="text-[11px] font-semibold text-slate-400">Run King</span>
                <span className="font-bold text-blue-400 group-hover:underline">Open Card →</span>
              </div>
            </div>

            {/* 3. All-Time Wickets */}
            <div
              onClick={() => setSelectedPlayer(topWicketTaker)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#2a0b12]/90 via-[#150508] to-[#060102] p-5 shadow-[0_0_30px_rgba(244,63,94,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-rose-400 hover:shadow-[0_0_35px_rgba(244,63,94,0.25)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-rose-300">
                    🎯 ALL-TIME WICKETS
                  </span>
                  <span className="text-xs font-black text-rose-500/80">#01</span>
                </div>

                <div className="mt-4 flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-500/20 to-rose-950/40 text-3xl shadow-[0_0_20px_rgba(244,63,94,0.3)] group-hover:scale-105 transition">
                    🎯
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-white group-hover:text-rose-300 transition break-words leading-tight">
                      {topWicketTaker?.name || "Zaheed Hasan"}
                    </h4>
                    <p className="text-xs font-bold text-rose-400 mt-0.5">
                      @{topWicketTaker?.nickName || "Zaheed"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#090204] border border-rose-500/20 p-3.5 text-center shadow-inner">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CAREER RECORD WICKETS</p>
                  <p className="text-3xl font-black text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.6)] mt-0.5">
                    {topWicketTaker?.wickets || 332}
                  </p>
                  <p className="text-[11px] font-medium text-rose-200/70 mt-0.5">
                    In {topWicketTaker?.matches || 167} Mat • Avg {topWicketTaker?.wkAvg || "1.99"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-rose-500/20 pt-3 text-xs">
                <span className="text-[11px] font-semibold text-slate-400">Strike Bowler</span>
                <span className="font-bold text-rose-400 group-hover:underline">Open Card →</span>
              </div>
            </div>

            {/* 4. Total Finals */}
            <div
              onClick={() => setSelectedPlayer(mostFinalsPlayer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#081f26]/90 via-[#030f13] to-[#010507] p-5 shadow-[0_0_30px_rgba(6,182,212,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                    ⚔️ TOTAL FINALS
                  </span>
                  <span className="text-xs font-black text-cyan-500/80">#01</span>
                </div>

                <div className="mt-4 flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/20 to-cyan-950/40 text-3xl shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition">
                    🛡️
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition break-words leading-tight">
                      {mostFinalsPlayer?.name || "Tanvir Shakib"}
                    </h4>
                    <p className="text-xs font-bold text-cyan-400 mt-0.5">
                      @{mostFinalsPlayer?.nickName || "Shakib"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#02090b] border border-cyan-500/20 p-3.5 text-center shadow-inner">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">FINAL APPEARANCES</p>
                  <p className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] mt-0.5">
                    {mostFinalsPlayer?.totalFinal || 9}
                  </p>
                  <p className="text-[11px] font-medium text-cyan-200/70 mt-0.5">5x Champion • 4x Runner-Up</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-cyan-500/20 pt-3 text-xs">
                <span className="text-[11px] font-semibold text-slate-400">Big Match Legend</span>
                <span className="font-bold text-cyan-400 group-hover:underline">Open Card →</span>
              </div>
            </div>

            {/* 5. Most Matches */}
            <div
              onClick={() => setSelectedPlayer(mostMatchesPlayer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0a2316]/90 via-[#04120a] to-[#010603] p-5 shadow-[0_0_30px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(16,185,129,0.25)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    ⚡ MOST MATCHES
                  </span>
                  <span className="text-xs font-black text-emerald-500/80">#01</span>
                </div>

                <div className="mt-4 flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 text-3xl shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition">
                    ⚡
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition break-words leading-tight">
                      {mostMatchesPlayer?.name || "Sadrul Anam"}
                    </h4>
                    <p className="text-xs font-bold text-emerald-400 mt-0.5">
                      @{mostMatchesPlayer?.nickName || "Sadrul"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#020a05] border border-emerald-500/20 p-3.5 text-center shadow-inner">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CAPS PLAYED</p>
                  <p className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)] mt-0.5">
                    {mostMatchesPlayer?.matches || 171}
                  </p>
                  <p className="text-[11px] font-medium text-emerald-200/70 mt-0.5">Iron Man of FCL</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-emerald-500/20 pt-3 text-xs">
                <span className="text-[11px] font-semibold text-slate-400">Appearances</span>
                <span className="font-bold text-emerald-400 group-hover:underline">Open Card →</span>
              </div>
            </div>

            {/* 6. Six Machine */}
            <div
              onClick={() => setSelectedPlayer(mostSixesPlayer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#230d31]/90 via-[#110518] to-[#040107] p-5 shadow-[0_0_30px_rgba(168,85,247,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.25)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-xl border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-purple-300">
                    💥 SIX MACHINE
                  </span>
                  <span className="text-xs font-black text-purple-500/80">#01</span>
                </div>

                <div className="mt-4 flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-500/20 to-purple-950/40 text-3xl shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-105 transition">
                    💣
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-white group-hover:text-purple-300 transition break-words leading-tight">
                      {mostSixesPlayer?.name || "Shahriar Khokon"}
                    </h4>
                    <p className="text-xs font-bold text-purple-400 mt-0.5">
                      @{mostSixesPlayer?.nickName || "Khokon"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#08020b] border border-purple-500/20 p-3.5 text-center shadow-inner">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOTAL SIXES CLEARED</p>
                  <p className="text-3xl font-black text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.6)] mt-0.5">
                    {mostSixesPlayer?.sixes || 176}
                  </p>
                  <p className="text-[11px] font-medium text-purple-200/70 mt-0.5">Power Hitter</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-purple-500/20 pt-3 text-xs">
                <span className="text-[11px] font-semibold text-slate-400">Maximum Sixes</span>
                <span className="font-bold text-purple-400 group-hover:underline">Open Card →</span>
              </div>
            </div>

            {/* 7. Hat-Tricks (Hat-Trick Master) */}
            <div
              onClick={() => setSelectedPlayer(topHatTrickPlayer)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#2a0b1e]/90 via-[#15040d] to-[#060104] p-5 shadow-[0_0_30px_rgba(236,72,153,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-pink-400 hover:shadow-[0_0_35px_rgba(236,72,153,0.25)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-xl border border-pink-500/40 bg-pink-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-pink-300">
                    🔥 HAT-TRICK MASTER
                  </span>
                  <span className="text-xs font-black text-pink-500/80">#01</span>
                </div>

                <div className="mt-4 flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-pink-500/40 bg-gradient-to-br from-pink-500/20 to-pink-950/40 text-3xl shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:scale-105 transition">
                    🎩
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-white group-hover:text-pink-300 transition break-words leading-tight">
                      {topHatTrickPlayer?.name || "Zaheed Hasan"}
                    </h4>
                    <p className="text-xs font-bold text-pink-400 mt-0.5">
                      @{topHatTrickPlayer?.nickName || "Zaheed"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#090206] border border-pink-500/20 p-3.5 text-center shadow-inner">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CAREER HAT-TRICKS</p>
                  <p className="text-3xl font-black text-pink-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.6)] mt-0.5">
                    {topHatTrickPlayer?.hatTricks || 12}
                  </p>
                  <p className="text-[11px] font-medium text-pink-200/70 mt-0.5">Highest in History</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-pink-500/20 pt-3 text-xs">
                <span className="text-[11px] font-semibold text-slate-400">Bowling Magic</span>
                <span className="font-bold text-pink-400 group-hover:underline">Open Card →</span>
              </div>
            </div>

          </div>

          {/* 🌟 Total Community Runs & Wickets Banner (English) */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-[#1877F2] p-6 sm:p-8 text-white shadow-2xl shadow-[#1877F2]/20">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#bfdbfe]">Overall Community History</span>
              <h4 className="mt-1 text-2xl sm:text-3xl font-black">{totalCommunityRuns ? `${totalCommunityRuns.toLocaleString()}+ Runs` : "127,387+ Runs"}</h4>
              <p className="text-xs sm:text-sm text-[#dbeafe] mt-1">Combined milestone archive of all registered FCL players since 2013.</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-6 py-4 text-center shrink-0 border border-white/20 backdrop-blur-md">
              <p className="text-[10px] uppercase font-bold text-white/85">Total Wickets</p>
              <p className="text-2xl sm:text-3xl font-black text-white">{totalCommunityWickets ? `${totalCommunityWickets.toLocaleString()}` : "10,303"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
          <p className="text-xs text-[#94a3b8]">© 2026 Facebook Cricket League | Arif Md. Jiad | All rights reserved.</p>
        </div>
      </footer>

      {/* 🌟 Centralized Player Card Modal */}
      <PlayerCardModal
        selectedPlayer={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        tournamentsData={tournamentsData}
        allPlayers={playersData}
      />
    </main>
  );
}