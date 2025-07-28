import React, { useState, useEffect } from 'react'
import './EnhancedPromptDialog.css'
import { Icon } from './LucideIcons'
import dynamicQuestionGenerator from '../../services/dynamic-question-generator.js'
import agentInsightsAnalyzer from '../../services/agent-insights-analyzer.js'
import enhancedPromptConsolidator from '../../services/enhanced-prompt-consolidator.js'
import PromptRefinementSpecialists from './PromptRefinementSpecialists'

/**
 * Enhanced Prompt Dialog
 * Sistema inteligente de refinamento de prompts através de perguntas clarificadoras
 */
function EnhancedPromptDialog({ 
  isOpen, 
  onClose, 
  originalPrompt, 
  context,
  onRefinedPrompt,
  agentResponses 
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [questions, setQuestions] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [refinedPrompt, setRefinedPrompt] = useState('')
  const [showFinalPrompt, setShowFinalPrompt] = useState(false)
  const [showSpecialists, setShowSpecialists] = useState(false)
  const [refinementMode, setRefinementMode] = useState('questions') // 'questions' ou 'specialists'

  // Gerar perguntas baseadas nas respostas dos agentes
  useEffect(() => {
    if (isOpen && originalPrompt && agentResponses?.length > 0) {
      generateDynamicQuestions()
    }
  }, [isOpen, originalPrompt, agentResponses])

  const generateDynamicQuestions = async () => {
    setIsProcessing(true)
    try {
      // Usar o gerador dinâmico que analisa as respostas dos agentes
      const dynamicQuestions = await dynamicQuestionGenerator.generateDynamicQuestions(
        originalPrompt,
        agentResponses,
        answers
      )
      
      // Converter para o formato esperado pelo componente
      const formattedQuestions = dynamicQuestions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type === 'open_text' ? 'text' : q.type,
        options: q.options?.map(opt => 
          typeof opt === 'string' ? opt : opt.label
        ),
        priority: q.priority,
        context: q.context,
        placeholder: q.type === 'open_text' ? 'Digite sua resposta...' : undefined
      }))
      
      setQuestions(formattedQuestions)
    } catch (error) {
      console.error('Erro ao gerar perguntas dinâmicas:', error)
      // Fallback para perguntas básicas se houver erro
      generateBasicQuestions()
    } finally {
      setIsProcessing(false)
    }
  }

  const generateBasicQuestions = () => {
    // Perguntas básicas como fallback
    const analysis = agentInsightsAnalyzer.analyzeAgentResponses(agentResponses, originalPrompt)
    const summary = agentInsightsAnalyzer.generateExecutiveSummary(analysis)
    
    const basicQuestions = []
    
    // Adicionar perguntas sobre decisões urgentes
    if (summary.urgentDecisions.length > 0) {
      basicQuestions.push({
        id: 'urgent_decision',
        text: `Os especialistas identificaram ${summary.urgentDecisions.length} decisões críticas. Qual é sua prioridade?`,
        type: 'text',
        priority: 10,
        context: 'Múltiplos especialistas precisam desta direção',
        placeholder: 'Descreva sua prioridade principal'
      })
    }
    
    // Adicionar perguntas sobre divergências
    if (summary.majorDivergences.length > 0) {
      const divergence = summary.majorDivergences[0]
      basicQuestions.push({
        id: 'divergence_resolution',
        text: `Especialistas divergem sobre ${divergence.point}. Qual abordagem você prefere?`,
        type: 'text',
        priority: 9,
        context: `${divergence.supporters.length} especialistas têm visões diferentes`,
        placeholder: 'Explique sua preferência'
      })
    }
    
    setQuestions(basicQuestions.slice(0, 5))
  }

  const handleMultipleChoiceAnswer = (answer) => {
    handleAnswer(answer)
  }

  const handleRankingAnswer = (rankedOptions) => {
    handleAnswer(rankedOptions.join(' > '))
  }

  const handleMultiSelectAnswer = (selectedOptions) => {
    handleAnswer(selectedOptions.join(', '))
  }

  const handleYesNoExplainAnswer = (answer, explanation) => {
    handleAnswer(`${answer}: ${explanation}`)
  }

  const handleAnswer = (answer) => {
    const updatedAnswers = { ...answers, [questions[currentQuestion].id]: answer }
    setAnswers(updatedAnswers)

    // Avançar para próxima pergunta ou finalizar
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Todas as perguntas respondidas
      generateRefinedPrompt(updatedAnswers)
    }
  }

  const generateRefinedPrompt = async (allAnswers) => {
    setIsProcessing(true)
    
    try {
      // Usar o consolidador inteligente que preserva todos os insights
      const consolidatedPrompt = enhancedPromptConsolidator.consolidatePrompt(
        originalPrompt,
        agentResponses,
        allAnswers,
        questions
      )
      
      setRefinedPrompt(consolidatedPrompt)
      setShowFinalPrompt(true)
    } catch (error) {
      console.error('Erro ao consolidar prompt:', error)
      // Fallback para método simples se houver erro
      generateSimpleRefinedPrompt(allAnswers)
    } finally {
      setIsProcessing(false)
    }
  }

  const generateSimpleRefinedPrompt = (allAnswers) => {
    // Método de fallback simples
    const contextInfo = []
    
    questions.forEach(q => {
      const answer = allAnswers[q.id]
      if (answer) {
        contextInfo.push(`${q.text}: ${answer}`)
      }
    })

    const refined = `${originalPrompt}

**CONTEXTO REFINADO:**
${contextInfo.join('\n')}

**REQUISITOS CLARIFICADOS:**
${extractRequirements(allAnswers, questions)}

**NOTA:** Análise completa dos especialistas disponível mediante solicitação.`

    setRefinedPrompt(refined)
    setShowFinalPrompt(true)
  }

  const extractRequirements = (allAnswers, allQuestions) => {
    const requirements = []
    
    if (allAnswers.platform) requirements.push(`- Plataforma: ${allAnswers.platform}`)
    if (allAnswers.app_type) requirements.push(`- Tipo de aplicação: ${allAnswers.app_type}`)
    if (allAnswers.audience) requirements.push(`- Público-alvo: ${allAnswers.audience}`)
    if (allAnswers.users_scale) requirements.push(`- Escala: ${allAnswers.users_scale}`)
    if (allAnswers.main_goal) requirements.push(`- Objetivo: ${allAnswers.main_goal}`)
    if (allAnswers.main_challenge) requirements.push(`- Desafio principal: ${allAnswers.main_challenge}`)
    
    return requirements.join('\n') || 'A ser definido'
  }

  const extractTechnicalSpecsFromAgents = (analysis, allAnswers) => {
    const specs = []
    
    // Extrair recomendações técnicas dos agentes
    analysis.expertRecommendations.forEach((rec, key) => {
      if (rec.category === 'technologies' && rec.count >= 3) {
        specs.push(`- ${rec.item} (recomendado por ${rec.count} especialistas)`)
      }
    })
    
    // Adicionar especificações baseadas nas respostas do usuário
    if (allAnswers.architecture_preference) {
      specs.push(`- Arquitetura: ${allAnswers.architecture_preference}`)
    }
    
    if (allAnswers.platform_priority) {
      specs.push(`- Plataforma prioritária: ${allAnswers.platform_priority}`)
    }
    
    if (allAnswers.tech_preference) {
      specs.push(`- Stack preferida: ${allAnswers.tech_preference}`)
    }
    
    return specs.join('\n') || 'Especificações técnicas baseadas no consenso dos especialistas'
  }

  const extractCriticalDecisions = (urgentDecisions, allAnswers) => {
    const decisions = urgentDecisions.map(d => {
      const userAnswer = allAnswers[d.area] || allAnswers[`${d.area}_preference`]
      return `- ${d.area}: ${userAnswer || 'A ser definido com base nas recomendações'}`
    })
    
    return decisions.join('\n') || 'Todas as decisões críticas foram endereçadas'
  }

  const extractConstraints = (allAnswers, allQuestions) => {
    const constraints = []
    
    if (allAnswers.timeline) constraints.push(`- Prazo: ${allAnswers.timeline}`)
    if (allAnswers.budget_range) constraints.push(`- Orçamento: ${allAnswers.budget_range}`)
    if (allAnswers.constraints) constraints.push(`- Restrição principal: ${allAnswers.constraints}`)
    if (allAnswers.priority) constraints.push(`- Prioridade: ${allAnswers.priority}`)
    if (allAnswers.team || allAnswers.team_size) {
      constraints.push(`- Equipe: ${allAnswers.team || allAnswers.team_size}`)
    }
    
    return constraints.join('\n') || 'Sem restrições específicas'
  }

  const handleSkip = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      generateRefinedPrompt(answers)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleUseRefinedPrompt = () => {
    onRefinedPrompt(refinedPrompt)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="enhanced-prompt-overlay">
      <div className="enhanced-prompt-dialog">
        <div className="epd-header">
          <h2>
            <Icon name="Sparkles" size={24} />
            Enhanced Prompt Builder
          </h2>
          <button className="epd-close" onClick={onClose}>
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Seletor de Modo de Refinamento */}
        {!showFinalPrompt && !showSpecialists && (
          <div className="epd-mode-selector">
            <button 
              className={`epd-mode-btn ${refinementMode === 'questions' ? 'active' : ''}`}
              onClick={() => setRefinementMode('questions')}
            >
              <Icon name="MessageCircle" size={20} />
              Perguntas Dinâmicas
            </button>
            <button 
              className={`epd-mode-btn ${refinementMode === 'specialists' ? 'active' : ''}`}
              onClick={() => setRefinementMode('specialists')}
            >
              <Icon name="Users" size={20} />
              Especialistas de Refinamento
            </button>
          </div>
        )}

        {!showFinalPrompt && refinementMode === 'specialists' ? (
          <PromptRefinementSpecialists
            originalPrompt={originalPrompt}
            currentContext={context}
            agentResponses={agentResponses}
            onRefinementComplete={(refined, specialist) => {
              setRefinedPrompt(refined)
              setShowFinalPrompt(true)
            }}
          />
        ) : !showFinalPrompt ? (
          <>
            <div className="epd-progress">
              <div className="epd-progress-bar">
                <div 
                  className="epd-progress-fill"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
              <span className="epd-progress-text">
                Pergunta {currentQuestion + 1} de {questions.length}
              </span>
            </div>

            {isProcessing ? (
              <div className="epd-loading">
                <Icon name="Loader2" size={32} className="epd-spinner" />
                <p>Analisando respostas dos {agentResponses?.length || 0} especialistas...</p>
              </div>
            ) : questions.length > 0 && questions[currentQuestion] ? (
              <div className="epd-question-container">
                <div className="epd-question">
                  <h3>{questions[currentQuestion].text}</h3>
                  <p className="epd-context">{questions[currentQuestion].context}</p>
                </div>

                <div className="epd-answer-section">
                  {questions[currentQuestion].type === 'multiple_choice' && (
                    <div className="epd-options">
                      {questions[currentQuestion].options.map((option, idx) => (
                        <button
                          key={idx}
                          className="epd-option"
                          onClick={() => handleMultipleChoiceAnswer(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {questions[currentQuestion].type === 'multiple_choice_with_reason' && (
                    <div className="epd-options-with-reason">
                      {questions[currentQuestion].options.map((option, idx) => (
                        <button
                          key={idx}
                          className="epd-option"
                          onClick={() => {
                            const reason = prompt(`Por que você escolheu "${option}"?`)
                            if (reason) {
                              handleAnswer(`${option} - Razão: ${reason}`)
                            }
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {questions[currentQuestion].type === 'multi_select' && (
                    <div className="epd-multi-select">
                      <div className="epd-options">
                        {questions[currentQuestion].options.map((option, idx) => (
                          <label key={idx} className="epd-checkbox-option">
                            <input
                              type="checkbox"
                              value={option}
                              onChange={(e) => {
                                const selected = [...(answers[questions[currentQuestion].id] || [])]
                                if (e.target.checked) {
                                  selected.push(option)
                                } else {
                                  const index = selected.indexOf(option)
                                  if (index > -1) selected.splice(index, 1)
                                }
                                setAnswers({...answers, [questions[currentQuestion].id]: selected})
                              }}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                      <button
                        className="epd-submit-multi"
                        onClick={() => {
                          const selected = answers[questions[currentQuestion].id] || []
                          if (selected.length > 0) {
                            handleMultiSelectAnswer(selected)
                          }
                        }}
                      >
                        Confirmar seleção
                      </button>
                    </div>
                  )}
                  
                  {questions[currentQuestion].type === 'yes_no_explain' && (
                    <div className="epd-yes-no-explain">
                      <div className="epd-yes-no-buttons">
                        <button
                          className="epd-option"
                          onClick={() => {
                            const explanation = prompt('Por favor, explique sua resposta:')
                            if (explanation) {
                              handleYesNoExplainAnswer('Sim', explanation)
                            }
                          }}
                        >
                          Sim
                        </button>
                        <button
                          className="epd-option"
                          onClick={() => {
                            const explanation = prompt('Por favor, explique sua resposta:')
                            if (explanation) {
                              handleYesNoExplainAnswer('Não', explanation)
                            }
                          }}
                        >
                          Não
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {(questions[currentQuestion].type === 'text' || questions[currentQuestion].type === 'open_text') && (
                    <div className="epd-text-input">
                      <input
                        type="text"
                        placeholder={questions[currentQuestion].placeholder}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            handleAnswer(e.target.value.trim())
                          }
                        }}
                        autoFocus
                      />
                      <button
                        className="epd-submit-text"
                        onClick={(e) => {
                          const input = e.target.previousSibling
                          if (input.value.trim()) {
                            handleAnswer(input.value.trim())
                          }
                        }}
                      >
                        <Icon name="ArrowRight" size={20} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="epd-navigation">
                  {currentQuestion > 0 && (
                    <button className="epd-nav-btn" onClick={handleBack}>
                      <Icon name="ChevronLeft" size={20} />
                      Voltar
                    </button>
                  )}
                  <button className="epd-nav-btn skip" onClick={handleSkip}>
                    Pular pergunta
                    <Icon name="ChevronRight" size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="epd-no-questions">
                <p>Gerando perguntas baseadas nas análises dos especialistas...</p>
              </div>
            )}
          </>
        ) : null}
        
        {showFinalPrompt && (
          <div className="epd-refined-prompt">
            <h3>✨ Prompt Refinado</h3>
            <div className="epd-prompt-comparison">
              <div className="epd-prompt-section">
                <h4>Prompt Original:</h4>
                <p>{originalPrompt}</p>
              </div>
              <div className="epd-prompt-section refined">
                <h4>Prompt Enhanced:</h4>
                <pre>{refinedPrompt}</pre>
              </div>
            </div>
            <div className="epd-actions">
              <button className="epd-action-btn secondary" onClick={() => {
                setShowFinalPrompt(false)
                setCurrentQuestion(0)
                setAnswers({})
              }}>
                <Icon name="RotateCcw" size={20} />
                Refazer perguntas
              </button>
              <button className="epd-action-btn primary" onClick={handleUseRefinedPrompt}>
                <Icon name="Send" size={20} />
                Usar Prompt Refinado
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedPromptDialog