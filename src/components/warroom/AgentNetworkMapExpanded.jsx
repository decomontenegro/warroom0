import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import './AgentNetworkMap.css'

function AgentNetworkMapExpanded({ 
  agents = [], 
  activeAgents = [],
  onAgentClick,
  currentPhase = 0 
}) {
  const svgRef = useRef(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [layout, setLayout] = useState('force')
  const [isDynamic, setIsDynamic] = useState(true)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const simulationRef = useRef(null)
  const isInitialized = useRef(false)
  
  useEffect(() => {
    if (!svgRef.current || !agents || agents.length === 0) return

    const container = containerRef.current
    if (!container) return

    const { width, height } = container.getBoundingClientRect()
    if (width === 0 || height === 0) return // Prevent initialization with invalid dimensions
    
    const centerX = width / 2
    const centerY = height / 2
    
    // Clear previous content and animations
    d3.select(svgRef.current).selectAll('*').remove()
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (simulationRef.current) {
      simulationRef.current.stop()
      simulationRef.current = null
    }
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Add zoom/pan group
    const g = svg.append('g')
    
    // Setup zoom
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    
    svg.call(zoom)

    // Create nodes data
    const nodes = [
      {
        id: 'orchestrator',
        label: 'Orquestrador',
        type: 'central',
        x: centerX,
        y: centerY - 50,
        color: '#8b5cf6',
        radius: 15
      },
      {
        id: 'chief',
        label: 'Chief Strategy Officer',
        type: 'central',
        x: centerX,
        y: centerY + 50,
        color: '#ffc107',
        radius: 15
      }
    ]

    // Add agent nodes based on layout
    switch(layout) {
      case 'radial': {
        const layers = [
          agents.slice(0, 20),   // Inner layer
          agents.slice(20, 50),  // Middle layer
          agents.slice(50)       // Outer layer
        ]
        
        layers.forEach((layerAgents, layerIndex) => {
          const layerRadius = Math.min(width, height) * (0.15 + layerIndex * 0.12)
          layerAgents.forEach((agent, i) => {
            const angle = (i / layerAgents.length) * 2 * Math.PI - Math.PI / 2
            nodes.push({
              id: agent.id,
              label: agent.name,
              type: 'agent',
              x: centerX + layerRadius * Math.cos(angle),
              y: centerY + layerRadius * Math.sin(angle),
              color: getAgentColor(agent),
              radius: 8,
              agent: agent
            })
          })
        })
        break
      }
      
      case 'hierarchical': {
        const levels = [
          agents.slice(0, 10),   // Level 1
          agents.slice(10, 30),  // Level 2
          agents.slice(30, 60),  // Level 3
          agents.slice(60)       // Level 4
        ]
        
        const levelHeight = height / (levels.length + 2)
        
        levels.forEach((levelAgents, level) => {
          const levelY = levelHeight * (level + 1.5)
          const levelWidth = width / (levelAgents.length + 1)
          
          levelAgents.forEach((agent, i) => {
            nodes.push({
              id: agent.id,
              label: agent.name,
              type: 'agent',
              x: (i + 1) * levelWidth,
              y: levelY,
              color: getAgentColor(agent),
              radius: 8,
              agent: agent
            })
          })
        })
        break
      }
      
      case 'circular': {
        const circleRadius = Math.min(width, height) * 0.35
        agents.forEach((agent, i) => {
          const angle = (i / agents.length) * 2 * Math.PI
          nodes.push({
            id: agent.id,
            label: agent.name,
            type: 'agent',
            x: centerX + circleRadius * Math.cos(angle),
            y: centerY + circleRadius * Math.sin(angle),
            color: getAgentColor(agent),
            radius: 8,
            agent: agent
          })
        })
        break
      }
      
      default: // force layout
        agents.forEach((agent, i) => {
          const angle = (i / agents.length) * 2 * Math.PI - Math.PI / 2
          const radius = Math.min(width, height) * 0.35
          
          nodes.push({
            id: agent.id,
            label: agent.name,
            type: 'agent',
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            color: getAgentColor(agent),
            radius: 8,
            agent: agent
          })
        })
    }

    // Create links
    const links = []
    agents.forEach(agent => {
      links.push({ source: agent.id, target: 'orchestrator' })
      links.push({ source: agent.id, target: 'chief' })
    })

    // Render links
    const linkElements = g.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.2)

    // Render nodes
    const nodeElements = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (d.agent && onAgentClick) {
          onAgentClick(d.agent)
        }
      })
      .on('mouseenter', function(event, d) {
        setHoveredNode({...d})
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.radius * 1.5)
      })
      .on('mouseleave', function(event, d) {
        setHoveredNode(null)
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.radius)
      })

    // Add circles
    nodeElements.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')

    // Add labels
    nodeElements.append('text')
      .text(d => d.label.split(' ')[0])
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 15)
      .attr('font-size', '10px')
      .attr('fill', '#ccc')

    // Apply force simulation for force layout
    if (layout === 'force' && isDynamic) {
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(centerX, centerY))
        .force('collision', d3.forceCollide().radius(d => d.radius + 10))
      
      simulationRef.current = simulation
      
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
      // Static positioning for other layouts
      linkElements
        .attr('x1', d => nodes.find(n => n.id === d.source).x)
        .attr('y1', d => nodes.find(n => n.id === d.source).y)
        .attr('x2', d => nodes.find(n => n.id === d.target).x)
        .attr('y2', d => nodes.find(n => n.id === d.target).y)
      
      // Animate non-force layouts if dynamic
      if (isDynamic && layout !== 'force') {
        const animate = () => {
          const time = Date.now() * 0.001
          
          nodes.forEach((node, i) => {
            if (node.type === 'central') return
            
            switch(layout) {
              case 'radial': {
                const layerIndex = Math.floor(i / 20)
                const baseRadius = Math.min(width, height) * (0.15 + layerIndex * 0.12)
                const angle = (i / 20) * 2 * Math.PI - Math.PI / 2 + time * 0.1
                node.x = centerX + baseRadius * Math.cos(angle)
                node.y = centerY + baseRadius * Math.sin(angle)
                break
              }
              case 'hierarchical': {
                const wave = Math.sin(time + i * 0.1) * 10
                node.x = node.x + wave
                break
              }
              case 'circular': {
                const angle = (i / agents.length) * 2 * Math.PI + time * 0.05
                const circleRadius = Math.min(width, height) * 0.35
                node.x = centerX + circleRadius * Math.cos(angle)
                node.y = centerY + circleRadius * Math.sin(angle)
                break
              }
            }
          })
          
          // Update positions
          nodeElements.attr('transform', d => `translate(${d.x}, ${d.y})`)
          
          linkElements
            .attr('x1', d => {
              const source = nodes.find(n => n.id === (d.source.id || d.source))
              return source ? source.x : 0
            })
            .attr('y1', d => {
              const source = nodes.find(n => n.id === (d.source.id || d.source))
              return source ? source.y : 0
            })
            .attr('x2', d => {
              const target = nodes.find(n => n.id === (d.target.id || d.target))
              return target ? target.x : 0
            })
            .attr('y2', d => {
              const target = nodes.find(n => n.id === (d.target.id || d.target))
              return target ? target.y : 0
            })
          
          animationRef.current = requestAnimationFrame(animate)
        }
        
        animate()
      }
    }
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }

  }, [agents.length, layout, isDynamic])

  // Helper function for agent colors
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

  const handleLayoutChange = useCallback((e) => {
    setLayout(e.target.value)
  }, [])

  const handleDynamicToggle = useCallback((e) => {
    setIsDynamic(e.target.checked)
  }, [])

  return (
    <div ref={containerRef} className="agent-network-expanded-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div className="network-controls">
        <div className="network-info">
          <h3>Rede Neural de Especialistas</h3>
          <p>Fase {currentPhase}/6 • {agents.length} agentes conectados</p>
        </div>
        <div className="layout-controls">
          <select 
            value={layout} 
            onChange={handleLayoutChange}
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
              onChange={handleDynamicToggle}
            />
            <span>Dinâmico</span>
          </label>
        </div>
      </div>
      
      <svg ref={svgRef} style={{ width: '100%', flex: 1 }}></svg>
      
      {hoveredNode && (
        <div 
          className="node-tooltip" 
          style={{
            position: 'absolute',
            left: hoveredNode.x + 10,
            top: hoveredNode.y - 20,
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
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

export default AgentNetworkMapExpanded