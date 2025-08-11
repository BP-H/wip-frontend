// components/PortalHero.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html, ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

type ShapeKind = 'rock' | 'cube' | 'torus';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Measure header height (looks for [data-app-header] or the banner role) */
function useHeaderHeight(defaultH = 64) {
  const [h, setH] = useState(defaultH);
  useEffect(() => {
    const el =
      (document.querySelector('[data-app-header]') as HTMLElement | null) ??
      (document.querySelector('header[role="banner"]') as HTMLElement | null);
    if (!el) return;
    const set = () => setH(el.getBoundingClientRect().height || defaultH);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    window.addEventListener('resize', set);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', set);
    };
  }, [defaultH]);
  return h;
}

/** Pause R3F work when portal is not on screen */
function useVisibility(ref: React.RefObject<HTMLElement>) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { rootMargin: '200px 0px' }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}

function Rock({ seed = 0, paused = false }: { seed?: number; paused?: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.2 + ((seed % 100) / 150), [seed]);
  useFrame((state, dt) => {
    if (paused) return;
    const t = state.clock.elapsedTime * speed + seed;
    ref.current.rotation.x += 0.28 * dt;
    ref.current.rotation.y += 0.22 * dt;
    ref.current.position.y = Math.sin(t) * 0.5;
    ref.current.position.x = Math.cos(t * 0.7) * 0.35;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial color="#eef1f6" roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

function Cube({ seed = 0, paused = false }: { seed?: number; paused?: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.1 + ((seed % 50) / 200), [seed]);
  useFrame((state) => {
    if (paused) return;
    const t = state.clock.elapsedTime * speed + seed;
    ref.current.rotation.x = Math.sin(t * 1.2) * 0.5;
    ref.current.rotation.z = Math.cos(t) * 0.4;
    ref.current.position.z = Math.sin(t * 0.9) * 0.6;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.05} />
    </mesh>
  );
}

function Torus({ seed = 0, paused = false, glass = true }: { seed?: number; paused?: boolean; glass?: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.25 + ((seed % 80) / 160), [seed]);
  useFrame((state) => {
    if (paused) return;
    const t = state.clock.elapsedTime * speed + seed;
    ref.current.rotation.y += 0.01 + Math.sin(t) * 0.01;
    ref.current.position.x = Math.sin(t * 0.6) * 0.55;
    ref.current.position.y = Math.cos(t * 0.6) * 0.4;
  });
  return (
    <mesh ref={ref}>
      {/* lighter segments than before to help mobile */}
      <torusKnotGeometry args={[0.48, 0.16, 64, 12]} />
      {glass ? (
        <meshPhysicalMaterial color="#f9fbff" transmission={0.45} thickness={2} roughness={0.2} />
      ) : (
        <meshStandardMaterial color="#f1f4fb" roughness={0.25} metalness={0.15} />
      )}
    </mesh>
  );
}

function Trio({ paused, glass }: { paused: boolean; glass: boolean }) {
  return (
    <>
      <Float speed={1} rotationIntensity={0.35} floatIntensity={0.8}>
        <group position={[-1.2, 0.2, 0]}>
          <Rock seed={11} paused={paused} />
        </group>
      </Float>
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.7}>
        <group position={[0.8, -0.2, 0.2]}>
          <Cube seed={29} paused={paused} />
        </group>
      </Float>
      <Float speed={0.9} rotationIntensity={0.4} floatIntensity={0.9}>
        <group position={[0.2, 0.35, -0.3]}>
          <Torus seed={47} paused={paused} glass={glass} />
        </group>
      </Float>
    </>
  );
}

export default function PortalHero({
  title = 'Enter universe — tap to interact',
  logoSrc = '/icon.png',
}: { title?: string; logoSrc?: string }) {
  const headerH = useHeaderHeight(64);
  const shellRef = useRef<HTMLDivElement>(null);
  const visible = useVisibility(shellRef);

  const [open, setOpen] = useState(false);
  const [kick, setKick] = useState(0);
  const [scale, setScale] = useState(1);
  const [disableFX, setDisableFX] = useState(false);
  const [noGlass, setNoGlass] = useState(false);

  // Scroll-reactive scale + gentle energy kick (with safe cleanup)
  useEffect(() => {
    let rafId = 0;
    let running = true;
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = Math.abs(y - lastY);
      lastY = y;
      setScale(clamp(1 - y / 900, 0.84, 1));
      setKick((k) => clamp(k + delta / 900, 0, 1));
    };

    const decay = () => {
      setKick((k) => k * 0.92);
      if (!running) return;
      rafId = requestAnimationFrame(decay);
    };
    rafId = requestAnimationFrame(decay);

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Lock body when modal open + ESC to close
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
    <div
      ref={shellRef}
      style={{
        position: 'sticky',
        top: `calc(${headerH}px + env(safe-area-inset-top, 0px))`,
        zIndex: 500,                // below header, above feed cards
        isolation: 'isolate',       // new stacking context = safer z-index
        background: 'var(--panel, #fff)',
        borderBottom: '1px solid var(--stroke, #e5e7eb)',
      }}
    >
      {/* inner takes transforms so sticky never breaks */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform .15s linear',
          willChange: 'transform',
        }}
      >
        <div
          style={{
            height: 220,
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid var(--stroke, #e5e7eb)',
            touchAction: 'manipulation',
          }}
        >
          {/* energy rings */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -20,
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
              opacity: 0.55 + kick * 0.35,
              filter: `blur(${6 + 12 * kick}px)`,
              background:
                'radial-gradient(60% 50% at 50% 35%, rgba(255,45,184,.16) 0, rgba(255,45,184,.08) 25%, transparent 70%)',
              transition: 'opacity .2s linear',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -20,
              pointerEvents: 'none',
              opacity: 0.35 + kick * 0.25,
              filter: `blur(${8 + 10 * kick}px)`,
              background:
                'radial-gradient(55% 45% at 50% 30%, rgba(79,70,229,.10) 0, rgba(79,70,229,.05) 25%, transparent 70%)',
              transition: 'opacity .2s linear',
            }}
          />

          <Canvas
            camera={{ position: [0, 0, 3.2], fov: 50 }}
            dpr={[1, 1.5]} // cap for perf
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            onCreated={(state) => {
              // gate fancy bits if WebGL2 missing or low-power
              // @ts-ignore - capabilities is internal but present
              const webgl2 = !!state.gl.capabilities?.isWebGL2;
              const lowPower = window.devicePixelRatio > 2;
              setDisableFX(!webgl2);
              setNoGlass(!webgl2 || lowPower);
            }}
          >
            <color attach="background" args={['#ffffff']} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[2, 3, 2]} intensity={0.9} />

            <Trio paused={!visible} glass={!noGlass} />

            <ContactShadows position={[0, -0.85, 0]} opacity={0.2} scale={10} blur={1.6} far={2} />

            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.5} luminanceThreshold={0.8} luminanceSmoothing={0.2} />
              </EffectComposer>
            )}

            <Html center>
              <button
                onClick={() => setOpen(true)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid var(--stroke, #e5e7eb)',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#0f172a',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
                aria-label="Open 3D portal"
              >
                {title}
              </button>
            </Html>
          </Canvas>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 999, background: '#fff' }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
            <color attach="background" args={['#ffffff']} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[3, 2, 2]} intensity={0.9} />
            {Array.from({ length: 18 }).map((_, i) => {
              const kind: ShapeKind = (['rock', 'cube', 'torus'] as const)[i % 3];
              const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 5
              );
              return (
                <group key={i} position={pos}>
                  {kind === 'rock' && <Rock seed={i * 13} />}
                  {kind === 'cube' && <Cube seed={i * 7} />}
                  {kind === 'torus' && <Torus seed={i * 5} glass={!noGlass} />}
                </group>
              );
            })}
            <OrbitControls enablePan={false} />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.2} scale={15} blur={2.2} far={3} />
            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.55} luminanceThreshold={0.8} luminanceSmoothing={0.25} />
              </EffectComposer>
            )}
            <Html center>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--stroke, #e5e7eb)',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#0f172a',
                  fontWeight: 700,
                }}
              >
                <img alt="app" src={logoSrc} width={20} height={20} />
                Tap anywhere to close
              </div>
            </Html>
          </Canvas>
        </div>
      )}
    </div>
  );
}
