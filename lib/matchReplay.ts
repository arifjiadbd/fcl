export type ReplayBatter = {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  out?: boolean;
};

export type ReplayDelivery = {
  batter: string;
  bowler?: string;
  runs: number;
  wicket?: boolean;
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
  powerplay?: string;
  squads?: Record<string, string[]>;
  mom?: { name: string; impact?: string };
  cpom?: { name: string; impact?: string };
  startTime?: string;
  endTime?: string;
  duration?: string;
};

export type ReplayBall = ReplayDelivery & {
  inningsIndex: number;
  ballInInnings: number;
  score: number;
  wickets: number;
  over: string;
  simulated: boolean;
};

// Only aggregates supplied? Generate an explicitly labelled illustration, NOT verified events.
export function buildReplayBalls(match: ReplayMatch): ReplayBall[] {
  return match.innings.flatMap((inn, inningsIndex) => {
    const scripted: ReplayDelivery[] = inn.deliveries?.length
      ? inn.deliveries
      : inn.batters.flatMap(batter => {
          const remainingBalls = Math.max(0, batter.balls - batter.fours - batter.sixes);
          const runsAfterBoundaries = Math.max(0, batter.runs - batter.fours * 4 - batter.sixes * 6);
          const runs = [
            ...Array(Math.max(0, batter.sixes)).fill(6),
            ...Array(Math.max(0, batter.fours)).fill(4),
            ...Array(remainingBalls).fill(0),
          ];
          // Spread other runs across non-boundary deliveries, preserving runs and balls.
          let left = runsAfterBoundaries;
          for (let i = batter.sixes + batter.fours; i < runs.length && left > 0; i++) {
            const amount = Math.min(left, 3);
            runs[i] = amount;
            left -= amount;
          }
          if (left > 0 && runs.length) runs[runs.length - 1] += left;
          return runs.map((runs, index) => ({
            batter: batter.name,
            runs,
            wicket: !!batter.out && index === batter.balls - 1,
          }));
        });
    let score = 0;
    let wickets = 0;
    return scripted.map((delivery, index) => {
      score += delivery.runs;
      if (delivery.wicket) wickets++;
      const over = `${Math.floor(index / 6)}.${(index % 6) + 1}`;
      return {
        ...delivery,
        bowler: delivery.bowler || inn.bowlers?.[Math.floor(index / 6)] || 'Bowler',
        inningsIndex,
        ballInInnings: index + 1,
        score,
        wickets,
        over,
        simulated: !inn.deliveries?.length,
      };
    });
  });
}

export const demo7upMojo: ReplayMatch = {
  id: 'team-7up-vs-team-mojo-2026-11-04',
  title: 'TEAM 7UP vs TEAM MOJO',
  date: '04/11/2026',
  venue: 'FCL National Cricket Ground',
  winner: 'TEAM 7UP',
  result: 'TEAM 7UP won by 3 wickets',
  innings: [
    {
      team: 'TEAM MOJO', total: 92, wickets: 5, overs: '5.0',
      bowlers: ['আরিফ জিয়াদ', 'Rakibul Islam', 'Asif Iqbal Khan', 'Raian Jabir', 'Shahriar Shovon'],
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
      bowlers: ['মোঃ আশিকুর রহমান তন্ময়', 'Sayed Anwar Shanto', 'Hetlar Shohag', 'M R Shakil', 'মোঃ আশিকুর রহমান তন্ময়'],
      batters: [
        { name: 'Shahriar Shovon', runs: 0, balls: 1, fours: 0, sixes: 0, out: true },
        { name: 'Raian Jabir', runs: 2, balls: 2, fours: 0, sixes: 0, out: true },
        { name: 'আরিফ জিয়াদ', runs: 17, balls: 7, fours: 0, sixes: 1, out: true },
        { name: 'Rakibul Islam', runs: 17, balls: 6, fours: 0, sixes: 2, out: true },
        { name: 'Asif Iqbal Khan*', runs: 57, balls: 13, fours: 5, sixes: 5 },
      ],
    },
  ],
};
