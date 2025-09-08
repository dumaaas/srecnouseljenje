import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense, useState, useEffect, useRef } from 'react'
import GuitarPlayingScene from './GuitarPlayingScene'

// Vite/Vercel asset URLs
const AUDIO_URL = new URL('../assets/lazljiva.mp3', import.meta.url).href
const LORD_IMG_URL = new URL('../assets/lord.png', import.meta.url).href
const MASLJIVA_IMG_URL = new URL('../assets/masljiva.webp', import.meta.url).href
import LoadingSpinner from './LoadingSpinner'

function Scene3D() {
  const [isPlaying, setIsPlaying] = useState(false) // Počinje sa zatvorenom zavjesom
  const audioRef = useRef(null)
  const [showLordImage, setShowLordImage] = useState(false)
  const timeUpdateRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(337) // default 05:37 before metadata loads
  const [cameraSettings, setCameraSettings] = useState({ 
    position: [0, 0, 8], 
    fov: 100 
  })
  const [curtainFullyOpen, setCurtainFullyOpen] = useState(false)

  // Preload overlay images to avoid first-show delay in production
  useEffect(() => {
    const lord = new Image()
    lord.src = LORD_IMG_URL
    const masljiva = new Image()
    masljiva.src = MASLJIVA_IMG_URL
  }, [])

  // Vremena kada treba da se pojavi lord.png (u sekundama)
  const lordTimestamps = [0, 12, 144, 240, 312, 324] // 00:00, 00:11, 02:23, 04:00, 05:11, 05:24

  useEffect(() => {
    const updateCamera = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const aspectRatio = width / height
      
      let position, fov
      
      if (width <= 480) {
        // Mali telefon - bliže za veću gitaru
        position = [0, 0, 10]
        fov = 100
      } else if (width <= 768) {
        // Tablet/veći telefon
        position = [0, 0, 8]
        fov = 95
      } else if (width <= 1024) {
        // Mali laptop - malo dalje
        position = [0, 0, 7.5]
        fov = 90
      } else {
        // Desktop - malo dalje da nije previše veliki
        position = [0, 0, 7]
        fov = 85
      }
      
      // Dodatno prilagođavanje za portret orientaciju
      if (aspectRatio < 0.8) {
        position[2] += 3  // Još dalje da se vidi šipka
        fov += 20         // Još veći FOV
      }
      
      setCameraSettings({ position, fov })
    }

    updateCamera()
    window.addEventListener('resize', updateCamera)
    
    return () => window.removeEventListener('resize', updateCamera)
  }, [])

  // Funkcija za praćenje vremena pesme
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime
      setCurrentTime(time)
      
      const currentTimeFloor = Math.floor(time)
      
      // Proveri da li je trenutno vreme u listi za prikaz slike
      if (lordTimestamps.includes(currentTimeFloor)) {
        setShowLordImage(true)
        // Sakrij sliku nakon 3 sekunde
        setTimeout(() => {
          setShowLordImage(false)
        }, 3000)
      }
    }
  }

  // Funkcija kada se učita metadata (dobije se trajanje pesme)
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // Funkcija za premotavanje pesme
  const handleSeek = (e) => {
    if (audioRef.current && duration > 0) {
      // Pronađi progress bar element direktno
      const progressBar = e.currentTarget
      const rect = progressBar.getBoundingClientRect()
      
      // Izračunaj tačnu poziciju klika unutar bara
      const clickX = e.clientX - rect.left
      const barWidth = rect.width
      
      // Osiguraj da je klik unutar bara (0-100%)
      const percent = Math.max(0, Math.min(1, clickX / barWidth))
      const newTime = percent * duration
      
      // Postavi novo vreme
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
      
      // debug: seek percentage and time (muted in production)
    }
  }

  // Formatiranje vremena u MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Funkcija za play/pause muzike
  const togglePlayPause = () => {
    if (!audioRef.current) {
      // Kreirati audio element ako ne postoji
      audioRef.current = new Audio(AUDIO_URL)
      audioRef.current.loop = true
      audioRef.current.volume = 0.7
      
      // Dodaj listenere za praćenje vremena i metadata
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate)
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
    }

    if (isPlaying) {
      // Pauzira muziku
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      // Pušta muziku
      audioRef.current.play().catch(error => {
        console.log('Greška sa reprodukcijom:', error)
      })
      setIsPlaying(true)
    }
  }

  // Cleanup audio listeners
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate)
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [])

  return (
    <div className="scene-container">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ 
          position: cameraSettings.position, 
          fov: cameraSettings.fov 
        }}
        gl={{ antialias: true }}
      >
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 3]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={1}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        {/* Spotlight on the performance */}
        <spotLight 
          position={[0, 6, 3]} 
          intensity={1.2} 
          angle={0.8} 
          penumbra={0.3}
          target-position={[0, 0, 0]}
          castShadow
        />
        <pointLight position={[-3, 3, 2]} intensity={0.6} color="#ffa500" />
        
        {/* Environment for better reflections */}
        <Environment preset="warehouse" />
        
        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={window.innerWidth <= 480 ? 5 : 3}
          maxDistance={window.innerWidth <= 480 ? 20 : 15}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          target={[0, 0, 0]}
          autoRotate={false}
          autoRotateSpeed={0}
        />
        
        {/* 3D Scene with models */}
        <Suspense fallback={<LoadingSpinner />}>
          <GuitarPlayingScene 
            isPlaying={isPlaying} 
            curtainFullyOpen={curtainFullyOpen}
            setCurtainFullyOpen={setCurtainFullyOpen}
          />
        </Suspense>
      </Canvas>
      
      {/* Play/Pause Controls */}
      <div className="play-controls">
        <button 
          className="play-button"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            // Pause SVG icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            // Play SVG icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
        </button>
        
        <div className="progress-container">
          <span className="time-display">{formatTime(currentTime)}</span>
          <div 
            className="progress-bar" 
            onClick={handleSeek}
            onMouseMove={(e) => {
              // Dodaj hover preview (opcionalno)
              if (duration > 0) {
                const rect = e.currentTarget.getBoundingClientRect()
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                const hoverTime = percent * duration
                e.currentTarget.title = `Premotaj na ${formatTime(hoverTime)}`
              }
            }}
          >
            <div 
              className="progress-fill"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
          <span className="time-display">{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Lord i Masljiva slike overlay - SAMO kad je zavjesa otvorena */}
      {showLordImage && curtainFullyOpen && (
        <>
          <div className="lord-overlay">
            <img 
              src={LORD_IMG_URL} 
              alt="Lord" 
              className="lord-image"
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="masljiva-overlay">
            <img 
              src={MASLJIVA_IMG_URL} 
              alt="Masljiva" 
              className="masljiva-image"
              loading="eager"
              decoding="async"
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Scene3D
