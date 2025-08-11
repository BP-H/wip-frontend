// app/page.tsx
'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// 3D portal — no SSR so it never blocks hydration
const PortalHero = dynamic(() => import('@/components/PortalHero'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 220, display: 'grid', placeItems: 'center' }}>
      <span style={{ opacity: 0.6 }}>Loading portal…</span>
    </div>
  ),
});

type Post = { id: string; author: string; text: string; time: string; image?: string };

// tiny deterministic generator (no network)
function makeBatch(offset: number, size = 10): Post[] {
  return Array.from({ length: size }).map((_, i) => {
    const n = offset + i;
    const authors = ['@proto_ai', '@neonfork', '@superNova_2177'];
    return {
      id: String(n),
      author: authors[n % authors.length],
      time: new Date(Date.now() - n * 1000 * 60 * 5).toLocaleString(),
      text:
        n % 3 === 0
          ? 'Low‑poly moment — rotating differently in each instance as you scroll.'
          : 'Prototype feed — symbolic demo copy for layout testing.',
      image: n % 2 === 0 ? `https://picsum.photos/seed/snova_${n}/1080/720` : undefined,
    };
  });
}

/** measure header height -> CSS var so sticky math is always correct */
function useHeaderVar(ref: React.RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => {
      document.documentElement.style.setProperty('--topbar-h', `${el.offsetHeight}px`);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    window.addEventListener('resize', set);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', set);
    };
  }, [ref]);
}

export default function Page() {
  const headerRef = useRef<HTMLElement>(null);
  useHeaderVar(headerRef);

  // drawer + avatar menu
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // infinite feed
  const [items, setItems] = useState<Post[]>(() => makeBatch(0, 14));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // close menus on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // lock scroll when drawer is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (drawerOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  // infinite feed loader
  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        const [e] = entries;
        if (!e.isIntersecting || loading || !hasMore) return;
        setLoading(true);
        setTimeout(() => {
          const next = makeBatch(page * 14, 14);
          setItems((prev) => [...prev, ...next]);
          setPage((p) => p + 1);
          if (page >= 10) setHasMore(false); // demo cap
          setLoading(false);
        }, 200);
      },
      { rootMargin: '1200px 0px 800px 0px', threshold: 0 }
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [page, loading, hasMore]);

  return (
    <main className="root">
      {/* FIXED TOP BAR */}
      <header ref={headerRef} className="topbar" role="banner" data-app-header>
        <div className="leftCluster">
          <button
            className="iconBtn showMobile"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            ☰
          </button>
          <Link href="/" className="brand" aria-label="superNova_2177">
            <Image src="/icon.png" width={26} height={26} alt="logo" className="logo" />
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
              <Link href="/profile" role="menuitem">Profile</Link>
              <Link href="/settings" role="menuitem">Settings</Link>
              <Link href="/proposals" role="menuitem">Proposals</Link>
            </div>
          )}
        </div>
      </header>

      {/* spacer so fixed bar doesn’t overlap first content */}
      <div className="topbarSpacer" aria-hidden />

      {/* SCRIM + DRAWER (mobile) */}
      {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} />}
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="drawerContent">
          <div className="profileRow">
            <div className="avatar">
              <Image src="/icon.png" width={44} height={44} alt="avatar" />
            </div>
            <div>
              <div className="name">taha_gungor</div>
              <div className="muted">artist • test_tech</div>
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
            <button key={l} className="btn ghost leftnav" onClick={() => setDrawerOpen(false)}>
              {l}
            </button>
          ))}
          <button className="btn" onClick={() => setDrawerOpen(false)} style={{ marginTop: 12 }}>
            Close
          </button>
        </div>
      </aside>

      {/* 3‑COL LAYOUT */}
      <div className="layout">
        {/* LEFT (desktop rail) */}
        <aside className="rail left">
          <div className="card cut profileCard">
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

          <nav className="card cut navStack">
            {['Feed', 'Messages', 'Proposals', 'Decisions', 'Execution', 'Companies', 'Settings'].map(
              (l) => (
                <button key={l} className="btn ghost leftnav">
                  {l}
                </button>
              )
            )}
          </nav>

          <div className="card cut">
            <div className="muted">Quick stats</div>
            <div className="kpis">
              <div className="kTile">
                <div className="k">2,302</div>
                <div className="muted">Profile views</div>
              </div>
              <div className="kTile">
                <div className="k">1,542</div>
                <div className="muted">Post reach</div>
              </div>
              <div className="kTile">
                <div className="k">12</div>
                <div className="muted">Companies</div>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER */}
        <section className="center">
          {/* STICKY HERO — child transforms, wrapper stays sticky */}
          <section className="stickyHero" aria-label="Portal hero">
            <div className="card cut heroCard">
              <PortalHero />
              <p className="muted heroCopy">
                Minimal UI, neon **superNova** accents (pink/blue). The portal compresses as you
                scroll and stays under the header on all devices.
              </p>
              <div className="ctaRow">
                <Link href="/3d" className="btn primary" style={{ textDecoration: 'none' }}>
                  Open Universe
                </Link>
                <button className="btn altPink">Remix a Universe</button>
              </div>
            </div>
          </section>

          {/* FEED */}
          {items.map((p) => (
            <article key={p.id} className="card cut post">
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

        {/* RIGHT */}
        <aside className="rail right">
          <div className="card cut">
            <div className="sectionTitle">Identity</div>
            <div className="pills">
              {['human', 'company', 'ai'].map((s) => (
                <button key={s} className="pill">
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card cut">
            <div className="sectionTitle">Company Control Center</div>
            <p className="muted">Spin up spaces, manage proposals, and ship pipelines.</p>
            <div className="stack">
              <button className="btn primary">Create Company</button>
              <button className="btn">Open Dashboard</button>
            </div>
          </div>

          <div className="card cut">
            <div className="sectionTitle">Shortcuts</div>
            <div className="stack">
              <button className="btn">New Proposal</button>
              <button className="btn">Start Vote</button>
              <button className="btn">Invite Member</button>
            </div>
          </div>
        </aside>
      </div>

      {/* THEME / GLOBAL */}
      <style jsx global>{`
        :root {
          /* brand */
          --pink: #ff2db8;
          --blue: #4f46e5;

          /* theme */
          --bg: #ff2db8;            /* main background */
          --bg2: #ff4fd0;           /* gradient helper */
          --ink: #f6f7fb;           /* main text on dark panels */
          --muted: #a7afc3;         /* secondary text */
          --panel: rgba(13, 15, 23, 0.82); /* glossy dark over pink */
          --panel-solid: #0e1119;
          --stroke: #272c36;

          /* layout var set by hook */
          --topbar-h: 64px;
        }
        html, body { background: var(--bg); color: var(--ink); }
        body::before {
          /* whiplash-y neon gradient + vertical glow */
          content: "";
          position: fixed; inset: 0; z-index: -2;
          background:
            radial-gradient(40% 25% at 20% 0%, rgba(255,255,255,0.18) 0, transparent 60%),
            radial-gradient(30% 22% at 80% 10%, rgba(79,70,229,0.18) 0, transparent 65%),
            linear-gradient(180deg, var(--bg), var(--bg2) 40%, #1b1020 110%);
          filter: saturate(115%);
        }
        body::after {
          /* subtle noise for texture */
          content: "";
          position: fixed; inset: 0; z-index: -1; pointer-events: none;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)" opacity="0.045"/></svg>');
          mix-blend-mode: overlay;
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* PAGE STYLES */}
      <style jsx>{`
        .root { min-height: 100vh; }

        /* fixed > always on top; backdrop so it “floats” */
        .topbar {
          position: fixed; inset: 0 0 auto 0; height: 64px; z-index: 1000;
          display: grid; grid-template-columns: 1fr minmax(320px, 740px) 1fr; gap: 16px; align-items: center;
          padding: 10px 16px;
          background: rgba(10, 12, 18, 0.54);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(10px);
        }
        .topbarSpacer { height: var(--topbar-h); }
        .leftCluster { display: flex; align-items: center; gap: 10px; }
        .brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); text-decoration: none; font-weight: 800; letter-spacing: .2px; }
        .logo { border-radius: 8px; }
        .iconBtn { height: 40px; min-width: 40px; border-radius: 12px; border: 1px solid var(--stroke); background: var(--panel); color: var(--ink); }
        .search { background: var(--panel); border: 1px solid var(--stroke); border-radius: 12px; height: 40px; display: flex; align-items: center; padding: 0 12px; }
        .search input { flex: 1; height: 100%; background: transparent; border: 0; outline: 0; color: var(--ink); font-size: 14px; }
        .actions { display: flex; justify-content: flex-end; align-items: center; gap: 10px; position: relative; }
        .avatarBtn { height: 40px; width: 40px; border-radius: 12px; border: 1px solid var(--stroke); background: var(--panel); display: grid; place-items: center; }
        .avatarMenu {
          position: absolute; top: 46px; right: 0; background: var(--panel); border: 1px solid var(--stroke);
          border-radius: 12px; padding: 8px; display: grid; gap: 6px; min-width: 160px;
        }
        .avatarMenu a { color: var(--ink); text-decoration: none; padding: 8px 10px; border-radius: 8px; }
        .avatarMenu a:hover { background: #151a24; }

        /* Layout */
        .layout { display: grid; grid-template-columns: 280px minmax(0, 720px) 340px; gap: 20px; padding: 20px 16px 64px; max-width: 1360px; margin: 0 auto; }
        .rail { display: flex; flex-direction: column; gap: 14px; position: relative; }
        .rail .card { position: sticky; top: calc(var(--topbar-h) + 16px); }
        .rail.right .card { position: sticky; top: calc(var(--topbar-h) + 16px); }
        .center { min-width: 0; }

        /* Cards — angular “cut corner” look */
        .card {
          background: var(--panel);
          border: 1px solid var(--stroke);
          color: var(--ink);
          padding: 16px;
          border-radius: 14px;
          box-shadow: 0 1px 0 rgba(255,255,255,.04) inset, 0 20px 40px rgba(0,0,0,.25);
        }
        .cut { 
          /* clipped angle on bottom-right for that superNova slash */
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 0);
        }
        .sectionTitle { font-weight: 800; letter-spacing: .2px; margin-bottom: 6px; }
        .muted { color: var(--muted); }

        .profileRow { display: flex; gap: 12px; align-items: center; }
        .avatar { width: 48px; height: 48px; border-radius: 12px; overflow: hidden; border: 1px solid var(--stroke); background: var(--panel-solid); display: grid; place-items: center; }
        .name { font-weight: 800; }

        .kpis { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-top: 10px; }
        .kTile { text-align: center; border: 1px solid var(--stroke); background: #0f1220; border-radius: 12px; padding: 10px 8px; }
        .kTile .k { font-weight: 900; font-size: 18px; }

        .btn { height: 40px; border-radius: 12px; border: 1px solid var(--stroke); background: #121625; color: var(--ink); padding: 0 14px; font-weight: 700; }
        .btn.primary { background: var(--pink); color: #fff; border: 0; }
        .btn.ghost { background: transparent; }
        .btn.altPink { background: transparent; color: #fff; border-color: rgba(255,255,255,.24); }
        .btn.altPink:hover { border-color: #fff; }

        .navStack .leftnav { width: 100%; text-align: left; margin: 6px 0; }

        /* STICKY hero */
        .stickyHero {
          position: sticky;
          top: calc(var(--topbar-h) + env(safe-area-inset-top, 0px));
          z-index: 500;
          isolation: isolate; /* its own stacking context so it always rides above feed */
        }
        .heroCard { overflow: visible; }
        .heroCopy { margin: 10px 0 12px; }

        /* Feed */
        .post { margin: 14px 0; }
        .postHead { display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; }
        .postText { margin: 6px 0 10px; line-height: 1.5; }
        .mediaWrap { margin: 8px 0; border-radius: 12px; overflow: hidden; border: 1px solid var(--stroke); }
        .mediaWrap img { width: 100%; height: auto; display: block; }
        .postActions { display: flex; gap: 8px; }
        .chip { height: 34px; border-radius: 10px; border: 1px solid var(--stroke); background: #0f1220; color: var(--ink); padding: 0 12px; font-weight: 700; }
        .sentinel { text-align: center; padding: 16px; color: var(--muted); }

        /* drawer */
        .showMobile { display: none; }
        .scrim { position: fixed; inset: 0; background: rgba(0,0,0,.38); z-index: 990; animation: fadeIn .12s ease-out; }
        .drawer {
          position: fixed; inset: var(--topbar-h) 30% 0 0; background: var(--panel); border-right: 1px solid var(--stroke);
          transform: translateX(-100%); transition: transform .18s ease-out; z-index: 991; overflow-y: auto;
        }
        .drawer.open { transform: translateX(0); }
        .drawerContent { display: grid; gap: 10px; padding: 16px; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Responsive */
        @media (max-width: 1100px) {
          .layout { grid-template-columns: minmax(0, 1fr); max-width: 760px; }
          .rail { display: none; }
          .topbar { grid-template-columns: auto 1fr auto; }
          .showMobile { display: inline-flex; }
        }
      `}</style>
    </main>
  );
}
