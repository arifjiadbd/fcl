"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";

type CSSVars = CSSProperties & {
  [key: `--${string}`]: string | number;
};

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
    english: "STATS & LEGENDS",
    color: "#f59e0b",
    description: "র‍্যাঙ্কিং, রেকর্ড আর আপনার প্রিয় ক্রিকেটারের পরিসংখ্যান।",
    items: [
      {
        href: "/rankings",
        icon: "👑",
        title: "র‍্যাঙ্কিং ও MVP",
        english: "Rankings & MVP",
        description: "সেরা খেলোয়াড়, MVP রেটিং ও লিডারবোর্ড।",
      },
      {
        href: "/records",
        icon: "🏆",
        title: "রেকর্ডবুক",
        english: "Hall of Fame & Records",
        description: "সেঞ্চুরি, হ্যাটট্রিক আর ইতিহাস গড়া সব অর্জন।",
      },
      {
        href: "/players",
        icon: "🏏",
        title: "প্লেয়ার প্রোফাইল",
        english: "Players & Stat Cards",
        description: "খেলোয়াড়দের পরিচিতি ও অফিসিয়াল স্ট্যাট কার্ড।",
      },
    ],
  },
  {
    id: "arena",
    icon: "⚡",
    title: "ম্যাচের দুনিয়া",
    english: "MATCH ARENA",
    color: "#a78bfa",
    description: "পুরোনো ম্যাচ থেকে শেষ বলের রোমাঞ্চ—সব এক জায়গায়।",
    items: [
      {
        href: "/matches",
        icon: "🏟️",
        title: "ম্যাচ আর্কাইভ",
        english: "Match Directory & History",
        description: "টুর্নামেন্ট, সিরিজ ও ঐতিহাসিক ম্যাচের সংগ্রহ।",
      },
      {
        href: "/thrillers",
        icon: "⚡",
        title: "হাই ভোল্টেজ",
        english: "High Voltage Matches",
        description: "শেষ মুহূর্তের উত্তেজনা আর অবিশ্বাস্য সব ফিনিশ।",
      },
      {
        href: "/extraordinary",
        icon: "💎",
        title: "অসাধারণ নৈপুণ্য",
        english: "Extraordinary Performance",
        description: "ম্যাচজয়ী ইনিংস ও অবিস্মরণীয় ব্যক্তিগত পারফরম্যান্স।",
      },
    ],
  },
  {
    id: "community",
    icon: "💙",
    title: "আমাদের FCL",
    english: "THE COMMUNITY",
    color: "#f472b6",
    description: "খবর, জন্মদিন আর একসঙ্গে কাটানো প্রিয় মুহূর্তগুলো।",
    items: [
      {
        href: "/news",
        icon: "📰",
        title: "FCL সংবাদ",
        english: "FCL News Portal",
        description: "টুর্নামেন্ট আপডেট, কমিউনিটি সংবাদ ও বিশেষ প্রতিবেদন।",
      },
      {
        href: "/memories",
        icon: "🎞️",
        title: "স্মৃতি ও আড্ডা",
        english: "FCL Memories & Adda",
        description: "পুরোনো দিনের গল্প, হাসি আর জমে থাকা স্মৃতি।",
      },
      {
        href: "/birthday",
        icon: "🎂",
        title: "জন্মদিনের উৎসব",
        english: "Birthday Celebration",
        description: "FCL তারকাদের জন্মদিন ও শুভেচ্ছা কার্ড।",
      },
    ],
  },
  {
    id: "play",
    icon: "🎮",
    title: "প্লে ও এক্সপ্লোর",
    english: "PLAY & EXPLORE",
    color: "#22d3ee",
    description: "মাঠে নামুন, নিয়ম জানুন অথবা ঘুরে দেখুন ফটো গ্যালারি।",
    items: [
      {
        href: "/play",
        icon: "🎮",
        title: "খেলা শুরু করুন",
        english: "Play FCL Online",
        description: "মূল Facebook Cricket League গেমে প্রবেশ করুন।",
      },
      {
        href: "/gallery",
        icon: "📸",
        title: "ফটো গ্যালারি",
        english: "Player Photo Gallery",
        description: "খেলোয়াড়দের ছবি দেখুন ও ডাউনলোড করুন।",
      },
      {
        href: "/rules",
        icon: "📜",
        title: "খেলার নিয়ম",
        english: "Rules & Match Formats",
        description: "অফিসিয়াল গাইডলাইন ও বিভিন্ন ম্যাচ ফরম্যাট।",
      },
    ],
  },
];

const ALL_PORTALS = MENU_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    groupId: group.id,
    groupTitle: group.title,
    color: group.color,
  }))
);

const ROT_WORDS = [
  { t: "RANKINGS", c: "#f59e0b" },
  { t: "RECORDS", c: "#3b82f6" },
  { t: "MEMORIES", c: "#ec4899" },
  { t: "THRILLERS", c: "#a855f7" },
  { t: "LEGENDS", c: "#22d3ee" },
  { t: "THE GAME", c: "#22c55e" },
];

/* ================================================================
   LIVE MATCH SIMULATION (decorative)
================================================================ */

type Ball = number | "W";

const BALLS: Ball[] = [1, 4, 6, 0, 2, "W", 4, 1, 6, 0, 1, 2, 6, 4, 0, 1, 6, "W", 2, 4, 6, 1, 6, 4];
const START_RUNS = 14;
const START_WKTS = 2;
const TARGET = 70;

const WIN_BALL = (() => {
  let runs = START_RUNS;
  for (let k = 0; k < BALLS.length; k++) {
    const b = BALLS[k];
    if (typeof b === "number") runs += b;
    if (runs >= TARGET) return k + 1;
  }
  return BALLS.length;
})();

const CYCLE = WIN_BALL + 3;

function useMatchSim(paused: boolean) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setStep((s) => s + 1), 1500);
    return () => clearInterval(id);
  }, [paused]);

  const i = Math.min(step % CYCLE, WIN_BALL);
  const played = BALLS.slice(0, i);

  let runs = START_RUNS;
  let wkts = START_WKTS;

  played.forEach((b) => {
    if (b === "W") wkts += 1;
    else runs += b;
  });

  return {
    i,
    runs,
    wkts,
    last: played[i - 1] as Ball | undefined,
    won: i === WIN_BALL,
    need: Math.max(TARGET - runs, 0),
    left: BALLS.length - i,
    recent: played.slice(-6),
    pct: Math.min(100, Math.round((runs / TARGET) * 100)),
  };
}

function ballMeta(v: Ball | undefined) {
  if (v === undefined) return { t: "·", label: "NEXT BALL", k: "next" };
  if (v === "W") return { t: "W", label: "OUT!", k: "w" };
  if (v === 6) return { t: "6", label: "SIX!", k: "six" };
  if (v === 4) return { t: "4", label: "FOUR!", k: "four" };
  if (v === 0) return { t: "•", label: "DOT BALL", k: "dot" };
  return { t: String(v), label: `${v} RUN${v > 1 ? "S" : ""}`, k: "run" };
}

/* ================================================================
   HOOKS
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

/* ================================================================
   ICONS
================================================================ */

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m16 16 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

/* ================================================================
   HERO PIECES
================================================================ */

function Words({
  text,
  base = 0,
  className = "",
}: {
  text: string;
  base?: number;
  className?: string;
}) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className={`fh-wd ${className}`}
          style={{ "--i": base + i } as CSSVars}
        >
          {word}
          {"\u00A0"}
        </span>
      ))}
    </>
  );
}

function Rotator({
  small = false,
  paused,
}: {
  small?: boolean;
  paused: boolean;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((v) => (v + 1) % ROT_WORDS.length), 2200);
    return () => clearInterval(id);
  }, [paused]);

  const word = ROT_WORDS[i];

  return (
    <div className={`fh-rotator ${small ? "is-small" : ""}`}>
      <span>Dive into</span>
      <span className="fh-rot" style={{ color: word.c }}>
        <span key={i} className="fh-rot-w">
          {word.t}
        </span>
      </span>
    </div>
  );
}

function Magnetic({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="fh-magnetic"
      onPointerMove={(e) => {
        if (disabled || e.pointerType !== "mouse" || !ref.current) return;
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

function HeroArt({ reduced }: { reduced: boolean }) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const sim = useMatchSim(reduced);
  const meta = ballMeta(sim.last);

  return (
    <div
      className="fh-stage"
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse" || !tiltRef.current) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tiltRef.current.style.setProperty("--rx", `${y * -9}deg`);
        tiltRef.current.style.setProperty("--ry", `${x * 11}deg`);
      }}
      onPointerLeave={() => {
        tiltRef.current?.style.setProperty("--rx", "0deg");
        tiltRef.current?.style.setProperty("--ry", "0deg");
      }}
    >
      <div ref={tiltRef} className="fh-tilt">
        <div className="fh-ring">
          <div className="fh-ring-in">
            <img src="/fcl-room.png" alt="FCL Room" draggable={false} />
          </div>
        </div>

        {/* live score */}
        <div className="fh-z1 fh-c1">
          <div className="fh-pill fh-float">
            <span className="fh-live" />
            <div>
              <b>FCL LIVE</b>
              <small className="fh-blue">
                Phoenix ·{" "}
                <span key={sim.runs} className="fh-pop">
                  {sim.runs}/{sim.wkts}
                </span>
              </small>
            </div>
          </div>
        </div>

        {/* last ball */}
        <div className="fh-z2 fh-c2">
          <div className="fh-pill fh-float fh-delay">
            <span key={sim.i} className={`fh-ball fh-pop k-${meta.k}`}>
              {meta.t}
            </span>
            <div>
              <b>{meta.label}</b>
              <small>Ball {sim.i}</small>
            </div>
          </div>
        </div>

        {/* this over */}
        <div className="fh-z2 fh-c3">
          <div className="fh-pill fh-float fh-over">
            <small className="fh-over-title">THIS OVER</small>
            <div className="fh-over-balls">
              {Array.from({ length: 6 }).map((_, k) => {
                const v = sim.recent[k];
                const m = ballMeta(v);

                return v === undefined ? (
                  <span key={k} className="fh-dash" />
                ) : (
                  <span
                    key={`${sim.i}-${k}`}
                    className={`fh-ball is-sm fh-pop k-${m.k}`}
                  >
                    {m.t}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* need */}
        <div className="fh-z1 fh-c4">
          <div className="fh-pill fh-float fh-delay fh-need">
            <div className="fh-need-row">
              <span>{sim.won ? "🏆" : "🎯"}</span>
              <b className="fh-amber">
                {sim.won ? "Phoenix won!" : `Need ${sim.need} off ${sim.left}`}
              </b>
            </div>
            <div className="fh-need-track">
              <div style={{ width: `${sim.pct}%` }} />
            </div>
            <small>Target {TARGET}</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileLive({ reduced }: { reduced: boolean }) {
  const sim = useMatchSim(reduced);
  const meta = ballMeta(sim.last);

  return (
    <div className="fh-mlive">
      <span className="fh-live" />
      <div className="fh-mlive-copy">
        <b>
          FCL LIVE · Phoenix{" "}
          <span key={sim.runs} className="fh-pop">
            {sim.runs}/{sim.wkts}
          </span>
        </b>
        <small className="fh-amber">
          {sim.won ? "🏆 Phoenix won!" : `🎯 Need ${sim.need} off ${sim.left}`}
        </small>
      </div>
      <span key={sim.i} className={`fh-ball fh-pop k-${meta.k}`}>
        {meta.t}
      </span>
    </div>
  );
}

/* ================================================================
   HOME
================================================================ */

export default function Home() {
  const isDark = useIsDark();
  const reducedMotion = useReducedMotion();

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [bursts, setBursts] = useState<SparkBurst[]>([]);
  const [announcement, setAnnouncement] = useState("");

  const rootRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const centerRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const burstId = useRef(0);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const activeGroup =
    MENU_GROUPS.find((group) => group.id === activeGroupId) ?? null;

  const previewGroup =
    activeGroup ??
    MENU_GROUPS.find((group) => group.id === previewId) ??
    null;

  const accent = previewGroup?.color ?? "#60a5fa";

  const results = useMemo(() => {
    const value = query.trim().toLocaleLowerCase();

    if (!value) return ALL_PORTALS;

    return ALL_PORTALS.filter((portal) =>
      [
        portal.title,
        portal.english,
        portal.description,
        portal.groupTitle,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(value)
    );
  }, [query]);

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

  useEffect(() => {
    if (directoryOpen) {
      searchRef.current?.focus({ preventScroll: true });
    }
  }, [directoryOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.isComposing
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const typing =
        target?.isContentEditable ||
        /INPUT|TEXTAREA|SELECT/.test(target?.tagName ?? "");

      if (event.key === "/" && !typing) {
        event.preventDefault();
        setDirectoryOpen(true);
        setQuery("");
      }

      if (event.key === "Escape") {
        if (directoryOpen) {
          event.preventDefault();
          setDirectoryOpen(false);
          setQuery("");
          searchButtonRef.current?.focus({ preventScroll: true });
        } else if (activeGroupId) {
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
  }, [directoryOpen, activeGroupId]);

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

  function closeDirectory() {
    setDirectoryOpen(false);
    setQuery("");
    searchButtonRef.current?.focus({ preventScroll: true });
  }

  function scrollToMenu() {
    document.getElementById("fu-menu")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  function createSpark(event: ReactPointerEvent<HTMLElement>) {
    if (reducedMotion || !event.isPrimary || event.button !== 0) return;

    const target = event.target as HTMLElement;
    const element = target.closest<HTMLElement>("[data-accent]");
    const color = element?.dataset.accent ?? accent;
    const id = ++burstId.current;

    setBursts((previous) => [
      ...previous.slice(-2),
      {
        id,
        x: event.clientX,
        y: event.clientY,
        color,
      },
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

    event.currentTarget.style.setProperty(
      "--pointer-x",
      `${event.clientX - rect.left}px`
    );
    event.currentTarget.style.setProperty(
      "--pointer-y",
      `${event.clientY - rect.top}px`
    );
  }

  function heroParallax(event: ReactPointerEvent<HTMLElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;

    const r = event.currentTarget.getBoundingClientRect();

    event.currentTarget.style.setProperty(
      "--px",
      String((event.clientX - r.left) / r.width - 0.5)
    );
    event.currentTarget.style.setProperty(
      "--py",
      String((event.clientY - r.top) / r.height - 0.5)
    );
  }

  return (
    <main
      ref={rootRef}
      className={`fcl-universe ${isDark ? "fu-dark" : "fu-light"}`}
      style={{ "--fu-accent": accent } as CSSVars}
      onPointerDown={createSpark}
    >
      <style jsx global>{UNIVERSE_STYLES}</style>

      <div className="fu-background" aria-hidden="true">
        <div className="fu-grid" />
        <div className="fu-glow fu-glow-a" />
        <div className="fu-glow fu-glow-b" />
        <div className="fu-square fu-square-a" />
        <div className="fu-square fu-square-b" />
        <div className="fu-square fu-square-c" />
      </div>

      <div className="fu-shell">
        <header className="fu-header">
          <div className="fu-brand">
            <span className="fu-brand-mark" aria-hidden="true">
              F
            </span>
            <div>
              <span className="fu-eyebrow">FACEBOOK CRICKET LEAGUE</span>
              <h1>
              
              </h1>
            </div>
          </div>

          <div className="fu-header-actions">
            <Link href="/bn" className="fu-language" data-accent="#60a5fa">
              বাংলা
            </Link>

            <button
              ref={searchButtonRef}
              type="button"
              className={`fu-search-trigger ${directoryOpen ? "is-active" : ""}`}
              aria-label={directoryOpen ? "মেনু তালিকা বন্ধ করুন" : "সব মেনু দেখুন ও খুঁজুন"}
              aria-expanded={directoryOpen}
              aria-controls="fu-menu-content"
              onClick={() => {
                if (directoryOpen) closeDirectory();
                else {
                  setQuery("");
                  setDirectoryOpen(true);
                }
              }}
            >
              <SearchIcon />
              <span>সব মেনু</span>
              <kbd>/</kbd>
            </button>
          </div>
        </header>

        {/* ================================================================
            HERO — DESKTOP / TABLET
        ================================================================ */}
        <section className="fh-hero fh-desk" onPointerMove={heroParallax} aria-label="FCL hero">
          <div className="fh-orb fh-orb-a" aria-hidden="true" />
          <div className="fh-orb fh-orb-b" aria-hidden="true" />

          <div className="fh-desk-grid">
            <div className="fh-copy">
              <div className="fh-badge fh-wd" style={{ "--i": 0 } as CSSVars}>
                <span className="fh-live" />
                FCL • DIGITAL GATEWAY HUB
              </div>

              <h2 className="fh-title">
                <span className="fh-line">
                  <Words text="THE GAME LIVES" base={1} />
                </span>
                <span className="fh-line">
                  <Words text="BEYOND THE FIELD." base={4} className="fh-grad" />
                </span>
                <span className="fh-tag">
                  One Game. One Community. <span className="fh-zoom">FCL.</span>
                </span>
              </h2>

              <Rotator paused={reducedMotion} />

              <p className="fh-text">
                Facebook Cricket League-এর অফিশিয়াল পোর্টাল — র‍্যাঙ্কিং, রেকর্ড, স্মৃতি আর
                হাই-ভোল্টেজ ম্যাচের গল্প, সব এক জায়গায়।
              </p>

              <div className="fh-actions">
                <Magnetic disabled={reducedMotion}>
                  <button
                    type="button"
                    className="fh-btn-primary"
                    data-accent="#1877F2"
                    onClick={scrollToMenu}
                  >
                    <span className="fh-btn-shine" />
                    <span className="fh-rel">Explore Menu ↓</span>
                  </button>
                </Magnetic>

                <Magnetic disabled={reducedMotion}>
                  <Link href="/play" className="fh-btn-play" data-accent="#22c55e">
                    <span className="fh-live" />
                    🎮 Play Now
                  </Link>
                </Magnetic>

                <Magnetic disabled={reducedMotion}>
                  <Link href="/bn" className="fh-btn-ghost" data-accent="#3b82f6">
                    💙 বাংলা ভার্সন
                  </Link>
                </Magnetic>
              </div>
            </div>

            <HeroArt reduced={reducedMotion} />
          </div>

          <div className="fh-marquee">
            <div className="fh-marquee-track">
              {[0, 1].map((copy) =>
                ALL_PORTALS.map((portal) => (
                  <Link
                    key={`${copy}-${portal.href}`}
                    href={portal.href}
                    className="fh-marquee-item"
                    data-accent={portal.color}
                    style={{ "--item-color": portal.color } as CSSVars}
                    tabIndex={copy ? -1 : 0}
                    aria-hidden={copy ? true : undefined}
                  >
                    <span>{portal.icon}</span>
                    {portal.english}
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ================================================================
            HERO — MOBILE (app style)
        ================================================================ */}
        <section className="fh-hero fh-mob" aria-label="FCL hero">
          <div className="fh-badge fh-wd" style={{ "--i": 0 } as CSSVars}>
            <span className="fh-live" />
            FCL DIGITAL HUB
          </div>

          <h2 className="fh-title">
            <span className="fh-line">
              <Words text="THE GAME LIVES" base={1} />
            </span>
            <span className="fh-line">
              <Words text="BEYOND THE FIELD." base={4} className="fh-grad" />
            </span>
          </h2>

          <Rotator small paused={reducedMotion} />

          <div className="fh-mob-art">
            <div className="fh-ring" style={{ "--rr": "22px" } as CSSVars}>
              <div className="fh-ring-in">
                <img src="/fcl-room.png" alt="FCL Online" draggable={false} />
              </div>
            </div>
            <MobileLive reduced={reducedMotion} />
          </div>

          <div className="fh-mob-actions">
            <button
              type="button"
              className="fh-btn-primary"
              data-accent="#1877F2"
              onClick={scrollToMenu}
            >
              <span className="fh-btn-shine" />
              <span className="fh-rel">Explore Menu ↓</span>
            </button>
            <Link href="/play" className="fh-btn-play" data-accent="#22c55e">
              <span className="fh-live" />
              🎮 Play
            </Link>
          </div>
        </section>

        {/* ================================================================
            FLOWER MENU
        ================================================================ */}
        <section id="fu-menu" className="fu-dashboard" aria-label="FCL interactive navigation">
          <aside className="fu-wing fu-wing-left">
            <span className="fu-overline">
              <i />
              YOUR CRICKET UNIVERSE
            </span>

            <h2>
              এক <span>এফসিএল,</span>
              <br />
              অসংখ্য <span>গল্প।</span>
            </h2>

            <p>
              আপনার FCL এখন হাতের মুঠোয়।
              পছন্দের একটি পাপড়িতে ক্লিক করুন—খুলে যাবে নতুন দুনিয়া।
            </p>

            <div className="fu-counts">
              <div>
                <strong>{MENU_GROUPS.length.toString().padStart(2, "0")}</strong>
                <span>ক্যাটেগরি</span>
              </div>
              <span className="fu-count-divider" />
              <div>
                <strong>{ALL_PORTALS.length}</strong>
                <span>ডেস্টিনেশন</span>
              </div>
            </div>

            <Link href="/play" className="fu-play-button" data-accent="#22d3ee">
              <span aria-hidden="true">🎮</span>
              মাঠে নামুন
              <ArrowIcon />
            </Link>
          </aside>

          <div className="fu-console">
            <div className="fu-console-top">
              <div className="fu-breadcrumb">
                <button
                  type="button"
                  onClick={() => {
                    if (directoryOpen) closeDirectory();
                    goHome();
                  }}
                >
                  FCL
                </button>
                <span>/</span>
                <strong>
                  {directoryOpen
                    ? "সব ডেস্টিনেশন"
                    : activeGroup?.title ?? "মূল মেনু"}
                </strong>
              </div>

              <span className="fu-mode-label">
                {directoryOpen ? "QUICK FIND" : "ORBIT MENU"}
              </span>
            </div>

            <div id="fu-menu-content" className="fu-menu-content">
              {directoryOpen ? (
                <div className="fu-directory">
                  <div className="fu-search-field">
                    <SearchIcon />
                    <input
                      ref={searchRef}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="পেইজ খুঁজুন… rankings, ম্যাচ"
                      aria-label="FCL পেইজ খুঁজুন"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      onClick={closeDirectory}
                      aria-label="ফুল মেনুতে ফিরুন"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="fu-result-heading">
                    <span>{results.length}টি ডেস্টিনেশন</span>
                    <span>সরাসরি প্রবেশ করুন ↗</span>
                  </div>

                  <nav className="fu-results" aria-label="সব FCL পেইজ">
                    {results.map((portal) => (
                      <Link
                        key={portal.href}
                        href={portal.href}
                        className="fu-result"
                        data-accent={portal.color}
                        style={{ "--item-color": portal.color } as CSSVars}
                      >
                        <span className="fu-result-icon" aria-hidden="true">
                          {portal.icon}
                        </span>
                        <span className="fu-result-copy">
                          <strong>{portal.title}</strong>
                          <small>{portal.english}</small>
                        </span>
                        <span className="fu-result-arrow" aria-hidden="true">
                          ↗
                        </span>
                      </Link>
                    ))}
                  </nav>

                  {results.length === 0 && (
                    <div className="fu-empty" role="status">
                      <span aria-hidden="true">🔎</span>
                      <strong>কোনো পেইজ পাওয়া যায়নি</strong>
                      <button type="button" onClick={() => setQuery("")}>
                        সব মেনু দেখুন
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    className="fu-directory-back"
                    onClick={closeDirectory}
                  >
                    <ArrowIcon back />
                    ফুল মেনুতে ফিরুন
                  </button>
                </div>
              ) : (
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

                  <svg
                    className="fu-connectors"
                    viewBox="0 0 500 500"
                    aria-hidden="true"
                  >
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
                      activeGroup
                        ? "মূল FCL মেনুতে ফিরুন"
                        : "FCL মূল মেনু"
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
                      activeGroup
                        ? `${activeGroup.title} সাবমেনু`
                        : "FCL ক্যাটেগরি"
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
              )}
            </div>

            <div className="fu-console-bottom">
              <span className="fu-instruction">
                <span aria-hidden="true">{directoryOpen ? "⌕" : activeGroup ? "↗" : "✦"}</span>
                {directoryOpen
                  ? "এক ট্যাপে আপনার গন্তব্য"
                  : activeGroup
                    ? "অপশন বেছে নিন · মাঝখানে ট্যাপ করলে Home"
                    : "পাপড়িতে ট্যাপ করুন · খুলবে নতুন অপশন"}
              </span>
              <span className="fu-step">
                {directoryOpen ? "ALL" : activeGroup ? "02 / 02" : "01 / 02"}
              </span>
            </div>
          </div>

          <aside className="fu-wing fu-wing-right">
            <div
              key={previewGroup?.id ?? "welcome"}
              className="fu-preview"
            >
              <span className="fu-preview-icon" aria-hidden="true">
                {previewGroup?.icon ?? "✦"}
              </span>

              <span className="fu-overline">
                {previewGroup?.english ?? "ONE GAME. ONE COMMUNITY."}
              </span>

              <h2>{previewGroup?.title ?? "আপনার পরের গন্তব্য?"}</h2>

              <p>
                {previewGroup?.description ??
                  "মেনুর ওপর কার্সর রাখুন। ক্যাটেগরির ভেতরে কী আছে, এখানেই দেখে নিন।"}
              </p>

              <div className="fu-preview-list">
                {previewGroup ? (
                  previewGroup.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-accent={previewGroup.color}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      <span>{item.title}</span>
                      <span aria-hidden="true">↗</span>
                    </Link>
                  ))
                ) : (
                  <>
                    <div><span>01</span> একটি ক্যাটেগরি বেছে নিন</div>
                    <div><span>02</span> পছন্দের পেইজ খুলুন</div>
                    <div><span>↩</span> FCL-এ ট্যাপ করে ফিরে আসুন</div>
                  </>
                )}
              </div>
            </div>

            <span className="fu-key-hint">
              <kbd>/</kbd> Search <span>·</span> <kbd>Esc</kbd> Back
            </span>
          </aside>
        </section>

        <nav className="fu-dock" aria-label="দ্রুত ক্যাটেগরি পরিবর্তন">
          {MENU_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              className={activeGroupId === group.id && !directoryOpen ? "is-active" : ""}
              aria-pressed={activeGroupId === group.id && !directoryOpen}
              data-accent={group.color}
              style={{ "--item-color": group.color } as CSSVars}
              onClick={() => {
                setDirectoryOpen(false);
                setQuery("");
                setActiveGroupId(group.id);
                setPreviewId(null);
                setAnnouncement(`${group.title}: তিনটি অপশন খোলা হয়েছে।`);
              }}
            >
              <span aria-hidden="true">{group.icon}</span>
              <span>
                {group.id === "legends"
                  ? "স্ট্যাটস"
                  : group.id === "arena"
                    ? "ম্যাচ"
                    : group.id === "community"
                      ? "কমিউনিটি"
                      : "এক্সপ্লোর"}
              </span>
            </button>
          ))}
        </nav>

        <footer className="fu-footer">
          <span>ONE GAME. ONE COMMUNITY. <b>FCL.</b></span>
          <span className="fu-footer-desktop">Built around your cricket story.</span>
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
  );
}

const UNIVERSE_STYLES = `
.fcl-universe {
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
  --fu-pill: rgba(11, 18, 32, .9);
  --fu-frame: #080d17;
}

.fcl-universe *,
.fcl-universe *::before,
.fcl-universe *::after {
  box-sizing: border-box;
}

.fcl-universe button,
.fcl-universe input {
  font: inherit;
}

.fcl-universe button,
.fcl-universe a {
  touch-action: manipulation;
}

.fcl-universe button {
  cursor: pointer;
}

.fcl-universe a {
  text-decoration: none;
  color: inherit;
}

.fcl-universe button:focus-visible,
.fcl-universe a:focus-visible,
.fcl-universe input:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 4px;
}

.fu-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}

.fu-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--fu-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--fu-grid) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse at center, black, transparent 80%);
}

.fu-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: .12;
}

.fu-glow-a {
  background: #2563eb;
  top: -140px;
  left: 10%;
}

.fu-glow-b {
  background: #9333ea;
  bottom: -200px;
  right: 5%;
}

.fu-square {
  position: absolute;
  border: 1px solid rgba(96, 165, 250, .2);
  border-radius: 27%;
  background: linear-gradient(135deg, #3b82f633, #a855f71a);
  filter: blur(8px);
  animation: fu-float 13s ease-in-out infinite;
}

.fu-square-a {
  width: 115px;
  height: 115px;
  top: 18%;
  left: 4%;
  --rotation: 20deg;
}

.fu-square-b {
  width: 150px;
  height: 150px;
  right: 3%;
  bottom: 10%;
  --rotation: -22deg;
  animation-delay: -5s;
}

.fu-square-c {
  width: 65px;
  height: 65px;
  top: 8%;
  right: 30%;
  --rotation: 35deg;
  animation-delay: -9s;
}

.fu-shell {
  width: min(1220px, 100%);
  margin: 0 auto;
  padding: 20px 26px 12px;
}

.fu-header,
.fu-header-actions,
.fu-brand {
  display: flex;
  align-items: center;
}

.fu-header {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.fu-brand {
  gap: 11px;
  min-width: 0;
}

.fu-brand-mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 13px;
  background: linear-gradient(135deg, #1877f2, #7c3aed);
  color: white;
  font-size: 24px;
  font-weight: 950;
  font-style: italic;
  box-shadow: 0 8px 25px #1877f230;
}

.fu-eyebrow {
  display: block;
  color: var(--fu-muted);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .18em;
}

.fu-brand h1 {
  margin: 3px 0 0;
  font-size: 25px;
  font-weight: 950;
  line-height: 1;
  letter-spacing: -1px;
}

.fu-brand h1 span {
  font-weight: 600;
  color: var(--fu-muted);
}

.fu-header-actions {
  gap: 10px;
}

.fu-language {
  font-size: 12px;
  font-weight: 800;
  padding: 8px 4px;
}

.fu-search-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid var(--fu-line);
  border-radius: 13px;
  background: var(--fu-panel);
  color: var(--fu-text);
  font-size: 12px !important;
  font-weight: 750 !important;
  transition: border-color .2s, background .2s;
}

.fu-search-trigger:hover,
.fu-search-trigger.is-active {
  border-color: #3b82f6;
  background: #3b82f615;
}

.fcl-universe kbd {
  border: 1px solid var(--fu-line);
  border-radius: 5px;
  padding: 2px 5px;
  font-family: inherit;
  font-size: 10px;
  color: var(--fu-muted);
}

/* ================================================================
   HERO
================================================================ */

.fh-hero {
  position: relative;
  margin-bottom: 22px;
}

.fh-mob {
  display: none;
}

.fh-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(70px);
  transition: transform .4s ease-out;
}

.fh-orb-a {
  width: 340px;
  height: 340px;
  right: -60px;
  top: -80px;
  background: #7c3aed;
  opacity: .16;
  transform: translate3d(calc(var(--px, 0) * -34px), calc(var(--py, 0) * -22px), 0);
}

.fh-orb-b {
  width: 280px;
  height: 280px;
  left: -60px;
  bottom: -40px;
  background: #1877f2;
  opacity: .16;
  transform: translate3d(calc(var(--px, 0) * 28px), calc(var(--py, 0) * 20px), 0);
}

.fh-desk-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr);
  align-items: center;
  gap: 34px;
  padding: 6px 12px 0 0;
}

.fh-copy {
  min-width: 0;
}

.fh-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border: 1px solid #1877f24d;
  border-radius: 999px;
  background: #1877f21a;
  color: var(--fu-blue);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .26em;
  backdrop-filter: blur(12px);
}

.fh-title {
  margin: 16px 0 0;
  font-size: clamp(30px, 4.6vw, 60px);
  line-height: .98;
  letter-spacing: -.045em;
  font-weight: 950;
  color: var(--fu-text);
}

.fh-line {
  display: block;
}

.fh-tag {
  display: block;
  margin-top: 12px;
  font-size: .38em;
  line-height: 1.3;
  font-weight: 800;
  letter-spacing: -.02em;
  color: var(--fu-amber);
}

.fh-zoom {
  display: inline-block;
  font-size: 1.45em;
  font-weight: 950;
  letter-spacing: -.04em;
  background: linear-gradient(90deg, #1d4ed8, #0891b2, #d97706, #7c3aed, #1d4ed8);
  background-size: 300% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fh-color-shift 4s ease infinite, fh-zoom-pulse 2.5s ease-in-out infinite;
}

.fu-dark .fh-zoom {
  background-image: linear-gradient(90deg, #60a5fa, #22d3ee, #f59e0b, #8b5cf6, #60a5fa);
}

.fh-wd {
  display: inline-block;
  opacity: 0;
  animation: fh-wd .8s cubic-bezier(.2, .9, .2, 1) both;
  animation-delay: calc(var(--i, 0) * 90ms + 150ms);
}

.fh-grad {
  background: linear-gradient(90deg, #2563eb, #1877f2, #7c3aed, #06b6d4, #2563eb);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: fh-wd .8s cubic-bezier(.2, .9, .2, 1) both, fh-gshift 6s ease-in-out infinite;
  animation-delay: calc(var(--i, 0) * 90ms + 150ms), 0s;
}

.fh-rotator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  font-size: 20px;
  font-weight: 900;
}

.fh-rotator > span:first-child {
  color: var(--fu-muted);
  font-weight: 700;
}

.fh-rotator.is-small {
  margin-top: 10px;
  font-size: 15px;
}

.fh-rot {
  display: inline-block;
  height: 1.35em;
  min-width: 9.5ch;
  overflow: hidden;
  line-height: 1.35em;
  vertical-align: bottom;
  text-shadow: 0 0 22px currentColor;
}

.fh-rot-w {
  display: inline-block;
  animation: fh-rot 2200ms both;
}

.fh-text {
  max-width: 480px;
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.85;
  color: var(--fu-muted);
}

.fh-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.fh-magnetic {
  transition: transform .25s cubic-bezier(.2, .8, .2, 1);
}

.fh-rel {
  position: relative;
}

.fh-btn-primary {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 24px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #1877f2, #5b5bf0);
  color: #fff !important;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 14px 40px -10px rgba(24, 119, 242, .6);
  transition: filter .2s, box-shadow .2s, transform .2s;
}

.fh-btn-primary:hover {
  filter: brightness(1.1);
  box-shadow: 0 18px 48px -8px rgba(24, 119, 242, .75);
}

.fh-btn-shine {
  position: absolute;
  inset: 0 auto 0 0;
  width: 40%;
  background: rgba(255, 255, 255, .28);
  animation: fh-shine 3.2s ease-in-out infinite;
}

.fh-btn-play,
.fh-btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 22px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 800;
  transition: background .2s, color .2s, transform .2s;
}

.fh-btn-play {
  border: 1px solid rgba(34, 197, 94, .45);
  background: rgba(34, 197, 94, .1);
  color: var(--fu-text);
}

.fh-btn-play:hover {
  background: rgba(34, 197, 94, .22);
}

.fh-btn-ghost {
  border: 1px solid rgba(59, 130, 246, .4);
  background: rgba(59, 130, 246, .1);
  color: var(--fu-blue);
}

.fh-btn-ghost:hover {
  background: #1877f2;
  color: #fff;
}

.fh-btn-primary:active,
.fh-btn-play:active,
.fh-btn-ghost:active {
  transform: scale(.96);
}

.fh-live {
  display: inline-block;
  flex-shrink: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #22c55e;
  animation: fh-live-ring 1.6s ease-out infinite;
}

/* hero art */

.fh-stage {
  position: relative;
  height: 360px;
  width: 100%;
  perspective: 1100px;
}

.fh-tilt {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform .25s ease-out;
}

.fh-ring {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 2px;
  border-radius: var(--rr, 2.2rem);
  box-shadow: 0 30px 80px rgba(15, 23, 42, .16);
}

.fu-dark .fh-ring {
  box-shadow: 0 40px 100px rgba(0, 0, 0, .6);
}

.fh-ring::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 220%;
  aspect-ratio: 1;
  translate: -50% -50%;
  background: conic-gradient(from 0deg, transparent 0 55%, #1877f2, #22d3ee, #a855f7, transparent 100%);
  animation: fh-spin 6s linear infinite;
}

.fh-ring-in {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 12px;
  border-radius: calc(var(--rr, 2.2rem) - 2px);
  background: var(--fu-frame);
}

.fh-ring-in img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.fh-z1,
.fh-z2 {
  position: absolute;
}

.fh-z1 { transform: translateZ(46px); }
.fh-z2 { transform: translateZ(76px); }

.fh-c1 { left: -22px; top: 26px; }
.fh-c2 { right: -18px; top: 96px; }
.fh-c3 { left: -22px; bottom: 62px; }
.fh-c4 { right: -14px; bottom: 20px; }

.fh-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border: 1px solid var(--fu-line);
  border-radius: 16px;
  background: var(--fu-pill);
  box-shadow: 0 12px 32px rgba(15, 23, 42, .12);
  backdrop-filter: blur(14px);
}

.fu-dark .fh-pill {
  box-shadow: 0 20px 50px rgba(0, 0, 0, .5);
}

.fh-pill b {
  display: block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .04em;
  color: var(--fu-text);
}

.fh-pill small {
  display: block;
  font-size: 10px;
  color: var(--fu-muted);
}

.fh-pill small.fh-blue {
  font-weight: 800;
  color: var(--fu-blue);
}

.fh-amber {
  color: var(--fu-amber) !important;
}

.fh-float {
  animation: fh-chip-float 5s ease-in-out infinite;
}

.fh-delay {
  animation-delay: 1.4s;
}

.fh-ball {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  color: #fff;
  font-size: 13px;
  font-weight: 900;
}

.fh-ball.is-sm {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 10px;
}

.fh-ball.k-next { background: #64748b99; }
.fh-ball.k-w { background: #f43f5e; }
.fh-ball.k-six { background: #f59e0b; }
.fh-ball.k-four { background: #1877f2; }
.fh-ball.k-dot { background: #64748b; }
.fh-ball.k-run { background: #10b981; }

.fh-pop {
  display: inline-grid;
  animation: fh-pop .45s cubic-bezier(.2, 1.4, .4, 1) both;
}

.fh-over {
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
}

.fh-over-title {
  font-size: 9px !important;
  font-weight: 800;
  letter-spacing: .16em;
}

.fh-over-balls {
  display: flex;
  gap: 6px;
}

.fh-dash {
  width: 24px;
  height: 24px;
  border: 1px dashed rgba(100, 116, 139, .55);
  border-radius: 50%;
}

.fh-need {
  display: block;
  min-width: 164px;
  border-color: rgba(245, 158, 11, .4);
}

.fh-need-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fh-need-row > span {
  font-size: 14px;
}

.fh-need-track {
  height: 6px;
  margin: 7px 0 5px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(100, 116, 139, .25);
}

.fh-need-track > div {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #fbbf24, #f43f5e);
  transition: width .7s;
}

/* marquee */

.fh-marquee {
  position: relative;
  margin-top: 22px;
  padding: 11px 0 0;
  overflow: hidden;
  border-top: 1px solid var(--fu-line);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.fh-marquee-track {
  display: flex;
  width: max-content;
  animation: fh-marquee 55s linear infinite;
}

.fh-marquee:hover .fh-marquee-track {
  animation-play-state: paused;
}

.fh-marquee-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 10px;
  padding: 7px 14px;
  border: 1px solid color-mix(in srgb, var(--item-color) 40%, var(--fu-line));
  border-radius: 999px;
  background: color-mix(in srgb, var(--item-color) 8%, var(--fu-petal));
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  transition: transform .2s, background .2s;
}

.fh-marquee-item:hover {
  transform: translateY(-2px) scale(1.05);
  background: color-mix(in srgb, var(--item-color) 22%, var(--fu-petal));
}

/* ================================================================
   FLOWER MENU LAYOUT
================================================================ */

.fu-dashboard {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 520px) minmax(0, 1fr);
  align-items: center;
  gap: 26px;
  scroll-margin-top: 12px;
}

.fu-wing {
  min-width: 0;
}

.fu-overline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 8px;
  line-height: 1.6;
  letter-spacing: .13em;
  font-weight: 850;
  color: var(--fu-muted);
}

.fu-overline i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 12px #22c55e66;
}

.fu-wing-left h2 {
  margin: 16px 0 12px;
  font-size: clamp(26px, 2.8vw, 37px);
  line-height: 1.45;
  font-weight: 900;
}

.fu-wing-left h2 span {
  color: #3b82f6;
}

.fu-wing p {
  margin: 0;
  font-size: 12px;
  line-height: 1.9;
  color: var(--fu-muted);
}

.fu-counts {
  display: flex;
  align-items: center;
  gap: 21px;
  margin: 24px 0;
}

.fu-counts div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fu-counts strong {
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1px;
}

.fu-counts div span {
  font-size: 10px;
  color: var(--fu-muted);
}

.fu-count-divider {
  width: 1px;
  height: 32px;
  background: var(--fu-line);
}

.fu-play-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #3b82f640;
  background: linear-gradient(135deg, #1877f2, #6254e9);
  color: white !important;
  padding: 12px 15px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 10px 28px -10px #1877f277;
  transition: transform .2s;
}

.fu-play-button:hover {
  transform: translateY(-3px);
}

.fu-console {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--fu-line);
  border-radius: 30px;
  background: var(--fu-panel);
  box-shadow: var(--fu-shadow);
  backdrop-filter: blur(18px);
}

.fu-console-top,
.fu-console-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 18px;
}

.fu-console-top {
  border-bottom: 1px solid var(--fu-line);
}

.fu-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  min-width: 0;
}

.fu-breadcrumb button {
  border: 0;
  padding: 2px 0;
  background: transparent;
  color: var(--fu-muted);
  font-size: 11px;
  font-weight: 850;
}

.fu-breadcrumb > span {
  color: var(--fu-muted);
  opacity: .5;
}

.fu-breadcrumb strong {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 750;
}

.fu-mode-label {
  color: var(--fu-muted);
  font-size: 7px;
  font-weight: 850;
  letter-spacing: .15em;
  white-space: nowrap;
}

.fu-menu-content {
  width: 100%;
  aspect-ratio: 1;
  position: relative;
}

.fu-flower {
  --pointer-x: 50%;
  --pointer-y: 50%;
  position: relative;
  width: 100%;
  height: 100%;
  isolation: isolate;
}

.fu-cursor-light {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(
      170px circle at var(--pointer-x) var(--pointer-y),
      color-mix(in srgb, var(--fu-accent) 10%, transparent),
      transparent 75%
    );
  pointer-events: none;
}

.fu-orbit {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.fu-orbit-outer {
  inset: 9%;
  border: 1px dashed var(--fu-line);
  animation: fu-spin 90s linear infinite;
}

.fu-orbit-inner {
  inset: 28%;
  border: 1px solid var(--fu-line);
  box-shadow: 0 0 35px color-mix(in srgb, var(--fu-accent) 6%, transparent);
}

.fu-orbit-runner {
  position: absolute;
  inset: 9%;
  border-radius: 50%;
  animation: fu-spin 17s linear infinite;
  pointer-events: none;
}

.fu-orbit-runner i {
  position: absolute;
  left: 50%;
  top: -3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--fu-accent);
  box-shadow: 0 0 12px var(--fu-accent);
}

.fu-connectors {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: var(--fu-accent);
  stroke-width: 1;
  opacity: .2;
  pointer-events: none;
}

.fu-connectors path {
  stroke-dasharray: 4 9;
  animation: fu-flow 6s linear infinite;
}

.fu-connectors circle {
  opacity: .35;
}

.fu-core {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 23%;
  aspect-ratio: 1;
  z-index: 4;
  padding: 6px;
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

.fu-core:active {
  transform: translate(-50%, -50%) scale(.94);
}

.fu-core-halo {
  position: absolute;
  inset: -4px;
  border: 2px solid transparent;
  border-top-color: var(--fu-accent);
  border-bottom-color: color-mix(in srgb, var(--fu-accent) 35%, transparent);
  border-radius: 50%;
  animation: fu-spin 9s linear infinite;
}

.fu-core-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 3px;
}

.fu-core img {
  display: block;
  width: 57%;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  filter: drop-shadow(0 3px 9px #3b82f635);
}

.fu-core-inner > span {
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .15em;
  color: var(--fu-muted);
}

.fu-logo-fallback {
  font-size: 29px;
  font-style: italic;
  color: #3b82f6;
}

.fu-petals {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.fu-petal-position {
  position: absolute;
  width: 28%;
  height: 23%;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  z-index: 2;
}

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
  gap: 6px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  padding: 9px 5px;
  border: 1px solid color-mix(in srgb, var(--item-color) 38%, var(--fu-line));
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--item-color) 13%, var(--fu-petal)),
      var(--fu-petal)
    );
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
  display: grid;
  place-items: center;
  font-size: clamp(23px, 2.3vw, 31px);
  line-height: 1;
  transition: transform .3s cubic-bezier(.2,1.5,.4,1);
}

.fu-petal strong {
  position: relative;
  font-size: 13px;
  font-weight: 850;
  line-height: 1.35;
  text-align: center;
}

.fu-petal small {
  position: relative;
  font-size: 9px;
  font-weight: 650;
  color: var(--fu-muted);
}

.fu-petal-shine {
  position: absolute;
  width: 45%;
  height: 180%;
  top: -40%;
  left: -80%;
  transform: rotate(25deg);
  background: linear-gradient(90deg, transparent, #ffffff16, transparent);
  transition: left .65s;
  pointer-events: none;
}

@media (hover: hover) {
  .fu-petal:hover {
    border-color: var(--item-color);
    box-shadow:
      0 0 25px -9px var(--item-color),
      inset 0 0 20px color-mix(in srgb, var(--item-color) 9%, transparent);
    filter: brightness(1.05);
  }

  .fu-petal:hover .fu-petal-icon {
    transform: translateY(-3px) rotate(-8deg) scale(1.12);
  }

  .fu-petal:hover .fu-petal-shine {
    left: 145%;
  }
}

.fu-petal:active .fu-petal-icon {
  transform: scale(.82);
}

.fu-petal:active {
  filter: brightness(1.16);
}

.fu-back-petal {
  border-style: dashed;
  background: var(--fu-panel);
  box-shadow: none;
}

.fu-back-petal .fu-petal-icon {
  width: 29px;
  height: 29px;
  border: 1px solid var(--fu-line);
  border-radius: 50%;
}

.fu-console-bottom {
  padding-top: 12px;
  padding-bottom: 12px;
  border-top: 1px solid var(--fu-line);
}

.fu-instruction {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--fu-muted);
  font-size: 10px;
  line-height: 1.5;
}

.fu-instruction > span {
  color: #3b82f6;
  font-size: 15px;
}

.fu-step {
  font-size: 8px;
  font-weight: 850;
  letter-spacing: .1em;
  color: var(--fu-muted);
  white-space: nowrap;
}

.fu-preview {
  animation: fu-preview-in .3s ease-out both;
}

.fu-preview-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 16px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--fu-accent) 30%, transparent);
  background: color-mix(in srgb, var(--fu-accent) 10%, transparent);
  color: var(--fu-accent);
  font-size: 27px;
}

.fu-preview h2 {
  margin: 9px 0;
  font-size: 23px;
  font-weight: 850;
  line-height: 1.5;
}

.fu-preview-list {
  display: grid;
  gap: 8px;
  margin-top: 17px;
}

.fu-preview-list > a,
.fu-preview-list > div {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 8px 9px;
  border: 1px solid var(--fu-line);
  border-radius: 11px;
  font-size: 10px;
  background: var(--fu-panel);
}

.fu-preview-list > a:hover {
  border-color: var(--fu-accent);
}

.fu-preview-list > a > span:last-child {
  margin-left: auto;
  color: var(--fu-muted);
}

.fu-preview-list > div > span {
  color: #3b82f6;
  font-weight: 850;
  font-size: 10px;
}

.fu-key-hint {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 20px;
  color: var(--fu-muted);
  font-size: 9px;
}

.fu-directory {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 15px;
  animation: fu-preview-in .25s ease-out;
}

.fu-search-field {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid #3b82f655;
  background: var(--fu-field);
  border-radius: 12px;
  color: var(--fu-muted);
}

.fu-search-field input {
  width: 100%;
  min-width: 0;
  padding: 5px 0;
  border: 0;
  background: transparent;
  color: var(--fu-text);
  font-size: 13px;
  outline: none;
}

.fu-search-field input::placeholder {
  color: var(--fu-muted);
  opacity: .8;
}

.fu-search-field button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 27px;
  height: 27px;
  padding: 0;
  border: 1px solid var(--fu-line);
  border-radius: 8px;
  background: var(--fu-panel);
  color: var(--fu-muted);
  font-size: 11px;
}

.fu-result-heading {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 1px 9px;
  font-size: 9px;
  color: var(--fu-muted);
}

.fu-results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: 7px;
  overflow-y: auto;
  padding: 3px;
  scrollbar-width: thin;
  scrollbar-color: #3b82f655 transparent;
}

.fu-result {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 50px;
  padding: 9px;
  background: var(--fu-field);
  border: 1px solid var(--fu-line);
  border-radius: 12px;
  transition: border-color .2s, background .2s;
}

.fu-result:hover {
  border-color: var(--item-color);
  background: color-mix(in srgb, var(--item-color) 9%, var(--fu-field));
}

.fu-result-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.fu-result-copy {
  min-width: 0;
}

.fu-result-copy strong {
  display: block;
  font-size: 11px;
  line-height: 1.5;
}

.fu-result-copy small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 8px;
  margin-top: 2px;
  color: var(--fu-muted);
}

.fu-result-arrow {
  margin-left: auto;
  color: var(--fu-muted);
  font-size: 12px;
}

.fu-directory-back {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: auto;
  padding: 10px 4px 0;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: var(--fu-muted);
  font-size: 11px !important;
}

.fu-empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 13px;
  margin: auto;
  padding: 15px;
  text-align: center;
}

.fu-empty > span {
  font-size: 30px;
}

.fu-empty strong {
  font-size: 13px;
}

.fu-empty button {
  padding: 7px 14px;
  border: 1px solid #3b82f655;
  border-radius: 9px;
  background: #3b82f612;
  color: var(--fu-text);
  font-size: 11px;
}

.fu-dock {
  display: none;
}

.fu-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 17px;
  padding-top: 11px;
  border-top: 1px solid var(--fu-line);
  color: var(--fu-muted);
  font-size: 8px;
  letter-spacing: .08em;
}

.fu-footer b {
  color: #3b82f6;
}

.fu-spark-layer {
  position: fixed;
  inset: 0;
  z-index: 80;
  pointer-events: none;
  overflow: hidden;
}

.fu-burst {
  position: absolute;
  width: 0;
  height: 0;
}

.fu-burst i {
  position: absolute;
  left: -2px;
  top: -2px;
  width: 4px;
  height: 7px;
  border-radius: 3px;
  background: var(--spark-color);
  box-shadow: 0 0 7px var(--spark-color);
  animation: fu-spark .65s cubic-bezier(.1,.6,.3,1) both;
}

.fu-spark-ring {
  position: absolute;
  left: -11px;
  top: -11px;
  width: 22px;
  height: 22px;
  border: 1px solid var(--spark-color);
  border-radius: 50%;
  animation: fu-ring .6s ease-out both;
}

.fu-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

/* ================================================================
   KEYFRAMES
================================================================ */

@keyframes fu-spin {
  to { transform: rotate(360deg); }
}

@keyframes fu-flow {
  to { stroke-dashoffset: -78; }
}

@keyframes fu-float {
  0%, 100% {
    transform: translate(0,0) rotate(var(--rotation, 15deg));
  }
  50% {
    transform: translate(15px,-20px) rotate(calc(var(--rotation, 15deg) + 12deg));
  }
}

@keyframes fu-bloom {
  from {
    opacity: 0;
    transform: translate(var(--from-x),var(--from-y)) scale(.38) rotate(-12deg);
  }
  to {
    opacity: 1;
    transform: translate(0,0) scale(1) rotate(0);
  }
}

@keyframes fu-preview-in {
  from { opacity: 0; transform: translateY(7px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fu-spark {
  0% {
    opacity: 1;
    transform: translate(0,0) rotate(var(--turn)) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx),var(--dy)) rotate(var(--turn)) scale(.1);
  }
}

@keyframes fu-ring {
  from { opacity: .8; transform: scale(.3); }
  to { opacity: 0; transform: scale(3.2); }
}

@keyframes fh-spin {
  to { transform: rotate(360deg); }
}

@keyframes fh-wd {
  from { opacity: 0; transform: translateY(46px) rotate(5deg); filter: blur(8px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}

@keyframes fh-gshift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes fh-color-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes fh-zoom-pulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(34,211,238,.5)); }
  50% { transform: scale(1.14); filter: drop-shadow(0 0 22px rgba(34,211,238,.9)); }
}

@keyframes fh-rot {
  0% { opacity: 0; transform: translateY(100%); }
  12%, 88% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-100%); }
}

@keyframes fh-pop {
  0% { transform: scale(.4); opacity: 0; }
  60% { transform: scale(1.18); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fh-chip-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}

@keyframes fh-shine {
  0% { transform: translateX(-130%) skewX(-15deg); }
  55%, 100% { transform: translateX(380%) skewX(-15deg); }
}

@keyframes fh-live-ring {
  0% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); }
  100% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
}

@keyframes fh-marquee {
  to { transform: translateX(-50%); }
}

/* ================================================================
   TABLET
================================================================ */

@media (min-width: 761px) and (max-width: 1050px) {
  .fu-shell {
    max-width: 900px;
    padding: 18px;
  }

  .fh-desk-grid {
    gap: 24px;
  }

  .fh-stage {
    height: 300px;
  }

  .fh-c1, .fh-c3 { left: -10px; }
  .fh-c2, .fh-c4 { right: -8px; }

  .fu-dashboard {
    grid-template-columns: minmax(0, 1fr) minmax(0, 480px);
    gap: 28px;
  }

  .fu-wing-right {
    display: none;
  }
}

/* ================================================================
   MOBILE APP LAYOUT
================================================================ */

@media (max-width: 760px) {
  .fu-shell {
    max-width: 460px;
    padding: 13px 12px max(12px, env(safe-area-inset-bottom));
  }

  .fu-header {
    margin-bottom: 12px;
    gap: 8px;
  }

  .fu-brand {
    gap: 8px;
  }

  .fu-brand-mark {
    width: 34px;
    height: 34px;
    border-radius: 11px;
    font-size: 21px;
  }

  .fu-eyebrow {
    font-size: 6px;
    letter-spacing: .1em;
  }

  .fu-brand h1 {
    font-size: 21px;
    letter-spacing: -.7px;
  }

  .fu-header-actions {
    gap: 7px;
  }

  .fu-language {
    font-size: 10px;
  }

  .fu-search-trigger {
    min-height: 35px;
    padding: 8px 9px;
    gap: 5px;
    border-radius: 11px;
  }

  .fu-search-trigger span,
  .fu-search-trigger kbd {
    display: none;
  }

  .fh-desk {
    display: none;
  }

  .fh-mob {
    display: block;
    margin-bottom: 14px;
  }

  .fh-badge {
    padding: 6px 11px;
    font-size: 8px;
    letter-spacing: .2em;
  }

  .fh-title {
    margin-top: 12px;
    font-size: 30px;
  }

  .fh-mob-art {
    position: relative;
    margin-top: 14px;
  }

  .fh-mob-art .fh-ring {
    height: auto;
  }

  .fh-mob-art .fh-ring-in {
    padding: 0;
  }

  .fh-mob-art .fh-ring-in img {
    height: 175px;
    object-fit: cover;
  }

  .fh-mlive {
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 8px;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 11px;
    border: 1px solid var(--fu-line);
    border-radius: 16px;
    background: var(--fu-pill);
    backdrop-filter: blur(14px);
  }

  .fh-mlive-copy {
    min-width: 0;
    flex: 1;
  }

  .fh-mlive-copy b {
    display: block;
    font-size: 10px;
    font-weight: 900;
    line-height: 1.2;
    color: var(--fu-text);
  }

  .fh-mlive-copy small {
    display: block;
    margin-top: 2px;
    font-size: 9px;
    font-weight: 800;
  }

  .fh-mob-actions {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 9px;
    margin-top: 12px;
  }

  .fh-mob-actions .fh-btn-primary,
  .fh-mob-actions .fh-btn-play {
    padding: 12px 10px;
    font-size: 13px;
  }

  .fu-dashboard {
    display: block;
  }

  .fu-wing {
    display: none;
  }

  .fu-console {
    border-radius: 24px;
  }

  .fu-console-top {
    padding: 12px 13px;
  }

  .fu-console-bottom {
    padding: 10px 12px;
  }

  .fu-breadcrumb {
    font-size: 10px;
  }

  .fu-mode-label {
    font-size: 6px;
    letter-spacing: .12em;
  }

  .fu-petal {
    gap: 5px;
    padding: 7px 3px;
  }

  .fu-petal strong {
    font-size: clamp(10px, 3vw, 12px);
    line-height: 1.35;
  }

  .fu-petal small {
    font-size: 7px;
  }

  .fu-petal-icon {
    font-size: clamp(23px, 6.3vw, 28px);
  }

  .fu-core {
    padding: 4px;
  }

  .fu-core-inner {
    gap: 2px;
  }

  .fu-core-inner > span {
    font-size: 6px;
  }

  .fu-logo-fallback {
    font-size: 22px;
  }

  .fu-instruction {
    font-size: 8px;
    gap: 4px;
  }

  .fu-instruction > span {
    font-size: 12px;
  }

  .fu-step {
    font-size: 7px;
  }

  .fu-dock {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
    margin-top: 12px;
    padding: 6px;
    border: 1px solid var(--fu-line);
    border-radius: 18px;
    background: var(--fu-panel);
  }

  .fu-dock button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 0;
    min-height: 51px;
    border: 1px solid transparent;
    border-radius: 13px;
    background: transparent;
    color: var(--fu-muted);
    transition: background .2s, border-color .2s;
  }

  .fu-dock button > span:first-child {
    font-size: 19px;
    line-height: 1;
  }

  .fu-dock button > span:last-child {
    font-size: 9px;
    font-weight: 750;
  }

  .fu-dock button.is-active {
    border-color: color-mix(in srgb, var(--item-color) 35%, transparent);
    background: color-mix(in srgb, var(--item-color) 10%, transparent);
    color: var(--fu-text);
  }

  .fu-footer {
    justify-content: center;
    margin-top: 11px;
    padding-top: 10px;
    font-size: 7px;
  }

  .fu-footer-desktop {
    display: none;
  }

  .fu-directory {
    padding: 10px;
  }

  .fu-search-field {
    padding: 5px 8px;
  }

  .fu-search-field input {
    font-size: 16px;
  }

  .fu-result-heading {
    padding: 9px 2px 5px;
    font-size: 8px;
  }

  .fu-results {
    gap: 5px;
  }

  .fu-result {
    gap: 6px;
    min-height: 43px;
    padding: 7px;
    border-radius: 10px;
  }

  .fu-result-icon {
    font-size: 18px;
  }

  .fu-result-copy strong {
    font-size: 10px;
  }

  .fu-result-copy small {
    font-size: 7px;
    margin-top: 1px;
  }

  .fu-result-arrow {
    display: none;
  }

  .fu-directory-back {
    font-size: 9px !important;
    padding-top: 7px;
  }

  .fu-square-a {
    width: 80px;
    height: 80px;
    left: -20px;
  }

  .fu-square-b {
    width: 100px;
    height: 100px;
    right: -30px;
  }

  .fu-square-c {
    display: none;
  }
}

@media (max-width: 350px) {
  .fu-shell {
    padding-left: 8px;
    padding-right: 8px;
  }

  .fu-language {
    display: none;
  }

  .fh-title {
    font-size: 26px;
  }

  .fu-petal strong {
    font-size: 9px;
  }

  .fu-petal small {
    font-size: 6px;
  }

  .fu-petal-icon {
    font-size: 21px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fcl-universe *,
  .fcl-universe *::before,
  .fcl-universe *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }

  .fh-wd,
  .fh-grad {
    opacity: 1 !important;
  }

  .fu-spark-layer {
    display: none;
  }
}
`;