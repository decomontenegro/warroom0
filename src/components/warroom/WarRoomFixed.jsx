import { useState, useEffect, useRef } from 'react'
import './WarRoomFixed.css'

function WarRoomFixed() {
  const [activeChat, setActiveChat] = useState('all')
  const [messages, setMessages] = useState({
    all: [
      { id: 1, type: 'system', content: 'Bem-vindo ao WarRoom! 🚀', timestamp: new Date() }
    ]
  })
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)
  const wsRef = useRef(null)

  // Conectar WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket('ws://localhost:3005/warroom-ws')
        
        wsRef.current.onopen = () => {
          console.log('✅ WebSocket conectado')
          setIsConnected(true)
        }
        
        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('📥 Mensagem recebida:', data)
            
            if (data.type === 'agent-response') {
              const newMessage = {
                id: Date.now(),
                type: 'agent',
                agent: data.agent?.name || 'Agente',
                content: data.response || data.content,
                timestamp: new Date()
              }
              
              setMessages(prev => ({
                ...prev,
                all: [...(prev.all || []), newMessage]
              }))
            }
          } catch (error) {
            console.error('Erro ao processar mensagem:', error)
          }
        }
        
        wsRef.current.onerror = (error) => {
          console.error('❌ WebSocket erro:', error)
          setIsConnected(false)
        }
        
        wsRef.current.onclose = () => {
          console.log('🔌 WebSocket desconectado')
          setIsConnected(false)
          // Tentar reconectar em 3 segundos
          setTimeout(connectWebSocket, 3000)
        }
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error)
        setIsConnected(false)
      }
    }
    
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !isConnected) return
    
    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => ({
      ...prev,
      all: [...(prev.all || []), userMessage]
    }))
    
    // Enviar para o servidor
    const message = {
      type: 'multi-agent-request',
      agents: [
        { name: 'Frontend Developer', role: 'UI/UX Expert' },
        { name: 'Backend Developer', role: 'API Specialist' },
        { name: 'DevOps Engineer', role: 'Infrastructure' }
      ],
      task: input,
      context: [],
      chatId: 'all',
      requestId: `req-${Date.now()}`,
      language: 'pt-BR'
    }
    
    wsRef.current.send(JSON.stringify(message))
    setInput('')
  }

  return (
    <div className="warroom-container">
      {/* Sidebar */}
      <div className="warroom-sidebar">
        <div className="sidebar-header">
          <h2>WarRoom</h2>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </div>
        </div>
        
        <div className="chat-list">
          <div 
            className={`chat-item ${activeChat === 'all' ? 'active' : ''}`}
            onClick={() => setActiveChat('all')}
          >
            <div className="chat-avatar" style={{ background: '#3b82f6' }}>
              <span>👥</span>
            </div>
            <div className="chat-info">
              <div className="chat-name">Todos os Agentes</div>
              <div className="chat-preview">Chat geral com todos</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Área de chat */}
      <div className="chat-area">
        <div className="chat-header">
          <div className="chat-header-info">
            <h3>Todos os Agentes</h3>
            <span>Chat colaborativo</span>
          </div>
        </div>
        
        <div className="messages-container">
          {messages.all?.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              {message.type === 'agent' && (
                <div className="message-header">
                  <span className="agent-name">{message.agent}</span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
              <div className={`message-bubble ${message.type === 'user' ? 'user-message' : ''}`}>
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isConnected ? "Digite sua mensagem..." : "Conectando..."}
            disabled={!isConnected}
          />
          <button onClick={sendMessage} disabled={!isConnected || !input.trim()}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}

export default WarRoomFixed