"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [playersData, setPlayersData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlayersData(data);
        } else if (data.players && Array.isArray(data.players)) {
          setPlayersData(data.players);
        }
      })
      .catch((err) => console.error("Error fetching live Excel data:", err));
  }, []);

  // সরাসরি এক্সেল থেকে স্বয়ংক্রিয়ভাবে রেকর্ড বের করা
  const topRunScorer = [...playersData].sort((a, b) => b.runs - a.runs)[0];
  const topWicketTaker = [...playersData].sort((a, b) => b.wickets - a.wickets)[0];
  const mostChampionshipPlayer = [...playersData].sort((a, b) => (b.champion || 0) - (a.champion || 0))[0];
  const mostMatchesPlayer = [...playersData].sort((a, b) => b.matches - a.matches)[0];
  const mostSixesPlayer = [...playersData].sort((a, b) => (b.sixes || 0) - (a.sixes || 0))[0];
  
  // 🔥 এক্সেল থেকে আসল সর্বোচ্চ হ্যাটট্রিক শিকারী (Zaheed Hasan)
  const topHatTrickPlayer = [...playersData].sort((a, b) => (b.hatTricks || 0) - (a.hatTricks || 0))[0];

  const totalCommunityRuns = playersData.reduce((acc, curr) => acc + (curr.runs || 0), 0);
  const totalCommunityWickets = playersData.reduce((acc, curr) => acc + (curr.wickets || 0), 0);

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-[#1877F2]/30 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border border-[#1877F2]/40 bg-[#111936] shadow-lg shadow-[#1877F2]/10">
              <img
                src="/fcl-logo.png"
                alt="FCL Logo"
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-xl">🏏</span>';
                }}
              />
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
            <Link href="/" className="text-sm font-semibold text-white transition hover:text-[#1877F2]">
              Home
            </Link>
            <Link href="#about" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">
              About FCL
            </Link>
            <Link href="/rules" className="text-sm font-medium text-[#38bdf8] transition hover:text-white">
              Rules & Formats
            </Link>
            <Link href="/players" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">
              Players
            </Link>
            <Link href="#matches" className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]">
              Matches
            </Link>
            <Link href="/records" className="text-sm font-medium text-[#fbbf24] transition hover:text-white">
              Records
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-3 py-1.5 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#1877F2] shadow-lg shadow-[#1877F2]" />
              <span className="text-xs font-semibold text-[#1877F2]">Live</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e293b] bg-[#0b1220] text-white transition hover:border-[#1877F2]/50 lg:hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <span className="text-xl font-bold">✕</span> : <span className="text-xl">☰</span>}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#1e293b] bg-[#030712] px-6 py-5 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1877F2]/10">
                🏠 Home
              </Link>
              <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#94a3b8] transition hover:bg-[#1877F2]/10">
                ℹ️ About FCL
              </Link>
              <Link href="/rules" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#38bdf8] transition hover:bg-[#1877F2]/10">
                📜 Rules & Match Formats
              </Link>
              <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#60a5fa] transition hover:bg-[#1877F2]/10">
                👥 Players Directory
              </Link>
              <Link href="#matches" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#94a3b8] transition hover:bg-[#1877F2]/10">
                ⚔️ Matches
              </Link>
              <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-[#fbbf24] transition hover:bg-[#f59e0b]/10">
                🏆 Records & Leaderboard
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[calc(100vh-76px)] overflow-hidden border-b border-[#172033] bg-[#02050b]">
        <div className="absolute inset-0 bg-[#02050b]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(37,99,235,0.16),transparent_34%)]" />
        <div className="absolute right-[-15%] top-[-20%] h-[650px] w-[650px] rounded-full bg-[#7c3aed]/10 blur-[130px]" />
        <div className="absolute left-[-20%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-[#1877F2]/10 blur-[130px]" />

        <div className="relative mx-auto min-h-[calc(100vh-76px)] max-w-[1500px] px-6">
          <div className="grid min-h-[calc(100vh-76px)] items-center lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative z-30 py-20 text-center lg:text-left">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_14px_rgba(34,197,94,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#93c5fd]">
                  FCL • VIRTUAL CRICKET
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.38em] text-[#64748b]">Facebook Cricket League</p>

              <h2 className="mt-5 text-5xl font-black leading-[0.91] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl lg:text-[78px]">
                <span className="block">THE GAME LIVES</span>
                <span className="block bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">
                  BEYOND THE FIELD.
                </span>
                <span className="mt-4 block text-[0.42em] font-bold leading-tight tracking-[-0.02em] text-[#f59e0b]">
                  One Game. One Community.{" "}
                  <span className="inline-block text-[1.45em] font-black tracking-[-0.04em] text-transparent bg-gradient-to-r from-[#60a5fa] via-[#22d3ee] to-[#8b5cf6] bg-clip-text drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] animate-[fclPulse_2.2s_ease-in-out_infinite]">
                    FCL.
                  </span>
                </span>
              </h2>

              <p className="mx-auto mt-7 max-w-[540px] text-sm leading-7 text-[#94a3b8] md:text-base lg:mx-0">
                From different districts of Bangladesh to different corners of the world, we play, compete and connect
                through FCL. Distance may separate us, but the game brings us together.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/players"
                  className="group relative overflow-hidden rounded-xl bg-[#1877F2] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_rgba(24,119,242,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#0d6fe8]"
                >
                  <span className="relative z-10">Explore Players & Cards →</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full" />
                </Link>

                <Link
                  href="/rules"
                  className="rounded-xl border border-[#334155] bg-white/[0.03] px-7 py-3.5 text-sm font-bold text-[#cbd5e1] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 hover:text-white"
                >
                  Rules & Match Formats
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#475569]">Connected from</span>
                <span className="rounded-full border border-[#1e293b] bg-[#0b1220]/80 px-3 py-1.5 text-[10px] text-[#cbd5e1]">
                  🇧🇩 Bangladesh
                </span>
                <span className="text-[#334155]">+</span>
                <span className="rounded-full border border-[#1e293b] bg-[#0b1220]/80 px-3 py-1.5 text-[10px] text-[#cbd5e1]">
                  🌍 Abroad
                </span>
                <span className="text-[#334155]">→</span>
                <span className="rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-3 py-1.5 text-[10px] font-bold text-[#60a5fa]">
                  ONE COMMUNITY
                </span>
              </div>

              <div className="mt-9 flex max-w-[460px] divide-x divide-[#1e293b] rounded-2xl border border-[#1e293b] bg-[#0b1220]/70 px-2 py-4 backdrop-blur-xl">
                <div className="w-1/3 px-4">
                  <p className="text-xl font-black text-white">{playersData.length || "211+"}</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#64748b]">Players</p>
                </div>
                <div className="w-1/3 px-4">
                  <p className="text-xl font-black text-[#22c55e]">24+</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#64748b]">Tournaments</p>
                </div>
                <div className="w-1/3 px-4">
                  <p className="text-xl font-black text-[#f59e0b]">2013-26</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#64748b]">Active Era</p>
                </div>
              </div>
            </div>

            <div className="relative h-[680px] w-full hidden sm:block">
              <div className="absolute inset-y-[30px] right-[-40px] w-[760px] overflow-hidden rounded-[3rem] border border-white/[0.08] bg-[#080d17] shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
                <img
                  src="/fcl-room.png"
                  alt="Young player playing FCL virtual cricket on smartphone"
                  className="h-full w-full object-contain object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#02050b] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02050b]/80 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#1877F2]/5 via-transparent to-[#7c3aed]/10" />
              </div>

              <div className="absolute left-[4%] top-[21%] z-30 animate-[fclFloat_4s_ease-in-out_infinite] rounded-2xl border border-[#22c55e]/30 bg-[#06131c]/95 px-5 py-4 shadow-[0_15px_45px_rgba(34,197,94,0.12)] backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#4ade80]">FCL LIVE</span>
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <p className="text-3xl font-black text-white">
                    14<span className="text-[#ef4444]">/2</span>
                  </p>
                  <p className="mb-1 text-[8px] font-bold text-[#64748b]">1.0 OV</p>
                </div>
                <p className="mt-1 text-[8px] text-[#64748b]">Team Phoenix</p>
              </div>

              <div className="absolute right-[1%] top-[34%] z-40 animate-[fclFloat_5s_ease-in-out_infinite_reverse] rounded-2xl border border-[#1877F2]/30 bg-[#07101f]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2]/15 text-sm font-black text-[#60a5fa]">
                    4
                  </div>
                  <div>
                    <p className="text-base font-black text-[#4ade80]">+4 RUN</p>
                    <p className="text-[7px] text-[#64748b]">Bat ≠ Ball</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[22%] left-[3%] z-40 animate-[fclFloat_5s_ease-in-out_infinite] rounded-2xl border border-[#ef4444]/30 bg-[#180910]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ef4444]/15 text-sm font-black text-[#f87171]">
                    6
                  </div>
                  <div>
                    <p className="text-base font-black text-[#f87171]">OUT</p>
                    <p className="text-[7px] text-[#64748b]">Bat = Ball</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[10%] right-[9%] z-50 w-[220px] rounded-2xl border border-[#334155] bg-[#020617]/95 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">FCL MATCH</p>
                    <p className="mt-1 text-xs font-black text-white">#104</p>
                  </div>
                  <span className="rounded-full bg-[#22c55e]/10 px-2 py-1 text-[7px] font-bold text-[#4ade80]">
                    LIVE
                  </span>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-[7px] font-bold uppercase tracking-widest text-[#64748b]">Bat Sequence</p>
                  <div className="grid grid-cols-6 gap-1">
                    {["6", "4", "3", "2", "1", "6"].map((num, index) => (
                      <div
                        key={index}
                        className="flex h-7 items-center justify-center rounded-lg border border-[#1877F2]/20 bg-[#1877F2]/10 text-[9px] font-black text-[#60a5fa]"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#1e293b] pt-3">
                  <span className="text-[8px] text-[#64748b]">CURRENT SCORE</span>
                  <span className="text-sm font-black text-white">14 / 2</span>
                </div>
              </div>

              <div className="absolute bottom-[4%] left-[12%] z-40 rounded-2xl border border-[#334155] bg-[#07101f]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <p className="text-[7px] font-bold uppercase tracking-widest text-[#64748b]">FCL COMMUNITY</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm">🇧🇩</span>
                  <span className="text-[10px] font-bold text-white">Bangladesh</span>
                  <span className="text-[#475569]">•</span>
                  <span className="text-sm">🌍</span>
                  <span className="text-[10px] font-bold text-white">Worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[#1e293b]/70 bg-[#020617]/75 backdrop-blur-xl">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-[#1e293b] md:grid-cols-4">
            <div className="px-5 py-3 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">VIRTUAL CRICKET</p>
              <p className="mt-1 text-[11px] font-semibold text-white">Play Anywhere</p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">COMMUNITY</p>
              <p className="mt-1 text-[11px] font-semibold text-white">Connected Through FCL</p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">LOCATIONS</p>
              <p className="mt-1 text-[11px] font-semibold text-white">Bangladesh + Abroad</p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">FCL SPIRIT</p>
              <p className="mt-1 text-[11px] font-semibold text-[#f59e0b]">Unity Through FCL</p>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fclFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          @keyframes fclPulse {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.12); filter: brightness(1.35); }
          }
        `}</style>
      </section>

      {/* ABOUT FCL */}
      <section id="about" className="relative overflow-hidden border-b border-[#172033] bg-[#030712] py-24">
        <div className="absolute left-[-180px] top-20 h-[400px] w-[400px] rounded-full bg-[#1877F2]/10 blur-[120px]" />
        <div className="absolute right-[-180px] bottom-10 h-[400px] w-[400px] rounded-full bg-[#7c3aed]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-[1200px] px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#60a5fa]">About FCL</span>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
              Cricket Beyond{" "}
              <span className="bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">
                The Field.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#94a3b8] md:text-base">
              Facebook Cricket League is a virtual cricket community where players compete through numbers, strategy
              and teamwork.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#1877F2]/40 hover:bg-[#0d1627]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1877F2]/20 bg-[#1877F2]/10 text-2xl">
                🏏
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Virtual Cricket</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                A unique cricket format played through numbers, decisions and strategy instead of a physical field.
              </p>
            </div>

            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#22d3ee]/40 hover:bg-[#0d1627]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#22d3ee]/20 bg-[#22d3ee]/10 text-2xl">
                🌍
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">One Community</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                Players connect from different districts of Bangladesh and from different corners of the world.
              </p>
            </div>

            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/40 hover:bg-[#0d1627]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f59e0b]/20 bg-[#f59e0b]/10 text-2xl">
                🤝
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Unity Through FCL</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                Competition, friendship and fun — bringing people together through one shared game.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-[#1877F2]/30 bg-gradient-to-r from-[#0b1220] via-[#0d1830] to-[#0b1220] p-6 sm:p-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">Rulebook & Formats</span>
              <h4 className="text-xl font-bold text-white mt-1">Want to learn how to play FCL?</h4>
              <p className="text-xs text-[#94a3b8] mt-1">Check out T20, ODI, Test match systems and Power Play rules.</p>
            </div>
            <Link
              href="/rules"
              className="shrink-0 rounded-xl bg-[#1877F2] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:bg-[#0d6fe8]"
            >
              Official Rules Guide →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Players Section */}
      <section id="players" className="relative overflow-hidden border-t border-[#172033] bg-[#020617] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#1877F2]/5 blur-3xl" />

          <div className="relative mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#1877F2] shadow-lg shadow-[#1877F2]/50" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1877F2]">
                  FCL Legends & Top Performers
                </p>
              </div>
              <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Featured Players</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                Discover FCL's all-time top performers and legends dynamically loaded directly from Excel data.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2 text-xs font-semibold text-[#64748b]">
                <span>Active Database: {playersData.length || "211"} Players</span>
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" />
              </div>
              <Link
                href="/players"
                className="rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/10 px-4 py-2 text-xs font-bold text-[#60a5fa] transition hover:bg-[#1877F2] hover:text-white"
              >
                View All Players →
              </Link>
            </div>
          </div>

          <div className="relative grid gap-5 md:grid-cols-3">
            {/* 1. TOP RUN SCORER */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/50 hover:shadow-2xl hover:shadow-[#1877F2]/10">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-60" />
              <div className="flex items-center justify-between">
                <span className="rounded-lg border border-[#1877F2]/20 bg-[#1877F2]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#60a5fa]">
                  Top Run Scorer
                </span>
                <span className="text-xs font-bold text-[#475569]">#01</span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#1877F2]/30 bg-[#111936] text-3xl shadow-lg shadow-[#1877F2]/5">
                  🏏
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">{topRunScorer?.name || "Jahin Shahriar"}</h4>
                  <p className="mt-0.5 text-xs font-semibold text-[#60a5fa]">
                    Nick: {topRunScorer?.nickName || "Jahin"} · {topRunScorer?.role || "All-Rounder"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#64748b]">
                    {topRunScorer?.sixes || 142} Sixes · {topRunScorer?.fours || 200} Fours
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-white">{topRunScorer?.runs?.toLocaleString() || "3,317"}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Total Runs</p>
                </div>
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-white">{topRunScorer?.matches || 168}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Matches</p>
                </div>
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-[#60a5fa]">{topRunScorer?.runAvg || "15.22"}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Bat Avg.</p>
                </div>
              </div>
            </div>

            {/* 2. TOP WICKET TAKER */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/50 hover:shadow-2xl hover:shadow-[#f59e0b]/10">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-60" />
              <div className="flex items-center justify-between">
                <span className="rounded-lg border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#fbbf24]">
                  Top Wicket Taker
                </span>
                <span className="text-xs font-bold text-[#475569]">#02</span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#f59e0b]/30 bg-[#1b1720] text-3xl shadow-lg shadow-[#f59e0b]/5">
                  🎯
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">{topWicketTaker?.name || "Zaheed Hasan"}</h4>
                  <p className="mt-0.5 text-xs font-semibold text-[#fbbf24]">
                    Nick: {topWicketTaker?.nickName || "Zaheed"} · {topWicketTaker?.role || "Bowling All-Rounder"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#64748b]">
                    {topWicketTaker?.runs?.toLocaleString() || "2,837"} Runs · {topWicketTaker?.champion || 4}x Champion
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-white">{topWicketTaker?.wickets || 332}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Wickets</p>
                </div>
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-white">{topWicketTaker?.matches || 167}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Matches</p>
                </div>
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-[#fbbf24]">{topWicketTaker?.wkAvg || "1.99"}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Wk Avg.</p>
                </div>
              </div>
            </div>

            {/* 3. RECORD CHAMPION */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#22c55e]/30 bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#22c55e]/60 hover:shadow-2xl hover:shadow-[#22c55e]/10">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#22c55e] to-transparent opacity-60" />
              <div className="flex items-center justify-between">
                <span className="rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#4ade80]">
                  Record Champion
                </span>
                <span className="text-xs font-bold text-[#475569]">#03</span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#22c55e]/30 bg-[#102019] text-3xl shadow-lg shadow-[#22c55e]/5">
                  ⭐
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">{mostChampionshipPlayer?.name || "Arif Ziad"}</h4>
                  <p className="mt-0.5 text-xs font-semibold text-[#4ade80]">
                    Nick: {mostChampionshipPlayer?.nickName || "Arif"} · {mostChampionshipPlayer?.role || "VIP All-Rounder"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#64748b]">
                    {mostChampionshipPlayer?.champion || 6}x Champion · {mostChampionshipPlayer?.hatTricks || 5}x Hat-Trick
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-white">
                    {mostChampionshipPlayer?.runs?.toLocaleString() || "2,809"}
                  </p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Runs</p>
                </div>
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-white">{mostChampionshipPlayer?.wickets || 250}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Wickets</p>
                </div>
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-[#4ade80]">{mostChampionshipPlayer?.runAvg || "16.14"}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Bat Avg.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matches Section */}
      <section id="matches" className="relative overflow-hidden border-t border-[#172033] bg-[#030a1a] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#1877F2]/5 blur-3xl" />

          <div className="relative mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#1877F2] shadow-lg shadow-[#1877F2]/50" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1877F2]">FCL Cricket</p>
              </div>
              <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Matches & Tournaments</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                Follow FCL matches, tournaments, series and historical cricket competitions.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#1877F2]/20 bg-[#0b1220] shadow-2xl shadow-[#1877F2]/5">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-70" />

            <div className="flex flex-col gap-4 border-b border-[#172033] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-lg border border-[#1877F2]/20 bg-[#1877F2]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#60a5fa]">
                  Match Center
                </span>
                <span className="text-xs font-medium text-[#64748b]">FCL Match</span>
              </div>
              <span className="text-xs font-semibold text-[#475569]">Upcoming Season Fixtures</span>
            </div>

            <div className="grid items-center gap-8 px-6 py-10 md:grid-cols-[1fr_auto_1fr]">
              <div className="text-center md:text-right">
                <div className="flex flex-col items-center gap-4 md:flex-row md:justify-end">
                  <div>
                    <p className="text-xl font-black text-white">Team Alpha</p>
                    <p className="mt-1 text-xs text-[#64748b]">FCL Team</p>
                  </div>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#1877F2]/30 bg-[#111936] text-3xl shadow-lg shadow-[#1877F2]/5">
                    🏏
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#1e293b] bg-[#020617] shadow-inner">
                  <span className="text-sm font-black text-[#64748b]">VS</span>
                </div>
                <p className="mt-3 text-[9px] font-black uppercase tracking-[0.25em] text-[#475569]">Upcoming</p>
              </div>

              <div className="text-center md:text-left">
                <div className="flex flex-col items-center gap-4 md:flex-row">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#f59e0b]/30 bg-[#1b1720] text-3xl shadow-lg shadow-[#f59e0b]/5">
                    🏆
                  </div>
                  <div>
                    <p className="text-xl font-black text-white">Team Beta</p>
                    <p className="mt-1 text-xs text-[#64748b]">FCL Team</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#172033] bg-[#080e1a] px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              FCL Virtual Cricket • Match Fixtures Scheduled Soon
            </div>
          </div>
        </div>
      </section>

      {/* Records & Leaderboard Section */}
      <section id="records" className="relative overflow-hidden border-t border-[#172033] bg-[#020617] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[#f59e0b]/5 blur-[120px]" />

          <div className="relative mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#f59e0b] shadow-lg shadow-[#f59e0b]/50" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f59e0b]">
                  FCL Statistics & Hall of Fame
                </p>
              </div>
              <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">FCL Record Corner</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                Remarkable all-time milestones, individual achievements and tournament records dynamically synced from Excel data.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2 text-xs font-semibold text-[#64748b]">
                <span>Official Records Archive</span>
                <span className="text-[#f59e0b]">★</span>
              </div>
              <Link
                href="/records"
                className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-4 py-2 text-xs font-bold text-[#fbbf24] transition hover:bg-[#f59e0b] hover:text-black"
              >
                View Hall of Fame →
              </Link>
            </div>
          </div>

          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Most Runs */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/50 hover:shadow-2xl hover:shadow-[#1877F2]/10">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-60" />
              <div className="flex items-center justify-between">
                <span className="rounded-lg border border-[#1877F2]/20 bg-[#1877F2]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#60a5fa]">
                  Most Runs
                </span>
                <span className="text-xs font-bold text-[#475569]">#01</span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#1877F2]/30 bg-[#111936] text-2xl shadow-lg shadow-[#1877F2]/5">
                  👑
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Run King</p>
                  <h4 className="text-lg font-black text-white">{topRunScorer?.name || "Jahin Shahriar"}</h4>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-[#172033] bg-[#020617] p-4 text-center">
                <p className="text-3xl font-black text-[#60a5fa]">
                  {topRunScorer?.runs?.toLocaleString() || "3,317"}
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">
                  In {topRunScorer?.matches || 168} Matches (Avg {topRunScorer?.runAvg || "15.22"})
                </p>
              </div>
              <p className="mt-4 text-center text-xs text-[#64748b]">All-time highest career run scorer</p>
            </div>

            {/* Most Wickets */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/50 hover:shadow-2xl hover:shadow-[#f59e0b]/10">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-60" />
              <div className="flex items-center justify-between">
                <span className="rounded-lg border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#fbbf24]">
                  Most Wickets
                </span>
                <span className="text-xs font-bold text-[#475569]">#02</span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#f59e0b]/30 bg-[#1b1720] text-2xl shadow-lg shadow-[#f59e0b]/5">
                  🎯
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Wicket King</p>
                  <h4 className="text-lg font-black text-white">{topWicketTaker?.name || "Zaheed Hasan"}</h4>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-[#172033] bg-[#020617] p-4 text-center">
                <p className="text-3xl font-black text-[#fbbf24]">{topWicketTaker?.wickets || 332}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">
                  In {topWicketTaker?.matches || 167} Matches (Avg {topWicketTaker?.wkAvg || "1.99"})
                </p>
              </div>
              <p className="mt-4 text-center text-xs text-[#64748b]">All-time leading wicket taker</p>
            </div>

            {/* Most Matches */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#22c55e]/50 hover:shadow-2xl hover:shadow-[#22c55e]/10">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#22c55e] to-transparent opacity-60" />
              <div className="flex items-center justify-between">
                <span className="rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#4ade80]">
                  Most Caps
                </span>
                <span className="text-xs font-bold text-[#475569]">#03</span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#22c55e]/30 bg-[#102019] text-2xl shadow-lg shadow-[#22c55e]/5">
                  ⚡
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Iron Man</p>
                  <h4 className="text-lg font-black text-white">{mostMatchesPlayer?.name || "Sadrul Anam"}</h4>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-[#172033] bg-[#020617] p-4 text-center">
                <p className="text-3xl font-black text-[#4ade80]">{mostMatchesPlayer?.matches || 171}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">
                  Matches · {mostMatchesPlayer?.wickets || 261} Wickets
                </p>
              </div>
              <p className="mt-4 text-center text-xs text-[#64748b]">Most appearances in FCL history</p>
            </div>

            {/* Most Sixes */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#8b5cf6]/20 bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#8b5cf6]/50 hover:shadow-2xl hover:shadow-[#8b5cf6]/10">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-60" />
              <div className="flex items-center justify-between">
                <span className="rounded-lg border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#c084fc]">
                  Six Machine
                </span>
                <span className="text-xs font-bold text-[#475569]">#04</span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#8b5cf6]/30 bg-[#181326] text-2xl shadow-lg shadow-[#8b5cf6]/5">
                  💥
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Maximum Sixes</p>
                  <h4 className="text-lg font-black text-white">{mostSixesPlayer?.name || "Shahriar Khokon"}</h4>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-[#172033] bg-[#020617] p-4 text-center">
                <p className="text-3xl font-black text-[#c084fc]">{mostSixesPlayer?.sixes || 176}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">
                  Sixes · {mostSixesPlayer?.runs?.toLocaleString() || "2,745"} Runs
                </p>
              </div>
              <p className="mt-4 text-center text-xs text-[#64748b]">Record for most career sixes</p>
            </div>
          </div>

          {/* Extended History & Analytics Cards */}
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {/* Most Championships */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/50 hover:shadow-2xl hover:shadow-[#f59e0b]/5">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-60" />
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#f59e0b]/30 bg-[#1b1720] text-2xl">
                  🏆
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f59e0b]">Most Championships</p>
                  <h4 className="mt-1 text-lg font-black text-white">
                    {mostChampionshipPlayer?.name || "Arif Ziad"} ({mostChampionshipPlayer?.champion || 6} Titles)
                  </h4>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#94a3b8]">
                {mostChampionshipPlayer?.name || "Arif Ziad"} holds the all-time record with {mostChampionshipPlayer?.champion || 6} Tournament Championship titles in FCL history.
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-[#172033] pt-4">
                <span className="text-xs font-semibold text-[#64748b]">Followed by: Tanvir Shakib</span>
                <span className="rounded-full bg-[#f59e0b]/10 px-2.5 py-1 text-[10px] font-bold text-[#fbbf24]">5 Titles</span>
              </div>
            </div>

            {/* 🔥 DYNAMIC HAT-TRICK MASTER CARD (Zaheed Hasan) */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#1877F2]/30 bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/50 hover:shadow-2xl hover:shadow-[#1877F2]/5">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-60" />
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#1877F2]/30 bg-[#111936] text-2xl">
                  🔥
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#60a5fa]">Hat-Trick Master</p>
                  <h4 className="mt-1 text-lg font-black text-white">
                    {topHatTrickPlayer?.name || "Zaheed Hasan"} ({topHatTrickPlayer?.hatTricks || 7}x)
                  </h4>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#94a3b8]">
                {topHatTrickPlayer?.name || "Zaheed Hasan"} leads the league with {topHatTrickPlayer?.hatTricks || 7} career hat-tricks, setting the all-time bowling record in FCL.
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-[#172033] pt-4">
                <span className="text-xs font-semibold text-[#64748b]">Bowling Record</span>
                <span className="rounded-full bg-[#1877F2]/10 px-2.5 py-1 text-[10px] font-bold text-[#60a5fa]">
                  {topHatTrickPlayer?.hatTricks || 7} Hat-Tricks
                </span>
              </div>
            </div>

            {/* Statistics */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#22c55e]/30 bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#22c55e]/50 hover:shadow-2xl hover:shadow-[#22c55e]/5">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#22c55e] to-transparent opacity-60" />
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#22c55e]/30 bg-[#102019] text-2xl">
                  📊
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4ade80]">FCL All-Time Stats</p>
                  <h4 className="mt-1 text-lg font-black text-white">
                    {totalCommunityRuns ? `${totalCommunityRuns.toLocaleString()}+ Runs` : "1,27,387+ Runs"}
                  </h4>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#94a3b8]">
                Over {playersData.length || 211} registered players have contributed to all-time wickets and runs in FCL history.
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-[#172033] pt-4">
                <span className="text-xs font-semibold text-[#64748b]">Wickets Tallied</span>
                <span className="rounded-full bg-[#22c55e]/10 px-2.5 py-1 text-[10px] font-bold text-[#4ade80]">
                  {totalCommunityWickets ? `${totalCommunityWickets.toLocaleString()} Wkts` : "10,303 Wkts"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="font-bold text-white">Facebook Cricket League (FCL)</p>
            <p className="mt-1 text-xs text-[#64748b]">The Game Lives Beyond The Field</p>
          </div>
          <p className="text-xs text-[#94a3b8]">
            © 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}