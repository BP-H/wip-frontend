// components/ReactionBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Reaction = { key: string; emoji: string; label: string };
const REACTIONS: Reaction[] = [
  { key: "like",  emoji: "👍", label: "Like" },
  { key: "love",  emoji: "❤️", label: "Love" },
  { key: "hug",   emoji: "🤗", label: "Hug" },
  { key: "cry",   emoji: "😭", label: "Cry" },
  { key: "fire",  emoji: "🔥", label: "Fire" },
  { key: "light", emoji: "💡", label: "Insightful" },
];

export default function ReactionBar({
  onReact,
  defaultLabel = "Like",
}: {
  onReact?: (r: Reaction) => void;
  defaultLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pressed, setPressed] = useState<Reaction | null>(null);
  const hold = useRef<number | null>(null);

  // mobile long‑press
  const startHold = () => {
    if (hold.current) return;
    hold.current = window.setTimeout(() => setOpen(true), 380);
  };
  const endHold = () => {
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = null;
  };

  useEffect(() => () => endHold(), []);

  const handleChoose = (r: Reaction) => {
    setPressed(r);
    setOpen(false);
    onReact?.(r);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div className="reaction-bar">
        <button
          className="reaction-btn"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onClick={() => handleChoose(REACTIONS[0])}
          aria-label="React"
        >
          {pressed ? `${pressed.emoji} ${pressed.label}` : defaultLabel}
        </button>
        <button className="reaction-btn btn--ghost">Comment</button>
        <button className="reaction-btn btn--ghost">Share</button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="reaction-flyout"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            {REACTIONS.map((r) => (
              <motion.button
                key={r.key}
                className="reaction"
                onClick={() => handleChoose(r)}
                title={r.label}
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{r.emoji}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
