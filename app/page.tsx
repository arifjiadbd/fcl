"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-[#1877F2]/30 selection:text-white font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border border-[#1877F2]/40 bg-[#111936] shadow-lg shadow-[#1877F2]/10">
              <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain p-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white">
                  Facebook <span className="text-[#1877F2]">Cricket League</span>
                </h1>
                <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#f59e0b]">
                  FCL
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#94a3b8]">Official FCL Digital Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="text-sm font-semibold text-white transition hover:text-[#1877F2]">Home</Link>
            <Link href="#gateways" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">Portals</Link>
            <Link href="/rules" className="text-sm font-medium text-[#38bdf8] transition hover:text-white">Rules & Formats</Link>
            <Link href="/players" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">Players</Link>
            <Link href="/rankings" className="text-sm font-medium text-[#f59e0b] transition hover:text-white">Rankings</Link>
            <Link href="/records" className="text-sm font-medium text-[#fbbf24] transition hover:text-white">Hall of Fame</Link>
            <Link href="/memories" className="text-sm font-bold text-[#f472b6] transition hover:text-white flex items-center gap-1">Memories 📖</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/bn"
              className="flex items-center gap-1.5 rounded-full border border-[#1877F2]/40 bg-gradient-to-r from-[#1877F2] to-[#166fe5] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:brightness-110 active:scale-95"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#1877F2]">f</span>
              <span>বাংলা ভার্সন</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e293b] bg-[#0b1220] text-white lg:hidden"
            >
              {mobileMenuOpen ? <span className="text-xl font-bold">✕</span> : <span className="text-xl">☰</span>}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#1e293b] bg-[#030712] px-6 py-5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-[#1877F2]/10">🏠 Home</Link>
              <Link href="/bn" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#1877F2]/20 border border-[#1877F2]/40 px-3 py-2 text-sm font-bold text-[#60a5fa]">💙 বাংলা ভার্সন</Link>
              <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#60a5fa] hover:bg-[#1877F2]/10">👥 Players Directory</Link>
              <Link href="/rankings" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#f59e0b] hover:bg-[#f59e0b]/10">👑 Rankings & MVP</Link>
              <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#fbbf24] hover:bg-[#f59e0b]/10">🏆 Records & Hall of Fame</Link>
              <Link href="/memories" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-[#f472b6] hover:bg-[#f472b6]/10">📖 FCL Memories & Nostalgia</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-76px)] overflow-hidden border-b border-[#172033] bg-[#02050b]">
        <div className="absolute inset-0 bg-[#02050b]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(37,99,235,0.16),transparent_34%)]" />
        <div className="absolute right-[-15%] top-[-20%] h-[650px] w-[650px] rounded-full bg-[#7c3aed]/10 blur-[130px]" />
        <div className="absolute left-[-20%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-[#1877F2]/10 blur-[130px]" />

        <div className="relative mx-auto min-h-[calc(100vh-76px)] max-w-[1500px] px-6 flex items-center">
          <div className="grid w-full items-center lg:grid-cols-[0.85fr_1.15fr] gap-12 py-12">
            <div className="relative z-30 text-center lg:text-left">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_14px_rgba(34,197,94,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#93c5fd]">FCL • DIGITAL GATEWAY HUB</span>
              </div>
              <h2 className="text-5xl font-black leading-[0.93] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl lg:text-[76px]">
                <span className="block">THE GAME LIVES</span>
                <span className="block bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">BEYOND THE FIELD.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-[540px] text-sm leading-7 text-[#94a3b8] md:text-base lg:mx-0">
                Welcome to the official portal of Facebook Cricket League. Explore rankings, historical record cabinets, memories, and high-voltage match summaries through our dedicated gateways below.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <a href="#gateways" className="rounded-xl bg-[#1877F2] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_rgba(24,119,242,0.25)] hover:bg-[#0d6fe8] transition text-center">
                  Explore Portals ↓
                </a>
                <Link href="/bn" className="rounded-xl border border-[#1877F2]/40 bg-[#1877F2]/15 px-7 py-3.5 text-sm font-bold text-[#60a5fa] hover:bg-[#1877F2] hover:text-white transition text-center">
                  💙 বাংলা ভার্সন
                </Link>
              </div>
            </div>

            <div className="relative h-[550px] w-full hidden sm:block">
              <div className="absolute inset-0 overflow-hidden rounded-[3rem] border border-white/[0.08] bg-[#080d17] shadow-[0_40px_120px_rgba(0,0,0,0.7)] flex items-center justify-center p-4">
                <img src="/fcl-room.png" alt="FCL Room" className="h-full w-full object-contain object-center" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 PREMIUM PORTAL GATEWAYS (THE GATEWAY HUB) */}
      <section id="gateways" className="relative overflow-hidden bg-[#020617] px-6 py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#1877F2]/10 blur-[150px]" />

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#38bdf8]">FCL Navigation Portals</span>
            <h3 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-white">Choose Your Destination</h3>
            <p className="mt-3 text-sm sm:text-base text-[#94a3b8]">Click any gateway below to enter the dedicated section instantly.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Rankings & MVP Gateway */}
            <Link href="/rankings" className="group relative overflow-hidden rounded-[2.5rem] border-2 border-[#f59e0b]/40 bg-gradient-to-b from-[#1c1203] via-[#0d0901] to-[#040300] p-8 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-[#f59e0b] hover:shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-xl border border-[#f59e0b]/50 bg-[#f59e0b]/20 px-3.5 py-1.5 text-xs font-black uppercase text-[#fbbf24]">
                    👑 LEADERBOARD
                  </span>
                  <span className="text-2xl">⭐</span>
                </div>
                <h4 className="mt-8 text-2xl sm:text-3xl font-black text-white group-hover:text-[#fbbf24] transition">
                  Rankings & MVP
                </h4>
                <p className="mt-3 text-sm text-[#94a3b8] leading-relaxed">
                  Explore all-time player rankings, MVP pinnacle ratings, and elite championship leaderboards.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-[#f59e0b]/20 pt-4">
                <span className="text-xs font-bold text-[#fbbf24]">Enter Portal</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-2 text-[#fbbf24] font-black">→</span>
              </div>
            </Link>

            {/* 2. Records & Hall of Fame Gateway */}
            <Link href="/records" className="group relative overflow-hidden rounded-[2.5rem] border-2 border-[#1877F2]/40 bg-gradient-to-b from-[#0b1329] via-[#070e1e] to-[#040813] p-8 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-[#1877F2] hover:shadow-[0_0_40px_rgba(24,119,242,0.25)] flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#1877F2]/50 bg-[#1877F2]/20 px-3.5 py-1.5 text-xs font-black uppercase text-[#60a5fa]">
                    🏆 RECORD CABINET
                  </span>
                  <span className="text-2xl">📜</span>
                </div>
                <h4 className="mt-8 text-2xl sm:text-3xl font-black text-white group-hover:text-[#60a5fa] transition">
                  Hall of Fame & Records
                </h4>
                <p className="mt-3 text-sm text-[#94a3b8] leading-relaxed">
                  Discover historical benchmarks, most runs, highest wickets, hat-tricks, and legendary milestones.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-[#1877F2]/20 pt-4">
                <span className="text-xs font-bold text-[#60a5fa]">Enter Portal</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-2 text-[#60a5fa] font-black">→</span>
              </div>
            </Link>

            {/* 3. Memories & Nostalgia Gateway */}
            <Link href="/memories" className="group relative overflow-hidden rounded-[2.5rem] border-2 border-[#f472b6]/40 bg-gradient-to-b from-[#240a16] via-[#120309] to-[#040103] p-8 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-[#f472b6] hover:shadow-[0_0_40px_rgba(244,114,182,0.25)] flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#f472b6]/50 bg-[#f472b6]/20 px-3.5 py-1.5 text-xs font-black uppercase text-[#f472b6]">
                    📖 NOSTALGIA
                  </span>
                  <span className="text-2xl">🎞️</span>
                </div>
                <h4 className="mt-8 text-2xl sm:text-3xl font-black text-white group-hover:text-[#f472b6] transition">
                  FCL Memories & Adda
                </h4>
                <p className="mt-3 text-sm text-[#94a3b8] leading-relaxed">
                  Relive the golden days, funny moments, community stories, and nostalgic photo galleries.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-[#f472b6]/20 pt-4">
                <span className="text-xs font-bold text-[#f472b6]">Enter Portal</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-2 text-[#f472b6] font-black">→</span>
              </div>
            </Link>

            {/* 4. Players Directory Gateway */}
            <Link href="/players" className="group relative overflow-hidden rounded-[2.5rem] border-2 border-[#22c55e]/40 bg-gradient-to-b from-[#091f13] via-[#040e08] to-[#020503] p-8 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-[#22c55e] hover:shadow-[0_0_40px_rgba(34,197,94,0.25)] flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#22c55e]/50 bg-[#22c55e]/20 px-3.5 py-1.5 text-xs font-black uppercase text-[#4ade80]">
                    👥 SQUAD DIRECTORY
                  </span>
                  <span className="text-2xl">🏏</span>
                </div>
                <h4 className="mt-8 text-2xl sm:text-3xl font-black text-white group-hover:text-[#4ade80] transition">
                  Players & Stat Cards
                </h4>
                <p className="mt-3 text-sm text-[#94a3b8] leading-relaxed">
                  Browse all registered players, examine official player statistics cards, and download PNG cards.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-[#22c55e]/20 pt-4">
                <span className="text-xs font-bold text-[#4ade80]">Enter Portal</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-2 text-[#4ade80] font-black">→</span>
              </div>
            </Link>

            {/* 5. Rules & Match Formats Gateway */}
            <Link href="/rules" className="group relative overflow-hidden rounded-[2.5rem] border-2 border-[#38bdf8]/40 bg-gradient-to-b from-[#081a29] via-[#030b12] to-[#010408] p-8 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-[#38bdf8] hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#38bdf8]/50 bg-[#38bdf8]/20 px-3.5 py-1.5 text-xs font-black uppercase text-[#38bdf8]">
                    📜 RULEBOOK
                  </span>
                  <span className="text-2xl">⚖️</span>
                </div>
                <h4 className="mt-8 text-2xl sm:text-3xl font-black text-white group-hover:text-[#38bdf8] transition">
                  Rules & Match Formats
                </h4>
                <p className="mt-3 text-sm text-[#94a3b8] leading-relaxed">
                  Read official tournament guidelines, T20/ODI/Test systems, and power-play regulations.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-[#38bdf8]/20 pt-4">
                <span className="text-xs font-bold text-[#38bdf8]">Enter Portal</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-2 text-[#38bdf8] font-black">→</span>
              </div>
            </Link>
            {/* FCL ONLINE GAME */}
<Link
  href="/play"
  className="group relative min-h-[300px] overflow-hidden rounded-[2.5rem] border border-[#1877F2]/40 bg-gradient-to-br from-[#1877F2]/20 via-[#0b1225] to-[#020617] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#1877F2] hover:shadow-2xl hover:shadow-[#1877F2]/20"
>
  {/* Background Glow */}
  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#1877F2]/20 blur-3xl transition-all duration-500 group-hover:bg-[#1877F2]/35" />

  <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

  <div className="relative flex h-full flex-col justify-between">

    {/* Top */}
    <div>
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1877F2]/30 bg-[#1877F2]/10 text-3xl shadow-lg shadow-[#1877F2]/10">
        🏏
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1877F2]">
        FCL ONLINE
      </p>

      <h3 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
        Play The Game
      </h3>

      <p className="mt-4 max-w-sm text-sm leading-6 text-white/50">
        Login to FCL Online, join matches and experience the original
        Facebook Cricket League game.
      </p>
    </div>

    {/* Bottom */}
    <div className="mt-8 flex items-center justify-between">

      <span className="text-sm font-bold text-white">
        Enter FCL Online
      </span>

      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg transition-all duration-300 group-hover:translate-x-1 group-hover:border-[#1877F2]/50 group-hover:bg-[#1877F2]/20">
        →
      </span>

    </div>

  </div>
</Link>

            {/* 6. High Voltage Match Summary Gateway (Future-Ready) */}
            <div className="group relative overflow-hidden rounded-[2.5rem] border-2 border-[#a855f7]/40 bg-gradient-to-b from-[#190d26] via-[#0d0614] to-[#040207] p-8 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-[#a855f7] hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] flex flex-col justify-between min-h-[300px] cursor-pointer">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-[#a855f7]/50 bg-[#a855f7]/20 px-3.5 py-1.5 text-xs font-black uppercase text-[#c084fc]">
                    ⚡ THRILLER
                  </span>
                  <span className="text-2xl">🔥</span>
                </div>
                <h4 className="mt-8 text-2xl sm:text-3xl font-black text-white group-hover:text-[#c084fc] transition">
                  High Voltage Matches
                </h4>
                <p className="mt-3 text-sm text-[#94a3b8] leading-relaxed">
                  Relive the most intense nail-biting matches, thrilling finishes, and epic tournament battles. (Coming Soon)
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-[#a855f7]/20 pt-4">
                <span className="text-xs font-bold text-[#c084fc]">Coming Soon</span>
                <span className="text-[#c084fc] font-black">⚡</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
          <p className="text-xs text-[#94a3b8]">© 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}