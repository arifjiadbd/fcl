"use client";

import Link from "next/link";

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* TOP BAR */}
      <section className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

          {/* Back Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10"
          >
            ← Back to Home
          </Link>

          {/* Title */}
          <div className="hidden text-center sm:block">
            <div className="text-sm font-black tracking-[0.25em] text-[#1877F2]">
              FACEBOOK CRICKET LEAGUE
            </div>
            <div className="text-xs font-medium text-white/50">
              FCL ONLINE
            </div>
          </div>

          {/* Home */}
          <Link
            href="/"
            className="rounded-xl bg-[#1877F2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#166fe5]"
          >
            Home
          </Link>

        </div>
      </section>


      {/* GAME AREA */}
      <section className="mx-auto max-w-[1600px] px-2 py-3 sm:px-4 sm:py-5">

        {/* Game Header */}
        <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1877F2]">
              FCL Online
            </p>

            <h1 className="mt-1 text-xl font-black sm:text-2xl">
              Play Facebook Cricket League
            </h1>

            <p className="mt-1 text-xs text-white/50 sm:text-sm">
              Login, join matches and play FCL online.
            </p>
          </div>

          <Link
            href="/"
            className="w-fit rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            ← Return to FCL Portal
          </Link>

        </div>


        {/* GAME FRAME */}
        <div className="overflow-hidden rounded-2xl border border-[#1877F2]/30 bg-black shadow-2xl shadow-[#1877F2]/10">

          <iframe
            src="https://fcl-online.vercel.app/"
            title="FCL Online Game"
            className="block h-[calc(100vh-190px)] min-h-[700px] w-full border-0"
            allow="clipboard-read; clipboard-write"
          />

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#020617] px-4 py-8 text-center">

        <div className="text-lg font-black">
          Facebook Cricket League
        </div>

        <p className="mt-2 text-sm text-white/40">
          The Game Lives Beyond the Field.
        </p>

        <p className="mt-4 text-xs text-white/30">
          © 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.
        </p>

      </footer>

    </main>
  );
}