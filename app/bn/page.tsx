"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";

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

function formatSafeDate(val: any): string {
  if (!val) return "";
  const num = Number(val);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[dateInfo.getUTCMonth()]} ${dateInfo.getUTCFullYear()}`;
  }
  return String(val).trim().slice(0, 10);
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
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [cardTheme, setCardTheme] = useState<"dark" | "light">("light");
  const [activeTab, setActiveTab] = useState<"card" | "history">("card");
  const [downloading, setDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadCard = async () => {
    if (!cardRef.current || !selectedPlayer) return;

    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      const safeName = (selectedPlayer.nickName || selectedPlayer.name || "player").toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `fcl-stat-card-${safeName}-${cardTheme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setDownloading(false);
    }
  };

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

  const getRank = (player: Player, type: "mvp" | "runs" | "wickets" | "sixes" | "champion") => {
    const sorted = [...playersData].sort((a, b) => {
      if (type === "mvp") return calculateFclPoints(b) - calculateFclPoints(a);
      if (type === "runs") return b.runs - a.runs;
      if (type === "wickets") return b.wickets - a.wickets;
      if (type === "sixes") return (b.sixes || 0) - (a.sixes || 0);
      if (type === "champion") return (b.champion || 0) - (a.champion || 0);
      return 0;
    });
    const index = sorted.findIndex((p) => p.name === player.name);
    return index !== -1 ? index + 1 : "—";
  };

  const playerTournamentHistory = selectedPlayer
    ? tournamentsData.filter((t) => {
        const pName = selectedPlayer.name.toLowerCase().trim();
        const pNick = (selectedPlayer.nickName || "").toLowerCase().trim();
        const rowPlayer = t.playerName.toLowerCase().trim();
        const rowNick = t.name.toLowerCase().trim();
        return (
          rowPlayer === pName ||
          (pNick && rowNick === pNick) ||
          (rowPlayer && pName.includes(rowPlayer)) ||
          (pName && rowPlayer.includes(pName))
        );
      })
    : [];

  const getDebutTournament = (p: Player) => {
    if (p.debutTournament && p.debutTournament !== "—" && p.debutTournament !== "") {
      return p.debutTournament;
    }
    if (playerTournamentHistory.length > 0) {
      return playerTournamentHistory[0].tournament;
    }
    return "—";
  };

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
                বাংলাদেশের বিভিন্ন জেলা থেকে শুরু করে পৃথিবীর নানা প্রান্তে থাকা ক্রিকেটপ্রেমীদের এক সুতোয় বাঁধার গল্প। দূরত্ব যাই হোক, খেলা আমাদের এক করে রেখেছে।
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
                onClick={() => { setSelectedPlayer(player); setActiveTab("card"); }}
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

      {/* 🏆 ৮টি পূর্ণাঙ্গ সিমেট্রিক্যাল রেকর্ড কর্নার গ্রিড (AUTHENTIC 4x2 RESTORATION) */}
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

        {/* 4x2 Grid (8 Major Records) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Champion */}
          <div onClick={() => { setSelectedPlayer(mostChampionshipPlayer); setActiveTab("card"); }} className="cursor-pointer rounded-2xl border border-amber-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-amber-50 px-2.5 py-0.5 text-[10px] font-black text-[#d97706] border border-amber-200">🏆 সর্বাধিক শিরোপা</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">TITLES WON</p>
                <p className="text-3xl font-black text-[#d97706] mt-0.5">{mostChampionshipPlayer?.champion || 6}টি</p>
                <p className="text-[11px] text-slate-500">৬ বার শিরোপা জয়ী</p>
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
          <div onClick={() => { setSelectedPlayer(topRunScorer); setActiveTab("card"); }} className="cursor-pointer rounded-2xl border border-blue-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-[#1877F2] border border-blue-200">🏏 সর্বোচ্চ রান</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">CAREER RECORD RUNS</p>
                <p className="text-3xl font-black text-[#1877F2] mt-0.5">{topRunScorer?.runs?.toLocaleString() || "৩,৩১৭"}</p>
                <p className="text-[11px] text-slate-500">গড়: {topRunScorer?.runAvg || "১৫.২২"}</p>
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
          <div onClick={() => { setSelectedPlayer(topWicketTaker); setActiveTab("card"); }} className="cursor-pointer rounded-2xl border border-red-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-red-50 px-2.5 py-0.5 text-[10px] font-black text-red-600 border border-red-200">🎯 সর্বোচ্চ উইকেট</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">CAREER RECORD WICKETS</p>
                <p className="text-3xl font-black text-red-600 mt-0.5">{topWicketTaker?.wickets || 332}টি</p>
                <p className="text-[11px] text-slate-500">বোলিং গড়: {topWicketTaker?.wkAvg || "১.৯৯"}</p>
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
          <div onClick={() => { setSelectedPlayer(mostFinalsPlayer); setActiveTab("card"); }} className="cursor-pointer rounded-2xl border border-sky-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-sky-50 px-2.5 py-0.5 text-[10px] font-black text-[#0284c7] border border-sky-200">⚔️ সর্বাধিক ফাইনাল</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">FINAL APPEARANCES</p>
                <p className="text-3xl font-black text-[#0284c7] mt-0.5">{mostFinalsPlayer?.totalFinal || 9}টি</p>
                <p className="text-[11px] text-slate-500">৫ বার চ্যাম্পিয়ন • ৪ বার রানার্স-আপ</p>
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
          <div onClick={() => { setSelectedPlayer(mostMatchesPlayer); setActiveTab("card"); }} className="cursor-pointer rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-600 border border-emerald-200">⚡ সর্বাধিক ম্যাচ</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">CAPS PLAYED</p>
                <p className="text-3xl font-black text-emerald-600 mt-0.5">{mostMatchesPlayer?.matches || 171}টি</p>
                <p className="text-[11px] text-slate-500">২৬১ টি ক্যারিয়ার উইকেট</p>
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
          <div onClick={() => { setSelectedPlayer(mostSixesPlayer); setActiveTab("card"); }} className="cursor-pointer rounded-2xl border border-purple-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-purple-50 px-2.5 py-0.5 text-[10px] font-black text-purple-600 border border-purple-200">💥 ছক্কার মেশিন</span>
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">TOTAL SIXES CLEARED</p>
                <p className="text-3xl font-black text-purple-600 mt-0.5">{mostSixesPlayer?.sixes || 176}টি</p>
                <p className="text-[11px] text-slate-500">{mostSixesPlayer?.runs || 2745} ক্যারিয়ার রান</p>
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
          <div onClick={() => { setSelectedPlayer(topHatTrickPlayer); setActiveTab("card"); }} className="cursor-pointer rounded-2xl border border-pink-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
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

          {/* 8. MOT / CPOT (Record: Toufiq Ahmed Ovi) */}
          <div onClick={() => { setSelectedPlayer(mostMotPlayer); setActiveTab("card"); }} className="cursor-pointer rounded-2xl border border-amber-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between hover:-translate-y-1">
            <div>
              <span className="rounded-lg bg-amber-50 px-2.5 py-0.5 text-[10px] font-black text-amber-700 border border-amber-200">⭐ সেরা খেলোয়াড়</span>
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

      {/* ========================================================================= */}
      {/* 🌟 100% COMPLETE & RESTORED MODAL IN FACEBOOK VIEW */}
      {/* ========================================================================= */}
      {selectedPlayer && (
        <div
          onClick={() => setSelectedPlayer(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className={`relative flex h-[94vh] sm:h-auto sm:max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl transition-colors duration-200 ${
              cardTheme === "dark"
                ? "border-[#38bdf8]/40 bg-[#0f172a] text-white"
                : "border-slate-300 bg-white text-slate-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div
              className={`sticky top-0 z-30 shrink-0 border-b px-4 py-3 backdrop-blur-md ${
                cardTheme === "dark" ? "border-[#1e293b] bg-[#0b1329]/95 text-white" : "border-slate-200 bg-white/95 text-slate-900"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 rounded-xl p-1 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20">
                  <button
                    onClick={() => setActiveTab("card")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === "card"
                        ? "bg-[#1877F2] text-white shadow"
                        : cardTheme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                    }`}
                  >
                    <span>🎖️</span>
                    <span>Stat Card</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === "history"
                        ? "bg-[#1877F2] text-white shadow font-black"
                        : cardTheme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                    }`}
                  >
                    <span>📊</span>
                    <span>Tournament History ({playerTournamentHistory.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-xl p-1 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20">
                    <button
                      onClick={() => setCardTheme("dark")}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                        cardTheme === "dark" ? "bg-[#1877F2] text-white shadow" : "text-slate-500 hover:text-black"
                      }`}
                    >
                      🌙 Dark
                    </button>
                    <button
                      onClick={() => setCardTheme("light")}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                        cardTheme === "light" ? "bg-white text-[#1877F2] font-black shadow border border-slate-200" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      ☀️ Light
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 dark:border-white/10 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/20"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {activeTab === "history" && (
                <div className={`mt-3 flex items-center justify-between border-t pt-2.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                  <div>
                    <h4 className={`text-base sm:text-lg font-black flex items-center gap-2 ${cardTheme === "dark" ? "text-white" : "text-slate-900"}`}>
                      <span>📊</span>
                      <span>{selectedPlayer.name} এর টুর্নামেন্ট ইতিহাস</span>
                    </h4>
                    <p className={`text-[11px] font-medium ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      অংশগ্রহণ করা প্রতিটি আসরের ইন্ডিভিজুয়াল পারফরম্যান্স ব্রেকডাউন
                    </p>
                  </div>
                  <span className={`rounded-xl px-3 py-1 text-xs font-bold shrink-0 ${cardTheme === "dark" ? "bg-[#1877F2]/25 border border-[#1877F2]/50 text-[#60a5fa]" : "bg-blue-50 border border-blue-200 text-[#1877F2]"}`}>
                    মোট {playerTournamentHistory.length} টি আসর
                  </span>
                </div>
              )}
            </div>

            {/* Scrollable Body */}
            <div className={`flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 ${cardTheme === "dark" ? "bg-[#0b132b]" : "bg-[#F8FAFC]"}`}>
              {activeTab === "card" ? (
                /* TAB 1: 100% COMPLETE STAT CARD (NO TRUNCATION, FULL DETAILED GRID) */
                <div
                  ref={cardRef}
                  className={`mx-auto rounded-2xl border p-4 sm:p-6 space-y-4 shadow-xl ${
                    cardTheme === "dark"
                      ? "border-[#1e293b] bg-[#070b16] text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <div className={`flex items-center justify-between border-b pb-3 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border p-1 bg-[#1877F2]/10 text-2xl">
                        🏏
                      </div>
                      <div>
                        <h3 className={`text-base sm:text-2xl font-black uppercase ${cardTheme === "dark" ? "text-[#e0f2fe]" : "text-[#1877F2]"}`}>
                          Player Statistics Card
                        </h3>
                        <p className={`text-xs ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Facebook Cricket League (FCL)</p>
                      </div>
                    </div>
                    <span className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2.5 py-1 text-xs font-bold text-[#f59e0b]">OFFICIAL</span>
                  </div>

                  {/* Profile Top Row with FULL NAME (NO CUTTING) */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    <div className={`relative flex items-center justify-center rounded-xl border-2 p-1.5 aspect-square text-4xl ${cardTheme === "dark" ? "border-[#38bdf8]/40 bg-[#0b132b]" : "border-blue-200 bg-blue-50"}`}>
                      🏏
                    </div>
                    <div className={`col-span-2 rounded-xl border p-3.5 flex flex-col justify-center ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Player Name</span>
                      <h4 className="text-base sm:text-lg font-black break-words leading-tight mt-1">
                        {selectedPlayer.name}
                      </h4>
                      {selectedPlayer.nickName && <p className="text-xs font-bold text-[#1877F2] mt-0.5">@{selectedPlayer.nickName}</p>}
                      <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Role:</span>
                        <span className="text-xs font-bold text-[#f59e0b] truncate">{selectedPlayer.role}</span>
                      </div>
                    </div>
                    <div className="col-span-3 sm:col-span-1 rounded-xl border-2 p-2.5 text-center shadow-lg border-[#f59e0b] bg-gradient-to-b from-[#2a1b04] to-[#120b02]">
                      <span className="text-[11px] font-black uppercase text-[#fbbf24]">TOTAL FINAL</span>
                      <p className="text-3xl font-black text-[#fde047] my-0.5">{selectedPlayer.totalFinal ?? 0}</p>
                      <span className="text-[10px] font-bold text-[#e2e8f0]">Finals Played</span>
                    </div>
                  </div>

                  {/* Debut & Tournaments Row (WITH DEBUT TOURNAMENT FIXED) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Debut Date</p>
                      <p className="font-extrabold text-[#1877F2] text-xs sm:text-sm mt-1">{formatSafeDate(selectedPlayer.debutYear) || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Debut Tournament</p>
                      {/* 🌟 FIXED: SHOWS ACTUAL DEBUT TOURNAMENT LIKE FCL-1 */}
                      <p className="font-black text-xs sm:text-sm mt-1 break-words text-[#22c55e]">
                        {getDebutTournament(selectedPlayer)}
                      </p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Debut Team</p>
                      <p className="font-extrabold text-xs sm:text-sm mt-1 break-words">{selectedPlayer.debutTeam || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Total Tournaments</p>
                      <p className="font-black text-[#16a34a] text-base sm:text-xl mt-0.5">{selectedPlayer.totalTournament ?? 0}</p>
                    </div>
                  </div>

                  {/* MVP & Rankings Grid */}
                  <div className={`rounded-2xl border-2 p-3.5 sm:p-4 text-center shadow-lg ${cardTheme === "dark" ? "border-[#f59e0b]/60 bg-gradient-to-r from-[#1c1203] via-[#2c1c04] to-[#1c1203]" : "border-[#f59e0b] bg-amber-50/70"}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b pb-2.5 border-[#f59e0b]/30">
                      <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#d97706] flex items-center gap-1.5">
                        <span>⭐</span> ALL-TIME LEAGUE RANKINGS
                      </p>
                      <div className="inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 border shadow-md bg-gradient-to-r from-[#d97706] to-[#b45309] text-white">
                        <span>👑</span>
                        <span className="text-xs sm:text-sm font-black">#{getRank(selectedPlayer, "mvp")} MVP</span>
                        <span className="h-3.5 w-px bg-white/40" />
                        <span className="text-xs sm:text-sm font-extrabold text-amber-100">{calculateFclPoints(selectedPlayer).toLocaleString()} Pts</span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-amber-200 shadow-sm"}`}>
                        <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Runs Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#16a34a] mt-0.5">#{getRank(selectedPlayer, "runs")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-amber-200 shadow-sm"}`}>
                        <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Wkts Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#d97706] mt-0.5">#{getRank(selectedPlayer, "wickets")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-amber-200 shadow-sm"}`}>
                        <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>6s Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#7c3aed] mt-0.5">#{getRank(selectedPlayer, "sixes")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/30" : "bg-white border-amber-200 shadow-sm"}`}>
                        <p className={`text-[10px] uppercase font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Trophy Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#0284c7] mt-0.5">#{getRank(selectedPlayer, "champion")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Career Stats Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={`rounded-xl border p-3.5 space-y-2 text-xs sm:text-[13px] ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Total Match:</span>
                        <strong className="font-extrabold">{selectedPlayer.matches}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Total Runs & Max:</span>
                        <strong className="text-[#16a34a] font-black">{selectedPlayer.runs} ({selectedPlayer.maxRuns || "—"})</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Total Wickets & Max:</span>
                        <strong className="text-[#d97706] font-black">{selectedPlayer.wickets} ({selectedPlayer.maxWickets || "—"})</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Innings / Not Out:</span>
                        <strong className="font-bold">{selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Boundaries (4s / 6s):</span>
                        <strong className="font-extrabold"><span className="text-[#0284c7]">{selectedPlayer.fours}</span> / <span className="text-[#7c3aed]">{selectedPlayer.sixes}</span></strong>
                      </div>
                      <div className="flex justify-between">
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Career Hat-Trick:</span>
                        <strong className="text-[#db2777] font-black">{selectedPlayer.hatTricks ?? 0}</strong>
                      </div>
                    </div>

                    <div className={`rounded-xl border p-3.5 space-y-2 text-xs sm:text-[13px] ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b132b]" : "border-slate-200 bg-slate-50"}`}>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Batting / Bowling Avg:</span>
                        <strong className="font-extrabold">{selectedPlayer.runAvg} / {selectedPlayer.wkAvg}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Champion / Runner-Up:</span>
                        <strong className="font-extrabold">🏆 <span className="text-[#d97706]">{selectedPlayer.champion ?? 0}</span> / 🥈 <span>{selectedPlayer.runnersUp ?? 0}</span></strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>MOT / CPOT:</span>
                        <strong className="font-extrabold">⭐ <span className="text-[#7c3aed]">{selectedPlayer.mot ?? 0}</span> / {selectedPlayer.cpot ?? 0}</strong>
                      </div>
                      <div className={`flex justify-between border-b pb-1.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>MOM / CPOM:</span>
                        <strong className="font-extrabold">🎖️ <span className="text-[#0284c7]">{selectedPlayer.mom ?? 0}</span> / {selectedPlayer.cpom ?? 0}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className={`font-bold ${cardTheme === "dark" ? "text-slate-400" : "text-slate-600"}`}>Top Scorer / Wicket Taker:</span>
                        <strong className="font-black text-[#d97706]">{selectedPlayer.highestRunScorer ?? 0} / {selectedPlayer.topWicketTaker ?? 0}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 🌟 PROMINENTLY HIGHLIGHTED LAST PLAYED BANNER */}
                  <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 rounded-xl p-3 border-2 ${
                    cardTheme === "dark"
                      ? "border-[#f59e0b]/50 bg-gradient-to-r from-[#1e1302] to-[#0a0701]"
                      : "border-[#d97706]/40 bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fffbeb]"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-[#22c55e] animate-pulse" />
                      <span className={`text-xs font-black uppercase tracking-wider ${cardTheme === "dark" ? "text-[#fbbf24]" : "text-[#b45309]"}`}>
                        Last Played Tournament:
                      </span>
                    </div>
                    <span className={`text-xs sm:text-sm font-black px-3 py-1 rounded-lg border shadow-sm ${
                      cardTheme === "dark"
                        ? "bg-[#f59e0b] text-black border-[#f59e0b]"
                        : "bg-white text-[#b45309] border-[#d97706]"
                    }`}>
                      🏟️ {selectedPlayer.lastPlayed || "—"}
                    </span>
                  </div>
                </div>
              ) : (
                /* TAB 2: TOURNAMENT HISTORY WITH HIGH-CONTRAST MOT/CPOT BANNER */
                <div className="space-y-3.5">
                  {playerTournamentHistory.length === 0 ? (
                    <div className="rounded-2xl border p-8 text-center text-slate-400">কোনো টুর্নামেন্ট রেকর্ড পাওয়া যায়নি</div>
                  ) : (
                    playerTournamentHistory.map((t, idx) => {
                      const hasMot = t.motCpot?.toUpperCase() === "MOT";
                      const hasCpot = t.motCpot?.toUpperCase() === "CPOT";
                      const isTopScorer = Number(t.topScorer) === 1;
                      const isTopWicket = Number(t.topWicket) === 1;
                      const hasSpecialAward = hasMot || hasCpot || isTopScorer || isTopWicket;

                      const cardBg =
                        cardTheme === "dark"
                          ? hasSpecialAward
                            ? "border-2 border-[#f59e0b] bg-gradient-to-r from-[#241804] via-[#120b02] to-[#040813] shadow-[0_0_20px_rgba(245,158,11,0.2)] text-white"
                            : "border border-[#1e293b] bg-gradient-to-r from-[#0b1329] via-[#070e1e] to-[#040813] text-white"
                          : hasSpecialAward
                          ? "border-2 border-[#f59e0b] bg-amber-50/90 shadow-md text-slate-900"
                          : "border border-slate-200 bg-white shadow-sm text-slate-900";

                      const subBoxBg =
                        cardTheme === "dark"
                          ? "bg-black/50 border-white/5"
                          : "bg-slate-100 border-slate-200";

                      const labelStyle = cardTheme === "dark" ? "text-xs font-bold uppercase tracking-wider text-slate-400" : "text-xs font-bold uppercase tracking-wider text-slate-500";
                      const numStyle = "font-black text-base sm:text-lg mt-0.5";
                      const displayDate = formatSafeDate(t.time);

                      return (
                        <div key={idx} className={`rounded-2xl p-4 transition ${cardBg}`}>
                          <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 ${cardTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-[#1877F2] px-3 py-1 text-xs font-black text-white shadow-sm">
                                {t.tournament}
                              </span>
                              <span className="text-sm font-black">{t.team}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {t.chamRu && (
                                <span className="rounded-lg px-2.5 py-0.5 text-xs font-black uppercase bg-[#f59e0b] text-black">
                                  {t.chamRu}
                                </span>
                              )}
                              {displayDate && (
                                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${cardTheme === "dark" ? "bg-black/30 border-white/10 text-slate-300" : "bg-white border-slate-300 text-slate-700"}`}>
                                  📅 {displayDate}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 🌟 100% VISIBLE & HIGH-CONTRAST MOT / CPOT BANNER */}
                          {hasSpecialAward && (
                            <div
                              className={`mt-3 flex flex-wrap items-center gap-2.5 rounded-xl px-3.5 py-2.5 border-2 shadow-md ${
                                cardTheme === "dark"
                                  ? "border-[#f59e0b] bg-gradient-to-r from-[#b45309]/40 via-[#d97706]/30 to-[#b45309]/40"
                                  : "border-[#d97706] bg-gradient-to-r from-[#d97706] via-[#ea580c] to-[#d97706] text-white shadow-amber-500/20"
                              }`}
                            >
                              {hasMot && (
                                <span className={`flex items-center gap-1.5 text-xs sm:text-sm font-black ${cardTheme === "dark" ? "text-[#fbbf24] drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]" : "text-white drop-shadow"}`}>
                                  <span>👑</span> MAN OF THE TOURNAMENT (MOT)
                                </span>
                              )}
                              {hasCpot && (
                                <span className={`flex items-center gap-1.5 text-xs sm:text-sm font-black ${cardTheme === "dark" ? "text-[#fde047] drop-shadow-[0_0_12px_rgba(253,224,71,0.7)]" : "text-white drop-shadow"}`}>
                                  <span>⭐</span> COOL PLAYER OF THE TOURNAMENT (CPOT)
                                </span>
                              )}
                              {(hasMot || hasCpot) && (isTopScorer || isTopWicket) && <span className={cardTheme === "dark" ? "text-[#f59e0b] font-bold" : "text-white/60 font-bold"}>•</span>}
                              {isTopScorer && (
                                <span className={`flex items-center gap-1 text-xs sm:text-sm font-black ${cardTheme === "dark" ? "text-[#60a5fa]" : "text-amber-100"}`}>
                                  <span>🏏</span> TOP SCORER ({t.runs} Runs)
                                </span>
                              )}
                              {isTopScorer && isTopWicket && <span className={cardTheme === "dark" ? "text-[#f59e0b] font-bold" : "text-white/60 font-bold"}>•</span>}
                              {isTopWicket && (
                                <span className={`flex items-center gap-1 text-xs sm:text-sm font-black ${cardTheme === "dark" ? "text-[#f472b6]" : "text-amber-100"}`}>
                                  <span>🎯</span> TOP WICKET TAKER ({t.wickets} Wkts)
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-3.5 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                            <div className={`rounded-xl p-2.5 border ${subBoxBg}`}>
                              <p className={labelStyle}>Matches</p>
                              <p className={numStyle}>{t.matches}</p>
                            </div>
                            <div className={`rounded-xl p-2.5 border ${isTopScorer ? "bg-amber-100/80 border-2 border-[#f59e0b]" : subBoxBg}`}>
                              <p className={labelStyle}>Runs</p>
                              <p className={`${numStyle} ${isTopScorer ? "text-[#d97706]" : "text-[#16a34a]"}`}>{t.runs}</p>
                            </div>
                            <div className={`rounded-xl p-2.5 border ${isTopWicket ? "bg-amber-100/80 border-2 border-[#f59e0b]" : subBoxBg}`}>
                              <p className={labelStyle}>Wkts</p>
                              <p className={`${numStyle} ${isTopWicket ? "text-[#d97706]" : "text-[#d97706]"}`}>{t.wickets}</p>
                            </div>
                            <div className={`rounded-xl p-2.5 border ${subBoxBg}`}>
                              <p className={labelStyle}>Inn</p>
                              <p className={numStyle}>{t.innings}</p>
                            </div>
                            <div className={`rounded-xl p-2.5 border ${subBoxBg}`}>
                              <p className={labelStyle}>4s / 6s</p>
                              <p className={`${numStyle} text-[#0284c7]`}>{t.fours} / {t.sixes}</p>
                            </div>
                            <div className={`rounded-xl p-2.5 border ${hasMot || hasCpot ? "bg-amber-100/80 border-2 border-[#f59e0b]" : subBoxBg}`}>
                              <p className={labelStyle}>Awards</p>
                              <p className={`${numStyle} ${hasMot || hasCpot ? "text-[#d97706] font-black" : "text-slate-400"}`}>
                                {hasMot ? "👑 MOT" : hasCpot ? "⭐ CPOT" : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className={`shrink-0 flex gap-2 border-t p-3 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#0b1329]" : "border-slate-200 bg-white"}`}>
              {activeTab === "card" ? (
                <button onClick={handleDownloadCard} className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow hover:bg-[#166fe5]">
                  📥 ডাউনলোড কার্ড
                </button>
              ) : (
                <button onClick={() => setActiveTab("card")} className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow hover:bg-[#166fe5]">
                  ← স্ট্যাট কার্ডে ফিরে যান
                </button>
              )}
              <button onClick={() => setSelectedPlayer(null)} className={`rounded-xl border px-4 py-2.5 text-xs font-bold ${cardTheme === "dark" ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-300 bg-slate-100 text-slate-700"}`}>
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}