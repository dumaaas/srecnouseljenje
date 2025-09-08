import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import Curtain from './Curtain'

// Vite/Vercel asset URLs
const GUITAR_GLTF_URL = new URL('../models/Guitar.glb', import.meta.url).href
const SANDALS_GLTF_URL = new URL('../models/Sandals.glb', import.meta.url).href

function GuitarModel({ isPlaying }) {
  const group = useRef()
  const { scene } = useGLTF(GUITAR_GLTF_URL)
  
  // Clone the scene to avoid conflicts
  const clonedScene = scene.clone()
  
  useFrame((state) => {
    if (group.current && isPlaying) {
      // SAMO blaga animacija gitare - NIŠTA DRUGO
      const baseRotationZ = -Math.PI / 2
      group.current.rotation.z = baseRotationZ + Math.sin(state.clock.elapsedTime * 1.5) * 0.02
      
      // Animiraj STRINGS objekat
      const time = state.clock.elapsedTime
      group.current.traverse((child) => {
        if (child.userData && child.userData.isString && child.userData.originalPosition) {
          const originalPos = child.userData.originalPosition
          const originalRot = child.userData.originalRotation
          
          // Vibracija žica
          const vibration = Math.sin(time * 20) * 0.005
          const sideVibration = Math.sin(time * 25) * 0.003
          
          child.position.x = originalPos.x + vibration
          child.position.y = originalPos.y + sideVibration
          child.position.z = originalPos.z
          
          // Blaga rotacija
          child.rotation.x = originalRot.x + Math.sin(time * 15) * 0.01
          child.rotation.y = originalRot.y + Math.sin(time * 18) * 0.008
          child.rotation.z = originalRot.z
        }
      })
    }
  })

  useEffect(() => {
    // SAMO shadows - MINIMALNU izmenu
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        
      }
    })
  }, [clonedScene])

  // Position guitar VERTICALLY - vrat naviše
  return (
    <group 
      ref={group} 
      position={[0, 0, -2]} 
      rotation={[0, 0, -Math.PI / 2]}
      scale={[2.2, 2.2, 2.2]}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

function SandalsModel({ isPlaying }) {
  const group = useRef()
  const { scene } = useGLTF(SANDALS_GLTF_URL)
  
  // Clone the scene to avoid conflicts
  const clonedScene = scene.clone()

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (group.current) {
      if (isPlaying) {
        // Animated strumming motion - GORE/DOLJE umesto levo/desno
        const verticalStrumming = Math.sin(time * 8) * 0.4  // gore/dolje kretanje
        const horizontalBob = Math.sin(time * 6) * 0.05      // malo levo/desno
        const depthMotion = Math.sin(time * 4) * 0.1         // napred/nazad
        
        // Position papuča TAČNO NA VRAT gitare - svira GORE/DOLJE, DALJE IZA ZAVJESE
        group.current.position.x = 0.5 + horizontalBob      // JOŠ MALO VIŠE DESNO
        group.current.position.y = -0.5 + verticalStrumming  // JOŠ MALO ISPOD
        group.current.position.z = -0.4 + depthMotion       // BLIŽE DA NE PROLAZI KROZ VRAT
        
        // Rotation like strumming strings vertically
        group.current.rotation.z = Math.sin(time * 8) * 0.2
        group.current.rotation.x = 0.3 + Math.sin(time * 10) * 0.1
        group.current.rotation.y = 0.4 + Math.sin(time * 5) * 0.1
      } else {
        // Static position when paused - tačno na vratu, DALJE IZA ZAVJESE
        group.current.position.x = 0.5   // JOŠ MALO VIŠE DESNO
        group.current.position.y = 0.1   // JOŠ MALO ISPOD
        group.current.position.z = -1.2  // BLIŽE DA NE PROLAZI KROZ VRAT
        group.current.rotation.x = 0.2
        group.current.rotation.y = 0.3
        group.current.rotation.z = 0
      }
    }
  })

  useEffect(() => {
    // Set up shadows for sandals - keep original colors
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        // Don't modify materials - keep original colors and textures
      }
    })
  }, [clonedScene])

  return (
    <group ref={group} scale={[5, 5, 5]}>
      <primitive object={clonedScene} />
    </group>
  )
}

function Stage() {
  // Nema stage - čisto pozorište
  return null
}

function MusicalNotes({ isPlaying, curtainFullyOpen }) {
  const containerRef = useRef()
  const lastNoteTime = useRef(0)
  
  useFrame((state) => {
    // Emojiji se prikazuju SAMO kad je muzika uključena I zavjesa otvorena
    if (isPlaying && curtainFullyOpen && containerRef.current) {
      const time = state.clock.elapsedTime
      
      // Kreiraj 2 NOVE note svakih 0.8 sekundi
      if (time - lastNoteTime.current > 0.8) {
        const notes = ['🎵', '🎶', '♪', '♫']
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FF9F43', '#9B59B6']
        
        // Kreiraj random animaciju za ovu grupu od 4
        const animationType = Math.floor(Math.random() * 3) // 0, 1, ili 2
        
        // Kreiraj 4 note odjednom u različitim pozicijama
        for (let i = 0; i < 4; i++) {
          const newNote = document.createElement('div')
          newNote.innerHTML = notes[Math.floor(Math.random() * notes.length)] // RANDOM emoji
          
          // Postavih ih u grid 2x2 sa malo randomness-a
          const gridX = (i % 2) * 80 + (Math.random() - 0.5) * 30
          const gridY = Math.floor(i / 2) * 40 + (Math.random() - 0.5) * 20
          
          newNote.style.cssText = `
            position: absolute;
            font-size: 25px;
            color: ${colors[Math.floor(Math.random() * colors.length)]};
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            pointer-events: none;
            user-select: none;
            left: ${gridX - 40}px;
            top: ${gridY}px;
            z-index: 1000;
            animation: noteFloat${animationType} ${3 + (Math.random() * 1)}s ease-out forwards;
            animation-delay: ${i * 0.1}s;
          `
          
          containerRef.current.appendChild(newNote)
          
          // Ukloni notu nakon 3 sekunde
          setTimeout(() => {
            if (newNote.parentNode) {
              newNote.parentNode.removeChild(newNote)
            }
          }, 3000)
        }
        
        lastNoteTime.current = time
      }
    }
  })

  if (!isPlaying) return null

  return (
    <Html position={[1.5, 0.2, -1.0]} center>
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '300px',
          height: '200px',
          pointerEvents: 'none'
        }}
      >
        <style>{`
          @keyframes noteFloat0 {
            0% {
              transform: translateY(0px) translateX(0px) scale(1);
              opacity: 1;
            }
            50% {
              transform: translateY(-75px) translateX(20px) scale(0.8);
              opacity: 0.8;
            }
            100% {
              transform: translateY(-150px) translateX(-10px) scale(0.5);
              opacity: 0;
            }
          }
          
          @keyframes noteFloat1 {
            0% {
              transform: translateY(0px) translateX(0px) scale(1);
              opacity: 1;
            }
            33% {
              transform: translateY(-50px) translateX(-25px) scale(1.1);
              opacity: 0.9;
            }
            66% {
              transform: translateY(-100px) translateX(15px) scale(0.7);
              opacity: 0.6;
            }
            100% {
              transform: translateY(-150px) translateX(5px) scale(0.4);
              opacity: 0;
            }
          }
          
          @keyframes noteFloat2 {
            0% {
              transform: translateY(0px) translateX(0px) scale(1);
              opacity: 1;
            }
            25% {
              transform: translateY(-40px) translateX(30px) scale(0.9);
              opacity: 1;
            }
            75% {
              transform: translateY(-110px) translateX(-20px) scale(0.6);
              opacity: 0.7;
            }
            100% {
              transform: translateY(-150px) translateX(25px) scale(0.3);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </Html>
  )
}

function GuitarStrings({ isPlaying }) {
  // Ne dodajem nove žice - animiram postojeće u modelu gitare
  return null
}

function GuitarPlayingScene({ isPlaying, curtainFullyOpen, setCurtainFullyOpen }) {
  return (
    <>
      {/* Zavjesa se uvijek renderuje */}
      <Curtain isPlaying={isPlaying} setCurtainFullyOpen={setCurtainFullyOpen} />
      
      {/* Glavna scena - uvijek tu ali možda pokrivena zavjesom */}
      <group visible={true}>
        <Stage />
        <GuitarModel isPlaying={isPlaying} />
        <GuitarStrings isPlaying={isPlaying} />
        <SandalsModel isPlaying={isPlaying} />
        <MusicalNotes isPlaying={isPlaying} curtainFullyOpen={curtainFullyOpen} />
      </group>
    </>
  )
}

// Preload models
useGLTF.preload(GUITAR_GLTF_URL)
useGLTF.preload(SANDALS_GLTF_URL)

export default GuitarPlayingScene
