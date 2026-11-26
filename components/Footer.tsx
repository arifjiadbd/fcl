"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const read = () => {
      const html = document.documentElement;
      const body = document.body;

      const theme = (
        html.getAttribute("data-theme") ||
        html.getAttribute("data-mode") ||
        body.getAttribute("data-theme") ||
        body.getAttribute("data-mode") ||
        ""
      ).toLowerCase();

      if (theme === "dark" || theme === "light") {
        return theme === "dark";
      }

      const classes = `${html.className} ${body.className}`.toLowerCase();

      if (/\blight\b/.test(classes)) return false;
      if (/\bdark\b/.test(classes)) return true;

      const scheme = html.style.colorScheme;

      if (scheme === "dark" || scheme === "light") {
        return scheme === "dark";
      }

      try {
        const saved = localStorage.getItem("theme");

        if (saved === "dark" || saved === "light") {
          return saved === "dark";
        }
      } catch {}

      return media.matches;
    };

    const update = () => setIsDark(read());

    update();

    const observer = new MutationObserver(update);
    const options = {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-mode", "style"],
    };

    observer.observe(document.documentElement, options);
    observer.observe(document.body, options);

    window.addEventListener("storage", update);
    media.addEventListener("change", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", update);
      media.removeEventListener("change", update);
    };
  }, []);

  return isDark;
}

const items = [
  { href: "/", icon: "⌂", en: "Home", bn: "হোম" },
  { href: "/play", icon: "🎮", en: "Play", bn: "গেম" },
  { href: "/players", icon: "👥", en: "Players", bn: "খেলোয়াড়" },
  { href: "/rankings", icon: "🏆", en: "Ranking", bn: "র‍্যাঙ্কিং" },
  { href: "/memories", icon: "📖", en: "Memories", bn: "স্মৃতি" },
];

export default function Footer() {
  const pathname = usePathname();
  const isBangla = pathname === "/bn" || pathname.startsWith("/bn/");
  const isDark = useIsDark();
  const home = isBangla ? "/bn" : "/";
  return (
    <>
      <footer lang={isBangla ? "bn" : "en"} className={`relative overflow-hidden border-t px-4 pt-5 pb-[calc(96px+env(safe-area-inset-bottom))] transition-colors duration-300 sm:px-6 sm:py-6 ${isDark ? "border-slate-800 bg-[#020617] text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-xl bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-16 w-64 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 text-center">
          <Link href={home} className={`text-sm font-bold transition-colors hover:text-blue-500 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            {isBangla ? "ফেসবুক ক্রিকেট লিগ" : "Facebook Cricket League"}
          </Link>
          <p className="text-[11px] leading-relaxed sm:text-xs">
            {isBangla ? "© ২০২৬ | আরিফ জিয়াদ | সর্বস্বত্ব সংরক্ষিত।" : "© 2026 | আরিফ জিয়াদ | All rights reserved."}
          </p>
        </div>
      </footer>
      <nav aria-label={isBangla ? "প্রধান নেভিগেশন" : "Main navigation"} lang={isBangla ? "bn" : "en"} className={`fixed inset-x-0 bottom-0 z-[60] border-t px-2 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] backdrop-blur-2xl transition-colors duration-300 sm:hidden ${isDark ? "border-slate-800 bg-[#050a17]/95 shadow-[0_-8px_30px_rgba(0,0,0,.35)]" : "border-slate-200 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,.08)]"}`}>
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {items.map((item) => {
            const href = item.href === "/" ? home : item.href;
            const active = item.href === "/" ? pathname === home : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={item.href} href={href} aria-current={active ? "page" : undefined} className={`relative flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 transition-colors duration-300 motion-safe:active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${active ? (isDark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-700") : (isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-blue-700")}`}>
                {active && <span aria-hidden="true" className="absolute top-0 h-[3px] w-6 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,.55)]" />}
                <span aria-hidden="true" className="flex h-7 items-center text-[22px] leading-none">{item.icon}</span>
                <span className="max-w-full whitespace-nowrap text-[10px] font-semibold leading-tight">{isBangla ? item.bn : item.en}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
