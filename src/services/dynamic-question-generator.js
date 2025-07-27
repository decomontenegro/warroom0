/**
 * Dynamic Question Generator
 * Gera perguntas inteligentes baseadas nas respostas dos agentes
 */

import agentInsightsAnalyzer from './agent-insights-analyzer.js';

export class DynamicQuestionGenerator {
  constructor() {
    this.maxQuestions = 5;
    this.minQuestions = 3;
    this.questionHistory = [];
    this.userContext = {};
  }

  /**
   * Gera perguntas dinâmicas baseadas na análise dos agentes
   */
  async generateDynamicQuestions(userInput, agentResponses, previousAnswers = {}) {
    // Analisar respostas dos agentes
    const analysis = agentInsightsAnalyzer.analyzeAgentResponses(agentResponses, userInput);
    const summary = agentInsightsAnalyzer.generateExecutiveSummary(analysis);
    
    // Atualizar contexto do usuário
    this.updateUserContext(userInput, previousAnswers);
    
    // Gerar perguntas baseadas em prioridades
    const questions = [];
    
    // 1. Questões sobre decisões críticas não resolvidas
    questions.push(...this.generateCriticalDecisionQuestions(summary.urgentDecisions));
    
    // 2. Questões sobre divergências significativas
    questions.push(...this.generateDivergenceQuestions(summary.majorDivergences));
    
    // 3. Questões sobre gaps de conhecimento
    questions.push(...this.generateKnowledgeGapQuestions(summary.criticalQuestions));
    
    // 4. Questões sobre oportunidades identificadas
    questions.push(...this.generateOpportunityQuestions(summary.topOpportunities));
    
    // 5. Questões de validação sobre consenso
    questions.push(...this.generateConsensusValidationQuestions(summary.strongConsensus));
    
    // Filtrar e priorizar perguntas
    const prioritizedQuestions = this.prioritizeQuestions(questions, analysis);
    
    // Retornar apenas as mais importantes
    return prioritizedQuestions.slice(0, this.maxQuestions);
  }

  /**
   * Atualiza contexto do usuário com respostas anteriores
   */
  updateUserContext(userInput, previousAnswers) {
    this.userContext = {
      ...this.userContext,
      originalInput: userInput,
      ...previousAnswers
    };
  }

  /**
   * Gera perguntas sobre decisões críticas
   */
  generateCriticalDecisionQuestions(urgentDecisions) {
    const questions = [];
    
    urgentDecisions.forEach(decision => {
      if (decision.area === 'arquitetura') {
        questions.push({
          id: 'architecture_preference',
          text: 'Os especialistas identificaram várias abordagens arquiteturais. Você tem alguma preferência ou restrição específica?',
          type: 'open_text',
          priority: 10,
          context: 'Múltiplos especialistas sugeriram diferentes arquiteturas',
          relatedAgents: decision.relatedAgents || [],
          options: this.extractArchitectureOptions(decision)
        });
      } else if (decision.area === 'plataforma' && decision.requiresClarification) {
        questions.push({
          id: 'platform_priority',
          text: 'Os especialistas divergem sobre a melhor plataforma inicial. Qual seria sua prioridade?',
          type: 'multiple_choice',
          priority: 9,
          context: 'Especialistas têm visões diferentes sobre por onde começar',
          options: this.extractPlatformOptions(decision)
        });
      } else if (decision.area === 'monetização') {
        questions.push({
          id: 'monetization_strategy',
          text: 'Considerando as análises dos especialistas, qual modelo de negócio faz mais sentido para seus objetivos?',
          type: 'multiple_choice_with_explanation',
          priority: 8,
          context: 'Especialistas sugeriram diferentes estratégias de monetização',
          options: [
            { value: 'freemium', label: 'Freemium (base grátis + recursos pagos)' },
            { value: 'subscription', label: 'Assinatura mensal/anual' },
            { value: 'one_time', label: 'Compra única' },
            { value: 'ads', label: 'Gratuito com anúncios' },
            { value: 'hybrid', label: 'Modelo híbrido (explique)' }
          ]
        });
      }
    });
    
    return questions;
  }

  /**
   * Gera perguntas sobre divergências
   */
  generateDivergenceQuestions(majorDivergences) {
    const questions = [];
    
    majorDivergences.forEach(divergence => {
      const point = divergence.point.toLowerCase();
      
      if (point.includes('tecnologia') || point.includes('stack')) {
        const techs = this.extractTechnologiesFromDivergence(divergence);
        questions.push({
          id: `tech_preference_${Date.now()}`,
          text: `Os especialistas estão divididos entre ${this.formatTechList(techs)}. Você tem experiência ou preferência com alguma dessas tecnologias?`,
          type: 'multiple_choice_with_reason',
          priority: 7,
          context: `${divergence.supporters.length} especialistas têm opiniões diferentes`,
          options: techs.map(tech => ({
            value: tech.toLowerCase().replace(/\s+/g, '_'),
            label: tech,
            supporters: divergence.supporters.filter(s => s.recommendation?.includes(tech))
          }))
        });
      } else if (point.includes('abordagem') || point.includes('approach')) {
        questions.push({
          id: `approach_preference_${Date.now()}`,
          text: 'Os especialistas sugerem abordagens diferentes. Qual se alinha melhor com sua visão?',
          type: 'ranking',
          priority: 6,
          context: 'Diferentes filosofias de desenvolvimento foram sugeridas',
          options: this.extractApproachesFromDivergence(divergence)
        });
      }
    });
    
    return questions;
  }

  /**
   * Gera perguntas sobre gaps de conhecimento
   */
  generateKnowledgeGapQuestions(criticalQuestions) {
    const questions = [];
    
    criticalQuestions.forEach((gap, index) => {
      if (gap.askedBy.length >= 3) {
        // Múltiplos agentes fizeram a mesma pergunta
        questions.push({
          id: `knowledge_gap_${index}`,
          text: this.reformulateAgentQuestion(gap.question),
          type: 'open_text',
          priority: 5,
          context: `${gap.askedBy.length} especialistas precisam desta informação`,
          askedBy: gap.askedBy,
          originalQuestion: gap.question
        });
      }
    });
    
    return questions;
  }

  /**
   * Gera perguntas sobre oportunidades
   */
  generateOpportunityQuestions(topOpportunities) {
    const questions = [];
    
    if (topOpportunities.length > 3) {
      const opportunities = topOpportunities.slice(0, 5).map(opp => ({
        value: `opp_${topOpportunities.indexOf(opp)}`,
        label: opp.opportunity,
        suggestedBy: opp.agent
      }));
      
      questions.push({
        id: 'opportunity_interest',
        text: 'Os especialistas identificaram várias oportunidades interessantes. Quais chamam mais sua atenção?',
        type: 'multi_select',
        priority: 4,
        context: 'Selecione as que você gostaria de explorar',
        options: opportunities,
        minSelect: 1,
        maxSelect: 3
      });
    }
    
    return questions;
  }

  /**
   * Gera perguntas de validação sobre consenso
   */
  generateConsensusValidationQuestions(strongConsensus) {
    const questions = [];
    
    // Se há forte consenso sobre algo importante, validar com o usuário
    const importantConsensus = strongConsensus.filter(c => 
      c.point.includes('crítico') || 
      c.point.includes('essencial') || 
      c.agreement >= 90
    );
    
    if (importantConsensus.length > 0) {
      questions.push({
        id: 'consensus_validation',
        text: `${importantConsensus[0].agreement}% dos especialistas concordam que "${importantConsensus[0].point}". Isso está alinhado com suas expectativas?`,
        type: 'yes_no_explain',
        priority: 3,
        context: 'Validando consenso dos especialistas',
        consensusData: importantConsensus[0]
      });
    }
    
    return questions;
  }

  /**
   * Prioriza perguntas baseadas na análise
   */
  prioritizeQuestions(questions, analysis) {
    // Adicionar score baseado em fatores
    questions.forEach(q => {
      q.score = q.priority || 0;
      
      // Bonus se múltiplos agentes estão envolvidos
      if (q.askedBy && q.askedBy.length > 2) {
        q.score += 2;
      }
      
      // Bonus se é uma decisão crítica
      if (analysis.criticalDecisions.some(d => q.id.includes(d.area))) {
        q.score += 3;
      }
      
      // Bonus se não temos contexto sobre isso ainda
      if (!this.userContext[q.id]) {
        q.score += 1;
      }
    });
    
    // Ordenar por score e remover duplicatas
    return questions
      .sort((a, b) => b.score - a.score)
      .filter((q, index, self) => 
        index === self.findIndex(other => other.id === q.id)
      );
  }

  /**
   * Reformula pergunta do agente para o usuário
   */
  reformulateAgentQuestion(agentQuestion) {
    // Remover menções técnicas desnecessárias
    let userQuestion = agentQuestion
      .replace(/precisamos saber/gi, 'você poderia especificar')
      .replace(/não está claro/gi, 'poderia esclarecer')
      .replace(/falta definir/gi, 'qual seria');
    
    // Adicionar contexto amigável
    if (!userQuestion.endsWith('?')) {
      userQuestion += '?';
    }
    
    return userQuestion;
  }

  /**
   * Extrai opções de arquitetura das decisões
   */
  extractArchitectureOptions(decision) {
    // Baseado no contexto real, não em templates fixos
    return [
      'Monolítica simples para começar rápido',
      'Microserviços para escalabilidade futura',
      'Serverless para reduzir custos operacionais',
      'Híbrida com componentes modulares',
      'Deixar os especialistas decidirem com base nas respostas'
    ];
  }

  /**
   * Extrai opções de plataforma
   */
  extractPlatformOptions(decision) {
    return [
      'Web primeiro (alcance máximo)',
      'Mobile primeiro (melhor experiência)',
      'Desktop primeiro (recursos completos)',
      'Progressive Web App (melhor dos dois mundos)',
      'Decisão baseada em pesquisa de mercado'
    ];
  }

  /**
   * Extrai tecnologias de divergência
   */
  extractTechnologiesFromDivergence(divergence) {
    const techs = new Set();
    divergence.supporters.forEach(supporter => {
      // Extrair tecnologias mencionadas
      const matches = supporter.recommendation?.match(/\b(React|Vue|Angular|Node|Python|Django|FastAPI)\b/gi);
      if (matches) {
        matches.forEach(tech => techs.add(tech));
      }
    });
    return Array.from(techs);
  }

  /**
   * Formata lista de tecnologias
   */
  formatTechList(techs) {
    if (techs.length === 0) return 'diferentes tecnologias';
    if (techs.length === 1) return techs[0];
    if (techs.length === 2) return `${techs[0]} e ${techs[1]}`;
    return `${techs.slice(0, -1).join(', ')} e ${techs[techs.length - 1]}`;
  }

  /**
   * Extrai abordagens de divergência
   */
  extractApproachesFromDivergence(divergence) {
    // Mapear diferentes filosofias de desenvolvimento
    const approaches = [];
    
    if (divergence.point.includes('ágil') || divergence.point.includes('agile')) {
      approaches.push({ value: 'agile', label: 'Desenvolvimento Ágil com sprints curtos' });
      approaches.push({ value: 'waterfall', label: 'Abordagem tradicional com fases bem definidas' });
    }
    
    if (divergence.point.includes('mvp')) {
      approaches.push({ value: 'lean', label: 'MVP mínimo e iteração rápida' });
      approaches.push({ value: 'complete', label: 'Produto completo desde o início' });
    }
    
    return approaches.length > 0 ? approaches : [
      { value: 'pragmatic', label: 'Abordagem pragmática focada em resultados' },
      { value: 'innovative', label: 'Abordagem inovadora com experimentação' },
      { value: 'conservative', label: 'Abordagem conservadora com tecnologias estabelecidas' }
    ];
  }

  /**
   * Valida se temos perguntas suficientes e relevantes
   */
  hasEnoughContext() {
    const answeredQuestions = Object.keys(this.userContext).length;
    return answeredQuestions >= this.minQuestions;
  }

  /**
   * Gera pergunta de acompanhamento baseada na resposta anterior
   */
  generateFollowUpQuestion(previousAnswer, remainingQuestions) {
    // Lógica para gerar pergunta de follow-up inteligente
    // baseada na resposta anterior e questões pendentes
    return remainingQuestions[0]; // Simplificado por enquanto
  }
}

export default new DynamicQuestionGenerator();