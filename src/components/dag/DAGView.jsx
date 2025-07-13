import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import * as d3 from 'd3'
import FileUpload from './FileUpload'
import FilterPanel from './FilterPanel'
import MiniMap from './MiniMap'
import { GraphOptimizer } from '../../services/graphOptimizer'
import './DAGView.css'

// Lazy load do componente 3D
const DAG3DView = lazy(() => import('./DAG3DView'))

function DAGView() {
  const svgRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [filter, setFilter] = useState('all')
  const [layout, setLayout] = useState('force')
  const [showUpload, setShowUpload] = useState(true)
  const [graphData, setGraphData] = useState(null)
  const [optimizedData, setOptimizedData] = useState(null)
  const [viewport, setViewport] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showMiniMap, setShowMiniMap] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showCriticalPath, setShowCriticalPath] = useState(false)
  const [criticalPath, setCriticalPath] = useState([])
  const [activeFilters, setActiveFilters] = useState({})
  const [viewMode, setViewMode] = useState('2d') // '2d' ou '3d'
  const [isDynamic, setIsDynamic] = useState(true) // controla se os nós são arrastáveis e dinâmicos
  const graphOptimizerRef = useRef(new GraphOptimizer())
  const [metrics, setMetrics] = useState({
    cpu: 45,
    memory: 62,
    throughput: 78
  })

  // Check for CLI data on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const dataFile = urlParams.get('data')
    const mode = urlParams.get('mode')
    
    if (dataFile) {
      // Load data from CLI
      fetch(dataFile)
        .then(res => res.json())
        .then(data => {
          setGraphData(data)
          setShowUpload(false)
          if (mode === 'folder') {
            setLayout('hierarchical')
          }
        })
        .catch(err => console.error('Failed to load CLI data:', err))
    }
  }, [])

  // Função para lidar com arquivos analisados
  const handleFilesAnalyzed = (analysisResults) => {
    setGraphData(analysisResults)
    setShowUpload(false)
  }

  // Função para aplicar zoom em um nó específico
  const zoomToNode = useCallback((nodeId) => {
    if (!svgRef.current) return
    
    setTimeout(() => {
      const svg = d3.select(svgRef.current)
      const nodes = graphData?.nodes || mockData.nodes
      const node = nodes.find(n => n.id === nodeId)
      if (!node || node.x === undefined || node.y === undefined) return
      
      const zoom = svg.node().__zoom
      if (!zoom) return
      
      svg.transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(svgRef.current.clientWidth / 2, svgRef.current.clientHeight / 2)
            .scale(2)
            .translate(-node.x, -node.y)
        )
    }, 100)
  }, [graphData])

  // Aplicar filtros aos dados
  const applyFilters = useCallback((data, filters) => {
    if (!filters || Object.keys(filters).length === 0) return data

    let filteredNodes = [...data.nodes]
    let filteredLinks = [...data.links]

    // Filtro de busca
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filteredNodes = filteredNodes.filter(node => 
        node.label.toLowerCase().includes(term) ||
        node.id.toLowerCase().includes(term)
      )
    }

    // Filtro de tipos
    if (filters.nodeTypes && filters.nodeTypes.length > 0) {
      filteredNodes = filteredNodes.filter(node => 
        filters.nodeTypes.includes(node.type)
      )
    }

    // Filtro de diretórios
    if (filters.directories && filters.directories.length > 0) {
      filteredNodes = filteredNodes.filter(node => {
        if (!node.relativePath) return false
        const dir = node.relativePath.substring(0, node.relativePath.lastIndexOf('/'))
        return filters.directories.includes(dir)
      })
    }

    // Filtro de complexidade
    if (filters.complexity) {
      filteredNodes = filteredNodes.filter(node => {
        const complexity = node.metrics?.complexity || 0
        return complexity >= filters.complexity.min && complexity <= filters.complexity.max
      })
    }

    // Atualizar links baseado nos nós filtrados
    const nodeIds = new Set(filteredNodes.map(n => n.id))
    filteredLinks = filteredLinks.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      return nodeIds.has(sourceId) && nodeIds.has(targetId)
    })

    return { nodes: filteredNodes, links: filteredLinks }
  }, [])

  // Calcular caminho crítico
  const calculateCriticalPath = useCallback((nodes, links) => {
    // Algoritmo simplificado de caminho crítico
    // Em um DAG real, usaríamos topological sort + longest path
    const graph = {}
    const inDegree = {}
    const distances = {}
    const predecessors = {}

    // Construir grafo de adjacência
    nodes.forEach(node => {
      graph[node.id] = []
      inDegree[node.id] = 0
      distances[node.id] = 0
      predecessors[node.id] = null
    })

    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      graph[sourceId].push(targetId)
      inDegree[targetId]++
    })

    // Encontrar nós sem dependências (pontos de entrada)
    const queue = []
    Object.keys(inDegree).forEach(nodeId => {
      if (inDegree[nodeId] === 0) {
        queue.push(nodeId)
      }
    })

    // Processar grafo (topological sort com cálculo de distância)
    const sorted = []
    while (queue.length > 0) {
      const current = queue.shift()
      sorted.push(current)

      graph[current].forEach(neighbor => {
        // Atualizar distância se encontrarmos um caminho mais longo
        if (distances[current] + 1 > distances[neighbor]) {
          distances[neighbor] = distances[current] + 1
          predecessors[neighbor] = current
        }

        inDegree[neighbor]--
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor)
        }
      })
    }

    // Encontrar o nó com maior distância (fim do caminho crítico)
    let maxDistance = 0
    let endNode = null
    Object.entries(distances).forEach(([nodeId, distance]) => {
      if (distance > maxDistance) {
        maxDistance = distance
        endNode = nodeId
      }
    })

    // Reconstruir caminho crítico
    const path = []
    let current = endNode
    while (current !== null) {
      path.unshift(current)
      current = predecessors[current]
    }

    return path
  }, [])

  // Handler para mudança de filtros
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters)
  }, [])

  // Mock data - substituir por dados reais via API
  const mockData = {
    nodes: [
      // Arquivos principais
      { id: 'main.ts', type: 'file', label: 'main.ts', metrics: { cpu: 15, memory: 23, calls: 45 } },
      { id: 'server.js', type: 'file', label: 'server.js', metrics: { cpu: 25, memory: 35, calls: 78 } },
      
      // Módulos do War Room
      { id: 'AdaptiveWarRoom', type: 'warroom', label: 'AdaptiveWarRoom', metrics: { cpu: 45, memory: 52, calls: 124 } },
      { id: 'SessionOrchestrator', type: 'agent', label: 'SessionOrchestrator', metrics: { cpu: 35, memory: 41, calls: 89 } },
      { id: 'AIDialogModerator', type: 'agent', label: 'AIDialogModerator', metrics: { cpu: 55, memory: 48, calls: 156 } },
      { id: 'ValidationPipeline', type: 'agent', label: 'ValidationPipeline', metrics: { cpu: 28, memory: 32, calls: 67 } },
      
      // Core do sistema
      { id: 'CodeGraphManager', type: 'class', label: 'CodeGraphManager', metrics: { cpu: 18, memory: 26, calls: 92 } },
      { id: 'Crystallizer', type: 'class', label: 'Crystallizer', metrics: { cpu: 22, memory: 29, calls: 73 } },
      { id: 'Rehydrator', type: 'class', label: 'Rehydrator', metrics: { cpu: 19, memory: 24, calls: 61 } },
      
      // Funções
      { id: 'analyzeRequest', type: 'function', label: 'analyzeRequest()', metrics: { cpu: 12, memory: 18, calls: 234 } },
      { id: 'composeTeam', type: 'function', label: 'composeTeam()', metrics: { cpu: 24, memory: 31, calls: 189 } },
      { id: 'createSessionPlan', type: 'function', label: 'createSessionPlan()', metrics: { cpu: 16, memory: 22, calls: 145 } },
      { id: 'validateDecision', type: 'function', label: 'validateDecision()', metrics: { cpu: 31, memory: 38, calls: 267 } },
      
      // Módulos de AI
      { id: 'AIInsightsEngine', type: 'module', label: 'AIInsightsEngine', metrics: { cpu: 42, memory: 56, calls: 98 } },
      { id: 'LearningEngine', type: 'module', label: 'LearningEngine', metrics: { cpu: 38, memory: 44, calls: 112 } },
      
      // Visualizadores
      { id: 'EnhancedVisualizer', type: 'class', label: 'EnhancedVisualizer', metrics: { cpu: 26, memory: 33, calls: 85 } },
      { id: 'GraphCanvas', type: 'class', label: 'GraphCanvas', metrics: { cpu: 29, memory: 37, calls: 201 } }
    ],
    links: [
      // Fluxo principal
      { source: 'main.ts', target: 'server.js', type: 'execution' },
      { source: 'server.js', target: 'AdaptiveWarRoom', type: 'execution' },
      
      // War Room dependencies
      { source: 'AdaptiveWarRoom', target: 'SessionOrchestrator', type: 'execution' },
      { source: 'AdaptiveWarRoom', target: 'analyzeRequest', type: 'data-flow' },
      { source: 'AdaptiveWarRoom', target: 'composeTeam', type: 'data-flow' },
      { source: 'AdaptiveWarRoom', target: 'createSessionPlan', type: 'data-flow' },
      
      // Session orchestration
      { source: 'SessionOrchestrator', target: 'AIDialogModerator', type: 'execution' },
      { source: 'SessionOrchestrator', target: 'ValidationPipeline', type: 'execution' },
      
      // Validation flow
      { source: 'ValidationPipeline', target: 'validateDecision', type: 'data-flow' },
      
      // Code graph dependencies
      { source: 'server.js', target: 'CodeGraphManager', type: 'dependency' },
      { source: 'CodeGraphManager', target: 'Crystallizer', type: 'dependency' },
      { source: 'CodeGraphManager', target: 'Rehydrator', type: 'dependency' },
      
      // AI modules
      { source: 'AdaptiveWarRoom', target: 'LearningEngine', type: 'dependency' },
      { source: 'server.js', target: 'AIInsightsEngine', type: 'dependency' },
      { source: 'LearningEngine', target: 'analyzeRequest', type: 'data-flow' },
      
      // Visualization
      { source: 'server.js', target: 'EnhancedVisualizer', type: 'dependency' },
      { source: 'EnhancedVisualizer', target: 'GraphCanvas', type: 'dependency' }
    ]
  }

  useEffect(() => {
    if (!svgRef.current) return
    
    // Usar dados analisados se disponíveis, senão usar mock data
    let data = graphData || mockData

    // Aplicar otimizações para grafos grandes
    if (data.nodes.length > 100) {
      data = graphOptimizerRef.current.optimizeGraph(data, {
        maxNodes: 200,
        clusteringThreshold: 50,
        importanceMetric: 'degree'
      })
    }

    // Aplicar filtros
    if (activeFilters && Object.keys(activeFilters).length > 0) {
      data = applyFilters(data, activeFilters)
    }

    // Calcular caminho crítico se ativado
    if (showCriticalPath) {
      const path = calculateCriticalPath(data.nodes, data.links)
      setCriticalPath(path)
    }

    const container = svgRef.current.parentElement
    const width = container.clientWidth
    const height = container.clientHeight

    // Limpar SVG anterior
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    const g = svg.append('g')

    // Definir marcadores de seta
    const defs = svg.append('defs')
    
    // Marcadores padrão
    defs.selectAll('marker')
      .data(['execution', 'data-flow', 'dependency'])
      .enter().append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('class', 'arrow')
      .style('fill', d => {
        const colors = {
          'execution': '#10b981',
          'data-flow': '#2563eb',
          'dependency': '#666'
        }
        return colors[d] || '#666'
      })
    
    // Marcador especial para caminho crítico
    defs.append('marker')
      .attr('id', 'arrow-critical')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .style('fill', '#ef4444')
      .style('filter', 'drop-shadow(0 0 3px #ef4444)')

    // Função para aplicar layout específico
    const applyLayout = (nodes, links, layoutType) => {
      // Se for force layout e estiver dinâmico, liberar os nós
      if (layoutType === 'force' && isDynamic) {
        nodes.forEach(node => {
          delete node.fx
          delete node.fy
        })
        return
      }

      switch(layoutType) {
        case 'hierarchical':
        case 'tree':
          // Layout hierárquico/árvore usando algoritmo de Sugiyama
          const layers = {}
          const visited = new Set()
          
          // Função para calcular nível de cada nó
          const calculateDepth = (nodeId, depth = 0) => {
            if (visited.has(nodeId)) return
            visited.add(nodeId)
            layers[nodeId] = Math.max(layers[nodeId] || 0, depth)
            
            links.forEach(link => {
              const sourceId = typeof link.source === 'object' ? link.source.id : link.source
              const targetId = typeof link.target === 'object' ? link.target.id : link.target
              if (sourceId === nodeId) {
                calculateDepth(targetId, depth + 1)
              }
            })
          }
          
          // Encontrar nós raiz (sem dependências de entrada)
          const roots = nodes.filter(node => {
            const hasIncoming = links.some(link => {
              const targetId = typeof link.target === 'object' ? link.target.id : link.target
              return targetId === node.id
            })
            return !hasIncoming
          })
          
          // Se não houver raiz clara, usar o primeiro nó
          if (roots.length === 0) roots.push(nodes[0])
          
          // Calcular profundidade a partir das raízes
          roots.forEach(root => calculateDepth(root.id))
          
          // Organizar nós por nível
          const nodesByLevel = {}
          nodes.forEach(node => {
            const level = layers[node.id] || 0
            if (!nodesByLevel[level]) nodesByLevel[level] = []
            nodesByLevel[level].push(node)
          })
          
          // Posicionar nós
          const levelHeight = height / (Object.keys(nodesByLevel).length + 1)
          Object.entries(nodesByLevel).forEach(([level, levelNodes]) => {
            const levelWidth = width / (levelNodes.length + 1)
            levelNodes.forEach((node, index) => {
              node.x = (index + 1) * levelWidth
              node.y = (parseInt(level) + 1) * levelHeight
              if (!isDynamic) {
                node.fx = node.x
                node.fy = node.y
              }
            })
          })
          break
          
        case 'radial':
          // Layout radial com níveis baseados em distância da origem
          const radialLayers = {}
          const radialVisited = new Set()
          
          // Calcular distância de cada nó a partir dos nós raiz
          const calculateDistance = (nodeId, distance = 0) => {
            if (radialVisited.has(nodeId)) return
            radialVisited.add(nodeId)
            radialLayers[nodeId] = Math.min(radialLayers[nodeId] || Infinity, distance)
            
            links.forEach(link => {
              const sourceId = typeof link.source === 'object' ? link.source.id : link.source
              const targetId = typeof link.target === 'object' ? link.target.id : link.target
              if (sourceId === nodeId) {
                calculateDistance(targetId, distance + 1)
              }
            })
          }
          
          // Encontrar nós raiz
          const radialRoots = nodes.filter(node => {
            const hasIncoming = links.some(link => {
              const targetId = typeof link.target === 'object' ? link.target.id : link.target
              return targetId === node.id
            })
            return !hasIncoming
          })
          
          if (radialRoots.length === 0) radialRoots.push(nodes[0])
          radialRoots.forEach(root => calculateDistance(root.id))
          
          // Organizar nós por anel
          const rings = {}
          nodes.forEach(node => {
            const ring = radialLayers[node.id] || 0
            if (!rings[ring]) rings[ring] = []
            rings[ring].push(node)
          })
          
          // Posicionar nós em anéis concêntricos
          const maxRadius = Math.min(width, height) * 0.4
          const ringCount = Object.keys(rings).length
          
          Object.entries(rings).forEach(([ring, ringNodes]) => {
            const radius = ring === '0' ? 0 : (parseInt(ring) / ringCount) * maxRadius
            const angleStep = (2 * Math.PI) / ringNodes.length
            
            ringNodes.forEach((node, index) => {
              const angle = index * angleStep
              node.x = width/2 + radius * Math.cos(angle)
              node.y = height/2 + radius * Math.sin(angle)
              if (!isDynamic) {
                node.fx = node.x
                node.fy = node.y
              }
            })
          })
          break
          
        case 'circular':
          // Layout circular
          const circleRadius = Math.min(width, height) * 0.4
          nodes.forEach((node, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI
            node.x = width/2 + circleRadius * Math.cos(angle)
            node.y = height/2 + circleRadius * Math.sin(angle)
            if (!isDynamic) {
              node.fx = node.x
              node.fy = node.y
            }
          })
          break
          
        case 'matrix':
          // Layout matriz agrupado por tipo
          const typeGroups = {}
          nodes.forEach(node => {
            if (!typeGroups[node.type]) typeGroups[node.type] = []
            typeGroups[node.type].push(node)
          })
          
          const typeCount = Object.keys(typeGroups).length
          const maxGroupSize = Math.max(...Object.values(typeGroups).map(g => g.length))
          const cellSize = Math.min(
            (width - 100) / typeCount,
            (height - 100) / Math.ceil(Math.sqrt(maxGroupSize))
          )
          
          let typeIndex = 0
          Object.entries(typeGroups).forEach(([type, typeNodes]) => {
            const groupCols = Math.ceil(Math.sqrt(typeNodes.length))
            const groupStartX = 50 + typeIndex * ((width - 100) / typeCount)
            
            typeNodes.forEach((node, i) => {
              const row = Math.floor(i / groupCols)
              const col = i % groupCols
              node.x = groupStartX + col * cellSize * 0.8 + cellSize/2
              node.y = 50 + row * cellSize * 0.8 + cellSize/2
              if (!isDynamic) {
                node.fx = node.x
                node.fy = node.y
              }
            })
            typeIndex++
          })
          break
          
        case 'layered':
          // Layout em camadas (baseado em dependências)
          const layeredLayers = {}
          const layeredVisited = new Set()
          
          // Função para calcular camada de cada nó
          const calculateLayer = (nodeId, depth = 0) => {
            if (layeredVisited.has(nodeId)) return
            layeredVisited.add(nodeId)
            
            layeredLayers[nodeId] = Math.max(layeredLayers[nodeId] || 0, depth)
            
            links.forEach(link => {
              const sourceId = typeof link.source === 'object' ? link.source.id : link.source
              const targetId = typeof link.target === 'object' ? link.target.id : link.target
              
              if (sourceId === nodeId) {
                calculateLayer(targetId, depth + 1)
              }
            })
          }
          
          // Calcular camadas para todos os nós
          nodes.forEach(node => calculateLayer(node.id))
          
          // Contar nós por camada
          const layerCounts = {}
          Object.values(layeredLayers).forEach(layer => {
            layerCounts[layer] = (layerCounts[layer] || 0) + 1
          })
          
          // Posicionar nós
          const layerIndices = {}
          const maxLayer = Math.max(...Object.values(layeredLayers))
          const layerHeight = (height - 100) / (maxLayer + 1)
          
          nodes.forEach(node => {
            const layer = layeredLayers[node.id] || 0
            layerIndices[layer] = (layerIndices[layer] || 0) + 1
            const layerWidth = width - 100
            const nodesInLayer = layerCounts[layer]
            const xOffset = layerWidth / (nodesInLayer + 1)
            
            node.x = 50 + layerIndices[layer] * xOffset
            node.y = 50 + layer * layerHeight
            if (!isDynamic) {
              node.fx = node.x
              node.fy = node.y
            }
          })
          break
      }
    }

    // Configurar simulação de força
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))

    // Aplicar layout
    applyLayout(data.nodes, data.links, layout)
    
    // Controlar simulação baseado no layout e modo dinâmico
    if (layout === 'force' && isDynamic) {
      simulation.alpha(1).restart()
    } else {
      simulation.stop()
      // Forçar atualização das posições para layouts estáticos
      data.nodes.forEach(d => {
        if (d.fx !== undefined) d.x = d.fx
        if (d.fy !== undefined) d.y = d.fy
      })
    }

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.05, 20]) // Limite muito maior para permitir ver grafos grandes
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        setZoomLevel(event.transform.k)
        
        // Atualizar viewport para o minimap
        setViewport({
          x: -event.transform.x / event.transform.k,
          y: -event.transform.y / event.transform.k,
          k: event.transform.k,
          width: width,
          height: height
        })
      })

    svg.call(zoom)
    
    // Armazenar referência do zoom para reset
    svg.node().__zoom = zoom

    // Criar links
    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('class', d => `link ${d.type}`)
      .attr('marker-end', d => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source
        const targetId = typeof d.target === 'object' ? d.target.id : d.target
        
        if (showCriticalPath && 
            criticalPath.includes(sourceId) && 
            criticalPath.includes(targetId)) {
          const sourceIndex = criticalPath.indexOf(sourceId)
          const targetIndex = criticalPath.indexOf(targetId)
          if (targetIndex === sourceIndex + 1) {
            return 'url(#arrow-critical)'
          }
        }
        return `url(#arrow-${d.type})`
      })
      .style('stroke', d => {
        // Destacar links no caminho crítico
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source
        const targetId = typeof d.target === 'object' ? d.target.id : d.target
        
        if (showCriticalPath && 
            criticalPath.includes(sourceId) && 
            criticalPath.includes(targetId)) {
          const sourceIndex = criticalPath.indexOf(sourceId)
          const targetIndex = criticalPath.indexOf(targetId)
          if (targetIndex === sourceIndex + 1) {
            return '#ef4444'
          }
        }
        
        const colors = {
          'execution': '#10b981',
          'data-flow': '#2563eb',
          'dependency': '#666'
        }
        return colors[d.type] || '#666'
      })
      .style('stroke-width', d => {
        // Aumentar espessura dos links críticos
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source
        const targetId = typeof d.target === 'object' ? d.target.id : d.target
        
        if (showCriticalPath && 
            criticalPath.includes(sourceId) && 
            criticalPath.includes(targetId)) {
          const sourceIndex = criticalPath.indexOf(sourceId)
          const targetIndex = criticalPath.indexOf(targetId)
          if (targetIndex === sourceIndex + 1) {
            return 3
          }
        }
        return 1.5
      })
      .classed('critical-path', d => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source
        const targetId = typeof d.target === 'object' ? d.target.id : d.target
        
        if (showCriticalPath && 
            criticalPath.includes(sourceId) && 
            criticalPath.includes(targetId)) {
          const sourceIndex = criticalPath.indexOf(sourceId)
          const targetIndex = criticalPath.indexOf(targetId)
          return targetIndex === sourceIndex + 1
        }
        return false
      })

    // Criar nós
    const node = g.append('g')
      .selectAll('.node')
      .data(data.nodes)
      .enter().append('g')
      .attr('class', d => `node ${d.type}`)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    // Adicionar círculos aos nós
    node.append('circle')
      .attr('r', 20)
      .style('stroke', d => {
        // Destacar nós no caminho crítico
        if (showCriticalPath && criticalPath.includes(d.id)) {
          return '#ef4444'
        }
        return null
      })
      .style('stroke-width', d => {
        if (showCriticalPath && criticalPath.includes(d.id)) {
          return 3
        }
        return 1
      })
      .classed('critical-path', d => showCriticalPath && criticalPath.includes(d.id))

    // Adicionar labels
    node.append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .style('fill', d => {
        if (showCriticalPath && criticalPath.includes(d.id)) {
          return '#ef4444'
        }
        return '#ccc'
      })
      .style('font-size', '12px')
      .style('font-weight', d => {
        if (showCriticalPath && criticalPath.includes(d.id)) {
          return 'bold'
        }
        return 'normal'
      })

    // Adicionar tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'dag-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('border', '1px solid var(--border-color)')
      .style('border-radius', '6px')
      .style('color', 'white')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')

    // Eventos
    node
      .on('click', function(event, d) {
        setSelectedNode(d)
      })
      .on('mouseover', function(event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', .9)
        
        let content = `<strong>${d.label}</strong><br/>`
        content += `Tipo: ${d.type}<br/>`
        
        if (d.metrics) {
          content += `CPU: ${d.metrics.cpu}%<br/>`
          content += `Memória: ${d.metrics.memory}%<br/>`
          content += `Chamadas: ${d.metrics.calls}<br/>`
        }
        
        if (showCriticalPath && criticalPath.includes(d.id)) {
          const position = criticalPath.indexOf(d.id) + 1
          content += `<br/><span style="color: #ef4444; font-weight: bold;">⚠ Caminho Crítico (Posição ${position}/${criticalPath.length})</span>`
        }
        
        tooltip.html(content)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function(d) {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0)
      })

    // Atualizar simulação
    if (layout === 'force' && isDynamic) {
      simulation.on('tick', ticked)
    } else {
      // Para layouts estáticos, renderizar uma única vez
      ticked()
    }

    function ticked() {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node
        .attr('transform', d => `translate(${d.x},${d.y})`)
    }

    // Funções de drag
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Aplicar filtros
    if (filter !== 'all') {
      node.style('opacity', d => d.type === filter ? 1 : 0.1)
      link.style('opacity', d => 
        (d.source.type === filter || d.target.type === filter) ? 0.6 : 0.1
      )
    }

    // Limpar ao desmontar
    return () => {
      simulation.stop()
      d3.selectAll('.dag-tooltip').remove()
    }
  }, [filter, layout, graphData, activeFilters, showCriticalPath, isDynamic, criticalPath, zoomLevel])

  // Simular métricas em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.round(Math.random() * 30 + 40),
        memory: Math.round(Math.random() * 20 + 50),
        throughput: Math.round(Math.random() * 25 + 65)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleResetView = useCallback(() => {
    if (!svgRef.current) return
    
    const svg = d3.select(svgRef.current)
    const container = svgRef.current.parentElement
    const width = container.clientWidth
    const height = container.clientHeight
    
    // Resetar zoom e pan
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        svg.select('g').attr('transform', event.transform)
      })
    
    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity)
    
    // Resetar filtros
    setFilter('all')
    setShowCriticalPath(false)
    setActiveFilters({})
    
    // Se estiver em layout force, reativar simulação
    if (layout === 'force') {
      const data = graphData || mockData
      const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(40))
        .alpha(1)
        .restart()
    }
    
    // Resetar seleção
    setSelectedNode(null)
    
    // Resetar viewport do minimap
    setViewport({
      x: 0,
      y: 0,
      k: 1,
      width: width,
      height: height
    })
  }, [graphData, layout])

  return (
    <div className="dag-view">
      <div className="dag-sidebar">
        <h2>DAG Visualizer</h2>
        
        {!showUpload && (
          <button 
            className="upload-button-sidebar"
            onClick={() => {
              setShowUpload(true)
              setGraphData(null)
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Fazer Upload de Arquivos
          </button>
        )}
        
        <div className="info-panel">
          <h3>Informações do Grafo</h3>
          <div className="info-item">
            <div className="info-label">Total de Nós</div>
            <div className="info-value">{graphData ? graphData.nodes.length : mockData.nodes.length}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Total de Arestas</div>
            <div className="info-value">{graphData ? graphData.links.length : mockData.links.length}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Nó Selecionado</div>
            <div className="info-value">{selectedNode ? selectedNode.label : 'Nenhum'}</div>
          </div>
          {showCriticalPath && criticalPath.length > 0 && (
            <div className="info-item" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div className="info-label">Caminho Crítico</div>
              <div className="info-value" style={{ fontSize: '14px', marginTop: '8px' }}>
                {criticalPath.length} nós
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {criticalPath.slice(0, 3).join(' → ')}
                  {criticalPath.length > 3 && ' → ...'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="metrics">
          <h3>Métricas em Tempo Real</h3>
          <div className="metric-bar">
            <div className="metric-bar-label">CPU</div>
            <div className="metric-bar-container">
              <div className="metric-bar-fill" style={{ width: `${metrics.cpu}%` }}>
                <div className="metric-bar-value">{metrics.cpu}%</div>
              </div>
            </div>
          </div>
          <div className="metric-bar">
            <div className="metric-bar-label">Memória</div>
            <div className="metric-bar-container">
              <div className="metric-bar-fill" style={{ width: `${metrics.memory}%` }}>
                <div className="metric-bar-value">{metrics.memory}%</div>
              </div>
            </div>
          </div>
          <div className="metric-bar">
            <div className="metric-bar-label">Throughput</div>
            <div className="metric-bar-container">
              <div className="metric-bar-fill" style={{ width: `${metrics.throughput}%` }}>
                <div className="metric-bar-value">{metrics.throughput}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dag-main">
        {showUpload ? (
          <FileUpload onFilesAnalyzed={handleFilesAnalyzed} />
        ) : viewMode === '3d' ? (
          <Suspense fallback={
            <div className="dag-3d-loading">
              <div className="spinner"></div>
              <p>Carregando visualização 3D...</p>
            </div>
          }>
            <DAG3DView
              data={graphData || mockData}
              selectedNode={selectedNode}
              onNodeSelect={setSelectedNode}
              showCriticalPath={showCriticalPath}
              criticalPath={criticalPath}
              layout={layout}
            />
            <button 
              className="back-to-2d"
              onClick={() => setViewMode('2d')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Voltar para 2D
            </button>
            <div className="mode-indicator-3d">
              Modo 3D Ativo
            </div>
          </Suspense>
        ) : (
          <>
            <div className={`dag-graph-container ${showCriticalPath ? 'show-critical' : ''}`}>
              <svg ref={svgRef}></svg>
              
              {/* Indicador de Zoom */}
              <div className="zoom-indicator">
                Zoom: <strong>{Math.round(zoomLevel * 100)}%</strong>
                {showCriticalPath && criticalPath.length > 0 && (
                  <span style={{ marginLeft: '10px', color: '#ef4444' }}>
                    • Caminho Crítico: {criticalPath.length} nós
                  </span>
                )}
                {selectedNode && (
                  <span style={{ marginLeft: '10px', color: 'var(--accent-blue)' }}>
                    • Selecionado: {selectedNode.label}
                  </span>
                )}
              </div>
              
              {/* MiniMap */}
              {showMiniMap && (graphData || mockData) && (
                <MiniMap 
                  nodes={(graphData || mockData).nodes} 
                  links={(graphData || mockData).links}
                  mainViewport={viewport}
                  onViewportChange={(newViewport) => {
                    // Aplicar nova posição do viewport
                    const svg = d3.select(svgRef.current)
                    const zoom = svg.node().__zoom
                    if (!zoom) return
                    
                    const transform = d3.zoomIdentity
                      .translate(svgRef.current.clientWidth / 2, svgRef.current.clientHeight / 2)
                      .scale(viewport.k || 1)
                      .translate(-newViewport.x, -newViewport.y)
                    
                    if (newViewport.animated) {
                      svg.transition()
                        .duration(750)
                        .call(zoom.transform, transform)
                    } else {
                      svg.call(zoom.transform, transform)
                    }
                  }}
                />
              )}
            </div>

            {/* Painel de Filtros */}
            {showFilters && (
              <div className="filter-panel-container">
                <FilterPanel
                  nodes={graphData?.nodes || mockData.nodes}
                  links={graphData?.links || mockData.links}
                  onFilterChange={handleFilterChange}
                  onNodeSelect={(nodeId) => {
                    const node = (graphData || mockData).nodes.find(n => n.id === nodeId)
                    if (node) {
                      setSelectedNode(node)
                      zoomToNode(nodeId)
                    }
                  }}
                />
              </div>
            )}
          </>
        )}
        
        <div className="dag-controls">
          {/* Controles de Navegação Rápida */}
          <div className="quick-nav">
            <button
              className="nav-btn adjust-view-btn"
              onClick={() => {
                const svg = d3.select(svgRef.current)
                const zoom = svg.node().__zoom
                if (!zoom) return
                
                // Aguardar um momento para garantir que os nós tenham posições
                setTimeout(() => {
                  const nodes = graphData?.nodes || mockData.nodes
                  if (!nodes || nodes.length === 0) return
                  
                  // Verificar se os nós têm posições válidas
                  const validNodes = nodes.filter(n => n.x !== undefined && n.y !== undefined)
                  if (validNodes.length === 0) return
                  
                  const padding = 50
                  const bounds = {
                    minX: Math.min(...validNodes.map(n => n.x)) - padding,
                    maxX: Math.max(...validNodes.map(n => n.x)) + padding,
                    minY: Math.min(...validNodes.map(n => n.y)) - padding,
                    maxY: Math.max(...validNodes.map(n => n.y)) + padding
                  }
                  
                  const width = svgRef.current.clientWidth
                  const height = svgRef.current.clientHeight
                  const dx = bounds.maxX - bounds.minX
                  const dy = bounds.maxY - bounds.minY
                  // Reduzir mais o scale para grafos grandes
                  const scale = Math.min(width / dx, height / dy) * 0.8
                  const cx = (bounds.minX + bounds.maxX) / 2
                  const cy = (bounds.minY + bounds.maxY) / 2
                  
                  svg.transition()
                    .duration(750)
                    .call(
                      zoom.transform,
                      d3.zoomIdentity
                        .translate(width / 2, height / 2)
                        .scale(scale)
                        .translate(-cx, -cy)
                    )
                }, 100)
              }}
              title="Ajustar para ver todos os nós"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M15 3v18M9 3v18M3 15h18M3 9h18"/>
              </svg>
              Ver Tudo
            </button>
            
            {showCriticalPath && criticalPath.length > 0 && (
              <button
                className="nav-btn critical"
                onClick={() => {
                  const svg = d3.select(svgRef.current)
                  const zoom = svg.node().__zoom
                  if (!zoom) return
                  
                  // Aguardar um momento para garantir que os nós tenham posições
                  setTimeout(() => {
                    const nodes = graphData?.nodes || mockData.nodes
                    const criticalNodes = nodes.filter(n => criticalPath.includes(n.id) && n.x !== undefined && n.y !== undefined)
                    if (criticalNodes.length === 0) return
                    
                    const padding = 100
                    const bounds = {
                      minX: Math.min(...criticalNodes.map(n => n.x)) - padding,
                      maxX: Math.max(...criticalNodes.map(n => n.x)) + padding,
                      minY: Math.min(...criticalNodes.map(n => n.y)) - padding,
                      maxY: Math.max(...criticalNodes.map(n => n.y)) + padding
                    }
                    
                    const width = svgRef.current.clientWidth
                    const height = svgRef.current.clientHeight
                    const dx = bounds.maxX - bounds.minX
                    const dy = bounds.maxY - bounds.minY
                    // Ajustar scale para caminho crítico
                    const scale = Math.min(width / dx, height / dy) * 0.7
                    const cx = (bounds.minX + bounds.maxX) / 2
                    const cy = (bounds.minY + bounds.maxY) / 2
                    
                    svg.transition()
                      .duration(750)
                      .call(
                        zoom.transform,
                        d3.zoomIdentity
                          .translate(width / 2, height / 2)
                          .scale(scale)
                          .translate(-cx, -cy)
                      )
                  }, 100)
                }}
                title="Focar no caminho crítico"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                Focar Caminho
              </button>
            )}
          </div>

          <div className="control-row">
            <div className="control-group">
              <label>Layout</label>
              <select value={layout} onChange={(e) => {
                setLayout(e.target.value)
                // Liberar nós se voltar para force
                if (e.target.value === 'force') {
                  setIsDynamic(true)
                }
                // Ajustar zoom automaticamente após mudar layout
                setTimeout(() => {
                  const btn = document.querySelector('.nav-btn')
                  if (btn) btn.click()
                }, 500)
              }}>
                <option value="force">Force Directed</option>
                <option value="radial">Radial</option>
                <option value="hierarchical">Hierárquico</option>
                <option value="tree">Árvore</option>
                <option value="circular">Circular</option>
                <option value="matrix">Matriz</option>
                <option value="layered">Em Camadas</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Modo de Visualização</label>
              <div className="toggle-buttons">
                <button 
                  className={`toggle-btn ${viewMode === '2d' ? 'active' : ''}`}
                  onClick={() => setViewMode('2d')}
                >
                  2D
                </button>
                <button 
                  className={`toggle-btn ${viewMode === '3d' ? 'active' : ''}`}
                  onClick={() => setViewMode('3d')}
                >
                  3D
                </button>
              </div>
            </div>
          </div>

          <div className="control-row">
            <div className="control-group">
              <label className="checkbox-control">
                <input 
                  type="checkbox" 
                  checked={showFilters}
                  onChange={(e) => setShowFilters(e.target.checked)}
                />
                <span>Filtros Avançados</span>
              </label>
            </div>
            
            <div className="control-group">
              <label className="checkbox-control">
                <input 
                  type="checkbox" 
                  checked={showMiniMap}
                  onChange={(e) => setShowMiniMap(e.target.checked)}
                />
                <span>Mini Mapa</span>
              </label>
            </div>
            
            <div className="control-group">
              <label className="checkbox-control">
                <input 
                  type="checkbox" 
                  checked={showCriticalPath}
                  onChange={(e) => setShowCriticalPath(e.target.checked)}
                />
                <span>Caminho Crítico</span>
              </label>
            </div>
            
            <div className="control-group">
              <label className="checkbox-control">
                <input 
                  type="checkbox" 
                  checked={isDynamic}
                  onChange={(e) => setIsDynamic(e.target.checked)}
                />
                <span>Modo Dinâmico</span>
              </label>
            </div>
          </div>

          <div className="control-row">
            <div className="control-group">
              <label>Zoom</label>
              <div className="zoom-controls">
                <button 
                  className="zoom-btn"
                  onClick={() => {
                    if (!svgRef.current) return
                    const svg = d3.select(svgRef.current)
                    
                    // Obter transform atual
                    const currentTransform = d3.zoomTransform(svg.node())
                    const newK = Math.max(0.05, currentTransform.k * 0.8)
                    
                    const zoom = d3.zoom()
                      .scaleExtent([0.05, 20])
                      .on('zoom', (event) => {
                        svg.select('g').attr('transform', event.transform)
                        setZoomLevel(event.transform.k)
                        setViewport({
                          x: -event.transform.x / event.transform.k,
                          y: -event.transform.y / event.transform.k,
                          k: event.transform.k,
                          width: svgRef.current.clientWidth,
                          height: svgRef.current.clientHeight
                        })
                      })
                    
                    svg.transition()
                      .duration(300)
                      .call(
                        zoom.transform,
                        d3.zoomIdentity
                          .translate(currentTransform.x, currentTransform.y)
                          .scale(newK)
                      )
                  }}
                  title="Diminuir zoom"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35M8 11h6"/>
                  </svg>
                </button>
                <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  className="zoom-btn"
                  onClick={() => {
                    if (!svgRef.current) return
                    const svg = d3.select(svgRef.current)
                    
                    // Obter transform atual
                    const currentTransform = d3.zoomTransform(svg.node())
                    const newK = Math.min(20, currentTransform.k * 1.25)
                    
                    const zoom = d3.zoom()
                      .scaleExtent([0.05, 20])
                      .on('zoom', (event) => {
                        svg.select('g').attr('transform', event.transform)
                        setZoomLevel(event.transform.k)
                        setViewport({
                          x: -event.transform.x / event.transform.k,
                          y: -event.transform.y / event.transform.k,
                          k: event.transform.k,
                          width: svgRef.current.clientWidth,
                          height: svgRef.current.clientHeight
                        })
                      })
                    
                    svg.transition()
                      .duration(300)
                      .call(
                        zoom.transform,
                        d3.zoomIdentity
                          .translate(currentTransform.x, currentTransform.y)
                          .scale(newK)
                      )
                  }}
                  title="Aumentar zoom"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="control-row">
            <div className="control-group">
              <button 
                onClick={handleResetView}
                title="Resetar zoom, pan, filtros e seleções"
                className="reset-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M8 16H3v5"/>
                </svg>
                Resetar
              </button>
            </div>
            <div className="control-group">
              <button 
                onClick={() => {
                  setShowUpload(true)
                  setGraphData(null)
                  setSelectedNode(null)
                  setCriticalPath([])
                  setActiveFilters({})
                  setShowCriticalPath(false)
                  setShowFilters(false)
                  setShowMiniMap(false)
                }}
                title="Fazer upload de novos arquivos"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                Novo Upload
              </button>
            </div>
          </div>
        </div>

        <div className="dag-legend">
          <h4>Legenda</h4>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#2563eb' }}></div>
            <span>Arquivo</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#10b981' }}></div>
            <span>Função</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#f59e0b' }}></div>
            <span>Classe</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#ef4444' }}></div>
            <span>Agente</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#8b5cf6' }}></div>
            <span>War Room</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#06b6d4' }}></div>
            <span>Módulo</span>
          </div>
          {showCriticalPath && (
            <>
              <div style={{ margin: '15px 0', borderTop: '1px solid var(--border-color)' }}></div>
              <div className="legend-item">
                <div className="legend-color" style={{ 
                  background: '#ef4444',
                  animation: 'criticalPulse 2s ease-in-out infinite'
                }}></div>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Caminho Crítico</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DAGView