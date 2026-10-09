"use client";

import { useState, useRef, ReactNode } from "react";
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

interface Props {
  selectedPlayer: Player | null;
  onClose: () => void;
  tournamentsData: TournamentRecord[];
  allPlayers: Player[];
}

const THEMES = {
  dark: {
    modal: "border-sky-400/30 bg-[#0B1220] text-slate-100",
    header: "border-slate-700/60 bg-[#0B1220]/95 text-slate-100",
    footer: "border-slate-700/60 bg-[#0B1220]",
    body: "bg-[#060A14]",
    card: "border-slate-700/70 bg-[#0F1729] text-slate-100",
    surface: "border-slate-700/60 bg-[#162036]",
    inset: "border-slate-700/50 bg-[#0A1020]",
    divider: "border-slate-700/60",
    rowLine: "border-slate-800",
    text: "text-slate-50",
    label: "text-slate-400",
    title: "text-sky-200",
    blue: "text-sky-400",
    green: "text-emerald-400",
    amber: "text-amber-400",
    purple: "text-violet-300",
    pink: "text-pink-400",
    gold: "text-yellow-300",
    silver: "text-slate-300",
    segWrap: "border-slate-700 bg-slate-900/70",
    segIdle: "text-slate-300 hover:text-white",
    iconBtn: "border-slate-700 text-slate-300 hover:bg-slate-700/60",
    closeBtn: "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700",
    themeOn: "bg-[#1877F2] text-white shadow",
    themeOff: "text-slate-400 hover:text-white",
    heroBox: "border-amber-400/50 bg-gradient-to-br from-[#2A1D05] via-[#1D1404] to-[#120C02]",
    heroHead: "border-amber-400/25",
    heroTitle: "text-amber-400",
    heroPill: "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-300/40",
    rankBox: "border-amber-400/25 bg-black/40",
    finalBox: "border-amber-400 bg-gradient-to-b from-[#2A1D05] to-[#140D02]",
    finalLbl: "text-amber-300",
    finalNum: "text-yellow-300",
    finalSub: "text-amber-200/80",
    finalRankLbl: "text-amber-300/80",
    finalRankVal: "text-amber-300",
    lastBox: "border-amber-400/40 bg-gradient-to-r from-[#241705] to-[#0F0A03]",
    lastLbl: "text-amber-300",
    lastPill: "bg-amber-400 text-slate-900 border-amber-400",
    tAward: "border-2 border-amber-400/80 bg-gradient-to-r from-[#241804] to-[#0B1220] text-slate-100",
    tNormal: "border border-slate-700/70 bg-[#0F1729] text-slate-100",
    tStrip: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    tDate: "bg-black/30 border-slate-700 text-slate-300",
    thead: "bg-[#162036] text-slate-300",
    keyBlue: "bg-[#162036] text-sky-300",
    keyAmber: "bg-[#241A06] text-amber-300",
    partBlue: "border-sky-400/40",
    partBlueHead: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    partAmber: "border-amber-400/40",
    partAmberHead: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    zebra: "bg-white/[0.025]",
    cardBg: "#0F1729",
  },
  light: {
    modal: "border-slate-300 bg-white text-slate-900",
    header: "border-slate-200 bg-white/95 text-slate-900",
    footer: "border-slate-200 bg-white",
    body: "bg-slate-100",
    card: "border-slate-200 bg-white text-slate-900",
    surface: "border-slate-200 bg-slate-50",
    inset: "border-slate-200 bg-white",
    divider: "border-slate-200",
    rowLine: "border-slate-200",
    text: "text-slate-900",
    label: "text-slate-500",
    title: "text-[#0F4C9E]",
    blue: "text-sky-700",
    green: "text-emerald-700",
    amber: "text-amber-700",
    purple: "text-violet-700",
    pink: "text-pink-700",
    gold: "text-amber-600",
    silver: "text-slate-500",
    segWrap: "border-slate-200 bg-slate-100",
    segIdle: "text-slate-600 hover:text-slate-900",
    iconBtn: "border-slate-300 text-slate-600 hover:bg-slate-100",
    closeBtn: "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200",
    themeOn: "bg-white text-[#1877F2] shadow border border-slate-200",
    themeOff: "text-slate-500 hover:text-slate-900",
    heroBox: "border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50",
    heroHead: "border-amber-300",
    heroTitle: "text-amber-800",
    heroPill: "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-600/30",
    rankBox: "border-amber-300 bg-amber-50/70 shadow-sm text-slate-900",
    finalBox: "border-amber-500 bg-gradient-to-b from-amber-100 to-amber-50",
    finalLbl: "text-amber-900",
    finalNum: "text-amber-800",
    finalSub: "text-amber-900/80",
    finalRankLbl: "text-amber-900/80",
    finalRankVal: "text-amber-900 font-black",
    lastBox: "border-amber-400 bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50",
    lastLbl: "text-amber-800",
    lastPill: "bg-white text-amber-800 border-amber-500",
    tAward: "border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-white text-slate-900",
    tNormal: "border border-slate-200 bg-white text-slate-900",
    tStrip: "border-amber-400/60 bg-amber-100 text-amber-800",
    tDate: "bg-slate-50 border-slate-300 text-slate-700",
    thead: "bg-slate-100 text-slate-600",
    keyBlue: "bg-sky-50 text-sky-800",
    keyAmber: "bg-amber-50 text-amber-800",
    partBlue: "border-sky-300",
    partBlueHead: "border-sky-200 bg-sky-50 text-sky-800",
    partAmber: "border-amber-300",
    partAmberHead: "border-amber-200 bg-amber-50 text-amber-800",
    zebra: "bg-slate-50",
    cardBg: "#FFFFFF",
  },
} as const;

function formatFullMonthDate(val: any): string {
  if (!val) return "";
  const num = Number(val);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[dateInfo.getUTCMonth()]} ${dateInfo.getUTCFullYear()}`;
  }
  const str = String(val).trim();
  return str
    .replace(/^Jan[\s-]/i, "January ")
    .replace(/^Feb[\s-]/i, "February ")
    .replace(/^Mar[\s-]/i, "March ")
    .replace(/^Apr[\s-]/i, "April ")
    .replace(/^May[\s-]/i, "May ")
    .replace(/^Jun[\s-]/i, "June ")
    .replace(/^Jul[\s-]/i, "July ")
    .replace(/^Aug[\s-]/i, "August ")
    .replace(/^Sep[\s-]/i, "September ")
    .replace(/^Oct[\s-]/i, "October ")
    .replace(/^Nov[\s-]/i, "November ")
    .replace(/^Dec[\s-]/i, "December ");
}

export const calculateFclPoints = (p: Player): number => {
  if (!p) return 0;
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

// 🌟 লাইট মোডে ভালোভাবে ফুটার জন্য উন্নত কালার টোকেন সহ এলিট ক্লাব ব্যাজ
function getPlayerEliteClub(p: Player, theme: "dark" | "light") {
  const runs = Number(p.runs) || 0;
  const wickets = Number(p.wickets) || 0;

  if (runs >= 2500 && wickets >= 150) {
    return {
      name: "💎 Diamond All-Rounder Club",
      badge: theme === "light"
        ? "bg-purple-100 text-purple-800 border-purple-300 font-extrabold shadow-sm"
        : "bg-purple-500/20 text-purple-300 border-purple-500/40"
    };
  }
  if (runs >= 2000 && wickets >= 100) {
    return {
      name: "🥇 Gold All-Rounder Club",
      badge: theme === "light"
        ? "bg-blue-100 text-blue-800 border-blue-300 font-extrabold shadow-sm"
        : "bg-blue-500/20 text-blue-300 border-blue-500/40"
    };
  }
  if (runs >= 1000 && wickets >= 50) {
    return {
      name: "🥈 Silver All-Rounder Club",
      badge: theme === "light"
        ? "bg-amber-100 text-amber-900 border-amber-300 font-extrabold shadow-sm"
        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
    };
  }
  if (runs >= 500 && wickets >= 50) {
    return {
      name: "🥉 Bronze All-Rounder Club",
      badge: theme === "light"
        ? "bg-slate-200 text-slate-800 border-slate-300 font-extrabold shadow-sm"
        : "bg-slate-500/20 text-slate-300 border-slate-500/40"
    };
  }
  return null;
}

export default function PlayerCardModal({ selectedPlayer, onClose, tournamentsData, allPlayers }: Props) {
  const [cardTheme, setCardTheme] = useState<"dark" | "light">("dark");
  const [cardModalTab, setCardModalTab] = useState<"card" | "history" | "combined">("card");
  const [downloading, setDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const combinedRef = useRef<HTMLDivElement>(null);

  if (!selectedPlayer) return null;

  const T = THEMES[cardTheme];
  const eliteClub = getPlayerEliteClub(selectedPlayer, cardTheme);

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: T.cardBg,
        style: { width: "750px", maxWidth: "100%", margin: "0 auto" },
      });
      const link = document.createElement("a");
      const safeName = (selectedPlayer.nickName || selectedPlayer.name || "player").toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `fcl-stat-card-${safeName}-${cardTheme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে।");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCombinedPNG = async () => {
    if (!combinedRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(combinedRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: T.cardBg,
        style: { width: "1100px", minWidth: "1100px", maxWidth: "none", margin: "0 auto" },
      });
      const link = document.createElement("a");
      const safeName = (selectedPlayer?.nickName || selectedPlayer?.name || "player").toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `fcl-complete-profile-${safeName}-${cardTheme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("ফুল প্রফাইল ইমেজ ডাউনলোড করতে সমস্যা হয়েছে।");
    } finally {
      setDownloading(false);
    }
  };

  const getRankWithNR = (player: Player, type: "mvp" | "runs" | "wickets" | "sixes" | "fours" | "champion" | "matches" | "finals") => {
    if (!player || allPlayers.length === 0) return "N/R";
    const sorted = [...allPlayers].sort((a, b) => {
      if (type === "mvp") return calculateFclPoints(b) - calculateFclPoints(a);
      if (type === "runs") return b.runs - a.runs;
      if (type === "wickets") return b.wickets - a.wickets;
      if (type === "sixes") return (b.sixes || 0) - (a.sixes || 0);
      if (type === "fours") return (b.fours || 0) - (a.fours || 0);
      if (type === "champion") return (b.champion || 0) - (a.champion || 0);
      if (type === "matches") return b.matches - a.matches;
      if (type === "finals") return (b.totalFinal || 0) - (a.totalFinal || 0);
      return 0;
    });
    const index = sorted.findIndex((p) => p.name === player.name);
    return index !== -1 ? `#${index + 1}` : "N/R";
  };

  const playerTournamentHistory = tournamentsData.filter((t) => {
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
  });

  const getDebutTournament = (p: Player) => {
    if (p.debutTournament && p.debutTournament !== "—" && p.debutTournament !== "") return p.debutTournament;
    if (playerTournamentHistory.length > 0) return playerTournamentHistory[0].tournament;
    return "—";
  };

  const getSafeWkAvg = (p: Player) => {
    if (p.wkAvg && p.wkAvg !== "0.00" && p.wkAvg !== "0") return p.wkAvg;
    if (p.matches > 0 && p.wickets > 0) return (p.wickets / p.matches).toFixed(2);
    return "0.00";
  };

  const tabCls = (active: boolean, gradient = false) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
      active
        ? gradient
          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow"
          : "bg-[#1877F2] text-white shadow"
        : T.segIdle
    }`;

  const Lbl = ({ children }: { children: ReactNode }) => (
    <p className={`text-[10px] uppercase font-bold tracking-wider ${T.label}`}>{children}</p>
  );

  const Line = ({ k, children, last }: { k: string; children: ReactNode; last?: boolean }) => (
    <div className={`flex justify-between gap-2 ${last ? "" : `border-b pb-1.5 ${T.divider}`}`}>
      <span className={`font-semibold ${T.label}`}>{k}</span>
      <strong className="font-black text-right">{children}</strong>
    </div>
  );

  const kv = (k1: string, v1: ReactNode, k2: string, v2: ReactNode, keyCls: string, last = false) => (
    <tr className={last ? "" : `border-b ${T.rowLine}`}>
      <td className={`w-[18%] px-4 py-3 font-bold ${keyCls}`}>{k1}</td>
      <td className="w-[32%] px-4 py-3 font-black">{v1}</td>
      <td className={`w-[18%] px-4 py-3 font-bold ${keyCls}`}>{k2}</td>
      <td className="w-[32%] px-4 py-3 font-black">{v2}</td>
    </tr>
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={`relative flex h-[94vh] sm:h-auto sm:max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl transition-colors duration-200 ${T.modal}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className={`sticky top-0 z-30 shrink-0 border-b px-4 py-3 backdrop-blur-md ${T.header}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className={`flex items-center gap-1 rounded-xl p-1 border ${T.segWrap}`}>
              <button onClick={() => setCardModalTab("card")} className={tabCls(cardModalTab === "card")}>
                <span>🎖️</span>
                <span>Stat Card</span>
              </button>
              <button onClick={() => setCardModalTab("history")} className={tabCls(cardModalTab === "history")}>
                <span>📊</span>
                <span>History ({playerTournamentHistory.length})</span>
              </button>
              <button onClick={() => setCardModalTab("combined")} className={tabCls(cardModalTab === "combined", true)}>
                <span>⚡</span>
                <span>Full Profile (2-in-1 View)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 rounded-xl p-1 border ${T.segWrap}`}>
                <button
                  onClick={() => setCardTheme("dark")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${cardTheme === "dark" ? T.themeOn : T.themeOff}`}
                >
                  🌙 Dark
                </button>
                <button
                  onClick={() => setCardTheme("light")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${cardTheme === "light" ? T.themeOn : T.themeOff}`}
                >
                  ☀️ Light
                </button>
              </div>

              <button onClick={onClose} className={`flex h-8 w-8 items-center justify-center rounded-xl border text-sm font-bold transition ${T.iconBtn}`}>
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className={`flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 ${T.body}`}>
          {/* ---------- TAB 1: STAT CARD ---------- */}
          {cardModalTab === "card" && (
            <div ref={cardRef} className={`mx-auto w-full max-w-2xl space-y-4 rounded-2xl border p-5 sm:p-6 shadow-xl ${T.card}`}>
              {/* Title */}
              <div className={`flex items-center justify-between border-b pb-3 ${T.divider}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1877F2]/15 text-2xl">🏏</div>
                  <div>
                    <h3 className={`text-base sm:text-2xl font-black uppercase tracking-wide ${T.title}`}>Player Statistics Card</h3>
                    <p className={`text-xs font-semibold ${T.label}`}>Facebook Cricket League (FCL)</p>
                  </div>
                </div>
                <span className={`rounded-md border border-amber-500/50 bg-amber-500/10 px-2.5 py-1 text-xs font-bold ${T.amber}`}>OFFICIAL</span>
              </div>

              {/* Profile Row */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                <div className={`flex aspect-square items-center justify-center rounded-xl border-2 p-1.5 text-4xl ${T.surface} ${cardTheme === "dark" ? "!border-sky-400/40" : "!border-sky-300"}`}>
                  🏏
                </div>
                <div className={`col-span-2 flex flex-col justify-center rounded-xl border p-3.5 ${T.surface}`}>
                  <Lbl>Player Name</Lbl>
                  <h4 className={`mt-1 break-words text-base sm:text-lg font-black leading-tight ${T.text}`}>{selectedPlayer.name}</h4>
                  {selectedPlayer.nickName && <p className={`mt-0.5 text-xs font-bold ${T.blue}`}>@{selectedPlayer.nickName}</p>}
                  
                  {eliteClub && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${eliteClub.badge}`}>
                        {eliteClub.name}
                      </span>
                    </div>
                  )}

                  <div className={`mt-2 flex items-center justify-between border-t pt-2 ${T.divider}`}>
                    <span className={`text-[10px] font-bold uppercase ${T.label}`}>Role:</span>
                    <span className={`truncate text-xs font-extrabold ${T.amber}`}>{selectedPlayer.role}</span>
                  </div>
                </div>

                <div className={`col-span-3 sm:col-span-1 rounded-xl border-2 p-2.5 text-center shadow-lg flex flex-col justify-between ${T.finalBox}`}>
                  <div>
                    <span className={`text-[11px] font-black uppercase ${T.finalLbl}`}>TOTAL FINAL</span>
                    <p className={`my-0.5 text-3xl font-black ${T.finalNum}`}>{selectedPlayer.totalFinal ?? 0}</p>
                    <span className={`text-[10px] font-bold ${T.finalSub}`}>Finals Played</span>
                  </div>
                  <div className="mt-2 border-t border-amber-400/30 pt-1">
                    <span className={`text-[9px] font-bold uppercase ${T.finalRankLbl}`}>Rank: </span>
                    <span className={`text-xs ${T.finalRankVal}`}>{getRankWithNR(selectedPlayer, "finals")}</span>
                  </div>
                </div>
              </div>

              {/* Debut */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className={`rounded-xl border p-2.5 ${T.surface}`}>
                  <Lbl>Debut Date</Lbl>
                  <p className={`mt-1 text-xs sm:text-sm font-black ${T.blue}`}>{formatFullMonthDate(selectedPlayer.debutYear) || "—"}</p>
                </div>
                <div className={`rounded-xl border p-2.5 ${T.surface}`}>
                  <Lbl>Debut Tournament</Lbl>
                  <p className={`mt-1 break-words text-xs sm:text-sm font-black ${T.green}`}>{getDebutTournament(selectedPlayer)}</p>
                </div>
                <div className={`rounded-xl border p-2.5 ${T.surface}`}>
                  <Lbl>Debut Team</Lbl>
                  <p className={`mt-1 break-words text-xs sm:text-sm font-black ${T.text}`}>{selectedPlayer.debutTeam || "—"}</p>
                </div>
                <div className={`rounded-xl border p-2.5 ${T.surface}`}>
                  <Lbl>Total Tournaments</Lbl>
                  <p className={`mt-0.5 text-base sm:text-xl font-black ${T.green}`}>{selectedPlayer.totalTournament ?? 0}</p>
                </div>
              </div>

              {/* Rankings */}
              <div className={`rounded-2xl border-2 p-3.5 sm:p-4 text-center shadow-lg ${T.heroBox}`}>
                <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 border-b pb-2.5 ${T.heroHead}`}>
                  <p className={`flex items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-widest ${T.heroTitle}`}>
                    <span>⭐</span> ALL-TIME LEAGUE RANKINGS
                  </p>
                  <div className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 shadow-md ${T.heroPill}`}>
                    <span>👑</span>
                    <span className="text-xs sm:text-sm font-black">{getRankWithNR(selectedPlayer, "mvp")} MVP</span>
                    <span className="h-3.5 w-px bg-white/50" />
                    <span className="text-xs sm:text-sm font-extrabold">{calculateFclPoints(selectedPlayer).toLocaleString()} Pts</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  <div className={`rounded-xl border p-2 ${T.rankBox}`}>
                    <Lbl>Runs Rank</Lbl>
                    <p className={`mt-0.5 text-sm sm:text-base font-black ${T.text}`}>{getRankWithNR(selectedPlayer, "runs")}</p>
                  </div>
                  <div className={`rounded-xl border p-2 ${T.rankBox}`}>
                    <Lbl>Wkts Rank</Lbl>
                    <p className={`mt-0.5 text-sm sm:text-base font-black ${T.text}`}>{getRankWithNR(selectedPlayer, "wickets")}</p>
                  </div>
                  <div className={`rounded-xl border p-2 ${T.rankBox}`}>
                    <Lbl>Trophy Rank</Lbl>
                    <p className={`mt-0.5 text-sm sm:text-base font-black ${T.text}`}>{getRankWithNR(selectedPlayer, "champion")}</p>
                  </div>
                  <div className={`rounded-xl border p-2 ${T.rankBox}`}>
                    <Lbl>Matches Rank</Lbl>
                    <p className={`mt-0.5 text-sm sm:text-base font-black ${T.text}`}>{getRankWithNR(selectedPlayer, "matches")}</p>
                  </div>
                  <div className={`rounded-xl border p-2 ${T.rankBox}`}>
                    <Lbl>6s Rank</Lbl>
                    <p className={`mt-0.5 text-sm sm:text-base font-black ${T.text}`}>{getRankWithNR(selectedPlayer, "sixes")}</p>
                  </div>
                  <div className={`rounded-xl border p-2 ${T.rankBox}`}>
                    <Lbl>4s Rank</Lbl>
                    <p className={`mt-0.5 text-sm sm:text-base font-black ${T.text}`}>{getRankWithNR(selectedPlayer, "fours")}</p>
                  </div>
                </div>
              </div>

              {/* Career Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`space-y-2 rounded-xl border p-3.5 text-xs sm:text-[13px] ${T.surface}`}>
                  <Line k="Total Match:">{selectedPlayer.matches}</Line>
                  <Line k="Total Runs & Max:">
                    <span className={T.green}>
                      {selectedPlayer.runs} ({selectedPlayer.maxRuns || "—"})
                    </span>
                  </Line>
                  <Line k="Total Wickets & Max:">
                    <span className={T.amber}>
                      {selectedPlayer.wickets} ({selectedPlayer.maxWickets || "—"})
                    </span>
                  </Line>
                  <Line k="Innings / Not Out:">
                    {selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}
                  </Line>
                  <Line k="Boundaries (4s / 6s):">
                    <span className={T.blue}>{selectedPlayer.fours ?? 0}</span> / <span className={T.purple}>{selectedPlayer.sixes ?? 0}</span>
                  </Line>
                  <Line k="Career Hat-Trick:" last>
                    <span className={T.pink}>{selectedPlayer.hatTricks ?? 0}</span>
                  </Line>
                </div>

                <div className={`space-y-2 rounded-xl border p-3.5 text-xs sm:text-[13px] ${T.surface}`}>
                  <Line k="Batting / Bowling Avg:">
                    {selectedPlayer.runAvg || "0.00"} / {getSafeWkAvg(selectedPlayer)}
                  </Line>
                  <Line k="Champion / Runner-Up:">
                    🏆 <span className={T.amber}>{selectedPlayer.champion ?? 0}</span> / 🥈 <span className={T.silver}>{selectedPlayer.runnersUp ?? 0}</span>
                  </Line>
                  <Line k="MOT / CPOT:">
                    ⭐ <span className={T.purple}>{selectedPlayer.mot ?? 0}</span> / {selectedPlayer.cpot ?? 0}
                  </Line>
                  <Line k="MOM / CPOM:">
                    🎖️ <span className={T.blue}>{selectedPlayer.mom ?? 0}</span> / {selectedPlayer.cpom ?? 0}
                  </Line>
                  <Line k="Top Scorer / Wicket Taker:" last>
                    <span className={T.gold}>
                      {selectedPlayer.highestRunScorer ?? 0} / {selectedPlayer.topWicketTaker ?? 0}
                    </span>
                  </Line>
                </div>
              </div>

              {/* Last Played */}
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 rounded-xl border-2 p-3 ${T.lastBox}`}>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                  <span className={`text-xs font-black uppercase tracking-wider ${T.lastLbl}`}>Last Played Tournament:</span>
                </div>
                <span className={`rounded-lg border px-3 py-1 text-xs sm:text-sm font-black shadow-sm ${T.lastPill}`}>🏟️ {selectedPlayer.lastPlayed || "—"}</span>
              </div>
            </div>
          )}

          {/* ---------- TAB 2: HISTORY ---------- */}
          {cardModalTab === "history" && (
            <div className="mx-auto max-w-2xl space-y-3.5">
              {playerTournamentHistory.length === 0 ? (
                <div className={`rounded-2xl border p-8 text-center ${T.card} ${T.label}`}>কোনো টুর্নামেন্ট রেকর্ড পাওয়া যায়নি</div>
              ) : (
                playerTournamentHistory.map((t, idx) => {
                  const hasMot = t.motCpot?.toUpperCase() === "MOT";
                  const hasCpot = t.motCpot?.toUpperCase() === "CPOT";
                  const isTopScorer = Number(t.topScorer) === 1;
                  const isTopWicket = Number(t.topWicket) === 1;
                  const hasSpecialAward = hasMot || hasCpot || isTopScorer || isTopWicket;

                  return (
                    <div key={idx} className={`rounded-2xl p-4 transition ${hasSpecialAward ? T.tAward : T.tNormal}`}>
                      <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 ${T.divider}`}>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-[#1877F2] px-3 py-1 text-xs font-black text-white">{t.tournament}</span>
                          <span className="text-sm font-black">{t.team}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {t.chamRu && <span className="rounded-lg bg-amber-500 px-2.5 py-0.5 text-xs font-black text-slate-900">{t.chamRu}</span>}
                          <span className={`rounded-md border px-2.5 py-0.5 text-xs font-extrabold ${T.tDate}`}>📅 {formatFullMonthDate(t.time)}</span>
                        </div>
                      </div>

                      {hasSpecialAward && (
                        <div className={`mt-3 flex flex-wrap items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-bold ${T.tStrip}`}>
                          {hasMot && <span>👑 MOT</span>}
                          {hasCpot && <span>⭐ CPOT</span>}
                          {isTopScorer && <span>🏏 Top Scorer ({t.runs} Runs)</span>}
                          {isTopWicket && <span>🎯 Top Wicket ({t.wickets} Wkts)</span>}
                        </div>
                      )}

                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                        {[
                          { l: "Matches", v: t.matches, c: T.text },
                          { l: "Runs", v: t.runs, c: T.green },
                          { l: "Wkts", v: t.wickets, c: T.amber },
                          { l: "Inn", v: t.innings, c: T.text },
                          { l: "4s/6s", v: `${t.fours}/${t.sixes}`, c: T.blue },
                          { l: "Awards", v: hasMot ? "MOT" : hasCpot ? "CPOT" : "—", c: T.gold },
                        ].map((s) => (
                          <div key={s.l} className={`rounded-lg border p-2 ${T.inset}`}>
                            <p className={`font-semibold ${T.label}`}>{s.l}</p>
                            <p className={`font-bold ${s.c}`}>{s.v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ---------- TAB 3: COMBINED ---------- */}
          {cardModalTab === "combined" && (
            <div className="w-full overflow-x-auto pb-2">
              <div ref={combinedRef} className={`mx-auto w-[1100px] min-w-[1100px] rounded-2xl border p-6 shadow-2xl ${T.card}`}>
                <div className={`flex items-center justify-between border-b pb-4 ${T.divider}`}>
                  <div>
                    <h3 className={`text-xl font-black uppercase tracking-wide ${T.title}`}>Player Complete Statistics</h3>
                    <p className={`mt-1 text-xs font-semibold ${T.label}`}>Facebook Cricket League (FCL) • Complete Information Sheet</p>
                  </div>
                  <div className={`rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-black ${T.amber}`}>OFFICIAL</div>
                </div>

                <div className={`mt-5 overflow-hidden rounded-xl border ${T.partBlue}`}>
                  <div className={`border-b px-4 py-3 ${T.partBlueHead}`}>
                    <h4 className="text-sm font-black uppercase tracking-widest">PART 01 — COMPLETE PLAYER INFORMATION</h4>
                  </div>
                  <table className="w-full border-collapse text-[13px]">
                    <tbody>
                      {kv("Player Name", <span className={T.text}>{selectedPlayer.name}</span>, "Nickname", <span className={T.blue}>{selectedPlayer.nickName ? `@${selectedPlayer.nickName}` : "—"}</span>, T.keyBlue)}
                      {kv("Role", <span className={T.amber}>{selectedPlayer.role || "—"}</span>, "Debut Date", <span className={T.blue}>{formatFullMonthDate(selectedPlayer.debutYear) || "—"}</span>, T.keyBlue)}
                      {kv("Debut Tournament", <span className={T.green}>{getDebutTournament(selectedPlayer)}</span>, "Debut Team", <span className={T.text}>{selectedPlayer.debutTeam || "—"}</span>, T.keyBlue)}
                      {kv("Total Tournaments", <span className={T.green}>{selectedPlayer.totalTournament ?? 0}</span>, "Total Finals", <span className={T.gold}>{selectedPlayer.totalFinal ?? 0}</span>, T.keyBlue)}

                      <tr className={`border-b ${T.rowLine}`}>
                        <td className={`px-4 py-3 font-bold ${T.keyBlue}`}>Last Played Tournament</td>
                        <td colSpan={3} className={`px-4 py-3 font-black ${T.amber}`}>🏟️ {selectedPlayer.lastPlayed || "—"}</td>
                      </tr>

                      {kv("Total Matches", <span className={T.text}>{selectedPlayer.matches}</span>, "Batting / Bowling Avg", <span className={T.text}>{selectedPlayer.runAvg || "0.00"} / {getSafeWkAvg(selectedPlayer)}</span>, T.keyBlue)}
                      {kv("Total Runs & Max", <span className={T.green}>{selectedPlayer.runs} ({selectedPlayer.maxRuns ?? "—"})</span>, "Total Wickets & Max", <span className={T.amber}>{selectedPlayer.wickets} ({selectedPlayer.maxWickets ?? "—"})</span>, T.keyBlue)}
                      {kv(
                        "Innings / Not Out",
                        <span className={T.text}>{selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}</span>,
                        "Boundaries (4s / 6s)",
                        <>
                          <span className={T.blue}>{selectedPlayer.fours ?? 0}</span> / <span className={T.purple}>{selectedPlayer.sixes ?? 0}</span>
                        </>,
                        T.keyBlue
                      )}
                      {kv("Career Hat-Trick", <span className={T.pink}>{selectedPlayer.hatTricks ?? 0}</span>, "FCL MVP Points", <span className={T.gold}>{calculateFclPoints(selectedPlayer).toLocaleString()}</span>, T.keyBlue, true)}
                    </tbody>
                  </table>
                </div>

                <div className={`mt-5 overflow-hidden rounded-xl border ${T.partAmber}`}>
                  <div className={`border-b px-4 py-3 ${T.partAmberHead}`}>
                    <h4 className="text-sm font-black uppercase tracking-widest">PART 02 — RANKINGS, ACHIEVEMENTS & CAREER HONOURS</h4>
                  </div>
                  <table className="w-full border-collapse text-[13px]">
                    <tbody>
                      {kv("MVP Rank", <span className={T.gold}>{getRankWithNR(selectedPlayer, "mvp")} • {calculateFclPoints(selectedPlayer).toLocaleString()} Pts</span>, "Runs Rank", <span className={T.green}>{getRankWithNR(selectedPlayer, "runs")}</span>, T.keyAmber)}
                      {kv("Wickets Rank", <span className={T.amber}>{getRankWithNR(selectedPlayer, "wickets")}</span>, "6s / 4s Rank", <span className={T.purple}>{getRankWithNR(selectedPlayer, "sixes")} / {getRankWithNR(selectedPlayer, "fours")}</span>, T.keyAmber)}
                      {kv("Trophy Rank", <span className={T.blue}>{getRankWithNR(selectedPlayer, "champion")}</span>, "Champion / Runner-Up", <span>🏆 {selectedPlayer.champion ?? 0} / 🥈 {selectedPlayer.runnersUp ?? 0}</span>, T.keyAmber)}
                      {kv("Matches Rank", <span className={T.pink}>{getRankWithNR(selectedPlayer, "matches")}</span>, "Finals Rank", <span className={T.gold}>{getRankWithNR(selectedPlayer, "finals")}</span>, T.keyAmber)}
                      {kv("Top Scorer", <span className={T.gold}>{selectedPlayer.highestRunScorer ?? 0}</span>, "Top Wicket Taker", <span className={T.gold}>{selectedPlayer.topWicketTaker ?? 0}</span>, T.keyAmber, true)}
                    </tbody>
                  </table>
                </div>

                <div className={`mt-5 overflow-hidden rounded-xl border ${T.partBlue}`}>
                  <div className={`border-b px-4 py-3 ${T.partBlueHead}`}>
                    <h4 className="text-sm font-black uppercase tracking-widest">COMPLETE TOURNAMENT HISTORY ({playerTournamentHistory.length})</h4>
                  </div>
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr className={T.thead}>
                        {["#", "Tournament", "Team"].map((h) => (
                          <th key={h} className={`border-b px-3 py-3 text-left ${T.divider}`}>{h}</th>
                        ))}
                        {["Match", "Runs", "Wkt", "Inn", "NO", "4s", "6s", "H/T", "MOT/CPOT", "CH/RU", "Top Scorer", "Top Wkt", "Date"].map((h) => (
                          <th key={h} className={`border-b px-3 py-3 text-center ${T.divider}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {playerTournamentHistory.length > 0 ? (
                        playerTournamentHistory.map((t, idx) => (
                          <tr key={idx} className={`border-b ${T.rowLine} ${idx % 2 === 1 ? T.zebra : ""}`}>
                            <td className={`px-3 py-2.5 ${T.label}`}>{idx + 1}</td>
                            <td className={`px-3 py-2.5 font-bold ${T.blue}`}>{t.tournament || "—"}</td>
                            <td className={`px-3 py-2.5 font-semibold ${T.text}`}>{t.team || "—"}</td>
                            <td className="px-3 py-2.5 text-center">{t.matches}</td>
                            <td className={`px-3 py-2.5 text-center font-bold ${T.green}`}>{t.runs}</td>
                            <td className={`px-3 py-2.5 text-center font-bold ${T.amber}`}>{t.wickets}</td>
                            <td className="px-3 py-2.5 text-center">{t.innings}</td>
                            <td className="px-3 py-2.5 text-center">{t.notOut}</td>
                            <td className={`px-3 py-2.5 text-center ${T.blue}`}>{t.fours}</td>
                            <td className={`px-3 py-2.5 text-center ${T.purple}`}>{t.sixes}</td>
                            <td className={`px-3.5 py-2.5 text-center ${T.pink}`}>{t.hatTrick}</td>
                            <td className={`px-3 py-2.5 text-center font-bold ${T.gold}`}>{t.motCpot || "—"}</td>
                            <td className={`px-3 py-2.5 text-center font-bold ${T.amber}`}>{t.chamRu || "—"}</td>
                            <td className="px-3 py-2.5 text-center">{Number(t.topScorer) === 1 ? "🏏 YES" : "—"}</td>
                            <td className="px-3.5 py-2.5 text-center">{Number(t.topWicket) === 1 ? "🎯 YES" : "—"}</td>
                            <td className={`whitespace-nowrap px-3 py-2.5 text-center ${T.silver}`}>{formatFullMonthDate(t.time)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={16} className={`px-4 py-6 text-center ${T.label}`}>কোনো টুর্নামেন্ট ইতিহাস নেই।</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <div className={`flex shrink-0 gap-2 border-t p-3 ${T.footer}`}>
          {cardModalTab === "card" ? (
            <button onClick={handleDownloadCard} disabled={downloading} className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow hover:bg-[#166fe5] disabled:opacity-60">
              {downloading ? "প্রসেসিং হচ্ছে..." : "📥 ডাউনলোড কার্ড (PNG)"}
            </button>
          ) : cardModalTab === "combined" ? (
            <button onClick={handleDownloadCombinedPNG} disabled={downloading} className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow hover:opacity-90 disabled:opacity-60">
              {downloading ? "ইমেজ তৈরি হচ্ছে..." : "📥 ডাউনলোড ফুল প্রোফাইল (PNG)"}
            </button>
          ) : (
            <button onClick={() => setCardModalTab("card")} className="flex-1 rounded-xl bg-[#1877F2] py-2.5 text-xs font-bold text-white shadow hover:bg-[#166fe5]">
              ← স্ট্যাট কার্ডে ফিরে যান
            </button>
          )}
          <button onClick={onClose} className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${T.closeBtn}`}>
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}