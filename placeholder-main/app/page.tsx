'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const PortalHero = dynamic(() => import('@/components/PortalHero'), { ssr: false });

type PostItem = { id: string; author: string; time: string; text: string; image?: string };

function makeDemoFeed(n = 14): PostItem[] {
  return Array.from({ length: n }).map((_, i) => ({
    id: String(i + 1),
    author: ['@proto_ai', '@neonfork', '@superNova_2177'][i % 3],
    time: new Date(Date.now() - i * 1000 * 60 * 7).toLocaleString(),
    text:
      i % 4 === 0
        ? 'Low‑poly moment — rotating differently in each instance as you scroll.'
        : 'Prototype feed — symbolic demo copy for layout testing.',
    // use <img> to avoid next.config remotePatterns
    image: i % 2 === 0 ? `https://picsum.photos/seed/sn_white_${i}/960/540` : undefined,
  }));
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [species, setSpecies] = useState<'human' | 'company' | 'ai'>('human');
  const feed = useMemo(() => makeDemoFeed(16), []);

  return (
    <main className="root">
      {/* Top bar */}
      <header className="topbar">
        <div className="leftCluster">
          <button
            className="iconBtn showMobile"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            ☰
          </button>

          <Link href="/" className="brand" aria-label="home">
            <Image src="/icon.png" width={28} height={28} alt="app" className="logo" />
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

          <div className="actionsRight">
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
                <a href="https://vercel.com" role="menuitem">Deploy</a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Scrim for mobile drawer */}
      {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} />}

      {/* 3‑column shell */}
      <div className="shell">
        {/* LEFT (drawer on mobile) */}
        <aside className={`left ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
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
            {['Feed', 'Messages', 'Proposals', 'Decisions', 'Execution', 'Companies', 'Settings'].map(
              (l) => (
                <button key={l} className="btn ghost leftnav">
                  {l}
                </button>
              )
            )}
          </nav>

          <div className="card">
            <div className="muted">Quick stats</div>
            <div className="kpis">
              <div className="tile"><div className="k">2,302</div><div className="muted">Profile views</div></div>
              <div className="tile"><div className="k">1,542</div><div className="muted">Post reach</div></div>
              <div className="tile"><div className="k">12</div><div className="muted">Companies</div></div>
            </div>
          </div>

          <button className="btn closeDrawer showMobile" onClick={() => setDrawerOpen(false)}>
            Close
          </button>
        </aside>

        {/* CENTER */}
        <section className="center">
          <div className="card heroIntro">
            <PortalHero title="Enter universe — tap to interact" logoSrc="/icon.png" />
            <p className="muted heroCopy">
              Minimal white UI, separate accents (pink/blue). Sticky portal compresses smoothly and stays on top on mobile.
            </p>
            <div className="ctaRow">
              <Link href="/3d" className="btn primary" style={{ textDecoration: 'none' }}>
                Open Universe
              </Link>
              <button className="btn">Remix a Story</button>
            </div>
          </div>

          {feed.map((p) => (
            <article key={p.id} className="card post">
              <header className="postHead">
                <strong>{p.author}</strong>
                <span className="muted"> • {p.time}</span>
              </header>
              <p className="postText">{p.text}</p>
              {p.image && (
                <div className="mediaWrap">
                  <img src={p.image} alt="placeholder" loading="lazy" decoding="async" />
                </div>
              )}
              <footer className="postActions">
                <button className="chip">Like</button>
                <button className="chip">Comment</button>
                <button className="chip">Share</button>
              </footer>
            </article>
          ))}
        </section>

        {/* RIGHT */}
        <aside className="right">
          <div className="card">
            <div className="sectionTitle">Identity</div>
            <div className="identity">
              {(['human', 'company', 'ai'] as const).map((s) => (
                <button
                  key={s}
                  className={`pill ${species === s ? 'active' : ''}`}
                  onClick={() => setSpecies(s)}
                  aria-pressed={species === s}
                >
                  {s}
                </button>
              ))}
            </div>
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

      {/* THEME (80% white / 15% pink / 5% blue) */}
      <style jsx global>{`
        :root{
          --bg:#fafafc; --panel:#ffffff; --ink:#111827; --muted:#6b7280; --stroke:#e5e7eb;
          --pink:#ff2db8; --blue:#4f46e5;
        }
        html,body{ background:var(--bg); color:var(--ink); }
        *{ box-sizing: border-box; }
      `}</style>

      {/* PAGE STYLES */}
      <style jsx>{`
        .root{ min-height:100vh; }

        /* Topbar */
        .topbar{
          position: sticky; top: 0; z-index: 60;
          display: grid; grid-template-columns: 220px minmax(320px,740px) 220px;
          gap: 16px; align-items: center;
          height: 64px; padding: 12px 16px;
          border-bottom: 1px solid var(--stroke);
          backdrop-filter: blur(8px); background: rgba(255,255,255,.85);
        }
        .leftCluster{ display:flex; align-items:center; gap:10px; }
        .brand{ display:inline-flex; align-items:center; gap:10px; font-weight:800; color:var(--ink); text-decoration:none; }
        .logo{ border-radius:8px; }
        .iconBtn{ height:40px; min-width:40px; border-radius:12px; border:1px solid var(--stroke); background:var(--panel); }
        .search{ background:var(--panel); border:1px solid var(--stroke); border-radius:12px; height:40px; display:flex; align-items:center; padding:0 12px; }
        .search input{ flex:1; height:100%; background:transparent; border:0; outline:0; color:var(--ink); font-size:14px; }

        .actions{ display:flex; justify-content:flex-end; align-items:center; gap:10px; position:relative; }
        .actionsRight{ position: relative; }
        .avatarBtn{ height:40px; width:40px; border-radius:12px; border:1px solid var(--stroke); background:var(--panel); display:grid; place-items:center; }
        .avatarMenu{
          position:absolute; top:44px; right:0;
          background:var(--panel); border:1px solid var(--stroke); border-radius:12px; padding:8px; display:grid; gap:6px;
        }
        .avatarMenu a{ color:var(--ink); text-decoration:none; padding:8px 10px; border-radius:8px; }
        .avatarMenu a:hover{ background:#f6f7fb; }

        /* Shell */
        .shell{ display:grid; grid-template-columns:280px minmax(0,720px) 340px; gap:20px; padding:22px 16px 64px; max-width:1360px; margin:0 auto; }
        .left,.right{ display:flex; flex-direction:column; gap:14px; }
        .card{ background:var(--panel); border:1px solid var(--stroke); border-radius:16px; padding:16px; box-shadow:0 1px 0 #f3f4f6 inset, 0 8px 24px rgba(17,24,39,.04); }
        .muted{ color:var(--muted); }
        .sectionTitle{ font-weight:700; margin-bottom:6px; }

        .profileRow{ display:flex; gap:12px; align-items:center; }
        .avatar{ width:48px; height:48px; border-radius:12px; overflow:hidden; border:1px solid var(--stroke); background:#fff; display:grid; place-items:center; }
        .name{ font-weight:700; }

        .kpis{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:10px; }
        .tile{ text-align:center; border-radius:12px; padding:12px 8px; border:1px solid var(--stroke); background:#fff; }
        .tile .k{ font-weight:800; font-size:18px; }

        .btn{ height:40px; border-radius:12px; border:1px solid var(--stroke); background:var(--panel); color:var(--ink); padding:0 14px; font-weight:600; }
        .btn.primary{ background:var(--pink); border:0; color:#fff; }
        .btn.ghost{ background:#fff; }

        .navStack .leftnav{ width:100%; text-align:left; margin:6px 0; }

        .center{ min-width:0; }
        .heroIntro{ margin-bottom:14px; }
        .heroCopy{ margin:10px 0 12px; }
        .ctaRow{ display:flex; gap:10px; flex-wrap:wrap; }

        .post{ margin-bottom:14px; }
        .postHead{ display:flex; align-items:baseline; gap:6px; margin-bottom:8px; }
        .postText{ margin:6px 0 10px; line-height:1.5; }
        .mediaWrap{ margin:8px 0; border-radius:12px; overflow:hidden; border:1px solid var(--stroke); }
        .mediaWrap img{ width:100%; height:auto; display:block; }
        .postActions{ display:flex; gap:8px; }
        .chip{ height:34px; border-radius:10px; border:1px solid var(--stroke); background:#fff; color:var(--ink); padding:0 12px; font-weight:600; }

        .pill{ display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; background:#fff; border:1px solid var(--stroke); font-size:12px; color:var(--muted); }
        .pill.active{ color:#fff; background:var(--blue); border-color:var(--blue); }

        /* Mobile drawer */
        .showMobile{ display:none; }
        .scrim{
          display:none;
          position: fixed; inset: 0; background: rgba(0,0,0,.24); z-index: 60;
          animation: fadeIn .15s ease-out;
        }
        .left.open + .center, .left.open + .center + .right { pointer-events:none; } /* optional */

        @media (max-width:1100px){
          .shell{ grid-template-columns:minmax(0,1fr); max-width:760px; }
          .left,.right{ display:none; }
          .topbar{ grid-template-columns:auto 1fr auto; }
          .showMobile{ display:inline-flex; }
          .scrim{ display:block; }
          .left{
            display:block; position: fixed; inset: 0 22% 0 0; z-index: 61; background: var(--panel);
            border-right:1px solid var(--stroke); padding:16px; overflow-y:auto; animation: slideIn .18s ease-out;
          }
          .closeDrawer{ margin-top:12px; width:100%; }
          @keyframes slideIn { from { transform: translateX(-12px); opacity:.85; } to { transform:none; opacity:1; } }
          @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        }
      `}</style>
    </main>
  );
}
