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

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
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

  const filteredPlayers = players.filter((player) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (player.name && player.name.toLowerCase().includes(q)) ||
      (player.nickName && player.nickName.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (selectedRole === "All") return true;

    const roleClean = (player.role || "").toLowerCase().replace(/[^a-z]/g, "");
    const targetClean = selectedRole.toLowerCase().replace(/[^a-z]/g, "");

    return roleClean.includes(targetClean) || targetClean.includes(roleClean);
  });

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

  const getDebutTournament = (p: Player) => {
    if (p.debutTournament && p.debutTournament !== "—" && p.debutTournament !== "") {
      return p.debutTournament;
    }
    if (playerTournamentHistory.length > 0) {
      return playerTournamentHistory[0].tournament;
    }
    return "—";
  };

  const getSafeWkAvg = (p: Player) => {
    if (p.wkAvg && p.wkAvg !== "0.00" && p.wkAvg !== "0") return p.wkAvg;
    if (p.matches > 0 && p.wickets > 0) return (p.wickets / p.matches).toFixed(2);
    return "0.00";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#1877F2]/40 bg-[#111936]">
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
              <p className="text-[10px] sm:text-xs text-[#94a3b8]">Players Directory & Roster</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-[#1e293b] bg-[#0b1220] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-[#60a5fa] transition hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-3 py-1 text-xs font-semibold text-[#60a5fa]">
              FCL Community Roster
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Player Directory
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#94a3b8]">
              Browse registered players, filter by role, and click any profile to open & download the Official Card.
            </p>
          </div>

          <div className="text-xs sm:text-sm text-[#94a3b8]">
            Total Registered: <span className="font-bold text-white">{players.length}</span> players
          </div>
        </div>

        {/* Filter & Search */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-base text-[#64748b]">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search player name or nickname..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-[#1e293b] bg-[#0b1220] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#64748b] transition focus:border-[#1877F2] focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["All", "Batsman", "Bowler", "All-Rounder"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition ${
                  selectedRole === role
                    ? "bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/25"
                    : "border border-[#1e293b] bg-[#0b1220] text-[#94a3b8] hover:border-[#1877F2]/40 hover:text-white"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm font-semibold text-[#60a5fa] animate-pulse">
              Loading FCL Players from Database...
            </div>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-[#1e293b] bg-[#0b1220] p-8 text-center">
            <span className="text-4xl mb-3">🏏</span>
            <p className="text-base font-semibold text-white">No players found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredPlayers.map((player, idx) => {
              const photoPath = `/players/${(player.nickName || "").toLowerCase().trim()}.jpg`;

              return (
                <div
                  key={player.name + idx}
                  onClick={() => {
                    setSelectedPlayer(player);
                    setActiveTab("card");
                  }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/60 hover:shadow-xl hover:shadow-[#1877F2]/10"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1877F2]/50 to-transparent opacity-0 transition group-hover:opacity-100" />

                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-[#1877F2]/40 bg-[#111936]">
                      <img
                        src={photoPath}
                        alt={player.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML =
                            '<div class="flex h-full w-full items-center justify-center text-xl">🏏</div>';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white group-hover:text-[#60a5fa] transition break-words leading-tight">
                        {player.name}
                      </h3>
                      {player.nickName && (
                        <p className="text-xs text-[#94a3b8] font-medium truncate mt-0.5">
                          @{player.nickName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-lg border border-[#1877F2]/30 bg-[#1877F2]/10 px-2 py-0.5 text-[10px] font-bold text-[#60a5fa]">
                      {player.role || "Player"}
                    </span>
                    <span className="text-[10px] font-semibold text-[#1877F2] group-hover:underline">
                      View Card →
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#172033] pt-4 text-center">
                    <div className="rounded-xl bg-[#030712] p-2">
                      <p className="text-[10px] text-[#64748b]">Matches</p>
                      <p className="text-xs font-bold text-white mt-0.5">{player.matches ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-[#030712] p-2">
                      <p className="text-[10px] text-[#64748b]">Runs</p>
                      <p className="text-xs font-bold text-[#22c55e] mt-0.5">{player.runs ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-[#030712] p-2">
                      <p className="text-[10px] text-[#64748b]">Wickets</p>
                      <p className="text-xs font-bold text-[#f59e0b] mt-0.5">
                        {player.wickets ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8 mt-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
            <p className="text-xs text-[#64748b]">Official Players Directory & Roster</p>
          </div>
          <p className="text-xs text-[#94a3b8]">
            © 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.
          </p>
        </div>
      </footer>

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
                    onClick={() => setActiveTab("card")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === "card"
                        ? "bg-[#1877F2] text-white shadow"
                        : cardTheme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
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

              {activeTab === "history" && (
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
              {activeTab === "card" ? (
                /* TAB 1: FULL 100% COMPLETE STAT CARD */
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

                  {/* Debut & Tournaments Row */}
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
              {activeTab === "card" ? (
                <button onClick={handleDownloadCard} className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow hover:bg-[#166fe5]">
                  📥 ডাউনলোড কার্ড
                </button>
              ) : (
                <button onClick={() => setActiveTab("card")} className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow hover:bg-[#166fe5]">
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