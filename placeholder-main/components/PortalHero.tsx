'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

type Props = {
  logoSrc?: string;     // small logo used in the fullscreen overlay
  baseHeight?: number;  // default hero height before scroll
  minHeight?: number;   // minimum collapsed height
};

export default function PortalHero({
  logoSrc = '/icon.png',
  baseHeight = 220,          // visual size at top
  minHeight = 72,            // collapsed size under the header
}: Props) {
  // header measurement
  const [headerH, setHeaderH] = useState(64);
  // visual shrink
  const [scale, setScale] = useState(1);
  // layout height that truly collapses (this is the key!)
  const [layoutH, setLayoutH] = useState(baseHeight);
  // modal
  const [open, setOpen] = useState(false);
  // postprocessing fallback
  const [disableFX, setDisableFX] = useState(false);
  const [noGlass, setNoGlass] = useState(false);

  // find the header once, keep it updated
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-app-header]') || document.querySelector('header');
    const update = () => setHeaderH(el?.getBoundingClientRect().height || 64);
    update();
    const ro = new ResizeObserver(update);
    el && ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  // scroll-driven shrink (both scale AND real height)
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      lastY = y;

      // visual scale: top (1.0) -> collapsed (0.6)
      const sTarget = 1 - Math.min(y / 600, 0.4); // clamp to 0.6
      setScale(prev => prev + (sTarget - prev) * 0.18);

      // REAL height collapse so it doesn't block the feed
      const hTarget = baseHeight - Math.min(y, 600) * ((baseHeight - minHeight) / 600);
      setLayoutH(prev => prev + (hTarget - prev) * 0.25);
    };
    onScroll(); // set initial values
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [baseHeight, minHeight]);

  // lock scroll when modal is open
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

  // styles
  const shellStyle: React.CSSProperties = useMemo(
    () => ({
      position: 'sticky',
      top: `calc(${headerH}px + env(safe-area-inset-top, 0px))`,
      zIndex: 500,
      background: 'var(--panel, #101114)',
      borderBottom: '1px solid var(--stroke, rgba(255,255,255,0.08))',
      // real height collapses smoothly
      height: Math.max(minHeight, Math.min(baseHeight, layoutH)),
      transition: 'height 160ms ease',
      willChange: 'height',
      contain: 'layout paint',
    }),
    [headerH, layoutH, baseHeight, minHeight]
  );

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    height: '100%',           // fills the collapsing shell
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid var(--stroke, rgba(255,255,255,0.09))',
    background: '#0b0c10',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    touchAction: 'manipulation',
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    transition: 'transform 180ms ease',
  };

  return (
    <div style={shellStyle} aria-label="3D portal hero">
      <div style={cardStyle}>
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          onCreated={(state) => {
            const isWebGL2 = (state.gl as any)?.capabilities?.isWebGL2 ?? false;
            const isHiDPI = window.devicePixelRatio > 2;
            setDisableFX(!isWebGL2);
            setNoGlass(!isWebGL2 || isHiDPI);
          }}
        >
          <color attach="background" args={['#0a0b10']} />
          <ambientLight intensity={0.9} />
          <directionalLight position={[2, 3, 2]} intensity={0.9} />

          {/* simple, built-in shapes for reliability */}
          <Float speed={1} rotationIntensity={0.35} floatIntensity={0.9}>
            <RockMesh position={[-1.15, 0.15, 0]} paused={false} />
          </Float>
          <Float speed={1.15} rotationIntensity={0.25} floatIntensity={0.7}>
            <CubeMesh position={[0.9, -0.2, 0.2]} paused={false} />
          </Float>
          <Float speed={0.9} rotationIntensity={0.4} floatIntensity={0.9}>
            <RingMesh position={[0.2, 0.35, -0.3]} glass={!noGlass} />
          </Float>

          <ContactShadows position={[0, -0.9, 0]} opacity={0.22} scale={10} blur={1.6} far={2} />

          {!disableFX && (
            <EffectComposer>
              <Bloom intensity={0.6} luminanceThreshold={0.8} luminanceSmoothing={0.25} />
            </EffectComposer>
          )}

          <Html center>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open 3D portal"
              style={ctaBtn}
            >
              Enter Universe — tap to interact
            </button>
          </Html>
        </Canvas>
      </div>

      {/* Action row lives outside the canvas so it never overlaps content */}
      <div style={actionsRow}>
        <button style={primaryBtn} onClick={() => setOpen(true)}>Open Universe</button>
        <button style={ghostBtn} onClick={() => setOpen(true)}>Remix a Universe</button>
      </div>

      {/* fullscreen modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(6,7,10,0.92)' }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
            <color attach="background" args={['#0a0b10']} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[3, 2, 2]} intensity={0.9} />

            {Array.from({ length: 16 }).map((_, i) => (
              <Float key={i} speed={0.6 + (i % 5) * 0.08} rotationIntensity={0.25}>
                <group position={[
                  (Math.random() - 0.5) * 6,
                  (Math.random() - 0.5) * 4,
                  (Math.random() - 0.5) * 5
                ]}>
                  {i % 3 === 0 ? <RockMesh /> : i % 3 === 1 ? <CubeMesh /> : <RingMesh glass={!noGlass} />}
                </group>
              </Float>
            ))}

            <ContactShadows position={[0, -1.2, 0]} opacity={0.2} scale={15} blur={2.2} far={3} />
            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.7} luminanceThreshold={0.8} luminanceSmoothing={0.25} />
              </EffectComposer>
            )}

            <Html center>
              <div style={overlayHint}>
                <img src={logoSrc} alt="app logo" width={18} height={18} style={{ marginRight: 8 }} />
                Tap anywhere to close
              </div>
            </Html>
          </Canvas>
        </div>
      )}
    </div>
  );
}

/* ---------- tiny shape components (no extra libs, very safe) ---------- */

function RockMesh({ paused = false, ...props }: { paused?: boolean } & JSX.IntrinsicElements['mesh']) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (paused) return;
    ref.current.rotation.x += dt * 0.25;
    ref.current.rotation.y -= dt * 0.18;
  });
  return (
    <mesh ref={ref} {...props}>
      <icosahedronGeometry args={[0.6, 0]} />
      <meshStandardMaterial color="#cfcfd8" roughness={0.5} metalness={0.2} />
    </mesh>
  );
}

function CubeMesh({ paused = false, ...props }: { paused?: boolean } & JSX.IntrinsicElements['mesh']) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (paused) return;
    ref.current.rotation.x += dt * 0.18;
    ref.current.rotation.y += dt * 0.22;
  });
  return (
    <mesh ref={ref} {...props}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="#e6e7ef" roughness={0.45} metalness={0.15} />
    </mesh>
  );
}

function RingMesh({ glass = true, ...props }: { glass?: boolean } & JSX.IntrinsicElements['mesh']) {
  return (
    <mesh {...props} rotation={[Math.PI / 2.2, 0, 0]}>
      <torusGeometry args={[0.48, 0.12, 24, 64]} />
      {glass ? (
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.85}
          roughness={0.08}
          metalness={0.1}
          thickness={0.4}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      ) : (
        <meshStandardMaterial color="#f2f3f7" roughness={0.25} />
      )}
    </mesh>
  );
}

/* ---------- small inline styles (kept here so you only replace one file) ---------- */

const actionsRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  padding: '10px 12px 12px',
  alignItems: 'center',
};

const ctaBtn: React.CSSProperties = {
  font: '600 12px/1.1 system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif',
  padding: '8px 10px',
  borderRadius: 12,
  background: 'rgba(10,10,14,0.78)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  cursor: 'pointer',
  whiteSpace: 'nowrap'
};

const primaryBtn: React.CSSProperties = {
  font: '600 13px/1 system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif',
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#101114',
  color: '#fff',
  cursor: 'pointer',
};

const ghostBtn: React.CSSProperties = {
  ...primaryBtn,
  background: 'transparent',
  color: '#eee',
  border: '1px solid rgba(255,255,255,0.18)',
};

const overlayHint: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: 10,
  background: 'rgba(15,15,20,0.75)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.2)',
  font: '600 12px/1 system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif',
};
