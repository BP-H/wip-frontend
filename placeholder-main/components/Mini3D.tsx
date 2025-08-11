'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';

/** ─────────────────────────────────────────────────────────────────────────────
 *  Mini3D v2 — “Aespa-Whiplash” microverse
 *  - Multi-geometry swarm (icosa / dodeca / torusKnot / octa / spheres)
 *  - Seeded RNG for deterministic vibes per seed
 *  - Pop-in / hold / pop-out life cycles (looped)
 *  - Pink/Blue/White palette ~ 80 / 15 / 5
 *  - Mobile-first sizing + light on GPU (no postprocessing needed)
 *  - No SSR; import client-only via dynamic() in page.tsx
 *  ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  seed?: string | number;
  /** 0..1 – sets count & subtle energy. Good pipe for global validity. */
  density?: number;
  autoRotate?: boolean;
  wireframe?: boolean;
  opacity?: number;
};

type ShapeKind = 'ico' | 'dode' | 'oct' | 'sphere' | 'knot';

function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const mulberry32 = (a: number) => () => {
  let t = (a += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function pickKind(r: () => number): ShapeKind {
  // Slight bias toward polyhedra; torusKnot rarer for spice.
  const x = r();
  if (x < 0.26) return 'ico';
  if (x < 0.52) return 'dode';
  if (x < 0.78) return 'oct';
  if (x < 0.95) return 'sphere';
  return 'knot';
}

function pickColor(r: () => number): string {
  // ~80% hot pink, 15% electric blue, 5% pure white
  const x = r();
  if (x < 0.80) return '#ff1fae';        // hot pink
  if (x < 0.95) return '#70b5ff';        // blue accent
  return '#ffffff';                       // white highlight
}

type SwarmCfg = {
  kind: ShapeKind;
  color: string;
  pos: [number, number, number];
  rot: [number, number, number];
  baseScale: number;
  ttl: number;    // lifetime seconds
  delay: number;  // phase offset seconds
};

function makeSwarm(seedStr: string, count: number): SwarmCfg[] {
  const rng = mulberry32(hashSeed(seedStr));
  const out: SwarmCfg[] = [];
  for (let i = 0; i < count; i++) {
    const radius = 0.8 + rng() * 2.6;           // radial distance
    const theta = rng() * Math.PI * 2;
    const y = (rng() - 0.5) * 1.4;              // vertical spread
    const pos: [number, number, number] = [
      Math.cos(theta) * radius,
      y,
      Math.sin(theta) * radius * (rng() > 0.5 ? 1 : -1) - (rng() * 0.6),
    ];
    const rot: [number, number, number] = [
      (rng() * 0.6 + 0.1) * (rng() > 0.5 ? 1 : -1),
      (rng() * 0.8 + 0.1) * (rng() > 0.5 ? 1 : -1),
      (rng() * 0.4) * (rng() > 0.5 ? 1 : -1),
    ];
    const baseScale = 0.28 + rng() * 0.75;      // size variety
    const ttl = 3.4 + rng() * 3.2;              // life window
    const delay = rng() * 10;                    // stagger
    out.push({
      kind: pickKind(rng),
      color: pickColor(rng),
      pos,
      rot,
      baseScale,
      ttl,
      delay,
    });
  }
  return out;
}

function Shape({
  cfg,
  wireframe,
  opacity,
  rotate,
}: {
  cfg: SwarmCfg;
  wireframe: boolean;
  opacity: number;
  rotate: boolean;
}) {
  const ref = useRef<Group>(null!);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    const life = (t + cfg.delay) % cfg.ttl;
    const u = life / cfg.ttl;

    // pop-in (0..0.18), hold (..0.82), pop-out (..1)
    let s = cfg.baseScale;
    if (u < 0.18) s *= easeInOut(u / 0.18);
    else if (u > 0.82) s *= 1 - easeInOut((u - 0.82) / 0.18);

    const bob = Math.sin((t * 0.9) + cfg.pos[0] * 0.5) * 0.06;
    ref.current.position.set(cfg.pos[0], cfg.pos[1] + bob, cfg.pos[2]);
    ref.current.scale.setScalar(s);

    if (rotate) {
      ref.current.rotation.x += cfg.rot[0] * dt;
      ref.current.rotation.y += cfg.rot[1] * dt;
      ref.current.rotation.z += cfg.rot[2] * dt;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        {cfg.kind === 'ico' && <icosahedronGeometry args={[1, 0]} />}
        {cfg.kind === 'dode' && <dodecahedronGeometry args={[1, 0]} />}
        {cfg.kind === 'oct' && <octahedronGeometry args={[1, 0]} />}
        {cfg.kind === 'sphere' && <sphereGeometry args={[1, 18, 18]} />}
        {cfg.kind === 'knot' && <torusKnotGeometry args={[0.6, 0.18, 90, 14]} />}
        <meshStandardMaterial
          color={cfg.color}
          wireframe={wireframe}
          metalness={0.2}
          roughness={0.35}
          emissive={cfg.color}
          emissiveIntensity={cfg.color === '#ffffff' ? 0.1 : 0.35}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

export default function Mini3D({
  seed = 'sn2177',
  density = 0.6,
  autoRotate = true,
  wireframe = false,
  opacity = 0.88,
}: Props) {
  const s = String(seed);
  const d = clamp(density, 0, 1);
  // Mobile-first: fewer shapes on tiny screens, more on desktop, scaled by density.
  const baseCount = typeof window !== 'undefined' && window.innerWidth < 560 ? 12 : 22;
  const count = Math.round(baseCount + d * (baseCount * 0.9));
  const swarm = useMemo(() => makeSwarm(s, count), [s, count]);

  return (
    <div
      style={{
        height: 'clamp(240px, 40vh, 380px)',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,.08)',
        background: 'linear-gradient(180deg,#0b0c12,#090a0f)',
      }}
      aria-label="Mini 3D universe"
    >
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6.5], fov: 46 }}>
        {/* depth & ambient */}
        <color attach="background" args={['#0b0c12']} />
        <fog attach="fog" args={['#0b0c12', 6, 18]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 4, 6]} intensity={0.9} />
        <directionalLight position={[-3, -2, -5]} intensity={0.6} />

        <Float speed={1.15} rotationIntensity={0.45} floatIntensity={0.5}>
          {swarm.map((cfg, i) => (
            <Shape key={i} cfg={cfg} wireframe={wireframe} opacity={opacity} rotate={autoRotate} />
          ))}
        </Float>

        <OrbitControls enablePan={false} enableZoom={false} enableRotate />
      </Canvas>
    </div>
  );
}
