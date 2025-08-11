'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const CARD_H = 220; // visual card height in px

/**
 * Local inline shapes so the build never breaks.
 */
type ShapeProps = { paused?: boolean; seed?: number; glass?: boolean };

function Rock({ paused, seed = 1 }: ShapeProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  // Icosahedron looks “rocky” with low detail
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.65, 0), []);
  useFrame((_, d) => {
    if (!paused && mesh.current) {
      mesh.current.rotation.x += d * 0.35;
      mesh.current.rotation.y -= d * 0.4;
    }
  });
  return (
    <mesh ref={mesh} geometry={geo} castShadow receiveShadow position={[0, 0, 0]}>
      <meshStandardMaterial color="#d7d8de" roughness={0.7} metalness={0.1} />
    </mesh>
  );
}

function Cube({ paused }: ShapeProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => {
    if (!paused && mesh.current) {
      mesh.current.rotation.x += d * 0.25;
      mesh.current.rotation.y += d * 0.33;
    }
  });
  return (
    <mesh ref={mesh} castShadow receiveShadow>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial color="#cfd2d8" roughness={0.75} metalness={0.08} />
    </mesh>
  );
}

function Torus({ paused, glass }: ShapeProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => {
    if (!paused && mesh.current) {
      mesh.current.rotation.x -= d * 0.2;
      mesh.current.rotation.z += d * 0.2;
    }
  });
  return (
    <mesh ref={mesh} castShadow receiveShadow>
      <torusKnotGeometry args={[0.35, 0.11, 64, 8]} />
      {glass ? (
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.35}
          metalness={0}
          roughness={0}
          transmission={0.9}
          thickness={0.6}
        />
      ) : (
        <meshStandardMaterial color="#e7e8ee" roughness={0.35} metalness={0.2} />
      )}
    </mesh>
  );
}

/**
 * PortalHero — minimal, sticky, responsive.
 * - Measures the header (data-app-header) and offsets itself.
 * - Shrinks smoothly with scroll.
 * - The sticky container height tracks the *scaled* card height,
 *   so there’s no giant blank area stuck to the top anymore.
 */
export default function PortalHero({ logoSrc = '/icon.png' }) {
  const [headerH, setHeaderH] = useState(64);
  const [scale, setScale] = useState(1);
  const [open, setOpen] = useState(false);
  const [disableFX, setDisableFX] = useState(false);
  const [noGlass, setNoGlass] = useState(false);

  // 1) Observe header height (expects <header data-app-header .../>)
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-app-header]');
    const update = () => {
      if (!header) return;
      const h = Math.max(48, Math.round(header.getBoundingClientRect().height));
      setHeaderH(h);
    };
    update();
    const ro = new ResizeObserver(update);
    if (header) ro.observe(header);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  // 2) Scroll shrink (clamped to 0.84 for a compact look)
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      lastY = y;
      const target = 1 - Math.min(y / 900, 0.16); // <= 0.84
      setScale((prev) => prev + (target - prev) * 0.12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 3) Lock body scroll when modal is open + close on ESC
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Sticky container — only the visible card height is sticky
  const containerStyle: React.CSSProperties = {
    position: 'sticky',
    top: `calc(${headerH}px + env(safe-area-inset-top, 0px))`,
    zIndex: 90, // below header, above feed
    height: CARD_H * scale, // <-- key fix: shrink the actual sticky height
    pointerEvents: 'none', // inner card re-enables
  };

  // Scaled inner (kept separate so we can change container height above)
  const innerStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    transition: 'transform 0.18s ease',
    willChange: 'transform',
    pointerEvents: 'auto',
  };

  // Card styling: minimal, crisp, no gradients
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    height: CARD_H,
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
    background: '#0b0c10',
    boxShadow:
      '0 0.5px 0 inset rgba(255,255,255,0.06), 0 8px 28px rgba(0,0,0,0.35)',
    touchAction: 'manipulation',
  };

  return (
    <div style={containerStyle} aria-label="Portal hero (sticky)">
      <div style={innerStyle}>
        <div style={cardStyle}>
          <Canvas
            camera={{ position: [0, 0, 3.1], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            onCreated={(state) => {
              // Graceful degrade on WebGL2 miss / hi-DPI
              const isWebGL2 = !!state.gl.capabilities?.isWebGL2;
              const isHiDPI = window.devicePixelRatio > 2;
              setDisableFX(!isWebGL2);
              setNoGlass(!isWebGL2 || isHiDPI);
            }}
          >
            <color attach="background" args={['#0b0c10']} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[2, 3, 2]} intensity={0.85} />

            {/* Compact constellation */}
            <Float speed={1} rotationIntensity={0.28} floatIntensity={0.75}>
              <group position={[-1.2, 0.12, 0]}><Rock paused={!open} /></group>
            </Float>
            <Float speed={1.15} rotationIntensity={0.22} floatIntensity={0.7}>
              <group position={[0.85, -0.18, 0.2]}><Cube paused={!open} /></group>
            </Float>
            <Float speed={0.95} rotationIntensity={0.35} floatIntensity={0.85}>
              <group position={[0.15, 0.35, -0.3]}>
                <Torus paused={!open} glass={!noGlass} />
              </group>
            </Float>

            <ContactShadows
              position={[0, -0.85, 0]}
              opacity={0.2}
              scale={10}
              blur={1.6}
              far={2}
            />

            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.55} luminanceThreshold={0.8} luminanceSmoothing={0.25} />
              </EffectComposer>
            )}

            {/* CTA */}
            <Html center>
              <button
                className="enterPortalBtn"
                onClick={() => setOpen(true)}
                aria-label="Open 3D portal"
              >
                Enter universe — tap to interact
              </button>
            </Html>
          </Canvas>
        </div>
      </div>

      {/* Fullscreen modal on tap */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(9,10,14,0.92)',
          }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 54 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
            <color attach="background" args={['#0b0c10']} />
            <ambientLight intensity={0.9} />
            <directionalLight position={[3, 2, 2]} intensity={0.95} />
            {Array.from({ length: 16 }).map((_, i) => {
              const kind = (['rock', 'cube', 'torus'] as const)[i % 3];
              const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 5
              );
              return (
                <group key={i} position={pos}>
                  {kind === 'rock' && <Rock seed={i} />}
                  {kind === 'cube' && <Cube seed={i} />}
                  {kind === 'torus' && <Torus seed={i} glass={!noGlass} />}
                </group>
              );
            })}
            <ContactShadows position={[0, -1.2, 0]} opacity={0.18} scale={15} blur={2.1} far={3} />
            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.65} luminanceThreshold={0.82} luminanceSmoothing={0.25} />
              </EffectComposer>
            )}
            <Html center>
              <div className="portalCloseHint">
                <img src={logoSrc} alt="app" width={20} height={20} />
                Tap anywhere to close
              </div>
            </Html>
          </Canvas>
        </div>
      )}

      {/* minimal styles for the CTA/hint */}
      <style jsx>{`
        .enterPortalBtn {
          -webkit-tap-highlight-color: transparent;
          appearance: none;
          height: 40px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.2px;
          backdrop-filter: blur(6px);
          cursor: pointer;
        }
        .enterPortalBtn:active {
          transform: translateY(1px);
        }
        .portalCloseHint {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          font-weight: 600;
          font-size: 12px;
          backdrop-filter: blur(6px);
          user-select: none;
        }
      `}</style>
    </div>
  );
}
