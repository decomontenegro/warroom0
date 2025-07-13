import { useState, useEffect } from 'react'
import './EvolutionAnalysis.css'

function EvolutionAnalysis({ messages, onSuggestNext }) {
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const analyzeConversation = () => {
    setIsAnalyzing(true)
    
    // Simular análise (em produção, isso seria feito pelo backend)
    setTimeout(() => {
      const topics = extractTopics(messages)
      const gaps = identifyGaps(messages)
      const nextSteps = suggestNextSteps(topics, gaps)
      
      setAnalysis({
        topics,
        gaps,
        nextSteps,
        insights: generateInsights(messages)
      })
      setIsAnalyzing(false)
    }, 1500)
  }
  
  const extractTopics = (msgs) => {
    const topicMap = new Map()
    
    msgs.forEach(msg => {
      if (msg.type === 'agent' && msg.content) {
        // Extrair tópicos mencionados
        const keywords = ['frontend', 'backend', 'database', 'api', 'segurança', 'performance', 'arquitetura', 'deploy']
        keywords.forEach(keyword => {
          if (msg.content.toLowerCase().includes(keyword)) {
            topicMap.set(keyword, (topicMap.get(keyword) || 0) + 1)
          }
        })
      }
    })
    
    return Array.from(topicMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count, depth: calculateDepth(topic, msgs) }))
  }
  
  const calculateDepth = (topic, msgs) => {
    const mentions = msgs.filter(m => 
      m.type === 'agent' && m.content?.toLowerCase().includes(topic)
    ).length
    
    if (mentions > 5) return 'profundo'
    if (mentions > 2) return 'médio'
    return 'superficial'
  }
  
  const identifyGaps = (msgs) => {
    const coveredTopics = new Set()
    const potentialGaps = []
    
    msgs.forEach(msg => {
      if (msg.type === 'agent' && msg.content) {
        // Identificar áreas não cobertas
        const commonAreas = {
          'testes': ['teste', 'test', 'qa', 'qualidade'],
          'documentação': ['doc', 'documentação', 'readme'],
          'monitoramento': ['monitor', 'observability', 'logs', 'métricas'],
          'escalabilidade': ['escala', 'scale', 'crescimento'],
          'custos': ['custo', 'cost', 'orçamento', 'budget']
        }
        
        Object.entries(commonAreas).forEach(([area, keywords]) => {
          if (keywords.some(kw => msg.content.toLowerCase().includes(kw))) {
            coveredTopics.add(area)
          }
        })
      }
    })
    
    // Identificar gaps
    Object.keys({
      'testes': 'Estratégia de testes não foi discutida em detalhes',
      'documentação': 'Documentação técnica não foi mencionada',
      'monitoramento': 'Sistema de monitoramento não foi abordado',
      'escalabilidade': 'Plano de escalabilidade não foi definido',
      'custos': 'Análise de custos não foi realizada'
    }).forEach(area => {
      if (!coveredTopics.has(area)) {
        potentialGaps.push(area)
      }
    })
    
    return potentialGaps
  }
  
  const suggestNextSteps = (topics, gaps) => {
    const suggestions = []
    
    // Sugestões baseadas em tópicos
    topics.forEach(({ topic, depth }) => {
      if (depth === 'superficial') {
        suggestions.push({
          type: 'deepen',
          topic,
          question: `Podemos explorar mais detalhes sobre ${topic}?`,
          agents: selectAgentsForTopic(topic)
        })
      }
    })
    
    // Sugestões baseadas em gaps
    gaps.forEach(gap => {
      suggestions.push({
        type: 'gap',
        topic: gap,
        question: `Vamos discutir a estratégia de ${gap} para o projeto?`,
        agents: selectAgentsForTopic(gap)
      })
    })
    
    // Sugestões de evolução
    if (topics.length > 3) {
      suggestions.push({
        type: 'integration',
        topic: 'integração',
        question: 'Como podemos integrar todas essas áreas de forma eficiente?',
        agents: ['Lead Architect', 'System Integration Specialist', 'DevOps Lead']
      })
    }
    
    return suggestions.slice(0, 3) // Top 3 sugestões
  }
  
  const selectAgentsForTopic = (topic) => {
    const topicAgents = {
      'frontend': ['Frontend Architect', 'UI/UX Designer', 'React Specialist'],
      'backend': ['Backend Architect', 'API Specialist', 'Database Architect'],
      'testes': ['QA Engineer', 'Test Automation Specialist', 'Performance Engineer'],
      'segurança': ['Security Specialist', 'Authentication Expert', 'Compliance Officer'],
      'performance': ['Performance Engineer', 'Database Optimizer', 'Cache Specialist'],
      'documentação': ['Technical Writer', 'API Documentation Specialist', 'DevRel Engineer'],
      'monitoramento': ['DevOps Lead', 'SRE Engineer', 'Observability Specialist'],
      'escalabilidade': ['Cloud Architect', 'Infrastructure Specialist', 'Performance Engineer'],
      'custos': ['FinOps Specialist', 'Cloud Cost Optimizer', 'Business Analyst']
    }
    
    return topicAgents[topic] || ['Lead Architect', 'Project Manager', 'Tech Lead']
  }
  
  const generateInsights = (msgs) => {
    const agentCount = new Set(msgs.filter(m => m.type === 'agent').map(m => m.agent)).size
    const totalMessages = msgs.filter(m => m.type === 'agent').length
    const avgLength = msgs.filter(m => m.type === 'agent')
      .reduce((acc, m) => acc + (m.content?.length || 0), 0) / totalMessages || 0
    
    return {
      agentCount,
      totalMessages,
      avgResponseLength: Math.round(avgLength),
      consensus: identifyConsensus(msgs),
      divergence: identifyDivergence(msgs)
    }
  }
  
  const identifyConsensus = (msgs) => {
    // Identificar pontos em comum
    const commonPoints = []
    const phrases = [
      'concordo', 'também acho', 'exatamente', 'fundamental', 'essencial', 'importante'
    ]
    
    msgs.filter(m => m.type === 'agent').forEach(msg => {
      phrases.forEach(phrase => {
        if (msg.content?.toLowerCase().includes(phrase)) {
          commonPoints.push(phrase)
        }
      })
    })
    
    return commonPoints.length > msgs.length * 0.3 ? 'alto' : 'médio'
  }
  
  const identifyDivergence = (msgs) => {
    // Identificar pontos divergentes
    const divergentPoints = []
    const phrases = [
      'porém', 'mas', 'no entanto', 'alternativamente', 'outra opção', 'discordo'
    ]
    
    msgs.filter(m => m.type === 'agent').forEach(msg => {
      phrases.forEach(phrase => {
        if (msg.content?.toLowerCase().includes(phrase)) {
          divergentPoints.push(phrase)
        }
      })
    })
    
    return divergentPoints.length > msgs.length * 0.2 ? 'alta' : 'baixa'
  }
  
  return (
    <div className="evolution-analysis">
      <div className="analysis-header">
        <h3>🔄 Evolução do Assunto</h3>
        <button 
          className="analyze-button"
          onClick={analyzeConversation}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? '⏳ Analisando...' : '🔍 Analisar Conversa'}
        </button>
      </div>
      
      {analysis && (
        <div className="analysis-content">
          {/* Insights */}
          <div className="insights-section">
            <h4>📊 Insights</h4>
            <div className="insights-grid">
              <div className="insight-item">
                <span className="insight-label">Especialistas</span>
                <span className="insight-value">{analysis.insights.agentCount}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Respostas</span>
                <span className="insight-value">{analysis.insights.totalMessages}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Consenso</span>
                <span className="insight-value">{analysis.insights.consensus}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Divergência</span>
                <span className="insight-value">{analysis.insights.divergence}</span>
              </div>
            </div>
          </div>
          
          {/* Tópicos Cobertos */}
          <div className="topics-section">
            <h4>🎯 Tópicos Discutidos</h4>
            <div className="topics-list">
              {analysis.topics.map(({ topic, count, depth }) => (
                <div key={topic} className={`topic-item depth-${depth}`}>
                  <span className="topic-name">{topic}</span>
                  <span className="topic-stats">
                    {count} menções • {depth}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Gaps Identificados */}
          {analysis.gaps.length > 0 && (
            <div className="gaps-section">
              <h4>⚠️ Áreas Não Exploradas</h4>
              <div className="gaps-list">
                {analysis.gaps.map(gap => (
                  <div key={gap} className="gap-item">
                    <span className="gap-icon">📌</span>
                    <span className="gap-name">{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Próximos Passos */}
          <div className="next-steps-section">
            <h4>💡 Sugestões para Evoluir</h4>
            <div className="suggestions-list">
              {analysis.nextSteps.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  <div className="suggestion-header">
                    <span className={`suggestion-type type-${suggestion.type}`}>
                      {suggestion.type === 'deepen' ? '🔍 Aprofundar' :
                       suggestion.type === 'gap' ? '🆕 Explorar' :
                       '🔗 Integrar'}
                    </span>
                    <span className="suggestion-topic">{suggestion.topic}</span>
                  </div>
                  <p className="suggestion-question">{suggestion.question}</p>
                  <div className="suggestion-agents">
                    <span className="agents-label">Especialistas sugeridos:</span>
                    <span className="agents-list">{suggestion.agents.join(', ')}</span>
                  </div>
                  <button 
                    className="apply-suggestion"
                    onClick={() => onSuggestNext(suggestion)}
                  >
                    Aplicar Sugestão →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EvolutionAnalysis