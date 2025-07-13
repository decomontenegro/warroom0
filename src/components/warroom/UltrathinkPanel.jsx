import { useState, useEffect } from 'react'
import './UltrathinkPanel.css'
import UltrathinkResults from './UltrathinkResults'

function UltrathinkPanel({ onStartWorkflow }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [workflowConfig, setWorkflowConfig] = useState({
    task: '',
    enableAutoLearning: true,
    maxIterations: 3,
    selectedPhases: ['brainstorm', 'development', 'product', 'ux', 'design', 'marketing', 'security', 'testing']
  })
  const [activeWorkflow, setActiveWorkflow] = useState(null)
  const [workflowHistory, setWorkflowHistory] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [workflowResult, setWorkflowResult] = useState(null)

  const phases = [
    { id: 'brainstorm', name: 'Brainstorm', icon: '💡', agentCount: 19 },
    { id: 'development', name: 'Development', icon: '⚡', agentCount: 46 },
    { id: 'product', name: 'Product', icon: '📦', agentCount: 16 },
    { id: 'ux', name: 'UX', icon: '🎨', agentCount: 12 },
    { id: 'design', name: 'Design', icon: '🖌️', agentCount: 9 },
    { id: 'marketing', name: 'Marketing', icon: '📈', agentCount: 10 },
    { id: 'security', name: 'Security', icon: '🔒', agentCount: 29 },
    { id: 'testing', name: 'Testing', icon: '🧪', agentCount: 10 }
  ]

  const handleStartWorkflow = async () => {
    if (!workflowConfig.task.trim()) return

    const workflow = {
      id: `ultra-${Date.now()}`,
      task: workflowConfig.task,
      config: { ...workflowConfig },
      status: 'initializing',
      startTime: new Date().toISOString(),
      currentPhase: null,
      phases: {}
    }

    setActiveWorkflow(workflow)
    
    // Notify parent component
    if (onStartWorkflow) {
      onStartWorkflow(workflow)
    }

    // Simulate workflow progression
    simulateWorkflowExecution(workflow)
  }

  const simulateWorkflowExecution = async (workflow) => {
    const selectedPhases = workflow.config.selectedPhases

    for (let i = 0; i < selectedPhases.length; i++) {
      const phaseId = selectedPhases[i]
      const phase = phases.find(p => p.id === phaseId)
      
      // Update current phase
      setActiveWorkflow(prev => ({
        ...prev,
        status: 'running',
        currentPhase: phaseId,
        phases: {
          ...prev.phases,
          [phaseId]: {
            status: 'running',
            startTime: new Date().toISOString(),
            agentsActivated: 0
          }
        }
      }))

      // Simulate agent activation
      for (let j = 0; j < phase.agentCount; j++) {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        setActiveWorkflow(prev => ({
          ...prev,
          phases: {
            ...prev.phases,
            [phaseId]: {
              ...prev.phases[phaseId],
              agentsActivated: j + 1
            }
          }
        }))
      }

      // Complete phase with detailed data
      const phaseResults = generatePhaseResults(phaseId, workflow.task)
      
      setActiveWorkflow(prev => ({
        ...prev,
        phases: {
          ...prev.phases,
          [phaseId]: {
            ...prev.phases[phaseId],
            status: 'completed',
            endTime: new Date().toISOString(),
            ...phaseResults
          }
        }
      }))
    }

    // Complete workflow
    const allPhaseData = {}
    selectedPhases.forEach(phaseId => {
      allPhaseData[phaseId] = workflow.phases?.[phaseId] || generatePhaseResults(phaseId, workflow.task)
    })
    
    const completedWorkflow = {
      ...workflow,
      status: 'completed',
      endTime: new Date().toISOString(),
      phases: allPhaseData,
      summary: {
        totalAgentsActivated: selectedPhases.reduce((sum, phaseId) => {
          const phase = phases.find(p => p.id === phaseId)
          return sum + phase.agentCount
        }, 0),
        totalInsights: Object.values(allPhaseData).reduce((sum, phase) => sum + (phase.insights?.length || 0), 0),
        totalDecisions: Object.values(allPhaseData).reduce((sum, phase) => sum + (phase.decisions?.length || 0), 0),
        avgConfidence: Object.values(allPhaseData).reduce((sum, phase) => sum + (phase.confidence || 0), 0) / selectedPhases.length,
        totalBlockers: Object.values(allPhaseData).reduce((sum, phase) => sum + (phase.blockers?.length || 0), 0)
      },
      recommendations: [
        {
          priority: 'high',
          recommendation: 'Implementar arquitetura de microserviços',
          action: 'Começar com separação de domínios e API Gateway'
        },
        {
          priority: 'critical',
          recommendation: 'Adicionar autenticação OAuth2',
          action: 'Integrar com provider como Auth0 ou implementar servidor próprio'
        },
        {
          priority: 'medium',
          recommendation: 'Otimizar performance do banco de dados',
          action: 'Adicionar índices e implementar cache Redis'
        }
      ],
      nextSteps: [
        'Revisar e priorizar todas as decisões tomadas',
        'Criar roadmap de implementação baseado nas fases',
        'Designar líderes técnicos para cada fase',
        'Configurar monitoramento de métricas chave',
        'Agendar ciclos de revisão regulares'
      ],
      learningApplied: workflow.config.enableAutoLearning,
      iterations: workflow.config.enableAutoLearning ? 2 : 1
    }
    
    setActiveWorkflow(completedWorkflow)
    setWorkflowResult(completedWorkflow)

    // Add to history
    setWorkflowHistory(prev => [completedWorkflow, ...prev.slice(0, 4)])
  }

  const togglePhase = (phaseId) => {
    setWorkflowConfig(prev => ({
      ...prev,
      selectedPhases: prev.selectedPhases.includes(phaseId)
        ? prev.selectedPhases.filter(p => p !== phaseId)
        : [...prev.selectedPhases, phaseId]
    }))
  }

  const getPhaseStatus = (phaseId) => {
    if (!activeWorkflow) return 'idle'
    const phase = activeWorkflow.phases[phaseId]
    if (!phase) return 'pending'
    return phase.status || 'pending'
  }

  const generatePhaseResults = (phaseId, task) => {
    const phaseInsights = {
      brainstorm: [
        { type: 'Market Analysis', content: `Para "${task}": Identificamos oportunidade de mercado crescente com demanda não atendida`, importance: 0.9 },
        { type: 'User Needs', content: 'Usuários precisam de solução integrada e intuitiva', importance: 0.85 },
        { type: 'Competition', content: 'Competidores focam em soluções parciais, oportunidade para solução completa', importance: 0.8 }
      ],
      development: [
        { type: 'Architecture', content: 'Microserviços com Node.js/Express para backend, React para frontend', importance: 0.95 },
        { type: 'Database', content: 'PostgreSQL para dados relacionais, Redis para cache e sessões', importance: 0.9 },
        { type: 'API Design', content: 'RESTful API com versionamento, GraphQL para queries complexas', importance: 0.85 }
      ],
      product: [
        { type: 'MVP Features', content: 'Core features: autenticação, dashboard, gestão básica', importance: 0.9 },
        { type: 'Roadmap', content: 'Fase 1: MVP em 3 meses, Fase 2: Features avançadas', importance: 0.85 }
      ],
      ux: [
        { type: 'User Flow', content: 'Fluxo simplificado com onboarding progressivo', importance: 0.9 },
        { type: 'Design System', content: 'Componentes reutilizáveis baseados em Material Design', importance: 0.85 }
      ],
      design: [
        { type: 'Visual Identity', content: 'Design moderno e minimalista com foco em usabilidade', importance: 0.85 },
        { type: 'Responsive', content: 'Mobile-first approach com progressive enhancement', importance: 0.9 }
      ],
      marketing: [
        { type: 'Go-to-Market', content: 'Estratégia de lançamento beta com early adopters', importance: 0.9 },
        { type: 'Growth', content: 'Growth hacking com referral program e content marketing', importance: 0.85 }
      ],
      security: [
        { type: 'Authentication', content: 'OAuth2 com JWT, MFA obrigatório para contas administrativas', importance: 0.95 },
        { type: 'Data Protection', content: 'Criptografia AES-256, HTTPS obrigatório, GDPR compliance', importance: 0.95 }
      ],
      testing: [
        { type: 'Test Strategy', content: 'TDD com 80% coverage, E2E com Cypress', importance: 0.9 },
        { type: 'Performance', content: 'Load testing com K6, monitoring com Prometheus', importance: 0.85 }
      ]
    }

    const phaseDecisions = {
      brainstorm: [
        { agent: 'Innovation Strategist', decision: 'Focar em diferencial competitivo através de IA', rationale: 'Mercado valoriza automação inteligente' },
        { agent: 'Business Analyst', decision: 'Priorizar features baseadas em feedback de usuários', rationale: 'Reduz risco de desenvolvimento' }
      ],
      development: [
        { agent: 'Lead Architect', decision: 'Adotar arquitetura serverless para escalabilidade', rationale: 'Reduz custos operacionais e melhora performance' },
        { agent: 'Backend Architect', decision: 'Implementar CQRS para separar leitura e escrita', rationale: 'Otimiza performance em alta escala' }
      ],
      product: [
        { agent: 'Product Manager', decision: 'Lançamento em fases com beta privado', rationale: 'Validação gradual com early adopters' },
        { agent: 'Growth Hacker', decision: 'Implementar programa de referência', rationale: 'Crescimento viral orgânico' }
      ],
      ux: [
        { agent: 'UX Designer', decision: 'Design system baseado em componentes', rationale: 'Consistência e velocidade de desenvolvimento' },
        { agent: 'User Researcher', decision: 'Testes de usabilidade quinzenais', rationale: 'Feedback contínuo dos usuários' }
      ],
      design: [
        { agent: 'Brand Designer', decision: 'Identidade visual minimalista e moderna', rationale: 'Alinhamento com tendências do mercado' }
      ],
      marketing: [
        { agent: 'Marketing Strategist', decision: 'Content marketing com foco em SEO', rationale: 'Aquisição orgânica de longo prazo' }
      ],
      security: [
        { agent: 'Security Architect', decision: 'Implementar Zero Trust Architecture', rationale: 'Máxima proteção contra ameaças internas e externas' },
        { agent: 'DevSecOps Engineer', decision: 'Pipeline CI/CD com security scanning automático', rationale: 'Detecta vulnerabilidades antes da produção' }
      ],
      testing: [
        { agent: 'QA Lead', decision: 'Estratégia de testes em pirâmide', rationale: 'Cobertura otimizada com menor custo' },
        { agent: 'Performance Engineer', decision: 'Testes de carga desde o início', rationale: 'Identificar gargalos precocemente' }
      ]
    }

    const blockers = Math.random() > 0.7 ? [
      {
        agent: phases.find(p => p.id === phaseId)?.name || 'Specialist',
        blocker: `Complexidade técnica em ${phaseId} requer expertise adicional`,
        severity: Math.random() > 0.5 ? 'high' : 'medium',
        mitigation: 'Contratar especialista ou buscar consultoria externa'
      }
    ] : []

    return {
      insights: phaseInsights[phaseId] || [],
      decisions: phaseDecisions[phaseId] || [],
      blockers,
      confidence: Math.random() * 0.3 + 0.7,
      agentsUsed: Array.from({ length: phases.find(p => p.id === phaseId)?.agentCount || 5 }, (_, i) => i + 1)
    }
  }

  return (
    <div className={`ultrathink-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="ultrathink-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ultrathink-title">
          <span className="ultrathink-icon">🧠</span>
          <h3>ULTRATHINK Multi-Agent Workflow</h3>
          <span className="agent-count">100 Specialized Agents</span>
        </div>
        <button className="expand-toggle">
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="ultrathink-content">
          {!activeWorkflow ? (
            <div className="workflow-setup">
              <div className="task-input-section">
                <label>Task Description</label>
                <textarea
                  value={workflowConfig.task}
                  onChange={(e) => setWorkflowConfig(prev => ({ ...prev, task: e.target.value }))}
                  placeholder="Describe your project or task that needs multi-agent collaboration..."
                  rows={3}
                />
              </div>

              <div className="phases-selection">
                <label>Workflow Phases</label>
                <div className="phases-grid">
                  {phases.map(phase => (
                    <div
                      key={phase.id}
                      className={`phase-card ${workflowConfig.selectedPhases.includes(phase.id) ? 'selected' : ''}`}
                      onClick={() => togglePhase(phase.id)}
                    >
                      <div className="phase-icon">{phase.icon}</div>
                      <div className="phase-info">
                        <div className="phase-name">{phase.name}</div>
                        <div className="phase-agents">{phase.agentCount} agents</div>
                      </div>
                      <div className="phase-checkbox">
                        {workflowConfig.selectedPhases.includes(phase.id) && '✓'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="workflow-options">
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={workflowConfig.enableAutoLearning}
                    onChange={(e) => setWorkflowConfig(prev => ({ 
                      ...prev, 
                      enableAutoLearning: e.target.checked 
                    }))}
                  />
                  <span>Enable Auto-Learning</span>
                  <small>Workflow will iterate and improve based on results</small>
                </label>

                <div className="option-item">
                  <label>Max Iterations</label>
                  <select
                    value={workflowConfig.maxIterations}
                    onChange={(e) => setWorkflowConfig(prev => ({ 
                      ...prev, 
                      maxIterations: parseInt(e.target.value) 
                    }))}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                  </select>
                </div>
              </div>

              <button 
                className="start-workflow-btn"
                onClick={handleStartWorkflow}
                disabled={!workflowConfig.task.trim() || workflowConfig.selectedPhases.length === 0}
              >
                Start ULTRATHINK Workflow
              </button>
            </div>
          ) : (
            <div className="workflow-execution">
              <div className="execution-header">
                <h4>{activeWorkflow.task}</h4>
                <div className={`workflow-status ${activeWorkflow.status}`}>
                  {activeWorkflow.status}
                </div>
              </div>

              <div className="phases-progress">
                {workflowConfig.selectedPhases.map(phaseId => {
                  const phase = phases.find(p => p.id === phaseId)
                  const phaseData = activeWorkflow.phases[phaseId]
                  const status = getPhaseStatus(phaseId)
                  
                  return (
                    <div key={phaseId} className={`phase-progress ${status}`}>
                      <div className="phase-header">
                        <span className="phase-icon">{phase.icon}</span>
                        <span className="phase-name">{phase.name}</span>
                        {status === 'running' && (
                          <span className="agents-counter">
                            {phaseData?.agentsActivated || 0}/{phase.agentCount}
                          </span>
                        )}
                        {status === 'completed' && (
                          <span className="phase-confidence">
                            {Math.round((phaseData?.confidence || 0) * 100)}%
                          </span>
                        )}
                      </div>
                      
                      {phaseData && (
                        <div className="phase-details">
                          {status === 'running' && (
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ 
                                  width: `${(phaseData.agentsActivated / phase.agentCount) * 100}%` 
                                }}
                              />
                            </div>
                          )}
                          
                          {status === 'completed' && (
                            <div className="phase-metrics">
                              <span>{phaseData.insights?.length || 0} insights</span>
                              <span>{phaseData.decisions?.length || 0} decisions</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {activeWorkflow.status === 'completed' && (
                <div className="workflow-completed">
                  <button 
                    className="view-results-btn"
                    onClick={() => setShowResults(true)}
                  >
                    🎯 Ver Resultados Completos
                  </button>
                  <button 
                    className="new-workflow-btn"
                    onClick={() => {
                      setActiveWorkflow(null)
                      setWorkflowConfig(prev => ({ ...prev, task: '' }))
                      setWorkflowResult(null)
                    }}
                  >
                    Iniciar Novo Workflow
                  </button>
                </div>
              )}
            </div>
          )}

          {workflowHistory.length > 0 && !activeWorkflow && (
            <div className="workflow-history">
              <h4>Recent Workflows</h4>
              {workflowHistory.map(workflow => (
                <div key={workflow.id} className="history-item">
                  <div className="history-task">{workflow.task}</div>
                  <div className="history-meta">
                    {new Date(workflow.startTime).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {showResults && workflowResult && (
        <UltrathinkResults 
          workflowResult={workflowResult}
          onClose={() => setShowResults(false)}
          onExport={(format) => {
            console.log(`Exporting in ${format} format`)
            // Implement export functionality
            if (format === 'json') {
              const dataStr = JSON.stringify(workflowResult, null, 2)
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
              const exportFileDefaultName = `ultrathink-results-${Date.now()}.json`
              const linkElement = document.createElement('a')
              linkElement.setAttribute('href', dataUri)
              linkElement.setAttribute('download', exportFileDefaultName)
              linkElement.click()
            }
          }}
        />
      )}
    </div>
  )
}

export default UltrathinkPanel