import type { ReplayBatter, ReplayInnings, ReplayMatch } from './matchReplay';

/**
 * Reads the existing /api/matches item's plain-text summary.
 * It never requests Facebook and never substitutes another match's scores.
 * Returns null if a safe, recognizable two-innings scorecard is unavailable.
 */
export function summaryToReplay(match: {
  id: number | string;
  title: string;
  summary: string;
  date?: string;
}): ReplayMatch | null {
  if (!match.summary?.trim()) return null;
  const lines = match.summary
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\\\*/g, '*')
    .split('\n')
    .map(line => line.replace(/\*\*/g, '').trim());

  // A score line must unambiguously specify a TEAM, runs, wickets and overs.
  // Examples: TEAM MOJO: 92/5 (5.0 Ov) or TEAM 7UP - 93/4 (4.5 overs).
  const scorePattern = /^(.+?)\s*[:\-–]\s*(\d{1,3})\s*\/\s*(\d{1,2})\s*\(\s*(\d{1,2}\.\d)\s*(?:ov(?:ers?)?\.?)?\s*\)/i;
  // Example: Asif Iqbal Khan* 57 (13) 5 5
  const batterPattern = /^(.+?)\s+(\d{1,3})\s*\(\s*(\d{1,3})\s*\)\s+(\d{1,2})\s+(\d{1,2})\s*$/;
  // Example bowling line: আরিফ জিয়াদ 1.0 16 1
  const bowlingPattern = /^(.+?)\s+(\d{1,2}\.\d)\s+(\d{1,3})\s+(\d{1,2})\s*$/;
  const innings: ReplayInnings[] = [];
  let current: ReplayInnings | null = null;
  let section: 'batting' | 'bowling' | 'other' = 'other';

  for (const line of lines) {
    if (!line || /^[-=\s]+$/.test(line)) continue;
    const score = line.match(scorePattern);
    if (score && !/^total\b/i.test(score[1])) {
      if (innings.length >= 2) break;
      current = {
        team: score[1].trim(),
        total: Number(score[2]),
        wickets: Number(score[3]),
        overs: score[4],
        batters: [],
        bowlers: [],
      };
      innings.push(current);
      section = 'batting';
      continue;
    }
    if (!current) continue;
    if (/^bowler\b/i.test(line)) { section = 'bowling'; continue; }
    if (/^batter\b|^batsman\b/i.test(line)) { section = 'batting'; continue; }
    if (/^(?:fall of wickets|fow|target|results?|mom|cpom|thanks|toss)\b/i.test(line)) {
      section = 'other';
      continue;
    }
    if (/^total\s*:/i.test(line) || /^total\s+\d+\s*\//i.test(line)) {
      section = 'other'; continue;
    }
    if (section === 'batting') {
      const row = line.match(batterPattern);
      if (!row) continue;
      const name = row[1].trim();
      const runs = Number(row[2]);
      const balls = Number(row[3]);
      const fours = Number(row[4]);
      const sixes = Number(row[5]);
      if (!name || balls < fours + sixes || fours * 4 + sixes * 6 > runs) continue;
      const batter: ReplayBatter = {
        name: name.replace(/\*$/, '').trim(), runs, balls, fours, sixes,
        out: !name.endsWith('*'),
      };
      current.batters.push(batter);
    } else if (section === 'bowling') {
      const row = line.match(bowlingPattern);
      if (row) current.bowlers!.push(row[1].trim());
    }
  }

  if (innings.length !== 2) return null;
  for (const inn of innings) {
    if (!inn.team || !inn.batters.length || inn.wickets > 10 || inn.wickets < 0) return null;
    const runs = inn.batters.reduce((sum, batter) => sum + batter.runs, 0);
    const balls = inn.batters.reduce((sum, batter) => sum + batter.balls, 0);
    // Require sufficiently complete aggregates; some innings contain extras.
    // Reject unsupported/inconsistent text rather than show another match's data.
    if (runs > inn.total || inn.total - runs > Math.max(10, Math.ceil(inn.total * 0.2))) return null;
    const [wholeOvers, extraBalls] = inn.overs.split('.').map(Number);
    if (extraBalls > 5 || balls > wholeOvers * 6 + extraBalls + 8) return null;
  }

  const result = match.summary.match(/(?:RESULTS?|MATCH RESULT)\s*(?:~>|:|\-)?\s*([^\n]+)/i)?.[1]?.trim();
  const venue = match.summary.match(/Venue\s*:\s*([^\n]+)/i)?.[1]?.trim();
  return {
    id: String(match.id),
    title: match.title,
    date: match.date,
    venue,
    result,
    innings: [innings[0], innings[1]],
  };
}
