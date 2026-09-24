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
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<"mvp" | "runs" | "wickets" | "matches" | "sixes" | "champion">("mvp");
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

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
        console.error("Error loading players:", err);
        setLoading(false);
      });
  }, []);

  const handleDownloadCard = async () => {
    if (!cardRef.current || !selectedPlayer) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      const safeName = (selectedPlayer.nickName || selectedPlayer.name || "player")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
      link.download = `fcl-stat-card-${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে।");
    } finally {
      setDownloading(false);
    }
  };

  // ক্যাটেগরি অনুযায়ী সর্টিং
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

  // হেল্পার র‍্যাংক
  const getRank = (player: Player, type: "mvp" | "runs" | "wickets" | "sixes" | "champion") => {
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
            © 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.
          </p>
        </div>
      </footer>

      {/* ================================================== */}
      {/* INTEGRATED OFFICIAL PLAYER STAT CARD MODAL (WITH MVP BADGE) */}
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

                {/* 🌟 ALL-TIME LEAGUE RANKINGS + MVP POINTS BADGE */}
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
    </div>
  );
}