import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import './MiniMap.css'

function MiniMap({ nodes, links, mainViewport, onViewportChange }) {
  const svgRef = useRef(null)
  const viewportRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !nodes || nodes.length === 0) return

    const width = 200
    const height = 150
    const padding = 10

    // Limpar SVG
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Calcular bounds dos nós
    const xExtent = d3.extent(nodes, d => d.x || 0)
    const yExtent = d3.extent(nodes, d => d.y || 0)

    // Criar escalas
    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([padding, width - padding])

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([padding, height - padding])

    // Renderizar links simplificados
    svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', d => xScale(d.source.x || d.source.x || 0))
      .attr('y1', d => yScale(d.source.y || d.source.y || 0))
      .attr('x2', d => xScale(d.target.x || d.target.x || 0))
      .attr('y2', d => yScale(d.target.y || d.target.y || 0))
      .attr('stroke', '#666')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3)

    // Renderizar nós simplificados
    svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x || 0))
      .attr('cy', d => yScale(d.y || 0))
      .attr('r', d => d.type === 'cluster' ? 3 : 1.5)
      .attr('fill', d => {
        const colors = {
          file: '#2563eb',
          function: '#10b981',
          class: '#f59e0b',
          cluster: '#8b5cf6'
        }
        return colors[d.type] || '#666'
      })
      .attr('opacity', 0.8)

    // Criar viewport indicator
    const viewport = svg.append('rect')
      .attr('class', 'minimap-viewport')
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('opacity', 0.3)
      .style('cursor', 'move')

    // Atualizar viewport baseado no mainViewport
    if (mainViewport) {
      const { x, y, k, width: vWidth, height: vHeight } = mainViewport
      
      viewport
        .attr('x', xScale(x))
        .attr('y', yScale(y))
        .attr('width', (vWidth / k) * (width / xExtent[1]))
        .attr('height', (vHeight / k) * (height / yExtent[1]))
    }

    // Drag behavior para o viewport
    const drag = d3.drag()
      .on('start', function(event) {
        d3.select(this).attr('opacity', 0.5)
      })
      .on('drag', function(event) {
        const [x, y] = d3.pointer(event)
        d3.select(this)
          .attr('x', x - parseFloat(d3.select(this).attr('width')) / 2)
          .attr('y', y - parseFloat(d3.select(this).attr('height')) / 2)
      })
      .on('end', function(event) {
        d3.select(this).attr('opacity', 0.3)
        
        // Calcular nova posição do viewport principal
        const [x, y] = d3.pointer(event)
        const newX = xScale.invert(x)
        const newY = yScale.invert(y)
        
        if (onViewportChange) {
          onViewportChange({ x: newX, y: newY })
        }
      })

    viewport.call(drag)

    // Click no minimap para navegação rápida
    svg.on('click', function(event) {
      const [x, y] = d3.pointer(event)
      const newX = xScale.invert(x)
      const newY = yScale.invert(y)
      
      if (onViewportChange) {
        onViewportChange({ x: newX, y: newY, animated: true })
      }
    })

    viewportRef.current = viewport

  }, [nodes, links, mainViewport, onViewportChange])

  return (
    <div className="minimap-container">
      <div className="minimap-header">
        <span>Mini Mapa</span>
        <span className="node-count">{nodes?.length || 0} nós</span>
      </div>
      <svg ref={svgRef} className="minimap-svg"></svg>
    </div>
  )
}

export default MiniMap