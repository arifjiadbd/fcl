"use client";

import { Fragment, useState } from "react";

type Lang = "en" | "bn";
type L = { en: string; bn: string };

/* ───────────── DATA ───────────── */

const TABS = [
  { id: "basic", icon: "📘", t: { en: "Basic Rules", bn: "বেসিক রুলস" } },
  { id: "formats", icon: "🏆", t: { en: "Formats", bn: "ম্যাচ ফরম্যাট" } },
  { id: "single", icon: "🎯", t: { en: "Single Match", bn: "সিঙ্গেল ম্যাচ" } },
  { id: "team", icon: "👥", t: { en: "Team Match", bn: "দলগত ম্যাচ" } },
  { id: "power", icon: "⚡", t: { en: "Power Play", bn: "পাওয়ার প্লে" } },
  { id: "test", icon: "🏏", t: { en: "Test Match", bn: "টেস্ট ম্যাচ" } },
  { id: "challenge", icon: "💰", t: { en: "Challenge", bn: "চ্যালেঞ্জ" } },
] as const;

const STEPS: { icon: string; color: string; t: L; d: L }[] = [
  { icon: "🪙", color: "#f59e0b", t: { en: "Toss", bn: "টস" }, d: { en: "Umpire asks a cricket question. The first correct answer wins the toss.", bn: "আম্পায়ার ক্রিকেট বিষয়ক প্রশ্ন করেন। যে আগে সঠিক উত্তর দিবে সে টস জিতবে।" } },
  { icon: "📩", color: "#1877F2", t: { en: "Send to Umpire", bn: "আম্পায়ারকে পাঠান" }, d: { en: "Batter and bowler inbox 6 numbers (1–6, except 5) to the umpire. 1 over = 6 balls.", bn: "ব্যাটার ও বোলার ৫ ছাড়া ১–৬ এর মধ্যে ৬টি সংখ্যা ইনবক্সে পাঠায়। ১ ওভার = ৬ বল।" } },
  { icon: "⚔️", color: "#8b5cf6", t: { en: "Compare", bn: "তুলনা" }, d: { en: "Umpire compares bat and bowl numbers ball by ball.", bn: "আম্পায়ার প্রতি বলের ব্যাট ও বল সংখ্যা মিলিয়ে দেখেন।" } },
  { icon: "🏏", color: "#06b6d4", t: { en: "Runs or OUT", bn: "রান অথবা আউট" }, d: { en: "Same number = OUT. Different = the bat number is your runs.", bn: "সংখ্যা মিললে আউট। না মিললে ব্যাটের সংখ্যাই রান।" } },
  { icon: "🏆", color: "#22c55e", t: { en: "Result", bn: "ফলাফল" }, d: { en: "Umpire gives the score and declares the winner.", bn: "আম্পায়ার স্কোর দিয়ে বিজয়ী ঘোষণা করেন।" } },
];

const OFFICIAL = [
  { n: "T20", o: 4, w: 6 },
  { n: "T20+", o: 5, w: 7 },
  { n: "ODI", o: 6, w: 8 },
  { n: "ODI+", o: 8, w: 10 },
  { n: "ODI Dhamaka", o: 10, w: 11 },
];

const UNOFFICIAL: { n: L; s: L; icon: string }[] = [
  { icon: "🎯", n: { en: "Single Match", bn: "সিঙ্গেল ম্যাচ" }, s: { en: "2 Overs · 3 Wickets", bn: "২ ওভার · ৩ উইকেট" } },
  { icon: "👥", n: { en: "Team Match", bn: "দলগত ম্যাচ" }, s: { en: "3 Overs · 5 Wickets", bn: "৩ ওভার · ৫ উইকেট" } },
  { icon: "🏏", n: { en: "Single Test", bn: "সিঙ্গেল টেস্ট" }, s: { en: "8 Overs · 3 Wkts / Inns", bn: "৮ ওভার · প্রতি ইনিংস ৩ উইকেট" } },
  { icon: "🛡️", n: { en: "Team Test", bn: "দলগত টেস্ট" }, s: { en: "12 Overs · 4 Wkts / Inns", bn: "১২ ওভার · প্রতি ইনিংস ৪ উইকেট" } },
];

const SINGLE_RULES: L[] = [
  { en: "Needs 2 players + 1 umpire. Match is 2 overs, 3 wickets.", bn: "২ জন প্লেয়ার ও ১ জন আম্পায়ার লাগে। ম্যাচ ২ ওভার ৩ উইকেটের।" },
  { en: "The toss winner chooses to bat or bowl first. The second player then chases the target.", bn: "টস জিতে ব্যাটিং/বোলিং বেছে নেওয়া হয়। এরপর টার্গেট নিয়ে অন্যজন ব্যাট করে।" },
  { en: "Bat numbers cannot be changed after a wicket. Every OUT in the over simply counts.", bn: "আউট হলে ব্যাট পরিবর্তন করা যাবে না। এক ওভারে যতবার মিলবে ততবার আউট ধরা হবে।" },
];

const TEAM_RULES: L[] = [
  { en: "2 teams + 1 umpire. Each team has more than 1 player and 1 Captain.", bn: "২টি দল ও ১ জন আম্পায়ার। প্রতি দলে একের অধিক প্লেয়ার ও ১ জন TEAM CAPTAIN।" },
  { en: "Only captains answer the toss question.", bn: "টসের উত্তর শুধু ক্যাপ্টেনরা দিবে।" },
  { en: "Captains submit batting and bowling line-ups.", bn: "দুই ক্যাপ্টেন ব্যাটিং ও বোলিং লাইন-আপ দিবে।" },
  { en: "After an OUT, the next batter bats only the remaining balls and sends that many numbers.", bn: "আউট হলে বাকি বলের সমান সংখ্যক ব্যাট পরবর্তী ব্যাটার আম্পায়ারকে দিবে।" },
  { en: "If OUT on the last ball, the next over starts with the next line-up pair.", bn: "ওভারের শেষ বলে আউট হলে লাইন-আপ দেখে পরের ওভারের ব্যাট/বল দিতে হবে।" },
  { en: "The bowler can NEVER change the over once submitted. New batters can change bat.", bn: "বোলার একবার দেওয়া ওভার পরিবর্তন করতে পারবে না। তবে নতুন ব্যাটার ব্যাট পরিবর্তন করবে।" },
];

const TEST_OFFICIAL: L[] = [
  { en: "3-day match, 15 overs per day.", bn: "ম্যাচ হবে ৩ দিনের, প্রতিদিন ১৫ ওভার।" },
  { en: "2 innings per team (8/10 wickets each).", bn: "প্রতি টিম ২ ইনিংস (প্রতি ইনিংস ৮/১০ উইকেট)।" },
  { en: "Zero Rule applies (umpire selects Rule 1 or 2).", bn: "জিরো রুল প্রযোজ্য (আম্পায়ার ১ বা ২ নম্বর নির্ধারণ করবেন)।" },
  { en: "Not finished in 3 days = Draw.", bn: "৩ দিনে ম্যাচ শেষ না হলে ড্র।" },
  { en: "Follow-On: captain may enforce with a 30+ first-innings lead.", bn: "১ম ইনিংসে ৩০+ লিড থাকলে ক্যাপ্টেন Follow-On করাতে পারবে।" },
  { en: "Declare: a team may declare at any time.", bn: "যেকোনো সময় Declare করা যাবে।" },
  { en: "A batter can bat max 2 innings (1 per innings).", bn: "এক ব্যাটসম্যান ২ ইনিংসের বেশি ব্যাট করতে পারবে না।" },
  { en: "A bowler can bowl max 3 overs per day.", bn: "এক বোলার দিনে ৩ ওভারের বেশি করতে পারবে না।" },
];

const COMMON_TEST: L[] = [
  { en: "Innings can be declared at any time.", bn: "যেকোনো সময় ইনিংস ডিক্লার করা যাবে।" },
  { en: "If all out before the extra overs, the last over is not deducted. If out in less than 1 over, deduct 1 over.", bn: "বর্ধিত ওভারের আগে All Out হলে শেষ ওভার কমবে না, তবে ১ ওভারের কমে আউট হলে ১ ওভার কমাতে হবে।" },
  { en: "Players must write bowl/bat clearly to help the umpire score.", bn: "আম্পায়ারের সুবিধার্থে প্লেয়াররা বল/ব্যাট লিখে দিবে।" },
];

/* ───────────── HELPERS ───────────── */

const Chip = ({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "red" | "amber" | "slate" }) => {
  const m = {
    blue: "bg-[#1877F2]/15 text-[#60a5fa] border-[#1877F2]/30",
    red: "bg-red-500/15 text-red-400 border-red-500/30",
    amber: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30",
    slate: "bg-[#0b1220] text-white border-[#1e293b]",
  }[tone];
  return <span className={`inline-flex min-w-[2.4rem] items-center justify-center rounded-lg border px-2.5 py-1.5 font-mono text-sm font-bold ${m}`}>{children}</span>;
};

const Eyebrow = ({ children, color = "#60a5fa" }: { children: React.ReactNode; color?: string }) => (
  <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color }}>{children}</span>
);

const Panel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-3xl border border-[#1e293b] bg-gradient-to-b from-[#0b1220] to-[#080e1a] ${className}`}>{children}</div>
);

function RuleList({ items, lang, color = "#1877F2" }: { items: L[]; lang: Lang; color?: string }) {
  return (
    <ol className="space-y-3">
      {items.map((r, i) => (
        <li key={i} className="flex gap-4 rounded-2xl border border-[#1e293b] bg-[#020617]/60 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black" style={{ background: color + "22", color }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className="text-sm leading-7 text-[#cbd5e1]">{r[lang]}</p>
        </li>
      ))}
    </ol>
  );
}

function Head({ eyebrow, title, sub, color }: { eyebrow: string; title: string; sub?: string; color?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <Eyebrow color={color}>{eyebrow}</Eyebrow>
      <h3 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h3>
      {sub && <p className="mt-3 text-sm leading-7 text-[#94a3b8]">{sub}</p>}
    </div>
  );
}

/* Ball-by-ball comparison */
function Compare({ bat, bowl, lang }: { bat: number[]; bowl: number[]; lang: Lang }) {
  const res = bat.map((b, i) => (b === bowl[i] ? null : b));
  const runs = res.reduce<number>((s, r) => s + (r ?? 0), 0);
  const outs = res.filter((r) => r === null).length;
  return (
    <Panel className="overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div className="p-6 sm:p-8">
          <Eyebrow>{lang === "en" ? "Inbox to umpire" : "আম্পায়ারকে ইনবক্স"}</Eyebrow>
          <div className="mt-5 space-y-3">
            {([["BAT", bat, "#1877F2"], ["BOWL", bowl, "#8b5cf6"]] as const).map(([k, arr, c]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="w-12 text-[11px] font-black tracking-widest" style={{ color: c }}>{k}</span>
                <div className="flex flex-wrap gap-1.5">
                  {arr.map((n, i) => (
                    <Chip key={i} tone={res[i] === null ? "red" : "slate"}>{n}</Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-[#1e293b] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <Eyebrow color="#64748b">{lang === "en" ? "Ball-by-ball" : "বল বাই বল"}</Eyebrow>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {res.map((r, i) => (r === null ? <Chip key={i} tone="red">OUT</Chip> : <Chip key={i}>+{r}</Chip>))}
          </div>
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-widest text-[#64748b]">Score</p>
            <p className="text-4xl font-black text-white">{runs}<span className="text-[#64748b]">/{outs}</span></p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ───────────── PAGE ───────────── */

export default function RulesPage() {
  const [lang, setLang] = useState<Lang>("bn");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("basic");
  const [zero, setZero] = useState<1 | 2>(1);
  const [pp, setPp] = useState<"npp" | "spp">("npp");
  const bn = lang === "bn";

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-[#1877F2]/30">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#172033] bg-[#02050b]">
        <div className="absolute -left-20 top-0 h-[360px] w-[360px] rounded-full bg-[#1877F2]/15 blur-[140px]" />
        <div className="absolute -right-20 bottom-0 h-[380px] w-[380px] rounded-full bg-[#7c3aed]/15 blur-[150px]" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#60a5fa]">
              FCL Rules Center
            </span>
            <div className="inline-flex rounded-full border border-[#1e293b] bg-[#0b1220] p-1">
              {(["en", "bn"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${lang === l ? "bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/30" : "text-[#64748b] hover:text-white"}`}>
                  {l === "en" ? "🇬🇧 EN" : "🇧🇩 বাংলা"}
                </button>
              ))}
            </div>
          </div>
          <h1 className="mt-8 max-w-3xl text-5xl font-black leading-[1.05] tracking-[-0.04em] sm:text-7xl">
            {bn ? "খেলার " : "All About "}
            <span className="bg-gradient-to-r from-[#60a5fa] via-[#1877F2] to-[#8b5cf6] bg-clip-text text-transparent">
              {bn ? "নিয়মকানুন" : "FCL Game."}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#94a3b8] sm:text-base">
            {bn
              ? "Facebook Cricket League (FCL) — ২০১৩ সালের ২৭ ফেব্রুয়ারি থেকে বাংলাদেশের অনলাইন ক্রিকেটের প্রধান গ্রুপ। কোনো অ্যাপ ছাড়াই ফেসবুক মেসেঞ্জারে খেলুন, ম্যাচ হয় গ্রুপ পোস্টে।"
              : "Facebook Cricket League — Bangladesh's first and biggest online cricket group, since 27 Feb 2013. No app needed: play via Messenger, matches run through group posts."}
          </p>
          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[
              { v: "2013", l: bn ? "যাত্রা শুরু" : "Since" },
              { v: "3+", l: bn ? "ন্যূনতম সদস্য" : "Min. people" },
              { v: "6", l: bn ? "বল / ওভার" : "Balls / over" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-[#1e293b] bg-[#0b1220]/80 p-4 backdrop-blur">
                <p className="text-2xl font-black text-white sm:text-3xl">{s.v}</p>
                <p className="mt-1 text-[11px] text-[#64748b]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STICKY TABS */}
      <nav className="sticky top-0 z-30 border-b border-[#172033] bg-[#020617]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl overflow-x-auto px-6 [scrollbar-width:none]">
          <div className="flex gap-1 py-3">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  tab === t.id ? "bg-[#1877F2] text-white shadow-lg shadow-[#1877F2]/25" : "text-[#94a3b8] hover:bg-[#0b1220] hover:text-white"}`}>
                <span>{t.icon}</span>{t.t[lang]}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        {/* BASIC */}
        {tab === "basic" && (
          <div>
            <Head eyebrow="Step by Step" title={bn ? "খেলা কীভাবে চলে" : "How a match works"}
              sub={bn ? "উদাহরণ: (p) ও (q) প্লেয়ার, (u) আম্পায়ার।" : "Example: (p) and (q) are players, (u) is the umpire."} />
            <div className="grid gap-4 md:grid-cols-5">
              {STEPS.map((s, i) => (
                <div key={i} className="group rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 transition hover:-translate-y-1" style={{ ["--c" as string]: s.color }}>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black" style={{ color: s.color + "40" }}>0{i + 1}</span>
                    <span className="text-xl">{s.icon}</span>
                  </div>
                  <h4 className="mt-5 font-bold">{s.t[lang]}</h4>
                  <p className="mt-2 text-xs leading-6 text-[#94a3b8]">{s.d[lang]}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
              <span className="text-xl">🚫</span>
              <p className="text-sm leading-7 text-[#fca5a5]">
                {bn ? "৫ নম্বর ব্যবহার নিষিদ্ধ। ১, ২, ৩, ৪, ৬ যেকোনো সংখ্যা একাধিকবার ব্যবহার করা যাবে — তবে ঠিক ৬টি সংখ্যা পাঠাতে হবে।"
                    : "Number 5 is not allowed. Use 1, 2, 3, 4, 6 as many times as you like — but you must send exactly 6 numbers."}
              </p>
            </div>

            <div className="mt-10">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#64748b]">{bn ? "বাস্তব উদাহরণ" : "Real example"}</h4>
              <Compare lang={lang} bat={[3, 6, 4, 3, 2, 1]} bowl={[6, 4, 3, 4, 2, 3]} />
              <p className="mt-4 text-xs leading-6 text-[#94a3b8]">
                {bn ? "৫ম বলে ব্যাট ও বল মিলেছে → আউট। আগের ৪ বলে 3+6+4+3 = 16 রান। স্কোর: 16/1 (0.5 over)।"
                    : "Ball 5 matched → OUT. The first 4 balls give 3+6+4+3 = 16 runs. Score: 16/1 (0.5 over)."}
              </p>
            </div>
          </div>
        )}

        {/* FORMATS */}
        {tab === "formats" && (
          <div>
            <Head eyebrow="Match Formats" color="#f59e0b" title={bn ? "অফিশিয়াল ফরম্যাট" : "Official formats"} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {OFFICIAL.map((f, i) => (
                <div key={f.n} className={`rounded-2xl border p-5 transition hover:-translate-y-1 ${i === 4 ? "border-[#f59e0b]/40 bg-[#f59e0b]/5" : "border-[#1e293b] bg-[#0b1220]"}`}>
                  <div className="flex justify-between text-[10px] font-black text-[#64748b]"><span>0{i + 1}</span><span>🏆</span></div>
                  <h4 className="mt-4 text-lg font-black">{f.n}</h4>
                  <div className="mt-5 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-[#020617] p-2.5"><p className="text-[9px] uppercase text-[#64748b]">Overs</p><p className="text-xl font-black text-[#60a5fa]">{f.o}</p></div>
                    <div className="rounded-xl bg-[#020617] p-2.5"><p className="text-[9px] uppercase text-[#64748b]">Wkts</p><p className="text-xl font-black text-[#f59e0b]">{f.w}</p></div>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="mb-4 mt-14 text-sm font-bold uppercase tracking-wider text-[#64748b]">
              {bn ? "আনঅফিশিয়াল — যখন খুশি খেলুন" : "Unofficial — play anytime"}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {UNOFFICIAL.map((u) => (
                <div key={u.s.en} className="flex items-center gap-4 rounded-2xl border border-[#1e293b] bg-[#080e1a] p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1877F2]/10 text-xl">{u.icon}</span>
                  <div><h5 className="font-bold">{u.n[lang]}</h5><p className="mt-1 text-xs text-[#64748b]">{u.s[lang]}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SINGLE */}
        {tab === "single" && (
          <div>
            <Head eyebrow="2 Overs · 3 Wickets" title={bn ? "সিঙ্গেল ম্যাচ" : "Single Match"}
              sub={bn ? "X ও Y প্লেয়ার, Z আম্পায়ার। টস জিতে X ব্যাটিং, Y বোলিং।" : "X and Y play, Z umpires. X wins the toss and bats; Y bowls."} />
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
              <RuleList items={SINGLE_RULES} lang={lang} />
              <div>
                <Compare lang={lang} bat={[6, 4, 3, 2, 1, 6]} bowl={[6, 2, 4, 2, 3, 4]} />
                <p className="mt-4 text-xs leading-6 text-[#94a3b8]">
                  {bn ? "১ম ও ৪র্থ বলে মিলেছে → ১ ওভারে ২ বার আউট। 4+3+1+6 = 14 রান, SCORE 14-2 (1.0 OVS)।"
                      : "Balls 1 and 4 matched → 2 wickets in the over. 4+3+1+6 = 14 runs. SCORE 14-2 (1.0 OVS)."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TEAM */}
        {tab === "team" && (
          <div>
            <Head eyebrow="Team Play" color="#8b5cf6" title={bn ? "দলগত ম্যাচ" : "Team Match"}
              sub={bn ? "Team P (A ক্যাপ্টেন) বনাম Team Q (W ক্যাপ্টেন), আম্পায়ার U।" : "Team P (captain A) vs Team Q (captain W), umpire U."} />
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { k: "BATTING LINE-UP", team: "TEAM P", list: ["B · Opener", "A · 1st Down", "C · 2nd Down", "D · 3rd Down"], c: "#1877F2" },
                { k: "BOWLING LINE-UP", team: "TEAM Q", list: ["W · Opener", "X · 2nd Over", "Y · 3rd Over", "Z · 4th Over"], c: "#8b5cf6" },
              ].map((b) => (
                <Panel key={b.k} className="p-6">
                  <div className="flex items-center justify-between">
                    <Eyebrow color={b.c}>{b.k}</Eyebrow><span className="text-xs font-bold text-[#64748b]">{b.team}</span>
                  </div>
                  <ul className="mt-5 space-y-2">
                    {b.list.map((p, i) => (
                      <li key={p} className="flex items-center gap-3 rounded-xl border border-[#1e293b] bg-[#020617]/60 px-4 py-3 text-sm">
                        <span className="font-black" style={{ color: b.c }}>{i + 1}</span><span className="font-semibold">{p}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[#1877F2]/30 bg-[#1877F2]/5 p-5 text-sm leading-7 text-[#cbd5e1]">
              💡 {bn ? "উদাহরণ: B ২য় বলে আউট হলে A বাকি ৪ বলের ব্যাট দিবে, যেমন: 4, 2, 3, 6।" : "Example: if B is out on ball 2, A sends 4 bat numbers for the remaining 4 balls, e.g. 4, 2, 3, 6."}
            </div>

            <div className="mt-8"><RuleList items={TEAM_RULES} lang={lang} color="#8b5cf6" /></div>
          </div>
        )}

        {/* POWER PLAY */}
        {tab === "power" && (
          <div>
            <Head eyebrow="Power Play" color="#f59e0b" title={bn ? "পাওয়ার প্লে সিস্টেম" : "Power Play System"}
              sub={bn ? "দলগত ফ্রেন্ডলি ম্যাচে দুই ধরনের পাওয়ার প্লে (PP) আছে।" : "Team friendly matches have two kinds of Power Play (PP)."} />
            <div className="mb-8 inline-flex rounded-full border border-[#1e293b] bg-[#0b1220] p-1">
              {(["npp", "spp"] as const).map((k) => (
                <button key={k} onClick={() => setPp(k)}
                  className={`rounded-full px-6 py-2 text-xs font-bold transition ${pp === k ? "bg-[#f59e0b] text-black" : "text-[#94a3b8] hover:text-white"}`}>
                  {k === "npp" ? "Normal PP (NPP)" : "Super PP (SPP)"}
                </button>
              ))}
            </div>

            {pp === "npp" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Panel className="p-7">
                  <Chip tone="blue">BATTING PP</Chip>
                  <p className="mt-5 text-sm leading-7 text-[#cbd5e1]">{bn ? "ব্যাটার যত খুশি ৪/৬ দিতে পারবে, কিন্তু বোলার ৩টির বেশি ৪/৬ দিতে পারবে না।" : "The batter can play 4/6 freely, but the bowler can give 4/6 at most 3 times."}</p>
                </Panel>
                <Panel className="p-7">
                  <Chip tone="amber">BOWLING PP</Chip>
                  <p className="mt-5 text-sm leading-7 text-[#cbd5e1]">{bn ? "বোলার যত খুশি ৪/৬ দিতে পারবে, কিন্তু ব্যাটার ৩টির বেশি ৪/৬ দিতে পারবে না। অর্থাৎ ব্যাটিং PP-র বিপরীত।" : "The bowler can give 4/6 freely, but the batter can play 4/6 at most 3 times. The opposite of Batting PP."}</p>
                </Panel>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Panel className="p-7">
                  <Chip tone="blue">BAT SPP</Chip>
                  <p className="mt-5 text-4xl font-black text-[#60a5fa]">×2</p>
                  <p className="mt-2 text-sm leading-7 text-[#cbd5e1]">{bn ? "ওভারে যত রান হবে তার দ্বিগুণ কাউন্ট হবে। যেমন ২০ রান → ৪০ রান।" : "Runs in the over count double. e.g. 20 runs → 40 runs."}</p>
                </Panel>
                <Panel className="p-7">
                  <Chip tone="red">BOWL SPP</Chip>
                  <p className="mt-5 text-4xl font-black text-[#f87171]">÷2</p>
                  <p className="mt-2 text-sm leading-7 text-[#cbd5e1]">{bn ? "রান অর্ধেক কাউন্ট হবে। যেমন ২০ রান → ১০ রান। দশমিক হলে পূর্ণ সংখ্যা ধরা হবে (৭.৫ → ৮)।" : "Runs count half. e.g. 20 → 10. Decimals round up (7.5 → 8)."}</p>
                </Panel>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-5 text-sm leading-7 text-[#fde68a]">
              {pp === "npp"
                ? (bn ? "NPP গ্রুপের যেকোনো অফিশিয়াল ম্যাচে খেলা হয়।" : "NPP is played in any official match of the group.")
                : (bn ? "SPP সাধারণত পূর্বনির্ধারিত স্পেশাল ফ্রেন্ডলি ম্যাচে খেলা হয়, অফিশিয়াল ম্যাচে নয়। ওভার ফ্রি স্টাইলে খেলা হয় — NPP-র মতো বিধিনিষেধ নেই।" : "SPP is only for special pre-arranged friendly matches, not official ones. Played free-style, with no NPP restrictions.")}
            </div>
          </div>
        )}

        {/* TEST */}
        {tab === "test" && (
          <div className="space-y-16">
            <div>
              <Head eyebrow="Official" color="#f59e0b" title={bn ? "অফিশিয়াল Team Test" : "Official Team Test"} />
              <RuleList items={TEST_OFFICIAL} lang={lang} color="#f59e0b" />
            </div>

            <div>
              <Head eyebrow="Zero Rule" color="#ef4444" title={bn ? "জিরো “০” রুল" : "The Zero “0” Rule"}
                sub={bn ? "অফিশিয়াল ম্যাচে আম্পায়ার, আনঅফিশিয়ালে প্লেয়াররা রুল ১ বা ২ বেছে নেয়।" : "Umpire picks in official matches; players pick in unofficial ones."} />
              <div className="mb-5 inline-flex rounded-full border border-[#1e293b] bg-[#0b1220] p-1">
                {([1, 2] as const).map((z) => (
                  <button key={z} onClick={() => setZero(z)}
                    className={`rounded-full px-6 py-2 text-xs font-bold transition ${zero === z ? "bg-[#ef4444] text-white" : "text-[#94a3b8] hover:text-white"}`}>
                    {bn ? `জিরো রুল ${z}` : `Zero Rule ${z}`}
                  </button>
                ))}
              </div>
              {zero === 1 ? (
                <div className="space-y-4">
                  <p className="text-sm leading-7 text-[#cbd5e1]">{bn ? "এক ওভারে দুইটা জিরো মিলে গেলে ২য় জিরোতে ব্যাটসম্যান আউট।" : "If two zeros match in one over, the batter is out on the second zero."}</p>
                  <Panel className="p-6 font-mono text-sm">
                    <div className="flex items-center gap-3"><span className="w-12 text-[#60a5fa]">BAT</span>{[0, 1, 1, 1, 0, 0].map((n, i) => <Chip key={i} tone={i === 0 || i === 5 ? "red" : "slate"}>{n}</Chip>)}</div>
                    <div className="mt-3 flex items-center gap-3"><span className="w-12 text-[#a78bfa]">BOWL</span>{[0, 6, 3, 3, 4, 0].map((n, i) => <Chip key={i} tone={i === 0 || i === 5 ? "red" : "slate"}>{n}</Chip>)}</div>
                    <p className="mt-4 font-sans text-xs text-[#94a3b8]">{bn ? "১ম ও শেষ বলে জিরো মিলেছে → আউট শেষ বলে (জিরোতে)।" : "Zeros matched on balls 1 and 6 → OUT on the last ball."}</p>
                  </Panel>
                </div>
              ) : (
                <p className="rounded-2xl border border-[#1e293b] bg-[#0b1220] p-5 text-sm leading-7 text-[#cbd5e1]">
                  {bn ? "ব্যাটসম্যান ওভারে ৩টির বেশি জিরো দিতে পারবে না, এবং জিরো-জিরো মিলে গেলে আউট নেই।" : "A batter cannot use more than 3 zeros in an over, and a 0–0 match is NOT out."}
                </p>
              )}
            </div>

            <div>
              <Head eyebrow="Unofficial" color="#06b6d4" title={bn ? "আনঅফিশিয়াল টেস্ট" : "Unofficial Test Matches"} />
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { n: bn ? "সিঙ্গেল টেস্ট" : "Single Test", r: bn ? ["৮ ওভার (Full)", "প্রতি ইনিংস ৩ উইকেট", "জিরো রুল ১ বা ২", "৩০+ লিডে Follow-On", "৮ ওভারে শেষ না হলে ড্র"] : ["8 overs (full)", "3 wickets per innings", "Zero Rule 1 or 2", "Follow-On at 30+ lead", "Draw if unfinished in 8 overs"] },
                  { n: bn ? "দলগত টেস্ট" : "Team Test", r: bn ? ["২/৩ জন প্লেয়ার", "১২ ওভার (Full)", "প্রতি ইনিংস ৩ উইকেট", "জিরো রুল একই", "৩০+ লিডে Follow-On · ১২ ওভারে না হলে ড্র"] : ["2/3 players", "12 overs (full)", "3 wickets per innings", "Same zero rule", "Follow-On at 30+ · Draw after 12 overs"] },
                ].map((c) => (
                  <Panel key={c.n} className="p-7">
                    <h4 className="text-lg font-black">{c.n}</h4>
                    <ul className="mt-4 space-y-2.5">
                      {c.r.map((x) => (<li key={x} className="flex gap-3 text-sm text-[#cbd5e1]"><span className="text-[#06b6d4]">✓</span>{x}</li>))}
                    </ul>
                  </Panel>
                ))}
              </div>
              <h4 className="mb-4 mt-10 text-sm font-bold uppercase tracking-wider text-[#64748b]">{bn ? "উভয় ম্যাচের কমন রুলস" : "Common rules for both"}</h4>
              <RuleList items={COMMON_TEST} lang={lang} color="#06b6d4" />
            </div>
          </div>
        )}

        {/* CHALLENGE */}
        {tab === "challenge" && (
          <div>
            <Head eyebrow="FCL Challenge" color="#22c55e" title={bn ? "চ্যালেঞ্জ ম্যাচ" : "Challenge Match"}
              sub={bn ? "আপনার FCL $ কাজে লাগানোর উত্তম উপায়। BET ধরে খেলুন — জিতলে BET সমপরিমাণ ডলার পাবেন, হারলে তা প্রতিপক্ষের একাউন্টে যাবে।" : "A great way to use your FCL $. Play with a BET — win and you receive the same amount; lose and it goes to your opponent."} />
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              {[
                { p: "X", b: "$5000", a: "-$5000", c: "#ef4444", r: bn ? "হেরেছে" : "Lost" },
                { p: "Y", b: "$5000", a: "+$5000", c: "#22c55e", r: bn ? "জিতেছে" : "Won" },
              ].map((x, i) => (
                <Fragment key={x.p}>
                  {i === 1 && <div key="vs" className="text-center text-xs font-black tracking-widest text-[#64748b]">VS · BET $5000</div>}
                  <Panel key={x.p} className="p-7">
                    <div className="flex items-center justify-between"><h4 className="text-2xl font-black">{x.p}</h4><Chip tone={i === 0 ? "red" : "blue"}>{x.r}</Chip></div>
                    <div className="mt-6 flex items-end gap-3">
                      <span className="text-sm text-[#64748b] line-through">{x.b}</span><span className="text-[#64748b]">→</span>
                      <span className="text-3xl font-black" style={{ color: x.c }}>{x.a}</span>
                    </div>
                  </Panel>
                </Fragment>
              ))}
            </div>
            <div className="mt-8"><RuleList lang={lang} color="#22c55e" items={[
              { en: "2 overs, 3 wickets. Bat can be changed after an OUT.", bn: "২ ওভার ৩ উইকেটের ম্যাচ। আউট হলে ব্যাট পরিবর্তন করা যাবে।" },
              { en: "Not playable anytime — only on the two fixed group posts (more to be added).", bn: "যখন তখন খেলা যাবে না — গ্রুপের নির্দিষ্ট দুইটি পোস্টে খেলতে হবে (ভবিষ্যতে আরও বাড়বে)।" },
              { en: "Matches are taken by trusted umpires appointed by FCC.", bn: "FCC কর্তৃক নির্ধারিত বিশ্বাসযোগ্য আম্পায়ার দিয়ে ম্যাচ নেওয়া হয়।" },
              { en: "Challenge matches can also be played as teams.", bn: "চ্যালেঞ্জ ম্যাচ টিম করেও খেলা যায়।" },
            ]} /></div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#172033] bg-[#02050b] py-10 text-center text-xs text-[#64748b]">
        {bn ? "নিবেদক: ফেসবুক ক্রিকেট কাউন্সিল · Happy FCL 🏏" : "By Facebook Cricket Council · Happy FCL 🏏"}
      </footer>
    </div>
  );
}