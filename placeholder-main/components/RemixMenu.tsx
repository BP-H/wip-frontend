// components/RemixMenu.tsx
"use client";

import React, { useState } from "react";

export type RemixMenuProps = {
  /** Called when the user confirms “Create remix”. */
  onRemix?: () => void;
  /** Alias some codebases use; we’ll call either if present. */
  onCreate?: () => void;
  /** Optional close callback when the menu closes. */
  onClose?: () => void;
  /** Disable the trigger button. */
  disabled?: boolean;
  /** Extra classes for outer wrapper. */
  className?: string;
  /** Optional label override for the trigger button. */
  label?: string;
};

/**
 * Minimal, dependency-free Remix menu.
 * - No external libs
 * - All props optional
 * - Exports both named and default (so `import RemixMenu` or `import { RemixMenu }` both work)
 */
export function RemixMenu({
  onRemix,
  onCreate,
  onClose,
  disabled = false,
  className = "",
  label = "Remix",
}: RemixMenuProps) {
  const [open, setOpen] = useState(false);

  function toggle() {
    setOpen(v => !v);
  }
  function close() {
    setOpen(false);
    try { onClose?.(); } catch {}
  }
  function runRemix() {
    try {
      if (onRemix) onRemix();
      else if (onCreate) onCreate();
    } catch {}
    close();
  }

  return (
    <div className={className} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="sn-btn"
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 8px 24px rgba(16,24,40,0.14)",
            padding: 12,
            borderRadius: 12,
            minWidth: 240,
            zIndex: 50,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Create a remix</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 10 }}>
            Keys never leave your browser. For production, route through your own FastAPI proxy if you need CORS.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="sn-btn" onClick={runRemix} role="menuitem">
              Create remix
            </button>
            <button type="button" className="sn-btn" onClick={close} role="menuitem">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RemixMenu;
