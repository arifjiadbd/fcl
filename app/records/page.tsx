"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PlayerCardModal from "../../components/PlayerCardModal";

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
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

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

  const getSafeWkAvg = (p?: Player | null) => {
    if (!p) return "0.00";
    if (p.wkAvg && p.wkAvg !== "0.00" && p.wkAvg !== "0") return p.wkAvg;
    if (p.matches > 0 && p.wickets > 0) return (p.wickets / p.matches).toFixed(2);
    return "0.00";
  };

  // Record Holders
  const mostChampionshipPlayer = [...players].sort((a, b) => (b.champion || 0) - (a.champion || 0))[0];
  const topRunScorer = [...players].sort((a, b) => b.runs - a.runs)[0];
  const topWicketTaker = [...players].sort((a, b) => b.wickets - a.wickets)[0];
  const mostFinalsPlayer = [...players].sort((a, b) => (b.totalFinal || 0) - (a.totalFinal || 0))[0];
  const mostMatchesPlayer = [...players].sort((a, b) => b.matches - a.matches)[0];
  const mostSixesPlayer = [...players].sort((a, b) => (b.sixes || 0) - (a.sixes || 0))[0];
  const topHatTrickPlayer = [...players].sort((a, b) => (b.hatTricks || 0) - (a.hatTricks || 0))[0];

  // Detailed Leaderboard Arrays
  const mostRuns = [...players].sort((a, b) => b.runs - a.runs).slice(0, 5);
  const mostWickets = [...players].sort((a, b) => b.wickets - a.wickets).slice(0, 5);
  const mostSixes = [...players].sort((a, b) => (b.sixes || 0) - (a.sixes || 0)).slice(0, 5);
  const mostFours = [...players].sort((a, b) => (b.fours || 0) - (a.fours || 0)).slice(0, 5);
  const mostHatTricks = [...players].sort((a, b) => (b.hatTricks || 0) - (a.hatTricks || 0)).slice(0, 5);

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

      {/* 🌟 FCL RECORD CORNER (PREMIUM MVP CARD STYLE - 7 MAJOR RECORDS) */}
      <section id="records" className="relative overflow-hidden bg-[#02050b] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="relative mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                FCL STATISTICS & BENCHMARKS
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                FCL Record Corner
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Historic milestones and all-time record holders archive. Click any card to inspect player stats.
              </p>
            </div>
            <Link
              href="/rankings"
              className="rounded-xl border border-[#1877F2]/50 bg-gradient-to-r from-[#0d1c38] to-[#071124] px-6 py-3 text-xs font-black text-[#60a5fa] shadow-lg hover:border-[#1877F2] transition"
            >
              View Complete Leaderboard →
            </Link>
          </div>

          {/* Grid Layout: 7 Major Records */}
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

            {/* 7. Hat-Trick Master */}
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
        </div>
      </section>

      {/* Tabs Filter Bar */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
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

            {/* 3. TROPHIES & HONORS */}
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

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8 mt-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
          <p className="text-xs text-[#94a3b8]">© 2026 Facebook Cricket League | Arif Md. Jiad | All rights reserved.</p>
        </div>
      </footer>

      {/* 🌟 CENTRALIZED PLAYER CARD MODAL */}
      <PlayerCardModal
        selectedPlayer={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        tournamentsData={tournamentsData || []}
        allPlayers={players || []}
      />
    </div>
  );
}