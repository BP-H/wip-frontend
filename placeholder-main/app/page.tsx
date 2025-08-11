'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Client-only 3D card
const Mini3D = dynamic(() => import('@/components/Mini3D'), {
  ssr: false,
  loading: () => <div className="min3d-skeleton" aria-label="Loading 3D…" />,
});

// Stories rail (client-only)
const StoriesRail = dynamic(() => import('@/components/StoriesRail'), {
  ssr: false,
});

// ─────────────────────────────────────────────────────────────────────────────
// Types & tiny utils
// ─────────────────────────────────────────────────────────────────────────────
type Post = {
  id: string;
  author: string;
  time: string;
  text: string;
  image?: string;
  hue: number;      // accent
  validity: number; // 0..1
};

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomPost(seed: number, idx: number): Post {
  const r = mulberry32(seed + idx);
  const id = `${seed}-${idx}-${Math.floor(r() * 1e9)}`;
  const hue = Math.floor(r() * 360);
  const validity = clamp(0.35 + r() * 0.6);
  const author = ['superNova_2177', 'proto_ai', 'neonfork', 'lowpoly_lab'][Math.floor(r() * 4)];
  const text = [
    'Metaverse placeholder seeded — tap to enter, hold to remix.',
    'Fork this universe, remix a node, and bend rails with your validators.',
    'Low‑poly moment — rotating differently in each instance as you scroll.',
    'Symbolic feed online — angle = validity. Welcome.',
  ][Math.floor(r() * 4)];
  const imgPick = Math.floor(r() * 3);
  const image =
    imgPick === 0
      ? undefined
      : [
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1520975922284-5406db2b06b8?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
        ][imgPick];

  return { id, author, time: new Date().toLocaleString(), text, image, hue, validity };
}

function useInfinitePosts() {
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const [posts, setPosts] = useState<Post[]>([]);
  const pageRef = useRef(0);

  const loadMore = useCallback((count = 8) => {
    const page = pageRef.current++;
    const start = page * count;
    const next = Array.from({ length: count }, (_, i) => randomPost(seed, start + i));
    setPosts((p) => p.concat(next));
  }, [seed]);

  useEffect(() => { loadMore(10); }, [loadMore]);

  return { posts, loadMore };
}

function useGlobalValidity() {
  // pleasant default if API isn’t wired yet
  const [validity, setValidity] = useState<number>(0.6);
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
        if (!base) return;
        const res = await fetch(`${base}/system/collective-entropy`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { collective_entropy?: number };
        const E = typeof data.collective_entropy === 'number' ? data.collective_entropy : 4.2;
        const v = clamp(1 - E / 8);
        if (!stop) setValidity(v);
      } catch { /* noop */ }
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => { stop = true; clearInterval(id); };
  }, []);
  return validity;
}

// Angular rails — angle & thickness scale with validity
function ValidityRails({ validity }: { validity: number }) {
  const ANG_MAX = 24;
  const THICK_MAX = 8;
  const EDGE_GLOW = 0.25 + 0.75 * validity;
  const ang = ANG_MAX * validity;
  const thick = 3 + THICK_MAX * validity;

  const pink = 'rgba(255, 47, 146, .85)'; // accent
  const blue = 'rgba(14, 165, 255, .85)';

  return (
    <>
      <style jsx>{`
        .rails {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          background: linear-gradient(180deg, #0c0f16, #0a0d14);
          border: 1px solid rgba(255,255,255,.06);
          height: ${Math.max(56, 56 + thick)}px;
        }
        .base {
          position: absolute; left: 0; right: 0; top: calc(50% - 1px);
          height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,.25), rgba(255,255,255,.15));
        }
        .shardA, .shardB { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen; }
        .shardA {
          transform: skewY(${ang}deg);
          filter: drop-shadow(0 0 ${12 * EDGE_GLOW}px ${pink});
          clip-path: polygon(0% 0%, 52% 0%, 48% ${Math.max(6, thick)}px, 0% ${Math.max(28, 30 + thick)}px);
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, ${pink} 35%, rgba(255,255,255,0) 100%);
          opacity: ${0.22 + 0.45 * validity};
        }
        .shardB {
          transform: skewY(${-ang}deg);
          filter: drop-shadow(0 0 ${10 * EDGE_GLOW}px ${blue});
          clip-path: polygon(100% 0%, 48% 0%, 52% ${Math.max(10, thick + 2)}px, 100% ${Math.max(34, 36 + thick)}px);
          background: linear-gradient(270deg, rgba(255,255,255,0) 0%, ${blue} 35%, rgba(255,255,255,0) 100%);
          opacity: ${0.18 + 0.42 * validity};
        }
      `}</style>
      <div className="rails" aria-hidden="true">
        <div className="base" />
        <div className="shardA" />
        <div className="shardB" />
      </div>
    </>
  );
}

function ReactionBar() {
  return (
    <>
      <style jsx>{`
        .wrap { display: flex; gap: .75rem; align-items: center; }
        .btn {
          position: relative;
          background: #0f1320; color: #e9eef5;
          border: 1px solid rgba(255,255,255,.08);
          padding: .48rem .9rem; font-weight: 900; letter-spacing: .2px;
          clip-path: polygon(9% 0, 100% 0, 91% 100%, 0 100%);
          border-radius: 12px; transition: all .15s ease;
        }
        .btn::after {
          content: ''; position: absolute; inset: 0; clip-path: inherit; border-radius: 12px;
          background: linear-gradient(90deg, rgba(255,47,146,.18), rgba(14,165,255,.16));
          mix-blend-mode: screen; pointer-events: none;
        }
        .btn:hover { box-shadow: 0 0 0 2px rgba(14,165,255,.25) inset; transform: translateY(-1px); }
      `}</style>
      <div className="wrap">
        <button className="btn">👍 Like</button>
        <button className="btn">💬 Comment</button>
        <button className="btn">🎛️ Remix</button>
        <button className="btn">↗ Share</button>
      </div>
    </>
  );
}

function Card({ post, globalValidity }: { post: Post; globalValidity: number }) {
  const v = clamp(0.4 * globalValidity + 0.6 * post.validity);
  return (
    <>
      <style jsx>{`
        .card { position: relative; margin: 18px 0 26px; }
        .in {
          position: relative; z-index: 1; padding: 16px; border-radius: 16px;
          display: flex; flex-direction: column; gap: 10px;
          background: #0b0f17; border: 1px solid rgba(255,255,255,.08);
        }
        .hdr { display: flex; align-items: center; gap: .6rem; color: #94a3b8; font-weight: 700; }
        .chip { font-weight: 900; letter-spacing: .2px; font-size: 1.05rem; color: #e6edf6; }
        .txt { color: #eaf1fb; line-height: 1.55 }
        .img { width: 100%; border-radius: 14px; border: 1px solid rgba(255,255,255,.08); }
        .chip {
          background: linear-gradient(90deg, hsla(${post.hue},80%,60%,.15), transparent 60%);
          padding: .25rem .55rem; border-radius: 10px; border: 1px solid rgba(255,255,255,.06);
        }
        .valid {
          position: absolute; top: 10px; right: 12px; font-size: .75rem; color: #b6c3d6;
          background: rgba(14,165,255,.12); border: 1px solid rgba(14,165,255,.35);
          padding: .2rem .5rem; border-radius: 999px; font-weight: 800;
        }
      `}</style>
      <div className="card" style={{ transform: `skewY(${v * 3}deg)` }}>
        <ValidityRails validity={v} />
        <div className="in">
          <div className="hdr">
            <span className="chip">@{post.author}</span>
            <span>•</span>
            <span>{post.time}</span>
          </div>
          <div className="txt">{post.text}</div>
          {post.image && <img className="img" alt="" src={post.image} />}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <ReactionBar />
            <div className="valid">validity {Math.round(v * 100)}%</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Page() {
  const { posts, loadMore } = useInfinitePosts();
  const globalValidity = useGlobalValidity();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) loadMore();
    }, { rootMargin: '1000px 0px 1000px 0px' });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [loadMore]);

  // small seed bump so the 3D tile subtly changes as validity changes
  const threeSeed = useMemo(() => String(Math.round(globalValidity * 100) + 1), [globalValidity]);

  return (
    <>
      <style jsx global>{`
        :root{
          --bg:#0a0b10;         /* 80% near-black */
          --fg:#e9ecf1;
          --muted:#a1a7b3;
          --panel:#0f1117;
          --stroke:rgba(255,255,255,.08);
          --pink:#ff2f92;       /* ~10% */
          --blue:#0ea5ff;       /* ~10% */
        }
        html, body { background: var(--bg); color: var(--fg); }
        a { color: var(--fg); text-decoration: none; }
        .layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 18px;
          max-width: 1200px;
          margin: 30px auto;
          padding: 0 16px;
        }
        .sidebar {
          position: sticky; top: 18px; height: fit-content;
        }
        .livebar {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--stroke);
          background:
            radial-gradient(140% 80% at -10% -10%, rgba(255,47,146,.28), transparent 60%),
            radial-gradient(140% 80% at 120% -10%, rgba(14,165,255,.26), transparent 60%),
            linear-gradient(180deg, #0c0f16, #0a0d14);
        }
        .livebarHead { padding: 12px 14px; font-weight: 900; letter-spacing:.2px; }
        .heroTile { padding: 12px; }
        .about {
          padding: 12px 14px; border-top: 1px solid var(--stroke);
          color: var(--muted); font-size: .92rem;
        }
        .wrap { max-width: 840px; margin: 0 auto; }
        .brand { display:flex; align-items:center; justify-content:space-between; margin-bottom: 10px; }
        .title { font-weight: 900; font-size: clamp(24px, 6vw, 44px); letter-spacing: .3px; }
        .sub { color: var(--muted); margin-top: 4px; }
        .ctaRow { display:flex; gap: 10px; flex-wrap: wrap; margin: 12px 0 18px; }
        .cta {
          position: relative; background: var(--panel); color: var(--fg);
          border: 1px solid var(--stroke); padding: .6rem .9rem;
          border-radius: 12px; font-weight: 900; letter-spacing: .2px;
          clip-path: polygon(9% 0, 100% 0, 91% 100%, 0 100%);
          transition: box-shadow .15s ease, transform .15s ease;
        }
        .cta::after {
          content: ''; position: absolute; inset: 0; clip-path: inherit; border-radius: 12px;
          background: linear-gradient(90deg, rgba(255,47,146,.12), rgba(14,165,255,.12));
          mix-blend-mode: screen; pointer-events: none;
        }
        .cta:hover { box-shadow: 0 0 0 2px rgba(14,165,255,.25) inset; transform: translateY(-1px); }
        .min3d-skeleton {
          height: 260px; border-radius: 16px;
          background:
            radial-gradient(120% 120% at 20% 10%, rgba(255,47,146,.18), transparent 60%),
            radial-gradient(120% 120% at 80% -10%, rgba(14,165,255,.18), transparent 60%),
            linear-gradient(180deg, #0c0f16, #0a0d14);
          border: 1px solid var(--stroke);
        }
        @media (max-width: 920px){ .layout { grid-template-columns: 1fr; } .sidebar { order: -1; } }
      `}</style>

      <div className="layout">
        {/* colorful sidebar */}
        <aside className="sidebar">
          <div className="livebar">
            <div className="livebarHead">Enter universe — tap to interact</div>
            <div className="heroTile">
              {/* ❗ no 'power' prop here — this removes the TS error */}
              <Mini3D seed={threeSeed} autoRotate wireframe opacity={0.78} />
              {/* Rail directly under the 3D card */}
              <StoriesRail seed={2177} />
            </div>
            <div className="about">
              Validity rails reflect live entropy ⇒ lower entropy bends brighter rails.
              Humans • AIs • Companies participate as peers in this symbolic social platform.
            </div>
            <div className="ctaRow" style={{ padding: '12px 12px 16px' }}>
              <Link className="cta" href="https://github.com/BP-H/placeholder_supernova/fork" target="_blank" rel="noreferrer">🍴 Fork & Launch your SNS</Link>
              <Link className="cta" href="/globalrunwayai">🌌 Launch 3D Mode (beta)</Link>
              <Link className="cta" href="https://vercel.com/new/clone?repository-url=https://github.com/BP-H/placeholder_supernova" target="_blank" rel="noreferrer">⚡ Deploy on Vercel</Link>
            </div>
          </div>
        </aside>

        {/* main feed */}
        <main className="wrap">
          <div className="brand">
            <div>
              <div className="title">superN<br />ova2177.com</div>
              <div className="sub">///coming soon ///stay tuned ///</div>
            </div>
            <Link className="cta" href="https://github.com/BP-H/placeholder_supernova" target="_blank" rel="noreferrer">GitHub</Link>
          </div>

          {posts.map((p) => (
            <Card key={p.id} post={p} globalValidity={globalValidity} />
          ))}
          <div ref={sentinelRef} style={{ height: 1 }} />
        </main>
      </div>
    </>
  );
}
