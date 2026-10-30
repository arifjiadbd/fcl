"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type CSSProperties,
  type ReactNode,
  type MouseEvent,
} from "react";

import Link from "next/link";
import PlayerCardModal from "../../components/PlayerCardModal";

/* ============================================================
   FCL PLAYER DIRECTORY
   PREMIUM SPORTS APP EDITION — 2026
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
    label: "Name A–Z",
    short: "A–Z",
    icon: "↕",
  },
  {
    key: "points",
    label: "FCL Points",
    short: "Points",
    icon: "✦",
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
    icon: "◎",
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

function getRoleStyle(role: string) {
  return (
    ROLE_STYLE[role] ||
    ROLE_STYLE["Promising Player"]
  );
}

/* ============================================================
   THEME
============================================================ */

function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const readTheme = () => {
      const html = document.documentElement;
      const body = document.body;

      const theme = (
        html.getAttribute("data-theme") ||
        html.getAttribute("data-mode") ||
        body.getAttribute("data-theme") ||
        ""
      ).toLowerCase();

      if (theme === "dark") return true;
      if (theme === "light") return false;

      const classes =
        `${html.className} ${body.className}`.toLowerCase();

      if (/\blight\b/.test(classes)) return false;
      if (/\bdark\b/.test(classes)) return true;

      if (html.style.colorScheme === "light")
        return false;

      if (html.style.colorScheme === "dark")
        return true;

      try {
        const saved = localStorage.getItem("theme");

        if (saved === "light") return false;
        if (saved === "dark") return true;
      } catch {}

      return window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
    };

    const update = () => setIsDark(readTheme());

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
   CALCULATIONS
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
   PLAYER IMAGE
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
  const path = getPhotoPath(player);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [path]);

  return (
    <div
      className={`fcl-avatar relative shrink-0 overflow-hidden ${className}`}
    >
      <img
        src={failed ? PLACEHOLDER : path}
        alt={player.name}
        loading="lazy"
        decoding="async"
        onError={() => {
          if (!failed) setFailed(true);
        }}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.12]"
      />
    </div>
  );
}

/* ============================================================
   ROLE BADGE
============================================================ */

function RoleBadge({
  role,
  compact = false,
}: {
  role: string;
  compact?: boolean;
}) {
  const style = getRoleStyle(role);

  return (
    <span
      className={`fcl-role-badge inline-flex max-w-full items-center gap-1.5 rounded-full border font-extrabold ${
        compact
          ? "px-2 py-1 text-[9px]"
          : "px-2.5 py-1 text-[10px]"
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

      <span className="truncate">{role}</span>
    </span>
  );
}

/* ============================================================
   RANK
============================================================ */

function RankBadge({ rank }: { rank: number }) {
  const color =
    rank === 1
      ? "#f59e0b"
      : rank === 2
      ? "#94a3b8"
      : rank === 3
      ? "#fb923c"
      : "#1877F2";

  return (
    <span
      className="fcl-rank inline-flex h-7 min-w-7 items-center justify-center rounded-lg border px-1.5 text-[10px] font-black"
      style={{
        color,
        borderColor: `${color}50`,
        backgroundColor: `${color}15`,
      }}
    >
      #{rank}
    </span>
  );
}

/* ============================================================
   PREMIUM CARD — DESKTOP
============================================================ */

interface CardProps {
  player: Player;
  rank: number;
  showRank: boolean;
  maxPoints: number;
  onOpen: (player: Player) => void;
}

function PremiumPlayerCard({
  player,
  rank,
  showRank,
  maxPoints,
  onOpen,
}: CardProps) {
  const style = getRoleStyle(player.role);

  const points = calculateFclPoints(player);

  const percentage =
    maxPoints > 0
      ? Math.min(100, (points / maxPoints) * 100)
      : 0;

  const handleMouseMove = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    if (event.pointerType === "touch") return;

    const card = event.currentTarget;

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <button
      type="button"
      onClick={() => onOpen(player)}
      onMouseMove={handleMouseMove}
      className="fcl-premium-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:p-4"
      style={
        {
          "--accent": style.color,
        } as CSSProperties
      }
    >
      {/* Mouse spotlight */}

      <div className="fcl-card-spotlight pointer-events-none absolute inset-0" />

      {/* Top accent */}

      <div
        className="absolute inset-x-0 top-0 h-[2px] opacity-80"
        style={{
          background: `linear-gradient(90deg,transparent,${style.color},transparent)`,
        }}
      />

      {/* Ambient glow */}

      <div
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-15 blur-[45px]"
        style={{ backgroundColor: style.color }}
      />

      <div className="relative flex items-start gap-3">
        {/* Bigger Photo */}

        <div className="relative shrink-0">
          <div
            className="rounded-[19px] p-[2px]"
            style={{
              background: `linear-gradient(145deg,${style.color}90,transparent 75%)`,
            }}
          >
            <Avatar
              player={player}
              className="h-[88px] w-[88px] rounded-[17px] sm:h-[96px] sm:w-[96px]"
            />
          </div>

          {showRank && (
            <span className="absolute -bottom-2 -left-1">
              <RankBadge rank={rank} />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <p className="fcl-muted text-[8px] font-black uppercase tracking-[0.15em]">
            FCL OFFICIAL
          </p>

          <h3 className="fcl-heading mt-1 line-clamp-2 text-[14px] font-black leading-tight tracking-tight transition-colors duration-300 group-hover:text-[#1877F2] sm:text-[15px]">
            {player.name}
          </h3>

          {player.nickName && (
            <p className="fcl-muted mt-1 truncate text-[10px]">
              @{player.nickName}
            </p>
          )}

          <div className="mt-2">
            <RoleBadge role={player.role} compact />
          </div>
        </div>
      </div>

      {/* Statistics */}

      <div className="relative mt-4 grid grid-cols-3 gap-1.5">
        {[
          {
            label: "MATCHES",
            value: Number(player.matches) || 0,
            color: "var(--fcl-heading)",
          },
          {
            label: "RUNS",
            value: Number(player.runs) || 0,
            color: "#3b82f6",
          },
          {
            label: "WICKETS",
            value: Number(player.wickets) || 0,
            color: "#f59e0b",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="fcl-stat-box min-w-0 rounded-xl px-1.5 py-2.5 text-center"
          >
            <p
              className="truncate text-[17px] font-black leading-none"
              style={{ color: stat.color }}
            >
              {formatNumber(stat.value)}
            </p>

            <p className="fcl-muted mt-1.5 text-[8px] font-extrabold tracking-wide">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Points */}

      <div className="relative mt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="fcl-muted text-[9px] font-bold">
            FCL Performance
          </span>

          <span className="fcl-blue text-[17px] font-black leading-none">
            {formatNumber(points)}
            <span className="ml-1 text-[8px] font-bold">
              PTS
            </span>
          </span>
        </div>

        <div className="fcl-progress mt-2 h-[4px] overflow-hidden rounded-full">
          <div
            className="fcl-progress-fill h-full rounded-full"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg,#1877F2,${style.color})`,
            }}
          />
        </div>
      </div>

      {/* Footer */}

      <div className="fcl-card-footer relative mt-3 flex items-center justify-between border-t pt-3">
        <span className="fcl-blue text-[10px] font-black">
          View Player Card
        </span>

        <span className="fcl-card-arrow flex h-7 w-7 items-center justify-center rounded-lg text-base font-black">
          ↗
        </span>
      </div>
    </button>
  );
}

/* ============================================================
   MOBILE SPORTS APP CARD
============================================================ */

function MobilePlayerCard({
  player,
  rank,
  showRank,
  onOpen,
}: CardProps) {
  const style = getRoleStyle(player.role);

  const points = calculateFclPoints(player);

  return (
    <button
      type="button"
      onClick={() => onOpen(player)}
      className="fcl-mobile-card group relative flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-[19px] border p-2.5 text-left active:scale-[0.985]"
      style={
        {
          "--accent": style.color,
        } as CSSProperties
      }
    >
      <span
        className="absolute inset-y-3 left-0 w-[3px] rounded-r-full"
        style={{ backgroundColor: style.color }}
      />

      {/* Photo */}

      <div className="relative shrink-0">
        <Avatar
          player={player}
          className="h-[82px] w-[82px] rounded-[16px]"
        />

        {showRank && (
          <span className="absolute -left-1 -top-1">
            <RankBadge rank={rank} />
          </span>
        )}
      </div>

      {/* Player Info */}

      <div className="min-w-0 flex-1">
        <h3 className="fcl-heading truncate text-[13px] font-black leading-tight">
          {player.name}
        </h3>

        {player.nickName && (
          <p className="fcl-muted mt-0.5 truncate text-[9px]">
            @{player.nickName}
          </p>
        )}

        <div className="mt-1.5">
          <RoleBadge role={player.role} compact />
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <span className="fcl-mini-stat rounded-md px-1.5 py-1 text-[9px] font-black">
            M {Number(player.matches) || 0}
          </span>

          <span className="rounded-md bg-blue-500/10 px-1.5 py-1 text-[9px] font-black text-blue-500">
            R {Number(player.runs) || 0}
          </span>

          <span className="rounded-md bg-amber-500/10 px-1.5 py-1 text-[9px] font-black text-amber-500">
            W {Number(player.wickets) || 0}
          </span>
        </div>
      </div>

      {/* Points */}

      <div className="flex shrink-0 flex-col items-end justify-center self-stretch">
        <span className="fcl-blue text-[15px] font-black leading-none">
          {formatNumber(points)}
        </span>

        <span className="fcl-muted mt-1 text-[8px] font-bold">
          FCL PTS
        </span>

        <span className="fcl-mobile-arrow mt-auto flex h-7 w-7 items-center justify-center rounded-lg text-base font-black">
          ↗
        </span>
      </div>
    </button>
  );
}

/* ============================================================
   DESKTOP LIST ROW
============================================================ */

function PlayerListRow({
  player,
  rank,
  showRank,
  onOpen,
}: CardProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(player)}
        className="fcl-list-row group grid w-full grid-cols-[45px_minmax(180px,2fr)_minmax(150px,1.4fr)_repeat(4,minmax(70px,.7fr))] items-center gap-3 px-4 py-2.5 text-left"
      >
        <span>
          {showRank ? (
            <RankBadge rank={rank} />
          ) : (
            <span className="fcl-muted text-xs">
              —
            </span>
          )}
        </span>

        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            player={player}
            className="h-12 w-12 rounded-xl"
          />

          <div className="min-w-0">
            <p className="fcl-heading truncate text-xs font-black group-hover:text-blue-500">
              {player.name}
            </p>

            {player.nickName && (
              <p className="fcl-muted mt-1 truncate text-[10px]">
                @{player.nickName}
              </p>
            )}
          </div>
        </div>

        <RoleBadge role={player.role} compact />

        <span className="text-right text-xs font-bold">
          {formatNumber(Number(player.matches) || 0)}
        </span>

        <span className="text-right text-xs font-bold">
          {formatNumber(Number(player.runs) || 0)}
        </span>

        <span className="text-right text-xs font-bold text-amber-500">
          {formatNumber(Number(player.wickets) || 0)}
        </span>

        <span className="fcl-blue text-right text-xs font-black">
          {formatNumber(calculateFclPoints(player))}
        </span>
      </button>
    </li>
  );
}

/* ============================================================
   PREMIUM MODAL / BOTTOM SHEET
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

    const oldOverflow = document.body.style.overflow;

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
            'button:not([disabled]),a[href],input,select,[tabindex]:not([tabindex="-1"])'
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
      document.body.style.overflow = oldOverflow;

      window.removeEventListener("keydown", handleKey);

      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-5">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fcl-sheet-title"
        className="fcl-sheet relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[26px] border shadow-2xl sm:rounded-[26px]"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-slate-400/40 sm:hidden" />

        <div className="fcl-sheet-header flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="fcl-blue text-[9px] font-black uppercase tracking-[0.18em]">
              FCL DIRECTORY
            </p>

            <h3
              id="fcl-sheet-title"
              className="fcl-heading mt-1 text-lg font-black"
            >
              {title}
            </h3>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="fcl-icon-btn flex h-9 w-9 items-center justify-center rounded-xl"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROLE CRITERIA
============================================================ */

function CriteriaContent() {
  return (
    <div>
      <p className="fcl-muted mb-4 text-xs leading-6">
        FCL-এর প্রতিটি প্লেয়ারের ব্যাটিং এভারেজ এবং
        প্রতি ম্যাচে উইকেটের গড় অনুযায়ী স্বয়ংক্রিয়ভাবে
        Role নির্ধারণ করা হয়।
      </p>

      <div className="space-y-2">
        {ROLES.filter((role) => role !== "All").map(
          (role) => {
            const style = getRoleStyle(role);

            return (
              <div
                key={role}
                className="flex items-center gap-3 rounded-xl border p-3"
                style={{
                  borderColor: `${style.color}35`,
                  backgroundColor: `${style.color}08`,
                }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{
                    backgroundColor: `${style.color}15`,
                  }}
                >
                  {style.icon}
                </span>

                <div>
                  <h4
                    className="text-xs font-black"
                    style={{ color: style.color }}
                  >
                    {role}
                  </h4>

                  <p className="fcl-muted mt-1 text-[11px] leading-5">
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
   SKELETON
============================================================ */

function PlayerSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="fcl-skeleton h-[106px] animate-pulse rounded-[19px] border sm:h-[255px]"
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

  const [showSortSheet, setShowSortSheet] =
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
          throw new Error("Failed to load players");
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

        console.error("FCL Players Error:", err);

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
     PAGINATION RESET
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
     FILTER AND SORT
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

  const activeSort = SORTS.find(
    (sort) => sort.key === sortBy
  )!;

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

  const itemProps = (
    player: Player,
    index: number
  ): CardProps => ({
    player,
    rank: index + 1,
    showRank,
    maxPoints,
    onOpen: openPlayer,
  });

  const headerStats = [
    {
      label: "PLAYERS",
      value: players.length,
      icon: "♟",
      color: "#3b82f6",
    },
    {
      label: "MATCHES",
      value: totals.matches,
      icon: "⚡",
      color: "#22c55e",
    },
    {
      label: "RUNS",
      value: totals.runs,
      icon: "🏏",
      color: "#38bdf8",
    },
    {
      label: "WICKETS",
      value: totals.wickets,
      icon: "◎",
      color: "#f59e0b",
    },
  ];

  /* ============================================================
     CONTENT
  ============================================================ */

  const renderContent = () => {
    if (loading) {
      return <PlayerSkeleton />;
    }

    if (error) {
      return (
        <div className="fcl-empty rounded-2xl border px-5 py-12 text-center">
          <div className="text-4xl">⚠️</div>

          <h3 className="fcl-heading mt-3 text-lg font-black">
            Player Data Unavailable
          </h3>

          <p className="fcl-muted mt-2 text-xs">
            প্লেয়ারদের তথ্য লোড করা যাচ্ছে না।
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="fcl-primary mt-5 rounded-xl px-6 py-3 text-xs font-black"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!filteredPlayers.length) {
      return (
        <div className="fcl-empty rounded-2xl border px-5 py-12 text-center">
          <div className="text-4xl">🔎</div>

          <h3 className="fcl-heading mt-3 text-lg font-black">
            No Players Found
          </h3>

          <p className="fcl-muted mt-2 text-xs">
            আপনার সার্চ অনুযায়ী কোনো প্লেয়ার পাওয়া যায়নি।
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="fcl-primary mt-5 rounded-xl px-6 py-3 text-xs font-black"
          >
            Clear Filters
          </button>
        </div>
      );
    }

    return (
      <>
        {/* MOBILE APP CARDS */}

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:hidden">
          {visiblePlayers.map((player, index) => (
            <MobilePlayerCard
              key={`${player.id ?? player.name}-${index}`}
              {...itemProps(player, index)}
            />
          ))}
        </div>

        {/* DESKTOP PREMIUM GRID */}

        {view === "grid" ? (
          <div className="hidden grid-cols-3 gap-3 lg:grid xl:grid-cols-4">
            {visiblePlayers.map((player, index) => (
              <PremiumPlayerCard
                key={`${player.id ?? player.name}-${index}`}
                {...itemProps(player, index)}
              />
            ))}
          </div>
        ) : (
          <div className="fcl-table hidden overflow-x-auto rounded-2xl border lg:block">
            <div className="min-w-[900px]">
              <div className="fcl-table-head grid grid-cols-[45px_minmax(180px,2fr)_minmax(150px,1.4fr)_repeat(4,minmax(70px,.7fr))] items-center gap-3 border-b px-4 py-3 text-[10px] font-black uppercase tracking-wider">
                <span>#</span>
                <span>Player</span>
                <span>Role</span>
                <span className="text-right">Matches</span>
                <span className="text-right">Runs</span>
                <span className="text-right">Wickets</span>
                <span className="text-right">Points</span>
              </div>

              <ul className="fcl-table-list">
                {visiblePlayers.map((player, index) => (
                  <PlayerListRow
                    key={`${player.id ?? player.name}-${index}`}
                    {...itemProps(player, index)}
                  />
                ))}
              </ul>
            </div>
          </div>
        )}
      </>
    );
  };

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div
      className={`fcl-directory ${
        isDark ? "fcl-dark" : "fcl-light"
      } relative min-h-screen overflow-x-clip pb-10 font-sans`}
    >
      {/* ========================================================
          PREMIUM CSS
      ======================================================== */}

      <style jsx global>{`

        .fcl-directory {
          --fcl-bg: #ffffff;
          --fcl-bg-alt: #f1f5f9;
          --fcl-card: #ffffff;
          --fcl-card-alt: #f8fafc;
          --fcl-heading: #0f172a;
          --fcl-text: #475569;
          --fcl-muted: #64748b;
          --fcl-border: #e2e8f0;
          --fcl-blue: #1d4ed8;
          --fcl-grid: rgba(100,116,139,.09);

          background: var(--fcl-bg);
          color: var(--fcl-heading);

          transition:
            background .3s ease,
            color .3s ease;
        }

        .fcl-directory.fcl-dark {
          --fcl-bg: #020617;
          --fcl-bg-alt: #02050b;
          --fcl-card: #0f172a;
          --fcl-card-alt: #0b1220;
          --fcl-heading: #ffffff;
          --fcl-text: #cbd5e1;
          --fcl-muted: #94a3b8;
          --fcl-border: #1e293b;
          --fcl-blue: #60a5fa;
          --fcl-grid: rgba(148,163,184,.055);
        }

        .fcl-heading {
          color: var(--fcl-heading);
        }

        .fcl-text {
          color: var(--fcl-text);
        }

        .fcl-muted {
          color: var(--fcl-muted);
        }

        .fcl-blue {
          color: var(--fcl-blue);
        }

        /* ======================================================
            HERO BACKGROUND
        ====================================================== */

                .fcl-hero {
          background: var(--fcl-bg-alt);
          border-color: var(--fcl-border);
          padding-top: 2rem;
        }

        @media (min-width: 640px) {
          .fcl-hero {
            padding-top: 3rem;
          }
        }

        .fcl-grid-bg {
          background-image:
            linear-gradient(
              to right,
              var(--fcl-grid) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              var(--fcl-grid) 1px,
              transparent 1px
            );

          background-size: 46px 46px;

          -webkit-mask-image:
            radial-gradient(
              ellipse 85% 100% at 50% 15%,
              black 20%,
              transparent 95%
            );

          mask-image:
            radial-gradient(
              ellipse 85% 100% at 50% 15%,
              black 20%,
              transparent 95%
            );
        }

        /* ======================================================
            GRADIENT TITLE
        ====================================================== */

        .fcl-gradient-text {
          background:
            linear-gradient(
              90deg,
              #1877F2,
              #38bdf8,
              #a855f7,
              #1877F2
            );

          background-size: 250% auto;

          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;

          animation: fclGradient 6s ease infinite;
        }

        @keyframes fclGradient {
          0%,100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        /* ======================================================
            FLOATING BLUR SHAPES
        ====================================================== */

        .fcl-orb {
          animation: fclFloat 10s ease-in-out infinite;
          will-change: transform;
        }

        .fcl-orb-delay {
          animation-delay: -5s;
        }

        @keyframes fclFloat {
          0%,100% {
            transform: translate3d(0,0,0) scale(1);
          }

          50% {
            transform: translate3d(20px,-20px,0) scale(1.08);
          }
        }

        /* ======================================================
            HERO BADGE
        ====================================================== */

        .fcl-hero-badge {
          color: var(--fcl-blue);
          background: rgba(24,119,242,.09);
          border-color: rgba(24,119,242,.28);
        }

        /* ======================================================
            COMPACT STAT STRIP
        ====================================================== */

        .fcl-stat-strip {
          background:
            linear-gradient(
              135deg,
              var(--fcl-card),
              var(--fcl-card-alt)
            );

          border-color: var(--fcl-border);

          box-shadow:
            0 8px 30px rgba(15,23,42,.05);
        }

        .fcl-stat-divider {
          border-color: var(--fcl-border);
        }

        /* ======================================================
            COMPARE CTA
        ====================================================== */

        .fcl-compare {
          background:
            linear-gradient(
              110deg,
              rgba(245,158,11,.13),
              rgba(24,119,242,.10),
              rgba(168,85,247,.10)
            );

          border-color: rgba(245,158,11,.35);

          transition:
            transform .3s ease,
            border-color .3s ease,
            box-shadow .3s ease;
        }

        .fcl-compare:hover {
          transform: translateY(-2px);

          border-color: rgba(245,158,11,.75);

          box-shadow:
            0 15px 40px rgba(24,119,242,.12);
        }

        .fcl-compare-icon {
          animation: fclSword 4s ease-in-out infinite;
        }

        @keyframes fclSword {
          0%,100% {
            transform: rotate(-5deg);
          }

          50% {
            transform: rotate(7deg) scale(1.08);
          }
        }

        /* ======================================================
            FILTER TOOLBAR
        ====================================================== */

        .fcl-toolbar {
          background: var(--fcl-card);
          border-color: var(--fcl-border);

          box-shadow:
            0 6px 25px rgba(15,23,42,.04);
        }

        .fcl-search {
          background: var(--fcl-card-alt);
          border-color: var(--fcl-border);
          color: var(--fcl-heading);

          transition:
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .fcl-search::placeholder {
          color: var(--fcl-muted);
          opacity: .8;
        }

        .fcl-search:focus {
          border-color: #1877F2;
          box-shadow: 0 0 0 3px rgba(24,119,242,.10);
        }

        /* ======================================================
            BUTTONS
        ====================================================== */

        .fcl-primary {
          background:
            linear-gradient(
              135deg,
              #1877F2,
              #2563eb
            );

          color: white;

          box-shadow:
            0 7px 20px rgba(24,119,242,.20);

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .fcl-primary:hover {
          transform: translateY(-2px);

          box-shadow:
            0 12px 28px rgba(24,119,242,.30);
        }

        .fcl-secondary {
          background: var(--fcl-card-alt);
          border-color: var(--fcl-border);
          color: var(--fcl-heading);

          transition: all .25s ease;
        }

        .fcl-secondary:hover {
          border-color: #1877F2;
          color: var(--fcl-blue);
        }

        .fcl-icon-btn {
          background: var(--fcl-card-alt);
          color: var(--fcl-heading);
        }

        /* ======================================================
            ROLE CHIPS
        ====================================================== */

        .fcl-role-chip {
          background: var(--fcl-card);
          border-color: var(--fcl-border);
          color: var(--fcl-text);

          transition:
            background .25s ease,
            border-color .25s ease,
            transform .25s ease,
            box-shadow .25s ease;
        }

        .fcl-role-chip:hover {
          transform: translateY(-2px);
          border-color: rgba(24,119,242,.45);
        }

        .fcl-role-chip-active {
          background:
            linear-gradient(
              135deg,
              #1877F2,
              #2563eb
            ) !important;

          border-color: #1877F2 !important;
          color: white !important;

          box-shadow:
            0 6px 18px rgba(24,119,242,.22);
        }

        .fcl-role-badge {
          color:
            color-mix(
              in srgb,
              var(--accent) 70%,
              #0f172a
            );
        }

        .fcl-dark .fcl-role-badge {
          color: var(--accent);
        }

        /* ======================================================
            PLAYER AVATAR
        ====================================================== */

        .fcl-avatar {
          background: var(--fcl-bg-alt);
          border: 1px solid rgba(24,119,242,.15);
        }

        /* ======================================================
            PREMIUM DESKTOP CARD
        ====================================================== */

        .fcl-premium-card {
          background:
            linear-gradient(
              145deg,
              var(--fcl-card),
              var(--fcl-card-alt)
            );

          border-color: var(--fcl-border);

          box-shadow:
            0 5px 20px rgba(15,23,42,.045);

          transition:
            transform .4s cubic-bezier(.2,.8,.2,1),
            border-color .35s ease,
            box-shadow .35s ease;

          animation: fclCardEnter .55s both;
        }

        .fcl-premium-card:hover {
          transform: translateY(-6px);

          border-color:
            color-mix(
              in srgb,
              var(--accent) 60%,
              transparent
            );

          box-shadow:
            0 20px 45px rgba(24,119,242,.13);
        }

        .fcl-card-spotlight {
          opacity: 0;

          background:
            radial-gradient(
              260px circle at var(--mouse-x,50%) var(--mouse-y,50%),
              color-mix(
                in srgb,
                var(--accent) 14%,
                transparent
              ),
              transparent 70%
            );

          transition: opacity .3s ease;
        }

        .fcl-premium-card:hover .fcl-card-spotlight {
          opacity: 1;
        }

        @keyframes fclCardEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fcl-stat-box {
          background: var(--fcl-bg-alt);
          border: 1px solid var(--fcl-border);
        }

        .fcl-progress {
          background: var(--fcl-bg-alt);
        }

        .fcl-progress-fill {
          transition: width .8s ease;
        }

        .fcl-card-footer {
          border-color: var(--fcl-border);
        }

        .fcl-card-arrow {
          color: var(--fcl-blue);
          background: rgba(24,119,242,.10);

          transition:
            transform .3s ease,
            background .3s ease,
            color .3s ease;
        }

        .fcl-premium-card:hover .fcl-card-arrow {
          transform: translate(2px,-2px);
          background: #1877F2;
          color: white;
        }

        /* ======================================================
            MOBILE APP CARD
        ====================================================== */

        .fcl-mobile-card {
          background:
            linear-gradient(
              110deg,
              var(--fcl-card),
              var(--fcl-card-alt)
            );

          border-color: var(--fcl-border);

          box-shadow:
            0 4px 15px rgba(15,23,42,.045);

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;

          animation: fclCardEnter .45s both;
        }

        .fcl-mobile-card:active {
          border-color: var(--accent);

          box-shadow:
            0 8px 25px rgba(24,119,242,.12);
        }

        .fcl-mini-stat {
          background: var(--fcl-bg-alt);
          color: var(--fcl-muted);
        }

        .fcl-mobile-arrow {
          color: var(--fcl-blue);
          background: rgba(24,119,242,.10);
        }

        /* ======================================================
            RANK BADGE
        ====================================================== */

        .fcl-rank {
          backdrop-filter: blur(12px);
          background-clip: padding-box;
        }

        /* ======================================================
            DESKTOP TABLE
        ====================================================== */

        .fcl-table {
          background: var(--fcl-card);
          border-color: var(--fcl-border);
        }

        .fcl-table-head {
          background: var(--fcl-card-alt);
          border-color: var(--fcl-border);
          color: var(--fcl-muted);
        }

        .fcl-table-list > li:not(:first-child) {
          border-top: 1px solid var(--fcl-border);
        }

        .fcl-list-row {
          transition: background .2s ease;
        }

        .fcl-list-row:hover {
          background: var(--fcl-card-alt);
        }

        /* ======================================================
            MODAL
        ====================================================== */

        .fcl-sheet {
          background: var(--fcl-card);
          border-color: var(--fcl-border);

          animation: fclSheetEnter .3s ease-out;
        }

        .fcl-sheet-header {
          border-color: var(--fcl-border);
        }

        @keyframes fclSheetEnter {
          from {
            opacity: 0;
            transform: translateY(25px) scale(.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* ======================================================
            LOADING / EMPTY
        ====================================================== */

        .fcl-skeleton,
        .fcl-empty {
          background: var(--fcl-card);
          border-color: var(--fcl-border);
        }

        /* ======================================================
            SCROLLBAR
        ====================================================== */

        .fcl-no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .fcl-no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* ======================================================
            MOBILE OPTIMIZATION
        ====================================================== */

        @media (max-width: 639px) {
          .fcl-premium-card,
          .fcl-mobile-card {
            animation-duration: .35s;
          }

          .fcl-mobile-card {
            min-height: 104px;
          }
        }

        /* ======================================================
            REDUCED MOTION
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {
          .fcl-directory *,
          .fcl-directory *::before,
          .fcl-directory *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }

      `}</style>

      {/* ========================================================
          COMPACT HERO
      ======================================================== */}

      <section className="fcl-hero relative overflow-hidden border-b">
        <div className="fcl-grid-bg pointer-events-none absolute inset-0" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(24,119,242,0.08),transparent_65%)]" />

        <div className="fcl-orb pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[#1877F2]/15 blur-[100px]" />

        <div className="fcl-orb fcl-orb-delay pointer-events-none absolute -bottom-36 -left-24 h-72 w-72 rounded-full bg-purple-500/10 blur-[110px]" />

        <div className="relative mx-auto max-w-[1500px] px-3.5 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8 lg:pb-14 lg:pt-14">
          {/* Breadcrumb */}

          <div className="mb-3 flex items-center gap-2">
            <Link
              href="/"
              className="fcl-blue text-[10px] font-bold transition hover:opacity-70"
            >
              ← Home
            </Link>

            <span className="fcl-muted text-[10px]">
              /
            </span>

            <span className="fcl-muted text-[10px] font-semibold">
              Players
            </span>
          </div>

          {/* Hero Main */}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pb-6 sm:pb-8">
            <div className="min-w-0">
              <div className="fcl-hero-badge mb-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_#22c55e]" />

                <span className="text-[9px] font-black uppercase tracking-[0.16em]">
                  FCL OFFICIAL DIRECTORY
                </span>
              </div>

              <h1 className="fcl-heading text-[31px] font-black leading-none tracking-[-0.045em] sm:text-[42px] lg:text-[46px]">
                Player{" "}
                <span className="fcl-gradient-text">
                  Directory.
                </span>
              </h1>

              <p className="fcl-text mt-2.5 max-w-[680px] text-[11px] leading-5 sm:text-xs">
                FCL-এর সকল ক্রিকেটার, পারফরম্যান্স,
                রেটিং ও অফিসিয়াল Player Card —
                সবকিছু এক জায়গায়।
              </p>
            </div>

            {/* Compare CTA */}

            <Link
              href="/players/compare"
              className="fcl-compare group relative flex items-center gap-3 overflow-hidden rounded-[17px] border p-3 sm:p-3.5 lg:w-[340px] lg:shrink-0"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/15 blur-[35px]" />

              <span className="fcl-compare-icon relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-amber-500/15 text-[25px]">
                ⚔️
              </span>

              <div className="relative min-w-0 flex-1">
                <p className="text-[8px] font-black uppercase tracking-[0.15em] text-amber-500">
                  FCL AUCTION ANALYTICS
                </p>

                <h2 className="fcl-heading mt-1 text-xs font-black sm:text-sm">
                  Compare Players
                </h2>

                <p className="fcl-muted mt-0.5 text-[10px]">
                  ২–৪ জন প্লেয়ারের পারফরম্যান্স তুলনা
                </p>
              </div>

              <span className="fcl-primary relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-black transition group-hover:translate-x-1">
                ↗
              </span>
            </Link>
          </div>

          {/* Compact Statistics */}

          <div className="fcl-stat-strip mt-4 grid grid-cols-4 overflow-hidden rounded-[17px] border sm:mt-5 lg:max-w-[850px]">
            {headerStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`relative flex min-w-0 flex-col items-center justify-center px-1 py-3 sm:flex-row sm:gap-3 sm:px-4 sm:py-3.5 ${
                  index !== 0
                    ? "fcl-stat-divider border-l"
                    : ""
                }`}
              >
                <span
                  className="text-[15px] sm:text-xl"
                  style={{ color: stat.color }}
                >
                  {stat.icon}
                </span>

                <div className="mt-1 text-center sm:mt-0 sm:text-left">
                  <p
                    className="text-[16px] font-black leading-none sm:text-[23px]"
                    style={{ color: stat.color }}
                  >
                    {loading
                      ? "..."
                      : formatNumber(stat.value)}
                  </p>

                  <p className="fcl-muted mt-1 text-[8px] font-black tracking-wide sm:text-[9px]">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="relative mx-auto max-w-[1500px] px-3.5 pt-4 sm:px-6 sm:pt-5 lg:px-8">
        {/* ======================================================
            SEARCH TOOLBAR
        ====================================================== */}

        <div className="fcl-toolbar rounded-[18px] border p-2.5 sm:p-3">
          <div className="flex items-center gap-2">
            {/* Search */}

            <div className="relative min-w-0 flex-1">
              <span className="fcl-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base">
                ⌕
              </span>

              <input
                type="search"
                aria-label="Search players"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                className="fcl-search h-11 w-full rounded-xl border pl-10 pr-9 text-[11px] font-semibold outline-none sm:text-xs"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="fcl-muted absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Sort */}

            <button
              type="button"
              onClick={() => setShowSortSheet(true)}
              className="fcl-primary flex h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-[11px] font-black lg:hidden"
            >
              <span>☷</span>

              <span>Sort</span>
            </button>

            {/* Desktop Sort */}

            <div className="hidden items-center gap-2 lg:flex">
              <span className="fcl-muted text-[10px] font-bold">
                Sort:
              </span>

              <div className="flex gap-1">
                {SORTS.map((sort) => (
                  <button
                    key={sort.key}
                    type="button"
                    onClick={() => setSortBy(sort.key)}
                    aria-pressed={sortBy === sort.key}
                    className={`rounded-lg px-3 py-2.5 text-[10px] font-black transition-all ${
                      sortBy === sort.key
                        ? "fcl-primary"
                        : "fcl-secondary border"
                    }`}
                  >
                    {sort.short}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop View */}

            <div className="hidden items-center gap-1 rounded-xl border border-blue-500/15 p-1 lg:flex">
              {(["grid", "list"] as const).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setView(item)}
                    aria-label={`${item} view`}
                    aria-pressed={view === item}
                    className={`flex h-8 w-9 items-center justify-center rounded-lg text-base font-black transition ${
                      view === item
                        ? "fcl-primary"
                        : "fcl-muted"
                    }`}
                  >
                    {item === "grid" ? "▦" : "☷"}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Horizontal Role Filters */}

          <div className="mt-2.5 flex items-center gap-2">
            <div className="fcl-no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5">
              {ROLES.map((role) => {
                const style =
                  role === "All"
                    ? null
                    : getRoleStyle(role);

                const active = selectedRole === role;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    aria-pressed={active}
                    className={`fcl-role-chip flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-[10px] font-black ${
                      active
                        ? "fcl-role-chip-active"
                        : ""
                    }`}
                  >
                    <span>
                      {style ? style.icon : "✦"}
                    </span>

                    <span>
                      {role === "All"
                        ? "All Players"
                        : role}
                    </span>

                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] ${
                        active
                          ? "bg-white/20"
                          : "bg-blue-500/10"
                      }`}
                    >
                      {roleCounts[role] || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Criteria Button */}

            <button
              type="button"
              onClick={() => setShowCriteria(true)}
              aria-label="How player roles are determined"
              className="fcl-secondary flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-xl border text-sm font-black"
            >
              ⓘ
            </button>
          </div>
        </div>

        {/* ======================================================
            RESULTS HEADER
        ====================================================== */}

        <div className="mb-3 mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="fcl-blue text-[8px] font-black uppercase tracking-[0.16em]">
              OFFICIAL FCL COLLECTION
            </p>

            <h2 className="fcl-heading mt-0.5 text-[17px] font-black tracking-tight sm:text-xl">
              Player Profiles
              {!loading && (
                <span className="fcl-muted ml-2 text-[11px] font-bold">
                  ({filteredPlayers.length})
                </span>
              )}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {hasActiveFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="fcl-secondary rounded-lg border px-2.5 py-2 text-[10px] font-black"
              >
                ↺ Reset
              </button>
            )}

            {!loading && !error && (
              <span className="fcl-muted text-[10px] font-bold">
                {visiblePlayers.length}
                <span className="mx-1 opacity-50">
                  /
                </span>
                {filteredPlayers.length}
              </span>
            )}
          </div>
        </div>

        {/* ======================================================
            PLAYER CARDS
        ====================================================== */}

        {renderContent()}

        {/* ======================================================
            LOAD MORE
        ====================================================== */}

        {!loading && !error && remaining > 0 && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="fcl-progress h-1 w-full max-w-[230px] overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 transition-all duration-500"
                style={{
                  width: `${
                    (visiblePlayers.length /
                      filteredPlayers.length) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount(
                    (count) => count + PAGE_SIZE
                  )
                }
                className="fcl-primary rounded-xl px-5 py-3 text-[11px] font-black"
              >
                Show {Math.min(PAGE_SIZE, remaining)} More
                ↓
              </button>

              <button
                type="button"
                onClick={() =>
                  setVisibleCount(filteredPlayers.length)
                }
                className="fcl-secondary rounded-xl border px-5 py-3 text-[11px] font-black"
              >
                Show All ({remaining})
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            COMPACT FOOTER
        ====================================================== */}

        {!loading && !error && (
          <footer className="mt-8 flex items-center justify-center gap-2 text-center">
            <span className="text-sm">🏏</span>

            <span className="fcl-muted text-[10px] font-bold">
              Facebook Cricket League
            </span>

            <span className="fcl-muted text-[10px] opacity-40">
              •
            </span>

            <span className="fcl-muted text-[10px]">
              Official Player Directory
            </span>
          </footer>
        )}
      </main>

      {/* ========================================================
          MOBILE SORT SHEET
      ======================================================== */}

      <Sheet
        open={showSortSheet}
        onClose={() => setShowSortSheet(false)}
        title="Sort Players"
      >
        <div className="space-y-2">
          {SORTS.map((sort) => {
            const active = sortBy === sort.key;

            return (
              <button
                key={sort.key}
                type="button"
                onClick={() => {
                  setSortBy(sort.key);
                  setShowSortSheet(false);
                }}
                aria-pressed={active}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all ${
                  active
                    ? "border-blue-500 bg-blue-500/10"
                    : "fcl-secondary"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">
                    {sort.icon}
                  </span>

                  <span
                    className={`text-xs font-black ${
                      active
                        ? "fcl-blue"
                        : "fcl-heading"
                    }`}
                  >
                    {sort.label}
                  </span>
                </span>

                {active && (
                  <span className="fcl-blue text-lg font-black">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Sheet>

      {/* ========================================================
          ROLE CRITERIA MODAL
      ======================================================== */}

      <Sheet
        open={showCriteria}
        onClose={() => setShowCriteria(false)}
        title="Player Role Criteria"
      >
        <CriteriaContent />
      </Sheet>

      {/* ========================================================
          EXISTING PLAYER CARD MODAL
      ======================================================== */}

      <PlayerCardModal
        selectedPlayer={selectedPlayer}
        onClose={closePlayer}
        tournamentsData={tournamentsData}
        allPlayers={players}
      />
    </div>
  );
}