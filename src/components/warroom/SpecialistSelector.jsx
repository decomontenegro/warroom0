import React, { useState, useEffect } from 'react'
import './SpecialistSelector.css'
import { Icon } from './LucideIcons'
import agents100Data from '../../../warroom-agents-100.json'

/**
 * Specialist Selector Component
 * Permite que usuários selecionem especialistas para enhancement de prompt
 */
function SpecialistSelector({ 
  isOpen, 
  onClose, 
  onSelectSpecialists,
  originalPrompt,
  maxSelections = 10
}) {
  const [selectedAgents, setSelectedAgents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showOnlySelected, setShowOnlySelected] = useState(false)
  
  // Carregar todos os 100+ especialistas
  const allAgents = agents100Data.warRoomTechInnovationRoles.agents

  // Categorias únicas
  const categories = [...new Set(allAgents.map(agent => agent.category))].sort()

  // Filtrar agentes baseado em busca e categoria
  const filteredAgents = allAgents.filter(agent => {
    const matchesSearch = searchTerm === '' || 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || agent.category === categoryFilter
    const matchesSelected = !showOnlySelected || selectedAgents.includes(agent.id)
    
    return matchesSearch && matchesCategory && matchesSelected
  })

  // Agrupar agentes por categoria
  const groupedAgents = filteredAgents.reduce((groups, agent) => {
    const category = agent.category || 'general'
    if (!groups[category]) groups[category] = []
    groups[category].push(agent)
    return groups
  }, {})

  const handleAgentToggle = (agentId) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId)
      } else if (prev.length < maxSelections) {
        return [...prev, agentId]
      }
      return prev
    })
  }

  const handleSelectAll = (category) => {
    const categoryAgents = groupedAgents[category].map(a => a.id)
    const currentSelected = selectedAgents.filter(id => categoryAgents.includes(id))
    
    if (currentSelected.length === categoryAgents.length) {
      // Desselecionar todos da categoria
      setSelectedAgents(prev => prev.filter(id => !categoryAgents.includes(id)))
    } else {
      // Selecionar todos da categoria (até o limite)
      const toAdd = categoryAgents.filter(id => !selectedAgents.includes(id))
      const available = maxSelections - selectedAgents.length
      const newSelections = toAdd.slice(0, available)
      setSelectedAgents(prev => [...prev, ...newSelections])
    }
  }

  const handleConfirm = () => {
    const selected = allAgents.filter(agent => selectedAgents.includes(agent.id))
    onSelectSpecialists(selected)
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'architecture': '🏗️',
      'development': '💻',
      'design': '🎨',
      'security': '🔒',
      'devops': '🚀',
      'data': '📊',
      'business': '💼',
      'innovation': '🌟',
      'general': '👤'
    }
    return icons[category] || '👤'
  }

  const getCategoryLabel = (category) => {
    const labels = {
      'architecture': 'Arquitetura & Engenharia',
      'development': 'Desenvolvimento',
      'design': 'Design & UX',
      'security': 'Segurança & Qualidade',
      'devops': 'DevOps & Infraestrutura',
      'data': 'Dados & Analytics',
      'business': 'Produto & Negócios',
      'innovation': 'Inovação & Estratégia',
      'general': 'Geral'
    }
    return labels[category] || category
  }

  if (!isOpen) return null

  return (
    <div className="specialist-selector-overlay">
      <div className="specialist-selector-dialog">
        <div className="ss-header">
          <div className="ss-title-section">
            <h2>
              <Icon name="Users" size={24} />
              Selecionar Especialistas para Enhancement
            </h2>
            <p className="ss-subtitle">
              Escolha até {maxSelections} especialistas para colaborar no refinamento do seu prompt
            </p>
          </div>
          <button className="ss-close" onClick={onClose}>
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="ss-prompt-preview">
          <h4>Seu prompt original:</h4>
          <p>{originalPrompt}</p>
        </div>

        <div className="ss-controls">
          <div className="ss-search">
            <Icon name="Search" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, função ou habilidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ss-filters">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="ss-category-filter"
            >
              <option value="all">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryIcon(cat)} {getCategoryLabel(cat)}
                </option>
              ))}
            </select>

            <label className="ss-checkbox">
              <input
                type="checkbox"
                checked={showOnlySelected}
                onChange={(e) => setShowOnlySelected(e.target.checked)}
              />
              Mostrar apenas selecionados
            </label>
          </div>

          <div className="ss-selection-info">
            <span className="ss-selected-count">
              {selectedAgents.length} / {maxSelections} selecionados
            </span>
            {selectedAgents.length > 0 && (
              <button 
                className="ss-clear-btn"
                onClick={() => setSelectedAgents([])}
              >
                <Icon name="Trash2" size={16} />
                Limpar seleção
              </button>
            )}
          </div>
        </div>

        <div className="ss-agents-container">
          {Object.entries(groupedAgents).map(([category, agents]) => (
            <div key={category} className="ss-category-group">
              <div className="ss-category-header">
                <h3>
                  <span className="ss-category-icon">{getCategoryIcon(category)}</span>
                  {getCategoryLabel(category)}
                  <span className="ss-category-count">({agents.length})</span>
                </h3>
                <button 
                  className="ss-select-all-btn"
                  onClick={() => handleSelectAll(category)}
                >
                  {selectedAgents.filter(id => 
                    agents.some(a => a.id === id)
                  ).length === agents.length ? 'Desselecionar todos' : 'Selecionar todos'}
                </button>
              </div>

              <div className="ss-agents-grid">
                {agents.map(agent => {
                  const isSelected = selectedAgents.includes(agent.id)
                  const isDisabled = !isSelected && selectedAgents.length >= maxSelections
                  
                  return (
                    <div 
                      key={agent.id}
                      className={`ss-agent-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && handleAgentToggle(agent.id)}
                    >
                      <div className="ss-agent-header">
                        <div className="ss-agent-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="ss-agent-info">
                          <h4>{agent.name}</h4>
                          <p className="ss-agent-role">{agent.role}</p>
                        </div>
                      </div>
                      
                      <div className="ss-agent-capabilities">
                        {agent.capabilities.slice(0, 3).map((cap, idx) => (
                          <span key={idx} className="ss-capability-tag">
                            {cap}
                          </span>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <span className="ss-capability-more">
                            +{agent.capabilities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="ss-footer">
          <div className="ss-footer-info">
            {selectedAgents.length === 0 ? (
              <p>Selecione especialistas que podem ajudar a melhorar seu prompt</p>
            ) : (
              <p>
                <strong>{selectedAgents.length} especialistas</strong> selecionados para colaborar no refinamento
              </p>
            )}
          </div>
          
          <div className="ss-footer-actions">
            <button className="ss-btn secondary" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className="ss-btn primary"
              onClick={handleConfirm}
              disabled={selectedAgents.length === 0}
            >
              <Icon name="Sparkles" size={20} />
              Continuar com Enhancement
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecialistSelector