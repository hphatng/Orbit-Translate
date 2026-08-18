'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ShieldCheck, Cpu, RefreshCw } from 'lucide-react';

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

interface NodeInfo {
  id: string;
  label: string;
  type: 'request' | 'router' | 'key-active' | 'key-healthy' | 'key-cooldown';
  pos: [number, number, number];
  description: string;
  statusText: string;
}

const ROUTER_NODES: NodeInfo[] = [
  {
    id: 'req',
    label: 'User Request',
    type: 'request',
    pos: [-3.0, 0, 0],
    description: 'Yêu cầu tra từ ngữ cảnh hoặc quét tài liệu từ Chrome Extension.',
    statusText: 'Incoming (0.1s)',
  },
  {
    id: 'hub',
    label: 'Round-Robin Router',
    type: 'router',
    pos: [-0.8, 0, 0],
    description: 'Điều phối con trỏ xoay vòng (Round-Robin), kiểm tra sức khỏe và phân phối tải đều giữa các Key.',
    statusText: 'Active Dispatcher',
  },
  {
    id: 'key1',
    label: 'Gemini Key 1',
    type: 'key-active',
    pos: [1.8, 1.4, 0.4],
    description: 'Đang xử lý luồng dịch hiện tại với độ trễ thấp, kết nối trực tiếp Google AI.',
    statusText: 'Active Serving (98ms)',
  },
  {
    id: 'key2',
    label: 'Gemini Key 2',
    type: 'key-healthy',
    pos: [2.2, 0.2, -0.4],
    description: 'Key dự phòng sẵn sàng trong Pool, tự động tiếp quản khi con trỏ chuyển lượt.',
    statusText: 'Standby / Healthy',
  },
  {
    id: 'key3',
    label: 'Gemini Key 3 (BYOK)',
    type: 'key-healthy',
    pos: [1.8, -1.3, 0.3],
    description: 'Key cá nhân của người dùng được mã hóa an toàn trên máy (AES-GCM).',
    statusText: 'BYOK Ready',
  },
  {
    id: 'key4',
    label: 'Key 4 (429 Cooldown)',
    type: 'key-cooldown',
    pos: [0.5, -2.0, -0.6],
    description: 'Tự động kích hoạt Cooldown 30s-60s khi Google báo chạm quota, không làm gián đoạn việc đọc của user.',
    statusText: 'Auto-Cooldown (30s)',
  },
];

function NetworkNode({ 
  node, 
  activeNode, 
  setActiveNode 
}: { 
  node: NodeInfo; 
  activeNode: string | null; 
  setActiveNode: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isHovered = activeNode === node.id;

  const colorMap = {
    request: '#38BDF8',
    router: '#818CF8',
    'key-active': '#34D399',
    'key-healthy': '#6366F1',
    'key-cooldown': '#F59E0B',
  };

  const nodeColor = colorMap[node.type];

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      if (node.type === 'key-active') {
        meshRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.08);
      } else if (isHovered) {
        meshRef.current.scale.setScalar(1.2);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group position={node.pos}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setActiveNode(node.id)}
        onPointerOut={() => setActiveNode(null)}
      >
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isHovered ? 0.9 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Pulse ring for active nodes */}
      {(node.type === 'key-active' || node.type === 'router') && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.34, 0.38, 24]} />
          <meshBasicMaterial color={nodeColor} transparent opacity={0.4} />
        </mesh>
      )}

      {/* Node Label Tooltip HTML */}
      <Html distanceFactor={8} position={[0, 0.45, 0]} center>
        <div 
          onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-mono-data whitespace-nowrap transition-all duration-200 cursor-pointer select-none border backdrop-blur-md ${
            isHovered 
              ? 'bg-[#151926] text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110 z-20' 
              : 'bg-[#0B0F17]/80 text-gray-300 border-white/10 hover:border-white/30'
          }`}
        >
          <div className="font-bold flex items-center gap-1.5">
            <span 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: nodeColor }} 
            />
            <span>{node.label}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

function CircuitLines() {
  const linePoints = [
    // Req -> Hub
    [[-3.0, 0, 0], [-0.8, 0, 0]],
    // Hub -> Key 1
    [[-0.8, 0, 0], [1.8, 1.4, 0.4]],
    // Hub -> Key 2
    [[-0.8, 0, 0], [2.2, 0.2, -0.4]],
    // Hub -> Key 3
    [[-0.8, 0, 0], [1.8, -1.3, 0.3]],
    // Hub -> Key 4 (Failover branch)
    [[-0.8, 0, 0], [0.5, -2.0, -0.6]],
  ];

  return (
    <group>
      {linePoints.map((pts, i) => (
        <Line
          key={i}
          points={pts as [number, number, number][]}
          color={i === 1 ? '#34D399' : i === 4 ? '#F59E0B' : '#6366F1'}
          lineWidth={i === 1 ? 2.5 : 1.5}
          transparent
          opacity={i === 1 ? 0.85 : 0.45}
        />
      ))}
    </group>
  );
}

function Scene({ 
  activeNode, 
  setActiveNode 
}: { 
  activeNode: string | null; 
  setActiveNode: (id: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && !activeNode) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <CircuitLines />
      {ROUTER_NODES.map((node) => (
        <NetworkNode
          key={node.id}
          node={node}
          activeNode={activeNode}
          setActiveNode={setActiveNode}
        />
      ))}
    </group>
  );
}

export default function KeyRouter3D() {
  const [activeNode, setActiveNode] = useState<string | null>('key1');
  const hasWebGL = useSyncExternalStore(subscribeNoop, checkWebGL, () => true);

  const selectedNodeInfo = ROUTER_NODES.find((n) => n.id === activeNode) || ROUTER_NODES[2];

  if (!hasWebGL) {
    return (
      <div className="card-obsidian p-6 text-center border-indigo-500/30">
        <div className="text-sm font-bold text-white mb-2">Sơ Đồ Phân Phối Key AI Thông Minh</div>
        <p className="text-xs text-gray-400">
          Hệ thống tự động xoay vòng Round-Robin và tự kích hoạt Cooldown khi chạm giới hạn 429.
        </p>
      </div>
    );
  }

  return (
    <div className="card-obsidian border-white/10 overflow-hidden relative shadow-2xl bg-[#0C101A]">
      
      {/* 3D Header Controls */}
      <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-data bg-[#0F131C]">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            Smart Key Pool Router &amp; Multi-Key Circuit 3D
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
          <span>Round-Robin Active</span>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="h-[340px] sm:h-[380px] w-full relative">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#818CF8" />
          <Scene activeNode={activeNode} setActiveNode={setActiveNode} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 2.5}
          />
        </Canvas>

        {/* Floating Hint */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/5 text-[10px] font-mono-data text-gray-400 pointer-events-none">
          💡 Rê chuột vào từng node hoặc kéo để xoay góc nhìn 3D
        </div>
      </div>

      {/* Active Node Detail Footer */}
      <div className="p-4 sm:p-5 bg-[#090C14] border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white font-heading">
              {selectedNodeInfo.label}
            </span>
            <span className="text-[10px] font-mono-data font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {selectedNodeInfo.statusText}
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
            {selectedNodeInfo.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-mono-data text-gray-500 uppercase">Cơ chế bảo vệ</div>
            <div className="text-xs font-mono-data text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Interruption</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
