// components/RemixPicker.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm?: (choices: string[]) => void;
};

const ALL_APIS = [
  "OpenAI (GPT / SORA)",
  "Higgsfield",
  "Fal.ai",
  "Replicate",
  "Local (WebGPU)",
];

export default function RemixPicker({ open, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  // Clear selections whenever the dialog closes
  useEffect(() => {
    if (!open) setSelected([]);
  }, [open]);

  // A11y/UX: Esc to close, focus trap, initial focus, scroll lock, restore focus
  useEffect(() => {
    if (!open) return;

    lastFocusRef.current =
      (document.activeElement as HTMLElement | null) ?? null;

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Initial focus inside dialog
    const focusFirst = () => {
      const root = rootRef.current;
      if (!root) return;
      const nodes = root.querySelectorAll<HTMLElement>(
        'input,button,[href],[tabindex]:not([tabindex="-1"])'
      );
      (nodes[0] ?? root).focus();
    };
    const t = setTimeout(focusFirst, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const root = rootRef.current;
        if (!root) return;
        const nodes = Array.from(
          root.querySelectorAll<HTMLElement>(
            'input,button,[href],[tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"));
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      // Restore focus to the element that opened the dialog
      lastFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  function toggle(name: string) {
    setSelected((s) =>
      s.includes(name) ? s.filter((x) => x !== name) : [...s, name]
    );
  }

  function confirm() {
    try {
      onConfirm?.(selected);
    } finally {
      onClose();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="remix-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        zIndex: 80,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        ref={rootRef}
        role="document"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 94vw)",
          borderRadius: 16,
          padding: 16,
          background: "linear-gradient(180deg,#0e1116,#0b0d12)",
          color: "#eaecef",
          border: "1px solid rgba(255,255,255,.14)",
          boxShadow: "0 10px 40px rgba(0,0,0,.45)",
        }}
      >
        <h3 id="remix-title" style={{ margin: "4px 0 10px 0", fontWeight: 800 }}>
          Choose an AI to remix with
        </h3>
        <p style={{ opacity: 0.8, marginTop: 0 }}>
          We’ll route the prompt to your selected services. You can plug real API
          keys later.
        </p>

        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {ALL_APIS.map((label) => (
            <label
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <input
                type="checkbox"
                checked={selected.includes(label)}
                onChange={() => toggle(label)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          <button
            className="sn-btn"
            type="button"
            onClick={onClose}
            aria-label="Cancel remix"
          >
            Cancel
          </button>
          <button
            className="sn-btn"
            type="button"
            onClick={confirm}
            disabled={!selected.length}
            aria-disabled={!selected.length}
            style={{ fontWeight: 800 }}
          >
            Remix
          </button>
        </div>
      </div>
    </div>
  );
}
