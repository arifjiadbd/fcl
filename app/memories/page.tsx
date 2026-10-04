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
  isSeries?: boolean;
  seriesName?: string;
  episodeNo?: number | string;
  summary?: string;
}

// 🧠 Smart Auto-Formatter: পর্ব, ডায়ালগ ও প্যারাগ্রাফ সুন্দর করার ফাংশন
function formatSmartContent(rawText: string, category: string): string {
  if (!rawText) return "";

  let cleanText = rawText
    .replace(/^সারসংক্ষেপ:\s*[\s\S]*?(?=\n\n|\n|$)/i, "")
    .trim();

  let text = cleanText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  text = text.replace(
    /(^|\n)\s*([০-৯]{1,2}\.|\d{1,2}\.|পর্ব\s*[০-৯\d]+[:.]|দৃশ্য\s*[০-৯\d]+[:.]|Part\s*[\d]+[:.]|Scene\s*[\d]+[:.])/gi,
    "\n\n__EPISODE_START__$2__EPISODE_END__\n"
  );

  const cat = category.toLowerCase();

  const isDrama =
    cat.includes("নাটক") ||
    cat.includes("drama") ||
    cat.includes("ধারাবাহিক সিরিজ");

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
        <div key={blockIdx} className="space-y-3 break-words">
          {renderTextWithHighlights(block)}
        </div>
      );
    }

    const [episodeTitle, ...contentParts] =
      block.split("__EPISODE_END__");

    const episodeContent =
      contentParts.join("__EPISODE_END__");

    return (
      <div
        key={blockIdx}
        className="mt-7 first:mt-2 border-t border-slate-200 dark:border-[#1e293b]/70 pt-5 break-words"
      >
        {episodeTitle && (
          <div className="mb-3 text-xs font-black text-amber-600 dark:text-[#fbbf24] break-words">
            {episodeTitle.trim()}
          </div>
        )}

        <div className="space-y-3 text-slate-700 dark:text-[#cbd5e1] leading-relaxed break-words">
          {renderTextWithHighlights(episodeContent)}
        </div>
      </div>
    );
  });
}

// ⭐ **Double Star** এবং *Single Star* Highlight
function renderHighlightedParts(text: string) {
  const parts = text.split(/(\*\*[\s\S]*?\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    // **Double Star Highlight**
    if (
      part.startsWith("**") &&
      part.endsWith("**") &&
      part.length >= 4
    ) {
      const clean = part.slice(2, -2).trim();

      return (
        <span
          key={index}
          className="font-extrabold text-amber-600 dark:text-[#fbbf24] bg-amber-500/15 px-1.5 py-0.5 rounded drop-shadow-[0_0_10px_rgba(251,191,36,0.45)] inline-block my-0.5"
        >
          {clean}
        </span>
      );
    }

    // *Single Star Highlight*
    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      !part.startsWith("**") &&
      !part.endsWith("**")
    ) {
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

// 📝 Text + Dialogue + Highlight renderer
function renderTextWithHighlights(text: string) {
  const lines = text.split("\n");

  return lines.map((line, lIdx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={lIdx} className="h-2" />;
    }

    const isDialogLine = /^[^:\n]+:\s/.test(trimmed);

    // 🎭 Dialogue line
    if (isDialogLine) {
      const colonIndex = trimmed.indexOf(":");

      const speaker = trimmed.substring(0, colonIndex + 1);
      const dialogue = trimmed.substring(colonIndex + 1);

      return (
        <p key={lIdx} className="leading-relaxed my-1.5 break-words">
          <strong className="font-extrabold text-amber-600 dark:text-[#fbbf24] bg-amber-500/10 px-1.5 py-0.5 rounded mr-1 inline-block">
            {speaker}
          </strong>

          <span className="break-words">
            {renderHighlightedParts(dialogue)}
          </span>
        </p>
      );
    }

    // 📖 Normal paragraph
    return (
      <p key={lIdx} className="leading-relaxed break-words">
        {renderHighlightedParts(trimmed)}
      </p>
    );
  });
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [seriesDataList, setSeriesDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] =
    useState<number | null>(null);
  const [selectedSeriesName, setSelectedSeriesName] =
    useState<string | null>(null);

  // 🌟 একই সময়ে শুধুমাত্র ১টি Episode open থাকবে
  const [openEpisode, setOpenEpisode] =
    useState<number | null>(null);

  const toggleEpisode = (episodeNo: number) => {
    setOpenEpisode((prev) =>
      prev === episodeNo ? null : episodeNo
    );
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/fcl-memories").then((res) =>
        res.json()
      ),

      fetch("/api/fcl-series")
        .then((res) => res.json())
        .catch(() => []),
    ])
      .then(([memoriesData, seriesData]) => {
        let allItems: Memory[] = [];

        if (
          memoriesData &&
          Array.isArray(memoriesData.memories)
        ) {
          allItems = [...memoriesData.memories];
        }

        if (Array.isArray(seriesData)) {
          setSeriesDataList(seriesData);

          const formattedSeries =
            seriesData.map(
              (item: any, idx: number) => ({
                id: 9000 + idx,
                category: "ধারাবাহিক সিরিজ",
                title: `${
                  item.series_name || "সিরিজ"
                } — ${
                  item.episode_title ||
                  "পর্ব " + item.episode_no
                }`,
                author:
                  item.Author || "Unknown",
                date: String(
                  item.publish_date || ""
                ),
                fbPostUrl:
                  item.facebook_link || "",
                content: item.Content || "",
                isSeries: true,
                seriesName:
                  item.series_name ||
                  "ধারাবাহিক গল্প",
                episodeNo:
                  item.episode_no || 1,
                summary:
                  item.summary || "",
              })
            );

          allItems = [
            ...allItems,
            ...formattedSeries,
          ];
        }

        setMemories(allItems);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "Error fetching data:",
          err
        );
        setLoading(false);
      });
  }, []);

  const categories = [
    "All",
    ...Array.from(
      new Set(
        memories.map((m) => m.category)
      )
    ).filter(Boolean),
  ];

  const uniqueSeriesNames = Array.from(
    new Set(
      seriesDataList
        .map((item) => item.series_name)
        .filter(Boolean)
    )
  );

  const filteredMemories = memories.filter(
    (item) => {
      const q = searchQuery
        .toLowerCase()
        .trim();

      const matchesSearch =
        !q ||
        item.title
          .toLowerCase()
          .includes(q) ||
        item.author
          .toLowerCase()
          .includes(q) ||
        item.content
          .toLowerCase()
          .includes(q);

      if (!matchesSearch) return false;

      if (selectedCategory === "All")
        return true;

      return item.category
        .toLowerCase()
        .includes(
          selectedCategory.toLowerCase()
        );
    }
  );

  const handleCopyLink = (
    url: string,
    id: number
  ) => {
    if (!url) return;

    navigator.clipboard.writeText(url);

    setCopiedId(id);

    setTimeout(
      () => setCopiedId(null),
      2000
    );
  };

  const getCategoryBadge = (
    cat: string
  ) => {
    const c = cat.toLowerCase();

    if (
      c.includes("স্মৃতি") ||
      c.includes("memories") ||
      c.includes("nostalgia")
    ) {
      return {
        icon: "🥹",
        label: cat,
        style:
          "border-amber-400/40 bg-amber-50 dark:bg-[#f59e0b]/15 text-amber-600 dark:text-[#fbbf24]",
      };
    }

    if (
      c.includes("গান") ||
      c.includes("song")
    ) {
      return {
        icon: "🎵",
        label: cat,
        style:
          "border-pink-400/40 bg-pink-50 dark:bg-[#ec4899]/15 text-pink-600 dark:text-[#f472b6]",
      };
    }

    if (
      c.includes("কবিতা") ||
      c.includes("poem")
    ) {
      return {
        icon: "📜",
        label: cat,
        style:
          "border-sky-400/40 bg-sky-50 dark:bg-[#38bdf8]/15 text-sky-600 dark:text-[#38bdf8]",
      };
    }

    if (
      c.includes("গল্প") ||
      c.includes("story")
    ) {
      return {
        icon: "📖",
        label: cat,
        style:
          "border-emerald-400/40 bg-emerald-50 dark:bg-[#22c55e]/15 text-emerald-600 dark:text-[#4ade80]",
      };
    }

    if (
      c.includes("নাটক") ||
      c.includes("drama")
    ) {
      return {
        icon: "🎭",
        label: cat,
        style:
          "border-purple-400/40 bg-purple-50 dark:bg-[#a855f7]/15 text-purple-600 dark:text-[#c084fc]",
      };
    }

    if (
      c.includes("কৌতুক") ||
      c.includes("humor")
    ) {
      return {
        icon: "😂",
        label: cat,
        style:
          "border-orange-400/40 bg-orange-50 dark:bg-[#f97316]/15 text-orange-600 dark:text-[#fb923c]",
      };
    }

    return {
      icon: "✨",
      label: cat,
      style:
        "border-blue-400/40 bg-blue-50 dark:bg-[#1877F2]/15 text-blue-600 dark:text-[#60a5fa]",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white selection:bg-[#f59e0b]/30 selection:text-white transition-colors duration-300">

      {/* =========================
          Hero Banner
      ========================= */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-[#172033] bg-slate-50 dark:bg-[#02050b] py-12 sm:py-16">

        <div className="absolute left-[15%] top-[-20%] h-[450px] w-[450px] rounded-full bg-[#f59e0b]/10 blur-[130px]" />

        <div className="absolute right-[10%] bottom-[-20%] h-[400px] w-[400px] rounded-full bg-[#1877F2]/10 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <div>

              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-50 dark:bg-[#f59e0b]/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-[#fbbf24]">
                <span>✨</span>
                FCL Nostalgia Archive
              </span>

              <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">
                FCL স্মৃতি ও আড্ডা
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-[#94a3b8] max-w-2xl">
                ২০১৩ সাল থেকে শুরু হওয়া আবেগ, সোনালী স্মৃতি, কবিতা, গান, নাটক ও বন্ধুত্বের অমূল্য ইতিহাস। প্রতিটি লেখার সাথে মূল ফেসবুক পোস্টের লিংক সংরক্ষিত।
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-[#1e293b] bg-white/90 dark:bg-[#0b1220]/90 px-5 py-3 backdrop-blur-md shrink-0 shadow-sm">

              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#64748b]">
                Total Archived Memories
              </p>

              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-[#fbbf24]">
                {memories.length} টি পোস্ট
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =========================
          Filter & Search Bar
      ========================= */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-[#1e293b] pb-6">

          <div className="flex flex-wrap gap-2">

            {categories.map((cat) => (

              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSeriesName(null);
                  setOpenEpisode(null);
                }}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                  selectedCategory === cat
                    ? "bg-[#f59e0b] text-black shadow-lg shadow-[#f59e0b]/20"
                    : "border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0b1220] text-slate-600 dark:text-[#94a3b8] hover:border-[#f59e0b]/40 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat === "All"
                  ? "🌟 সকল স্মৃতি (Overall)"
                  : cat}
              </button>

            ))}

          </div>

          <div className="w-full sm:w-72">

            <input
              type="text"
              placeholder="স্মৃতি বা লেখক খুঁজুন..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0b1220] px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#64748b] focus:border-[#f59e0b] focus:outline-none"
            />

          </div>

        </div>

      </section>

      {/* =========================
          Main Grid Content
      ========================= */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

        {loading ? (

          <div className="flex h-64 items-center justify-center">

            <div className="text-sm font-semibold text-amber-600 dark:text-[#fbbf24] animate-pulse">
              Loading FCL Memories Archive, please be patient...
            </div>

          </div>

        ) : selectedCategory ===
            "ধারাবাহিক সিরিজ" &&
          !selectedSeriesName ? (

          /* =========================
              Series List
          ========================= */
          <div>

            <div className="mb-6 flex items-center justify-between">

              <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-[#fbbf24]">
                📚 উপলব্ধ ধারাবাহিক সিরিজসমূহ (
                {uniqueSeriesNames.length} টি)
              </h3>

              <p className="text-xs text-slate-500 dark:text-[#94a3b8]">
                যেকোনো সিরিজে ক্লিক করে পর্বগুলো দেখুন
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {uniqueSeriesNames.map(
                (sName, idx) => {

                  const eps =
                    seriesDataList.filter(
                      (item) =>
                        item.series_name ===
                        sName
                    );

                  const author =
                    eps[0]?.Author ||
                    "Unknown";

                  const totalEps =
                    eps.length;

                  const status =
                    eps[0]?.status ||
                    "Running";

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedSeriesName(
                          sName
                        );

                        // নতুন সিরিজে গেলে কোনো Episode open থাকবে না
                        setOpenEpisode(null);
                      }}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0b1220] p-7 shadow-sm transition cursor-pointer hover:border-amber-500/60 hover:shadow-xl hover:-translate-y-1"
                    >

                      <div>

                        <div className="flex items-center justify-between">

                          <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400">
                            {totalEps} টি পর্ব
                          </span>

                          <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {status}
                          </span>

                        </div>

                        <h4 className="mt-4 text-xl font-black group-hover:text-amber-600 dark:group-hover:text-[#fbbf24] transition leading-snug break-words">
                          {sName}
                        </h4>

                        <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-[#94a3b8] break-words">
                          লেখক:{" "}
                          <span className="text-slate-900 dark:text-white font-bold">
                            {author}
                          </span>
                        </p>

                      </div>

                      <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-[#172033] pt-4">

                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                          সিরিজটি পড়ুন →
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        ) : selectedCategory ===
            "ধারাবাহিক সিরিজ" &&
          selectedSeriesName ? (

          /* =========================
              Selected Series Episodes
          ========================= */
          <div>

            <div className="mb-6 flex items-center justify-between">

              <div>

                <button
                  onClick={() => {
                    setSelectedSeriesName(
                      null
                    );

                    setOpenEpisode(null);
                  }}
                  className="mb-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-slate-100 dark:bg-[#0b1220] px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-white transition hover:border-amber-500"
                >
                  ← সকল সিরিজের তালিকায় ফিরে যান
                </button>

                <h3 className="text-2xl font-black text-amber-600 dark:text-[#fbbf24] break-words">
                  📖 {selectedSeriesName}
                </h3>

              </div>

            </div>

            {/* ==========================================
                Episode Grid
                ⭐ items-start = অন্য কার্ডের height
                ⭐ openEpisode = একই সময়ে শুধু ১টি open
            =========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

              {seriesDataList
                .filter(
                  (item) =>
                    item.series_name ===
                    selectedSeriesName
                )
                .sort(
                  (a, b) =>
                    Number(a.episode_no) -
                    Number(b.episode_no)
                )
                .map(
                  (item, idx) => {

                    const episodeNumber =
                      Number(
                        item.episode_no
                      );

                    // ⭐ শুধু যেটাতে click করা হয়েছে সেটিই open
                    const isOpen =
                      openEpisode ===
                      episodeNumber;

                    const formattedContent =
                      formatSmartContent(
                        item.Content ||
                          "",
                        "ধারাবাহিক সিরিজ"
                      );

                    return (
                      <div
                        key={
                          item.episode_no ||
                          idx
                        }
                        className="self-start rounded-3xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0b1220] shadow-sm overflow-hidden transition-all"
                      >

                        {/* =========================
                            Episode Header
                        ========================= */}
                        <button
                          onClick={() =>
                            toggleEpisode(
                              episodeNumber
                            )
                          }
                          className="w-full flex items-center justify-between p-4 text-left transition hover:bg-slate-50 dark:hover:bg-[#111930]"
                        >

                          <div className="flex items-center gap-2.5 min-w-0">

                            <span className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-[#f59e0b]/15 px-2.5 py-1 text-[11px] font-black text-amber-600 dark:text-[#fbbf24]">
                              📌 পর্ব -{" "}
                              {item.episode_no}
                            </span>

                          </div>

                          <span className="ml-3 shrink-0 text-xs font-black text-amber-500">
                            {isOpen
                              ? "▲ বন্ধ করুন"
                              : "▼ পড়ুন"}
                          </span>

                        </button>

                        {/* =========================
                            Episode Title
                        ========================= */}
                        <div className="px-4 pb-3">

                          <h4 className="text-sm font-black text-slate-900 dark:text-white break-words">
                            {
                              item.episode_title
                            }
                          </h4>

                        </div>

                        {/* =========================
                            ONLY Selected Episode Content
                        ========================= */}
                        {isOpen && (

                          <div className="border-t border-slate-100 dark:border-[#172033] p-4 bg-slate-50/50 dark:bg-[#060a14] animate-fadeIn">

                            {/* Author */}
                            <p className="text-[11px] font-semibold text-blue-600 dark:text-[#60a5fa] mb-2 break-words">

                              ✍ লেখক:{" "}

                              <span className="text-slate-900 dark:text-white font-bold">
                                {
                                  item.Author
                                }
                              </span>

                            </p>

                            {/* Summary */}
                            {item.summary && (

                              <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed break-words">

                                <span className="font-black text-amber-600 dark:text-amber-400 block mb-1">
                                  📌 সারসংক্ষেপ:
                                </span>

                                <div className="break-words">
                                  {renderHighlightedParts(
                                    item.summary
                                  )}
                                </div>

                              </div>

                            )}

                            {/* Story Content */}
                            <div className="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#030714] p-3 text-xs text-slate-700 dark:text-[#cbd5e1] leading-relaxed max-h-[450px] overflow-y-auto break-words">

                              {renderFormattedContent(
                                formattedContent
                              )}

                            </div>

                            {/* Facebook Link */}
                            {item.facebook_link && (

                              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#172033] flex justify-end">

                                <a
                                  href={
                                    item.facebook_link
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-xl bg-blue-50 dark:bg-[#1877F2]/15 border border-blue-200 dark:border-[#1877F2]/40 px-3 py-1.5 text-[11px] font-bold text-blue-600 dark:text-[#60a5fa] transition hover:bg-[#1877F2] hover:text-white"
                                >

                                  <span>
                                    🔗 মূল পোস্ট
                                  </span>

                                  <span>
                                    →
                                  </span>

                                </a>

                              </div>

                            )}

                          </div>

                        )}

                      </div>
                    );
                  }
                )}

            </div>

          </div>

        ) : filteredMemories.length ===
            0 ? (

          /* =========================
              No Result
          ========================= */
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0b1220] p-8 text-center shadow-sm">

            <span className="text-4xl mb-3">
              📖
            </span>

            <p className="text-base font-semibold">
              কোনো পোস্ট পাওয়া যায়নি
            </p>

          </div>

        ) : (

          /* =========================
              Normal Memories
          ========================= */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">

            {filteredMemories.map(
              (item) => {

                const badge =
                  getCategoryBadge(
                    item.category
                  );

                const formattedContent =
                  formatSmartContent(
                    item.content,
                    item.category
                  );

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-gradient-to-b dark:from-[#0b1220] dark:via-[#070d1a] dark:to-[#040812] p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#f59e0b]/60 hover:shadow-2xl hover:shadow-[#f59e0b]/10"
                  >

                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f59e0b]/50 to-transparent opacity-0 transition group-hover:opacity-100" />

                    <div>

                      {/* Category + Date */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-[#172033] pb-3">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${badge.style}`}
                        >
                          <span>
                            {badge.icon}
                          </span>

                          <span>
                            {badge.label}
                          </span>

                        </span>

                        {item.date && (

                          <span className="text-[11px] font-extrabold text-slate-500 dark:text-[#94a3b8] bg-slate-100 dark:bg-[#030712] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1e293b]">
                            📅 {item.date}
                          </span>

                        )}

                      </div>

                      {/* Title + Author */}
                      <div className="mt-4">

                        <h3 className="text-lg sm:text-2xl font-black group-hover:text-amber-600 dark:group-hover:text-[#fbbf24] transition leading-snug break-words">
                          {item.title}
                        </h3>

                        <p className="text-xs font-semibold text-blue-600 dark:text-[#60a5fa] mt-1 break-words">

                          ✍ লেখক:{" "}

                          <span className="text-slate-900 dark:text-white font-bold">
                            {item.author}
                          </span>

                        </p>

                      </div>

                      {/* Content */}
                      <div className="mt-5 rounded-2xl border border-slate-100 dark:border-[#172033] bg-slate-50 dark:bg-[#030714] p-4 sm:p-5 text-sm sm:text-[15px] text-slate-700 dark:text-[#cbd5e1] leading-relaxed max-h-96 overflow-y-auto break-words">

                        {renderFormattedContent(
                          formattedContent
                        )}

                      </div>

                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-[#172033] pt-4 text-xs">

                      {item.fbPostUrl ? (

                        <a
                          href={
                            item.fbPostUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 dark:bg-[#1877F2]/15 border border-blue-200 dark:border-[#1877F2]/40 px-3.5 py-1.5 font-bold text-blue-600 dark:text-[#60a5fa] transition hover:bg-[#1877F2] hover:text-white"
                        >

                          <span>
                            🔗 মূল ফেসবুক পোস্ট দেখুন
                          </span>

                          <span>
                            →
                          </span>

                        </a>

                      ) : (

                        <span className="text-[11px] text-slate-400">
                          আর্কাইভ পোস্ট
                        </span>

                      )}

                      {item.fbPostUrl && (

                        <button
                          onClick={() =>
                            handleCopyLink(
                              item.fbPostUrl,
                              item.id
                            )
                          }
                          className="text-[11px] font-bold text-slate-500 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white transition"
                        >

                          {copiedId ===
                          item.id
                            ? "✓ Copied!"
                            : "📋 Copy Link"}

                        </button>

                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </main>

    </div>
  );
}