import { useState, useEffect, useRef } from 'react'
import './WarRoom3.css'
import './WarRoom3-dark-background.css'
import MessageContent from './MessageContent'

// Importar todos os componentes do WarRoom Classic
import AgentNetworkMap from './AgentNetworkMap'
import AgentNetworkMapExpanded from './AgentNetworkMapExpanded'
import PromptBuilder from './PromptBuilder'
import AgentProgress from './AgentProgress'
import AnalysisMetrics from './AnalysisMetrics'
import LanguageSelector from './LanguageSelector'
import DraggableModal from './DraggableModal'
import EnhancedPromptDialog from './EnhancedPromptDialog'
import ConversationHistory from './ConversationHistory'
import RealTimeFeedback from './RealTimeFeedback'
import CodeGraphIntegration from './CodeGraphIntegration'
import UltrathinkWorkflowEnhanced from '../../services/ultrathink-workflow-enhanced.js'
import { i18n } from '../../services/i18n-config'
import { Icon, getAgentIcon } from './LucideIcons'
import { getAgentCategory, getAgentBadge, getAgentColor } from './agentCategories'

// Importar dados
import agentsData from '../../../warroom-agents-100.json'

// Funções auxiliares para cores
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper para traduções
const t = (key, fallback) => {
  try {
    return i18n.t ? i18n.t(`warroom.${key}`) : fallback
  } catch {
    return fallback
  }
}

// Formatar síntese final
function formatSynthesis(synthesis) {
  if (!synthesis) return 'Síntese não disponível'
  
  // Verificar se é o formato novo (enhanced)
  if (synthesis.summary && synthesis.summary.includes('##')) {
    // Formato markdown rico do enhanced meta agent
    let formatted = synthesis.summary + '\n\n'
    
    if (synthesis.consensus_points && synthesis.consensus_points.length > 0) {
      formatted += `### ✅ Pontos de Consenso\n\n`
      synthesis.consensus_points.forEach(point => {
        formatted += `${point}\n`
      })
      formatted += '\n'
    }
    
    if (synthesis.divergence_points && synthesis.divergence_points.length > 0) {
      formatted += `### ❓ Pontos de Divergência\n\n`
      synthesis.divergence_points.forEach(point => {
        formatted += `${point}\n`
      })
      formatted += '\n'
    }
    
    if (synthesis.critical_insights && synthesis.critical_insights.length > 0) {
      formatted += `### 💡 Insights Críticos\n\n`
      synthesis.critical_insights.forEach(insight => {
        formatted += `${insight}\n`
      })
      formatted += '\n'
    }
    
    if (synthesis.risk_mitigation && synthesis.risk_mitigation.length > 0) {
      formatted += `### ⚠️ Mitigação de Riscos\n\n`
      synthesis.risk_mitigation.forEach(risk => {
        formatted += `${risk}\n`
      })
      formatted += '\n'
    }
    
    if (synthesis.implementation_roadmap) {
      formatted += `### 🗺️ Roadmap de Implementação\n\n`
      
      Object.entries(synthesis.implementation_roadmap).forEach(([phase, details]) => {
        if (details.title) {
          formatted += `#### ${details.title}\n`
          if (details.items) {
            details.items.forEach(item => {
              formatted += `- ${item}\n`
            })
          }
          if (details.budget) formatted += `**Budget**: ${details.budget}\n`
          if (details.team) formatted += `**Team**: ${details.team}\n`
          formatted += '\n'
        }
      })
    }
    
    if (synthesis.success_metrics) {
      formatted += `### 📊 Métricas de Sucesso\n\n`
      Object.entries(synthesis.success_metrics).forEach(([category, metrics]) => {
        formatted += `**${category.charAt(0).toUpperCase() + category.slice(1)}**:\n`
        Object.entries(metrics).forEach(([metric, value]) => {
          formatted += `- ${metric}: ${value}\n`
        })
        formatted += '\n'
      })
    }
    
    if (synthesis.final_recommendation) {
      formatted += synthesis.final_recommendation + '\n'
    }
    
    return formatted
  }
  
  // Formato antigo (fallback)
  let formatted = '🎯 **SÍNTESE FINAL DO META-AGENTE**\n\n'
  
  if (synthesis.summary) {
    formatted += `📋 **Resumo Executivo**\n${synthesis.summary}\n\n`
  }
  
  if (synthesis.consensus_points && synthesis.consensus_points.length > 0) {
    formatted += `✅ **Pontos de Consenso**\n`
    synthesis.consensus_points.forEach(point => {
      formatted += `• ${point}\n`
    })
    formatted += '\n'
  }
  
  if (synthesis.key_insights && synthesis.key_insights.length > 0) {
    formatted += `💡 **Insights Principais**\n`
    synthesis.key_insights.forEach(insight => {
      formatted += `• ${insight}\n`
    })
    formatted += '\n'
  }
  
  if (synthesis.recommendations) {
    formatted += `🚀 **Recomendações**\n`
    if (synthesis.recommendations.immediate) {
      formatted += `*Ações Imediatas:*\n`
      synthesis.recommendations.immediate.forEach(rec => {
        formatted += `• ${rec}\n`
      })
    }
  }
  
  if (synthesis.confidence_analysis) {
    formatted += `\n📊 **Análise de Confiança**\n`
    formatted += `Nível de consenso: ${Math.round(synthesis.confidence_analysis.consensus_level * 100)}%\n`
    formatted += `Confiança geral: ${synthesis.confidence_analysis.overall_confidence}\n`
  }
  
  return formatted
}

function WarRoom3() {
  // Estados principais
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSpecialist, setSelectedSpecialist] = useState('all')
  const [activeTab, setActiveTab] = useState('chat')
  const [isTyping, setIsTyping] = useState(false)
  const [showGraph, setShowGraph] = useState(false)
  const [showPromptBuilder, setShowPromptBuilder] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)
  const [showEnhancedPrompt, setShowEnhancedPrompt] = useState(false)
  const [lastUserPrompt, setLastUserPrompt] = useState('')
  const [lastAgentResponses, setLastAgentResponses] = useState([])
  
  // Estados para preservar o prompt original
  const [originalUserPrompt, setOriginalUserPrompt] = useState('') // Nunca é sobrescrito
  const [currentRefinedPrompt, setCurrentRefinedPrompt] = useState('') // Prompt refinado atual
  
  // Estados do UltraThink
  const [activeAgents, setActiveAgents] = useState([])
  const [currentPhase, setCurrentPhase] = useState('')
  const [agentProgress, setAgentProgress] = useState({})
  const [analysisMetrics, setAnalysisMetrics] = useState({
    totalAgents: 0,
    activeAgents: 0,
    completedAnalyses: 0,
    consensusLevel: 0,
    phaseCompletion: {}
  })
  
  // Estados de chat
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [currentAgent, setCurrentAgent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showRealTimeFeedback, setShowRealTimeFeedback] = useState(true)
  const [showCodeGraph, setShowCodeGraph] = useState(false)
  
  // Refs
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const wsRef = useRef(null)
  
  // Inicializar UltraThink Workflow
  const [ultrathinkWorkflow] = useState(() => new UltrathinkWorkflowEnhanced())

  // Auto-scroll para mensagens novas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Criar nova conversa
  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'Nova Conversa',
      timestamp: new Date().toISOString(),
      messages: [],
      hasRefinement: false
    }
    
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
    setMessages([])
    setLastUserPrompt('')
    setLastAgentResponses([])
    setOriginalUserPrompt('')
    setCurrentRefinedPrompt('')
  }

  // Salvar mensagem na conversa atual
  const saveMessageToConversation = (message) => {
    if (!currentConversationId) {
      createNewConversation()
    }
    
    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, message]
        }
        
        // Atualizar título baseado na primeira mensagem do usuário
        if (message.sender === 'user' && conv.messages.length === 0) {
          updatedConv.title = message.text.substring(0, 50) + (message.text.length > 50 ? '...' : '')
        }
        
        // Marcar se teve refinamento
        if (message.isRefined) {
          updatedConv.hasRefinement = true
        }
        
        return updatedConv
      }
      return conv
    }))
  }

  // Selecionar conversa do histórico
  const selectConversation = (conversation) => {
    setCurrentConversationId(conversation.id)
    setMessages(conversation.messages)
    setShowHistory(false)
  }

  // Deletar conversa
  const deleteConversation = (conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null)
      setMessages([])
    }
  }

  // Inicializar WebSocket
  useEffect(() => {
    let reconnectTimeout = null;
    let isComponentMounted = true;
    
    const connectWebSocket = () => {
      if (!isComponentMounted) return;
      
      try {
        wsRef.current = new WebSocket('ws://localhost:3005/warroom-ws')
        
        wsRef.current.onopen = () => {
          console.log('WebSocket conectado')
        }
        
        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        }
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket erro:', error)
        }
        
        wsRef.current.onclose = (event) => {
          console.log('WebSocket desconectado', event.code, event.reason)
          // Só reconectar se foi desconexão não intencional e componente ainda está montado
          if (isComponentMounted && event.code !== 1000) {
            reconnectTimeout = setTimeout(connectWebSocket, 3000)
          }
        }
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error)
      }
    }
    
    connectWebSocket()
    
    return () => {
      isComponentMounted = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Processar mensagens do WebSocket
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'agent_update':
        setActiveAgents(data.agents)
        break
      case 'phase_update':
        setCurrentPhase(data.phase)
        break
      case 'progress_update':
        setAgentProgress(data.progress)
        break
      case 'metrics_update':
        setAnalysisMetrics(data.metrics)
        break
      case 'message':
        const aiMessage = {
          id: Date.now(),
          text: data.content,
          sender: 'ai',
          specialist: data.agent,
          timestamp: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }
        setMessages(prev => [...prev, aiMessage])
        break
    }
  }

  // Filtrar especialistas
  const allAgents = agentsData.warRoomTechInnovationRoles?.agents || []
  const filteredAgents = allAgents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    setMessages(prev => [...prev, userMessage])
    saveMessageToConversation(userMessage)
    setInputValue('')
    setIsLoading(true)
    setIsTyping(true)
    
    // Salvar o prompt do usuário para Enhanced Prompt
    setLastUserPrompt(inputValue)
    
    // Preservar o prompt original se for a primeira mensagem
    if (!originalUserPrompt) {
      setOriginalUserPrompt(inputValue)
    }

    try {
      // Se selecionou todos os especialistas, usar UltraThink
      if (selectedSpecialist === 'all') {
        // Usar o UltraThink workflow real
        const progressCallback = (update) => {
          if (update.type === 'phase_update') {
            setCurrentPhase(update.phase)
          } else if (update.type === 'agent_speaking') {
            const aiMessage = {
              id: Date.now() + Math.random(),
              text: update.content,
              sender: 'ai',
              specialist: update.agent,
              timestamp: new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            }
            setMessages(prev => [...prev, aiMessage])
            saveMessageToConversation(aiMessage)
          } else if (update.type === 'metrics_update') {
            setAnalysisMetrics(update.metrics)
          }
        }

        try {
          // Array para coletar respostas dos agentes
          const collectedResponses = []
          
          // Passar tanto o prompt original quanto o atual
          const queryData = {
            originalQuery: originalUserPrompt || inputValue, // Usar o original se existir
            currentQuery: inputValue,
            isRefined: currentRefinedPrompt === inputValue // Indica se foi refinado
          }
          
          const result = await ultrathinkWorkflow.executeAdvancedWorkflow(queryData, {
            progressCallback: (phase, agent, message) => {
              if (agent && message) {
                // É uma mensagem de agente
                const aiMessage = {
                  id: Date.now() + Math.random(),
                  text: message,
                  sender: 'ai',
                  specialist: agent,
                  timestamp: new Date().toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                }
                setMessages(prev => [...prev, aiMessage])
            saveMessageToConversation(aiMessage)
                
                // Coletar resposta para Enhanced Prompt
                collectedResponses.push({
                  agent: agent,
                  content: message
                })
              } else if (phase === 'synthesis' && message) {
                // Síntese final está sendo processada
                setCurrentPhase('Sintetizando respostas...')
              } else if (phase && message) {
                // É uma atualização de fase
                setCurrentPhase(message)
              }
            }
          })
          
          // Salvar respostas coletadas
          setLastAgentResponses(collectedResponses)
          
          // Adicionar síntese final se disponível
          if (result && result.synthesis) {
            const synthesisMessage = {
              id: Date.now() + Math.random(),
              text: formatSynthesis(result.synthesis),
              sender: 'ai',
              specialist: {
                name: 'Meta-Agent Synthesizer',
                role: 'Chief Synthesis Officer',
                icon: '🧠'
              },
              isSynthesis: true,
              timestamp: new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            }
            setMessages(prev => [...prev, synthesisMessage])
          }
          
          setIsTyping(false)
          setIsLoading(false)
        } catch (error) {
          console.error('Erro no UltraThink workflow:', error)
          setIsTyping(false)
          setIsLoading(false)
        }
      } else {
        // Simular resposta de especialista específico
        const specialist = allAgents.find(a => a.id === selectedSpecialist)
        
        setTimeout(() => {
          const aiMessage = {
            id: Date.now() + 1,
            text: `Analisando sua questão sob a perspectiva de ${specialist.role}: "${inputValue}"...`,
            sender: 'ai',
            specialist: specialist,
            timestamp: new Date().toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          }
          setMessages(prev => [...prev, aiMessage])
          setIsTyping(false)
          setIsLoading(false)
        }, 1500)
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  // Tecla Enter para enviar
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Selecionar especialista
  const handleSelectSpecialist = (specialistId) => {
    setSelectedSpecialist(specialistId)
    if (specialistId !== 'all') {
      const agent = allAgents.find(a => a.id === specialistId)
      setCurrentAgent(agent)
    } else {
      setCurrentAgent(null)
    }
  }

  return (
    <div className="warroom3-container">
      {/* Sidebar com lista de especialistas */}
      <div className="wr3-sidebar">
        <div className="wr3-sidebar-header">
          <h2>War Room 3.0</h2>
          <LanguageSelector />
        </div>
        
        <div className="wr3-specialist-tabs">
          <button 
            className={`wr3-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 {t('chats', 'Chats')}
          </button>
          <button 
            className={`wr3-tab ${activeTab === 'specialists' ? 'active' : ''}`}
            onClick={() => setActiveTab('specialists')}
          >
            👥 {t('specialists', 'Especialistas')}
          </button>
        </div>

        <div className="wr3-search-box">
          <input
            type="text"
            placeholder={t('searchSpecialists', 'Buscar especialistas...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wr3-search-input"
          />
        </div>

        <div className="wr3-specialist-list">
          {/* Chat com todos */}
          <div 
            className={`wr3-specialist-item ${selectedSpecialist === 'all' ? 'active' : ''}`}
            onClick={() => handleSelectSpecialist('all')}
          >
            <div className="wr3-specialist-avatar all">
              <Icon name="Globe" size={24} />
            </div>
            <div className="wr3-specialist-info">
              <h4>{t('allSpecialists', 'Todos os Especialistas')}</h4>
              <p>{t('askAll100Specialists', 'Pergunte para todos os 100+ especialistas')}</p>
            </div>
          </div>

          {/* Lista de especialistas individuais */}
          {filteredAgents.map(agent => {
            const category = getAgentCategory(agent.name)
            const badge = getAgentBadge(agent.name)
            const color = getAgentColor(agent.name)
            const icon = getAgentIcon(agent.role)
            
            return (
              <div 
                key={agent.id}
                className={`wr3-specialist-item ${selectedSpecialist === agent.id ? 'active' : ''}`}
                onClick={() => handleSelectSpecialist(agent.id)}
              >
                <div 
                  className="wr3-specialist-avatar"
                  style={{ background: `linear-gradient(135deg, ${color} 0%, ${hexToRgba(color, 0.7)} 100%)` }}
                >
                  {getAgentIcon(agent.role, 24)}
                </div>
                <div className="wr3-specialist-info">
                  <h4>{agent.name}</h4>
                  <p>{agent.role}</p>
                  {badge && <span className="wr3-specialist-badge">{badge.icon} {badge.categoryName}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Área principal do chat */}
      <div className="wr3-chat-area">
        {/* Header do chat */}
        <div className="wr3-chat-header">
          <div className="wr3-header-info">
            {selectedSpecialist === 'all' ? (
              <>
                <div className="wr3-header-avatar all">
                  <Icon name="Globe" size={20} />
                </div>
                <div>
                  <h3>{t('allSpecialists', 'Todos os Especialistas')}</h3>
                  <p>100+ {t('specialistsOnline', 'especialistas online')}</p>
                </div>
              </>
            ) : currentAgent ? (
              <>
                <div 
                  className="wr3-header-avatar"
                  style={{ 
                    background: `linear-gradient(135deg, ${getAgentColor(currentAgent.name)} 0%, ${hexToRgba(getAgentColor(currentAgent.name), 0.7)} 100%)` 
                  }}
                >
                  {getAgentIcon(currentAgent.role, 20)}
                </div>
                <div>
                  <h3>{currentAgent.name}</h3>
                  <p>{currentAgent.role}</p>
                </div>
              </>
            ) : null}
          </div>
          
          <div className="wr3-header-actions">
            <button 
              className={`wr3-action-btn ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(!showHistory)}
              title={t('conversationHistory', 'Histórico de Conversas')}
            >
              <Icon name="History" size={20} />
            </button>
            <button 
              className={`wr3-action-btn ${showGraph ? 'active' : ''}`}
              onClick={() => setShowGraph(!showGraph)}
              title={t('viewSpecialistsGraph', 'Ver Graph de Especialistas')}
            >
              <Icon name="Network" size={20} />
            </button>
            <button 
              className={`wr3-action-btn ${showPromptBuilder ? 'active' : ''}`}
              onClick={() => setShowPromptBuilder(!showPromptBuilder)}
              title={t('promptBuilder', 'Construtor de Prompt')}
            >
              <Icon name="Wrench" size={20} />
            </button>
            <button 
              className={`wr3-action-btn ${showMetrics ? 'active' : ''}`}
              onClick={() => setShowMetrics(!showMetrics)}
              title={t('viewMetrics', 'Ver Métricas')}
            >
              <Icon name="BarChart3" size={20} />
            </button>
            <button 
              className={`wr3-action-btn ${showCodeGraph ? 'active' : ''}`}
              onClick={() => setShowCodeGraph(!showCodeGraph)}
              title={t('codeAnalysis', 'Análise de Código')}
            >
              <Icon name="Code" size={20} />
            </button>
            <button className="wr3-action-btn" title={t('search', 'Buscar')}>
              <Icon name="Search" size={20} />
            </button>
            <button className="wr3-action-btn" title={t('menu', 'Menu')}>
              <Icon name="MoreVertical" size={20} />
            </button>
          </div>
        </div>

        {/* Histórico de Conversas */}
        {showHistory && (
          <DraggableModal 
            onClose={() => setShowHistory(false)}
            title="📚 Histórico de Conversas"
          >
            <ConversationHistory
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={selectConversation}
              onNewConversation={createNewConversation}
              onDeleteConversation={deleteConversation}
            />
          </DraggableModal>
        )}

        {/* Componentes auxiliares */}
        {showGraph && (
          <DraggableModal 
            onClose={() => setShowGraph(false)}
            title="🗺️ Rede de Agentes Especialistas"
          >
            <AgentNetworkMapExpanded 
              agents={agentsData.warRoomTechInnovationRoles?.agents || []}
              activeAgents={activeAgents}
              currentPhase={currentPhase}
              onAgentClick={(agent) => {
                handleSelectSpecialist(agent.id)
                setShowGraph(false)
              }}
            />
          </DraggableModal>
        )}

        {showPromptBuilder && (
          <div className="wr3-prompt-builder-overlay">
            <div className="wr3-prompt-builder-container">
              <button 
                className="wr3-close-btn"
                onClick={() => setShowPromptBuilder(false)}
              >
                ✕
              </button>
              <PromptBuilder 
                onBuildComplete={(data) => {
                  setInputValue(data.prompt)
                  setShowPromptBuilder(false)
                }}
                onSubmit={(prompt) => {
                  setInputValue(prompt)
                  setShowPromptBuilder(false)
                }}
                allAgents={allAgents}
              />
            </div>
          </div>
        )}

        {showMetrics && (
          <div className="wr3-metrics-overlay">
            <div className="wr3-metrics-container">
              <button 
                className="wr3-close-btn"
                onClick={() => setShowMetrics(false)}
              >
                ✕
              </button>
              <AnalysisMetrics analysisData={{
                metrics: analysisMetrics,
                metadata: {
                  agentsUsed: analysisMetrics.totalAgents,
                  complexity: { complexity: 'Medium' }
                }
              }} />
            </div>
          </div>
        )}

        {/* UltraThink Progress (quando todos os especialistas) */}
        {selectedSpecialist === 'all' && activeAgents.length > 0 && (
          <div className="wr3-ultrathink-progress">
            <AgentProgress 
              totalAgents={allAgents.length}
              processedAgents={Object.keys(agentProgress).length}
              successCount={Object.values(agentProgress).filter(p => p === 'completed').length}
              failedCount={Object.values(agentProgress).filter(p => p === 'failed').length}
              isActive={isLoading}
            />
          </div>
        )}

        {/* Área de mensagens */}
        <div className="wr3-messages-container">
          {messages.length === 0 ? (
            <div className="wr3-empty-state">
              <div className="wr3-empty-icon">
                <Icon name="MessageCircle" size={48} />
              </div>
              <h3>{t('startConversation', 'Inicie uma conversa')}</h3>
              <p>{t('askQuestionToSpecialists', 'Faça uma pergunta aos especialistas')}</p>
            </div>
          ) : (
            <div className="wr3-messages-list">
              {messages.map(message => (
                <div 
                  key={message.id}
                  className={`wr3-message ${message.sender === 'user' ? 'user' : 'ai'}`}
                >
                  {message.sender === 'ai' && (
                    <div 
                      className="wr3-message-avatar"
                      style={message.specialist ? {
                        background: `linear-gradient(135deg, ${getAgentColor(message.specialist.name)} 0%, ${hexToRgba(getAgentColor(message.specialist.name), 0.7)} 100%)`
                      } : {}}
                    >
                      {message.specialist ? (
                        getAgentIcon(message.specialist.role, 18)
                      ) : (
                        <Icon name="Bot" size={18} />
                      )}
                    </div>
                  )}
                  <div className="wr3-message-bubble">
                    {message.specialist && (
                      <div className="wr3-message-header">
                        <span className="wr3-message-name">{message.specialist.name}</span>
                        <span className="wr3-message-role">{message.specialist.role}</span>
                      </div>
                    )}
                    <MessageContent 
                      text={message.text} 
                      isSynthesis={message.isSynthesis}
                      onEnhancedPrompt={message.isSynthesis ? () => setShowEnhancedPrompt(true) : null}
                    />
                    <span className="wr3-message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="wr3-message ai">
                  <div className="wr3-message-avatar">
                    <Icon name="Bot" size={18} />
                  </div>
                  <div className="wr3-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Área de input */}
        <div className="wr3-input-container">
          <div className="wr3-input-wrapper">
            <button className="wr3-attach-btn" title={t('attach', 'Anexar')}>
              <Icon name="Paperclip" size={20} />
            </button>
            
            <input
              ref={inputRef}
              type="text"
              className="wr3-input"
              placeholder={t('typeMessage', 'Digite uma mensagem...')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            
            <button 
              className="wr3-send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              title={t('send', 'Enviar')}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Prompt Dialog */}
      <EnhancedPromptDialog
        isOpen={showEnhancedPrompt}
        onClose={() => setShowEnhancedPrompt(false)}
        originalPrompt={lastUserPrompt}
        context={{
          agentResponses: lastAgentResponses,
          domain: detectDomainFromPrompt(lastUserPrompt)
        }}
        onRefinedPrompt={(refinedPrompt) => {
          setInputValue(refinedPrompt)
          setCurrentRefinedPrompt(refinedPrompt) // Salvar o prompt refinado
          setShowEnhancedPrompt(false)
        }}
        agentResponses={lastAgentResponses}
      />

      {/* Real Time Feedback */}
      <RealTimeFeedback
        isActive={isLoading}
        currentPhase={currentPhase}
        activeAgents={activeAgents}
        progress={agentProgress}
        metrics={analysisMetrics}
        messages={messages}
      />

      {/* Code Graph Integration */}
      {showCodeGraph && (
        <CodeGraphIntegration
          isOpen={showCodeGraph}
          onClose={() => setShowCodeGraph(false)}
          onAnalysisComplete={(result) => {
            if (result.prompt) {
              setInputValue(result.prompt)
              setShowCodeGraph(false)
            }
          }}
          currentContext={{
            conversation: currentConversationId,
            messages: messages.slice(-5) // Últimas 5 mensagens para contexto
          }}
        />
      )}

    </div>
  )
}

// Helper function para detectar domínio
function detectDomainFromPrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('jogo') || lowerPrompt.includes('game') || lowerPrompt.includes('mario')) {
    return 'gaming'
  } else if (lowerPrompt.includes('sistema') || lowerPrompt.includes('app') || lowerPrompt.includes('software')) {
    return 'software'
  } else if (lowerPrompt.includes('empresa') || lowerPrompt.includes('negócio') || lowerPrompt.includes('vender')) {
    return 'business'
  }
  
  return 'general'
}

export default WarRoom3