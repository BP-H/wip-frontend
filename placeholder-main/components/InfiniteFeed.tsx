'use client';

import Image from 'next/image';
import { placeholderImage, placeholderVideo } from '@/lib/placeholders';

type Media =
  | { type: 'image'; src: string; width: number; height: number; alt: string }
  | { type: 'video'; src: string };

function Card({ idx }: { idx: number }) {
  const media: Media =
    idx % 5 === 0
      ? { type: 'video', src: placeholderVideo(idx) }
      : { type: 'image', src: placeholderImage(idx, 1200, 720), width: 1200, height: 720, alt: 'placeholder' };

  return (
    <article className="post">
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Prototype feed — symbolic demo copy for layout testing.</div>

      {media.type === 'image' ? (
        <div style={{ position: 'relative', width: '100%', height: 0, paddingBottom: '56%', borderRadius: 12, overflow: 'hidden', marginTop: 8 }}>
          <Image src={media.src} alt={media.alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 900px) 100vw, 720px" priority={idx < 2} />
        </div>
      ) : (
        <video
          src={media.src}
          muted
          loop
          autoPlay
          playsInline
          style={{ width: '100%', borderRadius: 12, marginTop: 8, display: 'block' }}
        />
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn">Like</button>
        <button className="btn">Comment</button>
        <button className="btn">Share</button>
      </div>
    </article>
  );
}

export default function InfiniteFeed() {
  const items = Array.from({ length: 12 }, (_, i) => i);
  return (
    <>
      {items.map((i) => (
        <Card key={i} idx={i} />
      ))}
    </>
  );
}
