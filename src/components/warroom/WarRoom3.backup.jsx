import { useState, useEffect, useRef } from 'react'
import './WarRoom3.css'
import './WarRoom3-dark-background.css'
import AgentNetworkMap from './AgentNetworkMap'
import agentsData from '../../../warroom-agents-100.json'

// Importar especialistas
import specialistProfiles from './specialistProfiles.json'

function WarRoom3() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSpecialist, setSelectedSpecialist] = useState('all')
  const [activeTab, setActiveTab] = useState('chat')
  const [isTyping, setIsTyping] = useState(false)
  const [showGraph, setShowGraph] = useState(false)
  const [activeAgents, setActiveAgents] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll para mensagens novas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Foco no input ao carregar
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

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
    setInputValue('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Simular resposta do especialista
      setTimeout(() => {
        const specialist = selectedSpecialist === 'all' 
          ? specialistProfiles[Math.floor(Math.random() * specialistProfiles.length)]
          : specialistProfiles.find(s => s.id === selectedSpecialist)

        const aiMessage = {
          id: Date.now() + 1,
          text: `[${specialist.name}]: Analisando sua questão sobre "${inputValue}"...`,
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

  return (
    <div className="warroom3-container">
      {/* Sidebar com lista de especialistas */}
      <div className="wr3-sidebar">
        <div className="wr3-sidebar-header">
          <h2>War Room 3.0</h2>
        </div>
        
        <div className="wr3-specialist-tabs">
          <button 
            className={`wr3-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chats
          </button>
          <button 
            className={`wr3-tab ${activeTab === 'specialists' ? 'active' : ''}`}
            onClick={() => setActiveTab('specialists')}
          >
            👥 Especialistas
          </button>
        </div>

        <div className="wr3-specialist-list">
          {/* Chat com todos */}
          <div 
            className={`wr3-specialist-item ${selectedSpecialist === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedSpecialist('all')}
          >
            <div className="wr3-specialist-avatar all">
              <span>🌐</span>
            </div>
            <div className="wr3-specialist-info">
              <h4>Todos os Especialistas</h4>
              <p>Pergunte para todos os 100+ especialistas</p>
            </div>
          </div>

          {/* Lista de especialistas individuais */}
          {specialistProfiles.slice(0, 10).map(specialist => (
            <div 
              key={specialist.id}
              className={`wr3-specialist-item ${selectedSpecialist === specialist.id ? 'active' : ''}`}
              onClick={() => setSelectedSpecialist(specialist.id)}
            >
              <div className="wr3-specialist-avatar">
                <span>{specialist.avatar}</span>
              </div>
              <div className="wr3-specialist-info">
                <h4>{specialist.name}</h4>
                <p>{specialist.expertise}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área principal do chat */}
      <div className="wr3-chat-area">
        {/* Header do chat */}
        <div className="wr3-chat-header">
          <div className="wr3-header-info">
            {selectedSpecialist === 'all' ? (
              <>
                <div className="wr3-header-avatar all">🌐</div>
                <div>
                  <h3>Todos os Especialistas</h3>
                  <p>100+ especialistas online</p>
                </div>
              </>
            ) : (
              <>
                <div className="wr3-header-avatar">
                  {specialistProfiles.find(s => s.id === selectedSpecialist)?.avatar || '👤'}
                </div>
                <div>
                  <h3>{specialistProfiles.find(s => s.id === selectedSpecialist)?.name || 'Especialista'}</h3>
                  <p>{specialistProfiles.find(s => s.id === selectedSpecialist)?.expertise || 'Online'}</p>
                </div>
              </>
            )}
          </div>
          
          <div className="wr3-header-actions">
            <button 
              className={`wr3-action-btn ${showGraph ? 'active' : ''}`}
              onClick={() => setShowGraph(!showGraph)}
              title="Ver Graph de Especialistas"
            >
              🕸️
            </button>
            <button className="wr3-action-btn" title="Buscar">🔍</button>
            <button className="wr3-action-btn" title="Menu">⋮</button>
          </div>
        </div>

        {/* Graph de especialistas */}
        {showGraph && (
          <div className="wr3-graph-overlay">
            <div className="wr3-graph-container">
              <button 
                className="wr3-graph-close"
                onClick={() => setShowGraph(false)}
              >
                ✕
              </button>
              <AgentNetworkMap 
                agents={agentsData}
                activeAgents={activeAgents}
                onAgentClick={(agent) => {
                  console.log('Agent clicked:', agent)
                  setSelectedSpecialist(agent.id)
                  setShowGraph(false)
                }}
              />
            </div>
          </div>
        )}

        {/* Área de mensagens */}
        <div className="wr3-messages-container">
          {messages.length === 0 ? (
            <div className="wr3-empty-state">
              <div className="wr3-empty-icon">💬</div>
              <h3>Inicie uma conversa</h3>
              <p>Faça uma pergunta aos especialistas do War Room</p>
            </div>
          ) : (
            <div className="wr3-messages-list">
              {messages.map(message => (
                <div 
                  key={message.id}
                  className={`wr3-message ${message.sender === 'user' ? 'user' : 'ai'}`}
                >
                  {message.sender === 'ai' && (
                    <div className="wr3-message-avatar">
                      <span>{message.specialist?.avatar || '🤖'}</span>
                    </div>
                  )}
                  <div className="wr3-message-bubble">
                    <p className="wr3-message-text">{message.text}</p>
                    <span className="wr3-message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="wr3-message ai">
                  <div className="wr3-message-avatar">
                    <span>🤖</span>
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
            <button className="wr3-attach-btn" title="Anexar">📎</button>
            
            <input
              ref={inputRef}
              type="text"
              className="wr3-input"
              placeholder="Digite uma mensagem..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            
            <button 
              className="wr3-send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              title="Enviar"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WarRoom3