import React, { useState, useEffect, useCallback } from 'react';
import ExecutiveSummary from './ExecutiveSummary';
import './ProgressiveDisclosure.css';

/**
 * Progressive Disclosure Component
 * Gerencia as 3 camadas de informação: Essencial, Exploração e Análise Profunda
 */
const ProgressiveDisclosure = ({ 
  synthesis, 
  originalResponses, 
  isLoading,
  onRequestDetails 
}) => {
  const [currentLayer, setCurrentLayer] = useState(1);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [selectedView, setSelectedView] = useState(null);

  // Callback para explorar opções do resumo executivo
  const handleExplore = useCallback((optionId) => {
    switch (optionId) {
      case 'view_divergences':
        setCurrentLayer(2);
        setSelectedView('divergences');
        break;
      case 'view_all_clusters':
        setCurrentLayer(2);
        setSelectedView('clusters');
        break;
      case 'view_detailed_analysis':
        setCurrentLayer(2);
        setSelectedView('full_analysis');
        break;
      case 'view_all_responses':
        setCurrentLayer(3);
        break;
      default:
        if (onRequestDetails) {
          onRequestDetails(optionId);
        }
    }
  }, [onRequestDetails]);

  // Toggle de seções expansíveis
  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Renderiza conteúdo da Camada 2 (Exploração)
  const renderLayer2Content = () => {
    if (!synthesis?.layers?.layer2_exploration) return null;

    const { allTradeoffs, divergences, consensusDetails, confidenceBreakdown } = 
      synthesis.layers.layer2_exploration;

    return (
      <div className="layer2-content">
        <div className="layer-header">
          <h3>🔍 Análise Detalhada</h3>
          <button 
            className="back-button"
            onClick={() => {
              setCurrentLayer(1);
              setSelectedView(null);
            }}
          >
            ← Voltar ao resumo
          </button>
        </div>

        {/* Navegação entre visões */}
        <div className="view-tabs">
          <button 
            className={`tab ${selectedView === 'divergences' ? 'active' : ''}`}
            onClick={() => setSelectedView('divergences')}
          >
            Perspectivas Divergentes
          </button>
          <button 
            className={`tab ${selectedView === 'clusters' ? 'active' : ''}`}
            onClick={() => setSelectedView('clusters')}
          >
            Grupos de Respostas
          </button>
          <button 
            className={`tab ${selectedView === 'full_analysis' ? 'active' : ''}`}
            onClick={() => setSelectedView('full_analysis')}
          >
            Análise Completa
          </button>
        </div>

        {/* Conteúdo baseado na visão selecionada */}
        {selectedView === 'divergences' && divergences && (
          <div className="divergences-view">
            <h4>📊 {divergences.length} Perspectivas Alternativas</h4>
            {divergences.map((div, index) => (
              <div key={index} className="divergence-card">
                <div className="divergence-header">
                  <span className="divergence-theme">{div.theme}</span>
                  <span className="divergence-support">
                    {Math.round(div.support * 100)}% suporte
                  </span>
                </div>
                <div className="supporting-agents">
                  <span>Defendido por:</span>
                  {div.agents.slice(0, 5).map((agent, i) => (
                    <span key={i} className="agent-chip">{agent}</span>
                  ))}
                  {div.agents.length > 5 && (
                    <span className="more-agents">+{div.agents.length - 5} mais</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedView === 'clusters' && (
          <div className="clusters-view">
            <h4>🗂️ Agrupamento de Respostas Similares</h4>
            {synthesis.raw?.clusters?.map((cluster) => (
              <div key={cluster.id} className="cluster-card">
                <div 
                  className="cluster-header"
                  onClick={() => toggleSection(cluster.id)}
                >
                  <div className="cluster-info">
                    <span className="cluster-theme">{cluster.theme}</span>
                    <span className="cluster-weight">
                      {cluster.responses.length} respostas ({Math.round(cluster.weight * 100)}%)
                    </span>
                  </div>
                  <span className="expand-icon">
                    {expandedSections.has(cluster.id) ? '▼' : '▶'}
                  </span>
                </div>
                {expandedSections.has(cluster.id) && (
                  <div className="cluster-details">
                    <div className="cluster-agents">
                      {cluster.agents.map((agent, i) => (
                        <span key={i} className="agent-name">{agent}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedView === 'full_analysis' && (
          <div className="full-analysis-view">
            <h4>📈 Análise Completa do Consenso</h4>
            
            {/* Breakdown de Confiança */}
            {confidenceBreakdown && (
              <div className="confidence-breakdown">
                <h5>Fatores de Confiança</h5>
                {Object.entries(confidenceBreakdown).map(([factor, value]) => (
                  <div key={factor} className="confidence-factor">
                    <span className="factor-name">{factor}:</span>
                    <div className="factor-bar">
                      <div 
                        className="factor-fill"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="factor-value">{Math.round(value * 100)}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Detalhes do Consenso */}
            {consensusDetails && consensusDetails.length > 0 && (
              <div className="consensus-details">
                <h5>Pontos de Consenso</h5>
                {consensusDetails.map((consensus, index) => (
                  <div key={index} className="consensus-item">
                    <div className="consensus-theme">{consensus.theme}</div>
                    <div className="consensus-support">
                      Apoio: {Math.round(consensus.support * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Todos os Trade-offs */}
            {allTradeoffs && allTradeoffs.length > 1 && (
              <div className="all-tradeoffs">
                <h5>Todos os Trade-offs Identificados</h5>
                {allTradeoffs.slice(1).map((tradeoff, index) => (
                  <div key={index} className="tradeoff-detail">
                    <div className="tradeoff-options">
                      <div className="option">
                        <strong>{tradeoff.option1.name}</strong>
                        <ul>
                          {tradeoff.option1.pros.map((pro, i) => (
                            <li key={i} className="pro">✅ {pro}</li>
                          ))}
                          {tradeoff.option1.cons.map((con, i) => (
                            <li key={i} className="con">⚠️ {con}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="option">
                        <strong>{tradeoff.option2.name}</strong>
                        <ul>
                          {tradeoff.option2.pros.map((pro, i) => (
                            <li key={i} className="pro">✅ {pro}</li>
                          ))}
                          {tradeoff.option2.cons.map((con, i) => (
                            <li key={i} className="con">⚠️ {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderiza conteúdo da Camada 3 (Todas as Respostas)
  const renderLayer3Content = () => {
    return (
      <div className="layer3-content">
        <div className="layer-header">
          <h3>📝 Todas as Respostas Originais</h3>
          <button 
            className="back-button"
            onClick={() => setCurrentLayer(2)}
          >
            ← Voltar para análise
          </button>
        </div>

        <div className="warning-notice">
          <span className="warning-icon">⚠️</span>
          <p>
            Modo avançado: Visualizando todas as {originalResponses?.length || 0} respostas originais.
            Isso pode causar sobrecarga cognitiva.
          </p>
        </div>

        <div className="original-responses">
          {originalResponses?.map((response, index) => (
            <div key={index} className="original-response">
              <div className="response-header">
                <span className="agent-name">{response.agent}</span>
                <span className="response-time">{response.timestamp}</span>
              </div>
              <div className="response-content">
                {response.content || response.response}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Indicador de camada atual
  const renderLayerIndicator = () => (
    <div className="layer-indicator">
      <div className={`layer-dot ${currentLayer >= 1 ? 'active' : ''}`}>
        <span className="layer-label">Essencial</span>
      </div>
      <div className={`layer-connector ${currentLayer >= 2 ? 'active' : ''}`} />
      <div className={`layer-dot ${currentLayer >= 2 ? 'active' : ''}`}>
        <span className="layer-label">Exploração</span>
      </div>
      <div className={`layer-connector ${currentLayer >= 3 ? 'active' : ''}`} />
      <div className={`layer-dot ${currentLayer >= 3 ? 'active' : ''}`}>
        <span className="layer-label">Completo</span>
      </div>
    </div>
  );

  return (
    <div className="progressive-disclosure">
      {renderLayerIndicator()}
      
      <div className="layer-content">
        {/* Camada 1 - Sempre visível quando ativa */}
        {currentLayer === 1 && (
          <ExecutiveSummary 
            synthesis={synthesis?.synthesis}
            onExplore={handleExplore}
          />
        )}

        {/* Camada 2 - Exploração */}
        {currentLayer === 2 && renderLayer2Content()}

        {/* Camada 3 - Todas as respostas */}
        {currentLayer === 3 && renderLayer3Content()}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Processando análise...</p>
        </div>
      )}
    </div>
  );
};

export default ProgressiveDisclosure;