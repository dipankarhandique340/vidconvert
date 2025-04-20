"use client"

import { Suspense, useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, PerspectiveCamera, Text, Center } from "@react-three/drei"
import { motion } from "framer-motion-3d"
import { MotionConfig } from "framer-motion"
import * as THREE from "three"

export function ConversionScene({ progress = 0 }) {
  return (
    <div className="h-[350px] w-full overflow-hidden rounded-lg">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <ProgressScene progress={progress} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  )
}

function ProgressScene({ progress }) {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 500

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.1
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        const x = positions[i3]
        const y = positions[i3 + 1]
        const z = positions[i3 + 2]

        // Animate particles in a wave pattern
        positions[i3 + 1] = y + Math.sin(clock.getElapsedTime() * 2 + x) * 0.01
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  // Generate random particles around a sphere
  const generateParticles = () => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const radius = 3

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      // Position particles in a sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)
      const r = radius * (0.8 + Math.random() * 0.2)

      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)

      // Random colors with bias toward blue/purple
      colors[i3] = 0.5 + Math.random() * 0.5 // R
      colors[i3 + 1] = 0.2 + Math.random() * 0.4 // G
      colors[i3 + 2] = 0.8 + Math.random() * 0.2 // B
    }

    return { positions, colors }
  }

  const { positions, colors } = generateParticles()

  return (
    <motion.group ref={groupRef}>
      <Float speed={3} rotationIntensity={0.3} floatIntensity={0.3}>
        <Center>
          <motion.mesh
            animate={{
              rotateY: Math.PI * 2,
              scale: [1, 1.05, 1],
              transition: { duration: 10, repeat: Infinity, ease: "linear" }
            }}
          >
            <torusGeometry args={[2, 0.5, 16, 100]} />
            <meshStandardMaterial
              color="#4c1d95"
              roughness={0.1}
              metalness={0.8}
              emissive="#5b21b6"
              emissiveIntensity={0.2}
            />
          </motion.mesh>

          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.4, 32, 32]} />
            <meshStandardMaterial
              color="#8b5cf6"
              roughness={0.1}
              metalness={0.8}
              emissive="#a78bfa"
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Progress indicator */}
          <motion.mesh
            position={[0, 0, 0]}
            animate={{
              scale: [1, 1.1, 1],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <ringGeometry args={[1.45, 1.5, 32]} />
            <meshBasicMaterial
              color="#f472b6"
              transparent
              opacity={0.8}
            />
          </motion.mesh>

          {/* Progress text */}
          <mesh position={[0, 0, 1.6]}>
            <Text
              fontSize={0.5}
              color="#ffffff"
              font="/fonts/inter.woff"
              anchorX="center"
              anchorY="middle"
            >
              {`${Math.round(progress)}%`}
            </Text>
          </mesh>
        </Center>
      </Float>

      {/* Particle system */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </motion.group>
  )
}
