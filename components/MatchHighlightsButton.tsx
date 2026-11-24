'use client';

import { useState } from 'react';
import type { ReplayMatch } from '../lib/matchReplay';
import MatchHighlightsModal from './MatchHighlightsModal';

export default function MatchHighlightsButton({ match, className }: { match: ReplayMatch; className?: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className={className} onClick={() => setOpen(true)}>
      ▶ Watch Virtual Replay
    </button>
    {open && <MatchHighlightsModal match={match} open={open} onClose={() => setOpen(false)} />}
  </>;
}
