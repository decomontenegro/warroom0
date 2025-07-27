/**
 * Enhanced Prompt Consolidator
 * Consolida todas as respostas dos agentes e respostas do usuário em um prompt rico
 */

import agentInsightsAnalyzer from './agent-insights-analyzer.js';

export class EnhancedPromptConsolidator {
  constructor() {
    this.maxPromptLength = 8000; // Limite para evitar prompts muito longos
  }

  /**
   * Consolida tudo em um prompt enhanced final
   */
  consolidatePrompt(originalPrompt, agentResponses, userAnswers, questions) {
    // Analisar insights dos agentes
    const analysis = agentInsightsAnalyzer.analyzeAgentResponses(agentResponses, originalPrompt);
    const summary = agentInsightsAnalyzer.generateExecutiveSummary(analysis);
    
    // Estruturar o prompt consolidado
    const sections = [];
    
    // 1. Prompt original refinado
    sections.push(this.buildRefinedPromptSection(originalPrompt, userAnswers, questions));
    
    // 2. Consenso dos especialistas
    sections.push(this.buildConsensusSection(summary.strongConsensus, analysis.totalAgents));
    
    // 3. Insights técnicos detalhados
    sections.push(this.buildTechnicalInsightsSection(analysis));
    
    // 4. Preocupações e mitigações
    sections.push(this.buildConcernsSection(summary.topConcerns, userAnswers));
    
    // 5. Oportunidades estratégicas
    sections.push(this.buildOpportunitiesSection(summary.topOpportunities));
    
    // 6. Decisões tomadas pelo usuário
    sections.push(this.buildUserDecisionsSection(userAnswers, questions));
    
    // 7. Roadmap consolidado
    sections.push(this.buildConsolidatedRoadmap(analysis, userAnswers));
    
    // 8. Métricas de sucesso
    sections.push(this.buildSuccessMetricsSection(analysis, userAnswers));
    
    // Juntar todas as seções
    const consolidatedPrompt = sections
      .filter(section => section && section.trim())
      .join('\n\n---\n\n');
    
    // Garantir que não exceda o limite
    return this.optimizePromptLength(consolidatedPrompt);
  }

  /**
   * Constrói seção do prompt refinado
   */
  buildRefinedPromptSection(originalPrompt, userAnswers, questions) {
    let refined = `# 🎯 OBJETIVO PRINCIPAL\n\n${originalPrompt}`;
    
    // Adicionar contexto das respostas do usuário
    const contextAnswers = [];
    questions.forEach(q => {
      if (userAnswers[q.id]) {
        contextAnswers.push(`**${q.text}**\n→ ${userAnswers[q.id]}`);
      }
    });
    
    if (contextAnswers.length > 0) {
      refined += `\n\n## 📋 Contexto Específico\n\n${contextAnswers.join('\n\n')}`;
    }
    
    return refined;
  }

  /**
   * Constrói seção de consenso
   */
  buildConsensusSection(strongConsensus, totalAgents) {
    if (!strongConsensus || strongConsensus.length === 0) {
      return '';
    }
    
    let section = `# 🤝 CONSENSO DOS ${totalAgents} ESPECIALISTAS\n\n`;
    section += `Os seguintes pontos tiveram forte concordância entre os especialistas:\n\n`;
    
    strongConsensus.forEach(consensus => {
      section += `### ${consensus.point}\n`;
      section += `- **${consensus.agreement}%** dos especialistas concordam\n`;
      section += `- Apoiado por: ${consensus.supportedBy.slice(0, 5).map(s => s.agent).join(', ')}`;
      if (consensus.supportedBy.length > 5) {
        section += ` e mais ${consensus.supportedBy.length - 5} especialistas`;
      }
      section += '\n\n';
    });
    
    return section;
  }

  /**
   * Constrói seção de insights técnicos
   */
  buildTechnicalInsightsSection(analysis) {
    let section = `# 💡 INSIGHTS TÉCNICOS CONSOLIDADOS\n\n`;
    
    // Agrupar recomendações por categoria
    const techRecommendations = new Map();
    const archRecommendations = new Map();
    const toolRecommendations = new Map();
    
    analysis.expertRecommendations.forEach((rec, key) => {
      if (rec.category === 'technologies' && rec.count >= 2) {
        techRecommendations.set(rec.item, rec);
      } else if (rec.category === 'approaches' && rec.count >= 2) {
        archRecommendations.set(rec.item, rec);
      } else if (rec.category === 'tools' && rec.count >= 2) {
        toolRecommendations.set(rec.item, rec);
      }
    });
    
    // Tecnologias recomendadas
    if (techRecommendations.size > 0) {
      section += `## 🛠️ Stack Tecnológica Recomendada\n\n`;
      const sortedTech = Array.from(techRecommendations.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      sortedTech.forEach(tech => {
        section += `- **${tech.item}** - Recomendado por ${tech.count} especialistas\n`;
        section += `  - Especialistas: ${tech.recommendedBy.slice(0, 3).map(r => r.role).join(', ')}\n`;
      });
      section += '\n';
    }
    
    // Abordagens arquiteturais
    if (archRecommendations.size > 0) {
      section += `## 🏗️ Abordagens Arquiteturais\n\n`;
      Array.from(archRecommendations.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .forEach(approach => {
          section += `- **${approach.item}**\n`;
          section += `  - Apoiado por: ${approach.count} especialistas\n`;
        });
      section += '\n';
    }
    
    return section;
  }

  /**
   * Constrói seção de preocupações
   */
  buildConcernsSection(topConcerns, userAnswers) {
    if (!topConcerns || topConcerns.length === 0) {
      return '';
    }
    
    let section = `# ⚠️ PREOCUPAÇÕES E MITIGAÇÕES\n\n`;
    
    topConcerns.forEach((concern, index) => {
      section += `## ${index + 1}. ${concern.concern}\n`;
      section += `- Identificado por: ${concern.agent} (${concern.expertise})\n`;
      
      // Sugerir mitigação baseada no contexto do usuário
      const mitigation = this.suggestMitigation(concern, userAnswers);
      if (mitigation) {
        section += `- **Mitigação sugerida**: ${mitigation}\n`;
      }
      section += '\n';
    });
    
    return section;
  }

  /**
   * Constrói seção de oportunidades
   */
  buildOpportunitiesSection(topOpportunities) {
    if (!topOpportunities || topOpportunities.length === 0) {
      return '';
    }
    
    let section = `# 🚀 OPORTUNIDADES ESTRATÉGICAS\n\n`;
    section += `Os especialistas identificaram as seguintes oportunidades de alto impacto:\n\n`;
    
    topOpportunities.forEach((opp, index) => {
      section += `## ${index + 1}. ${opp.opportunity}\n`;
      section += `- Sugerido por: ${opp.agent} (${opp.expertise})\n`;
      section += `- **Impacto potencial**: Alto\n`;
      section += `- **Complexidade**: ${this.estimateComplexity(opp.opportunity)}\n\n`;
    });
    
    return section;
  }

  /**
   * Constrói seção de decisões do usuário
   */
  buildUserDecisionsSection(userAnswers, questions) {
    const decisions = [];
    
    questions.forEach(q => {
      if (userAnswers[q.id]) {
        decisions.push({
          area: this.extractDecisionArea(q),
          decision: userAnswers[q.id],
          impact: q.priority
        });
      }
    });
    
    if (decisions.length === 0) return '';
    
    let section = `# 📊 DECISÕES TOMADAS\n\n`;
    
    decisions
      .sort((a, b) => b.impact - a.impact)
      .forEach(decision => {
        section += `- **${decision.area}**: ${decision.decision}\n`;
      });
    
    return section;
  }

  /**
   * Constrói roadmap consolidado
   */
  buildConsolidatedRoadmap(analysis, userAnswers) {
    let section = `# 🗺️ ROADMAP DE IMPLEMENTAÇÃO\n\n`;
    
    // Fase 1: Fundação
    section += `## Fase 1: Fundação (Primeiras 2-4 semanas)\n\n`;
    section += this.buildPhaseDetails('foundation', analysis, userAnswers);
    
    // Fase 2: Desenvolvimento Core
    section += `## Fase 2: Desenvolvimento Core (Mês 2-3)\n\n`;
    section += this.buildPhaseDetails('core', analysis, userAnswers);
    
    // Fase 3: Features Avançadas
    section += `## Fase 3: Features Avançadas (Mês 3-4)\n\n`;
    section += this.buildPhaseDetails('advanced', analysis, userAnswers);
    
    // Fase 4: Otimização e Lançamento
    section += `## Fase 4: Otimização e Lançamento (Mês 4-5)\n\n`;
    section += this.buildPhaseDetails('launch', analysis, userAnswers);
    
    return section;
  }

  /**
   * Constrói detalhes de cada fase
   */
  buildPhaseDetails(phase, analysis, userAnswers) {
    const phaseDetails = {
      foundation: [
        'Setup do ambiente de desenvolvimento',
        'Definição da arquitetura base',
        'Configuração de CI/CD',
        'Estrutura de dados inicial',
        'Protótipo de interface básica'
      ],
      core: [
        'Implementação das funcionalidades principais',
        'Sistema de autenticação e autorização',
        'APIs essenciais',
        'Interface de usuário completa',
        'Testes unitários e integração'
      ],
      advanced: [
        'Features diferenciadas',
        'Otimizações de performance',
        'Integrações com terceiros',
        'Sistema de analytics',
        'Refinamento de UX'
      ],
      launch: [
        'Testes de carga e stress',
        'Documentação completa',
        'Preparação de infraestrutura',
        'Estratégia de lançamento',
        'Monitoramento e observabilidade'
      ]
    };
    
    let details = '';
    const tasks = phaseDetails[phase] || [];
    
    tasks.forEach(task => {
      details += `- [ ] ${task}\n`;
    });
    
    return details + '\n';
  }

  /**
   * Constrói seção de métricas de sucesso
   */
  buildSuccessMetricsSection(analysis, userAnswers) {
    let section = `# 📈 MÉTRICAS DE SUCESSO\n\n`;
    
    // Métricas técnicas
    section += `## Métricas Técnicas\n`;
    section += `- **Performance**: Tempo de resposta < 200ms (P95)\n`;
    section += `- **Disponibilidade**: 99.9% uptime\n`;
    section += `- **Cobertura de testes**: > 80%\n`;
    section += `- **Débito técnico**: Manter baixo com refatorações regulares\n\n`;
    
    // Métricas de negócio (baseadas nas respostas do usuário)
    section += `## Métricas de Negócio\n`;
    
    if (userAnswers.monetization_strategy) {
      section += `- **Modelo de monetização**: ${userAnswers.monetization_strategy}\n`;
    }
    
    if (userAnswers.users_scale) {
      section += `- **Escala de usuários**: ${userAnswers.users_scale}\n`;
    }
    
    section += `- **Satisfação do usuário**: NPS > 50\n`;
    section += `- **Taxa de retenção**: > 40% após 30 dias\n`;
    
    return section;
  }

  /**
   * Helpers
   */
  suggestMitigation(concern, userAnswers) {
    const concernLower = concern.concern.toLowerCase();
    
    if (concernLower.includes('segurança') || concernLower.includes('security')) {
      return 'Implementar práticas de segurança desde o início: HTTPS, autenticação robusta, validação de inputs, e auditoria regular';
    }
    
    if (concernLower.includes('escala') || concernLower.includes('scale')) {
      return 'Arquitetura preparada para escala: cache distribuído, microserviços quando necessário, e monitoramento proativo';
    }
    
    if (concernLower.includes('complexidade')) {
      return 'Começar simples e iterar: MVP focado, documentação clara, e refatoração contínua';
    }
    
    return null;
  }

  estimateComplexity(opportunity) {
    const oppLower = opportunity.toLowerCase();
    
    if (oppLower.includes('simples') || oppLower.includes('básico')) {
      return 'Baixa';
    }
    
    if (oppLower.includes('avançado') || oppLower.includes('complexo')) {
      return 'Alta';
    }
    
    return 'Média';
  }

  extractDecisionArea(question) {
    const id = question.id;
    const text = question.text;
    
    // Mapear IDs conhecidos
    const areaMap = {
      'platform': 'Plataforma',
      'architecture_preference': 'Arquitetura',
      'monetization_strategy': 'Monetização',
      'tech_preference': 'Tecnologia',
      'platform_priority': 'Prioridade de Plataforma',
      'team_size': 'Tamanho da Equipe',
      'timeline': 'Prazo',
      'budget_range': 'Orçamento'
    };
    
    return areaMap[id] || text.split('?')[0].trim();
  }

  optimizePromptLength(prompt) {
    if (prompt.length <= this.maxPromptLength) {
      return prompt;
    }
    
    // Se muito longo, priorizar seções mais importantes
    const sections = prompt.split('\n\n---\n\n');
    const prioritizedSections = sections.slice(0, 6); // Pegar as 6 primeiras seções
    
    return prioritizedSections.join('\n\n---\n\n') + 
           '\n\n---\n\n# 📝 NOTA\n\nPrompt otimizado para tamanho. Informações completas disponíveis mediante solicitação.';
  }
}

export default new EnhancedPromptConsolidator();