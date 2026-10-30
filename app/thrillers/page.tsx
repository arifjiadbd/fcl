"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HighVoltageMatch {
  matchTitle: string;
  tournament: string;
  date: string;
  description: string;
  facebookLink: string;
  thumbnail: string;
}

function formatExcelDate(val: any): string {
  if (!val || val === "—") return "";
  const num = Number(val);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const day = String(dateInfo.getUTCDate()).padStart(2, "0");
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${day} ${months[dateInfo.getUTCMonth()]} ${dateInfo.getUTCFullYear()}`;
  }
  return String(val).trim();
}

// ⭐ Memories ও Match পেজের মতো হাইলাইট সিস্টেম
function renderHighlightedParts(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[\s\S]*?\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const clean = part.slice(2, -2).trim();
      return (
        <span
          key={index}
          className="font-extrabold text-amber-600 dark:text-[#fbbf24] bg-amber-500/15 px-1.5 py-0.5 rounded inline-block my-0.5"
        >
          {clean}
        </span>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**") && !part.endsWith("**")) {
      const clean = part.slice(1, -1).trim();
      return (
        <span
          key={index}
          className="font-extrabold text-amber-600 dark:text-[#fbbf24] bg-amber-500/15 px-1 py-0.5 rounded inline-block my-0.5"
        >
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

export default function ThrillersPage() {
  const [matches, setMatches] = useState<HighVoltageMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<HighVoltageMatch | null>(null);

  useEffect(() => {
    fetch("/api/thrillers-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.highVoltage && Array.isArray(data.highVoltage)) {
          setMatches(data.highVoltage);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching thrillers:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-white selection:bg-[#1877F2]/30 selection:text-white pb-24 relative overflow-hidden">
      <style jsx global>{`
        .thriller-hero {
          background: var(--thriller-bg-alt);
          border-color: var(--thriller-border);
          padding-top: 2rem;
        }

        @media (min-width: 640px) {
          .thriller-hero {
            padding-top: 3rem;
          }
        }

        .thriller-grid-bg {
          background-image:
            linear-gradient(to right, rgba(100,116,139,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100,116,139,0.08) 1px, transparent 1px);
          background-size: 45px 45px;
          -webkit-mask-image: radial-gradient(ellipse 75% 85% at 50% 30%, black 25%, transparent 95%);
          mask-image: radial-gradient(ellipse 75% 85% at 50% 30%, black 25%, transparent 95%);
        }

        .dark .thriller-grid-bg {
          background-image:
            linear-gradient(to right, rgba(148,163,184,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,0.045) 1px, transparent 1px);
        }

        .thriller-orb {
          animation: thrillerFloat 10s ease-in-out infinite;
        }

        .thriller-orb-delay {
          animation-delay: -5s;
        }

        @keyframes thrillerFloat {
          0%, 100% {
            transform: translate3d(0,0,0) scale(1);
          }
          50% {
            transform: translate3d(20px,-20px,0) scale(1.08);
          }
        }

        :root {
          --thriller-bg-alt: #f1f5f9;
          --thriller-border: #e2e8f0;
        }

        .dark {
          --thriller-bg-alt: #02050b;
          --thriller-border: #172033;
        }
      `}</style>

      <div className="thriller-grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(24,119,242,0.08),transparent_65%)]" />
      <div className="thriller-orb pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[#1877F2]/15 blur-[100px]" />
      <div className="thriller-orb thriller-orb-delay pointer-events-none absolute -bottom-36 -left-24 h-72 w-72 rounded-full bg-purple-500/10 blur-[110px]" />

      <main className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="thriller-hero relative overflow-hidden border-b mb-8 md:mb-10">
          <div className="relative mx-auto max-w-5xl px-3.5 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8 lg:pb-14 lg:pt-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-xs font-semibold text-[#60a5fa] hover:underline">
                  ← Back to Home
                </Link>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
                  FCL Thriller Zone
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
                High Voltage Matches
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8]">
                যে ম্যাচগুলোতে ছিল চরম নাটকীয়তা, শেষ ওভারের রোমাঞ্চ আর বুক কাঁপুনি জয়!
              </p>
            </div>

            <div className="flex shrink-0">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-[#1e293b] dark:bg-[#0b1220]">
                <span className="text-2xl font-black leading-none text-[#1877F2]">
                  {matches.length}
                </span>
                <div className="text-left">
                  <p className="text-[11px] font-black text-slate-500 dark:text-[#94a3b8]">
                    Total Thrillers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-[#1e293b] dark:bg-[#0b1220]"
              />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-[#1e293b] dark:bg-[#0b1220]">
            <span className="mb-3 text-4xl">⚡</span>
            <p className="text-base font-semibold">কোনো হাই ভোল্টেজ ম্যাচ ডেটা পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {matches.map((m, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedMatch(m)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 dark:border-[#1e293b] dark:bg-[#0b1220] hover:border-purple-500/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg border border-purple-500/30 bg-purple-500/15 px-2.5 py-1 text-[10px] font-black text-purple-600 dark:text-purple-300">
                      🏟️ {m.tournament}
                    </span>
                    {m.date && (
                      <span className="text-[11px] font-bold text-slate-500 dark:text-[#94a3b8]">
                        📅 {formatExcelDate(m.date)}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-base font-black leading-snug text-slate-900 group-hover:text-purple-500 transition break-words dark:text-white line-clamp-2">
                    {m.matchTitle}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>View Details & Summary</span>
                  <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* পপ-আপ মডাল */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#1e293b] dark:bg-[#0b1220] sm:p-8">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1e293b] pb-4">
              <div>
                <span className="rounded-lg border border-purple-500/30 bg-purple-500/15 px-3 py-1 text-[11px] font-black text-purple-600 dark:text-purple-300">
                  🏟️ {selectedMatch.tournament}
                </span>
                {selectedMatch.date && (
                  <p className="mt-2 text-xs font-bold text-slate-500 dark:text-[#94a3b8]">
                    📅 {formatExcelDate(selectedMatch.date)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-[#172033] dark:text-white dark:hover:bg-[#1e293b]"
              >
                ✕
              </button>
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-white sm:text-2xl break-words">
              {selectedMatch.matchTitle}
            </h2>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-6 text-sm text-slate-700 dark:border-[#172033] dark:bg-[#030714] dark:text-[#cbd5e1] leading-relaxed break-words space-y-2">
              {renderTextWithHighlights(selectedMatch.description)}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-[#1e293b] pt-4">
              <span className="text-xs font-bold text-slate-400">FCL Official Thriller Record</span>
              {selectedMatch.facebookLink ? (
                <a
                  href={selectedMatch.facebookLink}
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