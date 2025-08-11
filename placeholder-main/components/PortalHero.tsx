'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// lazy-load the WebGL bit so SSR never touches Web APIs
const Mini3D = dynamic(() => import('@/components/Mini3D'), {
  ssr: false,
  loading: () => <div className="ph-3d ghost" />,
});

export default function PortalHero() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  // simple, defensive “compress on scroll”
  useEffect(() => {
    const onScroll = () => setCompact((window.scrollY || 0) > 140);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // lock page scroll while overlay is open + ESC to close
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <section
        className={`ph ${compact ? 'compact' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Open Universe"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen(true)}
      >
        <div className="ink" />
        <h2>Enter universe — tap to interact</h2>
      </section>

      {open && (
        <div className="overlay" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <button className="close" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
          <div className="stage" onClick={(e) => e.stopPropagation()}>
            <Mini3D />
          </div>
        </div>
      )}

      <style jsx>{`
        .ph {
          position: sticky; top: 10px; z-index: 10;
          border: 1px solid var(--sn-stroke);
          border-radius: 16px; overflow: hidden; cursor: pointer;
          background: radial-gradient(120% 120% at 100% 0%, rgba(255,45,184,.17), transparent),
                      linear-gradient(180deg, #0c1020, #0b0f1a);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 10px 30px rgba(0,0,0,.25);
          padding: 22px; height: 240px; display: grid; place-items: center;
        }
        .ph.compact { height: 64px; padding: 12px 18px; }
        .ph h2 { margin: 0; font-size: 28px; letter-spacing: .2px; transition: transform .25s, opacity .25s; }
        .ph.compact h2 { transform: scale(.72) translateY(-4px); opacity: .85; }
        .ink { position: absolute; inset: 0;
          background:
            radial-gradient(80% 60% at 0% 0%, rgba(106,92,255,.12), transparent 60%),
            radial-gradient(70% 50% at 100% 0%, rgba(255,45,184,.12), transparent 55%);
          pointer-events: none;
        }
        .overlay { position: fixed; inset: 0; z-index: 50;
          background: rgba(3,6,12,.6); backdrop-filter: blur(10px);
          display: grid; grid-template-rows: auto 1fr;
        }
        .stage { margin: 12px; border-radius: 16px; border: 1px solid var(--sn-stroke);
          background: #0b0f1a; overflow: hidden; min-height: min(80vh, 900px);
        }
        .close { position: absolute; top: 14px; right: 14px; width: 40px; height: 40px;
          border-radius: 10px; border: 1px solid var(--sn-stroke);
          background: #121a2a; color: var(--sn-text); font-size: 18px;
        }
        @media (max-width: 1100px){
          .ph { top: 6px; height: 160px; }
          .ph.compact { height: 56px; }
          .ph h2 { font-size: 22px; }
        }
      `}</style>
    </>
  );
}
