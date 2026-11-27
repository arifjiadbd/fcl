'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {CATEGORIES} from './categories';
import styles from './newspaper.module.css';

type Story={id:string;category:string;title:string;author:string;date:string;content:string;imageUrl:string;sourceUrl:string;source:string;newsType:string;portal?:string};
type Row=Record<string,unknown>;
const text=(v:unknown)=>String(v??'').trim();
const read=(r:Row,...keys:string[])=>keys.map(k=>text(r[k])).find(Boolean)||'';
const rows=(v:unknown):Row[]=>Array.isArray(v)?v.filter(x=>x&&typeof x==='object'):[];
function stamp(s:string){if(!s)return 0;if(/^\d{4}$/.test(s))return Date.parse(`${s}-01-01`);if(/^\d{5}(\.\d+)?$/.test(s))return (Number(s)-25569)*86400000;const m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);return (m?Date.parse(`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`):Date.parse(s))||0;}
function dateLabel(s:string){const n=stamp(s);if(!n)return s||'তারিখ পাওয়া যায়নি';if(/^\d{4}$/.test(s))return s;return new Intl.DateTimeFormat('bn-BD',{dateStyle:'medium',timeZone:'Asia/Dhaka'}).format(n);}
function safeLink(s:string){return /^https?:\/\//i.test(s)||(/^\/(?!\/)/.test(s)&&!s.includes('\\'))?s:'';}
function imageLink(s:string){const v=safeLink(s);if(!v)return '';try{const u=new URL(v,'https://example.invalid');if(u.hostname==='drive.google.com'){const id=u.searchParams.get('id')||u.pathname.match(/\/d\/([-\w]+)/)?.[1];return id?`https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200`:'';}}catch{return '';}return v;}
const PLAYER_PHOTO_DIR='/players'; // public folder that holds player photos when a sheet stores only a file name
function playerPhoto(r:Row){const v=read(r,'photoUrl','photo','Photo','Photo URL','imageUrl');if(!v)return '';if(/^https?:\/\//i.test(v)||v.startsWith('/'))return v;if(/^[^\s\\:/]+\.(jpe?g|png|webp|gif|avif)$/i.test(v))return `${PLAYER_PHOTO_DIR}/${encodeURIComponent(v)}`;return v;}
const preview=(s:string)=>s.replace(/\*+/g,'').replace(/\s+/g,' ').trim();
const ordered=(s:Story[])=>[...s].sort((a,b)=>stamp(b.date)-stamp(a.date)||b.id.localeCompare(a.id,undefined,{numeric:true}));
const unique=(s:Story[])=>{const seen=new Set<string>();return s.filter(x=>{const k=x.title.trim().toLowerCase().replace(/\s+/g,' ');if(!k||seen.has(k))return false;seen.add(k);return true;});};
function manual(r:Row,i:number):Story{return {id:`news-${read(r,'rowIndex')||i}`,category:read(r,'category','Category'),title:read(r,'title','Title'),author:read(r,'author','Author')||'FCL News Desk',date:read(r,'date','Date'),content:read(r,'content','Content'),imageUrl:read(r,'imageUrl','ImageUrl'),sourceUrl:read(r,'fbPostUrl','FbPostUrl'),source:'FCL News Desk',newsType:read(r,'newsType','NewsType')||'Normal'};}
function portal(r:Row,i:number,p:string):Story{
 const base={id:`${p}-${read(r,'id','rowIndex')||i}`,author:read(r,'author'),date:read(r,'date','Date','matchYear','Match Year'),imageUrl:read(r,'thumbnail','photo','Photo','Thumbnail / Photo','imageUrl'),newsType:'Normal',portal:p};
 if(p==='matches')return {...base,category:CATEGORIES[0],title:read(r,'matchTitle','title','Match Title'),content:read(r,'summary','Summary'),sourceUrl:'/matches'+(read(r,'id')?`?match=${encodeURIComponent(read(r,'id'))}`:''),source:'Match Directory'};
 if(p==='highVoltage')return {...base,category:CATEGORIES[0],title:read(r,'matchTitle','Match Title'),content:read(r,'description','Description'),sourceUrl:'/thrillers',source:'High Voltage Matches'};
 if(p==='extraordinary')return {...base,category:'অসাধারণ পারফরম্যান্স (Extraordinary Performance)',title:read(r,'performanceTitle','Performance Title'),content:read(r,'description','Description'),author:read(r,'playerName','Player Name'),sourceUrl:'/extraordinary',source:'Extraordinary Performances'};
 return {...base,category:CATEGORIES[10],title:read(r,'title','Title'),content:read(r,'content','Content'),sourceUrl:`/memories?story=${encodeURIComponent(read(r,'id','rowIndex')||String(i))}`,source:'Memories & Adda'};
}
function randomSix(pool:Story[],excluded:Story[],previous:Story[]=[]){
 const forbidden=new Set(excluded.map(x=>x.title.trim().toLowerCase().replace(/\s+/g,' ')));
 const list=unique(ordered(pool)).filter(x=>!forbidden.has(x.title.trim().toLowerCase().replace(/\s+/g,' ')));
 // One latest story per category: match/high-voltage cannot occupy multiple slots.
 const byCategory=new Map<string,Story[]>();
 list.forEach(x=>{const key=x.category||x.portal||'other';const group=byCategory.get(key)||[];group.push(x);byCategory.set(key,group);});
 const latest=[...byCategory.entries()].map(([category,items])=>({category,story:ordered(items)[0]}));
 const previousCategories=new Set(previous.map(x=>x.category));
 const shuffled=latest.map(x=>({...x,sort:Math.random()})).sort((a,b)=>a.sort-b.sort);
 const fresh=shuffled.filter(x=>!previousCategories.has(x.category));
 const rotated=shuffled.filter(x=>previousCategories.has(x.category));
 return [...fresh,...rotated].slice(0,6).map(x=>x.story);
}

function fclPortalStories(data:Row):Story[]{
 const players=rows(data.players).filter(r=>read(r,'name','Full Name'));
 const tournaments=rows(data.tournaments).filter(r=>read(r,'tournament','TOURNAMENT'));
 const points=(player:Row)=>{
  const n=(key:string)=>Number(player[key])||0;
  return Math.round(n('runs')+n('sixes')*2+n('fours')+n('wickets')*20+n('matches')*2+n('champion')*100+n('runnersUp')*40+(n('mot')+n('cpot'))*60+n('highestRunScorer')*30+n('topWicketTaker')*30);
 };
 const ranked=[...players].sort((a,b)=>points(b)-points(a)||read(a,'name').localeCompare(read(b,'name')));
 const out:Story[]=[];
 ranked.slice(0,3).forEach((player,index)=>{
  const rank=index+1;
  out.push({
   id:`fcl-ranking-${rank}-${read(player,'id')||index}`,
   category:CATEGORIES[4],
   title:`FCL All-Time Ranking #${rank}: ${read(player,'name')}`,
   author:'FCL Rankings & MVP',
   date:read(player,'lastPlayed')||read(player,'debutYear'),
   content:`FCL-এর অফিসিয়াল All-Time Points Formula অনুযায়ী ${read(player,'name')} বর্তমানে ${rank===1?'শীর্ষ':`${rank} নম্বরে`} অবস্থান করছেন। তাঁর অর্জিত পয়েন্ট ${points(player).toLocaleString('en-US')}।\n\nরান: ${read(player,'runs')||'0'} · উইকেট: ${read(player,'wickets')||'0'} · ম্যাচ: ${read(player,'matches')||'0'} · MVP: ${read(player,'mot')||'0'}`,
   imageUrl:playerPhoto(player),sourceUrl:`/rankings?player=${encodeURIComponent(read(player,'name'))}`,source:'Rankings & MVP',newsType:'Normal',portal:'rankings'
  });
 });
 const recordSpecs=[
  {key:'maxRuns',label:'সর্বোচ্চ টুর্নামেন্ট রান',unit:'রান',id:'max-runs'},
  {key:'maxWickets',label:'সর্বোচ্চ টুর্নামেন্ট উইকেট',unit:'উইকেট',id:'max-wickets'},
  {key:'mom',label:'Man of the Match অর্জন',unit:'বার',id:'mom-awards'}
 ];
 recordSpecs.forEach(spec=>{
  const holder=[...players].sort((a,b)=>(Number(b[spec.key])||0)-(Number(a[spec.key])||0))[0];
  const value=Number(holder?.[spec.key])||0;
  if(!holder||value<=0)return;
  out.push({
   id:`fcl-record-${spec.id}`,category:CATEGORIES[5],
   title:`${spec.label}: ${read(holder,'name')}`,
   author:'FCL Records & Performance',date:read(holder,'lastPlayed')||read(holder,'debutYear'),
   content:`FCL-এর রেকর্ড ডেটা অনুযায়ী ${read(holder,'name')} ${spec.label.toLowerCase()} তালিকায় উল্লেখযোগ্য অবস্থানে রয়েছেন। মোট ${value.toLocaleString('en-US')} ${spec.unit}।\n\nমোট ম্যাচ: ${read(holder,'matches')||'0'} · মোট রান: ${read(holder,'runs')||'0'} · মোট উইকেট: ${read(holder,'wickets')||'0'}`,
   imageUrl:playerPhoto(holder),sourceUrl:`/records?player=${encodeURIComponent(read(holder,'name'))}&record=${spec.id}`,source:'Hall of Fame & Records',newsType:'Normal',portal:'records'
  });
 });
 const top3=(key:string,label:string,unit:string,id:string)=>{
  const list=[...players].filter(x=>(Number(x[key])||0)>0).sort((a,b)=>(Number(b[key])||0)-(Number(a[key])||0)).slice(0,3);
  if(!list.length)return;
  out.push({id:`fcl-top3-${id}`,category:CATEGORIES[5],title:`FCL সর্বকালের শীর্ষ ৩: ${label}`,author:'FCL Records & Performance',date:read(list[0],'lastPlayed')||read(list[0],'debutYear'),
   content:`FCL-এর অফিসিয়াল রেকর্ড অনুযায়ী ${label} তালিকার প্রথম তিনজন:\n\n${list.map((x,i)=>`${i+1}. ${read(x,'name')} — ${(Number(x[key])||0).toLocaleString('en-US')} ${unit}`).join('\n')}\n\nপ্রথম স্থানে আছেন ${read(list[0],'name')}।`,
   imageUrl:playerPhoto(list[0]),sourceUrl:`/records?player=${encodeURIComponent(read(list[0],'name'))}&record=${id}`,source:'Hall of Fame & Records',newsType:'Normal',portal:'records'});
 };
 top3('runs','সর্বোচ্চ রান সংগ্রাহক','রান','top-runs');
 top3('wickets','সর্বোচ্চ উইকেট শিকারি','উইকেট','top-wickets');
 top3('mom','Man of the Match অর্জনকারী','বার','top-mom');
 const groups=new Map<string,Row[]>();
 tournaments.forEach(r=>{const name=read(r,'tournament');if(name){const list=groups.get(name)||[];list.push(r);groups.set(name,list);}});
 const latest=[...groups.entries()].map(([name,items])=>{const sorted=[...items].sort((a,b)=>stamp(read(b,'time'))-stamp(read(a,'time')));return {name,items:sorted,time:read(sorted[0],'time')};}).sort((a,b)=>stamp(b.time)-stamp(a.time)).slice(0,3);
 latest.forEach((tour,index)=>{
  const sample=tour.items[0]||{};
  const scorer=[...tour.items].sort((a,b)=>(Number(b.topScorer)||0)-(Number(a.topScorer)||0))[0];
  const wicket=[...tour.items].sort((a,b)=>(Number(b.topWicket)||0)-(Number(a.topWicket)||0))[0];
  const details=[
   (Number(scorer?.topScorer)||0)>0?`Top Scorer: ${read(scorer||{},'playerName')} (${read(scorer||{},'topScorer')} runs)`:'',
   (Number(wicket?.topWicket)||0)>0?`Top Wicket Taker: ${read(wicket||{},'playerName')} (${read(wicket||{},'topWicket')} wickets)`:'',
   read(sample,'team')?`Team: ${read(sample,'team')}`:'',
   read(sample,'chamRu')?`Result: ${read(sample,'chamRu')}`:'',
   read(sample,'motCpot')?`MOT / CPOT: ${read(sample,'motCpot')}`:''
  ].filter(Boolean);
  out.push({
   id:`fcl-tournament-${index}-${tour.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,
   category:CATEGORIES[2],title:`${tour.name} — FCL Tournament Update`,
   author:'FCL Tournament Records',date:tour.time,
   content:details.length?details.join('\n'):`${tour.name}-এর টুর্নামেন্ট পরিসংখ্যান ও খেলোয়াড়দের পারফরম্যান্স FCL Records-এ সংরক্ষিত হয়েছে।`,
   imageUrl:'',sourceUrl:`/records?tournament=${encodeURIComponent(tour.name)}`,source:'Series & Tournament History',newsType:'Normal',portal:'tournaments'
  });
 });
 // Player Spotlight: highest career run total from the official player data.
 const topBatter=[...players].sort((a,b)=>(Number(b.runs)||0)-(Number(a.runs)||0))[0];
 if(topBatter&&Number(topBatter.runs)>0){
  out.push({id:`player-spotlight-${read(topBatter,'id')||'top-runner'}`,category:CATEGORIES[6],title:`Player Spotlight: ${read(topBatter,'name')}`,author:'FCL Player Desk',date:read(topBatter,'lastPlayed')||read(topBatter,'debutYear'),content:`FCL-এর খেলোয়াড় পরিসংখ্যান অনুযায়ী ${read(topBatter,'name')} এখন পর্যন্ত ${Number(topBatter.runs).toLocaleString('en-US')} রান করেছেন। তাঁর মোট ম্যাচ ${read(topBatter,'matches')||0}, উইকেট ${read(topBatter,'wickets')||0} এবং ভূমিকা ${read(topBatter,'role')||'FCL Player'}।`,imageUrl:playerPhoto(topBatter),sourceUrl:`/players?player=${encodeURIComponent(read(topBatter,'name'))}`,source:'Players & Stat Cards',newsType:'Normal',portal:'players'});
 }
 // FCL Online: most recently active player based on Last Played Tournament.
 const activePlayer=[...players].filter(x=>read(x,'lastPlayed')&&read(x,'lastPlayed')!=='—').sort((a,b)=>stamp(read(b,'lastPlayed'))-stamp(read(a,'lastPlayed')))[0]||[...players].sort((a,b)=>(Number(b.matches)||0)-(Number(a.matches)||0))[0];
 if(activePlayer){
  out.push({id:`fcl-online-${read(activePlayer,'id')||'active-player'}`,category:CATEGORIES[3],title:`FCL Online Update: ${read(activePlayer,'name')}`,author:'FCL Online Desk',date:read(activePlayer,'lastPlayed'),content:`FCL Player Directory-তে ${read(activePlayer,'name')}-এর সর্বশেষ অংশগ্রহণের তথ্য পাওয়া যাচ্ছে। সর্বশেষ টুর্নামেন্ট: ${read(activePlayer,'lastPlayed')}। মোট ম্যাচ ${read(activePlayer,'matches')||0}, রান ${read(activePlayer,'runs')||0}, উইকেট ${read(activePlayer,'wickets')||0}।`,imageUrl:playerPhoto(activePlayer),sourceUrl:'/play',source:'FCL Online',newsType:'Normal',portal:'fclOnline'});
 }
 // Birthday news: today's birthdays first, then this week, then this month, else the nearest upcoming one.
 const bdays=players.map(player=>({player,next:nextBirthday(read(player,'birthday'))})).filter(x=>x.next).sort((a,b)=>a.next!.days-b.next!.days);
 const dm=(w:{day:number;month:number})=>`${String(w.day).padStart(2,'0')}/${String(w.month+1).padStart(2,'0')}`;
 const when=(d:number)=>d===0?'আজ':d===1?'আগামীকাল':`${d} দিন পর`;
 const bStory=(id:string,title:string,content:string,lead:Row,date:string):Story=>({id,category:CATEGORIES[11],title,author:'FCL Birthday Desk',date,content,imageUrl:playerPhoto(lead),sourceUrl:`/birthday?player=${encodeURIComponent(read(lead,'name'))}`,source:'Birthday Celebration',newsType:'Normal',portal:'birthday'});
 const names=(list:typeof bdays)=>list.slice(0,4).map(x=>read(x.player,'name')).join(', ')+(list.length>4?` ও আরও ${list.length-4} জন`:'');
 const lines=(list:typeof bdays)=>list.map(x=>`${read(x.player,'name')} — ${dm(x.next!)} (${when(x.next!.days)})`).join('\n');
 const todayList=bdays.filter(x=>x.next!.days===0);
 const weekList=bdays.filter(x=>x.next!.days>0&&x.next!.days<=7);
 const monthList=bdays.filter(x=>x.next!.days>7&&x.next!.month===new Date().getMonth());
 todayList.slice(0,3).forEach(x=>out.push(bStory(`birthday-today-${read(x.player,'id')||read(x.player,'name')}`,`আজ ${read(x.player,'name')}-এর জন্মদিন`,`আজ ${dm(x.next!)} — FCL পরিবারের পক্ষ থেকে ${read(x.player,'name')}-কে জন্মদিনের আন্তরিক শুভেচ্ছা।`,x.player,x.next!.date)));
 if(weekList.length)out.push(bStory('birthday-week',`এই সপ্তাহের জন্মদিন: ${names(weekList)}`,`আগামী ৭ দিনে যাঁদের জন্মদিন:\n\n${lines(weekList)}\n\nসবাইকে FCL পরিবারের পক্ষ থেকে আগাম শুভেচ্ছা।`,weekList[0].player,weekList[0].next!.date));
 else if(!todayList.length&&monthList.length)out.push(bStory('birthday-month',`এই মাসের জন্মদিন: ${names(monthList)}`,`এই মাসে যাঁদের জন্মদিন:\n\n${lines(monthList)}\n\nসবাইকে FCL পরিবারের পক্ষ থেকে আগাম শুভেচ্ছা।`,monthList[0].player,monthList[0].next!.date));
 else if(!todayList.length&&bdays[0])out.push(bStory(`birthday-next-${read(bdays[0].player,'id')||read(bdays[0].player,'name')}`,`${when(bdays[0].next!.days)} ${read(bdays[0].player,'name')}-এর জন্মদিন`,`FCL Player Directory-তে সংরক্ষিত জন্মতারিখ অনুযায়ী ${read(bdays[0].player,'name')}-এর জন্মদিন ${dm(bdays[0].next!)}। FCL পরিবারের পক্ষ থেকে আগাম শুভেচ্ছা।`,bdays[0].player,bdays[0].next!.date));

 return out;
}

function nextBirthday(raw:string){
 const value=text(raw);if(!value||value==='—')return null;
 let month=-1,day=-1;
 const n=Number(value);
 if(Number.isFinite(n)&&n>20000&&n<60000){const d=new Date(Math.floor(n-25569)*86400000);month=d.getUTCMonth();day=d.getUTCDate();}
 if(month<0){
  const iso=value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  const dmy=value.match(/^(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{2,4}))?$/);
  if(iso){month=Number(iso[2])-1;day=Number(iso[3]);}
  else if(dmy){day=Number(dmy[1]);month=Number(dmy[2])-1;}
  else{
   const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
   const lower=value.toLowerCase();month=months.findIndex(m=>lower.includes(m)||lower.includes(m.slice(0,3)));
   const dm=value.match(/\d{1,2}/);day=dm?Number(dm[0]):1;
  }
 }
 if(month<0||month>11||day<1||day>31)return null;
 const now=new Date();const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 let next=new Date(today.getFullYear(),month,day);
 if(next<today)next=new Date(today.getFullYear()+1,month,day);
 const isoDate=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${String(next.getDate()).padStart(2,'0')}`;
 return {date:isoDate,days:Math.round((next-today)/86400000),month,day};
}
function fallbackImage(category:string){
 const c=category.toLocaleLowerCase();
 const has=(...terms:string[])=>terms.some(t=>c.includes(t));
 if(has('history','heritage','ইতিহাস','ঐতিহ্য'))return '/newspaper-photoes/History-Heritage.jpeg';
 if(has('birthday','জন্মদিন','জন্মদিনের'))return '/newspaper-photoes/Birthday.jpeg';
 if(has('special report','বিশেষ প্রতিবেদন','বিশেষ রিপোর্ট'))return '/newspaper-photoes/Special-Report.jpeg';
 if(has('poll','opinion','জরিপ','মতামত'))return '/newspaper-photoes/Poll-Opinion.jpeg';
 if(has('announcement','ঘোষণা','নোটিশ'))return '/newspaper-photoes/Announcement.jpeg';
 if(has('ranking','mvp','র‍্যাংকিং','র্যাংকিং','এমভিপি'))return '/newspaper-photoes/Ranking-MVP.jpeg';
 if(has('extraordinary','অসাধারণ'))return '/newspaper-photoes/Records.jpeg';
 if(has('record','performance','রেকর্ড','পারফরম্যান্স','পারফরমেন্স'))return '/newspaper-photoes/Records.jpeg';
 if(has('player spotlight','player','খেলোয়াড়','খেলোয়াড়','প্লেয়ার'))return '/newspaper-photoes/Player-Spotlight.jpeg';
 if(has('interview','সাক্ষাৎকার'))return '/newspaper-photoes/Interview.jpeg';
 if(has('fun','satire','মজা','ব্যঙ্গ','হাস্যরস'))return '/newspaper-photoes/Fun-Satire.jpeg';
 if(has('social','buzz','ফেসবুক','মেসেঞ্জার','সামাজিক'))return '/newspaper-photoes/Social-Buzz.jpeg';
 if(has('memory','memories','nostalgia','স্মৃতি','স্মৃতিচারণ'))return '/newspaper-photoes/Memories.jpeg';
 if(has('fcl online','online','অনলাইন'))return '/newspaper-photoes/FCL-Online.jpeg';
 if(has('series','tournament','সিরিজ','টুর্নামেন্ট'))return '/newspaper-photoes/Series-Tournament.jpeg';
 if(has('match','ম্যাচ'))return '/newspaper-photoes/match-news.jpeg';
 return '/newspaper-photoes/match-news.jpeg';
}
function featured0(news:Story[]){return news.find(x=>x.newsType==='Featured')||news.find(x=>x.newsType==='Breaking')||news[0];}
function Cover({story}:{story:Story}){
 const src=imageLink(story.imageUrl);
 return <StoryImage key={`${src||'fallback'}-${story.id}`} src={src} story={story}/>;
}
function StoryImage({src,story}:{src:string;story:Story}){
 const [failed,setFailed]=useState(false);
 const [fallbackFailed,setFallbackFailed]=useState(false);
 const [ratio,setRatio]=useState(0);
 const useUploaded=!!src&&!failed;
 const fallback= fallbackImage(story.category);
 const portrait=ratio>0&&ratio<=1;
 return <div className={`${styles.cover} ${portrait?styles.portraitCover:''} ${useUploaded?styles.realCover:styles.fallbackCover}`}>
  {useUploaded?<img src={src} alt={story.title} loading="lazy" referrerPolicy="no-referrer" onLoad={e=>{const im=e.currentTarget;if(im.naturalWidth&&im.naturalHeight)setRatio(im.naturalWidth/im.naturalHeight);}} onError={()=>{setFailed(true);setRatio(0);}}/>:
   !fallbackFailed?<>
    <img className={styles.fallbackArtwork} src={fallback} alt="" aria-hidden="true" loading="lazy" onLoad={e=>{const im=e.currentTarget;if(im.naturalWidth&&im.naturalHeight)setRatio(im.naturalWidth/im.naturalHeight);}} onError={()=>setFallbackFailed(true)}/>
    <div className={styles.fallbackOverlay} aria-hidden="true">
     <img className={styles.fallbackLogo} src="/fcl-logo.png" alt="" />
     <span className={styles.fallbackTitle}>{story.category}</span>
    </div>
   </>:<div className={styles.fallback}><span>FCL</span><small>{story.source.toUpperCase()}</small></div>}
 </div>;
}
function Article({story,onOpen,lead=false,compact=false}:{story:Story;onOpen:(s:Story)=>void;lead?:boolean;compact?:boolean}){
 return <article className={`${styles.article} ${lead?styles.lead:''} ${compact?styles.compact:''}`}>
  <button type="button" onClick={()=>onOpen(story)} className={styles.articleButton}>
   {!compact&&<Cover story={story}/>}
   <div className={styles.storyCopy}>
    <div className={styles.kicker}>{story.category} {story.newsType==='Breaking'?' · BREAKING':''}</div>
    {lead?<h2>{story.title}</h2>:<h3>{story.title}</h3>}
    <div className={styles.meta}>{dateLabel(story.date)}{story.author&&` · ${story.author}`}</div>
    {!compact&&<p className={styles.excerpt}>{preview(story.content)}</p>}
    <span className={styles.read}>বিস্তারিত পড়ুন →</span>
   </div>
  </button>
 </article>;
}
async function get(path:string,signal:AbortSignal){const r=await fetch(path,{cache:'no-store',signal});if(!r.ok)throw Error(path);return r.json();}
export default function FCLPaperNewsPortal(){
 const [news,setNews]=useState<Story[]>([]),[pool,setPool]=useState<Story[]>([]),[random,setRandom]=useState<Story[]>([]),[category,setCategory]=useState('সব খবর'),[query,setQuery]=useState(''),[page,setPage]=useState(1),[open,setOpen]=useState<Story|null>(null),[loading,setLoading]=useState(true),[errors,setErrors]=useState<string[]>([]),[updated,setUpdated]=useState(''),[edition,setEdition]=useState(''),[logoError,setLogoError]=useState(false);const dataRef=useRef({news:[] as Story[],pool:[] as Story[],signature:''});const closeRef=useRef<HTMLButtonElement>(null);
 const fixed=useMemo(()=>{const p=ordered(pool);return unique(['matches','highVoltage','extraordinary','rankings','records','tournaments','players','fclOnline','birthday','memories'].flatMap(k=>p.find(x=>x.portal===k)?[p.find(x=>x.portal===k)!]:[]));},[pool]);
 const heroFallback=useMemo(()=>{const list=pool.filter(x=>x.id.startsWith('fcl-top3-'));return list.length?list[Math.floor(Date.now()/86400000)%list.length]:undefined;},[pool]);
 const featured=featured0(news)||heroFallback;
 const sideLists=useMemo(()=>{const manualSide=news.filter(x=>x.id!==featured?.id).slice(0,4);const pf=fixed.filter(x=>x.id!==featured?.id);const total=manualSide.length+pf.length;const leftFixed=Math.max(0,Math.ceil(total/2)-manualSide.length);const split=pf.length-leftFixed;return {left:[...manualSide,...pf.slice(split)],right:pf.slice(0,split)};},[news,fixed,featured]);
 useEffect(()=>{const controller=new AbortController();let busy=false;setEdition(new Intl.DateTimeFormat('bn-BD',{dateStyle:'full',timeZone:'Asia/Dhaka'}).format(new Date()));async function load(){if(busy)return;busy=true;const paths=['/api/newspaper','/api/matches','/api/thrillers-data','/api/fcl-memories','/api/fcl-data'];const result=await Promise.allSettled(paths.map(p=>get(p,controller.signal)));if(controller.signal.aborted)return;const old=dataRef.current;let nextNews=old.news;let nextPool=old.pool;const failures:string[]=[];result.forEach((r,i)=>{if(r.status==='rejected'){failures.push(paths[i]);return;}const d=r.value;let incoming:Story[]=[];let keys:string[]=[];if(i===0){if(!Array.isArray(d.news)){failures.push(paths[i]);return;}nextNews=ordered(rows(d.news).map(manual).filter(x=>x.title&&x.content));return;}if(i===1){incoming=rows(d.matches??d).map((r,j)=>portal(r,j,'matches')).filter(x=>x.title&&x.content);keys=['matches'];}else if(i===2){incoming=[...rows(d.highVoltage).map((r,j)=>portal(r,j,'highVoltage')),...rows(d.extraordinary).map((r,j)=>portal(r,j,'extraordinary'))].filter(x=>x.title&&x.content);keys=['highVoltage','extraordinary'];}else if(i===3){incoming=rows(d.memories??d.data).map((r,j)=>portal(r,j,'memories')).filter(x=>x.title&&x.content);keys=['memories'];}else if(i===4){incoming=fclPortalStories(d).filter(x=>x.title&&x.content);keys=['rankings','records','tournaments','players','fclOnline','birthday'];}nextPool=[...nextPool.filter(x=>!keys.includes(x.portal||'')),...incoming];});nextPool=ordered(nextPool);const sig=JSON.stringify([nextNews,nextPool]);if(sig!==old.signature){dataRef.current={news:nextNews,pool:nextPool,signature:sig};setNews(nextNews);setPool(nextPool);setRandom(prev=>randomSix(nextPool,nextNews,prev));}setErrors(failures);setUpdated(new Intl.DateTimeFormat('bn-BD',{timeStyle:'short',timeZone:'Asia/Dhaka'}).format(new Date()));setLoading(false);busy=false;}void load();const timer=setInterval(()=>void load(),300000);return()=>{controller.abort();clearInterval(timer);};},[]);
 useEffect(()=>{if(!open)return;const before=document.body.style.overflow;document.body.style.overflow='hidden';const prev=document.activeElement as HTMLElement|null;closeRef.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(null);};window.addEventListener('keydown',key);return()=>{document.body.style.overflow=before;window.removeEventListener('keydown',key);prev?.focus();};},[open]);
 const breaking=news.filter(x=>x.newsType==='Breaking');const allStories=useMemo(()=>ordered([...news,...pool]),[news,pool]);const filtered=useMemo(()=>(category==='সব খবর'&&!query.trim()?news:allStories).filter(x=>(category==='সব খবর'||x.category===category)&&`${x.title} ${x.content} ${x.author}`.toLowerCase().includes(query.trim().toLowerCase())),[news,allStories,category,query]);const active=category!=='সব খবর'||!!query.trim();const remaining=filtered;const total=Math.max(1,Math.ceil(remaining.length/8));const current=Math.min(page,total);
 return <div className={styles.paper}><main className={styles.shell}><header className={styles.header}><div className={styles.top}><Link href="/">← FCL Home</Link><span>{edition||'FCL Digital Edition'}</span><span>APP • FACEBOOK</span></div><div className={styles.masthead}>{!logoError&&<img src="/fcl-paper-logo.jpeg" alt="FCL Newspaper logo" onError={()=>setLogoError(true)}/>}<div><div className={styles.eyebrow}>THE VOICE OF FACEBOOK CRICKET LEAGUE</div><h1>FCL <span>NEWSPAPER</span></h1><p>Every Match. Every Moment. Every Story.</p></div></div><div className={styles.edition}><span>ডিজিটাল সংস্করণ</span><span>NEWS • CRICKET • COMMUNITY</span><span>{updated?`আপডেট ${updated}`:'FCL News Desk'}</span></div></header><nav className={styles.nav} aria-label="News categories">{['সব খবর',...CATEGORIES,...Array.from(new Set([...news,...pool].map(x=>x.category))).filter(x=>x&&!CATEGORIES.includes(x))].map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>{setCategory(c);setPage(1);}}>{c}</button>)}</nav><div className={styles.search}><input type="search" aria-label="Search newspaper" placeholder="সংবাদ খুঁজুন…" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/>{active&&<button onClick={()=>{setQuery('');setCategory('সব খবর');setPage(1);}}>সব দেখুন</button>}</div>{errors.length>0&&<p className={styles.notice}>কিছু সংবাদ উৎস এখন পাওয়া যাচ্ছে না। আগের পাওয়া তথ্য থাকলে সেটি দেখানো হচ্ছে।</p>}{loading?<div className={styles.notice}>সংবাদ লোড হচ্ছে…</div>:<>{!active&&<>{breaking.length>0&&<div className={styles.breaking}><strong>BREAKING</strong><div>{breaking.map(x=><button key={x.id} onClick={()=>setOpen(x)}>{x.title}</button>)}</div></div>}<div className={styles.front}><aside className={styles.sidebar}><h2 className={styles.sectionTitle}>সর্বশেষ সংবাদ</h2>{sideLists.left.map(x=><Article key={x.id} story={x} onOpen={setOpen} compact/>)}{!sideLists.left.length&&<p className={styles.meta}>আরও সংবাদ প্রকাশিত হলে এখানে দেখা যাবে।</p>}</aside><section className={styles.center}><div className={styles.sectionTitle}>প্রধান সংবাদ <span>EDITOR'S DESK</span></div>{featured?<Article story={featured} onOpen={setOpen} lead/>:<div className={styles.empty}>নতুন সংবাদ প্রকাশের পর এখানে প্রধান শিরোনাম দেখা যাবে।</div>}</section><aside className={styles.sidebar}><h2 className={styles.sectionTitle}>FCL আপডেট</h2>{sideLists.right.map(x=><Article key={x.id} story={x} onOpen={setOpen} compact/>)}{!fixed.length&&<p className={styles.meta}>পোর্টালের তথ্য পাওয়া যায়নি।</p>}</aside></div><section className={styles.universe}><div className={styles.sectionHead}><div><div className={styles.eyebrow}>DISCOVER FCL</div><h2>From the FCL Universe</h2><p>নতুন ও পুরোনো গল্পের সমন্বয় · স্বয়ংক্রিয় নির্বাচন</p></div><button onClick={()=>setRandom(prev=>randomSix(pool,news,prev))}>↻ নতুন গল্প</button></div><div className={styles.grid}>{random.filter(x=>x.id!==featured?.id).map(x=><Article key={x.id} story={x} onOpen={setOpen}/>)}</div>{!random.length&&<p className={styles.meta}>পর্যাপ্ত আলাদা পোর্টাল সংবাদ পাওয়া যায়নি।</p>}</section></>}<section><div className={styles.sectionHead}><h2>{active?'খোঁজার ফলাফল':'সব প্রকাশিত সংবাদ'}</h2><span>{remaining.length} সংবাদ</span></div><div className={styles.archive}>{remaining.slice((current-1)*8,current*8).map(x=><Article key={x.id} story={x} onOpen={setOpen}/>)}</div>{!remaining.length&&<div className={styles.empty}>কোনো সংবাদ পাওয়া যায়নি।</div>}{total>1&&<div className={styles.pagination}><button disabled={current===1} onClick={()=>setPage(current-1)}>← পূর্ববর্তী</button><span>{current} / {total}</span><button disabled={current===total} onClick={()=>setPage(current+1)}>পরবর্তী →</button></div>}</section></>}<footer className={styles.footer}><strong>FCL NEWSPAPER</strong><p>FCL-এর প্রতিটি গল্প, এক মলাটে।</p><small>Facebook Cricket League · Digital Gaming Community</small></footer></main>{open&&<div className={styles.overlay} onClick={()=>setOpen(null)}><section role="dialog" aria-modal="true" aria-labelledby="paper-article-title" className={styles.dialog} onClick={e=>e.stopPropagation()}><div className={styles.dialogTop}><span>FCL NEWSPAPER</span><button ref={closeRef} onClick={()=>setOpen(null)} aria-label="Close article">✕</button></div><div className={styles.dialogBody}><div className={styles.kicker}>{open.category}</div><h2 id="paper-article-title">{open.title}</h2><div className={styles.meta}>{dateLabel(open.date)} · {open.author||open.source}</div><Cover story={open}/><div className={styles.fullText}>{open.content.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((s,i)=>s.startsWith('*')&&s.endsWith('*')?<strong key={i}>{s.replace(/^\*+|\*+$/g,'')}</strong>:<span key={i}>{s}</span>)}</div>{safeLink(open.sourceUrl)&&<a className={styles.source} href={safeLink(open.sourceUrl)} target="_blank" rel="noopener noreferrer">{open.portal?`মূল পোর্টাল: ${open.source}`:'মূল Facebook পোস্ট'} ↗</a>}</div></section></div>}</div>;
}
