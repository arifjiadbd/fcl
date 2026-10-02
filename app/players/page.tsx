"use client";

import { useState, useEffect, useMemo } from "react";
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

// 🌟 সঠিক এভারেজ ও শর্ত অনুযায়ী প্লেয়ার ডিরেক্টরির রোল ডিটেকশন ফাংশন
export const getAutomaticRole = (player: Player): string => {
  const matches = Number(player.matches) || 0;
  if (matches === 0) return "Promising Player";

  const runs = Number(player.runs || 0);
  const wickets = Number(player.wickets || 0);
  const innings = Number(player.innings || 0);
  const notOut = Number(player.notOut || 0);

  const dismissals = innings - notOut;
  const runAvg = dismissals > 0 ? runs / dismissals : innings > 0 ? runs / innings : 0;
  const wkAvg = wickets / matches;

  // ১. VIP All-Rounder (রান গড় ১৫+, উইকেট গড় ১.৫+)
  if (runAvg >= 15 && wkAvg >= 1.5) {
    return "VIP All-Rounder";
  }
  // ২. Bowling All-Rounder (রান গড় ১১+, উইকেট গড় ১.৫+)
  else if (runAvg >= 11 && wkAvg >= 1.5) {
    return "Bowling All-Rounder";
  }
  // ৩. All-Rounder (রান গড় ১১ থেকে ১৫ এর ভেতরে, উইকেট গড় ১.৫ এর নিচে)
  else if (runAvg >= 11 && runAvg < 15 && wkAvg < 1.5 && wkAvg >= 0.8) {
    return "All-Rounder";
  }
  // ৪. Batsman (রান গড় ১০ এর বেশি এবং উইকেট গড় ০.৮ এর কম)
  else if (runAvg > 10 && wkAvg < 0.8) {
    return "Batsman";
  }
  // ৫. Bowler (উইকেট গড় ১.০ বা তার বেশি, কিন্তু রান গড় ১০ এর কম)
  else if (runAvg < 10 && wkAvg >= 1.0) {
    return "Bowler";
  }
  // ৬. বাকিরা প্রতিশ্রুতিশীল খেলোয়াড়
  else {
    return "Promising Player";
  }
};
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

const PAGE_SIZE = 12;

const ROLES = [
  "All",
  "VIP All-Rounder",
  "Bowling All-Rounder",
  "All-Rounder",
  "Batsman",
  "Bowler",
  "Promising Player",
];

const SORTS = [
  { key: "name", label: "Name (A–Z)" },
  { key: "points", label: "FCL Points" },
  { key: "runs", label: "Most Runs" },
  { key: "wickets", label: "Most Wickets" },
  { key: "matches", label: "Most Matches" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

const ROLE_STYLE: Record<string, { badge: string; bar: string; dot: string }> = {
  "VIP All-Rounder": {
    badge: "border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-300",
    bar: "bg-amber-400",
    dot: "bg-amber-400",
  },
  "Bowling All-Rounder": {
    badge: "border-violet-400/40 bg-violet-400/10 text-violet-600 dark:text-violet-300",
    bar: "bg-violet-400",
    dot: "bg-violet-400",
  },
  "All-Rounder": {
    badge: "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300",
    bar: "bg-emerald-400",
    dot: "bg-emerald-400",
  },
  Batsman: {
    badge: "border-sky-400/40 bg-sky-400/10 text-sky-600 dark:text-sky-300",
    bar: "bg-sky-400",
    dot: "bg-sky-400",
  },
  Bowler: {
    badge: "border-rose-400/40 bg-rose-400/10 text-rose-600 dark:text-rose-300",
    bar: "bg-rose-400",
    dot: "bg-rose-400",
  },
  "Promising Player": {
    badge: "border-slate-400/40 bg-slate-400/10 text-slate-600 dark:text-slate-300",
    bar: "bg-slate-400",
    dot: "bg-slate-400",
  },
};

const getRoleStyle = (role: string) => ROLE_STYLE[role] || ROLE_STYLE["Promising Player"];

const getInitials = (name: string) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

function Avatar({ player, size }: { player: Player; size: "sm" | "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const photoPath = `/players/${(player.nickName || "").toLowerCase().trim()}.jpg`;
  const dims = size === "lg" ? "h-16 w-16 text-lg" : size === "md" ? "h-14 w-14 text-base" : "h-10 w-10 text-xs";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border border-[#1877F2]/40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#16224a] dark:to-[#0b1220] ${dims}`}
    >
      {!failed && player.nickName ? (
        <img
          src={photoPath}
          alt={player.name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-extrabold text-[#60a5fa]">
          {getInitials(player.name)}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const s = getRoleStyle(role);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-bold sm:text-[11px] ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {role || "Player"}
    </span>
  );
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showCriteria, setShowCriteria] = useState(false);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        let loadedPlayers: Player[] = [];
        if (data.players && Array.isArray(data.players)) {
          loadedPlayers = data.players;
        } else if (Array.isArray(data)) {
          loadedPlayers = data;
        }

        const processedPlayers = loadedPlayers.map((player) => ({
          ...player,
          role: getAutomaticRole(player),
        }));

        processedPlayers.sort((a, b) => {
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setPlayers(processedPlayers);

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

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedRole, sortBy]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { All: players.length };
    players.forEach((p) => {
      counts[p.role] = (counts[p.role] || 0) + 1;
    });
    return counts;
  }, [players]);

  const filteredPlayers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const targetRole = selectedRole.trim().toLowerCase();

    const list = players.filter((player) => {
      const matchesSearch =
        !q ||
        (player.name && player.name.toLowerCase().includes(q)) ||
        (player.nickName && player.nickName.toLowerCase().includes(q));
      if (!matchesSearch) return false;
      if (selectedRole === "All") return true;
      return (player.role || "").trim().toLowerCase() === targetRole;
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "points":
          return calculateFclPoints(b) - calculateFclPoints(a);
        case "runs":
          return (Number(b.runs) || 0) - (Number(a.runs) || 0);
        case "wickets":
          return (Number(b.wickets) || 0) - (Number(a.wickets) || 0);
        case "matches":
          return (Number(b.matches) || 0) - (Number(a.matches) || 0);
        default:
          return (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase());
      }
    });
    return sorted;
  }, [players, searchQuery, selectedRole, sortBy]);

  const visiblePlayers = filteredPlayers.slice(0, visibleCount);
  const remaining = filteredPlayers.length - visiblePlayers.length;
  const isFiltering = searchQuery.trim() !== "" || selectedRole !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRole("All");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(24,119,242,0.14),transparent_65%)]" />

      <main className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-3 py-1 text-xs font-semibold text-[#60a5fa]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#60a5fa]" />
              FCL Community Roster
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Player Directory</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8]">
              Search any player, filter by role, and open a profile to view and download the Official Card.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCriteria(!showCriteria)}
              className="rounded-2xl border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-3 text-xs font-bold text-[#60a5fa] transition hover:bg-[#1877F2]/20"
            >
              {showCriteria ? "Hide Role Criteria ✕" : "ℹ️ How Roles Are Determined?"}
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm backdrop-blur dark:border-[#1e293b] dark:bg-[#0b1220]/80">
              <div>
                <p className="text-2xl font-black leading-none">{players.length}</p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-[#94a3b8]">Registered players</p>
              </div>
            </div>
          </div>
        </header>

        {/* 🌟 Player Comparison Highlight Banner with Pulse Animation */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-amber-400/40 bg-gradient-to-r from-amber-400/10 via-[#1877F2]/10 to-transparent p-4 sm:p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-xl sm:text-2xl animate-bounce">
              ⚔️
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                অকশনের আগে খেলোয়াড়দের পারফরম্যান্স তুলনা করুন!
              </h2>
              <p className="text-xs text-slate-600 dark:text-[#94a3b8]">
                একাধিক খেলোয়াড়ের স্ট্যাটস পাশাপাশি যাচাই করে সেরা স্কোয়াড গড়ে তুলুন।
              </p>
            </div>
          </div>

          <Link
            href="/players/compare"
            className="relative inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1877F2] px-5 py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-[#1877F2]/30 transition hover:bg-blue-600 hover:scale-105 shrink-0"
          >
            {/* পালসিং অ্যানিমেশন ডট */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
            </span>

            <span>তুলনা শুরু করুন →</span>
          </Link>
        </div>

        {/* Role Criteria Info Box */}
        {showCriteria && (
          <div className="mb-6 rounded-3xl border border-[#1877F2]/30 bg-white p-5 shadow-lg dark:bg-[#0b1220]/90 animate-fadeIn">
            <h3 className="text-sm font-black text-[#60a5fa] mb-3 uppercase tracking-wider">
              🏏 Automated Player Role Determination Criteria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3">
                <p className="font-bold text-amber-600 dark:text-amber-300">👑 VIP All-Rounder</p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-[#94a3b8]">Batting Avg ≥ 15 AND Wicket Avg ≥ 1.5</p>
              </div>
              <div className="rounded-xl border border-violet-400/30 bg-violet-400/5 p-3">
                <p className="font-bold text-violet-600 dark:text-violet-300">⚡ Bowling All-Rounder</p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-[#94a3b8]">Batting Avg ≥ 11 AND Wicket Avg ≥ 1.5</p>
              </div>
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-3">
                <p className="font-bold text-emerald-600 dark:text-emerald-300">⭐ All-Rounder</p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-[#94a3b8]">Batting Avg 12–15 AND Wicket Avg &lt; 1.5 (≥ 0.8)</p>
              </div>
              <div className="rounded-xl border border-sky-400/30 bg-sky-400/5 p-3">
                <p className="font-bold text-sky-600 dark:text-sky-300">🛡️ Batsman</p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-[#94a3b8]">Batting Avg &gt; 10 AND Wicket Avg &lt; 0.8</p>
              </div>
              <div className="rounded-xl border border-rose-400/30 bg-rose-400/5 p-3">
                <p className="font-bold text-rose-600 dark:text-rose-300">🎯 Bowler</p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-[#94a3b8]">Wicket Avg ≥ 1.0 AND Batting Avg &lt; 10</p>
              </div>
              <div className="rounded-xl border border-slate-400/30 bg-slate-400/5 p-3">
                <p className="font-bold text-slate-600 dark:text-slate-300">🌱 Promising Player</p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-[#94a3b8]">Other developing or rookie players</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400 dark:text-[#64748b]">
              *Note: Batting Average is calculated dynamically using: <code className="text-[#60a5fa]">Total Runs / (Total Innings - Not Out Innings)</code>
            </p>
          </div>
        )}

        {/* Toolbar */}
        <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-slate-200/70 bg-white/85 px-4 py-4 backdrop-blur-xl dark:border-[#1e293b]/70 dark:bg-[#020617]/85 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#64748b]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or nickname"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-[#1877F2] focus:outline-none focus:ring-1 focus:ring-[#1877F2] dark:border-[#1e293b] dark:bg-[#0b1220] dark:text-white dark:placeholder-[#64748b]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-2.5">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  aria-label="Sort players"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-[#1877F2] focus:outline-none dark:border-[#1e293b] dark:bg-[#0b1220] dark:text-slate-200 sm:text-[13px]"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm dark:border-[#1e293b] dark:bg-[#0b1220]">
                  {(["grid", "list"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      aria-label={`${v} view`}
                      aria-pressed={view === v}
                      className={`rounded-[10px] p-2 transition ${
                        view === v ? "bg-[#1877F2] text-white" : "text-slate-500 hover:text-slate-900 dark:text-[#94a3b8] dark:hover:text-white"
                      }`}
                    >
                      {v === "grid" ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="3" y="3" width="7" height="7" rx="1.5" />
                          <rect x="14" y="3" width="7" height="7" rx="1.5" />
                          <rect x="3" y="14" width="7" height="7" rx="1.5" />
                          <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Role chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-[#172033]">
              {ROLES.map((role) => {
                const active = selectedRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] sm:text-[13px] ${
                      active
                        ? "bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/25"
                        : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-[#1877F2]/40 hover:text-slate-900 dark:border-[#1e293b] dark:bg-[#0b1220] dark:text-[#94a3b8] dark:hover:text-white"
                    }`}
                  >
                    {role}
                    <span
                      className={`rounded-full px-1.5 text-[10px] font-bold ${
                        active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-[#172033] dark:text-[#94a3b8]"
                      }`}
                    >
                      {roleCounts[role] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Result summary */}
        {!loading && filteredPlayers.length > 0 && (
          <p className="mb-4 text-xs text-slate-500 dark:text-[#94a3b8]">
            Showing <span className="font-bold text-slate-900 dark:text-white">{visiblePlayers.length}</span> of{" "}
            <span className="font-bold text-slate-900 dark:text-white">{filteredPlayers.length}</span> players
            {isFiltering && (
              <button onClick={clearFilters} className="ml-3 font-semibold text-[#1877F2] hover:underline">
                Clear filters
              </button>
            )}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-[#1e293b] dark:bg-[#0b1220]"
              />
            ))}
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-[#1e293b] dark:bg-[#0b1220]">
            <span className="mb-3 text-4xl">🏏</span>
            <p className="text-base font-semibold">No players match your search</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#94a3b8]">Try a different name or remove the role filter.</p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-xl bg-[#1877F2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1877F2]/90"
            >
              Clear filters
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visiblePlayers.map((player, idx) => {
              const style = getRoleStyle(player.role);
              return (
                <button
                  key={player.name + idx}
                  onClick={() => setSelectedPlayer(player)}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/60 hover:shadow-xl hover:shadow-[#1877F2]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] dark:border-[#1e293b] dark:bg-[#0b1220]"
                >
                  <span className={`absolute inset-x-0 top-0 h-[3px] ${style.bar} opacity-70`} />

                  <div className="flex items-center gap-3.5">
                    <Avatar player={player} size="md" />
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-[15px] font-bold leading-tight transition group-hover:text-[#60a5fa]">
                        {player.name}
                      </h3>
                      {player.nickName && (
                        <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-[#94a3b8]">@{player.nickName}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <RoleBadge role={player.role} />
                  </div>

                  <div className="mt-4 grid grid-cols-4 divide-x divide-slate-100 border-t border-slate-100 pt-4 text-center dark:divide-[#172033] dark:border-[#172033]">
                    <Stat label="Matches" value={player.matches ?? 0} />
                    <Stat label="Runs" value={player.runs ?? 0} />
                    <Stat label="Wkts" value={player.wickets ?? 0} tone="amber" />
                    <Stat label="Points" value={calculateFclPoints(player)} tone="blue" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-[#1e293b] dark:bg-[#0b1220]">
            <div className="hidden grid-cols-[minmax(0,2.2fr)_1.3fr_repeat(4,0.7fr)] items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold text-slate-500 dark:border-[#1e293b] dark:bg-[#0a1020] dark:text-[#64748b] md:grid">
              <span>Player</span>
              <span>Role</span>
              <span className="text-right">Matches</span>
              <span className="text-right">Runs</span>
              <span className="text-right">Wickets</span>
              <span className="text-right">Points</span>
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-[#172033]">
              {visiblePlayers.map((player, idx) => (
                <li key={player.name + idx}>
                  <button
                    onClick={() => setSelectedPlayer(player)}
                    className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none dark:hover:bg-[#0f1830] dark:focus-visible:bg-[#0f1830] md:grid-cols-[minmax(0,2.2fr)_1.3fr_repeat(4,0.7fr)] md:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar player={player} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold transition group-hover:text-[#60a5fa]">{player.name}</p>
                        {player.nickName && (
                          <p className="truncate text-[11px] text-slate-500 dark:text-[#94a3b8]">@{player.nickName}</p>
                        )}
                        <div className="mt-1 md:hidden">
                          <RoleBadge role={player.role} />
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <RoleBadge role={player.role} />
                    </div>

                    <span className="hidden text-right text-sm font-semibold md:block">{player.matches ?? 0}</span>
                    <span className="hidden text-right text-sm font-semibold md:block">{player.runs ?? 0}</span>
                    <span className="hidden text-right text-sm font-semibold text-amber-600 dark:text-[#f59e0b] md:block">
                      {player.wickets ?? 0}
                    </span>
                    <span className="hidden text-right text-sm font-black text-[#60a5fa] md:block">
                      {calculateFclPoints(player).toLocaleString()}
                    </span>

                    <div className="text-right md:hidden">
                      <p className="text-sm font-black text-[#60a5fa]">{calculateFclPoints(player).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 dark:text-[#64748b]">
                        {player.runs ?? 0}r · {player.wickets ?? 0}w
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Load more */}
        {!loading && remaining > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-[#172033]">
              <div
                className="h-full rounded-full bg-[#1877F2] transition-all"
                style={{ width: `${(visiblePlayers.length / filteredPlayers.length) * 100}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-2xl bg-[#1877F2] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1877F2]/25 transition hover:bg-[#1877F2]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
              >
                Show {Math.min(PAGE_SIZE, remaining)} more
              </button>
              <button
                onClick={() => setVisibleCount(filteredPlayers.length)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#1877F2]/40 hover:text-slate-900 dark:border-[#1e293b] dark:bg-[#0b1220] dark:text-[#94a3b8] dark:hover:text-white"
              >
                Show all ({remaining} left)
              </button>
            </div>
          </div>
        )}
      </main>

      <PlayerCardModal
        selectedPlayer={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        tournamentsData={tournamentsData || []}
        allPlayers={players || []}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "amber" | "blue";
}) {
  const color =
    tone === "amber"
      ? "text-amber-600 dark:text-[#f59e0b]"
      : tone === "blue"
      ? "text-[#1877F2] dark:text-[#60a5fa]"
      : "text-slate-900 dark:text-white";
  return (
    <div className="px-1">
      <p className={`text-sm font-black tabular-nums ${color}`}>{value.toLocaleString()}</p>
      <p className="mt-0.5 text-[10px] text-slate-400 dark:text-[#64748b]">{label}</p>
    </div>
  );
}