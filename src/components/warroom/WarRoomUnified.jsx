import { useState, useEffect, useRef } from 'react'
import './WarRoomChat.css'
import UltrathinkWorkflow from '../../services/ultrathink-workflow'
import agentsData from '../../../warroom-agents-100.json'

function WarRoomUnified() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeWorkflow, setActiveWorkflow] = useState(null)
  const [currentPhase, setCurrentPhase] = useState(null)
  const [activeAgents, setActiveAgents] = useState(new Set())
  const messagesEndRef = useRef(null)
  const wsRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)

  // Get all agents from the 100+ list
  const allAgents = agentsData.warRoomTechInnovationRoles.agents
  const phases = agentsData.warRoomTechInnovationRoles.phases

  // Agent avatars mapping (expanded for 100+ agents)
  const getAgentAvatar = (agentName) => {
    const avatarMap = {
      'Lead Architect': '🏗️',
      'Innovation Strategist': '💡',
      'Research Lead': '🔬',
      'Business Analyst': '📊',
      'Technical Writer': '📝',
      'Frontend Architect': '🎨',
      'Backend Architect': '⚙️',
      'Cloud Architect': '☁️',
      'DevOps Lead': '🚀',
      'Database Architect': '🗄️',
      'Security': '🔒',
      'Performance': '⚡',
      'Quality': '✨',
      'TestEngineer': '🧪',
      'Product': '📦',
      'UX': '🎯',
      'Marketing': '📈',
      'AIDialogModerator': '🤝'
    }
    
    // Try to match by role keywords
    for (const [key, avatar] of Object.entries(avatarMap)) {
      if (agentName.includes(key) || agentName.toLowerCase().includes(key.toLowerCase())) {
        return avatar
      }
    }
    
    // Default avatars based on common patterns
    if (agentName.includes('Security')) return '🔒'
    if (agentName.includes('Engineer')) return '👷'
    if (agentName.includes('Designer')) return '🎨'
    if (agentName.includes('Manager')) return '👔'
    if (agentName.includes('Analyst')) return '📊'
    if (agentName.includes('Lead')) return '🎯'
    
    return '🤖' // default
  }

  // Agent colors (generate based on agent ID for consistency)
  const getAgentColor = (agentId) => {
    const colors = [
      '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
      '#1abc9c', '#34495e', '#e67e22', '#16a085', '#27ae60',
      '#2980b9', '#8e44ad', '#f1c40f', '#d35400', '#c0392b'
    ]
    return colors[agentId % colors.length]
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    connectToWarRoomServer()
    
    // Welcome message
    addMessage({
      agent: 'System',
      agentId: 0,
      content: `🎯 Bem-vindo ao War Room UltraThink com ${allAgents.length} agentes especializados! 
      
Descreva seu projeto ou desafio técnico e nossa equipe de especialistas trabalhará em conjunto para criar a melhor solução.

Fases disponíveis: ${Object.keys(phases).join(' → ')}`,
      timestamp: new Date()
    })

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

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
        console.log('Disconnected from War Room server')
        setTimeout(connectToWarRoomServer, 5000)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('Failed to connect to War Room server:', error)
    }
  }

  const handleServerMessage = (message) => {
    switch (message.type) {
      case 'agent-message':
        addMessage({
          agent: message.agent,
          agentId: message.agentId,
          content: message.content,
          timestamp: new Date()
        })
        break
        
      case 'ultrathink-update':
        if (message.data.phases) {
          // Update phase progress
          const phaseData = message.data.phases
          Object.entries(phaseData).forEach(([phaseName, phase]) => {
            if (phase.status === 'running') {
              setCurrentPhase(phaseName)
            }
            
            // Add insights and decisions as messages
            if (phase.insights) {
              phase.insights.forEach(insight => {
                const agent = allAgents.find(a => phase.agentsUsed.includes(a.id))
                if (agent) {
                  addMessage({
                    agent: agent.name,
                    agentId: agent.id,
                    content: insight.content,
                    timestamp: new Date()
                  })
                }
              })
            }
          })
        }
        break
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (message) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(), // ensure unique ID
      ...message
    }])
    
    if (message.agent !== 'User' && message.agent !== 'System') {
      setActiveAgents(prev => new Set([...prev, message.agent]))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isProcessing) return

    const userMessage = inputValue
    setInputValue('')
    
    // Add user message
    addMessage({
      agent: 'User',
      agentId: -1,
      content: userMessage,
      timestamp: new Date()
    })

    setIsProcessing(true)

    // Start UltraThink workflow
    addMessage({
      agent: 'System',
      agentId: 0,
      content: '🚀 Iniciando workflow UltraThink com análise multi-agente...',
      timestamp: new Date()
    })

    try {
      // Send to server if connected
      if (isConnected && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ultrathink-workflow',
          workflow: {
            id: `workflow-${Date.now()}`,
            task: userMessage,
            config: {
              enableAutoLearning: true,
              maxIterations: 3,
              selectedPhases: Object.keys(phases)
            }
          }
        }))
      } else {
        // Local simulation fallback
        simulateUltrathinkWorkflow(userMessage)
      }
    } catch (error) {
      console.error('Error starting workflow:', error)
      addMessage({
        agent: 'System',
        agentId: 0,
        content: '❌ Erro ao iniciar workflow. Por favor, tente novamente.',
        timestamp: new Date()
      })
    } finally {
      setTimeout(() => setIsProcessing(false), 3000)
    }
  }

  const simulateUltrathinkWorkflow = async (task) => {
    // Simulate phase execution
    const phaseOrder = ['brainstorm', 'development', 'product', 'ux', 'design', 'marketing', 'security', 'testing']
    
    for (const phaseName of phaseOrder) {
      const phase = phases[phaseName]
      setCurrentPhase(phaseName)
      
      addMessage({
        agent: 'System',
        agentId: 0,
        content: `📋 Fase: ${phaseName.toUpperCase()} - ${phase.description}`,
        timestamp: new Date()
      })
      
      // Simulate 2-3 agents from this phase responding
      const phaseAgentIds = phase.agents.slice(0, 3)
      for (const agentId of phaseAgentIds) {
        const agent = allAgents.find(a => a.id === agentId)
        if (agent) {
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          addMessage({
            agent: agent.name,
            agentId: agent.id,
            content: `Como ${agent.role}, analisando "${task}": ${generateAgentResponse(agent, task, phaseName)}`,
            timestamp: new Date()
          })
        }
      }
    }
    
    setCurrentPhase(null)
    
    // Final summary
    addMessage({
      agent: 'System',
      agentId: 0,
      content: `✅ Workflow concluído! ${activeAgents.size} agentes contribuíram com insights para seu projeto.`,
      timestamp: new Date()
    })
  }

  const generateAgentResponse = (agent, task, phase) => {
    const responses = {
      brainstorm: [
        `Sugiro explorar ${agent.capabilities[0]} para maximizar o potencial do projeto`,
        `Baseado em ${agent.capabilities[1]}, identifiquei oportunidades interessantes`,
        `Vejo potencial para inovação aplicando ${agent.capabilities[2]}`
      ],
      development: [
        `Recomendo implementar usando ${agent.capabilities[0]} para melhor escalabilidade`,
        `A arquitetura deve considerar ${agent.capabilities[1]} desde o início`,
        `Podemos otimizar performance com ${agent.capabilities[2]}`
      ],
      security: [
        `Importante implementar ${agent.capabilities[0]} para proteção robusta`,
        `Detectei possíveis vulnerabilidades que precisam de ${agent.capabilities[1]}`,
        `Sugiro auditar usando ${agent.capabilities[2]} regularmente`
      ]
    }
    
    const phaseResponses = responses[phase] || responses.brainstorm
    return phaseResponses[Math.floor(Math.random() * phaseResponses.length)]
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="warroom-chat">
      <div className="chat-header">
        <h2>🧠 War Room UltraThink</h2>
        <div className="header-info">
          <div className="agents-counter">
            <span>{allAgents.length} Agentes</span>
            <span className="separator">•</span>
            <span>{activeAgents.size} Ativos</span>
          </div>
          {currentPhase && (
            <div className="current-phase">
              <span className="phase-indicator">Fase: {currentPhase}</span>
            </div>
          )}
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.agent === 'User' ? 'user-message' : 'agent-message'} ${message.agent === 'System' ? 'system-message' : ''}`}
          >
            <div className="message-header">
              <span 
                className="agent-avatar"
                style={{ 
                  backgroundColor: message.agent === 'System' ? '#95a5a6' : 
                                 message.agent === 'User' ? '#3498db' : 
                                 getAgentColor(message.agentId) 
                }}
              >
                {message.agent === 'User' ? '👤' : 
                 message.agent === 'System' ? '💫' : 
                 getAgentAvatar(message.agent)}
              </span>
              <span className="agent-name">{message.agent}</span>
              <span className="timestamp">{formatTime(message.timestamp)}</span>
            </div>
            <div className="message-content">
              {message.content}
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
          placeholder="Descreva seu projeto ou desafio técnico..."
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

export default WarRoomUnified