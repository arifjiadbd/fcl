"use client";

import { useState, useEffect, useRef, useMemo, type RefObject } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import PlayerCardModal from "@/components/PlayerCardModal";

interface Player {
  id?: number;
  name: string;
  nickName?: string;
  role: string;
  matches: number;
  runs: number;
  wickets: number;
  champion?: number;
  mom?: number;
  birthday?: string;
  photo?: string;
  photoUrl?: string;
  totalTournament?: number;
  innings?: number;
  notOut?: number;
  fours?: number;
  sixes?: number;
  hatTricks?: number;
  cpom?: number;
  mot?: number;
  cpot?: number;
  runnersUp?: number;
  totalFinal?: number;
  lastPlayed?: string;
  highestRunScorer?: number;
  topWicketTaker?: number;
  debutYear?: string;
  debutTournament?: string;
  debutTeam?: string;
  runAvg?: string;
  wkAvg?: string;
}

interface BdayEntry {
  player: Player;
  month: number;
  day: number;
  text: string;
  daysLeft: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_BN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const FALLBACK_PHOTO = "/FCL Cricket Avatar Placeholder.jpg";

function parseExcelBirthday(val: string) {
  if (!val || val === "—") return { month: -1, day: 999, text: "" };
  const num = Number(val);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const day = dateInfo.getUTCDate();
    const month = dateInfo.getUTCMonth();
    return { month, day, text: `${String(day).padStart(2, "0")} ${MONTH_NAMES[month]}` };
  }
  const str = String(val).trim();
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    if (new RegExp(MONTH_NAMES[i], "i").test(str) || new RegExp(MONTH_NAMES[i].slice(0, 3), "i").test(str)) {
      const match = str.match(/\d+/);
      const day = match ? parseInt(match[0]) : 1;
      return { month: i, day, text: str };
    }
  }
  const matchNum = str.match(/\d+/);
  const day = matchNum ? parseInt(matchNum[0]) : 999;
  return { month: -1, day, text: str };
}

function getPhoto(p: Player) {
  const raw = p.photo || p.photoUrl;
  if (!raw || raw === "—" || raw === "") return FALLBACK_PHOTO;
  return raw.startsWith("/") ? raw : `/players/${raw}`;
}

function daysUntil(month: number, day: number) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(today.getFullYear(), month, day);
  if (target < today) target = new Date(today.getFullYear() + 1, month, day);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function leftLabel(d: number) {
  if (d === 0) return "আজ";
  if (d === 1) return "আগামীকাল";
  return `${d} দিন বাকি`;
}

/* ═══════════════════════════════════════════════════════════
   🎨 পোস্টার-স্টাইল উইশ কার্ড (400 × 500 ফিক্সড ডিজাইন)
   রঙ: রয়্যাল ব্লু #1d4ed8 • গ্রিন #22c55e • নেভি #0b2a6f
   ═══════════════════════════════════════════════════════════ */
function Balloon({ color, dark, w, style }: { color: string; dark: string; w: number; style: React.CSSProperties }) {
  return (
    <svg width={w} height={w * 1.6} viewBox="0 0 50 80" style={{ position: "absolute", ...style }}>
      <path d="M25 2C11 2 3 14 3 28c0 16 12 28 22 30 10-2 22-14 22-30C47 14 39 2 25 2Z" fill={color} />
      <path d="M25 58l-3.5 5h7z" fill={dark} />
      <path d="M25 63q-6 8 0 16" stroke="#94a3b8" fill="none" strokeWidth="1" />
      <ellipse cx="16" cy="17" rx="4.5" ry="9" fill="#fff" opacity=".4" transform="rotate(22 16 17)" />
    </svg>
  );
}

function GiftBox() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ position: "absolute", left: 16, bottom: 40 }}>
      <rect x="5" y="20" width="38" height="24" rx="2" fill="#1d4ed8" />
      <rect x="3" y="14" width="42" height="9" rx="2" fill="#2563eb" />
      <rect x="21" y="14" width="6" height="30" fill="#fff" />
      <path d="M24 14C14 0 6 10 24 14C42 10 34 0 24 14Z" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function CricketBall() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" style={{ position: "absolute", right: 18, bottom: 40 }}>
      <circle cx="21" cy="21" r="19" fill="#b91c1c" />
      <circle cx="15" cy="14" r="8" fill="#ef4444" opacity=".55" />
      <path d="M9 7Q23 21 9 35" stroke="#fff" strokeWidth="1.6" fill="none" strokeDasharray="3 2.2" />
      <path d="M33 7Q19 21 33 35" stroke="#fff" strokeWidth="1.6" fill="none" strokeDasharray="3 2.2" />
    </svg>
  );
}

function WishCard({ player, dateText }: { player: Player; dateText: string }) {
  const nameSize = player.name.length > 22 ? 16 : player.name.length > 16 ? 19 : 22;
  return (
    <div
      style={{
        width: 400,
        height: 500,
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        background: "linear-gradient(180deg,#ffffff 0%,#eaf2ff 45%,#cfe2ff 100%)",
        fontFamily: "'Poppins','Hind Siliguri',sans-serif",
        boxShadow: "0 0 0 4px rgba(255,255,255,.9)",
      }}
    >
      {/* সুইশ ও কনফেটি */}
      <svg width="400" height="500" viewBox="0 0 400 500" style={{ position: "absolute", inset: 0 }}>
        <path d="M0 0H84Q36 22 0 84Z" fill="#1d4ed8" />
        <path d="M0 0H44Q18 12 0 40Z" fill="#2563eb" />
        <path d="M10 58Q40 24 96 6" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M400 0H330Q372 20 400 74Z" fill="#2563eb" opacity=".9" />
        <path d="M0 448Q120 484 215 470T400 436V470H0Z" fill="#1d4ed8" />
        <path d="M0 458Q108 490 205 478" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M400 448Q330 470 262 474" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" fill="none" />
        <g opacity=".9">
          <rect x="70" y="118" width="7" height="3" fill="#22c55e" transform="rotate(30 70 118)" />
          <rect x="330" y="150" width="7" height="3" fill="#2563eb" transform="rotate(-40 330 150)" />
          <rect x="112" y="260" width="6" height="3" fill="#2563eb" transform="rotate(50 112 260)" />
          <rect x="300" y="268" width="7" height="3" fill="#22c55e" transform="rotate(20 300 268)" />
          <rect x="95" y="196" width="6" height="3" fill="#22c55e" transform="rotate(-25 95 196)" />
          <rect x="305" y="205" width="6" height="3" fill="#2563eb" transform="rotate(60 305 205)" />
          <circle cx="62" cy="152" r="2.5" fill="#2563eb" />
          <circle cx="344" cy="116" r="2.5" fill="#22c55e" />
        </g>
        {/* স্ট্যাম্প */}
        <g fill="#93c5fd" opacity=".55">
          <rect x="338" y="398" width="5" height="52" rx="2" />
          <rect x="350" y="398" width="5" height="52" rx="2" />
          <rect x="362" y="398" width="5" height="52" rx="2" />
        </g>
      </svg>

      {/* বেলুন */}
      <Balloon color="#2563eb" dark="#1e3a8a" w={52} style={{ left: -16, top: 126 }} />
      <Balloon color="#22c55e" dark="#15803d" w={42} style={{ left: 6, top: 214 }} />
      <Balloon color="#22c55e" dark="#15803d" w={52} style={{ right: -14, top: 112 }} />
      <Balloon color="#2563eb" dark="#1e3a8a" w={42} style={{ right: 4, top: 204 }} />

      <GiftBox />
      <CricketBall />

      {/* কর্নার টেক্সট */}
      <div
        style={{
          position: "absolute", left: 58, top: 38, transform: "rotate(-6deg)",
          fontFamily: "'Pacifico',cursive", fontSize: 10, lineHeight: 1.25, color: "#1d4ed8", textAlign: "center",
        }}
      >
        More Birthdays<br />More Happiness ♡
      </div>
      <div
        style={{
          position: "absolute", right: 58, top: 30, transform: "rotate(6deg)",
          fontFamily: "'Pacifico',cursive", fontSize: 10, lineHeight: 1.25, color: "#1d4ed8", textAlign: "center",
        }}
      >
        Same Team<br />Same Dream<br />FCL
      </div>

      {/* কনটেন্ট */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12 }}>
        <div
          style={{
            width: 60, height: 60, borderRadius: "50%", background: "#fff", padding: 3,
            border: "3px solid #1d4ed8", boxShadow: "0 6px 16px rgba(29,78,216,.35)",
          }}
        >
          <img src="/fcl-logo.png" alt="FCL" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }} />
        </div>

        <div style={{ fontFamily: "'Pacifico',cursive", fontSize: 24, color: "#2563eb", lineHeight: 1, marginTop: 6 }}>Happy</div>
        <div
          style={{
            fontFamily: "'Pacifico',cursive", fontSize: 48, lineHeight: 1.05, color: "#1e40af",
            textShadow: "2px 2px 0 #fff,-2px -2px 0 #fff,2px -2px 0 #fff,-2px 2px 0 #fff,0 5px 10px rgba(30,64,175,.35)",
          }}
        >
          Birthday
        </div>
        <div
          style={{
            marginTop: 0, width: 168, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(90deg,#1d4ed8,#22c55e)", color: "#fff",
            fontFamily: "'Pacifico',cursive", fontSize: 15,
            clipPath: "polygon(0 0,100% 0,94% 50%,100% 100%,0 100%,6% 50%)",
          }}
        >
          Champion
        </div>

        {/* প্লেয়ার ফটো */}
        <div style={{ marginTop: 12, padding: 4, borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#22c55e)", boxShadow: "0 8px 22px rgba(29,78,216,.4)" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden", border: "3px solid #fff", background: "#e2e8f0" }}>
            <img
              src={getPhoto(player)}
              alt={player.name}
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_PHOTO;
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: nameSize, fontWeight: 800, color: "#0b2a6f", lineHeight: 1.15, textAlign: "center", maxWidth: 330 }}>
          {player.name}
        </div>
        <div style={{ marginTop: 5, display: "flex", gap: 6, alignItems: "center", justifyContent: "center", flexWrap: "wrap", maxWidth: 340 }}>
          <div style={{ padding: "2px 11px", borderRadius: 999, background: "#0b2a6f", color: "#fff", fontSize: 10, fontWeight: 600 }}>
            @{player.nickName || "Player"} • {player.role}
          </div>
          <div style={{ padding: "2px 11px", borderRadius: 999, background: "linear-gradient(90deg,#1d4ed8,#16a34a)", color: "#fff", fontSize: 10, fontWeight: 700 }}>
            🎂 {dateText}
          </div>
        </div>

        <div style={{ marginTop: 8, width: 316, textAlign: "center", color: "#1e3a8a", fontSize: 11, lineHeight: 1.45, fontWeight: 500 }}>
          “May your special day bring you joy, good health, success and countless happy moments.”
          <div style={{ fontWeight: 800, fontSize: 11, color: "#1d4ed8", marginTop: 2 }}>— FCL Family</div>
        </div>

        <div style={{ marginTop: 8, display: "flex", gap: 8, width: 252 }}>
          {[
            { l: "Matches", v: player.matches },
            { l: "Runs", v: player.runs },
            { l: "Wickets", v: player.wickets },
          ].map((s) => (
            <div key={s.l} style={{ flex: 1, textAlign: "center", background: "#fff", border: "1.5px solid #bfdbfe", borderRadius: 12, padding: "4px 0", boxShadow: "0 3px 8px rgba(29,78,216,.12)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1d4ed8", lineHeight: 1.1 }}>{s.v}</div>
              <div style={{ fontSize: 8, fontWeight: 600, color: "#64748b" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ফুটার বার */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 34, background: "#0b2a6f",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
          color: "#fff", fontSize: 11, fontWeight: 600, zIndex: 3,
        }}
      >
        <span>👥 Unity</span>
        <span style={{ opacity: 0.6 }}>•</span>
        <span>🤝 Friendship</span>
        <span style={{ opacity: 0.6 }}>•</span>
        <span>🤍 Brotherhood</span>
      </div>
    </div>
  );
}

/* কার্ডকে স্ক্রিনের সাইজে ফিট করার র‍্যাপার (ডাউনলোডে সবসময় ফুল সাইজ) */
function ScaledCard({
  cardRef,
  onClick,
  children,
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const update = () => setScale(Math.min(1.12, el.clientWidth / 400));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrap} className="mx-auto w-full max-w-[450px]" style={{ height: 500 * scale }}>
      <div
        onClick={onClick}
        className="cursor-pointer drop-shadow-[0_20px_50px_rgba(37,99,235,0.45)]"
        style={{ width: 400, height: 500, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <div ref={cardRef} style={{ width: 400, height: 500 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ───────────── ডেট টাইল ───────────── */
function DateTile({ month, day, hot }: { month: number; day: number; hot?: boolean }) {
  return (
    <div
      className={`w-12 shrink-0 overflow-hidden rounded-xl border text-center leading-none sm:w-14 ${
        hot ? "border-emerald-400/70 shadow-[0_0_18px_rgba(34,197,94,0.4)]" : "border-slate-700/80"
      }`}
    >
      <div className={`py-1 text-[9px] font-bold tracking-wide ${hot ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white" : "bg-slate-800 text-slate-300"}`}>
        {MONTH_NAMES[month].slice(0, 3)}
      </div>
      <div className="bg-[#0b1220] py-1.5 text-lg font-black text-white sm:text-xl">{String(day).padStart(2, "0")}</div>
    </div>
  );
}

/* ───────────── প্লেয়ার রো ───────────── */
function PlayerRow({ entry, onOpen }: { entry: BdayEntry; onOpen: (p: Player) => void }) {
  const { player: p, month, day, daysLeft } = entry;
  const isToday = daysLeft === 0;
  return (
    <button
      onClick={() => onOpen(p)}
      className={`group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition active:scale-[0.99] sm:p-3 ${
        isToday
          ? "border-emerald-400/50 bg-gradient-to-r from-blue-500/15 to-emerald-500/5"
          : "border-slate-800/80 bg-[#0b1220]/70 hover:border-blue-400/50 hover:bg-[#0e1730]"
      }`}
    >
      <DateTile month={month} day={day} hot={isToday} />
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800 sm:h-12 sm:w-12">
        <img
          src={getPhoto(p)}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-110"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_PHOTO;
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-white transition group-hover:text-sky-300">{p.name}</p>
        <p className="truncate text-[11px] text-slate-400">
          @{p.nickName || "Player"} • {p.role}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
          isToday ? "bg-emerald-500 text-white" : daysLeft <= 7 ? "bg-amber-400/15 text-amber-300" : "bg-slate-800 text-slate-400"
        }`}
      >
        {leftLabel(daysLeft)}
      </span>
    </button>
  );
}

export default function BirthdayPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<any[]>([]);
  const [entries, setEntries] = useState<BdayEntry[]>([]);
  const [activeMonthTab, setActiveMonthTab] = useState<number>(new Date().getMonth());
  const [activeStar, setActiveStar] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState<Player | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        let list: Player[] = [];
        if (data.players && Array.isArray(data.players)) list = data.players;
        else if (Array.isArray(data)) list = data;
        if (data.tournaments && Array.isArray(data.tournaments)) setTournamentsData(data.tournaments);

        setPlayers(list);

        const result: BdayEntry[] = [];
        list.forEach((p) => {
          if (!p.birthday || p.birthday === "—" || p.birthday.trim() === "") return;
          const parsed = parseExcelBirthday(p.birthday);
          if (parsed.month === -1) return;
          result.push({
            player: p,
            month: parsed.month,
            day: parsed.day,
            text: parsed.text,
            daysLeft: daysUntil(parsed.month, parsed.day),
          });
        });
        setEntries(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading birthday data:", err);
        setLoading(false);
      });
  }, []);

  const todayStars = useMemo(() => entries.filter((e) => e.daysLeft === 0), [entries]);
  const isGroup = todayStars.length > 1;

  // একজন হলে অটো সিলেক্ট; একাধিক হলে ক্লিক করলে কার্ড দেখাবে
  const effectiveIdx = todayStars.length === 1 ? 0 : activeStar;
  const starEntry = effectiveIdx !== null ? todayStars[effectiveIdx] : undefined;
  const star = starEntry?.player;
  const dateText = starEntry ? `${String(starEntry.day).padStart(2, "0")} ${MONTH_NAMES[starEntry.month]}` : "";
  const dateBn = starEntry ? `${starEntry.day} ${MONTH_BN[starEntry.month]}` : "";

  const upcoming = useMemo(
    () => entries.filter((e) => e.daysLeft > 0).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 8),
    [entries]
  );

  const monthCounts = useMemo(() => {
    const c = new Array(12).fill(0);
    entries.forEach((e) => c[e.month]++);
    return c as number[];
  }, [entries]);

  const listToShow = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) {
      return entries
        .filter((e) => e.player.name.toLowerCase().includes(q) || (e.player.nickName || "").toLowerCase().includes(q))
        .sort((a, b) => a.month - b.month || a.day - b.day);
    }
    return entries.filter((e) => e.month === activeMonthTab).sort((a, b) => a.day - b.day);
  }, [entries, search, activeMonthTab]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlayingMusic(true);
    }
  };

  const pickStar = (i: number) => {
    setActiveStar(i);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleDownloadCard = async (player: Player) => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "transparent",
      });
      const link = document.createElement("a");
      const safeName = (player.nickName || player.name || "player").toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `FCL_Birthday_${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
      alert("কার্ড ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    }
    setDownloading(false);
  };

  const wishText = (name: string) =>
    `“প্রিয় ${name}, আজ তোমার বিশেষ দিন! মাঠের প্রতিটি ছক্কা-চারের মতোই জীবনটাও হোক আনন্দে ভরা। সুস্বাস্থ্য, সাফল্য আর অফুরন্ত হাসিতে ভরে উঠুক আগামীর প্রতিটি দিন। অনেক অনেক শুভেচ্ছা ও ভালোবাসা!”`;

  const DownloadButtons = () =>
    star ? (
      <div className="flex w-full flex-col gap-2.5 sm:flex-row">
        <button
          onClick={() => handleDownloadCard(star)}
          disabled={downloading}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-blue-600 to-emerald-500 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {downloading ? "⏳ কার্ড তৈরি হচ্ছে..." : "📥 কার্ড ডাউনলোড করুন (PNG)"}
        </button>
        <button
          onClick={() => setSelectedPlayerForModal(star)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-[#0b2a6f] shadow-lg transition hover:bg-sky-50 active:scale-[0.98]"
        >
          👤 পুরো প্রোফাইল দেখুন
        </button>
      </div>
    ) : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] pb-24 text-white selection:bg-blue-500/30">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@500;600;700;800&family=Hind+Siliguri:wght@500;600;700&display=swap');`}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.2),transparent_65%)]" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-emerald-500/15 blur-[120px]" />

      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/ambiences/birthday_party.ogg" loop />

      {/* ───────── টপ বার ───────── */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0b1220] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:text-white"
          >
            ← হোম
          </Link>
          <div className="flex items-center gap-2 text-sm font-black">
            <span>🎂</span>
            <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">FCL বার্থডে হাব</span>
          </div>
          <button
            onClick={toggleMusic}
            aria-label="মিউজিক চালু/বন্ধ"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              isPlayingMusic ? "border-emerald-400 bg-emerald-400/15 text-emerald-300" : "border-slate-800 bg-[#0b1220] text-slate-400"
            }`}
          >
            {isPlayingMusic ? "🎵" : "🔇"}
            <span className="hidden sm:inline">{isPlayingMusic ? "মিউজিক বাজছে" : "মিউজিক"}</span>
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-3 pt-5 sm:px-6 sm:pt-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center font-bold text-sky-400 animate-pulse">বার্থডে ডেটা লোড হচ্ছে...</div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {/* ═════════ আজকের জন্মদিন ═════════ */}
            {todayStars.length === 0 ? (
              <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0b1220] to-[#04060c] p-5 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
                <div className="text-center lg:text-left">
                  <p className="text-4xl">📅</p>
                  <h1 className="mt-2 text-2xl font-black sm:text-4xl">আজ কারো জন্মদিন নেই</h1>
                  <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-400 sm:text-sm">
                    পরের জন্মদিনগুলো নিচে দেখুন, অথবা মাস বেছে পুরো তালিকা ঘুরে আসুন।
                  </p>
                </div>
                {upcoming[0] && (
                  <button
                    onClick={() => setSelectedPlayerForModal(upcoming[0].player)}
                    className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-3 text-left transition hover:bg-emerald-500/10 lg:mt-0 lg:w-auto lg:min-w-[320px]"
                  >
                    <DateTile month={upcoming[0].month} day={upcoming[0].day} hot />
                    <div className="min-w-0">
                      <p className="text-[11px] text-emerald-300">পরের জন্মদিন • {leftLabel(upcoming[0].daysLeft)}</p>
                      <p className="truncate text-base font-extrabold">{upcoming[0].player.name}</p>
                    </div>
                  </button>
                )}
              </section>
            ) : (
              <section className="space-y-6">
                {/* ── একাধিক জন হলে: গ্রুপ ফোকাস প্যানেল ── */}
                {isGroup && (
                  <div className="relative overflow-hidden rounded-[2rem] border border-sky-400/30 bg-gradient-to-br from-[#0d1b4a] via-[#091233] to-[#04101f] p-5 shadow-2xl sm:p-8">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

                    <div className="relative z-10 text-center">
                      <p className="text-3xl sm:text-4xl">🎉🎂🎈</p>
                      <h1 className="mt-2 text-2xl font-black leading-tight sm:text-4xl">
                        আজ <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">{todayStars.length} জনের</span> জন্মদিন!
                      </h1>
                      <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">নামে ট্যাপ করুন — তার স্পেশাল উইশ কার্ড দেখুন ও ডাউনলোড করুন</p>
                    </div>

                    <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {todayStars.map((s, i) => {
                        const on = activeStar === i;
                        return (
                          <button
                            key={s.player.name + i}
                            onClick={() => pickStar(i)}
                            className={`group flex items-center gap-3.5 rounded-2xl border p-3 text-left transition active:scale-[0.98] ${
                              on
                                ? "border-emerald-400 bg-gradient-to-r from-blue-600/40 to-emerald-500/25 shadow-lg shadow-blue-500/20"
                                : "border-white/10 bg-white/[0.05] hover:border-sky-400/60 hover:bg-white/[0.09]"
                            }`}
                          >
                            <div className="rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 p-[3px]">
                              <img
                                src={getPhoto(s.player)}
                                alt={s.player.name}
                                className="h-14 w-14 rounded-full border-2 border-[#091233] object-cover sm:h-16 sm:w-16"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = FALLBACK_PHOTO;
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-black sm:text-base">{s.player.name}</p>
                              <p className="truncate text-[11px] text-slate-400">
                                @{s.player.nickName || "Player"} • {s.player.role}
                              </p>
                              <span
                                className={`mt-1.5 inline-block rounded-full px-3 py-1 text-[11px] font-black ${
                                  on ? "bg-emerald-500 text-white" : "bg-white text-[#0b2a6f]"
                                }`}
                              >
                                {on ? "✓ কার্ড দেখছেন" : "🎁 উইশ কার্ড দেখুন"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── উইশ কার্ড ডিটেইল ── */}
                {star && (
                  <div
                    ref={detailRef}
                    className="relative scroll-mt-20 overflow-hidden rounded-[2rem] border border-sky-400/25 bg-gradient-to-br from-[#0d1b4a] via-[#070d1a] to-[#04060c] p-4 shadow-2xl sm:p-8 lg:p-12"
                  >
                    <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

                    <div className="relative z-10 grid items-center gap-6 lg:grid-cols-12 lg:gap-12">
                      {/* ইনফো */}
                      <div className="text-center lg:col-span-7 lg:text-left">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
                          🏆 Happy Birthday Champion!
                        </span>
                        <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-[11px] font-bold text-sky-300">
                          🎂 {dateBn}
                        </span>

                        <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
                          শুভ জন্মদিন,
                          <br />
                          <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-emerald-400 bg-clip-text text-transparent">{star.name}</span> 🎉
                        </h2>

                        {/* উইশ মেসেজ */}
                        <div className="relative mx-auto mt-4 max-w-xl rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 text-left backdrop-blur sm:p-5 lg:mx-0">
                          <span className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-0.5 text-[10px] font-black">
                            💌 FCL পরিবারের শুভেচ্ছা
                          </span>
                          <p className="pt-1 text-[13px] leading-relaxed text-slate-200 sm:text-[15px] sm:leading-8">{wishText(star.name)}</p>
                          <p className="mt-2 text-right text-xs font-black text-sky-300 sm:text-sm">— FCL Family</p>
                        </div>

                        {/* পিসি: স্ট্যাট */}
                        <div className="mt-6 hidden grid-cols-3 gap-4 lg:grid">
                          {[
                            { label: "ম্যাচ", value: star.matches, color: "text-white" },
                            { label: "রান", value: star.runs, color: "text-sky-400" },
                            { label: "উইকেট", value: star.wickets, color: "text-emerald-400" },
                          ].map((s) => (
                            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                              <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
                              <p className="mt-1 text-xs font-semibold text-slate-400">{s.label}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 hidden lg:block">
                          <DownloadButtons />
                        </div>
                      </div>

                      {/* কার্ড */}
                      <div className="lg:col-span-5">
                        <ScaledCard cardRef={cardRef} onClick={() => setSelectedPlayerForModal(star)}>
                          <WishCard player={star} dateText={dateText} />
                        </ScaledCard>

                        {/* মোবাইল */}
                        <div className="mx-auto mt-5 max-w-[450px] space-y-3 lg:hidden">
                          <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/30 py-2.5 text-center">
                            <div>
                              <p className="text-base font-black">{star.matches}</p>
                              <p className="text-[10px] text-slate-400">ম্যাচ</p>
                            </div>
                            <div>
                              <p className="text-base font-black text-sky-400">{star.runs}</p>
                              <p className="text-[10px] text-slate-400">রান</p>
                            </div>
                            <div>
                              <p className="text-base font-black text-emerald-400">{star.wickets}</p>
                              <p className="text-[10px] text-slate-400">উইকেট</p>
                            </div>
                          </div>
                          <DownloadButtons />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ═════════ আসন্ন জন্মদিন ═════════ */}
            {upcoming.length > 0 && (
              <section>
                <div className="mb-3 flex items-end justify-between">
                  <h2 className="text-base font-black sm:text-xl">⏳ আসন্ন জন্মদিন</h2>
                  <span className="text-[11px] text-slate-500">পরের {upcoming.length} জন</span>
                </div>
                <div className="-mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
                  {upcoming.map((e, i) => (
                    <button
                      key={e.player.name + i}
                      onClick={() => setSelectedPlayerForModal(e.player)}
                      className="group w-[150px] shrink-0 snap-start rounded-2xl border border-slate-800 bg-[#0b1220]/80 p-3 text-center transition hover:border-blue-400/50 sm:w-[170px]"
                    >
                      <div className="mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-slate-700 sm:h-[72px] sm:w-[72px]">
                        <img
                          src={getPhoto(e.player)}
                          alt={e.player.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition group-hover:scale-110"
                          onError={(ev) => {
                            (ev.currentTarget as HTMLImageElement).src = FALLBACK_PHOTO;
                          }}
                        />
                      </div>
                      <p className="mt-2 truncate text-xs font-extrabold sm:text-sm">{e.player.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {String(e.day).padStart(2, "0")} {MONTH_BN[e.month]}
                      </p>
                      <span className="mt-2 inline-block rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                        {leftLabel(e.daysLeft)}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ═════════ মাসভিত্তিক ডিরেক্টরি ═════════ */}
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-black sm:text-2xl">📅 বার্থডে ক্যালেন্ডার</h2>
                  <p className="mt-0.5 text-xs text-slate-400">মাস বেছে নিন অথবা নাম লিখে খুঁজুন</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="প্লেয়ারের নাম খুঁজুন..."
                    className="w-full rounded-2xl border border-slate-800 bg-[#0b1220] py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      aria-label="সার্চ মুছুন"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* 📱 মোবাইল: ৪×৩ প্রিমিয়াম মাস গ্রিড */}
              {!search && (
                <div className="mb-4 grid grid-cols-4 gap-2 lg:hidden">
                  {MONTH_BN.map((m, i) => {
                    const active = activeMonthTab === i;
                    const isNow = new Date().getMonth() === i;
                    return (
                      <button
                        key={m}
                        onClick={() => setActiveMonthTab(i)}
                        className={`relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border px-1 py-3 transition active:scale-95 ${
                          active
                            ? "border-white/30 bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-600/40"
                            : "border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] text-slate-300"
                        }`}
                      >
                        {active && <span className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 rounded-full bg-white/25 blur-xl" />}
                        {isNow && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-300" />}
                        <span className="text-[12px] font-extrabold leading-tight">{m}</span>
                        <span
                          className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
                            active ? "bg-white text-[#0b2a6f]" : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {monthCounts[i]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                {/* 💻 পিসি: সাইডবার */}
                {!search && (
                  <aside className="hidden lg:col-span-3 lg:block">
                    <div className="sticky top-20 space-y-1.5 rounded-3xl border border-slate-800 bg-[#0b1220]/70 p-3">
                      {MONTH_BN.map((m, i) => {
                        const active = activeMonthTab === i;
                        const isNow = new Date().getMonth() === i;
                        return (
                          <button
                            key={m}
                            onClick={() => setActiveMonthTab(i)}
                            className={`flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                              active
                                ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-600/25"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {m}
                              {isNow && <span className="h-1.5 w-1.5 rounded-full bg-amber-300" title="চলতি মাস" />}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white text-[#0b2a6f]" : "bg-slate-800 text-slate-300"}`}>
                              {monthCounts[i]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </aside>
                )}

                {/* তালিকা */}
                <div className={search ? "lg:col-span-12" : "lg:col-span-9"}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black text-sky-300 sm:text-base">
                      {search ? `"${search}" — ${listToShow.length} জন পাওয়া গেছে` : `${MONTH_BN[activeMonthTab]} মাস • ${listToShow.length} জন`}
                    </h3>
                  </div>

                  {listToShow.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-[#0b1220]/60 p-8 text-center text-xs text-slate-400">
                      {search ? "এই নামে কাউকে পাওয়া যায়নি। অন্য নাম লিখে দেখুন।" : "এই মাসে কোনো জন্মদিন নেই।"}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2">
                      {listToShow.map((e, i) => (
                        <PlayerRow key={e.player.name + i} entry={e} onOpen={setSelectedPlayerForModal} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <PlayerCardModal
        selectedPlayer={selectedPlayerForModal}
        onClose={() => setSelectedPlayerForModal(null)}
        tournamentsData={tournamentsData}
        allPlayers={players}
      />
    </div>
  );
}