"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";

/* =========================================================
   FCL OFFICIAL PLAYING REGULATIONS
   Professional Rulebook • Bengali / English • Dark / Light
   ========================================================= */

type Lang = "bn" | "en";
type L = { bn: string; en: string };

type TabId =
  | "basic"
  | "formats"
  | "single"
  | "team"
  | "power"
  | "test"
  | "challenge";

type Rule = {
  title: L;
  description: L;
};

const text = (bn: string, en: string): L => ({ bn, en });

const CHAPTERS: {
  id: TabId;
  number: string;
  title: L;
  short: L;
  description: L;
}[] = [
  {
    id: "basic",
    number: "01",
    title: text("খেলার মূলনীতি", "Fundamentals of Play"),
    short: text("মূলনীতি", "Fundamentals"),
    description: text(
      "FCL ক্রিকেট পরিচালনার মৌলিক পদ্ধতি",
      "The fundamental principles of FCL cricket"
    ),
  },
  {
    id: "formats",
    number: "02",
    title: text("ম্যাচ ফরম্যাট", "Match Formats"),
    short: text("ফরম্যাট", "Formats"),
    description: text(
      "অফিশিয়াল ও আনঅফিশিয়াল ম্যাচের কাঠামো",
      "Official and unofficial match structures"
    ),
  },
  {
    id: "single",
    number: "03",
    title: text("সিঙ্গেল ম্যাচ", "Individual Matches"),
    short: text("সিঙ্গেল", "Individual"),
    description: text(
      "দুই খেলোয়াড়ের মধ্যকার ম্যাচের নিয়মাবলি",
      "Regulations governing individual matches"
    ),
  },
  {
    id: "team",
    number: "04",
    title: text("দলগত ম্যাচ", "Team Competition"),
    short: text("দলগত", "Team"),
    description: text(
      "দল, অধিনায়ক ও লাইনআপ পরিচালনার নিয়ম",
      "Team composition, captains and lineup procedures"
    ),
  },
  {
    id: "power",
    number: "05",
    title: text("পাওয়ার প্লে", "Power Play Regulations"),
    short: text("পাওয়ার প্লে", "Power Play"),
    description: text(
      "নরমাল ও সুপার পাওয়ার প্লের বিশেষ বিধান",
      "Special regulations for normal and super power plays"
    ),
  },
  {
    id: "test",
    number: "06",
    title: text("টেস্ট ক্রিকেট", "Test Cricket"),
    short: text("টেস্ট", "Test Cricket"),
    description: text(
      "ইনিংস, জিরো রুল ও টেস্ট ম্যাচ পরিচালনা",
      "Innings, zero rules and Test match procedures"
    ),
  },
  {
    id: "challenge",
    number: "07",
    title: text("চ্যালেঞ্জ ম্যাচ", "Challenge Matches"),
    short: text("চ্যালেঞ্জ", "Challenge"),
    description: text(
      "FCL ডলারভিত্তিক চ্যালেঞ্জ ম্যাচের বিধান",
      "Regulations for FCL Dollar challenge matches"
    ),
  },
];

/* =========================================================
   RULEBOOK DATA
   ========================================================= */

const BASIC_RULES: Rule[] = [
  {
    title: text("টস পরিচালনা", "Conducting the Toss"),
    description: text(
      "ম্যাচ শুরুর আগে আম্পায়ার ক্রিকেটবিষয়ক একটি প্রশ্ন করবেন। যে খেলোয়াড় প্রথমে সঠিক উত্তর দেবেন, তিনি টসে বিজয়ী হবেন এবং ব্যাটিং অথবা বোলিং বেছে নিতে পারবেন।",
      "Before the match begins, the umpire asks a cricket-related question. The first player to answer correctly wins the toss and may choose to bat or bowl."
    ),
  },
  {
    title: text("সংখ্যা জমা দেওয়া", "Submission of Numbers"),
    description: text(
      "ব্যাটার ও বোলার Facebook Messenger-এর মাধ্যমে আম্পায়ারের ইনবক্সে নিজেদের সংখ্যা পাঠাবেন। সাধারণ ম্যাচে অনুমোদিত সংখ্যা হলো ১, ২, ৩, ৪ ও ৬।",
      "The batter and bowler submit their numbers privately to the umpire through Facebook Messenger. The permitted numbers in a regular match are 1, 2, 3, 4 and 6."
    ),
  },
  {
    title: text("ওভার ও বল", "Overs and Deliveries"),
    description: text(
      "প্রতি ওভারে ৬টি বল থাকবে। একটি পূর্ণ ওভারের জন্য প্রত্যেক খেলোয়াড়কে ৬টি সংখ্যা জমা দিতে হবে। একই সংখ্যা একাধিকবার ব্যবহার করা যাবে।",
      "Each over consists of six deliveries. Players submit six numbers for a complete over, and any permitted number may be repeated."
    ),
  },
  {
    title: text("রান নির্ধারণ", "Awarding Runs"),
    description: text(
      "কোনো বলে ব্যাটার ও বোলারের সংখ্যা আলাদা হলে ব্যাটারের দেওয়া সংখ্যাটি রান হিসেবে গণনা করা হবে।",
      "When the batter's number differs from the bowler's number, the batter's submitted number is awarded as runs."
    ),
  },
  {
    title: text("আউট নির্ধারণ", "Dismissal"),
    description: text(
      "একই বলের ব্যাটিং ও বোলিং সংখ্যা মিলে গেলে ব্যাটার আউট হবেন। সেই বলে কোনো রান যোগ হবে না।",
      "A batter is dismissed when the batting and bowling numbers match on the same delivery. No runs are awarded for that ball."
    ),
  },
  {
    title: text("স্কোর ও ফলাফল", "Scoring and Result"),
    description: text(
      "আম্পায়ার প্রতি বলের ফলাফল যাচাই করে রান, উইকেট ও ওভার গণনা করবেন এবং ম্যাচ শেষে ফলাফল ঘোষণা করবেন।",
      "The umpire verifies each delivery, maintains the runs, wickets and overs, and declares the match result."
    ),
  },
];

const SINGLE_RULES: Rule[] = [
  {
    title: text("অংশগ্রহণকারী", "Participants"),
    description: text(
      "একটি সিঙ্গেল ম্যাচ পরিচালনার জন্য দুইজন খেলোয়াড় এবং একজন আম্পায়ার প্রয়োজন। ম্যাচটি ২ ওভার ও ৩ উইকেটের।",
      "An individual match requires two players and one umpire. The format consists of two overs and three wickets."
    ),
  },
  {
    title: text("টস ও ইনিংস", "Toss and Innings"),
    description: text(
      "টসে বিজয়ী খেলোয়াড় ব্যাটিং অথবা বোলিং বেছে নেবেন। প্রথম ইনিংস শেষে দ্বিতীয় খেলোয়াড় নির্ধারিত লক্ষ্য তাড়া করবেন।",
      "The toss winner chooses to bat or bowl. After the first innings, the second player attempts to chase the target."
    ),
  },
  {
    title: text("উইকেট ও সংখ্যা পরিবর্তন", "Wickets and Number Changes"),
    description: text(
      "সিঙ্গেল ম্যাচে আউট হওয়ার পর আগে জমা দেওয়া ব্যাটিং সংখ্যা পরিবর্তন করা যাবে না। একই ওভারে যতবার সংখ্যা মিলবে, প্রতিবার একটি করে উইকেট গণনা হবে।",
      "Previously submitted batting numbers cannot be changed after a dismissal. Every matching delivery counts as a separate wicket."
    ),
  },
];

const TEAM_RULES: Rule[] = [
  {
    title: text("দল গঠন", "Team Composition"),
    description: text(
      "ম্যাচে দুটি দল এবং একজন আম্পায়ার থাকবেন। প্রতিটি দলে একাধিক খেলোয়াড় এবং একজন নির্ধারিত অধিনায়ক থাকবেন।",
      "A team match involves two teams and an umpire. Each team consists of multiple players and a designated captain."
    ),
  },
  {
    title: text("টসের অধিকার", "Toss Eligibility"),
    description: text(
      "দলগত ম্যাচে আম্পায়ারের টস প্রশ্নের উত্তর দেওয়ার অধিকার শুধু দুই দলের অধিনায়কের থাকবে।",
      "Only the designated captains may answer the umpire's toss question."
    ),
  },
  {
    title: text("লাইনআপ জমা", "Lineup Submission"),
    description: text(
      "দুই দলের অধিনায়ক ম্যাচ শুরুর আগে নিজ নিজ ব্যাটিং ও বোলিং লাইনআপ জমা দেবেন।",
      "Both captains must submit their respective batting and bowling lineups before play begins."
    ),
  },
  {
    title: text("ব্যাটার আউট হলে", "Following a Dismissal"),
    description: text(
      "কোনো ব্যাটার আউট হলে পরবর্তী ব্যাটার শুধু ওই ওভারের অবশিষ্ট বলগুলোর জন্য সংখ্যা জমা দেবেন।",
      "When a batter is dismissed, the incoming batter submits numbers only for the remaining deliveries of that over."
    ),
  },
  {
    title: text("শেষ বলে আউট", "Dismissal on the Final Ball"),
    description: text(
      "ওভারের শেষ বলে উইকেট পড়লে পরবর্তী ওভার নির্ধারিত লাইনআপ অনুযায়ী নতুন ব্যাটার ও বোলার দিয়ে শুরু হবে।",
      "If a wicket falls on the last ball, the next over begins with the next eligible batter and bowler according to the submitted lineups."
    ),
  },
  {
    title: text("জমা দেওয়া সংখ্যা পরিবর্তন", "Changes to Submitted Numbers"),
    description: text(
      "বোলার একবার একটি ওভারের সংখ্যা জমা দিলে তা পরিবর্তন করতে পারবেন না। তবে নতুন ব্যাটার নিজের জন্য নতুন ব্যাটিং সংখ্যা জমা দিতে পারবেন।",
      "A bowler cannot modify a submitted over. An incoming batter, however, may submit a new set of batting numbers."
    ),
  },
];

const OFFICIAL_FORMATS = [
  { name: "T20", overs: 4, wickets: 6 },
  { name: "T20+", overs: 5, wickets: 7 },
  { name: "ODI", overs: 6, wickets: 8 },
  { name: "ODI+", overs: 8, wickets: 10 },
  { name: "ODI Dhamaka", overs: 10, wickets: 11 },
];

const UNOFFICIAL_FORMATS = [
  {
    name: text("সিঙ্গেল ম্যাচ", "Single Match"),
    overs: 2,
    wickets: 3,
  },
  {
    name: text("দলগত ম্যাচ", "Team Match"),
    overs: 3,
    wickets: 5,
  },
  {
    name: text("সিঙ্গেল টেস্ট", "Single Test"),
    overs: 8,
    wickets: 3,
  },
  {
    name: text("দলগত টেস্ট", "Team Test"),
    overs: 12,
    wickets: 4,
  },
];

const TEST_RULES: Rule[] = [
  {
    title: text("ম্যাচের সময়সীমা", "Match Duration"),
    description: text(
      "অফিশিয়াল টেস্ট ম্যাচ ৩ দিনব্যাপী অনুষ্ঠিত হবে। প্রতিদিন সর্বোচ্চ ১৫ ওভার খেলা হবে।",
      "An official Test match is scheduled over three days, with a maximum of 15 overs per day."
    ),
  },
  {
    title: text("ইনিংস ও উইকেট", "Innings and Wickets"),
    description: text(
      "প্রতিটি দল দুটি করে ইনিংস খেলার সুযোগ পাবে। প্রতি ইনিংসে নির্ধারিত ফরম্যাট অনুযায়ী ৮ অথবা ১০ উইকেট থাকবে।",
      "Each team plays two innings, with eight or ten wickets per innings according to the designated format."
    ),
  },
  {
    title: text("জিরো রুল", "Zero Rule"),
    description: text(
      "ম্যাচ শুরুর আগে আম্পায়ার জিরো রুল ১ অথবা জিরো রুল ২ নির্ধারণ করবেন।",
      "Before play begins, the umpire selects either Zero Rule 1 or Zero Rule 2."
    ),
  },
  {
    title: text("ড্র ঘোষণা", "Drawn Match"),
    description: text(
      "নির্ধারিত তিন দিনের মধ্যে ম্যাচের ফলাফল নির্ধারিত না হলে ম্যাচ ড্র ঘোষণা করা হবে।",
      "If the match remains undecided after the scheduled three days, the result is a draw."
    ),
  },
  {
    title: text("ফলো-অন", "Follow-On"),
    description: text(
      "প্রথম ইনিংসে ৩০ বা তার বেশি রানের লিড থাকলে এগিয়ে থাকা দলের অধিনায়ক প্রতিপক্ষকে ফলো-অন করাতে পারবেন।",
      "A captain may enforce the follow-on when their team holds a first-innings lead of at least 30 runs."
    ),
  },
  {
    title: text("ইনিংস ডিক্লেয়ার", "Declaration"),
    description: text(
      "কোনো দল প্রয়োজন অনুযায়ী যেকোনো সময় নিজেদের ইনিংস ডিক্লেয়ার করতে পারবে।",
      "A team may declare its innings at any time."
    ),
  },
  {
    title: text("ব্যাটিং সীমা", "Batting Eligibility"),
    description: text(
      "একজন ব্যাটার প্রতি ইনিংসে একবার করে সর্বোচ্চ দুই ইনিংসে ব্যাট করতে পারবেন।",
      "A batter may bat once in each innings, for a maximum of two batting appearances."
    ),
  },
  {
    title: text("বোলিং সীমা", "Bowling Restriction"),
    description: text(
      "একজন বোলার প্রতিদিন সর্বোচ্চ ৩ ওভার বোলিং করতে পারবেন।",
      "A bowler may deliver a maximum of three overs per day."
    ),
  },
];

const COMMON_TEST_RULES: Rule[] = [
  {
    title: text("ডিক্লারেশন", "Declaration"),
    description: text(
      "প্রয়োজন অনুযায়ী যেকোনো সময় ইনিংস ডিক্লেয়ার করা যাবে।",
      "An innings may be declared at any time."
    ),
  },
  {
    title: text("ওভার সমন্বয়", "Over Adjustment"),
    description: text(
      "বর্ধিত ওভার শুরু হওয়ার আগেই অলআউট হলে শেষ ওভার কমানো হবে না। তবে এক ওভারের কম খেলে অলআউট হলে এক ওভার কমাতে হবে।",
      "If a team is all out before the additional overs begin, the final over is not deducted. However, if the team is all out in less than one over, one over is deducted."
    ),
  },
  {
    title: text("সংখ্যা চিহ্নিতকরণ", "Submission Identification"),
    description: text(
      "আম্পায়ারের স্কোর গণনার সুবিধার্থে জমা দেওয়া সংখ্যার সঙ্গে BAT অথবা BOWL স্পষ্টভাবে লিখতে হবে।",
      "Every submission must be clearly labelled BAT or BOWL to assist the umpire in scoring."
    ),
  },
];

const CHALLENGE_RULES: Rule[] = [
  {
    title: text("ম্যাচের কাঠামো", "Match Structure"),
    description: text(
      "চ্যালেঞ্জ ম্যাচ ২ ওভার ও ৩ উইকেটের হবে। এ ধরনের ম্যাচে আউট হওয়ার পর ব্যাটিং সংখ্যা পরিবর্তন করা যাবে।",
      "Challenge matches consist of two overs and three wickets. Batting numbers may be changed after a dismissal."
    ),
  },
  {
    title: text("অনুমোদিত স্থান", "Designated Match Posts"),
    description: text(
      "চ্যালেঞ্জ ম্যাচ যেকোনো সময় বা যেকোনো পোস্টে আয়োজন করা যাবে না। গ্রুপের নির্ধারিত দুটি পোস্টে ম্যাচ পরিচালনা করতে হবে।",
      "Challenge matches must take place within the two designated group posts rather than at arbitrary times or locations."
    ),
  },
  {
    title: text("আম্পায়ার নিয়োগ", "Appointment of Umpires"),
    description: text(
      "Facebook Cricket Council (FCC) কর্তৃক নির্ধারিত বিশ্বস্ত আম্পায়াররা চ্যালেঞ্জ ম্যাচ পরিচালনা করবেন।",
      "Challenge matches are officiated by trusted umpires appointed by the Facebook Cricket Council (FCC)."
    ),
  },
  {
    title: text("দলগত চ্যালেঞ্জ", "Team Challenges"),
    description: text(
      "দুই খেলোয়াড়ের পাশাপাশি দলগতভাবেও চ্যালেঞ্জ ম্যাচ আয়োজন করা যাবে।",
      "Challenge matches may also be arranged between teams."
    ),
  },
];

/* =========================================================
   THEME DETECTION
   ========================================================= */

function detectDarkTheme(): boolean {
  if (typeof window === "undefined") return true;

  const html = document.documentElement;
  const body = document.body;

  const attributes = [
    html.getAttribute("data-theme"),
    html.getAttribute("data-mode"),
    body.getAttribute("data-theme"),
    body.getAttribute("data-mode"),
  ];

  for (const value of attributes) {
    if (value === "dark") return true;
    if (value === "light") return false;
  }

  if (html.classList.contains("dark")) return true;
  if (html.classList.contains("light")) return false;

  if (body.classList.contains("dark")) return true;
  if (body.classList.contains("light")) return false;

  const schemes = [html.style.colorScheme, body.style.colorScheme];

  for (const scheme of schemes) {
    if (scheme === "dark") return true;
    if (scheme === "light") return false;
  }

  try {
    const stored = localStorage.getItem("theme");

    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {
    // Storage may be unavailable.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function useIsDark() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const update = () => setIsDark(detectDarkTheme());

    update();

    const observer = new MutationObserver(update);

    const options: MutationObserverInit = {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-mode", "style"],
    };

    observer.observe(document.documentElement, options);
    observer.observe(document.body, options);

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    media.addEventListener?.("change", update);
    window.addEventListener("storage", update);

    return () => {
      observer.disconnect();
      media.removeEventListener?.("change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return isDark;
}

/* =========================================================
   REUSABLE COMPONENTS
   ========================================================= */

function SectionLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`fcl-section-label ${className}`}>{children}</span>
  );
}

function SectionHeader({
  chapter,
  lang,
  subtitle,
}: {
  chapter: string;
  lang: Lang;
  subtitle?: L;
}) {
  const current = CHAPTERS.find((item) => item.id === chapter);

  if (!current) return null;

  return (
    <header className="fcl-chapter-header">
      <div className="fcl-chapter-reference">
        <span>
          {lang === "bn" ? "অধ্যায়" : "CHAPTER"} {current.number}
        </span>

        <span className="fcl-reference-line" />
      </div>

      <h2>{current.title[lang]}</h2>

      <p>{subtitle?.[lang] ?? current.description[lang]}</p>
    </header>
  );
}

function RuleCard({
  rule,
  index,
  chapter,
  lang,
}: {
  rule: Rule;
  index: number;
  chapter: string;
  lang: Lang;
}) {
  return (
    <article className="fcl-rule">
      <div className="fcl-rule-number">
        {chapter}.{String(index + 1).padStart(2, "0")}
      </div>

      <div className="fcl-rule-content">
        <h3>{rule.title[lang]}</h3>
        <p>{rule.description[lang]}</p>
      </div>
    </article>
  );
}

function RuleCollection({
  rules,
  chapter,
  lang,
}: {
  rules: Rule[];
  chapter: string;
  lang: Lang;
}) {
  return (
    <div className="fcl-rule-collection">
      {rules.map((rule, index) => (
        <RuleCard
          key={`${chapter}-${index}`}
          rule={rule}
          index={index}
          chapter={chapter}
          lang={lang}
        />
      ))}
    </div>
  );
}

function InfoBox({
  title,
  children,
  tone = "blue",
}: {
  title: string;
  children: ReactNode;
  tone?: "blue" | "amber" | "green" | "red";
}) {
  return (
    <aside className={`fcl-info-box fcl-info-${tone}`}>
      <div className="fcl-info-heading">
        <span className="fcl-info-indicator" />
        <h4>{title}</h4>
      </div>

      <div className="fcl-info-body">{children}</div>
    </aside>
  );
}

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="fcl-segmented" role="group">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          className={value === option.value ? "active" : ""}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   BALL-BY-BALL SCORECARD
   ========================================================= */

function ScoreExample({
  bat,
  bowl,
  lang,
}: {
  bat: number[];
  bowl: number[];
  lang: Lang;
}) {
  const results = useMemo(
    () =>
      bat.map((value, index) => ({
        bat: value,
        bowl: bowl[index],
        out: value === bowl[index],
        runs: value === bowl[index] ? 0 : value,
      })),
    [bat, bowl]
  );

  const totalRuns = results.reduce((sum, item) => sum + item.runs, 0);
  const wickets = results.filter((item) => item.out).length;

  const completedOvers = Math.floor(results.length / 6);
  const remainingBalls = results.length % 6;

  const overs = `${completedOvers}.${remainingBalls}`;

  return (
    <div className="fcl-scorecard">
      <div className="fcl-scorecard-header">
        <div>
          <SectionLabel>
            {lang === "bn" ? "ম্যাচ সিমুলেশন" : "MATCH SIMULATION"}
          </SectionLabel>

          <h4>
            {lang === "bn"
              ? "বল অনুযায়ী স্কোর গণনা"
              : "Ball-by-Ball Scoring"}
          </h4>
        </div>

        <span className="fcl-scorecard-status">
          {lang === "bn" ? "নমুনা স্কোরকার্ড" : "SAMPLE SCORECARD"}
        </span>
      </div>

      <div className="fcl-scorecard-scroll">
        <div className="fcl-scorecard-grid">
          <div className="fcl-score-label">
            {lang === "bn" ? "বল" : "BALL"}
          </div>

          {results.map((_, index) => (
            <div key={`ball-${index}`} className="fcl-ball-heading">
              {String(index + 1).padStart(2, "0")}
            </div>
          ))}

          <div className="fcl-score-label">BAT</div>

          {results.map((result, index) => (
            <div key={`bat-${index}`} className="fcl-ball-number">
              {result.bat}
            </div>
          ))}

          <div className="fcl-score-label">BOWL</div>

          {results.map((result, index) => (
            <div key={`bowl-${index}`} className="fcl-ball-number">
              {result.bowl}
            </div>
          ))}

          <div className="fcl-score-label">
            {lang === "bn" ? "ফল" : "RESULT"}
          </div>

          {results.map((result, index) => (
            <div
              key={`result-${index}`}
              className={`fcl-ball-result ${
                result.out ? "is-out" : "is-run"
              }`}
            >
              {result.out ? "OUT" : `+${result.runs}`}
            </div>
          ))}
        </div>
      </div>

      <div className="fcl-scorecard-footer">
        <div>
          <span className="fcl-score-caption">
            {lang === "bn" ? "মোট স্কোর" : "TOTAL SCORE"}
          </span>

          <div className="fcl-score-total">
            {totalRuns}
            <span>/{wickets}</span>
          </div>
        </div>

        <div className="fcl-score-over">
          <span className="fcl-score-caption">
            {lang === "bn" ? "সম্পন্ন ওভার" : "OVERS"}
          </span>

          <strong>{overs}</strong>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CHAPTER 01 — FUNDAMENTALS
   ========================================================= */

function BasicRules({ lang }: { lang: Lang }) {
  const bn = lang === "bn";

  return (
    <div className="fcl-chapter-body">
      <SectionHeader chapter="basic" lang={lang} />

      <InfoBox
        title={bn ? "FCL ক্রিকেট কীভাবে পরিচালিত হয়" : "How FCL Cricket Works"}
      >
        <p>
          {bn
            ? "Facebook Cricket League-এ খেলোয়াড়রা Messenger-এর মাধ্যমে আম্পায়ারকে সংখ্যা পাঠিয়ে ক্রিকেট খেলেন। আম্পায়ার ব্যাটিং ও বোলিং সংখ্যা তুলনা করে রান এবং উইকেট নির্ধারণ করেন। ম্যাচের কার্যক্রম Facebook গ্রুপ পোস্টে পরিচালিত হয়।"
            : "In Facebook Cricket League, players submit numbers to the umpire through Messenger. The umpire compares the batting and bowling submissions to determine runs and wickets. Match activities are conducted through Facebook group posts."}
        </p>
      </InfoBox>

      <div className="fcl-subsection-heading">
        <span>01 — 06</span>

        <h3>
          {bn ? "খেলার মৌলিক বিধান" : "Fundamental Playing Regulations"}
        </h3>
      </div>

      <RuleCollection rules={BASIC_RULES} chapter="01" lang={lang} />

      <InfoBox
        tone="amber"
        title={bn ? "গুরুত্বপূর্ণ বিধিনিষেধ" : "Important Restriction"}
      >
        <p>
          {bn
            ? "সাধারণ ম্যাচে ৫ নম্বর ব্যবহার সম্পূর্ণ নিষিদ্ধ। কেবল ১, ২, ৩, ৪ ও ৬ ব্যবহার করা যাবে। একই সংখ্যা বারবার ব্যবহার করার অনুমতি রয়েছে।"
            : "The number 5 is strictly prohibited in regular matches. Only 1, 2, 3, 4 and 6 are permitted. Repeating an allowed number is acceptable."}
        </p>
      </InfoBox>

      <div className="fcl-subsection-heading">
        <span>EXAMPLE 01</span>

        <h3>{bn ? "স্কোর গণনার উদাহরণ" : "Scoring Example"}</h3>

        <p>
          {bn
            ? "নিচের উদাহরণে একটি সম্পূর্ণ ওভারের ব্যাটিং ও বোলিং সংখ্যা দেখানো হয়েছে।"
            : "The following example demonstrates the batting and bowling submissions for one complete over."}
        </p>
      </div>

      <ScoreExample
        lang={lang}
        bat={[3, 6, 4, 3, 2, 1]}
        bowl={[6, 4, 3, 4, 2, 3]}
      />

      <div className="fcl-explanation">
        <strong>
          {bn ? "স্কোর বিশ্লেষণ" : "Score Explanation"}
        </strong>

        <p>
          {bn
            ? "পঞ্চম বলে ব্যাট ও বলের সংখ্যা ২–২ মিলে যাওয়ায় একটি উইকেট পড়েছে। বাকি পাঁচ বলে রান হয়েছে ৩ + ৬ + ৪ + ৩ + ১ = ১৭।"
            : "The numbers match at 2–2 on the fifth ball, resulting in one wicket. The remaining five deliveries produce 3 + 6 + 4 + 3 + 1 = 17 runs."}
        </p>

        <span>
          {bn
            ? "চূড়ান্ত স্কোর: ১৭/১ — ১.০ ওভার"
            : "Final Score: 17/1 — 1.0 Over"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   CHAPTER 02 — MATCH FORMATS
   ========================================================= */

function MatchFormats({ lang }: { lang: Lang }) {
  const bn = lang === "bn";

  return (
    <div className="fcl-chapter-body">
      <SectionHeader chapter="formats" lang={lang} />

      <div className="fcl-subsection-heading">
        <span>SECTION A</span>

        <h3>
          {bn ? "অফিশিয়াল ম্যাচ ফরম্যাট" : "Official Match Formats"}
        </h3>

        <p>
          {bn
            ? "FCL-এর অফিশিয়াল প্রতিযোগিতায় ব্যবহৃত ওভার ও উইকেটের নির্ধারিত কাঠামো।"
            : "The prescribed over and wicket structures for official FCL competitions."}
        </p>
      </div>

      <div className="fcl-table-wrap">
        <table className="fcl-regulation-table">
          <thead>
            <tr>
              <th>{bn ? "ক্রমিক" : "NO."}</th>
              <th>{bn ? "ফরম্যাট" : "FORMAT"}</th>
              <th>{bn ? "ওভার" : "OVERS"}</th>
              <th>{bn ? "উইকেট" : "WICKETS"}</th>
            </tr>
          </thead>

          <tbody>
            {OFFICIAL_FORMATS.map((format, index) => (
              <tr key={format.name}>
                <td className="fcl-table-index">
                  {String(index + 1).padStart(2, "0")}
                </td>

                <td>
                  <strong>{format.name}</strong>

                  {format.name === "ODI Dhamaka" && (
                    <span className="fcl-table-badge">EXTENDED</span>
                  )}
                </td>

                <td>{format.overs}</td>

                <td>{format.wickets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fcl-subsection-heading">
        <span>SECTION B</span>

        <h3>
          {bn ? "আনঅফিশিয়াল ম্যাচ ফরম্যাট" : "Unofficial Match Formats"}
        </h3>

        <p>
          {bn
            ? "ফ্রেন্ডলি ও অন্যান্য অনানুষ্ঠানিক ম্যাচের জন্য প্রচলিত ফরম্যাট।"
            : "Formats commonly used for friendly and other unofficial matches."}
        </p>
      </div>

      <div className="fcl-table-wrap">
        <table className="fcl-regulation-table">
          <thead>
            <tr>
              <th>{bn ? "ক্রমিক" : "NO."}</th>
              <th>{bn ? "ফরম্যাট" : "FORMAT"}</th>
              <th>{bn ? "ওভার" : "OVERS"}</th>
              <th>
                {bn ? "উইকেট" : "WICKETS"}
              </th>
            </tr>
          </thead>

          <tbody>
            {UNOFFICIAL_FORMATS.map((format, index) => (
              <tr key={format.name.en}>
                <td className="fcl-table-index">
                  {String(index + 1).padStart(2, "0")}
                </td>

                <td>
                  <strong>{format.name[lang]}</strong>
                </td>

                <td>{format.overs}</td>

                <td>
                  {format.wickets}

                  {index >= 2 && (
                    <span className="fcl-table-note">
                      {bn ? "প্রতি ইনিংস" : "per innings"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoBox
        title={bn ? "ফরম্যাট সংক্রান্ত নির্দেশনা" : "Format Guidelines"}
      >
        <p>
          {bn
            ? "অফিশিয়াল প্রতিযোগিতায় সংশ্লিষ্ট টুর্নামেন্টের ঘোষিত ফরম্যাট অনুসরণ করতে হবে। আনঅফিশিয়াল ম্যাচের ক্ষেত্রে নির্ধারিত নিয়ম অনুযায়ী ম্যাচ পরিচালিত হবে।"
            : "Official competitions must follow the format announced for the relevant tournament. Unofficial matches are conducted according to their designated regulations."}
        </p>
      </InfoBox>
    </div>
  );
}

/* =========================================================
   CHAPTER 03 — SINGLE MATCH
   ========================================================= */

function SingleMatch({ lang }: { lang: Lang }) {
  const bn = lang === "bn";

  return (
    <div className="fcl-chapter-body">
      <SectionHeader chapter="single" lang={lang} />

      <div className="fcl-format-summary">
        <div>
          <span>{bn ? "খেলোয়াড়" : "PLAYERS"}</span>
          <strong>02</strong>
        </div>

        <div>
          <span>{bn ? "আম্পায়ার" : "UMPIRE"}</span>
          <strong>01</strong>
        </div>

        <div>
          <span>{bn ? "ওভার" : "OVERS"}</span>
          <strong>02</strong>
        </div>

        <div>
          <span>{bn ? "উইকেট" : "WICKETS"}</span>
          <strong>03</strong>
        </div>
      </div>

      <RuleCollection rules={SINGLE_RULES} chapter="03" lang={lang} />

      <div className="fcl-subsection-heading">
        <span>MATCH EXAMPLE</span>

        <h3>{bn ? "এক ওভারের নমুনা" : "One-Over Example"}</h3>

        <p>
          {bn
            ? "ধরা যাক, X ব্যাটিং করছেন, Y বোলিং করছেন এবং Z আম্পায়ার।"
            : "Assume X is batting, Y is bowling and Z is the umpire."}
        </p>
      </div>

      <ScoreExample
        lang={lang}
        bat={[6, 4, 3, 2, 1, 6]}
        bowl={[6, 2, 4, 2, 3, 4]}
      />

      <div className="fcl-explanation">
        <strong>
          {bn ? "ফলাফল বিশ্লেষণ" : "Result Analysis"}
        </strong>

        <p>
          {bn
            ? "প্রথম ও চতুর্থ বলে সংখ্যা মিলে যাওয়ায় দুটি উইকেট পড়েছে। অন্য চার বলে রান হয়েছে ৪ + ৩ + ১ + ৬ = ১৪।"
            : "The first and fourth deliveries produce matching numbers and two wickets. The other four balls yield 4 + 3 + 1 + 6 = 14 runs."}
        </p>

        <span>
          {bn
            ? "চূড়ান্ত স্কোর: ১৪/২ — ১.০ ওভার"
            : "Final Score: 14/2 — 1.0 Over"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   CHAPTER 04 — TEAM MATCH
   ========================================================= */

function TeamMatch({ lang }: { lang: Lang }) {
  const bn = lang === "bn";

  const batting = [
    ["B", bn ? "ওপেনিং ব্যাটার" : "Opening Batter"],
    ["A", bn ? "ফার্স্ট ডাউন" : "First Down"],
    ["C", bn ? "সেকেন্ড ডাউন" : "Second Down"],
    ["D", bn ? "থার্ড ডাউন" : "Third Down"],
  ];

  const bowling = [
    ["W", bn ? "প্রথম ওভার" : "First Over"],
    ["X", bn ? "দ্বিতীয় ওভার" : "Second Over"],
    ["Y", bn ? "তৃতীয় ওভার" : "Third Over"],
    ["Z", bn ? "চতুর্থ ওভার" : "Fourth Over"],
  ];

  return (
    <div className="fcl-chapter-body">
      <SectionHeader chapter="team" lang={lang} />

      <InfoBox
        title={bn ? "ম্যাচের উদাহরণ" : "Match Scenario"}
      >
        <p>
          {bn
            ? "TEAM P বনাম TEAM Q। TEAM P-এর অধিনায়ক A, TEAM Q-এর অধিনায়ক W এবং ম্যাচের আম্পায়ার U।"
            : "TEAM P versus TEAM Q. A captains TEAM P, W captains TEAM Q, and U serves as the match umpire."}
        </p>
      </InfoBox>

      <div className="fcl-subsection-heading">
        <span>TEAM ORGANISATION</span>

        <h3>
          {bn ? "দলের লাইনআপের উদাহরণ" : "Example Team Lineups"}
        </h3>
      </div>

      <div className="fcl-lineup-grid">
        <div className="fcl-lineup-panel">
          <div className="fcl-lineup-heading">
            <div>
              <span>TEAM P</span>

              <h4>
                {bn ? "ব্যাটিং লাইনআপ" : "Batting Lineup"}
              </h4>
            </div>

            <span className="fcl-lineup-captain">CAPTAIN A</span>
          </div>

          {batting.map(([player, role], index) => (
            <div key={player} className="fcl-lineup-row">
              <span>{String(index + 1).padStart(2, "0")}</span>

              <strong>{player}</strong>

              <p>{role}</p>
            </div>
          ))}
        </div>

        <div className="fcl-lineup-panel">
          <div className="fcl-lineup-heading">
            <div>
              <span>TEAM Q</span>

              <h4>
                {bn ? "বোলিং লাইনআপ" : "Bowling Lineup"}
              </h4>
            </div>

            <span className="fcl-lineup-captain">CAPTAIN W</span>
          </div>

          {bowling.map(([player, role], index) => (
            <div key={player} className="fcl-lineup-row">
              <span>{String(index + 1).padStart(2, "0")}</span>

              <strong>{player}</strong>

              <p>{role}</p>
            </div>
          ))}
        </div>
      </div>

      <InfoBox
        title={bn ? "লাইনআপ পরিবর্তনের উদাহরণ" : "Lineup Transition Example"}
      >
        <p>
          {bn
            ? "ওপেনিং ব্যাটার B দ্বিতীয় বলে আউট হলে পরবর্তী ব্যাটার A অবশিষ্ট চার বলের জন্য নতুন সংখ্যা জমা দেবেন। উদাহরণ: ৪, ২, ৩, ৬।"
            : "If opening batter B is dismissed on the second delivery, incoming batter A submits four new numbers for the remaining deliveries, for example: 4, 2, 3, 6."}
        </p>
      </InfoBox>

      <div className="fcl-subsection-heading">
        <span>OFFICIAL PROCEDURES</span>

        <h3>
          {bn ? "দলগত ম্যাচের বিধান" : "Team Match Regulations"}
        </h3>
      </div>

      <RuleCollection rules={TEAM_RULES} chapter="04" lang={lang} />
    </div>
  );
}

/* =========================================================
   CHAPTER 05 — POWER PLAY
   ========================================================= */

function PowerPlay({ lang }: { lang: Lang }) {
  const [mode, setMode] = useState<"npp" | "spp">("npp");

  const bn = lang === "bn";

  return (
    <div className="fcl-chapter-body">
      <SectionHeader chapter="power" lang={lang} />

      <InfoBox
        title={bn ? "পাওয়ার প্লে সম্পর্কে" : "About Power Plays"}
      >
        <p>
          {bn
            ? "FCL-এর দলগত ম্যাচে বিশেষ পরিস্থিতিতে পাওয়ার প্লে ব্যবহার করা হয়। এর দুটি ধরন রয়েছে—Normal Power Play (NPP) এবং Super Power Play (SPP)।"
            : "FCL team matches may include special power-play provisions. There are two categories: Normal Power Play (NPP) and Super Power Play (SPP)."}
        </p>
      </InfoBox>

      <div className="fcl-subsection-heading">
        <span>SELECT REGULATION</span>

        <h3>
          {bn ? "পাওয়ার প্লের ধরন" : "Power Play Categories"}
        </h3>
      </div>

      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          { value: "npp", label: "Normal Power Play" },
          { value: "spp", label: "Super Power Play" },
        ]}
      />

      {mode === "npp" ? (
        <div className="fcl-mode-content">
          <div className="fcl-subsection-heading">
            <span>NPP — NORMAL POWER PLAY</span>

            <h3>
              {bn ? "নরমাল পাওয়ার প্লে" : "Normal Power Play"}
            </h3>
          </div>

          <div className="fcl-provision-grid">
            <div className="fcl-provision">
              <span className="fcl-provision-number">01</span>

              <h4>Batting Power Play</h4>

              <p>
                {bn
                  ? "ব্যাটার যতবার ইচ্ছা ৪ অথবা ৬ ব্যবহার করতে পারবেন। তবে বোলার পুরো ওভারে সর্বোচ্চ তিনবার ৪ অথবা ৬ ব্যবহার করতে পারবেন।"
                  : "The batter may use 4 or 6 without restriction. The bowler may use 4 or 6 no more than three times during the over."}
              </p>
            </div>

            <div className="fcl-provision">
              <span className="fcl-provision-number">02</span>

              <h4>Bowling Power Play</h4>

              <p>
                {bn
                  ? "বোলার যতবার ইচ্ছা ৪ অথবা ৬ ব্যবহার করতে পারবেন। তবে ব্যাটার পুরো ওভারে সর্বোচ্চ তিনবার ৪ অথবা ৬ ব্যবহার করতে পারবেন।"
                  : "The bowler may use 4 or 6 without restriction. The batter may use 4 or 6 no more than three times during the over."}
              </p>
            </div>
          </div>

          <InfoBox
            title={bn ? "প্রযোজ্যতা" : "Application"}
          >
            <p>
              {bn
                ? "Normal Power Play FCL-এর অফিশিয়াল গ্রুপ ম্যাচে ব্যবহার করা হয়।"
                : "Normal Power Play is used in official FCL group matches."}
            </p>
          </InfoBox>
        </div>
      ) : (
        <div className="fcl-mode-content">
          <div className="fcl-subsection-heading">
            <span>SPP — SUPER POWER PLAY</span>

            <h3>
              {bn ? "সুপার পাওয়ার প্লে" : "Super Power Play"}
            </h3>
          </div>

          <div className="fcl-provision-grid">
            <div className="fcl-provision">
              <span className="fcl-provision-number">01</span>

              <h4>Batting Super Power Play</h4>

              <div className="fcl-formula">
                <strong>Runs × 2</strong>

                <span>20 → 40</span>
              </div>

              <p>
                {bn
                  ? "ব্যাটিং সুপার পাওয়ার প্লেতে ওভারে করা মোট রান দ্বিগুণ হিসেবে গণনা করা হবে।"
                  : "During a batting Super Power Play, all runs scored in the over are doubled."}
              </p>
            </div>

            <div className="fcl-provision">
              <span className="fcl-provision-number">02</span>

              <h4>Bowling Super Power Play</h4>

              <div className="fcl-formula">
                <strong>Runs ÷ 2</strong>

                <span>15 → 8</span>
              </div>

              <p>
                {bn
                  ? "বোলিং সুপার পাওয়ার প্লেতে রান অর্ধেক গণনা করা হবে। ভাগফলে দশমিক থাকলে পরবর্তী পূর্ণ সংখ্যায় উন্নীত করা হবে।"
                  : "During a bowling Super Power Play, runs are halved. Fractional results are rounded up to the next whole number."}
              </p>
            </div>
          </div>

          <InfoBox
            tone="amber"
            title={bn ? "বিশেষ বিধান" : "Special Provision"}
          >
            <p>
              {bn
                ? "Super Power Play শুধু পূর্বনির্ধারিত বিশেষ ফ্রেন্ডলি ম্যাচে প্রযোজ্য। অফিশিয়াল ম্যাচে এটি ব্যবহার করা হয় না। SPP-তে NPP-এর ৪ ও ৬ ব্যবহারের সীমাবদ্ধতা নেই।"
                : "Super Power Play applies only to specially arranged friendly matches and is not used in official competition. NPP restrictions on the use of 4 and 6 do not apply."}
            </p>
          </InfoBox>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CHAPTER 06 — TEST CRICKET
   ========================================================= */

function TestMatch({ lang }: { lang: Lang }) {
  const [zeroRule, setZeroRule] = useState<1 | 2>(1);

  const bn = lang === "bn";

  return (
    <div className="fcl-chapter-body">
      <SectionHeader chapter="test" lang={lang} />

      <div className="fcl-subsection-heading">
        <span>SECTION A — OFFICIAL TEST</span>

        <h3>
          {bn ? "অফিশিয়াল টেস্ট ক্রিকেট" : "Official Test Cricket"}
        </h3>
      </div>

      <div className="fcl-format-summary">
        <div>
          <span>{bn ? "দিন" : "DAYS"}</span>
          <strong>03</strong>
        </div>

        <div>
          <span>{bn ? "ওভার / দিন" : "OVERS / DAY"}</span>
          <strong>15</strong>
        </div>

        <div>
          <span>{bn ? "ইনিংস / দল" : "INNINGS / TEAM"}</span>
          <strong>02</strong>
        </div>

        <div>
          <span>{bn ? "ফলো-অন লিড" : "FOLLOW-ON LEAD"}</span>
          <strong>30+</strong>
        </div>
      </div>

      <RuleCollection rules={TEST_RULES} chapter="06" lang={lang} />

      <div className="fcl-subsection-heading">
        <span>SECTION B — ZERO REGULATIONS</span>

        <h3>
          {bn ? "জিরো রুল (০)" : "Zero Rule (0)"}
        </h3>

        <p>
          {bn
            ? "অফিশিয়াল টেস্টে আম্পায়ার এবং আনঅফিশিয়াল টেস্টে খেলোয়াড়রা প্রযোজ্য জিরো রুল নির্ধারণ করবেন।"
            : "The umpire selects the applicable zero rule in official Tests, while players select it in unofficial Tests."}
        </p>
      </div>

      <SegmentedControl
        value={zeroRule}
        onChange={setZeroRule}
        options={[
          {
            value: 1,
            label: bn ? "জিরো রুল ১" : "Zero Rule 1",
          },
          {
            value: 2,
            label: bn ? "জিরো রুল ২" : "Zero Rule 2",
          },
        ]}
      />

      <div className="fcl-mode-content">
        {zeroRule === 1 ? (
          <>
            <div className="fcl-provision">
              <span className="fcl-provision-number">ZERO RULE 01</span>

              <h4>
                {bn
                  ? "দ্বিতীয় জিরো ম্যাচে আউট"
                  : "Dismissal on the Second Zero Match"}
              </h4>

              <p>
                {bn
                  ? "একই ওভারে ব্যাটার ও বোলারের ০–০ সংখ্যা দ্বিতীয়বার মিলে গেলে ব্যাটার আউট হবেন। প্রথম ০–০ ম্যাচে আউট হবে না।"
                  : "A batter is dismissed when 0–0 matches for the second time in the same over. The first matching zero does not result in a dismissal."}
              </p>
            </div>

            <div className="fcl-zero-example">
              <div className="fcl-zero-row">
                <span>BAT</span>

                {[0, 1, 1, 1, 0, 0].map((value, index) => (
                  <strong
                    key={`bat-${index}`}
                    className={
                      index === 0 || index === 5 ? "highlight" : ""
                    }
                  >
                    {value}
                  </strong>
                ))}
              </div>

              <div className="fcl-zero-row">
                <span>BOWL</span>

                {[0, 6, 3, 3, 4, 0].map((value, index) => (
                  <strong
                    key={`bowl-${index}`}
                    className={
                      index === 0 || index === 5 ? "highlight" : ""
                    }
                  >
                    {value}
                  </strong>
                ))}
              </div>
            </div>

            <InfoBox
              title={bn ? "উদাহরণের ফলাফল" : "Example Result"}
            >
              <p>
                {bn
                  ? "প্রথম বলে প্রথমবার ০–০ মিলেছে। ষষ্ঠ বলে আবার ০–০ মেলায় এটি দ্বিতীয় জিরো ম্যাচ এবং ব্যাটার আউট।"
                  : "The first delivery produces the first 0–0 match. The sixth delivery produces the second matching zero, resulting in a dismissal."}
              </p>
            </InfoBox>
          </>
        ) : (
          <div className="fcl-provision">
            <span className="fcl-provision-number">ZERO RULE 02</span>

            <h4>
              {bn
                ? "জিরো ব্যবহারের সীমা"
                : "Restriction on Zero Usage"}
            </h4>

            <p>
              {bn
                ? "একজন ব্যাটার একটি ওভারে সর্বোচ্চ তিনবার ০ ব্যবহার করতে পারবেন। এই নিয়মে ব্যাটার ও বোলারের ০–০ মিলে গেলেও ব্যাটার আউট হবেন না।"
                : "A batter may use zero no more than three times in an over. Under this rule, a matching 0–0 does not result in dismissal."}
            </p>
          </div>
        )}
      </div>

      <div className="fcl-subsection-heading">
        <span>SECTION C — UNOFFICIAL TEST</span>

        <h3>
          {bn ? "আনঅফিশিয়াল টেস্ট" : "Unofficial Test Cricket"}
        </h3>
      </div>

      <div className="fcl-provision-grid">
        <div className="fcl-provision">
          <span className="fcl-provision-number">
            {bn ? "সিঙ্গেল টেস্ট" : "SINGLE TEST"}
          </span>

          <h4>8 Overs / 3 Wickets</h4>

          <ul className="fcl-formal-list">
            <li>
              {bn
                ? "প্রতি ইনিংসে ৩ উইকেট"
                : "Three wickets per innings"}
            </li>

            <li>
              {bn
                ? "জিরো রুল ১ অথবা ২ প্রযোজ্য"
                : "Zero Rule 1 or 2 applies"}
            </li>

            <li>
              {bn
                ? "৩০ বা বেশি রানের লিডে ফলো-অন"
                : "Follow-on at a lead of 30 or more"}
            </li>

            <li>
              {bn
                ? "নির্ধারিত ওভারে ফল না হলে ড্র"
                : "Draw if unfinished within the scheduled overs"}
            </li>
          </ul>
        </div>

        <div className="fcl-provision">
          <span className="fcl-provision-number">
            {bn ? "দলগত টেস্ট" : "TEAM TEST"}
          </span>

          <h4>12 Overs / 3 Wickets</h4>

          <ul className="fcl-formal-list">
            <li>
              {bn
                ? "২–৩ জন খেলোয়াড় নিয়ে দল"
                : "Teams of two to three players"}
            </li>

            <li>
              {bn
                ? "প্রতি ইনিংসে ৩ উইকেট"
                : "Three wickets per innings"}
            </li>

            <li>
              {bn
                ? "জিরো রুল ১ অথবা ২ প্রযোজ্য"
                : "Zero Rule 1 or 2 applies"}
            </li>

            <li>
              {bn
                ? "৩০ বা বেশি রানের লিডে ফলো-অন"
                : "Follow-on at a lead of 30 or more"}
            </li>

            <li>
              {bn
                ? "নির্ধারিত ওভারে ফল না হলে ড্র"
                : "Draw if unfinished within the scheduled overs"}
            </li>
          </ul>
        </div>
      </div>

      <div className="fcl-subsection-heading">
        <span>SECTION D — GENERAL PROVISIONS</span>

        <h3>
          {bn ? "টেস্টের সাধারণ বিধান" : "General Test Regulations"}
        </h3>
      </div>

      <RuleCollection
        rules={COMMON_TEST_RULES}
        chapter="06A"
        lang={lang}
      />
    </div>
  );
}

/* =========================================================
   CHAPTER 07 — CHALLENGE MATCH
   ========================================================= */

function ChallengeMatch({ lang }: { lang: Lang }) {
  const bn = lang === "bn";

  return (
    <div className="fcl-chapter-body">
      <SectionHeader chapter="challenge" lang={lang} />

      <InfoBox
        title={
          bn
            ? "FCL চ্যালেঞ্জ ম্যাচ কী?"
            : "What Is an FCL Challenge Match?"
        }
      >
        <p>
          {bn
            ? "চ্যালেঞ্জ ম্যাচ হলো FCL-এর অভ্যন্তরীণ ডলার সিস্টেমের মাধ্যমে পরিচালিত একটি বিশেষ ম্যাচ। দুই পক্ষ নির্দিষ্ট পরিমাণ FCL Dollar নিয়ে প্রতিযোগিতা করে এবং ফলাফলের ভিত্তিতে সেই পরিমাণ ডলার এক পক্ষ থেকে অন্য পক্ষের অ্যাকাউন্টে স্থানান্তরিত হয়।"
            : "A Challenge Match is a special competition using FCL's internal Dollar system. Both sides agree on a designated FCL Dollar stake, which is transferred between their accounts according to the match result."}
        </p>
      </InfoBox>

      <div className="fcl-subsection-heading">
        <span>TRANSACTION EXAMPLE</span>

        <h3>
          {bn ? "ডলার স্থানান্তরের উদাহরণ" : "Dollar Transfer Example"}
        </h3>

        <p>
          {bn
            ? "ধরা যাক, Player X এবং Player Y-এর মধ্যে FCL $5,000-এর একটি চ্যালেঞ্জ ম্যাচ অনুষ্ঠিত হয়েছে।"
            : "Assume Player X and Player Y compete in a challenge match with an FCL $5,000 stake."}
        </p>
      </div>

      <div className="fcl-transaction">
        <div className="fcl-transaction-heading">
          <span>FCL CHALLENGE SETTLEMENT</span>

          <strong>STAKE: FCL $5,000</strong>
        </div>

        <div className="fcl-transaction-grid">
          <div className="fcl-transaction-player">
            <span>PLAYER X</span>

            <strong className="fcl-loss">−$5,000</strong>

            <p>{bn ? "ম্যাচে পরাজিত" : "Match Lost"}</p>
          </div>

          <div className="fcl-transaction-divider">VS</div>

          <div className="fcl-transaction-player">
            <span>PLAYER Y</span>

            <strong className="fcl-win">+$5,000</strong>

            <p>{bn ? "ম্যাচে বিজয়ী" : "Match Won"}</p>
          </div>
        </div>

        <div className="fcl-transaction-footer">
          {bn
            ? "Player X-এর অ্যাকাউন্ট থেকে FCL $5,000 বিয়োগ হবে এবং Player Y-এর অ্যাকাউন্টে FCL $5,000 যোগ হবে।"
            : "FCL $5,000 is deducted from Player X's account and credited to Player Y's account."}
        </div>
      </div>

      <div className="fcl-subsection-heading">
        <span>OFFICIAL PROCEDURES</span>

        <h3>
          {bn ? "চ্যালেঞ্জ ম্যাচের বিধান" : "Challenge Match Regulations"}
        </h3>
      </div>

      <RuleCollection
        rules={CHALLENGE_RULES}
        chapter="07"
        lang={lang}
      />

      <InfoBox
        tone="amber"
        title={
          bn
            ? "FCL Dollar সম্পর্কে গুরুত্বপূর্ণ তথ্য"
            : "Important Information About FCL Dollars"
        }
      >
        <p>
          {bn
            ? "এখানে বর্ণিত FCL Dollar হলো Facebook Cricket League-এর অভ্যন্তরীণ ভার্চুয়াল হিসাবের একক। এই উদাহরণ বাস্তব অর্থের লেনদেন নির্দেশ করে না।"
            : "FCL Dollars are internal virtual accounting units used within Facebook Cricket League. This example does not represent a real-money transaction."}
        </p>
      </InfoBox>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function RulesPage() {
  const isDark = useIsDark();

  const [lang, setLang] = useState<Lang>("bn");
  const [activeTab, setActiveTab] = useState<TabId>("basic");

  const activeIndex = CHAPTERS.findIndex(
    (chapter) => chapter.id === activeTab
  );

  const activeChapter = CHAPTERS[activeIndex];

  const bn = lang === "bn";

  const changeTab = useCallback((id: TabId) => {
    setActiveTab(id);

    requestAnimationFrame(() => {
      const element = document.getElementById("fcl-rule-content");

      if (!element) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      element.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }, []);

  const themeStyle = {
    colorScheme: isDark ? "dark" : "light",

    "--fcl-bg": isDark ? "#020617" : "#ffffff",
    "--fcl-bg-secondary": isDark ? "#071020" : "#f8fafc",
    "--fcl-surface": isDark ? "#0b1220" : "#ffffff",
    "--fcl-surface-raised": isDark ? "#0f172a" : "#f1f5f9",

    "--fcl-heading": isDark ? "#f8fafc" : "#0f172a",
    "--fcl-text": isDark ? "#cbd5e1" : "#334155",
    "--fcl-muted": isDark ? "#94a3b8" : "#64748b",
    "--fcl-subtle": isDark ? "#64748b" : "#94a3b8",

    "--fcl-border": isDark ? "#1e293b" : "#e2e8f0",
    "--fcl-border-soft": isDark ? "#172033" : "#edf2f7",

    "--fcl-blue": "#1877F2",
    "--fcl-blue-soft": isDark
      ? "rgba(24,119,242,.11)"
      : "rgba(24,119,242,.07)",

    "--fcl-amber": "#f59e0b",
    "--fcl-green": "#22c55e",

    "--fcl-hero": isDark ? "#050c1a" : "#f8fbff",
    "--fcl-info": isDark ? "#09182c" : "#eff6ff",
    "--fcl-info-border": isDark ? "#17345a" : "#bfdbfe",

    "--fcl-shadow": isDark
      ? "0 20px 70px rgba(0,0,0,.16)"
      : "0 20px 70px rgba(15,23,42,.045)",
  } as CSSProperties;

  const renderChapter = () => {
    switch (activeTab) {
      case "basic":
        return <BasicRules lang={lang} />;

      case "formats":
        return <MatchFormats lang={lang} />;

      case "single":
        return <SingleMatch lang={lang} />;

      case "team":
        return <TeamMatch lang={lang} />;

      case "power":
        return <PowerPlay lang={lang} />;

      case "test":
        return <TestMatch lang={lang} />;

      case "challenge":
        return <ChallengeMatch lang={lang} />;

      default:
        return null;
    }
  };

  return (
    <div
      className={`fcl-rulebook ${isDark ? "fcl-dark" : "fcl-light"}`}
      style={themeStyle}
    >
      {/* ===================================================
          HERO
          =================================================== */}

      <header className="fcl-hero">
        <div className="fcl-hero-glow" />

        <div className="fcl-container fcl-hero-inner">
          <div className="fcl-hero-top">
            <div className="fcl-brand">
              <div className="fcl-brand-mark">FCL</div>

              <div className="fcl-brand-copy">
                <strong>FACEBOOK CRICKET LEAGUE</strong>

                <span>ESTABLISHED 27 FEBRUARY 2013</span>
              </div>
            </div>

            <div
              className="fcl-language-switch"
              role="group"
              aria-label="Select language"
            >
              <button
                type="button"
                onClick={() => setLang("bn")}
                className={lang === "bn" ? "active" : ""}
                aria-pressed={lang === "bn"}
              >
                বাংলা
              </button>

              <button
                type="button"
                onClick={() => setLang("en")}
                className={lang === "en" ? "active" : ""}
                aria-pressed={lang === "en"}
              >
                English
              </button>
            </div>
          </div>

          <div className="fcl-hero-content">
            <div className="fcl-hero-eyebrow">
              <span className="fcl-live-dot" />

              {bn
                ? "FCL অফিসিয়াল রুলবুক"
                : "FCL OFFICIAL RULEBOOK"}
            </div>

            <h1>
              {bn ? (
                <>
                  ক্রিকেটের নিয়ম,
                  <br />
                  <span>একটি পূর্ণাঙ্গ নির্দেশিকা।</span>
                </>
              ) : (
                <>
                  Official Playing
                  <br />
                  <span>Regulations.</span>
                </>
              )}
            </h1>

            <p className="fcl-hero-description">
              {bn
                ? "Facebook Cricket League-এর সকল ম্যাচ ফরম্যাট, খেলার পদ্ধতি, স্কোরিং সিস্টেম এবং প্রতিযোগিতামূলক নিয়মাবলির পূর্ণাঙ্গ নির্দেশিকা।"
                : "The comprehensive guide to match formats, playing procedures, scoring systems and competitive regulations of Facebook Cricket League."}
            </p>

            <div className="fcl-hero-meta">
              <div>
                <span>{bn ? "প্রতিষ্ঠিত" : "ESTABLISHED"}</span>

                <strong>27 FEB 2013</strong>
              </div>

              <span className="fcl-hero-meta-divider" />

              <div>
                <span>{bn ? "মোট অধ্যায়" : "TOTAL CHAPTERS"}</span>

                <strong>07</strong>
              </div>

              <span className="fcl-hero-meta-divider" />

              <div>
                <span>{bn ? "প্রকাশক" : "ISSUED BY"}</span>

                <strong>FCC</strong>
              </div>
            </div>
          </div>

          <div className="fcl-hero-bottom">
            <span>FCL / OFFICIAL DOCUMENTATION</span>

            <span>
              {bn ? "বাংলা ও ইংরেজি সংস্করণ" : "BENGALI & ENGLISH EDITION"}
            </span>
          </div>
        </div>
      </header>

      {/* ===================================================
          RULEBOOK LAYOUT
          =================================================== */}

      <div className="fcl-document-area">
        <div className="fcl-container">
          <div className="fcl-document-heading">
            <div>
              <SectionLabel>
                {bn ? "অফিশিয়াল ডকুমেন্টেশন" : "OFFICIAL DOCUMENTATION"}
              </SectionLabel>

              <h2>
                {bn ? "খেলার নিয়মাবলি" : "Playing Regulations"}
              </h2>
            </div>

            <p>
              {bn
                ? "সাতটি অধ্যায়ে সাজানো FCL-এর পূর্ণাঙ্গ নিয়মপুস্তক।"
                : "The complete FCL rulebook, organised into seven chapters."}
            </p>
          </div>

          {/* MOBILE NAVIGATION */}

          <div className="fcl-mobile-navigation">
            <div className="fcl-mobile-navigation-heading">
              <span>
                {bn ? "অধ্যায় নির্বাচন করুন" : "SELECT A CHAPTER"}
              </span>

              <strong>{activeChapter.number} / 07</strong>
            </div>

            <div className="fcl-mobile-chapters">
              {CHAPTERS.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => changeTab(chapter.id)}
                  className={
                    activeTab === chapter.id ? "active" : ""
                  }
                  aria-current={
                    activeTab === chapter.id ? "page" : undefined
                  }
                >
                  <span>{chapter.number}</span>

                  {chapter.short[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="fcl-document-layout">
            {/* DESKTOP SIDEBAR */}

            <aside className="fcl-sidebar">
              <div className="fcl-sidebar-inner">
                <div className="fcl-sidebar-heading">
                  <span>
                    {bn ? "সূচিপত্র" : "TABLE OF CONTENTS"}
                  </span>

                  <strong>07</strong>
                </div>

                <nav aria-label="Rulebook chapters">
                  {CHAPTERS.map((chapter) => (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => changeTab(chapter.id)}
                      className={`fcl-sidebar-link ${
                        activeTab === chapter.id ? "active" : ""
                      }`}
                      aria-current={
                        activeTab === chapter.id ? "page" : undefined
                      }
                    >
                      <span className="fcl-sidebar-number">
                        {chapter.number}
                      </span>

                      <span className="fcl-sidebar-title">
                        {chapter.title[lang]}
                      </span>

                      <span className="fcl-sidebar-arrow">›</span>
                    </button>
                  ))}
                </nav>

                <div className="fcl-sidebar-note">
                  <span>FCC</span>

                  <p>
                    {bn
                      ? "Facebook Cricket Council কর্তৃক প্রকাশিত খেলার নিয়মাবলি।"
                      : "Playing regulations published by the Facebook Cricket Council."}
                  </p>
                </div>
              </div>
            </aside>

            {/* MAIN DOCUMENT */}

            <main
              id="fcl-rule-content"
              className="fcl-document-content"
            >
              <div className="fcl-document-topline">
                <div>
                  <span>FCL RULEBOOK</span>

                  <span className="fcl-document-topline-divider">/</span>

                  <strong>
                    {bn ? "অধ্যায়" : "CHAPTER"} {activeChapter.number}
                  </strong>
                </div>

                <span>FCC</span>
              </div>

              <div
                key={`${activeTab}-${lang}`}
                className="fcl-document-page"
              >
                {renderChapter()}
              </div>

              {/* CHAPTER NAVIGATION */}

              <div className="fcl-chapter-navigation">
                <div className="fcl-chapter-progress">
                  <span>
                    {bn ? "অধ্যায়ের অগ্রগতি" : "CHAPTER PROGRESS"}
                  </span>

                  <strong>{activeIndex + 1} / 7</strong>
                </div>

                <div className="fcl-progress-track">
                  <div
                    style={{
                      width: `${((activeIndex + 1) / 7) * 100}%`,
                    }}
                  />
                </div>

                <div className="fcl-chapter-navigation-buttons">
                  {activeIndex > 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        changeTab(CHAPTERS[activeIndex - 1].id)
                      }
                      className="fcl-navigation-button previous"
                    >
                      <span>←</span>

                      <div>
                        <small>
                          {bn ? "পূর্ববর্তী অধ্যায়" : "PREVIOUS CHAPTER"}
                        </small>

                        <strong>
                          {CHAPTERS[activeIndex - 1].short[lang]}
                        </strong>
                      </div>
                    </button>
                  ) : (
                    <span />
                  )}

                  {activeIndex < CHAPTERS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        changeTab(CHAPTERS[activeIndex + 1].id)
                      }
                      className="fcl-navigation-button next"
                    >
                      <div>
                        <small>
                          {bn ? "পরবর্তী অধ্যায়" : "NEXT CHAPTER"}
                        </small>

                        <strong>
                          {CHAPTERS[activeIndex + 1].short[lang]}
                        </strong>
                      </div>

                      <span>→</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => changeTab("basic")}
                      className="fcl-navigation-button next"
                    >
                      <div>
                        <small>
                          {bn ? "আবার শুরু করুন" : "BACK TO START"}
                        </small>

                        <strong>
                          {bn ? "প্রথম অধ্যায়" : "First Chapter"}
                        </strong>
                      </div>

                      <span>↗</span>
                    </button>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* ===================================================
          FINAL CTA
          =================================================== */}

      <section className="fcl-bottom-section">
        <div className="fcl-container">
          <div className="fcl-bottom-card">
            <div className="fcl-bottom-content">
              <SectionLabel>
                FACEBOOK CRICKET LEAGUE
              </SectionLabel>

              <h2>
                {bn
                  ? "নিয়ম জেনেছেন। এবার মাঠে নামুন।"
                  : "Know the Rules. Play the Game."}
              </h2>

              <p>
                {bn
                  ? "FCL-এর নিয়মগুলো বুঝে নিন, খেলোয়াড়দের র‍্যাঙ্কিং দেখুন এবং প্রতিযোগিতায় অংশ নিন।"
                  : "Understand the regulations, explore player rankings and take part in the competition."}
              </p>

              <div className="fcl-bottom-actions">
                <Link href="/play" className="fcl-primary-button">
                  {bn ? "খেলা শুরু করুন" : "Start Playing"}

                  <span>↗</span>
                </Link>

                <Link href="/rankings" className="fcl-secondary-button">
                  {bn ? "প্লেয়ার র‍্যাঙ্কিং" : "Player Rankings"}
                </Link>
              </div>
            </div>

            <div className="fcl-bottom-emblem" aria-hidden="true">
              <div className="fcl-bottom-emblem-inner">
                <span>FCL</span>

                <small>EST. 2013</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          FOOTER
          =================================================== */}

      <footer className="fcl-rulebook-footer">
        <div className="fcl-container">
          <div className="fcl-footer-top">
            <div>
              <strong>FACEBOOK CRICKET LEAGUE</strong>

              <p>
                {bn
                  ? "অফিশিয়াল খেলার নিয়মাবলি"
                  : "Official Playing Regulations"}
              </p>
            </div>

            <Link href="/">
              {bn ? "হোমপেজে ফিরুন" : "Back to Home"} ↗
            </Link>
          </div>

          <div className="fcl-footer-bottom">
            <span>
              © {new Date().getFullYear()} Facebook Cricket League
            </span>

            <span>
              {bn
                ? "প্রকাশক: Facebook Cricket Council"
                : "Issued by Facebook Cricket Council"}
            </span>
          </div>
        </div>
      </footer>

      {/* ===================================================
          STYLES
          =================================================== */}

      <style jsx global>{RULEBOOK_STYLES}</style>
    </div>
  );
}

/* =========================================================
   PREMIUM RULEBOOK DESIGN SYSTEM
   ========================================================= */

const RULEBOOK_STYLES = `

.fcl-rulebook {
  background: var(--fcl-bg);
  color: var(--fcl-text);
  min-height: 100vh;
  font-family: inherit;
  transition:
    background-color .25s ease,
    color .25s ease;
}

.fcl-rulebook *,
.fcl-rulebook *::before,
.fcl-rulebook *::after {
  box-sizing: border-box;
}

.fcl-rulebook button,
.fcl-rulebook a {
  -webkit-tap-highlight-color: transparent;
}

.fcl-rulebook button {
  cursor: pointer;
}

.fcl-rulebook button:focus-visible,
.fcl-rulebook a:focus-visible {
  outline: 3px solid var(--fcl-blue);
  outline-offset: 3px;
}

.fcl-rulebook ::selection {
  background: rgba(24,119,242,.25);
}

.fcl-container {
  width: min(100% - 40px, 1180px);
  margin-inline: auto;
}

/* =========================================================
   HERO
   ========================================================= */

.fcl-hero {
  position: relative;
  overflow: hidden;
  background: var(--fcl-hero);
  border-bottom: 1px solid var(--fcl-border);
}

.fcl-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: .45;
  pointer-events: none;
  background-image:
    linear-gradient(
      rgba(24,119,242,.055) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(24,119,242,.055) 1px,
      transparent 1px
    );
  background-size: 58px 58px;
  mask-image: linear-gradient(
    to right,
    transparent,
    black 35%,
    black 75%,
    transparent
  );
}

.fcl-hero-glow {
  position: absolute;
  width: 650px;
  height: 650px;
  right: -200px;
  top: -240px;
  border-radius: 50%;
  background: rgba(24,119,242,.14);
  filter: blur(115px);
  pointer-events: none;
}

.fcl-hero-inner {
  position: relative;
  z-index: 1;
}

.fcl-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-top: 36px;
}

.fcl-brand {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.fcl-brand-mark {
  width: 49px;
  height: 49px;
  flex-shrink: 0;
  border: 1px solid rgba(24,119,242,.35);
  border-radius: 13px;
  background: var(--fcl-blue-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 950;
  letter-spacing: -.06em;
  color: var(--fcl-blue);
}

.fcl-brand-copy {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fcl-brand-copy strong {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .12em;
  color: var(--fcl-heading);
}

.fcl-brand-copy span {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .13em;
  color: var(--fcl-muted);
}

.fcl-language-switch {
  flex-shrink: 0;
  display: flex;
  gap: 3px;
  padding: 4px;
  border-radius: 11px;
  border: 1px solid var(--fcl-border);
  background: var(--fcl-surface);
}

.fcl-language-switch button {
  border: 0;
  background: transparent;
  color: var(--fcl-muted);
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 12px;
  font-weight: 800;
  transition: all .2s ease;
}

.fcl-language-switch button.active {
  background: var(--fcl-blue);
  color: white;
  box-shadow: 0 4px 12px rgba(24,119,242,.2);
}

.fcl-hero-content {
  padding: 110px 0 105px;
  max-width: 850px;
}

.fcl-hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--fcl-blue);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .18em;
  text-transform: uppercase;
}

.fcl-live-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  background: var(--fcl-blue);
  border-radius: 50%;
  box-shadow: 0 0 0 5px rgba(24,119,242,.1);
}

.fcl-hero h1 {
  margin: 24px 0 0;
  color: var(--fcl-heading);
  font-size: clamp(38px, 5.4vw, 74px);
  line-height: 1.19;
  letter-spacing: -.055em;
  font-weight: 950;
}

.fcl-hero h1 span {
  background: linear-gradient(
    105deg,
    #1877F2 5%,
    #3b82f6 45%,
    #22d3ee 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.fcl-hero-description {
  margin: 27px 0 0;
  max-width: 650px;
  color: var(--fcl-muted);
  font-size: 15px;
  line-height: 2;
}

.fcl-hero-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 48px;
}

.fcl-hero-meta > div {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fcl-hero-meta > div > span {
  color: var(--fcl-subtle);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .09em;
}

.fcl-hero-meta strong {
  color: var(--fcl-heading);
  font-size: 15px;
  font-weight: 900;
}

.fcl-hero-meta-divider {
  width: 1px;
  height: 32px;
  background: var(--fcl-border);
}

.fcl-hero-bottom {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 0;
  border-top: 1px solid var(--fcl-border);
  color: var(--fcl-subtle);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .13em;
}

/* =========================================================
   DOCUMENT LAYOUT
   ========================================================= */

.fcl-document-area {
  background: var(--fcl-bg);
  padding: 80px 0 100px;
}

.fcl-document-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 30px;
  margin-bottom: 42px;
}

.fcl-section-label {
  color: var(--fcl-blue);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .18em;
  text-transform: uppercase;
}

.fcl-document-heading h2 {
  color: var(--fcl-heading);
  font-size: clamp(27px, 3vw, 37px);
  font-weight: 950;
  letter-spacing: -.04em;
  margin: 12px 0 0;
}

.fcl-document-heading > p {
  margin: 0;
  font-size: 13px;
  color: var(--fcl-muted);
  text-align: right;
  line-height: 1.8;
}

.fcl-document-layout {
  display: grid;
  grid-template-columns: 285px minmax(0, 1fr);
  align-items: start;
  gap: 30px;
}

/* =========================================================
   SIDEBAR
   ========================================================= */

.fcl-sidebar {
  position: sticky;
  top: 95px;
}

.fcl-sidebar-inner {
  overflow: hidden;
  background: var(--fcl-surface);
  border: 1px solid var(--fcl-border);
  border-radius: 17px;
}

.fcl-sidebar-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 23px 22px;
  border-bottom: 1px solid var(--fcl-border);
}

.fcl-sidebar-heading span {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .13em;
  color: var(--fcl-heading);
}

.fcl-sidebar-heading strong {
  font-size: 11px;
  color: var(--fcl-subtle);
}

.fcl-sidebar nav {
  padding: 12px;
}

.fcl-sidebar-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 13px;
  text-align: left;
  padding: 15px 13px;
  border: 0;
  border-radius: 10px;
  color: var(--fcl-muted);
  background: transparent;
  transition: all .2s ease;
}

.fcl-sidebar-link + .fcl-sidebar-link {
  margin-top: 3px;
}

.fcl-sidebar-link:hover {
  background: var(--fcl-bg-secondary);
  color: var(--fcl-heading);
}

.fcl-sidebar-link.active {
  background: var(--fcl-blue-soft);
  color: var(--fcl-blue);
}

.fcl-sidebar-number {
  font-size: 11px;
  font-weight: 900;
  opacity: .8;
}

.fcl-sidebar-title {
  font-size: 13px;
  font-weight: 750;
  flex: 1;
}

.fcl-sidebar-arrow {
  font-size: 19px;
  line-height: 1;
  opacity: 0;
  transition: opacity .2s ease;
}

.fcl-sidebar-link.active .fcl-sidebar-arrow,
.fcl-sidebar-link:hover .fcl-sidebar-arrow {
  opacity: 1;
}

.fcl-sidebar-note {
  padding: 24px 22px;
  background: var(--fcl-bg-secondary);
  border-top: 1px solid var(--fcl-border);
}

.fcl-sidebar-note > span {
  font-size: 13px;
  font-weight: 950;
  letter-spacing: .14em;
  color: var(--fcl-blue);
}

.fcl-sidebar-note p {
  margin: 10px 0 0;
  color: var(--fcl-muted);
  font-size: 12px;
  line-height: 1.85;
}

/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

.fcl-mobile-navigation {
  display: none;
  margin-bottom: 24px;
  border: 1px solid var(--fcl-border);
  background: var(--fcl-surface);
  border-radius: 15px;
  padding: 17px;
}

.fcl-mobile-navigation-heading {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 15px;
}

.fcl-mobile-navigation-heading span {
  color: var(--fcl-heading);
  font-size: 12px;
  font-weight: 850;
}

.fcl-mobile-navigation-heading strong {
  color: var(--fcl-blue);
  font-size: 11px;
}

.fcl-mobile-chapters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 8px;
}

.fcl-mobile-chapters button {
  display: flex;
  align-items: center;
  gap: 9px;
  text-align: left;
  min-width: 0;
  min-height: 43px;
  padding: 11px;
  border-radius: 9px;
  border: 1px solid var(--fcl-border);
  background: var(--fcl-bg-secondary);
  color: var(--fcl-muted);
  font-size: 11px;
  font-weight: 750;
  transition: all .2s ease;
}

.fcl-mobile-chapters button span {
  font-size: 10px;
  font-weight: 900;
  opacity: .7;
}

.fcl-mobile-chapters button.active {
  background: var(--fcl-blue);
  color: white;
  border-color: var(--fcl-blue);
}

/* =========================================================
   MAIN DOCUMENT
   ========================================================= */

.fcl-document-content {
  min-width: 0;
  scroll-margin-top: 95px;
  background: var(--fcl-surface);
  border: 1px solid var(--fcl-border);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--fcl-shadow);
}

.fcl-document-topline {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 19px 35px;
  border-bottom: 1px solid var(--fcl-border);
  background: var(--fcl-bg-secondary);
}

.fcl-document-topline > div {
  display: flex;
  gap: 12px;
  align-items: center;
}

.fcl-document-topline span,
.fcl-document-topline strong {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .12em;
}

.fcl-document-topline span {
  color: var(--fcl-subtle);
}

.fcl-document-topline strong {
  color: var(--fcl-blue);
}

.fcl-document-topline-divider {
  opacity: .5;
}

.fcl-document-page {
  padding: 43px 40px 55px;
  animation: fclPageEnter .3s ease both;
}

@keyframes fclPageEnter {
  from {
    opacity: 0;
    transform: translateY(7px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fcl-chapter-header {
  padding-bottom: 32px;
  border-bottom: 1px solid var(--fcl-border);
  margin-bottom: 35px;
}

.fcl-chapter-reference {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 19px;
}

.fcl-chapter-reference > span:first-child {
  color: var(--fcl-blue);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .13em;
  white-space: nowrap;
}

.fcl-reference-line {
  height: 1px;
  width: 38px;
  background: var(--fcl-blue);
  opacity: .5;
}

.fcl-chapter-header h2 {
  margin: 0;
  color: var(--fcl-heading);
  font-size: clamp(29px, 3vw, 39px);
  font-weight: 950;
  letter-spacing: -.045em;
  line-height: 1.35;
}

.fcl-chapter-header p {
  margin: 13px 0 0;
  color: var(--fcl-muted);
  font-size: 14px;
  line-height: 1.9;
}

/* =========================================================
   RULE COLLECTION
   ========================================================= */

.fcl-subsection-heading {
  margin: 40px 0 21px;
}

.fcl-subsection-heading > span {
  display: block;
  margin-bottom: 10px;
  color: var(--fcl-blue);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .15em;
}

.fcl-subsection-heading h3 {
  margin: 0;
  color: var(--fcl-heading);
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -.025em;
  line-height: 1.5;
}

.fcl-subsection-heading p {
  margin: 10px 0 0;
  color: var(--fcl-muted);
  font-size: 13px;
  line-height: 1.9;
}

.fcl-rule-collection {
  border-top: 1px solid var(--fcl-border);
}

.fcl-rule {
  display: grid;
  grid-template-columns: 64px minmax(0,1fr);
  gap: 14px;
  padding: 24px 0;
  border-bottom: 1px solid var(--fcl-border);
}

.fcl-rule-number {
  padding-top: 3px;
  color: var(--fcl-blue);
  font-size: 12px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.fcl-rule-content h3 {
  margin: 0 0 9px;
  color: var(--fcl-heading);
  font-size: 15px;
  font-weight: 850;
  line-height: 1.5;
}

.fcl-rule-content p {
  margin: 0;
  color: var(--fcl-text);
  font-size: 13px;
  line-height: 2.05;
}

/* =========================================================
   INFO BOX
   ========================================================= */

.fcl-info-box {
  margin: 27px 0;
  padding: 23px 25px;
  background: var(--fcl-info);
  border: 1px solid var(--fcl-info-border);
  border-radius: 12px;
}

.fcl-info-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fcl-info-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--fcl-blue);
  flex-shrink: 0;
}

.fcl-info-heading h4 {
  margin: 0;
  color: var(--fcl-heading);
  font-size: 13px;
  font-weight: 900;
}

.fcl-info-body {
  margin-top: 11px;
}

.fcl-info-body p {
  margin: 0;
  color: var(--fcl-text);
  font-size: 13px;
  line-height: 2;
}

.fcl-info-amber {
  background: rgba(245,158,11,.065);
  border-color: rgba(245,158,11,.24);
}

.fcl-info-amber .fcl-info-indicator {
  background: #f59e0b;
}

.fcl-info-green {
  background: rgba(34,197,94,.06);
  border-color: rgba(34,197,94,.2);
}

.fcl-info-green .fcl-info-indicator {
  background: #22c55e;
}

.fcl-info-red {
  background: rgba(239,68,68,.06);
  border-color: rgba(239,68,68,.2);
}

.fcl-info-red .fcl-info-indicator {
  background: #ef4444;
}

/* =========================================================
   SCORECARD
   ========================================================= */

.fcl-scorecard {
  border: 1px solid var(--fcl-border);
  border-radius: 13px;
  overflow: hidden;
  background: var(--fcl-bg-secondary);
}

.fcl-scorecard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 22px 23px;
  border-bottom: 1px solid var(--fcl-border);
}

.fcl-scorecard-header h4 {
  margin: 9px 0 0;
  color: var(--fcl-heading);
  font-size: 15px;
  font-weight: 900;
}

.fcl-scorecard-status {
  color: var(--fcl-subtle);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .1em;
}

.fcl-scorecard-scroll {
  overflow-x: auto;
  padding: 23px;
}

.fcl-scorecard-grid {
  display: grid;
  grid-template-columns: 65px repeat(6,minmax(51px,1fr));
  gap: 7px;
  min-width: 410px;
}

.fcl-score-label {
  display: flex;
  align-items: center;
  font-size: 10px;
  font-weight: 900;
  color: var(--fcl-muted);
}

.fcl-ball-heading {
  text-align: center;
  padding: 8px 0;
  font-size: 10px;
  font-weight: 900;
  color: var(--fcl-subtle);
}

.fcl-ball-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border: 1px solid var(--fcl-border);
  background: var(--fcl-surface);
  border-radius: 7px;
  font-size: 15px;
  font-weight: 850;
  color: var(--fcl-heading);
}

.fcl-ball-result {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 900;
}

.fcl-ball-result.is-run {
  background: var(--fcl-blue-soft);
  color: var(--fcl-blue);
}

.fcl-ball-result.is-out {
  color: #ef4444;
  background: rgba(239,68,68,.1);
}

.fcl-scorecard-footer {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  padding: 22px 25px;
  border-top: 1px solid var(--fcl-border);
  background: var(--fcl-surface);
}

.fcl-score-caption {
  display: block;
  margin-bottom: 7px;
  color: var(--fcl-subtle);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .12em;
}

.fcl-score-total {
  color: var(--fcl-heading);
  font-size: 39px;
  font-weight: 950;
  line-height: 1;
  letter-spacing: -.05em;
}

.fcl-score-total span {
  color: var(--fcl-muted);
}

.fcl-score-over {
  text-align: right;
}

.fcl-score-over strong {
  color: var(--fcl-heading);
  font-size: 19px;
  font-weight: 900;
}

.fcl-explanation {
  margin-top: 17px;
  padding: 21px 23px;
  border-left: 3px solid var(--fcl-blue);
  background: var(--fcl-bg-secondary);
}

.fcl-explanation strong {
  color: var(--fcl-heading);
  font-size: 13px;
}

.fcl-explanation p {
  margin: 9px 0;
  color: var(--fcl-text);
  font-size: 13px;
  line-height: 1.9;
}

.fcl-explanation > span {
  display: block;
  color: var(--fcl-blue);
  font-size: 13px;
  font-weight: 900;
}

/* =========================================================
   REGULATION TABLE
   ========================================================= */

.fcl-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--fcl-border);
  border-radius: 11px;
}

.fcl-regulation-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.fcl-regulation-table thead {
  background: var(--fcl-bg-secondary);
}

.fcl-regulation-table th {
  padding: 17px 18px;
  color: var(--fcl-muted);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .09em;
  white-space: nowrap;
}

.fcl-regulation-table td {
  padding: 18px;
  border-top: 1px solid var(--fcl-border);
  color: var(--fcl-text);
  font-size: 13px;
  font-weight: 700;
}

.fcl-regulation-table td strong {
  color: var(--fcl-heading);
  font-weight: 900;
}

.fcl-regulation-table tbody tr {
  transition: background .2s ease;
}

.fcl-regulation-table tbody tr:hover {
  background: var(--fcl-bg-secondary);
}

.fcl-table-index {
  color: var(--fcl-subtle) !important;
  font-size: 11px !important;
}

.fcl-table-badge {
  display: inline-block;
  margin-left: 10px;
  padding: 4px 7px;
  border-radius: 4px;
  color: #d97706;
  background: rgba(245,158,11,.1);
  font-size: 9px;
  font-weight: 900;
}

.fcl-table-note {
  display: block;
  margin-top: 4px;
  color: var(--fcl-subtle);
  font-size: 10px;
  font-weight: 500;
}

/* =========================================================
   FORMAT SUMMARY
   ========================================================= */

.fcl-format-summary {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
  border: 1px solid var(--fcl-border);
  border-radius: 12px;
  overflow: hidden;
  margin: 25px 0 35px;
}

.fcl-format-summary > div {
  padding: 22px 15px;
  text-align: center;
  background: var(--fcl-bg-secondary);
}

.fcl-format-summary > div + div {
  border-left: 1px solid var(--fcl-border);
}

.fcl-format-summary span {
  display: block;
  color: var(--fcl-muted);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: .07em;
}

.fcl-format-summary strong {
  display: block;
  margin-top: 10px;
  color: var(--fcl-heading);
  font-size: 25px;
  font-weight: 950;
}

/* =========================================================
   TEAM LINEUP
   ========================================================= */

.fcl-lineup-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 16px;
}

.fcl-lineup-panel {
  overflow: hidden;
  border: 1px solid var(--fcl-border);
  border-radius: 12px;
}

.fcl-lineup-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: var(--fcl-bg-secondary);
  border-bottom: 1px solid var(--fcl-border);
}

.fcl-lineup-heading > div > span {
  color: var(--fcl-blue);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .12em;
}

.fcl-lineup-heading h4 {
  margin: 7px 0 0;
  color: var(--fcl-heading);
  font-size: 14px;
  font-weight: 900;
}

.fcl-lineup-captain {
  color: var(--fcl-muted);
  font-size: 9px;
  font-weight: 900;
  white-space: nowrap;
}

.fcl-lineup-row {
  display: grid;
  grid-template-columns: 25px 30px minmax(0,1fr);
  gap: 9px;
  align-items: center;
  padding: 14px 19px;
}

.fcl-lineup-row + .fcl-lineup-row {
  border-top: 1px solid var(--fcl-border-soft);
}

.fcl-lineup-row > span {
  color: var(--fcl-subtle);
  font-size: 10px;
  font-weight: 900;
}

.fcl-lineup-row strong {
  color: var(--fcl-heading);
  font-size: 13px;
  font-weight: 900;
}

.fcl-lineup-row p {
  margin: 0;
  color: var(--fcl-muted);
  font-size: 12px;
}

/* =========================================================
   POWER PLAY / TEST SEGMENTS
   ========================================================= */

.fcl-segmented {
  display: inline-flex;
  max-width: 100%;
  gap: 4px;
  padding: 5px;
  background: var(--fcl-bg-secondary);
  border: 1px solid var(--fcl-border);
  border-radius: 11px;
}

.fcl-segmented button {
  padding: 11px 16px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--fcl-muted);
  font-size: 12px;
  font-weight: 800;
  transition: all .2s ease;
}

.fcl-segmented button.active {
  color: white;
  background: var(--fcl-blue);
  box-shadow: 0 4px 12px rgba(24,119,242,.17);
}

.fcl-mode-content {
  animation: fclPageEnter .25s ease both;
}

.fcl-provision-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 16px;
}

.fcl-provision {
  padding: 26px;
  border: 1px solid var(--fcl-border);
  border-radius: 12px;
  background: var(--fcl-bg-secondary);
}

.fcl-provision-number {
  display: block;
  margin-bottom: 20px;
  color: var(--fcl-blue);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .12em;
}

.fcl-provision h4 {
  margin: 0 0 13px;
  color: var(--fcl-heading);
  font-size: 16px;
  font-weight: 900;
  line-height: 1.5;
}

.fcl-provision p {
  margin: 0;
  color: var(--fcl-text);
  font-size: 13px;
  line-height: 2;
}

.fcl-formula {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  padding: 18px;
  background: var(--fcl-surface);
  border: 1px solid var(--fcl-border);
  border-radius: 9px;
}

.fcl-formula strong {
  color: var(--fcl-blue);
  font-size: 20px;
  font-weight: 950;
}

.fcl-formula span {
  color: var(--fcl-heading);
  font-size: 15px;
  font-weight: 900;
}

.fcl-formal-list {
  padding-left: 18px;
  margin: 19px 0 0;
}

.fcl-formal-list li {
  color: var(--fcl-text);
  font-size: 12px;
  line-height: 1.9;
}

.fcl-formal-list li + li {
  margin-top: 9px;
}

.fcl-zero-example {
  margin: 20px 0;
  padding: 21px;
  border: 1px solid var(--fcl-border);
  border-radius: 12px;
  overflow-x: auto;
}

.fcl-zero-row {
  display: grid;
  grid-template-columns: 55px repeat(6,minmax(36px,1fr));
  gap: 7px;
  min-width: 330px;
  align-items: center;
}

.fcl-zero-row + .fcl-zero-row {
  margin-top: 8px;
}

.fcl-zero-row > span {
  color: var(--fcl-muted);
  font-size: 11px;
  font-weight: 900;
}

.fcl-zero-row strong {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40px;
  background: var(--fcl-bg-secondary);
  border: 1px solid var(--fcl-border);
  border-radius: 6px;
  color: var(--fcl-heading);
  font-size: 13px;
}

.fcl-zero-row strong.highlight {
  color: #ef4444;
  border-color: rgba(239,68,68,.35);
  background: rgba(239,68,68,.07);
}

/* =========================================================
   CHALLENGE TRANSACTION
   ========================================================= */

.fcl-transaction {
  border: 1px solid var(--fcl-border);
  border-radius: 12px;
  overflow: hidden;
}

.fcl-transaction-heading {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 19px 22px;
  background: var(--fcl-bg-secondary);
  border-bottom: 1px solid var(--fcl-border);
}

.fcl-transaction-heading span,
.fcl-transaction-heading strong {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .07em;
}

.fcl-transaction-heading span {
  color: var(--fcl-muted);
}

.fcl-transaction-heading strong {
  color: var(--fcl-heading);
}

.fcl-transaction-grid {
  display: grid;
  grid-template-columns: minmax(0,1fr) 45px minmax(0,1fr);
  align-items: center;
  padding: 35px 15px;
}

.fcl-transaction-player {
  text-align: center;
  min-width: 0;
}

.fcl-transaction-player > span {
  display: block;
  color: var(--fcl-muted);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .1em;
}

.fcl-transaction-player > strong {
  display: block;
  margin: 15px 0 10px;
  font-size: clamp(22px,3vw,34px);
  font-weight: 950;
  letter-spacing: -.04em;
}

.fcl-loss {
  color: #ef4444;
}

.fcl-win {
  color: #16a34a;
}

.fcl-transaction-player p {
  margin: 0;
  color: var(--fcl-muted);
  font-size: 12px;
}

.fcl-transaction-divider {
  color: var(--fcl-subtle);
  font-size: 11px;
  font-weight: 900;
  text-align: center;
}

.fcl-transaction-footer {
  padding: 19px 22px;
  border-top: 1px solid var(--fcl-border);
  background: var(--fcl-bg-secondary);
  color: var(--fcl-muted);
  font-size: 12px;
  line-height: 1.9;
  text-align: center;
}

/* =========================================================
   CHAPTER NAVIGATION
   ========================================================= */

.fcl-chapter-navigation {
  padding: 27px 35px 32px;
  border-top: 1px solid var(--fcl-border);
  background: var(--fcl-bg-secondary);
}

.fcl-chapter-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.fcl-chapter-progress span {
  color: var(--fcl-muted);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .11em;
}

.fcl-chapter-progress strong {
  color: var(--fcl-blue);
  font-size: 12px;
  font-weight: 900;
}

.fcl-progress-track {
  height: 4px;
  background: var(--fcl-border);
  border-radius: 10px;
  margin-top: 13px;
  overflow: hidden;
}

.fcl-progress-track > div {
  height: 100%;
  background: linear-gradient(90deg,#1877F2,#22d3ee);
  border-radius: inherit;
  transition: width .3s ease;
}

.fcl-chapter-navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 15px;
  margin-top: 26px;
}

.fcl-navigation-button {
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 15px 18px;
  border-radius: 10px;
  border: 1px solid var(--fcl-border);
  background: var(--fcl-surface);
  color: var(--fcl-heading);
  text-align: left;
  transition:
    transform .2s ease,
    border-color .2s ease,
    background .2s ease;
}

.fcl-navigation-button:hover {
  transform: translateY(-2px);
  border-color: var(--fcl-blue);
}

.fcl-navigation-button.next {
  margin-left: auto;
  text-align: right;
}

.fcl-navigation-button > span {
  font-size: 20px;
  color: var(--fcl-blue);
}

.fcl-navigation-button small {
  display: block;
  color: var(--fcl-subtle);
  font-size: 9px;
  font-weight: 850;
  letter-spacing: .09em;
}

.fcl-navigation-button strong {
  display: block;
  margin-top: 6px;
  color: var(--fcl-heading);
  font-size: 12px;
  font-weight: 900;
}

/* =========================================================
   BOTTOM CTA
   ========================================================= */

.fcl-bottom-section {
  padding: 0 0 85px;
  background: var(--fcl-bg);
}

.fcl-bottom-card {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  padding: 54px 58px;
  border: 1px solid var(--fcl-border);
  border-radius: 19px;
  background: var(--fcl-bg-secondary);
}

.fcl-bottom-card::before {
  content: "";
  position: absolute;
  right: -80px;
  top: -170px;
  width: 400px;
  height: 400px;
  background: rgba(24,119,242,.1);
  border-radius: 50%;
  filter: blur(85px);
}

.fcl-bottom-content {
  position: relative;
  z-index: 1;
  max-width: 570px;
}

.fcl-bottom-content h2 {
  margin: 15px 0;
  color: var(--fcl-heading);
  font-size: clamp(25px,3vw,36px);
  font-weight: 950;
  letter-spacing: -.04em;
  line-height: 1.4;
}

.fcl-bottom-content p {
  margin: 0;
  color: var(--fcl-muted);
  font-size: 13px;
  line-height: 2;
}

.fcl-bottom-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.fcl-primary-button,
.fcl-secondary-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  min-height: 44px;
  padding: 12px 20px;
  border-radius: 9px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 900;
  transition: all .2s ease;
}

.fcl-primary-button {
  color: #fff;
  background: var(--fcl-blue);
  box-shadow: 0 7px 20px rgba(24,119,242,.18);
}

.fcl-primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(24,119,242,.25);
}

.fcl-secondary-button {
  color: var(--fcl-heading);
  border: 1px solid var(--fcl-border);
  background: var(--fcl-surface);
}

.fcl-secondary-button:hover {
  border-color: var(--fcl-blue);
  color: var(--fcl-blue);
}

.fcl-bottom-emblem {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(24,119,242,.2);
  background: rgba(24,119,242,.045);
}

.fcl-bottom-emblem-inner {
  width: 145px;
  height: 145px;
  border-radius: 50%;
  border: 2px solid rgba(24,119,242,.27);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.fcl-bottom-emblem-inner span {
  color: var(--fcl-blue);
  font-size: 46px;
  font-weight: 950;
  letter-spacing: -.09em;
}

.fcl-bottom-emblem-inner small {
  color: var(--fcl-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .15em;
}

/* =========================================================
   FOOTER
   ========================================================= */

.fcl-rulebook-footer {
  background: var(--fcl-bg-secondary);
  border-top: 1px solid var(--fcl-border);
}

.fcl-footer-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  padding: 34px 0;
}

.fcl-footer-top strong {
  color: var(--fcl-heading);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .08em;
}

.fcl-footer-top p {
  color: var(--fcl-muted);
  margin: 7px 0 0;
  font-size: 12px;
}

.fcl-footer-top a {
  color: var(--fcl-blue);
  font-size: 12px;
  font-weight: 850;
  text-decoration: none;
}

.fcl-footer-top a:hover {
  text-decoration: underline;
}

.fcl-footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid var(--fcl-border);
  color: var(--fcl-subtle);
  font-size: 11px;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 1024px) {

  .fcl-document-layout {
    grid-template-columns: 245px minmax(0,1fr);
    gap: 20px;
  }

  .fcl-document-page {
    padding: 35px 27px 45px;
  }

  .fcl-document-topline {
    padding-inline: 27px;
  }

  .fcl-bottom-card {
    padding: 43px 38px;
  }

  .fcl-bottom-emblem {
    width: 145px;
    height: 145px;
  }

  .fcl-bottom-emblem-inner {
    width: 110px;
    height: 110px;
  }

  .fcl-bottom-emblem-inner span {
    font-size: 36px;
  }
}

@media (max-width: 850px) {

  .fcl-sidebar {
    display: none;
  }

  .fcl-mobile-navigation {
    display: block;
  }

  .fcl-document-layout {
    display: block;
  }

  .fcl-document-heading {
    margin-bottom: 25px;
  }

  .fcl-hero-content {
    padding: 85px 0 90px;
  }

  .fcl-document-area {
    padding: 55px 0 75px;
  }
}

@media (max-width: 640px) {

  .fcl-container {
    width: min(100% - 28px,1180px);
  }

  .fcl-hero-top {
    padding-top: 23px;
    align-items: flex-start;
  }

  .fcl-brand {
    gap: 9px;
  }

  .fcl-brand-mark {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    font-size: 13px;
  }

  .fcl-brand-copy strong {
    max-width: 150px;
    font-size: 9px;
    line-height: 1.6;
  }

  .fcl-brand-copy span {
    font-size: 8px;
  }

  .fcl-language-switch {
    gap: 2px;
    padding: 3px;
  }

  .fcl-language-switch button {
    padding: 8px 9px;
    font-size: 10px;
  }

  .fcl-hero-content {
    padding: 69px 0 65px;
  }

  .fcl-hero-eyebrow {
    font-size: 10px;
  }

  .fcl-hero h1 {
    font-size: clamp(34px,8.5vw,48px);
    line-height: 1.25;
    letter-spacing: -.045em;
  }

  .fcl-hero-description {
    font-size: 13px;
    line-height: 2;
    margin-top: 20px;
  }

  .fcl-hero-meta {
    gap: 17px;
    margin-top: 33px;
  }

  .fcl-hero-meta > div > span {
    font-size: 9px;
  }

  .fcl-hero-meta strong {
    font-size: 12px;
  }

  .fcl-hero-meta-divider {
    height: 28px;
  }

  .fcl-hero-bottom {
    padding: 15px 0;
  }

  .fcl-hero-bottom span {
    font-size: 8px;
    line-height: 1.6;
  }

  .fcl-hero-bottom span:last-child {
    text-align: right;
  }

  .fcl-document-area {
    padding: 43px 0 60px;
  }

  .fcl-document-heading {
    display: block;
  }

  .fcl-document-heading > p {
    margin-top: 10px;
    text-align: left;
  }

  .fcl-mobile-navigation {
    padding: 13px;
  }

  .fcl-mobile-chapters {
    gap: 7px;
  }

  .fcl-mobile-chapters button {
    font-size: 10px;
    padding: 10px 8px;
    gap: 7px;
  }

  .fcl-document-content {
    border-radius: 13px;
  }

  .fcl-document-topline {
    padding: 16px 17px;
  }

  .fcl-document-topline span,
  .fcl-document-topline strong {
    font-size: 9px;
  }

  .fcl-document-page {
    padding: 27px 20px 37px;
  }

  .fcl-chapter-header {
    padding-bottom: 25px;
    margin-bottom: 27px;
  }

  .fcl-chapter-header h2 {
    font-size: 29px;
  }

  .fcl-chapter-header p {
    font-size: 13px;
  }

  .fcl-subsection-heading {
    margin: 33px 0 18px;
  }

  .fcl-subsection-heading h3 {
    font-size: 18px;
  }

  .fcl-rule {
    grid-template-columns: 49px minmax(0,1fr);
    gap: 10px;
    padding: 21px 0;
  }

  .fcl-rule-number {
    font-size: 11px;
  }

  .fcl-rule-content h3 {
    font-size: 14px;
  }

  .fcl-rule-content p {
    font-size: 12px;
    line-height: 2;
  }

  .fcl-info-box {
    padding: 19px;
  }

  .fcl-info-body p {
    font-size: 12px;
  }

  .fcl-format-summary {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }

  .fcl-format-summary > div:nth-child(3) {
    border-left: 0;
    border-top: 1px solid var(--fcl-border);
  }

  .fcl-format-summary > div:nth-child(4) {
    border-top: 1px solid var(--fcl-border);
  }

  .fcl-format-summary strong {
    font-size: 23px;
  }

  .fcl-lineup-grid,
  .fcl-provision-grid {
    grid-template-columns: 1fr;
  }

  .fcl-provision {
    padding: 22px;
  }

  .fcl-scorecard-header {
    padding: 18px;
  }

  .fcl-scorecard-status {
    display: none;
  }

  .fcl-scorecard-scroll {
    padding: 17px;
  }

  .fcl-scorecard-footer {
    padding: 19px;
  }

  .fcl-regulation-table th,
  .fcl-regulation-table td {
    padding: 15px 11px;
    font-size: 12px;
  }

  .fcl-regulation-table th {
    font-size: 9px;
  }

  .fcl-table-badge {
    display: block;
    width: fit-content;
    margin: 5px 0 0;
  }

  .fcl-segmented {
    width: 100%;
  }

  .fcl-segmented button {
    flex: 1;
    font-size: 11px;
    padding: 12px 8px;
  }

  .fcl-transaction-grid {
    padding: 30px 8px;
    grid-template-columns: minmax(0,1fr) 25px minmax(0,1fr);
  }

  .fcl-transaction-player > strong {
    font-size: 21px;
  }

  .fcl-transaction-heading {
    padding: 17px 14px;
  }

  .fcl-transaction-heading span,
  .fcl-transaction-heading strong {
    font-size: 9px;
  }

  .fcl-chapter-navigation {
    padding: 23px 18px;
  }

  .fcl-navigation-button {
    padding: 12px;
    gap: 9px;
  }

  .fcl-navigation-button small {
    font-size: 8px;
  }

  .fcl-navigation-button strong {
    font-size: 11px;
  }

  .fcl-bottom-section {
    padding-bottom: 55px;
  }

  .fcl-bottom-card {
    padding: 31px 24px;
  }

  .fcl-bottom-content h2 {
    font-size: 27px;
  }

  .fcl-bottom-emblem {
    display: none;
  }

  .fcl-bottom-actions {
    gap: 10px;
  }

  .fcl-primary-button,
  .fcl-secondary-button {
    font-size: 11px;
    padding: 12px 15px;
  }

  .fcl-footer-top {
    align-items: flex-start;
  }

  .fcl-footer-top strong {
    font-size: 10px;
  }

  .fcl-footer-top a {
    font-size: 11px;
    flex-shrink: 0;
  }

  .fcl-footer-bottom {
    flex-direction: column;
    gap: 8px;
    font-size: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .fcl-rulebook *,
  .fcl-rulebook *::before,
  .fcl-rulebook *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}

`;