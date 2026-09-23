"use client";

import { useState } from "react";
import Link from "next/link";

export default function RulesPage() {
  const [rulesLang, setRulesLang] = useState<"en" | "bn">("bn");
  const [openRule, setOpenRule] = useState<string | null>("team");

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-[#1877F2]/30 selection:text-white">
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
                  RULES
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#94a3b8]">Official Rules & Format Center</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-[#1e293b] bg-[#0b1220] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#60a5fa] transition hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[#172033] bg-[#02050b] py-16 sm:py-20">
        <div className="absolute left-[10%] top-10 h-[300px] w-[300px] rounded-full bg-[#1877F2]/10 blur-[130px]" />
        <div className="absolute right-[5%] bottom-10 h-[350px] w-[350px] rounded-full bg-[#7c3aed]/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#60a5fa]">
                FCL Rules Center
              </span>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
                Learn the{" "}
                <span className="bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">
                  Game System.
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#94a3b8]">
                Everything you need to understand the basic rules, ball comparison, official tournament formats and special tactical rules of FCL.
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
        </div>
      </section>

      {/* How to Play 5 Steps */}
      <section className="relative overflow-hidden border-b border-[#172033] bg-[#030712] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1877F2]">Step by Step</p>
            <h3 className="mt-2 text-3xl font-black text-white">How FCL Virtual Match Works</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#1877F2]/50">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#1877F2]/20">01</span>
                <span className="text-xl">🪙</span>
              </div>
              <h4 className="mt-5 font-bold text-white">Toss</h4>
              <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                {rulesLang === "en"
                  ? "Umpire asks a cricket trivia question. Correct answer wins the toss and chooses Bat or Ball."
                  : "আম্পায়ার একটি ক্রিকেট প্রশ্ন জিজ্ঞাসা করেন। সঠিক উত্তরদাতা টস জিতে Bat বা Ball বেছে নেন।"}
              </p>
            </div>

            <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#8b5cf6]/50">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#8b5cf6]/20">02</span>
                <span className="text-xl">🔢</span>
              </div>
              <h4 className="mt-5 font-bold text-white">Choose Numbers</h4>
              <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                {rulesLang === "en"
                  ? "Players secretly send 6 numbers from 1, 2, 3, 4, and 6. Number 5 is strictly prohibited."
                  : "খেলোয়াড়রা ১, ২, ৩, ৪, ৬ থেকে ৬টি সংখ্যা পাঠান। ৫ নম্বর ব্যবহার সম্পূর্ণ নিষিদ্ধ।"}
              </p>
            </div>

            <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#06b6d4]/50">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#06b6d4]/20">03</span>
                <span className="text-xl">⚔️</span>
              </div>
              <h4 className="mt-5 font-bold text-white">Compare</h4>
              <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                {rulesLang === "en"
                  ? "The umpire reveals and compares the batting number against the bowling number ball-by-ball."
                  : "আম্পায়ার প্রতি বলের জন্য ব্যাটিং সংখ্যা এবং বোলিং সংখ্যার তুলনা করে ফলাফল দেন।"}
              </p>
            </div>

            <div className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f59e0b]/50">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#f59e0b]/20">04</span>
                <span className="text-xl">🏏</span>
              </div>
              <h4 className="mt-5 font-bold text-white">Runs or OUT</h4>
              <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                {rulesLang === "en"
                  ? "If numbers match = OUT. If numbers differ = Batting number counts as runs scored."
                  : "সংখ্যা মিলে গেলে = OUT। ভিন্ন সংখ্যা হলে = ব্যাটারের সংখ্যা রান হিসেবে জমা হয়।"}
              </p>
            </div>

            <div className="group rounded-2xl border border-[#1e293b] bg-[#020617] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#22c55e]/50">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-[#22c55e]/20">05</span>
                <span className="text-xl">🏆</span>
              </div>
              <h4 className="mt-5 font-bold text-white">Official Result</h4>
              <p className="mt-2 text-xs leading-5 text-[#94a3b8]">
                {rulesLang === "en"
                  ? "Umpire calculates the innings total and declares the official match winner."
                  : "আম্পায়ার সম্পূর্ণ ইনিংস গণনা করে আনুষ্ঠানিকভাবে বিজয়ী ঘোষণা করেন।"}
              </p>
            </div>
          </div>

          {/* Example Box */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-[#1e293b] bg-[#080e1a]">
            <div className="grid lg:grid-cols-[1fr_auto_1fr]">
              <div className="p-7 sm:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1877F2]">Real Match Example</p>
                <h4 className="mt-2 text-2xl font-black text-white">One Ball. One Decision.</h4>
                <div className="mt-6 space-y-3 font-mono text-sm">
                  <div className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-3">
                    <span className="mr-4 text-[#1877F2]">BAT</span>
                    <span className="text-white font-bold">6  4  3  2  1  6</span>
                  </div>
                  <div className="rounded-xl border border-[#1e293b] bg-[#0b1220] px-4 py-3">
                    <span className="mr-4 text-[#8b5cf6]">BALL</span>
                    <span className="text-white font-bold">6  2  4  2  3  4</span>
                  </div>
                </div>
              </div>

              <div className="hidden w-px bg-[#1e293b] lg:block" />

              <div className="flex flex-col justify-center border-t border-[#1e293b] p-7 sm:p-9 lg:border-t-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">Ball-by-Ball Breakdown</p>
                <div className="mt-5 flex flex-wrap gap-2 font-mono text-sm">
                  <span className="rounded-lg bg-red-500/15 px-3 py-2 font-bold text-red-400">OUT</span>
                  <span className="rounded-lg bg-[#1877F2]/15 px-3 py-2 font-bold text-[#60a5fa]">+4</span>
                  <span className="rounded-lg bg-[#1877F2]/15 px-3 py-2 font-bold text-[#60a5fa]">+3</span>
                  <span className="rounded-lg bg-red-500/15 px-3 py-2 font-bold text-red-400">OUT</span>
                  <span className="rounded-lg bg-[#1877F2]/15 px-3 py-2 font-bold text-[#60a5fa]">+1</span>
                  <span className="rounded-lg bg-[#1877F2]/15 px-3 py-2 font-bold text-[#60a5fa]">+6</span>
                </div>
                <div className="mt-6 flex items-end gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#64748b]">Total Score</p>
                    <p className="mt-1 text-3xl font-black text-white">14 / 2</p>
                  </div>
                  <div className="pb-1 text-xs font-semibold text-[#94a3b8]">1.0 Over completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official & Unofficial Match Formats */}
      <section className="border-b border-[#172033] bg-[#02050b] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f59e0b]">Match Formats</span>
            <h3 className="mt-2 text-3xl font-black text-white">Official Tournament Formats</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { name: "T20", overs: "4", wickets: "6", badge: "01" },
              { name: "T20+", overs: "5", wickets: "7", badge: "02" },
              { name: "ODI", overs: "6", wickets: "8", badge: "03" },
              { name: "ODI+", overs: "8", wickets: "10", badge: "04" },
              { name: "ODI Dhamaka", overs: "10", wickets: "11", badge: "05" },
            ].map((format, idx) => (
              <div
                key={format.name}
                className={`group rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${
                  idx === 4 ? "border-[#f59e0b]/40 bg-[#f59e0b]/5" : "border-[#1e293b] bg-[#0b1220]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#64748b]">{format.badge}</span>
                  <span className="text-base">🏆</span>
                </div>
                <h4 className="mt-4 text-lg font-black text-white">{format.name}</h4>
                <div className="mt-5 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-[#020617] p-2.5">
                    <p className="text-[9px] uppercase text-[#64748b]">Overs</p>
                    <p className="text-lg font-black text-[#60a5fa] mt-0.5">{format.overs}</p>
                  </div>
                  <div className="rounded-xl bg-[#020617] p-2.5">
                    <p className="text-[9px] uppercase text-[#64748b]">Wickets</p>
                    <p className="text-lg font-black text-[#f59e0b] mt-0.5">{format.wickets}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Unofficial / Practice Formats */}
          <div className="mt-14">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#64748b] mb-4">Practice & Unofficial Formats</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#1e293b] bg-[#080e1a] p-5">
                <h5 className="font-bold text-white">Single Match</h5>
                <p className="mt-2 text-xs text-[#64748b]">2 Overs · 3 Wickets</p>
              </div>
              <div className="rounded-2xl border border-[#1e293b] bg-[#080e1a] p-5">
                <h5 className="font-bold text-white">Team Match</h5>
                <p className="mt-2 text-xs text-[#64748b]">3 Overs · 5 Wickets</p>
              </div>
              <div className="rounded-2xl border border-[#1e293b] bg-[#080e1a] p-5">
                <h5 className="font-bold text-white">Single Test</h5>
                <p className="mt-2 text-xs text-[#64748b]">8 Overs · 3 Wickets / Innings</p>
              </div>
              <div className="rounded-2xl border border-[#1e293b] bg-[#080e1a] p-5">
                <h5 className="font-bold text-white">Team Test</h5>
                <p className="mt-2 text-xs text-[#64748b]">12 Overs · 4 Wickets / Innings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Rules Accordion (Power Play, Test, Team) */}
      <section className="border-b border-[#172033] bg-[#030712] py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-4">
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#60a5fa]">Special Tactics</span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-black text-white">Tactical Regulations</h3>
          </div>

          {/* Team Match */}
          <div className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0b1220] transition-all hover:border-[#1877F2]/40">
            <button
              onClick={() => setOpenRule(openRule === "team" ? null : "team")}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1877F2]/10 text-lg">👥</div>
                <div>
                  <h4 className="font-bold text-white">{rulesLang === "en" ? "Team Match Regulations" : "টিম ম্যাচ ও অধিনায়ক নিয়ম"}</h4>
                  <p className="text-xs text-[#64748b] mt-0.5">Lineups, batting orders and bowling quota</p>
                </div>
              </div>
              <span className={`text-lg text-[#94a3b8] transition-transform ${openRule === "team" ? "rotate-180" : ""}`}>↓</span>
            </button>
            {openRule === "team" && (
              <div className="border-t border-[#1e293b] p-5 text-xs text-[#94a3b8] leading-6 space-y-2">
                <p>• প্রতিটি দলের একজন নির্ধারিত অধিনায়ক থাকবেন যিনি টস সম্পন্ন করবেন।</p>
                <p>• ম্যাচ শুরুর পূর্বে অধিনায়ককে পূর্ণ ব্যাটিং এবং বোলিং লাইনআপ আম্পায়ারের নিকট সাবমিট করতে হবে।</p>
                <p>• নির্ধারিত ওভারের মধ্যে কোনো বোলার তার কোটার অতিরিক্ত ওভার করতে পারবেন না।</p>
              </div>
            )}
          </div>

          {/* Power Play */}
          <div className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0b1220] transition-all hover:border-[#8b5cf6]/40">
            <button
              onClick={() => setOpenRule(openRule === "power" ? null : "power")}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6]/10 text-lg">⚡</div>
                <div>
                  <h4 className="font-bold text-white">{rulesLang === "en" ? "Power Play (NPP & SPP)" : "পাওয়ার প্লে নিয়মাবলী"}</h4>
                  <p className="text-xs text-[#64748b] mt-0.5">Normal vs Super Power Play mechanics</p>
                </div>
              </div>
              <span className={`text-lg text-[#94a3b8] transition-transform ${openRule === "power" ? "rotate-180" : ""}`}>↓</span>
            </button>
            {openRule === "power" && (
              <div className="border-t border-[#1e293b] p-5 text-xs text-[#94a3b8] leading-6 space-y-2">
                <p>• <strong className="text-white">Normal Power Play (NPP):</strong> ব্যাটিং PP-তে ব্যাটার ইচ্ছামতো ৪ বা ৬ মারতে পারেন, বোলার সর্বোচ্চ ৩ বার ৪ বা ৬ দিতে পারেন। বোলিং PP-তে বিপরীত নিয়ম প্রযোজ্য।</p>
                <p>• <strong className="text-white">Super Power Play (SPP):</strong> ব্যাটিং SPP-তে সব রান দ্বিগুণ (+৮ বা +১২) হবে। আর বোলিং SPP-তে রান অর্ধেক গণ্য হবে।</p>
              </div>
            )}
          </div>

          {/* Test Rules */}
          <div className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0b1220] transition-all hover:border-[#f59e0b]/40">
            <button
              onClick={() => setOpenRule(openRule === "test" ? null : "test")}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-lg">🏏</div>
                <div>
                  <h4 className="font-bold text-white">{rulesLang === "en" ? "Test Match Special Rules" : "টেস্ট ম্যাচের বিশেষ নিয়ম"}</h4>
                  <p className="text-xs text-[#64748b] mt-0.5">Follow-on, declaration, zero rule & draw</p>
                </div>
              </div>
              <span className={`text-lg text-[#94a3b8] transition-transform ${openRule === "test" ? "rotate-180" : ""}`}>↓</span>
            </button>
            {openRule === "test" && (
              <div className="border-t border-[#1e293b] p-5 text-xs text-[#94a3b8] leading-6 space-y-2">
                <p>• <strong className="text-white">Follow-On:</strong> ১ম ইনিংসে ৩০ বা তদূর্ধ্ব রানের লিড থাকলে ফলো-অন করানো যায়।</p>
                <p>• <strong className="text-white">Declaration:</strong> সুবিধাজনক অবস্থানে ইনিংস ডিক্লেয়ার করার সুযোগ থাকে।</p>
                <p>• <strong className="text-white">0 Rule:</strong> টেস্টের ক্ষেত্রে বিশেষ জিরো নম্বরের হিসেব কার্যকর হয়।</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="font-bold">Facebook Cricket League (FCL)</p>
            <p className="mt-1 text-xs text-[#64748b]">Official Rulebook & System Guidelines</p>
          </div>
          <p className="text-xs text-[#64748b]">© 2026 FCL Official Platform</p>
        </div>
      </footer>
    </div>
  );
}