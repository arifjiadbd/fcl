"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isBanglaHome = pathname === "/bn";

  return (
    <>
      {/* ডেস্কটপ ও সাধারণ ফুটার (বাংলা হোমে সাদা, অন্যথায় ডার্ক) */}
      <footer className={`border-t px-4 py-7 sm:px-6 sm:py-8 transition-colors duration-300 ${
        isBanglaHome 
          ? "border-slate-200 bg-white text-slate-900" 
          : "border-[#1e293b] bg-[#020617] text-white"
      }`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center md:flex-row md:text-left">
          <p className="font-bold">Facebook Cricket League (FCL)</p>
          <p className={`text-[10px] sm:text-xs ${isBanglaHome ? "text-slate-500" : "text-[#64748b]"}`}>
            © 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.
          </p>
        </div>
      </footer>

      {/* মোবাইল ফিক্সড বটম নেভবার */}
      <nav className={`fixed bottom-0 left-0 right-0 z-[60] border-t px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl sm:hidden transition-colors duration-300 ${
        isBanglaHome 
          ? "border-slate-200 bg-white/95 text-slate-900 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]" 
          : "border-[#1e293b] bg-[#050a17]/95 text-white shadow-[0_-12px_40px_rgba(0,0,0,.45)]"
      }`}>
        <div className="mx-auto grid max-w-md grid-cols-5">
          <Link href={isBanglaHome ? "/bn" : "/"} className={`flex flex-col items-center gap-1 py-1 ${isBanglaHome ? "text-blue-600" : "text-[#60a5fa]"}`}>
            <span className="flex h-7 items-center text-[20px]">⌂</span>
            <span className="text-[8px] font-bold">{isBanglaHome ? "হোম" : "Home"}</span>
          </Link>
          <Link href="/play" className={`flex flex-col items-center gap-1 py-1 ${isBanglaHome ? "text-slate-500 hover:text-blue-600" : "text-[#64748b]"}`}>
            <span className="flex h-7 items-center text-[18px]">🎮</span>
            <span className="text-[8px] font-semibold">{isBanglaHome ? "গেম" : "Play"}</span>
          </Link>
          <Link href="/players" className={`flex flex-col items-center gap-1 py-1 ${isBanglaHome ? "text-slate-500 hover:text-blue-600" : "text-[#64748b]"}`}>
            <span className="flex h-7 items-center text-[18px]">👥</span>
            <span className="text-[8px] font-semibold">{isBanglaHome ? "খেলোয়াড়" : "Players"}</span>
          </Link>
          <Link href="/rankings" className={`flex flex-col items-center gap-1 py-1 ${isBanglaHome ? "text-slate-500 hover:text-amber-600" : "text-[#64748b]"}`}>
            <span className="flex h-7 items-center text-[18px]">🏆</span>
            <span className="text-[8px] font-semibold">{isBanglaHome ? "র‍্যাঙ্কিং" : "Ranking"}</span>
          </Link>
          <Link href="/memories" className={`flex flex-col items-center gap-1 py-1 ${isBanglaHome ? "text-slate-500 hover:text-pink-600" : "text-[#64748b]"}`}>
            <span className="flex h-7 items-center text-[18px]">📖</span>
            <span className="text-[8px] font-semibold">{isBanglaHome ? "স্মৃতি" : "Memories"}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}