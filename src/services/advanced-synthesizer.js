/**
 * Advanced Synthesizer - Sistema avançado de síntese e consolidação de respostas
 * Consolida múltiplas análises de agentes em insights acionáveis e estruturados
 */

import { i18n } from './i18n-config.js';

export class AdvancedSynthesizer {
  constructor() {
    this.language = 'pt-BR';
    this.i18n = i18n;
    // Níveis de síntese
    this.synthesisLevels = {
      executive: {
        maxLength: 500,
        focus: ['key findings', 'recommendations', 'risks'],
        style: 'concise and strategic'
      },
      technical: {
        maxLength: 2000,
        focus: ['implementation details', 'technical challenges', 'architecture'],
        style: 'detailed and precise'
      },
      comprehensive: {
        maxLength: 5000,
        focus: ['all aspects', 'deep analysis', 'complete roadmap'],
        style: 'thorough and analytical'
      }
    };

    // Categorias de análise
    this.analysisCategories = {
      consensus: [],
      divergence: [],
      innovations: [],
      risks: [],
      opportunities: [],
      technical_details: [],
      implementation_steps: [],
      recommendations: []
    };
  }

  /**
   * Define o idioma para síntese
   */
  setLanguage(language) {
    this.language = language;
    this.i18n.setLanguage(language);
  }

  /**
   * Sintetiza múltiplas respostas de agentes em um resultado estruturado
   */
  async synthesize(agentResponses, documentAnalysis, options = {}) {
    console.log('🔄 Starting advanced synthesis of', agentResponses.length, 'agent responses');

    const {
      level = 'technical',
      targetSystem = 'claude-code',
      includeRawResponses = false,
      priorityFocus = null
    } = options;

    // Analisar todas as respostas
    const analyzedResponses = this.analyzeResponses(agentResponses);
    
    // Extrair insights principais
    const insights = this.extractKeyInsights(analyzedResponses, documentAnalysis);
    
    // Identificar consensos e divergências
    const consensus = this.findConsensus(analyzedResponses);
    const divergences = this.findDivergences(analyzedResponses);
    
    // Consolidar recomendações
    const recommendations = this.consolidateRecommendations(analyzedResponses, priorityFocus);
    
    // Avaliar riscos e oportunidades
    const riskAssessment = this.assessRisks(analyzedResponses);
    const opportunities = this.identifyOpportunities(analyzedResponses);
    
    // Gerar roadmap de implementação
    const implementationRoadmap = this.generateRoadmap(analyzedResponses, documentAnalysis);
    
    // Criar síntese estruturada
    const synthesis = this.createStructuredSynthesis({
      level,
      insights,
      consensus,
      divergences,
      recommendations,
      riskAssessment,
      opportunities,
      implementationRoadmap,
      documentAnalysis,
      agentCount: agentResponses.length
    });

    // Formatar para sistema alvo
    const formattedOutput = this.formatForTargetSystem(synthesis, targetSystem);

    // Gerar métricas de confiança
    const confidenceMetrics = this.calculateConfidenceMetrics(analyzedResponses);

    return {
      synthesis: formattedOutput,
      metrics: confidenceMetrics,
      rawData: includeRawResponses ? analyzedResponses : null,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analisa as respostas dos agentes
   */
  analyzeResponses(responses) {
    return responses.map(response => {
      const analysis = {
        agent: response.agent,
        content: response.content,
        timestamp: response.timestamp,
        themes: this.extractThemes(response.content),
        recommendations: this.extractRecommendations(response.content),
        concerns: this.extractConcerns(response.content),
        technicalPoints: this.extractTechnicalPoints(response.content),
        confidence: this.assessResponseConfidence(response.content),
        sentiment: this.analyzeSentiment(response.content)
      };

      return analysis;
    });
  }

  /**
   * Extrai insights principais
   */
  extractKeyInsights(analyzedResponses, documentAnalysis) {
    const insights = {
      technical: [],
      business: [],
      implementation: [],
      innovation: []
    };

    analyzedResponses.forEach(response => {
      // Insights técnicos
      response.technicalPoints.forEach(point => {
        insights.technical.push({
          source: response.agent.name,
          insight: point,
          confidence: response.confidence
        });
      });

      // Insights de negócio
      if (response.themes.includes('business_impact') || response.themes.includes('roi')) {
        insights.business.push({
          source: response.agent.name,
          insight: this.extractBusinessInsight(response.content),
          confidence: response.confidence
        });
      }

      // Insights de implementação
      response.recommendations
        .filter(rec => rec.type === 'implementation')
        .forEach(rec => {
          insights.implementation.push({
            source: response.agent.name,
            insight: rec.content,
            priority: rec.priority
          });
        });

      // Insights de inovação
      if (response.themes.includes('innovation') || response.themes.includes('novel')) {
        insights.innovation.push({
          source: response.agent.name,
          insight: this.extractInnovationInsight(response.content),
          impact: this.assessInnovationImpact(response.content)
        });
      }
    });

    // Ranking e deduplicação
    Object.keys(insights).forEach(category => {
      insights[category] = this.rankAndDeduplicate(insights[category]);
    });

    return insights;
  }

  /**
   * Encontra pontos de consenso
   */
  findConsensus(analyzedResponses) {
    const themeFrequency = new Map();
    const recommendationFrequency = new Map();

    // Contar frequência de temas
    analyzedResponses.forEach(response => {
      response.themes.forEach(theme => {
        themeFrequency.set(theme, (themeFrequency.get(theme) || 0) + 1);
      });

      response.recommendations.forEach(rec => {
        const key = rec.content.toLowerCase();
        if (!recommendationFrequency.has(key)) {
          recommendationFrequency.set(key, { count: 0, sources: [], original: rec });
        }
        const entry = recommendationFrequency.get(key);
        entry.count++;
        entry.sources.push(response.agent.name);
      });
    });

    // Identificar consensos (>70% concordância)
    const threshold = analyzedResponses.length * 0.7;
    const consensusThemes = Array.from(themeFrequency.entries())
      .filter(([theme, count]) => count >= threshold)
      .map(([theme, count]) => ({
        theme,
        agreement: count / analyzedResponses.length,
        supporters: count
      }));

    const consensusRecommendations = Array.from(recommendationFrequency.values())
      .filter(entry => entry.count >= threshold)
      .map(entry => ({
        recommendation: entry.original.content,
        agreement: entry.count / analyzedResponses.length,
        supporters: entry.sources
      }));

    return {
      themes: consensusThemes,
      recommendations: consensusRecommendations,
      overallAgreement: this.calculateOverallAgreement(analyzedResponses)
    };
  }

  /**
   * Encontra pontos de divergência
   */
  findDivergences(analyzedResponses) {
    const divergences = [];
    const concerns = new Map();

    // Agrupar concerns por tema
    analyzedResponses.forEach(response => {
      response.concerns.forEach(concern => {
        const theme = this.categorizeConcern(concern);
        if (!concerns.has(theme)) {
          concerns.set(theme, []);
        }
        concerns.get(theme).push({
          agent: response.agent.name,
          concern: concern,
          severity: this.assessSeverity(concern)
        });
      });
    });

    // Identificar divergências significativas
    concerns.forEach((agentConcerns, theme) => {
      if (agentConcerns.length > 1) {
        const conflicting = this.findConflictingViews(agentConcerns);
        if (conflicting.length > 0) {
          divergences.push({
            theme,
            conflictingViews: conflicting,
            severity: Math.max(...conflicting.map(c => c.severity))
          });
        }
      }
    });

    return divergences;
  }

  /**
   * Consolida recomendações
   */
  consolidateRecommendations(analyzedResponses, priorityFocus) {
    const allRecommendations = [];

    analyzedResponses.forEach(response => {
      response.recommendations.forEach(rec => {
        allRecommendations.push({
          ...rec,
          source: response.agent.name,
          expertise: response.agent.role,
          confidence: response.confidence
        });
      });
    });

    // Agrupar e priorizar
    const grouped = this.groupRecommendations(allRecommendations);
    const prioritized = this.prioritizeRecommendations(grouped, priorityFocus);

    // Criar plano de ação
    const actionPlan = this.createActionPlan(prioritized);

    return {
      immediate: actionPlan.immediate,
      shortTerm: actionPlan.shortTerm,
      longTerm: actionPlan.longTerm,
      dependencies: this.identifyDependencies(prioritized)
    };
  }

  /**
   * Avalia riscos
   */
  assessRisks(analyzedResponses) {
    const risks = {
      technical: [],
      business: [],
      security: [],
      implementation: []
    };

    analyzedResponses.forEach(response => {
      response.concerns.forEach(concern => {
        const risk = {
          description: concern,
          severity: this.assessSeverity(concern),
          likelihood: this.assessLikelihood(concern, response.content),
          source: response.agent.name,
          mitigation: this.suggestMitigation(concern, response.agent.role)
        };

        const category = this.categorizeRisk(concern);
        risks[category].push(risk);
      });
    });

    // Calcular risk score geral
    const overallRiskScore = this.calculateOverallRiskScore(risks);

    return {
      risks,
      overallScore: overallRiskScore,
      criticalRisks: this.identifyCriticalRisks(risks),
      mitigationPlan: this.createMitigationPlan(risks)
    };
  }

  /**
   * Identifica oportunidades
   */
  identifyOpportunities(analyzedResponses) {
    const opportunities = [];

    analyzedResponses.forEach(response => {
      // Extrair menções a oportunidades
      const opportunityPatterns = [
        /opportunity|chance|potential|could be|might enable|would allow/gi,
        /innovative|novel|breakthrough|game-changing/gi
      ];

      opportunityPatterns.forEach(pattern => {
        const matches = response.content.match(pattern);
        if (matches) {
          const context = this.extractContext(response.content, matches[0]);
          opportunities.push({
            description: context,
            source: response.agent.name,
            impact: this.assessImpact(context),
            feasibility: this.assessFeasibility(context, response.agent.role),
            category: this.categorizeOpportunity(context)
          });
        }
      });
    });

    return this.rankOpportunities(opportunities);
  }

  /**
   * Gera roadmap de implementação
   */
  generateRoadmap(analyzedResponses, documentAnalysis) {
    const phases = {
      planning: {
        duration: '2-4 weeks',
        tasks: [],
        dependencies: [],
        requiredExperts: []
      },
      prototype: {
        duration: '4-8 weeks',
        tasks: [],
        dependencies: ['planning'],
        requiredExperts: []
      },
      development: {
        duration: '8-16 weeks',
        tasks: [],
        dependencies: ['prototype'],
        requiredExperts: []
      },
      testing: {
        duration: '2-4 weeks',
        tasks: [],
        dependencies: ['development'],
        requiredExperts: []
      },
      deployment: {
        duration: '1-2 weeks',
        tasks: [],
        dependencies: ['testing'],
        requiredExperts: []
      }
    };

    // Extrair tarefas das recomendações
    analyzedResponses.forEach(response => {
      response.recommendations.forEach(rec => {
        const phase = this.determinePhase(rec);
        if (phases[phase]) {
          phases[phase].tasks.push({
            task: rec.content,
            priority: rec.priority,
            assignee: this.suggestAssignee(rec, response.agent)
          });
          phases[phase].requiredExperts.push(response.agent.role);
        }
      });
    });

    // Adicionar milestones
    const milestones = this.generateMilestones(phases, documentAnalysis);

    return {
      phases,
      milestones,
      criticalPath: this.identifyCriticalPath(phases),
      estimatedDuration: this.calculateTotalDuration(phases),
      resourceRequirements: this.calculateResourceRequirements(phases)
    };
  }

  /**
   * Cria síntese estruturada
   */
  createStructuredSynthesis(data) {
    const { level } = data;
    const levelConfig = this.synthesisLevels[level];

    const synthesis = {
      executiveSummary: this.generateExecutiveSummary(data, levelConfig),
      keyFindings: this.formatKeyFindings(data.insights),
      consensus: this.formatConsensus(data.consensus),
      divergences: this.formatDivergences(data.divergences),
      recommendations: this.formatRecommendations(data.recommendations),
      riskAssessment: this.formatRiskAssessment(data.riskAssessment),
      opportunities: this.formatOpportunities(data.opportunities),
      implementationRoadmap: this.formatRoadmap(data.implementationRoadmap),
      nextSteps: this.generateNextSteps(data),
      appendices: level === 'comprehensive' ? this.generateAppendices(data) : null
    };

    return synthesis;
  }

  /**
   * Formata output para sistema alvo
   */
  formatForTargetSystem(synthesis, targetSystem) {
    switch (targetSystem) {
      case 'claude-code':
        return this.formatForClaudeCode(synthesis);
      case 'json-api':
        return this.formatForJsonApi(synthesis);
      case 'markdown':
        return this.formatForMarkdown(synthesis);
      default:
        return synthesis;
    }
  }

  /**
   * Formato específico para Claude-Code
   */
  formatForClaudeCode(synthesis) {
    return {
      summary: synthesis.executiveSummary,
      technical_analysis: {
        key_concepts: synthesis.keyFindings.technical.map(f => f.insight),
        architecture_insights: synthesis.keyFindings.implementation,
        code_considerations: this.extractCodeConsiderations(synthesis)
      },
      implementation_guide: {
        recommended_approach: synthesis.recommendations.immediate[0],
        step_by_step: synthesis.implementationRoadmap.phases,
        technical_requirements: synthesis.implementationRoadmap.resourceRequirements
      },
      risk_mitigation: {
        critical_risks: synthesis.riskAssessment.criticalRisks,
        mitigation_strategies: synthesis.riskAssessment.mitigationPlan
      },
      code_generation_hints: {
        patterns_to_use: this.extractPatterns(synthesis),
        technologies_recommended: this.extractTechnologies(synthesis),
        security_considerations: synthesis.riskAssessment.risks.security
      },
      validation_criteria: {
        success_metrics: this.extractSuccessMetrics(synthesis),
        test_scenarios: this.generateTestScenarios(synthesis)
      }
    };
  }

  /**
   * Helpers de extração e análise
   */
  extractThemes(content) {
    const themes = [];
    const themePatterns = {
      'architecture': /architect|design|structure|pattern/gi,
      'security': /security|vulnerab|threat|attack/gi,
      'performance': /performance|speed|optimiz|efficien/gi,
      'scalability': /scal|growth|expand|distribut/gi,
      'innovation': /innovat|novel|new|unique/gi,
      'business_impact': /business|roi|cost|value/gi
    };

    Object.entries(themePatterns).forEach(([theme, pattern]) => {
      if (pattern.test(content)) {
        themes.push(theme);
      }
    });

    return themes;
  }

  extractRecommendations(content) {
    const recommendations = [];
    const recPatterns = [
      /recommend|suggest|should|must|need to|consider/gi,
      /best practice|approach|solution|implement/gi
    ];

    const sentences = content.split(/[.!?]/).filter(s => s.trim());
    
    sentences.forEach(sentence => {
      if (recPatterns.some(pattern => pattern.test(sentence))) {
        recommendations.push({
          content: sentence.trim(),
          type: this.categorizeRecommendation(sentence),
          priority: this.assessPriority(sentence)
        });
      }
    });

    return recommendations;
  }

  extractConcerns(content) {
    const concerns = [];
    const concernPatterns = [
      /concern|risk|issue|problem|challenge|difficult/gi,
      /vulnerab|threat|attack|breach|exploit/gi,
      /limitation|constraint|bottleneck|blocker/gi
    ];

    const sentences = content.split(/[.!?]/).filter(s => s.trim());
    
    sentences.forEach(sentence => {
      if (concernPatterns.some(pattern => pattern.test(sentence))) {
        concerns.push(sentence.trim());
      }
    });

    return concerns;
  }

  extractTechnicalPoints(content) {
    const technical = [];
    const techPatterns = [
      /algorithm|data structure|complexity|O\(\w+\)/gi,
      /api|endpoint|protocol|interface/gi,
      /database|storage|cache|memory/gi,
      /framework|library|tool|technolog/gi
    ];

    const sentences = content.split(/[.!?]/).filter(s => s.trim());
    
    sentences.forEach(sentence => {
      if (techPatterns.some(pattern => pattern.test(sentence))) {
        technical.push(sentence.trim());
      }
    });

    return technical;
  }

  calculateConfidenceMetrics(analyzedResponses) {
    const metrics = {
      overallConfidence: 0,
      consensusStrength: 0,
      expertiseAlignment: 0,
      analysisDepth: 0
    };

    // Calcular confiança média
    const confidences = analyzedResponses.map(r => r.confidence);
    metrics.overallConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

    // Força do consenso
    const themes = analyzedResponses.flatMap(r => r.themes);
    const uniqueThemes = new Set(themes);
    metrics.consensusStrength = 1 - (uniqueThemes.size / themes.length);

    // Alinhamento de expertise
    const expertDomains = analyzedResponses.map(r => this.getExpertDomain(r.agent.role));
    const uniqueDomains = new Set(expertDomains);
    metrics.expertiseAlignment = uniqueDomains.size / analyzedResponses.length;

    // Profundidade da análise
    const avgRecommendations = analyzedResponses.reduce((sum, r) => 
      sum + r.recommendations.length, 0) / analyzedResponses.length;
    metrics.analysisDepth = Math.min(avgRecommendations / 5, 1);

    return metrics;
  }

  // Métodos auxiliares
  rankAndDeduplicate(items) {
    const unique = new Map();
    
    items.forEach(item => {
      const key = item.insight.toLowerCase();
      if (!unique.has(key) || item.confidence > unique.get(key).confidence) {
        unique.set(key, item);
      }
    });

    return Array.from(unique.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  assessResponseConfidence(content) {
    let confidence = 0.5;
    
    // Aumentar confiança baseado em indicadores
    if (content.match(/clearly|definitely|certainly|proven/gi)) confidence += 0.2;
    if (content.match(/data|evidence|research|study/gi)) confidence += 0.1;
    if (content.match(/example|case|instance|demonstration/gi)) confidence += 0.1;
    
    // Diminuir confiança baseado em incerteza
    if (content.match(/might|perhaps|possibly|unclear/gi)) confidence -= 0.1;
    if (content.match(/assume|guess|think|believe/gi)) confidence -= 0.1;
    
    return Math.max(0, Math.min(1, confidence));
  }

  getExpertDomain(role) {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('frontend')) return 'frontend';
    if (roleLower.includes('backend')) return 'backend';
    if (roleLower.includes('security')) return 'security';
    if (roleLower.includes('data')) return 'data';
    if (roleLower.includes('architect')) return 'architecture';
    return 'general';
  }

  // Missing helper methods
  categorizeRecommendation(sentence) {
    const sentenceLower = sentence.toLowerCase();
    if (sentenceLower.includes('implement') || sentenceLower.includes('develop')) return 'implementation';
    if (sentenceLower.includes('test') || sentenceLower.includes('validate')) return 'testing';
    if (sentenceLower.includes('security') || sentenceLower.includes('protect')) return 'security';
    if (sentenceLower.includes('optimize') || sentenceLower.includes('performance')) return 'optimization';
    if (sentenceLower.includes('document') || sentenceLower.includes('guide')) return 'documentation';
    return 'general';
  }

  assessPriority(sentence) {
    const sentenceLower = sentence.toLowerCase();
    if (sentenceLower.includes('critical') || sentenceLower.includes('must') || sentenceLower.includes('essential')) return 'high';
    if (sentenceLower.includes('should') || sentenceLower.includes('important')) return 'medium';
    return 'low';
  }

  extractBusinessInsight(content) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim());
    const businessSentence = sentences.find(s => 
      s.toLowerCase().includes('business') || 
      s.toLowerCase().includes('value') ||
      s.toLowerCase().includes('roi')
    );
    return businessSentence || 'Business impact analysis pending';
  }

  extractInnovationInsight(content) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim());
    const innovationSentence = sentences.find(s => 
      s.toLowerCase().includes('innovat') || 
      s.toLowerCase().includes('novel') ||
      s.toLowerCase().includes('unique')
    );
    return innovationSentence || 'Innovation analysis pending';
  }

  assessInnovationImpact(content) {
    if (content.includes('breakthrough') || content.includes('game-changing')) return 'high';
    if (content.includes('significant') || content.includes('important')) return 'medium';
    return 'low';
  }

  calculateOverallAgreement(analyzedResponses) {
    const themes = analyzedResponses.flatMap(r => r.themes);
    const uniqueThemes = new Set(themes);
    return themes.length > 0 ? (themes.length - uniqueThemes.size) / themes.length : 0;
  }

  categorizeConcern(concern) {
    const concernLower = concern.toLowerCase();
    if (concernLower.includes('security') || concernLower.includes('vulnerab')) return 'security';
    if (concernLower.includes('performance') || concernLower.includes('speed')) return 'performance';
    if (concernLower.includes('scale') || concernLower.includes('growth')) return 'scalability';
    if (concernLower.includes('cost') || concernLower.includes('expense')) return 'cost';
    return 'general';
  }

  assessSeverity(concern) {
    const concernLower = concern.toLowerCase();
    if (concernLower.includes('critical') || concernLower.includes('severe') || concernLower.includes('major')) return 10;
    if (concernLower.includes('significant') || concernLower.includes('important')) return 7;
    if (concernLower.includes('minor') || concernLower.includes('small')) return 3;
    return 5;
  }

  findConflictingViews(agentConcerns) {
    const conflicts = [];
    for (let i = 0; i < agentConcerns.length; i++) {
      for (let j = i + 1; j < agentConcerns.length; j++) {
        if (this.areConflicting(agentConcerns[i].concern, agentConcerns[j].concern)) {
          conflicts.push({
            agent1: agentConcerns[i].agent,
            concern1: agentConcerns[i].concern,
            agent2: agentConcerns[j].agent,
            concern2: agentConcerns[j].concern,
            severity: Math.max(agentConcerns[i].severity, agentConcerns[j].severity)
          });
        }
      }
    }
    return conflicts;
  }

  areConflicting(concern1, concern2) {
    // Simple conflict detection - could be enhanced
    const opposites = [
      ['centralized', 'decentralized'],
      ['synchronous', 'asynchronous'],
      ['monolithic', 'microservices'],
      ['sql', 'nosql']
    ];
    
    const c1Lower = concern1.toLowerCase();
    const c2Lower = concern2.toLowerCase();
    
    return opposites.some(([a, b]) => 
      (c1Lower.includes(a) && c2Lower.includes(b)) || 
      (c1Lower.includes(b) && c2Lower.includes(a))
    );
  }

  groupRecommendations(recommendations) {
    const groups = {};
    recommendations.forEach(rec => {
      const type = rec.type || 'general';
      if (!groups[type]) groups[type] = [];
      groups[type].push(rec);
    });
    return groups;
  }

  prioritizeRecommendations(grouped, priorityFocus) {
    const prioritized = [];
    Object.entries(grouped).forEach(([type, recs]) => {
      const sorted = recs.sort((a, b) => {
        if (priorityFocus && a.content.includes(priorityFocus)) return -1;
        if (priorityFocus && b.content.includes(priorityFocus)) return 1;
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });
      prioritized.push(...sorted);
    });
    return prioritized;
  }

  createActionPlan(recommendations) {
    return {
      immediate: recommendations.filter(r => r.priority === 'high').slice(0, 5),
      shortTerm: recommendations.filter(r => r.priority === 'medium').slice(0, 5),
      longTerm: recommendations.filter(r => r.priority === 'low').slice(0, 5)
    };
  }

  identifyDependencies(recommendations) {
    const dependencies = [];
    recommendations.forEach((rec, i) => {
      recommendations.slice(i + 1).forEach((otherRec, j) => {
        if (this.hasDependency(rec.content, otherRec.content)) {
          dependencies.push({
            from: rec.content.substring(0, 50) + '...',
            to: otherRec.content.substring(0, 50) + '...',
            type: 'requires'
          });
        }
      });
    });
    return dependencies;
  }

  hasDependency(content1, content2) {
    const dependencies = ['before', 'after', 'requires', 'depends on', 'first', 'then'];
    return dependencies.some(dep => content1.includes(dep) && content2.includes(dep));
  }

  assessLikelihood(concern, fullContent) {
    if (fullContent.includes('likely') || fullContent.includes('probable')) return 0.7;
    if (fullContent.includes('possible') || fullContent.includes('might')) return 0.5;
    if (fullContent.includes('unlikely') || fullContent.includes('rare')) return 0.3;
    return 0.5;
  }

  suggestMitigation(concern, agentRole) {
    const concernLower = concern.toLowerCase();
    if (concernLower.includes('security')) return 'Implement security audit and penetration testing';
    if (concernLower.includes('performance')) return 'Add performance monitoring and optimization';
    if (concernLower.includes('scale')) return 'Design for horizontal scaling from the start';
    return 'Conduct thorough analysis and testing';
  }

  categorizeRisk(concern) {
    const concernLower = concern.toLowerCase();
    if (concernLower.includes('security') || concernLower.includes('vulnerab')) return 'security';
    if (concernLower.includes('technical') || concernLower.includes('architect')) return 'technical';
    if (concernLower.includes('business') || concernLower.includes('cost')) return 'business';
    return 'implementation';
  }

  calculateOverallRiskScore(risks) {
    let totalScore = 0;
    let count = 0;
    Object.values(risks).forEach(categoryRisks => {
      categoryRisks.forEach(risk => {
        totalScore += (risk.severity / 10) * risk.likelihood;
        count++;
      });
    });
    return count > 0 ? totalScore / count : 0;
  }

  identifyCriticalRisks(risks) {
    const critical = [];
    Object.values(risks).forEach(categoryRisks => {
      categoryRisks.forEach(risk => {
        if (risk.severity >= 7 && risk.likelihood >= 0.5) {
          critical.push(risk);
        }
      });
    });
    return critical.sort((a, b) => b.severity - a.severity);
  }

  createMitigationPlan(risks) {
    const plan = {};
    Object.entries(risks).forEach(([category, categoryRisks]) => {
      plan[category] = categoryRisks.map(risk => ({
        risk: risk.description.substring(0, 100) + '...',
        mitigation: risk.mitigation,
        priority: risk.severity >= 7 ? 'high' : risk.severity >= 5 ? 'medium' : 'low',
        timeline: risk.severity >= 7 ? 'immediate' : 'short-term'
      }));
    });
    return plan;
  }

  extractContext(content, match) {
    const index = content.indexOf(match);
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + 100);
    return content.substring(start, end).trim();
  }

  assessImpact(context) {
    if (context.includes('significant') || context.includes('major')) return 'high';
    if (context.includes('moderate') || context.includes('some')) return 'medium';
    return 'low';
  }

  assessFeasibility(context, agentRole) {
    if (context.includes('simple') || context.includes('straightforward')) return 'high';
    if (context.includes('complex') || context.includes('challenging')) return 'low';
    return 'medium';
  }

  categorizeOpportunity(context) {
    if (context.includes('market') || context.includes('competitive')) return 'market';
    if (context.includes('technical') || context.includes('innovation')) return 'technical';
    if (context.includes('cost') || context.includes('efficiency')) return 'operational';
    return 'strategic';
  }

  rankOpportunities(opportunities) {
    return opportunities.sort((a, b) => {
      const scoreA = (a.impact === 'high' ? 3 : a.impact === 'medium' ? 2 : 1) * 
                    (a.feasibility === 'high' ? 3 : a.feasibility === 'medium' ? 2 : 1);
      const scoreB = (b.impact === 'high' ? 3 : b.impact === 'medium' ? 2 : 1) * 
                    (b.feasibility === 'high' ? 3 : b.feasibility === 'medium' ? 2 : 1);
      return scoreB - scoreA;
    });
  }

  determinePhase(recommendation) {
    const content = recommendation.content.toLowerCase();
    if (content.includes('plan') || content.includes('design')) return 'planning';
    if (content.includes('prototype') || content.includes('poc')) return 'prototype';
    if (content.includes('develop') || content.includes('implement')) return 'development';
    if (content.includes('test') || content.includes('validate')) return 'testing';
    if (content.includes('deploy') || content.includes('launch')) return 'deployment';
    return 'planning';
  }

  suggestAssignee(recommendation, agent) {
    // Suggest based on recommendation type and agent expertise
    return agent.role;
  }

  generateMilestones(phases, documentAnalysis) {
    const milestones = [];
    Object.entries(phases).forEach(([phase, details]) => {
      milestones.push({
        phase,
        name: `${phase.charAt(0).toUpperCase() + phase.slice(1)} Complete`,
        criteria: this.generateCriteria(phase, details.tasks),
        deliverables: this.generateDeliverables(phase)
      });
    });
    return milestones;
  }

  generateCriteria(phase, tasks) {
    const criteria = {
      planning: ['Requirements documented', 'Architecture designed', 'Team assigned'],
      prototype: ['Core features working', 'Basic UI complete', 'Initial testing done'],
      development: ['All features implemented', 'Unit tests passing', 'Code review complete'],
      testing: ['Integration tests passing', 'Performance benchmarks met', 'Security audit done'],
      deployment: ['Production environment ready', 'Monitoring in place', 'Documentation complete']
    };
    return criteria[phase] || ['Phase objectives met'];
  }

  generateDeliverables(phase) {
    const deliverables = {
      planning: ['Technical specification', 'Project plan', 'Risk assessment'],
      prototype: ['Working prototype', 'Demo video', 'Feedback report'],
      development: ['Source code', 'Test suite', 'API documentation'],
      testing: ['Test reports', 'Performance metrics', 'Security assessment'],
      deployment: ['Deployment guide', 'Operations manual', 'Training materials']
    };
    return deliverables[phase] || ['Phase deliverables'];
  }

  identifyCriticalPath(phases) {
    // Simplified critical path - in reality would use proper CPM algorithm
    return Object.keys(phases);
  }

  calculateTotalDuration(phases) {
    let totalWeeks = 0;
    Object.values(phases).forEach(phase => {
      const duration = phase.duration.match(/\d+/g);
      if (duration) {
        totalWeeks += parseInt(duration[duration.length - 1]);
      }
    });
    return `${totalWeeks} weeks`;
  }

  calculateResourceRequirements(phases) {
    const resources = new Set();
    Object.values(phases).forEach(phase => {
      phase.requiredExperts.forEach(expert => resources.add(expert));
    });
    return {
      uniqueRoles: Array.from(resources),
      totalExperts: resources.size,
      estimatedEffort: `${resources.size * 40} hours/week`
    };
  }

  generateExecutiveSummary(data, levelConfig) {
    const { insights, consensus, recommendations, riskAssessment } = data;
    
    // Se o idioma for português, usar o formato original
    if (this.language === 'pt-BR' || this.language === 'pt') {
      let summary = `Com base na análise de ${data.agentCount} especialistas, `;
      summary += `o documento apresenta ${insights.innovation.length} conceitos inovadores `;
      summary += `com ${Math.round(consensus.overallAgreement * 100)}% de consenso entre os experts. `;
      
      if (recommendations.immediate.length > 0) {
        summary += `Foram identificadas ${recommendations.immediate.length} ações prioritárias imediatas, `;
      }
      
      summary += `com um score de risco geral de ${Math.round(riskAssessment.overallScore * 100)}%. `;
      summary += `O roadmap de implementação proposto abrange ${data.implementationRoadmap.estimatedDuration}.`;
      
      return summary;
    }
    
    // Para inglês
    if (this.language === 'en-US' || this.language === 'en') {
      let summary = `Based on analysis from ${data.agentCount} specialists, `;
      summary += `the document presents ${insights.innovation.length} innovative concepts `;
      summary += `with ${Math.round(consensus.overallAgreement * 100)}% consensus among experts. `;
      
      if (recommendations.immediate.length > 0) {
        summary += `${recommendations.immediate.length} immediate priority actions were identified, `;
      }
      
      summary += `with an overall risk score of ${Math.round(riskAssessment.overallScore * 100)}%. `;
      summary += `The proposed implementation roadmap spans ${data.implementationRoadmap.estimatedDuration}.`;
      
      return summary;
    }
    
    // Para espanhol
    if (this.language === 'es-ES' || this.language === 'es') {
      let summary = `Basado en el análisis de ${data.agentCount} especialistas, `;
      summary += `el documento presenta ${insights.innovation.length} conceptos innovadores `;
      summary += `con ${Math.round(consensus.overallAgreement * 100)}% de consenso entre los expertos. `;
      
      if (recommendations.immediate.length > 0) {
        summary += `Se identificaron ${recommendations.immediate.length} acciones prioritarias inmediatas, `;
      }
      
      summary += `con una puntuación de riesgo general de ${Math.round(riskAssessment.overallScore * 100)}%. `;
      summary += `La hoja de ruta de implementación propuesta abarca ${data.implementationRoadmap.estimatedDuration}.`;
      
      return summary;
    }
    
    // Fallback para outros idiomas - usar inglês
    return this.generateExecutiveSummaryInEnglish(data, levelConfig);
  }
  
  generateExecutiveSummaryInEnglish(data, levelConfig) {
    const { insights, consensus, recommendations, riskAssessment } = data;
    
    let summary = `Based on analysis from ${data.agentCount} specialists, `;
    summary += `the document presents ${insights.innovation.length} innovative concepts `;
    summary += `with ${Math.round(consensus.overallAgreement * 100)}% consensus among experts. `;
    
    if (recommendations.immediate.length > 0) {
      summary += `${recommendations.immediate.length} immediate priority actions were identified, `;
    }
    
    summary += `with an overall risk score of ${Math.round(riskAssessment.overallScore * 100)}%. `;
    summary += `The proposed implementation roadmap spans ${data.implementationRoadmap.estimatedDuration}.`;
    
    return summary;
  }

  formatKeyFindings(insights) {
    return insights;
  }

  formatConsensus(consensus) {
    return consensus;
  }

  formatDivergences(divergences) {
    return divergences;
  }

  formatRecommendations(recommendations) {
    return recommendations;
  }

  formatRiskAssessment(riskAssessment) {
    return riskAssessment;
  }

  formatOpportunities(opportunities) {
    return opportunities;
  }

  formatRoadmap(roadmap) {
    return roadmap;
  }

  generateNextSteps(data) {
    const steps = [];
    if (data.recommendations.immediate.length > 0) {
      steps.push(`Begin with: ${data.recommendations.immediate[0].content}`);
    }
    if (data.riskAssessment.criticalRisks.length > 0) {
      steps.push('Address critical risks identified');
    }
    steps.push('Form implementation team based on resource requirements');
    return steps;
  }

  generateAppendices(data) {
    return {
      detailedAnalysis: data.insights,
      fullRecommendations: data.recommendations,
      riskMatrix: data.riskAssessment,
      agentContributions: data.agentCount
    };
  }

  extractCodeConsiderations(synthesis) {
    const considerations = [];
    if (synthesis.keyFindings.technical) {
      synthesis.keyFindings.technical.forEach(finding => {
        if (finding.insight.includes('contract') || finding.insight.includes('implement')) {
          considerations.push(finding.insight);
        }
      });
    }
    return considerations;
  }

  extractPatterns(synthesis) {
    const patterns = [];
    if (synthesis.keyFindings.technical) {
      if (synthesis.keyFindings.technical.some(f => f.insight.includes('modular'))) {
        patterns.push('Modular architecture');
      }
      if (synthesis.keyFindings.technical.some(f => f.insight.includes('event'))) {
        patterns.push('Event-driven design');
      }
    }
    return patterns;
  }

  extractTechnologies(synthesis) {
    const technologies = new Set();
    const techKeywords = ['solidity', 'ethereum', 'blockchain', 'smart contract', 'web3', 'ipfs'];
    
    const searchIn = JSON.stringify(synthesis);
    techKeywords.forEach(tech => {
      if (searchIn.toLowerCase().includes(tech)) {
        technologies.add(tech.charAt(0).toUpperCase() + tech.slice(1));
      }
    });
    
    return Array.from(technologies);
  }

  extractSuccessMetrics(synthesis) {
    return [
      'Smart contracts deployed and verified',
      'Gas optimization targets met',
      'Security audit passed',
      'Performance benchmarks achieved'
    ];
  }

  generateTestScenarios(synthesis) {
    return [
      'Happy path: successful bet placement and resolution',
      'Edge case: simultaneous bets at market close',
      'Error case: insufficient token balance',
      'Security test: attempt price manipulation'
    ];
  }

  analyzeSentiment(content) {
    const positive = (content.match(/good|great|excellent|innovative|strong/gi) || []).length;
    const negative = (content.match(/bad|poor|weak|concern|risk/gi) || []).length;
    
    if (positive > negative * 2) return 'positive';
    if (negative > positive * 2) return 'negative';
    return 'neutral';
  }

  formatForJsonApi(synthesis) {
    return synthesis;
  }

  formatForMarkdown(synthesis) {
    let markdown = `# Analysis Report\n\n`;
    markdown += `## Executive Summary\n${synthesis.executiveSummary}\n\n`;
    markdown += `## Key Findings\n`;
    Object.entries(synthesis.keyFindings).forEach(([category, findings]) => {
      markdown += `### ${category}\n`;
      findings.forEach(f => markdown += `- ${f.insight || f}\n`);
    });
    return markdown;
  }
}

export default new AdvancedSynthesizer();