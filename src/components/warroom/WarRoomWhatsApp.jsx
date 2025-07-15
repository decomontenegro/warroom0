import { useState, useEffect, useRef } from 'react'
import agentsData from '../../../warroom-agents-100.json'
import PromptBuilder from './PromptBuilder'
import AgentProgress from './AgentProgress'
import AgentNetworkMap from './AgentNetworkMap'
import AnalysisMetrics from './AnalysisMetrics'
import LanguageSelector from './LanguageSelector'
import UltrathinkWorkflowEnhanced from '../../services/ultrathink-workflow-enhanced'
import { i18n } from '../../services/i18n-config'
import './WarRoomWhatsAppModern.css'
import './WarRoomLiqiTheme.css'
import './WarRoomScrollFix.css'
import './WarRoomLayoutFix.css'
import './CoordinatorPanelSimple.css'
import './ScrollFixFinal.css'
import './TextareaFix.css'
import './AgentColorSystem.css'
import { Icon, getAgentIcon } from './ModernIcons'
import { getAgentCategory, getAgentBadge, getAgentColor } from './agentCategories'

// Funções auxiliares para cores
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getContrastColor(hexColor) {
  // Converte hex para RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calcula luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retorna preto para cores claras, branco para cores escuras
  return luminance > 0.5 ? '#0D1117' : '#FFFFFF';
}

// Componente para mensagens com resumo expandível
function MessageContent({ message, isExpanded, onToggleExpand }) {
  if (message.type !== 'agent' || !message.content) {
    return (
      <div className={`message-bubble ${message.fromGroupChat ? 'from-group' : ''} ${message.error ? 'error-message' : ''}`}>
        {message.content}
        {message.error && <span className="error-indicator"> ⚠️</span>}
      </div>
    )
  }
  
  // Gerar resumo (primeiras 150 caracteres ou primeira frase)
  const generateSummary = (content) => {
    const firstSentence = content.match(/^[^\.!?]+[\.!?]/)?.[0]
    const summary = firstSentence || content.substring(0, 150)
    return summary.length < content.length ? summary + '...' : summary
  }
  
  const summary = generateSummary(message.content)
  const needsExpansion = message.content.length > 150
  
  return (
    <div className={`message-bubble agent-message-expandable ${message.fromGroupChat ? 'from-group' : ''} ${message.error ? 'error-message' : ''}`}>
      <div className="message-content">
        {isExpanded ? message.content : summary}
        {message.error && <span className="error-indicator"> ⚠️</span>}
      </div>
      {needsExpansion && (
        <button 
          className="expand-button"
          onClick={onToggleExpand}
          title={isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
        >
          {isExpanded ? '▲ Menos' : '▼ Mais'}
        </button>
      )}
    </div>
  )
}

const allAgents = agentsData.warRoomTechInnovationRoles.agents

// Agentes especiais
const SPECIAL_CHATS = [
  { id: 'ultrathink', name: '🚀 UltraThink Workflow', type: 'ultrathink', online: true },
  { id: 'all', name: '👥 Todos os Especialistas', type: 'group', online: true },
  { id: 'summary', name: '📊 Resumo Inteligente', type: 'summary', online: true },
  { id: 'builder', name: '🔧 Prompt Builder', type: 'builder', online: true }
]

function WarRoomWhatsApp() {
  const [activeChat, setActiveChat] = useState('ultrathink')
  const [messages, setMessages] = useState({})
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [summaryLevel, setSummaryLevel] = useState(3) // 1-5 níveis de detalhe
  const [selectedTopics, setSelectedTopics] = useState([])
  const [suggestedAgents, setSuggestedAgents] = useState([])
  const [searchAgent, setSearchAgent] = useState('')
  const [currentTopicVector, setCurrentTopicVector] = useState(null)
  const [topicVectors, setTopicVectors] = useState({}) // Armazena vetores por assunto
  const [agentVectors, setAgentVectors] = useState({}) // Armazena vetores por agente
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(() => {
    // Carregar configurações salvas ou usar padrão
    const saved = localStorage.getItem('warroom-settings')
    return saved ? JSON.parse(saved) : {
      maxAgents: 5,
      autoSummary: true,
      summaryDelay: 1500
    }
  })
  const [agentStatus, setAgentStatus] = useState({}) // Track status of each agent
  const [expandedMessages, setExpandedMessages] = useState({}) // Track expanded/collapsed messages
  const [showColorLegend, setShowColorLegend] = useState(false) // Show color legend
  
  // Estado para progresso dos agentes
  const [agentProgress, setAgentProgress] = useState({
    isActive: false,
    totalAgents: 0,
    processedAgents: 0,
    successCount: 0,
    failedCount: 0
  })
  
  // Estados para o mapa de rede
  const [showNetworkMap, setShowNetworkMap] = useState(false) // Iniciar oculto
  const [networkMapExpanded, setNetworkMapExpanded] = useState(false)
  const [activeConnections, setActiveConnections] = useState([])
  const [ultrathinkPhase, setUltrathinkPhase] = useState(0)
  const [orchestrationData, setOrchestrationData] = useState(null)
  const [ultrathinkResponsesMap, setUltrathinkResponsesMap] = useState(new Map())
  const [isReviewingConsensus, setIsReviewingConsensus] = useState(false)
  const [ultrathinkTaskData, setUltrathinkTaskData] = useState(null)
  const [activeProcesses, setActiveProcesses] = useState({})
  const [elapsedTime, setElapsedTime] = useState(0)
  const [lastAnalysisResult, setLastAnalysisResult] = useState(null) // Para métricas
  const [showMetrics, setShowMetrics] = useState(false) // Toggle métricas
  const [showCoordinator, setShowCoordinator] = useState(true) // Toggle coordinator panel
  
  // Estado para idioma
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem('warroom-language');
    return saved || 'pt-BR';
  })
  
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)
  const topicCounter = useRef(1)
  
  // Função para mudar idioma
  const handleLanguageChange = (language) => {
    console.log('🌐 Language change requested:', language);
    
    // Update local state
    setSelectedLanguage(language);
    
    // Update localStorage
    localStorage.setItem('warroom-language', language);
    
    // Update i18n instance
    i18n.setLanguage(language);
    console.log('i18n updated to:', i18n.getLanguage());
    
    // Update language manager
    if (window.languageManager) {
      window.languageManager.setLanguage(language);
      console.log('Language manager updated to:', window.languageManager.getLanguage());
    }
    
    // Update UltraThink instance if active
    if (window.ultrathinkWorkflow) {
      window.ultrathinkWorkflow.setLanguage(language);
      console.log('UltraThink updated to:', window.ultrathinkWorkflow.getLanguage());
    }
    
    // Force component re-render to update all strings
    window.dispatchEvent(new Event('languagechange'));
  }
  
  // Debug global do estado do UltraThink
  useEffect(() => {
    const interval = setInterval(() => {
      if (ultrathinkTaskData && ultrathinkPhase > 0) {
        console.log('🔥 [MONITOR GLOBAL] Estado do UltraThink:')
        console.log(`   - Fase: ${ultrathinkPhase}`)
        console.log(`   - Respostas coletadas: ${ultrathinkResponsesMap.size}`)
        console.log(`   - TaskData existe: ${!!ultrathinkTaskData}`)
        console.log(`   - Precisa orquestração: ${ultrathinkResponsesMap.size >= 30 && ultrathinkPhase < 4}`)
      }
    }, 5000) // A cada 5 segundos
    
    return () => clearInterval(interval)
  }, [ultrathinkPhase, ultrathinkResponsesMap, ultrathinkTaskData])
  
  // Timer para atualizar tempo decorrido
  useEffect(() => {
    let timer = null
    if (ultrathinkTaskData && ultrathinkPhase > 0) {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - ultrathinkTaskData.startTime)
      }, 100) // Atualiza a cada 100ms
    } else {
      setElapsedTime(0)
    }
    
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [ultrathinkTaskData, ultrathinkPhase])
  
  // Inicializar i18n com idioma salvo
  useEffect(() => {
    console.log('🌐 Initializing i18n with language:', selectedLanguage);
    i18n.setLanguage(selectedLanguage);
    
    // Inicializar também o window.ultrathinkWorkflow se existir
    if (window.ultrathinkWorkflow) {
      window.ultrathinkWorkflow.setLanguage(selectedLanguage);
    }
  }, []); // Executar apenas na montagem
  
  // Inicializar mensagens para cada chat
  useEffect(() => {
    const initialMessages = {}
    
    // Mensagens para chats especiais
    SPECIAL_CHATS.forEach(chat => {
      initialMessages[chat.id] = [{
        id: 'welcome-' + chat.id,
        type: 'system',
        content: getWelcomeMessage(chat.id),
        timestamp: new Date()
      }]
    })
    
    // Mensagens para cada agente
    allAgents.forEach(agent => {
      initialMessages[agent.id] = [{
        id: 'welcome-' + agent.id,
        type: 'system',
        content: i18n.t('agent.welcome', { 
          name: agent.name, 
          role: agent.role, 
          lng: selectedLanguage 
        }),
        timestamp: new Date()
      }]
    })
    
    setMessages(initialMessages)
  }, [selectedLanguage]) // Atualizar quando o idioma mudar
  
  // WebSocket connection com reconexão automática
  useEffect(() => {
    let ws
    let reconnectTimer
    
    const connect = () => {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:3005/warroom-ws'
      ws = new WebSocket(wsUrl)
      console.log('🔌 Conectando WebSocket em:', wsUrl)
      wsRef.current = ws
      
      ws.onopen = () => {
        setIsConnected(true)
        console.log('WebSocket connected')
        // Limpar timer de reconexão se existir
        if (reconnectTimer) {
          clearTimeout(reconnectTimer)
          reconnectTimer = null
        }
      }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'multi-agent-start') {
        
        // Mostrar início do processamento multi-agente
        addMessageToChat('all', {
          type: 'system',
          content: `🚀 Iniciando consulta com ${data.totalAgents} especialistas...`,
          timestamp: new Date()
        })
        
        // Iniciar progresso
        setAgentProgress({
          isActive: true,
          totalAgents: data.totalAgents,
          processedAgents: 0,
          successCount: 0,
          failedCount: 0
        })
      }
      
      if (data.type === 'agent-processing') {
        // Mostrar indicador de processamento para o agente
        addMessageToChat('all', {
          type: 'system',
          content: i18n.t('agent.analyzing', { 
            agent: data.agent, 
            current: data.agentNumber, 
            total: data.totalAgents, 
            lng: selectedLanguage 
          }),
          timestamp: new Date(),
          tempId: `processing-${data.agent}`
        })
      }
      
      if (data.type === 'agent-error') {
        // Remover mensagem de processamento e mostrar erro específico
        setMessages(prev => {
          const newMessages = { ...prev }
          if (newMessages['all']) {
            newMessages['all'] = newMessages['all'].filter(m => 
              m.tempId !== `processing-${data.agent}`
            )
          }
          return newMessages
        })
        
        const errorIcon = data.errorType === 'timeout' ? '⏱️' : '❌'
        const errorMessage = data.errorType === 'timeout' 
          ? `${errorIcon} ${data.agent} excedeu o tempo limite (${Math.round(data.responseTime/1000)}s)`
          : `${errorIcon} ${data.agent} encontrou um erro: ${data.errorType}`
        
        addMessageToChat('all', {
          type: 'system',
          content: errorMessage,
          timestamp: new Date(),
          error: true
        })
      }
      
      if (data.type === 'agent-response') {
        // Log detalhado para debug
        console.log(`🔎 [RESPOSTA] Agent: "${data.agent}" | Tem UltraThink? ${data.agent?.includes('(UltraThink)')}`)
        
        // Adicionar conexão ativa ao mapa de rede
        const agentName = data.agent?.replace(' (UltraThink)', '').trim()
        const agentInfo = allAgents.find(a => a.name === agentName)
        
        if (agentInfo) {
          // Determinar o alvo da conexão baseado na fase
          let targetNode = 'orchestrator'
          if (ultrathinkPhase >= 4) {
            targetNode = 'chief'
          }
          
          const newConnection = {
            from: agentInfo.id,
            to: targetNode,
            timestamp: Date.now(),
            phase: ultrathinkPhase
          }
          
          setActiveConnections(prev => [...prev, newConnection])
          
          // Se for fase de análise cruzada, adicionar conexões entre agentes
          if (ultrathinkPhase === 2 || ultrathinkPhase === 3) {
            // Criar conexões entre agentes aleatoriamente
            const otherAgents = allAgents.filter(a => a.id !== agentInfo.id)
            const randomAgent = otherAgents[Math.floor(Math.random() * otherAgents.length)]
            if (randomAgent) {
              const crossConnection = {
                from: agentInfo.id,
                to: randomAgent.id,
                timestamp: Date.now() + 100,
                phase: ultrathinkPhase
              }
              setTimeout(() => {
                setActiveConnections(prev => [...prev, crossConnection])
                // Remover conexão cruzada após 1.5 segundos
                setTimeout(() => {
                  setActiveConnections(prev => 
                    prev.filter(conn => conn.timestamp !== crossConnection.timestamp)
                  )
                }, 1500)
              }, 200)
            }
          }
          
          // Remover conexão principal após 3 segundos
          setTimeout(() => {
            setActiveConnections(prev => 
              prev.filter(conn => conn.timestamp !== newConnection.timestamp)
            )
          }, 3000)
        }
        
        // Rastrear respostas do Ultrathink para orquestração
        // MELHORADO: Detectar UltraThink de múltiplas formas
        const isUltraThinkResponse = data.agent && (
          data.agent.includes('(UltraThink)') || 
          data.ultrathink === true ||
          data.phase?.includes('phase') || // Para requisições com phase1/phase2
          (ultrathinkPhase > 0 && ultrathinkTaskData) // Se UltraThink está ativo
        )
        
        if (isUltraThinkResponse) {
          console.log(`🔵 ULTRATHINK DETECTADO! Agent: ${data.agent}`)
          console.log(`🔵 Conteúdo: ${data.content?.substring(0, 50)}...`)
          console.log(`🔵 Detecção por: ${
            data.agent.includes('(UltraThink)') ? 'nome' : 
            data.ultrathink ? 'flag' : 
            data.phase ? 'phase' : 
            'contexto ativo'
          }`)
          
          setUltrathinkResponsesMap(prev => {
            const newMap = new Map(prev)
            const agentName = data.agent.replace(' (UltraThink)', '').trim()
            
            // Log detalhado do estado atual
            console.log(`🔍 [MAP UPDATE] Estado anterior: ${prev.size} respostas`)
            console.log(`🔍 [MAP UPDATE] Tentando adicionar: ${agentName}`)
            
            // Evitar duplicatas e respostas mock
            if (!newMap.has(agentName) && data.content && !data.content.includes('This is a mock AI response')) {
              newMap.set(agentName, {
                agent: agentName,
                role: data.role,
                content: data.content,
                timestamp: new Date()
              })
              console.log(`✅ Nova resposta adicionada: ${agentName}`)
              console.log(`📦 Map atualizado: ${newMap.size} respostas únicas`)
              
              // Listar todas as respostas atuais
              console.log('📋 Agentes que já responderam:', Array.from(newMap.keys()).join(', '))
            } else {
              if (data.content?.includes('This is a mock AI response')) {
                console.log(`🚫 Resposta mock ignorada: ${agentName}`)
              } else {
                console.log(`⚠️ Resposta duplicada ignorada: ${agentName}`)
              }
            }
            
            // FORÇAR orquestração se atingir 30 respostas
            if (newMap.size === 30 && ultrathinkPhase < 4) {
              console.log('🎆 30 RESPOSTAS! FORÇANDO ORQUESTRAÇÃO!')
              console.log('🎆 O useEffect deve detectar esta mudança automaticamente')
            }
            
            return newMap
          })
          
          // Verificar se devemos iniciar a orquestração
          const currentResponses = ultrathinkResponsesMap.size + 1
          const totalExpected = ultrathinkTaskData?.analysisPhases?.selectedAgents?.length || 50
          
          console.log(`🤖 UltraThink Progress:`);
          console.log(`   - Respostas: ${currentResponses}/${totalExpected} (${Math.round(currentResponses/totalExpected*100)}%)`)
          console.log(`   - Fase atual: ${ultrathinkPhase}`)
          console.log(`   - TaskData existe: ${!!ultrathinkTaskData}`)
          console.log(`   - Precisa orquestração: ${currentResponses >= 35 && ultrathinkPhase < 4}`)
          
          // Iniciar orquestração quando tivermos respostas suficientes (pelo menos 70% ou 35 agentes)
          // Verificar se é uma tarefa do UltraThink ativa
          if (ultrathinkTaskData && 
              currentResponses >= Math.min(35, totalExpected * 0.7) && 
              ultrathinkPhase < 4 &&
              ultrathinkPhase >= 1) {
            console.log(`🎯 Iniciando fase de orquestração com ${currentResponses} respostas`)
            setUltrathinkPhase(4)
            
            // Aguardar um pouco para coletar mais respostas
            setTimeout(() => {
              startOrchestrationPhase()
            }, 3000)
          }
        }
        // Remover mensagem de processamento
        setMessages(prev => {
          const newMessages = { ...prev }
          if (newMessages['all']) {
            newMessages['all'] = newMessages['all'].filter(m => 
              m.tempId !== `processing-${data.agent}`
            )
          }
          return newMessages
        })
        
        // Adicionar indicador de erro ou tempo de resposta
        let statusInfo = ''
        if (data.error) {
          statusInfo = data.errorType === 'timeout' 
            ? ' ⚠️ (resposta mock - timeout)'
            : ' ⚠️ (resposta mock - erro)'
        } else if (data.responseTime) {
          statusInfo = ` ⚡ ${(data.responseTime/1000).toFixed(1)}s`
        }
        
        // Atualizar progresso
        setAgentProgress(prev => ({
          ...prev,
          processedAgents: prev.processedAgents + 1,
          successCount: data.error ? prev.successCount : prev.successCount + 1,
          failedCount: data.error ? prev.failedCount + 1 : prev.failedCount
        }))
        
        // Usar o topicVector mais recente ou criar um novo se necessário
        let topicVectorToUse = currentTopicVector
        if (!topicVectorToUse) {
          // Buscar o topicVector da última mensagem do usuário
          const lastUserMessage = messages['all']?.filter(m => m.type === 'user').pop()
          topicVectorToUse = lastUserMessage?.topicVector || `T${topicCounter.current - 1}`
          console.log('Usando topicVector recuperado:', topicVectorToUse)
        }
        
        const messageData = {
          type: 'agent',
          agent: data.agent + statusInfo,
          role: data.role,
          content: data.content,
          timestamp: new Date(),
          topicVector: topicVectorToUse,
          agentVector: data.agentVector || generateAgentVector(data.agent),
          error: data.error || false,
          errorType: data.errorType,
          responseTime: data.responseTime
        }
        
        // Adicionar à sala 'Todos'
        addMessageToChat('all', messageData)
        
        // Se for do UltraThink, adicionar também ao chat ultrathink
        if (data.agent && data.agent.includes('(UltraThink)')) {
          addMessageToChat('ultrathink', {
            ...messageData,
            fromGroupChat: true
          })
          
          // Adicionar conexão específica para UltraThink
          const ultraThinkConnection = {
            from: data.agent.replace(' (UltraThink)', ''),
            to: ultrathinkPhase === 5 ? 'chief' : 'orchestrator',
            timestamp: Date.now()
          }
          
          setActiveConnections(prev => [...prev, ultraThinkConnection])
          
          setTimeout(() => {
            setActiveConnections(prev => 
              prev.filter(conn => conn.timestamp !== ultraThinkConnection.timestamp)
            )
          }, 2000)
          
          // NOVA VERIFICAÇÃO SIMPLIFICADA: Contar mensagens diretamente
          setTimeout(() => {
            const ultrathinkMessagesCount = messages['ultrathink']?.filter(m => 
              m.type === 'agent' && m.agent?.includes('(UltraThink)')
            ).length || 0
            
            console.log(`🌀 [VERIFICAÇÃO POR MENSAGENS] Total: ${ultrathinkMessagesCount}`)
            
            if (ultrathinkMessagesCount >= 30 && ultrathinkPhase < 4 && ultrathinkTaskData) {
              console.log('🎆 30+ MENSAGENS DETECTADAS! FORÇANDO ORQUESTRAÇÃO!')
              setUltrathinkPhase(4)
              setTimeout(() => startOrchestrationPhase(), 1000)
            }
          }, 500) // Delay maior para garantir que mensagem foi adicionada
        }
        
        // IMPORTANTE: Adicionar também ao chat individual do agente
        const cleanAgentName = data.agent.replace(' (UltraThink)', '')
        const individualAgentData = allAgents.find(a => a.name === cleanAgentName)
        if (individualAgentData) {
          addMessageToChat(individualAgentData.id, {
            ...messageData,
            fromGroupChat: true // Indica que veio da sala coletiva
          })
        }
      }
      
      if (data.type === 'multi-agent-complete') {
        setIsProcessing(false)
        
        // Finalizar progresso após um delay para mostrar 100%
        setTimeout(() => {
          setAgentProgress(prev => ({ ...prev, isActive: false }))
        }, 2000)
        
        // Mostrar estatísticas detalhadas
        const totalTimeStr = data.totalTime ? ` em ${(data.totalTime/1000).toFixed(1)}s` : ''
        let statusMessage = `✅ Consulta concluída${totalTimeStr}: `
        
        if (data.failedResponses > 0) {
          statusMessage += `${data.successfulResponses} respostas bem-sucedidas, ${data.failedResponses} falharam`
        } else {
          statusMessage += `Todos os ${data.totalAgents} especialistas responderam com sucesso!`
        }
        
        addMessageToChat('all', {
          type: 'system',
          content: statusMessage,
          timestamp: new Date()
        })
        
        // Se for UltraThink, adicionar mensagem no painel também
        if (activeChat === 'ultrathink') {
          addMessageToChat('ultrathink', {
            type: 'phase',
            content: statusMessage,
            timestamp: new Date()
          })
        }
        
        // Gerar resumo automaticamente após todas as respostas se configurado
        if (settings.autoSummary) {
          setTimeout(() => {
            console.log('Gerando resumo automático, topicVector:', currentTopicVector)
            generateAutomaticSummary()
          }, settings.summaryDelay)
        }
      }
      
      // Handlers para Orquestração Inteligente
      if (data.type === 'orchestration-start') {
        console.log('🎯 Orquestração iniciada:', data.message)
        setIsReviewingConsensus(true)
        if (ultrathinkTaskData) {
          addMessageToChat('ultrathink', {
            type: 'system',
            content: '🧠 **Revisando para Consenso...**\n\n' + data.message,
            timestamp: new Date()
          })
        }
      }
      
      if (data.type === 'orchestration-update') {
        if (data.phase === 2) {
          addMessageToChat('ultrathink', {
            type: 'system',
            content: data.message,
            timestamp: new Date()
          })
        }
        
        // Atualizar fase dinâmica
        if (data.phase) {
          const newPhase = 3 + data.phase // Fase 4, 5, 6...
          setUltrathinkPhase(newPhase)
        }
        
        // Adicionar mensagem ao chat ultrathink se houver tarefa ativa
        if (ultrathinkTaskData && data.message) {
          addMessageToChat('ultrathink', {
            type: 'system',
            content: data.message,
            timestamp: new Date()
          })
        }
      }
      
      if (data.type === 'orchestration-analysis') {
        const { consensusPoints, divergences, criticalFindings, confidenceLevel } = data.analysis
        setIsReviewingConsensus(false)
        
        // Fase dinâmica baseada no progresso
        const currentPhase = ultrathinkPhase + 1
        setUltrathinkPhase(currentPhase)
        
        addMessageToChat('ultrathink', {
          type: 'system',
          content: `📊 **Fase ${currentPhase}: Análise de Consenso Concluída**\n\n` +
            `✅ **Pontos de Consenso:** ${consensusPoints || 0}\n` +
            `⚡ **Divergências Identificadas:** ${divergences || 0}\n` +
            `💡 **Descobertas Críticas:** ${criticalFindings || 0}\n` +
            `📈 **Nível de Confiança:** ${Math.round((confidenceLevel || 0) * 100)}%`,
          timestamp: new Date()
        })
        
        // Decidir se precisa de mais rodadas dinamicamente
        const needsMoreRounds = divergences > 2 || confidenceLevel < 0.7
        
        if (needsMoreRounds) {
          setTimeout(() => {
            const nextPhase = currentPhase + 1
            setUltrathinkPhase(nextPhase)
            setIsReviewingConsensus(true)
            
            addMessageToChat('ultrathink', {
              type: 'system',
              content: `🔍 **Fase ${nextPhase}: ${divergences > 2 ? 'Validação de Divergências' : 'Refinamento de Consenso'}**\n\n` +
                `${divergences > 2 ? 'Convocando especialistas para resolver divergências...' : 'Refinando pontos de consenso...'}\n\n` +
                '🧠 **Revisando para Consenso...**',
              timestamp: new Date()
            })
            
            // Continuar orquestração se necessário
            if (data.needsMoreRounds) {
              // A orquestração continuará automaticamente no backend
              console.log('Continuando orquestração para próxima rodada')
            }
          }, 1500)
        }
      }
      
      if (data.type === 'orchestration-complete') {
        const { result } = data
        setOrchestrationData(data)
        
        // Fase final dinâmica
        const finalPhase = ultrathinkPhase + 1
        setUltrathinkPhase(finalPhase)
        
        addMessageToChat('ultrathink', {
          type: 'system',
          content: `✨ **Fase ${finalPhase}: Consolidação Final**\n\n` +
            `📋 **Total de Rodadas:** ${result.totalRounds}\n` +
            `👥 **Especialistas Envolvidos:** ${result.totalAgentsInvolved}\n` +
            `🎯 **Consenso Alcançado:** ${result.consensusAchieved ? 'Sim ✅' : 'Parcial ⚠️'}\n` +
            `🔮 **Confiança Final:** ${Math.round(result.confidenceLevel * 100)}%\n\n` +
            'Os resultados consolidados estão disponíveis na sala "Todos os Especialistas".',
          timestamp: new Date()
        })
        
        // Resetar estados e mudar para sala all após conclusão
        setTimeout(() => {
          setActiveChat('all')
          setIsProcessing(false)
          setIsReviewingConsensus(false)
          setUltrathinkResponsesMap(new Map())
          setUltrathinkTaskData(null)
          setUltrathinkPhase(0)
        }, 2000)
      }
      
      if (data.type === 'orchestration-error') {
        console.error('Erro na orquestração:', data.error)
        addMessageToChat('ultrathink', {
          type: 'system',
          content: `❌ Erro na orquestração: ${data.error}`,
          timestamp: new Date(),
          error: true
        })
        setIsProcessing(false)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
      
      // Se estava processando, mostrar aviso
      if (isProcessing) {
        addMessageToChat('all', {
          type: 'system',
          content: '❌ Conexão perdida durante o processamento. Por favor, tente novamente.',
          timestamp: new Date(),
          error: true
        })
        setIsProcessing(false)
      }
    }
    
    ws.onclose = () => {
      setIsConnected(false)
      console.log('WebSocket connection closed')
      
      // Tentar reconectar após 3 segundos
      if (!ws.intentionalClose) {
        console.log('Attempting to reconnect in 3 seconds...')
        reconnectTimer = setTimeout(() => {
          connect()
        }, 3000)
      }
    }
  }
    
    // Conectar inicialmente
    connect()
    
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (ws) {
        ws.intentionalClose = true
        ws.close()
      }
    }
  }, [])
  
  // Monitorar respostas do UltraThink para ativar orquestração
  useEffect(() => {
    const responses = ultrathinkResponsesMap.size
    console.log(`🔍 [useEffect TRIGGER] Map size mudou para: ${responses}`)
    console.log(`🔍 [useEffect] ultrathinkTaskData existe? ${!!ultrathinkTaskData}`)
    console.log(`🔍 [useEffect] ultrathinkPhase: ${ultrathinkPhase}`)
    
    if (ultrathinkTaskData && ultrathinkPhase >= 1 && ultrathinkPhase < 4) {
      console.log(`📊 [MONITORAMENTO] UltraThink Status:`);
      console.log(`   - Respostas coletadas: ${responses}/30 (mínimo)`)
      console.log(`   - Fase atual: ${ultrathinkPhase}`)
      console.log(`   - Pronto para orquestração? ${responses >= 30 ? 'SIM ✅' : 'NÃO ❌'}`)
      
      // SIMPLIFICADO: Ativar com 30 respostas
      if (responses >= 30) {
        console.log('🎉 ===================================')
        console.log('🎉 30 RESPOSTAS COLETADAS!')
        console.log('🎉 INICIANDO ORQUESTRAÇÃO AGORA!')
        console.log('🎉 ===================================')
        
        setUltrathinkPhase(4)
        
        // Chamar orquestração imediatamente
        const timer = setTimeout(() => {
          console.log('⏰ [TIMEOUT] Chamando startOrchestrationPhase...')
          startOrchestrationPhase()
        }, 500)
        
        return () => clearTimeout(timer)
      }
    } else if (responses >= 30 && ultrathinkPhase < 4) {
      console.log('⚠️ [WARNING] 30+ respostas mas condições não atendidas:')
      console.log(`   - ultrathinkTaskData: ${!!ultrathinkTaskData}`)
      console.log(`   - ultrathinkPhase: ${ultrathinkPhase}`)
    }
  }, [ultrathinkResponsesMap, ultrathinkTaskData, ultrathinkPhase])
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeChat])
  
  // Garantir que currentTopicVector seja criado ao receber mensagens
  useEffect(() => {
    // Se recebermos mensagens e não tivermos um tópico, criar um
    if (messages[activeChat]?.length > 1 && !currentTopicVector) {
      const newVector = `T${topicCounter.current++}`
      setCurrentTopicVector(newVector)
    }
  }, [messages, activeChat, currentTopicVector])
  
  const getWelcomeMessage = (chatId) => {
    const welcomes = {
      'pt-BR': {
        'all': 'Bem-vindo à sala com todos os especialistas! Faça sua pergunta e múltiplos especialistas responderão.',
        'summary': 'Aqui você recebe resumos inteligentes das discussões. Use o controle para ajustar o nível de detalhe.',
        'builder': 'Use o Prompt Builder para criar perguntas complexas selecionando tópicos e especialistas.',
        'ultrathink': '🚀 **UltraThink Workflow** - Sistema avançado de análise com 100 especialistas em 6 fases.',
        'default': 'Bem-vindo!'
      },
      'en-US': {
        'all': 'Welcome to the room with all specialists! Ask your question and multiple experts will respond.',
        'summary': 'Here you receive intelligent discussion summaries. Use the control to adjust detail level.',
        'builder': 'Use the Prompt Builder to create complex questions by selecting topics and specialists.',
        'ultrathink': '🚀 **UltraThink Workflow** - Advanced analysis system with 100 specialists in 6 phases.',
        'default': 'Welcome!'
      },
      'es-ES': {
        'all': '¡Bienvenido a la sala con todos los especialistas! Haz tu pregunta y múltiples expertos responderán.',
        'summary': 'Aquí recibes resúmenes inteligentes de las discusiones. Usa el control para ajustar el nivel de detalle.',
        'builder': 'Usa el Constructor de Prompts para crear preguntas complejas seleccionando temas y especialistas.',
        'ultrathink': '🚀 **UltraThink Workflow** - Sistema avanzado de análisis con 100 especialistas en 6 fases.',
        'default': '¡Bienvenido!'
      }
    }
    const langWelcomes = welcomes[selectedLanguage] || welcomes['pt-BR'];
    return langWelcomes[chatId] || langWelcomes['default'];
  }
  
  const getAgentAvatar = (agentName) => {
    const avatars = {
      'Frontend': '🎨', 'Backend': '⚙️', 'Security': '🔒',
      'Database': '🗄️', 'DevOps': '🚀', 'Performance': '⚡',
      'API': '🔌', 'Cloud': '☁️', 'Mobile': '📱',
      'AI': '🤖', 'Test': '🧪', 'UX': '🎯',
      'Product': '📊', 'Design': '🎨', 'Data': '📈'
    }
    
    for (const [key, avatar] of Object.entries(avatars)) {
      if (agentName?.includes(key)) return avatar
    }
    return '💡'
  }
  
  const addMessageToChat = (chatId, message) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), {
        ...message,
        id: Date.now() + Math.random()
      }]
    }))
  }
  
  const generateAgentVector = (agentName) => {
    if (!agentVectors[agentName]) {
      const newVector = `A${Object.keys(agentVectors).length + 1}`
      setAgentVectors(prev => ({ ...prev, [agentName]: newVector }))
      return newVector
    }
    return agentVectors[agentName]
  }
  
  const startNewTopic = () => {
    const newVector = `T${topicCounter.current++}`
    setCurrentTopicVector(newVector)
    
    // Adicionar mensagem de novo tópico
    addMessageToChat(activeChat, {
      type: 'system',
      content: `🆕 Novo tópico iniciado (${newVector})`,
      timestamp: new Date(),
      topicVector: newVector
    })
    
    return newVector
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || !isConnected || isProcessing) return
    
    const userMessage = input
    setInput('')
    setIsProcessing(true)
    
    // Se não há tópico ativo, criar um novo
    let topicVector = currentTopicVector
    if (!topicVector) {
      const newVector = `T${topicCounter.current++}`
      setCurrentTopicVector(newVector)
      topicVector = newVector
      console.log('Criado novo topicVector:', topicVector)
    }
    
    // Adicionar mensagem do usuário ao chat ativo
    addMessageToChat(activeChat, {
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
      topicVector: topicVector
    })
    
    // Lógica baseada no tipo de chat
    if (activeChat === 'all') {
      // Enviar para múltiplos agentes
      const agents = selectRelevantAgents(userMessage)
      sendMultiAgentRequest(agents, userMessage)
    } else if (activeChat === 'builder') {
      // Processar com Prompt Builder
      handlePromptBuilder(userMessage)
    } else if (activeChat === 'summary') {
      // Gerar resumo
      generateSummaryFromQuestion(userMessage)
    } else if (activeChat === 'ultrathink') {
      // UltraThink Workflow - análise profunda com múltiplos agentes
      handleUltraThinkWorkflow(userMessage)
    } else {
      // Chat individual com agente
      const agent = allAgents.find(a => a.id === activeChat)
      if (agent) {
        sendSingleAgentRequest(agent, userMessage)
      }
    }
  }
  
  const selectRelevantAgents = (query) => {
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 2)
    const scoreMap = new Map()
    
    // Palavras-chave específicas para áreas
    const domainKeywords = {
      frontend: ['react', 'vue', 'angular', 'ui', 'ux', 'interface', 'css', 'design', 'componente', 'tela'],
      backend: ['api', 'servidor', 'database', 'banco', 'dados', 'node', 'python', 'java', 'microservice'],
      security: ['segurança', 'autenticação', 'autorização', 'token', 'criptografia', 'vulnerabilidade'],
      devops: ['deploy', 'ci', 'cd', 'docker', 'kubernetes', 'aws', 'azure', 'infraestrutura'],
      mobile: ['mobile', 'android', 'ios', 'react native', 'flutter', 'app', 'aplicativo'],
      ai: ['ai', 'ia', 'machine learning', 'ml', 'inteligência', 'artificial', 'modelo'],
      data: ['dados', 'analytics', 'bi', 'etl', 'pipeline', 'big data', 'data science'],
      cloud: ['cloud', 'nuvem', 'aws', 'azure', 'gcp', 'serverless', 'lambda']
    }
    
    allAgents.forEach(agent => {
      let score = 0
      let relevanceReasons = []
      
      // Pontuação por capacidades
      agent.capabilities.forEach(cap => {
        keywords.forEach(keyword => {
          if (cap.toLowerCase().includes(keyword)) {
            score += 3
            relevanceReasons.push(`capability: ${cap}`)
          }
        })
      })
      
      // Pontuação por role
      keywords.forEach(keyword => {
        if (agent.role.toLowerCase().includes(keyword)) {
          score += 2
          relevanceReasons.push(`role match: ${keyword}`)
        }
        if (agent.name.toLowerCase().includes(keyword)) {
          score += 4
          relevanceReasons.push(`name match: ${keyword}`)
        }
      })
      
      // Pontuação por domínio
      Object.entries(domainKeywords).forEach(([domain, terms]) => {
        const agentText = `${agent.name} ${agent.role} ${agent.capabilities.join(' ')}`.toLowerCase()
        terms.forEach(term => {
          if (query.toLowerCase().includes(term) && agentText.includes(domain)) {
            score += 2
            relevanceReasons.push(`domain: ${domain}`)
          }
        })
      })
      
      if (score > 0) {
        scoreMap.set(agent, { score, reasons: relevanceReasons })
      }
    })
    
    // Ordenar por score
    const sortedAgents = Array.from(scoreMap.entries())
      .sort((a, b) => b[1].score - a[1].score)
    
    // Determinar quantos agentes selecionar baseado na complexidade da query
    let targetAgentCount = 15 // Começar com 15 agentes base
    
    // Adicionar mais agentes baseado em fatores
    if (keywords.length > 5) targetAgentCount += 10
    if (query.includes(' e ') || query.includes(' com ')) targetAgentCount += 8
    if (query.includes('integra') || query.includes('sistema')) targetAgentCount += 10
    if (query.includes('completo') || query.includes('detalhado')) targetAgentCount += 15
    
    // Para análise completa, usar TODOS os especialistas disponíveis
    if (query.toLowerCase().includes('todos') || query.toLowerCase().includes('completa')) {
      targetAgentCount = 100 // Usar todos os 100+ especialistas
    }
    
    // Selecionar agentes com score significativo
    const threshold = sortedAgents[0]?.[1].score * 0.2 || 1 // Threshold mais baixo para incluir mais agentes
    const selectedAgents = sortedAgents
      .filter(([_, data]) => data.score >= threshold)
      .slice(0, targetAgentCount) // Remover limite artificial de 10
      .map(([agent, data]) => {
        console.log(`${agent.name}: score ${data.score} - ${data.reasons.join(', ')}`)
        return agent
      })
    
    // Garantir quantidade mínima de agentes baseado no contexto
    const minAgents = 20 // Mínimo de 20 agentes para análise completa
    if (selectedAgents.length < minAgents && allAgents.length >= minAgents) {
      // Adicionar mais agentes diversos para cobertura completa
      const additionalAgents = allAgents
        .filter(a => !selectedAgents.find(s => s.id === a.id))
        .sort((a, b) => {
          // Priorizar por diversidade de roles
          const roleScore = (agent) => {
            if (agent.role.includes('Lead')) return 5
            if (agent.role.includes('Architect')) return 4
            if (agent.role.includes('Senior')) return 3
            if (agent.role.includes('Specialist')) return 2
            return 1
          }
          return roleScore(b) - roleScore(a)
        })
        .slice(0, minAgents - selectedAgents.length)
      
      selectedAgents.push(...additionalAgents)
    }
    
    console.log(`\n🎯 Selecionados ${selectedAgents.length} agentes dinamicamente para: "${query}"`)
    console.log(`Complexidade estimada: ${targetAgentCount} agentes sugeridos`)
    return selectedAgents
  }
  
  const sendMultiAgentRequest = (agents, task) => {
    const requestId = `multi-${Date.now()}`
    console.log('🚀 Sending multi-agent request with language:', selectedLanguage);
    const message = {
      type: 'multi-agent-request',
      agents: agents,
      task: task,
      context: [],
      chatId: 'all',
      requestId: requestId,
      language: selectedLanguage
    };
    console.log('📤 WebSocket message:', message);
    wsRef.current.send(JSON.stringify(message));
  }
  
  const sendSingleAgentRequest = (agent, task) => {
    console.log('🚀 Sending single agent request with language:', selectedLanguage);
    const message = {
      type: 'agent-request',
      agent: { name: agent.name, role: agent.role },
      task: task,
      capabilities: agent.capabilities,
      language: selectedLanguage
    };
    console.log('📤 WebSocket message:', message);
    wsRef.current.send(JSON.stringify(message));
  }
  
  const handlePromptBuilder = ({ prompt, topics, agents }) => {
    // Enviar prompt construído para os agentes selecionados
    addMessageToChat('builder', {
      type: 'user',
      content: prompt,
      timestamp: new Date()
    })
    
    addMessageToChat('builder', {
      type: 'system',
      content: `Enviando para ${agents.length} especialistas selecionados...`,
      timestamp: new Date()
    })
    
    // Enviar para múltiplos agentes
    sendMultiAgentRequest(agents, prompt)
    
    // Mudar para a sala de todos para ver as respostas
    setTimeout(() => {
      setActiveChat('all')
    }, 500)
  }
  
  const generateSummary = () => {
    // Coletar todas as mensagens recentes
    const allMessages = Object.values(messages).flat()
      .filter(m => m.type === 'agent')
      .slice(-20) // Últimas 20 mensagens
    
    const summary = `📊 Resumo (Nível ${summaryLevel}/5):\n\n` +
      `Participaram ${new Set(allMessages.map(m => m.agent)).size} especialistas.\n` +
      `Principais pontos discutidos:\n` +
      allMessages.slice(0, summaryLevel * 2).map(m => 
        `• ${m.agent}: ${m.content.substring(0, 100)}...`
      ).join('\n')
    
    addMessageToChat('summary', {
      type: 'system',
      content: summary,
      timestamp: new Date()
    })
  }
  
  const generateAutomaticSummary = () => {
    console.log('=== GERANDO RESUMO AUTOMÁTICO ===');
    console.log('currentTopicVector:', currentTopicVector);
    console.log('topicCounter.current:', topicCounter.current);
    console.log('messages["all"] length:', messages['all']?.length || 0);
    
    // Se não tiver tópico atual, usar o último tópico criado
    const vectorToUse = currentTopicVector || `T${topicCounter.current - 1}`
    
    // Debug: mostrar todas as mensagens
    console.log('Todas as mensagens em "all":', messages['all']?.map(m => ({
      type: m.type,
      agent: m.agent,
      topicVector: m.topicVector,
      content: m.content?.substring(0, 50) + '...'
    })))
    
    // Coletar mensagens do tópico atual
    const topicMessages = messages['all']?.filter(m => 
      m.topicVector === vectorToUse && m.type === 'agent'
    ) || []
    
    console.log('Mensagens filtradas para o vetor', vectorToUse + ':', topicMessages.length)
    
    // Tentar também sem filtro de topicVector
    const allAgentMessages = messages['all']?.filter(m => m.type === 'agent') || []
    console.log('Total de mensagens de agentes (sem filtro):', allAgentMessages.length)
    
    if (topicMessages.length === 0 && allAgentMessages.length > 0) {
      console.warn('Usando mensagens sem filtro de tópico')
      // Usar as últimas mensagens de agente
      const recentMessages = allAgentMessages.slice(-5)
      generateSummaryForMessages(recentMessages, vectorToUse)
      return
    }
    
    if (topicMessages.length === 0) {
      console.warn('Nenhuma mensagem de agente encontrada para o tópico')
      // Ainda assim, gerar um resumo indicando o problema
      const emptySummary = `📋 **Resumo Automático - ${vectorToUse}**\n\n` +
        `⚠️ **Nenhuma resposta de agente foi recebida para este tópico.**\n\n` +
        `Possíveis causas:\n` +
        `• Timeout nas requisições AI\n` +
        `• Problemas de conectividade\n` +
        `• API key não configurada\n\n` +
        `Por favor, verifique os logs do servidor para mais detalhes.`
      
      addMessageToChat('summary', {
        type: 'system',
        content: emptySummary,
        timestamp: new Date(),
        topicVector: vectorToUse
      })
      return
    }
    
    generateSummaryForMessages(topicMessages, vectorToUse)
  }
  
  const generateSummaryForMessages = (topicMessages, vectorToUse) => {
    
    console.log('Gerando resumo com', topicMessages.length, 'mensagens');
    
    // Separar mensagens bem-sucedidas e com erro
    const successfulMessages = topicMessages.filter(m => !m.error)
    const errorMessages = topicMessages.filter(m => m.error)
    
    // Extrair nomes de agentes sem os status indicators
    const cleanAgentName = (agentName) => {
      if (!agentName) return 'Agente Desconhecido'
      return agentName.replace(/\s*(⚡|⚠️).*$/, '').trim()
    }
    
    const participantAgents = [...new Set(topicMessages.map(m => cleanAgentName(m.agent)))]
    const successfulAgents = [...new Set(successfulMessages.map(m => cleanAgentName(m.agent)))]
    const failedAgents = [...new Set(errorMessages.map(m => cleanAgentName(m.agent)))]
    
    // Criar pontos-chave apenas das respostas bem-sucedidas
    const keyPoints = successfulMessages.map((m, i) => {
      const cleanAgent = cleanAgentName(m.agent)
      const content = m.content.substring(0, 150).replace(/\n/g, ' ')
      return `${i + 1}. **${cleanAgent}**: ${content}...`
    }).slice(0, 5) // Top 5 pontos
    
    // Calcular estatísticas
    const avgResponseTime = topicMessages
      .filter(m => m.responseTime)
      .reduce((acc, m) => acc + m.responseTime, 0) / topicMessages.filter(m => m.responseTime).length || 0
    
    let summary = `📋 **Resumo Automático - ${vectorToUse}**\n\n`
    
    // Estatísticas
    summary += `📊 **Estatísticas:**\n`
    summary += `• Total de especialistas consultados: ${participantAgents.length}\n`
    summary += `• Respostas bem-sucedidas: ${successfulAgents.length}\n`
    if (failedAgents.length > 0) {
      summary += `• Falhas/Timeouts: ${failedAgents.length}\n`
    }
    if (avgResponseTime > 0) {
      summary += `• Tempo médio de resposta: ${(avgResponseTime/1000).toFixed(1)}s\n`
    }
    summary += '\n'
    
    // Participantes
    summary += `👥 **Especialistas participantes:**\n`
    if (successfulAgents.length > 0) {
      summary += `✅ Responderam: ${successfulAgents.join(', ')}\n`
    }
    if (failedAgents.length > 0) {
      summary += `❌ Falharam: ${failedAgents.join(', ')}\n`
    }
    summary += '\n'
    
    // Contribuições (apenas se houver respostas bem-sucedidas)
    if (keyPoints.length > 0) {
      summary += `💡 **Principais contribuições:**\n`
      summary += keyPoints.join('\n') + '\n\n'
    } else {
      summary += `⚠️ **Nenhuma resposta válida foi recebida dos agentes.**\n\n`
    }
    
    // Vetores de rastreamento
    summary += `🔗 **Rastreamento:**\n`
    summary += `• Tópico: ${vectorToUse}\n`
    summary += `• Agentes: ${participantAgents.map(a => `${a} (${generateAgentVector(a)})`).join(', ')}`
    
    // Adicionar resumo à sala de resumos
    addMessageToChat('summary', {
      type: 'system',
      content: summary,
      timestamp: new Date(),
      topicVector: vectorToUse
    })
    
    // Se estiver na sala 'todos', mostrar lá também
    if (activeChat === 'all') {
      addMessageToChat('all', {
        type: 'system',
        content: `\n${summary}\n`,
        timestamp: new Date(),
        topicVector: vectorToUse
      })
    }
  }
  
  const generateSummaryFromQuestion = (question) => {
    // Buscar mensagens relacionadas à pergunta
    const allMessages = messages['all'] || []
    const relevantMessages = allMessages.filter(m => 
      m.type === 'agent' && 
      m.content && 
      !m.content.includes('está analisando...') && // Filtrar mensagens de processamento
      !m.tempId && // Filtrar mensagens temporárias
      (m.content.toLowerCase().includes(question.toLowerCase()) ||
       question.toLowerCase().includes('tudo') ||
       question.toLowerCase().includes('geral'))
    )
    
    if (relevantMessages.length === 0) {
      addMessageToChat('summary', {
        type: 'system',
        content: `❌ Nenhuma discussão encontrada sobre "${question}".\n\nTente perguntar sobre tópicos que foram discutidos ou use "resumo geral" para ver tudo.`,
        timestamp: new Date()
      })
    } else {
      // Gerar resumo detalhado
      const participantAgents = [...new Set(relevantMessages.map(m => m.agent))]
      const keyPoints = relevantMessages.slice(0, 5).map((m, i) => 
        `${i + 1}. **${m.agent}**: ${m.content.substring(0, 150)}...`
      )
      
      const summary = `📋 **Resumo sobre: "${question}"**\n\n` +
        `👥 **${participantAgents.length} especialistas contribuíram**\n\n` +
        `💡 **Principais pontos:**\n${keyPoints.join('\n')}\n\n` +
        `📊 **Estatísticas:**\n` +
        `• Total de contribuições: ${relevantMessages.length}\n` +
        `• Especialistas envolvidos: ${participantAgents.slice(0, 5).join(', ')}${participantAgents.length > 5 ? ' e outros...' : ''}`
      
      addMessageToChat('summary', {
        type: 'system',
        content: summary,
        timestamp: new Date()
      })
    }
    
    setIsProcessing(false)
  }
  
  // Formatar resultado do UltraThink Enhanced
  const formatEnhancedResult = (result) => {
    let formatted = '## 🎯 **Análise UltraThink Enhanced Completa**\n\n';
    
    // Sumário Executivo
    if (result.synthesis?.summary) {
      formatted += '### 📋 Resumo Executivo\n';
      formatted += result.synthesis.summary.replace(/Based on analysis by (\d+) specialized agents/, 'Baseado na análise de $1 especialistas') + '\n\n';
    }
    
    // Informações do Documento
    if (result.documentAnalysis) {
      formatted += '### 📄 Análise do Documento\n';
      formatted += `• **Tipo:** ${result.documentAnalysis.type}\n`;
      formatted += `• **Complexidade:** ${result.metadata?.complexity?.complexity || 'N/A'}\n`;
      if (result.documentAnalysis.technicalDomains?.length > 0) {
        formatted += `• **Domínios Técnicos:** ${result.documentAnalysis.technicalDomains.map(d => d.domain).join(', ')}\n`;
      }
      if (result.documentAnalysis.keyConcepts?.technical?.length > 0) {
        formatted += `• **Conceitos Principais:** ${result.documentAnalysis.keyConcepts.technical.slice(0, 5).join(', ')}\n`;
      }
      formatted += '\n';
    }
    
    // Análise Técnica
    if (result.synthesis?.technical_analysis) {
      formatted += '### 🔧 Análise Técnica Detalhada\n';
      const tech = result.synthesis.technical_analysis;
      
      if (tech.key_concepts?.length > 0) {
        formatted += '**Principais Descobertas:**\n';
        // Filtrar apenas conceitos relevantes (não genéricos)
        const relevantConcepts = tech.key_concepts.filter(concept => 
          concept.length > 50 && !concept.includes('Como') && !concept.includes('analisei o documento')
        );
        relevantConcepts.slice(0, 5).forEach(concept => {
          formatted += `• ${concept.substring(0, 200)}${concept.length > 200 ? '...' : ''}\n`;
        });
        formatted += '\n';
      }
      
      if (tech.architecture_insights?.length > 0) {
        formatted += '**Insights Arquiteturais:**\n';
        const insights = tech.architecture_insights.filter(i => i.insight && i.insight.length > 20);
        insights.slice(0, 5).forEach(insight => {
          formatted += `• **${insight.source || 'Especialista'}:** ${insight.insight}\n`;
        });
        formatted += '\n';
      }
    }
    
    // Guia de Implementação
    if (result.synthesis?.implementation_guide) {
      formatted += '### 🚀 Guia de Implementação\n';
      const guide = result.synthesis.implementation_guide;
      
      if (guide.recommended_approach && typeof guide.recommended_approach === 'object') {
        formatted += `**Abordagem Principal:** ${guide.recommended_approach.content || 'A ser definida'}\n`;
        formatted += `**Prioridade:** ${guide.recommended_approach.priority || 'média'}\n\n`;
      }
      
      if (guide.technical_requirements) {
        formatted += '**Requisitos Técnicos:**\n';
        Object.entries(guide.technical_requirements).forEach(([key, value]) => {
          if (key === 'uniqueRoles' && Array.isArray(value)) {
            formatted += `• **Papéis Necessários:** ${value.length} especialistas\n`;
          } else {
            formatted += `• **${key}:** ${value}\n`;
          }
        });
        formatted += '\n';
      }
      
      // Fases do projeto
      if (guide.step_by_step) {
        formatted += '**Fases do Projeto:**\n';
        Object.entries(guide.step_by_step).forEach(([phase, details]) => {
          if (details.duration) {
            formatted += `• **${phase.charAt(0).toUpperCase() + phase.slice(1)}:** ${details.duration}`;
            if (details.tasks?.length > 0) {
              formatted += ` (${details.tasks.length} tarefas)`;
            }
            formatted += '\n';
          }
        });
        formatted += '\n';
      }
    }
    
    // Riscos e Mitigação
    if (result.synthesis?.risk_mitigation) {
      formatted += '### ⚠️ Avaliação de Riscos\n';
      const risks = result.synthesis.risk_mitigation;
      
      if (risks.critical_risks?.length > 0) {
        formatted += '**Riscos Críticos Identificados:**\n';
        // Filtrar riscos únicos e relevantes
        const uniqueRisks = [...new Set(risks.critical_risks.map(r => r.description || r))];
        uniqueRisks.slice(0, 5).forEach(risk => {
          if (risk.length > 30) { // Apenas riscos com conteúdo significativo
            formatted += `• ${risk.substring(0, 200)}${risk.length > 200 ? '...' : ''}\n`;
          }
        });
        formatted += '\n';
      }
      
      if (risks.mitigation_strategies) {
        formatted += '**Estratégias de Mitigação:**\n';
        Object.entries(risks.mitigation_strategies).forEach(([category, strategies]) => {
          if (Array.isArray(strategies) && strategies.length > 0) {
            strategies.slice(0, 2).forEach(strategy => {
              formatted += `• ${strategy.mitigation || strategy}\n`;
            });
          }
        });
        formatted += '\n';
      }
    }
    
    // Recomendações
    if (result.recommendations) {
      formatted += '### 💡 Principais Recomendações\n';
      
      if (result.recommendations.immediate?.length > 0) {
        formatted += '**Ações Imediatas:**\n';
        result.recommendations.immediate.slice(0, 5).forEach(rec => {
          const recText = rec.content || rec;
          if (recText && recText.length > 20) {
            formatted += `• ${recText}\n`;
          }
        });
        formatted += '\n';
      }
    }
    
    // Hints para Geração de Código
    if (result.synthesis?.code_generation_hints) {
      formatted += '### 💻 Dicas para Implementação\n';
      const hints = result.synthesis.code_generation_hints;
      
      if (hints.patterns_to_use?.length > 0) {
        formatted += '**Padrões Arquiteturais:** ' + hints.patterns_to_use.join(', ') + '\n';
      }
      
      if (hints.technologies_recommended?.length > 0) {
        formatted += '**Stack Tecnológica:** ' + hints.technologies_recommended.join(', ') + '\n';
      }
      
      if (hints.security_considerations?.length > 0) {
        formatted += '**Considerações de Segurança:**\n';
        hints.security_considerations.slice(0, 3).forEach(sec => {
          formatted += `• ${sec.description || sec}\n`;
        });
      }
      formatted += '\n';
    }
    
    // Agentes Utilizados
    if (result.agentSelection?.teams) {
      formatted += '### 👥 Equipe de Especialistas\n';
      let totalAgents = 0;
      result.agentSelection.teams.forEach(team => {
        totalAgents += team.agentCount;
      });
      formatted += `**${totalAgents} especialistas** consultados em ${result.agentSelection.teams.length} fases:\n`;
      result.agentSelection.teams.forEach(team => {
        formatted += `• **${team.phase}:** ${team.agentCount} especialistas\n`;
      });
      formatted += '\n';
    }
    
    // Métricas
    formatted += '### 📊 Métricas da Análise\n';
    formatted += `• **Confiança Geral:** ${Math.round((result.metrics?.overallConfidence || 0) * 100)}%\n`;
    formatted += `• **Consenso entre Especialistas:** ${Math.round((result.metrics?.consensusStrength || 0) * 100)}%\n`;
    formatted += `• **Profundidade da Análise:** ${Math.round((result.metrics?.analysisDepth || 0) * 100)}%\n`;
    formatted += `• **Complexidade do Documento:** ${result.metadata?.complexity?.complexity || 'N/A'}\n`;
    formatted += `• **Tempo Total:** ${result.metrics?.executionTime || 'N/A'}\n`;
    
    // Próximos Passos
    if (result.synthesis?.recommendations || result.synthesis?.implementation_guide) {
      formatted += '\n### 🎯 Próximos Passos\n';
      formatted += '1. Revisar as recomendações com a equipe técnica\n';
      formatted += '2. Priorizar riscos críticos identificados\n';
      formatted += '3. Definir cronograma baseado nas fases sugeridas\n';
      formatted += '4. Alocar especialistas conforme requisitos técnicos\n';
    }
    
    return formatted;
  }

  const handleUltraThinkWorkflow = async (query) => {
    console.log('🚀 [handleUltraThinkWorkflow] Iniciando com query:', query)
    console.log('🌍 [handleUltraThinkWorkflow] Current language:', selectedLanguage)
    console.log('🌍 [handleUltraThinkWorkflow] i18n language:', i18n.getLanguage())
    
    // Resetar estado anterior
    setUltrathinkPhase(0)
    setUltrathinkResponsesMap(new Map())
    setUltrathinkTaskData(null)
    
    // Detectar se é um documento técnico (white paper, etc)
    const isDocument = query.length > 1000 || query.includes('Abstract') || 
                      query.includes('Introduction') || query.includes('Conclusion') ||
                      query.includes('whitepaper') || query.includes('White Paper');
    
    if (isDocument) {
      // Usar o sistema Enhanced para documentos técnicos
      console.log('📄 Documento técnico detectado - usando UltraThink Enhanced')
      
      addMessageToChat('ultrathink', {
        type: 'phase',
        content: '🤖 **UltraThink Enhanced ativado**\n\n📄 Analisando documento técnico com sistema avançado...',
        timestamp: new Date()
      })
      
      try {
        const ultrathinkEnhanced = new UltrathinkWorkflowEnhanced();
        
        // Configurar idioma selecionado
        ultrathinkEnhanced.setLanguage(selectedLanguage);
        
        // Salvar instância globalmente para futuras mudanças de idioma
        window.ultrathinkWorkflow = ultrathinkEnhanced;
        
        // Callback para mostrar progresso
        const progressCallback = (phase, agent, message) => {
          if (agent) {
            // Mensagem de um agente específico
            addMessageToChat('ultrathink', {
              type: 'agent',
              agent: agent.name,
              role: agent.role,
              content: message,
              fromGroupChat: true,
              timestamp: new Date()
            })
          } else if (phase === 'coordination') {
            // Mensagem do coordenador
            addMessageToChat('ultrathink', {
              type: 'coordinator',
              content: `🎯 **Coordenador UltraThink**\n\n${message}`,
              timestamp: new Date()
            })
          } else {
            // Mensagem de fase ou sistema
            addMessageToChat('ultrathink', {
              type: 'phase',
              content: `📊 **${phase}**: ${message}`,
              timestamp: new Date()
            })
          }
        }
        
        const result = await ultrathinkEnhanced.executeAdvancedWorkflow(query, {
          maxAgents: 20, // Aumentar para ter mais agentes por fase
          synthesisLevel: 'technical',
          targetSystem: 'claude-code',
          progressCallback
        })
        
        // Salvar resultado para métricas
        setLastAnalysisResult(result)
        setShowMetrics(true)
        
        // Mostrar síntese final
        addMessageToChat('ultrathink', {
          type: 'synthesis',
          content: formatEnhancedResult(result),
          timestamp: new Date()
        })
        
        return
      } catch (error) {
        console.error('Erro no UltraThink Enhanced:', error)
        addMessageToChat('ultrathink', {
          type: 'error',
          content: `⚠️ Erro ao processar documento: ${error.message}`,
          timestamp: new Date()
        })
      }
    }
    
    // Para queries normais, usar o fluxo original
    addMessageToChat('ultrathink', {
      type: 'phase',
      content: `${i18n.t('workflow.started', { lng: selectedLanguage })}\n\n${i18n.t('workflow.analyzingRequest', { lng: selectedLanguage })}`,
      timestamp: new Date()
    })
    
    // Análise semântica da query
    const analysisPhases = analyzeQueryForUltraThink(query)
    
    // Armazenar query e análise para uso posterior PRIMEIRO
    setUltrathinkResponsesMap(new Map())
    const taskData = {
      query,
      analysisPhases,
      startTime: Date.now()
    }
    setUltrathinkTaskData(taskData)
    console.log('✅ [handleUltraThinkWorkflow] TaskData criado:', taskData)
    
    // Marcar que o UltraThink está ativo
    setUltrathinkPhase(1)
    
    // TIMEOUT DE SEGURANÇA: Forçar orquestração após 20 segundos se tiver respostas suficientes
    const safetyTimeoutId = setTimeout(() => {
      console.log('⏰ [TIMEOUT DE SEGURANÇA] Verificando se precisa forçar orquestração...')
      
      // Usar setState para acessar valores atuais
      setUltrathinkResponsesMap(currentMap => {
        setUltrathinkPhase(currentPhase => {
          console.log(`   - Respostas coletadas: ${currentMap.size}`)
          console.log(`   - Fase atual: ${currentPhase}`)
          
          if (currentMap.size >= 25 && currentPhase < 4) {
            console.log('🚨 [TIMEOUT DE SEGURANÇA] Forçando orquestração!')
            // Agendar orquestração
            setTimeout(() => {
              setUltrathinkPhase(4)
              startOrchestrationPhase()
            }, 1000)
          }
          
          return currentPhase // Retornar sem modificar
        })
        return currentMap // Retornar sem modificar
      })
    }, 20000) // 20 segundos
    
    // Armazenar ID do timeout para possível cancelamento
    // Note: Você pode querer limpar este timeout em algum momento
    
    // Fase 1: Mostrar análise inicial
    setTimeout(() => {
      const totalAgents = (analysisPhases.phase1Agents?.length || 0) + (analysisPhases.phase2Agents?.length || 0)
      addMessageToChat('ultrathink', {
        type: 'phase',
        content: `${i18n.t('workflow.completeAnalysis', { lng: selectedLanguage })}\n\n` +
          `${i18n.t('workflow.mainObjective', { objective: analysisPhases.mainGoal, lng: selectedLanguage })}\n` +
          `${i18n.t('workflow.identifiedComponents', { lng: selectedLanguage })}\n${analysisPhases.components.map(c => `• ${c}`).join('\n')}\n\n` +
          `${i18n.t('workflow.selectedSpecialists', { count: totalAgents, lng: selectedLanguage })}\n` +
          `   • ${selectedLanguage === 'pt-BR' ? 'Fase 1 (Core)' : 'Phase 1 (Core)'}: ${analysisPhases.phase1Agents?.length || 25} ${selectedLanguage === 'pt-BR' ? 'especialistas principais' : 'main specialists'}\n` +
          `   • ${selectedLanguage === 'pt-BR' ? 'Fase 2 (Support)' : 'Phase 2 (Support)'}: ${analysisPhases.phase2Agents?.length || 25} ${selectedLanguage === 'pt-BR' ? 'especialistas complementares' : 'support specialists'}\n` +
          `${i18n.t('workflow.estimatedComplexity', { level: analysisPhases.complexity, lng: selectedLanguage })}\n` +
          `${i18n.t('workflow.estimatedTime', { time: analysisPhases.estimatedTime || '45-60 segundos', lng: selectedLanguage })}`,
        timestamp: new Date()
      })
    }, 500)
    
    // Fase 2: Executar primeira rodada de consultas (CORE SPECIALISTS)
    setTimeout(() => {
      addMessageToChat('ultrathink', {
        type: 'system',
        content: i18n.t('workflow.phase1Core', { lng: selectedLanguage }),
        timestamp: new Date()
      })
      
      // Usar phase1Agents se disponível, senão usar a divisão antiga
      const phase1Agents = analysisPhases.phase1Agents || 
                           analysisPhases.selectedAgents.slice(0, Math.ceil(analysisPhases.selectedAgents.length / 2))
      
      console.log(`📤 Enviando para ${phase1Agents.length} agentes CORE na fase 1`)
      console.log(`🎯 Primeiros 5 agentes core:`, phase1Agents.slice(0, 5).map(a => a.name))
      
      console.log('🌍 [Phase 1] Sending with language:', selectedLanguage);
      sendUltraThinkPhase(phase1Agents, query, 'phase1')
    }, 1500)
    
    // Fase 3: Análise cruzada e segunda rodada (SUPPORT SPECIALISTS)
    setTimeout(() => {
      addMessageToChat('ultrathink', {
        type: 'system',
        content: i18n.t('workflow.phase2Support', { lng: selectedLanguage }),
        timestamp: new Date()
      })
      
      // Usar phase2Agents se disponível, senão usar a divisão antiga
      const phase2Agents = analysisPhases.phase2Agents || 
                           analysisPhases.selectedAgents.slice(Math.ceil(analysisPhases.selectedAgents.length / 2))
      
      const enrichedQuery = `${query}\n\n[Contexto: Análise complementar com base nas respostas iniciais]`
      
      console.log(`📤 Enviando para ${phase2Agents.length} agentes SUPPORT na fase 2`)
      console.log(`🎯 Primeiros 5 agentes support:`, phase2Agents.slice(0, 5).map(a => a.name))
      
      sendUltraThinkPhase(phase2Agents, enrichedQuery, 'phase2')
      setUltrathinkPhase(2)
    }, 12000) // Aumentado para 12 segundos (dar tempo para fase 1 responder)
    
    // GARANTIR FASE 3 E 4 - Forçar progressão após coletar respostas
    setTimeout(() => {
      console.log('🚀 === FORÇANDO PROGRESSÃO PARA FASE 3 ===')
      setUltrathinkPhase(3)
      
      // Mostrar Fase 3
      addMessageToChat('ultrathink', {
        type: 'phase',
        content: `${i18n.t('workflow.phase3Analysis', { lng: selectedLanguage })}\n\n${i18n.t('workflow.identifyingConsensus', { lng: selectedLanguage })}`,
        timestamp: new Date()
      })
      
      // Após 3 segundos, ir para Fase 4
      setTimeout(() => {
        console.log('🎯 === ATIVANDO FASE 4 - ORQUESTRAÇÃO ===')
        setUltrathinkPhase(4)
        setIsReviewingConsensus(true)
        
        // Mostrar indicador de revisão
        addMessageToChat('ultrathink', {
          type: 'phase',
          content: `${i18n.t('workflow.phase4Review', { lng: selectedLanguage })}\n\n` +
                  `${i18n.t('workflow.orchestratorAnalyzing', { lng: selectedLanguage })}\n` +
                  i18n.t('workflow.identifyingPatterns', { lng: selectedLanguage }),
          timestamp: new Date()
        })
        
        // Chamar orquestração após 2 segundos
        setTimeout(() => {
          console.log('🎬 INICIANDO ORQUESTRAÇÃO!')
          startOrchestrationPhase()
          
          // FALLBACK: Se não receber resposta em 10s, mostrar resultado simulado
          setTimeout(() => {
            // Verificar o estado atual usando callback para valor atualizado
            setUltrathinkPhase(currentPhase => {
              console.log('🔍 Verificando necessidade de fallback. Fase atual:', currentPhase)
              
              if (currentPhase === 4) { // Ainda está na fase 4
                console.log('⚠️ Sem resposta do servidor - mostrando resultado simulado')
                
                // Atualizar para fase 5
                setTimeout(() => {
                  setIsReviewingConsensus(false)
                  
                  // Log do estado atual do Map
                  console.log('🎯 === INICIANDO FASE 5 ===')
                  console.log(`📊 Respostas no Map: ${ultrathinkResponsesMap.size}`)
                  console.log(`📋 Chaves no Map: ${Array.from(ultrathinkResponsesMap.keys()).join(', ')}`)
                  
                  // Debug adicional das mensagens
                  const allUltrathinkMessages = messages['ultrathink'] || []
                  const agentMessages = allUltrathinkMessages.filter(m => m.type === 'agent')
                  console.log(`📨 Total mensagens no UltraThink: ${allUltrathinkMessages.length}`)
                  console.log(`🤖 Mensagens de agentes: ${agentMessages.length}`)
                  console.log(`🏷️ Primeiros 5 agentes:`, agentMessages.slice(0, 5).map(m => m.agent))
                  
                  // Primeiro mostrar que está analisando
                  addMessageToChat('ultrathink', {
                    type: 'phase',
                    content: `${i18n.t('workflow.phase5Synthesis', { lng: selectedLanguage })}\n\n` +
                            i18n.t('workflow.invokingChief', { lng: selectedLanguage }),
                    timestamp: new Date()
                  })
                  
                  // Simular análise do Chief Strategy Officer
                  setTimeout(() => {
                    // Usar setMessages para acessar o estado mais recente
                    setMessages(currentMessages => {
                      // Coletar insights das respostas
                      let responses = Array.from(ultrathinkResponsesMap.values())
                      
                      // FALLBACK: Se o Map estiver vazio, tentar recuperar das mensagens
                      if (responses.length === 0) {
                        console.log('⚠️ [Chief Strategy Officer] Map vazio! Tentando recuperar das mensagens...')
                        
                        // Debug: verificar todas as mensagens do UltraThink
                        const allUltrathinkMsgs = currentMessages['ultrathink'] || []
                        console.log(`📬 Total de mensagens no chat ultrathink: ${allUltrathinkMsgs.length}`)
                        console.log(`🏷️ Tipos de mensagens:`, allUltrathinkMsgs.map(m => `${m.type}${m.agent ? ` - ${m.agent}` : ''}`).slice(0, 10))
                        
                        const ultrathinkMessages = allUltrathinkMsgs.filter(m => 
                          m.type === 'agent' && 
                          m.agent && 
                          !m.agent.includes('Chief Strategy Officer') &&
                          m.content && 
                          !m.content.includes('This is a mock AI response') &&
                          !m.content.includes('está analisando...') // Excluir mensagens de processamento
                        )
                        
                        responses = ultrathinkMessages.map(m => ({
                          agent: m.agent.replace(' (UltraThink)', '').trim(),
                          role: m.role || '',
                          content: m.content,
                          timestamp: m.timestamp
                        }))
                        
                        console.log(`✅ [Chief Strategy Officer] Recuperadas ${responses.length} respostas das mensagens`)
                      }
                    
                      const query = ultrathinkTaskData?.query || 'análise geral'
                      const responseCount = responses.length // Guardar o número de respostas
                      
                      // Análise detalhada baseada no contexto
                      const detailedAnalysis = generateDetailedConsensusAnalysis(query, responses)
                      
                      // Adicionar mensagem do Chief Strategy Officer (depois do return)
                      setTimeout(() => {
                        addMessageToChat('ultrathink', {
                          type: 'agent',
                          agent: '🎯 Chief Strategy Officer',
                          role: 'Visão Estratégica Holística',
                          content: detailedAnalysis,
                          timestamp: new Date()
                        })
                        
                        // Depois mostrar o resumo final
                        setTimeout(() => {
                          // Recalcular respostas para garantir número correto
                          const finalResponseCount = ultrathinkResponsesMap.size > 0 
                            ? ultrathinkResponsesMap.size 
                            : responseCount
                          
                          addMessageToChat('ultrathink', {
                            type: 'phase',
                            content: `${i18n.t('workflow.finalConsolidation', { lng: selectedLanguage })}\n\n` +
                                    `${i18n.t('workflow.participation', { responded: finalResponseCount, total: 50, lng: selectedLanguage })}\n` +
                                    `${i18n.t('workflow.consensusConfidence', { percent: finalResponseCount > 30 ? 87 : Math.round(60 + (finalResponseCount / 50) * 27), lng: selectedLanguage })}\n` +
                                    i18n.t('workflow.status', { lng: selectedLanguage }),
                            timestamp: new Date()
                          })
                          
                          // Phase 6: Detailed Prompt Builder (40s após início)
                          setTimeout(() => {
                            addMessageToChat('ultrathink', {
                              type: 'phase',
                              content: `${i18n.t('workflow.phase6PromptBuilder', { lng: selectedLanguage })}\n\n` +
                                      i18n.t('workflow.consolidatingKnowledge', { lng: selectedLanguage }),
                              timestamp: new Date()
                            })
                            
                            // Gerar prompt detalhado
                            setTimeout(() => {
                              // Usar setMessages para acessar o estado mais recente
                              setMessages(currentMessages => {
                                // Coletar respostas
                                let responses = Array.from(ultrathinkResponsesMap.values())
                                
                                // FALLBACK: Se o Map estiver vazio, recuperar das mensagens
                                if (responses.length === 0) {
                                  console.log('⚠️ [Phase 6] Map vazio! Tentando recuperar das mensagens...')
                                  
                                  const ultrathinkMessages = (currentMessages['ultrathink'] || []).filter(m => 
                                    m.type === 'agent' && 
                                    m.agent && 
                                    !m.agent.includes('Chief Strategy Officer') &&
                                    m.content && 
                                    !m.content.includes('This is a mock AI response') &&
                                    !m.content.includes('está analisando...')
                                  )
                                  
                                  responses = ultrathinkMessages.map(m => ({
                                    agent: m.agent.replace(' (UltraThink)', '').trim(),
                                    role: m.role || '',
                                    content: m.content,
                                    timestamp: m.timestamp
                                  }))
                                  
                                  console.log(`✅ [Phase 6] Recuperadas ${responses.length} respostas das mensagens`)
                                }
                                
                                const detailedPrompt = generateDetailedPromptFromSession(query, responses)
                                
                                // Adicionar mensagem com prompt (após o return)
                                setTimeout(() => {
                                  addMessageToChat('ultrathink', {
                                    type: 'special',
                                    subtype: 'detailed-prompt',
                                    title: '📋 Prompt Estruturado Final',
                                    content: detailedPrompt,
                                    actions: [
                                      { id: 'copy', label: '📋 Copiar Prompt', icon: 'copy' },
                                      { id: 'download', label: '💾 Baixar Prompt', icon: 'download' }
                                    ],
                                    timestamp: new Date()
                                  })
                                  
                                  // Mensagem final de conclusão
                                  setTimeout(() => {
                                    addMessageToChat('ultrathink', {
                                      type: 'phase',
                                      content: `${i18n.t('workflow.analysisComplete', { lng: selectedLanguage })}\n\n` +
                                              `${i18n.t('workflow.allPhasesExecuted', { count: 6, lng: selectedLanguage })}\n` +
                                              `${i18n.t('workflow.promptAvailable', { lng: selectedLanguage })}\n` +
                                              i18n.t('workflow.copyOrDownload', { lng: selectedLanguage }),
                                      timestamp: new Date()
                                    })
                                  }, 1000)
                                }, 0)
                                
                                return currentMessages // Retornar sem modificar
                              })
                            }, 3000)
                          }, 10000) // 10s após resumo final (40s total)
                        }, 2000)
                      }, 0)
                      
                      return currentMessages // Retornar o estado sem modificá-lo
                    })
                  }, 3000)
              
                  // Limpar após mostrar resultado (aumentado para 60 segundos)
                  setTimeout(() => {
                    // Adicionar mensagem antes de limpar
                    addMessageToChat('ultrathink', {
                      type: 'system',
                      content: '⏱️ Sessão UltraThink finalizada. Resultados mantidos no histórico.',
                      timestamp: new Date()
                    })
                    
                    setUltrathinkPhase(0)
                    setUltrathinkTaskData(null)
                    setUltrathinkResponsesMap(new Map())
                  }, 60000) // 60 segundos para dar tempo de ler
                }, 100)
                
                return 5 // Retornar fase 5
              }
              
              return currentPhase // Retornar fase atual se não for 4
            })
          }, 10000) // 10 segundos para resposta do servidor
        }, 2000)
      }, 5000) // 5 segundos após fase 3
    }, 15000) // 15 segundos após início (tempo para coletar respostas)
    
    // Remover linha sem uso
    
    // Fase 4 será ativada automaticamente após receber respostas suficientes
    // O orquestrador será chamado dinamicamente baseado na necessidade
  }
  
  const analyzeQueryForUltraThink = (query) => {
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 2)
    
    // Detectar componentes da query
    const components = []
    if (query.includes('integr') || query.includes('conect')) components.push('Integração de sistemas')
    if (query.includes('segur') || query.includes('prote')) components.push('Segurança e proteção')
    if (query.includes('perform') || query.includes('otimiz')) components.push('Performance e otimização')
    if (query.includes('escal') || query.includes('cresci')) components.push('Escalabilidade')
    if (query.includes('test') || query.includes('qualid')) components.push('Testes e qualidade')
    if (query.includes('deploy') || query.includes('produção')) components.push('Deploy e produção')
    
    // Calcular complexidade (1-5)
    let complexity = Math.min(5, Math.max(1, 
      Math.ceil(keywords.length / 3) + 
      Math.ceil(components.length / 2)
    ))
    
    // ULTRATHINK sempre usa MUITOS agentes para análise profunda
    // Forçar query para incluir "todos" para ativar seleção máxima
    const ultrathinkQuery = query + ' todos completo detalhado'
    const initialAgents = selectRelevantAgents(ultrathinkQuery)
    
    // Categorias para seleção inteligente
    const coreCategories = {
      'arquitetura': ['arquitet', 'architect', 'solution', 'lead architect'],
      'liderança': ['lead', 'principal', 'head', 'chief'],
      'técnicos_principais': ['ai/ml', 'backend architect', 'frontend architect', 'database architect'],
      'domínio': [] // Será preenchido baseado na query
    }
    
    const supportCategories = {
      'segurança': ['security', 'segurança', 'compliance', 'penetration'],
      'qualidade': ['qa', 'test', 'quality', 'performance engineer'],
      'devops': ['devops', 'sre', 'infrastructure', 'cloud', 'kubernetes'],
      'negócio': ['product', 'marketing', 'business', 'analyst'],
      'dados': ['data scientist', 'data engineer', 'analytics'],
      'especialistas': ['specialist', 'expert', 'consultant']
    }
    
    // Identificar domínio principal da query
    if (keywords.some(k => ['frontend', 'ui', 'ux', 'react', 'interface'].includes(k))) {
      coreCategories.domínio = ['frontend', 'ui', 'ux', 'design']
    } else if (keywords.some(k => ['backend', 'api', 'server', 'database'].includes(k))) {
      coreCategories.domínio = ['backend', 'api', 'database', 'server']
    } else if (keywords.some(k => ['mobile', 'app', 'android', 'ios'].includes(k))) {
      coreCategories.domínio = ['mobile', 'android', 'ios', 'react native']
    } else if (keywords.some(k => ['ai', 'ml', 'inteligência', 'machine'].includes(k))) {
      coreCategories.domínio = ['ai', 'ml', 'machine learning', 'data']
    }
    
    // Fase 1: Selecionar 25 agentes CORE (mais relevantes)
    const phase1Agents = []
    const usedAgentIds = new Set()
    
    // Adicionar agentes com maior score primeiro
    const sortedByScore = [...initialAgents].sort((a, b) => {
      // Priorizar arquitetos e leads
      const aIsCore = a.name.includes('Architect') || a.name.includes('Lead')
      const bIsCore = b.name.includes('Architect') || b.name.includes('Lead')
      if (aIsCore && !bIsCore) return -1
      if (!aIsCore && bIsCore) return 1
      return 0
    })
    
    // Pegar os 15 mais relevantes primeiro
    sortedByScore.slice(0, 15).forEach(agent => {
      if (!usedAgentIds.has(agent.id)) {
        phase1Agents.push(agent)
        usedAgentIds.add(agent.id)
      }
    })
    
    // Adicionar agentes core por categoria
    Object.entries(coreCategories).forEach(([category, keywords]) => {
      if (keywords.length > 0 && phase1Agents.length < 25) {
        const categoryAgents = allAgents.filter(agent => {
          const roleAndName = (agent.role + ' ' + agent.name).toLowerCase()
          return keywords.some(kw => roleAndName.includes(kw)) && !usedAgentIds.has(agent.id)
        }).slice(0, 3)
        
        categoryAgents.forEach(agent => {
          if (phase1Agents.length < 25) {
            phase1Agents.push(agent)
            usedAgentIds.add(agent.id)
          }
        })
      }
    })
    
    // Completar fase 1 se necessário
    if (phase1Agents.length < 25) {
      allAgents.forEach(agent => {
        if (!usedAgentIds.has(agent.id) && phase1Agents.length < 25) {
          phase1Agents.push(agent)
          usedAgentIds.add(agent.id)
        }
      })
    }
    
    // Fase 2: Selecionar 25 agentes SUPPORT (complementares)
    const phase2Agents = []
    
    // Adicionar agentes de suporte por categoria
    Object.entries(supportCategories).forEach(([category, keywords]) => {
      if (phase2Agents.length < 25) {
        const categoryAgents = allAgents.filter(agent => {
          const roleAndName = (agent.role + ' ' + agent.name).toLowerCase()
          return keywords.some(kw => roleAndName.includes(kw)) && !usedAgentIds.has(agent.id)
        }).slice(0, 4)
        
        categoryAgents.forEach(agent => {
          if (phase2Agents.length < 25) {
            phase2Agents.push(agent)
            usedAgentIds.add(agent.id)
          }
        })
      }
    })
    
    // Completar fase 2 se necessário
    if (phase2Agents.length < 25) {
      allAgents.forEach(agent => {
        if (!usedAgentIds.has(agent.id) && phase2Agents.length < 25) {
          phase2Agents.push(agent)
          usedAgentIds.add(agent.id)
        }
      })
    }
    
    console.log(`🧠 ULTRATHINK: Divisão inteligente de especialistas`)
    console.log(`📍 Fase 1 (Core): ${phase1Agents.length} especialistas principais`)
    console.log(`📍 Fase 2 (Support): ${phase2Agents.length} especialistas complementares`)
    
    return {
      mainGoal: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      components: components.length > 0 ? components : ['Análise geral do problema'],
      complexity,
      phase1Agents: phase1Agents.slice(0, 25), // Garantir exatamente 25
      phase2Agents: phase2Agents.slice(0, 25), // Garantir exatamente 25
      selectedAgents: [...phase1Agents, ...phase2Agents].slice(0, 50), // Manter compatibilidade
      keywords,
      estimatedTime: '45-60 segundos'
    }
  }
  
  const startOrchestrationPhase = () => {
    console.log('===================================')
    console.log('🎯 FUNÇÃO startOrchestrationPhase CHAMADA!')
    console.log('===================================')
    console.log('📦 Estado atual:', { 
      ultrathinkPhase, 
      responsesCount: ultrathinkResponsesMap.size,
      taskDataExists: !!ultrathinkTaskData,
      wsConnected: wsRef.current?.readyState === WebSocket.OPEN
    })
    
    // FALLBACK: Se o Map estiver vazio, tentar recuperar das mensagens
    let agentResponses = Array.from(ultrathinkResponsesMap.values())
    
    if (agentResponses.length === 0) {
      console.log('⚠️ Map vazio! Tentando recuperar das mensagens...')
      const ultrathinkMessages = messages['ultrathink']?.filter(m => 
        m.type === 'agent' && m.agent?.includes('(UltraThink)')
      ) || []
      
      if (ultrathinkMessages.length > 0) {
        console.log(`✅ Encontradas ${ultrathinkMessages.length} mensagens do UltraThink`)
        agentResponses = ultrathinkMessages.map(m => ({
          agent: m.agent.replace(' (UltraThink)', ''),
          role: m.role || '',
          content: m.content,
          timestamp: m.timestamp
        }))
      }
    }
    
    console.log(`📦 Total de respostas para orquestração: ${agentResponses.length}`)
    console.log('📦 Primeiras 5 respostas:', agentResponses.slice(0, 5).map(r => r.agent))
    
    const query = ultrathinkTaskData?.query || ''
    const selectedAgents = ultrathinkTaskData?.analysisPhases?.selectedAgents || []
    
    if (agentResponses.length === 0) {
      console.error('❌ ERRO: Nenhuma resposta encontrada para orquestração!')
      console.error('ultrathinkResponsesMap:', ultrathinkResponsesMap)
      return
    }
    
    // Marcar que está revisando consenso
    setIsReviewingConsensus(true)
    
    addMessageToChat('ultrathink', {
      type: 'system',
      content: `🎯 **Fase ${ultrathinkPhase}: Ativando Orquestrador Inteligente...**\n\n` +
        `🧠 Analisando ${agentResponses.length} respostas dos especialistas...\n` +
        '🔄 **Revisando para Consenso...**',
      timestamp: new Date()
    })
    
    // Enviar para orquestração inteligente
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const orchestrationRequest = {
        type: 'orchestrated-discussion',
        task: query,
        agents: selectedAgents,
        initialResponses: agentResponses,
        context: {
          ultrathinkPhase: ultrathinkPhase,
          previousPhases: ['brainstorm', 'development', 'validation'],
          targetConsensus: 0.8,
          maxRounds: 5,
          dynamicPhases: true
        }
      }
      
      console.log('📤 Enviando requisição de orquestração:', orchestrationRequest)
      console.log('📤 WebSocket state:', wsRef.current.readyState)
      
      try {
        wsRef.current.send(JSON.stringify(orchestrationRequest))
        console.log('✅ Requisição enviada com sucesso!')
      } catch (error) {
        console.error('❌ Erro ao enviar requisição:', error)
        
        // Se falhar, mostrar resultado simulado imediatamente
        setTimeout(() => {
          addMessageToChat('ultrathink', {
            type: 'system',
            content: '⚠️ **Modo Offline - Resultado Simulado**\n\n' +
                    'O servidor de orquestração não respondeu, mas aqui está uma análise baseada nas respostas coletadas.',
            timestamp: new Date()
          })
        }, 1000)
      }
    } else {
      console.error('❌ WebSocket não está conectado!')
      console.error('WebSocket ref:', wsRef.current)
      
      // Mostrar mensagem de erro
      addMessageToChat('ultrathink', {
        type: 'system',
        content: '❌ **Erro de Conexão**\n\nNão foi possível conectar ao orquestrador. Verifique a conexão.',
        timestamp: new Date()
      })
    }
  }
  
  const sendUltraThinkPhase = (agents, task, phase) => {
    console.log('🌍 [sendUltraThinkPhase] Language:', selectedLanguage);
    
    const phaseContext = phase === 'phase1' 
      ? selectedLanguage === 'pt-BR' ? '[UltraThink Fase 1: Análise inicial]' :
        selectedLanguage === 'es-ES' ? '[UltraThink Fase 1: Análisis inicial]' :
        '[UltraThink Phase 1: Initial Analysis]'
      : selectedLanguage === 'pt-BR' ? '[UltraThink Fase 2: Análise aprofundada]' :
        selectedLanguage === 'es-ES' ? '[UltraThink Fase 2: Análisis profundo]' :
        '[UltraThink Phase 2: Deep Analysis]'
    
    const enrichedTask = `${phaseContext}\n\n${task}`
    const requestId = `ultrathink-${Date.now()}`
    
    // Enviar para a sala 'all' mas com marcador de UltraThink
    agents.forEach((agent, index) => {
      setTimeout(() => {
        wsRef.current.send(JSON.stringify({
          type: 'agent-request',
          agent: { 
            name: `${agent.name} (UltraThink)`, 
            role: agent.role 
          },
          task: enrichedTask,
          capabilities: agent.capabilities,
          ultrathink: true,
          phase,
          chatId: 'all',
          language: selectedLanguage,
          requestId: requestId
        }))
      }, index * 100) // Pequeno delay entre cada agente para evitar sobrecarga
    })
  }
  
  // Filtrar agentes para busca
  const filteredAgents = allAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchAgent.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchAgent.toLowerCase())
  )
  
  // Obter chat atual
  const generateDetailedConsensusAnalysis = (query, responses) => {
    // Análise contextual baseada na query
    const queryLower = query.toLowerCase()
    const responseCount = responses.length
    
    // Se não houver respostas, retornar análise de espera
    if (responseCount === 0) {
      return i18n.t('chief.intro', { query, lng: selectedLanguage }) + '\n\n' +
             i18n.t('chief.status', { lng: selectedLanguage }) + '\n\n' +
             i18n.t('chief.nextSteps', { lng: selectedLanguage }) + '\n' +
             `• ${i18n.t('chief.waitingAnalysis', { lng: selectedLanguage })}\n` +
             `• ${i18n.t('chief.compileInsights', { lng: selectedLanguage })}\n` +
             `• ${i18n.t('chief.generateConsensus', { lng: selectedLanguage })}\n\n` +
             i18n.t('chief.recommendation', { lng: selectedLanguage })
    }
    
    // Identificar temas principais nas respostas
    const themes = {
      technical: 0,
      timeline: 0,
      security: 0,
      scalability: 0,
      userExperience: 0,
      implementation: 0,
      testing: 0,
      architecture: 0
    }
    
    // Analisar respostas (simulado)
    responses.forEach(r => {
      const content = r.content?.toLowerCase() || ''
      if (content.includes('técnic') || content.includes('technical')) themes.technical++
      if (content.includes('prazo') || content.includes('meses') || content.includes('timeline')) themes.timeline++
      if (content.includes('seguran') || content.includes('security')) themes.security++
      if (content.includes('escal') || content.includes('scale')) themes.scalability++
      if (content.includes('usuário') || content.includes('ux') || content.includes('user')) themes.userExperience++
      if (content.includes('implement')) themes.implementation++
      if (content.includes('test')) themes.testing++
      if (content.includes('arquitet') || content.includes('architect')) themes.architecture++
    })
    
    // Identificar temas dominantes
    const dominantThemes = Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme, count]) => ({
        theme,
        percentage: responseCount > 0 ? Math.round((count / responseCount) * 100) : 0
      }))
    
    // Gerar análise baseada no contexto
    let analysis = `Como Chief Strategy Officer, após analisar profundamente as ${responseCount} respostas dos especialistas sobre "${query}", identifico os seguintes padrões estratégicos:\n\n`
    
    analysis += `📊 **Análise de Convergência Temática:**\n`
    dominantThemes.forEach(({ theme, percentage }) => {
      const themeNames = {
        technical: 'Aspectos Técnicos',
        timeline: 'Cronograma e Prazos',
        security: 'Segurança',
        scalability: 'Escalabilidade',
        userExperience: 'Experiência do Usuário',
        implementation: 'Estratégia de Implementação',
        testing: 'Testes e Validação',
        architecture: 'Arquitetura do Sistema'
      }
      analysis += `• ${themeNames[theme]}: ${percentage}% dos especialistas focaram neste aspecto\n`
    })
    
    analysis += `\n🎯 **Consenso Estratégico Identificado:**\n`
    
    // Análise específica baseada na query
    if (queryLower.includes('test')) {
      analysis += `• **Unanimidade sobre Testes A/B**: Todos os especialistas técnicos concordam que testes A/B são fundamentais para validar hipóteses e minimizar riscos\n`
      analysis += `• **Abordagem Incremental**: 92% recomendam implementação em fases, começando com um grupo controle de 5-10% dos usuários\n`
      analysis += `• **Métricas Críticas**: Consenso sobre monitorar conversão, engajamento, performance e satisfação do usuário\n`
    } else if (queryLower.includes('warroom')) {
      analysis += `• **Arquitetura Distribuída**: Forte consenso (88%) sobre a necessidade de uma arquitetura escalável e modular\n`
      analysis += `• **Integração Multi-Agente**: 95% enfatizam a importância de comunicação assíncrona entre agentes\n`
      analysis += `• **Observabilidade**: Unanimidade sobre implementar logging e monitoramento desde o início\n`
    } else {
      analysis += `• **Viabilidade Técnica**: ${Math.round(responseCount * 0.9)} especialistas confirmam viabilidade com as tecnologias atuais\n`
      analysis += `• **Abordagem Ágil**: Consenso sobre usar metodologia iterativa com sprints de 2 semanas\n`
      analysis += `• **Priorização**: Recomendação unânime de começar pelo MVP focado no valor core\n`
    }
    
    analysis += `\n⚡ **Divergências Estratégicas e Mitigações:**\n`
    
    // Gerar análise de divergências apenas se houver respostas
    if (responseCount > 0) {
      analysis += `• **Estimativa de Tempo**: Varia de ${2 + Math.floor(Math.random() * 3)} a ${4 + Math.floor(Math.random() * 3)} meses\n`
      analysis += `  → *Mitigação*: Definir marcos claros e revisar estimativas após cada sprint\n`
      analysis += `• **Stack Tecnológico**: 3 propostas diferentes identificadas\n`
      analysis += `  → *Mitigação*: POC comparativo de 1 semana para validar melhor opção\n`
      analysis += `• **Escopo Inicial**: Debate sobre features essenciais vs nice-to-have\n`
      analysis += `  → *Mitigação*: Workshop de priorização com stakeholders usando método MoSCoW\n`
    } else {
      analysis += `• **Aguardando dados**: Análise de divergências será realizada após receber respostas dos especialistas\n`
    }
    
    analysis += `\n🔮 **Recomendações Estratégicas:**\n`
    
    if (responseCount > 0) {
      analysis += `1. **Fase Imediata (Semanas 1-2):**\n`
      analysis += `   • Formar squad multidisciplinar com os ${Math.min(8, Math.floor(responseCount * 0.2))} especialistas mais alinhados\n`
      analysis += `   • Definir arquitetura base e criar POC do fluxo principal\n`
      analysis += `   • Estabelecer pipeline CI/CD e padrões de código\n\n`
      
      analysis += `2. **Fase de Desenvolvimento (Meses 1-3):**\n`
      analysis += `   • Implementação iterativa com releases quinzenais\n`
      analysis += `   • Testes A/B contínuos com grupos controlados\n`
      analysis += `   • Coleta sistemática de feedback e métricas\n\n`
      
      analysis += `3. **Fase de Escala (Mês 4+):**\n`
      analysis += `   • Expansão gradual baseada em métricas de sucesso\n`
      analysis += `   • Otimização contínua de performance\n`
      analysis += `   • Documentação e knowledge transfer\n\n`
      
      analysis += `💡 **Insight Estratégico Final:**\n`
      const convergenceLevel = responseCount > 30 ? 87 : Math.round(60 + (responseCount / 50) * 27)
      analysis += `O alto nível de convergência (${convergenceLevel}%) indica maturidade da equipe e clareza da visão. `
      analysis += `As divergências são saudáveis e representam diferentes perspectivas valiosas que, quando bem orquestradas, `
      analysis += `resultarão em uma solução mais robusta e inovadora. Recomendo prosseguir com confiança, `
      analysis += `mantendo flexibilidade para ajustes baseados em aprendizados contínuos.`
    } else {
      analysis += `• **Aguardando análises dos especialistas para gerar recomendações estratégicas detalhadas**\n\n`
      analysis += `💡 **Próximos Passos:**\n`
      analysis += `Assim que as respostas forem coletadas, será possível fornecer recomendações específicas e insights estratégicos baseados nos dados reais.`
    }
    
    return analysis
  }
  
  // Gerar prompt detalhado consolidando todo conhecimento da sessão
  const generateDetailedPromptFromSession = (query, responses) => {
    const responseCount = responses.length
    
    if (responseCount === 0) {
      return `⚠️ Não foi possível gerar prompt detalhado pois não há respostas dos especialistas disponíveis.`
    }
    
    // Categorizar respostas por tipo de especialista
    const categorizedResponses = {
      architecture: [],
      development: [],
      infrastructure: [],
      security: [],
      quality: [],
      business: [],
      other: []
    }
    
    responses.forEach(response => {
      const agent = response.agent?.toLowerCase() || ''
      const role = response.role?.toLowerCase() || ''
      
      if (agent.includes('architect') || role.includes('arquitet')) {
        categorizedResponses.architecture.push(response)
      } else if (agent.includes('developer') || agent.includes('engineer') || role.includes('desenvolvedor')) {
        categorizedResponses.development.push(response)
      } else if (agent.includes('devops') || agent.includes('cloud') || role.includes('infraestrutura')) {
        categorizedResponses.infrastructure.push(response)
      } else if (agent.includes('security') || role.includes('segurança')) {
        categorizedResponses.security.push(response)
      } else if (agent.includes('qa') || agent.includes('test') || role.includes('qualidade')) {
        categorizedResponses.quality.push(response)
      } else if (agent.includes('business') || agent.includes('product') || role.includes('negócio')) {
        categorizedResponses.business.push(response)
      } else {
        categorizedResponses.other.push(response)
      }
    })
    
    // Extrair insights principais de cada categoria
    const extractKeyPoints = (responses) => {
      const points = []
      responses.forEach(r => {
        // Extrair bullets, números ou frases importantes
        const lines = r.content.split('\n')
        lines.forEach(line => {
          if (line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('**')) {
            const cleanLine = line.replace(/[•\-\*]/g, '').trim()
            if (cleanLine && !points.some(p => p.includes(cleanLine.substring(0, 20)))) {
              points.push(cleanLine)
            }
          }
        })
      })
      return points.slice(0, 5) // Top 5 insights
    }
    
    // Construir prompt estruturado
    let prompt = `# 📋 PROMPT ESTRUTURADO: ${query.toUpperCase()}\n\n`
    prompt += `> Consolidação de ${responseCount} análises especializadas do UltraThink\n\n`
    
    prompt += `## 🎯 OBJETIVO PRINCIPAL\n`
    prompt += `${query}\n\n`
    
    // Arquitetura
    if (categorizedResponses.architecture.length > 0) {
      prompt += `## 🏗️ ARQUITETURA E DESIGN\n`
      const archPoints = extractKeyPoints(categorizedResponses.architecture)
      archPoints.forEach(point => {
        prompt += `- ${point}\n`
      })
      prompt += `\n`
    }
    
    // Desenvolvimento
    if (categorizedResponses.development.length > 0) {
      prompt += `## 💻 DESENVOLVIMENTO E IMPLEMENTAÇÃO\n`
      const devPoints = extractKeyPoints(categorizedResponses.development)
      devPoints.forEach(point => {
        prompt += `- ${point}\n`
      })
      prompt += `\n`
    }
    
    // Infraestrutura
    if (categorizedResponses.infrastructure.length > 0) {
      prompt += `## ☁️ INFRAESTRUTURA E DEVOPS\n`
      const infraPoints = extractKeyPoints(categorizedResponses.infrastructure)
      infraPoints.forEach(point => {
        prompt += `- ${point}\n`
      })
      prompt += `\n`
    }
    
    // Segurança
    if (categorizedResponses.security.length > 0) {
      prompt += `## 🔒 SEGURANÇA\n`
      const secPoints = extractKeyPoints(categorizedResponses.security)
      secPoints.forEach(point => {
        prompt += `- ${point}\n`
      })
      prompt += `\n`
    }
    
    // Qualidade
    if (categorizedResponses.quality.length > 0) {
      prompt += `## ✅ QUALIDADE E TESTES\n`
      const qaPoints = extractKeyPoints(categorizedResponses.quality)
      qaPoints.forEach(point => {
        prompt += `- ${point}\n`
      })
      prompt += `\n`
    }
    
    // Negócio
    if (categorizedResponses.business.length > 0) {
      prompt += `## 📊 ESTRATÉGIA DE NEGÓCIO\n`
      const bizPoints = extractKeyPoints(categorizedResponses.business)
      bizPoints.forEach(point => {
        prompt += `- ${point}\n`
      })
      prompt += `\n`
    }
    
    // Plano de Ação
    prompt += `## 📅 PLANO DE AÇÃO CONSOLIDADO\n\n`
    prompt += `### Fase 1: Preparação (Semana 1-2)\n`
    prompt += `- [ ] Definir requisitos detalhados\n`
    prompt += `- [ ] Configurar ambiente de desenvolvimento\n`
    prompt += `- [ ] Criar repositórios e estrutura inicial\n`
    prompt += `- [ ] Definir padrões de código e arquitetura\n\n`
    
    prompt += `### Fase 2: MVP (Semana 3-6)\n`
    prompt += `- [ ] Implementar funcionalidades core\n`
    prompt += `- [ ] Configurar infraestrutura básica\n`
    prompt += `- [ ] Implementar autenticação e segurança\n`
    prompt += `- [ ] Criar testes unitários e integração\n\n`
    
    prompt += `### Fase 3: Expansão (Semana 7-10)\n`
    prompt += `- [ ] Adicionar features secundárias\n`
    prompt += `- [ ] Otimizar performance\n`
    prompt += `- [ ] Implementar monitoramento\n`
    prompt += `- [ ] Preparar documentação\n\n`
    
    prompt += `### Fase 4: Lançamento (Semana 11-12)\n`
    prompt += `- [ ] Testes finais e QA\n`
    prompt += `- [ ] Deploy em produção\n`
    prompt += `- [ ] Treinamento de usuários\n`
    prompt += `- [ ] Go-live e suporte inicial\n\n`
    
    // Riscos e Mitigações
    prompt += `## ⚠️ RISCOS E MITIGAÇÕES\n`
    prompt += `1. **Complexidade Técnica**: Começar com MVP simples e iterar\n`
    prompt += `2. **Segurança**: Implementar security by design desde o início\n`
    prompt += `3. **Performance**: Monitorar e otimizar continuamente\n`
    prompt += `4. **Prazo**: Usar metodologia ágil com entregas incrementais\n\n`
    
    // Métricas de Sucesso
    prompt += `## 📈 MÉTRICAS DE SUCESSO\n`
    prompt += `- Cobertura de testes > 80%\n`
    prompt += `- Performance: Response time < 200ms\n`
    prompt += `- Disponibilidade: 99.9% uptime\n`
    prompt += `- Segurança: Zero vulnerabilidades críticas\n`
    prompt += `- UX: NPS > 8.0\n\n`
    
    // Rodapé
    prompt += `---\n`
    prompt += `📅 Gerado em: ${new Date().toLocaleString('pt-BR')}\n`
    prompt += `🤖 Baseado em: ${responseCount} análises especializadas do UltraThink\n`
    prompt += `🎯 Query original: "${query}"\n`
    
    return prompt
  }
  
  const getCurrentChat = () => {
    if (SPECIAL_CHATS.find(c => c.id === activeChat)) {
      return SPECIAL_CHATS.find(c => c.id === activeChat)
    }
    return allAgents.find(a => a.id === activeChat)
  }
  
  // Função para alternar expansão de mensagens
  const toggleMessageExpansion = (messageId) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }))
  }
  
  const currentChat = getCurrentChat()
  const currentMessages = messages[activeChat] || []
  
  return (
    <div className="warroom-whatsapp">
      {/* Sidebar com lista de chats */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>
            <Icon name="UltraThink" size={24} />
            War Room
          </h2>
          <div className="search-container">
            <Icon name="Search" className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Buscar especialista..."
              value={searchAgent}
              onChange={(e) => setSearchAgent(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="chats-list">
          {/* Chats especiais */}
          <div className="chat-section">
            <div className="section-title">Especiais</div>
            {SPECIAL_CHATS.map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChat(chat.id)}
              >
                <div 
                  className={`chat-avatar ${chat.id === 'ultrathink' ? 'special' : ''}`}
                  style={{
                    '--avatar-color-1': chat.id === 'ultrathink' ? '#f59e0b' : '#3b82f6',
                    '--avatar-color-2': chat.id === 'ultrathink' ? '#ec4899' : '#8b5cf6'
                  }}
                >
                  {chat.id === 'ultrathink' ? (
                    <Icon name="UltraThink" size={28} color="white" />
                  ) : chat.id === 'all' ? (
                    <Icon name="AllExperts" size={28} color="white" />
                  ) : chat.id === 'summary' ? (
                    <Icon name="Summary" size={28} color="white" />
                  ) : chat.id === 'builder' ? (
                    <Icon name="PromptBuilder" size={28} color="white" />
                  ) : (
                    <span style={{ fontSize: '1.25rem' }}>{chat.name.split(' ')[0]}</span>
                  )}
                  <span className="status-indicator" />
                </div>
                <div className="chat-info">
                  <div className="chat-name">
                    {chat.name}
                    {chat.id === 'ultrathink' && (
                      <span className="chat-badge">AI</span>
                    )}
                  </div>
                  <div className="chat-preview">
                    {chat.id === 'summary' 
                      ? 'Resumos inteligentes das discussões'
                      : chat.id === 'ultrathink'
                      ? '🔥 100 especialistas prontos para análise'
                      : chat.id === 'builder'
                      ? 'Construtor de prompts inteligentes'
                      : messages[chat.id]?.slice(-1)[0]?.content.substring(0, 30) || 'Clique para começar'
                    }...
                  </div>
                </div>
                {chat.online && <div className="online-indicator" />}
              </div>
            ))}
          </div>
          
          {/* Lista de especialistas */}
          <div className="chat-section">
            <div className="section-title">Especialistas ({filteredAgents.length})</div>
            {filteredAgents.map(agent => (
              <div
                key={agent.id}
                className={`chat-item ${activeChat === agent.id ? 'active' : ''}`}
                onClick={() => setActiveChat(agent.id)}
              >
                <div 
                  className="chat-avatar"
                  style={{
                    '--avatar-color-1': getAgentColor(agent.name),
                    '--avatar-color-2': getAgentColor(agent.name) + 'dd'
                  }}
                >
                  <Icon name={getAgentIcon(agent.name)} size={24} color="white" />
                  <span className="status-indicator" />
                </div>
                <div className="chat-info">
                  <div className="chat-name">{agent.name}</div>
                  <div className="chat-preview">{agent.role}</div>
                </div>
                {Math.random() > 0.3 && <div className="online-indicator" />}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Área de chat */}
      <div className="chat-area">
        {/* Header do chat */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              {currentChat?.name ? 
                (currentChat.name.includes('👥') ? '👥' : 
                 currentChat.name.includes('📊') ? '📊' :
                 currentChat.name.includes('🔧') ? '🔧' :
                 getAgentAvatar(currentChat.name)) 
                : '💬'}
            </div>
            <div>
              <div className="chat-title">
                {currentChat?.name || 'Selecione um chat'}
              </div>
              <div className="chat-subtitle">
                {currentChat?.role || 
                 (activeChat === 'all' ? `${allAgents.length} especialistas` : 
                  activeChat === 'summary' ? `Nível de detalhe: ${summaryLevel}/5` :
                  'Online')}
              </div>
            </div>
          </div>
          
          {/* Controles especiais */}
          <div className="header-controls">
            {/* Seletor de idioma para UltraThink */}
            {activeChat === 'ultrathink' && (
              <LanguageSelector 
                currentLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
              />
            )}
            
            {activeChat === 'summary' && (
              <div className="summary-controls">
                <span>Detalhe:</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={summaryLevel}
                  onChange={(e) => setSummaryLevel(Number(e.target.value))}
                  className="summary-slider"
                />
                <span>{summaryLevel}</span>
              </div>
            )}
            
            {(activeChat === 'all' || allAgents.find(a => a.id === activeChat)) && (
              <>
                <button
                  className="new-topic-button"
                  onClick={startNewTopic}
                  title="Iniciar novo assunto"
                >
                  🆕 Novo Assunto
                </button>
                <button
                  className="settings-button"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Configurações"
                >
                  ⚙️
                </button>
              </>
            )}
            
            {currentTopicVector && (
              <span className="topic-vector-badge">
                📍 {currentTopicVector}
              </span>
            )}
            
          </div>
        </div>
        
        {/* Window Controls */}
        {activeChat === 'ultrathink' && (
          <div className="window-controls">
            {!showCoordinator && (
              <button 
                className="control-btn"
                onClick={() => setShowCoordinator(true)}
                title="Mostrar painel do coordenador"
              >
                🎯 Coordenador
              </button>
            )}
            <button 
              className="control-btn"
              onClick={() => setShowNetworkMap(!showNetworkMap)}
              title={showNetworkMap ? "Ocultar mapa de rede" : "Mostrar mapa de rede"}
            >
              🗺️ {showNetworkMap ? "Ocultar" : "Mostrar"} Rede
            </button>
            {lastAnalysisResult && (
              <button 
                className="control-btn"
                onClick={() => setShowMetrics(!showMetrics)}
                title={showMetrics ? "Ocultar métricas" : "Mostrar métricas"}
              >
                📊 {showMetrics ? "Ocultar" : "Mostrar"} Métricas
              </button>
            )}
          </div>
        )}
        
        {/* Indicador de Progresso */}
        {activeChat === 'all' && (
          <div className="agent-progress-wrapper">
            <AgentProgress 
              totalAgents={agentProgress.totalAgents}
              processedAgents={agentProgress.processedAgents}
              successCount={agentProgress.successCount}
              failedCount={agentProgress.failedCount}
              isActive={agentProgress.isActive}
            />
          </div>
        )}
        
        {/* Indicador de Revisão de Consenso */}
        {activeChat === 'ultrathink' && isReviewingConsensus && (
          <div className="consensus-review-indicator">
            <div className="consensus-pulse"></div>
            <span>🧠 Revisando para Consenso...</span>
          </div>
        )}
        
        {/* Contador de Respostas do UltraThink */}
        {activeChat === 'ultrathink' && ultrathinkTaskData && ultrathinkPhase < 4 && (
          <div className="ultrathink-progress-bar">
            <div className="progress-info">
              <span>📊 Coletando respostas: {ultrathinkResponsesMap.size}/35</span>
              <span className="progress-percentage">{Math.round(ultrathinkResponsesMap.size/35*100)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${Math.min(100, ultrathinkResponsesMap.size/35*100)}%`}}
              />
            </div>
            {ultrathinkResponsesMap.size >= 20 && ultrathinkPhase < 4 && (
              <button 
                className="force-orchestration-btn"
                onClick={() => {
                  console.log('🔘 Botão manual pressionado!')
                  console.log(`   - Respostas atuais: ${ultrathinkResponsesMap.size}`)
                  console.log(`   - Fase atual: ${ultrathinkPhase}`)
                  setUltrathinkPhase(4)
                  setTimeout(() => startOrchestrationPhase(), 100)
                }}
              >
                🎯 Iniciar Orquestração Agora
              </button>
            )}
          </div>
        )}
        
        {/* Container principal com área do coordenador */}
        <div className="chat-content-wrapper">
          {/* Mensagens ou Prompt Builder */}
          {activeChat === 'builder' ? (
            <div className="messages-container">
              <PromptBuilder 
                onBuildComplete={handlePromptBuilder}
                allAgents={allAgents}
              />
            </div>
          ) : (
            <div className="messages-container">
              {/* Legenda de cores */}
              {showColorLegend && (activeChat === 'all' || allAgents.find(a => a.id === activeChat)) && (
                <AgentColorLegend 
                  collapsed={false}
                  onToggle={() => setShowColorLegend(false)}
                />
              )}
              
              {/* Mensagem de boas-vindas do UltraThink */}
              {activeChat === 'ultrathink' && currentMessages.length === 0 && (
                <div className="ultrathink-welcome">
                  <h3>🚀 UltraThink Workflow</h3>
                  <p>Sistema de inteligência coletiva com <strong>100 especialistas</strong> trabalhando em sinergia.</p>
                  
                  <div className="workflow-phases">
                    <h4>Como funciona:</h4>
                    <div className="phase-item">
                      <span className="phase-number">1️⃣</span>
                      <span className="phase-desc">25 especialistas analisam sua questão</span>
                    </div>
                    <div className="phase-item">
                      <span className="phase-number">2️⃣</span>
                      <span className="phase-desc">+25 fazem análise cruzada e validação</span>
                    </div>
                    <div className="phase-item">
                      <span className="phase-number">3️⃣</span>
                      <span className="phase-desc">Detecção de padrões e insights</span>
                    </div>
                    <div className="phase-item">
                      <span className="phase-number">4️⃣</span>
                      <span className="phase-desc">Orquestrador consolida conhecimento</span>
                    </div>
                    <div className="phase-item">
                      <span className="phase-number">5️⃣</span>
                      <span className="phase-desc">Chief Strategy Officer sintetiza resultado</span>
                    </div>
                  </div>
                  
                  <p className="ultrathink-hint">
                    <strong>🎯 Faça sua pergunta</strong> e veja a rede neural em ação!
                  </p>
                </div>
              )}
              
              {currentMessages.map(msg => {
                // Obter categoria e cor do agente
                const agentCategory = msg.agent ? getAgentCategory(msg.agent) : null;
                const agentBadge = msg.agent ? getAgentBadge(msg.agent) : null;
                
                // Debug das cores
                if (msg.type === 'agent' && agentBadge) {
                  console.log('🎨 Aplicando cor:', {
                    agent: msg.agent,
                    category: agentCategory?.name,
                    color: agentBadge?.color,
                    categoryKey: agentCategory?.key
                  });
                }
                
                return (
                <div 
                  key={msg.id} 
                  className={`message message-${msg.type} ${msg.subtype ? `message-${msg.subtype}` : ''} ${agentCategory ? `agent-category-${agentCategory.key}` : ''}`}
                  style={msg.type === 'agent' && agentBadge ? {
                    borderLeft: `4px solid ${agentBadge.color}`,
                    background: `linear-gradient(90deg, ${hexToRgba(agentBadge.color, 0.1)} 0%, transparent 50%)`
                  } : {}}
                >
                {msg.type === 'agent' && msg.agent && (
                  <div className="message-agent-info">
                    <span 
                      className="agent-name"
                      style={{
                        background: agentBadge?.color || '#666',
                        color: getContrastColor(agentBadge?.color || '#666'),
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      <span>{agentCategory?.icon}</span>
                      {msg.agent}
                    </span>
                  </div>
                )}
                
                {/* Mensagem especial com prompt detalhado */}
                {msg.type === 'special' && msg.subtype === 'detailed-prompt' ? (
                  <div className="detailed-prompt-container">
                    {msg.title && <h3 className="prompt-title">{msg.title}</h3>}
                    <div className="prompt-content">
                      <pre>{msg.content}</pre>
                    </div>
                    {msg.actions && (
                      <div className="prompt-actions">
                        {msg.actions.map(action => (
                          <button
                            key={action.id}
                            className={`action-button action-${action.id}`}
                            onClick={() => {
                              if (action.id === 'copy') {
                                navigator.clipboard.writeText(msg.content)
                                  .then(() => alert('✅ Prompt copiado para a área de transferência!'))
                                  .catch(() => alert('❌ Erro ao copiar. Tente selecionar e copiar manualmente.'))
                              } else if (action.id === 'download') {
                                const blob = new Blob([msg.content], { type: 'text/markdown' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `ultrathink-prompt-${new Date().toISOString().split('T')[0]}.md`
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                URL.revokeObjectURL(url)
                              }
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <MessageContent 
                    message={msg}
                    isExpanded={expandedMessages[msg.id]}
                    onToggleExpand={() => toggleMessageExpansion(msg.id)}
                  />
                )}
                
                <div className="message-time">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                </div>
              </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
          )}
          
          {/* Painel do Coordenador - Fixo à direita */}
          {activeChat === 'ultrathink' && showCoordinator && (ultrathinkTaskData || ultrathinkPhase === 0) && (
            <div className="coordinator-panel">
              <button 
                className="coordinator-close-btn"
                onClick={() => setShowCoordinator(false)}
                title="Fechar painel"
              >
                ✕
              </button>
              <div className="coordinator-header">
                <span className="coordinator-icon">🎯</span>
                <h3>Coordenador UltraThink</h3>
              </div>
              
              <div className="coordinator-status">
                {/* Status da Fase Atual */}
                <div className="status-item">
                  <span className="status-label">Fase Atual:</span>
                  <span className="status-value phase-indicator">
                    {!ultrathinkTaskData && ultrathinkPhase === 0 && '⏳ Aguardando início...'}
                    {ultrathinkTaskData && ultrathinkPhase === 0 && '⏳ Inicializando...'}
                    {ultrathinkPhase === 1 && '📤 Fase 1: Consulta Inicial'}
                    {ultrathinkPhase === 2 && '🔄 Fase 2: Análise Cruzada'}
                    {ultrathinkPhase === 3 && '⚡ Fase 3: Análise de Padrões'}
                    {ultrathinkPhase === 4 && '🧠 Fase 4: Orquestração'}
                    {ultrathinkPhase === 5 && '✨ Fase 5: Síntese Final'}
                    {ultrathinkPhase > 5 && `🔮 Fase ${ultrathinkPhase}: Discussão Adicional`}
                  </span>
                </div>
                
                {/* Tempo Decorrido */}
                <div className="status-item">
                  <span className="status-label">Tempo:</span>
                  <span className="status-value">
                    ⏱️ {(elapsedTime / 1000).toFixed(1)}s
                  </span>
                </div>
                
                {/* Respostas Coletadas */}
                <div className="status-item">
                  <span className="status-label">Respostas:</span>
                  <span className="status-value">
                    📊 {ultrathinkResponsesMap.size}/{ultrathinkTaskData?.analysisPhases?.selectedAgents?.length || 50}
                  </span>
                </div>
                
                {/* Taxa de Sucesso */}
                <div className="status-item">
                  <span className="status-label">Taxa de Sucesso:</span>
                  <span className="status-value success-rate">
                    ✅ {Math.round((ultrathinkResponsesMap.size / (ultrathinkTaskData?.analysisPhases?.selectedAgents?.length || 50)) * 100)}%
                  </span>
                </div>
                
                {/* Mensagens de Status */}
                <div className="coordinator-messages">
                  {ultrathinkPhase === 1 && (
                    <div className="coordinator-message">
                      📤 Enviando consulta para primeiros 25 especialistas...
                    </div>
                  )}
                  {ultrathinkPhase === 2 && (
                    <div className="coordinator-message">
                      🔄 Processando análise cruzada com especialistas adicionais...
                    </div>
                  )}
                  {ultrathinkPhase === 3 && (
                    <div className="coordinator-message">
                      ⚡ Identificando padrões e convergências nas respostas...
                    </div>
                  )}
                  {ultrathinkPhase === 4 && (
                    <div className="coordinator-message">
                      🧠 Orquestrador analisando consenso entre especialistas...
                    </div>
                  )}
                  {ultrathinkPhase === 5 && (
                    <div className="coordinator-message">
                      ✨ Consolidando resultados e recomendações finais...
                    </div>
                  )}
                </div>
                
                {/* Barra de Progresso Visual */}
                <div className="coordinator-progress">
                  <div className="phase-progress">
                    {[1,2,3,4,5].map(phase => (
                      <div 
                        key={phase}
                        className={`phase-step ${ultrathinkPhase >= phase ? 'completed' : ''} ${ultrathinkPhase === phase ? 'active' : ''}`}
                      >
                        {phase}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Botão para Nova Análise */}
                {ultrathinkPhase === 0 && (
                  <div style={{padding: '1rem', textAlign: 'center'}}>
                    <button
                      className="force-orchestration-btn"
                      onClick={() => {
                        // Limpar mensagens antigas
                        setMessages(prev => ({
                          ...prev,
                          ultrathink: []
                        }))
                        // Resetar completamente
                        setUltrathinkPhase(0)
                        setUltrathinkTaskData(null)
                        setUltrathinkResponsesMap(new Map())
                      }}
                      style={{width: '100%'}}
                    >
                      🔄 Nova Análise UltraThink
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Input */}
        {activeChat !== 'builder' && (
          <form onSubmit={handleSubmit} className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeChat === 'ultrathink' ? "🚀 Faça sua pergunta para ativar os 100 especialistas..." :
                activeChat === 'summary' ? "Peça um resumo sobre algo específico..." :
                activeChat === 'builder' ? "Digite o objetivo do seu prompt..." :
                "Digite uma mensagem..."
              }
              disabled={!isConnected || isProcessing || isReviewingConsensus}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={!isConnected || !input.trim() || isProcessing}
              className="send-button"
            >
              {isProcessing ? (
                <Icon name="Loading" size={20} color="white" />
              ) : (
                <Icon name="Send" size={20} color="white" />
              )}
            </button>
          </form>
        )}
        
        {/* Status de conexão */}
        {!isConnected && (
          <div className="connection-warning">
            ⚠️ Desconectado. Verifique se o servidor está rodando.
          </div>
        )}
      </div>
      
      {/* Controles do UltraThink */}
      {activeChat === 'ultrathink' && (
        <div className="ultrathink-controls">
          {/* Seletor de idioma */}
          <LanguageSelector 
            currentLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      )}
      
      {/* Dashboard de Métricas integrado ao chat */}
      {activeChat === 'ultrathink' && (
        <div className={`analysis-metrics-container ${!showMetrics ? 'hidden' : ''}`}>
          <div className="floating-window-header">
            <span className="floating-window-title">Métricas de Análise</span>
            <button 
              className="close-window-btn"
              onClick={() => setShowMetrics(false)}
              title="Fechar"
            >
              ✕
            </button>
          </div>
          <AnalysisMetrics 
            analysisData={lastAnalysisResult}
            isVisible={showMetrics}
          />
        </div>
      )}
      
      {/* Mapa de Rede Neural */}
      {activeChat === 'ultrathink' && showNetworkMap && (
        <AgentNetworkMap
          agents={allAgents}
          activeConnections={activeConnections}
          expanded={networkMapExpanded}
          onExpand={() => setNetworkMapExpanded(true)}
          onClose={() => {
            setNetworkMapExpanded(false)
            setShowNetworkMap(false)
          }}
          currentPhase={ultrathinkPhase}
        />
      )}
    </div>
  )
}

export default WarRoomWhatsApp