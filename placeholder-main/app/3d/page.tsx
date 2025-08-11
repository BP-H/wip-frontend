'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function ThreePortal() {
  return (
    <main style={{ height: '100vh', background: '#06070c' }}>
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <mesh rotation={[0.4, 0.6, 0]}>
          <torusKnotGeometry args={[1, 0.3, 256, 32]} />
          <meshStandardMaterial metalness={0.6} roughness={0.25} />
        </mesh>
        <OrbitControls />
      </Canvas>
    </main>
  );
}
