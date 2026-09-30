"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Scroll-reveal hook — fades/lifts an element in once it enters view */
/* ------------------------------------------------------------------ */
function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(el);
          }
        });
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ------------------------------------------------------------------ */
/*  Reusable premium gateway card — tilt-on-hover + shimmer + reveal   */
/* ------------------------------------------------------------------ */
type GatewayCardProps = {
  href?: string;
  color: string;
  badgeText: string;
  badgeIcon: string;
  cornerIcon: string;
  title: string;
  description: string;
  footerText: string;
  delay?: number;
  comingSoon?: boolean;
};

function GatewayCard({
  href,
  color,
  badgeText,
  badgeIcon,
  cornerIcon,
  title,
  description,
  footerText,
  delay = 0,
  comingSoon = false,
}: GatewayCardProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -9, y: px * 9 });
  }

  const Wrapper = comingSoon ? "div" : Link;
  const wrapperProps = comingSoon ? {} : { href: href as string };

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
      }}
      className="transition-all duration-700 ease-out"
    >
      {/* @ts-ignore - polymorphic wrapper (Link vs div) */}
      <Wrapper
        {...wrapperProps}
        onMouseEnter={() => setHover(true)}
        onMouseMove={handleMove}
        onMouseLeave={() => {
          setHover(false);
          setTilt({ x: 0, y: 0 });
        }}
        style={{
          borderColor: hover ? color : `${color}44`,
          boxShadow: hover ? `0 0 40px ${color}22, 0 20px 40px -15px ${color}25` : "0 10px 30px rgba(0,0,0,0.04)",
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${
            hover ? -8 : 0
          }px) scale(${hover ? 1.015 : 1})`,
          transition: hover
            ? "transform 80ms linear, box-shadow 300ms ease, border-color 300ms ease"
            : "transform 500ms cubic-bezier(.2,.8,.2,1), box-shadow 400ms ease, border-color 400ms ease",
        }}
        className={`group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[2.5rem] border-2 bg-white p-8 ${
          comingSoon ? "cursor-pointer" : ""
        }`}
      >
        {/* ambient tint */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 30% 0%, ${color}22, transparent 60%)`,
          }}
        />
        {/* shimmer sweep */}
        <div
          className="pointer-events-none absolute inset-y-0 left-[-60%] w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-black/5 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[220%]"
        />

        <div className="relative">
          <div className="flex items-center justify-between">
            <span
              className="rounded-xl border px-3.5 py-1.5 text-xs font-black uppercase"
              style={{ borderColor: `${color}60`, backgroundColor: `${color}12`, color }}
            >
              {badgeIcon} {badgeText}
            </span>
            <span className="text-2xl transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              {cornerIcon}
            </span>
          </div>
          <h4
            className="mt-8 text-2xl font-black text-slate-900 transition sm:text-3xl"
            style={{ color: hover ? color : undefined }}
          >
            {title}
          </h4>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>

        <div
          className="relative mt-8 flex items-center justify-between border-t pt-4"
          style={{ borderColor: `${color}22` }}
        >
          <span className="text-xs font-bold" style={{ color }}>
            {footerText}
          </span>
          <span
            className="transform text-lg font-black transition-transform duration-300 group-hover:translate-x-2"
            style={{ color }}
          >
            {comingSoon ? "⚡" : "→"}
          </span>
        </div>
      </Wrapper>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                             */
/* ------------------------------------------------------------------ */
export default function BanglaHome() {
  const hero = useReveal<HTMLDivElement>(0.05);
  const heroArt = useReveal<HTMLDivElement>(0.05);
  const sectionHead = useReveal<HTMLDivElement>(0.2);

  const cards: GatewayCardProps[] = [
    {
      href: "/rankings",
      color: "#d97706",
      badgeText: "লিডারবোর্ড",
      badgeIcon: "👑",
      cornerIcon: "⭐",
      title: "র‍্যাঙ্কিং ও সেরা খেলোয়াড়",
      description:
        "সর্বকালের সেরা খেলোয়াড়দের র‍্যাঙ্কিং, এমভিপি রেটিং এবং জমজমাট চ্যাম্পিয়নশিপ লিডারবোর্ড দেখুন।",
      footerText: "প্রবেশ করুন",
    },
    {
      href: "/records",
      color: "#1877F2",
      badgeText: "রেকর্ড কেবিনেট",
      badgeIcon: "🏆",
      cornerIcon: "📜",
      title: "হল অব ফেম ও রেকর্ডসমূহ",
      description:
        "ঐতিহাসিক মাইলফলক, সর্বাধিক রান, সর্বোচ্চ উইকেট, হ্যাট্রিক এবং অসাধারণ সব রেকর্ডের খোঁজ নিন।",
      footerText: "প্রবেশ করুন",
    },
    {
      href: "/memories",
      color: "#db2777",
      badgeText: "নস্টালজিয়া",
      badgeIcon: "📖",
      cornerIcon: "🎞️",
      title: "এফসিএল স্মৃতি ও আড্ডা",
      description:
        "সোনালী দিনগুলো, মজার মুহূর্ত, কমিউনিটির গল্প এবং নস্টালজিক ছবির গ্যালাভারি পুনরায় উপভোগ করুন।",
      footerText: "প্রবেশ করুন",
    },
    {
      href: "/players",
      color: "#16a34a",
      badgeText: "স্কোয়াড ডিরেক্টরি",
      badgeIcon: "👥",
      cornerIcon: "🏏",
      title: "খেলোয়াড় ও স্ট্যাট কার্ড",
      description:
        "নিবন্ধিত সকল খেলোয়াড়দের ব্রাউজ করুন, অফিসিয়াল খেলোয়াড় স্ট্যাট কার্ড দেখুন এবং পিএনজি কার্ড ডাউনলোড করুন।",
      footerText: "প্রবেশ করুন",
    },
    {
      href: "/rules",
      color: "#0284c7",
      badgeText: "রুলবুক",
      badgeIcon: "📜",
      cornerIcon: "⚖️",
      title: "নিয়মাবলী ও ম্যাচের ফরম্যাট",
      description:
        "অফিসিয়াল টুর্নামেন্ট নির্দেশিকা, টি-টোয়েন্টি/ওয়ানডে/টেস্ট সিস্টেম এবং পাওয়ার-প্লে প্রবিধানগুলো পড়ুন।",
      footerText: "প্রবেশ করুন",
    },
    {
      href: "/play",
      color: "#1877F2",
      badgeText: "এফসিএল অনলাইন",
      badgeIcon: "🏏",
      cornerIcon: "🎮",
      title: "খেলা খেলুন",
      description:
        "এফসিএল অনলাইনে লগইন করুন, ম্যাচে যোগ দিন এবং আসল ফেসবুক ক্রিকেট লিগ গেমের অভিজ্ঞতা নিন।",
      footerText: "এফসিএল অনলাইনে যান",
    },
    {
      color: "#9333ea",
      badgeText: "থ্রিলার",
      badgeIcon: "⚡",
      cornerIcon: "🔥",
      title: "উত্তেজনাপূর্ণ ম্যাচসমূহ",
      description:
        "সবচেয়ে তীব্র ও রোমাঞ্চকর ফিনিশিং এবং মহাকাব্যিক টুর্নামেন্ট যুদ্ধের ম্যাচগুলো পুনরায় উপভোগ করুন। (শীঘ্রই আসছে)",
      footerText: "শীঘ্রই আসছে",
      comingSoon: true,
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-[#1877F2]/20 selection:text-slate-900 font-sans pb-20 sm:pb-0">
      <style jsx global>{`
        @keyframes float-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(24px, -32px) scale(1.05); }
        }
        @keyframes float-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-28px, 26px) scale(1.06); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes chip-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fcl-zoom-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(14,165,233,0.3)); }
          50% { transform: scale(1.18); filter: drop-shadow(0 0 20px rgba(14,165,233,0.6)); }
        }
        @keyframes fcl-color-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes mobile-glow {
          0%, 100% { opacity: .3; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.08); }
        }
        .fcl-orb-a { animation: float-a 11s ease-in-out infinite; }
        .fcl-orb-b { animation: float-b 13s ease-in-out infinite; }
        .fcl-gradient-text {
          background-size: 200% 200%;
          animation: gradient-shift 6s ease-in-out infinite;
        }
        .fcl-chip { animation: chip-float 5s ease-in-out infinite; }
        .fcl-chip-delay { animation-delay: 1.4s; }
        .fcl-grid-bg {
          background-image:
            linear-gradient(to right, rgba(100,116,139,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100,116,139,0.08) 1px, transparent 1px);
          background-size: 56px 56px;
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%);
          mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%);
        }
        .fcl-zoom-text {
          background: linear-gradient(90deg, #2563eb, #0284c7, #d97706, #9333ea, #2563eb);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fcl-color-shift 4s ease infinite, fcl-zoom-pulse 2.5s ease-in-out infinite;
          display: inline-block;
        }
        .fcl-mobile-glow { animation: mobile-glow 5s ease-in-out infinite; }
        @media (min-width: 640px) {
          .fcl-mobile-only { display: none !important; }
        }
      `}</style>

      {/* ================================================================
          DESKTOP HERO — white theme structure
         ================================================================ */}
      <section className="relative hidden min-h-[calc(100vh-76px)] overflow-hidden border-b border-slate-200 bg-slate-50/50 sm:block">
        <div className="absolute inset-0 bg-slate-50/50" />
        <div className="absolute inset-0 fcl-grid-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(37,99,235,0.08),transparent_34%)]" />
        <div className="fcl-orb-a absolute right-[-15%] top-[-20%] h-[650px] w-[650px] rounded-full bg-purple-500/5 blur-[130px]" />
        <div className="fcl-orb-b absolute left-[-20%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[130px]" />

        <div className="relative mx-auto min-h-[calc(100vh-76px)] max-w-[1500px] px-6 flex items-center">
          <div className="grid w-full items-center lg:grid-cols-[0.85fr_1.15fr] gap-12 py-12">
            <div ref={hero.ref} style={{ opacity: hero.visible ? 1 : 0, transform: hero.visible ? "translateY(0)" : "translateY(24px)" }} className="relative z-30 text-center transition-all duration-700 ease-out lg:text-left">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 backdrop-blur-xl shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">এফসিএল • ডিজিটাল গেটওয়ে হাব</span>
              </div>
              <h2 className="text-5xl font-black leading-[1.15] tracking-[-0.03em] text-slate-900 sm:text-6xl md:text-7xl lg:text-[72px]">
                <span className="block mb-2">মাঠের সীমানা পেরিয়ে</span>
                <span className="fcl-gradient-text block bg-gradient-to-r from-blue-600 via-[#1877F2] to-purple-600 bg-clip-text text-transparent mb-3">খেলার উন্মাদনা সর্বত্র।</span>
                <span className="mt-2 block text-[0.42em] font-bold leading-relaxed tracking-normal text-amber-600">একটি খেলা। একটি পরিবার। <span className="fcl-zoom-text text-[1.45em] font-black tracking-[-0.04em]">এফসিএল।</span></span>
              </h2>
              <p className="mx-auto mt-6 max-w-[540px] text-sm leading-8 text-slate-600 md:text-base lg:mx-0">ফেসবুক ক্রিকেট লিগের অফিসিয়াল পোর্টালে স্বাগতম। নিচের নির্দিষ্ট গেটওয়েগুলোর মাধ্যমে সহজেই র‍্যাঙ্কিং, ঐতিহাসিক রেকর্ড ক্যাবিনেট, স্মৃতি এবং রোমাঞ্চকর ম্যাচের সারাংশ উপভোগ করুন।</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <a href="#gateways" className="group relative overflow-hidden rounded-xl bg-[#1877F2] px-7 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-[#1877F2]/25 transition hover:bg-blue-600"><span className="relative z-10">পোর্টালগুলো দেখুন ↓</span><span className="absolute inset-y-0 left-[-60%] w-1/2 -skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-[280%]" /></a>
                <Link href="/" className="rounded-xl border border-blue-200 bg-blue-50 px-7 py-3.5 text-center text-sm font-bold text-blue-600 transition hover:bg-[#1877F2] hover:text-white">🌙 Dark Version</Link>
              </div>
            </div>

            <div ref={heroArt.ref} style={{ opacity: heroArt.visible ? 1 : 0, transform: heroArt.visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)" }} className="relative h-[420px] sm:h-[480px] lg:h-[550px] w-full transition-all duration-700 ease-out">
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex items-center justify-center p-4"><img src="/fcl-room.png" alt="FCL Room" className="h-full w-full object-contain object-center" /></div>
              <div className="fcl-chip absolute -left-2 sm:-left-6 top-6 sm:top-10 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/90 px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl shadow-xl"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" /><div><span className="text-[10px] sm:text-xs font-bold text-slate-900 block">এফসিএল লাইভ</span><span className="text-[9px] sm:text-[10px] text-blue-600">টিম ফিনিক্স · ১৪/২</span></div></div>
              <div className="fcl-chip fcl-chip-delay absolute -right-2 sm:-right-4 top-24 sm:top-36 flex items-center gap-2 rounded-2xl border border-rose-200 bg-white/90 px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl shadow-xl"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white font-black text-xs shadow-sm">৬</div><div><span className="text-[10px] sm:text-xs font-black text-rose-600 block tracking-wider">আউট</span><span className="text-[9px] sm:text-[10px] text-slate-500">বল ১</span></div></div>
              <div className="fcl-chip absolute -left-2 sm:-left-6 bottom-16 sm:bottom-20 flex items-center gap-2 rounded-2xl border border-blue-200 bg-white/90 px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl shadow-xl"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1877F2] text-white font-black text-xs shadow-sm">৪</div><div><span className="text-[10px] sm:text-xs font-bold text-blue-600 block">+৪ রান</span><span className="text-[9px] sm:text-[10px] text-slate-500">বল ২</span></div></div>
              <div className="fcl-chip fcl-chip-delay absolute -right-2 sm:-right-4 bottom-4 sm:bottom-8 flex flex-col gap-0.5 rounded-2xl border border-amber-200 bg-white/90 px-3.5 sm:px-4 py-2 sm:py-2.5 backdrop-blur-xl shadow-xl"><div className="flex items-center gap-1.5"><span className="text-xs sm:text-sm">🎯</span><span className="text-[11px] sm:text-xs font-bold text-amber-600">২৪ বলে ৫৬ রান প্রয়োজন</span></div><span className="text-[10px] sm:text-[11px] font-semibold text-slate-500">টার্গেট ৭০</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          MOBILE HOME APP — white theme structure
         ================================================================ */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50/50 px-4 pb-7 pt-5 sm:hidden">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-[90px] fcl-mobile-glow" />
        <div className="pointer-events-none absolute -left-28 bottom-0 h-64 w-64 rounded-full bg-purple-500/5 blur-[90px]" />

        <div className="relative rounded-[25px] border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-amber-600">✨ ডিজিটাল এফসিএল এরেনা</span>
            <Link href="/rules" className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[8px] font-bold text-slate-600 shadow-sm">ⓘ এফসিএল নিয়মাবলী</Link>
          </div>
          <p className="mt-3 text-[11px] font-medium leading-5 text-slate-700">অফিসিয়াল ফেসবুক ক্রিকেট লিগ ডিজিটাল প্ল্যাটফর্ম</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-lg bg-blue-50 px-2 py-1 text-[8px] font-bold text-blue-600">২ ওভার</span>
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-600">৩ উইকেট</span>
            <span className="rounded-lg bg-amber-50 px-2 py-1 text-[8px] font-bold text-amber-600">নং ৫</span>
            <span className="rounded-lg bg-purple-50 px-2 py-1 text-[8px] font-bold text-purple-600">অটো আম্পায়ার</span>
          </div>
        </div>

        <div className="mt-5 px-1">
          <span className="text-[9px] font-black uppercase tracking-[0.28em] text-sky-600">এফসিএল ডিজিটাল প্ল্যাটফর্ম</span>
          <h2 className="mt-2 text-[28px] font-black leading-[1.3] tracking-[-0.03em] text-slate-900">মাঠের সীমানা পেরিয়ে<br /><span className="bg-gradient-to-r from-blue-600 via-[#1877F2] to-purple-600 bg-clip-text text-transparent">খেলার উন্মাদনা সর্বত্র।</span></h2>
          <p className="mt-3 max-w-[340px] text-[11px] leading-6 text-slate-600">অফিসিয়াল এফসিএল আর্কাইভ, খেলোয়াড়, র‍্যাঙ্কিং, রেকর্ড, স্মৃতি এবং অনলাইন গেমটি অন্বেষণ করুন।</p>
        </div>

        <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.06)]">
          <img src="/fcl-room.png" alt="FCL Online" className="h-[185px] w-full object-cover object-center" />
        </div>
      </section>

      {/* ================================================================
          DESKTOP PORTALS — white background theme
         ================================================================ */}
      <section id="gateways" className="relative hidden overflow-hidden bg-white px-6 py-28 sm:block">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[150px]" />
        <div className="mx-auto max-w-7xl relative z-10">
          <div ref={sectionHead.ref} style={{ opacity: sectionHead.visible ? 1 : 0, transform: sectionHead.visible ? "translateY(0)" : "translateY(24px)" }} className="text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ease-out">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-sky-600">এফসিএল নেভিগেশন পোর্টাল</span>
            <h3 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-slate-900">আপনার গন্তব্য বেছে নিন</h3>
            <p className="mt-3 text-sm sm:text-base text-slate-600">সরাসরি নির্দিষ্ট বিভাগে প্রবেশ করতে নিচের যেকোনো গেটওয়েতে ক্লিক করুন।</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, i) => <GatewayCard key={card.title} {...card} delay={i * 90} />)}
          </div>
        </div>
      </section>

      {/* ================================================================
          MOBILE PORTALS — white background compact app cards
         ================================================================ */}
      <section id="mobile-gateways" className="relative overflow-hidden bg-white px-4 pb-8 pt-6 sm:hidden">
        <div className="mb-4 flex items-end justify-between px-1">
          <div>
            <span className="text-[8px] font-black uppercase tracking-[0.28em] text-sky-600">এফসিএল নেভিগেশন</span>
            <h3 className="mt-1 text-[24px] font-black tracking-tight text-slate-900">আপনার গন্তব্য বেছে নিন</h3>
          </div>
          <span className="text-[9px] font-semibold text-slate-500">৭টি পোর্টাল</span>
        </div>

        <div className="space-y-3">
          {cards.map((card, i) => {
            const colors = ["#d97706", "#1877F2", "#db2777", "#16a34a", "#0284c7", "#1877F2", "#9333ea"];
            const color = colors[i];
            const content = (
              <div className="relative flex min-h-[112px] items-center gap-3.5 overflow-hidden rounded-[21px] border bg-slate-50/70 p-3.5 shadow-sm" style={{ borderColor: `${color}40` }}>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[17px] border shadow-xs" style={{ borderColor: `${color}40`, backgroundColor: `${color}12` }}>
                  <span className="text-[26px]">{card.badgeIcon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wide" style={{ borderColor: `${color}40`, backgroundColor: `${color}10`, color }}>{card.badgeText}</span>
                    {card.comingSoon && <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[7px] font-black text-purple-700">শীঘ্রই আসছে</span>}
                  </div>
                  <h4 className="mt-1.5 truncate text-[16px] font-black text-slate-900">{card.title}</h4>
                  <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-slate-600">{card.description}</p>
                </div>
                <span className="shrink-0 text-lg font-black" style={{ color }}>{card.comingSoon ? "⚡" : "→"}</span>
              </div>
            );
            return card.comingSoon ? <div key={card.title}>{content}</div> : <Link key={card.title} href={card.href as string}>{content}</Link>;
          })}
        </div>
      </section>
    </main>
  );
}