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
   FCL MEMORIES & LITERARY ARCHIVE
   Premium Digital Archive • Responsive • Dark / Light
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

type ArchiveView = "all" | "series" | "episode";

type CategoryTone =
  | "blue"
  | "amber"
  | "pink"
  | "green"
  | "purple"
  | "cyan"
  | "orange";

const PAGE_SIZE = 12;

/* =========================================================
   HELPERS
   ========================================================= */

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function getEpisodeNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getEpisodeKey(item: SeriesEpisode, index: number): string {
  return `${normalize(item.episode_no)}-${index}`;
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

function getCategoryTone(category: string): CategoryTone {
  const name = category.toLowerCase();

  if (
    name.includes("স্মৃতি") ||
    name.includes("memories") ||
    name.includes("nostalgia")
  ) {
    return "amber";
  }

  if (name.includes("গান") || name.includes("song")) {
    return "pink";
  }

  if (name.includes("কবিতা") || name.includes("poem")) {
    return "cyan";
  }

  if (name.includes("গল্প") || name.includes("story")) {
    return "green";
  }

  if (
    name.includes("নাটক") ||
    name.includes("drama") ||
    name.includes("সিরিজ") ||
    name.includes("series")
  ) {
    return "purple";
  }

  if (
    name.includes("কৌতুক") ||
    name.includes("humor")
  ) {
    return "orange";
  }

  return "blue";
}

function formatDate(date: string): string {
  if (!date) return "";

  const trimmed = date.trim();

  // Keep the original value for non-standard archive dates.
  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(parsed);
  }

  return trimmed;
}

/* =========================================================
   SMART CONTENT FORMATTER
   ========================================================= */

function formatSmartContent(
  rawText: string,
  category: string
): string {
  if (!rawText) return "";

  let text = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  // Remove a standalone introductory summary.
  // The summary is displayed separately when available.
  text = text
    .replace(
      /^সারসংক্ষেপ:\s*[^\n]*(?:\n|$)/i,
      ""
    )
    .trim();

  // Detect episode and scene headings.
  text = text.replace(
    /(^|\n)\s*((?:[০-৯]{1,2}|\d{1,2})\.|পর্ব\s*[০-৯\d]+\s*[:.]|দৃশ্য\s*[০-৯\d]+\s*[:.]|Part\s*\d+\s*[:.]|Scene\s*\d+\s*[:.])/gi,
    "\n\n__EPISODE_START__$2__EPISODE_END__\n"
  );

  const name = category.toLowerCase();

  const isDrama =
    name.includes("নাটক") ||
    name.includes("drama") ||
    name.includes("ধারাবাহিক সিরিজ");

  if (isDrama) {
    // Separate dialogue only when a speaker label starts a line.
    text = text.replace(
      /(^|\n)([^\n:]{1,50}:\s*)/g,
      "$1\n$2"
    );
  }

  return text.trim();
}

/* =========================================================
   INLINE TEXT FORMATTING
   ========================================================= */

function renderHighlightedParts(
  text: string
): ReactNode {
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
          className="fcl-text-highlight strong"
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
          key={index}
          className="fcl-text-highlight"
        >
          {part.slice(1, -1).trim()}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function renderTextWithHighlights(
  text: string
): ReactNode {
  const lines = text.split("\n");

  return lines.map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return (
        <div
          key={index}
          className="fcl-paragraph-space"
          aria-hidden="true"
        />
      );
    }

    const dialogueMatch = trimmed.match(
      /^([^:\n]{1,60}):\s+(.+)$/
    );

    if (dialogueMatch) {
      return (
        <p
          key={index}
          className="fcl-story-paragraph fcl-dialogue"
        >
          <strong className="fcl-dialogue-speaker">
            {dialogueMatch[1]}:
          </strong>{" "}
          {renderHighlightedParts(dialogueMatch[2])}
        </p>
      );
    }

    return (
      <p
        key={index}
        className="fcl-story-paragraph"
      >
        {renderHighlightedParts(trimmed)}
      </p>
    );
  });
}

function renderFormattedContent(
  text: string
): ReactNode {
  if (!text) return null;

  const blocks = text.split("__EPISODE_START__");

  return blocks.map((block, index) => {
    if (!block.includes("__EPISODE_END__")) {
      return (
        <div
          key={index}
          className="fcl-story-block"
        >
          {renderTextWithHighlights(block)}
        </div>
      );
    }

    const [heading, ...content] = block.split(
      "__EPISODE_END__"
    );

    return (
      <section
        key={index}
        className="fcl-story-section"
      >
        {heading.trim() && (
          <h4 className="fcl-story-section-title">
            {heading.trim()}
          </h4>
        )}

        <div className="fcl-story-block">
          {renderTextWithHighlights(
            content.join("__EPISODE_END__")
          )}
        </div>
      </section>
    );
  });
}

/* =========================================================
   THEME DETECTION
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

  if (html.classList.contains("dark")) return true;
  if (html.classList.contains("light")) return false;

  if (body.classList.contains("dark")) return true;
  if (body.classList.contains("light")) return false;

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
    // Local storage may be unavailable.
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
   SMALL UI COMPONENTS
   ========================================================= */

function Eyebrow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="fcl-mem-eyebrow">
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="fcl-mem-section-heading">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>

        <h2>{title}</h2>

        {description && <p>{description}</p>}
      </div>

      {right && (
        <div className="fcl-mem-heading-right">
          {right}
        </div>
      )}
    </div>
  );
}

function CategoryBadge({
  category,
}: {
  category: string;
}) {
  const tone = getCategoryTone(category);

  return (
    <span
      className={`fcl-mem-category tone-${tone}`}
    >
      <span className="fcl-category-dot" />

      {category}
    </span>
  );
}

function ArchiveMeta({
  author,
  date,
}: {
  author: string;
  date?: string;
}) {
  return (
    <div className="fcl-mem-meta">
      <span>
        <span className="fcl-meta-label">
          লেখক
        </span>

        <strong>{author || "Unknown"}</strong>
      </span>

      {date && (
        <>
          <span className="fcl-meta-divider" />

          <span>
            <span className="fcl-meta-label">
              প্রকাশ
            </span>

            <strong>{formatDate(date)}</strong>
          </span>
        </>
      )}
    </div>
  );
}

function SearchIcon() {
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
  direction?: "left" | "right" | "up";
}) {
  const rotation =
    direction === "left"
      ? "rotate(180deg)"
      : direction === "up"
        ? "rotate(-45deg)"
        : undefined;

  return (
    <svg
      width="17"
      height="17"
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

function ChevronIcon({
  open = false,
}: {
  open?: boolean;
}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={
        open
          ? "fcl-chevron is-open"
          : "fcl-chevron"
      }
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* =========================================================
   STORY READER
   ========================================================= */

function StoryReader({
  content,
  category,
  compact = false,
}: {
  content: string;
  category: string;
  compact?: boolean;
}) {
  const formatted = useMemo(
    () => formatSmartContent(content, category),
    [content, category]
  );

  if (!formatted) {
    return (
      <div className="fcl-reader-empty">
        এই লেখার মূল বিষয়বস্তু এখনো সংরক্ষিত হয়নি।
      </div>
    );
  }

  return (
    <div
      className={`fcl-story-reader ${
        compact ? "compact" : ""
      }`}
    >
      <div className="fcl-reader-paper">
        {renderFormattedContent(formatted)}
      </div>
    </div>
  );
}

/* =========================================================
   MEMORIES CARD
   ========================================================= */

function MemoryCard({
  memory,
  index,
  copied,
  onCopy,
}: {
  memory: Memory;
  index: number;
  copied: boolean;
  onCopy: (url: string, id: number) => void;
}) {
  const hasLink = isValidExternalUrl(
    memory.fbPostUrl
  );

  return (
    <article className="fcl-memory-card">
      <div className="fcl-memory-card-top">
        <CategoryBadge
          category={memory.category || "Archive"}
        />

        <span className="fcl-memory-index">
          ARCHIVE /{" "}
          {String(index + 1).padStart(3, "0")}
        </span>
      </div>

      <div className="fcl-memory-card-heading">
        <h3>{memory.title || "Untitled Memory"}</h3>

        <ArchiveMeta
          author={memory.author}
          date={memory.date}
        />
      </div>

      {memory.summary && (
        <div className="fcl-memory-summary">
          <span>সারসংক্ষেপ</span>

          <p>
            {renderHighlightedParts(
              memory.summary
            )}
          </p>
        </div>
      )}

      <div className="fcl-memory-reader-container">
        <div className="fcl-reader-heading">
          <span>মূল লেখা</span>

          <span>FCL ARCHIVE</span>
        </div>

        <StoryReader
          content={memory.content}
          category={memory.category}
        />
      </div>

      <div className="fcl-memory-card-footer">
        {hasLink ? (
          <a
            href={memory.fbPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fcl-post-link"
          >
            মূল ফেসবুক পোস্ট

            <ArrowIcon direction="up" />
          </a>
        ) : (
          <span className="fcl-archive-only">
            সংরক্ষিত আর্কাইভ
          </span>
        )}

        {hasLink && (
          <button
            type="button"
            onClick={() =>
              onCopy(
                memory.fbPostUrl,
                memory.id
              )
            }
            className={`fcl-copy-button ${
              copied ? "copied" : ""
            }`}
            aria-label={
              copied
                ? "লিংক কপি হয়েছে"
                : "ফেসবুক পোস্টের লিংক কপি করুন"
            }
          >
            {copied
              ? "✓ কপি হয়েছে"
              : "লিংক কপি"}
          </button>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   SERIES COLLECTION CARD
   ========================================================= */

function SeriesCard({
  series,
  index,
  onOpen,
}: {
  series: SeriesGroup;
  index: number;
  onOpen: () => void;
}) {
  const completed = /complete|completed|শেষ|সমাপ্ত/i.test(
    series.status
  );

  return (
    <button
      type="button"
      onClick={onOpen}
      className="fcl-series-card"
    >
      <div className="fcl-series-card-top">
        <span className="fcl-series-index">
          SERIES{" "}
          {String(index + 1).padStart(2, "0")}
        </span>

        <span
          className={`fcl-series-status ${
            completed ? "completed" : "running"
          }`}
        >
          <span />

          {series.status}
        </span>
      </div>

      <div className="fcl-series-symbol">
        <span>FCL</span>

        <strong>
          {String(index + 1).padStart(2, "0")}
        </strong>
      </div>

      <div className="fcl-series-card-content">
        <span className="fcl-series-type">
          ধারাবাহিক সাহিত্য
        </span>

        <h3>{series.name}</h3>

        <p>
          লেখক{" "}
          <strong>{series.author}</strong>
        </p>
      </div>

      <div className="fcl-series-card-bottom">
        <div>
          <strong>
            {series.episodes.length}
          </strong>

          <span>টি পর্ব</span>
        </div>

        <span className="fcl-series-read">
          সিরিজটি পড়ুন

          <ArrowIcon />
        </span>
      </div>
    </button>
  );
}

/* =========================================================
   EPISODE ACCORDION
   ========================================================= */

function EpisodeCard({
  episode,
  episodeKey,
  isOpen,
  onToggle,
  onCopy,
  copied,
}: {
  episode: SeriesEpisode;
  episodeKey: string;
  isOpen: boolean;
  onToggle: () => void;
  onCopy: (url: string, id: number) => void;
  copied: boolean;
}) {
  const number = normalize(
    episode.episode_no || 1
  );

  const title =
    normalize(episode.episode_title) ||
    `পর্ব ${number}`;

  const postUrl = normalize(
    episode.facebook_link
  );

  const hasLink = isValidExternalUrl(postUrl);

  return (
    <article
      className={`fcl-episode-card ${
        isOpen ? "is-open" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="fcl-episode-trigger"
        aria-expanded={isOpen}
        aria-controls={`fcl-episode-${episodeKey}`}
      >
        <div className="fcl-episode-number">
          <span>EPISODE</span>

          <strong>
            {String(number).padStart(2, "0")}
          </strong>
        </div>

        <div className="fcl-episode-trigger-content">
          <span className="fcl-episode-label">
            ধারাবাহিক পর্ব
          </span>

          <h3>{title}</h3>

          <p>
            {normalize(episode.Author) ||
              "Unknown Author"}

            {episode.publish_date &&
              ` · ${formatDate(
                normalize(
                  episode.publish_date
                )
              )}`}
          </p>
        </div>

        <span className="fcl-episode-toggle">
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {isOpen && (
        <div
          id={`fcl-episode-${episodeKey}`}
          className="fcl-episode-content"
        >
          {episode.summary && (
            <div className="fcl-episode-summary">
              <span>পূর্বকথা / সারসংক্ষেপ</span>

              <p>
                {renderHighlightedParts(
                  episode.summary
                )}
              </p>
            </div>
          )}

          <div className="fcl-episode-reader-heading">
            <span>মূল পর্ব</span>

            <span>
              EPISODE{" "}
              {String(number).padStart(2, "0")}
            </span>
          </div>

          <StoryReader
            content={normalize(
              episode.Content
            )}
            category="ধারাবাহিক সিরিজ"
            compact
          />

          <div className="fcl-episode-footer">
            <span>
              FACEBOOK CRICKET LEAGUE
            </span>

            <div>
              {hasLink && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onCopy(
                        postUrl,
                        Number(
                          episode.episode_no
                        ) || 0
                      )
                    }
                    className="fcl-copy-button"
                  >
                    {copied
                      ? "✓ কপি হয়েছে"
                      : "লিংক কপি"}
                  </button>

                  <a
                    href={postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fcl-post-link"
                  >
                    মূল পোস্ট

                    <ArrowIcon direction="up" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

/* =========================================================
   EMPTY / ERROR / LOADING
   ========================================================= */

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
    <div className="fcl-mem-empty">
      <div className="fcl-empty-symbol">
        FCL
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="fcl-primary-button"
        >
          সব পোস্ট দেখুন

          <ArrowIcon />
        </button>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="fcl-loading-grid"
      aria-busy="true"
      aria-label="Loading archive"
    >
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="fcl-loading-card"
          >
            <div className="fcl-skeleton small" />

            <div className="fcl-skeleton title" />

            <div className="fcl-skeleton line" />

            <div className="fcl-skeleton reader" />

            <div className="fcl-skeleton line" />
          </div>
        )
      )}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function MemoriesPage() {
  const isDark = useIsDark();

  const [memories, setMemories] = useState<
    Memory[]
  >([]);

  const [
    seriesDataList,
    setSeriesDataList,
  ] = useState<SeriesEpisode[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedSeriesName,
    setSelectedSeriesName,
  ] = useState<string | null>(null);

  const [openEpisode, setOpenEpisode] =
    useState<string | null>(null);

  const [copiedKey, setCopiedKey] =
    useState<string | null>(null);

  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const contentRef = useRef<
    HTMLDivElement | null
  >(null);

  const copyTimeoutRef = useRef<
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
        const [
          memoriesResponse,
          seriesResponse,
        ] = await Promise.allSettled([
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

        if (
          memoriesResponse.status === "fulfilled" &&
          memoriesResponse.value.ok
        ) {
          try {
            const data =
              await memoriesResponse.value.json();

            const rawItems = Array.isArray(data)
              ? data
              : Array.isArray(data?.memories)
                ? data.memories
                : [];

            loadedMemories = rawItems.map(
              (item: Partial<Memory>, index: number) => ({
                id:
                  Number(item.id) ||
                  index + 1,
                category: normalize(
                  item.category
                ),
                title: normalize(item.title),
                author: normalize(
                  item.author
                ),
                date: normalize(item.date),
                fbPostUrl: normalize(
                  item.fbPostUrl
                ),
                content: normalize(
                  item.content
                ),
                isSeries: item.isSeries,
                seriesName: item.seriesName,
                episodeNo: item.episodeNo,
                summary: normalize(
                  item.summary
                ),
              })
            );
          } catch {
            memoriesFailed = true;
          }
        } else {
          memoriesFailed = true;
        }

        if (
          seriesResponse.status === "fulfilled" &&
          seriesResponse.value.ok
        ) {
          try {
            const data =
              await seriesResponse.value.json();

            const rawSeries = Array.isArray(data)
              ? data
              : Array.isArray(data?.series)
                ? data.series
                : [];

            loadedSeries = rawSeries.map(
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
                Content: normalize(
                  item.Content
                ),
                summary: normalize(
                  item.summary
                ),
                facebook_link: normalize(
                  item.facebook_link
                ),
                publish_date: normalize(
                  item.publish_date
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

        const formattedSeries: Memory[] =
          loadedSeries.map((item, index) => ({
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
            date: normalize(
              item.publish_date
            ),
            fbPostUrl:
              item.facebook_link || "",
            content:
              item.Content || "",
            isSeries: true,
            seriesName:
              item.series_name ||
              "ধারাবাহিক গল্প",
            episodeNo:
              item.episode_no || 1,
            summary:
              item.summary || "",
          }));

        setSeriesDataList(loadedSeries);

        setMemories([
          ...loadedMemories,
          ...formattedSeries,
        ]);

        if (memoriesFailed && seriesFailed) {
          setError(
            "আর্কাইভের তথ্য লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
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
          "FCL Memories fetch error:",
          err
        );

        setError(
          "আর্কাইভের তথ্য লোড করা যায়নি।"
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

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  /* =======================================================
     DERIVED DATA
     ======================================================= */

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          memories
            .map((item) =>
              normalize(item.category)
            )
            .filter(Boolean)
        )
      ),
    ];
  }, [memories]);

  const seriesGroups = useMemo<
    SeriesGroup[]
  >(() => {
    const groups = new Map<
      string,
      SeriesEpisode[]
    >();

    for (const item of seriesDataList) {
      const name =
        normalize(item.series_name) ||
        "ধারাবাহিক গল্প";

      const existing =
        groups.get(name) || [];

      existing.push(item);

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
        author:
          sorted.find(
            (item) => item.Author
          )?.Author || "Unknown",
        status:
          sorted.find(
            (item) => item.status
          )?.status || "Running",
        episodes: sorted,
        latestDate:
          sorted[sorted.length - 1]
            ?.publish_date || "",
      };
    });
  }, [seriesDataList]);

  const query = searchQuery
    .trim()
    .toLowerCase();

  const filteredMemories = useMemo(() => {
    return memories.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category
          .toLowerCase()
          .includes(
            selectedCategory.toLowerCase()
          );

      if (!matchesCategory) return false;

      if (!query) return true;

      return [
        item.title,
        item.author,
        item.content,
        item.category,
        item.summary,
        item.seriesName,
        String(item.episodeNo || ""),
      ].some((value) =>
        normalize(value)
          .toLowerCase()
          .includes(query)
      );
    });
  }, [
    memories,
    query,
    selectedCategory,
  ]);

  const filteredSeries = useMemo(() => {
    if (!query) return seriesGroups;

    return seriesGroups.filter(
      (series) => {
        const basicMatch = [
          series.name,
          series.author,
          series.status,
        ].some((value) =>
          value.toLowerCase().includes(query)
        );

        const episodeMatch =
          series.episodes.some((episode) =>
            [
              episode.episode_title,
              episode.Author,
              episode.Content,
              episode.summary,
              String(
                episode.episode_no || ""
              ),
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
  }, [seriesGroups, query]);

  const currentSeries = useMemo(() => {
    return seriesGroups.find(
      (series) =>
        series.name ===
        selectedSeriesName
    );
  }, [
    seriesGroups,
    selectedSeriesName,
  ]);

  const currentView: ArchiveView =
    selectedCategory ===
    "ধারাবাহিক সিরিজ"
      ? selectedSeriesName
        ? "episode"
        : "series"
      : "all";

  const visibleMemories =
    filteredMemories.slice(
      0,
      visibleCount
    );

  const hasMore =
    visibleCount <
    filteredMemories.length;

  const totalRegular = memories.filter(
    (item) => !item.isSeries
  ).length;

  const totalEpisodes =
    seriesDataList.length;

  /* =======================================================
     ACTIONS
     ======================================================= */

  const scrollToContent = useCallback(
    () => {
      requestAnimationFrame(() => {
        if (!contentRef.current) return;

        const reducedMotion =
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;

        contentRef.current.scrollIntoView({
          behavior: reducedMotion
            ? "auto"
            : "smooth",
          block: "start",
        });
      });
    },
    []
  );

  const changeCategory = (
    category: string
  ) => {
    setSelectedCategory(category);

    setSelectedSeriesName(null);
    setOpenEpisode(null);
    setVisibleCount(PAGE_SIZE);

    scrollToContent();
  };

  const openSeries = (
    seriesName: string
  ) => {
    setSelectedSeriesName(seriesName);
    setOpenEpisode(null);

    // The series is opened from its own directory.
    // Reset search so all episodes remain available.
    setSearchQuery("");

    scrollToContent();
  };

  const closeSeries = () => {
    setSelectedSeriesName(null);
    setOpenEpisode(null);

    scrollToContent();
  };

  const toggleEpisode = (
    key: string
  ) => {
    setOpenEpisode((previous) =>
      previous === key ? null : key
    );
  };

  const handleCopyLink = async (
    url: string,
    key: string
  ) => {
    if (!isValidExternalUrl(url)) return;

    try {
      await navigator.clipboard.writeText(
        url
      );

      setCopiedKey(key);

      if (copyTimeoutRef.current) {
        clearTimeout(
          copyTimeoutRef.current
        );
      }

      copyTimeoutRef.current =
        setTimeout(() => {
          setCopiedKey(null);
        }, 2000);
    } catch (err) {
      console.error(
        "Failed to copy link:",
        err
      );
    }
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedSeriesName(null);
    setSearchQuery("");
    setOpenEpisode(null);
    setVisibleCount(PAGE_SIZE);
  };

  const handleRetry = () => {
    setRefreshKey(
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

    "--mem-reader": isDark
      ? "#050b17"
      : "#fbfcfe",

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

    "--mem-border-soft": isDark
      ? "#172033"
      : "#edf2f7",

    "--mem-blue": "#1877F2",
    "--mem-gold": "#f59e0b",

    "--mem-blue-soft": isDark
      ? "rgba(24,119,242,.12)"
      : "rgba(24,119,242,.07)",

    "--mem-gold-soft": isDark
      ? "rgba(245,158,11,.09)"
      : "rgba(245,158,11,.07)",

    "--mem-shadow": isDark
      ? "0 20px 55px rgba(0,0,0,.17)"
      : "0 16px 50px rgba(15,23,42,.055)",
  } as CSSProperties;

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <div
      className={`fcl-memories-page ${
        isDark
          ? "fcl-mem-dark"
          : "fcl-mem-light"
      }`}
      style={themeStyle}
    >
      {/* ================================================
          HERO
          ================================================ */}

      <header className="fcl-mem-hero">
        <div className="fcl-mem-hero-grid" />

        <div className="fcl-mem-hero-glow one" />

        <div className="fcl-mem-hero-glow two" />

        <div className="fcl-mem-container">
          <div className="fcl-mem-hero-layout">
            <div className="fcl-mem-hero-content">
              <div className="fcl-mem-hero-label">
                <span className="fcl-mem-label-dot" />

                FCL MEMORIES & LITERARY ARCHIVE
              </div>

              <h1>
                স্মৃতির পাতায়
                <br />

                <span>
                  Facebook Cricket League
                </span>
              </h1>

              <p>
                ২০১৩ সাল থেকে গড়ে ওঠা
                বন্ধুত্ব, আবেগ, গল্প, কবিতা,
                গান, নাটক এবং অসংখ্য
                স্মরণীয় মুহূর্তের একটি
                ডিজিটাল সংগ্রহশালা।
              </p>

              <div className="fcl-mem-hero-actions">
                <button
                  type="button"
                  onClick={scrollToContent}
                  className="fcl-primary-button"
                >
                  আর্কাইভ ঘুরে দেখুন

                  <ArrowIcon />
                </button>

                <Link
                  href="/"
                  className="fcl-outline-button"
                >
                  FCL হোমপেজ
                </Link>
              </div>

              <div className="fcl-mem-hero-established">
                <span className="fcl-mem-established-line" />

                ESTABLISHED 27 FEBRUARY 2013
              </div>
            </div>

            <div className="fcl-mem-hero-visual">
              <div className="fcl-mem-archive-emblem">
                <div className="fcl-emblem-circle outer">
                  <div className="fcl-emblem-circle inner">
                    <span>FCL</span>

                    <strong>2013</strong>
                  </div>
                </div>

                <div className="fcl-emblem-caption">
                  THE STORIES WE KEEP
                </div>
              </div>

              <div className="fcl-mem-visual-caption">
                <span>
                  A DECADE OF MEMORIES
                </span>

                <strong>
                  Every story matters.
                </strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================
          ARCHIVE OVERVIEW
          ================================================ */}

      <section className="fcl-mem-overview">
        <div className="fcl-mem-container">
          <div className="fcl-mem-stats">
            <div className="fcl-mem-stat">
              <span>ARCHIVED POSTS</span>

              <strong>
                {loading
                  ? "—"
                  : totalRegular.toLocaleString(
                      "en-US"
                    )}
              </strong>

              <p>সংরক্ষিত লেখা</p>
            </div>

            <div className="fcl-mem-stat">
              <span>SERIES COLLECTIONS</span>

              <strong>
                {loading
                  ? "—"
                  : seriesGroups.length.toLocaleString(
                      "en-US"
                    )}
              </strong>

              <p>ধারাবাহিক সিরিজ</p>
            </div>

            <div className="fcl-mem-stat">
              <span>PUBLISHED EPISODES</span>

              <strong>
                {loading
                  ? "—"
                  : totalEpisodes.toLocaleString(
                      "en-US"
                    )}
              </strong>

              <p>প্রকাশিত পর্ব</p>
            </div>

            <div className="fcl-mem-stat">
              <span>ARCHIVE ESTABLISHED</span>

              <strong>2013</strong>

              <p>FCL-এর পথচলা</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          ARCHIVE DIRECTORY
          ================================================ */}

      <section
        ref={contentRef}
        id="fcl-memories-content"
        className="fcl-mem-directory"
      >
        <div className="fcl-mem-container">
          <SectionHeading
            eyebrow="EXPLORE THE COLLECTION"
            title="স্মৃতি ও সাহিত্য সংগ্রহ"
            description="বিভাগ নির্বাচন করুন অথবা আপনার পছন্দের লেখা, লেখক কিংবা সিরিজ খুঁজে নিন।"
          />

          <div className="fcl-mem-filter-panel">
            <div className="fcl-mem-filter-header">
              <div>
                <span>ARCHIVE CATEGORIES</span>

                <strong>
                  বিভাগ অনুযায়ী দেখুন
                </strong>
              </div>

              <span className="fcl-mem-category-count">
                {Math.max(
                  categories.length - 1,
                  0
                )}{" "}
                CATEGORIES
              </span>
            </div>

            <div className="fcl-mem-category-list">
              {categories.map(
                (category) => {
                  const active =
                    selectedCategory ===
                    category;

                  const count =
                    category === "All"
                      ? memories.length
                      : memories.filter(
                          (item) =>
                            item.category ===
                            category
                        ).length;

                  return (
                    <button
                      type="button"
                      key={category}
                      onClick={() =>
                        changeCategory(category)
                      }
                      className={`fcl-mem-filter-button ${
                        active ? "active" : ""
                      }`}
                      aria-pressed={active}
                    >
                      <span>
                        {category === "All"
                          ? "সকল স্মৃতি"
                          : category}
                      </span>

                      <small>{count}</small>
                    </button>
                  );
                }
              )}
            </div>

            <div className="fcl-mem-search-row">
              <div className="fcl-mem-search">
                <SearchIcon />

                <input
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
                  placeholder={
                    currentView === "series"
                      ? "সিরিজ, লেখক বা পর্ব খুঁজুন..."
                      : currentView === "episode"
                        ? "এই সিরিজে ফিরে যেতে উপরের বাটন ব্যবহার করুন"
                        : "স্মৃতি, গল্প, লেখক বা বিষয়বস্তু খুঁজুন..."
                  }
                  disabled={
                    currentView === "episode"
                  }
                  aria-label="Search archive"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setVisibleCount(
                        PAGE_SIZE
                      );
                    }}
                    className="fcl-mem-search-clear"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="fcl-mem-filter-result">
                {currentView === "series"
                  ? filteredSeries.length
                  : currentView === "episode"
                    ? currentSeries
                        ?.episodes.length || 0
                    : filteredMemories.length}

                <span>
                  {currentView === "series"
                    ? "টি সিরিজ"
                    : currentView === "episode"
                      ? "টি পর্ব"
                      : "টি পোস্ট"}
                </span>
              </div>
            </div>
          </div>

          {/* ============================================
              ERROR
              ============================================ */}

          {error && !loading && (
            <div
              className="fcl-mem-error"
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
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {/* ============================================
              LOADING
              ============================================ */}

          {loading ? (
            <LoadingState />
          ) : currentView === "series" ? (
            /* ==========================================
               SERIES DIRECTORY
               ========================================== */

            <div className="fcl-mem-results">
              <SectionHeading
                eyebrow="SERIALISED LITERATURE"
                title="ধারাবাহিক সিরিজসমূহ"
                description="আপনার পছন্দের সিরিজ নির্বাচন করে ধারাবাহিকভাবে প্রতিটি পর্ব পড়ুন।"
                right={
                  <span className="fcl-mem-result-badge">
                    {filteredSeries.length}{" "}
                    SERIES
                  </span>
                }
              />

              {filteredSeries.length === 0 ? (
                <EmptyState
                  title="কোনো সিরিজ পাওয়া যায়নি"
                  description="অন্য কোনো নাম দিয়ে খুঁজুন অথবা সার্চ পরিবর্তন করুন।"
                  onReset={resetFilters}
                />
              ) : (
                <div className="fcl-series-grid">
                  {filteredSeries.map(
                    (series, index) => (
                      <SeriesCard
                        key={series.name}
                        series={series}
                        index={index}
                        onOpen={() =>
                          openSeries(
                            series.name
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          ) : currentView === "episode" ? (
            /* ==========================================
               SELECTED SERIES EPISODES
               ========================================== */

            <div className="fcl-mem-results">
              <button
                type="button"
                onClick={closeSeries}
                className="fcl-back-button"
              >
                <ArrowIcon direction="left" />

                সকল সিরিজে ফিরে যান
              </button>

              {currentSeries ? (
                <>
                  <div className="fcl-selected-series-header">
                    <div>
                      <Eyebrow>
                        SERIALISED COLLECTION
                      </Eyebrow>

                      <h2>
                        {currentSeries.name}
                      </h2>

                      <p>
                        লেখক:{" "}
                        <strong>
                          {
                            currentSeries.author
                          }
                        </strong>
                      </p>
                    </div>

                    <div className="fcl-selected-series-count">
                      <strong>
                        {
                          currentSeries
                            .episodes.length
                        }
                      </strong>

                      <span>
                        TOTAL EPISODES
                      </span>
                    </div>
                  </div>

                  <div className="fcl-episode-intro">
                    <div>
                      <strong>
                        পর্বসমূহ
                      </strong>

                      <p>
                        একটি পর্ব খুললে আগের
                        খোলা পর্বটি স্বয়ংক্রিয়ভাবে
                        বন্ধ হয়ে যাবে।
                      </p>
                    </div>

                    <span>
                      CHRONOLOGICAL ORDER
                    </span>
                  </div>

                  <div className="fcl-episode-list">
                    {currentSeries.episodes.map(
                      (episode, index) => {
                        const episodeKey =
                          getEpisodeKey(
                            episode,
                            index
                          );

                        const isOpen =
                          openEpisode ===
                          episodeKey;

                        const copyKey =
                          `episode-${currentSeries.name}-${episodeKey}`;

                        return (
                          <EpisodeCard
                            key={episodeKey}
                            episode={episode}
                            episodeKey={
                              episodeKey.replace(
                                /[^a-zA-Z0-9-]/g,
                                "-"
                              )
                            }
                            isOpen={isOpen}
                            onToggle={() =>
                              toggleEpisode(
                                episodeKey
                              )
                            }
                            onCopy={(
                              url
                            ) =>
                              handleCopyLink(
                                url,
                                copyKey
                              )
                            }
                            copied={
                              copiedKey ===
                              copyKey
                            }
                          />
                        );
                      }
                    )}
                  </div>

                  <div className="fcl-series-end">
                    <span>
                      END OF COLLECTION
                    </span>

                    <button
                      type="button"
                      onClick={closeSeries}
                    >
                      অন্য সিরিজ পড়ুন

                      <ArrowIcon />
                    </button>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="সিরিজটি পাওয়া যায়নি"
                  description="সিরিজের তালিকায় ফিরে অন্য সিরিজ নির্বাচন করুন।"
                  onReset={closeSeries}
                />
              )}
            </div>
          ) : (
            /* ==========================================
               REGULAR MEMORIES
               ========================================== */

            <div className="fcl-mem-results">
              <SectionHeading
                eyebrow="THE ARCHIVE COLLECTION"
                title={
                  selectedCategory === "All"
                    ? "সংরক্ষিত স্মৃতির পাতা"
                    : selectedCategory
                }
                description={
                  selectedCategory === "All"
                    ? "FCL সদস্যদের লেখা ও স্মৃতিগুলো এখানে সংরক্ষিত রয়েছে।"
                    : "নির্বাচিত বিভাগের সংরক্ষিত লেখাগুলো পড়ুন।"
                }
                right={
                  <span className="fcl-mem-result-badge">
                    {
                      filteredMemories.length
                    }{" "}
                    POSTS
                  </span>
                }
              />

              {filteredMemories.length ===
              0 ? (
                <EmptyState
                  title="কোনো পোস্ট পাওয়া যায়নি"
                  description="আপনার অনুসন্ধানের সঙ্গে কোনো লেখা মেলেনি। অন্য শব্দ দিয়ে খুঁজুন।"
                  onReset={resetFilters}
                />
              ) : (
                <>
                  <div className="fcl-memory-grid">
                    {visibleMemories.map(
                      (memory, index) => (
                        <MemoryCard
                          key={`${memory.id}-${index}`}
                          memory={memory}
                          index={index}
                          copied={
                            copiedKey ===
                            `memory-${memory.id}-${index}`
                          }
                          onCopy={(
                            url
                          ) =>
                            handleCopyLink(
                              url,
                              `memory-${memory.id}-${index}`
                            )
                          }
                        />
                      )
                    )}
                  </div>

                  {hasMore && (
                    <div className="fcl-load-more">
                      <p>
                        দেখানো হচ্ছে{" "}
                        <strong>
                          {
                            visibleMemories.length
                          }
                        </strong>{" "}
                        /{" "}
                        {
                          filteredMemories.length
                        }{" "}
                        টি পোস্ট
                      </p>

                      <div className="fcl-load-progress">
                        <span
                          style={{
                            width: `${
                              (visibleMemories.length /
                                filteredMemories.length) *
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
                        className="fcl-load-button"
                      >
                        আরও স্মৃতি দেখুন

                        <ArrowIcon />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setVisibleCount(
                            filteredMemories.length
                          )
                        }
                        className="fcl-show-all-button"
                      >
                        সব পোস্ট দেখুন
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================================================
          ARCHIVE STATEMENT
          ================================================ */}

      <section className="fcl-mem-statement">
        <div className="fcl-mem-container">
          <div className="fcl-mem-statement-card">
            <div className="fcl-statement-content">
              <Eyebrow>
                PRESERVING THE LEGACY
              </Eyebrow>

              <h2>
                কিছু গল্প শেষ হয় না,
                <br />
                <span>
                  স্মৃতি হয়ে থেকে যায়।
                </span>
              </h2>

              <p>
                Facebook Cricket League শুধু
                একটি ক্রিকেট গ্রুপ নয়।
                এটি বন্ধুত্ব, প্রতিযোগিতা,
                সাহিত্য এবং অসংখ্য মানুষের
                একসঙ্গে পথচলার ইতিহাস।
                সেই ইতিহাস সংরক্ষণের
                একটি প্রচেষ্টা এই আর্কাইভ।
              </p>

              <Link
                href="/"
                className="fcl-primary-button"
              >
                FCL হোমপেজে ফিরুন

                <ArrowIcon />
              </Link>
            </div>

            <div className="fcl-statement-mark">
              <span>FCL</span>

              <strong>2013</strong>

              <small>
                MEMORIES FOREVER
              </small>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>
        {MEMORIES_STYLES}
      </style>
    </div>
  );
}

/* =========================================================
   FCL PREMIUM MEMORIES DESIGN SYSTEM
   ========================================================= */

const MEMORIES_STYLES = `

/* =========================================================
   ROOT
   ========================================================= */

.fcl-memories-page {
  min-height: 100vh;
  background: var(--mem-bg);
  color: var(--mem-text);
  font-family: inherit;
  transition:
    background-color .25s ease,
    color .25s ease;
}

.fcl-memories-page *,
.fcl-memories-page *::before,
.fcl-memories-page *::after {
  box-sizing: border-box;
}

.fcl-memories-page button {
  cursor: pointer;
  font-family: inherit;
}

.fcl-memories-page button,
.fcl-memories-page a {
  -webkit-tap-highlight-color: transparent;
}

.fcl-memories-page button:focus-visible,
.fcl-memories-page a:focus-visible,
.fcl-memories-page input:focus-visible {
  outline: 3px solid var(--mem-blue);
  outline-offset: 3px;
}

.fcl-memories-page ::selection {
  background: rgba(24,119,242,.22);
}

.fcl-mem-container {
  width: min(100% - 40px, 1220px);
  margin-inline: auto;
}

.fcl-mem-eyebrow {
  display: inline-block;
  color: var(--mem-blue);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .18em;
  text-transform: uppercase;
}

/* =========================================================
   HERO
   ========================================================= */

.fcl-mem-hero {
  position: relative;
  overflow: hidden;
  background: var(--mem-secondary);
  border-bottom: 1px solid var(--mem-border);
}

.fcl-mem-hero-grid {
  position: absolute;
  inset: 0;
  opacity: .5;
  pointer-events: none;
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
  mask-image: linear-gradient(
    90deg,
    transparent,
    black 20%,
    black 80%,
    transparent
  );
}

.fcl-mem-hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
  pointer-events: none;
}

.fcl-mem-hero-glow.one {
  width: 520px;
  height: 520px;
  background: rgba(24,119,242,.11);
  left: -180px;
  top: -230px;
}

.fcl-mem-hero-glow.two {
  width: 480px;
  height: 480px;
  background: rgba(245,158,11,.095);
  right: -160px;
  bottom: -200px;
}

.fcl-mem-hero-layout {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0,1.3fr) minmax(260px,.7fr);
  align-items: center;
  gap: 65px;
  padding: 93px 0 102px;
}

.fcl-mem-hero-content {
  position: relative;
  z-index: 2;
}

.fcl-mem-hero-label {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: var(--mem-blue);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .17em;
}

.fcl-mem-label-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--mem-blue);
  box-shadow: 0 0 0 5px var(--mem-blue-soft);
}

.fcl-mem-hero-content h1 {
  margin: 27px 0 0;
  color: var(--mem-heading);
  font-size: clamp(38px,5vw,70px);
  line-height: 1.28;
  font-weight: 950;
  letter-spacing: -.05em;
}

.fcl-mem-hero-content h1 span {
  background: linear-gradient(
    100deg,
    #1877F2,
    #3b82f6 45%,
    #22d3ee
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.fcl-mem-hero-content > p {
  max-width: 625px;
  margin: 25px 0 0;
  color: var(--mem-muted);
  font-size: 14px;
  line-height: 2.1;
}

.fcl-mem-hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 34px;
}

.fcl-primary-button,
.fcl-outline-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 13px;
  min-height: 45px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 900;
  text-decoration: none;
  transition:
    transform .2s ease,
    background .2s ease,
    border-color .2s ease,
    box-shadow .2s ease;
}

.fcl-primary-button {
  border: 1px solid #1877F2;
  background: #1877F2;
  color: white;
  box-shadow: 0 8px 20px rgba(24,119,242,.19);
}

.fcl-primary-button:hover {
  transform: translateY(-2px);
  background: #0866dc;
  box-shadow: 0 12px 26px rgba(24,119,242,.25);
}

.fcl-outline-button {
  color: var(--mem-heading);
  background: var(--mem-card);
  border: 1px solid var(--mem-border);
}

.fcl-outline-button:hover {
  border-color: var(--mem-blue);
  color: var(--mem-blue);
}

.fcl-mem-hero-established {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 48px;
  color: var(--mem-subtle);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .12em;
}

.fcl-mem-established-line {
  width: 35px;
  height: 1px;
  background: var(--mem-blue);
}

/* =========================================================
   HERO VISUAL
   ========================================================= */

.fcl-mem-hero-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 390px;
}

.fcl-mem-archive-emblem {
  position: relative;
  width: 320px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fcl-mem-archive-emblem::before {
  content: "";
  position: absolute;
  inset: 0;
  border: 1px dashed rgba(24,119,242,.22);
  border-radius: 50%;
  animation: fclMemRotate 70s linear infinite;
}

.fcl-emblem-circle.outer {
  width: 265px;
  height: 265px;
  border-radius: 50%;
  border: 1px solid rgba(24,119,242,.25);
  background: rgba(24,119,242,.035);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 70px rgba(24,119,242,.06),
    inset 0 0 55px rgba(24,119,242,.035);
}

.fcl-emblem-circle.inner {
  width: 205px;
  height: 205px;
  border-radius: 50%;
  border: 2px solid rgba(24,119,242,.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--mem-card);
}

.fcl-emblem-circle.inner span {
  font-size: 70px;
  font-weight: 950;
  letter-spacing: -.11em;
  line-height: 1;
  color: var(--mem-blue);
}

.fcl-emblem-circle.inner strong {
  margin-top: 13px;
  color: var(--mem-muted);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .3em;
}

.fcl-emblem-caption {
  position: absolute;
  bottom: 9px;
  color: var(--mem-muted);
  background: var(--mem-secondary);
  padding: 6px 14px;
  font-size: 9px;
  letter-spacing: .18em;
  font-weight: 900;
}

.fcl-mem-visual-caption {
  margin-top: 20px;
  text-align: center;
}

.fcl-mem-visual-caption span {
  display: block;
  color: var(--mem-subtle);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .18em;
}

.fcl-mem-visual-caption strong {
  display: block;
  margin-top: 10px;
  color: var(--mem-heading);
  font-size: 16px;
  font-weight: 850;
}

/* =========================================================
   STATS
   ========================================================= */

.fcl-mem-overview {
  background: var(--mem-bg);
  border-bottom: 1px solid var(--mem-border);
}

.fcl-mem-stats {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
}

.fcl-mem-stat {
  position: relative;
  padding: 34px 30px 34px 0;
}

.fcl-mem-stat + .fcl-mem-stat {
  padding-left: 30px;
  border-left: 1px solid var(--mem-border);
}

.fcl-mem-stat > span {
  color: var(--mem-muted);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .12em;
}

.fcl-mem-stat > strong {
  display: block;
  margin-top: 13px;
  color: var(--mem-heading);
  font-size: clamp(27px,3vw,36px);
  font-weight: 950;
  letter-spacing: -.05em;
}

.fcl-mem-stat p {
  margin: 5px 0 0;
  color: var(--mem-subtle);
  font-size: 12px;
}

/* =========================================================
   DIRECTORY
   ========================================================= */

.fcl-mem-directory {
  background: var(--mem-bg);
  padding: 82px 0 105px;
  scroll-margin-top: 85px;
}

.fcl-mem-section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 29px;
}

.fcl-mem-section-heading h2 {
  margin: 12px 0 0;
  color: var(--mem-heading);
  font-size: clamp(26px,3vw,36px);
  font-weight: 950;
  letter-spacing: -.045em;
  line-height: 1.4;
}

.fcl-mem-section-heading p {
  margin: 10px 0 0;
  color: var(--mem-muted);
  font-size: 13px;
  line-height: 1.9;
}

.fcl-mem-result-badge {
  display: inline-flex;
  align-items: center;
  padding: 9px 13px;
  border: 1px solid var(--mem-border);
  background: var(--mem-secondary);
  color: var(--mem-muted);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .09em;
  white-space: nowrap;
}

/* =========================================================
   FILTER PANEL
   ========================================================= */

.fcl-mem-filter-panel {
  padding: 24px;
  border: 1px solid var(--mem-border);
  background: var(--mem-card);
  border-radius: 17px;
  box-shadow: var(--mem-shadow);
}

.fcl-mem-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 19px;
}

.fcl-mem-filter-header > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fcl-mem-filter-header > div > span {
  color: var(--mem-blue);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .14em;
}

.fcl-mem-filter-header strong {
  color: var(--mem-heading);
  font-size: 14px;
  font-weight: 900;
}

.fcl-mem-category-count {
  color: var(--mem-subtle);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .09em;
}

.fcl-mem-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.fcl-mem-filter-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 41px;
  padding: 10px 14px;
  border: 1px solid var(--mem-border);
  border-radius: 9px;
  color: var(--mem-muted);
  background: var(--mem-secondary);
  font-size: 12px;
  font-weight: 800;
  transition: all .2s ease;
}

.fcl-mem-filter-button:hover {
  color: var(--mem-blue);
  border-color: rgba(24,119,242,.4);
}

.fcl-mem-filter-button.active {
  color: white;
  background: var(--mem-blue);
  border-color: var(--mem-blue);
  box-shadow: 0 5px 14px rgba(24,119,242,.16);
}

.fcl-mem-filter-button small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 5px;
  border-radius: 5px;
  background: rgba(100,116,139,.1);
  font-size: 10px;
  font-weight: 900;
}

.fcl-mem-filter-button.active small {
  background: rgba(255,255,255,.2);
}

.fcl-mem-search-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 24px;
  padding-top: 23px;
  border-top: 1px solid var(--mem-border);
}

.fcl-mem-search {
  position: relative;
  flex: 1;
  min-width: 0;
}

.fcl-mem-search > svg {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--mem-muted);
  pointer-events: none;
}

.fcl-mem-search input {
  display: block;
  width: 100%;
  min-height: 48px;
  padding: 12px 43px;
  border: 1px solid var(--mem-border);
  border-radius: 10px;
  background: var(--mem-secondary);
  color: var(--mem-heading);
  font-family: inherit;
  font-size: 13px;
  transition: border-color .2s ease;
}

.fcl-mem-search input::placeholder {
  color: var(--mem-subtle);
}

.fcl-mem-search input:focus {
  border-color: var(--mem-blue);
  outline: none;
}

.fcl-mem-search input:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.fcl-mem-search-clear {
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 29px;
  height: 29px;
  border: 0;
  border-radius: 7px;
  color: var(--mem-muted);
  background: var(--mem-card-raised);
  font-size: 19px;
}

.fcl-mem-filter-result {
  color: var(--mem-heading);
  font-size: 19px;
  font-weight: 950;
  white-space: nowrap;
}

.fcl-mem-filter-result span {
  margin-left: 5px;
  color: var(--mem-muted);
  font-size: 11px;
  font-weight: 650;
}

/* =========================================================
   RESULTS
   ========================================================= */

.fcl-mem-results {
  margin-top: 62px;
  animation: fclMemEnter .35s ease both;
}

.fcl-mem-heading-right {
  flex-shrink: 0;
}

.fcl-memory-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  align-items: start;
  gap: 24px;
}

/* =========================================================
   MEMORY CARDS
   ========================================================= */

.fcl-memory-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--mem-border);
  border-radius: 16px;
  background: var(--mem-card);
  box-shadow: var(--mem-shadow);
  transition:
    transform .25s ease,
    border-color .25s ease,
    box-shadow .25s ease;
}

.fcl-memory-card:hover {
  transform: translateY(-4px);
  border-color: rgba(24,119,242,.38);
  box-shadow:
    0 25px 65px rgba(24,119,242,.075);
}

.fcl-memory-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    #1877F2,
    #22d3ee,
    #f59e0b
  );
  opacity: 0;
  transition: opacity .2s ease;
}

.fcl-memory-card:hover::before {
  opacity: 1;
}

.fcl-memory-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 23px 25px 0;
}

.fcl-mem-category {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 7px 11px;
  border-radius: 7px;
  border: 1px solid;
  font-size: 10px;
  font-weight: 900;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.fcl-category-dot {
  display: inline-block;
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.fcl-mem-category.tone-blue {
  color: #3b82f6;
  background: rgba(24,119,242,.08);
  border-color: rgba(24,119,242,.23);
}

.fcl-mem-category.tone-amber {
  color: #d97706;
  background: rgba(245,158,11,.08);
  border-color: rgba(245,158,11,.23);
}

.fcl-mem-category.tone-pink {
  color: #ec4899;
  background: rgba(236,72,153,.07);
  border-color: rgba(236,72,153,.22);
}

.fcl-mem-category.tone-green {
  color: #16a34a;
  background: rgba(34,197,94,.07);
  border-color: rgba(34,197,94,.22);
}

.fcl-mem-category.tone-purple {
  color: #a855f7;
  background: rgba(168,85,247,.07);
  border-color: rgba(168,85,247,.22);
}

.fcl-mem-category.tone-cyan {
  color: #0891b2;
  background: rgba(34,211,238,.07);
  border-color: rgba(34,211,238,.22);
}

.fcl-mem-category.tone-orange {
  color: #ea580c;
  background: rgba(249,115,22,.07);
  border-color: rgba(249,115,22,.22);
}

.fcl-memory-index {
  color: var(--mem-subtle);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .1em;
  white-space: nowrap;
}

.fcl-memory-card-heading {
  padding: 25px 25px 24px;
}

.fcl-memory-card-heading h3 {
  margin: 0;
  color: var(--mem-heading);
  font-size: clamp(19px,2vw,24px);
  font-weight: 950;
  line-height: 1.55;
  letter-spacing: -.025em;
  overflow-wrap: anywhere;
  transition: color .2s ease;
}

.fcl-memory-card:hover .fcl-memory-card-heading h3 {
  color: var(--mem-blue);
}

.fcl-mem-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 11px;
  margin-top: 16px;
}

.fcl-mem-meta > span:not(.fcl-meta-divider) {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
}

.fcl-meta-label {
  color: var(--mem-subtle);
  font-weight: 700;
}

.fcl-mem-meta strong {
  color: var(--mem-text);
  font-weight: 850;
}

.fcl-meta-divider {
  height: 14px;
  width: 1px;
  background: var(--mem-border);
}

.fcl-memory-summary {
  margin: 0 25px 20px;
  padding: 16px 18px;
  border-left: 3px solid var(--mem-gold);
  background: var(--mem-gold-soft);
}

.fcl-memory-summary > span {
  color: var(--mem-gold);
  font-size: 10px;
  font-weight: 900;
}

.fcl-memory-summary p {
  margin: 9px 0 0;
  color: var(--mem-text);
  font-size: 12px;
  line-height: 1.9;
  overflow-wrap: anywhere;
}

.fcl-memory-reader-container {
  margin: 0 25px 23px;
  min-width: 0;
}

.fcl-reader-heading,
.fcl-episode-reader-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.fcl-reader-heading span:first-child,
.fcl-episode-reader-heading span:first-child {
  color: var(--mem-heading);
  font-size: 12px;
  font-weight: 900;
}

.fcl-reader-heading span:last-child,
.fcl-episode-reader-heading span:last-child {
  color: var(--mem-subtle);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .1em;
}

/* =========================================================
   STORY READER
   ========================================================= */

.fcl-story-reader {
  height: 320px;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--mem-border);
  border-radius: 11px;
  background: var(--mem-reader);
  scrollbar-width: thin;
  scrollbar-color:
    var(--mem-border)
    transparent;
}

.fcl-story-reader.compact {
  height: auto;
  max-height: 570px;
}

.fcl-reader-paper {
  padding: 23px;
  color: var(--mem-text);
  font-size: 13px;
  line-height: 2.05;
  overflow-wrap: anywhere;
  white-space: normal;
}

.fcl-story-reader.compact .fcl-reader-paper {
  padding: 28px;
  font-size: 14px;
  line-height: 2.15;
}

.fcl-story-block {
  min-width: 0;
}

.fcl-story-paragraph {
  margin: 0;
  color: var(--mem-text);
  line-height: inherit;
  overflow-wrap: anywhere;
}

.fcl-story-paragraph + .fcl-story-paragraph {
  margin-top: 11px;
}

.fcl-paragraph-space {
  height: 13px;
}

.fcl-story-section {
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid var(--mem-border);
}

.fcl-story-section-title {
  margin: 0 0 17px;
  color: var(--mem-blue);
  font-size: 14px;
  font-weight: 950;
  line-height: 1.6;
}

.fcl-text-highlight {
  color: #d97706;
  font-weight: 850;
  background: rgba(245,158,11,.09);
  padding: 1px 4px;
  border-radius: 3px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.fcl-mem-dark .fcl-text-highlight {
  color: #fbbf24;
}

.fcl-text-highlight.strong {
  font-weight: 950;
  background: rgba(245,158,11,.14);
}

.fcl-dialogue {
  padding: 9px 12px;
  border-left: 2px solid rgba(24,119,242,.4);
  background: var(--mem-blue-soft);
  border-radius: 0 6px 6px 0;
}

.fcl-dialogue-speaker {
  color: var(--mem-blue);
  font-weight: 900;
}

.fcl-reader-empty {
  padding: 35px 20px;
  text-align: center;
  color: var(--mem-muted);
  font-size: 12px;
  line-height: 1.9;
}

/* =========================================================
   MEMORY FOOTER
   ========================================================= */

.fcl-memory-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: auto;
  padding: 19px 25px;
  border-top: 1px solid var(--mem-border);
  background: var(--mem-secondary);
}

.fcl-post-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--mem-blue);
  font-size: 11px;
  font-weight: 900;
  text-decoration: none;
  transition: gap .2s ease;
}

.fcl-post-link:hover {
  gap: 13px;
}

.fcl-copy-button {
  padding: 9px 12px;
  border: 1px solid var(--mem-border);
  border-radius: 8px;
  color: var(--mem-muted);
  background: var(--mem-card);
  font-size: 11px;
  font-weight: 850;
  transition: all .2s ease;
}

.fcl-copy-button:hover {
  color: var(--mem-blue);
  border-color: var(--mem-blue);
}

.fcl-copy-button.copied {
  color: #16a34a;
}

.fcl-archive-only {
  color: var(--mem-subtle);
  font-size: 11px;
}

/* =========================================================
   SERIES GRID
   ========================================================= */

.fcl-series-grid {
  display: grid;
  grid-template-columns: repeat(3,minmax(0,1fr));
  align-items: stretch;
  gap: 22px;
}

.fcl-series-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 325px;
  padding: 25px;
  text-align: left;
  overflow: hidden;
  border: 1px solid var(--mem-border);
  border-radius: 16px;
  background: var(--mem-card);
  color: var(--mem-text);
  box-shadow: var(--mem-shadow);
  transition:
    transform .25s ease,
    border-color .25s ease,
    box-shadow .25s ease;
}

.fcl-series-card:hover {
  transform: translateY(-5px);
  border-color: rgba(24,119,242,.4);
  box-shadow:
    0 22px 55px rgba(24,119,242,.09);
}

.fcl-series-card::after {
  content: "";
  position: absolute;
  width: 240px;
  height: 240px;
  top: -130px;
  right: -100px;
  border-radius: 50%;
  background: var(--mem-blue-soft);
  filter: blur(35px);
  pointer-events: none;
}

.fcl-series-card-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.fcl-series-index {
  color: var(--mem-subtle);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .12em;
}

.fcl-series-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 9px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 850;
}

.fcl-series-status.running {
  color: #16a34a;
  border-color: rgba(34,197,94,.2);
  background: rgba(34,197,94,.07);
}

.fcl-series-status.completed {
  color: var(--mem-blue);
  border-color: rgba(24,119,242,.2);
  background: var(--mem-blue-soft);
}

.fcl-series-status > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.fcl-series-symbol {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 34px;
  padding-bottom: 21px;
  border-bottom: 1px solid var(--mem-border);
}

.fcl-series-symbol span {
  color: var(--mem-blue);
  font-size: 27px;
  font-weight: 950;
  letter-spacing: -.09em;
}

.fcl-series-symbol strong {
  color: var(--mem-border);
  font-size: 45px;
  line-height: 1;
  font-weight: 950;
}

.fcl-series-card-content {
  position: relative;
  z-index: 1;
  padding: 23px 0 27px;
}

.fcl-series-type {
  color: var(--mem-blue);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .05em;
}

.fcl-series-card-content h3 {
  margin: 11px 0;
  color: var(--mem-heading);
  font-size: 21px;
  font-weight: 950;
  line-height: 1.55;
  overflow-wrap: anywhere;
  transition: color .2s ease;
}

.fcl-series-card:hover .fcl-series-card-content h3 {
  color: var(--mem-blue);
}

.fcl-series-card-content p {
  margin: 0;
  color: var(--mem-muted);
  font-size: 12px;
}

.fcl-series-card-content p strong {
  color: var(--mem-text);
}

.fcl-series-card-bottom {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid var(--mem-border);
}

.fcl-series-card-bottom > div {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.fcl-series-card-bottom > div strong {
  color: var(--mem-heading);
  font-size: 24px;
  font-weight: 950;
}

.fcl-series-card-bottom > div span {
  color: var(--mem-muted);
  font-size: 11px;
}

.fcl-series-read {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--mem-blue);
  font-size: 12px;
  font-weight: 900;
}

/* =========================================================
   SELECTED SERIES
   ========================================================= */

.fcl-back-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 41px;
  padding: 10px 15px;
  border: 1px solid var(--mem-border);
  border-radius: 9px;
  background: var(--mem-card);
  color: var(--mem-text);
  font-size: 12px;
  font-weight: 850;
  transition: all .2s ease;
}

.fcl-back-button:hover {
  border-color: var(--mem-blue);
  color: var(--mem-blue);
}

.fcl-selected-series-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 30px;
  margin-top: 35px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--mem-border);
}

.fcl-selected-series-header h2 {
  margin: 13px 0 12px;
  color: var(--mem-heading);
  font-size: clamp(27px,3.5vw,44px);
  line-height: 1.4;
  font-weight: 950;
  letter-spacing: -.04em;
  overflow-wrap: anywhere;
}

.fcl-selected-series-header p {
  margin: 0;
  color: var(--mem-muted);
  font-size: 13px;
}

.fcl-selected-series-header p strong {
  color: var(--mem-heading);
}

.fcl-selected-series-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 125px;
  padding: 20px;
  border: 1px solid var(--mem-border);
  border-radius: 12px;
  background: var(--mem-secondary);
}

.fcl-selected-series-count strong {
  color: var(--mem-blue);
  font-size: 31px;
  font-weight: 950;
}

.fcl-selected-series-count span {
  margin-top: 5px;
  color: var(--mem-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .08em;
}

.fcl-episode-intro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin: 35px 0 20px;
}

.fcl-episode-intro strong {
  color: var(--mem-heading);
  font-size: 18px;
  font-weight: 950;
}

.fcl-episode-intro p {
  margin: 7px 0 0;
  color: var(--mem-muted);
  font-size: 12px;
}

.fcl-episode-intro > span {
  color: var(--mem-subtle);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .1em;
}

/* =========================================================
   EPISODES
   ========================================================= */

.fcl-episode-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
  max-width: 920px;
}

.fcl-episode-card {
  min-width: 0;
  border: 1px solid var(--mem-border);
  border-radius: 13px;
  background: var(--mem-card);
  overflow: hidden;
  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.fcl-episode-card:hover {
  border-color: rgba(24,119,242,.3);
}

.fcl-episode-card.is-open {
  border-color: rgba(24,119,242,.4);
  box-shadow: var(--mem-shadow);
}

.fcl-episode-trigger {
  display: flex;
  align-items: center;
  gap: 23px;
  width: 100%;
  min-height: 104px;
  padding: 18px 23px;
  text-align: left;
  border: 0;
  background: transparent;
  transition: background .2s ease;
}

.fcl-episode-trigger:hover {
  background: var(--mem-secondary);
}

.fcl-episode-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  flex-shrink: 0;
  border: 1px solid rgba(24,119,242,.2);
  border-radius: 10px;
  background: var(--mem-blue-soft);
}

.fcl-episode-number span {
  color: var(--mem-blue);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .08em;
}

.fcl-episode-number strong {
  margin-top: 4px;
  color: var(--mem-blue);
  font-size: 25px;
  font-weight: 950;
}

.fcl-episode-trigger-content {
  flex: 1;
  min-width: 0;
}

.fcl-episode-label {
  color: var(--mem-blue);
  font-size: 10px;
  font-weight: 850;
}

.fcl-episode-trigger-content h3 {
  margin: 7px 0;
  color: var(--mem-heading);
  font-size: 16px;
  font-weight: 950;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.fcl-episode-trigger-content p {
  margin: 0;
  color: var(--mem-muted);
  font-size: 11px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.fcl-episode-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 1px solid var(--mem-border);
  border-radius: 9px;
  color: var(--mem-blue);
  background: var(--mem-secondary);
}

.fcl-chevron {
  transition: transform .2s ease;
}

.fcl-chevron.is-open {
  transform: rotate(180deg);
}

.fcl-episode-content {
  padding: 28px;
  border-top: 1px solid var(--mem-border);
  background: var(--mem-secondary);
  animation: fclMemEnter .25s ease both;
}

.fcl-episode-summary {
  padding: 20px;
  margin-bottom: 24px;
  border-left: 3px solid var(--mem-gold);
  background: var(--mem-gold-soft);
}

.fcl-episode-summary > span {
  color: #d97706;
  font-size: 11px;
  font-weight: 900;
}

.fcl-mem-dark .fcl-episode-summary > span {
  color: #fbbf24;
}

.fcl-episode-summary p {
  margin: 10px 0 0;
  color: var(--mem-text);
  font-size: 13px;
  line-height: 2;
  overflow-wrap: anywhere;
}

.fcl-episode-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--mem-border);
}

.fcl-episode-footer > span {
  color: var(--mem-subtle);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .09em;
}

.fcl-episode-footer > div {
  display: flex;
  align-items: center;
  gap: 15px;
}

.fcl-series-end {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  max-width: 920px;
  margin-top: 32px;
  padding-top: 23px;
  border-top: 1px solid var(--mem-border);
}

.fcl-series-end > span {
  color: var(--mem-subtle);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .1em;
}

.fcl-series-end button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 10px 0;
  color: var(--mem-blue);
  background: transparent;
  border: 0;
  font-size: 12px;
  font-weight: 900;
}

/* =========================================================
   LOAD MORE
   ========================================================= */

.fcl-load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 55px;
}

.fcl-load-more p {
  color: var(--mem-muted);
  font-size: 12px;
}

.fcl-load-more p strong {
  color: var(--mem-heading);
}

.fcl-load-progress {
  width: min(100%,250px);
  height: 4px;
  margin: 13px 0 25px;
  border-radius: 10px;
  background: var(--mem-border);
  overflow: hidden;
}

.fcl-load-progress span {
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

.fcl-load-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  min-height: 46px;
  padding: 12px 25px;
  border: 1px solid var(--mem-blue);
  border-radius: 10px;
  background: var(--mem-blue);
  color: white;
  font-size: 12px;
  font-weight: 900;
  transition: all .2s ease;
}

.fcl-load-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 9px 22px rgba(24,119,242,.2);
}

.fcl-show-all-button {
  margin-top: 14px;
  padding: 10px;
  color: var(--mem-muted);
  background: transparent;
  border: 0;
  font-size: 11px;
  font-weight: 850;
}

.fcl-show-all-button:hover {
  color: var(--mem-blue);
}

/* =========================================================
   EMPTY / ERROR / LOADING
   ========================================================= */

.fcl-mem-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 45px 25px;
  border: 1px dashed var(--mem-border);
  border-radius: 16px;
  background: var(--mem-secondary);
  text-align: center;
}

.fcl-empty-symbol {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 75px;
  height: 75px;
  border: 1px solid rgba(24,119,242,.25);
  border-radius: 50%;
  background: var(--mem-blue-soft);
  color: var(--mem-blue);
  font-size: 19px;
  font-weight: 950;
  letter-spacing: -.07em;
}

.fcl-mem-empty h3 {
  margin: 23px 0 0;
  color: var(--mem-heading);
  font-size: 19px;
  font-weight: 950;
}

.fcl-mem-empty p {
  max-width: 430px;
  margin: 11px 0 22px;
  color: var(--mem-muted);
  font-size: 13px;
  line-height: 1.9;
}

.fcl-mem-error {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 25px;
  padding: 20px 23px;
  border: 1px solid rgba(239,68,68,.2);
  border-radius: 12px;
  background: rgba(239,68,68,.06);
}

.fcl-mem-error strong {
  color: #ef4444;
  font-size: 13px;
  font-weight: 900;
}

.fcl-mem-error p {
  margin: 6px 0 0;
  color: var(--mem-text);
  font-size: 12px;
  line-height: 1.8;
}

.fcl-mem-error button {
  flex-shrink: 0;
  padding: 10px 14px;
  border: 1px solid rgba(239,68,68,.25);
  border-radius: 8px;
  background: var(--mem-card);
  color: #ef4444;
  font-size: 11px;
  font-weight: 900;
}

.fcl-loading-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 24px;
  margin-top: 55px;
}

.fcl-loading-card {
  padding: 25px;
  border: 1px solid var(--mem-border);
  border-radius: 16px;
  background: var(--mem-card);
}

.fcl-skeleton {
  border-radius: 7px;
  background: linear-gradient(
    90deg,
    var(--mem-secondary) 20%,
    var(--mem-card-raised) 50%,
    var(--mem-secondary) 80%
  );
  background-size: 200% 100%;
  animation: fclMemSkeleton 1.5s ease infinite;
}

.fcl-skeleton.small {
  width: 100px;
  height: 23px;
}

.fcl-skeleton.title {
  width: 70%;
  height: 28px;
  margin-top: 28px;
}

.fcl-skeleton.line {
  width: 90%;
  height: 13px;
  margin-top: 16px;
}

.fcl-skeleton.reader {
  height: 250px;
  margin-top: 28px;
}

/* =========================================================
   STATEMENT
   ========================================================= */

.fcl-mem-statement {
  padding: 0 0 90px;
  background: var(--mem-bg);
}

.fcl-mem-statement-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  overflow: hidden;
  padding: 55px 60px;
  border: 1px solid var(--mem-border);
  border-radius: 19px;
  background: var(--mem-secondary);
}

.fcl-mem-statement-card::before {
  content: "";
  position: absolute;
  width: 460px;
  height: 460px;
  right: -160px;
  top: -200px;
  background: rgba(24,119,242,.09);
  border-radius: 50%;
  filter: blur(90px);
}

.fcl-statement-content {
  position: relative;
  z-index: 1;
  max-width: 630px;
}

.fcl-statement-content h2 {
  margin: 16px 0;
  color: var(--mem-heading);
  font-size: clamp(28px,3.4vw,43px);
  font-weight: 950;
  line-height: 1.45;
  letter-spacing: -.04em;
}

.fcl-statement-content h2 span {
  color: var(--mem-blue);
}

.fcl-statement-content p {
  margin: 0 0 27px;
  color: var(--mem-muted);
  font-size: 13px;
  line-height: 2.1;
}

.fcl-statement-mark {
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
  background: var(--mem-blue-soft);
}

.fcl-statement-mark span {
  color: var(--mem-blue);
  font-size: 48px;
  font-weight: 950;
  letter-spacing: -.1em;
}

.fcl-statement-mark strong {
  margin-top: 5px;
  color: var(--mem-heading);
  font-size: 16px;
  font-weight: 950;
}

.fcl-statement-mark small {
  margin-top: 9px;
  color: var(--mem-muted);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .1em;
}

/* =========================================================
   FOOTER
   ========================================================= */

.fcl-mem-footer {
  background: var(--mem-secondary);
  border-top: 1px solid var(--mem-border);
}

.fcl-mem-footer-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  padding: 35px 0;
}

.fcl-mem-footer-top strong {
  color: var(--mem-heading);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .09em;
}

.fcl-mem-footer-top p {
  margin: 8px 0 0;
  color: var(--mem-muted);
  font-size: 12px;
}

.fcl-mem-footer-top a {
  color: var(--mem-blue);
  font-size: 12px;
  font-weight: 900;
  text-decoration: none;
}

.fcl-mem-footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid var(--mem-border);
  color: var(--mem-subtle);
  font-size: 11px;
}

/* =========================================================
   ANIMATION
   ========================================================= */

@keyframes fclMemEnter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fclMemRotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fclMemSkeleton {
  to {
    background-position-x: -200%;
  }
}

/* =========================================================
   RESPONSIVE — TABLET
   ========================================================= */

@media (max-width: 1100px) {

  .fcl-mem-hero-layout {
    gap: 35px;
  }

  .fcl-mem-archive-emblem {
    width: 270px;
    height: 270px;
  }

  .fcl-emblem-circle.outer {
    width: 230px;
    height: 230px;
  }

  .fcl-emblem-circle.inner {
    width: 175px;
    height: 175px;
  }

  .fcl-emblem-circle.inner span {
    font-size: 60px;
  }

  .fcl-series-grid {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }
}

@media (max-width: 850px) {

  .fcl-mem-hero-layout {
    grid-template-columns: 1fr;
    padding: 75px 0;
  }

  .fcl-mem-hero-visual {
    display: none;
  }

  .fcl-mem-hero-content {
    max-width: 700px;
  }

  .fcl-mem-stats {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }

  .fcl-mem-stat {
    padding: 25px 20px;
  }

  .fcl-mem-stat + .fcl-mem-stat {
    padding-left: 20px;
  }

  .fcl-mem-stat:nth-child(3) {
    border-left: 0;
    border-top: 1px solid var(--mem-border);
  }

  .fcl-mem-stat:nth-child(4) {
    border-top: 1px solid var(--mem-border);
  }

  .fcl-mem-directory {
    padding: 65px 0 80px;
  }

  .fcl-memory-grid {
    gap: 18px;
  }

  .fcl-memory-card-top {
    padding: 20px 20px 0;
  }

  .fcl-memory-card-heading {
    padding: 22px 20px;
  }

  .fcl-memory-reader-container {
    margin-inline: 20px;
  }

  .fcl-memory-card-footer {
    padding: 18px 20px;
  }

  .fcl-memory-summary {
    margin-inline: 20px;
  }

  .fcl-mem-statement-card {
    padding: 45px;
  }

  .fcl-statement-mark {
    width: 145px;
    height: 145px;
  }

  .fcl-statement-mark span {
    font-size: 37px;
  }
}

/* =========================================================
   RESPONSIVE — MOBILE
   ========================================================= */

@media (max-width: 640px) {

  .fcl-mem-container {
    width: min(100% - 28px,1220px);
  }

  .fcl-mem-hero-layout {
    padding: 60px 0 65px;
  }

  .fcl-mem-hero-label {
    font-size: 9px;
    letter-spacing: .1em;
  }

  .fcl-mem-hero-content h1 {
    margin-top: 23px;
    font-size: clamp(33px,8.5vw,45px);
    line-height: 1.33;
  }

  .fcl-mem-hero-content > p {
    margin-top: 20px;
    font-size: 12px;
    line-height: 2;
  }

  .fcl-mem-hero-actions {
    margin-top: 28px;
    gap: 10px;
  }

  .fcl-primary-button,
  .fcl-outline-button {
    min-height: 43px;
    padding: 11px 15px;
    font-size: 11px;
  }

  .fcl-mem-hero-established {
    margin-top: 38px;
    font-size: 9px;
  }

  .fcl-mem-stat {
    padding: 22px 12px 22px 0;
  }

  .fcl-mem-stat + .fcl-mem-stat {
    padding-left: 15px;
  }

  .fcl-mem-stat > span {
    font-size: 8px;
    letter-spacing: .07em;
  }

  .fcl-mem-stat > strong {
    font-size: 28px;
  }

  .fcl-mem-stat p {
    font-size: 11px;
  }

  .fcl-mem-directory {
    padding: 48px 0 65px;
  }

  .fcl-mem-section-heading {
    display: block;
    margin-bottom: 23px;
  }

  .fcl-mem-section-heading h2 {
    font-size: 27px;
  }

  .fcl-mem-section-heading p {
    font-size: 12px;
  }

  .fcl-mem-heading-right {
    margin-top: 15px;
  }

  .fcl-mem-filter-panel {
    padding: 17px;
    border-radius: 13px;
  }

  .fcl-mem-filter-header {
    margin-bottom: 15px;
  }

  .fcl-mem-filter-header strong {
    font-size: 12px;
  }

  .fcl-mem-category-count {
    font-size: 9px;
  }

  .fcl-mem-category-list {
    display: grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 8px;
  }

  .fcl-mem-filter-button {
    justify-content: space-between;
    min-width: 0;
    min-height: 42px;
    padding: 10px;
    gap: 6px;
    font-size: 10px;
    text-align: left;
  }

  .fcl-mem-filter-button > span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .fcl-mem-filter-button small {
    flex-shrink: 0;
  }

  .fcl-mem-search-row {
    flex-direction: column;
    align-items: stretch;
    gap: 13px;
    margin-top: 19px;
    padding-top: 19px;
  }

  .fcl-mem-search {
    width: 100%;
  }

  .fcl-mem-search input {
    min-height: 46px;
    font-size: 12px;
  }

  .fcl-mem-filter-result {
    text-align: right;
    font-size: 16px;
  }

  .fcl-mem-results {
    margin-top: 43px;
  }

  .fcl-memory-grid,
  .fcl-series-grid,
  .fcl-loading-grid {
    grid-template-columns: 1fr;
    gap: 17px;
  }

  .fcl-memory-card {
    border-radius: 13px;
  }

  .fcl-memory-card-top {
    padding: 19px 18px 0;
  }

  .fcl-memory-card-heading {
    padding: 20px 18px;
  }

  .fcl-memory-card-heading h3 {
    font-size: 20px;
  }

  .fcl-mem-meta {
    gap: 8px;
  }

  .fcl-mem-meta > span:not(.fcl-meta-divider) {
    font-size: 10px;
  }

  .fcl-memory-summary {
    margin: 0 18px 18px;
    padding: 14px;
  }

  .fcl-memory-reader-container {
    margin: 0 18px 19px;
  }

  .fcl-story-reader {
    height: 300px;
  }

  .fcl-reader-paper {
    padding: 18px;
    font-size: 12px;
    line-height: 2.05;
  }

  .fcl-story-reader.compact {
    max-height: 480px;
    height: auto;
  }

  .fcl-story-reader.compact .fcl-reader-paper {
    padding: 19px;
    font-size: 13px;
    line-height: 2.1;
  }

  .fcl-story-section-title {
    font-size: 13px;
  }

  .fcl-memory-card-footer {
    padding: 16px 18px;
  }

  .fcl-post-link,
  .fcl-copy-button {
    font-size: 10px;
  }

  .fcl-series-card {
    min-height: 295px;
    padding: 22px;
  }

  .fcl-series-card-content h3 {
    font-size: 20px;
  }

  .fcl-selected-series-header {
    align-items: flex-start;
    gap: 14px;
  }

  .fcl-selected-series-header h2 {
    font-size: 27px;
  }

  .fcl-selected-series-count {
    min-width: 80px;
    padding: 15px 9px;
  }

  .fcl-selected-series-count strong {
    font-size: 25px;
  }

  .fcl-selected-series-count span {
    font-size: 7px;
    text-align: center;
  }

  .fcl-episode-intro {
    margin: 27px 0 17px;
  }

  .fcl-episode-intro strong {
    font-size: 16px;
  }

  .fcl-episode-intro p {
    font-size: 11px;
    line-height: 1.8;
  }

  .fcl-episode-intro > span {
    display: none;
  }

  .fcl-episode-trigger {
    gap: 12px;
    min-height: 89px;
    padding: 14px;
  }

  .fcl-episode-number {
    width: 54px;
    height: 58px;
  }

  .fcl-episode-number span {
    font-size: 7px;
  }

  .fcl-episode-number strong {
    font-size: 22px;
  }

  .fcl-episode-trigger-content h3 {
    font-size: 13px;
  }

  .fcl-episode-trigger-content p {
    font-size: 10px;
  }

  .fcl-episode-toggle {
    width: 30px;
    height: 30px;
  }

  .fcl-episode-content {
    padding: 16px;
  }

  .fcl-episode-summary {
    padding: 16px;
  }

  .fcl-episode-summary p {
    font-size: 12px;
  }

  .fcl-episode-footer {
    align-items: flex-start;
    gap: 10px;
  }

  .fcl-episode-footer > span {
    max-width: 110px;
    font-size: 8px;
    line-height: 1.8;
  }

  .fcl-episode-footer > div {
    gap: 10px;
  }

  .fcl-series-end > span {
    font-size: 8px;
  }

  .fcl-series-end button {
    font-size: 11px;
  }

  .fcl-mem-error {
    flex-direction: column;
    align-items: stretch;
  }

  .fcl-mem-error button {
    width: fit-content;
  }

  .fcl-mem-statement {
    padding-bottom: 55px;
  }

  .fcl-mem-statement-card {
    padding: 30px 24px;
  }

  .fcl-statement-content h2 {
    font-size: 27px;
  }

  .fcl-statement-content p {
    font-size: 12px;
  }

  .fcl-statement-mark {
    display: none;
  }

  .fcl-mem-footer-top {
    align-items: flex-start;
  }

  .fcl-mem-footer-top strong {
    font-size: 10px;
  }

  .fcl-mem-footer-top a {
    flex-shrink: 0;
    font-size: 11px;
  }

  .fcl-mem-footer-bottom {
    flex-direction: column;
    gap: 8px;
    font-size: 10px;
  }
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {

  .fcl-memories-page *,
  .fcl-memories-page *::before,
  .fcl-memories-page *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}

`;