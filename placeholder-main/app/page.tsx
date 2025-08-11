'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Lazy the 3D header so it never SSRs and won’t block TTFB
const PortalHero = dynamic(() => import('@/components/PortalHero'), { ssr: false });

// ----- tiny helpers

type PostItem = {
  id: string;
  author: string;
  handle: string;
  time: string;
  text: string;
  image?: string;
};

function makeDemoFeed(n = 12): PostItem[] {
  return Array.from({ length: n }).map((_, i) => {
    const id = (i + 1).toString();
    return {
      id,
      author: ['@proto_ai', '@neonfork', '@superNova_2177'][i % 3],
      handle: ['Proto AI', 'Neon Fork', 'superNova_2177'][i % 3],
      time: new Date(Date.now() - i * 1000 * 60 * 7).toLocaleString(),
      text:
        i % 4 === 0
          ? 'Low‑poly moment — rotating differently in each instance as you scroll.'
          : 'Prototype feed — symbolic demo copy for layout testing.',
      // free placeholder image that requires no config; unique per post
      image: i % 2 === 0 ? `https://picsum.photos/seed/snv_${i}/960/540` : undefined,
    };
  });
}

// ----- small presentational bits

function PillButton({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button className={`pill ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={!!active}>
      {label}
    </button>
  );
}

function NavButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button className="btn w-full leftnav" onClick={onClick}>
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
        // Use <img> to avoid next/image remote domain configuration
        <div className="mediaWrap">
          <img
            src={item.image}
            alt="placeholder"
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
          />
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

// ======= MAIN PAGE =======

export default function Page() {
  const [species, setSpecies] = useState<'human' | 'company' | 'ai'>('human');
  const [menuOpen, setMenuOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);

  const feed = useMemo(() => makeDemoFeed(16), []);

  return (
    <main className="root">
      {/* Top app bar */}
      <header className="topbar">
        <div className="leftCluster">
          {/* Mobile menu (opens left rail as a drawer) */}
          <button className="iconBtn showMobile" aria-label="Open menu" onClick={() => setLeftOpen(true)}>
            ☰
          </button>

          <Link href="/" className="brand" aria-label="superNova_2177 home">
            <Image src="/icon.png" width={28} height={28} alt="app" className="logo" />
            <b>superNova_2177</b>
          </Link>
        </div>

        <div className="search">
          <input placeholder="Search posts, people, companies…" aria-label="Search" />
        </div>

        <div className="actions">
          <Link href="/3d" className="btn primary" style={{ textDecoration: 'none' }}>
            Launch 3D (beta)
          </Link>

          {/* Avatar -> “perfect burger” */}
          <button
            className="avatarBtn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            title="Open profile"
          >
            <Image src="/icon.png" width={28} height={28} alt="Profile" />
            <span className="burger" aria-hidden>
              ≡
            </span>
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

      {/* Responsive 3‑column shell */}
      <div className="shell">
        {/* LEFT RAIL (hidden on mobile; drawer toggle) */}
        <aside className={`left ${leftOpen ? 'open' : ''}`} aria-hidden={!leftOpen}>
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
            <NavButton label="Feed" />
            <NavButton label="Messages" />
            <NavButton label="Proposals" />
            <NavButton label="Decisions" />
            <NavButton label="Execution" />
            <NavButton label="Companies" />
            <NavButton label="Settings" />
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

          {/* Close drawer on mobile */}
          <button className="btn ghost closeDrawer showMobile" onClick={() => setLeftOpen(false)}>
            Close
          </button>
        </aside>

        {/* CENTER FEED (max width → insta‑like centering) */}
        <section className="center">
          {/* 3D hero portal pinned above the feed */}
          <div className="card heroIntro">
            <PortalHero title="Enter universe — tap to interact" logoSrc="/icon.png" />
            <p className="muted heroCopy">
              Validity rails reflect live entropy → lower entropy bends brighter rails. Humans • AIs • Companies
              participate as peers in a symbolic economy.
            </p>
            <div className="ctaRow">
              <Link href="/3d" className="btn primary" style={{ textDecoration: 'none' }}>
                Open Universe
              </Link>
              <button className="btn">Remix a Story</button>
              <a className="btn" style={{ textDecoration: 'none' }} href="https://vercel.com">
                Deploy on Vercel
              </a>
            </div>
          </div>

          {/* Feed */}
          {feed.map((p) => (
            <PostCard key={p.id} item={p} />
          ))}

          {/* mobile FAB */}
          <button className="fab showMobile" aria-label="Create post">
            ＋
          </button>
        </section>

        {/* RIGHT RAIL */}
        <aside className="right">
          <div className="card">
            <div className="sectionTitle">Identity</div>
            <div className="identity">
              {(['human', 'company', 'ai'] as const).map((s) => (
                <PillButton key={s} label={s} active={species === s} onClick={() => setSpecies(s)} />
              ))}
            </div>
          </div>

          <div className="card">
            <div className="sectionTitle">Company Control Center</div>
            <div className="muted">Spin up spaces, manage proposals, and ship execution pipelines.</div>
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

      {/* THEME + LAYOUT CSS */}
      <style jsx global>{`
        :root {
          --bg: #0b0e13;
          --panel: #0f1320;
          --panel2: #0a0f1a;
          --card: #111729;
          --stroke: #1a2336;
          --text: #e9edf7;
          --muted: #a1aecf;
          --accent: #ff2db8;
          --accent2: #6a5cff;
          --ring: rgba(255, 45, 184, 0.35);
        }
        html,
        body {
          background: var(--bg);
          color: var(--text);
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

      <style jsx>{`
        .root {
          min-height: 100vh;
          background:
            radial-gradient(80% 60% at 0% 0%, rgba(106, 92, 255, 0.1), transparent 60%),
            radial-gradient(70% 50% at 100% 0%, rgba(255, 45, 184, 0.1), transparent 55%),
            linear-gradient(180deg, var(--bg), #06070c 80%);
        }

        /* Topbar */
        .topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: grid;
          grid-template-columns: 1fr minmax(340px, 740px) 1fr;
          gap: 16px;
          align-items: center;
          height: 64px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--stroke);
          backdrop-filter: blur(12px);
          background: linear-gradient(180deg, rgba(10, 12, 20, 0.75), rgba(10, 12, 20, 0.25));
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
          letter-spacing: 0.2px;
          color: var(--text);
          text-decoration: none;
        }
        .logo {
          border-radius: 9px;
        }
        .iconBtn {
          height: 40px;
          min-width: 40px;
          border-radius: 12px;
          border: 1px solid var(--stroke);
          background: #121a2a;
          color: var(--text);
        }
        .search {
          background: #111729;
          border: 1px solid var(--stroke);
          border-radius: 12px;
          height: 40px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          margin: 0 auto;
          width: 100%;
          max-width: 720px;
        }
        .search input {
          flex: 1;
          height: 100%;
          background: transparent;
          border: 0;
          outline: 0;
          color: var(--text);
          font-size: 14px;
        }
        .actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
        }
        .btn {
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--stroke);
          background: #121a2a;
          color: var(--text);
          padding: 0 14px;
          font-weight: 600;
        }
        .btn:hover {
          box-shadow: 0 0 0 2px var(--ring) inset;
          border-color: #2a3754;
        }
        .btn.primary {
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          border: 0;
          color: #fff;
        }
        .btn.ghost {
          background: transparent;
        }
        .avatarBtn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--stroke);
          background: #121a2a;
          padding: 0 10px;
        }
        .burger {
          font-weight: 700;
        }
        .avatarMenu {
          position: absolute;
          margin-top: 48px;
          right: 16px;
          background: #0f1422;
          border: 1px solid var(--stroke);
          border-radius: 12px;
          padding: 8px;
          display: grid;
          gap: 6px;
        }
        .avatarMenu a {
          color: var(--text);
          text-decoration: none;
          padding: 8px 10px;
          border-radius: 8px;
        }
        .avatarMenu a:hover {
          background: #151b2c;
        }

        /* 3-column shell */
        .shell {
          display: grid;
          grid-template-columns: 280px minmax(0, 740px) 340px;
          gap: 20px;
          padding: 22px 16px 64px;
          max-width: 1360px;
          margin: 0 auto;
        }

        .card {
          background: var(--card);
          border: 1px solid var(--stroke);
          border-radius: 16px;
          padding: 16px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 30px rgba(0, 0, 0, 0.25);
        }
        .muted {
          color: var(--muted);
        }

        .left {
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
          background: #0f1626;
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
          background: #0f1626;
        }
        .tile .k {
          font-weight: 800;
          font-size: 18px;
        }
        .navStack .leftnav {
          width: 100%;
          text-align: left;
          margin: 6px 0;
          background: #12182a;
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
          background: #0f1422;
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
          background: #0b0f18;
        }
        .postActions {
          display: flex;
          gap: 8px;
        }
        .chip {
          height: 34px;
          border-radius: 10px;
          border: 1px solid var(--stroke);
          background: #121a2a;
          color: var(--text);
          padding: 0 12px;
          font-weight: 600;
        }

        .right {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .sectionTitle {
          font-weight: 700;
          margin-bottom: 6px;
        }
        .identity {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #0f1626;
          border: 1px solid var(--stroke);
          font-size: 12px;
          color: var(--muted);
        }
        .pill.active {
          color: #fff;
          border-color: #323f5e;
          box-shadow: 0 0 0 2px var(--ring) inset;
        }
        .stack {
          display: grid;
          gap: 8px;
        }

        /* Mobile & tablet */
        .showMobile {
          display: none;
        }

        @media (max-width: 1100px) {
          .shell {
            grid-template-columns: minmax(0, 1fr);
            max-width: 820px;
          }
          .left,
          .right {
            display: none;
          }
          .showMobile {
            display: inline-flex;
          }
          .topbar {
            grid-template-columns: auto 1fr auto;
          }
        }

        /* Left drawer (mobile) */
        @media (max-width: 1100px) {
          .left.open {
            position: fixed;
            inset: 0 20% 0 0;
            z-index: 70;
            background: #0b0e13;
            display: flex;
            padding: 16px;
            overflow-y: auto;
            border-right: 1px solid var(--stroke);
          }
          .closeDrawer {
            margin-top: 8px;
          }
        }

        /* Floating action button */
        .fab {
          position: fixed;
          right: 18px;
          bottom: 18px;
          width: 54px;
          height: 54px;
          border-radius: 14px;
          border: 0;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          color: #fff;
          font-size: 28px;
          line-height: 1;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }
      `}</style>
    </main>
  );
}
