"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

import Link from "next/link";

/* ================================================================
   TYPES
================================================================ */

interface Player {
  id?: number;
  name: string;
  nickName?: string;
  role: string;

  photo?: string;
  photoUrl?: string;

  totalTournament?: number;
  matches: number;
  runs: number;
  wickets: number;

  innings?: number;
  notOut?: number;

  fours?: number;
  sixes?: number;

  champion?: number;
  runnersUp?: number;
  totalFinal?: number;

  highestRunScorer?: number;
  topWicketTaker?: number;

  debutYear?: string;
  debutTeam?: string;

  maxRuns?: number;
  maxWickets?: number;
}

type StatKey =
  | "points"
  | "matches"
  | "tournaments"
  | "runs"
  | "battingAvg"
  | "maxRuns"
  | "wickets"
  | "bowlingAvg"
  | "maxWickets"
  | "champion"
  | "totalFinal";

type StatDefinition = {
  key: string;
  label: string;
  icon: string;
  value: (player: Player) => string | number;
  compareKey?: StatKey;
  color?: "blue" | "amber" | "green";
  highlight?: boolean;
};

/* ================================================================
   CONSTANTS
================================================================ */

const PRIMARY_BLUE = "#1877F2";

const FALLBACK_PHOTO =
  "/FCL Cricket Avatar Placeholder.jpg";

const PLAYER_COLORS = [
  "#1877F2",
  "#f59e0b",
  "#22c55e",
  "#a855f7",
];

/* ================================================================
   THEME DETECTION
   FCL HOME PAGE COMPATIBLE
================================================================ */

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

      if (dt === "dark" || dt === "light") {
        return dt === "dark";
      }

      const cls = `${h.className} ${b.className}`.toLowerCase();

      if (/\blight\b/.test(cls)) return false;
      if (/\bdark\b/.test(cls)) return true;

      const scheme = h.style.colorScheme;

      if (scheme === "light" || scheme === "dark") {
        return scheme === "dark";
      }

      try {
        const saved = localStorage.getItem("theme");

        if (saved === "light" || saved === "dark") {
          return saved === "dark";
        }
      } catch {}

      return window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
    };

    const update = () => setIsDark(read());

    update();

    const observer = new MutationObserver(update);

    const options = {
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

/* ================================================================
   NUMBER HELPERS
================================================================ */

function num(value: unknown): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

/* ================================================================
   PERFORMANCE CALCULATIONS
================================================================ */

function calculateBattingAvg(player: Player) {
  const innings = num(player.innings);
  const notOut = num(player.notOut);
  const runs = num(player.runs);

  const dismissals = innings - notOut;

  if (dismissals > 0) {
    return Number((runs / dismissals).toFixed(2));
  }

  if (innings > 0) {
    return Number((runs / innings).toFixed(2));
  }

  return 0;
}

function calculateBowlingAvg(player: Player) {
  const matches = num(player.matches);
  const wickets = num(player.wickets);

  if (matches <= 0) return 0;

  return Number((wickets / matches).toFixed(2));
}

function calculateFclPoints(player: Player) {
  const runs = num(player.runs);
  const sixes = num(player.sixes);
  const fours = num(player.fours);
  const wickets = num(player.wickets);
  const matches = num(player.matches);

  const champion = num(player.champion);
  const runnersUp = num(player.runnersUp);

  const highestRuns = num(player.highestRunScorer);
  const topWickets = num(player.topWicketTaker);

  return Math.round(
    runs +
      sixes * 2 +
      fours +
      wickets * 20 +
      matches * 2 +
      champion * 100 +
      runnersUp * 40 +
      highestRuns * 30 +
      topWickets * 30
  );
}

/* ================================================================
   STAT VALUE HELPER
================================================================ */

function getStatValue(
  player: Player,
  key: StatKey
): number {
  switch (key) {
    case "points":
      return calculateFclPoints(player);

    case "matches":
      return num(player.matches);

    case "tournaments":
      return num(player.totalTournament);

    case "runs":
      return num(player.runs);

    case "battingAvg":
      return calculateBattingAvg(player);

    case "maxRuns":
      return num(
        player.maxRuns ??
          player.highestRunScorer
      );

    case "wickets":
      return num(player.wickets);

    case "bowlingAvg":
      return calculateBowlingAvg(player);

    case "maxWickets":
      return num(
        player.maxWickets ??
          player.topWicketTaker
      );

    case "champion":
      return num(player.champion);

    case "totalFinal":
      return num(player.totalFinal);

    default:
      return 0;
  }
}

/* ================================================================
   STAT DEFINITIONS
================================================================ */

const STAT_DEFINITIONS: StatDefinition[] = [
  {
    key: "points",
    label: "FCL Points",
    icon: "⭐",
    value: calculateFclPoints,
    compareKey: "points",
    color: "blue",
    highlight: true,
  },
  {
    key: "matches",
    label: "Matches Played",
    icon: "🏏",
    value: (p) => num(p.matches),
    compareKey: "matches",
  },
  {
    key: "tournaments",
    label: "Tournaments",
    icon: "🏆",
    value: (p) => num(p.totalTournament),
    compareKey: "tournaments",
  },
  {
    key: "runs",
    label: "Total Runs",
    icon: "🏃",
    value: (p) => num(p.runs),
    compareKey: "runs",
    color: "blue",
  },
  {
    key: "battingAvg",
    label: "Batting Average",
    icon: "📈",
    value: calculateBattingAvg,
    compareKey: "battingAvg",
    color: "blue",
  },
  {
    key: "maxRuns",
    label: "Max Runs",
    icon: "🔥",
    value: (p) =>
      num(p.maxRuns ?? p.highestRunScorer),
    compareKey: "maxRuns",
  },
  {
    key: "boundaries",
    label: "Boundaries (4s / 6s)",
    icon: "💥",
    value: (p) =>
      `${num(p.fours)} / ${num(p.sixes)}`,
  },
  {
    key: "wickets",
    label: "Total Wickets",
    icon: "🎯",
    value: (p) => num(p.wickets),
    compareKey: "wickets",
    color: "amber",
  },
  {
    key: "bowlingAvg",
    label: "Wickets Per Match",
    icon: "⚡",
    value: calculateBowlingAvg,
    compareKey: "bowlingAvg",
    color: "amber",
  },
  {
    key: "maxWickets",
    label: "Max Wickets",
    icon: "🎳",
    value: (p) =>
      num(p.maxWickets ?? p.topWicketTaker),
    compareKey: "maxWickets",
    color: "amber",
  },
  {
    key: "finals",
    label: "Finals / Champion",
    icon: "👑",
    value: (p) =>
      `${num(p.totalFinal)} / ${num(p.champion)}`,
  },
  {
    key: "runnersUp",
    label: "Runners-Up",
    icon: "🥈",
    value: (p) => num(p.runnersUp),
  },
  {
    key: "debutYear",
    label: "Debut Year",
    icon: "📅",
    value: (p) => p.debutYear || "N/A",
  },
  {
    key: "debutTeam",
    label: "Debut Team",
    icon: "🛡️",
    value: (p) => p.debutTeam || "N/A",
  },
];

/* ================================================================
   PLAYER PHOTO
================================================================ */

function getPlayerPhoto(player: Player) {
  const raw = player.photo || player.photoUrl;

  if (raw && raw.trim() && raw !== "—") {
    if (
      raw.startsWith("/") ||
      raw.startsWith("https://") ||
      raw.startsWith("http://")
    ) {
      return raw;
    }

    return `/players/${raw}`;
  }

  if (player.nickName?.trim()) {
    return `/players/${player.nickName
      .toLowerCase()
      .trim()}.jpg`;
  }

  return FALLBACK_PHOTO;
}

/* ================================================================
   PLAYER AVATAR
================================================================ */

function PlayerAvatar({
  player,
  size = "normal",
}: {
  player: Player;
  size?: "normal" | "large";
}) {
  const photoPath = getPlayerPhoto(player);

  const [imageSrc, setImageSrc] = useState(photoPath);

  useEffect(() => {
    setImageSrc(photoPath);
  }, [photoPath]);

  return (
    <div
      className={`cp-avatar relative shrink-0 overflow-hidden rounded-2xl border border-[#1877F2]/30 ${
        size === "large"
          ? "h-[76px] w-[76px]"
          : "h-12 w-12"
      }`}
    >
      <img
        src={imageSrc}
        alt={player.name}
        loading="lazy"
        className="h-full w-full object-cover"
        onError={() => {
          if (imageSrc !== FALLBACK_PHOTO) {
            setImageSrc(FALLBACK_PHOTO);
          }
        }}
      />
    </div>
  );
}

/* ================================================================
   SEARCH SELECTOR
================================================================ */

interface PlayerSelectorProps {
  index: number;
  players: Player[];
  selectedName: string;
  searchValue: string;
  selectedNames: string[];
  active: boolean;

  onSearch: (index: number, value: string) => void;

  onSelect: (index: number, player: Player) => void;

  onFocus: (index: number) => void;

  onClear: (index: number) => void;
}

function PlayerSelector({
  index,
  players,
  selectedName,
  searchValue,
  selectedNames,
  active,
  onSearch,
  onSelect,
  onFocus,
  onClear,
}: PlayerSelectorProps) {
  const color = PLAYER_COLORS[index];

  const selectedPlayer = players.find(
    (player) => player.name === selectedName
  );

  const query = searchValue.trim().toLowerCase();

  const filteredPlayers = useMemo(() => {
    const available = players.filter(
      (player) =>
        !selectedNames.includes(player.name) ||
        player.name === selectedName
    );

    if (!query) {
      return available.slice(0, 12);
    }

    return available
      .filter(
        (player) =>
          player.name
            .toLowerCase()
            .includes(query) ||
          (player.nickName || "")
            .toLowerCase()
            .includes(query) ||
          (player.role || "")
            .toLowerCase()
            .includes(query)
      )
      .slice(0, 15);
  }, [
    players,
    query,
    selectedNames,
    selectedName,
  ]);

  return (
    <div
      className="cp-selector relative min-w-0 rounded-[22px] border p-3.5 sm:p-4"
      style={
        {
          "--accent": color,
        } as React.CSSProperties
      }
    >
      {/* Top Accent */}

      <span
        className="absolute inset-x-5 top-0 h-[3px] rounded-b-full"
        style={{
          backgroundColor: color,
        }}
      />

      {/* Selector Heading */}

      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="cp-sub text-[10px] font-black uppercase tracking-wider">
          Player {index + 1}
        </span>

        <span
          className="rounded-lg border px-2 py-1 text-[9px] font-black"
          style={{
            color,
            borderColor: `${color}40`,
            backgroundColor: `${color}12`,
          }}
        >
          #{index + 1}
        </span>
      </div>

      {/* Selected Player Preview */}

      {selectedPlayer && (
        <div className="mb-3 flex items-center gap-2.5">
          <PlayerAvatar player={selectedPlayer} />

          <div className="min-w-0 flex-1">
            <p className="cp-head truncate text-xs font-black">
              {selectedPlayer.name}
            </p>

            <p className="cp-sub mt-0.5 truncate text-[10px]">
              {selectedPlayer.role || "FCL Player"}
            </p>
          </div>
        </div>
      )}

      {/* Search Input */}

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
          🔍
        </span>

        <input
          type="text"
          value={searchValue}
          onChange={(event) =>
            onSearch(index, event.target.value)
          }
          onFocus={() => onFocus(index)}
          placeholder="Search player..."
          aria-label={`Search player ${index + 1}`}
          autoComplete="off"
          className="cp-input w-full rounded-xl border py-3 pl-9 pr-9 text-[11px] font-bold outline-none sm:text-xs"
        />

        {searchValue && (
          <button
            type="button"
            aria-label="Clear player selection"
            onClick={() => onClear(index)}
            className="cp-sub absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-xs hover:bg-[#1877F2]/10"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}

      {active && (
        <div className="cp-dropdown absolute left-3 right-3 top-[calc(100%-2px)] z-50 max-h-[240px] overflow-y-auto rounded-2xl border p-1.5 shadow-2xl sm:left-4 sm:right-4">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player, pIndex) => (
              <button
                key={`${player.id ?? player.name}-${pIndex}`}
                type="button"
                onClick={() =>
                  onSelect(index, player)
                }
                className="cp-dropdown-item flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors"
              >
                <PlayerAvatar player={player} />

                <div className="min-w-0 flex-1">
                  <p className="cp-head truncate text-[11px] font-black">
                    {player.name}
                  </p>

                  <p className="cp-sub mt-0.5 truncate text-[9px]">
                    {player.nickName
                      ? `@${player.nickName}`
                      : player.role || "Player"}
                  </p>
                </div>

                <span className="cp-blue text-sm font-black">
                  +
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-5 text-center">
              <p className="cp-sub text-[11px]">
                No available players found
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selection Status */}

      <div className="mt-3 flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            selectedPlayer
              ? "bg-[#22c55e]"
              : "bg-slate-400"
          }`}
        />

        <span className="cp-sub text-[9px] font-semibold">
          {selectedPlayer
            ? "Player Selected"
            : "Waiting for Selection"}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   STAT ROW
================================================================ */

function StatRow({
  stat,
  player,
  isBest,
  maxValue,
}: {
  stat: StatDefinition;
  player: Player;
  isBest: boolean;
  maxValue: number;
}) {
  const rawValue = stat.value(player);

  const displayValue =
    typeof rawValue === "number"
      ? formatNumber(rawValue)
      : rawValue;

  const currentValue = stat.compareKey
    ? getStatValue(player, stat.compareKey)
    : 0;

  const percentage =
    stat.compareKey && maxValue > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (currentValue / maxValue) * 100
          )
        )
      : 0;

  return (
    <div className="cp-stat-row border-b py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        {/* Label */}

        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[13px]">
            {stat.icon}
          </span>

          <span className="cp-sub text-[11px] font-semibold">
            {stat.label}
          </span>
        </div>

        {/* Value */}

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`text-right text-xs font-black ${
              isBest
                ? "cp-best rounded-lg border px-2 py-1"
                : stat.color === "amber"
                ? "cp-amber"
                : stat.color === "blue"
                ? "cp-blue"
                : "cp-head"
            }`}
          >
            {displayValue}
          </span>

          {isBest && (
            <span
              title="Best among selected players"
              className="text-xs"
            >
              🔥
            </span>
          )}
        </div>
      </div>

      {/* Performance Bar */}

      {stat.compareKey && (
        <div className="cp-progress-track mt-2.5 h-1 overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isBest
                ? "bg-[#22c55e]"
                : stat.color === "amber"
                ? "bg-[#f59e0b]"
                : "bg-[#1877F2]"
            }`}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ================================================================
   PLAYER COMPARISON CARD
================================================================ */

function ComparisonCard({
  player,
  index,
  selectedPlayers,
  maxValues,
}: {
  player: Player | null;
  index: number;
  selectedPlayers: Player[];
  maxValues: Record<StatKey, number>;
}) {
  const color = PLAYER_COLORS[index];

  if (!player) {
    return (
      <div
        className="cp-empty flex min-h-[650px] flex-col items-center justify-center rounded-[26px] border border-dashed p-6 text-center"
        style={
          {
            "--accent": color,
          } as React.CSSProperties
        }
      >
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#1877F2]/20 bg-[#1877F2]/10 text-4xl">
          👤
        </div>

        <h3 className="cp-head text-base font-black">
          Player {index + 1}
        </h3>

        <p className="cp-sub mt-3 max-w-[200px] text-xs leading-6">
          ওপরের সার্চ বক্স থেকে একজন প্লেয়ার নির্বাচন
          করুন।
        </p>

        <div className="mt-5 rounded-full border border-[#1877F2]/20 bg-[#1877F2]/10 px-4 py-2">
          <span className="cp-blue text-[10px] font-black">
            Awaiting Selection
          </span>
        </div>
      </div>
    );
  }

  const points = calculateFclPoints(player);

  const battingAvg = calculateBattingAvg(player);

  const bowlingAvg = calculateBowlingAvg(player);

  const isTopPoints =
    selectedPlayers.length > 1 &&
    points > 0 &&
    points === maxValues.points;

  return (
    <article
      className="cp-comparison-card group relative flex h-full flex-col overflow-hidden rounded-[26px] border"
      style={
        {
          "--accent": color,
        } as React.CSSProperties
      }
    >
      {/* Top Gradient */}

      <div
        className="absolute inset-x-0 top-0 h-[4px]"
        style={{
          background: `linear-gradient(90deg, ${color}, #1877F2, transparent)`,
        }}
      />

      {/* Ambient Glow */}

      <div
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-20 blur-[70px]"
        style={{
          backgroundColor: color,
        }}
      />

      {/* Player Header */}

      <div className="relative border-b border-[#1877F2]/10 p-5">
        {/* Position */}

        <div className="mb-4 flex items-center justify-between">
          <span className="cp-sub text-[10px] font-black uppercase tracking-[0.2em]">
            Comparison Player
          </span>

          <span
            className="rounded-lg border px-2.5 py-1 text-[10px] font-black"
            style={{
              color,
              borderColor: `${color}40`,
              backgroundColor: `${color}12`,
            }}
          >
            #{index + 1}
          </span>
        </div>

        {/* Avatar and Name */}

        <div className="flex items-center gap-3">
          <PlayerAvatar
            player={player}
            size="large"
          />

          <div className="min-w-0 flex-1">
            <h3
              className="cp-head truncate text-[16px] font-black tracking-tight"
              title={player.name}
            >
              {player.name}
            </h3>

            {player.nickName && (
              <p className="cp-sub mt-1 truncate text-[11px] font-medium">
                @{player.nickName}
              </p>
            )}

            <span className="cp-role mt-2 inline-flex max-w-full items-center truncate rounded-lg border px-2.5 py-1 text-[10px] font-black">
              🏏 {player.role || "FCL Player"}
            </span>
          </div>
        </div>

        {/* Points Hero */}

        <div className="cp-points-box relative mt-5 overflow-hidden rounded-2xl border p-4">
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <p className="cp-sub text-[9px] font-black uppercase tracking-[0.18em]">
                Total FCL Points
              </p>

              <p className="cp-gradient-text mt-1 text-[29px] font-black leading-none tracking-tight">
                {formatNumber(points)}
              </p>

              <p className="cp-sub mt-1 text-[9px] font-bold">
                Performance Rating Points
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-2xl">
              {isTopPoints ? "👑" : "⭐"}
            </div>
          </div>
        </div>

        {/* Quick Stats */}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="cp-quick-stat rounded-xl border p-2.5 text-center">
            <p className="cp-blue text-[16px] font-black">
              {formatNumber(num(player.runs))}
            </p>

            <p className="cp-sub mt-1 text-[9px] font-bold">
              Runs
            </p>
          </div>

          <div className="cp-quick-stat rounded-xl border p-2.5 text-center">
            <p className="cp-amber text-[16px] font-black">
              {formatNumber(num(player.wickets))}
            </p>

            <p className="cp-sub mt-1 text-[9px] font-bold">
              Wickets
            </p>
          </div>

          <div className="cp-quick-stat rounded-xl border p-2.5 text-center">
            <p className="cp-emerald text-[16px] font-black">
              {formatNumber(num(player.champion))}
            </p>

            <p className="cp-sub mt-1 text-[9px] font-bold">
              Titles
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}

      <div className="relative flex-1 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-5 rounded-full bg-[#1877F2]" />

          <span className="cp-blue text-[10px] font-black uppercase tracking-[0.15em]">
            Detailed Statistics
          </span>
        </div>

        <div>
          {STAT_DEFINITIONS.map((stat) => {
            const compareValue = stat.compareKey
              ? getStatValue(
                  player,
                  stat.compareKey
                )
              : 0;

            const maximum = stat.compareKey
              ? maxValues[stat.compareKey]
              : 0;

            const isBest =
              selectedPlayers.length > 1 &&
              !!stat.compareKey &&
              maximum > 0 &&
              compareValue === maximum;

            return (
              <StatRow
                key={stat.key}
                stat={stat}
                player={player}
                isBest={isBest}
                maxValue={maximum}
              />
            );
          })}
        </div>
      </div>

      {/* Card Footer */}

      <div className="cp-card-footer flex items-center justify-between border-t px-5 py-4">
        <span className="cp-sub text-[10px] font-bold">
          FCL Official Statistics
        </span>

        <span className="cp-blue text-xs font-black">
          🏏
        </span>
      </div>

      {/* Hidden Calculations Reference */}

      <span className="sr-only">
        Batting Average {battingAvg}.
        Wickets Per Match {bowlingAvg}.
      </span>
    </article>
  );
}

/* ================================================================
   AUCTION ANALYSIS
================================================================ */

interface AnalysisItem {
  player: Player;
  impactScore: number;
  batAvg: number;
  finals: number;
  champs: number;
  matches: number;
  runs: number;
  wickets: number;
  points: number;
}

function calculateImpact(player: Player): AnalysisItem {
  const points = calculateFclPoints(player);

  const finals = num(player.totalFinal);
  const champs = num(player.champion);

  const tournaments = Math.max(
    1,
    num(player.totalTournament)
  );

  const batAvg = calculateBattingAvg(player);

  const matches = num(player.matches);
  const runs = num(player.runs);
  const wickets = num(player.wickets);

  const impactScore =
    points +
    finals * 50 +
    champs * 80 +
    batAvg * 15 +
    (finals / tournaments) * 40;

  return {
    player,
    impactScore,
    batAvg,
    finals,
    champs,
    matches,
    runs,
    wickets,
    points,
  };
}

function AuctionAnalysis({
  selectedPlayers,
}: {
  selectedPlayers: Player[];
}) {
  const rankedPlayers = useMemo(() => {
    return selectedPlayers
      .map(calculateImpact)
      .sort(
        (a, b) =>
          b.impactScore - a.impactScore
      );
  }, [selectedPlayers]);

  if (rankedPlayers.length < 2) {
    return null;
  }

  const first = rankedPlayers[0];
  const second = rankedPlayers[1];

  const getReason = (item: AnalysisItem) => {
    return `${item.player.name} মোট ${
      item.matches
    } ম্যাচে ${formatNumber(item.runs)} রান, ${
      item.batAvg
    } ব্যাটিং এভারেজ, ${
      item.wickets
    } উইকেট, ${
      item.finals
    } ফাইনাল এবং ${
      item.champs
    } চ্যাম্পিয়নশিপ অর্জন করেছেন। FCL Points, ব্যাটিং পারফরম্যান্স এবং টুর্নামেন্ট সাফল্যের ভিত্তিতে তার Impact Score ${formatNumber(
      Math.round(item.impactScore)
    )}।`;
  };

  const recommendations = [
    {
      item: first,
      title: "Primary Auction Pick",
      subtitle: "১ম চয়েজ",
      icon: "👑",
      color: "#22c55e",
      reason: getReason(first),
    },
    {
      item: second,
      title: "Backup / Value Pick",
      subtitle: "২য় চয়েজ",
      icon: "⚡",
      color: "#1877F2",
      reason: getReason(second),
    },
  ];

  return (
    <section className="cp-analysis relative mt-10 overflow-hidden rounded-[28px] border p-5 sm:p-8">
      {/* Ambient Glow */}

      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-[90px]" />

      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[90px]" />

      <div className="relative">
        {/* Header */}

        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-2xl">
            🏆
          </div>

          <div>
            <span className="cp-amber text-[9px] font-black uppercase tracking-[0.2em]">
              FCL PERFORMANCE INTELLIGENCE
            </span>

            <h2 className="cp-head mt-1 text-[19px] font-black tracking-tight sm:text-[25px]">
              Auction Performance Analysis
            </h2>

            <p className="cp-sub mt-2 max-w-2xl text-[11px] leading-6 sm:text-xs">
              রান, উইকেট, ব্যাটিং এভারেজ, ফাইনাল ও
              চ্যাম্পিয়নশিপের পরিসংখ্যানের ভিত্তিতে
              সম্ভাব্য সেরা অকশন পছন্দ।
            </p>
          </div>
        </div>

        {/* Recommendation Cards */}

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {recommendations.map(
            (recommendation, index) => {
              const { item } = recommendation;

              return (
                <div
                  key={item.player.name}
                  className="cp-analysis-card relative overflow-hidden rounded-[22px] border p-5"
                  style={
                    {
                      "--accent": recommendation.color,
                    } as React.CSSProperties
                  }
                >
                  {/* Top Accent */}

                  <span
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{
                      backgroundColor:
                        recommendation.color,
                    }}
                  />

                  {/* Badge */}

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-lg px-3 py-1.5 text-[9px] font-black uppercase text-white"
                      style={{
                        backgroundColor:
                          recommendation.color,
                      }}
                    >
                      {recommendation.icon}{" "}
                      {recommendation.title}
                    </span>

                    <span className="cp-sub text-[10px] font-bold">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Player */}

                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      player={item.player}
                    />

                    <div className="min-w-0">
                      <h3 className="cp-head truncate text-[16px] font-black">
                        {item.player.name}
                      </h3>

                      <p className="cp-sub mt-1 text-[10px]">
                        {recommendation.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Impact Score */}

                  <div className="cp-impact-box mt-5 rounded-xl border p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="cp-sub text-[10px] font-black uppercase tracking-wider">
                        Impact Score
                      </span>

                      <span
                        className="text-xl font-black"
                        style={{
                          color:
                            recommendation.color,
                        }}
                      >
                        {formatNumber(
                          Math.round(
                            item.impactScore
                          )
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}

                  <p className="cp-text2 mt-4 text-xs leading-7">
                    {recommendation.reason}
                  </p>
                </div>
              );
            }
          )}
        </div>

        {/* Disclaimer */}

        <div className="cp-analysis-note mt-5 rounded-xl border px-4 py-3">
          <p className="cp-sub text-[10px] leading-6">
            📊 এই বিশ্লেষণটি পূর্বনির্ধারিত
            পরিসংখ্যানভিত্তিক ফর্মুলা ব্যবহার করে তৈরি।
            এটি কোনো লাইভ AI Prediction নয়।
            খেলোয়াড়ের বর্তমান ফর্ম, দলীয় প্রয়োজন,
            বাজেট ও ভূমিকা অনুযায়ী চূড়ান্ত অকশন
            সিদ্ধান্ত পরিবর্তিত হতে পারে।
          </p>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   LOADING SKELETON
================================================================ */

function ComparisonSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="cp-skeleton h-36 animate-pulse rounded-[22px] border"
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="cp-skeleton h-[460px] animate-pulse rounded-[26px] border"
          />
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE
================================================================ */

export default function PlayerComparePage() {
  const isDark = useIsDark();

  const [players, setPlayers] = useState<Player[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [compareCount, setCompareCount] =
    useState(2);

  const [selectedNames, setSelectedNames] =
    useState<string[]>(["", ""]);

  const [searchInputs, setSearchInputs] =
    useState<string[]>(["", ""]);

  const [
    activeDropdownIndex,
    setActiveDropdownIndex,
  ] = useState<number | null>(null);

  const searchAreaRef = useRef<HTMLDivElement>(null);

  /* ================================================================
     FETCH PLAYERS
  ================================================================ */

  useEffect(() => {
    const controller = new AbortController();

    const loadPlayers = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          "/api/fcl-data",
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load player data"
          );
        }

        const data = await response.json();

        let loadedPlayers: Player[] = [];

        if (
          data.players &&
          Array.isArray(data.players)
        ) {
          loadedPlayers = data.players;
        } else if (Array.isArray(data)) {
          loadedPlayers = data;
        }

        if (!controller.signal.aborted) {
          setPlayers(loadedPlayers);
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Error loading comparison data:",
          err
        );

        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadPlayers();

    return () => controller.abort();
  }, []);

  /* ================================================================
     CLOSE DROPDOWN OUTSIDE
  ================================================================ */

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (
        searchAreaRef.current &&
        !searchAreaRef.current.contains(
          event.target as Node
        )
      ) {
        setActiveDropdownIndex(null);
      }
    };

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setActiveDropdownIndex(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* ================================================================
     CHANGE PLAYER COUNT
  ================================================================ */

  const handleCountChange = (count: number) => {
    setCompareCount(count);

    setSelectedNames((previous) => {
      const updated = [...previous];

      while (updated.length < count) {
        updated.push("");
      }

      return updated.slice(0, count);
    });

    setSearchInputs((previous) => {
      const updated = [...previous];

      while (updated.length < count) {
        updated.push("");
      }

      return updated.slice(0, count);
    });

    setActiveDropdownIndex(null);
  };

  /* ================================================================
     SEARCH CHANGE
  ================================================================ */

  const handleSearchChange = (
    index: number,
    value: string
  ) => {
    setSearchInputs((previous) => {
      const updated = [...previous];

      updated[index] = value;

      return updated;
    });

    // Clear previous selection when search changes.

    setSelectedNames((previous) => {
      const updated = [...previous];

      updated[index] = "";

      return updated;
    });

    setActiveDropdownIndex(index);
  };

  /* ================================================================
     SELECT PLAYER
  ================================================================ */

  const handleSelectPlayer = (
    index: number,
    player: Player
  ) => {
    // Prevent duplicate players.

    if (
      selectedNames.some(
        (name, selectedIndex) =>
          selectedIndex !== index &&
          name === player.name
      )
    ) {
      return;
    }

    setSelectedNames((previous) => {
      const updated = [...previous];

      updated[index] = player.name;

      return updated;
    });

    setSearchInputs((previous) => {
      const updated = [...previous];

      updated[index] = player.nickName
        ? `${player.name} (@${player.nickName})`
        : player.name;

      return updated;
    });

    setActiveDropdownIndex(null);
  };

  /* ================================================================
     CLEAR PLAYER
  ================================================================ */

  const handleClearPlayer = (index: number) => {
    setSelectedNames((previous) => {
      const updated = [...previous];

      updated[index] = "";

      return updated;
    });

    setSearchInputs((previous) => {
      const updated = [...previous];

      updated[index] = "";

      return updated;
    });

    setActiveDropdownIndex(null);
  };

  /* ================================================================
     RESET COMPARISON
  ================================================================ */

  const resetComparison = useCallback(() => {
    setSelectedNames(
      Array(compareCount).fill("")
    );

    setSearchInputs(
      Array(compareCount).fill("")
    );

    setActiveDropdownIndex(null);
  }, [compareCount]);

  /* ================================================================
     SELECTED PLAYERS
  ================================================================ */

  const selectedPlayersBySlot = useMemo(() => {
    return selectedNames.map(
      (name) =>
        players.find(
          (player) => player.name === name
        ) || null
    );
  }, [selectedNames, players]);

  const selectedPlayersList = useMemo(
    () =>
      selectedPlayersBySlot.filter(
        (player): player is Player =>
          player !== null
      ),
    [selectedPlayersBySlot]
  );

  /* ================================================================
     MAX STAT VALUES
  ================================================================ */

  const maxValues = useMemo(() => {
    const keys: StatKey[] = [
      "points",
      "matches",
      "tournaments",
      "runs",
      "battingAvg",
      "maxRuns",
      "wickets",
      "bowlingAvg",
      "maxWickets",
      "champion",
      "totalFinal",
    ];

    const result = {} as Record<
      StatKey,
      number
    >;

    keys.forEach((key) => {
      result[key] = Math.max(
        0,
        ...selectedPlayersList.map(
          (player) =>
            getStatValue(player, key)
        )
      );
    });

    return result;
  }, [selectedPlayersList]);

  /* ================================================================
     COMPARISON STATUS
  ================================================================ */

  const selectedCount =
    selectedPlayersList.length;

  const canAnalyze = selectedCount >= 2;

  /* ================================================================
     PAGE
  ================================================================ */

  return (
    <div
      className={`cp-root ${
        isDark ? "cp-dark" : "cp-light"
      } min-h-screen pb-28 font-sans selection:bg-[#1877F2]/30 sm:pb-20`}
    >
      {/* ============================================================
          PREMIUM THEME CSS
      ============================================================ */}

      <style jsx global>{`

        /* ============================================================
           FCL OFFICIAL THEME
        ============================================================ */

        .cp-root {
          --cp-bg: #ffffff;
          --cp-bg-alt: #f1f5f9;

          --cp-surface: #ffffff;
          --cp-surface2: #f8fafc;
          --cp-surface3: #f1f5f9;

          --cp-head: #0f172a;
          --cp-text: #475569;
          --cp-sub: #64748b;

          --cp-line: #e2e8f0;

          --cp-blue: #1d4ed8;
          --cp-primary: #1877F2;

          --cp-amber: #b45309;
          --cp-emerald: #047857;

          --cp-input: #ffffff;

          --cp-empty: #f8fafc;

          --cp-shadow:
            0 8px 30px rgba(15, 23, 42, 0.06);

          --cp-hover-shadow:
            0 25px 60px rgba(24, 119, 242, 0.15);

          --cp-grid:
            rgba(100, 116, 139, 0.09);

          background: var(--cp-bg);
          color: var(--cp-head);

          transition:
            background 0.3s ease,
            color 0.3s ease;
        }

        .cp-root.cp-dark {
          --cp-bg: #020617;
          --cp-bg-alt: #02050b;

          --cp-surface: #0f172a;
          --cp-surface2: #0b1220;
          --cp-surface3: #172033;

          --cp-head: #ffffff;
          --cp-text: #cbd5e1;
          --cp-sub: #94a3b8;

          --cp-line: #172033;

          --cp-blue: #60a5fa;

          --cp-amber: #f59e0b;
          --cp-emerald: #34d399;

          --cp-input: #0b1220;

          --cp-empty: rgba(11, 18, 32, 0.5);

          --cp-shadow:
            0 12px 40px rgba(0, 0, 0, 0.18);

          --cp-hover-shadow:
            0 30px 70px rgba(24, 119, 242, 0.17);

          --cp-grid:
            rgba(148, 163, 184, 0.055);
        }

        /* ============================================================
           THEME UTILITIES
        ============================================================ */

        .cp-root .cp-head {
          color: var(--cp-head);
        }

        .cp-root .cp-text2 {
          color: var(--cp-text);
        }

        .cp-root .cp-sub {
          color: var(--cp-sub);
        }

        .cp-root .cp-blue {
          color: var(--cp-blue);
        }

        .cp-root .cp-amber {
          color: var(--cp-amber);
        }

        .cp-root .cp-emerald {
          color: var(--cp-emerald);
        }

        /* ============================================================
           HERO
        ============================================================ */

        .cp-hero {
          background: var(--cp-bg-alt);
          border-color: var(--cp-line);
        }

        .cp-grid {
          background-image:
            linear-gradient(
              to right,
              var(--cp-grid) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              var(--cp-grid) 1px,
              transparent 1px
            );

          background-size: 52px 52px;

          -webkit-mask-image:
            radial-gradient(
              ellipse 80% 80% at 50% 20%,
              black 25%,
              transparent 95%
            );

          mask-image:
            radial-gradient(
              ellipse 80% 80% at 50% 20%,
              black 25%,
              transparent 95%
            );
        }

        /* ============================================================
           GRADIENT TEXT
        ============================================================ */

        .cp-gradient-text {
          background:
            linear-gradient(
              90deg,
              #1d4ed8,
              #1877F2,
              #7c3aed,
              #1d4ed8
            );

          background-size: 250% auto;

          -webkit-background-clip: text;
          background-clip: text;

          -webkit-text-fill-color: transparent;

          animation:
            cpGradient 6s ease infinite;
        }

        .cp-dark .cp-gradient-text {
          background:
            linear-gradient(
              90deg,
              #60a5fa,
              #22d3ee,
              #a78bfa,
              #60a5fa
            );

          background-size: 250% auto;

          -webkit-background-clip: text;
          background-clip: text;
        }

        @keyframes cpGradient {
          0%, 100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        /* ============================================================
           FLOATING ORBS
        ============================================================ */

        @keyframes cpFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }

          50% {
            transform: translate(25px, -25px) scale(1.08);
          }
        }

        .cp-orb {
          animation:
            cpFloat 12s ease-in-out infinite;
        }

        .cp-orb-delay {
          animation-delay: -6s;
        }

        /* ============================================================
           HERO BADGE
        ============================================================ */

        .cp-hero-badge {
          background: rgba(24, 119, 242, 0.09);
          border-color: rgba(24, 119, 242, 0.3);
          color: var(--cp-blue);
        }

        /* ============================================================
           COUNT SELECTOR
        ============================================================ */

        .cp-count-selector {
          background: var(--cp-surface);
          border-color: var(--cp-line);
          box-shadow: var(--cp-shadow);
        }

        .cp-count-btn {
          color: var(--cp-sub);
        }

        .cp-count-btn:hover {
          background: var(--cp-surface3);
          color: var(--cp-head);
        }

        .cp-count-active {
          background: #1877F2 !important;
          color: #ffffff !important;

          box-shadow:
            0 8px 20px rgba(24, 119, 242, 0.25);
        }

        /* ============================================================
           PLAYER SELECTORS
        ============================================================ */

        .cp-selector {
          background:
            linear-gradient(
              to bottom,
              var(--cp-surface),
              var(--cp-surface2)
            );

          border-color: var(--cp-line);
          box-shadow: var(--cp-shadow);

          transition:
            border-color 0.3s ease,
            box-shadow 0.3s ease,
            transform 0.3s ease;
        }

        .cp-selector:hover {
          border-color: var(--accent);

          box-shadow:
            0 15px 40px
            color-mix(
              in srgb,
              var(--accent) 12%,
              transparent
            );
        }

        .cp-input {
          background: var(--cp-input);
          border-color: var(--cp-line);
          color: var(--cp-head);

          transition:
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .cp-input::placeholder {
          color: var(--cp-sub);
          opacity: 0.8;
        }

        .cp-input:focus {
          border-color: #1877F2;

          box-shadow:
            0 0 0 4px rgba(24, 119, 242, 0.1);
        }

        /* ============================================================
           SEARCH DROPDOWN
        ============================================================ */

        .cp-dropdown {
          background: var(--cp-surface);
          border-color: var(--cp-line);

          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .cp-dropdown-item:hover {
          background: rgba(24, 119, 242, 0.1);
        }

        /* ============================================================
           PLAYER AVATAR
        ============================================================ */

        .cp-avatar {
          background: var(--cp-surface3);

          box-shadow:
            0 5px 20px rgba(24, 119, 242, 0.1);
        }

        /* ============================================================
           COMPARISON CARDS
        ============================================================ */

        .cp-comparison-card {
          background:
            linear-gradient(
              to bottom,
              var(--cp-surface),
              var(--cp-surface2)
            );

          border-color: var(--cp-line);

          box-shadow: var(--cp-shadow);

          transition:
            border-color 0.4s ease,
            box-shadow 0.4s ease,
            transform 0.4s ease;
        }

        .cp-comparison-card:hover {
          border-color:
            color-mix(
              in srgb,
              var(--accent) 55%,
              transparent
            );

          box-shadow: var(--cp-hover-shadow);

          transform: translateY(-4px);
        }

        .cp-role {
          background: rgba(24, 119, 242, 0.1);
          border-color: rgba(24, 119, 242, 0.25);
          color: var(--cp-blue);
        }

        /* ============================================================
           POINTS BOX
        ============================================================ */

        .cp-points-box {
          background:
            linear-gradient(
              120deg,
              rgba(24, 119, 242, 0.1),
              rgba(168, 85, 247, 0.07),
              rgba(245, 158, 11, 0.05)
            );

          border-color: rgba(24, 119, 242, 0.2);
        }

        /* ============================================================
           QUICK STATS
        ============================================================ */

        .cp-quick-stat {
          background: var(--cp-surface2);
          border-color: var(--cp-line);
        }

        /* ============================================================
           STAT ROWS
        ============================================================ */

        .cp-stat-row {
          border-color: var(--cp-line);
        }

        .cp-progress-track {
          background: var(--cp-surface3);
        }

        /* ============================================================
           BEST PERFORMER
        ============================================================ */

        .cp-best {
          color: #047857;
          background: rgba(34, 197, 94, 0.12);
          border-color: rgba(34, 197, 94, 0.3);

          box-shadow:
            0 0 15px rgba(34, 197, 94, 0.08);
        }

        .cp-dark .cp-best {
          color: #4ade80;
        }

        /* ============================================================
           CARD FOOTER
        ============================================================ */

        .cp-card-footer {
          background: var(--cp-surface2);
          border-color: var(--cp-line);
        }

        /* ============================================================
           EMPTY CARD
        ============================================================ */

        .cp-empty {
          background: var(--cp-empty);

          border-color:
            color-mix(
              in srgb,
              var(--accent) 30%,
              var(--cp-line)
            );
        }

        /* ============================================================
           ANALYSIS
        ============================================================ */

        .cp-analysis {
          background:
            linear-gradient(
              120deg,
              var(--cp-surface),
              var(--cp-surface2)
            );

          border-color: rgba(245, 158, 11, 0.3);

          box-shadow: var(--cp-shadow);
        }

        .cp-analysis-card {
          background: var(--cp-surface2);

          border-color:
            color-mix(
              in srgb,
              var(--accent) 40%,
              var(--cp-line)
            );

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .cp-analysis-card:hover {
          transform: translateY(-4px);

          box-shadow:
            0 15px 35px
            color-mix(
              in srgb,
              var(--accent) 10%,
              transparent
            );
        }

        .cp-impact-box {
          background: var(--cp-surface);
          border-color: var(--cp-line);
        }

        .cp-analysis-note {
          background: rgba(24, 119, 242, 0.05);
          border-color: rgba(24, 119, 242, 0.15);
        }

        /* ============================================================
           SKELETON
        ============================================================ */

        .cp-skeleton {
          background: var(--cp-surface);
          border-color: var(--cp-line);
        }

        /* ============================================================
           SCROLLBAR
        ============================================================ */

        .cp-scroll::-webkit-scrollbar {
          height: 7px;
        }

        .cp-scroll::-webkit-scrollbar-track {
          background: var(--cp-surface3);
          border-radius: 20px;
        }

        .cp-scroll::-webkit-scrollbar-thumb {
          background: rgba(24, 119, 242, 0.45);
          border-radius: 20px;
        }

        /* ============================================================
           REDUCED MOTION
        ============================================================ */

        @media (prefers-reduced-motion: reduce) {
          .cp-root *,
          .cp-root *::before,
          .cp-root *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

      `}</style>

      {/* ============================================================
          PREMIUM HERO
      ============================================================ */}

      <section className="cp-hero relative overflow-hidden border-b">
        {/* Grid */}

        <div className="cp-grid pointer-events-none absolute inset-0" />

        {/* Glow */}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(24,119,242,0.12),transparent_45%)]" />

        {/* Orbs */}

        <div className="cp-orb pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#1877F2]/15 blur-[120px]" />

        <div className="cp-orb cp-orb-delay pointer-events-none absolute -bottom-40 -left-28 h-[360px] w-[360px] rounded-full bg-purple-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-9 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:pb-14">
          {/* Breadcrumb */}

          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Link
              href="/players"
              className="cp-blue group inline-flex items-center gap-1.5 text-[11px] font-bold transition hover:opacity-70"
            >
              <span className="transition-transform group-hover:-translate-x-1">
                ←
              </span>

              Player Directory
            </Link>

            <span className="cp-sub text-xs">
              /
            </span>

            <span className="cp-sub text-[11px] font-semibold">
              Comparison Hub
            </span>
          </div>

          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            {/* Hero Text */}

            <div className="max-w-[850px]">
              {/* Eyebrow */}

              <div className="cp-hero-badge mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.8)]" />

                <span className="text-[9px] font-black uppercase tracking-[0.22em] sm:text-[10px]">
                  FCL PLAYER ANALYTICS HUB
                </span>
              </div>

              {/* Title */}

              <h1 className="cp-head text-[34px] font-black leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[60px]">
                Player{" "}
                <span className="cp-gradient-text">
                  Comparison.
                </span>
              </h1>

              {/* Description */}

              <p className="cp-text2 mt-5 max-w-[750px] text-xs leading-7 sm:text-sm lg:text-base lg:leading-8">
                FCL-এর সেরা ক্রিকেটারদের পারফরম্যান্স
                পাশাপাশি তুলনা করুন। রান, উইকেট,
                এভারেজ, চ্যাম্পিয়নশিপ ও FCL Points
                বিশ্লেষণ করে অকশনের জন্য সেরা
                প্লেয়ার নির্বাচন করুন।
              </p>

              {/* Feature Tags */}

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[9px] font-bold text-blue-600 sm:text-[10px]">
                  ⚔️ Head to Head
                </span>

                <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[9px] font-bold text-amber-600 sm:text-[10px]">
                  ⭐ FCL Points
                </span>

                <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-bold text-emerald-600 sm:text-[10px]">
                  📊 Auction Analysis
                </span>
              </div>
            </div>

            {/* Compare Count Selector */}

            <div className="cp-count-selector flex shrink-0 flex-col gap-3 self-start rounded-[20px] border p-3.5 lg:self-end">
              <span className="cp-sub px-1 text-[10px] font-black uppercase tracking-wider">
                Compare Players
              </span>

              <div className="flex items-center gap-1.5">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() =>
                      handleCountChange(count)
                    }
                    aria-pressed={
                      compareCount === count
                    }
                    className={`cp-count-btn min-w-[65px] rounded-xl px-3 py-2.5 text-xs font-black transition-all duration-300 ${
                      compareCount === count
                        ? "cp-count-active"
                        : ""
                    }`}
                  >
                    {count} জন
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-11">
        {/* ============================================================
            SECTION HEADING
        ============================================================ */}

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-6 rounded-full bg-[#1877F2]" />

              <span className="cp-blue text-[9px] font-black uppercase tracking-[0.2em]">
                BUILD YOUR COMPARISON
              </span>
            </div>

            <h2 className="cp-head text-[23px] font-black tracking-tight sm:text-[30px]">
              Select Your Players
            </h2>

            <p className="cp-sub mt-1.5 text-[11px] sm:text-xs">
              নিচের সার্চ বক্স থেকে ২–৪ জন প্লেয়ার
              নির্বাচন করুন।
            </p>
          </div>

          {/* Reset */}

          {!loading && selectedCount > 0 && (
            <button
              type="button"
              onClick={resetComparison}
              className="cp-blue rounded-xl border border-[#1877F2]/25 bg-[#1877F2]/10 px-4 py-2.5 text-[11px] font-black transition hover:bg-[#1877F2]/20"
            >
              ↻ Reset Comparison
            </button>
          )}
        </div>

        {/* ============================================================
            LOADING
        ============================================================ */}

        {loading ? (
          <ComparisonSkeleton />
        ) : error ? (
          /* ==========================================================
             ERROR
          ========================================================== */

          <div className="cp-selector flex flex-col items-center justify-center rounded-[28px] border px-5 py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-500/20 bg-rose-500/10 text-4xl">
              ⚠️
            </div>

            <h3 className="cp-head text-xl font-black">
              Player Data Unavailable
            </h3>

            <p className="cp-sub mt-3 max-w-md text-xs leading-6">
              এই মুহূর্তে প্লেয়ারদের তথ্য লোড করা
              যাচ্ছে না। অনুগ্রহ করে আবার চেষ্টা করুন।
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-xl bg-[#1877F2] px-6 py-3 text-xs font-black text-white transition hover:bg-blue-700"
            >
              🔄 Try Again
            </button>
          </div>
        ) : (
          <>
            {/* ========================================================
                PLAYER SEARCH SELECTORS
            ======================================================== */}

            <div
              ref={searchAreaRef}
              className="relative z-40 mb-8 grid grid-cols-2 gap-3 sm:gap-5"
              style={{
                gridTemplateColumns:
                  compareCount === 2
                    ? undefined
                    : undefined,
              }}
            >
              {Array.from({
                length: compareCount,
              }).map((_, index) => (
                <PlayerSelector
                  key={index}
                  index={index}
                  players={players}
                  selectedName={
                    selectedNames[index] || ""
                  }
                  searchValue={
                    searchInputs[index] || ""
                  }
                  selectedNames={selectedNames}
                  active={
                    activeDropdownIndex === index
                  }
                  onSearch={handleSearchChange}
                  onSelect={handleSelectPlayer}
                  onFocus={
                    setActiveDropdownIndex
                  }
                  onClear={handleClearPlayer}
                />
              ))}
            </div>

            {/* ========================================================
                COMPARISON STATUS
            ======================================================== */}

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-6 rounded-full bg-[#1877F2]" />

                <span className="cp-blue text-[10px] font-black uppercase tracking-[0.18em]">
                  HEAD TO HEAD STATISTICS
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[#1877F2]/20 bg-[#1877F2]/10 px-3.5 py-2">
                <span className="text-sm">
                  ⚔️
                </span>

                <span className="cp-blue text-[11px] font-black">
                  {selectedCount} / {compareCount} Selected
                </span>
              </div>
            </div>

            {/* ========================================================
                MOBILE SCROLL INFO
            ======================================================== */}

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#1877F2]/15 bg-[#1877F2]/5 px-4 py-3 lg:hidden">
              <span className="text-sm">
                ↔️
              </span>

              <p className="cp-sub text-[10px] font-semibold">
                সব প্লেয়ারের পরিসংখ্যান দেখতে
                ডানে-বামে স্ক্রল করুন।
              </p>
            </div>

            {/* ========================================================
                COMPARISON CARDS
            ======================================================== */}

            <div className="cp-scroll overflow-x-auto pb-4">
              <div
                className="grid gap-3 sm:gap-5"
                style={{
                  gridTemplateColumns: `repeat(${compareCount}, minmax(250px, 1fr))`,
                  minWidth:
                    compareCount === 2
                      ? "510px"
                      : compareCount === 3
                      ? "780px"
                      : "1040px",
                }}
              >
                {Array.from({
                  length: compareCount,
                }).map((_, index) => (
                  <ComparisonCard
                    key={index}
                    player={
                      selectedPlayersBySlot[index] ||
                      null
                    }
                    index={index}
                    selectedPlayers={
                      selectedPlayersList
                    }
                    maxValues={maxValues}
                  />
                ))}
              </div>
            </div>

            {/* ========================================================
                BEST VALUE INFO
            ======================================================== */}

            {canAnalyze && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <span className="text-base">
                  🔥
                </span>

                <p className="cp-sub text-[10px] leading-5 sm:text-xs">
                  সবুজ রঙে চিহ্নিত পরিসংখ্যানগুলো
                  নির্বাচিত প্লেয়ারদের মধ্যে সর্বোচ্চ।
                  সমান সর্বোচ্চ মান থাকলে একাধিক
                  প্লেয়ার Highlight হবে।
                </p>
              </div>
            )}

            {/* ========================================================
                AUCTION ANALYSIS
            ======================================================== */}

            {canAnalyze && (
              <AuctionAnalysis
                selectedPlayers={
                  selectedPlayersList
                }
              />
            )}

            {/* ========================================================
                WAITING FOR COMPARISON
            ======================================================== */}

            {!canAnalyze && (
              <div className="cp-selector mt-8 flex flex-col items-center justify-center rounded-[24px] border px-5 py-10 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-3xl">
                  ⚔️
                </div>

                <h3 className="cp-head text-base font-black">
                  Ready for Comparison?
                </h3>

                <p className="cp-sub mt-2 max-w-md text-xs leading-6">
                  অন্তত ২ জন প্লেয়ার নির্বাচন করলেই
                  বিস্তারিত Performance Analysis এবং
                  Auction Recommendation দেখতে
                  পারবেন।
                </p>
              </div>
            )}

            {/* ========================================================
                BOTTOM FOOTER
            ======================================================== */}

            <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#1877F2]/40" />

                <span className="text-lg">
                  🏏
                </span>

                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#1877F2]/40" />
              </div>

              <p className="cp-sub text-[10px] font-black uppercase tracking-[0.2em]">
                Facebook Cricket League
              </p>

              <p className="cp-sub text-[10px]">
                Official Player Comparison &
                Auction Analytics
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}