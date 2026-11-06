"use client";

import { useState, useEffect, useRef, useMemo, type RefObject } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import PlayerCardModal from "@/components/PlayerCardModal";

function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const read = () => {
      const h = document.documentElement;
      const b = document.body;
      const dt = (
        h.getAttribute("data-theme") ||
        h.getAttribute("data-mode") ||
        b.getAttribute("data-theme") ||
        ""
      ).toLowerCase();
      if (dt === "dark" || dt === "light") return dt === "dark";

      const cls = `${h.className} ${b.className}`.toLowerCase();
      if (/\blight\b/.test(cls)) return false;
      if (/\bdark\b/.test(cls)) return true;

      const scheme = h.style.colorScheme;
      if (scheme === "light" || scheme === "dark") return scheme === "dark";

      try {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") return saved === "dark";
      } catch {}

      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    };

    const update = () => setIsDark(read());
    update();

    const obs = new MutationObserver(update);
    const opts = { attributes: true, attributeFilter: ["class", "data-theme", "data-mode", "style"] };
    obs.observe(document.documentElement, opts);
    obs.observe(document.body, opts);
    window.addEventListener("storage", update);

    return () => {
      obs.disconnect();
      window.removeEventListener("storage", update);
    };
  }, []);

  return isDark;
}

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
  daysAgo: number;
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

const FB_PROFILE_URL = "https://www.facebook.com/arifrockss";
const MESSENGER_URL = "https://m.me/arifrockss";

const WISH_MESSAGES = [
  (name: string) => `প্রিয় ${name}, আজ আপনার বিশেষ দিন। মাঠের প্রতিটি চার-ছক্কার মতোই আপনার জীবনও আনন্দে ভরে উঠুক। সুস্বাস্থ্য, সাফল্য ও অফুরন্ত হাসিতে কাটুক আগামীর প্রতিটি দিন। শুভ জন্মদিন!`,
  (name: string) => `শুভ জন্মদিন, ${name}! আপনার অসাধারণ খেলা ও দলের প্রতি নিষ্ঠা আমাদের সবসময় অনুপ্রাণিত করে। আজকের দিনে কামনা করি, আপনার প্রতিটি ইনিংস জয়ের বার্তা বয়ে আনুক।`,
  (name: string) => `জন্মদিনের শুভেচ্ছা, ${name}! এফসিএল পরিবারের পক্ষ থেকে আপনাকে জানাই ভালোবাসা ও অভিনন্দন। মাঠে যেমন লড়াকু, জীবনেও সব বাধা পেরিয়ে সাফল্যের শিখরে পৌঁছান—এই কামনা করি।`,
  (name: string) => `শুভ জন্মদিন ${name}! আপনার চমৎকার পারফরম্যান্স আমাদের সবসময় গর্বিত করে। আপনার জীবন হোক চার-ছক্কায় ভরপুর এক দুর্দান্ত ইনিংস। অনেক অনেক শুভকামনা রইল।`,
  (name: string) => `আশা করি আজকের দিনটি আপনার জন্য দারুণ কিছু বয়ে আনবে, ${name}। মাঠে যেমন সেরাটা দেন, জীবনের প্রতিটি ক্ষেত্রেও তেমনই জয় ছিনিয়ে আনুন—এই শুভকামনা রইল।`,
  (name: string) => `Happy Birthday, ${name}! May your special day bring you immense joy, great health, and countless wonderful moments both on and off the cricket field. Cheers to another great year!`,
  (name: string) => `Wishing a fantastic birthday to our star player, ${name}! Your passion, dedication, and fighting spirit on the pitch always inspire us. Keep shining and smashing records!`,
  (name: string) => `Happy Birthday ${name}! May this year bring you closer to all your goals and fill your life with success, happiness, and memorable victories with the team.`,
  (name: string) => `Cheers to a true champion, ${name}! Wishing you a wonderful birthday filled with love, laughter, and great achievements in every match you play.`,
  (name: string) => `Happy Birthday to our MVP, ${name}! Thank you for always giving your best performance. May your life's innings be filled with endless boundaries of success!`,
];

function getPlayerWish(player: Player, salt: number) {
  const seed = (player.id || 0) + player.name.length + salt;
  const index = seed % WISH_MESSAGES.length;
  return WISH_MESSAGES[index](player.name);
}

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

function hasPhotoField(p: Player) {
  const raw = p.photo || p.photoUrl;
  return !!raw && raw !== "—" && String(raw).trim() !== "";
}

function pKey(p: Player) {
  return `${p.id ?? ""}|${p.name}`;
}

function playerHasPhoto(p: Player, broken: Set<string>) {
  return hasPhotoField(p) && !broken.has(pKey(p));
}

function daysUntil(month: number, day: number) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(today.getFullYear(), month, day);
  if (target < today) target = new Date(today.getFullYear() + 1, month, day);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function daysSince(month: number, day: number) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(today.getFullYear(), month, day);
  if (target > today) target = new Date(today.getFullYear() - 1, month, day);
  return Math.round((today.getTime() - target.getTime()) / 86400000);
}

function leftLabel(d: number) {
  if (d === 0) return "আজ";
  if (d === 1) return "আগামীকাল";
  return `${d} দিন বাকি`;
}

function agoLabel(d: number) {
  if (d === 0) return "আজ";
  if (d === 1) return "গতকাল";
  return `${d} দিন আগে`;
}

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

function RoseIcon({ style, size = 28, absolute = true }: { style?: React.CSSProperties; size?: number; absolute?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ ...(absolute ? { position: "absolute" } : { display: "block", flexShrink: 0 }), ...style }}>
      <path d="M16 4c-3 0-6 2-6 5 0 2 1 4 3 5l-3 6h3l1.5-3h3L19 20h3l-3-6c2-1 3-3 3-5 0-3-3-5-6-5z" fill="#e11d48" />
      <path d="M16 9c-1 0-2 1-2 2s1 2 2 2 2-1 2-2-1-2-2-2z" fill="#fb7185" />
      <path d="M11 23c2 1 6 1 10 0" stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M14 25c1 1 3 1 4 0" stroke="#15803d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function GiftBox() {
  return (
    <svg width="38" height="38" viewBox="0 0 48 48" style={{ position: "absolute", left: 16, bottom: 32 }}>
      <rect x="5" y="20" width="38" height="24" rx="2" fill="#1d4ed8" />
      <rect x="3" y="14" width="42" height="9" rx="2" fill="#2563eb" />
      <rect x="21" y="14" width="6" height="30" fill="#fff" />
      <path d="M24 14C14 0 6 10 24 14C42 10 34 0 24 14Z" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function CricketBall() {
  return (
    <svg width="34" height="34" viewBox="0 0 42 42" style={{ position: "absolute", right: 18, bottom: 32 }}>
      <circle cx="21" cy="21" r="19" fill="#b91c1c" />
      <circle cx="15" cy="14" r="8" fill="#ef4444" opacity=".55" />
      <path d="M9 7Q23 21 9 35" stroke="#fff" strokeWidth="1.6" fill="none" strokeDasharray="3 2.2" />
      <path d="M33 7Q19 21 33 35" stroke="#fff" strokeWidth="1.6" fill="none" strokeDasharray="3 2.2" />
    </svg>
  );
}

function WishCard({ player, dateText, salt }: { player: Player; dateText: string; salt: number }) {
  const len = player.name.length;
  const nameSize = len > 26 ? 15 : len > 20 ? 17 : len > 14 ? 19 : 22;
  const dynamicWishText = getPlayerWish(player, salt);

  const chips = [
    { icon: "🏆", label: "Champion", v: player.champion },
    { icon: "⭐", label: "MoM", v: player.mom },
    { icon: "🎯", label: "Hat-trick", v: player.hatTricks },
    { icon: "🚀", label: "Debut", v: player.debutYear },
  ].filter((c) => c.v !== undefined && c.v !== null && String(c.v) !== "" && String(c.v) !== "0" && String(c.v) !== "—");

  return (
    <div
      style={{
        width: 400, height: 500, position: "relative", overflow: "hidden", borderRadius: 28,
        background: "linear-gradient(180deg,#ffffff 0%,#eaf2ff 45%,#cfe2ff 100%)",
        fontFamily: "'Poppins','Hind Siliguri',sans-serif", boxShadow: "0 0 0 4px rgba(255,255,255,.9)",
      }}
    >
      <svg width="400" height="500" viewBox="0 0 400 500" style={{ position: "absolute", inset: 0 }}>
        <path d="M0 0H84Q36 22 0 84Z" fill="#1d4ed8" />
        <path d="M0 0H44Q18 12 0 40Z" fill="#2563eb" />
        <path d="M10 58Q40 24 96 6" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M400 0H330Q372 20 400 74Z" fill="#2563eb" opacity=".9" />
        <path d="M0 448Q120 484 215 470T400 436V470H0Z" fill="#1d4ed8" />
        <path d="M0 458Q108 490 205 478" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M400 448Q330 470 262 474" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>

      <Balloon color="#2563eb" dark="#1e3a8a" w={42} style={{ left: -12, top: 112 }} />
      <RoseIcon style={{ left: 10, top: 168 }} />
      <Balloon color="#22c55e" dark="#15803d" w={42} style={{ right: -10, top: 104 }} />
      <RoseIcon style={{ right: 12, top: 162 }} />

      <GiftBox />
      <CricketBall />

      <div style={{ position: "absolute", left: 52, top: 28, transform: "rotate(-6deg)", fontFamily: "'Pacifico',cursive", fontSize: 9.5, lineHeight: 1.25, color: "#1d4ed8", textAlign: "center" }}>
        More Birthdays<br />More Happiness ♡
      </div>
      <div style={{ position: "absolute", right: 52, top: 22, transform: "rotate(6deg)", fontFamily: "'Pacifico',cursive", fontSize: 9.5, lineHeight: 1.25, color: "#1d4ed8", textAlign: "center" }}>
        Same Team<br />Same Dream<br />FCL
      </div>

      <div style={{ position: "absolute", top: 4, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff", padding: 1.5, border: "2px solid #1d4ed8", boxShadow: "0 2px 8px rgba(29,78,216,.3)" }}>
          <img src="/fcl-logo.png" alt="FCL" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }} />
        </div>

        <div style={{ fontFamily: "'Pacifico',cursive", fontSize: 14, color: "#2563eb", lineHeight: 1, marginTop: 1 }}>Happy</div>
        <div style={{ fontFamily: "'Pacifico',cursive", fontSize: 28, lineHeight: 1, color: "#1e40af", textShadow: "1.5px 1.5px 0 #fff,-1.5px -1.5px 0 #fff" }}>
          Birthday
        </div>
        <div style={{ marginTop: 1, width: 110, height: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(90deg,#1d4ed8,#22c55e)", color: "#fff", fontFamily: "'Pacifico',cursive", fontSize: 10, clipPath: "polygon(0 0,100% 0,94% 50%,100% 100%,0 100%,6% 50%)" }}>
          Champion
        </div>

        <div style={{ marginTop: 3, padding: 3, borderRadius: "50%", background: "linear-gradient(135deg,#e11d48,#1d4ed8,#22c55e)", boxShadow: "0 6px 16px rgba(29,78,216,0.4)" }}>
          <div style={{ width: 136, height: 136, borderRadius: "50%", overflow: "hidden", border: "3px solid #fff", background: "#e2e8f0" }}>
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

        <div style={{ marginTop: 3, fontSize: nameSize, fontWeight: 800, color: "#0b2a6f", lineHeight: 1.15, textAlign: "center", width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {player.name}
        </div>
        <div style={{ marginTop: 2.5, display: "flex", gap: 5, alignItems: "center", justifyContent: "center" }}>
          <div style={{ padding: "2px 8px", borderRadius: 999, background: "#0b1220", color: "#fff", fontSize: 8.5, fontWeight: 600 }}>
            @{player.nickName || "Player"} • {player.role}
          </div>
          <div style={{ padding: "2px 8px", borderRadius: 999, background: "linear-gradient(90deg,#1d4ed8,#16a34a)", color: "#fff", fontSize: 8.5, fontWeight: 700 }}>
            🎂 {dateText}
          </div>
        </div>

        <div style={{ margin: "9px 0", width: "100%", display: "flex", alignItems: "stretch", gap: 4 }}>
          <div style={{ width: 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", flexShrink: 0 }}>
            <RoseIcon absolute={false} size={20} />
            <span style={{ fontFamily: "Georgia,serif", fontSize: 30, lineHeight: "18px", height: 18, color: "#1d4ed8", fontWeight: 700 }}>“</span>
          </div>

          <div style={{ flex: 1, textAlign: "center", color: "#1e3a8a", fontSize: 10.5, lineHeight: 1.4, fontWeight: 500, paddingTop: 14 }}>
            {dynamicWishText}
            <div style={{ fontWeight: 800, fontSize: 9.5, color: "#1d4ed8", marginTop: 3 }}>— FCL Family</div>
          </div>

          <div style={{ width: 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", flexShrink: 0 }}>
            <RoseIcon absolute={false} size={20} />
            <span style={{ fontFamily: "Georgia,serif", fontSize: 30, lineHeight: "18px", height: 18, color: "#1d4ed8", fontWeight: 700 }}>”</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 7, width: 240 }}>
          {[
            { l: "Matches", v: player.matches },
            { l: "Runs", v: player.runs },
            { l: "Wickets", v: player.wickets },
          ].map((s) => (
            <div key={s.l} style={{ flex: 1, textAlign: "center", background: "#fff", border: "1.5px solid #bfdbfe", borderRadius: 8, padding: "2px 0", boxShadow: "0 2px 5px rgba(29,78,216,.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#1d4ed8", lineHeight: 1.1 }}>{s.v}</div>
              <div style={{ fontSize: 7, fontWeight: 600, color: "#64748b" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {chips.length > 0 && (
          <div style={{ marginTop: 6, display: "flex", gap: 5, justifyContent: "center", flexWrap: "nowrap" }}>
            {chips.map((c) => (
              <div
                key={c.label}
                style={{ padding: "2px 7px", borderRadius: 999, background: "#fff", border: "1.2px solid #93c5fd", color: "#0b2a6f", fontSize: 8, fontWeight: 700, whiteSpace: "nowrap" }}
              >
                {c.icon} {c.label}: {c.v}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 24, background: "#0b2a6f",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          color: "#fff", fontSize: 9, fontWeight: 600, zIndex: 3,
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

function MessengerIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.42 3.13 7.16.16.14.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.98-.87c.17-.07.35-.09.52-.05.91.25 1.88.38 2.93.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2Zm6 7.46-2.94 4.66c-.47.74-1.47.93-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.19-.69-.64l2.94-4.66c.47-.74 1.47-.93 2.17-.4l2.34 1.75c.21.16.5.16.72 0l3.16-2.4c.42-.32.97.19.69.64Z" />
    </svg>
  );
}

function DateTile({ month, day, hot }: { month: number; day: number; hot?: boolean }) {
  return (
    <div
      className={`w-12 shrink-0 overflow-hidden rounded-xl border text-center leading-none sm:w-14 ${
        hot ? "border-emerald-400/70 shadow-[0_0_18px_rgba(34,197,94,0.4)]" : "bd-line2"
      }`}
    >
      <div className={`py-1 text-[9px] font-bold tracking-wide ${hot ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white" : "bd-chip"}`}>
        {MONTH_NAMES[month].slice(0, 3)}
      </div>
      <div className="bd-tile-body py-1.5 text-lg font-black sm:text-xl">{String(day).padStart(2, "0")}</div>
    </div>
  );
}

function PlayerRow({
  entry,
  onOpen,
  onCard,
  hasPhoto,
  onMessenger,
}: {
  entry: BdayEntry;
  onOpen: (p: Player) => void;
  onCard: (e: BdayEntry) => void;
  hasPhoto: boolean;
  onMessenger: (name: string) => void;
}) {
  const { player: p, month, day, daysLeft } = entry;
  const isToday = daysLeft === 0;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(p)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(p);
        }
      }}
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-2.5 text-left transition active:scale-[0.99] sm:p-3 ${
        isToday ? "border-emerald-400/50 bg-gradient-to-r from-blue-500/15 to-emerald-500/5" : "bd-row"
      }`}
    >
      <DateTile month={month} day={day} hot={isToday} />
      <div className="relative shrink-0">
        <div className="bd-avatar h-11 w-11 overflow-hidden rounded-full border-2 sm:h-12 sm:w-12">
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
        {!hasPhoto && (
          <span
            title="ছবি নেই"
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white ring-2 ring-white/70"
          >
            !
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="bd-name truncate text-sm font-extrabold transition">{p.name}</p>
        <p className="bd-sub truncate text-[11px]">
          @{p.nickName || "Player"} • {p.role}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
            isToday ? "bg-emerald-500 text-white" : daysLeft <= 7 ? "bd-amber-pill" : "bd-chip"
          }`}
        >
          {leftLabel(daysLeft)}
        </span>
        <div className="flex gap-1">
          {!hasPhoto && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMessenger(p.name);
              }}
              title="Messenger-এ ছবি পাঠান"
              className="inline-flex h-6 items-center gap-1 rounded-full bg-[#0084ff] px-2 text-[10px] font-bold text-white transition hover:brightness-110"
            >
              <MessengerIcon size={11} /> ছবি দিন
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCard(entry);
            }}
            title="বার্থডে কার্ড নামান"
            className="bd-chip inline-flex h-6 items-center gap-1 rounded-full px-2 text-[10px] font-bold transition hover:brightness-110"
          >
            🎁 কার্ড
          </button>
        </div>
      </div>
    </div>
  );
}

function CardStudio({
  entry,
  salt,
  hasPhoto,
  downloading,
  onClose,
  onNewWish,
  onDownload,
  onProfile,
  onMessenger,
}: {
  entry: BdayEntry;
  salt: number;
  hasPhoto: boolean;
  downloading: boolean;
  onClose: () => void;
  onNewWish: () => void;
  onDownload: (p: Player, ref: RefObject<HTMLDivElement | null>) => void;
  onProfile: (p: Player) => void;
  onMessenger: (name: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { player, month, day, daysLeft, daysAgo } = entry;
  const dateText = `${String(day).padStart(2, "0")} ${MONTH_NAMES[month]}`;
  const when = daysLeft === 0 ? "আজ" : daysAgo <= daysLeft ? agoLabel(daysAgo) : leftLabel(daysLeft);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="bd-panel relative max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] border p-4 sm:rounded-[2rem] sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="bd-head text-base font-black sm:text-lg">🎁 বার্থডে কার্ড</h3>
            <p className="bd-sub mt-0.5 truncate text-xs">
              {player.name} • {day} {MONTH_BN[month]} • {when}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="bd-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <ScaledCard cardRef={ref} onClick={() => onProfile(player)}>
          <WishCard player={player} dateText={dateText} salt={salt} />
        </ScaledCard>
        <p className="bd-faint mt-2 text-center text-[10px]">কার্ডে ট্যাপ করলে প্লেয়ার প্রোফাইল খুলবে</p>

        {!hasPhoto && (
          <div className="bd-glass mt-3 flex items-center gap-3 rounded-2xl border p-3">
            <span className="text-2xl">📸</span>
            <p className="bd-text2 min-w-0 flex-1 text-[11px] leading-snug sm:text-xs">
              এই প্লেয়ারের ছবি নেই। ছবি দিলে কার্ড আরও সুন্দর হবে — সরাসরি Messenger-এ পাঠান।
            </p>
            <button
              onClick={() => onMessenger(player.name)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0084ff] px-3 py-2 text-[11px] font-black text-white transition hover:brightness-110"
            >
              <MessengerIcon size={13} /> ছবি দিন
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={() => onDownload(player, ref)}
            disabled={downloading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-blue-600 to-emerald-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {downloading ? "⏳ তৈরি হচ্ছে..." : "📥 ডাউনলোড (PNG)"}
          </button>
          <button
            onClick={onNewWish}
            className="bd-sky-btn flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition active:scale-[0.98]"
          >
            🎲 নতুন উইশ
          </button>
          <button
            onClick={() => onProfile(player)}
            className="bd-white-btn flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition active:scale-[0.98]"
          >
            👤 প্রোফাইল
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BirthdayPage() {
  const isDark = useIsDark();
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
  const [wishSalt, setWishSalt] = useState<number>(() => Math.floor(Math.random() * 1000));

  const [brokenPhotos, setBrokenPhotos] = useState<Set<string>>(new Set());
  const [cardEntry, setCardEntry] = useState<BdayEntry | null>(null);
  const [showMissing, setShowMissing] = useState(false);
  const [toast, setToast] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLElement | null>(null);

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
            daysAgo: daysSince(parsed.month, parsed.day),
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

  useEffect(() => {
    if (!players.length) return;
    let cancelled = false;
    players.forEach((p) => {
      if (!hasPhotoField(p)) return;
      const img = new Image();
      img.onerror = () => {
        if (cancelled) return;
        setBrokenPhotos((prev) => {
          const n = new Set(prev);
          n.add(pKey(p));
          return n;
        });
      };
      img.src = getPhoto(p);
    });
    return () => {
      cancelled = true;
    };
  }, [players]);

  useEffect(() => {
    if (!cardEntry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCardEntry(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [cardEntry]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const todayStars = useMemo(() => entries.filter((e) => e.daysLeft === 0), [entries]);
  const isGroup = todayStars.length > 1;

  const effectiveIdx = todayStars.length === 1 ? 0 : activeStar;
  const starEntry = effectiveIdx !== null ? todayStars[effectiveIdx] : undefined;
  const star = starEntry?.player;
  const dateText = starEntry ? `${String(starEntry.day).padStart(2, "0")} ${MONTH_NAMES[starEntry.month]}` : "";
  const dateBn = starEntry ? `${starEntry.day} ${MONTH_BN[starEntry.month]}` : "";

  const upcoming = useMemo(
    () => entries.filter((e) => e.daysLeft > 0).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 8),
    [entries]
  );

  const recent = useMemo(
    () => entries.filter((e) => e.daysAgo >= 1 && e.daysAgo <= 15).sort((a, b) => a.daysAgo - b.daysAgo),
    [entries]
  );

  const monthCounts = useMemo(() => {
    const c = new Array(12).fill(0);
    entries.forEach((e) => c[e.month]++);
    return c as number[];
  }, [entries]);

  const stats = useMemo(() => {
    const total = players.length;
    const missing = players.filter((p) => !playerHasPhoto(p, brokenPhotos));
    const withPhoto = total - missing.length;
    const pct = total ? Math.round((withPhoto / total) * 100) : 0;
    const next7 = entries.filter((e) => e.daysLeft >= 1 && e.daysLeft <= 7).length;
    const maxC = Math.max(...monthCounts, 0);
    const busiest = maxC > 0 ? monthCounts.indexOf(maxC) : -1;
    return {
      total,
      withPhoto,
      missing,
      pct,
      bdayCount: entries.length,
      noBirthday: total - entries.length,
      thisMonth: monthCounts[new Date().getMonth()] || 0,
      next7,
      busiest,
      maxC,
    };
  }, [players, entries, brokenPhotos, monthCounts]);

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

  const scrollToCalendar = () => {
    const el = calendarRef.current;
    if (!el) return;
    const yOffset = -80; // স্টিকি হেডারের উচ্চতা অনুযায়ী অফসেট
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const pickStar = (i: number) => {
    setActiveStar(i);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const openMessenger = (name?: string) => {
    const text = name
      ? `আসসালামু আলাইকুম ভাই, আমি ${name}। FCL বার্থডে হাবে আমার ছবি নেই। আমার ছবিটি পাঠালাম, দয়া করে আপডেট করে দিন।`
      : `আসসালামু আলাইকুম ভাই, আমি FCL-এর একজন প্লেয়ার। আমার ছবি/তথ্য আপডেট করার জন্য মেসেজ দিচ্ছি।`;
    window.open(MESSENGER_URL, "_blank", "noopener,noreferrer");
    try {
      navigator.clipboard?.writeText(text).catch(() => {});
      setToast("📋 মেসেজ কপি হয়েছে — Messenger-এ পেস্ট করে ছবিসহ পাঠান");
    } catch {
      setToast("Messenger খোলা হচ্ছে...");
    }
  };

  const handleDownloadCard = async (
    player: Player,
    ref: RefObject<HTMLDivElement | null> = cardRef
  ) => {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ref.current, {
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

  const openProfileFromStudio = (p: Player) => {
    setCardEntry(null);
    setSelectedPlayerForModal(p);
  };

  const DownloadButtons = () =>
    star ? (
      <div className="flex w-full flex-col gap-2.5 sm:flex-row">
        <button
          onClick={() => handleDownloadCard(star)}
          disabled={downloading}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-blue-600 to-emerald-500 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {downloading ? "⏳ কার্ড তৈরি হচ্ছে..." : "📥 ডাউনলোড করুন (PNG)"}
        </button>
        <button
          onClick={() => setWishSalt((s) => s + 1)}
          className="bd-sky-btn flex items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-black transition active:scale-[0.98]"
        >
          🎲 নতুন উইশ
        </button>
        <button
          onClick={() => setSelectedPlayerForModal(star)}
          className="bd-white-btn flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black shadow-lg transition active:scale-[0.98]"
        >
          👤 পুরো প্রোফাইল দেখুন
        </button>
      </div>
    ) : null;

  const starHasPhoto = star ? playerHasPhoto(star, brokenPhotos) : true;

  return (
    <div className={`bd-root ${isDark ? "bd-dark" : "bd-light"} relative min-h-screen overflow-hidden pb-24 selection:bg-blue-500/30`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Poppins:wght@500;600;700;800&family=Hind+Siliguri:wght@500;600;700&display=swap');`}</style>
      <style>{`
        .bd-root {
          --bg: #f8fafc;
          --surface: #ffffff;
          --surface-2: #f1f5f9;
          --head: #0f172a;
          --text: #334155;
          --text2: #475569;
          --sub: #64748b;
          --faint: #64748b;
          --line: #e2e8f0;
          --line2: #cbd5e1;
          --sky: #0369a1;
          --sky2: #0284c7;
          --em: #047857;
          --em2: #059669;
          --amber: #b45309;
          --chip-bg: #e2e8f0;
          --chip-text: #475569;
          --glass-bg: rgba(255, 255, 255, 0.78);
          --glass-hover: #ffffff;
          --glass-line: #bfdbfe;
          --hover: rgba(15, 23, 42, 0.05);
          --header-bg: rgba(255, 255, 255, 0.88);
          --hline: #e2e8f0;
          --panel: linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #ecfdf5 100%);
          --panel-line: #bae6fd;
          --panel-ring: #ffffff;
          --panel-empty: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
          --panel-shadow: 0 20px 60px rgba(15, 23, 42, 0.10);
          --g1: #0369a1;
          --g2: #047857;
          --g3: #1d4ed8;
          --btn-bg: #0f172a;
          --btn-text: #ffffff;
          background: var(--bg);
          color: var(--head);
          transition: background 0.3s ease, color 0.3s ease;
        }
        .bd-root.bd-dark {
          --bg: #020617;
          --surface: #0b1220;
          --surface-2: #0e1730;
          --head: #ffffff;
          --text: #e2e8f0;
          --text2: #cbd5e1;
          --sub: #94a3b8;
          --faint: #64748b;
          --line: #1e293b;
          --line2: #334155;
          --sky: #7dd3fc;
          --sky2: #38bdf8;
          --em: #6ee7b7;
          --em2: #34d399;
          --amber: #fcd34d;
          --chip-bg: #1e293b;
          --chip-text: #cbd5e1;
          --glass-bg: rgba(255, 255, 255, 0.05);
          --glass-hover: rgba(255, 255, 255, 0.09);
          --glass-line: rgba(255, 255, 255, 0.1);
          --hover: rgba(255, 255, 255, 0.05);
          --header-bg: rgba(2, 6, 23, 0.8);
          --hline: rgba(255, 255, 255, 0.05);
          --panel: linear-gradient(135deg, #0d1b4a 0%, #091233 50%, #04101f 100%);
          --panel-line: rgba(56, 189, 248, 0.3);
          --panel-ring: #091233;
          --panel-empty: linear-gradient(135deg, #0b1220 0%, #04060c 100%);
          --panel-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          --g1: #38bdf8;
          --g2: #34d399;
          --g3: #93c5fd;
          --btn-bg: #ffffff;
          --btn-text: #0b2a6f;
        }

        .bd-root .bd-head { color: var(--head); }
        .bd-root .bd-text { color: var(--text); }
        .bd-root .bd-text2 { color: var(--text2); }
        .bd-root .bd-sub { color: var(--sub); }
        .bd-root .bd-faint { color: var(--faint); }
        .bd-root .bd-sky { color: var(--sky); }
        .bd-root .bd-sky2 { color: var(--sky2); }
        .bd-root .bd-em { color: var(--em); }
        .bd-root .bd-em2 { color: var(--em2); }
        .bd-root .bd-amber { color: var(--amber); }
        .bd-root .bd-line2 { border-color: var(--line2); }
        .bd-root .bd-chip { background: var(--chip-bg); color: var(--chip-text); }
        .bd-root .bd-amber-pill { background: rgba(245, 158, 11, 0.15); color: var(--amber); }
        .bd-root .bd-tile-body { background: var(--surface); color: var(--head); }

        .bd-root .bd-gtext {
          background-image: linear-gradient(90deg, var(--g1), var(--g2));
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .bd-root .bd-gtext3 {
          background-image: linear-gradient(90deg, var(--g1), var(--g3), var(--g2));
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }

        .bd-root .bd-header { background: var(--header-bg); border-color: var(--hline); }
        .bd-root .bd-btn { background: var(--surface); border-color: var(--line); color: var(--text2); }
        .bd-root .bd-btn:hover { color: var(--head); }
        .bd-root .bd-btn-text { color: var(--sub); }
        .bd-root .bd-btn-text:hover { color: var(--head); }

        .bd-root .bd-panel { background: var(--panel); border-color: var(--panel-line); box-shadow: var(--panel-shadow); }
        .bd-root .bd-panel-empty { background: var(--panel-empty); border-color: var(--line); }
        .bd-root .bd-ring { border-color: var(--panel-ring); }

        .bd-root .bd-glass { background: var(--glass-bg); border-color: var(--glass-line); }
        .bd-root .bd-glass-btn { background: var(--glass-bg); border-color: var(--glass-line); }
        .bd-root .bd-glass-btn:hover { background: var(--glass-hover); border-color: var(--sky2); }
        .bd-root .bd-divide > :not(:first-child) { border-left: 1px solid var(--glass-line); }

        .bd-root .bd-sky-btn { color: var(--sky); border-color: rgba(56, 189, 248, 0.45); background: rgba(56, 189, 248, 0.1); }
        .bd-root .bd-sky-btn:hover { background: rgba(56, 189, 248, 0.2); }
        .bd-root .bd-white-btn { background: var(--btn-bg); color: var(--btn-text); }
        .bd-root .bd-white-btn:hover { filter: brightness(1.1); }

        .bd-root .bd-row { background: var(--surface); border-color: var(--line); }
        .bd-root .bd-row:hover { background: var(--surface-2); border-color: rgba(96, 165, 250, 0.6); }
        .bd-root .bd-avatar { border-color: var(--line2); background: var(--chip-bg); }
        .bd-root .bd-name { color: var(--head); }
        .bd-root .group:hover .bd-name { color: var(--sky); }

        .bd-root .bd-box { background: var(--surface); border-color: var(--line); }
        .bd-root .bd-input { background: var(--surface); border-color: var(--line); color: var(--head); }
        .bd-root .bd-input::placeholder { color: var(--faint); }
        .bd-root .bd-input:focus { border-color: var(--sky2); outline: none; }

        .bd-root .bd-month { background: var(--surface); border-color: var(--line); color: var(--text2); }
        .bd-root .bd-side { color: var(--sub); }
        .bd-root .bd-side:hover { background: var(--hover); color: var(--head); }

        .bd-root .bd-track { background: var(--chip-bg); }
        .bd-root .bd-scroll { scrollbar-width: thin; scrollbar-color: var(--line2) transparent; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.18),transparent_65%)]" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-emerald-500/15 blur-[120px]" />

      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/ambiences/birthday_party.ogg" loop />

      {/* স্টিকি হেডার */}
      <header className="bd-header sticky top-0 z-30 border-b backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6">
          <Link href="/" className="bd-btn inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition">
            ← হোম
          </Link>
          <div className="flex items-center gap-2 text-sm font-black">
            <span>🎂</span>
            <span className="bd-gtext">FCL বার্থডে হাব</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMusic}
              aria-label="মিউজিক চালু/বন্ধ"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                isPlayingMusic ? "border-emerald-500/60 bg-emerald-400/15 bd-em" : "bd-btn"
              }`}
            >
              {isPlayingMusic ? "🎵" : "🔇"}
              <span className="hidden sm:inline">{isPlayingMusic ? "মিউজিক বাজছে" : "মিউজিক"}</span>
            </button>
            <Link
              href="/bn"
              className="bd-btn inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition"
            >
              বাংলা
            </Link>
          </div>
        </div>
      </header>

      {/* মূল কন্টেন্ট (উপরে pt-8 বা pt-10 দেওয়া হয়েছে যাতে হেডারের নিচে কন্টেন্ট ঢাকা না পড়ে) */}
      <main className="relative mx-auto max-w-7xl px-3 pt-8 sm:px-6 sm:pt-12">
        {loading ? (
          <div className="bd-sky2 flex h-64 items-center justify-center font-bold animate-pulse">বার্থডে ডেটা লোড হচ্ছে...</div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {todayStars.length === 0 ? (
              <section className="bd-panel-empty rounded-3xl border p-5 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
                <div className="text-center lg:text-left">
                  <p className="text-4xl">📅</p>
                  <h1 className="bd-head mt-2 text-2xl font-black sm:text-4xl">আজ কারো জন্মদিন নেই</h1>
                  <p className="bd-sub mt-2 max-w-md text-xs leading-relaxed sm:text-sm">
                    পরের জন্মদিনগুলো নিচে দেখুন, অথবা মাস বেছে পুরো তালিকা ঘুরে আসুন।
                  </p>
                </div>
                {upcoming[0] && (
                  <button
                    onClick={() => setSelectedPlayerForModal(upcoming[0].player)}
                    className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/5 p-3 text-left transition hover:bg-emerald-500/10 lg:mt-0 lg:w-auto lg:min-w-[320px]"
                  >
                    <DateTile month={upcoming[0].month} day={upcoming[0].day} hot />
                    <div className="min-w-0">
                      <p className="bd-em text-[11px]">পরের জন্মদিন • {leftLabel(upcoming[0].daysLeft)}</p>
                      <p className="bd-head truncate text-base font-extrabold">{upcoming[0].player.name}</p>
                    </div>
                  </button>
                )}
              </section>
            ) : (
              <section className="space-y-6">
                {isGroup && (
                  <div className="bd-panel relative overflow-hidden rounded-[2rem] border p-5 sm:p-8">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

                    <div className="relative z-10 text-center">
                      <p className="text-3xl sm:text-4xl">🎉🎂🎈</p>
                      <h1 className="bd-head mt-2 text-2xl font-black leading-tight sm:text-4xl">
                        আজ <span className="bd-gtext">{todayStars.length} জনের</span> জন্মদিন!
                      </h1>
                      <p className="bd-text2 mt-1.5 text-xs sm:text-sm">নামে ট্যাপ করুন — তার স্পেশাল উইশ কার্ড দেখুন ও ডাউনলোড করুন</p>
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
                                ? "border-emerald-400 bg-gradient-to-r from-blue-600/30 to-emerald-500/25 shadow-lg shadow-blue-500/20"
                                : "bd-glass-btn"
                            }`}
                          >
                            <div className="rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 p-[3px]">
                              <img
                                src={getPhoto(s.player)}
                                alt={s.player.name}
                                className="bd-ring h-14 w-14 rounded-full border-2 object-cover sm:h-16 sm:w-16"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = FALLBACK_PHOTO;
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="bd-head truncate text-sm font-black sm:text-base">{s.player.name}</p>
                              <p className="bd-sub truncate text-[11px]">
                                @{s.player.nickName || "Player"} • {s.player.role}
                              </p>
                              <span
                                className={`mt-1.5 inline-block rounded-full px-3 py-1 text-[11px] font-black ${
                                  on ? "bg-emerald-500 text-white" : "bd-white-btn"
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

                {star && (
                  <div
                    ref={detailRef}
                    className="bd-panel relative scroll-mt-24 overflow-hidden rounded-[2rem] border p-4 sm:p-8 lg:p-12"
                  >
                    <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

                    <div className="relative z-10 grid items-center gap-6 lg:grid-cols-12 lg:gap-12">
                      <div className="text-center lg:col-span-7 lg:text-left">
                        <span className="bd-em inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold">
                          🏆 Happy Birthday Champion!
                        </span>
                        <span className="bd-sky ml-2 inline-flex items-center gap-1.5 rounded-full border border-sky-400/50 bg-sky-400/10 px-3 py-1 text-[11px] font-bold">
                          🎂 {dateBn}
                        </span>

                        <h2 className="bd-head mt-3 text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
                          শুভ জন্মদিন,
                          <br />
                          <span className="bd-gtext3">{star.name}</span> 🎉
                        </h2>

                        <div className="bd-glass relative mx-auto mt-6 max-w-xl rounded-2xl border p-4 text-left backdrop-blur sm:p-5 lg:mx-0">
                          <span className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-0.5 text-[10px] font-black text-white">
                            💌 এফসিএল পরিবারের শুভেচ্ছা
                          </span>
                          <p className="bd-text pt-1 text-[13px] leading-relaxed sm:text-[15px] sm:leading-8">“{getPlayerWish(star, wishSalt)}”</p>
                          <p className="bd-sky mt-2 text-right text-xs font-black sm:text-sm">— FCL Family</p>
                        </div>

                        {!starHasPhoto && (
                          <div className="bd-glass mx-auto mt-4 flex max-w-xl items-center gap-3 rounded-2xl border p-3 text-left lg:mx-0">
                            <span className="text-2xl">📸</span>
                            <p className="bd-text2 min-w-0 flex-1 text-[11px] leading-snug sm:text-xs">
                              <b className="bd-head">{star.name}</b>-এর ছবি আমাদের কাছে নেই। ছবি দিলে কার্ডে বসিয়ে দেওয়া হবে — সরাসরি Messenger-এ পাঠান।
                            </p>
                            <button
                              onClick={() => openMessenger(star.name)}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0084ff] px-3 py-2 text-[11px] font-black text-white transition hover:brightness-110"
                            >
                              <MessengerIcon size={13} /> ছবি দিন
                            </button>
                          </div>
                        )}

                        <div className="mt-6 hidden grid-cols-3 gap-4 lg:grid">
                          {[
                            { label: "ম্যাচ", value: star.matches, color: "bd-head" },
                            { label: "রান", value: star.runs, color: "bd-sky2" },
                            { label: "উইকেট", value: star.wickets, color: "bd-em2" },
                          ].map((s) => (
                            <div key={s.label} className="bd-glass rounded-2xl border p-5 backdrop-blur">
                              <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
                              <p className="bd-sub mt-1 text-xs font-semibold">{s.label}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 hidden lg:block">
                          <DownloadButtons />
                        </div>
                      </div>

                      <div className="lg:col-span-5">
                        <ScaledCard cardRef={cardRef} onClick={() => setSelectedPlayerForModal(star)}>
                          <WishCard player={star} dateText={dateText} salt={wishSalt} />
                        </ScaledCard>

                        <div className="mx-auto mt-5 max-w-[450px] space-y-3 lg:hidden">
                          <div className="bd-glass bd-divide grid grid-cols-3 rounded-2xl border py-2.5 text-center">
                            <div>
                              <p className="bd-head text-base font-black">{star.matches}</p>
                              <p className="bd-sub text-[10px]">ম্যাচ</p>
                            </div>
                            <div>
                              <p className="bd-sky2 text-base font-black">{star.runs}</p>
                              <p className="bd-sub text-[10px]">রান</p>
                            </div>
                            <div>
                              <p className="bd-em2 text-base font-black">{star.wickets}</p>
                              <p className="bd-sub text-[10px]">উইকেট</p>
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

            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
                {[
                  { icon: "👥", label: "মোট প্লেয়ার", value: stats.total, color: "bd-head" },
                  { icon: "🎂", label: "জন্মদিন নথিভুক্ত", value: stats.bdayCount, color: "bd-sky2" },
                  { icon: "📸", label: "ছবি আছে", value: stats.withPhoto, color: "bd-em2" },
                  { icon: "🙈", label: "ছবি নেই", value: stats.missing.length, color: "bd-amber", onClick: () => setShowMissing((v) => !v) },
                  { icon: "🗓️", label: "এই মাসে জন্মদিন", value: stats.thisMonth, color: "bd-head" },
                  { icon: "⏰", label: "আগামী ৭ দিনে", value: stats.next7, color: "bd-sky2" },
                ].map((s) => {
                  const Tag: any = s.onClick ? "button" : "div";
                  return (
                    <Tag
                      key={s.label}
                      onClick={s.onClick}
                      className={`bd-glass rounded-2xl border p-3 text-center backdrop-blur transition ${s.onClick ? "cursor-pointer hover:brightness-110 active:scale-[0.98]" : ""}`}
                    >
                      <p className="text-lg">{s.icon}</p>
                      <p className={`text-2xl font-black leading-tight sm:text-3xl ${s.color}`}>{s.value}</p>
                      <p className="bd-sub mt-0.5 text-[10px] font-semibold sm:text-[11px]">{s.label}</p>
                    </Tag>
                  );
                })}
              </div>

              <div className="bd-panel relative overflow-hidden rounded-[2rem] border p-4 sm:p-6">
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
                <div className="relative z-10">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <h2 className="bd-head text-base font-black sm:text-xl">📸 ছবি সংগ্রহ অভিযান</h2>
                      <p className="bd-text2 mt-1 text-xs leading-relaxed sm:text-sm">
                        মোট <b className="bd-head">{stats.total}</b> জনের মধ্যে{" "}
                        <b className="bd-em2">{stats.withPhoto} জনের</b> ছবি আছে,{" "}
                        <b className="bd-amber">{stats.missing.length} জনের</b> ছবি নেই। ছবি না থাকলে নিচের বাটনে সরাসরি Messenger-এ পাঠিয়ে দিন — আমরা কার্ডে বসিয়ে দেব।
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="bd-track h-2.5 flex-1 overflow-hidden rounded-full">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-700"
                            style={{ width: `${stats.pct}%` }}
                          />
                        </div>
                        <span className="bd-head text-xs font-black">{stats.pct}%</span>
                      </div>

                      <p className="bd-faint mt-2 text-[11px]">
                        {stats.busiest >= 0 && (
                          <>
                            📊 সবচেয়ে বেশি জন্মদিন: <b className="bd-text2">{MONTH_BN[stats.busiest]}</b> মাসে ({stats.maxC} জন)
                          </>
                        )}
                        {stats.noBirthday > 0 && (
                          <>
                            {stats.busiest >= 0 ? " • " : ""}🎈 জন্মতারিখ নেই: <b className="bd-text2">{stats.noBirthday} জনের</b> — তারাও মেসেজ দিয়ে জানাতে পারেন
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto lg:flex-col">
                      <button
                        onClick={() => openMessenger()}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0084ff] to-[#a334fa] px-6 py-3 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition hover:brightness-110 active:scale-[0.98]"
                      >
                        <MessengerIcon size={18} /> Messenger-এ ছবি পাঠান
                      </button>
                      <a
                        href={FB_PROFILE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bd-sky-btn flex items-center justify-center gap-2 rounded-2xl border px-6 py-3 text-sm font-black transition active:scale-[0.98]"
                      >
                        👤 Facebook প্রোফাইল
                      </a>
                    </div>
                  </div>

                  {stats.missing.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowMissing((v) => !v)}
                        className="bd-btn inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition"
                      >
                        {showMissing ? "▲ তালিকা লুকান" : `▼ যাদের ছবি নেই (${stats.missing.length} জন) দেখুন`}
                      </button>

                      {showMissing && (
                        <div className="bd-scroll mt-3 max-h-60 overflow-y-auto rounded-2xl pr-1">
                          <div className="flex flex-wrap gap-2">
                            {stats.missing.map((p, i) => (
                              <div
                                key={pKey(p) + i}
                                className="bd-row flex items-center overflow-hidden rounded-full border text-[11px] font-bold"
                              >
                                <button
                                  onClick={() => setSelectedPlayerForModal(p)}
                                  title="প্লেয়ার কার্ড খুলুন"
                                  className="bd-head max-w-[170px] truncate py-1.5 pl-3 pr-2 transition hover:opacity-80"
                                >
                                  {p.name}
                                </button>
                                <button
                                  onClick={() => openMessenger(p.name)}
                                  title="Messenger-এ ছবি পাঠান"
                                  className="flex h-full items-center bg-[#0084ff] px-2.5 py-1.5 text-white transition hover:brightness-110"
                                >
                                  <MessengerIcon size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {upcoming.length > 0 && (
              <section>
                <div className="mb-3 flex items-end justify-between">
                  <h2 className="bd-head text-base font-black sm:text-xl">⏳ আসন্ন জন্মদিন</h2>
                  <span className="bd-faint text-[11px]">পরের {upcoming.length} জন</span>
                </div>
                <div className="-mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
                  {upcoming.map((e, i) => (
                    <button
                      key={e.player.name + i}
                      onClick={() => setSelectedPlayerForModal(e.player)}
                      className="bd-row group w-[150px] shrink-0 snap-start rounded-2xl border p-3 text-center transition sm:w-[170px]"
                    >
                      <div className="bd-avatar mx-auto h-16 w-16 overflow-hidden rounded-full border-2 sm:h-[72px] sm:w-[72px]">
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
                      <p className="bd-head mt-2 truncate text-xs font-extrabold sm:text-sm">{e.player.name}</p>
                      <p className="bd-sub mt-0.5 text-[11px]">
                        {String(e.day).padStart(2, "0")} {MONTH_BN[e.month]}
                      </p>
                      <span className="bd-amber-pill mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                        {leftLabel(e.daysLeft)}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {recent.length > 0 && (
              <section>
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <h2 className="bd-head text-base font-black sm:text-xl">🕘 সদ্য পেরিয়ে যাওয়া জন্মদিন</h2>
                    <p className="bd-sub mt-0.5 text-[11px]">মিস করে ফেলেছেন? এখনই কার্ড নামিয়ে নিন</p>
                  </div>
                  <span className="bd-faint text-[11px]">গত ১৫ দিনে {recent.length} জন</span>
                </div>
                <div className="-mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
                  {recent.map((e, i) => (
                    <div
                      key={e.player.name + i}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPlayerForModal(e.player)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter") setSelectedPlayerForModal(e.player);
                      }}
                      className="bd-row group w-[150px] shrink-0 cursor-pointer snap-start rounded-2xl border p-3 text-center transition sm:w-[170px]"
                    >
                      <div className="bd-avatar mx-auto h-16 w-16 overflow-hidden rounded-full border-2 sm:h-[72px] sm:w-[72px]">
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
                      <p className="bd-head mt-2 truncate text-xs font-extrabold sm:text-sm">{e.player.name}</p>
                      <p className="bd-sub mt-0.5 text-[11px]">
                        {String(e.day).padStart(2, "0")} {MONTH_BN[e.month]} • {agoLabel(e.daysAgo)}
                      </p>
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setCardEntry(e);
                        }}
                        className="mt-2 inline-block rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 px-3 py-1 text-[10px] font-black text-white transition hover:brightness-110"
                      >
                        🎁 কার্ড নামান
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ক্যালেন্ডার সেকশন */}
            <section ref={calendarRef} className="scroll-mt-24">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="bd-head text-lg font-black sm:text-2xl">📅 বার্থডে ক্যালেন্ডার</h2>
                  <p className="bd-sub mt-0.5 text-xs">মাস বেছে নিন অথবা নাম লিখে খুঁজুন • যেকোনো প্লেয়ারের 🎁 কার্ড নামানো যাবে</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="প্লেয়ারের নাম খুঁজুন..."
                    className="bd-input w-full rounded-2xl border py-2.5 pl-9 pr-9 text-sm"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      aria-label="সার্চ মুছুন"
                      className="bd-btn-text absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

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
                            : "bd-month"
                        }`}
                      >
                        {active && <span className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 rounded-full bg-white/25 blur-xl" />}
                        {isNow && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />}
                        <span className="text-[12px] font-extrabold leading-tight">{m}</span>
                        <span
                          className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
                            active ? "bg-white text-[#0b2a6f]" : "bd-chip"
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
                {!search && (
                  <aside className="hidden lg:col-span-3 lg:block">
                    <div className="bd-box sticky top-20 space-y-1.5 rounded-3xl border p-3">
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
                                : "bd-side"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {m}
                              {isNow && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="চলতি মাস" />}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white text-[#0b2a6f]" : "bd-chip"}`}>
                              {monthCounts[i]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </aside>
                )}

                <div className={search ? "lg:col-span-12" : "lg:col-span-9"}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="bd-sky text-sm font-black sm:text-base">
                      {search ? `"${search}" — ${listToShow.length} জন পাওয়া গেছে` : `${MONTH_BN[activeMonthTab]} মাস • ${listToShow.length} জন`}
                    </h3>
                  </div>

                  {listToShow.length === 0 ? (
                    <div className="bd-box bd-sub rounded-2xl border p-8 text-center text-xs">
                      {search ? "এই নামে কাউকে পাওয়া যায়নি। অন্য নাম লিখে দেখুন।" : "এই মাসে কোনো জন্মদিন নেই।"}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2">
                      {listToShow.map((e, i) => (
                        <PlayerRow
                          key={e.player.name + i}
                          entry={e}
                          onOpen={setSelectedPlayerForModal}
                          onCard={setCardEntry}
                          hasPhoto={playerHasPhoto(e.player, brokenPhotos)}
                          onMessenger={openMessenger}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ফ্লোটিং ক্যালেন্ডার বাটন (Floating Action Button - ডান কোণায় ভাসমান) */}
      <button
        onClick={scrollToCalendar}
        title="বার্থডে ক্যালেন্ডারে যান"
        aria-label="বার্থডে ক্যালেন্ডারে যান"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 rounded-full border border-sky-400/50 bg-sky-500/90 px-4 py-2.5 text-xs font-black text-white shadow-2xl backdrop-blur transition hover:scale-110 hover:bg-sky-600 active:scale-95 sm:bottom-8 sm:right-8"
      >
        <span>📅 ক্যালেন্ডার</span>
        <span className="animate-bounce">⬇</span>
      </button>

      {cardEntry && (
        <CardStudio
          entry={cardEntry}
          salt={wishSalt}
          hasPhoto={playerHasPhoto(cardEntry.player, brokenPhotos)}
          downloading={downloading}
          onClose={() => setCardEntry(null)}
          onNewWish={() => setWishSalt((s) => s + 1)}
          onDownload={(p, r) => handleDownloadCard(p, r)}
          onProfile={openProfileFromStudio}
          onMessenger={openMessenger}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[80] w-[92%] max-w-sm -translate-x-1/2 rounded-2xl bg-slate-900/95 px-4 py-3 text-center text-xs font-bold text-white shadow-2xl ring-1 ring-white/10">
          {toast}
        </div>
      )}

      <PlayerCardModal
        selectedPlayer={selectedPlayerForModal}
        onClose={() => setSelectedPlayerForModal(null)}
        tournamentsData={tournamentsData}
        allPlayers={players}
      />
    </div>
  );
}