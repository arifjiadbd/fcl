"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from "react";
import Link from "next/link";
import PlayerCardModal from "../../components/PlayerCardModal";

/* =========================================================
   FCL RECORD CORNER
   OFFICIAL PREMIUM THEME
   app/records/page.tsx
========================================================= */

/* ===================== TYPES ===================== */

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
  birthday?: string;
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

interface Tour {
  id: number;
  name: string;
  time: string;
  dateVal: number;
  champTeam: string;
  champPlayers: string[];
  ruTeam: string;
  ruPlayers: string[];
  scorers: string[];
  wickets: string[];
  mots: string[];
  cpots: string[];
  playerCount: number;
  search: string;
}

interface RankedRow {
  player: Player;
  value: number;
  rank: number;
}

interface Holder {
  id: string;
  label: string;
  icon: string;
  unit: string;
  player: Player;
  value: number;
}

type TeamCounts = Map<string, number>;

type TabId = string;

type SelectPlayer = (player: Player) => void;

/* ===================== COLORS ===================== */

const BLUE = "#1877F2";
const GOLD = "#f59e0b";
const GREEN = "#22c55e";
const PURPLE = "#a855f7";
const CYAN = "#22d3ee";
const PINK = "#ec4899";

const PLACEHOLDER =
  "/FCL Cricket Avatar Placeholder.jpg";

const MEDALS = [
  "#f59e0b",
  "#94a3b8",
  "#cd7f32",
];

/* ===================== HELPERS ===================== */

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (value: number) =>
  value.toLocaleString("en-US");

const nameKey = (value?: string) =>
  (value || "").trim().toLowerCase();

const matchPlayer = (player: Player, query: string) => {
  const q = query.trim().toLowerCase();

  return (
    !q ||
    nameKey(player.name).includes(q) ||
    nameKey(player.nickName).includes(q)
  );
};

const pushUnique = (
  list: string[],
  value?: string
) => {
  if (
    value &&
    !list.some(
      (item) => nameKey(item) === nameKey(value)
    )
  ) {
    list.push(value);
  }
};

/* ===================== MVP FORMULA ===================== */

export const calculateFclPoints = (
  player: Player
): number => {
  if (!player) return 0;

  return Math.round(
    num(player.runs) +
      num(player.sixes) * 2 +
      num(player.fours) +
      num(player.wickets) * 20 +
      num(player.matches) * 2 +
      num(player.champion) * 100 +
      num(player.runnersUp) * 40 +
      (num(player.mot) + num(player.cpot)) * 60 +
      num(player.highestRunScorer) * 30 +
      num(player.topWicketTaker) * 30
  );
};

const motTotal = (player: Player) =>
  num(player.mot) + num(player.cpot);

const safeWicketAverage = (player: Player) => {
  if (
    player.wkAvg &&
    player.wkAvg !== "0" &&
    player.wkAvg !== "0.00"
  ) {
    return player.wkAvg;
  }

  return num(player.matches) > 0
    ? (
        num(player.wickets) /
        num(player.matches)
      ).toFixed(2)
    : "0.00";
};

/* ===================== TABS ===================== */

const TABS = [
  {
    id: "tournaments_history",
    label: "Tournament History",
    icon: "🏆",
  },
  {
    id: "teammates_record",
    label: "Teammates",
    icon: "🤝",
  },
  {
    id: "records",
    label: "Record Holders",
    icon: "🌟",
  },
  {
    id: "clubs",
    label: "Elite Clubs",
    icon: "💎",
  },
  {
    id: "points",
    label: "FCL Points",
    icon: "💯",
  },
  {
    id: "runs",
    label: "Most Runs",
    icon: "🏏",
  },
  {
    id: "wickets",
    label: "Most Wickets",
    icon: "🎯",
  },
  {
    id: "sixes",
    label: "Six Machine",
    icon: "💥",
  },
  {
    id: "fours",
    label: "Boundary Kings",
    icon: "🔷",
  },
  {
    id: "hattricks",
    label: "Hat-Tricks",
    icon: "🎩",
  },
  {
    id: "champions",
    label: "Champions",
    icon: "🏆",
  },
  {
    id: "runnersup",
    label: "Runners-Up",
    icon: "🥈",
  },
  {
    id: "finals",
    label: "Total Finals",
    icon: "⚔️",
  },
  {
    id: "motcpot",
    label: "MOT / CPOT",
    icon: "⭐",
  },
  {
    id: "runking",
    label: "Tour. Run King",
    icon: "👑",
  },
  {
    id: "wicketking",
    label: "Tour. Wicket King",
    icon: "🛡️",
  },
  {
    id: "matches",
    label: "Most Matches",
    icon: "⚡",
  },
  {
    id: "innings",
    label: "Most Innings",
    icon: "📋",
  },
  {
    id: "notout",
    label: "Most Not Outs",
    icon: "🧱",
  },
  {
    id: "maxruns",
    label: "Highest Tour. Runs",
    icon: "🚀",
  },
  {
    id: "maxwickets",
    label: "Highest Wickets",
    icon: "🔥",
  },
  {
    id: "tournaments",
    label: "Tournaments",
    icon: "🗓️",
  },
];

const GROUPS = [
  {
    title: "Overview",
    ids: [
      "tournaments_history",
      "teammates_record",
      "records",
      "clubs",
    ],
  },
  {
    title: "Batting Records",
    ids: [
      "runs",
      "sixes",
      "fours",
      "maxruns",
      "innings",
      "notout",
    ],
  },
  {
    title: "Bowling Records",
    ids: [
      "wickets",
      "hattricks",
      "maxwickets",
    ],
  },
  {
    title: "Trophies & Honours",
    ids: [
      "champions",
      "runnersup",
      "finals",
      "motcpot",
      "runking",
      "wicketking",
    ],
  },
  {
    title: "Overall Performance",
    ids: [
      "points",
      "matches",
      "tournaments",
    ],
  },
];

const DESCRIPTIONS: Record<string, string> = {
  tournaments_history:
    "রান, উইকেট, ট্রফি এবং টুর্নামেন্টের সোনালী ইতিহাস।",

  teammates_record:
    "সবচেয়ে বেশি ভিন্ন সতীর্থের সঙ্গে একই দলে খেলার রেকর্ড।",

  records:
    "প্রতিটি ক্যাটাগরির সর্বকালের সেরা রেকর্ডধারী।",

  clubs:
    "রান এবং উইকেটের মাইলফলক অনুযায়ী Elite All-Rounder Clubs।",

  points:
    "ব্যাটিং, বোলিং, ট্রফি ও অ্যাওয়ার্ডের ভিত্তিতে FCL Points।",

  runs: "ক্যারিয়ারে সর্বোচ্চ রান।",

  wickets: "ক্যারিয়ারে সর্বোচ্চ উইকেট।",

  sixes: "ক্যারিয়ারে সবচেয়ে বেশি ছক্কা।",

  fours: "ক্যারিয়ারে সবচেয়ে বেশি চার।",

  hattricks: "সবচেয়ে বেশি হ্যাটট্রিক।",

  champions: "সবচেয়ে বেশি টুর্নামেন্ট জয়।",

  runnersup: "সবচেয়ে বেশিবার রানার্স-আপ।",

  finals: "সবচেয়ে বেশি ফাইনাল খেলা।",

  motcpot: "MOT এবং CPOT মিলিয়ে মোট অ্যাওয়ার্ড।",

  runking:
    "টুর্নামেন্টের সর্বোচ্চ রান সংগ্রাহক হওয়ার রেকর্ড।",

  wicketking:
    "টুর্নামেন্টের সর্বোচ্চ উইকেট শিকারি হওয়ার রেকর্ড।",

  matches: "সবচেয়ে বেশি ম্যাচ খেলা।",

  innings: "সবচেয়ে বেশি ইনিংস খেলা।",

  notout: "সবচেয়ে বেশি নট-আউট।",

  maxruns:
    "এক টুর্নামেন্টে সর্বোচ্চ ব্যক্তিগত রান।",

  maxwickets:
    "এক টুর্নামেন্টে সর্বোচ্চ ব্যক্তিগত উইকেট।",

  tournaments:
    "সবচেয়ে বেশি টুর্নামেন্টে অংশগ্রহণ।",
};

const ACCENTS: Record<string, string> = {
  tournaments_history: GOLD,
  teammates_record: CYAN,
  records: GOLD,
  clubs: PURPLE,
  points: GOLD,
  runs: BLUE,
  wickets: PINK,
  sixes: PURPLE,
  fours: CYAN,
  hattricks: PINK,
  champions: GOLD,
  runnersup: "#94a3b8",
  finals: CYAN,
  motcpot: PURPLE,
  runking: "#fb923c",
  wicketking: CYAN,
  matches: GREEN,
  innings: BLUE,
  notout: "#94a3b8",
  maxruns: PINK,
  maxwickets: "#fb923c",
  tournaments: GREEN,
};

const COUNT_CHIPS = [
  "Top 5",
  "Top 10",
  "Top 20",
  "Top 50",
  "All",
];

const CLUB_CHIPS = [
  "All",
  "Diamond",
  "Gold",
  "Silver",
  "Bronze",
];

/* ===================== RANKING CONFIG ===================== */

interface RankingConfig {
  value: (
    player: Player,
    counts: TeamCounts
  ) => number;

  badge: (player: Player) => string;

  meta: (player: Player) => string;

  unit: string;
}

const CONFIG: Record<string, RankingConfig> = {
  points: {
    value: calculateFclPoints,
    badge: (p) =>
      `${fmt(num(p.runs))} Runs • ${p.wickets} Wkts`,
    meta: (p) => `${p.matches} Matches`,
    unit: "Pts",
  },

  runs: {
    value: (p) => num(p.runs),
    badge: (p) => `Avg ${p.runAvg || "0.00"}`,
    meta: (p) => `${p.matches} Matches`,
    unit: "Runs",
  },

  wickets: {
    value: (p) => num(p.wickets),
    badge: (p) =>
      `Wk Avg ${safeWicketAverage(p)}`,
    meta: (p) => `${p.matches} Matches`,
    unit: "Wkts",
  },

  sixes: {
    value: (p) => num(p.sixes),
    badge: (p) => `${p.runs} Runs`,
    meta: (p) => `${p.matches} Matches`,
    unit: "Sixes",
  },

  fours: {
    value: (p) => num(p.fours),
    badge: (p) => `${p.runs} Runs`,
    meta: (p) => `${p.matches} Matches`,
    unit: "Fours",
  },

  hattricks: {
    value: (p) => num(p.hatTricks),
    badge: (p) => `${p.wickets} Wickets`,
    meta: (p) => `${p.matches} Matches`,
    unit: "Hat-tricks",
  },

  champions: {
    value: (p) => num(p.champion),
    badge: (p) => `${p.totalFinal || 0} Finals`,
    meta: (p) => `${p.matches} Matches`,
    unit: "Titles",
  },

  runnersup: {
    value: (p) => num(p.runnersUp),
    badge: (p) => `${p.totalFinal || 0} Finals`,
    meta: (p) => `${p.matches} Matches`,
    unit: "Times",
  },

  finals: {
    value: (p) => num(p.totalFinal),
    badge: (p) =>
      `${p.champion || 0}x Champion`,
    meta: (p) =>
      `${p.runnersUp || 0}x Runner-Up`,
    unit: "Finals",
  },

  motcpot: {
    value: motTotal,
    badge: (p) =>
      `MOT ${p.mot || 0} • CPOT ${p.cpot || 0}`,
    meta: (p) => `${p.matches} Matches`,
    unit: "Awards",
  },

  runking: {
    value: (p) => num(p.highestRunScorer),
    badge: () => "Tournament Top Scorer",
    meta: (p) => `${p.runs} Runs`,
    unit: "Times",
  },

  wicketking: {
    value: (p) => num(p.topWicketTaker),
    badge: () => "Tournament Top Bowler",
    meta: (p) => `${p.wickets} Wkts`,
    unit: "Times",
  },

  matches: {
    value: (p) => num(p.matches),
    badge: (p) =>
      `${p.runs} Runs • ${p.wickets} Wkts`,
    meta: (p) =>
      `@${p.nickName || "Player"}`,
    unit: "Matches",
  },

  innings: {
    value: (p) => num(p.innings),
    badge: (p) => `${p.runs} Runs`,
    meta: (p) => `${p.matches} Matches`,
    unit: "Innings",
  },

  notout: {
    value: (p) => num(p.notOut),
    badge: (p) =>
      `${p.innings || 0} Innings`,
    meta: (p) => `${p.runs} Runs`,
    unit: "Not Outs",
  },

  maxruns: {
    value: (p) => num(p.maxRuns),
    badge: () => "Best Tournament Runs",
    meta: (p) => `${p.runs} Career Runs`,
    unit: "Runs",
  },

  maxwickets: {
    value: (p) => num(p.maxWickets),
    badge: () => "Best Tournament Wickets",
    meta: (p) => `${p.wickets} Career Wkts`,
    unit: "Wkts",
  },

  tournaments: {
    value: (p) => num(p.totalTournament),
    badge: (p) => `${p.matches} Matches`,
    meta: (p) =>
      `@${p.nickName || "Player"}`,
    unit: "Tours",
  },

  teammates_record: {
    value: (p, counts) =>
      counts.get(nameKey(p.name)) || 0,
    badge: (p) => `${p.matches} Matches`,
    meta: (p) =>
      `@${p.nickName || "Player"}`,
    unit: "Players",
  },
};

/* ===================== ELITE CLUBS ===================== */

const TIERS = [
  {
    key: "Diamond",
    icon: "💎",
    title: "Diamond All-Rounder",
    range: "2500+ Runs • 150+ Wickets",
    color: CYAN,
    test: (p: Player) =>
      num(p.runs) >= 2500 &&
      num(p.wickets) >= 150,
  },
  {
    key: "Gold",
    icon: "🥇",
    title: "Gold All-Rounder",
    range: "2000–2499 Runs • 100+ Wickets",
    color: GOLD,
    test: (p: Player) =>
      num(p.runs) >= 2000 &&
      num(p.runs) < 2500 &&
      num(p.wickets) >= 100,
  },
  {
    key: "Silver",
    icon: "🥈",
    title: "Silver All-Rounder",
    range: "1000–1999 Runs • 50+ Wickets",
    color: "#94a3b8",
    test: (p: Player) =>
      num(p.runs) >= 1000 &&
      num(p.runs) < 2000 &&
      num(p.wickets) >= 50,
  },
  {
    key: "Bronze",
    icon: "🥉",
    title: "Bronze All-Rounder",
    range: "500–999 Runs • 50+ Wickets",
    color: "#cd7f32",
    test: (p: Player) =>
      num(p.runs) >= 500 &&
      num(p.runs) < 1000 &&
      num(p.wickets) >= 50,
  },
];

/* ===================== THEME DETECTION ===================== */

function detectDarkTheme(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const html = document.documentElement;
  const body = document.body;

  const explicit = [
    html.getAttribute("data-theme"),
    html.getAttribute("data-mode"),
    body.getAttribute("data-theme"),
    body.getAttribute("data-mode"),
  ].find(
    (value) =>
      value?.toLowerCase() === "dark" ||
      value?.toLowerCase() === "light"
  );

  if (explicit) {
    return explicit.toLowerCase() === "dark";
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

  const scheme =
    html.style.colorScheme ||
    body.style.colorScheme;

  if (scheme === "dark") return true;
  if (scheme === "light") return false;

  try {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") return true;
    if (saved === "light") return false;
  } catch {
    // Local storage may be unavailable.
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
}

function useIsDark() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const update = () =>
      setDark(detectDarkTheme());

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

    observer.observe(
      document.documentElement,
      options
    );

    observer.observe(
      document.body,
      options
    );

    window.addEventListener("storage", update);

    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    media.addEventListener("change", update);

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "storage",
        update
      );

      media.removeEventListener(
        "change",
        update
      );
    };
  }, []);

  return dark;
}

/* ===================== AVATAR ===================== */

const Avatar = memo(function Avatar({
  player,
  size = 44,
}: {
  player: Player;
  size?: number;
}) {
  const raw = player.photo || player.photoUrl;

  let photo = PLACEHOLDER;

  if (
    raw &&
    raw.trim() &&
    raw.trim() !== "—"
  ) {
    photo =
      raw.startsWith("/") ||
      raw.startsWith("https://") ||
      raw.startsWith("http://") ||
      raw.startsWith("data:")
        ? raw
        : `/players/${raw}`;
  }

  const [src, setSrc] = useState(photo);

  useEffect(() => {
    setSrc(photo);
  }, [photo]);

  return (
    <span
      className="fcl-avatar relative inline-flex shrink-0 overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src={src}
        alt={player.name}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        onError={() => {
          if (src !== PLACEHOLDER) {
            setSrc(PLACEHOLDER);
          }
        }}
      />
    </span>
  );
});

/* ===================== TEAMMATES CALCULATION ===================== */

function buildTeammateCounts(
  data: TournamentRecord[]
): TeamCounts {
  const result: TeamCounts = new Map();

  const squads = new Map<
    string,
    Set<string>
  >();

  const playerSquads = new Map<
    string,
    Set<string>
  >();

  for (const record of data) {
    const tournament = nameKey(
      record.tournament
    );

    const team = nameKey(record.team);

    const player = nameKey(
      record.playerName
    );

    if (!tournament || !team || !player) {
      continue;
    }

    const key = JSON.stringify([
      tournament,
      team,
    ]);

    if (!squads.has(key)) {
      squads.set(key, new Set());
    }

    squads.get(key)!.add(player);

    if (!playerSquads.has(player)) {
      playerSquads.set(player, new Set());
    }

    playerSquads.get(player)!.add(key);
  }

  playerSquads.forEach((keys, player) => {
    const teammates = new Set<string>();

    keys.forEach((key) => {
      squads.get(key)?.forEach((mate) => {
        if (mate !== player) {
          teammates.add(mate);
        }
      });
    });

    result.set(player, teammates.size);
  });

  return result;
}

/* ===================== REAL RANKING ===================== */

function rankPlayers(
  players: Player[],
  getValue: (player: Player) => number,
  query: string,
  limit: number
): RankedRow[] {
  const all = players
    .map((player) => ({
      player,
      value: getValue(player),
    }))
    .filter(
      (item) =>
        Number.isFinite(item.value) &&
        item.value > 0
    )
    .sort(
      (a, b) =>
        b.value - a.value ||
        a.player.name.localeCompare(
          b.player.name
        )
    );

  let previousRank = 0;

  const ranked = all.map((item, index) => {
    if (
      index === 0 ||
      item.value !== all[index - 1].value
    ) {
      previousRank = index + 1;
    }

    return {
      ...item,
      rank: previousRank,
    };
  });

  if (query.trim()) {
    return ranked.filter(({ player }) =>
      matchPlayer(player, query)
    );
  }

  return limit === Infinity
    ? ranked
    : ranked.slice(0, limit);
}

/* ===================== RECORD HOLDERS ===================== */

function buildHolders(
  players: Player[],
  teamCounts: TeamCounts
): Holder[] {
  if (!players.length) return [];

  const definitions = [
    {
      id: "champions",
      label: "Most Titles",
      unit: "Titles",
      icon: "🏆",
    },
    {
      id: "runs",
      label: "All-Time Runs",
      unit: "Runs",
      icon: "🏏",
    },
    {
      id: "wickets",
      label: "All-Time Wickets",
      unit: "Wickets",
      icon: "🎯",
    },
    {
      id: "finals",
      label: "Total Finals",
      unit: "Finals",
      icon: "⚔️",
    },
    {
      id: "matches",
      label: "Most Matches",
      unit: "Matches",
      icon: "⚡",
    },
    {
      id: "sixes",
      label: "Six Machine",
      unit: "Sixes",
      icon: "💥",
    },
    {
      id: "hattricks",
      label: "Hat-Trick Master",
      unit: "Hat-tricks",
      icon: "🎩",
    },
    {
      id: "points",
      label: "FCL Points",
      unit: "Points",
      icon: "💯",
    },
    {
      id: "fours",
      label: "Boundary Kings",
      unit: "Fours",
      icon: "🔷",
    },
    {
      id: "runnersup",
      label: "Runners-Up",
      unit: "Times",
      icon: "🥈",
    },
    {
      id: "motcpot",
      label: "MOT / CPOT",
      unit: "Awards",
      icon: "⭐",
    },
    {
      id: "runking",
      label: "Tour. Run King",
      unit: "Times",
      icon: "👑",
    },
    {
      id: "wicketking",
      label: "Tour. Wicket King",
      unit: "Times",
      icon: "🛡️",
    },
    {
      id: "innings",
      label: "Most Innings",
      unit: "Innings",
      icon: "📋",
    },
    {
      id: "notout",
      label: "Most Not Outs",
      unit: "Not Outs",
      icon: "🧱",
    },
    {
      id: "maxruns",
      label: "Highest Tour. Runs",
      unit: "Runs",
      icon: "🚀",
    },
    {
      id: "maxwickets",
      label: "Highest Wickets",
      unit: "Wickets",
      icon: "🔥",
    },
    {
      id: "tournaments",
      label: "Tournaments",
      unit: "Tours",
      icon: "🗓️",
    },
    {
      id: "teammates_record",
      label: "Most Teammates",
      unit: "Players",
      icon: "🤝",
    },
  ];

  return definitions.map((definition) => {
    const getValue = CONFIG[
      definition.id
    ].value;

    let best = players[0];

    let bestValue = getValue(
      best,
      teamCounts
    );

    for (
      let index = 1;
      index < players.length;
      index++
    ) {
      const value = getValue(
        players[index],
        teamCounts
      );

      if (value > bestValue) {
        best = players[index];
        bestValue = value;
      }
    }

    return {
      ...definition,
      player: best,
      value: bestValue,
    };
  });
}

/* ===================== TOURNAMENT DATE ===================== */

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function parseTourDate(value: string) {
  if (!value) return 0;

  const parts = value
    .trim()
    .split(/\s+/);

  let month = 0;
  let year = 2013;

  for (const part of parts) {
    const clean = part
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const monthKey = clean.slice(0, 3);

    if (MONTHS[monthKey] !== undefined) {
      month = MONTHS[monthKey];
    }

    const number = parseInt(clean, 10);

    if (
      Number.isFinite(number) &&
      number > 1990 &&
      number < 2100
    ) {
      year = number;
    }
  }

  return year * 12 + month;
}

function letterOf(value: string) {
  const letter = value
    .trim()
    .charAt(0)
    .toUpperCase();

  return /^[A-Z]$/.test(letter)
    ? letter
    : "#";
}

/* ===================== BUILD TOURNAMENTS ===================== */

function buildTours(
  data: TournamentRecord[]
): Tour[] {
  const map = new Map<
    string,
    Tour & {
      allPlayers: Set<string>;
    }
  >();

  data.forEach((record) => {
    const name =
      record.tournament?.trim() ||
      "Tournament";

    const key = nameKey(name);

    if (!map.has(key)) {
      map.set(key, {
        id: map.size,
        name,
        time: record.time || "",
        dateVal: 0,
        champTeam: "",
        champPlayers: [],
        ruTeam: "",
        ruPlayers: [],
        scorers: [],
        wickets: [],
        mots: [],
        cpots: [],
        playerCount: 0,
        search: "",
        allPlayers: new Set(),
      });
    }

    const tour = map.get(key)!;

    if (!tour.time && record.time) {
      tour.time = record.time;
    }

    if (record.playerName) {
      tour.allPlayers.add(
        record.playerName.trim()
      );
    }

    const result = (
      record.chamRu || ""
    ).toUpperCase();

    if (
      result.includes("CHAM") ||
      result.includes("WIN")
    ) {
      if (record.team) {
        tour.champTeam = record.team;
      }

      pushUnique(
        tour.champPlayers,
        record.playerName
      );
    } else if (
      result.includes("RU") ||
      result.includes("RUNNER")
    ) {
      if (record.team) {
        tour.ruTeam = record.team;
      }

      pushUnique(
        tour.ruPlayers,
        record.playerName
      );
    }

    if (num(record.topScorer) === 1) {
      pushUnique(
        tour.scorers,
        record.playerName
      );
    }

    if (num(record.topWicket) === 1) {
      pushUnique(
        tour.wickets,
        record.playerName
      );
    }

    const award = (
      record.motCpot || ""
    ).toUpperCase();

    if (award.includes("CPOT")) {
      pushUnique(
        tour.cpots,
        record.playerName
      );
    } else if (award.includes("MOT")) {
      pushUnique(
        tour.mots,
        record.playerName
      );
    }
  });

  return Array.from(map.values()).map(
    (tour) => {
      const {
        allPlayers,
        ...rest
      } = tour;

      return {
        ...rest,

        dateVal: parseTourDate(
          rest.time
        ),

        playerCount:
          allPlayers.size,

        search: [
          rest.name,
          rest.time,
          rest.champTeam,
          rest.ruTeam,
          ...allPlayers,
          ...rest.champPlayers,
          ...rest.ruPlayers,
          ...rest.scorers,
          ...rest.wickets,
          ...rest.mots,
          ...rest.cpots,
        ]
          .join(" ")
          .toLowerCase(),
      };
    }
  );
}

/* ===================== TOURNAMENT HOOK ===================== */

const SORT_OPTIONS = [
  {
    id: "old",
    label: "পুরনো থেকে নতুন (2013+)",
  },
  {
    id: "new",
    label: "সর্বশেষ থেকে পুরনো",
  },
  {
    id: "az",
    label: "Name A → Z",
  },
  {
    id: "za",
    label: "Name Z → A",
  },
  {
    id: "players",
    label: "Most Players",
  },
];

function useTourState(
  data: TournamentRecord[],
  query: string
) {
  const tours = useMemo(
    () => buildTours(data),
    [data]
  );

  const [sort, setSort] = useState("old");

  const [letter, setLetter] =
    useState("All");

  const letters = useMemo(() => {
    return Array.from(
      new Set(
        tours.map((tour) =>
          letterOf(tour.name)
        )
      )
    ).sort((a, b) =>
      a === "#"
        ? 1
        : b === "#"
        ? -1
        : a.localeCompare(b)
    );
  }, [tours]);

  const list = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase();

    const filtered = tours.filter(
      (tour) =>
        (letter === "All" ||
          letterOf(tour.name) ===
            letter) &&
        (!q || tour.search.includes(q))
    );

    switch (sort) {
      case "new":
        filtered.sort(
          (a, b) =>
            b.dateVal - a.dateVal ||
            b.id - a.id
        );
        break;

      case "az":
        filtered.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;

      case "za":
        filtered.sort((a, b) =>
          b.name.localeCompare(a.name)
        );
        break;

      case "players":
        filtered.sort(
          (a, b) =>
            b.playerCount -
              a.playerCount ||
            a.name.localeCompare(b.name)
        );
        break;

      default:
        filtered.sort(
          (a, b) =>
            a.dateVal - b.dateVal ||
            a.id - b.id
        );
    }

    return filtered;
  }, [tours, query, letter, sort]);

  const grouped = useMemo(() => {
    const groups = new Map<
      string,
      Tour[]
    >();

    [...tours]
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      )
      .forEach((tour) => {
        const key = letterOf(
          tour.name
        );

        if (!groups.has(key)) {
          groups.set(key, []);
        }

        groups.get(key)!.push(tour);
      });

    return Array.from(
      groups.entries()
    ).sort(([a], [b]) =>
      a === "#"
        ? 1
        : b === "#"
        ? -1
        : a.localeCompare(b)
    );
  }, [tours]);

  const stats = useMemo(() => {
    const names = new Set<string>();

    const teams = new Set<string>();

    data.forEach((record) => {
      if (record.playerName) {
        names.add(
          nameKey(record.playerName)
        );
      }
    });

    tours.forEach((tour) => {
      if (tour.champTeam) {
        teams.add(
          nameKey(tour.champTeam)
        );
      }
    });

    return {
      tournaments: tours.length,
      players: names.size,
      champTeams: teams.size,
    };
  }, [data, tours]);

  return {
    tours,
    list,
    grouped,
    letters,
    stats,
    sort,
    setSort,
    letter,
    setLetter,
  };
}

/* ===================== SHARED UI ===================== */

function SectionHeading({
  icon,
  title,
  description,
  color = BLUE,
}: {
  icon: string;
  title: string;
  description?: string;
  color?: string;
}) {
  return (
    <div className="fcl-section-heading mb-5">
      <div className="flex items-center gap-3">
        <span
          className="fcl-heading-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
          style={{
            color,
            borderColor: `${color}35`,
            background: `${color}12`,
          }}
        >
          {icon}
        </span>

        <div className="min-w-0">
          <h2 className="text-lg font-black tracking-tight sm:text-2xl">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs leading-relaxed text-[var(--fcl-muted)] sm:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  text = "কিছু পাওয়া যায়নি। অন্য নাম দিয়ে চেষ্টা করুন।",
}: {
  text?: string;
}) {
  return (
    <div className="fcl-empty rounded-3xl px-5 py-12 text-center">
      <div className="text-4xl">
        🔎
      </div>

      <p className="mt-4 text-sm font-bold text-[var(--fcl-text)]">
        No Results Found
      </p>

      <p className="mt-2 text-xs text-[var(--fcl-muted)]">
        {text}
      </p>
    </div>
  );
}

function CountChips({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="fcl-chip-scroll flex gap-1.5 overflow-x-auto pb-1">
      {COUNT_CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => onChange(chip)}
          aria-pressed={selected === chip}
          className={`fcl-count-chip shrink-0 rounded-full px-3.5 py-2 text-[11px] font-black transition-all sm:px-4 sm:text-xs ${
            selected === chip
              ? "fcl-count-active"
              : ""
          }`}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

function RankBadge({
  rank,
}: {
  rank: number;
}) {
  const color =
    rank === 1
      ? MEDALS[0]
      : rank === 2
      ? MEDALS[1]
      : rank === 3
      ? MEDALS[2]
      : "";

  return (
    <span
      className="fcl-rank-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black"
      style={
        color
          ? {
              background: `${color}20`,
              borderColor: `${color}55`,
              color,
            }
          : undefined
      }
    >
      {rank}
    </span>
  );
}

/* ===================== PREMIUM PODIUM ===================== */

function PremiumPodium({
  rows,
  unit,
  onSelect,
}: {
  rows: RankedRow[];
  unit: string;
  onSelect: SelectPlayer;
}) {
  const top = rows.slice(0, 3);

  const order =
    top.length === 3
      ? [1, 0, 2]
      : top.map((_, index) => index);

  if (!top.length) return null;

  return (
    <div className="fcl-podium-grid mb-5 grid grid-cols-3 items-end gap-2 sm:mb-7 sm:gap-4 xl:gap-5">
      {order.map((index) => {
        const row = top[index];

        if (!row) return null;

        const first = index === 0;

        const color =
          MEDALS[index];

        return (
          <button
            key={`podium-${row.player.id ?? row.player.name}-${index}`}
            type="button"
            onClick={() =>
              onSelect(row.player)
            }
            className={`fcl-podium group relative flex min-w-0 flex-col items-center overflow-hidden rounded-2xl px-1.5 pb-4 pt-7 text-center transition-all duration-300 hover:-translate-y-1.5 sm:rounded-3xl sm:px-4 sm:pb-7 sm:pt-9 ${
              first
                ? "fcl-podium-first"
                : ""
            }`}
            style={{
              borderColor: `${color}70`,
              background: `linear-gradient(180deg, ${color}20, var(--fcl-card) 75%)`,
            }}
          >
            {first && (
              <span className="fcl-crown absolute right-2 top-1 text-lg sm:right-4 sm:top-2 sm:text-2xl">
                👑
              </span>
            )}

            <span
              className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black text-[#020617] sm:left-4 sm:top-4 sm:h-8 sm:w-8"
              style={{
                background: color,
              }}
            >
              {index + 1}
            </span>

            <div
              className="rounded-full p-1"
              style={{
                border: `2px solid ${color}`,
                boxShadow: `0 0 24px ${color}25`,
              }}
            >
              <div className="fcl-podium-avatar">
                <Avatar
                  player={row.player}
                  size={first ? 58 : 48}
                />
              </div>
            </div>

            <p className="mt-3 w-full break-words text-[11px] font-black leading-tight text-[var(--fcl-text)] sm:mt-5 sm:text-base xl:text-lg">
              {row.player.name}
            </p>

            <p className="mt-1 w-full truncate text-[9px] text-[var(--fcl-muted)] sm:text-xs">
              @{row.player.nickName || "Player"}
            </p>

            <div className="fcl-podium-value mt-3 w-full rounded-xl px-1 py-3 sm:mt-5 sm:rounded-2xl sm:py-4">
              <p
                className={`font-black leading-none tabular-nums ${
                  first
                    ? "text-xl sm:text-4xl xl:text-5xl"
                    : "text-lg sm:text-3xl xl:text-4xl"
                }`}
                style={{
                  color,
                }}
              >
                {fmt(row.value)}
              </p>

              <p className="mt-1.5 text-[9px] font-bold uppercase text-[var(--fcl-muted)] sm:text-xs">
                {unit}
              </p>
            </div>

            <span className="mt-3 hidden text-[10px] font-bold text-[var(--fcl-muted)] group-hover:text-[#1877F2] sm:block">
              View Profile ↗
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ===================== PLAYER ROW ===================== */

function PlayerRankingRow({
  row,
  config,
  accent,
  onSelect,
}: {
  row: RankedRow;
  config: RankingConfig;
  accent: string;
  onSelect: SelectPlayer;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onSelect(row.player)
      }
      className="fcl-ranking-row group flex w-full items-center gap-2.5 px-3 py-3 text-left transition-all sm:gap-4 sm:px-5 sm:py-3.5"
    >
      <RankBadge rank={row.rank} />

      <Avatar
        player={row.player}
        size={38}
      />

      <div className="min-w-0 flex-1">
        <p className="fcl-player-name truncate text-xs font-black sm:text-sm">
          {row.player.name}
        </p>

        <p className="mt-1 truncate text-[10px] text-[var(--fcl-muted)] sm:text-xs">
          {config.badge(row.player)}
        </p>

        <p className="mt-0.5 truncate text-[9px] text-[var(--fcl-muted)] sm:hidden">
          {config.meta(row.player)}
        </p>
      </div>

      <div className="hidden min-w-0 flex-1 text-xs text-[var(--fcl-muted)] sm:block">
        {config.meta(row.player)}
      </div>

      <div className="shrink-0 text-right">
        <p
          className="text-base font-black tabular-nums sm:text-xl"
          style={{
            color: accent,
          }}
        >
          {fmt(row.value)}
        </p>

        <p className="mt-0.5 text-[9px] font-bold uppercase text-[var(--fcl-muted)]">
          {config.unit}
        </p>
      </div>
    </button>
  );
}

/* ===================== STANDARD RANKINGS ===================== */

function RankingView({
  tab,
  players,
  teamCounts,
  query,
  chip,
  setChip,
  onSelect,
}: {
  tab: string;
  players: Player[];
  teamCounts: TeamCounts;
  query: string;
  chip: string;
  setChip: (value: string) => void;
  onSelect: SelectPlayer;
}) {
  const config = CONFIG[tab];

  const tabInfo = TABS.find(
    (item) => item.id === tab
  );

  const accent =
    ACCENTS[tab] || GOLD;

  const rows = useMemo(() => {
    if (!config) return [];

    const limit =
      chip === "All"
        ? Infinity
        : parseInt(
            chip.replace("Top ", ""),
            10
          ) || 10;

    return rankPlayers(
      players,
      (player) =>
        config.value(
          player,
          teamCounts
        ),
      query,
      limit
    );
  }, [
    players,
    teamCounts,
    query,
    chip,
    config,
  ]);

  const hasQuery =
    query.trim().length > 0;

  const list = hasQuery
    ? rows
    : rows.slice(3);

  if (!config) {
    return <EmptyState />;
  }

  return (
    <div className="fcl-content-enter min-w-0">
      <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <SectionHeading
          icon={tabInfo?.icon || "🏆"}
          title={tabInfo?.label || "Records"}
          description={DESCRIPTIONS[tab]}
          color={accent}
        />

        <CountChips
          selected={chip}
          onChange={setChip}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {!hasQuery && (
            <PremiumPodium
              rows={rows}
              unit={config.unit}
              onSelect={onSelect}
            />
          )}

          {list.length > 0 && (
            <div className="fcl-ranking-list overflow-hidden rounded-2xl sm:rounded-3xl">
              <div className="fcl-list-header hidden grid-cols-[40px_46px_minmax(0,1fr)_minmax(0,1fr)_110px] gap-4 border-b px-5 py-3 text-[10px] font-black uppercase tracking-wider sm:grid">
                <span>Rank</span>
                <span>Photo</span>
                <span>Player</span>
                <span>Details</span>
                <span className="text-right">
                  {config.unit}
                </span>
              </div>

              <div className="fcl-list-body">
                {list.map((row) => (
                  <PlayerRankingRow
                    key={`${row.player.id ?? row.player.name}-${row.rank}`}
                    row={row}
                    config={config}
                    accent={accent}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          )}

          {hasQuery && (
            <p className="mt-4 text-center text-xs text-[var(--fcl-muted)]">
              Showing original all-time ranks
              for matching players.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* ===================== TEAMMATES ===================== */

function TeammatesView({
  players,
  teamCounts,
  query,
  onSelect,
}: {
  players: Player[];
  teamCounts: TeamCounts;
  query: string;
  onSelect: SelectPlayer;
}) {
  const [chip, setChip] =
    useState("Top 10");

  return (
    <RankingView
      tab="teammates_record"
      players={players}
      teamCounts={teamCounts}
      query={query}
      chip={chip}
      setChip={setChip}
      onSelect={onSelect}
    />
  );
}

/* ===================== RECORD HOLDERS ===================== */

function RecordHoldersView({
  players,
  teamCounts,
  query,
  onSelect,
}: {
  players: Player[];
  teamCounts: TeamCounts;
  query: string;
  onSelect: SelectPlayer;
}) {
  const holders = useMemo(
    () =>
      buildHolders(
        players,
        teamCounts
      ),
    [players, teamCounts]
  );

  const filtered = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase();

    if (!q) return holders;

    return holders.filter(
      (holder) =>
        matchPlayer(
          holder.player,
          q
        ) ||
        holder.label
          .toLowerCase()
          .includes(q)
    );
  }, [holders, query]);

  return (
    <div className="fcl-content-enter">
      <SectionHeading
        icon="🌟"
        title="Hall of Fame"
        description={DESCRIPTIONS.records}
        color={GOLD}
      />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(
            (holder, index) => {
              const color =
                ACCENTS[holder.id] ||
                GOLD;

              return (
                <button
                  key={holder.id}
                  type="button"
                  onClick={() =>
                    onSelect(
                      holder.player
                    )
                  }
                  className={`fcl-holder-card group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1 sm:rounded-3xl sm:p-5 ${
                    index < 3
                      ? "fcl-holder-featured"
                      : ""
                  }`}
                  style={{
                    borderColor: `${color}35`,
                  }}
                >
                  <div
                    className="pointer-events-none absolute -right-5 -top-7 text-8xl opacity-[0.07]"
                    aria-hidden="true"
                  >
                    {holder.icon}
                  </div>

                  <div className="relative z-10">
                    <p
                      className="text-xs font-black sm:text-sm"
                      style={{
                        color,
                      }}
                    >
                      {holder.icon}{" "}
                      {holder.label}
                    </p>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <p
                        className="text-3xl font-black tabular-nums sm:text-4xl"
                        style={{
                          color,
                        }}
                      >
                        {fmt(
                          holder.value
                        )}
                      </p>

                      <span className="text-[10px] font-semibold text-[var(--fcl-muted)]">
                        {holder.unit}
                      </span>
                    </div>

                    <div className="fcl-holder-divider mt-4 flex items-center gap-3 border-t pt-4">
                      <Avatar
                        player={
                          holder.player
                        }
                        size={40}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-[var(--fcl-text)]">
                          {
                            holder.player
                              .name
                          }
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-[var(--fcl-muted)]">
                          @
                          {holder.player
                            .nickName ||
                            "Player"}
                        </p>
                      </div>

                      <span className="text-[#1877F2]">
                        ↗
                      </span>
                    </div>
                  </div>
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

/* ===================== ELITE CLUBS ===================== */

function EliteClubsView({
  players,
  query,
  onSelect,
}: {
  players: Player[];
  query: string;
  onSelect: SelectPlayer;
}) {
  const [chip, setChip] =
    useState("All");

  const visibleTiers = useMemo(() => {
    return TIERS.filter(
      (tier) =>
        chip === "All" ||
        tier.key === chip
    ).map((tier) => ({
      ...tier,

      players: players
        .filter(tier.test)
        .filter((player) =>
          matchPlayer(
            player,
            query
          )
        )
        .sort(
          (a, b) =>
            calculateFclPoints(b) -
            calculateFclPoints(a)
        ),
    }));
  }, [players, query, chip]);

  const available = query.trim()
    ? visibleTiers.filter(
        (tier) =>
          tier.players.length > 0
      )
    : visibleTiers;

  return (
    <div className="fcl-content-enter">
      <SectionHeading
        icon="💎"
        title="Elite Milestone Clubs"
        description={DESCRIPTIONS.clubs}
        color={PURPLE}
      />

      <div className="fcl-chip-scroll mb-6 flex gap-2 overflow-x-auto pb-1">
        {CLUB_CHIPS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setChip(item)
            }
            aria-pressed={
              chip === item
            }
            className={`fcl-count-chip shrink-0 rounded-full px-4 py-2 text-xs font-black ${
              chip === item
                ? "fcl-count-active"
                : ""
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {available.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
          {available.map((tier) => (
            <div
              key={tier.key}
              className="fcl-tier-card overflow-hidden rounded-3xl"
              style={{
                borderColor: `${tier.color}45`,
              }}
            >
              <div
                className="relative p-4 sm:p-5"
                style={{
                  background: `linear-gradient(120deg, ${tier.color}12, transparent)`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className="text-base font-black sm:text-lg"
                      style={{
                        color:
                          tier.color,
                      }}
                    >
                      {tier.icon}{" "}
                      {tier.title}
                    </h3>

                    <p className="mt-1 text-xs text-[var(--fcl-muted)]">
                      {tier.range}
                    </p>
                  </div>

                  <span
                    className="rounded-full border px-3 py-1 text-xs font-black"
                    style={{
                      borderColor: `${tier.color}45`,
                      color:
                        tier.color,
                    }}
                  >
                    {
                      tier.players
                        .length
                    }
                  </span>
                </div>
              </div>

              <div className="fcl-tier-list max-h-[440px] space-y-1 overflow-y-auto p-2 sm:p-3">
                {tier.players.length ===
                0 ? (
                  <p className="py-8 text-center text-xs text-[var(--fcl-muted)]">
                    No players in
                    this club yet.
                  </p>
                ) : (
                  tier.players.map(
                    (player) => (
                      <button
                        key={
                          player.id ??
                          player.name
                        }
                        type="button"
                        onClick={() =>
                          onSelect(
                            player
                          )
                        }
                        className="fcl-tier-player flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-all"
                      >
                        <Avatar
                          player={
                            player
                          }
                          size={38}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-[var(--fcl-text)] sm:text-sm">
                            {
                              player.name
                            }
                          </p>

                          <p className="mt-1 truncate text-[10px] text-[var(--fcl-muted)]">
                            @
                            {player.nickName ||
                              "Player"}{" "}
                            •{" "}
                            {
                              player.matches
                            }{" "}
                            Matches
                          </p>
                        </div>

                        <div className="shrink-0 text-right text-xs font-black">
                          <span className="text-[#22c55e]">
                            {fmt(
                              num(
                                player.runs
                              )
                            )}
                            R
                          </span>

                          <span className="mx-1 text-[var(--fcl-muted)]">
                            /
                          </span>

                          <span className="text-[#f59e0b]">
                            {
                              player.wickets
                            }
                            W
                          </span>
                        </div>
                      </button>
                    )
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===================== TOURNAMENT COMPONENTS ===================== */

function SquadChips({
  names,
  tour,
  playersByName,
  onSelect,
}: {
  names: string[];
  tour: Tour;
  playersByName: Map<string, Player>;
  onSelect: SelectPlayer;
}) {
  if (!names.length) {
    return (
      <p className="text-xs text-[var(--fcl-muted)]">
        স্কোয়াডের তথ্য নেই।
      </p>
    );
  }

  const hasName = (
    list: string[],
    name: string
  ) =>
    list.some(
      (item) =>
        nameKey(item) ===
        nameKey(name)
    );

  return (
    <div className="flex flex-wrap gap-1.5">
      {names.map((name) => {
        const player =
          playersByName.get(
            nameKey(name)
          );

        const badge = [
          hasName(
            tour.scorers,
            name
          )
            ? "🏏"
            : "",

          hasName(
            tour.wickets,
            name
          )
            ? "🎯"
            : "",

          hasName(
            tour.mots,
            name
          )
            ? "⭐"
            : "",

          hasName(
            tour.cpots,
            name
          )
            ? "🏅"
            : "",
        ].join("");

        return (
          <button
            key={name}
            type="button"
            disabled={!player}
            onClick={() => {
              if (player) {
                onSelect(
                  player
                );
              }
            }}
            className="fcl-squad-chip rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all enabled:hover:-translate-y-0.5 disabled:cursor-default"
          >
            {name}

            {badge && (
              <span className="ml-1">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function AwardCell({
  icon,
  label,
  names,
  color,
}: {
  icon: string;
  label: string;
  names: string[];
  color: string;
}) {
  return (
    <div className="fcl-award-cell min-w-0 rounded-xl p-3">
      <p className="text-[10px] font-bold text-[var(--fcl-muted)]">
        {icon} {label}
      </p>

      <p
        className="mt-1 break-words text-xs font-black leading-relaxed sm:text-sm"
        style={{
          color: names.length
            ? color
            : "var(--fcl-muted)",
        }}
      >
        {names.length
          ? names.join(", ")
          : "—"}
      </p>
    </div>
  );
}

function TournamentDetails({
  tour,
  playersByName,
  onSelect,
}: {
  tour: Tour;
  playersByName: Map<string, Player>;
  onSelect: SelectPlayer;
}) {
  const [segment, setSegment] =
    useState<
      "champ" | "ru"
    >("champ");

  useEffect(() => {
    setSegment("champ");
  }, [tour.id]);

  const squad =
    segment === "champ"
      ? tour.champPlayers
      : tour.ruPlayers;

  const team =
    segment === "champ"
      ? tour.champTeam
      : tour.ruTeam;

  return (
    <div className="space-y-4">
      <div className="fcl-tour-detail-heading border-b pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1877F2]">
          FCL Tournament Archive
        </p>

        <h3 className="mt-2 break-words text-xl font-black text-[var(--fcl-text)] sm:text-3xl">
          🏟️ {tour.name}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {tour.time && (
            <span className="fcl-detail-chip rounded-full px-3 py-1.5 text-xs font-bold">
              📅 {tour.time}
            </span>
          )}

          <span className="fcl-detail-chip rounded-full px-3 py-1.5 text-xs font-bold">
            👥 {tour.playerCount} Players
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          {
            id: "champ" as const,
            icon: "🏆",
            title: "Champion",
            team: tour.champTeam,
            count:
              tour.champPlayers.length,
            color: GOLD,
          },
          {
            id: "ru" as const,
            icon: "🥈",
            title: "Runner-Up",
            team: tour.ruTeam,
            count:
              tour.ruPlayers.length,
            color: "#94a3b8",
          },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setSegment(
                item.id
              )
            }
            className={`fcl-tour-segment rounded-2xl p-3 text-left transition-all sm:p-4 ${
              segment === item.id
                ? "fcl-tour-segment-active"
                : ""
            }`}
            style={{
              borderColor:
                segment ===
                item.id
                  ? item.color
                  : undefined,
            }}
          >
            <p
              className="text-xs font-black sm:text-sm"
              style={{
                color: item.color,
              }}
            >
              {item.icon}{" "}
              {item.title}
            </p>

            <p className="mt-2 break-words text-xs font-black text-[var(--fcl-text)] sm:text-base">
              {item.team || "—"}
            </p>

            <p className="mt-1 text-[10px] text-[var(--fcl-muted)]">
              {item.count} Squad
              Members
            </p>
          </button>
        ))}
      </div>

      <div className="fcl-squad-panel rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="text-sm font-black text-[var(--fcl-text)]">
            {segment === "champ"
              ? "🏆 Champion Squad"
              : "🥈 Runner-Up Squad"}
          </h4>

          <span className="text-[10px] font-bold text-[var(--fcl-muted)]">
            {squad.length} Players
          </span>
        </div>

        <p className="mb-3 text-xs font-bold text-[#1877F2]">
          {team || "Team Information Unavailable"}
        </p>

        <SquadChips
          names={squad}
          tour={tour}
          playersByName={
            playersByName
          }
          onSelect={onSelect}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <AwardCell
          icon="🏏"
          label="Top Scorer"
          names={tour.scorers}
          color={GREEN}
        />

        <AwardCell
          icon="🎯"
          label="Top Wicket"
          names={tour.wickets}
          color={GOLD}
        />

        <AwardCell
          icon="⭐"
          label="MOT"
          names={tour.mots}
          color={PURPLE}
        />

        <AwardCell
          icon="🏅"
          label="CPOT"
          names={tour.cpots}
          color={CYAN}
        />
      </div>

      <p className="text-[10px] leading-relaxed text-[var(--fcl-muted)]">
        🏏 Top Scorer • 🎯 Top Wicket • ⭐ MOT •
        🏅 CPOT
      </p>
    </div>
  );
}

/* ===================== TOURNAMENT HISTORY ===================== */

function TournamentHistoryView({
  data,
  players,
  query,
  clearQuery,
  onSelect,
}: {
  data: TournamentRecord[];
  players: Player[];
  query: string;
  clearQuery: () => void;
  onSelect: SelectPlayer;
}) {
  const state = useTourState(
    data,
    query
  );

  const [selectedId, setSelectedId] =
    useState<number | null>(
      null
    );

  const [mobileOpenId, setMobileOpenId] =
    useState<number | null>(
      null
    );

  const [indexOpen, setIndexOpen] =
    useState(true);

  const [visible, setVisible] =
    useState(10);

  // একক টুর্নামেন্ট পপ-আপ ভিউয়ের জন্য স্টেট
  const [activeTourPopup, setActiveTourPopup] =
    useState<Tour | null>(null);

  const playersByName = useMemo(() => {
    const map = new Map<
      string,
      Player
    >();

    players.forEach(
      (player) => {
        map.set(
          nameKey(player.name),
          player
        );
      }
    );

    return map;
  }, [players]);

  useEffect(() => {
    setVisible(10);
  }, [
    query,
    state.sort,
    state.letter,
  ]);

  const selected =
    state.list.find(
      (tour) =>
        tour.id === selectedId
    ) || state.list[0];

  const grouped = state.grouped;

  // A-Z লিস্ট থেকে ক্লিক করলে পপ-আপে দেখানোর জন্য সেট করা হলো
  const jumpTo = (
    tour: Tour
  ) => {
    clearQuery();
    setActiveTourPopup(tour);
  };

  return (
    <div className="fcl-content-enter">
      <SectionHeading
        icon="🏆"
        title="Tournament History Archive"
        description={
          DESCRIPTIONS.tournaments_history
        }
        color={GOLD}
      />

      <div className="fcl-tour-summary mb-5 overflow-hidden rounded-3xl">
        <div className="grid grid-cols-3">
          {[
            {
              label: "Tournaments",
              value:
                state.stats
                  .tournaments,
              color: GOLD,
              icon: "🏆",
            },
            {
              label: "Players",
              value:
                state.stats.players,
              color: GREEN,
              icon: "👥",
            },
            {
              label: "Champion Teams",
              value:
                state.stats
                  .champTeams,
              color: BLUE,
              icon: "👑",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="fcl-tour-stat px-2 py-4 text-center sm:py-5"
            >
              <p className="text-lg sm:text-xl">
                {stat.icon}
              </p>

              <p
                className="mt-1 text-xl font-black sm:text-3xl"
                style={{
                  color:
                    stat.color,
                }}
              >
                {fmt(
                  stat.value
                )}
              </p>

              <p className="mt-1 text-[9px] font-semibold text-[var(--fcl-muted)] sm:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setIndexOpen(
              (previous) =>
                !previous
            )
          }
          aria-expanded={indexOpen}
          className="fcl-tour-index-toggle flex w-full items-center justify-between gap-3 border-t px-4 py-3 text-left text-xs font-black"
        >
          <span>
            📚 All Tournaments
            (A–Z)
          </span>

          <span
            className={`transition-transform ${
              indexOpen
                ? "rotate-180"
                : ""
            }`}
          >
            ▼
          </span>
        </button>

        {indexOpen && (
          <div className="fcl-tour-index max-h-64 space-y-3 overflow-y-auto border-t p-3 sm:p-4">
            {grouped.map(
              ([letter, tours]) => (
                <div
                  key={letter}
                  className="flex items-start gap-2"
                >
                  <span className="fcl-letter-badge flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black">
                    {letter}
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {tours.map(
                      (tour) => (
                        <button
                          key={
                            tour.id
                          }
                          type="button"
                          onClick={() =>
                            jumpTo(
                              tour
                            )
                          }
                          className="fcl-index-chip rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all"
                        >
                          {
                            tour.name
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* একক টুর্নামেন্ট পপ-আপ মডাল (পিসির মতো ড্রপডাউন বা ক্লিকের পর ফোকাস ভিউ) */}
      {activeTourPopup && (
        <div className="mb-6 rounded-3xl border-2 border-amber-500/50 bg-[var(--fcl-card)] p-4 shadow-xl transition-all sm:p-6">
          <div className="mb-3 flex items-center justify-between border-b pb-2">
            <span className="text-xs font-black uppercase text-amber-500">✨ Selected Tournament Details</span>
            <button
              type="button"
              onClick={() => setActiveTourPopup(null)}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-white hover:bg-slate-700"
            >
              ✕ Close Popup
            </button>
          </div>
          <TournamentDetails
            tour={activeTourPopup}
            playersByName={playersByName}
            onSelect={onSelect}
          />
        </div>
      )}

      <div className="mb-4 space-y-3">
        <select
          value={state.sort}
          onChange={(event) =>
            state.setSort(
              event.target.value
            )
          }
          aria-label="Sort tournaments"
          className="fcl-select w-full rounded-xl px-4 py-3 text-xs font-black outline-none sm:max-w-sm"
        >
          {SORT_OPTIONS.map(
            (option) => (
              <option
                key={option.id}
                value={option.id}
              >
                {option.label}
              </option>
            )
          )}
        </select>

        <div className="fcl-chip-scroll flex gap-1.5 overflow-x-auto pb-1">
          {[
            "All",
            ...state.letters,
          ].map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() =>
                state.setLetter(
                  letter
                )
              }
              className={`fcl-letter-filter shrink-0 rounded-lg px-3 py-2 text-[11px] font-black ${
                state.letter ===
                letter
                  ? "fcl-letter-active"
                  : ""
              }`}
            >
              {letter === "All"
                ? "সব"
                : letter}
            </button>
          ))}
        </div>

        <p className="text-[11px] font-semibold text-[var(--fcl-muted)]">
          Showing{" "}
          {state.list.length} of{" "}
          {state.tours.length}{" "}
          tournaments
        </p>
      </div>

      {state.list.length ===
      0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {state.list
              .slice(0, visible)
              .map((tour) => {
                const open =
                  mobileOpenId ===
                  tour.id;

                return (
                  <div
                    key={tour.id}
                    id={`fcl-tour-${tour.id}`}
                    className="fcl-tour-card scroll-mt-28 overflow-hidden rounded-2xl"
                    style={{
                      borderColor:
                        open
                          ? `${GOLD}80`
                          : undefined,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setMobileOpenId(
                          open
                            ? null
                            : tour.id
                        )
                      }
                      aria-expanded={
                        open
                      }
                      className="flex w-full items-center gap-3 p-3 text-left"
                    >
                      <span className="fcl-tour-letter flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black">
                        {letterOf(
                          tour.name
                        ) === "#"
                          ? "🏆"
                          : letterOf(
                              tour.name
                            )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-[var(--fcl-text)]">
                          {
                            tour.name
                          }
                        </span>

                        <span className="mt-1 block truncate text-[11px] text-[var(--fcl-muted)]">
                          📅{" "}
                          {tour.time ||
                            "—"}{" "}
                          • 👥{" "}
                          {
                            tour.playerCount
                          }
                        </span>

                        <span className="mt-1 block truncate text-[11px] font-black text-[#f59e0b]">
                          🏆{" "}
                          {tour.champTeam ||
                            "—"}
                        </span>
                      </span>

                      <span
                        className={`text-[var(--fcl-muted)] transition-transform ${
                          open
                            ? "rotate-180"
                            : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>

                    {open && (
                      <div className="fcl-tour-expanded border-t p-3">
                        <TournamentDetails
                          tour={tour}
                          playersByName={
                            playersByName
                          }
                          onSelect={
                            onSelect
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}

            {visible <
              state.list.length && (
              <button
                type="button"
                onClick={() =>
                  setVisible(
                    (previous) =>
                      previous + 10
                  )
                }
                className="fcl-load-more w-full rounded-2xl px-5 py-3.5 text-xs font-black"
              >
                আরও ১০টি দেখুন (
                {state.list.length -
                  visible}{" "}
                বাকি) ↓
              </button>
            )}
          </div>

          <div className="hidden grid-cols-[310px_minmax(0,1fr)] items-start gap-5 lg:grid xl:grid-cols-[350px_minmax(0,1fr)]">
            <div className="fcl-tour-sidebar max-h-[650px] space-y-2 overflow-y-auto rounded-3xl p-3">
              {state.list.map(
                (tour) => {
                  const active =
                    selected?.id ===
                    tour.id;

                  return (
                    <button
                      key={tour.id}
                      type="button"
                      onClick={() =>
                        setSelectedId(
                          tour.id
                        )
                      }
                      className={`fcl-tour-list-item flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                        active
                          ? "fcl-tour-list-active"
                          : ""
                      }`}
                    >
                      <span className="fcl-tour-letter flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black">
                        {letterOf(
                          tour.name
                        ) === "#"
                          ? "🏆"
                          : letterOf(
                              tour.name
                            )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-[var(--fcl-text)]">
                          {
                            tour.name
                          }
                        </span>

                        <span className="mt-1 block truncate text-[11px] text-[var(--fcl-muted)]">
                          {tour.time ||
                            "—"}{" "}
                          • 👥{" "}
                          {
                            tour.playerCount
                          }
                        </span>

                        <span className="mt-1 block truncate text-[11px] font-bold text-[#f59e0b]">
                          🏆{" "}
                          {tour.champTeam ||
                            "—"}
                        </span>
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            <div className="fcl-tour-desktop-detail sticky top-6 min-w-0 rounded-3xl p-5 xl:p-7">
              {selected && (
                <TournamentDetails
                  tour={selected}
                  playersByName={
                    playersByName
                  }
                  onSelect={
                    onSelect
                  }
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ===================== LOADING ===================== */

function RecordsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[0, 1, 2].map(
          (index) => (
            <div
              key={index}
              className="fcl-skeleton h-40 rounded-3xl sm:h-72"
            />
          )
        )}
      </div>

      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="fcl-skeleton h-16 rounded-2xl"
        />
      ))}
    </div>
  );
}

/* ===================== MAIN PAGE ===================== */

export default function RecordsPage() {
  const isDark = useIsDark();

  const [players, setPlayers] =
    useState<Player[]>([]);

  const [
    tournamentsData,
    setTournamentsData,
  ] = useState<
    TournamentRecord[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    selectedPlayer,
    setSelectedPlayer,
  ] = useState<
    Player | null
  >(null);

  const [tab, setTab] =
    useState<TabId>(
      "tournaments_history"
    );

  const [chip, setChip] =
    useState("Top 10");

  const [query, setQuery] =
    useState("");

  const [
    mobileExpanded,
    setMobileExpanded,
  ] = useState(false);

  const [
    mobileSearchOpen,
    setMobileSearchOpen,
  ] = useState(false);

  /* ===================== API ===================== */

  const loadData =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "/api/fcl-data",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        const loadedPlayers:
          Player[] =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.players
              )
            ? data.players
            : [];

        const loadedTours:
          TournamentRecord[] =
          Array.isArray(
            data?.tournaments
          )
            ? data.tournaments
            : [];

        setPlayers(
          loadedPlayers.filter(
            (player) =>
              player &&
              typeof player.name ===
                "string" &&
              player.name.trim()
          )
        );

        setTournamentsData(
          loadedTours
        );
      } catch (err) {
        console.error(
          "FCL Records API Error:",
          err
        );

        setError(
          "Unable to load FCL Records. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /* ===================== CALCULATIONS ===================== */

  const teamCounts = useMemo(
    () =>
      buildTeammateCounts(
        tournamentsData
      ),
    [tournamentsData]
  );

  const totals = useMemo(() => {
    const tournaments =
      new Set(
        tournamentsData
          .map((record) =>
            nameKey(
              record.tournament
            )
          )
          .filter(Boolean)
      ).size;

    return {
      players:
        players.length,

      runs: players.reduce(
        (sum, player) =>
          sum +
          num(player.runs),
        0
      ),

      wickets:
        players.reduce(
          (sum, player) =>
            sum +
            num(
              player.wickets
            ),
          0
        ),

      tournaments,
    };
  }, [
    players,
    tournamentsData,
  ]);

  const tabInfo =
    TABS.find(
      (item) =>
        item.id === tab
    );

  /* ===================== ACTIONS ===================== */

  const changeTab = (
    id: TabId
  ) => {
    setTab(id);

    setChip(
      id === "clubs"
        ? "All"
        : "Top 10"
    );
  };

  const onSelect =
    useCallback(
      (player: Player) => {
        setSelectedPlayer(
          player
        );
      },
      []
    );

  /* ===================== CONTENT ===================== */

  const renderContent = () => {
    if (loading) {
      return (
        <RecordsSkeleton />
      );
    }

    if (error) {
      return (
        <div className="fcl-empty rounded-3xl px-5 py-14 text-center">
          <p className="text-4xl">
            ⚠️
          </p>

          <p className="mt-4 text-sm font-black text-[var(--fcl-text)]">
            Records Unavailable
          </p>

          <p className="mt-2 text-xs text-[var(--fcl-muted)]">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadData()
            }
            className="mt-5 rounded-xl bg-[#1877F2] px-6 py-3 text-xs font-black text-white"
          >
            ↻ Try Again
          </button>
        </div>
      );
    }

    if (
      tab ===
      "tournaments_history"
    ) {
      return (
        <TournamentHistoryView
          data={
            tournamentsData
          }
          players={
            players
          }
          query={query}
          clearQuery={() =>
            setQuery("")
          }
          onSelect={
            onSelect
          }
        />
      );
    }

    if (
      tab ===
      "teammates_record"
    ) {
      return (
        <TeammatesView
          players={
            players
          }
          teamCounts={
            teamCounts
          }
          query={query}
          onSelect={
            onSelect
          }
        />
      );
    }

    if (tab === "records") {
      return (
        <RecordHoldersView
          players={
            players
          }
          teamCounts={
            teamCounts
          }
          query={query}
          onSelect={
            onSelect
          }
        />
      );
    }

    if (tab === "clubs") {
      return (
        <EliteClubsView
          players={
            players
          }
          query={query}
          onSelect={
            onSelect
          }
        />
      );
    }

    return (
      <RankingView
        tab={tab}
        players={players}
        teamCounts={
          teamCounts
        }
        query={query}
        chip={chip}
        setChip={
          setChip
        }
        onSelect={
          onSelect
        }
      />
    );
  };

  return (
    <div
      data-fcl-theme={
        isDark
          ? "dark"
          : "light"
      }
      className="fcl-records relative min-h-screen overflow-x-hidden pb-28 selection:bg-[#1877F2]/25 lg:pb-20"
    >
      <style>
        {RECORDS_STYLES}
      </style>

      {/* BACKGROUND */}

      <div className="fcl-page-background pointer-events-none absolute inset-0 overflow-hidden">
        <div className="fcl-grid absolute inset-0" />

        <div className="fcl-orb fcl-orb-blue absolute -top-32 left-1/2 h-[450px] w-[650px] -translate-x-1/2 rounded-full" />

        <div className="fcl-orb fcl-orb-gold absolute -right-40 top-[550px] h-[350px] w-[350px] rounded-full" />

        <div className="fcl-orb fcl-orb-purple absolute -left-40 top-[1100px] h-[350px] w-[350px] rounded-full" />
      </div>

      {/* MOBILE HEADER */}

      {/* MOBILE HEADER */}
      <header className="fcl-mobile-header sticky top-0 z-40 mt-16 sm:mt-18 lg:mt-0 border-b px-4 py-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              aria-label="Home"
              className="fcl-back-button flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
            >
              ‹
            </Link>

            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[#1877F2]/25 bg-[#1877F2]/10 px-2.5 py-0.5">
                <span className="text-[10px]">🏏</span>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1877F2]">
                  FCL OFFICIAL ARCHIVE
                </span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-[var(--fcl-text)] truncate">
                FCL <span className="fcl-gradient-text">Record Corner.</span>
              </h1>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--fcl-muted)] truncate">
                রান, উইকেট, ট্রফি এবং টুর্নামেন্টের সোনালী ইতিহাস।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/rankings"
              className="fcl-rankings-link rounded-xl px-3 py-2 text-[11px] font-black"
            >
              Rankings ↗
            </Link>

            <button
              type="button"
              onClick={() =>
                setMobileSearchOpen(
                  (previous) => !previous
                )
              }
              aria-label="Toggle search"
              aria-expanded={mobileSearchOpen}
              className="fcl-search-toggle flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            >
              🔍
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="relative mt-3">
            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="প্লেয়ার, টিম বা টুর্নামেন্ট..."
              className="fcl-search-input w-full rounded-xl py-3 pl-4 pr-10 text-xs outline-none"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--fcl-muted)]"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </header>
      {/* মূল কন্টেইনার যাতে overflow-x সমস্যা না করে এবং স্ক্রিন অনুযায়ী ফিক্সড থাকে */}
      <div className="relative z-10 mx-auto max-w-[1450px] w-full box-border px-3 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-12">
        {/* DESKTOP HEADER */}

        <header className="fcl-page-header mb-8 hidden items-end justify-between gap-6 lg:flex">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1877F2]/25 bg-[#1877F2]/10 px-3 py-1.5">
              <span className="text-xs">
                🏏
              </span>

              <span className="text-[10px] font-black uppercase tracking-[0.17em] text-[#1877F2]">
                FCL OFFICIAL ARCHIVE
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight xl:text-5xl">
              FCL{" "}
              <span className="fcl-gradient-text">
                Record Corner.
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--fcl-muted)]">
              রান, উইকেট, ট্রফি,
              রেকর্ড এবং
              টুর্নামেন্টের
              সোনালী ইতিহাস
              এক ঠিকানায়।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                🔍
              </span>

              <input
                type="search"
                value={query}
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target.value
                  )
                }
                placeholder="Search players, teams, tournaments..."
                className="fcl-search-input w-[310px] rounded-2xl py-3.5 pl-11 pr-10 text-xs outline-none xl:w-[360px]"
              />

              {query && (
                <button
                  type="button"
                  onClick={() =>
                    setQuery("")
                  }
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--fcl-muted)]"
                >
                  ✕
                </button>
              )}
            </div>

            <Link
              href="/rankings"
              className="fcl-rankings-link shrink-0 rounded-2xl px-5 py-3.5 text-xs font-black transition-all hover:-translate-y-1"
            >
              🏆 Complete Leaderboard ↗
            </Link>
          </div>
        </header>

        {/* SUMMARY DASHBOARD */}

        <section className="fcl-summary-grid mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:mb-9 lg:grid-cols-4">
          {[
            {
              icon: "👥",
              label: "TOTAL PLAYERS",
              value: totals.players,
              color: BLUE,
            },
            {
              icon: "🏏",
              label: "CAREER RUNS",
              value: totals.runs,
              color: GREEN,
            },
            {
              icon: "🎯",
              label: "CAREER WICKETS",
              value: totals.wickets,
              color: GOLD,
            },
            {
              icon: "🏆",
              label: "TOURNAMENTS",
              value: totals.tournaments,
              color: PURPLE,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="fcl-summary-card group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 sm:rounded-3xl sm:p-5"
            >
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-[var(--fcl-muted)] sm:text-xs">
                    {stat.label}
                  </p>

                  <p
                    className="mt-2 text-2xl font-black tabular-nums sm:mt-3 sm:text-3xl xl:text-4xl"
                    style={{
                      color:
                        stat.color,
                    }}
                  >
                    {loading
                      ? "—"
                      : fmt(
                          stat.value
                        )}
                  </p>
                </div>

                <span className="fcl-stat-icon flex h-9 w-9 items-center justify-center rounded-xl text-lg sm:h-11 sm:w-11 sm:text-xl">
                  {stat.icon}
                </span>
              </div>

              <div
                className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25"
                style={{
                  background:
                    stat.color,
                }}
              />
            </div>
          ))}
        </section>

        {/* MOBILE CATEGORY SELECTOR */}

        <section className="fcl-mobile-categories mb-6 rounded-3xl p-3 lg:hidden">
          <button
            type="button"
            onClick={() =>
              changeTab(
                "tournaments_history"
              )
            }
            className={`fcl-history-button mb-3 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-3.5 text-xs font-black uppercase tracking-wide transition-all sm:text-sm ${
              tab ===
              "tournaments_history"
                ? "fcl-history-active"
                : ""
            }`}
          >
            <span className="text-lg">
              🏆
            </span>

            Tournament History Archive
          </button>

          <div className="grid grid-cols-4 gap-2">
            {TABS.filter(
              (item) =>
                item.id !==
                "tournaments_history"
            )
              .slice(
                0,
                mobileExpanded
                  ? undefined
                  : 8
              )
              .map((item) => {
                const active =
                  tab === item.id;

                return (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      changeTab(
                        item.id
                      )
                    }
                    aria-pressed={
                      active
                    }
                    className={`fcl-mobile-category flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-2.5 text-center transition-all ${
                      active
                        ? "fcl-mobile-category-active"
                        : ""
                    }`}
                  >
                    <span className="text-xl">
                      {
                        item.icon
                      }
                    </span>

                    <span className="w-full break-words text-[9px] font-black leading-tight sm:text-[11px]">
                      {
                        item.label
                      }
                    </span>
                  </button>
                );
              })}
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileExpanded(
                (previous) =>
                  !previous
              )
            }
            className="mx-auto mt-3 flex items-center gap-2 px-4 py-2 text-xs font-black text-[#1877F2]"
          >
            {mobileExpanded
              ? "Show Less"
              : "More Categories"}

            <span>
              {mobileExpanded
                ? "⌃"
                : "⌄"}
            </span>
          </button>
        </section>

        {/* DESKTOP SIDEBAR + CONTENT */}

        <div className="grid gap-8 lg:grid-cols-[255px_minmax(0,1fr)] xl:grid-cols-[275px_minmax(0,1fr)]">
          <aside className="hidden self-start lg:block">
            <nav className="fcl-sidebar sticky top-6 max-h-[calc(100vh-3rem)] space-y-5 overflow-y-auto rounded-3xl p-4">
              <div className="px-3 pt-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1877F2]">
                  EXPLORE RECORDS
                </p>
              </div>

              {GROUPS.map(
                (group) => (
                  <div
                    key={
                      group.title
                    }
                  >
                    <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-[var(--fcl-muted)]">
                      {
                        group.title
                      }
                    </p>

                    <div className="space-y-1">
                      {group.ids.map(
                        (id) => {
                          const item =
                            TABS.find(
                              (
                                value
                              ) =>
                                value.id ===
                                id
                            );

                          if (
                            !item
                          ) {
                            return null;
                          }

                          const active =
                            tab ===
                            id;

                          return (
                            <button
                              key={
                                id
                              }
                              type="button"
                              onClick={() =>
                                changeTab(
                                  id
                                )
                              }
                              className={`fcl-sidebar-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all ${
                                active
                                  ? "fcl-sidebar-active"
                                  : ""
                              }`}
                            >
                              <span className="text-lg">
                                {
                                  item.icon
                                }
                              </span>

                              <span className="min-w-0 flex-1">
                                {
                                  item.label
                                }
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )
              )}
            </nav>
          </aside>

          <main className="min-w-0 overflow-hidden">
            {query.trim() && (
              <div className="fcl-search-notice mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
                <p className="min-w-0 break-words text-xs font-semibold">
                  🔍 Searching for:{" "}
                  <strong>
                    {query}
                  </strong>
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setQuery("")
                  }
                  className="text-xs font-black text-[#1877F2]"
                >
                  ✕ Clear
                </button>
              </div>
            )}

            {renderContent()}
          </main>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}

      <nav
        aria-label="Mobile navigation"
        className="fcl-bottom-nav fixed bottom-3 left-3 right-3 z-40 rounded-3xl px-4 py-2.5 shadow-2xl backdrop-blur-xl lg:hidden"
      >
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="fcl-bottom-item flex flex-col items-center gap-1 text-[10px] font-bold"
          >
            <span className="text-lg">
              🏠
            </span>
            Home
          </Link>

          <button
            type="button"
            onClick={() =>
              changeTab(
                "teammates_record"
              )
            }
            className={`fcl-bottom-item flex flex-col items-center gap-1 rounded-2xl px-3 py-1 text-[10px] font-bold ${
              tab ===
              "teammates_record"
                ? "fcl-bottom-active"
                : ""
            }`}
          >
            <span className="text-lg">
              🤝
            </span>
            Teammates
          </button>

          <button
            type="button"
            onClick={() =>
              changeTab(
                "tournaments_history"
              )
            }
            className={`fcl-bottom-item flex flex-col items-center gap-1 rounded-2xl px-3 py-1 text-[10px] font-bold ${
              tab ===
              "tournaments_history"
                ? "fcl-bottom-active"
                : ""
            }`}
          >
            <span className="text-lg">
              🏆
            </span>
            History
          </button>

          <Link
            href="/rankings"
            className="fcl-bottom-item flex flex-col items-center gap-1 text-[10px] font-bold"
          >
            <span className="text-lg">
              🚀
            </span>
            Rankings
          </Link>

          <button
            type="button"
            onClick={() =>
              changeTab(
                "clubs"
              )
            }
            className={`fcl-bottom-item flex flex-col items-center gap-1 rounded-2xl px-3 py-1 text-[10px] font-bold ${
              tab ===
              "clubs"
                ? "fcl-bottom-active"
                : ""
            }`}
          >
            <span className="text-lg">
              💎
            </span>
            Clubs
          </button>
        </div>
      </nav>

      {/* PLAYER MODAL */}

      <PlayerCardModal
        selectedPlayer={
          selectedPlayer
        }
        onClose={() =>
          setSelectedPlayer(
            null
          )
        }
        tournamentsData={
          tournamentsData
        }
        allPlayers={
          players
        }
      />
    </div>
  );
}

/* =========================================================
   FCL OFFICIAL PREMIUM STYLES
========================================================= */

const RECORDS_STYLES = `

/* ===================== VARIABLES ===================== */

.fcl-records {
  --fcl-bg: #020617;
  --fcl-card: #0f172a;
  --fcl-card-secondary: #0b1220;
  --fcl-surface: #070d19;

  --fcl-text: #ffffff;
  --fcl-secondary-text: #cbd5e1;
  --fcl-muted: #94a3b8;

  --fcl-border: #172033;

  --fcl-input: #0b1220;
  --fcl-hover: rgba(24,119,242,.09);

  --fcl-header: rgba(2,6,23,.94);
  --fcl-nav: rgba(11,18,32,.96);

  color-scheme: dark;

  background: var(--fcl-bg);
  color: var(--fcl-text);

  transition:
    background .3s ease,
    color .3s ease;
}

.fcl-records[data-fcl-theme="light"] {
  --fcl-bg: #ffffff;
  --fcl-card: #f8fafc;
  --fcl-card-secondary: #f1f5f9;
  --fcl-surface: #ffffff;

  --fcl-text: #0f172a;
  --fcl-secondary-text: #475569;
  --fcl-muted: #64748b;

  --fcl-border: #e2e8f0;

  --fcl-input: #f8fafc;
  --fcl-hover: rgba(24,119,242,.07);

  --fcl-header: rgba(255,255,255,.95);
  --fcl-nav: rgba(248,250,252,.96);

  color-scheme: light;
}

/* ===================== ANIMATIONS ===================== */

@keyframes fclRecordReveal {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fclRecordFloat {
  0%,100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

@keyframes fclRecordGlow {
  0%,100% {
    box-shadow:
      0 0 22px rgba(245,158,11,.12);
  }

  50% {
    box-shadow:
      0 0 45px rgba(245,158,11,.28);
  }
}

@keyframes fclRecordSkeleton {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

.fcl-content-enter {
  animation:
    fclRecordReveal .45s ease both;
}

.fcl-summary-card {
  animation:
    fclRecordReveal .55s ease both;
}

.fcl-crown {
  animation:
    fclRecordFloat 3s ease-in-out infinite;
}

/* ===================== BACKGROUND ===================== */

.fcl-page-background {
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

.fcl-records[data-fcl-theme="light"] .fcl-grid {
  opacity: .4;
}

.fcl-orb {
  filter: blur(110px);
}

.fcl-orb-blue {
  background: rgba(24,119,242,.13);
}

.fcl-orb-gold {
  background: rgba(245,158,11,.08);
}

.fcl-orb-purple {
  background: rgba(168,85,247,.08);
}

/* ===================== HEADER ===================== */

.fcl-gradient-text {
  background:
    linear-gradient(
      110deg,
      #1877F2,
      #60a5fa,
      #22d3ee
    );

  background-clip: text;
  -webkit-background-clip: text;

  -webkit-text-fill-color: transparent;
}

.fcl-mobile-header {
  background: var(--fcl-header);

  border-color: var(--fcl-border);
}

.fcl-back-button,
.fcl-search-toggle {
  color: var(--fcl-text);

  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);
}

.fcl-search-input {
  color: var(--fcl-text);

  background: var(--fcl-input);

  border: 1px solid var(--fcl-border);

  transition:
    border-color .3s,
    box-shadow .3s;
}

.fcl-search-input::placeholder {
  color: var(--fcl-muted);
}

.fcl-search-input:focus {
  border-color: #1877F2;

  box-shadow:
    0 0 0 3px rgba(24,119,242,.13);
}

.fcl-rankings-link {
  color: #ffffff;

  background:
    linear-gradient(
      135deg,
      #1877F2,
      #2563eb
    );

  box-shadow:
    0 8px 25px rgba(24,119,242,.18);
}

.fcl-rankings-link:hover {
  box-shadow:
    0 12px 30px rgba(24,119,242,.3);
}

/* ===================== SUMMARY ===================== */

.fcl-summary-card {
  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 8px 30px rgba(0,0,0,.04);
}

.fcl-summary-card:hover {
  border-color: rgba(24,119,242,.4);

  box-shadow:
    0 15px 35px rgba(24,119,242,.09);
}

.fcl-stat-icon {
  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

/* ===================== MOBILE CATEGORIES ===================== */

.fcl-mobile-categories {
  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 10px 35px rgba(0,0,0,.05);
}

.fcl-history-button {
  color: #f59e0b;

  background: rgba(245,158,11,.09);

  border: 1px solid rgba(245,158,11,.35);
}

.fcl-history-active {
  color: #020617;

  background:
    linear-gradient(
      120deg,
      #f59e0b,
      #fbbf24
    );

  border-color: #f59e0b;

  box-shadow:
    0 8px 24px rgba(245,158,11,.2);
}

.fcl-mobile-category {
  color: var(--fcl-secondary-text);

  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

.fcl-mobile-category:hover {
  border-color: rgba(24,119,242,.45);
}

.fcl-mobile-category-active {
  color: #ffffff !important;

  background:
    linear-gradient(
      135deg,
      #1877F2,
      #2563eb
    ) !important;

  border-color: #1877F2;

  box-shadow:
    0 8px 22px rgba(24,119,242,.22);
}

/* ===================== SIDEBAR ===================== */

.fcl-sidebar {
  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 10px 35px rgba(0,0,0,.04);

  scrollbar-width: thin;
}

.fcl-sidebar-item {
  color: var(--fcl-muted);
}

.fcl-sidebar-item:hover {
  color: var(--fcl-text);
  background: var(--fcl-hover);
}

.fcl-sidebar-active {
  color: #ffffff !important;

  background:
    linear-gradient(
      135deg,
      #1877F2,
      #2563eb
    ) !important;

  box-shadow:
    0 5px 18px rgba(24,119,242,.18);
}

/* ===================== SEARCH NOTICE ===================== */

.fcl-search-notice {
  color: var(--fcl-secondary-text);

  background: rgba(24,119,242,.07);

  border: 1px solid rgba(24,119,242,.2);
}

/* ===================== SECTION ===================== */

.fcl-section-heading h2 {
  color: var(--fcl-text);
}

.fcl-heading-icon {
  border: 1px solid;
}

/* ===================== CHIPS ===================== */

.fcl-chip-scroll {
  scrollbar-width: none;
}

.fcl-chip-scroll::-webkit-scrollbar {
  display: none;
}

.fcl-count-chip {
  color: var(--fcl-secondary-text);

  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);

  transition:
    background .2s,
    color .2s,
    border-color .2s;
}

.fcl-count-chip:hover {
  color: #1877F2;

  border-color: rgba(24,119,242,.4);
}

.fcl-count-active {
  color: #ffffff !important;

  background: #1877F2 !important;

  border-color: #1877F2 !important;

  box-shadow:
    0 5px 15px rgba(24,119,242,.18);
}

/* ===================== AVATAR ===================== */

.fcl-avatar {
  background: var(--fcl-card-secondary);

  border: 2px solid var(--fcl-border);

  transition:
    border-color .3s,
    transform .3s;
}

.group:hover .fcl-avatar {
  border-color: #1877F2;

  transform: scale(1.05);
}

/* ===================== PODIUM ===================== */

.fcl-podium {
  border: 2px solid;

  box-shadow:
    0 12px 35px rgba(0,0,0,.08);
}

.fcl-podium:hover {
  box-shadow:
    0 18px 45px rgba(24,119,242,.12);
}

.fcl-podium-first {
  animation:
    fclRecordGlow 4s ease-in-out infinite;
}

.fcl-podium-value {
  background: rgba(0,0,0,.13);

  border: 1px solid var(--fcl-border);
}

.fcl-records[data-fcl-theme="light"] .fcl-podium-value {
  background: rgba(255,255,255,.65);
}

.fcl-records[data-fcl-theme="light"] .fcl-podium:nth-child(2) .fcl-podium-value p:first-child {
  color: #b45309 !important;
}

.fcl-records[data-fcl-theme="light"] .fcl-podium:nth-child(1) .fcl-podium-value p:first-child {
  color: #475569 !important;
}

/* ===================== RANKINGS ===================== */

.fcl-ranking-list {
  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 12px 35px rgba(0,0,0,.05);
}

.fcl-list-header {
  color: var(--fcl-muted);

  background: var(--fcl-card-secondary);

  border-color: var(--fcl-border);
}

.fcl-ranking-row {
  border-bottom: 1px solid var(--fcl-border);
}

.fcl-ranking-row:last-child {
  border-bottom: none;
}

.fcl-ranking-row:hover {
  background: var(--fcl-hover);
}

.fcl-player-name {
  color: var(--fcl-text);

  transition: color .2s;
}

.fcl-ranking-row:hover .fcl-player-name {
  color: #1877F2;
}

.fcl-rank-badge {
  color: var(--fcl-muted);

  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

/* ===================== RECORD HOLDERS ===================== */

.fcl-holder-card {
  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 8px 30px rgba(0,0,0,.04);
}

.fcl-holder-card:hover {
  box-shadow:
    0 15px 35px rgba(24,119,242,.1);
}

.fcl-holder-featured {
  background:
    linear-gradient(
      135deg,
      rgba(245,158,11,.07),
      var(--fcl-card) 65%
    );
}

.fcl-holder-divider {
  border-color: var(--fcl-border);
}

/* ===================== CLUBS ===================== */

.fcl-tier-card {
  background: var(--fcl-card);

  border: 1px solid;

  box-shadow:
    0 10px 35px rgba(0,0,0,.04);
}

.fcl-tier-list {
  scrollbar-width: thin;
}

.fcl-tier-player:hover {
  background: var(--fcl-hover);
}

/* ===================== TOURNAMENT ===================== */

.fcl-tour-summary {
  background:
    linear-gradient(
      120deg,
      rgba(245,158,11,.07),
      var(--fcl-card),
      rgba(24,119,242,.05)
    );

  border: 1px solid rgba(245,158,11,.25);

  box-shadow:
    0 10px 35px rgba(0,0,0,.04);
}

.fcl-tour-stat + .fcl-tour-stat {
  border-left: 1px solid var(--fcl-border);
}

.fcl-tour-index-toggle {
  color: #f59e0b;

  border-color: var(--fcl-border);
}

.fcl-tour-index {
  border-color: var(--fcl-border);

  scrollbar-width: thin;
}

.fcl-letter-badge {
  color: #f59e0b;

  background: rgba(245,158,11,.12);
}

.fcl-index-chip {
  color: var(--fcl-secondary-text);

  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

.fcl-index-chip:hover {
  color: #1877F2;

  border-color: rgba(24,119,242,.45);
}

.fcl-select {
  color: #f59e0b;

  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);
}

.fcl-select:focus {
  border-color: #1877F2;
}

.fcl-letter-filter {
  color: var(--fcl-secondary-text);

  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);
}

.fcl-letter-active {
  color: #ffffff;

  background: #1877F2;

  border-color: #1877F2;
}

.fcl-tour-card,
.fcl-tour-sidebar,
.fcl-tour-desktop-detail {
  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 8px 30px rgba(0,0,0,.04);
}

.fcl-tour-sidebar {
  scrollbar-width: thin;
}

.fcl-tour-letter {
  color: #020617;

  background:
    linear-gradient(
      135deg,
      #fde68a,
      #f59e0b,
      #d97706
    );
}

.fcl-tour-expanded,
.fcl-tour-detail-heading {
  border-color: var(--fcl-border);
}

.fcl-tour-list-item {
  border: 1px solid transparent;
}

.fcl-tour-list-item:hover {
  background: var(--fcl-hover);
}

.fcl-tour-list-active {
  background: rgba(24,119,242,.09);

  border-color: rgba(24,119,242,.4);
}

.fcl-detail-chip {
  color: var(--fcl-secondary-text);

  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

.fcl-tour-segment {
  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

.fcl-tour-segment-active {
  background: rgba(245,158,11,.06);

  border-width: 2px;
}

.fcl-squad-panel {
  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

.fcl-squad-chip {
  color: var(--fcl-secondary-text);

  background: var(--fcl-card);

  border: 1px solid var(--fcl-border);
}

.fcl-squad-chip:enabled:hover {
  color: #1877F2;

  border-color: rgba(24,119,242,.4);
}

.fcl-award-cell {
  background: var(--fcl-card-secondary);

  border: 1px solid var(--fcl-border);
}

/* ===================== LOAD MORE ===================== */

.fcl-load-more {
  color: #1877F2;

  background: rgba(24,119,242,.08);

  border: 1px solid rgba(24,119,242,.3);

  transition:
    background .3s,
    color .3s;
}

.fcl-load-more:hover {
  color: #ffffff;

  background: #1877F2;
}

/* ===================== EMPTY ===================== */

.fcl-empty {
  background: var(--fcl-card);

  border: 1px dashed var(--fcl-border);
}

/* ===================== SKELETON ===================== */

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
    fclRecordSkeleton 1.6s linear inverse;
}

/* ===================== BOTTOM NAV ===================== */

.fcl-bottom-nav {
  background: var(--fcl-nav);

  border: 1px solid var(--fcl-border);

  box-shadow:
    0 12px 40px rgba(0,0,0,.2);
}

.fcl-bottom-item {
  color: var(--fcl-muted);

  transition: color .2s;
}

.fcl-bottom-item:hover {
  color: #1877F2;
}

.fcl-bottom-active {
  color: #1877F2;

  background: rgba(24,119,242,.1);
}

/* ===================== RESPONSIVE ===================== */

@media (max-width: 639px) {
  .fcl-podium-grid {
    gap: 7px.
  }

  .fcl-podium {
    border-radius: 18px;
  }

  .fcl-podium-first {
    padding-top: 34px;
    padding-bottom: 23px;
  }

  .fcl-podium-value {
    padding-left: 2px;
    padding-right: 2px;
  }

  .fcl-mobile-category {
    min-height: 68px;
  }

  .fcl-summary-card {
    min-height: 100px;
  }
}

@media (max-width: 370px) {
  .fcl-podium {
    padding-left: 3px;
    padding-right: 3px;
  }

  .fcl-podium-value p:first-child {
    font-size: 17px;
  }

  .fcl-mobile-category {
    padding-left: 2px;
    padding-right: 2px;
  }

  .fcl-bottom-nav {
    left: 6px;
    right: 6px;
    padding-left: 10px;
    padding-right: 10px;
  }
}

/* ===================== REDUCED MOTION ===================== */

@media (prefers-reduced-motion: reduce) {
  .fcl-content-enter,
  .fcl-summary-card,
  .fcl-crown,
  .fcl-podium-first,
  .fcl-skeleton {
    animation: none !important;
  }

  .fcl-records *,
  .fcl-records *::before,
  .fcl-records *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}

`;