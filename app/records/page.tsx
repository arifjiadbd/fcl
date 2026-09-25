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

function formatSafeDate(val: any): string {
  if (!val) return "";
  const num = Number(val);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[dateInfo.getUTCMonth()]} ${dateInfo.getUTCFullYear()}`;
  }
  return String(val).trim().slice(0, 10);
}

export const calculateFclPoints = (p: Player): number => {
  if (!p) return 0;
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

export default function RecordsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "batting" | "bowling" | "honors">("all");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [cardTheme, setCardTheme] = useState<"dark" | "light">("dark");
  const [cardModalTab, setCardModalTab] = useState<"card" | "history">("card");
  const [downloading, setDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlayers(data);
        } else if (data.players && Array.isArray(data.players)) {
          setPlayers(data.players);
        }
        if (data.tournaments && Array.isArray(data.tournaments)) {
          setTournamentsData(data.tournaments);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading records:", err);
        setLoading(false);
      });
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
      alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে।");
    } finally {
      setDownloading(false);
    }
  };

  const getRank = (player: Player, type: "mvp" | "runs" | "wickets" | "sixes" | "champion") => {
    if (!player) return "—";
    const sorted = [...players].sort((a, b) => {
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

  const getDebutTournament = (p?: Player | null) => {
    if (!p) return "—";
    if (p.debutTournament && p.debutTournament !== "—" && p.debutTournament !== "") {
      return p.debutTournament;
    }
    if (playerTournamentHistory.length > 0) {
      return playerTournamentHistory[0].tournament;
    }
    return "—";
  };

  // 🌟 সেফ গার্ড যুক্ত করা ফাংশন যাতে আনডিফাইন্ড থাকলে ক্র্যাশ না করে
  const getSafeWkAvg = (p?: Player | null) => {
    if (!p) return "0.00";
    if (p.wkAvg && p.wkAvg !== "0.00" && p.wkAvg !== "0") return p.wkAvg;
    if (p.matches > 0 && p.wickets > 0) return (p.wickets / p.matches).toFixed(2);
    return "0.00";
  };

  // Top 3 All-Time Legends
  const topRunScorer = [...players].sort((a, b) => b.runs - a.runs)[0];
  const topWicketTaker = [...players].sort((a, b) => b.wickets - a.wickets)[0];
  const mostChampionshipPlayer = [...players].sort((a, b) => (b.champion || 0) - (a.champion || 0))[0];

  // Detailed Leaderboard Arrays
  const mostRuns = [...players].sort((a, b) => b.runs - a.runs).slice(0, 5);
  const mostWickets = [...players].sort((a, b) => b.wickets - a.wickets).slice(0, 5);
  const mostSixes = [...players].sort((a, b) => (b.sixes || 0) - (a.sixes || 0)).slice(0, 5);
  const mostFours = [...players].sort((a, b) => (b.fours || 0) - (a.fours || 0)).slice(0, 5);
  const mostHatTricks = [...players].sort((a, b) => (b.hatTricks || 0) - (a.hatTricks || 0)).slice(0, 5);

  // Trophies & Honors Leaderboards
  const mostChampions = [...players].sort((a, b) => (b.champion || 0) - (a.champion || 0)).slice(0, 5);
  const mostRunnersUp = [...players].sort((a, b) => (b.runnersUp || 0) - (a.runnersUp || 0)).slice(0, 5);
  const mostFinals = [...players].sort((a, b) => (b.totalFinal || 0) - (a.totalFinal || 0)).slice(0, 5);
  const mostMotCpot = [...players]
    .sort((a, b) => {
      const totalB = (Number(b.mot) || 0) + (Number(b.cpot) || 0);
      const totalA = (Number(a.mot) || 0) + (Number(a.cpot) || 0);
      return totalB - totalA;
    })
    .slice(0, 5);
  const mostTournamentRunKing = [...players]
    .sort((a, b) => (b.highestRunScorer || 0) - (a.highestRunScorer || 0))
    .slice(0, 5);
  const mostTournamentWicketKing = [...players]
    .sort((a, b) => (b.topWicketTaker || 0) - (a.topWicketTaker || 0))
    .slice(0, 5);

  const totalRuns = players.reduce((sum, p) => sum + (p.runs || 0), 0);
  const totalWkts = players.reduce((sum, p) => sum + (p.wickets || 0), 0);
  const totalSixes = players.reduce((sum, p) => sum + (p.sixes || 0), 0);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-[#f59e0b]/30 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border border-[#f59e0b]/40 bg-[#17130b] shadow-lg shadow-[#f59e0b]/10">
              <img
                src="/fcl-logo.png"
                alt="FCL Logo"
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-xl">🏆</span>';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white">
                  Facebook <span className="text-[#1877F2]">Cricket League</span>
                </h1>
                <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#f59e0b]">
                  RECORDS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#94a3b8]">Hall of Fame & All-Time Archive</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-[#1e293b] bg-[#0b1220] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#cbd5e1] transition hover:border-[#f59e0b]/50 hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden border-b border-[#172033] bg-[#02050b] py-12 sm:py-16">
        <div className="absolute left-[15%] top-[-20%] h-[450px] w-[450px] rounded-full bg-[#f59e0b]/10 blur-[130px]" />
        <div className="absolute right-[10%] bottom-[-20%] h-[400px] w-[400px] rounded-full bg-[#1877F2]/10 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3.5 py-1 text-xs font-bold text-[#fbbf24]">
                <span>⭐</span> FCL Hall of Fame
              </span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white">
                All-Time Record Book
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#94a3b8] max-w-2xl">
                Every historic milestone, boundary milestone, trophy tally and legendary bowling figure recorded in FCL history. Click any player to open their Official Stat Card.
              </p>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              <div className="rounded-2xl border border-[#1e293b] bg-[#0b1220]/90 px-4 py-2.5 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Total League Runs</p>
                <p className="text-base sm:text-lg font-black text-[#22c55e]">{totalRuns.toLocaleString()}+</p>
              </div>
              <div className="rounded-2xl border border-[#1e293b] bg-[#0b1220]/90 px-4 py-2.5 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Total League Wickets</p>
                <p className="text-base sm:text-lg font-black text-[#f59e0b]">{totalWkts.toLocaleString()}+</p>
              </div>
              <div className="rounded-2xl border border-[#1e293b] bg-[#0b1220]/90 px-4 py-2.5 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Total Sixes</p>
                <p className="text-base sm:text-lg font-black text-[#c084fc]">{totalSixes.toLocaleString()}+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 GRAND SPOTLIGHT: TOP 3 ALL-TIME LEGENDS */}
      <section className="relative overflow-hidden border-b border-[#172033] bg-[#030712] py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b] shadow-lg shadow-[#f59e0b]" />
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white">
                All-Time Legendary Trio
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#64748b]">Click card to inspect</span>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* 1. TOP RUN SCORER */}
            <div
              onClick={() => {
                if (topRunScorer) {
                  setSelectedPlayer(topRunScorer);
                  setCardModalTab("card");
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#1877F2]/40 bg-gradient-to-b from-[#0e1935] to-[#080e1c] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#1877F2] hover:shadow-2xl hover:shadow-[#1877F2]/20"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#1877F2] to-transparent" />
              <div className="flex items-center justify-between">
                <span className="rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#60a5fa]">
                  👑 All-Time Run King
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1877F2]/20 text-xs font-black text-[#60a5fa]">
                  #01
                </span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#1877F2]/50 bg-[#111c38] text-3xl shadow-lg shadow-[#1877F2]/20 group-hover:scale-105 transition">
                  🏏
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xl font-black text-white group-hover:text-[#60a5fa] transition break-words leading-tight">
                    {topRunScorer?.name || "Jahin Shahriar"}
                  </h4>
                  <p className="text-xs font-semibold text-[#38bdf8] truncate mt-0.5">
                    @{topRunScorer?.nickName || "Jahin"} • {topRunScorer?.role || "All-Rounder"}
                  </p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    {topRunScorer?.sixes || 0} Sixes • {topRunScorer?.fours || 0} Fours
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-[#1e293b] bg-[#040814] p-3">
                  <p className="text-xl font-black text-[#22c55e]">{topRunScorer?.runs?.toLocaleString() ?? "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b] mt-0.5">Total Runs</p>
                </div>
                <div className="rounded-2xl border border-[#1e293b] bg-[#040814] p-3">
                  <p className="text-xl font-black text-white">{topRunScorer?.matches ?? 0}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b] mt-0.5">Matches</p>
                </div>
                <div className="rounded-2xl border border-[#1e293b] bg-[#040814] p-3">
                  <p className="text-xl font-black text-[#60a5fa]">{topRunScorer?.runAvg ?? "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b] mt-0.5">Bat Avg</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#17233f] pt-3 text-[11px] text-[#94a3b8]">
                <span>Career Highest Scorer</span>
                <span className="font-bold text-[#1877F2] group-hover:underline">Open Card →</span>
              </div>
            </div>

            {/* 2. TOP WICKET TAKER */}
            <div
              onClick={() => {
                if (topWicketTaker) {
                  setSelectedPlayer(topWicketTaker);
                  setCardModalTab("card");
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#f59e0b]/40 bg-gradient-to-b from-[#2a1d08] to-[#120c02] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#f59e0b] hover:shadow-2xl hover:shadow-[#f59e0b]/20"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent" />
              <div className="flex items-center justify-between">
                <span className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#fbbf24]">
                  🎯 All-Time Wicket King
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f59e0b]/20 text-xs font-black text-[#fbbf24]">
                  #02
                </span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#f59e0b]/50 bg-[#291b05] text-3xl shadow-lg shadow-[#f59e0b]/20 group-hover:scale-105 transition">
                  ⚡
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xl font-black text-white group-hover:text-[#fbbf24] transition break-words leading-tight">
                    {topWicketTaker?.name || "Zaheed Hasan"}
                  </h4>
                  <p className="text-xs font-semibold text-[#fbbf24] truncate mt-0.5">
                    @{topWicketTaker?.nickName || "Zaheed"} • {topWicketTaker?.role || "Bowler"}
                  </p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    {topWicketTaker?.champion || 0}x Champion • {topWicketTaker?.runs || 0} Runs
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-[#3b2a0c] bg-[#070501] p-3">
                  <p className="text-xl font-black text-[#f59e0b]">{topWicketTaker?.wickets ?? 0}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b] mt-0.5">Wickets</p>
                </div>
                <div className="rounded-2xl border border-[#3b2a0c] bg-[#070501] p-3">
                  <p className="text-xl font-black text-white">{topWicketTaker?.matches ?? 0}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b] mt-0.5">Matches</p>
                </div>
                <div className="rounded-2xl border border-[#3b2a0c] bg-[#070501] p-3">
                  <p className="text-xl font-black text-[#fbbf24]">{getSafeWkAvg(topWicketTaker)}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b] mt-0.5">Wk Avg</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#382607] pt-3 text-[11px] text-[#94a3b8]">
                <span>Leading Strike Bowler</span>
                <span className="font-bold text-[#f59e0b] group-hover:underline">Open Card →</span>
              </div>
            </div>

            {/* 3. RECORD CHAMPION */}
            <div
              onClick={() => {
                if (mostChampionshipPlayer) {
                  setSelectedPlayer(mostChampionshipPlayer);
                  setCardModalTab("card");
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#22c55e]/40 bg-gradient-to-b from-[#0d2a1a] to-[#04120a] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#22c55e] hover:shadow-2xl hover:shadow-[#22c55e]/20"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent" />
              <div className="flex items-center justify-between">
                <span className="rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#4ade80]">
                  ⭐ Record Champion
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#22c55e]/20 text-xs font-black text-[#4ade80]">
                  #03
                </span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#22c55e]/50 bg-[#123321] text-3xl shadow-lg shadow-[#22c55e]/20 group-hover:scale-105 transition">
                  🏆
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xl font-black text-white group-hover:text-[#4ade80] transition break-words leading-tight">
                    {mostChampionshipPlayer?.name || "Arif Ziad"}
                  </h4>
                  <p className="text-xs font-semibold text-[#4ade80] truncate mt-0.5">
                    @{mostChampionshipPlayer?.nickName || "Arif"} • {mostChampionshipPlayer?.role || "All-Rounder"}
                  </p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    {mostChampionshipPlayer?.hatTricks || 0} Hat-Tricks • {mostChampionshipPlayer?.totalFinal || 0} Finals
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-[#153b24] bg-[#020a05] p-3">
                  <p className="text-xl font-black text-[#4ade80]">{mostChampionshipPlayer?.champion ?? 0}x</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b] mt-0.5">Champion</p>
                </div>
                <div className="rounded-2xl border border-[#153b24] bg-[#020a05] p-3">
                  <p className="text-xl font-black text-white">{mostChampionshipPlayer?.runs ?? 0}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b] mt-0.5">Runs</p>
                </div>
                <div className="rounded-2xl border border-[#153b24] bg-[#020a05] p-3">
                  <p className="text-xl font-black text-[#f59e0b]">{mostChampionshipPlayer?.wickets ?? 0}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748b] mt-0.5">Wickets</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#133821] pt-3 text-[11px] text-[#94a3b8]">
                <span>Most Trophies in History</span>
                <span className="font-bold text-[#22c55e] group-hover:underline">Open Card →</span>
              </div>
            </div>
          </div>

          {/* View Full Leaderboard Callout Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-[#f59e0b]/30 bg-gradient-to-r from-[#1b1404] via-[#241b07] to-[#1b1404] p-5 sm:p-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#fbbf24]">
                Complete Player Standing
              </span>
              <h4 className="text-base sm:text-xl font-bold text-white mt-1">
                Want to check rankings for all {players.length} players?
              </h4>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                See serial leaderboards from #1 to #{players.length} with search and custom category filters.
              </p>
            </div>
            <Link
              href="/rankings"
              className="shrink-0 rounded-2xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-6 py-3 text-xs font-extrabold text-black shadow-lg shadow-[#f59e0b]/20 transition hover:brightness-110 active:scale-95"
            >
              View Complete Leaderboard (All {players.length} Players) →
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs Filter Bar */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <div className="flex flex-wrap gap-2 border-b border-[#1e293b] pb-4">
          {[
            { id: "all", label: "🌟 Overall All-Time" },
            { id: "batting", label: "🏏 Batting Records" },
            { id: "bowling", label: "🎯 Bowling Records" },
            { id: "honors", label: "🏆 Trophies & Honors" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-[#f59e0b] text-black shadow-lg shadow-[#f59e0b]/20"
                  : "border border-[#1e293b] bg-[#0b1220] text-[#94a3b8] hover:border-[#f59e0b]/40 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Detailed Records Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm font-semibold text-[#f59e0b] animate-pulse">
              Compiling FCL All-Time Records from Database...
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 1. BATTING LEADERS */}
            {(activeTab === "all" || activeTab === "batting") && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1877F2]/40 bg-[#1877F2]/10 text-base">
                    🏏
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">All-Time Batting Milestone</h3>
                    <p className="text-[11px] text-[#64748b]">Most runs, power hitting boundaries and tournament records</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  {/* Most Runs */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#60a5fa]">Most Runs (Career)</span>
                      <span className="text-[10px] text-[#64748b]">Total Runs</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostRuns.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setCardModalTab("card");
                          }}
                          className="group flex items-center justify-between py-2.5 cursor-pointer transition hover:bg-[#1877F2]/5 px-2 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                              idx === 0 ? "bg-[#f59e0b] text-black" : idx === 1 ? "bg-[#cbd5e1] text-black" : idx === 2 ? "bg-[#b45309] text-white" : "text-[#64748b]"
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[#60a5fa] transition line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-[#64748b]">{p.matches} Matches • Avg {p.runAvg}</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-[#22c55e]">{p.runs}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Most Sixes */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#c084fc]">Six Machine (6s)</span>
                      <span className="text-[10px] text-[#64748b]">Total 6s</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostSixes.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setCardModalTab("card");
                          }}
                          className="group flex items-center justify-between py-2.5 cursor-pointer transition hover:bg-[#a855f7]/5 px-2 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                              idx === 0 ? "bg-[#f59e0b] text-black" : idx === 1 ? "bg-[#cbd5e1] text-black" : idx === 2 ? "bg-[#b45309] text-white" : "text-[#64748b]"
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[#c084fc] transition line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-[#64748b]">{p.runs} Runs • {p.matches} Mat</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-[#c084fc]">{p.sixes ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Most Fours */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#38bdf8]">Boundary Kings (4s)</span>
                      <span className="text-[10px] text-[#64748b]">Total 4s</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostFours.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setCardModalTab("card");
                          }}
                          className="group flex items-center justify-between py-2.5 cursor-pointer transition hover:bg-[#38bdf8]/5 px-2 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                              idx === 0 ? "bg-[#f59e0b] text-black" : idx === 1 ? "bg-[#cbd5e1] text-black" : idx === 2 ? "bg-[#b45309] text-white" : "text-[#64748b]"
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[#38bdf8] transition line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-[#64748b]">{p.runs} Runs • {p.fours ?? 0} Fours</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-[#38bdf8]">{p.fours ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. BOWLING LEADERS */}
            {(activeTab === "all" || activeTab === "bowling") && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f59e0b]/40 bg-[#f59e0b]/10 text-base">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">All-Time Bowling Dominance</h3>
                    <p className="text-[11px] text-[#64748b]">Top wicket takers, hat-trick heroes and strike economy</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Most Wickets */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#fbbf24]">Most Wickets (Career)</span>
                      <span className="text-[10px] text-[#64748b]">Total Wkts</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostWickets.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setCardModalTab("card");
                          }}
                          className="group flex items-center justify-between py-2.5 cursor-pointer transition hover:bg-[#f59e0b]/5 px-2 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                              idx === 0 ? "bg-[#f59e0b] text-black" : idx === 1 ? "bg-[#cbd5e1] text-black" : idx === 2 ? "bg-[#b45309] text-white" : "text-[#64748b]"
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[#fbbf24] transition line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-[#64748b]">{p.matches} Matches • Wk Avg {getSafeWkAvg(p)}</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-[#f59e0b]">{p.wickets}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hat-Trick Masters */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#ec4899]">Hat-Trick Masters</span>
                      <span className="text-[10px] text-[#64748b]">Hat-Tricks</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostHatTricks.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setCardModalTab("card");
                          }}
                          className="group flex items-center justify-between py-2.5 cursor-pointer transition hover:bg-[#ec4899]/5 px-2 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                              idx === 0 ? "bg-[#f59e0b] text-black" : idx === 1 ? "bg-[#cbd5e1] text-black" : idx === 2 ? "bg-[#b45309] text-white" : "text-[#64748b]"
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ec4899] transition line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-[#64748b]">{p.wickets} Total Wkts • {p.matches} Matches</p>
                            </div>
                          </div>
                          <span className="text-sm font-black text-[#ec4899]">{p.hatTricks ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. TROPHIES & HONORS (FULL 6 PILLARS) */}
            {(activeTab === "all" || activeTab === "honors") && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#22c55e]/40 bg-[#22c55e]/10 text-base">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">Championships & Awards Cabinet</h3>
                    <p className="text-[11px] text-[#64748b]">
                      Tournament champions, runners-up, finals, tournament best players, orange and purple caps
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {/* 1. Champion */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#f59e0b]">Champion 🏆</span>
                      <span className="text-[10px] text-[#64748b]">Titles</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostChampions.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setCardModalTab("card");
                          }}
                          className="group flex items-center justify-between py-2 cursor-pointer transition hover:bg-white/5 px-2 rounded-xl"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-[#64748b]">{idx + 1}.</span>
                            <p className="text-xs font-bold text-white group-hover:text-[#f59e0b] line-clamp-1">{p.name}</p>
                          </div>
                          <span className="text-xs font-black text-[#f59e0b]">{p.champion ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Runners-Up */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#94a3b8]">Runners-Up 🥈</span>
                      <span className="text-[10px] text-[#64748b]">Count</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostRunnersUp.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setCardModalTab("card");
                          }}
                          className="group flex items-center justify-between py-2 cursor-pointer transition hover:bg-white/5 px-2 rounded-xl"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-[#64748b]">{idx + 1}.</span>
                            <p className="text-xs font-bold text-white group-hover:text-[#94a3b8] line-clamp-1">{p.name}</p>
                          </div>
                          <span className="text-xs font-black text-[#cbd5e1]">{p.runnersUp ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Total Finals */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#cbd5e1]">Total Finals ⚔️</span>
                      <span className="text-[10px] text-[#64748b]">Finals</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostFinals.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setCardModalTab("card");
                          }}
                          className="group flex items-center justify-between py-2 cursor-pointer transition hover:bg-white/5 px-2 rounded-xl"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-[#64748b]">{idx + 1}.</span>
                            <p className="text-xs font-bold text-white group-hover:text-[#cbd5e1] line-clamp-1">{p.name}</p>
                          </div>
                          <span className="text-xs font-black text-white">{p.totalFinal ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. MOT / CPOT */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#a855f7]">MOT / CPOT ⭐</span>
                      <span className="text-[10px] text-[#64748b]">Awards</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostMotCpot.map((p, idx) => {
                        const totalMotVal = (Number(p.mot) || 0) + (Number(p.cpot) || 0);
                        return (
                          <div
                            key={p.name + idx}
                            onClick={() => {
                              setSelectedPlayer(p);
                              setCardModalTab("card");
                            }}
                            className="group flex items-center justify-between py-2 cursor-pointer transition hover:bg-white/5 px-2 rounded-xl"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-[#64748b]">{idx + 1}.</span>
                              <div>
                                <p className="text-xs font-bold text-white group-hover:text-[#c084fc] line-clamp-1">{p.name}</p>
                                <span className="text-[9px] text-[#64748b]">
                                  MOT: {p.mot ?? 0} | CPOT: {p.cpot ?? 0}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-[#c084fc]">{totalMotVal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Tournament Run King */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#f97316]">Tour. Run King 👑</span>
                      <span className="text-[10px] text-[#64748b]">Times</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostTournamentRunKing.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setCardModalTab("card");
                          }}
                          className="group flex items-center justify-between py-2 cursor-pointer transition hover:bg-white/5 px-2 rounded-xl"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-[#64748b]">{idx + 1}.</span>
                            <div>
                              <p className="text-xs font-bold text-white group-hover:text-[#f97316] line-clamp-1">{p.name}</p>
                              <span className="text-[9px] text-[#64748b]">Tournament Top Scorer</span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-[#f97316]">{p.highestRunScorer ?? 0}x</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6. Tournament Wicket King */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#22d3ee]">Tour. Wicket King 🎯</span>
                      <span className="text-[10px] text-[#64748b]">Times</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostTournamentWicketKing.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => {
                            setSelectedPlayer(p);
                            setCardModalTab("card");
                          }}
                          className="group flex items-center justify-between py-2 cursor-pointer transition hover:bg-white/5 px-2 rounded-xl"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-[#64748b]">{idx + 1}.</span>
                            <div>
                              <p className="text-xs font-bold text-white group-hover:text-[#22d3ee] line-clamp-1">{p.name}</p>
                              <span className="text-[9px] text-[#64748b]">Tournament Top Bowler</span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-[#22d3ee]">{p.topWicketTaker ?? 0}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 🌟 STAT CARD MODAL (STICKY HEADER + LIGHT/DARK THEME + TOURNAMENT TAB) */}
      {/* ========================================================================= */}
      {selectedPlayer && (
        <div
          onClick={() => setSelectedPlayer(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className={`relative flex h-[94vh] sm:h-auto sm:max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl transition-colors duration-200 ${
              cardTheme === "dark"
                ? "border-[#38bdf8]/40 bg-[#0f172a] text-white"
                : "border-slate-300 bg-white text-slate-900 shadow-2xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div
              className={`sticky top-0 z-30 shrink-0 border-b px-4 py-3 backdrop-blur-md ${
                cardTheme === "dark" ? "border-[#1e293b] bg-[#0b1329]/95 text-white" : "border-slate-200 bg-white/95 text-slate-900"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 rounded-xl p-1 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20">
                  <button
                    onClick={() => setCardModalTab("card")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      cardModalTab === "card"
                        ? "bg-[#1877F2] text-white shadow"
                        : cardTheme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                    }`}
                  >
                    <span>🎖️</span>
                    <span>Stat Card</span>
                  </button>
                  <button
                    onClick={() => setCardModalTab("history")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      cardModalTab === "history"
                        ? "bg-[#1877F2] text-white shadow font-black"
                        : cardTheme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                    }`}
                  >
                    <span>📊</span>
                    <span>Tournament History ({playerTournamentHistory.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-xl p-1 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20">
                    <button
                      onClick={() => setCardTheme("dark")}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                        cardTheme === "dark" ? "bg-[#1877F2] text-white shadow" : "text-slate-500 hover:text-black"
                      }`}
                    >
                      🌙 Dark
                    </button>
                    <button
                      onClick={() => setCardTheme("light")}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                        cardTheme === "light" ? "bg-white text-[#1877F2] font-black shadow border border-slate-200" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      ☀️ Light
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 dark:border-white/10 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/20"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {cardModalTab === "history" && (
                <div className={`mt-3 flex items-center justify-between border-t pt-2.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                  <div>
                    <h4 className={`text-base sm:text-lg font-black flex items-center gap-2 ${cardTheme === "dark" ? "text-white" : "text-slate-900"}`}>
                      <span>📊</span>
                      <span>{selectedPlayer.name} এর টুর্নামেন্ট ইতিহাস</span>
                    </h4>
                    <p className={`text-[11px] font-medium ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      অংশগ্রহণ করা প্রতিটি আসরের ইন্ডিভিজুয়াল পারফরম্যান্স ব্রেকডাউন
                    </p>
                  </div>
                  <span className={`rounded-xl px-3 py-1 text-xs font-bold shrink-0 ${cardTheme === "dark" ? "bg-[#1877F2]/25 border border-[#1877F2]/50 text-[#60a5fa]" : "bg-blue-50 border border-blue-200 text-[#1877F2]"}`}>
                    মোট {playerTournamentHistory.length} টি আসর
                  </span>
                </div>
              )}
            </div>

            {/* Scrollable Body */}
            <div className={`flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 ${cardTheme === "dark" ? "bg-[#0b132b]" : "bg-[#F8FAFC]"}`}>
              {cardModalTab === "card" ? (
                /* TAB 1: FULL STAT CARD */
                <div
                  ref={cardRef}
                  className={`mx-auto rounded-2xl border p-4 sm:p-6 space-y-4 shadow-xl ${
                    cardTheme === "dark"
                      ? "border-[#1e293b] bg-[#070b16] text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <div className={`flex items-center justify-between border-b pb-3 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border p-1 bg-[#1877F2]/10 text-2xl">
                        🏏
                      </div>
                      <div>
                        <h3 className={`text-base sm:text-2xl font-black uppercase ${cardTheme === "dark" ? "text-[#e0f2fe]" : "text-[#1877F2]"}`}>
                          Player Statistics Card
                        </h3>
                        <p className={`text-xs ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Facebook Cricket League (FCL)</p>
                      </div>
                    </div>
                    <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2.5 py-1 text-xs font-bold text-[#f59e0b]">OFFICIAL</span>
                  </div>

                  {/* Profile Top Row with FULL NAME */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    <div className={`relative flex items-center justify-center rounded-xl border-2 p-1.5 aspect-square text-4xl ${cardTheme === "dark" ? "border-[#38bdf8]/40 bg-[#0b132b]" : "border-blue-200 bg-blue-50"}`}>
                      🏏
                    </div>
                    <div className={`col-span-2 rounded-xl border p-3.5 flex flex-col justify-center ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Player Name</span>
                      <h4 className="text-base sm:text-lg font-black break-words leading-tight mt-1">
                        {selectedPlayer.name}
                      </h4>
                      {selectedPlayer.nickName && <p className="text-xs font-bold text-[#1877F2] mt-0.5">@{selectedPlayer.nickName}</p>}
                      <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Role:</span>
                        <span className="text-xs font-bold text-[#f59e0b] truncate">{selectedPlayer.role}</span>
                      </div>
                    </div>
                    <div className="col-span-3 sm:col-span-1 rounded-xl border-2 p-2.5 text-center shadow-lg border-[#f59e0b] bg-gradient-to-b from-[#2a1b04] to-[#120b02]">
                      <span className="text-[11px] font-black uppercase text-[#fbbf24]">TOTAL FINAL</span>
                      <p className="text-3xl font-black text-[#fde047] my-0.5">{selectedPlayer.totalFinal ?? 0}</p>
                      <span className="text-[10px] font-bold text-[#e2e8f0]">Finals Played</span>
                    </div>
                  </div>

                  {/* Debut Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Debut Date</p>
                      <p className="font-extrabold text-[#1877F2] text-xs sm:text-sm mt-1">{formatSafeDate(selectedPlayer.debutYear) || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Debut Tournament</p>
                      <p className="font-black text-xs sm:text-sm mt-1 break-words text-[#22c55e]">
                        {getDebutTournament(selectedPlayer)}
                      </p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Debut Team</p>
                      <p className="font-extrabold text-xs sm:text-sm mt-1 break-words">{selectedPlayer.debutTeam || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Total Tournaments</p>
                      <p className="font-black text-[#16a34a] text-base sm:text-xl mt-0.5">{selectedPlayer.totalTournament ?? 0}</p>
                    </div>
                  </div>

                  {/* MVP & Rankings Grid */}
                  <div className={`rounded-2xl border-2 p-3.5 sm:p-4 text-center shadow-lg ${cardTheme === "dark" ? "border-[#f59e0b]/60 bg-gradient-to-r from-[#1c1203] via-[#2c1c04] to-[#1c1203]" : "border-[#f59e0b] bg-amber-50/70"}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b pb-2.5 border-[#f59e0b]/30">
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
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-amber-200 shadow-sm"}`}>
                        <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Runs Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#16a34a] mt-0.5">#{getRank(selectedPlayer, "runs")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-amber-200 shadow-sm"}`}>
                        <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Wkts Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#d97706] mt-0.5">#{getRank(selectedPlayer, "wickets")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-amber-200 shadow-sm"}`}>
                        <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>6s Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#7c3aed] mt-0.5">#{getRank(selectedPlayer, "sixes")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-amber-200 shadow-sm"}`}>
                        <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Trophy Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#0284c7] mt-0.5">#{getRank(selectedPlayer, "champion")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Career Stats Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={`rounded-xl border p-3.5 space-y-2 text-xs sm:text-[13px] ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Total Match:</span>
                        <strong className="font-extrabold">{selectedPlayer.matches}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Total Runs & Max:</span>
                        <strong className="text-[#16a34a] font-black">{selectedPlayer.runs} ({selectedPlayer.maxRuns || "—"})</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Total Wickets & Max:</span>
                        <strong className="text-[#d97706] font-black">{selectedPlayer.wickets} ({selectedPlayer.maxWickets || "—"})</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Innings / Not Out:</span>
                        <strong className="font-bold">{selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Boundaries (4s / 6s):</span>
                        <strong className="font-extrabold"><span className="text-[#0284c7]">{selectedPlayer.fours}</span> / <span className="text-[#7c3aed]">{selectedPlayer.sixes}</span></strong>
                      </div>
                      <div className="flex justify-between">
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Career Hat-Trick:</span>
                        <strong className="text-[#db2777] font-black">{selectedPlayer.hatTricks ?? 0}</strong>
                      </div>
                    </div>

                    <div className={`rounded-xl border p-3.5 space-y-2 text-xs sm:text-[13px] ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Batting / Bowling Avg:</span>
                        <strong className="font-extrabold">{selectedPlayer.runAvg} / {getSafeWkAvg(selectedPlayer)}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Champion / Runner-Up:</span>
                        <strong className="font-extrabold">🏆 <span className="text-[#d97706]">{selectedPlayer.champion ?? 0}</span> / 🥈 <span>{selectedPlayer.runnersUp ?? 0}</span></strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>MOT / CPOT:</span>
                        <strong className="font-extrabold">⭐ <span className="text-[#7c3aed]">{selectedPlayer.mot ?? 0}</span> / {selectedPlayer.cpot ?? 0}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>MOM / CPOM:</span>
                        <strong className="font-extrabold">🎖️ <span className="text-[#0284c7]">{selectedPlayer.mom ?? 0}</span> / {selectedPlayer.cpom ?? 0}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Top Scorer / Wicket Taker:</span>
                        <strong className="font-black text-[#d97706]">{selectedPlayer.highestRunScorer ?? 0} / {selectedPlayer.topWicketTaker ?? 0}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 🌟 PROMINENTLY HIGHLIGHTED LAST PLAYED BANNER */}
                  <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 rounded-xl p-3 border-2 ${
                    cardTheme === "dark"
                      ? "border-[#f59e0b]/50 bg-gradient-to-r from-[#1e1302] to-[#0a0701]"
                      : "border-[#d97706]/40 bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fffbeb]"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-[#22c55e] animate-pulse" />
                      <span className={`text-xs font-black uppercase tracking-wider ${cardTheme === "dark" ? "text-[#fbbf24]" : "text-[#b45309]"}`}>
                        Last Played Tournament:
                      </span>
                    </div>
                    <span className={`text-xs sm:text-sm font-black px-3 py-1 rounded-lg border shadow-sm ${
                      cardTheme === "dark"
                        ? "bg-[#f59e0b] text-black border-[#f59e0b]"
                        : "bg-white text-[#b45309] border-[#d97706]"
                    }`}>
                      🏟️ {selectedPlayer.lastPlayed || "—"}
                    </span>
                  </div>
                </div>
              ) : (
                /* TAB 2: TOURNAMENT HISTORY WITH HIGH-CONTRAST MOT/CPOT BANNER */
                <div className="space-y-3.5">
                  {playerTournamentHistory.length === 0 ? (
                    <div className="rounded-2xl border p-8 text-center text-slate-400">কোনো টুর্নামেন্ট রেকর্ড পাওয়া যায়নি</div>
                  ) : (
                    playerTournamentHistory.map((t, idx) => {
                      const hasMot = t.motCpot?.toUpperCase() === "MOT";
                      const hasCpot = t.motCpot?.toUpperCase() === "CPOT";
                      const isTopScorer = Number(t.topScorer) === 1;
                      const isTopWicket = Number(t.topWicket) === 1;
                      const hasSpecialAward = hasMot || hasCpot || isTopScorer || isTopWicket;

                      const cardBg =
                        cardTheme === "dark"
                          ? hasSpecialAward
                            ? "border-2 border-[#f59e0b] bg-gradient-to-r from-[#241804] via-[#120b02] to-[#040813] shadow-[0_0_20px_rgba(245,158,11,0.2)] text-white"
                            : "border border-[#1e293b] bg-gradient-to-r from-[#0b1329] via-[#070e1e] to-[#040813] text-white"
                          : hasSpecialAward
                          ? "border-2 border-[#f59e0b] bg-amber-50/90 shadow-md text-slate-900"
                          : "border border-slate-200 bg-white shadow-sm text-slate-900";

                      const subBoxBg =
                        cardTheme === "dark"
                          ? "bg-black/50 border-white/5"
                          : "bg-slate-100 border-slate-200";

                      const labelStyle = cardTheme === "dark" ? "text-xs font-bold uppercase tracking-wider text-slate-400" : "text-xs font-bold uppercase tracking-wider text-slate-500";
                      const numStyle = "font-black text-base sm:text-lg mt-0.5";
                      const displayDate = formatSafeDate(t.time);

                      return (
                        <div key={idx} className={`rounded-2xl p-4 transition ${cardBg}`}>
                          <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-[#1877F2] px-3 py-1 text-xs font-black text-white shadow-sm">
                                {t.tournament}
                              </span>
                              <span className="text-sm font-black">{t.team}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {t.chamRu && (
                                <span className="rounded-lg px-2.5 py-0.5 text-xs font-black uppercase bg-[#f59e0b] text-black">
                                  {t.chamRu}
                                </span>
                              )}
                              {displayDate && (
                                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${cardTheme === "dark" ? "bg-black/30 border-white/10 text-slate-300" : "bg-white border-slate-300 text-slate-700"}`}>
                                  📅 {displayDate}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 🌟 100% VISIBLE MOT / CPOT BANNER */}
                          {hasSpecialAward && (
                            <div
                              className={`mt-3 flex flex-wrap items-center gap-2.5 rounded-xl px-3.5 py-2.5 border-2 shadow-md ${
                                cardTheme === "dark"
                                  ? "border-[#f59e0b] bg-gradient-to-r from-[#b45309]/40 via-[#d97706]/30 to-[#b45309]/40"
                                  : "border-[#d97706] bg-gradient-to-r from-[#d97706] via-[#ea580c] to-[#d97706] text-white shadow-amber-500/20"
                              }`}
                            >
                              {hasMot && (
                                <span className={`flex items-center gap-1.5 text-xs sm:text-sm font-black ${cardTheme === "dark" ? "text-[#fbbf24] drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]" : "text-white drop-shadow"}`}>
                                  <span>👑</span> MAN OF THE TOURNAMENT (MOT)
                                </span>
                              )}
                              {hasCpot && (
                                <span className={`flex items-center gap-1.5 text-xs sm:text-sm font-black ${cardTheme === "dark" ? "text-[#fde047] drop-shadow-[0_0_12px_rgba(253,224,71,0.7)]" : "text-white drop-shadow"}`}>
                                  <span>⭐</span> COOL PLAYER OF THE TOURNAMENT (CPOT)
                                </span>
                              )}
                              {(hasMot || hasCpot) && (isTopScorer || isTopWicket) && <span className={cardTheme === "dark" ? "text-[#f59e0b] font-bold" : "text-white/60 font-bold"}>•</span>}
                              {isTopScorer && (
                                <span className={`flex items-center gap-1 text-xs sm:text-sm font-black ${cardTheme === "dark" ? "text-[#60a5fa]" : "text-amber-100"}`}>
                                  <span>🏏</span> TOP SCORER ({t.runs} Runs)
                                </span>
                              )}
                              {isTopScorer && isTopWicket && <span className={cardTheme === "dark" ? "text-[#f59e0b] font-bold" : "text-white/60 font-bold"}>•</span>}
                              {isTopWicket && (
                                <span className={`flex items-center gap-1 text-xs sm:text-sm font-black ${cardTheme === "dark" ? "text-[#f472b6]" : "text-amber-100"}`}>
                                  <span>🎯</span> TOP WICKET TAKER ({t.wickets} Wkts)
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-3.5 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                            <div className={`rounded-xl p-2.5 border ${subBoxBg}`}>
                              <p className={labelStyle}>Matches</p>
                              <p className={numStyle}>{t.matches}</p>
                            </div>
                            <div className={`rounded-xl p-2.5 border ${isTopScorer ? "bg-amber-100/80 border-2 border-[#f59e0b]" : subBoxBg}`}>
                              <p className={labelStyle}>Runs</p>
                              <p className={`${numStyle} ${isTopScorer ? "text-[#d97706]" : "text-[#16a34a]"}`}>{t.runs}</p>
                            </div>
                            <div className={`rounded-xl p-2.5 border ${isTopWicket ? "bg-amber-100/80 border-2 border-[#f59e0b]" : subBoxBg}`}>
                              <p className={labelStyle}>Wkts</p>
                              <p className={`${numStyle} ${isTopWicket ? "text-[#d97706]" : "text-[#d97706]"}`}>{t.wickets}</p>
                            </div>
                            <div className={`rounded-xl p-2.5 border ${subBoxBg}`}>
                              <p className={labelStyle}>Inn</p>
                              <p className={numStyle}>{t.innings}</p>
                            </div>
                            <div className={`rounded-xl p-2.5 border ${subBoxBg}`}>
                              <p className={labelStyle}>4s / 6s</p>
                              <p className={`${numStyle} text-[#0284c7]`}>{t.fours} / {t.sixes}</p>
                            </div>
                            <div className={`rounded-xl p-2.5 border ${hasMot || hasCpot ? "bg-amber-100/80 border-2 border-[#f59e0b]" : subBoxBg}`}>
                              <p className={labelStyle}>Awards</p>
                              <p className={`${numStyle} ${hasMot || hasCpot ? "text-[#d97706] font-black" : "text-slate-400"}`}>
                                {hasMot ? "👑 MOT" : hasCpot ? "⭐ CPOT" : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className={`shrink-0 flex gap-2 border-t p-3 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b1329]" : "border-slate-200 bg-white"}`}>
              {cardModalTab === "card" ? (
                <button onClick={handleDownloadCard} className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow hover:bg-[#166fe5]">
                  📥 ডাউনলোড কার্ড
                </button>
              ) : (
                <button onClick={() => setCardModalTab("card")} className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow hover:bg-[#166fe5]">
                  ← স্ট্যাট কার্ডে ফিরে যান
                </button>
              )}
              <button onClick={() => setSelectedPlayer(null)} className={`rounded-xl border px-4 py-2.5 text-xs font-bold ${cardTheme === "dark" ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-300 bg-slate-100 text-slate-700"}`}>
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}