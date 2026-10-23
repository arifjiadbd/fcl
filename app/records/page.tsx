"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Link from "next/link";
import PlayerCardModal from "../../components/PlayerCardModal";

/* ═════════════════════════ TYPES ═════════════════════════ */

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

type TeamCounts = Map<string, number>;

/* ═════════════════════════ SHARED HELPERS ═════════════════════════ */

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

const nameKey = (s?: string) => (s || "").trim().toLowerCase();

const matchPlayer = (p: Player, q: string) =>
  !q || p.name.toLowerCase().includes(q) || (p.nickName || "").toLowerCase().includes(q);

function filterHolders<T extends { player: Player; label: string }>(list: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((h) => matchPlayer(h.player, q) || h.label.toLowerCase().includes(q));
}

function buildTeammateCounts(data: TournamentRecord[]): TeamCounts {
  const out: TeamCounts = new Map();
  if (!data || data.length === 0) return out;

  const squads = new Map<string, Set<string>>();
  const playerSquads = new Map<string, Set<string>>();

  for (const r of data) {
    const tour = (r.tournament || "").trim();
    const team = (r.team || "").trim();
    const name = nameKey(r.playerName);
    if (!tour || !team || !name) continue;
    const key = `${tour}__${team}`;

    let sq = squads.get(key);
    if (!sq) { sq = new Set(); squads.set(key, sq); }
    sq.add(name);

    let ps = playerSquads.get(name);
    if (!ps) { ps = new Set(); playerSquads.set(name, ps); }
    ps.add(key);
  }

  playerSquads.forEach((keys, name) => {
    const mates = new Set<string>();
    keys.forEach((k) => {
      squads.get(k)!.forEach((m) => { if (m !== name) mates.add(m); });
    });
    out.set(name, mates.size);
  });

  return out;
}

const teammateCountOf = (p: Player, tm: TeamCounts) => tm.get(nameKey(p.name)) || 0;

type MTabId = string;

const MOBILE_TABS: { id: MTabId; label: string; icon: string }[] = [
  { id: "tournaments_history", label: "Tournament History", icon: "🏆" },
  { id: "teammates_record", label: "Teammates", icon: "🤝" },
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
  { id: "innings", label: "Most Innings", icon: "📋" },
  { id: "notout", label: "Most Not Outs", icon: "🧱" },
  { id: "maxruns", label: "Highest Tour. Runs", icon: "🚀" },
  { id: "maxwickets", label: "Highest Wickets", icon: "🔥" },
  { id: "tournaments", label: "Tournaments", icon: "🗓️" },
];

const TIERS = [
  { key: "Diamond", icon: "💎", title: "Diamond All-Rounder", range: "2500+ Runs • 150+ Wkts", test: (p: Player) => p.runs >= 2500 && p.wickets >= 150 },
  { key: "Gold", icon: "🥇", title: "Gold All-Rounder", range: "2000–2500 Runs • 100+ Wkts", test: (p: Player) => p.runs >= 2000 && p.runs < 2500 && p.wickets >= 100 },
  { key: "Silver", icon: "🥈", title: "Silver All-Rounder", range: "1000–2000 Runs • 50+ Wkts", test: (p: Player) => p.runs >= 1000 && p.runs < 2000 && p.wickets >= 50 },
  { key: "Bronze", icon: "🥉", title: "Bronze All-Rounder", range: "500–1000 Runs • 50+ Wkts", test: (p: Player) => p.runs >= 500 && p.runs < 1000 && p.wickets >= 50 },
];

const COUNT_CHIPS = ["Top 5", "Top 10", "Top 20", "Top 50", "All"];
const CLUB_CHIPS = ["All", "Diamond", "Gold", "Silver", "Bronze"];

const SEARCH_PLACEHOLDER = "প্লেয়ার, টিম বা টুর্নামেন্টের নাম লিখুন...";

const SAFE_WK = (p: Player) => {
  if (p.wkAvg && p.wkAvg !== "0.00" && p.wkAvg !== "0") return p.wkAvg;
  if (p.matches > 0 && p.wickets > 0) return (p.wickets / p.matches).toFixed(2);
  return "0.00";
};

const MOBILE_CFG: Record<string, { v: (p: Player, tm: TeamCounts) => number; badge: (p: Player) => string; meta: (p: Player) => string; unit: string }> = {
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
  innings: { v: (p) => p.innings || 0, badge: (p) => `${p.runs} Runs`, meta: (p) => `${p.matches} Matches`, unit: "Inn" },
  notout: { v: (p) => p.notOut || 0, badge: (p) => `${p.innings ?? 0} Innings`, meta: (p) => `${p.runs} Runs`, unit: "NO" },
  maxruns: { v: (p) => p.maxRuns || 0, badge: () => "Best Batting Score", meta: (p) => `${p.runs} Career Runs`, unit: "Runs" },
  maxwickets: { v: (p) => p.maxWickets || 0, badge: () => "In A Tournament", meta: (p) => `${p.wickets} Career Wkts`, unit: "Wkts" },
  tournaments: { v: (p) => p.totalTournament || 0, badge: (p) => `${p.matches} Matches`, meta: (p) => `@${p.nickName || "Player"}`, unit: "Tours" },
  teammates_record: { v: (p, tm) => teammateCountOf(p, tm), badge: (p) => `${p.matches} Matches`, meta: (p) => `@${p.nickName || "Player"}`, unit: "Players" },
};

// ✅ আগে সবাইকে র‍্যাংক করা হয়, তারপর সার্চ ফিল্টার — ফলে প্লেয়ারের আসল র‍্যাংক দেখায়
function rankPlayers(
  players: Player[],
  getV: (p: Player) => number,
  q: string,
  limit: number
): { player: Player; value: number; rank: number }[] {
  const all: { player: Player; value: number }[] = [];
  for (const p of players) {
    const value = getV(p);
    if (value <= 0) continue;
    all.push({ player: p, value });
  }
  all.sort((a, b) => b.value - a.value);

  // আসল র‍্যাংক (সমান ভ্যালুতে সমান র‍্যাংক)
  const ranked: { player: Player; value: number; rank: number }[] = [];
  all.forEach((r, i) => {
    const rank = i > 0 && r.value === all[i - 1].value ? ranked[i - 1].rank : i + 1;
    ranked.push({ ...r, rank });
  });

  // সার্চ থাকলে লিমিট ছাড়াই শুধু ঐ প্লেয়ারকে আসল র‍্যাংকসহ দেখাবে
  if (q) return ranked.filter((r) => matchPlayer(r.player, q));
  return limit === Infinity ? ranked : ranked.slice(0, limit);
}

const GROUPS: { title: string; ids: string[] }[] = [
  { title: "Overview", ids: ["tournaments_history", "teammates_record", "records", "clubs"] },
  { title: "Batting", ids: ["runs", "sixes", "fours", "maxruns", "innings", "notout"] },
  { title: "Bowling", ids: ["wickets", "hattricks", "maxwickets"] },
  { title: "Trophies & Honours", ids: ["champions", "runnersup", "finals", "motcpot", "runking", "wicketking"] },
  { title: "Overall", ids: ["points", "matches", "tournaments"] },
];

const DESC: Record<string, string> = {
  tournaments_history: "রান, উইকেট, ট্রফি আর টুর্নামেন্টের সোনালী ইতিহাস এক ঠিকানায়",
  teammates_record: "যাঁরা সবচেয়ে বেশি সংখ্যক সতীর্থের সাথে একই টিমে খেলেছেন",
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
  innings: "সবচেয়ে বেশি ইনিংস",
  notout: "সবচেয়ে বেশি নট-আউট",
  maxruns: "এক টুর্নামেন্টে সর্বোচ্চ ব্যক্তিগত রান",
  maxwickets: "এক টুর্নামেন্টে সর্বোচ্চ ব্যক্তিগত উইকেট",
  tournaments: "সবচেয়ে বেশি টুর্নামেন্টে অংশগ্রহণ",
  clubs: "রান ও উইকেটের স্ল্যাব অনুযায়ী অলরাউন্ডার ক্লাব",
};

const ACCENT: Record<string, string> = {
  tournaments_history: "#f59e0b", teammates_record: "#38bdf8", records: "#f59e0b", points: "#f59e0b", runs: "#60a5fa", wickets: "#fb7185", sixes: "#c084fc",
  fours: "#38bdf8", hattricks: "#f472b6", champions: "#fbbf24", runnersup: "#cbd5e1", finals: "#22d3ee",
  motcpot: "#c084fc", runking: "#fb923c", wicketking: "#22d3ee", matches: "#34d399",
  innings: "#60a5fa", notout: "#94a3b8", maxruns: "#f87171", maxwickets: "#fb923c",
  tournaments: "#34d399", clubs: "#a78bfa",
};

const TIER_COLOR: Record<string, string> = { Bronze: "#cd7f32", Silver: "#cbd5e1", Gold: "#fbbf24", Diamond: "#67e8f9" };

const MEDAL = ["#fbbf24", "#cbd5e1", "#cd7f32"];

function buildHolders(players: Player[], tm: TeamCounts) {
  if (!players || players.length === 0) return [];
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
    { id: "innings", label: "Most Innings", icon: "📋", fn: (p: Player) => p.innings || 0, unit: "Innings" },
    { id: "notout", label: "Most Not Outs", icon: "🧱", fn: (p: Player) => p.notOut || 0, unit: "Not Outs" },
    { id: "maxruns", label: "Highest Tour. Runs", icon: "🚀", fn: (p: Player) => p.maxRuns || 0, unit: "Runs" },
    { id: "maxwickets", label: "Highest Wicket", icon: "🔥", fn: (p: Player) => p.maxWickets || 0, unit: "Wickets" },
    { id: "tournaments", label: "Tournaments", icon: "🗓️", fn: (p: Player) => p.totalTournament || 0, unit: "Tours" },
    { id: "teammates_record", label: "Most Teammates", icon: "🤝", fn: (p: Player) => teammateCountOf(p, tm), unit: "Players" },
  ];

  return defs.map((d) => {
    let best = players[0];
    let bestV = d.fn(best);
    for (let i = 1; i < players.length; i++) {
      const v = d.fn(players[i]);
      if (v > bestV) { bestV = v; best = players[i]; }
    }
    return { ...d, player: best, value: bestV };
  });
}

const Avatar = memo(function Avatar({ player, size = 44 }: { player: Player; size?: number }) {
  const rawPhoto = player?.photo || player?.photoUrl;
  const photoPath = rawPhoto && rawPhoto !== "—" && rawPhoto !== ""
    ? (rawPhoto.startsWith("/") ? rawPhoto : `/players/${rawPhoto}`)
    : `/FCL Cricket Avatar Placeholder.jpg`;

  return (
    <div className="relative shrink-0 overflow-hidden rounded-full border border-[#1e293b] bg-[#0b1220]" style={{ width: size, height: size }}>
      <img
        src={photoPath}
        alt={player?.name || "Player"}
        loading="lazy"
        decoding="async"
        width={size}
        height={size}
        className="h-full w-full object-cover"
        onError={(e) => { e.currentTarget.src = `/FCL Cricket Avatar Placeholder.jpg`; }}
      />
    </div>
  );
});

/* ═════════════════════════ MOBILE TOP-3 PODIUM (সব ক্যাটেগরির জন্য) ═════════════════════════ */

function MobilePodium({
  rows,
  onSelect,
}: {
  rows: { player: Player; value: number | string; unit: string }[];
  onSelect: (p: Player) => void;
}) {
  const podium = rows.slice(0, 3);
  const order = podium.length === 3 ? [1, 0, 2] : podium.map((_, i) => i);

  return (
    <div className="grid grid-cols-3 items-end gap-2">
      {order.map((i) => {
        const r = podium[i];
        if (!r) return null;
        const m = MEDAL[i];
        const first = i === 0;
        return (
          <button
            key={`${r.player.id ?? r.player.name}-${i}`}
            onClick={() => onSelect(r.player)}
            className={`group relative min-w-0 overflow-hidden rounded-2xl border px-1.5 text-center transition duration-300 active:scale-[0.97] ${first ? "pb-4 pt-8" : "pb-3 pt-7"}`}
            style={{ borderColor: `${m}55`, background: `linear-gradient(180deg, ${m}${first ? "26" : "16"}, #0b1220 70%)` }}
          >
            <span
              className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black text-black"
              style={{ background: m }}
            >
              {i + 1}
            </span>
            <div className="flex justify-center"><Avatar player={r.player} size={first ? 52 : 42} /></div>
            <p className={`mt-2 truncate px-0.5 font-black text-white ${first ? "text-xs" : "text-[11px]"}`}>{r.player.name}</p>
            <p className="truncate px-0.5 text-[10px] font-semibold text-slate-400">@{r.player.nickName || "Player"}</p>
            <p className={`mt-2 font-black tabular-nums leading-none ${first ? "text-3xl" : "text-2xl"}`} style={{ color: m }}>
              {typeof r.value === "number" ? r.value.toLocaleString() : r.value}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{r.unit}</p>
          </button>
        );
      })}
    </div>
  );
}

/* ═════════════════════════ TOURNAMENT HISTORY ═════════════════════════ */

interface Tour {
  id: number;
  name: string;
  time: string;
  dateVal: number;
  champTeam: string;
  champPlayers: string[];
  ruTeam: string;
  ruPlayers: string[];
  scorers: string[];
  wickets: string[];
  mots: string[];
  cpots: string[];
  playerCount: number;
  search: string;
}

const GOLD = "#fbbf24";
const SILVER = "#cbd5e1";

const SORTS = [
  { id: "old", label: "পুরনো থেকে নতুন (2013+)" },
  { id: "new", label: "সর্বশেষ থেকে পুরোনো (Latest)" },
  { id: "az", label: "A → Z" },
  { id: "za", label: "Z → A" },
  { id: "players", label: "বেশি প্লেয়ার" },
];

const letterOf = (name: string) => {
  const c = (name || "").trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
};

const pushUnique = (arr: string[], v?: string) => {
  if (v && !arr.includes(v)) arr.push(v);
};

const parseTourDate = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(/\s+/);
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  let month = 0;
  let year = 2013;
  for (const p of parts) {
    const clean = p.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (months[clean.substring(0, 3)] !== undefined) {
      month = months[clean.substring(0, 3)];
    }
    const num = parseInt(clean);
    if (!isNaN(num) && num > 1990 && num < 2100) {
      year = num;
    }
  }
  return year * 12 + month;
};

function buildTours(data: TournamentRecord[]): Tour[] {
  const map = new Map<string, Tour & { _all: Set<string> }>();
  (data || []).forEach((r) => {
    const name = (r.tournament || "Tournament").trim();
    if (!map.has(name)) {
      map.set(name, {
        id: map.size, name, time: r.time || "", dateVal: 0,
        champTeam: "", champPlayers: [], ruTeam: "", ruPlayers: [],
        scorers: [], wickets: [], mots: [], cpots: [],
        playerCount: 0, search: "", _all: new Set<string>(),
      });
    }
    const t = map.get(name)!;
    if (!t.time && r.time) t.time = r.time;
    if (r.playerName) t._all.add(r.playerName);

    const cr = (r.chamRu || "").toUpperCase();
    if (cr.includes("CHAM") || cr.includes("WIN")) {
      if (r.team) t.champTeam = r.team;
      pushUnique(t.champPlayers, r.playerName);
    } else if (cr.includes("RU") || cr.includes("RUNNER")) {
      if (r.team) t.ruTeam = r.team;
      pushUnique(t.ruPlayers, r.playerName);
    }

    if (Number(r.topScorer) === 1) pushUnique(t.scorers, r.playerName);
    if (Number(r.topWicket) === 1) pushUnique(t.wickets, r.playerName);

    const m = (r.motCpot || "").toUpperCase();
    if (m.includes("CPOT")) pushUnique(t.cpots, r.playerName);
    else if (m.includes("MOT")) pushUnique(t.mots, r.playerName);
  });

  return Array.from(map.values()).map((t) => {
    const { _all, ...rest } = t;
    const dateVal = parseTourDate(rest.time);
    const out: Tour = { ...rest, dateVal, playerCount: _all.size };
    // সার্চে এখন টুর্নামেন্টের সব খেলোয়াড়ের নামও ধরা হবে
    out.search = [
      out.name, out.time, out.champTeam, out.ruTeam,
      ...Array.from(_all),
      ...out.champPlayers, ...out.ruPlayers,
      ...out.scorers, ...out.wickets, ...out.mots, ...out.cpots,
    ].join(" ").toLowerCase();
    return out;
  });
}

// query এখন উপরের গ্লোবাল সার্চ থেকে আসে
function useTourState(data: TournamentRecord[], query: string) {
  const tours = useMemo(() => buildTours(data), [data]);
  const [sort, setSort] = useState("old");
  const [letter, setLetter] = useState("All");

  const letters = useMemo(
    () => Array.from(new Set(tours.map((t) => letterOf(t.name)))).sort((a, b) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b))),
    [tours]
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const l = tours.filter((t) => (letter === "All" || letterOf(t.name) === letter) && (!q || t.search.includes(q)));
    switch (sort) {
      case "az": l.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "za": l.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "new": l.sort((a, b) => b.dateVal - a.dateVal || b.id - a.id); break;
      case "old": l.sort((a, b) => a.dateVal - b.dateVal || a.id - b.id); break;
      case "players": l.sort((a, b) => b.playerCount - a.playerCount || a.name.localeCompare(b.name)); break;
      default: l.sort((a, b) => a.dateVal - b.dateVal || a.id - b.id);
    }
    return l;
  }, [tours, query, sort, letter]);

  const stats = useMemo(() => {
    const names = new Set<string>();
    const teams = new Set<string>();
    (data || []).forEach((r) => { if (r.playerName) names.add(r.playerName); });
    tours.forEach((t) => t.champTeam && teams.add(t.champTeam));
    return { tournaments: tours.length, players: names.size, champTeams: teams.size };
  }, [data, tours]);

  const grouped = useMemo(() => {
    const g = new Map<string, Tour[]>();
    [...tours].sort((a, b) => a.name.localeCompare(b.name)).forEach((t) => {
      const k = letterOf(t.name);
      const arr = g.get(k);
      if (arr) arr.push(t);
      else g.set(k, [t]);
    });
    return Array.from(g.entries()).sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)));
  }, [tours]);

  return { tours, list, letters, grouped, stats, sort, setSort, letter, setLetter };
}

function SquadChips({ names, tour, players, onSelect }: { names: string[]; tour: Tour; players: Player[]; onSelect: (p: Player) => void }) {
  const byName = useMemo(() => {
    const m = new Map<string, Player>();
    players.forEach((p) => m.set(nameKey(p.name), p));
    return m;
  }, [players]);

  if (!names.length) return <p className="text-xs text-slate-500">স্কোয়াডের তথ্য নেই</p>;
  const badge = (n: string) =>
    (tour.scorers.includes(n) ? "🏏" : "") +
    (tour.wickets.includes(n) ? "🎯" : "") +
    (tour.mots.includes(n) ? "⭐" : "") +
    (tour.cpots.includes(n) ? "🏅" : "");
  return (
    <div className="flex flex-wrap gap-1.5">
      {names.map((n) => {
        const p = byName.get(nameKey(n));
        return (
          <button
            key={n}
            disabled={!p}
            onClick={() => p && onSelect(p)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-100 transition enabled:hover:border-amber-400/60 enabled:hover:bg-amber-400/10 enabled:active:scale-95"
          >
            {n}
            {badge(n) && <span className="ml-1">{badge(n)}</span>}
          </button>
        );
      })}
    </div>
  );
}

function AwardCell({ icon, label, names, color }: { icon: string; label: string; names: string[]; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2.5">
      <p className="text-[10px] font-bold text-slate-500">{icon} {label}</p>
      <p className="mt-0.5 text-[13px] font-black leading-snug" style={{ color: names.length ? color : "#475569" }}>
        {names.length ? names.join(", ") : "—"}
      </p>
    </div>
  );
}

// সার্চ বক্স সরানো হয়েছে (উপরের গ্লোবাল সার্চ ব্যবহার হয়), শুধু সর্ট ও অক্ষর ফিল্টার আছে
function TourToolbar({ s, compact }: { s: ReturnType<typeof useTourState>; compact?: boolean }) {
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <select
          value={s.sort}
          onChange={(e) => s.setSort(e.target.value)}
          aria-label="Sort"
          className={`rounded-xl border border-[#1e293b] bg-[#0b1220] px-2.5 py-2.5 text-xs font-bold text-amber-400 outline-none focus:border-amber-500 ${compact ? "w-full" : "w-full"}`}
        >
          {SORTS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {["All", ...s.letters].map((l) => (
          <button
            key={l}
            onClick={() => s.setLetter(l)}
            className={`h-7 shrink-0 rounded-lg px-2.5 text-[11px] font-black transition ${
              s.letter === l ? "bg-amber-500 text-black" : "border border-[#1e293b] bg-[#0b1220] text-slate-300"
            } ${l === "All" ? "px-3" : "min-w-[28px]"}`}
          >
            {l === "All" ? "সব" : l}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatTile({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex-1 px-3 py-3 text-center">
      <p className="text-xl font-black tabular-nums md:text-3xl" style={{ color }}>{value.toLocaleString()}</p>
      <p className="mt-0.5 text-[10px] font-semibold text-slate-400 md:text-xs">{label}</p>
    </div>
  );
}

/* ── Tournament history: MOBILE ── */
function TournamentHistoryMobile({ players, onSelect, data, query, clearQuery }: { players: Player[]; onSelect: (p: Player) => void; data: TournamentRecord[]; query: string; clearQuery: () => void }) {
  const s = useTourState(data, query);
  const [openId, setOpenId] = useState<number | null>(null);
  const [seg, setSeg] = useState<"champ" | "ru">("champ");
  const [visible, setVisible] = useState(10);
  const [indexOpen, setIndexOpen] = useState(false);

  // সার্চ করলে লিস্ট শুরু থেকে দেখাবে
  useEffect(() => { setVisible(10); }, [query]);

  const toggle = (id: number) => {
    setSeg("champ");
    setOpenId((cur) => (cur === id ? null : id));
  };

  const jump = (t: Tour) => {
    clearQuery();
    s.setLetter("All");
    setVisible(9999);
    setSeg("champ");
    setOpenId(t.id);
    setIndexOpen(false);
    setTimeout(() => document.getElementById(`tour-${t.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  const shown = s.list.slice(0, visible);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-[#14120a] via-[#0b1220] to-[#070c18]">
        <div className="flex divide-x divide-white/10">
          <StatTile value={s.stats.tournaments} label="টুর্নামেন্ট" color="#fbbf24" />
          <StatTile value={s.stats.players} label="প্লেয়ার" color="#34d399" />
          <StatTile value={s.stats.champTeams} label="চ্যাম্পিয়ন টিম" color="#60a5fa" />
        </div>
        <button
          onClick={() => setIndexOpen((o) => !o)}
          className="flex w-full items-center justify-between border-t border-white/10 px-4 py-2.5 text-xs font-black text-amber-400"
        >
          <span>📚 সব টুর্নামেন্টের নাম (A–Z)</span>
          <span className={`transition ${indexOpen ? "rotate-180" : ""}`}>⌄</span>
        </button>
        {indexOpen && (
          <div className="max-h-64 space-y-2.5 overflow-y-auto border-t border-white/10 px-3 py-3 [scrollbar-width:thin]">
            {s.grouped.map(([l, items]) => (
              <div key={l} className="flex gap-2">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-[11px] font-black text-amber-400">{l}</span>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((t) => (
                    <button key={t.id} onClick={() => jump(t)} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-200 active:scale-95">
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TourToolbar s={s} compact />

      <p className="px-1 text-[11px] font-semibold text-slate-500">
        {s.list.length === s.tours.length ? `মোট ${s.tours.length}টি টুর্নামেন্ট` : `${s.list.length}টি পাওয়া গেছে (মোট ${s.tours.length})`}
      </p>

      {shown.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#1e293b] py-10 text-center text-xs text-slate-400">
          কিছু পাওয়া যায়নি। অন্য নাম বা অক্ষর দিয়ে চেষ্টা করুন।
        </div>
      )}

      <div className="space-y-2.5">
        {shown.map((t) => {
          const open = openId === t.id;
          const squad = seg === "champ" ? t.champPlayers : t.ruPlayers;
          const team = seg === "champ" ? t.champTeam : t.ruTeam;
          return (
            <div
              key={t.id}
              id={`tour-${t.id}`}
              className="scroll-mt-24 overflow-hidden rounded-2xl border bg-[#0b1220] transition-colors"
              style={{ borderColor: open ? "#f59e0b66" : "#1e293b" }}
            >
              <button onClick={() => toggle(t.id)} className="flex w-full items-center gap-3 p-3 text-left">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 text-lg font-black text-black">
                  {letterOf(t.name) === "#" ? "🏆" : letterOf(t.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-white">{t.name}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                    {t.time ? `📅 ${t.time}  ` : ""}👥 {t.playerCount}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] font-bold text-amber-400">🏆 {t.champTeam || "—"}</span>
                </span>
                <span className={`text-slate-400 transition ${open ? "rotate-180" : ""}`}>⌄</span>
              </button>

              {open && (
                <div className="space-y-3 border-t border-white/[0.07] p-3">
                  <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/40 p-1">
                    {([
                      ["champ", "🏆 চ্যাম্পিয়ন", GOLD, t.champPlayers.length],
                      ["ru", "🥈 রানার্স-আপ", SILVER, t.ruPlayers.length],
                    ] as const).map(([id, label, c, n]) => (
                      <button
                        key={id}
                        onClick={() => setSeg(id)}
                        className="rounded-lg py-2 text-[11px] font-black transition"
                        style={seg === id ? { background: c, color: "#000" } : { color: "#94a3b8" }}
                      >
                        {label} ({n})
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl border p-3" style={{ borderColor: seg === "champ" ? "#fbbf2440" : "#cbd5e130", background: seg === "champ" ? "#fbbf2410" : "#cbd5e108" }}>
                    <p className="mb-2 text-xs font-black" style={{ color: seg === "champ" ? GOLD : SILVER }}>
                      {team || "টিমের নাম নেই"}
                    </p>
                    <SquadChips names={squad} tour={t} players={players} onSelect={onSelect} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <AwardCell icon="🏏" label="টপ স্কোরার" names={t.scorers} color="#34d399" />
                    <AwardCell icon="🎯" label="টপ উইকেট" names={t.wickets} color="#fbbf24" />
                    <AwardCell icon="⭐" label="MOT" names={t.mots} color="#c084fc" />
                    <AwardCell icon="🏅" label="CPOT" names={t.cpots} color="#38bdf8" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {visible < s.list.length && (
        <button
          onClick={() => setVisible((v) => v + 10)}
          className="w-full rounded-2xl border border-[#1e293b] bg-[#0b1220] py-3 text-xs font-black text-amber-400 active:scale-[0.98]"
        >
          আরও দেখুন ({s.list.length - visible}টি বাকি)
        </button>
      )}
    </div>
  );
}

/* ── Tournament history: DESKTOP ── */
function TournamentHistoryDesktop({ players, onSelect, data, query, clearQuery }: { players: Player[]; onSelect: (p: Player) => void; data: TournamentRecord[]; query: string; clearQuery: () => void }) {
  const s = useTourState(data, query);
  const [selId, setSelId] = useState<number | null>(null);
  const selected = s.list.find((t) => t.id === selId) || s.list[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">🏆 Tournament History Archive</h2>
        <p className="mt-1 text-sm text-slate-400">বাম পাশ থেকে টুর্নামেন্ট বেছে নিন, ডান পাশে স্কোয়াড ও সেরা পারফর্মারদের তথ্য দেখুন। স্কোয়াডের নামে ক্লিক করলে প্লেয়ার কার্ড খুলবে।</p>
      </div>

      <div className="grid grid-cols-[auto_1fr] overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#14120a] via-[#0b1220] to-[#070c18]">
        <div className="flex divide-x divide-white/10 border-r border-white/10">
          <div className="w-36"><StatTile value={s.stats.tournaments} label="মোট টুর্নামেন্ট" color="#fbbf24" /></div>
          <div className="w-36"><StatTile value={s.stats.players} label="প্লেয়ার" color="#34d399" /></div>
          <div className="w-36"><StatTile value={s.stats.champTeams} label="চ্যাম্পিয়ন টিম" color="#60a5fa" /></div>
        </div>
        <div className="max-h-[132px] overflow-y-auto px-5 py-3 [scrollbar-width:thin]">
          <p className="mb-2 text-xs font-bold text-slate-500">সব টুর্নামেন্ট (A–Z)</p>
          <div className="space-y-1.5">
            {s.grouped.map(([l, items]) => (
              <div key={l} className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500/15 text-[10px] font-black text-amber-400">{l}</span>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { clearQuery(); s.setLetter("All"); setSelId(t.id); }}
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition hover:border-amber-400/60 ${selected?.id === t.id ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-white/10 text-slate-300"}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[360px_1fr] items-start gap-6">
        <div className="space-y-3">
          <TourToolbar s={s} />
          <p className="px-1 text-xs font-semibold text-slate-500">{s.list.length}টি টুর্নামেন্ট</p>
          <div className="max-h-[620px] space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {s.list.length === 0 && <p className="py-10 text-center text-xs text-slate-400">কিছু পাওয়া যায়নি</p>}
            {s.list.map((t) => {
              const active = selected?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelId(t.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? "border-amber-500/60 bg-amber-500/10" : "border-[#1e293b] bg-[#0b1220] hover:bg-[#0f192c]"}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 text-base font-black text-black">
                    {letterOf(t.name) === "#" ? "🏆" : letterOf(t.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-white">{t.name}</span>
                    <span className="block truncate text-[11px] text-slate-400">{t.time || "—"} • 👥 {t.playerCount}</span>
                    <span className="block truncate text-[11px] font-bold text-amber-400">🏆 {t.champTeam || "—"}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selected ? (
          <div className="sticky top-6 space-y-5 rounded-3xl border border-[#1e293b] bg-gradient-to-br from-[#0b1220] via-[#080e1a] to-[#04070b] p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#1e293b] pb-5">
              <div>
                <h3 className="text-3xl font-black text-amber-400">🏟️ {selected.name}</h3>
                {selected.time && <p className="mt-1.5 text-sm font-bold text-sky-400">📅 {selected.time}</p>}
              </div>
              <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-black text-emerald-400">
                👥 {selected.playerCount} Players
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {([
                ["🏆 Champion", selected.champTeam, selected.champPlayers, GOLD],
                ["🥈 Runner-Up", selected.ruTeam, selected.ruPlayers, SILVER],
              ] as const).map(([title, team, names, c]) => (
                <div key={title} className="rounded-2xl border p-5" style={{ borderColor: `${c}40`, background: `linear-gradient(170deg, ${c}18, transparent 60%)` }}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-black" style={{ color: c }}>{title}</p>
                    <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-black" style={{ borderColor: `${c}60`, color: c }}>{names.length}</span>
                  </div>
                  <p className="mb-3 text-lg font-black text-white">{team || "—"}</p>
                  <SquadChips names={names as string[]} tour={selected} players={players} onSelect={onSelect} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-3">
              <AwardCell icon="🏏" label="টপ স্কোরার" names={selected.scorers} color="#34d399" />
              <AwardCell icon="🎯" label="টপ উইকেট" names={selected.wickets} color="#fbbf24" />
              <AwardCell icon="⭐" label="MOT" names={selected.mots} color="#c084fc" />
              <AwardCell icon="🏅" label="CPOT" names={selected.cpots} color="#38bdf8" />
            </div>
            <p className="text-[11px] text-slate-500">স্কোয়াডে: 🏏 টপ স্কোরার • 🎯 টপ উইকেট • ⭐ MOT • 🏅 CPOT</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1e293b] py-24 text-center text-sm text-slate-400">কোনো টুর্নামেন্ট নির্বাচিত নেই</div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════ TEAMMATES RECORD VIEW ═════════════ */
// সার্চ বক্স সরানো হয়েছে — উপরের গ্লোবাল সার্চ (query prop) ব্যবহার হয়
function TeammatesRecordView({ players, teamCounts, onSelect, query, compact = false }: { players: Player[]; teamCounts: TeamCounts; onSelect: (p: Player) => void; query: string; compact?: boolean }) {
  const [chip, setChip] = useState("Top 10");
  const q = query.trim().toLowerCase();

  // ✅ আসল র‍্যাংকসহ সাজানো
  const teammatesRanking = useMemo(() => {
    const arr = players.map((p) => ({ player: p, teammateCount: teammateCountOf(p, teamCounts) }));
    arr.sort((a, b) => b.teammateCount - a.teammateCount);
    return arr.map((item, i) => ({ ...item, rank: i + 1 }));
  }, [players, teamCounts]);

  const filtered = useMemo(() => {
    const list = q ? teammatesRanking.filter(item =>
      item.player.name.toLowerCase().includes(q) ||
      (item.player.nickName || "").toLowerCase().includes(q)
    ) : teammatesRanking;

    const limit = chip === "All" ? Infinity : parseInt(chip.replace("Top ", "")) || 10;
    // সার্চ থাকলে লিমিট ছাড়াই দেখাবে
    return q ? list : list.slice(0, limit);
  }, [teammatesRanking, q, chip]);

  const podium = filtered.slice(0, 3);
  const rest = filtered.slice(3);
  const podiumOrder = podium.length === 3 ? [1, 0, 2] : podium.map((_, i) => i);
  const medal = MEDAL;
  const list = q ? filtered : rest;

  return (
    <div className="min-w-0">
      <div className={compact ? "mb-4 flex flex-col gap-3" : "mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"}>
        <div>
          <h2 className={`${compact ? "text-lg" : "text-2xl"} font-black`}>🤝 Most Teammates</h2>
          <p className={`mt-1 text-slate-400 ${compact ? "text-xs" : "text-sm"}`}>{DESC.teammates_record}</p>
        </div>
        <div className={`flex rounded-full border border-[#1e293b] bg-[#0b1220] p-1 ${compact ? "w-full justify-between gap-0.5" : "gap-1.5"}`}>
          {COUNT_CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => setChip(c)}
              className={`rounded-full font-bold transition ${compact ? "flex-1 px-1 py-1.5 text-[11px]" : "px-4 py-1.5 text-xs"} ${chip === c ? "text-black" : "text-slate-400 hover:text-white"}`}
              style={chip === c ? { background: "#38bdf8" } : undefined}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[#1e293b] py-10 text-center text-xs text-slate-400">কিছু পাওয়া যায়নি</p>
      )}

      {podium.length > 0 && !q && (
        <div className={`grid grid-cols-3 items-end ${compact ? "gap-2" : "gap-5"}`}>
          {podiumOrder.map((i) => {
            const r = podium[i];
            if (!r) return null;
            const m = medal[i];
            const first = i === 0;
            const pad = compact
              ? first ? "px-1.5 pb-4 pt-8" : "px-1.5 pb-3 pt-7"
              : first ? "px-6 pb-8 pt-9" : "px-6 pb-6 pt-7";
            return (
              <button
                key={r.player.id || r.player.name}
                onClick={() => onSelect(r.player)}
                className={`group relative min-w-0 overflow-hidden border text-center transition duration-300 hover:-translate-y-1 ${compact ? "rounded-2xl" : "rounded-3xl"} ${pad}`}
                style={{ borderColor: `${m}55`, background: `linear-gradient(180deg, ${m}${first ? "26" : "16"}, #0b1220 70%)` }}
              >
                <span
                  className={`absolute flex items-center justify-center font-black text-black ${compact ? "left-1.5 top-1.5 h-6 w-6 rounded-lg text-xs" : "left-4 top-4 h-8 w-8 rounded-xl text-sm"}`}
                  style={{ background: m }}
                >
                  {i + 1}
                </span>
                <div className="flex justify-center"><Avatar player={r.player} size={compact ? (first ? 52 : 42) : (first ? 76 : 62)} /></div>
                <p className={`truncate font-black text-white ${compact ? `mt-2 px-0.5 ${first ? "text-xs" : "text-[11px]"}` : `mt-4 ${first ? "text-xl" : "text-lg"}`}`}>{r.player.name}</p>
                <p className={`truncate font-semibold text-slate-400 ${compact ? "px-0.5 text-[10px]" : "mt-0.5 text-xs"}`}>@{r.player.nickName || "Player"}</p>
                <p className={`font-black tabular-nums leading-none ${compact ? `mt-2 ${first ? "text-3xl" : "text-2xl"}` : `mt-4 ${first ? "text-5xl" : "text-4xl"}`}`} style={{ color: m }}>{r.teammateCount}</p>
                <p className={`font-semibold text-slate-400 ${compact ? "mt-0.5 text-[10px]" : "mt-1.5 text-xs"}`}>Players</p>
              </button>
            );
          })}
        </div>
      )}

      {list.length > 0 && (
        <div className={`overflow-hidden border border-[#1e293b] bg-[#0b1220] ${compact ? "mt-3 rounded-2xl" : "mt-6 rounded-3xl"}`}>
          {!compact && (
            <div className="grid grid-cols-[56px_1fr_220px_160px_110px] gap-4 border-b border-[#172033] px-5 py-3 text-xs font-bold text-slate-500">
              <span>Rank</span><span>Player</span><span>Details</span><span>Info</span><span className="text-right">Teammates</span>
            </div>
          )}
          <div className={`divide-y divide-[#172033]/70 ${compact ? "" : "max-h-[640px] overflow-y-auto [scrollbar-width:thin]"}`}>
            {list.map((item) => {
              const rankNum = item.rank;
              if (compact) {
                return (
                  <button
                    key={item.player.id || item.player.name}
                    onClick={() => onSelect(item.player)}
                    className="grid w-full grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-2.5 px-3 py-2.5 text-left transition active:bg-white/[0.04] [content-visibility:auto] [contain-intrinsic-size:52px]"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#16223b] text-[11px] font-black text-slate-400">{rankNum}</span>
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Avatar player={item.player} size={32} />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-white">{item.player.name}</span>
                        <span className="block truncate text-[10px] text-slate-500">@{item.player.nickName || "Player"} • {item.player.matches} Matches</span>
                      </span>
                    </span>
                    <span className="text-right text-base font-black tabular-nums text-sky-400">{item.teammateCount}</span>
                  </button>
                );
              }
              return (
                <button
                  key={item.player.id || item.player.name}
                  onClick={() => onSelect(item.player)}
                  className="group grid w-full grid-cols-[56px_1fr_220px_160px_110px] items-center gap-4 px-5 py-3 text-left transition hover:bg-white/[0.04] [content-visibility:auto] [contain-intrinsic-size:56px]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#16223b] text-xs font-black text-slate-400">{rankNum}</span>
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar player={item.player} size={34} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-white">{item.player.name}</span>
                      <span className="block truncate text-[11px] text-slate-500">@{item.player.nickName || "Player"}</span>
                    </span>
                  </span>
                  <span className="truncate text-xs text-slate-300">{item.player.matches} Matches</span>
                  <span className="truncate text-xs text-slate-500">{item.player.role || "All-Rounder"}</span>
                  <span className="text-right text-lg font-black tabular-nums text-sky-400">{item.teammateCount}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════ MOBILE RECORDS ═════════════════════════ */
function MobileRecords({ players, tournamentsData, teamCounts, loading, onSelect }: { players: Player[]; tournamentsData: TournamentRecord[]; teamCounts: TeamCounts; loading: boolean; onSelect: (p: Player) => void }) {
  const [tab, setTab] = useState<MTabId>("tournaments_history");
  const [chip, setChip] = useState("Top 10");
  const [expanded, setExpanded] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  // ✅ ট্যাব বদলালে সার্চ আর মুছবে না — সার্চ লক থাকবে
  const changeTab = (id: MTabId) => {
    setTab(id);
    setChip(id === "clubs" ? "All" : "Top 10");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chips = tab === "records" ? [] : tab === "clubs" ? CLUB_CHIPS : COUNT_CHIPS;
  const tabInfo = MOBILE_TABS.find((t) => t.id === tab);
  const q = query.trim().toLowerCase();

  // ⚡ শুধু Record Holders ট্যাবে গেলেই হিসাব হবে
  const holders = useMemo(
    () => (tab === "records" ? buildHolders(players, teamCounts) : []),
    [tab, players, teamCounts]
  );
  const holdersF = useMemo(() => filterHolders(holders, query), [holders, query]);

  const rows = useMemo(() => {
    if (tab === "tournaments_history" || tab === "teammates_record" || tab === "records" || tab === "clubs") return [];
    const c = MOBILE_CFG[tab];
    if (!c) return [];
    const limit = chip === "All" ? Infinity : parseInt(chip.replace("Top ", "")) || 10;
    return rankPlayers(players, (p) => c.v(p, teamCounts), q, limit).map(({ player: p, value, rank }, i) => ({
      key: (p.id ?? p.name) + "-" + i,
      player: p,
      badge: c.badge(p),
      meta: c.meta(p),
      value,
      rank,
      unit: c.unit,
    }));
  }, [players, teamCounts, tab, chip, q]);

  const listRows = q ? rows : rows.slice(3);

  return (
    <div className="min-h-screen bg-[#020617] pb-28 text-white selection:bg-amber-500/30 selection:text-white">
      <header className="sticky top-0 z-30 bg-[#020617]/95 px-4 pb-2 pt-4 backdrop-blur border-b border-[#1e293b]/50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-300">‹</Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black tracking-tight truncate">FCL Record Corner</h1>
            <p className="text-[10px] text-slate-400 truncate">{tab === "tournaments_history" ? "Tournament History" : tab === "teammates_record" ? "Teammates Leaderboard" : tabInfo?.label || "Hall of Fame"}</p>
          </div>
          <Link href="/rankings" className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-black text-black">Rankings</Link>
          <button
            onClick={() => { setShowSearch((s) => !s); if (showSearch) setQuery(""); }}
            aria-label="Search"
            className={`flex h-9 w-9 items-center justify-center rounded-full border bg-[#0b1220] ${showSearch ? "border-amber-500" : "border-[#1e293b]"}`}
          >
            🔍
          </button>
        </div>
        {showSearch && (
          <div className="relative mt-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={SEARCH_PLACEHOLDER}
              className="w-full rounded-xl border border-[#1e293b] bg-[#0b1220] py-2.5 pl-4 pr-9 text-xs text-white outline-none placeholder:text-slate-500 focus:border-amber-500"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear" className="absolute right-2 top-1/2 -translate-y-1/2 px-1 text-slate-400">✕</button>
            )}
          </div>
        )}
      </header>

      {/* Mobile Category Grid / Selector */}
      <div className="mx-3 mt-3 rounded-3xl bg-[#0a1324] p-3 border border-[#1e293b]">
        <button
          onClick={() => changeTab("tournaments_history")}
          className={`mb-3 flex w-full items-center justify-center gap-2.5 rounded-2xl p-3 text-sm font-black transition-all duration-300 ${
            tab === "tournaments_history"
              ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/40 scale-[1.02] border-2 border-amber-300"
              : "bg-gradient-to-r from-[#172033] to-[#0f172a] text-amber-400 border border-amber-500/40 hover:border-amber-500"
          }`}
        >
          <span className="text-lg">🏆</span>
          <span className="tracking-wide uppercase">Tournament History Archive</span>
        </button>

        <div className="grid grid-cols-4 gap-2">
          {(expanded ? MOBILE_TABS.filter(t => t.id !== "tournaments_history") : MOBILE_TABS.filter(t => t.id !== "tournaments_history").slice(0, 8)).map((t) => (
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

      {chips.length > 0 && tab !== "clubs" && tab !== "tournaments_history" && tab !== "teammates_record" && (
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
          <TournamentHistoryMobile data={tournamentsData} players={players} onSelect={onSelect} query={query} clearQuery={() => setQuery("")} />
        ) : tab === "teammates_record" ? (
          <TeammatesRecordView players={players} teamCounts={teamCounts} onSelect={onSelect} query={query} compact />
        ) : tab === "records" ? (
          <div className="space-y-3">
            <h2 className="text-sm font-black text-amber-400 px-1">⭐ Hall of Fame — Top Record Holders</h2>
            {holdersF.length === 0 && <p className="rounded-2xl border border-dashed border-[#1e293b] py-10 text-center text-xs text-slate-400">কিছু পাওয়া যায়নি</p>}
            {holdersF.map((h, i) => (
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
              const list = players.filter(t.test).filter((p) => matchPlayer(p, q));
              if (q && list.length === 0) return null;
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
          /* ✅ সব ক্যাটেগরিতে Teammates এর মতো Top 3 পডিয়াম + নিচে লিস্ট */
          <div className="space-y-3">
            <div className="px-1">
              <h2 className="text-lg font-black">{tabInfo?.icon} {tabInfo?.label}</h2>
              <p className="mt-1 text-xs text-slate-400">{DESC[tab]}</p>
            </div>

            {rows.length === 0 && (
              <p className="rounded-2xl border border-dashed border-[#1e293b] py-10 text-center text-xs text-slate-400">কিছু পাওয়া যায়নি</p>
            )}

            {!q && rows.length > 0 && (
              <MobilePodium rows={rows.slice(0, 3)} onSelect={onSelect} />
            )}

            {listRows.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0b1220]">
                <div className="divide-y divide-[#172033]/70">
                  {listRows.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => onSelect(r.player)}
                      className="grid w-full grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-2.5 px-3 py-2.5 text-left transition active:bg-white/[0.04] [content-visibility:auto] [contain-intrinsic-size:52px]"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#16223b] text-[11px] font-black text-slate-400">{r.rank}</span>
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Avatar player={r.player} size={32} />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-white">{r.player.name}</span>
                          <span className="block truncate text-[10px] text-slate-500">{r.badge} • {r.meta}</span>
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-base font-black tabular-nums text-amber-400">{typeof r.value === "number" ? r.value.toLocaleString() : r.value}</span>
                        <span className="block text-[9px] text-slate-500">{r.unit}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-3 left-3 right-3 z-40 md:hidden">
        <div className="flex items-center justify-between rounded-3xl border border-[#1e293b] bg-[#0b1220]/95 px-5 py-2 shadow-2xl backdrop-blur">
          <Link href="/" className="flex flex-col items-center text-[10px] font-semibold text-slate-400"><span>🏠</span>Home</Link>
          <button onClick={() => changeTab("teammates_record")} className="flex flex-col items-center rounded-2xl bg-amber-500/15 px-3 py-1 text-[10px] font-black text-amber-400"><span>🤝</span>Teammates</button>
          <Link href="/rankings" className="flex flex-col items-center text-[10px] font-semibold text-slate-400"><span>🚀</span>Rankings</Link>
          <button onClick={() => changeTab("clubs")} className="flex flex-col items-center text-[10px] font-semibold text-slate-400"><span>💎</span>Clubs</button>
        </div>
      </nav>
    </div>
  );
}

/* ═════════════════════════ DESKTOP RECORDS ═════════════════════════ */
function DesktopRecords({ players, tournamentsData, teamCounts, loading, onSelect }: { players: Player[]; tournamentsData: TournamentRecord[]; teamCounts: TeamCounts; loading: boolean; onSelect: (p: Player) => void }) {
  const [tab, setTab] = useState("tournaments_history");
  const [chip, setChip] = useState("Top 10");
  const [query, setQuery] = useState("");

  const tabInfo = MOBILE_TABS.find((t) => t.id === tab);
  const accent = ACCENT[tab] || "#f59e0b";
  const q = query.trim().toLowerCase();

  // ✅ ট্যাব বদলালে সার্চ আর মুছবে না — সার্চ লক থাকবে
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

  // ⚡ শুধু Record Holders ট্যাবে গেলেই হিসাব হবে
  const holders = useMemo(
    () => (tab === "records" ? buildHolders(players, teamCounts) : []),
    [tab, players, teamCounts]
  );
  const holdersF = useMemo(() => filterHolders(holders, query), [holders, query]);

  const rows = useMemo(() => {
    if (tab === "tournaments_history" || tab === "teammates_record") return [];
    const c = MOBILE_CFG[tab];
    if (!c) return [];
    const limit = chip === "All" ? Infinity : parseInt(chip.replace("Top ", "")) || 10;
    return rankPlayers(players, (p) => c.v(p, teamCounts), q, limit).map(({ player: p, value, rank }) => ({
      player: p,
      badge: c.badge(p),
      meta: c.meta(p),
      value,
      rank,
      unit: c.unit,
    }));
  }, [players, teamCounts, tab, chip, q]);

  // ✅ সার্চ থাকলে পডিয়াম বন্ধ, শুধু আসল র‍্যাংকসহ লিস্ট
  const podium = q ? [] : rows.slice(0, 3);
  const rest = q ? rows : rows.slice(3);
  const podiumOrder = podium.length === 3 ? [1, 0, 2] : podium.map((_, i) => i);
  const medal = MEDAL;
  const featured = holdersF.slice(0, 3);
  const others = holdersF.slice(3);

  return (
    <div className="relative min-h-screen bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.10),transparent_60%)]" />

      <div className="relative mx-auto max-w-[1400px] px-8 pb-20 pt-8">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e293b] bg-[#0b1220] text-xl text-slate-300 transition hover:border-amber-500/50 hover:text-white">‹</Link>
            <div>
              <h1 className="text-4xl font-black tracking-tight">FCL Record Corner</h1>
              <p className="mt-1 text-sm text-slate-400">রান, উইকেট, ট্রফি আর টুর্নামেন্টের সোনালী ইতিহাস এক ঠিকানায়।</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* ✅ সব ক্যাটেগরিতে সার্চ কাজ করবে */}
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={SEARCH_PLACEHOLDER}
                className="w-80 rounded-full border border-[#1e293b] bg-[#0b1220] py-2.5 pl-5 pr-9 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-500"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">✕</button>
              )}
            </div>
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
              <button
                onClick={() => changeTab("tournaments_history")}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition-all ${
                  tab === "tournaments_history"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/30 border border-amber-300 scale-[1.02]"
                    : "text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20"
                }`}
              >
                <span className="text-xl">🏆</span>
                <span className="tracking-wide">Tournament History</span>
              </button>

              {GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="px-3 pb-2 text-xs font-bold text-slate-500">{g.title}</p>
                  <div className="space-y-0.5">
                    {g.ids.filter(id => id !== "tournaments_history").map((id) => {
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
              <TournamentHistoryDesktop data={tournamentsData} players={players} onSelect={onSelect} query={query} clearQuery={() => setQuery("")} />
            ) : tab === "teammates_record" ? (
              <TeammatesRecordView players={players} teamCounts={teamCounts} onSelect={onSelect} query={query} />
            ) : tab === "records" ? (
              <div>
                <div className="mb-5"><h2 className="text-2xl font-black">Hall of Fame</h2><p className="mt-1 text-sm text-slate-400">{DESC.records}</p></div>
                {holdersF.length === 0 && <p className="rounded-3xl border border-dashed border-[#1e293b] py-16 text-center text-sm text-slate-400">কিছু পাওয়া যায়নি</p>}
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
                    const list = players.filter(t.test).filter((p) => matchPlayer(p, q));
                    if (q && list.length === 0) return null;
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

                {rows.length === 0 && (
                  <p className="rounded-3xl border border-dashed border-[#1e293b] py-16 text-center text-sm text-slate-400">কিছু পাওয়া যায়নি</p>
                )}

                {podium.length > 0 && (
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
                )}

                {rest.length > 0 && (
                  <div className="mt-6 overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220]">
                    <div className="grid grid-cols-[56px_1fr_220px_160px_110px] gap-4 border-b border-[#172033] px-5 py-3 text-xs font-bold text-slate-500">
                      <span>Rank</span><span>Player</span><span>Details</span><span>Info</span><span className="text-right">{MOBILE_CFG[tab]?.unit}</span>
                    </div>
                    <div className="max-h-[640px] divide-y divide-[#172033]/70 overflow-y-auto [scrollbar-width:thin]">
                      {rest.map((r, idx) => (
                        <button key={idx} onClick={() => onSelect(r.player)} className="group grid w-full grid-cols-[56px_1fr_220px_160px_110px] items-center gap-4 px-5 py-3 text-left transition hover:bg-white/[0.04] [content-visibility:auto] [contain-intrinsic-size:56px]">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#16223b] text-xs font-black text-slate-400">{r.rank}</span>
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

/* ═════════════════════════ PAGE ═════════════════════════ */

function useIsDesktop(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export default function RecordsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    let alive = true;
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        if (Array.isArray(data)) setPlayers(data);
        else if (data.players && Array.isArray(data.players)) setPlayers(data.players);
        if (data.tournaments && Array.isArray(data.tournaments)) setTournamentsData(data.tournaments);
        setLoading(false);
      })
      .catch((err) => { console.error("Error loading records:", err); if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const teamCounts = useMemo(() => buildTeammateCounts(tournamentsData), [tournamentsData]);

  const handleSelect = (p: Player) => setSelectedPlayer(p);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-amber-500/30 selection:text-white">
      {isDesktop === null ? (
        <div className="flex min-h-screen items-center justify-center text-xs font-bold text-amber-400 animate-pulse">Loading FCL Records...</div>
      ) : isDesktop ? (
        <DesktopRecords players={players} tournamentsData={tournamentsData} teamCounts={teamCounts} loading={loading} onSelect={handleSelect} />
      ) : (
        <MobileRecords players={players} tournamentsData={tournamentsData} teamCounts={teamCounts} loading={loading} onSelect={handleSelect} />
      )}
      <PlayerCardModal selectedPlayer={selectedPlayer} onClose={() => setSelectedPlayer(null)} tournamentsData={tournamentsData || []} allPlayers={players || []} />
    </div>
  );
}