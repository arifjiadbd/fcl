"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  // শুধুমাত্র হোমপেজের বাংলা ভার্সন (/bn) এর জন্য সাদা ব্যাকগ্রাউন্ড ও বাংলা হেডার কাজ করবে
  const isBanglaHome = pathname === "/bn";

  return (
    <>
      {/* ================================================================
          DESKTOP / TABLET HEADER
         ================================================================ */}
      <header className={`hidden sm:block sticky top-0 z-45 border-b transition-all duration-300 ${
        isBanglaHome 
          ? "border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur-xl py-2" 
          : "border-[#1e293b] bg-[#020617]/95 text-white shadow-[0_10px_40px_rgba(0,0,0,0.4)] py-2"
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          
          {/* লোগো ও ব্র্যান্ড নাম */}
          <Link href={isBanglaHome ? "/bn" : "/"} className="flex items-center gap-3">
            <div className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border shadow-md transition-transform duration-300 hover:scale-105 hover:rotate-3 ${
              isBanglaHome ? "border-blue-500/30 bg-blue-50" : "border-[#1877F2]/40 bg-[#111936]"
            }`}>
              <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain p-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-base sm:text-xl font-bold tracking-tight ${isBanglaHome ? "text-slate-900" : "text-white"}`}>
                  Facebook <span className="text-[#1877F2]">Cricket League</span>
                </h1>
                <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#f59e0b]">
                  FCL
                </span>
              </div>
              <p className={`text-[10px] sm:text-xs ${isBanglaHome ? "text-slate-500" : "text-[#94a3b8]"}`}>
                {isBanglaHome ? "অফিসিয়াল এফসিএল ডিজিটাল প্ল্যাটফর্ম" : "Official FCL Digital Platform"}
              </p>
            </div>
          </Link>

          {/* ডেস্কটপ নেভিগেশন মেনু */}
          <nav className="hidden items-center gap-5 lg:flex">
            {isBanglaHome ? (
              <>
                <Link href="/bn" className="text-sm font-semibold text-blue-600 transition hover:text-blue-800">হোম</Link>
                <Link href="/bn/#gateways" className="text-sm font-medium text-slate-600 transition hover:text-blue-600">পোর্টালসমূহ</Link>
                <Link href="/rules" className="text-sm font-medium text-slate-600 transition hover:text-blue-600">নিয়ম ও ফরম্যাট</Link>
                <Link href="/players" className="text-sm font-medium text-slate-600 transition hover:text-blue-600">খেলোয়াড়বৃন্দ</Link>
                <Link href="/rankings" className="text-sm font-medium text-slate-600 transition hover:text-blue-600">র‌্যাঙ্কিং</Link>
                <Link href="/records" className="text-sm font-medium text-slate-600 transition hover:text-blue-600">হল অব ফেম</Link>
                <Link href="/memories" className="text-sm font-bold text-pink-600 transition hover:text-pink-800 flex items-center gap-1">স্মৃতিচারণ 📖</Link>
              </>
            ) : (
              <>
                <Link href="/" className="text-sm font-semibold text-white transition hover:text-[#1877F2]">Home</Link>
                <Link href="/#gateways" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">Portals</Link>
                <Link href="/rules" className="text-sm font-medium text-[#38bdf8] transition hover:text-white">Rules & Formats</Link>
                <Link href="/players" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">Players</Link>
                <Link href="/rankings" className="text-sm font-medium text-[#f59e0b] transition hover:text-white">Rankings</Link>
                <Link href="/records" className="text-sm font-medium text-[#fbbf24] transition hover:text-white">Hall of Fame</Link>
                <Link href="/memories" className="text-sm font-bold text-[#f472b6] transition hover:text-white flex items-center gap-1">Memories 📖</Link>
              </>
            )}
          </nav>

          {/* ডানপাশের ল্যাঙ্গুয়েজ ও থিম সুইচ বাটন */}
          <div className="flex items-center gap-3">
            <Link
              href={isBanglaHome ? "/" : "/bn"}
              onClick={() => setTheme(isBanglaHome ? "dark" : "light")}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold shadow-md transition active:scale-95 ${
                isBanglaHome 
                  ? "border-slate-300 bg-slate-900 text-white hover:bg-slate-800" 
                  : "border-[#1877F2]/40 bg-gradient-to-r from-[#1877F2] to-[#166fe5] text-white hover:brightness-110"
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ${isBanglaHome ? "bg-white text-slate-900" : "bg-white text-[#1877F2]"}`}>
                {isBanglaHome ? "EN" : "f"}
              </span>
              <span>{isBanglaHome ? "English Version" : "বাংলা ভার্সন"}</span>
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border ${
                isBanglaHome ? "border-slate-300 bg-slate-100 text-slate-900" : "border-[#1e293b] bg-[#0b1220] text-white"
              }`}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* মোবাইল ড্রপডাউন মেনু */}
        {mobileMenuOpen && (
          <div className={`border-t px-6 py-5 lg:hidden animate-in fade-in duration-200 ${
            isBanglaHome ? "border-slate-200 bg-white text-slate-900" : "border-[#1e293b] bg-[#030712] text-white"
          }`}>
            <nav className="flex flex-col gap-3">
              {isBanglaHome ? (
                <>
                  <Link href="/bn" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-900">হোম</Link>
                  <Link href="/rules" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">নিয়ম ও ফরম্যাট</Link>
                  <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">খেলোয়াড়বৃন্দ</Link>
                  <Link href="/rankings" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">র‌্যাঙ্কিং</Link>
                  <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600">হল অব ফেম</Link>
                  <Link href="/memories" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-pink-600">স্মৃতিচারণ 📖</Link>
                </>
              ) : (
                <>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-white">Home</Link>
                  <Link href="/rules" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#38bdf8]">Rules & Formats</Link>
                  <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#60a5fa]">Players</Link>
                  <Link href="/rankings" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#f59e0b]">Rankings</Link>
                  <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#fbbf24]">Hall of Fame</Link>
                  <Link href="/memories" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#f472b6]">Memories 📖</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ================================================================
          MOBILE APP HEADER
         ================================================================ */}
      <header className={`sm:hidden sticky top-0 z-50 border-b backdrop-blur-xl ${
        isBanglaHome ? "border-slate-200 bg-white/95 text-slate-900" : "border-[#18233b] bg-[#050a17]/95 text-white"
      }`}>
        <div className="flex h-[68px] items-center justify-between px-4">
          <Link href={isBanglaHome ? "/bn" : "/"} className="flex min-w-0 items-center gap-2.5">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              isBanglaHome ? "border-slate-300 bg-slate-100" : "border-[#1877F2]/40 bg-[#101a35]"
            }`}>
              <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain p-1" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[14px] font-extrabold tracking-tight">Facebook Cricket League</span>
                <span className="rounded border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1 py-0.5 text-[7px] font-black text-[#f59e0b]">FCL</span>
              </div>
              <p className={`text-[8px] font-medium ${isBanglaHome ? "text-slate-500" : "text-[#64748b]"}`}>
                {isBanglaHome ? "অফিসিয়াল ডিজিটাল প্ল্যাটফর্ম" : "Official FCL Digital Platform"}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link 
              href={isBanglaHome ? "/" : "/bn"} 
              onClick={() => setTheme(isBanglaHome ? "dark" : "light")}
              aria-label="Language Switch" 
              className={`flex h-9 items-center gap-1 rounded-full border px-2.5 text-[9px] font-bold ${
                isBanglaHome ? "border-slate-300 bg-slate-900 text-white" : "border-[#1877F2]/40 bg-[#1877F2]/15 text-[#60a5fa]"
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black ${isBanglaHome ? "bg-white text-slate-900" : "bg-[#1877F2] text-white"}`}>
                {isBanglaHome ? "EN" : "f"}
              </span>
              {isBanglaHome ? "English" : "বাংলা"}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                isBanglaHome ? "border-slate-300 bg-slate-100 text-slate-900" : "border-[#1e293b] bg-[#0b1220] text-white"
              }`}
            >
              {mobileMenuOpen ? <span className="text-base font-bold">✕</span> : <span className="text-lg">☰</span>}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className={`border-t px-4 py-3 shadow-2xl animate-in slide-in-from-top-2 duration-200 ${
            isBanglaHome ? "border-slate-200 bg-white" : "border-[#18233b] bg-[#070d1b]"
          }`}>
            <div className="grid grid-cols-2 gap-2">
              {isBanglaHome ? (
                <>
                  <Link href="/rules" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] font-semibold text-slate-700">⚖️ নিয়ম ও ফরম্যাট</Link>
                  <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] font-semibold text-slate-700">🏆 হল অব ফেম</Link>
                  <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] font-semibold text-slate-700">👥 খেলোয়াড়বৃন্দ</Link>
                  <Link href="/memories" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] font-semibold text-pink-600">📖 স্মৃতিচারণ</Link>
                </>
              ) : (
                <>
                  <Link href="/rules" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3 py-2.5 text-[11px] font-semibold text-[#38bdf8]">⚖️ Rules & Formats</Link>
                  <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3 py-2.5 text-[11px] font-semibold text-[#fbbf24]">🏆 Hall of Fame</Link>
                  <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3.5 py-2.5 text-[11px] font-semibold text-[#60a5fa]">👥 Players</Link>
                  <Link href="/memories" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-3.5 py-2.5 text-[11px] font-semibold text-[#f472b6]">📖 Memories</Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}