"use client";

import { useState, useEffect } from "react";

interface PreloaderProps {
  onFinish: () => void;
  theme?: "dark" | "light"; // থিম প্রপস (অপশনাল)
}

export default function Preloader({ onFinish, theme = "dark" }: PreloaderProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // অটো থিম ডিটেকশন (যদি ডকুমেন্টে data-theme বা class থাকে)
  useEffect(() => {
    const checkTheme = () => {
      const h = document.documentElement;
      const b = document.body;
      const dt = (h.getAttribute("data-theme") || h.getAttribute("data-mode") || b.getAttribute("data-theme") || "").toLowerCase();
      
      if (dt === "light") setIsDark(false);
      else if (dt === "dark") setIsDark(true);
      else {
        const cls = `${h.className} ${b.className}`.toLowerCase();
        if (/\blight\b/.test(cls)) setIsDark(false);
        else if (/\bdark\b/.test(cls)) setIsDark(true);
        else setIsDark(theme === "dark");
      }
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "data-mode"] });

    return () => observer.disconnect();
  }, [theme]);

  useEffect(() => {
    // ৪.৫ সেকেন্ড পরে ফেইড-আউট শুরু হবে
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    // ৫ সেকেন্ড পর প্রি-লোডার পুরোপুরি রিমুভ হবে
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700 ${
        isDark ? "bg-[#020617] text-white" : "bg-slate-50 text-slate-900"
      } ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      {/* ব্যাকগ্রাউন্ড গ্লো এফেক্ট (থিম অনুযায়ী অ্যাডজাস্ট করা) */}
      <div className={`absolute h-64 w-64 rounded-full blur-[100px] ${isDark ? "bg-blue-600/20" : "bg-blue-400/20"}`} />

      {/* লোগো ও পাল্সিং অ্যানিমেশন */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`relative flex h-28 w-28 items-center justify-center rounded-full border-2 animate-pulse shadow-xl ${
            isDark
              ? "border-blue-500/40 bg-[#0b1220] shadow-[0_0_30px_rgba(37,99,235,0.4)]"
              : "border-blue-400/50 bg-white shadow-[0_0_25px_rgba(37,99,235,0.2)]"
          }`}
        >
          <img
            src="/fcl-logo.png"
            alt="FCL Logo"
            className="h-20 w-20 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] animate-bounce"
          />
        </div>

        {/* সাইটের নাম বা ওয়েলকাম টেক্সট */}
        <h2 className={`mt-6 text-xl font-black tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>
          FCL <span className="text-amber-400">CRICKET</span>
        </h2>
        <p className={`mt-1 text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading Experience...</p>

        {/* প্রোগ্রেস বার (৫ সেকেন্ডের লোডিং ইন্ডিকেটর) */}
        <div className={`mt-6 h-1.5 w-48 overflow-hidden rounded-full ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
          <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 animate-[loadingBar_5s_linear_forwards]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}