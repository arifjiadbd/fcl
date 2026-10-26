"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";

/* =========================================================
   FCL EXTRAORDINARY PERFORMANCES
   Official Hall of Heroics
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

type SortBy =
  | "part-asc"
  | "part-desc"
  | "year-desc"
  | "year-asc";

type IndexedPerformance = {
  item: ExtraordinaryRecord;
  originalIndex: number;
  part: string;
  year: string;
  key: string;
};

const PAGE_SIZE = 12;

/* =========================================================
   DATA HELPERS
   ========================================================= */

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function partOf(
  item: ExtraordinaryRecord,
  fallback: number
): string {
  const raw = item.part ?? item.Part ?? "";

  const value = normalize(raw);

  return value && value !== "0"
    ? value
    : String(fallback);
}

function yearOf(item: ExtraordinaryRecord): string {
  return normalize(
    item.matchYear ?? item["Match Year"] ?? ""
  );
}

function toNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:"
    );
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

/* =========================================================
   TEXT FORMATTING
   ========================================================= */

function renderHighlightedParts(
  text: string
): ReactNode {
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
      return (
        <strong
          key={index}
          className="fcl-extra-highlight strong"
        >
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
        <strong
          key={index}
          className="fcl-extra-highlight"
        >
          {part.slice(1, -1).trim()}
        </strong>
      );
    }

    return (
      <span key={index}>
        {part}
      </span>
    );
  });
}

function renderTextWithHighlights(
  text: string
): ReactNode {
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

      const dialogueMatch = trimmed.match(
        /^([^:\n]{1,70}):\s+(.+)$/
      );

      if (dialogueMatch) {
        return (
          <p
            key={index}
            className="fcl-extra-paragraph fcl-extra-dialogue"
          >
            <strong className="fcl-extra-speaker">
              {dialogueMatch[1]}:
            </strong>{" "}
            {renderHighlightedParts(
              dialogueMatch[2]
            )}
          </p>
        );
      }

      return (
        <p
          key={index}
          className="fcl-extra-paragraph"
        >
          {renderHighlightedParts(trimmed)}
        </p>
      );
    });
}

/* =========================================================
   THEME
   ========================================================= */

function detectDarkTheme(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

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

  if (
    html.classList.contains("dark") ||
    body.classList.contains("dark")
  ) {
    return true;
  }

  if (
    html.classList.contains("light") ||
    body.classList.contains("light")
  ) {
    return false;
  }

  const schemes = [
    html.style.colorScheme,
    body.style.colorScheme,
  ];

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

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const update = () => {
      setIsDark(detectDarkTheme());
    };

    update();

    const observer = new MutationObserver(update);

    const options: MutationObserverInit = {
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

    observer.observe(
      document.body,
      options
    );

    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

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

/* =========================================================
   ICONS
   ========================================================= */

function SearchIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ArrowIcon({
  direction = "right",
}: {
  direction?: "right" | "left" | "up";
}) {
  const rotation =
    direction === "left"
      ? "rotate(180deg)"
      : direction === "up"
        ? "rotate(-45deg)"
        : undefined;

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: rotation }}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
   ========================================================= */

function Eyebrow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="fcl-extra-eyebrow">
      {children}
    </span>
  );
}

function SectionHeader({
  label,
  title,
  description,
  right,
}: {
  label: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="fcl-extra-section-header">
      <div>
        <Eyebrow>{label}</Eyebrow>

        <h2>{title}</h2>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {right && (
        <div className="fcl-extra-header-right">
          {right}
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
  onOpen,
}: {
  performance: IndexedPerformance;
  onOpen: () => void;
}) {
  const { item, part, year } = performance;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="fcl-extra-card"
      aria-label={`${item.performanceTitle} - বিস্তারিত দেখুন`}
    >
      <div className="fcl-extra-card-accent" />

      <div className="fcl-extra-card-top">
        <span className="fcl-extra-part">
          PART {part}
        </span>

        {year && year !== "0" && (
          <span className="fcl-extra-year">
            {year}
          </span>
        )}
      </div>

      <div className="fcl-extra-card-content">
        <div className="fcl-extra-player-label">
          <span className="fcl-extra-player-dot" />

          FEATURED PLAYER
        </div>

        <h3>{item.playerName || "Unknown Player"}</h3>

        <div className="fcl-extra-card-divider" />

        <h4>
          {item.performanceTitle ||
            "Extraordinary Performance"}
        </h4>

        <p className="fcl-extra-match">
          {item.tournamentMatch ||
            "FCL Match Record"}
        </p>

        <p className="fcl-extra-preview">
          {cleanPreview(item.description || "") ||
            "এই পারফরম্যান্সের বিস্তারিত পড়তে কার্ডটি খুলুন।"}
        </p>
      </div>

      <div className="fcl-extra-card-footer">
        <span>
          বিস্তারিত পারফরম্যান্স দেখুন
        </span>

        <span className="fcl-extra-card-arrow">
          <ArrowIcon />
        </span>
      </div>
    </button>
  );
}

/* =========================================================
   PERFORMANCE DETAILS MODAL
   ========================================================= */

function PerformanceModal({
  performance,
  onClose,
}: {
  performance: IndexedPerformance;
  onClose: () => void;
}) {
  const { item, part, year } = performance;

  const dialogRef = useRef<HTMLDivElement | null>(
    null
  );

  const closeRef = useRef<HTMLButtonElement | null>(
    null
  );

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (
        event.key === "Tab" &&
        dialogRef.current
      ) {
        const focusable =
          dialogRef.current.querySelectorAll<
            HTMLElement
          >(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );

        if (focusable.length === 0) return;

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

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  const hasPostLink = isValidExternalUrl(
    item.facebookLink
  );

  return (
    <div
      className="fcl-extra-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="fcl-extra-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fcl-extra-modal-title"
      >
        <div className="fcl-extra-modal-top">
          <div className="fcl-extra-modal-reference">
            <span>
              FCL / PERFORMANCE RECORD
            </span>

            <strong>PART {part}</strong>
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

        <div className="fcl-extra-modal-body">
          <div className="fcl-extra-modal-meta">
            <span className="fcl-extra-part">
              PART {part}
            </span>

            {year && year !== "0" && (
              <span className="fcl-extra-year">
                {year}
              </span>
            )}
          </div>

          <div className="fcl-extra-modal-heading">
            <Eyebrow>
              EXTRAORDINARY PERFORMANCE
            </Eyebrow>

            <h2 id="fcl-extra-modal-title">
              {item.performanceTitle ||
                "Extraordinary Performance"}
            </h2>

            <div className="fcl-extra-modal-player">
              <div className="fcl-extra-modal-player-mark">
                {item.playerName
                  ?.charAt(0)
                  ?.toUpperCase() || "F"}
              </div>

              <div>
                <span>PERFORMED BY</span>

                <strong>
                  {item.playerName ||
                    "Unknown Player"}
                </strong>
              </div>
            </div>
          </div>

          <div className="fcl-extra-modal-match">
            <span>MATCH / TOURNAMENT</span>

            <strong>
              {item.tournamentMatch ||
                "FCL Match Record"}
            </strong>
          </div>

          <div className="fcl-extra-modal-story">
            <div className="fcl-extra-story-heading">
              <span>PERFORMANCE REPORT</span>

              <span>FCL ARCHIVES</span>
            </div>

            <div className="fcl-extra-story-content">
              {item.description ? (
                renderTextWithHighlights(
                  item.description
                )
              ) : (
                <p>
                  এই পারফরম্যান্সের বিস্তারিত
                  বিবরণ এখনো সংরক্ষিত হয়নি।
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="fcl-extra-modal-footer">
          <span>
            FACEBOOK CRICKET LEAGUE
          </span>

          {hasPostLink ? (
            <a
              href={item.facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="fcl-extra-facebook-button"
            >
              মূল ফেসবুক পোস্ট

              <ArrowIcon direction="up" />
            </a>
          ) : (
            <span className="fcl-extra-no-link">
              মূল পোস্টের লিংক নেই
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING & EMPTY
   ========================================================= */

function LoadingCards() {
  return (
    <div
      className="fcl-extra-grid"
      aria-busy="true"
      aria-label="Loading performances"
    >
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="fcl-extra-skeleton-card"
          >
            <div className="fcl-extra-skeleton badge" />

            <div className="fcl-extra-skeleton name" />

            <div className="fcl-extra-skeleton title" />

            <div className="fcl-extra-skeleton line" />

            <div className="fcl-extra-skeleton line short" />
          </div>
        )
      )}
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
      <div className="fcl-extra-empty-mark">
        FCL
      </div>

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

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function ExtraordinaryPage() {
  const isDark = useIsDark();

  const [
    performances,
    setPerformances,
  ] = useState<ExtraordinaryRecord[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [retryKey, setRetryKey] =
    useState(0);

  const [selectedPerf, setSelectedPerf] =
    useState<IndexedPerformance | null>(
      null
    );

  const [sortBy, setSortBy] =
    useState<SortBy>("part-asc");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedYear, setSelectedYear] =
    useState("All");

  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);

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
        const response = await fetch(
          "/api/thrillers-data",
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}`
          );
        }

        const data = await response.json();

        if (!active) return;

        const records = Array.isArray(
          data?.extraordinary
        )
          ? data.extraordinary
          : [];

        const normalizedRecords =
          records.map(
            (
              item: Partial<ExtraordinaryRecord>
            ) => ({
              part: item.part,
              Part: item.Part,

              matchYear: item.matchYear,
              "Match Year":
                item["Match Year"],

              playerName: normalize(
                item.playerName
              ),

              performanceTitle: normalize(
                item.performanceTitle
              ),

              tournamentMatch: normalize(
                item.tournamentMatch
              ),

              description: normalize(
                item.description
              ),

              facebookLink: normalize(
                item.facebookLink
              ),

              photo: normalize(
                item.photo
              ),
            })
          );

        setPerformances(
          normalizedRecords
        );
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        if (!active) return;

        console.error(
          "Extraordinary performances error:",
          err
        );

        setError(
          "পারফরম্যান্সের তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।"
        );
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

  const indexedPerformances = useMemo<
    IndexedPerformance[]
  >(() => {
    return performances.map(
      (item, index) => ({
        item,
        originalIndex: index,
        part: partOf(
          item,
          index + 1
        ),
        year: yearOf(item),
        key: `${index}-${item.playerName}-${item.performanceTitle}`,
      })
    );
  }, [performances]);

  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        indexedPerformances
          .map((record) =>
            record.year
          )
          .filter(
            (year) =>
              year && year !== "0"
          )
      )
    ).sort(
      (a, b) =>
        toNumber(b) - toNumber(a)
    );
  }, [indexedPerformances]);

  const filteredPerformances = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    const result =
      indexedPerformances.filter(
        (record) => {
          const matchesYear =
            selectedYear === "All" ||
            record.year ===
              selectedYear;

          if (!matchesYear) return false;

          if (!query) return true;

          return [
            record.item.playerName,
            record.item.performanceTitle,
            record.item.tournamentMatch,
            record.item.description,
            record.part,
            record.year,
          ].some((value) =>
            normalize(value)
              .toLowerCase()
              .includes(query)
          );
        }
      );

    result.sort((a, b) => {
      const partA =
        toNumber(a.part);

      const partB =
        toNumber(b.part);

      const yearA =
        toNumber(a.year);

      const yearB =
        toNumber(b.year);

      let comparison = 0;

      switch (sortBy) {
        case "part-asc":
          comparison = partA - partB;
          break;

        case "part-desc":
          comparison = partB - partA;
          break;

        case "year-desc":
          comparison = yearB - yearA;
          break;

        case "year-asc":
          comparison = yearA - yearB;
          break;
      }

      return (
        comparison ||
        a.originalIndex -
          b.originalIndex
      );
    });

    return result;
  }, [
    indexedPerformances,
    selectedYear,
    searchQuery,
    sortBy,
  ]);

  const visiblePerformances =
    filteredPerformances.slice(
      0,
      visibleCount
    );

  const hasMore =
    visibleCount <
    filteredPerformances.length;

  const uniquePlayers = useMemo(() => {
    return new Set(
      performances
        .map((item) =>
          item.playerName.toLowerCase()
        )
        .filter(Boolean)
    ).size;
  }, [performances]);

  const latestYear =
    availableYears[0] || "—";

  /* =======================================================
     ACTIONS
     ======================================================= */

  const closeModal = useCallback(() => {
    setSelectedPerf(null);
  }, []);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedYear("All");
    setSortBy("part-asc");
    setVisibleCount(PAGE_SIZE);
  };

  const retryFetch = () => {
    setRetryKey(
      (previous) => previous + 1
    );
  };

  /* =======================================================
     THEME VARIABLES
     ======================================================= */

  const themeStyle = {
    colorScheme: isDark
      ? "dark"
      : "light",

    "--extra-bg": isDark
      ? "#020617"
      : "#ffffff",

    "--extra-secondary": isDark
      ? "#071020"
      : "#f8fafc",

    "--extra-card": isDark
      ? "#0b1220"
      : "#ffffff",

    "--extra-raised": isDark
      ? "#0f172a"
      : "#f1f5f9",

    "--extra-heading": isDark
      ? "#f8fafc"
      : "#0f172a",

    "--extra-text": isDark
      ? "#cbd5e1"
      : "#334155",

    "--extra-muted": isDark
      ? "#94a3b8"
      : "#64748b",

    "--extra-subtle": isDark
      ? "#64748b"
      : "#94a3b8",

    "--extra-border": isDark
      ? "#1e293b"
      : "#e2e8f0",

    "--extra-border-soft": isDark
      ? "#172033"
      : "#edf2f7",

    "--extra-blue": "#1877F2",
    "--extra-cyan": "#22d3ee",
    "--extra-gold": "#f59e0b",

    "--extra-blue-soft": isDark
      ? "rgba(24,119,242,.12)"
      : "rgba(24,119,242,.07)",

    "--extra-shadow": isDark
      ? "0 20px 55px rgba(0,0,0,.18)"
      : "0 20px 55px rgba(15,23,42,.055)",
  } as CSSProperties;

  return (
    <div
      className={`fcl-extra-page ${
        isDark
          ? "fcl-extra-dark"
          : "fcl-extra-light"
      }`}
      style={themeStyle}
    >
      {/* ================================================
          HERO
          ================================================ */}

      <header className="fcl-extra-hero">
        <div className="fcl-extra-hero-grid" />

        <div className="fcl-extra-hero-glow one" />
        <div className="fcl-extra-hero-glow two" />

        <div className="fcl-extra-container">
          <div className="fcl-extra-hero-inner">
            <div className="fcl-extra-hero-content">
              <div className="fcl-extra-hero-label">
                <span />

                FCL HALL OF HEROICS
              </div>

              <h1>
                Extraordinary
                <br />

                <span>Performances.</span>
              </h1>

              <p>
                FCL-এর ইতিহাসে এমন কিছু
                পারফরম্যান্স রয়েছে,
                যেগুলো সাধারণ পরিসংখ্যানের
                সীমা ছাড়িয়ে কিংবদন্তি
                হয়ে উঠেছে। সেই অসাধারণ
                ইনিংস, হ্যাটট্রিক এবং
                স্মরণীয় কীর্তির
                অফিশিয়াল সংগ্রহশালা।
              </p>

              <div className="fcl-extra-hero-actions">
                <a
                  href="#fcl-extra-collection"
                  className="fcl-extra-primary-button"
                >
                  পারফরম্যান্স দেখুন

                  <ArrowIcon />
                </a>

                <Link
                  href="/records"
                  className="fcl-extra-outline-button"
                >
                  FCL Records
                </Link>
              </div>

              <div className="fcl-extra-hero-est">
                <span />

                FACEBOOK CRICKET LEAGUE
                <strong>EST. 2013</strong>
              </div>
            </div>

            <div className="fcl-extra-hero-visual">
              <div className="fcl-extra-visual-orbit">
                <div className="fcl-extra-visual-inner">
                  <span>FCL</span>

                  <strong>
                    HALL OF
                    <br />
                    HEROICS
                  </strong>
                </div>
              </div>

              <div className="fcl-extra-visual-caption">
                EXCELLENCE BEYOND THE ORDINARY
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================
          OVERVIEW
          ================================================ */}

      <section className="fcl-extra-overview">
        <div className="fcl-extra-container">
          <div className="fcl-extra-stats">
            <div className="fcl-extra-stat">
              <span>TOTAL PERFORMANCES</span>

              <strong>
                {loading
                  ? "—"
                  : performances.length.toLocaleString(
                      "en-US"
                    )}
              </strong>

              <p>সংরক্ষিত অসাধারণ কীর্তি</p>
            </div>

            <div className="fcl-extra-stat">
              <span>FEATURED PLAYERS</span>

              <strong>
                {loading
                  ? "—"
                  : uniquePlayers.toLocaleString(
                      "en-US"
                    )}
              </strong>

              <p>অনন্য খেলোয়াড়</p>
            </div>

            <div className="fcl-extra-stat">
              <span>MATCH YEARS</span>

              <strong>
                {loading
                  ? "—"
                  : availableYears.length.toLocaleString(
                      "en-US"
                    )}
              </strong>

              <p>বিভিন্ন বছরের পারফরম্যান্স</p>
            </div>

            <div className="fcl-extra-stat">
              <span>LATEST RECORD YEAR</span>

              <strong>
                {loading
                  ? "—"
                  : latestYear}
              </strong>

              <p>সর্বশেষ সংরক্ষিত বছর</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          COLLECTION
          ================================================ */}

      <main
        id="fcl-extra-collection"
        className="fcl-extra-collection"
      >
        <div className="fcl-extra-container">
          <SectionHeader
            label="THE OFFICIAL COLLECTION"
            title="অসাধারণ পারফরম্যান্স আর্কাইভ"
            description="খেলোয়াড়, ম্যাচ, পারফরম্যান্সের নাম অথবা সাল দিয়ে খুঁজুন। প্রতিটি কীর্তির বিস্তারিত পড়তে কার্ড নির্বাচন করুন।"
            right={
              <span className="fcl-extra-result-count">
                {
                  filteredPerformances.length
                }{" "}
                RECORDS
              </span>
            }
          />

          {/* ============================================
              FILTER PANEL
              ============================================ */}

          <div className="fcl-extra-filter-panel">
            <div className="fcl-extra-filter-heading">
              <div>
                <span>EXPLORE RECORDS</span>

                <strong>
                  আপনার পছন্দের পারফরম্যান্স খুঁজুন
                </strong>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="fcl-extra-reset"
              >
                Reset Filters
              </button>
            </div>

            <div className="fcl-extra-filter-grid">
              <div className="fcl-extra-search">
                <label
                  htmlFor="fcl-extra-search-input"
                >
                  SEARCH PERFORMANCES
                </label>

                <div className="fcl-extra-search-field">
                  <SearchIcon />

                  <input
                    id="fcl-extra-search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(
                        event.target.value
                      );

                      setVisibleCount(
                        PAGE_SIZE
                      );
                    }}
                    placeholder="Player, match, performance..."
                  />
                </div>
              </div>

              <div className="fcl-extra-select-field">
                <label
                  htmlFor="fcl-extra-year"
                >
                  MATCH YEAR
                </label>

                <select
                  id="fcl-extra-year"
                  value={selectedYear}
                  onChange={(event) => {
                    setSelectedYear(
                      event.target.value
                    );

                    setVisibleCount(
                      PAGE_SIZE
                    );
                  }}
                >
                  <option value="All">
                    All Years
                  </option>

                  {availableYears.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="fcl-extra-select-field">
                <label
                  htmlFor="fcl-extra-sort"
                >
                  SORT BY
                </label>

                <select
                  id="fcl-extra-sort"
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(
                      event.target.value as SortBy
                    );

                    setVisibleCount(
                      PAGE_SIZE
                    );
                  }}
                >
                  <option value="part-asc">
                    Part (1 → Latest)
                  </option>

                  <option value="part-desc">
                    Part (Latest → 1)
                  </option>

                  <option value="year-desc">
                    Year (Newest First)
                  </option>

                  <option value="year-asc">
                    Year (Oldest First)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* ============================================
              ERROR
              ============================================ */}

          {error && !loading && (
            <div
              className="fcl-extra-error"
              role="alert"
            >
              <div>
                <strong>
                  তথ্য লোড করা যায়নি
                </strong>

                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={retryFetch}
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {/* ============================================
              CONTENT
              ============================================ */}

          <div className="fcl-extra-results">
            <div className="fcl-extra-results-heading">
              <div>
                <Eyebrow>
                  RECORDED MASTERCLASSES
                </Eyebrow>

                <h3>
                  স্মরণীয় পারফরম্যান্সসমূহ
                </h3>
              </div>

              <span>
                {loading
                  ? "Loading..."
                  : `${filteredPerformances.length} Results`}
              </span>
            </div>

            {loading ? (
              <LoadingCards />
            ) : filteredPerformances.length ===
              0 ? (
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
                onReset={
                  error
                    ? undefined
                    : resetFilters
                }
              />
            ) : (
              <>
                <div className="fcl-extra-grid">
                  {visiblePerformances.map(
                    (performance) => (
                      <PerformanceCard
                        key={
                          performance.key
                        }
                        performance={
                          performance
                        }
                        onOpen={() =>
                          setSelectedPerf(
                            performance
                          )
                        }
                      />
                    )
                  )}
                </div>

                {hasMore && (
                  <div className="fcl-extra-load-more">
                    <p>
                      দেখানো হচ্ছে{" "}
                      <strong>
                        {
                          visiblePerformances.length
                        }
                      </strong>{" "}
                      /{" "}
                      {
                        filteredPerformances.length
                      }{" "}
                      টি পারফরম্যান্স
                    </p>

                    <div className="fcl-extra-progress">
                      <span
                        style={{
                          width: `${
                            (visiblePerformances.length /
                              filteredPerformances.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount(
                          (previous) =>
                            previous +
                            PAGE_SIZE
                        )
                      }
                      className="fcl-extra-load-button"
                    >
                      আরও পারফরম্যান্স দেখুন

                      <ArrowIcon />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount(
                          filteredPerformances.length
                        )
                      }
                      className="fcl-extra-show-all"
                    >
                      সব রেকর্ড দেখুন
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* ================================================
          BOTTOM CTA
          ================================================ */}

      <section className="fcl-extra-bottom">
        <div className="fcl-extra-container">
          <div className="fcl-extra-bottom-card">
            <div className="fcl-extra-bottom-content">
              <Eyebrow>
                THE LEGACY CONTINUES
              </Eyebrow>

              <h2>
                কিছু পারফরম্যান্স
                <br />

                <span>
                  ইতিহাস হয়ে থাকে।
                </span>
              </h2>

              <p>
                FCL-এর রেকর্ড, খেলোয়াড়দের
                র‍্যাঙ্কিং এবং স্মরণীয় ম্যাচগুলোর
                বিস্তারিত জানতে আমাদের
                অন্যান্য আর্কাইভ ঘুরে দেখুন।
              </p>

              <div className="fcl-extra-bottom-actions">
                <Link
                  href="/records"
                  className="fcl-extra-primary-button"
                >
                  FCL Records

                  <ArrowIcon />
                </Link>

                <Link
                  href="/rankings"
                  className="fcl-extra-outline-button"
                >
                  Player Rankings
                </Link>
              </div>
            </div>

            <div className="fcl-extra-bottom-emblem">
              <span>FCL</span>

              <strong>HEROICS</strong>

              <small>EST. 2013</small>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          FOOTER
          ================================================ */}

      <footer className="fcl-extra-footer">
        <div className="fcl-extra-container">
          <div className="fcl-extra-footer-top">
            <div>
              <strong>
                FACEBOOK CRICKET LEAGUE
              </strong>

              <p>
                Extraordinary Performances Archive
              </p>
            </div>

            <Link href="/">
              Back to Home ↗
            </Link>
          </div>

          <div className="fcl-extra-footer-bottom">
            <span>
              © {new Date().getFullYear()} FCL
            </span>

            <span>
              Celebrating Cricket Excellence
              Since 2013
            </span>
          </div>
        </div>
      </footer>

      {/* ================================================
          MODAL
          ================================================ */}

      {selectedPerf && (
        <PerformanceModal
          performance={selectedPerf}
          onClose={closeModal}
        />
      )}

      <style jsx global>
        {EXTRAORDINARY_STYLES}
      </style>
    </div>
  );
}

/* =========================================================
   DESIGN SYSTEM
   ========================================================= */

const EXTRAORDINARY_STYLES = `

/* =========================================================
   ROOT
   ========================================================= */

.fcl-extra-page {
  min-height: 100vh;
  background: var(--extra-bg);
  color: var(--extra-text);
  font-family: inherit;
  transition:
    background-color .25s ease,
    color .25s ease;
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

.fcl-extra-page button,
.fcl-extra-page a {
  -webkit-tap-highlight-color: transparent;
}

.fcl-extra-page button:focus-visible,
.fcl-extra-page a:focus-visible,
.fcl-extra-page input:focus-visible,
.fcl-extra-page select:focus-visible {
  outline: 3px solid var(--extra-blue);
  outline-offset: 3px;
}

.fcl-extra-page ::selection {
  background: rgba(24,119,242,.24);
}

.fcl-extra-container {
  width: min(100% - 40px, 1200px);
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

/* =========================================================
   HERO
   ========================================================= */

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
    linear-gradient(
      rgba(24,119,242,.055) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(24,119,242,.055) 1px,
      transparent 1px
    );
  background-size: 56px 56px;
}

.fcl-extra-hero-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(110px);
}

.fcl-extra-hero-glow.one {
  width: 550px;
  height: 550px;
  left: -210px;
  top: -260px;
  background: rgba(24,119,242,.12);
}

.fcl-extra-hero-glow.two {
  width: 500px;
  height: 500px;
  right: -180px;
  bottom: -250px;
  background: rgba(34,211,238,.09);
}

.fcl-extra-hero-inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0,1.3fr) minmax(270px,.7fr);
  align-items: center;
  gap: 60px;
  padding: 90px 0 100px;
}

.fcl-extra-hero-content {
  position: relative;
  z-index: 1;
}

.fcl-extra-hero-label {
  display: inline-flex;
  align-items: center;
  gap: 11px;
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
}

.fcl-extra-hero-content h1 {
  margin: 25px 0 0;
  color: var(--extra-heading);
  font-size: clamp(39px,5.5vw,72px);
  line-height: 1.12;
  font-weight: 950;
  letter-spacing: -.055em;
}

.fcl-extra-hero-content h1 span {
  background: linear-gradient(
    100deg,
    #1877F2,
    #3b82f6 45%,
    #22d3ee
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.fcl-extra-hero-content > p {
  max-width: 620px;
  margin: 26px 0 0;
  color: var(--extra-muted);
  font-size: 14px;
  line-height: 2.1;
}

.fcl-extra-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 35px;
}

.fcl-extra-primary-button,
.fcl-extra-outline-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 13px;
  min-height: 45px;
  padding: 12px 21px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 900;
  transition: all .2s ease;
}

.fcl-extra-primary-button {
  color: white;
  border: 1px solid #1877F2;
  background: #1877F2;
  box-shadow: 0 8px 22px rgba(24,119,242,.19);
}

.fcl-extra-primary-button:hover {
  transform: translateY(-2px);
  background: #0866dc;
  box-shadow: 0 12px 27px rgba(24,119,242,.25);
}

.fcl-extra-outline-button {
  color: var(--extra-heading);
  background: var(--extra-card);
  border: 1px solid var(--extra-border);
}

.fcl-extra-outline-button:hover {
  color: var(--extra-blue);
  border-color: var(--extra-blue);
}

.fcl-extra-hero-est {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 13px;
  margin-top: 47px;
  color: var(--extra-subtle);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .12em;
}

.fcl-extra-hero-est > span {
  width: 33px;
  height: 1px;
  background: var(--extra-blue);
}

.fcl-extra-hero-est strong {
  color: var(--extra-muted);
  font-size: 10px;
}

/* =========================================================
   HERO VISUAL
   ========================================================= */

.fcl-extra-hero-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.fcl-extra-visual-orbit {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 315px;
  height: 315px;
  border-radius: 50%;
  border: 1px dashed rgba(24,119,242,.25);
}

.fcl-extra-visual-orbit::before {
  content: "";
  position: absolute;
  inset: 25px;
  border-radius: 50%;
  border: 1px solid rgba(24,119,242,.23);
  background: rgba(24,119,242,.04);
  box-shadow: 0 0 70px rgba(24,119,242,.08);
}

.fcl-extra-visual-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 205px;
  height: 205px;
  border-radius: 50%;
  border: 2px solid rgba(24,119,242,.35);
  background: var(--extra-card);
}

.fcl-extra-visual-inner span {
  color: var(--extra-blue);
  font-size: 65px;
  font-weight: 950;
  letter-spacing: -.11em;
  line-height: 1;
}

.fcl-extra-visual-inner strong {
  margin-top: 15px;
  color: var(--extra-muted);
  font-size: 10px;
  font-weight: 900;
  line-height: 1.8;
  letter-spacing: .17em;
  text-align: center;
}

.fcl-extra-visual-caption {
  margin-top: 25px;
  color: var(--extra-subtle);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .16em;
  text-align: center;
}

/* =========================================================
   STATS
   ========================================================= */

.fcl-extra-overview {
  border-bottom: 1px solid var(--extra-border);
  background: var(--extra-bg);
}

.fcl-extra-stats {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
}

.fcl-extra-stat {
  padding: 34px 25px 34px 0;
}

.fcl-extra-stat + .fcl-extra-stat {
  padding-left: 30px;
  border-left: 1px solid var(--extra-border);
}

.fcl-extra-stat > span {
  color: var(--extra-muted);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .12em;
}

.fcl-extra-stat strong {
  display: block;
  margin-top: 13px;
  color: var(--extra-heading);
  font-size: clamp(27px,3vw,36px);
  font-weight: 950;
  letter-spacing: -.05em;
}

.fcl-extra-stat p {
  margin: 6px 0 0;
  color: var(--extra-subtle);
  font-size: 12px;
}

/* =========================================================
   COLLECTION
   ========================================================= */

.fcl-extra-collection {
  padding: 85px 0 110px;
  background: var(--extra-bg);
  scroll-margin-top: 85px;
}

.fcl-extra-section-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 25px;
  margin-bottom: 30px;
}

.fcl-extra-section-header h2 {
  margin: 12px 0 0;
  color: var(--extra-heading);
  font-size: clamp(27px,3vw,37px);
  font-weight: 950;
  letter-spacing: -.045em;
  line-height: 1.4;
}

.fcl-extra-section-header p {
  margin: 12px 0 0;
  color: var(--extra-muted);
  font-size: 13px;
  line-height: 1.9;
}

.fcl-extra-result-count {
  display: inline-flex;
  align-items: center;
  padding: 9px 13px;
  border: 1px solid var(--extra-border);
  border-radius: 8px;
  background: var(--extra-secondary);
  color: var(--extra-muted);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .08em;
  white-space: nowrap;
}

/* =========================================================
   FILTERS
   ========================================================= */

.fcl-extra-filter-panel {
  padding: 26px;
  border: 1px solid var(--extra-border);
  border-radius: 16px;
  background: var(--extra-card);
  box-shadow: var(--extra-shadow);
}

.fcl-extra-filter-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 23px;
}

.fcl-extra-filter-heading > div {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.fcl-extra-filter-heading > div span {
  color: var(--extra-blue);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .15em;
}

.fcl-extra-filter-heading strong {
  color: var(--extra-heading);
  font-size: 14px;
  font-weight: 900;
}

.fcl-extra-reset {
  border: 0;
  background: transparent;
  color: var(--extra-muted);
  font-size: 11px;
  font-weight: 850;
}

.fcl-extra-reset:hover {
  color: var(--extra-blue);
}

.fcl-extra-filter-grid {
  display: grid;
  grid-template-columns: minmax(0,1.5fr) minmax(150px,.7fr) minmax(175px,.8fr);
  gap: 15px;
}

.fcl-extra-search label,
.fcl-extra-select-field label {
  display: block;
  margin-bottom: 9px;
  color: var(--extra-muted);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .07em;
}

.fcl-extra-search-field {
  position: relative;
}

.fcl-extra-search-field svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--extra-muted);
  pointer-events: none;
}

.fcl-extra-search input,
.fcl-extra-select-field select {
  display: block;
  width: 100%;
  min-height: 47px;
  border: 1px solid var(--extra-border);
  border-radius: 9px;
  background: var(--extra-secondary);
  color: var(--extra-heading);
  font-family: inherit;
  font-size: 12px;
  transition: border-color .2s ease;
}

.fcl-extra-search input {
  padding: 12px 14px 12px 43px;
}

.fcl-extra-select-field select {
  padding: 12px;
  cursor: pointer;
}

.fcl-extra-search input::placeholder {
  color: var(--extra-subtle);
}

.fcl-extra-search input:focus,
.fcl-extra-select-field select:focus {
  border-color: var(--extra-blue);
  outline: none;
}

/* =========================================================
   RESULTS
   ========================================================= */

.fcl-extra-results {
  margin-top: 60px;
}

.fcl-extra-results-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  margin-bottom: 24px;
}

.fcl-extra-results-heading h3 {
  margin: 10px 0 0;
  color: var(--extra-heading);
  font-size: 22px;
  font-weight: 950;
  line-height: 1.4;
}

.fcl-extra-results-heading > span {
  color: var(--extra-muted);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.fcl-extra-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  align-items: stretch;
  gap: 20px;
}

/* =========================================================
   CARDS
   ========================================================= */

.fcl-extra-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: 340px;
  padding: 25px;
  overflow: hidden;
  text-align: left;
  border: 1px solid var(--extra-border);
  border-radius: 15px;
  background: var(--extra-card);
  color: var(--extra-text);
  box-shadow: var(--extra-shadow);
  transition:
    transform .25s ease,
    border-color .25s ease,
    box-shadow .25s ease;
}

.fcl-extra-card:hover {
  transform: translateY(-4px);
  border-color: rgba(24,119,242,.45);
  box-shadow:
    0 25px 60px rgba(24,119,242,.09);
}

.fcl-extra-card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    #1877F2,
    #22d3ee,
    #f59e0b
  );
  opacity: 0;
  transition: opacity .25s ease;
}

.fcl-extra-card:hover .fcl-extra-card-accent {
  opacity: 1;
}

.fcl-extra-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.fcl-extra-part {
  display: inline-flex;
  align-items: center;
  padding: 8px 11px;
  border: 1px solid rgba(245,158,11,.28);
  border-radius: 7px;
  background: rgba(245,158,11,.075);
  color: #d97706;
  font-size: 10px;
  font-weight: 950;
  letter-spacing: .06em;
}

.fcl-extra-dark .fcl-extra-part {
  color: #fbbf24;
}

.fcl-extra-year {
  display: inline-flex;
  align-items: center;
  padding: 8px 11px;
  border: 1px solid var(--extra-border);
  border-radius: 7px;
  background: var(--extra-secondary);
  color: var(--extra-muted);
  font-size: 10px;
  font-weight: 900;
}

.fcl-extra-card-content {
  padding-top: 37px;
  flex: 1;
}

.fcl-extra-player-label {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--extra-blue);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .13em;
}

.fcl-extra-player-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--extra-blue);
}

.fcl-extra-card-content h3 {
  margin: 12px 0 0;
  color: var(--extra-heading);
  font-size: clamp(19px,2vw,25px);
  font-weight: 950;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.fcl-extra-card-divider {
  width: 35px;
  height: 2px;
  margin: 24px 0 21px;
  background: var(--extra-blue);
  opacity: .6;
}

.fcl-extra-card-content h4 {
  margin: 0;
  color: var(--extra-heading);
  font-size: 16px;
  font-weight: 900;
  line-height: 1.65;
  overflow-wrap: anywhere;
  transition: color .2s ease;
}

.fcl-extra-card:hover .fcl-extra-card-content h4 {
  color: var(--extra-blue);
}

.fcl-extra-match {
  margin: 12px 0 0;
  color: var(--extra-muted);
  font-size: 11px;
  font-weight: 800;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.fcl-extra-preview {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  margin: 16px 0 0;
  color: var(--extra-text);
  font-size: 12px;
  line-height: 2;
  overflow-wrap: anywhere;
}

.fcl-extra-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid var(--extra-border);
}

.fcl-extra-card-footer > span:first-child {
  color: var(--extra-blue);
  font-size: 12px;
  font-weight: 900;
}

.fcl-extra-card-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--extra-blue-soft);
  color: var(--extra-blue);
  transition: transform .2s ease;
}

.fcl-extra-card:hover .fcl-extra-card-arrow {
  transform: translateX(4px);
}

/* =========================================================
   MODAL
   ========================================================= */

.fcl-extra-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(2,6,23,.76);
  backdrop-filter: blur(9px);
  animation: fclExtraFade .2s ease both;
}

.fcl-extra-modal {
  display: flex;
  flex-direction: column;
  width: min(100%,760px);
  max-height: min(92dvh,900px);
  overflow: hidden;
  border: 1px solid var(--extra-border);
  border-radius: 18px;
  background: var(--extra-card);
  box-shadow: 0 35px 110px rgba(0,0,0,.35);
  animation: fclExtraModalEnter .25s ease both;
}

.fcl-extra-modal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 17px 25px;
  border-bottom: 1px solid var(--extra-border);
  background: var(--extra-secondary);
}

.fcl-extra-modal-reference {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.fcl-extra-modal-reference span {
  color: var(--extra-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .11em;
}

.fcl-extra-modal-reference strong {
  color: var(--extra-blue);
  font-size: 10px;
  font-weight: 950;
}

.fcl-extra-modal-close {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 37px;
  height: 37px;
  flex-shrink: 0;
  border: 1px solid var(--extra-border);
  border-radius: 9px;
  background: var(--extra-card);
  color: var(--extra-heading);
  transition: all .2s ease;
}

.fcl-extra-modal-close:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.fcl-extra-modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 30px;
  scrollbar-width: thin;
  scrollbar-color: var(--extra-border) transparent;
}

.fcl-extra-modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.fcl-extra-modal-heading {
  margin-top: 26px;
}

.fcl-extra-modal-heading h2 {
  margin: 13px 0 0;
  color: var(--extra-heading);
  font-size: clamp(23px,3vw,34px);
  font-weight: 950;
  letter-spacing: -.035em;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.fcl-extra-modal-player {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 23px;
}

.fcl-extra-modal-player-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 11px;
  border: 1px solid rgba(24,119,242,.23);
  background: var(--extra-blue-soft);
  color: var(--extra-blue);
  font-size: 19px;
  font-weight: 950;
}

.fcl-extra-modal-player > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fcl-extra-modal-player > div:last-child span {
  color: var(--extra-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .1em;
}

.fcl-extra-modal-player > div:last-child strong {
  color: var(--extra-heading);
  font-size: 14px;
  font-weight: 900;
}

.fcl-extra-modal-match {
  margin-top: 27px;
  padding: 18px 20px;
  border-left: 3px solid var(--extra-blue);
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
  margin-top: 9px;
  color: var(--extra-heading);
  font-size: 13px;
  font-weight: 850;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.fcl-extra-modal-story {
  margin-top: 30px;
  border: 1px solid var(--extra-border);
  border-radius: 12px;
  background: var(--extra-secondary);
  overflow: hidden;
}

.fcl-extra-story-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 17px 21px;
  border-bottom: 1px solid var(--extra-border);
}

.fcl-extra-story-heading span {
  color: var(--extra-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .1em;
}

.fcl-extra-story-content {
  padding: 24px;
  color: var(--extra-text);
  font-size: 13px;
  line-height: 2.1;
  overflow-wrap: anywhere;
}

.fcl-extra-paragraph {
  margin: 0;
  line-height: inherit;
}

.fcl-extra-paragraph + .fcl-extra-paragraph {
  margin-top: 12px;
}

.fcl-extra-paragraph-gap {
  height: 14px;
}

.fcl-extra-dialogue {
  padding: 10px 13px;
  border-left: 2px solid rgba(24,119,242,.4);
  background: var(--extra-blue-soft);
  border-radius: 0 6px 6px 0;
}

.fcl-extra-speaker {
  color: var(--extra-blue);
  font-weight: 900;
}

.fcl-extra-highlight {
  color: #d97706;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(245,158,11,.09);
  font-weight: 850;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.fcl-extra-dark .fcl-extra-highlight {
  color: #fbbf24;
}

.fcl-extra-highlight.strong {
  font-weight: 950;
  background: rgba(245,158,11,.14);
}

.fcl-extra-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 19px 25px;
  border-top: 1px solid var(--extra-border);
  background: var(--extra-secondary);
}

.fcl-extra-modal-footer > span:first-child {
  color: var(--extra-subtle);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .09em;
}

.fcl-extra-facebook-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 17px;
  border-radius: 9px;
  color: white;
  background: var(--extra-blue);
  font-size: 11px;
  font-weight: 900;
  text-decoration: none;
  transition: all .2s ease;
}

.fcl-extra-facebook-button:hover {
  background: #0866dc;
  transform: translateY(-2px);
}

.fcl-extra-no-link {
  color: var(--extra-muted);
  font-size: 11px;
}

/* =========================================================
   LOAD MORE
   ========================================================= */

.fcl-extra-load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 54px;
}

.fcl-extra-load-more p {
  color: var(--extra-muted);
  font-size: 12px;
}

.fcl-extra-load-more p strong {
  color: var(--extra-heading);
}

.fcl-extra-progress {
  width: min(100%,260px);
  height: 4px;
  margin: 14px 0 25px;
  border-radius: 10px;
  background: var(--extra-border);
  overflow: hidden;
}

.fcl-extra-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    #1877F2,
    #22d3ee
  );
  transition: width .25s ease;
}

.fcl-extra-load-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  min-height: 45px;
  padding: 12px 23px;
  border: 1px solid var(--extra-blue);
  border-radius: 9px;
  background: var(--extra-blue);
  color: white;
  font-size: 12px;
  font-weight: 900;
  transition: all .2s ease;
}

.fcl-extra-load-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 9px 22px rgba(24,119,242,.2);
}

.fcl-extra-show-all {
  margin-top: 14px;
  padding: 10px;
  border: 0;
  background: transparent;
  color: var(--extra-muted);
  font-size: 11px;
  font-weight: 850;
}

.fcl-extra-show-all:hover {
  color: var(--extra-blue);
}

/* =========================================================
   ERROR / EMPTY / LOADING
   ========================================================= */

.fcl-extra-error {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 25px;
  padding: 21px 23px;
  border: 1px solid rgba(239,68,68,.23);
  border-radius: 12px;
  background: rgba(239,68,68,.06);
}

.fcl-extra-error strong {
  color: #ef4444;
  font-size: 13px;
  font-weight: 900;
}

.fcl-extra-error p {
  margin: 7px 0 0;
  color: var(--extra-text);
  font-size: 12px;
  line-height: 1.8;
}

.fcl-extra-error button {
  flex-shrink: 0;
  padding: 10px 14px;
  border: 1px solid rgba(239,68,68,.25);
  border-radius: 8px;
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
  min-height: 320px;
  padding: 45px 25px;
  border: 1px dashed var(--extra-border);
  border-radius: 16px;
  background: var(--extra-secondary);
  text-align: center;
}

.fcl-extra-empty-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  border: 1px solid rgba(24,119,242,.25);
  background: var(--extra-blue-soft);
  color: var(--extra-blue);
  font-size: 22px;
  font-weight: 950;
  letter-spacing: -.09em;
}

.fcl-extra-empty h3 {
  margin: 23px 0 0;
  color: var(--extra-heading);
  font-size: 19px;
  font-weight: 950;
}

.fcl-extra-empty p {
  max-width: 440px;
  margin: 12px 0 22px;
  color: var(--extra-muted);
  font-size: 13px;
  line-height: 1.9;
}

.fcl-extra-skeleton-card {
  min-height: 340px;
  padding: 26px;
  border: 1px solid var(--extra-border);
  border-radius: 15px;
  background: var(--extra-card);
}

.fcl-extra-skeleton {
  border-radius: 7px;
  background: linear-gradient(
    90deg,
    var(--extra-secondary) 20%,
    var(--extra-raised) 50%,
    var(--extra-secondary) 80%
  );
  background-size: 200% 100%;
  animation: fclExtraSkeleton 1.5s ease infinite;
}

.fcl-extra-skeleton.badge {
  width: 90px;
  height: 28px;
}

.fcl-extra-skeleton.name {
  width: 60%;
  height: 28px;
  margin-top: 60px;
}

.fcl-extra-skeleton.title {
  width: 85%;
  height: 24px;
  margin-top: 37px;
}

.fcl-extra-skeleton.line {
  width: 95%;
  height: 13px;
  margin-top: 18px;
}

.fcl-extra-skeleton.line.short {
  width: 65%;
}

/* =========================================================
   BOTTOM CTA
   ========================================================= */

.fcl-extra-bottom {
  padding-bottom: 90px;
  background: var(--extra-bg);
}

.fcl-extra-bottom-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  overflow: hidden;
  padding: 55px 60px;
  border: 1px solid var(--extra-border);
  border-radius: 19px;
  background: var(--extra-secondary);
}

.fcl-extra-bottom-card::before {
  content: "";
  position: absolute;
  top: -170px;
  right: -140px;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  background: rgba(24,119,242,.1);
  filter: blur(90px);
}

.fcl-extra-bottom-content {
  position: relative;
  z-index: 1;
  max-width: 610px;
}

.fcl-extra-bottom-content h2 {
  margin: 16px 0;
  color: var(--extra-heading);
  font-size: clamp(28px,3.5vw,43px);
  font-weight: 950;
  letter-spacing: -.04em;
  line-height: 1.45;
}

.fcl-extra-bottom-content h2 span {
  color: var(--extra-blue);
}

.fcl-extra-bottom-content p {
  margin: 0;
  color: var(--extra-muted);
  font-size: 13px;
  line-height: 2.1;
}

.fcl-extra-bottom-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.fcl-extra-bottom-emblem {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 190px;
  height: 190px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid rgba(24,119,242,.25);
  background: var(--extra-blue-soft);
}

.fcl-extra-bottom-emblem span {
  color: var(--extra-blue);
  font-size: 48px;
  font-weight: 950;
  letter-spacing: -.1em;
}

.fcl-extra-bottom-emblem strong {
  margin-top: 6px;
  color: var(--extra-heading);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .15em;
}

.fcl-extra-bottom-emblem small {
  margin-top: 9px;
  color: var(--extra-muted);
  font-size: 9px;
  font-weight: 800;
}

/* =========================================================
   FOOTER
   ========================================================= */

.fcl-extra-footer {
  background: var(--extra-secondary);
  border-top: 1px solid var(--extra-border);
}

.fcl-extra-footer-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  padding: 35px 0;
}

.fcl-extra-footer-top strong {
  color: var(--extra-heading);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .09em;
}

.fcl-extra-footer-top p {
  margin: 8px 0 0;
  color: var(--extra-muted);
  font-size: 12px;
}

.fcl-extra-footer-top a {
  color: var(--extra-blue);
  font-size: 12px;
  font-weight: 900;
  text-decoration: none;
}

.fcl-extra-footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid var(--extra-border);
  color: var(--extra-subtle);
  font-size: 11px;
}

/* =========================================================
   ANIMATION
   ========================================================= */

@keyframes fclExtraFade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fclExtraModalEnter {
  from {
    opacity: 0;
    transform: translateY(12px) scale(.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fclExtraSkeleton {
  to {
    background-position-x: -200%;
  }
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 1050px) {

  .fcl-extra-hero-inner {
    gap: 35px;
  }

  .fcl-extra-visual-orbit {
    width: 270px;
    height: 270px;
  }

  .fcl-extra-visual-inner {
    width: 180px;
    height: 180px;
  }

  .fcl-extra-visual-inner span {
    font-size: 55px;
  }
}

@media (max-width: 850px) {

  .fcl-extra-hero-inner {
    grid-template-columns: 1fr;
    padding: 75px 0;
  }

  .fcl-extra-hero-visual {
    display: none;
  }

  .fcl-extra-stats {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }

  .fcl-extra-stat {
    padding: 26px 20px;
  }

  .fcl-extra-stat + .fcl-extra-stat {
    padding-left: 20px;
  }

  .fcl-extra-stat:nth-child(3) {
    border-left: 0;
    border-top: 1px solid var(--extra-border);
  }

  .fcl-extra-stat:nth-child(4) {
    border-top: 1px solid var(--extra-border);
  }

  .fcl-extra-filter-grid {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }

  .fcl-extra-search {
    grid-column: 1 / -1;
  }

  .fcl-extra-collection {
    padding: 65px 0 80px;
  }

  .fcl-extra-bottom-card {
    padding: 45px;
  }

  .fcl-extra-bottom-emblem {
    width: 145px;
    height: 145px;
  }

  .fcl-extra-bottom-emblem span {
    font-size: 37px;
  }
}

@media (max-width: 640px) {

  .fcl-extra-container {
    width: min(100% - 28px,1200px);
  }

  .fcl-extra-hero-inner {
    padding: 60px 0 66px;
  }

  .fcl-extra-hero-label {
    font-size: 9px;
  }

  .fcl-extra-hero-content h1 {
    font-size: clamp(34px,8.5vw,46px);
    line-height: 1.18;
  }

  .fcl-extra-hero-content > p {
    font-size: 12px;
    line-height: 2;
    margin-top: 22px;
  }

  .fcl-extra-hero-actions {
    margin-top: 27px;
    gap: 10px;
  }

  .fcl-extra-primary-button,
  .fcl-extra-outline-button {
    min-height: 43px;
    padding: 11px 15px;
    font-size: 11px;
  }

  .fcl-extra-hero-est {
    margin-top: 38px;
    font-size: 9px;
  }

  .fcl-extra-stat {
    padding: 23px 12px 23px 0;
  }

  .fcl-extra-stat + .fcl-extra-stat {
    padding-left: 15px;
  }

  .fcl-extra-stat > span {
    font-size: 8px;
    letter-spacing: .07em;
  }

  .fcl-extra-stat strong {
    font-size: 28px;
  }

  .fcl-extra-stat p {
    font-size: 11px;
  }

  .fcl-extra-collection {
    padding: 50px 0 65px;
  }

  .fcl-extra-section-header {
    display: block;
    margin-bottom: 24px;
  }

  .fcl-extra-section-header h2 {
    font-size: 27px;
  }

  .fcl-extra-section-header p {
    font-size: 12px;
  }

  .fcl-extra-header-right {
    margin-top: 15px;
  }

  .fcl-extra-filter-panel {
    padding: 17px;
    border-radius: 13px;
  }

  .fcl-extra-filter-heading strong {
    font-size: 12px;
  }

  .fcl-extra-filter-grid {
    gap: 13px;
  }

  .fcl-extra-search input,
  .fcl-extra-select-field select {
    font-size: 11px;
  }

  .fcl-extra-select-field label {
    font-size: 9px;
  }

  .fcl-extra-results {
    margin-top: 45px;
  }

  .fcl-extra-results-heading h3 {
    font-size: 19px;
  }

  .fcl-extra-grid {
    grid-template-columns: 1fr;
    gap: 17px;
  }

  .fcl-extra-card {
    min-height: 315px;
    padding: 22px;
  }

  .fcl-extra-card-content {
    padding-top: 28px;
  }

  .fcl-extra-card-content h3 {
    font-size: 22px;
  }

  .fcl-extra-card-content h4 {
    font-size: 15px;
  }

  .fcl-extra-modal-backdrop {
    padding: 10px;
    align-items: center;
  }

  .fcl-extra-modal {
    max-height: 94dvh;
    border-radius: 13px;
  }

  .fcl-extra-modal-top {
    padding: 14px 16px;
  }

  .fcl-extra-modal-reference span {
    font-size: 8px;
  }

  .fcl-extra-modal-body {
    padding: 21px 18px;
  }

  .fcl-extra-modal-heading h2 {
    font-size: 24px;
  }

  .fcl-extra-modal-story {
    margin-top: 25px;
  }

  .fcl-extra-story-heading {
    padding: 15px;
  }

  .fcl-extra-story-content {
    padding: 18px;
    font-size: 12px;
    line-height: 2.05;
  }

  .fcl-extra-modal-footer {
    gap: 12px;
    padding: 15px 16px;
  }

  .fcl-extra-modal-footer > span:first-child {
    display: none;
  }

  .fcl-extra-facebook-button {
    width: 100%;
  }

  .fcl-extra-error {
    flex-direction: column;
    align-items: stretch;
  }

  .fcl-extra-error button {
    width: fit-content;
  }

  .fcl-extra-bottom {
    padding-bottom: 55px;
  }

  .fcl-extra-bottom-card {
    padding: 30px 24px;
  }

  .fcl-extra-bottom-content h2 {
    font-size: 28px;
  }

  .fcl-extra-bottom-content p {
    font-size: 12px;
  }

  .fcl-extra-bottom-emblem {
    display: none;
  }

  .fcl-extra-footer-top {
    align-items: flex-start;
  }

  .fcl-extra-footer-top strong {
    font-size: 10px;
  }

  .fcl-extra-footer-top a {
    flex-shrink: 0;
    font-size: 11px;
  }

  .fcl-extra-footer-bottom {
    flex-direction: column;
    gap: 8px;
    font-size: 10px;
  }
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */

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