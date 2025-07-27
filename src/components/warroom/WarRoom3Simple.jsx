import { useState, useEffect, useRef } from 'react'
import './WarRoom3.css'
import './WarRoom3-dark-background.css'
import agentsDataFile from '../../../warroom-agents-100.json'

// Extrair array de agentes do JSON
const agentsData = agentsDataFile.warRoomTechInnovationRoles.agents || []

function WarRoom3Simple() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSpecialist, setSelectedSpecialist] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Filtrar especialistas
  const filteredAgents = agentsData.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 20) // Limitar a 20 para teste

  // Enviar mensagem
  const handleSendMessage = () => {
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

    // Simular resposta
    setTimeout(() => {
      const specialist = selectedSpecialist === 'all' 
        ? agentsData[Math.floor(Math.random() * agentsData.length)]
        : agentsData.find(a => a.id === selectedSpecialist) || agentsData[0]

      const aiMessage = {
        id: Date.now() + 1,
        text: `Como ${specialist.name}, analisando sua pergunta...`,
        sender: 'ai',
        specialist: specialist,
        timestamp: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="warroom3-container">
      {/* Sidebar */}
      <div className="wr3-sidebar">
        <div className="wr3-sidebar-header">
          <h2>War Room 3.0</h2>
        </div>

        <div className="wr3-search-box">
          <input
            type="text"
            placeholder="Buscar especialistas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wr3-search-input"
          />
        </div>

        <div className="wr3-specialist-list">
          <div 
            className={`wr3-specialist-item ${selectedSpecialist === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedSpecialist('all')}
          >
            <div className="wr3-specialist-avatar all">
              <span>🌐</span>
            </div>
            <div className="wr3-specialist-info">
              <h4>Todos os Especialistas</h4>
              <p>100+ especialistas</p>
            </div>
          </div>

          {filteredAgents.map(agent => (
            <div 
              key={agent.id}
              className={`wr3-specialist-item ${selectedSpecialist === agent.id ? 'active' : ''}`}
              onClick={() => setSelectedSpecialist(agent.id)}
            >
              <div className="wr3-specialist-avatar">
                <span>{agent.avatar || '👤'}</span>
              </div>
              <div className="wr3-specialist-info">
                <h4>{agent.name}</h4>
                <p>{agent.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="wr3-chat-area">
        <div className="wr3-chat-header">
          <div className="wr3-header-info">
            <div className="wr3-header-avatar">
              <span>🌐</span>
            </div>
            <div>
              <h3>War Room Chat</h3>
              <p>Especialistas em Tech</p>
            </div>
          </div>
        </div>

        <div className="wr3-messages-container">
          {messages.length === 0 ? (
            <div className="wr3-empty-state">
              <div className="wr3-empty-icon">💬</div>
              <h3>Inicie uma conversa</h3>
              <p>Faça uma pergunta aos especialistas</p>
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
                    {message.specialist && (
                      <div className="wr3-message-header">
                        <span className="wr3-message-name">{message.specialist.name}</span>
                      </div>
                    )}
                    <p className="wr3-message-text">{message.text}</p>
                    <span className="wr3-message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="wr3-input-container">
          <div className="wr3-input-wrapper">
            <input
              type="text"
              className="wr3-input"
              placeholder="Digite uma mensagem..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <button 
              className="wr3-send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WarRoom3Simple