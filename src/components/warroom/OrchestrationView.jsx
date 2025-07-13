import { useState, useEffect } from 'react'
import './OrchestrationView.css'

function OrchestrationView({ isActive, orchestrationData, onClose }) {
  const [currentPhase, setCurrentPhase] = useState(1)
  const [consensusPoints, setConsensusPoints] = useState([])
  const [divergences, setDivergences] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [showDetails, setShowDetails] = useState({})
  
  useEffect(() => {
    if (orchestrationData) {
      if (orchestrationData.type === 'orchestration-analysis') {
        setConsensusPoints(orchestrationData.analysis.consensusPoints || [])
        setDivergences(orchestrationData.analysis.divergences || [])
      }
      
      if (orchestrationData.type === 'orchestration-complete') {
        setRecommendations(orchestrationData.result.recommendations || [])
        setCurrentPhase(3)
      }
    }
  }, [orchestrationData])
  
  if (!isActive) return null
  
  return (
    <div className="orchestration-overlay">
      <div className="orchestration-panel">
        <div className="orchestration-header">
          <h2>🎯 Orquestrador Inteligente</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        {/* Phase Indicator */}
        <div className="phase-indicator">
          <div className={`phase-step ${currentPhase >= 1 ? 'active' : ''}`}>
            <span className="phase-number">1</span>
            <span className="phase-label">Coleta Inicial</span>
          </div>
          <div className={`phase-step ${currentPhase >= 2 ? 'active' : ''}`}>
            <span className="phase-number">2</span>
            <span className="phase-label">Análise</span>
          </div>
          <div className={`phase-step ${currentPhase >= 3 ? 'active' : ''}`}>
            <span className="phase-number">3</span>
            <span className="phase-label">Consolidação</span>
          </div>
        </div>
        
        <div className="orchestration-content">
          {/* Consensus Section */}
          {consensusPoints.length > 0 && (
            <div className="analysis-section consensus-section">
              <h3>🤝 Pontos de Consenso</h3>
              <div className="consensus-list">
                {consensusPoints.map((point, index) => (
                  <div key={index} className="consensus-item">
                    <div className="consensus-header">
                      <span className="consensus-icon">✅</span>
                      <span className="consensus-text">{point.point || point}</span>
                      {point.agreementLevel && (
                        <span className="agreement-level">
                          {Math.round(point.agreementLevel * 100)}% acordo
                        </span>
                      )}
                    </div>
                    {point.supportedBy && (
                      <div className="supported-by">
                        Apoiado por: {point.supportedBy.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Divergences Section */}
          {divergences.length > 0 && (
            <div className="analysis-section divergence-section">
              <h3>⚡ Pontos de Divergência</h3>
              <div className="divergence-list">
                {divergences.map((divergence, index) => (
                  <div key={index} className="divergence-item">
                    <div 
                      className="divergence-header"
                      onClick={() => setShowDetails({
                        ...showDetails,
                        [`div-${index}`]: !showDetails[`div-${index}`]
                      })}
                    >
                      <span className="divergence-icon">🔀</span>
                      <span className="divergence-topic">{divergence.topic || divergence}</span>
                      <span className="expand-icon">
                        {showDetails[`div-${index}`] ? '▼' : '▶'}
                      </span>
                    </div>
                    {showDetails[`div-${index}`] && divergence.viewpoints && (
                      <div className="viewpoints">
                        {divergence.viewpoints.map((vp, vpIndex) => (
                          <div key={vpIndex} className="viewpoint">
                            <span className="viewpoint-agent">{vp.agent}:</span>
                            <span className="viewpoint-text">{vp.view}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="analysis-section recommendations-section">
              <h3>💡 Recomendações Consolidadas</h3>
              <div className="recommendations-list">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`recommendation-item priority-${rec.priority || 'medium'}`}>
                    <div className="recommendation-header">
                      <span className="recommendation-number">{index + 1}</span>
                      <span className="recommendation-text">{rec.recommendation || rec}</span>
                    </div>
                    {rec.action && (
                      <div className="recommendation-action">
                        <span className="action-label">Ação:</span>
                        <span className="action-text">{rec.action}</span>
                      </div>
                    )}
                    {rec.consensus && (
                      <div className="recommendation-consensus">
                        <div className="consensus-bar">
                          <div 
                            className="consensus-fill"
                            style={{ width: `${rec.consensus * 100}%` }}
                          />
                        </div>
                        <span className="consensus-value">
                          {Math.round(rec.consensus * 100)}% consenso
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Summary Stats */}
          {orchestrationData?.result?.summary && (
            <div className="orchestration-summary">
              <h4>📊 Resumo da Orquestração</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-value">{orchestrationData.result.totalAgentsInvolved}</span>
                  <span className="stat-label">Agentes Envolvidos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{orchestrationData.result.totalRounds}</span>
                  <span className="stat-label">Rodadas de Análise</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {Math.round(orchestrationData.result.confidenceLevel * 100)}%
                  </span>
                  <span className="stat-label">Confiança Geral</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {orchestrationData.result.consensusAchieved ? '✅' : '⚠️'}
                  </span>
                  <span className="stat-label">
                    {orchestrationData.result.consensusAchieved ? 'Consenso Alcançado' : 'Sem Consenso'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="orchestration-footer">
          <button className="action-button secondary" onClick={onClose}>
            Fechar
          </button>
          <button className="action-button primary" onClick={() => {
            // Export or save results
            console.log('Exporting orchestration results...')
          }}>
            Exportar Análise
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrchestrationView