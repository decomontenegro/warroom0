import React, { useState, useEffect } from 'react'
import { Icon } from './LucideIcons'
import './ConversationHistory.css'

/**
 * Conversation History Component
 * Histórico de conversas com feedback visual e análise
 */
function ConversationHistory({ 
  conversations = [], 
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation 
}) {
  const [filter, setFilter] = useState('all') // all, today, week, month
  const [searchTerm, setSearchTerm] = useState('')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)

  // Filtrar conversas
  const filteredConversations = conversations.filter(conv => {
    // Filtro por data
    const convDate = new Date(conv.timestamp)
    const now = new Date()
    const daysDiff = Math.floor((now - convDate) / (1000 * 60 * 60 * 24))
    
    let passesDateFilter = true
    if (filter === 'today') passesDateFilter = daysDiff === 0
    else if (filter === 'week') passesDateFilter = daysDiff <= 7
    else if (filter === 'month') passesDateFilter = daysDiff <= 30
    
    // Filtro por busca
    const passesSearch = !searchTerm || 
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.messages.some(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return passesDateFilter && passesSearch
  })

  // Agrupar conversas por data
  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const date = new Date(conv.timestamp)
    const dateKey = formatDateKey(date)
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(conv)
    
    return groups
  }, {})

  // Estatísticas das conversas
  const conversationStats = {
    total: conversations.length,
    today: conversations.filter(c => isToday(new Date(c.timestamp))).length,
    avgMessages: Math.round(conversations.reduce((sum, c) => sum + c.messages.length, 0) / conversations.length) || 0,
    mostUsedPrompts: getMostUsedPrompts(conversations),
    avgResponseTime: calculateAvgResponseTime(conversations)
  }

  function formatDateKey(date) {
    const now = new Date()
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 0) return 'Hoje'
    if (daysDiff === 1) return 'Ontem'
    if (daysDiff <= 7) return 'Esta semana'
    if (daysDiff <= 30) return 'Este mês'
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  function isToday(date) {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  function getMostUsedPrompts(convs) {
    const prompts = {}
    convs.forEach(conv => {
      const firstUserMessage = conv.messages.find(m => m.sender === 'user')
      if (firstUserMessage) {
        const simplified = simplifyPrompt(firstUserMessage.text)
        prompts[simplified] = (prompts[simplified] || 0) + 1
      }
    })
    
    return Object.entries(prompts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([prompt, count]) => ({ prompt, count }))
  }

  function simplifyPrompt(prompt) {
    // Simplificar prompt para categorização
    const lower = prompt.toLowerCase()
    if (lower.includes('delivery')) return 'App Delivery'
    if (lower.includes('escola') || lower.includes('educacional')) return 'Sistema Educacional'
    if (lower.includes('streaming') || lower.includes('vídeo')) return 'Plataforma Streaming'
    if (lower.includes('nft') || lower.includes('crypto')) return 'NFT/Crypto'
    if (lower.includes('jogo') || lower.includes('game')) return 'Desenvolvimento de Jogos'
    if (lower.includes('e-commerce') || lower.includes('loja')) return 'E-commerce'
    if (lower.includes('fintech') || lower.includes('banco')) return 'Fintech'
    return 'Outros'
  }

  function calculateAvgResponseTime(convs) {
    let totalTime = 0
    let count = 0
    
    convs.forEach(conv => {
      for (let i = 0; i < conv.messages.length - 1; i++) {
        if (conv.messages[i].sender === 'user' && conv.messages[i + 1].sender === 'ai') {
          const userTime = new Date(conv.messages[i].timestamp)
          const aiTime = new Date(conv.messages[i + 1].timestamp)
          totalTime += (aiTime - userTime)
          count++
        }
      }
    })
    
    if (count === 0) return 0
    const avgMs = totalTime / count
    return Math.round(avgMs / 1000) // segundos
  }

  function getConversationSummary(conv) {
    const messageCount = conv.messages.length
    const agentCount = new Set(conv.messages.filter(m => m.specialist).map(m => m.specialist.name)).size
    const hasSynthesis = conv.messages.some(m => m.isSynthesis)
    
    return {
      messageCount,
      agentCount,
      hasSynthesis,
      duration: calculateDuration(conv),
      quality: assessQuality(conv)
    }
  }

  function calculateDuration(conv) {
    if (conv.messages.length < 2) return 0
    const start = new Date(conv.messages[0].timestamp)
    const end = new Date(conv.messages[conv.messages.length - 1].timestamp)
    return Math.round((end - start) / 1000 / 60) // minutos
  }

  function assessQuality(conv) {
    // Avaliar qualidade baseada em fatores
    let score = 0
    
    // Tem síntese final
    if (conv.messages.some(m => m.isSynthesis)) score += 30
    
    // Múltiplos agentes participaram
    const agentCount = new Set(conv.messages.filter(m => m.specialist).map(m => m.specialist.name)).size
    score += Math.min(agentCount * 5, 30)
    
    // Conversa teve refinamento
    if (conv.hasRefinement) score += 20
    
    // Duração adequada (não muito curta nem muito longa)
    const duration = calculateDuration(conv)
    if (duration >= 5 && duration <= 30) score += 20
    
    if (score >= 80) return 'excellent'
    if (score >= 60) return 'good'
    if (score >= 40) return 'average'
    return 'basic'
  }

  const handleExportConversation = (conv) => {
    const content = generateMarkdownExport(conv)
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `warroom-conversation-${conv.id}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function generateMarkdownExport(conv) {
    let markdown = `# War Room Conversation\n\n`
    markdown += `**ID:** ${conv.id}\n`
    markdown += `**Data:** ${new Date(conv.timestamp).toLocaleString('pt-BR')}\n`
    markdown += `**Título:** ${conv.title}\n\n`
    markdown += `---\n\n`
    
    conv.messages.forEach(msg => {
      if (msg.sender === 'user') {
        markdown += `## 👤 Usuário\n\n${msg.text}\n\n`
      } else if (msg.specialist) {
        markdown += `## 🤖 ${msg.specialist.name}\n`
        markdown += `*${msg.specialist.role}*\n\n`
        markdown += `${msg.text}\n\n`
      }
    })
    
    return markdown
  }

  return (
    <div className="conversation-history">
      {/* Header com filtros */}
      <div className="ch-header">
        <h3>
          <Icon name="History" size={20} />
          Histórico de Conversas
        </h3>
        
        <div className="ch-actions">
          <button 
            className="ch-new-btn"
            onClick={onNewConversation}
          >
            <Icon name="Plus" size={16} />
            Nova Conversa
          </button>
          
          <button 
            className={`ch-analytics-btn ${showAnalytics ? 'active' : ''}`}
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <Icon name="BarChart3" size={16} />
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="ch-analytics">
          <div className="ch-stat">
            <Icon name="MessageSquare" size={20} />
            <div>
              <span className="ch-stat-value">{conversationStats.total}</span>
              <span className="ch-stat-label">Total</span>
            </div>
          </div>
          
          <div className="ch-stat">
            <Icon name="Calendar" size={20} />
            <div>
              <span className="ch-stat-value">{conversationStats.today}</span>
              <span className="ch-stat-label">Hoje</span>
            </div>
          </div>
          
          <div className="ch-stat">
            <Icon name="MessageCircle" size={20} />
            <div>
              <span className="ch-stat-value">{conversationStats.avgMessages}</span>
              <span className="ch-stat-label">Média msgs</span>
            </div>
          </div>
          
          <div className="ch-stat">
            <Icon name="Clock" size={20} />
            <div>
              <span className="ch-stat-value">{conversationStats.avgResponseTime}s</span>
              <span className="ch-stat-label">Tempo resp</span>
            </div>
          </div>
        </div>
      )}

      {/* Most Used Prompts */}
      {showAnalytics && conversationStats.mostUsedPrompts.length > 0 && (
        <div className="ch-most-used">
          <h4>Prompts Mais Usados</h4>
          <div className="ch-prompt-list">
            {conversationStats.mostUsedPrompts.map((item, idx) => (
              <div key={idx} className="ch-prompt-item">
                <span className="ch-prompt-text">{item.prompt}</span>
                <span className="ch-prompt-count">{item.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="ch-filters">
        <div className="ch-search">
          <Icon name="Search" size={16} />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="ch-filter-buttons">
          <button 
            className={`ch-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button 
            className={`ch-filter-btn ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            Hoje
          </button>
          <button 
            className={`ch-filter-btn ${filter === 'week' ? 'active' : ''}`}
            onClick={() => setFilter('week')}
          >
            Semana
          </button>
          <button 
            className={`ch-filter-btn ${filter === 'month' ? 'active' : ''}`}
            onClick={() => setFilter('month')}
          >
            Mês
          </button>
        </div>
      </div>

      {/* Lista de conversas agrupadas */}
      <div className="ch-conversation-list">
        {Object.entries(groupedConversations).map(([dateKey, convs]) => (
          <div key={dateKey} className="ch-date-group">
            <h4 className="ch-date-header">{dateKey}</h4>
            
            {convs.map(conv => {
              const summary = getConversationSummary(conv)
              const isActive = conv.id === currentConversationId
              
              return (
                <div
                  key={conv.id}
                  className={`ch-conversation-item ${isActive ? 'active' : ''} quality-${summary.quality}`}
                  onClick={() => onSelectConversation(conv)}
                >
                  <div className="ch-conv-header">
                    <h5>{conv.title}</h5>
                    <span className="ch-conv-time">
                      {new Date(conv.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="ch-conv-preview">
                    {conv.messages[0]?.text.substring(0, 100)}...
                  </div>
                  
                  <div className="ch-conv-meta">
                    <span className="ch-meta-item">
                      <Icon name="MessageSquare" size={14} />
                      {summary.messageCount}
                    </span>
                    <span className="ch-meta-item">
                      <Icon name="Users" size={14} />
                      {summary.agentCount}
                    </span>
                    {summary.hasSynthesis && (
                      <span className="ch-meta-item synthesis">
                        <Icon name="Brain" size={14} />
                        Síntese
                      </span>
                    )}
                    {conv.hasRefinement && (
                      <span className="ch-meta-item refinement">
                        <Icon name="Sparkles" size={14} />
                        Refinado
                      </span>
                    )}
                    <span className={`ch-quality-badge ${summary.quality}`}>
                      {summary.quality === 'excellent' && '⭐'}
                      {summary.quality === 'good' && '👍'}
                      {summary.quality === 'average' && '📊'}
                      {summary.quality === 'basic' && '📝'}
                    </span>
                  </div>
                  
                  <div className="ch-conv-actions">
                    <button
                      className="ch-action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExportConversation(conv)
                      }}
                      title="Exportar conversa"
                    >
                      <Icon name="Download" size={14} />
                    </button>
                    <button
                      className="ch-action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm('Excluir esta conversa?')) {
                          onDeleteConversation(conv.id)
                        }
                      }}
                      title="Excluir conversa"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        
        {filteredConversations.length === 0 && (
          <div className="ch-empty-state">
            <Icon name="Inbox" size={48} />
            <p>Nenhuma conversa encontrada</p>
            {searchTerm && (
              <button 
                className="ch-clear-search"
                onClick={() => setSearchTerm('')}
              >
                Limpar busca
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationHistory