// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import PortalHero from '@/components/ai/PortalHero';

export default function Page() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
        <div />
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
          {/* Sticky hero: outer is sticky, transforms happen on inner child */}
          <section className="heroWrap">
            <PortalHero />
          </section>

          {/* Example content */}
          <section aria-label="Feed" className="cards">
            {Array.from({ length: 6 }).map((_, i) => (
              <article key={i} className="card">
                <h3>Post #{i + 1}</h3>
                <p>
                  Minimal white UI with pink (<span className="chip pink">#ff2db8</span>) and blue
                  (<span className="chip blue">#4f46e5</span>) accents.
                </p>
                <img
                  src="https://picsum.photos/seed/snova2177/960/540"
                  alt="placeholder"
                  loading="lazy"
                />
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
        role="dialog"
        aria-modal="true"
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

      <style>{`
        /* Top bar */
        .topbar{
          position:sticky; top:0; z-index:10;
          display:grid; grid-template-columns:48px 1fr 48px;
          align-items:center; height:56px; padding:0 12px;
          background:var(--bg); border-bottom:1px solid #eee;
        }
        .brand{display:flex; gap:10px; align-items:center; font-weight:700}
        .menuBtn{
          display:none;
          border:1px solid #eee; background:#fff; height:36px; width:36px;
          border-radius:10px;
        }
        @media (max-width:1100px){ .menuBtn{display:inline-flex; align-items:center; justify-content:center} }

        /* 3-column layout with capped center */
        .layout{
          display:grid;
          grid-template-columns: 1fr min(720px, 100%) 1fr;
          gap:24px; padding:24px; margin:0 auto; max-width:1400px;
        }
        .rail{position:relative}
        .leftRail nav, .panel{
          position:sticky; top:80px;
          padding:16px; border:1px solid #eee; border-radius:16px; background:#fff;
        }
        .leftRail a{display:block; padding:10px 8px; border-radius:10px; text-decoration:none; color:var(--ink)}
        .leftRail a:focus-visible, .leftRail a:hover{background:#f6f6f6; outline:none}

        .feed{min-height:60vh}

        /* Sticky hero on mobile only */
        .heroWrap{ position:relative; }
        @media (max-width:768px){
          .heroWrap{ position:sticky; top:0; z-index:5; background:#fff }
        }

        /* Content cards */
        .cards{ display:grid; gap:20px; }
        .card{
          border:1px solid #eee; border-radius:18px; padding:16px; background:#fff;
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
          transform:translateX(-100%);
          transition:transform 260ms ease;
          z-index:60; background:#fff; border-right:1px solid #eee;
          padding:16px; overflow-y:auto;
        }
        .drawer nav a{ display:block; padding:12px 10px; border-radius:10px; color:var(--ink); text-decoration:none }
        .drawer nav a:hover{ background:#f6f6f6 }
        .drawer .close{
          border:none; background:#fff; font-size:28px; line-height:1; padding:0 0 8px 0;
        }
        .drawer.open{ transform:translateX(0) }
        .scrim{
          position:fixed; inset:0; background:rgba(0,0,0,.0);
          opacity:0; pointer-events:none; transition:opacity 200ms ease; z-index:50;
        }
        .scrim.show{ background:rgba(0,0,0,.45); opacity:1; pointer-events:auto; }
      `}</style>
    </>
  );
}
