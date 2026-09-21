import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function FloatingOrb({ position, color, size }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.001;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
          roughness={0.8}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const particlesRef = useRef();
  const count = 800;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const green = new THREE.Color('#10B981');
    const cyan = new THREE.Color('#06B6D4');
    const white = new THREE.Color('#94a3b8');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const c = [green, cyan, white][Math.floor(Math.random() * 3)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function Background3D() {
  return (
    <div className="three-bg">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.3} color="#10B981" />
        <pointLight position={[-10, -5, 5]} intensity={0.2} color="#06B6D4" />

        <ParticleField />
        <Stars radius={50} depth={50} count={1500} factor={2} saturation={0.2} fade speed={0.5} />

        <FloatingOrb position={[-4, 2, -3]} color="#10B981" size={0.8} />
        <FloatingOrb position={[3, -1, -5]} color="#06B6D4" size={0.6} />
        <FloatingOrb position={[5, 3, -4]} color="#8B5CF6" size={0.5} />
        <FloatingOrb position={[-3, -3, -6]} color="#10B981" size={0.4} />
      </Canvas>
    </div>
  );
}
