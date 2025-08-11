// components/ReactionBar.tsx
'use client';
import * as React from 'react';

type Reaction = 'like' | 'love' | 'wow' | 'laugh' | 'sad' | 'angry';
export type ReactionCounts = Partial<Record<Reaction, number>>;

export interface Props {
  postId: string | number;                        // ⬅️ add this
  counts?: ReactionCounts;                        // ⬅️ already using this
  onChange?: (prev: Reaction | null, next: Reaction) => void;
  className?: string;
}

export default function ReactionBar({
  postId,
  counts = {},
  onChange,
  className,
}: Props) {
  const [selected, setSelected] = React.useState<Reaction | null>(null);
  const [local, setLocal] = React.useState<ReactionCounts>({ ...counts });

  const click = (r: Reaction) => {
    setLocal(c => {
      const next = { ...c };
      if (selected) next[selected] = Math.max(0, (next[selected] ?? 0) - 1);
      next[r] = (next[r] ?? 0) + 1;
      return next;
    });
    const prev = selected;
    setSelected(r);
    onChange?.(prev, r);
  };

  const items: Reaction[] = ['like', 'love', 'wow', 'laugh', 'sad', 'angry'];
  const icons: Record<Reaction, string> = {
    like: '👍', love: '❤️', wow: '🤯', laugh: '😂', sad: '😢', angry: '😡'
  };

  return (
    <div data-post={String(postId)} className={className}>
      {items.map(r => (
        <button key={r} onClick={() => click(r)} aria-pressed={selected === r}>
          {icons[r]} {local[r] ?? 0}
        </button>
      ))}
    </div>
  );
}
