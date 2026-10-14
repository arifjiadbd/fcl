"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

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

const PAGE_SIZE = 30;

function parseMatchDate(dateStr: string, yearStr: string): number {
  if (!dateStr) return 0;
  const num = Number(dateStr);
  if (!isNaN(num) && num > 20000 && num < 60000) {
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
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const day = String(dateInfo.getUTCDate()).padStart(2, "0");
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${day} ${months[dateInfo.getUTCMonth()]} ${dateInfo.getUTCFullYear()}`;
  }
  return String(val).trim();
}

// 🌟 ক্যাটাগরি অনুযায়ী আলাদা কালার ও স্টাইল ম্যাপিং
function getCategoryStyle(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes("tournament")) {
    return {
      badge: "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400",
      cardBorder: "hover:border-amber-500/60 hover:shadow-amber-500/10",
      icon: "🏆"
    };
  }
  if (c.includes("series")) {
    return {
      badge: "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-[#60a5fa]",
      cardBorder: "hover:border-blue-500/60 hover:shadow-blue-500/10",
      icon: "⚡"
    };
  }
  if (c.includes("friendly")) {
    return {
      badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
      cardBorder: "hover:border-emerald-500/60 hover:shadow-emerald-500/10",
      icon: "🤝"
    };
  }
  if (c.includes("test")) {
    return {
      badge: "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400",
      cardBorder: "hover:border-rose-500/60 hover:shadow-rose-500/10",
      icon: "🛡️"
    };
  }
  return {
    badge: "bg-slate-500/15 border-slate-500/30 text-slate-600 dark:text-slate-400",
    cardBorder: "hover:border-slate-500/60 hover:shadow-slate-500/10",
    icon: "📌"
  };
}

// ⭐ Memories পেজের মতো হাইলাইট সিস্টেম
function renderHighlightedParts(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[\s\S]*?\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const clean = part.slice(2, -2).trim();
      return (
        <span key={index} className="font-extrabold text-amber-600 dark:text-[#fbbf24] bg-amber-500/15 px-1.5 py-0.5 rounded inline-block my-0.5">
          {clean}
        </span>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**") && !part.endsWith("**")) {
      const clean = part.slice(1, -1).trim();
      return (
        <span key={index} className="font-extrabold text-amber-600 dark:text-[#fbbf24] bg-amber-500/15 px-1 py-0.5 rounded inline-block my-0.5">
          {clean}
        </span>
      );
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
          <strong className="font-extrabold text-amber-600 dark:text-[#fbbf24] bg-amber-500/10 px-1.5 py-0.5 rounded mr-1 inline-block">
            {speaker}
          </strong>
          <span className="break-words">{renderHighlightedParts(dialogue)}</span>
        </p>
      );
    }

    return (
      <p key={lIdx} className="leading-relaxed break-words">
        {renderHighlightedParts(trimmed)}
      </p>
    );
  });
}

const CATEGORIES = ["All", "Tournament Home", "Series Match", "Friendly Match", "Test Match"];

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => {
        if (data.matches && Array.isArray(data.matches)) {
          setMatches(data.matches);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading matches:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, selectedYear, selectedMonth, searchQuery]);

  const years = useMemo(() => {
    const set = new Set(matches.map((m) => m.year).filter(Boolean));
    return ["All", ...Array.from(set)].sort().reverse();
  }, [matches]);

  const months = useMemo(() => {
    const set = new Set(matches.map((m) => m.month).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const list = matches.filter((m) => {
      const matchCat = m.category.toLowerCase();
      const targetCat = selectedCategory.toLowerCase();

      let matchesCategory = false;
      if (selectedCategory === "All") {
        matchesCategory = true;
      } else if (targetCat.includes("tournament") && matchCat.includes("tournament")) {
        matchesCategory = true;
      } else if (targetCat.includes("series") && matchCat.includes("series")) {
        matchesCategory = true;
      } else if (targetCat.includes("friendly") && matchCat.includes("friendly")) {
        matchesCategory = true;
      } else if (targetCat.includes("test") && matchCat.includes("test")) {
        matchesCategory = true;
      } else {
        matchesCategory = matchCat.includes(targetCat);
      }

      const matchesYear = selectedYear === "All" || m.year === selectedYear;
      const matchesMonth = selectedMonth === "All" || m.month.toLowerCase() === selectedMonth.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.summary.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesYear && matchesMonth && matchesSearch;
    });

    list.sort((a, b) => {
      const timeA = parseMatchDate(a.date, a.year);
      const timeB = parseMatchDate(b.date, b.year);
      return timeB - timeA;
    });

    return list;
  }, [matches, selectedCategory, selectedYear, selectedMonth, searchQuery]);

  const visibleMatches = filteredMatches.slice(0, visibleCount);
  const remaining = filteredMatches.length - visibleMatches.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-white selection:bg-[#1877F2]/30 selection:text-white pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(24,119,242,0.14),transparent_65%)]" />

      <main className="relative mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between border-b border-slate-200 dark:border-[#1e293b] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs font-semibold text-[#60a5fa] hover:underline">
                ← Back to Home
              </Link>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#60a5fa]">FCL Match Archive</span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Match Directory & History</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8]">
              Explore tournament home pages, series games, friendly matches, and test match archives across years and months.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-[#1e293b] dark:bg-[#0b1220]">
              <p className="text-2xl font-black leading-none text-amber-600 dark:text-[#f59e0b]">{matches.length}</p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-[#94a3b8]">Total Matches Logged</p>
            </div>
          </div>
        </header>

        {/* Toolbar & Filters */}
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl backdrop-blur-md dark:border-[#1e293b] dark:bg-[#0b1220]/80">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search match title or summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1877F2] focus:outline-none dark:border-[#1e293b] dark:bg-[#030712] dark:text-white dark:placeholder-slate-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  ✕
                </button>
              )}
            </div>

            {/* Year & Month Selectors */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1877F2] dark:border-[#1e293b] dark:bg-[#030712] dark:text-white"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1877F2] dark:border-[#1e293b] dark:bg-[#030712] dark:text-white"
                >
                  {months.map((mo) => (
                    <option key={mo} value={mo}>{mo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200 dark:border-[#1e293b]">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">Category:</span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/25"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-[#1877F2]/40 dark:border-[#1e293b] dark:bg-[#030712] dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results summary */}
        {!loading && (
          <p className="mb-4 text-xs text-slate-500 dark:text-[#94a3b8]">
            Showing <span className="font-bold text-slate-900 dark:text-white">{visibleMatches.length}</span> of{" "}
            <span className="font-bold text-slate-900 dark:text-white">{filteredMatches.length}</span> matches
          </p>
        )}

        {/* Matches Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-[#1e293b] dark:bg-[#0b1220]" />
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-[#1e293b] dark:bg-[#0b1220]">
            <span className="mb-3 text-4xl">📭</span>
            <p className="text-base font-semibold">কোনো ম্যাচ রেকর্ড পাওয়া যায়নি</p>
            <p className="mt-1 text-xs text-slate-500">আপনার ফিল্টার বা সার্চ পরিবর্তন করে আবার চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleMatches.map((match) => {
              const style = getCategoryStyle(match.category);
              return (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 dark:border-[#1e293b] dark:bg-[#0b1220] ${style.cardBorder}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black ${style.badge}`}>
                        {style.icon} {match.category}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-[#94a3b8]">
                        📅 {formatExcelDate(match.date)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-black leading-snug text-slate-900 group-hover:text-[#60a5fa] transition break-words dark:text-white line-clamp-2">
                      {match.title}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between text-xs font-bold text-[#60a5fa]">
                    <span>View Details & Summary</span>
                    <span className="transform transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {!loading && remaining > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="rounded-2xl bg-[#1877F2] px-8 py-3 text-sm font-black text-white shadow-lg shadow-[#1877F2]/25 transition hover:bg-blue-600"
            >
              Show More ({remaining} remaining)
            </button>
          </div>
        )}
      </main>

      {/* INDIVIDUAL MATCH DETAILS MODAL */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#1e293b] dark:bg-[#0b1220] sm:p-8">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1e293b] pb-4">
              <div>
                {(() => {
                  const modalStyle = getCategoryStyle(selectedMatch.category);
                  return (
                    <span className={`rounded-lg border px-3 py-1 text-[11px] font-black ${modalStyle.badge}`}>
                      {modalStyle.icon} {selectedMatch.category}
                    </span>
                  );
                })()}
                <p className="mt-2 text-xs font-bold text-slate-500 dark:text-[#94a3b8]">
                  📅 {formatExcelDate(selectedMatch.date)} ({selectedMatch.month} {selectedMatch.year})
                </p>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-[#172033] dark:text-white dark:hover:bg-[#1e293b]"
              >
                ✕
              </button>
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-white sm:text-2xl break-words">
              {selectedMatch.title}
            </h2>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-6 text-sm text-slate-700 dark:border-[#172033] dark:bg-[#030714] dark:text-[#cbd5e1] leading-relaxed break-words">
              {renderTextWithHighlights(selectedMatch.summary)}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-[#1e293b] pt-4">
              <span className="text-xs font-bold text-slate-400">FCL Official Match Record</span>
              {selectedMatch.link ? (
                <a
                  href={selectedMatch.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1877F2] px-5 py-2.5 text-xs font-black text-white shadow transition hover:bg-blue-600"
                >
                  <span>View Official Facebook Post</span>
                  <span>↗</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">Link Unavailable</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}