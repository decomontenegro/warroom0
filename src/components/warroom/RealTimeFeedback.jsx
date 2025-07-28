import React, { useState, useEffect, useRef } from 'react'
import { Icon } from './LucideIcons'
import './RealTimeFeedback.css'

/**
 * Real Time Feedback Component
 * Feedback visual em tempo real do processamento do War Room
 */
function RealTimeFeedback({ 
  isActive,
  currentPhase,
  activeAgents = [],
  progress = {},
  metrics = {},
  messages = []
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [animationPhase, setAnimationPhase] = useState('idle')
  const progressRef = useRef(null)

  // Fases do UltraThink
  const phases = [
    { id: 'initialization', name: 'Inicialização', icon: 'Zap', color: '#3B82F6' },
    { id: 'context_analysis', name: 'Análise de Contexto', icon: 'Search', color: '#8B5CF6' },
    { id: 'specialist_selection', name: 'Seleção de Especialistas', icon: 'Users', color: '#EC4899' },
    { id: 'parallel_analysis', name: 'Análise Paralela', icon: 'Network', color: '#F59E0B' },
    { id: 'synthesis', name: 'Síntese', icon: 'Brain', color: '#10B981' },
    { id: 'meta_analysis', name: 'Meta-Análise', icon: 'Sparkles', color: '#00D4FF' }
  ]

  // Detectar fase atual baseada no progresso
  useEffect(() => {
    if (currentPhase) {
      const phaseIndex = phases.findIndex(p => 
        currentPhase.toLowerCase().includes(p.name.toLowerCase())
      )
      if (phaseIndex !== -1) {
        setAnimationPhase(phases[phaseIndex].id)
      }
    }
  }, [currentPhase])

  // Calcular progresso geral
  const calculateOverallProgress = () => {
    if (!isActive) return 0
    
    const totalAgents = metrics.totalAgents || 0
    const completedAgents = Object.values(progress).filter(p => p === 'completed').length
    
    if (totalAgents === 0) return 0
    return Math.round((completedAgents / totalAgents) * 100)
  }

  // Estimar tempo restante
  const estimateTimeRemaining = () => {
    const overallProgress = calculateOverallProgress()
    if (overallProgress === 0) return '...'
    
    // Assumir 30s total para processamento completo
    const totalTime = 30
    const elapsed = (overallProgress / 100) * totalTime
    const remaining = totalTime - elapsed
    
    return `${Math.round(remaining)}s`
  }

  // Obter agentes ativos com status
  const getActiveAgentsWithStatus = () => {
    return activeAgents.map(agent => ({
      ...agent,
      status: progress[agent.id] || 'pending',
      isActive: progress[agent.id] === 'processing'
    }))
  }

  // Estatísticas em tempo real
  const realtimeStats = {
    messagesPerSecond: calculateMessagesPerSecond(),
    activeAgentCount: activeAgents.filter(a => progress[a.id] === 'processing').length,
    completionRate: calculateOverallProgress(),
    consensusLevel: metrics.consensusLevel || 0
  }

  function calculateMessagesPerSecond() {
    // Calcular taxa de mensagens nos últimos 5 segundos
    const now = Date.now()
    const recentMessages = messages.filter(msg => {
      const msgTime = new Date(msg.timestamp).getTime()
      return now - msgTime < 5000
    })
    return (recentMessages.length / 5).toFixed(1)
  }

  // Mini visualização do progresso
  const renderMiniProgress = () => {
    const overallProgress = calculateOverallProgress()
    
    return (
      <div className="rtf-mini">
        <div className="rtf-mini-header">
          <div className="rtf-mini-info">
            <Icon name="Activity" size={16} />
            <span>{currentPhase || 'Aguardando...'}</span>
          </div>
          <button 
            className="rtf-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Icon name={isExpanded ? 'Minimize2' : 'Maximize2'} size={16} />
          </button>
        </div>
        
        <div className="rtf-mini-progress">
          <div 
            className="rtf-mini-progress-bar"
            style={{ width: `${overallProgress}%` }}
          />
          <span className="rtf-mini-progress-text">{overallProgress}%</span>
        </div>
        
        <div className="rtf-mini-agents">
          {getActiveAgentsWithStatus().slice(0, 5).map(agent => (
            <div 
              key={agent.id}
              className={`rtf-mini-agent ${agent.isActive ? 'active' : ''}`}
              title={agent.name}
              style={{ 
                backgroundColor: agent.isActive ? agent.color : 'transparent',
                borderColor: agent.color 
              }}
            />
          ))}
          {activeAgents.length > 5 && (
            <span className="rtf-mini-more">+{activeAgents.length - 5}</span>
          )}
        </div>
      </div>
    )
  }

  // Visualização expandida
  const renderExpandedView = () => {
    return (
      <div className="rtf-expanded">
        <div className="rtf-header">
          <h3>
            <Icon name="Activity" size={20} />
            Processamento em Tempo Real
          </h3>
          <div className="rtf-header-actions">
            <button 
              className={`rtf-detail-btn ${showDetails ? 'active' : ''}`}
              onClick={() => setShowDetails(!showDetails)}
            >
              <Icon name="Info" size={16} />
              Detalhes
            </button>
            <button 
              className="rtf-close-btn"
              onClick={() => setIsExpanded(false)}
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>

        {/* Phase Progress */}
        <div className="rtf-phases">
          {phases.map((phase, index) => {
            const isCurrentPhase = phase.id === animationPhase
            const isPastPhase = phases.findIndex(p => p.id === animationPhase) > index
            
            return (
              <div 
                key={phase.id}
                className={`rtf-phase ${isCurrentPhase ? 'active' : ''} ${isPastPhase ? 'completed' : ''}`}
              >
                <div 
                  className="rtf-phase-icon"
                  style={{ backgroundColor: phase.color }}
                >
                  <Icon name={phase.icon} size={16} />
                </div>
                <span className="rtf-phase-name">{phase.name}</span>
                {isCurrentPhase && (
                  <div className="rtf-phase-indicator">
                    <span className="rtf-pulse"></span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Real-time Stats */}
        <div className="rtf-stats">
          <div className="rtf-stat">
            <Icon name="MessageSquare" size={16} />
            <div>
              <span className="rtf-stat-value">{realtimeStats.messagesPerSecond}</span>
              <span className="rtf-stat-label">msgs/s</span>
            </div>
          </div>
          
          <div className="rtf-stat">
            <Icon name="Users" size={16} />
            <div>
              <span className="rtf-stat-value">{realtimeStats.activeAgentCount}</span>
              <span className="rtf-stat-label">ativos</span>
            </div>
          </div>
          
          <div className="rtf-stat">
            <Icon name="TrendingUp" size={16} />
            <div>
              <span className="rtf-stat-value">{realtimeStats.completionRate}%</span>
              <span className="rtf-stat-label">completo</span>
            </div>
          </div>
          
          <div className="rtf-stat">
            <Icon name="Target" size={16} />
            <div>
              <span className="rtf-stat-value">{realtimeStats.consensusLevel}%</span>
              <span className="rtf-stat-label">consenso</span>
            </div>
          </div>
        </div>

        {/* Active Agents Grid */}
        <div className="rtf-agents-section">
          <h4>Agentes Ativos</h4>
          <div className="rtf-agents-grid">
            {getActiveAgentsWithStatus().map(agent => (
              <div 
                key={agent.id}
                className={`rtf-agent-card ${agent.status}`}
              >
                <div 
                  className="rtf-agent-avatar"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.icon || '🤖'}
                </div>
                <div className="rtf-agent-info">
                  <span className="rtf-agent-name">{agent.name}</span>
                  <span className="rtf-agent-status">
                    {agent.status === 'processing' && 'Processando...'}
                    {agent.status === 'completed' && '✓ Concluído'}
                    {agent.status === 'pending' && 'Aguardando'}
                    {agent.status === 'failed' && '✗ Erro'}
                  </span>
                </div>
                {agent.isActive && (
                  <div className="rtf-agent-activity">
                    <span className="rtf-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Metrics */}
        {showDetails && (
          <div className="rtf-details">
            <h4>Métricas Detalhadas</h4>
            <div className="rtf-detail-grid">
              <div className="rtf-detail-item">
                <span className="rtf-detail-label">Total de Agentes:</span>
                <span className="rtf-detail-value">{metrics.totalAgents || 0}</span>
              </div>
              <div className="rtf-detail-item">
                <span className="rtf-detail-label">Análises Completas:</span>
                <span className="rtf-detail-value">{metrics.completedAnalyses || 0}</span>
              </div>
              <div className="rtf-detail-item">
                <span className="rtf-detail-label">Tempo Estimado:</span>
                <span className="rtf-detail-value">{estimateTimeRemaining()}</span>
              </div>
              <div className="rtf-detail-item">
                <span className="rtf-detail-label">Qualidade da Análise:</span>
                <span className="rtf-detail-value">
                  {metrics.analysisQuality || 'Calculando...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Wave Animation */}
        <div className="rtf-wave-container">
          <div className="rtf-wave wave1"></div>
          <div className="rtf-wave wave2"></div>
          <div className="rtf-wave wave3"></div>
        </div>
      </div>
    )
  }

  if (!isActive && !isExpanded) return null

  return (
    <div className={`real-time-feedback ${isExpanded ? 'expanded' : 'mini'}`}>
      {isExpanded ? renderExpandedView() : renderMiniProgress()}
    </div>
  )
}

export default RealTimeFeedback