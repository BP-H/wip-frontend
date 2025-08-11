// app/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// 👉 change this path if your file is at "@/components/PortalHero"
const PortalHero = dynamic(() => import('@/components/ai/PortalHero'), { ssr: false });

type Post = { id: string; title: string; img?: string };

export default function Page() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Demo feed
  const cards = useMemo<Post[]>(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: String(i + 1),
        title: `Post #${i + 1}`,
        img: `https://picsum.photos/seed/snova2177_${i}/960/540`,
      })),
    []
  );

  // Close drawer on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Focus trap + scroll lock when drawer open
  useEffect(() => {
    if (!drawerOpen || !drawerRef.current) return;

    const el = drawerRef.current;
    const focusables = el.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    // put focus in drawer, lock scroll
    first?.focus();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    el.addEventListener('keydown', onKeyDown);
    return () => {
      el.removeEventListener('keydown', onKeyDown);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  return (
    <>
      {/* Top bar */}
      <header className="topbar" role="banner">
        <button
          className="menuBtn"
          aria-label="Open navigation"
          aria-controls="mobile-drawer"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          ☰
        </button>

        <div className="brand">
          <img src="/icon.png" alt="superNova logo" width={28} height={28} />
          <strong>superNova_2177</strong>
        </div>

        <div aria-hidden />
      </header>

      {/* Layout grid */}
      <div className="layout">
        <aside className="rail leftRail" aria-label="Primary">
          <nav>
            <a href="#">Home</a>
            <a href="#">Explore</a>
            <a href="#">Enter Metaverse</a>
            <a href="#">Profile</a>
          </nav>
        </aside>

        <main className="feed">
          {/* Sticky hero: OUTER is sticky; inner scaling happens inside the component */}
          <section className="heroWrap">
            <PortalHero />
          </section>

          {/* Feed */}
          <section aria-label="Feed" className="cards">
            {cards.map((c) => (
              <article key={c.id} className="card">
                <h3>{c.title}</h3>
                <p>
                  Minimal white UI with pink (<span className="chip pink">#ff2db8</span>) and blue{' '}
                  (<span className="chip blue">#4f46e5</span>) accents.
                </p>
                {c.img && (
                  <img src={c.img} alt="" loading="lazy" decoding="async" />
                )}
              </article>
            ))}
          </section>
        </main>

        <aside className="rail rightRail" aria-label="Secondary">
          <div className="panel">
            <h4>Who to follow</h4>
            <ul>
              <li><a href="#">ae-User</a></li>
              <li><a href="#">nova-bot</a></li>
              <li><a href="#">portal-dev</a></li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Mobile drawer + scrim */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className={`drawer ${drawerOpen ? 'open' : ''}`}
      >
        <nav>
          <button className="close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            ×
          </button>
          <a href="#" onClick={() => setDrawerOpen(false)}>Home</a>
          <a href="#" onClick={() => setDrawerOpen(false)}>Explore</a>
          <a href="#" onClick={() => setDrawerOpen(false)}>Enter Metaverse</a>
          <a href="#" onClick={() => setDrawerOpen(false)}>Profile</a>
        </nav>
      </div>

      <div
        className={`scrim ${drawerOpen ? 'show' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      {/* tokens (80% white / 15% pink / 5% blue) */}
      <style jsx global>{`
        :root{
          --topbar-h: 56px;
          --bg:#fafafc; --panel:#ffffff; --ink:#111827; --muted:#6b7280; --stroke:#e5e7eb;
          --pink:#ff2db8; --blue:#4f46e5;
        }
        html, body { background: var(--bg); color: var(--ink); }
        * { box-sizing: border-box; }
      `}</style>

      <style>{`
        /* Top bar */
        .topbar{
          position:sticky; top:0; z-index:10;
          display:grid; grid-template-columns:48px 1fr 48px;
          align-items:center; height:var(--topbar-h); padding:0 12px;
          background:var(--panel); border-bottom:1px solid var(--stroke);
          backdrop-filter: blur(8px);
        }
        .brand{display:flex; gap:10px; align-items:center; font-weight:700}
        .menuBtn{
          display:none;
          border:1px solid var(--stroke); background:#fff; height:36px; width:36px;
          border-radius:10px;
        }
        @media (max-width:1100px){
          .menuBtn{display:inline-flex; align-items:center; justify-content:center}
        }

        /* 3-column layout with capped center */
        .layout{
          display:grid;
          grid-template-columns: 1fr min(720px, 100%) 1fr;
          gap:24px; padding:24px; margin:0 auto; max-width:1400px;
        }
        .rail{position:relative}
        .leftRail nav, .panel{
          position:sticky; top:calc(var(--topbar-h) + 24px);
          padding:16px; border:1px solid var(--stroke); border-radius:16px; background:#fff;
        }
        .leftRail a{display:block; padding:10px 8px; border-radius:10px; text-decoration:none; color:var(--ink)}
        .leftRail a:focus-visible, .leftRail a:hover{background:#f6f6f6; outline:none}

        .feed{min-height:60vh}

        /* Sticky hero ALWAYS (sits under the topbar) */
        .heroWrap{
          position:sticky; top:var(--topbar-h); z-index:5; background:#fff;
          /* no transforms here; the PortalHero scales a child internally */
        }

        /* Content cards */
        .cards{ display:grid; gap:20px; }
        .card{
          border:1px solid var(--stroke); border-radius:18px; padding:16px; background:#fff;
          box-shadow:0 1px 0 #f3f4f6 inset, 0 8px 24px rgba(17,24,39,.04);
        }
        .card img{ width:100%; height:auto; border-radius:12px; display:block; }
        .chip{ font-family:monospace; padding:2px 6px; border-radius:8px; background:#f5f5f5 }
        .chip.pink{ color:var(--pink) }
        .chip.blue{ color:var(--blue) }

        .rightRail .panel h4{ margin:0 0 8px 0 }
        .rightRail .panel ul{ margin:0; padding:0; list-style:none }
        .rightRail .panel li + li{ margin-top:6px }

        /* Collapse rails <=1100px */
        @media (max-width:1100px){
          .layout{ grid-template-columns: minmax(0, 1fr); }
          .leftRail, .rightRail{ display:none; }
        }

        /* Drawer + scrim */
        .drawer{
          position:fixed; left:0; top:0; bottom:0; width:280px;
          transform:translateX(-100%); transition:transform 260ms ease;
          z-index:60; background:#fff; border-right:1px solid var(--stroke);
          padding:16px; overflow-y:auto;
        }
        .drawer nav a{ display:block; padding:12px 10px; border-radius:10px; color:var(--ink); text-decoration:none }
        .drawer nav a:hover{ background:#f6f6f6 }
        .drawer .close{ border:none; background:#fff; font-size:28px; line-height:1; padding:0 0 8px 0; }
        .drawer.open{ transform:translateX(0) }

        .scrim{
          position:fixed; inset:0; background:rgba(0,0,0,0);
          opacity:0; pointer-events:none; transition:opacity 200ms ease; z-index:50;
        }
        .scrim.show{ background:rgba(0,0,0,.45); opacity:1; pointer-events:auto; }

        @media (prefers-reduced-motion: reduce){
          .drawer{ transition:none }
          .scrim{ transition:none }
        }
      `}</style>
    </>
  );
}
