"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";

/* =========================================================
   FCL HIGH VOLTAGE MATCHES
   Thriller Zone — Compact Premium Motion Edition
   ========================================================= */

interface HighVoltageMatch {
  matchTitle: string;
  tournament: string;
  date: string;
  description: string;
  facebookLink: string;
  thumbnail: string;
}

type SortBy = "default" | "date-desc" | "date-asc" | "title-asc";
type ViewMode = "grid" | "list";

type IndexedMatch = {
  item: HighVoltageMatch;
  originalIndex: number;
  dateLabel: string;
  timestamp: number;
  key: string;
};

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "default", label: "Featured Order" },
  { value: "date-desc", label: "Date: Newest" },
  { value: "date-asc", label: "Date: Oldest" },
  { value: "title-asc", label: "Title: A → Z" },
];

const SPOTLIGHT_INTERVAL = 5500;

/* =========================================================
   DATA HELPERS
   ========================================================= */

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function isExcelSerial(num: number): boolean {
  return Number.isFinite(num) && num > 20000 && num < 60000;
}

function formatExcelDate(val: unknown): string {
  if (!val || val === "—") return "";

  const num = Number(val);

  if (isExcelSerial(num)) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const day = String(dateInfo.getUTCDate()).padStart(2, "0");

    const months = [
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

    return `${day} ${months[dateInfo.getUTCMonth()]} ${dateInfo.getUTCFullYear()}`;
  }

  return String(val).trim();
}

function dateToTimestamp(val: unknown): number {
  if (!val || val === "—") return 0;

  const num = Number(val);

  if (isExcelSerial(num)) {
    return Math.floor(num - 25569) * 86400 * 1000;
  }

  const parsed = Date.parse(String(val).trim());

  return Number.isFinite(parsed) ? parsed : 0;
}

function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function cleanPreview(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getPageList(current: number, total: number): (number | "…")[] {
  const set = new Set<number>([1, total, current - 1, current, current + 1]);

  const sorted = Array.from(set)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);

  const result: (number | "…")[] = [];

  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) result.push("…");
    result.push(n);
  });

  return result;
}

/* =========================================================
   TEXT FORMATTING
   ========================================================= */

function renderHighlightedParts(text: string): ReactNode {
  if (!text) return null;

  const parts = text.split(/(\*\*[\s\S]*?\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="fcl-hv-highlight strong">
          {part.slice(2, -2).trim()}
        </strong>
      );
    }

    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      !part.startsWith("**") &&
      !part.endsWith("**")
    ) {
      return (
        <strong key={index} className="fcl-hv-highlight">
          {part.slice(1, -1).trim()}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function renderTextWithHighlights(text: string): ReactNode {
  if (!text) return null;

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return (
          <div key={index} className="fcl-hv-paragraph-gap" aria-hidden="true" />
        );
      }

      const dialogueMatch = trimmed.match(/^([^:\n]{1,70}):\s+(.+)$/);

      if (dialogueMatch) {
        return (
          <p key={index} className="fcl-hv-paragraph fcl-hv-dialogue">
            <strong className="fcl-hv-speaker">{dialogueMatch[1]}:</strong>{" "}
            {renderHighlightedParts(dialogueMatch[2])}
          </p>
        );
      }

      return (
        <p key={index} className="fcl-hv-paragraph">
          {renderHighlightedParts(trimmed)}
        </p>
      );
    });
}

/* =========================================================
   HOOKS
   ========================================================= */

function detectDarkTheme(): boolean {
  if (typeof window === "undefined") return true;

  const html = document.documentElement;
  const body = document.body;

  const attributes = [
    html.getAttribute("data-theme"),
    html.getAttribute("data-mode"),
    body.getAttribute("data-theme"),
    body.getAttribute("data-mode"),
  ];

  for (const value of attributes) {
    if (value === "dark") return true;
    if (value === "light") return false;
  }

  if (html.classList.contains("dark") || body.classList.contains("dark")) {
    return true;
  }

  if (html.classList.contains("light") || body.classList.contains("light")) {
    return false;
  }

  const schemes = [html.style.colorScheme, body.style.colorScheme];

  for (const scheme of schemes) {
    if (scheme === "dark") return true;
    if (scheme === "light") return false;
  }

  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {
    // Storage may be unavailable.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const update = () => setIsDark(detectDarkTheme());

    update();

    const observer = new MutationObserver(update);

    const options: MutationObserverInit = {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-mode", "style"],
    };

    observer.observe(document.documentElement, options);
    observer.observe(document.body, options);

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    media.addEventListener?.("change", update);
    window.addEventListener("storage", update);

    return () => {
      observer.disconnect();
      media.removeEventListener?.("change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return isDark;
}

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setMobile(media.matches);

    update();
    media.addEventListener?.("change", update);

    return () => media.removeEventListener?.("change", update);
  }, []);

  return mobile;
}

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) {
      setValue(target);
      return;
    }

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      setValue(Math.round(target * eased));

      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/* =========================================================
   ICONS
   ========================================================= */

type IconProps = { size?: number };

function Svg({
  size = 18,
  children,
  strokeWidth = 1.8,
}: {
  size?: number;
  children: ReactNode;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function SearchIcon({ size = 18 }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </Svg>
  );
}

function ArrowIcon({
  direction = "right",
  size = 17,
}: {
  direction?: "right" | "left" | "up-right" | "up";
  size?: number;
}) {
  const rotation =
    direction === "left"
      ? "rotate(180deg)"
      : direction === "up-right"
        ? "rotate(-45deg)"
        : direction === "up"
          ? "rotate(-90deg)"
          : undefined;

  return (
    <span style={{ display: "inline-flex", transform: rotation }}>
      <Svg size={size}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </Svg>
    </span>
  );
}

function CloseIcon({ size = 18 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={1.9}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

function GridIcon({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </Svg>
  );
}

function ListIcon({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Svg>
  );
}

function SortIcon({ size = 17 }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M7 4v16M7 20l-3-3M7 20l3-3" />
      <path d="M17 20V4M17 4l-3 3M17 4l3 3" />
    </Svg>
  );
}

function CheckIcon({ size = 15 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={2.2}>
      <path d="m5 12 5 5 9-10" />
    </Svg>
  );
}

function ChevronIcon({ size = 16 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={2}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

function BoltIcon({ size = 20 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={1.9}>
      <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />
    </Svg>
  );
}

function CalendarIcon({ size = 12 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={2}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </Svg>
  );
}

function TrophyIcon({ size = 12 }: IconProps) {
  return (
    <Svg size={size} strokeWidth={2}>
      <path d="M8 21h8M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
    </Svg>
  );
}

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="fcl-hv-eyebrow">{children}</span>;
}

function Thumb({
  src,
  size = 52,
  radius = 14,
}: {
  src: string;
  size?: number;
  radius?: number;
}) {
  const [failed, setFailed] = useState(false);

  const valid = Boolean(src) && isValidExternalUrl(src) && !failed;

  return (
    <span
      className="fcl-hv-thumb"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {valid ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <BoltIcon size={Math.round(size * 0.42)} />
      )}
    </span>
  );
}

function StatValue({ value }: { value: number | string }) {
  const counted = useCountUp(typeof value === "number" ? value : 0);

  return (
    <>{typeof value === "number" ? counted.toLocaleString("en-US") : value}</>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="fcl-hv-hero-stat">
      <strong>
        <StatValue value={value} />
      </strong>
      <span>{label}</span>
    </div>
  );
}

/* =========================================================
   SPOTLIGHT
   ========================================================= */

function Spotlight({
  items,
  loading,
  onOpen,
}: {
  items: IndexedMatch[];
  loading: boolean;
  onOpen: (match: IndexedMatch) => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;

    const timer = window.setInterval(() => {
      setIndex((previous) => (previous + 1) % items.length);
    }, SPOTLIGHT_INTERVAL);

    return () => window.clearInterval(timer);
  }, [items.length, paused, index]);

  if (loading) {
    return (
      <div className="fcl-hv-spot loading" aria-hidden="true">
        <div className="fcl-hv-skeleton" style={{ width: 120, height: 12 }} />
        <div
          className="fcl-hv-skeleton"
          style={{ width: "70%", height: 22, marginTop: 20 }}
        />
        <div
          className="fcl-hv-skeleton"
          style={{ width: "90%", height: 14, marginTop: 14 }}
        />
      </div>
    );
  }

  if (items.length === 0) return null;

  const current = items[index % items.length];

  return (
    <div
      className={`fcl-hv-spot ${paused ? "paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="fcl-hv-spot-head">
        <span className="fcl-hv-live">
          <i />
          LATEST THRILLER
        </span>

        {current.dateLabel && (
          <span className="fcl-hv-spot-date">{current.dateLabel}</span>
        )}
      </div>

      <button
        key={current.key}
        type="button"
        className="fcl-hv-spot-body"
        onClick={() => onOpen(current)}
      >
        <Thumb src={current.item.thumbnail} size={50} />

        <span className="fcl-hv-spot-text">
          <strong>{current.item.matchTitle || "High Voltage Match"}</strong>

          <em>{current.item.tournament || "FCL Tournament"}</em>

          <small>
            {cleanPreview(current.item.description || "") || "বিস্তারিত দেখুন"}
          </small>
        </span>

        <span className="fcl-hv-spot-go">
          <ArrowIcon />
        </span>
      </button>

      {items.length > 1 && (
        <div className="fcl-hv-spot-dots">
          {items.map((entry, dotIndex) => (
            <button
              key={entry.key}
              type="button"
              aria-label={`Show featured match ${dotIndex + 1}`}
              className={dotIndex === index ? "active" : ""}
              onClick={() => setIndex(dotIndex)}
            >
              {dotIndex === index && <span key={index} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SORT MENU
   ========================================================= */

function SortMenu({
  value,
  onChange,
}: {
  value: SortBy;
  onChange: (value: SortBy) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = SORT_OPTIONS.find((option) => option.value === value);

  return (
    <div className="fcl-hv-sort" ref={ref}>
      <button
        type="button"
        className={`fcl-hv-sort-btn ${open ? "open" : ""}`}
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort matches"
      >
        <SortIcon />

        <span className="label">{current?.label}</span>

        <span className="chev">
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className="fcl-hv-sort-menu" role="listbox">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={option.value === value ? "selected" : ""}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}

              {option.value === value && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MATCH CARD
   ========================================================= */

function MatchCard({
  match,
  index,
  onOpen,
}: {
  match: IndexedMatch;
  index: number;
  onOpen: () => void;
}) {
  const { item, dateLabel } = match;

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();

    target.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    target.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerMove={handlePointerMove}
      className="fcl-hv-card"
      style={{ "--i": index } as CSSProperties}
      aria-label={`${item.matchTitle} - বিস্তারিত দেখুন`}
    >
      <div className="fcl-hv-card-top">
        <span className="fcl-hv-badge">
          <TrophyIcon />
          <b>{item.tournament || "FCL Tournament"}</b>
        </span>

        <span className="fcl-hv-card-arrow">
          <ArrowIcon direction="up-right" size={16} />
        </span>
      </div>

      <div className="fcl-hv-card-main">
        <Thumb src={item.thumbnail} size={52} />

        <div>
          <h3>{item.matchTitle || "High Voltage Match"}</h3>

          {dateLabel && (
            <span className="fcl-hv-date">
              <CalendarIcon />
              {dateLabel}
            </span>
          )}
        </div>
      </div>

      <p className="fcl-hv-preview">
        {cleanPreview(item.description || "") ||
          "এই ম্যাচের বিস্তারিত পড়তে কার্ডটি খুলুন।"}
      </p>
    </button>
  );
}

/* =========================================================
   MATCH MODAL (desktop dialog / mobile bottom sheet)
   ========================================================= */

function MatchModal({
  match,
  position,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  match: IndexedMatch;
  position: number;
  total: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const { item, dateLabel } = match;

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [bannerFailed, setBannerFailed] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowLeft" && onPrev) {
        onPrev();
        return;
      }

      if (event.key === "ArrowRight" && onNext) {
        onNext();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    setProgress(0);
    setBannerFailed(false);
  }, [match.key]);

  const handleScroll = () => {
    const element = bodyRef.current;

    if (!element) return;

    const max = element.scrollHeight - element.clientHeight;

    setProgress(max > 0 ? element.scrollTop / max : 0);
  };

  const hasPostLink = isValidExternalUrl(item.facebookLink);
  const hasBanner = isValidExternalUrl(item.thumbnail) && !bannerFailed;

  return (
    <div
      className="fcl-hv-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="fcl-hv-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fcl-hv-modal-title"
      >
        <div className="fcl-hv-sheet-handle" aria-hidden="true" />

        <div className="fcl-hv-modal-top">
          <div className="fcl-hv-modal-meta">
            <span className="fcl-hv-badge solid">
              <TrophyIcon />
              <b>{item.tournament || "FCL Tournament"}</b>
            </span>

            <span className="fcl-hv-modal-pos">
              {position} / {total}
            </span>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="fcl-hv-modal-close"
            aria-label="Close match details"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="fcl-hv-modal-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>

        <div className="fcl-hv-modal-body" ref={bodyRef} onScroll={handleScroll}>
          <div className="fcl-hv-modal-content" key={match.key}>
            {hasBanner && (
              <div className="fcl-hv-banner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => setBannerFailed(true)}
                />
              </div>
            )}

            <Eyebrow>HIGH VOLTAGE MATCH</Eyebrow>

            <h2 id="fcl-hv-modal-title">
              {item.matchTitle || "High Voltage Match"}
            </h2>

            {dateLabel && (
              <span className="fcl-hv-date big">
                <CalendarIcon size={13} />
                {dateLabel}
              </span>
            )}

            <div className="fcl-hv-modal-story">
              <div className="fcl-hv-story-heading">
                <span>MATCH SUMMARY</span>

                <span>FCL ARCHIVES</span>
              </div>

              <div className="fcl-hv-story-content">
                {item.description ? (
                  renderTextWithHighlights(item.description)
                ) : (
                  <p>এই ম্যাচের বিস্তারিত বিবরণ এখনো সংরক্ষিত হয়নি।</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="fcl-hv-modal-footer">
          <div className="fcl-hv-modal-nav">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev}
              aria-label="Previous match"
            >
              <ArrowIcon direction="left" />
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!onNext}
              aria-label="Next match"
            >
              <ArrowIcon />
            </button>
          </div>

          {hasPostLink ? (
            <a
              href={item.facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="fcl-hv-facebook-button"
            >
              মূল ফেসবুক পোস্ট
              <ArrowIcon direction="up-right" size={16} />
            </a>
          ) : (
            <span className="fcl-hv-no-link">মূল পোস্টের লিংক নেই</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING / EMPTY / PAGER
   ========================================================= */

function LoadingCards({ count }: { count: number }) {
  return (
    <div className="fcl-hv-grid" aria-busy="true" aria-label="Loading matches">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="fcl-hv-skeleton-card">
          <div className="fcl-hv-skeleton badge" />
          <div className="fcl-hv-skeleton name" />
          <div className="fcl-hv-skeleton line" />
          <div className="fcl-hv-skeleton line short" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  description,
  onReset,
}: {
  title: string;
  description: string;
  onReset?: () => void;
}) {
  return (
    <div className="fcl-hv-empty">
      <div className="fcl-hv-empty-mark">
        <BoltIcon size={26} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="fcl-hv-primary-button"
        >
          সব ম্যাচ দেখুন
          <ArrowIcon />
        </button>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  from,
  to,
  count,
  onChange,
}: {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  count: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="fcl-hv-pager" aria-label="Pagination">
      <span className="fcl-hv-pager-meta">
        {from}–{to} / {count}
      </span>

      <div className="fcl-hv-pager-controls">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ArrowIcon direction="left" />
        </button>

        <div className="fcl-hv-pager-nums">
          {getPageList(page, totalPages).map((entry, index) =>
            entry === "…" ? (
              <span key={`gap-${index}`} className="gap">
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                className={entry === page ? "active" : ""}
                onClick={() => onChange(entry)}
                aria-current={entry === page ? "page" : undefined}
              >
                {entry}
              </button>
            )
          )}
        </div>

        <span className="fcl-hv-pager-mobile">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ArrowIcon />
        </button>
      </div>
    </nav>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function ThrillersPage() {
  const isDark = useIsDark();
  const isMobile = useIsMobile();

  const [matches, setMatches] = useState<HighVoltageMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const [selectedMatch, setSelectedMatch] = useState<IndexedMatch | null>(null);

  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("All");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [showTop, setShowTop] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);

  const pageSize = view === "list" ? (isMobile ? 8 : 10) : isMobile ? 6 : 9;

  /* =======================================================
     FETCH DATA
     ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    let active = true;

    async function loadMatches() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/thrillers-data", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        if (!active) return;

        const records = Array.isArray(data?.highVoltage) ? data.highVoltage : [];

        const normalizedRecords: HighVoltageMatch[] = records.map(
          (item: Partial<HighVoltageMatch>) => ({
            matchTitle: normalize(item.matchTitle),
            tournament: normalize(item.tournament),
            date: normalize(item.date),
            description: normalize(item.description),
            facebookLink: normalize(item.facebookLink),
            thumbnail: normalize(item.thumbnail),
          })
        );

        setMatches(normalizedRecords);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        if (!active) return;

        console.error("Error fetching thrillers:", err);

        setError("ম্যাচের তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMatches();

    return () => {
      active = false;
      controller.abort();
    };
  }, [retryKey]);

  /* =======================================================
     DERIVED DATA
     ======================================================= */

  const indexedMatches = useMemo<IndexedMatch[]>(() => {
    return matches.map((item, index) => ({
      item,
      originalIndex: index,
      dateLabel: formatExcelDate(item.date),
      timestamp: dateToTimestamp(item.date),
      key: `${index}-${item.matchTitle}`,
    }));
  }, [matches]);

  const tournaments = useMemo(() => {
    return Array.from(
      new Set(
        indexedMatches.map((record) => record.item.tournament).filter(Boolean)
      )
    );
  }, [indexedMatches]);

  const latestYear = useMemo(() => {
    const max = indexedMatches.reduce(
      (acc, record) => Math.max(acc, record.timestamp),
      0
    );

    return max > 0 ? String(new Date(max).getUTCFullYear()) : "—";
  }, [indexedMatches]);

  const spotlightItems = useMemo(() => {
    return [...indexedMatches]
      .sort(
        (a, b) => b.timestamp - a.timestamp || b.originalIndex - a.originalIndex
      )
      .slice(0, 5);
  }, [indexedMatches]);

  const filteredMatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = indexedMatches.filter((record) => {
      const matchesTournament =
        selectedTournament === "All" ||
        record.item.tournament === selectedTournament;

      if (!matchesTournament) return false;

      if (!query) return true;

      return [
        record.item.matchTitle,
        record.item.tournament,
        record.item.description,
        record.dateLabel,
      ].some((value) => normalize(value).toLowerCase().includes(query));
    });

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date-desc":
          comparison = b.timestamp - a.timestamp;
          break;

        case "date-asc":
          comparison = a.timestamp - b.timestamp;
          break;

        case "title-asc":
          comparison = a.item.matchTitle.localeCompare(b.item.matchTitle);
          break;

        default:
          comparison = 0;
      }

      return comparison || a.originalIndex - b.originalIndex;
    });

    return result;
  }, [indexedMatches, selectedTournament, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredMatches.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const visibleMatches = filteredMatches.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const rangeFrom =
    filteredMatches.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const rangeTo = Math.min(currentPage * pageSize, filteredMatches.length);

  const filtersActive =
    searchQuery.trim() !== "" ||
    selectedTournament !== "All" ||
    sortBy !== "default";

  /* =======================================================
     MODAL NAVIGATION
     ======================================================= */

  const navList = useMemo(() => {
    if (!selectedMatch) return [];

    return filteredMatches.some((entry) => entry.key === selectedMatch.key)
      ? filteredMatches
      : [selectedMatch];
  }, [filteredMatches, selectedMatch]);

  const selectedIndex = selectedMatch
    ? navList.findIndex((entry) => entry.key === selectedMatch.key)
    : -1;

  const closeModal = useCallback(() => setSelectedMatch(null), []);

  const goPrev = useCallback(() => {
    if (selectedIndex > 0) setSelectedMatch(navList[selectedIndex - 1]);
  }, [navList, selectedIndex]);

  const goNext = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < navList.length - 1) {
      setSelectedMatch(navList[selectedIndex + 1]);
    }
  }, [navList, selectedIndex]);

  /* =======================================================
     EFFECTS
     ======================================================= */

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 520);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || selectedMatch) return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;

      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      event.preventDefault();
      searchRef.current?.focus();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [selectedMatch]);

  /* =======================================================
     ACTIONS
     ======================================================= */

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTournament("All");
    setSortBy("default");
    setPage(1);
  };

  const scrollToCollection = () => {
    document
      .getElementById("fcl-hv-collection")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(next, 1), totalPages));

    requestAnimationFrame(scrollToCollection);
  };

  /* =======================================================
     THEME VARIABLES
     ======================================================= */

  const themeStyle = {
    colorScheme: isDark ? "dark" : "light",

    "--hv-bg": isDark ? "#020617" : "#f8fafc",
    "--hv-secondary": isDark ? "#071020" : "#f1f5f9",
    "--hv-card": isDark ? "#0b1220" : "#ffffff",
    "--hv-raised": isDark ? "#0f172a" : "#e9eef5",
    "--hv-heading": isDark ? "#f8fafc" : "#0f172a",
    "--hv-text": isDark ? "#cbd5e1" : "#334155",
    "--hv-muted": isDark ? "#94a3b8" : "#64748b",
    "--hv-subtle": isDark ? "#64748b" : "#94a3b8",
    "--hv-border": isDark ? "#1e293b" : "#e2e8f0",
    "--hv-glass": isDark ? "rgba(7,16,32,.78)" : "rgba(255,255,255,.82)",

    "--hv-blue": "#1877F2",
    "--hv-purple": isDark ? "#a78bfa" : "#7c3aed",
    "--hv-gold": "#f59e0b",

    "--hv-accent-soft": isDark
      ? "rgba(139,92,246,.16)"
      : "rgba(124,58,237,.09)",

    "--hv-shadow": isDark
      ? "0 18px 45px rgba(0,0,0,.22)"
      : "0 18px 45px rgba(15,23,42,.06)",
  } as CSSProperties;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className={`fcl-hv-page ${isDark ? "fcl-hv-dark" : "fcl-hv-light"}`}
      style={themeStyle}
    >
      {/* ================= HERO ================= */}

      <header className="fcl-hv-hero">
        <div className="fcl-hv-hero-grid" />
        <div className="fcl-hv-hero-glow one" />
        <div className="fcl-hv-hero-glow two" />

        <div className="fcl-hv-sq a" />
        <div className="fcl-hv-sq b" />
        <div className="fcl-hv-sq c" />

        <div className="fcl-hv-container">
          <div className="fcl-hv-hero-inner">
            <div className="fcl-hv-hero-content">
              <div className="fcl-hv-hero-label">
                <span />
                FCL THRILLER ZONE
              </div>

              <h1>
                High Voltage <em>Matches.</em>
              </h1>

              <p>
                যে ম্যাচগুলোতে ছিল চরম নাটকীয়তা, শেষ ওভারের রোমাঞ্চ আর বুক
                কাঁপুনি জয়!
              </p>

              <div className="fcl-hv-hero-actions">
                <button
                  type="button"
                  onClick={scrollToCollection}
                  className="fcl-hv-primary-button"
                >
                  ম্যাচগুলো দেখুন
                  <ArrowIcon direction="up" />
                </button>

                <Link href="/" className="fcl-hv-outline-button">
                  <ArrowIcon direction="left" size={15} />
                  Back to Home
                </Link>
              </div>
            </div>

            <Spotlight
              items={spotlightItems}
              loading={loading}
              onOpen={setSelectedMatch}
            />
          </div>

          <div className="fcl-hv-hero-stats">
            <HeroStat label="THRILLERS" value={loading ? "—" : matches.length} />

            <HeroStat
              label="TOURNAMENTS"
              value={loading ? "—" : tournaments.length}
            />

            <HeroStat label="LATEST YEAR" value={loading ? "—" : latestYear} />
          </div>
        </div>
      </header>

      {/* ================= COLLECTION ================= */}

      <main id="fcl-hv-collection" className="fcl-hv-collection">
        <div className="fcl-hv-container">
          {/* ---------- COMMAND BAR ---------- */}

          <div className="fcl-hv-toolbar">
            <div className="fcl-hv-toolbar-row">
              <div className="fcl-hv-search">
                <SearchIcon />

                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="ম্যাচ, টুর্নামেন্ট বা কীওয়ার্ড খুঁজুন..."
                  aria-label="Search matches"
                />

                {searchQuery ? (
                  <button
                    type="button"
                    className="clear"
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                    }}
                    aria-label="Clear search"
                  >
                    <CloseIcon size={14} />
                  </button>
                ) : (
                  <kbd>/</kbd>
                )}
              </div>

              <SortMenu
                value={sortBy}
                onChange={(value) => {
                  setSortBy(value);
                  setPage(1);
                }}
              />

              <div className="fcl-hv-view-toggle" role="group" aria-label="View">
                <button
                  type="button"
                  className={view === "grid" ? "active" : ""}
                  onClick={() => {
                    setView("grid");
                    setPage(1);
                  }}
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                >
                  <GridIcon />
                </button>

                <button
                  type="button"
                  className={view === "list" ? "active" : ""}
                  onClick={() => {
                    setView("list");
                    setPage(1);
                  }}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                >
                  <ListIcon />
                </button>
              </div>
            </div>

            <div className="fcl-hv-chips-row">
              <div className="fcl-hv-chips">
                <button
                  type="button"
                  className={`chip ${selectedTournament === "All" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedTournament("All");
                    setPage(1);
                  }}
                >
                  All
                </button>

                {tournaments.map((tournament) => (
                  <button
                    key={tournament}
                    type="button"
                    className={`chip ${
                      selectedTournament === tournament ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedTournament(tournament);
                      setPage(1);
                    }}
                  >
                    {tournament}
                  </button>
                ))}

                {filtersActive && (
                  <button
                    type="button"
                    className="chip reset"
                    onClick={resetFilters}
                  >
                    <CloseIcon size={12} />
                    Reset
                  </button>
                )}
              </div>

              <span className="fcl-hv-count">
                {loading ? "…" : filteredMatches.length} MATCHES
              </span>
            </div>
          </div>

          {/* ---------- ERROR ---------- */}

          {error && !loading && (
            <div className="fcl-hv-error" role="alert">
              <div>
                <strong>তথ্য লোড করা যায়নি</strong>
                <p>{error}</p>
              </div>

              <button type="button" onClick={() => setRetryKey((p) => p + 1)}>
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {/* ---------- RESULTS ---------- */}

          <div className="fcl-hv-results">
            {loading ? (
              <LoadingCards count={isMobile ? 4 : 6} />
            ) : filteredMatches.length === 0 ? (
              <EmptyState
                title={
                  error
                    ? "ম্যাচ লোড করা যায়নি"
                    : "কোনো হাই ভোল্টেজ ম্যাচ পাওয়া যায়নি"
                }
                description={
                  error
                    ? "আবার চেষ্টা করুন অথবা কিছুক্ষণ পরে ফিরে আসুন।"
                    : "আপনার অনুসন্ধানের সঙ্গে কোনো ম্যাচ মেলেনি। অন্য শব্দ বা টুর্নামেন্ট নির্বাচন করুন।"
                }
                onReset={error ? undefined : resetFilters}
              />
            ) : (
              <>
                <div
                  key={`${sortBy}-${selectedTournament}-${currentPage}-${view}`}
                  className={`fcl-hv-grid ${view === "list" ? "list" : ""}`}
                >
                  {visibleMatches.map((match, index) => (
                    <MatchCard
                      key={match.key}
                      match={match}
                      index={index}
                      onOpen={() => setSelectedMatch(match)}
                    />
                  ))}
                </div>

                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  from={rangeFrom}
                  to={rangeTo}
                  count={filteredMatches.length}
                  onChange={goToPage}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}

      <footer className="fcl-hv-footer">
        <div className="fcl-hv-container">
          <div className="fcl-hv-footer-inner">
            <span>
              © {new Date().getFullYear()} <strong>FCL</strong> · High Voltage
              Matches Archive
            </span>

            <nav>
              <Link href="/">Home</Link>
              <Link href="/records">Records</Link>
              <Link href="/rankings">Rankings</Link>
            </nav>
          </div>
        </div>
      </footer>

      {/* ================= BACK TO TOP ================= */}

      <button
        type="button"
        className={`fcl-hv-top ${showTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <ArrowIcon direction="up" />
      </button>

      {/* ================= MODAL ================= */}

      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          position={Math.max(selectedIndex, 0) + 1}
          total={navList.length}
          onClose={closeModal}
          onPrev={selectedIndex > 0 ? goPrev : undefined}
          onNext={
            selectedIndex >= 0 && selectedIndex < navList.length - 1
              ? goNext
              : undefined
          }
        />
      )}

      <style jsx global>
        {HIGH_VOLTAGE_STYLES}
      </style>
    </div>
  );
}

/* =========================================================
   DESIGN SYSTEM
   ========================================================= */

const HIGH_VOLTAGE_STYLES = `

/* ---------- ROOT ---------- */

.fcl-hv-page {
  --hv-sticky-top: 0px;
  --hv-grad: linear-gradient(135deg, #7c3aed, #1877F2);
  min-height: 100vh;
  background: var(--hv-bg);
  color: var(--hv-text);
  font-family: inherit;
  overflow-x: clip;
  transition: background-color .25s ease, color .25s ease;
}

.fcl-hv-page *,
.fcl-hv-page *::before,
.fcl-hv-page *::after {
  box-sizing: border-box;
}

.fcl-hv-page button {
  cursor: pointer;
  font-family: inherit;
}

.fcl-hv-page button:disabled {
  cursor: not-allowed;
}

.fcl-hv-page button,
.fcl-hv-page a {
  -webkit-tap-highlight-color: transparent;
}

.fcl-hv-page button:focus-visible,
.fcl-hv-page a:focus-visible,
.fcl-hv-page input:focus-visible {
  outline: 2px solid var(--hv-purple);
  outline-offset: 2px;
}

.fcl-hv-page ::selection {
  background: rgba(139,92,246,.28);
}

.fcl-hv-container {
  width: min(100% - 40px, 1180px);
  margin-inline: auto;
}

.fcl-hv-eyebrow {
  display: inline-block;
  color: var(--hv-purple);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .18em;
  text-transform: uppercase;
}

/* ---------- HERO ---------- */

.fcl-hv-hero {
  position: relative;
  overflow: hidden;
  background: var(--hv-secondary);
  border-bottom: 1px solid var(--hv-border);
}

.fcl-hv-hero-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .5;
  background-image:
    linear-gradient(rgba(100,116,139,.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100,116,139,.09) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 90% at 50% 20%, #000 25%, transparent 95%);
  -webkit-mask-image: radial-gradient(ellipse 80% 90% at 50% 20%, #000 25%, transparent 95%);
}

.fcl-hv-hero-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(110px);
}

.fcl-hv-hero-glow.one {
  width: 520px;
  height: 520px;
  right: -190px;
  top: -270px;
  background: rgba(24,119,242,.16);
}

.fcl-hv-hero-glow.two {
  width: 460px;
  height: 460px;
  left: -170px;
  bottom: -250px;
  background: rgba(139,92,246,.13);
}

/* floating blurred squares */

.fcl-hv-sq {
  position: absolute;
  pointer-events: none;
  border-radius: 24px;
  border: 1px solid rgba(139,92,246,.25);
  background: linear-gradient(135deg, rgba(139,92,246,.22), rgba(24,119,242,.06));
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: fclHvFloat 9s ease-in-out infinite;
}

.fcl-hv-sq.a {
  width: 96px;
  height: 96px;
  right: 7%;
  top: 14%;
  --r: 14deg;
  transform: rotate(14deg);
}

.fcl-hv-sq.b {
  width: 58px;
  height: 58px;
  left: 4%;
  bottom: 24%;
  --r: -12deg;
  transform: rotate(-12deg);
  animation-delay: -3s;
  opacity: .8;
}

.fcl-hv-sq.c {
  width: 140px;
  height: 140px;
  right: 30%;
  bottom: -70px;
  --r: 22deg;
  transform: rotate(22deg);
  animation-delay: -6s;
  opacity: .55;
}

.fcl-hv-hero-inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  align-items: center;
  gap: 44px;
  padding: 44px 0 26px;
}

.fcl-hv-hero-content {
  position: relative;
  z-index: 1;
  animation: fclHvRise .7s cubic-bezier(.2,.8,.2,1) both;
}

.fcl-hv-hero-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--hv-purple);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .17em;
}

.fcl-hv-hero-label > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--hv-purple);
  box-shadow: 0 0 0 5px var(--hv-accent-soft);
  animation: fclHvPulse 2s ease-in-out infinite;
}

.fcl-hv-hero-content h1 {
  margin: 14px 0 0;
  color: var(--hv-heading);
  font-size: clamp(30px, 4.4vw, 54px);
  line-height: 1.15;
  font-weight: 950;
  letter-spacing: -.05em;
}

.fcl-hv-hero-content h1 em {
  display: inline-block;
  font-style: normal;
  background: linear-gradient(100deg, #8b5cf6, #6366f1 35%, #1877F2 65%, #8b5cf6);
  background-size: 220% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: fclHvShimmer 6s linear infinite;
}

.fcl-hv-hero-content > p {
  max-width: 500px;
  margin: 14px 0 0;
  color: var(--hv-muted);
  font-size: 13.5px;
  line-height: 1.9;
}

.fcl-hv-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.fcl-hv-primary-button,
.fcl-hv-outline-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 10px 18px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 900;
  transition: all .2s ease;
}

.fcl-hv-primary-button {
  color: white;
  border: 0;
  background: var(--hv-grad);
  box-shadow: 0 8px 22px rgba(124,58,237,.28);
}

.fcl-hv-primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(124,58,237,.38);
}

.fcl-hv-primary-button:active,
.fcl-hv-outline-button:active {
  transform: scale(.97);
}

.fcl-hv-outline-button {
  color: var(--hv-heading);
  background: var(--hv-glass);
  border: 1px solid var(--hv-border);
}

.fcl-hv-outline-button:hover {
  color: var(--hv-purple);
  border-color: var(--hv-purple);
}

/* ---------- HERO STATS ---------- */

.fcl-hv-hero-stats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 26px;
  border: 1px solid var(--hv-border);
  border-radius: 16px;
  background: var(--hv-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: fclHvRise .7s .15s cubic-bezier(.2,.8,.2,1) both;
}

.fcl-hv-hero-stat {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 14px 20px;
}

.fcl-hv-hero-stat + .fcl-hv-hero-stat {
  border-left: 1px solid var(--hv-border);
}

.fcl-hv-hero-stat strong {
  color: var(--hv-heading);
  font-size: 24px;
  font-weight: 950;
  letter-spacing: -.04em;
  font-variant-numeric: tabular-nums;
}

.fcl-hv-hero-stat span {
  color: var(--hv-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .12em;
}

/* ---------- SPOTLIGHT ---------- */

.fcl-hv-spot {
  position: relative;
  z-index: 1;
  padding: 16px;
  border: 1px solid var(--hv-border);
  border-radius: 20px;
  background: var(--hv-glass);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--hv-shadow);
  animation: fclHvRise .7s .1s cubic-bezier(.2,.8,.2,1) both;
}

.fcl-hv-spot.loading {
  min-height: 150px;
}

.fcl-hv-spot-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.fcl-hv-live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--hv-purple);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .14em;
}

.fcl-hv-live i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34,197,94,.55);
  animation: fclHvLive 1.8s infinite;
}

.fcl-hv-spot-date {
  color: var(--hv-muted);
  font-size: 9.5px;
  font-weight: 900;
  letter-spacing: .06em;
}

.fcl-hv-spot-body {
  display: flex;
  align-items: center;
  gap: 13px;
  width: 100%;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid var(--hv-border);
  border-radius: 14px;
  background: var(--hv-card);
  color: inherit;
  text-align: left;
  animation: fclHvSwap .45s cubic-bezier(.2,.8,.2,1) both;
  transition: border-color .2s ease, transform .2s ease;
}

.fcl-hv-spot-body:hover {
  border-color: rgba(139,92,246,.55);
  transform: translateY(-2px);
}

.fcl-hv-spot-body:active {
  transform: scale(.98);
}

.fcl-hv-spot-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.fcl-hv-spot-text strong {
  color: var(--hv-heading);
  font-size: 14px;
  font-weight: 950;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fcl-hv-spot-text em {
  color: var(--hv-purple);
  font-style: normal;
  font-size: 11.5px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fcl-hv-spot-text small {
  color: var(--hv-muted);
  font-size: 10.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fcl-hv-spot-go {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--hv-accent-soft);
  color: var(--hv-purple);
}

.fcl-hv-spot-dots {
  display: flex;
  gap: 6px;
  margin-top: 14px;
}

.fcl-hv-spot-dots button {
  position: relative;
  flex: 1;
  height: 4px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: var(--hv-border);
  overflow: hidden;
}

.fcl-hv-spot-dots button span {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--hv-grad);
  transform-origin: left;
  animation: fclHvDot ${SPOTLIGHT_INTERVAL}ms linear both;
}

.fcl-hv-spot.paused .fcl-hv-spot-dots button span {
  animation-play-state: paused;
}

/* ---------- THUMB ---------- */

.fcl-hv-thumb {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid rgba(139,92,246,.28);
  background: var(--hv-accent-soft);
  color: var(--hv-purple);
}

.fcl-hv-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ---------- COLLECTION ---------- */

.fcl-hv-collection {
  padding: 22px 0 36px;
  background: var(--hv-bg);
  scroll-margin-top: 8px;
}

/* ---------- TOOLBAR ---------- */

.fcl-hv-toolbar {
  position: sticky;
  top: calc(var(--hv-sticky-top) + 10px);
  z-index: 20;
  padding: 10px;
  border: 1px solid var(--hv-border);
  border-radius: 18px;
  background: var(--hv-glass);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  box-shadow: var(--hv-shadow);
}

.fcl-hv-toolbar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fcl-hv-search {
  position: relative;
  flex: 1;
  min-width: 0;
}

.fcl-hv-search > svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--hv-muted);
  pointer-events: none;
}

.fcl-hv-search input {
  display: block;
  width: 100%;
  height: 44px;
  padding: 0 44px 0 42px;
  border: 1px solid var(--hv-border);
  border-radius: 12px;
  background: var(--hv-secondary);
  color: var(--hv-heading);
  font-family: inherit;
  font-size: 12.5px;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.fcl-hv-search input::placeholder {
  color: var(--hv-subtle);
}

.fcl-hv-search input:focus {
  outline: none;
  border-color: var(--hv-purple);
  box-shadow: 0 0 0 4px var(--hv-accent-soft);
}

.fcl-hv-search input::-webkit-search-cancel-button {
  display: none;
}

.fcl-hv-search kbd {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 1px solid var(--hv-border);
  border-radius: 6px;
  color: var(--hv-muted);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  pointer-events: none;
}

.fcl-hv-search .clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: var(--hv-raised);
  color: var(--hv-muted);
}

.fcl-hv-search .clear:hover {
  color: white;
  background: #ef4444;
}

/* sort */

.fcl-hv-sort {
  position: relative;
  flex-shrink: 0;
}

.fcl-hv-sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 44px;
  padding: 0 13px;
  border: 1px solid var(--hv-border);
  border-radius: 12px;
  background: var(--hv-secondary);
  color: var(--hv-heading);
  font-size: 12px;
  font-weight: 850;
  transition: all .2s ease;
}

.fcl-hv-sort-btn:hover,
.fcl-hv-sort-btn.open {
  border-color: var(--hv-purple);
  color: var(--hv-purple);
}

.fcl-hv-sort-btn .chev {
  display: inline-flex;
  transition: transform .2s ease;
}

.fcl-hv-sort-btn.open .chev {
  transform: rotate(180deg);
}

.fcl-hv-sort-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 40;
  min-width: 210px;
  padding: 6px;
  border: 1px solid var(--hv-border);
  border-radius: 14px;
  background: var(--hv-card);
  box-shadow: 0 22px 60px rgba(0,0,0,.25);
  transform-origin: top right;
  animation: fclHvMenu .18s ease both;
}

.fcl-hv-sort-menu button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--hv-text);
  font-size: 12px;
  font-weight: 800;
  text-align: left;
}

.fcl-hv-sort-menu button:hover {
  background: var(--hv-raised);
}

.fcl-hv-sort-menu button.selected {
  color: var(--hv-purple);
  background: var(--hv-accent-soft);
}

/* view toggle */

.fcl-hv-view-toggle {
  display: inline-flex;
  flex-shrink: 0;
  padding: 3px;
  border: 1px solid var(--hv-border);
  border-radius: 12px;
  background: var(--hv-secondary);
}

.fcl-hv-view-toggle button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--hv-muted);
  transition: all .2s ease;
}

.fcl-hv-view-toggle button.active {
  background: var(--hv-grad);
  color: white;
  box-shadow: 0 5px 14px rgba(124,58,237,.35);
}

/* chips */

.fcl-hv-chips-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.fcl-hv-chips {
  display: flex;
  flex: 1;
  gap: 7px;
  min-width: 0;
  overflow-x: auto;
  padding-right: 18px;
  scrollbar-width: none;
  mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent);
  -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent);
}

.fcl-hv-chips::-webkit-scrollbar {
  display: none;
}

.fcl-hv-chips .chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  max-width: 220px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--hv-border);
  border-radius: 999px;
  background: var(--hv-secondary);
  color: var(--hv-muted);
  font-size: 11.5px;
  font-weight: 850;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all .2s ease;
}

.fcl-hv-chips .chip:hover {
  color: var(--hv-heading);
  border-color: var(--hv-purple);
}

.fcl-hv-chips .chip:active {
  transform: scale(.95);
}

.fcl-hv-chips .chip.active {
  border-color: transparent;
  background: var(--hv-grad);
  color: white;
  box-shadow: 0 6px 16px rgba(124,58,237,.32);
}

.fcl-hv-chips .chip.reset {
  border-color: rgba(239,68,68,.3);
  background: rgba(239,68,68,.08);
  color: #ef4444;
  animation: fclHvPop .25s ease both;
}

.fcl-hv-count {
  flex-shrink: 0;
  padding: 7px 11px;
  border: 1px solid var(--hv-border);
  border-radius: 9px;
  background: var(--hv-secondary);
  color: var(--hv-muted);
  font-size: 9.5px;
  font-weight: 900;
  letter-spacing: .09em;
}

/* ---------- GRID & CARDS ---------- */

.fcl-hv-results {
  margin-top: 16px;
}

.fcl-hv-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.fcl-hv-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  min-width: 0;
  padding: 18px;
  overflow: hidden;
  text-align: left;
  border: 1px solid var(--hv-border);
  border-radius: 18px;
  background: var(--hv-card);
  color: var(--hv-text);
  box-shadow: var(--hv-shadow);
  animation: fclHvCardIn .55s cubic-bezier(.2,.8,.2,1) both;
  animation-delay: calc(var(--i, 0) * 45ms);
  transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
}

.fcl-hv-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #7c3aed, #1877F2, #22d3ee);
  opacity: 0;
  transition: opacity .25s ease;
}

.fcl-hv-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), rgba(139,92,246,.16), transparent 65%);
  transition: opacity .25s ease;
}

.fcl-hv-card:hover {
  transform: translateY(-4px);
  border-color: rgba(139,92,246,.5);
  box-shadow: 0 22px 50px rgba(124,58,237,.14);
}

.fcl-hv-card:hover::before,
.fcl-hv-card:hover::after {
  opacity: 1;
}

.fcl-hv-card:active {
  transform: scale(.985);
}

.fcl-hv-card > * {
  position: relative;
  z-index: 1;
}

.fcl-hv-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.fcl-hv-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(139,92,246,.3);
  border-radius: 8px;
  background: var(--hv-accent-soft);
  color: var(--hv-purple);
  font-size: 9.5px;
  font-weight: 950;
  letter-spacing: .04em;
}

.fcl-hv-badge svg {
  flex-shrink: 0;
}

.fcl-hv-badge b {
  font-weight: 950;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fcl-hv-card-arrow {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--hv-accent-soft);
  color: var(--hv-purple);
  transition: all .25s ease;
}

.fcl-hv-card:hover .fcl-hv-card-arrow {
  background: var(--hv-grad);
  color: white;
  transform: rotate(45deg);
}

.fcl-hv-card-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.fcl-hv-card-main > div {
  min-width: 0;
}

.fcl-hv-card-main h3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: 0;
  color: var(--hv-heading);
  font-size: 14.5px;
  font-weight: 950;
  line-height: 1.5;
  transition: color .2s ease;
}

.fcl-hv-card:hover .fcl-hv-card-main h3 {
  color: var(--hv-purple);
}

.fcl-hv-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
  color: var(--hv-muted);
  font-size: 10.5px;
  font-weight: 800;
}

.fcl-hv-date.big {
  margin-top: 10px;
  font-size: 11.5px;
}

.fcl-hv-preview {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: 0;
  color: var(--hv-text);
  font-size: 11.5px;
  line-height: 1.85;
}

/* list view */

.fcl-hv-grid.list {
  grid-template-columns: 1fr;
  gap: 10px;
}

.fcl-hv-grid.list .fcl-hv-card {
  flex-direction: row;
  align-items: center;
  gap: 18px;
  padding: 12px 16px;
}

.fcl-hv-grid.list .fcl-hv-card-top {
  display: contents;
}

.fcl-hv-grid.list .fcl-hv-card-main {
  order: 1;
  flex: 1;
}

.fcl-hv-grid.list .fcl-hv-card-main h3 {
  -webkit-line-clamp: 1;
}

.fcl-hv-grid.list .fcl-hv-badge {
  order: 2;
  max-width: 240px;
  flex-shrink: 1;
}

.fcl-hv-grid.list .fcl-hv-card-arrow {
  order: 3;
}

.fcl-hv-grid.list .fcl-hv-preview {
  display: none;
}

/* ---------- PAGER ---------- */

.fcl-hv-pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
}

.fcl-hv-pager-meta {
  color: var(--hv-muted);
  font-size: 11px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.fcl-hv-pager-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fcl-hv-pager-controls button {
  display: grid;
  place-items: center;
  min-width: 38px;
  height: 38px;
  padding: 0 6px;
  border: 1px solid var(--hv-border);
  border-radius: 11px;
  background: var(--hv-card);
  color: var(--hv-heading);
  font-size: 12px;
  font-weight: 900;
  transition: all .2s ease;
}

.fcl-hv-pager-controls button:hover:not(:disabled):not(.active) {
  border-color: var(--hv-purple);
  color: var(--hv-purple);
}

.fcl-hv-pager-controls button:active:not(:disabled) {
  transform: scale(.93);
}

.fcl-hv-pager-controls button:disabled {
  opacity: .35;
}

.fcl-hv-pager-controls button.active {
  border-color: transparent;
  background: var(--hv-grad);
  color: white;
  box-shadow: 0 6px 16px rgba(124,58,237,.32);
}

.fcl-hv-pager-nums {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fcl-hv-pager-nums .gap {
  padding: 0 4px;
  color: var(--hv-subtle);
}

.fcl-hv-pager-mobile {
  display: none;
  min-width: 64px;
  text-align: center;
  color: var(--hv-heading);
  font-size: 12px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

/* ---------- MODAL ---------- */

.fcl-hv-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(2,6,23,.72);
  backdrop-filter: blur(9px);
  -webkit-backdrop-filter: blur(9px);
  animation: fclHvFade .2s ease both;
}

.fcl-hv-modal {
  display: flex;
  flex-direction: column;
  width: min(100%, 720px);
  max-height: min(88dvh, 820px);
  overflow: hidden;
  border: 1px solid var(--hv-border);
  border-radius: 22px;
  background: var(--hv-card);
  box-shadow: 0 35px 110px rgba(0,0,0,.4);
  animation: fclHvModalEnter .32s cubic-bezier(.2,.9,.25,1.05) both;
}

.fcl-hv-sheet-handle {
  display: none;
  width: 40px;
  height: 4px;
  margin: 8px auto 0;
  border-radius: 4px;
  background: var(--hv-border);
}

.fcl-hv-modal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 12px 16px 12px 20px;
  background: var(--hv-secondary);
}

.fcl-hv-modal-meta {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.fcl-hv-badge.solid {
  max-width: 100%;
}

.fcl-hv-modal-pos {
  flex-shrink: 0;
  color: var(--hv-subtle);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .08em;
  font-variant-numeric: tabular-nums;
}

.fcl-hv-modal-close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 1px solid var(--hv-border);
  border-radius: 11px;
  background: var(--hv-card);
  color: var(--hv-heading);
  transition: all .2s ease;
}

.fcl-hv-modal-close:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
  transform: rotate(90deg);
}

.fcl-hv-modal-progress {
  height: 2px;
  background: var(--hv-border);
}

.fcl-hv-modal-progress span {
  display: block;
  height: 100%;
  background: var(--hv-grad);
  transform-origin: left;
  transform: scaleX(0);
}

.fcl-hv-modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 22px 24px;
  scrollbar-width: thin;
  scrollbar-color: var(--hv-border) transparent;
}

.fcl-hv-modal-content {
  animation: fclHvSwap .4s cubic-bezier(.2,.8,.2,1) both;
}

.fcl-hv-banner {
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid var(--hv-border);
  border-radius: 14px;
  background: var(--hv-secondary);
}

.fcl-hv-banner img {
  display: block;
  width: 100%;
  max-height: 240px;
  object-fit: cover;
}

.fcl-hv-modal-content h2 {
  margin: 10px 0 0;
  color: var(--hv-heading);
  font-size: clamp(21px, 3vw, 29px);
  font-weight: 950;
  letter-spacing: -.03em;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.fcl-hv-modal-story {
  margin-top: 16px;
  border: 1px solid var(--hv-border);
  border-radius: 14px;
  background: var(--hv-secondary);
  overflow: hidden;
}

.fcl-hv-story-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--hv-border);
}

.fcl-hv-story-heading span {
  color: var(--hv-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .1em;
}

.fcl-hv-story-content {
  padding: 18px 20px;
  color: var(--hv-text);
  font-size: 13px;
  line-height: 2.05;
  overflow-wrap: anywhere;
}

.fcl-hv-paragraph {
  margin: 0;
  line-height: inherit;
}

.fcl-hv-paragraph + .fcl-hv-paragraph {
  margin-top: 10px;
}

.fcl-hv-paragraph-gap {
  height: 10px;
}

.fcl-hv-dialogue {
  padding: 8px 12px;
  border-left: 2px solid rgba(139,92,246,.45);
  border-radius: 0 8px 8px 0;
  background: var(--hv-accent-soft);
}

.fcl-hv-speaker {
  color: var(--hv-purple);
  font-weight: 900;
}

.fcl-hv-highlight {
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(245,158,11,.1);
  color: #d97706;
  font-weight: 850;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.fcl-hv-dark .fcl-hv-highlight {
  color: #fbbf24;
}

.fcl-hv-highlight.strong {
  background: rgba(245,158,11,.16);
  font-weight: 950;
}

.fcl-hv-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 12px 20px;
  border-top: 1px solid var(--hv-border);
  background: var(--hv-secondary);
}

.fcl-hv-modal-nav {
  display: flex;
  gap: 8px;
}

.fcl-hv-modal-nav button {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--hv-border);
  border-radius: 12px;
  background: var(--hv-card);
  color: var(--hv-heading);
  transition: all .2s ease;
}

.fcl-hv-modal-nav button:hover:not(:disabled) {
  border-color: var(--hv-purple);
  color: var(--hv-purple);
}

.fcl-hv-modal-nav button:active:not(:disabled) {
  transform: scale(.92);
}

.fcl-hv-modal-nav button:disabled {
  opacity: .35;
}

.fcl-hv-facebook-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1877F2, #2f8bff);
  color: white;
  font-size: 12px;
  font-weight: 900;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(24,119,242,.28);
  transition: all .2s ease;
}

.fcl-hv-facebook-button:hover {
  transform: translateY(-2px);
}

.fcl-hv-facebook-button:active {
  transform: scale(.97);
}

.fcl-hv-no-link {
  color: var(--hv-muted);
  font-size: 11px;
}

/* ---------- ERROR / EMPTY / SKELETON ---------- */

.fcl-hv-error {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 14px;
  padding: 14px 18px;
  border: 1px solid rgba(239,68,68,.25);
  border-radius: 14px;
  background: rgba(239,68,68,.06);
}

.fcl-hv-error strong {
  color: #ef4444;
  font-size: 13px;
  font-weight: 900;
}

.fcl-hv-error p {
  margin: 4px 0 0;
  color: var(--hv-text);
  font-size: 12px;
}

.fcl-hv-error button {
  flex-shrink: 0;
  padding: 9px 14px;
  border: 1px solid rgba(239,68,68,.28);
  border-radius: 10px;
  background: var(--hv-card);
  color: #ef4444;
  font-size: 11px;
  font-weight: 900;
}

.fcl-hv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  border: 1px dashed var(--hv-border);
  border-radius: 18px;
  background: var(--hv-secondary);
  text-align: center;
  animation: fclHvRise .4s ease both;
}

.fcl-hv-empty-mark {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  border: 1px solid rgba(139,92,246,.28);
  background: var(--hv-accent-soft);
  color: var(--hv-purple);
}

.fcl-hv-empty h3 {
  margin: 16px 0 0;
  color: var(--hv-heading);
  font-size: 17px;
  font-weight: 950;
}

.fcl-hv-empty p {
  max-width: 420px;
  margin: 8px 0 18px;
  color: var(--hv-muted);
  font-size: 12.5px;
  line-height: 1.8;
}

.fcl-hv-skeleton-card {
  min-height: 170px;
  padding: 18px;
  border: 1px solid var(--hv-border);
  border-radius: 18px;
  background: var(--hv-card);
}

.fcl-hv-skeleton {
  border-radius: 8px;
  background: linear-gradient(90deg, var(--hv-secondary) 20%, var(--hv-raised) 50%, var(--hv-secondary) 80%);
  background-size: 200% 100%;
  animation: fclHvSkeleton 1.5s ease infinite;
}

.fcl-hv-skeleton.badge {
  width: 110px;
  height: 24px;
}

.fcl-hv-skeleton.name {
  width: 70%;
  height: 26px;
  margin-top: 20px;
}

.fcl-hv-skeleton.line {
  width: 95%;
  height: 12px;
  margin-top: 16px;
}

.fcl-hv-skeleton.line.short {
  width: 65%;
}

/* ---------- FOOTER ---------- */

.fcl-hv-footer {
  border-top: 1px solid var(--hv-border);
  background: var(--hv-secondary);
}

.fcl-hv-footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  color: var(--hv-muted);
  font-size: 11px;
}

.fcl-hv-footer-inner strong {
  color: var(--hv-heading);
}

.fcl-hv-footer-inner nav {
  display: flex;
  gap: 18px;
}

.fcl-hv-footer-inner a {
  color: var(--hv-purple);
  font-weight: 900;
  text-decoration: none;
}

.fcl-hv-footer-inner a:hover {
  text-decoration: underline;
}

/* ---------- BACK TO TOP ---------- */

.fcl-hv-top {
  position: fixed;
  right: 16px;
  bottom: calc(18px + env(safe-area-inset-bottom));
  z-index: 50;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 14px;
  background: var(--hv-grad);
  color: white;
  box-shadow: 0 12px 28px rgba(124,58,237,.42);
  opacity: 0;
  pointer-events: none;
  transform: translateY(14px) scale(.9);
  transition: all .3s ease;
}

.fcl-hv-top.visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}

.fcl-hv-top:active {
  transform: scale(.92);
}

/* ---------- KEYFRAMES ---------- */

@keyframes fclHvFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fclHvModalEnter {
  from { opacity: 0; transform: translateY(18px) scale(.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fclHvSheetUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes fclHvRise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fclHvCardIn {
  from { opacity: 0; transform: translateY(18px) scale(.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fclHvSwap {
  from { opacity: 0; transform: translateX(14px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fclHvMenu {
  from { opacity: 0; transform: translateY(-6px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fclHvPop {
  from { opacity: 0; transform: scale(.7); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fclHvShimmer {
  to { background-position: 220% 0; }
}

@keyframes fclHvFloat {
  0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
  50% { transform: translateY(-16px) rotate(calc(var(--r, 0deg) + 8deg)); }
}

@keyframes fclHvPulse {
  0%, 100% { box-shadow: 0 0 0 4px var(--hv-accent-soft); }
  50% { box-shadow: 0 0 0 8px rgba(139,92,246,0); }
}

@keyframes fclHvLive {
  0% { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
  100% { box-shadow: 0 0 0 9px rgba(34,197,94,0); }
}

@keyframes fclHvDot {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes fclHvSkeleton {
  to { background-position-x: -200%; }
}

/* ---------- RESPONSIVE ---------- */

@media (hover: none) {
  .fcl-hv-card::after,
  .fcl-hv-card::before {
    display: none;
  }

  .fcl-hv-card:hover {
    transform: none;
    box-shadow: var(--hv-shadow);
    border-color: var(--hv-border);
  }

  .fcl-hv-card:active {
    transform: scale(.975);
  }
}

@media (max-width: 1050px) {
  .fcl-hv-hero-inner {
    grid-template-columns: minmax(0, 1fr) 330px;
    gap: 28px;
  }

  .fcl-hv-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fcl-hv-grid.list .fcl-hv-badge {
    max-width: 180px;
  }

  .fcl-hv-sort-btn .label {
    display: none;
  }
}

@media (max-width: 760px) {
  .fcl-hv-container {
    width: min(100% - 24px, 1180px);
  }

  /* hero (app header) */

  .fcl-hv-hero-inner {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 26px 0 14px;
  }

  .fcl-hv-hero-content h1 {
    margin-top: 10px;
    font-size: clamp(28px, 8.6vw, 38px);
  }

  .fcl-hv-hero-content > p {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.8;
  }

  .fcl-hv-hero-actions {
    margin-top: 16px;
  }

  .fcl-hv-hero-actions .fcl-hv-primary-button,
  .fcl-hv-hero-actions .fcl-hv-outline-button {
    flex: 1;
    min-height: 42px;
    padding: 9px 12px;
  }

  .fcl-hv-sq.a {
    width: 60px;
    height: 60px;
    top: 8%;
    right: 5%;
  }

  .fcl-hv-sq.c {
    display: none;
  }

  /* compact spotlight */

  .fcl-hv-spot {
    padding: 12px;
    border-radius: 18px;
  }

  .fcl-hv-spot-body {
    margin-top: 10px;
    padding: 10px;
  }

  .fcl-hv-spot-dots {
    margin-top: 10px;
  }

  /* stats as compact tiles */

  .fcl-hv-hero-stats {
    margin-bottom: 16px;
    border-radius: 14px;
  }

  .fcl-hv-hero-stat {
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 11px 4px;
    text-align: center;
  }

  .fcl-hv-hero-stat strong {
    font-size: 19px;
  }

  .fcl-hv-hero-stat span {
    font-size: 7.5px;
    letter-spacing: .06em;
  }

  /* collection */

  .fcl-hv-collection {
    padding: 14px 0 28px;
  }

  .fcl-hv-toolbar {
    top: calc(var(--hv-sticky-top) + 6px);
    padding: 8px;
    border-radius: 16px;
  }

  .fcl-hv-search input {
    height: 42px;
    padding-right: 40px;
    font-size: 12px;
  }

  .fcl-hv-search kbd {
    display: none;
  }

  .fcl-hv-sort-btn {
    width: 42px;
    height: 42px;
    justify-content: center;
    padding: 0;
  }

  .fcl-hv-sort-btn .label,
  .fcl-hv-sort-btn .chev {
    display: none;
  }

  .fcl-hv-sort-menu {
    min-width: 200px;
  }

  .fcl-hv-view-toggle button {
    width: 34px;
    height: 34px;
  }

  .fcl-hv-chips-row {
    margin-top: 8px;
  }

  .fcl-hv-count {
    display: none;
  }

  .fcl-hv-chips {
    padding-right: 10px;
  }

  .fcl-hv-results {
    margin-top: 12px;
  }

  .fcl-hv-grid {
    grid-template-columns: 1fr;
    gap: 11px;
  }

  .fcl-hv-card {
    gap: 12px;
    padding: 15px;
    border-radius: 17px;
  }

  .fcl-hv-card-main h3 {
    font-size: 14px;
  }

  /* mobile list view */

  .fcl-hv-grid.list {
    gap: 8px;
  }

  .fcl-hv-grid.list .fcl-hv-card {
    gap: 12px;
    padding: 11px 14px;
  }

  .fcl-hv-grid.list .fcl-hv-badge {
    display: none;
  }

  .fcl-hv-grid.list .fcl-hv-card-arrow {
    width: 28px;
    height: 28px;
  }

  /* pager */

  .fcl-hv-pager {
    justify-content: center;
    margin-top: 14px;
  }

  .fcl-hv-pager-meta,
  .fcl-hv-pager-nums {
    display: none;
  }

  .fcl-hv-pager-mobile {
    display: block;
  }

  .fcl-hv-pager-controls {
    gap: 10px;
    padding: 6px;
    border: 1px solid var(--hv-border);
    border-radius: 16px;
    background: var(--hv-glass);
  }

  .fcl-hv-pager-controls button {
    min-width: 44px;
    height: 44px;
    border-radius: 12px;
  }

  /* bottom sheet modal */

  .fcl-hv-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .fcl-hv-modal {
    width: 100%;
    max-height: 92dvh;
    border-radius: 24px 24px 0 0;
    border-bottom: 0;
    animation: fclHvSheetUp .38s cubic-bezier(.2,.9,.25,1) both;
  }

  .fcl-hv-sheet-handle {
    display: block;
  }

  .fcl-hv-modal-top {
    padding: 10px 14px 10px 16px;
  }

  .fcl-hv-modal-body {
    padding: 18px 16px;
  }

  .fcl-hv-modal-content h2 {
    font-size: 21px;
  }

  .fcl-hv-story-content {
    padding: 15px 16px;
    font-size: 12.5px;
    line-height: 2;
  }

  .fcl-hv-modal-footer {
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  }

  .fcl-hv-facebook-button {
    flex: 1;
  }

  .fcl-hv-error {
    flex-direction: column;
    align-items: stretch;
  }

  .fcl-hv-error button {
    width: fit-content;
  }

  .fcl-hv-footer-inner {
    flex-direction: column;
    gap: 8px;
    padding: 14px 0 18px;
    text-align: center;
  }

  .fcl-hv-top {
    right: 12px;
    bottom: calc(14px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 380px) {
  .fcl-hv-hero-stat span {
    font-size: 7px;
  }

  .fcl-hv-hero-stat strong {
    font-size: 17px;
  }
}

/* ---------- REDUCED MOTION ---------- */

@media (prefers-reduced-motion: reduce) {
  .fcl-hv-page *,
  .fcl-hv-page *::before,
  .fcl-hv-page *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}

`;
