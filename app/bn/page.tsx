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
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [cardTheme, setCardTheme] = useState<"dark" | "light">("light");
  const [activeTab, setActiveTab] = useState<"card" | "history">("card");
  const [downloading, setDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.players && Array.isArray(data.players)) {
          setPlayersData(data.players);
        } else if (Array.isArray(data)) {
          setPlayersData(data);
        }
        if (data.tournaments && Array.isArray(data.tournaments)) {
          setTournamentsData(data.tournaments);
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

  const top3Mvp = [...playersData]
    .sort((a, b) => calculateFclPoints(b) - calculateFclPoints(a))
    .slice(0, 3);

  const mostChampionshipPlayer = [...playersData].sort((a, b) => (b.champion || 0) - (a.champion || 0))[0];
  const topRunScorer = [...playersData].sort((a, b) => b.runs - a.runs)[0];
  const topWicketTaker = [...playersData].sort((a, b) => b.wickets - a.wickets)[0];
  const mostFinalsPlayer = [...playersData].sort((a, b) => (b.totalFinal || 0) - (a.totalFinal || 0))[0];

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

  return (
    <main className="min-h-screen bg-[#F0F2F5] text-[#1c1e21] font-sans antialiased selection:bg-[#1877F2]/20 selection:text-[#1877F2]">
      {/* Facebook Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#ced0d4] shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          <Link href="/bn" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-md">
              <span className="text-2xl font-black leading-none">f</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-[#1877F2]">ফেসবুক ক্রিকেট লীগ</h1>
              <p className="text-[10px] text-[#65676B] font-semibold">FCL অফিসিয়াল বাংলা পোর্টাল</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/bn" className="rounded-xl bg-[#E7F3FF] px-4 py-2 text-sm font-bold text-[#1877F2]">হোম ফিড</Link>
            <Link href="/players" className="rounded-xl px-4 py-2 text-sm font-bold text-[#65676B] hover:bg-[#F2F2F2]">খেলোয়াড় তালিকা</Link>
            <Link href="/rankings" className="rounded-xl px-4 py-2 text-sm font-bold text-[#65676B] hover:bg-[#F2F2F2]">সেরা একাদশ ও MVP</Link>
            <Link href="/records" className="rounded-xl px-4 py-2 text-sm font-bold text-[#65676B] hover:bg-[#F2F2F2]">রেকর্ডস ও হল অফ ফেম</Link>
            <Link href="/memories" className="rounded-xl px-4 py-2 text-sm font-bold text-[#65676B] hover:bg-[#F2F2F2]">স্মৃতি ও আড্ডা 📖</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 rounded-full border border-[#1e293b] bg-[#020617] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#0f172a]">
              <span>🌙</span> ডার্ক মোড
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4E6EB] md:hidden">
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-[#ced0d4] py-8 sm:py-12">
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
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#050505]">মাঠ পেরিয়ে ক্রিকেটের উন্মাদনা</h2>
              <p className="mt-2 text-sm sm:text-base text-[#65676B]">
                বাংলাদেশের বিভিন্ন জেলা থেকে শুরু করে পৃথিবীর নানা প্রান্তে থাকা ক্রিকেটপ্রেমীদের এক সুতোয় বাঁধার গল্প।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MVP Section */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <h3 className="text-2xl sm:text-3xl font-black text-[#050505] mb-6">👑 সর্বকালের শীর্ষ ৩ MVP তারকা</h3>
        <div className="grid gap-5 md:grid-cols-3">
          {top3Mvp.map((player, idx) => (
            <div
              key={idx}
              onClick={() => { setSelectedPlayer(player); setActiveTab("card"); }}
              className="cursor-pointer rounded-2xl bg-white p-5 border border-[#ced0d4] shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl border bg-[#F0F2F5] overflow-hidden">
                  <img src={`/players/${(player.nickName || "").toLowerCase().trim()}.jpg`} alt={player.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="font-black text-[#050505]">{player.name}</h4>
                  <p className="text-xs text-[#1877F2]">@{player.nickName}</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-[#F0F2F5] p-3 text-center">
                <p className="text-[10px] text-[#65676B] uppercase font-bold">MVP পয়েন্ট</p>
                <p className="text-2xl font-black text-[#d97706]">{calculateFclPoints(player).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🌟 DUAL TAB MODAL (PAGE 1: STAT CARD | PAGE 2: TOURNAMENT BREAKDOWN) */}
      {/* ========================================================================= */}
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
            {/* STICKY TOP CONTROLS & DUAL TABS */}
            <div
              className={`shrink-0 flex flex-wrap items-center justify-between gap-2 border-b px-3.5 py-2.5 ${
                cardTheme === "dark" ? "border-[#1e293b] bg-[#0b1329]" : "border-[#ced0d4] bg-white"
              }`}
            >
              {/* PAGE 1 VS PAGE 2 SWITCHER */}
              <div className="flex items-center gap-1 rounded-xl bg-black/20 p-1 border border-white/10">
                <button
                  onClick={() => setActiveTab("card")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "card"
                      ? "bg-[#1877F2] text-white shadow font-black"
                      : "text-[#65676B] hover:text-[#050505]"
                  }`}
                >
                  <span>🎖️</span>
                  <span>স্ট্যাট কার্ড</span>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === "history"
                      ? "bg-[#1877F2] text-white shadow font-black"
                      : "text-[#65676B] hover:text-[#050505]"
                  }`}
                >
                  <span>📊</span>
                  <span>টুর্নামেন্ট হিস্ট্রি ({playerTournamentHistory.length})</span>
                </button>
              </div>

              {/* CARD THEME SWITCH & CLOSE */}
              <div className="flex items-center gap-2">
                {activeTab === "card" && (
                  <div className="flex items-center gap-1 rounded-xl bg-black/20 p-1 border border-white/10">
                    <button
                      onClick={() => setCardTheme("dark")}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        cardTheme === "dark" ? "bg-[#1877F2] text-white" : "text-[#65676B]"
                      }`}
                    >
                      🌙 ডার্ক
                    </button>
                    <button
                      onClick={() => setCardTheme("light")}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        cardTheme === "light" ? "bg-[#1877F2] text-white font-black" : "text-[#65676B]"
                      }`}
                    >
                      ☀️ সাদা
                    </button>
                  </div>
                )}

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

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 sm:p-4">
              {activeTab === "card" ? (
                /* ========================================= */
                /* TAB 1: STAT CARD (SAME DESIGN) */
                /* ========================================= */
                <div
                  ref={cardRef}
                  className={`mx-auto rounded-2xl border p-3.5 sm:p-5 space-y-3.5 transition-colors duration-200 ${
                    cardTheme === "dark"
                      ? "border-[#1e293b] bg-[#0b132b] text-white"
                      : "border-[#ced0d4] bg-white text-[#1c1e21] shadow-xl"
                  }`}
                >
                  {/* Banner */}
                  <div className={`flex items-center justify-between border-b pb-3 ${cardTheme === "dark" ? "border-[#38bdf8]/30" : "border-[#ced0d4]"}`}>
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className={`flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-xl border p-1 shadow-md shrink-0 ${cardTheme === "dark" ? "border-[#38bdf8]/50 bg-[#080d1a]" : "border-[#1877F2]/40 bg-[#E7F3FF]"}`}>
                        <img src="/fcl-logo.png" alt="FCL" className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <h3 className={`text-base sm:text-2xl font-black uppercase tracking-wider ${cardTheme === "dark" ? "text-[#e0f2fe]" : "text-[#1877F2]"}`}>
                          Player Statistics Card
                        </h3>
                        <p className={`text-[10px] sm:text-xs font-semibold tracking-wide ${cardTheme === "dark" ? "text-[#38bdf8]" : "text-[#65676B]"}`}>
                          Facebook Cricket League (FCL)
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] sm:text-xs font-bold ${cardTheme === "dark" ? "border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]" : "border-[#1877F2]/30 bg-[#E7F3FF] text-[#1877F2]"}`}>
                      OFFICIAL
                    </span>
                  </div>

                  {/* Profile Top Row */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className={`relative flex items-center justify-center rounded-xl border-2 p-1.5 aspect-square ${cardTheme === "dark" ? "border-[#38bdf8]/40 bg-[#070b16]" : "border-[#1877F2]/40 bg-[#F0F2F5]"}`}>
                      <img
                        src={`/players/${(selectedPlayer.nickName || "").toLowerCase().trim()}.jpg`}
                        alt={selectedPlayer.name}
                        className="h-full w-full rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl">🏏</span>';
                        }}
                      />
                      {selectedPlayer.nickName && (
                        <div className="absolute bottom-1 right-1 rounded bg-[#1877F2] px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                          {selectedPlayer.nickName}
                        </div>
                      )}
                    </div>

                    <div className={`col-span-2 rounded-xl border p-3 sm:p-3.5 flex flex-col justify-center min-w-0 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#65676B]">Player Name</span>
                      <h4 className={`text-sm sm:text-base md:text-lg font-black break-words leading-tight mt-1 ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>
                        {selectedPlayer.name}
                      </h4>
                      {selectedPlayer.nickName && (
                        <p className="text-xs sm:text-sm font-semibold text-[#1877F2] truncate mt-0.5">@{selectedPlayer.nickName}</p>
                      )}
                      <div className={`mt-2 pt-2 border-t flex items-center justify-between ${cardTheme === "dark" ? "border-[#1e293b]" : "border-[#ced0d4]"}`}>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#65676B]">Role:</span>
                        <span className="text-xs sm:text-sm font-bold text-[#f59e0b] truncate">{selectedPlayer.role}</span>
                      </div>
                    </div>

                    <div className={`col-span-3 sm:col-span-1 rounded-xl border-2 p-2.5 sm:p-3 flex flex-row sm:flex-col justify-between sm:justify-center items-center text-center shadow-sm ${cardTheme === "dark" ? "border-[#f59e0b]/50 bg-gradient-to-b from-[#251804] to-[#120b02]" : "border-[#d97706]/50 bg-gradient-to-b from-[#fffbeb] to-[#fef3c7]"}`}>
                      <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${cardTheme === "dark" ? "text-[#fbbf24]" : "text-[#92400e]"}`}>
                        TOTAL FINAL
                      </span>
                      <p className={`text-2xl sm:text-4xl font-black my-0.5 ${cardTheme === "dark" ? "text-[#fde047]" : "text-[#b45309]"}`}>
                        {selectedPlayer.totalFinal ?? 0}
                      </p>
                      <span className={`text-[9px] sm:text-[10px] font-extrabold ${cardTheme === "dark" ? "text-[#e2e8f0]" : "text-[#78350f]"}`}>
                        Finals Played
                      </span>
                    </div>
                  </div>

                  {/* Debut & Tournaments */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-center">
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">Debut Date</p>
                      <p className="font-extrabold text-[#1877F2] text-xs sm:text-sm mt-1 truncate">{selectedPlayer.debutYear || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">Debut Tournament</p>
                      <p className={`font-extrabold text-xs sm:text-sm mt-1 leading-tight break-words ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>{selectedPlayer.debutTournament || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">Debut Team</p>
                      <p className={`font-extrabold text-xs sm:text-sm mt-1 leading-tight break-words ${cardTheme === "dark" ? "text-white" : "text-[#050505]"}`}>{selectedPlayer.debutTeam || "—"}</p>
                    </div>
                    <div className={`rounded-xl border p-2.5 ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <p className="text-[10px] uppercase font-bold text-[#65676B]">Total Tournaments</p>
                      <p className="font-black text-[#16a34a] text-base sm:text-xl mt-0.5">{selectedPlayer.totalTournament ?? 0}</p>
                    </div>
                  </div>

                  {/* MVP Badge */}
                  <div className={`rounded-2xl border-2 p-3 sm:p-4 text-center shadow-lg ${cardTheme === "dark" ? "border-[#f59e0b]/50 bg-gradient-to-r from-[#1c1203] via-[#2c1c04] to-[#1c1203]" : "border-[#f59e0b] bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fffbeb]"}`}>
                    <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 border-b pb-2.5 ${cardTheme === "dark" ? "border-[#f59e0b]/25" : "border-[#f59e0b]/40"}`}>
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
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/25" : "bg-white border-[#f59e0b]/30"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#65676B]">Runs Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#16a34a] mt-0.5">#{getRank(selectedPlayer, "runs")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/25" : "bg-white border-[#f59e0b]/30"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#65676B]">Wickets Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#d97706] mt-0.5">#{getRank(selectedPlayer, "wickets")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/25" : "bg-white border-[#f59e0b]/30"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#65676B]">6s Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#7c3aed] mt-0.5">#{getRank(selectedPlayer, "sixes")}</p>
                      </div>
                      <div className={`rounded-xl p-2 border ${cardTheme === "dark" ? "bg-black/60 border-[#f59e0b]/25" : "bg-white border-[#f59e0b]/30"}`}>
                        <p className="text-[10px] uppercase font-bold text-[#65676B]">Trophy Rank</p>
                        <p className="text-base sm:text-lg font-black text-[#0284c7] mt-0.5">#{getRank(selectedPlayer, "champion")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className={`rounded-xl border p-3 sm:p-3.5 space-y-1.5 text-xs sm:text-[13px] ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Total Match:</span>
                        <strong className="font-extrabold">{selectedPlayer.matches}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Total Runs & Max:</span>
                        <strong className="text-[#16a34a] font-extrabold">{selectedPlayer.runs} ({selectedPlayer.maxRuns || "—"})</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Total Wickets & Max:</span>
                        <strong className="text-[#d97706] font-extrabold">{selectedPlayer.wickets} ({selectedPlayer.maxWickets || "—"})</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Boundaries (4&apos;s / 6&apos;s):</span>
                        <strong className="font-extrabold"><span className="text-[#0284c7]">{selectedPlayer.fours}</span> / <span className="text-[#7c3aed]">{selectedPlayer.sixes}</span></strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#65676B]">Career Hat-Trick:</span>
                        <strong className="text-[#db2777] font-extrabold">{selectedPlayer.hatTricks ?? 0}</strong>
                      </div>
                    </div>

                    <div className={`rounded-xl border p-3 sm:p-3.5 space-y-1.5 text-xs sm:text-[13px] ${cardTheme === "dark" ? "border-[#1e293b] bg-[#070b16]" : "border-[#ced0d4] bg-[#F7F8FA]"}`}>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Batting / Bowling Avg:</span>
                        <strong className="font-extrabold">{selectedPlayer.runAvg} / {selectedPlayer.wkAvg}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">Champion / Runner-Up:</span>
                        <strong className="font-extrabold">🏆 {selectedPlayer.champion ?? 0} / 🥈 {selectedPlayer.runnersUp ?? 0}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">MOT / CPOT:</span>
                        <strong className="font-extrabold">⭐ {selectedPlayer.mot ?? 0} / {selectedPlayer.cpot ?? 0}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-[#172033]/50">
                        <span className="text-[#65676B]">MOM / CPOM:</span>
                        <strong className="font-extrabold">🎖️ {selectedPlayer.mom ?? 0} / {selectedPlayer.cpom ?? 0}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#65676B]">Top Scorer / Wicket Taker:</span>
                        <strong className="font-extrabold">{selectedPlayer.highestRunScorer ?? 0} / {selectedPlayer.topWicketTaker ?? 0}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2 text-[10px] text-[#65676B]">
                    <span>Last Played: <strong className="text-white">{selectedPlayer.lastPlayed || "—"}</strong></span>
                    <span className="font-bold">FCL Official Card</span>
                  </div>
                </div>
              ) : (
                /* ========================================= */
                /* TAB 2: TOURNAMENT HISTORY BREAKDOWN */
                /* ========================================= */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ced0d4] pb-3">
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-[#050505] flex items-center gap-2">
                        <span>📊</span>
                        <span>{selectedPlayer.name} এর টুর্নামেন্ট ইতিহাস</span>
                      </h4>
                      <p className="text-xs text-[#65676B] mt-0.5">
                        অংশগ্রহণ করা প্রতিটি আসরের ইন্ডিভিজুয়াল পারফরম্যান্স ব্রেকডাউন
                      </p>
                    </div>
                    <span className="rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/30 px-3 py-1 text-xs font-bold text-[#1877F2]">
                      মোট {playerTournamentHistory.length} টি আসর
                    </span>
                  </div>

                  {playerTournamentHistory.length === 0 ? (
                    <div className="rounded-2xl border border-[#ced0d4] bg-white p-8 text-center text-[#65676B]">
                      কোনো টুর্নামেন্ট রেকর্ড পাওয়া যায়নি
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {playerTournamentHistory.map((t, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-[#ced0d4] bg-white p-4 shadow-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F2F5] pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-[#1877F2] px-2.5 py-0.5 text-xs font-black text-white">
                                {t.tournament}
                              </span>
                              <span className="text-xs font-bold text-[#050505]">{t.team}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {t.chamRu && (
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                                    t.chamRu.toLowerCase().includes("champ")
                                      ? "bg-[#fef3c7] text-[#d97706]"
                                      : "bg-[#F0F2F5] text-[#65676B]"
                                  }`}
                                >
                                  {t.chamRu}
                                </span>
                              )}
                              {t.time && <span className="text-[10px] text-[#65676B]">📅 {t.time}</span>}
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2 text-center text-xs">
                            <div className="rounded-xl bg-[#F0F2F5] p-2">
                              <p className="text-[10px] text-[#65676B] uppercase font-bold">ম্যাচ</p>
                              <p className="font-black text-[#050505] text-sm mt-0.5">{t.matches}</p>
                            </div>
                            <div className="rounded-xl bg-[#F0F2F5] p-2">
                              <p className="text-[10px] text-[#65676B] uppercase font-bold">রান</p>
                              <p className="font-black text-[#16a34a] text-sm mt-0.5">{t.runs}</p>
                            </div>
                            <div className="rounded-xl bg-[#F0F2F5] p-2">
                              <p className="text-[10px] text-[#65676B] uppercase font-bold">উইকেট</p>
                              <p className="font-black text-[#d97706] text-sm mt-0.5">{t.wickets}</p>
                            </div>
                            <div className="rounded-xl bg-[#F0F2F5] p-2">
                              <p className="text-[10px] text-[#65676B] uppercase font-bold">ইনিংস</p>
                              <p className="font-black text-[#050505] text-sm mt-0.5">{t.innings}</p>
                            </div>
                            <div className="rounded-xl bg-[#F0F2F5] p-2">
                              <p className="text-[10px] text-[#65676B] uppercase font-bold">৪ / ৬</p>
                              <p className="font-black text-[#0284c7] text-sm mt-0.5">{t.fours} / {t.sixes}</p>
                            </div>
                            <div className="rounded-xl bg-[#F0F2F5] p-2">
                              <p className="text-[10px] text-[#65676B] uppercase font-bold">অ্যাওয়ার্ড</p>
                              <p className="font-black text-[#7c3aed] text-sm mt-0.5 truncate">
                                {t.motCpot || (t.mom ? `${t.mom}x MOM` : "—")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STICKY BOTTOM ACTION BAR */}
            <div
              className={`shrink-0 flex gap-2 border-t p-2.5 sm:p-3 ${
                cardTheme === "dark" ? "border-[#1e293b] bg-[#0b1329]" : "border-[#ced0d4] bg-white"
              }`}
            >
              {activeTab === "card" ? (
                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#1877F2] to-[#0284c7] py-2.5 text-xs font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {downloading ? "সংরক্ষণ হচ্ছে..." : `📥 ডাউনলোড (${cardTheme === "dark" ? "ডার্ক" : "সাদা"} কার্ড)`}
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab("card")}
                  className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#166fe5]"
                >
                  ← স্ট্যাট কার্ডে ফিরে যান
                </button>
              )}

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