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
  const [cardTheme, setCardTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"card" | "history">("card");
  const [downloading, setDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadCard = async () => {
    if (!cardRef.current || !selectedPlayer) return;

    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      const safeName = (selectedPlayer.nickName || selectedPlayer.name || "player").toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `fcl-stat-card-${safeName}-${cardTheme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setDownloading(false);
    }
  };

  const top3Mvp = [...playersData].sort((a, b) => calculateFclPoints(b) - calculateFclPoints(a)).slice(0, 3);
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

  const playerTournamentHistory = selectedPlayer
    ? tournamentsData.filter((t) => {
        const pName = selectedPlayer.name.toLowerCase().trim();
        const pNick = (selectedPlayer.nickName || "").toLowerCase().trim();
        const rowPlayer = t.playerName.toLowerCase().trim();
        const rowNick = t.name.toLowerCase().trim();
        return (
          rowPlayer === pName ||
          (pNick && rowNick === pNick) ||
          (rowPlayer && pName.includes(rowPlayer)) ||
          (pName && rowPlayer.includes(pName))
        );
      })
    : [];

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
              <span>ফেসবুক মোড</span>
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
              <Link href="/bn" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#1877F2]/20 border border-[#1877F2]/40 px-3 py-2 text-sm font-bold text-[#60a5fa]">💙 ফেসবুক মোড (বাংলা)</Link>
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
                  💙 ফেসবুক মোড (বাংলা)
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

      {/* 🌟 100% RESTORED ABOUT FCL SECTION */}
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

      {/* 🌟 100% RESTORED ALL-TIME TOP 3 MVP LEGENDS PODIUM */}
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
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                The highest-impact players in FCL history, dynamically evaluated through total runs, wickets, tournament championships, and awards. Click any card to inspect full stats.
              </p>
            </div>

            <Link
              href="/rankings"
              className="rounded-xl border border-[#f59e0b]/50 bg-gradient-to-r from-[#2a1b04] to-[#170f02] px-6 py-3 text-xs font-black text-[#fbbf24] shadow-lg shadow-[#f59e0b]/20 hover:border-[#f59e0b] transition"
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
                  ? {
                      border: "border-2 border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.25)]",
                      bg: "bg-gradient-to-b from-[#1c1203] via-[#0d0901] to-[#040300]",
                      tag: "border-[#f59e0b]/50 bg-[#f59e0b]/20 text-[#fbbf24]",
                      badge: "bg-[#f59e0b] text-black font-black",
                      glow: "via-[#f59e0b]",
                      highlight: "text-[#fbbf24] drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]",
                      icon: "👑",
                      label: "GOLD MEDALIST • #01 MVP",
                    }
                  : rank === 2
                  ? {
                      border: "border-2 border-[#94a3b8] shadow-[0_0_30px_rgba(148,163,184,0.2)]",
                      bg: "bg-gradient-to-b from-[#171d28] via-[#0c1017] to-[#030508]",
                      tag: "border-[#94a3b8]/50 bg-[#94a3b8]/20 text-[#e2e8f0]",
                      badge: "bg-[#cbd5e1] text-black font-black",
                      glow: "via-[#cbd5e1]",
                      highlight: "text-[#f1f5f9] drop-shadow-[0_0_15px_rgba(203,213,225,0.5)]",
                      icon: "🥈",
                      label: "SILVER MEDALIST • #02 MVP",
                    }
                  : {
                      border: "border-2 border-[#d97706] shadow-[0_0_30px_rgba(217,119,6,0.2)]",
                      bg: "bg-gradient-to-b from-[#1a1005] via-[#0e0802] to-[#030200]",
                      tag: "border-[#d97706]/50 bg-[#d97706]/20 text-[#fcd34d]",
                      badge: "bg-[#d97706] text-white font-black",
                      glow: "via-[#d97706]",
                      highlight: "text-[#fbbf24] drop-shadow-[0_0_15px_rgba(217,119,6,0.5)]",
                      icon: "🥉",
                      label: "BRONZE MEDALIST • #03 MVP",
                    };

              return (
                <div
                  key={player.name + idx}
                  onClick={() => { setSelectedPlayer(player); setActiveTab("card"); }}
                  className={`group relative cursor-pointer overflow-hidden rounded-[2rem] ${badgeColors.border} ${badgeColors.bg} p-6 sm:p-7 transition-all duration-300 hover:-translate-y-2`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent ${badgeColors.glow} to-transparent`} />

                  <div className="flex items-center justify-between">
                    <span className={`rounded-xl border px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider ${badgeColors.tag}`}>
                      {badgeColors.icon} {badgeColors.label}
                    </span>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm ${badgeColors.badge}`}>
                      #{rank}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 border-white/10 bg-[#0b1329] p-0.5 shadow-lg group-hover:scale-105 transition">
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
                      <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#60a5fa] transition break-words leading-snug">
                        {player.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#94a3b8] truncate mt-0.5">
                        @{player.nickName || player.name} • {player.role || "All-Rounder"}
                      </p>
                      <p className="text-[11px] text-[#64748b] mt-0.5 font-medium">
                        {player.matches} Matches • {player.champion || 0}x Champion
                      </p>
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

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5 text-xs text-[#94a3b8]">
                    <span>FCL League Rating</span>
                    <span className="font-extrabold text-white group-hover:underline">Open Official Card →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🏆 100% RESTORED FCL RECORD CORNER (4x2 ULTRA-PREMIUM GRID) */}
      <section id="records" className="relative overflow-hidden border-t border-[#172033] bg-[#02050b] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#1877F2]/10 blur-[130px]" />

          <div className="relative mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1877F2] shadow-lg shadow-[#1877F2]/60 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1877F2]">FCL STATISTICS & BENCHMARKS</p>
              </div>
              <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">FCL Record Corner</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">All-time historical benchmarks, individual records and milestone stats directly synced from tournament records.</p>
            </div>
            <Link
              href="/records"
              className="rounded-xl border border-[#1877F2]/50 bg-gradient-to-r from-[#0d1c38] to-[#071124] px-6 py-3 text-xs font-black text-[#60a5fa] shadow-lg shadow-[#1877F2]/20 hover:border-[#1877F2] transition"
            >
              View Hall of Fame Cabinet →
            </Link>
          </div>

          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Champion */}
            <div
              onClick={() => { setSelectedPlayer(mostChampionshipPlayer); setActiveTab("card"); }}
              className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-[#eab308]/40 bg-gradient-to-b from-[#211704] to-[#0c0801] p-6 hover:-translate-y-2 hover:border-[#eab308] transition flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#eab308] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#eab308]/40 bg-[#eab308]/15 px-3 py-1 text-[10px] font-black uppercase text-[#fde047]">🏆 CHAMPION</span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>
                <div className="mt-5 rounded-2xl border border-[#eab308]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">TITLES WON</p>
                  <p className="mt-1 text-4xl font-black text-[#fde047] drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]">{mostChampionshipPlayer?.champion || 6}</p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">6x Tournament Winner</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#eab308]/30 bg-[#1f1707] text-2xl">⭐</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">RECORD HOLDER</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#fde047] transition truncate">{mostChampionshipPlayer?.name || "Arif Ziad"}</h4>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#2e2008] pt-3 text-[10px] text-[#64748b]">
                  <span>Most Titles</span>
                  <span className="text-[#fde047] font-bold">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 2. Runs */}
            <div
              onClick={() => { setSelectedPlayer(topRunScorer); setActiveTab("card"); }}
              className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-[#1877F2]/40 bg-gradient-to-b from-[#0b1329] to-[#040817] p-6 hover:-translate-y-2 hover:border-[#1877F2] transition flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1877F2] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#1877F2]/40 bg-[#1877F2]/15 px-3 py-1 text-[10px] font-black uppercase text-[#60a5fa]">🏏 ALL-TIME RUNS</span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>
                <div className="mt-5 rounded-2xl border border-[#1877F2]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">CAREER RECORD RUNS</p>
                  <p className="mt-1 text-4xl font-black text-[#60a5fa] drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]">{topRunScorer?.runs?.toLocaleString() || "3,317"}</p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">In {topRunScorer?.matches || 168} Mat • Avg {topRunScorer?.runAvg || "15.22"}</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#1877F2]/30 bg-[#111936] text-2xl">👑</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">RECORD HOLDER</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#60a5fa] transition truncate">{topRunScorer?.name || "Jahin Shahriar Chowdhury"}</h4>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#17233f] pt-3 text-[10px] text-[#64748b]">
                  <span>Run King</span>
                  <span className="text-[#60a5fa] font-bold">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 3. Wickets */}
            <div
              onClick={() => { setSelectedPlayer(topWicketTaker); setActiveTab("card"); }}
              className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-[#f59e0b]/40 bg-gradient-to-b from-[#211603] to-[#0c0801] p-6 hover:-translate-y-2 hover:border-[#f59e0b] transition flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#f59e0b]/40 bg-[#f59e0b]/15 px-3 py-1 text-[10px] font-black uppercase text-[#fbbf24]">🎯 ALL-TIME WICKETS</span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>
                <div className="mt-5 rounded-2xl border border-[#f59e0b]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">CAREER RECORD WICKETS</p>
                  <p className="mt-1 text-4xl font-black text-[#fbbf24] drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">{topWicketTaker?.wickets || 332}</p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">In {topWicketTaker?.matches || 167} Mat • Avg {topWicketTaker?.wkAvg || "1.99"}</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#f59e0b]/30 bg-[#1f1707] text-2xl">⚡</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">RECORD HOLDER</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#fbbf24] transition truncate">{topWicketTaker?.name || "Zaheed Hasan"}</h4>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#2e2008] pt-3 text-[10px] text-[#64748b]">
                  <span>Strike Bowler</span>
                  <span className="text-[#fbbf24] font-bold">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 4. Finals */}
            <div
              onClick={() => { setSelectedPlayer(mostFinalsPlayer); setActiveTab("card"); }}
              className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-[#38bdf8]/40 bg-gradient-to-b from-[#081a29] to-[#020912] p-6 hover:-translate-y-2 hover:border-[#38bdf8] transition flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#38bdf8]/40 bg-[#38bdf8]/15 px-3 py-1 text-[10px] font-black uppercase text-[#38bdf8]">⚔️ TOTAL FINALS</span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>
                <div className="mt-5 rounded-2xl border border-[#38bdf8]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">FINAL APPEARANCES</p>
                  <p className="mt-1 text-4xl font-black text-[#38bdf8] drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">{mostFinalsPlayer?.totalFinal || 9}</p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">5x Champion • 4x Runner-Up</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#38bdf8]/30 bg-[#0c2438] text-2xl">🛡️</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">RECORD HOLDER</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#38bdf8] transition truncate">{mostFinalsPlayer?.name || "Tanvir Shakib"}</h4>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#132d42] pt-3 text-[10px] text-[#64748b]">
                  <span>Big Match Legend</span>
                  <span className="text-[#38bdf8] font-bold">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 5. Most Matches */}
            <div
              onClick={() => { setSelectedPlayer(mostMatchesPlayer); setActiveTab("card"); }}
              className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-[#22c55e]/40 bg-gradient-to-b from-[#091f13] to-[#020d07] p-6 hover:-translate-y-2 hover:border-[#22c55e] transition flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#22c55e]/40 bg-[#22c55e]/15 px-3 py-1 text-[10px] font-black uppercase text-[#4ade80]">⚡ MOST MATCHES</span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>
                <div className="mt-5 rounded-2xl border border-[#22c55e]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">CAPS PLAYED</p>
                  <p className="mt-1 text-4xl font-black text-[#4ade80] drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">{mostMatchesPlayer?.matches || 171}</p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">261 Career Wickets</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#22c55e]/30 bg-[#0f2416] text-2xl">🛡️</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">IRON MAN OF FCL</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#4ade80] transition truncate">{mostMatchesPlayer?.name || "Sadrul Anam"}</h4>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#122e1b] pt-3 text-[10px] text-[#64748b]">
                  <span>Appearances</span>
                  <span className="text-[#4ade80] font-bold">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 6. Sixes */}
            <div
              onClick={() => { setSelectedPlayer(mostSixesPlayer); setActiveTab("card"); }}
              className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-[#8b5cf6]/40 bg-gradient-to-b from-[#18112d] to-[#070410] p-6 hover:-translate-y-2 hover:border-[#8b5cf6] transition flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#8b5cf6]/40 bg-[#8b5cf6]/15 px-3 py-1 text-[10px] font-black uppercase text-[#c084fc]">💥 SIX MACHINE</span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>
                <div className="mt-5 rounded-2xl border border-[#8b5cf6]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">TOTAL SIXES CLEARED</p>
                  <p className="mt-1 text-4xl font-black text-[#c084fc] drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]">{mostSixesPlayer?.sixes || 176}</p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">{mostSixesPlayer?.runs || 2745} Career Runs</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#8b5cf6]/30 bg-[#1e153b] text-2xl">💣</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">POWER HITTER</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#c084fc] transition truncate">{mostSixesPlayer?.name || "Shahriar Khokon"}</h4>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#251845] pt-3 text-[10px] text-[#64748b]">
                  <span>Maximum Sixes</span>
                  <span className="text-[#c084fc] font-bold">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 7. Hat-Tricks */}
            <div
              onClick={() => { setSelectedPlayer(topHatTrickPlayer); setActiveTab("card"); }}
              className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-[#ec4899]/40 bg-gradient-to-b from-[#240a16] to-[#0c0207] p-6 hover:-translate-y-2 hover:border-[#ec4899] transition flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ec4899] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#ec4899]/40 bg-[#ec4899]/15 px-3 py-1 text-[10px] font-black uppercase text-[#f472b6]">🔥 HAT-TRICKS</span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>
                <div className="mt-5 rounded-2xl border border-[#ec4899]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">CAREER HAT-TRICKS</p>
                  <p className="mt-1 text-4xl font-black text-[#f472b6] drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]">{topHatTrickPlayer?.hatTricks || 12}x</p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">All-Time Bowling Record</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#ec4899]/30 bg-[#2b0f1d] text-2xl">🎯</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">HAT-TRICK HERO</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#f472b6] transition truncate">{topHatTrickPlayer?.name || "Zaheed Hasan"}</h4>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#361324] pt-3 text-[10px] text-[#64748b]">
                  <span>Record Bowler</span>
                  <span className="text-[#f472b6] font-bold">Open Card →</span>
                </div>
              </div>
            </div>

            {/* 8. MOT / CPOT */}
            <div
              onClick={() => { setSelectedPlayer(mostMotPlayer); setActiveTab("card"); }}
              className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-[#f59e0b]/40 bg-gradient-to-b from-[#211603] to-[#0c0801] p-6 hover:-translate-y-2 hover:border-[#f59e0b] transition flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#f59e0b]/40 bg-[#f59e0b]/15 px-3 py-1 text-[10px] font-black uppercase text-[#fbbf24]">⭐ MOT / CPOT</span>
                  <span className="text-xs font-bold text-[#64748b]">#01</span>
                </div>
                <div className="mt-5 rounded-2xl border border-[#f59e0b]/20 bg-[#020617]/80 p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">TOURNAMENT BEST</p>
                  <p className="mt-1 text-4xl font-black text-[#fbbf24] drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    {(mostMotPlayer?.mot || 0) + (mostMotPlayer?.cpot || 0)}x
                  </p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">Tournament MVP Honors</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#f59e0b]/30 bg-[#1f1707] text-2xl">🎖️</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b]">AWARD WINNER</p>
                    <h4 className="text-base font-black text-white group-hover:text-[#fbbf24] transition truncate">{mostMotPlayer?.name || "Player of Tournament"}</h4>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#2e2008] pt-3 text-[10px] text-[#64748b]">
                  <span>Tournament MVP</span>
                  <span className="text-[#fbbf24] font-bold">Open Card →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
          <p className="text-xs text-[#94a3b8]">© 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.</p>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 🌟 STAT CARD MODAL (THEME-ADAPTIVE TOURNAMENT HISTORY + NEON GLOWS) */}
      {/* ========================================================================= */}
      {selectedPlayer && (
        <div
          onClick={() => setSelectedPlayer(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className={`relative flex h-[94vh] sm:h-auto sm:max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl transition-colors duration-200 ${
              cardTheme === "dark"
                ? "border-[#38bdf8]/40 bg-[#0f172a] shadow-[#0284c7]/20 text-white"
                : "border-[#ced0d4] bg-[#F0F2F5] shadow-2xl text-[#1c1e21]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Tabs */}
            <div
              className={`shrink-0 flex flex-wrap items-center justify-between gap-2 border-b px-3.5 py-2.5 ${
                cardTheme === "dark" ? "border-[#1e293b] bg-[#0b1329]" : "border-[#ced0d4] bg-white"
              }`}
            >
              <div className="flex items-center gap-1 rounded-xl bg-black/20 p-1 border border-white/10">
                <button
                  onClick={() => setActiveTab("card")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "card"
                      ? "bg-[#1877F2] text-white shadow"
                      : cardTheme === "dark" ? "text-[#94a3b8] hover:text-white" : "text-[#65676B] hover:text-[#050505]"
                  }`}
                >
                  <span>🎖️</span>
                  <span>Stat Card</span>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "history"
                      ? "bg-[#1877F2] text-white shadow font-black"
                      : cardTheme === "dark" ? "text-[#94a3b8] hover:text-white" : "text-[#65676B] hover:text-[#050505]"
                  }`}
                >
                  <span>📊</span>
                  <span>Tournament History ({playerTournamentHistory.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* 🌟 THEME TOGGLE (WORKS ON BOTH TABS) */}
                <div className="flex items-center gap-1 rounded-xl bg-black/20 p-1 border border-white/10">
                  <button
                    onClick={() => setCardTheme("dark")}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                      cardTheme === "dark" ? "bg-[#1877F2] text-white shadow" : "text-[#94a3b8] hover:text-white"
                    }`}
                  >
                    🌙 Dark
                  </button>
                  <button
                    onClick={() => setCardTheme("light")}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                      cardTheme === "light" ? "bg-white text-[#1877F2] font-black shadow" : "text-[#94a3b8] hover:text-white"
                    }`}
                  >
                    ☀️ Light
                  </button>
                </div>

                <button
                  onClick={() => setSelectedPlayer(null)}
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border text-xs sm:text-sm font-bold transition ${
                    cardTheme === "dark"
                      ? "border-white/10 bg-[#070b16] text-white hover:bg-white/20"
                      : "border-[#ced0d4] bg-white text-[#050505] hover:bg-[#E4E6EB]"
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 sm:p-4">
              {activeTab === "card" ? (
                /* TAB 1: NEON ENHANCED STAT CARD */
                <div
                  ref={cardRef}
                  className={`mx-auto rounded-2xl border p-3.5 sm:p-5 space-y-3.5 transition-colors duration-200 ${
                    cardTheme === "dark"
                      ? "border-[#1e293b] bg-[#0b132b] text-white"
                      : "border-[#ced0d4] bg-white text-[#1c1e21] shadow-xl"
                  }`}
                >
                  {/* Banner */}
                  <div className={`flex items-center justify-between border-b pb-3 ${cardTheme === "dark" ? "border-[#38bdf8]/30" : "border-[#ced0d4]"}`}>
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className={`flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-xl border p-1 shadow-md shrink-0 ${cardTheme === "dark" ? "border-[#38bdf8]/50 bg-[#080d1a]" : "border-[#1877F2]/40 bg-[#E7F3FF]"}`}>
                        <img src="/fcl-logo.png" alt="FCL" className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <h3 className={`text-base sm:text-2xl font-black uppercase tracking-wider ${cardTheme === "dark" ? "text-[#e0f2fe]" : "text-[#1877F2]"}`}>
                          Player Statistics Card
                        </h3>
                        <p className={`text-[10px] sm:text-xs font-semibold tracking-wide ${cardTheme === "dark" ? "text-[#38bdf8]" : "text-[#65676B]"}`}>
                          Facebook Cricket League (FCL)
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] sm:text-xs font-bold ${cardTheme === "dark" ? "border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]" : "border-[#1877F2]/30 bg-[#E7F3FF] text-[#1877F2]"}`}>
                      OFFICIAL
                    </span>
                  </div>

                  {/* Profile Top Row with Full Name & Neon High-Contrast Total Final Box */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className={`relative flex items-center justify-center rounded-xl border-2 p-1.5 aspect-square ${cardTheme === "dark" ? "border-[#38bdf8]/40 bg-[#070b16]" : "border-[#1877F2]/40 bg-[#F0F2F5]"}`}>
                      <img
                        src={`/players/${(selectedPlayer.nickName || "").toLowerCase().trim()}.jpg`}
                        alt={selectedPlayer.name}
                        className="h-full w-full rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl">🏏</span>';
                        }}
                      />
                      {selectedPlayer.nickName && (
                        <div className="absolute bottom-1 right-1 rounded bg-[#1877F2] px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                          {selectedPlayer.nickName}
                        </div>
                      )}
                    </div>

                    <div className={`col-span-2 rounded-xl border p-3 sm:p-3.5 flex flex-col justify-center min-w-0 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#65676B]">Player Name</span>
                      <h4 className={`text-sm sm:text-base md:text-lg font-black break-words leading-tight mt-1 ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>
                        {selectedPlayer.name}
                      </h4>
                      {selectedPlayer.nickName && (
                        <p className="text-xs sm:text-sm font-semibold text-[#1877F2] truncate mt-0.5">@{selectedPlayer.nickName}</p>
                      )}
                      <div className={`mt-2 pt-2 border-t flex items-center justify-between ${cardTheme === "dark" ? "border-[#1e293b]" : "border-[#ced0d4]"}`}>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#65676B]">Role:</span>
                        <span className="text-xs sm:text-sm font-bold text-[#f59e0b] truncate">{selectedPlayer.role}</span>
                      </div>
                    </div>

                    {/* NEON TOTAL FINAL BOX */}
                    <div className={`col-span-3 sm:col-span-1 rounded-xl border-2 p-2.5 sm:p-3 flex flex-row sm:flex-col justify-between sm:justify-center items-center text-center shadow-lg ${cardTheme === "dark" ? "border-[#f59e0b] bg-gradient-to-b from-[#2a1b04] to-[#120b02]" : "border-[#d97706] bg-gradient-to-b from-[#fffbeb] to-[#fef3c7]"}`}>
                      <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${cardTheme === "dark" ? "text-[#fbbf24]" : "text-[#92400e]"}`}>
                        TOTAL FINAL
                      </span>
                      <p className={`text-2xl sm:text-4xl font-black my-0.5 ${cardTheme === "dark" ? "text-[#fde047] drop-shadow-[0_0_15px_rgba(253,224,71,0.6)]" : "text-[#b45309]"}`}>
                        {selectedPlayer.totalFinal ?? 0}
                      </p>
                      <span className={`text-[9px] sm:text-[10px] font-extrabold ${cardTheme === "dark" ? "text-[#e2e8f0]" : "text-[#78350f]"}`}>
                        Finals Played
                      </span>
                    </div>
                  </div>

                  {/* Debut & Tournaments */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-center">
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <p className="text-[10px] uppercase font-bold text-[#94a3b8]">Debut Date</p>
                      <p className="font-extrabold text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.4)] text-xs sm:text-sm mt-1 truncate">{selectedPlayer.debutYear || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <p className="text-[10px] uppercase font-bold text-[#94a3b8]">Debut Tournament</p>
                      <p className={`font-extrabold text-xs sm:text-sm mt-1 leading-tight break-words ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>{selectedPlayer.debutTournament || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <p className="text-[10px] uppercase font-bold text-[#94a3b8]">Debut Team</p>
                      <p className={`font-extrabold text-xs sm:text-sm mt-1 leading-tight break-words ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>{selectedPlayer.debutTeam || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <p className="text-[10px] uppercase font-bold text-[#94a3b8]">Total Tournaments</p>
                      <p className="font-black text-[#22c55e] drop-shadow-[0_0_8px_rgba(34,197,94,0.4)] text-base sm:text-xl mt-0.5">{selectedPlayer.totalTournament ?? 0}</p>
                    </div>
                  </div>

                  {/* MVP Badge & Rankings */}
                  <div className={`rounded-2xl border-2 p-3 sm:p-4 text-center shadow-lg ${cardTheme === "dark" ? "border-[#f59e0b]/60 bg-gradient-to-r from-[#1c1203] via-[#2c1c04] to-[#1c1203]" : "border-[#f59e0b] bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fffbeb]"}`}>
                    <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 border-b pb-2.5 ${cardTheme === "dark" ? "border-[#f59e0b]/30" : "border-[#f59e0b]/40"}`}>
                      <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#f59e0b] flex items-center gap-1.5">
                        <span>⭐</span> ALL-TIME LEAGUE RANKINGS
                      </p>
                      <div className="inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 border shadow-md bg-gradient-to-r from-[#d97706] to-[#b45309] text-white">
                        <span>👑</span>
                        <span className="text-xs sm:text-sm font-black">#{getRank(selectedPlayer, "mvp")} MVP</span>
                        <span className="h-3.5 w-px bg-white/40" />
                        <span className="text-xs sm:text-sm font-extrabold text-amber-100">{calculateFclPoints(selectedPlayer).toLocaleString()} Pts</span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-[#f59e0b]/30 shadow-sm"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#94a3b8]">Runs Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#22c55e] drop-shadow-[0_0_8px_rgba(34,197,94,0.4)] mt-0.5">#{getRank(selectedPlayer, "runs")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-[#f59e0b]/30 shadow-sm"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#94a3b8]">Wickets Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#f59e0b] drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] mt-0.5">#{getRank(selectedPlayer, "wickets")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-[#f59e0b]/30 shadow-sm"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#94a3b8]">6s Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#c084fc] drop-shadow-[0_0_8px_rgba(192,132,252,0.4)] mt-0.5">#{getRank(selectedPlayer, "sixes")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-[#f59e0b]/30 shadow-sm"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#94a3b8]">Trophy Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.4)] mt-0.5">#{getRank(selectedPlayer, "champion")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className={`rounded-xl border p-3 sm:p-3.5 space-y-2 text-xs sm:text-[13px] ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"}`}>
                        <span className="text-[#94a3b8] font-bold">Total Match:</span>
                        <strong className={`font-extrabold ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>{selectedPlayer.matches}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"}`}>
                        <span className="text-[#94a3b8] font-bold">Total Runs & Max:</span>
                        <strong className="text-[#22c55e] font-black drop-shadow-[0_0_8px_rgba(34,197,94,0.35)]">{selectedPlayer.runs} ({selectedPlayer.maxRuns || "—"})</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"}`}>
                        <span className="text-[#94a3b8] font-bold">Total Wickets & Max:</span>
                        <strong className="text-[#f59e0b] font-black drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]">{selectedPlayer.wickets} ({selectedPlayer.maxWickets || "—"})</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"}`}>
                        <span className="text-[#94a3b8] font-bold">Innings / Not Out:</span>
                        <strong className={`font-bold ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>{selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"}`}>
                        <span className="text-[#94a3b8] font-bold">Boundaries (4&apos;s / 6&apos;s):</span>
                        <strong className="font-extrabold"><span className="text-[#38bdf8]">{selectedPlayer.fours}</span> / <span className="text-[#c084fc]">{selectedPlayer.sixes}</span></strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94a3b8] font-bold">Career Hat-Trick:</span>
                        <strong className="text-[#f472b6] font-black drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]">{selectedPlayer.hatTricks ?? 0}</strong>
                      </div>
                    </div>

                    <div className={`rounded-xl border p-3 sm:p-3.5 space-y-2 text-xs sm:text-[13px] ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"}`}>
                        <span className="text-[#94a3b8] font-bold">Batting / Bowling Avg:</span>
                        <strong className={`font-extrabold ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>{selectedPlayer.runAvg} / {selectedPlayer.wkAvg}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"}`}>
                        <span className="text-[#94a3b8] font-bold">Champion / Runner-Up:</span>
                        <strong className="font-extrabold">🏆 <span className="text-[#f59e0b]">{selectedPlayer.champion ?? 0}</span> / 🥈 <span className="text-[#cbd5e1]">{selectedPlayer.runnersUp ?? 0}</span></strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"}`}>
                        <span className="text-[#94a3b8] font-bold">MOT / CPOT:</span>
                        <strong className="font-extrabold">⭐ <span className="text-[#c084fc]">{selectedPlayer.mot ?? 0}</span> / {selectedPlayer.cpot ?? 0}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"}`}>
                        <span className="text-[#94a3b8] font-bold">MOM / CPOM:</span>
                        <strong className="font-extrabold">🎖️ <span className="text-[#38bdf8]">{selectedPlayer.mom ?? 0}</span> / {selectedPlayer.cpom ?? 0}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94a3b8] font-bold">Top Scorer / Wicket Taker:</span>
                        <strong className="font-black text-[#fbbf24]">{selectedPlayer.highestRunScorer ?? 0} / {selectedPlayer.topWicketTaker ?? 0}</strong>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between border-t pt-2 text-[10px] ${cardTheme === "dark" ? "border-[#1e293b] text-[#64748b]" : "border-[#ced0d4] text-[#65676B]"}`}>
                    <span>Last Played: <strong className={cardTheme === "dark" ? "text-white" : "text-[#050505]"}>{selectedPlayer.lastPlayed || "—"}</strong></span>
                    <span className="font-bold">FCL Official Card</span>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* TAB 2: TOURNAMENT HISTORY (100% THEME ADAPTIVE: LIGHT & DARK) */
                /* ========================================================================= */
                <div className="space-y-4">
                  <div className={`flex items-center justify-between border-b pb-3 ${cardTheme === "dark" ? "border-[#1e293b]" : "border-[#ced0d4]"}`}>
                    <div>
                      <h4 className={`text-base sm:text-lg font-black flex items-center gap-2 ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>
                        <span>📊</span>
                        <span>{selectedPlayer.name} এর টুর্নামেন্ট ইতিহাস</span>
                      </h4>
                      <p className={`text-xs mt-0.5 ${cardTheme === "dark" ? "text-[#94a3b8]" : "text-[#65676B]"}`}>
                        অংশগ্রহণ করা প্রতিটি আসরের ইন্ডিভিজুয়াল পারফরম্যান্স ব্রেকডাউন
                      </p>
                    </div>
                    <span className={`rounded-lg px-3 py-1 text-xs font-bold ${cardTheme === "dark" ? "bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#60a5fa]" : "bg-[#E7F3FF] border border-[#1877F2]/30 text-[#1877F2]"}`}>
                      মোট {playerTournamentHistory.length} টি আসর
                    </span>
                  </div>

                  {playerTournamentHistory.length === 0 ? (
                    <div className={`rounded-2xl border p-8 text-center ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16] text-[#94a3b8]" : "border-[#ced0d4] bg-white text-[#65676B]"}`}>
                      কোনো টুর্নামেন্ট রেকর্ড পাওয়া যায়নি
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {playerTournamentHistory.map((t, idx) => {
                        const isTopScorer = Number(t.topScorer) === 1;
                        const isTopWicket = Number(t.topWicket) === 1;

                        const cardBg =
                          cardTheme === "dark"
                            ? isTopScorer || isTopWicket
                              ? "border-[#f59e0b] bg-gradient-to-r from-[#211603] via-[#0d0a02] to-[#040813] shadow-[#f59e0b]/15 text-white"
                              : "border-[#1e293b] bg-gradient-to-r from-[#0b1329] via-[#070e1e] to-[#040813] text-white"
                            : isTopScorer || isTopWicket
                            ? "border-[#f59e0b] bg-[#fffbeb] shadow-md text-[#1c1e21]"
                            : "border-[#ced0d4] bg-white shadow-sm text-[#1c1e21]";

                        const subBoxBg =
                          cardTheme === "dark"
                            ? "bg-black/40 border-white/5"
                            : "bg-[#F0F2F5] border-[#ced0d4]/40";

                        const labelColor = cardTheme === "dark" ? "text-[#94a3b8]" : "text-[#65676B]";
                        const numColor = cardTheme === "dark" ? "text-white" : "text-[#050505]";

                        return (
                          <div key={idx} className={`rounded-2xl border p-4 transition ${cardBg}`}>
                            <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 ${cardTheme === "dark" ? "border-white/10" : "border-[#ced0d4]"}`}>
                              <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-[#1877F2] px-2.5 py-0.5 text-xs font-black text-white">
                                  {t.tournament}
                                </span>
                                <span className={`text-xs font-bold ${numColor}`}>{t.team}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {t.chamRu && (
                                  <span
                                    className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                                      t.chamRu.toLowerCase().includes("champ")
                                        ? "bg-[#f59e0b]/20 border border-[#f59e0b]/50 text-[#d97706]"
                                        : "bg-[#94a3b8]/20 border border-[#94a3b8]/50 text-[#64748b]"
                                    }`}
                                  >
                                    {t.chamRu}
                                  </span>
                                )}
                                {t.time && <span className={`text-[11px] font-bold ${labelColor}`}>📅 {t.time}</span>}
                              </div>
                            </div>

                            {/* HIGHLIGHT BAR FOR TOP SCORER / TOP WICKET */}
                            {(isTopScorer || isTopWicket) && (
                              <div className={`mt-2.5 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-1.5 ${cardTheme === "dark" ? "border-[#f59e0b]/40 bg-[#f59e0b]/10" : "border-[#f59e0b] bg-[#fef3c7]"}`}>
                                {isTopScorer && (
                                  <span className="flex items-center gap-1 text-[11px] font-black text-[#d97706]">
                                    <span>🏏</span> TOP SCORER OF TOURNAMENT ({t.runs} Runs)
                                  </span>
                                )}
                                {isTopScorer && isTopWicket && <span className="text-[#f59e0b]">•</span>}
                                {isTopWicket && (
                                  <span className="flex items-center gap-1 text-[11px] font-black text-[#b45309]">
                                    <span>🎯</span> TOP WICKET TAKER OF TOURNAMENT ({t.wickets} Wkts)
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2 text-center text-xs">
                              <div className={`rounded-xl p-2 border ${subBoxBg}`}>
                                <p className={`text-[10px] uppercase font-bold ${labelColor}`}>ম্যাচ</p>
                                <p className={`font-black text-sm mt-0.5 ${numColor}`}>{t.matches}</p>
                              </div>
                              <div className={`rounded-xl p-2 border ${isTopScorer ? "bg-[#f59e0b]/20 border-[#f59e0b]" : subBoxBg}`}>
                                <p className={`text-[10px] uppercase font-bold ${labelColor}`}>রান</p>
                                <p className={`font-black text-sm mt-0.5 ${isTopScorer ? "text-[#d97706] text-base" : "text-[#16a34a]"}`}>
                                  {t.runs}
                                </p>
                              </div>
                              <div className={`rounded-xl p-2 border ${isTopWicket ? "bg-[#f59e0b]/20 border-[#f59e0b]" : subBoxBg}`}>
                                <p className={`text-[10px] uppercase font-bold ${labelColor}`}>উইকেট</p>
                                <p className={`font-black text-sm mt-0.5 ${isTopWicket ? "text-[#d97706] text-base" : "text-[#d97706]"}`}>
                                  {t.wickets}
                                </p>
                              </div>
                              <div className={`rounded-xl p-2 border ${subBoxBg}`}>
                                <p className={`text-[10px] uppercase font-bold ${labelColor}`}>ইনিংস</p>
                                <p className={`font-black text-sm mt-0.5 ${numColor}`}>{t.innings}</p>
                              </div>
                              <div className={`rounded-xl p-2 border ${subBoxBg}`}>
                                <p className={`text-[10px] uppercase font-bold ${labelColor}`}>৪ / ৬</p>
                                <p className="font-black text-[#0284c7] text-sm mt-0.5">{t.fours} / {t.sixes}</p>
                              </div>
                              <div className={`rounded-xl p-2 border ${subBoxBg}`}>
                                <p className={`text-[10px] uppercase font-bold ${labelColor}`}>অ্যাওয়ার্ড</p>
                                <p className="font-black text-[#7c3aed] text-sm mt-0.5 truncate">
                                  {t.motCpot || (t.mom ? `${t.mom}x MOM` : "—")}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div
              className={`shrink-0 flex gap-2 border-t p-2.5 sm:p-3 ${
                cardTheme === "dark" ? "border-[#1e293b] bg-[#0b1329]" : "border-[#ced0d4] bg-white"
              }`}
            >
              {activeTab === "card" ? (
                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#1877F2] to-[#0284c7] py-2.5 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {downloading ? "Downloading Card..." : `📥 Download ${cardTheme === "dark" ? "Dark" : "Light (White)"} Card`}
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab("card")}
                  className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#166fe5]"
                >
                  ← Back to Stat Card
                </button>
              )}

              <button
                onClick={() => setSelectedPlayer(null)}
                className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                  cardTheme === "dark"
                    ? "border-[#1e293b] bg-[#070b16] text-[#94a3b8] hover:text-white"
                    : "border-[#ced0d4] bg-[#E4E6EB] text-[#050505] hover:bg-[#d8dadf]"
                }`}
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