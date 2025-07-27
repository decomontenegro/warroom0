3/**
 * Meta-Agente Sintetizador
 * O 101º agente que processa e sintetiza as respostas dos outros 100
 */

import ConsensusService from './ConsensusService.js';

class MetaAgent {
  constructor() {
    this.consensusService = new ConsensusService();
    this.name = 'Meta-Agent Synthesizer';
    this.role = 'Chief Synthesis Officer';
    this.icon = '🧠';
  }

  /**
   * Processa respostas e retorna análise sintetizada
   */
  async synthesize(query, agentResponses) {
    console.log(`[Meta-Agent] Processando ${agentResponses.length} respostas...`);
    
    try {
      // 1. Usar ConsensusService para análise profunda
      const consensus = await this.consensusService.processResponses(agentResponses);
      
      // 2. Formatar resposta para o usuário
      const userResponse = this.formatUserResponse(query, consensus);
      
      // 3. Preparar dados para UI em camadas
      const layeredData = this.prepareLayeredData(consensus);
      
      return {
        success: true,
        query,
        timestamp: new Date().toISOString(),
        metaAgent: {
          name: this.name,
          role: this.role,
          icon: this.icon
        },
        synthesis: userResponse,
        layers: layeredData,
        raw: consensus,
        metrics: {
          processingTime: Date.now(),
          totalAgents: agentResponses.length,
          clustersFound: consensus.clusters.length,
          consensusLevel: consensus.metadata.consensusLevel,
          confidence: consensus.confidence.overall
        }
      };
    } catch (error) {
      console.error('[Meta-Agent] Erro na síntese:', error);
      return this.getErrorResponse(query, error);
    }
  }

  /**
   * Formata resposta principal para o usuário
   */
  formatUserResponse(query, consensus) {
    const { synthesis, tradeoffs, confidence } = consensus;
    
    return {
      // Resposta principal em um parágrafo claro
      mainResponse: this.createMainResponse(synthesis, confidence),
      
      // Ação recomendada
      recommendedAction: synthesis.key_recommendation,
      
      // Top 3 considerações importantes
      keyConsiderations: synthesis.critical_considerations.slice(0, 3),
      
      // Trade-offs principais (se houver)
      mainTradeoffs: tradeoffs.length > 0 ? this.formatTradeoffs(tradeoffs[0]) : null,
      
      // Nível de confiança visual
      confidenceVisual: this.getConfidenceVisual(confidence.overall),
      
      // Call-to-action para explorar mais
      explorationOptions: this.getExplorationOptions(consensus)
    };
  }

  /**
   * Cria resposta principal concisa
   */
  createMainResponse(synthesis, confidence) {
    const intro = synthesis.executive_summary;
    const conf = `(Confiança: ${confidence.interpretation})`;
    
    return `${intro} ${conf}`;
  }

  /**
   * Formata trade-offs de forma visual
   */
  formatTradeoffs(tradeoff) {
    if (!tradeoff) return null;
    
    return {
      title: 'Principais Opções',
      option1: {
        name: tradeoff.option1.name,
        summary: `✅ ${tradeoff.option1.pros[0]} | ⚠️ ${tradeoff.option1.cons[0]}`,
        support: `${Math.round(tradeoff.option1.supportLevel * 100)}% dos especialistas`
      },
      option2: {
        name: tradeoff.option2.name,
        summary: `✅ ${tradeoff.option2.pros[0]} | ⚠️ ${tradeoff.option2.cons[0]}`,
        support: `${Math.round(tradeoff.option2.supportLevel * 100)}% dos especialistas`
      }
    };
  }

  /**
   * Representação visual do nível de confiança
   */
  getConfidenceVisual(confidenceLevel) {
    const filled = Math.round(confidenceLevel / 10);
    const empty = 10 - filled;
    
    return {
      bar: '█'.repeat(filled) + '░'.repeat(empty),
      percentage: `${confidenceLevel}%`,
      color: confidenceLevel > 70 ? 'green' : confidenceLevel > 40 ? 'yellow' : 'red'
    };
  }

  /**
   * Opções para explorar mais detalhes
   */
  getExplorationOptions(consensus) {
    const options = [];
    
    if (consensus.divergences.length > 0) {
      options.push({
        id: 'view_divergences',
        label: `Ver ${consensus.divergences.length} perspectivas alternativas`,
        icon: '🔍'
      });
    }
    
    if (consensus.clusters.length > 3) {
      options.push({
        id: 'view_all_clusters',
        label: `Explorar todos os ${consensus.clusters.length} grupos de respostas`,
        icon: '📊'
      });
    }
    
    options.push({
      id: 'view_detailed_analysis',
      label: 'Ver análise detalhada completa',
      icon: '📈'
    });
    
    if (consensus.metadata.totalResponses > 20) {
      options.push({
        id: 'view_all_responses',
        label: `Ver todas as ${consensus.metadata.totalResponses} respostas originais`,
        icon: '📝'
      });
    }
    
    return options;
  }

  /**
   * Prepara dados organizados em camadas para a UI
   */
  prepareLayeredData(consensus) {
    return {
      // Camada 1: Essencial (sempre visível)
      layer1_essential: {
        summary: consensus.synthesis.executive_summary,
        recommendation: consensus.synthesis.key_recommendation,
        confidence: consensus.confidence.overall,
        topTradeoff: consensus.tradeoffs[0] || null
      },
      
      // Camada 2: Exploração (expansível)
      layer2_exploration: {
        allTradeoffs: consensus.tradeoffs,
        divergences: consensus.divergences,
        consensusDetails: consensus.consensus,
        confidenceBreakdown: consensus.confidence.factors
      },
      
      // Camada 3: Análise Profunda (modo avançado)
      layer3_deep_analysis: {
        clusters: consensus.clusters,
        metadata: consensus.metadata,
        rawResponses: [] // Será populado sob demanda
      }
    };
  }

  /**
   * Resposta de erro formatada
   */
  getErrorResponse(query, error) {
    return {
      success: false,
      query,
      timestamp: new Date().toISOString(),
      metaAgent: {
        name: this.name,
        role: this.role,
        icon: '❌'
      },
      error: {
        message: 'Não foi possível sintetizar as respostas',
        details: error.message,
        suggestion: 'Tente reformular sua pergunta ou aguarde alguns instantes'
      }
    };
  }

  /**
   * Processa stream de respostas em tempo real
   */
  async *processStream(responseStream) {
    const buffer = [];
    const updateInterval = 5; // Atualiza a cada 5 respostas
    
    for await (const response of responseStream) {
      buffer.push(response);
      
      if (buffer.length % updateInterval === 0) {
        // Envia atualização parcial
        yield {
          type: 'partial_update',
          processedCount: buffer.length,
          currentSynthesis: await this.getPartialSynthesis(buffer)
        };
      }
    }
    
    // Síntese final completa
    const finalSynthesis = await this.synthesize('', buffer);
    yield {
      type: 'final_synthesis',
      data: finalSynthesis
    };
  }

  /**
   * Síntese parcial para atualizações em tempo real
   */
  async getPartialSynthesis(responses) {
    const consensus = await this.consensusService.processResponses(responses);
    
    return {
      currentConsensus: consensus.synthesis.executive_summary,
      processedAgents: responses.length,
      confidenceLevel: consensus.confidence.overall,
      emergingPatterns: consensus.clusters.length
    };
  }
}

export default MetaAgent;