"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ExtraordinaryRecord {
  playerName: string;
  performanceTitle: string;
  tournamentMatch: string;
  description: string;
  facebookLink: string;
  photo: string;
}

// ⭐ Memories ও Match পেজের মতো হাইলাইট সিস্টেম
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

export default function ExtraordinaryPage() {
  const [performances, setPerformances] = useState<ExtraordinaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerf, setSelectedPerf] = useState<ExtraordinaryRecord | null>(null);

  useEffect(() => {
    fetch("/api/thrillers-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.extraordinary && Array.isArray(data.extraordinary)) {
          setPerformances(data.extraordinary);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching extraordinary performances:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-white selection:bg-[#1877F2]/30 selection:text-white pb-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.14),transparent_65%)]" />

      <main className="relative mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between border-b border-slate-200 dark:border-[#1e293b] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs font-semibold text-[#60a5fa] hover:underline">
                ← Back to Home
              </Link>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">FCL Heroics Zone</span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Extraordinary Performance</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8]">
              চোখে পড়ার মতো একক পারফরম্যান্স, ঐতিহাসিক হ্যাটট্রিক এবং বিধ্বংসী ইনিংস।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-[#1e293b] dark:bg-[#0b1220]">
              <p className="text-2xl font-black leading-none text-cyan-600 dark:text-cyan-400">{performances.length}</p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-[#94a3b8]">Total Masterclasses</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-[#1e293b] dark:bg-[#0b1220]" />
            ))}
          </div>
        ) : performances.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-[#1e293b] dark:bg-[#0b1220]">
            <span className="mb-3 text-4xl">🌟</span>
            <p className="text-base font-semibold">কোনো অসাধারণ পারফরম্যান্স ডেটা পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {performances.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPerf(p)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 dark:border-[#1e293b] dark:bg-[#0b1220] hover:border-cyan-500/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-1 text-[10px] font-black text-cyan-600 dark:text-cyan-300">
                      👤 {p.playerName}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-black leading-snug text-slate-900 group-hover:text-cyan-500 transition break-words dark:text-white line-clamp-2">
                    {p.performanceTitle}
                  </h3>

                  <p className="mt-1 text-[11px] font-bold text-slate-500 dark:text-[#94a3b8]">
                    🏟️ {p.tournamentMatch}
                  </p>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  <span>View Details & Summary</span>
                  <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* পপ-আপ মডাল */}
      {selectedPerf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#1e293b] dark:bg-[#0b1220] sm:p-8">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1e293b] pb-4">
              <div>
                <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/15 px-3 py-1 text-[11px] font-black text-cyan-600 dark:text-cyan-300">
                  👤 {selectedPerf.playerName}
                </span>
                <p className="mt-2 text-xs font-bold text-slate-500 dark:text-[#94a3b8]">
                  🏟️ {selectedPerf.tournamentMatch}
                </p>
              </div>
              <button
                onClick={() => setSelectedPerf(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-[#172033] dark:text-white dark:hover:bg-[#1e293b]"
              >
                ✕
              </button>
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-white sm:text-2xl break-words">
              {selectedPerf.performanceTitle}
            </h2>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-6 text-sm text-slate-700 dark:border-[#172033] dark:bg-[#030714] dark:text-[#cbd5e1] leading-relaxed break-words space-y-2">
              {renderTextWithHighlights(selectedPerf.description)}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-[#1e293b] pt-4">
              <span className="text-xs font-bold text-slate-400">FCL Official Performance Record</span>
              {selectedPerf.facebookLink ? (
                <a
                  href={selectedPerf.facebookLink}
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