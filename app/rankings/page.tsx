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

export default function RankingsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<"runs" | "wickets" | "matches" | "sixes" | "champion">("runs");
  const [search, setSearch] = useState("");
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

  // ক্যাটেগরি অনুযায়ী সর্ট করা
  const sortedPlayers = [...players].sort((a, b) => {
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

  // প্লেয়ারের র‍্যাংক বের করার হেল্পার
  const getRank = (player: Player, type: "runs" | "wickets" | "sixes" | "champion") => {
    const sorted = [...players].sort((a, b) => {
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
                <span className="rounded-md border border-[#22c55e]/40 bg-[#22c55e]/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#4ade80]">
                  ALL RANKINGS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#94a3b8]">Complete Official Leaderboard</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/records"
              className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3.5 py-1.5 text-xs font-semibold text-[#94a3b8] transition hover:text-white"
            >
              ← Back to Records
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Banner */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-[#1e293b] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#60a5fa]">
              FCL Complete Leaderboard
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black text-white">
              Official Player Rankings
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#94a3b8]">
              Browse the complete ranking of all {players.length} players. Click any player row to view and export their Official Stat Card.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name or nickname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2.5 text-xs text-white placeholder-[#64748b] focus:border-[#1877F2] focus:outline-none"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
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
                  ? "bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/25"
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
              Calculating full rankings from database...
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
                    <th className="py-3.5 px-4 text-right">Primary Stat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172033]/60">
                  {filteredRankings.map((player, index) => {
                    const rankNum = index + 1;
                    const isTop1 = rankNum === 1;
                    const isTop2 = rankNum === 2;
                    const isTop3 = rankNum === 3;

                    return (
                      <tr
                        key={player.name + index}
                        onClick={() => setSelectedPlayer(player)}
                        className="group cursor-pointer transition hover:bg-[#1877F2]/10"
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

                        {/* Target Main Value */}
                        <td className="py-3.5 px-4 text-right font-black text-sm">
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

      {/* ================================================== */}
      {/* INTEGRATED OFFICIAL PLAYER STAT CARD MODAL (WITH RANKINGS BADGE) */}
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
                className="mx-auto rounded-2xl border border-[#1e293b] bg-[#0b132b] p-3 sm:p-5 text-white space-y-3"
              >
                {/* Banner */}
                <div className="flex items-center justify-between border-b border-[#38bdf8]/30 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-[#38bdf8]/50 bg-[#080d1a] p-1 shadow-md shrink-0">
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
                      <h3 className="text-sm sm:text-2xl font-black uppercase tracking-wider text-[#e0f2fe]">
                        Player Statistics Card
                      </h3>
                      <p className="text-[9px] sm:text-[11px] font-semibold tracking-wide text-[#38bdf8]">
                        Facebook Cricket League (FCL)
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#f59e0b] shrink-0">
                    OFFICIAL
                  </span>
                </div>

                {/* Profile Top Row */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="relative flex items-center justify-center rounded-xl border-2 border-[#38bdf8]/40 bg-[#070b16] p-1 aspect-square">
                    <img
                      src={`/players/${(selectedPlayer.nickName || "").toLowerCase().trim()}.jpg`}
                      alt={selectedPlayer.name}
                      className="h-full w-full rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML =
                          '<div class="flex flex-col items-center justify-center h-full text-center"><span class="text-2xl sm:text-3xl">🏏</span><span class="text-[8px] sm:text-[9px] text-[#94a3b8]">Player</span></div>';
                      }}
                    />
                    {selectedPlayer.nickName && (
                      <div className="absolute bottom-0.5 right-0.5 rounded bg-[#0284c7] px-1 py-0.2 text-[8px] font-bold text-white shadow">
                        {selectedPlayer.nickName}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 rounded-xl border border-[#1e293b] bg-[#070b16] p-2 sm:p-2.5 flex flex-col justify-center">
                    <span className="text-[9px] uppercase tracking-wider text-[#94a3b8]">Player Name</span>
                    <h4 className="text-xs sm:text-lg font-black text-white truncate">{selectedPlayer.name}</h4>
                    {selectedPlayer.nickName && (
                      <p className="text-[10px] sm:text-xs font-semibold text-[#38bdf8] truncate">@{selectedPlayer.nickName}</p>
                    )}
                    <div className="mt-1.5 pt-1.5 border-t border-[#1e293b] flex items-center justify-between">
                      <span className="text-[8px] sm:text-[9px] uppercase text-[#94a3b8]">Role:</span>
                      <span className="text-[9px] sm:text-xs font-bold text-[#f59e0b] truncate">{selectedPlayer.role}</span>
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-1 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-2 sm:p-3 flex flex-row sm:flex-col justify-between sm:justify-center items-center text-center">
                    <span className="text-[9px] uppercase tracking-wider text-[#cbd5e1]">Total Final</span>
                    <p className="text-base sm:text-2xl font-black text-[#f59e0b]">{selectedPlayer.totalFinal ?? 0}</p>
                    <span className="text-[8px] text-[#94a3b8]">Finals Played</span>
                  </div>
                </div>

                {/* Debut & Tournaments */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs">
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-1.5 sm:p-2">
                    <p className="text-[9px] text-[#64748b]">Debut Date</p>
                    <p className="font-bold text-[#38bdf8] text-[10px] sm:text-xs mt-0.5 truncate">{selectedPlayer.debutYear || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-1.5 sm:p-2">
                    <p className="text-[9px] text-[#64748b]">Debut Tournament</p>
                    <p className="font-bold text-white text-[10px] sm:text-xs mt-0.5 truncate">{selectedPlayer.debutTournament || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-1.5 sm:p-2">
                    <p className="text-[9px] text-[#64748b]">Debut Team</p>
                    <p className="font-bold text-white text-[10px] sm:text-xs mt-0.5 truncate">{selectedPlayer.debutTeam || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-1.5 sm:p-2">
                    <p className="text-[9px] text-[#64748b]">Total Tournaments</p>
                    <p className="font-bold text-[#22c55e] text-[10px] sm:text-xs mt-0.5">{selectedPlayer.totalTournament ?? 0}</p>
                  </div>
                </div>

                {/* ============================================== */}
                {/* 🌟 NEW: ALL-TIME LEAGUE RANKINGS POSITION PART */}
                {/* ============================================== */}
                <div className="rounded-2xl border border-[#f59e0b]/40 bg-gradient-to-r from-[#171103] via-[#211603] to-[#171103] p-2.5 sm:p-3 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#f59e0b]">
                    ⭐ ALL-TIME LEAGUE RANKINGS (AMONG {players.length} PLAYERS)
                  </p>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-black/40 p-1.5 border border-[#f59e0b]/20">
                      <p className="text-[9px] text-[#64748b]">Runs Rank</p>
                      <p className="font-black text-[#22c55e] mt-0.5">#{getRank(selectedPlayer, "runs")}</p>
                    </div>
                    <div className="rounded-xl bg-black/40 p-1.5 border border-[#f59e0b]/20">
                      <p className="text-[9px] text-[#64748b]">Wickets Rank</p>
                      <p className="font-black text-[#f59e0b] mt-0.5">#{getRank(selectedPlayer, "wickets")}</p>
                    </div>
                    <div className="rounded-xl bg-black/40 p-1.5 border border-[#f59e0b]/20">
                      <p className="text-[9px] text-[#64748b]">6s Rank</p>
                      <p className="font-black text-[#c084fc] mt-0.5">#{getRank(selectedPlayer, "sixes")}</p>
                    </div>
                    <div className="rounded-xl bg-black/40 p-1.5 border border-[#f59e0b]/20">
                      <p className="text-[9px] text-[#64748b]">Trophy Rank</p>
                      <p className="font-black text-[#38bdf8] mt-0.5">#{getRank(selectedPlayer, "champion")}</p>
                    </div>
                  </div>
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 sm:p-3 space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs">
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Total Match:</span>
                      <strong className="text-white">{selectedPlayer.matches}</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Total Runs & Max:</span>
                      <strong className="text-[#22c55e]">
                        {selectedPlayer.runs}{" "}
                        <span className="text-[#64748b]">({selectedPlayer.maxRuns ? selectedPlayer.maxRuns : "—"})</span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Total Wickets & Max:</span>
                      <strong className="text-[#f59e0b]">
                        {selectedPlayer.wickets}{" "}
                        <span className="text-[#64748b]">({selectedPlayer.maxWickets ? selectedPlayer.maxWickets : "—"})</span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Innings / Not Out:</span>
                      <strong className="text-white">{selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Boundaries (4&apos;s / 6&apos;s):</span>
                      <strong className="text-white">
                        <span className="text-[#38bdf8]">{selectedPlayer.fours ?? 0}</span> /{" "}
                        <span className="text-[#c084fc]">{selectedPlayer.sixes ?? 0}</span>
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Hat-Trick:</span>
                      <strong className="text-[#ec4899]">{selectedPlayer.hatTricks ?? 0}</strong>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 sm:p-3 space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs">
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Batting / Bowling Avg:</span>
                      <strong className="text-white">{selectedPlayer.runAvg} / {selectedPlayer.wkAvg}</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Champion / Runner-Up:</span>
                      <strong className="text-white">
                        🏆 <span className="text-[#f59e0b]">{selectedPlayer.champion ?? 0}</span> / 🥈{" "}
                        <span className="text-[#cbd5e1]">{selectedPlayer.runnersUp ?? 0}</span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">MOT / CPOT:</span>
                      <strong className="text-white">
                        ⭐ <span className="text-[#c084fc]">{selectedPlayer.mot ?? 0}</span> /{" "}
                        <span className="text-[#94a3b8]">{selectedPlayer.cpot ?? 0}</span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">MOM / CPOM:</span>
                      <strong className="text-white">
                        🎖️ <span className="text-[#38bdf8]">{selectedPlayer.mom ?? 0}</span> /{" "}
                        <span className="text-[#94a3b8]">{selectedPlayer.cpom ?? 0}</span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Highest Run Scorer:</span>
                      <strong className="text-white">{selectedPlayer.highestRunScorer ?? 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Top Wicket Taker:</span>
                      <strong className="text-white">{selectedPlayer.topWicketTaker ?? 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#1e293b] pt-1.5 text-[9px] sm:text-[10px] text-[#64748b]">
                  <span className="truncate">Last Played: <strong className="text-white">{selectedPlayer.lastPlayed || "—"}</strong></span>
                  <span className="shrink-0">FCL Official Card</span>
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
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