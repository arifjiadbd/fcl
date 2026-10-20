"use client";

import { useState, useEffect, useMemo } from "react";
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
  photo?: string;
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

type Category = "mvp" | "runs" | "wickets" | "matches" | "sixes" | "champion";

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

const PLACEHOLDER = "/FCL Cricket Avatar Placeholder.jpg";

const getPhoto = (p: Player): string => {
  const raw = p.photo || p.photoUrl;
  if (raw && raw !== "—" && raw !== "") {
    return raw.startsWith("/") ? raw : `/players/${raw}`;
  }
  return PLACEHOLDER;
};

const CATEGORIES: { id: Category; icon: string; label: string; short: string }[] = [
  { id: "mvp", icon: "👑", label: "All-Time MVP", short: "MVP" },
  { id: "runs", icon: "🏏", label: "Batting (Runs)", short: "Runs" },
  { id: "wickets", icon: "🎯", label: "Bowling (Wickets)", short: "Wickets" },
  { id: "matches", icon: "⚡", label: "Most Matches", short: "Matches" },
  { id: "sixes", icon: "💥", label: "Sixes (6s)", short: "Sixes" },
  { id: "champion", icon: "🏆", label: "Championship Titles", short: "Titles" },
];

const getPrimary = (p: Player, c: Category) => {
  switch (c) {
    case "runs":
      return { value: Number(p.runs) || 0, label: "Runs", text: "text-[#22c55e]", bar: "from-[#16a34a] to-[#4ade80]" };
    case "wickets":
      return { value: Number(p.wickets) || 0, label: "Wkts", text: "text-[#f59e0b]", bar: "from-[#d97706] to-[#fbbf24]" };
    case "matches":
      return { value: Number(p.matches) || 0, label: "Matches", text: "text-white", bar: "from-[#475569] to-[#cbd5e1]" };
    case "sixes":
      return { value: Number(p.sixes) || 0, label: "Sixes", text: "text-[#c084fc]", bar: "from-[#9333ea] to-[#d8b4fe]" };
    case "champion":
      return { value: Number(p.champion) || 0, label: "Titles", text: "text-[#f59e0b]", bar: "from-[#d97706] to-[#fcd34d]" };
    default:
      return { value: calculateFclPoints(p), label: "PTS", text: "text-[#fbbf24]", bar: "from-[#d97706] to-[#fbbf24]" };
  }
};

/* Number count-up animation */
function CountUp({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

const STYLES = `
@keyframes fclUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
@keyframes fclShine { 0% { transform: translateX(-130%) skewX(-20deg); } 55%, 100% { transform: translateX(230%) skewX(-20deg); } }
@keyframes fclFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes fclGlow { 0%, 100% { box-shadow: 0 0 22px rgba(245,158,11,.22); } 50% { box-shadow: 0 0 46px rgba(245,158,11,.5); } }
@keyframes fclBar { from { width: 0; } }
@keyframes fclPulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
.fcl-up { animation: fclUp .6s cubic-bezier(.2,.8,.2,1) backwards; }
.fcl-row { animation: fclUp .45s ease backwards; }
.fcl-float { animation: fclFloat 2.6s ease-in-out infinite; }
.fcl-glow { animation: fclGlow 3s ease-in-out infinite; }
.fcl-bar { animation: fclBar 1s cubic-bezier(.2,.8,.2,1) backwards; }
.fcl-shine::after { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent); animation: fclShine 4.5s ease-in-out infinite; pointer-events: none; }
.fcl-live { animation: fclPulse 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .fcl-up, .fcl-row, .fcl-float, .fcl-glow, .fcl-bar, .fcl-live { animation: none !important; }
  .fcl-shine::after { animation: none !important; display: none; }
}
`;

export default function RankingsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>("mvp");
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showFormula, setShowFormula] = useState(false);

  // প্রতি ধাপে ৫০ জন করে দেখানোর স্টেট
  const [visibleCount, setVisibleCount] = useState(50);

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

  // Top 3 MVP (always MVP based)
  const top3Mvp = useMemo(
    () => [...players].sort((a, b) => calculateFclPoints(b) - calculateFclPoints(a)).slice(0, 3),
    [players]
  );

  // ক্যাটেগরি অনুযায়ী সর্টিং
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      if (category === "mvp") return calculateFclPoints(b) - calculateFclPoints(a);
      if (category === "runs") return (b.runs || 0) - (a.runs || 0);
      if (category === "wickets") return (b.wickets || 0) - (a.wickets || 0);
      if (category === "matches") return (b.matches || 0) - (a.matches || 0);
      if (category === "sixes") return (b.sixes || 0) - (a.sixes || 0);
      if (category === "champion") return (b.champion || 0) - (a.champion || 0);
      return 0;
    });
  }, [players, category]);

  // সার্চ ফিল্টার (আসল র‍্যাঙ্ক ঠিক রেখে)
  const filteredRankings = useMemo(() => {
    const q = search.toLowerCase().trim();
    const ranked = sortedPlayers.map((p, i) => ({ player: p, rank: i + 1 }));
    if (!q) return ranked;
    return ranked.filter(
      ({ player: p }) =>
        (p.name || "").toLowerCase().includes(q) || (p.nickName && p.nickName.toLowerCase().includes(q))
    );
  }, [sortedPlayers, search]);

  const displayed = filteredRankings.slice(0, visibleCount);

  const maxValue = useMemo(() => {
    if (!sortedPlayers.length) return 1;
    return Math.max(getPrimary(sortedPlayers[0], category).value, 1);
  }, [sortedPlayers, category]);

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    setVisibleCount(50);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setVisibleCount(50);
  };

  const openOnKey = (e: React.KeyboardEvent, player: Player) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedPlayer(player);
    }
  };

  const rankBadge = (rank: number) =>
    rank === 1
      ? "bg-gradient-to-br from-[#fcd34d] to-[#d97706] text-black shadow-md shadow-[#f59e0b]/40"
      : rank === 2
      ? "bg-gradient-to-br from-[#f1f5f9] to-[#94a3b8] text-black"
      : rank === 3
      ? "bg-gradient-to-br from-[#f59e0b] to-[#92400e] text-white"
      : "bg-[#0a1424] text-[#64748b] border border-[#1e293b]";

  const podiumTheme = [
    {
      // rank 1
      ring: "border-[#f59e0b]/70",
      bg: "bg-gradient-to-b from-[#2a1a04] via-[#120b02] to-[#050300]",
      chip: "bg-[#f59e0b] text-black",
      text: "text-[#fbbf24]",
      photoRing: "ring-[#f59e0b]",
      icon: "👑",
      label: "GOLD • #1",
      extra: "fcl-glow",
    },
    {
      // rank 2
      ring: "border-[#94a3b8]/60",
      bg: "bg-gradient-to-b from-[#1b2230] via-[#0d1119] to-[#04070b]",
      chip: "bg-[#cbd5e1] text-black",
      text: "text-[#f1f5f9]",
      photoRing: "ring-[#cbd5e1]",
      icon: "🥈",
      label: "SILVER • #2",
      extra: "",
    },
    {
      // rank 3
      ring: "border-[#d97706]/60",
      bg: "bg-gradient-to-b from-[#241406] via-[#120a03] to-[#050300]",
      chip: "bg-[#d97706] text-white",
      text: "text-[#fcd34d]",
      photoRing: "ring-[#d97706]",
      icon: "🥉",
      label: "BRONZE • #3",
      extra: "",
    },
  ];

  // Podium visual order: #2 left, #1 center, #3 right
  const podiumOrder = ["order-1", "order-2", "order-3"];
  const podiumOrderMap = [1, 0, 2]; // idx -> display position

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-[#1877F2]/30 selection:text-white overflow-x-hidden">
      <style>{STYLES}</style>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#1877F2]/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[320px] w-[320px] rounded-full bg-[#f59e0b]/5 blur-[110px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
        {/* ===== HEADER ===== */}
        <header className="fcl-up mb-6 sm:mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#60a5fa]">
              FCL Complete Leaderboard
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f59e0b]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#fbbf24]">
              <span className="fcl-live h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
              MVP SYSTEM LIVE
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">
                Official Player Rankings
              </h1>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-[#94a3b8] sm:text-sm">
                {players.length} জন প্লেয়ারের সম্পূর্ণ র‍্যাঙ্কিং। যেকোনো প্লেয়ারে ট্যাপ করলে তার অফিসিয়াল স্ট্যাট কার্ড দেখতে ও এক্সপোর্ট করতে পারবেন।
              </p>
            </div>

            <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center lg:w-auto">
              <div className="relative w-full sm:w-80">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#64748b]">🔍</span>
                <input
                  type="text"
                  placeholder="Search player name or nickname..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full rounded-2xl border border-[#1e293b] bg-[#0b1220]/90 py-3 pl-10 pr-4 text-sm text-white placeholder-[#64748b] backdrop-blur transition focus:border-[#1877F2] focus:outline-none focus:ring-2 focus:ring-[#1877F2]/25"
                />
              </div>
              <button
                onClick={() => setShowFormula(!showFormula)}
                aria-expanded={showFormula}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-4 py-3 text-xs font-bold text-[#fbbf24] transition hover:bg-[#f59e0b] hover:text-black sm:text-sm"
              >
                ℹ️ MVP Formula
                <span className={`transition-transform duration-300 ${showFormula ? "rotate-180" : ""}`}>▼</span>
              </button>
            </div>
          </div>
        </header>

        {/* ===== FORMULA (collapsible) ===== */}
        <div
          className={`grid transition-all duration-500 ease-out ${
            showFormula ? "mb-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="rounded-3xl border border-[#f59e0b]/25 bg-gradient-to-r from-[#171103] via-[#211603] to-[#171103] p-4 shadow-xl sm:p-5">
              <h4 className="text-sm font-bold text-[#fbbf24]">🎯 FCL 100% Authentic Tournament Point Formula</h4>
              <div className="mt-3 grid grid-cols-2 gap-2.5 text-[11px] text-[#cbd5e1] sm:gap-3 lg:grid-cols-4">
                <div className="rounded-2xl border border-[#f59e0b]/15 bg-black/40 p-3">
                  <strong className="text-[#22c55e]">🏏 Batting</strong>
                  <p className="mt-1.5">1 Run = 1 Pt</p>
                  <p>1 Six = 2 Pts</p>
                  <p>1 Four = 1 Pt</p>
                </div>
                <div className="rounded-2xl border border-[#f59e0b]/15 bg-black/40 p-3">
                  <strong className="text-[#f59e0b]">🎯 Bowling</strong>
                  <p className="mt-1.5">1 Wicket = 20 Pts</p>
                </div>
                <div className="rounded-2xl border border-[#f59e0b]/15 bg-black/40 p-3">
                  <strong className="text-[#c084fc]">🏆 Honors</strong>
                  <p className="mt-1.5">Champion = 100 Pts</p>
                  <p>Runner-Up = 40 Pts</p>
                  <p>MOT / CPOT = 60 Pts</p>
                </div>
                <div className="rounded-2xl border border-[#f59e0b]/15 bg-black/40 p-3">
                  <strong className="text-[#38bdf8]">👑 Caps</strong>
                  <p className="mt-1.5">Run King = 30 Pts</p>
                  <p>Wkt King = 30 Pts</p>
                  <p>Each Match = 2 Pts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TOP 3 PODIUM ===== */}
        {loading ? (
          <div className="mb-8 grid grid-cols-3 items-end gap-2 sm:gap-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`fcl-live rounded-2xl border border-[#1e293b] bg-[#0b1220] sm:rounded-[2rem] ${
                  i === 1 ? "h-44 sm:h-80" : "h-36 sm:h-64"
                }`}
              />
            ))}
          </div>
        ) : (
          top3Mvp.length > 0 && (
            <section className="mb-8 sm:mb-12">
              <div className="mb-4 flex items-center gap-2.5 sm:mb-6 sm:gap-3">
                <span className="fcl-live h-2 w-2 rounded-full bg-[#f59e0b] shadow-lg shadow-[#f59e0b]/60" />
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f59e0b] sm:text-xs sm:tracking-[0.3em]">
                  FCL Pinnacle Rating • Top 3
                </p>
              </div>

              <div className="grid grid-cols-3 items-end gap-2 sm:gap-5">
                {top3Mvp.map((player, idx) => {
                  const rank = idx + 1;
                  const theme = podiumTheme[idx];
                  const points = calculateFclPoints(player);
                  const isFirst = rank === 1;

                  return (
                    <div
                      key={player.name + idx}
                      className={`fcl-up ${podiumOrder[podiumOrderMap[idx]]}`}
                      style={{ animationDelay: `${isFirst ? 0 : 180 + idx * 120}ms` }}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPlayer(player)}
                        onKeyDown={(e) => openOnKey(e, player)}
                        className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 sm:rounded-[2rem] ${theme.ring} ${theme.bg} ${theme.extra} ${
                          isFirst ? "fcl-shine px-1.5 pb-3 pt-4 sm:px-6 sm:pb-7 sm:pt-9" : "px-1.5 pb-2.5 pt-3 sm:px-5 sm:pb-6 sm:pt-6"
                        } transition-transform duration-300 hover:-translate-y-1.5 sm:hover:-translate-y-2`}
                      >
                        {/* Rank chip */}
                        <div className="flex justify-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[8px] font-black tracking-wider sm:px-3 sm:py-1 sm:text-[10px] ${theme.chip}`}
                          >
                            <span className="sm:hidden">#{rank}</span>
                            <span className="hidden sm:inline">
                              {theme.icon} {theme.label} MVP
                            </span>
                          </span>
                        </div>

                        {/* Photo */}
                        <div className="relative mx-auto mt-2.5 sm:mt-5">
                          {isFirst && (
                            <span className="fcl-float absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 text-base sm:-top-7 sm:text-3xl">
                              👑
                            </span>
                          )}
                          <div
                            className={`mx-auto overflow-hidden rounded-full bg-[#0f172a] ring-2 ring-offset-2 ring-offset-black sm:ring-[3px] ${theme.photoRing} ${
                              isFirst ? "h-14 w-14 sm:h-28 sm:w-28" : "h-11 w-11 sm:h-20 sm:w-20"
                            }`}
                          >
                            <img
                              src={getPhoto(player)}
                              alt={player.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER;
                              }}
                            />
                          </div>
                        </div>

                        {/* Name (full) */}
                        <h3
                          className={`mt-2.5 break-words text-center font-black leading-tight text-white transition group-hover:text-[#60a5fa] sm:mt-4 ${
                            isFirst ? "text-[11px] sm:text-2xl" : "text-[10px] sm:text-lg"
                          }`}
                        >
                          {player.name}
                        </h3>
                        <p className="mt-0.5 text-center text-[8px] text-[#94a3b8] sm:text-xs">{player.role}</p>

                        {/* Points */}
                        <div className="mt-2 rounded-xl border border-white/10 bg-black/60 px-1 py-1.5 text-center sm:mt-4 sm:rounded-2xl sm:py-3">
                          <p className="hidden text-[9px] font-black uppercase tracking-[0.25em] text-[#94a3b8] sm:block">
                            All-Time Rating
                          </p>
                          <p className={`font-black leading-none ${theme.text} ${isFirst ? "text-base sm:mt-1 sm:text-5xl" : "text-sm sm:mt-1 sm:text-3xl"}`}>
                            <CountUp value={points} />
                            <span className="ml-0.5 text-[8px] font-bold text-[#94a3b8] sm:ml-1 sm:text-xs">PTS</span>
                          </p>
                        </div>

                        {/* Mini stats */}
                        <div className="mt-1.5 grid grid-cols-3 gap-1 text-center sm:mt-3 sm:gap-2">
                          <div className="rounded-lg border border-white/5 bg-black/40 py-1 sm:rounded-xl sm:py-2">
                            <p className="text-[10px] font-black text-[#22c55e] sm:text-base">{(player.runs ?? 0).toLocaleString()}</p>
                            <p className="text-[7px] font-bold uppercase tracking-wide text-[#64748b] sm:text-[9px]">Runs</p>
                          </div>
                          <div className="rounded-lg border border-white/5 bg-black/40 py-1 sm:rounded-xl sm:py-2">
                            <p className="text-[10px] font-black text-[#f59e0b] sm:text-base">{player.wickets ?? 0}</p>
                            <p className="text-[7px] font-bold uppercase tracking-wide text-[#64748b] sm:text-[9px]">Wkts</p>
                          </div>
                          <div className="rounded-lg border border-white/5 bg-black/40 py-1 sm:rounded-xl sm:py-2">
                            <p className="text-[10px] font-black text-[#38bdf8] sm:text-base">{player.champion ?? 0}x</p>
                            <p className="text-[7px] font-bold uppercase tracking-wide text-[#64748b] sm:text-[9px]">Wins</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )
        )}

        {/* ===== CATEGORY BUTTONS ===== */}
        <nav className="mb-5 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-2.5 lg:grid-cols-6" aria-label="Ranking category">
          {CATEGORIES.map((tab) => {
            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleCategoryChange(tab.id)}
                aria-pressed={active}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-2.5 text-center font-bold transition duration-300 sm:flex-row sm:gap-2 sm:px-3 sm:py-3 ${
                  active
                    ? tab.id === "mvp"
                      ? "bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-black shadow-lg shadow-[#f59e0b]/30"
                      : "bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/30"
                    : "border border-[#1e293b] bg-[#0b1220]/80 text-[#94a3b8] hover:border-[#1877F2]/40 hover:text-white"
                }`}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span className="text-[10px] leading-tight sm:hidden">{tab.short}</span>
                <span className="hidden text-xs leading-tight sm:inline lg:text-[11px] xl:text-xs">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ===== RANKINGS ===== */}
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="fcl-live text-center text-sm font-semibold text-[#60a5fa]">
              Calculating full rankings & MVP points, please wait...
            </div>
          </div>
        ) : filteredRankings.length === 0 ? (
          <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] p-10 text-center">
            <p className="text-3xl">🔎</p>
            <p className="mt-3 text-sm font-bold text-white">No player found</p>
            <p className="mt-1 text-xs text-[#94a3b8]">Try a different name or nickname.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ---------- MOBILE / TABLET: card list ---------- */}
            <div className="space-y-2.5 lg:hidden">
              {displayed.map(({ player, rank }, index) => {
                const primary = getPrimary(player, category);
                return (
                  <div
                    key={category + player.name + rank}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPlayer(player)}
                    onKeyDown={(e) => openOnKey(e, player)}
                    style={{ animationDelay: `${Math.min(index, 10) * 35}ms` }}
                    className={`fcl-row cursor-pointer rounded-2xl border p-3 transition active:bg-[#1877F2]/10 ${
                      rank === 1 && category === "mvp"
                        ? "border-[#f59e0b]/40 bg-gradient-to-r from-[#1c1203] to-[#0b1220]"
                        : "border-[#1e293b] bg-[#0b1220]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black ${rankBadge(rank)}`}>
                        {rank}
                      </span>
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[#1e293b] bg-[#030712]">
                        <img
                          src={getPhoto(player)}
                          alt={player.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER;
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-bold leading-tight text-white">{player.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md border border-[#1e293b] bg-[#030712] px-1.5 py-0.5 text-[9px] text-[#94a3b8]">
                            {player.role || "Player"}
                          </span>
                          {player.nickName && <span className="break-words text-[10px] text-[#64748b]">@{player.nickName}</span>}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-lg font-black leading-none ${primary.text}`}>{primary.value.toLocaleString()}</p>
                        <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">{primary.label}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-5 gap-1.5 text-center">
                      <div className="min-w-0 rounded-lg bg-black/30 py-1.5">
                        <p className="text-xs font-black text-white">{player.matches ?? 0}</p>
                        <p className="text-[8px] font-bold uppercase text-[#64748b]">Mat</p>
                      </div>
                      <div className="min-w-0 rounded-lg bg-black/30 py-1.5">
                        <p className="text-xs font-black text-[#22c55e]">{player.runs ?? 0}</p>
                        <p className="text-[8px] font-bold uppercase text-[#64748b]">Runs</p>
                      </div>
                      <div className="min-w-0 rounded-lg bg-black/30 py-1.5">
                        <p className="text-xs font-black text-[#f59e0b]">{player.wickets ?? 0}</p>
                        <p className="text-[8px] font-bold uppercase text-[#64748b]">Wkts</p>
                      </div>
                      <div className="min-w-0 rounded-lg bg-black/30 py-1.5">
                        <p className="text-xs font-black">
                          <span className="text-[#c084fc]">{player.sixes ?? 0}</span>
                          <span className="text-[#475569]">/</span>
                          <span className="text-[#38bdf8]">{player.fours ?? 0}</span>
                        </p>
                        <p className="text-[8px] font-bold uppercase text-[#64748b]">6s/4s</p>
                      </div>
                      <div className="min-w-0 rounded-lg bg-black/30 py-1.5">
                        <p className="text-xs font-black text-[#f59e0b]">🏆{player.champion ?? 0}</p>
                        <p className="text-[8px] font-bold uppercase text-[#64748b]">Titles</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ---------- DESKTOP: premium table ---------- */}
            <div className="hidden overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220]/90 shadow-2xl backdrop-blur lg:block">
              <div className="grid grid-cols-[56px_minmax(0,2.4fr)_minmax(0,1fr)_repeat(3,64px)_84px_64px_minmax(0,1.4fr)] items-center gap-3 border-b border-[#1e293b] bg-[#070d19] px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                <div className="text-center">Rank</div>
                <div>Player</div>
                <div>Role</div>
                <div className="text-center">Mat</div>
                <div className="text-center">Runs</div>
                <div className="text-center">Wkts</div>
                <div className="text-center">6s / 4s</div>
                <div className="text-center">Titles</div>
                <div className="text-right">{category === "mvp" ? "MVP Rating" : "Primary Stat"}</div>
              </div>

              <div className="divide-y divide-[#172033]/60">
                {displayed.map(({ player, rank }, index) => {
                  const primary = getPrimary(player, category);
                  const pct = Math.max(3, Math.round((primary.value / maxValue) * 100));
                  return (
                    <div
                      key={category + player.name + rank}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPlayer(player)}
                      onKeyDown={(e) => openOnKey(e, player)}
                      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
                      className={`fcl-row group grid cursor-pointer grid-cols-[56px_minmax(0,2.4fr)_minmax(0,1fr)_repeat(3,64px)_84px_64px_minmax(0,1.4fr)] items-center gap-3 px-5 py-3 text-sm transition ${
                        category === "mvp" && rank === 1
                          ? "bg-[#f59e0b]/5 hover:bg-[#f59e0b]/12"
                          : "hover:bg-[#1877F2]/10"
                      }`}
                    >
                      <div className="flex justify-center">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${rankBadge(rank)}`}>
                          {rank}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[#1e293b] bg-[#030712] transition group-hover:border-[#1877F2]/50">
                          <img
                            src={getPhoto(player)}
                            alt={player.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER;
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="break-words font-bold leading-tight text-white transition group-hover:text-[#60a5fa]">
                            {player.name}
                          </p>
                          {player.nickName && <span className="break-words text-[11px] text-[#64748b]">@{player.nickName}</span>}
                        </div>
                      </div>

                      <div>
                        <span className="inline-block rounded-md border border-[#1e293b] bg-[#030712] px-2 py-0.5 text-[10px] text-[#94a3b8]">
                          {player.role || "Player"}
                        </span>
                      </div>

                      <div className="text-center font-bold text-white">{player.matches ?? 0}</div>
                      <div className="text-center font-bold text-[#22c55e]">{player.runs ?? 0}</div>
                      <div className="text-center font-bold text-[#f59e0b]">{player.wickets ?? 0}</div>
                      <div className="text-center text-xs">
                        <span className="font-bold text-[#c084fc]">{player.sixes ?? 0}</span>
                        <span className="text-[#475569]"> / </span>
                        <span className="font-bold text-[#38bdf8]">{player.fours ?? 0}</span>
                      </div>
                      <div className="text-center text-xs">
                        🏆 <span className="font-bold text-[#f59e0b]">{player.champion ?? 0}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-baseline justify-end gap-1.5">
                          <span className={`text-lg font-black ${primary.text}`}>{primary.value.toLocaleString()}</span>
                          <span className="text-[10px] font-bold uppercase text-[#64748b]">{primary.label}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#030712]">
                          <div
                            className={`fcl-bar h-full rounded-full bg-gradient-to-r ${primary.bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ===== LOAD MORE ===== */}
            {visibleCount < filteredRankings.length && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 50)}
                  className="w-full rounded-2xl border border-[#1877F2]/40 bg-[#1877F2]/10 px-6 py-3.5 text-xs font-black text-[#60a5fa] shadow-lg transition hover:bg-[#1877F2] hover:text-white sm:w-auto sm:px-10 sm:text-sm"
                >
                  আরও ৫০ জন লোড করুন ({filteredRankings.length - visibleCount} জন বাকি আছে) ↓
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CENTRALIZED PLAYER CARD MODAL */}
      <PlayerCardModal
        selectedPlayer={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        tournamentsData={tournamentsData || []}
        allPlayers={players || []}
      />
    </div>
  );
}