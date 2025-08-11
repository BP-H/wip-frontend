// components/InfiniteFeed.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ThreeCard from './ThreeCard';

type FeedItem = {
  id: string;
  author: string;
  body: string;
  createdAt: string; // ISO
};

// fake network delay + generator (no backend yet)
function fakeFetch(page: number, pageSize = 8): Promise<FeedItem[]> {
  return new Promise(res => {
    const base = page * pageSize;
    const now = Date.now();
    const items: FeedItem[] = Array.from({ length: pageSize }).map((_, i) => {
      const idx = base + i + 1;
      return {
        id: `local_${idx}`,
        author: ['@neonfork', '@superNova_2177', '@proto_ai'][idx % 3],
        body:
          idx % 9 === 0
            ? 'Low‑poly moment — rotating differently in each instance as you scroll.'
            : 'Prototype feed — symbolic demo copy for layout testing.',
        createdAt: new Date(now - idx * 1000 * 42).toISOString(),
      };
    });
    setTimeout(() => res(items), 420); // tiny loading vibe
  });
}

export default function InfiniteFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const next = await fakeFetch(page);
    setItems(prev => [...prev, ...next]);
    setPage(p => p + 1);
    if (next.length === 0) setHasMore(false);
    setIsLoading(false);
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    // first page
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting) loadMore();
      },
      { rootMargin: '600px 0px 600px 0px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  return (
    <div className="sn-feed">
      {items.map((it, i) => {
        const drop3D = (i + 1) % 6 === 0; // every 6th card
        return (
          <div key={it.id} className="sn-card">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="sn-card__head">
                <span className="sn-author">{it.author}</span>
                <span className="sn-dot">•</span>
                <time className="sn-time">
                  {new Date(it.createdAt).toLocaleString()}
                </time>
              </div>

              {drop3D ? (
                <div className="sn-card__media">
                  <ThreeCard seed={it.id} />
                </div>
              ) : null}

              <p className="sn-body">{it.body}</p>

              <div className="sn-actions">
                <button className="sn-btn">Like</button>
                <button className="sn-btn">Comment</button>
                <button className="sn-btn">Share</button>
              </div>
            </motion.div>
          </div>
        );
      })}

      <div ref={sentinelRef} />
      {isLoading && <div className="sn-loader">Loading…</div>}

      <style jsx>{`
        .sn-feed{ display:flex; flex-direction:column; gap:14px; }
        .sn-card{
          border:1px solid rgba(0,0,0,.08);
          background:
            radial-gradient(120% 120% at 0% 0%, rgba(255,0,128,.05), transparent 60%),
            radial-gradient(120% 120% at 100% 0%, rgba(0,160,255,.05), transparent 60%),
            #ffffff;
          border-radius:18px; padding:14px;
          box-shadow: 0 8px 30px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.6);
        }
        .sn-card__head{ display:flex; align-items:center; gap:8px; font-size:14px; font-weight:600; }
        .sn-author{ color:#0a0a0a; }
        .sn-dot{ opacity:.35 }
        .sn-time{ color:#6b7280; font-weight:500; }
        .sn-card__media{ margin:12px 0; }
        .sn-body{ color:#111; margin:8px 2px 6px; line-height:1.5 }
        .sn-actions{ display:flex; gap:8px; margin-top:8px; }
        .sn-btn{
          padding:8px 10px; border-radius:12px; border:1px solid rgba(0,0,0,.08);
          background:#f8f8f8; font-weight:700;
        }
        .sn-btn:hover{ background:#f2f2f2 }
        .sn-loader{ text-align:center; padding:12px; color:#6b7280 }
        @media (max-width: 640px){
          .sn-card{ border-radius:14px; padding:12px; }
        }
      `}</style>
    </div>
  );
}
