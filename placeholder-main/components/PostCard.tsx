// components/PostCard.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ReactionBar from './ReactionBar';
import styles from './postcard.module.css';
import type { Post } from '@/lib/feed';

// Extend the feed type minimally to tolerate partial data + optional fields we use here
type CardPost = Partial<Post> & {
  alt?: string;
  reactions?: Record<string, number>;
};

// Client-only tiny 3D tile for `type === "three"`
const Mini3D = dynamic(() => import('./Mini3D'), {
  ssr: false,
  loading: () => <div className="min3d-skeleton" aria-label="Loading 3D…" />,
});

export default function PostCard({
  post,
  onReact,
}: {
  post: CardPost;
  onReact?: (prev: string | null, next: string | null) => void;
}) {
  const handleReact = onReact ?? (() => {});

  // Safe, descriptive alt text
  const imgAlt: string =
    (typeof post.alt === 'string' && post.alt.trim()) ||
    (typeof post.text === 'string' && post.text.trim().slice(0, 80)) ||
    (post.author?.name ? `${post.author.name}'s post image` : 'post image');

  // Deterministic seed for 3D (varies per post but stable)
  const threeSeed = String(post.id ?? Math.random());

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        {post.author?.avatar ? (
          // using <img> to avoid Next/Image config for now
          <img className={styles.avatar} src={post.author.avatar} alt="" />
        ) : (
          <div className={styles.avatar} aria-hidden />
        )}
        <div>
          <div className={styles.name}>{post.author?.name ?? 'anon'}</div>
          <div className={styles.meta}>
            @{post.author?.handle ?? 'unknown'} ·{' '}
            {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'just now'}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        {post.text ? <p className={styles.text}>{post.text}</p> : null}

        {post.type === 'image' && post.image ? (
          <img
            src={post.image}
            alt={imgAlt}
            className={styles.media}
            loading="lazy"
            decoding="async"
          />
        ) : null}

        {post.type === 'three' ? <Mini3D seed={threeSeed} /> : null}
      </div>

      <footer className={styles.footer}>
        <ReactionBar
          postId={post.id != null ? String(post.id) : undefined}
          counts={post.reactions ?? {}}
          onChange={handleReact}
        />
        <button className="sn-btn" type="button">Comment</button>
        <button className="sn-btn" type="button">Remix</button>
        <button className="sn-btn" type="button">Share</button>
      </footer>
    </article>
  );
}
