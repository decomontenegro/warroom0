/**
 * Agent Insights Analyzer
 * Analisa respostas dos agentes para identificar insights, divergências e pontos críticos
 */

export class AgentInsightsAnalyzer {
  constructor() {
    this.consensusThreshold = 0.7; // 70% dos agentes concordam
    this.divergenceThreshold = 0.3; // 30% ou menos concordam
  }

  /**
   * Analisa todas as respostas dos agentes
   */
  analyzeAgentResponses(agentResponses, userInput) {
    const analysis = {
      totalAgents: agentResponses.length,
      keyInsights: [],
      consensusPoints: [],
      divergencePoints: [],
      criticalDecisions: [],
      technicalConcerns: [],
      creativeOpportunities: [],
      knowledgeGaps: [],
      expertRecommendations: new Map()
    };

    // Extrair insights de cada resposta
    agentResponses.forEach(response => {
      this.extractInsights(response, analysis);
    });

    // Identificar consenso e divergências
    this.identifyConsensusAndDivergence(analysis);

    // Identificar decisões críticas
    this.identifyCriticalDecisions(analysis, userInput);

    // Identificar gaps de conhecimento
    this.identifyKnowledgeGaps(analysis, agentResponses);

    return analysis;
  }

  /**
   * Extrai insights de uma resposta individual
   */
  extractInsights(response, analysis) {
    const content = response.content || response.text || '';
    const agent = response.agent || response.specialist;
    
    if (!content || !agent) return;

    // Identificar menções a tecnologias
    const technologies = this.extractTechnologies(content);
    technologies.forEach(tech => {
      this.addToExpertRecommendations(analysis, 'technologies', tech, agent);
    });

    // Identificar preocupações
    const concerns = this.extractConcerns(content);
    concerns.forEach(concern => {
      analysis.technicalConcerns.push({
        concern,
        agent: agent.name,
        expertise: agent.role
      });
    });

    // Identificar oportunidades
    const opportunities = this.extractOpportunities(content);
    opportunities.forEach(opp => {
      analysis.creativeOpportunities.push({
        opportunity: opp,
        agent: agent.name,
        expertise: agent.role
      });
    });

    // Identificar recomendações específicas
    const recommendations = this.extractRecommendations(content);
    recommendations.forEach(rec => {
      this.addToExpertRecommendations(analysis, 'approaches', rec, agent);
    });

    // Identificar questões em aberto
    const questions = this.extractQuestions(content);
    questions.forEach(q => {
      analysis.knowledgeGaps.push({
        question: q,
        raisedBy: agent.name,
        expertise: agent.role
      });
    });
  }

  /**
   * Extrai tecnologias mencionadas
   */
  extractTechnologies(content) {
    const technologies = [];
    const techPatterns = [
      /\b(React|Vue|Angular|Svelte)\b/gi,
      /\b(Node\.js|Express|FastAPI|Django)\b/gi,
      /\b(MongoDB|PostgreSQL|MySQL|Redis)\b/gi,
      /\b(AWS|Azure|GCP|Vercel)\b/gi,
      /\b(TypeScript|JavaScript|Python|Go|Rust)\b/gi,
      /\b(Docker|Kubernetes|CI\/CD)\b/gi,
      /\b(GraphQL|REST|WebSocket|gRPC)\b/gi,
      /\b(Phaser|Unity|Godot|Unreal)\b/gi,
      /\b(TensorFlow|PyTorch|scikit-learn)\b/gi,
      /\b(Blockchain|Smart Contract|Web3)\b/gi
    ];

    techPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        technologies.push(...matches);
      }
    });

    return [...new Set(technologies)];
  }

  /**
   * Extrai preocupações técnicas
   */
  extractConcerns(content) {
    const concerns = [];
    const concernPatterns = [
      /(?:concern|preocupa[çc][aã]o|risco|problema|desafio|dificuldade)[^.]*?[:]\s*([^.]+)/gi,
      /(?:cuidado com|aten[çc][aã]o [aà]|importante considerar)\s*([^.]+)/gi,
      /(?:pode ser|talvez seja)\s*(?:dif[ií]cil|complexo|problem[aá]tico)\s*([^.]+)/gi
    ];

    concernPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1]) {
          concerns.push(match[1].trim());
        }
      });
    });

    return concerns;
  }

  /**
   * Extrai oportunidades
   */
  extractOpportunities(content) {
    const opportunities = [];
    const oppPatterns = [
      /(?:oportunidade|potencial|possibilidade)[^.]*?[:]\s*([^.]+)/gi,
      /(?:poder[ií]amos?|seria interessante|vale considerar)\s*([^.]+)/gi,
      /(?:inova[çc][aã]o|diferencial|vantagem)\s*(?:seria?|[eé])\s*([^.]+)/gi
    ];

    oppPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1]) {
          opportunities.push(match[1].trim());
        }
      });
    });

    return opportunities;
  }

  /**
   * Extrai recomendações
   */
  extractRecommendations(content) {
    const recommendations = [];
    const recPatterns = [
      /(?:recomendo|sugiro|aconselho)\s*([^.]+)/gi,
      /(?:melhor op[çc][aã]o|ideal seria?)\s*([^.]+)/gi,
      /(?:deve(?:ria)?|precisa)\s*([^.]+)/gi
    ];

    recPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1]) {
          recommendations.push(match[1].trim());
        }
      });
    });

    return recommendations;
  }

  /**
   * Extrai questões em aberto
   */
  extractQuestions(content) {
    const questions = [];
    const questionPatterns = [
      /(?:precisa(?:mos)? (?:saber|definir|entender))\s*([^.?]+)/gi,
      /(?:n[aã]o est[aá] claro|falta definir)\s*([^.?]+)/gi,
      /(?:qual|como|quando|onde|por que|quem)[^?]*\?/gi
    ];

    questionPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        const question = match[1] || match[0];
        if (question) {
          questions.push(question.trim());
        }
      });
    });

    return questions;
  }

  /**
   * Adiciona recomendação de especialista
   */
  addToExpertRecommendations(analysis, category, item, agent) {
    const key = `${category}:${item.toLowerCase()}`;
    
    if (!analysis.expertRecommendations.has(key)) {
      analysis.expertRecommendations.set(key, {
        category,
        item,
        recommendedBy: [],
        count: 0
      });
    }
    
    const rec = analysis.expertRecommendations.get(key);
    rec.recommendedBy.push({
      agent: agent.name,
      role: agent.role
    });
    rec.count++;
  }

  /**
   * Identifica pontos de consenso e divergência
   */
  identifyConsensusAndDivergence(analysis) {
    // Analisar recomendações dos especialistas
    const totalAgents = analysis.totalAgents;
    
    analysis.expertRecommendations.forEach((rec, key) => {
      const agreementRatio = rec.count / totalAgents;
      
      if (agreementRatio >= this.consensusThreshold) {
        analysis.consensusPoints.push({
          point: `${rec.category}: ${rec.item}`,
          agreement: Math.round(agreementRatio * 100),
          supportedBy: rec.recommendedBy
        });
      } else if (agreementRatio <= this.divergenceThreshold && rec.count > 1) {
        analysis.divergencePoints.push({
          point: `${rec.category}: ${rec.item}`,
          agreement: Math.round(agreementRatio * 100),
          supporters: rec.recommendedBy
        });
      }
    });

    // Ordenar por nível de concordância
    analysis.consensusPoints.sort((a, b) => b.agreement - a.agreement);
    analysis.divergencePoints.sort((a, b) => a.agreement - b.agreement);
  }

  /**
   * Identifica decisões críticas que precisam de esclarecimento
   */
  identifyCriticalDecisions(analysis, userInput) {
    const criticalAreas = [
      'arquitetura',
      'stack tecnológica',
      'escalabilidade',
      'segurança',
      'monetização',
      'plataforma',
      'público-alvo',
      'prazo',
      'orçamento'
    ];

    // Verificar quais áreas críticas foram mencionadas mas não definidas
    criticalAreas.forEach(area => {
      const mentioned = analysis.technicalConcerns.some(c => 
        c.concern.toLowerCase().includes(area)
      ) || analysis.knowledgeGaps.some(g => 
        g.question.toLowerCase().includes(area)
      );

      const defined = userInput.toLowerCase().includes(area);

      if (mentioned && !defined) {
        analysis.criticalDecisions.push({
          area,
          reason: 'Mencionado por especialistas mas não definido',
          priority: 'high'
        });
      }
    });

    // Adicionar decisões baseadas em divergências significativas
    analysis.divergencePoints.forEach(div => {
      if (div.supporters.length >= 3) {
        analysis.criticalDecisions.push({
          area: div.point,
          reason: 'Especialistas têm opiniões divergentes',
          priority: 'medium',
          requiresClarification: true
        });
      }
    });
  }

  /**
   * Identifica gaps de conhecimento
   */
  identifyKnowledgeGaps(analysis, agentResponses) {
    // Consolidar questões únicas
    const uniqueQuestions = new Map();
    
    analysis.knowledgeGaps.forEach(gap => {
      const key = this.normalizeQuestion(gap.question);
      if (!uniqueQuestions.has(key)) {
        uniqueQuestions.set(key, {
          question: gap.question,
          askedBy: [gap.raisedBy],
          expertise: [gap.expertise]
        });
      } else {
        const existing = uniqueQuestions.get(key);
        existing.askedBy.push(gap.raisedBy);
        existing.expertise.push(gap.expertise);
      }
    });

    // Priorizar questões perguntadas por múltiplos agentes
    analysis.knowledgeGaps = Array.from(uniqueQuestions.values())
      .sort((a, b) => b.askedBy.length - a.askedBy.length)
      .slice(0, 10); // Top 10 gaps
  }

  /**
   * Normaliza questão para comparação
   */
  normalizeQuestion(question) {
    return question
      .toLowerCase()
      .replace(/[?.,!]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Gera resumo executivo da análise
   */
  generateExecutiveSummary(analysis) {
    return {
      strongConsensus: analysis.consensusPoints.filter(p => p.agreement >= 80),
      majorDivergences: analysis.divergencePoints.filter(p => p.supporters.length >= 3),
      topConcerns: analysis.technicalConcerns.slice(0, 5),
      topOpportunities: analysis.creativeOpportunities.slice(0, 5),
      criticalQuestions: analysis.knowledgeGaps.slice(0, 5),
      urgentDecisions: analysis.criticalDecisions.filter(d => d.priority === 'high')
    };
  }
}

export default new AgentInsightsAnalyzer();