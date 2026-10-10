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
  if (!p) return 0;
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

/* =====================================================================
   📱 MOBILE LAYOUT (শুধু ফোনে দেখাবে — md এর নিচে)
   ===================================================================== */
type MTabId = string;

const MOBILE_TABS: { id: MTabId; label: string; icon: string }[] = [
  { id: "records", label: "Record Holders", icon: "🌟" },
  { id: "clubs", label: "Elite Clubs", icon: "💎" },
  { id: "points", label: "FCL Points", icon: "💯" },
  { id: "runs", label: "Most Runs", icon: "🏏" },
  { id: "wickets", label: "Most Wickets", icon: "🎯" },
  { id: "sixes", label: "Six Machine", icon: "💥" },
  { id: "fours", label: "Boundary Kings", icon: "🔷" },
  { id: "hattricks", label: "Hat-Tricks", icon: "🎩" },
  { id: "champions", label: "Champions", icon: "🏆" },
  { id: "runnersup", label: "Runners-Up", icon: "🥈" },
  { id: "finals", label: "Total Finals", icon: "⚔️" },
  { id: "motcpot", label: "MOT / CPOT", icon: "⭐" },
  { id: "runking", label: "Tour. Run King", icon: "👑" },
  { id: "wicketking", label: "Tour. Wicket King", icon: "🛡️" },
  { id: "matches", label: "Most Matches", icon: "⚡" },
  { id: "mom", label: "Man of Match", icon: "🎖️" },
  { id: "cpom", label: "CP of Match", icon: "🏅" },
  { id: "innings", label: "Most Innings", icon: "📋" },
  { id: "notout", label: "Most Not Outs", icon: "🧱" },
  { id: "maxruns", label: "Highest Tour. Runs", icon: "🚀" },
  { id: "maxwickets", label: "Best Bowling", icon: "🔥" },
  { id: "tournaments", label: "Tournaments", icon: "🗓️" },
];

// 🌟 ডায়মন্ড সবার উপরে এবং সিলভার সবার শেষে (হায়েস্ট থেকে লো)
const TIERS = [
  { key: "Diamond", icon: "💎", title: "Diamond All-Rounder", range: "2500+ Runs • 150+ Wkts", test: (p: Player) => p.runs >= 2500 && p.wickets >= 150 },
  { key: "Gold", icon: "🥇", title: "Gold All-Rounder", range: "2000–2500 Runs • 100–150 Wkts", test: (p: Player) => p.runs >= 2000 && p.runs < 2500 && p.wickets >= 100 && p.wickets < 150 },
  { key: "Silver", icon: "🥈", title: "Silver All-Rounder", range: "1000–2000 Runs • 50–100 Wkts", test: (p: Player) => p.runs >= 1000 && p.runs < 2000 && p.wickets >= 50 && p.wickets < 100 },
  { key: "Bronze", icon: "🥉", title: "Bronze All-Rounder", range: "500–1000 Runs • 50–100 Wkts", test: (p: Player) => p.runs >= 500 && p.runs < 1000 && p.wickets >= 50 && p.wickets < 100 },
];

const COUNT_CHIPS = ["Top 5", "Top 10", "Top 20", "Top 50", "All"];
const CLUB_CHIPS = ["All", "Diamond", "Gold", "Silver", "Bronze"];

interface MRow {
  key: string;
  player: Player;
  badge: string;
  meta: string;
  value: string | number;
  unit?: string;
}

const motTotal = (p: Player) => (Number(p.mot) || 0) + (Number(p.cpot) || 0);
const safeWk = (p: Player) => {
  if (p.wkAvg && p.wkAvg !== "0.00" && p.wkAvg !== "0") return p.wkAvg;
  if (p.matches > 0 && p.wickets > 0) return (p.wickets / p.matches).toFixed(2);
  return "0.00";
};

const MOBILE_CFG: Record<string, { v: (p: Player) => number; badge: (p: Player) => string; meta: (p: Player) => string; unit: string }> = {
  points: { v: (p) => calculateFclPoints(p), badge: (p) => `${p.runs} Runs • ${p.wickets} Wkts`, meta: (p) => `${p.matches} Matches`, unit: "Pts" },
  runs: { v: (p) => p.runs, badge: (p) => `Avg ${p.runAvg ?? "0.00"}`, meta: (p) => `${p.matches} Matches`, unit: "Runs" },
  wickets: { v: (p) => p.wickets, badge: (p) => `Wk Avg ${safeWk(p)}`, meta: (p) => `${p.matches} Matches`, unit: "Wkts" },
  sixes: { v: (p) => p.sixes || 0, badge: (p) => `${p.runs} Runs`, meta: (p) => `${p.matches} Mat`, unit: "Sixes" },
  fours: { v: (p) => p.fours || 0, badge: (p) => `${p.runs} Runs`, meta: (p) => `${p.matches} Mat`, unit: "Fours" },
  hattricks: { v: (p) => p.hatTricks || 0, badge: (p) => `${p.wickets} Total Wkts`, meta: (p) => `${p.matches} Matches`, unit: "Hat-tricks" },
  champions: { v: (p) => p.champion || 0, badge: (p) => `${p.totalFinal ?? 0} Finals`, meta: (p) => `${p.matches} Matches`, unit: "Titles" },
  runnersup: { v: (p) => p.runnersUp || 0, badge: (p) => `${p.totalFinal ?? 0} Finals`, meta: (p) => `${p.matches} Matches`, unit: "Times" },
  finals: { v: (p) => p.totalFinal || 0, badge: (p) => `${p.champion ?? 0}x Champion`, meta: (p) => `${p.runnersUp ?? 0}x Runner-Up`, unit: "Finals" },
  motcpot: { v: motTotal, badge: (p) => `MOT ${p.mot ?? 0} | CPOT ${p.cpot ?? 0}`, meta: (p) => `${p.matches} Matches`, unit: "Awards" },
  runking: { v: (p) => p.highestRunScorer || 0, badge: () => "Tournament Top Scorer", meta: (p) => `${p.runs} Runs`, unit: "Times" },
  wicketking: { v: (p) => p.topWicketTaker || 0, badge: () => "Tournament Top Bowler", meta: (p) => `${p.wickets} Wkts`, unit: "Times" },
  matches: { v: (p) => p.matches, badge: (p) => `${p.runs} Runs • ${p.wickets} Wkts`, meta: (p) => `@${p.nickName || "Player"}`, unit: "Matches" },
  mom: { v: (p) => p.mom || 0, badge: () => "Man of the Match", meta: (p) => `${p.matches} Matches`, unit: "Awards" },
  cpom: { v: (p) => p.cpom || 0, badge: () => "Champion Player of Match", meta: (p) => `${p.matches} Matches`, unit: "Awards" },
  innings: { v: (p) => p.innings || 0, badge: (p) => `${p.runs} Runs`, meta: (p) => `${p.matches} Matches`, unit: "Inn" },
  notout: { v: (p) => p.notOut || 0, badge: (p) => `${p.innings ?? 0} Innings`, meta: (p) => `${p.runs} Runs`, unit: "NO" },
  maxruns: { v: (p) => p.maxRuns || 0, badge: () => "Best Batting Score", meta: (p) => `${p.runs} Career Runs`, unit: "Runs" },
  maxwickets: { v: (p) => p.maxWickets || 0, badge: () => "Best Bowling Figure", meta: (p) => `${p.wickets} Career Wkts`, unit: "Wkts" },
  tournaments: { v: (p) => p.totalTournament || 0, badge: (p) => `${p.matches} Matches`, meta: (p) => `@${p.nickName || "Player"}`, unit: "Tours" },
};

function MobileRecords({
  players,
  loading,
  onSelect,
}: {
  players: Player[];
  loading: boolean;
  onSelect: (p: Player) => void;
}) {
  const [tab, setTab] = useState<MTabId>("records");
  const [chip, setChip] = useState("Top 10");
  const [expanded, setExpanded] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const changeTab = (id: MTabId) => {
    setTab(id);
    setChip(id === "clubs" ? "All" : "Top 10");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chips = tab === "records" ? [] : tab === "clubs" ? CLUB_CHIPS : COUNT_CHIPS;

  const rows: MRow[] = useMemo(() => {
    const by = (fn: (p: Player) => number) => [...players].sort((a, b) => fn(b) - fn(a));

    if (tab === "records") {
      const defs: { label: string; p?: Player; value: (p: Player) => string | number; unit: string }[] = [
        { label: "🏆 Most Titles", p: by((p) => p.champion || 0)[0], value: (p) => p.champion ?? 0, unit: "Titles" },
        { label: "🏏 All-Time Runs", p: by((p) => p.runs)[0], value: (p) => p.runs.toLocaleString(), unit: "Runs" },
        { label: "🎯 All-Time Wickets", p: by((p) => p.wickets)[0], value: (p) => p.wickets, unit: "Wkts" },
        { label: "⚔️ Total Finals", p: by((p) => p.totalFinal || 0)[0], value: (p) => p.totalFinal ?? 0, unit: "Finals" },
        { label: "⚡ Most Matches", p: by((p) => p.matches)[0], value: (p) => p.matches, unit: "Matches" },
        { label: "💥 Six Machine", p: by((p) => p.sixes || 0)[0], value: (p) => p.sixes ?? 0, unit: "Sixes" },
        { label: "🔥 Hat-Trick Master", p: by((p) => p.hatTricks || 0)[0], value: (p) => p.hatTricks ?? 0, unit: "Hat-tricks" },
        { label: "⭐ Most MOT / CPOT", p: by(motTotal)[0], value: (p) => motTotal(p), unit: "Awards" },
        { label: "👑 Tour. Run King", p: by((p) => p.highestRunScorer || 0)[0], value: (p) => p.highestRunScorer ?? 0, unit: "Times" },
        { label: "🛡️ Tour. Wicket King", p: by((p) => p.topWicketTaker || 0)[0], value: (p) => p.topWicketTaker ?? 0, unit: "Times" },
        { label: "💯 FCL Points Leader", p: by((p) => calculateFclPoints(p))[0], value: (p) => calculateFclPoints(p), unit: "Pts" },
      ];
      return defs
        .filter((d) => d.p)
        .map((d) => ({
          key: d.label,
          player: d.p as Player,
          badge: d.label,
          meta: `@${d.p!.nickName || "Player"}`,
          value: d.value(d.p!),
          unit: d.unit,
        }));
    }

    if (tab === "clubs") {
      const out: MRow[] = [];
      TIERS.filter((t) => chip === "All" || chip === t.key).forEach((t) => {
        players.filter(t.test).forEach((p, i) =>
          out.push({
            key: t.key + p.name + i,
            player: p,
            badge: `${t.icon} ${t.title}`,
            meta: `@${p.nickName || "Player"} • ${p.matches} Mat`,
            value: `${p.runs}R | ${p.wickets}W`,
          })
        );
      });
      return out;
    }

    const c = MOBILE_CFG[tab];
    if (!c) return [];
    const limit = chip === "All" ? Infinity : parseInt(chip.replace("Top ", "")) || 10;
    const q = query.trim().toLowerCase();

    return by(c.v)
      .filter((p) => c.v(p) > 0)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.nickName || "").toLowerCase().includes(q))
      .slice(0, limit)
      .map((p, i) => ({
        key: (p.id ?? p.name) + "-" + i,
        player: p,
        badge: c.badge(p),
        meta: c.meta(p),
        value: c.v(p),
        unit: c.unit,
      }));
  }, [players, tab, chip, query]);

  const visibleTabs = expanded ? MOBILE_TABS : MOBILE_TABS.slice(0, 10);
  const currentTab = MOBILE_TABS.find((t) => t.id === tab);

  return (
    <div className="min-h-screen bg-[#050b18] pb-28 text-white">
      <header className="sticky top-0 z-30 bg-[#050b18]/95 px-4 pb-2 pt-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-300">
            ‹
          </Link>
          <h1 className="flex-1 text-xl font-black tracking-tight">FCL Records</h1>
          <div className="flex items-center gap-1.5 rounded-full border border-[#1e293b] bg-[#0b1220] px-3 py-1.5 text-sm font-black text-[#f59e0b]">
            👥 {players.length}
          </div>
          <button
            onClick={() => setShowSearch((s) => !s)}
            aria-label="Search player"
            className={`flex h-9 w-9 items-center justify-center rounded-full border text-base ${
              showSearch ? "border-[#f59e0b] bg-[#f59e0b]/15" : "border-[#1e293b] bg-[#0b1220]"
            }`}
          >
            🔍
          </button>
        </div>
        {showSearch && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search player name..."
            className="mt-3 w-full rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#f59e0b]/60"
          />
        )}
      </header>

      <div className="mx-3 rounded-3xl bg-[#0a1324] p-3">
        <div className="grid grid-cols-5 gap-2">
          {visibleTabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => changeTab(t.id)}
                className={`flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-center transition ${
                  active
                    ? "bg-[#f59e0b] text-black shadow-lg shadow-[#f59e0b]/25"
                    : "border border-[#172033] bg-[#0f1b33] text-slate-200 active:scale-95"
                }`}
              >
                <span className="text-2xl leading-none">{t.icon}</span>
                <span className="text-[10.5px] font-bold leading-tight">{t.label}</span>
              </button>
            );
          })}
        </div>

        <button onClick={() => setExpanded((e) => !e)} className="mx-auto mt-3 block text-sm font-black text-[#60a5fa]">
          {expanded ? "See less ⌃" : "See more ⌄"}
        </button>

        {chips.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => setChip(c)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  chip === c ? "bg-[#22c55e] text-white" : "border border-[#1e293b] bg-[#0b1220] text-slate-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="px-3 pt-4">
        <p className="mb-2 px-1 text-xs font-semibold text-slate-500">
          {currentTab?.icon} {currentTab?.label}
        </p>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm font-semibold text-[#f59e0b] animate-pulse">
            Compiling FCL All-Time Records, please be patient...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-[#1e293b] bg-[#0b1220] py-10 text-center text-xs text-slate-500">
            {tab === "clubs" ? "এই স্ল্যাবে এখনো কোনো খেলোয়াড় নেই" : "কোনো ডাটা পাওয়া যায়নি"}
          </div>
        ) : (
          <div className="space-y-3">
            {tab === "clubs" && chip !== "All" && (
              <div className="rounded-2xl border border-[#1e293b] bg-[#0b1220]/60 px-4 py-2 text-[11px] text-slate-400">
                {TIERS.find((t) => t.key === chip)?.range}
              </div>
            )}
            {rows.map((r, idx) => (
              <button
                key={r.key}
                onClick={() => onSelect(r.player)}
                className="block w-full rounded-2xl border border-[#1e293b] bg-[#0b1220] px-4 py-3 text-left transition active:scale-[0.98]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="max-w-[62%] truncate rounded-lg bg-[#16223b] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                    {r.badge}
                  </span>
                  <span className="truncate text-[11px] font-medium text-slate-500">{r.meta}</span>
                </div>
                <div className="mt-2.5 flex items-end justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {tab !== "records" && (
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                          idx === 0
                            ? "bg-[#f59e0b] text-black"
                            : idx === 1
                            ? "bg-[#cbd5e1] text-black"
                            : idx === 2
                            ? "bg-[#b45309] text-white"
                            : "bg-[#16223b] text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    )}
                    <h3 className="truncate text-[17px] font-black leading-tight text-white">{r.player.name}</h3>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xl font-black text-[#fbbf24]">{r.value}</span>
                    {r.unit && <span className="ml-1 text-[10px] font-bold text-slate-500">{r.unit}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-3 left-3 right-3 z-40">
        <div className="relative flex items-center justify-between rounded-3xl border border-[#1e293b] bg-[#0b1220]/95 px-5 py-2 shadow-2xl backdrop-blur">
          <Link href="/" className="flex w-14 flex-col items-center text-[11px] font-semibold text-slate-400">
            <span className="text-lg">🏠</span>Home
          </Link>
          <button
            onClick={() => changeTab("records")}
            className="flex w-16 flex-col items-center rounded-2xl bg-[#f59e0b]/15 py-1 text-[11px] font-black text-[#f59e0b]"
          >
            <span className="text-lg">📊</span>Records
          </button>
          <button
            onClick={() => {
              setExpanded(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-label="Scroll to menu"
            className="-mt-9 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#050b18] bg-[#020617] text-xl shadow-lg ring-1 ring-[#1e293b]"
          >
            ▦
          </button>
          <Link href="/rankings" className="flex w-16 flex-col items-center text-[11px] font-semibold text-slate-400">
            <span className="text-lg">🚀</span>Rankings
          </Link>
          <button onClick={() => changeTab("clubs")} className="flex w-14 flex-col items-center text-[11px] font-semibold text-slate-400">
            <span className="text-lg">💎</span>Clubs
          </button>
        </div>
      </nav>
    </div>
  );
}

/* =====================================================================
   🖥️ DESKTOP (PC) LAYOUT — বামে মেনু, ডানে লিস্ট
   ===================================================================== */
const initials = (name: string) =>
  (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

// 🌟 বামের মেনুতে Elite অপশনটি Record Holders-এর পরেই দুই নম্বরে রাখা হলো
const GROUPS: { title: string; ids: string[] }[] = [
  { title: "Overview", ids: ["records", "clubs"] },
  { title: "Batting", ids: ["runs", "sixes", "fours", "maxruns", "innings", "notout"] },
  { title: "Bowling", ids: ["wickets", "hattricks", "maxwickets"] },
  { title: "Trophies & Honours", ids: ["champions", "runnersup", "finals", "motcpot", "mom", "cpom", "runking", "wicketking"] },
  { title: "Overall", ids: ["points", "matches", "tournaments"] },
];

const DESC: Record<string, string> = {
  records: "প্রতিটি ক্যাটাগরির সর্বকালের এক নম্বর খেলোয়াড়",
  points: "রান, উইকেট, ট্রফি ও অ্যাওয়ার্ড মিলিয়ে মোট FCL পয়েন্ট",
  runs: "ক্যারিয়ারে সর্বোচ্চ রান",
  wickets: "ক্যারিয়ারে সর্বোচ্চ উইকেট",
  sixes: "সবচেয়ে বেশি ছক্কা",
  fours: "সবচেয়ে বেশি চার",
  hattricks: "সবচেয়ে বেশি হ্যাটট্রিক",
  champions: "সবচেয়ে বেশি টুর্নামেন্ট জয়",
  runnersup: "সবচেয়ে বেশিবার রানার্স-আপ",
  finals: "সবচেয়ে বেশি ফাইনাল খেলা",
  motcpot: "MOT ও CPOT মিলিয়ে মোট অ্যাওয়ার্ড",
  runking: "টুর্নামেন্টে সর্বোচ্চ রানের মালিক হয়েছেন যতবার",
  wicketking: "টুর্নামেন্টে সর্বোচ্চ উইকেটের মালিক হয়েছেন যতবার",
  matches: "সবচেয়ে বেশি ম্যাচ খেলা",
  mom: "ম্যান অফ দ্য ম্যাচ",
  cpom: "চ্যাম্পিয়ন প্লেয়ার অফ দ্য ম্যাচ",
  innings: "সবচেয়ে বেশি ইনিংস",
  notout: "সবচেয়ে বেশি নট-আউট",
  maxruns: "এক টুর্নামেন্টে সর্বোচ্চ ব্যক্তিগত রান",
  maxwickets: "এক ম্যাচে সর্বোচ্চ উইকেট",
  tournaments: "সবচেয়ে বেশি টুর্নামেন্টে অংশগ্রহণ",
  clubs: "রান ও উইকেটের স্ল্যাব অনুযায়ী অলরাউন্ডার ক্লাব",
};

const ACCENT: Record<string, string> = {
  records: "#f59e0b", points: "#f59e0b", runs: "#60a5fa", wickets: "#fb7185", sixes: "#c084fc",
  fours: "#38bdf8", hattricks: "#f472b6", champions: "#fbbf24", runnersup: "#cbd5e1", finals: "#22d3ee",
  motcpot: "#c084fc", runking: "#fb923c", wicketking: "#22d3ee", matches: "#34d399", mom: "#fbbf24",
  cpom: "#fbbf24", innings: "#60a5fa", notout: "#94a3b8", maxruns: "#f87171", maxwickets: "#fb923c",
  tournaments: "#34d399", clubs: "#a78bfa",
};

const TIER_COLOR: Record<string, string> = { Bronze: "#cd7f32", Silver: "#cbd5e1", Gold: "#fbbf24", Diamond: "#67e8f9" };

function Avatar({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-black text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${color}55, ${color}15)`,
        border: `1.5px solid ${color}80`,
        boxShadow: `0 0 18px ${color}30`,
      }}
    >
      {initials(name)}
    </div>
  );
}

function DesktopRecords({
  players,
  tournamentsData,
  loading,
  onSelect,
}: {
  players: Player[];
  tournamentsData: TournamentRecord[];
  loading: boolean;
  onSelect: (p: Player) => void;
}) {
  const [tab, setTab] = useState("records");
  const [chip, setChip] = useState("Top 10");
  const [query, setQuery] = useState("");

  const tabInfo = MOBILE_TABS.find((t) => t.id === tab);
  const accent = ACCENT[tab] || "#f59e0b";

  const changeTab = (id: string) => {
    setTab(id);
    setChip(id === "clubs" ? "All" : "Top 10");
  };

  const onSearch = (v: string) => {
    setQuery(v);
    if (v && (tab === "records" || tab === "clubs")) changeTab("points");
  };

  // 🌟 এ পর্যন্ত মোট কতটি টুর্নামেন্ট হয়েছে (tournamentsData থেকে ইউনিক টুর্নামেন্ট গণণা)
  const totalTournamentsCount = useMemo(() => {
    if (!tournamentsData || tournamentsData.length === 0) return 0;
    const uniqueTournaments = new Set(tournamentsData.map((t) => (t.tournament || "").trim().toLowerCase()));
    return uniqueTournaments.size;
  }, [tournamentsData]);

  const totals = useMemo(
    () => ({
      runs: players.reduce((s, p) => s + (Number(p.runs) || 0), 0),
      wickets: players.reduce((s, p) => s + (Number(p.wickets) || 0), 0),
      tournaments: totalTournamentsCount,
    }),
    [players, totalTournamentsCount]
  );

  // Hall of fame (record holders)
  const holders = useMemo(() => {
    const top = (fn: (p: Player) => number) => [...players].sort((a, b) => fn(b) - fn(a))[0];
    const defs = [
      { id: "champions", label: "Most Titles", icon: "🏆", fn: (p: Player) => p.champion || 0, unit: "Titles" },
      { id: "runs", label: "All-Time Runs", icon: "🏏", fn: (p: Player) => p.runs, unit: "Runs" },
      { id: "wickets", label: "All-Time Wickets", icon: "🎯", fn: (p: Player) => p.wickets, unit: "Wickets" },
      { id: "finals", label: "Total Finals", icon: "⚔️", fn: (p: Player) => p.totalFinal || 0, unit: "Finals" },
      { id: "matches", label: "Most Matches", icon: "⚡", fn: (p: Player) => p.matches, unit: "Matches" },
      { id: "sixes", label: "Six Machine", icon: "💥", fn: (p: Player) => p.sixes || 0, unit: "Sixes" },
      { id: "hattricks", label: "Hat-Trick Master", icon: "🎩", fn: (p: Player) => p.hatTricks || 0, unit: "Hat-tricks" },
      { id: "points", label: "FCL Points", icon: "💯", fn: (p: Player) => calculateFclPoints(p), unit: "Points" },
      { id: "fours", label: "Boundary Kings", icon: "🔷", fn: (p: Player) => p.fours || 0, unit: "Fours" },
      { id: "runnersup", label: "Runners-Up", icon: "🥈", fn: (p: Player) => p.runnersUp || 0, unit: "Times" },
      { id: "motcpot", label: "MOT / CPOT", icon: "⭐", fn: motTotal, unit: "Awards" },
      { id: "runking", label: "Tour. Run King", icon: "👑", fn: (p: Player) => p.highestRunScorer || 0, unit: "Times" },
      { id: "wicketking", label: "Tour. Wicket King", icon: "🛡️", fn: (p: Player) => p.topWicketTaker || 0, unit: "Times" },
      { id: "mom", label: "Man of the Match", icon: "🎖️", fn: (p: Player) => p.mom || 0, unit: "Awards" },
      { id: "cpom", label: "CP of Match", icon: "🏅", fn: (p: Player) => p.cpom || 0, unit: "Awards" },
      { id: "innings", label: "Most Innings", icon: "📋", fn: (p: Player) => p.innings || 0, unit: "Innings" },
      { id: "notout", label: "Most Not Outs", icon: "🧱", fn: (p: Player) => p.notOut || 0, unit: "Not Outs" },
      { id: "maxruns", label: "Highest Tour. Runs", icon: "🚀", fn: (p: Player) => p.maxRuns || 0, unit: "Runs" },
      { id: "maxwickets", label: "Best Bowling", icon: "🔥", fn: (p: Player) => p.maxWickets || 0, unit: "Wickets" },
    ];
    return defs
      .map((d) => {
        const p = top(d.fn);
        return { ...d, player: p, value: p ? d.fn(p) : 0 };
      })
      .filter((d) => d.player);
  }, [players]);

  const rows = useMemo(() => {
    const c = MOBILE_CFG[tab];
    if (!c) return [];
    const limit = chip === "All" ? Infinity : parseInt(chip.replace("Top ", "")) || 10;
    const q = query.trim().toLowerCase();
    return [...players]
      .sort((a, b) => c.v(b) - c.v(a))
      .filter((p) => c.v(p) > 0)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.nickName || "").toLowerCase().includes(q))
      .slice(0, limit)
      .map((p) => ({ player: p, badge: c.badge(p), meta: c.meta(p), value: c.v(p), unit: c.unit }));
  }, [players, tab, chip, query]);

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  const podiumOrder = podium.length === 3 ? [1, 0, 2] : podium.map((_, i) => i);
  const medal = ["#fbbf24", "#cbd5e1", "#cd7f32"];

  const featured = holders.slice(0, 3);
  const others = holders.slice(3);

  return (
    <div className="relative min-h-screen bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.10),transparent_60%)]" />

      <div className="relative mx-auto max-w-[1400px] px-8 pb-20 pt-8">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] bg-[#0b1220] text-xl text-slate-300 transition hover:border-[#f59e0b]/50 hover:text-white"
            >
              ‹
            </Link>
            <div>
              <h1 className="text-4xl font-black tracking-tight">FCL Record Corner</h1>
              <p className="mt-1 text-sm text-slate-400">সর্বকালের রেকর্ড, ক্যাটাগরি ধরে ধরে। যেকোনো নামে ক্লিক করলে প্লেয়ার কার্ড খুলবে।</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm">🔍</span>
              <input
                value={query}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search player..."
                className="w-72 rounded-full border border-[#1e293b] bg-[#0b1220] py-2.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#f59e0b]/60"
              />
            </div>
            <Link
              href="/rankings"
              className="rounded-full bg-[#f59e0b] px-6 py-2.5 text-sm font-black text-black shadow-lg shadow-[#f59e0b]/20 transition hover:bg-[#fbbf24]"
            >
              Complete Leaderboard
            </Link>
          </div>
        </div>

        {/* 🌟 Stat strip (6s বাদ দিয়ে মোট টুর্নামেন্ট যোগ করা হলো) */}
        <div className="mt-8 grid grid-cols-4 overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220]/70 backdrop-blur">
          {[
            { label: "Players", value: players.length, color: "#f59e0b" },
            { label: "Career Runs", value: totals.runs, color: "#60a5fa" },
            { label: "Career Wickets", value: totals.wickets, color: "#fb7185" },
            { label: "Total Tournaments", value: totals.tournaments, color: "#34d399" },
          ].map((s, i) => (
            <div key={s.label} className={`px-8 py-5 ${i > 0 ? "border-l border-[#1e293b]" : ""}`}>
              <p className="text-3xl font-black tabular-nums" style={{ color: s.color }}>
                {loading ? "—" : s.value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="mt-8 grid grid-cols-[270px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="self-start">
            <nav className="sticky top-6 max-h-[calc(100vh-3rem)] space-y-5 overflow-y-auto rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-4 [scrollbar-width:thin]">
              {GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="px-3 pb-2 text-xs font-bold text-slate-500">{g.title}</p>
                  <div className="space-y-0.5">
                    {g.ids.map((id) => {
                      const t = MOBILE_TABS.find((x) => x.id === id);
                      if (!t) return null;
                      const active = tab === id;
                      const a = ACCENT[id] || "#f59e0b";
                      return (
                        <button
                          key={id}
                          onClick={() => changeTab(id)}
                          className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                            active ? "bg-white/[0.06] text-white" : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                          }`}
                        >
                          {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: a }} />}
                          <span className="text-lg leading-none">{t.icon}</span>
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <section className="min-w-0">
            {loading ? (
              <div className="flex h-96 items-center justify-center text-sm font-semibold text-[#f59e0b] animate-pulse">
                Compiling FCL All-Time Records from Database, please be patient...
              </div>
            ) : tab === "records" ? (
              /* ---------------- HALL OF FAME ---------------- */
              <div>
                <div className="mb-5">
                  <h2 className="text-2xl font-black">Hall of Fame</h2>
                  <p className="mt-1 text-sm text-slate-400">{DESC.records}</p>
                </div>

                <div className="grid grid-cols-3 gap-5">
                  {featured.map((h) => {
                    const c = ACCENT[h.id];
                    return (
                      <button
                        key={h.id}
                        onClick={() => onSelect(h.player)}
                        className="group relative overflow-hidden rounded-3xl border p-6 text-left transition duration-300 hover:-translate-y-1"
                        style={{
                          borderColor: `${c}45`,
                          background: `linear-gradient(160deg, ${c}22, #0b1220 55%, #050914)`,
                          boxShadow: `0 0 40px ${c}12`,
                        }}
                      >
                        <span className="pointer-events-none absolute -right-4 -top-6 select-none text-[110px] opacity-[0.07]">{h.icon}</span>
                        <p className="text-sm font-bold" style={{ color: c }}>
                          {h.icon} {h.label}
                        </p>
                        <p className="mt-5 text-6xl font-black tabular-nums leading-none" style={{ color: c }}>
                          {Number(h.value).toLocaleString()}
                        </p>
                        <p className="mt-1.5 text-xs font-semibold text-slate-400">{h.unit}</p>
                        <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                          <Avatar name={h.player.name} color={c} size={42} />
                          <div className="min-w-0">
                            <p className="truncate text-base font-black text-white">{h.player.name}</p>
                            <p className="truncate text-xs font-semibold text-slate-400">@{h.player.nickName || "Player"}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-4 xl:grid-cols-4">
                  {others.map((h) => {
                    const c = ACCENT[h.id] || "#f59e0b";
                    return (
                      <button
                        key={h.id}
                        onClick={() => onSelect(h.player)}
                        className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-[#0f192c]"
                        style={{ ["--c" as any]: c }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-400">
                            {h.icon} {h.label}
                          </p>
                        </div>
                        <div className="mt-3 flex items-end justify-between gap-2">
                          <p className="text-3xl font-black tabular-nums leading-none" style={{ color: c }}>
                            {Number(h.value).toLocaleString()}
                          </p>
                          <p className="pb-0.5 text-[11px] font-semibold text-slate-500">{h.unit}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-2.5 border-t border-[#172033] pt-3">
                          <Avatar name={h.player.name} color={c} size={30} />
                          <p className="truncate text-sm font-bold text-white transition group-hover:text-[var(--c)]">{h.player.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : tab === "clubs" ? (
              /* ---------------- ELITE CLUBS (ডায়মন্ড সবার উপরে, সিলভার সবার শেষে) ---------------- */
              <div>
                <div className="mb-5">
                  <h2 className="text-2xl font-black">💎 Elite Milestone Clubs</h2>
                  <p className="mt-1 text-sm text-slate-400">{DESC.clubs}</p>
                </div>
                <div className="mb-6 flex flex-wrap gap-2">
                  {CLUB_CHIPS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setChip(c)}
                      className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                        chip === c ? "bg-[#a78bfa] text-black" : "border border-[#1e293b] bg-[#0b1220] text-slate-300 hover:border-[#a78bfa]/50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-5">
                  {TIERS.filter((t) => chip === "All" || chip === t.key).map((t) => {
                    const c = TIER_COLOR[t.key];
                    const list = players.filter(t.test);
                    return (
                      <div
                        key={t.key}
                        className="overflow-hidden rounded-3xl border"
                        style={{ borderColor: `${c}40`, background: `linear-gradient(170deg, ${c}18, #0b1220 45%)` }}
                      >
                        <div className="flex items-center justify-between p-5 pb-4">
                          <div>
                            <p className="text-lg font-black" style={{ color: c }}>
                              {t.icon} {t.title}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">{t.range}</p>
                          </div>
                          <div className="rounded-full border px-3 py-1 text-sm font-black" style={{ borderColor: `${c}60`, color: c }}>
                            {list.length}
                          </div>
                        </div>
                        <div className="max-h-[360px] space-y-1 overflow-y-auto px-3 pb-3 [scrollbar-width:thin]">
                          {list.length === 0 ? (
                            <p className="py-8 text-center text-xs text-slate-500">এই স্ল্যাবে এখনো কোনো খেলোয়াড় নেই</p>
                          ) : (
                            list.map((p, i) => (
                              <button
                                key={p.name + i}
                                onClick={() => onSelect(p)}
                                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-white/[0.05]"
                              >
                                <Avatar name={p.name} color={c} size={36} />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-white">{p.name}</p>
                                  <p className="truncate text-[11px] text-slate-400">
                                    @{p.nickName || "Player"} • {p.matches} Matches
                                  </p>
                                </div>
                                <div className="text-right text-xs font-black">
                                  <span className="text-[#60a5fa]">{p.runs}R</span>
                                  <span className="mx-1.5 text-slate-600">|</span>
                                  <span className="text-[#fb7185]">{p.wickets}W</span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ---------------- LEADERBOARD ---------------- */
              <div>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">
                      {tabInfo?.icon} {tabInfo?.label}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">{DESC[tab]}</p>
                  </div>
                  <div className="flex gap-1.5 rounded-full border border-[#1e293b] bg-[#0b1220] p-1">
                    {COUNT_CHIPS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setChip(c)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                          chip === c ? "text-black" : "text-slate-400 hover:text-white"
                        }`}
                        style={chip === c ? { background: accent } : undefined}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {rows.length === 0 ? (
                  <div className="rounded-3xl border border-[#1e293b] bg-[#0b1220] py-20 text-center text-sm text-slate-500">
                    কোনো ডাটা পাওয়া যায়নি
                  </div>
                ) : (
                  <>
                    {/* Podium */}
                    <div className="grid grid-cols-3 items-end gap-5">
                      {podiumOrder.map((i) => {
                        const r = podium[i];
                        const m = medal[i];
                        const first = i === 0;
                        return (
                          <button
                            key={r.player.name + i}
                            onClick={() => onSelect(r.player)}
                            className={`group relative overflow-hidden rounded-3xl border text-center transition duration-300 hover:-translate-y-1 ${
                              first ? "px-6 pb-8 pt-9" : "px-6 pb-6 pt-7"
                            }`}
                            style={{
                              borderColor: `${m}55`,
                              background: `linear-gradient(180deg, ${m}${first ? "26" : "16"}, #0b1220 70%)`,
                              boxShadow: first ? `0 0 50px ${m}18` : undefined,
                            }}
                          >
                            <span
                              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black text-black"
                              style={{ background: m }}
                            >
                              {i + 1}
                            </span>
                            <div className="flex justify-center">
                              <Avatar name={r.player.name} color={m} size={first ? 76 : 62} />
                            </div>
                            <p className={`mt-4 truncate font-black text-white ${first ? "text-xl" : "text-lg"}`}>{r.player.name}</p>
                            <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">@{r.player.nickName || "Player"}</p>
                            <p
                              className={`mt-4 font-black tabular-nums leading-none ${first ? "text-5xl" : "text-4xl"}`}
                              style={{ color: m }}
                            >
                              {typeof r.value === "number" ? r.value.toLocaleString() : r.value}
                            </p>
                            <p className="mt-1.5 text-xs font-semibold text-slate-400">{r.unit}</p>
                            <p className="mt-4 truncate rounded-xl bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-slate-300">
                              {r.badge}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Rest of the list */}
                    {rest.length > 0 && (
                      <div className="mt-6 overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220]">
                        <div className="grid grid-cols-[56px_1fr_220px_160px_110px] gap-4 border-b border-[#172033] px-5 py-3 text-xs font-bold text-slate-500">
                          <span>Rank</span>
                          <span>Player</span>
                          <span>Details</span>
                          <span>Info</span>
                          <span className="text-right">{MOBILE_CFG[tab]?.unit}</span>
                        </div>
                        <div className="max-h-[640px] divide-y divide-[#172033]/70 overflow-y-auto [scrollbar-width:thin]">
                          {rest.map((r, idx) => (
                            <button
                              key={r.player.name + idx}
                              onClick={() => onSelect(r.player)}
                              className="group grid w-full grid-cols-[56px_1fr_220px_160px_110px] items-center gap-4 px-5 py-3 text-left transition hover:bg-white/[0.04]"
                            >
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#16223b] text-xs font-black text-slate-400">
                                {idx + 4}
                              </span>
                              <span className="flex min-w-0 items-center gap-3">
                                <Avatar name={r.player.name} color={accent} size={34} />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-bold text-white">{r.player.name}</span>
                                  <span className="block truncate text-[11px] text-slate-500">@{r.player.nickName || "Player"}</span>
                                </span>
                              </span>
                              <span className="truncate text-xs text-slate-300">{r.badge}</span>
                              <span className="truncate text-xs text-slate-500">{r.meta}</span>
                              <span className="text-right text-lg font-black tabular-nums" style={{ color: accent }}>
                                {typeof r.value === "number" ? r.value.toLocaleString() : r.value}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   MAIN PAGE — ফোনে MobileRecords, পিসিতে DesktopRecords
   ===================================================================== */
export default function RecordsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlayers(data);
        } else if (data.players && Array.isArray(data.players)) {
          setPlayers(data.players);
        }
        if (data.tournaments && Array.isArray(data.tournaments)) {
          setTournamentsData(data.tournaments);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading records:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-[#f59e0b]/30 selection:text-white">
      {/* 📱 ফোন ভিউ (md এর নিচে) */}
      <div className="md:hidden">
        <MobileRecords players={players} loading={loading} onSelect={(p) => setSelectedPlayer(p)} />
      </div>

      {/* 🖥️ পিসি ভিউ (md এবং তার উপরে) */}
      <div className="hidden md:block">
        <DesktopRecords players={players} tournamentsData={tournamentsData} loading={loading} onSelect={(p) => setSelectedPlayer(p)} />
      </div>

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