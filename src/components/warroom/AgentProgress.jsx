import { useState, useEffect } from 'react'
import './AgentProgress.css'

function AgentProgress({ totalAgents, processedAgents, successCount, failedCount, isActive }) {
  const [showDetails, setShowDetails] = useState(false)
  const progress = totalAgents > 0 ? (processedAgents / totalAgents) * 100 : 0
  
  if (!isActive || totalAgents === 0) return null
  
  return (
    <div className="agent-progress">
      <div className="progress-header" onClick={() => setShowDetails(!showDetails)}>
        <div className="progress-title">
          <span className="progress-icon">🤖</span>
          <span>Processando {totalAgents} especialistas</span>
        </div>
        <div className="progress-stats">
          <span className="stat-item success">✅ {successCount}</span>
          {failedCount > 0 && <span className="stat-item failed">❌ {failedCount}</span>}
          <span className="stat-item pending">⏳ {totalAgents - processedAgents}</span>
        </div>
      </div>
      
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          >
            <div className="progress-shimmer" />
          </div>
        </div>
        <span className="progress-percentage">{Math.round(progress)}%</span>
      </div>
      
      {showDetails && (
        <div className="progress-details">
          <div className="detail-row">
            <span>Taxa de sucesso:</span>
            <span className="detail-value">
              {processedAgents > 0 
                ? `${Math.round((successCount / processedAgents) * 100)}%`
                : '---'
              }
            </span>
          </div>
          <div className="detail-row">
            <span>Tempo médio por agente:</span>
            <span className="detail-value">~2.5s</span>
          </div>
          <div className="detail-row">
            <span>Tempo estimado restante:</span>
            <span className="detail-value">
              {totalAgents - processedAgents > 0
                ? `~${Math.round((totalAgents - processedAgents) * 2.5)}s`
                : 'Concluído'
              }
            </span>
          </div>
        </div>
      )}
      
      {processedAgents === totalAgents && (
        <div className="progress-complete">
          <span className="complete-icon">✨</span>
          <span>Análise completa com {totalAgents} especialistas!</span>
        </div>
      )}
    </div>
  )
}

export default AgentProgress