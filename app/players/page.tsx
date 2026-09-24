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

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
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
      alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setDownloading(false);
    }
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
                      <h3 className="text-base font-bold text-white group-hover:text-[#60a5fa] transition truncate">
                        {player.name}
                      </h3>
                      {player.nickName && (
                        <p className="text-xs text-[#94a3b8] font-medium truncate">
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
        {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8 mt-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
            <p className="mt-1 text-xs text-[#64748b]">Official Players Directory & Roster</p>
          </div>
          <p className="text-xs text-[#94a3b8]">
            © 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.
          </p>
        </div>
      </footer>
      </main>

      {/* ================================================== */}
      {/* FULLSCREEN RESPONSIVE MODAL WITH STICKY CONTROLS */}
      {/* ================================================== */}
      {selectedPlayer && (
        <div
          onClick={() => setSelectedPlayer(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md"
        >
          <div
            className="relative flex h-[94vh] sm:h-auto sm:max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-[#38bdf8]/40 bg-[#0f172a] shadow-2xl shadow-[#0284c7]/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* TOP HEADER CONTROLS (ALWAYS VISIBLE & STICKY) */}
            <div className="shrink-0 flex items-center justify-between border-b border-[#1e293b] bg-[#0b1329] px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-xs font-bold text-[#38bdf8]">FCL Digital Stat Card</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile / Desktop Top Download Button */}
                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-3 py-1.5 text-xs font-bold text-white shadow hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {downloading ? "Saving..." : "📥 Download"}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border border-white/10 bg-[#070b16] text-xs sm:text-sm font-bold text-white hover:bg-white/20"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* SCROLLABLE CARD BODY AREA */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 sm:p-4">
              {/* THE EXPORTABLE CARD CONTAINER */}
              <div
                ref={cardRef}
                className="mx-auto rounded-2xl border border-[#1e293b] bg-[#0b132b] p-3 sm:p-5 text-white space-y-3"
              >
                {/* Card Banner */}
                <div className="flex items-center justify-between border-b border-[#38bdf8]/30 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-[#38bdf8]/50 bg-[#080d1a] p-1 shadow-md shrink-0">
                      <img
                        src="/fcl-logo.png"
                        alt="FCL"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML =
                            '<span class="text-xl">🏏</span>';
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

                {/* Profile Top Row with Player Photo */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {/* Photo Frame */}
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

                  {/* Name & Role Details */}
                  <div className="col-span-2 rounded-xl border border-[#1e293b] bg-[#070b16] p-2 sm:p-2.5 flex flex-col justify-center">
                    <span className="text-[9px] uppercase tracking-wider text-[#94a3b8]">
                      Player Name
                    </span>
                    <h4 className="text-xs sm:text-lg font-black text-white truncate">
                      {selectedPlayer.name}
                    </h4>
                    {selectedPlayer.nickName && (
                      <p className="text-[10px] sm:text-xs font-semibold text-[#38bdf8] truncate">
                        @{selectedPlayer.nickName}
                      </p>
                    )}
                    <div className="mt-1.5 pt-1.5 border-t border-[#1e293b] flex items-center justify-between">
                      <span className="text-[8px] sm:text-[9px] uppercase text-[#94a3b8]">
                        Role:
                      </span>
                      <span className="text-[9px] sm:text-xs font-bold text-[#f59e0b] truncate">
                        {selectedPlayer.role}
                      </span>
                    </div>
                  </div>

                  {/* Total Final Played */}
                  <div className="col-span-3 sm:col-span-1 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-2 sm:p-3 flex flex-row sm:flex-col justify-between sm:justify-center items-center text-center">
                    <span className="text-[9px] uppercase tracking-wider text-[#cbd5e1]">
                      Total Final
                    </span>
                    <p className="text-base sm:text-2xl font-black text-[#f59e0b]">
                      {selectedPlayer.totalFinal ?? 0}
                    </p>
                    <span className="text-[8px] text-[#94a3b8]">Finals Played</span>
                  </div>
                </div>

                {/* Debut & Tournaments Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs">
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-1.5 sm:p-2">
                    <p className="text-[9px] text-[#64748b]">Debut Date</p>
                    <p className="font-bold text-[#38bdf8] text-[10px] sm:text-xs mt-0.5 truncate">
                      {selectedPlayer.debutYear || "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-1.5 sm:p-2">
                    <p className="text-[9px] text-[#64748b]">Debut Tournament</p>
                    <p className="font-bold text-white text-[10px] sm:text-xs mt-0.5 truncate">
                      {selectedPlayer.debutTournament || "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-1.5 sm:p-2">
                    <p className="text-[9px] text-[#64748b]">Debut Team</p>
                    <p className="font-bold text-white text-[10px] sm:text-xs mt-0.5 truncate">
                      {selectedPlayer.debutTeam || "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-1.5 sm:p-2">
                    <p className="text-[9px] text-[#64748b]">Total Tournaments</p>
                    <p className="font-bold text-[#22c55e] text-[10px] sm:text-xs mt-0.5">
                      {selectedPlayer.totalTournament ?? 0}
                    </p>
                  </div>
                </div>

                {/* Stats Two Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {/* Left: Performance */}
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 sm:p-3 space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs">
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Total Match:</span>
                      <strong className="text-white">{selectedPlayer.matches}</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Total Runs & Max:</span>
                      <strong className="text-[#22c55e]">
                        {selectedPlayer.runs}{" "}
                        <span className="text-[#64748b]">
                          ({selectedPlayer.maxRuns ? selectedPlayer.maxRuns : "—"})
                        </span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Total Wickets & Max:</span>
                      <strong className="text-[#f59e0b]">
                        {selectedPlayer.wickets}{" "}
                        <span className="text-[#64748b]">
                          ({selectedPlayer.maxWickets ? selectedPlayer.maxWickets : "—"})
                        </span>
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Innings / Not Out:</span>
                      <strong className="text-white">
                        {selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}
                      </strong>
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

                  {/* Right: Honors & Awards */}
                  <div className="rounded-xl border border-[#1e293b] bg-[#070b16] p-2.5 sm:p-3 space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs">
                    <div className="flex justify-between border-b border-[#172033] pb-1">
                      <span className="text-[#94a3b8]">Batting / Bowling Avg:</span>
                      <strong className="text-white">
                        {selectedPlayer.runAvg} / {selectedPlayer.wkAvg}
                      </strong>
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
                      <strong className="text-white">
                        {selectedPlayer.highestRunScorer ?? 0}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Top Wicket Taker:</span>
                      <strong className="text-white">{selectedPlayer.topWicketTaker ?? 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-[#1e293b] pt-1.5 text-[9px] sm:text-[10px] text-[#64748b]">
                  <span className="truncate">
                    Last Played:{" "}
                    <strong className="text-white">{selectedPlayer.lastPlayed || "—"}</strong>
                  </span>
                  <span className="shrink-0">FCL Official Card</span>
                </div>
              </div>
            </div>

            {/* BOTTOM STICKY ACTION BAR */}
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