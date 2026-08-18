'use client';

import { useRef, useSyncExternalStore } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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

// Optimized boundary dimensions for rich on-screen presence and smooth edge fade
const BOUND_X = 10.5;
const BOUND_Y = 5.8;
const BOUND_Z_MIN = -5.5;
const BOUND_Z_MAX = 0.8;

interface CosmicParticleData {
  text: string;
  isIPA: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rot: number;
  rotSpeed: number;
  baseOpacity: number;
  baseSize: number; // Font size in px
}

// 140 Individual linguistic particles (Comprehensive Letter & IPA Galaxy)
const RAW_SYMBOLS: { text: string; isIPA: boolean }[] = [
  // Latin Letters Set 1 (A-Z)
  { text: 'A', isIPA: false }, { text: 'B', isIPA: false }, { text: 'C', isIPA: false },
  { text: 'D', isIPA: false }, { text: 'E', isIPA: false }, { text: 'F', isIPA: false },
  { text: 'G', isIPA: false }, { text: 'H', isIPA: false }, { text: 'I', isIPA: false },
  { text: 'J', isIPA: false }, { text: 'K', isIPA: false }, { text: 'L', isIPA: false },
  { text: 'M', isIPA: false }, { text: 'N', isIPA: false }, { text: 'O', isIPA: false },
  { text: 'P', isIPA: false }, { text: 'Q', isIPA: false }, { text: 'R', isIPA: false },
  { text: 'S', isIPA: false }, { text: 'T', isIPA: false }, { text: 'U', isIPA: false },
  { text: 'V', isIPA: false }, { text: 'W', isIPA: false }, { text: 'X', isIPA: false },
  { text: 'Y', isIPA: false }, { text: 'Z', isIPA: false },

  // Latin Letters Set 2 (a-z)
  { text: 'a', isIPA: false }, { text: 'b', isIPA: false }, { text: 'c', isIPA: false },
  { text: 'd', isIPA: false }, { text: 'e', isIPA: false }, { text: 'f', isIPA: false },
  { text: 'g', isIPA: false }, { text: 'h', isIPA: false }, { text: 'i', isIPA: false },
  { text: 'j', isIPA: false }, { text: 'k', isIPA: false }, { text: 'l', isIPA: false },
  { text: 'm', isIPA: false }, { text: 'n', isIPA: false }, { text: 'o', isIPA: false },
  { text: 'p', isIPA: false }, { text: 'q', isIPA: false }, { text: 'r', isIPA: false },
  { text: 's', isIPA: false }, { text: 't', isIPA: false }, { text: 'u', isIPA: false },
  { text: 'v', isIPA: false }, { text: 'w', isIPA: false }, { text: 'x', isIPA: false },
  { text: 'y', isIPA: false }, { text: 'z', isIPA: false },

  // IPA Phonetic Symbols Set 1
  { text: '/æ/', isIPA: true }, { text: '/ʃ/', isIPA: true }, { text: '/θ/', isIPA: true },
  { text: '/ð/', isIPA: true }, { text: '/ŋ/', isIPA: true }, { text: '/tʃ/', isIPA: true },
  { text: '/dʒ/', isIPA: true }, { text: '/ə/', isIPA: true }, { text: '/eɪ/', isIPA: true },
  { text: '/aɪ/', isIPA: true }, { text: '/ʊ/', isIPA: true }, { text: '/ɔɪ/', isIPA: true },
  { text: '/ʌ/', isIPA: true }, { text: '/iː/', isIPA: true }, { text: '/ɜː/', isIPA: true },
  { text: '/ɑː/', isIPA: true }, { text: '/ɔː/', isIPA: true }, { text: '/uː/', isIPA: true },
  { text: '/aʊ/', isIPA: true }, { text: '/oʊ/', isIPA: true }, { text: '/ɪ/', isIPA: true },
  { text: '/ʒ/', isIPA: true }, { text: '/eə/', isIPA: true }, { text: '/ɪə/', isIPA: true },
  { text: '/ʊə/', isIPA: true }, { text: '/juː/', isIPA: true }, { text: '/ts/', isIPA: true },
  { text: '/dz/', isIPA: true }, { text: '/ɒ/', isIPA: true }, { text: '/e/', isIPA: true },
  { text: '/i/', isIPA: true }, { text: '/u/', isIPA: true }, { text: '/ænd/', isIPA: true },
  { text: '/aɪl/', isIPA: true }, { text: '/ər/', isIPA: true }, { text: '/ɔːr/', isIPA: true },
  { text: '/ɜːr/', isIPA: true }, { text: '/st/', isIPA: true }, { text: '/nd/', isIPA: true },
  { text: '/pl/', isIPA: true }, { text: '/br/', isIPA: true }, { text: '/tr/', isIPA: true },

  // Extra High-Frequency Linguistic Particles Set 2 (Density Enrichment)
  { text: 'A', isIPA: false }, { text: 'k', isIPA: false }, { text: 'R', isIPA: false },
  { text: 'Z', isIPA: false }, { text: 'e', isIPA: false }, { text: 'm', isIPA: false },
  { text: 'S', isIPA: false }, { text: 'v', isIPA: false }, { text: 'Q', isIPA: false },
  { text: 'T', isIPA: false }, { text: 'B', isIPA: false }, { text: 'x', isIPA: false },
  { text: 'n', isIPA: false }, { text: 'p', isIPA: false }, { text: 'd', isIPA: false },
  { text: 'h', isIPA: false }, { text: 'g', isIPA: false }, { text: 'L', isIPA: false },
  { text: '/æ/', isIPA: true }, { text: '/ʃ/', isIPA: true }, { text: '/θ/', isIPA: true },
  { text: '/ð/', isIPA: true }, { text: '/ŋ/', isIPA: true }, { text: '/tʃ/', isIPA: true },
  { text: '/dʒ/', isIPA: true }, { text: '/ə/', isIPA: true }, { text: '/eɪ/', isIPA: true },
  { text: '/aɪ/', isIPA: true }, { text: '/ʊ/', isIPA: true }, { text: '/ɔɪ/', isIPA: true },
  { text: '/ʌ/', isIPA: true }, { text: '/iː/', isIPA: true }, { text: '/ɜː/', isIPA: true },
  { text: '/ɑː/', isIPA: true }, { text: '/ɔː/', isIPA: true }, { text: '/uː/', isIPA: true },
  { text: '/aʊ/', isIPA: true }, { text: '/oʊ/', isIPA: true }, { text: '/ɪ/', isIPA: true },
  { text: '/ʒ/', isIPA: true }, { text: '/juː/', isIPA: true }, { text: '/ər/', isIPA: true },
  { text: '/str/', isIPA: true }, { text: '/spl/', isIPA: true }, { text: '/nt/', isIPA: true },
  { text: '/kt/', isIPA: true },
];

// Initialize deterministic particle distribution in 3D deep space
const COSMIC_PARTICLES: CosmicParticleData[] = RAW_SYMBOLS.map((item, i) => {
  const seed1 = Math.sin(i * 1.618 + 0.7);
  const seed2 = Math.cos(i * 1.414 + 1.4);
  const seed3 = Math.sin(i * 2.718 + 2.3);
  const seed4 = Math.cos(i * 3.141 + 0.9);

  // Depth z distributed across -5.2 to 0.6
  const z = seed3 * 2.7 - 2.3;

  // Parallax: deeper particles move slightly slower, closer particles move faster
  const depthFactor = THREE.MathUtils.mapLinear(z, BOUND_Z_MIN, BOUND_Z_MAX, 0.65, 1.25);

  return {
    text: item.text,
    isIPA: item.isIPA,
    x: seed1 * (BOUND_X - 0.5),
    y: seed2 * (BOUND_Y - 0.5),
    z,
    vx: (seed4 * 0.18 + (i % 2 === 0 ? 0.09 : -0.09)) * depthFactor,
    vy: (seed1 * 0.14 + (i % 3 === 0 ? 0.07 : -0.07)) * depthFactor,
    vz: seed2 * 0.045,
    rot: seed3 * Math.PI,
    rotSpeed: (seed4 * 0.28 + 0.08) * (i % 2 === 0 ? 1 : -1),
    baseOpacity: item.isIPA ? 0.44 : 0.36,
    baseSize: item.isIPA ? 13 : 15,
  };
});

function CosmicParticleNode({ data }: { data: CosmicParticleData }) {
  const nodeRef = useRef<THREE.Group>(null);
  const domRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({
    x: data.x,
    y: data.y,
    z: data.z,
    rot: data.rot,
  });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const p = posRef.current;

    p.x += data.vx * dt;
    p.y += data.vy * dt;
    p.z += data.vz * dt;
    p.rot += data.rotSpeed * dt * 0.35;

    // Smooth border wrap-around
    if (p.x > BOUND_X) p.x = -BOUND_X;
    if (p.x < -BOUND_X) p.x = BOUND_X;
    if (p.y > BOUND_Y) p.y = -BOUND_Y;
    if (p.y < -BOUND_Y) p.y = BOUND_Y;
    if (p.z > BOUND_Z_MAX) p.z = BOUND_Z_MIN;
    if (p.z < BOUND_Z_MIN) p.z = BOUND_Z_MAX;

    // Calculate edge fade factor (smooth fade-in when entering border, fade-out when reaching border)
    const edgeDistX = Math.max(0, 1 - Math.abs(p.x) / BOUND_X);
    const edgeDistY = Math.max(0, 1 - Math.abs(p.y) / BOUND_Y);
    const edgeDistZ = Math.max(0, Math.min(1 - (p.z - BOUND_Z_MIN) / (BOUND_Z_MAX - BOUND_Z_MIN), (p.z - BOUND_Z_MIN) / (BOUND_Z_MAX - BOUND_Z_MIN)));
    
    // Smooth transition curve across X, Y, and Z
    const edgeFade = Math.min(1, Math.min(edgeDistX * 4.5, edgeDistY * 4.5, edgeDistZ * 4.5));
    
    // Depth-based scale & opacity modifier (near = larger & brighter, far = smaller & dimmer)
    const depthScale = THREE.MathUtils.mapLinear(p.z, BOUND_Z_MIN, BOUND_Z_MAX, 0.55, 1.4);
    const depthOpacityFactor = THREE.MathUtils.mapLinear(p.z, BOUND_Z_MIN, BOUND_Z_MAX, 0.6, 1.2);

    if (nodeRef.current) {
      nodeRef.current.position.set(p.x, p.y, p.z);
      nodeRef.current.rotation.z = p.rot;
      nodeRef.current.scale.setScalar(depthScale);
    }

    if (domRef.current) {
      const finalOpacity = Math.max(0, data.baseOpacity * depthOpacityFactor * edgeFade);
      domRef.current.style.opacity = finalOpacity.toFixed(3);
    }
  });

  return (
    <group ref={nodeRef} position={[data.x, data.y, data.z]}>
      <Html
        transform
        center
        distanceFactor={10}
        className="pointer-events-none select-none"
      >
        <div
          ref={domRef}
          className={`whitespace-nowrap select-none font-medium text-slate-300 drop-shadow-sm ${
            data.isIPA ? 'font-mono tracking-wider' : 'font-sans font-semibold'
          }`}
          style={{
            fontSize: `${data.baseSize}px`,
            opacity: 0,
            transition: 'opacity 0.15s ease-out',
          }}
        >
          {data.text}
        </div>
      </Html>
    </group>
  );
}

function CosmicTypographyField() {
  return (
    <group>
      {COSMIC_PARTICLES.map((p, idx) => (
        <CosmicParticleNode key={`cosmic-${idx}`} data={p} />
      ))}
    </group>
  );
}

// Background subtle cosmic starfield particles (Expanded to 120 points)
const STAR_COUNT = 120;
const STATIC_STAR_POSITIONS = new Float32Array(STAR_COUNT * 3);
for (let i = 0; i < STAR_COUNT; i++) {
  const seed1 = Math.sin(i * 1.84 + 0.5);
  const seed2 = Math.cos(i * 2.37 + 1.2);
  const seed3 = Math.sin(i * 3.14 + 2.1);
  STATIC_STAR_POSITIONS[i * 3] = seed1 * 10.5;
  STATIC_STAR_POSITIONS[i * 3 + 1] = seed2 * 5.8;
  STATIC_STAR_POSITIONS[i * 3 + 2] = seed3 * 2.8 - 2.0;
}

function CosmicStarDust() {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.006;
      pointsRef.current.rotation.x += delta * 0.003;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[STATIC_STAR_POSITIONS, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#94A3B8"
        transparent
        opacity={0.22}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroFloatingWords3D() {
  const hasWebGL = useSyncExternalStore(subscribeNoop, checkWebGL, () => true);

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[500px] h-[500px] rounded-full bg-slate-800/20 blur-[120px]" />
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden select-none"
      style={{ height: '100%', width: '100%' }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
        className="pointer-events-none"
      >
        {/* Dynamic Continuous Cosmic Dust Field of Letters & IPA Symbols */}
        <CosmicTypographyField />

        {/* Ambient Subtle Star Dust */}
        <CosmicStarDust />
      </Canvas>
    </div>
  );
}
