// app/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// 3D hero (no SSR)
const PortalHero = dynamic(() => import('@/components/PortalHero'), { ssr: false });

type Post = { id: string; author: string; text: string; time: string; image?: string };

// demo feed
function makeBatch(offset: number, size = 10): Post[] {
  return Array.from({ length: size }).map((_, i) => {
    const n = offset + i;
    return {
      id: String(n),
      author: ['@proto_ai', '@neonfork', '@superNova_2177'][n % 3],
      time: new Date(Date.now() - n * 1000 * 60 * 5).toLocaleString(),
      text:
        n % 3 === 0
          ? 'Low‑poly moment — rotating differently in each instance as you scroll.'
          : 'Prototype feed — symbolic demo copy for layout testing.',
      image: n % 2 === 0 ? `https://picsum.photos/seed/sn_${n}/960/540` : undefined,
    };
  });
}

export default function Page() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // feed
  const [items, setItems] = useState<Post[]>(() => makeBatch(0, 12));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        const [e] = entries;
        if (!e.isIntersecting || loading || !hasMore) return;
        setLoading(true);
        setTimeout(() => {
          const next = makeBatch(page * 12, 12);
          setItems((prev) => [...prev, ...next]);
          setPage((p) => p + 1);
          if (page >= 10) setHasMore(false); // demo cap
          setLoading(false);
        }, 220);
      },
      { rootMargin: '1200px 0px 800px 0px' }
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [page, loading, hasMore]);

  // measure header height → CSS var so sticky math is exact
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const header = document.querySelector<HTMLElement>('header.topbar');
    if (!header) return;
    const set = () =>
      document.documentElement.style.setProperty('--topbar-h', `${header.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(header);
    window.addEventListener('resize', set);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', set);
    };
  }, []);

  // ESC closes drawer; lock body scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = drawerOpen ? 'hidden' : prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <main className="root">
      {/* FIXED header (mobile-safe) */}
      <header className="topbar" role="banner">
        <div className="leftCluster">
          <button
            className="iconBtn showMobile"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            ☰
          </button>
          <Link className="brand" href="/" aria-label="Home">
            <Image src="/icon.png" width={24} height={24} alt="app" className="logo" />
            <b>superNova_2177</b>
          </Link>
        </div>

        <div className="search">
          <input placeholder="Search posts, people, companies…" aria-label="Search" />
        </div>

        <div className="actions">
          <Link href="/3d" className="btn primary" style={{ textDecoration: 'none' }}>
            Launch 3D
          </Link>
          <button
            className="avatarBtn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            title="Open profile"
          >
            <Image src="/icon.png" width={28} height={28} alt="Profile" />
          </button>
          {menuOpen && (
            <div role="menu" className="avatarMenu" onMouseLeave={() => setMenuOpen(false)}>
              <Link href="/profile" role="menuitem">
                Profile
              </Link>
              <Link href="/settings" role="menuitem">
                Settings
              </Link>
              <Link href="/proposals" role="menuitem">
                Proposals
              </Link>
            </div>
          )}
        </div>
      </header>
      <div className="topbarSpacer" aria-hidden />

      {/* Mobile drawer + scrim */}
      {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} />}
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="card profileCard" style={{ marginBottom: 10 }}>
          <div className="profileRow">
            <div className="avatar">
              <Image src="/icon.png" width={48} height={48} alt="avatar" />
            </div>
            <div>
              <div className="name">taha_gungor</div>
              <div className="muted">artist • test_tech</div>
            </div>
          </div>
        </div>
        {[
          'Feed',
          'Messages',
          'Proposals',
          'Decisions',
          'Execution',
          'Companies',
          'Settings',
        ].map((l) => (
          <button key={l} className="btn ghost leftnav" style={{ width: '100%' }}>
            {l}
          </button>
        ))}
        <button className="btn" style={{ marginTop: 12 }} onClick={() => setDrawerOpen(false)}>
          Close
        </button>
      </aside>

      {/* Layout */}
      <div className="shell">
        {/* left rail (desktop) */}
        <aside className="left">
          <div className="card profileCard">
            <div className="profileRow">
              <div className="avatar">
                <Image src="/icon.png" width={48} height={48} alt="avatar" />
              </div>
              <div>
                <div className="name">taha_gungor</div>
                <div className="muted">artist • test_tech</div>
              </div>
            </div>
          </div>

          <nav className="card navStack">
            {[
              'Feed',
              'Messages',
              'Proposals',
              'Decisions',
              'Execution',
              'Companies',
              'Settings',
            ].map((l) => (
              <button key={l} className="btn ghost leftnav">
                {l}
              </button>
            ))}
          </nav>

          <div className="card">
            <div className="muted">Quick stats</div>
            <div className="kpis">
              <div className="tile">
                <div className="k">2,302</div>
                <div className="muted">Profile views</div>
              </div>
              <div className="tile">
                <div className="k">1,542</div>
                <div className="muted">Post reach</div>
              </div>
              <div className="tile">
                <div className="k">12</div>
                <div className="muted">Companies</div>
              </div>
            </div>
          </div>
        </aside>

        {/* center column */}
        <section className="center">
          {/* ---- SMALL STICKY PORTAL DOCK (only the portal sticks) ---- */}
          <section className="portalDock" aria-label="Portal">
            <PortalHero />
          </section>

          {/* hero copy & CTAs (scrolls away, *not* sticky) */}
          <div className="card heroCopyCard">
            <p className="muted">
              Minimal UI, neon <b>superNova</b> accents (pink/blue). The portal compresses as you
              scroll and stays under the header on all devices.
            </p>
            <div className="ctaRow">
              <Link href="/3d" className="btn primary" style={{ textDecoration: 'none' }}>
                Open Universe
              </Link>
              <button className="btn">Remix a Universe</button>
            </div>
          </div>

          {/* feed */}
          {items.map((p) => (
            <article key={p.id} className="card post">
              <header className="postHead">
                <strong>{p.author}</strong>
                <span className="muted"> • {p.time}</span>
              </header>
              <p className="postText">{p.text}</p>
              {p.image && (
                <div className="mediaWrap">
                  <img src={p.image} alt="" loading="lazy" decoding="async" />
                </div>
              )}
              <footer className="postActions">
                <button className="chip">Like</button>
                <button className="chip">Comment</button>
                <button className="chip">Share</button>
              </footer>
            </article>
          ))}
          <div ref={sentinelRef} className="sentinel">
            {loading ? 'Loading…' : hasMore ? ' ' : '— End —'}
          </div>
        </section>

        {/* right rail */}
        <aside className="right">
          <div className="card">
            <div className="sectionTitle">Identity</div>
            <div className="muted">Switch modes and manage entities.</div>
          </div>

          <div className="card">
            <div className="sectionTitle">Company Control Center</div>
            <div className="muted">Spin up spaces, manage proposals, and ship pipelines.</div>
            <div className="stack">
              <button className="btn primary">Create Company</button>
              <button className="btn">Open Dashboard</button>
            </div>
          </div>

          <div className="card">
            <div className="sectionTitle">Shortcuts</div>
            <div className="stack">
              <button className="btn">New Proposal</button>
              <button className="btn">Start Vote</button>
              <button className="btn">Invite Member</button>
            </div>
          </div>
        </aside>
      </div>

      {/* THEME (pink nova gradient + glass cards) */}
      <style jsx global>{`
        :root {
          --topbar-h: 64px; /* updated at runtime */
          --bg0: #ff0aa2;
          --bg1: #ff33d1;
          --panel: #141722;
          --ink: #f5f7fb;
          --muted: #a2a8b6;
          --stroke: #262a33;
          --pink: #ff2db8;
          --blue: #4f46e5;
        }
        html,
        body {
          background: linear-gradient(180deg, var(--bg0) 0%, var(--bg1) 100%);
          color: var(--ink);
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

      {/* PAGE STYLES */}
      <style jsx>{`
        .root {
          min-height: 100vh;
        }

        /* fixed, glass header */
        .topbar {
          position: fixed;
          inset: env(safe-area-inset-top, 0px) 0 auto 0;
          z-index: 1000;
          display: grid;
          grid-template-columns: 220px minmax(320px, 740px) 220px;
          align-items: center;
          gap: 16px;
          height: var(--topbar-h);
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 11, 16, 0.6);
          backdrop-filter: blur(10px);
        }
        .topbarSpacer {
          height: calc(var(--topbar-h) + env(safe-area-inset-top, 0px));
        }
        .leftCluster {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          color: var(--ink);
          text-decoration: none;
        }
        .logo {
          border-radius: 8px;
        }
        .iconBtn {
          height: 40px;
          min-width: 40px;
          border-radius: 12px;
          border: 1px solid var(--stroke);
          background: var(--panel);
          color: var(--ink);
        }
        .search {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          height: 40px;
          display: flex;
          align-items: center;
          padding: 0 12px;
        }
        .search input {
          flex: 1;
          height: 100%;
          background: transparent;
          border: 0;
          outline: 0;
          color: var(--ink);
          font-size: 14px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          position: relative;
        }
        .avatarBtn {
          height: 40px;
          width: 40px;
          border-radius: 12px;
          border: 1px solid var(--stroke);
          background: var(--panel);
          display: grid;
          place-items: center;
        }
        .avatarMenu {
          position: absolute;
          top: 44px;
          right: 0;
          background: var(--panel);
          border: 1px solid var(--stroke);
          border-radius: 12px;
          padding: 8px;
          display: grid;
          gap: 6px;
        }
        .avatarMenu a {
          color: var(--ink);
          text-decoration: none;
          padding: 8px 10px;
          border-radius: 8px;
        }
        .avatarMenu a:hover {
          background: #1a1f29;
        }

        /* grid shell */
        .shell {
          display: grid;
          grid-template-columns: 280px minmax(0, 720px) 340px;
          gap: 20px;
          padding: 22px 16px 64px;
          max-width: 1360px;
          margin: 0 auto;
        }
        .left,
        .right {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .card {
          background: rgba(10, 11, 16, 0.66);
          border: 1px solid var(--stroke);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.02) inset, 0 10px 40px rgba(0, 0, 0, 0.12);
        }
        .muted {
          color: var(--muted);
        }
        .sectionTitle {
          font-weight: 700;
          margin-bottom: 6px;
        }

        .profileRow {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--stroke);
          background: #fff2;
          display: grid;
          place-items: center;
        }
        .name {
          font-weight: 700;
        }

        .kpis {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 10px;
        }
        .tile {
          text-align: center;
          border-radius: 12px;
          padding: 12px 8px;
          border: 1px solid var(--stroke);
          background: rgba(12, 14, 20, 0.6);
        }
        .tile .k {
          font-weight: 800;
          font-size: 18px;
          color: #fff;
        }

        .btn {
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--stroke);
          background: rgba(12, 14, 20, 0.6);
          color: var(--ink);
          padding: 0 14px;
          font-weight: 600;
        }
        .btn.primary {
          background: var(--pink);
          border: 0;
          color: #fff;
        }
        .btn.ghost {
          background: transparent;
        }
        .navStack .leftnav {
          width: 100%;
          text-align: left;
          margin: 6px 0;
        }

        .center {
          min-width: 0;
        }

        /* the tiny sticky bar that holds only the portal */
        .portalDock {
          position: sticky;
          top: calc(var(--topbar-h, 64px) + env(safe-area-inset-top, 0px));
          z-index: 500; /* above cards, below header */
          isolation: isolate;
          margin-bottom: 14px;
        }

        .heroCopyCard {
          margin-bottom: 14px;
        }
        .ctaRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .post {
          margin-bottom: 14px;
        }
        .postHead {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 8px;
        }
        .postText {
          margin: 6px 0 10px;
          line-height: 1.5;
        }
        .mediaWrap {
          margin: 8px 0;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--stroke);
        }
        .mediaWrap img {
          width: 100%;
          height: auto;
          display: block;
        }
        .postActions {
          display: flex;
          gap: 8px;
        }
        .chip {
          height: 34px;
          border-radius: 10px;
          border: 1px solid var(--stroke);
          background: rgba(12, 14, 20, 0.6);
          color: var(--ink);
          padding: 0 12px;
          font-weight: 600;
        }
        .sentinel {
          text-align: center;
          padding: 16px;
          color: var(--muted);
        }

        /* Drawer (mobile) */
        .showMobile {
          display: none;
        }
        .scrim {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.32);
          z-index: 900;
        }
        .drawer {
          display: none;
        }

        @media (max-width: 1100px) {
          .shell {
            grid-template-columns: minmax(0, 1fr);
            max-width: 760px;
          }
          .left,
          .right {
            display: none;
          }
          .topbar {
            grid-template-columns: auto 1fr auto;
          }
          .showMobile {
            display: inline-flex;
          }
          .scrim {
            display: block;
            animation: fadeIn 0.15s ease-out;
          }
          .drawer {
            display: block;
            position: fixed;
            inset: calc(var(--topbar-h, 64px) + env(safe-area-inset-top, 0px)) 20% 0 0;
            z-index: 950;
            background: var(--panel);
            border-right: 1px solid var(--stroke);
            padding: 16px;
            overflow-y: auto;
            transform: translateX(-100%);
            transition: transform 0.18s ease-out;
          }
          .drawer.open {
            transform: translateX(0);
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        }
      `}</style>
    </main>
  );
}
