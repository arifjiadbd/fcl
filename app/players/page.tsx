"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import PlayerCardModal from "../../components/PlayerCardModal";

/* ───────────────────────── Types ───────────────────────── */

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

/* ───────────────────── Role & points logic ───────────────────── */

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

  if (runAvg >= 13 && wkAvg >= 1.5) {
    return "VIP All-Rounder";
  } else if (runAvg >= 9 && wkAvg >= 1.2) {
    return "Bowling All-Rounder";
  } else if (runAvg >= 9 && wkAvg >= 0.8) {
    return "All-Rounder";
  } else if (runAvg > 10 && wkAvg < 0.8) {
    return "Batsman";
  } else if (runAvg < 10 && wkAvg >= 1.0) {
    return "Bowler";
  } else {
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

/* ───────────────────────── Constants ───────────────────────── */

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
  { key: "name", label: "Name (A–Z)", short: "A–Z", icon: "🔤" },
  { key: "points", label: "FCL Points", short: "Points", icon: "💯" },
  { key: "runs", label: "Most Runs", short: "Runs", icon: "🏏" },
  { key: "wickets", label: "Most Wickets", short: "Wickets", icon: "🎯" },
  { key: "matches", label: "Most Matches", short: "Matches", icon: "⚡" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];
type ViewKey = "grid" | "list";

const ROLE_STYLE: Record<
  string,
  { badge: string; bar: string; dot: string; text: string; ring: string; icon: string; rule: string }
> = {
  "VIP All-Rounder": {
    badge: "border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-300",
    bar: "bg-amber-400",
    dot: "bg-amber-400",
    text: "text-amber-500 dark:text-amber-400",
    ring: "border-amber-400/50 bg-amber-500/10",
    icon: "👑",
    rule: "Batting Avg ≥ 13 and Wicket Avg ≥ 1.5",
  },
  "Bowling All-Rounder": {
    badge: "border-violet-400/40 bg-violet-400/10 text-violet-600 dark:text-violet-300",
    bar: "bg-violet-400",
    dot: "bg-violet-400",
    text: "text-violet-500 dark:text-violet-400",
    ring: "border-violet-400/50 bg-violet-500/10",
    icon: "⚡",
    rule: "Batting Avg ≥ 9 and Wicket Avg ≥ 1.2",
  },
  "All-Rounder": {
    badge: "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300",
    bar: "bg-emerald-400",
    dot: "bg-emerald-400",
    text: "text-emerald-500 dark:text-emerald-400",
    ring: "border-emerald-400/50 bg-emerald-500/10",
    icon: "⭐",
    rule: "Batting Avg ≥ 9 and Wicket Avg ≥ 0.8",
  },
  Batsman: {
    badge: "border-sky-400/40 bg-sky-400/10 text-sky-600 dark:text-sky-300",
    bar: "bg-sky-400",
    dot: "bg-sky-400",
    text: "text-sky-500 dark:text-sky-400",
    ring: "border-sky-400/50 bg-sky-500/10",
    icon: "🛡️",
    rule: "Batting Avg > 10 and Wicket Avg < 0.8",
  },
  Bowler: {
    badge: "border-rose-400/40 bg-rose-400/10 text-rose-600 dark:text-rose-300",
    bar: "bg-rose-400",
    dot: "bg-rose-400",
    text: "text-rose-500 dark:text-rose-400",
    ring: "border-rose-400/50 bg-rose-500/10",
    icon: "🎯",
    rule: "Wicket Avg ≥ 1.0 and Batting Avg < 10",
  },
  "Promising Player": {
    badge: "border-slate-400/40 bg-slate-400/10 text-slate-600 dark:text-slate-300",
    bar: "bg-slate-400",
    dot: "bg-slate-400",
    text: "text-slate-500 dark:text-slate-300",
    ring: "border-slate-400/50 bg-slate-500/10",
    icon: "🌱",
    rule: "Other developing or rookie players",
  },
};

const getRoleStyle = (role: string) => ROLE_STYLE[role] || ROLE_STYLE["Promising Player"];

const RANK_STYLE = [
  "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
  "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900",
  "bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950",
];

/* ───────────────────────── Hooks ───────────────────────── */

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/* ───────────────────────── Small UI pieces ───────────────────────── */

const PLACEHOLDER = "/FCL Cricket Avatar Placeholder.jpg";

function Avatar({ player, className }: { player: Player; className: string }) {
  const [failed, setFailed] = useState(false);
  const rawPhoto = player.photo || player.photoUrl;
  const photoPath =
    rawPhoto && rawPhoto !== "—" && rawPhoto !== ""
      ? rawPhoto.startsWith("/")
        ? rawPhoto
        : `/players/${rawPhoto}`
      : PLACEHOLDER;

  return (
    <div
      className={`relative shrink-0 overflow-hidden border border-[#1877F2]/40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#16224a] dark:to-[#0b1220] ${className}`}
    >
      <img
        src={failed ? PLACEHOLDER : photoPath}
        alt={player.name}
        loading="lazy"
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function RoleBadge({ role, small }: { role: string; small?: boolean }) {
  const s = getRoleStyle(role);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-bold ${s.badge} ${
        small ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {role || "Player"}
    </span>
  );
}

function RankChip({ rank }: { rank: number }) {
  const cls = rank <= 3 ? RANK_STYLE[rank - 1] : "bg-slate-100 text-slate-500 dark:bg-[#172033] dark:text-[#94a3b8]";
  return (
    <span
      className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-black tabular-nums ${cls}`}
    >
      {rank}
    </span>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "amber" | "blue";
}) {
  const color =
    tone === "amber"
      ? "text-amber-600 dark:text-[#f59e0b]"
      : tone === "blue"
      ? "text-[#1877F2] dark:text-[#60a5fa]"
      : "text-slate-900 dark:text-white";
  return (
    <div className="rounded-2xl bg-slate-50 px-2 py-2 text-center dark:bg-[#0f1830]">
      <p className={`text-sm font-black tabular-nums leading-none ${color}`}>{value}</p>
      <p className="mt-1 text-[9px] font-medium text-slate-400 dark:text-[#64748b]">{label}</p>
    </div>
  );
}

const Icon = {
  search: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  grid: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  list: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

function ViewToggle({ view, setView }: { view: ViewKey; setView: (v: ViewKey) => void }) {
  return (
    <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 dark:border-[#1e293b] dark:bg-[#0b1220]">
      {(["grid", "list"] as const).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          aria-label={`${v} view`}
          aria-pressed={view === v}
          className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] px-3 py-2 text-xs font-bold transition ${
            view === v
              ? "bg-[#1877F2] text-white shadow shadow-[#1877F2]/30"
              : "text-slate-500 hover:text-slate-900 dark:text-[#94a3b8] dark:hover:text-white"
          }`}
        >
          {Icon[v]}
          {v === "grid" ? "Cards" : "List"}
        </button>
      ))}
    </div>
  );
}

function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-[28px] border border-slate-200 bg-white p-5 shadow-2xl dark:border-[#1e293b] dark:bg-[#0b1220] md:max-w-2xl md:rounded-[28px] md:p-7">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300 dark:bg-[#1e293b] md:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-[#172033] dark:text-[#94a3b8] dark:hover:text-white"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CriteriaContent() {
  const roles = ROLES.filter((r) => r !== "All");
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-slate-500 dark:text-[#94a3b8]">
        Roles are assigned automatically from each player’s batting average and wickets per match.
      </p>
      {roles.map((r) => {
        const s = getRoleStyle(r);
        return (
          <div key={r} className={`flex items-center gap-3 rounded-2xl border p-3.5 ${s.ring}`}>
            <span className="text-xl">{s.icon}</span>
            <div className="min-w-0">
              <p className={`text-sm font-black ${s.text}`}>{r}</p>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{s.rule}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Player views ───────────────────────── */

type ItemProps = {
  player: Player;
  rank: number;
  showRank: boolean;
  maxPoints: number;
  onOpen: (p: Player) => void;
};

/* 🖥️ পিসি কার্ড: সমস্ত ইনফরমেশন ও স্ট্যাটস সমেত পূর্ণাঙ্গ রূপ */
function DesktopCard({ player, rank, showRank, maxPoints, onOpen }: ItemProps) {
  const s = getRoleStyle(player.role);
  const points = calculateFclPoints(player);
  const pct = maxPoints > 0 ? Math.max(4, (points / maxPoints) * 100) : 0;
  return (
    <button
      onClick={() => onOpen(player)}
      className="group relative flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/60 hover:shadow-2xl hover:shadow-[#1877F2]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] dark:border-[#1e293b] dark:bg-[#0b1220]"
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${s.bar} opacity-80`} />
      {showRank && (
        <span className="absolute right-5 top-5">
          <RankChip rank={rank} />
        </span>
      )}

      <div className="flex items-center gap-4">
        <Avatar player={player} className="h-[72px] w-[72px] rounded-3xl" />
        <div className="min-w-0 flex-1 pr-6">
          <h3 className="break-words text-base font-black leading-tight transition group-hover:text-[#60a5fa]">
            {player.name}
          </h3>
          {player.nickName && (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-[#94a3b8]">@{player.nickName}</p>
          )}
          <div className="mt-2">
            <RoleBadge role={player.role} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Tile label="Matches" value={Number(player.matches) || 0} />
        <Tile label="Runs (Max)" value={`${Number(player.runs) || 0} (${player.maxRuns || 0})`} tone="blue" />
        <Tile label="Wickets (Max)" value={`${Number(player.wickets) || 0} (${player.maxWickets || 0})`} tone="amber" />
        <Tile label="Innings / NO" value={`${player.innings || 0} / ${player.notOut || 0}`} />
        <Tile label="Boundaries" value={`4s:${player.fours || 0} | 6s:${player.sixes || 0}`} />
        <Tile label="Tournaments" value={player.totalTournament || 0} />
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-end justify-between">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-[#64748b]">FCL Points</span>
          <span className="text-lg font-black tabular-nums text-[#1877F2] dark:text-[#60a5fa]">
            {points.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-[#172033]">
          <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <span className="mt-4 text-center text-[11px] font-bold text-[#1877F2] opacity-0 transition group-hover:opacity-100 dark:text-[#60a5fa]">
        View Official Card
      </span>
    </button>
  );
}

function DesktopRow({ player, rank, showRank, onOpen }: ItemProps) {
  return (
    <li>
      <button
        onClick={() => onOpen(player)}
        className="group grid w-full grid-cols-[40px_minmax(0,2.4fr)_1.4fr_repeat(4,0.7fr)] items-center gap-3 px-6 py-3.5 text-left transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none dark:hover:bg-[#0f1830] dark:focus-visible:bg-[#0f1830]"
      >
        <span>{showRank ? <RankChip rank={rank} /> : null}</span>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar player={player} className="h-11 w-11 rounded-2xl" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold transition group-hover:text-[#60a5fa]">{player.name}</p>
            {player.nickName && (
              <p className="truncate text-[11px] text-slate-500 dark:text-[#94a3b8]">@{player.nickName}</p>
            )}
          </div>
        </div>
        <RoleBadge role={player.role} small />
        <span className="text-right text-sm font-semibold tabular-nums">{player.matches ?? 0}</span>
        <span className="text-right text-sm font-semibold tabular-nums">{player.runs ?? 0}</span>
        <span className="text-right text-sm font-semibold tabular-nums text-amber-600 dark:text-[#f59e0b]">
          {player.wickets ?? 0}
        </span>
        <span className="text-right text-sm font-black tabular-nums text-[#60a5fa]">
          {calculateFclPoints(player).toLocaleString()}
        </span>
      </button>
    </li>
  );
}

/* ───────── 📱 মোবাইল কার্ড (লাইট/ডার্ক দুই মোডেই কাজ করে) ───────── */
function MobilePlayerCard({ player, rank, showRank, onOpen }: ItemProps) {
  const s = getRoleStyle(player.role);
  const points = calculateFclPoints(player);
  return (
    <button
      onClick={() => onOpen(player)}
      className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 pl-4 text-left shadow-sm transition active:scale-[0.98] dark:border-[#1e293b] dark:bg-[#0b1220]"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${s.bar}`} />

      <div className="relative shrink-0">
        <Avatar player={player} className="h-14 w-14 rounded-2xl" />
        {showRank && (
          <span className="absolute -left-1.5 -top-1.5">
            <RankChip rank={rank} />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-black">{player.name}</h4>
        <div className="mt-1 flex items-center gap-1.5">
          <RoleBadge role={player.role} small />
          {player.nickName && (
            <span className="truncate text-[10px] text-slate-500 dark:text-[#94a3b8]">@{player.nickName}</span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 dark:bg-[#172033] dark:text-slate-300">
            M {Number(player.matches) || 0}
          </span>
          <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-sky-600 dark:text-sky-300">
            R {Number(player.runs) || 0}
          </span>
          <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-amber-600 dark:text-amber-300">
            W {Number(player.wickets) || 0}
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-lg font-black leading-none tabular-nums text-[#1877F2] dark:text-[#60a5fa]">
          {points.toLocaleString()}
        </p>
        <p className="mt-1 text-[9px] font-semibold text-slate-400 dark:text-[#64748b]">FCL Points</p>
      </div>
    </button>
  );
}

/* ───────── 📱 মোবাইল ফিল্টার + সর্ট প্যানেল ─────────
   • All বাটন আলাদা, পুরো প্রস্থে
   • বাকি ৬টা রোল ৩ কলাম × ২ সারিতে
   • সর্টিং এখন সরাসরি স্ক্রিনেই                              */
function MobileFilterPanel({
  selectedRole,
  setSelectedRole,
  sortBy,
  setSortBy,
  roleCounts,
}: {
  selectedRole: string;
  setSelectedRole: (r: string) => void;
  sortBy: SortKey;
  setSortBy: (k: SortKey) => void;
  roleCounts: Record<string, number>;
}) {
  const roles = ROLES.filter((r) => r !== "All");
  const allActive = selectedRole === "All";

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-[#1e293b] dark:bg-[#0b1220]/80">
      {/* All বাটন */}
      <button
        onClick={() => setSelectedRole("All")}
        aria-pressed={allActive}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition active:scale-[0.98] ${
          allActive
            ? "border-[#1877F2] bg-gradient-to-r from-[#1877F2] to-[#3b82f6] text-white shadow-lg shadow-[#1877F2]/30"
            : "border-slate-200 bg-slate-50 text-slate-700 dark:border-[#1e293b] dark:bg-[#0f1830] dark:text-slate-200"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <span className="text-lg">🌐</span>
          <span className="text-sm font-black">All Players</span>
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-black tabular-nums ${
            allActive ? "bg-white/25" : "bg-slate-200 text-slate-600 dark:bg-[#172033] dark:text-[#94a3b8]"
          }`}
        >
          {roleCounts.All ?? 0}
        </span>
      </button>

      {/* ৬টা রোল, ৩ × ২ */}
      <div className="grid grid-cols-3 gap-2">
        {roles.map((role) => {
          const s = getRoleStyle(role);
          const active = selectedRole === role;
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              aria-pressed={active}
              className={`relative flex flex-col items-center gap-1.5 overflow-hidden rounded-2xl border px-1.5 pb-2.5 pt-3 transition active:scale-95 ${
                active
                  ? `${s.ring} shadow-md`
                  : "border-slate-200 bg-white dark:border-[#1e293b] dark:bg-[#0b1220]"
              }`}
            >
              {active && <span className={`absolute inset-x-0 top-0 h-[3px] ${s.bar}`} />}
              <span className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg ${s.ring}`}>
                {s.icon}
              </span>
              <span
                className={`flex min-h-[24px] items-center text-center text-[10px] font-black leading-tight ${
                  active ? s.text : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {role}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                  active
                    ? "bg-white/40 text-slate-700 dark:bg-white/15 dark:text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-[#172033] dark:text-[#94a3b8]"
                }`}
              >
                {roleCounts[role] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* সর্টিং */}
      <div>
        <p className="mb-2 px-0.5 text-[11px] font-bold text-slate-500 dark:text-[#94a3b8]">Sort by</p>
        <div className="-mx-3.5 flex gap-2 overflow-x-auto px-3.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SORTS.map((s) => {
            const active = sortBy === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-bold transition active:scale-95 ${
                  active
                    ? "border-amber-400 bg-gradient-to-br from-amber-400/25 to-amber-500/10 text-amber-500 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 dark:border-[#1e293b] dark:bg-[#0b1220] dark:text-[#94a3b8]"
                }`}
              >
                <span className="text-sm">{s.icon}</span>
                {s.short}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [view, setView] = useState<ViewKey>("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showCriteria, setShowCriteria] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1024px)");

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

        processedPlayers.sort((a, b) =>
          (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase())
        );

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

  const totals = useMemo(
    () => ({
      matches: players.reduce((a, p) => a + (Number(p.matches) || 0), 0),
      runs: players.reduce((a, p) => a + (Number(p.runs) || 0), 0),
      wickets: players.reduce((a, p) => a + (Number(p.wickets) || 0), 0),
    }),
    [players]
  );

  const maxPoints = useMemo(
    () => players.reduce((m, p) => Math.max(m, calculateFclPoints(p)), 0),
    [players]
  );

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
  const hasActiveFilter = isFiltering || sortBy !== "name";
  const showRank = sortBy !== "name";

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedRole("All");
  }, []);

  const open = useCallback((p: Player) => setSelectedPlayer(p), []);

  const itemProps = (player: Player, idx: number): ItemProps => ({
    player,
    rank: idx + 1,
    showRank,
    maxPoints,
    onOpen: open,
  });

  const headerStats = [
    { label: "Players", value: players.length, icon: "👥", color: "text-[#1877F2] dark:text-[#60a5fa]" },
    { label: "Matches", value: totals.matches, icon: "⚡", color: "text-emerald-600 dark:text-emerald-300" },
    { label: "Runs", value: totals.runs, icon: "🏏", color: "text-sky-600 dark:text-sky-300" },
    { label: "Wickets", value: totals.wickets, icon: "🎯", color: "text-amber-600 dark:text-amber-300" },
  ];

  const SearchBox = (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#64748b]">
        {Icon.search}
      </span>
      <input
        type="text"
        placeholder="Search name or nickname"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#1877F2] focus:outline-none focus:ring-1 focus:ring-[#1877F2] dark:border-[#1e293b] dark:bg-[#0b1220] dark:text-white dark:placeholder-[#64748b]"
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
  );

  /* পিসি সাইডবারের সর্ট বাটন */
  const SortButtons = (
    <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
      {SORTS.map((s) => {
        const active = sortBy === s.key;
        return (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            aria-pressed={active}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-center transition ${
              active
                ? "border-amber-400 bg-gradient-to-br from-amber-400/20 to-amber-500/10 text-amber-500 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-[#1e293b] dark:bg-[#0b1220] dark:text-[#94a3b8] dark:hover:text-white"
            }`}
          >
            <span className="text-sm">{s.icon}</span>
            <span className="text-[11px] font-bold">{s.short}</span>
          </button>
        );
      })}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {Array.from({ length: isDesktop ? 6 : 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b1220]"
            />
          ))}
        </div>
      );
    }

    if (filteredPlayers.length === 0) {
      return (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-[#1e293b] dark:bg-[#0b1220]">
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
      );
    }

    if (isDesktop) {
      if (view === "grid") {
        return (
          <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
            {visiblePlayers.map((p, i) => (
              <DesktopCard key={p.id ?? p.name + i} {...itemProps(p, i)} />
            ))}
          </div>
        );
      }
      return (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white dark:border-[#1e293b] dark:bg-[#0b1220]">
          <div className="grid grid-cols-[40px_minmax(0,2.4fr)_1.4fr_repeat(4,0.7fr)] items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-semibold text-slate-500 dark:border-[#1e293b] dark:bg-[#0a1020] dark:text-[#64748b]">
            <span>#</span>
            <span>Player</span>
            <span>Role</span>
            <span className="text-right">Matches</span>
            <span className="text-right">Runs</span>
            <span className="text-right">Wickets</span>
            <span className="text-right">Points</span>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-[#172033]">
            {visiblePlayers.map((p, i) => (
              <DesktopRow key={p.id ?? p.name + i} {...itemProps(p, i)} />
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {visiblePlayers.map((p, i) => (
          <MobilePlayerCard key={p.id ?? p.name + i} {...itemProps(p, i)} />
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(ellipse_at_top,rgba(24,119,242,0.16),transparent_65%)]" />

      <main className="relative mx-auto max-w-[1400px] px-4 pb-32 pt-6 sm:px-6 lg:px-10 lg:pb-20 lg:pt-12">
        <header className="mb-6 lg:mb-10">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-3 py-1 text-[11px] font-semibold text-[#60a5fa]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#60a5fa]" />
                FCL Community Roster
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-6xl">Player Directory</h1>
              <p className="mt-2 hidden text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8] sm:block lg:text-base">
                Search any player, filter by role, and open a profile to view and download the Official Card.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3 lg:mt-8 lg:max-w-3xl lg:gap-4">
            {headerStats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm dark:border-[#1e293b] dark:bg-[#0b1220]/80 lg:rounded-3xl lg:px-5 lg:py-4 lg:text-left"
              >
                <p className="text-base leading-none lg:hidden">{s.icon}</p>
                <p className={`mt-1.5 text-lg font-black tabular-nums leading-none lg:mt-0 lg:text-3xl ${s.color}`}>
                  {loading ? "–" : s.value.toLocaleString()}
                </p>
                <p className="mt-1.5 text-[10px] font-medium text-slate-500 dark:text-[#94a3b8] lg:text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-5">
              <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1e293b] dark:bg-[#0b1220]">
                {SearchBox}

                <div>
                  <p className="mb-2.5 text-xs font-bold text-slate-500 dark:text-[#94a3b8]">Role</p>
                  <div className="space-y-1">
                    {ROLES.map((role) => {
                      const active = selectedRole === role;
                      const st = role === "All" ? null : getRoleStyle(role);
                      return (
                        <button
                          key={role}
                          onClick={() => setSelectedRole(role)}
                          aria-pressed={active}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${
                            active
                              ? "bg-[#1877F2] text-white shadow shadow-[#1877F2]/25"
                              : "text-slate-600 hover:bg-slate-100 dark:text-[#94a3b8] dark:hover:bg-[#101a33] dark:hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="w-4 text-center">{st ? st.icon : "🏏"}</span>
                            {role}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              active ? "bg-white/20" : "bg-slate-100 text-slate-500 dark:bg-[#172033] dark:text-[#94a3b8]"
                            }`}
                          >
                            {roleCounts[role] ?? 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2.5 text-xs font-bold text-slate-500 dark:text-[#94a3b8]">Sort by</p>
                  {SortButtons}
                </div>

                <div>
                  <p className="mb-2.5 text-xs font-bold text-slate-500 dark:text-[#94a3b8]">Layout</p>
                  <ViewToggle view={view} setView={setView} />
                </div>

                <button
                  onClick={() => setShowCriteria(true)}
                  className="w-full rounded-xl border border-[#1877F2]/40 bg-[#1877F2]/10 px-4 py-2.5 text-xs font-bold text-[#60a5fa] transition hover:bg-[#1877F2]/20"
                >
                  How roles are determined
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-amber-400/40 bg-gradient-to-br from-amber-400/15 via-[#1877F2]/10 to-transparent p-5">
                <span className="text-3xl">⚔️</span>
                <h2 className="mt-3 text-sm font-black leading-snug">অকশনের আগে খেলোয়াড়দের পারফরম্যান্স তুলনা করুন!</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-[#94a3b8]">
                  একাধিক খেলোয়াড়ের স্ট্যাটস পাশাপাশি যাচাই করে সেরা স্কোয়াড গড়ে তুলুন।
                </p>
                <Link
                  href="/players/compare"
                  className="mt-4 flex items-center justify-center rounded-2xl bg-[#1877F2] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#1877F2]/30 transition hover:bg-blue-600"
                >
                  তুলনা শুরু করুন →
                </Link>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            {/* 📱 মোবাইল: শুধু সার্চ বার sticky */}
            <div className="sticky top-0 z-30 -mx-4 mb-3 border-b border-slate-200/70 bg-slate-50/90 px-4 pb-3 pt-3 backdrop-blur-xl dark:border-[#1e293b]/70 dark:bg-[#020617]/90 sm:-mx-6 sm:px-6 lg:hidden">
              {SearchBox}
            </div>

            {/* 📱 মোবাইল: রোল + সর্ট প্যানেল */}
            <div className="mb-4 lg:hidden">
              <MobileFilterPanel
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                sortBy={sortBy}
                setSortBy={setSortBy}
                roleCounts={roleCounts}
              />
            </div>

            {!loading && filteredPlayers.length > 0 && (
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500 dark:text-[#94a3b8]">
                <p>
                  Showing <span className="font-bold text-slate-900 dark:text-white">{visiblePlayers.length}</span> of{" "}
                  <span className="font-bold text-slate-900 dark:text-white">{filteredPlayers.length}</span> players
                  {sortBy !== "name" && (
                    <span className="ml-2 rounded-full bg-[#1877F2]/10 px-2 py-0.5 font-bold text-[#60a5fa]">
                      {SORTS.find((s) => s.key === sortBy)?.label}
                    </span>
                  )}
                </p>
                {hasActiveFilter && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setSortBy("name");
                    }}
                    className="font-semibold text-[#1877F2] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            {renderContent()}

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
                    className="rounded-2xl bg-[#1877F2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:bg-[#1877F2]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
                  >
                    Show {Math.min(PAGE_SIZE, remaining)} more
                  </button>
                  <button
                    onClick={() => setVisibleCount(filteredPlayers.length)}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#1877F2]/40 dark:border-[#1e293b] dark:bg-[#0b1220] dark:text-[#94a3b8] dark:hover:text-white"
                  >
                    Show all ({remaining} left)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl dark:border-[#1e293b] dark:bg-[#0b1220]/90">
          <Link
            href="/players/compare"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1877F2] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#1877F2]/30"
          >
            <span>⚔️</span> তুলনা করুন
          </Link>
          <button
            onClick={() => setShowCriteria(true)}
            aria-label="How roles are determined"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base font-black text-[#1877F2] dark:bg-[#172033] dark:text-[#60a5fa]"
          >
            ?
          </button>
        </div>
      </div>

      <Sheet open={showCriteria} onClose={() => setShowCriteria(false)} title="How roles are determined">
        <CriteriaContent />
      </Sheet>

      <PlayerCardModal
        selectedPlayer={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        tournamentsData={tournamentsData || []}
        allPlayers={players || []}
      />
    </div>
  );
}