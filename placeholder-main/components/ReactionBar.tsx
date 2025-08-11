// components/ReactionBar.tsx
'use client';

import { useState, useMemo } from 'react';

type ReactionCounts = Record<string, number>;

export type Props = {
  /** Optional id of the post using this bar (handy for analytics, testing) */
  postId?: string;
  /** Map of emoji -> count. Missing keys default to 0. */
  counts?: ReactionCounts;
  /** Notifies parent of a change: previous selection (or null) and new selection */
  onChange?: (prev: string | null, next: string) => void;
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
      // Coerce incoming values to numbers before validating; otherwise
      // numeric strings like "3" would be treated as NaN and zeroed out.
      const n = Number(v);
      safe[k] = Number.isFinite(n) ? n : 0;
    }
    return safe;
  }, [counts]);

  const handleClick = (next: string) => {
    setSelected(prev => {
      try { onChange?.(prev, next); } catch { /* swallow */ }
      // toggle: clicking the same reaction keeps it selected (no unlike yet)
      return next;
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
