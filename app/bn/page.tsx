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
  photoUrl?: string;
}

// 🎯 FCL পয়েন্ট ফর্মুলা
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
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [cardTheme, setCardTheme] = useState<"dark" | "light">("light");
  const [downloading, setDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

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
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const handleDownloadCard = async () => {
    if (!cardRef.current || !selectedPlayer) return;

    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      const safeName = (selectedPlayer.nickName || selectedPlayer.name || "player")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
      link.download = `fcl-stat-card-${safeName}-${cardTheme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export card image:", err);
      alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setDownloading(false);
    }
  };

  // 🔥 অল-টাইম টপ ৩ MVP
  const top3Mvp = [...playersData]
    .sort((a, b) => calculateFclPoints(b) - calculateFclPoints(a))
    .slice(0, 3);

  // রেকর্ড ক্যাটাগরি
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

  return (
    <main className="min-h-screen bg-[#F0F2F5] text-[#1c1e21] font-sans antialiased selection:bg-[#1877F2]/20 selection:text-[#1877F2]">
      {/* 🔵 Classic Facebook Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#ced0d4] shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/bn" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-md">
                <span className="text-2xl font-black leading-none tracking-tighter">f</span>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-[#1877F2]">
                  ফেসবুক ক্রিকেট লীগ
                </h1>
                <p className="text-[10px] text-[#65676B] font-semibold">FCL অফিসিয়াল বাংলা পোর্টাল</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/bn" className="rounded-xl bg-[#E7F3FF] px-4 py-2 text-sm font-bold text-[#1877F2]">
              হোম ফিড
            </Link>
            <Link href="/players" className="rounded-xl px-4 py-2 text-sm font-bold text-[#65676B] hover:bg-[#F2F2F2] transition">
              খেলোয়াড় তালিকা
            </Link>
            <Link href="/rankings" className="rounded-xl px-4 py-2 text-sm font-bold text-[#65676B] hover:bg-[#F2F2F2] transition">
              সেরা একাদশ ও MVP
            </Link>
            <Link href="/records" className="rounded-xl px-4 py-2 text-sm font-bold text-[#65676B] hover:bg-[#F2F2F2] transition">
              রেকর্ডস ও হল অফ ফেম
            </Link>
            <Link href="/memories" className="rounded-xl px-4 py-2 text-sm font-bold text-[#65676B] hover:bg-[#F2F2F2] transition">
              স্মৃতি ও আড্ডা 📖
            </Link>
          </nav>

          {/* Mode Switch Button (Back to Dark Mode) */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full border border-[#1e293b] bg-[#020617] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0f172a]"
            >
              <span>🌙</span>
              <span>ডার্ক মোড</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4E6EB] text-[#050505] md:hidden"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-[#ced0d4] bg-white px-5 py-4 md:hidden animate-in fade-in duration-150">
            <nav className="flex flex-col gap-2">
              <Link href="/bn" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-[#E7F3FF] px-3 py-2 text-sm font-bold text-[#1877F2]">
                🏠 হোম ফিড
              </Link>
              <Link href="/players" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-[#050505] hover:bg-[#F2F2F2]">
                👥 খেলোয়াড় তালিকা
              </Link>
              <Link href="/rankings" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-[#050505] hover:bg-[#F2F2F2]">
                👑 সেরা একাদশ ও MVP
              </Link>
              <Link href="/records" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-[#050505] hover:bg-[#F2F2F2]">
                🏆 রেকর্ডস ও হল অফ ফেম
              </Link>
              <Link href="/memories" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-[#050505] hover:bg-[#F2F2F2]">
                📖 স্মৃতি ও আড্ডা
              </Link>
              <Link href="/rules" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-[#050505] hover:bg-[#F2F2F2]">
                📜 নিয়মকানুন
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-[#ced0d4] py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="relative flex h-28 w-28 sm:h-36 sm:w-36 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-tr from-[#1877F2] to-[#42b72a] shadow-xl p-2">
              <img
                src="/fcl-logo.png"
                alt="FCL Logo"
                className="h-full w-full object-contain drop-shadow"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-5xl text-white">🏏</span>';
                }}
              />
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E7F3FF] px-3 py-1 text-xs font-bold text-[#1877F2]">
                <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span>অফিসিয়াল ফেসবুক ক্রিকেট লীগ (FCL) গ্রুপ হাব</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#050505] tracking-tight">
                মাঠ পেরিয়ে ক্রিকেটের উন্মাদনা
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#65676B] leading-relaxed">
                বাংলাদেশের বিভিন্ন জেলা থেকে শুরু করে পৃথিবীর নানা প্রান্তে থাকা ক্রিকেটপ্রেমীদের এক সুতোয় বাঁধার গল্প। দূরত্ব যাই হোক, খেলা আমাদের এক করে রেখেছে।
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Link
                  href="/players"
                  className="rounded-xl bg-[#1877F2] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#1877F2]/25 hover:bg-[#166fe5] transition"
                >
                  খেলোয়াড়দের প্রোফাইল দেখুন →
                </Link>
                <Link
                  href="/memories"
                  className="rounded-xl border border-[#ced0d4] bg-[#E4E6EB] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#050505] hover:bg-[#d8dadf] transition"
                >
                  📖 স্মৃতি ও গল্প শুনুন
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 divide-x divide-[#ced0d4] rounded-2xl border border-[#ced0d4] bg-[#F7F8FA] p-4 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#1877F2]">{playersData.length || 211}+</p>
              <p className="text-[11px] font-bold text-[#65676B]">নিবন্ধিত খেলোয়াড়</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#22c55e]">২৪+</p>
              <p className="text-[11px] font-bold text-[#65676B]">টুর্নামেন্ট আসর</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#d97706]">২০১৩–২৬</p>
              <p className="text-[11px] font-bold text-[#65676B]">দীর্ঘ এক যুগের পথচলা</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 All-Time Top 3 MVP Legends */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#1877F2]">
              FCL ঐতিহাসিক র‍্যাঙ্কিং
            </span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-black text-[#050505]">
              👑 সর্বকালের শীর্ষ ৩ MVP তারকা
            </h3>
            <p className="text-xs sm:text-sm text-[#65676B]">
              রান, উইকেট, টুর্নামেন্ট চ্যাম্পিয়নশিপ এবং ব্যক্তিগত পারফরম্যান্সের ভিত্তিতে সেরা ৩ জন লিজেন্ড।
            </p>
          </div>
          <Link
            href="/rankings"
            className="text-xs sm:text-sm font-bold text-[#1877F2] hover:underline shrink-0"
          >
            সম্পূর্ণ MVP তালিকা দেখুন →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {top3Mvp.map((player, idx) => {
            const rank = idx + 1;
            const points = calculateFclPoints(player);

            const badgeData =
              rank === 1
                ? {
                    title: "🥇 স্বর্ণপদক • ১ম স্থান",
                    border: "border-2 border-[#f59e0b] shadow-lg shadow-[#f59e0b]/15",
                    badgeColor: "bg-[#f59e0b] text-white",
                    ptsColor: "text-[#d97706]",
                  }
                : rank === 2
                ? {
                    title: "🥈 রৌপ্যপদক • ২য় স্থান",
                    border: "border border-[#94a3b8] shadow-md",
                    badgeColor: "bg-[#64748b] text-white",
                    ptsColor: "text-[#475569]",
                  }
                : {
                    title: "🥉 ব্রোঞ্জপদক • ৩য় স্থান",
                    border: "border border-[#d97706]/50 shadow-md",
                    badgeColor: "bg-[#b45309] text-white",
                    ptsColor: "text-[#b45309]",
                  };

            return (
              <div
                key={player.name + idx}
                onClick={() => setSelectedPlayer(player)}
                className={`cursor-pointer overflow-hidden rounded-2xl bg-white p-5 transition hover:-translate-y-1 ${badgeData.border}`}
              >
                <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-3">
                  <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase ${badgeData.badgeColor}`}>
                    {badgeData.title}
                  </span>
                  <span className="text-xs font-bold text-[#65676B]">#{rank}</span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#ced0d4] bg-[#F0F2F5]">
                    <img
                      src={`/players/${(player.nickName || "").toLowerCase().trim()}.jpg`}
                      alt={player.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML = '<div class="flex h-full w-full items-center justify-center text-2xl">🏏</div>';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-[#050505] truncate">{player.name}</h4>
                    <p className="text-xs font-semibold text-[#1877F2]">@{player.nickName || player.name}</p>
                    <p className="text-[11px] text-[#65676B]">{player.role || "অল-রাউন্ডার"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#F0F2F5] p-3 text-center">
                  <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wider">সর্বমোট পারফরম্যান্স পয়েন্ট</p>
                  <p className={`mt-0.5 text-2xl font-black ${badgeData.ptsColor}`}>
                    {points.toLocaleString()} <span className="text-xs font-bold text-[#65676B]">পয়েন্ট</span>
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1 text-center text-xs">
                  <div className="rounded-lg border border-[#ced0d4]/50 bg-white p-2">
                    <p className="font-black text-[#050505]">{player.runs}</p>
                    <p className="text-[9px] text-[#65676B]">মোট রান</p>
                  </div>
                  <div className="rounded-lg border border-[#ced0d4]/50 bg-white p-2">
                    <p className="font-black text-[#050505]">{player.wickets}</p>
                    <p className="text-[9px] text-[#65676B]">উইকেট</p>
                  </div>
                  <div className="rounded-lg border border-[#ced0d4]/50 bg-white p-2">
                    <p className="font-black text-[#1877F2]">{player.champion ?? 0}টি</p>
                    <p className="text-[9px] text-[#65676B]">শিরোপা</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#F0F2F5] pt-3 text-xs font-bold text-[#1877F2]">
                  <span>সম্পূর্ণ স্ট্যাট কার্ড দেখুন</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🏆 FCL Record Corner */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#1877F2]">
              এফসিএল ইতিহাস ও মাইলফলক
            </span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-black text-[#050505]">
              🏆 এফসিএল record কর্নার
            </h3>
            <p className="text-xs sm:text-sm text-[#65676B]">
              এক নজরে সর্বকালের সেরা রেকর্ডধারী ও ঐতিহাসিক পরিসংখ্যান।
            </p>
          </div>
          <Link
            href="/records"
            className="text-xs sm:text-sm font-bold text-[#1877F2] hover:underline shrink-0"
          >
            হল অফ ফেম দেখুন →
          </Link>
        </div>

        {/* 4x2 Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            onClick={() => setSelectedPlayer(mostChampionshipPlayer)}
            className="cursor-pointer rounded-2xl border border-[#ced0d4] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#1877F2] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-[#fef3c7] px-2.5 py-0.5 text-[10px] font-black text-[#d97706]">
                  🏆 সর্বাধিক শিরোপা
                </span>
                <span className="text-xs font-bold text-[#65676B]">#০১</span>
              </div>
              <div className="my-4 text-center">
                <p className="text-4xl font-black text-[#d97706]">
                  {mostChampionshipPlayer?.champion || 6}টি
                </p>
                <p className="text-xs text-[#65676B] font-semibold mt-1">টুর্নামেন্ট ট্রফি জয়</p>
              </div>
            </div>
            <div className="border-t border-[#F0F2F5] pt-3">
              <p className="text-[10px] text-[#65676B] font-bold">রেকর্ডধারী:</p>
              <h5 className="text-sm font-black text-[#050505] truncate">{mostChampionshipPlayer?.name || "আরিফ জিয়াদ"}</h5>
            </div>
          </div>

          <div
            onClick={() => setSelectedPlayer(topRunScorer)}
            className="cursor-pointer rounded-2xl border border-[#ced0d4] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#1877F2] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-[#E7F3FF] px-2.5 py-0.5 text-[10px] font-black text-[#1877F2]">
                  🏏 সর্বোচ্চ রান
                </span>
                <span className="text-xs font-bold text-[#65676B]">#০১</span>
              </div>
              <div className="my-4 text-center">
                <p className="text-4xl font-black text-[#1877F2]">
                  {topRunScorer?.runs?.toLocaleString() || "৩,৩১৭"}
                </p>
                <p className="text-xs text-[#65676B] font-semibold mt-1">গড়: {topRunScorer?.runAvg || "১৫.২২"}</p>
              </div>
            </div>
            <div className="border-t border-[#F0F2F5] pt-3">
              <p className="text-[10px] text-[#65676B] font-bold">রেকর্ডধারী:</p>
              <h5 className="text-sm font-black text-[#050505] truncate">{topRunScorer?.name || "জাহিন শাহরিয়ার চৌধুরী"}</h5>
            </div>
          </div>

          <div
            onClick={() => setSelectedPlayer(topWicketTaker)}
            className="cursor-pointer rounded-2xl border border-[#ced0d4] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#1877F2] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-[#fef2f2] px-2.5 py-0.5 text-[10px] font-black text-[#dc2626]">
                  🎯 সর্বোচ্চ উইকেট
                </span>
                <span className="text-xs font-bold text-[#65676B]">#০১</span>
              </div>
              <div className="my-4 text-center">
                <p className="text-4xl font-black text-[#dc2626]">
                  {topWicketTaker?.wickets || 332}টি
                </p>
                <p className="text-xs text-[#65676B] font-semibold mt-1">বোলিং গড়: {topWicketTaker?.wkAvg || "১.৯৯"}</p>
              </div>
            </div>
            <div className="border-t border-[#F0F2F5] pt-3">
              <p className="text-[10px] text-[#65676B] font-bold">রেকর্ডধারী:</p>
              <h5 className="text-sm font-black text-[#050505] truncate">{topWicketTaker?.name || "জাহিদ হাসান"}</h5>
            </div>
          </div>

          <div
            onClick={() => setSelectedPlayer(mostFinalsPlayer)}
            className="cursor-pointer rounded-2xl border border-[#ced0d4] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#1877F2] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-[#e0f2fe] px-2.5 py-0.5 text-[10px] font-black text-[#0284c7]">
                  ⚔️ সর্বাধিক ফাইনাল
                </span>
                <span className="text-xs font-bold text-[#65676B]">#০১</span>
              </div>
              <div className="my-4 text-center">
                <p className="text-4xl font-black text-[#0284c7]">
                  {mostFinalsPlayer?.totalFinal || 9}টি
                </p>
                <p className="text-xs text-[#65676B] font-semibold mt-1">ফাইনাল উপস্থিতি</p>
              </div>
            </div>
            <div className="border-t border-[#F0F2F5] pt-3">
              <p className="text-[10px] text-[#65676B] font-bold">রেকর্ডধারী:</p>
              <h5 className="text-sm font-black text-[#050505] truncate">{mostFinalsPlayer?.name || "তানভীর শাকিব"}</h5>
            </div>
          </div>

          <div
            onClick={() => setSelectedPlayer(mostMatchesPlayer)}
            className="cursor-pointer rounded-2xl border border-[#ced0d4] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#1877F2] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-[#f0fdf4] px-2.5 py-0.5 text-[10px] font-black text-[#16a34a]">
                  ⚡ সর্বাধিক ম্যাচ
                </span>
                <span className="text-xs font-bold text-[#65676B]">#০১</span>
              </div>
              <div className="my-4 text-center">
                <p className="text-4xl font-black text-[#16a34a]">
                  {mostMatchesPlayer?.matches || 171}টি
                </p>
                <p className="text-xs text-[#65676B] font-semibold mt-1">ক্যারিয়ার ম্যাচ</p>
              </div>
            </div>
            <div className="border-t border-[#F0F2F5] pt-3">
              <p className="text-[10px] text-[#65676B] font-bold">রেকর্ডধারী:</p>
              <h5 className="text-sm font-black text-[#050505] truncate">{mostMatchesPlayer?.name || "সাদরুল আনাম"}</h5>
            </div>
          </div>

          <div
            onClick={() => setSelectedPlayer(mostSixesPlayer)}
            className="cursor-pointer rounded-2xl border border-[#ced0d4] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#1877F2] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-[#f5f3ff] px-2.5 py-0.5 text-[10px] font-black text-[#7c3aed]">
                  💥 ছক্কার মেশিন
                </span>
                <span className="text-xs font-bold text-[#65676B]">#০১</span>
              </div>
              <div className="my-4 text-center">
                <p className="text-4xl font-black text-[#7c3aed]">
                  {mostSixesPlayer?.sixes || 176}টি
                </p>
                <p className="text-xs text-[#65676B] font-semibold mt-1">বিশাল ওভার বাউন্ডারি</p>
              </div>
            </div>
            <div className="border-t border-[#F0F2F5] pt-3">
              <p className="text-[10px] text-[#65676B] font-bold">রেকর্ডধারী:</p>
              <h5 className="text-sm font-black text-[#050505] truncate">{mostSixesPlayer?.name || "শাহরিয়ার খোকন"}</h5>
            </div>
          </div>

          <div
            onClick={() => setSelectedPlayer(topHatTrickPlayer)}
            className="cursor-pointer rounded-2xl border border-[#ced0d4] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#1877F2] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-[#fdf2f8] px-2.5 py-0.5 text-[10px] font-black text-[#db2777]">
                  🔥 হ্যাটট্রিক মাস্টার
                </span>
                <span className="text-xs font-bold text-[#65676B]">#০১</span>
              </div>
              <div className="my-4 text-center">
                <p className="text-4xl font-black text-[#db2777]">
                  {topHatTrickPlayer?.hatTricks || 12} বার
                </p>
                <p className="text-xs text-[#65676B] font-semibold mt-1">ক্যারিয়ার হ্যাটট্রিক</p>
              </div>
            </div>
            <div className="border-t border-[#F0F2F5] pt-3">
              <p className="text-[10px] text-[#65676B] font-bold">রেকর্ডধারী:</p>
              <h5 className="text-sm font-black text-[#050505] truncate">{topHatTrickPlayer?.name || "জাহিদ হাসান"}</h5>
            </div>
          </div>

          <div
            onClick={() => setSelectedPlayer(mostMotPlayer)}
            className="cursor-pointer rounded-2xl border border-[#ced0d4] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#1877F2] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-[#fffbeb] px-2.5 py-0.5 text-[10px] font-black text-[#b45309]">
                  ⭐ সেরা খেলোয়াড়
                </span>
                <span className="text-xs font-bold text-[#65676B]">#০১</span>
              </div>
              <div className="my-4 text-center">
                <p className="text-4xl font-black text-[#b45309]">
                  {(mostMotPlayer?.mot || 0) + (mostMotPlayer?.cpot || 0)} বার
                </p>
                <p className="text-xs text-[#65676B] font-semibold mt-1">MOT / CPOT অ্যাওয়ার্ড</p>
              </div>
            </div>
            <div className="border-t border-[#F0F2F5] pt-3">
              <p className="text-[10px] text-[#65676B] font-bold">রেকর্ডধারী:</p>
              <h5 className="text-sm font-black text-[#050505] truncate">{mostMotPlayer?.name || "টুর্নামেন্ট সেরা তারকা"}</h5>
            </div>
          </div>
        </div>

        {/* ব্যানার */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#1877F2] p-6 text-white shadow-lg shadow-[#1877F2]/20">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#bfdbfe]">সামগ্রিক ইতিহাস</span>
            <h4 className="mt-1 text-2xl font-black">
              {totalCommunityRuns ? `${totalCommunityRuns.toLocaleString()}+ রান` : "১,২৭,৩৮৭+ রান"}
            </h4>
            <p className="text-xs text-[#dbeafe] mt-1">
              ২০১৩ সাল থেকে এ পর্যন্ত এফসিএলে নিবন্ধিত খেলোয়াড়দের সম্মিলিত অর্জনের ভাণ্ডার।
            </p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-md px-6 py-3 text-center shrink-0 border border-white/20">
            <p className="text-[10px] uppercase font-bold text-white/80">মোট সংগৃহীত উইকেট</p>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {totalCommunityWickets ? `${totalCommunityWickets.toLocaleString()}` : "১০,৩০৩"}টি
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ced0d4] bg-white px-6 py-8 mt-12 text-center text-xs text-[#65676B]">
        <p className="font-bold text-[#050505]">ফেসবুক ক্রিকেট লীগ (FCL) • ২০১৩–২০২৬</p>
        <p className="mt-1">© ২০২৬ সর্বস্বত্ব সংরক্ষিত | আরিফ জিয়াদ ও এফসিএল পরিবার</p>
      </footer>

      {/* ================================================== */}
      {/* 🌟 DUAL THEME (DARK / LIGHT WHITE) STAT CARD MODAL */}
      {/* ================================================== */}
      {selectedPlayer && (
        <div
          onClick={() => setSelectedPlayer(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className={`relative flex h-[94vh] sm:h-auto sm:max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl transition-colors duration-200 ${
              cardTheme === "dark"
                ? "border-[#38bdf8]/40 bg-[#0f172a] shadow-[#0284c7]/20 text-white"
                : "border-[#ced0d4] bg-[#F0F2F5] shadow-2xl text-[#1c1e21]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* STICKY TOP CONTROLS */}
            <div
              className={`shrink-0 flex items-center justify-between border-b px-3.5 py-2.5 ${
                cardTheme === "dark" ? "border-[#1e293b] bg-[#0b1329]" : "border-[#ced0d4] bg-white"
              }`}
            >
              <div className="flex items-center gap-1.5 rounded-xl bg-black/20 p-1 border border-white/10">
                <button
                  onClick={() => setCardTheme("dark")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    cardTheme === "dark"
                      ? "bg-[#1877F2] text-white shadow font-black"
                      : "text-[#65676B] hover:text-[#050505]"
                  }`}
                >
                  <span>🌙</span>
                  <span>ডার্ক</span>
                </button>
                <button
                  onClick={() => setCardTheme("light")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    cardTheme === "light"
                      ? "bg-[#1877F2] text-white shadow font-black"
                      : "text-[#65676B] hover:text-[#050505]"
                  }`}
                >
                  <span>☀️</span>
                  <span>সাদা (Light)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {downloading ? "সংরক্ষণ হচ্ছে..." : "📥 ডাউনলোড"}
                </button>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border text-xs sm:text-sm font-bold transition ${
                    cardTheme === "dark"
                      ? "border-white/10 bg-[#070b16] text-white hover:bg-white/20"
                      : "border-[#ced0d4] bg-white text-[#050505] hover:bg-[#E4E6EB]"
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* SCROLLABLE CARD BODY */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 sm:p-4">
              <div
                ref={cardRef}
                className={`mx-auto rounded-2xl border p-3.5 sm:p-5 space-y-3.5 transition-colors duration-200 ${
                  cardTheme === "dark"
                    ? "border-[#1e293b] bg-[#0b132b] text-white"
                    : "border-[#ced0d4] bg-white text-[#1c1e21] shadow-xl"
                }`}
              >
                {/* Banner */}
                <div
                  className={`flex items-center justify-between border-b pb-3 ${
                    cardTheme === "dark" ? "border-[#38bdf8]/30" : "border-[#ced0d4]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div
                      className={`flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-xl border p-1 shadow-md shrink-0 ${
                        cardTheme === "dark"
                          ? "border-[#38bdf8]/50 bg-[#080d1a]"
                          : "border-[#1877F2]/40 bg-[#E7F3FF]"
                      }`}
                    >
                      <img
                        src="/fcl-logo.png"
                        alt="FCL"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = '<span class="text-xl">🏏</span>';
                        }}
                      />
                    </div>
                    <div>
                      <h3
                        className={`text-base sm:text-2xl font-black uppercase tracking-wider ${
                          cardTheme === "dark" ? "text-[#e0f2fe]" : "text-[#1877F2]"
                        }`}
                      >
                        Player Statistics Card
                      </h3>
                      <p
                        className={`text-[10px] sm:text-xs font-semibold tracking-wide ${
                          cardTheme === "dark" ? "text-[#38bdf8]" : "text-[#65676B]"
                        }`}
                      >
                        Facebook Cricket League (FCL)
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] sm:text-xs font-bold shrink-0 ${
                      cardTheme === "dark"
                        ? "border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]"
                        : "border-[#1877F2]/30 bg-[#E7F3FF] text-[#1877F2]"
                    }`}
                  >
                    OFFICIAL
                  </span>
                </div>

                {/* Profile Top Row with Full Name & Clear High-Contrast Total Final Box */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div
                    className={`relative flex items-center justify-center rounded-xl border-2 p-1.5 aspect-square ${
                      cardTheme === "dark"
                        ? "border-[#38bdf8]/40 bg-[#070b16]"
                        : "border-[#1877F2]/40 bg-[#F0F2F5]"
                    }`}
                  >
                    <img
                      src={`/players/${(selectedPlayer.nickName || "").toLowerCase().trim()}.jpg`}
                      alt={selectedPlayer.name}
                      className="h-full w-full rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML =
                          '<div class="flex flex-col items-center justify-center h-full text-center"><span class="text-3xl sm:text-4xl">🏏</span><span class="text-[9px] sm:text-[10px] text-[#94a3b8] mt-1">Player</span></div>';
                      }}
                    />
                    {selectedPlayer.nickName && (
                      <div className="absolute bottom-1 right-1 rounded bg-[#1877F2] px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                        {selectedPlayer.nickName}
                      </div>
                    )}
                  </div>

                  <div
                    className={`col-span-2 rounded-xl border p-3 sm:p-3.5 flex flex-col justify-center min-w-0 ${
                      cardTheme === "dark"
                        ? "border-[#1e293b] bg-[#070b16]"
                        : "border-[#ced0d4] bg-[#F7F8FA]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#65676B]">Player Name</span>
                    <h4
                      className={`text-sm sm:text-base md:text-lg font-black break-words leading-tight mt-1 ${
                        cardTheme === "dark" ? "text-white" : "text-[#050505]"
                      }`}
                    >
                      {selectedPlayer.name}
                    </h4>
                    {selectedPlayer.nickName && (
                      <p className="text-xs sm:text-sm font-semibold text-[#1877F2] truncate mt-0.5">
                        @{selectedPlayer.nickName}
                      </p>
                    )}
                    <div
                      className={`mt-2 pt-2 border-t flex items-center justify-between ${
                        cardTheme === "dark" ? "border-[#1e293b]" : "border-[#ced0d4]"
                      }`}
                    >
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#65676B]">Role:</span>
                      <span className="text-xs sm:text-sm font-bold text-[#f59e0b] truncate">
                        {selectedPlayer.role}
                      </span>
                    </div>
                  </div>

                  {/* 🌟 100% CLEAR, HIGH-CONTRAST TOTAL FINAL BOX */}
                  <div
                    className={`col-span-3 sm:col-span-1 rounded-xl border-2 p-2.5 sm:p-3 flex flex-row sm:flex-col justify-between sm:justify-center items-center text-center shadow-sm ${
                      cardTheme === "dark"
                        ? "border-[#f59e0b]/50 bg-gradient-to-b from-[#251804] to-[#120b02]"
                        : "border-[#d97706]/50 bg-gradient-to-b from-[#fffbeb] to-[#fef3c7]"
                    }`}
                  >
                    <span
                      className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
                        cardTheme === "dark" ? "text-[#fbbf24]" : "text-[#92400e]"
                      }`}
                    >
                      TOTAL FINAL
                    </span>
                    <p
                      className={`text-2xl sm:text-4xl font-black my-0.5 ${
                        cardTheme === "dark"
                          ? "text-[#fde047] drop-shadow-[0_0_12px_rgba(253,224,71,0.5)]"
                          : "text-[#b45309]"
                      }`}
                    >
                      {selectedPlayer.totalFinal ?? 0}
                    </p>
                    <span
                      className={`text-[9px] sm:text-[10px] font-extrabold ${
                        cardTheme === "dark" ? "text-[#e2e8f0]" : "text-[#78350f]"
                      }`}
                    >
                      Finals Played
                    </span>
                  </div>
                </div>

                {/* Debut & Tournaments */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-center">
                  <div
                    className={`rounded-xl border p-2.5 flex flex-col justify-center ${
                      cardTheme === "dark"
                        ? "border-[#1e293b] bg-[#070b16]"
                        : "border-[#ced0d4] bg-[#F7F8FA]"
                    }`}
                  >
                    <p className="text-[10px] uppercase font-bold text-[#65676B]">Debut Date</p>
                    <p className="font-extrabold text-[#1877F2] text-xs sm:text-sm mt-1 truncate">
                      {selectedPlayer.debutYear || "—"}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl border p-2.5 flex flex-col justify-center ${
                      cardTheme === "dark"
                        ? "border-[#1e293b] bg-[#070b16]"
                        : "border-[#ced0d4] bg-[#F7F8FA]"
                    }`}
                  >
                    <p className="text-[10px] uppercase font-bold text-[#65676B]">Debut Tournament</p>
                    <p
                      className={`font-extrabold text-xs sm:text-sm mt-1 leading-tight break-words ${
                        cardTheme === "dark" ? "text-white" : "text-[#050505]"
                      }`}
                    >
                      {selectedPlayer.debutTournament || "—"}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl border p-2.5 flex flex-col justify-center ${
                      cardTheme === "dark"
                        ? "border-[#1e293b] bg-[#070b16]"
                        : "border-[#ced0d4] bg-[#F7F8FA]"
                    }`}
                  >
                    <p className="text-[10px] uppercase font-bold text-[#65676B]">Debut Team</p>
                    <p
                      className={`font-extrabold text-xs sm:text-sm mt-1 leading-tight break-words ${
                        cardTheme === "dark" ? "text-white" : "text-[#050505]"
                      }`}
                    >
                      {selectedPlayer.debutTeam || "—"}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl border p-2.5 flex flex-col justify-center ${
                      cardTheme === "dark"
                        ? "border-[#1e293b] bg-[#070b16]"
                        : "border-[#ced0d4] bg-[#F7F8FA]"
                    }`}
                  >
                    <p className="text-[10px] uppercase font-bold text-[#65676B]">Total Tournaments</p>
                    <p className="font-black text-[#16a34a] text-base sm:text-xl mt-0.5">
                      {selectedPlayer.totalTournament ?? 0}
                    </p>
                  </div>
                </div>

                {/* 🌟 ALL-TIME LEAGUE RANKINGS + BIG BOLD MVP POINTS HERO BADGE */}
                <div
                  className={`rounded-2xl border-2 p-3 sm:p-4 text-center shadow-lg ${
                    cardTheme === "dark"
                      ? "border-[#f59e0b]/50 bg-gradient-to-r from-[#1c1203] via-[#2c1c04] to-[#1c1203]"
                      : "border-[#f59e0b] bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fffbeb]"
                  }`}
                >
                  <div
                    className={`flex flex-col sm:flex-row items-center justify-between gap-2 border-b pb-2.5 ${
                      cardTheme === "dark" ? "border-[#f59e0b]/25" : "border-[#f59e0b]/40"
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#d97706] flex items-center gap-1.5">
                      <span>⭐</span>
                      <span>ALL-TIME LEAGUE RANKINGS</span>
                    </p>

                    {/* 🌟 BIGGER, HIGH-CONTRAST MVP BADGE */}
                    <div
                      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 border shadow-md ${
                        cardTheme === "dark"
                          ? "border-[#f59e0b]/60 bg-gradient-to-r from-[#b45309] to-[#d97706] text-white"
                          : "border-[#b45309] bg-gradient-to-r from-[#d97706] to-[#b45309] text-white"
                      }`}
                    >
                      <span className="text-sm">👑</span>
                      <span className="text-xs sm:text-sm font-black tracking-wide">
                        #{getRank(selectedPlayer, "mvp")} MVP
                      </span>
                      <span className="h-3.5 w-px bg-white/40" />
                      <span className="text-xs sm:text-sm font-extrabold text-amber-100">
                        {calculateFclPoints(selectedPlayer).toLocaleString()} Pts
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <div
                      className={`rounded-xl p-2 border ${
                        cardTheme === "dark"
                          ? "bg-black/60 border-[#f59e0b]/25"
                          : "bg-white border-[#f59e0b]/30 shadow-sm"
                      }`}
                    >
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">Runs Rank</p>
                      <p className="text-base sm:text-lg font-black text-[#16a34a] mt-0.5">
                        #{getRank(selectedPlayer, "runs")}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl p-2 border ${
                        cardTheme === "dark"
                          ? "bg-black/60 border-[#f59e0b]/25"
                          : "bg-white border-[#f59e0b]/30 shadow-sm"
                      }`}
                    >
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">Wickets Rank</p>
                      <p className="text-base sm:text-lg font-black text-[#d97706] mt-0.5">
                        #{getRank(selectedPlayer, "wickets")}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl p-2 border ${
                        cardTheme === "dark"
                          ? "bg-black/60 border-[#f59e0b]/25"
                          : "bg-white border-[#f59e0b]/30 shadow-sm"
                      }`}
                    >
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">6s Rank</p>
                      <p className="text-base sm:text-lg font-black text-[#7c3aed] mt-0.5">
                        #{getRank(selectedPlayer, "sixes")}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl p-2 border ${
                        cardTheme === "dark"
                          ? "bg-black/60 border-[#f59e0b]/25"
                          : "bg-white border-[#f59e0b]/30 shadow-sm"
                      }`}
                    >
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">Trophy Rank</p>
                      <p className="text-base sm:text-lg font-black text-[#0284c7] mt-0.5">
                        #{getRank(selectedPlayer, "champion")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div
                    className={`rounded-xl border p-3 sm:p-3.5 space-y-1.5 text-xs sm:text-[13px] ${
                      cardTheme === "dark"
                        ? "border-[#1e293b] bg-[#070b16]"
                        : "border-[#ced0d4] bg-[#F7F8FA]"
                    }`}
                  >
                    <div
                      className={`flex justify-between border-b pb-1.5 ${
                        cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"
                      }`}
                    >
                      <span className="text-[#65676B] font-medium">Total Match:</span>
                      <strong className={`font-extrabold ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>
                        {selectedPlayer.matches}
                      </strong>
                    </div>
                    <div
                      className={`flex justify-between border-b pb-1.5 ${
                        cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"
                      }`}
                    >
                      <span className="text-[#65676B] font-medium">Total Runs & Max:</span>
                      <strong className="text-[#16a34a] font-extrabold">
                        {selectedPlayer.runs}{" "}
                        <span className="text-[#65676B] font-normal">
                          ({selectedPlayer.maxRuns ? selectedPlayer.maxRuns : "—"})
                        </span>
                      </strong>
                    </div>
                    <div
                      className={`flex justify-between border-b pb-1.5 ${
                        cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"
                      }`}
                    >
                      <span className="text-[#65676B] font-medium">Total Wickets & Max:</span>
                      <strong className="text-[#d97706] font-extrabold">
                        {selectedPlayer.wickets}{" "}
                        <span className="text-[#65676B] font-normal">
                          ({selectedPlayer.maxWickets ? selectedPlayer.maxWickets : "—"})
                        </span>
                      </strong>
                    </div>
                    <div
                      className={`flex justify-between border-b pb-1.5 ${
                        cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"
                      }`}
                    >
                      <span className="text-[#65676B] font-medium">Innings / Not Out:</span>
                      <strong className={`font-extrabold ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>
                        {selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}
                      </strong>
                    </div>
                    <div
                      className={`flex justify-between border-b pb-1.5 ${
                        cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"
                      }`}
                    >
                      <span className="text-[#65676B] font-medium">Boundaries (4&apos;s / 6&apos;s):</span>
                      <strong className="font-extrabold">
                        <span className="text-[#0284c7]">{selectedPlayer.fours ?? 0}</span> /{" "}
                        <span className="text-[#7c3aed]">{selectedPlayer.sixes ?? 0}</span>
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#65676B] font-medium">Hat-Trick:</span>
                      <strong className="text-[#db2777] font-extrabold">{selectedPlayer.hatTricks ?? 0}</strong>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl border p-3 sm:p-3.5 space-y-1.5 text-xs sm:text-[13px] ${
                      cardTheme === "dark"
                        ? "border-[#1e293b] bg-[#070b16]"
                        : "border-[#ced0d4] bg-[#F7F8FA]"
                    }`}
                  >
                    <div
                      className={`flex justify-between border-b pb-1.5 ${
                        cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"
                      }`}
                    >
                      <span className="text-[#65676B] font-medium">Batting / Bowling Avg:</span>
                      <strong className={`font-extrabold ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>
                        {selectedPlayer.runAvg} / {selectedPlayer.wkAvg}
                      </strong>
                    </div>
                    <div
                      className={`flex justify-between border-b pb-1.5 ${
                        cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"
                      }`}
                    >
                      <span className="text-[#65676B] font-medium">Champion / Runner-Up:</span>
                      <strong className="font-extrabold">
                        🏆 <span className="text-[#d97706]">{selectedPlayer.champion ?? 0}</span> / 🥈{" "}
                        <span className="text-[#65676B]">{selectedPlayer.runnersUp ?? 0}</span>
                      </strong>
                    </div>
                    <div
                      className={`flex justify-between border-b pb-1.5 ${
                        cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"
                      }`}
                    >
                      <span className="text-[#65676B] font-medium">MOT / CPOT:</span>
                      <strong className="font-extrabold">
                        ⭐ <span className="text-[#7c3aed]">{selectedPlayer.mot ?? 0}</span> /{" "}
                        <span className="text-[#65676B]">{selectedPlayer.cpot ?? 0}</span>
                      </strong>
                    </div>
                    <div
                      className={`flex justify-between border-b pb-1.5 ${
                        cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"
                      }`}
                    >
                      <span className="text-[#65676B] font-medium">MOM / CPOM:</span>
                      <strong className="font-extrabold">
                        🎖️ <span className="text-[#0284c7]">{selectedPlayer.mom ?? 0}</span> /{" "}
                        <span className="text-[#65676B]">{selectedPlayer.cpom ?? 0}</span>
                      </strong>
                    </div>
                    <div
                      className={`flex justify-between border-b pb-1.5 ${
                        cardTheme === "dark" ? "border-[#172033]" : "border-[#ced0d4]"
                      }`}
                    >
                      <span className="text-[#65676B] font-medium">Highest Run Scorer:</span>
                      <strong className={`font-extrabold ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>
                        {selectedPlayer.highestRunScorer ?? 0}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#65676B] font-medium">Top Wicket Taker:</span>
                      <strong className={`font-extrabold ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>
                        {selectedPlayer.topWicketTaker ?? 0}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div
                  className={`flex items-center justify-between border-t pt-2 text-[10px] sm:text-xs ${
                    cardTheme === "dark" ? "border-[#1e293b] text-[#64748b]" : "border-[#ced0d4] text-[#65676B]"
                  }`}
                >
                  <span className="truncate font-medium">
                    Last Played:{" "}
                    <strong className={cardTheme === "dark" ? "text-white" : "text-[#050505]"}>
                      {selectedPlayer.lastPlayed || "—"}
                    </strong>
                  </span>
                  <span className="shrink-0 font-bold">FCL Official Card</span>
                </div>
              </div>
            </div>

            {/* STICKY BOTTOM ACTION BAR */}
            <div
              className={`shrink-0 flex gap-2 border-t p-2.5 sm:p-3 ${
                cardTheme === "dark" ? "border-[#1e293b] bg-[#0b1329]" : "border-[#ced0d4] bg-white"
              }`}
            >
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#1877F2] to-[#0284c7] py-2.5 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                {downloading ? "সংরক্ষণ হচ্ছে..." : `📥 ডাউনলোড (${cardTheme === "dark" ? "ডার্ক" : "সাদা"} কার্ড)`}
              </button>
              <button
                onClick={() => setSelectedPlayer(null)}
                className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                  cardTheme === "dark"
                    ? "border-[#1e293b] bg-[#070b16] text-[#94a3b8] hover:text-white"
                    : "border-[#ced0d4] bg-[#E4E6EB] text-[#050505] hover:bg-[#d8dadf]"
                }`}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}