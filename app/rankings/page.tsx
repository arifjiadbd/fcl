"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import PlayerCardModal from "../../components/PlayerCardModal";

/* =========================================================
   FCL OFFICIAL PREMIUM RANKINGS
   Theme: FCL Home Page Official Color System
========================================================= */

interface Player {
  id?: number;
  name: string;
  nickName?: string;
  role: string;
  totalTournament?: number;
  matches: number;
  runs: number;
  wickets: number;
  innings?: number;
  notOut?: number;
  fours?: number;
  sixes?: number;
  hatTricks?: number;
  mom?: number;
  cpom?: number;
  mot?: number;
  cpot?: number;
  champion?: number;
  runnersUp?: number;
  totalFinal?: number;
  lastPlayed?: string;
  highestRunScorer?: number;
  topWicketTaker?: number;
  debutYear?: string;
  debutTournament?: string;
  debutTeam?: string;
  maxRuns?: number;
  maxWickets?: number;
  runAvg?: string;
  wkAvg?: string;
  photo?: string;
  photoUrl?: string;
}

interface TournamentRecord {
  name: string;
  playerName: string;
  tournament: string;
  team: string;
  matches: number;
  runs: number;
  wickets: number;
  innings: number;
  notOut: number;
  fours: number;
  sixes: number;
  hatTrick: number;
  mom: number;
  cpom: number;
  motCpot: string;
  chamRu: string;
  time: string;
  topScorer: number;
  topWicket: number;
}

interface RankedPlayer {
  player: Player;
  rank: number;
  points: number;
}

const PLACEHOLDER = "/FCL Cricket Avatar Placeholder.jpg";

const PAGE_SIZE = 50;

/* =========================================================
   MVP POINTS FORMULA — ORIGINAL FORMULA PRESERVED
========================================================= */

export const calculateFclPoints = (p: Player): number => {
  if (!p) return 0;

  const runs = Number(p.runs) || 0;
  const sixes = Number(p.sixes) || 0;
  const fours = Number(p.fours) || 0;
  const wickets = Number(p.wickets) || 0;
  const matches = Number(p.matches) || 0;
  const champion = Number(p.champion) || 0;
  const runnersUp = Number(p.runnersUp) || 0;

  const motCpot =
    (Number(p.mot) || 0) + (Number(p.cpot) || 0);

  const highestRuns = Number(p.highestRunScorer) || 0;
  const topWickets = Number(p.topWicketTaker) || 0;

  return Math.round(
    runs +
      sixes * 2 +
      fours +
      wickets * 20 +
      matches * 2 +
      champion * 100 +
      runnersUp * 40 +
      motCpot * 60 +
      highestRuns * 30 +
      topWickets * 30
  );
};

/* =========================================================
   AUTOMATIC PLAYER ROLE — ORIGINAL RULES PRESERVED
========================================================= */

export const getAutomaticRole = (player: Player): string => {
  const matches = Number(player.matches) || 0;

  if (matches === 0) {
    return "Promising Player";
  }

  const runs = Number(player.runs) || 0;
  const wickets = Number(player.wickets) || 0;
  const innings = Number(player.innings) || 0;
  const notOut = Number(player.notOut) || 0;

  const dismissals = innings - notOut;

  const runAvg =
    dismissals > 0
      ? runs / dismissals
      : innings > 0
      ? runs / innings
      : 0;

  const wkAvg = wickets / matches;

  if (runAvg >= 13 && wkAvg >= 1.5) {
    return "VIP All-Rounder";
  }

  if (runAvg >= 9 && wkAvg >= 1.2) {
    return "Bowling All-Rounder";
  }

  if (runAvg >= 9 && wkAvg >= 0.8) {
    return "All-Rounder";
  }

  if (runAvg > 10 && wkAvg < 0.8) {
    return "Batsman";
  }

  if (runAvg < 10 && wkAvg >= 1.0) {
    return "Bowler";
  }

  return "Promising Player";
};

/* =========================================================
   PLAYER TIER
========================================================= */

const getPlayerTier = (p: Player) => {
  const runs = Number(p.runs) || 0;
  const wickets = Number(p.wickets) || 0;

  if (runs >= 2500 && wickets >= 150) {
    return {
      name: "Diamond",
      color: "#22d3ee",
      icon: "💎",
    };
  }

  if (runs >= 2000 && wickets >= 100) {
    return {
      name: "Gold",
      color: "#f59e0b",
      icon: "🥇",
    };
  }

  if (runs >= 1000 && wickets >= 50) {
    return {
      name: "Silver",
      color: "#94a3b8",
      icon: "🥈",
    };
  }

  if (runs >= 500 && wickets >= 50) {
    return {
      name: "Bronze",
      color: "#cd7f32",
      icon: "🥉",
    };
  }

  return null;
};

/* =========================================================
   PLAYER PHOTO
========================================================= */

const getPhoto = (p: Player): string => {
  const raw = p.photo || p.photoUrl;

  if (raw && raw.trim() && raw.trim() !== "—") {
    if (
      raw.startsWith("/") ||
      raw.startsWith("http://") ||
      raw.startsWith("https://") ||
      raw.startsWith("data:")
    ) {
      return raw;
    }

    return `/players/${raw}`;
  }

  return PLACEHOLDER;
};

/* =========================================================
   ROLE FILTERS
========================================================= */

const ROLES = [
  {
    id: "VIP All-Rounder",
    label: "VIP All-Rounder",
    icon: "👑",
    color: "#f59e0b",
  },
  {
    id: "Bowling All-Rounder",
    label: "Bowling All-Rounder",
    icon: "⚡",
    color: "#a855f7",
  },
  {
    id: "All-Rounder",
    label: "All-Rounder",
    icon: "⭐",
    color: "#22c55e",
  },
  {
    id: "Batsman",
    label: "Batsman",
    icon: "🏏",
    color: "#1877F2",
  },
  {
    id: "Bowler",
    label: "Bowler",
    icon: "🎯",
    color: "#ec4899",
  },
  {
    id: "Promising Player",
    label: "Promising Player",
    icon: "🌱",
    color: "#22d3ee",
  },
];

/* =========================================================
   DARK / LIGHT THEME DETECTION
========================================================= */

function detectDarkTheme(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const html = document.documentElement;
  const body = document.body;

  const explicitTheme = [
    html.getAttribute("data-theme"),
    html.getAttribute("data-mode"),
    body.getAttribute("data-theme"),
    body.getAttribute("data-mode"),
  ].find(
    (value) =>
      value?.toLowerCase() === "dark" ||
      value?.toLowerCase() === "light"
  );

  if (explicitTheme) {
    return explicitTheme.toLowerCase() === "dark";
  }

  if (
    html.classList.contains("dark") ||
    body.classList.contains("dark")
  ) {
    return true;
  }

  if (
    html.classList.contains("light") ||
    body.classList.contains("light")
  ) {
    return false;
  }

  const inlineScheme =
    html.style.colorScheme || body.style.colorScheme;

  if (inlineScheme === "dark") {
    return true;
  }

  if (inlineScheme === "light") {
    return false;
  }

  try {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") return true;
    if (saved === "light") return false;
  } catch {
    // Storage can be unavailable in restricted browsers.
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
}

function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const update = () => {
      setIsDark(detectDarkTheme());
    };

    update();

    const observer = new MutationObserver(update);

    const options: MutationObserverInit = {
      attributes: true,
      attributeFilter: [
        "class",
        "data-theme",
        "data-mode",
        "style",
      ],
    };

    observer.observe(document.documentElement, options);
    observer.observe(document.body, options);

    window.addEventListener("storage", update);

    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    media.addEventListener("change", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", update);
      media.removeEventListener("change", update);
    };
  }, []);

  return isDark;
}

/* =========================================================
   ANIMATED COUNTER
========================================================= */

function CountUp({
  value,
  duration = 1300,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    const tick = (now: number) => {
      const progress = Math.min(
        (now - start) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

/* =========================================================
   IMAGE COMPONENT WITH FALLBACK
========================================================= */

function PlayerImage({
  player,
  className = "",
}: {
  player: Player;
  className?: string;
}) {
  const photo = getPhoto(player);
  const [src, setSrc] = useState(photo);

  useEffect(() => {
    setSrc(photo);
  }, [photo]);

  return (
    <img
      src={src}
      alt={player.name}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
      onError={() => {
        if (src !== PLACEHOLDER) {
          setSrc(PLACEHOLDER);
        }
      }}
    />
  );
}

/* =========================================================
   RANK BADGE
========================================================= */

function RankBadge({
  rank,
  size = "normal",
}: {
  rank: number;
  size?: "normal" | "small";
}) {
  const rankClass =
    rank === 1
      ? "fcl-rank-gold"
      : rank === 2
      ? "fcl-rank-silver"
      : rank === 3
      ? "fcl-rank-bronze"
      : "fcl-rank-normal";

  return (
    <span
      className={`
        fcl-rank-badge
        ${rankClass}
        ${
          size === "small"
            ? "h-8 w-8 text-xs"
            : "h-9 w-9 text-xs"
        }
      `}
    >
      {rank}
    </span>
  );
}

/* =========================================================
   PREMIUM STAT
========================================================= */

function MiniStat({
  value,
  label,
  color = "var(--fcl-text)",
}: {
  value: number | string;
  label: string;
  color?: string;
}) {
  return (
    <div className="fcl-mini-stat min-w-0 rounded-xl px-1 py-2 text-center">
      <p
        className="truncate text-xs font-black sm:text-sm"
        style={{ color }}
      >
        {value}
      </p>

      <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-[var(--fcl-muted)] sm:text-[9px]">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   PREMIUM PODIUM CARD
========================================================= */

function PodiumCard({
  player,
  rank,
  onOpen,
}: {
  player: Player;
  rank: number;
  onOpen: (player: Player) => void;
}) {
  const points = calculateFclPoints(player);
  const first = rank === 1;

  const settings =
    rank === 1
      ? {
          className: "fcl-podium-gold",
          accent: "#f59e0b",
          lightAccent: "#fbbf24",
          icon: "👑",
          title: "CHAMPION",
          subtitle: "GOLD MVP",
        }
      : rank === 2
      ? {
          className: "fcl-podium-silver",
          accent: "#94a3b8",
          lightAccent: "#cbd5e1",
          icon: "🥈",
          title: "RUNNER-UP",
          subtitle: "SILVER MVP",
        }
      : {
          className: "fcl-podium-bronze",
          accent: "#d97706",
          lightAccent: "#f59e0b",
          icon: "🥉",
          title: "THIRD PLACE",
          subtitle: "BRONZE MVP",
        };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(player);
    }
  };

  return (
    <div
      className={`
        fcl-podium-wrap
        ${first ? "fcl-podium-first" : ""}
        ${
          rank === 1
            ? "order-2"
            : rank === 2
            ? "order-1"
            : "order-3"
        }
      `}
      style={{
        animationDelay: `${rank * 110}ms`,
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(player)}
        onKeyDown={handleKeyDown}
        aria-label={`View ${player.name}, rank ${rank}`}
        className={`
          fcl-podium-card
          ${settings.className}
          ${first ? "fcl-podium-champion" : ""}
          group relative flex w-full flex-col items-center
          overflow-hidden rounded-[20px]
          px-1.5 pb-3 pt-4 text-center
          transition-all duration-500
          hover:-translate-y-2
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#1877F2]
          sm:rounded-[30px]
          sm:px-5 sm:pb-6 sm:pt-7
        `}
      >
        <div className="fcl-podium-orb pointer-events-none absolute -top-14 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl" />

        {first && (
          <div className="fcl-podium-shine pointer-events-none absolute inset-0" />
        )}

        <div className="relative z-10 flex w-full flex-col items-center">
          <div
            className="fcl-podium-chip rounded-full px-2 py-1 text-[8px] font-black tracking-wider sm:px-4 sm:py-1.5 sm:text-[10px]"
            style={{
              backgroundColor: settings.accent,
              color: rank === 3 ? "#ffffff" : "#020617",
            }}
          >
            <span className="sm:hidden">
              {settings.icon} #{rank}
            </span>

            <span className="hidden sm:inline">
              {settings.icon} {settings.title}
            </span>
          </div>

          <div className="relative mt-4 sm:mt-7">
            {first && (
              <span className="fcl-crown absolute -top-5 left-1/2 z-20 -translate-x-1/2 text-xl sm:-top-9 sm:text-4xl">
                👑
              </span>
            )}

            <div
              className={`
                fcl-podium-avatar
                relative overflow-hidden rounded-full
                ${
                  first
                    ? "h-16 w-16 sm:h-32 sm:w-32"
                    : "h-12 w-12 sm:h-24 sm:w-24"
                }
              `}
              style={{
                borderColor: settings.accent,
                boxShadow: `0 0 28px ${settings.accent}35`,
              }}
            >
              <PlayerImage player={player} />
            </div>

            <div
              className="absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full text-[10px] font-black shadow-lg sm:h-7 sm:w-7 sm:text-xs"
              style={{
                backgroundColor: settings.accent,
                color: rank === 3 ? "#fff" : "#020617",
              }}
            >
              {rank}
            </div>
          </div>

          <div className="mt-5 w-full sm:mt-7">
            <h3
              className={`
                fcl-podium-name
                break-words font-black leading-tight
                ${
                  first
                    ? "text-[12px] sm:text-[23px]"
                    : "text-[11px] sm:text-lg"
                }
              `}
            >
              {player.name}
            </h3>

            {player.nickName && (
              <p className="mt-1 truncate text-[9px] text-[var(--fcl-muted)] sm:text-xs">
                @{player.nickName}
              </p>
            )}

            <p className="mt-1.5 line-clamp-2 min-h-[20px] text-[8px] font-semibold text-[var(--fcl-muted)] sm:text-xs">
              {player.role}
            </p>
          </div>

          <div className="fcl-podium-points mt-3 w-full rounded-xl px-1 py-3 sm:mt-5 sm:rounded-2xl sm:px-3 sm:py-4">
            <p className="hidden text-[9px] font-black uppercase tracking-[0.2em] text-[var(--fcl-muted)] sm:block">
              All-Time MVP Rating
            </p>

            <p
              className={`
                mt-0.5 whitespace-nowrap font-black leading-none
                ${
                  first
                    ? "text-[19px] sm:text-[42px]"
                    : "text-[16px] sm:text-[32px]"
                }
              `}
              style={{
                color: settings.lightAccent,
              }}
            >
              <CountUp value={points} />

              <span className="ml-0.5 text-[8px] font-bold text-[var(--fcl-muted)] sm:ml-1 sm:text-xs">
                PTS
              </span>
            </p>

            <p className="mt-1 text-[8px] font-black tracking-widest text-[var(--fcl-muted)] sm:hidden">
              {settings.subtitle}
            </p>
          </div>

          <div className="mt-2 grid w-full grid-cols-3 gap-1 sm:mt-4 sm:gap-2">
            <MiniStat
              value={Number(player.runs || 0).toLocaleString()}
              label="Runs"
              color="#22c55e"
            />

            <MiniStat
              value={player.wickets || 0}
              label="Wkts"
              color="#f59e0b"
            />

            <MiniStat
              value={player.champion || 0}
              label="Titles"
              color="#22d3ee"
            />
          </div>

          <div className="mt-3 hidden items-center gap-1 text-[10px] font-bold text-[var(--fcl-muted)] transition-colors group-hover:text-[#1877F2] sm:flex">
            View Player Profile
            <span>↗</span>
          </div>
        </div>
      </button>
    </div>
  );
}

/* =========================================================
   LOADING SKELETON
========================================================= */

function RankingsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="fcl-skeleton-card flex items-center gap-3 rounded-2xl p-4"
        >
          <div className="fcl-skeleton h-9 w-9 rounded-xl" />
          <div className="fcl-skeleton h-12 w-12 rounded-xl" />

          <div className="flex-1 space-y-2">
            <div className="fcl-skeleton h-4 w-36 max-w-full rounded" />
            <div className="fcl-skeleton h-3 w-24 rounded" />
          </div>

          <div className="fcl-skeleton h-7 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   MAIN RANKINGS PAGE
========================================================= */

export default function RankingsPage() {
  const isDark = useIsDark();

  const [players, setPlayers] = useState<Player[]>([]);

  const [tournamentsData, setTournamentsData] = useState<
    TournamentRecord[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRole, setSelectedRole] = useState("All");
  const [search, setSearch] = useState("");

  const [selectedPlayer, setSelectedPlayer] =
    useState<Player | null>(null);

  const [showFormula, setShowFormula] = useState(false);

  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);

  /* =======================================================
     FETCH PLAYER DATA
  ======================================================= */

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/fcl-data", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load player data (${response.status})`
        );
      }

      const data = await response.json();

      let loaded: Player[] = [];

      if (Array.isArray(data)) {
        loaded = data;
      } else if (Array.isArray(data?.players)) {
        loaded = data.players;
      }

      const processed = loaded
        .filter(
          (player): player is Player =>
            !!player &&
            typeof player.name === "string" &&
            player.name.trim().length > 0
        )
        .map((player) => ({
          ...player,
          role: getAutomaticRole(player),
        }));

      setPlayers(processed);

      setTournamentsData(
        Array.isArray(data?.tournaments)
          ? data.tournaments
          : []
      );
    } catch (err) {
      console.error("Error loading FCL rankings:", err);

      setError(
        "Unable to load rankings right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /* =======================================================
     ALL-TIME RANKINGS
  ======================================================= */

  const allRankedPlayers = useMemo<RankedPlayer[]>(() => {
    return players
      .map((player) => ({
        player,
        points: calculateFclPoints(player),
      }))
      .sort(
        (a, b) =>
          b.points - a.points ||
          a.player.name.localeCompare(b.player.name)
      )
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }, [players]);

  /* =======================================================
     TOP 3 MVP
  ======================================================= */

  const top3Mvp = useMemo(() => {
    return allRankedPlayers.slice(0, 3);
  }, [allRankedPlayers]);

  /* =======================================================
     SEARCH + ROLE FILTER
     Filtered ranking position starts from #1.
  ======================================================= */

  const sortedAndFilteredPlayers = useMemo<
    RankedPlayer[]
  >(() => {
    const query = search.toLowerCase().trim();

    return allRankedPlayers
      .filter(({ player }) => {
        const name = player.name.toLowerCase();

        const nickname = (
          player.nickName || ""
        ).toLowerCase();

        const matchSearch =
          !query ||
          name.includes(query) ||
          nickname.includes(query);

        const matchRole =
          selectedRole === "All" ||
          player.role.toLowerCase() ===
            selectedRole.toLowerCase();

        return matchSearch && matchRole;
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }, [allRankedPlayers, search, selectedRole]);

  const displayed = useMemo(() => {
    return sortedAndFilteredPlayers.slice(
      0,
      visibleCount
    );
  }, [sortedAndFilteredPlayers, visibleCount]);

  /* =======================================================
     SUMMARY STATS
  ======================================================= */

  const summary = useMemo(() => {
    return players.reduce(
      (acc, player) => {
        acc.runs += Number(player.runs) || 0;
        acc.wickets += Number(player.wickets) || 0;
        acc.matches += Number(player.matches) || 0;

        return acc;
      },
      {
        runs: 0,
        wickets: 0,
        matches: 0,
      }
    );
  }, [players]);

  /* =======================================================
     ROLE COUNTS
  ======================================================= */

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: players.length,
    };

    for (const role of ROLES) {
      counts[role.id] = players.filter(
        (player) => player.role === role.id
      ).length;
    }

    return counts;
  }, [players]);

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  };

  const openPlayer = (player: Player) => {
    setSelectedPlayer(player);
  };

  const closePlayer = () => {
    setSelectedPlayer(null);
  };

  const handlePlayerKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    player: Player
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openPlayer(player);
    }
  };

  const remaining = Math.max(
    0,
    sortedAndFilteredPlayers.length - visibleCount
  );

  const maxFilteredPoints =
    sortedAndFilteredPlayers[0]?.points || 1;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      data-fcl-theme={isDark ? "dark" : "light"}
      className="fcl-rankings relative min-h-screen overflow-x-hidden pb-24 transition-colors duration-300"
    >
      <style>{RANKINGS_STYLES}</style>

      {/* BACKGROUND EFFECTS */}

      <div className="fcl-background pointer-events-none absolute inset-0 overflow-hidden">
        <div className="fcl-grid absolute inset-0" />

        <div className="fcl-orb fcl-orb-blue absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full" />

        <div className="fcl-orb fcl-orb-gold absolute right-[-180px] top-[500px] h-[400px] w-[400px] rounded-full" />

        <div className="fcl-orb fcl-orb-purple absolute left-[-200px] top-[1000px] h-[420px] w-[420px] rounded-full" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="fcl-reveal mb-7 sm:mb-11">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="fcl-eyebrow text-[10px] font-black uppercase tracking-[0.2em] sm:text-xs">
                FCL OFFICIAL LEADERBOARD
              </span>

              <span className="fcl-live-badge inline-flex items-center gap-2 rounded-full px-3 py-1 text-[9px] font-black tracking-wider sm:text-[10px]">
                <span className="fcl-live-dot h-1.5 w-1.5 rounded-full" />
                MVP SYSTEM LIVE
              </span>
            </div>

            <Link
              href="/records"
              className="fcl-hall-button group inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition-all duration-300 hover:-translate-y-1 sm:px-5 sm:text-sm"
            >
              <span className="text-base">🏆</span>

              <span>Hall of Fame & Records</span>

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                ↗
              </span>
            </Link>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/25 bg-[#1877F2]/10 px-3 py-1.5">
                <span className="text-xs">🏏</span>

                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#1877F2]">
                  The Best of FCL Cricket
                </span>
              </div>

              <h1 className="fcl-main-title text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-[56px]">
                Official Player
                <br />
                <span className="fcl-gradient-text">
                  Rankings.
                </span>
              </h1>

              <p className="fcl-description mt-4 max-w-2xl text-xs leading-relaxed sm:text-sm sm:leading-7">
                এখানে পাবেন FCL-এর অল-টাইম MVP পয়েন্ট
                র‍্যাঙ্কিং। আপনার পছন্দের রোল অনুযায়ী
                প্লেয়ারদের অবস্থান দেখুন, পারফরম্যান্স
                তুলনা করুন এবং সম্পূর্ণ ক্রিকেট ক্যারিয়ার
                সম্পর্কে জানুন।
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              {/* SEARCH */}

              <div className="relative w-full sm:w-[310px]">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">
                  🔍
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    handleSearchChange(event.target.value)
                  }
                  placeholder="Search player or nickname..."
                  aria-label="Search players"
                  className="fcl-search-input w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none transition-all duration-300"
                />
              </div>

              {/* FORMULA BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setShowFormula((previous) => !previous)
                }
                aria-expanded={showFormula}
                aria-controls="fcl-mvp-formula"
                className="fcl-formula-button flex shrink-0 items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-xs font-black transition-all duration-300 sm:text-sm"
              >
                <span>📊</span>

                MVP Formula

                <span
                  className={`text-[10px] transition-transform duration-300 ${
                    showFormula ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="fcl-reveal mb-8 grid grid-cols-2 gap-2.5 sm:mb-12 sm:gap-4 lg:grid-cols-4">
          {[
            {
              icon: "👥",
              label: "TOTAL PLAYERS",
              value: players.length,
              color: "#1877F2",
              gradient: "blue",
            },
            {
              icon: "🏏",
              label: "TOTAL RUNS",
              value: summary.runs,
              color: "#22c55e",
              gradient: "green",
            },
            {
              icon: "🎯",
              label: "TOTAL WICKETS",
              value: summary.wickets,
              color: "#f59e0b",
              gradient: "gold",
            },
            {
              icon: "⚡",
              label: "PLAYER MATCHES",
              value: summary.matches,
              color: "#a855f7",
              gradient: "purple",
            },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`fcl-summary-card fcl-summary-${stat.gradient} group relative overflow-hidden rounded-2xl p-4 sm:rounded-3xl sm:p-5`}
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              <div className="relative z-10 flex items-start justify-between gap-2">
                <div>
                  <p className="fcl-summary-label text-[9px] font-black uppercase tracking-[0.13em] sm:text-[11px]">
                    {stat.label}
                  </p>

                  <p
                    className="mt-2 text-2xl font-black sm:mt-3 sm:text-4xl"
                    style={{
                      color: stat.color,
                    }}
                  >
                    {loading ? (
                      <span className="fcl-skeleton inline-block h-8 w-16 rounded-lg" />
                    ) : (
                      <CountUp value={stat.value} />
                    )}
                  </p>
                </div>

                <div className="fcl-summary-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg sm:h-11 sm:w-11 sm:text-xl">
                  {stat.icon}
                </div>
              </div>

              <div
                className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
                style={{
                  backgroundColor: stat.color,
                }}
              />
            </div>
          ))}
        </section>

        {/* =================================================
            COLLAPSIBLE MVP FORMULA
        ================================================= */}

        <div
          id="fcl-mvp-formula"
          className={`grid transition-all duration-500 ${
            showFormula
              ? "mb-9 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <section className="fcl-formula-panel rounded-3xl p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f59e0b]/15 text-xl">
                  🏆
                </div>

                <div>
                  <h2 className="text-sm font-black text-[var(--fcl-text)] sm:text-base">
                    Official FCL MVP Points Formula
                  </h2>

                  <p className="mt-1 text-[11px] text-[var(--fcl-muted)]">
                    All-time performance based ranking system
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {[
                  {
                    icon: "🏏",
                    title: "BATTING",
                    color: "#22c55e",
                    items: [
                      "1 Run = 1 Point",
                      "1 Six = 2 Points",
                      "1 Four = 1 Point",
                    ],
                  },
                  {
                    icon: "🎯",
                    title: "BOWLING",
                    color: "#f59e0b",
                    items: [
                      "1 Wicket = 20 Points",
                      "Each Match = 2 Points",
                    ],
                  },
                  {
                    icon: "🏆",
                    title: "HONORS",
                    color: "#a855f7",
                    items: [
                      "Champion = 100 Points",
                      "Runner-Up = 40 Points",
                      "MOT / CPOT = 60 Points",
                    ],
                  },
                  {
                    icon: "👑",
                    title: "SPECIAL AWARDS",
                    color: "#22d3ee",
                    items: [
                      "Run King = 30 Points",
                      "Wicket King = 30 Points",
                    ],
                  },
                ].map((section) => (
                  <div
                    key={section.title}
                    className="fcl-formula-stat rounded-2xl p-3 sm:p-4"
                  >
                    <h3
                      className="text-[11px] font-black tracking-wide"
                      style={{
                        color: section.color,
                      }}
                    >
                      {section.icon} {section.title}
                    </h3>

                    <div className="mt-3 space-y-1.5">
                      {section.items.map((item) => (
                        <p
                          key={item}
                          className="text-[10px] leading-relaxed text-[var(--fcl-secondary-text)] sm:text-xs"
                        >
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[10px] leading-relaxed text-[var(--fcl-muted)] sm:text-xs">
                MVP Points = Runs + (Sixes × 2) + Fours
                + (Wickets × 20) + (Matches × 2) +
                (Champion × 100) + (Runner-Up × 40) +
                ((MOT + CPOT) × 60) +
                (Highest Run Scorer × 30) +
                (Top Wicket Taker × 30)
              </p>
            </section>
          </div>
        </div>

        {/* =================================================
            TOP 3 MVP PODIUM
        ================================================= */}

        {loading ? (
          <div className="mb-10 grid grid-cols-3 items-end gap-2 sm:gap-5">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className={`fcl-skeleton-card rounded-3xl ${
                  item === 1
                    ? "h-52 sm:h-[400px]"
                    : "h-44 sm:h-[350px]"
                }`}
              >
                <div className="fcl-skeleton h-full w-full rounded-3xl" />
              </div>
            ))}
          </div>
        ) : (
          top3Mvp.length > 0 && (
            <section className="mb-10 sm:mb-14">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-7">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="fcl-gold-dot h-2 w-2 rounded-full" />

                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f59e0b] sm:text-xs">
                      FCL HALL OF CHAMPIONS
                    </p>
                  </div>

                  <h2 className="mt-2 text-xl font-black text-[var(--fcl-text)] sm:text-3xl">
                    The MVP{" "}
                    <span className="fcl-gold-text">
                      Elite Three
                    </span>
                  </h2>
                </div>

                <span className="fcl-season-badge rounded-full px-3 py-2 text-[10px] font-bold sm:text-xs">
                  ✨ ALL-TIME TOP 3
                </span>
              </div>

              <div className="fcl-podium-grid grid grid-cols-3 items-end gap-2 sm:gap-5">
                {top3Mvp.map(({ player, rank }) => (
                  <PodiumCard
                    key={`${player.id ?? player.name}-${rank}`}
                    player={player}
                    rank={rank}
                    onOpen={openPlayer}
                  />
                ))}
              </div>
            </section>
          )
        )}

        {/* =================================================
            LEADERBOARD SECTION HEADER
        ================================================= */}

        <section className="mb-5 sm:mb-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1877F2] sm:text-xs">
                COMPLETE RANKINGS
              </p>

              <h2 className="mt-1.5 text-2xl font-black text-[var(--fcl-text)] sm:text-3xl">
                Player Leaderboard
              </h2>

              <p className="mt-2 text-xs text-[var(--fcl-muted)] sm:text-sm">
                Explore every player&apos;s all-time
                performance and MVP rating.
              </p>
            </div>

            {!loading && (
              <div className="fcl-results-badge rounded-xl px-3 py-2 text-xs font-bold">
                <span className="text-[#1877F2]">
                  {sortedAndFilteredPlayers.length}
                </span>{" "}
                Players Found
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            STICKY ROLE FILTERS
            ALL PLAYERS FULL WIDTH
            SIX ROLES IN 3 × 2 GRID
        ================================================= */}

        <div className="fcl-filter-sticky sticky top-0 z-30 -mx-3 mb-6 px-3 py-3 sm:top-2 sm:mx-0 sm:rounded-3xl sm:px-3">
          <div className="flex flex-col gap-2.5">
            {/* ALL PLAYERS */}

            <button
              type="button"
              onClick={() => handleRoleChange("All")}
              aria-pressed={selectedRole === "All"}
              className={`fcl-role-button fcl-role-all flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black transition-all duration-300 ${
                selectedRole === "All"
                  ? "fcl-role-active"
                  : ""
              }`}
            >
              <span className="text-lg">🌐</span>

              <span>All Players</span>

              <span className="fcl-role-count rounded-full px-2 py-0.5 text-[10px]">
                {roleCounts.All || 0}
              </span>
            </button>

            {/* SIX ROLE FILTERS */}

            <div
              className="grid grid-cols-3 gap-2 sm:gap-3"
              aria-label="Player role filters"
            >
              {ROLES.map((role) => {
                const active =
                  selectedRole === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() =>
                      handleRoleChange(role.id)
                    }
                    aria-pressed={active}
                    className={`fcl-role-button flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-1.5 py-2.5 text-center transition-all duration-300 sm:flex-row sm:gap-2 sm:px-3 sm:py-3.5 ${
                      active ? "fcl-role-active" : ""
                    }`}
                  >
                    <span className="text-lg sm:text-xl">
                      {role.icon}
                    </span>

                    <span className="min-w-0 break-words text-[9px] font-black leading-tight sm:text-xs lg:text-sm">
                      {role.label}
                    </span>

                    <span
                      className={`fcl-role-count rounded-full px-1.5 py-0.5 text-[8px] font-black sm:text-[9px] ${
                        active ? "fcl-role-count-active" : ""
                      }`}
                    >
                      {roleCounts[role.id] || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =================================================
            ACTIVE FILTER INFO
        ================================================= */}

        {!loading &&
          (search || selectedRole !== "All") && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[var(--fcl-muted)]">
                  Active Filters:
                </span>

                {selectedRole !== "All" && (
                  <span className="fcl-active-filter rounded-full px-3 py-1.5 text-[10px] font-bold">
                    {selectedRole}
                  </span>
                )}

                {search && (
                  <span className="fcl-active-filter rounded-full px-3 py-1.5 text-[10px] font-bold">
                    🔍 {search}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedRole("All");
                  setVisibleCount(PAGE_SIZE);
                }}
                className="text-xs font-black text-[#1877F2] transition hover:opacity-70"
              >
                ✕ Clear Filters
              </button>
            </div>
          )}

        {/* =================================================
            LOADING / ERROR / EMPTY STATES
        ================================================= */}

        {loading ? (
          <RankingsSkeleton />
        ) : error ? (
          <div className="fcl-empty-state rounded-3xl px-5 py-12 text-center">
            <div className="text-4xl">⚠️</div>

            <h3 className="mt-4 text-lg font-black text-[var(--fcl-text)]">
              Rankings Unavailable
            </h3>

            <p className="mt-2 text-sm text-[var(--fcl-muted)]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadData()}
              className="mt-5 rounded-xl bg-[#1877F2] px-6 py-3 text-xs font-black text-white transition hover:bg-[#1669d8]"
            >
              ↻ Try Again
            </button>
          </div>
        ) : sortedAndFilteredPlayers.length === 0 ? (
          <div className="fcl-empty-state rounded-3xl px-5 py-14 text-center">
            <div className="text-5xl">🔎</div>

            <h3 className="mt-4 text-lg font-black text-[var(--fcl-text)]">
              No Players Found
            </h3>

            <p className="mt-2 text-sm text-[var(--fcl-muted)]">
              Try another name or select a different role.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedRole("All");
                setVisibleCount(PAGE_SIZE);
              }}
              className="mt-5 rounded-xl bg-[#1877F2] px-6 py-3 text-xs font-black text-white transition hover:bg-[#1669d8]"
            >
              Show All Players
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* =============================================
                MOBILE + TABLET PLAYER CARDS
            ============================================= */}

            <div className="space-y-3 lg:hidden">
              {displayed.map(
                ({ player, rank, points }, index) => {
                  const tier = getPlayerTier(player);

                  return (
                    <div
                      key={`mobile-${player.id ?? player.name}-${rank}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => openPlayer(player)}
                      onKeyDown={(event) =>
                        handlePlayerKeyDown(
                          event,
                          player
                        )
                      }
                      style={{
                        animationDelay: `${
                          Math.min(index, 10) * 35
                        }ms`,
                      }}
                      className="fcl-player-mobile fcl-row group cursor-pointer rounded-2xl p-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] sm:p-4"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* RANK */}

                        <RankBadge
                          rank={rank}
                          size="small"
                        />

                        {/* PHOTO */}

                        <div className="fcl-player-avatar h-11 w-11 shrink-0 overflow-hidden rounded-xl sm:h-13 sm:w-13">
                          <PlayerImage player={player} />
                        </div>

                        {/* NAME + ROLE */}

                        <div className="min-w-0 flex-1">
                          <p className="fcl-player-name break-words text-[13px] font-black leading-tight sm:text-base">
                            {player.name}
                          </p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            <span className="fcl-role-chip rounded-md px-1.5 py-1 text-[9px] font-semibold">
                              {player.role}
                            </span>

                            {tier && (
                              <span
                                className="text-[9px] font-black"
                                style={{
                                  color: tier.color,
                                }}
                              >
                                {tier.icon} {tier.name}
                              </span>
                            )}
                          </div>

                          {player.nickName && (
                            <p className="mt-1 truncate text-[10px] text-[var(--fcl-muted)]">
                              @{player.nickName}
                            </p>
                          )}
                        </div>

                        {/* MVP POINTS */}

                        <div className="shrink-0 text-right">
                          <p className="text-lg font-black leading-none text-[#f59e0b] sm:text-xl">
                            {points.toLocaleString()}
                          </p>

                          <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-[var(--fcl-muted)]">
                            MVP PTS
                          </p>
                        </div>
                      </div>

                      {/* MINI STATS */}

                      <div className="mt-3 grid grid-cols-5 gap-1.5">
                        <MiniStat
                          value={player.matches || 0}
                          label="MAT"
                        />

                        <MiniStat
                          value={Number(
                            player.runs || 0
                          ).toLocaleString()}
                          label="RUNS"
                          color="#22c55e"
                        />

                        <MiniStat
                          value={player.wickets || 0}
                          label="WKTS"
                          color="#f59e0b"
                        />

                        <MiniStat
                          value={`${player.sixes || 0}/${
                            player.fours || 0
                          }`}
                          label="6S / 4S"
                          color="#a855f7"
                        />

                        <MiniStat
                          value={player.champion || 0}
                          label="TITLES"
                          color="#f59e0b"
                        />
                      </div>

                      {/* RATING BAR */}

                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--fcl-progress-bg)]">
                        <div
                          className="fcl-rating-bar h-full rounded-full"
                          style={{
                            width: `${
                              maxFilteredPoints > 0
                                ? Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      (points /
                                        maxFilteredPoints) *
                                        100
                                    )
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* =============================================
                DESKTOP PREMIUM TABLE
            ============================================= */}

            <div className="fcl-table-wrapper hidden overflow-hidden rounded-3xl lg:block">
              {/* TABLE HEADER */}

              <div className="fcl-table-head grid grid-cols-[56px_minmax(0,2.3fr)_minmax(0,1.4fr)_repeat(5,65px)_minmax(120px,1.2fr)] items-center gap-3 px-5 py-4 text-[10px] font-black uppercase tracking-wider">
                <div className="text-center">
                  Rank
                </div>

                <div>Player</div>

                <div>Role & Tier</div>

                <div className="text-center">
                  Mat
                </div>

                <div className="text-center">
                  Runs
                </div>

                <div className="text-center">
                  Wkts
                </div>

                <div className="text-center">
                  6s
                </div>

                <div className="text-center">
                  Titles
                </div>

                <div className="text-right">
                  MVP Rating
                </div>
              </div>

              {/* TABLE ROWS */}

              <div className="fcl-table-body">
                {displayed.map(
                  ({ player, rank, points }, index) => {
                    const tier = getPlayerTier(player);

                    const percent =
                      maxFilteredPoints > 0
                        ? Math.max(
                            0,
                            Math.min(
                              100,
                              (points /
                                maxFilteredPoints) *
                                100
                            )
                          )
                        : 0;

                    return (
                      <div
                        key={`desktop-${player.id ?? player.name}-${rank}`}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          openPlayer(player)
                        }
                        onKeyDown={(event) =>
                          handlePlayerKeyDown(
                            event,
                            player
                          )
                        }
                        style={{
                          animationDelay: `${
                            Math.min(index, 12) * 30
                          }ms`,
                        }}
                        className="fcl-table-row fcl-row group grid cursor-pointer grid-cols-[56px_minmax(0,2.3fr)_minmax(0,1.4fr)_repeat(5,65px)_minmax(120px,1.2fr)] items-center gap-3 px-5 py-3.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1877F2]"
                      >
                        {/* RANK */}

                        <div className="flex justify-center">
                          <RankBadge rank={rank} />
                        </div>

                        {/* PLAYER */}

                        <div className="flex min-w-0 items-center gap-3">
                          <div className="fcl-player-avatar h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                            <PlayerImage
                              player={player}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="fcl-player-name break-words text-sm font-black leading-tight">
                              {player.name}
                            </p>

                            {player.nickName && (
                              <p className="mt-1 truncate text-[11px] text-[var(--fcl-muted)]">
                                @{player.nickName}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* ROLE + TIER */}

                        <div className="min-w-0">
                          <span className="fcl-role-chip inline-block max-w-full break-words rounded-lg px-2 py-1 text-[10px] font-semibold">
                            {player.role}
                          </span>

                          {tier && (
                            <p
                              className="mt-1 text-[10px] font-black"
                              style={{
                                color: tier.color,
                              }}
                            >
                              {tier.icon} {tier.name}
                            </p>
                          )}
                        </div>

                        {/* MATCHES */}

                        <div className="text-center text-sm font-bold text-[var(--fcl-text)]">
                          {player.matches || 0}
                        </div>

                        {/* RUNS */}

                        <div className="text-center text-sm font-black text-[#22c55e]">
                          {Number(
                            player.runs || 0
                          ).toLocaleString()}
                        </div>

                        {/* WICKETS */}

                        <div className="text-center text-sm font-black text-[#f59e0b]">
                          {player.wickets || 0}
                        </div>

                        {/* SIXES */}

                        <div className="text-center text-sm font-black text-[#a855f7]">
                          {player.sixes || 0}
                        </div>

                        {/* TITLES */}

                        <div className="text-center text-sm font-black text-[#f59e0b]">
                          🏆{player.champion || 0}
                        </div>

                        {/* MVP RATING */}

                        <div className="min-w-0">
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-lg font-black text-[#f59e0b]">
                              {points.toLocaleString()}
                            </span>

                            <span className="text-[10px] font-black text-[var(--fcl-muted)]">
                              PTS
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--fcl-progress-bg)]">
                            <div
                              className="fcl-rating-bar h-full rounded-full"
                              style={{
                                width: `${percent}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* =============================================
                LOAD MORE
            ============================================= */}

            {remaining > 0 && (
              <div className="flex flex-col items-center gap-3 pt-4">
                <p className="text-xs text-[var(--fcl-muted)]">
                  Showing{" "}
                  <span className="font-black text-[var(--fcl-text)]">
                    {displayed.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-black text-[var(--fcl-text)]">
                    {sortedAndFilteredPlayers.length}
                  </span>{" "}
                  players
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount(
                      (previous) =>
                        previous + PAGE_SIZE
                    )
                  }
                  className="fcl-load-more group flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-xs font-black transition-all duration-300 hover:-translate-y-1 sm:w-auto sm:px-10 sm:text-sm"
                >
                  <span>
                    আরও{" "}
                    {Math.min(
                      PAGE_SIZE,
                      remaining
                    )}{" "}
                    জন লোড করুন
                  </span>

                  <span className="text-[10px] opacity-70">
                    ({remaining} বাকি)
                  </span>

                  <span className="transition-transform duration-300 group-hover:translate-y-1">
                    ↓
                  </span>
                </button>
              </div>
            )}

            {/* ALL LOADED MESSAGE */}

            {remaining === 0 &&
              sortedAndFilteredPlayers.length >
                PAGE_SIZE && (
                <div className="pt-5 text-center">
                  <p className="text-xs font-semibold text-[var(--fcl-muted)]">
                    ✓ All{" "}
                    {
                      sortedAndFilteredPlayers.length
                    }{" "}
                    players loaded
                  </p>
                </div>
              )}
          </div>
        )}

        {/* =================================================
            AUCTION COMPARISON BANNER
        ================================================= */}

        <section className="fcl-compare-banner relative mt-12 overflow-hidden rounded-3xl p-5 sm:mt-16 sm:p-8">
          <div className="fcl-compare-glow pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="fcl-compare-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl sm:h-14 sm:w-14">
                ⚔️
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1877F2]">
                  FCL PLAYER ANALYTICS
                </p>

                <h2 className="mt-1.5 text-lg font-black text-[var(--fcl-text)] sm:text-2xl">
                  Compare the Best Players
                </h2>

                <p className="mt-2 max-w-xl text-xs leading-relaxed text-[var(--fcl-muted)] sm:text-sm">
                  দুই থেকে চারজন প্লেয়ারের ব্যাটিং,
                  বোলিং, MVP Points এবং Auction
                  Performance পাশাপাশি তুলনা করুন।
                </p>
              </div>
            </div>

            <Link
              href="/players/compare"
              className="fcl-compare-button inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-black transition-all duration-300 hover:-translate-y-1 sm:text-sm"
            >
              Compare Players
              <span>↗</span>
            </Link>
          </div>
        </section>

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <div className="mt-8 text-center">
          <p className="text-[10px] leading-relaxed text-[var(--fcl-muted)] sm:text-xs">
            🏏 FCL Official Rankings • Based on
            Tournament Statistics & MVP Points
          </p>

          <p className="mt-1 text-[10px] text-[var(--fcl-muted)]">
            Tap any player to view their complete
            profile.
          </p>
        </div>
      </main>

      {/* =================================================
          CENTRALIZED PLAYER CARD MODAL
      ================================================= */}

      <PlayerCardModal
        selectedPlayer={selectedPlayer}
        onClose={closePlayer}
        tournamentsData={tournamentsData}
        allPlayers={players}
      />
    </div>
  );
}

/* =========================================================
   FCL PREMIUM CSS
   DARK / LIGHT VARIABLE SYSTEM
========================================================= */

const RANKINGS_STYLES = `

/* =========================================================
   THEME VARIABLES
========================================================= */

.fcl-rankings {
  --fcl-primary: #1877F2;
  --fcl-gold: #f59e0b;
  --fcl-green: #22c55e;
  --fcl-purple: #a855f7;
  --fcl-pink: #ec4899;
  --fcl-cyan: #22d3ee;

  --fcl-bg: #020617;
  --fcl-card: #0f172a;
  --fcl-card-secondary: #0b1220;
  --fcl-surface: #070d19;

  --fcl-text: #ffffff;
  --fcl-secondary-text: #cbd5e1;
  --fcl-muted: #94a3b8;

  --fcl-border: #172033;
  --fcl-border-hover: #1877F2;

  --fcl-input: #0b1220;
  --fcl-progress-bg: #020617;

  --fcl-filter-bg: rgba(2, 6, 23, 0.94);

  background: var(--fcl-bg);
  color: var(--fcl-text);

  color-scheme: dark;

  transition:
    background-color .3s ease,
    color .3s ease;
}

.fcl-rankings[data-fcl-theme="light"] {
  --fcl-bg: #ffffff;
  --fcl-card: #f8fafc;
  --fcl-card-secondary: #f1f5f9;
  --fcl-surface: #f1f5f9;

  --fcl-text: #0f172a;
  --fcl-secondary-text: #475569;
  --fcl-muted: #64748b;

  --fcl-border: #e2e8f0;
  --fcl-border-hover: #1877F2;

  --fcl-input: #f8fafc;
  --fcl-progress-bg: #e2e8f0;

  --fcl-filter-bg: rgba(255, 255, 255, 0.94);

  color-scheme: light;
}

/* =========================================================
   KEYFRAMES
========================================================= */

@keyframes fclRankReveal {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fclRankFloat {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-7px);
  }
}

@keyframes fclRankGlow {
  0%, 100% {
    box-shadow:
      0 0 25px rgba(245, 158, 11, .16),
      0 15px 45px rgba(0, 0, 0, .13);
  }

  50% {
    box-shadow:
      0 0 55px rgba(245, 158, 11, .32),
      0 20px 55px rgba(0, 0, 0, .18);
  }
}

@keyframes fclRankShine {
  0% {
    transform: translateX(-180%) skewX(-18deg);
  }

  55%, 100% {
    transform: translateX(330%) skewX(-18deg);
  }
}

@keyframes fclRankBar {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

@keyframes fclRankPulse {
  0%, 100% {
    opacity: 1;
  }

  50% {
    opacity: .45;
  }
}

@keyframes fclRankSkeleton {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@keyframes fclRankOrb {
  0%, 100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-22px) scale(1.08);
  }
}

/* =========================================================
   GENERAL ANIMATIONS
========================================================= */

.fcl-reveal {
  animation: fclRankReveal .7s
    cubic-bezier(.2,.8,.2,1) both;
}

.fcl-row {
  animation: fclRankReveal .45s ease both;
}

.fcl-podium-wrap {
  animation: fclRankReveal .7s
    cubic-bezier(.2,.8,.2,1) both;
}

.fcl-crown {
  animation: fclRankFloat 3s ease-in-out infinite;
}

.fcl-rating-bar {
  background:
    linear-gradient(
      90deg,
      #d97706,
      #f59e0b,
      #fbbf24
    );

  transform-origin: left;

  animation: fclRankBar 1.1s
    cubic-bezier(.2,.8,.2,1) both;
}

.fcl-live-dot {
  background: #f59e0b;

  box-shadow:
    0 0 12px rgba(245,158,11,.8);

  animation: fclRankPulse 1.6s infinite;
}

/* =========================================================
   BACKGROUND
========================================================= */

.fcl-background {
  z-index: 0;
}

.fcl-grid {
  opacity: .24;

  background-image:
    linear-gradient(
      rgba(24,119,242,.08) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(24,119,242,.08) 1px,
      transparent 1px
    );

  background-size: 48px 48px;

  mask-image:
    linear-gradient(
      to bottom,
      black,
      transparent 85%
    );
}

.fcl-rankings[data-fcl-theme="light"] .fcl-grid {
  opacity: .38;
}

.fcl-orb {
  filter: blur(110px);
  opacity: .75;
  animation: fclRankOrb 11s ease-in-out infinite;
}

.fcl-orb-blue {
  background: rgba(24,119,242,.13);
}

.fcl-orb-gold {
  background: rgba(245,158,11,.08);
  animation-delay: -3s;
}

.fcl-orb-purple {
  background: rgba(168,85,247,.07);
  animation-delay: -6s;
}

.fcl-rankings[data-fcl-theme="light"] .fcl-orb {
  opacity: .4;
}

/* =========================================================
   HEADER
========================================================= */

.fcl-eyebrow {
  color: #60a5fa;
}

.fcl-rankings[data-fcl-theme="light"] .fcl-eyebrow {
  color: #1877F2;
}

.fcl-live-badge {
  color: #fbbf24;
  background: rgba(245,158,11,.1);
  border: 1px solid rgba(245,158,11,.24);
}

.fcl-rankings[data-fcl-theme="light"] .fcl-live-badge {
  color: #b45309;
  background: #fffbeb;
}

.fcl-hall-button {
  color: #fbbf24;

  background:
    linear-gradient(
      120deg,
      rgba(245,158,11,.16),
      rgba(245,158,11,.06)
    );

  border: 1px solid rgba(245,158,11,.4);

  box-shadow:
    0 8px 25px rgba(245,158,11,.1);
}

.fcl-hall-button:hover {
  border-color: #f59e0b;

  box-shadow:
    0 12px 30px rgba(245,158,11,.2);
}

.fcl-rankings[data-fcl-theme="light"] .fcl-hall-button {
  color: #92400e;
  background: #fffbeb;
}

.fcl-main-title {
  color: var(--fcl-text);
}

.fcl-gradient-text {
  background:
    linear-gradient(
      100deg,
      #1877F2 5%,
      #60a5fa 48%,
      #22d3ee 100%
    );

  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.fcl-description {
  color: var(--fcl-muted);
}

.fcl-search-input {
  color: var(--fcl-text);
  background: var(--fcl-input);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 5px 20px rgba(0,0,0,.04);
}

.fcl-search-input::placeholder {
  color: var(--fcl-muted);
}

.fcl-search-input:focus {
  border-color: #1877F2;

  box-shadow:
    0 0 0 3px rgba(24,119,242,.13),
    0 8px 25px rgba(24,119,242,.07);
}

.fcl-formula-button {
  color: #fbbf24;

  background: rgba(245,158,11,.1);

  border: 1px solid rgba(245,158,11,.3);
}

.fcl-formula-button:hover {
  color: #020617;
  background: #f59e0b;
  border-color: #f59e0b;
}

.fcl-rankings[data-fcl-theme="light"] .fcl-formula-button {
  color: #92400e;
  background: #fffbeb;
}

.fcl-rankings[data-fcl-theme="light"] .fcl-formula-button:hover {
  color: #020617;
  background: #f59e0b;
}

/* =========================================================
   SUMMARY CARDS
========================================================= */

.fcl-summary-card {
  background: var(--fcl-card);
  border: 1px solid var(--fcl-border);

  box-shadow:
    0 10px 35px rgba(0,0,0,.05);

  transition:
    transform .3s ease,
    border-color .3s ease,
    box-shadow .3s ease;
}

.fcl-summary-card:hover {
  transform: translateY(-5px);

  box-shadow:
    0 15px 40px rgba(24,119,242,.09);
}

.fcl-summary-blue:hover {
  border-color: rgba(24,119,242,.45);
}

.fcl-summary-green:hover {
  border-color: rgba(34,197,94,.45);
}

.fcl-summary-gold:hover {
  border-color: rgba(245,158,11,.45);
}

.fcl-summary-purple:hover {
  border-color: rgba(168,85,247,.45);
}

.fcl-summary-label {
  color: var(--fcl-muted);
}

.fcl-summary-icon {
  background: var(--fcl-card-secondary);
  border: 1px solid var(--fcl-border);
}

/* =========================================================
   FORMULA PANEL
========================================================= */

.fcl-formula-panel {
  background:
    linear-gradient(
      120deg,
      rgba(245,158,11,.09),
      var(--fcl-card),
      rgba(24,119,242,.04)
    );

  border: 1px solid rgba(245,158,11,.25);

  box-shadow:
    0 15px 40px rgba(0,0,0,.05);
}

.fcl-formula-stat {
  background: var(--fcl-card-secondary);
  border: 1px solid var(--fcl-border);
}

/* =========================================================
   PODIUM
========================================================= */

.fcl-podium-card {
  min-height: 100%;

  border: 2px solid transparent;

  box-shadow:
    0 15px 45px rgba(0,0,0,.13);
}

.fcl-podium-gold {
  border-color: rgba(245,158,11,.65);

  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgba(245,158,11,.2),
      transparent 60%
    ),
    linear-gradient(
      180deg,
      #221707,
      #100d09 65%,
      #080808
    );
}

.fcl-podium-silver {
  border-color: rgba(148,163,184,.5);

  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgba(148,163,184,.15),
      transparent 60%
    ),
    linear-gradient(
      180deg,
      #1b2534,
      #0c1420 65%,
      #080c12
    );
}

.fcl-podium-bronze {
  border-color: rgba(217,119,6,.5);

  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgba(217,119,6,.17),
      transparent 60%
    ),
    linear-gradient(
      180deg,
      #241606,
      #140d07 65%,
      #090808
    );
}

.fcl-podium-champion {
  animation:
    fclRankGlow 4s ease-in-out infinite;
}

.fcl-podium-orb {
  background: rgba(245,158,11,.13);
}

.fcl-podium-silver .fcl-podium-orb {
  background: rgba(148,163,184,.1);
}

.fcl-podium-bronze .fcl-podium-orb {
  background: rgba(217,119,6,.1);
}

.fcl-podium-avatar {
  border: 3px solid;

  background: #020617;

  transition:
    transform .4s ease,
    box-shadow .4s ease;
}

.fcl-podium-card:hover .fcl-podium-avatar {
  transform: scale(1.07);
}

.fcl-podium-name {
  color: #ffffff;

  transition: color .3s ease;
}

.fcl-podium-card:hover .fcl-podium-name {
  color: #60a5fa;
}

.fcl-podium-points {
  background: rgba(0,0,0,.3);

  border: 1px solid rgba(255,255,255,.09);
}

.fcl-podium-card .fcl-mini-stat {
  background: rgba(0,0,0,.24);

  border: 1px solid rgba(255,255,255,.06);
}

.fcl-podium-shine::after {
  content: "";

  position: absolute;

  top: -20%;
  bottom: -20%;
  left: -60%;

  width: 45%;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.12),
      transparent
    );

  animation:
    fclRankShine 5s ease-in-out infinite;
}

.fcl-gold-dot {
  background: #f59e0b;

  box-shadow:
    0 0 14px rgba(245,158,11,.65);
}

.fcl-gold-text {
  color: #f59e0b;
}

.fcl-season-badge {
  color: #f59e0b;

  background: rgba(245,158,11,.08);
  border: 1px solid rgba(245,158,11,.25);
}

.fcl-rankings[data-fcl-theme="light"] .fcl-podium-gold {
  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgba(245,158,11,.18),
      transparent 65%
    ),
    linear-gradient(
      180deg,
      #fffaf0,
      #fff7e8,
      #ffffff
    );
}

.fcl-rankings[data-fcl-theme="light"] .fcl-podium-silver {
  background:
    linear-gradient(
      180deg,
      #f1f5f9,
      #f8fafc,
      #ffffff
    );
}

.fcl-rankings[data-fcl-theme="light"] .fcl-podium-bronze {
  background:
    linear-gradient(
      180deg,
      #fff5eb,
      #fffaf5,
      #ffffff
    );
}

.fcl-rankings[data-fcl-theme="light"] .fcl-podium-name {
  color: #0f172a;
}

.fcl-rankings[data-fcl-theme="light"] .fcl-podium-points {
  background: rgba(255,255,255,.75);

  border-color: rgba(15,23,42,.08);
}

.fcl-rankings[data-fcl-theme="light"] .fcl-podium-card .fcl-mini-stat {
  background: rgba(255,255,255,.75);
  border-color: rgba(15,23,42,.07);
}

.fcl-rankings[data-fcl-theme="light"] .fcl-podium-gold .fcl-podium-points > p:nth-child(2) {
  color: #b45309 !important;
}

.fcl-rankings[data-fcl-theme="light"] .fcl-podium-silver .fcl-podium-points > p:nth-child(2) {
  color: #475569 !important;
}

.fcl-rankings[data-fcl-theme="light"] .fcl-podium-bronze .fcl-podium-points > p:nth-child(2) {
  color: #b45309 !important;
}

/* =========================================================
   FILTERS
========================================================= */

.fcl-filter-sticky {
  background: var(--fcl-filter-bg);

  border: 1px solid var(--fcl-border);

  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  box-shadow:
    0 8px 30px rgba(0,0,0,.06);
}

.fcl-role-button {
  color: var(--fcl-secondary-text);

  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 4px 14px rgba(0,0,0,.03);
}

.fcl-role-button:hover {
  color: var(--fcl-text);

  border-color: rgba(24,119,242,.55);

  background:
    linear-gradient(
      120deg,
      rgba(24,119,242,.1),
      var(--fcl-card)
    );
}

.fcl-role-active,
.fcl-role-active:hover {
  color: #ffffff !important;

  background:
    linear-gradient(
      135deg,
      #1877F2,
      #2563eb
    ) !important;

  border-color: #1877F2 !important;

  box-shadow:
    0 8px 22px rgba(24,119,242,.25);
}

.fcl-role-count {
  color: var(--fcl-muted);

  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

.fcl-role-active .fcl-role-count {
  color: #ffffff;

  background: rgba(255,255,255,.2);

  border-color: rgba(255,255,255,.2);
}

.fcl-results-badge {
  color: var(--fcl-secondary-text);

  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);
}

.fcl-active-filter {
  color: #1877F2;

  background: rgba(24,119,242,.09);

  border: 1px solid rgba(24,119,242,.2);
}

/* =========================================================
   RANK BADGES
========================================================= */

.fcl-rank-badge {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 11px;

  font-weight: 900;
}

.fcl-rank-gold {
  color: #020617;

  background:
    linear-gradient(
      135deg,
      #fde68a,
      #f59e0b,
      #d97706
    );

  box-shadow:
    0 5px 15px rgba(245,158,11,.2);
}

.fcl-rank-silver {
  color: #020617;

  background:
    linear-gradient(
      135deg,
      #f8fafc,
      #cbd5e1,
      #94a3b8
    );
}

.fcl-rank-bronze {
  color: #ffffff;

  background:
    linear-gradient(
      135deg,
      #f59e0b,
      #b45309,
      #92400e
    );
}

.fcl-rank-normal {
  color: var(--fcl-muted);

  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

/* =========================================================
   PLAYER CARDS
========================================================= */

.fcl-player-mobile {
  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 5px 20px rgba(0,0,0,.035);
}

.fcl-player-mobile:hover {
  border-color: rgba(24,119,242,.45);

  background:
    linear-gradient(
      120deg,
      rgba(24,119,242,.07),
      var(--fcl-card)
    );

  transform: translateY(-2px);

  box-shadow:
    0 10px 28px rgba(24,119,242,.08);
}

.fcl-player-mobile:active {
  transform: scale(.99);
}

.fcl-player-avatar {
  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);

  transition:
    border-color .3s ease,
    transform .3s ease;
}

.group:hover .fcl-player-avatar {
  border-color: rgba(24,119,242,.55);
  transform: scale(1.04);
}

.fcl-player-name {
  color: var(--fcl-text);

  transition: color .3s ease;
}

.group:hover .fcl-player-name {
  color: #1877F2;
}

.fcl-role-chip {
  color: var(--fcl-muted);

  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

.fcl-mini-stat {
  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

/* =========================================================
   DESKTOP TABLE
========================================================= */

.fcl-table-wrapper {
  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 15px 50px rgba(0,0,0,.07);
}

.fcl-table-head {
  color: var(--fcl-muted);

  background: var(--fcl-surface);

  border-bottom: 1px solid var(--fcl-border);
}

.fcl-table-row {
  border-bottom: 1px solid var(--fcl-border);
}

.fcl-table-row:last-child {
  border-bottom: none;
}

.fcl-table-row:hover {
  background: rgba(24,119,242,.075);
}

/* =========================================================
   LOAD MORE
========================================================= */

.fcl-load-more {
  color: #60a5fa;

  background:
    linear-gradient(
      120deg,
      rgba(24,119,242,.12),
      rgba(24,119,242,.04)
    );

  border: 1px solid rgba(24,119,242,.35);

  box-shadow:
    0 8px 25px rgba(24,119,242,.06);
}

.fcl-load-more:hover {
  color: #ffffff;

  background: #1877F2;

  border-color: #1877F2;

  box-shadow:
    0 12px 30px rgba(24,119,242,.22);
}

.fcl-rankings[data-fcl-theme="light"] .fcl-load-more {
  color: #1877F2;
}

.fcl-rankings[data-fcl-theme="light"] .fcl-load-more:hover {
  color: #ffffff;
}

/* =========================================================
   COMPARISON BANNER
========================================================= */

.fcl-compare-banner {
  background:
    linear-gradient(
      120deg,
      rgba(24,119,242,.1),
      var(--fcl-card),
      rgba(168,85,247,.06)
    );

  border: 1px solid rgba(24,119,242,.22);

  box-shadow:
    0 15px 45px rgba(24,119,242,.06);
}

.fcl-compare-glow {
  background: rgba(24,119,242,.15);
  filter: blur(65px);
}

.fcl-compare-icon {
  background: rgba(24,119,242,.13);

  border: 1px solid rgba(24,119,242,.2);
}

.fcl-compare-button {
  color: #ffffff;

  background:
    linear-gradient(
      135deg,
      #1877F2,
      #2563eb
    );

  box-shadow:
    0 8px 24px rgba(24,119,242,.22);
}

.fcl-compare-button:hover {
  box-shadow:
    0 14px 30px rgba(24,119,242,.32);
}

/* =========================================================
   SKELETON
========================================================= */

.fcl-skeleton-card {
  background: var(--fcl-card);
  border: 1px solid var(--fcl-border);
}

.fcl-skeleton {
  background:
    linear-gradient(
      90deg,
      var(--fcl-card-secondary) 20%,
      var(--fcl-border) 50%,
      var(--fcl-card-secondary) 80%
    );

  background-size: 200% 100%;

  animation:
    fclRankSkeleton 1.5s linear infinite;
}

/* =========================================================
   EMPTY / ERROR STATES
========================================================= */

.fcl-empty-state {
  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 10px 35px rgba(0,0,0,.04);
}

/* =========================================================
   MOBILE OPTIMIZATION
========================================================= */

@media (max-width: 639px) {

  .fcl-podium-grid {
    gap: 7px;
  }

  .fcl-podium-card {
    border-radius: 18px;
  }

  .fcl-podium-first .fcl-podium-card {
    padding-top: 23px;
    padding-bottom: 18px;
  }

  .fcl-podium-name {
    overflow-wrap: anywhere;
  }

  .fcl-podium-points {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .fcl-podium-card .fcl-mini-stat {
    padding-left: 1px;
    padding-right: 1px;
  }

  .fcl-filter-sticky {
    border-left: none;
    border-right: none;
    border-radius: 0;
  }

  .fcl-role-button {
    min-height: 60px;
  }

  .fcl-role-all {
    min-height: 48px;
  }

  .fcl-player-mobile {
    border-radius: 18px;
  }
}

@media (max-width: 370px) {

  .fcl-podium-card {
    padding-left: 4px;
    padding-right: 4px;
  }

  .fcl-podium-name {
    font-size: 10px;
  }

  .fcl-podium-points p:nth-child(2) {
    font-size: 14px;
  }

  .fcl-role-button {
    padding-left: 3px;
    padding-right: 3px;
  }
}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  .fcl-reveal,
  .fcl-row,
  .fcl-podium-wrap,
  .fcl-crown,
  .fcl-rating-bar,
  .fcl-live-dot,
  .fcl-orb,
  .fcl-skeleton,
  .fcl-podium-champion {
    animation: none !important;
  }

  .fcl-podium-shine::after {
    animation: none !important;
    display: none;
  }

  .fcl-rankings *,
  .fcl-rankings *::before,
  .fcl-rankings *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}

`;