"use client";

import { useState, useEffect, useRef } from "react";
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

function parseExcelBirthday(val: string) {
  if (!val || val === "—") return { month: -1, day: -1, text: "" };
  const num = Number(val);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const utcDays = Math.floor(num - 25569);
    const dateInfo = new Date(utcDays * 86400 * 1000);
    const day = dateInfo.getUTCDate();
    const month = dateInfo.getUTCMonth();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return { month, day, text: `${String(day).padStart(2, "0")} ${months[month]}` };
  }
  return { month: -1, day: -1, text: String(val).trim() };
}

export default function BirthdayPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentsData, setTournamentsData] = useState<any[]>([]);
  const [todayStars, setTodayStars] = useState<Player[]>([]);
  const [upcomingList, setUpcomingList] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState<Player | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/fcl-data")
      .then((res) => res.json())
      .then((data) => {
        let list: Player[] = [];
        if (data.players && Array.isArray(data.players)) {
          list = data.players;
        } else if (Array.isArray(data)) {
          list = data;
        }
        if (data.tournaments && Array.isArray(data.tournaments)) {
          setTournamentsData(data.tournaments);
        }

        setPlayers(list);

        const validBirthdayPlayers = list.filter(
          (p) => p.birthday && p.birthday !== "—" && p.birthday.trim() !== ""
        );

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();

        const todays: Player[] = [];

        validBirthdayPlayers.forEach((p) => {
          const parsed = parseExcelBirthday(p.birthday || "");
          if (parsed.month === currentMonth && parsed.day === currentDay) {
            todays.push(p);
          }
        });

        setTodayStars(todays.length > 0 ? todays : validBirthdayPlayers.slice(0, 1));
        setUpcomingList(validBirthdayPlayers);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading birthday data:", err);
        setLoading(false);
      });
  }, []);

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

  const handleDownloadCard = async () => {
    if (todayStars.length === 0 || !cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "transparent",
      });
      const link = document.createElement("a");
      const safeName = (todayStars[0].nickName || todayStars[0].name || "player").toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `FCL_Birthday_${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
      alert("কার্ড ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    }
    setDownloading(false);
  };

  const primaryStar = todayStars.length > 0 ? todayStars[0] : null;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-pink-500/30 selection:text-white pb-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.15),transparent_70%)] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/ambiences/birthday_party.ogg" loop />

      <main className="relative mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-[#0b1220] px-4 py-2 text-xs font-bold text-slate-300 hover:text-white backdrop-blur shadow">
            ← হোম পেজে ফিরে যান
          </Link>

          <button
            onClick={toggleMusic}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black transition ${
              isPlayingMusic ? "border-pink-400 bg-pink-400/20 text-pink-300 animate-bounce" : "border-slate-800 bg-[#0b1220] text-slate-400"
            }`}
          >
            {isPlayingMusic ? "🎵 মিউজিক বাজছে (বন্ধ করুন)" : "🔇 বার্থডে মিউজিক চালান"}
          </button>
        </div>

        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-pink-400/40 bg-pink-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-pink-400 shadow-lg shadow-pink-400/10">
            🎉 FCL Birthday Celebration Hub 🎂
          </span>
          <h1 className="mt-4 text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-pink-400 via-amber-300 to-purple-400 bg-clip-text text-transparent">
            Today's Birthday Star & Directory
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            আজকের জন্মদিনের তারকার জন্য বিশেষ উইশ কার্ড এবং এফসিএল পরিবারের সকল সদস্যের জন্মদিনের ডিরেক্টরি।
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-pink-400 font-bold animate-pulse">
            বার্থডে ডেটা লোড হচ্ছে...
          </div>
        ) : !primaryStar ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-[#0b1220] p-8 text-center shadow-xl">
            <span className="text-4xl mb-3">🎂</span>
            <p className="text-base font-semibold">আজ কারো জন্মদিন নেই বা এক্সেল ফাইলে ডেটা নেই</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* 🌟 ফিক্সড টপ সেকশন: আজকের বার্থডে স্টার ও উইশ কার্ড */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-[2.5rem] border-2 border-pink-500/40 bg-gradient-to-br from-[#0b1220] via-[#070d1a] to-[#04060c] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="lg:col-span-7 space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 rounded-xl bg-pink-500/20 border border-pink-500/40 px-3.5 py-1 text-xs font-black text-pink-300">
                  <span>🌟</span> আজকের জন্মদিনের স্টার • {parseExcelBirthday(primaryStar.birthday || "").text}
                </div>

                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  শুভ জন্মদিন, <span className="text-pink-400">{primaryStar.name}</span>! 🎉
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Facebook Cricket League পরিবারে আপনার দুর্দান্ত পারফরম্যান্স এবং অবদান অনন্য। মাঠে আপনার অসাধারণ ব্যাটিং ও বোলিং জাদুকরী মুহূর্ত উপহার দিয়েছে। আপনার সুস্বাস্থ্য, সাফল্য এবং দীর্ঘায়ু কামনা করি!
                </p>

                <div className="rounded-2xl border border-slate-800 bg-black/40 p-4 sm:p-5 backdrop-blur">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-3">
                    ⚡ বর্ণিল ক্যারিয়ারের উল্লেখযোগ্য অর্জনসমূহ:
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                      <p className="text-xl font-black text-white">{primaryStar.matches}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Total Matches</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                      <p className="text-xl font-black text-blue-400">{primaryStar.runs}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Career Runs</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                      <p className="text-xl font-black text-amber-400">{primaryStar.wickets}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Wickets Taken</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="rounded-2xl bg-gradient-to-r from-pink-600 to-amber-500 px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-pink-500/25 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <span>{downloading ? "⏳ জেনারেট হচ্ছে..." : "📥 বার্থডে উইশ কার্ড ডাউনলোড করুন (PNG)"}</span>
                </button>
              </div>

              {/* প্রিমিয়াম ডাউনলোডেবল উইশ কার্ড (এটিতে ক্লিক করলেই তার প্লেয়ার কার্ড মডাল ওপেন হবে) */}
              <div className="lg:col-span-5 flex justify-center relative z-10">
                <div
                  ref={cardRef}
                  onClick={() => setSelectedPlayerForModal(primaryStar)}
                  style={{
                    borderRadius: "36px",
                    overflow: "hidden",
                    clipPath: "inset(0 round 36px)",
                  }}
                  className="relative w-full max-w-[380px] aspect-[4/5] border-4 border-pink-400/70 shadow-[0_0_60px_rgba(236,72,153,0.35)] bg-gradient-to-b from-[#1e1b4b] via-[#090d1e] to-[#03050f] p-5 flex flex-col justify-between text-center cursor-pointer group hover:border-pink-300 transition"
                >
                  {/* ব্যাকগ্রাউন্ড ডেকোরেটিভ বেলুন ও গ্লো ইফেক্ট */}
                  <div className="absolute top-2 left-4 text-xl opacity-80 animate-bounce">🎈</div>
                  <div className="absolute top-3 right-4 text-xl opacity-80 animate-bounce" style={{ animationDelay: "0.5s" }}>🎁</div>
                  <div className="absolute bottom-16 left-3 text-lg opacity-70">✨</div>
                  <div className="absolute bottom-14 right-3 text-lg opacity-70">🎊</div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(236,72,153,0.2),transparent_60%)] pointer-events-none" />

                  {/* কার্ড হেডার: লোগো ও ব্যাজ */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 p-1 border border-white/20 shadow">
                        <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
                      </div>
                      <span className="text-xs font-black tracking-wider text-slate-200">FCL</span>
                    </div>
                    <span className="rounded-full bg-pink-500/25 border border-pink-500/50 px-3 py-1 text-[9px] font-black tracking-widest text-pink-300 uppercase shadow">
                      🎂 BIRTHDAY STAR
                    </span>
                  </div>

                  {/* প্লেয়ার গোল ছবি ও নাম */}
                  <div className="relative z-10 flex flex-col items-center my-auto pt-1">
                    <div className="relative">
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-pink-500 via-amber-400 to-purple-600 blur-sm opacity-70 animate-pulse" />
                      <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-slate-800">
                        <img
                          src={primaryStar.photo && primaryStar.photo !== "—" ? (primaryStar.photo.startsWith("/") ? primaryStar.photo : `/players/${primaryStar.photo}`) : `/FCL Cricket Avatar Placeholder.jpg`}
                          alt={primaryStar.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/FCL Cricket Avatar Placeholder.jpg";
                          }}
                        />
                      </div>
                    </div>

                    <h3 className="mt-2.5 text-xl font-black text-white drop-shadow group-hover:text-pink-300 transition">{primaryStar.name}</h3>
                    <p className="text-xs font-bold text-amber-300">@{primaryStar.nickName || "Player"} • {primaryStar.role}</p>

                    {/* HAPPY BIRTHDAY CHAMPION ব্যানার */}
                    <div className="mt-2 w-full rounded-xl bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/40 px-3 py-1 backdrop-blur shadow">
                      <p className="text-[11px] font-black text-pink-200 tracking-wider uppercase">🎉 HAPPY BIRTHDAY CHAMPION! 🎈</p>
                    </div>

                    {/* উইশ মেসেজ */}
                    <div className="mt-1.5 w-full rounded-xl bg-black/40 border border-white/10 px-2.5 py-1.5 backdrop-blur">
                      <p className="text-[9.5px] font-semibold text-slate-300 leading-snug text-center">
                        "Facebook Cricket League পরিবারে আপনার দুর্দান্ত পারফরম্যান্স এবং অবদান অনন্য। মাঠে আপনার অসাধারণ ব্যাটিং ও বোলিং জাদুকরী মুহূর্ত উপহার দিয়েছে।"
                      </p>
                    </div>

                    {/* কার্ডের ভেতরে স্ট্যাটস */}
                    <div className="mt-2 grid grid-cols-3 gap-2 w-full bg-black/50 border border-white/10 rounded-xl p-2 text-center backdrop-blur">
                      <div>
                        <p className="text-xs font-black text-white">{primaryStar.matches}</p>
                        <p className="text-[9px] text-slate-400 font-bold">Matches</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-blue-400">{primaryStar.runs}</p>
                        <p className="text-[9px] text-slate-400 font-bold">Runs</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-amber-400">{primaryStar.wickets}</p>
                        <p className="text-[9px] text-slate-400 font-bold">Wickets</p>
                      </div>
                    </div>
                  </div>

                  {/* কার্ড ফুটার: FCL Family */}
                  <div className="relative z-10 border-t border-white/10 pt-2.5 flex items-center justify-between text-[10px] text-slate-300 font-bold">
                    <span>❤️ Warm wishes from FCL Family</span>
                    <span className="text-pink-400">#FCLStar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* নিচের অংশ: খেলোয়াড় ডিরেক্টরি */}
            <div>
              <div className="mb-6 border-b border-slate-800 pb-4">
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>📅</span> বার্থডে খেলোয়াড় ডিরেক্টরি ({upcomingList.length} জন)
                </h3>
                <p className="text-xs text-slate-400 mt-1">যেকোনো খেলোয়াড়ের কার্ডে ক্লিক করলে তার অফিশিয়াল স্ট্যাট কার্ড ও ফুল প্রোফাইল দেখতে পাবেন।</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingList.map((p, idx) => {
                  const rawPhoto = p.photo || p.photoUrl;
                  const pPath = rawPhoto && rawPhoto !== "—" && rawPhoto !== ""
                    ? (rawPhoto.startsWith("/") ? rawPhoto : `/players/${rawPhoto}`)
                    : `/FCL Cricket Avatar Placeholder.jpg`;

                  const bdayParsed = parseExcelBirthday(p.birthday || "");

                  return (
                    <div
                      key={p.name + idx}
                      onClick={() => setSelectedPlayerForModal(p)}
                      className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#0b1220]/80 p-4 shadow-sm hover:border-pink-500/40 transition cursor-pointer group"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
                        <img
                          src={pPath}
                          alt={p.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/FCL Cricket Avatar Placeholder.jpg";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-white truncate group-hover:text-pink-400 transition">{p.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate">@{p.nickName || "Player"} • {p.role}</p>
                        <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-400">
                          <span>🎂</span> {bdayParsed.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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