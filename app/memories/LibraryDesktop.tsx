"use client";

/**
 * FCL Memory Page — Desktop "Virtual Library"
 * বুকশেলফ → বই ক্লিক → কভার খোলা → দুই পাতার রিডার
 * এই ফাইল সম্পূর্ণ self-contained (নিজের আইকন, স্টাইল ও হেল্পার আছে)।
 * পেজের থিম ভ্যারিয়েবল (--mem-*) ব্যবহার করে, তাই dark/light দুটোতেই কাজ করবে।
 */

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

/* ───────────────────────── Types ───────────────────────── */

export type ShelfRect = { left: number; top: number; width: number; height: number };
export type DSortMode = "newest" | "oldest" | "az" | "za";

export type DReaderItem = {
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

export type DSeries = {
  name: string;
  author: string;
  status: string;
  latestDate: string;
  episodes: { summary?: string; Content?: string }[];
};

type ShelfBook = {
  key: string;
  title: string;
  author: string;
  date: string;
  category: string;
  tone: string;
  preview: string;
  badge: string;
  kind: "item" | "series";
  minutes: number;
  count?: number;
  seriesName?: string;
};

export interface LibraryDesktopProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  mode: "memories" | "series" | "episodes";
  categories: string[];
  categoryCounts: Map<string, number>;
  selectedCategory: string;
  onCategory: (category: string) => void;
  searchQuery: string;
  onSearch: (value: string) => void;
  sortMode: DSortMode;
  onSort: (value: DSortMode) => void;
  readerItems: DReaderItem[];
  filteredSeries: DSeries[];
  currentSeries?: { name: string; episodes: unknown[] };
  onOpenSeries: (name: string) => void;
  onCloseSeries: () => void;
  onResetFilters: () => void;
  stats: { regular: number; series: number; episodes: number };
  contentRef: RefObject<HTMLElement | null>;
  onScrollToContent: () => void;
  open: boolean;
  openRect: ShelfRect | null;
  activeIndex: number;
  onOpenItem: (key: string, rect: ShelfRect | null) => void;
  onCloseReader: () => void;
  onPage: (direction: number) => void;
  fontSize: number;
  onFontChange: (delta: number) => void;
  copiedKey: string | null;
  onCopy: () => void;
}

/* ───────────────────────── Helpers ───────────────────────── */

function normalize(value: unknown): string {
  return String(value ?? "").trim();
}

function validUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
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
    .replace(/^সারসংক্ষেপ:\s*/i, "")
    .replace(/[*#_]/g, "")
    .replace(/\s+/g, " ");
  if (cleaned.length <= length) return cleaned;
  return `${cleaned.slice(0, length).trim()}…`;
}

function getTone(category: string): string {
  const value = category.toLowerCase();
  if (value.includes("স্মৃতি") || value.includes("memory")) return "gold";
  if (value.includes("গান") || value.includes("song")) return "pink";
  if (value.includes("কবিতা") || value.includes("poem")) return "cyan";
  if (value.includes("গল্প") || value.includes("story")) return "green";
  if (value.includes("সিরিজ") || value.includes("নাটক") || value.includes("series")) return "purple";
  return "blue";
}

function hashString(value: string): number {
  let hash = 7;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

function toBn(value: number | string): string {
  return String(value).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
}

function readingMinutes(text: string): number {
  const words = normalize(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function getSpineSize(book: ShelfBook) {
  const h = hashString(`${book.key}${book.title}`);
  if (book.kind === "series") {
    return { w: 68 + (h % 5) * 4, h: 204 + ((h >> 4) % 6) * 8 };
  }
  return { w: 42 + (h % 6) * 4, h: 164 + ((h >> 4) % 7) * 8 };
}

function rectOf(el: HTMLElement): ShelfRect {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  return desktop;
}

const SORT_OPTIONS: { value: DSortMode; label: string }[] = [
  { value: "newest", label: "নতুন আগে" },
  { value: "oldest", label: "পুরোনো আগে" },
  { value: "az", label: "A–Z" },
  { value: "za", label: "Z–A" },
];

/* ───────────────────────── Icons ───────────────────────── */

type IconName =
  | "search" | "arrow" | "left" | "right" | "close" | "book" | "list" | "sort"
  | "copy" | "external" | "home" | "plus" | "minus" | "check" | "refresh"
  | "layers" | "sparkles";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>),
    arrow: (<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>),
    left: (<><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>),
    right: (<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>),
    close: (<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>),
    book: (<><path d="M12 7v14" /><path d="M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2h-3a4 4 0 0 0-4 4 4 4 0 0 0-4-4H5a2 2 0 0 0-2 2Z" /></>),
    list: (<><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></>),
    sort: (<><path d="M4 7h16" /><path d="M7 12h10" /><path d="M10 17h4" /></>),
    copy: (<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>),
    external: (<><path d="M14 4h6v6" /><path d="M10 14 20 4" /><path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5" /></>),
    home: (<><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9" /><path d="M9 21v-7h6v7" /></>),
    plus: (<><path d="M12 5v14" /><path d="M5 12h14" /></>),
    minus: <path d="M5 12h14" />,
    check: <path d="m5 12 4 4L19 6" />,
    refresh: (<><path d="M20 11a8 8 0 0 0-14-5L4 8" /><path d="M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14 5l2-2" /><path d="M20 20v-4h-4" /></>),
    layers: (<><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>),
    sparkles: (<><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 17 .7 1.3L21 19l-1.3.7L19 21l-.7-1.3L17 19l1.3-.7L19 17Z" /></>),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/* ───────────────────────── Story rendering ───────────────────────── */

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[\s\S]*?\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return <strong className="pc-hl" key={index}>{part.slice(2, -2).trim()}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return <strong className="pc-hl" key={index}>{part.slice(1, -1).trim()}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function Story({ content, category }: { content: string; category: string }) {
  const lines = useMemo(() => {
    const cleaned = normalize(content)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/^সারসংক্ষেপ:\s*[^\n]*(?:\n|$)/i, "");
    return cleaned.split("\n");
  }, [content]);

  if (!normalize(content)) {
    return (
      <div className="pc-story-empty">
        <Icon name="book" size={30} />
        <p>এই লেখার মূল বিষয়বস্তু এখনো সংরক্ষিত হয়নি।</p>
      </div>
    );
  }

  const isDrama = /নাটক|drama|সিরিজ|series/i.test(category);

  return (
    <div className="pc-story">
      {lines.map((line, index) => {
        const text = line.trim();
        if (!text) return <div key={index} className="pc-story-space" aria-hidden="true" />;

        const heading = /^(?:[০-৯\d]{1,2}\.|পর্ব\s*[০-৯\d]+|দৃশ্য\s*[০-৯\d]+|Part\s*\d+|Scene\s*\d+)/i.test(text);
        if (heading && text.length < 90) {
          return <h4 key={index} className="pc-story-heading">{renderInline(text)}</h4>;
        }

        const dialogue = isDrama ? text.match(/^([^:\n]{1,50}):\s+(.+)$/) : null;
        if (dialogue) {
          return (
            <p key={index} className="pc-story-dialogue">
              <strong>{dialogue[1]}:</strong> {renderInline(dialogue[2])}
            </p>
          );
        }
        return <p key={index} className="pc-story-p">{renderInline(text)}</p>;
      })}
    </div>
  );
}

function Badge({ category }: { category: string }) {
  return (
    <span className={`pc-badge pc-bt-${getTone(category)}`}>
      <span className="pc-badge-dot" />
      {category || "আর্কাইভ"}
    </span>
  );
}

/* ───────────────────────── Hover preview ───────────────────────── */

function ShelfPreview({ book, rect }: { book: ShelfBook; rect: ShelfRect }) {
  const width = 310;
  const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
  const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), viewportWidth - width - 12);
  const above = rect.top > 260;
  const style: CSSProperties = {
    left,
    width,
    top: above ? rect.top - 16 : rect.top + rect.height + 16,
    transform: above ? "translateY(-100%)" : undefined,
  };

  return (
    <div className="pc-preview" style={style} role="tooltip">
      <Badge category={book.category} />
      <strong>{book.title}</strong>
      <span className="pc-preview-meta">
        ✦ {book.author || "অজানা লেখক"}
        {book.date ? ` · ${formatDate(book.date)}` : ""}
      </span>
      {book.preview && <p>{book.preview}</p>}
      <div className="pc-preview-foot">
        <span>
          {book.kind === "series" ? `${toBn(book.count || 0)} টি পর্ব` : `পড়তে প্রায় ${toBn(book.minutes)} মিনিট`}
        </span>
        <span>
          খুলতে ক্লিক করুন <Icon name="arrow" size={13} />
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────── Open-book: left page ───────────────────────── */

function LeftPage({
  item, pageNo, minutes, prev, next, copied, onPrev, onNext, onCopy,
}: {
  item: DReaderItem;
  pageNo: string;
  minutes: number;
  prev: DReaderItem | null;
  next: DReaderItem | null;
  copied: boolean;
  onPrev: () => void;
  onNext: () => void;
  onCopy: () => void;
}) {
  const glimpse = item.summary ? "" : excerpt(item.content, 280);

  return (
    <div className="pc-left">
      <div className="pc-left-top">
        <Badge category={item.category} />
        <span>FCL / {pageNo}</span>
      </div>

      <div className="pc-left-title">
        <span className="pc-chapter">{item.number ? `EPISODE ${item.number}` : "A PAGE FROM OUR HISTORY"}</span>
        <h2>{item.title}</h2>
        <div className="pc-author-row">
          <span>✦ {item.author || "অজানা লেখক"}</span>
          {item.date && <span>{formatDate(item.date)}</span>}
        </div>
      </div>

      <div className="pc-ornament"><span /><strong>✦</strong><span /></div>

      <div className="pc-left-body">
        {item.summary ? (
          <div className="pc-summary">
            <span>✧ সারসংক্ষেপ</span>
            <p>{renderInline(item.summary)}</p>
          </div>
        ) : glimpse ? (
          <div className="pc-summary">
            <span>✧ ঝলক</span>
            <p>{glimpse}</p>
          </div>
        ) : null}
        <div className="pc-chips">
          <span><Icon name="book" size={13} /> পড়তে প্রায় {toBn(minutes)} মিনিট</span>
        </div>
      </div>

      <div className="pc-left-nav">
        <button type="button" className="pc-nav-btn" onClick={onPrev} disabled={!prev}>
          <Icon name="left" size={16} />
          <span className="pc-nav-text">
            <small>আগের পাতা</small>
            <b>{prev ? prev.title : "—"}</b>
          </span>
        </button>
        <button type="button" className="pc-nav-btn next" onClick={onNext} disabled={!next}>
          <span className="pc-nav-text">
            <small>পরের পাতা</small>
            <b>{next ? next.title : "—"}</b>
          </span>
          <Icon name="right" size={16} />
        </button>
      </div>

      <div className="pc-left-actions">
        {validUrl(item.url) ? (
          <>
            <button type="button" className="pc-action" onClick={onCopy}>
              <Icon name={copied ? "check" : "copy"} size={14} />
              {copied ? "কপি হয়েছে" : "লিংক কপি"}
            </button>
            <a className="pc-action primary" href={item.url} target="_blank" rel="noopener noreferrer">
              মূল পোস্ট <Icon name="external" size={14} />
            </a>
          </>
        ) : (
          <span className="pc-archive-label">সংরক্ষিত আর্কাইভ</span>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Open-book overlay ───────────────────────── */

type Stage = "enter" | "opening" | "read" | "closing" | "leaving";

function BookOverlay({
  item, index, total, prev, next, rect, fontSize, copied,
  onPrev, onNext, onFontChange, onCopy, onClose,
}: {
  item: DReaderItem;
  index: number;
  total: number;
  prev: DReaderItem | null;
  next: DReaderItem | null;
  rect: ShelfRect | null;
  fontSize: number;
  copied: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFontChange: (delta: number) => void;
  onCopy: () => void;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<Stage>("enter");
  const [progress, setProgress] = useState(0);
  const stageRef = useRef<Stage>("enter");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const go = useCallback((next: Stage) => {
    stageRef.current = next;
    setStage(next);
  }, []);

  useEffect(() => {
    timers.current.push(setTimeout(() => go("opening"), 850));
    timers.current.push(setTimeout(() => go("read"), 1950));
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [go]);

  const requestClose = useCallback(() => {
    if (stageRef.current === "closing" || stageRef.current === "leaving") return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    go("closing");
    timers.current.push(setTimeout(() => go("leaving"), 950));
    timers.current.push(setTimeout(onClose, 1300));
  }, [go, onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
      else if (stageRef.current === "read") {
        if (event.key === "ArrowRight") onNext();
        if (event.key === "ArrowLeft") onPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose, onNext, onPrev]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight - el.clientHeight;
    setProgress(scrollable <= 0 ? 100 : Math.min(100, Math.round((el.scrollTop / scrollable) * 100)));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = 0;
    setProgress(0);
    const id = requestAnimationFrame(handleScroll);
    return () => cancelAnimationFrame(id);
  }, [item.key, handleScroll]);

  const flyStyle = useMemo<CSSProperties>(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (!rect) return { "--dx": "0px", "--dy": "40px", "--ds": "0.8" } as CSSProperties;
    const dx = rect.left + rect.width / 2 - vw / 2;
    const dy = rect.top + rect.height / 2 - vh / 2;
    const bookH = Math.min(690, vh - 100);
    const ds = Math.max(0.14, Math.min(0.5, rect.height / bookH));
    return { "--dx": `${dx}px`, "--dy": `${dy}px`, "--ds": ds.toFixed(3) } as CSSProperties;
  }, [rect]);

  const tone = getTone(item.category);
  const pageNo = String(index + 1).padStart(2, "0");
  const minutes = readingMinutes(item.content);
  const showLeft = stage !== "enter" && stage !== "opening";

  const leftProps = { item, pageNo, minutes, prev, next, copied, onPrev, onNext, onCopy };

  return (
    <div
      className={`pc-overlay ${stage === "leaving" ? "leaving" : ""}`}
      onMouseDown={(event) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".pc-page, .pc-cover, .pc-overlay-close")) requestClose();
      }}
    >
      <button type="button" className="pc-overlay-close" onClick={requestClose} aria-label="বই বন্ধ করুন">
        <Icon name="close" size={16} />
        বই বন্ধ করুন
        <kbd>Esc</kbd>
      </button>

      <div className="pc-fly" style={flyStyle}>
        <div className={`pc-book stage-${stage}`}>
          <div className="pc-book-shadow" />

          <section className="pc-page pc-page-left" aria-label="বইয়ের বাম পাতা">
            {showLeft && <LeftPage {...leftProps} />}
          </section>

          <section className="pc-page pc-page-right" aria-label="বইয়ের ডান পাতা">
            <div className="pc-right-top">
              <span className="pc-right-brand"><Icon name="book" size={14} /> FCL MEMORY BOOK</span>
              <div className="pc-right-tools">
                <span className="pc-right-count">{pageNo}<small> / {total}</small></span>
                <button type="button" onClick={() => onFontChange(-1)} disabled={fontSize <= 13} aria-label="লেখা ছোট করুন" title="লেখা ছোট করুন">
                  <Icon name="minus" size={15} />
                </button>
                <button type="button" onClick={() => onFontChange(1)} disabled={fontSize >= 22} aria-label="লেখা বড় করুন" title="লেখা বড় করুন">
                  <Icon name="plus" size={15} />
                </button>
              </div>
            </div>

            <div className="pc-right-scroll" ref={scrollRef} onScroll={handleScroll}>
              <div key={item.key} className="pc-turn">
                <div className="pc-story-wrap" style={{ "--reader-font-size": `${fontSize}px` } as CSSProperties}>
                  <Story content={item.content} category={item.category} />
                </div>
                <div className="pc-story-end">
                  <span>✦</span>
                  <p>একটি স্মৃতি, একটি ইতিহাস।</p>
                  <small>FACEBOOK CRICKET LEAGUE</small>
                </div>
              </div>
            </div>

            <div className="pc-right-progress"><span style={{ width: `${progress}%` }} /></div>
          </section>

          <div className="pc-cover">
            <div className={`pc-cover-front pc-t-${tone}`}>
              <div className="pc-cover-hinge" />
              <div className="pc-cover-frame">
                <span className="pc-cover-top">THE FCL ARCHIVE</span>
                <div className="pc-cover-emblem">FCL</div>
                <div className="pc-cover-rule" />
                <h2>{item.title}</h2>
                <p>✦ {item.author || "অজানা লেখক"}</p>
                <small>
                  {item.category}
                  {item.date ? ` · ${formatDate(item.date)}` : ""}
                </small>
                <b>2013</b>
              </div>
            </div>
            <div className="pc-cover-back">
              <LeftPage {...leftProps} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Loading skeleton ───────────────────────── */

function ShelfLoading() {
  return (
    <div className="pc-case" aria-busy="true" aria-label="Loading archive">
      <div className="pc-case-inner">
        {[0, 1, 2].map((row) => (
          <div className="pc-shelf" key={row}>
            <div className="pc-shelf-books">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className="pc-skeleton"
                  style={{ width: 42 + ((i * 7 + row * 3) % 5) * 5, height: 160 + ((i * 11 + row * 5) % 6) * 9 }}
                />
              ))}
            </div>
            <div className="pc-shelf-board" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Main desktop library ───────────────────────── */

export function LibraryDesktop(props: LibraryDesktopProps) {
  const {
    loading, error, onRetry, mode, categories, categoryCounts, selectedCategory, onCategory,
    searchQuery, onSearch, sortMode, onSort, readerItems, filteredSeries, currentSeries,
    onOpenSeries, onCloseSeries, onResetFilters, stats, contentRef, onScrollToContent,
    open, openRect, activeIndex, onOpenItem, onCloseReader, onPage, fontSize, onFontChange,
    copiedKey, onCopy,
  } = props;

  const measureRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(1100);
  const [rowsShown, setRowsShown] = useState(3);
  const [hover, setHover] = useState<{ book: ShelfBook; rect: ShelfRect } | null>(null);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const clear = () => setHover(null);
    window.addEventListener("scroll", clear, { passive: true });
    return () => window.removeEventListener("scroll", clear);
  }, []);

  useEffect(() => {
    setRowsShown(3);
  }, [mode, selectedCategory, searchQuery, sortMode, currentSeries?.name]);

  const books = useMemo<ShelfBook[]>(() => {
    if (mode === "series") {
      return filteredSeries.map((series, index) => ({
        key: `series-${series.name}`,
        title: series.name,
        author: series.author,
        date: series.latestDate,
        category: "ধারাবাহিক সিরিজ",
        tone: "purple",
        preview: excerpt(
          series.episodes.find((e) => normalize(e.summary))?.summary || series.episodes[0]?.Content || "",
          150
        ),
        badge: String(index + 1).padStart(2, "0"),
        kind: "series" as const,
        minutes: 0,
        count: series.episodes.length,
        seriesName: series.name,
      }));
    }
    return readerItems.map((item, index) => ({
      key: item.key,
      title: item.title,
      author: item.author,
      date: item.date,
      category: item.category,
      tone: getTone(item.category),
      preview: excerpt(item.summary || item.content, 170),
      badge: item.number || String(index + 1).padStart(2, "0"),
      kind: "item" as const,
      minutes: readingMinutes(item.content),
    }));
  }, [mode, filteredSeries, readerItems]);

  const rows = useMemo(() => {
    const available = Math.max(320, width - 140);
    const out: ShelfBook[][] = [];
    let current: ShelfBook[] = [];
    let used = 0;
    for (const book of books) {
      const need = getSpineSize(book).w + 8;
      if (used + need > available && current.length) {
        out.push(current);
        current = [];
        used = 0;
      }
      current.push(book);
      used += need;
    }
    if (current.length) out.push(current);
    return out;
  }, [books, width]);

  const visibleRows = rows.slice(0, rowsShown);

  const pick = (book: ShelfBook, el: HTMLElement | null) => {
    setHover(null);
    if (book.kind === "series") {
      onOpenSeries(book.seriesName || book.title);
      return;
    }
    onOpenItem(book.key, el ? rectOf(el) : null);
  };

  const handleRandom = () => {
    if (!books.length) return;
    const book = books[Math.floor(Math.random() * books.length)];
    const el = measureRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(book.key)}"]`) ?? null;
    pick(book, el);
  };

  const locked = mode === "episodes";
  const activeItem = activeIndex >= 0 ? readerItems[activeIndex] ?? null : null;
  const prevItem = activeIndex > 0 ? readerItems[activeIndex - 1] ?? null : null;
  const nextItem = activeIndex >= 0 && activeIndex < readerItems.length - 1 ? readerItems[activeIndex + 1] : null;

  return (
    <div className="pc-lib">
      {/* ───── Hero ───── */}
      <header className="pc-hero">
        <div className="pc-hero-glow" />
        <div className="pc-hero-grid" />
        <div className="pc-container">
          <div className="pc-hero-inner">
            <div className="pc-hero-text">
              <div className="pc-eyebrow">
                <span className="pc-live-dot" />
                FCL VIRTUAL LIBRARY
              </div>
              <h1>
                স্মৃতির লাইব্রেরি
                <span>Facebook Cricket League</span>
              </h1>
              <p>
                শেলফ থেকে একটি বই বেছে নিন, কভার খুলুন, আর পাতায় পাতায় ফিরে যান FCL-এর ভালোবাসায় লেখা ইতিহাসে।
              </p>
              <div className="pc-hero-actions">
                <button type="button" className="pc-btn primary" onClick={onScrollToContent}>
                  <Icon name="book" size={16} />
                  শেলফে যান
                  <Icon name="arrow" size={15} />
                </button>
                <Link href="/" className="pc-btn">
                  <Icon name="home" size={15} />
                  FCL হোম
                </Link>
              </div>
            </div>

            <div className="pc-plates">
              <div className="pc-plate">
                <Icon name="book" size={18} />
                <strong>{loading ? "—" : toBn(stats.regular)}</strong>
                <span>সংরক্ষিত লেখা</span>
              </div>
              <div className="pc-plate">
                <Icon name="layers" size={18} />
                <strong>{loading ? "—" : toBn(stats.series)}</strong>
                <span>সাহিত্য সিরিজ</span>
              </div>
              <div className="pc-plate">
                <Icon name="list" size={18} />
                <strong>{loading ? "—" : toBn(stats.episodes)}</strong>
                <span>প্রকাশিত পর্ব</span>
              </div>
              <div className="pc-plate">
                <Icon name="sparkles" size={18} />
                <strong>২০১৩</strong>
                <span>FCL প্রতিষ্ঠা</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ───── Library room ───── */}
      <section ref={contentRef} id="fcl-memory-workspace" className="pc-room">
        <div className="pc-container">
          <div className="pc-room-head">
            <div>
              <span className="pc-section-eyebrow">✦ EXPLORE THE ARCHIVE</span>
              <h2>স্মৃতি ও সাহিত্য সংগ্রহ</h2>
            </div>
            <span className="pc-count">
              {loading ? "..." : toBn(books.length)}
              <small>{mode === "series" ? "SERIES" : "BOOKS"}</small>
            </span>
          </div>

          <div className="pc-controls">
            <div className="pc-cats">
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    className={`pc-cat ${active ? "active" : ""}`}
                    onClick={() => onCategory(category)}
                    aria-pressed={active}
                  >
                    {category === "All" ? "সব স্মৃতি" : category}
                    <small>{toBn(categoryCounts.get(category) || 0)}</small>
                  </button>
                );
              })}
            </div>

            <div className="pc-controls-row">
              <div className="pc-search">
                <Icon name="search" size={17} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => onSearch(event.target.value)}
                  disabled={locked}
                  placeholder={
                    mode === "series"
                      ? "সিরিজ বা লেখক খুঁজুন..."
                      : locked
                      ? "সিরিজের পর্বসমূহ"
                      : "স্মৃতি, গল্প, লেখক খুঁজুন..."
                  }
                  aria-label="Search archive"
                />
                {searchQuery && (
                  <button type="button" onClick={() => onSearch("")} aria-label="Clear search">
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>

              <div className="pc-sort" role="group" aria-label="সাজান">
                <span className="pc-sort-label"><Icon name="sort" size={15} /> সাজান</span>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={sortMode === option.value ? "active" : ""}
                    onClick={() => onSort(option.value)}
                    disabled={locked}
                    aria-pressed={sortMode === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <button type="button" className="pc-random" onClick={handleRandom} disabled={loading || !books.length}>
                <Icon name="sparkles" size={15} />
                এলোমেলো বই
              </button>
            </div>
          </div>

          {error && !loading && (
            <div className="pc-error" role="alert">
              <div>
                <strong>আর্কাইভ নোটিশ</strong>
                <p>{error}</p>
              </div>
              <button type="button" onClick={onRetry}>
                <Icon name="refresh" size={14} />
                আবার চেষ্টা
              </button>
            </div>
          )}

          {mode === "episodes" && currentSeries && (
            <div className="pc-crumb">
              <button type="button" onClick={onCloseSeries}>
                <Icon name="left" size={15} />
                সকল সিরিজ
              </button>
              <span>/</span>
              <strong>{currentSeries.name}</strong>
              <small>{toBn(currentSeries.episodes.length)} পর্ব</small>
            </div>
          )}

          <div ref={measureRef} className="pc-measure">
            {loading ? (
              <ShelfLoading />
            ) : books.length === 0 ? (
              <div className="pc-empty">
                <div className="pc-empty-icon"><Icon name="book" size={27} /></div>
                <h3>{mode === "series" ? "কোনো সিরিজ পাওয়া যায়নি" : "কোনো স্মৃতি পাওয়া যায়নি"}</h3>
                <p>আপনার অনুসন্ধানের সঙ্গে কিছু মেলেনি। অন্য শব্দ দিয়ে খুঁজুন অথবা ফিল্টার পরিবর্তন করুন।</p>
                <button type="button" className="pc-btn primary" onClick={onResetFilters}>
                  সব স্মৃতি দেখুন
                  <Icon name="arrow" size={15} />
                </button>
              </div>
            ) : (
              <div className="pc-case">
                <div className="pc-case-top">
                  <span>✦ {mode === "series" ? "SERIES SHELF" : mode === "episodes" ? "EPISODE SHELF" : "FCL MEMORY SHELF"}</span>
                  <span>{toBn(books.length)} টি {mode === "series" ? "সিরিজ" : "বই"}</span>
                </div>

                <div className="pc-case-inner">
                  {visibleRows.map((row, r) => (
                    <div className="pc-shelf" key={`${r}-${row[0]?.key}`}>
                      <div className="pc-shelf-books">
                        {row.map((book, c) => {
                          const size = getSpineSize(book);
                          return (
                            <button
                              key={book.key}
                              type="button"
                              data-key={book.key}
                              className={`pc-spine pc-t-${book.tone} ${book.kind === "series" ? "series" : ""}`}
                              style={{ width: size.w, height: size.h, "--i": c + r * 4 } as CSSProperties}
                              aria-label={`${book.title} — ${book.author}`}
                              onClick={(event) => pick(book, event.currentTarget)}
                              onMouseEnter={(event) => setHover({ book, rect: rectOf(event.currentTarget) })}
                              onMouseLeave={() => setHover(null)}
                              onFocus={(event) => setHover({ book, rect: rectOf(event.currentTarget) })}
                              onBlur={() => setHover(null)}
                            >
                              <span className="pc-spine-band" />
                              <span className="pc-spine-emblem">✦</span>
                              <span className="pc-spine-title">{book.title}</span>
                              <span className="pc-spine-no">{book.badge}</span>
                              <span className="pc-spine-band" />
                            </button>
                          );
                        })}
                      </div>
                      <div className="pc-shelf-board">
                        <span className="pc-shelf-label">তাক {toBn(r + 1)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {rows.length > rowsShown && (
                  <button type="button" className="pc-more" onClick={() => setRowsShown((previous) => previous + 2)}>
                    আরও তাক দেখুন
                    <Icon name="plus" size={15} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="pc-bottom">
            <div>
              <span className="pc-bottom-symbol">✦</span>
              <p>
                কিছু গল্প শেষ হয় না,
                <strong> স্মৃতি হয়ে থেকে যায়।</strong>
              </p>
            </div>
            <Link href="/">
              FCL হোমপেজ
              <Icon name="arrow" size={15} />
            </Link>
          </div>
        </div>
      </section>

      {hover && !open && <ShelfPreview book={hover.book} rect={hover.rect} />}

      {open && activeItem && mode !== "series" && (
        <BookOverlay
          item={activeItem}
          index={activeIndex}
          total={readerItems.length}
          prev={prevItem}
          next={nextItem}
          rect={openRect}
          fontSize={fontSize}
          copied={copiedKey === activeItem.key}
          onPrev={() => onPage(-1)}
          onNext={() => onPage(1)}
          onFontChange={onFontChange}
          onCopy={onCopy}
          onClose={onCloseReader}
        />
      )}

      <style>{PC_STYLES}</style>
    </div>
  );
}

/* ───────────────────────── Styles ───────────────────────── */

const PC_STYLES = `
.fcl-memory-dark {
  --pc-wall-a: #040a17;
  --pc-wall-b: #0a1325;
  --pc-glow: rgba(245,158,11,.12);
  --pc-wood-1: #7a4e27;
  --pc-wood-2: #4d2f16;
  --pc-back-a: #1d130a;
  --pc-back-b: #120a05;
}
.fcl-memory-light {
  --pc-wall-a: #fbf3e2;
  --pc-wall-b: #f5ead3;
  --pc-glow: rgba(245,158,11,.2);
  --pc-wood-1: #b98450;
  --pc-wood-2: #8d5f35;
  --pc-back-a: #4b2f19;
  --pc-back-b: #35200f;
}

.pc-lib { width: 100%; }
.pc-lib *, .pc-lib *::before, .pc-lib *::after { box-sizing: border-box; }
.pc-lib button { cursor: pointer; font-family: inherit; }
.pc-lib button:disabled { cursor: not-allowed; }
.pc-lib input { font-family: inherit; }

.pc-container { width: min(100% - 56px, 1320px); margin-inline: auto; }

/* tones */
.pc-t-blue   { --ta: #12306e; --tb: #2f6fe0; }
.pc-t-gold   { --ta: #6b3f08; --tb: #d49a2b; }
.pc-t-pink   { --ta: #6e1743; --tb: #d6458d; }
.pc-t-green  { --ta: #0f4a27; --tb: #2f9e5a; }
.pc-t-purple { --ta: #3f1a84; --tb: #8b5cf6; }
.pc-t-cyan   { --ta: #0b4556; --tb: #22a7c7; }

/* buttons */
.pc-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  min-height: 44px; padding: 10px 18px; border-radius: 12px;
  border: 1px solid var(--mem-border); background: var(--mem-card); color: var(--mem-heading);
  font-size: 12.5px; font-weight: 850; text-decoration: none;
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease, color .22s ease;
}
.pc-btn:hover { border-color: #1877F2; color: #1877F2; transform: translateY(-2px); }
.pc-btn.primary {
  color: #fff; border-color: #1877F2;
  background: linear-gradient(135deg, #1877F2, #0866dc);
  box-shadow: 0 8px 24px rgba(24,119,242,.26);
}
.pc-btn.primary:hover { color: #fff; box-shadow: 0 12px 30px rgba(24,119,242,.34); }

/* hero */
.pc-hero {
  position: relative; overflow: hidden; padding: 108px 0 44px;
  background:
    radial-gradient(ellipse 60% 90% at 78% 10%, var(--pc-glow), transparent 70%),
    linear-gradient(180deg, var(--pc-wall-a), var(--pc-wall-b));
  border-bottom: 1px solid var(--mem-border);
}
.pc-hero-grid {
  position: absolute; inset: 0; pointer-events: none; opacity: .5;
  background-image:
    linear-gradient(rgba(24,119,242,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(24,119,242,.05) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: linear-gradient(90deg, transparent, black 15%, black 85%, transparent);
}
.pc-hero-glow {
  position: absolute; width: 420px; height: 420px; left: -140px; top: -220px;
  border-radius: 50%; background: rgba(24,119,242,.14); filter: blur(100px); pointer-events: none;
}
.pc-hero-inner {
  position: relative; display: grid; align-items: center; gap: 40px;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, .9fr);
}
.pc-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  color: #1877F2; font-size: 10.5px; font-weight: 900; letter-spacing: .16em;
}
.pc-live-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #1877F2;
  box-shadow: 0 0 0 5px rgba(24,119,242,.12); animation: fclPcPulse 2.8s ease-in-out infinite;
}
.pc-hero-text h1 {
  margin: 16px 0 0; color: var(--mem-heading);
  font-size: clamp(36px, 4vw, 56px); line-height: 1.22; font-weight: 950; letter-spacing: -.045em;
}
.pc-hero-text h1 span {
  display: block; margin-top: 4px; font-size: clamp(24px, 2.6vw, 38px);
  background: linear-gradient(100deg, #1877F2, #3b82f6, #22d3ee);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.pc-hero-text p { max-width: 560px; margin: 16px 0 0; color: var(--mem-muted); font-size: 14px; line-height: 1.95; }
.pc-hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }

.pc-plates { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.pc-plate {
  position: relative; display: flex; flex-direction: column; gap: 4px; padding: 16px 18px; overflow: hidden;
  border: 1px solid rgba(214,162,74,.35); border-radius: 14px; color: #d6a24a;
  background: linear-gradient(145deg, var(--mem-card), var(--mem-secondary));
  box-shadow: var(--mem-shadow), inset 0 1px 0 rgba(255,255,255,.06);
}
.pc-plate::after {
  content: ""; position: absolute; width: 90px; height: 90px; right: -34px; top: -40px;
  border-radius: 50%; background: rgba(245,158,11,.12); filter: blur(22px);
}
.pc-plate strong { margin-top: 6px; color: var(--mem-heading); font-size: 26px; line-height: 1.1; font-weight: 950; }
.pc-plate span { color: var(--mem-muted); font-size: 11px; font-weight: 750; }

/* room */
.pc-room {
  padding: 30px 0 52px; scroll-margin-top: 72px;
  background: linear-gradient(180deg, var(--pc-wall-b), var(--mem-bg) 520px);
}
.pc-room-head { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 16px; }
.pc-section-eyebrow { color: #1877F2; font-size: 10px; font-weight: 950; letter-spacing: .16em; }
.pc-room-head h2 {
  margin: 7px 0 0; color: var(--mem-heading); font-size: 30px; line-height: 1.4; font-weight: 950; letter-spacing: -.035em;
}
.pc-count {
  display: flex; align-items: baseline; gap: 7px; padding: 10px 15px; border-radius: 12px;
  border: 1px solid var(--mem-border); background: var(--mem-card); color: var(--mem-heading);
  font-size: 20px; font-weight: 950;
}
.pc-count small { color: var(--mem-muted); font-size: 9px; font-weight: 900; letter-spacing: .08em; }

/* controls */
.pc-controls {
  position: sticky; top: 72px; z-index: 30; padding: 14px 16px;
  border: 1px solid var(--mem-border); border-radius: 16px; background: var(--mem-card);
  box-shadow: var(--mem-shadow);
}
.pc-cats { display: flex; flex-wrap: wrap; gap: 8px; padding-bottom: 12px; }
.pc-cat {
  display: inline-flex; align-items: center; gap: 8px; min-height: 36px; padding: 7px 13px;
  border: 1px solid var(--mem-border); border-radius: 10px; background: var(--mem-secondary);
  color: var(--mem-muted); font-size: 12px; font-weight: 850; white-space: nowrap;
  transition: color .2s, border-color .2s, background .2s, transform .2s;
}
.pc-cat:hover { color: #1877F2; border-color: rgba(24,119,242,.4); transform: translateY(-1px); }
.pc-cat.active {
  color: #fff; border-color: #1877F2; background: linear-gradient(135deg, #1877F2, #0866dc);
  box-shadow: 0 6px 16px rgba(24,119,242,.22);
}
.pc-cat small {
  display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 20px; padding: 0 5px;
  border-radius: 6px; background: rgba(100,116,139,.14); color: inherit; font-size: 10px; font-weight: 950;
}
.pc-cat.active small { background: rgba(255,255,255,.22); }

.pc-controls-row { display: flex; align-items: center; gap: 12px; padding-top: 12px; border-top: 1px solid var(--mem-border); }
.pc-search { position: relative; display: flex; align-items: center; flex: 1; min-width: 180px; }
.pc-search > svg { position: absolute; left: 13px; color: var(--mem-muted); pointer-events: none; }
.pc-search input {
  width: 100%; min-height: 42px; padding: 10px 40px; border: 1px solid var(--mem-border); border-radius: 10px;
  outline: none; background: var(--mem-secondary); color: var(--mem-heading); font-size: 13px;
  transition: border-color .2s, box-shadow .2s;
}
.pc-search input:focus { border-color: #1877F2; box-shadow: 0 0 0 3px rgba(24,119,242,.12); }
.pc-search input::placeholder { color: var(--mem-subtle); }
.pc-search input:disabled { opacity: .6; cursor: not-allowed; }
.pc-search > button {
  position: absolute; right: 8px; display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border: 0; border-radius: 7px; background: var(--mem-card-raised); color: var(--mem-muted);
}
.pc-sort {
  display: flex; align-items: center; gap: 4px; padding: 4px; flex-shrink: 0;
  border: 1px solid var(--mem-border); border-radius: 11px; background: var(--mem-secondary);
}
.pc-sort-label { display: inline-flex; align-items: center; gap: 6px; padding: 0 9px 0 8px; color: #1877F2; font-size: 11px; font-weight: 900; }
.pc-sort button {
  min-height: 32px; padding: 6px 11px; border: 0; border-radius: 8px; background: transparent;
  color: var(--mem-muted); font-size: 11.5px; font-weight: 850; white-space: nowrap;
  transition: background .2s, color .2s;
}
.pc-sort button:hover:not(:disabled) { color: #1877F2; }
.pc-sort button.active { background: #1877F2; color: #fff; box-shadow: 0 4px 12px rgba(24,119,242,.25); }
.pc-sort button:disabled { opacity: .5; }
.pc-random {
  display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; min-height: 42px; padding: 9px 15px;
  border: 1px solid rgba(214,162,74,.45); border-radius: 10px;
  background: rgba(245,158,11,.09); color: #c8891f; font-size: 12px; font-weight: 900;
  transition: transform .2s, background .2s;
}
.pc-random:hover:not(:disabled) { transform: translateY(-2px); background: rgba(245,158,11,.16); }
.pc-random:disabled { opacity: .5; }

.pc-error {
  display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-top: 14px;
  padding: 13px 16px; border: 1px solid rgba(239,68,68,.22); border-radius: 12px; background: rgba(239,68,68,.055);
}
.pc-error strong { color: #ef4444; font-size: 12px; font-weight: 950; }
.pc-error p { margin: 4px 0 0; color: var(--mem-text); font-size: 12px; }
.pc-error button {
  display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; padding: 9px 13px;
  border: 1px solid rgba(239,68,68,.25); border-radius: 9px; background: var(--mem-card);
  color: #ef4444; font-size: 11px; font-weight: 900;
}

.pc-crumb {
  display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 14px; padding: 11px 15px;
  border: 1px solid var(--mem-border); border-radius: 12px; background: var(--mem-card);
}
.pc-crumb button { display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; background: transparent; color: #1877F2; font-size: 12px; font-weight: 900; }
.pc-crumb > span { color: var(--mem-subtle); }
.pc-crumb > strong { flex: 1; min-width: 0; color: var(--mem-heading); font-size: 13px; font-weight: 900; }
.pc-crumb > small { color: var(--mem-muted); font-size: 11px; }

/* bookcase */
.pc-measure { margin-top: 20px; }
.pc-case {
  position: relative; padding: 14px 28px 28px; border-radius: 22px;
  background: linear-gradient(180deg, var(--pc-wood-1), var(--pc-wood-2));
  border: 1px solid rgba(0,0,0,.28);
  box-shadow: 0 34px 80px rgba(0,0,0,.32), inset 0 2px 0 rgba(255,255,255,.14);
}
.pc-case-top {
  display: flex; align-items: center; justify-content: space-between; padding: 2px 6px 12px;
  color: #f2d9a4; font-size: 10px; font-weight: 900; letter-spacing: .16em; text-shadow: 0 1px 0 rgba(0,0,0,.4);
}
.pc-case-inner {
  padding: 30px 26px 0; border-radius: 10px;
  background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.012) 0 2px, transparent 2px 14px),
    linear-gradient(180deg, var(--pc-back-a), var(--pc-back-b));
  box-shadow: inset 0 14px 34px rgba(0,0,0,.65), inset 0 0 0 2px rgba(0,0,0,.4);
}
.pc-shelf { position: relative; }
.pc-shelf-books {
  display: flex; align-items: flex-end; gap: 8px; min-height: 256px; padding: 14px 4px 0;
}
.pc-shelf-board {
  position: relative; display: flex; align-items: center; height: 22px; margin: 0 -26px 26px; padding-left: 40px;
  background: linear-gradient(180deg, #c99362, #9d6c3d 45%, #6a4423);
  box-shadow: 0 14px 18px rgba(0,0,0,.5), inset 0 2px 0 rgba(255,255,255,.22);
}
.pc-shelf-label {
  padding: 1px 12px; border-radius: 3px; color: #3a2608; font-size: 9px; font-weight: 900; letter-spacing: .1em;
  background: linear-gradient(#ecc977, #b88a2c); box-shadow: 0 1px 0 rgba(255,255,255,.4) inset, 0 1px 3px rgba(0,0,0,.4);
}
.pc-more {
  display: flex; align-items: center; justify-content: center; gap: 9px; margin: 6px auto 0; padding: 11px 22px;
  border: 1px solid rgba(242,217,164,.4); border-radius: 11px; background: rgba(0,0,0,.2);
  color: #f2d9a4; font-size: 12px; font-weight: 900; transition: background .2s, transform .2s;
}
.pc-more:hover { background: rgba(0,0,0,.34); transform: translateY(-2px); }

/* spine */
.pc-spine {
  position: relative; flex: 0 0 auto; display: flex; flex-direction: column; align-items: center;
  justify-content: space-between; padding: 12px 0; border: 0; border-radius: 3px 3px 2px 2px; color: #fff7e6;
  background:
    linear-gradient(90deg, rgba(0,0,0,.38), transparent 20%, transparent 78%, rgba(0,0,0,.32)),
    linear-gradient(180deg, var(--tb) -40%, var(--ta) 120%);
  box-shadow: 2px 0 0 rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.09);
  transform-origin: bottom center;
  transition: transform .28s cubic-bezier(.3,.8,.3,1), box-shadow .28s ease, filter .28s ease;
  animation: fclPcBookIn .5s ease backwards;
  animation-delay: calc(min(var(--i), 30) * 22ms);
}
.pc-spine:hover, .pc-spine:focus-visible {
  transform: translateY(-18px) rotate(-1.6deg); z-index: 3; filter: brightness(1.14);
  box-shadow: 9px 16px 26px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.16);
  outline: none;
}
.pc-spine:focus-visible { outline: 2px solid #f5c76b; outline-offset: 2px; }
.pc-spine-band {
  display: block; width: calc(100% - 10px); height: 3px; border-radius: 2px; opacity: .88;
  background: linear-gradient(90deg, #f7dc96, #b88a2c);
}
.pc-spine.series .pc-spine-band { height: 5px; }
.pc-spine-emblem { color: #f7dc96; font-size: 11px; line-height: 1; }
.pc-spine-title {
  writing-mode: vertical-rl; flex: 1; min-height: 0; max-width: 100%; margin: 8px 0; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 900; line-height: 1.25;
  text-shadow: 0 1px 2px rgba(0,0,0,.45);
}
.pc-spine.series .pc-spine-title { font-size: 14px; }
.pc-spine-no { color: #f7dc96; font-size: 9px; font-weight: 900; letter-spacing: .04em; margin-bottom: 6px; }

.pc-skeleton {
  display: block; flex: 0 0 auto; border-radius: 3px;
  background: linear-gradient(90deg, rgba(255,255,255,.05) 20%, rgba(255,255,255,.11) 50%, rgba(255,255,255,.05) 80%);
  background-size: 200% 100%; animation: fclPcSkeleton 1.5s ease infinite;
}

/* preview */
.pc-preview {
  position: fixed; z-index: 99980; display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
  padding: 15px 16px; border: 1px solid var(--mem-border); border-radius: 14px; background: var(--mem-card);
  box-shadow: 0 22px 55px rgba(0,0,0,.35); pointer-events: none; animation: fclPcFade .18s ease both;
}
.pc-preview strong { color: var(--mem-heading); font-size: 15px; line-height: 1.5; font-weight: 950; overflow-wrap: anywhere; }
.pc-preview-meta { color: var(--mem-muted); font-size: 11px; font-weight: 750; }
.pc-preview p {
  display: -webkit-box; margin: 0; overflow: hidden; color: var(--mem-text); font-size: 12px; line-height: 1.8;
  -webkit-line-clamp: 4; -webkit-box-orient: vertical;
}
.pc-preview-foot {
  display: flex; align-items: center; justify-content: space-between; width: 100%;
  margin-top: 2px; padding-top: 9px; border-top: 1px solid var(--mem-border);
  color: var(--mem-subtle); font-size: 10.5px; font-weight: 850;
}
.pc-preview-foot span:last-child { display: inline-flex; align-items: center; gap: 5px; color: #1877F2; }

/* badge */
.pc-badge {
  display: inline-flex; align-items: center; gap: 7px; max-width: 100%; padding: 5px 9px;
  border: 1px solid; border-radius: 7px; font-size: 10px; font-weight: 900; overflow-wrap: anywhere;
}
.pc-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.pc-bt-blue   { color: #3b82f6; background: rgba(24,119,242,.08);  border-color: rgba(24,119,242,.22); }
.pc-bt-gold   { color: #d97706; background: rgba(245,158,11,.08);  border-color: rgba(245,158,11,.22); }
.pc-bt-pink   { color: #ec4899; background: rgba(236,72,153,.07);  border-color: rgba(236,72,153,.22); }
.pc-bt-green  { color: #16a34a; background: rgba(34,197,94,.07);   border-color: rgba(34,197,94,.22); }
.pc-bt-purple { color: #a855f7; background: rgba(168,85,247,.07);  border-color: rgba(168,85,247,.22); }
.pc-bt-cyan   { color: #0891b2; background: rgba(34,211,238,.07);  border-color: rgba(34,211,238,.22); }

/* empty + bottom */
.pc-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 340px;
  padding: 36px 20px; border: 1px dashed var(--mem-border); border-radius: 16px; background: var(--mem-secondary); text-align: center;
}
.pc-empty-icon { display: flex; align-items: center; justify-content: center; width: 66px; height: 66px; border-radius: 18px; color: #1877F2; background: var(--mem-blue-soft); }
.pc-empty h3 { margin: 17px 0 0; color: var(--mem-heading); font-size: 19px; font-weight: 950; }
.pc-empty p { max-width: 430px; margin: 9px 0 19px; color: var(--mem-muted); font-size: 13px; line-height: 1.9; }

.pc-bottom {
  display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 26px;
  padding: 17px 20px; border: 1px solid var(--mem-border); border-radius: 14px; background: var(--mem-secondary);
}
.pc-bottom > div { display: flex; align-items: center; gap: 12px; }
.pc-bottom-symbol {
  display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; flex-shrink: 0;
  border-radius: 10px; background: rgba(245,158,11,.09); color: #d6a24a; font-size: 16px;
}
.pc-bottom p { margin: 0; color: var(--mem-muted); font-size: 13px; line-height: 1.7; }
.pc-bottom p strong { color: var(--mem-heading); }
.pc-bottom > a { display: inline-flex; align-items: center; gap: 9px; color: #1877F2; font-size: 12px; font-weight: 900; text-decoration: none; }

/* ───── Overlay + open book ───── */
.pc-overlay {
  --bk-w: min(1120px, calc(100vw - 64px));
  --bk-h: min(690px, calc(100vh - 100px));
  position: fixed; inset: 0; z-index: 99990; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 50% 40%, rgba(15,23,42,.78), rgba(2,6,23,.92));
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  animation: fclPcFade .35s ease both; overflow: hidden;
}
.pc-overlay.leaving { animation: fclPcFadeOut .35s ease both; }
.pc-overlay-close {
  position: absolute; top: 20px; right: 26px; z-index: 20; display: inline-flex; align-items: center; gap: 9px;
  padding: 10px 14px; border: 1px solid rgba(255,255,255,.18); border-radius: 11px;
  background: rgba(255,255,255,.08); color: #e2e8f0; font-size: 12px; font-weight: 850;
  transition: background .2s;
}
.pc-overlay-close:hover { background: rgba(255,255,255,.16); }
.pc-overlay-close kbd {
  padding: 2px 6px; border-radius: 5px; background: rgba(255,255,255,.12);
  font-family: inherit; font-size: 9px; letter-spacing: .06em;
}

.pc-fly { width: var(--bk-w); height: var(--bk-h); animation: fclPcFly .8s cubic-bezier(.2,.8,.2,1) backwards; }
.pc-book {
  position: relative; width: 100%; height: 100%; perspective: 2600px;
  transform: translateX(calc(var(--bk-w) / -4));
  transition: transform .95s cubic-bezier(.65,.05,.25,1);
}
.pc-book.stage-opening, .pc-book.stage-read { transform: translateX(0); }
.pc-book.stage-closing { transition: transform .55s cubic-bezier(.5,0,.3,1) .4s; }

.pc-book-shadow {
  position: absolute; top: 26px; bottom: -20px; left: 50%; right: 0; border-radius: 20px;
  background: rgba(0,0,0,.6); filter: blur(30px); transition: left .95s cubic-bezier(.65,.05,.25,1);
}
.pc-book.stage-opening .pc-book-shadow, .pc-book.stage-read .pc-book-shadow { left: 0; }
.pc-book.stage-closing .pc-book-shadow { transition: left .55s ease .4s; }

.pc-page {
  position: absolute; top: 0; width: 50%; height: 100%; overflow: hidden;
  background: var(--mem-book-paper); border: 1px solid var(--mem-book-line); color: var(--mem-book-ink);
}
.pc-page-left {
  left: 0; border-right: 0; border-radius: 12px 0 0 12px; opacity: 0;
  transition: opacity .3s ease;
}
.pc-book.stage-opening .pc-page-left { opacity: 1; transition: opacity .4s ease .5s; }
.pc-book.stage-read .pc-page-left { opacity: 1; transition: none; }
.pc-book.stage-closing .pc-page-left { opacity: 0; transition: opacity .4s ease .45s; }
.pc-page-right {
  left: 50%; border-left: 0; border-radius: 0 12px 12px 0; display: flex; flex-direction: column;
  box-shadow: 3px 3px 0 -1px var(--mem-book-line), 6px 6px 0 -2px var(--mem-book-line);
}
.pc-page-left::after, .pc-page-right::before, .pc-cover-back::after {
  content: ""; position: absolute; top: 0; bottom: 0; width: 46px; pointer-events: none; z-index: 3;
}
.pc-page-left::after, .pc-cover-back::after { right: 0; background: linear-gradient(90deg, transparent, rgba(0,0,0,.13)); }
.pc-page-right::before { left: 0; background: linear-gradient(270deg, transparent, rgba(0,0,0,.13)); }

/* cover */
.pc-cover {
  position: absolute; top: 0; left: 50%; width: 50%; height: 100%; z-index: 5;
  transform-origin: left center; transform-style: preserve-3d;
  transition: transform 1s cubic-bezier(.65,.05,.25,1);
}
.pc-book.stage-opening .pc-cover { transform: rotateY(-180deg); }
.pc-book.stage-read .pc-cover { transform: rotateY(-180deg); visibility: hidden; transition: none; }
.pc-book.stage-closing .pc-cover { transition: transform .8s cubic-bezier(.65,.05,.25,1); }

.pc-cover-front, .pc-cover-back {
  position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; overflow: hidden;
}
.pc-cover-front {
  border-radius: 4px 12px 12px 4px;
  background: linear-gradient(145deg, var(--tb) -30%, var(--ta) 60%, #050a14 130%);
  box-shadow: inset 6px 0 12px rgba(255,255,255,.08), inset -4px 0 8px rgba(0,0,0,.3), 0 0 0 1px rgba(0,0,0,.4);
}
.pc-cover-hinge {
  position: absolute; top: 0; bottom: 0; left: 0; width: 18px;
  background: linear-gradient(90deg, rgba(0,0,0,.42), rgba(255,255,255,.06) 60%, transparent);
}
.pc-cover-frame {
  position: absolute; inset: 22px 22px 22px 32px; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; padding: 24px 26px; text-align: center;
  border: 1px solid rgba(245,200,110,.55); border-radius: 6px;
  box-shadow: inset 0 0 0 6px transparent, inset 0 0 0 7px rgba(245,200,110,.2);
}
.pc-cover-top { color: #f2d9a4; font-size: 9px; font-weight: 900; letter-spacing: .22em; }
.pc-cover-emblem { color: #fff; font-size: 58px; line-height: 1; font-weight: 950; letter-spacing: -.1em; text-shadow: 0 4px 18px rgba(0,0,0,.4); }
.pc-cover-rule { width: 56px; height: 1px; background: #f5c76b; }
.pc-cover-frame h2 {
  display: -webkit-box; max-width: 100%; margin: 6px 0 0; overflow: hidden; color: #fff;
  font-size: clamp(20px, 2vw, 27px); line-height: 1.5; font-weight: 950; overflow-wrap: anywhere;
  -webkit-line-clamp: 4; -webkit-box-orient: vertical; text-shadow: 0 2px 10px rgba(0,0,0,.35);
}
.pc-cover-frame p { margin: 0; color: #f7dc96; font-size: 13px; font-weight: 800; }
.pc-cover-frame small { color: #c9d6ea; font-size: 11px; font-weight: 700; }
.pc-cover-frame b { margin-top: 10px; color: #fbbf24; font-size: 14px; letter-spacing: .24em; }
.pc-cover-back {
  transform: rotateY(180deg); background: var(--mem-book-paper);
  border: 1px solid var(--mem-book-line); border-right: 0; border-radius: 12px 0 0 12px;
}

.pc-book::after {
  content: ""; position: absolute; top: 0; bottom: 0; left: calc(50% - 1px); width: 2px; z-index: 6;
  pointer-events: none; opacity: 0; transition: opacity .4s ease;
  background: linear-gradient(180deg, transparent, rgba(0,0,0,.2) 10%, rgba(0,0,0,.2) 90%, transparent);
}
.pc-book.stage-read::after { opacity: 1; }

/* left page */
.pc-left { display: flex; flex-direction: column; height: 100%; padding: 28px 34px 22px; }
.pc-left-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.pc-left-top > span:last-child { color: var(--mem-subtle); font-size: 9px; font-weight: 900; letter-spacing: .12em; }
.pc-left-title { margin-top: 24px; text-align: center; }
.pc-chapter { color: #b88637; font-size: 9px; font-weight: 950; letter-spacing: .17em; }
.pc-left-title h2 {
  display: -webkit-box; margin: 12px auto 0; overflow: hidden; color: var(--mem-heading);
  font-size: clamp(22px, 2.1vw, 30px); line-height: 1.5; font-weight: 950; letter-spacing: -.025em;
  overflow-wrap: anywhere; -webkit-line-clamp: 4; -webkit-box-orient: vertical;
}
.pc-author-row {
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 6px 16px;
  margin-top: 12px; color: var(--mem-muted); font-size: 11.5px; font-weight: 750;
}
.pc-ornament { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 20px 0 16px; }
.pc-ornament > span { width: 70px; height: 1px; background: var(--mem-book-line); }
.pc-ornament > strong { color: #d6a24a; font-size: 13px; }
.pc-left-body { flex: 1; min-height: 0; overflow: hidden; }
.pc-summary {
  padding: 14px 17px; border-left: 3px solid #d6a24a; border-radius: 0 8px 8px 0; background: rgba(245,158,11,.06);
}
.pc-summary > span { color: #d6a24a; font-size: 11px; font-weight: 950; }
.pc-summary p {
  display: -webkit-box; margin: 7px 0 0; overflow: hidden; color: var(--mem-book-ink); font-size: 12.5px; line-height: 1.9;
  -webkit-line-clamp: 7; -webkit-box-orient: vertical; overflow-wrap: anywhere;
}
.pc-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.pc-chips span {
  display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; border: 1px solid var(--mem-book-line);
  border-radius: 8px; color: var(--mem-muted); font-size: 11px; font-weight: 800;
}
.pc-left-nav { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.pc-nav-btn {
  display: flex; align-items: center; gap: 10px; min-width: 0; padding: 10px 12px;
  border: 1px solid var(--mem-border); border-radius: 11px; background: var(--mem-secondary); color: var(--mem-heading);
  text-align: left; transition: border-color .2s, color .2s, transform .2s;
}
.pc-nav-btn:hover:not(:disabled) { border-color: #1877F2; color: #1877F2; transform: translateY(-2px); }
.pc-nav-btn:disabled { opacity: .4; }
.pc-nav-btn.next { justify-content: flex-end; text-align: right; background: #1877F2; border-color: #1877F2; color: #fff; }
.pc-nav-btn.next:hover:not(:disabled) { background: #0866dc; color: #fff; }
.pc-nav-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.pc-nav-text small { font-size: 9.5px; font-weight: 800; opacity: .75; }
.pc-nav-text b { margin-top: 2px; overflow: hidden; font-size: 11.5px; font-weight: 850; text-overflow: ellipsis; white-space: nowrap; }
.pc-left-actions { display: flex; align-items: center; justify-content: center; gap: 9px; margin-top: 10px; }
.pc-action {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 34px; padding: 7px 13px;
  border: 1px solid var(--mem-border); border-radius: 9px; background: var(--mem-secondary);
  color: var(--mem-muted); font-size: 11px; font-weight: 850; text-decoration: none;
}
.pc-action.primary { border-color: rgba(24,119,242,.25); background: var(--mem-blue-soft); color: #1877F2; }
.pc-archive-label { color: var(--mem-subtle); font-size: 11px; font-weight: 750; }

/* right page */
.pc-right-top {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 24px 12px 30px;
  border-bottom: 1px solid var(--mem-book-line);
}
.pc-right-brand { display: inline-flex; align-items: center; gap: 8px; color: var(--mem-subtle); font-size: 9.5px; font-weight: 900; letter-spacing: .13em; }
.pc-right-tools { display: flex; align-items: center; gap: 6px; }
.pc-right-count { margin-right: 6px; color: var(--mem-heading); font-size: 13px; font-weight: 950; }
.pc-right-count small { color: var(--mem-subtle); font-size: 13px; }
.pc-right-tools button {
  display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;
  border: 1px solid var(--mem-border); border-radius: 8px; background: var(--mem-secondary); color: var(--mem-text);
  transition: color .2s, border-color .2s;
}
.pc-right-tools button:hover:not(:disabled) { color: #1877F2; border-color: rgba(24,119,242,.4); }
.pc-right-tools button:disabled { opacity: .4; }
.pc-right-scroll {
  flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 22px 36px 32px 42px;
  scrollbar-width: thin; scrollbar-color: var(--mem-book-line) transparent;
}
.pc-turn { animation: fclPcTurn .42s cubic-bezier(.2,.7,.2,1) both; transform-origin: left center; }
.pc-right-progress { height: 3px; background: var(--mem-border); }
.pc-right-progress > span { display: block; height: 100%; background: linear-gradient(90deg, #1877F2, #22d3ee); transition: width .12s linear; }

/* story */
.pc-story-wrap { color: var(--mem-book-ink); font-size: var(--reader-font-size, 16px); line-height: 2.05; overflow-wrap: anywhere; }
.pc-story { min-width: 0; }
.pc-story-p { margin: 0; color: inherit; line-height: inherit; }
.pc-story-p + .pc-story-p { margin-top: 10px; }
.pc-story-space { height: 14px; }
.pc-story-heading {
  margin: 22px 0 13px; padding-bottom: 10px; border-bottom: 1px solid var(--mem-book-line);
  color: #1877F2; font-size: 1.03em; font-weight: 950; line-height: 1.6;
}
.pc-story-dialogue {
  margin: 9px 0; padding: 9px 12px; border-left: 2px solid rgba(24,119,242,.5);
  border-radius: 0 7px 7px 0; background: rgba(24,119,242,.055); line-height: inherit;
}
.pc-story-dialogue strong { color: #1877F2; font-weight: 950; }
.pc-hl {
  padding: 1px 3px; border-radius: 3px; color: #d6a24a; font-weight: 950; background: rgba(245,158,11,.07);
  box-decoration-break: clone; -webkit-box-decoration-break: clone;
}
.pc-story-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
  min-height: 200px; color: var(--mem-muted); text-align: center; font-size: 12px;
}
.pc-story-end {
  display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 42px; padding-top: 22px;
  border-top: 1px solid var(--mem-book-line); text-align: center;
}
.pc-story-end > span { color: #d6a24a; font-size: 17px; }
.pc-story-end p { margin: 0; color: var(--mem-muted); font-size: 12px; font-weight: 750; }
.pc-story-end small { color: var(--mem-subtle); font-size: 8px; font-weight: 900; letter-spacing: .13em; }

/* keyframes */
@keyframes fclPcFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes fclPcFadeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes fclPcPulse {
  0%, 100% { box-shadow: 0 0 0 5px rgba(24,119,242,.1); }
  50% { box-shadow: 0 0 0 8px rgba(24,119,242,.035); }
}
@keyframes fclPcSkeleton { to { background-position-x: -200%; } }
@keyframes fclPcBookIn {
  from { opacity: 0; transform: translateY(28px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fclPcFly {
  0% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(var(--ds)) perspective(1200px) rotateY(70deg); }
  35% { opacity: 1; }
  100% { opacity: 1; transform: translate(0px, 0px) scale(1) perspective(1200px) rotateY(0deg); }
}
@keyframes fclPcTurn {
  from { opacity: .3; transform: perspective(1200px) rotateY(-6deg) translateX(14px); filter: blur(2px); }
  to { opacity: 1; transform: perspective(1200px) rotateY(0) translateX(0); filter: blur(0); }
}

@media (max-width: 1100px) {
  .pc-hero-inner { grid-template-columns: 1fr; gap: 28px; }
  .pc-plates { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .pc-controls-row { flex-wrap: wrap; }
  .pc-search { flex-basis: 100%; }
  .pc-left { padding: 22px 22px 18px; }
  .pc-right-scroll { padding: 18px 24px 28px 28px; }
  .pc-case { padding: 12px 18px 22px; }
}

@media (prefers-reduced-motion: reduce) {
  .pc-lib *, .pc-lib *::before, .pc-lib *::after,
  .pc-overlay, .pc-overlay * {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    transition-delay: 0ms !important;
  }
}
`;