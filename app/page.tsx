"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CSSVars = CSSProperties & {
  [key: `--${string}`]: string | number;
};

/* ================================================================
   SHARED HOOKS
================================================================ */
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

function useReducedMotion() {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

/** null = এখনো জানা যায়নি (প্রথম রেন্ডার), true = মোবাইল, false = পিসি/ট্যাবলেট */
function useIsMobile() {
  const [mobile, setMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setMobile(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return mobile;
}

/* ================================================================
   PRELOADER (২য় কোডের হুবহু)
================================================================ */
function Preloader({
  onFinish,
  isDark,
}: {
  onFinish: () => void;
  isDark: boolean;
}) {
  const [fadeOut, setFadeOut] = useState(false);
  const [pct, setPct] = useState(0);
  const [logoError, setLogoError] = useState(false);

  const finishRef = useRef(onFinish);
  const doneRef = useRef(false);
  const skipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    finishRef.current = onFinish;
  });

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    finishRef.current();
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = reduced ? 900 : 3200;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min((now - start) / DURATION, 1);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const t1 = setTimeout(() => setFadeOut(true), DURATION - 500);
    const t2 = setTimeout(finish, DURATION);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      if (skipTimer.current) clearTimeout(skipTimer.current);
    };
  }, [finish]);

  const skip = () => {
    if (fadeOut) return;
    setFadeOut(true);
    skipTimer.current = setTimeout(finish, 350);
  };

  return (
    <div
      role="status"
      aria-label="FCL লোড হচ্ছে"
      onClick={skip}
      className={`pl-root ${isDark ? "pl-dark" : "pl-light"} ${fadeOut ? "is-out" : ""}`}
    >
      <div className="pl-grid" aria-hidden="true" />
      <div className="pl-glow pl-glow-a" aria-hidden="true" />
      <div className="pl-glow pl-glow-b" aria-hidden="true" />

      <div className="pl-center">
        <div className="pl-logo-wrap">
          <div className="pl-ring" />
          <div className="pl-orbit">
            <i />
          </div>
          <div className="pl-disc">
            {logoError ? (
              <strong className="pl-fallback">FCL</strong>
            ) : (
              <img
                src="/fcl-logo.png"
                alt="FCL Logo"
                className="pl-logo"
                draggable={false}
                onError={() => setLogoError(true)}
              />
            )}
          </div>
        </div>

        <h2 className="pl-title" aria-label="FCL CRICKET">
          {"FCL CRICKET".split("").map((ch, i) => (
            <span
              key={i}
              className={`pl-letter ${i >= 4 ? "is-amber" : ""}`}
              style={{ "--i": i } as CSSVars}
              aria-hidden="true"
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h2>

        <p className="pl-sub">LOADING EXPERIENCE</p>

        <div className="pl-bar">
          <div style={{ width: `${pct}%` }} />
        </div>
        <span className="pl-pct">{pct}%</span>
        <span className="pl-skip">Tap anywhere to skip</span>
      </div>
    </div>
  );
}

/* ================================================================
   📱 MOBILE VIEW — ২য় কোডের ফুলের মেনু (হিরো হালকা করা হয়েছে)
================================================================ */
type Portal = {
  href: string;
  icon: string;
  title: string;
  english: string;
  description: string;
};

type MenuGroup = {
  id: string;
  icon: string;
  title: string;
  short: string;
  english: string;
  color: string;
  description: string;
  items: Portal[];
};

type SparkBurst = {
  id: number;
  x: number;
  y: number;
  color: string;
};

const MENU_GROUPS: MenuGroup[] = [
  {
    id: "legends",
    icon: "🏆",
    title: "তারকাদের মঞ্চ",
    short: "স্ট্যাটস",
    english: "STATS & LEGENDS",
    color: "#f59e0b",
    description: "র্যাঙ্কিং, রেকর্ড আর আপনার প্রিয় ক্রিকেটারের পরিসংখ্যান।",
    items: [
      { href: "/rankings", icon: "👑", title: "র্যাঙ্কিং ও MVP", english: "Rankings & MVP", description: "সেরা খেলোয়াড়, MVP রেটিং ও লিডারবোর্ড।" },
      { href: "/records", icon: "🏆", title: "রেকর্ডবুক", english: "Hall of Fame & Records", description: "সেঞ্চুরি, হ্যাটট্রিক আর ইতিহাস গড়া সব অর্জন।" },
      { href: "/players", icon: "🏏", title: "প্লেয়ার প্রোফাইল", english: "Players & Stat Cards", description: "খেলোয়াড়দের পরিচিতি ও অফিসিয়াল স্ট্যাট কার্ড।" },
    ],
  },
  {
    id: "arena",
    icon: "⚡",
    title: "ম্যাচের দুনিয়া",
    short: "ম্যাচ",
    english: "MATCH ARENA",
    color: "#a78bfa",
    description: "পুরোনো ম্যাচ থেকে শেষ বলের রোমাঞ্চ—সব এক জায়গায়।",
    items: [
      { href: "/matches", icon: "🏟️", title: "ম্যাচ আর্কাইভ", english: "Match Directory & History", description: "টুর্নামেন্ট, সিরিজ ও ঐতিহাসিক ম্যাচের সংগ্রহ।" },
      { href: "/thrillers", icon: "⚡", title: "হাই ভোল্টেজ", english: "High Voltage Matches", description: "শেষ মুহূর্তের উত্তেজনা আর অবিশ্বাস্য সব ফিনিশ।" },
      { href: "/extraordinary", icon: "💎", title: "অসাধারণ নৈপুণ্য", english: "Extraordinary Performance", description: "ম্যাচজয়ী ইনিংস ও অবিস্মরণীয় ব্যক্তিগত পারফরম্যান্স।" },
    ],
  },
  {
    id: "community",
    icon: "💙",
    title: "আমাদের FCL",
    short: "কমিউনিটি",
    english: "THE COMMUNITY",
    color: "#f472b6",
    description: "খবর, জন্মদিন আর একসঙ্গে কাটানো প্রিয় মুহূর্তগুলো।",
    items: [
      { href: "/news", icon: "📰", title: "FCL সংবাদ", english: "FCL News Portal", description: "টুর্নামেন্ট আপডেট, কমিউনিটি সংবাদ ও বিশেষ প্রতিবেদন।" },
      { href: "/memories", icon: "🎞️", title: "স্মৃতি ও আড্ডা", english: "FCL Memories & Adda", description: "পুরোনো দিনের গল্প, হাসি আর জমে থাকা স্মৃতি।" },
      { href: "/birthday", icon: "🎂", title: "জন্মদিনের উৎসব", english: "Birthday Celebration", description: "FCL তারকাদের জন্মদিন ও শুভেচ্ছা কার্ড।" },
    ],
  },
  {
    id: "play",
    icon: "🎮",
    title: "প্লে ও এক্সপ্লোর",
    short: "এক্সপ্লোর",
    english: "PLAY & EXPLORE",
    color: "#22d3ee",
    description: "মাঠে নামুন, নিয়ম জানুন অথবা ঘুরে দেখুন ফটো গ্যালারি।",
    items: [
      { href: "/play", icon: "🎮", title: "খেলা শুরু করুন", english: "Play FCL Online", description: "মূল Facebook Cricket League গেমে প্রবেশ করুন।" },
      { href: "/gallery", icon: "📸", title: "ফটো গ্যালারি", english: "Player Photo Gallery", description: "খেলোয়াড়দের ছবি দেখুন ও ডাউনলোড করুন।" },
      { href: "/rules", icon: "📜", title: "খেলার নিয়ম", english: "Rules & Match Formats", description: "অফিসিয়াল গাইডলাইন ও বিভিন্ন ম্যাচ ফরম্যাট।" },
    ],
  },
];

function ArrowIcon({ back = false }: { back?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ transform: back ? "rotate(180deg)" : undefined }}
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MobileHome({
  isDark,
  reducedMotion,
  ready,
}: {
  isDark: boolean;
  reducedMotion: boolean;
  ready: boolean;
}) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [bursts, setBursts] = useState<SparkBurst[]>([]);
  const [announcement, setAnnouncement] = useState("");

  const centerRef = useRef<HTMLButtonElement>(null);
  const burstId = useRef(0);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const activeGroup =
    MENU_GROUPS.find((group) => group.id === activeGroupId) ?? null;

  const previewGroup =
    activeGroup ??
    MENU_GROUPS.find((group) => group.id === previewId) ??
    null;

  const accent = previewGroup?.color ?? "#60a5fa";

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => {
      pendingTimers.forEach((timer) => clearTimeout(timer));
      pendingTimers.clear();
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) setBursts([]);
  }, [reducedMotion]);

  function scrollToMenu() {
    document.getElementById("fu-menu")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  useEffect(() => {
    if (!ready) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) {
        return;
      }

      if (event.key === "Escape") {
        if (activeGroupId) {
          event.preventDefault();
          setActiveGroupId(null);
          setPreviewId(null);
          setAnnouncement("মূল মেনুতে ফিরে এসেছেন।");
          centerRef.current?.focus({ preventScroll: true });
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ready, activeGroupId]);

  function openGroup(group: MenuGroup) {
    setActiveGroupId(group.id);
    setPreviewId(null);
    setAnnouncement(`${group.title}: তিনটি অপশন খোলা হয়েছে।`);
    centerRef.current?.focus({ preventScroll: true });
  }

  function goHome() {
    setActiveGroupId(null);
    setPreviewId(null);
    setAnnouncement("মূল মেনুতে ফিরে এসেছেন।");
    centerRef.current?.focus({ preventScroll: true });
  }

  function toggleGroup(group: MenuGroup) {
    if (activeGroupId === group.id) {
      goHome();
    } else {
      openGroup(group);
    }
  }

  function createSpark(event: ReactPointerEvent<HTMLElement>) {
    if (reducedMotion || !event.isPrimary || event.button !== 0) return;

    const target = event.target as HTMLElement;
    const element = target.closest<HTMLElement>("[data-accent]");
    const color = element?.dataset.accent ?? accent;
    const id = ++burstId.current;

    setBursts((previous) => [
      ...previous.slice(-2),
      { id, x: event.clientX, y: event.clientY, color },
    ]);

    const timer = setTimeout(() => {
      setBursts((previous) => previous.filter((burst) => burst.id !== id));
      timers.current.delete(timer);
    }, 720);

    timers.current.add(timer);
  }

  function followPointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();

    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MOBILE_STYLES }} />

      <main
        className={`fcl-universe ${isDark ? "fu-dark" : "fu-light"} ${
          ready ? "" : "fu-hidden"
        }`}
        style={{ "--fu-accent": accent } as CSSVars}
        onPointerDown={createSpark}
      >
        <div className="fu-background" aria-hidden="true">
          <div className="fu-grid" />
          <div className="fu-glow fu-glow-a" />
          <div className="fu-glow fu-glow-b" />
          <div className="fu-square fu-square-a" />
          <div className="fu-square fu-square-b" />
        </div>

        <div className="fu-shell">
          {/* ================================================================
              HERO — MOBILE (হালকা: ১ম কোডের চিপ সিস্টেম, কোনো JS টাইমার নেই)
          ================================================================ */}
          <section className="fh-hero fh-mob" aria-label="FCL hero">
            <div className="fh-badge">
              <span className="fh-live" />
              FCL • DIGITAL GATEWAY HUB
            </div>

            <h2 className="fh-title">
              <span className="fh-line">THE GAME LIVES</span>
              <span className="fh-line">
                <span className="fh-grad">BEYOND THE FIELD.</span>
              </span>
            </h2>

            <div className="fh-mob-art">
              <div className="fh-frame">
                <img
                  src="/fcl-room.png"
                  alt="FCL Online"
                  draggable={false}
                  decoding="async"
                />
              </div>

              <div className="fh-chip fh-chip-1">
                <span className="fh-live" />
                <div>
                  <b>FCL LIVE</b>
                  <small className="fh-c-blue">Phoenix · 14/2</small>
                </div>
              </div>

              <div className="fh-chip fh-chip-2 fh-chip-delay">
                <span className="fh-box fh-box-rose">6</span>
                <div>
                  <b className="fh-c-rose">OUT</b>
                  <small>Ball 1</small>
                </div>
              </div>

              <div className="fh-chip fh-chip-3">
                <span className="fh-box fh-box-blue">4</span>
                <div>
                  <b className="fh-c-blue">+4 RUN</b>
                  <small>Ball 2</small>
                </div>
              </div>

              <div className="fh-chip fh-chip-4 fh-chip-delay fh-chip-col">
                <div className="fh-chip-row">
                  <span>🎯</span>
                  <b className="fh-c-amber">Need 56 off 24</b>
                </div>
                <small>Target 70</small>
              </div>
            </div>

            <div className="fh-mob-actions">
              <button
                type="button"
                className="fh-btn-primary"
                data-accent="#1877F2"
                onClick={scrollToMenu}
              >
                Explore Menu ↓
              </button>
              <Link href="/play" className="fh-btn-play" data-accent="#22c55e">
                <span className="fh-live" />
                🎮 Play
              </Link>
            </div>
          </section>

          {/* ================================================================
              FLOWER MENU (২য় কোডের হুবহু)
          ================================================================ */}
          <section className="fu-dashboard" aria-label="FCL interactive navigation">
            <div className="fu-console" id="fu-menu">
              <div className="fu-console-top">
                <div className="fu-breadcrumb">
                  <button type="button" onClick={goHome}>
                    FCL
                  </button>
                  <span>/</span>
                  <strong>{activeGroup?.title ?? "মূল মেনু"}</strong>
                </div>

                <span className="fu-mode-label">ORBIT MENU</span>
              </div>

              <div className="fu-menu-content">
                <div
                  className="fu-flower"
                  onPointerMove={followPointer}
                  onPointerLeave={() => setPreviewId(null)}
                >
                  <div className="fu-cursor-light" aria-hidden="true" />

                  <div className="fu-orbit fu-orbit-outer" aria-hidden="true" />
                  <div className="fu-orbit fu-orbit-inner" aria-hidden="true" />
                  <div className="fu-orbit-runner" aria-hidden="true">
                    <i />
                  </div>

                  <svg className="fu-connectors" viewBox="0 0 500 500" aria-hidden="true">
                    <path d="M250 250V82 M250 250H418 M250 250V418 M250 250H82" />
                    <circle cx="250" cy="250" r="84" />
                  </svg>

                  <button
                    ref={centerRef}
                    type="button"
                    className={`fu-core ${activeGroup ? "fu-core-open" : ""}`}
                    onClick={goHome}
                    data-accent={accent}
                    aria-label={
                      activeGroup ? "মূল FCL মেনুতে ফিরে এসেছেন।" : "FCL মূল মেনু"
                    }
                  >
                    <span className="fu-core-halo" aria-hidden="true" />
                    <span className="fu-core-inner">
                      {logoError ? (
                        <strong className="fu-logo-fallback">FCL</strong>
                      ) : (
                        <img
                          src="/fcl-logo.png"
                          alt=""
                          width={62}
                          height={62}
                          onError={() => setLogoError(true)}
                          draggable={false}
                        />
                      )}
                      <span>{activeGroup ? "↩ HOME" : "EXPLORE"}</span>
                    </span>
                  </button>

                  <nav
                    key={activeGroup?.id ?? "root"}
                    className="fu-petals"
                    aria-label={
                      activeGroup ? `${activeGroup.title} সাবমেনু` : "FCL ক্যাটেগরি"
                    }
                  >
                    {activeGroup
                      ? activeGroup.items.map((item, index) => (
                          <div
                            key={item.href}
                            className={`fu-petal-position fu-position-${index}`}
                            style={
                              {
                                "--item-color": activeGroup.color,
                                "--delay": `${index * 65}ms`,
                              } as CSSVars
                            }
                          >
                            <Link
                              href={item.href}
                              className="fu-petal fu-leaf"
                              data-accent={activeGroup.color}
                            >
                              <span className="fu-petal-shine" />
                              <span className="fu-petal-icon" aria-hidden="true">
                                {item.icon}
                              </span>
                              <strong>{item.title}</strong>
                              <small>প্রবেশ করুন ↗</small>
                            </Link>
                          </div>
                        ))
                      : MENU_GROUPS.map((group, index) => (
                          <div
                            key={group.id}
                            className={`fu-petal-position fu-position-${index}`}
                            style={
                              {
                                "--item-color": group.color,
                                "--delay": `${index * 65}ms`,
                              } as CSSVars
                            }
                          >
                            <button
                              type="button"
                              className="fu-petal"
                              data-accent={group.color}
                              onClick={() => openGroup(group)}
                              onPointerEnter={() => setPreviewId(group.id)}
                              onFocus={() => setPreviewId(group.id)}
                              onBlur={() => setPreviewId(null)}
                            >
                              <span className="fu-petal-shine" />
                              <span className="fu-petal-icon" aria-hidden="true">
                                {group.icon}
                              </span>
                              <strong>{group.title}</strong>
                              <small>{group.items.length}টি অপশন · খুলুন</small>
                            </button>
                          </div>
                        ))}

                    {activeGroup && (
                      <div
                        className="fu-petal-position fu-position-3"
                        style={
                          {
                            "--item-color": "#94a3b8",
                            "--delay": "195ms",
                          } as CSSVars
                        }
                      >
                        <button
                          type="button"
                          className="fu-petal fu-back-petal"
                          onClick={goHome}
                          data-accent="#94a3b8"
                        >
                          <span className="fu-petal-icon" aria-hidden="true">
                            <ArrowIcon back />
                          </span>
                          <strong>ফিরে যান</strong>
                          <small>মূল মেনু</small>
                        </button>
                      </div>
                    )}
                  </nav>
                </div>
              </div>

              <div className="fu-console-bottom">
                <span className="fu-instruction">
                  <span aria-hidden="true">{activeGroup ? "↗" : "✦"}</span>
                  {activeGroup
                    ? "অপশন বেছে নিন · মাঝখানে ট্যাপ করলে Home"
                    : "পাপড়িতে ট্যাপ করুন · খুলবে নতুন অপশন"}
                </span>
                <span className="fu-step">{activeGroup ? "02 / 02" : "01 / 02"}</span>
              </div>
            </div>

            {/* 📱 মোবাইল ডক — ৪টি ক্যাটেগরি বাটন */}
            <nav className="fu-dock" aria-label="দ্রুত ক্যাটেগরি নেভিগেশন">
              {MENU_GROUPS.map((group) => {
                const isActive = activeGroupId === group.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    className={isActive ? "is-active" : ""}
                    data-accent={group.color}
                    style={{ "--item-color": group.color } as CSSVars}
                    aria-pressed={isActive}
                    onClick={() => toggleGroup(group)}
                  >
                    <span aria-hidden="true">{group.icon}</span>
                    <span>{group.short}</span>
                  </button>
                );
              })}
            </nav>
          </section>

          <footer className="fu-footer">
            <span>
              ONE GAME. ONE COMMUNITY. <b>FCL.</b> © 2026 Facebook Cricket League | আরিফ জিয়াদ | All rights reserved.
            </span>
          </footer>
        </div>

        <div className="fu-sr-only" role="status" aria-live="polite">
          {announcement}
        </div>

        <div className="fu-spark-layer" aria-hidden="true">
          {bursts.map((burst) => (
            <div
              key={burst.id}
              className="fu-burst"
              style={
                {
                  left: burst.x,
                  top: burst.y,
                  "--spark-color": burst.color,
                } as CSSVars
              }
            >
              <span className="fu-spark-ring" />
              {Array.from({ length: 12 }, (_, index) => {
                const angle = (index / 12) * Math.PI * 2;
                const distance = 30 + (index % 3) * 13;

                return (
                  <i
                    key={index}
                    style={
                      {
                        "--dx": `${Math.cos(angle) * distance}px`,
                        "--dy": `${Math.sin(angle) * distance}px`,
                        "--turn": `${index * 30}deg`,
                      } as CSSVars
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

/* ================================================================
   🖥️ DESKTOP VIEW — ৩য় কোডের পিসি ভিউ
   (হিরো ইমেজের উপরের এনিমেশন = ১ম কোডের হালকা চিপ সিস্টেম)
================================================================ */
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

type Cat = "stats" | "stories" | "fun";
type DeskPortal = {
  href: string;
  color: string;
  badgeText: string;
  badgeIcon: string;
  cornerIcon: string;
  title: string;
  description: string;
  footerText: string;
  cat: Cat;
  size?: "xl" | "wide";
  featured?: boolean;
};

const PORTALS: DeskPortal[] = [
  {
    href: "/play",
    color: "#1877F2",
    badgeText: "FCL ONLINE",
    badgeIcon: "🏏",
    cornerIcon: "🎮",
    title: "Play The Game",
    description:
      "Login to FCL Online, join matches and experience the original Facebook Cricket League game.",
    footerText: "Enter FCL Online",
    cat: "fun",
    size: "xl",
    featured: true,
  },
  {
    href: "/rankings",
    color: "#f59e0b",
    badgeText: "LEADERBOARD",
    badgeIcon: "👑",
    cornerIcon: "⭐",
    title: "Rankings & MVP",
    description:
      "Explore all-time player rankings, MVP pinnacle ratings, and elite championship leaderboards.",
    footerText: "Enter Portal",
    cat: "stats",
    size: "wide",
    featured: true,
  },
  {
    href: "/records",
    color: "#3b82f6",
    badgeText: "RECORD CABINET",
    badgeIcon: "🏆",
    cornerIcon: "📜",
    title: "Hall of Fame & Records",
    description:
      "Discover historical benchmarks, most runs, highest wickets, hat-tricks, and legendary milestones.",
    footerText: "Enter Portal",
    cat: "stats",
    featured: true,
  },
  {
    href: "/news",
    color: "#ef4444",
    badgeText: "PAPER NEWS",
    badgeIcon: "📰",
    cornerIcon: "🗞️",
    title: "FCL News Portal",
    description:
      "Read traditional daily newspaper style articles, tournament updates, player spotlights, and community notices.",
    footerText: "Open Newspaper",
    cat: "stories",
  },
  {
    href: "/thrillers",
    color: "#a855f7",
    badgeText: "THRILLER",
    badgeIcon: "⚡",
    cornerIcon: "🔥",
    title: "High Voltage Matches",
    description:
      "Relive the most intense nail-biting matches, thrilling finishes, and heroic tournament victories.",
    footerText: "Explore Matches",
    cat: "stories",
    featured: true,
  },
  {
    href: "/extraordinary",
    color: "#22d3ee",
    badgeText: "HEROICS",
    badgeIcon: "🌟",
    cornerIcon: "💎",
    title: "Extraordinary Performance",
    description:
      "Witness jaw-dropping individual masterclasses, match-winning hat-tricks, and explosive 50+ knocks.",
    footerText: "Explore Masterclasses",
    cat: "stories",
  },
  {
    href: "/matches",
    color: "#22c55e",
    badgeText: "MATCH ARCHIVE",
    badgeIcon: "📅",
    cornerIcon: "🏟️",
    title: "Match Directory & History",
    description:
      "Browse tournament home pages, series games, friendly matches, and test match archives across years.",
    footerText: "Enter Portal",
    cat: "stats",
  },
  {
    href: "/players",
    color: "#38bdf8",
    badgeText: "SQUAD DIRECTORY",
    badgeIcon: "👥",
    cornerIcon: "🏏",
    title: "Players & Stat Cards",
    description:
      "Browse all registered players, examine official player statistics cards, and download PNG cards.",
    footerText: "Enter Portal",
    cat: "stats",
  },
  {
    href: "/memories",
    color: "#f472b6",
    badgeText: "NOSTALGIA",
    badgeIcon: "📖",
    cornerIcon: "🎞️",
    title: "FCL Memories & Adda",
    description:
      "Relive the golden days, funny moments, community stories, and nostalgic photo galleries.",
    footerText: "Enter Portal",
    cat: "stories",
  },
  {
    href: "/birthday",
    color: "#ec4899",
    badgeText: "BIRTHDAY CORNER",
    badgeIcon: "🎂",
    cornerIcon: "🎉",
    title: "Birthday Celebration",
    description:
      "Celebrate FCL stars! View birthday dates, play festive wishes, and download auto-generated greeting cards.",
    footerText: "Enter Corner",
    cat: "fun",
  },
  {
    href: "/gallery",
    color: "#60a5fa",
    badgeText: "MEDIA HUB",
    badgeIcon: "🖼️",
    cornerIcon: "📸",
    title: "Player Photo Gallery",
    description:
      "Browse official player photos, filter by name, and download high-resolution portrait files instantly.",
    footerText: "Explore Gallery",
    cat: "fun",
  },
  {
    href: "/rules",
    color: "#c084fc",
    badgeText: "RULEBOOK",
    badgeIcon: "📜",
    cornerIcon: "⚖️",
    title: "Rules & Match Formats",
    description:
      "Read official tournament guidelines, T20/ODI/Test systems, and power-play regulations.",
    footerText: "Enter Portal",
    cat: "stats",
  },
];

const FILTERS: { id: "all" | Cat; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "✨" },
  { id: "stats", label: "Stats", icon: "📊" },
  { id: "stories", label: "Stories", icon: "📰" },
  { id: "fun", label: "Fun & Media", icon: "🎮" },
];

const ROT_WORDS = [
  { t: "RANKINGS", c: "#f59e0b" },
  { t: "RECORDS", c: "#3b82f6" },
  { t: "MEMORIES", c: "#ec4899" },
  { t: "THRILLERS", c: "#a855f7" },
  { t: "LEGENDS", c: "#22d3ee" },
  { t: "THE GAME", c: "#22c55e" },
];

/* FX canvas — শুধু পিসিতে: স্পার্ক, মাউস অরা, এম্বার */
const FX_COLORS = ["#60a5fa", "#22d3ee", "#f59e0b", "#a855f7", "#f472b6", "#22c55e", "#fde047"];

function FxCanvas({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const darkRef = useRef(isDark);

  useEffect(() => {
    darkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    type Spark = { x: number; y: number; px: number; py: number; vx: number; vy: number; life: number; max: number; size: number; color: string; g: number };
    type Ring = { x: number; y: number; r: number; max: number; life: number; lmax: number; color: string };
    type Ember = { x: number; y: number; vx: number; vy: number; size: number; phase: number; color: string };

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    const sparks: Spark[] = [];
    const rings: Ring[] = [];
    let embers: Ember[] = [];
    const mouse = { x: -999, y: -999, tx: -999, ty: -999, lx: 0, ly: 0, on: false };

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = () => FX_COLORS[(Math.random() * FX_COLORS.length) | 0];

    const makeEmbers = () => {
      const n = w < 640 ? 14 : 30;
      embers = Array.from({ length: n }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.15, 0.15),
        vy: -rand(0.12, 0.45),
        size: rand(1, 2.6),
        phase: rand(0, 6.28),
        color: pick(),
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (embers.length !== (w < 640 ? 14 : 30)) makeEmbers();
    };

    const burst = (x: number, y: number, color?: string) => {
      const n = w < 640 ? 22 : 32;
      for (let k = 0; k < n; k++) {
        if (sparks.length > 450) break;
        const a = Math.random() * Math.PI * 2;
        const s = rand(1.5, 7.5);
        sparks.push({
          x, y, px: x, py: y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 1.2,
          life: 0,
          max: rand(34, 70),
          size: rand(1.4, 3.2),
          color: color && Math.random() < 0.7 ? color : pick(),
          g: 0.14,
        });
      }
      rings.push({ x, y, r: 6, max: 74, life: 0, lmax: 34, color: color ?? "#60a5fa" });
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      ctx.clearRect(0, 0, w, h);
      const dark = darkRef.current;
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      ctx.lineCap = "round";

      if (mouse.on) {
        const k = 1 - Math.pow(0.86, dt);
        mouse.x += (mouse.tx - mouse.x) * k;
        mouse.y += (mouse.ty - mouse.y) * k;
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 170);
        g.addColorStop(0, dark ? "rgba(56,139,253,0.16)" : "rgba(24,119,242,0.10)");
        g.addColorStop(1, "rgba(24,119,242,0)");
        ctx.fillStyle = g;
        ctx.fillRect(mouse.x - 170, mouse.y - 170, 340, 340);
      }

      for (const e of embers) {
        e.x += (e.vx + Math.sin(e.phase) * 0.18) * dt;
        e.y += e.vy * dt;
        e.phase += 0.02 * dt;
        if (e.y < -10) {
          e.y = h + 10;
          e.x = rand(0, w);
        }
        if (e.x < -10) e.x = w + 10;
        if (e.x > w + 10) e.x = -10;
        ctx.globalAlpha = (dark ? 0.16 : 0.22) + 0.28 * ((Math.sin(e.phase * 3) + 1) / 2);
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, 6.283);
        ctx.fill();
      }

      for (let k = rings.length - 1; k >= 0; k--) {
        const r = rings[k];
        r.life += dt;
        r.r += (r.max - r.r) * 0.12 * dt;
        const a = 1 - r.life / r.lmax;
        if (a <= 0) {
          rings.splice(k, 1);
          continue;
        }
        ctx.globalAlpha = a * 0.8;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, 6.283);
        ctx.stroke();
      }

      for (let k = sparks.length - 1; k >= 0; k--) {
        const s = sparks[k];
        s.life += dt;
        if (s.life >= s.max) {
          sparks.splice(k, 1);
          continue;
        }
        s.px = s.x;
        s.py = s.y;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += s.g * dt;
        const f = Math.pow(0.97, dt);
        s.vx *= f;
        s.vy *= f;
        ctx.globalAlpha = 1 - s.life / s.max;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(s.x + 0.01, s.y + 0.01);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const el = t && t.closest ? t.closest("[data-spark]") : null;
      burst(e.clientX, e.clientY, el?.getAttribute("data-spark") ?? undefined);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      if (!mouse.on) {
        mouse.on = true;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.lx = e.clientX;
        mouse.ly = e.clientY;
      }
      const dx = e.clientX - mouse.lx;
      const dy = e.clientY - mouse.ly;
      if (dx * dx + dy * dy > 180 && sparks.length < 450) {
        mouse.lx = e.clientX;
        mouse.ly = e.clientY;
        sparks.push({
          x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY,
          vx: rand(-0.6, 0.6), vy: rand(-0.6, 0.6),
          life: 0, max: rand(16, 28), size: rand(1, 2), color: pick(), g: 0.02,
        });
      }
    };

    const onLeave = () => {
      mouse.on = false;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[45]" />;
}

function ScrollBar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const d = document.documentElement;
        const max = d.scrollHeight - d.clientHeight;
        const p = max > 0 ? d.scrollTop / max : 0;
        if (ref.current) ref.current.style.transform = `scaleX(${p})`;
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[44] h-[3px]">
      <div
        ref={ref}
        className="h-full origin-left bg-gradient-to-r from-[#1877F2] via-[#22d3ee] to-[#a855f7]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/** স্পার্ক বার্স্ট একটু দেখিয়ে তারপর নেভিগেট করে */
function SparkLink({
  href,
  children,
  ...rest
}: { href: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const router = useRouter();
  const onClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    rest.onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (rest.target === "_blank") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    window.setTimeout(() => router.push(href), 260);
  };
  return (
    <Link {...rest} href={href} onClick={onClick}>
      {children}
    </Link>
  );
}

function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: "transform .25s cubic-bezier(.2,.8,.2,1)" }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </div>
  );
}

function Words({ text, base = 0, className = "" }: { text: string; base?: number; className?: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className={`fcl-wd ${className}`} style={{ "--i": base + i } as CSSVars}>
          {w}
          {"\u00A0"}
        </span>
      ))}
    </>
  );
}

function Rotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ROT_WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);
  const w = ROT_WORDS[i];
  return (
    <div className="mt-4 flex items-center gap-2 text-xl font-black">
      <span className="fcl-body font-bold">Dive into</span>
      <span className="fcl-rot" style={{ color: w.c }}>
        <span key={i} className="fcl-rot-w">
          {w.t}
        </span>
      </span>
    </div>
  );
}

function FilterChips({
  value,
  onChange,
  counts,
}: {
  value: "all" | Cat;
  onChange: (v: "all" | Cat) => void;
  counts: Record<string, number>;
}) {
  return (
    <div className="no-sb flex gap-2 overflow-x-auto">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={`fchip ${value === f.id ? "on" : ""}`}
        >
          <span>{f.icon}</span>
          {f.label}
          <b>{counts[f.id]}</b>
        </button>
      ))}
    </div>
  );
}

/* হিরো ইমেজ + ১ম কোডের হালকা ফ্লোটিং চিপ (কোনো সিমুলেশন/টাইমার নেই) */
function HeroArt() {
  return (
    <div className="relative h-[480px] w-full lg:h-[550px]">
      <div className="fcl-frame absolute inset-0 flex items-center justify-center overflow-hidden rounded-[3rem] p-4">
        <img
          src="/fcl-room.png"
          alt="FCL Room"
          className="h-full w-full object-contain object-center"
          decoding="async"
        />
      </div>

      <div className="fcl-chip fcl-pill fcl-pill-line absolute -left-6 top-10 flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 backdrop-blur-xl">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#22c55e]" />
        <div>
          <span className="fcl-head block text-xs font-bold">FCL LIVE</span>
          <span className="fcl-blue1 text-[10px]">Team Phoenix · 14/2</span>
        </div>
      </div>

      <div className="fcl-chip fcl-chip-delay fcl-pill absolute -right-4 top-36 flex items-center gap-2 rounded-2xl border border-rose-500/40 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-xs font-black text-white">6</div>
        <div>
          <span className="fcl-rose block text-xs font-black tracking-wider">OUT</span>
          <span className="fcl-pill-sub text-[10px]">Ball 1</span>
        </div>
      </div>

      <div className="fcl-chip fcl-pill absolute -left-6 bottom-20 flex items-center gap-2 rounded-2xl border border-blue-500/40 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1877F2] text-xs font-black text-white">4</div>
        <div>
          <span className="fcl-blue2 block text-xs font-bold">+4 RUN</span>
          <span className="fcl-pill-sub text-[10px]">Ball 2</span>
        </div>
      </div>

      <div className="fcl-chip fcl-chip-delay fcl-pill absolute -right-4 bottom-8 flex flex-col gap-0.5 rounded-2xl border border-amber-500/40 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🎯</span>
          <span className="fcl-amber text-xs font-bold">Need 56 off 24</span>
        </div>
        <span className="fcl-pill-sub text-[11px] font-semibold">Target 70</span>
      </div>
    </div>
  );
}

function PortalCard({ p, index, forceStd }: { p: DeskPortal; index: number; forceStd: boolean }) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.08);
  const size = forceStd ? "std" : p.size ?? "std";

  const span = size === "xl" ? "sm:col-span-2 sm:row-span-2" : size === "wide" ? "sm:col-span-2" : "";

  const onMove = (e: ReactPointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const t = size === "xl" ? 4 : 7;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.setProperty("--rx", `${(y / r.height - 0.5) * -t}deg`);
    el.style.setProperty("--ry", `${(x / r.width - 0.5) * t}deg`);
  };
  const onLeave = (e: ReactPointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      className={`${span} transition-all duration-700 ease-out`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(.97)",
        transitionDelay: `${Math.min(index, 8) * 70}ms`,
      }}
    >
      <SparkLink
        href={p.href}
        data-spark={p.color}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={`pc ${size === "xl" ? "pc-xl" : ""} ${size === "wide" ? "pc-wide" : ""}`}
        style={{ "--c": p.color } as CSSVars}
      >
        {size === "xl" && (
          <div className="pc-orbit" aria-hidden>
            <i />
          </div>
        )}
        <span className="pc-water" aria-hidden>
          {p.cornerIcon}
        </span>

        <div className="pc-body">
          <div className="flex items-start justify-between gap-2">
            <span className="pc-ico">{p.badgeIcon}</span>
            <span className="pc-badge fcl-ink">{p.badgeText}</span>
          </div>

          <div className="mt-auto pt-5">
            {size === "xl" && (
              <span className="pc-online fcl-ink">
                <span className="fcl-live h-2 w-2 rounded-full bg-[#22c55e]" /> ONLINE NOW
              </span>
            )}
            <h4
              className={`fcl-head font-black leading-tight ${
                size === "xl" ? "mt-3 text-4xl" : size === "wide" ? "text-2xl" : "text-xl"
              }`}
            >
              {p.title}
            </h4>
            <p
              className={`fcl-body mt-1.5 leading-5 ${
                size === "std" ? "line-clamp-2 text-[13px]" : "max-w-[460px] text-sm"
              }`}
            >
              {p.description}
            </p>

            {size === "xl" ? (
              <span className="pc-cta">
                <span className="pc-cta-shine" />
                <span className="relative">{p.footerText}</span>
                <span className="pc-arrow relative">→</span>
              </span>
            ) : (
              <div className="fcl-ink mt-3 flex items-center justify-between text-xs font-bold">
                <span>{p.footerText}</span>
                <span className="pc-arrow text-base font-black">→</span>
              </div>
            )}
          </div>
        </div>
      </SparkLink>
    </div>
  );
}

function DesktopHome({ isDark, ready }: { isDark: boolean; ready: boolean }) {
  const [filter, setFilter] = useState<"all" | Cat>("all");
  const sectionHead = useReveal<HTMLDivElement>(0.2);

  const list = filter === "all" ? PORTALS : PORTALS.filter((p) => p.cat === filter);
  const counts: Record<string, number> = {
    all: PORTALS.length,
    stats: PORTALS.filter((p) => p.cat === "stats").length,
    stories: PORTALS.filter((p) => p.cat === "stories").length,
    fun: PORTALS.filter((p) => p.cat === "fun").length,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DESKTOP_STYLES }} />
      {ready && <FxCanvas isDark={isDark} />}
      {ready && <ScrollBar />}

      <main
        className={`fcl-root ${isDark ? "fcl-dark" : "fcl-light"} min-h-screen font-sans selection:bg-[#1877F2]/30 ${
          ready ? "block" : "hidden"
        }`}
      >
        {/* ================= DESKTOP HERO ================= */}
        <section
          className="fcl-hero relative overflow-hidden border-b"
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
            e.currentTarget.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
          }}
        >
          <div className="absolute inset-0 fcl-grid-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(37,99,235,0.12),transparent_34%)]" />
          <div className="par-a absolute right-[-15%] top-[-20%]">
            <div className="fcl-orb-a h-[650px] w-[650px] rounded-full bg-[#7c3aed]/10 blur-[130px]" />
          </div>
          <div className="par-b absolute bottom-[-20%] left-[-20%]">
            <div className="fcl-orb-b h-[500px] w-[500px] rounded-full bg-[#1877F2]/10 blur-[130px]" />
          </div>
          <div className="sq sq-1" />
          <div className="sq sq-2" />
          <div className="sq sq-3" />

          <div className="relative mx-auto flex max-w-[1500px] items-center px-6 lg:min-h-[640px]">
            <div className="grid w-full items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
              <div className="relative z-30 text-center lg:text-left">
                <div
                  className="fcl-wd mb-6 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-4 py-2 backdrop-blur-xl"
                  style={{ "--i": 0 } as CSSVars}
                >
                  <span className="fcl-live h-2 w-2 rounded-full bg-[#22c55e]" />
                  <span className="fcl-blue1 text-[10px] font-bold uppercase tracking-[0.3em]">
                    FCL • DIGITAL GATEWAY HUB
                  </span>
                </div>

                <h2 className="fcl-head text-5xl font-black leading-[0.95] tracking-[-0.05em] md:text-6xl lg:text-[70px]">
                  <span className="block">
                    <Words text="THE GAME LIVES" base={1} />
                  </span>
                  <span className="block">
                    <Words text="BEYOND THE FIELD." base={4} className="fcl-grad" />
                  </span>
                  <span className="fcl-amber mt-3 block text-[0.4em] font-bold leading-tight tracking-[-0.02em]">
                    One Game. One Community.{" "}
                    <span className="fcl-zoom-text text-[1.45em] font-black tracking-[-0.04em]">FCL.</span>
                  </span>
                </h2>

                <div className="flex justify-center lg:justify-start">
                  <Rotator />
                </div>

                <p className="fcl-body mx-auto mt-4 max-w-[520px] text-sm leading-7 lg:mx-0">
                  The official portal of Facebook Cricket League — rankings, record cabinets, memories and high-voltage
                  match stories, all in one place.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <Magnetic>
                    <a
                      href="#gateways"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("gateways")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="btn-primary"
                    >
                      <span className="btn-shine" />
                      <span className="relative">Explore Portals ↓</span>
                    </a>
                  </Magnetic>
                  <Magnetic>
                    <SparkLink href="/play" data-spark="#22c55e" className="btn-play">
                      <span className="fcl-live h-2 w-2 rounded-full bg-[#22c55e]" />
                      🎮 Play Now
                    </SparkLink>
                  </Magnetic>
                  <Magnetic>
                    <SparkLink href="/bn" data-spark="#3b82f6" className="btn-ghost">
                      💙 বাংলা ভার্সন
                    </SparkLink>
                  </Magnetic>
                </div>
              </div>

              <HeroArt />
            </div>
          </div>

          {/* marquee */}
          <div className="relative border-t py-3" style={{ borderColor: "var(--line)" }}>
            <div className="mq">
              <div className="mq-track">
                {[0, 1].map((copy) =>
                  PORTALS.map((p) => (
                    <SparkLink
                      key={`${copy}-${p.href}`}
                      href={p.href}
                      data-spark={p.color}
                      className="mq-item"
                      style={{ "--c": p.color } as CSSVars}
                      tabIndex={copy ? -1 : 0}
                      aria-hidden={copy ? true : undefined}
                    >
                      <span>{p.badgeIcon}</span>
                      {p.title}
                    </SparkLink>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= DESKTOP PORTALS (bento) ================= */}
        <section id="gateways" className="fcl-section relative scroll-mt-20 overflow-hidden px-6 py-14">
          <div className="absolute inset-0 fcl-grid-bg opacity-60" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[150px]" />
          <div className="relative z-10 mx-auto max-w-7xl">
            <div
              ref={sectionHead.ref}
              style={{
                opacity: sectionHead.visible ? 1 : 0,
                transform: sectionHead.visible ? "translateY(0)" : "translateY(24px)",
              }}
              className="mb-7 flex flex-wrap items-end justify-between gap-4 transition-all duration-700 ease-out"
            >
              <div>
                <span className="fcl-eyebrow text-[11px] font-bold uppercase tracking-[0.35em]">
                  FCL Navigation Portals
                </span>
                <h3 className="fcl-head mt-2 text-3xl font-black tracking-tight sm:text-4xl">Choose Your Destination</h3>
              </div>
              <FilterChips value={filter} onChange={setFilter} counts={counts} />
            </div>

            <div
              key={filter}
              className="grid auto-rows-[minmax(190px,auto)] grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {list.map((p, i) => (
                <PortalCard key={p.href} p={p} index={i} forceStd={filter !== "all"} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

/* ================================================================
   PAGE ROOT
================================================================ */
export default function Home() {
  const isDark = useIsDark();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const [phase, setPhase] = useState<"check" | "loading" | "done">("check");
  const ready = phase === "done";

  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem("fcl_visited");
    } catch {}
    setPhase(seen ? "done" : "loading");
  }, []);

  const handlePreloadFinish = useCallback(() => {
    try {
      sessionStorage.setItem("fcl_visited", "true");
    } catch {}
    setPhase("done");
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRELOADER_STYLES }} />

      {phase === "check" && (
        <div className={`pl-root ${isDark ? "pl-dark" : "pl-light"}`} aria-hidden="true" />
      )}
      {phase === "loading" && <Preloader onFinish={handlePreloadFinish} isDark={isDark} />}

      {isMobile === null ? null : isMobile ? (
        <MobileHome isDark={isDark} reducedMotion={reducedMotion} ready={ready} />
      ) : (
        <DesktopHome isDark={isDark} ready={ready} />
      )}
    </>
  );
}

/* ================================================================
   STYLES — PRELOADER (২য় কোডের হুবহু)
================================================================ */
const PRELOADER_STYLES = `
.pl-root {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #020617;
  color: #fff;
  cursor: pointer;
  opacity: 1;
  transition: opacity .5s ease;
  -webkit-tap-highlight-color: transparent;
}
.pl-root.pl-light { background: #f8fafc; color: #0f172a; }
.pl-root.is-out { opacity: 0; pointer-events: none; }
.pl-root *, .pl-root *::before, .pl-root *::after { box-sizing: border-box; }

.pl-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(148, 163, 184, .07) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148, 163, 184, .07) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(circle at center, #000 20%, transparent 70%);
  mask-image: radial-gradient(circle at center, #000 20%, transparent 70%);
}
.pl-light .pl-grid {
  background-image:
    linear-gradient(to right, rgba(100, 116, 139, .12) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(100, 116, 139, .12) 1px, transparent 1px);
}
.pl-glow { position: absolute; border-radius: 50%; pointer-events: none; }
.pl-glow-a { width: 288px; height: 288px; background: rgba(37, 99, 235, .25); filter: blur(110px); }
.pl-glow-b { width: 208px; height: 208px; right: -40px; top: 40px; background: rgba(147, 51, 234, .2); filter: blur(100px); }
.pl-light .pl-glow-a { background: rgba(96, 165, 250, .3); }
.pl-light .pl-glow-b { background: rgba(167, 139, 250, .25); }

.pl-center { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; padding: 0 16px; text-align: center; }
.pl-logo-wrap { position: relative; display: flex; align-items: center; justify-content: center; width: 112px; height: 112px; }
.pl-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, #1877f2, #22d3ee, #f59e0b, transparent);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  animation: fu-spin 1.6s linear infinite;
}
.pl-orbit { position: absolute; inset: -24px; animation: fu-spin 2.4s linear infinite; }
.pl-orbit i { position: absolute; top: -4px; left: 50%; width: 9px; height: 9px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 14px #f59e0b; }
.pl-disc {
  display: flex; align-items: center; justify-content: center;
  width: 96px; height: 96px; border-radius: 50%;
  border: 1px solid rgba(59, 130, 246, .3);
  background: #0b1220;
  box-shadow: 0 0 40px rgba(37, 99, 235, .45);
}
.pl-light .pl-disc { background: #ffffff; border-color: rgba(59, 130, 246, .35); box-shadow: 0 0 30px rgba(37, 99, 235, .22); }
.pl-logo { width: 64px; height: 64px; object-fit: contain; filter: drop-shadow(0 0 12px rgba(255, 255, 255, .6)); animation: pl-logo-float 2.2s ease-in-out infinite; }
.pl-light .pl-logo { filter: drop-shadow(0 4px 10px rgba(37, 99, 235, .3)); }
.pl-fallback { font-size: 28px; font-style: italic; color: #3b82f6; }
.pl-title { display: flex; margin: 32px 0 0; font-size: 24px; font-weight: 900; letter-spacing: .2em; color: #fff; }
.pl-light .pl-title { color: #0f172a; }
.pl-letter { display: inline-block; opacity: 0; animation: pl-letter .5s ease-out both; animation-delay: calc(var(--i, 0) * 70ms + 200ms); }
.pl-letter.is-amber { color: #f59e0b; }
.pl-sub { margin: 4px 0 0; font-size: 11px; font-weight: 600; letter-spacing: .14em; color: #94a3b8; }
.pl-light .pl-sub { color: #64748b; }
.pl-bar { width: 208px; height: 6px; margin-top: 24px; overflow: hidden; border-radius: 999px; background: #1e293b; }
.pl-light .pl-bar { background: #e2e8f0; }
.pl-bar > div { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #3b82f6, #34d399, #fbbf24); }
.pl-pct { margin-top: 8px; font-size: 12px; font-weight: 900; font-variant-numeric: tabular-nums; color: #cbd5e1; }
.pl-light .pl-pct { color: #475569; }
.pl-skip { margin-top: 16px; font-size: 10px; font-weight: 600; color: #475569; }
.pl-light .pl-skip { color: #94a3b8; }

@keyframes fu-spin { to { transform: rotate(360deg); } }
@keyframes pl-letter { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes pl-logo-float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-5px) scale(1.06); } }

@media (max-width: 760px) {
  .pl-title { font-size: 21px; }
}

@media (prefers-reduced-motion: reduce) {
  .pl-root *, .pl-root *::before, .pl-root *::after {
    animation: none !important;
    transition: none !important;
  }
  .pl-letter { opacity: 1 !important; }
}
`;

/* ================================================================
   STYLES — MOBILE (২য় কোডের ফুলের মেনু + হালকা হিরো)
================================================================ */
const MOBILE_STYLES = `
.fcl-universe.fu-hidden { display: none; }

.fcl-universe {
  --site-nav-h: 76px;
  --fu-bg: #f4f7fc;
  --fu-text: #14213b;
  --fu-muted: #64748b;
  --fu-line: rgba(51, 65, 85, .12);
  --fu-panel: rgba(255, 255, 255, .7);
  --fu-petal: #ffffff;
  --fu-core: #ffffff;
  --fu-field: rgba(255, 255, 255, .86);
  --fu-shadow: 0 18px 50px -25px rgba(30, 58, 138, .24);
  --fu-grid: rgba(30, 64, 175, .055);
  --fu-accent: #60a5fa;
  --fu-blue: #1d4ed8;
  --fu-amber: #b45309;
  --fu-rose: #e11d48;
  --fu-pill: rgba(255, 255, 255, .96);
  --fu-frame: #ffffff;

  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--fu-bg);
  color: var(--fu-text);
  font-family: inherit;
  transition: background .3s, color .3s;
  -webkit-tap-highlight-color: transparent;
}

.fcl-universe.fu-dark {
  --fu-bg: #050914;
  --fu-text: #f1f5ff;
  --fu-muted: #94a3bd;
  --fu-line: rgba(148, 163, 184, .15);
  --fu-panel: rgba(10, 18, 34, .66);
  --fu-petal: #101b30;
  --fu-core: #0b1426;
  --fu-field: rgba(9, 17, 32, .9);
  --fu-shadow: 0 25px 65px -25px rgba(0, 0, 0, .65);
  --fu-grid: rgba(148, 163, 184, .045);
  --fu-blue: #93c5fd;
  --fu-amber: #f59e0b;
  --fu-rose: #fb7185;
  --fu-pill: rgba(11, 18, 32, .94);
  --fu-frame: #080d17;
}

.fcl-universe *, .fcl-universe *::before, .fcl-universe *::after { box-sizing: border-box; }
.fcl-universe button, .fcl-universe input { font: inherit; }
.fcl-universe button, .fcl-universe a { touch-action: manipulation; }
.fcl-universe button { cursor: pointer; }
.fcl-universe a { text-decoration: none; color: inherit; }

.fcl-universe button:focus-visible,
.fcl-universe a:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 4px;
}

.fu-background { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: -1; }

.fu-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--fu-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--fu-grid) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse at center, black, transparent 80%);
}

.fu-glow { position: absolute; width: 400px; height: 400px; border-radius: 50%; filter: blur(100px); opacity: .12; }
.fu-glow-a { background: #2563eb; top: -140px; left: 10%; }
.fu-glow-b { background: #9333ea; bottom: -200px; right: 5%; }

.fu-square {
  position: absolute;
  border: 1px solid rgba(96, 165, 250, .2);
  border-radius: 27%;
  background: linear-gradient(135deg, #3b82f633, #a855f71a);
  filter: blur(8px);
  animation: fu-float 13s ease-in-out infinite;
}
.fu-square-a { width: 80px; height: 80px; top: 18%; left: -20px; --rotation: 20deg; }
.fu-square-b { width: 100px; height: 100px; right: -30px; bottom: 10%; --rotation: -22deg; animation-delay: -5s; }

.fu-shell {
  width: min(1220px, 100%);
  max-width: 460px;
  margin: 0 auto;
  padding: calc(64px + 12px) 12px max(12px, env(safe-area-inset-bottom));
}

/* ================================================================
   HERO — হালকা (কোনো JS টাইমার/ভারী এনিমেশন নেই)
================================================================ */
.fh-hero { position: relative; margin-bottom: 14px; }

.fh-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 11px;
  border: 1px solid #1877f24d;
  border-radius: 999px;
  background: #1877f21a;
  color: var(--fu-blue);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .2em;
}

.fh-title {
  margin: 12px 0 0;
  font-size: 30px;
  line-height: .98;
  letter-spacing: -.045em;
  font-weight: 950;
  color: var(--fu-text);
}
.fh-line { display: block; }
.fh-grad {
  display: inline-block;
  background: linear-gradient(90deg, #2563eb, #1877f2, #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.fh-live {
  display: inline-block;
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 10px rgba(34, 197, 94, .7);
  animation: fh-pulse 1.6s ease-in-out infinite;
}

.fh-mob-art { position: relative; margin-top: 14px; }

.fh-frame {
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid var(--fu-line);
  background: var(--fu-frame);
  box-shadow: 0 18px 40px -22px rgba(15, 23, 42, .3);
}
.fh-frame img { display: block; width: 100%; height: 175px; object-fit: cover; object-position: center; }

/* ১ম কোডের ফ্লোটিং চিপ */
.fh-chip {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border: 1px solid var(--fu-line);
  border-radius: 12px;
  background: var(--fu-pill);
  box-shadow: 0 8px 20px rgba(15, 23, 42, .16);
  animation: fh-chip-float 5s ease-in-out infinite;
  will-change: transform;
}
.fh-chip-delay { animation-delay: 1.4s; }
.fh-chip-1 { left: -4px; top: 14px; }
.fh-chip-2 { right: -4px; top: 48px; border-color: rgba(244, 63, 94, .4); }
.fh-chip-3 { left: -4px; bottom: 46px; border-color: rgba(59, 130, 246, .4); }
.fh-chip-4 { right: -4px; bottom: 12px; border-color: rgba(245, 158, 11, .4); }
.fh-chip-col { flex-direction: column; align-items: flex-start; gap: 2px; }
.fh-chip-row { display: flex; align-items: center; gap: 4px; font-size: 11px; }
.fh-chip b { display: block; font-size: 9px; font-weight: 800; line-height: 1.1; color: var(--fu-text); }
.fh-chip small { display: block; font-size: 8px; line-height: 1.2; color: var(--fu-muted); }
.fh-chip .fh-c-blue { color: var(--fu-blue); }
.fh-chip b.fh-c-blue { color: var(--fu-blue); }
.fh-chip b.fh-c-rose { color: var(--fu-rose); letter-spacing: .06em; }
.fh-chip b.fh-c-amber { color: var(--fu-amber); }
.fh-box {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  color: #fff;
  font-size: 10px;
  font-weight: 900;
}
.fh-box-rose { background: #f43f5e; }
.fh-box-blue { background: #1877f2; }

.fh-mob-actions { display: grid; grid-template-columns: 1.4fr 1fr; gap: 9px; margin-top: 12px; }

.fh-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 10px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #1877f2, #5b5bf0);
  color: #fff !important;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 14px 40px -10px rgba(24, 119, 242, .6);
  transition: transform .2s;
}
.fh-btn-play {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 10px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 800;
  border: 1px solid rgba(34, 197, 94, .45);
  background: rgba(34, 197, 94, .1);
  color: var(--fu-text);
  transition: transform .2s;
}
.fh-btn-primary:active, .fh-btn-play:active { transform: scale(.96); }

/* ================================================================
   FLOWER MENU (২য় কোডের হুবহু)
================================================================ */
.fu-dashboard { display: block; scroll-margin-top: calc(64px + 4px); }

.fu-console {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--fu-line);
  border-radius: 24px;
  background: var(--fu-panel);
  box-shadow: var(--fu-shadow);
  backdrop-filter: blur(18px);
}

.fu-console-top, .fu-console-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.fu-console-top { padding: 12px 13px; border-bottom: 1px solid var(--fu-line); }
.fu-console-bottom { padding: 10px 12px; border-top: 1px solid var(--fu-line); }

.fu-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 10px; min-width: 0; }
.fu-breadcrumb button { border: 0; padding: 2px 0; background: transparent; color: var(--fu-muted); font-size: 11px; font-weight: 850; }
.fu-breadcrumb > span { color: var(--fu-muted); opacity: .5; }
.fu-breadcrumb strong { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-weight: 750; }

.fu-mode-label { color: var(--fu-muted); font-size: 6px; font-weight: 850; letter-spacing: .12em; white-space: nowrap; }

.fu-menu-content { width: 100%; aspect-ratio: 1; position: relative; }

.fu-flower { --pointer-x: 50%; --pointer-y: 50%; position: relative; width: 100%; height: 100%; isolation: isolate; }

.fu-cursor-light {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(170px circle at var(--pointer-x) var(--pointer-y), color-mix(in srgb, var(--fu-accent) 10%, transparent), transparent 75%);
  pointer-events: none;
}

.fu-orbit { position: absolute; border-radius: 50%; pointer-events: none; }
.fu-orbit-outer { inset: 9%; border: 1px dashed var(--fu-line); animation: fu-spin 90s linear infinite; }
.fu-orbit-inner { inset: 28%; border: 1px solid var(--fu-line); box-shadow: 0 0 35px color-mix(in srgb, var(--fu-accent) 6%, transparent); }
.fu-orbit-runner { position: absolute; inset: 9%; border-radius: 50%; animation: fu-spin 17s linear infinite; pointer-events: none; }
.fu-orbit-runner i {
  position: absolute; left: 50%; top: -3px; width: 6px; height: 6px; border-radius: 50%;
  background: var(--fu-accent); box-shadow: 0 0 12px var(--fu-accent);
}

.fu-connectors { position: absolute; inset: 0; width: 100%; height: 100%; fill: none; stroke: var(--fu-accent); stroke-width: 1; opacity: .2; pointer-events: none; }
.fu-connectors path { stroke-dasharray: 4 9; animation: fu-flow 6s linear infinite; }
.fu-connectors circle { opacity: .35; }

.fu-core {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 23%;
  aspect-ratio: 1;
  z-index: 4;
  padding: 4px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--fu-accent) 48%, transparent);
  background: var(--fu-core);
  color: var(--fu-text);
  box-shadow:
    0 0 0 8px color-mix(in srgb, var(--fu-accent) 5%, transparent),
    0 0 45px color-mix(in srgb, var(--fu-accent) 16%, transparent);
  transition: box-shadow .3s, border-color .3s;
}
.fu-core:hover {
  box-shadow:
    0 0 0 11px color-mix(in srgb, var(--fu-accent) 8%, transparent),
    0 0 50px color-mix(in srgb, var(--fu-accent) 25%, transparent);
}
.fu-core:active { transform: translate(-50%, -50%) scale(.94); }

.fu-core-halo {
  position: absolute; inset: -4px; border: 2px solid transparent;
  border-top-color: var(--fu-accent);
  border-bottom-color: color-mix(in srgb, var(--fu-accent) 35%, transparent);
  border-radius: 50%;
  animation: fu-spin 9s linear infinite;
}
.fu-core-inner { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 2px; }
.fu-core img { display: block; width: 57%; height: auto; aspect-ratio: 1; object-fit: contain; filter: drop-shadow(0 3px 9px #3b82f635); }
.fu-core-inner > span { font-size: 6px; font-weight: 900; letter-spacing: .15em; color: var(--fu-muted); }
.fu-logo-fallback { font-size: 22px; font-style: italic; color: #3b82f6; }

.fu-petals { position: absolute; inset: 0; pointer-events: none; }
.fu-petal-position { position: absolute; width: 28%; height: 23%; transform: translate(-50%, -50%); pointer-events: auto; z-index: 2; }
.fu-position-0 { left: 50%; top: 17%; }
.fu-position-1 { left: 83%; top: 50%; }
.fu-position-2 { left: 50%; top: 83%; }
.fu-position-3 { left: 17%; top: 50%; }

.fu-petal {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  padding: 7px 3px;
  border: 1px solid color-mix(in srgb, var(--item-color) 38%, var(--fu-line));
  background: linear-gradient(145deg, color-mix(in srgb, var(--item-color) 13%, var(--fu-petal)), var(--fu-petal));
  color: var(--fu-text);
  box-shadow:
    0 12px 25px -17px color-mix(in srgb, var(--item-color) 70%, transparent),
    inset 0 1px 0 rgba(255,255,255,.08);
  animation: fu-bloom .6s cubic-bezier(.2,.85,.2,1) both;
  animation-delay: var(--delay);
  transition: border-color .2s, box-shadow .2s, filter .2s;
}
.fu-position-0 .fu-petal { border-radius: 35% 35% 28% 28%; --from-x: 0px; --from-y: 65px; }
.fu-position-1 .fu-petal { border-radius: 28% 38% 38% 28%; --from-x: -65px; --from-y: 0px; }
.fu-position-2 .fu-petal { border-radius: 28% 28% 35% 35%; --from-x: 0px; --from-y: -65px; }
.fu-position-3 .fu-petal { border-radius: 38% 28% 28% 38%; --from-x: 65px; --from-y: 0px; }

.fu-petal-icon {
  display: grid; place-items: center;
  font-size: clamp(23px, 6.3vw, 28px);
  line-height: 1;
  transition: transform .3s cubic-bezier(.2,1.5,.4,1);
}
.fu-petal strong { position: relative; font-size: clamp(10px, 3vw, 12px); font-weight: 850; line-height: 1.35; text-align: center; }
.fu-petal small { position: relative; font-size: 7px; font-weight: 650; color: var(--fu-muted); }

.fu-petal-shine {
  position: absolute; width: 45%; height: 180%; top: -40%; left: -80%;
  transform: rotate(25deg);
  background: linear-gradient(90deg, transparent, #ffffff16, transparent);
  transition: left .65s;
  pointer-events: none;
}

@media (hover: hover) {
  .fu-petal:hover {
    border-color: var(--item-color);
    box-shadow: 0 0 25px -9px var(--item-color), inset 0 0 20px color-mix(in srgb, var(--item-color) 9%, transparent);
    filter: brightness(1.05);
  }
  .fu-petal:hover .fu-petal-icon { transform: translateY(-3px) rotate(-8deg) scale(1.12); }
  .fu-petal:hover .fu-petal-shine { left: 145%; }
}
.fu-petal:active .fu-petal-icon { transform: scale(.82); }
.fu-petal:active { filter: brightness(1.16); }

.fu-back-petal { border-style: dashed; background: var(--fu-panel); box-shadow: none; }
.fu-back-petal .fu-petal-icon { width: 29px; height: 29px; border: 1px solid var(--fu-line); border-radius: 50%; }

.fu-instruction { display: flex; align-items: center; gap: 4px; color: var(--fu-muted); font-size: 8px; line-height: 1.5; }
.fu-instruction > span { color: #3b82f6; font-size: 12px; }
.fu-step { font-size: 7px; font-weight: 850; letter-spacing: .1em; color: var(--fu-muted); white-space: nowrap; }

/* 📱 মোবাইল ডক */
.fu-dock {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin-top: 12px;
  padding: 6px;
  border: 1px solid var(--fu-line);
  border-radius: 18px;
  background: var(--fu-panel);
  backdrop-filter: blur(18px);
  box-shadow: var(--fu-shadow);
}
.fu-dock button {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 5px; min-width: 0; min-height: 51px; padding: 6px 2px;
  border: 1px solid transparent; border-radius: 13px;
  background: transparent; color: var(--fu-muted);
  transition: background .2s, border-color .2s, transform .15s, color .2s;
}
.fu-dock button:active { transform: scale(.94); }
.fu-dock button > span:first-child { font-size: 19px; line-height: 1; transition: transform .25s cubic-bezier(.2,1.5,.4,1); }
.fu-dock button > span:last-child { font-size: 9px; font-weight: 750; white-space: nowrap; }
.fu-dock button.is-active {
  border-color: color-mix(in srgb, var(--item-color) 35%, transparent);
  background: color-mix(in srgb, var(--item-color) 10%, transparent);
  border-radius: 12px;
  color: var(--fu-text);
}
.fu-dock button.is-active > span:first-child { transform: scale(1.15); }

.fu-footer {
  display: flex; align-items: center; justify-content: center; text-align: center;
  margin-top: 11px; padding-top: 10px;
  color: var(--fu-muted); font-size: 7px; letter-spacing: .08em;
}
.fu-footer b { color: #3b82f6; }

.fu-spark-layer { position: fixed; inset: 0; z-index: 80; pointer-events: none; overflow: hidden; }
.fu-burst { position: absolute; width: 0; height: 0; }
.fu-burst i {
  position: absolute; left: -2px; top: -2px; width: 4px; height: 7px; border-radius: 3px;
  background: var(--spark-color); box-shadow: 0 0 7px var(--spark-color);
  animation: fu-spark .65s cubic-bezier(.1,.6,.3,1) both;
}
.fu-spark-ring {
  position: absolute; left: -11px; top: -11px; width: 22px; height: 22px;
  border: 1px solid var(--spark-color); border-radius: 50%;
  animation: fu-ring .6s ease-out both;
}

.fu-sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

@keyframes fu-flow { to { stroke-dashoffset: -78; } }
@keyframes fu-float {
  0%, 100% { transform: translate(0,0) rotate(var(--rotation, 15deg)); }
  50% { transform: translate(15px,-20px) rotate(calc(var(--rotation, 15deg) + 12deg)); }
}
@keyframes fu-bloom {
  from { opacity: 0; transform: translate(var(--from-x),var(--from-y)) scale(.38) rotate(-12deg); }
  to { opacity: 1; transform: translate(0,0) scale(1) rotate(0); }
}
@keyframes fu-spark {
  0% { opacity: 1; transform: translate(0,0) rotate(var(--turn)) scale(1); }
  100% { opacity: 0; transform: translate(var(--dx),var(--dy)) rotate(var(--turn)) scale(.1); }
}
@keyframes fu-ring { from { opacity: .8; transform: scale(.3); } to { opacity: 0; transform: scale(3.2); } }
@keyframes fh-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
@keyframes fh-chip-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }

@media (max-width: 350px) {
  .fu-shell { padding-left: 8px; padding-right: 8px; }
  .fh-title { font-size: 26px; }
  .fu-petal strong { font-size: 9px; }
  .fu-petal small { font-size: 6px; }
  .fu-petal-icon { font-size: 21px; }
  .fu-dock button > span:last-child { font-size: 8px; }
}

@media (prefers-reduced-motion: reduce) {
  .fcl-universe *, .fcl-universe *::before, .fcl-universe *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
  .fu-spark-layer { display: none; }
}
`;

/* ================================================================
   STYLES — DESKTOP (৩য় কোডের পিসি ভিউ)
================================================================ */
const DESKTOP_STYLES = `
/* ============ THEME TOKENS ============ */
.fcl-root {
  --bg: #ffffff;
  --bg-alt: #f1f5f9;
  --head: #0f172a;
  --text: #475569;
  --muted: #64748b;
  --line: #e2e8f0;
  --eyebrow: #0369a1;
  --blue1: #1d4ed8;
  --blue2: #1d4ed8;
  --amber: #b45309;
  --rose: #e11d48;
  --frame-bg: #ffffff;
  --frame-line: #e2e8f0;
  --frame-shadow: 0 30px 80px rgba(15, 23, 42, 0.14);
  --card-a: #ffffff;
  --card-b: #f8fafc;
  --card-shadow: 0 6px 24px rgba(15, 23, 42, 0.07);
  --pill-bg: rgba(255, 255, 255, 0.96);
  --pill-line: #e2e8f0;
  --pill-sub: #64748b;
  --grid-line: rgba(100, 116, 139, 0.12);
  background: var(--bg);
  color: var(--head);
  transition: background 0.3s ease, color 0.3s ease;
}
.fcl-root.fcl-dark {
  --bg: #020617;
  --bg-alt: #02050b;
  --head: #ffffff;
  --text: #94a3b8;
  --muted: #94a3b8;
  --line: #172033;
  --eyebrow: #38bdf8;
  --blue1: #93c5fd;
  --blue2: #60a5fa;
  --amber: #f59e0b;
  --rose: #fb7185;
  --frame-bg: #080d17;
  --frame-line: rgba(255, 255, 255, 0.08);
  --frame-shadow: 0 40px 120px rgba(0, 0, 0, 0.7);
  --card-a: #0f172a;
  --card-b: #0b1220;
  --card-shadow: none;
  --pill-bg: rgba(11, 18, 32, 0.9);
  --pill-line: rgba(255, 255, 255, 0.1);
  --pill-sub: #94a3b8;
  --grid-line: rgba(148, 163, 184, 0.06);
}

/* ============ THEMED UTILITIES ============ */
.fcl-head { color: var(--head); }
.fcl-body { color: var(--text); }
.fcl-muted { color: var(--muted); }
.fcl-eyebrow { color: var(--eyebrow); }
.fcl-blue1 { color: var(--blue1); }
.fcl-blue2 { color: var(--blue2); }
.fcl-amber { color: var(--amber); }
.fcl-rose { color: var(--rose); }
.fcl-pill-sub { color: var(--pill-sub); }
.fcl-hero { background: var(--bg-alt); border-color: var(--line); }
.fcl-section { background: var(--bg); }
.fcl-frame { background: var(--frame-bg); border: 1px solid var(--frame-line); box-shadow: var(--frame-shadow); }
.fcl-pill { background: var(--pill-bg); box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12); }
.fcl-dark .fcl-pill { box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); }
.fcl-pill-line { border-color: var(--pill-line); }
.fcl-ink { color: color-mix(in srgb, var(--c) 58%, #0f172a); }
.fcl-dark .fcl-ink { color: var(--c); }
.no-sb { scrollbar-width: none; -ms-overflow-style: none; }
.no-sb::-webkit-scrollbar { display: none; }

/* ============ KEYFRAMES ============ */
@keyframes fcl-spin { to { transform: rotate(360deg); } }
@keyframes float-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(24px,-32px) scale(1.05); } }
@keyframes float-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-28px,26px) scale(1.06); } }
@keyframes chip-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes fcl-gshift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes fcl-wd {
  from { opacity: 0; transform: translateY(46px) rotate(5deg); filter: blur(8px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes fcl-rot {
  0% { opacity: 0; transform: translateY(100%); }
  12%, 88% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-100%); }
}
@keyframes fcl-marquee { to { transform: translateX(-50%); } }
@keyframes fcl-shine {
  0% { transform: translateX(-130%) skewX(-15deg); }
  55%, 100% { transform: translateX(380%) skewX(-15deg); }
}
@keyframes fcl-live-ring {
  0% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); }
  100% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
}
@keyframes fcl-zoom-pulse {
  0%,100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(34,211,238,.5)); }
  50% { transform: scale(1.14); filter: drop-shadow(0 0 22px rgba(34,211,238,.9)); }
}
@keyframes fcl-color-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes fcl-sq {
  0%,100% { transform: translate(0,0) rotate(var(--r,12deg)); }
  50% { transform: translate(18px,-26px) rotate(calc(var(--r,12deg) + 14deg)); }
}
@keyframes fcl-icon-float { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-12px) rotate(4deg); } }

/* ============ ENTRY WORDS / GRADIENT ============ */
.fcl-wd {
  display: inline-block;
  opacity: 0;
  animation: fcl-wd .8s cubic-bezier(.2,.9,.2,1) both;
  animation-delay: calc(var(--i, 0) * 90ms + 150ms);
}
.fcl-grad {
  background: linear-gradient(90deg, #2563eb, #1877F2, #7c3aed, #06b6d4, #2563eb);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: fcl-wd .8s cubic-bezier(.2,.9,.2,1) both, fcl-gshift 6s ease-in-out infinite;
  animation-delay: calc(var(--i, 0) * 90ms + 150ms), 0s;
}
.fcl-zoom-text {
  background: linear-gradient(90deg, #60a5fa, #22d3ee, #f59e0b, #8b5cf6, #60a5fa);
  background-size: 300% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fcl-color-shift 4s ease infinite, fcl-zoom-pulse 2.5s ease-in-out infinite;
  display: inline-block;
}
.fcl-light .fcl-zoom-text {
  background: linear-gradient(90deg, #1d4ed8, #0891b2, #d97706, #7c3aed, #1d4ed8);
  background-size: 300% auto;
  -webkit-background-clip: text;
  background-clip: text;
}
.fcl-rot { display: inline-block; overflow: hidden; height: 1.35em; line-height: 1.35em; vertical-align: bottom; min-width: 7.5ch; text-shadow: 0 0 22px currentColor; }
.fcl-rot-w { display: inline-block; animation: fcl-rot 2200ms both; }

/* ============ BACKGROUND ============ */
.fcl-grid-bg {
  background-image:
    linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%);
  mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%);
}
.fcl-orb-a { animation: float-a 11s ease-in-out infinite; }
.fcl-orb-b { animation: float-b 13s ease-in-out infinite; }
.par-a { transform: translate3d(calc(var(--px, 0) * -34px), calc(var(--py, 0) * -22px), 0); transition: transform .4s ease-out; }
.par-b { transform: translate3d(calc(var(--px, 0) * 28px), calc(var(--py, 0) * 20px), 0); transition: transform .4s ease-out; }
.sq {
  position: absolute;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(24,119,242,.2), rgba(124,58,237,.16));
  filter: blur(14px);
  animation: fcl-sq 16s ease-in-out infinite;
  pointer-events: none;
}
.sq-1 { width: 120px; height: 120px; left: 6%; top: 14%; --r: 14deg; }
.sq-2 { width: 90px; height: 90px; right: 8%; bottom: 20%; --r: -18deg; animation-delay: -5s; }
.sq-3 { width: 70px; height: 70px; left: 46%; top: 8%; --r: 30deg; animation-delay: -9s; }

/* ============ HERO CHIPS ============ */
.fcl-chip { animation: chip-float 5s ease-in-out infinite; }
.fcl-chip-delay { animation-delay: 1.4s; }
.fcl-live { display: inline-block; animation: fcl-live-ring 1.6s ease-out infinite; }

/* ============ BUTTONS ============ */
.btn-primary {
  position: relative; overflow: hidden; display: inline-flex; align-items: center;
  padding: 14px 28px; border-radius: 14px; font-size: 14px; font-weight: 800; color: #fff;
  background: linear-gradient(135deg, #1877F2, #5b5bf0);
  box-shadow: 0 14px 40px -10px rgba(24,119,242,.6);
  transition: filter .2s, box-shadow .2s;
}
.btn-primary:hover { filter: brightness(1.1); box-shadow: 0 18px 48px -8px rgba(24,119,242,.75); }
.btn-shine { position: absolute; inset: 0 auto 0 0; width: 40%; background: rgba(255,255,255,.28); animation: fcl-shine 3.2s ease-in-out infinite; }
.btn-play {
  display: inline-flex; align-items: center; gap: 8px; padding: 14px 24px; border-radius: 14px;
  font-size: 14px; font-weight: 800; color: var(--head);
  border: 1px solid rgba(34,197,94,.45); background: rgba(34,197,94,.1);
  transition: background .2s, transform .2s;
}
.btn-play:hover { background: rgba(34,197,94,.22); }
.btn-ghost {
  display: inline-flex; align-items: center; gap: 8px; padding: 14px 24px; border-radius: 14px;
  font-size: 14px; font-weight: 800; color: var(--blue2);
  border: 1px solid rgba(59,130,246,.4); background: rgba(59,130,246,.1);
  transition: background .2s, color .2s;
}
.btn-ghost:hover { background: #1877F2; color: #fff; }
.btn-primary:active, .btn-play:active, .btn-ghost:active { transform: scale(.96); }

/* ============ MARQUEE ============ */
.mq {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.mq-track { display: flex; width: max-content; animation: fcl-marquee 48s linear infinite; }
.mq:hover .mq-track { animation-play-state: paused; }
.mq-item {
  display: inline-flex; align-items: center; gap: 8px; margin-right: 10px; padding: 7px 14px;
  border-radius: 999px; font-size: 12px; font-weight: 800; white-space: nowrap; color: var(--head);
  border: 1px solid color-mix(in srgb, var(--c) 40%, var(--line));
  background: color-mix(in srgb, var(--c) 8%, var(--card-a));
  transition: transform .2s, background .2s;
}
.mq-item:hover { transform: translateY(-2px) scale(1.05); background: color-mix(in srgb, var(--c) 22%, var(--card-a)); }

/* ============ FILTER CHIPS ============ */
.fchip {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 999px;
  font-size: 12px; font-weight: 800; white-space: nowrap; cursor: pointer;
  border: 1px solid var(--line); background: var(--card-a); color: var(--text);
  transition: all .25s;
}
.fchip:hover { transform: translateY(-1px); border-color: #1877F2; }
.fchip.on {
  background: linear-gradient(135deg, #1877F2, #7c3aed); color: #fff; border-color: transparent;
  box-shadow: 0 8px 22px -8px rgba(24,119,242,.7);
}
.fchip b { font-size: 10px; padding: 1px 6px; border-radius: 99px; background: rgba(127,127,127,.2); }

/* ============ PORTAL CARD ============ */
.pc {
  --rx: 0deg; --ry: 0deg;
  position: relative; display: flex; flex-direction: column; height: 100%; min-height: 190px;
  padding: 18px; border-radius: 26px; overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--c) 30%, var(--line));
  background: linear-gradient(160deg, var(--card-a), var(--card-b));
  box-shadow: var(--card-shadow);
  transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s;
  will-change: transform;
}
.pc::before {
  content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0; transition: opacity .3s;
  background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), color-mix(in srgb, var(--c) 22%, transparent), transparent 45%);
}
.pc::after {
  content: ""; position: absolute; inset: 0; z-index: 3; pointer-events: none; opacity: 0; transition: opacity .3s;
  border-radius: inherit; padding: 1.5px;
  background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), var(--c), transparent 60%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}
@media (hover: hover) {
  .pc:hover {
    transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry)) translateY(-6px);
    box-shadow: 0 24px 50px -18px color-mix(in srgb, var(--c) 60%, transparent);
  }
  .pc:hover::before, .pc:hover::after { opacity: 1; }
  .pc:hover .pc-ico { transform: rotate(-8deg) scale(1.14); }
  .pc:hover .pc-water { transform: scale(1.18) rotate(-8deg); opacity: .2; }
  .pc:hover .pc-arrow { transform: translateX(7px); }
}
.pc:active { transform: perspective(900px) scale(.98); }
.pc-body { position: relative; z-index: 2; display: flex; flex-direction: column; flex: 1; }
.pc-water {
  position: absolute; z-index: 0; right: -6px; bottom: -16px; font-size: 96px; line-height: 1; opacity: .09;
  pointer-events: none; transition: transform .5s cubic-bezier(.2,.8,.2,1), opacity .5s;
}
.pc-ico {
  display: grid; place-items: center; width: 46px; height: 46px; border-radius: 15px; font-size: 22px;
  background: color-mix(in srgb, var(--c) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
  transition: transform .4s cubic-bezier(.3,1.6,.5,1);
}
.pc-badge {
  font-size: 9px; font-weight: 900; letter-spacing: .08em; padding: 4px 9px; border-radius: 9px; white-space: nowrap;
  border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
  background: color-mix(in srgb, var(--c) 12%, transparent);
}
.pc-arrow { display: inline-block; transition: transform .3s; }
.pc-xl { padding: 26px; }
.pc-xl .pc-ico { width: 64px; height: 64px; font-size: 32px; border-radius: 21px; }
.pc-xl .pc-water { font-size: 220px; right: -10px; bottom: -30px; opacity: .1; animation: fcl-icon-float 6s ease-in-out infinite; }
.pc-wide .pc-water { font-size: 120px; }
.pc-orbit {
  position: absolute; z-index: 0; right: -70px; top: -70px; width: 260px; height: 260px; border-radius: 50%;
  border: 1px dashed color-mix(in srgb, var(--c) 45%, transparent); animation: fcl-spin 18s linear infinite; pointer-events: none;
}
.pc-orbit::after {
  content: ""; position: absolute; inset: 40px; border-radius: 50%;
  border: 1px dashed color-mix(in srgb, var(--c) 30%, transparent); animation: fcl-spin 12s linear infinite reverse;
}
.pc-orbit i {
  position: absolute; top: -5px; left: 50%; width: 10px; height: 10px; border-radius: 50%;
  background: var(--c); box-shadow: 0 0 16px var(--c);
}
.pc-online {
  display: inline-flex; align-items: center; gap: 7px; font-size: 10px; font-weight: 900; letter-spacing: .12em;
  padding: 5px 11px; border-radius: 99px; border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
  background: color-mix(in srgb, var(--c) 10%, transparent);
}
.pc-cta {
  position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 10px; margin-top: 18px;
  padding: 12px 22px; border-radius: 15px; font-size: 13px; font-weight: 900; color: #fff;
  background: linear-gradient(135deg, var(--c), color-mix(in srgb, var(--c) 55%, #7c3aed));
  box-shadow: 0 14px 32px -10px var(--c);
}
.pc-cta-shine { position: absolute; inset: 0 auto 0 0; width: 40%; background: rgba(255,255,255,.3); animation: fcl-shine 3s ease-in-out infinite; }

/* ============ REDUCED MOTION ============ */
@media (prefers-reduced-motion: reduce) {
  .fcl-root *, .fcl-root *::before, .fcl-root *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  .fcl-wd { opacity: 1; }
}
`;
