import { useState, useEffect, useRef } from 'react'
import './WarRoom3.css'
import './WarRoom3Complete.css'
import agentsDataFile from '../../../warroom-agents-100.json'
import AgentNetworkMap from './AgentNetworkMap'

// Extrair array de agentes do JSON
const agentsData = agentsDataFile.warRoomTechInnovationRoles.agents || []

// Traduções
const translations = {
  'pt-BR': {
    title: 'War Room 3.0',
    searchPlaceholder: 'Buscar especialistas...',
    allSpecialists: 'Todos os Especialistas',
    allSpecialistsDesc: '100+ especialistas',
    startConversation: 'Inicie uma conversa',
    askQuestion: 'Faça uma pergunta aos especialistas',
    typeMessage: 'Digite uma mensagem...',
    send: 'Enviar',
    networkView: 'Ver Rede',
    metrics: 'Métricas',
    totalAgents: 'Total de Agentes',
    activeAgents: 'Agentes Ativos',
    messagesExchanged: 'Mensagens Trocadas',
    responseTime: 'Tempo de Resposta',
    language: 'Idioma'
  },
  'en-US': {
    title: 'War Room 3.0',
    searchPlaceholder: 'Search specialists...',
    allSpecialists: 'All Specialists',
    allSpecialistsDesc: '100+ specialists',
    startConversation: 'Start a conversation',
    askQuestion: 'Ask a question to specialists',
    typeMessage: 'Type a message...',
    send: 'Send',
    networkView: 'Network View',
    metrics: 'Metrics',
    totalAgents: 'Total Agents',
    activeAgents: 'Active Agents',
    messagesExchanged: 'Messages Exchanged',
    responseTime: 'Response Time',
    language: 'Language'
  },
  'es-ES': {
    title: 'War Room 3.0',
    searchPlaceholder: 'Buscar especialistas...',
    allSpecialists: 'Todos los Especialistas',
    allSpecialistsDesc: '100+ especialistas',
    startConversation: 'Inicia una conversación',
    askQuestion: 'Haz una pregunta a los especialistas',
    typeMessage: 'Escribe un mensaje...',
    send: 'Enviar',
    networkView: 'Ver Red',
    metrics: 'Métricas',
    totalAgents: 'Total de Agentes',
    activeAgents: 'Agentes Activos',
    messagesExchanged: 'Mensajes Intercambiados',
    responseTime: 'Tiempo de Respuesta',
    language: 'Idioma'
  }
}

function WarRoom3Complete() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSpecialist, setSelectedSpecialist] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNetwork, setShowNetwork] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)
  const [language, setLanguage] = useState('pt-BR')
  const [activeAgents, setActiveAgents] = useState([])
  
  // Métricas
  const [metrics, setMetrics] = useState({
    totalAgents: agentsData.length,
    activeAgents: 0,
    messagesExchanged: 0,
    avgResponseTime: '1.2s'
  })
  
  const messagesEndRef = useRef(null)
  const t = (key) => translations[language][key] || key

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Atualizar métricas quando mensagens mudam
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      messagesExchanged: messages.length,
      activeAgents: [...new Set(messages.filter(m => m.sender === 'ai').map(m => m.specialist?.id))].length
    }))
  }, [messages])

  // Filtrar especialistas
  const filteredAgents = agentsData.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 20)

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
      setActiveAgents(prev => [...prev, specialist])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="warroom3-container">
      {/* Sidebar */}
      <div className={`wr3-sidebar ${showNetwork ? 'collapsed' : ''}`}>
        <div className="wr3-sidebar-header">
          <h2>{t('title')}</h2>
          <div className="wr3-language-selector">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="wr3-language-select"
            >
              <option value="pt-BR">🇧🇷 PT</option>
              <option value="en-US">🇺🇸 EN</option>
              <option value="es-ES">🇪🇸 ES</option>
            </select>
          </div>
        </div>

        <div className="wr3-sidebar-controls">
          <button 
            className={`wr3-control-btn ${showNetwork ? 'active' : ''}`}
            onClick={() => setShowNetwork(!showNetwork)}
          >
            🗺️ {t('networkView')}
          </button>
          <button 
            className={`wr3-control-btn ${showMetrics ? 'active' : ''}`}
            onClick={() => setShowMetrics(!showMetrics)}
          >
            📊 {t('metrics')}
          </button>
        </div>

        <div className="wr3-search-box">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
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
              <h4>{t('allSpecialists')}</h4>
              <p>{t('allSpecialistsDesc')}</p>
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

      {/* Main Content Area */}
      <div className="wr3-main-content">
        {/* Network Overlay */}
        {showNetwork && (
          <div className="wr3-network-overlay" onClick={() => setShowNetwork(false)} />
        )}
        
        {/* Network View Panel */}
        {showNetwork && (
          <div className="wr3-network-panel">
            <div className="wr3-panel-header">
              <h3>🗺️ {t('networkView')}</h3>
              <button 
                className="wr3-close-panel"
                onClick={() => setShowNetwork(false)}
              >
                ✕
              </button>
            </div>
            <div className="wr3-network-content">
              <AgentNetworkMap 
                agents={agentsData}
                activeAgents={activeAgents}
                onAgentClick={(agent) => {
                  setSelectedSpecialist(agent.id)
                  setShowNetwork(false)
                }}
                layout="force"
                showControls={true}
                isDynamic={true}
              />
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className={`wr3-chat-area ${showNetwork ? 'with-graph' : ''}`}>
          <div className="wr3-chat-header">
            <div className="wr3-header-info">
              <div className="wr3-header-avatar">
                <span>🌐</span>
              </div>
              <div>
                <h3>War Room Chat</h3>
                <p>{`${metrics.activeAgents} ${t('activeAgents')}`}</p>
              </div>
            </div>
          </div>

          {/* Metrics Panel */}
          {showMetrics && (
            <div className="wr3-metrics-panel">
              <div className="wr3-metrics-grid">
                <div className="wr3-metric-card">
                  <div className="wr3-metric-icon">👥</div>
                  <div className="wr3-metric-info">
                    <h4>{t('totalAgents')}</h4>
                    <p className="wr3-metric-value">{metrics.totalAgents}</p>
                  </div>
                </div>
                <div className="wr3-metric-card">
                  <div className="wr3-metric-icon">🟢</div>
                  <div className="wr3-metric-info">
                    <h4>{t('activeAgents')}</h4>
                    <p className="wr3-metric-value">{metrics.activeAgents}</p>
                  </div>
                </div>
                <div className="wr3-metric-card">
                  <div className="wr3-metric-icon">💬</div>
                  <div className="wr3-metric-info">
                    <h4>{t('messagesExchanged')}</h4>
                    <p className="wr3-metric-value">{metrics.messagesExchanged}</p>
                  </div>
                </div>
                <div className="wr3-metric-card">
                  <div className="wr3-metric-icon">⚡</div>
                  <div className="wr3-metric-info">
                    <h4>{t('responseTime')}</h4>
                    <p className="wr3-metric-value">{metrics.avgResponseTime}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="wr3-messages-container">
            {messages.length === 0 ? (
              <div className="wr3-empty-state">
                <div className="wr3-empty-icon">💬</div>
                <h3>{t('startConversation')}</h3>
                <p>{t('askQuestion')}</p>
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
                placeholder={t('typeMessage')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <button 
                className="wr3-send-btn"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                title={t('send')}
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WarRoom3Complete