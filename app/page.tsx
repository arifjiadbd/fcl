"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Theme detection (unchanged logic)                                  */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Scroll reveal                                                      */
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
/*  Data                                                               */
/* ------------------------------------------------------------------ */
type Cat = "stats" | "stories" | "fun";
type Portal = {
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

const PORTALS: Portal[] = [
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

/* ------------------------------------------------------------------ */
/*  Live match simulation (decorative)                                 */
/* ------------------------------------------------------------------ */
type Ball = number | "W";
const BALLS: Ball[] = [1, 4, 6, 0, 2, "W", 4, 1, 6, 0, 1, 2, 6, 4, 0, 1, 6, "W", 2, 4, 6, 1, 6, 4];
const START_RUNS = 14;
const START_WKTS = 2;
const TARGET = 70;
const WIN_BALL = (() => {
  let r = START_RUNS;
  for (let k = 0; k < BALLS.length; k++) {
    const b = BALLS[k];
    if (typeof b === "number") r += b;
    if (r >= TARGET) return k + 1;
  }
  return BALLS.length;
})();
const CYCLE = WIN_BALL + 3;

function useMatchSim() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => s + 1), 1500);
    return () => clearInterval(id);
  }, []);
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
  if (v === undefined) return { t: "·", label: "NEXT BALL", cls: "bg-slate-500/50 text-white" };
  if (v === "W") return { t: "W", label: "OUT!", cls: "bg-rose-500 text-white" };
  if (v === 6) return { t: "6", label: "SIX!", cls: "bg-amber-500 text-white" };
  if (v === 4) return { t: "4", label: "FOUR!", cls: "bg-[#1877F2] text-white" };
  if (v === 0) return { t: "•", label: "DOT BALL", cls: "bg-slate-500 text-white" };
  return { t: String(v), label: `${v} RUN${v > 1 ? "S" : ""}`, cls: "bg-emerald-500 text-white" };
}

/* ------------------------------------------------------------------ */
/*  FX canvas — sparks on tap/click, mouse aura + trail, embers        */
/* ------------------------------------------------------------------ */
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

      /* mouse aura */
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

      /* embers */
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

      /* rings */
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

      /* sparks */
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

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */
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

/** Link that lets the spark burst play for a moment before navigating */
function SparkLink({
  href,
  children,
  ...rest
}: { href: string; children: React.ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const router = useRouter();
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
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

function Magnetic({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
        <span key={i} className={`fcl-wd ${className}`} style={{ "--i": base + i } as React.CSSProperties}>
          {w}
          {"\u00A0"}
        </span>
      ))}
    </>
  );
}

function Rotator({ small = false }: { small?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ROT_WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);
  const w = ROT_WORDS[i];
  return (
    <div className={`mt-4 flex items-center gap-2 font-black ${small ? "text-[15px]" : "text-xl"}`}>
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

/* ------------------------------------------------------------------ */
/*  Preloader                                                          */
/* ------------------------------------------------------------------ */
function Preloader({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [pct, setPct] = useState(0);
  const finishRef = useRef(onFinish);
  const doneRef = useRef(false);

  useEffect(() => {
    finishRef.current = onFinish;
  });

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    finishRef.current();
  }, []);

  useEffect(() => {
    const DURATION = 3200;
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
    };
  }, [finish]);

  const skip = () => {
    setFadeOut(true);
    setTimeout(finish, 350);
  };

  return (
    <div
      onClick={skip}
      className={`fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#020617] transition-opacity duration-500 ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="pl-grid absolute inset-0" />
      <div className="absolute h-72 w-72 rounded-full bg-blue-600/25 blur-[110px]" />
      <div className="absolute -right-10 top-10 h-52 w-52 rounded-full bg-purple-600/20 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="pl-ring" />
          <div className="pl-orbit">
            <i />
          </div>
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-blue-500/30 bg-[#0b1220] shadow-[0_0_40px_rgba(37,99,235,0.45)]">
            <img
              src="/fcl-logo.png"
              alt="FCL Logo"
              className="fcl-logo-float h-16 w-16 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]"
            />
          </div>
        </div>

        <h2 className="mt-8 flex text-2xl font-black tracking-[0.2em] text-white">
          {"FCL CRICKET".split("").map((ch, i) => (
            <span
              key={i}
              className={`fcl-letter ${i >= 4 ? "text-amber-400" : ""}`}
              style={{ "--i": i } as React.CSSProperties}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h2>
        <p className="mt-1 text-[11px] font-semibold tracking-widest text-slate-400">LOADING EXPERIENCE</p>

        <div className="mt-6 h-1.5 w-52 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="mt-2 text-xs font-black tabular-nums text-slate-300">{pct}%</span>
        <span className="mt-4 text-[10px] font-semibold text-slate-600">Tap anywhere to skip</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero art (desktop) — 3D tilt + live chips                          */
/* ------------------------------------------------------------------ */
function HeroArt() {
  const tiltRef = useRef<HTMLDivElement>(null);
  const sim = useMatchSim();
  const meta = ballMeta(sim.last);

  return (
    <div
      className="hero-stage relative h-[400px] w-full sm:h-[440px] lg:h-[500px]"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !tiltRef.current) return;
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
      <div ref={tiltRef} className="hero-tilt absolute inset-0">
        <div className="fcl-ring h-full w-full">
          <div className="fcl-ring-in flex h-full w-full items-center justify-center p-4">
            <img src="/fcl-room.png" alt="FCL Room" className="h-full w-full object-contain object-center" />
          </div>
        </div>

        {/* live score */}
        <div className="z1 absolute -left-3 top-8 sm:-left-6">
          <div className="fcl-chip fcl-pill fcl-pill-line flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 backdrop-blur-xl">
            <span className="fcl-live h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
            <div>
              <span className="fcl-head block text-xs font-bold">FCL LIVE</span>
              <span className="fcl-blue1 text-[11px] font-bold">
                Phoenix ·{" "}
                <span key={sim.runs} className="fcl-pop inline-block">
                  {sim.runs}/{sim.wkts}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* last ball */}
        <div className="z2 absolute -right-3 top-24 sm:-right-5 sm:top-32">
          <div className="fcl-chip fcl-chip-delay fcl-pill fcl-pill-line flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 backdrop-blur-xl">
            <span
              key={sim.i}
              className={`fcl-pop flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black ${meta.cls}`}
            >
              {meta.t}
            </span>
            <div>
              <span className="fcl-head block text-xs font-black tracking-wider">{meta.label}</span>
              <span className="fcl-pill-sub text-[10px]">Ball {sim.i}</span>
            </div>
          </div>
        </div>

        {/* this over */}
        <div className="z2 absolute -left-3 bottom-20 sm:-left-6">
          <div className="fcl-chip fcl-pill fcl-pill-line rounded-2xl border px-4 py-2.5 backdrop-blur-xl">
            <span className="fcl-pill-sub mb-1.5 block text-[9px] font-bold uppercase tracking-widest">This over</span>
            <div className="flex gap-1.5">
              {Array.from({ length: 6 }).map((_, k) => {
                const v = sim.recent[k];
                const m = ballMeta(v);
                return v === undefined ? (
                  <span key={k} className="h-6 w-6 rounded-full border border-dashed border-slate-500/50" />
                ) : (
                  <span
                    key={`${sim.i}-${k}`}
                    className={`fcl-pop flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${m.cls}`}
                  >
                    {m.t}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* need */}
        <div className="z1 absolute -right-3 bottom-6 sm:-right-4 sm:bottom-8">
          <div className="fcl-chip fcl-chip-delay fcl-pill min-w-[160px] rounded-2xl border border-amber-500/40 px-4 py-2.5 backdrop-blur-xl">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{sim.won ? "🏆" : "🎯"}</span>
              <span className="fcl-amber text-xs font-bold">
                {sim.won ? "Phoenix won!" : `Need ${sim.need} off ${sim.left}`}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-500/25">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-700"
                style={{ width: `${sim.pct}%` }}
              />
            </div>
            <span className="fcl-pill-sub mt-1 block text-[10px] font-semibold">Target {TARGET}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileLive() {
  const sim = useMatchSim();
  const meta = ballMeta(sim.last);
  return (
    <div className="fcl-pill fcl-pill-line absolute inset-x-2 bottom-2 z-10 flex items-center gap-2.5 rounded-2xl border px-3 py-2 backdrop-blur-xl">
      <span className="fcl-live h-2 w-2 shrink-0 rounded-full bg-[#22c55e]" />
      <div className="min-w-0">
        <span className="fcl-head block text-[10px] font-black leading-none">
          FCL LIVE · Phoenix{" "}
          <span key={sim.runs} className="fcl-pop inline-block">
            {sim.runs}/{sim.wkts}
          </span>
        </span>
        <span className="fcl-amber mt-0.5 block text-[9px] font-bold">
          {sim.won ? "🏆 Phoenix won!" : `🎯 Need ${sim.need} off ${sim.left}`}
        </span>
      </div>
      <span
        key={sim.i}
        className={`fcl-pop ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-black ${meta.cls}`}
      >
        {meta.t}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop portal card (bento)                                        */
/* ------------------------------------------------------------------ */
function PortalCard({ p, index, forceStd }: { p: Portal; index: number; forceStd: boolean }) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.08);
  const size = forceStd ? "std" : p.size ?? "std";

  const span =
    size === "xl" ? "sm:col-span-2 sm:row-span-2" : size === "wide" ? "sm:col-span-2" : "";

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
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
  const onLeave = (e: React.PointerEvent<HTMLAnchorElement>) => {
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
        style={{ "--c": p.color } as React.CSSProperties}
      >
        {size === "xl" && <div className="pc-orbit" aria-hidden><i /></div>}
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

/* ------------------------------------------------------------------ */
/*  Mobile: carousel + tiles                                           */
/* ------------------------------------------------------------------ */
function MobileCarousel({ items }: { items: Portal[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stepOf = () => {
      const card = el.firstElementChild as HTMLElement | null;
      return card && card.offsetWidth ? card.offsetWidth + 12 : 0;
    };
    const onScroll = () => {
      const s = stepOf();
      if (s) setActive(Math.round(el.scrollLeft / s));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const id = setInterval(() => {
      if (paused.current) return;
      const s = stepOf();
      if (!s) return;
      const cur = Math.round(el.scrollLeft / s);
      el.scrollTo({ left: ((cur + 1) % items.length) * s, behavior: "smooth" });
    }, 3800);
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearInterval(id);
    };
  }, [items.length]);

  return (
    <div>
      <div
        ref={ref}
        className="no-sb -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
        onTouchStart={() => {
          paused.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            paused.current = false;
          }, 5000);
        }}
      >
        {items.map((p) => (
          <SparkLink
            key={p.href}
            href={p.href}
            data-spark={p.color}
            className="mc w-[82%] shrink-0 snap-center"
            style={{ "--c": p.color } as React.CSSProperties}
          >
            <span className="mc-shine" />
            <div className="relative flex items-start justify-between">
              <span className="pc-badge fcl-ink">
                {p.badgeIcon} {p.badgeText}
              </span>
              <span className="mc-ico">{p.cornerIcon}</span>
            </div>
            <h4 className="fcl-head relative mt-5 text-[22px] font-black leading-tight">{p.title}</h4>
            <p className="fcl-body relative mt-1.5 line-clamp-2 text-[11px] leading-4">{p.description}</p>
            <span className="fcl-ink relative mt-3 inline-flex items-center gap-1.5 text-[11px] font-black">
              {p.footerText} <span className="mc-arrow">→</span>
            </span>
          </SparkLink>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {items.map((p, k) => (
          <span
            key={p.href}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: active === k ? 22 : 6,
              background: active === k ? p.color : "var(--line)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MobileTile({ p, index }: { p: Portal; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.05);
  return (
    <div
      ref={ref}
      className="transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(18px) scale(.94)",
        transitionDelay: `${(index % 2) * 60}ms`,
      }}
    >
      <SparkLink
        href={p.href}
        data-spark={p.color}
        className="mt-tile"
        style={{ "--c": p.color } as React.CSSProperties}
      >
        <div className="flex items-start justify-between">
          <span className="mt-ico">{p.badgeIcon}</span>
          <span className="fcl-ink text-base font-black">→</span>
        </div>
        <div className="mt-4">
          <h4 className="fcl-head text-[14px] font-black leading-tight">{p.title}</h4>
          <span className="fcl-ink mt-1 block text-[8px] font-black uppercase tracking-wider">{p.badgeText}</span>
        </div>
      </SparkLink>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Cat>("all");
  const isDark = useIsDark();

  useEffect(() => {
    try {
      if (sessionStorage.getItem("fcl_visited")) setLoading(false);
    } catch {}
  }, []);

  const handlePreloadFinish = useCallback(() => {
    try {
      sessionStorage.setItem("fcl_visited", "true");
    } catch {}
    setLoading(false);
  }, []);

  const sectionHead = useReveal<HTMLDivElement>(0.2);

  const list = filter === "all" ? PORTALS : PORTALS.filter((p) => p.cat === filter);
  const featured = PORTALS.filter((p) => p.featured);
  const counts: Record<string, number> = {
    all: PORTALS.length,
    stats: PORTALS.filter((p) => p.cat === "stats").length,
    stories: PORTALS.filter((p) => p.cat === "stories").length,
    fun: PORTALS.filter((p) => p.cat === "fun").length,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HOME_STYLES }} />
      <FxCanvas isDark={isDark} />
      <ScrollBar />
      {loading && <Preloader onFinish={handlePreloadFinish} />}

      <main
        className={`fcl-root ${isDark ? "fcl-dark" : "fcl-light"} min-h-screen pb-20 font-sans selection:bg-[#1877F2]/30 sm:pb-0 ${
          loading ? "hidden" : "block"
        }`}
      >
        {/* ================================================================
            DESKTOP HERO
            ================================================================ */}
        <section
          className="fcl-hero relative hidden overflow-hidden border-b sm:block"
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
                <div className="fcl-wd mb-6 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-4 py-2 backdrop-blur-xl" style={{ "--i": 0 } as React.CSSProperties}>
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
                    One Game. One Community. <span className="fcl-zoom-text text-[1.45em] font-black tracking-[-0.04em]">FCL.</span>
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
                      style={{ "--c": p.color } as React.CSSProperties}
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

        {/* ================================================================
            MOBILE HOME (app style)
            ================================================================ */}
        <section className="fcl-hero relative overflow-hidden border-b px-4 pb-5 pt-5 sm:hidden">
          <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-[90px]" />
          <div className="pointer-events-none absolute -left-28 bottom-0 h-64 w-64 rounded-full bg-purple-500/10 blur-[90px]" />
          <div className="sq sq-1" />
          <div className="sq sq-2" />

          <div className="relative">
            <div className="fcl-wd inline-flex items-center gap-1.5 rounded-full border border-[#1877F2]/30 bg-[#1877F2]/10 px-3 py-1.5" style={{ "--i": 0 } as React.CSSProperties}>
              <span className="fcl-live h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              <span className="fcl-blue1 text-[8px] font-black uppercase tracking-[0.25em]">FCL Digital Hub</span>
            </div>
            <h2 className="fcl-head mt-3 text-[30px] font-black leading-[1] tracking-[-0.045em]">
              <span className="block">
                <Words text="THE GAME LIVES" base={1} />
              </span>
              <span className="block">
                <Words text="BEYOND THE FIELD." base={4} className="fcl-grad" />
              </span>
            </h2>
            <Rotator small />

            <div className="relative mt-4">
              <div className="fcl-ring" style={{ "--rr": "22px" } as React.CSSProperties}>
                <div className="fcl-ring-in">
                  <img src="/fcl-room.png" alt="FCL Online" className="h-[210px] w-full object-cover object-center" />
                </div>
              </div>
              <MobileLive />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <SparkLink href="/play" data-spark="#22c55e" className="btn-play justify-center !px-3 !py-3 text-[13px]">
                <span className="fcl-live h-2 w-2 rounded-full bg-[#22c55e]" />
                🎮 Play Now
              </SparkLink>
              <SparkLink href="/bn" data-spark="#3b82f6" className="btn-ghost justify-center !px-3 !py-3 text-[13px]">
                💙 বাংলা ভার্সন
              </SparkLink>
            </div>
          </div>
        </section>

        {/* ================================================================
            DESKTOP PORTALS (bento)
            ================================================================ */}
        <section id="gateways" className="fcl-section relative hidden scroll-mt-20 overflow-hidden px-6 py-14 sm:block">
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
                <span className="fcl-eyebrow text-[11px] font-bold uppercase tracking-[0.35em]">FCL Navigation Portals</span>
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

        {/* ================================================================
            MOBILE PORTALS
            ================================================================ */}
        <section className="fcl-section relative overflow-hidden px-4 pb-8 pt-5 sm:hidden">
          <div className="mb-3 flex items-end justify-between px-0.5">
            <div>
              <span className="fcl-eyebrow text-[8px] font-black uppercase tracking-[0.28em]">Featured</span>
              <h3 className="fcl-head mt-0.5 text-[20px] font-black tracking-tight">Jump right in</h3>
            </div>
            <span className="fcl-muted text-[9px] font-semibold">Swipe →</span>
          </div>
          <MobileCarousel items={featured} />

          <div className="mb-3 mt-7 px-0.5">
            <span className="fcl-eyebrow text-[8px] font-black uppercase tracking-[0.28em]">All Portals</span>
            <h3 className="fcl-head mt-0.5 text-[20px] font-black tracking-tight">Choose Your Destination</h3>
          </div>
          <div className="-mx-4 mb-3 px-4">
            <FilterChips value={filter} onChange={setFilter} counts={counts} />
          </div>

          <div key={filter} className="grid grid-cols-2 gap-2.5">
            {list.map((p, i) => (
              <MobileTile key={p.href} p={p} index={i} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const HOME_STYLES = `
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
@keyframes fcl-pop {
  0% { transform: scale(.4); opacity: 0; }
  60% { transform: scale(1.18); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
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
@keyframes fcl-letter { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes fcl-logo-float { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-5px) scale(1.06); } }
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

/* ============ HERO ART ============ */
.hero-stage { perspective: 1100px; }
.hero-tilt {
  transform-style: preserve-3d;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform .25s ease-out;
}
.z1 { transform: translateZ(46px); }
.z2 { transform: translateZ(76px); }
.fcl-ring {
  position: relative;
  overflow: hidden;
  border-radius: var(--rr, 2.5rem);
  padding: 2px;
  box-shadow: var(--frame-shadow);
}
.fcl-ring::before {
  content: "";
  position: absolute;
  left: 50%; top: 50%;
  width: 220%;
  aspect-ratio: 1;
  translate: -50% -50%;
  background: conic-gradient(from 0deg, transparent 0 55%, #1877F2, #22d3ee, #a855f7, transparent 100%);
  animation: fcl-spin 6s linear infinite;
}
.fcl-ring-in {
  position: relative;
  overflow: hidden;
  border-radius: calc(var(--rr, 2.5rem) - 2px);
  background: var(--frame-bg);
}
.fcl-chip { animation: chip-float 5s ease-in-out infinite; }
.fcl-chip-delay { animation-delay: 1.4s; }
.fcl-pop { animation: fcl-pop .45s cubic-bezier(.2,1.4,.4,1) both; }
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

/* ============ DESKTOP PORTAL CARD ============ */
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

/* ============ MOBILE ============ */
.mc {
  position: relative; display: block; overflow: hidden; padding: 16px; border-radius: 24px; min-height: 176px;
  border: 1px solid color-mix(in srgb, var(--c) 45%, var(--line));
  background: linear-gradient(150deg, color-mix(in srgb, var(--c) 24%, var(--card-a)), var(--card-b));
  box-shadow: var(--card-shadow);
  transition: transform .2s;
}
.mc:active { transform: scale(.97); }
.mc-shine { position: absolute; inset: 0 auto 0 0; width: 35%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent); animation: fcl-shine 4.5s ease-in-out infinite; }
.mc-ico { font-size: 34px; animation: fcl-icon-float 4s ease-in-out infinite; }
.mc-arrow { display: inline-block; animation: chip-float 1.6s ease-in-out infinite; transform: rotate(-90deg); }
.mt-tile {
  display: block; min-height: 118px; padding: 13px; border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--c) 38%, var(--line));
  background: linear-gradient(160deg, color-mix(in srgb, var(--c) 9%, var(--card-a)), var(--card-b));
  box-shadow: var(--card-shadow);
  transition: transform .18s cubic-bezier(.2,.8,.2,1), background .2s;
}
.mt-tile:active { transform: scale(.94); background: color-mix(in srgb, var(--c) 20%, var(--card-a)); }
.mt-ico {
  display: grid; place-items: center; width: 42px; height: 42px; border-radius: 14px; font-size: 21px;
  background: color-mix(in srgb, var(--c) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
}

/* ============ PRELOADER ============ */
.pl-grid {
  background-image:
    linear-gradient(to right, rgba(148,163,184,.07) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148,163,184,.07) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(circle at center, #000 20%, transparent 70%);
  mask-image: radial-gradient(circle at center, #000 20%, transparent 70%);
}
.pl-ring {
  position: absolute; inset: -8px; border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, #1877F2, #22d3ee, #f59e0b, transparent);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  animation: fcl-spin 1.6s linear infinite;
}
.pl-orbit { position: absolute; inset: -24px; animation: fcl-spin 2.4s linear infinite; }
.pl-orbit i { position: absolute; top: -4px; left: 50%; width: 9px; height: 9px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 14px #f59e0b; }
.fcl-logo-float { animation: fcl-logo-float 2.2s ease-in-out infinite; }
.fcl-letter { display: inline-block; opacity: 0; animation: fcl-letter .5s ease-out both; animation-delay: calc(var(--i, 0) * 70ms + 200ms); }

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
