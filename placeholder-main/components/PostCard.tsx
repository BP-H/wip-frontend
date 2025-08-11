// components/PostCard.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ReactionBar from './ReactionBar';
import styles from './postcard.module.css';
import type { Post } from '@/lib/feed';

// Client-only tiny 3D tile for `type === "three"`
const Mini3D = dynamic(() => import('./Mini3D'), {
  ssr: false,
  loading: () => <div className="min3d-skeleton" aria-label="Loading 3D…" />,
});

type AnyObj = Record<string, any>;

export default function PostCard({
  post,
  onReact,
}: {
  post: Post;
  onReact?: (prev: string | null, next: string | null) => void;
}) {
  const p = post as unknown as AnyObj; // tolerate partial/loose data without exploding
  const handleReact = onReact ?? ((_prev, _next) => {});

  // Safe, descriptive alt text
  const imgAlt: string =
    typeof p.alt === 'string' && p.alt.trim()
      ? p.alt.trim()
      : typeof p.text === 'string' && p.text.trim()
      ? p.text.trim().slice(0, 80)
      : p.author?.name
      ? `${p.author.name}'s post image`
      : 'post image';

  // Deterministic seed for 3D (varies per post but stable)
  const threeSeed = String(p.id ?? Math.random());

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        {p.author?.avatar ? (
          // using <img> to avoid Next/Image config for now
          <img className={styles.avatar} src={p.author.avatar} alt="" />
        ) : (
          <div className={styles.avatar} aria-hidden />
        )}
        <div>
          <div className={styles.name}>{p.author?.name ?? 'anon'}</div>
          <div className={styles.meta}>
            @{p.author?.handle ?? 'unknown'} ·{' '}
            {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'just now'}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        {p.text ? <p className={styles.text}>{p.text}</p> : null}

        {p.type === 'image' && p.image ? (
          <img
            src={p.image}
            alt={imgAlt}
            className={styles.media}
            loading="lazy"
            decoding="async"
          />
        ) : null}

        {p.type === 'three' ? <Mini3D seed={threeSeed} /> : null}
      </div>

      <footer className={styles.footer}>
        <ReactionBar
          postId={String(post.id)}
          counts={p.reactions ?? {}}
          onChange={handleReact}
        />
        <button className="sn-btn" type="button">Comment</button>
        <button className="sn-btn" type="button">Remix</button>
        <button className="sn-btn" type="button">Share</button>
      </footer>
    </article>
  );
}
