import { UltrathinkWorkflow } from './ultrathink-workflow.js';
import LLMManager from '../../server/services/llm-manager.js';

/**
 * UltraThink Workflow Multi-LLM
 * Versão aprimorada do UltraThink que usa múltiplos LLMs otimizados por agente
 */
export class UltrathinkWorkflowMultiLLM extends UltrathinkWorkflow {
  constructor() {
    super();
    
    // Verificar se estamos no cliente ou servidor
    this.isClient = typeof window !== 'undefined';
    
    if (!this.isClient) {
      // Só inicializar LLM Manager no servidor
      this.llmManager = new LLMManager();
    }
    
    // Estatísticas por provedor
    this.providerStats = {
      claude: { requests: 0, successes: 0, avgTime: 0 },
      gemini: { requests: 0, successes: 0, avgTime: 0 },
      openrouter: { requests: 0, successes: 0, avgTime: 0 }
    };
    
    // Configuração de distribuição de agentes
    this.agentDistribution = this.setupAgentDistribution();
  }
  
  /**
   * Configura distribuição otimizada de agentes por provedor
   */
  setupAgentDistribution() {
    return {
      // Claude Opus 4 - Agentes críticos e estratégicos
      claude: {
        agents: [1, 2, 3, 20, 21, 31, 32, 49, 50, 69, 70, 91, 92, 93, 94],
        description: 'Arquitetura, estratégia e decisões críticas',
        priority: 1
      },
      
      // Gemini 2.5 Pro - Desenvolvimento e design
      gemini: {
        agents: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 37, 38, 39, 40, 41, 42, 43, 
                58, 59, 60, 61, 62, 71, 72, 73, 74, 75, 76, 77],
        description: 'Desenvolvimento, UX/UI e implementação técnica',
        priority: 2
      },
      
      // OpenRouter - Testes, QA e suporte
      openrouter: {
        agents: [16, 17, 18, 19, 23, 24, 25, 26, 27, 28, 29, 30, 44, 45, 46, 47, 
                48, 51, 52, 53, 54, 55, 56, 57, 63, 64, 65, 66, 67, 68, 78, 79, 
                80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 95, 96, 97, 98, 99, 100],
        description: 'QA, testes, segurança e análises auxiliares',
        priority: 3
      }
    };
  }
  
  /**
   * Executa um agente usando o LLM Manager
   */
  async runAgent(agentId, task, phase, context, previousPhases) {
    const agent = this.agents.find(a => a.id === agentId);
    const startTime = Date.now();
    
    try {
      let response;
      
      if (this.isClient) {
        // No cliente, usar método original
        return await super.runAgent(agentId, task, phase, context, previousPhases);
      }
      
      // No servidor, usar LLM Manager
      console.log(`🎯 Executando ${agent.name} via Multi-LLM`);
      
      response = await this.llmManager.queryAgent(agent, task, {
        ...context,
        phase,
        previousPhases,
        workflowId: context.workflowId
      });
      
      // Atualizar estatísticas
      const provider = this.getProviderForAgent(agentId);
      this.updateProviderStats(provider, startTime, true);
      
      // Formatar resposta para o formato esperado
      return this.formatAgentResponse(agentId, response);
      
    } catch (error) {
      console.error(`Erro ao executar agente ${agent.name}:`, error);
      
      const provider = this.getProviderForAgent(agentId);
      this.updateProviderStats(provider, startTime, false);
      
      // Usar resposta de fallback
      return this.getFallbackResponse(agent, task, phase, context);
    }
  }
  
  /**
   * Executa fase com otimização multi-LLM
   */
  async executePhase(phaseName, task, context, previousPhases) {
    const phase = this.phases[phaseName];
    const phaseAgents = this.selectAgentsForPhase(phaseName, task, context);
    
    console.log(`\n📋 Fase ${phaseName.toUpperCase()} - Multi-LLM`);
    console.log(`👥 ${phaseAgents.length} agentes selecionados`);
    
    // Agrupar agentes por provedor para otimização
    const agentsByProvider = this.groupAgentsByProvider(phaseAgents);
    
    const phaseResult = {
      phase: phaseName,
      description: phase.description,
      agentsUsed: [],
      insights: [],
      decisions: [],
      blockers: [],
      requiresIteration: false,
      confidence: 0,
      providerStats: {}
    };
    
    // Executar em paralelo por provedor
    const providerPromises = [];
    
    for (const [provider, agentIds] of Object.entries(agentsByProvider)) {
      if (agentIds.length > 0) {
        console.log(`  🔸 ${provider}: ${agentIds.length} agentes`);
        providerPromises.push(
          this.executeBatchByProvider(provider, agentIds, task, phaseName, context, previousPhases)
        );
      }
    }
    
    const providerResults = await Promise.all(providerPromises);
    
    // Agregar resultados
    for (const results of providerResults) {
      for (const result of results) {
        phaseResult.agentsUsed.push(result.agentId);
        phaseResult.insights.push(...(result.insights || []));
        phaseResult.decisions.push(...(result.decisions || []));
        phaseResult.blockers.push(...(result.blockers || []));
        phaseResult.confidence += (result.confidence || 0.5);
        
        // Estatísticas por provedor
        const provider = result.provider || 'unknown';
        if (!phaseResult.providerStats[provider]) {
          phaseResult.providerStats[provider] = { count: 0, avgConfidence: 0 };
        }
        phaseResult.providerStats[provider].count++;
        phaseResult.providerStats[provider].avgConfidence += result.confidence || 0.5;
      }
    }
    
    // Calcular médias
    phaseResult.confidence = phaseResult.confidence / phaseResult.agentsUsed.length;
    
    for (const stats of Object.values(phaseResult.providerStats)) {
      if (stats.count > 0) {
        stats.avgConfidence = stats.avgConfidence / stats.count;
      }
    }
    
    // Verificar se precisa iteração
    if (phaseResult.blockers.length > 2 || phaseResult.confidence < 0.6) {
      phaseResult.requiresIteration = true;
    }
    
    return phaseResult;
  }
  
  /**
   * Agrupa agentes por provedor
   */
  groupAgentsByProvider(agentIds) {
    const groups = {
      claude: [],
      gemini: [],
      openrouter: []
    };
    
    for (const agentId of agentIds) {
      const provider = this.getProviderForAgent(agentId);
      groups[provider].push(agentId);
    }
    
    return groups;
  }
  
  /**
   * Determina o provedor para um agente
   */
  getProviderForAgent(agentId) {
    for (const [provider, config] of Object.entries(this.agentDistribution)) {
      if (config.agents.includes(agentId)) {
        return provider;
      }
    }
    return 'openrouter'; // Default
  }
  
  /**
   * Executa batch de agentes por provedor
   */
  async executeBatchByProvider(provider, agentIds, task, phase, context, previousPhases) {
    if (this.isClient) {
      // No cliente, executar individualmente
      const promises = agentIds.map(id => 
        this.runAgent(id, task, phase, context, previousPhases)
      );
      return Promise.all(promises);
    }
    
    // No servidor, tentar batch query se disponível
    const agents = agentIds.map(id => this.agents.find(a => a.id === id));
    
    try {
      if (this.llmManager && this.llmManager.batchQuery) {
        console.log(`  🚀 Batch query para ${provider} com ${agents.length} agentes`);
        
        const results = await this.llmManager.batchQuery(agents, task, {
          ...context,
          phase,
          previousPhases
        });
        
        return results.map((result, index) => 
          this.formatAgentResponse(agentIds[index], result)
        );
      }
    } catch (error) {
      console.warn(`Batch query falhou para ${provider}, executando individualmente`);
    }
    
    // Fallback para execução individual
    const promises = agentIds.map(id => 
      this.runAgent(id, task, phase, context, previousPhases)
    );
    
    return Promise.all(promises);
  }
  
  /**
   * Formata resposta do agente para o formato esperado
   */
  formatAgentResponse(agentId, response) {
    const agent = this.agents.find(a => a.id === agentId);
    
    return {
      agentId,
      agentName: agent.name,
      insights: response.insights || [{
        type: 'analysis',
        content: response.content || '',
        importance: 0.7
      }],
      decisions: response.decisions || [],
      blockers: response.blockers || [],
      confidence: response.confidence || 0.7,
      provider: response.provider,
      model: response.model,
      rawResponse: response.content
    };
  }
  
  /**
   * Resposta de fallback quando LLM falha
   */
  getFallbackResponse(agent, task, phase, context) {
    console.log(`⚠️  Usando resposta fallback para ${agent.name}`);
    
    const language = context.language || 'pt-BR';
    const content = language === 'en-US' 
      ? `As ${agent.name}, I recommend focusing on ${agent.capabilities[0]} for "${task}". [Offline mode]`
      : `Como ${agent.name}, recomendo focar em ${agent.capabilities[0]} para "${task}". [Modo offline]`;
    
    return {
      agentId: agent.id,
      agentName: agent.name,
      insights: [{
        type: 'fallback',
        content,
        importance: 0.5
      }],
      decisions: [],
      blockers: [],
      confidence: 0.5,
      provider: 'fallback',
      offline: true
    };
  }
  
  /**
   * Atualiza estatísticas do provedor
   */
  updateProviderStats(provider, startTime, success) {
    const stats = this.providerStats[provider];
    if (!stats) return;
    
    stats.requests++;
    if (success) {
      stats.successes++;
      const responseTime = Date.now() - startTime;
      stats.avgTime = stats.avgTime === 0 
        ? responseTime 
        : (stats.avgTime * (stats.successes - 1) + responseTime) / stats.successes;
    }
  }
  
  /**
   * Gera relatório final com estatísticas multi-LLM
   */
  generateFinalReport(results) {
    const report = super.generateFinalReport(results);
    
    // Adicionar estatísticas multi-LLM
    report.multiLLMStats = {
      providers: this.providerStats,
      distribution: this.getDistributionStats(results),
      performance: this.getPerformanceComparison()
    };
    
    // Adicionar resumo de uso de LLMs
    const llmSummary = [];
    
    for (const [provider, stats] of Object.entries(this.providerStats)) {
      if (stats.requests > 0) {
        const successRate = (stats.successes / stats.requests * 100).toFixed(1);
        const avgTime = (stats.avgTime / 1000).toFixed(2);
        
        llmSummary.push({
          provider,
          requests: stats.requests,
          successRate: `${successRate}%`,
          avgResponseTime: `${avgTime}s`
        });
      }
    }
    
    report.consensus = `${report.consensus}\n\n## Estatísticas Multi-LLM:\n${
      llmSummary.map(s => 
        `- ${s.provider}: ${s.requests} requests, ${s.successRate} sucesso, ${s.avgResponseTime} tempo médio`
      ).join('\n')
    }`;
    
    return report;
  }
  
  /**
   * Obtém estatísticas de distribuição
   */
  getDistributionStats(results) {
    const stats = {
      byProvider: { claude: 0, gemini: 0, openrouter: 0 },
      byPhase: {}
    };
    
    // Contar agentes por provedor em cada fase
    for (const [phaseName, phaseData] of Object.entries(results.phases)) {
      stats.byPhase[phaseName] = { claude: 0, gemini: 0, openrouter: 0 };
      
      for (const agentId of phaseData.agentsUsed || []) {
        const provider = this.getProviderForAgent(agentId);
        stats.byProvider[provider]++;
        stats.byPhase[phaseName][provider]++;
      }
    }
    
    return stats;
  }
  
  /**
   * Compara performance dos provedores
   */
  getPerformanceComparison() {
    const comparison = [];
    
    for (const [provider, stats] of Object.entries(this.providerStats)) {
      if (stats.requests > 0) {
        comparison.push({
          provider,
          score: this.calculateProviderScore(stats),
          reliability: stats.successes / stats.requests,
          speed: 1 / (stats.avgTime / 1000) // Inverso do tempo em segundos
        });
      }
    }
    
    // Ordenar por score
    comparison.sort((a, b) => b.score - a.score);
    
    return comparison;
  }
  
  /**
   * Calcula score do provedor
   */
  calculateProviderScore(stats) {
    const reliability = stats.successes / stats.requests;
    const speed = Math.min(1, 2000 / stats.avgTime); // Normalizar para 2s ideal
    
    // 70% confiabilidade, 30% velocidade
    return reliability * 0.7 + speed * 0.3;
  }
  
  /**
   * Obtém estatísticas em tempo real
   */
  getRealtimeStats() {
    const stats = {
      providers: this.providerStats,
      distribution: this.agentDistribution,
      health: {}
    };
    
    // Se estiver no servidor, verificar health dos providers
    if (!this.isClient && this.llmManager) {
      stats.health = this.llmManager.getStats();
    }
    
    return stats;
  }
  
  /**
   * Permite reconfigurar distribuição de agentes
   */
  reconfigureAgentDistribution(newDistribution) {
    console.log('📊 Reconfigurando distribuição de agentes');
    this.agentDistribution = {
      ...this.agentDistribution,
      ...newDistribution
    };
  }
  
  /**
   * Otimiza distribuição baseada em performance
   */
  async optimizeDistribution() {
    const performance = this.getPerformanceComparison();
    
    if (performance.length === 0) {
      console.log('Sem dados suficientes para otimização');
      return;
    }
    
    // Redistribuir alguns agentes para o provedor com melhor performance
    const bestProvider = performance[0].provider;
    const worstProvider = performance[performance.length - 1].provider;
    
    if (bestProvider !== worstProvider && performance[0].score > performance[performance.length - 1].score * 1.5) {
      console.log(`🔄 Movendo alguns agentes de ${worstProvider} para ${bestProvider}`);
      
      // Mover 20% dos agentes do pior para o melhor
      const agentsToMove = Math.floor(this.agentDistribution[worstProvider].agents.length * 0.2);
      const movedAgents = this.agentDistribution[worstProvider].agents.splice(0, agentsToMove);
      this.agentDistribution[bestProvider].agents.push(...movedAgents);
      
      console.log(`✅ ${agentsToMove} agentes redistribuídos`);
    }
  }
}

export default UltrathinkWorkflowMultiLLM;