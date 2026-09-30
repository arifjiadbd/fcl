"use client";

import Link from "next/link";

export default function PlayPage() {
  return (
    <main className="min-h-[80vh] bg-[#020617] text-white selection:bg-[#1877F2]/30 selection:text-white font-sans flex items-center justify-center py-12 px-4">
      
      {/* ================================================================
          GAME LAUNCH AREA
         ================================================================ */}
      <div className="mx-auto max-w-4xl w-full text-center">
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
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              পোর্টাল হাবে ফিরুন
            </Link>
          </div>

        </div>
      </div>

    </main>
  );
}