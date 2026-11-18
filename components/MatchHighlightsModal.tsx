'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReplayBall, ReplayMatch } from '@/lib/matchReplay';
import { buildReplayBalls } from '@/lib/matchReplay';
import styles from './MatchHighlightsModal.module.css';

type Props = { match: ReplayMatch; open: boolean; onClose: () => void };
const timeText = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
const resultText = (b?: ReplayBall) => !b ? 'READY' : b.wicket ? 'WICKET!' : b.runs === 6 ? 'SIX!' : b.runs === 4 ? 'FOUR!' : b.runs === 0 ? 'DOT BALL' : `${b.runs} RUN${b.runs === 1 ? '' : 'S'}`;
function dateText(value?: string) {
  if (!value) return 'Date unavailable';
  const iso = /^\d{4}-\d\d-\d\d(?:T|$)/.test(value);
  const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return `${slash[1].padStart(2,'0')}/${slash[2].padStart(2,'0')}/${slash[3]}`;
  if (!iso) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' }).format(d);
}

export default function MatchHighlightsModal({ match, open, onClose }: Props) {
  const balls = useMemo(()=>buildReplayBalls(match),[match]);
  const firstLength = useMemo(()=>balls.filter(b=>b.inningsIndex===0).length,[balls]);
  const [position,setPosition]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
  const [volume,setVolume]=useState(45),[fullScreen,setFullScreen]=useState(false);
  const boxRef=useRef<HTMLElement>(null);
  useEffect(()=>{setPosition(0);setPlaying(false);setSpeed(1);},[match.id,open]);
  useEffect(()=>{if(!open)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){if(document.fullscreenElement)void document.exitFullscreen();else onClose();}};window.addEventListener('keydown',key);const fs=()=>setFullScreen(!!document.fullscreenElement);document.addEventListener('fullscreenchange',fs);return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',key);document.removeEventListener('fullscreenchange',fs);};},[open,onClose]);
  useEffect(()=>{
    if(!open || !playing || !balls.length) return;
    if(position >= balls.length){setPlaying(false);return;}
    const timer=window.setTimeout(()=>setPosition(p=>Math.min(p+1,balls.length)),2850/speed);
    return ()=>window.clearTimeout(timer);
  },[open,playing,position,speed,balls.length]);
  useEffect(()=>{if(position>=balls.length&&balls.length)setPlaying(false);},[position,balls.length]);
  if(!open)return null;
  const ended=balls.length>0&&position>=balls.length;
  const idx=position>firstLength?1:0;
  const current=position?balls[position-1]:undefined;
  const next=balls[Math.min(position,balls.length-1)];
  const innings=match.innings[idx];
  const count=idx===0?position:position-firstLength;
  const activeBall=current?.inningsIndex===idx?current:undefined;
  const currentBatter=activeBall?.batter||next?.batter||innings.batters[0]?.name||'—';
  const batterStats=innings.batters.find(b=>b.name===currentBatter);
  const inningBalls=idx===0?firstLength:balls.length-firstLength;
  const bowledBalls=idx===0?Math.min(position,firstLength):Math.max(0,position-firstLength);
  const currentOver=`${Math.floor(bowledBalls/6)}.${bowledBalls%6}`;
  const currentBowler=activeBall?.bowler||next?.bowler||'—';
  const moments=balls.map((b,i)=>({b,i})).filter(({b})=>b.wicket||b.runs>=4);
  const visibleMoments=moments.filter(({i})=>i<position);
  const formatSquad=(team:string,index:number)=>match.squads?.[team.toUpperCase()]?.length?match.squads[team.toUpperCase()]:match.innings[index].batters.map(b=>b.name);
  const seek=(n:number)=>{setPlaying(false);setPosition(Math.max(0,Math.min(n,balls.length)));};
  const toggleFullScreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await boxRef.current?.requestFullscreen();}catch{ /* unsupported */ }};
  const score=(i:number)=>{if(ended||position>(i===0?firstLength:balls.length))return `${match.innings[i].total}/${match.innings[i].wickets}`;if(i>idx)return '0/0';if(i<idx)return `${match.innings[i].total}/${match.innings[i].wickets}`;return `${activeBall?.score??0}/${activeBall?.wickets??0}`;};
  const target=match.innings[0].total+1;
  const tvSecs=Math.round(position/Math.max(1,balls.length)*1800);
  const activeScore=idx===0?score(0):score(1);
  const remaining=idx===1?Math.max(0,target-(activeBall?.score??0)):null;
  return <div className={styles.overlay} onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section ref={boxRef} className={styles.modal} role="dialog" aria-modal="true" aria-label={`${match.title||'Cricket'} Virtual TV`}>
      <header className={styles.head}>
        <div className={styles.brand}><img src="/fcl-logo.png" alt="FCL official logo" /><span>FCL <em>LIVE TV</em></span></div>
        <div className={styles.matchHeading}><span className={styles.ribbon}>SPECIAL CRICKET MATCH</span><strong>{match.title||`${match.innings[0].team} vs ${match.innings[1].team}`}</strong></div>
        <div className={styles.headActions}><span className={styles.live}><span/> VIRTUAL LIVE</span><button onClick={onClose} aria-label="Close TV">✕</button></div>
      </header>
      <div className={styles.scoreHero}>
        <div className={styles.heroTeam}>
          <span className={styles.teamIcon}>🏏</span>
          <div><span>{match.innings[0].team}</span><strong>{score(0)} <small>({position>firstLength||ended?match.innings[0].overs:currentOver} Ov)</small></strong></div>
        </div>
        <div className={styles.heroCenter}>
          <strong>{ended?(match.result||'MATCH COMPLETE'):'FCL VIRTUAL REPLAY'}</strong>
          <span>{ended?`TARGET ${target}`:idx===1?`TARGET ${target}`:'MATCH IN PROGRESS'}</span>
        </div>
        <div className={styles.heroTeam}>
          <span className={styles.teamIcon}>🏏</span>
          <div><span>{match.innings[1].team}</span><strong>{score(1)} <small>({position>firstLength||ended?match.innings[1].overs:idx===1?currentOver:'0.0'} Ov)</small></strong></div>
        </div>
      </div>
      <div className={styles.infoBar}><span>🏆 {match.format||'CRICKET'}</span><span>🏟️ {match.venue||'FCL National Cricket Ground'}</span><span>📅 {dateText(match.date)}</span>{match.startTime&&<span>⏰ {match.startTime}</span>}<span>🎬 SIMULATED REPLAY</span></div>
      <div className={styles.mainGrid}>
        <aside className={styles.squads}>{match.innings.map((inn,i)=><section className={styles.panel} key={inn.team}><h3>🏏 {inn.team} SQUAD</h3><ol>{formatSquad(inn.team,i).map((name,j)=><li key={`${name}-${j}`}>{name}</li>)}</ol></section>)}</aside>
        <main className={styles.center}>
          <div className={styles.stadium}>
            <div className={styles.stadiumPhoto} role="img" aria-label="Photographic night cricket stadium background" />
            <div className={styles.stadiumShade} />
            <div className={styles.stadiumScan} />
            <span className={styles.replayLabel}><span className={styles.liveDot}/> REPLAY · FCL LIVE TV</span>
            <span className={styles.simulatedLabel}>VIRTUAL BROADCAST · NOT LIVE FOOTAGE</span>
            <div className={styles.stageScore}>
              <span>{innings.team}</span>
              <strong>{activeScore}</strong>
              <small>{currentOver} OVERS</small>
            </div>
            {position===0 && <div className={styles.introCard}>
              <span>FCL NATIONAL CRICKET GROUND</span>
              <strong>{match.innings[0].team} <i>VS</i> {match.innings[1].team}</strong>
              <small>PRESS PLAY TO START THE VIRTUAL REPLAY</small>
            </div>}
            {position>0 && !ended && <div key={`event-${position}`} className={`${styles.eventFlash} ${current?.wicket?styles.wicket:current?.runs===6?styles.six:styles.other}`}>
              <span className={styles.eventMeta}>BALL {current?.over} · {current?.batter}</span>
              <strong>{resultText(current)}</strong>
              <span className={styles.eventSub}>{current?.commentary || (current?.simulated?'SIMULATED BALL EVENT':'SCORECARD EVENT')}</span>
            </div>}
            {ended && <div className={styles.endOverlay}><b>🏆 MATCH COMPLETE</b><strong>{match.result||'Match finished'}</strong><small>FINAL RESULT · FCL VIRTUAL TV</small></div>}
            <div className={styles.broadcastLower}>
              <div className={styles.broadcastBat}><span>ON STRIKE</span><b>{currentBatter}</b><small>{batterStats?`${batterStats.runs} (${batterStats.balls}) · ${batterStats.fours} FOURS · ${batterStats.sixes} SIXES`:'BATTING'}</small></div>
              <div className={styles.broadcastMiddle}><span>{remaining!==null?'RUNS TO WIN':'CURRENT SCORE'}</span><b>{remaining!==null?remaining:activeScore}</b></div>
              <div className={styles.broadcastBowl}><span>BOWLER</span><b>{currentBowler}</b><small>LAST BALL: {resultText(current)}</small></div>
            </div>
          </div>
          <div className={styles.fieldInfo}><div><span>🏏 CURRENT BATTER</span><b>{currentBatter}</b><small>{batterStats?`${batterStats.runs} (${batterStats.balls}) · 4s ${batterStats.fours} · 6s ${batterStats.sixes}`:idx===0?'1ST INNINGS':'2ND INNINGS'}</small></div><div><span>🎯 BOWLER</span><b>{currentBowler}</b><small>Ball {bowledBalls} of {inningBalls}</small></div><div><span>⚡ LAST DELIVERY</span><b>{resultText(current)}</b><small>{current?.over||'0.0'} Ov</small></div></div>
          <div className={styles.ticker}><span>▶</span>{ended?(match.result||'Match finished'):position===0?'Welcome to FCL LIVE TV — press Play to start the simulated replay':`${currentBatter} • ${resultText(current)} • ${innings.team} ${activeBall?.score??0}/${activeBall?.wickets??0}`}</div>
        </main>
        <aside className={styles.right}>
          <section className={styles.panel}><h3>🎙️ BALL-BY-BALL / COMMENTARY</h3><div className={styles.eventList} aria-live="polite">{visibleMoments.length?visibleMoments.slice(-15).map(({b,i})=><button key={i} onClick={()=>seek(i+1)}><small>{b.over}</small><span>{b.batter} — <b>{resultText(b)}</b></span><em>{b.wicket?'W':b.runs}</em></button>):<p>Press Play to reveal each highlight as the match progresses.</p>}</div></section>
          <section className={styles.panel}><h3>▥ INNINGS SUMMARY</h3>{match.innings.map((inn,i)=><button className={styles.summaryRow} key={i} onClick={()=>seek(i===0?0:firstLength)}><span>{inn.team}</span><strong>{inn.total}/{inn.wickets}</strong><small>{inn.overs} Ov</small></button>)}<p className={styles.target}>🎯 Target: {target}</p></section>
          {ended&&<section className={`${styles.panel} ${styles.awardPanel}`}><h3>🏆 POST-MATCH AWARDS</h3><p>🏅 MOM: <strong>{match.mom?.name||'Not provided in summary'}</strong> {match.mom?.impact&&<small>{match.mom.impact}</small>}</p><p>⭐ CPOM: <strong>{match.cpom?.name||'Not provided in summary'}</strong> {match.cpom?.impact&&<small>{match.cpom.impact}</small>}</p></section>}
        </aside>
      </div>
      <footer className={styles.controls}>
        <div className={styles.timeLine}><b>{timeText(tvSecs)} / 30:00</b><input type="range" min={0} max={balls.length} value={position} onChange={e=>seek(Number(e.target.value))} aria-label="Replay timeline" /></div>
        <div className={styles.controlButtons}><button onClick={()=>seek(0)}>↺ Restart</button><button onClick={()=>seek(position-1)}>◀ Previous Ball</button><button className={styles.primary} onClick={()=>{if(ended)setPosition(0);setPlaying(p=>!p);}} disabled={!balls.length}>{playing?'❚❚ Pause':'▶ Play'}</button><button onClick={()=>seek(position+1)}>Next Ball ▶</button><div className={styles.speed}><span>Speed</span>{[.5,1,2].map(s=><button className={speed===s?styles.chosen:''} key={s} onClick={()=>setSpeed(s)}>{s}×</button>)}</div><label className={styles.volume}>🔉 <input type="range" min={0} max={100} value={volume} onChange={e=>setVolume(Number(e.target.value))} aria-label="Volume (visual control only)" /></label><button onClick={toggleFullScreen}>{fullScreen?'⤢ Exit':'⛶ Full'}</button></div>
      </footer>
      <p className={styles.disclaimer}>ⓘ Virtual reconstruction using match summary. Background is illustrative photography; no real player footage. Unavailable deliveries are simulated. 30:00 is an illustrative timeline; audio is not implemented.</p>
    </section>
  </div>;
}
