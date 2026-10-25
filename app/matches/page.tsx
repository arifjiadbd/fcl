"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

import Link from "next/link";

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
   FCL THEME DETECTION
   Matches Home Page Theme System
================================================================ */

function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const read = () => {
      const h = document.documentElement;
      const b = document.body;

      const dt = (
        h.getAttribute("data-theme") ||
        h.getAttribute("data-mode") ||
        b.getAttribute("data-theme") ||
        ""
      ).toLowerCase();

      if (dt === "dark" || dt === "light") {
        return dt === "dark";
      }

      const cls = `${h.className} ${b.className}`.toLowerCase();

      if (/\blight\b/.test(cls)) return false;
      if (/\bdark\b/.test(cls)) return true;

      const scheme = h.style.colorScheme;

      if (scheme === "light" || scheme === "dark") {
        return scheme === "dark";
      }

      try {
        const saved = localStorage.getItem("theme");

        if (saved === "light" || saved === "dark") {
          return saved === "dark";
        }
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

    observer.observe(document.documentElement, options);

    observer.observe(document.body, options);

    window.addEventListener("storage", update);

    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    media.addEventListener("change", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", update);
      media.removeEventListener("change", update);
    };
  }, []);

  return isDark;
}

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

  const num = Number(val);

  if (isExcelSerial(val)) {
    const utcDays = Math.floor(num - 25569);

    const dateInfo = new Date(
      utcDays * 86400 * 1000
    );

    const day = String(
      dateInfo.getUTCDate()
    ).padStart(2, "0");

    return `${day} ${
      MONTHS[dateInfo.getUTCMonth()]
    } ${dateInfo.getUTCFullYear()}`;
  }

  return String(val).trim();
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
    day: d.getDate(),
    month: d.getMonth(),
    year: d.getFullYear(),
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
      className={`match-stat group relative flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl border px-1.5 pb-3 pt-3 text-center transition-all duration-300 active:scale-95 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-[22px] lg:px-4 lg:py-4 lg:text-left lg:hover:-translate-y-1 ${
        active ? "match-stat-active" : ""
      }`}
      style={
        {
          "--accent": category.color,
        } as React.CSSProperties
      }
    >
      {/* Top Accent */}

      <span
        className={`absolute inset-x-0 top-0 h-[3px] transition-opacity ${
          active ? "opacity-100" : "opacity-40"
        }`}
        style={{
          backgroundColor: category.color,
        }}
      />

      {/* Icon */}

      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-base lg:h-12 lg:w-12 lg:text-[22px]"
        style={{
          backgroundColor: `${category.color}13`,
          borderColor: `${category.color}40`,
        }}
      >
        {category.icon}
      </span>

      {/* Stats */}

      <span className="mt-2 flex min-w-0 flex-col items-center lg:mt-0 lg:items-start">
        <span
          className="text-[19px] font-black tabular-nums leading-none lg:text-[30px]"
          style={{
            color: category.color,
          }}
        >
          {count}
        </span>

        <span className="match-muted mt-1 max-w-full truncate text-[9px] font-bold lg:text-xs">
          <span className="lg:hidden">
            {category.short}
          </span>

          <span className="hidden lg:inline">
            {category.key === "all"
              ? "Total Matches"
              : category.short}
          </span>
        </span>
      </span>
    </button>
  );
}

/* ================================================================
   DESKTOP MATCH CARD
================================================================ */

function DesktopMatchCard({
  match,
  onOpen,
}: {
  match: MatchItem;
  onOpen: (match: MatchItem) => void;
}) {
  const style = getCategoryStyle(match.category);

  return (
    <button
      type="button"
      onClick={() => onOpen(match)}
      className="match-card group relative flex h-full min-h-[230px] flex-col justify-between overflow-hidden rounded-[26px] border p-5 text-left transition-all duration-500 hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]"
      style={
        {
          "--accent": style.color,
        } as React.CSSProperties
      }
    >
      {/* Top Accent */}

      <span
        className="absolute inset-x-0 top-0 h-[3px] opacity-80"
        style={{
          background: `linear-gradient(90deg, ${style.color}, transparent)`,
        }}
      />

      {/* Ambient Glow */}

      <div
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-20 blur-[65px] transition-opacity duration-500 group-hover:opacity-50"
        style={{
          backgroundColor: style.color,
        }}
      />

      {/* Card Content */}

      <div className="relative z-10">
        <div className="flex items-center gap-3.5">
          <DateBox match={match} />

          <div className="min-w-0 flex-1">
            <CatBadge category={match.category} />

            <p className="match-muted mt-2 truncate text-[11px] font-semibold">
              📅 {formatExcelDate(match.date)}
            </p>
          </div>
        </div>

        <h3 className="match-heading mt-5 line-clamp-3 break-words text-[17px] font-black leading-snug tracking-tight transition-colors duration-300 group-hover:text-[#1877F2]">
          {match.title}
        </h3>
      </div>

      {/* Footer */}

      <div className="match-card-footer relative z-10 mt-6 flex items-center justify-between border-t pt-4">
        <span className="match-blue text-[11px] font-black">
          View Match Details
        </span>

        <span className="match-arrow flex h-8 w-8 items-center justify-center rounded-xl border text-base font-black transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#1877F2] group-hover:text-white">
          →
        </span>
      </div>
    </button>
  );
}

/* ================================================================
   MOBILE MATCH CARD
================================================================ */

function MobileMatchRow({
  match,
  onOpen,
}: {
  match: MatchItem;
  onOpen: (match: MatchItem) => void;
}) {
  const style = getCategoryStyle(match.category);

  return (
    <button
      type="button"
      onClick={() => onOpen(match)}
      className="match-mobile-card group relative flex w-full items-center gap-3 overflow-hidden rounded-[20px] border p-3 pl-4 text-left transition-all duration-300 active:scale-[0.98]"
      style={
        {
          "--accent": style.color,
        } as React.CSSProperties
      }
    >
      {/* Left Accent */}

      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{
          backgroundColor: style.color,
        }}
      />

      {/* Date */}

      <DateBox match={match} size="sm" />

      {/* Content */}

      <div className="min-w-0 flex-1">
        <CatBadge
          category={match.category}
          small
        />

        <h3 className="match-heading mt-2 line-clamp-2 break-words text-[13px] font-black leading-snug">
          {match.title}
        </h3>

        <p className="match-muted mt-1 text-[9px] font-semibold">
          {formatExcelDate(match.date)}
        </p>
      </div>

      {/* Arrow */}

      <span className="match-blue flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1877F2]/10 text-lg font-black">
        ›
      </span>
    </button>
  );
}

/* ================================================================
   MATCH DETAILS MODAL
================================================================ */

function MatchModal({
  match,
  onClose,
}: {
  match: MatchItem;
  onClose: () => void;
}) {
  const style = getCategoryStyle(match.category);

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
            {/* Mobile Facebook Button */}

            {match.link && (
              <a
                href={match.link}
                target="_blank"
                rel="noopener noreferrer"
                className="match-facebook-btn inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-black text-white shadow-lg sm:hidden"
              >
                <span>Facebook Post</span>

                <span>↗</span>
              </a>
            )}

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

        {/* Scrollable Body */}

        <div className="match-modal-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-8 sm:pb-7">
          {/* Match Heading */}

          <h2
            id="match-modal-title"
            className="match-heading break-words text-[22px] font-black leading-tight tracking-tight sm:text-[28px]"
          >
            {match.title}
          </h2>

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

        {/* Desktop Footer */}

        <div className="match-modal-footer hidden shrink-0 items-center justify-between gap-3 border-t px-8 py-5 sm:flex">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />

            <span className="match-muted text-xs font-bold">
              FCL Official Match Record
            </span>
          </div>

          {match.link ? (
            <a
              href={match.link}
              target="_blank"
              rel="noopener noreferrer"
              className="match-facebook-btn group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs font-black text-white transition-all duration-300 hover:-translate-y-0.5"
            >
              View Official Facebook Post

              <span className="transition-transform group-hover:translate-x-1">
                ↗
              </span>
            </a>
          ) : (
            <span className="match-muted text-xs font-semibold">
              Link Unavailable
            </span>
          )}
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
    <div
      className={`grid gap-3 ${
        isDesktop
          ? "grid-cols-2 gap-5 xl:grid-cols-3"
          : "grid-cols-1"
      }`}
    >
      {Array.from({
        length: isDesktop ? 9 : 7,
      }).map((_, index) => (
        <div
          key={index}
          className={`match-skeleton overflow-hidden rounded-[22px] border p-4 ${
            isDesktop ? "h-[230px]" : "h-[95px]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="match-skeleton-line h-14 w-14 shrink-0 animate-pulse rounded-xl" />

            <div className="flex-1 space-y-3">
              <div className="match-skeleton-line h-3 w-1/2 animate-pulse rounded-full" />

              <div className="match-skeleton-line h-3 w-3/4 animate-pulse rounded-full" />
            </div>
          </div>

          {isDesktop && (
            <div className="mt-6 space-y-3">
              <div className="match-skeleton-line h-4 w-5/6 animate-pulse rounded-full" />

              <div className="match-skeleton-line h-4 w-2/3 animate-pulse rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   MAIN PAGE
================================================================ */

export default function MatchesPage() {
  const isDark = useIsDark();

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

  const [pages, setPages] = useState(1);

  const [selectedMatch, setSelectedMatch] =
    useState<MatchItem | null>(null);

  const pageSize = isDesktop ? 18 : 15;

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
            const found = list.find(
              (match) =>
                String(match.id) === matchId
            );

            if (found) {
              setSelectedMatch(found);
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
    setPages(1);
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

  const visibleMatches = useMemo(
    () =>
      filteredMatches.slice(
        0,
        pages * pageSize
      ),
    [filteredMatches, pages, pageSize]
  );

  const remaining =
    filteredMatches.length -
    visibleMatches.length;

  /* ================================================================
     GROUP MATCHES
  ================================================================ */

  const groups = useMemo(() => {
    const map = new Map<
      string,
      MatchItem[]
    >();

    visibleMatches.forEach((match) => {
      const label = getGroupLabel(match);

      const existing = map.get(label);

      if (existing) {
        existing.push(match);
      } else {
        map.set(label, [match]);
      }
    });

    return Array.from(map.entries());
  }, [visibleMatches]);

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
     SEARCH BOX
  ================================================================ */

  const SearchBox = (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">
        🔍
      </span>

      <input
        type="search"
        aria-label="Search matches"
        placeholder="Search match title or summary..."
        value={searchQuery}
        onChange={(event) =>
          setSearchQuery(event.target.value)
        }
        className="match-input w-full rounded-2xl border py-3.5 pl-11 pr-11 text-xs font-medium outline-none sm:text-sm"
      />

      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="match-muted absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-xs transition hover:bg-[#1877F2]/10 hover:text-[#1877F2]"
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
      className={`match-root ${
        isDark ? "match-dark" : "match-light"
      } relative min-h-screen overflow-x-clip pb-28 font-sans transition-colors duration-300 sm:pb-20`}
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

      `}</style>

      {/* ============================================================
          PREMIUM HERO SECTION
      ============================================================ */}

      <section className="match-hero relative overflow-hidden border-b">
        {/* Grid */}

        <div className="match-grid pointer-events-none absolute inset-0" />

        {/* Background Glow */}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(24,119,242,0.12),transparent_45%)]" />

        {/* Animated Orbs */}

        <div className="match-orb pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#1877F2]/15 blur-[120px]" />

        <div className="match-orb match-orb-delay pointer-events-none absolute -bottom-40 -left-28 h-[360px] w-[360px] rounded-full bg-purple-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-[1400px] px-4 pb-9 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:px-10 lg:pb-16 lg:pt-14">
          {/* Breadcrumb */}

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="match-blue group inline-flex items-center gap-1.5 text-[11px] font-bold transition hover:opacity-70"
            >
              <span className="transition-transform group-hover:-translate-x-1">
                ←
              </span>

              Home
            </Link>

            <span className="match-muted text-xs">
              /
            </span>

            <span className="match-muted text-[11px] font-semibold">
              Match Archive
            </span>
          </div>

          {/* Hero Main */}

          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[850px]">
              {/* Eyebrow */}

              <div className="match-hero-badge mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.8)]" />

                <span className="text-[9px] font-black uppercase tracking-[0.23em] sm:text-[10px]">
                  FCL OFFICIAL MATCH ARCHIVE
                </span>
              </div>

              {/* Title */}

              <h1 className="match-heading text-[36px] font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[64px]">
                Match{" "}
                <span className="match-gradient-text">
                  Directory.
                </span>
              </h1>

              {/* Description */}

              <p className="match-text mt-5 max-w-[760px] text-xs leading-7 sm:text-sm lg:text-base lg:leading-8">
                FCL-এর সব ম্যাচের ডিজিটাল আর্কাইভ।
                এখানে পাবেন টুর্নামেন্ট হোম, সিরিজ,
                ফ্রেন্ডলি ও টেস্ট ম্যাচের বিস্তারিত সামারি।
                ক্যাটাগরি, বছর ও মাস অনুযায়ী ম্যাচ খুঁজুন
                এবং প্রতিটি ম্যাচের অফিসিয়াল ফেসবুক
                পোস্ট দেখুন।
              </p>

              {/* Feature Tags */}

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[9px] font-bold text-blue-600 sm:text-[10px]">
                  🏏 Match Records
                </span>

                <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[9px] font-bold text-amber-600 sm:text-[10px]">
                  🏆 Tournament History
                </span>

                <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-bold text-emerald-600 sm:text-[10px]">
                  ✓ Official Archive
                </span>
              </div>
            </div>

            {/* Latest Match */}

            {latestLabel && (
              <div className="match-latest relative flex shrink-0 items-center gap-4 self-start rounded-[20px] border px-5 py-4 lg:self-end">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1877F2]/20 bg-[#1877F2]/10 text-2xl">
                  📅
                </div>

                <div>
                  <p className="match-muted text-[10px] font-black uppercase tracking-wider">
                    Latest Match
                  </p>

                  <p className="match-heading mt-1 text-sm font-black sm:text-base">
                    {latestLabel}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <main className="relative mx-auto max-w-[1400px] px-4 pt-7 sm:px-6 sm:pt-10 lg:px-10">
        {/* ============================================================
            SECTION HEADING
        ============================================================ */}

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-[#1877F2]" />

            <span className="match-blue text-[9px] font-black uppercase tracking-[0.25em]">
              MATCH STATISTICS
            </span>
          </div>

          <h2 className="match-heading text-[23px] font-black tracking-tight sm:text-[30px]">
            Explore Match Categories
          </h2>

          <p className="match-muted mt-1.5 text-[11px] sm:text-xs">
            ক্যাটাগরি নির্বাচন করে আপনার পছন্দের ম্যাচ
            খুঁজে নিন।
          </p>
        </div>

        {/* ============================================================
            CATEGORY STATISTICS
        ============================================================ */}

        <div className="match-sticky-stats sticky top-0 z-30 -mx-4 mb-7 border-b px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-9 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-3 lg:gap-4">
            {CATEGORIES.map((category) => (
              <StatTile
                key={category.key}
                category={category}
                count={
                  loading
                    ? 0
                    : counts[category.key] ?? 0
                }
                active={
                  selectedCategory === category.key
                }
                onClick={() =>
                  setSelectedCategory(category.key)
                }
              />
            ))}
          </div>
        </div>

        {/* ============================================================
            SEARCH & FILTERS
        ============================================================ */}

        <div className="match-filter-panel mb-7 rounded-[24px] border p-4 sm:p-6 lg:mb-9">
          {/* Panel Header */}

          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="match-heading text-sm font-black sm:text-base">
                🔎 Find Your Match
              </h3>

              <p className="match-muted mt-1 text-[10px]">
                Search and filter the FCL archive
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={resetAll}
                className="match-blue rounded-lg bg-[#1877F2]/10 px-3 py-2 text-[10px] font-black transition hover:bg-[#1877F2]/20"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Filter Controls */}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            {/* Search */}

            <div className="w-full lg:max-w-[520px]">
              <label className="match-muted mb-2 block text-[10px] font-black uppercase tracking-wider">
                Search Matches
              </label>

              {SearchBox}
            </div>

            {/* Year & Month */}

            <div className="grid grid-cols-2 gap-3 lg:flex lg:items-end">
              {/* Year */}

              <div className="min-w-0 lg:w-[165px]">
                <label
                  htmlFor="match-year"
                  className="match-muted mb-2 block text-[10px] font-black uppercase tracking-wider"
                >
                  Year
                </label>

                <select
                  id="match-year"
                  value={selectedYear}
                  onChange={(event) =>
                    setSelectedYear(event.target.value)
                  }
                  className="match-select w-full rounded-xl border px-3 py-3.5 text-xs font-bold"
                >
                  {years.map((year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year === "All"
                        ? "All Years"
                        : year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}

              <div className="min-w-0 lg:w-[175px]">
                <label
                  htmlFor="match-month"
                  className="match-muted mb-2 block text-[10px] font-black uppercase tracking-wider"
                >
                  Month
                </label>

                <select
                  id="match-month"
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(event.target.value)
                  }
                  className="match-select w-full rounded-xl border px-3 py-3.5 text-xs font-bold"
                >
                  {months.map((month) => (
                    <option
                      key={month}
                      value={month}
                    >
                      {month === "All"
                        ? "All Months"
                        : month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters */}

          {!loading && hasFilters && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#1877F2]/10 pt-4">
              <span className="match-muted mr-1 text-[10px] font-bold">
                Active:
              </span>

              {activeFilters.map(
                (filter, index) => (
                  <button
                    key={`${filter.label}-${index}`}
                    type="button"
                    onClick={filter.clear}
                    className="match-blue inline-flex items-center gap-2 rounded-full border border-[#1877F2]/25 bg-[#1877F2]/10 px-3 py-1.5 text-[10px] font-black transition hover:bg-[#1877F2]/20"
                  >
                    <span>{filter.label}</span>

                    <span>✕</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* ============================================================
            RESULTS HEADER
        ============================================================ */}

        {!loading && !error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-1.5 w-6 rounded-full bg-[#1877F2]" />

                <span className="match-blue text-[9px] font-black uppercase tracking-[0.2em]">
                  FCL MATCH COLLECTION
                </span>
              </div>

              <h2 className="match-heading text-[21px] font-black tracking-tight sm:text-[27px]">
                Match Records
              </h2>
            </div>

            {/* Count */}

            <div className="match-filter-panel inline-flex items-center gap-2 rounded-xl border px-4 py-2.5">
              <span className="text-sm">🏏</span>

              <span className="match-muted text-[11px] font-bold">
                Showing
              </span>

              <span className="match-blue text-xs font-black">
                {visibleMatches.length}
              </span>

              <span className="match-muted text-[11px]">
                /
              </span>

              <span className="match-heading text-xs font-black">
                {filteredMatches.length}
              </span>
            </div>
          </div>
        )}

        {/* ============================================================
            DECORATIVE DIVIDER
        ============================================================ */}

        {!loading && !error && (
          <div className="mb-7 h-px w-full bg-gradient-to-r from-[#1877F2]/40 via-[#1877F2]/10 to-transparent" />
        )}

        {/* ============================================================
            LOADING
        ============================================================ */}

        {loading ? (
          <MatchSkeleton
            isDesktop={isDesktop}
          />
        ) : error ? (
          /* ==========================================================
             ERROR STATE
          ========================================================== */

          <div className="match-empty flex flex-col items-center justify-center rounded-[28px] border px-5 py-16 text-center sm:py-20">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-500/20 bg-rose-500/10 text-4xl">
              ⚠️
            </div>

            <h3 className="match-heading text-xl font-black">
              Match Archive Unavailable
            </h3>

            <p className="match-muted mt-3 max-w-md text-xs leading-6 sm:text-sm">
              এই মুহূর্তে ম্যাচের তথ্য লোড করা যাচ্ছে না।
              অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="match-primary-btn mt-6 rounded-xl px-6 py-3 text-xs font-black transition-all"
            >
              🔄 Try Again
            </button>
          </div>
        ) : filteredMatches.length === 0 ? (
          /* ==========================================================
             EMPTY STATE
          ========================================================== */

          <div className="match-empty flex flex-col items-center justify-center rounded-[28px] border px-5 py-16 text-center sm:py-20">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/20 bg-blue-500/10 text-4xl">
              📭
            </div>

            <h3 className="match-heading text-lg font-black sm:text-xl">
              No Match Records Found
            </h3>

            <p className="match-muted mt-3 max-w-md text-xs leading-6 sm:text-sm">
              আপনার নির্বাচিত ফিল্টার অথবা সার্চ অনুযায়ী
              কোনো ম্যাচ রেকর্ড পাওয়া যায়নি।
              অন্য ক্যাটাগরি, বছর বা মাস নির্বাচন করে
              আবার চেষ্টা করুন।
            </p>

            <button
              type="button"
              onClick={resetAll}
              className="match-primary-btn mt-6 rounded-xl px-6 py-3 text-xs font-black transition-all"
            >
              ✕ Clear All Filters
            </button>
          </div>
        ) : (
          /* ==========================================================
             MATCH GROUPS
          ========================================================== */

          <div className="space-y-9">
            {groups.map(([label, items]) => (
              <section key={label}>
                {/* Group Header */}

                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#1877F2]/20 bg-[#1877F2]/10 text-base">
                    📅
                  </div>

                  <h2 className="match-heading whitespace-nowrap text-[14px] font-black tracking-tight sm:text-base">
                    {label}
                  </h2>

                  <span className="match-blue rounded-full bg-[#1877F2]/10 px-2.5 py-1 text-[10px] font-black">
                    {items.length}
                  </span>

                  <span className="match-group-line h-px flex-1" />
                </div>

                {/* Desktop Cards */}

                {isDesktop ? (
                  <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
                    {items.map((match) => (
                      <DesktopMatchCard
                        key={match.id}
                        match={match}
                        onOpen={setSelectedMatch}
                      />
                    ))}
                  </div>
                ) : (
                  /* Mobile Rows */

                  <div className="space-y-3">
                    {items.map((match) => (
                      <MobileMatchRow
                        key={match.id}
                        match={match}
                        onOpen={setSelectedMatch}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* ============================================================
            LOAD MORE
        ============================================================ */}

        {!loading && !error && remaining > 0 && (
          <div className="mt-12 flex flex-col items-center gap-5">
            {/* Progress */}

            <div className="w-full max-w-[280px]">
              <div className="match-muted mb-2 flex items-center justify-between text-[10px] font-bold">
                <span>Archive Progress</span>

                <span>
                  {Math.round(
                    (visibleMatches.length /
                      filteredMatches.length) *
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
                      (visibleMatches.length /
                        filteredMatches.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Buttons */}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setPages((page) => page + 1)
                }
                className="match-primary-btn rounded-xl px-6 py-3.5 text-xs font-black transition-all sm:text-sm"
              >
                Show{" "}
                {Math.min(pageSize, remaining)}{" "}
                More ↓
              </button>

              <button
                type="button"
                onClick={() =>
                  setPages(
                    Math.ceil(
                      filteredMatches.length /
                        pageSize
                    )
                  )
                }
                className="match-secondary-btn rounded-xl border px-6 py-3.5 text-xs font-black transition-all sm:text-sm"
              >
                Show All ({remaining} left)
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            BOTTOM INFO
        ============================================================ */}

        {!loading &&
          !error &&
          filteredMatches.length > 0 && (
            <div className="mt-14 flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex items-center gap-3">
                <div className="h-px w-14 bg-gradient-to-r from-transparent to-[#1877F2]/40" />

                <span className="text-lg">
                  🏏
                </span>

                <div className="h-px w-14 bg-gradient-to-l from-transparent to-[#1877F2]/40" />
              </div>

              <p className="match-muted text-[10px] font-black uppercase tracking-[0.2em]">
                Facebook Cricket League
              </p>

              <p className="match-muted text-[10px]">
                Showing{" "}
                {visibleMatches.length} of{" "}
                {filteredMatches.length} match
                records
              </p>
            </div>
          )}
      </main>

      {/* ============================================================
          MATCH DETAILS MODAL
      ============================================================ */}

      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          onClose={closeModal}
        />
      )}
    </div>
  );
}