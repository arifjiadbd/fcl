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

export default function RecordsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "batting" | "bowling" | "honors">("all");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
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
      link.download = `fcl-stat-card-${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export card image:", err);
      alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে।");
    } finally {
      setDownloading(false);
    }
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

  // 🌟 Trophies & Honors Leaderboards
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
              onClick={() => topRunScorer && setSelectedPlayer(topRunScorer)}
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
                <div className="min-w-0">
                  <h4 className="text-xl font-black text-white group-hover:text-[#60a5fa] transition truncate">
                    {topRunScorer?.name || "Jahin Shahriar"}
                  </h4>
                  <p className="text-xs font-semibold text-[#38bdf8] truncate">
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
              onClick={() => topWicketTaker && setSelectedPlayer(topWicketTaker)}
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
                <div className="min-w-0">
                  <h4 className="text-xl font-black text-white group-hover:text-[#fbbf24] transition truncate">
                    {topWicketTaker?.name || "Zaheed Hasan"}
                  </h4>
                  <p className="text-xs font-semibold text-[#fbbf24] truncate">
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
                  <p className="text-xl font-black text-[#fbbf24]">{topWicketTaker?.wkAvg ?? "—"}</p>
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
              onClick={() => mostChampionshipPlayer && setSelectedPlayer(mostChampionshipPlayer)}
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
                <div className="min-w-0">
                  <h4 className="text-xl font-black text-white group-hover:text-[#4ade80] transition truncate">
                    {mostChampionshipPlayer?.name || "Arif Ziad"}
                  </h4>
                  <p className="text-xs font-semibold text-[#4ade80] truncate">
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
                          onClick={() => setSelectedPlayer(p)}
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
                          onClick={() => setSelectedPlayer(p)}
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
                          onClick={() => setSelectedPlayer(p)}
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
                          onClick={() => setSelectedPlayer(p)}
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
                              <p className="text-[10px] text-[#64748b]">{p.matches} Matches • Wk Avg {p.wkAvg}</p>
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
                          onClick={() => setSelectedPlayer(p)}
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
                          onClick={() => setSelectedPlayer(p)}
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
                          onClick={() => setSelectedPlayer(p)}
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
                          onClick={() => setSelectedPlayer(p)}
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
                            onClick={() => setSelectedPlayer(p)}
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

                  {/* 5. Tournament Run King (Highest Run Scorer) */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#f97316]">Tour. Run King 👑</span>
                      <span className="text-[10px] text-[#64748b]">Times</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostTournamentRunKing.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => setSelectedPlayer(p)}
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

                  {/* 6. Tournament Wicket King (Top Wicket Taker) */}
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5">
                    <div className="flex items-center justify-between border-b border-[#172033] pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#22d3ee]">Tour. Wicket King 🎯</span>
                      <span className="text-[10px] text-[#64748b]">Times</span>
                    </div>
                    <div className="mt-3 divide-y divide-[#172033]/60">
                      {mostTournamentWicketKing.map((p, idx) => (
                        <div
                          key={p.name + idx}
                          onClick={() => setSelectedPlayer(p)}
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

      {/* ================================================== */}
      {/* INTEGRATED OFFICIAL PLAYER STAT CARD MODAL */}
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
                    <h4 className="text-sm sm:text-xl font-black text-white truncate mt-0.5">{selectedPlayer.name}</h4>
                    {selectedPlayer.nickName && (
                      <p className="text-xs sm:text-sm font-semibold text-[#38bdf8] truncate mt-0.5">@{selectedPlayer.nickName}</p>
                    )}
                    <div className="mt-2 pt-2 border-t border-[#1e293b] flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] uppercase text-[#94a3b8]">Role:</span>
                      <span className="text-xs sm:text-sm font-bold text-[#f59e0b] truncate">{selectedPlayer.role}</span>
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-1 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-2.5 sm:p-3 flex flex-row sm:flex-col justify-between sm:justify-center items-center text-center">
                    <span className="text-[10px] uppercase tracking-wider text-[#cbd5e1]">Total Final</span>
                    <p className="text-xl sm:text-3xl font-black text-[#f59e0b] my-0.5">{selectedPlayer.totalFinal ?? 0}</p>
                    <span className="text-[9px] text-[#94a3b8]">Finals Played</span>
                  </div>
                </div>

                {/* Debut & Tournaments */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-center">
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-semibold text-[#64748b]">Debut Date</p>
                    <p className="font-extrabold text-[#38bdf8] text-xs sm:text-sm mt-1 truncate">{selectedPlayer.debutYear || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-semibold text-[#64748b]">Debut Tournament</p>
                    <p className="font-extrabold text-white text-xs sm:text-sm mt-1 leading-tight break-words">{selectedPlayer.debutTournament || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-semibold text-[#64748b]">Debut Team</p>
                    <p className="font-extrabold text-white text-xs sm:text-sm mt-1 leading-tight break-words">{selectedPlayer.debutTeam || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-semibold text-[#64748b]">Total Tournaments</p>
                    <p className="font-black text-[#22c55e] text-base sm:text-xl mt-0.5">{selectedPlayer.totalTournament ?? 0}</p>
                  </div>
                </div>

                {/* All-Time League Rankings */}
                <div className="rounded-2xl border border-[#f59e0b]/40 bg-gradient-to-r from-[#171103] via-[#241804] to-[#171103] p-3 text-center shadow-lg">
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#f59e0b]">
                    ⭐ ALL-TIME LEAGUE RANKINGS (AMONG {players.length} PLAYERS)
                  </p>
                  <div className="mt-2.5 grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-xl bg-black/50 p-2 border border-[#f59e0b]/25">
                      <p className="text-[10px] uppercase font-semibold text-[#94a3b8]">Runs Rank</p>
                      <p className="text-sm sm:text-base font-black text-[#22c55e] mt-1">
                        #{[...players].sort((a, b) => b.runs - a.runs).findIndex((p) => p.name === selectedPlayer.name) + 1}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/50 p-2 border border-[#f59e0b]/25">
                      <p className="text-[10px] uppercase font-semibold text-[#94a3b8]">Wickets Rank</p>
                      <p className="text-sm sm:text-base font-black text-[#f59e0b] mt-1">
                        #{[...players].sort((a, b) => b.wickets - a.wickets).findIndex((p) => p.name === selectedPlayer.name) + 1}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/50 p-2 border border-[#f59e0b]/25">
                      <p className="text-[10px] uppercase font-semibold text-[#94a3b8]">6s Rank</p>
                      <p className="text-sm sm:text-base font-black text-[#c084fc] mt-1">
                        #{[...players].sort((a, b) => (b.sixes || 0) - (a.sixes || 0)).findIndex((p) => p.name === selectedPlayer.name) + 1}
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/50 p-2 border border-[#f59e0b]/25">
                      <p className="text-[10px] uppercase font-semibold text-[#94a3b8]">Trophy Rank</p>
                      <p className="text-sm sm:text-base font-black text-[#38bdf8] mt-1">
                        #{[...players].sort((a, b) => (b.champion || 0) - (a.champion || 0)).findIndex((p) => p.name === selectedPlayer.name) + 1}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Two Columns */}
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
                      <strong className="text-white font-extrabold">{selectedPlayer.highestRunScorer ?? 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Top Wicket Taker:</span>
                      <strong className="text-white font-extrabold">{selectedPlayer.topWicketTaker ?? 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[#1e293b] pt-2 text-[10px] sm:text-xs text-[#64748b]">
                  <span className="truncate">
                    Last Played: <strong className="text-white">{selectedPlayer.lastPlayed || "—"}</strong>
                  </span>
                  <span className="shrink-0 font-semibold">FCL Official Card</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
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

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
            <p className="mt-1 text-xs text-[#64748b]">Official Hall of Fame & Historical Statistics</p>
          </div>
          <p className="text-xs text-[#94a3b8]">
            © 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}