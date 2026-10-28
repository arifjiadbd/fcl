"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// থিম ডিটেকশন হুক (অন্যান্য পেজের সাথে সামঞ্জস্যপূর্ণ)
function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const read = () => {
      const h = document.documentElement;
      const b = document.body;
      const dt = (
        h.getAttribute("data-theme") ||
        h.getAttribute("data-mode") ||
        b.getAttribute("data-theme") ||
        ""
      ).toLowerCase();
      if (dt === "dark" || dt === "light") return dt === "dark";

      const cls = `${h.className} ${b.className}`.toLowerCase();
      if (/\blight\b/.test(cls)) return false;
      if (/\bdark\b/.test(cls)) return true;

      const scheme = h.style.colorScheme;
      if (scheme === "light" || scheme === "dark") return scheme === "dark";

      try {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") return saved === "dark";
      } catch {}

      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    };

    const update = () => setIsDark(read());
    update();

    const obs = new MutationObserver(update);
    const opts = { attributes: true, attributeFilter: ["class", "data-theme", "data-mode", "style"] };
    obs.observe(document.documentElement, opts);
    obs.observe(document.body, opts);
    window.addEventListener("storage", update);

    return () => {
      obs.disconnect();
      window.removeEventListener("storage", update);
    };
  }, []);

  return isDark;
}

export default function PlayPage() {
  const isDark = useIsDark();

  return (
    <main
      className={`min-h-[80vh] font-sans flex items-center justify-center py-12 px-4 relative overflow-hidden transition-colors duration-300 ${
        isDark
          ? "bg-[#020617] text-white selection:bg-[#1877F2]/30 selection:text-white"
          : "bg-slate-100 text-slate-900 selection:bg-[#1877F2]/20 selection:text-slate-900"
      }`}
    >
      {/* ব্যাকগ্রাউন্ডে অ্যানিমেটেড ক্রিকেট বল ও ব্যাট */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-10 text-3xl animate-[bounce_4s_ease-in-out_infinite] opacity-30">🏏</div>
        <div className="absolute bottom-12 right-12 text-3xl animate-[bounce_5s_ease-in-out_infinite] opacity-30 delay-700">🔴</div>
        <div className="absolute top-1/3 right-1/4 text-2xl animate-[pulse_3s_ease-in-out_infinite] opacity-20">⚾</div>
        <div className="absolute bottom-1/4 left-1/5 text-2xl animate-[pulse_4s_ease-in-out_infinite] opacity-20">🏏</div>
      </div>

      {/* ================================================================
          GAME LAUNCH AREA
         ================================================================ */}
      <div className="mx-auto max-w-4xl w-full text-center relative z-10">
        <div
          className={`rounded-[2.5rem] border p-8 sm:p-14 transition-all duration-300 ${
            isDark
              ? "border-[#1877F2]/40 bg-gradient-to-b from-[#0b1220] to-[#040812] shadow-[0_0_80px_rgba(24,119,242,0.15)]"
              : "border-slate-200 bg-white shadow-xl"
          }`}
        >
          
          {/* FCL লোগো এবং অ্যানিমেটেড ট্রফি */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-600/15 p-2 shadow-md animate-pulse">
              <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain" />
            </div>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#1877F2]/50 bg-[#1877F2]/20 text-4xl shadow-lg shadow-[#1877F2]/30 animate-bounce">
              🏆
            </div>
          </div>

          <span className="inline-block rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#fbbf24]">
            FCL Online Battle Ground
          </span>

          <h1 className={`mt-4 text-3xl sm:text-5xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Play Facebook Cricket League Online
          </h1>

          <p className={`mx-auto mt-4 max-w-xl text-sm sm:text-base leading-relaxed ${isDark ? "text-[#94a3b8]" : "text-slate-600"}`}>
            স্মার্ট এআই বটের সাথে প্র্যাকটিস, রুম কোড দিয়ে বন্ধুদের সাথে অনলাইন চ্যালেঞ্জ, রোমাঞ্চকর টুর্নামেন্ট কিংবা <span className="text-[#60a5fa] font-bold">3v3 Single, T20 (4v4), T20+ (5v5)</span> ও ওডিআই টিম ম্যাচ—সব মোডেই এখন একসাথে খেলতে পারবেন।
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://fcl-online.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1877F2] to-[#1d63d8] px-8 py-4 text-base font-bold text-white shadow-[0_12px_40px_rgba(24,119,242,0.4)] transition hover:brightness-110 active:scale-95"
            >
              <span>🎮 গেম খেলা শুরু করুন (Launch Game)</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>

            <Link
              href="/"
              className={`rounded-2xl border px-8 py-4 text-base font-semibold transition ${
                isDark
                  ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                  : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              পোর্টাল হাবে ফিরুন
            </Link>
          </div>

        </div>
      </div>

    </main>
  );
}