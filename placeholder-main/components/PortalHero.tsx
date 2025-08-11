// components/PortalHero.tsx (updated for Whiplash aesthetic)
'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Html, ContactShadows, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// ... (import shapes Rock, Cube, Torus similar to current, possibly with tweaked materials)

export default function PortalHero({ logoSrc = '/icon.png' }) {
  const headerRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(64);
  const [scale, setScale] = useState(1);
  const [open, setOpen] = useState(false);
  const [disableFX, setDisableFX] = useState(false);
  const [noGlass, setNoGlass] = useState(false);
  const [kick, setKick] = useState(0);

  // Measure header height for sticky offset
  useEffect(() => {
    headerRef.current = document.querySelector('[data-app-header]');
    const updateHeaderHeight = () => {
      if (!headerRef.current) return;
      setHeaderH(headerRef.current.getBoundingClientRect().height || 64);
    };
    updateHeaderHeight();
    const ro = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  // Scroll effect: shrink portal and add energy kick on fast scroll
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = Math.abs(y - lastY);
      lastY = y;
      // Smoothly interpolate scale between 1 and 0.85 based on scroll position
      const targetScale = 1 - Math.min(y / 900, 0.15);
      setScale(prev => prev + (targetScale - prev) * 0.1); // interpolate for smoothness
      // Energy kick on rapid scroll
      setKick(k => Math.min(1, k + delta / 800));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Decay the kick energy over time
    const decayInterval = setInterval(() => setKick(k => k * 0.9), 100);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearInterval(decayInterval);
    };
  }, []);

  // Lock body scroll when portal modal is open, and close on ESC
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Sticky portal container styles – using CSS variables for theming
  const portalStyle: React.CSSProperties = {
    position: 'sticky',
    top: `calc(${headerH}px + env(safe-area-inset-top, 0px))`,
    zIndex: 100, // ensure below header (zIndex 1000) but above feed
    isolation: 'isolate',
    background: 'var(--panel, #fff)',      // dark panel if available, else white
    borderBottom: '1px solid var(--stroke, #e5e7eb)',
  };
  const innerStyle: React.CSSProperties = {
    transform: `scale(${scale}) translateZ(0)`,
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease',
    willChange: 'transform',
  };
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    height: 220,
    borderRadius: 12,              // slightly less rounded for a sharper look
    overflow: 'hidden',
    border: '1px solid var(--stroke, #e5e7eb)',
    background: '#0f0f12',         // fallback dark background for contrast
    boxShadow: `0 0 20px rgba(155,140,255,0.15)`,  // neon glow shadow
    touchAction: 'manipulation',
  };
  // Dynamic glow layers using kick intensity
  const glowPink: React.CSSProperties = {
    position: 'absolute', inset: -20, pointerEvents: 'none',
    background: 'radial-gradient(60% 50% at 50% 35%, rgba(255,45,184,0.25) 0%, transparent 70%)',
    opacity: 0.5 + kick * 0.4,
    filter: `blur(${6 + 12 * kick}px)`,
    mixBlendMode: 'screen'
  };
  const glowPurple: React.CSSProperties = {
    position: 'absolute', inset: -20, pointerEvents: 'none',
    background: 'radial-gradient(55% 45% at 50% 30%, rgba(155,140,255,0.20) 0%, transparent 70%)',
    opacity: 0.4 + kick * 0.3,
    filter: `blur(${8 + 10 * kick}px)`,
    mixBlendMode: 'screen'
  };
  const glossAngle: React.CSSProperties = {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'linear-gradient(130deg, rgba(155,140,255,0.12) 10%, rgba(255,255,255,0) 40%, rgba(255,45,184,0.15) 90%)',
    mixBlendMode: 'screen'
  };

  return (
    <div ref={shellRef} style={portalStyle}>
      {/* Scalable inner wrapper to preserve sticky */}
      <div style={innerStyle}>
        {/* Portal card container with neon gradients */}
        <div style={cardStyle}>
          <div aria-hidden style={glowPink} />
          <div aria-hidden style={glowPurple} />
          <div aria-hidden style={glossAngle} />
          <Canvas 
            camera={{ position: [0, 0, 3.2], fov: 50 }} 
            dpr={[1, 1.5]} 
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            onCreated={(state) => {
              const webgl2 = !!state.gl.capabilities?.isWebGL2;
              const isHiDPI = window.devicePixelRatio > 2;
              setDisableFX(!webgl2);
              setNoGlass(!webgl2 || isHiDPI);
            }}>
            <color attach="background" args={['#0a0b10']} /> {/* dark bg to enhance neon */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 3, 2]} intensity={0.8} />
            {/* Floating shapes (possibly with emissive or brand color accents) */}
            <Float speed={1} rotationIntensity={0.3} floatIntensity={0.8}>
              <group position={[-1.2, 0.2, 0]}><Rock paused={!open} /></group>
            </Float>
            <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.7}>
              <group position={[0.8, -0.2, 0.2]}><Cube paused={!open} /></group>
            </Float>
            <Float speed={0.9} rotationIntensity={0.4} floatIntensity={0.9}>
              <group position={[0.2, 0.35, -0.3]}>
                <Torus paused={!open} glass={!noGlass} /> 
              </group>
            </Float>
            <ContactShadows position={[0, -0.85, 0]} opacity={0.25} scale={10} blur={1.6} far={2} />
            {/* Bloom effect for glow */}
            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.6} luminanceThreshold={0.75} luminanceSmoothing={0.2} />
              </EffectComposer>
            )}
            {/* Centered interactive button */}
            <Html center>
              <button onClick={() => setOpen(true)} className="enterPortalBtn" 
                      aria-label="Open 3D portal">
                Enter Universe – Tap to Explore
              </button>
            </Html>
          </Canvas>
        </div>
      </div>

      {/* Fullscreen portal modal (opens on click) */}
      {open && (
        <div role="dialog" aria-modal="true" onClick={() => setOpen(false)}
             style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(10,11,16,0.9)' }}>
          <Canvas camera={{ position: [0, 0, 5], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
            <color attach="background" args={['#0a0b10']} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[3, 2, 2]} intensity={0.9} />
            {/* Multiple floating shapes in modal for a full experience */}
            {Array.from({ length: 18 }).map((_, i) => {
              const kind = (['rock','cube','torus'] as const)[i % 3];
              const pos = new THREE.Vector3((Math.random()-0.5)*6, (Math.random()-0.5)*4, (Math.random()-0.5)*5);
              return <group key={i} position={pos}>
                {kind === 'rock' && <Rock seed={i} />}
                {kind === 'cube' && <Cube seed={i} />}
                {kind === 'torus' && <Torus seed={i} glass={!noGlass} />}
              </group>;
            })}
            <OrbitControls enablePan={false} />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.2} scale={15} blur={2.2} far={3} />
            {!disableFX && (
              <EffectComposer>
                <Bloom intensity={0.7} luminanceThreshold={0.8} luminanceSmoothing={0.25} />
              </EffectComposer>
            )}
            {/* Modal close hint UI */}
            <Html center>
              <div className="portalCloseHint">
                <img src={logoSrc} alt="app logo" width={20} height={20} />
                Tap anywhere to close
              </div>
            </Html>
          </Canvas>
        </div>
      )}
    </div>
  );
}
