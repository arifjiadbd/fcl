"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface Player {
  id: number;
  nickName: string;
  name: string;
  role: string;
  matches: number;
  runs: number;
  wickets: number;
  runAvg: number;
  wkAvg: number;
  fours: number;
  sixes: number;
  hatTricks: number;
  champion: number;
  runnerUp: number;
  lastTournament: string;
}

export default function PlayersArchive() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [sortBy, setSortBy] = useState<"runs" | "wickets" | "matches" | "champion">("runs");

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlayers(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching player archive:", err);
        setLoading(false);
      });
  }, []);

  // Filter and Sort logic
  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nickName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole =
          selectedRole === "All" || p.role.toLowerCase() === selectedRole.toLowerCase();
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [players, searchQuery, selectedRole, sortBy]);

  // Unique roles for filter buttons
  const roles = ["All", "Bowling All-Rounder", "All-Rounder", "VIP All-Rounder", "Batsman", "Bowler", "Promising Player"];

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1877F2]/50 bg-[#111936]">
              <span className="text-lg">🏏</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Facebook <span className="text-[#1877F2]">Cricket League</span>
              </h1>
              <p className="text-[10px] text-[#94a3b8]">Players Directory & Career Stats</p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2 text-xs font-bold text-[#cbd5e1] transition hover:border-[#1877F2]/50 hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Hero Banner */}
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#1877F2]/10 blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <span className="rounded-md border border-[#1877F2]/30 bg-[#1877F2]/10 px-2.5 py-1 text-[10px] font-bold text-[#60a5fa]">
              OFFICIAL FCL ARCHIVE
            </span>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
              FCL Players Directory
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
              Search and filter career records, batting averages, bowling figures and championships of all registered FCL players.
            </p>
          </div>
        </div>

        {/* Control Bar: Search, Filters & Sorting */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            {/* Search Box */}
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#64748b]">🔍</span>
              <input
                type="text"
                placeholder="Search by player name or nickname..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-[#1e293b] bg-[#0b1220] py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#64748b] transition focus:border-[#1877F2] focus:outline-none"
              />
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#64748b]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-3 text-xs font-bold text-white transition focus:border-[#1877F2] focus:outline-none"
              >
                <option value="runs">Most Runs</option>
                <option value="wickets">Most Wickets</option>
                <option value="matches">Most Matches</option>
                <option value="champion">Most Titles</option>
              </select>
            </div>

          </div>

          {/* Role Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#64748b]">Role:</span>
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedRole === role
                    ? "bg-[#1877F2] text-white"
                    : "border border-[#1e293b] bg-[#0b1220] text-[#94a3b8] hover:border-[#334155] hover:text-white"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Counter */}
        <div className="mb-6 flex items-center justify-between text-xs font-semibold text-[#64748b]">
          <span>Showing {filteredPlayers.length} of {players.length} Players</span>
          {loading && <span className="animate-pulse text-[#1877F2]">Reading Excel Data...</span>}
        </div>

        {/* Players Grid */}
        {loading ? (
          <div className="py-20 text-center text-[#64748b]">Loading player database...</div>
        ) : filteredPlayers.length === 0 ? (
          <div className="rounded-2xl border border-[#1e293b] bg-[#0b1220] py-16 text-center text-[#64748b]">
            No players found matching your search criteria.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlayers.map((p, index) => (
              <div
                key={p.id || index}
                className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#1877F2]/40 hover:shadow-xl hover:shadow-[#1877F2]/5"
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md border border-[#1877F2]/20 bg-[#1877F2]/10 px-2 py-0.5 text-[9px] font-bold text-[#60a5fa]">
                      {p.role}
                    </span>
                    <h3 className="mt-2 text-lg font-black text-white">{p.name}</h3>
                    <p className="text-xs text-[#94a3b8]">Nick: {p.nickName}</p>
                  </div>
                  <span className="text-xs font-bold text-[#475569]">
                    #{p.id}
                  </span>
                </div>

                {/* Main Stats Grid */}
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#172033] pt-4">
                  <div className="rounded-xl border border-[#172033] bg-[#020617] p-2.5 text-center">
                    <p className="text-base font-black text-[#60a5fa]">{p.runs.toLocaleString()}</p>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-[#64748b]">Runs</p>
                  </div>
                  <div className="rounded-xl border border-[#172033] bg-[#020617] p-2.5 text-center">
                    <p className="text-base font-black text-[#fbbf24]">{p.wickets}</p>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-[#64748b]">Wkts</p>
                  </div>
                  <div className="rounded-xl border border-[#172033] bg-[#020617] p-2.5 text-center">
                    <p className="text-base font-black text-white">{p.matches}</p>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-[#64748b]">Matches</p>
                  </div>
                </div>

                {/* Sub Stats Row */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748b]">
                  <span>Bat Avg: <strong className="text-white">{p.runAvg}</strong></span>
                  <span>Wk Avg: <strong className="text-white">{p.wkAvg}</strong></span>
                  <span>Titles: <strong className="text-[#f59e0b]">{p.champion}x</strong></span>
                </div>

                {/* Boundary & Milestone Strip */}
                <div className="mt-4 flex items-center justify-between border-t border-[#172033] pt-3 text-[10px] text-[#475569]">
                  <span>{p.sixes} Sixes · {p.fours} Fours</span>
                  <span>{p.hatTricks > 0 ? `⚡ ${p.hatTricks} Hat-Trick` : p.lastTournament}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#1e293b] bg-[#020617] px-6 py-6 text-center text-xs text-[#64748b]">
        © 2026 Facebook Cricket League | Database synced from Excel
      </footer>

    </main>
  );
}