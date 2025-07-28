import React, { useState, useEffect } from 'react'
import { Icon } from './LucideIcons'
import './PromptRefinementSpecialists.css'

/**
 * Especialistas de Refinamento de Prompt
 * Agentes especializados em melhorar e clarificar prompts
 */

const REFINEMENT_SPECIALISTS = [
  {
    id: 'prompt-engineer',
    name: 'Prompt Engineer',
    role: 'Especialista em Engenharia de Prompts',
    icon: 'Brain',
    color: '#9333EA',
    skills: [
      'Estruturação de prompts',
      'Otimização de contexto',
      'Clareza e precisão',
      'Técnicas avançadas de prompting'
    ],
    focus: 'technical_precision'
  },
  {
    id: 'context-clarifier',
    name: 'Context Clarification Expert',
    role: 'Especialista em Clarificação de Contexto',
    icon: 'Search',
    color: '#3B82F6',
    skills: [
      'Identificação de ambiguidades',
      'Extração de requisitos implícitos',
      'Validação de premissas',
      'Detalhamento de contexto'
    ],
    focus: 'context_clarity'
  },
  {
    id: 'requirement-analyst',
    name: 'Requirements Analyst',
    role: 'Analista de Requisitos',
    icon: 'ClipboardList',
    color: '#10B981',
    skills: [
      'Análise de requisitos funcionais',
      'Identificação de requisitos não-funcionais',
      'Priorização de features',
      'Validação de escopo'
    ],
    focus: 'requirements_extraction'
  },
  {
    id: 'domain-expert-matcher',
    name: 'Domain Expert Matcher',
    role: 'Identificador de Domínio Especializado',
    icon: 'Target',
    color: '#F59E0B',
    skills: [
      'Identificação de domínio',
      'Matching com especialistas',
      'Conhecimento cross-domain',
      'Padrões de indústria'
    ],
    focus: 'domain_identification'
  },
  {
    id: 'creative-enhancer',
    name: 'Creative Enhancement Specialist',
    role: 'Especialista em Aprimoramento Criativo',
    icon: 'Sparkles',
    color: '#EC4899',
    skills: [
      'Expansão de ideias',
      'Sugestões inovadoras',
      'Pensamento lateral',
      'Oportunidades criativas'
    ],
    focus: 'creative_enhancement'
  }
]

function PromptRefinementSpecialists({ 
  originalPrompt, 
  currentContext,
  onRefinementComplete,
  agentResponses 
}) {
  const [activeSpecialist, setActiveSpecialist] = useState(null)
  const [refinementStage, setRefinementStage] = useState('selection') // selection, analysis, refinement, result
  const [specialistAnalysis, setSpecialistAnalysis] = useState({})
  const [refinedPrompt, setRefinedPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [refinementHistory, setRefinementHistory] = useState([])

  // Analisar qual especialista é mais adequado
  useEffect(() => {
    if (originalPrompt && !activeSpecialist) {
      suggestBestSpecialist()
    }
  }, [originalPrompt])

  const suggestBestSpecialist = () => {
    const promptLower = originalPrompt.toLowerCase()
    let suggestedSpecialist = null

    // Lógica de sugestão baseada no conteúdo
    if (promptLower.includes('requisito') || promptLower.includes('funcionalidade')) {
      suggestedSpecialist = 'requirement-analyst'
    } else if (promptLower.includes('não entendi') || promptLower.includes('confuso')) {
      suggestedSpecialist = 'context-clarifier'
    } else if (promptLower.includes('inovador') || promptLower.includes('criativo')) {
      suggestedSpecialist = 'creative-enhancer'
    } else if (promptLower.includes('melhorar') || promptLower.includes('otimizar')) {
      suggestedSpecialist = 'prompt-engineer'
    } else {
      suggestedSpecialist = 'domain-expert-matcher'
    }

    // Marcar como sugerido
    const specialist = REFINEMENT_SPECIALISTS.find(s => s.id === suggestedSpecialist)
    if (specialist) {
      setSpecialistAnalysis(prev => ({
        ...prev,
        suggested: specialist.id
      }))
    }
  }

  const selectSpecialist = (specialist) => {
    setActiveSpecialist(specialist)
    setRefinementStage('analysis')
    performSpecialistAnalysis(specialist)
  }

  const performSpecialistAnalysis = async (specialist) => {
    setIsProcessing(true)
    
    // Simular análise do especialista
    setTimeout(() => {
      const analysis = generateSpecialistAnalysis(specialist)
      setSpecialistAnalysis(prev => ({
        ...prev,
        [specialist.id]: analysis
      }))
      setRefinementStage('refinement')
      setIsProcessing(false)
    }, 2000)
  }

  const generateSpecialistAnalysis = (specialist) => {
    const analyses = {
      'prompt-engineer': {
        issues: [
          'Prompt muito genérico - precisa de mais especificidade',
          'Falta definição clara do objetivo final',
          'Contexto técnico não especificado'
        ],
        suggestions: [
          'Adicionar métricas de sucesso específicas',
          'Definir tecnologias preferenciais',
          'Especificar restrições e limitações'
        ],
        refinementStrategy: 'structured_enhancement'
      },
      'context-clarifier': {
        issues: [
          'Ambiguidade sobre o público-alvo',
          'Escopo do projeto não está claro',
          'Faltam detalhes sobre o contexto de uso'
        ],
        suggestions: [
          'Definir perfil detalhado do usuário',
          'Esclarecer cenários de uso principais',
          'Adicionar informações sobre o ambiente'
        ],
        refinementStrategy: 'contextual_expansion'
      },
      'requirement-analyst': {
        issues: [
          'Requisitos funcionais não especificados',
          'Requisitos não-funcionais ausentes',
          'Prioridades não definidas'
        ],
        suggestions: [
          'Listar funcionalidades essenciais',
          'Definir requisitos de performance',
          'Estabelecer critérios de aceitação'
        ],
        refinementStrategy: 'requirement_extraction'
      },
      'domain-expert-matcher': {
        issues: [
          'Domínio do projeto não está claro',
          'Falta conhecimento específico da indústria',
          'Padrões do setor não mencionados'
        ],
        suggestions: [
          'Identificar setor/indústria específica',
          'Referenciar soluções similares',
          'Incluir regulamentações relevantes'
        ],
        refinementStrategy: 'domain_alignment'
      },
      'creative-enhancer': {
        issues: [
          'Falta elementos diferenciadores',
          'Oportunidades criativas não exploradas',
          'Visão muito conservadora'
        ],
        suggestions: [
          'Adicionar elementos inovadores',
          'Explorar tendências emergentes',
          'Incluir features únicas'
        ],
        refinementStrategy: 'creative_expansion'
      }
    }

    return analyses[specialist.id] || {}
  }

  const applyRefinement = () => {
    setIsProcessing(true)
    
    // Gerar prompt refinado baseado na análise
    setTimeout(() => {
      const refined = generateRefinedPrompt()
      setRefinedPrompt(refined)
      setRefinementStage('result')
      setIsProcessing(false)
      
      // Adicionar ao histórico
      setRefinementHistory(prev => [...prev, {
        specialist: activeSpecialist,
        originalPrompt,
        refinedPrompt: refined,
        timestamp: new Date()
      }])
    }, 1500)
  }

  const generateRefinedPrompt = () => {
    const analysis = specialistAnalysis[activeSpecialist.id]
    if (!analysis) return originalPrompt

    let refined = originalPrompt + '\n\n'
    
    // Adicionar melhorias baseadas no especialista
    switch (activeSpecialist.id) {
      case 'prompt-engineer':
        refined += '**OBJETIVO ESPECÍFICO:**\n'
        refined += '- [Definir resultado esperado claramente]\n'
        refined += '- [Métricas de sucesso mensuráveis]\n\n'
        refined += '**CONTEXTO TÉCNICO:**\n'
        refined += '- Stack preferencial: [especificar]\n'
        refined += '- Restrições técnicas: [listar]\n'
        break
        
      case 'context-clarifier':
        refined += '**CONTEXTO DETALHADO:**\n'
        refined += '- Público-alvo: [descrever perfil]\n'
        refined += '- Cenário de uso: [detalhar]\n'
        refined += '- Ambiente: [especificar]\n'
        break
        
      case 'requirement-analyst':
        refined += '**REQUISITOS FUNCIONAIS:**\n'
        refined += '1. [Feature principal]\n'
        refined += '2. [Feature secundária]\n\n'
        refined += '**REQUISITOS NÃO-FUNCIONAIS:**\n'
        refined += '- Performance: [definir]\n'
        refined += '- Segurança: [especificar]\n'
        break
        
      case 'domain-expert-matcher':
        refined += '**DOMÍNIO E INDÚSTRIA:**\n'
        refined += '- Setor: [especificar]\n'
        refined += '- Referências: [exemplos similares]\n'
        refined += '- Regulamentações: [se aplicável]\n'
        break
        
      case 'creative-enhancer':
        refined += '**ELEMENTOS INOVADORES:**\n'
        refined += '- Diferencial único: [descrever]\n'
        refined += '- Tendências aplicadas: [listar]\n'
        refined += '- Features exclusivas: [detalhar]\n'
        break
    }
    
    // Adicionar sugestões personalizadas
    if (analysis.suggestions) {
      refined += '\n**PONTOS APRIMORADOS:**\n'
      analysis.suggestions.forEach(suggestion => {
        refined += `- ${suggestion}\n`
      })
    }
    
    return refined
  }

  const useRefinedPrompt = () => {
    if (onRefinementComplete) {
      onRefinementComplete(refinedPrompt, activeSpecialist)
    }
  }

  const resetRefinement = () => {
    setActiveSpecialist(null)
    setRefinementStage('selection')
    setSpecialistAnalysis({})
    setRefinedPrompt('')
  }

  return (
    <div className="prompt-refinement-specialists">
      {/* Seleção de Especialista */}
      {refinementStage === 'selection' && (
        <div className="specialist-selection">
          <h3>🎯 Escolha um Especialista de Refinamento</h3>
          <p className="selection-hint">
            Selecione o especialista mais adequado para melhorar seu prompt
          </p>
          
          <div className="specialists-grid">
            {REFINEMENT_SPECIALISTS.map(specialist => (
              <div
                key={specialist.id}
                className={`specialist-card ${specialistAnalysis.suggested === specialist.id ? 'suggested' : ''}`}
                onClick={() => selectSpecialist(specialist)}
                style={{ borderColor: specialist.color }}
              >
                <div className="specialist-header">
                  <div 
                    className="specialist-icon"
                    style={{ backgroundColor: specialist.color }}
                  >
                    <Icon name={specialist.icon} size={24} />
                  </div>
                  <div className="specialist-info">
                    <h4>{specialist.name}</h4>
                    <p>{specialist.role}</p>
                  </div>
                  {specialistAnalysis.suggested === specialist.id && (
                    <span className="suggested-badge">Recomendado</span>
                  )}
                </div>
                
                <div className="specialist-skills">
                  {specialist.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Análise do Especialista */}
      {refinementStage === 'analysis' && activeSpecialist && (
        <div className="specialist-analysis">
          <div className="analysis-header">
            <div 
              className="active-specialist"
              style={{ backgroundColor: activeSpecialist.color }}
            >
              <Icon name={activeSpecialist.icon} size={20} />
              <span>{activeSpecialist.name}</span>
            </div>
            <h3>Analisando seu prompt...</h3>
          </div>
          
          {isProcessing ? (
            <div className="analysis-loading">
              <Icon name="Loader2" size={32} className="spinner" />
              <p>O especialista está analisando seu prompt para identificar melhorias...</p>
            </div>
          ) : (
            <div className="analysis-complete">
              <Icon name="CheckCircle" size={32} color="#10B981" />
              <p>Análise concluída!</p>
            </div>
          )}
        </div>
      )}

      {/* Refinamento */}
      {refinementStage === 'refinement' && activeSpecialist && (
        <div className="specialist-refinement">
          <div className="refinement-header">
            <div 
              className="active-specialist"
              style={{ backgroundColor: activeSpecialist.color }}
            >
              <Icon name={activeSpecialist.icon} size={20} />
              <span>{activeSpecialist.name}</span>
            </div>
            <h3>Análise e Sugestões</h3>
          </div>
          
          <div className="analysis-results">
            {specialistAnalysis[activeSpecialist.id]?.issues && (
              <div className="issues-section">
                <h4>🔍 Pontos Identificados:</h4>
                <ul>
                  {specialistAnalysis[activeSpecialist.id].issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {specialistAnalysis[activeSpecialist.id]?.suggestions && (
              <div className="suggestions-section">
                <h4>💡 Sugestões de Melhoria:</h4>
                <ul>
                  {specialistAnalysis[activeSpecialist.id].suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="refinement-actions">
            <button 
              className="btn secondary"
              onClick={() => setRefinementStage('selection')}
            >
              <Icon name="ChevronLeft" size={16} />
              Escolher Outro Especialista
            </button>
            <button 
              className="btn primary"
              onClick={applyRefinement}
              disabled={isProcessing}
            >
              <Icon name="Wand2" size={16} />
              Aplicar Refinamento
            </button>
          </div>
        </div>
      )}

      {/* Resultado Final */}
      {refinementStage === 'result' && (
        <div className="refinement-result">
          <div className="result-header">
            <Icon name="CheckCircle2" size={32} color="#10B981" />
            <h3>Prompt Refinado com Sucesso!</h3>
          </div>
          
          <div className="prompt-comparison">
            <div className="prompt-section original">
              <h4>Prompt Original:</h4>
              <div className="prompt-content">{originalPrompt}</div>
            </div>
            
            <div className="prompt-section refined">
              <h4>Prompt Refinado por {activeSpecialist.name}:</h4>
              <div className="prompt-content">{refinedPrompt}</div>
            </div>
          </div>
          
          <div className="result-actions">
            <button 
              className="btn secondary"
              onClick={resetRefinement}
            >
              <Icon name="RefreshCw" size={16} />
              Refinar Novamente
            </button>
            <button 
              className="btn primary"
              onClick={useRefinedPrompt}
            >
              <Icon name="Send" size={16} />
              Usar Prompt Refinado
            </button>
          </div>
          
          {refinementHistory.length > 1 && (
            <div className="refinement-history">
              <h4>📝 Histórico de Refinamentos:</h4>
              <div className="history-list">
                {refinementHistory.map((item, idx) => (
                  <div key={idx} className="history-item">
                    <Icon name={item.specialist.icon} size={16} />
                    <span>{item.specialist.name}</span>
                    <span className="timestamp">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PromptRefinementSpecialists