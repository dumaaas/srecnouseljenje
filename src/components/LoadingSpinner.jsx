import { Html, useProgress } from '@react-three/drei'

function LoadingSpinner() {
  const { progress } = useProgress()
  
  return (
    <Html center>
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">
          Učitavam 3D modele... {Math.round(progress)}%
        </div>
      </div>
    </Html>
  )
}

export default LoadingSpinner
