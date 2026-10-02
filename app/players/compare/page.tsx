"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  champion?: number;
  runnersUp?: number;
  totalFinal?: number;
  highestRunScorer?: number;
  topWicketTaker?: number;
  debutYear?: string;
  debutTeam?: string;
  maxRuns?: number;
  maxWickets?: number;
}

function PlayerAvatar({ player }: { player: Player }) {
  const [failed, setFailed] = useState(false);
  const photoPath = `/players/${(player.nickName || "").toLowerCase().trim()}.jpg`;

  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[#1877F2]/40 bg-slate-100 dark:bg-[#111936] flex items-center justify-center">
      {!failed && player.nickName ? (
        <img
          src={photoPath}
          alt={player.name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-xl">🏏</span>
      )}
    </div>
  );
}

export default function PlayerComparePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareCount, setCompareCount] = useState<number>(2);
  const [selectedNames, setSelectedNames] = useState<string[]>(["", ""]);
  const [searchInputs, setSearchInputs] = useState<string[]>(["", ""]);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        let loadedPlayers: Player[] = [];
        if (data.players && Array.isArray(data.players)) {
          loadedPlayers = data.players;
        } else if (Array.isArray(data)) {
          loadedPlayers = data;
        }
        setPlayers(loadedPlayers);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading players for comparison:", err);
        setLoading(false);
      });
  }, []);

  const handleCountChange = (count: number) => {
    setCompareCount(count);
    setSelectedNames((prev) => {
      const updated = [...prev];
      if (updated.length < count) {
        while (updated.length < count) {
          updated.push("");
        }
      } else {
        updated.splice(count);
      }
      return updated;
    });
    setSearchInputs((prev) => {
      const updated = [...prev];
      if (updated.length < count) {
        while (updated.length < count) {
          updated.push("");
        }
      } else {
        updated.splice(count);
      }
      return updated;
    });
  };

  const handleSearchChange = (index: number, val: string) => {
    setSearchInputs((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
    setActiveDropdownIndex(index);
    if (!val.trim()) {
      setSelectedNames((prev) => {
        const updated = [...prev];
        updated[index] = "";
        return updated;
      });
    }
  };

  const handleSelectPlayer = (index: number, player: Player) => {
    setSelectedNames((prev) => {
      const updated = [...prev];
      updated[index] = player.name;
      return updated;
    });
    setSearchInputs((prev) => {
      const updated = [...prev];
      updated[index] = `${player.name} ${player.nickName ? `(@${player.nickName})` : ""}`;
      return updated;
    });
    setActiveDropdownIndex(null);
  };

  const calculateBattingAvg = (p: Player) => {
    const innings = Number(p.innings) || 0;
    const notOut = Number(p.notOut) || 0;
    const runs = Number(p.runs) || 0;
    const dismissals = innings - notOut;
    return dismissals > 0 ? Number((runs / dismissals).toFixed(2)) : innings > 0 ? Number((runs / innings).toFixed(2)) : 0;
  };

  const calculateBowlingAvg = (p: Player) => {
    const matches = Number(p.matches) || 1;
    const wickets = Number(p.wickets) || 0;
    return Number((wickets / matches).toFixed(2));
  };

  const calculateFclPoints = (p: Player) => {
    const runs = Number(p.runs) || 0;
    const sixes = Number(p.sixes) || 0;
    const fours = Number(p.fours) || 0;
    const wickets = Number(p.wickets) || 0;
    const matches = Number(p.matches) || 0;
    const champion = Number(p.champion) || 0;
    const runnersUp = Number(p.runnersUp) || 0;
    const highestRuns = Number(p.highestRunScorer) || 0;
    const topWickets = Number(p.topWicketTaker) || 0;

    return Math.round(
      runs * 1 + sixes * 2 + fours * 1 + wickets * 20 + matches * 2 + champion * 100 + runnersUp * 40 + highestRuns * 30 + topWickets * 30
    );
  };

  const selectedPlayersList = selectedNames
    .map((name) => players.find((p) => p.name === name))
    .filter(Boolean) as Player[];

  const maxValues = {
    points: Math.max(0, ...selectedPlayersList.map(calculateFclPoints)),
    matches: Math.max(0, ...selectedPlayersList.map((p) => Number(p.matches) || 0)),
    tournaments: Math.max(0, ...selectedPlayersList.map((p) => Number(p.totalTournament) || 0)),
    runs: Math.max(0, ...selectedPlayersList.map((p) => Number(p.runs) || 0)),
    battingAvg: Math.max(0, ...selectedPlayersList.map(calculateBattingAvg)),
    maxRuns: Math.max(0, ...selectedPlayersList.map((p) => Number(p.maxRuns ?? p.highestRunScorer) || 0)),
    wickets: Math.max(0, ...selectedPlayersList.map((p) => Number(p.wickets) || 0)),
    bowlingAvg: Math.max(0, ...selectedPlayersList.map(calculateBowlingAvg)),
    maxWickets: Math.max(0, ...selectedPlayersList.map((p) => Number(p.maxWickets ?? p.topWicketTaker) || 0)),
    champion: Math.max(0, ...selectedPlayersList.map((p) => Number(p.champion) || 0)),
    totalFinal: Math.max(0, ...selectedPlayersList.map((p) => Number(p.totalFinal) || 0)),
  };

  // 🌟 ডিপ পারফরম্যান্স অ্যানালিসিস ও ফিগার ভিত্তিক কমেন্ট জেনারেটর
  let auctionAnalysis = null;
  if (selectedPlayersList.length > 1) {
    const scoredPlayers = selectedPlayersList.map((p) => {
      const pts = calculateFclPoints(p);
      const finals = Number(p.totalFinal) || 0;
      const champs = Number(p.champion) || 0;
      const tTour = Number(p.totalTournament) || 1;
      const batAvg = calculateBattingAvg(p);
      const matches = Number(p.matches) || 1;
      const runs = Number(p.runs) || 0;
      const wickets = Number(p.wickets) || 0;

      const impactScore = pts + (finals * 50) + (champs * 80) + (batAvg * 15) + ((finals / tTour) * 40);
      return { player: p, impactScore, batAvg, finals, champs, matches, runs, wickets, pts };
    });

    scoredPlayers.sort((a, b) => b.impactScore - a.impactScore);

    const first = scoredPlayers[0];
    const second = scoredPlayers[1];

    const getReasonText = (item: typeof first) => {
      const p = item.player;
      return `${p.name} (${p.matches} ম্যাচে ${item.runs} রান, এভারেজ ${item.batAvg}, উইকেট ${item.wickets}টি এবং ${item.finals}টি ফাইনাল ও ${item.champs}টি চ্যাম্পিয়নশিপ) তার ধারাবাহিকতা এবং ম্যাচ উইনিং ইমপ্যাক্টের কারণে সেরা পছন্দে রয়েছেন।`;
    };

    auctionAnalysis = {
      first: {
        name: first.player.name,
        desc: getReasonText(first),
      },
      second: {
        name: second.player.name,
        desc: getReasonText(second),
      },
    };
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white pb-20 selection:bg-[#1877F2]/30">
      
      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-[#1e293b] pb-6">
          <div>
            <Link href="/players" className="text-xs font-bold text-[#1877F2] hover:underline">
              ← Player Directory-এ ফিরে যান
            </Link>
            <h1 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight">
              ⚔️ FCL Player Comparison Hub
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-[#94a3b8]">
              অকশনের আগে খেলোয়াড়দের পারফরম্যান্স পাশাপাশি তুলনা করে সেরা স্কোয়াড গড়ে তুলুন।
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-[#1e293b] p-1.5 rounded-2xl shadow-sm">
            <span className="text-xs font-bold px-2 text-slate-500">তুলনা করুন:</span>
            {[2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => handleCountChange(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  compareCount === num
                    ? "bg-[#1877F2] text-white shadow-md shadow-[#1877F2]/25"
                    : "text-slate-600 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#172033]"
                }`}
              >
                {num} জন
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm font-semibold text-[#60a5fa] animate-pulse">
              Loading player comparison data...
            </div>
          </div>
        ) : (
          <div>
            {/* Player Search Input Boxes */}
            <div className={`grid gap-4 mb-8`} style={{ gridTemplateColumns: `repeat(${compareCount}, minmax(0, 1fr))` }}>
              {Array.from({ length: compareCount }).map((_, idx) => {
                const query = (searchInputs[idx] || "").toLowerCase().trim();
                const matchedPlayers = query
                  ? players.filter(
                      (p) =>
                        p.name.toLowerCase().includes(query) ||
                        (p.nickName && p.nickName.toLowerCase().includes(query))
                    )
                  : [];

                return (
                  <div key={idx} className="relative bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-[#1e293b] p-4 rounded-2xl shadow-sm">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">
                      খেলোয়াড় #{idx + 1} (নাম লিখে খুঁজুন)
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: Faisal, Nur..."
                      value={searchInputs[idx] || ""}
                      onChange={(e) => handleSearchChange(idx, e.target.value)}
                      onFocus={() => setActiveDropdownIndex(idx)}
                      className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-[#1e293b] text-xs font-bold rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-[#1877F2]"
                    />

                    {/* Autocomplete Suggestion Dropdown */}
                    {activeDropdownIndex === idx && matchedPlayers.length > 0 && (
                      <div className="absolute left-4 right-4 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#080d17] shadow-xl">
                        {matchedPlayers.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() => handleSelectPlayer(idx, p)}
                            className="cursor-pointer px-3 py-2 text-xs font-bold hover:bg-[#1877F2]/20 border-b border-slate-100 dark:border-[#172033] last:border-none flex items-center justify-between"
                          >
                            <span>{p.name}</span>
                            {p.nickName && <span className="text-[10px] text-slate-400">@{p.nickName}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Comparison Side-by-Side Cards */}
            <div className={`grid gap-4 overflow-x-auto`} style={{ gridTemplateColumns: `repeat(${compareCount}, minmax(260px, 1fr))` }}>
              {Array.from({ length: compareCount }).map((_, idx) => {
                const playerName = selectedNames[idx];
                const player = players.find((p) => p.name === playerName);

                if (!player) {
                  return (
                    <div key={idx} className="flex h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-[#1e293b] bg-slate-50/50 dark:bg-[#0b1220]/50 p-6 text-center">
                      <span className="text-3xl mb-2">👤</span>
                      <p className="text-xs font-semibold text-slate-500">ওপরের বক্সে খেলোয়াড়ের নাম লিখে সিলেক্ট করুন</p>
                    </div>
                  );
                }

                const points = calculateFclPoints(player);
                const batAvg = calculateBattingAvg(player);
                const bowlAvg = calculateBowlingAvg(player);

                return (
                  <div key={idx} className="flex flex-col rounded-3xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0b1220] p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#1877F2]" />

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#172033] pb-4">
                      <PlayerAvatar player={player} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-black truncate">{player.name}</h3>
                        {player.nickName && <p className="text-[11px] text-slate-500 dark:text-[#94a3b8]">@{player.nickName}</p>}
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#1877F2]/10 text-[#60a5fa] text-[10px] font-bold border border-[#1877F2]/30">
                          {player.role || "Player"}
                        </span>
                      </div>
                    </div>

                    {/* Stats List */}
                    <div className="mt-5 space-y-3 text-xs">
                      <StatRow label="FCL Points" value={`${points.toLocaleString()} pts`} isBest={selectedPlayersList.length > 1 && points === maxValues.points && points > 0} highlight />
                      <StatRow label="Matches Played" value={player.matches ?? 0} isBest={selectedPlayersList.length > 1 && (Number(player.matches) || 0) === maxValues.matches && maxValues.matches > 0} />
                      <StatRow label="Tournaments" value={player.totalTournament ?? 0} isBest={selectedPlayersList.length > 1 && (Number(player.totalTournament) || 0) === maxValues.tournaments && maxValues.tournaments > 0} />
                      <StatRow label="Total Runs" value={player.runs ?? 0} isBest={selectedPlayersList.length > 1 && (Number(player.runs) || 0) === maxValues.runs && maxValues.runs > 0} />
                      <StatRow label="Batting Avg" value={batAvg} isBest={selectedPlayersList.length > 1 && batAvg === maxValues.battingAvg && maxValues.battingAvg > 0} />
                      <StatRow label="Max Runs" value={player.maxRuns ?? player.highestRunScorer ?? 0} isBest={selectedPlayersList.length > 1 && (Number(player.maxRuns ?? player.highestRunScorer) || 0) === maxValues.maxRuns && maxValues.maxRuns > 0} />
                      <StatRow label="Boundaries (4s / 6s)" value={`${player.fours ?? 0} / ${player.sixes ?? 0}`} />
                      <StatRow label="Total Wickets" value={player.wickets ?? 0} isBest={selectedPlayersList.length > 1 && (Number(player.wickets) || 0) === maxValues.wickets && maxValues.wickets > 0} amber />
                      <StatRow label="Bowling Avg (W/M)" value={bowlAvg} isBest={selectedPlayersList.length > 1 && bowlAvg === maxValues.bowlingAvg && maxValues.bowlingAvg > 0} amber />
                      <StatRow label="Max Wickets" value={player.maxWickets ?? player.topWicketTaker ?? 0} isBest={selectedPlayersList.length > 1 && (Number(player.maxWickets ?? player.topWicketTaker) || 0) === maxValues.maxWickets && maxValues.maxWickets > 0} amber />
                      <StatRow label="Finals / Champion" value={`${player.totalFinal ?? 0} / ${player.champion ?? 0}`} isBest={selectedPlayersList.length > 1 && (Number(player.totalFinal) || 0) === maxValues.totalFinal && maxValues.totalFinal > 0} />
                      <StatRow label="Runners-Up" value={player.runnersUp ?? 0} />
                      <StatRow label="Debut Team" value={player.debutTeam || "N/A"} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 🌟 Advanced AI / Auction Analysis Summary with Stats Figures */}
            {auctionAnalysis && (
              <div className="mt-8 rounded-3xl border border-amber-400/50 bg-gradient-to-r from-amber-500/10 via-[#1877F2]/10 to-transparent p-6 sm:p-7 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-xl">
                    🏆
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-amber-500 dark:text-amber-400">
                      অকশন অ্যানালিসিস ও পারফরম্যান্স ফিগার সামারি
                    </h3>
                    <p className="text-xs text-slate-400">রান, উইকেট, ফাইনাল ও এভারেজের নিখুঁত পরিসংখ্যানভিত্তিক মূল্যায়ন</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* ১ম চয়েজ */}
                  <div className="rounded-2xl border border-emerald-500/40 bg-white/90 dark:bg-[#030714]/90 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase">
                        🎯 ১ম চয়েজ (Primary Pick)
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                        {auctionAnalysis.first.name}
                      </h4>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-[#cbd5e1]">
                      {auctionAnalysis.first.desc}
                    </p>
                  </div>

                  {/* ২য় চয়েজ */}
                  <div className="rounded-2xl border border-blue-500/40 bg-white/90 dark:bg-[#030714]/90 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#1877F2] text-white text-[10px] font-black uppercase">
                        ⚡ ২য় চয়েজ (Backup / Value Pick)
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-blue-600 dark:text-[#60a5fa]">
                        {auctionAnalysis.second.name}
                      </h4>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-[#cbd5e1]">
                      {auctionAnalysis.second.desc}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatRow({ label, value, highlight, amber, isBest }: { label: string; value: string | number; highlight?: boolean; amber?: boolean; isBest?: boolean }) {
  const valueColor = isBest
    ? "text-emerald-500 dark:text-emerald-400 font-black text-xs sm:text-sm bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse"
    : highlight 
    ? "text-[#1877F2] dark:text-[#60a5fa] font-black text-sm" 
    : amber 
    ? "text-amber-600 dark:text-amber-400 font-bold" 
    : "text-slate-900 dark:text-white font-bold";

  return (
    <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e293b] pb-2">
      <span className="text-slate-500 dark:text-[#94a3b8]">{label}</span>
      <span className={valueColor}>{value} {isBest && "🔥"}</span>
    </div>
  );
}