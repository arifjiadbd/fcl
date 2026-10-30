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
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const isBanglaPage = pathname === "/bn";
  const isDark = mounted && resolvedTheme === "dark";

  // থিম অনুযায়ী কালার (dark: ভ্যারিয়েন্টের উপর নির্ভর না করে সরাসরি থিম স্টেট থেকে)
  const t = {
    header: isDark
      ? "bg-[#0b1220] border-slate-700"
      : "bg-white border-slate-200",
    text: isDark ? "!text-white" : "!text-slate-900",
    subText: isDark ? "!text-slate-300" : "!text-slate-600",
    accent: isDark ? "!text-sky-400" : "!text-blue-700",
    navIdle: isDark
      ? "!text-white hover:bg-white/10"
      : "!text-slate-900 hover:bg-slate-100",
    navOpen: isDark ? "bg-white/15 !text-white" : "bg-slate-200 !text-slate-950",
    panel: isDark
      ? "bg-[#0f172a] border-slate-700"
      : "bg-white border-slate-200",
    divider: isDark ? "border-slate-700" : "border-slate-200",
    item: isDark
      ? "!text-slate-100 hover:bg-white/10"
      : "!text-slate-900 hover:bg-slate-100",
    mobileItem: isDark
      ? "bg-[#0f172a] !text-slate-100 border border-slate-700 hover:bg-white/10"
      : "bg-slate-50 !text-slate-900 border border-slate-200 hover:bg-slate-100",
    mobileHome: isDark ? "bg-white/10 !text-white" : "bg-slate-100 !text-slate-900",
    iconBtn: isDark
      ? "bg-[#0f172a] border-slate-600 hover:bg-slate-800"
      : "bg-white border-slate-300 hover:bg-slate-100",
    admin: isDark
      ? "border-amber-500/50 bg-amber-500/15 !text-amber-300 hover:bg-amber-500/25"
      : "border-amber-500 bg-amber-50 !text-amber-900 hover:bg-amber-100",
    lang: isDark
      ? "bg-blue-600/30 border border-blue-500/50 !text-sky-200 hover:bg-blue-600 hover:!text-white"
      : "bg-blue-600 hover:bg-blue-700 !text-white",
  };

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
      items: [{ label: "Rules & Match Formats", href: "/rules" }],
    },
  ];

  return (
    <header
      ref={dropdownRef}
      className={`fixed top-0 left-0 right-0 z-[9999] w-full border-b shadow-sm transition-colors duration-300 ${t.header}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
        {/* লোগো ও ব্র্যান্ড নাম */}
        <Link href={isBanglaPage ? "/bn" : "/"} className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-600/15 dark:border-blue-500/30 p-1 shadow-sm transition-transform group-hover:scale-105">
            <img src="/fcl-logo.png" alt="FCL Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <span className={`text-xs sm:text-sm font-black tracking-wide leading-none block ${t.text}`}>
              Facebook <span className={t.accent}>Cricket League</span>
            </span>
            <span className={`block text-[8.5px] font-bold uppercase tracking-wider mt-0.5 ${t.subText}`}>
              Official Digital Platform
            </span>
          </div>
        </Link>

        {/* 💻 মেনু বাটনসমূহ */}
        <nav className="hidden lg:flex items-center gap-1.5">
          <Link
            href={isBanglaPage ? "/bn" : "/"}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              pathname === "/" || pathname === "/bn"
                ? "bg-blue-600 !text-white shadow-sm"
                : t.navIdle
            }`}
          >
            <span>🏠</span>
            <span>{isBanglaPage ? "হোম" : "Home"}</span>
          </Link>

          {categories.map((cat) => {
            const isOpen = activeDropdown === cat.name;
            return (
              <div key={cat.name} className="relative">
                <button
                  onClick={() => setActiveDropdown(isOpen ? null : cat.name)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    isOpen ? `${t.navOpen} font-extrabold` : t.navIdle
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={`text-[9px] transition-transform duration-200 ${t.subText} ${isOpen ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {/* সাব-মেনু ড্রপডাউন */}
                {isOpen && (
                  <div className={`absolute left-0 mt-1.5 w-60 rounded-2xl border p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50 ${t.panel}`}>
                    <div className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-b mb-1 ${t.subText} ${t.divider}`}>
                      {cat.name} Options
                    </div>
                    {cat.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                          pathname === item.href
                            ? "bg-blue-600 !text-white shadow-sm"
                            : t.item
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-sky-400" : "bg-blue-600"}`} />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* অ্যাডমিন বাটন */}
          <Link
            href="/superadmin"
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 border ${
              pathname === "/superadmin"
                ? "bg-amber-600 border-amber-600 !text-white shadow-sm"
                : t.admin
            }`}
          >
            <span>🔐</span>
            <span>Admin</span>
          </Link>
        </nav>

        {/* ডানপাশের কন্ট্রোল বাটন */}
        <div className="flex items-center gap-2">
          {/* থিম টগল */}
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle Theme"
              className={`flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition text-sm ${t.iconBtn}`}
              title="Toggle Theme"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          )}

          {/* ভাষা পরিবর্তন বাটন */}
          <Link
            href={isBanglaPage ? "/" : "/bn"}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition flex items-center gap-1.5 ${t.lang}`}
          >
            <span>{isBanglaPage ? "🇬🇧" : "💙"}</span>
            <span>{isBanglaPage ? "English" : "বাংলা"}</span>
          </Link>

          {/* মোবাইল মেনু বাটন */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border lg:hidden text-sm transition ${t.iconBtn} ${t.text}`}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* 📱 মোবাইল মেনু */}
      {mobileMenuOpen && (
        <div className={`border-t px-4 py-4 lg:hidden max-h-[80vh] overflow-y-auto space-y-4 shadow-xl ${t.header}`}>
          <Link
            href={isBanglaPage ? "/bn" : "/"}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold ${
              pathname === "/" || pathname === "/bn"
                ? "bg-blue-600 !text-white shadow-sm"
                : t.mobileHome
            }`}
          >
            <span>🏠</span>
            <span>{isBanglaPage ? "হোম" : "Home"}</span>
          </Link>

          {categories.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className={`flex items-center gap-2 px-1 text-[11px] font-black uppercase tracking-wider ${t.accent}`}>
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </div>
              <div className="grid grid-cols-1 gap-1 pl-2">
                {cat.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                      pathname === item.href
                        ? "bg-blue-600 !text-white shadow-sm"
                        : t.mobileItem
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-sky-400" : "bg-blue-600"}`} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <Link
            href="/superadmin"
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold border ${
              pathname === "/superadmin"
                ? "bg-amber-600 border-amber-600 !text-white shadow-sm"
                : t.admin
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