"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PlayerCardModal from "../../components/PlayerCardModal";

interface Player {
  id?: number;
  name: string;
  nickName?: string;
  role: string;
  totalTournament?: number;
  matches: number;
  runs: number;
  wickets: number;
  innings?: number;
  notOut?: number;
  fours?: number;
  sixes?: number;
  hatTricks?: number;
  mom?: number;
  cpom?: number;
  mot?: number;
  cpot?: number;
  champion?: number;
  runnersUp?: number;
  totalFinal?: number;
  lastPlayed?: string;
  highestRunScorer?: number;
  topWicketTaker?: number;
  debutYear?: string;
  debutTournament?: string;
  debutTeam?: string;
  maxRuns?: number;
  maxWickets?: number;
  runAvg?: string;
  wkAvg?: string;
}

interface TournamentRecord {
  name: string;
  playerName: string;
  tournament: string;
  team: string;
  matches: number;
  runs: number;
  wickets: number;
  innings: number;
  notOut: number;
  fours: number;
  sixes: number;
  hatTrick: number;
  mom: number;
  cpom: number;
  motCpot: string;
  chamRu: string;
  time: string;
  topScorer: number;
  topWicket: number;
}

export const calculateFclPoints = (p: Player): number => {
  const runs = Number(p.runs) || 0;
  const sixes = Number(p.sixes) || 0;
  const fours = Number(p.fours) || 0;
  const wickets = Number(p.wickets) || 0;
  const matches = Number(p.matches) || 0;
  const champion = Number(p.champion) || 0;
  const runnersUp = Number(p.runnersUp) || 0;
  const motCpot = (Number(p.mot) || 0) + (Number(p.cpot) || 0);
  const highestRuns = Number(p.highestRunScorer) || 0;
  const topWickets = Number(p.topWicketTaker) || 0;

  return Math.round(
    runs * 1 +
      sixes * 2 +
      fours * 1 +
      wickets * 20 +
      matches * 2 +
      champion * 100 +
      runnersUp * 40 +
      motCpot * 60 +
      highestRuns * 30 +
      topWickets * 30
  );
};

export default function BengaliFacebookHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [playersData, setPlayersData] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<TournamentRecord[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.players && Array.isArray(data.players)) setPlayersData(data.players);
        else if (Array.isArray(data)) setPlayersData(data);
        if (data.tournaments && Array.isArray(data.tournaments)) setTournamentsData(data.tournaments);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const top3Mvp = [...playersData].sort((a, b) => calculateFclPoints(b) - calculateFclPoints(a)).slice(0, 3);
  const mostChampionshipPlayer = [...playersData].sort((a, b) => (b.champion || 0) - (a.champion || 0))[0];
  const topRunScorer = [...playersData].sort((a, b) => b.runs - a.runs)[0];
  const topWicketTaker = [...playersData].sort((a, b) => b.wickets - a.wickets)[0];
  const mostFinalsPlayer = [...playersData].sort((a, b) => (b.totalFinal || 0) - (a.totalFinal || 0))[0];
  const mostMatchesPlayer = [...playersData].sort((a, b) => b.matches - a.matches)[0];
  const mostSixesPlayer = [...playersData].sort((a, b) => (b.sixes || 0) - (a.sixes || 0))[0];
  const topHatTrickPlayer = [...playersData].sort((a, b) => (b.hatTricks || 0) - (a.hatTricks || 0))[0];
  const mostMotPlayer = [...playersData].sort((a, b) => ((b.mot || 0) + (b.cpot || 0)) - ((a.mot || 0) + (a.cpot || 0)))[0];

  const totalCommunityRuns = playersData.reduce((acc, curr) => acc + (curr.runs || 0), 0);
  const totalCommunityWickets = playersData.reduce((acc, curr) => acc + (curr.wickets || 0), 0);

  return (
    <main className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans antialiased selection:bg-[#1877F2]/20 selection:text-[#1877F2]">
      {/* 🔵 Classic Facebook Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          <Link href="/bn" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-md">
              <span className="text-2xl font-black leading-none">f</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-[#1877F2]">ফেসবুক ক্রিকেট লীগ</h1>
              <p className="text-[10px] text-slate-500 font-semibold">FCL অফিসিয়াল বাংলা পোর্টাল</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/bn" className="rounded-xl bg-[#E7F3FF] px-4 py-2 text-sm font-bold text-[#1877F2]">হোম ফিড</Link>
            <Link href="/players" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">খেলোয়াড় তালিকা</Link>
            <Link href="/rankings" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">সেরা একাদশ ও MVP</Link>
            <Link href="/records" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">রেকর্ডস ও হল অফ ফেম</Link>
            <Link href="/memories" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">স্মৃতি ও আড্ডা 📖</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 rounded-full border border-slate-900 bg-[#020617] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#0f172a]">
              <span>🌙</span> ডার্ক মোড
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 md:hidden">
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="flex h-28 w-28 sm:h-36 sm:w-36 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-tr from-[#1877F2] to-[#42b72a] shadow-xl p-2">
              <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain" />
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E7F3FF] px-3 py-1 text-xs font-bold text-[#1877F2]">
                <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span>অফিসিয়াল ফেসবুক ক্রিকেট লীগ (FCL) গ্রুপ হাব</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">মাঠ পেরিয়ে ক্রিকেটের উন্মাদনা</h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                বাংলাদেশের বিভিন্ন জেলা থেকে শুরু করে পৃথিবীর নানা প্রান্তে থাকা ক্রিকেটপ্রেমীদের এক সুতোয় বাঁধার গল্প। দূরত্ব যাই হোক, খেলা আমাদের এক করে রেখেছে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 অল-টাইম টপ ৩ MVP সেকশন */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#1877F2]">FCL ঐতিহাসিক র‍্যাঙ্কিং</span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">👑 সর্বকালের শীর্ষ ৩ MVP তারকা</h3>
          </div>
          <Link href="/rankings" className="text-xs sm:text-sm font-bold text-[#1877F2] hover:underline shrink-0">
            সম্পূর্ণ MVP তালিকা দেখুন →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {top3Mvp.map((player, idx) => {
            const rank = idx + 1;
            const points = calculateFclPoints(player);
            const icon = rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉";

            return (
              <div
                key={player.name + idx}
                onClick={() => setSelectedPlayer(player)}
                className="cursor-pointer overflow-hidden rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:shadow-md transition hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-3xl">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-900 break-words leading-tight">{player.name}</h4>
                    <p className="text-xs text-[#1877F2] mt-0.5">@{player.nickName}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">MVP পয়েন্ট</p>
                  <p className="text-2xl font-black text-[#d97706]">{points.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🏆 ৮টি পূর্ণাঙ্গ সিমেট্রিক্যাল রেকর্ড কর্নার গ্রিড */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#1877F2]">এফসিএল ইতিহাস ও মাইলফলক</span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">🏆 এফসিএল রেকর্ড কর্নার</h3>
            <p className="text-xs sm:text-sm text-slate-500">এক নজরে সর্বকালের সেরা রেকর্ডধারী ও ঐতিহাসিক পরিসংখ্যান।</p>
          </div>
          <Link href="/records" className="text-xs sm:text-sm font-bold text-[#1877F2] hover:underline shrink-0">
            হল অফ ফেম দেখুন →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Champion */}
          <div onClick={() => setSelectedPlayer(mostChampionshipPlayer)} className="cursor-pointer rounded-2xl border border-amber-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-amber-50 px-2.5 py-0.5 text-[10px] font-black text-[#d97706] border border-amber-200">🏆 সর্বাধিক শিরোপা</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">TITLES WON</p>
                <p className="text-3xl font-black text-[#d97706] mt-0.5">{mostChampionshipPlayer?.champion || 6}টি</p>
                <p className="text-[11px] text-slate-500">৬ বার শিরোপা জয়ী</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl border border-amber-200">⭐</div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold text-slate-400">RECORD HOLDER</p>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 break-words leading-tight">{mostChampionshipPlayer?.name || "আরিফ জিয়াদ"}</h5>
                </div>
              </div>
              <span className="text-xs text-[#1877F2] font-bold shrink-0">Open Card →</span>
            </div>
          </div>

          {/* 2. All-Time Runs */}
          <div onClick={() => setSelectedPlayer(topRunScorer)} className="cursor-pointer rounded-2xl border border-blue-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-[#1877F2] border border-blue-200">🏏 সর্বোচ্চ রান</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">CAREER RECORD RUNS</p>
                <p className="text-3xl font-black text-[#1877F2] mt-0.5">{topRunScorer?.runs?.toLocaleString() || "৩,৩১৭"}</p>
                <p className="text-[11px] text-slate-500">গড়: {topRunScorer?.runAvg || "১৫.২২"}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl border border-blue-200">👑</div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold text-slate-400">RECORD HOLDER</p>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 break-words leading-tight">{topRunScorer?.name || "জাহিন শাহরিয়ার চৌধুরী"}</h5>
                </div>
              </div>
              <span className="text-xs text-[#1877F2] font-bold shrink-0">Open Card →</span>
            </div>
          </div>

          {/* 3. All-Time Wickets */}
          <div onClick={() => setSelectedPlayer(topWicketTaker)} className="cursor-pointer rounded-2xl border border-red-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-red-50 px-2.5 py-0.5 text-[10px] font-black text-red-600 border border-red-200">🎯 সর্বোচ্চ উইকেট</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">CAREER RECORD WICKETS</p>
                <p className="text-3xl font-black text-red-600 mt-0.5">{topWicketTaker?.wickets || 332}টি</p>
                <p className="text-[11px] text-slate-500">বোলিং গড়: {topWicketTaker?.wkAvg || "১.৯৯"}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl border border-red-200">⚡</div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold text-slate-400">RECORD HOLDER</p>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 break-words leading-tight">{topWicketTaker?.name || "জাহিদ হাসান"}</h5>
                </div>
              </div>
              <span className="text-xs text-[#1877F2] font-bold shrink-0">Open Card →</span>
            </div>
          </div>

          {/* 4. Total Finals */}
          <div onClick={() => setSelectedPlayer(mostFinalsPlayer)} className="cursor-pointer rounded-2xl border border-sky-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-sky-50 px-2.5 py-0.5 text-[10px] font-black text-[#0284c7] border border-sky-200">⚔️ সর্বাধিক ফাইনাল</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">FINAL APPEARANCES</p>
                <p className="text-3xl font-black text-[#0284c7] mt-0.5">{mostFinalsPlayer?.totalFinal || 9}টি</p>
                <p className="text-[11px] text-slate-500">৫ বার চ্যাম্পিয়ন • ৪ বার রানার্স-আপ</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xl border border-sky-200">🛡️</div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold text-slate-400">RECORD HOLDER</p>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 break-words leading-tight">{mostFinalsPlayer?.name || "তানভীর শাকিব"}</h5>
                </div>
              </div>
              <span className="text-xs text-[#1877F2] font-bold shrink-0">Open Card →</span>
            </div>
          </div>

          {/* 5. Most Matches */}
          <div onClick={() => setSelectedPlayer(mostMatchesPlayer)} className="cursor-pointer rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-600 border border-emerald-200">⚡ সর্বাধিক ম্যাচ</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">CAPS PLAYED</p>
                <p className="text-3xl font-black text-emerald-600 mt-0.5">{mostMatchesPlayer?.matches || 171}টি</p>
                <p className="text-[11px] text-slate-500">২৬১ টি ক্যারিয়ার উইকেট</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl border border-emerald-200">🛡️</div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold text-slate-400">RECORD HOLDER</p>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 break-words leading-tight">{mostMatchesPlayer?.name || "সাদরুল আনাম"}</h5>
                </div>
              </div>
              <span className="text-xs text-[#1877F2] font-bold shrink-0">Open Card →</span>
            </div>
          </div>

          {/* 6. Six Machine */}
          <div onClick={() => setSelectedPlayer(mostSixesPlayer)} className="cursor-pointer rounded-2xl border border-purple-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-purple-50 px-2.5 py-0.5 text-[10px] font-black text-purple-600 border border-purple-200">💥 ছক্কার মেশিন</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">TOTAL SIXES CLEARED</p>
                <p className="text-3xl font-black text-purple-600 mt-0.5">{mostSixesPlayer?.sixes || 176}টি</p>
                <p className="text-[11px] text-slate-500">{mostSixesPlayer?.runs || 2745} ক্যারিয়ার রান</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-xl border border-purple-200">💣</div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold text-slate-400">RECORD HOLDER</p>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 break-words leading-tight">{mostSixesPlayer?.name || "শাহরিয়ার খোকন"}</h5>
                </div>
              </div>
              <span className="text-xs text-[#1877F2] font-bold shrink-0">Open Card →</span>
            </div>
          </div>

          {/* 7. Hat-Tricks */}
          <div onClick={() => setSelectedPlayer(topHatTrickPlayer)} className="cursor-pointer rounded-2xl border border-pink-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-pink-50 px-2.5 py-0.5 text-[10px] font-black text-pink-600 border border-pink-200">🔥 হ্যাটট্রিক মাস্টার</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">CAREER HAT-TRICKS</p>
                <p className="text-3xl font-black text-pink-600 mt-0.5">{topHatTrickPlayer?.hatTricks || 12} বার</p>
                <p className="text-[11px] text-slate-500">সর্বকালের সর্বোচ্চ হ্যাটট্রিক রেকর্ড</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-xl border border-pink-200">🎯</div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold text-slate-400">RECORD HOLDER</p>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 break-words leading-tight">{topHatTrickPlayer?.name || "জাহিদ হাসান"}</h5>
                </div>
              </div>
              <span className="text-xs text-[#1877F2] font-bold shrink-0">Open Card →</span>
            </div>
          </div>

          {/* 8. MOT / CPOT */}
          <div onClick={() => setSelectedPlayer(mostMotPlayer)} className="cursor-pointer rounded-2xl border border-amber-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-amber-50 px-2.5 py-0.5 text-[10px] font-black text-amber-700 border border-amber-200">⭐ সেরা খেলোয়াড়</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">TOURNAMENT BEST</p>
                <p className="text-3xl font-black text-amber-600 mt-0.5">{(mostMotPlayer?.mot || 0) + (mostMotPlayer?.cpot || 0)} বার</p>
                <p className="text-[11px] text-slate-500">টুর্নামেন্ট সেরা পুরস্কার</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl border border-amber-200">🎖️</div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-bold text-slate-400">RECORD HOLDER</p>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900 break-words leading-tight">{mostMotPlayer?.name || "তৌফিক আহমেদ অভি"}</h5>
                </div>
              </div>
              <span className="text-xs text-[#1877F2] font-bold shrink-0">Open Card →</span>
            </div>
          </div>
        </div>

        {/* ব্যানার */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#1877F2] p-6 text-white shadow-lg">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#bfdbfe]">সামগ্রিক ইতিহাস</span>
            <h4 className="mt-1 text-2xl font-black">{totalCommunityRuns ? `${totalCommunityRuns.toLocaleString()}+ রান` : "১,২৭,৩৮৭+ রান"}</h4>
            <p className="text-xs text-[#dbeafe] mt-1">২০১৩ সাল থেকে এ পর্যন্ত এফসিএলে নিবন্ধিত খেলোয়াড়দের সম্মিলিত অর্জনের ভাণ্ডার।</p>
          </div>
          <div className="rounded-xl bg-white/10 px-6 py-3 text-center shrink-0 border border-white/20">
            <p className="text-[10px] uppercase font-bold text-white/80">মোট উইকেট</p>
            <p className="text-2xl sm:text-3xl font-black text-white">{totalCommunityWickets ? `${totalCommunityWickets.toLocaleString()}` : "১০,৩০৩"}টি</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-8 mt-12 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-900">ফেসবুক ক্রিকেট লীগ (FCL) • ২০১৩–২০২৬</p>
        <p className="mt-1">© ২০২৬ সর্বস্বত্ব সংরক্ষিত | আরিফ জিয়াদ ও এফসিএল পরিবার</p>
      </footer>

      {/* 🌟 CENTRALIZED PLAYER CARD MODAL */}
      <PlayerCardModal
        selectedPlayer={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        tournamentsData={tournamentsData || []}
        allPlayers={playersData || []}
      />
    </main>
  );
}