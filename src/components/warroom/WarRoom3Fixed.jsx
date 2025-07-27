import { useState, useEffect, useRef } from 'react'
import './WarRoom3.css'
import { Icon, getAgentIcon } from './LucideIcons'
import agentsData from '../../../warroom-agents-100.json'
import { i18n } from '../../services/i18n-config'

// Helper para traduções
const t = (key, fallback) => {
  try {
    return i18n.t ? i18n.t(`warroom.${key}`) : fallback
  } catch {
    return fallback
  }
}

function WarRoom3Fixed() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSpecialist, setSelectedSpecialist] = useState('all')
  const [activeTab, setActiveTab] = useState('chat')
  
  const messagesEndRef = useRef(null)
  const allAgents = agentsData.warRoomTechInnovationRoles?.agents || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsLoading(true)

    // Simular resposta
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: 'Esta é uma resposta de teste do WarRoom3.',
        sender: 'Coordinator',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, botResponse])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="warroom3-container">
      {/* Sidebar */}
      <div className="warroom3-sidebar">
        <div className="sidebar-header">
          <h2>{t('specialists', 'Especialistas')}</h2>
        </div>
        
        <div className="sidebar-search">
          <Icon name="Search" size={20} />
          <input 
            type="text" 
            placeholder={t('searchSpecialists', 'Buscar especialistas...')}
          />
        </div>

        <div className="specialists-list">
          <div 
            className={`specialist-item ${selectedSpecialist === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedSpecialist('all')}
          >
            <div className="specialist-avatar">
              <Icon name="Users" size={24} />
            </div>
            <div className="specialist-info">
              <div className="specialist-name">{t('allAgents', 'Todos os Agentes')}</div>
              <div className="specialist-role">{allAgents.length} {t('specialists', 'especialistas')}</div>
            </div>
          </div>

          {allAgents.slice(0, 10).map((agent) => (
            <div 
              key={agent.id}
              className={`specialist-item ${selectedSpecialist === agent.id ? 'active' : ''}`}
              onClick={() => setSelectedSpecialist(agent.id)}
            >
              <div className="specialist-avatar">
                {getAgentIcon(agent.role, 24)}
              </div>
              <div className="specialist-info">
                <div className="specialist-name">{agent.name}</div>
                <div className="specialist-role">{agent.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="warroom3-main">
        <div className="chat-header">
          <div className="chat-header-info">
            <h2>{selectedSpecialist === 'all' ? t('warRoom', 'War Room') : 'Chat Individual'}</h2>
            <span className="chat-status">{allAgents.length} {t('activeAgents', 'agentes ativos')}</span>
          </div>
          <div className="chat-header-actions">
            <button className="icon-button">
              <Icon name="Settings" size={20} />
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender === 'user' ? 'user' : 'agent'}`}>
              {message.sender !== 'user' && (
                <div className="message-avatar">
                  <Icon name="Bot" size={20} />
                </div>
              )}
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">{message.sender}</span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">{message.text}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message agent">
              <div className="message-avatar">
                <Icon name="Bot" size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('typeMessage', 'Digite sua mensagem...')}
            className="chat-input"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            <Icon name="Send" size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default WarRoom3Fixed