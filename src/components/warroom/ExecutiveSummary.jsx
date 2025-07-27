import React, { useState } from 'react';
import './ExecutiveSummary.css';

/**
 * Componente de Resumo Executivo - Camada 1 da Progressive Disclosure
 * Mostra apenas o essencial de forma clara e acionável
 */
const ExecutiveSummary = ({ synthesis, onExplore }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!synthesis) {
    return (
      <div className="executive-summary loading">
        <div className="summary-loader">
          <div className="pulse-ring"></div>
          <p>Analisando respostas dos especialistas...</p>
        </div>
      </div>
    );
  }

  const {
    mainResponse,
    recommendedAction,
    keyConsiderations,
    mainTradeoffs,
    confidenceVisual,
    explorationOptions
  } = synthesis;

  return (
    <div className="executive-summary">
      {/* Header com Meta-Agente */}
      <div className="summary-header">
        <div className="meta-agent-badge">
          <span className="agent-icon">🧠</span>
          <span className="agent-name">Síntese Inteligente</span>
        </div>
        <div className="confidence-indicator">
          <span className="confidence-label">Confiança:</span>
          <span className="confidence-bar" title={confidenceVisual.percentage}>
            {confidenceVisual.bar}
          </span>
          <span className={`confidence-text ${confidenceVisual.color}`}>
            {confidenceVisual.percentage}
          </span>
        </div>
      </div>

      {/* Resposta Principal */}
      <div className="main-response-section">
        <h3>Análise Consolidada</h3>
        <p className="main-response">{mainResponse}</p>
      </div>

      {/* Ação Recomendada */}
      <div className="recommended-action">
        <h4>💡 Ação Recomendada</h4>
        <div className="action-box">
          {recommendedAction}
        </div>
      </div>

      {/* Trade-offs Principais (se houver) */}
      {mainTradeoffs && (
        <div className="main-tradeoffs">
          <h4>⚖️ {mainTradeoffs.title}</h4>
          <div className="tradeoff-comparison">
            <div className="tradeoff-option option-1">
              <h5>{mainTradeoffs.option1.name}</h5>
              <p className="option-summary">{mainTradeoffs.option1.summary}</p>
              <span className="support-level">{mainTradeoffs.option1.support}</span>
            </div>
            <div className="vs-divider">VS</div>
            <div className="tradeoff-option option-2">
              <h5>{mainTradeoffs.option2.name}</h5>
              <p className="option-summary">{mainTradeoffs.option2.summary}</p>
              <span className="support-level">{mainTradeoffs.option2.support}</span>
            </div>
          </div>
        </div>
      )}

      {/* Considerações Importantes */}
      {keyConsiderations && keyConsiderations.length > 0 && (
        <div className="key-considerations">
          <h4>⚠️ Pontos de Atenção</h4>
          <ul className="considerations-list">
            {keyConsiderations.map((consideration, index) => (
              <li key={index}>{consideration}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Opções de Exploração */}
      <div className="exploration-section">
        <button 
          className="expand-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▼ Menos detalhes' : '▶ Explorar mais'}
        </button>
        
        {isExpanded && explorationOptions && (
          <div className="exploration-options">
            {explorationOptions.map((option) => (
              <button
                key={option.id}
                className="exploration-button"
                onClick={() => onExplore(option.id)}
              >
                <span className="option-icon">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveSummary;