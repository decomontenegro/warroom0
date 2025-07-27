import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import './AgentNetworkMap.css'
import './AgentNetworkMapLiqi.css'

function AgentNetworkMap({ 
  agents, 
  activeConnections = [], 
  expanded = false, 
  onExpand,
  onClose,
  currentPhase = 0 
}) {
  const svgRef = useRef(null)
  const simulationRef = useRef(null)
  const animationRef = useRef(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 })
  const [layout, setLayout] = useState('force')
  const [isDynamic, setIsDynamic] = useState(true)
  
  // Atualizar dimensões baseado no modo expandido
  useEffect(() => {
    if (expanded) {
      setDimensions({ 
        width: window.innerWidth * 0.8, 
        height: window.innerHeight * 0.8 
      })
    } else {
      setDimensions({ width: 300, height: 300 })
    }
  }, [expanded])

  useEffect(() => {
    if (!svgRef.current || !agents || agents.length === 0) return

    const { width, height } = dimensions
    const centerX = width / 2
    const centerY = height / 2
    
    // Limpar SVG e parar simulação/animação anterior
    d3.select(svgRef.current).selectAll('*').remove()
    if (simulationRef.current) {
      simulationRef.current.stop()
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Adicionar definições para gradientes e filtros
    const defs = svg.append('defs')
    
    // Gradiente para conexões ativas
    const gradient = defs.append('linearGradient')
      .attr('id', 'connectionGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%')
    
    gradient.append('stop')
      .attr('offset', '0%')
      .style('stop-color', '#3b82f6')
      .style('stop-opacity', 0.2)
    
    gradient.append('stop')
      .attr('offset', '50%')
      .style('stop-color', '#3b82f6')
      .style('stop-opacity', 1)
    
    gradient.append('stop')
      .attr('offset', '100%')
      .style('stop-color', '#3b82f6')
      .style('stop-opacity', 0.2)

    // Filtro de glow
    const filter = defs.append('filter')
      .attr('id', 'glow')
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur')
    
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Preparar dados dos nós
    const nodes = [
      {
        id: 'orchestrator',
        label: 'Orquestrador',
        type: 'central',
        x: centerX,
        y: centerY - 30,
        color: '#8b5cf6',
        radius: expanded ? 20 : 12,
        fx: centerX,
        fy: centerY - 30
      },
      {
        id: 'chief',
        label: 'Chief Strategy Officer',
        type: 'central',
        x: centerX,
        y: centerY + 30,
        color: '#ffc107',
        radius: expanded ? 20 : 12,
        fx: centerX,
        fy: centerY + 30
      }
    ]

    // Aplicar layout aos agentes
    const applyLayout = () => {
      switch(layout) {
        case 'radial': {
          const radialRadius = expanded ? Math.min(width, height) * 0.35 : 100
          const layers = {
            0: agents.slice(0, 20),   // Camada interna
            1: agents.slice(20, 50),  // Camada média
            2: agents.slice(50)       // Camada externa
          }
          
          Object.entries(layers).forEach(([layerIndex, layerAgents]) => {
            const layerRadiusBase = radialRadius * (0.4 + parseInt(layerIndex) * 0.3)
            layerAgents.forEach((agent, i) => {
              const angle = (i / layerAgents.length) * 2 * Math.PI - Math.PI / 2
              const x = centerX + layerRadiusBase * Math.cos(angle)
              const y = centerY + layerRadiusBase * Math.sin(angle)
              nodes.push({
                id: agent.id,
                label: agent.name,
                type: agent.category || 'agent',
                x: x,
                y: y,
                color: getAgentColor(agent),
                radius: expanded ? 8 : 4,
                agent: agent,
                // Dados para animação
                layerIndex: parseInt(layerIndex),
                angleIndex: i,
                totalInLayer: layerAgents.length,
                baseRadius: layerRadiusBase
              })
            })
          })
          break
        }
        
        case 'hierarchical': {
          const levels = {
            1: agents.slice(0, 10),   // Nível 1
            2: agents.slice(10, 30),  // Nível 2
            3: agents.slice(30, 60),  // Nível 3
            4: agents.slice(60)       // Nível 4
          }
          
          const levelHeight = height / (Object.keys(levels).length + 2)
          
          Object.entries(levels).forEach(([level, levelAgents]) => {
            const levelY = levelHeight * (parseInt(level) + 1)
            const levelWidth = width / (levelAgents.length + 1)
            
            levelAgents.forEach((agent, i) => {
              const x = (i + 1) * levelWidth
              const y = levelY
              nodes.push({
                id: agent.id,
                label: agent.name,
                type: agent.category || 'agent',
                x: x,
                y: y,
                color: getAgentColor(agent),
                radius: expanded ? 8 : 4,
                agent: agent,
                // Dados para animação
                level: parseInt(level),
                indexInLevel: i,
                baseX: x,
                baseY: y
              })
            })
          })
          break
        }
        
        case 'circular': {
          const circleRadius = Math.min(width, height) * 0.4
          agents.forEach((agent, i) => {
            const angle = (i / agents.length) * 2 * Math.PI
            const x = centerX + circleRadius * Math.cos(angle)
            const y = centerY + circleRadius * Math.sin(angle)
            nodes.push({
              id: agent.id,
              label: agent.name,
              type: agent.category || 'agent',
              x: x,
              y: y,
              color: getAgentColor(agent),
              radius: expanded ? 8 : 4,
              agent: agent,
              // Dados para animação
              angleIndex: i,
              totalNodes: agents.length,
              baseAngle: angle,
              baseRadius: circleRadius
            })
          })
          break
        }
        
        default: // force layout
          const agentRadius = expanded ? Math.min(width, height) * 0.35 : 100
          agents.forEach((agent, i) => {
            const angle = (i / agents.length) * 2 * Math.PI - Math.PI / 2
            nodes.push({
              id: agent.id,
              label: agent.name,
              type: agent.category || 'agent',
              x: centerX + agentRadius * Math.cos(angle),
              y: centerY + agentRadius * Math.sin(angle),
              color: getAgentColor(agent),
              radius: expanded ? 8 : 4,
              agent: agent
            })
          })
      }
    }
    
    applyLayout()

    // Criar links base
    const links = []
    agents.forEach(agent => {
      links.push({
        source: agent.id,
        target: 'orchestrator',
        active: false
      })
      links.push({
        source: agent.id,
        target: 'chief',
        active: false
      })
    })

    // Adicionar grupo para zoom/pan
    const g = svg.append('g')
    
    // Configurar simulação de força
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(expanded ? 150 : 50))
      .force('charge', d3.forceManyBody().strength(expanded ? -300 : -100))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide().radius(d => d.radius + 5))
    
    simulationRef.current = simulation

    // Renderizar links
    const linkGroup = g.append('g').attr('class', 'links')
    
    const linkElements = linkGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.1)
      .attr('class', 'network-link')

    // Renderizar nós
    const nodeGroup = g.append('g').attr('class', 'nodes')
    
    const nodeElements = nodeGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )
      .on('mouseenter', function(event, d) {
        setHoveredNode(d)
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.radius * 1.5)
          .attr('filter', 'url(#glow)')
      })
      .on('mouseleave', function(event, d) {
        setHoveredNode(null)
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.radius)
          .attr('filter', d.type === 'central' ? 'url(#glow)' : null)
      })

    // Adicionar círculos aos nós
    nodeElements.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('filter', d => d.type === 'central' ? 'url(#glow)' : null)
      .attr('opacity', 0.9)

    // Adicionar labels
    if (expanded) {
      nodeElements.append('text')
        .text(d => d.label.split(' ')[0])
        .attr('text-anchor', 'middle')
        .attr('dy', d => d.radius + 15)
        .attr('font-size', '10px')
        .attr('fill', '#ccc')
        .attr('opacity', 0.8)
    }

    // Configurar comportamento baseado no layout
    if (layout === 'force' && isDynamic) {
      // Força dinâmica
      simulation.alpha(1).restart()
      
      simulation.on('tick', () => {
        linkElements
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

        nodeElements
          .attr('transform', d => `translate(${d.x}, ${d.y})`)
      })
    } else {
      // Parar simulação para outros layouts
      simulation.stop()
      
      // Posicionar links inicialmente
      linkElements
        .attr('x1', d => {
          const sourceNode = nodes.find(n => n.id === d.source)
          return sourceNode ? sourceNode.x : 0
        })
        .attr('y1', d => {
          const sourceNode = nodes.find(n => n.id === d.source)
          return sourceNode ? sourceNode.y : 0
        })
        .attr('x2', d => {
          const targetNode = nodes.find(n => n.id === d.target)
          return targetNode ? targetNode.x : 0
        })
        .attr('y2', d => {
          const targetNode = nodes.find(n => n.id === d.target)
          return targetNode ? targetNode.y : 0
        })
      
      // Se dinâmico e não-force, animar
      if (isDynamic && layout !== 'force') {
        const animate = () => {
          nodes.forEach((d, i) => {
            if (d.type === 'central') return
            
            switch(layout) {
              case 'radial':
                if (d.baseRadius !== undefined) {
                  const radiusVariation = Math.sin(Date.now() * 0.001 + i * 0.5) * 10
                  const radius = d.baseRadius + radiusVariation
                  const rotationSpeed = 0.0002 * (d.layerIndex + 1)
                  const angle = (d.angleIndex / d.totalInLayer) * 2 * Math.PI - Math.PI / 2 + (Date.now() * rotationSpeed)
                  d.x = centerX + radius * Math.cos(angle)
                  d.y = centerY + radius * Math.sin(angle)
                }
                break
              
              case 'hierarchical':
                if (d.baseX !== undefined && d.baseY !== undefined) {
                  const waveAmplitude = 15
                  const waveOffset = Math.sin(Date.now() * 0.001 + d.indexInLevel * 0.5) * waveAmplitude
                  const floatOffset = Math.sin(Date.now() * 0.002 + d.level * Math.PI / 2) * 5
                  d.x = d.baseX + waveOffset
                  d.y = d.baseY + floatOffset
                }
                break
              
              case 'circular':
                if (d.baseRadius !== undefined && d.baseAngle !== undefined) {
                  const pulseAmplitude = 20
                  const radiusPulse = Math.sin(Date.now() * 0.001 + d.angleIndex * 0.1) * pulseAmplitude
                  const rotationSpeed = 0.0003
                  const rotatedAngle = d.baseAngle + (Date.now() * rotationSpeed)
                  const circleRadius = d.baseRadius + radiusPulse
                  d.x = centerX + circleRadius * Math.cos(rotatedAngle)
                  d.y = centerY + circleRadius * Math.sin(rotatedAngle)
                }
                break
            }
          })
          
          // Atualizar posições
          nodeElements.attr('transform', d => `translate(${d.x}, ${d.y})`)
          
          linkElements
            .attr('x1', d => {
              const sourceNode = nodes.find(n => n.id === (d.source.id || d.source))
              return sourceNode ? sourceNode.x : 0
            })
            .attr('y1', d => {
              const sourceNode = nodes.find(n => n.id === (d.source.id || d.source))
              return sourceNode ? sourceNode.y : 0
            })
            .attr('x2', d => {
              const targetNode = nodes.find(n => n.id === (d.target.id || d.target))
              return targetNode ? targetNode.x : 0
            })
            .attr('y2', d => {
              const targetNode = nodes.find(n => n.id === (d.target.id || d.target))
              return targetNode ? targetNode.y : 0
            })
          
          animationRef.current = requestAnimationFrame(animate)
        }
        animate()
      }
    }

    // Adicionar zoom/pan no modo expandido
    if (expanded) {
      const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
        })
      
      svg.call(zoom)
    }
    
    // Funções de drag
    function dragstarted(event, d) {
      if (!event.active && isDynamic && layout === 'force') simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
      d.x = event.x
      d.y = event.y
      d3.select(this).attr('transform', `translate(${d.x}, ${d.y})`)
    }

    function dragended(event, d) {
      if (!event.active && isDynamic && layout === 'force') simulation.alphaTarget(0)
      if (isDynamic && layout === 'force') {
        d.fx = null
        d.fy = null
      }
    }

    // Limpar ao desmontar
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

  }, [agents, activeConnections, dimensions, expanded, layout, isDynamic])

  // Função para obter cor do agente baseado no tipo
  const getAgentColor = (agent) => {
    const colors = {
      'architecture': '#2563eb',
      'frontend': '#3b82f6',
      'backend': '#10b981',
      'security': '#ef4444',
      'database': '#f59e0b',
      'devops': '#06b6d4',
      'ai': '#8b5cf6',
      'business': '#ec4899',
      'design': '#f97316',
      'quality': '#84cc16'
    }
    
    const agentInfo = (agent.name + ' ' + agent.role).toLowerCase()
    for (const [key, color] of Object.entries(colors)) {
      if (agentInfo.includes(key)) return color
    }
    
    return '#6b7280'
  }

  return (
    <div className={`agent-network-map ${expanded ? 'expanded' : 'mini'}`} data-layout={layout}>
      {!expanded && (
        <>
          <div className="network-header">
            <div>
              <span className="network-title">🗺️ Rede Neural</span>
              {activeConnections.length > 0 && (
                <span className="active-count">{activeConnections.length} ativos</span>
              )}
              {layout !== 'force' && isDynamic && (
                <span className="dynamic-indicator" title="Animação ativa">✨</span>
              )}
            </div>
            <button 
              className="expand-btn"
              onClick={onExpand}
              title="Expandir visualização"
            >
              ⤢
            </button>
          </div>
          <div className="mini-controls">
            <select 
              value={layout} 
              onChange={(e) => {
                const newLayout = e.target.value
                setLayout(newLayout)
                if (newLayout !== 'force') {
                  setIsDynamic(true)
                }
              }}
              className="mini-layout-select"
              title="Mudar layout"
            >
              <option value="force">🌐</option>
              <option value="radial">⭕</option>
              <option value="hierarchical">📋</option>
              <option value="circular">🔄</option>
            </select>
            <label className="mini-dynamic-toggle" title="Animação">
              <input 
                type="checkbox" 
                checked={isDynamic} 
                onChange={(e) => setIsDynamic(e.target.checked)}
              />
              <span>✨</span>
            </label>
          </div>
        </>
      )}
      
      {expanded && (
        <div className="network-controls">
          <div className="network-info">
            <h3>Rede Neural de Especialistas</h3>
            <p>Fase {currentPhase}/6 • {agents.length} agentes conectados</p>
          </div>
          <div className="layout-controls">
            <select 
              value={layout} 
              onChange={(e) => {
                const newLayout = e.target.value
                setLayout(newLayout)
                if (newLayout !== 'force') {
                  setIsDynamic(true)
                }
              }}
              className="layout-select"
            >
              <option value="force">🌐 Force Directed</option>
              <option value="radial">⭕ Radial</option>
              <option value="hierarchical">📋 Hierárquico</option>
              <option value="circular">🔄 Circular</option>
            </select>
            <label className="dynamic-toggle">
              <input 
                type="checkbox" 
                checked={isDynamic} 
                onChange={(e) => setIsDynamic(e.target.checked)}
              />
              <span>Dinâmico</span>
            </label>
          </div>
          {onClose && (
            <button 
              className="close-btn"
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
      )}
      
      <svg ref={svgRef} className="network-svg"></svg>
      
      {hoveredNode && !expanded && (
        <div className="node-tooltip" style={{
          left: hoveredNode.x + 10,
          top: hoveredNode.y - 20
        }}>
          <strong>{hoveredNode.label}</strong>
          {hoveredNode.agent && (
            <>
              <br />
              <span className="tooltip-role">{hoveredNode.agent.role}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AgentNetworkMap