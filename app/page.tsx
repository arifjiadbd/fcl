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
        if (data.players && Array.isArray(data.players)) {
          setPlayersData(data.players);
        } else if (Array.isArray(data)) {
          setPlayersData(data);
        }
        if (data.tournaments && Array.isArray(data.tournaments)) {
          setTournamentsData(data.tournaments);
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
      link.download = `fcl-stat-card-${safeName}-${cardTheme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export card image:", err);
      alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setDownloading(false);
    }
  };

  const top3Mvp = [...playersData]
    .sort((a, b) => calculateFclPoints(b) - calculateFclPoints(a))
    .slice(0, 3);

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

  // নির্বাচিত প্লেয়ারের টুর্নামেন্ট হিস্ট্রি ফিল্টার
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

          {/* Desktop Navigation */}
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
            <Link href="/memories" className="text-sm font-bold text-[#f472b6] transition hover:text-white flex items-center gap-1">
              Memories 📖
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            <Link
              href="/bn"
              className="flex items-center gap-1.5 rounded-full border border-[#1877F2]/40 bg-gradient-to-r from-[#1877F2] to-[#166fe5] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:brightness-110 active:scale-95"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#1877F2]">
                f
              </span>
              <span>ফেসবুক মোড</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e293b] bg-[#0b1220] text-white transition hover:border-[#1877F2]/50 lg:hidden"
            >
              {mobileMenuOpen ? <span className="text-xl font-bold">✕</span> : <span className="text-xl">☰</span>}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-[#1e293b] bg-[#030712] px-6 py-5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1877F2]/10">
                🏠 Home
              </Link>
              <Link href="/bn" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#1877F2]/20 border border-[#1877F2]/40 px-3 py-2 text-sm font-bold text-[#60a5fa]">
                💙 ফেসবুক মোড (বাংলা)
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
              <Link href="/memories" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-[#f472b6] transition hover:bg-[#f472b6]/10">
                📖 FCL Memories & Nostalgia
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
                  href="/bn"
                  className="rounded-xl border border-[#1877F2]/40 bg-[#1877F2]/15 px-7 py-3.5 text-sm font-bold text-[#60a5fa] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-[#1877F2] hover:text-white"
                >
                  💙 ফেসবুক মোড (বাংলা)
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
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 ALL-TIME TOP 3 MVP PODIUM */}
      <section id="mvp-podium" className="relative overflow-hidden border-t border-[#172033] bg-[#020617] px-6 py-24">
        <div className="mx-auto max-w-7xl">
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
            </div>

            <Link
              href="/rankings"
              className="rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-5 py-2.5 text-xs font-extrabold text-[#fbbf24] shadow-lg shadow-[#f59e0b]/15 transition hover:bg-[#f59e0b] hover:text-black"
            >
              👑 View Complete MVP Leaderboard →
            </Link>
          </div>

          <div className="relative grid gap-6 md:grid-cols-3">
            {top3Mvp.map((player, idx) => {
              const rank = idx + 1;
              const points = calculateFclPoints(player);

              return (
                <div
                  key={player.name + idx}
                  onClick={() => {
                    setSelectedPlayer(player);
                    setActiveTab("card");
                  }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#f59e0b]/40 bg-gradient-to-b from-[#181103] to-[#070501] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#f59e0b]"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/20 px-3 py-1 text-[10px] font-black uppercase text-[#fbbf24]">
                      👑 #{rank} MVP
                    </span>
                    <span className="text-xs font-bold text-[#64748b]">FCL Pinnacle</span>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/10 bg-[#0b1329]">
                      <img
                        src={`/players/${(player.nickName || "").toLowerCase().trim()}.jpg`}
                        alt={player.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = '<div class="flex h-full w-full items-center justify-center text-3xl">🏏</div>';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xl font-black text-white group-hover:text-[#60a5fa] transition break-words">
                        {player.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#94a3b8]">@{player.nickName || player.name}</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/60 p-4 text-center">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#94a3b8]">Performance Rating</p>
                    <p className="mt-1 text-3xl font-black text-[#fbbf24]">
                      {points.toLocaleString()} <span className="text-sm font-bold text-[#94a3b8]">PTS</span>
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-[#94a3b8]">
                    <span>Inspect Player Details</span>
                    <span className="font-extrabold text-white group-hover:underline">Open Official Card →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🏆 FCL RECORD CORNER */}
      <section id="records" className="relative overflow-hidden border-t border-[#172033] bg-[#02050b] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="relative mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="h-2 w-2 rounded-full bg-[#1877F2] shadow-lg shadow-[#1877F2]/50 inline-block mr-2" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#1877F2]">FCL Benchmarks</span>
              <h3 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">FCL Record Corner</h3>
            </div>
            <Link
              href="/records"
              className="rounded-xl border border-[#1877F2]/40 bg-[#1877F2]/10 px-5 py-2.5 text-xs font-extrabold text-[#60a5fa] transition hover:bg-[#1877F2] hover:text-white"
            >
              View Hall of Fame Cabinet →
            </Link>
          </div>

          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Champion */}
            <div
              onClick={() => { setSelectedPlayer(mostChampionshipPlayer); setActiveTab("card"); }}
              className="cursor-pointer rounded-3xl border border-[#eab308]/40 bg-gradient-to-b from-[#211704] to-[#0c0801] p-6 hover:-translate-y-1.5 transition"
            >
              <span className="rounded-lg bg-[#eab308]/10 border border-[#eab308]/30 px-3 py-1 text-[10px] font-black text-[#fde047]">🏆 Champion</span>
              <p className="mt-4 text-4xl font-black text-[#fde047]">{mostChampionshipPlayer?.champion || 6}</p>
              <p className="text-xs text-[#94a3b8] mt-1">Titles Won</p>
              <p className="text-sm font-black text-white mt-4">{mostChampionshipPlayer?.name || "Arif Ziad"}</p>
            </div>

            {/* 2. Runs */}
            <div
              onClick={() => { setSelectedPlayer(topRunScorer); setActiveTab("card"); }}
              className="cursor-pointer rounded-3xl border border-[#1877F2]/40 bg-gradient-to-b from-[#0b1329] to-[#040817] p-6 hover:-translate-y-1.5 transition"
            >
              <span className="rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/30 px-3 py-1 text-[10px] font-black text-[#60a5fa]">🏏 All-Time Runs</span>
              <p className="mt-4 text-4xl font-black text-[#60a5fa]">{topRunScorer?.runs?.toLocaleString() || "3,317"}</p>
              <p className="text-xs text-[#94a3b8] mt-1">Career Runs</p>
              <p className="text-sm font-black text-white mt-4">{topRunScorer?.name || "Jahin Shahriar Chowdhury"}</p>
            </div>

            {/* 3. Wickets */}
            <div
              onClick={() => { setSelectedPlayer(topWicketTaker); setActiveTab("card"); }}
              className="cursor-pointer rounded-3xl border border-[#f59e0b]/40 bg-gradient-to-b from-[#211603] to-[#0c0801] p-6 hover:-translate-y-1.5 transition"
            >
              <span className="rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-3 py-1 text-[10px] font-black text-[#fbbf24]">🎯 All-Time Wickets</span>
              <p className="mt-4 text-4xl font-black text-[#fbbf24]">{topWicketTaker?.wickets || 332}</p>
              <p className="text-xs text-[#94a3b8] mt-1">Career Wickets</p>
              <p className="text-sm font-black text-white mt-4">{topWicketTaker?.name || "Zaheed Hasan"}</p>
            </div>

            {/* 4. Finals */}
            <div
              onClick={() => { setSelectedPlayer(mostFinalsPlayer); setActiveTab("card"); }}
              className="cursor-pointer rounded-3xl border border-[#38bdf8]/40 bg-gradient-to-b from-[#081a29] to-[#020912] p-6 hover:-translate-y-1.5 transition"
            >
              <span className="rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-3 py-1 text-[10px] font-black text-[#38bdf8]">⚔️ Total Finals</span>
              <p className="mt-4 text-4xl font-black text-[#38bdf8]">{mostFinalsPlayer?.totalFinal || 9}</p>
              <p className="text-xs text-[#94a3b8] mt-1">Final Appearances</p>
              <p className="text-sm font-black text-white mt-4">{mostFinalsPlayer?.name || "Tanvir Shakib"}</p>
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
      {/* 🌟 DUAL TAB MODAL (PAGE 1: STAT CARD | PAGE 2: TOURNAMENT BREAKDOWN) */}
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
            {/* STICKY TOP CONTROLS & DUAL TABS */}
            <div
              className={`shrink-0 flex flex-wrap items-center justify-between gap-2 border-b px-3.5 py-2.5 ${
                cardTheme === "dark" ? "border-[#1e293b] bg-[#0b1329]" : "border-[#ced0d4] bg-white"
              }`}
            >
              {/* PAGE 1 VS PAGE 2 SWITCHER */}
              <div className="flex items-center gap-1 rounded-xl bg-black/20 p-1 border border-white/10">
                <button
                  onClick={() => setActiveTab("card")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "card"
                      ? "bg-[#1877F2] text-white shadow"
                      : "text-[#94a3b8] hover:text-white"
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
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  <span>📊</span>
                  <span>Tournament History ({playerTournamentHistory.length})</span>
                </button>
              </div>

              {/* CARD THEME SWITCH & CLOSE */}
              <div className="flex items-center gap-2">
                {activeTab === "card" && (
                  <div className="flex items-center gap-1 rounded-xl bg-black/20 p-1 border border-white/10">
                    <button
                      onClick={() => setCardTheme("dark")}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        cardTheme === "dark" ? "bg-[#1877F2] text-white" : "text-[#94a3b8]"
                      }`}
                    >
                      🌙 Dark
                    </button>
                    <button
                      onClick={() => setCardTheme("light")}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        cardTheme === "light" ? "bg-white text-[#1877F2] font-black" : "text-[#94a3b8]"
                      }`}
                    >
                      ☀️ Light
                    </button>
                  </div>
                )}

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

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 sm:p-4">
              {/* ========================================= */}
              {/* TAB 1: OFFICIAL DIGITAL STAT CARD */}
              {/* ========================================= */}
              {activeTab === "card" ? (
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

                  {/* Profile Row */}
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

                    {/* Total Final Box */}
                    <div className={`col-span-3 sm:col-span-1 rounded-xl border-2 p-2.5 sm:p-3 flex flex-row sm:flex-col justify-between sm:justify-center items-center text-center shadow-sm ${cardTheme === "dark" ? "border-[#f59e0b]/50 bg-gradient-to-b from-[#251804] to-[#120b02]" : "border-[#d97706]/50 bg-gradient-to-b from-[#fffbeb] to-[#fef3c7]"}`}>
                      <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${cardTheme === "dark" ? "text-[#fbbf24]" : "text-[#92400e]"}`}>
                        TOTAL FINAL
                      </span>
                      <p className={`text-2xl sm:text-4xl font-black my-0.5 ${cardTheme === "dark" ? "text-[#fde047]" : "text-[#b45309]"}`}>
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
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">Debut Date</p>
                      <p className="font-extrabold text-[#1877F2] text-xs sm:text-sm mt-1 truncate">{selectedPlayer.debutYear || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">Debut Tournament</p>
                      <p className={`font-extrabold text-xs sm:text-sm mt-1 leading-tight break-words ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>{selectedPlayer.debutTournament || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">Debut Team</p>
                      <p className={`font-extrabold text-xs sm:text-sm mt-1 leading-tight break-words ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>{selectedPlayer.debutTeam || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">Total Tournaments</p>
                      <p className="font-black text-[#16a34a] text-base sm:text-xl mt-0.5">{selectedPlayer.totalTournament ?? 0}</p>
                    </div>
                  </div>

                  {/* MVP & Rankings */}
                  <div className={`rounded-2xl border-2 p-3 sm:p-4 text-center shadow-lg ${cardTheme === "dark" ? "border-[#f59e0b]/50 bg-gradient-to-r from-[#1c1203] via-[#2c1c04] to-[#1c1203]" : "border-[#f59e0b] bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fffbeb]"}`}>
                    <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 border-b pb-2.5 ${cardTheme === "dark" ? "border-[#f59e0b]/25" : "border-[#f59e0b]/40"}`}>
                      <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#d97706] flex items-center gap-1.5">
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
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/25" : "bg-white border-[#f59e0b]/30"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#65676B]">Runs Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#16a34a] mt-0.5">#{getRank(selectedPlayer, "runs")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/25" : "bg-white border-[#f59e0b]/30"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#65676B]">Wickets Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#d97706] mt-0.5">#{getRank(selectedPlayer, "wickets")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/25" : "bg-white border-[#f59e0b]/30"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#65676B]">6s Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#7c3aed] mt-0.5">#{getRank(selectedPlayer, "sixes")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/25" : "bg-white border-[#f59e0b]/30"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#65676B]">Trophy Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#0284c7] mt-0.5">#{getRank(selectedPlayer, "champion")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className={`rounded-xl border p-3 sm:p-3.5 space-y-1.5 text-xs sm:text-[13px] ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Total Match:</span>
                        <strong className="font-extrabold">{selectedPlayer.matches}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Total Runs & Max:</span>
                        <strong className="text-[#16a34a] font-extrabold">{selectedPlayer.runs} ({selectedPlayer.maxRuns || "—"})</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Total Wickets & Max:</span>
                        <strong className="text-[#d97706] font-extrabold">{selectedPlayer.wickets} ({selectedPlayer.maxWickets || "—"})</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Boundaries (4&apos;s / 6&apos;s):</span>
                        <strong className="font-extrabold"><span className="text-[#0284c7]">{selectedPlayer.fours}</span> / <span className="text-[#7c3aed]">{selectedPlayer.sixes}</span></strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#65676B]">Career Hat-Trick:</span>
                        <strong className="text-[#db2777] font-extrabold">{selectedPlayer.hatTricks ?? 0}</strong>
                      </div>
                    </div>

                    <div className={`rounded-xl border p-3 sm:p-3.5 space-y-1.5 text-xs sm:text-[13px] ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Batting / Bowling Avg:</span>
                        <strong className="font-extrabold">{selectedPlayer.runAvg} / {selectedPlayer.wkAvg}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Champion / Runner-Up:</span>
                        <strong className="font-extrabold">🏆 {selectedPlayer.champion ?? 0} / 🥈 {selectedPlayer.runnersUp ?? 0}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">MOT / CPOT:</span>
                        <strong className="font-extrabold">⭐ {selectedPlayer.mot ?? 0} / {selectedPlayer.cpot ?? 0}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">MOM / CPOM:</span>
                        <strong className="font-extrabold">🎖️ {selectedPlayer.mom ?? 0} / {selectedPlayer.cpom ?? 0}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#65676B]">Top Scorer / Wicket Taker:</span>
                        <strong className="font-extrabold">{selectedPlayer.highestRunScorer ?? 0} / {selectedPlayer.topWicketTaker ?? 0}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2 text-[10px] text-[#65676B]">
                    <span>Last Played: <strong className="text-white">{selectedPlayer.lastPlayed || "—"}</strong></span>
                    <span className="font-bold">FCL Official Card</span>
                  </div>
                </div>
              ) : (
                /* ========================================= */
                /* TAB 2: TOURNAMENT HISTORY BREAKDOWN */
                /* ========================================= */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                        <span>📊</span>
                        <span>{selectedPlayer.name} এর টুর্নামেন্ট ইতিহাস</span>
                      </h4>
                      <p className="text-xs text-[#94a3b8] mt-0.5">
                        অংশগ্রহণ করা প্রতিটি আসরের ইন্ডিভিজুয়াল পারফরম্যান্স ব্রেকডাউন
                      </p>
                    </div>
                    <span className="rounded-lg bg-[#1877F2]/20 border border-[#1877F2]/40 px-3 py-1 text-xs font-bold text-[#60a5fa]">
                      মোট {playerTournamentHistory.length} টি আসর
                    </span>
                  </div>

                  {playerTournamentHistory.length === 0 ? (
                    <div className="rounded-2xl border border-[#1e293b] bg-[#070b16] p-8 text-center text-[#94a3b8]">
                      কোনো টুর্নামেন্ট রেকর্ড পাওয়া যায়নি
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {playerTournamentHistory.map((t, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-[#1e293b] bg-gradient-to-r from-[#0b1329] via-[#070e1e] to-[#040813] p-4 transition hover:border-[#1877F2]/50 shadow-md"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-[#1877F2] px-2.5 py-0.5 text-xs font-black text-white">
                                {t.tournament}
                              </span>
                              <span className="text-xs font-bold text-white">{t.team}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {t.chamRu && (
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                                    t.chamRu.toLowerCase().includes("champ")
                                      ? "bg-[#f59e0b]/20 border border-[#f59e0b]/50 text-[#fbbf24]"
                                      : "bg-[#94a3b8]/20 border border-[#94a3b8]/50 text-[#cbd5e1]"
                                  }`}
                                >
                                  {t.chamRu}
                                </span>
                              )}
                              {t.time && <span className="text-[10px] text-[#64748b]">📅 {t.time}</span>}
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2 text-center text-xs">
                            <div className="rounded-xl bg-black/40 p-2 border border-white/5">
                              <p className="text-[10px] text-[#64748b] uppercase">ম্যাচ</p>
                              <p className="font-black text-white text-sm mt-0.5">{t.matches}</p>
                            </div>
                            <div className="rounded-xl bg-black/40 p-2 border border-white/5">
                              <p className="text-[10px] text-[#64748b] uppercase">রান</p>
                              <p className="font-black text-[#22c55e] text-sm mt-0.5">{t.runs}</p>
                            </div>
                            <div className="rounded-xl bg-black/40 p-2 border border-white/5">
                              <p className="text-[10px] text-[#64748b] uppercase">উইকেট</p>
                              <p className="font-black text-[#f59e0b] text-sm mt-0.5">{t.wickets}</p>
                            </div>
                            <div className="rounded-xl bg-black/40 p-2 border border-white/5">
                              <p className="text-[10px] text-[#64748b] uppercase">ইনিংস</p>
                              <p className="font-black text-white text-sm mt-0.5">{t.innings}</p>
                            </div>
                            <div className="rounded-xl bg-black/40 p-2 border border-white/5">
                              <p className="text-[10px] text-[#64748b] uppercase">৪ / ৬</p>
                              <p className="font-black text-[#38bdf8] text-sm mt-0.5">{t.fours} / {t.sixes}</p>
                            </div>
                            <div className="rounded-xl bg-black/40 p-2 border border-white/5">
                              <p className="text-[10px] text-[#64748b] uppercase">অ্যাওয়ার্ড</p>
                              <p className="font-black text-[#ec4899] text-sm mt-0.5 truncate">
                                {t.motCpot || (t.mom ? `${t.mom}x MOM` : "—")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STICKY BOTTOM ACTION BAR */}
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