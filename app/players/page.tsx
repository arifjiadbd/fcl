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

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

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
                  onClick={() => setSelectedPlayer(player)}
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
                      <p className="text-xs font-bold text-white mt-0.5">{player.runs ?? 0}</p>
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