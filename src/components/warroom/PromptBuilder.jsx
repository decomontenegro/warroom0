import { useState } from 'react'
import './PromptBuilder.css'

const TOPICS = [
  { id: 'frontend', name: 'Frontend', emoji: '🎨', keywords: ['react', 'vue', 'angular', 'css', 'ui'] },
  { id: 'backend', name: 'Backend', emoji: '⚙️', keywords: ['node', 'api', 'server', 'database'] },
  { id: 'security', name: 'Segurança', emoji: '🔒', keywords: ['auth', 'jwt', 'oauth', 'encryption'] },
  { id: 'performance', name: 'Performance', emoji: '⚡', keywords: ['speed', 'optimization', 'cache'] },
  { id: 'database', name: 'Banco de Dados', emoji: '🗄️', keywords: ['sql', 'nosql', 'query', 'schema'] },
  { id: 'devops', name: 'DevOps', emoji: '🚀', keywords: ['ci/cd', 'docker', 'kubernetes', 'deploy'] },
  { id: 'testing', name: 'Testes', emoji: '🧪', keywords: ['unit', 'integration', 'e2e', 'tdd'] },
  { id: 'mobile', name: 'Mobile', emoji: '📱', keywords: ['ios', 'android', 'react native', 'flutter'] },
  { id: 'ai', name: 'AI/ML', emoji: '🤖', keywords: ['machine learning', 'neural', 'nlp', 'model'] },
  { id: 'cloud', name: 'Cloud', emoji: '☁️', keywords: ['aws', 'azure', 'gcp', 'serverless'] }
]

const TEMPLATES = [
  {
    id: 'debug',
    name: 'Debugar Problema',
    template: 'Estou com um problema de [TIPO] em [TECNOLOGIA]. [DESCRIÇÃO]. Como posso resolver?',
    topics: ['frontend', 'backend', 'performance']
  },
  {
    id: 'implement',
    name: 'Implementar Feature',
    template: 'Como implementar [FEATURE] usando [TECNOLOGIA] considerando [REQUISITOS]?',
    topics: ['frontend', 'backend', 'database']
  },
  {
    id: 'optimize',
    name: 'Otimizar Performance',
    template: 'Como otimizar [COMPONENTE] que está [PROBLEMA] em [AMBIENTE]?',
    topics: ['performance', 'database', 'cloud']
  },
  {
    id: 'secure',
    name: 'Melhorar Segurança',
    template: 'Quais as melhores práticas de segurança para [SISTEMA] considerando [CONTEXTO]?',
    topics: ['security', 'backend', 'cloud']
  }
]

function PromptBuilder({ onBuildComplete, allAgents }) {
  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [suggestedAgents, setSuggestedAgents] = useState([])
  const [selectedAgents, setSelectedAgents] = useState([])
  
  const toggleTopic = (topicId) => {
    const newTopics = selectedTopics.includes(topicId)
      ? selectedTopics.filter(id => id !== topicId)
      : [...selectedTopics, topicId]
    
    setSelectedTopics(newTopics)
    updateSuggestedAgents(newTopics, customPrompt)
  }
  
  const selectTemplate = (template) => {
    setSelectedTemplate(template)
    setCustomPrompt(template.template)
    updateSuggestedAgents(template.topics, template.template)
  }
  
  const updateSuggestedAgents = (topics, prompt) => {
    if (!allAgents) return
    
    const keywords = [
      ...topics.flatMap(topicId => {
        const topic = TOPICS.find(t => t.id === topicId)
        return topic ? topic.keywords : []
      }),
      ...prompt.toLowerCase().split(' ')
    ]
    
    const scoreMap = new Map()
    
    allAgents.forEach(agent => {
      let score = 0
      
      agent.capabilities.forEach(cap => {
        keywords.forEach(keyword => {
          if (cap.toLowerCase().includes(keyword)) score += 2
        })
      })
      
      keywords.forEach(keyword => {
        if (agent.role.toLowerCase().includes(keyword)) score += 1
        if (agent.name.toLowerCase().includes(keyword)) score += 3
      })
      
      if (score > 0) {
        scoreMap.set(agent, score)
      }
    })
    
    const suggested = Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([agent]) => agent)
    
    setSuggestedAgents(suggested)
  }
  
  const toggleAgent = (agentId) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }
  
  const buildPrompt = () => {
    const finalAgents = selectedAgents.length > 0
      ? allAgents.filter(a => selectedAgents.includes(a.id))
      : suggestedAgents
    
    onBuildComplete({
      prompt: customPrompt,
      topics: selectedTopics,
      agents: finalAgents
    })
  }
  
  return (
    <div className="prompt-builder">
      <h2>🔧 Prompt Builder</h2>
      
      {/* Tópicos */}
      <div className="section">
        <h3>1. Selecione os tópicos relacionados:</h3>
        <div className="topics-grid">
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              className={`topic-button ${selectedTopics.includes(topic.id) ? 'selected' : ''}`}
              onClick={() => toggleTopic(topic.id)}
            >
              <span className="topic-emoji">{topic.emoji}</span>
              <span className="topic-name">{topic.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Templates */}
      <div className="section">
        <h3>2. Escolha um template ou escreva seu prompt:</h3>
        <div className="templates-list">
          {TEMPLATES.map(template => (
            <button
              key={template.id}
              className={`template-button ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
              onClick={() => selectTemplate(template)}
            >
              <span className="template-name">{template.name}</span>
              <span className="template-preview">{template.template.substring(0, 50)}...</span>
            </button>
          ))}
        </div>
        
        <textarea
          className="custom-prompt"
          value={customPrompt}
          onChange={(e) => {
            setCustomPrompt(e.target.value)
            updateSuggestedAgents(selectedTopics, e.target.value)
          }}
          placeholder="Digite seu prompt aqui..."
          rows={4}
        />
      </div>
      
      {/* Agentes Sugeridos */}
      {suggestedAgents.length > 0 && (
        <div className="section">
          <h3>3. Especialistas sugeridos (clique para selecionar):</h3>
          <div className="agents-grid">
            {suggestedAgents.map(agent => (
              <button
                key={agent.id}
                className={`agent-button ${selectedAgents.includes(agent.id) ? 'selected' : ''}`}
                onClick={() => toggleAgent(agent.id)}
              >
                <div className="agent-name">{agent.name}</div>
                <div className="agent-role">{agent.role}</div>
              </button>
            ))}
          </div>
          <p className="hint">
            {selectedAgents.length > 0 
              ? `${selectedAgents.length} especialistas selecionados`
              : 'Usando sugestão automática'}
          </p>
        </div>
      )}
      
      {/* Botão de Ação */}
      <div className="action-section">
        <button
          className="build-button"
          onClick={buildPrompt}
          disabled={!customPrompt.trim()}
        >
          Enviar para {selectedAgents.length || suggestedAgents.length} Especialistas →
        </button>
      </div>
    </div>
  )
}

export default PromptBuilder