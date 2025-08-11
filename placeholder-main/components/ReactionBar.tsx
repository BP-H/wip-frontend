// components/ReactionBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type Reaction = { key: string; emoji: string; label: string };

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

  // mobile long‑press (open the flyout)
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
    <div className="rb" role="group" aria-label="Reactions">
      <div
        className="reaction-bar"
        onMouseLeave={() => setOpen(false)}
      >
        <button
          className="reaction-btn"
          onMouseEnter={() => setOpen(true)}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onClick={() => handleChoose(REACTIONS[0])}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleChoose(REACTIONS[0]);
          }}
          aria-haspopup="true"
          aria-expanded={open}
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
                whileHover={{ y: -3, scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                aria-label={r.label}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{r.emoji}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* scoped, dependency‑free styles (works on dark or matte‑white UIs) */}
      <style jsx>{`
        .rb { position: relative; display: inline-block; }
        .reaction-bar { display: inline-flex; gap: 8px; }

        .reaction-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; font-weight: 600; cursor: pointer;
          border-radius: 10px; line-height: 1;
          border: 1px solid var(--stroke, rgba(0,0,0,.12));
          background: var(--surface, #fff);
          color: var(--ink, #111);
          box-shadow: inset 0 -1px 0 rgba(0,0,0,.04);
          transition: box-shadow .15s ease, transform .06s ease, border-color .2s ease;
        }
        .reaction-btn:hover {
          box-shadow: 0 0 0 2px var(--ring, rgba(255,0,153,.25)) inset;
        }
        .reaction-btn:active { transform: translateY(1px); }

        .btn--ghost {
          background: transparent;
          color: var(--muted, #4b5563);
          border-color: var(--stroke, rgba(0,0,0,.12));
        }

        .reaction-flyout {
          position: absolute; left: 0; bottom: 44px;
          display: inline-flex; gap: 8px; padding: 6px 8px; z-index: 30;
          background: var(--surface, #fff);
          border: 1px solid var(--stroke, rgba(0,0,0,.12));
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,.10),
                      inset 0 1px 0 rgba(255,255,255,.6);
        }

        .reaction {
          width: 36px; height: 36px;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 12px; cursor: pointer;
          background: var(--surface, #fff);
          border: 1px solid var(--stroke, rgba(0,0,0,.12));
        }
      `}</style>
    </div>
  );
}
