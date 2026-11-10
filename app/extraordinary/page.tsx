"use client";

import {
  Suspense,
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
import { useSearchParams } from "next/navigation";

/* =========================================================
   FCL EXTRAORDINARY PERFORMANCES
   Official Hall of Heroics — Compact Premium Motion Edition
   ========================================================= */

interface ExtraordinaryRecord {
  part?: string | number;
  Part?: string | number;

  matchYear?: string | number;
  "Match Year"?: string | number;

  playerName: string;
  performanceTitle: string;
  tournamentMatch: string;
  description: string;
  facebookLink: string;
  photo: string;
}

type SortBy = "part-asc" | "part-desc" | "year-desc" | "year-asc";
type ViewMode = "grid" | "list";

type IndexedPerformance = {
  item: ExtraordinaryRecord;
  originalIndex: number;
  part: string;
  year: string;
  key: string;
};

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "part-asc", label: "Part: 1 → Latest" },
  { value: "part-desc", label: "Part: Latest → 1" },
  { value: "year-desc", label: "Year: Newest" },
  { value: "year-asc", label: "Year: Oldest" },
];

const SPOTLIGHT_INTERVAL = 5500;

/* =========================================================
   DATA HELPERS
   ========================================================= */

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function partOf(item: ExtraordinaryRecord, fallback: number): string {
  const raw = item.part ?? item.Part ?? "";
  const value = normalize(raw);
  return value && value !== "0" ? value : String(fallback);
}

function yearOf(item: ExtraordinaryRecord): string {
  return normalize(item.matchYear ?? item["Match Year"] ?? "");
}

function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getPhotoUrl(photoVal: string): string {
  const clean = normalize(photoVal);
  if (!clean) return "";
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
    return clean;
  }
  return `/players/${encodeURIComponent(clean)}`;
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
        <strong key={index} className="fcl-extra-highlight strong">
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
        <strong key={index} className="fcl-extra-highlight">
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
          <div
            key={index}
            className="fcl-extra-paragraph-gap"
            aria-hidden="true"
          />
        );
      }

      const dialogueMatch = trimmed.match(/^([^:\n]{1,70}):\s+(.+)$/);

      if (dialogueMatch) {
        return (
          <p key={index} className="fcl-extra-paragraph fcl-extra-dialogue">
            <strong className="fcl-extra-speaker">{dialogueMatch[1]}:</strong>{" "}
            {renderHighlightedParts(dialogueMatch[2])}
          </p>
        );
      }

      return (
        <p key={index} className="fcl-extra-paragraph">
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

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="fcl-extra-eyebrow">{children}</span>;
}

function Avatar({
  name,
  photo,
  size = 40,
}: {
  name: string;
  photo: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const resolvedPhoto = getPhotoUrl(photo);

  const valid = Boolean(resolvedPhoto) && !failed;

  return (
    <span
      className="fcl-extra-avatar"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {valid ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={resolvedPhoto}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        name?.charAt(0)?.toUpperCase() || "F"
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
    <div className="fcl-extra-hero-stat">
      <strong>
        <StatValue value={value} />
      </strong>
      <span>{label}</span>
    </div>
  );
}

/* =========================================================
   SPOTLIGHT (rotating featured)
   ========================================================= */

function Spotlight({
  items,
  loading,
  onOpen,
}: {
  items: IndexedPerformance[];
  loading: boolean;
  onOpen: (performance: IndexedPerformance) => void;
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
      <div className="fcl-extra-spot loading" aria-hidden="true">
        <div className="fcl-extra-skeleton" style={{ width: 120, height: 12 }} />
        <div
          className="fcl-extra-skeleton"
          style={{ width: "70%", height: 22, marginTop: 20 }}
        />
        <div
          className="fcl-extra-skeleton"
          style={{ width: "90%", height: 14, marginTop: 14 }}
        />
      </div>
    );
  }

  if (items.length === 0) return null;

  const current = items[index % items.length];

  return (
    <div
      className={`fcl-extra-spot ${paused ? "paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="fcl-extra-spot-head">
        <span className="fcl-extra-live">
          <i />
          LATEST HEROICS
        </span>

        <span className="fcl-extra-spot-part">PART {current.part}</span>
      </div>

      <button
        key={current.key}
        type="button"
        className="fcl-extra-spot-body"
        onClick={() => onOpen(current)}
      >
        <Avatar
          name={current.item.playerName}
          photo={current.item.photo}
          size={48}
        />

        <span className="fcl-extra-spot-text">
          <strong>{current.item.playerName || "Unknown Player"}</strong>

          <em>{current.item.performanceTitle || "Extraordinary Performance"}</em>

          <small>{current.item.tournamentMatch || "FCL Match Record"}</small>
        </span>

        <span className="fcl-extra-spot-go">
          <ArrowIcon />
        </span>
      </button>

      {items.length > 1 && (
        <div className="fcl-extra-spot-dots">
          {items.map((entry, dotIndex) => (
            <button
              key={entry.key}
              type="button"
              aria-label={`Show featured performance ${dotIndex + 1}`}
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
    <div className="fcl-extra-sort" ref={ref}>
      <button
        type="button"
        className={`fcl-extra-sort-btn ${open ? "open" : ""}`}
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort performances"
      >
        <SortIcon />

        <span className="label">{current?.label}</span>

        <span className="chev">
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className="fcl-extra-sort-menu" role="listbox">
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
   PERFORMANCE CARD
   ========================================================= */

function PerformanceCard({
  performance,
  index,
  onOpen,
}: {
  performance: IndexedPerformance;
  index: number;
  onOpen: () => void;
}) {
  const { item, part, year } = performance;

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
      className="fcl-extra-card"
      style={{ "--i": index } as CSSProperties}
      aria-label={`${item.performanceTitle} - বিস্তারিত দেখুন`}
    >
      <div className="fcl-extra-card-top">
        <div className="fcl-extra-badges">
          <span className="fcl-extra-part">PART {part}</span>

          {year && year !== "0" && (
            <span className="fcl-extra-year">{year}</span>
          )}
        </div>

        <span className="fcl-extra-card-arrow">
          <ArrowIcon direction="up-right" size={16} />
        </span>
      </div>

      <div className="fcl-extra-card-person">
        <Avatar name={item.playerName} photo={item.photo} size={40} />

        <div>
          <span>PERFORMED BY</span>

          <h3>{item.playerName || "Unknown Player"}</h3>
        </div>
      </div>

      <div className="fcl-extra-card-body">
        <h4>{item.performanceTitle || "Extraordinary Performance"}</h4>

        <p className="fcl-extra-match">
          {item.tournamentMatch || "FCL Match Record"}
        </p>

        <p className="fcl-extra-preview">
          {cleanPreview(item.description || "") ||
            "এই পারফরম্যান্সের বিস্তারিত পড়তে কার্ডটি খুলুন।"}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   PERFORMANCE MODAL (desktop dialog / mobile bottom sheet)
   ========================================================= */

function PerformanceModal({
  performance,
  position,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  performance: IndexedPerformance;
  position: number;
  total: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const { item, part, year } = performance;

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [photoFailed, setPhotoFailed] = useState(false);

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
    setPhotoFailed(false);
  }, [performance.key]);

  const handleScroll = () => {
    const element = bodyRef.current;

    if (!element) return;

    const max = element.scrollHeight - element.clientHeight;

    setProgress(max > 0 ? element.scrollTop / max : 0);
  };

  const hasPostLink = isValidExternalUrl(item.facebookLink);
  const resolvedPhoto = getPhotoUrl(item.photo);
  const hasPhoto = Boolean(resolvedPhoto) && !photoFailed;

  return (
    <div
      className="fcl-extra-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="fcl-extra-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fcl-extra-modal-title"
      >
        <div className="fcl-extra-sheet-handle" aria-hidden="true" />

        <div className="fcl-extra-modal-top">
          <div className="fcl-extra-modal-meta">
            <span className="fcl-extra-part">PART {part}</span>

            {year && year !== "0" && (
              <span className="fcl-extra-year">{year}</span>
            )}

            <span className="fcl-extra-modal-pos">
              {position} / {total}
            </span>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="fcl-extra-modal-close"
            aria-label="Close performance details"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="fcl-extra-modal-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>

        <div
          className="fcl-extra-modal-body"
          ref={bodyRef}
          onScroll={handleScroll}
        >
          <div className="fcl-extra-modal-content" key={performance.key}>
            {/* ডানে ওপরে বড় ছবির জায়গা এবং বামে টেক্সট */}
            <div className="fcl-extra-modal-header-grid">
              <div className="fcl-extra-modal-header-text">
                <Eyebrow>EXTRAORDINARY PERFORMANCE</Eyebrow>

                <h2 id="fcl-extra-modal-title">
                  {item.performanceTitle || "Extraordinary Performance"}
                </h2>

                <div className="fcl-extra-modal-player">
                  <Avatar
                    key={`${item.photo}-${item.playerName}`}
                    name={item.playerName}
                    photo={item.photo}
                    size={44}
                  />

                  <div>
                    <span>PERFORMED BY</span>

                    <strong>{item.playerName || "Unknown Player"}</strong>
                  </div>
                </div>
              </div>

              {/* ডানে ওপরের বড় ছবি প্রিভিউ বক্স (আরেকটু বড়, নিচে ও বামে সামঞ্জস্যপূর্ণ) */}
              <div className="fcl-extra-modal-big-photo">
                {hasPhoto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={resolvedPhoto}
                    alt={item.playerName || "Player"}
                    onError={() => setPhotoFailed(true)}
                  />
                ) : (
                  <div className="fcl-extra-modal-photo-placeholder">
                    <span>{item.playerName?.charAt(0)?.toUpperCase() || "FCL"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="fcl-extra-modal-match">
              <span>MATCH / TOURNAMENT</span>

              <strong>{item.tournamentMatch || "FCL Match Record"}</strong>
            </div>

            <div className="fcl-extra-modal-story">
              <div className="fcl-extra-story-heading">
                <span>PERFORMANCE REPORT</span>

                <span>FCL ARCHIVES</span>
              </div>

              <div className="fcl-extra-story-content">
                {item.description ? (
                  renderTextWithHighlights(item.description)
                ) : (
                  <p>
                    এই পারফরম্যান্সের বিস্তারিত বিবরণ এখনো সংরক্ষিত হয়নি।
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="fcl-extra-modal-footer">
          <div className="fcl-extra-modal-nav">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev}
              aria-label="Previous performance"
            >
              <ArrowIcon direction="left" />
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!onNext}
              aria-label="Next performance"
            >
              <ArrowIcon />
            </button>
          </div>

          {hasPostLink ? (
            <a
              href={item.facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="fcl-extra-facebook-button"
            >
              মূল ফেসবুক পোস্ট
              <ArrowIcon direction="up-right" size={16} />
            </a>
          ) : (
            <span className="fcl-extra-no-link">মূল পোস্টের লিংক নেই</span>
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
    <div
      className="fcl-extra-grid"
      aria-busy="true"
      aria-label="Loading performances"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="fcl-extra-skeleton-card">
          <div className="fcl-extra-skeleton badge" />
          <div className="fcl-extra-skeleton name" />
          <div className="fcl-extra-skeleton line" />
          <div className="fcl-extra-skeleton line short" />
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
    <div className="fcl-extra-empty">
      <div className="fcl-extra-empty-mark">FCL</div>

      <h3>{title}</h3>

      <p>{description}</p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="fcl-extra-primary-button"
        >
          সব পারফরম্যান্স দেখুন
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
    <nav className="fcl-extra-pager" aria-label="Pagination">
      <span className="fcl-extra-pager-meta">
        {from}–{to} / {count}
      </span>

      <div className="fcl-extra-pager-controls">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ArrowIcon direction="left" />
        </button>

        <div className="fcl-extra-pager-nums">
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

        <span className="fcl-extra-pager-mobile">
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

function ExtraordinaryContent() {
  const isDark = useIsDark();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();

  const [performances, setPerformances] = useState<ExtraordinaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const [selectedPerf, setSelectedPerf] = useState<IndexedPerformance | null>(
    null
  );

  const [sortBy, setSortBy] = useState<SortBy>("part-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [showTop, setShowTop] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);

  const pageSize =
    view === "list" ? (isMobile ? 8 : 10) : isMobile ? 6 : 9;

  /* =======================================================
     FETCH DATA
     ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    let active = true;

    async function loadPerformances() {
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

        const records = Array.isArray(data?.extraordinary)
          ? data.extraordinary
          : [];

        const normalizedRecords = records.map(
          (item: Partial<ExtraordinaryRecord>) => ({
            part: item.part,
            Part: item.Part,

            matchYear: item.matchYear,
            "Match Year": item["Match Year"],

            playerName: normalize(item.playerName),
            performanceTitle: normalize(item.performanceTitle),
            tournamentMatch: normalize(item.tournamentMatch),
            description: normalize(item.description),
            facebookLink: normalize(item.facebookLink),
            photo: normalize(item.photo),
          })
        );

        setPerformances(normalizedRecords);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        if (!active) return;

        console.error("Extraordinary performances error:", err);

        setError("পারফরম্যান্সের তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPerformances();

    return () => {
      active = false;
      controller.abort();
    };
  }, [retryKey]);

  /* =======================================================
     DERIVED DATA
     ======================================================= */

  const indexedPerformances = useMemo<IndexedPerformance[]>(() => {
    return performances.map((item, index) => ({
      item,
      originalIndex: index,
      part: partOf(item, index + 1),
      year: yearOf(item),
      key: `${index}-${item.playerName}-${item.performanceTitle}`,
    }));
  }, [performances]);

  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        indexedPerformances
          .map((record) => record.year)
          .filter((year) => year && year !== "0")
      )
    ).sort((a, b) => toNumber(b) - toNumber(a));
  }, [indexedPerformances]);

  const spotlightItems = useMemo(() => {
    return [...indexedPerformances]
      .sort(
        (a, b) =>
          toNumber(b.part) - toNumber(a.part) ||
          b.originalIndex - a.originalIndex
      )
      .slice(0, 5);
  }, [indexedPerformances]);

  const filteredPerformances = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = indexedPerformances.filter((record) => {
      const matchesYear = selectedYear === "All" || record.year === selectedYear;

      if (!matchesYear) return false;

      if (!query) return true;

      return [
        record.item.playerName,
        record.item.performanceTitle,
        record.item.tournamentMatch,
        record.item.description,
        record.part,
        record.year,
      ].some((value) => normalize(value).toLowerCase().includes(query));
    });

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "part-asc":
          comparison = toNumber(a.part) - toNumber(b.part);
          break;

        case "part-desc":
          comparison = toNumber(b.part) - toNumber(a.part);
          break;

        case "year-desc":
          comparison = toNumber(b.year) - toNumber(a.year);
          break;

        case "year-asc":
          comparison = toNumber(a.year) - toNumber(b.year);
          break;
      }

      return comparison || a.originalIndex - b.originalIndex;
    });

    return result;
  }, [indexedPerformances, selectedYear, searchQuery, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPerformances.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visiblePerformances = filteredPerformances.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const rangeFrom =
    filteredPerformances.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const rangeTo = Math.min(
    currentPage * pageSize,
    filteredPerformances.length
  );

  const uniquePlayers = useMemo(() => {
    return new Set(
      performances.map((item) => item.playerName.toLowerCase()).filter(Boolean)
    ).size;
  }, [performances]);

  const latestYear = availableYears[0] || "—";

  const filtersActive =
    searchQuery.trim() !== "" || selectedYear !== "All" || sortBy !== "part-asc";

  /* =======================================================
     MODAL NAVIGATION
     ======================================================= */

  const navList = useMemo(() => {
    if (!selectedPerf) return [];

    return filteredPerformances.some((entry) => entry.key === selectedPerf.key)
      ? filteredPerformances
      : [selectedPerf];
  }, [filteredPerformances, selectedPerf]);

  const selectedIndex = selectedPerf
    ? navList.findIndex((entry) => entry.key === selectedPerf.key)
    : -1;

  const closeModal = useCallback(() => setSelectedPerf(null), []);

  const goPrev = useCallback(() => {
    if (selectedIndex > 0) setSelectedPerf(navList[selectedIndex - 1]);
  }, [navList, selectedIndex]);

  const goNext = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < navList.length - 1) {
      setSelectedPerf(navList[selectedIndex + 1]);
    }
  }, [navList, selectedIndex]);

  /* =======================================================
     গ্লোবাল সার্চ থেকে সরাসরি মোডাল খোলা (?item=INDEX)
     ======================================================= */

  const itemParam = searchParams.get("item");
  const stampParam = searchParams.get("s");

  useEffect(() => {
    if (itemParam === null || loading || indexedPerformances.length === 0) return;

    const idx = Number(itemParam);
    if (!Number.isInteger(idx)) return;

    const target = indexedPerformances.find((r) => r.originalIndex === idx);
    if (!target) return;

    // ফিল্টার/পেইজ রিসেট করে মোডাল খোলা
    setSearchQuery("");
    setSelectedYear("All");
    setSortBy("part-asc");
    setPage(1);
    setSelectedPerf(target);
  }, [itemParam, stampParam, loading, indexedPerformances]);

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
      if (event.key !== "/" || selectedPerf) return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;

      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      event.preventDefault();
      searchRef.current?.focus();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [selectedPerf]);

  /* =======================================================
     ACTIONS
     ======================================================= */

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedYear("All");
    setSortBy("part-asc");
    setPage(1);
  };

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(next, 1), totalPages));

    requestAnimationFrame(() => {
      document
        .getElementById("fcl-extra-collection")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const scrollToCollection = () => {
    document
      .getElementById("fcl-extra-collection")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* =======================================================
     THEME VARIABLES
     ======================================================= */

  const themeStyle = {
    colorScheme: isDark ? "dark" : "light",

    "--extra-bg": isDark ? "#020617" : "#ffffff",
    "--extra-secondary": isDark ? "#071020" : "#f8fafc",
    "--extra-card": isDark ? "#0b1220" : "#ffffff",
    "--extra-raised": isDark ? "#0f172a" : "#f1f5f9",
    "--extra-heading": isDark ? "#f8fafc" : "#0f172a",
    "--extra-text": isDark ? "#cbd5e1" : "#334155",
    "--extra-muted": isDark ? "#94a3b8" : "#64748b",
    "--extra-subtle": isDark ? "#64748b" : "#94a3b8",
    "--extra-border": isDark ? "#1e293b" : "#e2e8f0",
    "--extra-glass": isDark ? "rgba(7,16,32,.78)" : "rgba(255,255,255,.82)",

    "--extra-blue": "#1877F2",
    "--extra-cyan": "#22d3ee",
    "--extra-gold": "#f59e0b",

    "--extra-blue-soft": isDark
      ? "rgba(24,119,242,.14)"
      : "rgba(24,119,242,.08)",

    "--extra-shadow": isDark
      ? "0 18px 45px rgba(0,0,0,.22)"
      : "0 18px 45px rgba(15,23,42,.06)",
  } as CSSProperties;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className={`fcl-extra-page ${
        isDark ? "fcl-extra-dark" : "fcl-extra-light"
      }`}
      style={themeStyle}
    >
      {/* ================= HERO ================= */}

      <header className="fcl-extra-hero">
        <div className="fcl-extra-hero-grid" />
        <div className="fcl-extra-hero-glow one" />
        <div className="fcl-extra-hero-glow two" />

        <div className="fcl-extra-sq a" />
        <div className="fcl-extra-sq b" />
        <div className="fcl-extra-sq c" />

        <div className="fcl-extra-container">
          <div className="fcl-extra-hero-inner">
            <div className="fcl-extra-hero-content">
              <div className="fcl-extra-hero-label">
                <span />
                FCL HALL OF HEROICS
              </div>

              <h1>
                Extraordinary <em>Performances.</em>
              </h1>

              <p>
                সাধারণ পরিসংখ্যানের সীমা ছাড়িয়ে যাওয়া ইনিংস, হ্যাটট্রিক আর
                স্মরণীয় কীর্তির অফিশিয়াল সংগ্রহশালা।
              </p>

              <div className="fcl-extra-hero-actions">
                <button
                  type="button"
                  onClick={scrollToCollection}
                  className="fcl-extra-primary-button"
                >
                  পারফরম্যান্স দেখুন
                  <ArrowIcon direction="up" />
                </button>

                <Link href="/records" className="fcl-extra-outline-button">
                  FCL Records
                </Link>
              </div>
            </div>

            <Spotlight
              items={spotlightItems}
              loading={loading}
              onOpen={setSelectedPerf}
            />
          </div>

          <div className="fcl-extra-hero-stats">
            <HeroStat
              label="PERFORMANCES"
              value={loading ? "—" : performances.length}
            />

            <HeroStat label="PLAYERS" value={loading ? "—" : uniquePlayers} />

            <HeroStat
              label="MATCH YEARS"
              value={loading ? "—" : availableYears.length}
            />

            <HeroStat label="LATEST YEAR" value={loading ? "—" : latestYear} />
          </div>
        </div>
      </header>

      {/* ================= COLLECTION ================= */}

      <main id="fcl-extra-collection" className="fcl-extra-collection">
        <div className="fcl-extra-container">
          {/* ---------- COMMAND BAR ---------- */}

          <div className="fcl-extra-toolbar">
            <div className="fcl-extra-toolbar-row">
              <div className="fcl-extra-search">
                <SearchIcon />

                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="খেলোয়াড়, ম্যাচ বা পারফরম্যান্স খুঁজুন..."
                  aria-label="Search performances"
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

              <div className="fcl-extra-view-toggle" role="group" aria-label="View">
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

            <div className="fcl-extra-chips-row">
              <div className="fcl-extra-chips">
                <button
                  type="button"
                  className={`chip ${selectedYear === "All" ? "active" : ""}`}
                  onClick={() => {
                    setSelectedYear("All");
                    setPage(1);
                  }}
                >
                  All
                </button>

                {availableYears.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`chip ${selectedYear === year ? "active" : ""}`}
                    onClick={() => {
                      setSelectedYear(year);
                      setPage(1);
                    }}
                  >
                    {year}
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

              <span className="fcl-extra-count">
                {loading ? "…" : filteredPerformances.length} RECORDS
              </span>
            </div>
          </div>

          {/* ---------- ERROR ---------- */}

          {error && !loading && (
            <div className="fcl-extra-error" role="alert">
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

          <div className="fcl-extra-results">
            {loading ? (
              <LoadingCards count={isMobile ? 4 : 6} />
            ) : filteredPerformances.length === 0 ? (
              <EmptyState
                title={
                  error
                    ? "পারফরম্যান্স লোড করা যায়নি"
                    : "কোনো পারফরম্যান্স পাওয়া যায়নি"
                }
                description={
                  error
                    ? "আবার চেষ্টা করুন অথবা কিছুক্ষণ পরে ফিরে আসুন।"
                    : "আপনার অনুসন্ধানের সঙ্গে কোনো রেকর্ড মেলেনি। অন্য শব্দ বা সাল নির্বাচন করুন।"
                }
                onReset={error ? undefined : resetFilters}
              />
            ) : (
              <>
                <div
                  key={`${sortBy}-${selectedYear}-${currentPage}-${view}`}
                  className={`fcl-extra-grid ${view === "list" ? "list" : ""}`}
                >
                  {visiblePerformances.map((performance, index) => (
                    <PerformanceCard
                      key={performance.key}
                      performance={performance}
                      index={index}
                      onOpen={() => setSelectedPerf(performance)}
                    />
                  ))}
                </div>

                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  from={rangeFrom}
                  to={rangeTo}
                  count={filteredPerformances.length}
                  onChange={goToPage}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}

      <footer className="fcl-extra-footer">
        <div className="fcl-extra-container">
          <div className="fcl-extra-footer-inner">
            <span>
              © {new Date().getFullYear()} <strong>FCL</strong> · Extraordinary
              Performances Archive
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
        className={`fcl-extra-top ${showTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <ArrowIcon direction="up" />
      </button>

      {/* ================= MODAL ================= */}

      {selectedPerf && (
        <PerformanceModal
          performance={selectedPerf}
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
        {EXTRAORDINARY_STYLES}
      </style>
    </div>
  );
}

/* =========================================================
   PAGE EXPORT (useSearchParams এর জন্য Suspense দরকার)
   ========================================================= */

export default function ExtraordinaryPage() {
  return (
    <Suspense fallback={null}>
      <ExtraordinaryContent />
    </Suspense>
  );
}

/* =========================================================
   DESIGN SYSTEM
   ========================================================= */

const EXTRAORDINARY_STYLES = `

/* ---------- ROOT ---------- */

.fcl-extra-page {
  --extra-sticky-top: 0px;
  min-height: 100vh;
  background: var(--extra-bg);
  color: var(--extra-text);
  font-family: inherit;
  overflow-x: clip;
  transition: background-color .25s ease, color .25s ease;
}

.fcl-extra-page *,
.fcl-extra-page *::before,
.fcl-extra-page *::after {
  box-sizing: border-box;
}

.fcl-extra-page button {
  cursor: pointer;
  font-family: inherit;
}

.fcl-extra-page button:disabled {
  cursor: not-allowed;
}

.fcl-extra-page button,
.fcl-extra-page a {
  -webkit-tap-highlight-color: transparent;
}

.fcl-extra-page button:focus-visible,
.fcl-extra-page a:focus-visible,
.fcl-extra-page input:focus-visible {
  outline: 2px solid var(--extra-blue);
  outline-offset: 2px;
}

.fcl-extra-page ::selection {
  background: rgba(24,119,242,.24);
}

.fcl-extra-container {
  width: min(100% - 40px, 1180px);
  margin-inline: auto;
}

.fcl-extra-eyebrow {
  display: inline-block;
  color: var(--extra-blue);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .18em;
  text-transform: uppercase;
}

/* ---------- HERO ---------- */

.fcl-extra-hero {
  position: relative;
  overflow: hidden;
  background: var(--extra-secondary);
  border-bottom: 1px solid var(--extra-border);
}

.fcl-extra-hero-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .45;
  background-image:
    linear-gradient(rgba(24,119,242,.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(24,119,242,.055) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, #000 40%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, #000 40%, transparent);
}

.fcl-extra-hero-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(110px);
}

.fcl-extra-hero-glow.one {
  width: 520px;
  height: 520px;
  left: -200px;
  top: -260px;
  background: rgba(24,119,242,.14);
}

.fcl-extra-hero-glow.two {
  width: 460px;
  height: 460px;
  right: -170px;
  bottom: -250px;
  background: rgba(34,211,238,.1);
}

/* floating blurred squares */

.fcl-extra-sq {
  position: absolute;
  pointer-events: none;
  border-radius: 24px;
  border: 1px solid rgba(24,119,242,.22);
  background: linear-gradient(135deg, rgba(24,119,242,.2), rgba(34,211,238,.05));
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: fclExtraFloat 9s ease-in-out infinite;
}

.fcl-extra-sq.a {
  width: 96px;
  height: 96px;
  right: 7%;
  top: 14%;
  --r: 14deg;
  transform: rotate(14deg);
}

.fcl-extra-sq.b {
  width: 58px;
  height: 58px;
  left: 4%;
  bottom: 24%;
  --r: -12deg;
  transform: rotate(-12deg);
  animation-delay: -3s;
  opacity: .8;
}

.fcl-extra-sq.c {
  width: 140px;
  height: 140px;
  right: 30%;
  bottom: -70px;
  --r: 22deg;
  transform: rotate(22deg);
  animation-delay: -6s;
  opacity: .55;
}

.fcl-extra-hero-inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  align-items: center;
  gap: 44px;
  padding: 44px 0 26px;
}

.fcl-extra-hero-content {
  position: relative;
  z-index: 1;
  animation: fclExtraRise .7s cubic-bezier(.2,.8,.2,1) both;
}

.fcl-extra-hero-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--extra-blue);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .17em;
}

.fcl-extra-hero-label > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--extra-blue);
  box-shadow: 0 0 0 5px var(--extra-blue-soft);
  animation: fclExtraPulse 2s ease-in-out infinite;
}

.fcl-extra-hero-content h1 {
  margin: 14px 0 0;
  color: var(--extra-heading);
  font-size: clamp(30px, 4.4vw, 54px);
  line-height: 1.15;
  font-weight: 950;
  letter-spacing: -.05em;
}

.fcl-extra-hero-content h1 em {
  display: inline-block;
  font-style: normal;
  background: linear-gradient(100deg, #1877F2, #3b82f6 35%, #22d3ee 65%, #1877F2);
  background-size: 220% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: fclExtraShimmer 6s linear infinite;
}

.fcl-extra-hero-content > p {
  max-width: 500px;
  margin: 14px 0 0;
  color: var(--extra-muted);
  font-size: 13.5px;
  line-height: 1.9;
}

.fcl-extra-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.fcl-extra-primary-button,
.fcl-extra-outline-button {
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

.fcl-extra-primary-button {
  color: white;
  border: 1px solid #1877F2;
  background: linear-gradient(135deg, #1877F2, #2f8bff);
  box-shadow: 0 8px 22px rgba(24,119,242,.22);
}

.fcl-extra-primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(24,119,242,.3);
}

.fcl-extra-primary-button:active,
.fcl-extra-outline-button:active {
  transform: scale(.97);
}

.fcl-extra-outline-button {
  color: var(--extra-heading);
  background: var(--extra-glass);
  border: 1px solid var(--extra-border);
}

.fcl-extra-outline-button:hover {
  color: var(--extra-blue);
  border-color: var(--extra-blue);
}

/* ---------- HERO STATS ---------- */

.fcl-extra-hero-stats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 26px;
  border: 1px solid var(--extra-border);
  border-radius: 16px;
  background: var(--extra-glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: fclExtraRise .7s .15s cubic-bezier(.2,.8,.2,1) both;
}

.fcl-extra-hero-stat {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 14px 20px;
}

.fcl-extra-hero-stat + .fcl-extra-hero-stat {
  border-left: 1px solid var(--extra-border);
}

.fcl-extra-hero-stat strong {
  color: var(--extra-heading);
  font-size: 24px;
  font-weight: 950;
  letter-spacing: -.04em;
  font-variant-numeric: tabular-nums;
}

.fcl-extra-hero-stat span {
  color: var(--extra-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .12em;
}

/* ---------- SPOTLIGHT ---------- */

.fcl-extra-spot {
  position: relative;
  z-index: 1;
  padding: 16px;
  border: 1px solid var(--extra-border);
  border-radius: 20px;
  background: var(--extra-glass);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--extra-shadow);
  animation: fclExtraRise .7s .1s cubic-bezier(.2,.8,.2,1) both;
}

.fcl-extra-spot.loading {
  min-height: 150px;
}

.fcl-extra-spot-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.fcl-extra-live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--extra-blue);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .14em;
}

.fcl-extra-live i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34,197,94,.55);
  animation: fclExtraLive 1.8s infinite;
}

.fcl-extra-spot-part {
  color: var(--extra-gold);
  font-size: 9px;
  font-weight: 950;
  letter-spacing: .1em;
}

.fcl-extra-spot-body {
  display: flex;
  align-items: center;
  gap: 13px;
  width: 100%;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid var(--extra-border);
  border-radius: 14px;
  background: var(--extra-card);
  color: inherit;
  text-align: left;
  animation: fclExtraSwap .45s cubic-bezier(.2,.8,.2,1) both;
  transition: border-color .2s ease, transform .2s ease;
}

.fcl-extra-spot-body:hover {
  border-color: rgba(24,119,242,.5);
  transform: translateY(-2px);
}

.fcl-extra-spot-body:active {
  transform: scale(.98);
}

.fcl-extra-spot-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.fcl-extra-spot-text strong {
  color: var(--extra-heading);
  font-size: 15px;
  font-weight: 950;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fcl-extra-spot-text em {
  color: var(--extra-blue);
  font-style: normal;
  font-size: 12px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fcl-extra-spot-text small {
  color: var(--extra-muted);
  font-size: 10.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fcl-extra-spot-go {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--extra-blue-soft);
  color: var(--extra-blue);
}

.fcl-extra-spot-dots {
  display: flex;
  gap: 6px;
  margin-top: 14px;
}

.fcl-extra-spot-dots button {
  position: relative;
  flex: 1;
  height: 4px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: var(--extra-border);
  overflow: hidden;
}

.fcl-extra-spot-dots button span {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #1877F2, #22d3ee);
  transform-origin: left;
  animation: fclExtraDot ${5500}ms linear both;
}

.fcl-extra-spot.paused .fcl-extra-spot-dots button span {
  animation-play-state: paused;
}

/* ---------- AVATAR ---------- */

.fcl-extra-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(24,119,242,.25);
  background: var(--extra-blue-soft);
  color: var(--extra-blue);
  font-weight: 950;
}

.fcl-extra-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ---------- MODAL HEADER GRID (BIGGER PHOTO, SHIFTED LEFT/DOWN) ---------- */

.fcl-extra-modal-header-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  align-items: center;
  gap: 20px;
}

.fcl-extra-modal-big-photo {
  width: 180px;
  height: 180px;
  margin-top: 8px;
  margin-left: -10px;
  border-radius: 20px;
  border: 2.5px solid rgba(24,119,242,0.4);
  overflow: hidden;
  background: var(--extra-secondary);
  box-shadow: 0 14px 35px rgba(0,0,0,0.35);
  flex-shrink: 0;
}

.fcl-extra-modal-big-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fcl-extra-modal-photo-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: var(--extra-blue-soft);
  color: var(--extra-blue);
  font-size: 28px;
  font-weight: 950;
}

/* ---------- COLLECTION ---------- */

.fcl-extra-collection {
  padding: 22px 0 36px;
  background: var(--extra-bg);
  scroll-margin-top: 8px;
}

/* ---------- TOOLBAR ---------- */

.fcl-extra-toolbar {
  position: sticky;
  top: calc(var(--extra-sticky-top) + 10px);
  z-index: 20;
  padding: 10px;
  border: 1px solid var(--extra-border);
  border-radius: 18px;
  background: var(--extra-glass);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  box-shadow: var(--extra-shadow);
}

.fcl-extra-toolbar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fcl-extra-search {
  position: relative;
  flex: 1;
  min-width: 0;
}

.fcl-extra-search > svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--extra-muted);
  pointer-events: none;
}

.fcl-extra-search input {
  display: block;
  width: 100%;
  height: 44px;
  padding: 0 44px 0 42px;
  border: 1px solid var(--extra-border);
  border-radius: 12px;
  background: var(--extra-secondary);
  color: var(--extra-heading);
  font-family: inherit;
  font-size: 12.5px;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.fcl-extra-search input::placeholder {
  color: var(--extra-subtle);
}

.fcl-extra-search input:focus {
  outline: none;
  border-color: var(--extra-blue);
  box-shadow: 0 0 0 4px var(--extra-blue-soft);
}

.fcl-extra-search input::-webkit-search-cancel-button {
  display: none;
}

.fcl-extra-search kbd {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 1px solid var(--extra-border);
  border-radius: 6px;
  color: var(--extra-muted);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  pointer-events: none;
}

.fcl-extra-search .clear {
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
  background: var(--extra-raised);
  color: var(--extra-muted);
}

.fcl-extra-search .clear:hover {
  color: white;
  background: #ef4444;
}

/* sort */

.fcl-extra-sort {
  position: relative;
  flex-shrink: 0;
}

.fcl-extra-sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 44px;
  padding: 0 13px;
  border: 1px solid var(--extra-border);
  border-radius: 12px;
  background: var(--extra-secondary);
  color: var(--extra-heading);
  font-size: 12px;
  font-weight: 850;
  transition: all .2s ease;
}

.fcl-extra-sort-btn:hover,
.fcl-extra-sort-btn.open {
  border-color: var(--extra-blue);
  color: var(--extra-blue);
}

.fcl-extra-sort-btn .chev {
  display: inline-flex;
  transition: transform .2s ease;
}

.fcl-extra-sort-btn.open .chev {
  transform: rotate(180deg);
}

.fcl-extra-sort-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 40;
  min-width: 210px;
  padding: 6px;
  border: 1px solid var(--extra-border);
  border-radius: 14px;
  background: var(--extra-card);
  box-shadow: 0 22px 60px rgba(0,0,0,.25);
  transform-origin: top right;
  animation: fclExtraMenu .18s ease both;
}

.fcl-extra-sort-menu button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--extra-text);
  font-size: 12px;
  font-weight: 800;
  text-align: left;
}

.fcl-extra-sort-menu button:hover {
  background: var(--extra-raised);
}

.fcl-extra-sort-menu button.selected {
  color: var(--extra-blue);
  background: var(--extra-blue-soft);
}

/* view toggle */

.fcl-extra-view-toggle {
  display: inline-flex;
  flex-shrink: 0;
  padding: 3px;
  border: 1px solid var(--extra-border);
  border-radius: 12px;
  background: var(--extra-secondary);
}

.fcl-extra-view-toggle button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--extra-muted);
  transition: all .2s ease;
}

.fcl-extra-view-toggle button.active {
  background: var(--extra-blue);
  color: white;
  box-shadow: 0 5px 14px rgba(24,119,242,.3);
}

/* chips */

.fcl-extra-chips-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.fcl-extra-chips {
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

.fcl-extra-chips::-webkit-scrollbar {
  display: none;
}

.fcl-extra-chips .chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--extra-border);
  border-radius: 999px;
  background: var(--extra-secondary);
  color: var(--extra-muted);
  font-size: 11.5px;
  font-weight: 850;
  transition: all .2s ease;
}

.fcl-extra-chips .chip:hover {
  color: var(--extra-heading);
  border-color: var(--extra-blue);
}

.fcl-extra-chips .chip:active {
  transform: scale(.95);
}

.fcl-extra-chips .chip.active {
  border-color: var(--extra-blue);
  background: var(--extra-blue);
  color: white;
  box-shadow: 0 6px 16px rgba(24,119,242,.3);
}

.fcl-extra-chips .chip.reset {
  border-color: rgba(239,68,68,.3);
  background: rgba(239,68,68,.08);
  color: #ef4444;
  animation: fclExtraPop .25s ease both;
}

.fcl-extra-count {
  flex-shrink: 0;
  padding: 7px 11px;
  border: 1px solid var(--extra-border);
  border-radius: 9px;
  background: var(--extra-secondary);
  color: var(--extra-muted);
  font-size: 9.5px;
  font-weight: 900;
  letter-spacing: .09em;
}

/* ---------- GRID & CARDS ---------- */

.fcl-extra-results {
  margin-top: 16px;
}

.fcl-extra-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.fcl-extra-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  min-width: 0;
  padding: 18px;
  overflow: hidden;
  text-align: left;
  border: 1px solid var(--extra-border);
  border-radius: 18px;
  background: var(--extra-card);
  color: var(--extra-text);
  box-shadow: var(--extra-shadow);
  animation: fclExtraCardIn .55s cubic-bezier(.2,.8,.2,1) both;
  animation-delay: calc(var(--i, 0) * 45ms);
  transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
}

.fcl-extra-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #1877F2, #22d3ee, #f59e0b);
  opacity: 0;
  transition: opacity .25s ease;
}

.fcl-extra-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), rgba(24,119,242,.15), transparent 65%);
  transition: opacity .25s ease;
}

.fcl-extra-card:hover {
  transform: translateY(-4px);
  border-color: rgba(24,119,242,.45);
  box-shadow: 0 22px 50px rgba(24,119,242,.12);
}

.fcl-extra-card:hover::before,
.fcl-extra-card:hover::after {
  opacity: 1;
}

.fcl-extra-card:active {
  transform: scale(.985);
}

.fcl-extra-card > * {
  position: relative;
  z-index: 1;
}

.fcl-extra-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.fcl-extra-badges {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fcl-extra-part,
.fcl-extra-year {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 9.5px;
  font-weight: 950;
  letter-spacing: .06em;
  white-space: nowrap;
}

.fcl-extra-part {
  border: 1px solid rgba(245,158,11,.3);
  background: rgba(245,158,11,.08);
  color: #d97706;
}

.fcl-extra-dark .fcl-extra-part {
  color: #fbbf24;
}

.fcl-extra-year {
  border: 1px solid var(--extra-border);
  background: var(--extra-secondary);
  color: var(--extra-muted);
}

.fcl-extra-card-arrow {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--extra-blue-soft);
  color: var(--extra-blue);
  transition: all .25s ease;
}

.fcl-extra-card:hover .fcl-extra-card-arrow {
  background: var(--extra-blue);
  color: white;
  transform: rotate(45deg);
}

.fcl-extra-card-person {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.fcl-extra-card-person > div {
  min-width: 0;
}

.fcl-extra-card-person span {
  display: block;
  color: var(--extra-blue);
  font-size: 8.5px;
  font-weight: 900;
  letter-spacing: .13em;
}

.fcl-extra-card-person h3 {
  margin: 3px 0 0;
  color: var(--extra-heading);
  font-size: 16px;
  font-weight: 950;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fcl-extra-card-body {
  min-width: 0;
}

.fcl-extra-card-body h4 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: 0;
  color: var(--extra-heading);
  font-size: 14px;
  font-weight: 900;
  line-height: 1.6;
  transition: color .2s ease;
}

.fcl-extra-card:hover .fcl-extra-card-body h4 {
  color: var(--extra-blue);
}

.fcl-extra-match {
  margin: 4px 0 0;
  color: var(--extra-muted);
  font-size: 10.5px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fcl-extra-preview {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: 9px 0 0;
  color: var(--extra-text);
  font-size: 11.5px;
  line-height: 1.85;
}

/* list view */

.fcl-extra-grid.list {
  grid-template-columns: 1fr;
  gap: 10px;
}

.fcl-extra-grid.list .fcl-extra-card {
  flex-direction: row;
  align-items: center;
  gap: 18px;
  padding: 12px 16px;
}

.fcl-extra-grid.list .fcl-extra-card-top {
  display: contents;
}

.fcl-extra-grid.list .fcl-extra-badges {
  order: 1;
  width: 150px;
  flex-shrink: 0;
}

.fcl-extra-grid.list .fcl-extra-card-person {
  order: 2;
  width: 230px;
  flex-shrink: 0;
}

.fcl-extra-grid.list .fcl-extra-card-body {
  order: 3;
  flex: 1;
}

.fcl-extra-grid.list .fcl-extra-card-body h4 {
  -webkit-line-clamp: 1;
}

.fcl-extra-grid.list .fcl-extra-preview {
  display: none;
}

.fcl-extra-grid.list .fcl-extra-card-arrow {
  order: 4;
}

/* ---------- PAGER ---------- */

.fcl-extra-pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
}

.fcl-extra-pager-meta {
  color: var(--extra-muted);
  font-size: 11px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.fcl-extra-pager-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fcl-extra-pager-controls button {
  display: grid;
  place-items: center;
  min-width: 38px;
  height: 38px;
  padding: 0 6px;
  border: 1px solid var(--extra-border);
  border-radius: 11px;
  background: var(--extra-card);
  color: var(--extra-heading);
  font-size: 12px;
  font-weight: 900;
  transition: all .2s ease;
}

.fcl-extra-pager-controls button:hover:not(:disabled):not(.active) {
  border-color: var(--extra-blue);
  color: var(--extra-blue);
}

.fcl-extra-pager-controls button:active:not(:disabled) {
  transform: scale(.93);
}

.fcl-extra-pager-controls button:disabled {
  opacity: .35;
}

.fcl-extra-pager-controls button.active {
  border-color: var(--extra-blue);
  background: var(--extra-blue);
  color: white;
  box-shadow: 0 6px 16px rgba(24,119,242,.3);
}

.fcl-extra-pager-nums {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fcl-extra-pager-nums .gap {
  padding: 0 4px;
  color: var(--extra-subtle);
}

.fcl-extra-pager-mobile {
  display: none;
  min-width: 64px;
  text-align: center;
  color: var(--extra-heading);
  font-size: 12px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

/* ---------- MODAL ---------- */

.fcl-extra-modal-backdrop {
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
  animation: fclExtraFade .2s ease both;
}

.fcl-extra-modal {
  display: flex;
  flex-direction: column;
  width: min(100%, 720px);
  max-height: min(88dvh, 820px);
  overflow: hidden;
  border: 1px solid var(--extra-border);
  border-radius: 22px;
  background: var(--extra-card);
  box-shadow: 0 35px 110px rgba(0,0,0,.4);
  animation: fclExtraModalEnter .32s cubic-bezier(.2,.9,.25,1.05) both;
}

.fcl-extra-sheet-handle {
  display: none;
  width: 40px;
  height: 4px;
  margin: 8px auto 0;
  border-radius: 4px;
  background: var(--extra-border);
}

.fcl-extra-modal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 12px 16px 12px 20px;
  background: var(--extra-secondary);
}

.fcl-extra-modal-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.fcl-extra-modal-pos {
  margin-left: 4px;
  color: var(--extra-subtle);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .08em;
  font-variant-numeric: tabular-nums;
}

.fcl-extra-modal-close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 1px solid var(--extra-border);
  border-radius: 11px;
  background: var(--extra-card);
  color: var(--extra-heading);
  transition: all .2s ease;
}

.fcl-extra-modal-close:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
  transform: rotate(90deg);
}

.fcl-extra-modal-progress {
  height: 2px;
  background: var(--extra-border);
}

.fcl-extra-modal-progress span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #1877F2, #22d3ee);
  transform-origin: left;
  transform: scaleX(0);
}

.fcl-extra-modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 22px 24px;
  scrollbar-width: thin;
  scrollbar-color: var(--extra-border) transparent;
}

.fcl-extra-modal-content {
  animation: fclExtraSwap .4s cubic-bezier(.2,.8,.2,1) both;
}

.fcl-extra-modal-content h2 {
  margin: 10px 0 0;
  color: var(--extra-heading);
  font-size: clamp(21px, 3vw, 30px);
  font-weight: 950;
  letter-spacing: -.03em;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.fcl-extra-modal-player {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.fcl-extra-modal-player > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.fcl-extra-modal-player span {
  color: var(--extra-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .1em;
}

.fcl-extra-modal-player strong {
  color: var(--extra-heading);
  font-size: 14px;
  font-weight: 900;
}

.fcl-extra-modal-match {
  margin-top: 16px;
  padding: 12px 16px;
  border-left: 3px solid var(--extra-blue);
  border-radius: 0 10px 10px 0;
  background: var(--extra-secondary);
}

.fcl-extra-modal-match span {
  display: block;
  color: var(--extra-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .12em;
}

.fcl-extra-modal-match strong {
  display: block;
  margin-top: 6px;
  color: var(--extra-heading);
  font-size: 13px;
  font-weight: 850;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.fcl-extra-modal-story {
  margin-top: 16px;
  border: 1px solid var(--extra-border);
  border-radius: 14px;
  background: var(--extra-secondary);
  overflow: hidden;
}

.fcl-extra-story-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--extra-border);
}

.fcl-extra-story-heading span {
  color: var(--extra-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .1em;
}

.fcl-extra-story-content {
  padding: 18px 20px;
  color: var(--extra-text);
  font-size: 13px;
  line-height: 2.05;
  overflow-wrap: anywhere;
}

.fcl-extra-paragraph {
  margin: 0;
  line-height: inherit;
}

.fcl-extra-paragraph + .fcl-extra-paragraph {
  margin-top: 10px;
}

.fcl-extra-paragraph-gap {
  height: 10px;
}

.fcl-extra-dialogue {
  padding: 8px 12px;
  border-left: 2px solid rgba(24,119,242,.4);
  border-radius: 0 8px 8px 0;
  background: var(--extra-blue-soft);
}

.fcl-extra-speaker {
  color: var(--extra-blue);
  font-weight: 900;
}

.fcl-extra-highlight {
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(245,158,11,.09);
  color: #d97706;
  font-weight: 850;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.fcl-extra-dark .fcl-extra-highlight {
  color: #fbbf24;
}

.fcl-extra-highlight.strong {
  background: rgba(245,158,11,.15);
  font-weight: 950;
}

.fcl-extra-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 12px 20px;
  border-top: 1px solid var(--extra-border);
  background: var(--extra-secondary);
}

.fcl-extra-modal-nav {
  display: flex;
  gap: 8px;
}

.fcl-extra-modal-nav button {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--extra-border);
  border-radius: 12px;
  background: var(--extra-card);
  color: var(--extra-heading);
  transition: all .2s ease;
}

.fcl-extra-modal-nav button:hover:not(:disabled) {
  border-color: var(--extra-blue);
  color: var(--extra-blue);
}

.fcl-extra-modal-nav button:active:not(:disabled) {
  transform: scale(.92);
}

.fcl-extra-modal-nav button:disabled {
  opacity: .35;
}

.fcl-extra-facebook-button {
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
  box-shadow: 0 8px 20px rgba(24,119,242,.25);
  transition: all .2s ease;
}

.fcl-extra-facebook-button:hover {
  transform: translateY(-2px);
}

.fcl-extra-facebook-button:active {
  transform: scale(.97);
}

.fcl-extra-no-link {
  color: var(--extra-muted);
  font-size: 11px;
}

/* ---------- ERROR / EMPTY / SKELETON ---------- */

.fcl-extra-error {
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

.fcl-extra-error strong {
  color: #ef4444;
  font-size: 13px;
  font-weight: 900;
}

.fcl-extra-error p {
  margin: 4px 0 0;
  color: var(--extra-text);
  font-size: 12px;
}

.fcl-extra-error button {
  flex-shrink: 0;
  padding: 9px 14px;
  border: 1px solid rgba(239,68,68,.28);
  border-radius: 10px;
  background: var(--extra-card);
  color: #ef4444;
  font-size: 11px;
  font-weight: 900;
}

.fcl-extra-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  border: 1px dashed var(--extra-border);
  border-radius: 18px;
  background: var(--extra-secondary);
  text-align: center;
  animation: fclExtraRise .4s ease both;
}

.fcl-extra-empty-mark {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  border: 1px solid rgba(24,119,242,.25);
  background: var(--extra-blue-soft);
  color: var(--extra-blue);
  font-size: 18px;
  font-weight: 950;
  letter-spacing: -.09em;
}

.fcl-extra-empty h3 {
  margin: 16px 0 0;
  color: var(--extra-heading);
  font-size: 17px;
  font-weight: 950;
}

.fcl-extra-empty p {
  max-width: 420px;
  margin: 8px 0 18px;
  color: var(--extra-muted);
  font-size: 12.5px;
  line-height: 1.8;
}

.fcl-extra-skeleton-card {
  min-height: 190px;
  padding: 18px;
  border: 1px solid var(--extra-border);
  border-radius: 18px;
  background: var(--extra-card);
}

.fcl-extra-skeleton {
  border-radius: 8px;
  background: linear-gradient(90deg, var(--extra-secondary) 20%, var(--extra-raised) 50%, var(--extra-secondary) 80%);
  background-size: 200% 100%;
  animation: fclExtraSkeleton 1.5s ease infinite;
}

.fcl-extra-skeleton.badge {
  width: 90px;
  height: 24px;
}

.fcl-extra-skeleton.name {
  width: 60%;
  height: 26px;
  margin-top: 22px;
}

.fcl-extra-skeleton.line {
  width: 95%;
  height: 12px;
  margin-top: 16px;
}

.fcl-extra-skeleton.line.short {
  width: 65%;
}

/* ---------- FOOTER ---------- */

.fcl-extra-footer {
  border-top: 1px solid var(--extra-border);
  background: var(--extra-secondary);
}

.fcl-extra-footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  color: var(--extra-muted);
  font-size: 11px;
}

.fcl-extra-footer-inner strong {
  color: var(--extra-heading);
}

.fcl-extra-footer-inner nav {
  display: flex;
  gap: 18px;
}

.fcl-extra-footer-inner a {
  color: var(--extra-blue);
  font-weight: 900;
  text-decoration: none;
}

.fcl-extra-footer-inner a:hover {
  text-decoration: underline;
}

/* ---------- BACK TO TOP ---------- */

.fcl-extra-top {
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
  background: var(--extra-blue);
  color: white;
  box-shadow: 0 12px 28px rgba(24,119,242,.4);
  opacity: 0;
  pointer-events: none;
  transform: translateY(14px) scale(.9);
  transition: all .3s ease;
}

.fcl-extra-top.visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}

.fcl-extra-top:active {
  transform: scale(.92);
}

/* ---------- KEYFRAMES ---------- */

@keyframes fclExtraFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fclExtraModalEnter {
  from { opacity: 0; transform: translateY(18px) scale(.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fclExtraSheetUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes fclExtraRise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fclExtraCardIn {
  from { opacity: 0; transform: translateY(18px) scale(.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fclExtraSwap {
  from { opacity: 0; transform: translateX(14px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fclExtraMenu {
  from { opacity: 0; transform: translateY(-6px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fclExtraPop {
  from { opacity: 0; transform: scale(.7); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fclExtraShimmer {
  to { background-position: 220% 0; }
}

@keyframes fclExtraFloat {
  0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
  50% { transform: translateY(-16px) rotate(calc(var(--r, 0deg) + 8deg)); }
}

@keyframes fclExtraPulse {
  0%, 100% { box-shadow: 0 0 0 4px var(--extra-blue-soft); }
  50% { box-shadow: 0 0 0 8px rgba(24,119,242,0); }
}

@keyframes fclExtraLive {
  0% { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
  100% { box-shadow: 0 0 0 9px rgba(34,197,94,0); }
}

@keyframes fclExtraDot {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes fclExtraSkeleton {
  to { background-position-x: -200%; }
}

/* ---------- RESPONSIVE ---------- */

@media (hover: none) {
  .fcl-extra-card::after,
  .fcl-extra-card::before {
    display: none;
  }

  .fcl-extra-card:hover {
    transform: none;
    box-shadow: var(--extra-shadow);
    border-color: var(--extra-border);
  }

  .fcl-extra-card:active {
    transform: scale(.975);
  }
}

@media (max-width: 1050px) {
  .fcl-extra-hero-inner {
    grid-template-columns: minmax(0, 1fr) 330px;
    gap: 28px;
  }

  .fcl-extra-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fcl-extra-grid.list .fcl-extra-badges {
    width: 130px;
  }

  .fcl-extra-grid.list .fcl-extra-card-person {
    width: 190px;
  }

  .fcl-extra-sort-btn .label {
    display: none;
  }
}

@media (max-width: 760px) {
  .fcl-extra-container {
    width: min(100% - 24px, 1180px);
  }

  /* hero (app header) */

  .fcl-extra-hero-inner {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 26px 0 14px;
  }

  .fcl-extra-hero-content h1 {
    margin-top: 10px;
    font-size: clamp(28px, 8.6vw, 38px);
  }

  .fcl-extra-hero-content > p {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.8;
  }

  .fcl-extra-hero-actions {
    margin-top: 16px;
  }

  .fcl-extra-hero-actions .fcl-extra-primary-button,
  .fcl-extra-hero-actions .fcl-extra-outline-button {
    flex: 1;
    min-height: 42px;
    padding: 9px 12px;
  }

  .fcl-extra-sq.a {
    width: 60px;
    height: 60px;
    top: 8%;
    right: 5%;
  }

  .fcl-extra-sq.c {
    display: none;
  }

  /* compact spotlight */

  .fcl-extra-spot {
    padding: 12px;
    border-radius: 18px;
  }

  .fcl-extra-spot-body {
    margin-top: 10px;
    padding: 10px;
  }

  .fcl-extra-spot-dots {
    margin-top: 10px;
  }

  /* stats as compact tiles */

  .fcl-extra-hero-stats {
    margin-bottom: 16px;
    border-radius: 14px;
  }

  .fcl-extra-hero-stat {
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 11px 4px;
    text-align: center;
  }

  .fcl-extra-hero-stat strong {
    font-size: 19px;
  }

  .fcl-extra-hero-stat span {
    font-size: 7.5px;
    letter-spacing: .06em;
  }

  /* collection */

  .fcl-extra-collection {
    padding: 14px 0 28px;
  }

  .fcl-extra-toolbar {
    top: calc(var(--extra-sticky-top) + 6px);
    padding: 8px;
    border-radius: 16px;
  }

  .fcl-extra-search input {
    height: 42px;
    padding-right: 40px;
    font-size: 12px;
  }

  .fcl-extra-search kbd {
    display: none;
  }

  .fcl-extra-sort-btn {
    width: 42px;
    height: 42px;
    justify-content: center;
    padding: 0;
  }

  .fcl-extra-sort-btn .label,
  .fcl-extra-sort-btn .chev {
    display: none;
  }

  .fcl-extra-sort-menu {
    min-width: 200px;
  }

  .fcl-extra-view-toggle button {
    width: 34px;
    height: 34px;
  }

  .fcl-extra-chips-row {
    margin-top: 8px;
  }

  .fcl-extra-count {
    display: none;
  }

  .fcl-extra-chips {
    padding-right: 10px;
  }

  .fcl-extra-results {
    margin-top: 12px;
  }

  .fcl-extra-grid {
    grid-template-columns: 1fr;
    gap: 11px;
  }

  .fcl-extra-card {
    gap: 12px;
    padding: 15px;
    border-radius: 17px;
  }

  .fcl-extra-card-person h3 {
    font-size: 15px;
  }

  /* mobile list view */

  .fcl-extra-grid.list {
    gap: 8px;
  }

  .fcl-extra-grid.list .fcl-extra-card {
    flex-wrap: wrap;
    gap: 8px 10px;
    padding: 12px 14px;
  }

  .fcl-extra-grid.list .fcl-extra-badges {
    order: 1;
    width: auto;
  }

  .fcl-extra-grid.list .fcl-extra-badges .fcl-extra-year {
    display: none;
  }

  .fcl-extra-grid.list .fcl-extra-card-person {
    order: 2;
    flex: 1;
    width: auto;
  }

  .fcl-extra-grid.list .fcl-extra-card-person span {
    display: none;
  }

  .fcl-extra-grid.list .fcl-extra-card-arrow {
    order: 3;
    width: 28px;
    height: 28px;
  }

  .fcl-extra-grid.list .fcl-extra-card-body {
    order: 4;
    flex: 0 0 100%;
  }

  .fcl-extra-grid.list .fcl-extra-match {
    display: none;
  }

  /* pager */

  .fcl-extra-pager {
    justify-content: center;
    margin-top: 14px;
  }

  .fcl-extra-pager-meta,
  .fcl-extra-pager-nums {
    display: none;
  }

  .fcl-extra-pager-mobile {
    display: block;
  }

  .fcl-extra-pager-controls {
    gap: 10px;
    padding: 6px;
    border: 1px solid var(--extra-border);
    border-radius: 16px;
    background: var(--extra-glass);
  }

  .fcl-extra-pager-controls button {
    min-width: 44px;
    height: 44px;
    border-radius: 12px;
  }

  /* bottom sheet modal */

  .fcl-extra-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .fcl-extra-modal {
    width: 100%;
    max-height: 92dvh;
    border-radius: 24px 24px 0 0;
    border-bottom: 0;
    animation: fclExtraSheetUp .38s cubic-bezier(.2,.9,.25,1) both;
  }

  .fcl-extra-sheet-handle {
    display: block;
  }

  .fcl-extra-modal-top {
    padding: 10px 14px 10px 16px;
  }

  .fcl-extra-modal-body {
    padding: 18px 16px;
  }

  .fcl-extra-modal-content h2 {
    font-size: 22px;
  }

  .fcl-extra-story-content {
    padding: 15px 16px;
    font-size: 12.5px;
    line-height: 2;
  }

  .fcl-extra-modal-footer {
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  }

  .fcl-extra-facebook-button {
    flex: 1;
  }

  .fcl-extra-error {
    flex-direction: column;
    align-items: stretch;
  }

  .fcl-extra-error button {
    width: fit-content;
  }

  .fcl-extra-footer-inner {
    flex-direction: column;
    gap: 8px;
    padding: 14px 0 18px;
    text-align: center;
  }

  .fcl-extra-top {
    right: 12px;
    bottom: calc(14px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 380px) {
  .fcl-extra-hero-stat span {
    font-size: 7px;
  }

  .fcl-extra-hero-stat strong {
    font-size: 17px;
  }
}

/* ---------- REDUCED MOTION ---------- */

@media (prefers-reduced-motion: reduce) {
  .fcl-extra-page *,
  .fcl-extra-page *::before,
  .fcl-extra-page *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}

`;