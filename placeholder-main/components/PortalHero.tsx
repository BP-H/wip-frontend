// components/PortalHero.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/* ---------- utils ---------- */

type ShapeProps = { seed?: number; glass?: boolean };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ---------- inline shapes (fixes "Cannot find name 'Rock'") ---------- */

function Rock({ seed = 0 }: ShapeProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.22 + ((seed % 100) / 150), [seed]);
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

function Cube({ seed = 0 }: ShapeProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.12 + ((seed % 50) / 200), [seed]);
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

function Torus({ seed = 0, glass = false }: ShapeProps) {
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
      {/* lighter than 120/18 for perf */}
      <torusKnotGeometry args={[0.48, 0.16, 64, 12]} />
      {glass ? (
        <meshPhysicalMaterial
          color="#f9fbff"
          transmission={0.45}
          thickness={2}
          roughness={0.2}
          metalness={0.1}
        />
      ) : (
        <meshStandardMaterial color="#f3f6ff" roughness={0.25} metalness={0.08} />
      )}
    </mesh>
  );
}

/* ---------- hero (NOT sticky; let the page wrapper be sticky) ---------- */

export default function PortalHero({
  logoSrc = '/icon.png',
  title = 'Enter universe — tap to interact',
}: {
  logoSrc?: string;
  title?: string;
}) {
  const [scale, setScale] = useState(1);
  const [kick, setKick] = useState(0);
  const [open, setOpen] = useState(false);

  // capability gates
  const [disableFX, setDisableFX] = useState(false);
  const [noGlass, setNoGlass] = useState(false);

  // scroll-driven scale + “energy” kick
  useEffect(() => {
    let lastY = window.scrollY;
    let run = true;

    const step = () => {
      const y = window.scrollY;
      const delta = Math.abs(y - lastY);
      lastY = y;

      setScale((s) => {
        const target = clamp(1 - y / 900, 0.84, 1);
        return s + (target - s) * 0.12;
      });
      setKick((k) => clamp(k + delta / 900, 0, 1));

      if (run) requestAnimationFrame(step);
    };

    const decay = () => {
      setKick((k) => k * 0.92);
      if (run) requestAnimationFrame(decay);
    };

    requestAnimationFrame(step);
    requestAnimationFrame(decay);
    return () => {
      run = false;
    };
  }, []);

  // lock body scroll + ESC to close when modal open
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

  // styles (inline so no CSS dependency)
  const innerStyle: React.CSSProperties = {
    transform: `scale(${scale}) translateZ(0)`,
    transformOrigin: 'top center',
    transition: 'transform .18s linear',
    willChange: 'transform',
  };
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid var(--stroke, #222a36)',
    background: '#0a0b10',
    boxShadow: '0 0 20px rgba(155,140,255,0.15)',
    touchAction: 'manipulation',
  };
  const glowPink: React.CSSProperties = {
    position: 'absolute',
    inset: -20,
    pointerEvents: 'none',
    background:
      'radial-gradient(60% 50% at 50% 35%, rgba(255,45,184,0.24) 0%, rgba(255,45,184,0.12) 25%, transparent 70%)',
    opacity: 0.5 + kick * 0.35,
    filter: `blur(${6 + 12 * kick}px)`,
    mixBlendMode: 'screen',
  };
  const glowPurple: React.CSSProperties = {
    position: 'absolute',
    inset: -20,
    pointerEvents: 'none',
    background:
      'radial-gradient(55% 45% at 50% 30%, rgba(79,70,229,0.20) 0%, rgba(79,70,229,0.08) 25%, transparent 70%)',
    opacity: 0.4 + kick * 0.25,
    filter: `blur(${8 + 10 * kick}px)`,
    mixBlendMode: 'screen',
  };
  const glossAngle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'linear-gradient(130deg, rgba(155,140,255,0.12) 10%, rgba(255,255,255,0) 40%, rgba(255,45,184,0.15) 90%)',
    mixBlendMode: 'screen',
  };

  return (
    <div style={innerStyle}>
      <div style={cardStyle}>
        <div aria-hidden style={glowPink} />
        <div aria-hidden style={glowPurple} />
        <div aria-hidden style={glossAngle} />

        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 50 }}
          dpr={[1, 1.5]} // cap for perf
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            const webgl2 = (gl as any).capabilities?.isWebGL2 ?? false;
            const hiDPI = window.devicePixelRatio > 2;
            setDisableFX(!webgl2);
            setNoGlass(!webgl2 || hiDPI);
          }}
        >
          <color attach="background" args={['#0a0b10']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 3, 2]} intensity={0.85} />

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
              <Torus seed={47} glass={!noGlass} />
            </group>
          </Float>

          <ContactShadows position={[0, -0.85, 0]} opacity={0.22} scale={10} blur={1.6} far={2} />

          {!disableFX && (
            <EffectComposer>
              <Bloom intensity={0.55} luminanceThreshold={0.78} luminanceSmoothing={0.22} />
            </EffectComposer>
          )}

          <Html center>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open 3D portal"
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid var(--stroke, #2a3140)',
                background: 'rgba(255,255,255,0.9)',
                color: '#0f172a',
                cursor: 'pointer',
                fontWeight: 800,
                letterSpacing: 0.2,
              }}
            >
              {title}
            </button>
          </Html>
        </Canvas>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(10,11,16,0.92)' }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
            <color attach="background" args={['#0a0b10']} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[3, 2, 2]} intensity={0.9} />

            {Array.from({ length: 18 }).map((_, i) => {
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

            <OrbitControls enablePan={false} />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.2} scale={15} blur={2.2} far={3} />

            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.7} luminanceThreshold={0.8} luminanceSmoothing={0.25} />
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
                  border: '1px solid var(--stroke, #2a3140)',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#0f172a',
                  fontWeight: 800,
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
