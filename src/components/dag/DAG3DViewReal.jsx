import { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Line, Html } from '@react-three/drei'
import './DAG3DView.css'

// Componente para cada nó
function Node3D({ node, isSelected, onSelect, showCriticalPath, isInCriticalPath }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  // Animação de hover
  useFrame((state) => {
    if (meshRef.current) {
      if (hovered || isSelected) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
      
      // Animação para nós no caminho crítico
      if (isInCriticalPath) {
        meshRef.current.rotation.y += 0.01
        const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
        meshRef.current.scale.setScalar(pulse)
      }
    }
  })
  
  // Cores por tipo de nó
  const getNodeColor = () => {
    if (isInCriticalPath) return '#ef4444'
    
    const colors = {
      file: '#2563eb',
      function: '#10b981',
      class: '#f59e0b',
      agent: '#ef4444',
      warroom: '#8b5cf6',
      module: '#06b6d4'
    }
    return colors[node.type] || '#666'
  }
  
  return (
    <group position={[node.x3d || 0, node.y3d || 0, node.z3d || 0]}>
      <mesh
        ref={meshRef}
        onClick={() => onSelect(node)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color={getNodeColor()} 
          emissive={getNodeColor()}
          emissiveIntensity={hovered || isSelected ? 0.3 : 0.1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Label do nó */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.3}
        color={isInCriticalPath ? '#ef4444' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
      >
        {node.label}
      </Text>
      
      {/* Tooltip HTML quando hover */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="node-tooltip-3d">
            <strong>{node.label}</strong>
            <br />
            Tipo: {node.type}
            {node.metrics && (
              <>
                <br />
                CPU: {node.metrics.cpu}%
                <br />
                Memória: {node.metrics.memory}%
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

// Componente para as conexões
function Link3D({ link, nodes, showCriticalPath, isInCriticalPath }) {
  const source = nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source))
  const target = nodes.find(n => n.id === (typeof link.target === 'object' ? link.target.id : link.target))
  
  if (!source || !target) return null
  
  const points = [
    new THREE.Vector3(source.x3d || 0, source.y3d || 0, source.z3d || 0),
    new THREE.Vector3(target.x3d || 0, target.y3d || 0, target.z3d || 0)
  ]
  
  const getLineColor = () => {
    if (isInCriticalPath) return '#ef4444'
    
    const colors = {
      'execution': '#10b981',
      'data-flow': '#2563eb',
      'dependency': '#666'
    }
    return colors[link.type] || '#666'
  }
  
  return (
    <Line
      points={points}
      color={getLineColor()}
      lineWidth={isInCriticalPath ? 3 : 1}
      opacity={isInCriticalPath ? 1 : 0.6}
      transparent
    />
  )
}

// Componente principal da cena 3D
function Scene({ nodes, links, selectedNode, onNodeSelect, showCriticalPath, criticalPath }) {
  const { camera } = useThree()
  
  // Focar no nó selecionado
  useEffect(() => {
    if (selectedNode && selectedNode.x3d !== undefined) {
      camera.position.lerp(
        new THREE.Vector3(
          selectedNode.x3d + 5,
          selectedNode.y3d + 5,
          selectedNode.z3d + 5
        ),
        0.5
      )
      camera.lookAt(selectedNode.x3d, selectedNode.y3d, selectedNode.z3d)
    }
  }, [selectedNode, camera])
  
  return (
    <>
      {/* Iluminação */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Grid de referência */}
      <gridHelper args={[50, 50]} />
      
      {/* Renderizar links */}
      {links.map((link, index) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source
        const targetId = typeof link.target === 'object' ? link.target.id : link.target
        const isInPath = showCriticalPath && 
          criticalPath.includes(sourceId) && 
          criticalPath.includes(targetId) &&
          criticalPath.indexOf(targetId) === criticalPath.indexOf(sourceId) + 1
          
        return (
          <Link3D
            key={index}
            link={link}
            nodes={nodes}
            showCriticalPath={showCriticalPath}
            isInCriticalPath={isInPath}
          />
        )
      })}
      
      {/* Renderizar nós */}
      {nodes.map(node => (
        <Node3D
          key={node.id}
          node={node}
          isSelected={selectedNode?.id === node.id}
          onSelect={onNodeSelect}
          showCriticalPath={showCriticalPath}
          isInCriticalPath={showCriticalPath && criticalPath.includes(node.id)}
        />
      ))}
    </>
  )
}

// Componente principal do DAG 3D
function DAG3DViewReal({ data, selectedNode, onNodeSelect, showCriticalPath, criticalPath, layout }) {
  const [nodes3D, setNodes3D] = useState([])
  
  // Converter posições 2D para 3D
  useEffect(() => {
    if (!data || !data.nodes) return
    
    const convertedNodes = data.nodes.map(node => {
      let x3d, y3d, z3d
      
      // Aplicar layout específico em 3D
      switch (layout) {
        case 'force':
        case 'hierarchical':
        case 'tree':
          // Usar posições 2D com profundidade baseada em conexões
          x3d = (node.x - 500) / 50 || 0
          y3d = (node.y - 400) / 50 || 0
          z3d = Math.random() * 10 - 5
          break
          
        case 'radial':
        case 'circular':
          // Distribuir em esfera
          const theta = (node.x / 1000) * Math.PI * 2
          const phi = (node.y / 800) * Math.PI
          const radius = 10
          x3d = radius * Math.sin(phi) * Math.cos(theta)
          y3d = radius * Math.sin(phi) * Math.sin(theta)
          z3d = radius * Math.cos(phi)
          break
          
        case 'matrix':
          // Grid 3D
          const gridSize = Math.ceil(Math.cbrt(data.nodes.length))
          const index = data.nodes.indexOf(node)
          x3d = (index % gridSize) * 3 - (gridSize * 3) / 2
          y3d = (Math.floor(index / gridSize) % gridSize) * 3 - (gridSize * 3) / 2
          z3d = Math.floor(index / (gridSize * gridSize)) * 3 - (gridSize * 3) / 2
          break
          
        case 'layered':
          // Camadas em profundidade
          x3d = (node.x - 500) / 50 || 0
          y3d = (node.y - 400) / 50 || 0
          // Usar métricas ou tipo para determinar profundidade
          z3d = (node.metrics?.complexity || 0) / 10 - 5
          break
          
        default:
          x3d = (node.x - 500) / 50 || 0
          y3d = (node.y - 400) / 50 || 0
          z3d = 0
      }
      
      return {
        ...node,
        x3d,
        y3d,
        z3d
      }
    })
    
    setNodes3D(convertedNodes)
  }, [data, layout])
  
  return (
    <div className="dag-3d-container">
      <Canvas camera={{ position: [15, 15, 15], fov: 60 }}>
        <Scene
          nodes={nodes3D}
          links={data?.links || []}
          selectedNode={selectedNode}
          onNodeSelect={onNodeSelect}
          showCriticalPath={showCriticalPath}
          criticalPath={criticalPath}
        />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Controles 3D */}
      <div className="dag-3d-controls">
        <div className="control-info">
          <strong>Controles 3D:</strong>
          <br />
          • Clique e arraste para rotacionar
          <br />
          • Scroll para zoom
          <br />
          • Clique direito + arraste para pan
          <br />
          • Clique nos nós para selecionar
        </div>
      </div>
    </div>
  )
}

export default DAG3DViewReal