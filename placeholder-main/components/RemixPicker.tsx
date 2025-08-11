// components/RemixPicker.tsx
"use client";

import React, { useState } from "react";

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
  if (!open) return null;

  function toggle(name: string) {
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
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
        <h3 style={{ margin: "4px 0 10px 0" }}>Choose an AI to remix with</h3>
        <p style={{ opacity: 0.8, marginTop: 0 }}>
          We’ll route the prompt to your selected services. You can plug real API keys later.
        </p>
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {ALL_APIS.map((label) => (
            <label key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={selected.includes(label)}
                onChange={() => toggle(label)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button className="sn-btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="sn-btn"
            type="button"
            onClick={() => {
              onConfirm?.(selected);
              onClose();
            }}
            style={{ fontWeight: 800 }}
          >
            Remix
          </button>
        </div>
      </div>
    </div>
  );
}
