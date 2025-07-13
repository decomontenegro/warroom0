import { useState, useEffect, useRef } from 'react'
import './WarRoomChat.css'

function WarRoomChat() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeAgents, setActiveAgents] = useState(new Set())
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const agentAvatars = {
    'User': '👤',
    'SessionOrchestrator': '🎯',
    'Architect': '🏗️',
    'Security': '🔒',
    'Performance': '⚡',
    'Quality': '✨',
    'TestEngineer': '🧪',
    'DevOps': '🚀',
    'AIDialogModerator': '🤝',
    'System': '💫'
  }

  const agentColors = {
    'User': '#3498db',
    'SessionOrchestrator': '#e74c3c',
    'Architect': '#f39c12',
    'Security': '#9b59b6',
    'Performance': '#1abc9c',
    'Quality': '#34495e',
    'TestEngineer': '#e67e22',
    'DevOps': '#2ecc71',
    'AIDialogModerator': '#16a085',
    'System': '#95a5a6'
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Welcome message
    addMessage({
      agent: 'System',
      content: 'Bem-vindo ao War Room UltraThink! Digite sua pergunta ou descreva seu projeto para começar.',
      timestamp: new Date()
    })
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      ...message
    }])
    
    if (message.agent !== 'User' && message.agent !== 'System') {
      setActiveAgents(prev => new Set([...prev, message.agent]))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage = inputValue
    setInputValue('')
    
    // Add user message
    addMessage({
      agent: 'User',
      content: userMessage,
      timestamp: new Date()
    })

    // Show typing indicator
    setIsTyping(true)

    // Simulate agent responses
    setTimeout(() => {
      addMessage({
        agent: 'SessionOrchestrator',
        content: `Iniciando análise colaborativa para: "${userMessage}". Vou coordenar a equipe de especialistas.`,
        timestamp: new Date()
      })

      setTimeout(() => {
        addMessage({
          agent: 'Architect',
          content: 'Analisando requisitos arquiteturais e identificando padrões adequados...',
          timestamp: new Date()
        })

        setTimeout(() => {
          addMessage({
            agent: 'Security',
            content: 'Verificando implicações de segurança e melhores práticas...',
            timestamp: new Date()
          })
          setIsTyping(false)
        }, 2000)
      }, 1500)
    }, 1000)
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
        <div className="active-agents">
          <span className="agents-label">Agentes Ativos:</span>
          {[...activeAgents].map(agent => (
            <span key={agent} className="agent-badge">
              {agentAvatars[agent]} {agent}
            </span>
          ))}
        </div>
      </div>

      <div className="messages-container">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.agent === 'User' ? 'user-message' : 'agent-message'}`}
          >
            <div className="message-header">
              <span 
                className="agent-avatar"
                style={{ backgroundColor: agentColors[message.agent] }}
              >
                {agentAvatars[message.agent] || '🤖'}
              </span>
              <span className="agent-name">{message.agent}</span>
              <span className="timestamp">{formatTime(message.timestamp)}</span>
            </div>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
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
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="chat-input"
        />
        <button type="submit" className="send-button">
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

export default WarRoomChat