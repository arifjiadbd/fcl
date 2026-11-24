"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

import MatchHighlightsModal from "@/components/MatchHighlightsModal";
import type { ReplayMatch } from "@/lib/matchReplay";
import { summaryToReplay } from "@/lib/summaryToReplay";

/* ================================================================
   TYPES
================================================================ */

interface MatchItem {
  id: number;
  date: string;
  year: string;
  month: string;
  title: string;
  category: string;
  summary: string;
  link: string;
  rawDateVal?: number | string;
}

type CatKey =
  | "tournament"
  | "series"
  | "friendly"
  | "test"
  | "other";

/* ================================================================
   CONSTANTS
================================================================ */

// Stadium background image (put the file in /public and set its path here).
const MATCH_BG = "/fcl-header-stadium.webp";

const SIDE_LABEL: Record<string, string> = {
  all: "All Matches",
  tournament: "Tournaments",
  series: "Series",
  friendly: "Friendlies",
  test: "Test Matches",
};

const TILE_LABEL: Record<string, string> = {
  all: "Total Matches",
  tournament: "Tournaments",
  series: "Series",
  friendly: "Friendlies",
  test: "Test",
};

const TAG_LABEL: Record<string, string> = {
  tournament: "Tournament",
  series: "Series",
  friendly: "Friendly",
  test: "Test",
  other: "Match",
};

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  const nums = Array.from(set)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const CATEGORIES = [
  {
    key: "all",
    label: "All Matches",
    short: "All",
    icon: "🌐",
    color: "#1877F2",
  },
  {
    key: "tournament",
    label: "Tournament Home",
    short: "Tournament",
    icon: "🏆",
    color: "#f59e0b",
  },
  {
    key: "series",
    label: "Series Match",
    short: "Series",
    icon: "⚡",
    color: "#1877F2",
  },
  {
    key: "friendly",
    label: "Friendly Match",
    short: "Friendly",
    icon: "🤝",
    color: "#22c55e",
  },
  {
    key: "test",
    label: "Test Match",
    short: "Test",
    icon: "🛡️",
    color: "#f43f5e",
  },
] as const;

/* ================================================================
   MEDIA QUERY
================================================================ */

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);

    const update = () => setMatches(mq.matches);

    update();

    mq.addEventListener("change", update);

    return () => {
      mq.removeEventListener("change", update);
    };
  }, [query]);

  return matches;
}

/* ================================================================
   DATE HELPERS
================================================================ */

function isExcelSerial(val: unknown): boolean {
  if (val === null || val === undefined || val === "") {
    return false;
  }

  const num = Number(val);

  return (
    Number.isFinite(num) &&
    num > 20000 &&
    num < 60000
  );
}

function parseMatchDate(
  dateStr: string | number,
  yearStr: string
): number {
  if (!dateStr) return 0;

  const num = Number(dateStr);

  if (isExcelSerial(dateStr)) {
    const utcDays = Math.floor(num - 25569);

    return utcDays * 86400 * 1000;
  }

  const parsed = Date.parse(String(dateStr));

  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  const parsedWithYear = Date.parse(
    `${dateStr} ${yearStr || ""}`
  );

  if (!Number.isNaN(parsedWithYear)) {
    return parsedWithYear;
  }

  return 0;
}

function formatExcelDate(val: unknown): string {
  if (!val) return "";

  const strVal = String(val).trim();

  // যদি ISO Date string বা সাধারণ ডেট স্ট্রিং হয় (যেমন: 2026-10-29T18:00:00.000Z)
  if (strVal.includes("T") || !Number.isNaN(Date.parse(strVal))) {
    const d = new Date(strVal);
    if (!isNaN(d.getTime())) {
      const day = String(d.getUTCDate()).padStart(2, "0");
      const month = MONTHS[d.getUTCMonth()];
      const year = d.getUTCFullYear();
      return `${day} ${month} ${year}`;
    }
  }

  // যদি এক্সেল সিরিয়াল নম্বর হয়
  const num = Number(val);
  if (isExcelSerial(val)) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const day = String(dateInfo.getUTCDate()).padStart(2, "0");
    return `${day} ${MONTHS[dateInfo.getUTCMonth()]} ${dateInfo.getUTCFullYear()}`;
  }

  return strVal;
}

function getDateParts(
  dateStr: string,
  yearStr: string
) {
  const ts = parseMatchDate(dateStr, yearStr);

  if (!ts) return null;

  const d = new Date(ts);

  if (isExcelSerial(dateStr)) {
    return {
      day: d.getUTCDate(),
      month: d.getUTCMonth(),
      year: d.getUTCFullYear(),
    };
  }

  return {
    day: d.getUTCDate(),
    month: d.getUTCMonth(),
    year: d.getUTCFullYear(),
  };
}

function getGroupLabel(match: MatchItem): string {
  const parts = getDateParts(
    match.date,
    match.year
  );

  if (parts) {
    return `${MONTHS[parts.month]} ${parts.year}`;
  }

  if (match.month && match.year) {
    return `${match.month} ${match.year}`;
  }

  return "Undated";
}

/* ================================================================
   CATEGORY HELPERS
================================================================ */

function getCategoryStyle(category: string) {
  const c = (category || "").toLowerCase();

  if (c.includes("tournament")) {
    return {
      key: "tournament" as CatKey,
      icon: "🏆",
      color: "#f59e0b",
    };
  }

  if (c.includes("series")) {
    return {
      key: "series" as CatKey,
      icon: "⚡",
      color: "#1877F2",
    };
  }

  if (c.includes("friendly")) {
    return {
      key: "friendly" as CatKey,
      icon: "🤝",
      color: "#22c55e",
    };
  }

  if (c.includes("test")) {
    return {
      key: "test" as CatKey,
      icon: "🛡️",
      color: "#f43f5e",
    };
  }

  return {
    key: "other" as CatKey,
    icon: "📌",
    color: "#64748b",
  };
}

/* ================================================================
   SUMMARY HIGHLIGHTS
================================================================ */

function renderHighlightedParts(text: string) {
  if (!text) return null;

  const parts = text.split(
    /(\*\*[\s\S]*?\*\*|\*[^*]+\*)/g
  );

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**") &&
      part.length >= 4
    ) {
      const clean = part.slice(2, -2).trim();

      return (
        <span
          key={index}
          className="match-highlight mx-0.5 my-0.5 inline-block rounded-md px-1.5 py-0.5 font-extrabold"
        >
          {clean}
        </span>
      );
    }

    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      !part.startsWith("**")
    ) {
      const clean = part.slice(1, -1).trim();

      return (
        <span
          key={index}
          className="match-highlight mx-0.5 my-0.5 inline-block rounded-md px-1.5 py-0.5 font-extrabold"
        >
          {clean}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function renderTextWithHighlights(text: string) {
  if (!text) {
    return (
      <p className="match-muted">
        No match summary available.
      </p>
    );
  }

  const lines = text.split("\n");

  return lines.map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={index} className="h-3" />;
    }

    const isDialogLine =
      /^[^:\n]+:\s/.test(trimmed);

    if (isDialogLine) {
      const colonIndex = trimmed.indexOf(":");

      const speaker = trimmed.substring(
        0,
        colonIndex + 1
      );

      const dialogue = trimmed.substring(
        colonIndex + 1
      );

      return (
        <p
          key={index}
          className="my-2 break-words leading-7"
        >
          <strong className="match-highlight mr-1 inline-block rounded-md px-2 py-0.5 font-extrabold">
            {speaker}
          </strong>

          <span>
            {renderHighlightedParts(dialogue)}
          </span>
        </p>
      );
    }

    return (
      <p
        key={index}
        className="my-1.5 break-words leading-7"
      >
        {renderHighlightedParts(trimmed)}
      </p>
    );
  });
}

/* ================================================================
   CATEGORY BADGE
================================================================ */

function CatBadge({
  category,
  small = false,
}: {
  category: string;
  small?: boolean;
}) {
  const style = getCategoryStyle(category);

  return (
    <span
      className={`match-category-badge inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border font-black ${
        small
          ? "px-2 py-1 text-[9px]"
          : "px-3 py-1.5 text-[10px]"
      }`}
      style={
        {
          "--accent": style.color,
          borderColor: `${style.color}55`,
          backgroundColor: `${style.color}13`,
        } as React.CSSProperties
      }
    >
      <span>{style.icon}</span>

      <span className="truncate">
        {category || "Match"}
      </span>
    </span>
  );
}

/* ================================================================
   DATE BOX
================================================================ */

function DateBox({
  match,
  size = "lg",
}: {
  match: MatchItem;
  size?: "sm" | "lg";
}) {
  const parts = getDateParts(
    match.date,
    match.year
  );

  const style = getCategoryStyle(match.category);

  return (
    <div
      className={`match-date-box flex shrink-0 flex-col items-center justify-center rounded-2xl border ${
        size === "lg"
          ? "h-[68px] w-[68px]"
          : "h-[58px] w-[58px]"
      }`}
      style={
        {
          "--accent": style.color,
          borderColor: `${style.color}40`,
          backgroundColor: `${style.color}12`,
        } as React.CSSProperties
      }
    >
      <span
        className={`font-black leading-none ${
          size === "lg"
            ? "text-[26px]"
            : "text-[22px]"
        }`}
      >
        {parts
          ? String(parts.day).padStart(2, "0")
          : "—"}
      </span>

      <span className="mt-1 text-[10px] font-black tracking-wider">
        {parts
          ? MONTHS_SHORT[parts.month]
          : (match.month || "")
              .slice(0, 3)
              .toUpperCase()}
      </span>
    </div>
  );
}

/* ================================================================
   ANIMATED NUMBER
================================================================ */

function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const from = current.current;
    const to = value;
    const duration = 750;
    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (to - from) * eased);
      current.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{shown}</>;
}

/* ================================================================
   STATISTICS TILE
================================================================ */

function StatTile({
  category,
  count,
  active,
  onClick,
}: {
  category: (typeof CATEGORIES)[number];
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`mx-tile flex min-w-[118px] flex-1 items-center gap-3 px-3.5 py-3 text-left xl:min-w-0 ${
        active ? "mx-tile-active" : ""
      }`}
      style={{ "--accent": category.color } as React.CSSProperties}
    >
      <span
        className="mx-tile-ico"
        style={{ borderColor: `${category.color}66`, backgroundColor: `${category.color}22` }}
      >
        {category.icon}
      </span>

      <span className="relative z-10 flex min-w-0 flex-col">
        <span className="text-[26px] font-black leading-none tabular-nums text-white">
          <AnimatedNumber value={count} />
        </span>
        <span className="mt-1 truncate text-[11px] font-semibold text-slate-300">
          {TILE_LABEL[category.key]}
        </span>
      </span>
    </button>
  );
}

// Shared replay eligibility: cards and modal use exactly the same result.
const replayCache = new WeakMap<MatchItem, ReplayMatch | null>();
function getReplay(match: MatchItem): ReplayMatch | null {
  if (replayCache.has(match)) return replayCache.get(match) ?? null;
  let replay: ReplayMatch | null = null;
  const clean = (match.summary || "").normalize("NFKC").replace(/\r\n?/g, "\n");
  const normalized = clean.split("\n").map(line => {
    const heading = line.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().replace(/\s+/g, " ");
    if (/^(?:1ST|FIRST|INNINGS 1)\s*(?:INNINGS)?$/i.test(heading)) return "1ST INNINGS";
    if (/^(?:2ND|SECOND|INNINGS 2)\s*(?:INNINGS)?$/i.test(heading)) return "2ND INNINGS";
    if (/^MATCH (?:INFO|SUMMARY|INFORMATION)$/i.test(heading)) return "MATCH INFO";
    if (/^(?:TEAM )?SQUADS?$/i.test(heading)) return "SQUAD";
    return line;
  }).join("\n");
  for (const candidate of [match, {...match, summary: normalized}]) {
    try { replay = summaryToReplay(candidate) ?? null; } catch { replay = null; }
    if (replay) break;
  }
  replayCache.set(match, replay);
  return replay;
}
function matchMeta(match: MatchItem) {
  const summary = match.summary || "";
  const format = summary.match(/(?:match\s+)?format\s*[:：]\s*([^\r\n]+)/i)?.[1]?.trim();
  const duration = summary.match(/(?:match\s+)?duration\s*[:：]\s*([^\r\n]+)/i)?.[1]?.trim();
  const result = summary.match(/\bresults?\s*(?:[:：]|[~=>-]+)\s*([^\r\n]+)/i)?.[1]?.trim();
  return {format, duration, result};
}
function MatchMeta({match}: {match: MatchItem}) {
  const {format, duration, result} = matchMeta(match);
  const replay = getReplay(match);
  return <div className="mt-2 min-w-0">
    <div className="flex flex-wrap items-center gap-1.5">
      {format && <span className="match-meta-chip">🏏 {format}</span>}
      {duration && <span className="match-meta-chip">◷ {duration}</span>}
      {replay && <span className="match-replay-chip" title="Virtual replay available">▶ Highlights</span>}
    </div>
    {result && <p className="match-result mt-2 truncate text-[11px] font-bold" title={result}>{result}</p>}
  </div>;
}

function MatchCard({
  match,
  index,
  onOpen,
}: {
  match: MatchItem;
  index: number;
  onOpen: (match: MatchItem) => void;
}) {
  const style = getCategoryStyle(match.category);

  return (
    <button
      type="button"
      onClick={() => onOpen(match)}
      className="mx-card group"
      style={
        {
          "--accent": style.color,
          animationDelay: `${Math.min(index, 11) * 55}ms`,
        } as React.CSSProperties
      }
    >
      <DateBox match={match} size="sm" />

      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="mx-dot" />
          <span
            className="truncate text-[11px] font-extrabold"
            style={{ color: style.color }}
          >
            {match.category || "Match"}
          </span>
        </div>

        <h3 className="mt-1 line-clamp-2 break-words text-[15px] font-black leading-snug text-white sm:text-base">
          {match.title}
        </h3>

        <MatchMeta match={match} />
      </div>

      <div className="relative z-10 flex shrink-0 flex-col items-end justify-center gap-3 self-stretch sm:justify-between">
        <span
          className="mx-tag hidden sm:inline-flex"
          style={{
            color: style.color,
            borderColor: `${style.color}66`,
            backgroundColor: `${style.color}1f`,
          }}
        >
          {style.icon} {TAG_LABEL[style.key]}
        </span>

        <span className="mx-go">›</span>
      </div>
    </button>
  );
}

/* ================================================================
   MATCH DETAILS MODAL
================================================================ */

function MatchModal({
  match,
  onClose,
  onOpenHighlights,
}: {
  match: MatchItem;
  onClose: () => void;
  onOpenHighlights: (replay: ReplayMatch) => void;
}) {
  const style = getCategoryStyle(match.category);

  // Parse only THIS match summary; never show a canned demo for other matches.
  const replay = useMemo(() => getReplay(match), [match]);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    const previousActiveElement =
      document.activeElement as HTMLElement | null;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(
          (element) =>
            element.getClientRects().length > 0
        );

        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];

        const last =
          focusable[focusable.length - 1];

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

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        onKey
      );

      previousActiveElement?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="match-modal-overlay fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
      role="presentation"
    >
      {/* Backdrop */}

      <button
        type="button"
        aria-label="Close match details"
        onClick={onClose}
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
      />

      {/* Modal */}

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-modal-title"
        tabIndex={-1}
        className="match-modal relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[28px] border shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:max-h-[90dvh] sm:max-w-[760px] sm:rounded-[30px]"
      >
        {/* Accent Line */}

        <div
          className="h-1 w-full shrink-0"
          style={{
            background: `linear-gradient(90deg, ${style.color}, #1877F2, #a855f7)`,
          }}
        />

        {/* Mobile Handle */}

        <div className="match-modal-handle mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full sm:hidden" />

        {/* Header */}

        <div className="match-modal-header relative flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-8 sm:pb-5 sm:pt-7">
          <div className="min-w-0">
            <div className="mb-2">
              <CatBadge category={match.category} />
            </div>

            <p className="match-muted text-[11px] font-bold sm:text-xs">
              📅 {formatExcelDate(match.date)}
            </p>

            {(match.month || match.year) && (
              <p className="match-muted mt-1 text-[10px]">
                {match.month} {match.year}
              </p>
            )}
          </div>

          {/* Header Buttons */}

          <div className="flex shrink-0 items-center gap-2">
            {/* Close */}

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="match-close flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all duration-300 hover:rotate-90"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="shrink-0 px-5 pb-3 sm:px-8">
          <h2 id="match-modal-title" className="match-heading text-xl font-black leading-tight sm:text-2xl">{match.title}</h2>
          <MatchMeta match={match} />
          {(match.link || replay) && <div className="mt-3 grid grid-cols-2 gap-2">
            {match.link && <a href={match.link} target="_blank" rel="noopener noreferrer" className="match-action match-facebook-btn">↗ Facebook Post</a>}
            {replay && <button type="button" onClick={() => onOpenHighlights(replay)} className="match-action match-replay-action">▶ Match Highlights</button>}
          </div>}
          {replay && <p className="match-muted mt-2 text-[10px]">Virtual replay from match summary · Not actual footage</p>}
        </div>
        <div className="match-modal-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-8 sm:pb-7">
          {/* Decorative Divider */}

          <div className="my-5 flex items-center gap-3">
            <span className="h-1 w-9 rounded-full bg-[#1877F2]" />

            <span className="h-px flex-1 bg-[#1877F2]/15" />
          </div>

          {/* Summary Header */}

          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">📖</span>

            <span className="match-blue text-[11px] font-black uppercase tracking-[0.2em]">
              Match Summary
            </span>
          </div>

          {/* Summary */}

          <div className="match-summary break-words rounded-[20px] border p-4 text-[13px] leading-7 sm:p-6 sm:text-sm">
            {renderTextWithHighlights(
              match.summary
            )}
          </div>

          {/* Mobile Bottom Info */}

          <div className="mt-5 flex items-center justify-center gap-2 sm:hidden">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />

            <span className="match-muted text-[10px] font-semibold">
              FCL Official Match Record
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ================================================================
   LOADING SKELETON
================================================================ */

function MatchSkeleton({
  isDesktop,
}: {
  isDesktop: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: isDesktop ? 6 : 4 }).map((_, index) => (
        <div
          key={index}
          className="match-skeleton flex h-[104px] items-center gap-3 overflow-hidden rounded-2xl border p-3"
        >
          <div className="match-skeleton-line h-[58px] w-[58px] shrink-0 animate-pulse rounded-2xl" />

          <div className="flex-1 space-y-3">
            <div className="match-skeleton-line h-3 w-1/3 animate-pulse rounded-full" />
            <div className="match-skeleton-line h-4 w-3/4 animate-pulse rounded-full" />
            <div className="match-skeleton-line h-3 w-1/2 animate-pulse rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   MAIN PAGE
================================================================ */

export default function MatchesPage() {
  const isDesktop = useMediaQuery(
    "(min-width: 1024px)"
  );

  const [matches, setMatches] = useState<
    MatchItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<string>("all");

  const [selectedYear, setSelectedYear] =
    useState("All");

  const [selectedMonth, setSelectedMonth] =
    useState("All");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [page, setPage] = useState(1);

  const [showAll, setShowAll] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedMatch, setSelectedMatch] =
    useState<MatchItem | null>(null);

  const [activeReplay, setActiveReplay] = useState<ReplayMatch | null>(null);

  const pageSize = isDesktop ? 6 : 5;

  /* ================================================================
     FETCH MATCHES
  ================================================================ */

  useEffect(() => {
    const controller = new AbortController();

    const loadMatches = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch("/api/matches", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            "Failed to fetch match records"
          );
        }

        const data = await response.json();

        let list: MatchItem[] = [];

        if (
          data.matches &&
          Array.isArray(data.matches)
        ) {
          list = data.matches;
        } else if (Array.isArray(data)) {
          list = data;
        }

        if (controller.signal.aborted) return;

        setMatches(list);

        /* URL Parameters */

        try {
          const params = new URLSearchParams(
            window.location.search
          );

          const matchId = params.get("match");

          const query = params.get("q");

          if (matchId) {
            // The Global Search match link is a one-time popup trigger.
            const currentUrl = new URL(window.location.href);
            const navigation = performance.getEntriesByType(
              "navigation"
            )[0] as PerformanceNavigationTiming | undefined;

            // Ignore a stale match parameter on an actual browser reload.
            const isReload =
              navigation?.type === "reload" &&
              navigation.name.split("#")[0] === currentUrl.href.split("#")[0];

            // Consume only match; preserve q, other parameters and the hash.
            currentUrl.searchParams.delete("match");
            window.history.replaceState(
              window.history.state,
              "",
              currentUrl.pathname + currentUrl.search + currentUrl.hash
            );

            if (!isReload) {
              const found = list.find(
                (match) => String(match.id) === matchId
              );

              if (found) {
                setSelectedMatch(found);
              } else if (query) {
                setSearchQuery(query);
              }
            } else if (query) {
              setSearchQuery(query);
            }
          } else if (query) {
            setSearchQuery(query);
          }
        } catch {
          /* Ignore URL parsing errors */
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Error loading matches:",
          err
        );

        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadMatches();

    return () => {
      controller.abort();
    };
  }, []);

  /* ================================================================
     RESET PAGINATION
  ================================================================ */

  useEffect(() => {
    setPage(1);
    setShowAll(false);
  }, [
    selectedCategory,
    selectedYear,
    selectedMonth,
    searchQuery,
  ]);

  /* ================================================================
     MODAL
  ================================================================ */

  const closeModal = useCallback(() => {
    setSelectedMatch(null);
  }, []);

  const openHighlights = useCallback((replay: ReplayMatch) => {
    // Replace the details modal rather than nesting two Escape/focus handlers.
    setSelectedMatch(null);
    setActiveReplay(replay);
  }, []);

  /* ================================================================
     AVAILABLE YEARS
  ================================================================ */

  const years = useMemo(() => {
    const set = new Set(
      matches
        .map((match) => match.year)
        .filter(Boolean)
    );

    return [
      "All",
      ...Array.from(set).sort().reverse(),
    ];
  }, [matches]);

  /* ================================================================
     AVAILABLE MONTHS
  ================================================================ */

  const months = useMemo(() => {
    const set = new Set(
      matches
        .map((match) => match.month)
        .filter(Boolean)
    );

    const list = Array.from(set).sort(
      (a, b) => {
        const ia = MONTHS.findIndex(
          (month) =>
            month.toLowerCase() ===
            a.toLowerCase()
        );

        const ib = MONTHS.findIndex(
          (month) =>
            month.toLowerCase() ===
            b.toLowerCase()
        );

        return (
          (ia === -1 ? 99 : ia) -
          (ib === -1 ? 99 : ib)
        );
      }
    );

    return ["All", ...list];
  }, [matches]);

  /* ================================================================
     CATEGORY COUNTS
  ================================================================ */

  const counts = useMemo(() => {
    const result: Record<string, number> = {
      all: matches.length,
      tournament: 0,
      series: 0,
      friendly: 0,
      test: 0,
    };

    matches.forEach((match) => {
      const key = getCategoryStyle(
        match.category
      ).key;

      if (key !== "other") {
        result[key] += 1;
      }
    });

    return result;
  }, [matches]);

  /* ================================================================
     LATEST MATCH
  ================================================================ */

  const latestLabel = useMemo(() => {
    let best: MatchItem | null = null;

    let bestTimestamp = 0;

    matches.forEach((match) => {
      const timestamp = parseMatchDate(
        match.date,
        match.year
      );

      if (timestamp > bestTimestamp) {
        bestTimestamp = timestamp;
        best = match;
      }
    });

    const latest = best as MatchItem | null;

    return latest
      ? formatExcelDate(latest.date)
      : "";
  }, [matches]);

  /* ================================================================
     FILTERED MATCHES
  ================================================================ */

  const filteredMatches = useMemo(() => {
    const query = searchQuery
      .toLowerCase()
      .trim();

    const list = matches.filter((match) => {
      const categoryMatches =
        selectedCategory === "all" ||
        getCategoryStyle(match.category).key ===
          selectedCategory;

      const yearMatches =
        selectedYear === "All" ||
        match.year === selectedYear;

      const monthMatches =
        selectedMonth === "All" ||
        (match.month || "").toLowerCase() ===
          selectedMonth.toLowerCase();

      const searchMatches =
        !query ||
        (match.title || "")
          .toLowerCase()
          .includes(query) ||
        (match.summary || "")
          .toLowerCase()
          .includes(query);

      return (
        categoryMatches &&
        yearMatches &&
        monthMatches &&
        searchMatches
      );
    });

    list.sort(
      (a, b) =>
        parseMatchDate(b.date, b.year) -
        parseMatchDate(a.date, a.year)
    );

    return list;
  }, [
    matches,
    selectedCategory,
    selectedYear,
    selectedMonth,
    searchQuery,
  ]);

  /* ================================================================
     PAGINATION
  ================================================================ */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMatches.length / pageSize)
  );

  const safePage = Math.min(page, totalPages);

  const visibleMatches = useMemo(
    () =>
      showAll
        ? filteredMatches
        : filteredMatches.slice(
            (safePage - 1) * pageSize,
            safePage * pageSize
          ),
    [filteredMatches, safePage, pageSize, showAll]
  );

  const rangeStart = filteredMatches.length
    ? (showAll ? 1 : (safePage - 1) * pageSize + 1)
    : 0;

  const rangeEnd = showAll
    ? filteredMatches.length
    : Math.min(safePage * pageSize, filteredMatches.length);

  /* ================================================================
     ACTIVE FILTERS
  ================================================================ */

  const activeFilters: {
    label: string;
    clear: () => void;
  }[] = [];

  if (selectedCategory !== "all") {
    const category = CATEGORIES.find(
      (cat) => cat.key === selectedCategory
    );

    activeFilters.push({
      label: `${category?.icon ?? ""} ${
        category?.short ?? ""
      }`,
      clear: () => setSelectedCategory("all"),
    });
  }

  if (selectedYear !== "All") {
    activeFilters.push({
      label: selectedYear,
      clear: () => setSelectedYear("All"),
    });
  }

  if (selectedMonth !== "All") {
    activeFilters.push({
      label: selectedMonth,
      clear: () => setSelectedMonth("All"),
    });
  }

  if (searchQuery.trim()) {
    activeFilters.push({
      label: `"${searchQuery.trim()}"`,
      clear: () => setSearchQuery(""),
    });
  }

  const hasFilters = activeFilters.length > 0;

  /* ================================================================
     RESET FILTERS
  ================================================================ */

  const resetAll = () => {
    setSelectedCategory("all");
    setSelectedYear("All");
    setSelectedMonth("All");
    setSearchQuery("");
  };

  /* ================================================================
     PERIOD LABEL
  ================================================================ */

  const periodLabel =
    selectedMonth !== "All" || selectedYear !== "All"
      ? [
          selectedMonth !== "All" ? selectedMonth : "",
          selectedYear !== "All" ? selectedYear : "",
        ]
          .filter(Boolean)
          .join(" ")
      : "All Time";

  /* ================================================================
     SEARCH BOX
  ================================================================ */

  const SearchBox = (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm">
        🔍
      </span>

      <input
        type="search"
        aria-label="Search matches"
        placeholder="Search matches..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        className="mx-input w-full rounded-xl py-2.5 pl-10 pr-9 text-xs font-semibold outline-none"
      />

      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[11px] text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );

  /* ================================================================
     PAGE
  ================================================================ */

  return (
    <div
      className="match-root match-dark relative min-h-screen overflow-x-clip pb-8 font-sans"
    >
      {/* ============================================================
          GLOBAL CSS
      ============================================================ */}

      <style jsx global>{`

        /* ============================================================
           FCL OFFICIAL THEME TOKENS
        ============================================================ */

        .match-root {
          --match-bg: #ffffff;
          --match-bg-alt: #f1f5f9;

          --match-card: #ffffff;
          --match-card-alt: #f8fafc;

          --match-heading: #0f172a;
          --match-text: #475569;
          --match-muted: #64748b;

          --match-border: #e2e8f0;

          --match-blue: #1d4ed8;
          --match-primary: #1877F2;

          --match-input: #ffffff;

          --match-summary-bg: #f8fafc;

          --match-modal-bg: #ffffff;

          --match-shadow:
            0 8px 30px rgba(15, 23, 42, 0.06);

          --match-hover-shadow:
            0 25px 60px rgba(24, 119, 242, 0.15);

          --match-grid:
            rgba(100, 116, 139, 0.09);

          background: var(--match-bg);
          color: var(--match-heading);

          transition:
            background 0.3s ease,
            color 0.3s ease;
        }

        .match-root.match-dark {
          --match-bg: #020617;
          --match-bg-alt: #02050b;

          --match-card: #0f172a;
          --match-card-alt: #0b1220;

          --match-heading: #ffffff;
          --match-text: #94a3b8;
          --match-muted: #94a3b8;

          --match-border: #172033;

          --match-blue: #60a5fa;

          --match-input: #0b1220;

          --match-summary-bg: #030714;

          --match-modal-bg: #0b1220;

          --match-shadow:
            0 12px 40px rgba(0, 0, 0, 0.18);

          --match-hover-shadow:
            0 30px 70px rgba(24, 119, 242, 0.17);

          --match-grid:
            rgba(148, 163, 184, 0.055);
        }

        /* ============================================================
           THEME UTILITIES
        ============================================================ */

        .match-heading {
          color: var(--match-heading);
        }

        .match-text {
          color: var(--match-text);
        }

        .match-muted {
          color: var(--match-muted);
        }

        .match-blue {
          color: var(--match-blue);
        }

        /* ============================================================
           HERO
        ============================================================ */

        .match-hero {
          background: var(--match-bg-alt);
          border-color: var(--match-border);
        }

        .match-grid {
          background-image:
            linear-gradient(
              to right,
              var(--match-grid) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              var(--match-grid) 1px,
              transparent 1px
            );

          background-size: 50px 50px;

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

        /* ============================================================
           GRADIENT TEXT
        ============================================================ */

        .match-gradient-text {
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
            matchGradient 6s ease infinite;
        }

        .match-dark .match-gradient-text {
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

        @keyframes matchGradient {
          0%, 100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        /* ============================================================
           FLOATING ORBS
        ============================================================ */

        @keyframes matchFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }

          50% {
            transform: translate(25px, -25px) scale(1.08);
          }
        }

        .match-orb {
          animation:
            matchFloat 12s ease-in-out infinite;
        }

        .match-orb-delay {
          animation-delay: -6s;
        }

        /* ============================================================
           HERO BADGES
        ============================================================ */

        .match-hero-badge {
          border-color: rgba(24, 119, 242, 0.3);
          background: rgba(24, 119, 242, 0.09);
          color: var(--match-blue);
        }

        .match-latest {
          background: var(--match-card);
          border-color: var(--match-border);
          box-shadow: var(--match-shadow);
        }

        /* ============================================================
           STATISTICS
        ============================================================ */

        .match-stat {
          background:
            linear-gradient(
              to bottom,
              var(--match-card),
              var(--match-card-alt)
            );

          border-color: var(--match-border);

          box-shadow: var(--match-shadow);
        }

        .match-stat:hover {
          border-color: var(--accent);

          box-shadow:
            0 15px 35px
            color-mix(
              in srgb,
              var(--accent) 15%,
              transparent
            );
        }

        .match-stat-active {
          border-color: var(--accent);

          box-shadow:
            0 0 0 1px var(--accent),
            0 12px 35px
            color-mix(
              in srgb,
              var(--accent) 12%,
              transparent
            );
        }

        /* ============================================================
           FILTER PANEL
        ============================================================ */

        .match-filter-panel {
          background: var(--match-card);
          border-color: var(--match-border);
          box-shadow: var(--match-shadow);
        }

        .match-input {
          background: var(--match-input);
          color: var(--match-heading);
          border-color: var(--match-border);

          transition:
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .match-input::placeholder {
          color: var(--match-muted);
          opacity: 0.8;
        }

        .match-input:focus {
          border-color: #1877F2;

          box-shadow:
            0 0 0 4px rgba(24, 119, 242, 0.1);
        }

        .match-select {
          background: var(--match-input);
          color: var(--match-heading);
          border-color: var(--match-border);
        }

        .match-select:focus {
          border-color: #1877F2;
          outline: none;
        }

        /* ============================================================
           CATEGORY COLORS
        ============================================================ */

        .match-category-badge {
          color:
            color-mix(
              in srgb,
              var(--accent) 65%,
              #0f172a
            );
        }

        .match-dark .match-category-badge {
          color: var(--accent);
        }

        .match-date-box {
          color:
            color-mix(
              in srgb,
              var(--accent) 75%,
              #0f172a
            );
        }

        .match-dark .match-date-box {
          color: var(--accent);
        }

        /* ============================================================
           DESKTOP CARDS
        ============================================================ */

        .match-card {
          background:
            linear-gradient(
              to bottom,
              var(--match-card),
              var(--match-card-alt)
            );

          border-color: var(--match-border);

          box-shadow: var(--match-shadow);
        }

        .match-card:hover {
          border-color:
            color-mix(
              in srgb,
              var(--accent) 65%,
              transparent
            );

          box-shadow: var(--match-hover-shadow);
        }

        .match-card-footer {
          border-color: var(--match-border);
        }

        .match-arrow {
          background: rgba(24, 119, 242, 0.08);
          border-color: rgba(24, 119, 242, 0.2);
          color: var(--match-blue);
        }

        .match-arrow:hover {
          color: #ffffff;
        }

        /* ============================================================
           MOBILE CARDS
        ============================================================ */

        .match-mobile-card {
          background:
            linear-gradient(
              to right,
              var(--match-card),
              var(--match-card-alt)
            );

          border-color: var(--match-border);

          box-shadow: var(--match-shadow);
        }

        .match-mobile-card:hover {
          border-color:
            color-mix(
              in srgb,
              var(--accent) 55%,
              transparent
            );
        }

        /* ============================================================
           GROUP HEADER
        ============================================================ */

        .match-group-line {
          background: var(--match-border);
        }

        /* ============================================================
           MODAL
        ============================================================ */

        .match-modal-overlay {
          animation:
            matchFadeIn 0.25s ease-out;
        }

        @keyframes matchFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        .match-modal {
          background: var(--match-modal-bg);
          border-color: var(--match-border);

          animation:
            matchModalEnter 0.35s
            cubic-bezier(.2,.8,.2,1);
        }

        @keyframes matchModalEnter {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .match-modal-handle {
          background: var(--match-border);
        }

        .match-modal-header {
          background: var(--match-modal-bg);
        }

        .match-modal-footer {
          background: var(--match-modal-bg);
          border-color: var(--match-border);
        }

        .match-close {
          background: var(--match-bg-alt);
          color: var(--match-heading);
        }

        .match-close:hover {
          background: rgba(244, 63, 94, 0.12);
          color: #f43f5e;
        }

        .match-summary {
          background: var(--match-summary-bg);
          border-color: var(--match-border);
          color: var(--match-text);
        }

        .match-highlight {
          background: rgba(245, 158, 11, 0.12);
          color: #b45309;
        }

        .match-dark .match-highlight {
          background: rgba(245, 158, 11, 0.13);
          color: #fbbf24;
        }

        .match-facebook-btn {
          background: #1877F2;

          box-shadow:
            0 10px 30px rgba(24, 119, 242, 0.25);
        }

        .match-facebook-btn:hover {
          background: #0d6fe8;
        }

        /* ============================================================
           MODAL SCROLLBAR
        ============================================================ */

        .match-modal-body::-webkit-scrollbar {
          width: 5px;
        }

        .match-modal-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .match-modal-body::-webkit-scrollbar-thumb {
          background: rgba(24, 119, 242, 0.35);
          border-radius: 20px;
        }

        /* ============================================================
           LOADING SKELETON
        ============================================================ */

        .match-skeleton {
          background: var(--match-card);
          border-color: var(--match-border);
        }

        .match-skeleton-line {
          background: var(--match-border);
        }

        /* ============================================================
           EMPTY STATE
        ============================================================ */

        .match-empty {
          background: var(--match-card);
          border-color: var(--match-border);
          box-shadow: var(--match-shadow);
        }

        /* ============================================================
           BUTTONS
        ============================================================ */

        .match-primary-btn {
          background: #1877F2;
          color: #ffffff;

          box-shadow:
            0 12px 30px rgba(24, 119, 242, 0.22);
        }

        .match-primary-btn:hover {
          background: #0d6fe8;
          transform: translateY(-2px);
        }

        .match-secondary-btn {
          background: var(--match-card);
          color: var(--match-heading);
          border-color: var(--match-border);
        }

        .match-secondary-btn:hover {
          border-color: rgba(24, 119, 242, 0.5);
          color: var(--match-blue);
        }

        /* ============================================================
           STICKY MOBILE STATS
        ============================================================ */

        .match-sticky-stats {
          background:
            color-mix(
              in srgb,
              var(--match-bg) 92%,
              transparent
            );

          border-color: var(--match-border);
        }

        .match-meta-chip, .match-replay-chip { display:inline-flex; align-items:center; border:1px solid var(--match-border); border-radius:6px; padding:3px 6px; font-size:10px; font-weight:800; color:var(--match-heading); background:var(--match-card-alt); }
        .match-replay-chip { color:#047857; background:#10b98115; border-color:#10b98155; }
        .match-dark .match-replay-chip { color:#6ee7b7; }
        .match-result { color:#047857; }
        .match-dark .match-result { color:#6ee7b7; }
        .match-action { display:flex; align-items:center; justify-content:center; min-height:42px; padding:8px; border-radius:12px; color:white; font-size:12px; font-weight:800; text-align:center; transition:transform .2s, filter .2s; }
        .match-action:hover { transform:translateY(-2px); filter:brightness(1.08); }
        .match-action:focus-visible { outline:2px solid var(--match-blue); outline-offset:3px; }
        .match-replay-action { background:#047857; }
        .match-card, .match-mobile-card { animation:matchCardEnter .32s ease-out; }
        @keyframes matchCardEnter { from {opacity:0; transform:translateY(6px);} to {opacity:1; transform:translateY(0);} }
        .match-card:hover .match-replay-chip { box-shadow:0 0 12px #10b98133; }
        /* ============================================================
           REDUCED MOTION
        ============================================================ */

        @media (prefers-reduced-motion: reduce) {
          .match-root *,
          .match-root *::before,
          .match-root *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }


        /* ============================================================
           MX — STADIUM DASHBOARD THEME
        ============================================================ */

        .mx-stage {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background: linear-gradient(180deg, #04102a 0%, #020617 55%, #01040d 100%);
        }

        .mx-stage-img {
          position: absolute;
          inset: -4%;
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
          opacity: 0.6;
          animation: mxKen 30s ease-in-out infinite alternate;
        }

        .mx-stage-shade {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(24, 119, 242, 0.18), transparent 55%),
            linear-gradient(180deg, rgba(2, 6, 23, 0.3) 0%, rgba(2, 6, 23, 0.75) 40%, #020617 100%);
        }

        .mx-flood {
          position: absolute;
          top: -90px;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200, 228, 255, 0.55), rgba(56, 130, 255, 0.2) 38%, transparent 68%);
          filter: blur(10px);
          animation: mxFlood 5s ease-in-out infinite;
        }

        .mx-flood-l { left: -140px; }
        .mx-flood-r { right: -140px; animation-delay: 1.8s; }

        @keyframes mxFlood {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.12); }
        }

        @keyframes mxKen {
          from { transform: scale(1); }
          to { transform: scale(1.08) translateY(-1.5%); }
        }

        .mx-glass {
          background: linear-gradient(160deg, rgba(14, 28, 64, 0.78), rgba(6, 14, 36, 0.84));
          border: 1px solid rgba(70, 120, 255, 0.28);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }

        .mx-title-grad {
          background: linear-gradient(90deg, #22c55e, #a3e635, #22c55e);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: mxShine 5s linear infinite;
        }

        @keyframes mxShine { to { background-position: 200% center; } }

        .mx-emblem {
          position: relative;
          display: flex;
          height: 64px;
          width: 64px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          font-size: 30px;
          background: radial-gradient(circle at 30% 25%, rgba(34, 197, 94, 0.35), rgba(8, 20, 50, 0.9));
          border: 1px solid rgba(34, 197, 94, 0.55);
          box-shadow: 0 0 28px rgba(34, 197, 94, 0.35);
          animation: mxBob 3.4s ease-in-out infinite;
        }

        .mx-emblem::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 9999px;
          border: 1px dashed rgba(34, 197, 94, 0.45);
          animation: mxSpin 14s linear infinite;
        }

        @keyframes mxSpin { to { transform: rotate(360deg); } }
        @keyframes mxBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

        /* Stat tiles */

        .mx-tile {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
          background: linear-gradient(150deg, color-mix(in srgb, var(--accent) 20%, #07122b), rgba(6, 12, 30, 0.88));
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .mx-tile:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 34px color-mix(in srgb, var(--accent) 35%, transparent);
        }

        .mx-tile::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 35%, rgba(255, 255, 255, 0.16) 50%, transparent 65%);
          transform: translateX(-130%);
        }

        .mx-tile:hover::after { animation: mxSweep 0.9s ease; }
        @keyframes mxSweep { to { transform: translateX(130%); } }

        .mx-tile-active {
          box-shadow: 0 0 0 2px var(--accent), 0 12px 34px color-mix(in srgb, var(--accent) 38%, transparent);
        }

        .mx-tile-ico {
          position: relative;
          z-index: 10;
          display: flex;
          height: 44px;
          width: 44px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid;
          font-size: 22px;
        }

        /* Sidebar */

        .mx-cat {
          display: flex;
          width: auto;
          flex-shrink: 0;
          align-items: center;
          gap: 10px;
          border-radius: 12px;
          padding: 10px 12px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          transition: background 0.25s, transform 0.25s, color 0.25s;
        }

        @media (min-width: 1024px) { .mx-cat { width: 100%; } }
        .mx-cat:hover { background: rgba(255, 255, 255, 0.07); color: #fff; }
        @media (min-width: 1024px) { .mx-cat:hover { transform: translateX(3px); } }

        .mx-cat-active {
          background: linear-gradient(90deg, #1877f2, #2f6bff);
          color: #fff;
          box-shadow: 0 8px 22px rgba(24, 119, 242, 0.45);
        }

        .mx-cat-count {
          margin-left: auto;
          min-width: 26px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 8px;
          text-align: center;
          font-size: 11px;
          font-weight: 900;
        }

        .mx-cat-active .mx-cat-count { background: rgba(2, 6, 23, 0.55); }

        .mx-noscroll { scrollbar-width: none; }
        .mx-noscroll::-webkit-scrollbar { display: none; }

        .mx-input, .mx-select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(120, 150, 255, 0.25);
          color: #fff;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .mx-input::placeholder { color: #94a3b8; }

        .mx-input:focus, .mx-select:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
          background: rgba(255, 255, 255, 0.08);
        }

        .mx-select option { background: #0b1220; color: #fff; }

        .mx-green-btn {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 13px;
          font-weight: 900;
          color: #04130a;
          background: linear-gradient(90deg, #16a34a, #22c55e, #4ade80);
          background-size: 200% auto;
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.35);
          transition: transform 0.2s, background-position 0.5s, box-shadow 0.2s;
        }

        .mx-green-btn:hover { background-position: 100% center; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(34, 197, 94, 0.5); }
        .mx-green-btn:active { transform: scale(0.97); }

        /* Records panel */

        .mx-seg {
          display: inline-flex;
          border-radius: 12px;
          padding: 3px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mx-seg button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 9px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 800;
          color: #cbd5e1;
          transition: background 0.25s, color 0.25s, box-shadow 0.25s;
        }

        .mx-seg button[aria-pressed="true"] {
          background: #1877f2;
          color: #fff;
          box-shadow: 0 6px 18px rgba(24, 119, 242, 0.5);
        }

        .mx-card {
          position: relative;
          display: flex;
          width: 100%;
          align-items: center;
          gap: 14px;
          overflow: hidden;
          border-radius: 16px;
          padding: 12px 14px;
          text-align: left;
          border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
          background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, #08122b), rgba(7, 14, 34, 0.92));
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
          animation: mxIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .mx-card::before {
          content: "";
          position: absolute;
          right: -50px;
          top: -50px;
          height: 150px;
          width: 150px;
          border-radius: 9999px;
          background: var(--accent);
          opacity: 0.14;
          filter: blur(40px);
          transition: opacity 0.4s;
        }

        .mx-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
          box-shadow: 0 16px 40px color-mix(in srgb, var(--accent) 30%, transparent);
        }

        .mx-card:hover::before { opacity: 0.4; }
        .mx-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        @keyframes mxIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .mx-card .match-date-box { color: #fff; }

        .mx-card .match-meta-chip {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.14);
          color: #e2e8f0;
        }

        .mx-card .match-replay-chip { animation: mxGlow 2.4s ease-in-out infinite; }

        @keyframes mxGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(16, 185, 129, 0); }
          50% { box-shadow: 0 0 12px rgba(16, 185, 129, 0.5); }
        }

        .mx-dot {
          height: 7px;
          width: 7px;
          flex-shrink: 0;
          border-radius: 9999px;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          animation: mxPulse 1.8s ease-in-out infinite;
        }

        @keyframes mxPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.5); } }

        .mx-tag {
          align-items: center;
          gap: 4px;
          border: 1px solid;
          border-radius: 9px;
          padding: 4px 9px;
          font-size: 10px;
          font-weight: 900;
          white-space: nowrap;
        }

        .mx-go {
          display: flex;
          height: 34px;
          width: 34px;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: rgba(24, 119, 242, 0.25);
          border: 1px solid rgba(96, 165, 250, 0.4);
          color: #fff;
          font-size: 20px;
          font-weight: 900;
          line-height: 1;
          transition: transform 0.3s, background 0.3s;
        }

        .mx-card:hover .mx-go { transform: translateX(4px); background: #1877f2; }

        .mx-scroll {
          max-height: min(60vh, 620px);
          overflow-y: auto;
          padding-right: 6px;
          scrollbar-width: thin;
          scrollbar-color: #1877f2 transparent;
        }

        .mx-pg {
          display: inline-flex;
          height: 32px;
          min-width: 32px;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          padding: 0 8px;
          font-size: 12px;
          font-weight: 800;
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: background 0.2s, transform 0.2s;
        }

        .mx-pg:hover:not(:disabled) { background: rgba(24, 119, 242, 0.35); transform: translateY(-2px); }
        .mx-pg:disabled { opacity: 0.35; cursor: not-allowed; }
        .mx-pg-active { background: #1877f2; color: #fff; border-color: #1877f2; }

        .mx-viewall {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 14px;
          padding: 13px;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(90deg, rgba(24, 119, 242, 0.12), rgba(34, 197, 94, 0.14), rgba(24, 119, 242, 0.12));
          border: 1px solid rgba(96, 165, 250, 0.3);
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
        }

        .mx-viewall:hover {
          transform: translateY(-2px);
          border-color: #22c55e;
          box-shadow: 0 10px 30px rgba(34, 197, 94, 0.25);
        }

        .mx-viewall span.arrow { transition: transform 0.25s; }
        .mx-viewall:hover span.arrow { transform: translateX(5px); }

        /* Navbar clearance and stadium visibility (layout-only fix). */
        .match-root .mx-page-content {
          padding-top: calc(var(--fcl-navbar-height, 56px) + 16px);
        }
        .match-root .mx-stage-img {
          opacity: .88;
          background-position: center 42%;
        }
        .match-root .mx-stage-shade {
          background: linear-gradient(180deg, rgba(2,6,23,.25), rgba(2,6,23,.48) 35%, var(--match-bg) 100%);
        }
        @media (max-width: 640px) {
          .match-root .mx-page-content {
            padding-top: calc(var(--fcl-navbar-height, 56px) + 12px);
          }
        }

        .mx-root-skeleton-fix .match-skeleton { background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.08); }

      `}</style>

      {/* ============================================================
          STADIUM BACKGROUND
      ============================================================ */}

      <div className="mx-stage" aria-hidden="true">
        <div
          className="mx-stage-img"
          style={{ backgroundImage: `url("${MATCH_BG}")` }}
        />
        <div className="mx-stage-shade" />
        <div className="mx-flood mx-flood-l" />
        <div className="mx-flood mx-flood-r" />
      </div>

      <main className="mx-page-content relative z-10 mx-auto max-w-[1400px] px-4 pb-4 sm:px-6 lg:px-10">
        {/* ============================================================
            HEADER + STAT TILES
        ============================================================ */}

        <header className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="mx-emblem" aria-hidden="true">
              🏏
            </div>

            <div className="hidden h-14 w-px bg-white/15 sm:block" />

            <div>
              <h1 className="text-[30px] font-black leading-none tracking-tight text-white sm:text-[40px]">
                Match <span className="mx-title-grad">Directory</span>
              </h1>

              <p className="mt-1.5 text-xs font-semibold text-slate-300 sm:text-sm">
                Explore FCL Match Records &amp; Statistics
              </p>

              {latestLabel && (
                <p className="mt-1 text-[10px] font-bold text-emerald-300/90">
                  ● Latest match: {latestLabel}
                </p>
              )}
            </div>
          </div>

          <div className="mx-noscroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 xl:mx-0 xl:grid xl:w-[760px] xl:grid-cols-5 xl:gap-3 xl:overflow-visible xl:px-0 xl:pb-0">
            {CATEGORIES.map((category) => (
              <StatTile
                key={category.key}
                category={category}
                count={loading ? 0 : counts[category.key] ?? 0}
                active={selectedCategory === category.key}
                onClick={() => setSelectedCategory(category.key)}
              />
            ))}
          </div>
        </header>

        {/* ============================================================
            DASHBOARD
        ============================================================ */}

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          {/* ---------------- SIDEBAR ---------------- */}

          <aside className="mx-glass rounded-[22px] p-4 lg:sticky lg:top-20">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-lg">
                  ▦
                </span>

                <h2 className="text-lg font-black text-white">
                  Categories
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-200 lg:hidden"
              >
                Filters {filtersOpen ? "▲" : "▼"}
              </button>
            </div>

            <nav className="mx-noscroll flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
              {CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setSelectedCategory(category.key)}
                  aria-pressed={selectedCategory === category.key}
                  className={`mx-cat ${
                    selectedCategory === category.key
                      ? "mx-cat-active"
                      : ""
                  }`}
                >
                  <span className="text-lg leading-none">
                    {category.icon}
                  </span>

                  <span>{SIDE_LABEL[category.key]}</span>

                  <span className="mx-cat-count">
                    {loading ? 0 : counts[category.key] ?? 0}
                  </span>
                </button>
              ))}
            </nav>

            <div
              className={`${filtersOpen ? "block" : "hidden"} lg:block`}
            >
              <div className="my-4 h-px bg-white/10" />

              <p className="mb-2.5 flex items-center gap-2 text-xs font-black text-slate-200">
                <span className="text-sky-400">⛉</span> Quick Filters
              </p>

              <div className="space-y-2.5">
                {SearchBox}

                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    id="match-year"
                    aria-label="Year"
                    value={selectedYear}
                    onChange={(event) =>
                      setSelectedYear(event.target.value)
                    }
                    className="mx-select w-full rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year === "All" ? "All Years" : year}
                      </option>
                    ))}
                  </select>

                  <select
                    id="match-month"
                    aria-label="Month"
                    value={selectedMonth}
                    onChange={(event) =>
                      setSelectedMonth(event.target.value)
                    }
                    className="mx-select w-full rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month === "All" ? "All Months" : month}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={resetAll}
                  disabled={!hasFilters}
                  className="mx-green-btn disabled:cursor-default disabled:opacity-60"
                >
                  ✕ Reset Filters
                </button>
              </div>
            </div>
          </aside>

          {/* ---------------- RECORDS PANEL ---------------- */}

          <section className="mx-glass min-w-0 rounded-[22px] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-xl">
                  📅
                </span>

                <h2 className="text-lg font-black text-white sm:text-xl">
                  Match Records{" "}
                  <span className="text-sm font-bold text-slate-300">
                    ({periodLabel})
                  </span>
                </h2>
              </div>

              <div className="mx-seg" role="group" aria-label="View mode">
                <button
                  type="button"
                  aria-pressed={viewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                >
                  ▦ Grid
                </button>

                <button
                  type="button"
                  aria-pressed={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                >
                  ☰ List
                </button>
              </div>
            </div>

            {!loading && hasFilters && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {activeFilters.map((filter, index) => (
                  <button
                    key={`${filter.label}-${index}`}
                    type="button"
                    onClick={filter.clear}
                    className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-[10px] font-black text-sky-200 transition hover:bg-sky-400/20"
                  >
                    {filter.label} <span>✕</span>
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="mx-root-skeleton-fix">
                <MatchSkeleton isDesktop={isDesktop} />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-12 text-center">
                <div className="mb-4 text-4xl">⚠️</div>

                <h3 className="text-lg font-black text-white">
                  Match Archive Unavailable
                </h3>

                <p className="mt-2 max-w-md text-xs leading-6 text-slate-300">
                  এই মুহূর্তে ম্যাচের তথ্য লোড করা যাচ্ছে না।
                  অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mx-green-btn mt-5 !w-auto px-6"
                >
                  🔄 Try Again
                </button>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/5 px-5 py-12 text-center">
                <div className="mb-4 text-4xl">📭</div>

                <h3 className="text-lg font-black text-white">
                  No Match Records Found
                </h3>

                <p className="mt-2 max-w-md text-xs leading-6 text-slate-300">
                  আপনার নির্বাচিত ফিল্টার অথবা সার্চ অনুযায়ী
                  কোনো ম্যাচ রেকর্ড পাওয়া যায়নি। অন্য
                  ক্যাটাগরি, বছর বা মাস নির্বাচন করে আবার
                  চেষ্টা করুন।
                </p>

                <button
                  type="button"
                  onClick={resetAll}
                  className="mx-green-btn mt-5 !w-auto px-6"
                >
                  ✕ Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={showAll ? "mx-scroll" : ""}>
                  <div
                    className={`grid gap-3 ${
                      viewMode === "grid" ? "md:grid-cols-2" : ""
                    }`}
                  >
                    {visibleMatches.map((match, index) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        index={index}
                        onOpen={setSelectedMatch}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold text-slate-300">
                    Showing{" "}
                    <span className="font-black text-white">
                      {rangeStart}–{rangeEnd}
                    </span>{" "}
                    of{" "}
                    <span className="font-black text-white">
                      {filteredMatches.length}
                    </span>{" "}
                    matches
                  </p>

                  {!showAll && totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="mx-pg"
                        disabled={safePage === 1}
                        onClick={() => setPage(safePage - 1)}
                        aria-label="Previous page"
                      >
                        ‹
                      </button>

                      {pageList(safePage, totalPages).map(
                        (item, index) =>
                          item === "…" ? (
                            <span
                              key={`gap-${index}`}
                              className="px-1 text-slate-400"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setPage(item)}
                              aria-current={
                                item === safePage ? "page" : undefined
                              }
                              className={`mx-pg ${
                                item === safePage ? "mx-pg-active" : ""
                              }`}
                            >
                              {item}
                            </button>
                          )
                      )}

                      <button
                        type="button"
                        className="mx-pg"
                        disabled={safePage === totalPages}
                        onClick={() => setPage(safePage + 1)}
                        aria-label="Next page"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowAll((value) => !value)}
                    className="mx-viewall mt-3"
                  >
                    <span>🏆</span>

                    {showAll
                      ? "Show Less"
                      : `View All Matches (${filteredMatches.length})`}

                    <span className="arrow">
                      {showAll ? "↑" : "→"}
                    </span>
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      </main>


      {/* ============================================================
          MATCH DETAILS MODAL
      ============================================================ */}

      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          onClose={closeModal}
          onOpenHighlights={openHighlights}
        />
      )}
      {activeReplay && (
        <MatchHighlightsModal
          match={activeReplay}
          open={true}
          onClose={() => setActiveReplay(null)}
        />
      )}
    </div>
  );
}