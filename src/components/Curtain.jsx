import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function Curtain({ isPlaying, setCurtainFullyOpen }) {
  const { viewport } = useThree()
  
  // Stanje za animaciju zavjese
  const animationProgress = useRef(isPlaying ? 1 : 0) // 0 = zatvoreno, 1 = otvoreno
  const targetProgress = useRef(isPlaying ? 1 : 0)
  const lastReportedOpen = useRef(null)
  
  // Reference za zavjese
  const leftCurtain = useRef()
  const rightCurtain = useRef()
  
  // ŠIROKA zavjesa da pokrije pun ekran
  const curtainGeometry = new THREE.PlaneGeometry(35, 25)
  
  // Jednostavan materijal
  const curtainMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x8B0000, // Pozorišna crvena
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1.0
  })
  
  // Dodaj teksturu/pattern kao prava zavjesa
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  
  // Gradijent crvena pozadina za bogatiji izgled
  const gradient = ctx.createLinearGradient(0, 0, 512, 0)
  gradient.addColorStop(0, '#A0001A')
  gradient.addColorStop(0.5, '#8B0000')
  gradient.addColorStop(1, '#A0001A')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 512)
  
  // Temni nabori za dubinu
  ctx.strokeStyle = '#5D0000'
  ctx.lineWidth = 4
  for (let i = 0; i < 512; i += 25) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 512)
    ctx.stroke()
  }
  
  // Svetliji nabori za dimenziju
  ctx.strokeStyle = '#C41E3A'
  ctx.lineWidth = 2
  for (let i = 12; i < 512; i += 25) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 512)
    ctx.stroke()
  }
  
  // Zlatni akenti na naborima
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 1
  for (let i = 6; i < 512; i += 50) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 512)
    ctx.stroke()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 8)
  
  curtainMaterial.map = texture
  
  // Animacija zavjese
  useFrame((state, delta) => {
    // Ažuriraj target na osnovu isPlaying
    targetProgress.current = isPlaying ? 1 : 0
    
    // Smooth interpolacija ka target vrednosti
    const speed = 3.0
    animationProgress.current = THREE.MathUtils.lerp(
      animationProgress.current,
      targetProgress.current,
      delta * speed
    )
    
    // Obavesti parent SAMO na promenu stanja otvorenosti (spreči spam re-render)
    if (setCurtainFullyOpen) {
      const isFullyOpen = animationProgress.current >= 0.8
      if (lastReportedOpen.current !== isFullyOpen) {
        lastReportedOpen.current = isFullyOpen
        setCurtainFullyOpen(isFullyOpen)
      }
    }
    
    // ANIMACIJA - POVUĆI ZAVJESE SKROZ NA STRANE!
    if (leftCurtain.current && rightCurtain.current) {
      const openDistance = 25 // MNOGO VIŠE!
      
      // POVUĆI zavjese skroz na strane kad se otvara
      leftCurtain.current.position.x = -2 - (openDistance * animationProgress.current)
      rightCurtain.current.position.x = 2 + (openDistance * animationProgress.current)
      
    }
  })
  
  // Zlatni ukras materijal
  const goldMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xFFD700,
    metalness: 0.8,
    roughness: 0.2
  })
  
  // Drveni materijal za šipku
  const woodMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x8B4513, // Tamno braon drvo
    roughness: 0.8
  })

  return (
    <>
      {/* Leva zavjesa - ŠIRA za punu širinu ekrana */}
      <mesh
        ref={leftCurtain}
        position={[-2, 0, 1]}
        geometry={curtainGeometry}
        material={curtainMaterial}
      />
      
      {/* Desna zavjesa - ŠIRA za punu širinu ekrana */}
      <mesh
        ref={rightCurtain}
        position={[2, 0, 1]}
        geometry={curtainGeometry}
        material={curtainMaterial}
      />
    </>
  )
}

// Ne trebam više GLTF model - koristim custom geometriju

export default Curtain
