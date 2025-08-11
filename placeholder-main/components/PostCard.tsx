// components/PostCard.tsx
"use client";

import dynamic from "next/dynamic";
import ReactionBar from "./ReactionBar";
import styles from "./postcard.module.css";
import type { Post } from "@/lib/feed";

const Mini3D = dynamic(() => import("./Mini3D"), { ssr: false });

export default function PostCard({
  post,
  onReact,
}: {
  post: Post;
  onReact?: (prev: string | null, next: string) => void;
}) {
  const handleReact = onReact ?? (() => {});

  // Avoid TS error: Post doesn't have `alt`. Use a safe fallback.
  const imgAlt =
    (post.text && String(post.text).slice(0, 80)) ||
    (post as any)?.author?.name
      ? `${(post as any).author.name}'s post image`
      : "post image";

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <img className={styles.avatar} src={(post as any).author?.avatar} alt="" />
        <div>
          <div className={styles.name}>{(post as any).author?.name}</div>
          <div className={styles.meta}>
            @{(post as any).author?.handle} ·{" "}
            {new Date((post as any).createdAt).toLocaleString()}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        {post.text && <p className={styles.text}>{post.text}</p>}

        {post.type === "image" && (post as any).image && (
          <img
            src={(post as any).image}
            alt={imgAlt}
            className={styles.media}
            loading="lazy"
            decoding="async"
          />
        )}

        {post.type === "three" && <Mini3D />}
      </div>

      <footer className={styles.footer}>
        <ReactionBar
          postId={post.id as unknown as string}
          counts={(post as any).reactions ?? {}}
          onChange={handleReact}
        />
        <button className="sn-btn">Comment</button>
        <button className="sn-btn">Remix</button>
        <button className="sn-btn">Share</button>
      </footer>
    </article>
  );
}
