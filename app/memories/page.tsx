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
   FCL MEMORY BOOK
   PREMIUM INTERACTIVE ARCHIVE
   2016 EDITION

   Desktop: Library + Interactive Book
   Mobile: Native App Inspired Reader

   No external dependencies
   ========================================================= */

/* =========================================================
   TYPES
   ========================================================= */

interface Memory {
  id: number;
  category: string;
  title: string;
  author: string;
  date: string;
  fbPostUrl: string;
  content: string;
  isSeries?: boolean;
  seriesName?: string;
  episodeNo?: number | string;
  summary?: string;
}

interface SeriesEpisode {
  series_name?: string;
  episode_title?: string;
  episode_no?: number | string;
  Author?: string;
  publish_date?: string;
  facebook_link?: string;
  Content?: string;
  summary?: string;
  status?: string;
}

interface SeriesGroup {
  name: string;
  author: string;
  status: string;
  episodes: SeriesEpisode[];
  latestDate: string;
}

type ArchiveMode = "memories" | "series" | "episodes";

type SortMode = "newest" | "oldest" | "az" | "za";

type ReaderItem = {
  key: string;
  title: string;
  author: string;
  date: string;
  category: string;
  content: string;
  summary: string;
  url: string;
  number?: string;
};

const LIST_PAGE_SIZE = 30;

/* =========================================================
   HELPERS
   ========================================================= */

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function validUrl(url: string): boolean {
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

function getEpisodeNumber(value: unknown): number {
  const normalized = normalize(value);

  const english = normalized.replace(
    /[০-৯]/g,
    (digit) =>
      String("০১২৩৪৫৬৭৮৯".indexOf(digit))
  );

  const number = Number(english);

  return Number.isFinite(number) ? number : 0;
}

function dateValue(value: string): number {
  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
}

function formatDate(value: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  return value;
}

function excerpt(text: string, length = 95): string {
  const cleaned = normalize(text)
    .replace(/[*#_]/g, "")
    .replace(/\s+/g, " ");

  if (cleaned.length <= length) {
    return cleaned;
  }

  return `${cleaned.slice(0, length).trim()}…`;
}

function getTone(category: string): string {
  const value = category.toLowerCase();

  if (
    value.includes("স্মৃতি") ||
    value.includes("memory")
  ) {
    return "gold";
  }

  if (
    value.includes("গান") ||
    value.includes("song")
  ) {
    return "pink";
  }

  if (
    value.includes("কবিতা") ||
    value.includes("poem")
  ) {
    return "cyan";
  }

  if (
    value.includes("গল্প") ||
    value.includes("story")
  ) {
    return "green";
  }

  if (
    value.includes("সিরিজ") ||
    value.includes("নাটক") ||
    value.includes("series")
  ) {
    return "purple";
  }

  return "blue";
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

  if (html.classList.contains("dark")) {
    return true;
  }

  if (html.classList.contains("light")) {
    return false;
  }

  if (body.classList.contains("dark")) {
    return true;
  }

  if (body.classList.contains("light")) {
    return false;
  }

  if (html.style.colorScheme === "dark") {
    return true;
  }

  if (html.style.colorScheme === "light") {
    return false;
  }

  try {
    const stored = localStorage.getItem("theme");

    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {
    // Storage unavailable.
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
}

function useIsDark() {
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

      media.removeEventListener?.(
        "change",
        update
      );

      window.removeEventListener(
        "storage",
        update
      );
    };
  }, []);

  return isDark;
}

/* =========================================================
   ICON SYSTEM
   ========================================================= */

type IconName =
  | "search"
  | "arrow"
  | "left"
  | "right"
  | "close"
  | "book"
  | "list"
  | "sort"
  | "copy"
  | "external"
  | "home"
  | "plus"
  | "minus"
  | "check"
  | "refresh"
  | "layers"
  | "sparkles";

function Icon({
  name,
  size = 18,
}: {
  name: IconName;
  size?: number;
}) {
  const paths: Record<IconName, ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    left: (
      <>
        <path d="M19 12H5" />
        <path d="m11 18-6-6 6-6" />
      </>
    ),

    right: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    close: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),

    book: (
      <>
        <path d="M12 7v14" />
        <path d="M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2h-3a4 4 0 0 0-4 4 4 4 0 0 0-4-4H5a2 2 0 0 0-2 2Z" />
      </>
    ),

    list: (
      <>
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="M3 6h.01" />
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
      </>
    ),

    sort: (
      <>
        <path d="M4 7h16" />
        <path d="M7 12h10" />
        <path d="M10 17h4" />
      </>
    ),

    copy: (
      <>
        <rect
          x="8"
          y="8"
          width="12"
          height="12"
          rx="2"
        />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),

    external: (
      <>
        <path d="M14 4h6v6" />
        <path d="M10 14 20 4" />
        <path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5" />
      </>
    ),

    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9" />
        <path d="M9 21v-7h6v7" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    minus: <path d="M5 12h14" />,

    check: <path d="m5 12 4 4L19 6" />,

    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14-5L4 8" />
        <path d="M4 4v4h4" />
        <path d="M4 13a8 8 0 0 0 14 5l2-2" />
        <path d="M20 20v-4h-4" />
      </>
    ),

    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 16 9 5 9-5" />
      </>
    ),

    sparkles: (
      <>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="m19 17 .7 1.3L21 19l-1.3.7L19 21l-.7-1.3L17 19l1.3-.7L19 17Z" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

/* =========================================================
   CONTENT FORMATTING
   ========================================================= */

function renderInline(text: string): ReactNode {
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
          className="fcl-book-highlight"
          key={index}
        >
          {part.slice(2, -2).trim()}
        </strong>
      );
    }

    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      part.length >= 2
    ) {
      return (
        <strong
          className="fcl-book-highlight"
          key={index}
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

function FormattedStory({
  content,
  category,
}: {
  content: string;
  category: string;
}) {
  const lines = useMemo(() => {
    const cleaned = normalize(content)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(
        /^সারসংক্ষেপ:\s*[^\n]*(?:\n|$)/i,
        ""
      );

    return cleaned.split("\n");
  }, [content]);

  if (!normalize(content)) {
    return (
      <div className="fcl-book-empty-content">
        <Icon name="book" size={30} />

        <p>
          এই লেখার মূল বিষয়বস্তু এখনো
          সংরক্ষিত হয়নি।
        </p>
      </div>
    );
  }

  const isDrama =
    /নাটক|drama|সিরিজ|series/i.test(
      category
    );

  return (
    <div className="fcl-book-story">
      {lines.map((line, index) => {
        const text = line.trim();

        if (!text) {
          return (
            <div
              key={index}
              className="fcl-book-space"
              aria-hidden="true"
            />
          );
        }

        const heading =
          /^(?:[০-৯\d]{1,2}\.|পর্ব\s*[০-৯\d]+|দৃশ্য\s*[০-৯\d]+|Part\s*\d+|Scene\s*\d+)/i.test(
            text
          );

        if (heading && text.length < 90) {
          return (
            <h4
              key={index}
              className="fcl-book-story-heading"
            >
              {renderInline(text)}
            </h4>
          );
        }

        const dialogue = isDrama
          ? text.match(
              /^([^:\n]{1,50}):\s+(.+)$/
            )
          : null;

        if (dialogue) {
          return (
            <p
              key={index}
              className="fcl-book-dialogue"
            >
              <strong>
                {dialogue[1]}:
              </strong>{" "}
              {renderInline(dialogue[2])}
            </p>
          );
        }

        return (
          <p
            key={index}
            className="fcl-book-paragraph"
          >
            {renderInline(text)}
          </p>
        );
      })}
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function CategoryBadge({
  category,
}: {
  category: string;
}) {
  return (
    <span
      className={`fcl-book-category tone-${getTone(
        category
      )}`}
    >
      <span className="fcl-book-dot" />

      {category || "আর্কাইভ"}
    </span>
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
    <div className="fcl-book-empty">
      <div className="fcl-book-empty-icon">
        <Icon name="book" size={27} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {onReset && (
        <button
          type="button"
          className="fcl-book-primary"
          onClick={onReset}
        >
          সব স্মৃতি দেখুন

          <Icon name="arrow" />
        </button>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="fcl-book-loading"
      aria-busy="true"
      aria-label="Loading archive"
    >
      <div className="fcl-book-loading-side">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <div
              key={index}
              className="fcl-book-loading-item"
            >
              <span className="fcl-book-skeleton" />

              <div>
                <span className="fcl-book-skeleton" />
                <span className="fcl-book-skeleton" />
              </div>
            </div>
          )
        )}
      </div>

      <div className="fcl-book-loading-main">
        <span className="fcl-book-skeleton" />

        <span className="fcl-book-skeleton" />

        <span className="fcl-book-skeleton" />

        <span className="fcl-book-skeleton" />

        <span className="fcl-book-skeleton" />
      </div>
    </div>
  );
}

/* =========================================================
   LIBRARY LIST ITEM
   ========================================================= */

function LibraryItem({
  item,
  index,
  active,
  onClick,
}: {
  item: ReaderItem;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`fcl-library-item ${
        active ? "active" : ""
      }`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="fcl-library-item-number">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="fcl-library-item-main">
        <span className="fcl-library-item-category">
          {item.category}
        </span>

        <strong>{item.title}</strong>

        <small>
          {item.author || "অজানা লেখক"}
          {item.date
            ? ` · ${formatDate(item.date)}`
            : ""}
        </small>

        <span className="fcl-library-item-preview">
          {excerpt(
            item.summary || item.content,
            85
          )}
        </span>
      </span>

      <span className="fcl-library-item-arrow">
        <Icon name="right" size={16} />
      </span>
    </button>
  );
}

/* =========================================================
   PREMIUM READER
   ========================================================= */

function BookReader({
  item,
  index,
  total,
  fontSize,
  progress,
  copied,
  onPrevious,
  onNext,
  onFontIncrease,
  onFontDecrease,
  onCopy,
  onProgress,
  onMobileClose,
  mobileOpen,
}: {
  item: ReaderItem;
  index: number;
  total: number;
  fontSize: number;
  progress: number;
  copied: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFontIncrease: () => void;
  onFontDecrease: () => void;
  onCopy: () => void;
  onProgress: (value: number) => void;
  onMobileClose: () => void;
  mobileOpen: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const pageNumber = String(
    index + 1
  ).padStart(2, "0");

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    container.scrollTop = 0;

    onProgress(0);
  }, [item.key, onProgress]);

  const handleScroll = () => {
    const element = scrollRef.current;

    if (!element) return;

    const scrollable =
      element.scrollHeight -
      element.clientHeight;

    if (scrollable <= 0) {
      onProgress(100);
      return;
    }

    const nextProgress = Math.min(
      100,
      Math.round(
        (element.scrollTop / scrollable) *
          100
      )
    );

    onProgress(nextProgress);
  };

  return (
    <section
      className={`fcl-book-reader ${
        mobileOpen ? "mobile-open" : ""
      }`}
      aria-label="Memory reader"
    >
      {/* READER TOP BAR */}

      <div className="fcl-reader-toolbar">
        <div className="fcl-reader-toolbar-left">
          <button
            type="button"
            className="fcl-reader-mobile-back"
            onClick={onMobileClose}
            aria-label="স্মৃতির তালিকায় ফিরে যান"
          >
            <Icon name="left" size={20} />
          </button>

          <div className="fcl-reader-toolbar-brand">
            <span className="fcl-reader-brand-icon">
              <Icon name="book" size={17} />
            </span>

            <div>
              <strong>FCL MEMORY BOOK</strong>

              <small>
                THE DIGITAL ARCHIVE
              </small>
            </div>
          </div>
        </div>

        <div className="fcl-reader-toolbar-right">
          <span className="fcl-reader-page-count">
            {pageNumber}
            <span> / {total}</span>
          </span>

          <button
            type="button"
            className="fcl-reader-icon-button"
            onClick={onFontDecrease}
            disabled={fontSize <= 13}
            aria-label="লেখা ছোট করুন"
            title="লেখা ছোট করুন"
          >
            <Icon name="minus" size={16} />
          </button>

          <button
            type="button"
            className="fcl-reader-icon-button"
            onClick={onFontIncrease}
            disabled={fontSize >= 22}
            aria-label="লেখা বড় করুন"
            title="লেখা বড় করুন"
          >
            <Icon name="plus" size={16} />
          </button>

          <button
            type="button"
            className="fcl-reader-mobile-close"
            onClick={onMobileClose}
            aria-label="রিডার বন্ধ করুন"
          >
            <Icon name="close" size={19} />
          </button>
        </div>
      </div>

      {/* BOOK BODY */}

      <div className="fcl-reader-book-shell">
        <div className="fcl-reader-book-spine" />

        <div
          key={item.key}
          className="fcl-reader-page-motion"
        >
          <div
            className="fcl-reader-scroll"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            <div className="fcl-reader-paper">
              <div className="fcl-reader-paper-top">
                <CategoryBadge
                  category={item.category}
                />

                <span>
                  FCL / {pageNumber}
                </span>
              </div>

              <div className="fcl-reader-title-section">
                <span className="fcl-reader-chapter">
                  {item.number
                    ? `EPISODE ${item.number}`
                    : "A PAGE FROM OUR HISTORY"}
                </span>

                <h2>{item.title}</h2>

                <div className="fcl-reader-author-row">
                  <span>
                    ✦{" "}
                    {item.author ||
                      "অজানা লেখক"}
                  </span>

                  {item.date && (
                    <span>
                      {formatDate(item.date)}
                    </span>
                  )}
                </div>
              </div>

              <div className="fcl-reader-ornament">
                <span />
                <strong>✦</strong>
                <span />
              </div>

              {item.summary && (
                <div className="fcl-reader-summary">
                  <span>
                    ✧ সারসংক্ষেপ
                  </span>

                  <p>
                    {renderInline(item.summary)}
                  </p>
                </div>
              )}

              <div
                className="fcl-reader-story-content"
                style={
                  {
                    "--reader-font-size": `${fontSize}px`,
                  } as CSSProperties
                }
              >
                <FormattedStory
                  content={item.content}
                  category={item.category}
                />
              </div>

              <div className="fcl-reader-story-end">
                <span>✦</span>

                <p>
                  একটি স্মৃতি, একটি ইতিহাস।
                </p>

                <small>
                  FACEBOOK CRICKET LEAGUE
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* READING PROGRESS */}

      <div className="fcl-reader-progress">
        <span
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* READER FOOTER */}

      <div className="fcl-reader-footer">
        <div className="fcl-reader-navigation">
          <button
            type="button"
            onClick={onPrevious}
            disabled={index === 0}
            className="fcl-reader-nav-button"
          >
            <Icon name="left" size={17} />

            <span>আগের পাতা</span>
          </button>

          <span className="fcl-reader-navigation-center">
            {index + 1} / {total}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={index >= total - 1}
            className="fcl-reader-nav-button next"
          >
            <span>পরের পাতা</span>

            <Icon name="right" size={17} />
          </button>
        </div>

        <div className="fcl-reader-actions">
          {validUrl(item.url) ? (
            <>
              <button
                type="button"
                onClick={onCopy}
                className="fcl-reader-action-button"
              >
                <Icon
                  name={
                    copied ? "check" : "copy"
                  }
                  size={15}
                />

                <span>
                  {copied
                    ? "কপি হয়েছে"
                    : "লিংক কপি"}
                </span>
              </button>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="fcl-reader-original-link"
              >
                মূল পোস্ট

                <Icon
                  name="external"
                  size={15}
                />
              </a>
            </>
          ) : (
            <span className="fcl-reader-archive-label">
              সংরক্ষিত আর্কাইভ
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function MemoriesPage() {
  const isDark = useIsDark();

  /* =======================================================
     STATE
     ======================================================= */

  const [memories, setMemories] = useState<
    Memory[]
  >([]);

  const [seriesData, setSeriesData] =
    useState<SeriesEpisode[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [sortMode, setSortMode] =
    useState<SortMode>("newest");

  const [selectedSeriesName, setSelectedSeriesName] =
    useState<string | null>(null);

  const [selectedItemKey, setSelectedItemKey] =
    useState<string | null>(null);

  const [visibleCount, setVisibleCount] =
    useState(LIST_PAGE_SIZE);

  const [mobileReaderOpen, setMobileReaderOpen] =
    useState(false);

  const [fontSize, setFontSize] =
    useState(16);

  const [readingProgress, setReadingProgress] =
    useState(0);

  const [copiedKey, setCopiedKey] =
    useState<string | null>(null);

  const [listExpanded, setListExpanded] =
    useState(false);

  const contentRef = useRef<HTMLElement | null>(
    null
  );

  const listRef = useRef<HTMLDivElement | null>(
    null
  );

  const copyTimerRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  /* =======================================================
     FETCH DATA
     ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    let active = true;

    async function loadArchive() {
      setLoading(true);
      setError(null);

      try {
        const results =
          await Promise.allSettled([
            fetch("/api/fcl-memories", {
              signal: controller.signal,
            }),

            fetch("/api/fcl-series", {
              signal: controller.signal,
            }),
          ]);

        let loadedMemories: Memory[] = [];

        let loadedSeries: SeriesEpisode[] = [];

        let memoriesFailed = false;
        let seriesFailed = false;

        const memoriesResult = results[0];

        if (
          memoriesResult.status === "fulfilled" &&
          memoriesResult.value.ok
        ) {
          try {
            const data =
              await memoriesResult.value.json();

            const raw = Array.isArray(data)
              ? data
              : Array.isArray(data?.memories)
                ? data.memories
                : [];

            loadedMemories = raw.map(
              (
                item: Partial<Memory>,
                index: number
              ) => ({
                id:
                  Number(item.id) ||
                  index + 1,

                category: normalize(
                  item.category
                ),

                title: normalize(
                  item.title
                ),

                author: normalize(
                  item.author
                ),

                date: normalize(
                  item.date
                ),

                fbPostUrl: normalize(
                  item.fbPostUrl
                ),

                content: normalize(
                  item.content
                ),

                summary: normalize(
                  item.summary
                ),

                isSeries: item.isSeries,

                seriesName: normalize(
                  item.seriesName
                ),

                episodeNo: item.episodeNo,
              })
            );
          } catch {
            memoriesFailed = true;
          }
        } else {
          memoriesFailed = true;
        }

        const seriesResult = results[1];

        if (
          seriesResult.status === "fulfilled" &&
          seriesResult.value.ok
        ) {
          try {
            const data =
              await seriesResult.value.json();

            const raw = Array.isArray(data)
              ? data
              : Array.isArray(data?.series)
                ? data.series
                : [];

            loadedSeries = raw.map(
              (item: SeriesEpisode) => ({
                ...item,

                series_name: normalize(
                  item.series_name
                ),

                episode_title: normalize(
                  item.episode_title
                ),

                Author: normalize(
                  item.Author
                ),

                publish_date: normalize(
                  item.publish_date
                ),

                facebook_link: normalize(
                  item.facebook_link
                ),

                Content: normalize(
                  item.Content
                ),

                summary: normalize(
                  item.summary
                ),

                status: normalize(
                  item.status
                ),
              })
            );
          } catch {
            seriesFailed = true;
          }
        } else {
          seriesFailed = true;
        }

        if (!active) return;

        setMemories(loadedMemories);

        setSeriesData(loadedSeries);

        if (memoriesFailed && seriesFailed) {
          setError(
            "আর্কাইভের তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।"
          );
        } else if (
          memoriesFailed ||
          seriesFailed
        ) {
          setError(
            "আর্কাইভের কিছু তথ্য লোড করা যায়নি।"
          );
        }
      } catch (err) {
        if (!active) return;

        console.error(
          "FCL Archive error:",
          err
        );

        setError(
          "আর্কাইভ লোড করতে সমস্যা হয়েছে।"
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadArchive();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshKey]);

  /* =======================================================
     SERIES GROUPING
     ======================================================= */

  const seriesGroups = useMemo<
    SeriesGroup[]
  >(() => {
    const groups = new Map<
      string,
      SeriesEpisode[]
    >();

    for (const episode of seriesData) {
      const name =
        normalize(episode.series_name) ||
        "ধারাবাহিক গল্প";

      const existing =
        groups.get(name) || [];

      existing.push(episode);

      groups.set(name, existing);
    }

    return Array.from(
      groups.entries()
    ).map(([name, episodes]) => {
      const sorted = [...episodes].sort(
        (a, b) =>
          getEpisodeNumber(a.episode_no) -
          getEpisodeNumber(b.episode_no)
      );

      return {
        name,

        episodes: sorted,

        author:
          sorted.find(
            (item) => item.Author
          )?.Author || "Unknown",

        status:
          sorted.find(
            (item) => item.status
          )?.status || "Running",

        latestDate:
          [...sorted].sort(
            (a, b) =>
              dateValue(
                normalize(b.publish_date)
              ) -
              dateValue(
                normalize(a.publish_date)
              )
          )[0]?.publish_date || "",
      };
    });
  }, [seriesData]);

  /* =======================================================
     CATEGORIES
     ======================================================= */

  const categories = useMemo(() => {
    const values = new Set<string>();

    memories.forEach((item) => {
      const category = normalize(
        item.category
      );

      if (category) {
        values.add(category);
      }
    });

    if (seriesGroups.length > 0) {
      values.add("ধারাবাহিক সিরিজ");
    }

    return [
      "All",
      ...Array.from(values),
    ];
  }, [memories, seriesGroups.length]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    counts.set(
      "All",
      memories.length + seriesData.length
    );

    categories.forEach((category) => {
      if (category === "All") return;

      if (category === "ধারাবাহিক সিরিজ") {
        counts.set(
          category,
          seriesGroups.length
        );

        return;
      }

      counts.set(
        category,
        memories.filter(
          (item) =>
            item.category === category
        ).length
      );
    });

    return counts;
  }, [
    categories,
    memories,
    seriesData.length,
    seriesGroups.length,
  ]);

  /* =======================================================
     CURRENT MODE
     ======================================================= */

  const mode: ArchiveMode =
    selectedCategory === "ধারাবাহিক সিরিজ"
      ? selectedSeriesName
        ? "episodes"
        : "series"
      : "memories";

  const currentSeries = useMemo(
    () =>
      seriesGroups.find(
        (series) =>
          series.name === selectedSeriesName
      ),
    [seriesGroups, selectedSeriesName]
  );

  /* =======================================================
     FILTER / SORT
     ======================================================= */

  const query = searchQuery
    .trim()
    .toLowerCase();

  const filteredMemories = useMemo(() => {
    const regular = memories.filter(
      (item) => {
        if (
          selectedCategory !== "All" &&
          item.category !== selectedCategory
        ) {
          return false;
        }

        if (!query) return true;

        return [
          item.title,
          item.author,
          item.category,
          item.content,
          item.summary,
          item.seriesName,
        ].some((value) =>
          normalize(value)
            .toLowerCase()
            .includes(query)
        );
      }
    );

    const extraSeries: Memory[] =
      selectedCategory === "All"
        ? seriesData.map(
            (item, index) => ({
              id: 900000 + index,

              category: "ধারাবাহিক সিরিজ",

              title: `${
                item.series_name || "সিরিজ"
              } — ${
                item.episode_title ||
                `পর্ব ${item.episode_no || 1}`
              }`,

              author:
                item.Author || "Unknown",

              date:
                item.publish_date || "",

              fbPostUrl:
                item.facebook_link || "",

              content:
                item.Content || "",

              summary:
                item.summary || "",

              isSeries: true,

              seriesName:
                item.series_name,

              episodeNo:
                item.episode_no,
            })
          )
        : [];

    const matchingSeries =
      extraSeries.filter((item) => {
        if (!query) return true;

        return [
          item.title,
          item.author,
          item.category,
          item.content,
          item.summary,
          item.seriesName,
        ].some((value) =>
          normalize(value)
            .toLowerCase()
            .includes(query)
        );
      });

    const combined = [
      ...regular,
      ...matchingSeries,
    ];

    return combined.sort((a, b) => {
      if (sortMode === "newest") {
        return (
          dateValue(b.date) -
          dateValue(a.date)
        );
      }

      if (sortMode === "oldest") {
        return (
          dateValue(a.date) -
          dateValue(b.date)
        );
      }

      if (sortMode === "az") {
        return a.title.localeCompare(
          b.title,
          "bn"
        );
      }

      return b.title.localeCompare(
        a.title,
        "bn"
      );
    });
  }, [
    memories,
    seriesData,
    selectedCategory,
    query,
    sortMode,
  ]);

  const filteredSeries = useMemo(() => {
    const filtered = seriesGroups.filter(
      (series) => {
        if (!query) return true;

        const basicMatch = [
          series.name,
          series.author,
          series.status,
        ].some((value) =>
          normalize(value)
            .toLowerCase()
            .includes(query)
        );

        const episodeMatch =
          series.episodes.some(
            (episode) =>
              [
                episode.episode_title,
                episode.Author,
                episode.Content,
                episode.summary,
                episode.episode_no,
              ].some((value) =>
                normalize(value)
                  .toLowerCase()
                  .includes(query)
              )
          );

        return (
          basicMatch || episodeMatch
        );
      }
    );

    return filtered.sort((a, b) => {
      if (sortMode === "newest") {
        return (
          dateValue(b.latestDate) -
          dateValue(a.latestDate)
        );
      }

      if (sortMode === "oldest") {
        return (
          dateValue(a.latestDate) -
          dateValue(b.latestDate)
        );
      }

      if (sortMode === "az") {
        return a.name.localeCompare(
          b.name,
          "bn"
        );
      }

      return b.name.localeCompare(
        a.name,
        "bn"
      );
    });
  }, [
    seriesGroups,
    query,
    sortMode,
  ]);

  /* =======================================================
     READER ITEMS
     ======================================================= */

  const readerItems = useMemo<
    ReaderItem[]
  >(() => {
    if (mode === "episodes") {
      return (
        currentSeries?.episodes || []
      ).map((episode, index) => ({
        key: `episode-${currentSeries?.name}-${index}`,

        title:
          normalize(
            episode.episode_title
          ) ||
          `পর্ব ${
            episode.episode_no || index + 1
          }`,

        author:
          normalize(episode.Author) ||
          currentSeries?.author ||
          "Unknown",

        date: normalize(
          episode.publish_date
        ),

        category: "ধারাবাহিক সিরিজ",

        content: normalize(
          episode.Content
        ),

        summary: normalize(
          episode.summary
        ),

        url: normalize(
          episode.facebook_link
        ),

        number: normalize(
          episode.episode_no ||
            index + 1
        ),
      }));
    }

    if (mode === "series") {
      return [];
    }

    return filteredMemories.map(
      (memory, index) => ({
        key: `memory-${memory.id}-${index}`,

        title:
          memory.title ||
          "শিরোনামহীন স্মৃতি",

        author:
          memory.author ||
          "Unknown",

        date: memory.date,

        category:
          memory.category ||
          "আর্কাইভ",

        content: memory.content,

        summary:
          memory.summary || "",

        url: memory.fbPostUrl,

        number: memory.isSeries
          ? normalize(
              memory.episodeNo
            )
          : undefined,
      })
    );
  }, [
    mode,
    currentSeries,
    filteredMemories,
  ]);

  /* =======================================================
     ACTIVE ITEM
     ======================================================= */

  const activeIndex = useMemo(() => {
    if (!readerItems.length) return -1;

    const found = readerItems.findIndex(
      (item) =>
        item.key === selectedItemKey
    );

    return found >= 0 ? found : 0;
  }, [
    readerItems,
    selectedItemKey,
  ]);

  const activeItem =
    activeIndex >= 0
      ? readerItems[activeIndex]
      : null;

  const visibleItems = readerItems.slice(
    0,
    visibleCount
  );

  const hasMore =
    visibleCount <
    readerItems.length;

  /* =======================================================
     ACTIONS
     ======================================================= */

  const scrollToContent = useCallback(
    () => {
      requestAnimationFrame(() => {
        contentRef.current?.scrollIntoView({
          behavior: window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth",

          block: "start",
        });
      });
    },
    []
  );

  const resetSelection = () => {
    setSelectedItemKey(null);

    setVisibleCount(LIST_PAGE_SIZE);

    setReadingProgress(0);

    setMobileReaderOpen(false);

    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  };

  const changeCategory = (
    category: string
  ) => {
    setSelectedCategory(category);

    setSelectedSeriesName(null);

    setSearchQuery("");

    resetSelection();
  };

  const openSeries = (
    name: string
  ) => {
    setSelectedSeriesName(name);

    setSelectedItemKey(null);

    setSearchQuery("");

    setVisibleCount(
      LIST_PAGE_SIZE
    );

    setMobileReaderOpen(false);

    setReadingProgress(0);

    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  };

  const closeSeries = () => {
    setSelectedSeriesName(null);

    resetSelection();
  };

  const selectItem = (
    key: string
  ) => {
    setSelectedItemKey(key);

    setReadingProgress(0);

    setMobileReaderOpen(true);
  };

  const changeReaderPage = (
    direction: number
  ) => {
    if (activeIndex < 0) return;

    const next = Math.max(
      0,
      Math.min(
        readerItems.length - 1,
        activeIndex + direction
      )
    );

    const nextItem =
      readerItems[next];

    if (!nextItem) return;

    setSelectedItemKey(
      nextItem.key
    );

    setReadingProgress(0);

    setVisibleCount(
      (previous) =>
        Math.max(
          previous,
          next + 1
        )
    );
  };

  const handleCopy = async () => {
    if (
      !activeItem ||
      !validUrl(activeItem.url)
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        activeItem.url
      );

      setCopiedKey(
        activeItem.key
      );

      if (copyTimerRef.current) {
        clearTimeout(
          copyTimerRef.current
        );
      }

      copyTimerRef.current =
        setTimeout(() => {
          setCopiedKey(null);
        }, 2000);
    } catch (err) {
      console.error(
        "Copy failed:",
        err
      );
    }
  };

  const resetFilters = () => {
    setSelectedCategory("All");

    setSelectedSeriesName(null);

    setSearchQuery("");

    setSortMode("newest");

    resetSelection();
  };

  const handleRetry = () => {
    setRefreshKey(
      (previous) => previous + 1
    );
  };

  const handleSearch = (
    value: string
  ) => {
    setSearchQuery(value);

    resetSelection();
  };

  const handleSort = (
    value: SortMode
  ) => {
    setSortMode(value);

    resetSelection();
  };

  /* =======================================================
     EFFECTS
     ======================================================= */

  useEffect(() => {
    if (!mobileReaderOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setMobileReaderOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [mobileReaderOpen]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(
          copyTimerRef.current
        );
      }
    };
  }, []);

  const updateProgress = useCallback(
    (value: number) => {
      setReadingProgress(value);
    },
    []
  );

  /* =======================================================
     THEME VARIABLES
     ======================================================= */

  const themeStyle = {
    colorScheme: isDark
      ? "dark"
      : "light",

    "--mem-bg": isDark
      ? "#020617"
      : "#ffffff",

    "--mem-secondary": isDark
      ? "#071020"
      : "#f8fafc",

    "--mem-card": isDark
      ? "#0b1220"
      : "#ffffff",

    "--mem-card-raised": isDark
      ? "#0f172a"
      : "#f1f5f9",

    "--mem-heading": isDark
      ? "#f8fafc"
      : "#0f172a",

    "--mem-text": isDark
      ? "#cbd5e1"
      : "#334155",

    "--mem-muted": isDark
      ? "#94a3b8"
      : "#64748b",

    "--mem-subtle": isDark
      ? "#64748b"
      : "#94a3b8",

    "--mem-border": isDark
      ? "#1e293b"
      : "#e2e8f0",

    "--mem-blue": "#1877F2",

    "--mem-gold": "#f59e0b",

    "--mem-blue-soft": isDark
      ? "rgba(24,119,242,.12)"
      : "rgba(24,119,242,.07)",

    "--mem-book-paper": isDark
      ? "#101827"
      : "#fffdf8",

    "--mem-book-ink": isDark
      ? "#d8dee9"
      : "#344054",

    "--mem-book-line": isDark
      ? "#253044"
      : "#eee8dc",

    "--mem-shadow": isDark
      ? "0 18px 55px rgba(0,0,0,.22)"
      : "0 16px 45px rgba(15,23,42,.07)",
  } as CSSProperties;

  /* =======================================================
     COUNTS
     ======================================================= */

  const totalRegular =
    memories.filter(
      (item) => !item.isSeries
    ).length;

  const totalEpisodes =
    seriesData.length;

  const resultCount =
    mode === "series"
      ? filteredSeries.length
      : readerItems.length;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className={`fcl-memory-book-page ${
        isDark
          ? "fcl-memory-dark"
          : "fcl-memory-light"
      }`}
      style={themeStyle}
    >
      {/* ===================================================
          COMPACT PREMIUM HERO
          =================================================== */}

      <header className="fcl-book-hero">
        <div className="fcl-book-hero-grid" />

        <div className="fcl-book-hero-glow glow-one" />

        <div className="fcl-book-hero-glow glow-two" />

        <div className="fcl-book-hero-square square-one" />

        <div className="fcl-book-hero-square square-two" />

        <div className="fcl-book-hero-square square-three" />

        <div className="fcl-book-container">
          <div className="fcl-book-hero-layout">
            <div className="fcl-book-hero-content">
              <div className="fcl-book-hero-eyebrow">
                <span className="fcl-book-live-dot" />

                FCL DIGITAL MEMORY ARCHIVE
              </div>

              <h1>
                স্মৃতির পাতায়
                <span>
                  Facebook Cricket League
                </span>
              </h1>

              <p>
                বন্ধুত্ব, আবেগ, গল্প, কবিতা
                আর অসংখ্য স্মরণীয় মুহূর্ত।
                ফিরে দেখুন FCL-এর
                ভালোবাসায় লেখা ইতিহাস।
              </p>

              <div className="fcl-book-hero-actions">
                <button
                  type="button"
                  onClick={scrollToContent}
                  className="fcl-book-primary"
                >
                  <Icon
                    name="book"
                    size={17}
                  />

                  স্মৃতির বই খুলুন

                  <Icon
                    name="arrow"
                    size={16}
                  />
                </button>

                <Link
                  href="/"
                  className="fcl-book-secondary"
                >
                  <Icon
                    name="home"
                    size={16}
                  />

                  FCL হোম
                </Link>
              </div>
            </div>

            <div className="fcl-book-hero-art">
              <div className="fcl-book-art-orbit orbit-one" />

              <div className="fcl-book-art-orbit orbit-two" />

              <div className="fcl-book-art-main">
                <div className="fcl-book-art-page page-back" />

                <div className="fcl-book-art-page page-middle" />

                <div className="fcl-book-art-cover">
                  <span>
                    THE FCL ARCHIVE
                  </span>

                  <strong>FCL</strong>

                  <div className="fcl-book-art-line" />

                  <b>2013</b>

                  <small>
                    MEMORIES FOREVER
                  </small>
                </div>
              </div>

              <div className="fcl-book-art-caption">
                EVERY STORY MATTERS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================
          COMPACT STATS
          =================================================== */}

      <section className="fcl-book-stats-section">
        <div className="fcl-book-container">
          <div className="fcl-book-stats">
            <div className="fcl-book-stat">
              <span className="fcl-book-stat-icon">
                <Icon
                  name="book"
                  size={17}
                />
              </span>

              <div>
                <strong>
                  {loading
                    ? "—"
                    : totalRegular}
                </strong>

                <span>সংরক্ষিত লেখা</span>
              </div>
            </div>

            <div className="fcl-book-stat">
              <span className="fcl-book-stat-icon">
                <Icon
                  name="layers"
                  size={17}
                />
              </span>

              <div>
                <strong>
                  {loading
                    ? "—"
                    : seriesGroups.length}
                </strong>

                <span>সাহিত্য সিরিজ</span>
              </div>
            </div>

            <div className="fcl-book-stat">
              <span className="fcl-book-stat-icon">
                <Icon
                  name="list"
                  size={17}
                />
              </span>

              <div>
                <strong>
                  {loading
                    ? "—"
                    : totalEpisodes}
                </strong>

                <span>প্রকাশিত পর্ব</span>
              </div>
            </div>

            <div className="fcl-book-stat">
              <span className="fcl-book-stat-icon">
                <Icon
                  name="sparkles"
                  size={17}
                />
              </span>

              <div>
                <strong>2013</strong>

                <span>FCL প্রতিষ্ঠা</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          ARCHIVE WORKSPACE
          =================================================== */}

      <section
        ref={contentRef}
        id="fcl-memory-workspace"
        className="fcl-book-workspace-section"
      >
        <div className="fcl-book-container">
          {/* SECTION HEADER */}

          <div className="fcl-book-section-heading">
            <div>
              <span className="fcl-book-section-eyebrow">
                ✦ EXPLORE THE ARCHIVE
              </span>

              <h2>
                স্মৃতি ও সাহিত্য সংগ্রহ
              </h2>
            </div>

            <div className="fcl-book-section-right">
              <span className="fcl-book-count-badge">
                {loading
                  ? "..."
                  : resultCount}

                <small>
                  {mode === "series"
                    ? "SERIES"
                    : "ENTRIES"}
                </small>
              </span>
            </div>
          </div>

          {/* =================================================
              FILTER BAR
              ================================================= */}

          <div className="fcl-book-filter-panel">
            <div className="fcl-book-category-scroll">
              {categories.map(
                (category) => {
                  const active =
                    selectedCategory ===
                    category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        changeCategory(category)
                      }
                      className={`fcl-book-category-tab ${
                        active
                          ? "active"
                          : ""
                      }`}
                      aria-pressed={active}
                    >
                      {category === "All"
                        ? "সব স্মৃতি"
                        : category}

                      <small>
                        {categoryCounts.get(
                          category
                        ) || 0}
                      </small>
                    </button>
                  );
                }
              )}
            </div>

            <div className="fcl-book-filter-bottom">
              <div className="fcl-book-search">
                <Icon
                  name="search"
                  size={18}
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    handleSearch(
                      event.target.value
                    )
                  }
                  disabled={
                    mode === "episodes"
                  }
                  placeholder={
                    mode === "series"
                      ? "সিরিজ বা লেখক খুঁজুন..."
                      : mode === "episodes"
                        ? "সিরিজের পর্বসমূহ"
                        : "স্মৃতি, গল্প, লেখক খুঁজুন..."
                  }
                  aria-label="Search archive"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSearch("")
                    }
                    aria-label="Clear search"
                  >
                    <Icon
                      name="close"
                      size={15}
                    />
                  </button>
                )}
              </div>

              <div className="fcl-book-sort">
                <Icon
                  name="sort"
                  size={17}
                />

                <select
                  value={sortMode}
                  onChange={(event) =>
                    handleSort(
                      event.target
                        .value as SortMode
                    )
                  }
                  aria-label="Sort archive"
                  disabled={
                    mode === "episodes"
                  }
                >
                  <option value="newest">
                    নতুন আগে
                  </option>

                  <option value="oldest">
                    পুরোনো আগে
                  </option>

                  <option value="az">
                    নাম A–Z
                  </option>

                  <option value="za">
                    নাম Z–A
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* ERROR */}

          {error && !loading && (
            <div
              className="fcl-book-error"
              role="alert"
            >
              <div>
                <strong>
                  আর্কাইভ নোটিশ
                </strong>

                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={handleRetry}
              >
                <Icon
                  name="refresh"
                  size={15}
                />

                আবার চেষ্টা
              </button>
            </div>
          )}

          {/* =================================================
              LOADING
              ================================================= */}

          {loading ? (
            <LoadingState />
          ) : mode === "series" ? (
            /* ===============================================
               SERIES COLLECTIONS
               =============================================== */

            <div className="fcl-book-series-area">
              <div className="fcl-book-area-heading">
                <div>
                  <span>
                    SERIALISED COLLECTION
                  </span>

                  <h3>
                    ধারাবাহিক সিরিজসমূহ
                  </h3>
                </div>

                <small>
                  {filteredSeries.length} টি সিরিজ
                </small>
              </div>

              {filteredSeries.length ===
              0 ? (
                <EmptyState
                  title="কোনো সিরিজ পাওয়া যায়নি"
                  description="অন্য শব্দ দিয়ে খুঁজুন অথবা ফিল্টার পরিবর্তন করুন।"
                  onReset={resetFilters}
                />
              ) : (
                <div className="fcl-book-series-grid">
                  {filteredSeries.map(
                    (series, index) => {
                      const completed =
                        /complete|completed|শেষ|সমাপ্ত/i.test(
                          series.status
                        );

                      return (
                        <button
                          key={series.name}
                          type="button"
                          className="fcl-book-series-card"
                          onClick={() =>
                            openSeries(
                              series.name
                            )
                          }
                        >
                          <div className="fcl-book-series-top">
                            <span>
                              SERIES{" "}
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <span
                              className={`fcl-book-series-status ${
                                completed
                                  ? "completed"
                                  : ""
                              }`}
                            >
                              <span />

                              {series.status}
                            </span>
                          </div>

                          <div className="fcl-book-series-symbol">
                            <Icon
                              name="book"
                              size={23}
                            />

                            <strong>
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </strong>
                          </div>

                          <h3>
                            {series.name}
                          </h3>

                          <p>
                            {series.author}
                          </p>

                          <div className="fcl-book-series-footer">
                            <span>
                              {
                                series
                                  .episodes
                                  .length
                              }{" "}
                              টি পর্ব
                            </span>

                            <span>
                              পড়ুন

                              <Icon
                                name="arrow"
                                size={16}
                              />
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ===============================================
               INTERACTIVE BOOK WORKSPACE
               =============================================== */

            <div className="fcl-book-main-area">
              {/* SERIES BREADCRUMB */}

              {mode === "episodes" &&
                currentSeries && (
                  <div className="fcl-book-series-breadcrumb">
                    <button
                      type="button"
                      onClick={closeSeries}
                    >
                      <Icon
                        name="left"
                        size={16}
                      />

                      সকল সিরিজ
                    </button>

                    <span>/</span>

                    <strong>
                      {currentSeries.name}
                    </strong>

                    <small>
                      {
                        currentSeries
                          .episodes.length
                      }{" "}
                      পর্ব
                    </small>
                  </div>
                )}

              {readerItems.length ===
              0 ? (
                <EmptyState
                  title="কোনো স্মৃতি পাওয়া যায়নি"
                  description="আপনার অনুসন্ধানের সঙ্গে কোনো লেখা মেলেনি। অন্য শব্দ দিয়ে চেষ্টা করুন।"
                  onReset={resetFilters}
                />
              ) : (
                <div className="fcl-book-workspace">
                  {/* =========================================
                      LIBRARY SIDEBAR
                      ========================================= */}

                  <aside className="fcl-book-library">
                    <div className="fcl-library-header">
                      <div>
                        <span>
                          {mode === "episodes"
                            ? "EPISODE LIBRARY"
                            : "MEMORY LIBRARY"}
                        </span>

                        <h3>
                          {mode === "episodes"
                            ? "পর্বের তালিকা"
                            : "স্মৃতির তালিকা"}
                        </h3>
                      </div>

                      <span className="fcl-library-count">
                        {readerItems.length}
                      </span>
                    </div>

                    <div
                      ref={listRef}
                      className={`fcl-library-list ${
                        listExpanded
                          ? "expanded"
                          : ""
                      }`}
                    >
                      {visibleItems.map(
                        (item, index) => (
                          <LibraryItem
                            key={item.key}
                            item={item}
                            index={index}
                            active={
                              activeIndex ===
                              index
                            }
                            onClick={() =>
                              selectItem(
                                item.key
                              )
                            }
                          />
                        )
                      )}

                      {hasMore && (
                        <button
                          type="button"
                          className="fcl-library-load-more"
                          onClick={() =>
                            setVisibleCount(
                              (previous) =>
                                previous +
                                LIST_PAGE_SIZE
                            )
                          }
                        >
                          আরও স্মৃতি দেখুন

                          <Icon
                            name="plus"
                            size={16}
                          />
                        </button>
                      )}
                    </div>

                    <div className="fcl-library-footer">
                      <span>
                        <Icon
                          name="book"
                          size={15}
                        />

                        FCL ARCHIVE
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setListExpanded(
                            (previous) =>
                              !previous
                          )
                        }
                      >
                        {listExpanded
                          ? "কমপ্যাক্ট"
                          : "তালিকা বড় করুন"}
                      </button>
                    </div>
                  </aside>

                  {/* =========================================
                      BOOK READER
                      ========================================= */}

                  {activeItem && (
                    <BookReader
                      item={activeItem}
                      index={activeIndex}
                      total={
                        readerItems.length
                      }
                      fontSize={fontSize}
                      progress={
                        readingProgress
                      }
                      copied={
                        copiedKey ===
                        activeItem.key
                      }
                      onPrevious={() =>
                        changeReaderPage(
                          -1
                        )
                      }
                      onNext={() =>
                        changeReaderPage(
                          1
                        )
                      }
                      onFontIncrease={() =>
                        setFontSize(
                          (previous) =>
                            Math.min(
                              22,
                              previous + 1
                            )
                        )
                      }
                      onFontDecrease={() =>
                        setFontSize(
                          (previous) =>
                            Math.max(
                              13,
                              previous - 1
                            )
                        )
                      }
                      onCopy={
                        handleCopy
                      }
                      onProgress={
                        updateProgress
                      }
                      mobileOpen={
                        mobileReaderOpen
                      }
                      onMobileClose={() =>
                        setMobileReaderOpen(
                          false
                        )
                      }
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===============================================
              COMPACT ARCHIVE NOTE
              =============================================== */}

          <div className="fcl-book-bottom-note">
            <div>
              <span className="fcl-book-bottom-symbol">
                ✦
              </span>

              <p>
                কিছু গল্প শেষ হয় না,
                <strong>
                  {" "}
                  স্মৃতি হয়ে থেকে যায়।
                </strong>
              </p>
            </div>

            <Link href="/">
              FCL হোমপেজ

              <Icon
                name="arrow"
                size={16}
              />
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>
        {MEMORY_BOOK_STYLES}
      </style>
    </div>
  );
}

/* =========================================================
   PREMIUM MEMORY BOOK DESIGN SYSTEM
   ========================================================= */

const MEMORY_BOOK_STYLES = `

/* =========================================================
   ROOT
   ========================================================= */

.fcl-memory-book-page {
  min-height: 100vh;
  width: 100%;
  overflow-x: clip;

  background: var(--mem-bg);
  color: var(--mem-text);

  font-family: inherit;

  transition:
    background .25s ease,
    color .25s ease;
}

.fcl-memory-book-page *,
.fcl-memory-book-page *::before,
.fcl-memory-book-page *::after {
  box-sizing: border-box;
}

.fcl-memory-book-page button,
.fcl-memory-book-page input,
.fcl-memory-book-page select {
  font-family: inherit;
}

.fcl-memory-book-page button {
  cursor: pointer;
}

.fcl-memory-book-page button,
.fcl-memory-book-page a {
  -webkit-tap-highlight-color: transparent;
}

.fcl-memory-book-page button:disabled {
  cursor: not-allowed;
}

.fcl-memory-book-page button:focus-visible,
.fcl-memory-book-page a:focus-visible,
.fcl-memory-book-page input:focus-visible,
.fcl-memory-book-page select:focus-visible {
  outline: 2px solid #1877F2;
  outline-offset: 3px;
}

.fcl-memory-book-page ::selection {
  background: rgba(24,119,242,.25);
}

.fcl-book-container {
  width: min(100% - 36px, 1320px);
  margin-inline: auto;
}

/* =========================================================
   BUTTON SYSTEM
   ========================================================= */

.fcl-book-primary,
.fcl-book-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 9px;

  min-height: 43px;
  padding: 10px 17px;

  border-radius: 11px;

  font-size: 12px;
  font-weight: 850;

  text-decoration: none;

  transition:
    transform .22s ease,
    box-shadow .22s ease,
    background .22s ease,
    border-color .22s ease;
}

.fcl-book-primary {
  color: #ffffff;

  border: 1px solid #1877F2;

  background:
    linear-gradient(
      135deg,
      #1877F2,
      #0866dc
    );

  box-shadow:
    0 7px 22px rgba(24,119,242,.23);
}

.fcl-book-primary:hover {
  transform: translateY(-2px);

  box-shadow:
    0 11px 28px rgba(24,119,242,.3);
}

.fcl-book-secondary {
  color: var(--mem-heading);

  border: 1px solid var(--mem-border);

  background: var(--mem-card);
}

.fcl-book-secondary:hover {
  border-color: #1877F2;

  color: #1877F2;
}

/* =========================================================
   HERO BACKGROUND
   ========================================================= */

.fcl-book-hero {
  position: relative;

  overflow: hidden;

  background: var(--mem-secondary);

  border-bottom:
    1px solid var(--mem-border);
}

.fcl-book-hero-grid {
  position: absolute;
  inset: 0;

  pointer-events: none;

  opacity: .65;

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

  background-size: 48px 48px;

  mask-image:
    linear-gradient(
      90deg,
      transparent,
      black 17%,
      black 83%,
      transparent
    );
}

.fcl-book-hero-glow {
  position: absolute;

  border-radius: 50%;

  filter: blur(95px);

  pointer-events: none;
}

.fcl-book-hero-glow.glow-one {
  width: 410px;
  height: 410px;

  top: -220px;
  left: -130px;

  background:
    rgba(24,119,242,.15);
}

.fcl-book-hero-glow.glow-two {
  width: 380px;
  height: 380px;

  right: -130px;
  bottom: -220px;

  background:
    rgba(245,158,11,.12);
}

/* BLURRED SQUARE SHAPES */

.fcl-book-hero-square {
  position: absolute;

  border: 1px solid
    rgba(24,119,242,.17);

  background:
    linear-gradient(
      135deg,
      rgba(24,119,242,.08),
      transparent
    );

  backdrop-filter: blur(7px);

  transform: rotate(24deg);

  pointer-events: none;

  animation:
    fclBookFloat 9s ease-in-out infinite;
}

.fcl-book-hero-square.square-one {
  width: 100px;
  height: 100px;

  top: 16%;
  right: 11%;

  border-radius: 23px;
}

.fcl-book-hero-square.square-two {
  width: 55px;
  height: 55px;

  top: 64%;
  right: 31%;

  border-radius: 15px;

  animation-delay: -3s;
}

.fcl-book-hero-square.square-three {
  width: 40px;
  height: 40px;

  bottom: 12%;
  left: 7%;

  border-radius: 12px;

  animation-delay: -5s;
}

/* =========================================================
   HERO LAYOUT
   ========================================================= */

.fcl-book-hero-layout {
  position: relative;

  display: grid;

  grid-template-columns:
    minmax(0,1.35fr)
    minmax(220px,.65fr);

  align-items: center;

  gap: 32px;

  min-height: 300px;

  padding: 38px 0;
}

.fcl-book-hero-content {
  position: relative;
  z-index: 2;
}

.fcl-book-hero-eyebrow {
  display: inline-flex;
  align-items: center;

  gap: 10px;

  color: #1877F2;

  font-size: 10px;
  font-weight: 900;

  letter-spacing: .15em;
}

.fcl-book-live-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #1877F2;

  box-shadow:
    0 0 0 5px
    rgba(24,119,242,.11);

  animation:
    fclBookPulse 2.8s ease-in-out infinite;
}

.fcl-book-hero-content h1 {
  margin: 17px 0 0;

  color: var(--mem-heading);

  font-size:
    clamp(33px,4vw,55px);

  line-height: 1.24;

  font-weight: 950;

  letter-spacing: -.045em;
}

.fcl-book-hero-content h1 span {
  display: block;

  margin-top: 3px;

  font-size:
    clamp(26px,3.2vw,43px);

  background:
    linear-gradient(
      100deg,
      #1877F2,
      #3b82f6,
      #22d3ee
    );

  background-clip: text;
  -webkit-background-clip: text;

  color: transparent;
}

.fcl-book-hero-content > p {
  max-width: 570px;

  margin: 16px 0 0;

  color: var(--mem-muted);

  font-size: 13px;
  line-height: 1.9;
}

.fcl-book-hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 10px;

  margin-top: 22px;
}

/* =========================================================
   HERO BOOK ART
   ========================================================= */

.fcl-book-hero-art {
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  height: 235px;
}

.fcl-book-art-orbit {
  position: absolute;

  border-radius: 50%;

  border:
    1px dashed
    rgba(24,119,242,.19);
}

.fcl-book-art-orbit.orbit-one {
  width: 240px;
  height: 240px;

  animation:
    fclBookRotate 45s linear infinite;
}

.fcl-book-art-orbit.orbit-two {
  width: 195px;
  height: 195px;

  border-style: solid;

  opacity: .6;
}

.fcl-book-art-main {
  position: relative;

  width: 145px;
  height: 185px;

  perspective: 1000px;

  transform: rotate(-9deg);

  animation:
    fclBookFloat 7s ease-in-out infinite;
}

.fcl-book-art-page {
  position: absolute;

  inset: 0;

  border-radius: 6px 12px 12px 6px;

  border:
    1px solid rgba(24,119,242,.3);

  background:
    var(--mem-card);
}

.fcl-book-art-page.page-back {
  transform:
    translate(13px,7px)
    rotate(6deg);
}

.fcl-book-art-page.page-middle {
  transform:
    translate(7px,3px)
    rotate(3deg);
}

.fcl-book-art-cover {
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  border-radius:
    6px 12px 12px 6px;

  border:
    1px solid
    rgba(24,119,242,.5);

  background:
    linear-gradient(
      145deg,
      #122c52,
      #07152b 68%,
      #030a16
    );

  box-shadow:
    12px 17px 35px
    rgba(0,0,0,.24),
    inset 5px 0 8px
    rgba(255,255,255,.07);
}

.fcl-book-art-cover::before {
  content: "";

  position: absolute;

  inset: 9px;

  border:
    1px solid
    rgba(245,158,11,.35);

  border-radius: 4px;
}

.fcl-book-art-cover > span {
  color: #a8bddb;

  font-size: 7px;

  letter-spacing: .17em;

  font-weight: 900;
}

.fcl-book-art-cover > strong {
  margin-top: 15px;

  color: #ffffff;

  font-size: 47px;
  line-height: 1;

  font-weight: 950;

  letter-spacing: -.1em;
}

.fcl-book-art-line {
  width: 48px;
  height: 1px;

  margin: 14px 0 10px;

  background: #f59e0b;
}

.fcl-book-art-cover > b {
  color: #fbbf24;

  font-size: 14px;

  letter-spacing: .2em;
}

.fcl-book-art-cover > small {
  margin-top: 16px;

  color: #9db4d5;

  font-size: 6px;

  letter-spacing: .14em;

  font-weight: 900;
}

.fcl-book-art-caption {
  position: absolute;

  bottom: -6px;

  color: var(--mem-subtle);

  font-size: 8px;

  font-weight: 900;

  letter-spacing: .2em;
}

/* =========================================================
   COMPACT STATS
   ========================================================= */

.fcl-book-stats-section {
  background: var(--mem-bg);

  border-bottom:
    1px solid var(--mem-border);
}

.fcl-book-stats {
  display: grid;

  grid-template-columns:
    repeat(4,minmax(0,1fr));
}

.fcl-book-stat {
  display: flex;
  align-items: center;

  gap: 13px;

  padding: 17px 20px;

  min-width: 0;
}

.fcl-book-stat:first-child {
  padding-left: 0;
}

.fcl-book-stat + .fcl-book-stat {
  border-left:
    1px solid var(--mem-border);
}

.fcl-book-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 37px;
  height: 37px;

  flex-shrink: 0;

  border-radius: 11px;

  color: #1877F2;

  background:
    var(--mem-blue-soft);
}

.fcl-book-stat > div {
  min-width: 0;
}

.fcl-book-stat strong {
  display: block;

  color: var(--mem-heading);

  font-size: 23px;
  line-height: 1.1;

  font-weight: 950;
}

.fcl-book-stat div > span {
  display: block;

  margin-top: 5px;

  color: var(--mem-muted);

  font-size: 10px;

  font-weight: 700;
}

/* =========================================================
   WORKSPACE SECTION
   ========================================================= */

.fcl-book-workspace-section {
  padding: 28px 0 36px;

  background: var(--mem-bg);

  scroll-margin-top: 72px;
}

.fcl-book-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 18px;

  margin-bottom: 17px;
}

.fcl-book-section-eyebrow {
  color: #1877F2;

  font-size: 9px;

  font-weight: 950;

  letter-spacing: .16em;
}

.fcl-book-section-heading h2 {
  margin: 7px 0 0;

  color: var(--mem-heading);

  font-size:
    clamp(22px,2.5vw,29px);

  line-height: 1.4;

  font-weight: 950;

  letter-spacing: -.035em;
}

.fcl-book-count-badge {
  display: flex;
  align-items: baseline;

  gap: 6px;

  padding: 9px 13px;

  border-radius: 10px;

  border:
    1px solid var(--mem-border);

  background: var(--mem-card);

  color: var(--mem-heading);

  font-size: 18px;

  font-weight: 950;
}

.fcl-book-count-badge small {
  color: var(--mem-muted);

  font-size: 9px;

  font-weight: 900;

  letter-spacing: .06em;
}

/* =========================================================
   FILTER PANEL
   ========================================================= */

.fcl-book-filter-panel {
  position: relative;

  padding: 13px;

  border:
    1px solid var(--mem-border);

  border-radius: 15px;

  background: var(--mem-card);

  box-shadow: var(--mem-shadow);
}

.fcl-book-category-scroll {
  display: flex;

  gap: 8px;

  overflow-x: auto;

  padding: 2px 1px 11px;

  scrollbar-width: none;

  overscroll-behavior-x: contain;
}

.fcl-book-category-scroll::-webkit-scrollbar {
  display: none;
}

.fcl-book-category-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  gap: 8px;

  min-height: 36px;

  padding: 8px 12px;

  border:
    1px solid var(--mem-border);

  border-radius: 9px;

  background: var(--mem-secondary);

  color: var(--mem-muted);

  font-size: 11px;

  font-weight: 850;

  white-space: nowrap;

  transition:
    color .2s ease,
    background .2s ease,
    border-color .2s ease,
    transform .2s ease;
}

.fcl-book-category-tab:hover {
  color: #1877F2;

  border-color:
    rgba(24,119,242,.4);
}

.fcl-book-category-tab.active {
  color: #ffffff;

  border-color: #1877F2;

  background:
    linear-gradient(
      135deg,
      #1877F2,
      #0866dc
    );

  box-shadow:
    0 5px 13px
    rgba(24,119,242,.18);
}

.fcl-book-category-tab small {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 21px;
  height: 20px;

  padding: 0 5px;

  border-radius: 5px;

  color: inherit;

  background:
    rgba(100,116,139,.12);

  font-size: 9px;

  font-weight: 950;
}

.fcl-book-category-tab.active small {
  background:
    rgba(255,255,255,.2);
}

.fcl-book-filter-bottom {
  display: flex;
  align-items: center;

  gap: 10px;

  padding-top: 11px;

  border-top:
    1px solid var(--mem-border);
}

.fcl-book-search {
  position: relative;

  display: flex;
  align-items: center;

  flex: 1;

  min-width: 0;
}

.fcl-book-search > svg {
  position: absolute;

  left: 13px;

  color: var(--mem-muted);

  pointer-events: none;
}

.fcl-book-search input {
  width: 100%;

  min-height: 42px;

  padding: 10px 40px;

  border:
    1px solid var(--mem-border);

  border-radius: 9px;

  outline: none;

  background: var(--mem-secondary);

  color: var(--mem-heading);

  font-size: 12px;

  transition:
    border-color .2s ease;
}

.fcl-book-search input:focus {
  border-color: #1877F2;
}

.fcl-book-search input::placeholder {
  color: var(--mem-subtle);
}

.fcl-book-search input:disabled {
  opacity: .6;

  cursor: not-allowed;
}

.fcl-book-search > button {
  position: absolute;

  right: 8px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 27px;
  height: 27px;

  border: 0;

  border-radius: 7px;

  background: var(--mem-card-raised);

  color: var(--mem-muted);
}

.fcl-book-sort {
  position: relative;

  display: flex;
  align-items: center;

  flex-shrink: 0;
}

.fcl-book-sort > svg {
  position: absolute;

  left: 12px;

  color: #1877F2;

  pointer-events: none;
}

.fcl-book-sort select {
  min-height: 42px;

  padding:
    10px 27px 10px 37px;

  border:
    1px solid var(--mem-border);

  border-radius: 9px;

  background: var(--mem-secondary);

  color: var(--mem-heading);

  font-size: 11px;

  font-weight: 850;

  cursor: pointer;
}

/* =========================================================
   MAIN AREA
   ========================================================= */

.fcl-book-main-area {
  margin-top: 15px;
}

.fcl-book-workspace {
  display: grid;

  grid-template-columns:
    minmax(280px,.82fr)
    minmax(0,1.6fr);

  gap: 14px;

  height: 650px;

  min-height: 0;
}

/* =========================================================
   LIBRARY SIDEBAR
   ========================================================= */

.fcl-book-library {
  display: flex;
  flex-direction: column;

  min-width: 0;
  min-height: 0;

  overflow: hidden;

  border:
    1px solid var(--mem-border);

  border-radius: 16px;

  background: var(--mem-card);

  box-shadow: var(--mem-shadow);
}

.fcl-library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 17px 18px;

  border-bottom:
    1px solid var(--mem-border);
}

.fcl-library-header > div > span {
  color: #1877F2;

  font-size: 9px;

  font-weight: 950;

  letter-spacing: .13em;
}

.fcl-library-header h3 {
  margin: 5px 0 0;

  color: var(--mem-heading);

  font-size: 17px;

  font-weight: 950;
}

.fcl-library-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 35px;
  height: 35px;

  padding: 0 8px;

  border-radius: 10px;

  background: var(--mem-blue-soft);

  color: #1877F2;

  font-size: 13px;

  font-weight: 950;
}

.fcl-library-list {
  flex: 1;

  min-height: 0;

  overflow-y: auto;

  overscroll-behavior: contain;

  scrollbar-width: thin;

  scrollbar-color:
    var(--mem-border)
    transparent;
}

.fcl-library-item {
  position: relative;

  display: flex;
  align-items: flex-start;

  gap: 12px;

  width: 100%;

  padding: 15px 15px;

  border: 0;

  border-bottom:
    1px solid var(--mem-border);

  background: transparent;

  color: var(--mem-text);

  text-align: left;

  transition:
    background .2s ease;
}

.fcl-library-item:hover {
  background: var(--mem-secondary);
}

.fcl-library-item.active {
  background:
    var(--mem-blue-soft);
}

.fcl-library-item.active::before {
  content: "";

  position: absolute;

  left: 0;
  top: 0;
  bottom: 0;

  width: 3px;

  background: #1877F2;
}

.fcl-library-item-number {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 33px;
  height: 33px;

  flex-shrink: 0;

  border:
    1px solid var(--mem-border);

  border-radius: 9px;

  background: var(--mem-secondary);

  color: var(--mem-subtle);

  font-size: 11px;

  font-weight: 950;
}

.fcl-library-item.active
.fcl-library-item-number {
  color: #1877F2;

  border-color:
    rgba(24,119,242,.3);

  background: var(--mem-card);
}

.fcl-library-item-main {
  display: flex;
  flex-direction: column;

  min-width: 0;

  flex: 1;
}

.fcl-library-item-category {
  color: #1877F2;

  font-size: 9px;

  font-weight: 900;
}

.fcl-library-item-main > strong {
  display: -webkit-box;

  margin-top: 5px;

  color: var(--mem-heading);

  font-size: 13px;

  line-height: 1.55;

  font-weight: 900;

  overflow: hidden;

  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  overflow-wrap: anywhere;
}

.fcl-library-item-main > small {
  margin-top: 5px;

  color: var(--mem-muted);

  font-size: 10px;

  line-height: 1.5;

  overflow-wrap: anywhere;
}

.fcl-library-item-preview {
  display: -webkit-box;

  margin-top: 7px;

  color: var(--mem-subtle);

  font-size: 10px;

  line-height: 1.6;

  overflow: hidden;

  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.fcl-library-item-arrow {
  display: flex;
  align-items: center;
  justify-content: center;

  align-self: center;

  color: var(--mem-subtle);

  transition:
    transform .2s ease,
    color .2s ease;
}

.fcl-library-item:hover
.fcl-library-item-arrow {
  transform: translateX(3px);

  color: #1877F2;
}

.fcl-library-item.active
.fcl-library-item-arrow {
  color: #1877F2;
}

.fcl-library-load-more {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  width: calc(100% - 24px);

  margin: 12px;

  padding: 12px;

  border:
    1px dashed
    rgba(24,119,242,.35);

  border-radius: 9px;

  background: var(--mem-blue-soft);

  color: #1877F2;

  font-size: 11px;

  font-weight: 900;
}

.fcl-library-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 11px 15px;

  border-top:
    1px solid var(--mem-border);

  background: var(--mem-secondary);
}

.fcl-library-footer > span {
  display: inline-flex;
  align-items: center;

  gap: 7px;

  color: var(--mem-subtle);

  font-size: 9px;

  font-weight: 900;

  letter-spacing: .08em;
}

.fcl-library-footer button {
  padding: 5px;

  border: 0;

  background: transparent;

  color: #1877F2;

  font-size: 10px;

  font-weight: 850;
}

.fcl-library-list.expanded
.fcl-library-item {
  padding-block: 20px;
}

/* =========================================================
   READER ROOT
   ========================================================= */

.fcl-book-reader {
  display: flex;
  flex-direction: column;

  min-width: 0;
  min-height: 0;

  overflow: hidden;

  border:
    1px solid var(--mem-border);

  border-radius: 16px;

  background: var(--mem-card);

  box-shadow: var(--mem-shadow);
}

/* =========================================================
   READER TOOLBAR
   ========================================================= */

.fcl-reader-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  min-height: 61px;

  padding: 10px 16px;

  border-bottom:
    1px solid var(--mem-border);

  background: var(--mem-card);
}

.fcl-reader-toolbar-left,
.fcl-reader-toolbar-right {
  display: flex;
  align-items: center;

  gap: 9px;
}

.fcl-reader-toolbar-brand {
  display: flex;
  align-items: center;

  gap: 10px;
}

.fcl-reader-brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;

  border-radius: 10px;

  background:
    linear-gradient(
      135deg,
      #1877F2,
      #0755ba
    );

  color: white;
}

.fcl-reader-toolbar-brand strong {
  display: block;

  color: var(--mem-heading);

  font-size: 10px;

  font-weight: 950;

  letter-spacing: .06em;
}

.fcl-reader-toolbar-brand small {
  display: block;

  margin-top: 3px;

  color: var(--mem-subtle);

  font-size: 8px;

  font-weight: 900;

  letter-spacing: .12em;
}

.fcl-reader-page-count {
  margin-right: 5px;

  color: var(--mem-heading);

  font-size: 13px;

  font-weight: 950;

  white-space: nowrap;
}

.fcl-reader-page-count span {
  color: var(--mem-subtle);
}

.fcl-reader-icon-button,
.fcl-reader-mobile-back,
.fcl-reader-mobile-close {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  border:
    1px solid var(--mem-border);

  border-radius: 9px;

  background: var(--mem-secondary);

  color: var(--mem-text);

  transition:
    color .2s ease,
    border-color .2s ease;
}

.fcl-reader-icon-button:hover {
  color: #1877F2;

  border-color:
    rgba(24,119,242,.4);
}

.fcl-reader-icon-button:disabled {
  opacity: .4;
}

.fcl-reader-mobile-back,
.fcl-reader-mobile-close {
  display: none;
}

/* =========================================================
   BOOK SHELL
   ========================================================= */

.fcl-reader-book-shell {
  position: relative;

  flex: 1;

  min-height: 0;

  padding: 11px;

  overflow: hidden;

  background:
    linear-gradient(
      135deg,
      var(--mem-secondary),
      var(--mem-card)
    );
}

.fcl-reader-book-spine {
  position: absolute;

  z-index: 2;

  left: 11px;
  top: 11px;
  bottom: 11px;

  width: 8px;

  pointer-events: none;

  background:
    linear-gradient(
      90deg,
      rgba(0,0,0,.12),
      rgba(255,255,255,.04),
      transparent
    );
}

.fcl-reader-page-motion {
  height: 100%;

  transform-origin: left center;

  animation:
    fclBookPageTurn .42s
    cubic-bezier(.2,.7,.2,1) both;
}

.fcl-reader-scroll {
  height: 100%;

  overflow-y: auto;

  overscroll-behavior: contain;

  border:
    1px solid var(--mem-book-line);

  border-radius: 8px;

  background: var(--mem-book-paper);

  scrollbar-width: thin;

  scrollbar-color:
    var(--mem-book-line)
    transparent;
}

.fcl-reader-paper {
  position: relative;

  min-height: 100%;

  padding: 30px 38px 40px;

  color: var(--mem-book-ink);

  background-image:
    linear-gradient(
      90deg,
      transparent,
      rgba(245,158,11,.012)
    );
}

/* =========================================================
   PAPER TOP
   ========================================================= */

.fcl-reader-paper-top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;
}

.fcl-reader-paper-top > span:last-child {
  color: var(--mem-subtle);

  font-size: 9px;

  font-weight: 900;

  letter-spacing: .12em;
}

.fcl-book-category {
  display: inline-flex;
  align-items: center;

  gap: 7px;

  max-width: 100%;

  padding: 6px 9px;

  border: 1px solid;

  border-radius: 7px;

  font-size: 10px;

  font-weight: 900;

  overflow-wrap: anywhere;
}

.fcl-book-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: currentColor;
}

.fcl-book-category.tone-blue {
  color: #3b82f6;

  background:
    rgba(24,119,242,.08);

  border-color:
    rgba(24,119,242,.2);
}

.fcl-book-category.tone-gold {
  color: #d97706;

  background:
    rgba(245,158,11,.08);

  border-color:
    rgba(245,158,11,.2);
}

.fcl-book-category.tone-pink {
  color: #ec4899;

  background:
    rgba(236,72,153,.07);

  border-color:
    rgba(236,72,153,.2);
}

.fcl-book-category.tone-green {
  color: #16a34a;

  background:
    rgba(34,197,94,.07);

  border-color:
    rgba(34,197,94,.2);
}

.fcl-book-category.tone-purple {
  color: #a855f7;

  background:
    rgba(168,85,247,.07);

  border-color:
    rgba(168,85,247,.2);
}

.fcl-book-category.tone-cyan {
  color: #0891b2;

  background:
    rgba(34,211,238,.07);

  border-color:
    rgba(34,211,238,.2);
}

/* =========================================================
   READER TITLE
   ========================================================= */

.fcl-reader-title-section {
  margin-top: 26px;

  text-align: center;
}

.fcl-reader-chapter {
  color: #b88637;

  font-size: 9px;

  font-weight: 950;

  letter-spacing: .17em;
}

.fcl-reader-title-section h2 {
  max-width: 650px;

  margin: 12px auto 0;

  color: var(--mem-heading);

  font-size:
    clamp(22px,2.3vw,29px);

  line-height: 1.5;

  font-weight: 950;

  letter-spacing: -.025em;

  overflow-wrap: anywhere;
}

.fcl-reader-author-row {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-wrap: wrap;

  gap: 7px 17px;

  margin-top: 13px;

  color: var(--mem-muted);

  font-size: 11px;

  font-weight: 750;
}

.fcl-reader-ornament {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 12px;

  margin: 24px 0;
}

.fcl-reader-ornament > span {
  width: 65px;
  height: 1px;

  background:
    var(--mem-book-line);
}

.fcl-reader-ornament > strong {
  color: #d6a24a;

  font-size: 13px;
}

/* =========================================================
   SUMMARY
   ========================================================= */

.fcl-reader-summary {
  margin-bottom: 24px;

  padding: 15px 18px;

  border-left:
    3px solid #d6a24a;

  border-radius: 0 8px 8px 0;

  background:
    rgba(245,158,11,.055);
}

.fcl-reader-summary > span {
  color: #d6a24a;

  font-size: 11px;

  font-weight: 950;
}

.fcl-reader-summary p {
  margin: 8px 0 0;

  color: var(--mem-book-ink);

  font-size: 12px;

  line-height: 1.95;

  overflow-wrap: anywhere;
}

/* =========================================================
   STORY TYPOGRAPHY
   ========================================================= */

.fcl-reader-story-content {
  color: var(--mem-book-ink);

  font-size:
    var(--reader-font-size,16px);

  line-height: 2.05;

  overflow-wrap: anywhere;
}

.fcl-book-story {
  min-width: 0;
}

.fcl-book-paragraph {
  margin: 0;

  line-height: inherit;

  color: inherit;
}

.fcl-book-paragraph +
.fcl-book-paragraph {
  margin-top: 10px;
}

.fcl-book-space {
  height: 15px;
}

.fcl-book-story-heading {
  margin: 23px 0 14px;

  padding-bottom: 10px;

  border-bottom:
    1px solid var(--mem-book-line);

  color: #1877F2;

  font-size: 1.03em;

  font-weight: 950;

  line-height: 1.6;
}

.fcl-book-dialogue {
  margin: 9px 0;

  padding: 9px 12px;

  border-left:
    2px solid
    rgba(24,119,242,.5);

  border-radius: 0 7px 7px 0;

  background:
    rgba(24,119,242,.055);

  line-height: inherit;
}

.fcl-book-dialogue strong {
  color: #1877F2;

  font-weight: 950;
}

.fcl-book-highlight {
  color: #d6a24a;

  font-weight: 950;

  background:
    rgba(245,158,11,.07);

  padding: 1px 3px;

  border-radius: 3px;

  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.fcl-book-empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 10px;

  min-height: 170px;

  color: var(--mem-muted);

  text-align: center;
}

.fcl-book-empty-content p {
  font-size: 12px;

  line-height: 1.8;
}

/* =========================================================
   STORY END
   ========================================================= */

.fcl-reader-story-end {
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 8px;

  margin-top: 45px;

  padding-top: 22px;

  border-top:
    1px solid var(--mem-book-line);

  text-align: center;
}

.fcl-reader-story-end > span {
  color: #d6a24a;

  font-size: 17px;
}

.fcl-reader-story-end p {
  margin: 0;

  color: var(--mem-muted);

  font-size: 12px;

  font-weight: 750;
}

.fcl-reader-story-end small {
  color: var(--mem-subtle);

  font-size: 8px;

  font-weight: 900;

  letter-spacing: .13em;
}

/* =========================================================
   READING PROGRESS
   ========================================================= */

.fcl-reader-progress {
  height: 3px;

  background: var(--mem-border);
}

.fcl-reader-progress > span {
  display: block;

  height: 100%;

  background:
    linear-gradient(
      90deg,
      #1877F2,
      #22d3ee
    );

  transition: width .12s linear;
}

/* =========================================================
   READER FOOTER
   ========================================================= */

.fcl-reader-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  min-height: 64px;

  padding: 10px 15px;

  border-top:
    1px solid var(--mem-border);

  background: var(--mem-card);
}

.fcl-reader-navigation {
  display: flex;
  align-items: center;

  gap: 8px;
}

.fcl-reader-nav-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  min-height: 36px;

  padding: 8px 11px;

  border:
    1px solid var(--mem-border);

  border-radius: 9px;

  background: var(--mem-secondary);

  color: var(--mem-heading);

  font-size: 11px;

  font-weight: 850;

  transition:
    background .2s ease,
    color .2s ease,
    border-color .2s ease;
}

.fcl-reader-nav-button:hover:not(:disabled) {
  border-color: #1877F2;

  color: #1877F2;
}

.fcl-reader-nav-button.next {
  background: #1877F2;

  border-color: #1877F2;

  color: white;
}

.fcl-reader-nav-button.next:hover:not(:disabled) {
  background: #0866dc;

  color: white;
}

.fcl-reader-nav-button:disabled {
  opacity: .4;
}

.fcl-reader-navigation-center {
  color: var(--mem-muted);

  font-size: 10px;

  font-weight: 850;

  white-space: nowrap;
}

.fcl-reader-actions {
  display: flex;
  align-items: center;

  gap: 8px;
}

.fcl-reader-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  min-height: 36px;

  padding: 8px 10px;

  border:
    1px solid var(--mem-border);

  border-radius: 9px;

  background: var(--mem-secondary);

  color: var(--mem-muted);

  font-size: 10px;

  font-weight: 850;
}

.fcl-reader-original-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  min-height: 36px;

  padding: 8px 11px;

  border:
    1px solid
    rgba(24,119,242,.2);

  border-radius: 9px;

  background: var(--mem-blue-soft);

  color: #1877F2;

  font-size: 10px;

  font-weight: 900;

  text-decoration: none;
}

.fcl-reader-archive-label {
  color: var(--mem-subtle);

  font-size: 10px;

  font-weight: 750;
}

/* =========================================================
   SERIES BREADCRUMB
   ========================================================= */

.fcl-book-series-breadcrumb {
  display: flex;
  align-items: center;

  flex-wrap: wrap;

  gap: 10px;

  margin-bottom: 12px;

  padding: 11px 14px;

  border:
    1px solid var(--mem-border);

  border-radius: 11px;

  background: var(--mem-card);
}

.fcl-book-series-breadcrumb button {
  display: inline-flex;
  align-items: center;

  gap: 7px;

  padding: 0;

  border: 0;

  background: transparent;

  color: #1877F2;

  font-size: 11px;

  font-weight: 900;
}

.fcl-book-series-breadcrumb > span {
  color: var(--mem-subtle);
}

.fcl-book-series-breadcrumb > strong {
  flex: 1;

  min-width: 0;

  color: var(--mem-heading);

  font-size: 12px;

  font-weight: 900;
}

.fcl-book-series-breadcrumb > small {
  color: var(--mem-muted);

  font-size: 10px;
}

/* =========================================================
   SERIES DIRECTORY
   ========================================================= */

.fcl-book-series-area {
  margin-top: 17px;
}

.fcl-book-area-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 15px;
}

.fcl-book-area-heading > div > span {
  color: #1877F2;

  font-size: 9px;

  font-weight: 950;

  letter-spacing: .13em;
}

.fcl-book-area-heading h3 {
  margin: 5px 0 0;

  color: var(--mem-heading);

  font-size: 20px;

  font-weight: 950;
}

.fcl-book-area-heading > small {
  color: var(--mem-muted);

  font-size: 11px;

  font-weight: 850;
}

.fcl-book-series-grid {
  display: grid;

  grid-template-columns:
    repeat(4,minmax(0,1fr));

  gap: 13px;
}

.fcl-book-series-card {
  position: relative;

  display: flex;
  flex-direction: column;

  min-width: 0;

  min-height: 225px;

  padding: 17px;

  overflow: hidden;

  border:
    1px solid var(--mem-border);

  border-radius: 14px;

  background: var(--mem-card);

  color: var(--mem-text);

  text-align: left;

  box-shadow: var(--mem-shadow);

  transition:
    transform .25s ease,
    border-color .25s ease,
    box-shadow .25s ease;
}

.fcl-book-series-card:hover {
  transform: translateY(-4px);

  border-color:
    rgba(24,119,242,.4);

  box-shadow:
    0 18px 35px
    rgba(24,119,242,.08);
}

.fcl-book-series-card::before {
  content: "";

  position: absolute;

  width: 160px;
  height: 160px;

  top: -90px;
  right: -70px;

  border-radius: 50%;

  background: var(--mem-blue-soft);

  filter: blur(30px);

  pointer-events: none;
}

.fcl-book-series-top {
  position: relative;

  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 7px;
}

.fcl-book-series-top > span:first-child {
  color: var(--mem-subtle);

  font-size: 9px;

  font-weight: 950;

  letter-spacing: .1em;
}

.fcl-book-series-status {
  display: inline-flex;
  align-items: center;

  gap: 5px;

  padding: 5px 7px;

  border-radius: 6px;

  color: #16a34a;

  background:
    rgba(34,197,94,.08);

  font-size: 9px;

  font-weight: 850;
}

.fcl-book-series-status.completed {
  color: #1877F2;

  background: var(--mem-blue-soft);
}

.fcl-book-series-status > span {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: currentColor;
}

.fcl-book-series-symbol {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 19px;

  padding-bottom: 10px;

  border-bottom:
    1px solid var(--mem-border);

  color: #1877F2;
}

.fcl-book-series-symbol strong {
  color: var(--mem-border);

  font-size: 29px;

  font-weight: 950;
}

.fcl-book-series-card h3 {
  position: relative;

  z-index: 1;

  display: -webkit-box;

  margin: 15px 0 7px;

  color: var(--mem-heading);

  font-size: 16px;

  line-height: 1.5;

  font-weight: 950;

  overflow: hidden;

  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  overflow-wrap: anywhere;
}

.fcl-book-series-card > p {
  position: relative;

  z-index: 1;

  margin: 0;

  color: var(--mem-muted);

  font-size: 11px;
}

.fcl-book-series-footer {
  position: relative;

  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  margin-top: auto;

  padding-top: 13px;
}

.fcl-book-series-footer > span:first-child {
  color: var(--mem-muted);

  font-size: 11px;

  font-weight: 850;
}

.fcl-book-series-footer > span:last-child {
  display: inline-flex;
  align-items: center;

  gap: 6px;

  color: #1877F2;

  font-size: 11px;

  font-weight: 950;
}

/* =========================================================
   ERROR
   ========================================================= */

.fcl-book-error {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  margin-top: 14px;

  padding: 13px 16px;

  border:
    1px solid
    rgba(239,68,68,.22);

  border-radius: 11px;

  background:
    rgba(239,68,68,.055);
}

.fcl-book-error strong {
  color: #ef4444;

  font-size: 12px;

  font-weight: 950;
}

.fcl-book-error p {
  margin: 4px 0 0;

  color: var(--mem-text);

  font-size: 11px;
}

.fcl-book-error button {
  display: inline-flex;
  align-items: center;

  gap: 7px;

  flex-shrink: 0;

  padding: 9px 12px;

  border:
    1px solid
    rgba(239,68,68,.25);

  border-radius: 8px;

  background: var(--mem-card);

  color: #ef4444;

  font-size: 10px;

  font-weight: 900;
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

.fcl-book-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 330px;

  margin-top: 15px;

  padding: 35px 20px;

  border:
    1px dashed var(--mem-border);

  border-radius: 15px;

  background: var(--mem-secondary);

  text-align: center;
}

.fcl-book-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 65px;
  height: 65px;

  border-radius: 17px;

  color: #1877F2;

  background: var(--mem-blue-soft);
}

.fcl-book-empty h3 {
  margin: 17px 0 0;

  color: var(--mem-heading);

  font-size: 18px;

  font-weight: 950;
}

.fcl-book-empty p {
  max-width: 420px;

  margin: 9px 0 19px;

  color: var(--mem-muted);

  font-size: 12px;

  line-height: 1.9;
}

/* =========================================================
   LOADING
   ========================================================= */

.fcl-book-loading {
  display: grid;

  grid-template-columns:
    minmax(280px,.82fr)
    minmax(0,1.6fr);

  gap: 14px;

  height: 620px;

  margin-top: 15px;
}

.fcl-book-loading-side,
.fcl-book-loading-main {
  padding: 20px;

  border:
    1px solid var(--mem-border);

  border-radius: 15px;

  background: var(--mem-card);
}

.fcl-book-loading-item {
  display: flex;

  gap: 13px;

  margin-bottom: 22px;
}

.fcl-book-loading-item > span {
  width: 37px;
  height: 37px;

  flex-shrink: 0;
}

.fcl-book-loading-item > div {
  flex: 1;
}

.fcl-book-loading-item
> div > span:first-child {
  display: block;

  width: 75%;
  height: 15px;
}

.fcl-book-loading-item
> div > span:last-child {
  display: block;

  width: 55%;
  height: 10px;

  margin-top: 10px;
}

.fcl-book-loading-main
> span {
  display: block;

  height: 15px;

  margin: 0 auto 20px;
}

.fcl-book-loading-main
> span:nth-child(1) {
  width: 28%;
  height: 22px;

  margin-top: 45px;
}

.fcl-book-loading-main
> span:nth-child(2) {
  width: 65%;
  height: 35px;

  margin-bottom: 45px;
}

.fcl-book-loading-main
> span:nth-child(3) {
  width: 90%;
}

.fcl-book-loading-main
> span:nth-child(4) {
  width: 85%;
}

.fcl-book-loading-main
> span:nth-child(5) {
  width: 92%;
}

.fcl-book-skeleton {
  border-radius: 7px;

  background:
    linear-gradient(
      90deg,
      var(--mem-secondary) 20%,
      var(--mem-card-raised) 50%,
      var(--mem-secondary) 80%
    );

  background-size: 200% 100%;

  animation:
    fclBookSkeleton 1.5s ease infinite;
}

/* =========================================================
   COMPACT BOTTOM NOTE
   ========================================================= */

.fcl-book-bottom-note {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  margin-top: 22px;

  padding: 17px 19px;

  border:
    1px solid var(--mem-border);

  border-radius: 13px;

  background: var(--mem-secondary);
}

.fcl-book-bottom-note > div {
  display: flex;
  align-items: center;

  gap: 12px;

  min-width: 0;
}

.fcl-book-bottom-symbol {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 33px;
  height: 33px;

  flex-shrink: 0;

  border-radius: 10px;

  background:
    rgba(245,158,11,.09);

  color: #d6a24a;

  font-size: 16px;
}

.fcl-book-bottom-note p {
  margin: 0;

  color: var(--mem-muted);

  font-size: 12px;

  line-height: 1.7;
}

.fcl-book-bottom-note p strong {
  color: var(--mem-heading);
}

.fcl-book-bottom-note > a {
  display: inline-flex;
  align-items: center;

  gap: 9px;

  flex-shrink: 0;

  color: #1877F2;

  font-size: 11px;

  font-weight: 900;

  text-decoration: none;
}

/* =========================================================
   ANIMATIONS
   ========================================================= */

@keyframes fclBookPageTurn {
  from {
    opacity: .35;

    transform:
      perspective(1200px)
      rotateY(-7deg)
      translateX(13px);

    filter: blur(2px);
  }

  to {
    opacity: 1;

    transform:
      perspective(1200px)
      rotateY(0)
      translateX(0);

    filter: blur(0);
  }
}

@keyframes fclBookFloat {
  0%,
  100% {
    transform:
      translateY(0)
      rotate(-9deg);
  }

  50% {
    transform:
      translateY(-9px)
      rotate(-6deg);
  }
}

@keyframes fclBookRotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fclBookPulse {
  0%,
  100% {
    box-shadow:
      0 0 0 5px
      rgba(24,119,242,.1);
  }

  50% {
    box-shadow:
      0 0 0 8px
      rgba(24,119,242,.035);
  }
}

@keyframes fclBookSkeleton {
  to {
    background-position-x: -200%;
  }
}

/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 1100px) {

  .fcl-book-workspace {
    grid-template-columns:
      minmax(250px,.9fr)
      minmax(0,1.4fr);
  }

  .fcl-book-series-grid {
    grid-template-columns:
      repeat(3,minmax(0,1fr));
  }

  .fcl-reader-footer {
    flex-wrap: wrap;
  }

  .fcl-reader-actions {
    margin-left: auto;
  }

  .fcl-reader-paper {
    padding: 26px;
  }
}

/* =========================================================
   MOBILE APP MODE
   ========================================================= */

@media (max-width: 767px) {

  .fcl-book-container {
    width: min(
      100% - 24px,
      1320px
    );
  }

  /* HERO */

  .fcl-book-hero-layout {
    display: block;

    min-height: auto;

    padding: 29px 0 27px;
  }

  .fcl-book-hero-art {
    display: none;
  }

  .fcl-book-hero-eyebrow {
    font-size: 8px;

    letter-spacing: .1em;
  }

  .fcl-book-hero-content h1 {
    margin-top: 13px;

    font-size:
      clamp(29px,7vw,38px);

    line-height: 1.25;
  }

  .fcl-book-hero-content h1 span {
    margin-top: 4px;

    font-size:
      clamp(23px,5.8vw,31px);
  }

  .fcl-book-hero-content > p {
    margin-top: 12px;

    font-size: 11px;

    line-height: 1.85;
  }

  .fcl-book-hero-actions {
    margin-top: 17px;
  }

  .fcl-book-primary,
  .fcl-book-secondary {
    min-height: 40px;

    padding: 9px 13px;

    font-size: 11px;
  }

  .fcl-book-hero-square.square-one {
    right: -40px;
  }

  .fcl-book-hero-square.square-two {
    right: 15%;
  }

  /* STATS */

  .fcl-book-stats {
    grid-template-columns:
      repeat(4,minmax(0,1fr));
  }

  .fcl-book-stat {
    flex-direction: column;

    justify-content: center;

    gap: 6px;

    padding: 12px 4px;

    text-align: center;
  }

  .fcl-book-stat:first-child {
    padding-left: 4px;
  }

  .fcl-book-stat-icon {
    width: 29px;
    height: 29px;

    border-radius: 9px;
  }

  .fcl-book-stat-icon svg {
    width: 15px;
    height: 15px;
  }

  .fcl-book-stat strong {
    font-size: 18px;
  }

  .fcl-book-stat div > span {
    margin-top: 4px;

    font-size: 8px;

    line-height: 1.4;
  }

  /* SECTION */

  .fcl-book-workspace-section {
    padding: 21px 0 30px;
  }

  .fcl-book-section-heading {
    margin-bottom: 13px;
  }

  .fcl-book-section-eyebrow {
    font-size: 8px;
  }

  .fcl-book-section-heading h2 {
    margin-top: 5px;

    font-size: 21px;
  }

  .fcl-book-count-badge {
    padding: 7px 9px;

    font-size: 15px;
  }

  .fcl-book-count-badge small {
    font-size: 7px;
  }

  /* FILTER */

  .fcl-book-filter-panel {
    padding: 10px;

    border-radius: 13px;
  }

  .fcl-book-category-scroll {
    gap: 7px;

    padding-bottom: 10px;
  }

  .fcl-book-category-tab {
    min-height: 34px;

    padding: 7px 10px;

    font-size: 10px;
  }

  .fcl-book-filter-bottom {
    gap: 8px;

    padding-top: 10px;
  }

  .fcl-book-search input {
    min-height: 40px;

    font-size: 11px;
  }

  .fcl-book-sort select {
    min-height: 40px;

    max-width: 120px;

    padding-right: 15px;

    font-size: 10px;
  }

  /* WORKSPACE */

  .fcl-book-main-area {
    margin-top: 12px;
  }

  .fcl-book-workspace {
    display: block;

    height: auto;
  }

  /* APP LIBRARY */

  .fcl-book-library {
    border-radius: 14px;
  }

  .fcl-library-header {
    padding: 14px;
  }

  .fcl-library-header h3 {
    font-size: 16px;
  }

  .fcl-library-list {
    max-height: 440px;

    overflow-y: auto;

    scrollbar-width: thin;
  }

  .fcl-library-item {
    gap: 11px;

    padding: 13px;
  }

  .fcl-library-item-number {
    width: 34px;
    height: 34px;
  }

  .fcl-library-item-main > strong {
    font-size: 13px;
  }

  .fcl-library-item-main > small {
    font-size: 10px;
  }

  .fcl-library-item-preview {
    font-size: 10px;

    -webkit-line-clamp: 1;
  }

  .fcl-library-footer {
    padding: 11px 13px;
  }

  /* MOBILE FULLSCREEN READER */

  .fcl-book-reader {
    display: none;
  }

  .fcl-book-reader.mobile-open {
    position: fixed;

    z-index: 99999;

    inset: 0;

    display: flex;

    width: 100%;
    height: 100dvh;

    border: 0;

    border-radius: 0;

    background: var(--mem-card);

    animation:
      fclMobileReaderEnter .3s
      cubic-bezier(.2,.8,.2,1) both;
  }

  .fcl-reader-toolbar {
    min-height: 58px;

    padding:
      9px 12px;

    padding-top:
      max(
        9px,
        env(safe-area-inset-top)
      );
  }

  .fcl-reader-mobile-back,
  .fcl-reader-mobile-close {
    display: flex;
  }

  .fcl-reader-toolbar-brand {
    gap: 8px;
  }

  .fcl-reader-brand-icon {
    width: 31px;
    height: 31px;
  }

  .fcl-reader-toolbar-brand strong {
    font-size: 9px;
  }

  .fcl-reader-toolbar-brand small {
    font-size: 7px;
  }

  .fcl-reader-toolbar-right {
    gap: 5px;
  }

  .fcl-reader-page-count {
    font-size: 11px;
  }

  .fcl-reader-icon-button {
    width: 29px;
    height: 29px;
  }

  .fcl-reader-mobile-close {
    width: 30px;
    height: 30px;
  }

  /* MOBILE PAPER */

  .fcl-reader-book-shell {
    padding: 7px;

    min-height: 0;
  }

  .fcl-reader-book-spine {
    left: 7px;

    top: 7px;
    bottom: 7px;

    width: 5px;
  }

  .fcl-reader-paper {
    padding: 24px 19px 35px;
  }

  .fcl-reader-paper-top > span:last-child {
    font-size: 8px;
  }

  .fcl-reader-title-section {
    margin-top: 22px;
  }

  .fcl-reader-chapter {
    font-size: 8px;
  }

  .fcl-reader-title-section h2 {
    margin-top: 10px;

    font-size: 23px;

    line-height: 1.5;
  }

  .fcl-reader-author-row {
    gap: 6px 13px;

    margin-top: 11px;

    font-size: 10px;
  }

  .fcl-reader-ornament {
    margin: 20px 0;
  }

  .fcl-reader-summary {
    padding: 13px;

    margin-bottom: 20px;
  }

  .fcl-reader-summary p {
    font-size: 12px;
  }

  .fcl-reader-story-content {
    line-height: 2.05;
  }

  /* MOBILE FOOTER */

  .fcl-reader-footer {
    display: flex;
    flex-direction: column;

    align-items: stretch;

    gap: 8px;

    min-height: auto;

    padding:
      9px 12px
      max(
        10px,
        env(safe-area-inset-bottom)
      );
  }

  .fcl-reader-navigation {
    justify-content: space-between;
  }

  .fcl-reader-nav-button {
    min-height: 38px;

    padding: 9px 13px;
  }

  .fcl-reader-actions {
    justify-content: center;

    margin-left: 0;
  }

  .fcl-reader-action-button,
  .fcl-reader-original-link {
    flex: 1;

    min-height: 35px;
  }

  /* SERIES */

  .fcl-book-series-grid {
    grid-template-columns:
      repeat(2,minmax(0,1fr));

    gap: 10px;
  }

  .fcl-book-series-card {
    min-height: 205px;

    padding: 13px;
  }

  .fcl-book-series-card h3 {
    font-size: 14px;
  }

  .fcl-book-series-symbol {
    margin-top: 15px;
  }

  .fcl-book-series-symbol strong {
    font-size: 25px;
  }

  .fcl-book-series-status {
    max-width: 95px;

    font-size: 8px;

    overflow: hidden;
  }

  .fcl-book-series-footer
  > span:first-child {
    font-size: 10px;
  }

  .fcl-book-series-footer
  > span:last-child {
    font-size: 10px;
  }

  .fcl-book-series-breadcrumb {
    padding: 10px 12px;
  }

  /* LOADING */

  .fcl-book-loading {
    display: block;

    height: 440px;
  }

  .fcl-book-loading-main {
    display: none;
  }

  .fcl-book-loading-side {
    height: 100%;

    overflow: hidden;
  }

  /* BOTTOM NOTE */

  .fcl-book-bottom-note {
    gap: 10px;

    margin-top: 16px;

    padding: 13px;
  }

  .fcl-book-bottom-note p {
    font-size: 10px;
  }

  .fcl-book-bottom-note > a {
    font-size: 10px;
  }
}

/* =========================================================
   EXTRA SMALL MOBILE
   ========================================================= */

@media (max-width: 380px) {

  .fcl-book-hero-content h1 {
    font-size: 27px;
  }

  .fcl-book-hero-content h1 span {
    font-size: 21px;
  }

  .fcl-book-stat div > span {
    font-size: 7px;
  }

  .fcl-reader-toolbar-brand small {
    display: none;
  }

  .fcl-reader-toolbar-brand strong {
    font-size: 8px;
  }

  .fcl-reader-brand-icon {
    width: 28px;
    height: 28px;
  }

  .fcl-reader-page-count {
    margin-right: 0;

    font-size: 10px;
  }

  .fcl-reader-icon-button {
    width: 27px;
    height: 27px;
  }

  .fcl-book-series-grid {
    gap: 8px;
  }

  .fcl-book-series-card {
    padding: 11px;
  }
}

/* =========================================================
   MOBILE READER ANIMATION
   ========================================================= */

@keyframes fclMobileReaderEnter {
  from {
    opacity: 0;

    transform:
      translateY(35px)
      scale(.985);
  }

  to {
    opacity: 1;

    transform:
      translateY(0)
      scale(1);
  }
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {

  .fcl-memory-book-page *,
  .fcl-memory-book-page *::before,
  .fcl-memory-book-page *::after {
    animation-duration:
      .01ms !important;

    animation-iteration-count:
      1 !important;

    transition-duration:
      .01ms !important;

    scroll-behavior:
      auto !important;
  }
}

`;