import { useState, useEffect, useRef } from 'react'
import agentsData from '../../../warroom-agents-100.json'
import './WarRoomMultiAgent.css'

const allAgents = agentsData.warRoomTechInnovationRoles.agents

function WarRoomMultiAgent() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)
  
  useEffect(() => {
    // Conectar ao WebSocket
    const ws = new WebSocket('ws://localhost:3005/warroom-ws')
    wsRef.current = ws
    
    ws.onopen = () => {
      setIsConnected(true)
      addSystemMessage('Conectado ao War Room com 100+ especialistas!')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'agent-response') {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          type: 'agent',
          agent: data.agent,
          role: data.role,
          content: data.content,
          agentNumber: data.agentNumber,
          totalAgents: data.totalAgents,
          timestamp: new Date()
        }])
      }
      
      if (data.type === 'multi-agent-complete') {
        setIsProcessing(false)
        addSystemMessage(`Discussão concluída! ${data.totalAgents} especialistas contribuíram.`)
      }
    }
    
    ws.onerror = () => {
      setIsConnected(false)
      addSystemMessage('Erro de conexão. Verifique se o servidor está rodando.')
    }
    
    ws.onclose = () => {
      setIsConnected(false)
    }
    
    return () => {
      ws.close()
    }
  }, [])
  
  useEffect(() => {
    // Auto-scroll para última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const addSystemMessage = (content) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      content,
      timestamp: new Date()
    }])
  }
  
  const getAgentAvatar = (agentName) => {
    const avatars = {
      'Frontend': '🎨',
      'Backend': '⚙️',
      'Security': '🔒',
      'Database': '🗄️',
      'DevOps': '🚀',
      'Performance': '⚡',
      'API': '🔌',
      'Cloud': '☁️',
      'Mobile': '📱',
      'AI': '🤖',
      'Test': '🧪',
      'UX': '🎯',
      'Product': '📊',
      'Design': '🎨',
      'Data': '📊'
    }
    
    for (const [key, avatar] of Object.entries(avatars)) {
      if (agentName.includes(key)) return avatar
    }
    return '💡'
  }
  
  const selectRelevantAgents = (query) => {
    const keywords = query.toLowerCase().split(' ')
    const scoreMap = new Map()
    
    allAgents.forEach(agent => {
      let score = 0
      
      // Check capabilities
      agent.capabilities.forEach(cap => {
        keywords.forEach(keyword => {
          if (cap.toLowerCase().includes(keyword)) score += 2
        })
      })
      
      // Check role and name
      keywords.forEach(keyword => {
        if (agent.role.toLowerCase().includes(keyword)) score += 1
        if (agent.name.toLowerCase().includes(keyword)) score += 3
      })
      
      // Boost específicos
      if (query.includes('react') && agent.name.includes('Frontend')) score += 5
      if (query.includes('node') && agent.name.includes('Backend')) score += 5
      if (query.includes('performance') && agent.name.includes('Performance')) score += 5
      if (query.includes('segurança') && agent.name.includes('Security')) score += 5
      if (query.includes('test') && agent.name.includes('Test')) score += 5
      
      if (score > 0) {
        scoreMap.set(agent, score)
      }
    })
    
    // Retornar top 5-7 agentes
    return Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([agent]) => agent)
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || !isConnected || isProcessing) return
    
    const userMessage = input
    setInput('')
    setIsProcessing(true)
    
    // Adicionar mensagem do usuário
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }])
    
    // Selecionar agentes relevantes
    const selectedAgents = selectRelevantAgents(userMessage)
    
    // Mostrar quais agentes foram selecionados
    addSystemMessage(`🤖 Convocando ${selectedAgents.length} especialistas...`)
    
    // Enviar requisição multi-agente
    wsRef.current.send(JSON.stringify({
      type: 'multi-agent-request',
      agents: selectedAgents,
      task: userMessage,
      context: messages.slice(-5).map(m => ({ 
        type: m.type, 
        content: m.content 
      }))
    }))
  }
  
  return (
    <div className="warroom-container">
      {/* Header */}
      <header className="warroom-header">
        <div className="header-content">
          <h1>🧠 War Room</h1>
          <span className="subtitle">100+ Especialistas em Tech</span>
        </div>
        <div className="connection-status">
          <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
        </div>
      </header>
      
      {/* Mensagens */}
      <div className="messages-area">
        {messages.map(msg => (
          <div key={msg.id} className={`message message-${msg.type}`}>
            {msg.type === 'agent' && (
              <div className="agent-info">
                <span className="agent-avatar">{getAgentAvatar(msg.agent)}</span>
                <div className="agent-details">
                  <span className="agent-name">{msg.agent}</span>
                  <span className="agent-role">{msg.role}</span>
                  {msg.agentNumber && (
                    <span className="agent-count">[{msg.agentNumber}/{msg.totalAgents}]</span>
                  )}
                </div>
              </div>
            )}
            {msg.type === 'user' && (
              <div className="user-label">Você</div>
            )}
            <div className="message-content">
              {msg.content}
            </div>
            <div className="message-time">
              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isProcessing ? "Aguardando respostas..." : "Faça sua pergunta aos especialistas..."}
          disabled={!isConnected || isProcessing}
          className="message-input"
        />
        <button
          type="submit"
          disabled={!isConnected || !input.trim() || isProcessing}
          className="send-button"
        >
          {isProcessing ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  )
}

export default WarRoomMultiAgent