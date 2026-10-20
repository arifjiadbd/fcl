"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";

/* ───────────────────────── Types ───────────────────────── */

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

/* ───────────────────────── Date helpers ───────────────────────── */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function isExcelSerial(val: any): boolean {
  const num = Number(val);
  return !isNaN(num) && num > 20000 && num < 60000;
}

function parseMatchDate(dateStr: string, yearStr: string): number {
  if (!dateStr) return 0;
  const num = Number(dateStr);
  if (isExcelSerial(dateStr)) {
    const utcDays = Math.floor(num - 25569);
    return utcDays * 86400 * 1000;
  }
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return parsed;

  const parsedWithYear = Date.parse(`${dateStr} ${yearStr || ""}`);
  if (!isNaN(parsedWithYear)) return parsedWithYear;

  return 0;
}

function formatExcelDate(val: any): string {
  if (!val) return "";
  const num = Number(val);
  if (isExcelSerial(val)) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const day = String(dateInfo.getUTCDate()).padStart(2, "0");
    return `${day} ${MONTHS[dateInfo.getUTCMonth()]} ${dateInfo.getUTCFullYear()}`;
  }
  return String(val).trim();
}

function getDateParts(dateStr: string, yearStr: string) {
  const ts = parseMatchDate(dateStr, yearStr);
  if (!ts) return null;
  const d = new Date(ts);
  if (isExcelSerial(dateStr)) {
    return { day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear() };
  }
  return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
}

function getGroupLabel(m: MatchItem): string {
  const p = getDateParts(m.date, m.year);
  if (p) return `${MONTHS[p.month]} ${p.year}`;
  if (m.month && m.year) return `${m.month} ${m.year}`;
  return "Undated";
}

/* ───────────────────────── Category styling ───────────────────────── */

type CatKey = "tournament" | "series" | "friendly" | "test" | "other";

function getCategoryStyle(cat: string) {
  const c = (cat || "").toLowerCase();
  if (c.includes("tournament")) {
    return {
      key: "tournament" as CatKey,
      icon: "🏆",
      badge: "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400",
      soft: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
      cardBorder: "hover:border-amber-500/60 hover:shadow-amber-500/10",
      bar: "bg-amber-500",
    };
  }
  if (c.includes("series")) {
    return {
      key: "series" as CatKey,
      icon: "⚡",
      badge: "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-[#60a5fa]",
      soft: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-[#60a5fa]",
      cardBorder: "hover:border-blue-500/60 hover:shadow-blue-500/10",
      bar: "bg-blue-500",
    };
  }
  if (c.includes("friendly")) {
    return {
      key: "friendly" as CatKey,
      icon: "🤝",
      badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
      soft: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
      cardBorder: "hover:border-emerald-500/60 hover:shadow-emerald-500/10",
      bar: "bg-emerald-500",
    };
  }
  if (c.includes("test")) {
    return {
      key: "test" as CatKey,
      icon: "🛡️",
      badge: "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400",
      soft: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
      cardBorder: "hover:border-rose-500/60 hover:shadow-rose-500/10",
      bar: "bg-rose-500",
    };
  }
  return {
    key: "other" as CatKey,
    icon: "📌",
    badge: "bg-slate-500/15 border-slate-500/30 text-slate-600 dark:text-slate-400",
    soft: "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400",
    cardBorder: "hover:border-slate-500/60 hover:shadow-slate-500/10",
    bar: "bg-slate-500",
  };
}

const CATEGORIES = [
  { key: "all", label: "All Matches", short: "All", icon: "🌐" },
  { key: "tournament", label: "Tournament Home", short: "Tournament", icon: "🏆" },
  { key: "series", label: "Series Match", short: "Series", icon: "⚡" },
  { key: "friendly", label: "Friendly Match", short: "Friendly", icon: "🤝" },
  { key: "test", label: "Test Match", short: "Test", icon: "🛡️" },
] as const;

const TONE: Record<string, { text: string; soft: string; ring: string; bar: string }> = {
  all: { text: "text-[#1877F2] dark:text-[#60a5fa]", soft: "bg-[#1877F2]/10 border-[#1877F2]/30", ring: "border-[#1877F2] ring-1 ring-[#1877F2]/40", bar: "bg-[#1877F2]" },
  tournament: { text: "text-amber-600 dark:text-amber-400", soft: "bg-amber-500/10 border-amber-500/30", ring: "border-amber-500 ring-1 ring-amber-500/40", bar: "bg-amber-500" },
  series: { text: "text-blue-600 dark:text-[#60a5fa]", soft: "bg-blue-500/10 border-blue-500/30", ring: "border-blue-500 ring-1 ring-blue-500/40", bar: "bg-blue-500" },
  friendly: { text: "text-emerald-600 dark:text-emerald-400", soft: "bg-emerald-500/10 border-emerald-500/30", ring: "border-emerald-500 ring-1 ring-emerald-500/40", bar: "bg-emerald-500" },
  test: { text: "text-rose-600 dark:text-rose-400", soft: "bg-rose-500/10 border-rose-500/30", ring: "border-rose-500 ring-1 ring-rose-500/40", bar: "bg-rose-500" },
};

function renderHighlightedParts(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[\s\S]*?\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const clean = part.slice(2, -2).trim();
      return <span key={index} className="font-extrabold text-amber-600 dark:text-[#fbbf24] bg-amber-500/15 px-1.5 py-0.5 rounded inline-block my-0.5">{clean}</span>;
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**") && !part.endsWith("**")) {
      const clean = part.slice(1, -1).trim();
      return <span key={index} className="font-extrabold text-amber-600 dark:text-[#fbbf24] bg-amber-500/15 px-1 py-0.5 rounded inline-block my-0.5">{clean}</span>;
    }
    return <span key={index}>{part}</span>;
  });
}

function renderTextWithHighlights(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lIdx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={lIdx} className="h-2" />;
    const isDialogLine = /^[^:\n]+:\s/.test(trimmed);
    if (isDialogLine) {
      const colonIndex = trimmed.indexOf(":");
      const speaker = trimmed.substring(0, colonIndex + 1);
      const dialogue = trimmed.substring(colonIndex + 1);
      return (
        <p key={lIdx} className="leading-relaxed my-1 break-words">
          <strong className="font-extrabold text-amber-600 dark:text-[#fbbf24] bg-amber-500/10 px-1.5 py-0.5 rounded mr-1 inline-block">{speaker}</strong>
          <span className="break-words">{renderHighlightedParts(dialogue)}</span>
        </p>
      );
    }
    return <p key={lIdx} className="leading-relaxed break-words">{renderHighlightedParts(trimmed)}</p>;
  });
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function StatTile({ cat, count, active, onClick }: { cat: (typeof CATEGORIES)[number]; count: number; active: boolean; onClick: () => void }) {
  const t = TONE[cat.key];
  return (
    <button onClick={onClick} aria-pressed={active} className={`group relative min-w-[112px] shrink-0 snap-start overflow-hidden rounded-2xl border bg-white p-3.5 text-left shadow-sm transition active:scale-95 dark:bg-[#0b1220] lg:min-w-0 lg:rounded-3xl lg:p-5 lg:hover:-translate-y-0.5 lg:hover:shadow-lg ${active ? t.ring : "border-slate-200 dark:border-[#1e293b]"}`}>
      <span className={`absolute inset-x-0 top-0 h-[3px] ${t.bar} ${active ? "opacity-100" : "opacity-40"}`} />
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl border text-lg lg:h-11 lg:w-11 lg:text-xl ${t.soft}`}>{cat.icon}</span>
      <p className={`mt-2.5 text-2xl font-black tabular-nums leading-none lg:mt-4 lg:text-4xl ${t.text}`}>{count}</p>
      <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-[#94a3b8] lg:text-xs">{cat.key === "all" ? "Total Matches" : cat.short}</p>
    </button>
  );
}

function DateBox({ m, style, size }: { m: MatchItem; style: ReturnType<typeof getCategoryStyle>; size: "sm" | "lg" }) {
  const p = getDateParts(m.date, m.year);
  const dims = size === "lg" ? "h-16 w-16 rounded-2xl" : "h-14 w-14 rounded-2xl";
  return (
    <div className={`flex shrink-0 flex-col items-center justify-center border ${dims} ${style.soft}`}>
      <span className={`font-black tabular-nums leading-none ${size === "lg" ? "text-2xl" : "text-xl"}`}>{p ? String(p.day).padStart(2, "0") : "—"}</span>
      <span className="mt-1 text-[10px] font-bold tracking-wider">{p ? MONTHS_SHORT[p.month] : (m.month || "").slice(0, 3).toUpperCase()}</span>
    </div>
  );
}

function CatBadge({ category, small }: { category: string; small?: boolean }) {
  const s = getCategoryStyle(category);
  return (
    <span className={`inline-flex max-w-full items-center gap-1 truncate rounded-lg border font-black ${s.badge} ${small ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"}`}>
      <span>{s.icon}</span>
      <span className="truncate">{category || "Match"}</span>
    </span>
  );
}

function DesktopMatchCard({ match, onOpen }: { match: MatchItem; onOpen: (m: MatchItem) => void }) {
  const style = getCategoryStyle(match.category);
  return (
    <button onClick={() => onOpen(match)} className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] dark:border-[#1e293b] dark:bg-[#0b1220] ${style.cardBorder}`}>
      <span className={`absolute inset-x-0 top-0 h-1 ${style.bar} opacity-80`} />
      <div>
        <div className="flex items-center gap-3.5">
          <DateBox m={match} style={style} size="lg" />
          <div className="min-w-0 flex-1">
            <CatBadge category={match.category} />
            <p className="mt-1.5 truncate text-[11px] font-semibold text-slate-500 dark:text-[#94a3b8]">📅 {formatExcelDate(match.date)}</p>
          </div>
        </div>
        <h3 className="mt-4 line-clamp-2 break-words text-base font-black leading-snug transition group-hover:text-[#60a5fa]">{match.title}</h3>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs font-bold text-[#1877F2] dark:border-[#1e293b] dark:text-[#60a5fa]">
        <span>View details & summary</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </button>
  );
}

function MobileMatchRow({ match, onOpen }: { match: MatchItem; onOpen: (m: MatchItem) => void }) {
  const style = getCategoryStyle(match.category);
  return (
    <button onClick={() => onOpen(match)} className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 pl-4 text-left shadow-sm transition active:scale-[0.98] dark:border-[#1e293b] dark:bg-[#0b1220]">
      <span className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} />
      <DateBox m={match} style={style} size="sm" />
      <div className="min-w-0 flex-1">
        <CatBadge category={match.category} small />
        <h3 className="mt-1.5 line-clamp-2 break-words text-[13px] font-black leading-snug">{match.title}</h3>
      </div>
      <span className="shrink-0 text-lg font-bold text-slate-300 dark:text-[#334155]">›</span>
    </button>
  );
}

function MatchModal({ match, onClose }: { match: MatchItem; onClose: () => void }) {
  const style = getCategoryStyle(match.category);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-slate-200 bg-white shadow-2xl dark:border-[#1e293b] dark:bg-[#0b1220] sm:max-w-2xl sm:rounded-[28px]">
        <span className={`h-1 w-full shrink-0 ${style.bar}`} />
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-slate-300 dark:bg-[#1e293b] sm:hidden" />
        <div className="flex shrink-0 items-start justify-between gap-3 p-5 pb-3 sm:p-7 sm:pb-4">
          <div className="min-w-0">
            <CatBadge category={match.category} />
            <p className="mt-2 text-xs font-bold text-slate-500 dark:text-[#94a3b8]">📅 {formatExcelDate(match.date)} {match.month || match.year ? ` (${match.month} ${match.year})` : ""}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-[#172033] dark:text-white dark:hover:bg-[#1e293b]">✕</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 sm:px-7">
          <h2 className="break-words text-xl font-black leading-snug sm:text-2xl">{match.title}</h2>
          <div className="mt-4 break-words rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-[#172033] dark:bg-[#030714] dark:text-[#cbd5e1] sm:p-6">{renderTextWithHighlights(match.summary)}</div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-[#1e293b] sm:px-7 sm:py-4">
          <span className="hidden text-xs font-bold text-slate-400 sm:block">FCL Official Match Record</span>
          {match.link ? (
            <a href={match.link} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#1877F2] px-5 py-3 text-xs font-black text-white shadow-lg shadow-[#1877F2]/25 transition hover:bg-blue-600 sm:w-auto">
              <span>View Official Facebook Post</span>
              <span>↗</span>
            </a>
          ) : (
            <span className="text-xs font-semibold text-slate-400">Link Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [pages, setPages] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const pageSize = isDesktop ? 18 : 15;

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => {
        if (data.matches && Array.isArray(data.matches)) {
          setMatches(data.matches);
          try {
            const params = new URLSearchParams(window.location.search);
            const mid = params.get("match");
            const q = params.get("q");
            if (mid) {
              const found = data.matches.find((m: MatchItem) => String(m.id) === mid);
              if (found) setSelectedMatch(found);
            } else if (q) {
              setSearchQuery(q);
            }
          } catch {
            /* ignore */
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading matches:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setPages(1);
  }, [selectedCategory, selectedYear, selectedMonth, searchQuery]);

  const closeModal = useCallback(() => setSelectedMatch(null), []);

  const years = useMemo(() => {
    const set = new Set(matches.map((m) => m.year).filter(Boolean));
    return ["All", ...Array.from(set).sort().reverse()];
  }, [matches]);

  const months = useMemo(() => {
    const set = new Set(matches.map((m) => m.month).filter(Boolean));
    const list = Array.from(set).sort((a, b) => {
      const ia = MONTHS.findIndex((x) => x.toLowerCase() === a.toLowerCase());
      const ib = MONTHS.findIndex((x) => x.toLowerCase() === b.toLowerCase());
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    return ["All", ...list];
  }, [matches]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: matches.length, tournament: 0, series: 0, friendly: 0, test: 0 };
    matches.forEach((m) => {
      const k = getCategoryStyle(m.category).key;
      if (k !== "other") c[k] += 1;
    });
    return c;
  }, [matches]);

  const latestLabel = useMemo(() => {
    let best: MatchItem | null = null;
    let bestTs = 0;
    matches.forEach((m) => {
      const ts = parseMatchDate(m.date, m.year);
      if (ts > bestTs) {
        bestTs = ts;
        best = m;
      }
    });
    return best ? formatExcelDate((best as MatchItem).date) : "";
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = matches.filter((m) => {
      const matchesCategory = selectedCategory === "all" || getCategoryStyle(m.category).key === selectedCategory;
      const matchesYear = selectedYear === "All" || m.year === selectedYear;
      const matchesMonth = selectedMonth === "All" || (m.month || "").toLowerCase() === selectedMonth.toLowerCase();
      const matchesSearch = !q || (m.title || "").toLowerCase().includes(q) || (m.summary || "").toLowerCase().includes(q);
      return matchesCategory && matchesYear && matchesMonth && matchesSearch;
    });
    list.sort((a, b) => parseMatchDate(b.date, b.year) - parseMatchDate(a.date, a.year));
    return list;
  }, [matches, selectedCategory, selectedYear, selectedMonth, searchQuery]);

  const visibleMatches = filteredMatches.slice(0, pages * pageSize);
  const remaining = filteredMatches.length - visibleMatches.length;

  const groups = useMemo(() => {
    const map = new Map<string, MatchItem[]>();
    visibleMatches.forEach((m) => {
      const label = getGroupLabel(m);
      const arr = map.get(label);
      if (arr) arr.push(m);
      else map.set(label, [m]);
    });
    return Array.from(map.entries());
  }, [visibleMatches]);

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (selectedCategory !== "all") {
    const cat = CATEGORIES.find((c) => c.key === selectedCategory);
    activeFilters.push({ label: `${cat?.icon ?? ""} ${cat?.short ?? ""}`, clear: () => setSelectedCategory("all") });
  }
  if (selectedYear !== "All") activeFilters.push({ label: selectedYear, clear: () => setSelectedYear("All") });
  if (selectedMonth !== "All") activeFilters.push({ label: selectedMonth, clear: () => setSelectedMonth("All") });
  if (searchQuery.trim()) activeFilters.push({ label: `"${searchQuery.trim()}"`, clear: () => setSearchQuery("") });

  const hasFilters = activeFilters.length > 0;

  const resetAll = () => {
    setSelectedCategory("all");
    setSelectedYear("All");
    setSelectedMonth("All");
    setSearchQuery("");
  };

  const SearchBox = (
    <div className="relative w-full">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      <input
        type="text"
        placeholder="Search match title or summary..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1877F2] focus:outline-none dark:border-[#1e293b] dark:bg-[#030712] dark:text-white dark:placeholder-slate-500"
      />
      {searchQuery && (
        <button onClick={() => setSearchQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 pb-20 text-slate-900 transition-colors duration-300 selection:bg-[#1877F2]/30 selection:text-white dark:bg-[#020617] dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(ellipse_at_top,rgba(24,119,242,0.16),transparent_65%)]" />

      <main className="relative mx-auto max-w-[1400px] px-4 pt-6 sm:px-6 lg:px-10 lg:pt-12">
        <header className="relative mb-5 overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#1877F2]/15 via-white to-amber-400/10 p-5 shadow-sm dark:border-[#1e293b] dark:from-[#1877F2]/20 dark:via-[#0b1220] dark:to-[#0b1220] lg:mb-8 lg:rounded-[36px] lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#1877F2]/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/" className="text-xs font-semibold text-[#1877F2] hover:underline dark:text-[#60a5fa]">← Home</Link>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1877F2]/40 bg-[#1877F2]/10 px-3 py-1 text-[11px] font-semibold text-[#1877F2] dark:text-[#60a5fa]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#60a5fa]" />
                  FCL Match Archive
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-6xl">Match Directory</h1>
              <p className="mt-2 hidden text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8] sm:block lg:text-base">
                Tournament home pages, series games, friendly matches and test match archives — browse by category, year and month.
              </p>
            </div>

            {latestLabel && (
              <div className="flex items-center gap-3 self-start lg:self-auto">
                <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 shadow-sm backdrop-blur dark:border-[#1e293b] dark:bg-[#0b1220]/80">
                  <p className="text-sm font-black leading-none lg:text-base">{latestLabel}</p>
                  <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-[#94a3b8]">Latest match</p>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="-mx-4 mb-5 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:mx-0 lg:mb-8 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
          {CATEGORIES.map((cat) => (
            <StatTile key={cat.key} cat={cat} count={loading ? 0 : counts[cat.key] ?? 0} active={selectedCategory === cat.key} onClick={() => setSelectedCategory(cat.key)} />
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl backdrop-blur-md dark:border-[#1e293b] dark:bg-[#0b1220]/80 sm:p-5 lg:mb-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">{SearchBox}</div>
            <div className="grid grid-cols-2 gap-2.5 lg:flex lg:items-center">
              <label className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Year:</span>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-[#1877F2] focus:outline-none dark:border-[#1e293b] dark:bg-[#030712] dark:text-white">
                  {years.map((y) => (<option key={y} value={y}>{y}</option>))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Month:</span>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-[#1877F2] focus:outline-none dark:border-[#1e293b] dark:bg-[#030712] dark:text-white">
                  {months.map((mo) => (<option key={mo} value={mo}>{mo}</option>))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {!loading && (
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-[#94a3b8]">
            <p>Showing <span className="font-bold text-slate-900 dark:text-white">{visibleMatches.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{filteredMatches.length}</span> matches</p>
            {activeFilters.map((f) => (
              <button key={f.label} onClick={f.clear} className="inline-flex items-center gap-1.5 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-2.5 py-1 text-[11px] font-bold text-[#1877F2] transition hover:bg-[#1877F2]/20 dark:text-[#60a5fa]">
                {f.label} <span className="text-[10px]">✕</span>
              </button>
            ))}
            {hasFilters && (<button onClick={resetAll} className="font-semibold text-[#1877F2] hover:underline dark:text-[#60a5fa]">Reset</button>)}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
            {Array.from({ length: isDesktop ? 6 : 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-[#1e293b] dark:bg-[#0b1220] lg:h-52 lg:rounded-3xl" />
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-[#1e293b] dark:bg-[#0b1220]">
            <span className="mb-3 text-4xl">📭</span>
            <p className="text-base font-semibold">কোনো ম্যাচ রেকর্ড পাওয়া যায়নি</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#94a3b8]">আপনার ফিল্টার বা সার্চ পরিবর্তন করে আবার চেষ্টা করুন।</p>
            <button onClick={resetAll} className="mt-4 rounded-xl bg-[#1877F2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1877F2]/90">Clear filters</button>
          </div>
        ) : (
          <div className="space-y-7">
            {groups.map(([label, items]) => (
              <section key={label}>
                <div className="mb-3 flex items-center gap-3">
                  <h2 className="text-sm font-black tracking-tight lg:text-base">{label}</h2>
                  <span className="rounded-full bg-[#1877F2]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#1877F2] dark:text-[#60a5fa]">{items.length}</span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-[#1e293b]" />
                </div>
                {isDesktop ? (
                  <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                    {items.map((m) => (<DesktopMatchCard key={m.id} match={m} onOpen={setSelectedMatch} />))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {items.map((m) => (<MobileMatchRow key={m.id} match={m} onOpen={setSelectedMatch} />))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {!loading && remaining > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-[#172033]">
              <div className="h-full rounded-full bg-[#1877F2] transition-all" style={{ width: `${(visibleMatches.length / filteredMatches.length) * 100}%` }} />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button onClick={() => setPages((p) => p + 1)} className="rounded-2xl bg-[#1877F2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:bg-[#1877F2]/90">Show {Math.min(pageSize, remaining)} more</button>
              <button onClick={() => setPages(Math.ceil(filteredMatches.length / pageSize))} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#1877F2]/40 dark:border-[#1e293b] dark:bg-[#0b1220] dark:text-[#94a3b8] dark:hover:text-white">Show all ({remaining} left)</button>
            </div>
          </div>
        )}
      </main>

      {selectedMatch && <MatchModal match={selectedMatch} onClose={closeModal} />}
    </div>
  );
}