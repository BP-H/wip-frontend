'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

type ShapeKind = 'rock' | 'cube' | 'torus';

/** small helpers */
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const scrollTop = () =>
  typeof window === 'undefined'
    ? 0
    : window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

/** shapes */
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
 * Sticky wrapper lives on the OUTER div (no transform/overflow on it).
 * We scale a CHILD div — this keeps sticky working on iOS/Android.
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

  useEffect(() => {
    let ticking = false;
    const handle = () => {
      const y = scrollTop();
      const s = clamp(1 - y / 900, 0.82, 1); // 1 → 0.82 over ~900px
      setScale(s);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(handle);
      }
    };
    handle();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="portalSticky"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        borderBottom: '1px solid var(--stroke, #e5e7eb)',
        background: 'var(--panel, #ffffff)',
      }}
    >
      {/* scale the inner, keep sticky on the parent */}
      <div
        className="portalScale"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform .15s linear',
        }}
      >
        <div
          className="portalCanvasWrap"
          style={{
            height: 220,
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid var(--stroke, #e5e7eb)',
            touchAction: 'manipulation',
          }}
        >
          {/* light ring / portal glow */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -40,
              background:
                'radial-gradient(50% 60% at 50% 20%, rgba(255,45,184,.18), rgba(79,70,229,.12) 30%, transparent 70%)',
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
            }}
          />
          <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }} dpr={[1, 2]}>
            <color attach="background" args={['#ffffff']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 3, 2]} intensity={0.9} />
            <Trio />
            <ContactShadows position={[0, -0.85, 0]} opacity={0.25} scale={10} blur={1.8} far={2} />
            <Html center>
              <button
                onClick={() => setOpen(true)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid var(--stroke, #e5e7eb)',
                  background: 'rgba(255,255,255,0.88)',
                  color: '#0f172a',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
                aria-label="Open 3D universe"
              >
                {title}
              </button>
            </Html>
          </Canvas>
        </div>
      </div>

      {/* fullscreen portal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: '#ffffff',
          }}
          onClick={() => setOpen(false)}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
            <color attach="background" args={['#ffffff']} />
            <ambientLight intensity={0.8} />
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
            <ContactShadows position={[0, -1.2, 0]} opacity={0.25} scale={15} blur={2.2} far={3} />
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
