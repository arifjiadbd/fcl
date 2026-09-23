"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

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

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
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
              Browse registered players, filter by role, and click any profile to open Official Statistics Card.
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
            {filteredPlayers.map((player, idx) => (
              <div
                key={player.name + idx}
                onClick={() => setSelectedPlayer(player)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/60 hover:shadow-xl hover:shadow-[#1877F2]/10"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1877F2]/50 to-transparent opacity-0 transition group-hover:opacity-100" />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#60a5fa] transition line-clamp-1">
                      {player.name}
                    </h3>
                    {player.nickName && (
                      <p className="text-xs text-[#94a3b8] font-medium">@{player.nickName}</p>
                    )}
                  </div>
                  <span className="rounded-lg border border-[#1877F2]/30 bg-[#1877F2]/10 px-2 py-0.5 text-[10px] font-bold text-[#60a5fa] shrink-0">
                    {player.role || "Player"}
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
                    <p className="text-xs font-bold text-[#f59e0b] mt-0.5">{player.wickets ?? 0}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#94a3b8] pt-1">
                  <span>Avg: <strong className="text-white">{player.runAvg ?? "—"}</strong></span>
                  <span className="text-[10px] font-semibold text-[#1877F2] group-hover:underline">
                    View Stat Card →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================================================== */}
      {/* OFFICIAL PLAYER STATISTICS CARD MODAL */}
      {/* ================================================== */}
      {selectedPlayer && (
        <div
          onClick={() => setSelectedPlayer(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
        >
          <div
            className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[#38bdf8]/40 bg-[#0f172a] shadow-2xl shadow-[#0284c7]/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Card Header Banner */}
            <div className="relative border-b border-[#38bdf8]/30 bg-gradient-to-r from-[#0369a1]/30 via-[#0284c7]/20 to-[#0369a1]/30 px-6 py-4">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-sm font-bold text-white transition hover:bg-white/20"
              >
                ✕
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#38bdf8]/50 bg-[#0b1329] p-1.5 shadow-md">
                  <img
                    src="/fcl-logo.png"
                    alt="FCL Logo"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">🏏</span>';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-[#e0f2fe]">
                    Player Statistics Card
                  </h3>
                  <p className="text-[11px] font-semibold tracking-wide text-[#38bdf8]">
                    Facebook Cricket League (FCL) Official Profile
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Profile Top Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 rounded-2xl border border-[#1e293b] bg-[#1e293b]/40 p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Player Name</span>
                    <h4 className="text-base sm:text-lg font-extrabold text-white">
                      {selectedPlayer.name}
                    </h4>
                    {selectedPlayer.nickName && (
                      <span className="text-xs font-semibold text-[#38bdf8]">
                        @{selectedPlayer.nickName}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Player Role</span>
                    <p className="text-xs sm:text-sm font-bold text-[#f59e0b]">
                      {selectedPlayer.role}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-3.5 flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#cbd5e1]">Total Final</span>
                  <p className="text-xl sm:text-2xl font-black text-[#f59e0b]">
                    {selectedPlayer.totalFinal ?? 0}
                  </p>
                  <span className="text-[9px] text-[#94a3b8]">Finals Played</span>
                </div>
              </div>

              {/* Debut & Tournament History Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                <div className="rounded-xl border border-[#334155] bg-[#090f1d] p-2.5">
                  <p className="text-[10px] text-[#64748b]">Debut Date</p>
                  <p className="font-bold text-[#38bdf8] mt-0.5">{selectedPlayer.debutYear || "—"}</p>
                </div>
                <div className="rounded-xl border border-[#334155] bg-[#090f1d] p-2.5">
                  <p className="text-[10px] text-[#64748b]">Debut Tournament</p>
                  <p className="font-bold text-white mt-0.5 line-clamp-1">{selectedPlayer.debutTournament || "—"}</p>
                </div>
                <div className="rounded-xl border border-[#334155] bg-[#090f1d] p-2.5">
                  <p className="text-[10px] text-[#64748b]">Debut Team</p>
                  <p className="font-bold text-white mt-0.5 line-clamp-1">{selectedPlayer.debutTeam || "—"}</p>
                </div>
                <div className="rounded-xl border border-[#334155] bg-[#090f1d] p-2.5">
                  <p className="text-[10px] text-[#64748b]">Total Tournaments</p>
                  <p className="font-bold text-[#22c55e] mt-0.5">{selectedPlayer.totalTournament ?? 0}</p>
                </div>
              </div>

              {/* Two Column Stats (Left: Career Matches/Runs/Wkts, Right: Awards & Averages) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left Box: Batting & Bowling Stats */}
                <div className="rounded-2xl border border-[#1e293b] bg-[#090f1d] p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
                    <span className="text-[#94a3b8]">Total Match:</span>
                    <strong className="text-white">{selectedPlayer.matches}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
                    <span className="text-[#94a3b8]">Total Runs & Max:</span>
                    <strong className="text-[#22c55e]">
                      {selectedPlayer.runs}{" "}
                      <span className="text-[#64748b]">
                        ({selectedPlayer.maxRuns ? selectedPlayer.maxRuns : "—"})
                      </span>
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
                    <span className="text-[#94a3b8]">Total Wickets & Max:</span>
                    <strong className="text-[#f59e0b]">
                      {selectedPlayer.wickets}{" "}
                      <span className="text-[#64748b]">
                        ({selectedPlayer.maxWickets ? selectedPlayer.maxWickets : "—"})
                      </span>
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
                    <span className="text-[#94a3b8]">Innings / Not Out:</span>
                    <strong className="text-white">
                      {selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
                    <span className="text-[#94a3b8]">Boundaries (4's / 6's):</span>
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

                {/* Right Box: Trophies, Awards & Averages */}
                <div className="rounded-2xl border border-[#1e293b] bg-[#090f1d] p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
                    <span className="text-[#94a3b8]">Batting Avg / Bowling Avg:</span>
                    <strong className="text-white">
                      {selectedPlayer.runAvg} / {selectedPlayer.wkAvg}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
                    <span className="text-[#94a3b8]">Champion / Runner-Up:</span>
                    <strong className="text-white">
                      🏆 <span className="text-[#f59e0b]">{selectedPlayer.champion ?? 0}</span> / 🥈{" "}
                      <span className="text-[#cbd5e1]">{selectedPlayer.runnersUp ?? 0}</span>
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
                    <span className="text-[#94a3b8]">MOT / CPOT:</span>
                    <strong className="text-white">
                      ⭐ <span className="text-[#c084fc]">{selectedPlayer.mot ?? 0}</span> /{" "}
                      <span className="text-[#94a3b8]">{selectedPlayer.cpot ?? 0}</span>
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
                    <span className="text-[#94a3b8]">MOM / CPOM:</span>
                    <strong className="text-white">
                      🎖️ <span className="text-[#38bdf8]">{selectedPlayer.mom ?? 0}</span> /{" "}
                      <span className="text-[#94a3b8]">{selectedPlayer.cpom ?? 0}</span>
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-[#1e293b] pb-1.5">
                    <span className="text-[#94a3b8]">Highest Run Scorer Award:</span>
                    <strong className="text-white">{selectedPlayer.highestRunScorer ?? 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94a3b8]">Top Wicket Taker Award:</span>
                    <strong className="text-white">{selectedPlayer.topWicketTaker ?? 0}</strong>
                  </div>
                </div>
              </div>

              {/* Last Played Tournament Footer Info */}
              {selectedPlayer.lastPlayed && (
                <div className="rounded-xl border border-[#334155]/60 bg-[#1e293b]/30 px-3.5 py-2 text-center text-xs text-[#94a3b8]">
                  Last Played Tournament:{" "}
                  <span className="font-bold text-white">{selectedPlayer.lastPlayed}</span>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-full rounded-2xl border border-[#38bdf8]/30 bg-[#0284c7]/20 py-2.5 text-xs font-bold text-white transition hover:bg-[#0284c7]/30"
              >
                Close Statistics Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}