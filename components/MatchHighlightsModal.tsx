'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReplayMatch, ReplayBall } from '../lib/matchReplay';
import { buildReplayBalls } from '../lib/matchReplay';
import styles from './MatchHighlightsModal.module.css';

export type MatchHighlightsModalProps = {
  match: ReplayMatch;
  open: boolean;
  onClose: () => void;
};

function drawGround(canvas: HTMLCanvasElement, ball?: ReplayBall, phase = 0) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const grad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * .6);
  grad.addColorStop(0, '#2b995c'); grad.addColorStop(1, '#06342f');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w * .42, h * .43, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#e9e6c7'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#c5a778'; ctx.fillRect(w / 2 - 27, 115, 54, h - 230);
  const person = (x: number, y: number, jersey: string, bat = false) => {
    ctx.fillStyle = '#d4a281'; ctx.beginPath(); ctx.arc(x, y - 26, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = jersey; ctx.fillRect(x - 11, y - 16, 22, 32);
    ctx.strokeStyle = '#f4f7f9'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x - 6, y + 16); ctx.lineTo(x - 13, y + 37);
    ctx.moveTo(x + 6, y + 16); ctx.lineTo(x + 13, y + 37); ctx.stroke();
    if (bat) { ctx.strokeStyle = '#f0c783'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x + 10, y - 3); ctx.lineTo(x + 35 + phase * 14, y - 56); ctx.stroke(); }
  };
  person(w / 2 - 8, 160 + 38 * Math.min(phase, 1), '#3d9dea');
  person(w / 2 + 14, h - 165, '#ef5f58', true);
  person(w / 2 + 65, 215, '#3d9dea');
  for (const [x,y] of [[130,120],[190,360],[w-130,140],[w-190,350]] as [number,number][]) person(x,y,'#3d9dea');
  if (ball) {
    const p = Math.max(0, Math.min(1, phase));
    const startX = w / 2, startY = 210;
    let x = startX, y = startY + p * (h - 370);
    if (p > .48) {
      const hit = (p - .48) / .52;
      const distance = ball.wicket ? 65 : ball.runs >= 4 ? 290 : ball.runs > 0 ? 165 : 28;
      x = w/2 + Math.cos(ball.ballInInnings * 2.3) * distance * hit;
      y = h - 155 - Math.sin(ball.ballInInnings * 2.3) * distance * hit - 75 * Math.sin(Math.PI * hit);
    }
    ctx.fillStyle = '#fffaf3'; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI*2); ctx.fill();
  }
  ctx.fillStyle = '#071724c7'; ctx.fillRect(0, h-55, w, 55);
  ctx.fillStyle = '#d8edff'; ctx.font = 'bold 17px Arial'; ctx.textAlign = 'center';
  ctx.fillText('FCL NATIONAL CRICKET GROUND  •  SIMULATED REPLAY', w/2, h-21);
}

const outcome = (b?: ReplayBall) => !b ? 'READY' : b.wicket ? 'WICKET!' : b.runs === 6 ? 'SIX!' : b.runs === 4 ? 'FOUR!' : b.runs === 0 ? 'DOT BALL' : `${b.runs} RUN${b.runs !== 1 ? 'S' : ''}`;

export default function MatchHighlightsModal({ match, open, onClose }: MatchHighlightsModalProps) {
  const balls = useMemo(() => buildReplayBalls(match), [match]);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latest = useRef({ position, playing, speed });
  latest.current = { position, playing, speed };

  useEffect(() => { setPosition(0); setPlaying(false); setSpeed(1); }, [match.id, open]);
  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  // Rendering and time updates stay in one animation loop, without interval leaks.
  useEffect(() => {
    if (!open) return;
    let raf = 0, previous = 0, elapsed = 0, phaseStart = performance.now();
    const frame = (now: number) => {
      const { position: pos, playing: active, speed: multiplier } = latest.current;
      const dt = Math.min(100, previous ? now-previous : 0);
      previous = now;
      if (active) {
        elapsed += dt * multiplier;
        if (elapsed >= 1900) {
          elapsed %= 1900;
          if (pos < balls.length) {
            setPosition(pos+1);
            phaseStart = now;
          } else setPlaying(false);
        }
      }
      drawGround(canvasRef.current!, balls[Math.max(0, Math.min(pos-1, balls.length-1))], Math.min((now-phaseStart)/1250, 1));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [open, balls]);

  const current = position ? balls[position-1] : undefined;
  const firstLength = balls.filter(b => b.inningsIndex === 0).length;
  const inningsIndex = position > firstLength ? 1 : 0;
  const innings = match.innings[inningsIndex];
  const countInInnings = inningsIndex === 0 ? position : position - firstLength;
  const innBall = current?.inningsIndex === inningsIndex ? current : undefined;
  const nextBall = balls[Math.min(position, balls.length-1)];
  const previewBatter = innBall?.batter || (nextBall?.inningsIndex === inningsIndex ? nextBall.batter : innings.batters[0]?.name || '—');
  const progress = balls.length ? position/balls.length : 0;
  const duration = Math.round(progress*1800);
  const time = `${String(Math.floor(duration/60)).padStart(2, '0')}:${String(duration%60).padStart(2,'0')}`;
  const seek = (p: number) => { setPlaying(false); setPosition(Math.max(0, Math.min(p, balls.length))); };
  if (!open) return null;

  return (
    <div className={styles.overlay} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-label={`${match.title || match.innings.map(i=>i.team).join(' vs ')} Highlights`}>
        <header className={styles.header}>
          <div><strong>🏏 FCL VIRTUAL TV</strong><small>{match.title || match.innings.map(i=>i.team).join(' VS ')} · {match.date || ''}</small></div>
          <button className={styles.close} onClick={onClose} aria-label="Close highlights">✕</button>
        </header>
        <div className={styles.content}>
          <div className={styles.watch}>
            <div className={styles.screen}>
              <canvas ref={canvasRef} width={960} height={540} aria-label="Animated virtual cricket stadium" />
              <div className={styles.tvLogo}>● FCL SPORTS · REPLAY</div>
              <div className={styles.clock}>{time} / 30:00</div>
              <div className={styles.scoreStrip}>
                <span><b>{innings.team}</b>　{innBall?.score ?? 0}/{innBall?.wickets ?? 0} ({Math.floor(countInInnings/6)}.{countInInnings%6})</span>
                <strong>{outcome(current)}</strong>
              </div>
            </div>
            <div className={styles.controls}>
              <input aria-label="Match replay timeline" type="range" min={0} max={Math.max(0,balls.length)} value={position} onChange={e=>seek(Number(e.target.value))} />
              <div className={styles.actions}>
                <button onClick={()=>seek(0)}>↺ Restart</button>
                <button onClick={()=>seek(position-1)}>◀ Ball</button>
                <button className={styles.primary} onClick={()=>{ if (position >= balls.length) setPosition(0); setPlaying(p=>!p); }} disabled={!balls.length}>{playing ? '❚❚ Pause' : '▶ Play'}</button>
                <button onClick={()=>seek(position+1)}>Ball ▶</button>
                <button onClick={()=>setSpeed(s=>s===1?2:s===2?4:1)}>{speed}× Speed</button>
              </div>
            </div>
            <p className={styles.notice}>⚠️ Virtual reconstruction, not actual match footage. When ball-by-ball data is missing, delivery order and on-field action are illustrative. The 30:00 indicator is a simulated TV timeline, not a recorded 30-minute film.</p>
          </div>
          <aside className={styles.side}>
            <h3>MATCH SCORECARD</h3>
            {match.innings.map((inn, i)=><button key={`${inn.team}-${i}`} className={`${styles.inning} ${i===inningsIndex?styles.selected:''}`} onClick={()=>seek(i===0?0:firstLength)}>
              <span>{inn.team}</span><strong>{inn.total}/{inn.wickets}</strong><small>{inn.overs} Overs</small>
            </button>)}
            <h3>ON THE FIELD</h3>
            <div className={styles.details}><span>Batter</span><b>{previewBatter}</b><span>Bowler</span><b>{innBall?.bowler || nextBall?.bowler || '—'}</b><span>Delivery</span><b>{current?.over || '0.0'}</b><span>Progress</span><b>{position} / {balls.length} balls</b></div>
            <h3>HIGHLIGHT MOMENTS</h3>
            <div className={styles.events}>{balls.map((b, i)=>(b.wicket || b.runs >= 4) && <button key={i} onClick={()=>seek(i+1)}><span>{b.over} · {b.batter}</span><b>{outcome(b)}</b></button>)}</div>
            <p className={styles.result}>{match.result || `${match.winner || 'Match'} · Replay`}</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
