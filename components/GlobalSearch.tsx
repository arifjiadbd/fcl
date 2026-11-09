"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import PlayerCardModal from "@/components/PlayerCardModal";

/* =========================================================
   FCL GLOBAL SEARCH (Navbar)
========================================================= */

type Kind =
  | "player"
  | "match"
  | "story"
  | "thriller"
  | "extra"
  | "tour"
  | "page";

interface Entry {
  key: string;
  kind: Kind;
  title: string;
  sub: string;
  icon: string;
  photo?: string;
  href: string;
  tNorm: string;
  bNorm: string;
  words: string[];
  boost: number;
  full: string;
  links: string[];
  locate: string;
  category?: string;
  seriesName?: string;
  epNo?: number;
  rawPlayer?: any;
}

interface Hit {
  entry: Entry;
  score: number;
}

const PLACEHOLDER = "/FCL Cricket Avatar Placeholder.jpg";

const POPUP_DELAY_MS = 2500;
const LOCATE_KINDS: Kind[] = ["thriller", "extra", "tour"];

function needsLocate(e: Entry): boolean {
  return LOCATE_KINDS.includes(e.kind);
}

const KIND_PAGE: Record<Kind, { href: string; label: string }> = {
  player: { href: "/players", label: "🏏 সব প্লেয়ার" },
  match: { href: "/matches", label: "🏟️ সব ম্যাচ" },
  story: { href: "/memories", label: "🎞️ স্মৃতি ও সাহিত্য সংগ্রহ" },
  thriller: { href: "/thrillers", label: "⚡ সব হাই ভোল্টেজ ম্যাচ" },
  extra: { href: "/extraordinary", label: "💎 সব অসাধারণ নৈপুণ্য" },
  tour: { href: "/records", label: "🏆 রেকর্ডবুক" },
  page: { href: "/", label: "হোম" },
};

const KIND_LABEL: Record<Kind, string> = {
  player: "প্লেয়ার",
  match: "ম্যাচ",
  story: "গল্প",
  thriller: "হাই ভোল্টেজ",
  extra: "অসাধারণ",
  tour: "টুর্নামেন্ট",
  page: "পেইজ",
};

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

function norm(input: unknown): string {
  return String(input ?? "")
    .toLowerCase()
    .replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
    .replace(/[*_#]/g, "")
    .replace(/(^|\s)(versus|vs\.?|v)(?=\s|$)|বনাম|ভার্সেস/gi, " ")
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function edit(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 3;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : Math.min(prev, row[j], row[j - 1]) + 1;
      prev = tmp;
    }
  }
  return row[b.length];
}

function near(word: string, token: string): boolean {
  if (token.length < 4) return false;
  return edit(word, token) <= (token.length >= 7 ? 2 : 1);
}

const GENERIC: Record<string, Kind> = {
  গল্প: "story",
  গল্পের: "story",
  story: "story",
  সিরিজ: "story",
  ম্যাচ: "match",
  match: "match",
  প্লেয়ার: "player",
  player: "player",
  খেলোয়াড়: "player",
  কার্ড: "player",
  card: "player",
  টুর্নামেন্ট: "tour",
  tournament: "tour",
  পারফরম্যান্স: "extra",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function shortDate(val: unknown): string {
  if (!val) return "";
  const n = Number(val);
  if (Number.isFinite(n) && n > 20000 && n < 60000) {
    const d = new Date(Math.floor(n - 25569) * 86400 * 1000);
    return `${String(d.getUTCDate()).padStart(2, "0")} ${
      MONTHS[d.getUTCMonth()]
    } ${d.getUTCFullYear()}`;
  }
  const s = String(val).trim();
  const t = Date.parse(s);
  if (Number.isFinite(t) && /\d{4}/.test(s)) {
    const d = new Date(t);
    return `${String(d.getUTCDate()).padStart(2, "0")} ${
      MONTHS[d.getUTCMonth()]
    } ${d.getUTCFullYear()}`;
  }
  return s;
}

function photoPath(raw?: string): string {
  if (!raw || raw.trim() === "" || raw === "—") return PLACEHOLDER;
  if (/^(\/|https?:|data:)/.test(raw)) return raw;
  return `/players/${raw}`;
}

const URL_RE = /(https?:\/\/[^\s<>"')\]]+)/g;

function cleanUrl(u: string): string {
  return u.replace(/[.,;:!?।]+$/, "");
}

function extractLinks(raw: any, bodyText: string): string[] {
  const found = new Set<string>();
  const scan = (s: string) => {
    const m = s.match(URL_RE);
    if (m) m.forEach((u) => found.add(cleanUrl(u)));
  };
  if (raw && typeof raw === "object") {
    Object.values(raw).forEach((v) => {
      if (typeof v === "string") scan(v);
    });
  }
  scan(bodyText);
  return Array.from(found);
}

function linkLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (/facebook\.com|fb\.com|fb\.watch/.test(host)) return "ফেসবুক পোস্ট";
    if (/youtube\.com|youtu\.be/.test(host)) return "ইউটিউব ভিডিও";
    return host;
  } catch {
    return "লিঙ্ক";
  }
}

function renderWithLinks(text: string, linkClass: string) {
  const parts = text.split(URL_RE);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      const url = cleanUrl(part);
      const tail = part.slice(url.length);
      return (
        <span key={i}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`break-all underline ${linkClass}`}
          >
            {url}
          </a>
          {tail}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function findNodeByText(keys: string[]): HTMLElement | null {
  for (const key of keys) {
    if (!key) continue;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent || "";
      if (text.length < 2) continue;
      const el = node.parentElement;
      if (!el) continue;
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT)$/.test(el.tagName)) continue;
      if (el.closest("[data-fcl-search], nav, header")) continue;
      if (!norm(text).includes(key)) continue;
      if (el.getClientRects().length === 0) continue;
      return el;
    }
  }
  return null;
}

function findClickable(el: HTMLElement): HTMLElement {
  let cur: HTMLElement | null = el;
  for (let i = 0; i < 10 && cur && cur !== document.body; i++) {
    if (
      cur.tagName === "BUTTON" ||
      cur.tagName === "A" ||
      cur.getAttribute("role") === "button" ||
      window.getComputedStyle(cur).cursor === "pointer"
    ) {
      return cur;
    }
    cur = cur.parentElement;
  }
  return el;
}

function highlight(el: HTMLElement) {
  const prevOutline = el.style.outline;
  const prevOffset = el.style.outlineOffset;
  const prevTransition = el.style.transition;
  el.style.transition = "outline-color 0.3s";
  el.style.outline = "3px solid #facc15";
  el.style.outlineOffset = "3px";
  setTimeout(() => {
    el.style.outline = prevOutline;
    el.style.outlineOffset = prevOffset;
    el.style.transition = prevTransition;
  }, 2500);
}

function findTab(label: string): HTMLElement | null {
  const key = norm(label);
  if (!key) return null;
  const nodes = document.querySelectorAll<HTMLElement>(
    "button, [role='tab'], [role='button'], a"
  );
  for (const el of Array.from(nodes)) {
    if (el.closest("[data-fcl-search], nav, header")) continue;
    if (el.getClientRects().length === 0) continue;
    const t = norm(el.textContent || "");
    if (t.includes(key) && t.length <= key.length + 10) return el;
  }
  return null;
}

const PAGES: { href: string; title: string; en: string; icon: string }[] = [
  { href: "/rankings", title: "র‍্যাঙ্কিং ও MVP", en: "Rankings Leaderboard MVP", icon: "👑" },
  { href: "/records", title: "রেকর্ডবুক", en: "Records Hall of Fame", icon: "🏆" },
  { href: "/players", title: "প্লেয়ার প্রোফাইল", en: "Players Squad Stat Cards", icon: "🏏" },
  { href: "/matches", title: "ম্যাচ আর্কাইভ", en: "Matches Directory History", icon: "🏟️" },
  { href: "/thrillers", title: "হাই ভোল্টেজ ম্যাচ", en: "High Voltage Thrillers", icon: "⚡" },
  { href: "/extraordinary", title: "অসাধারণ নৈপুণ্য", en: "Extraordinary Performance", icon: "💎" },
  { href: "/news", title: "FCL সংবাদ", en: "News Portal Paper", icon: "📰" },
  { href: "/memories", title: "স্মৃতি ও আড্ডা", en: "Memories Adda Stories", icon: "🎞️" },
  { href: "/birthday", title: "জন্মদিনের উৎসব", en: "Birthday Celebration", icon: "🎂" },
  { href: "/play", title: "খেলা শুরু করুন", en: "Play The Game Online", icon: "🎮" },
  { href: "/gallery", title: "ফটো গ্যালারি", en: "Photo Gallery", icon: "📸" },
  { href: "/rules", title: "খেলার নিয়ম", en: "Rules Match Formats", icon: "📜" },
];

function mk(
  partial: Omit<Entry, "tNorm" | "bNorm" | "words" | "full" | "links" | "locate"> & {
    titleText: string;
    bodyText?: string;
    raw?: any;
    locate?: string;
  }
): Entry {
  const { titleText, bodyText, raw, locate, ...rest } = partial;
  const tNorm = norm(titleText);
  const body = String(bodyText || "");
  return {
    ...rest,
    tNorm,
    bNorm: norm(body.slice(0, 3000)),
    words: tNorm.split(" ").filter(Boolean),
    full: body.trim(),
    links: extractLinks(raw, body),
    locate: locate ?? rest.title,
  };
}

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function toArray(data: any, key: string): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
}

let indexPromise: Promise<Entry[]> | null = null;
let cachedTournamentsData: any[] = [];
let cachedAllPlayers: any[] = [];

function loadIndex(): Promise<Entry[]> {
  if (indexPromise) return indexPromise;

  indexPromise = (async () => {
    const [fcl, matches, memories, series, thr] = await Promise.all([
      getJson("/api/fcl-data"),
      getJson("/api/matches"),
      getJson("/api/fcl-memories"),
      getJson("/api/fcl-series"),
      getJson("/api/thrillers-data"),
    ]);

    if (!fcl && !matches && !memories && !series && !thr) {
      indexPromise = null;
    }

    cachedTournamentsData = toArray(fcl, "tournaments");
    cachedAllPlayers = toArray(fcl, "players");

    const out: Entry[] = [];

    PAGES.forEach((p) =>
      out.push(
        mk({
          key: `page-${p.href}`,
          kind: "page",
          title: p.title,
          sub: p.href,
          icon: p.icon,
          href: p.href,
          titleText: `${p.title} ${p.en}`,
          boost: 0,
        })
      )
    );

    cachedAllPlayers.forEach((p: any, i: number) => {
      if (!p || typeof p.name !== "string" || !p.name.trim()) return;
      out.push(
        mk({
          key: `player-${i}`,
          kind: "player",
          title: p.name,
          sub: [p.nickName ? `@${p.nickName}` : "", p.role || ""]
            .filter(Boolean)
            .join(" • "),
          icon: "🏏",
          photo: photoPath(p.photo || p.photoUrl),
          href: `/players?player=${encodeURIComponent(p.name)}`,
          titleText: `${p.name} ${p.nickName || ""}`,
          boost: 8,
          rawPlayer: p,
        })
      );
    });

    const seenTours = new Set<string>();
    cachedTournamentsData.forEach((t: any) => {
      const name = String(t?.tournament ?? "").trim();
      if (!name || seenTours.has(name.toLowerCase())) return;
      seenTours.add(name.toLowerCase());
      out.push(
        mk({
          key: `tour-${name}`,
          kind: "tour",
          title: name,
          sub: t.time ? String(t.time) : "টুর্নামেন্ট ইতিহাস",
          icon: "🏆",
          href: `/records?tour=${encodeURIComponent(name)}`,
          titleText: name,
          boost: 2,
          raw: t,
        })
      );
    });

    toArray(matches, "matches").forEach((m: any) => {
      if (!m || !m.title) return;
      out.push(
        mk({
          key: `match-${m.id}`,
          kind: "match",
          title: String(m.title),
          sub: [m.category, shortDate(m.date)].filter(Boolean).join(" • "),
          icon: "🏟️",
          href: `/matches?match=${encodeURIComponent(String(m.id))}`,
          titleText: String(m.title),
          bodyText: String(m.summary || ""),
          boost: 6,
          raw: m,
          category: m.category ? String(m.category) : undefined,
        })
      );
    });

    toArray(memories, "memories").forEach((m: any, i: number) => {
      const id = Number(m?.id) || i + 1;
      const title = String(m?.title ?? "").trim();
      if (!title) return;
      out.push(
        mk({
          key: `story-${id}-${i}`,
          kind: "story",
          title,
          sub: [m.category, m.author].filter(Boolean).join(" • "),
          icon: "🎞️",
          href: `/memories?memory=${id}`,
          titleText: `${title} ${m.category || ""}`,
          bodyText: `${m.summary || ""}\n\n${m.content || ""}`,
          boost: 4,
          raw: m,
          category: m.category ? String(m.category) : undefined,
        })
      );
    });

    toArray(series, "series").forEach((e: any, i: number) => {
      const name = String(e?.series_name ?? "").trim() || "ধারাবাহিক গল্প";
      const ep = String(e?.episode_title ?? "").trim() || `পর্ব ${e?.episode_no || 1}`;
      out.push(
        mk({
          key: `series-${i}`,
          kind: "story",
          title: `${name} — ${ep}`,
          sub: ["সিরিজ", e.Author].filter(Boolean).join(" • "),
          icon: "📚",
          href: `/memories?memory=${900000 + i}`,
          titleText: `${name} ${ep} সিরিজ`,
          bodyText: `${e.summary || ""}\n\n${e.Content || ""}`,
          boost: 4,
          seriesName: name,
          epNo: Number(e?.episode_no) || i + 1,
          raw: e,
          category: "ধারাবাহিক সিরিজ",
        })
      );
    });

    toArray(thr, "highVoltage").forEach((m: any, i: number) => {
      const title = String(m?.matchTitle ?? "").trim();
      if (!title) return;
      out.push(
        mk({
          key: `hv-${i}`,
          kind: "thriller",
          title,
          sub: m.tournament || "হাই ভোল্টেজ ম্যাচ",
          icon: "⚡",
          href: `/thrillers?item=${i}&q=${encodeURIComponent(title)}`,
          titleText: `${title} ${m.tournament || ""}`,
          bodyText: String(m.description || ""),
          boost: 3,
          raw: m,
          locate: title,
          category: m.tournament ? String(m.tournament) : undefined,
        })
      );
    });

    toArray(thr, "extraordinary").forEach((m: any, i: number) => {
      const title = String(m?.performanceTitle ?? "").trim();
      const player = String(m?.playerName ?? "").trim();
      if (!title && !player) return;
      out.push(
        mk({
          key: `ex-${i}`,
          kind: "extra",
          title: title || player,
          sub: [player, m.tournamentMatch].filter(Boolean).join(" • "),
          icon: "💎",
          href: `/extraordinary?item=${i}&q=${encodeURIComponent(title || player)}`,
          titleText: `${title} ${player} ${m.tournamentMatch || ""}`,
          bodyText: String(m.description || ""),
          boost: 3,
          raw: m,
          locate: title || player,
        })
      );
    });

    return out;
  })();

  return indexPromise;
}

function runSearch(entries: Entry[], query: string): Hit[] {
  const nq = norm(query);
  if (nq.length < 2) return [];

  const all = nq.split(" ");
  const hints = new Set<Kind>();

  let tokens = all.filter((t) => {
    if (GENERIC[t]) {
      hints.add(GENERIC[t]);
      return false;
    }
    return true;
  });

  if (tokens.length === 0) {
    tokens = all;
    hints.clear();
  }

  const hits: Hit[] = [];

  for (const e of entries) {
    let score = 0;
    let ok = true;

    for (const t of tokens) {
      if (e.tNorm.includes(t)) {
        score += e.words.includes(t) ? 30 : 22;
      } else if (e.words.some((w) => near(w, t))) {
        score += 12;
      } else if (t.length >= 2 && e.kind !== "page" && e.bNorm.includes(t)) {
        score += 4;
      } else {
        ok = false;
        break;
      }
    }

    if (!ok) continue;

    if (e.tNorm.includes(nq)) score += 60;
    if (e.tNorm.startsWith(tokens.join(" "))) score += 30;
    if (hints.has(e.kind)) score += 25;
    score += e.boost;

    hits.push({ entry: e, score });
  }

  hits.sort((a, b) => b.score - a.score);

  const perKind: Record<string, number> = {};
  const final: Hit[] = [];

  for (const h of hits) {
    const c = perKind[h.entry.kind] || 0;
    if (c >= 5) continue;
    perKind[h.entry.kind] = c + 1;
    final.push(h);
    if (final.length >= 10) break;
  }

  return final;
}

export default function GlobalSearch({
  isDark,
  autoFocus = false,
  hotkey = false,
  onNavigate,
  className = "",
}: {
  isDark: boolean;
  autoFocus?: boolean;
  hotkey?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  const [popupPlayer, setPopupPlayer] = useState<any | null>(null);
  const [fullModalPlayer, setFullModalPlayer] = useState<any | null>(null);

  const [detailEntry, setDetailEntry] = useState<Entry | null>(null);
  const [mounted, setMounted] = useState(false);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locateTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (popupTimer.current) clearTimeout(popupTimer.current);
      if (locateTimer.current) clearInterval(locateTimer.current);
    };
  }, []);

  const ensureLoaded = useCallback(() => {
    if (entries.length > 0) return;
    setLoading(true);
    loadIndex().then((list) => {
      setEntries(list);
      setLoading(false);
    });
  }, [entries.length]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      ensureLoaded();
    }
  }, [autoFocus, ensureLoaded]);

  useEffect(() => {
    if (!hotkey) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing =
        target?.isContentEditable ||
        /INPUT|TEXTAREA|SELECT/.test(target?.tagName ?? "");
      if (typing) return;
      event.preventDefault();
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  useEffect(() => {
    const onDown = (event: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, []);

  useEffect(() => {
    if (!detailEntry) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailEntry(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [detailEntry]);

  const hits = useMemo(() => runSearch(entries, query), [entries, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const seriesEpisodes = useMemo(() => {
    if (!detailEntry?.seriesName) return [];
    return entries
      .filter((e) => e.seriesName === detailEntry.seriesName)
      .sort((a, b) => (a.epNo ?? 0) - (b.epNo ?? 0));
  }, [entries, detailEntry]);

  const withStamp = (href: string) => {
    const sep = href.includes("?") ? "&" : "?";
    return `${href}${sep}s=${Date.now()}`;
  };

  const poll = useCallback((step: () => boolean, maxTries = 25) => {
    if (locateTimer.current) clearInterval(locateTimer.current);
    let tries = 0;
    locateTimer.current = setInterval(() => {
      tries++;
      let done = false;
      try {
        done = step();
      } catch {
        done = true;
      }
      if ((done || tries >= maxTries) && locateTimer.current) {
        clearInterval(locateTimer.current);
        locateTimer.current = null;
      }
    }, 400);
  }, []);

  const startLocate = useCallback(
    (entry: Entry) => {
      const full = norm(entry.locate);
      const short = full.split(" ").slice(0, 3).join(" ");
      const keys = short && short !== full ? [full, short] : [full];

      poll(() => {
        const el = findNodeByText(keys);
        if (!el) return false;

        const target = findClickable(el);
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        highlight(target);
        setTimeout(() => target.click(), 600);
        return true;
      });
    },
    [poll]
  );

  const go = useCallback(
    (entry: Entry) => {
      const url = entry.kind === "page" ? entry.href : withStamp(entry.href);

      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
      onNavigate?.();

      if (popupTimer.current) clearTimeout(popupTimer.current);
      if (locateTimer.current) clearInterval(locateTimer.current);
      setDetailEntry(null);

      router.push(url);

      if (entry.kind !== "page" && entry.kind !== "player") {
        popupTimer.current = setTimeout(() => {
          setDetailEntry(entry);
        }, POPUP_DELAY_MS);
      }
    },
    [router, onNavigate]
  );

  const openOriginal = useCallback(
    (entry: Entry) => {
      if (popupTimer.current) clearTimeout(popupTimer.current);
      if (locateTimer.current) clearInterval(locateTimer.current);
      setDetailEntry(null);

      if (needsLocate(entry)) {
        const path = entry.href.split("?")[0];
        const alreadyThere =
          typeof window !== "undefined" && window.location.pathname === path;
        if (!alreadyThere) router.push(withStamp(entry.href));
        startLocate(entry);
      } else {
        router.push(withStamp(entry.href));
      }
    },
    [router, startLocate]
  );

  const openCategory = useCallback(
    (entry: Entry, pageOnly = false) => {
      if (popupTimer.current) clearTimeout(popupTimer.current);
      if (locateTimer.current) clearInterval(locateTimer.current);
      setDetailEntry(null);

      if (entry.kind === "story") {
        const cat = pageOnly || !entry.category ? "All" : entry.category;
        router.push(withStamp(`/memories?category=${encodeURIComponent(cat)}`));
        return;
      }

      const page = KIND_PAGE[entry.kind];
      const alreadyThere =
        typeof window !== "undefined" && window.location.pathname === page.href;

      if (!alreadyThere) router.push(withStamp(page.href));

      if (pageOnly || !entry.category) {
        if (alreadyThere) window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      poll(() => {
        const tab = findTab(entry.category!);
        if (!tab) return false;
        tab.scrollIntoView({ behavior: "smooth", block: "center" });
        tab.click();
        return true;
      });
    },
    [router, poll]
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!hits.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % hits.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + hits.length) % hits.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(hits[active].entry);
    }
  };

  const showPanel = open && (query.trim().length >= 2 || loading);

  const t = isDark
    ? {
        input:
          "bg-slate-900 border-slate-600 !text-white placeholder:text-slate-400 focus:border-sky-400",
        panel: "bg-[#0f172a] border-slate-700",
        row: "hover:bg-white/10",
        rowActive: "bg-white/10",
        title: "!text-white",
        sub: "!text-slate-400",
        chip: "bg-sky-500/15 !text-sky-300 border-sky-500/30",
        icon: "bg-slate-800 border-slate-700",
        kbd: "border-slate-600 !text-slate-400",
        empty: "!text-slate-400",
        cardBtn: "bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500 hover:text-white",
        popupBg: "bg-[#0f172a] border-slate-700 text-white shadow-2xl",
        detailBody: "text-slate-200",
        detailBox: "border-white/10 bg-white/5",
        link: "text-sky-300 hover:text-sky-200",
        linkBtn: "border-sky-500/40 bg-sky-500/15 text-sky-200 hover:bg-sky-500/30",
        epRow: "border-white/10 bg-white/5 hover:bg-white/10 text-slate-100",
        epActive: "border-sky-400 bg-sky-500/20 text-white",
      }
    : {
        input:
          "bg-slate-50 border-slate-300 !text-slate-900 placeholder:text-slate-500 focus:border-blue-600",
        panel: "bg-white border-slate-200",
        row: "hover:bg-slate-100",
        rowActive: "bg-slate-100",
        title: "!text-slate-900",
        sub: "!text-slate-500",
        chip: "bg-blue-50 !text-blue-700 border-blue-200",
        icon: "bg-slate-100 border-slate-200",
        kbd: "border-slate-300 !text-slate-500",
        empty: "!text-slate-500",
        cardBtn: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white",
        popupBg: "bg-white border-slate-200 text-slate-900 shadow-2xl",
        detailBody: "text-slate-700",
        detailBox: "border-slate-200 bg-slate-50",
        link: "text-blue-600 hover:text-blue-800",
        linkBtn: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        epRow: "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800",
        epActive: "border-blue-500 bg-blue-50 text-blue-900",
      };

  return (
    <div
      ref={wrapRef}
      data-fcl-search
      className={`relative w-full ${className}`}
    >
      <div className="relative">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm ${t.sub}`}
        >
          🔍
        </span>

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="fcl-global-search-list"
          aria-label="FCL সার্চ"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onFocus={() => {
            setOpen(true);
            ensureLoaded();
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            ensureLoaded();
          }}
          onKeyDown={onKeyDown}
          placeholder="ম্যাচ, প্লেয়ার, গল্প খুঁজুন…"
          className={`h-9 w-full rounded-lg border pl-9 pr-9 text-xs font-semibold outline-none transition-colors [&::-webkit-search-cancel-button]:hidden ${t.input}`}
        />

        {query ? (
          <button
            type="button"
            aria-label="সার্চ মুছুন"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className={`absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[11px] ${t.sub}`}
          >
            ✕
          </button>
        ) : (
          hotkey && (
            <kbd
              className={`pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border px-1.5 text-[10px] font-bold xl:block ${t.kbd}`}
            >
              /
            </kbd>
          )
        )}
      </div>

      {showPanel && (
        <div
          id="fcl-global-search-list"
          role="listbox"
          className={`absolute right-0 z-[10000] mt-2 max-h-[65vh] w-full overflow-y-auto rounded-2xl border p-1.5 shadow-2xl xl:w-[420px] ${t.panel}`}
        >
          {loading && entries.length === 0 ? (
            <p className={`px-3 py-5 text-center text-xs font-semibold ${t.empty}`}>
              ডাটা লোড হচ্ছে…
            </p>
          ) : hits.length === 0 ? (
            <p className={`px-3 py-5 text-center text-xs font-semibold ${t.empty}`}>
              “{query.trim()}” নামে কিছু পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।
            </p>
          ) : (
            hits.map(({ entry }, index) => {
              const isPlayer = entry.kind === "player";

              return (
                <div
                  key={entry.key}
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                    index === active ? t.rowActive : t.row
                  }`}
                >
                  <div
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                    onClick={() => go(entry)}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-base ${t.icon}`}
                    >
                      {entry.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={entry.photo}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PLACEHOLDER;
                          }}
                        />
                      ) : (
                        entry.icon
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-xs font-extrabold ${t.title}`}
                      >
                        {entry.title}
                      </span>
                      {entry.sub && (
                        <span className={`mt-0.5 block truncate text-[10px] ${t.sub}`}>
                          {entry.sub}
                        </span>
                      )}
                    </span>
                  </div>

                  {isPlayer && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                        const raw = entry.rawPlayer || {};
                        setPopupPlayer({
                          ...raw,
                          name: entry.title,
                          photo: entry.photo,
                          matches: raw.matches ?? 0,
                          runs: raw.runs ?? 0,
                          wickets: raw.wickets ?? 0,
                          role: raw.role || entry.sub,
                        });
                      }}
                      className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-extrabold transition-all ${t.cardBtn}`}
                      title="প্লেয়ার কার্ড দেখুন"
                    >
                      🃏 কার্ড
                    </button>
                  )}

                  <span
                    className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-black ${t.chip}`}
                  >
                    {KIND_LABEL[entry.kind]}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {popupPlayer && !fullModalPlayer && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPopupPlayer(null)}
        >
          <div
            className={`relative w-full max-w-sm rounded-[32px] border p-6 text-center ${t.popupBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPopupPlayer(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 transition"
            >
              ✕
            </button>

            <div className="mx-auto mb-3.5 relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-sky-400 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPath(popupPlayer.photo || popupPlayer.photoUrl)}
                alt={popupPlayer.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = PLACEHOLDER;
                }}
              />
            </div>

            <h3 className="text-xl font-black">{popupPlayer.name}</h3>
            <p className="mt-0.5 text-xs font-bold text-sky-400">
              {popupPlayer.nickName ? `@${popupPlayer.nickName}` : `@${popupPlayer.name.toLowerCase().replace(/\s+/g, "")}`}
            </p>

            <div className="mt-3 inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-extrabold text-sky-400">
              {popupPlayer.role || "VIP All-Rounder"}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="block text-[10px] font-semibold text-slate-400">ম্যাচ</span>
                <span className="mt-0.5 block text-lg font-black">{popupPlayer.matches ?? 0}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="block text-[10px] font-semibold text-slate-400">রান / উইকেট</span>
                <span className="mt-0.5 block text-lg font-black">{popupPlayer.runs ?? 0} / {popupPlayer.wickets ?? 0}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const imgUrl = photoPath(popupPlayer.photo || popupPlayer.photoUrl);
                    const res = await fetch(imgUrl);
                    const blob = await res.blob();
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = blobUrl;
                    const safeName = (popupPlayer.nickName || popupPlayer.name || "player").toLowerCase().replace(/[^a-z0-9]/g, "-");
                    link.download = `fcl-player-${safeName}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                  } catch (err) {
                    alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে।");
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-slate-700 transition"
              >
                <span>📥</span> প্লেয়ার ছবি ডাউনলোড করুন
              </button>

              <button
                type="button"
                onClick={() => {
                  const playerObj = popupPlayer;
                  setPopupPlayer(null);
                  setFullModalPlayer(playerObj);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0095f6] py-3 text-xs font-black text-white shadow-lg hover:opacity-90 transition"
              >
                <span>পূর্ণ প্রোফাইল দেখুন ↗</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {fullModalPlayer && (
        <PlayerCardModal
          selectedPlayer={fullModalPlayer}
          onClose={() => setFullModalPlayer(null)}
          tournamentsData={cachedTournamentsData}
          allPlayers={cachedAllPlayers}
        />
      )}

      {mounted &&
        detailEntry &&
        createPortal(
          <div
            data-fcl-search
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setDetailEntry(null)}
          >
            <div
              className={`relative flex max-h-[88vh] w-full max-w-lg flex-col rounded-[28px] border p-6 ${t.popupBg}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="বন্ধ করুন"
                onClick={() => setDetailEntry(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white transition hover:bg-slate-700"
              >
                ✕
              </button>

              <div className="pr-10">
                <span
                  className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-black ${t.chip}`}
                >
                  {detailEntry.icon} {KIND_LABEL[detailEntry.kind]}
                </span>
                <h3 className="mt-3 text-lg font-black leading-snug">
                  {detailEntry.title}
                </h3>
                {detailEntry.sub && (
                  <p className="mt-1 text-xs font-bold text-sky-400">
                    {detailEntry.sub}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {detailEntry.category && (
                    <button
                      type="button"
                      onClick={() => openCategory(detailEntry)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-extrabold transition ${t.linkBtn}`}
                      title="এই ক্যাটেগরিতে যান"
                    >
                      📂 {detailEntry.category} ↗
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openCategory(detailEntry, true)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-extrabold transition ${t.linkBtn}`}
                  >
                    {KIND_PAGE[detailEntry.kind].label} ↗
                  </button>
                </div>
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                {detailEntry.links.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {detailEntry.links.map((url, i) => (
                      <a
                        key={`${url}-${i}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-extrabold transition ${t.linkBtn}`}
                      >
                        🔗 {linkLabel(url)}
                        {detailEntry.links.length > 1 ? ` (${i + 1})` : ""} ↗
                      </a>
                    ))}
                  </div>
                )}

                <div
                  className={`rounded-2xl border p-4 text-sm leading-relaxed whitespace-pre-line ${t.detailBox} ${t.detailBody}`}
                >
                  {detailEntry.full
                    ? renderWithLinks(detailEntry.full, t.link)
                    : "এই আইটেমের বিস্তারিত তথ্য পেইজে দেখুন।"}
                </div>

                {seriesEpisodes.length > 1 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-black">
                      📚 {detailEntry.seriesName} — সব পর্ব ({seriesEpisodes.length})
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {seriesEpisodes.map((ep) => (
                        <button
                          key={ep.key}
                          type="button"
                          onClick={() => openOriginal(ep)}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${
                            ep.key === detailEntry.key ? t.epActive : t.epRow
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {ep.title.split(" — ").slice(1).join(" — ") || ep.title}
                          </span>
                          <span className="shrink-0 text-[10px] opacity-70">
                            {ep.key === detailEntry.key ? "এখন দেখছেন" : "পড়ুন ↗"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const target =
                    seriesEpisodes.length > 1 ? seriesEpisodes[0] : detailEntry;
                  openOriginal(target);
                }}
                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#0095f6] py-3 text-xs font-black text-white shadow-lg transition hover:opacity-90"
              >
                {seriesEpisodes.length > 1
                  ? "📚 পুরো সিরিজ দেখুন ↗"
                  : "পুরোটা দেখুন ↗"}
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}