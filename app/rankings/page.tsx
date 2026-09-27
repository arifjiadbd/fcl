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

// 🎯 FCL 100% Authentic Tournament Data-based MVP Point Formula
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

export default function RankingsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<"mvp" | "runs" | "wickets" | "matches" | "sixes" | "champion">("mvp");
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showFormula, setShowFormula] = useState(false);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.players && Array.isArray(data.players)) {
          setPlayers(data.players);
        } else if (Array.isArray(data)) {
          setPlayers(data);
        }
        if (data.tournaments && Array.isArray(data.tournaments)) {
          setTournamentsData(data.tournaments);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading players:", err);
        setLoading(false);
      });
  }, []);

  // Top 3 MVP Legends for the top podium showcase
  const top3Mvp = [...players].sort((a, b) => calculateFclPoints(b) - calculateFclPoints(a)).slice(0, 3);

  // ক্যাটেগরি অনুযায়ী সর্টিং
  const sortedPlayers = [...players].sort((a, b) => {
    if (category === "mvp") return calculateFclPoints(b) - calculateFclPoints(a);
    if (category === "runs") return b.runs - a.runs;
    if (category === "wickets") return b.wickets - a.wickets;
    if (category === "matches") return b.matches - a.matches;
    if (category === "sixes") return (b.sixes || 0) - (a.sixes || 0);
    if (category === "champion") return (b.champion || 0) - (a.champion || 0);
    return 0;
  });

  // সার্চ ফিল্টার
  const filteredRankings = sortedPlayers.filter((p) => {
    const q = search.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || (p.nickName && p.nickName.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-[#1877F2]/30 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border border-[#1877F2]/40 bg-[#111936]">
              <img
                src="/fcl-logo.png"
                alt="FCL Logo"
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-xl">📊</span>';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white">
                  Facebook <span className="text-[#1877F2]">Cricket League</span>
                </h1>
                <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#f59e0b]">
                  ALL RANKINGS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#94a3b8]">Complete Official Leaderboard & MVP</p>
            </div>
          </Link>

          <Link
            href="/records"
            className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3.5 py-1.5 text-xs font-semibold text-[#94a3b8] transition hover:text-white"
          >
            ← Back to Records
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Banner */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-[#1e293b] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#60a5fa]">
                FCL Complete Leaderboard
              </span>
              <span className="rounded-full bg-[#f59e0b]/20 px-2 py-0.5 text-[10px] font-bold text-[#fbbf24]">
                MVP SYSTEM LIVE
              </span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black text-white">
              Official Player Rankings
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#94a3b8]">
              Browse sequential rankings across {players.length} players. Click any player row to view and export their Official Stat Card.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3.5 py-2 text-xs font-bold text-[#fbbf24] transition hover:bg-[#f59e0b] hover:text-black"
            >
              ℹ️ MVP Point Formula {showFormula ? "▲" : "▼"}
            </button>
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search player name or nickname..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2 text-xs text-white placeholder-[#64748b] focus:border-[#1877F2] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 🌟 ALL-TIME TOP 3 MVP LEGENDS PODIUM (SHOWN AT THE TOP) */}
        {!loading && top3Mvp.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b] shadow-lg shadow-[#f59e0b]/60 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f59e0b]">FCL PINNACLE RATING • TOP 3 PODIUM</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
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
                    className={`group relative cursor-pointer overflow-hidden rounded-[2rem] ${badgeColors.border} ${badgeColors.bg} p-6 transition-all duration-300 hover:-translate-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${badgeColors.tag}`}>
                        {badgeColors.icon} {badgeColors.label}
                      </span>
                      <span className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs ${badgeColors.badge}`}>#{rank}</span>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white/10 bg-[#0f172a] text-2xl shadow-lg">
                        {badgeColors.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg font-black text-white group-hover:text-[#60a5fa] transition break-words leading-tight">
                          {player.name}
                        </h4>
                        <p className="text-xs text-[#94a3b8] mt-0.5">@{player.nickName || player.name} • {player.role}</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/70 p-3.5 text-center">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#94a3b8]">ALL-TIME PERFORMANCE RATING</p>
                      <p className={`mt-1 text-3xl font-black ${badgeColors.highlight}`}>
                        {points.toLocaleString()} <span className="text-xs font-bold text-[#94a3b8]">PTS</span>
                      </p>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl border border-white/5 bg-black/50 p-2">
                        <p className="text-base font-black text-[#22c55e]">{player.runs?.toLocaleString() ?? 0}</p>
                        <p className="text-[9px] uppercase font-bold tracking-wider text-[#64748b]">RUNS</p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-black/50 p-2">
                        <p className="text-base font-black text-[#f59e0b]">{player.wickets ?? 0}</p>
                        <p className="text-[9px] uppercase font-bold tracking-wider text-[#64748b]">WICKETS</p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-black/50 p-2">
                        <p className="text-base font-black text-[#38bdf8]">{player.champion ?? 0}x</p>
                        <p className="text-[9px] uppercase font-bold tracking-wider text-[#64748b]">WINS</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🌟 MVP Formula Dropdown Details */}
        {showFormula && (
          <div className="mb-6 rounded-2xl border border-[#f59e0b]/30 bg-gradient-to-r from-[#171103] via-[#211603] to-[#171103] p-4 text-xs animate-in fade-in duration-200">
            <h4 className="font-bold text-[#fbbf24] text-sm">🎯 FCL 100% Authentic Tournament Point Formula:</h4>
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-[#cbd5e1]">
              <div className="rounded-lg bg-black/40 p-2 border border-[#f59e0b]/20">
                <strong className="text-[#22c55e]">🏏 Batting Points:</strong>
                <p>1 Run = 1 Pt</p>
                <p>1 Six (6) = 2 Pts</p>
                <p>1 Four (4) = 1 Pt</p>
              </div>
              <div className="rounded-lg bg-black/40 p-2 border border-[#f59e0b]/20">
                <strong className="text-[#f59e0b]">🎯 Bowling Points:</strong>
                <p>1 Wicket = 20 Pts</p>
              </div>
              <div className="rounded-lg bg-black/40 p-2 border border-[#f59e0b]/20">
                <strong className="text-[#c084fc]">🏆 Honors Bonus:</strong>
                <p>Champion = 100 Pts</p>
                <p>Runner-Up = 40 Pts</p>
                <p>MOT / CPOT = 60 Pts</p>
              </div>
              <div className="rounded-lg bg-black/40 p-2 border border-[#f59e0b]/20">
                <strong className="text-[#38bdf8]">👑 Tournament Caps:</strong>
                <p>Tour. Run King = 30 Pts</p>
                <p>Tour. Wkt King = 30 Pts</p>
                <p>Each Match = 2 Pts</p>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: "mvp", label: "👑 All-Time MVP (Rating Points)" },
            { id: "runs", label: "🏏 Batting (Runs)" },
            { id: "wickets", label: "🎯 Bowling (Wickets)" },
            { id: "matches", label: "⚡ Most Matches" },
            { id: "sixes", label: "💥 Sixes (6s)" },
            { id: "champion", label: "🏆 Championship Titles" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id as any)}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                category === tab.id
                  ? tab.id === "mvp"
                    ? "bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-black shadow-lg shadow-[#f59e0b]/30"
                    : "bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/25"
                  : "border border-[#1e293b] bg-[#0b1220] text-[#94a3b8] hover:border-[#1877F2]/40 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rankings Table */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm font-semibold text-[#60a5fa] animate-pulse">
              Calculating full rankings & MVP points from database...
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-[#1e293b] bg-[#070d19] text-[10px] sm:text-xs uppercase tracking-wider text-[#64748b]">
                  <tr>
                    <th className="py-3.5 px-4 text-center w-16">Rank</th>
                    <th className="py-3.5 px-4">Player</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4 text-center">Matches</th>
                    <th className="py-3.5 px-4 text-center">Runs</th>
                    <th className="py-3.5 px-4 text-center">Wickets</th>
                    <th className="py-3.5 px-4 text-center">6s / 4s</th>
                    <th className="py-3.5 px-4 text-center">Trophies</th>
                    <th className="py-3.5 px-4 text-right">
                      {category === "mvp" ? "MVP Rating Points" : "Primary Stat"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172033]/60">
                  {filteredRankings.map((player, index) => {
                    const rankNum = index + 1;
                    const isTop1 = rankNum === 1;
                    const isTop2 = rankNum === 2;
                    const isTop3 = rankNum === 3;
                    const mvpPoints = calculateFclPoints(player);

                    return (
                      <tr
                        key={player.name + index}
                        onClick={() => setSelectedPlayer(player)}
                        className={`group cursor-pointer transition ${
                          category === "mvp" && isTop1
                            ? "bg-[#f59e0b]/5 hover:bg-[#f59e0b]/15"
                            : "hover:bg-[#1877F2]/10"
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-3.5 px-4 text-center font-black">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black ${
                              isTop1
                                ? "bg-[#f59e0b] text-black shadow-md shadow-[#f59e0b]/30"
                                : isTop2
                                ? "bg-[#cbd5e1] text-black"
                                : isTop3
                                ? "bg-[#b45309] text-white"
                                : "bg-[#030712] text-[#64748b]"
                            }`}
                          >
                            {rankNum}
                          </span>
                        </td>

                        {/* Player Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg overflow-hidden border border-[#1e293b] bg-[#030712] shrink-0">
                              <img
                                src={`/players/${(player.nickName || "").toLowerCase().trim()}.jpg`}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.parentElement!.innerHTML = '<div class="flex h-full w-full items-center justify-center text-xs">🏏</div>';
                                }}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-white group-hover:text-[#60a5fa] transition line-clamp-1">
                                {player.name}
                              </p>
                              {player.nickName && (
                                <span className="text-[11px] text-[#64748b]">@{player.nickName}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4 text-xs text-[#94a3b8]">
                          <span className="rounded-md border border-[#1e293b] bg-[#030712] px-2 py-0.5 text-[10px]">
                            {player.role || "Player"}
                          </span>
                        </td>

                        {/* Matches */}
                        <td className="py-3.5 px-4 text-center font-bold text-white">{player.matches}</td>

                        {/* Runs */}
                        <td className="py-3.5 px-4 text-center font-bold text-[#22c55e]">{player.runs}</td>

                        {/* Wickets */}
                        <td className="py-3.5 px-4 text-center font-bold text-[#f59e0b]">{player.wickets}</td>

                        {/* Boundaries */}
                        <td className="py-3.5 px-4 text-center text-xs text-[#cbd5e1]">
                          <span className="text-[#c084fc] font-bold">{player.sixes ?? 0}</span> /{" "}
                          <span className="text-[#38bdf8] font-bold">{player.fours ?? 0}</span>
                        </td>

                        {/* Trophies */}
                        <td className="py-3.5 px-4 text-center text-xs">
                          🏆 <span className="font-bold text-[#f59e0b]">{player.champion ?? 0}</span>
                        </td>

                        {/* Target Value / MVP Points */}
                        <td className="py-3.5 px-4 text-right font-black text-sm">
                          {category === "mvp" && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-1 text-sm font-black text-[#fbbf24] shadow-sm">
                              ⭐ {mvpPoints.toLocaleString()} Pts
                            </span>
                          )}
                          {category === "runs" && <span className="text-[#22c55e]">{player.runs} Runs</span>}
                          {category === "wickets" && <span className="text-[#f59e0b]">{player.wickets} Wkts</span>}
                          {category === "matches" && <span className="text-white">{player.matches} Matches</span>}
                          {category === "sixes" && <span className="text-[#c084fc]">{player.sixes ?? 0} 6s</span>}
                          {category === "champion" && <span className="text-[#f59e0b]">{player.champion ?? 0} Titles</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8 mt-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
            <p className="mt-1 text-xs text-[#64748b]">Official All-Time Player Rankings & MVP Index</p>
          </div>
          <p className="text-xs text-[#94a3b8]">
            © 2026 Facebook Cricket League | Arif Md. Jiad | All rights reserved.
          </p>
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