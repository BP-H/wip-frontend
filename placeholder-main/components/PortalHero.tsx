// components/PortalHero.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// ----------------------------
// Tiny shape library (inline)
// ----------------------------
type ShapeProps = {
  paused?: boolean;
  seed?: number;
  glass?: boolean;
};

function Rock({ paused, seed = 1 }: ShapeProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  const rot = useMemo(() => (seed * 9301 + 49297) % 233280 / 233280, [seed]);
  useFrame((_, dt) => {
    if (paused) return;
    mesh.current.rotation.x += dt * 0.25;
    mesh.current.rotation.y += dt * 0.18;
  });
  return (
    <mesh ref={mesh} castShadow receiveShadow rotation={[0.2 + rot, 0.6, 0]}>
      <icosahedronGeometry args={[0.48, 0]} />
      <meshStandardMaterial color="#cfd2d9" roughness={0.8} metalness={0.15} />
    </mesh>
  );
}

function Cube({ paused, seed = 1 }: ShapeProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  const s = useMemo(() => 0.42 + ((seed * 1664525 + 1013904223) % 97) / 1000, [seed]);
  useFrame((_, dt) => {
    if (paused) return;
    mesh.current.rotation.x -= dt * 0.2;
    mesh.current.rotation.z += dt * 0.14;
  });
  return (
    <mesh ref={mesh} castShadow receiveShadow>
      <boxGeometry args={[s, s, s]} />
      <meshStandardMaterial color="#e5e7eb" roughness={0.75} metalness={0.2} />
    </mesh>
  );
}

function Torus({ paused, glass = false, seed = 1 }: ShapeProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (paused) return;
    mesh.current.rotation.x += dt * 0.1;
    mesh.current.rotation.y -= dt * 0.15;
  });
  return (
    <mesh ref={mesh} castShadow receiveShadow>
      <torusGeometry args={[0.36, 0.11, 14, 64]} />
      {glass ? (
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          transmission={1}
          roughness={0.05}
          thickness={0.5}
          metalness={0}
        />
      ) : (
        <meshStandardMaterial color="#f5f5f7" roughness={0.6} metalness={0.25} />
      )}
    </mesh>
  );
}

// ----------------------------
// Portal Hero
// ----------------------------
export default function PortalHero({ logoSrc = '/icon.png' }: { logoSrc?: string }) {
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerH, setHeaderH] = useState(64);
  const [scale, setScale] = useState(1);
  const [open, setOpen] = useState(false);
  const [disableFX, setDisableFX] = useState(false);
  const [noGlass, setNoGlass] = useState(false);

  // Measure header for sticky offset
  useEffect(() => {
    headerRef.current = document.querySelector('[data-app-header]');
    const update = () => {
      if (!headerRef.current) return;
      setHeaderH(headerRef.current.getBoundingClientRect().height || 64);
    };
    update();
    const ro = new ResizeObserver(update);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  // Scroll shrink: from 1 down to 0.85
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const target = 1 - Math.min(y / 900, 0.15);
      setScale((prev) => prev + (target - prev) * 0.12);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body when modal open
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

  // Styles: compact, minimal, no gradients
  const portalStyle: React.CSSProperties = {
    position: 'sticky',
    top: `calc(${headerH}px + env(safe-area-inset-top, 0px))`,
    zIndex: 100,
    isolation: 'isolate',
    background: 'var(--panel, transparent)',
    borderBottom: '1px solid var(--stroke, rgba(255,255,255,0.06))',
    paddingTop: 8,
    paddingBottom: 8
  };
  const innerStyle: React.CSSProperties = {
    transform: `scale(${scale}) translateZ(0)`,
    transformOrigin: 'top center',
    transition: 'transform 0.18s ease',
    willChange: 'transform'
  };
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid var(--stroke, rgba(255,255,255,0.08))',
    background: 'var(--surface-2, #0b0c0f)',
    boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
    touchAction: 'manipulation'
  };

  return (
    <div style={portalStyle}>
      <div style={innerStyle}>
        <div style={cardStyle}>
          <Canvas
            style={{ width: '100%', height: '100%', display: 'block' }}
            camera={{ position: [0, 0, 3.2], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            onCreated={(state) => {
              const webgl2 = !!state.gl.capabilities?.isWebGL2;
              const isHiDPI = window.devicePixelRatio > 2;
              setDisableFX(!webgl2);
              setNoGlass(!webgl2 || isHiDPI);
            }}
          >
            <color attach="background" args={['#0b0c0f']} />
            <ambientLight intensity={0.9} />
            <directionalLight position={[2, 3, 2]} intensity={0.9} />

            {/* Floating shapes */}
            <Float speed={1} rotationIntensity={0.3} floatIntensity={0.8}>
              <group position={[-1.1, 0.1, 0]}>
                <Rock paused={!open} seed={1} />
              </group>
            </Float>
            <Float speed={1.15} rotationIntensity={0.25} floatIntensity={0.7}>
              <group position={[0.85, -0.15, 0.2]}>
                <Cube paused={!open} seed={2} />
              </group>
            </Float>
            <Float speed={0.95} rotationIntensity={0.4} floatIntensity={0.9}>
              <group position={[0.15, 0.3, -0.25]}>
                <Torus paused={!open} glass={!noGlass} seed={3} />
              </group>
            </Float>

            <ContactShadows position={[0, -0.85, 0]} opacity={0.25} scale={10} blur={1.6} far={2} />

            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.55} luminanceThreshold={0.75} luminanceSmoothing={0.2} />
              </EffectComposer>
            )}

            {/* Centered CTA */}
            <Html center>
              <button
                onClick={() => setOpen(true)}
                aria-label="Open 3D portal"
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(10,10,12,0.6)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  backdropFilter: 'blur(6px)'
                }}
              >
                Enter universe — tap to interact
              </button>
            </Html>
          </Canvas>
        </div>
      </div>

      {/* Fullscreen modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(7,8,11,0.92)' }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
            <color attach="background" args={['#0b0c0f']} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[3, 2, 2]} intensity={0.9} />

            {Array.from({ length: 18 }).map((_, i) => {
              // fixed, seeded positions (no THREE.Vector3 allocation per frame)
              const rx = (Math.sin(i * 12.9898) * 43758.5453) % 1;
              const ry = (Math.sin(i * 78.233) * 96234.5453) % 1;
              const rz = (Math.sin(i * 3.33) * 125.55) % 1;
              const pos: [number, number, number] = [(rx - 0.5) * 6, (ry - 0.5) * 4, (rz - 0.5) * 5];
              const kind = (i % 3) as 0 | 1 | 2;
              return (
                <group key={i} position={pos}>
                  {kind === 0 && <Rock seed={i + 1} />}
                  {kind === 1 && <Cube seed={i + 1} />}
                  {kind === 2 && <Torus seed={i + 1} glass={!noGlass} />}
                </group>
              );
            })}

            <OrbitControls enablePan={false} />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.22} scale={15} blur={2.2} far={3} />
            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.65} luminanceThreshold={0.8} luminanceSmoothing={0.25} />
              </EffectComposer>
            )}

            <Html center>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.16)',
                  background: 'rgba(10,10,12,0.5)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'inline-flex',
                  gap: 8,
                  alignItems: 'center',
                  backdropFilter: 'blur(6px)'
                }}
              >
                <img src={logoSrc} alt="app logo" width={18} height={18} />
                Tap anywhere to close
              </div>
            </Html>
          </Canvas>
        </div>
      )}
    </div>
  );
}
