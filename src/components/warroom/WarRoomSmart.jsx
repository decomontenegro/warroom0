import { useState, useEffect, useRef } from 'react'
import './WarRoomChat.css'
import agentsData from '../../../warroom-agents-100.json'

function WarRoomSmart({ ultrathinkWorkflow }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(null)
  const [discussionMode, setDiscussionMode] = useState('focused') // 'focused' or 'brainstorm'
  const [activeAgents, setActiveAgents] = useState([])
  const [showActiveAgents, setShowActiveAgents] = useState(true)
  const messagesEndRef = useRef(null)
  const wsRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const allAgents = agentsData.warRoomTechInnovationRoles.agents
  const phases = agentsData.warRoomTechInnovationRoles.phases

  // Smart agent selection - only the most relevant ones speak
  const selectSmartAgents = (task, phase) => {
    const keywords = task.toLowerCase().split(' ')
    const phaseAgentIds = phases[phase]?.agents || []
    
    // Score agents based on relevance
    const scoredAgents = phaseAgentIds.map(id => {
      const agent = allAgents.find(a => a.id === id)
      if (!agent) return null
      
      let score = 0
      // Check if agent capabilities match task keywords
      agent.capabilities.forEach(cap => {
        keywords.forEach(keyword => {
          if (cap.toLowerCase().includes(keyword)) score += 2
        })
      })
      
      // Special boost for key roles
      if (agent.name.includes('Lead') || agent.name.includes('Architect')) score += 1
      
      return { agent, score }
    }).filter(Boolean).sort((a, b) => b.score - a.score)
    
    // Return top 3-5 most relevant agents
    return scoredAgents.slice(0, Math.min(5, scoredAgents.length)).map(s => s.agent)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle UltraThink workflow when received
  useEffect(() => {
    if (ultrathinkWorkflow && isConnected && wsRef.current) {
      // Send workflow to server
      addMessage({
        agent: 'System',
        role: 'system',
        content: `🚀 Iniciando workflow ULTRATHINK: "${ultrathinkWorkflow.task}"`,
        timestamp: new Date()
      })
      
      wsRef.current.send(JSON.stringify({
        type: 'ultrathink-workflow',
        workflow: ultrathinkWorkflow
      }))
    }
  }, [ultrathinkWorkflow, isConnected])

  useEffect(() => {
    if (isInitialized) return
    
    // Mark as initialized immediately
    setIsInitialized(true)
    
    // Connect to server
    connectToWarRoomServer()
    
    // Add welcome message only once
    const welcomeMessage = {
      agent: 'Moderator',
      role: 'system',
      content: `Bem-vindo ao War Room Inteligente! 🎯
      
Eu sou o moderador e vou coordenar nossa equipe de ${allAgents.length} especialistas para ajudar você.

Como funciona:
• Descreva seu projeto ou desafio
• Selecionarei os especialistas mais relevantes
• Cada um dará insights concisos e focados
• Você pode fazer perguntas específicas a qualquer momento

Vamos começar?`,
      timestamp: new Date()
    }
    
    // Use setTimeout to ensure it's added after component is fully mounted
    setTimeout(() => {
      setMessages([{
        id: Date.now() + Math.random(),
        ...welcomeMessage
      }])
    }, 100)

    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [isInitialized])

  const connectToWarRoomServer = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.hostname}:3005/warroom-ws`)
      
      ws.onopen = () => {
        setIsConnected(true)
        console.log('Connected to War Room server')
      }
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        handleServerMessage(message)
      }
      
      ws.onclose = () => {
        setIsConnected(false)
        setTimeout(connectToWarRoomServer, 5000)
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  const handleServerMessage = (message) => {
    switch (message.type) {
      case 'agent-response':
        addMessage({
          agent: message.agent,
          role: message.role || 'agent',
          content: message.content,
          timestamp: new Date()
        })
        break
        
      case 'agent-message':
        addMessage({
          agent: message.agent,
          role: 'agent',
          content: message.message || message.content,
          timestamp: new Date()
        })
        break
        
      case 'ultrathink-update':
        if (message.data) {
          const data = message.data
          
          if (data.status === 'started') {
            setCurrentPhase('initializing')
            addMessage({
              agent: 'UltraThink',
              role: 'system',
              content: data.message || 'Workflow iniciado com 100 agentes especializados',
              timestamp: new Date()
            })
          } else if (data.phase) {
            setCurrentPhase(data.phase)
            if (data.status === 'completed') {
              addMessage({
                agent: 'UltraThink',
                role: 'system',
                content: `✅ Fase ${data.phase} concluída: ${data.insights} insights, ${data.decisions} decisões`,
                timestamp: new Date()
              })
            }
          } else if (data.status === 'completed') {
            setCurrentPhase(null)
            addMessage({
              agent: 'UltraThink',
              role: 'system',
              content: `🎯 Workflow concluído! ${data.totalAgentsActivated} agentes ativados. Tempo total: ${data.duration}`,
              timestamp: new Date()
            })
          }
        }
        break
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (message) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      ...message,
      isNew: true
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Add agent to active list if it's an agent message
    if (message.role === 'agent' && message.agent !== 'Moderator') {
      const agentInfo = allAgents.find(a => a.name === message.agent)
      if (agentInfo && !activeAgents.find(a => a.name === message.agent)) {
        setActiveAgents(prev => [...prev, {
          ...agentInfo,
          activeSince: new Date(),
          lastMessage: new Date()
        }])
      } else if (agentInfo) {
        // Update last message time
        setActiveAgents(prev => prev.map(a => 
          a.name === message.agent ? { ...a, lastMessage: new Date() } : a
        ))
      }
    }
    
    // Remove "new" flag after animation
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, isNew: false } : m
      ))
    }, 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isProcessing) return

    const userMessage = inputValue
    setInputValue('')
    
    // Add user message
    addMessage({
      agent: 'User',
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    })

    setIsProcessing(true)

    // Moderator acknowledges
    setTimeout(() => {
      addMessage({
        agent: 'Moderator',
        role: 'system',
        content: `Entendi! Vou convocar os especialistas mais relevantes para "${userMessage}". Um momento...`,
        timestamp: new Date()
      })
    }, 500)

    // Smart agent selection and responses
    setTimeout(async () => {
      await processSmartWorkflow(userMessage)
      setIsProcessing(false)
    }, 1500)
  }

  const processSmartWorkflow = async (task) => {
    // Phase 1: Quick Analysis (2-3 key agents)
    const analysisAgents = selectSmartAgents(task, 'brainstorm').slice(0, 3)
    
    addMessage({
      agent: 'Moderator',
      role: 'system',
      content: `📋 **Fase 1: Análise Inicial**
Convoquei ${analysisAgents.length} especialistas para análise:
${analysisAgents.map(a => `• ${a.name} - ${a.role}`).join('\n')}`,
      timestamp: new Date()
    })

    // Use multi-agent request for Phase 1
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'multi-agent-request',
        agents: analysisAgents,
        task: task,
        context: messages.slice(-5).map(m => ({ type: m.role, content: m.content }))
      }))
      await new Promise(resolve => setTimeout(resolve, analysisAgents.length * 1500))
    } else {
      for (const agent of analysisAgents) {
        await simulateAgentResponse(agent, task, 'analysis')
      }
    }

    // Phase 2: Technical Deep Dive (3-4 specialists)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const techAgents = selectSmartAgents(task, 'development').slice(0, 4)
    
    addMessage({
      agent: 'Moderator',
      role: 'system',
      content: `📋 **Fase 2: Análise Técnica**
Agora vamos aprofundar com especialistas técnicos:
${techAgents.map(a => `• ${a.name} - ${a.role}`).join('\n')}`,
      timestamp: new Date()
    })

    // Use multi-agent request for Phase 2
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'multi-agent-request',
        agents: techAgents,
        task: task,
        context: messages.slice(-5).map(m => ({ type: m.role, content: m.content }))
      }))
      await new Promise(resolve => setTimeout(resolve, techAgents.length * 1500))
    } else {
      for (const agent of techAgents) {
        await simulateAgentResponse(agent, task, 'technical')
      }
    }

    // Phase 3: Summary and Recommendations
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    addMessage({
      agent: 'Moderator',
      role: 'system',
      content: `📊 **Resumo e Próximos Passos**

Com base na análise dos especialistas:

✅ **Principais Insights:**
• Viabilidade técnica confirmada
• Desafios identificados e soluções propostas
• Roadmap claro de implementação

💡 **Recomendações:**
1. Começar com MVP focado
2. Implementar segurança desde o início
3. Planejar escalabilidade

Gostaria de explorar algum aspecto específico? Posso convocar especialistas adicionais.`,
      timestamp: new Date()
    })
  }

  const simulateAgentResponse = async (agent, task, type) => {
    // Try to get real AI response via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'agent-request',
        agent: agent,
        task: task,
        phase: type,
        capabilities: agent.capabilities
      }))
      
      // Wait for response (it will come through handleServerMessage)
      await new Promise(resolve => setTimeout(resolve, 2000))
    } else {
      // Fallback to simulation if no WebSocket connection
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let response = ''
      
      switch (type) {
        case 'analysis':
          response = `Analisando "${task}" sob a perspectiva de ${agent.role}:
• ${agent.capabilities[0]}: Identifico oportunidades importantes aqui
• ${agent.capabilities[1]}: Sugiro abordagem estruturada
• Recomendação principal: Focar em implementação gradual`
          break
          
        case 'technical':
          response = `Do ponto de vista técnico (${agent.role}):
• Stack recomendada baseada em ${agent.capabilities[0]}
• Considerações de ${agent.capabilities[1]}
• Tempo estimado: 2-3 meses para MVP`
          break
          
        default:
          response = `Insight específico sobre ${task}`
      }
      
      addMessage({
        agent: agent.name,
        role: 'agent',
        content: response,
        timestamp: new Date()
      })
    }
  }

  const getAgentAvatar = (agent) => {
    if (agent === 'Moderator') return '🎯'
    if (agent === 'User') return '👤'
    
    // Smart avatar selection based on role
    const roleAvatars = {
      'Architect': '🏗️',
      'Lead': '👨‍💼',
      'Engineer': '👷',
      'Designer': '🎨',
      'Security': '🔒',
      'Manager': '📊',
      'Analyst': '📈',
      'Developer': '💻'
    }
    
    for (const [key, avatar] of Object.entries(roleAvatars)) {
      if (agent.includes(key)) return avatar
    }
    
    return '🤖'
  }

  const getMessageColor = (role) => {
    const colors = {
      'system': '#00ff88',
      'user': '#3498db',
      'agent': '#9b59b6'
    }
    return colors[role] || '#666'
  }
  
  const getAgentColor = (agentName) => {
    const colors = [
      '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
      '#1abc9c', '#34495e', '#e67e22', '#16a085', '#27ae60'
    ]
    
    // Use agent name to generate consistent color
    let hash = 0
    for (let i = 0; i < agentName.length; i++) {
      hash = agentName.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="warroom-chat">
      {showActiveAgents && activeAgents.length > 0 && (
        <div className="active-agents-panel">
          <div className="active-agents-title">
            🟢 Agentes Ativos ({activeAgents.length})
          </div>
          {activeAgents.map(agent => (
            <div key={agent.id} className="active-agent-item">
              <div 
                className="active-agent-avatar"
                style={{ backgroundColor: getAgentColor(agent.name) }}
              >
                {getAgentAvatar(agent.name)}
              </div>
              <div className="active-agent-name">{agent.name}</div>
              <div className="active-agent-status">ativo</div>
            </div>
          ))}
        </div>
      )}
      
      <div className="chat-header">
        <h2>🧠 War Room Inteligente</h2>
        <div className="header-info">
          <div className="mode-selector">
            <button 
              className={discussionMode === 'focused' ? 'active' : ''}
              onClick={() => setDiscussionMode('focused')}
            >
              Modo Focado
            </button>
            <button 
              className={discussionMode === 'brainstorm' ? 'active' : ''}
              onClick={() => setDiscussionMode('brainstorm')}
            >
              Brainstorm
            </button>
          </div>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span>{isConnected ? 'Online' : 'Offline'}</span>
          </div>
          <button
            onClick={() => setShowActiveAgents(!showActiveAgents)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {showActiveAgents ? '👁️ Ocultar' : '👁️ Mostrar'} Agentes
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.role}-message ${message.isNew ? 'active-agent' : ''}`}
          >
            <div className="message-header">
              <span 
                className="agent-avatar"
                style={{ backgroundColor: getMessageColor(message.role) }}
              >
                {getAgentAvatar(message.agent)}
              </span>
              <span className="agent-name">{message.agent}</span>
              <span className="timestamp">
                {message.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="message-content">
              {message.content.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={discussionMode === 'focused' 
            ? "Descreva seu projeto ou faça uma pergunta específica..." 
            : "Vamos fazer um brainstorm! Qual sua ideia?"}
          className="chat-input"
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isProcessing || !inputValue.trim()}
        >
          <span>Enviar</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  )
}

export default WarRoomSmart