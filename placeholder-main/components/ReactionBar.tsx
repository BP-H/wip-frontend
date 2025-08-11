// components/ReactionBar.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

/** shape sent to your handler */
export type ReactionEvent = { emoji: string; source: "quick" | "picker" };

type Props = {
  emojis?: string[];
  defaultEmoji?: string;
  onReact?: (ev: ReactionEvent) => void;
  /** for accessibility; multiple bars on a page are fine */
  id?: string;
};

/**
 * Defensive ReactionBar:
 * - Desktop: hover opens the tray, click = default 👍 (or your defaultEmoji)
 * - Mobile: long‑press opens the tray, quick tap = default
 * - Esc to close; click outside closes
 * - Works WITHOUT framer‑motion; if you later install it, you can animate via CSS or library
 */
export default function ReactionBar({
  emojis = ["👍", "❤️", "🤗", "🔥", "🧠", "👏"],
  defaultEmoji = "👍",
  onReact,
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const longRef = useRef<number | null>(null);

  // SSR-safe touch detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouch(("ontouchstart" in window) || navigator.maxTouchPoints > 0);
    }
  }, []);

  // Close on escape / outside click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  const commit = (emoji: string, source: "quick" | "picker") => {
    onReact?.({ emoji, source });
    setOpen(false);
  };

  // Desktop behavior
  const onMouseEnter = () => !isTouch && setOpen(true);
  const onMouseLeave = () => !isTouch && setOpen(false);
  const onMainClick = () => !isTouch && commit(defaultEmoji, "quick");

  // Mobile long-press behavior
  const onTouchStart = () => {
    if (!isTouch) return;
    longRef.current = window.setTimeout(() => setOpen(true), 350);
  };
  const onTouchEnd = () => {
    if (!isTouch) return;
    if (longRef.current) {
      clearTimeout(longRef.current);
      longRef.current = null;
      // if the tray didn’t open yet, it was a quick tap
      if (!open) commit(defaultEmoji, "quick");
    }
  };

  return (
    <div
      ref={rootRef}
      className="rb"
      id={id}
      aria-label="Reactions"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        className="rb-main"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onMainClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <span aria-hidden>🙂</span>
        <span className="rb-label">React</span>
      </button>

      <div role="menu" className={`rb-tray ${open ? "open" : ""}`}>
        {emojis.map((e) => (
          <button
            key={e}
            role="menuitem"
            type="button"
            className="rb-emoji"
            aria-label={`React ${e}`}
            onClick={() => commit(e, "picker")}
          >
            {e}
          </button>
        ))}
      </div>

      <style jsx>{`
        .rb { position: relative; display: inline-block; }
        .rb-main {
          display:inline-flex; gap:.5rem; align-items:center;
          height:36px; padding:0 12px; border-radius:12px;
          background:#121a2a; color:#e9edf7; border:1px solid var(--sn-stroke);
          font-weight:600;
        }
        .rb-main:hover { box-shadow:0 0 0 2px var(--sn-ring) inset; border-color:#2a3754; }

        .rb-tray {
          position:absolute; bottom:42px; left:0;
          display:flex; gap:6px; padding:6px;
          background:#0f1626; border:1px solid var(--sn-stroke);
          border-radius:999px; box-shadow:0 10px 30px rgba(0,0,0,.25);
          opacity:0; visibility:hidden; transform: translateY(6px) scale(.98);
          transition: opacity .15s ease, transform .15s ease, visibility .15s;
          pointer-events:none;
        }
        .rb-tray.open { opacity:1; visibility:visible; transform: translateY(0) scale(1); pointer-events:auto; }

        .rb-emoji {
          width:36px; height:36px; border-radius:999px; border:1px solid var(--sn-stroke);
          background:#121a2a; color:#fff; font-size:18px; line-height:34px;
        }
        .rb-emoji:focus-visible { outline:2px solid var(--sn-accent2); outline-offset:2px; }

        @media (prefers-reduced-motion: reduce) {
          .rb-tray { transition: none; }
        }
      `}</style>
    </div>
  );
}
