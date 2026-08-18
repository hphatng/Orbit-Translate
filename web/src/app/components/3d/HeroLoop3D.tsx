'use client';

import { useRef, useSyncExternalStore } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function checkWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

const subscribeNoop = () => () => {};

function OrbitTorus() {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= delta * 0.1;
      pointsRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <group scale={1.8}>
      {/* Subtle Glowing Torus Knot Wireframe */}
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.28, 64, 16]} />
        <meshBasicMaterial
          color="#6366F1"
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>

      {/* Secondary Cyan Accent Orbit Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.5, 0.015, 16, 48]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Floating Particle Cloud */}
      <points ref={pointsRef}>
        <sphereGeometry args={[2, 16, 16]} />
        <pointsMaterial
          size={0.03}
          color="#818CF8"
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export default function HeroLoop3D() {
  const hasWebGL = useSyncExternalStore(subscribeNoop, checkWebGL, () => true);

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-65 mix-blend-screen"
      style={{ height: '100%', width: '100%' }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
        className="pointer-events-none"
      >
        <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
          <OrbitTorus />
        </Float>
      </Canvas>
    </div>
  );
}
