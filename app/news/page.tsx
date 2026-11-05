"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface NewsItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  date: string;
  sourcePage: string;
  sourceUrl: string;
  summary: string;
}

export default function FCLPaperNewsPortal() {
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("সব খবর");

  // আপনার কথামতো এফসিএল স্পেশাল ক্যাটেগরিগুলো
  const categories = [
    "সব খবর",
    "Tournament Special",
    "Player Spotlight",
    "Auction & Team",
    "Nostalgia",
    "Match Review",
    "FCL Humor",
    "League Notices"
  ];

  useEffect(() => {
    async function fetchAllPortalContent() {
      try {
        setLoading(true);
        const combinedNews: NewsItem[] = [];

        // ১. Thrillers / High Voltage Matches ফেচ করা
        try {
          const res = await fetch("/api/thrillers-data");
          const contentType = res.headers.get("content-type");
          if (res.ok && contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (data.highVoltage && Array.isArray(data.highVoltage)) {
              data.highVoltage.forEach((m: any, idx: number) => {
                combinedNews.push({
                  id: `hvm-${idx}`,
                  category: "Match Review",
                  title: m.matchTitle || "High Voltage Thriller",
                  subtitle: `🏟️ ${m.tournament || "FCL Tournament"}`,
                  date: m.date || "সাম্প্রতিক",
                  sourcePage: "High Voltage Matches",
                  sourceUrl: "/thrillers",
                  summary: m.description || "",
                });
              });
            }
            if (data.extraordinary && Array.isArray(data.extraordinary)) {
              data.extraordinary.forEach((e: any, idx: number) => {
                combinedNews.push({
                  id: `extra-${idx}`,
                  category: "Player Spotlight",
                  title: e.performanceTitle || "Extraordinary Performance",
                  subtitle: `⭐ পারফর্মার: ${e.playerName || "Unknown"}`,
                  date: e.matchYear || "রেকর্ড",
                  sourcePage: "Extraordinary Performances",
                  sourceUrl: "/extraordinary-performances",
                  summary: e.description || "",
                });
              });
            }
          }
        } catch (e) {
          console.error("Error fetching thrillers:", e);
        }

        // ২. FCL Matches Archive ফেচ করা
        try {
          const res = await fetch("/api/fcl-data");
          const contentType = res.headers.get("content-type");
          if (res.ok && contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (data.matches && Array.isArray(data.matches)) {
              data.matches.forEach((match: any, idx: number) => {
                combinedNews.push({
                  id: `match-${idx}`,
                  category: "Tournament Special",
                  title: match.matchTitle || match.title || "FCL Match Record",
                  subtitle: `📅 ${match.date} | ${match.year || ""}`,
                  date: match.date || "",
                  sourcePage: "Match Directory",
                  sourceUrl: match.link || "/matches",
                  summary: match.summary || "",
                });
              });
            }
          }
        } catch (e) {
          console.error("Error fetching matches:", e);
        }

        // ৩. Memories ফেচ করা
        try {
          const res = await fetch("/api/memories-data");
          const contentType = res.headers.get("content-type");
          if (res.ok && contentType && contentType.includes("application/json")) {
            const data = await res.json();
            const mems = data.memories || data.data || [];
            if (Array.isArray(mems)) {
              mems.forEach((mem: any, idx: number) => {
                combinedNews.push({
                  id: `mem-${idx}`,
                  category: "Nostalgia",
                  title: mem.title || "FCL Memory & Nostalgia",
                  subtitle: `✍️ লেখক: ${mem.author || "Community"}`,
                  date: mem.date || "",
                  sourcePage: "Memories Archive",
                  sourceUrl: mem.fbPostUrl || "/memories",
                  summary: mem.content || "",
                });
              });
            }
          }
        } catch (e) {
          console.error("Error fetching memories:", e);
        }

        // ডেমো বা ফলব্যাক ডাটা যদি কিছু না থাকে
        if (combinedNews.length === 0) {
          combinedNews.push({
            id: "demo-1",
            category: "Tournament Special",
            title: "ফেসবুক ক্রিকেট লিগের নতুন মৌসুমের জমজমাট প্রস্তুতি শুরু",
            subtitle: "আসন্ন টুর্নামেন্টের ফিকচার ও রুলস প্রকাশ",
            date: "আজ",
            sourcePage: "FCL Portal",
            sourceUrl: "/",
            summary: "এফসিএল-এর নতুন সিজন নিয়ে জল্পনা তুঙ্গে। দলগুলোর নিলাম ও স্কোয়াড ঘোষণা নিয়ে চলছে শেষ মুহূর্তের প্রস্তুতি..."
          });
        }

        setNewsFeed(combinedNews);
      } catch (err) {
        console.error("Portal aggregate error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllPortalContent();
  }, []);

  const filteredNews = activeCategory === "সব খবর"
    ? newsFeed
    : newsFeed.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[#060a14] dark:text-slate-100 pb-16 font-sans">
      
      {/* 📰 পেপার হেডার সেকশন */}
      <header className="border-b border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0b1220] shadow-sm">
        
        {/* টপ ইনফো বার */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080e1a] text-xs py-1.5 px-4">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              ঢাকা, বৃহস্পতিবার, ৫ নভেম্বর ২০২৬ • এফসিএল পেপার এডিশন
            </span>
            <div className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300">
              <Link href="/" className="hover:text-sky-500">হোম পেজ</Link>
              <span>•</span>
              <span className="text-red-600">LIVE FCL</span>
            </div>
          </div>
        </div>

        {/* লোগো: একদম মাঝখানে বড় আকারে */}
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col items-center justify-center text-center">
          <img 
            src="/fcl-paper-logo.jpeg" 
            alt="FCL Paper Logo" 
            className="h-20 sm:h-28 w-auto object-contain mb-2 shadow-sm rounded-lg"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <p className="text-[11px] font-black tracking-[0.2em] text-slate-500 uppercase">
            Facebook Cricket League • Daily Sports Newspaper
          </p>
        </div>

        {/* ক্যাটাগরি মেনু নেভবার */}
        <nav className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220] sticky top-0 z-30 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 flex items-center justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto py-3 text-xs font-black uppercase tracking-wider scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap transition cursor-pointer px-3 py-1 rounded-md ${
                  activeCategory === cat 
                    ? "bg-red-600 text-white shadow" 
                    : "text-slate-700 dark:text-slate-300 hover:text-sky-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* 🌐 মূল পেপার লেআউট (থ্রি-কলাম নিউজ গ্রিড) */}
      <main className="mx-auto max-w-7xl px-4 mt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ১. বাম কলাম: সর্বশেষ ছোট খবর ও নোটিশ */}
            <div className="lg:col-span-3 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6">
              <div className="border-b-2 border-red-600 pb-1 mb-3 text-sm font-black uppercase flex items-center justify-between">
                <span>সর্বশেষ আপডেট</span>
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              </div>
              
              {filteredNews.slice(0, 4).map((item) => (
                <div key={item.id} className="group cursor-pointer pb-3 border-b border-slate-200 dark:border-slate-800/60 last:border-0">
                  <span className="text-[10px] font-black text-red-500 uppercase">{item.category}</span>
                  <Link href={item.sourceUrl} className="text-xs font-bold leading-snug group-hover:text-sky-500 transition mt-1 block">
                    {item.title}
                  </Link>
                  <span className="text-[10px] text-slate-400 mt-1 block">{item.subtitle}</span>
                </div>
              ))}

              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <h5 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase mb-1">
                  📢 League Notices
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  ম্যানেজমেন্ট কমিটি ও অ্যাডমিন প্যানেলের নির্দেশিকা মেনে চলুন। নিয়মশৃঙ্খলা ভঙ্গকারীদের বিরুদ্ধে শাস্তিমূলক ব্যবস্থা নেওয়া হবে।
                </p>
              </div>
            </div>

            {/* ২. মাঝের কলাম: প্রধান লিড নিউজ ও সাব-হেডলাইন (বড় আকারে) */}
            <div className="lg:col-span-6 space-y-6 lg:border-r lg:border-slate-300 lg:dark:border-slate-800 lg:pr-6">
              
              {/* প্রধান লিড নিউজ */}
              {filteredNews.slice(0, 1).map((lead) => (
                <div key={lead.id} className="group cursor-pointer space-y-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-400">[ FCL Match & Performance Spotlight Banner ]</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white">
                    লিড নিউজ • {lead.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black leading-tight group-hover:text-sky-500 transition">
                    {lead.title}
                  </h2>
                  <p className="text-xs font-bold text-sky-600 dark:text-sky-400">
                    {lead.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {cleanPreview(lead.summary)}
                  </p>
                  <div className="pt-2">
                    <Link 
                      href={lead.sourceUrl}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-black shadow hover:bg-blue-600 transition"
                    >
                      <span>বিস্তারিত পড়ুন ({lead.sourcePage})</span>
                      <span>↗</span>
                    </Link>
                  </div>
                </div>
              ))}

              <hr className="border-slate-200 dark:border-slate-800 my-6" />

              {/* সাব-লিড নিউজ গ্রিড */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredNews.slice(1, 5).map((news) => (
                  <div key={news.id} className="group cursor-pointer bg-white dark:bg-[#0b1220] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">{news.category}</span>
                      <h3 className="text-xs font-black leading-snug group-hover:text-sky-500 transition mt-1 line-clamp-2">
                        {news.title}
                      </h3>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{news.subtitle}</span>
                      <Link href={news.sourceUrl} className="font-bold text-sky-600 hover:underline">পড়ুন →</Link>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* ৩. ডান কলাম: কলামিস্ট, স্মৃতিচারণ ও ট্রল/ফানি মোমেন্টস */}
            <div className="lg:col-span-3 space-y-4">
              <div className="border-b-2 border-sky-600 pb-1 mb-3 text-sm font-black uppercase">
                নস্টালজিয়া ও কলাম
              </div>

              <div className="bg-white dark:bg-[#0b1220] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <span className="text-[9px] font-black uppercase text-amber-500">স্মৃতিচারণ (Nostalgia)</span>
                <h4 className="text-xs font-black leading-snug hover:text-sky-500 cursor-pointer">
                  এফসিএল-এর পুরোনো স্মরণীয় ম্যাচ ও ঐতিহাসিক মুহূর্তগুলোর সোনালী দিন...
                </h4>
                <p className="text-[10px] text-slate-400">লিগ ইতিহাস থেকে সংগৃহীত</p>
              </div>

              <div className="bg-white dark:bg-[#0b1220] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <span className="text-[9px] font-black uppercase text-pink-500">FCL Humor / Memes</span>
                <h4 className="text-xs font-black leading-snug hover:text-sky-500 cursor-pointer">
                  ডাগআউটের হাসিখুশি মুহূর্ত ও আম্পায়ারিং বিতর্ক নিয়ে হালকা বিনোদনমূলক কলাম...
                </h4>
                <p className="text-[10px] text-slate-400">ডেসক রিপোর্ট</p>
              </div>

              {/* ডিরেক্টরি শর্টকাট */}
              <div className="pt-4 space-y-2">
                <Link 
                  href="/" 
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-slate-900 transition shadow"
                >
                  <span>← মূল হোম পেজে ফিরে যান</span>
                </Link>
              </div>

            </div>

          </div>
        )}
      </main>

    </div>
  );
}

function cleanPreview(text: string): string {
  return text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\s+/g, " ").trim();
}