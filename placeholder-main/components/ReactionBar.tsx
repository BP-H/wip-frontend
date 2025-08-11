// components/ReactionBar.tsx
'use client';

import { useState, useMemo } from 'react';

type ReactionCounts = Record<string, number>;

export type Props = {
  /** Optional id of the post using this bar (handy for analytics, testing) */
  postId?: string;
  /** Map of emoji -> count. Missing keys default to 0. */
  counts?: ReactionCounts;
  /** Notifies parent of a change: previous selection (or null) and new selection (or null) */
  onChange?: (prev: string | null, next: string | null) => void;
  /** Optional className so parent can style/position */
  className?: string;
};

/** Stable default set so UI never collapses if counts are missing */
const DEFAULTS: ReactionCounts = { '🔥': 0, '💖': 0, '🎉': 0, '👍': 0 };

export default function ReactionBar({
  postId,
  counts = {},
  onChange,
  className,
}: Props) {
  // keep selected purely client-side; server markup stays consistent
  const [selected, setSelected] = useState<string | null>(null);

  // merge provided counts with defaults defensively
  const merged = useMemo<ReactionCounts>(() => {
    const safe: ReactionCounts = { ...DEFAULTS };
    for (const [k, v] of Object.entries(counts || {})) {
      // Accept numeric values or numeric strings from APIs; anything
      // non-numeric falls back to 0 so the UI stays stable.
      const num = Number(v);
      // clamp at 0 so bogus negative values don't show
      safe[k] = Number.isFinite(num) ? Math.max(0, num) : 0;
    }
    return safe;
  }, [counts]);

  const handleClick = (next: string) => {
    setSelected(prev => {
      const result = prev === next ? null : next;
      try { onChange?.(prev, result); } catch { /* swallow */ }
      // toggle: clicking again clears the selection
      return result;
    });
  };

  return (
    <div
      className={className}
      role="group"
      aria-label="Reactions"
      data-post-id={postId}
    >
      {Object.entries(merged).map(([emoji, n]) => {
        const active = selected === emoji;
        return (
          <button
            key={emoji}
            type="button"
            aria-pressed={active}
            title={`${emoji} ${n}`}
            onClick={() => handleClick(emoji)}
            className={`rxn ${active ? 'active' : ''}`}
          >
            <span className="emoji" aria-hidden="true">{emoji}</span>
            <span className="count">{n}</span>
          </button>
        );
      })}

      {/* Local styles so the component works even without external CSS */}
      <style jsx>{`
        .rxn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 10px;
          margin-right: 8px;
          border-radius: 999px;
          border: 1px solid var(--sn-stroke, #223);
          background: #0f1626;
          color: var(--sn-muted, #9aa6c1);
          font-size: 13px;
          line-height: 1;
          transition: box-shadow .18s ease, border-color .18s ease, color .18s;
        }
        .rxn:hover {
          border-color: #2a3754;
          box-shadow: 0 0 0 2px var(--sn-ring, rgba(255,45,184,.35)) inset;
        }
        .rxn.active {
          color: #fff;
          border-color: #323f5e;
          box-shadow: 0 0 0 2px var(--sn-ring, rgba(255,45,184,.35)) inset;
        }
        .emoji { font-size: 16px; }
        .count { opacity: .9; }
      `}</style>
    </div>
  );
}
