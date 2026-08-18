'use client';

import { useRef, useMemo, useSyncExternalStore } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCw, TrendingUp } from 'lucide-react';

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

function CurveVisualization() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  // Calculate Traditional Decay Curve Points (Red)
  const traditionalPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 4 - 2; // -2 to 2 on X
      const progress = i / steps;
      // Exponential decay
      const r = Math.exp(-progress * 3.5) * 2 - 1; // 1 to -1 on Y
      points.push([t, r, 0]);
    }
    return points;
  }, []);

  // Calculate FSRS 3-Stage Reinforced Curve Points (Emerald)
  const fsrsPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const stages = [
      { startT: -2, endT: -0.7, decay: 2.2, startY: 1, endY: 0.1 },
      { startT: -0.7, endT: 0.6, decay: 1.4, startY: 1, endY: 0.4 },
      { startT: 0.6, endT: 2, decay: 0.7, startY: 1, endY: 0.75 },
    ];

    stages.forEach((stage, sIdx) => {
      const count = 20;
      for (let i = 0; i <= count; i++) {
        const p = i / count;
        const x = stage.startT + p * (stage.endT - stage.startT);
        const y = stage.startY - (stage.startY - stage.endY) * Math.pow(p, 0.8);
        const z = 0.3 * (sIdx + 1); // Depth layer
        points.push([x, y, z]);
      }
    });

    return points;
  }, []);

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* 3D Coordinate Grid Floor */}
      <gridHelper args={[5, 10, '#312E81', '#1E1B4B']} position={[0, -1, 0]} />

      {/* Traditional Curve (Red / Amber) */}
      <Line
        points={traditionalPoints}
        color="#EF4444"
        lineWidth={3}
        transparent
        opacity={0.85}
      />

      {/* FSRS Boosted Curve (Emerald) */}
      <Line
        points={fsrsPoints}
        color="#10B981"
        lineWidth={4}
        transparent
        opacity={0.95}
      />

      {/* Interval 1 Recall Boost Indicator */}
      <mesh position={[-0.7, 0.55, 0.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#38BDF8" />
      </mesh>

      {/* Interval 2 Recall Boost Indicator */}
      <mesh position={[0.6, 0.7, 0.6]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#10B981" />
      </mesh>

      {/* Interval 3 Recall Boost Indicator */}
      <mesh position={[2, 0.85, 0.9]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#6366F1" />
      </mesh>
    </group>
  );
}

export default function FSRS3DCurve() {
  const hasWebGL = useSyncExternalStore(subscribeNoop, checkWebGL, () => true);

  if (!hasWebGL) {
    return (
      <div className="card-obsidian p-6 text-center border-indigo-500/30">
        <div className="text-sm font-bold text-white mb-2">Biểu Đồ Đường Cong Quên FSRS</div>
        <p className="text-xs text-gray-400">
          FSRS nâng tỉ lệ duy trì trí nhớ R lên trên 90% sau mỗi chu kỳ ôn tập S1 → S2 → S3.
        </p>
      </div>
    );
  }

  return (
    <div className="card-obsidian border-white/10 overflow-hidden relative shadow-2xl bg-[#0F131C]">
      
      {/* 3D Canvas Top Bar */}
      <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-data">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white">3D Forgetting Curve Simulator</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Học vẹt (Quên 95%)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            FSRS Engine (Nhớ &gt;90%)
          </span>
        </div>
      </div>

      {/* 3D Interactive Canvas Area */}
      <div className="h-[280px] sm:h-[340px] w-full relative cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, 1.5, 4], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <CurveVisualization />
          <OrbitControls 
            enableZoom={false} 
            maxPolarAngle={Math.PI / 2 + 0.1} 
            minPolarAngle={Math.PI / 4}
            autoRotate={false}
          />
        </Canvas>

        {/* Drag Hint Overlay */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-mono-data text-gray-300 flex items-center gap-1.5 pointer-events-none">
          <RotateCw className="w-3 h-3 text-indigo-400" />
          <span>Kéo chuột để xoay 3D (360°)</span>
        </div>
      </div>

      {/* Formula Explanation Footer */}
      <div className="p-4 bg-[#0B0F17]/90 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-mono-data text-xs">
        <div>
          <span className="text-gray-400 block text-[10px] uppercase">1. Stability (Độ bền)</span>
          <span className="text-indigo-300 font-bold">S = Số ngày nhớ 90%</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase">2. Difficulty (Độ khó)</span>
          <span className="text-amber-300 font-bold">D = Điểm số 1-10</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase">3. Retrievability (Hồi tưởng)</span>
          <span className="text-emerald-300 font-bold">R(t) = (1 + factor · t/S)⁻ᶜ</span>
        </div>
      </div>

    </div>
  );
}
