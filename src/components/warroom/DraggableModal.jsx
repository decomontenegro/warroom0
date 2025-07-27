/**
 * Draggable Modal Component
 * Created: 2025-07-19
 * 
 * Modal draggable para o AgentNetworkMap
 */

import { useState, useRef, useEffect } from 'react'
import './DraggableModal.css'

function DraggableModal({ children, onClose, title = "Agent Network Map" }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const modalRef = useRef(null)
  
  useEffect(() => {
    // Centralizar modal ao abrir
    const centerModal = () => {
      if (modalRef.current) {
        const rect = modalRef.current.getBoundingClientRect()
        setPosition({
          x: (window.innerWidth - rect.width) / 2,
          y: (window.innerHeight - rect.height) / 2
        })
      }
    }
    
    // Pequeno delay para garantir que o elemento foi renderizado
    setTimeout(centerModal, 0)
  }, [])
  
  const handleMouseDown = (e) => {
    // Só permite drag pelo header, mas não pelos botões ou selects
    if (e.target.closest('.draggable-header') && 
        !e.target.closest('button') && 
        !e.target.closest('select') &&
        !e.target.closest('input')) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
      e.preventDefault()
    }
  }
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Limitar dentro da viewport
      const maxX = window.innerWidth - (modalRef.current?.offsetWidth || 0)
      const maxY = window.innerHeight - (modalRef.current?.offsetHeight || 0)
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart])
  
  return (
    <div className="draggable-overlay">
      <div 
        ref={modalRef}
        className={`draggable-modal ${isDragging ? 'dragging' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="draggable-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="draggable-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default DraggableModal