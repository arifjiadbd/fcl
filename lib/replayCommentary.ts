import type { ReplayBall } from './matchReplay';

export type CommentaryLang = 'en' | 'bn';
export type CommentaryTag =
  | 'dot' | 'single' | 'two' | 'three' | 'four' | 'six' | 'runs'
  | 'wicket' | 'wide' | 'noball' | 'bye' | 'legbye';

export type BallCommentary = {
  tag: CommentaryTag;
  /** Circle badge shown beside the ball number: 4 / 6 / W (empty otherwise). */
  badge: '' | '4' | '6' | 'W';
  /** Big on-screen text, e.g. "SIX!" */
  big: string;
  /** "Rakibul Islam to M R Shakil" */
  lead: string;
  /** Bold word(s): "FOUR" */
  headline: string;
  detail: string;
  speak: string;
};

export function ballTag(b: ReplayBall): CommentaryTag {
  if (b.wicket) return 'wicket';
  if (b.extraType === 'wide') return 'wide';
  if (b.extraType === 'noball') return 'noball';
  if (b.runs === 0 && b.extraType === 'bye') return 'bye';
  if (b.runs === 0 && b.extraType === 'legbye') return 'legbye';
  if (b.runs === 6) return 'six';
  if (b.runs === 4) return 'four';
  if (b.runs === 0) return 'dot';
  if (b.runs === 1) return 'single';
  if (b.runs === 2) return 'two';
  if (b.runs === 3) return 'three';
  return 'runs';
}

/** Short label for the "this over" chips: 0 1 4 6 W wd 1lb */
export function chipLabel(b: ReplayBall): string {
  if (b.wicket) return 'W';
  if (b.extraType === 'wide') return (b.extras ?? 1) > 1 ? `${b.extras}wd` : 'wd';
  if (b.extraType === 'noball') return 'nb';
  if (b.extraType === 'bye') return `${b.extras ?? 1}b`;
  if (b.extraType === 'legbye') return `${b.extras ?? 1}lb`;
  return String(b.runs);
}

const pick = <T>(list: readonly T[], seed: number, salt: number): T =>
  list[(Math.imul(seed + salt * 7919, 2654435761) >>> 0) % list.length];

/* ----------------------------- English ----------------------------- */
const EN = {
  length: ['short of length', 'good length', 'fuller', 'back of a length', 'full', 'slightly short'],
  line: ['outside off', 'on off stump', 'on middle and leg', 'down the leg side', 'just outside off', 'on the pads', 'angled across'],
  dot: [
    'defends it back to the bowler', 'pushes it into the off side', 'leaves it alone',
    'blocks it solidly', 'is beaten, but no harm done', 'hangs back and stabs it down into the off side',
  ],
  single: [
    'nudges it into the leg side and picks up a single', 'works it to mid-wicket for one',
    'dabs it down to third man and sneaks a single', 'pushes it to long-on and they cross for one', 'guides it behind point and calls immediately for a single',
  ],
  two: [
    'drives it into the gap and comes back for the second', 'places it wide of mid-on, running hard for two',
    'flicks it behind square and the pair turn for two', 'clips it into the deep and races back for the second', 'places it between the fielders and collects a comfortable two',
  ],
  three: [
    'finds the gap and the fielder has to chase it all the way, three runs!',
    'drives it past the sweeper, superb running for three!', 'threads it through cover and they run three', 'works it into the vacant deep mid-wicket region for three', 'steers it behind square and good running brings three',
  ],
  four: [
    'opens the face of the bat and sends it racing to the boundary',
    'punches it through the covers, no need to run',
    'pulls it firmly in front of square, that is a boundary',
    'climbs on to his toes and steers it wide of point',
    'times it beautifully and the fielder has no chance',
  ],
  six: [
    'picks the length early and launches it over long-on, into the crowd!',
    'heaves it over mid-wicket, that is a massive hit!',
    'swings hard, and it is out of the ground!',
    'lofts it straight down the ground, a huge six!', 'gets underneath it and clears the rope over extra cover!',
  ],
  runs: ['they get some runs out of that one'],
} as const;

/* ----------------------------- Bengali ----------------------------- */
const BN = {
  length: ['শর্ট লেংথ', 'গুড লেংথ', 'ফুল লেংথ', 'ব্যাক অব আ লেংথ', 'একটু শর্ট'],
  line: ['অফ স্ট্যাম্পের বাইরে', 'অফ স্ট্যাম্পে', 'মিডল-লেগ লাইনে', 'লেগ সাইডে', 'প্যাড বরাবর'],
  dot: ['ব্যাট ঠেকিয়ে দিলেন', 'বল ছেড়ে দিলেন', 'বোলারের দিকেই ফিরিয়ে দিলেন', 'শান্তভাবে ডিফেন্ড করলেন', 'বিটেন হলেন, কিন্তু রান নেই'],
  single: ['লেগ সাইডে ঠেলে সিঙ্গেল নিলেন', 'পয়েন্টে ঠেলে দ্রুত এক রান নিলেন', 'মিড-অফে খেলে এক রান নিলেন', 'গ্যাপে ঠেলে এক রান পেলেন'],
  two: ['গ্যাপে খেলে দারুণ দৌড়ে দুই রান নিলেন', 'মিড-অনের পাশ দিয়ে খেলে দুই রান আদায় করলেন', 'ফ্লিক করে দুই রান নিয়ে নিলেন'],
  three: ['ফিল্ডারের পাশ দিয়ে বল ছুটল, দৌড়ে তিন রান নিলেন!', 'দুর্দান্ত দৌড়ে তিন রান আদায় করলেন!'],
  four: [
    'ব্যাটের ফেস খুলে পয়েন্টের পাশ দিয়ে বল সীমানায় পাঠালেন',
    'কভারের ফাঁক দিয়ে দুর্দান্ত শটে বাউন্ডারি আদায় করলেন',
    'পুল করে বল পাঠিয়ে দিলেন সীমানার বাইরে',
    'নিখুঁত টাইমিংয়ে খেললেন, ফিল্ডার কিছুই করতে পারল না',
  ],
  six: [
    'লং-অনের ওপর দিয়ে বল পাঠালেন গ্যালারিতে!',
    'মিড-উইকেটের ওপর দিয়ে বিশাল ছক্কা হাঁকালেন!',
    'সোজা ব্যাটে বল পাঠালেন মাঠের বাইরে!',
    'ক্রিজ ছেড়ে এগিয়ে এসে আকাশে তুললেন বল!',
  ],
  runs: ['কয়েকটি রান আদায় করে নিলেন'],
} as const;

const HEAD = {
  en: { dot: 'no run', single: '1 run', two: '2 runs', three: '3 runs', four: 'FOUR', six: 'SIX', runs: 'runs', wicket: 'WICKET', wide: 'wide', noball: 'no ball', bye: 'bye', legbye: 'leg bye' },
  bn: { dot: 'কোনো রান নেই', single: '১ রান', two: '২ রান', three: '৩ রান', four: 'চার', six: 'ছক্কা', runs: 'রান', wicket: 'উইকেট', wide: 'ওয়াইড', noball: 'নো বল', bye: 'বাই', legbye: 'লেগ বাই' },
} as const;

const BIG = {
  en: { dot: 'DOT BALL', single: '1 RUN', two: '2 RUNS', three: '3 RUNS', four: 'FOUR!', six: 'SIX!', runs: 'RUNS', wicket: 'WICKET!', wide: 'WIDE', noball: 'NO BALL', bye: 'BYE', legbye: 'LEG BYE' },
  bn: { dot: 'ডট বল', single: '১ রান', two: '২ রান', three: '৩ রান', four: 'চার!', six: 'ছক্কা!', runs: 'রান', wicket: 'উইকেট!', wide: 'ওয়াইড', noball: 'নো বল', bye: 'বাই', legbye: 'লেগ বাই' },
} as const;

export function commentaryFor(ball: ReplayBall, lang: CommentaryLang = 'en'): BallCommentary {
  const tag = ballTag(ball);
  const seed = ball.inningsIndex * 997 + ball.ballInInnings * 131 + (lang === 'bn' ? 7 : 0);
  const bowler = ball.bowler;
  const batter = ball.batter.replace(/\*$/, '');
  const T = lang === 'bn' ? BN : EN;
  const bn = lang === 'bn';

  const lead = bn ? `${bowler}-এর বলে ${batter}` : `${bowler} to ${batter}`;
  const headline = tag === 'runs' ? `${ball.runs} ${HEAD[lang][tag]}` : HEAD[lang][tag];
  const big = BIG[lang][tag];
  const length = pick(T.length, seed, 1);
  const line = pick(T.line, seed, 2);
  const delivery = bn ? `${length} ডেলিভারি, ${line}` : `${length} delivery, ${line}`;

  let detail: string;
  switch (tag) {
    case 'wicket': {
      const figures = `${ball.batterRuns} (${ball.batterBalls})`;
      detail = bn
        ? `${batter} আউট! ${bowler} সাফল্য পেলেন, ${batter} ${figures} করে ফিরলেন। স্কোর ${ball.score}/${ball.wickets}।`
        : `${batter} is gone! ${bowler} strikes and ${batter} walks back for ${figures}. ${ball.score}/${ball.wickets}.`;
      break;
    }
    case 'wide':
      detail = bn ? `${bowler}-এর বল লেগ সাইডে চলে গেল, ওয়াইড। +${ball.extras ?? 1}` : `${bowler} strays down the leg side and it is called wide. +${ball.extras ?? 1}`;
      break;
    case 'noball':
      detail = bn ? `ওভারস্টেপ! নো বল, +${ball.extras ?? 1} রান।` : `Overstepped, it is a no ball. +${ball.extras ?? 1}`;
      break;
    case 'bye':
    case 'legbye':
      detail = bn
        ? `${delivery}, বল ব্যাট ছুঁয়ে যায়নি, ${ball.extras ?? 1} রান বাই/লেগ বাই হিসেবে যোগ হলো।`
        : `${delivery}, it beats everything and they steal ${ball.extras ?? 1} ${tag === 'bye' ? 'bye' : 'leg bye'}.`;
      break;
    default: {
      const shot = pick(T[tag === 'runs' ? 'runs' : tag], seed, 3);
      detail = bn ? `${delivery} — ${batter} ${shot}` : `${delivery}, ${batter} ${shot}`;
    }
  }
  if (ball.commentary) detail = ball.commentary; // real commentary always wins

  const badge: BallCommentary['badge'] = tag === 'wicket' ? 'W' : tag === 'six' ? '6' : tag === 'four' ? '4' : '';
  return { tag, badge, big, lead, headline, detail, speak: `${lead}. ${headline}. ${detail}` };
}
