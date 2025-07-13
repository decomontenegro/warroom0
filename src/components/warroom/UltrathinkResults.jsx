import { useState } from 'react'
import './UltrathinkResults.css'

function UltrathinkResults({ workflowResult, onClose, onExport }) {
  const [viewMode, setViewMode] = useState('executive') // executive, detailed, technical, raw
  const [selectedPhase, setSelectedPhase] = useState(null)
  
  if (!workflowResult) return null

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#10b981'
    if (confidence >= 0.6) return '#f59e0b'
    return '#ef4444'
  }

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'Alta Confiança'
    if (confidence >= 0.6) return 'Confiança Moderada'
    return 'Baixa Confiança'
  }

  // Executive Summary View - For Non-Technical Users
  const ExecutiveSummary = () => (
    <div className="executive-summary">
      <div className="summary-header">
        <h2>📊 Resumo Executivo</h2>
        <p className="summary-subtitle">Visão geral do projeto analisado</p>
      </div>

      <div className="key-metrics">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-value">{workflowResult.summary?.totalAgentsActivated || 0}</div>
            <div className="metric-label">Especialistas Consultados</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💡</div>
          <div className="metric-content">
            <div className="metric-value">{workflowResult.summary?.totalInsights || 0}</div>
            <div className="metric-label">Insights Gerados</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{workflowResult.summary?.totalDecisions || 0}</div>
            <div className="metric-label">Decisões Tomadas</div>
          </div>
        </div>

        <div className="metric-card confidence">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div 
              className="metric-value"
              style={{ color: getConfidenceColor(workflowResult.summary?.avgConfidence || 0) }}
            >
              {Math.round((workflowResult.summary?.avgConfidence || 0) * 100)}%
            </div>
            <div className="metric-label">{getConfidenceLabel(workflowResult.summary?.avgConfidence || 0)}</div>
          </div>
        </div>
      </div>

      <div className="executive-sections">
        <div className="exec-section">
          <h3>🎯 O Que Foi Analisado</h3>
          <p className="task-description">{workflowResult.task}</p>
        </div>

        <div className="exec-section">
          <h3>📋 Principais Recomendações</h3>
          <div className="recommendations-list">
            {workflowResult.recommendations?.slice(0, 3).map((rec, idx) => (
              <div key={idx} className={`recommendation-item priority-${rec.priority}`}>
                <div className="rec-priority">{rec.priority === 'critical' ? '🚨' : rec.priority === 'high' ? '⚠️' : '💡'}</div>
                <div className="rec-content">
                  <div className="rec-title">{rec.recommendation}</div>
                  <div className="rec-action">{rec.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="exec-section">
          <h3>👣 Próximos Passos</h3>
          <ol className="next-steps-list">
            {workflowResult.nextSteps?.slice(0, 5).map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>

        {workflowResult.summary?.totalBlockers > 0 && (
          <div className="exec-section alerts">
            <h3>⚠️ Pontos de Atenção</h3>
            <p>Foram identificados {workflowResult.summary.totalBlockers} pontos que precisam de atenção especial antes de prosseguir.</p>
          </div>
        )}
      </div>
    </div>
  )

  // Detailed View - For Project Managers and Stakeholders
  const DetailedView = () => (
    <div className="detailed-view">
      <div className="phases-timeline">
        <h2>📈 Análise por Fase do Projeto</h2>
        <div className="timeline-container">
          {Object.entries(workflowResult.phases || {}).map(([phaseName, phaseData]) => (
            <div 
              key={phaseName} 
              className={`phase-card ${selectedPhase === phaseName ? 'selected' : ''}`}
              onClick={() => setSelectedPhase(phaseName)}
            >
              <div className="phase-header">
                <div className="phase-name">{phaseName.toUpperCase()}</div>
                <div 
                  className="phase-confidence"
                  style={{ backgroundColor: getConfidenceColor(phaseData.confidence) }}
                >
                  {Math.round(phaseData.confidence * 100)}%
                </div>
              </div>
              
              <div className="phase-stats">
                <div className="stat">
                  <span className="stat-value">{phaseData.agentsUsed?.length || 0}</span>
                  <span className="stat-label">Agentes</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{phaseData.insights?.length || 0}</span>
                  <span className="stat-label">Insights</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{phaseData.decisions?.length || 0}</span>
                  <span className="stat-label">Decisões</span>
                </div>
              </div>

              {phaseData.blockers?.length > 0 && (
                <div className="phase-alert">
                  <span className="alert-icon">⚠️</span>
                  <span>{phaseData.blockers.length} bloqueios</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedPhase && workflowResult.phases[selectedPhase] && (
        <div className="phase-details">
          <h3>Detalhes da Fase: {selectedPhase}</h3>
          
          <div className="insights-section">
            <h4>💡 Insights Principais</h4>
            <div className="insights-grid">
              {workflowResult.phases[selectedPhase].insights?.slice(0, 6).map((insight, idx) => (
                <div key={idx} className="insight-card">
                  <div className="insight-type">{insight.type}</div>
                  <div className="insight-content">{insight.content}</div>
                  <div className="insight-importance">
                    Importância: {Math.round(insight.importance * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="decisions-section">
            <h4>✅ Decisões Tomadas</h4>
            <div className="decisions-list">
              {workflowResult.phases[selectedPhase].decisions?.map((decision, idx) => (
                <div key={idx} className="decision-item">
                  <div className="decision-agent">{decision.agent}</div>
                  <div className="decision-content">
                    <div className="decision-text">{decision.decision}</div>
                    <div className="decision-rationale">{decision.rationale}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {workflowResult.phases[selectedPhase].blockers?.length > 0 && (
            <div className="blockers-section">
              <h4>🚧 Bloqueios Identificados</h4>
              <div className="blockers-list">
                {workflowResult.phases[selectedPhase].blockers.map((blocker, idx) => (
                  <div key={idx} className={`blocker-item severity-${blocker.severity}`}>
                    <div className="blocker-header">
                      <span className="blocker-agent">{blocker.agent}</span>
                      <span className="blocker-severity">{blocker.severity}</span>
                    </div>
                    <div className="blocker-description">{blocker.blocker}</div>
                    <div className="blocker-mitigation">
                      <strong>Mitigação:</strong> {blocker.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // Technical View - For Developers and Engineers
  const TechnicalView = () => (
    <div className="technical-view">
      <div className="tech-header">
        <h2>🔧 Análise Técnica Detalhada</h2>
        <div className="tech-controls">
          <button className="export-btn" onClick={() => onExport('json')}>
            Export JSON
          </button>
          <button className="export-btn" onClick={() => onExport('markdown')}>
            Export Markdown
          </button>
        </div>
      </div>

      <div className="architecture-section">
        <h3>🏗️ Arquitetura Proposta</h3>
        <div className="architecture-diagram">
          {/* Simplified architecture representation */}
          <div className="arch-layer">
            <div className="layer-title">Frontend</div>
            <div className="tech-stack">
              {extractTechStack(workflowResult, 'frontend').map((tech, idx) => (
                <span key={idx} className="tech-badge">{tech}</span>
              ))}
            </div>
          </div>
          <div className="arch-layer">
            <div className="layer-title">Backend</div>
            <div className="tech-stack">
              {extractTechStack(workflowResult, 'backend').map((tech, idx) => (
                <span key={idx} className="tech-badge">{tech}</span>
              ))}
            </div>
          </div>
          <div className="arch-layer">
            <div className="layer-title">Infrastructure</div>
            <div className="tech-stack">
              {extractTechStack(workflowResult, 'infra').map((tech, idx) => (
                <span key={idx} className="tech-badge">{tech}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="code-suggestions">
        <h3>💻 Implementação Sugerida</h3>
        <div className="code-tabs">
          <button className="code-tab active">Setup Inicial</button>
          <button className="code-tab">Estrutura de Pastas</button>
          <button className="code-tab">Configurações</button>
          <button className="code-tab">CI/CD Pipeline</button>
        </div>
        <div className="code-content">
          <pre className="code-block">
{`# Projeto: ${workflowResult.task}

## Setup Inicial
npm init -y
npm install ${extractDependencies(workflowResult).join(' ')}

## Estrutura Base
mkdir -p src/{components,services,utils,tests}
mkdir -p infrastructure/{docker,kubernetes,terraform}
mkdir -p docs/{api,architecture,deployment}

## Scripts NPM
"scripts": {
  "dev": "nodemon src/index.js",
  "test": "jest --coverage",
  "build": "webpack --mode production",
  "lint": "eslint src/**/*.js",
  "security": "npm audit && snyk test"
}`}
          </pre>
        </div>
      </div>

      <div className="api-design">
        <h3>🔌 Design de APIs</h3>
        <div className="api-endpoints">
          {generateAPIEndpoints(workflowResult).map((endpoint, idx) => (
            <div key={idx} className="endpoint-item">
              <span className={`method ${endpoint.method.toLowerCase()}`}>{endpoint.method}</span>
              <span className="path">{endpoint.path}</span>
              <span className="description">{endpoint.description}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="testing-strategy">
        <h3>🧪 Estratégia de Testes</h3>
        <div className="test-pyramid">
          <div className="test-level unit">
            <div className="level-name">Unit Tests (70%)</div>
            <div className="level-tools">Jest, Mocha, Testing Library</div>
          </div>
          <div className="test-level integration">
            <div className="level-name">Integration Tests (20%)</div>
            <div className="level-tools">Supertest, Cypress API</div>
          </div>
          <div className="test-level e2e">
            <div className="level-name">E2E Tests (10%)</div>
            <div className="level-tools">Cypress, Playwright</div>
          </div>
        </div>
      </div>

      <div className="performance-metrics">
        <h3>📊 Métricas de Performance Esperadas</h3>
        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-name">Response Time</div>
            <div className="metric-target">&lt; 200ms (p95)</div>
          </div>
          <div className="metric">
            <div className="metric-name">Throughput</div>
            <div className="metric-target">10K req/s</div>
          </div>
          <div className="metric">
            <div className="metric-name">Error Rate</div>
            <div className="metric-target">&lt; 0.1%</div>
          </div>
          <div className="metric">
            <div className="metric-name">Availability</div>
            <div className="metric-target">99.9%</div>
          </div>
        </div>
      </div>
    </div>
  )

  // Raw Data View - For Data Analysis
  const RawDataView = () => (
    <div className="raw-data-view">
      <div className="raw-header">
        <h2>📝 Dados Brutos da Análise</h2>
        <button className="copy-btn" onClick={() => copyToClipboard(JSON.stringify(workflowResult, null, 2))}>
          📋 Copiar JSON
        </button>
      </div>
      <pre className="raw-json">
        {JSON.stringify(workflowResult, null, 2)}
      </pre>
    </div>
  )

  // Helper functions
  const extractTechStack = (result, layer) => {
    // Extract technology recommendations from insights
    const techs = []
    Object.values(result.phases || {}).forEach(phase => {
      phase.insights?.forEach(insight => {
        if (insight.content?.toLowerCase().includes(layer)) {
          // Simple extraction logic - in real implementation would be more sophisticated
          if (layer === 'frontend' && insight.content.match(/react|vue|angular/i)) {
            techs.push(...insight.content.match(/react|vue|angular/gi) || [])
          }
          if (layer === 'backend' && insight.content.match(/node|python|java/i)) {
            techs.push(...insight.content.match(/node\.js|python|java|express/gi) || [])
          }
          if (layer === 'infra' && insight.content.match(/aws|kubernetes|docker/i)) {
            techs.push(...insight.content.match(/aws|kubernetes|docker|terraform/gi) || [])
          }
        }
      })
    })
    return [...new Set(techs)].slice(0, 5)
  }

  const extractDependencies = (result) => {
    // Extract npm dependencies from decisions
    const deps = ['express', 'react', 'jest', 'eslint']
    // In real implementation, would parse from actual decisions
    return deps
  }

  const generateAPIEndpoints = (result) => {
    // Generate API endpoints based on task analysis
    return [
      { method: 'POST', path: '/api/auth/login', description: 'User authentication' },
      { method: 'GET', path: '/api/users/:id', description: 'Get user details' },
      { method: 'POST', path: '/api/resources', description: 'Create new resource' },
      { method: 'PUT', path: '/api/resources/:id', description: 'Update resource' },
      { method: 'DELETE', path: '/api/resources/:id', description: 'Delete resource' }
    ]
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copiado para a área de transferência!')
  }

  return (
    <div className="ultrathink-results-modal">
      <div className="results-container">
        <div className="results-header">
          <h1>🎯 Resultados da Análise ULTRATHINK</h1>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="view-selector">
          <button 
            className={`view-btn ${viewMode === 'executive' ? 'active' : ''}`}
            onClick={() => setViewMode('executive')}
          >
            👔 Executivo
          </button>
          <button 
            className={`view-btn ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
          >
            📊 Detalhado
          </button>
          <button 
            className={`view-btn ${viewMode === 'technical' ? 'active' : ''}`}
            onClick={() => setViewMode('technical')}
          >
            🔧 Técnico
          </button>
          <button 
            className={`view-btn ${viewMode === 'raw' ? 'active' : ''}`}
            onClick={() => setViewMode('raw')}
          >
            📝 Dados Brutos
          </button>
        </div>

        <div className="results-content">
          {viewMode === 'executive' && <ExecutiveSummary />}
          {viewMode === 'detailed' && <DetailedView />}
          {viewMode === 'technical' && <TechnicalView />}
          {viewMode === 'raw' && <RawDataView />}
        </div>

        <div className="results-footer">
          <div className="learning-indicator">
            {workflowResult.learningApplied && (
              <span className="learning-badge">
                🧠 Auto-aprendizado aplicado ({workflowResult.iterations || 1} iterações)
              </span>
            )}
          </div>
          <div className="action-buttons">
            <button className="action-btn secondary" onClick={() => onExport('pdf')}>
              📄 Exportar PDF
            </button>
            <button className="action-btn primary" onClick={() => window.print()}>
              🖨️ Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UltrathinkResults