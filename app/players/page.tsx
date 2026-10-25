"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import Link from "next/link";
import PlayerCardModal from "../../components/PlayerCardModal";

/* ============================================================
   TYPES
============================================================ */

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

type SortKey =
  | "name"
  | "points"
  | "runs"
  | "wickets"
  | "matches";

type ViewKey = "grid" | "list";

/* ============================================================
   CONSTANTS
============================================================ */

const PAGE_SIZE = 12;

const PLACEHOLDER =
  "/FCL Cricket Avatar Placeholder.jpg";

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
  {
    key: "name",
    label: "Name (A–Z)",
    short: "A–Z",
    icon: "🔤",
  },
  {
    key: "points",
    label: "FCL Points",
    short: "Points",
    icon: "⭐",
  },
  {
    key: "runs",
    label: "Most Runs",
    short: "Runs",
    icon: "🏏",
  },
  {
    key: "wickets",
    label: "Most Wickets",
    short: "Wickets",
    icon: "🎯",
  },
  {
    key: "matches",
    label: "Most Matches",
    short: "Matches",
    icon: "⚡",
  },
] as const;

const ROLE_STYLE: Record<
  string,
  {
    color: string;
    icon: string;
    rule: string;
  }
> = {
  "VIP All-Rounder": {
    color: "#f59e0b",
    icon: "👑",
    rule:
      "Batting Avg ≥ 13 and Wickets Per Match ≥ 1.5",
  },
  "Bowling All-Rounder": {
    color: "#a855f7",
    icon: "⚡",
    rule:
      "Batting Avg ≥ 9 and Wickets Per Match ≥ 1.2",
  },
  "All-Rounder": {
    color: "#22c55e",
    icon: "⭐",
    rule:
      "Batting Avg ≥ 9 and Wickets Per Match ≥ 0.8",
  },
  Batsman: {
    color: "#38bdf8",
    icon: "🏏",
    rule:
      "Batting Avg > 10 and Wickets Per Match < 0.8",
  },
  Bowler: {
    color: "#f43f5e",
    icon: "🎯",
    rule:
      "Batting Avg < 10 and Wickets Per Match ≥ 1.0",
  },
  "Promising Player": {
    color: "#94a3b8",
    icon: "🌱",
    rule:
      "Other developing or rookie players",
  },
};

const RANK_STYLE = [
  "from-amber-300 to-amber-500 text-amber-950",
  "from-slate-200 to-slate-400 text-slate-900",
  "from-orange-300 to-orange-600 text-orange-950",
];

function getRoleStyle(role: string) {
  return (
    ROLE_STYLE[role] ||
    ROLE_STYLE["Promising Player"]
  );
}

/* ============================================================
   THEME DETECTION
============================================================ */

function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const read = () => {
      const h = document.documentElement;
      const b = document.body;

      const theme = (
        h.getAttribute("data-theme") ||
        h.getAttribute("data-mode") ||
        b.getAttribute("data-theme") ||
        ""
      ).toLowerCase();

      if (theme === "dark") return true;
      if (theme === "light") return false;

      const classes =
        `${h.className} ${b.className}`.toLowerCase();

      if (/\blight\b/.test(classes)) return false;
      if (/\bdark\b/.test(classes)) return true;

      const scheme = h.style.colorScheme;

      if (scheme === "light") return false;
      if (scheme === "dark") return true;

      try {
        const saved = localStorage.getItem("theme");

        if (saved === "light") return false;
        if (saved === "dark") return true;
      } catch {}

      return window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
    };

    const update = () => setIsDark(read());

    update();

    const observer = new MutationObserver(update);

    const options = {
      attributes: true,
      attributeFilter: [
        "class",
        "data-theme",
        "data-mode",
        "style",
      ],
    };

    observer.observe(
      document.documentElement,
      options
    );

    observer.observe(document.body, options);

    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    media.addEventListener("change", update);
    window.addEventListener("storage", update);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return isDark;
}

/* ============================================================
   MEDIA QUERY
============================================================ */

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    const update = () => setMatches(media.matches);

    update();

    media.addEventListener("change", update);

    return () =>
      media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/* ============================================================
   PLAYER CALCULATIONS
============================================================ */

function getAutomaticRole(player: Player): string {
  const matches = Number(player.matches) || 0;

  if (matches === 0) {
    return "Promising Player";
  }

  const runs = Number(player.runs) || 0;
  const wickets = Number(player.wickets) || 0;
  const innings = Number(player.innings) || 0;
  const notOut = Number(player.notOut) || 0;

  const dismissals = innings - notOut;

  const battingAvg =
    dismissals > 0
      ? runs / dismissals
      : innings > 0
      ? runs / innings
      : 0;

  const wicketsPerMatch = wickets / matches;

  if (
    battingAvg >= 13 &&
    wicketsPerMatch >= 1.5
  ) {
    return "VIP All-Rounder";
  }

  if (
    battingAvg >= 9 &&
    wicketsPerMatch >= 1.2
  ) {
    return "Bowling All-Rounder";
  }

  if (
    battingAvg >= 9 &&
    wicketsPerMatch >= 0.8
  ) {
    return "All-Rounder";
  }

  if (
    battingAvg > 10 &&
    wicketsPerMatch < 0.8
  ) {
    return "Batsman";
  }

  if (
    battingAvg < 10 &&
    wicketsPerMatch >= 1
  ) {
    return "Bowler";
  }

  return "Promising Player";
}

function calculateFclPoints(player: Player): number {
  const runs = Number(player.runs) || 0;
  const sixes = Number(player.sixes) || 0;
  const fours = Number(player.fours) || 0;
  const wickets = Number(player.wickets) || 0;
  const matches = Number(player.matches) || 0;

  const champion = Number(player.champion) || 0;
  const runnersUp = Number(player.runnersUp) || 0;

  const motCpot =
    (Number(player.mot) || 0) +
    (Number(player.cpot) || 0);

  const highestRuns =
    Number(player.highestRunScorer) || 0;

  const topWickets =
    Number(player.topWicketTaker) || 0;

  return Math.round(
    runs +
      sixes * 2 +
      fours +
      wickets * 20 +
      matches * 2 +
      champion * 100 +
      runnersUp * 40 +
      motCpot * 60 +
      highestRuns * 30 +
      topWickets * 30
  );
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

/* ============================================================
   PLAYER AVATAR
============================================================ */

function getPhotoPath(player: Player) {
  const raw = player.photo || player.photoUrl;

  if (
    !raw ||
    raw.trim() === "" ||
    raw === "—"
  ) {
    return PLACEHOLDER;
  }

  if (
    raw.startsWith("/") ||
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }

  return `/players/${raw}`;
}

function Avatar({
  player,
  className = "",
}: {
  player: Player;
  className?: string;
}) {
  const photoPath = getPhotoPath(player);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoPath]);

  return (
    <div
      className={`pl-avatar relative shrink-0 overflow-hidden border border-[#1877F2]/30 ${className}`}
    >
      <img
        src={failed ? PLACEHOLDER : photoPath}
        alt={player.name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/* ============================================================
   ROLE BADGE
============================================================ */

function RoleBadge({
  role,
  small = false,
}: {
  role: string;
  small?: boolean;
}) {
  const style = getRoleStyle(role);

  return (
    <span
      className={`pl-role-badge inline-flex max-w-full items-center gap-1.5 rounded-full border font-black ${
        small
          ? "px-2 py-1 text-[9px]"
          : "px-3 py-1.5 text-[10px]"
      }`}
      style={
        {
          "--accent": style.color,
          borderColor: `${style.color}45`,
          backgroundColor: `${style.color}13`,
        } as CSSProperties
      }
    >
      <span>{style.icon}</span>

      <span className="truncate">
        {role || "Player"}
      </span>
    </span>
  );
}

/* ============================================================
   RANK CHIP
============================================================ */

function RankChip({ rank }: { rank: number }) {
  return (
    <span
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-black shadow-sm ${
        rank <= 3
          ? `bg-gradient-to-br ${RANK_STYLE[rank - 1]}`
          : "pl-rank"
      }`}
    >
      {rank}
    </span>
  );
}

/* ============================================================
   STAT TILE
============================================================ */

function StatTile({
  label,
  value,
  color = "#1877F2",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="pl-stat-tile min-w-0 rounded-xl border px-2 py-3 text-center">
      <p
        className="break-words text-[13px] font-black leading-tight sm:text-base"
        style={{ color }}
      >
        {value}
      </p>

      <p className="pl-muted mt-1 text-[9px] font-semibold">
        {label}
      </p>
    </div>
  );
}

/* ============================================================
   VIEW TOGGLE
============================================================ */

function ViewToggle({
  view,
  setView,
}: {
  view: ViewKey;
  setView: (view: ViewKey) => void;
}) {
  return (
    <div className="pl-view-toggle flex rounded-xl border p-1">
      {(["grid", "list"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setView(item)}
          aria-pressed={view === item}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-black transition-all ${
            view === item
              ? "bg-[#1877F2] text-white shadow-lg shadow-blue-500/20"
              : "pl-muted"
          }`}
        >
          <span>
            {item === "grid" ? "▦" : "☷"}
          </span>

          {item === "grid" ? "Cards" : "List"}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   CRITERIA MODAL
============================================================ */

function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    const previousFocus =
      document.activeElement as HTMLElement | null;

    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (
        event.key === "Tab" &&
        dialogRef.current
      ) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input, select, [tabindex]:not([tabindex="-1"])'
          )
        );

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKey
      );

      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pl-sheet-title"
        className="pl-sheet relative flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] border shadow-2xl sm:rounded-[28px]"
      >
        <div className="h-1 shrink-0 bg-gradient-to-r from-[#1877F2] via-cyan-400 to-amber-400" />

        <div className="pl-sheet-header flex items-center justify-between gap-3 border-b px-5 py-5 sm:px-7">
          <div>
            <p className="pl-blue text-[9px] font-black uppercase tracking-[0.2em]">
              FCL PLAYER CLASSIFICATION
            </p>

            <h3
              id="pl-sheet-title"
              className="pl-heading mt-1 text-lg font-black"
            >
              {title}
            </h3>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="pl-close flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition hover:rotate-90"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}

function CriteriaContent() {
  return (
    <div>
      <p className="pl-muted mb-5 text-xs leading-6">
        FCL-এর প্রতিটি প্লেয়ারের ব্যাটিং এভারেজ এবং
        প্রতি ম্যাচে উইকেটের গড় অনুযায়ী স্বয়ংক্রিয়ভাবে
        Role নির্ধারণ করা হয়।
      </p>

      <div className="space-y-3">
        {ROLES.filter((role) => role !== "All").map(
          (role) => {
            const style = getRoleStyle(role);

            return (
              <div
                key={role}
                className="pl-criteria-item flex items-center gap-3 rounded-2xl border p-4"
                style={
                  {
                    "--accent": style.color,
                    borderColor: `${style.color}40`,
                    backgroundColor: `${style.color}08`,
                  } as CSSProperties
                }
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl"
                  style={{
                    borderColor: `${style.color}40`,
                    backgroundColor: `${style.color}15`,
                  }}
                >
                  {style.icon}
                </div>

                <div className="min-w-0">
                  <h4 className="pl-role-text text-sm font-black">
                    {role}
                  </h4>

                  <p className="pl-muted mt-1 text-[11px] leading-5">
                    {style.rule}
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

/* ============================================================
   DESKTOP PLAYER CARD
============================================================ */

interface ItemProps {
  player: Player;
  rank: number;
  showRank: boolean;
  maxPoints: number;
  onOpen: (player: Player) => void;
}

function DesktopCard({
  player,
  rank,
  showRank,
  maxPoints,
  onOpen,
}: ItemProps) {
  const style = getRoleStyle(player.role);

  const points = calculateFclPoints(player);

  const percentage =
    maxPoints > 0
      ? Math.min(
          100,
          Math.max(0, (points / maxPoints) * 100)
        )
      : 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(player)}
      className="pl-player-card group relative flex h-full flex-col overflow-hidden rounded-[26px] border p-5 text-left transition-all duration-500 hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]"
      style={
        {
          "--accent": style.color,
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, ${style.color}, transparent)`,
        }}
      />

      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-[65px]"
        style={{ backgroundColor: style.color }}
      />

      {showRank && (
        <span className="absolute right-4 top-4 z-10">
          <RankChip rank={rank} />
        </span>
      )}

      <div className="relative flex items-center gap-3.5">
        <Avatar
          player={player}
          className="h-[72px] w-[72px] rounded-[20px]"
        />

        <div className="min-w-0 flex-1">
          <h3 className="pl-heading line-clamp-2 break-words text-[15px] font-black leading-snug transition-colors group-hover:text-[#1877F2]">
            {player.name}
          </h3>

          {player.nickName && (
            <p className="pl-muted mt-1 truncate text-[11px]">
              @{player.nickName}
            </p>
          )}

          <div className="mt-2">
            <RoleBadge role={player.role} />
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2">
        <StatTile
          label="Matches"
          value={Number(player.matches) || 0}
        />

        <StatTile
          label="Runs (Max)"
          value={`${Number(player.runs) || 0} (${
            Number(player.maxRuns) || 0
          })`}
          color="#1877F2"
        />

        <StatTile
          label="Wickets (Max)"
          value={`${Number(player.wickets) || 0} (${
            Number(player.maxWickets) || 0
          })`}
          color="#f59e0b"
        />
      </div>

      <div className="relative mt-5">
        <div className="mb-2 flex items-end justify-between">
          <span className="pl-muted text-[11px] font-bold">
            FCL Performance Points
          </span>

          <span className="pl-blue text-xl font-black">
            {formatNumber(points)}
          </span>
        </div>

        <div className="pl-progress-track h-1.5 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, #1877F2, ${style.color})`,
            }}
          />
        </div>
      </div>

      <div className="pl-card-footer relative mt-5 flex items-center justify-between border-t pt-4">
        <span className="pl-blue text-[11px] font-black">
          View Official Player Card
        </span>

        <span className="pl-arrow flex h-8 w-8 items-center justify-center rounded-xl border text-lg font-black transition-all group-hover:translate-x-1 group-hover:bg-[#1877F2] group-hover:text-white">
          →
        </span>
      </div>
    </button>
  );
}

/* ============================================================
   DESKTOP LIST ROW
============================================================ */

function DesktopRow({
  player,
  rank,
  showRank,
  onOpen,
}: ItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(player)}
        className="pl-list-row group grid w-full grid-cols-[36px_minmax(170px,2fr)_minmax(140px,1.4fr)_repeat(4,minmax(65px,0.7fr))] items-center gap-3 px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]"
      >
        <span>
          {showRank ? (
            <RankChip rank={rank} />
          ) : (
            <span className="pl-muted text-xs">
              —
            </span>
          )}
        </span>

        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            player={player}
            className="h-11 w-11 rounded-xl"
          />

          <div className="min-w-0">
            <p className="pl-heading truncate text-xs font-black transition group-hover:text-[#1877F2]">
              {player.name}
            </p>

            {player.nickName && (
              <p className="pl-muted mt-1 truncate text-[10px]">
                @{player.nickName}
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <RoleBadge role={player.role} small />
        </div>

        <span className="text-right text-xs font-bold">
          {formatNumber(Number(player.matches) || 0)}
        </span>

        <span className="text-right text-xs font-bold">
          {formatNumber(Number(player.runs) || 0)}
        </span>

        <span className="pl-amber text-right text-xs font-bold">
          {formatNumber(Number(player.wickets) || 0)}
        </span>

        <span className="pl-blue text-right text-xs font-black">
          {formatNumber(calculateFclPoints(player))}
        </span>
      </button>
    </li>
  );
}

/* ============================================================
   MOBILE PLAYER CARD
============================================================ */

function MobilePlayerCard({
  player,
  rank,
  showRank,
  onOpen,
}: ItemProps) {
  const style = getRoleStyle(player.role);

  const points = calculateFclPoints(player);

  return (
    <button
      type="button"
      onClick={() => onOpen(player)}
      className="pl-mobile-card group relative flex w-full items-center gap-3 overflow-hidden rounded-[20px] border p-3 pl-4 text-left transition-all duration-300 active:scale-[0.98]"
      style={
        {
          "--accent": style.color,
        } as CSSProperties
      }
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{
          backgroundColor: style.color,
        }}
      />

      <div className="relative shrink-0">
        <Avatar
          player={player}
          className="h-[58px] w-[58px] rounded-2xl"
        />

        {showRank && (
          <span className="absolute -left-2 -top-2">
            <RankChip rank={rank} />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="pl-heading truncate text-[13px] font-black">
          {player.name}
        </h3>

        <div className="mt-1.5">
          <RoleBadge
            role={player.role}
            small
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          <span className="pl-mini-stat rounded-md px-1.5 py-1 text-[9px] font-black">
            M {Number(player.matches) || 0}
          </span>

          <span className="rounded-md bg-blue-500/10 px-1.5 py-1 text-[9px] font-black text-[#1877F2]">
            R {Number(player.runs) || 0}
          </span>

          <span className="rounded-md bg-amber-500/10 px-1.5 py-1 text-[9px] font-black text-amber-500">
            W {Number(player.wickets) || 0}
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="pl-blue text-[15px] font-black leading-none">
          {formatNumber(points)}
        </p>

        <p className="pl-muted mt-1 text-[8px] font-bold">
          FCL Points
        </p>

        <span className="pl-blue mt-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#1877F2]/10 text-base font-black">
          ›
        </span>
      </div>
    </button>
  );
}

/* ============================================================
   MOBILE FILTER PANEL
============================================================ */

function MobileFilterPanel({
  selectedRole,
  setSelectedRole,
  sortBy,
  setSortBy,
  roleCounts,
}: {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  sortBy: SortKey;
  setSortBy: (sort: SortKey) => void;
  roleCounts: Record<string, number>;
}) {
  return (
    <div className="pl-panel rounded-[22px] border p-3.5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="pl-blue text-[9px] font-black uppercase tracking-wider">
            PLAYER FILTERS
          </p>

          <h3 className="pl-heading mt-1 text-sm font-black">
            Filter by Role
          </h3>
        </div>

        <span className="text-lg">⚙️</span>
      </div>

      <button
        type="button"
        onClick={() => setSelectedRole("All")}
        aria-pressed={selectedRole === "All"}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-xs font-black transition-all ${
          selectedRole === "All"
            ? "border-[#1877F2] bg-[#1877F2] text-white"
            : "pl-filter-inactive"
        }`}
      >
        <span>🌐 All Players</span>

        <span className="rounded-full bg-white/15 px-2 py-0.5">
          {roleCounts.All || 0}
        </span>
      </button>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {ROLES.filter((role) => role !== "All").map(
          (role) => {
            const style = getRoleStyle(role);

            const active = selectedRole === role;

            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                aria-pressed={active}
                className={`pl-role-filter relative flex min-h-[106px] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border px-1.5 py-3 text-center transition-all active:scale-95 ${
                  active ? "pl-role-active" : ""
                }`}
                style={
                  {
                    "--accent": style.color,
                    borderColor: active
                      ? style.color
                      : undefined,
                  } as CSSProperties
                }
              >
                {active && (
                  <span
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{
                      backgroundColor: style.color,
                    }}
                  />
                )}

                <span className="text-xl">
                  {style.icon}
                </span>

                <span className="pl-role-text min-h-[28px] text-[9px] font-black leading-tight">
                  {role}
                </span>

                <span className="pl-role-count rounded-full px-2 py-0.5 text-[9px] font-black">
                  {roleCounts[role] || 0}
                </span>
              </button>
            );
          }
        )}
      </div>

      <div className="pl-divider my-5 h-px" />

      <p className="pl-heading mb-3 text-xs font-black">
        Sort Players
      </p>

      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SORTS.map((sort) => (
          <button
            key={sort.key}
            type="button"
            onClick={() => setSortBy(sort.key)}
            aria-pressed={sortBy === sort.key}
            className={`shrink-0 rounded-xl border px-3 py-2 text-[10px] font-black transition ${
              sortBy === sort.key
                ? "pl-sort-active"
                : "pl-filter-inactive"
            }`}
          >
            {sort.icon} {sort.short}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   LOADING SKELETON
============================================================ */

function PlayerSkeleton({
  isDesktop,
}: {
  isDesktop: boolean;
}) {
  return (
    <div
      className={
        isDesktop
          ? "grid grid-cols-2 gap-5 xl:grid-cols-3"
          : "space-y-3"
      }
    >
      {Array.from({
        length: isDesktop ? 9 : 6,
      }).map((_, index) => (
        <div
          key={index}
          className={`pl-skeleton animate-pulse rounded-[22px] border ${
            isDesktop ? "h-[295px]" : "h-[105px]"
          }`}
        />
      ))}
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function PlayersPage() {
  const isDark = useIsDark();

  const isDesktop = useMediaQuery(
    "(min-width: 1024px)"
  );

  const [players, setPlayers] = useState<Player[]>([]);

  const [tournamentsData, setTournamentsData] =
    useState<TournamentRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRole, setSelectedRole] =
    useState("All");

  const [sortBy, setSortBy] =
    useState<SortKey>("name");

  const [view, setView] =
    useState<ViewKey>("grid");

  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);

  const [selectedPlayer, setSelectedPlayer] =
    useState<Player | null>(null);

  const [showCriteria, setShowCriteria] =
    useState(false);

  /* ============================================================
     FETCH DATA
  ============================================================ */

  useEffect(() => {
    const controller = new AbortController();

    const loadPlayers = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          "/api/fcl-data",
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load FCL player data"
          );
        }

        const data = await response.json();

        let loadedPlayers: Player[] = [];

        if (
          data.players &&
          Array.isArray(data.players)
        ) {
          loadedPlayers = data.players;
        } else if (Array.isArray(data)) {
          loadedPlayers = data;
        }

        const processed = loadedPlayers
          .filter(
            (player) =>
              player &&
              typeof player.name === "string"
          )
          .map((player) => ({
            ...player,
            role: getAutomaticRole(player),
          }));

        processed.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        if (controller.signal.aborted) return;

        setPlayers(processed);

        if (
          data.tournaments &&
          Array.isArray(data.tournaments)
        ) {
          setTournamentsData(data.tournaments);
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Error loading FCL players:",
          err
        );

        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadPlayers();

    return () => controller.abort();
  }, []);

  /* ============================================================
     RESET PAGINATION
  ============================================================ */

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedRole, sortBy]);

  /* ============================================================
     ROLE COUNTS
  ============================================================ */

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: players.length,
    };

    players.forEach((player) => {
      counts[player.role] =
        (counts[player.role] || 0) + 1;
    });

    return counts;
  }, [players]);

  /* ============================================================
     TOTAL STATS
  ============================================================ */

  const totals = useMemo(
    () => ({
      matches: players.reduce(
        (total, player) =>
          total + (Number(player.matches) || 0),
        0
      ),

      runs: players.reduce(
        (total, player) =>
          total + (Number(player.runs) || 0),
        0
      ),

      wickets: players.reduce(
        (total, player) =>
          total + (Number(player.wickets) || 0),
        0
      ),
    }),
    [players]
  );

  /* ============================================================
     MAX POINTS
  ============================================================ */

  const maxPoints = useMemo(
    () =>
      players.reduce(
        (max, player) =>
          Math.max(
            max,
            calculateFclPoints(player)
          ),
        0
      ),
    [players]
  );

  /* ============================================================
     FILTER & SORT
  ============================================================ */

  const filteredPlayers = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    const filtered = players.filter((player) => {
      const matchesSearch =
        !query ||
        player.name
          .toLowerCase()
          .includes(query) ||
        (player.nickName || "")
          .toLowerCase()
          .includes(query);

      const matchesRole =
        selectedRole === "All" ||
        player.role === selectedRole;

      return matchesSearch && matchesRole;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "points":
          return (
            calculateFclPoints(b) -
            calculateFclPoints(a)
          );

        case "runs":
          return (
            (Number(b.runs) || 0) -
            (Number(a.runs) || 0)
          );

        case "wickets":
          return (
            (Number(b.wickets) || 0) -
            (Number(a.wickets) || 0)
          );

        case "matches":
          return (
            (Number(b.matches) || 0) -
            (Number(a.matches) || 0)
          );

        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [
    players,
    searchQuery,
    selectedRole,
    sortBy,
  ]);

  /* ============================================================
     PAGINATION
  ============================================================ */

  const visiblePlayers = filteredPlayers.slice(
    0,
    visibleCount
  );

  const remaining =
    filteredPlayers.length -
    visiblePlayers.length;

  const showRank = sortBy !== "name";

  const hasActiveFilter =
    searchQuery.trim() !== "" ||
    selectedRole !== "All" ||
    sortBy !== "name";

  /* ============================================================
     ACTIONS
  ============================================================ */

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedRole("All");
    setSortBy("name");
  }, []);

  const openPlayer = useCallback(
    (player: Player) => {
      setSelectedPlayer(player);
    },
    []
  );

  const closePlayer = useCallback(() => {
    setSelectedPlayer(null);
  }, []);

  /* ============================================================
     HEADER STATS
  ============================================================ */

  const headerStats = [
    {
      label: "Players",
      value: players.length,
      icon: "👥",
      color: "#1877F2",
    },
    {
      label: "Matches",
      value: totals.matches,
      icon: "⚡",
      color: "#22c55e",
    },
    {
      label: "Runs",
      value: totals.runs,
      icon: "🏏",
      color: "#38bdf8",
    },
    {
      label: "Wickets",
      value: totals.wickets,
      icon: "🎯",
      color: "#f59e0b",
    },
  ];

  /* ============================================================
     ITEM PROPS
  ============================================================ */

  const itemProps = (
    player: Player,
    index: number
  ): ItemProps => ({
    player,
    rank: index + 1,
    showRank,
    maxPoints,
    onOpen: openPlayer,
  });

  /* ============================================================
     SEARCH BOX COMPONENT
  ============================================================ */

  const renderSearchBox = () => (
    <div className="relative w-full">
      <span className="pl-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">
        🔍
      </span>

      <input
        type="search"
        aria-label="Search players"
        placeholder="Search player name or nickname..."
        value={searchQuery}
        onChange={(event) =>
          setSearchQuery(event.target.value)
        }
        className="pl-input w-full rounded-2xl border py-3.5 pl-11 pr-11 text-xs font-semibold outline-none sm:text-sm"
      />

      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="pl-muted absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-xs transition hover:bg-blue-500/10"
        >
          ✕
        </button>
      )}
    </div>
  );

  /* ============================================================
     SORT BUTTONS
  ============================================================ */

  const renderSortButtons = () => (
    <div className="grid grid-cols-2 gap-2">
      {SORTS.map((sort) => (
        <button
          key={sort.key}
          type="button"
          onClick={() => setSortBy(sort.key)}
          aria-pressed={sortBy === sort.key}
          className={`rounded-xl border px-3 py-2.5 text-[10px] font-black transition-all ${
            sortBy === sort.key
              ? "pl-sort-active"
              : "pl-filter-inactive"
          }`}
        >
          {sort.icon} {sort.short}
        </button>
      ))}
    </div>
  );

  /* ============================================================
     PLAYER CONTENT
  ============================================================ */

  const renderContent = () => {
    if (loading) {
      return (
        <PlayerSkeleton isDesktop={isDesktop} />
      );
    }

    if (error) {
      return (
        <div className="pl-empty flex flex-col items-center justify-center rounded-[26px] border px-5 py-16 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-500/20 bg-rose-500/10 text-4xl">
            ⚠️
          </div>

          <h3 className="pl-heading text-xl font-black">
            Player Data Unavailable
          </h3>

          <p className="pl-muted mt-3 max-w-md text-xs leading-6">
            এই মুহূর্তে প্লেয়ারদের তথ্য লোড করা
            যাচ্ছে না। আবার চেষ্টা করুন।
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="pl-primary-btn mt-6 rounded-xl px-6 py-3 text-xs font-black"
          >
            🔄 Try Again
          </button>
        </div>
      );
    }

    if (filteredPlayers.length === 0) {
      return (
        <div className="pl-empty flex flex-col items-center justify-center rounded-[26px] border px-5 py-16 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/20 bg-blue-500/10 text-4xl">
            🔍
          </div>

          <h3 className="pl-heading text-lg font-black">
            No Players Found
          </h3>

          <p className="pl-muted mt-3 text-xs leading-6">
            আপনার সার্চ বা নির্বাচিত Role অনুযায়ী
            কোনো প্লেয়ার পাওয়া যায়নি।
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="pl-primary-btn mt-6 rounded-xl px-6 py-3 text-xs font-black"
          >
            Clear Filters
          </button>
        </div>
      );
    }

    if (isDesktop && view === "grid") {
      return (
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
          {visiblePlayers.map((player, index) => (
            <DesktopCard
              key={`${player.id ?? player.name}-${index}`}
              {...itemProps(player, index)}
            />
          ))}
        </div>
      );
    }

    if (isDesktop && view === "list") {
      return (
        <div className="pl-table overflow-x-auto rounded-[24px] border">
          <div className="min-w-[850px]">
            <div className="pl-table-head grid grid-cols-[36px_minmax(170px,2fr)_minmax(140px,1.4fr)_repeat(4,minmax(65px,0.7fr))] items-center gap-3 border-b px-5 py-4 text-[10px] font-black uppercase tracking-wider">
              <span>#</span>
              <span>Player</span>
              <span>Role</span>
              <span className="text-right">Matches</span>
              <span className="text-right">Runs</span>
              <span className="text-right">Wickets</span>
              <span className="text-right">Points</span>
            </div>

            <ul className="pl-table-list">
              {visiblePlayers.map((player, index) => (
                <DesktopRow
                  key={`${player.id ?? player.name}-${index}`}
                  {...itemProps(player, index)}
                />
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {visiblePlayers.map((player, index) => (
          <MobilePlayerCard
            key={`${player.id ?? player.name}-${index}`}
            {...itemProps(player, index)}
          />
        ))}
      </div>
    );
  };

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div
      className={`pl-root ${
        isDark ? "pl-dark" : "pl-light"
      } relative min-h-screen overflow-x-clip pb-28 font-sans sm:pb-20`}
    >
      {/* ==========================================================
          THEME STYLES
      ========================================================== */}

      <style jsx global>{`

        /* ========================================================
           FCL OFFICIAL COLOR TOKENS
        ======================================================== */

        .pl-root {
          --pl-bg: #ffffff;
          --pl-bg-alt: #f1f5f9;
          --pl-card: #ffffff;
          --pl-card-alt: #f8fafc;

          --pl-heading: #0f172a;
          --pl-text: #475569;
          --pl-muted: #64748b;

          --pl-border: #e2e8f0;

          --pl-blue: #1d4ed8;
          --pl-amber: #b45309;

          --pl-input: #ffffff;
          --pl-sheet: #ffffff;

          --pl-shadow:
            0 8px 30px rgba(15,23,42,.06);

          --pl-hover-shadow:
            0 25px 60px rgba(24,119,242,.15);

          --pl-grid:
            rgba(100,116,139,.09);

          background: var(--pl-bg);
          color: var(--pl-heading);

          transition:
            background .3s ease,
            color .3s ease;
        }

        .pl-root.pl-dark {
          --pl-bg: #020617;
          --pl-bg-alt: #02050b;
          --pl-card: #0f172a;
          --pl-card-alt: #0b1220;

          --pl-heading: #ffffff;
          --pl-text: #cbd5e1;
          --pl-muted: #94a3b8;

          --pl-border: #172033;

          --pl-blue: #60a5fa;
          --pl-amber: #f59e0b;

          --pl-input: #0b1220;
          --pl-sheet: #0b1220;

          --pl-shadow:
            0 12px 40px rgba(0,0,0,.18);

          --pl-hover-shadow:
            0 30px 70px rgba(24,119,242,.18);

          --pl-grid:
            rgba(148,163,184,.055);
        }

        /* ========================================================
           THEME UTILITIES
        ======================================================== */

        .pl-heading {
          color: var(--pl-heading);
        }

        .pl-text {
          color: var(--pl-text);
        }

        .pl-muted {
          color: var(--pl-muted);
        }

        .pl-blue {
          color: var(--pl-blue);
        }

        .pl-amber {
          color: var(--pl-amber);
        }

        /* ========================================================
           HERO
        ======================================================== */

        .pl-hero {
          background: var(--pl-bg-alt);
          border-color: var(--pl-border);
        }

        .pl-grid {
          background-image:
            linear-gradient(
              to right,
              var(--pl-grid) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              var(--pl-grid) 1px,
              transparent 1px
            );

          background-size: 52px 52px;

          -webkit-mask-image:
            radial-gradient(
              ellipse 80% 80% at 50% 20%,
              black 25%,
              transparent 95%
            );

          mask-image:
            radial-gradient(
              ellipse 80% 80% at 50% 20%,
              black 25%,
              transparent 95%
            );
        }

        /* ========================================================
           GRADIENT TEXT
        ======================================================== */

        .pl-gradient-text {
          background:
            linear-gradient(
              90deg,
              #1d4ed8,
              #1877F2,
              #7c3aed,
              #1d4ed8
            );

          background-size: 250% auto;

          -webkit-background-clip: text;
          background-clip: text;

          -webkit-text-fill-color: transparent;

          animation:
            plGradient 6s ease infinite;
        }

        .pl-dark .pl-gradient-text {
          background:
            linear-gradient(
              90deg,
              #60a5fa,
              #22d3ee,
              #a78bfa,
              #60a5fa
            );

          background-size: 250% auto;

          -webkit-background-clip: text;
          background-clip: text;
        }

        @keyframes plGradient {
          0%,100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        /* ========================================================
           FLOATING ORBS
        ======================================================== */

        @keyframes plFloat {
          0%,100% {
            transform: translate(0,0) scale(1);
          }

          50% {
            transform:
              translate(25px,-25px) scale(1.08);
          }
        }

        .pl-orb {
          animation:
            plFloat 12s ease-in-out infinite;
        }

        .pl-orb-delay {
          animation-delay: -6s;
        }

        /* ========================================================
           HERO BADGE
        ======================================================== */

        .pl-hero-badge {
          background: rgba(24,119,242,.09);
          border-color: rgba(24,119,242,.3);
          color: var(--pl-blue);
        }

        /* ========================================================
           AUCTION PROMO
        ======================================================== */

        .pl-auction {
          background:
            linear-gradient(
              135deg,
              rgba(245,158,11,.13),
              rgba(24,119,242,.09),
              rgba(168,85,247,.08)
            );

          border-color: rgba(245,158,11,.45);

          box-shadow:
            0 12px 40px rgba(24,119,242,.08);

          transition:
            transform .3s ease,
            box-shadow .3s ease,
            border-color .3s ease;
        }

        .pl-auction:hover {
          transform: translateY(-4px);

          box-shadow:
            0 20px 55px rgba(24,119,242,.16);

          border-color: #f59e0b;
        }

        @keyframes plAuctionGlow {
          0%,100% {
            box-shadow:
              0 0 15px rgba(245,158,11,.12),
              inset 0 0 15px rgba(24,119,242,.06);
          }

          50% {
            box-shadow:
              0 0 30px rgba(245,158,11,.28),
              inset 0 0 25px rgba(24,119,242,.12);
          }
        }

        .pl-auction-glow {
          animation:
            plAuctionGlow 4s ease-in-out infinite;
        }

        /* ========================================================
           HEADER STATS
        ======================================================== */

        .pl-header-stat {
          background:
            linear-gradient(
              to bottom,
              var(--pl-card),
              var(--pl-card-alt)
            );

          border-color: var(--pl-border);

          box-shadow: var(--pl-shadow);

          transition:
            transform .3s ease,
            border-color .3s ease;
        }

        .pl-header-stat:hover {
          transform: translateY(-3px);
          border-color: rgba(24,119,242,.45);
        }

        /* ========================================================
           PANELS
        ======================================================== */

        .pl-panel {
          background: var(--pl-card);
          border-color: var(--pl-border);
          box-shadow: var(--pl-shadow);
        }

        .pl-divider {
          background: var(--pl-border);
        }

        /* ========================================================
           INPUT
        ======================================================== */

        .pl-input {
          background: var(--pl-input);
          border-color: var(--pl-border);
          color: var(--pl-heading);

          transition:
            border-color .3s ease,
            box-shadow .3s ease;
        }

        .pl-input::placeholder {
          color: var(--pl-muted);
          opacity: .75;
        }

        .pl-input:focus {
          border-color: #1877F2;

          box-shadow:
            0 0 0 4px rgba(24,119,242,.1);
        }

        /* ========================================================
           FILTER BUTTONS
        ======================================================== */

        .pl-filter-inactive {
          background: var(--pl-card-alt);
          border-color: var(--pl-border);
          color: var(--pl-text);
        }

        .pl-filter-inactive:hover {
          border-color: rgba(24,119,242,.4);
        }

        .pl-sort-active {
          background: rgba(245,158,11,.12);
          border-color: rgba(245,158,11,.5);
          color: var(--pl-amber);
        }

        .pl-role-filter {
          background: var(--pl-card-alt);
          border-color: var(--pl-border);
        }

        .pl-role-active {
          background:
            color-mix(
              in srgb,
              var(--accent) 10%,
              var(--pl-card)
            );
        }

        .pl-role-text {
          color: var(--pl-heading);
        }

        .pl-role-active .pl-role-text {
          color: var(--accent);
        }

        .pl-role-count {
          background: var(--pl-bg-alt);
          color: var(--pl-muted);
        }

        .pl-role-active .pl-role-count {
          background:
            color-mix(
              in srgb,
              var(--accent) 15%,
              transparent
            );
        }

        /* ========================================================
           ROLE BADGE
        ======================================================== */

        .pl-role-badge {
          color:
            color-mix(
              in srgb,
              var(--accent) 65%,
              #0f172a
            );
        }

        .pl-dark .pl-role-badge {
          color: var(--accent);
        }

        /* ========================================================
           DESKTOP PLAYER CARDS
        ======================================================== */

        .pl-player-card {
          background:
            linear-gradient(
              to bottom,
              var(--pl-card),
              var(--pl-card-alt)
            );

          border-color: var(--pl-border);

          box-shadow: var(--pl-shadow);
        }

        .pl-player-card:hover {
          border-color:
            color-mix(
              in srgb,
              var(--accent) 55%,
              transparent
            );

          box-shadow: var(--pl-hover-shadow);
        }

        .pl-avatar {
          background: var(--pl-bg-alt);
        }

        .pl-stat-tile {
          background: var(--pl-card-alt);
          border-color: var(--pl-border);
        }

        .pl-progress-track {
          background: var(--pl-bg-alt);
        }

        .pl-card-footer {
          border-color: var(--pl-border);
        }

        .pl-arrow {
          background: rgba(24,119,242,.08);
          border-color: rgba(24,119,242,.2);
          color: var(--pl-blue);
        }

        /* ========================================================
           MOBILE CARDS
        ======================================================== */

        .pl-mobile-card {
          background:
            linear-gradient(
              to right,
              var(--pl-card),
              var(--pl-card-alt)
            );

          border-color: var(--pl-border);

          box-shadow: var(--pl-shadow);
        }

        .pl-mobile-card:hover {
          border-color:
            color-mix(
              in srgb,
              var(--accent) 55%,
              transparent
            );
        }

        .pl-mini-stat {
          background: var(--pl-bg-alt);
          color: var(--pl-muted);
        }

        /* ========================================================
           RANK CHIP
        ======================================================== */

        .pl-rank {
          background: var(--pl-bg-alt);
          color: var(--pl-heading);
        }

        /* ========================================================
           DESKTOP LIST
        ======================================================== */

        .pl-table {
          background: var(--pl-card);
          border-color: var(--pl-border);
          box-shadow: var(--pl-shadow);
        }

        .pl-table-head {
          background: var(--pl-card-alt);
          border-color: var(--pl-border);
          color: var(--pl-muted);
        }

        .pl-table-list > li:not(:first-child) {
          border-top: 1px solid var(--pl-border);
        }

        .pl-list-row:hover {
          background: var(--pl-card-alt);
        }

        /* ========================================================
           VIEW TOGGLE
        ======================================================== */

        .pl-view-toggle {
          background: var(--pl-card-alt);
          border-color: var(--pl-border);
        }

        /* ========================================================
           STICKY SEARCH
        ======================================================== */

        .pl-sticky {
          background:
            color-mix(
              in srgb,
              var(--pl-bg) 92%,
              transparent
            );

          border-color: var(--pl-border);
        }

        /* ========================================================
           MODAL
        ======================================================== */

        .pl-sheet {
          background: var(--pl-sheet);
          border-color: var(--pl-border);

          animation:
            plModalEnter .3s ease-out;
        }

        @keyframes plModalEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .pl-sheet-header {
          border-color: var(--pl-border);
        }

        .pl-close {
          background: var(--pl-bg-alt);
          color: var(--pl-heading);
        }

        .pl-close:hover {
          color: #f43f5e;
          background: rgba(244,63,94,.1);
        }

        .pl-criteria-item {
          transition: transform .3s ease;
        }

        .pl-criteria-item:hover {
          transform: translateX(3px);
        }

        .pl-criteria-item .pl-role-text {
          color: var(--accent);
        }

        /* ========================================================
           BUTTONS
        ======================================================== */

        .pl-primary-btn {
          background: #1877F2;
          color: white;

          box-shadow:
            0 10px 30px rgba(24,119,242,.25);

          transition:
            background .3s ease,
            transform .3s ease;
        }

        .pl-primary-btn:hover {
          background: #0d6fe8;
          transform: translateY(-2px);
        }

        .pl-secondary-btn {
          background: var(--pl-card);
          border-color: var(--pl-border);
          color: var(--pl-heading);
        }

        .pl-secondary-btn:hover {
          border-color: rgba(24,119,242,.5);
          color: var(--pl-blue);
        }

        /* ========================================================
           SKELETON & EMPTY
        ======================================================== */

        .pl-skeleton,
        .pl-empty {
          background: var(--pl-card);
          border-color: var(--pl-border);
        }

        /* ========================================================
           REDUCED MOTION
        ======================================================== */

        @media (prefers-reduced-motion: reduce) {
          .pl-root *,
          .pl-root *::before,
          .pl-root *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }

      `}</style>

      {/* ==========================================================
          HERO SECTION
      ========================================================== */}

      <section className="pl-hero relative overflow-hidden border-b">
        <div className="pl-grid pointer-events-none absolute inset-0" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(24,119,242,0.12),transparent_45%)]" />

        <div className="pl-orb pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#1877F2]/15 blur-[120px]" />

        <div className="pl-orb pl-orb-delay pointer-events-none absolute -bottom-40 -left-28 h-[360px] w-[360px] rounded-full bg-purple-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-[1400px] px-4 pb-9 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:px-10 lg:pb-14">
          {/* Breadcrumb */}

          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/"
              className="pl-blue text-[11px] font-bold transition hover:opacity-70"
            >
              ← Home
            </Link>

            <span className="pl-muted">/</span>

            <span className="pl-muted text-[11px] font-semibold">
              Player Directory
            </span>
          </div>

          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            {/* Hero Text */}

            <div className="max-w-[760px]">
              <div className="pl-hero-badge mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.8)]" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] sm:text-[10px]">
                  FCL OFFICIAL SQUAD DIRECTORY
                </span>
              </div>

              <h1 className="pl-heading text-[35px] font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[62px]">
                Player{" "}
                <span className="pl-gradient-text">
                  Directory.
                </span>
              </h1>

              <p className="pl-text mt-5 max-w-[710px] text-xs leading-7 sm:text-sm lg:text-base lg:leading-8">
                Facebook Cricket League-এর সকল
                ক্রিকেটারদের অফিসিয়াল ডিরেক্টরি।
                প্লেয়ার খুঁজুন, Role অনুযায়ী ফিল্টার করুন,
                পরিসংখ্যান দেখুন এবং অফিসিয়াল
                Player Card ডাউনলোড করুন।
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[9px] font-bold text-blue-600">
                  👥 Official Players
                </span>

                <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[9px] font-bold text-amber-600">
                  ⭐ FCL Ratings
                </span>

                <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-bold text-emerald-600">
                  📊 Player Statistics
                </span>
              </div>
            </div>

            {/* Auction Promotion */}

            <Link
              href="/players/compare"
              className="pl-auction pl-auction-glow group relative flex w-full shrink-0 items-center gap-4 overflow-hidden rounded-[24px] border-2 p-5 lg:w-[370px]"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-500/15 blur-[50px]" />

              <span className="relative text-4xl sm:text-5xl">
                ⚔️
              </span>

              <div className="relative min-w-0 flex-1">
                <span className="pl-amber text-[9px] font-black uppercase tracking-[0.15em]">
                  FCL AUCTION ANALYTICS
                </span>

                <h2 className="pl-heading mt-1 text-sm font-black leading-snug sm:text-base">
                  খেলোয়াড়দের পারফরম্যান্স তুলনা করুন!
                </h2>

                <p className="pl-muted mt-1.5 text-[10px] leading-5">
                  সেরা স্কোয়াড গড়তে ২–৪ জন প্লেয়ার
                  তুলনা করুন।
                </p>

                <span className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-[10px] font-black text-white shadow-lg shadow-blue-500/20 transition group-hover:gap-3">
                  তুলনা শুরু করুন
                  <span>→</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Header Statistics */}

          <div className="mt-9 grid grid-cols-4 gap-2 sm:gap-4 lg:max-w-[850px]">
            {headerStats.map((stat) => (
              <div
                key={stat.label}
                className="pl-header-stat rounded-[18px] border px-2 py-3.5 text-center lg:rounded-[22px] lg:px-5 lg:py-5 lg:text-left"
              >
                <span className="text-lg">
                  {stat.icon}
                </span>

                <p
                  className="mt-2 text-[17px] font-black leading-none sm:text-2xl lg:text-[30px]"
                  style={{
                    color: stat.color,
                  }}
                >
                  {loading
                    ? "..."
                    : formatNumber(stat.value)}
                </p>

                <p className="pl-muted mt-2 text-[9px] font-bold sm:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
          MAIN CONTENT
      ========================================================== */}

      <main className="relative mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 sm:pt-10 lg:px-10">
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-[#1877F2]" />

            <span className="pl-blue text-[9px] font-black uppercase tracking-[0.2em]">
              EXPLORE FCL PLAYERS
            </span>
          </div>

          <h2 className="pl-heading text-[23px] font-black tracking-tight sm:text-[30px]">
            Explore Player Profiles
          </h2>

          <p className="pl-muted mt-1.5 text-[11px]">
            আপনার পছন্দের ক্রিকেটারকে খুঁজে নিন।
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-8">
          {/* ======================================================
              DESKTOP SIDEBAR
          ====================================================== */}

          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <div className="pl-panel space-y-6 rounded-[24px] border p-5">
                {/* Criteria */}

                <button
                  type="button"
                  onClick={() => setShowCriteria(true)}
                  className="pl-blue flex w-full items-center justify-between rounded-xl border border-[#1877F2]/25 bg-[#1877F2]/10 px-3.5 py-3 text-[11px] font-black transition hover:bg-[#1877F2]/20"
                >
                  <span>
                    ℹ️ How roles are determined
                  </span>

                  <span>→</span>
                </button>

                {/* Search */}

                <div>
                  <p className="pl-muted mb-2 text-[10px] font-black uppercase tracking-wider">
                    Search Players
                  </p>

                  {renderSearchBox()}
                </div>

                {/* Roles */}

                <div>
                  <p className="pl-muted mb-3 text-[10px] font-black uppercase tracking-wider">
                    Player Roles
                  </p>

                  <div className="space-y-1.5">
                    {ROLES.map((role) => {
                      const active =
                        selectedRole === role;

                      const style =
                        role === "All"
                          ? null
                          : getRoleStyle(role);

                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() =>
                            setSelectedRole(role)
                          }
                          aria-pressed={active}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-[11px] font-bold transition-all ${
                            active
                              ? "bg-[#1877F2] text-white shadow-lg shadow-blue-500/20"
                              : "pl-filter-inactive"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span>
                              {style
                                ? style.icon
                                : "🌐"}
                            </span>

                            <span className="truncate">
                              {role}
                            </span>
                          </span>

                          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px]">
                            {roleCounts[role] || 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sorting */}

                <div>
                  <p className="pl-muted mb-3 text-[10px] font-black uppercase tracking-wider">
                    Sort By
                  </p>

                  {renderSortButtons()}
                </div>

                {/* Layout */}

                <div>
                  <p className="pl-muted mb-3 text-[10px] font-black uppercase tracking-wider">
                    Display Layout
                  </p>

                  <ViewToggle
                    view={view}
                    setView={setView}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ======================================================
              PLAYER CONTENT
          ====================================================== */}

          <div className="min-w-0">
            {/* Mobile Search */}

            <div className="pl-sticky sticky top-0 z-30 -mx-4 mb-4 border-b px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
              {renderSearchBox()}
            </div>

            {/* Mobile Role Criteria */}

            <div className="mb-4 lg:hidden">
              <button
                type="button"
                onClick={() => setShowCriteria(true)}
                className="pl-panel pl-blue flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-[11px] font-black"
              >
                <span>
                  ℹ️ How roles are determined
                </span>

                <span>দেখুন →</span>
              </button>
            </div>

            {/* Mobile Filters */}

            <div className="mb-6 lg:hidden">
              <MobileFilterPanel
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                sortBy={sortBy}
                setSortBy={setSortBy}
                roleCounts={roleCounts}
              />
            </div>

            {/* Results Header */}

            {!loading && !error && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="pl-blue text-[9px] font-black uppercase tracking-[0.18em]">
                    FCL PLAYER COLLECTION
                  </p>

                  <h3 className="pl-heading mt-1 text-lg font-black sm:text-xl">
                    Player Records
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="pl-panel rounded-xl border px-3 py-2 text-[10px] font-bold">
                    <span className="pl-blue">
                      {visiblePlayers.length}
                    </span>

                    <span className="pl-muted">
                      {" "}
                      / {filteredPlayers.length}
                    </span>
                  </span>

                  {hasActiveFilter && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="pl-blue rounded-xl bg-[#1877F2]/10 px-3 py-2 text-[10px] font-black"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Divider */}

            <div className="mb-6 h-px bg-gradient-to-r from-[#1877F2]/40 via-[#1877F2]/10 to-transparent" />

            {/* Players */}

            {renderContent()}

            {/* ==================================================
                LOAD MORE
            ================================================== */}

            {!loading && !error && remaining > 0 && (
              <div className="mt-10 flex flex-col items-center gap-5">
                <div className="w-full max-w-[260px]">
                  <div className="pl-muted mb-2 flex justify-between text-[10px] font-bold">
                    <span>Directory Progress</span>

                    <span>
                      {Math.round(
                        (visiblePlayers.length /
                          filteredPlayers.length) *
                          100
                      )}
                      %
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-[#1877F2]/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1877F2] via-cyan-400 to-purple-500 transition-all duration-500"
                      style={{
                        width: `${
                          (visiblePlayers.length /
                            filteredPlayers.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount(
                        (count) => count + PAGE_SIZE
                      )
                    }
                    className="pl-primary-btn rounded-xl px-6 py-3.5 text-xs font-black"
                  >
                    Show{" "}
                    {Math.min(
                      PAGE_SIZE,
                      remaining
                    )}{" "}
                    More ↓
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount(
                        filteredPlayers.length
                      )
                    }
                    className="pl-secondary-btn rounded-xl border px-6 py-3.5 text-xs font-black"
                  >
                    Show All ({remaining} left)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        {!loading && !error && (
          <div className="mt-14 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#1877F2]/40" />

              <span className="text-lg">🏏</span>

              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#1877F2]/40" />
            </div>

            <p className="pl-muted text-[10px] font-black uppercase tracking-[0.2em]">
              Facebook Cricket League
            </p>

            <p className="pl-muted text-[10px]">
              Official Player Directory & Statistics
            </p>
          </div>
        )}
      </main>

      {/* ==========================================================
          ROLE CRITERIA MODAL
      ========================================================== */}

      <Sheet
        open={showCriteria}
        onClose={() => setShowCriteria(false)}
        title="How Roles Are Determined"
      >
        <CriteriaContent />
      </Sheet>

      {/* ==========================================================
          PLAYER CARD MODAL
      ========================================================== */}

      <PlayerCardModal
        selectedPlayer={selectedPlayer}
        onClose={closePlayer}
        tournamentsData={tournamentsData}
        allPlayers={players}
      />
    </div>
  );
}