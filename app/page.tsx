"use client";

import { useState, useEffect } from "react";
import { Rock_3D } from "next/font/google";

export default function Home() {
  const [rulesLang, setRulesLang] = useState<"en" | "bn">("en");
  const [openRule, setOpenRule] = useState<string | null>(null);

  // Live Excel API State
  const [playersData, setPlayersData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlayersData(data);
        }
      })
      .catch((err) => console.error("Error fetching live Excel data:", err));
  }, []);

  // Auto Calculations directly from Excel Data
  const topRunScorer = [...playersData].sort((a, b) => b.runs - a.runs)[0];
  const topWicketTaker = [...playersData].sort((a, b) => b.wickets - a.wickets)[0];
  const mostChampionshipPlayer = [...playersData].sort((a, b) => b.champion - a.champion)[0];
  const mostMatchesPlayer = [...playersData].sort((a, b) => b.matches - a.matches)[0];
  const mostSixesPlayer = [...playersData].sort((a, b) => b.sixes - a.sixes)[0];

  const totalCommunityRuns = playersData.reduce((acc, curr) => acc + (curr.runs || 0), 0);
  const totalCommunityWickets = playersData.reduce((acc, curr) => acc + (curr.wickets || 0), 0);

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#020617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#1877F2]/50 bg-[#111936] shadow-lg shadow-[#1877F2]/10">
              <span className="text-xl">🏏</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  Facebook{" "}
                  <span className="text-[#1877F2]">
                    Cricket League
                  </span>
                </h1>

                <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2 py-1 text-[10px] font-bold text-[#f59e0b]">
                  FCL
                </span>
              </div>

              <p className="mt-0.5 text-xs text-[#94a3b8]">
                Official FCL Digital Platform
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-7 lg:flex">
            <a
              href="#home"
              className="text-sm font-semibold text-white transition hover:text-[#1877F2]"
            >
              Home
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]"
            >
              About FCL
            </a>

            <a
              href="#how-to-play"
              className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]"
            >
              How to Play
            </a>

            <a
              href="/players"
              className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]"
            >
              Players
            </a>

            <a
              href="#matches"
              className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]"
            >
              Matches
            </a>

            <a
              href="/records"
              className="text-sm font-medium text-[#94a3b8] transition hover:text-[#1877F2]"
            >
              Records
            </a>
          </nav>

          {/* FCL Status */}
          <div className="hidden items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-3 py-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#1877F2] shadow-lg shadow-[#1877F2]"></span>
            <span className="text-xs font-semibold text-[#1877F2]">
              FCL
            </span>
          </div>

        </div>
      </header>


      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-[calc(100vh-76px)] overflow-hidden border-b border-[#172033] bg-[#02050b]"
      >
        <div className="absolute inset-0 bg-[#02050b]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(37,99,235,0.16),transparent_34%)]" />
        <div className="absolute right-[-15%] top-[-20%] h-[650px] w-[650px] rounded-full bg-[#7c3aed]/10 blur-[130px]" />
        <div className="absolute left-[-20%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-[#1877F2]/10 blur-[130px]" />

        <div className="relative mx-auto min-h-[calc(100vh-76px)] max-w-[1500px] px-6">
          <div className="grid min-h-[calc(100vh-76px)] items-center lg:grid-cols-[0.82fr_1.18fr]">

            {/* Left Typography */}
            <div className="relative z-30 py-20 text-center lg:text-left">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_14px_rgba(34,197,94,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#93c5fd]">
                  FCL • VIRTUAL CRICKET
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.38em] text-[#64748b]">
                Facebook Cricket League
              </p>

              <h2 className="mt-5 text-5xl font-black leading-[0.91] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl lg:text-[78px]">
                <span className="block">
                  THE GAME LIVES
                </span>
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
                From different districts of Bangladesh to different corners of
                the world, we play, compete and connect through FCL.
                Distance may separate us, but the game brings us together.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <a
                  href="#matches"
                  className="group relative overflow-hidden rounded-xl bg-[#1877F2] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_rgba(24,119,242,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#0d6fe8]"
                >
                  <span className="relative z-10">
                    Explore FCL →
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full" />
                </a>

                <a
                  href="#about"
                  className="rounded-xl border border-[#334155] bg-white/[0.03] px-7 py-3.5 text-sm font-bold text-[#cbd5e1] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 hover:text-white"
                >
                  How FCL Works
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#475569]">
                  Connected from
                </span>
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
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#64748b]">
                    Players
                  </p>
                </div>
                <div className="w-1/3 px-4">
                  <p className="text-xl font-black text-white">—</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#64748b]">
                    Matches
                  </p>
                </div>
                <div className="w-1/3 px-4">
                  <p className="text-xl font-black text-white">—</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#64748b]">
                    Seasons
                  </p>
                </div>
              </div>
            </div>

            {/* Right Cinematic Room */}
            <div className="relative h-[680px] w-full">
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
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#4ade80]">
                    FCL LIVE
                  </span>
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <p className="text-3xl font-black text-white">
                    14<span className="text-[#ef4444]">/2</span>
                  </p>
                  <p className="mb-1 text-[8px] font-bold text-[#64748b]">
                    1.0 OV
                  </p>
                </div>
                <p className="mt-1 text-[8px] text-[#64748b]">
                  Team Phoenix
                </p>
              </div>

              <div className="absolute right-[1%] top-[34%] z-40 animate-[fclFloat_5s_ease-in-out_infinite_reverse] rounded-2xl border border-[#1877F2]/30 bg-[#07101f]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2]/15 text-sm font-black text-[#60a5fa]">
                    4
                  </div>
                  <div>
                    <p className="text-base font-black text-[#4ade80]">
                      +4 RUN
                    </p>
                    <p className="text-[7px] text-[#64748b]">
                      Bat ≠ Ball
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[22%] left-[3%] z-40 animate-[fclFloat_5s_ease-in-out_infinite] rounded-2xl border border-[#ef4444]/30 bg-[#180910]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ef4444]/15 text-sm font-black text-[#f87171]">
                    6
                  </div>
                  <div>
                    <p className="text-base font-black text-[#f87171]">
                      OUT
                    </p>
                    <p className="text-[7px] text-[#64748b]">
                      Bat = Ball
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[10%] right-[9%] z-50 w-[220px] rounded-2xl border border-[#334155] bg-[#020617]/95 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">
                      FCL MATCH
                    </p>
                    <p className="mt-1 text-xs font-black text-white">
                      #104
                    </p>
                  </div>
                  <span className="rounded-full bg-[#22c55e]/10 px-2 py-1 text-[7px] font-bold text-[#4ade80]">
                    LIVE
                  </span>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-[7px] font-bold uppercase tracking-widest text-[#64748b]">
                    Bat Sequence
                  </p>
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
                  <span className="text-[8px] text-[#64748b]">
                    CURRENT SCORE
                  </span>
                  <span className="text-sm font-black text-white">
                    14 / 2
                  </span>
                </div>
              </div>

              <div className="absolute bottom-[4%] left-[12%] z-40 rounded-2xl border border-[#334155] bg-[#07101f]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <p className="text-[7px] font-bold uppercase tracking-widest text-[#64748b]">
                  FCL COMMUNITY
                </p>
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

        {/* Bottom Strip */}
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
      <section
        id="about"
        className="relative overflow-hidden border-b border-[#172033] bg-[#030712] py-24"
      >
        <div className="absolute left-[-180px] top-20 h-[400px] w-[400px] rounded-full bg-[#1877F2]/10 blur-[120px]" />
        <div className="absolute right-[-180px] bottom-10 h-[400px] w-[400px] rounded-full bg-[#7c3aed]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-[1200px] px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#60a5fa]">
              About FCL
            </span>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
              Cricket Beyond{" "}
              <span className="bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">
                The Field.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#94a3b8] md:text-base">
              Facebook Cricket League is a virtual cricket community where
              players compete through numbers, strategy and teamwork.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#1877F2]/40 hover:bg-[#0d1627]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1877F2]/20 bg-[#1877F2]/10 text-2xl">
                🏏
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Virtual Cricket</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                A unique cricket format played through numbers, decisions
                and strategy instead of a physical field.
              </p>
            </div>

            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#22d3ee]/40 hover:bg-[#0d1627]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#22d3ee]/20 bg-[#22d3ee]/10 text-2xl">
                🌍
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">One Community</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                Players connect from different districts of Bangladesh and
                from different corners of the world.
              </p>
            </div>

            <div className="group rounded-3xl border border-[#1e293b] bg-[#0b1220]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/40 hover:bg-[#0d1627]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f59e0b]/20 bg-[#f59e0b]/10 text-2xl">
                🤝
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Unity Through FCL</h3>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                Competition, friendship and fun — bringing people together
                through one shared game.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO PLAY */}
      <section
        id="how-to-play"
        className="relative overflow-hidden border-b border-[#172033] bg-[#030712] py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1877F2]">
              Learn The Game
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              How to Play FCL
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#94a3b8] sm:text-base">
              FCL is a virtual cricket game played through Facebook Messenger,
              comments or group posts. Two players compete with an umpire
              managing the match.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/50">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#1877F2]/20">01</span>
                <span className="text-xl">🪙</span>
              </div>
              <h3 className="mt-5 font-bold text-white">Toss</h3>
              <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                The umpire asks a cricket-related question. The player who
                answers correctly wins the toss.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#8b5cf6]/50">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#8b5cf6]/20">02</span>
                <span className="text-xl">🔢</span>
              </div>
              <h3 className="mt-5 font-bold text-white">Choose Numbers</h3>
              <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                Players choose six batting or bowling numbers from 1, 2, 3,
                4 and 6. Number 5 is not allowed.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#06b6d4]/50">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#06b6d4]/20">03</span>
                <span className="text-xl">⚔️</span>
              </div>
              <h3 className="mt-5 font-bold text-white">Compare</h3>
              <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                The umpire compares the batting number with the bowling
                number for every ball.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/50">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#f59e0b]/20">04</span>
                <span className="text-xl">🏏</span>
              </div>
              <h3 className="mt-5 font-bold text-white">Runs or OUT</h3>
              <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                If the numbers match, the batter is OUT. If they differ,
                the batting number becomes the runs.
              </p>
            </div>

            <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#22c55e]/50">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#22c55e]/20">05</span>
                <span className="text-xl">🏆</span>
              </div>
              <h3 className="mt-5 font-bold text-white">Official Result</h3>
              <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                The umpire calculates the innings and announces the official
                match result.
              </p>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-[#1e293b] bg-[#080e1a]">
            <div className="grid lg:grid-cols-[1fr_auto_1fr]">
              <div className="p-7 sm:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1877F2]">Example</p>
                <h3 className="mt-2 text-2xl font-black text-white">One Ball. One Decision.</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#94a3b8]">
                  Every delivery is decided by comparing the batting and bowling numbers.
                </p>
                <div className="mt-7 space-y-3 font-mono text-sm">
                  <div className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-3">
                    <span className="mr-4 text-[#1877F2]">BAT</span>
                    <span className="text-white">6&nbsp;&nbsp;4&nbsp;&nbsp;3&nbsp;&nbsp;2&nbsp;&nbsp;1&nbsp;&nbsp;6</span>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-3">
                    <span className="mr-4 text-[#8b5cf6]">BALL</span>
                    <span className="text-white">6&nbsp;&nbsp;2&nbsp;&nbsp;4&nbsp;&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;4</span>
                  </div>
                </div>
              </div>

              <div className="hidden w-px bg-[#1e293b] lg:block" />

              <div className="flex flex-col justify-center border-t border-[#1e293b] p-7 sm:p-9 lg:border-t-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Ball-by-Ball Result</p>
                <div className="mt-5 flex flex-wrap gap-2 font-mono text-sm">
                  <span className="rounded-lg bg-red-500/10 px-3 py-2 font-bold text-red-400">OUT</span>
                  <span className="rounded-lg bg-[#1877F2]/10 px-3 py-2 font-bold text-[#1877F2]">+4</span>
                  <span className="rounded-lg bg-[#1877F2]/10 px-3 py-2 font-bold text-[#1877F2]">+3</span>
                  <span className="rounded-lg bg-red-500/10 px-3 py-2 font-bold text-red-400">OUT</span>
                  <span className="rounded-lg bg-[#1877F2]/10 px-3 py-2 font-bold text-[#1877F2]">+1</span>
                  <span className="rounded-lg bg-[#1877F2]/10 px-3 py-2 font-bold text-[#1877F2]">+6</span>
                </div>
                <div className="mt-7 flex items-end gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#64748b]">Final Score</p>
                    <p className="mt-1 text-4xl font-black text-white">14/2</p>
                  </div>
                  <div className="pb-1 text-sm font-semibold text-[#94a3b8]">1.0 OV</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#1877F2]/20 bg-[#1877F2]/5 px-5 py-4">
            <p className="text-xs leading-5 text-[#94a3b8]">
              <span className="font-bold text-white">Remember:</span>{" "}
              FCL is a virtual cricket system played through Facebook
              Messenger, comments and group posts — it is not field cricket
              and not a mobile video game.
            </p>
          </div>
        </div>
      </section>

      {/* RULES CENTER */}
      <section
        id="rules"
        className="relative overflow-hidden border-b border-[#172033] bg-[#02050b] py-24"
      >
        <div className="absolute left-[10%] top-20 h-[350px] w-[350px] rounded-full bg-[#1877F2]/10 blur-[130px]" />
        <div className="absolute right-[5%] bottom-10 h-[400px] w-[400px] rounded-full bg-[#7c3aed]/10 blur-[140px]" />

        <div className="relative mx-auto max-w-[1200px] px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#60a5fa]">
                FCL Rules Center
              </span>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
                Learn the{" "}
                <span className="bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">
                  Game.
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#94a3b8]">
                Everything you need to understand the basic rules, official
                formats and special systems of FCL.
              </p>
            </div>

            <div className="inline-flex w-fit rounded-full border border-[#1e293b] bg-[#0b1220] p-1">
              <button
                onClick={() => setRulesLang("en")}
                className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                  rulesLang === "en"
                    ? "bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/20"
                    : "text-[#64748b] hover:text-white"
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setRulesLang("bn")}
                className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                  rulesLang === "bn"
                    ? "bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/20"
                    : "text-[#64748b] hover:text-white"
                }`}
              >
                🇧🇩 বাংলা
              </button>
            </div>
          </div>

          {/* BASIC RULES */}
          <div className="mt-14 rounded-[2rem] border border-[#1e293b] bg-[#080f1c]/90 p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏏</span>
                  <h3 className="text-2xl font-black text-white">
                    {rulesLang === "en" ? "Basic Rules" : "মৌলিক নিয়ম"}
                  </h3>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                  {rulesLang === "en"
                    ? "The foundation of FCL. Learn how Bat and Ball numbers create runs and wickets."
                    : "FCL খেলার মূল ভিত্তি। Bat ও Ball-এর সংখ্যার মাধ্যমে কীভাবে Run ও Wicket হয় তা জানুন।"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#1e293b] bg-[#020617] px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#64748b]">
                  {rulesLang === "en" ? "Allowed Numbers" : "ব্যবহারযোগ্য সংখ্যা"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {[1, 2, 3, 4, 6].map((number) => (
                    <span
                      key={number}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/10 text-sm font-black text-[#60a5fa]"
                    >
                      {number}
                    </span>
                  ))}
                  <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-black text-red-400 line-through">
                    5
                  </span>
                </div>
                <p className="mt-2 text-[10px] font-semibold text-red-400">
                  {rulesLang === "en" ? "5 is NOT allowed" : "৫ ব্যবহার করা যাবে না"}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  no: "01",
                  title: rulesLang === "en" ? "Players" : "খেলোয়াড়",
                  text: rulesLang === "en" ? "2 players + 1 umpire" : "২ জন খেলোয়াড় + ১ জন আম্পায়ার",
                },
                {
                  no: "02",
                  title: rulesLang === "en" ? "Toss" : "টস",
                  text: rulesLang === "en" ? "Winner chooses Bat or Ball" : "বিজয়ী Bat বা Ball নির্বাচন করে",
                },
                {
                  no: "03",
                  title: rulesLang === "en" ? "Numbers" : "নম্বর",
                  text: rulesLang === "en" ? "Choose numbers from 1,2,3,4,6" : "১,২,৩,৪,৬ থেকে নম্বর নির্বাচন",
                },
                {
                  no: "04",
                  title: rulesLang === "en" ? "Match" : "মিল",
                  text: rulesLang === "en" ? "Same number = OUT" : "একই নম্বর = OUT",
                },
                {
                  no: "05",
                  title: rulesLang === "en" ? "Run" : "রান",
                  text: rulesLang === "en" ? "Different number = Bat number becomes Runs" : "ভিন্ন নম্বর = Bat-এর নম্বর Run",
                },
              ].map((item) => (
                <div
                  key={item.no}
                  className="rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5"
                >
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#1877F2]">
                    {item.no}
                  </span>
                  <h4 className="mt-3 text-sm font-bold text-white">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-xs leading-5 text-[#64748b]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[#1877F2]/20 bg-[#1877F2]/5 p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#60a5fa]">
                    {rulesLang === "en" ? "Example" : "উদাহরণ"}
                  </p>
                  <div className="mt-3 space-y-2 font-mono text-sm">
                    <p className="text-white">
                      <span className="mr-3 text-[#64748b]">BAT</span>
                      6 4 3 2 1 6
                    </p>
                    <p className="text-white">
                      <span className="mr-3 text-[#64748b]">BALL</span>
                      6 2 4 2 3 4
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#1e293b] bg-[#020617] px-5 py-4 text-center">
                  <p className="text-xs font-bold text-red-400">
                    OUT • +4 • +3 • OUT • +1 • +6
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">
                    14<span className="text-[#64748b]">/</span>2
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
                    1.0 OV
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* OFFICIAL FORMATS */}
          <div className="mt-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f59e0b]">
                  Official
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {rulesLang === "en" ? "Official Match Formats" : "অফিসিয়াল ম্যাচ ফরম্যাট"}
                </h3>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { name: "T20", overs: "4", wickets: "6" },
                { name: "T20+", overs: "5", wickets: "7" },
                { name: "ODI", overs: "6", wickets: "8" },
                { name: "ODI+", overs: "8", wickets: "10" },
                { name: "ODI Dhamaka", overs: "10", wickets: "11" },
              ].map((format, index) => (
                <div
                  key={format.name}
                  className={`group rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${
                    index === 4
                      ? "border-[#f59e0b]/30 bg-[#f59e0b]/5"
                      : "border-[#1e293b] bg-[#0b1220]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-[#64748b]">
                      0{index + 1}
                    </span>
                    <span className="text-lg">🏆</span>
                  </div>

                  <h4 className="mt-5 text-lg font-black text-white">
                    {format.name}
                  </h4>

                  <div className="mt-5 flex gap-2">
                    <div className="flex-1 rounded-xl border border-[#1e293b] bg-[#020617] p-3">
                      <p className="text-[9px] uppercase tracking-widest text-[#64748b]">Overs</p>
                      <p className="mt-1 text-xl font-black text-[#60a5fa]">{format.overs}</p>
                    </div>

                    <div className="flex-1 rounded-xl border border-[#1e293b] bg-[#020617] p-3">
                      <p className="text-[9px] uppercase tracking-widest text-[#64748b]">Wkts</p>
                      <p className="mt-1 text-xl font-black text-[#f59e0b]">{format.wickets}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UNOFFICIAL FORMATS */}
          <div className="mx-auto mt-10 max-w-7xl px-6">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#64748b]">
                Learning Formats
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                {rulesLang === "en" ? "Unofficial Match Formats" : "আনঅফিসিয়াল ম্যাচ ফরম্যাট"}
              </h3>
              <p className="mt-2 max-w-2xl text-xs leading-6 text-[#64748b]">
                {rulesLang === "en"
                  ? "These formats are used to explain and understand different FCL playing systems."
                  : "FCL-এর বিভিন্ন খেলার নিয়ম বোঝানোর জন্য এই ফরম্যাটগুলো ব্যবহার করা হয়।"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Single Match", bn: "সিঙ্গেল ম্যাচ", overs: "2", wickets: "3" },
                { name: "Team Match", bn: "টিম ম্যাচ", overs: "3", wickets: "5" },
                { name: "Single Test", bn: "সিঙ্গেল টেস্ট", overs: "8", wickets: "3 / innings" },
                { name: "Team Test", bn: "টিম টেস্ট", overs: "12", wickets: "4 / innings" },
              ].map((format) => (
                <div
                  key={format.name}
                  className="rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#475569]"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#64748b]">
                    Unofficial
                  </span>
                  <h4 className="mt-4 text-lg font-black text-white">
                    {rulesLang === "en" ? format.name : format.bn}
                  </h4>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[#1e293b] bg-[#020617] p-3">
                      <p className="text-[9px] uppercase tracking-widest text-[#64748b]">Overs</p>
                      <p className="mt-1 text-xl font-black text-[#60a5fa]">{format.overs}</p>
                    </div>
                    <div className="rounded-xl border border-[#1e293b] bg-[#020617] p-3">
                      <p className="text-[9px] uppercase tracking-widest text-[#64748b]">Wkts</p>
                      <p className="mt-1 text-xl font-black text-[#f59e0b]">{format.wickets}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* FCL MATCH FORMATS */}
      <section
        id="formats"
        className="relative overflow-hidden border-b border-[#172033] bg-[#030712] py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1877F2]">Match Formats</p>
            <div className="mt-3 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  FCL Match Formats
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                  Different formats make FCL more flexible for different types of matches and tournaments.
                </p>
              </div>
              <div className="text-xs font-semibold text-[#64748b]">
                Official & Learning Formats
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Official Formats</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/50">
                <div className="flex items-start justify-between">
                  <h4 className="text-xl font-black text-white">T20</h4>
                  <span className="rounded-lg bg-[#1877F2]/10 px-2 py-1 text-[10px] font-bold text-[#1877F2]">01</span>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Overs</p>
                    <p className="mt-1 text-2xl font-black text-white">4</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Wickets</p>
                    <p className="mt-1 text-2xl font-black text-white">6</p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#8b5cf6]/50">
                <div className="flex items-start justify-between">
                  <h4 className="text-xl font-black text-white">T20+</h4>
                  <span className="rounded-lg bg-[#8b5cf6]/10 px-2 py-1 text-[10px] font-bold text-[#8b5cf6]">02</span>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Overs</p>
                    <p className="mt-1 text-2xl font-black text-white">5</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Wickets</p>
                    <p className="mt-1 text-2xl font-black text-white">7</p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#06b6d4]/50">
                <div className="flex items-start justify-between">
                  <h4 className="text-xl font-black text-white">ODI</h4>
                  <span className="rounded-lg bg-[#06b6d4]/10 px-2 py-1 text-[10px] font-bold text-[#06b6d4]">03</span>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Overs</p>
                    <p className="mt-1 text-2xl font-black text-white">6</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Wickets</p>
                    <p className="mt-1 text-2xl font-black text-white">8</p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/50">
                <div className="flex items-start justify-between">
                  <h4 className="text-xl font-black text-white">ODI+</h4>
                  <span className="rounded-lg bg-[#f59e0b]/10 px-2 py-1 text-[10px] font-bold text-[#f59e0b]">04</span>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Overs</p>
                    <p className="mt-1 text-2xl font-black text-white">8</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Wickets</p>
                    <p className="mt-1 text-2xl font-black text-white">10</p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-[#f59e0b]/30 bg-gradient-to-br from-[#0b1220] to-[#15110a] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/60">
                <div className="flex items-start justify-between">
                  <h4 className="text-xl font-black text-white">ODI Dhamaka</h4>
                  <span className="rounded-lg bg-[#f59e0b]/10 px-2 py-1 text-[10px] font-bold text-[#f59e0b]">05</span>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Overs</p>
                    <p className="mt-1 text-2xl font-black text-[#f59e0b]">10</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-[#64748b]">Wickets</p>
                    <p className="mt-1 text-2xl font-black text-white">11</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#64748b]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Learning / Unofficial Formats</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#1e293b] bg-[#080e1a] p-5">
                <h4 className="font-bold text-white">Single Match</h4>
                <p className="mt-2 text-xs text-[#64748b]">2 Overs · 3 Wickets</p>
              </div>
              <div className="rounded-2xl border border-[#1e293b] bg-[#080e1a] p-5">
                <h4 className="font-bold text-white">Team Match</h4>
                <p className="mt-2 text-xs text-[#64748b]">3 Overs · 5 Wickets</p>
              </div>
              <div className="rounded-2xl border border-[#1e293b] bg-[#080e1a] p-5">
                <h4 className="font-bold text-white">Single Test</h4>
                <p className="mt-2 text-xs text-[#64748b]">8 Overs · 3 Wickets / Innings</p>
              </div>
              <div className="rounded-2xl border border-[#1e293b] bg-[#080e1a] p-5">
                <h4 className="font-bold text-white">Team Test</h4>
                <p className="mt-2 text-xs text-[#64748b]">12 Overs · 4 Wickets / Innings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RULE DETAILS */}
      <div className="mx-auto mt-10 max-w-7xl space-y-3 px-6">
        <div className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0b1220] transition-all duration-300 hover:border-[#1877F2]/40">
          <button
            onClick={() => setOpenRule(openRule === "team" ? null : "team")}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1877F2]/10 text-lg">👥</div>
              <div>
                <h4 className="font-bold text-white">{rulesLang === "en" ? "Team Match" : "টিম ম্যাচ"}</h4>
                <p className="mt-1 text-xs text-[#64748b]">
                  {rulesLang === "en" ? "Teams, captains, batting and bowling lineups" : "দল, অধিনায়ক, ব্যাটিং ও বোলিং লাইনআপ"}
                </p>
              </div>
            </div>
            <span className={`text-lg text-[#94a3b8] transition-transform duration-300 ${openRule === "team" ? "rotate-180" : ""}`}>↓</span>
          </button>
          {openRule === "team" && (
            <div className="border-t border-[#1e293b] px-5 py-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[#1e293b] bg-[#080e1a] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#1877F2]">01</p>
                  <h5 className="mt-2 font-bold text-white">{rulesLang === "en" ? "Teams & Captain" : "দল ও অধিনায়ক"}</h5>
                  <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                    {rulesLang === "en" ? "Each team has more than one player and a captain." : "প্রতিটি দলে একাধিক খেলোয়াড় এবং একজন অধিনায়ক থাকে।"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#1e293b] bg-[#080e1a] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8b5cf6]">02</p>
                  <h5 className="mt-2 font-bold text-white">{rulesLang === "en" ? "Batting Lineup" : "ব্যাটিং লাইনআপ"}</h5>
                  <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                    {rulesLang === "en" ? "The captain provides the batting lineup before the match." : "ম্যাচের আগে অধিনায়ক ব্যাটিং লাইনআপ প্রদান করেন।"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#1e293b] bg-[#080e1a] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#06b6d4]">03</p>
                  <h5 className="mt-2 font-bold text-white">{rulesLang === "en" ? "Bowling Lineup" : "বোলিং লাইনআপ"}</h5>
                  <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                    {rulesLang === "en" ? "The captain provides the bowling lineup for the match." : "ম্যাচের জন্য অধিনায়ক বোলিং লাইনআপ প্রদান করেন।"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0b1220] transition-all duration-300 hover:border-[#8b5cf6]/40">
          <button
            onClick={() => setOpenRule(openRule === "power" ? null : "power")}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6]/10 text-lg">⚡</div>
              <div>
                <h4 className="font-bold text-white">{rulesLang === "en" ? "Power Play" : "পাওয়ার প্লে"}</h4>
                <p className="mt-1 text-xs text-[#64748b]">
                  {rulesLang === "en" ? "NPP & SPP power play rules" : "NPP ও SPP পাওয়ার প্লে নিয়ম"}
                </p>
              </div>
            </div>
            <span className={`text-lg text-[#94a3b8] transition-transform duration-300 ${openRule === "power" ? "rotate-180" : ""}`}>↓</span>
          </button>
          {openRule === "power" && (
            <div className="border-t border-[#1e293b] px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[#1e293b] bg-[#080e1a] p-5">
                  <span className="rounded-lg bg-[#1877F2]/10 px-2 py-1 text-[10px] font-bold text-[#1877F2]">NPP</span>
                  <h5 className="mt-3 font-bold text-white">{rulesLang === "en" ? "Normal Power Play" : "নরমাল পাওয়ার প্লে"}</h5>
                  <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                    {rulesLang === "en"
                      ? "Batting PP allows the batter to use 4 or 6 as desired, while the bowler can give 4 or 6 no more than 3 times. Bowling PP works in the opposite way."
                      : "ব্যাটিং PP-তে ব্যাটার ইচ্ছামতো ৪ বা ৬ ব্যবহার করতে পারে, আর বোলার সর্বোচ্চ ৩ বার ৪ বা ৬ দিতে পারে। Bowling PP-তে নিয়মটি বিপরীত।"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#1e293b] bg-[#080e1a] p-5">
                  <span className="rounded-lg bg-[#f59e0b]/10 px-2 py-1 text-[10px] font-bold text-[#f59e0b]">SPP</span>
                  <h5 className="mt-3 font-bold text-white">{rulesLang === "en" ? "Super Power Play" : "সুপার পাওয়ার প্লে"}</h5>
                  <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                    {rulesLang === "en"
                      ? "BOWL_SPP counts half runs, while BAT_SPP doubles runs. NPP restrictions do not apply."
                      : "BOWL_SPP-তে রান অর্ধেক হিসেবে গণনা হয় এবং BAT_SPP-তে রান দ্বিগুণ হয়। NPP-এর সীমাবদ্ধতা প্রযোজ্য নয়।"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0b1220] transition-all duration-300 hover:border-[#f59e0b]/40">
          <button
            onClick={() => setOpenRule(openRule === "test" ? null : "test")}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-lg">🏏</div>
              <div>
                <h4 className="font-bold text-white">{rulesLang === "en" ? "Test Rules" : "টেস্ট নিয়ম"}</h4>
                <p className="mt-1 text-xs text-[#64748b]">
                  {rulesLang === "en" ? "Follow-On, Declaration, 0 Rule & Draw" : "Follow-On, Declaration, 0 Rule ও Draw"}
                </p>
              </div>
            </div>
            <span className={`text-lg text-[#94a3b8] transition-transform duration-300 ${openRule === "test" ? "rotate-180" : ""}`}>↓</span>
          </button>
          {openRule === "test" && (
            <div className="border-t border-[#1e293b] px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#1e293b] bg-[#080e1a] p-4">
                  <h5 className="font-bold text-white">0 Rule</h5>
                  <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                    {rulesLang === "en" ? "Special rules apply to zero-number situations in Test matches." : "টেস্ট ম্যাচে zero number-এর ক্ষেত্রে বিশেষ নিয়ম প্রযোজ্য।"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#1e293b] bg-[#080e1a] p-4">
                  <h5 className="font-bold text-white">Follow-On</h5>
                  <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                    {rulesLang === "en" ? "A 30+ run lead may result in a Follow-On." : "৩০ বা তার বেশি রানের লিড হলে Follow-On হতে পারে।"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#1e293b] bg-[#080e1a] p-4">
                  <h5 className="font-bold text-white">Declaration</h5>
                  <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                    {rulesLang === "en" ? "An innings may be declared according to the applicable Test rules." : "প্রযোজ্য টেস্ট নিয়ম অনুযায়ী ইনিংস ঘোষণা করা যেতে পারে।"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#1e293b] bg-[#080e1a] p-4">
                  <h5 className="font-bold text-white">Draw</h5>
                  <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                    {rulesLang === "en" ? "If the match is not completed within the applicable time, it may be a draw." : "প্রযোজ্য সময়ের মধ্যে ম্যাচ শেষ না হলে তা Draw হতে পারে।"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Players Section (Directly from Excel) */}
      <section
        id="players"
        className="relative overflow-hidden border-t border-[#172033] bg-[#020617] px-6 py-24"
      >
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
              <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Featured Players
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                Discover FCL's all-time top performers and legends dynamically loaded directly from Excel data.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2 text-xs font-semibold text-[#64748b]">
              <span>Active Database: {playersData.length || "211"} Players</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" />
            </div>
          </div>

          <div className="relative grid gap-5 md:grid-cols-3">
            {/* PLAYER 1: TOP RUN SCORER */}
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
                  <h4 className="text-lg font-black text-white">
                    {topRunScorer?.name || "Jahin Shahriar"}
                  </h4>
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
                  <p className="text-lg font-black text-white">
                    {topRunScorer?.runs?.toLocaleString() || "3,317"}
                  </p>
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

            {/* PLAYER 2: TOP WICKET TAKER */}
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
                  <h4 className="text-lg font-black text-white">
                    {topWicketTaker?.name || "Zaheed Hasan"}
                  </h4>
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

            {/* PLAYER 3: RECORD CHAMPION */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#22c55e]/50 hover:shadow-2xl hover:shadow-[#22c55e]/10">
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
                  <h4 className="text-lg font-black text-white">
                    {mostChampionshipPlayer?.name || "Arif Ziad"}
                  </h4>
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
      <section
        id="matches"
        className="relative overflow-hidden border-t border-[#172033] bg-[#030a1a] px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#1877F2]/5 blur-3xl" />

          <div className="relative mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#1877F2] shadow-lg shadow-[#1877F2]/50" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1877F2]">FCL Cricket</p>
              </div>
              <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Matches & Tournaments
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                Follow FCL matches, tournaments, series and historical cricket competitions.
              </p>
            </div>

            <a
              href="#matches"
              className="w-fit rounded-xl border border-[#1e293b] bg-[#0b1220] px-5 py-3 text-sm font-bold text-[#cbd5e1] transition duration-300 hover:border-[#1877F2]/50 hover:bg-[#111a2d] hover:text-white"
            >
              View All Matches →
            </a>
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
              <span className="text-xs font-semibold text-[#475569]">
                Match No. — Coming Soon
              </span>
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
                <p className="mt-3 text-[9px] font-black uppercase tracking-[0.25em] text-[#475569]">
                  Upcoming
                </p>
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

            <div className="border-t border-[#172033] bg-[#080e1a] px-6 py-4">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-wider text-[#475569] sm:justify-between">
                <span>FCL Virtual Cricket</span>
                <span>Match Details Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/50 hover:shadow-2xl hover:shadow-[#f59e0b]/5">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-60" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f59e0b]/30 bg-[#1b1720] text-2xl">
                    🏆
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f59e0b]">Featured Tournament</p>
                    <h4 className="mt-2 text-xl font-black text-white">FCL Championship</h4>
                  </div>
                </div>
                <span className="rounded-lg border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-2.5 py-1 text-[9px] font-black text-[#fbbf24]">
                  2026
                </span>
              </div>

              <p className="mt-5 text-sm leading-6 text-[#94a3b8]">
                Official FCL tournament information, fixtures, results, teams and championship history.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-white">—</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Teams</p>
                </div>
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-white">—</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Matches</p>
                </div>
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-[#fbbf24]">2026</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Season</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/50 hover:shadow-2xl hover:shadow-[#1877F2]/5">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-60" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1877F2]/30 bg-[#111936] text-2xl">
                    🏏
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#60a5fa]">FCL Series</p>
                    <h4 className="mt-2 text-xl font-black text-white">Upcoming Series</h4>
                  </div>
                </div>
                <span className="rounded-lg border border-[#1e293b] bg-[#020617] px-2.5 py-1 text-[9px] font-black text-[#64748b]">
                  SOON
                </span>
              </div>

              <p className="mt-5 text-sm leading-6 text-[#94a3b8]">
                Explore upcoming FCL series, match schedules, team lineups and series results.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-white">—</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Teams</p>
                </div>
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-white">—</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Matches</p>
                </div>
                <div className="rounded-xl border border-[#172033] bg-[#020617] p-3 text-center">
                  <p className="text-lg font-black text-[#60a5fa]">Soon</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Records Section (Directly from Excel) */}
      <section
        id="records"
        className="relative overflow-hidden border-t border-[#172033] bg-[#020617] px-6 py-24"
      >
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
              <h3 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                FCL Record Corner
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                Remarkable all-time milestones, individual achievements and tournament records dynamically synced from Excel data.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-2 text-xs font-semibold text-[#64748b]">
              <span>Official Records Archive</span>
              <span className="text-[#f59e0b]">★</span>
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
                  <h4 className="text-lg font-black text-white">
                    {topRunScorer?.name || "Jahin Shahriar"}
                  </h4>
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
                  <h4 className="text-lg font-black text-white">
                    {topWicketTaker?.name || "Zaheed Hasan"}
                  </h4>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-[#172033] bg-[#020617] p-4 text-center">
                <p className="text-3xl font-black text-[#fbbf24]">
                  {topWicketTaker?.wickets || 332}
                </p>
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
                  <h4 className="text-lg font-black text-white">
                    {mostMatchesPlayer?.name || "Sadrul Anam"}
                  </h4>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-[#172033] bg-[#020617] p-4 text-center">
                <p className="text-3xl font-black text-[#4ade80]">
                  {mostMatchesPlayer?.matches || 171}
                </p>
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
                  <h4 className="text-lg font-black text-white">
                    {mostSixesPlayer?.name || "Shahriar Khokon"}
                  </h4>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-[#172033] bg-[#020617] p-4 text-center">
                <p className="text-3xl font-black text-[#c084fc]">
                  {mostSixesPlayer?.sixes || 176}
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">
                  Sixes · {mostSixesPlayer?.runs?.toLocaleString() || "2,745"} Runs
                </p>
              </div>
              <p className="mt-4 text-center text-xs text-[#64748b]">Record for most career sixes</p>
            </div>
          </div>

          {/* Extended History & Analytics Cards */}
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {/* Championship */}
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

            {/* Performance */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/50 hover:shadow-2xl hover:shadow-[#1877F2]/5">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1877F2] to-transparent opacity-60" />
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#1877F2]/30 bg-[#111936] text-2xl">
                  🔥
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#60a5fa]">Hat-Trick Master</p>
                  <h4 className="mt-1 text-lg font-black text-white">
                    Sakhawat Shanto (6x)
                  </h4>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#94a3b8]">
                Shanto leads with 6 career hat-tricks, closely followed by Arif Ziad and Tofayel Ahmed with 5 hat-tricks each.
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-[#172033] pt-4">
                <span className="text-xs font-semibold text-[#64748b]">Bowling Record</span>
                <span className="rounded-full bg-[#1877F2]/10 px-2.5 py-1 text-[10px] font-bold text-[#60a5fa]">6 Hat-Tricks</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[#0b1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#22c55e]/50 hover:shadow-2xl hover:shadow-[#22c55e]/5">
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
            <p className="font-bold">
              Facebook Cricket League
            </p>
            <p className="mt-1 text-xs text-[#64748b]">
              Official FCL Digital Platform
            </p>
          </div>
          <p className="text-xs text-[#64748b]">
            © 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.
          </p>
        </div>
      </footer>

    </main>
  );
}