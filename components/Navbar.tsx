"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // হাইড্রেশন মিসম্যাচ এড়ানোর জন্য
  useEffect(() => setMounted(true), []);

  // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হয়ে যাবে
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // পেজ পরিবর্তন হলে মোবাইল মেনু বন্ধ হবে
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const categories = [
    {
      name: "Players & Stats",
      icon: "🏏",
      items: [
        { label: "Squad & Player Data", href: "/players" },
        { label: "Rankings & MVP", href: "/rankings" },
        { label: "Hall of Fame & Records", href: "/records" },
        { label: "Player Photo Gallery", href: "/gallery" },
      ],
    },
    {
      name: "Matches & Thrills",
      icon: "⚡",
      items: [
        { label: "Match Directory & History", href: "/matches" },
        { label: "High Voltage Matches", href: "/thrillers" },
        { label: "Extraordinary Performance", href: "/extraordinary" },
      ],
    },
    {
      name: "Community & Fun",
      icon: "🎉",
      items: [
        { label: "Birthday Celebration", href: "/birthday" },
        { label: "FCL Memories & Adda", href: "/memories" },
        { label: "Play The Game (Online)", href: "/play" },
      ],
    },
    {
      name: "More",
      icon: "📜",
      items: [
        { label: "Rules & Match Formats", href: "/rules" },
      ],
    },
  ];

  const isBanglaPage = pathname === "/bn";

  return (
    <header ref={dropdownRef} className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* লোগো */}
        <Link href={isBanglaPage ? "/bn" : "/"} className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/40 p-1.5 shadow">
            <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <span className="text-sm font-black tracking-wide text-slate-900 dark:text-white group-hover:text-sky-400 transition">
              Facebook <span className="text-sky-400">Cricket League</span>
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Official Digital Platform</span>
          </div>
        </Link>

        {/* 💻 পিসি ভিউ নেভিগেশন (ক্যাটেগরি ও সাব-মেনু) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          <Link
            href={isBanglaPage ? "/bn" : "/"}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
              pathname === "/" || pathname === "/bn"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            🏠 {isBanglaPage ? "হোম" : "Home"}
          </Link>

          {categories.map((cat) => {
            const isOpen = activeDropdown === cat.name;
            return (
              <div key={cat.name} className="relative">
                <button
                  onClick={() => setActiveDropdown(isOpen ? null : cat.name)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    isOpen
                      ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={`text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▼</span>
                </button>

                {/* সাব-মেনু ড্রপডাউন */}
                {isOpen && (
                  <div className="absolute left-0 mt-2 w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1220]/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                      {cat.name} Options
                    </div>
                    {cat.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                          pathname === item.href
                            ? "bg-blue-600 text-white shadow"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* সুপার অ্যাডমিন শর্টকাট লিংক */}
          <Link
            href="/superadmin"
            className={`rounded-xl px-3 py-2 text-xs font-bold transition flex items-center gap-1 ${
              pathname === "/superadmin"
                ? "bg-amber-600 text-white shadow"
                : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <span>🔐</span>
            <span>Admin</span>
          </Link>
        </nav>

        {/* ডানপাশে থিম টগল, ভাষা পরিবর্তন ও মোবাইল মেনু */}
        <div className="flex items-center gap-2">
          {/* চাঁদ ও সূর্য টগল বাটন */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle Theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#0b1220] text-amber-500 dark:text-amber-400 shadow transition hover:scale-105"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          )}

          <Link
            href={isBanglaPage ? "/" : "/bn"}
            className="rounded-xl border border-blue-500/40 bg-blue-500/15 px-3 py-2 text-xs font-bold text-blue-700 dark:text-sky-300 transition hover:bg-blue-600 hover:text-white flex items-center gap-1.5"
          >
            <span>{isBanglaPage ? "🇬🇧" : "💙"}</span>
            <span>{isBanglaPage ? "English" : "বাংলা"}</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#0b1220] text-slate-700 dark:text-slate-300 lg:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* 📱 ফোন ভিউ বা মোবাইল ড্রপডাউন মেনু */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080d17]/95 px-4 py-5 backdrop-blur-2xl lg:hidden max-h-[80vh] overflow-y-auto space-y-5 animate-in slide-in-from-top duration-200">
          <Link
            href={isBanglaPage ? "/bn" : "/"}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black ${
              pathname === "/" || pathname === "/bn"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200"
            }`}
          >
            <span>🏠</span>
            <span>{isBanglaPage ? "হোম" : "Home"}</span>
          </Link>

          {categories.map((cat) => (
            <div key={cat.name} className="space-y-2">
              <div className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-wider text-sky-500 dark:text-sky-400">
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 pl-2">
                {cat.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                      pathname === item.href
                        ? "bg-blue-600 text-white shadow"
                        : "bg-slate-100 dark:bg-[#0b1220] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* মোবাইল মেনুতে সুপার অ্যাডমিন লিংক */}
          <Link
            href="/superadmin"
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black ${
              pathname === "/superadmin"
                ? "bg-amber-600 text-white shadow"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            }`}
          >
            <span>🔐</span>
            <span>Super Admin Panel</span>
          </Link>
        </div>
      )}
    </header>
  );
}