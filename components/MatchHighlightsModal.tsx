'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LiveBatter, ReplayBall, ReplayMatch } from '@/lib/matchReplay';
import { buildReplayBalls, computeReplayState, oversLimit } from '@/lib/matchReplay';
import type { CommentaryLang, CommentaryTag } from '@/lib/replayCommentary';
import { ballTag, chipLabel, commentaryFor } from '@/lib/replayCommentary';
import styles from './MatchHighlightsModal.module.css';

type Props = { match: ReplayMatch; open: boolean; onClose: () => void };
type PlayMode = 'full' | 'highlights';
type ScoreTab = 'all' | 'bat' | 'bowl' | 'fow';
type ViewInnings = 'live' | 0 | 1;
type FeedFilter = 'all' | 'key';

const DEFAULT_SPEED = 0.20;
const SPEEDS = [DEFAULT_SPEED, 0.5, 1, 2, 4];
const isKey = (b: ReplayBall) => !!b.wicket || b.runs >= 4;
const norm = (s: string) => s.replace(/\*/g, '').replace(/\((?:c|vc|wk|c\/wk)\)/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
const sameName = (a: string, b: string) => {
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const tx = x.split(' '), ty = y.split(' ');
  const [small, big] = tx.length <= ty.length ? [tx, ty] : [ty, tx];
  return small.length >= 2 && small.every(t => big.includes(t));
};
const two = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : '0.00');

function dateText(value?: string) {
  if (!value) return 'Date unavailable';
  const iso = /^\d{4}-\d\d-\d\d(?:T|$)/.test(value);
  const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return `${slash[1].padStart(2, '0')}/${slash[2].padStart(2, '0')}/${slash[3]}`;
  if (!iso) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' }).format(d);
}

function chipClass(tag: CommentaryTag): string {
  switch (tag) {
    case 'four': return styles.chip4;
    case 'six': return styles.chip6;
    case 'wicket': return styles.chipW;
    case 'wide': case 'noball': case 'bye': case 'legbye': return styles.chipX;
    case 'dot': return styles.chip0;
    default: return styles.chip1;
  }
}

/* ---------- tiny synthesised sound effects (no audio files needed) ---------- */
function getAudioCtor(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}
function noiseBuffer(ctx: AudioContext, seconds: number) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}
function roar(ctx: AudioContext, level: number, seconds: number, freq: number) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, seconds);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 0.7;
  const g = ctx.createGain();
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(level, 0.0002), t + seconds * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(t); src.stop(t + seconds);
}
function click(ctx: AudioContext, level: number) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 0.05);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 1800;
  const g = ctx.createGain();
  const t = ctx.currentTime;
  g.gain.setValueAtTime(Math.max(level, 0.0002), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  src.connect(hp).connect(g).connect(ctx.destination);
  src.start(t); src.stop(t + 0.06);
}
function thump(ctx: AudioContext, level: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t = ctx.currentTime;
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(50, t + 0.35);
  g.gain.setValueAtTime(Math.max(level, 0.0002), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  o.connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + 0.42);
}
function playSfx(ctx: AudioContext, tag: CommentaryTag, v: number) {
  if (tag === 'dot') return;
  if (tag === 'wicket') { thump(ctx, 0.5 * v); roar(ctx, 0.16 * v, 1.5, 320); return; }
  click(ctx, 0.35 * v);
  if (tag === 'four') roar(ctx, 0.22 * v, 1.7, 900);
  if (tag === 'six') { roar(ctx, 0.38 * v, 2.8, 750); window.setTimeout(() => roar(ctx, 0.2 * v, 1.6, 1200), 450); }
}

export default function MatchHighlightsModal({ match, open, onClose }: Props) {
  const balls = useMemo(() => buildReplayBalls(match), [match]);
  const firstLength = useMemo(() => balls.filter(b => b.inningsIndex === 0).length, [balls]);
  const limit = useMemo(() => oversLimit(match), [match]);
  const keyIdx = useMemo(() => balls.map((b, i) => (isKey(b) ? i : -1)).filter(i => i >= 0), [balls]);
  const overEnds = useMemo(() => {
    const m = new Map<string, number>();
    balls.forEach((b, i) => m.set(`${b.inningsIndex}:${b.overIndex}`, i + 1));
    return [...m.values()].sort((a, b) => a - b);
  }, [balls]);
  const simulated = useMemo(() => balls.some(b => b.simulated), [balls]);

  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mode, setMode] = useState<PlayMode>('full');
  const [lang, setLang] = useState<CommentaryLang>('en');
  const [volume, setVolume] = useState(45);
  const [muted, setMuted] = useState(false);
  const [voice, setVoice] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [tab, setTab] = useState<ScoreTab>('all');
  const [viewInnings, setViewInnings] = useState<ViewInnings>('live');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');

  const boxRef = useRef<HTMLElement>(null);
  const commentaryRef = useRef<HTMLElement>(null);
  const scorecardRef = useRef<HTMLElement>(null);
  const squadsRef = useRef<HTMLElement>(null);
  const jumpToPanel = (panel: HTMLElement | null) => panel?.scrollIntoView({ block: "start", behavior: "auto" });
  const audioRef = useRef<AudioContext | null>(null);
  const manualRef = useRef(false);
  const fxPos = useRef(0);

  const live = useMemo(() => computeReplayState(match, balls, position), [match, balls, position]);
  const shown = useMemo(
    () => (viewInnings === 'live' ? live : computeReplayState(match, balls, position, viewInnings)),
    [viewInnings, live, match, balls, position],
  );
  const finals = useMemo(
    () => [computeReplayState(match, balls, firstLength, 0), computeReplayState(match, balls, balls.length, 1)] as const,
    [match, balls, firstLength],
  );

  const worm = useMemo(() => {
    const W = 320, H = 132, L = 30, R = 8, T = 10, B = 20;
    const target = match.innings[0].total + 1;
    const maxRuns = Math.max(match.innings[0].total, match.innings[1].total, target) + 6;
    const maxBalls = Math.max(limit * 6, ...balls.map(b => b.legalBalls), 6);
    const x = (n: number) => L + (n / maxBalls) * (W - L - R);
    const y = (n: number) => H - B - (n / maxRuns) * (H - T - B);
    const lines = [0, 1].map(i => {
      const pts = [`${x(0)},${y(0)}`];
      balls.slice(0, position).forEach(b => { if (b.inningsIndex === i) pts.push(`${x(b.legalBalls).toFixed(1)},${y(b.score).toFixed(1)}`); });
      return pts.join(' ');
    });
    const wk = balls.slice(0, position).filter(b => b.wicket).map(b => ({ i: b.inningsIndex, cx: x(b.legalBalls), cy: y(b.score) }));
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(maxRuns * f));
    const xTicks = Array.from({ length: Math.floor(maxBalls / 6) + 1 }, (_, o) => o);
    return { W, H, L, R, B, x, y, lines, wk, yTicks, xTicks, targetY: y(target), target };
  }, [balls, position, limit, match]);

  /* ---------------- actions ---------------- */
  const ensureAudio = useCallback(() => {
    const Ctor = getAudioCtor();
    if (!Ctor) return null;
    if (!audioRef.current) audioRef.current = new Ctor();
    if (audioRef.current.state === 'suspended') void audioRef.current.resume();
    return audioRef.current;
  }, []);

  const go = useCallback((n: number, manual = true) => {
    manualRef.current = manual;
    if (manual) ensureAudio();
    setPlaying(false);
    setPosition(Math.max(0, Math.min(n, balls.length)));
  }, [balls.length, ensureAudio]);

  const stepForward = useCallback(() => {
    setPosition(p => {
      if (p >= balls.length) return p;
      if (mode === 'highlights') {
        const n = keyIdx.find(i => i >= p);
        return n === undefined ? balls.length : n + 1;
      }
      return p + 1;
    });
  }, [balls.length, keyIdx, mode]);

  const togglePlay = useCallback(() => {
    ensureAudio();
    if (position >= balls.length && balls.length) { setPosition(0); setPlaying(true); return; }
    setPlaying(p => !p);
  }, [balls.length, ensureAudio, position]);

  const nextOver = () => { const e = overEnds.find(v => v > position); go(e ?? balls.length); };
  const prevOver = () => { const e = [...overEnds].reverse().find(v => v < position); go(e ?? 0); };
  const nextKey = () => { const n = keyIdx.find(i => i >= position); go(n === undefined ? balls.length : n + 1); };
  const prevKey = () => { const n = [...keyIdx].reverse().find(i => i < position - 1); go(n === undefined ? 0 : n + 1); };
  const toggleFullScreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await boxRef.current?.requestFullscreen();
    } catch { /* unsupported */ }
  }, []);

  const act = useRef({ toggle: () => {}, next: () => {}, prev: () => {}, nOver: () => {}, pOver: () => {}, full: () => {}, mute: () => {} });
  useEffect(() => {
    act.current = {
      toggle: togglePlay,
      next: () => go(position + 1),
      prev: () => go(position - 1),
      nOver: () => { const e = overEnds.find(v => v > position); go(e ?? balls.length); },
      pOver: () => { const e = [...overEnds].reverse().find(v => v < position); go(e ?? 0); },
      full: () => { void toggleFullScreen(); },
      mute: () => setMuted(m => !m),
    };
  });

  /* ---------------- effects ---------------- */
  useEffect(() => {
    setPosition(0); setPlaying(false); setSpeed(DEFAULT_SPEED); setViewInnings('live'); setTab('all'); fxPos.current = 0;
  }, [match.id, open]);

  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (document.fullscreenElement) void document.exitFullscreen(); else onClose(); return; }
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === ' ') { if (tag === 'BUTTON') return; e.preventDefault(); act.current.toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); if (e.shiftKey) act.current.nOver(); else act.current.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (e.shiftKey) act.current.pOver(); else act.current.prev(); }
      else if (e.key === 'f' || e.key === 'F') act.current.full();
      else if (e.key === 'm' || e.key === 'M') act.current.mute();
    };
    window.addEventListener('keydown', key);
    const fs = () => setFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fs);
    return () => { document.body.style.overflow = old; window.removeEventListener('keydown', key); document.removeEventListener('fullscreenchange', fs); };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !playing || !balls.length) return;
    if (position >= balls.length) { setPlaying(false); return; }
    const cur = position ? balls[position - 1] : undefined;
    let base = !cur ? 1500 : cur.wicket ? 3700 : cur.runs === 6 ? 3500 : cur.runs === 4 ? 3100 : cur.runs >= 2 ? 2300 : 1950;
    if (position === firstLength && firstLength > 0) base = 4600;
    if (mode === 'highlights') base = Math.max(base, 2800);
    const t = window.setTimeout(stepForward, Math.min(base, position === firstLength ? 1800 : 1000) / speed);
    return () => window.clearTimeout(t);
  }, [open, playing, position, speed, mode, balls, firstLength, stepForward]);

  // sound effects + optional voice commentary when a new ball is revealed
  useEffect(() => {
    if (!open || fxPos.current === position) return;
    fxPos.current = position;
    const ball = position > 0 ? balls[position - 1] : undefined;
    const fire = playing || manualRef.current;
    manualRef.current = false;
    if (!ball || !fire) return;
    if (!muted && volume > 0 && audioRef.current) playSfx(audioRef.current, ballTag(ball), volume / 100);
    if (voice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(commentaryFor(ball, lang).speak);
      u.lang = lang === 'bn' ? 'bn-BD' : 'en-IN';
      u.rate = Math.min(1.8, 1 + (speed - 1) * 0.25);
      u.volume = muted ? 0 : volume / 100;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  }, [open, position, balls, playing, muted, volume, voice, lang, speed]);

  useEffect(() => {
    if (!voice && typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [voice]);

  useEffect(() => () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    void audioRef.current?.close();
    audioRef.current = null;
  }, []);

  if (!open) return null;

  /* ---------------- derived view data ---------------- */
  const ended = balls.length > 0 && position >= balls.length;
  const idx = live.inningsIndex;
  const innings = match.innings[idx];
  const cur = live.current;
  const atBreak = !ended && firstLength > 0 && position === firstLength;
  const chasing = idx === 1 && position > firstLength;
  const target = match.innings[0].total + 1;
  const cm = cur ? commentaryFor(cur, lang) : undefined;
  const tag = cur ? ballTag(cur) : undefined;
  const striker: LiveBatter | undefined = live.batters[live.strikerIndex];
  const activeBowler = live.bowlers.find(b => b.active);
  const thisOver = live.overList.length ? live.overList[live.overList.length - 1] : undefined;

  const teamScore = (i: 0 | 1) => {
    const inn = match.innings[i];
    if (ended || i < idx || (i === 0 && position >= firstLength && firstLength > 0)) return { text: `${inn.total}/${inn.wickets}`, overs: inn.overs };
    if (i > idx) return { text: '0/0', overs: '0.0' };
    return { text: `${live.score}/${live.wickets}`, overs: live.oversText };
  };
  const s0 = teamScore(0);
  const s1 = teamScore(1);

  const heroTitle = ended ? match.result || 'MATCH COMPLETE'
    : atBreak ? 'INNINGS BREAK'
    : chasing ? `${innings.team} NEED ${live.need} FROM ${live.ballsLeft} BALLS`
    : 'FCL VIRTUAL REPLAY';
  const heroSub = ended ? `TARGET ${target}`
    : atBreak ? `TARGET ${target}`
    : chasing ? `TARGET ${target} · REQ. RATE ${live.rrr !== null ? two(live.rrr) : '—'}`
    : position === 0 ? 'PRESS PLAY TO START' : `1ST INNINGS · RUN RATE ${two(live.crr)}`;

  const batterLine = (b?: LiveBatter) => (b ? `${b.runs} (${b.balls}) · ${b.fours}×4 · ${b.sixes}×6 · SR ${b.sr.toFixed(0)}` : 'BATTING');
  const squadOf = (team: string, i: number) => {
    const found = match.squads?.[team.toUpperCase()];
    return found?.length ? found : match.innings[i].batters.map(b => b.name.replace(/\*$/, ''));
  };
  const posOf = (b: ReplayBall) => (b.inningsIndex === 0 ? 0 : firstLength) + b.ballInInnings;
  const badgeClass = (b: string) => (b === '4' ? styles.badge4 : b === '6' ? styles.badge6 : styles.badgeW);

  const feedBalls = live.overList.flatMap(o => o.balls);
  const keyFeed = feedBalls.filter(isKey).reverse();
  const top = (i: 0 | 1) => {
    const f = finals[i];
    const bat = [...f.batters].sort((a, b) => b.runs - a.runs)[0];
    const bowl = [...f.bowlers].sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];
    return { bat, bowl };
  };

  const eventClass = !cur ? '' : tag === 'wicket' ? styles.wicket : tag === 'six' ? styles.six : tag === 'four' ? styles.four : styles.other;
  const burstClass = tag === 'six' ? styles.burstSix : tag === 'four' ? styles.burstFour : tag === 'wicket' ? styles.burstWicket : '';

  const stadiumView = (
    <div className={`${styles.stadium} ${tag === 'six' ? styles.stadiumSix : ''}`}>
            <div className={styles.stadiumPhoto} role="img" aria-label="Photographic night cricket stadium background" />
            <div className={styles.stadiumShade} />
            <div className={styles.stadiumScan} />
            {burstClass && <div key={`burst-${position}`} className={`${styles.burst} ${burstClass}`} />}
            <span className={styles.replayLabel}><span className={styles.liveDot} /> REPLAY · FCL LIVE TV</span>
            <span className={styles.simulatedLabel}>VIRTUAL BROADCAST · NOT LIVE FOOTAGE</span>
            <div className={styles.stageScore}>
              <span>{innings.team}</span><strong>{live.score}/{live.wickets}</strong><small>{live.oversText} OVERS · RR {two(live.crr)}</small>
            </div>

            {position === 0 && <div className={styles.introCard}>
              <span>FCL NATIONAL CRICKET GROUND</span>
              <strong>{match.innings[0].team} VS {match.innings[1].team}</strong>
              <small>PRESS PLAY TO START THE VIRTUAL REPLAY</small>
            </div>}

            {position > 0 && cur && <div key={`event-${position}`} className={`${styles.eventFlash} ${eventClass}`}>
              <span className={styles.eventMeta}>BALL {cur.over} · {cm?.lead}</span>
              <strong>{cm?.big}</strong>
              
            </div>}

            {atBreak && <div className={styles.breakCard}>
              <b>INNINGS BREAK</b>
              <strong>{match.innings[0].team} {match.innings[0].total}/{match.innings[0].wickets}</strong>
              <span>{match.innings[1].team} NEED {target} TO WIN</span>
            </div>}

            {ended && <div className={styles.endOverlay}>
              <b>🏆 MATCH COMPLETE</b>
              <strong>{match.result || 'Match finished'}</strong>
              <div className={styles.endGrid}>
                {([0, 1] as const).map(i => { const t = top(i); return <div key={i}>
                  <span>{match.innings[i].team}</span>
                  {t.bat && <p>🏏 {t.bat.name.replace(/\*$/, '')} <b>{t.bat.runs}</b> ({t.bat.balls})</p>}
                  {t.bowl && <p>🎯 {t.bowl.name} <b>{t.bowl.wickets}/{t.bowl.runs}</b> ({t.bowl.overs})</p>}
                </div>; })}
              </div>
              <small>FINAL RESULT · FCL VIRTUAL TV</small>
            </div>}

            <div className={styles.broadcastLower}>
              <div className={styles.broadcastBat}>
                <span>ON STRIKE{cur?.wicket ? ' · OUT' : ''}</span>
                <b>{striker?.name.replace(/\*$/, '') || '—'}</b>
                <small>{batterLine(striker)}</small>
              </div>
              <div className={styles.broadcastMiddle}>
                <span>{chasing ? 'RUNS TO WIN' : 'CURRENT SCORE'}</span>
                <b>{chasing ? live.need : `${live.score}/${live.wickets}`}</b>
              </div>
              <div className={styles.broadcastBowl}>
                <span>BOWLER</span>
                <b>{live.bowlerName}</b>
                <small>{activeBowler ? `${activeBowler.overs} OV · ${activeBowler.runs} R · ${activeBowler.wickets} W · ECON ${two(activeBowler.economy)}` : 'READY TO BOWL'}</small>
              </div>
            </div>
          </div>
  );

  return <div className={styles.overlay} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section ref={boxRef} className={`${styles.modal} ${theme === 'light' ? styles.light : ''}`} role="dialog" aria-modal="true" aria-label={`${match.title || 'Cricket'} Virtual TV`}>
      <header className={styles.head}>
        <div className={styles.brand}><img src="/fcl-logo.png" alt="FCL official logo" /><span>FCL <em>LIVE TV</em></span></div>
        <div className={styles.matchHeading}><span className={styles.ribbon}>SPECIAL CRICKET MATCH</span><strong>{match.title || `${match.innings[0].team} vs ${match.innings[1].team}`}</strong></div>
        <div className={styles.headActions}><button type="button" className={styles.iconBtn} onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '☾ Dark' : '☀ Light'}</button><span className={styles.live}><span className={styles.dot} /> VIRTUAL LIVE</span><button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close TV">✕</button></div>
      </header>

      <div className={styles.scoreHero}>
        <div className={`${styles.heroTeam} ${idx === 0 && !ended && !atBreak ? styles.heroOn : ''}`}>
          <span className={styles.teamIcon}>🏏</span>
          <div><span>{match.innings[0].team}</span><strong>{s0.text} <small>({s0.overs} Ov)</small></strong></div>
        </div>
        <div className={styles.heroCenter}>
          <strong>{heroTitle}</strong>
          <span>{heroSub}</span>
        </div>
        <div className={`${styles.heroTeam} ${idx === 1 && chasing && !ended ? styles.heroOn : ''}`}>
          <span className={styles.teamIcon}>🏏</span>
          <div><span>{match.innings[1].team}</span><strong>{s1.text} <small>({s1.overs} Ov)</small></strong></div>
        </div>
      </div>

      <div className={styles.infoBar}>
        <span>🏆 {match.format || 'CRICKET'}</span><span>🏟️ {match.venue || 'FCL National Cricket Ground'}</span><span>📅 {dateText(match.date)}</span>
        {match.startTime && <span>⏰ {match.startTime}</span>}
        <span>🎬 {simulated ? 'SIMULATED REPLAY' : 'OFFICIAL BALL-BY-BALL'}</span>
      </div>

      <div className={styles.mobileStage}>{stadiumView}</div>
      <nav className={styles.mobileNav} aria-label="Replay details">
        <button type="button" onClick={() => jumpToPanel(commentaryRef.current)}>🎙 Commentary</button>
        <button type="button" onClick={() => jumpToPanel(scorecardRef.current)}>▤ Scorecard</button>
        <button type="button" onClick={() => jumpToPanel(squadsRef.current)}>🏏 Squads</button>
      </nav>
      <div className={styles.mainGrid}>
        <aside ref={squadsRef} className={styles.squads}>
          {match.innings.map((inn, i) => <section className={styles.panel} key={inn.team}>
            <h3>🏏 {inn.team} SQUAD</h3>
            <ol>{squadOf(inn.team, i).map((name, j) => {
              const isStriker = i === idx && !ended && !!striker && sameName(name, striker.name);
              const isBowler = i !== idx && !ended && position > 0 && sameName(name, live.bowlerName);
              return <li key={`${name}-${j}`} className={isStriker || isBowler ? styles.squadActive : ''}>{name}{isStriker && <em>🏏 BATTING</em>}{isBowler && <em>🎯 BOWLING</em>}</li>;
            })}</ol>
          </section>)}
        </aside>

        <main className={styles.center}>
          <div className={styles.desktopStage}>{stadiumView}</div>

          <div className={styles.overTracker}>
            <span className={styles.overLabel}>THIS OVER{thisOver ? ` · ${thisOver.index + 1}` : ''}</span>
            <div className={styles.chips}>
              {thisOver ? thisOver.balls.map(b => <i key={b.ballInInnings} className={`${styles.chip} ${chipClass(ballTag(b))}`}>{chipLabel(b)}</i>) : <em>—</em>}
            </div>
            <span className={styles.overRuns}>{thisOver ? `${thisOver.runs} RUNS` : ''}</span>
          </div>

          <div className={styles.fieldInfo}>
            <div><span>🏏 CURRENT BATTER</span><b>{striker?.name.replace(/\*$/, '') || '—'}</b><small>{striker ? batterLine(striker) : idx === 0 ? '1ST INNINGS' : '2ND INNINGS'}</small></div>
            <div><span>🎯 BOWLER</span><b>{live.bowlerName}</b><small>Ball {live.legalBalls} of {limit * 6} · {activeBowler ? `${activeBowler.runs}/${activeBowler.wickets}` : '0/0'}</small></div>
            <div><span>⚡ LAST DELIVERY</span><b>{cm?.big || 'READY'}</b><small>{cur?.over || '0.0'} Ov{cur ? ` · ${cur.score}/${cur.wickets}` : ''}</small></div>
          </div>

          <div className={styles.ticker}><span>▶</span>{ended ? (match.result || 'Match finished')
            : position === 0 ? 'Welcome to FCL LIVE TV — press Play to start the replay'
            : `${striker?.name.replace(/\*$/, '') || ''} • ${cm?.big} • ${innings.team} ${live.score}/${live.wickets}${chasing ? ` • NEED ${live.need} FROM ${live.ballsLeft}` : ''}`}</div>

          <section ref={scorecardRef} className={`${styles.panel} ${styles.scorecard}`}>
            <h3>📋 LIVE SCORECARD
              <span className={styles.viewSwitch}>
                {(['live', 0, 1] as ViewInnings[]).map(v => <button type="button" key={String(v)} className={viewInnings === v ? styles.tabOn : ''} onClick={() => setViewInnings(v)}>{v === 'live' ? 'LIVE' : v === 0 ? 'INN 1' : 'INN 2'}</button>)}
              </span>
            </h3>
            <div className={styles.tabs}>
              {(['all', 'bat', 'bowl', 'fow'] as ScoreTab[]).map(t => <button type="button" key={t} className={tab === t ? styles.tabOn : ''} onClick={() => setTab(t)}>{t === 'all' ? 'FULL SCORECARD' : t === 'bat' ? 'BATTING' : t === 'bowl' ? 'BOWLING' : 'FALL OF WICKETS'}</button>)}
              <b>{shown.team} {shown.score}/{shown.wickets} ({shown.oversText})</b>
            </div>
            <div className={styles.tableWrap}>
              {(tab === 'all' || tab === 'bat') && <table className={styles.table}>
                <thead><tr><th>BATTER</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead>
                <tbody>
                  {shown.batters.map(b => <tr key={b.index} className={`${b.status === 'out' ? styles.rowOut : ''} ${b.status === 'yet' ? styles.rowYet : ''} ${b.onStrike && b.status !== 'yet' && shown.inningsIndex === idx && !ended ? styles.rowActive : ''}`}>
                    <td>{b.name.replace(/\*$/, '')}{b.status === 'out' && <small>OUT</small>}{b.status === 'batting' && b.onStrike && shown.inningsIndex === idx && !ended && <small className={styles.live2}>BATTING</small>}{b.status === 'yet' && <small>YET TO BAT</small>}</td>
                    <td><b>{b.runs}</b></td><td>{b.balls}</td><td>{b.fours}</td><td>{b.sixes}</td><td>{b.status === 'yet' ? '—' : b.sr.toFixed(1)}</td>
                  </tr>)}
                  <tr className={styles.rowTotal}><td>EXTRAS</td><td colSpan={5}>{shown.extras}</td></tr>
                  <tr className={styles.rowTotal}><td>TOTAL</td><td colSpan={5}><b>{shown.score}/{shown.wickets}</b> ({shown.oversText} ov) · RR {two(shown.crr)}</td></tr>
                </tbody>
              </table>}
              {(tab === 'all' || tab === 'bowl') && <table className={styles.table}>
                <thead><tr><th>BOWLER</th><th>O</th><th>R</th><th>W</th><th>ECON</th></tr></thead>
                <tbody>
                  {shown.bowlers.length ? shown.bowlers.map(b => <tr key={b.name} className={b.active && shown.inningsIndex === idx && !ended ? styles.rowActive : ''}>
                    <td>{b.name}</td><td>{b.overs}</td><td>{b.runs}</td><td><b>{b.wickets}</b></td><td>{two(b.economy)}</td>
                  </tr>) : <tr><td colSpan={5} className={styles.muted}>Bowling figures appear once play starts.</td></tr>}
                </tbody>
              </table>}
              {(tab === 'all' || tab === 'fow') && <table className={styles.table}>
                <thead><tr><th>WICKET</th><th>BATTER</th><th>SCORE</th><th>OVER</th></tr></thead>
                <tbody>
                  {shown.fow.length ? shown.fow.map(f => <tr key={f.wicketNo}><td>{f.wicketNo}</td><td>{f.batter.replace(/\*$/, '')}</td><td><b>{f.score}/{f.wicketNo}</b></td><td>{f.over}</td></tr>)
                    : <tr><td colSpan={4} className={styles.muted}>No wickets have fallen yet.</td></tr>}
                </tbody>
              </table>}
            </div>
          </section>
          {ended && <section className={styles.panel}><h3>FINAL MATCH SUMMARY</h3><p className={styles.muted}>{match.result}</p>{match.innings.map((inn,i)=><div key={i} className={styles.finalCard}><h3>{inn.team} · {inn.total}/{inn.wickets} ({inn.overs})</h3><table className={styles.table}><thead><tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th></tr></thead><tbody>{inn.batters.map((b,j)=><tr key={j}><td>{b.name}</td><td>{b.runs}</td><td>{b.balls}</td><td>{b.fours}</td><td>{b.sixes}</td></tr>)}</tbody></table><table className={styles.table}><thead><tr><th>Bowler</th><th>O</th><th>R</th><th>W</th></tr></thead><tbody>{(inn.bowlingFigures ?? finals[i].bowlers).map((b,j)=><tr key={j}><td>{b.name}</td><td>{b.overs}</td><td>{b.runs}</td><td>{b.wickets}</td></tr>)}</tbody></table><p className={styles.muted}>Fall of wickets: {(inn.fallOfWickets ?? finals[i].fow).map(f=>`${f.score} (${f.batter}, ${f.over})`).join(' · ')}</p></div>)}<p className={styles.muted}>MOM: {match.mom?.name ?? '—'} · CPOM: {match.cpom?.name ?? '—'}</p></section>}
        </main>

        <aside className={styles.right}>
          <section ref={commentaryRef} className={`${styles.panel} ${styles.feedPanel}`}>
            <h3>
              <span>🎙️ BALL-BY-BALL COMMENTARY</span>
              <span className={styles.langSwitch}>
                <button type="button" className={lang === 'en' ? styles.tabOn : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button>
                <button type="button" className={lang === 'bn' ? styles.tabOn : ''} onClick={() => setLang('bn')} aria-pressed={lang === 'bn'}>বাংলা</button>
              </span>
            </h3>
            <div className={styles.feedTabs}>
              <button type="button" className={feedFilter === 'all' ? styles.tabOn : ''} onClick={() => setFeedFilter('all')}>ALL BALLS</button>
              <button type="button" className={feedFilter === 'key' ? styles.tabOn : ''} onClick={() => setFeedFilter('key')}>⭐ KEY MOMENTS</button>
              <small>{innings.team}</small>
            </div>
            <div className={styles.feed} role="log" aria-live="off">
              {!feedBalls.length && <p className={styles.muted}>Press Play — every delivery will appear here with the bowler, the batter and the result.</p>}
              {feedFilter === 'all' && [...live.overList].reverse().map(o => <div className={styles.overGroup} key={o.index}>
                {[...o.balls].reverse().map(b => {
                  const c = commentaryFor(b, lang);
                  const isNew = cur === b;
                  return <button type="button" key={b.ballInInnings} className={`${styles.ballRow} ${isNew ? styles.ballNew : ''}`} onClick={() => go(posOf(b), false)}>
                    <span className={styles.ballNo}><b>{b.over}</b>{c.badge && <i className={`${styles.badge} ${badgeClass(c.badge)}`}>{c.badge}</i>}</span>
                    <span className={styles.ballText}>{c.lead}, <b className={c.badge ? styles.hot : ''}>{c.headline}</b>, {c.detail}</span>
                  </button>;
                })}
                <div className={styles.overCard}>
                  <b>Over {o.index + 1}</b>
                  <span className={styles.overScore}>{o.scoreAfter}-{o.wicketsAfter}</span>
                  <span className={styles.chips}>{o.balls.map(b => <i key={b.ballInInnings} className={`${styles.chip} ${styles.chipSm} ${chipClass(ballTag(b))}`}>{chipLabel(b)}</i>)}</span>
                  <em>({o.runs} runs)</em>
                  <small>{o.bowler}</small>
                </div>
              </div>)}
              {feedFilter === 'key' && (keyFeed.length ? keyFeed.map(b => {
                const c = commentaryFor(b, lang);
                return <button type="button" key={b.ballInInnings} className={styles.ballRow} onClick={() => go(posOf(b), false)}>
                  <span className={styles.ballNo}><b>{b.over}</b>{c.badge && <i className={`${styles.badge} ${badgeClass(c.badge)}`}>{c.badge}</i>}</span>
                  <span className={styles.ballText}>{c.lead}, <b className={styles.hot}>{c.headline}</b>, {c.detail}</span>
                </button>;
              }) : feedBalls.length ? <p className={styles.muted}>No boundaries or wickets yet in this innings.</p> : null)}
            </div>
            {simulated && <p className={styles.feedNote}>ⓘ Delivery order and bowling allocation are estimated; compare with the recorded scorecard.</p>}
          </section>

          <section className={styles.panel}>
            <h3>📈 RUN PROGRESSION</h3>
            <svg className={styles.worm} viewBox={`0 0 ${worm.W} ${worm.H}`} role="img" aria-label="Run progression chart">
              {worm.yTicks.map(t => <g key={`y${t}`}><line x1={worm.L} x2={worm.W - worm.R} y1={worm.y(t)} y2={worm.y(t)} className={styles.grid} /><text x={worm.L - 4} y={worm.y(t) + 3} className={styles.axis} textAnchor="end">{t}</text></g>)}
              {worm.xTicks.map(o => <text key={`x${o}`} x={worm.x(o * 6)} y={worm.H - 6} className={styles.axis} textAnchor="middle">{o}</text>)}
              <line x1={worm.L} x2={worm.W - worm.R} y1={worm.targetY} y2={worm.targetY} className={styles.targetLine} />
              <text x={worm.W - worm.R} y={worm.targetY - 3} className={styles.axisGold} textAnchor="end">TARGET {worm.target}</text>
              <polyline points={worm.lines[0]} className={styles.lineA} />
              <polyline points={worm.lines[1]} className={styles.lineB} />
              {worm.wk.map((w, i) => <circle key={i} cx={w.cx} cy={w.cy} r={3.2} className={styles.wkDot} />)}
            </svg>
            <p className={styles.legend}><span className={styles.keyA} />{match.innings[0].team} <span className={styles.keyB} />{match.innings[1].team} <span className={styles.keyW} />Wicket</p>
          </section>

          <section className={styles.panel}>
            <h3>▥ INNINGS SUMMARY</h3>
            {match.innings.map((inn, i) => <button type="button" className={styles.summaryRow} key={i} onClick={() => go(i === 0 ? 0 : firstLength, false)}><span>{inn.team}</span><strong>{inn.total}/{inn.wickets}</strong><small>{inn.overs} Ov</small></button>)}
            <p className={styles.target}>🎯 Target: {target}</p>
          </section>

          {ended && <section className={`${styles.panel} ${styles.awardPanel}`}>
            <h3>🏆 POST-MATCH AWARDS</h3>
            <p>🏅 MOM: <strong>{match.mom?.name || 'Not provided in summary'}</strong> {match.mom?.impact && <small>{match.mom.impact}</small>}</p>
            <p>⭐ CPOM: <strong>{match.cpom?.name || 'Not provided in summary'}</strong> {match.cpom?.impact && <small>{match.cpom.impact}</small>}</p>
          </section>}
        </aside>
        <p className={`${styles.disclaimer} ${styles.mobileDisclaimer}`}>ⓘ Virtual reconstruction, not real footage. Delivery order, bowling allocation and shot descriptions may differ from recorded figures. Crowd sound is synthesised.</p>
      </div>

      <footer className={styles.controls}>
        <div className={styles.timeLine}>
          <b>OVER {live.oversText} · BALL {position}/{balls.length}</b>
          <div className={styles.sliderWrap}>
            <input type="range" min={0} max={balls.length} value={position} onChange={e => go(Number(e.target.value), false)} aria-label="Replay timeline" />
            <div className={styles.marks} aria-hidden>
              {balls.map((b, i) => isKey(b) ? <i key={i} className={b.wicket ? styles.markW : b.runs === 6 ? styles.mark6 : styles.mark4} style={{ left: `${((i + 1) / balls.length) * 100}%` }} /> : null)}
              {firstLength > 0 && firstLength < balls.length && <i className={styles.markBreak} style={{ left: `${(firstLength / balls.length) * 100}%` }} />}
            </div>
          </div>
          <b className={styles.keyCount}>⭐ {keyIdx.length}</b>
        </div>
        <div className={styles.controlButtons}>
          <button type="button" onClick={() => go(0, false)} title="Restart">↺ Restart</button>
          <button type="button" onClick={prevOver} title="Previous over (Shift+←)">⏮ Over</button>
          <button type="button" onClick={() => go(position - 1)} title="Previous ball (←)">◀ Ball</button>
          <button type="button" className={styles.primary} onClick={togglePlay} disabled={!balls.length} title="Play / pause (Space)">{playing ? '❚❚ Pause' : '▶ Play'}</button>
          <button type="button" onClick={() => go(position + 1)} title="Next ball (→)">Ball ▶</button>
          <button type="button" onClick={nextOver} title="Next over (Shift+→)">Over ⏭</button>
          <button type="button" onClick={prevKey} title="Previous highlight">⭐◀</button>
          <button type="button" onClick={nextKey} title="Next highlight">⭐▶</button>
          <div className={styles.speed}><span>Speed</span>{SPEEDS.map(s => <button type="button" className={speed === s ? styles.chosen : ''} key={s} onClick={() => setSpeed(s)}>{s === DEFAULT_SPEED ? s.toFixed(2) : s}×</button>)}</div>
          <div className={styles.speed}>
            <button type="button" className={mode === 'full' ? styles.chosen : ''} onClick={() => setMode('full')} title="Every ball">FULL</button>
            <button type="button" className={mode === 'highlights' ? styles.chosen : ''} onClick={() => setMode('highlights')} title="Only 4s, 6s and wickets">⭐ HIGHLIGHTS</button>
          </div>
          <button type="button" className={voice ? styles.chosen : ''} onClick={() => setVoice(v => !v)} aria-pressed={voice} title="Read commentary aloud">🎙 Voice</button>
          <label className={styles.volume}>
            <button type="button" onClick={() => { ensureAudio(); setMuted(m => !m); }} title="Mute (M)" aria-label="Toggle sound">{muted || volume === 0 ? '🔇' : '🔉'}</button>
            <input type="range" min={0} max={100} value={volume} onChange={e => { ensureAudio(); setVolume(Number(e.target.value)); setMuted(false); }} aria-label="Volume" />
          </label>
          <button type="button" onClick={toggleFullScreen} title="Fullscreen (F)">{fullScreen ? '⤢ Exit' : '⛶ Full'}</button>
        </div>
      </footer>
      <p className={`${styles.disclaimer} ${styles.desktopDisclaimer}`}>ⓘ Virtual reconstruction using the match summary: delivery order, bowling allocation and shot descriptions are generated and may differ from recorded figures. Crowd sound is synthesised, background is illustrative photography, no real player footage. Shortcuts: Space play/pause · ←/→ ball · Shift+←/→ over · F fullscreen · M mute.</p>
    </section>
  </div>;
}
