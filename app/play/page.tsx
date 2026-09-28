"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PlayPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-[#1877F2]/30 selection:text-white font-sans pb-20 sm:pb-0">
      
      {/* ================================================================
          DESKTOP / TABLET HEADER — exactly like Home
         ================================================================ */}
      <header
        className={`hidden sm:block sticky top-0 z-40 border-b transition-all duration-500 ${
          scrolled
            ? "border-[#1e293b] bg-[#020617]/90 backdrop-blur-xl py-1 shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
            : "border-[#1e293b]/60 bg-[#020617]/70 backdrop-blur-md py-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border border-[#1877F2]/40 bg-[#111936] shadow-lg shadow-[#1877F2]/10 transition-transform duration-300 hover:scale-105 hover:rotate-3">
              <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain p-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white">
                  Facebook <span className="text-[#1877F2]">Cricket League</span>
                </h1>
                <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#f59e0b]">FCL</span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#94a3b8]">Official FCL Digital Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="text-sm font-semibold text-white transition hover:text-[#1877F2]">Home</Link>
            <Link href="/#gateways" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">Portals</Link>
            <Link href="/rules" className="text-sm font-medium text-[#38bdf8] transition hover:text-white">Rules & Formats</Link>
            <Link href="/players" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">Players</Link>
            <Link href="/rankings" className="text-sm font-medium text-[#f59e0b] transition hover:text-white">Rankings</Link>
            <Link href="/records" className="text-sm font-medium text-[#fbbf24] transition hover:text-white">Hall of Fame</Link>
            <Link href="/memories" className="text-sm font-bold text-[#f472b6] transition hover:text-white flex items-center gap-1">Memories 📖</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/bn" className="flex items-center gap-1.5 rounded-full border border-[#1877F2]/40 bg-gradient-to-r from-[#1877F2] to-[#166fe5] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:brightness-110 active:scale-95">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#1877F2]">f</span>
              <span>বাংলা ভার্সন</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#1e293b] bg-[#0b1220] text-white transition hover:border-[#1877F2]/50">
              {mobileMenuOpen ? <span className="text-xl font-bold">✕</span> : <span className="text-xl">☰</span>}
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================
          MOBILE APP HEADER — exactly like Home
         ================================================================ */}
      <header className="sm:hidden sticky top-0 z-50 border-b border-[#18233b] bg-[#050a17]/95 backdrop-blur-xl">
        <div className="flex h-[68px] items-center justify-between px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#1877F2]/40 bg-[#101a35] shadow-[0_0_18px_rgba(24,119,242,.16)]">
              <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain p-1" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[14px] font-extrabold tracking-tight text-white">Facebook Cricket League</span>
                <span className="rounded border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1 py-0.5 text-[7px] font-black text-[#f59e0b]">FCL</span>
              </div>
              <p className="text-[8px] font-medium text-[#64748b]">Official FCL Digital Platform</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/bn" aria-label="বাংলা ভার্সন" className="flex h-9 items-center gap-1 rounded-full border border-[#1877F2]/40 bg-[#1877F2]/15 px-2.5 text-[9px] font-bold text-[#60a5fa]">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1877F2] text-[8px] font-black text-white">f</span>
              বাংলা
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1e293b] bg-[#0b1220] text-white">
              {mobileMenuOpen ? <span className="text-base font-bold">✕</span> : <span className="text-lg">☰</span>}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="border-t border-[#18233b] bg-[#070d1b] px-4 py-3 shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/rules" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3 py-2.5 text-[11px] font-semibold text-[#38bdf8]">⚖️ Rules & Formats</Link>
              <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3 py-2.5 text-[11px] font-semibold text-[#fbbf24]">🏆 Hall of Fame</Link>
              <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3 py-2.5 text-[11px] font-semibold text-[#60a5fa]">👥 Players</Link>
              <Link href="/memories" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3 py-2.5 text-[11px] font-semibold text-[#f472b6]">📖 Memories</Link>
            </div>
          </nav>
        )}
      </header>

      {/* ================================================================
          GAME LAUNCH AREA
         ================================================================ */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-[2.5rem] border border-[#1877F2]/40 bg-gradient-to-b from-[#0b1220] to-[#040812] p-8 sm:p-14 shadow-[0_0_80px_rgba(24,119,242,0.15)]">
          
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#1877F2]/50 bg-[#1877F2]/20 text-4xl shadow-lg shadow-[#1877F2]/30 animate-bounce">
            🏆
          </div>

          <span className="mt-6 inline-block rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#fbbf24]">
            FCL Online Battle Ground
          </span>

          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white">
            Play Facebook Cricket League Online
          </h1>

         <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-[#94a3b8] leading-relaxed">
            স্মার্ট এআই বটের সাথে প্র্যাকটিস, রুম কোড দিয়ে বন্ধুদের সাথে অনলাইন চ্যালেঞ্জ, রোমাঞ্চকর টুর্নামেন্ট কিংবা <span className="text-[#60a5fa] font-bold">3v3 Single, T20 (4v4), T20+ (5v5)</span> ও ওডিআই টিম ম্যাচ—সব মোডেই এখন একসাথে খেলতে পারবেন।
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
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              পোর্টাল হাবে ফিরুন
            </Link>
          </div>

        </div>
      </section>

      {/* ================================================================
          FOOTER — exactly like Home
         ================================================================ */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-4 py-7 sm:px-6 sm:py-8 mt-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center md:flex-row md:text-left">
          <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
          <p className="text-[10px] text-[#64748b] sm:text-xs">© 2026 Facebook Cricket League | Arif Md. Jiad | All rights reserved.</p>
        </div>
      </footer>

      {/* ================================================================
          MOBILE FIXED BOTTOM NAV — exactly like Home
         ================================================================ */}
      <nav className="fixed bottom-0 left-0 right-0 z-[60] border-t border-[#1e293b] bg-[#050a17]/95 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl shadow-[0_-12px_40px_rgba(0,0,0,.45)] sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          <Link href="/" className="flex flex-col items-center gap-1 py-1 text-[#64748b] transition hover:text-[#60a5fa]">
            <span className="flex h-7 items-center text-[20px]">⌂</span>
            <span className="text-[8px] font-semibold">Home</span>
          </Link>
          <Link href="/play" className="flex flex-col items-center gap-1 py-1 text-[#60a5fa]">
            <span className="flex h-7 items-center text-[18px]">🎮</span>
            <span className="text-[8px] font-bold">Play</span>
          </Link>
          <Link href="/players" className="flex flex-col items-center gap-1 py-1 text-[#64748b] transition hover:text-[#60a5fa]">
            <span className="flex h-7 items-center text-[18px]">👥</span>
            <span className="text-[8px] font-semibold">Players</span>
          </Link>
          <Link href="/rankings" className="flex flex-col items-center gap-1 py-1 text-[#64748b] transition hover:text-[#fbbf24]">
            <span className="flex h-7 items-center text-[18px]">🏆</span>
            <span className="text-[8px] font-semibold">Ranking</span>
          </Link>
          <Link href="/memories" className="flex flex-col items-center gap-1 py-1 text-[#64748b] transition hover:text-[#f472b6]">
            <span className="flex h-7 items-center text-[18px]">📖</span>
            <span className="text-[8px] font-semibold">Memories</span>
          </Link>
        </div>
      </nav>

    </main>
  );
}