import { useEffect, useState } from 'react'
import './DAG3DView.css'

// Componente temporário até as dependências serem instaladas
function DAG3DView({ data, selectedNode, onNodeSelect, showCriticalPath, criticalPath, layout }) {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se as dependências estão instaladas
    try {
      require.resolve('three')
      require.resolve('@react-three/fiber')
      require.resolve('@react-three/drei')
      setIsInstalled(true)
    } catch (e) {
      setIsInstalled(false)
    }
  }, [])

  if (!isInstalled) {
    return (
      <div className="dag-3d-container">
        <div className="dag-3d-placeholder">
          <h3>Visualização 3D</h3>
          <p>Para usar a visualização 3D, você precisa instalar as dependências:</p>
          
          <div className="install-instructions">
            <code>npm install three @react-three/fiber @react-three/drei</code>
          </div>
          
          <p className="install-note">
            Após instalar, reinicie o servidor com <code>npm run dev</code>
          </p>
          
          <div className="feature-preview">
            <h4>O que você verá na visualização 3D:</h4>
            <ul>
              <li>✨ Nós renderizados como esferas 3D interativas</li>
              <li>🔗 Conexões visualizadas em 3D</li>
              <li>🎮 Controles de câmera (rotação, zoom, pan)</li>
              <li>🔴 Caminho crítico animado em 3D</li>
              <li>📊 Layouts adaptados para 3D (esférico, cúbico, camadas)</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Se as dependências estiverem instaladas, carregar o componente real
  const RealDAG3DView = require('./DAG3DViewReal').default
  return <RealDAG3DView {...{ data, selectedNode, onNodeSelect, showCriticalPath, criticalPath, layout }} />
}

export default DAG3DView