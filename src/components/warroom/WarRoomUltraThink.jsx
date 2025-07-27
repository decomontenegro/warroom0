/**
 * WarRoom UltraThink Component
 * Created: 2025-07-19 by Claude
 * Last Updated: 2025-07-19
 * 
 * Combines WarRoom3 layout with UltraThink functionality
 */

import { useState, useEffect, useRef } from 'react'
import './WarRoom3.css'
import './WarRoomUltraThink.css'

// Importar componentes do UltraThink
import AgentNetworkMap from './AgentNetworkMap'
import PromptBuilder from './PromptBuilder'
import AgentProgress from './AgentProgress'
import AnalysisMetrics from './AnalysisMetrics'
import LanguageSelector from './LanguageSelector'
import UltrathinkWorkflowEnhanced from '../../services/ultrathink-workflow-enhanced.js'
import { i18n } from '../../services/i18n-config'
import { Icon, getAgentIcon } from './LucideIcons'
import { getAgentCategory, getAgentBadge, getAgentColor } from './agentCategories'
import warRoomCoordinator from '../../services/warroom-coordinator.js'
import orchestratedWorkflow from '../../services/warroom-orchestrated-workflow.js'

// Importar dados
import agentsData from '../../../warroom-agents-100.json'

// Extrair lista de agentes
const allAgents = agentsData.warRoomTechInnovationRoles.agents

// Helper para traduções
const t = (key, fallback) => {
  try {
    return i18n.t ? i18n.t(key) : fallback
  } catch {
    return fallback
  }
}

// Função para formatar resultado
const formatResult = (result) => {
  if (!result) return 'Análise concluída.'
  
  let formatted = '📊 **Análise UltraThink Concluída**\n\n'
  
  if (result.synthesis) {
    formatted += '**Síntese:**\n' + result.synthesis + '\n\n'
  }
  
  if (result.recommendations && result.recommendations.length > 0) {
    formatted += '**Recomendações:**\n'
    result.recommendations.forEach((rec, idx) => {
      formatted += `${idx + 1}. ${rec}\n`
    })
    formatted += '\n'
  }
  
  if (result.metrics) {
    formatted += '**Métricas:**\n'
    formatted += `- Agentes consultados: ${result.metrics.totalAgents || 0}\n`
    formatted += `- Taxa de consenso: ${result.metrics.consensusScore || 0}%\n`
    formatted += `- Confiança: ${result.metrics.confidence || 'Alta'}\n`
  }
  
  return formatted
}

function WarRoomUltraThink() {
  // Estados principais
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSpecialist, setSelectedSpecialist] = useState('all')
  const [activeTab, setActiveTab] = useState('agents') // Iniciar na tab de agentes para mostrar a lista
  const [isTyping, setIsTyping] = useState(false)
  
  // Estados do UltraThink
  const [showGraph, setShowGraph] = useState(false)
  const [showPromptBuilder, setShowPromptBuilder] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)
  const [activeAgents, setActiveAgents] = useState([])
  const [currentPhase, setCurrentPhase] = useState('')
  const [consensusResults, setConsensusResults] = useState(null)
  const [agentProgress, setAgentProgress] = useState({})
  const [analysisMetrics, setAnalysisMetrics] = useState(null)
  
  // Estados do workflow
  const [workflowInstance, setWorkflowInstance] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [ultrathinkActive, setUltrathinkActive] = useState(false)
  
  // Refs
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  
  // Inicializar workflow
  useEffect(() => {
    try {
      const workflow = new UltrathinkWorkflowEnhanced()
      setWorkflowInstance(workflow)
      setSessionId(`session-${Date.now()}`)
      console.log('✅ UltraThink Workflow initialized')
    } catch (error) {
      console.error('❌ Error initializing UltraThink Workflow:', error)
    }
  }, [])
  
  // Auto-scroll para última mensagem
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  // Helper para delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
  
  // Adicionar mensagem do Coordenador
  const addCoordinatorMessage = (coordMessage) => {
    const message = {
      id: `coord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: coordMessage.text,
      sender: 'coordinator',
      coordinatorName: coordMessage.name,
      coordinatorRole: coordMessage.role,
      timestamp: new Date().toLocaleTimeString(),
      phase: coordMessage.phase
    }
    setMessages(prev => [...prev, message])
  }
  
  // Processar prompt com UltraThink
  const handleUltrathinkProcess = async (prompt) => {
    if (!workflowInstance) {
      console.error('❌ UltraThink Workflow not initialized')
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: '❌ Sistema não inicializado. Por favor, recarregue a página.',
        sender: 'system',
        timestamp: new Date().toLocaleTimeString(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }
    
    setIsLoading(true)
    setUltrathinkActive(true)
    setCurrentPhase('Iniciando UltraThink...')
    
    try {
      // Adicionar mensagem do usuário
      const userMessage = {
        id: Date.now(),
        text: prompt,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, userMessage])
      
      // Limpar agentes ativos
      setActiveAgents([])
      setAgentProgress({})
      
      // Callback para mostrar progresso
      const progressCallback = (phase, agent, message) => {
        // Mensagem do Coordenador
        if (phase === 'coordination' && !agent) {
          addCoordinatorMessage(message)
          return
        }
        
        if (agent) {
          // Mensagem de um agente específico
          setActiveAgents(prev => {
            // Adicionar agente se ainda não estiver na lista
            if (!prev.find(a => a.id === agent.id)) {
              return [...prev, agent]
            }
            return prev
          })
          
          setAgentProgress(prev => ({
            ...prev,
            [agent.id]: { status: 'active', message: message }
          }))
          
          // Adicionar mensagem do agente
          const agentMessage = {
            id: `agent-${Date.now()}-${agent.id}-${Math.random().toString(36).substr(2, 9)}`,
            text: message,
            sender: 'agent',
            agentName: agent.name,
            agentRole: agent.role,
            timestamp: new Date().toLocaleTimeString()
          }
          setMessages(prev => [...prev, agentMessage])
        } else {
          // Mensagem de fase ou sistema
          setCurrentPhase(message)
          
          const phaseMessage = {
            id: `phase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: message,
            sender: 'system',
            timestamp: new Date().toLocaleTimeString(),
            type: 'phase'
          }
          setMessages(prev => [...prev, phaseMessage])
        }
      }
      
      // Executar workflow orquestrado
      const result = await orchestratedWorkflow.executeOrchestratedWorkflow(prompt, {
        workflowInstance,
        progressCallback,
        maxAgents: 15
      })
      
      // Processar resultado
      if (result) {
        setConsensusResults(result.consensus)
        setAnalysisMetrics(result.metrics)
        
        // Adicionar resultado final
        const resultMessage = {
          id: `result-${Date.now()}`,
          text: formatResult(result),
          sender: 'system',
          timestamp: new Date().toLocaleTimeString(),
          type: 'result',
          data: result
        }
        setMessages(prev => [...prev, resultMessage])
      }
      
    } catch (error) {
      console.error('Erro no UltraThink:', error)
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: `❌ Erro: ${error.message}`,
        sender: 'system',
        timestamp: new Date().toLocaleTimeString(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setUltrathinkActive(false)
      setInputValue('')
    }
  }
  
  // Handler para envio de mensagem
  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return
    
    handleUltrathinkProcess(inputValue.trim())
  }
  
  // Handler para tecla Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  // Componente de mensagem
  const MessageComponent = ({ message }) => {
    const getMessageClass = () => {
      if (message.sender === 'user') return 'wr3-message wr3-message-sent'
      if (message.sender === 'agent') return 'wr3-message wr3-message-received wr3-message-agent'
      if (message.sender === 'coordinator') return 'wr3-message wr3-message-system wr3-message-coordinator'
      return 'wr3-message wr3-message-system'
    }
    
    return (
      <div className={getMessageClass()}>
        {message.sender === 'agent' && (
          <div className="wr3-agent-info">
            <span className="wr3-agent-name">{message.agentName}</span>
            <span className="wr3-agent-role">{message.agentRole}</span>
          </div>
        )}
        {message.sender === 'coordinator' && (
          <div className="wr3-coordinator-info">
            <span className="wr3-coordinator-name">{message.coordinatorName}</span>
            <span className="wr3-coordinator-role">{message.coordinatorRole}</span>
          </div>
        )}
        <div className="wr3-message-content">
          {message.type === 'result' ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
          ) : (
            <p>{message.text}</p>
          )}
          {message.data && message.type === 'result' && message.data.details && (
            <div className="wr3-result-data">
              <details>
                <summary>Ver detalhes completos</summary>
                <pre>{JSON.stringify(message.data.details, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>
        <span className="wr3-message-time">{message.timestamp}</span>
      </div>
    )
  }
  
  return (
    <div className="warroom3-container warroom-ultrathink">
      {/* Sidebar */}
      <div className="wr3-sidebar">
        <div className="wr3-sidebar-header">
          <h2>🚀 UltraThink</h2>
          <div className="wr3-language-selector">
            <LanguageSelector />
          </div>
        </div>
        
        {/* Controles do UltraThink */}
        <div className="wr3-sidebar-controls">
          <button 
            className={`wr3-control-btn ${showGraph ? 'active' : ''}`}
            onClick={() => setShowGraph(!showGraph)}
            title="Agent Network Map"
          >
            <Icon name="Network" size={20} />
          </button>
          <button 
            className={`wr3-control-btn ${showPromptBuilder ? 'active' : ''}`}
            onClick={() => setShowPromptBuilder(!showPromptBuilder)}
            title="Prompt Builder"
          >
            <Icon name="Edit" size={20} />
          </button>
          <button 
            className={`wr3-control-btn ${showMetrics ? 'active' : ''}`}
            onClick={() => setShowMetrics(!showMetrics)}
            title="Analysis Metrics"
          >
            <Icon name="BarChart" size={20} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="wr3-specialist-tabs">
          <button 
            className={`wr3-tab ${activeTab === 'ultrathink' ? 'active' : ''}`}
            onClick={() => setActiveTab('ultrathink')}
          >
            UltraThink
          </button>
          <button 
            className={`wr3-tab ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            Agentes ({activeAgents.length > 0 ? activeAgents.length : allAgents.length})
          </button>
          <button 
            className={`wr3-tab ${activeTab === 'phases' ? 'active' : ''}`}
            onClick={() => setActiveTab('phases')}
          >
            Fases
          </button>
        </div>
        
        {/* Conteúdo das tabs */}
        <div className="wr3-tab-content">
          {activeTab === 'ultrathink' && (
            <div className="wr3-ultrathink-info">
              <h3>Sistema Multi-Agente</h3>
              <p>100+ agentes especializados trabalhando em conjunto</p>
              
              {currentPhase && (
                <div className="wr3-current-phase">
                  <h4>Fase Atual:</h4>
                  <p>{currentPhase}</p>
                </div>
              )}
              
              {ultrathinkActive && (
                <div className="wr3-workflow-status">
                  <div className="wr3-status-indicator active"></div>
                  <span>Processando...</span>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'agents' && (
            <div className="wr3-specialist-list">
              {activeAgents.length > 0 ? (
                // Mostrar agentes ativos durante processamento
                activeAgents.map((agent, index) => (
                  <div key={`${agent.id}-${index}`} className="wr3-specialist-item active">
                    <div className="wr3-specialist-avatar">
                      {getAgentIcon(agent.role)}
                    </div>
                    <div className="wr3-specialist-info">
                      <h4>{agent.name}</h4>
                      <p>{agent.role}</p>
                      {agentProgress[agent.id] && (
                        <span className="wr3-agent-status">
                          {agentProgress[agent.id].message}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                // Mostrar todos os agentes disponíveis quando não há processamento
                <>
                  <div className="wr3-agents-header">
                    <p>100+ especialistas disponíveis</p>
                  </div>
                  {allAgents.slice(0, 20).map((agent) => (
                    <div key={agent.id} className="wr3-specialist-item">
                      <div className="wr3-specialist-avatar">
                        {getAgentIcon(agent.role)}
                      </div>
                      <div className="wr3-specialist-info">
                        <h4>{agent.name}</h4>
                        <p>{agent.role}</p>
                        <span className="wr3-specialist-badge">
                          {agent.phase && agent.phase[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="wr3-agents-footer">
                    <p>E mais {allAgents.length - 20} especialistas...</p>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'phases' && (
            <div className="wr3-phases-list">
              <div className={`wr3-phase-item ${currentPhase.includes('Análise') ? 'active' : ''}`}>
                <span className="wr3-phase-icon">🔍</span>
                <span>Análise Inicial</span>
              </div>
              <div className={`wr3-phase-item ${currentPhase.includes('Debate') ? 'active' : ''}`}>
                <span className="wr3-phase-icon">💬</span>
                <span>Debate Multi-Agente</span>
              </div>
              <div className={`wr3-phase-item ${currentPhase.includes('Consenso') ? 'active' : ''}`}>
                <span className="wr3-phase-icon">🤝</span>
                <span>Construção de Consenso</span>
              </div>
              <div className={`wr3-phase-item ${currentPhase.includes('Validação') ? 'active' : ''}`}>
                <span className="wr3-phase-icon">✅</span>
                <span>Validação Final</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Área principal */}
      <div className="wr3-chat-area">
        {/* Header */}
        <div className="wr3-chat-header">
          <div className="wr3-header-info">
            <div className="wr3-header-avatar">🧠</div>
            <div>
              <h3>UltraThink War Room</h3>
              <p>{ultrathinkActive ? 'Processando análise...' : 'Pronto para análise'}</p>
            </div>
          </div>
          <div className="wr3-header-actions">
            <button className="wr3-action-btn" title="Limpar conversa">
              <Icon name="Trash" size={20} />
            </button>
            <button className="wr3-action-btn" title="Exportar análise">
              <Icon name="Download" size={20} />
            </button>
          </div>
        </div>
        
        {/* Área de mensagens */}
        <div className="wr3-messages-area" ref={messagesContainerRef}>
          <div className="wr3-messages-container">
            {messages.length === 0 ? (
              <div className="wr3-welcome-message">
                <h2>Bem-vindo ao UltraThink War Room!</h2>
                <p>Digite uma pergunta ou tarefa para começar a análise multi-agente.</p>
                <div className="wr3-feature-cards">
                  <div className="wr3-feature-card">
                    <Icon name="Users" size={24} />
                    <h4>100+ Agentes</h4>
                    <p>Especialistas em diversas áreas</p>
                  </div>
                  <div className="wr3-feature-card">
                    <Icon name="Zap" size={24} />
                    <h4>Análise Rápida</h4>
                    <p>Processamento paralelo eficiente</p>
                  </div>
                  <div className="wr3-feature-card">
                    <Icon name="Target" size={24} />
                    <h4>Consenso Inteligente</h4>
                    <p>Decisões baseadas em múltiplas perspectivas</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageComponent key={message.id} message={message} />
                ))}
                {isTyping && (
                  <div className="wr3-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
        
        {/* Input area */}
        <div className="wr3-input-area">
          <input
            type="text"
            className="wr3-message-input"
            placeholder={isLoading ? "Processando análise..." : "Digite sua pergunta ou tarefa..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            className="wr3-send-button"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <Icon name="Loader" size={24} className="wr3-spin" />
            ) : (
              <Icon name="Send" size={24} />
            )}
          </button>
        </div>
      </div>
      
      {/* Painéis flutuantes */}
      {showGraph && (
        <div className="wr3-floating-panel wr3-graph-panel">
          <div className="wr3-panel-header">
            <h3>Agent Network Map</h3>
            <button onClick={() => setShowGraph(false)}>
              <Icon name="X" size={20} />
            </button>
          </div>
          <div className="wr3-panel-content">
            <AgentNetworkMap 
              agents={activeAgents}
              connections={[]}
              phase={currentPhase}
            />
          </div>
        </div>
      )}
      
      {showPromptBuilder && (
        <div className="wr3-floating-panel wr3-prompt-panel">
          <div className="wr3-panel-header">
            <h3>Prompt Builder</h3>
            <button onClick={() => setShowPromptBuilder(false)}>
              <Icon name="X" size={20} />
            </button>
          </div>
          <div className="wr3-panel-content">
            <PromptBuilder 
              onSubmit={(prompt) => {
                setInputValue(prompt)
                setShowPromptBuilder(false)
              }}
            />
          </div>
        </div>
      )}
      
      {showMetrics && (
        <div className="wr3-floating-panel wr3-metrics-panel">
          <div className="wr3-panel-header">
            <h3>Analysis Metrics</h3>
            <button onClick={() => setShowMetrics(false)}>
              <Icon name="X" size={20} />
            </button>
          </div>
          <div className="wr3-panel-content">
            <AnalysisMetrics 
              metrics={analysisMetrics}
              consensus={consensusResults}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default WarRoomUltraThink