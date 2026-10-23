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

export const calculateFclPoints = (p: Player): number => {
  if (!p) return 0;
  return Math.round(
    (p.runs || 0) * 1 +
      (p.sixes || 0) * 2 +
      (p.fours || 0) * 1 +
      (p.wickets || 0) * 20 +
      (p.matches || 0) * 2 +
      (p.champion || 0) * 100 +
      (p.runnersUp || 0) * 40 +
      ((p.mot || 0) + (p.cpot || 0)) * 60 +
      (p.highestRunScorer || 0) * 30 +
      (p.topWicketTaker || 0) * 30
  );
};

const motTotal = (p: Player) => (Number(p.mot) || 0) + (Number(p.cpot) || 0);

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
  { id: "maxwickets", label: "Highest Wickets", icon: "🔥" },
  { id: "tournaments", label: "Tournaments", icon: "🗓️" },
];

const TIERS = [
  { key: "Diamond", icon: "💎", title: "Diamond All-Rounder", range: "2500+ Runs • 150+ Wkts", test: (p: Player) => p.runs >= 2500 && p.wickets >= 150 },
  { key: "Gold", icon: "🥇", title: "Gold All-Rounder", range: "2000–2500 Runs • 100–150 Wkts", test: (p: Player) => p.runs >= 2000 && p.runs < 2500 && p.wickets >= 100 && p.wickets < 150 },
  { key: "Silver", icon: "🥈", title: "Silver All-Rounder", range: "1000–2000 Runs • 50–100 Wkts", test: (p: Player) => p.runs >= 1000 && p.runs < 2000 && p.wickets >= 50 && p.wickets < 100 },
  { key: "Bronze", icon: "🥉", title: "Bronze All-Rounder", range: "500–1000 Runs • 50–100 Wkts", test: (p: Player) => p.runs >= 500 && p.runs < 1000 && p.wickets >= 50 && p.wickets < 100 },
];

const COUNT_CHIPS = ["Top 5", "Top 10", "Top 20", "Top 50", "All"];
const CLUB_CHIPS = ["All", "Diamond", "Gold", "Silver", "Bronze"];

const SAFE_WK = (p: Player) => {
  if (p.wkAvg && p.wkAvg !== "0.00" && p.wkAvg !== "0") return p.wkAvg;
  if (p.matches > 0 && p.wickets > 0) return (p.wickets / p.matches).toFixed(2);
  return "0.00";
};

const MOBILE_CFG: Record<string, { v: (p: Player) => number; badge: (p: Player) => string; meta: (p: Player) => string; unit: string }> = {
  points: { v: (p) => calculateFclPoints(p), badge: (p) => `${p.runs} Runs • ${p.wickets} Wkts`, meta: (p) => `${p.matches} Matches`, unit: "Pts" },
  runs: { v: (p) => p.runs, badge: (p) => `Avg ${p.runAvg ?? "0.00"}`, meta: (p) => `${p.matches} Matches`, unit: "Runs" },
  wickets: { v: (p) => p.wickets, badge: (p) => `Wk Avg ${SAFE_WK(p)}`, meta: (p) => `${p.matches} Matches`, unit: "Wkts" },
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
  maxwickets: { v: (p) => p.maxWickets || 0, badge: () => "In A Tournament", meta: (p) => `${p.wickets} Career Wkts`, unit: "Wkts" },
  tournaments: { v: (p) => p.totalTournament || 0, badge: (p) => `${p.matches} Matches`, meta: (p) => `@${p.nickName || "Player"}`, unit: "Tours" },
};

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
  cpom: "কুল প্লেয়ার অফ দ্য ম্যাচ",
  innings: "সবচেয়ে বেশি ইনিংস",
  notout: "সবচেয়ে বেশি নট-আউট",
  maxruns: "এক টুর্নামেন্টে সর্বোচ্চ ব্যক্তিগত রান",
  maxwickets: "এক টুর্নামেন্টে সর্বোচ্চ ব্যক্তিগত উইকেট",
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

function Avatar({ player, size = 44 }: { player: Player; size?: number }) {
  const rawPhoto = player?.photo || player?.photoUrl;
  const photoPath = rawPhoto && rawPhoto !== "—" && rawPhoto !== ""
    ? (rawPhoto.startsWith("/") ? rawPhoto : `/players/${rawPhoto}`)
    : `/FCL Cricket Avatar Placeholder.jpg`;

  return (
    <div className="relative shrink-0 overflow-hidden rounded-full border border-[#1e293b] bg-[#0b1220]" style={{ width: size, height: size }}>
      <img src={photoPath} alt={player?.name || "Player"} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = `/FCL Cricket Avatar Placeholder.jpg`; }} />
    </div>
  );
}

/* ───────── MOBILE RECORDS ───────── */
function MobileRecords({ players, tournamentsData, loading, onSelect }: { players: Player[]; tournamentsData: TournamentRecord[]; loading: boolean; onSelect: (p: Player) => void }) {
  const [tab, setTab] = useState<MTabId>("records");
  const [chip, setChip] = useState("Top 10");
  const [expanded, setExpanded] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const changeTab = (id: MTabId) => {
    setTab(id);
    setChip(id === "clubs" ? "All" : "Top 10");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chips = tab === "records" ? [] : tab === "clubs" ? CLUB_CHIPS : COUNT_CHIPS;
  const tabInfo = MOBILE_TABS.find((t) => t.id === tab);

  const tournamentHistory = useMemo(() => {
    if (!tournamentsData || tournamentsData.length === 0) return [];
    const map = new Map<string, { 
      tournament: string; 
      time?: string; 
      championTeam?: string; 
      championPlayers: string[]; 
      runnerUpTeam?: string; 
      runnerUpPlayers: string[]; 
      topScorer?: string; 
      topWicket?: string;
      motPlayer?: string;
      cpotPlayer?: string;
      allPlayersCount: Set<string>;
    }>();

    tournamentsData.forEach((t) => {
      const name = t.tournament || "Tournament";
      if (!map.has(name)) {
        map.set(name, { 
          tournament: name, 
          time: t.time || "", 
          championPlayers: [],
          runnerUpPlayers: [],
          allPlayersCount: new Set<string>() 
        });
      }
      const item = map.get(name)!;
      if (t.playerName) item.allPlayersCount.add(t.playerName);

      const cr = (t.chamRu || "").toUpperCase();
      if (cr.includes("CHAM") || cr.includes("WIN") || cr.includes("CHAMPION")) {
        item.championTeam = t.team || "Champion Team";
        if (t.playerName && !item.championPlayers.includes(t.playerName)) {
          item.championPlayers.push(t.playerName);
        }
      } else if (cr.includes("RU") || cr.includes("RUNNER")) {
        item.runnerUpTeam = t.team || "Runner-Up Team";
        if (t.playerName && !item.runnerUpPlayers.includes(t.playerName)) {
          item.runnerUpPlayers.push(t.playerName);
        }
      } else {
        if (t.team && !item.championTeam) item.championTeam = t.team;
      }

      if (Number(t.topScorer) === 1) item.topScorer = t.playerName;
      if (Number(t.topWicket) === 1) item.topWicket = t.playerName;
      
      const motCpotStr = (t.motCpot || "").toUpperCase();
      if (motCpotStr.includes("MOT") || Number(t.mom) > 0) item.motPlayer = t.playerName;
      if (motCpotStr.includes("CPOT") || Number(t.cpom) > 0) item.cpotPlayer = t.playerName;
    });

    return Array.from(map.values()).map(item => ({
      ...item,
      totalPlayersCount: item.allPlayersCount.size
    }));
  }, [tournamentsData]);

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
      { id: "maxwickets", label: "Highest Wicket", icon: "🔥", fn: (p: Player) => p.maxWickets || 0, unit: "Wickets" },
      { id: "tournaments", label: "Tournaments", icon: "🗓️", fn: (p: Player) => p.totalTournament || 0, unit: "Tours" },
    ];
    return defs.map((d) => ({ ...d, player: top(d.fn), value: top(d.fn) ? d.fn(top(d.fn)) : 0 })).filter((d) => d.player);
  }, [players]);

  const rows = useMemo(() => {
    const by = (fn: (p: Player) => number) => [...players].sort((a, b) => fn(b) - fn(a));
    if (tab === "tournaments_history") return [];
    if (tab === "clubs") {
      const out: any[] = [];
      TIERS.filter((t) => chip === "All" || chip === t.key).forEach((t) => {
        players.filter(t.test).forEach((p, i) => out.push({ key: t.key + p.name + i, player: p, tierKey: t.key, badge: `${t.icon} ${t.title}`, meta: `${p.matches} Matches`, value: `${p.runs}R | ${p.wickets}W`, unit: "" }));
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
      .map((p, i) => ({ key: (p.id ?? p.name) + "-" + i, player: p, badge: c.badge(p), meta: c.meta(p), value: c.v(p), unit: c.unit }));
  }, [players, tab, chip, query]);

  return (
    <div className="min-h-screen bg-[#020617] pb-28 text-white selection:bg-amber-500/30 selection:text-white">
      <header className="sticky top-0 z-30 bg-[#020617]/95 px-4 pb-2 pt-4 backdrop-blur border-b border-[#1e293b]/50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-300">‹</Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black tracking-tight truncate">FCL Record Corner</h1>
            <p className="text-[10px] text-slate-400 truncate">{tab === "tournaments_history" ? "Tournament History" : tabInfo?.label || "Hall of Fame"}</p>
          </div>
          <Link href="/rankings" className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-black text-black">Rankings</Link>
          <button onClick={() => setShowSearch((s) => !s)} aria-label="Search" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1e293b] bg-[#0b1220]">🔍</button>
        </div>
        {showSearch && (
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search player..." className="mt-3 w-full rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500" />
        )}
      </header>

      {/* Mobile Category Grid / Selector */}
      <div className="mx-3 mt-3 rounded-3xl bg-[#0a1324] p-3 border border-[#1e293b]">
        <button
          onClick={() => changeTab("tournaments_history")}
          className={`mb-2.5 flex w-full items-center justify-center gap-2 rounded-2xl p-2.5 text-xs font-black transition ${
            tab === "tournaments_history" ? "bg-amber-500 text-black shadow-lg" : "bg-[#0f1b33] text-amber-400 border border-amber-500/30"
          }`}
        >
          <span>🏆</span> <span>Tournament History Archive</span>
        </button>

        <div className="grid grid-cols-4 gap-2">
          {(expanded ? MOBILE_TABS : MOBILE_TABS.slice(0, 8)).map((t) => (
            <button
              key={t.id}
              onClick={() => changeTab(t.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl p-2 text-center transition ${
                tab === t.id ? "bg-amber-500 text-black font-black shadow-lg" : "bg-[#0f1b33] text-slate-300 font-bold text-xs"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-[10px] truncate w-full">{t.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setExpanded((e) => !e)} className="mx-auto mt-3 block text-xs font-black text-sky-400">
          {expanded ? "Show Less ⌃" : "More Categories ⌄"}
        </button>
      </div>

      {chips.length > 0 && tab !== "clubs" && tab !== "tournaments_history" && (
        <div className="mx-3 mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {chips.map((c) => (
            <button key={c} onClick={() => setChip(c)} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${chip === c ? "bg-emerald-500 text-white" : "border border-[#1e293b] bg-[#0b1220] text-slate-300"}`}>
              {c}
            </button>
          ))}
        </div>
      )}

      <main className="px-3 pt-4">
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-amber-400 animate-pulse">Loading FCL Records...</div>
        ) : tab === "tournaments_history" ? (
          <div className="space-y-4">
            <h2 className="text-sm font-black text-amber-400 px-1">🏆 Tournament History Archive</h2>
            <p className="text-xs text-slate-400 px-1">প্রতিটি টুর্নামেন্টের সময়কাল, মোট অংশগ্রহণকারী খেলোয়াড়, চ্যাম্পিয়ন ও রানার্স-আপ স্কোয়াড এবং সেরা পারফর্মারদের ইতিহাস।</p>
            <div className="space-y-4">
              {tournamentHistory.map((item, i) => (
                <div key={i} className="rounded-3xl border border-[#1e293b] bg-gradient-to-br from-[#0b1220] via-[#080e1a] to-[#04070b] p-4 shadow-xl space-y-4">
                  <div className="flex items-start justify-between border-b border-[#1e293b] pb-3">
                    <div>
                      <h3 className="text-base font-black text-amber-400">🏟️ {item.tournament}</h3>
                      {item.time && <p className="mt-0.5 text-[11px] font-bold text-sky-400">📅 সময়কাল: {item.time}</p>}
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-black text-emerald-400">
                      👥 {item.totalPlayersCount}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-amber-400">🏆 Champion Team</span>
                      <span className="text-[11px] font-bold text-slate-300">{item.championTeam || "—"}</span>
                    </div>
                    <div className="pt-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Full Squad:</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-white leading-relaxed">
                        {item.championPlayers.length > 0 ? item.championPlayers.join(", ") : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-500/30 bg-slate-500/5 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-300">🥈 Runner-Up Team</span>
                      <span className="text-[11px] font-bold text-slate-400">{item.runnerUpTeam || "—"}</span>
                    </div>
                    <div className="pt-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Full Squad:</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-white leading-relaxed">
                        {item.runnerUpPlayers.length > 0 ? item.runnerUpPlayers.join(", ") : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-black/40 p-2.5 border border-[#1e293b]">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">🏏 Top Scorer</p>
                      <p className="mt-1 font-black text-emerald-400 truncate">{item.topScorer || "—"}</p>
                    </div>
                    <div className="rounded-xl bg-black/40 p-2.5 border border-[#1e293b]">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">🎯 Top Wicket</p>
                      <p className="mt-1 font-black text-amber-400 truncate">{item.topWicket || "—"}</p>
                    </div>
                    <div className="rounded-xl bg-black/40 p-2.5 border border-[#1e293b]">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">⭐ MOT</p>
                      <p className="mt-1 font-black text-purple-400 truncate">{item.motPlayer || "—"}</p>
                    </div>
                    <div className="rounded-xl bg-black/40 p-2.5 border border-[#1e293b]">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">🏅 CPOT</p>
                      <p className="mt-1 font-black text-sky-400 truncate">{item.cpotPlayer || "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : tab === "records" ? (
          <div className="space-y-3">
            <h2 className="text-sm font-black text-amber-400 px-1">⭐ Hall of Fame — Top Record Holders</h2>
            {holders.map((h, i) => (
              <button key={h.id} onClick={() => onSelect(h.player)} className="flex w-full items-center gap-3 rounded-2xl border border-[#1e293b] bg-[#0b1220] p-3 text-left transition active:scale-[0.98]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-xs font-black text-amber-400">{i + 1}</span>
                <Avatar player={h.player} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400">{h.icon} {h.label}</p>
                  <p className="text-sm font-black text-white truncate">{h.player.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-amber-400">{Number(h.value).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">{h.unit}</p>
                </div>
              </button>
            ))}
          </div>
        ) : tab === "clubs" ? (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CLUB_CHIPS.map((c) => (
                <button key={c} onClick={() => setChip(c)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${chip === c ? "bg-purple-500 text-black" : "border border-[#1e293b] bg-[#0b1220] text-slate-300"}`}>
                  {c}
                </button>
              ))}
            </div>
            {TIERS.filter((t) => chip === "All" || chip === t.key).map((t) => {
              const c = TIER_COLOR[t.key];
              const list = players.filter(t.test);
              return (
                <div key={t.key} className="rounded-3xl border bg-[#0b1220] p-4 shadow-xl" style={{ borderColor: `${c}40` }}>
                  <div className="flex items-start justify-between border-b border-[#1e293b] pb-2.5">
                    <div>
                      <h3 className="text-sm font-black" style={{ color: c }}>{t.icon} {t.title}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-400">{t.range}</p>
                    </div>
                    <span className="text-xs font-bold rounded-full border px-2 py-0.5" style={{ borderColor: `${c}60`, color: c }}>{list.length}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {list.map((p, idx) => (
                      <button key={idx} onClick={() => onSelect(p)} className="flex w-full items-center justify-between rounded-2xl bg-white/[0.03] p-2.5 text-left transition hover:bg-white/[0.06]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar player={p} size={36} />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black text-white">{p.name}</p>
                            <p className="text-[10px] text-slate-400">@{p.nickName || "Player"} • {p.matches} Matches</p>
                          </div>
                        </div>
                        <div className="text-right text-xs font-black shrink-0">
                          <span className="text-[#22c55e]">{p.runs}R</span>
                          <span className="text-slate-500 mx-1">|</span>
                          <span className="text-[#fbbf24]">{p.wickets}W</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="px-1 text-xs font-bold text-slate-400">{tabInfo?.icon} {tabInfo?.label}</p>
            {rows.map((r: any, idx: number) => (
              <button key={r.key} onClick={() => onSelect(r.player)} className="flex w-full items-center gap-3 rounded-2xl border border-[#1e293b] bg-[#0b1220] p-3 text-left">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${idx === 0 ? "bg-amber-500 text-black" : "bg-[#16223b] text-slate-400"}`}>{idx + 1}</span>
                <Avatar player={r.player} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-white truncate">{r.player.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">@{r.player.nickName || "Player"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-amber-400">{typeof r.value === "number" ? r.value.toLocaleString() : r.value}</p>
                  <p className="text-[9px] text-slate-500">{r.unit}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-3 left-3 right-3 z-40 md:hidden">
        <div className="flex items-center justify-between rounded-3xl border border-[#1e293b] bg-[#0b1220]/95 px-5 py-2 shadow-2xl backdrop-blur">
          <Link href="/" className="flex flex-col items-center text-[10px] font-semibold text-slate-400"><span>🏠</span>Home</Link>
          <button onClick={() => changeTab("records")} className="flex flex-col items-center rounded-2xl bg-amber-500/15 px-3 py-1 text-[10px] font-black text-amber-400"><span>🌟</span>Records</button>
          <Link href="/rankings" className="flex flex-col items-center text-[10px] font-semibold text-slate-400"><span>🚀</span>Rankings</Link>
          <button onClick={() => changeTab("clubs")} className="flex flex-col items-center text-[10px] font-semibold text-slate-400"><span>💎</span>Clubs</button>
        </div>
      </nav>
    </div>
  );
}

/* ───────── DESKTOP RECORDS ───────── */
function DesktopRecords({ players, tournamentsData, loading, onSelect }: { players: Player[]; tournamentsData: TournamentRecord[]; loading: boolean; onSelect: (p: Player) => void }) {
  const [tab, setTab] = useState("records");
  const [chip, setChip] = useState("Top 10");
  const [query, setQuery] = useState("");

  const tabInfo = MOBILE_TABS.find((t) => t.id === tab);
  const accent = ACCENT[tab] || "#f59e0b";

  const changeTab = (id: string) => {
    setTab(id);
    setChip(id === "clubs" ? "All" : "Top 10");
  };

  const totalTournamentsCount = useMemo(() => {
    if (!tournamentsData || tournamentsData.length === 0) return 0;
    return new Set(tournamentsData.map((t) => (t.tournament || "").trim().toLowerCase())).size;
  }, [tournamentsData]);

  const totals = useMemo(() => ({
    runs: players.reduce((s, p) => s + (Number(p.runs) || 0), 0),
    wickets: players.reduce((s, p) => s + (Number(p.wickets) || 0), 0),
    tournaments: totalTournamentsCount,
  }), [players, totalTournamentsCount]);

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
      { id: "maxwickets", label: "Highest Wicket", icon: "🔥", fn: (p: Player) => p.maxWickets || 0, unit: "Wickets" },
      { id: "tournaments", label: "Tournaments", icon: "🗓️", fn: (p: Player) => p.totalTournament || 0, unit: "Tours" },
    ];
    return defs.map((d) => ({ ...d, player: top(d.fn), value: top(d.fn) ? d.fn(top(d.fn)) : 0 })).filter((d) => d.player);
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

  const tournamentHistory = useMemo(() => {
    if (!tournamentsData || tournamentsData.length === 0) return [];
    const map = new Map<string, { 
      tournament: string; 
      time?: string; 
      championTeam?: string; 
      championPlayers: string[]; 
      runnerUpTeam?: string; 
      runnerUpPlayers: string[]; 
      topScorer?: string; 
      topWicket?: string;
      motPlayer?: string;
      cpotPlayer?: string;
      allPlayersCount: Set<string>;
    }>();

    tournamentsData.forEach((t) => {
      const name = t.tournament || "Tournament";
      if (!map.has(name)) {
        map.set(name, { 
          tournament: name, 
          time: t.time || "", 
          championPlayers: [],
          runnerUpPlayers: [],
          allPlayersCount: new Set<string>() 
        });
      }
      const item = map.get(name)!;
      if (t.playerName) item.allPlayersCount.add(t.playerName);

      const cr = (t.chamRu || "").toUpperCase();
      if (cr.includes("CHAM") || cr.includes("WIN") || cr.includes("CHAMPION")) {
        item.championTeam = t.team || "Champion Team";
        if (t.playerName && !item.championPlayers.includes(t.playerName)) {
          item.championPlayers.push(t.playerName);
        }
      } else if (cr.includes("RU") || cr.includes("RUNNER")) {
        item.runnerUpTeam = t.team || "Runner-Up Team";
        if (t.playerName && !item.runnerUpPlayers.includes(t.playerName)) {
          item.runnerUpPlayers.push(t.playerName);
        }
      } else {
        if (t.team && !item.championTeam) item.championTeam = t.team;
      }

      if (Number(t.topScorer) === 1) item.topScorer = t.playerName;
      if (Number(t.topWicket) === 1) item.topWicket = t.playerName;
      
      const motCpotStr = (t.motCpot || "").toUpperCase();
      if (motCpotStr.includes("MOT") || Number(t.mom) > 0) item.motPlayer = t.playerName;
      if (motCpotStr.includes("CPOT") || Number(t.cpom) > 0) item.cpotPlayer = t.playerName;
    });

    return Array.from(map.values()).map(item => ({
      ...item,
      totalPlayersCount: item.allPlayersCount.size
    }));
  }, [tournamentsData]);

  return (
    <div className="relative min-h-screen bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.10),transparent_60%)]" />

      <div className="relative mx-auto max-w-[1400px] px-8 pb-20 pt-8">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] bg-[#0b1220] text-xl text-slate-300 transition hover:border-amber-500/50 hover:text-white">‹</Link>
            <div>
              <h1 className="text-4xl font-black tracking-tight">FCL Record Corner</h1>
              <p className="mt-1 text-sm text-slate-400">সর্বকালের রেকর্ড, ক্যাটাগরি ধরে ধরে। যেকোনো নামে ক্লিক করলে প্লেয়ার কার্ড খুলবে।</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search player..." className="w-72 rounded-full border border-[#1e293b] bg-[#0b1220] py-2.5 pl-11 pr-4 text-sm text-white outline-none focus:border-amber-500" />
            <Link href="/rankings" className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-black text-black shadow-lg shadow-amber-500/20 hover:bg-amber-400">Complete Leaderboard</Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-4 overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220]/70 backdrop-blur">
          {[
            { label: "Players", value: players.length, color: "#f59e0b" },
            { label: "Career Runs", value: totals.runs, color: "#60a5fa" },
            { label: "Career Wickets", value: totals.wickets, color: "#fb7185" },
            { label: "Total Tournaments", value: totals.tournaments, color: "#34d399" },
          ].map((s, i) => (
            <div key={s.label} className={`px-8 py-5 ${i > 0 ? "border-l border-[#1e293b]" : ""}`}>
              <p className="text-3xl font-black tabular-nums" style={{ color: s.color }}>{loading ? "—" : s.value.toLocaleString()}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-[270px_1fr] gap-8">
          <aside className="self-start">
            <nav className="sticky top-6 max-h-[calc(100vh-3rem)] space-y-5 overflow-y-auto rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-4 [scrollbar-width:thin]">
              <button onClick={() => setTab("tournaments_history")} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition ${tab === "tournaments_history" ? "bg-amber-500 text-black" : "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"}`}>
                <span>🏆</span> <span>Tournament History</span>
              </button>
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
                        <button key={id} onClick={() => changeTab(id)} className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${active ? "bg-white/[0.06] text-white" : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"}`}>
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

          <section className="min-w-0">
            {loading ? (
              <div className="flex h-96 items-center justify-center text-sm font-semibold text-amber-400 animate-pulse">Loading Records...</div>
            ) : tab === "tournaments_history" ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-black">🏆 Tournament History Archive</h2>
                <p className="text-sm text-slate-400">প্রতিটি টুর্নামেন্টের সময়কাল, মোট অংশগ্রহণকারী খেলোয়াড়, চ্যাম্পিয়ন ও রানার্স-আপ স্কোয়াড এবং সেরা পারফর্মারদের ইতিহাস।</p>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {tournamentHistory.map((item, i) => (
                    <div key={i} className="rounded-3xl border border-[#1e293b] bg-gradient-to-br from-[#0b1220] via-[#080e1a] to-[#04070b] p-6 shadow-xl space-y-5">
                      <div className="flex items-start justify-between border-b border-[#1e293b] pb-4">
                        <div>
                          <h3 className="text-xl font-black text-amber-400">🏟️ {item.tournament}</h3>
                          {item.time && <p className="mt-1 text-xs font-bold text-sky-400">📅 সময়কাল: {item.time}</p>}
                        </div>
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-400">
                          👥 {item.totalPlayersCount} Players
                        </span>
                      </div>

                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-400">🏆 Champion Team</span>
                          <span className="text-xs font-bold text-slate-300">{item.championTeam || "—"}</span>
                        </div>
                        <div className="pt-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Squad:</p>
                          <p className="mt-1 text-xs font-semibold text-white leading-relaxed">
                            {item.championPlayers.length > 0 ? item.championPlayers.join(", ") : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-500/30 bg-slate-500/5 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-300">🥈 Runner-Up Team</span>
                          <span className="text-xs font-bold text-slate-400">{item.runnerUpTeam || "—"}</span>
                        </div>
                        <div className="pt-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Squad:</p>
                          <p className="mt-1 text-xs font-semibold text-white leading-relaxed">
                            {item.runnerUpPlayers.length > 0 ? item.runnerUpPlayers.join(", ") : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="rounded-xl bg-black/40 p-3 border border-[#1e293b]">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">🏏 Top Scorer</p>
                          <p className="mt-1 font-black text-emerald-400 truncate">{item.topScorer || "—"}</p>
                        </div>
                        <div className="rounded-xl bg-black/40 p-3 border border-[#1e293b]">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">🎯 Top Wicket</p>
                          <p className="mt-1 font-black text-amber-400 truncate">{item.topWicket || "—"}</p>
                        </div>
                        <div className="rounded-xl bg-black/40 p-3 border border-[#1e293b]">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">⭐ MOT</p>
                          <p className="mt-1 font-black text-purple-400 truncate">{item.motPlayer || "—"}</p>
                        </div>
                        <div className="rounded-xl bg-black/40 p-3 border border-[#1e293b]">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">🏅 CPOT</p>
                          <p className="mt-1 font-black text-sky-400 truncate">{item.cpotPlayer || "—"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : tab === "records" ? (
              <div>
                <div className="mb-5"><h2 className="text-2xl font-black">Hall of Fame</h2><p className="mt-1 text-sm text-slate-400">{DESC.records}</p></div>
                <div className="grid grid-cols-3 gap-5">
                  {featured.map((h) => {
                    const c = ACCENT[h.id];
                    return (
                      <button key={h.id} onClick={() => onSelect(h.player)} className="group relative overflow-hidden rounded-3xl border p-6 text-left transition hover:-translate-y-1" style={{ borderColor: `${c}45`, background: `linear-gradient(160deg, ${c}22, #0b1220 55%, #050914)` }}>
                        <span className="pointer-events-none absolute -right-4 -top-6 select-none text-[110px] opacity-[0.07]">{h.icon}</span>
                        <p className="text-sm font-bold" style={{ color: c }}>{h.icon} {h.label}</p>
                        <p className="mt-5 text-6xl font-black tabular-nums leading-none" style={{ color: c }}>{Number(h.value).toLocaleString()}</p>
                        <p className="mt-1.5 text-xs font-semibold text-slate-400">{h.unit}</p>
                        <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                          <Avatar player={h.player} size={42} />
                          <div className="min-w-0 flex-1"><p className="text-sm font-black text-white truncate">{h.player.name}</p><p className="text-xs text-slate-400 truncate">@{h.player.nickName || "Player"}</p></div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-4 xl:grid-cols-4">
                  {others.map((h) => {
                    const c = ACCENT[h.id] || "#f59e0b";
                    return (
                      <button key={h.id} onClick={() => onSelect(h.player)} className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-4 text-left transition hover:-translate-y-0.5 hover:bg-[#0f192c]">
                        <p className="text-xs font-bold text-slate-400">{h.icon} {h.label}</p>
                        <p className="mt-3 text-3xl font-black tabular-nums leading-none" style={{ color: c }}>{Number(h.value).toLocaleString()}</p>
                        <div className="mt-3 flex items-center gap-2.5 border-t border-[#172033] pt-3">
                          <Avatar player={h.player} size={30} />
                          <p className="text-xs font-bold text-white truncate">{h.player.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : tab === "clubs" ? (
              <div>
                <div className="mb-5"><h2 className="text-2xl font-black">💎 Elite Milestone Clubs</h2><p className="mt-1 text-sm text-slate-400">{DESC.clubs}</p></div>
                <div className="mb-6 flex gap-2">{CLUB_CHIPS.map((c) => (<button key={c} onClick={() => setChip(c)} className={`rounded-full px-5 py-2 text-sm font-bold ${chip === c ? "bg-purple-500 text-black" : "border border-[#1e293b] bg-[#0b1220] text-slate-300"}`}>{c}</button>))}</div>
                <div className="grid grid-cols-2 gap-5">
                  {TIERS.filter((t) => chip === "All" || chip === t.key).map((t) => {
                    const c = TIER_COLOR[t.key];
                    const list = players.filter(t.test);
                    return (
                      <div key={t.key} className="overflow-hidden rounded-3xl border" style={{ borderColor: `${c}40`, background: `linear-gradient(170deg, ${c}18, #0b1220 45%)` }}>
                        <div className="flex items-center justify-between p-5 pb-4">
                          <div><p className="text-lg font-black" style={{ color: c }}>{t.icon} {t.title}</p><p className="mt-0.5 text-xs text-slate-400">{t.range}</p></div>
                          <span className="rounded-full border px-3 py-1 text-sm font-black" style={{ borderColor: `${c}60`, color: c }}>{list.length}</span>
                        </div>
                        <div className="max-h-[360px] space-y-1 overflow-y-auto px-3 pb-3 [scrollbar-width:thin]">
                          {list.map((p, i) => (
                            <button key={i} onClick={() => onSelect(p)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-white/[0.05]">
                              <Avatar player={p} size={36} />
                              <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-white">{p.name}</p><p className="truncate text-[11px] text-slate-400">@{p.nickName || "Player"} • {p.matches} Matches</p></div>
                              <div className="text-right text-xs font-black"><span className="text-emerald-400">{p.runs}R</span> | <span className="text-amber-400">{p.wickets}W</span></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div><h2 className="text-2xl font-black">{tabInfo?.icon} {tabInfo?.label}</h2><p className="mt-1 text-sm text-slate-400">{DESC[tab]}</p></div>
                  <div className="flex gap-1.5 rounded-full border border-[#1e293b] bg-[#0b1220] p-1">
                    {COUNT_CHIPS.map((c) => (<button key={c} onClick={() => setChip(c)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${chip === c ? "text-black" : "text-slate-400 hover:text-white"}`} style={chip === c ? { background: accent } : undefined}>{c}</button>))}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-end gap-5">
                  {podiumOrder.map((i) => {
                    const r = podium[i];
                    if (!r) return null;
                    const m = medal[i];
                    const first = i === 0;
                    return (
                      <button key={i} onClick={() => onSelect(r.player)} className={`group relative overflow-hidden rounded-3xl border text-center transition duration-300 hover:-translate-y-1 ${first ? "px-6 pb-8 pt-9" : "px-6 pb-6 pt-7"}`} style={{ borderColor: `${m}55`, background: `linear-gradient(180deg, ${m}${first ? "26" : "16"}, #0b1220 70%)` }}>
                        <span className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black text-black" style={{ background: m }}>{i + 1}</span>
                        <div className="flex justify-center"><Avatar player={r.player} size={first ? 76 : 62} /></div>
                        <p className={`mt-4 truncate font-black text-white ${first ? "text-xl" : "text-lg"}`}>{r.player.name}</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">@{r.player.nickName || "Player"}</p>
                        <p className={`mt-4 font-black tabular-nums leading-none ${first ? "text-5xl" : "text-4xl"}`} style={{ color: m }}>{typeof r.value === "number" ? r.value.toLocaleString() : r.value}</p>
                        <p className="mt-1.5 text-xs font-semibold text-slate-400">{r.unit}</p>
                      </button>
                    );
                  })}
                </div>

                {rest.length > 0 && (
                  <div className="mt-6 overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220]">
                    <div className="grid grid-cols-[56px_1fr_220px_160px_110px] gap-4 border-b border-[#172033] px-5 py-3 text-xs font-bold text-slate-500">
                      <span>Rank</span><span>Player</span><span>Details</span><span>Info</span><span className="text-right">{MOBILE_CFG[tab]?.unit}</span>
                    </div>
                    <div className="max-h-[640px] divide-y divide-[#172033]/70 overflow-y-auto [scrollbar-width:thin]">
                      {rest.map((r, idx) => (
                        <button key={idx} onClick={() => onSelect(r.player)} className="group grid w-full grid-cols-[56px_1fr_220px_160px_110px] items-center gap-4 px-5 py-3 text-left transition hover:bg-white/[0.04]">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#16223b] text-xs font-black text-slate-400">{idx + 4}</span>
                          <span className="flex min-w-0 items-center gap-3"><Avatar player={r.player} size={34} /><span className="min-w-0"><span className="block truncate text-sm font-bold text-white">{r.player.name}</span><span className="block truncate text-[11px] text-slate-500">@{r.player.nickName || "Player"}</span></span></span>
                          <span className="truncate text-xs text-slate-300">{r.badge}</span>
                          <span className="truncate text-xs text-slate-500">{r.meta}</span>
                          <span className="text-right text-lg font-black tabular-nums" style={{ color: accent }}>{typeof r.value === "number" ? r.value.toLocaleString() : r.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function RecordsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPlayers(data);
        else if (data.players && Array.isArray(data.players)) setPlayers(data.players);
        if (data.tournaments && Array.isArray(data.tournaments)) setTournamentsData(data.tournaments);
        setLoading(false);
      })
      .catch((err) => { console.error("Error loading records:", err); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-amber-500/30 selection:text-white">
      <div className="md:hidden">
        <MobileRecords players={players} tournamentsData={tournamentsData} loading={loading} onSelect={(p) => setSelectedPlayer(p)} />
      </div>
      <div className="hidden md:block">
        <DesktopRecords players={players} tournamentsData={tournamentsData} loading={loading} onSelect={(p) => setSelectedPlayer(p)} />
      </div>
      <PlayerCardModal selectedPlayer={selectedPlayer} onClose={() => setSelectedPlayer(null)} tournamentsData={tournamentsData || []} allPlayers={players || []} />
    </div>
  );
}