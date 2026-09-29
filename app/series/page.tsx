"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SeriesItem {
  series_name: string;
  Author: string;
  episode_no: number | string;
  episode_title: string;
  publish_date: string | number;
  summary: string;
  facebook_link?: string;
  status: string;
  Content: string;
}

export default function SeriesHubPage() {
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<string>("All");
  const [activeModalItem, setActiveModalItem] = useState<SeriesItem | null>(null);

  useEffect(() => {
    // আপনার মেমোরিজ পেজের মতো ডেটা ফেচ করার API রুট এখানে থাকবে
    // যেমন: fetch("/api/fcl-series") বা সরাসরি আপনার ডেটা সোর্স
    fetch("/api/fcl-series")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSeriesList(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching series:", err);
        setLoading(false);
      });
  }, []);

  // ইউনিক সিরিজের নামগুলোর তালিকা বের করা ফিল্টারিংয়ের জন্য
  const uniqueSeriesNames = ["All", ...Array.from(new Set(seriesList.map((item) => item.series_name)))];

  const filteredSeries = selectedSeries === "All" 
    ? seriesList 
    : seriesList.filter((item) => item.series_name === selectedSeries);

  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans pb-20 selection:bg-[#1877F2]/30">
      
      {/* টপ হেডার */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-pink-400">
          📖 FCL Serialized Stories
        </div>
        <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white">
          ধারাবাহিক গল্পের আর্কাইভ
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#94a3b8] max-w-xl mx-auto">
          ফেসবুক গ্রুপে প্রকাশিত আপনার প্রিয় ধারাবাহিক গল্প ও পর্বগুলো এখন এক জায়গায়, পর্বভিত্তিক সাজানো।
        </p>

        {/* সিরিজ ফিল্টার ট্যাব */}
        {!loading && uniqueSeriesNames.length > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {uniqueSeriesNames.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedSeries(name)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition border ${
                  selectedSeries === name
                    ? "bg-[#1877F2] border-[#1877F2] text-white shadow-lg shadow-[#1877F2]/30"
                    : "border-white/10 bg-white/5 text-[#94a3b8] hover:text-white hover:bg-white/10"
                }`}
              >
                {name === "All" ? "সকল সিরিজ" : name}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* কন্টেন্ট বা কার্ড সেকশন */}
      <section className="mx-auto max-w-6xl px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1877F2] border-t-transparent"></div>
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#080d17] p-12 text-center text-[#94a3b8]">
            কোনো ধারাবাহিক পর্ব পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSeries.map((item, index) => (
              <div
                key={index}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[#080d17] p-6 shadow-xl transition hover:border-[#1877F2]/50 hover:shadow-[0_10px_30px_rgba(24,119,242,0.15)] hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/10 px-3 py-1 text-xs font-black text-[#60a5fa]">
                      পর্ব - {item.episode_no}
                    </span>
                    <span className="text-xs text-white/40 font-medium">
                      {item.publish_date}
                    </span>
                  </div>

                  <span className="mt-3 block text-[10px] uppercase font-bold tracking-wider text-pink-400">
                    {item.series_name}
                  </span>

                  <h3 className="mt-2 text-lg font-black text-white leading-snug group-hover:text-[#60a5fa] transition">
                    {item.episode_title}
                  </h3>

                  <p className="mt-2 text-xs text-[#94a3b8] line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[11px] text-white/50 font-semibold">
                    লেখক: {item.Author}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {item.facebook_link && (
                      <a
                        href={item.facebook_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white transition"
                        title="ফেসবুকে পড়ুন"
                      >
                        🌐 FB
                      </a>
                    )}
                    <button
                      onClick={() => setActiveModalItem(item)}
                      className="rounded-lg bg-[#1877F2] px-3 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-[#1565c0]"
                    >
                      সম্পূর্ণ পড়ুন →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* বিস্তারিত পড়ার জন্য পপআপ মডাল (Modal) */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md animate-in fade-in">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] border border-[#1877F2]/40 bg-[#080d17] p-8 shadow-2xl">
            
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="rounded-md bg-[#1877F2]/20 px-2.5 py-1 text-xs font-bold text-[#60a5fa]">
                  {activeModalItem.series_name} — পর্ব {activeModalItem.episode_no}
                </span>
                <h2 className="mt-3 text-2xl font-black text-white">
                  {activeModalItem.episode_title}
                </h2>
                <p className="mt-1 text-xs text-white/40">লেখক: {activeModalItem.Author} | প্রকাশকাল: {activeModalItem.publish_date}</p>
              </div>

              <button
                onClick={() => setActiveModalItem(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-line">
              {activeModalItem.Content}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
              {activeModalItem.facebook_link ? (
                <a
                  href={activeModalItem.facebook_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#60a5fa] hover:underline"
                >
                  ফেসবুক গ্রুপের মূল পোস্টে যান ↗
                </a>
              ) : <span></span>}

              <button
                onClick={() => setActiveModalItem(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}