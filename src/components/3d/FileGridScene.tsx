"use client"

import { Suspense, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, PerspectiveCamera, Text, useGLTF } from "@react-three/drei"
import { motion } from "framer-motion-3d"
import { MotionConfig } from "framer-motion"
import { Variants } from "framer-motion"

function Scene() {
  const group = useRef<THREE.Group>(null)
  const floatRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.1
    }
  })

  return (
    <group ref={group}>
      <Float
        ref={floatRef}
        speed={2}
        rotationIntensity={0.2}
        floatIntensity={0.5}
      >
        <Model position={[0, -1, 0]} scale={1.5} />
      </Float>
    </group>
  )
}

function Model({ ...props }) {
  // Use a simple cube as fallback if model loading fails
  return (
    <mesh {...props}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#5D87FF" />
    </mesh>
  )
}

export function FileGridScene() {
  return (
    <div className="h-[300px] w-full overflow-hidden rounded-lg">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Suspense fallback={null}>
          <Scene />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}

export function FloatingFolder({ selected = false, onClick, ...props }) {
  const [hover, setHover] = useState(false)

  const variants: Variants = {
    hover: { scale: 1.1, rotateZ: 5 },
    pressed: { scale: 0.95, rotateZ: -5 },
    idle: { scale: 1, rotateZ: 0 }
  }

  return (
    <MotionConfig transition={{ type: "spring", bounce: 0.4 }}>
      <Canvas className="h-24 w-24 cursor-pointer" {...props}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <Suspense fallback={null}>
          <motion.group
            initial="idle"
            animate={selected ? "hover" : hover ? "hover" : "idle"}
            whileTap="pressed"
            variants={variants}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            onClick={onClick}
          >
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.4, 1, 0.2]} />
              <meshStandardMaterial
                color={selected ? "#4F46E5" : hover ? "#818CF8" : "#6366F1"}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[0, 0.1, 0.15]} castShadow>
              <Text
                fontSize={0.2}
                color="#FFFFFF"
                anchorX="center"
                anchorY="middle"
              >
                Folder
              </Text>
            </mesh>
          </motion.group>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </MotionConfig>
  )
}

export function FloatingFile({ fileType = "mp4", selected = false, onClick, ...props }) {
  const [hover, setHover] = useState(false)

  const variants: Variants = {
    hover: { scale: 1.1, rotateZ: 5 },
    pressed: { scale: 0.95, rotateZ: -5 },
    idle: { scale: 1, rotateZ: 0 }
  }

  // Different colors for different file types
  const getColor = () => {
    if (fileType === "mp4") return "#F97316"
    if (fileType === "mkv") return "#EC4899"
    return "#8B5CF6"
  }

  return (
    <MotionConfig transition={{ type: "spring", bounce: 0.4 }}>
      <Canvas className="h-24 w-24 cursor-pointer" {...props}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <Suspense fallback={null}>
          <motion.group
            initial="idle"
            animate={selected ? "hover" : hover ? "hover" : "idle"}
            whileTap="pressed"
            variants={variants}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            onClick={onClick}
          >
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1, 1.3, 0.05]} />
              <meshStandardMaterial
                color={selected ? "#FB7185" : hover ? getColor() : "#FAFAFA"}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0, 0.05]} castShadow>
              <Text
                fontSize={0.2}
                color="#000000"
                anchorX="center"
                anchorY="middle"
              >
                {fileType.toUpperCase()}
              </Text>
            </mesh>
          </motion.group>
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </MotionConfig>
  )
}
