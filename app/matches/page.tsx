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
}

// 🌟 এক্সেলের সংখ্যাসূচক তারিখ (Serial Date) সুন্দর ফরম্যাটে রূপান্তর করার ফাংশন
function formatExcelDate(val: any): string {
  if (!val) return "";
  const num = Number(val);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const day = String(dateInfo.getUTCDate()).padStart(2, "0");
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${day} ${months[dateInfo.getUTCMonth()]}, ${dateInfo.getUTCFullYear()}`;
  }
  return String(val).trim();
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

  const years = useMemo(() => {
    const set = new Set(matches.map((m) => m.year).filter(Boolean));
    return ["All", ...Array.from(set)].sort().reverse();
  }, [matches]);

  const months = useMemo(() => {
    const set = new Set(matches.map((m) => m.month).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchCat = m.category.toLowerCase();
      const targetCat = selectedCategory.toLowerCase();

      // ক্যাটাগরি ম্যাচিং আরও নমনীয় করা হলো
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
  }, [matches, selectedCategory, selectedYear, selectedMonth, searchQuery]);

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
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredMatches.length}</span> matches
          </p>
        )}

        {/* Matches Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-[#1e293b] dark:bg-[#0b1220]" />
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-[#1e293b] dark:bg-[#0b1220]">
            <span className="mb-3 text-4xl">📭</span>
            <p className="text-base font-semibold">কোনো ম্যাচ রেকর্ড পাওয়া যায়নি</p>
            <p className="mt-1 text-xs text-slate-500">আপনার ফিল্টার বা সার্চ পরিবর্তন করে আবার চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/60 hover:shadow-xl hover:shadow-[#1877F2]/10 dark:border-[#1e293b] dark:bg-[#0b1220]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-[#1877F2]/15 border border-[#1877F2]/30 px-3 py-1 text-[11px] font-black text-[#60a5fa]">
                      {match.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-[#94a3b8]">
                      📅 {formatExcelDate(match.date)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-black leading-tight text-slate-900 group-hover:text-[#60a5fa] transition break-words dark:text-white">
                    {match.title}
                  </h3>

                  <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-700 dark:border-[#172033] dark:bg-[#030714] dark:text-[#cbd5e1] max-h-48 overflow-y-auto break-words">
                    {renderTextWithHighlights(match.summary)}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">FCL Official Record</span>
                  {match.link ? (
                    <a
                      href={match.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#1877F2] px-4 py-2 text-xs font-black text-white shadow transition hover:bg-blue-600"
                    >
                      <span>View Post</span>
                      <span>↗</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold">Link Unavailable</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}