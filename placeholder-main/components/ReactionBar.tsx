// components/ReactionBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Counts = Record<string, number>;
const OPTIONS = [
  { key: "like",   emoji: "👍", label: "Like" },
  { key: "hug",    emoji: "🤗", label: "Hug" },
  { key: "fire",   emoji: "🔥", label: "Fire" },
  { key: "rocket", emoji: "🚀", label: "Rocket" },
  { key: "idea",   emoji: "💡", label: "Idea" },
  { key: "love",   emoji: "❤️", label: "Love" },
];
const STORE_KEY = "sn2177:rx:v1";

export default function ReactionBar({
  postId, counts, onChange,
}: {
  postId: string;
  counts: Counts;
  onChange: (prev: string | null, next: string) => void;
}) {
  const [mine, setMine] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const map = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      setMine(map[postId] ?? null);
    } catch {}
  }, [postId]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!anchor.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, []);

  function pick(key: string) {
    onChange(mine, key);
    setMine(key);
    try {
      const map = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      map[postId] = key;
      localStorage.setItem(STORE_KEY, JSON.stringify(map));
    } catch {}
    setOpen(false);
  }

  const summary = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => OPTIONS.find(o => o.key === k)?.emoji)
    .join(" ");

  return (
    <div ref={anchor} style={{ position: "relative", display: "inline-block" }}>
      <button
        className="sn-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(v => !v)}
      >
        {mine ? "Reacted" : "Like"} {summary && <span> · {summary}</span>}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            bottom: "120%",
            left: 0,
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 12px 28px rgba(16,24,40,0.22)",
            padding: "8px 10px",
            borderRadius: 28,
            display: "flex",
            gap: 10,
            backdropFilter: "blur(6px)",
            zIndex: 50,
          }}
        >
          {OPTIONS.map(o => (
            <button
              key={o.key}
              title={o.label}
              onClick={() => pick(o.key)}
              style={{
                width: 40, height: 40, borderRadius: 999,
                fontSize: 20, border: "1px solid rgba(0,0,0,0.06)",
                background: "#fff", cursor: "pointer",
              }}
            >
              {o.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
