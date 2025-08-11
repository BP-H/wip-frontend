'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

type ShapeKind = 'rock' | 'cube' | 'torus';

function Rock({ seed = 0 }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.2 + ((seed % 100) / 150), [seed]);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime * speed + seed;
    ref.current.rotation.x += 0.3 * dt;
    ref.current.rotation.y += 0.2 * dt;
    ref.current.position.y = Math.sin(t) * 0.6;
    ref.current.position.x = Math.cos(t * 0.7) * 0.4;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial metalness={0.3} roughness={0.35} />
    </mesh>
  );
}

function Cube({ seed = 0 }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.1 + ((seed % 50) / 200), [seed]);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + seed;
    ref.current.rotation.x = Math.sin(t * 1.2) * 0.8;
    ref.current.rotation.z = Math.cos(t) * 0.6;
    ref.current.position.z = Math.sin(t * 0.9) * 0.8;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial wireframe />
    </mesh>
  );
}

function Torus({ seed = 0 }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.25 + ((seed % 80) / 160), [seed]);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + seed;
    ref.current.rotation.y += 0.01 + Math.sin(t) * 0.01;
    ref.current.position.x = Math.sin(t * 0.6) * 0.7;
    ref.current.position.y = Math.cos(t * 0.6) * 0.5;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.5, 0.18, 100, 16]} />
      <meshPhysicalMaterial transmission={0.5} thickness={2} roughness={0.15} />
    </mesh>
  );
}

function Trio() {
  return (
    <>
      <Float speed={1} rotationIntensity={0.6} floatIntensity={1.2}>
        <group position={[-1.2, 0.2, 0]}>
          <Rock seed={11} />
        </group>
      </Float>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={1}>
        <group position={[0.8, -0.2, 0.2]}>
          <Cube seed={29} />
        </group>
      </Float>
      <Float speed={0.9} rotationIntensity={0.7} floatIntensity={1.4}>
        <group position={[0.2, 0.4, -0.3]}>
          <Torus seed={47} />
        </group>
      </Float>
    </>
  );
}

export default function PortalHero({
  title = 'Enter universe — tap to interact',
  logoSrc = '/icon.png',
}: {
  title?: string;
  logoSrc?: string;
}) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);

  // Compress the hero as you scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const s = Math.max(0.7, 1 - y / 900); // 1 → 0.7 over ~900px
      setScale(s);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform .15s linear',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          background:
            'radial-gradient(100% 120% at 0% 0%, rgba(155,140,255,.08), transparent 60%), linear-gradient(180deg, #0d0f16, #0b0d13)',
        }}
      >
        <div
          style={{
            height: 280,
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }} dpr={[1, 2]}>
            <color attach="background" args={['#0b0d13']} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[2, 2, 2]} intensity={1.1} />
            <Environment preset="city" />
            <Trio />
            {/* Accessible hint overlay */}
            <Html center>
              <button
                onClick={() => setOpen(true)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,.12)',
                  background: 'rgba(17,19,29,.6)',
                  backdropFilter: 'blur(6px)',
                  color: '#fff',
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

      {/* Fullscreen portal when opened */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background:
              'radial-gradient(120% 120% at 50% 0%, rgba(155,140,255,.15), transparent 60%), #080a10',
          }}
          onClick={() => setOpen(false)}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
            <color attach="background" args={['#080a10']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 2, 2]} intensity={1.2} />
            <Environment preset="city" />
            {/* More elements for the portal */}
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
            <Html center>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,.12)',
                  background: 'rgba(15,17,26,.6)',
                  color: '#fff',
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
    </>
  );
}
