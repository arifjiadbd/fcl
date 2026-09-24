"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Memory {
  id: number;
  category: string;
  title: string;
  author: string;
  date: string;
  fbPostUrl: string;
  content: string;
}

// 🧠 Smart Auto-Formatter: পর্ব (০১, ০২), ডায়ালগ ও প্যারাগ্রাফ সুন্দর করার ফাংশন
function formatSmartContent(rawText: string, category: string): string {
  if (!rawText) return "";

  let text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  // পর্ব/সিকোয়েন্স (০১., ০২., ১., ২., পর্ব ১:, দৃশ্য ১:) চিনে আলাদা ব্লক তৈরি করা
  text = text.replace(
    /(^|\n)\s*([০-৯]{1,2}\.|\d{1,2}\.|পর্ব\s*[০-৯\d]+[:.]|দৃশ্য\s*[০-৯\d]+[:.]|Part\s*[\d]+[:.]|Scene\s*[\d]+[:.])/gi,
    "\n\n__EPISODE_START__$2__EPISODE_END__\n"
  );

  const cat = category.toLowerCase();
  const isDrama = cat.includes("নাটক") || cat.includes("drama");

  if (isDrama) {
    text = text.replace(/([^\n]+:)/g, "\n\n$1 ");
  }

  return text;
}

// ✨ হাইলাইট ও পর্ব স্টাইল রেন্ডারার
function renderFormattedContent(text: string) {
  if (!text) return null;

  const episodeBlocks = text.split("__EPISODE_START__");

  return episodeBlocks.map((block, blockIdx) => {
    if (blockIdx === 0 && !block.includes("__EPISODE_END__")) {
      return (
        <div key={blockIdx} className="space-y-3">
          {renderTextWithHighlights(block)}
        </div>
      );
    }

    const [episodeTitle, ...contentParts] = block.split("__EPISODE_END__");
    const episodeContent = contentParts.join("__EPISODE_END__");

    return (
      <div key={blockIdx} className="mt-7 first:mt-2 border-t border-[#1e293b]/70 pt-5">
        {/* সিকোয়েন্স / পর্ব ব্যাজ */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-[#38bdf8]/40 bg-[#0c1f38] px-3.5 py-1 text-xs font-black tracking-wider text-[#38bdf8] shadow-md shadow-[#38bdf8]/15">
          <span>📌</span>
          <span>পর্ব {episodeTitle.replace(/[.:]/g, "").trim()}</span>
        </div>

        {/* পর্বের ভেতরের মূল লেখা */}
        <div className="space-y-3 text-[#cbd5e1] leading-relaxed">
          {renderTextWithHighlights(episodeContent)}
        </div>
      </div>
    );
  });
}

// 🌟 স্মার্ট স্টার পার্সার: *লেখা* বা **লেখা** যাই থাকুক, সব বাড়তি স্টার মুছে ক্লিন সোনালী হাইলাইট করবে
function renderTextWithHighlights(text: string) {
  const lines = text.split("\n");

  return lines.map((line, lIdx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={lIdx} className="h-2" />;

    // এক বা একাধিক স্টার (* বা ** বা ***) দিয়ে ঘেরা অংশ স্প্লিট করা
    const parts = trimmed.split(/(\*+[^*]+\*+)/g);

    return (
      <p key={lIdx} className="leading-relaxed">
        {parts.map((part, pIdx) => {
          if (part.startsWith("*") && part.endsWith("*")) {
            // শুরুর ও শেষের সবগুলো অতিরিক্ত স্টার (*) পুরোপুরি ছেঁটে ফেলা
            const clean = part.replace(/^\*+|\*+$/g, "").trim();
            return (
              <span
                key={pIdx}
                className="font-extrabold text-[#fbbf24] drop-shadow-[0_0_10px_rgba(251,191,36,0.45)] bg-[#f59e0b]/15 px-1 py-0.5 rounded"
              >
                {clean}
              </span>
            );
          }
          return <span key={pIdx}>{part}</span>;
        })}
      </p>
    );
  });
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/fcl-memories")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.memories)) {
          setMemories(data.memories);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching memories:", err);
        setLoading(false);
      });
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(memories.map((m) => m.category))).filter(Boolean),
  ];

  const filteredMemories = memories.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedCategory === "All") return true;

    return item.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handleCopyLink = (url: string, id: number) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadge = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("স্মৃতি") || c.includes("memories") || c.includes("nostalgia")) {
      return { icon: "🥹", label: cat, style: "border-[#f59e0b]/40 bg-[#f59e0b]/15 text-[#fbbf24]" };
    }
    if (c.includes("গান") || c.includes("song")) {
      return { icon: "🎵", label: cat, style: "border-[#ec4899]/40 bg-[#ec4899]/15 text-[#f472b6]" };
    }
    if (c.includes("কবিতা") || c.includes("poem")) {
      return { icon: "📜", label: cat, style: "border-[#38bdf8]/40 bg-[#38bdf8]/15 text-[#38bdf8]" };
    }
    if (c.includes("গল্প") || c.includes("story")) {
      return { icon: "📖", label: cat, style: "border-[#22c55e]/40 bg-[#22c55e]/15 text-[#4ade80]" };
    }
    if (c.includes("নাটক") || c.includes("drama")) {
      return { icon: "🎭", label: cat, style: "border-[#a855f7]/40 bg-[#a855f7]/15 text-[#c084fc]" };
    }
    if (c.includes("কৌতুক") || c.includes("humor")) {
      return { icon: "😂", label: cat, style: "border-[#f97316]/40 bg-[#f97316]/15 text-[#fb923c]" };
    }
    return { icon: "✨", label: cat, style: "border-[#1877F2]/40 bg-[#1877F2]/15 text-[#60a5fa]" };
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-[#f59e0b]/30 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border border-[#f59e0b]/40 bg-[#17130b] shadow-lg shadow-[#f59e0b]/10">
              <img
                src="/fcl-logo.png"
                alt="FCL Logo"
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-xl">📖</span>';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white">
                  Facebook <span className="text-[#1877F2]">Cricket League</span>
                </h1>
                <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#f59e0b]">
                  MEMORIES
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#94a3b8]">Archive of Nostalgia & Stories (2013-2026)</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-[#1e293b] bg-[#0b1220] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#cbd5e1] transition hover:border-[#f59e0b]/50 hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[#172033] bg-[#02050b] py-12 sm:py-16">
        <div className="absolute left-[15%] top-[-20%] h-[450px] w-[450px] rounded-full bg-[#f59e0b]/10 blur-[130px]" />
        <div className="absolute right-[10%] bottom-[-20%] h-[400px] w-[400px] rounded-full bg-[#1877F2]/10 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3.5 py-1 text-xs font-bold text-[#fbbf24]">
                <span>✨</span> FCL Nostalgia Archive
              </span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white">
                FCL স্মৃতি ও আড্ডা
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#94a3b8] max-w-2xl">
                ২০১৩ সাল থেকে শুরু হওয়া আবেগ, সোনালী স্মৃতি, কবিতা, গান, নাটক ও বন্ধুত্বের অমূল্য ইতিহাস। প্রতিটি লেখার সাথে মূল ফেসবুক পোস্টের লিংক সংরক্ষিত।
              </p>
            </div>

            <div className="rounded-2xl border border-[#1e293b] bg-[#0b1220]/90 px-5 py-3 backdrop-blur-md shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Total Archived Memories</p>
              <p className="text-xl sm:text-2xl font-black text-[#fbbf24]">{memories.length} টি পোস্ট</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#1e293b] pb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                  selectedCategory === cat
                    ? "bg-[#f59e0b] text-black shadow-lg shadow-[#f59e0b]/20"
                    : "border border-[#1e293b] bg-[#0b1220] text-[#94a3b8] hover:border-[#f59e0b]/40 hover:text-white"
                }`}
              >
                {cat === "All" ? "🌟 সকল স্মৃতি (Overall)" : cat}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="স্মৃতি বা লেখক খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2.5 text-xs text-white placeholder-[#64748b] focus:border-[#f59e0b] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm font-semibold text-[#fbbf24] animate-pulse">
              Loading FCL Memories Archive from Excel...
            </div>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-[#1e293b] bg-[#0b1220] p-8 text-center">
            <span className="text-4xl mb-3">📖</span>
            <p className="text-base font-semibold text-white">কোনো পোস্ট পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {filteredMemories.map((item) => {
              const badge = getCategoryBadge(item.category);
              const formattedContent = formatSmartContent(item.content, item.category);

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#1e293b] bg-gradient-to-b from-[#0b1220] via-[#070d1a] to-[#040812] p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#f59e0b]/60 hover:shadow-2xl hover:shadow-[#f59e0b]/10"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f59e0b]/50 to-transparent opacity-0 transition group-hover:opacity-100" />

                  {/* Header Row: Category Badge + Date */}
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-[#172033] pb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${badge.style}`}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>

                      {item.date && (
                        <span className="text-[11px] font-extrabold text-[#94a3b8] bg-[#030712] px-2.5 py-1 rounded-lg border border-[#1e293b]">
                          📅 {item.date}
                        </span>
                      )}
                    </div>

                    {/* Title & Author */}
                    <div className="mt-4">
                      <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-[#fbbf24] transition leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#60a5fa] mt-1">
                        ✍️ লেখক: <span className="text-white font-bold">{item.author}</span>
                      </p>
                    </div>

                    {/* Content Box (With Clean Bold Glow & Preserved Line Breaks) */}
                    <div className="mt-5 rounded-2xl border border-[#172033] bg-[#030714] p-4 sm:p-5 text-sm sm:text-[15px] text-[#cbd5e1] leading-relaxed tracking-wide font-normal max-h-96 overflow-y-auto overscroll-contain">
                      {renderFormattedContent(formattedContent)}
                    </div>
                  </div>

                  {/* Footer Row: Original Post Link & Copy */}
                  <div className="mt-6 flex items-center justify-between border-t border-[#172033] pt-4 text-xs">
                    {item.fbPostUrl ? (
                      <a
                        href={item.fbPostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1877F2]/15 border border-[#1877F2]/40 px-3.5 py-1.5 font-bold text-[#60a5fa] transition hover:bg-[#1877F2] hover:text-white"
                      >
                        <span>🔗 মূল ফেসবুক পোস্ট দেখুন</span>
                        <span>→</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#64748b]">আর্কাইভ পোস্ট</span>
                    )}

                    {item.fbPostUrl && (
                      <button
                        onClick={() => handleCopyLink(item.fbPostUrl, item.id)}
                        className="text-[11px] font-bold text-[#94a3b8] hover:text-white transition"
                      >
                        {copiedId === item.id ? "✓ Copied!" : "📋 Copy Link"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8 mt-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
            <p className="text-xs text-[#64748b]">Nostalgia, Stories & Memories Archive</p>
          </div>
          <p className="text-xs text-[#94a3b8]">
            © 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}