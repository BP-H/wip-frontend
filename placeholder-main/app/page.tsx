// app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";

/* ────────────────────────────────────────────────────────────────────────────
   80/15/5 THEME (matte white)
   ─ white primary, pink primary-accent, thin neon-blue accent
   This page injects global tokens so it looks the same on every device.
   ──────────────────────────────────────────────────────────────────────────── */

const GlobalStyles = () => (
  <style jsx global>{`
    :root {
      --bg: #ffffff;
      --text: #0a0f1a;
      --muted: #657089;
      --stroke: #e7eaf2;
      --card: #ffffff;
      --card-2: #f7f9fc;
      --shadow: 0 8px 24px rgba(12, 18, 28, 0.06);

      /* 80/15/5 split */
      --pink: #ff2db8;        /* 15% */
      --blue: #2fe4ff;        /* 5% (neon-thin) */
      --blue-ghost: rgba(47, 228, 255, 0.16);
    }

    /* force white even if your globals.css says "dark" */
    html, body {
      background: var(--bg) !important;
      color: var(--text) !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    * { box-sizing: border-box; }

    .page {
      min-height: 100dvh;
      display: grid;
      grid-template-rows: auto 1fr;
      background:
        radial-gradient(80% 60% at 0% 0%, var(--blue-ghost), transparent 60%),
        linear-gradient(180deg, #fff, #fbfcff 40%, #ffffff 100%);
    }

    /* topbar */
    .topbar {
      position: sticky; top: 0; z-index: 20;
      display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 12px; align-items: center;
      padding: 12px 18px;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--stroke);
    }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; }
    .pill { display:inline-flex; align-items:center; height:28px; padding:0 .6rem; border-radius:999px;
            border:1px solid var(--stroke); background: var(--card-2); font-size:12px; color:var(--muted); }
    .search {
      background: var(--card-2);
      border: 1px solid var(--stroke);
      height: 40px; border-radius: 12px; padding: 0 12px;
      display: flex; align-items: center; gap: 8px;
    }
    .search input {
      border: 0; outline: 0; background: transparent; width: 100%;
      color: var(--text);
    }
    .actions { display:flex; justify-content:flex-end; gap: 8px; }
    .btn {
      height: 40px; padding: 0 14px; border-radius: 12px; font-weight: 700;
      border: 1px solid var(--stroke); background: var(--card-2); color: var(--text);
    }
    .btn:hover { border-color: #d8deea; box-shadow: inset 0 0 0 2px var(--blue-ghost); }
    .btn.primary {
      border: 0; color: #fff;
      background: linear-gradient(90deg, var(--pink), #b44dff);
      box-shadow: 0 6px 20px rgba(255, 45, 184, 0.25);
    }

    /* layout */
    .wrap { max-width: 980px; margin: 0 auto; padding: 16px; }
    .hero {
      border: 1px solid var(--stroke); border-radius: 16px; background: var(--card);
      padding: 18px; box-shadow: var(--shadow); margin-bottom: 14px;
    }
    .heroCanvas {
      height: 220px; border: 1px solid var(--stroke); border-radius: 12px; margin-bottom: 12px;
      background:
        conic-gradient(from 0.25turn at 30% 50%, rgba(255,45,184,.15), transparent 40%),
        radial-gradient(65% 80% at 70% 30%, rgba(47,228,255,.18), transparent 55%),
        linear-gradient(180deg, #fff, #f7fafc);
    }

    /* feed */
    .feed { display: grid; gap: 12px; }
    .card {
      border: 1px solid var(--stroke);
      border-radius: 16px;
      background: var(--card);
      padding: 14px;
      box-shadow: var(--shadow);
    }
    .muted { color: var(--muted); }
    .title { margin: 0 0 4px 0; font-weight: 800; }
    .ctaRow { display:flex; gap:8px; flex-wrap: wrap; }

    /* Reaction bar */
    .reactionRow { display: inline-flex; gap: 8px; }
    .reaction-btn {
      height: 34px; padding: 0 10px; border-radius: 10px;
      border: 1px solid var(--stroke); background: var(--card-2);
      color: var(--text); font-weight: 700;
    }
    .reaction-btn.btn--ghost { background: #fff; }
    .reaction-btn:hover { border-color: #d8deea; box-shadow: inset 0 0 0 2px var(--blue-ghost); }

    .reaction-flyout {
      position: absolute; left: 0; top: calc(100% + 8px);
      display: flex; gap: 6px; padding: 6px;
      border: 1px solid var(--stroke); border-radius: 999px;
      background: #fff; box-shadow: var(--shadow);
    }
    .reaction {
      width: 36px; height: 36px; border-radius: 999px; border: 1px solid var(--stroke); background: #fff;
      display: inline-flex; align-items: center; justify-content: center;
    }

    /* mobile collapse */
    @media (max-width: 900px) {
      .topbar { grid-template-columns: 1fr 1.2fr auto; }
      .actions { display: none; }
      .heroCanvas { height: 180px; }
    }
  `}</style>
);

/* tiny data‑URI favicon so you don't need to add files right now */
const FavIcon = () => (
  <Head>
    <link
      rel="icon"
      href={
        "data:image/svg+xml," +
        encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
             <rect width='64' height='64' rx='12' fill='#ffffff'/>
             <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='44'>💫</text>
           </svg>`
        )
      }
    />
    <title>superNova_2177</title>
  </Head>
);

/* ────────────────────────────────────────────────────────────────────────────
   Reactions (LinkedIn‑style) — hover on desktop, long‑press on mobile
   ──────────────────────────────────────────────────────────────────────────── */

type Reaction = { key: string; emoji: string; label: string };
const REACTIONS: Reaction[] = [
  { key: "like",  emoji: "👍", label: "Like" },
  { key: "love",  emoji: "❤️", label: "Love" },
  { key: "hug",   emoji: "🤗", label: "Hug" },
  { key: "cry",   emoji: "😭", label: "Cry" },
  { key: "fire",  emoji: "🔥", label: "Fire" },
  { key: "light", emoji: "💡", label: "Insightful" },
];

function ReactionBar({
  onReact,
  defaultLabel = "Like",
}: {
  onReact?: (r: Reaction) => void;
  defaultLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pressed, setPressed] = useState<Reaction | null>(null);
  const hold = useRef<number | null>(null);

  const startHold = () => {
    if (hold.current) return;
    hold.current = window.setTimeout(() => setOpen(true), 380);
  };
  const endHold = () => {
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = null;
  };
  useEffect(() => () => endHold(), []);

  const choose = (r: Reaction) => {
    setPressed(r);
    setOpen(false);
    onReact?.(r);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div className="reactionRow">
        <button
          className="reaction-btn"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onClick={() => choose(REACTIONS[0])}
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
                onClick={() => choose(r)}
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

/* ────────────────────────────────────────────────────────────────────────────
   Tiny infinite feed (no backend)
   ──────────────────────────────────────────────────────────────────────────── */

type Post = { id: number; title: string; body: string };
const makePost = (i: number): Post => ({
  id: i,
  title: i % 5 === 0 ? "3D glimpse — low‑poly wave" : `Post #${i}`,
  body:
    i % 5 === 0
      ? "Glimpse card: light angular gradient (WebGL later, mobile‑safe now)."
      : "Matte‑white UI, angular rhythm, and neon accents only where needed.",
});

function useInfinitePosts() {
  const [items, setItems] = useState<Post[]>(Array.from({ length: 10 }, (_, i) => makePost(i + 1)));
  const [page, setPage] = useState(1);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // load next page
        const base = page * 10 + 1;
        const more = Array.from({ length: 10 }, (_, i) => makePost(base + i));
        setItems((s) => [...s, ...more]);
        setPage((p) => p + 1);
      }
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [page]);

  return { items, sentinelRef: ref };
}

/* ────────────────────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────────────────────── */

export default function Page() {
  const { items, sentinelRef } = useInfinitePosts();

  return (
    <div className="page">
      <FavIcon />
      <GlobalStyles />

      <header className="topbar">
        <div className="brand">
          <span className="pill">SN</span>
          <b>superNova_2177</b>
        </div>
        <div className="search">
          <input placeholder="Search posts, people, companies…" aria-label="Search" />
        </div>
        <div className="actions">
          <button className="btn">Create post</button>
          <button className="btn primary">Launch 3D (beta)</button>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <div className="heroCanvas" />
          <p className="muted" style={{ margin: 0 }}>
            Validity rails reflect live entropy → lower entropy bends brighter rails. Humans • AIs • Companies participate as peers in a symbolic economy.
          </p>
          <div className="ctaRow" style={{ marginTop: 10 }}>
            <button className="btn primary">Open Universe</button>
            <button className="btn">Remix a Story</button>
            <button className="btn" aria-label="Deploy on Vercel">Deploy on Vercel</button>
          </div>
        </section>

        <section className="feed" aria-live="polite">
          {items.map((p) => (
            <article className="card" key={p.id}>
              <h4 className="title">{p.title}</h4>
              <p className="muted" style={{ margin: "4px 0 10px" }}>{p.body}</p>

              {/* every 5th item shows a subtle “glimpse” block instead of real WebGL */}
              {p.title.startsWith("3D glimpse") && (
                <div
                  style={{
                    height: 160,
                    borderRadius: 12,
                    border: "1px solid var(--stroke)",
                    background:
                      "conic-gradient(from .2turn at 20% 40%, rgba(255,45,184,.20), transparent 40%), radial-gradient(60% 80% at 75% 30%, rgba(47,228,255,.22), transparent 55%), linear-gradient(180deg, #fff, #f5f8ff)",
                    marginBottom: 10,
                  }}
                />
              )}

              <ReactionBar onReact={(r) => console.log("reacted:", r)} />
            </article>
          ))}
          {/* sentinel triggers more posts */}
          <div ref={sentinelRef} style={{ height: 1 }} />
        </section>
      </main>
    </div>
  );
}
