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

export default function RecordsLeaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"runs" | "wickets" | "sixes" | "champions" | "hattricks">("runs");

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
        console.error("Error loading records:", err);
        setLoading(false);
      });
  }, []);

  // Leaderboards calculated dynamically
  const topRuns = useMemo(() => [...players].sort((a, b) => b.runs - a.runs).slice(0, 10), [players]);
  const topWickets = useMemo(() => [...players].sort((a, b) => b.wickets - a.wickets).slice(0, 10), [players]);
  const topSixes = useMemo(() => [...players].sort((a, b) => b.sixes - a.sixes).slice(0, 10), [players]);
  const topChampions = useMemo(() => [...players].sort((a, b) => b.champion - a.champion).slice(0, 10), [players]);
  const topHatTricks = useMemo(() => [...players].filter(p => p.hatTricks > 0).sort((a, b) => b.hatTricks - a.hatTricks), [players]);

  const activeList = useMemo(() => {
    switch (activeTab) {
      case "runs": return { data: topRuns, label: "Runs", key: "runs" as const, unit: "Runs" };
      case "wickets": return { data: topWickets, label: "Wickets", key: "wickets" as const, unit: "Wkts" };
      case "sixes": return { data: topSixes, label: "Sixes", key: "sixes" as const, unit: "Sixes" };
      case "champions": return { data: topChampions, label: "Championships", key: "champion" as const, unit: "Titles" };
      case "hattricks": return { data: topHatTricks, label: "Hat-Tricks", key: "hatTricks" as const, unit: "Times" };
    }
  }, [activeTab, topRuns, topWickets, topSixes, topChampions, topHatTricks]);

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f59e0b]/50 bg-[#111936]">
              <span className="text-lg">🏆</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Facebook <span className="text-[#1877F2]">Cricket League</span>
              </h1>
              <p className="text-[10px] text-[#94a3b8]">Hall of Fame & Leaderboards</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/players"
              className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2 text-xs font-bold text-[#94a3b8] transition hover:border-[#1877F2]/50 hover:text-white"
            >
              Players Directory
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2 text-xs font-bold text-[#cbd5e1] transition hover:border-[#1877F2]/50 hover:text-white"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-8">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-96 -translate-x-1/2 rounded-full bg-[#f59e0b]/10 blur-3xl" />
          <div className="relative z-10 text-center">
            <span className="rounded-md border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#f59e0b]">
              FCL Hall of Fame
            </span>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
              All-Time Leaderboards
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#94a3b8]">
              The finest milestones and records achieved across official FCL tournaments, synced directly from our historical statistics database.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {[
            { id: "runs", label: "👑 Top Run Scorers" },
            { id: "wickets", label: "🎯 Top Wicket Takers" },
            { id: "sixes", label: "💥 Six Machine" },
            { id: "champions", label: "🏆 Most Championships" },
            { id: "hattricks", label: "⚡ Hat-Trick Masters" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-2xl px-5 py-3 text-xs font-bold transition ${
                activeTab === tab.id
                  ? "border border-[#f59e0b]/50 bg-gradient-to-r from-[#f59e0b]/20 to-[#1877F2]/20 text-white shadow-lg shadow-[#f59e0b]/10"
                  : "border border-[#1e293b] bg-[#0b1220] text-[#94a3b8] hover:border-[#334155] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Podium Highlight (Top 3 Players) */}
        {!loading && activeList.data.length >= 3 && (
          <div className="mb-12 grid gap-5 md:grid-cols-3">
            {/* Rank 2 */}
            <div className="order-2 rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 text-center md:order-1 md:mt-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#94a3b8]/20 text-sm font-black text-[#94a3b8]">
                #2
              </span>
              <h4 className="mt-3 text-lg font-black text-white">{activeList.data[1].name}</h4>
              <p className="text-xs text-[#64748b]">Nick: {activeList.data[1].nickName}</p>
              <div className="mt-5 rounded-2xl border border-[#172033] bg-[#020617] p-3">
                <p className="text-2xl font-black text-[#60a5fa]">{activeList.data[1][activeList.key].toLocaleString()}</p>
                <p className="text-[9px] uppercase tracking-wider text-[#64748b]">{activeList.unit}</p>
              </div>
            </div>

            {/* Rank 1 (Gold Highlight) */}
            <div className="order-1 rounded-3xl border border-[#f59e0b]/50 bg-gradient-to-b from-[#1b1720] to-[#0b1220] p-7 text-center shadow-xl shadow-[#f59e0b]/10 md:order-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f59e0b]/20 text-base font-black text-[#fbbf24]">
                👑 #1
              </span>
              <h4 className="mt-4 text-xl font-black text-white">{activeList.data[0].name}</h4>
              <p className="text-xs text-[#f59e0b]">Nick: {activeList.data[0].nickName} · {activeList.data[0].role}</p>
              <div className="mt-6 rounded-2xl border border-[#f59e0b]/30 bg-[#020617] p-4">
                <p className="text-3xl font-black text-[#fbbf24]">{activeList.data[0][activeList.key].toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider text-[#f59e0b]">All-Time {activeList.label}</p>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="order-3 rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 text-center md:mt-10">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f59e0b]/10 text-sm font-black text-[#f59e0b]">
                #3
              </span>
              <h4 className="mt-3 text-lg font-black text-white">{activeList.data[2].name}</h4>
              <p className="text-xs text-[#64748b]">Nick: {activeList.data[2].nickName}</p>
              <div className="mt-5 rounded-2xl border border-[#172033] bg-[#020617] p-3">
                <p className="text-2xl font-black text-[#4ade80]">{activeList.data[2][activeList.key].toLocaleString()}</p>
                <p className="text-[9px] uppercase tracking-wider text-[#64748b]">{activeList.unit}</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Table */}
        <div className="overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220]">
          <div className="border-b border-[#1e293b] px-6 py-4">
            <h3 className="font-bold text-white">Full Leaderboard Table</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#1e293b] bg-[#020617]/50 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">Matches</th>
                  <th className="px-6 py-4 text-center">Runs</th>
                  <th className="px-6 py-4 text-center">Wickets</th>
                  <th className="px-6 py-4 text-right">{activeList.label}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172033]">
                {activeList.data.map((player, idx) => (
                  <tr key={player.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-black">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {player.name}
                      <span className="block text-xs font-normal text-[#64748b]">{player.nickName}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#94a3b8]">{player.role}</td>
                    <td className="px-6 py-4 text-center text-xs text-white">{player.matches}</td>
                    <td className="px-6 py-4 text-center text-xs font-semibold text-[#60a5fa]">{player.runs.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-xs font-semibold text-[#fbbf24]">{player.wickets}</td>
                    <td className="px-6 py-4 text-right font-black text-[#f59e0b]">
                      {player[activeList.key].toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#1e293b] bg-[#020617] px-6 py-6 text-center text-xs text-[#64748b]">
        © 2026 Facebook Cricket League | Hall of Fame Records
      </footer>

    </main>
  );
}