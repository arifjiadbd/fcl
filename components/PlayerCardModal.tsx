"use client";

import { useState, useRef, useEffect, ReactNode, useMemo } from "react";
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
  photo?: string;
  photoUrl?: string;
  birthday?: string;
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

interface Teammate {
  name: string;
  tours: string[];
  years: string[];
  byYear: { year: string; items: { name: string; month: string }[] }[];
  shared: number;
  photo: string;
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
    rankBox: "border-amber-400/25 bg-black/40 text-slate-100",
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
    heroTitle: "text-amber-900",
    heroPill: "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-600/30",
    rankBox: "border-amber-300 bg-white shadow-sm text-slate-900",
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

const FR = {
  dark: {
    bg: "linear-gradient(135deg,#0b1230 0%,#1b1040 48%,#32122e 100%)",
    solid: "#0b1230",
    card: "rgba(255,255,255,0.07)",
    cardBorder: "rgba(255,255,255,0.15)",
    shadow: "0 2px 10px rgba(0,0,0,0.25)",
    text: "#f8fafc",
    sub: "#b4bfd6",
    accent: "#fbbf24",
    pink: "#f472b6",
    sky: "#38bdf8",
    chipBg: "rgba(251,191,36,0.16)",
    chipText: "#fde68a",
    chipBorder: "rgba(251,191,36,0.45)",
    tile: "rgba(255,255,255,0.08)",
    dot: "rgba(255,255,255,0.08)",
    blob1: "rgba(244,114,182,0.30)",
    blob2: "rgba(56,189,248,0.26)",
    divider: "rgba(255,255,255,0.16)",
    best: "rgba(251,191,36,0.20)",
  },
  light: {
    bg: "linear-gradient(135deg,#fff7ed 0%,#fdf2f8 50%,#eff6ff 100%)",
    solid: "#fff7ed",
    card: "#ffffff",
    cardBorder: "#efd9c6",
    shadow: "0 2px 8px rgba(120,53,15,0.10)",
    text: "#1e1b2e",
    sub: "#4b5563",
    accent: "#b45309",
    pink: "#be185d",
    sky: "#0369a1",
    chipBg: "#fef3c7",
    chipText: "#92400e",
    chipBorder: "#f59e0b",
    tile: "#ffffff",
    dot: "rgba(190,24,93,0.09)",
    blob1: "rgba(244,114,182,0.32)",
    blob2: "rgba(56,189,248,0.30)",
    divider: "#ead7c6",
    best: "#fef3c7",
  },
} as const;

const BUDDY_COLORS = {
  dark: ["#fbbf24", "#f472b6", "#38bdf8", "#34d399", "#c084fc", "#fb923c", "#f87171", "#a3e635"],
  light: ["#b45309", "#be185d", "#0369a1", "#047857", "#7e22ce", "#c2410c", "#b91c1c", "#4d7c0f"],
} as const;

type BoardLayout = "showcase" | "grid" | "dense";

const LAYOUT_CFG = {
  showcase: { w: 1080, cols: 2, av: 58, nm: 17, yr: 12, cardPad: 14, gap: 12, pad: 36, k: 1 },
  grid: { w: 1320, cols: 3, av: 44, nm: 14, yr: 11, cardPad: 11, gap: 10, pad: 32, k: 0.92 },
  dense: { w: 1640, cols: 4, av: 34, nm: 12, yr: 10, cardPad: 8, gap: 8, pad: 28, k: 0.8 },
} as const;

const pickLayout = (n: number): BoardLayout => (n <= 12 ? "showcase" : n <= 36 ? "grid" : "dense");

const PLACEHOLDER = "/FCL Cricket Avatar Placeholder.jpg";

// মোবাইল স্ট্যাট কার্ডের ফিক্সড ডিজাইন সাইজ (4:5)
const M_W = 440;
const M_H = 550;

function extractYear(val: any): string {
  if (val === undefined || val === null || val === "") return "";
  const num = Number(val);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    return String(new Date(Math.floor(num - 25569) * 86400 * 1000).getUTCFullYear());
  }
  const s = String(val);
  const m4 = s.match(/\b(19|20)\d{2}\b/);
  if (m4) return m4[0];
  const m2 = s.match(/[-\/\s'’](\d{2})\s*$/);
  if (m2) return "20" + m2[1];
  return "";
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function extractMonthIdx(val: any): number {
  if (val === undefined || val === null || val === "") return -1;
  const num = Number(val);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    return new Date(Math.floor(num - 25569) * 86400 * 1000).getUTCMonth();
  }
  const s = String(val);
  const named = s.match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i);
  if (named) return MONTH_SHORT.findIndex((m) => m.toLowerCase() === named[0].toLowerCase());
  const a = s.match(/\b(?:19|20)\d{2}[-\/](\d{1,2})\b/);
  if (a && +a[1] >= 1 && +a[1] <= 12) return +a[1] - 1;
  const b = s.match(/\b(\d{1,2})[-\/](?:19|20)\d{2}\b/);
  if (b && +b[1] >= 1 && +b[1] <= 12) return +b[1] - 1;
  return -1;
}

function FriendBoard({
  colsOverride, sortLabel, mode, list, total, tourCount, span, bestList, theme, playerName, nick, playerPhoto,
}: {
  colsOverride?: number;
  sortLabel: string;
  mode: "preview" | BoardLayout;
  list: Teammate[];
  total: number;
  tourCount: number;
  span: string;
  bestList: Teammate[];
  theme: "dark" | "light";
  playerName: string;
  nick?: string;
  playerPhoto: string;
}) {
  const F = FR[theme];
  const prev = mode === "preview";
  const cfg = LAYOUT_CFG[prev ? "showcase" : mode];
  const cols = colsOverride ?? (!prev && mode === "dense" && total > 96 ? 5 : cfg.cols);
  const boardW = cols >= 5 ? 1800 : cfg.w;
  const k = cfg.k;
  const dense = mode === "dense";

  const buddyPalette = BUDDY_COLORS[theme];
  const buddyColor = (i: number) => buddyPalette[i % buddyPalette.length];

  const buddyChars = bestList.reduce((s, b) => s + b.name.length + 2, 0);
  const buddyFont =
    bestList.length <= 1
      ? (buddyChars > 16 ? 16 : 19) * k
      : Math.max(9, Math.min(18, Math.round(420 / (buddyChars + 10) + 6))) * k;

  const Logo = ({ size }: { size: number }) => (
    <img
      src="/fcl-logo.png"
      alt="FCL"
      crossOrigin="anonymous"
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
      onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
    />
  );

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: prev ? "100%" : boardW,
        padding: prev ? "clamp(16px,3vw,32px)" : cfg.pad,
        background: F.bg,
        color: F.text,
        borderRadius: prev ? 24 : 0,
        border: prev ? `1px solid ${F.cardBorder}` : "none",
      }}
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${F.dot} 1.5px, transparent 1.5px)`, backgroundSize: "22px 22px" }} />
      <div aria-hidden style={{ position: "absolute", top: -120, left: -100, width: 380, height: 380, borderRadius: "50%", background: `radial-gradient(circle, ${F.blob1}, transparent 70%)` }} />
      <div aria-hidden style={{ position: "absolute", bottom: -140, right: -100, width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle, ${F.blob2}, transparent 70%)` }} />
      <div aria-hidden style={{ position: "absolute", top: 18, right: 26, fontSize: 64, opacity: 0.12 }}>🤝</div>
      <div aria-hidden style={{ position: "absolute", bottom: 90, left: 20, fontSize: 48, opacity: 0.1 }}>❤️</div>

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 * k, minWidth: 0 }}>
            <Logo size={Math.round(64 * k)} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11 * k + 1, fontWeight: 800, letterSpacing: 2, color: F.accent, textTransform: "uppercase" }}>
                FCL • Friendship Wall
              </p>
              <h3 style={{ margin: "2px 0 0", fontWeight: 900, lineHeight: 1.15, fontSize: prev ? "clamp(19px,4.4vw,30px)" : 30 * k, color: F.text }}>
                Teammates & Friendship History
              </h3>
              <p style={{ margin: "3px 0 0", fontSize: 12 * k + 1, color: F.sub, fontWeight: 600 }}>Facebook Cricket League (FCL)</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 * k + 2, padding: "8px 14px 8px 8px", borderRadius: 999, background: F.tile, border: `1px solid ${F.cardBorder}`, boxShadow: F.shadow }}>
            <img
              src={playerPhoto}
              alt={playerName}
              crossOrigin="anonymous"
              style={{ width: 50 * k + 4, height: 50 * k + 4, borderRadius: "50%", objectFit: "cover", border: `2px solid ${F.accent}` }}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
            />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 15 * k + 1, fontWeight: 900, color: F.text }}>{playerName}</p>
              <p style={{ margin: 0, fontSize: 11 * k + 1, fontWeight: 700, color: F.sky }}>
                {nick ? `@${nick}` : "FCL Player"}{span ? `  •  📅 ${span}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div style={{ height: 1, margin: `${16 * k}px 0`, background: F.divider }} />

        <div
          style={{
            display: "grid",
            gap: cfg.gap,
            alignItems: "stretch",
            gridTemplateColumns: prev
              ? "repeat(auto-fit,minmax(150px,1fr))"
              : "minmax(0,1fr) minmax(0,1fr) minmax(0,1.7fr)",
          }}
        >
          {[
            { icon: "🤝", label: "মোট সতীর্থ", value: String(total), sub: "ভিন্ন ভিন্ন প্লেয়ার", color: F.accent },
            { icon: "🏆", label: "খেলা টুর্নামেন্ট", value: String(tourCount), sub: span ? `সময়কাল ${span}` : "FCL ক্যারিয়ার", color: F.sky },
          ].map((s) => (
            <div key={s.label} style={{ padding: dense ? "8px 12px" : "12px 16px", borderRadius: 14, background: F.tile, border: `1px solid ${F.cardBorder}`, boxShadow: F.shadow, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11 * k + 1, fontWeight: 800, color: F.sub }}>{s.icon} {s.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 28 * k, fontWeight: 900, lineHeight: 1.15, color: s.color }}>{s.value}</p>
              <p style={{ margin: "1px 0 0", fontSize: 11 * k + 1, fontWeight: 600, color: F.sub }}>{s.sub}</p>
            </div>
          ))}

          <div style={{ padding: dense ? "8px 12px" : "12px 16px", borderRadius: 14, background: F.tile, border: `1px solid ${F.cardBorder}`, boxShadow: F.shadow, minWidth: 0, overflow: "hidden" }}>
            <p style={{ margin: 0, fontSize: 11 * k + 1, fontWeight: 800, color: F.sub }}>
              👑 {bestList.length > 1 ? "Best Buddies" : "Best Buddy"}
            </p>

            {bestList.length === 0 ? (
              <p style={{ margin: "2px 0 0", fontSize: 19 * k, fontWeight: 900, color: F.pink }}>—</p>
            ) : (
              <div
                style={{
                  margin: "3px 0 0",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "2px 8px",
                  maxHeight: (dense ? 54 : 76) * k + 10,
                  overflow: "hidden",
                }}
              >
                {bestList.map((b, i) => (
                  <span
                    key={b.name}
                    style={{
                      fontSize: buddyFont,
                      fontWeight: 900,
                      lineHeight: 1.2,
                      color: buddyColor(i),
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.name}
                    {i < bestList.length - 1 ? <span style={{ color: F.sub, fontWeight: 700 }}>,</span> : null}
                  </span>
                ))}
              </div>
            )}

            <p style={{ margin: "2px 0 0", fontSize: 11 * k + 1, fontWeight: 600, color: F.sub }}>
              {bestList.length > 0 ? `${bestList[0].shared}টি টুর্নামেন্ট একসাথে` : "পর্যাপ্ত ডাটা নেই"}
            </p>
          </div>
        </div>

        <div style={{ marginTop: 16 * k + 2 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 6, marginBottom: 8, fontSize: 11 * k + 1, fontWeight: 800, color: F.sub }}>
            <span>👥 সতীর্থ তালিকা ({list.length} জন)</span>
            <span style={{ color: F.accent }}>↕ {sortLabel}</span>
          </div>
          {list.length === 0 ? (
            <div style={{ padding: 36, textAlign: "center", borderRadius: 14, background: F.tile, border: `1px dashed ${F.cardBorder}`, color: F.sub, fontWeight: 700 }}>
              কোনো সতীর্থ পাওয়া যায়নি।
            </div>
          ) : (
            <div style={{ display: "grid", gap: cfg.gap, gridTemplateColumns: prev ? "repeat(auto-fill,minmax(250px,1fr))" : `repeat(${cols},minmax(0,1fr))` }}>
              {list.map((tm) => {
                const bestIdx = bestList.findIndex((b) => b.name === tm.name);
                const isBest = bestIdx !== -1;
                const bColor = isBest ? buddyColor(bestIdx) : F.pink;
                return (
                  <div
                    key={tm.name}
                    style={{
                      display: "flex", alignItems: "center", gap: cfg.cardPad, padding: cfg.cardPad, borderRadius: 14,
                      background: isBest ? F.best : F.card,
                      border: `1px solid ${isBest ? bColor : F.cardBorder}`,
                      boxShadow: F.shadow, minWidth: 0,
                    }}
                  >
                    <img
                      src={tm.photo}
                      alt={tm.name}
                      crossOrigin="anonymous"
                      style={{ width: cfg.av, height: cfg.av, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${bColor}` }}
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: cfg.nm, lineHeight: 1.2, color: isBest ? bColor : F.text, whiteSpace: dense ? "nowrap" : "normal", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {isBest ? "👑 " : ""}{tm.name}
                        </span>
                        <span style={{ flexShrink: 0, fontSize: cfg.yr, fontWeight: 800, color: F.pink }}>
                          {tm.shared >= 3 ? "❤️" : "🤝"} ×{tm.shared}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 5 }}>
                        {tm.byYear.length > 0 ? (
                          tm.byYear.map((g) => (
                            <div key={g.year} style={{ lineHeight: 1.5 }}>
                              <span style={{ display: "inline-block", fontSize: cfg.yr, fontWeight: 800, lineHeight: 1.3, padding: "1px 7px", borderRadius: 999, background: F.chipBg, color: F.chipText, border: `1px solid ${F.chipBorder}`, marginRight: 5 }}>
                                {g.year}
                              </span>
                              <span style={{ fontSize: cfg.yr, fontWeight: 600, color: F.sub }}>
                                ({g.items.map((it) => (it.month ? `${it.name}-${it.month}` : it.name)).join(", ")})
                              </span>
                            </div>
                          ))
                        ) : (
                          <span style={{ fontSize: cfg.yr, fontWeight: 700, color: F.sub }}>{tm.shared}টি টুর্নামেন্ট</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p style={{ margin: `${18 * k}px 0 0`, textAlign: "center", fontSize: 13 * k + 1, fontWeight: 700, fontStyle: "italic", color: F.accent }}>
          “খেলা শেষ হয়ে যায়, কিন্তু বন্ধুত্ব থেকে যায়” 💛
        </p>

        <div style={{ height: 1, margin: `${14 * k}px 0`, background: F.divider }} />
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={Math.round(34 * k + 4)} />
            <div>
              <p style={{ margin: 0, fontSize: 13 * k + 1, fontWeight: 900, color: F.text }}>Facebook Cricket League</p>
              <p style={{ margin: 0, fontSize: 10 * k + 1, fontWeight: 700, color: F.sub }}>Together we play, together we win</p>
            </div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: `${6 * k + 2}px ${14 * k + 2}px`, borderRadius: 999, background: "linear-gradient(90deg,#16a34a,#059669)", color: "#ffffff", fontSize: 12 * k + 1, fontWeight: 800, boxShadow: "0 2px 8px rgba(5,150,105,0.35)" }}>
            <span>✅</span>
            <span>Approved by FCL Management Committee</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBirthdayDate(val: any): string {
  if (!val || val === "—") return "—";
  const num = Number(val);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const day = String(dateInfo.getUTCDate()).padStart(2, "0");
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${day} ${months[dateInfo.getUTCMonth()]}`;
  }
  const str = String(val).trim();
  return str.replace(/\b(19|20)\d{2}\b/g, "").trim();
}

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

function getPlayerEliteClub(p: Player, theme: "dark" | "light") {
  const runs = Number(p.runs) || 0;
  const wickets = Number(p.wickets) || 0;

  if (runs >= 2500 && wickets >= 150) {
    return { name: "💎 Diamond All-Rounder Club", badge: theme === "light" ? "bg-purple-100 text-purple-800 border-purple-300 font-extrabold shadow-sm" : "bg-purple-500/20 text-purple-300 border-purple-500/40" };
  }
  if (runs >= 2000 && wickets >= 100) {
    return { name: "🥇 Gold All-Rounder Club", badge: theme === "light" ? "bg-blue-100 text-blue-800 border-blue-300 font-extrabold shadow-sm" : "bg-blue-500/20 text-blue-300 border-blue-500/40" };
  }
  if (runs >= 1000 && wickets >= 50) {
    return { name: "🥈 Silver All-Rounder Club", badge: theme === "light" ? "bg-amber-100 text-amber-900 border-amber-300 font-extrabold shadow-sm" : "bg-amber-500/20 text-amber-300 border-amber-500/40" };
  }
  if (runs >= 500 && wickets >= 50) {
    return { name: "🥉 Bronze All-Rounder Club", badge: theme === "light" ? "bg-slate-200 text-slate-800 border-slate-300 font-extrabold shadow-sm" : "bg-slate-500/20 text-slate-300 border-slate-500/40" };
  }
  return null;
}

export default function PlayerCardModal({ selectedPlayer, onClose, tournamentsData, allPlayers }: Props) {
  const [cardTheme, setCardTheme] = useState<"dark" | "light">("dark");
  const [cardModalTab, setCardModalTab] = useState<"card" | "rankings" | "history" | "teammates" | "combined">("card");
  const [downloading, setDownloading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [tmSort, setTmSort] = useState<"shared" | "az">("shared");
  const [tmQuery, setTmQuery] = useState("");
  const [tmCols, setTmCols] = useState<0 | 2 | 3 | 4 | 5>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mScale, setMScale] = useState(0.75);

  const cardRef = useRef<HTMLDivElement>(null);
  const mobileCardRef = useRef<HTMLDivElement>(null);
  const mWrapRef = useRef<HTMLDivElement>(null);
  const teammatesRef = useRef<HTMLDivElement>(null);
  const combinedRef = useRef<HTMLDivElement>(null);

  // ফোন ভিউ ডিটেক্ট
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const upd = () => setIsMobile(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  // মোবাইল কার্ড স্ক্রিনের প্রস্থ অনুযায়ী স্কেল
  useEffect(() => {
    const el = mWrapRef.current;
    if (!el) return;
    const upd = () => setMScale(Math.min(1, el.clientWidth / M_W));
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile, cardModalTab, selectedPlayer]);

  const teammateHistory = useMemo(() => {
    const empty = { list: [] as Teammate[], count: 0, tourCount: 0, span: "", bestList: [] as Teammate[] };
    if (!selectedPlayer || !tournamentsData || tournamentsData.length === 0) return empty;

    const pNameLower = (selectedPlayer.name || "").trim().toLowerCase();

    const meta = new Map<string, { year: string; month: string }>();
    tournamentsData.forEach((r) => {
      const key = (r.tournament || "").trim();
      if (!key) return;
      const cur = meta.get(key);
      if (cur && cur.year && cur.month) return;
      const y = extractYear(r.time);
      const mi = extractMonthIdx(r.time);
      meta.set(key, { year: (cur?.year || y), month: cur?.month || (mi >= 0 ? MONTH_SHORT[mi] : "") });
    });
    const yearOf = new Map<string, string>();
    meta.forEach((v, k) => { if (v.year) yearOf.set(k, v.year); });

    const playerTourTeams = new Map<string, string>();
    tournamentsData.forEach((r) => {
      if ((r.playerName || "").trim().toLowerCase() === pNameLower) {
        if (r.tournament && r.team) playerTourTeams.set(r.tournament.trim(), r.team.trim());
      }
    });

    const teammateMap = new Map<string, Set<string>>();
    tournamentsData.forEach((r) => {
      const tour = (r.tournament || "").trim();
      const team = (r.team || "").trim();
      const rName = (r.playerName || "").trim();
      if (tour && team && rName) {
        if (playerTourTeams.has(tour) && playerTourTeams.get(tour) === team) {
          if (rName.toLowerCase() !== pNameLower) {
            if (!teammateMap.has(rName)) teammateMap.set(rName, new Set<string>());
            teammateMap.get(rName)!.add(tour);
          }
        }
      }
    });

    const list: Teammate[] = Array.from(teammateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, tours]) => {
        const foundPlayer = allPlayers.find((ap) => ap.name.toLowerCase().trim() === name.toLowerCase().trim());
        const rawP = foundPlayer?.photo || foundPlayer?.photoUrl;
        const photo = rawP && rawP !== "—" && rawP !== ""
          ? (rawP.startsWith("/") ? rawP : `/players/${rawP}`)
          : PLACEHOLDER;
        const tourArr = Array.from(tours);
        const years = Array.from(new Set(tourArr.map((t) => yearOf.get(t)).filter(Boolean) as string[])).sort();
        const byYear = years.map((year) => ({
          year,
          items: tourArr
            .filter((t) => yearOf.get(t) === year)
            .map((t) => ({ name: t, month: meta.get(t)?.month || "" }))
            .sort((a, b) => MONTH_SHORT.indexOf(a.month) - MONTH_SHORT.indexOf(b.month) || a.name.localeCompare(b.name)),
        }));
        const noYear = tourArr.filter((t) => !yearOf.get(t));
        if (noYear.length) byYear.push({ year: "—", items: noYear.map((t) => ({ name: t, month: "" })) });
        return { name, tours: tourArr, years, byYear, shared: tourArr.length, photo };
      });

    let bestList: Teammate[] = [];
    if (list.length > 0) {
      const maxShared = Math.max(...list.map((t) => t.shared));
      if (maxShared >= 2) {
        bestList = list.filter((t) => t.shared === maxShared);
      }
    }

    const myYears = Array.from(
      new Set(Array.from(playerTourTeams.keys()).map((t) => yearOf.get(t)).filter(Boolean) as string[])
    ).sort();
    const span = myYears.length === 0 ? "" : myYears.length === 1 || myYears[0] === myYears[myYears.length - 1]
      ? myYears[0]
      : `${myYears[0]}–${myYears[myYears.length - 1]}`;

    return {
      list,
      count: list.length,
      tourCount: playerTourTeams.size,
      span,
      bestList,
    };
  }, [selectedPlayer, tournamentsData, allPlayers]);

  const tmSorted = useMemo(() => {
    const l = [...teammateHistory.list];
    if (tmSort === "az") l.sort((a, b) => a.name.localeCompare(b.name));
    else l.sort((a, b) => b.shared - a.shared || a.name.localeCompare(b.name));
    return l;
  }, [teammateHistory.list, tmSort]);

  const tmFiltered = useMemo(() => {
    const q = tmQuery.trim().toLowerCase();
    return q ? tmSorted.filter((t) => t.name.toLowerCase().includes(q) || t.years.some((y) => y.includes(q)) || t.tours.some((x) => x.toLowerCase().includes(q))) : tmSorted;
  }, [tmSorted, tmQuery]);

  if (!selectedPlayer) return null;

  const T = THEMES[cardTheme];
  const FRT = FR[cardTheme];
  const eliteClub = getPlayerEliteClub(selectedPlayer, cardTheme);
  const exportLayout: BoardLayout = tmCols === 0 ? pickLayout(teammateHistory.count) : tmCols <= 2 ? "showcase" : tmCols === 3 ? "grid" : "dense";
  const exportCols = tmCols === 0 ? undefined : tmCols;
  const effectiveCols = tmCols || (exportLayout === "dense" && teammateHistory.count > 96 ? 5 : LAYOUT_CFG[exportLayout].cols);
  const sortLabel = tmSort === "az" ? "নাম অনুসারে (A → Z)" : "সবচেয়ে বেশি খেলা থেকে কম";
  const outLabel = `${effectiveCols} কলাম গ্রিড`;

  const rawPhoto = selectedPlayer.photo || selectedPlayer.photoUrl;
  const playerPhotoPath = rawPhoto && rawPhoto !== "—" && rawPhoto !== ""
    ? (rawPhoto.startsWith("/") ? rawPhoto : `/players/${rawPhoto}`)
    : PLACEHOLDER;

  const handleDownloadCard = async () => {
    const target = isMobile ? mobileCardRef.current : cardRef.current;
    if (!target) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(
        target,
        isMobile
          ? {
              cacheBust: true,
              pixelRatio: 4,
              skipAutoScale: true,
              backgroundColor: T.cardBg,
              width: M_W,
              height: M_H,
              style: { transform: "none", margin: "0" },
            }
          : {
              cacheBust: true,
              pixelRatio: 3,
              skipAutoScale: true,
              backgroundColor: T.cardBg,
              style: { width: "750px", maxWidth: "100%", margin: "0 auto" },
            }
      );
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

  const handleDownloadTeammatesPNG = async () => {
    if (!teammatesRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(teammatesRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        skipAutoScale: true,
        backgroundColor: FRT.solid,
      });
      const link = document.createElement("a");
      const safeName = (selectedPlayer?.nickName || selectedPlayer?.name || "player").toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `fcl-teammates-${safeName}-${tmSort}-${effectiveCols}col-${cardTheme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("সতীর্থদের তালিকা ডাউনলোড করতে সমস্যা হয়েছে।");
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
        skipAutoScale: true,
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

  const getRankWithNR = (player: Player, type: string) => {
    if (!player || allPlayers.length === 0) return "N/R";
    const sorted = [...allPlayers].sort((a, b) => {
      if (type === "points") return calculateFclPoints(b) - calculateFclPoints(a);
      if (type === "runs") return b.runs - a.runs;
      if (type === "wickets") return b.wickets - a.wickets;
      if (type === "sixes") return (b.sixes || 0) - (a.sixes || 0);
      if (type === "fours") return (b.fours || 0) - (a.fours || 0);
      if (type === "hattricks") return (b.hatTricks || 0) - (a.hatTricks || 0);
      if (type === "champions") return (b.champion || 0) - (a.champion || 0);
      if (type === "runnersup") return (b.runnersUp || 0) - (a.runnersUp || 0);
      if (type === "finals") return (b.totalFinal || 0) - (a.totalFinal || 0);
      if (type === "motcpot") return ((Number(b.mot) || 0) + (Number(b.cpot) || 0)) - ((Number(a.mot) || 0) + (Number(a.cpot) || 0));
      if (type === "runking") return (b.highestRunScorer || 0) - (a.highestRunScorer || 0);
      if (type === "wicketking") return (b.topWicketTaker || 0) - (a.topWicketTaker || 0);
      if (type === "matches") return b.matches - a.matches;
      if (type === "mom") return (b.mom || 0) - (a.mom || 0);
      if (type === "cpom") return (b.cpom || 0) - (a.cpom || 0);
      if (type === "innings") return (b.innings || 0) - (a.innings || 0);
      if (type === "notout") return (b.notOut || 0) - (a.notOut || 0);
      if (type === "maxruns") return (b.maxRuns || 0) - (a.maxRuns || 0);
      if (type === "maxwickets") return (b.maxWickets || 0) - (a.maxWickets || 0);
      if (type === "tournaments") return (b.totalTournament || 0) - (a.totalTournament || 0);
      return 0;
    });
    const index = sorted.findIndex((p) => p.name === player.name);
    return index !== -1 ? `${index + 1}` : "N/R";
  };

  const allRankCategories = [
    { id: "points", label: "FCL Points", icon: "💯" },
    { id: "runs", label: "Most Runs", icon: "🏏" },
    { id: "wickets", label: "Most Wickets", icon: "🎯" },
    { id: "sixes", label: "Six Machine", icon: "💥" },
    { id: "fours", label: "Boundary Kings", icon: "🔷" },
    { id: "hattricks", label: "Hat-Tricks", icon: "🎩" },
    { id: "champions", label: "Champions", icon: "🏆" },
    { id: "runnersup", label: "Runners-Up", icon: "🥈" },
    { id: "finals", label: "Total Finals", icon: "⚔️" },
    { id: "motcpot", label: "MOT / CPOT", icon: "⭐" },
    { id: "runking", label: "Tour. Run King", icon: "👑" },
    { id: "wicketking", label: "Tour. Wicket King", icon: "🛡️" },
    { id: "matches", label: "Most Matches", icon: "⚡" },
    { id: "mom", label: "Man of Match", icon: "🎖️" },
    { id: "cpom", label: "CP of Match", icon: "🏅" },
    { id: "innings", label: "Most Innings", icon: "📋" },
    { id: "notout", label: "Most Not Outs", icon: "🧱" },
    { id: "maxruns", label: "Highest Score", icon: "🚀" },
    { id: "maxwickets", label: "Best Bowling", icon: "🔥" },
    { id: "tournaments", label: "Tournaments", icon: "🗓️" },
  ];

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
    `flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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

  // মোবাইল কার্ডের কমপ্যাক্ট লাইন
  const ML = ({ k, children }: { k: string; children: ReactNode }) => (
    <div className={`flex items-center justify-between gap-1 border-b py-[3px] text-[10.5px] last:border-b-0 ${T.divider}`}>
      <span className={`whitespace-nowrap font-semibold ${T.label}`}>{k}</span>
      <strong className="whitespace-nowrap font-black">{children}</strong>
    </div>
  );

  const boardCommon = {
    total: teammateHistory.count,
    tourCount: teammateHistory.tourCount,
    span: teammateHistory.span,
    bestList: teammateHistory.bestList,
    theme: cardTheme,
    playerName: selectedPlayer.name,
    nick: selectedPlayer.nickName,
    playerPhoto: playerPhotoPath,
    sortLabel,
  };

  const hasBirthday = !!selectedPlayer.birthday && selectedPlayer.birthday !== "—";

  // ================= মোবাইল ৪:৫ প্রিমিয়াম কার্ড (440 × 550) =================
  const mobileCard = (
    <div
      ref={mobileCardRef}
      className={`flex flex-col gap-2 overflow-hidden rounded-2xl border p-3 shadow-xl ${T.card}`}
      style={{ width: M_W, height: M_H, transform: `scale(${mScale})`, transformOrigin: "top left" }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-2 ${T.divider}`}>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[#1877F2]/15 p-1">
            <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
          </div>
          <div>
            <h3 className={`text-[13px] font-black uppercase leading-tight tracking-wide ${T.title}`}>Player Statistics Card</h3>
            <p className={`text-[9px] font-semibold ${T.label}`}>Facebook Cricket League (FCL)</p>
          </div>
        </div>
        <span className={`rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold ${T.amber}`}>OFFICIAL</span>
      </div>

      {/* Identity row */}
      <div className="flex items-stretch gap-2" style={{ height: 100 }}>
        <div className={`relative w-[92px] shrink-0 overflow-hidden rounded-xl border-2 ${T.surface} ${cardTheme === "dark" ? "!border-sky-400/40" : "!border-sky-300"}`}>
          <img
            src={imgError ? PLACEHOLDER : playerPhotoPath}
            alt={selectedPlayer.name}
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className={`flex min-w-0 flex-1 flex-col justify-center overflow-hidden rounded-xl border px-2.5 py-1.5 ${T.surface}`}>
          <div className="flex items-start justify-between gap-1">
            <h4 className={`line-clamp-2 text-[14px] font-black leading-tight ${T.text}`}>{selectedPlayer.name}</h4>
            {hasBirthday && (
              <span className="shrink-0 whitespace-nowrap rounded border border-pink-500/50 bg-pink-500/10 px-1 text-[8.5px] font-black text-pink-400">
                🎂 {formatBirthdayDate(selectedPlayer.birthday)}
              </span>
            )}
          </div>
          {selectedPlayer.nickName && <p className={`text-[10.5px] font-bold leading-tight ${T.blue}`}>@{selectedPlayer.nickName}</p>}
          {eliteClub && (
            <div className="mt-1">
              <span className={`inline-flex items-center rounded-full border px-2 py-[1px] text-[8.5px] font-black ${eliteClub.badge}`}>{eliteClub.name}</span>
            </div>
          )}
          <div className={`mt-1 flex items-center justify-between border-t pt-1 ${T.divider}`}>
            <span className={`text-[8.5px] font-bold uppercase ${T.label}`}>Role:</span>
            <span className={`truncate text-[10.5px] font-extrabold ${T.amber}`}>{selectedPlayer.role}</span>
          </div>
        </div>

        <div className={`flex w-[78px] shrink-0 flex-col justify-between overflow-hidden rounded-xl border-2 px-1 py-1.5 text-center leading-none ${T.finalBox}`}>
          <div className="flex flex-col items-center gap-[3px]">
            <span className={`block text-[9px] font-black uppercase leading-none ${T.finalLbl}`}>TOTAL FINAL</span>
            <span className={`block text-[28px] font-black leading-none ${T.finalNum}`}>{selectedPlayer.totalFinal ?? 0}</span>
            <span className={`block text-[8.5px] font-bold leading-none ${T.finalSub}`}>Finals Played</span>
          </div>
          <div className="flex items-center justify-center gap-1 border-t border-amber-400/30 pt-1 leading-none">
            <span className={`text-[8px] font-bold uppercase leading-none ${T.finalRankLbl}`}>Pos</span>
            <span className={`text-[11px] font-black leading-none ${T.finalRankVal}`}>#{getRankWithNR(selectedPlayer, "finals")}</span>
          </div>
        </div>
      </div>

      {/* Debut row */}
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {[
          { l: "Debut Date", v: formatFullMonthDate(selectedPlayer.debutYear) || "—", c: T.blue },
          { l: "Debut Tour.", v: getDebutTournament(selectedPlayer), c: T.green },
          { l: "Debut Team", v: selectedPlayer.debutTeam || "—", c: T.text },
          { l: "Tournaments", v: String(selectedPlayer.totalTournament ?? 0), c: T.green },
        ].map((d) => (
          <div key={d.l} className={`flex flex-col justify-center rounded-lg border px-1 py-1 ${T.surface}`} style={{ minHeight: 40 }}>
            <p className={`text-[8px] font-bold uppercase tracking-wide ${T.label}`}>{d.l}</p>
            <p className={`line-clamp-2 break-words text-[10px] font-black leading-tight ${d.c}`}>{d.v}</p>
          </div>
        ))}
      </div>

      {/* Rankings hero */}
      <div className={`rounded-xl border-2 p-2 ${T.heroBox}`}>
        <div className={`flex items-center justify-between gap-2 border-b pb-1.5 ${T.heroHead}`}>
          <p className={`flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider ${T.heroTitle}`}>
            <span className="text-[12px]">👑</span> ALL-TIME RANKINGS
          </p>
          <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 shadow ${T.heroPill}`}>
            <span className="text-[10px]">⭐</span>
            <span className="text-[10px] font-black">Pos #{getRankWithNR(selectedPlayer, "points")} MVP</span>
            <span className="h-3 w-px bg-white/50" />
            <span className="text-[10px] font-extrabold">{calculateFclPoints(selectedPlayer).toLocaleString()} Pts</span>
          </div>
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {[
            { id: "runs", label: "RUNS", icon: "🏏", color: "text-[#0d9488] dark:text-[#2dd4bf]" },
            { id: "wickets", label: "WICKETS", icon: "🎯", color: "text-[#c2410c] dark:text-[#fb923c]" },
            { id: "champions", label: "TITLES", icon: "🏆", color: "text-[#1d4ed8] dark:text-[#60a5fa]" },
            { id: "matches", label: "MATCHES", icon: "⚡", color: "text-[#b45309] dark:text-[#facc15]" },
            { id: "sixes", label: "SIXES", icon: "💥", color: "text-[#7e22ce] dark:text-[#c084fc]" },
            { id: "fours", label: "FOURS", icon: "🔷", color: "text-[#0369a1] dark:text-[#38bdf8]" },
          ].map((box) => {
            const r = getRankWithNR(selectedPlayer, box.id);
            return (
              <div key={box.id} className={`flex items-center justify-between rounded-lg border px-2 py-1 ${T.rankBox}`}>
                <span className={`flex items-center gap-1 text-[9px] font-black ${box.color}`}>
                  <span className="text-[11px]">{box.icon}</span>
                  {box.label}
                </span>
                <span className={`text-[13px] font-black leading-none ${box.color}`}>{r === "N/R" ? "N/R" : `#${r}`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-xl border px-2.5 py-1 ${T.surface}`}>
          <ML k="Total Match:">{selectedPlayer.matches}</ML>
          <ML k="Runs & Max:"><span className={T.green}>{selectedPlayer.runs} ({selectedPlayer.maxRuns || "—"})</span></ML>
          <ML k="Wkts & Max:"><span className={T.amber}>{selectedPlayer.wickets} ({selectedPlayer.maxWickets || "—"})</span></ML>
          <ML k="Inn / Not Out:">{selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}</ML>
          <ML k="4s / 6s:"><span className={T.blue}>{selectedPlayer.fours ?? 0}</span> / <span className={T.purple}>{selectedPlayer.sixes ?? 0}</span></ML>
          <ML k="Hat-Trick:"><span className={T.pink}>{selectedPlayer.hatTricks ?? 0}</span></ML>
        </div>
        <div className={`rounded-xl border px-2.5 py-1 ${T.surface}`}>
          <ML k="Bat / Bowl Avg:">{selectedPlayer.runAvg || "0.00"} / {getSafeWkAvg(selectedPlayer)}</ML>
          <ML k="Champ / R-Up:">🏆 <span className={T.amber}>{selectedPlayer.champion ?? 0}</span> / 🥈 <span className={T.silver}>{selectedPlayer.runnersUp ?? 0}</span></ML>
          <ML k="MOT / CPOT:">⭐ <span className={T.purple}>{selectedPlayer.mot ?? 0}</span> / {selectedPlayer.cpot ?? 0}</ML>
          <ML k="MOM / CPOM:">🎖️ <span className={T.blue}>{selectedPlayer.mom ?? 0}</span> / {selectedPlayer.cpom ?? 0}</ML>
          <ML k="Teammates:"><span className={T.green}>{teammateHistory.count} Players</span></ML>
          <ML k="Top Scorer / Wkt:"><span className={T.gold}>{selectedPlayer.highestRunScorer ?? 0} / {selectedPlayer.topWicketTaker ?? 0}</span></ML>
        </div>
      </div>

      {/* Last played */}
      <div className={`mt-auto flex items-center justify-between gap-2 rounded-xl border-2 px-2.5 py-1.5 ${T.lastBox}`}>
        <div className="flex items-center gap-1.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className={`text-[9.5px] font-black uppercase tracking-wider ${T.lastLbl}`}>Last Played:</span>
        </div>
        <span className={`truncate rounded-md border px-2 py-0.5 text-[10.5px] font-black ${T.lastPill}`}>🏟️ {selectedPlayer.lastPlayed || "—"}</span>
      </div>
    </div>
  );

  const showDownloadFab = cardModalTab !== "rankings" && cardModalTab !== "history";

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div
          className={`relative flex h-[94vh] sm:h-auto sm:max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl transition-colors duration-200 ${T.modal}`}
          style={isMobile ? { height: "94dvh" } : { maxHeight: "92dvh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ================= HEADER ================= */}
          <div className={`z-30 shrink-0 border-b px-3 py-2.5 sm:px-4 sm:py-3 backdrop-blur-md ${T.header}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className={`order-2 flex w-full items-center gap-1 overflow-x-auto rounded-xl border p-1 sm:order-1 sm:w-auto ${T.segWrap}`}>
                <button onClick={() => setCardModalTab("card")} className={tabCls(cardModalTab === "card")}>
                  <span>🎖️</span>
                  <span>Stat Card</span>
                </button>
                <button onClick={() => setCardModalTab("rankings")} className={tabCls(cardModalTab === "rankings")}>
                  <span>🏆</span>
                  <span>All Ranks</span>
                </button>
                <button onClick={() => setCardModalTab("history")} className={tabCls(cardModalTab === "history")}>
                  <span>📊</span>
                  <span>History</span>
                </button>
                <button onClick={() => setCardModalTab("teammates")} className={tabCls(cardModalTab === "teammates")}>
                  <span>🤝</span>
                  <span>Teammates ({teammateHistory.count})</span>
                </button>
                <button onClick={() => setCardModalTab("combined")} className={tabCls(cardModalTab === "combined", true)}>
                  <span>⚡</span>
                  <span>Full Profile</span>
                </button>
              </div>

              <div className="order-1 flex w-full items-center justify-between gap-2 sm:order-2 sm:w-auto sm:justify-end">
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

          {/* ================= BODY (নিচে pb-28: ফ্লোটিং বাটনের জন্য জায়গা) ================= */}
          <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 pt-3 sm:pt-4 pb-28 sm:pb-24 ${T.body}`}>
            {cardModalTab === "card" && isMobile && (
              <div ref={mWrapRef} className="mx-auto w-full" style={{ maxWidth: M_W, height: M_H * mScale }}>
                {mobileCard}
              </div>
            )}

            {cardModalTab === "card" && !isMobile && (
              <div ref={cardRef} className={`mx-auto w-full max-w-2xl space-y-4 rounded-2xl border p-5 sm:p-6 shadow-xl ${T.card}`}>
                <div className={`flex items-center justify-between border-b pb-3 ${T.divider}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1877F2]/15 p-1.5 overflow-hidden">
                      <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
                    </div>
                    <div>
                      <h3 className={`text-base sm:text-2xl font-black uppercase tracking-wide ${T.title}`}>Player Statistics Card</h3>
                      <p className={`text-xs font-semibold ${T.label}`}>Facebook Cricket League (FCL)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md border border-amber-500/50 bg-amber-500/10 px-2.5 py-1 text-xs font-bold ${T.amber}`}>OFFICIAL</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  <div className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 p-1 ${T.surface} ${cardTheme === "dark" ? "!border-sky-400/40" : "!border-sky-300"}`}>
                    <img
                      src={imgError ? "/FCL Cricket Avatar Placeholder.jpg" : playerPhotoPath}
                      alt={selectedPlayer.name}
                      crossOrigin="anonymous"
                      onError={() => setImgError(true)}
                      className="absolute inset-0 h-full w-full rounded-lg object-cover"
                    />
                  </div>

                  <div className={`col-span-2 flex flex-col justify-center rounded-xl border p-3.5 ${T.surface}`}>
                    <div className="flex items-center justify-between gap-2">
                      <Lbl>Player Name</Lbl>
                      {hasBirthday && (
                        <span className="rounded-md border border-pink-500/50 bg-pink-500/10 px-2 py-0.5 text-[10px] font-black text-pink-400">
                          🎂 {formatBirthdayDate(selectedPlayer.birthday)}
                        </span>
                      )}
                    </div>
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
                      <span className={`text-[9px] font-bold uppercase ${T.finalRankLbl}`}>Position: </span>
                      <span className={`text-xs ${T.finalRankVal}`}>#{getRankWithNR(selectedPlayer, "finals")}</span>
                    </div>
                  </div>
                </div>

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

                <div className={`rounded-2xl border-2 p-3.5 sm:p-4 text-center shadow-lg ${T.heroBox}`}>
                  <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 border-b pb-2.5 ${T.heroHead}`}>
                    <p className={`flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest ${T.heroTitle}`}>
                      <span className="text-base sm:text-lg">👑</span> ALL-TIME LEAGUE RANKINGS
                    </p>
                    <div className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 shadow-md ${T.heroPill}`}>
                      <span className="text-sm">⭐</span>
                      <span className="text-xs sm:text-sm font-black">Pos #{getRankWithNR(selectedPlayer, "points")} MVP</span>
                      <span className="h-3.5 w-px bg-white/50" />
                      <span className="text-xs sm:text-sm font-extrabold">{calculateFclPoints(selectedPlayer).toLocaleString()} Pts</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {[
                      { id: "runs", label: "MOST RUNS", icon: "🏏", color: "text-[#0d9488] dark:text-[#2dd4bf]" },
                      { id: "wickets", label: "MOST WICKETS", icon: "🎯", color: "text-[#c2410c] dark:text-[#fb923c]" },
                      { id: "champions", label: "TITLES WON", icon: "🏆", color: "text-[#1d4ed8] dark:text-[#60a5fa]" },
                      { id: "matches", label: "MATCH CAPS", icon: "⚡", color: "text-[#b45309] dark:text-[#facc15]" },
                      { id: "sixes", label: "SIXES HIT", icon: "💥", color: "text-[#7e22ce] dark:text-[#c084fc]" },
                      { id: "fours", label: "FOURS HIT", icon: "🔷", color: "text-[#0369a1] dark:text-[#38bdf8]" },
                    ].map((box) => {
                      const rVal = getRankWithNR(selectedPlayer, box.id);
                      const displayVal = rVal === "N/R" ? "N/R" : `#${rVal}`;
                      return (
                        <div key={box.id} className={`relative flex flex-col justify-between rounded-xl border p-2.5 text-left ${T.rankBox}`}>
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-[11px] font-black tracking-tight flex items-center gap-1 ${box.color}`}>
                              <span className="text-sm">{box.icon}</span> <span className="uppercase">{box.label}</span>
                            </span>
                          </div>
                          <div className="mt-2 text-right">
                            <span className="text-[9px] uppercase font-black text-slate-500 dark:text-slate-400 block tracking-wider">POSITION</span>
                            <span className={`text-base sm:text-lg font-black leading-none block ${box.color}`}>{displayVal}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`space-y-2 rounded-xl border p-3.5 text-xs sm:text-[13px] ${T.surface}`}>
                    <Line k="Total Match:">{selectedPlayer.matches}</Line>
                    <Line k="Total Runs & Max:"><span className={T.green}>{selectedPlayer.runs} ({selectedPlayer.maxRuns || "—"})</span></Line>
                    <Line k="Total Wickets & Max:"><span className={T.amber}>{selectedPlayer.wickets} ({selectedPlayer.maxWickets || "—"})</span></Line>
                    <Line k="Innings / Not Out:">{selectedPlayer.innings ?? 0} / {selectedPlayer.notOut ?? 0}</Line>
                    <Line k="Boundaries (4s / 6s):"><span className={T.blue}>{selectedPlayer.fours ?? 0}</span> / <span className={T.purple}>{selectedPlayer.sixes ?? 0}</span></Line>
                    <Line k="Career Hat-Trick:" last><span className={T.pink}>{selectedPlayer.hatTricks ?? 0}</span></Line>
                  </div>

                  <div className={`space-y-2 rounded-xl border p-3.5 text-xs sm:text-[13px] ${T.surface}`}>
                    <Line k="Batting / Bowling Avg:">{selectedPlayer.runAvg || "0.00"} / {getSafeWkAvg(selectedPlayer)}</Line>
                    <Line k="Champion / Runner-Up:">🏆 <span className={T.amber}>{selectedPlayer.champion ?? 0}</span> / 🥈 <span className={T.silver}>{selectedPlayer.runnersUp ?? 0}</span></Line>
                    <Line k="MOT / CPOT:">⭐ <span className={T.purple}>{selectedPlayer.mot ?? 0}</span> / {selectedPlayer.cpot ?? 0}</Line>
                    <Line k="MOM / CPOM:">🎖️ <span className={T.blue}>{selectedPlayer.mom ?? 0}</span> / {selectedPlayer.cpom ?? 0}</Line>
                    <div className="flex justify-between gap-2 border-b pb-1.5 border-slate-700/60">
                      <span className={`font-semibold ${T.label}`}>Total Teammates:</span>
                      <strong className="font-black text-right text-emerald-400">{teammateHistory.count} Players</strong>
                    </div>
                    <Line k="Top Scorer / Wicket Taker:" last><span className={T.gold}>{selectedPlayer.highestRunScorer ?? 0} / {selectedPlayer.topWicketTaker ?? 0}</span></Line>
                  </div>
                </div>

                <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 rounded-xl border-2 p-3 ${T.lastBox}`}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                    <span className={`text-xs font-black uppercase tracking-wider ${T.lastLbl}`}>Last Played Tournament:</span>
                  </div>
                  <span className={`rounded-lg border px-3 py-1 text-xs sm:text-sm font-black shadow-sm ${T.lastPill}`}>🏟️ {selectedPlayer.lastPlayed || "—"}</span>
                </div>
              </div>
            )}

            {cardModalTab === "rankings" && (
              <div className="mx-auto max-w-2xl space-y-3">
                <div className={`rounded-2xl border p-4 text-center ${T.card}`}>
                  <h3 className={`text-base font-black uppercase tracking-wider ${T.title}`}>🏆 All-Time Category Rankings</h3>
                  <p className={`mt-1 text-xs ${T.label}`}>এখানে রেকর্ডস ও লিডারবোর্ডের প্রতিটি ক্যাটাগরিতে {selectedPlayer.name}-এর পজিশন দেখানো হলো।</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allRankCategories.map((cat) => {
                    const rankVal = getRankWithNR(selectedPlayer, cat.id);
                    const isTop = rankVal !== "N/R" && parseInt(rankVal) <= 3;
                    return (
                      <div key={cat.id} className={`flex items-center justify-between rounded-xl border p-3.5 transition ${T.surface}`}>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-xs sm:text-sm font-bold">{cat.label}</span>
                        </div>
                        <span className={`rounded-lg px-3 py-1 text-xs font-black shadow-sm ${isTop ? "bg-amber-500 text-slate-900" : "bg-black/40 text-amber-400 border border-amber-400/30"}`}>
                          {rankVal === "N/R" ? "N/R" : `#${rankVal}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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

            {cardModalTab === "teammates" && (
              <div className="mx-auto max-w-4xl space-y-3">
                <div className={`flex flex-wrap items-center gap-2 rounded-2xl border p-2.5 ${T.card}`}>
                  <div className="relative min-w-[160px] flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60">🔍</span>
                    <input
                      value={tmQuery}
                      onChange={(e) => setTmQuery(e.target.value)}
                      placeholder="নাম বা সাল (যেমন 2023)"
                      className={`w-full rounded-xl border py-2 pl-9 pr-3 text-xs outline-none focus:border-amber-500 ${T.surface} ${T.text}`}
                    />
                  </div>
                  <div className={`flex items-center gap-1 rounded-xl border p-1 ${T.segWrap}`}>
                    <button onClick={() => setTmSort("az")} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${tmSort === "az" ? T.themeOn : T.themeOff}`}>🔤 নাম (A → Z)</button>
                    <button onClick={() => setTmSort("shared")} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${tmSort === "shared" ? T.themeOn : T.themeOff}`}>🏏 বেশি খেলা আগে</button>
                  </div>
                  <div className={`flex items-center gap-1 rounded-xl border p-1 ${T.segWrap}`}>
                    <span className={`px-1.5 text-[10px] font-bold ${T.label}`}>গ্রিড</span>
                    {([0, 2, 3, 4, 5] as const).map((c) => (
                      <button key={c} onClick={() => setTmCols(c)} className={`min-w-[30px] rounded-lg px-2 py-1 text-[11px] font-bold transition ${tmCols === c ? T.themeOn : T.themeOff}`}>
                        {c === 0 ? "Auto" : c}
                      </button>
                    ))}
                  </div>
                  <span className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${T.surface} ${T.label}`}>
                    📥 ডাউনলোড: <span className={T.amber}>{sortLabel} • {outLabel}</span>
                  </span>
                </div>

                <FriendBoard mode="preview" list={tmFiltered} {...boardCommon} />
              </div>
            )}

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
                        {kv("Role", <span className={T.amber}>{selectedPlayer.role || "—"}</span>, "Birthdate", <span className={T.pink}>{hasBirthday ? formatBirthdayDate(selectedPlayer.birthday) : "—"}</span>, T.keyBlue)}
                        {kv("Debut Date", <span className={T.blue}>{formatFullMonthDate(selectedPlayer.debutYear) || "—"}</span>, "Debut Tournament", <span className={T.green}>{getDebutTournament(selectedPlayer)}</span>, T.keyBlue)}
                        {kv("Debut Team", <span className={T.text}>{selectedPlayer.debutTeam || "—"}</span>, "Total Tournaments", <span className={T.green}>{selectedPlayer.totalTournament ?? 0}</span>, T.keyBlue)}
                        {kv("Total Finals", <span className={T.gold}>{selectedPlayer.totalFinal ?? 0}</span>, "Last Played", <span className={T.amber}>{selectedPlayer.lastPlayed || "—"}</span>, T.keyBlue)}

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
                        {kv("Career Hat-Trick", <span className={T.pink}>{selectedPlayer.hatTricks ?? 0}</span>, "Total Teammates Played With", <span className={T.green}>{teammateHistory.count} Players</span>, T.keyBlue, true)}
                      </tbody>
                    </table>
                  </div>

                  <div className={`mt-5 overflow-hidden rounded-xl border ${T.partAmber}`}>
                    <div className={`border-b px-4 py-3 ${T.partAmberHead}`}>
                      <h4 className="text-sm font-black uppercase tracking-widest">PART 02 — RANKINGS, ACHIEVEMENTS & CAREER HONOURS</h4>
                    </div>
                    <table className="w-full border-collapse text-[13px]">
                      <tbody>
                        {kv("MVP Rank", <span className={T.gold}>Pos #{getRankWithNR(selectedPlayer, "points")} ({calculateFclPoints(selectedPlayer).toLocaleString()} Pts)</span>, "Runs Rank", <span className={T.green}>Pos #{getRankWithNR(selectedPlayer, "runs")}</span>, T.keyAmber)}
                        {kv("Wickets Rank", <span className={T.amber}>Pos #{getRankWithNR(selectedPlayer, "wickets")}</span>, "6s / 4s Rank", <span className={T.purple}>Pos #{getRankWithNR(selectedPlayer, "sixes")} / Pos #{getRankWithNR(selectedPlayer, "fours")}</span>, T.keyAmber)}
                        {kv("Trophy Rank", <span className={T.blue}>Pos #{getRankWithNR(selectedPlayer, "champions")}</span>, "Champion / Runner-Up", <span>🏆 {selectedPlayer.champion ?? 0} / 🥈 {selectedPlayer.runnersUp ?? 0}</span>, T.keyAmber)}
                        {kv("Matches Rank", <span className={T.pink}>Pos #{getRankWithNR(selectedPlayer, "matches")}</span>, "Finals Rank", <span className={T.gold}>Pos #{getRankWithNR(selectedPlayer, "finals")}</span>, T.keyAmber)}
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

          {/* ================= ফ্লোটিং বাটন (ফুটার নেই) ================= */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-3 pt-3 sm:justify-end sm:px-5"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            {showDownloadFab ? (
              cardModalTab === "card" ? (
                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#1877F2] px-5 py-3 text-xs font-bold text-white shadow-[0_8px_24px_rgba(24,119,242,0.45)] ring-1 ring-white/20 transition hover:bg-[#166fe5] active:scale-95 disabled:opacity-60"
                >
                  {downloading ? "প্রসেসিং হচ্ছে..." : "📥 ডাউনলোড কার্ড (PNG)"}
                </button>
              ) : cardModalTab === "teammates" ? (
                <button
                  onClick={handleDownloadTeammatesPNG}
                  disabled={downloading || teammateHistory.count === 0}
                  className="pointer-events-auto flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-5 py-3 text-xs font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.45)] ring-1 ring-white/20 transition hover:opacity-90 active:scale-95 disabled:opacity-60"
                >
                  {downloading ? "ইমেজ তৈরি হচ্ছে..." : `📥 ডাউনলোড সতীর্থ তালিকা • ${outLabel}`}
                </button>
              ) : (
                <button
                  onClick={handleDownloadCombinedPNG}
                  disabled={downloading}
                  className="pointer-events-auto flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-[0_8px_24px_rgba(6,182,212,0.45)] ring-1 ring-white/20 transition hover:opacity-90 active:scale-95 disabled:opacity-60"
                >
                  {downloading ? "ইমেজ তৈরি হচ্ছে..." : "📥 ডাউনলোড ফুল প্রোফাইল (PNG)"}
                </button>
              )
            ) : (
              <button
                onClick={() => setCardModalTab("card")}
                className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#1877F2] px-5 py-3 text-xs font-bold text-white shadow-[0_8px_24px_rgba(24,119,242,0.45)] ring-1 ring-white/20 transition hover:bg-[#166fe5] active:scale-95"
              >
                ← স্ট্যাট কার্ডে ফিরে যান
              </button>
            )}
          </div>
        </div>
      </div>

      {cardModalTab === "teammates" && (
        <div aria-hidden="true" style={{ position: "fixed", left: -20000, top: 0, pointerEvents: "none" }}>
          <div ref={teammatesRef} style={{ width: "fit-content" }}>
            <FriendBoard mode={exportLayout} colsOverride={exportCols} list={tmSorted} {...boardCommon} />
          </div>
        </div>
      )}
    </>
  );
}

function kv(k1: string, v1: ReactNode, k2: string, v2: ReactNode, keyCls: string, last = false) {
  return (
    <tr className={last ? "" : "border-b border-slate-700/60"}>
      <td className={`w-[18%] px-4 py-3 font-bold ${keyCls}`}>{k1}</td>
      <td className={`w-[32%] px-4 py-3 font-black`}>{v1}</td>
      <td className={`w-[18%] px-4 py-3 font-bold ${keyCls}`}>{k2}</td>
      <td className={`w-[32%] px-4 py-3 font-black`}>{v2}</td>
    </tr>
  );
}