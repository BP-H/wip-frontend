'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

type ShapeKind = 'rock' | 'cube' | 'torus';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function Rock({ seed = 0 }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.2 + ((seed % 100) / 150), [seed]);
  useFrame((state, dt) => {
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

function Cube({ seed = 0 }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.1 + ((seed % 50) / 200), [seed]);
  useFrame((state) => {
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

function Torus({ seed = 0 }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.25 + ((seed % 80) / 160), [seed]);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + seed;
    ref.current.rotation.y += 0.01 + Math.sin(t) * 0.01;
    ref.current.position.x = Math.sin(t * 0.6) * 0.55;
    ref.current.position.y = Math.cos(t * 0.6) * 0.4;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.48, 0.16, 120, 18]} />
      <meshPhysicalMaterial color="#f9fbff" transmission={0.45} thickness={2} roughness={0.2} />
    </mesh>
  );
}

function Trio() {
  return (
    <>
      <Float speed={1} rotationIntensity={0.35} floatIntensity={0.8}>
        <group position={[-1.2, 0.2, 0]}>
          <Rock seed={11} />
        </group>
      </Float>
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.7}>
        <group position={[0.8, -0.2, 0.2]}>
          <Cube seed={29} />
        </group>
      </Float>
      <Float speed={0.9} rotationIntensity={0.4} floatIntensity={0.9}>
        <group position={[0.2, 0.35, -0.3]}>
          <Torus seed={47} />
        </group>
      </Float>
    </>
  );
}

/**
 * Sticky wrapper has NO transforms (iOS rule).
 * The inner container scales on scroll.
 * There’s an animated, scroll-reactive “energy ring” (CSS-only) + Bloom.
 */
export default function PortalHero({
  title = 'Enter universe — tap to interact',
  logoSrc = '/icon.png',
}: {
  title?: string;
  logoSrc?: string;
}) {
  const [scale, setScale] = useState(1);
  const [open, setOpen] = useState(false);
  const [kick, setKick] = useState(0); // reacts to scroll velocity
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    let lastY = window.scrollY;
    const calc = () => {
      const y = window.scrollY;
      const delta = Math.abs(y - lastY);
      lastY = y;

      setScale(clamp(1 - y / 900, 0.84, 1));
      setKick((k) => clamp(k + delta / 900, 0, 1)); // add kick with scroll
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(calc);
      }
    };
    const decay = () => {
      setKick((k) => k * 0.92); // fade the energy
      requestAnimationFrame(decay);
    };

    calc();
    window.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(decay);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      style={{
        position: 'sticky',
        top: 'env(safe-area-inset-top, 0px)',
        zIndex: 40, // under topbar, above feed
        background: 'var(--panel, #fff)',
        borderBottom: '1px solid var(--stroke, #e5e7eb)',
      }}
    >
      {/* inner element takes the transform so sticky never breaks */}
      <div
        ref={innerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform .15s linear',
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
          {/* Pink/blue energy (no gradient blends). We just stack two radial fades. */}
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

          <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }} dpr={[1, 2]}>
            <color attach="background" args={['#ffffff']} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[2, 3, 2]} intensity={0.9} />
            <Trio />
            <ContactShadows position={[0, -0.85, 0]} opacity={0.2} scale={10} blur={1.8} far={2} />
            <EffectComposer>
              <Bloom intensity={0.5} luminanceThreshold={0.8} luminanceSmoothing={0.2} />
            </EffectComposer>

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
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: '#fff',
          }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
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
                  {kind === 'torus' && <Torus seed={i * 5} />}
                </group>
              );
            })}
            <OrbitControls enablePan={false} />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.2} scale={15} blur={2.2} far={3} />
            <EffectComposer>
              <Bloom intensity={0.55} luminanceThreshold={0.8} luminanceSmoothing={0.25} />
            </EffectComposer>
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
