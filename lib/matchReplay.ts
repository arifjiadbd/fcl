export type ReplayBatter = {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  out?: boolean;
};

export type ReplayExtraType = 'wide' | 'noball' | 'bye' | 'legbye';

export type ReplayDelivery = {
  batter: string;
  bowler?: string;
  /** Runs off the bat (extras go in `extras`). */
  runs: number;
  wicket?: boolean;
  /** Extra runs on this delivery (wide / no-ball / bye / leg-bye). */
  extras?: number;
  extraType?: ReplayExtraType;
  /** Optional: real delivery event label or commentary */
  commentary?: string;
};

export type ReplayInnings = {
  team: string;
  total: number;
  wickets: number;
  overs: string;
  batters: ReplayBatter[];
  bowlers?: string[];
  bowlingFigures?: { name: string; overs: string; runs: number; wickets: number }[];
  fallOfWickets?: { batter: string; score: number; over: string }[];
  /** When available, exact ball-by-ball events override the illustrative sequence. */
  deliveries?: ReplayDelivery[];
};

export type ReplayMatch = {
  id: string;
  title?: string;
  date?: string;
  venue?: string;
  winner?: string;
  result?: string;
  innings: [ReplayInnings, ReplayInnings];
  format?: string;
  maxOvers?: number;
  powerplay?: string;
  squads?: Record<string, string[]>;
  mom?: { name: string; impact?: string };
  cpom?: { name: string; impact?: string };
  startTime?: string;
  endTime?: string;
  duration?: string;
  /** Missing balls faced reconstructed from innings totals, not verified. */
  inferredBalls?: boolean;
};

export type ReplayBall = ReplayDelivery & {
  bowler: string;
  inningsIndex: number;
  /** 1-based delivery number inside the innings (wides included). */
  ballInInnings: number;
  /** Legal balls bowled in the innings after this delivery. */
  legalBalls: number;
  legal: boolean;
  overIndex: number;
  /** Ball number shown in the over label (1..6). */
  ballInOver: number;
  /** Runs added to the team score by this delivery (bat + extras). */
  teamRuns: number;
  score: number;
  wickets: number;
  over: string;
  simulated: boolean;
  /** Index into innings.batters (-1 when unknown). */
  batterIndex: number;
  /** Cumulative batter figures AFTER this delivery. */
  batterRuns: number;
  batterBalls: number;
  batterFours: number;
  batterSixes: number;
};

type Draft = ReplayDelivery & { batterIndex: number };

/* ------------------------------------------------------------------ */
/* Deterministic random helpers (same match => same replay every time) */
/* ------------------------------------------------------------------ */
function hashSeed(text: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rnd: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

const repeat = (n: number, value: number): number[] => Array.from({ length: Math.max(0, n) }, () => value);

/* ------------------------------------------------------------------ */
/* Reconstruction: only scorecard aggregates exist -> labelled "simulated" */
/* Every batter's runs / balls / 4s / 6s and the innings total are kept   */
/* exactly; only the ORDER of balls inside a batter's innings is invented. */
/* ------------------------------------------------------------------ */
function reconstructInnings(inn: ReplayInnings, seedText: string): Draft[] {
  const rnd = mulberry32(hashSeed(seedText));
  const drafts: Draft[] = [];

  inn.batters.forEach((batter, batterIndex) => {
    const balls = Math.max(0, Math.floor(batter.balls));
    if (!balls) return;
    const sixes = Math.min(Math.max(0, batter.sixes), balls);
    const fours = Math.min(Math.max(0, batter.fours), balls - sixes);
    const plain = balls - sixes - fours;
    const out = !!batter.out;
    const wicketOnPlain = out && plain > 0;
    const body = repeat(plain - (wicketOnPlain ? 1 : 0), 0);
    const boundaries = [...repeat(sixes, 6), ...repeat(fours, 4)];

    let left = Math.max(0, batter.runs - fours * 4 - sixes * 6);
    let wicketRuns = 0;
    const open = body.map((_, i) => i);
    while (left > 0 && open.length) {
      const pick = Math.floor(rnd() * open.length);
      const i = open[pick];
      const add = Math.min(left, 3 - body[i], rnd() < 0.2 ? 2 : 1);
      body[i] += add;
      left -= add;
      if (body[i] >= 3) open.splice(pick, 1);
    }
    if (left > 0) {
      if (body.length) body[body.length - 1] += left;
      else if (boundaries.length) boundaries[boundaries.length - 1] += left;
      else if (wicketOnPlain) wicketRuns = left;
    }

    shuffle([...boundaries, ...body], rnd).forEach(runs => drafts.push({ batter: batter.name, batterIndex, runs }));
    if (wicketOnPlain) drafts.push({ batter: batter.name, batterIndex, runs: wicketRuns, wicket: true });
    else if (out && drafts.length) drafts[drafts.length - 1].wicket = true;
  });

  // Extras = innings total - runs off the bat. Byes / leg-byes sit on dot balls,
  // the rest become wides, so the final score always equals the real total.
  const batRuns = drafts.reduce((sum, d) => sum + d.runs, 0);
  let extrasLeft = Math.max(0, inn.total - batRuns);
  if (extrasLeft > 0 && drafts.length) {
    const dots = shuffle(
      drafts.map((d, i) => (d.runs === 0 && !d.wicket && !d.extras ? i : -1)).filter(i => i >= 0),
      rnd,
    );
    const byeCount = Math.min(dots.length, Math.ceil(extrasLeft / 2));
    for (let k = 0; k < byeCount; k++) {
      const d = drafts[dots[k]];
      d.extras = 1;
      d.extraType = rnd() < 0.5 ? 'bye' : 'legbye';
    }
    extrasLeft -= byeCount;
    for (let w = 0; w < extrasLeft; w++) {
      const at = Math.floor(rnd() * drafts.length);
      const ref = drafts[at];
      drafts.splice(at, 0, { batter: ref.batter, batterIndex: ref.batterIndex, runs: 0, extras: 1, extraType: 'wide' });
    }
  }
  // Constrain the existing single-batter sequence to recorded wicket checkpoints.
  // A bounded search permutes each batter's deliveries while retaining their figures.
  const checkpoints = inn.fallOfWickets ?? [];
  const figures = inn.bowlingFigures ?? [];
  const overBalls = (v: string) => { const [o,b] = v.split('.').map(Number); return o*6+(b||0); };
  const schedule = inn.bowlers?.length ? inn.bowlers : figures.map(b => b.name);
  const cost = (ds: Draft[]) => {
    let score=0, legal=0, w=0, penalty=0;
    const stats = new Map<string,{runs:number; wickets:number; balls:number}>();
    for (const d of ds) {
      const name=d.bowler || schedule[Math.floor(legal/6)%schedule.length] || 'Bowler';
      const st=stats.get(name) ?? {runs:0,wickets:0,balls:0};
      const ok=d.extraType!=='wide' && d.extraType!=='noball';
      if(ok){legal++;st.balls++;}
      score+=d.runs+(d.extras??0);
      st.runs+=d.runs+(['wide','noball'].includes(d.extraType??'')?(d.extras??0):0);
      if(d.wicket){st.wickets++;const c=checkpoints[w++];if(c)penalty+=10*(Math.abs(c.score-score)+Math.abs(overBalls(c.over)-legal));}
      stats.set(name,st);
    }
    for(const f of figures){const st=stats.get(f.name)??{runs:0,wickets:0,balls:0};penalty+=Math.abs(st.runs-f.runs)+5*Math.abs(st.wickets-f.wickets)+5*Math.abs(st.balls-overBalls(f.overs));}
    return penalty;
  };
  if(checkpoints.length || figures.length){
    let best=drafts.slice(), bestCost=cost(best), current=best.slice(), currentCost=bestCost;
    for(let k=0;k<18000 && bestCost>0 && current.length>1;k++){
      const a=Math.floor(rnd()*current.length), b=Math.floor(rnd()*current.length);
      if(current[a].batterIndex!==current[b].batterIndex || current[a].wicket || current[b].wicket)continue;
      [current[a],current[b]]=[current[b],current[a]];
      const c=cost(current), temp= Math.max(.15,3*(1-k/18000));
      if(c<=currentCost || rnd()<Math.exp((currentCost-c)/temp)){currentCost=c;if(c<bestCost){best=current.slice();bestCost=c;}}
      else [current[a],current[b]]=[current[b],current[a]];
    }
    return best;
  }
  return drafts;
}

export function buildReplayBalls(match: ReplayMatch): ReplayBall[] {
  return match.innings.flatMap((inn, inningsIndex) => {
    const exact = !!inn.deliveries?.length;
    const scripted: Draft[] = exact
      ? inn.deliveries!.map(d => ({ ...d, batterIndex: inn.batters.findIndex(b => b.name === d.batter) }))
      : reconstructInnings(inn, `${match.id}|${inningsIndex}`);

    let score = 0;
    let wickets = 0;
    let legalCount = 0;
    const stats = new Map<string, { runs: number; balls: number; fours: number; sixes: number }>();
    const bowlers = inn.bowlers?.length ? inn.bowlers : inn.bowlingFigures?.map(b => b.name);

    return scripted.map((delivery, index): ReplayBall => {
      const extras = delivery.extras ?? 0;
      const legal = delivery.extraType !== 'wide' && delivery.extraType !== 'noball';
      const overIndex = Math.floor(legalCount / 6);
      const ballInOver = (legalCount % 6) + 1;
      const teamRuns = delivery.runs + extras;
      score += teamRuns;
      if (delivery.wicket) wickets++;
      if (legal) legalCount++;

      const key = delivery.batterIndex >= 0 ? `#${delivery.batterIndex}` : `n:${delivery.batter}`;
      const st = stats.get(key) ?? { runs: 0, balls: 0, fours: 0, sixes: 0 };
      if (delivery.extraType !== 'wide') st.balls++;
      st.runs += delivery.runs;
      if (delivery.runs === 4) st.fours++;
      if (delivery.runs === 6) st.sixes++;
      stats.set(key, st);

      return {
        ...delivery,
        bowler: delivery.bowler || (bowlers ? bowlers[overIndex % bowlers.length] : 'Bowler'),
        inningsIndex,
        ballInInnings: index + 1,
        legalBalls: legalCount,
        legal,
        overIndex,
        ballInOver,
        teamRuns,
        score,
        wickets,
        over: `${overIndex}.${ballInOver}`,
        simulated: !exact,
        batterRuns: st.runs,
        batterBalls: st.balls,
        batterFours: st.fours,
        batterSixes: st.sixes,
      };
    });
  });
}

/* ------------------------------------------------------------------ */
/* Live state (scorecard / bowling / FOW / overs) at any replay position */
/* ------------------------------------------------------------------ */
export type LiveBatter = {
  index: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: number;
  status: 'yet' | 'batting' | 'out';
  onStrike: boolean;
};
export type LiveBowler = {
  name: string;
  legalBalls: number;
  runs: number;
  wickets: number;
  overs: string;
  economy: number;
  active: boolean;
};
export type LiveOver = {
  index: number;
  bowler: string;
  balls: ReplayBall[];
  runs: number;
  wickets: number;
  scoreAfter: number;
  wicketsAfter: number;
  complete: boolean;
};
export type LiveFow = { wicketNo: number; score: number; batter: string; over: string };
export type LiveState = {
  inningsIndex: 0 | 1;
  team: string;
  score: number;
  wickets: number;
  legalBalls: number;
  oversText: string;
  extras: number;
  crr: number;
  target: number | null;
  need: number | null;
  ballsLeft: number | null;
  rrr: number | null;
  batters: LiveBatter[];
  bowlers: LiveBowler[];
  overList: LiveOver[];
  fow: LiveFow[];
  current?: ReplayBall;
  next?: ReplayBall;
  strikerIndex: number;
  bowlerName: string;
};

export function oversLimit(match: ReplayMatch): number {
  if (match.maxOvers && match.maxOvers > 0) return match.maxOvers;
  const fromFormat = match.format?.match(/(\d{1,2})\s*(?:ov|over)/i)?.[1];
  if (fromFormat) return Number(fromFormat);
  const parse = (o: string) => {
    const [w, b] = o.split('.').map(Number);
    return (w || 0) + ((b || 0) > 0 ? 1 : 0);
  };
  return Math.max(parse(match.innings[0].overs), parse(match.innings[1].overs), 1);
}

export const oversString = (legalBalls: number) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;

export function computeReplayState(
  match: ReplayMatch,
  balls: ReplayBall[],
  position: number,
  forceInnings?: 0 | 1,
): LiveState {
  const firstLength = balls.reduce((n, b) => n + (b.inningsIndex === 0 ? 1 : 0), 0);
  const idx: 0 | 1 = forceInnings ?? (position > firstLength ? 1 : 0);
  const inn = match.innings[idx];
  const pos = Math.max(0, Math.min(position, balls.length));
  const played = balls.slice(0, pos).filter(b => b.inningsIndex === idx);
  const next = balls.slice(pos).find(b => b.inningsIndex === idx);
  const current = played[played.length - 1];

  const batters: LiveBatter[] = inn.batters.map((b, i) => ({
    index: i, name: b.name, runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0, status: 'yet', onStrike: false,
  }));
  const resolve = (b: ReplayBall) => {
    if (b.batterIndex >= 0 && b.batterIndex < batters.length) return b.batterIndex;
    let i = batters.findIndex(x => x.name === b.batter);
    if (i < 0) {
      batters.push({ index: batters.length, name: b.batter, runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0, status: 'yet', onStrike: false });
      i = batters.length - 1;
    }
    return i;
  };

  const bowlerMap = new Map<string, LiveBowler>();
  const overMap = new Map<number, LiveOver>();
  const fow: LiveFow[] = [];
  let extras = 0;

  for (const b of played) {
    const bi = resolve(b);
    const lb = batters[bi];
    lb.runs = b.batterRuns; lb.balls = b.batterBalls; lb.fours = b.batterFours; lb.sixes = b.batterSixes;
    lb.status = b.wicket ? 'out' : 'batting';
    lb.sr = lb.balls ? (lb.runs / lb.balls) * 100 : 0;

    let bw = bowlerMap.get(b.bowler);
    if (!bw) {
      bw = { name: b.bowler, legalBalls: 0, runs: 0, wickets: 0, overs: '0.0', economy: 0, active: false };
      bowlerMap.set(b.bowler, bw);
    }
    if (b.legal) bw.legalBalls++;
    bw.runs += b.runs + (b.extraType === 'wide' || b.extraType === 'noball' ? b.extras ?? 0 : 0);
    if (b.wicket) bw.wickets++;

    let ov = overMap.get(b.overIndex);
    if (!ov) {
      ov = { index: b.overIndex, bowler: b.bowler, balls: [], runs: 0, wickets: 0, scoreAfter: 0, wicketsAfter: 0, complete: false };
      overMap.set(b.overIndex, ov);
    }
    ov.balls.push(b);
    ov.runs += b.teamRuns;
    if (b.wicket) ov.wickets++;
    ov.scoreAfter = b.score;
    ov.wicketsAfter = b.wickets;
    extras += b.extras ?? 0;
    if (b.wicket) fow.push({ wicketNo: b.wickets, score: b.score, batter: b.batter, over: oversString(b.legalBalls) });
  }

  const focus = current ?? next;
  const strikerIndex = focus ? resolve(focus) : -1;
  if (strikerIndex >= 0) batters[strikerIndex].onStrike = true;

  const bowlerName = (current ?? next)?.bowler ?? '—';
  const bowlers = [...bowlerMap.values()].map(bw => ({
    ...bw,
    overs: oversString(bw.legalBalls),
    economy: bw.legalBalls ? (bw.runs / bw.legalBalls) * 6 : 0,
    active: bw.name === bowlerName,
  }));
  const overList = [...overMap.values()].map(o => ({ ...o, complete: o.balls.filter(b => b.legal).length >= 6 }));

  const score = current?.score ?? 0;
  const legalBalls = current?.legalBalls ?? 0;
  const chasing = idx === 1;
  const target = chasing ? match.innings[0].total + 1 : null;
  const ballsLeft = chasing ? Math.max(0, oversLimit(match) * 6 - legalBalls) : null;
  const need = target !== null ? Math.max(0, target - score) : null;

  return {
    inningsIndex: idx,
    team: inn.team,
    score,
    wickets: current?.wickets ?? 0,
    legalBalls,
    oversText: oversString(legalBalls),
    extras,
    crr: legalBalls ? (score / legalBalls) * 6 : 0,
    target,
    need,
    ballsLeft,
    rrr: need !== null && ballsLeft ? (need / ballsLeft) * 6 : null,
    batters,
    bowlers,
    overList,
    fow,
    current,
    next,
    strikerIndex,
    bowlerName,
  };
}

/* ------------------------------------------------------------------ */
export const demo7upMojo: ReplayMatch = {
  id: 'team-7up-vs-team-mojo-2026-11-04',
  title: 'TEAM 7UP vs TEAM MOJO',
  maxOvers: 5, format: 'T20+',
  mom: {name:'Asif Iqbal Khan',impact:'344 pts'}, cpom:{name:'Sayed Anwar Shanto',impact:'211 pts'},
  date: '04/11/2026',
  venue: 'FCL National Cricket Ground',
  winner: 'TEAM 7UP',
  result: 'TEAM 7UP won by 3 wickets',
  innings: [
    {
      team: 'TEAM MOJO', total: 92, wickets: 5, overs: '5.0',
      bowlingFigures: [{name:'আরিফ জিয়াদ',overs:'1.0',runs:16,wickets:1},{name:'Rakibul Islam',overs:'1.0',runs:16,wickets:1},{name:'Asif Iqbal Khan',overs:'1.0',runs:13,wickets:2},{name:'Raian Jabir',overs:'1.0',runs:28,wickets:0},{name:'Shahriar Shovon',overs:'1.0',runs:19,wickets:1}],
      fallOfWickets: [{batter:'M R Shakil',score:16,over:'1.0'},{batter:'Hetlar Shohag',score:32,over:'2.0'},{batter:'Md Siyam Islam',score:32,over:'2.1'},{batter:'মোঃ আশিকুর রহমান তন্ময়',score:45,over:'3.0'},{batter:'Sayed Anwar Shanto',score:85,over:'4.4'}],
      bowlers: ['আরিফ জিয়াদ', 'Rakibul Islam', 'Asif Iqbal Khan', 'Raian Jabir', 'Shahriar Shovon'],
      batters: [
        { name: 'M R Shakil', runs: 16, balls: 6, fours: 1, sixes: 1, out: true },
        { name: 'Hetlar Shohag', runs: 16, balls: 6, fours: 1, sixes: 1, out: true },
        { name: 'Md Siyam Islam', runs: 0, balls: 1, fours: 0, sixes: 0, out: true },
        { name: 'মোঃ আশিকুর রহমান তন্ময়', runs: 13, balls: 5, fours: 2, sixes: 0, out: true },
        { name: 'Sayed Anwar Shanto', runs: 40, balls: 10, fours: 5, sixes: 3, out: true },
        { name: 'M R Shakil*', runs: 7, balls: 2, fours: 1, sixes: 0 },
      ],
    },
    {
      team: 'TEAM 7UP', total: 93, wickets: 4, overs: '4.5',
      bowlingFigures: [{name:'মোঃ আশিকুর রহমান তন্ময়',overs:'1.5',runs:27,wickets:2},{name:'Sayed Anwar Shanto',overs:'1.0',runs:16,wickets:1},{name:'Hetlar Shohag',overs:'1.0',runs:20,wickets:1},{name:'M R Shakil',overs:'1.0',runs:30,wickets:0}],
      fallOfWickets: [{batter:'Shahriar Shovon',score:0,over:'0.1'},{batter:'Raian Jabir',score:2,over:'0.3'},{batter:'আরিফ জিয়াদ',score:19,over:'1.4'},{batter:'Rakibul Islam',score:36,over:'2.4'}],
      bowlers: ['মোঃ আশিকুর রহমান তন্ময়', 'Sayed Anwar Shanto', 'Hetlar Shohag', 'M R Shakil', 'মোঃ আশিকুর রহমান তন্ময়'],
      batters: [
        { name: 'Shahriar Shovon', runs: 0, balls: 1, fours: 0, sixes: 0, out: true },
        { name: 'Raian Jabir', runs: 2, balls: 2, fours: 0, sixes: 0, out: true },
        { name: 'আরিফ জিয়াদ', runs: 17, balls: 7, fours: 0, sixes: 1, out: true },
        { name: 'Rakibul Islam', runs: 17, balls: 6, fours: 0, sixes: 2, out: true },
        { name: 'Asif Iqbal Khan*', runs: 57, balls: 13, fours: 5, sixes: 5 },
      ],
    },
  ],
};
