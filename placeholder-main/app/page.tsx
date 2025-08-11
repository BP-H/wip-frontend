'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Page() {
  const [species, setSpecies] = useState<'human' | 'company' | 'ai'>('human');

  return (
    <main className="sn-root">
      {/* Top bar */}
      <header className="sn-topbar">
        <div className="brand">
          <Image src="/superNova.png" width={28} height={28} alt="superNova_2177" className="logo" />
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

      {/* 3‑column layout */}
      <div className="sn-grid">

        {/* Left nav */}
        <aside className="left">
          <div className="sn-card">
            <div className="profile">
              <div className="avatar">
                <Image src="/superNova.png" width={48} height={48} alt="avatar" />
              </div>
              <div>
                <div className="name">taha_gungor</div>
                <div className="muted">artist • test_tech</div>
              </div>
            </div>
          </div>

          <div className="sn-card nav">
            <NavButton label="Feed" />
            <NavButton label="Messages" />
            <NavButton label="Proposals" />
            <NavButton label="Decisions" />
            <NavButton label="Execution" />
            <NavButton label="Companies" />
            <NavButton label="Settings" />
          </div>

          <div className="sn-card">
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

        {/* Main content */}
        <section className="center">
          <div className="sn-card hero">
            <div className="media">
              <h3>Enter universe — tap to interact</h3>
            </div>
            <div className="body">
              <p className="muted">
                Validity rails reflect live entropy → lower entropy bends brighter rails.
                Humans • AIs • Companies participate as peers in a symbolic economy.
              </p>
              <div className="cta">
                <button className="btn primary">Open Universe</button>
                <button className="btn">Remix a Story</button>
                <Link href="https://vercel.com" className="btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  Deploy on Vercel
                </Link>
              </div>
            </div>
          </div>

          <div className="sn-card feed">
            <Post title="superNova_2177 v0 — design drop" excerpt="Futuristic UI pass with glass cards, neon gradients and structured 3‑pane layout." />
            <Post title="Weighted governance" excerpt="Tri‑species votes (human / company / ai) balanced for decisive outcomes." />
            <Post title="3D Mode (beta)" excerpt="Prototype portal to 3D rails — optimized for modern devices." />
          </div>
        </section>

        {/* Right controls */}
        <aside className="right">
          <div className="sn-card">
            <div className="section-title">Identity</div>
            <div className="identity">
              {(['human', 'company', 'ai'] as const).map(s => (
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

          <div className="sn-card">
            <div className="section-title">Company Control Center</div>
            <div className="muted">Spin up spaces, manage proposals, and ship execution pipelines.</div>
            <div className="control">
              <button className="btn primary">Create Company</button>
              <button className="btn">Open Dashboard</button>
            </div>
          </div>

          <div className="sn-card">
            <div className="section-title">Shortcuts</div>
            <div className="stack">
              <button className="btn">New Proposal</button>
              <button className="btn">Start Vote</button>
              <button className="btn">Invite Member</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Design tokens + page styles */}
      <style jsx global>{`
        :root{
          --sn-bg:#0b0e13; --sn-panel:#0f1320; --sn-panel2:#0a0f1a; --sn-card:#111729;
          --sn-stroke:#1a2336; --sn-text:#e9edf7; --sn-muted:#a1aecf;
          --sn-accent:#ff2db8; --sn-accent2:#6a5cff; --sn-ring:rgba(255,45,184,.35);
        }
        body { background: var(--sn-bg); color: var(--sn-text); }
      `}</style>

      <style jsx>{`
        .sn-root{
          min-height:100vh;
          background:
            radial-gradient(80% 60% at 0% 0%, rgba(106,92,255,.10), transparent 60%),
            radial-gradient(70% 50% at 100% 0%, rgba(255,45,184,.10), transparent 55%),
            linear-gradient(180deg, var(--sn-bg), #06070c 80%);
        }

        .sn-topbar{
          position: sticky; top: 0; z-index: 50;
          display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 16px; align-items: center;
          height: 64px; padding: 12px 20px;
          backdrop-filter: blur(12px);
          background: linear-gradient(180deg, rgba(10,12,20,.8), rgba(10,12,20,.35));
          border-bottom: 1px solid var(--sn-stroke);
        }
        .brand{ display:flex; align-items:center; gap:12px; font-weight:800; letter-spacing:.2px; }
        .brand .logo{ border-radius:9px; }

        .search{ background:#111729; border:1px solid var(--sn-stroke); border-radius:12px; height:40px; display:flex; align-items:center; padding:0 12px; }
        .search input{ flex:1; height:100%; background:transparent; border:0; outline:0; color:var(--sn-text); font-size:14px; }

        .actions{ display:flex; justify-content:flex-end; gap:10px; }
        .btn{ height:40px; border-radius:12px; border:1px solid var(--sn-stroke); background:#121a2a; color:var(--sn-text); padding:0 14px; font-weight:600; }
        .btn:hover{ box-shadow:0 0 0 2px var(--sn-ring) inset; border-color:#2a3754; }
        .btn.primary{ background:linear-gradient(90deg, var(--sn-accent), var(--sn-accent2)); border:0; color:#fff; }

        .sn-grid{ display:grid; grid-template-columns:260px minmax(0,1fr) 320px; gap:20px; padding:24px 20px 64px; max-width:1320px; margin:0 auto; }

        .sn-card{ background: var(--sn-card); border:1px solid var(--sn-stroke); border-radius:16px; padding:16px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 10px 30px rgba(0,0,0,.25); }
        .muted{ color:var(--sn-muted); }

        .left .nav button{ width:100%; text-align:left; background:#12182a; color:var(--sn-text); border:1px solid var(--sn-stroke); height:40px; border-radius:12px; margin:6px 0; }
        .left .profile{ display:flex; gap:12px; align-items:center; }
        .avatar{ width:48px; height:48px; border-radius:12px; overflow:hidden; border:1px solid var(--sn-stroke); background:#0f1626; }
        .name{ font-weight:700; }

        .kpis{ display:grid; grid-template-columns: repeat(3,1fr); gap:12px; margin-top:10px; }
        .tile{ text-align:center; border-radius:12px; padding:12px 8px; border:1px solid var(--sn-stroke); background:#0f1626; }
        .tile .k{ font-weight:800; font-size:18px; }

        .hero{ position:relative; overflow:hidden; padding:22px; display:grid; grid-template-columns:1fr 1.5fr; gap:16px; }
        .media{ border-radius:12px; height:240px; border:1px solid var(--sn-stroke);
          background:
            radial-gradient(120% 120% at 100% 0%, rgba(255,45,184,.17), transparent),
            linear-gradient(180deg, #0c1020, #0b0f1a);
          display:flex; align-items:center; justify-content:center; text-align:center;
        }
        .media h3{ font-size:28px; letter-spacing:.2px; }
        .body{ display:flex; flex-direction:column; gap:12px; }
        .cta{ display:flex; gap:10px; flex-wrap:wrap; }

        .feed .post{ padding:14px; border:1px solid var(--sn-stroke); border-radius:14px; background:#0f1422; margin-bottom:12px; }

        .section-title{ font-weight:700; margin-bottom:6px; }
        .identity{ display:flex; gap:8px; }
        .pill{ display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; background:#0f1626; border:1px solid var(--sn-stroke); font-size:12px; color:var(--sn-muted); }
        .pill.active{ color:#fff; border-color:#323f5e; box-shadow:0 0 0 2px var(--sn-ring) inset; }

        .right .control .btn{ width:100%; height:42px; border-radius:12px; margin-top:8px; }
        .stack{ display:grid; gap:8px; }

        @media (max-width:1100px){
          .sn-grid{ grid-template-columns:1fr; }
          .right, .left{ display:none; }
          .hero{ grid-template-columns:1fr; }
        }
      `}</style>
    </main>
  );
}

/* Small presentational helpers */
function NavButton({ label }: { label: string }) {
  return <button className="btn" aria-label={label}>{label}</button>;
}

function Post({ title, excerpt }: { title: string; excerpt: string }) {
  return (
    <article className="post">
      <h4 style={{ margin: 0 }}>{title}</h4>
      <p style={{ margin: '6px 0 10px', opacity: .85 }}>{excerpt}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn">Like</button>
        <button className="btn">Comment</button>
        <button className="btn">Share</button>
      </div>
    </article>
  );
}
