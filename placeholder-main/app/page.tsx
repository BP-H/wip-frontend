'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// lazy 3D header; no SSR
const PortalHero = dynamic(() => import('@/components/PortalHero'), { ssr: false });

type PostItem = {
  id: string;
  author: string;
  time: string;
  text: string;
  image?: string;
};

function makeDemoFeed(n = 12): PostItem[] {
  return Array.from({ length: n }).map((_, i) => ({
    id: String(i + 1),
    author: ['@proto_ai', '@neonfork', '@superNova_2177'][i % 3],
    time: new Date(Date.now() - i * 1000 * 60 * 7).toLocaleString(),
    text:
      i % 4 === 0
        ? 'Low‑poly moment — rotating differently in each instance as you scroll.'
        : 'Prototype feed — symbolic demo copy for layout testing.',
    image: i % 2 === 0 ? `https://picsum.photos/seed/white_${i}/960/540` : undefined,
  }));
}

function Pill({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button className={`pill ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={!!active}>
      {label}
    </button>
  );
}

function PostCard({ item }: { item: PostItem }) {
  return (
    <article className="card post">
      <header className="postHead">
        <strong>{item.author}</strong>
        <span className="muted"> • {item.time}</span>
      </header>
      <p className="postText">{item.text}</p>
      {item.image && (
        <div className="mediaWrap">
          {/* <img> to avoid next.config for remote domains */}
          <img src={item.image} alt="placeholder" loading="lazy" decoding="async" />
        </div>
      )}
      <footer className="postActions">
        <button className="chip">Like</button>
        <button className="chip">Comment</button>
        <button className="chip">Share</button>
      </footer>
    </article>
  );
}

export default function Page() {
  const [species, setSpecies] = useState<'human' | 'company' | 'ai'>('human');
  const [menuOpen, setMenuOpen] = useState(false);
  const feed = useMemo(() => makeDemoFeed(16), []);

  return (
    <main className="root">
      {/* Topbar */}
      <header className="topbar">
        <Link href="/" className="brand" aria-label="superNova_2177">
          <Image src="/icon.png" width={28} height={28} alt="app" className="logo" />
          <b>superNova_2177</b>
        </Link>

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
              <a href="https://vercel.com" role="menuitem">
                Deploy
              </a>
            </div>
          )}
        </div>
      </header>

      {/* 3‑column shell */}
      <div className="shell">
        {/* Left rail */}
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
            {['Feed', 'Messages', 'Proposals', 'Decisions', 'Execution', 'Companies', 'Settings'].map((l) => (
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

        {/* Center column */}
        <section className="center">
          {/* Minimal 3D hero on white */}
          <div className="card heroIntro">
            <PortalHero title="Enter universe — tap to interact" logoSrc="/icon.png" />
            <p className="muted heroCopy">
              A light, minimal canvas with small accents. Humans • AIs • Companies participate as peers.
            </p>
            <div className="ctaRow">
              <Link href="/3d" className="btn primary" style={{ textDecoration: 'none' }}>
                Open Universe
              </Link>
              <button className="btn alt">Remix a Story</button>
            </div>
          </div>

          {feed.map((p) => (
            <PostCard key={p.id} item={p} />
          ))}
        </section>

        {/* Right rail */}
        <aside className="right">
          <div className="card">
            <div className="sectionTitle">Identity</div>
            <div className="identity">
              {(['human', 'company', 'ai'] as const).map((s) => (
                <Pill key={s} label={s} active={species === s} onClick={() => setSpecies(s)} />
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

      {/* THEME (light, minimal, 3 colors) */}
      <style jsx global>{`
        :root {
          /* 80% white, 15% pink, 5% blue */
          --bg: #fafafc;         /* page background (off‑white, slightly weathered) */
          --panel: #ffffff;      /* cards / panels */
          --ink: #111827;        /* primary text (near black) */
          --muted: #6b7280;      /* secondary text */
          --stroke: #e5e7eb;     /* light border */
          --pink: #ff2db8;       /* 15% accent */
          --blue: #4f46e5;       /* 5% accent */
        }
        html,
        body {
          background: var(--bg);
          color: var(--ink);
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

      <style jsx>{`
        .root {
          min-height: 100vh;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: grid;
          grid-template-columns: 220px minmax(300px, 1fr) 220px;
          gap: 16px;
          align-items: center;
          height: 64px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--stroke);
          backdrop-filter: blur(8px);
          background: rgba(255, 255, 255, 0.7); /* translucent white */
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
        .search {
          background: var(--panel);
          border: 1px solid var(--stroke);
          border-radius: 12px;
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
          margin-top: 48px;
          right: 16px;
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
          background: #f6f7fb; /* light, weathered hover */
        }

        .shell {
          display: grid;
          grid-template-columns: 260px minmax(0, 720px) 320px;
          gap: 20px;
          padding: 22px 16px 64px;
          max-width: 1360px;
          margin: 0 auto;
        }

        .card {
          background: var(--panel);
          border: 1px solid var(--stroke);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 1px 0 #f3f4f6 inset, 0 8px 24px rgba(17, 24, 39, 0.04);
        }
        .muted {
          color: var(--muted);
        }
        .sectionTitle {
          font-weight: 700;
          margin-bottom: 6px;
        }

        .left,
        .right {
          display: flex;
          flex-direction: column;
          gap: 14px;
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
          background: #fff;
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
          background: #fff;
        }
        .tile .k {
          font-weight: 800;
          font-size: 18px;
        }

        .btn {
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--stroke);
          background: var(--panel);
          color: var(--ink);
          padding: 0 14px;
          font-weight: 600;
        }
        .btn:hover {
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.08) inset;
        }
        .btn.primary {
          background: linear-gradient(90deg, var(--pink), var(--blue)); /* pink‑blue 15/5 accent */
          border: 0;
          color: #fff;
        }
        .btn.alt {
          border-color: #f0d0e8;
          background: #fff;
        }
        .btn.ghost {
          background: #fff;
        }
        .navStack .leftnav {
          width: 100%;
          text-align: left;
          margin: 6px 0;
        }

        .center {
          min-width: 0;
        }
        .heroIntro {
          margin-bottom: 14px;
        }
        .heroCopy {
          margin: 10px 0 12px;
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
          margin: 8px 0 8px;
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
          background: #fff;
          color: var(--ink);
          padding: 0 12px;
          font-weight: 600;
        }

        /* Responsive */
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
        }
      `}</style>
    </main>
  );
}
