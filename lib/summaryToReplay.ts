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
    .replace(/\\([*~=\-])/g, '$1')
    .split('\n')
    .map(line => line.replace(/\*\*/g, '').replace(/^[^\p{L}\p{N}*]+(?=[\p{L}\p{N}])/u, '').trim());

  // A score line must unambiguously specify a TEAM, runs, wickets and overs.
  // Examples: TEAM MOJO: 92/5 (5.0 Ov) or TEAM 7UP - 93/4 (4.5 overs).
  const scorePattern = /^(.+?)\s*[:\-–]\s*(\d{1,3})\s*\/\s*(\d{1,2})\s*\(\s*(\d{1,2}\.\d)\s*(?:ov(?:ers?)?\.?)?\s*\)/i;
  // Example: Asif Iqbal Khan* 57 (13) 5 5
  const batterPattern = /^(.+?)\s+(\d{1,3})\s*\(\s*(\d{1,3})\s*\)\s+(\d{1,2})\s+(\d{1,2})\s*$/;
  // Example bowling line: আরিফ জিয়াদ 1.0 16 1
  const bowlingPattern = /^(.+?)\s+(\d{1,2}\.\d)\s+(\d{1,3})\s+(\d{1,2})\s*$/;
  const innings: ReplayInnings[] = [];
  let current: ReplayInnings | null = null;
  const missing = new Set<ReplayBatter>();
  let section: 'batting' | 'bowling' | 'fow' | 'other' = 'other';

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
        bowlers: [], bowlingFigures: [], fallOfWickets: [],
      };
      innings.push(current);
      section = 'batting';
      continue;
    }
    if (!current) continue;
    if (/^bowler\b/i.test(line)) { section = 'bowling'; continue; }
    if (/^batter\b|^batsman\b/i.test(line)) { section = 'batting'; continue; }
    if (/^(?:fall of wickets|fow)\b/i.test(line)) { section = 'fow'; continue; }
    if (/^(?:target|results?|mom|cpom|thanks|toss|[12](?:st|nd) innings)\b/i.test(line)) {
      section = 'other';
      continue;
    }
    if (/^total\s*:/i.test(line) || /^total\s+\d+\s*\//i.test(line)) {
      section = 'other'; continue;
    }
    if (section === 'batting') {
      const incomplete = line.match(/^(.+?)\s+(\d{1,3})\s*\(\s*\)?\s*(\d{1,2})\s+(\d{1,2})$/);
      const row = line.match(batterPattern) ?? (incomplete ? [line, incomplete[1], incomplete[2], '0', incomplete[3], incomplete[4]] : null);
      if (!row) continue;
      const name = row[1].trim();
      const runs = Number(row[2]);
      const balls = Number(row[3]);
      const fours = Number(row[4]);
      const sixes = Number(row[5]);
      if (!name || (!incomplete && balls < fours + sixes) || fours * 4 + sixes * 6 > runs) continue;
      const batter: ReplayBatter = {
        name: name.replace(/\*$/, '').trim(), runs, balls, fours, sixes,
        out: !name.endsWith('*'),
      };
      current.batters.push(batter);
      if (incomplete) missing.add(batter);
    } else if (section === 'bowling') {
      const row = line.match(bowlingPattern);
      if (row) { current.bowlers!.push(row[1].trim()); current.bowlingFigures!.push({name: row[1].trim(), overs: row[2], runs: Number(row[3]), wickets: Number(row[4])}); }
    } else if (section === 'fow') {
      const f = line.match(/^(?:\d+)\s*[-–]\s*(\d+)\s*\((.+?),\s*(\d+\.\d)\s*(?:ov(?:ers?)?\.?)?\)/i);
      if (f) current.fallOfWickets!.push({score:Number(f[1]), batter:f[2].trim(), over:f[3]});
    }
  }

  if (innings.length !== 2) return null;
  for (const inn of innings) {
    if (!inn.team || !inn.batters.length || inn.wickets > 10 || inn.wickets < 0) return null;
    const unknown = inn.batters.filter(b => missing.has(b));
    const [o, b] = inn.overs.split('.').map(Number);
    if (unknown.length) {
      let remaining = o*6+b-inn.batters.reduce((sum,x)=>sum+x.balls,0);
      for (const x of unknown) { x.balls = x.fours+x.sixes+Math.ceil(Math.max(0,x.runs-x.fours*4-x.sixes*6)/3); remaining -= x.balls; }
      if (remaining < 0) return null;
      unknown[unknown.length-1].balls += remaining;
    }
    const runs = inn.batters.reduce((sum, batter) => sum + batter.runs, 0);
    const balls = inn.batters.reduce((sum, batter) => sum + batter.balls, 0);
    // Require sufficiently complete aggregates; some innings contain extras.
    // Reject unsupported/inconsistent text rather than show another match's data.
    if (runs > inn.total || inn.total - runs > Math.max(10, Math.ceil(inn.total * 0.2))) return null;
    const [wholeOvers, extraBalls] = inn.overs.split('.').map(Number);
    if (extraBalls > 5 || balls > wholeOvers * 6 + extraBalls + 8) return null;
  }

  const result = lines.join('\n').match(/(?:RESULTS?|MATCH RESULT)\s*(?:~>|:|\-)?\s*([^\n]+)/i)?.[1]?.trim();
  const venue = lines.join('\n').match(/Venue\s*:\s*([^\n]+)/i)?.[1]?.trim();
  const text = lines.join('\n');
  const meta = (label: string) => {
    const found = text.split('\n').find(line => line.toLowerCase().includes(label.toLowerCase() + ':'));
    return found?.split(':').slice(1).join(':').trim();
  };
  const awards = (label: string) => {
    const line = text.split('\n').find(item => new RegExp(`(?:^|\\s)${label}\\s*:`, 'i').test(item));
    if (!line) return undefined;
    const value = line.slice(line.indexOf(':') + 1).trim();
    const name = value.replace(/\s*\(\s*Impact\s*:\s*[^)]+\)/i, '').trim();
    const impact = value.match(/Impact\s*:\s*([\d,.]+\s*(?:pts|points)?)/i)?.[1]?.trim();
    return name ? { name, impact } : undefined;
  };
  const squads: Record<string, string[]> = {};
  let activeSquad: string | null = null;
  for (const line of text.replace(/\r/g, '').split('\n')) {
    const heading = line.match(/(?:💥\s*)?(.+?)\s+SQUAD\s*:/i);
    if (heading) {
      activeSquad = heading[1].replace(/[💥♦️]/g, '').trim().toUpperCase();
      squads[activeSquad] = [];
      continue;
    }
    if (activeSquad && /(?:MATCH INFO|1ST INNINGS|TOSS|2ND INNINGS)/i.test(line)) activeSquad = null;
    if (activeSquad) {
      const name = line.replace(/^\s*\d+[.)]\s*/, '').trim();
      if (name && /\p{L}/u.test(name) && !/[:=]/.test(name)) squads[activeSquad].push(name.trim());
    }
  }
  return {
    id: String(match.id),
    title: match.title,
    date: text.match(/(?:^|\n)\s*(?:🗓️\s*)?Date\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i)?.[1] || match.date,
    venue,
    result,
    squads,
    mom: awards('MOM'),
    cpom: awards('CPOM'),
    format: meta('Format'),
    maxOvers: Number(text.match(/(\d+)\s*overs?\s*&/i)?.[1]) || undefined,
    winner: result?.match(/^(.+?)\s+won\b/i)?.[1],
    inferredBalls: missing.size > 0,
    startTime: meta('Start Time'),
    endTime: meta('Closing Time'),
    duration: meta('Match Duration'),
    innings: [innings[0], innings[1]],
  };
}
