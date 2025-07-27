/**
 * ConsensusService - Meta-Agente Sintetizador
 * 
 * Responsável por:
 * 1. Agregar respostas similares
 * 2. Identificar consenso e divergências
 * 3. Criar síntese executiva
 * 4. Priorizar informações por relevância
 */

class ConsensusService {
  constructor() {
    this.similarityThreshold = 0.85; // 85% de similaridade para agrupar
    this.minConsensusThreshold = 0.7; // 70% para considerar consenso
  }

  /**
   * Processa todas as respostas dos agentes e retorna síntese
   */
  async processResponses(responses) {
    if (!responses || responses.length === 0) {
      return this.getEmptyResponse();
    }

    // 1. Agrupar respostas similares
    const clusters = await this.clusterResponses(responses);
    
    // 2. Identificar pontos de consenso e divergência
    const analysis = this.analyzeConsensus(clusters);
    
    // 3. Extrair trade-offs principais
    const tradeoffs = this.extractTradeoffs(clusters, analysis);
    
    // 4. Gerar síntese executiva
    const synthesis = this.generateSynthesis(analysis, tradeoffs);
    
    // 5. Calcular métricas de confiança
    const confidence = this.calculateConfidence(clusters, analysis);

    return {
      synthesis,
      tradeoffs,
      consensus: analysis.consensus,
      divergences: analysis.divergences,
      confidence,
      clusters,
      metadata: {
        totalResponses: responses.length,
        clustersFound: clusters.length,
        processingTime: new Date().toISOString(),
        consensusLevel: analysis.consensusLevel
      }
    };
  }

  /**
   * Agrupa respostas semanticamente similares
   */
  async clusterResponses(responses) {
    const clusters = [];
    
    for (const response of responses) {
      let addedToCluster = false;
      
      // Tenta adicionar a um cluster existente
      for (const cluster of clusters) {
        const similarity = this.calculateSimilarity(
          response.content, 
          cluster.representative
        );
        
        if (similarity >= this.similarityThreshold) {
          cluster.responses.push(response);
          cluster.agents.push(response.agent);
          addedToCluster = true;
          break;
        }
      }
      
      // Se não encontrou cluster similar, cria um novo
      if (!addedToCluster) {
        clusters.push({
          id: `cluster_${clusters.length + 1}`,
          representative: response.content,
          responses: [response],
          agents: [response.agent],
          theme: this.extractTheme(response.content),
          weight: 1
        });
      }
    }
    
    // Calcula peso de cada cluster
    clusters.forEach(cluster => {
      cluster.weight = cluster.responses.length / responses.length;
    });
    
    // Ordena por peso (mais respostas primeiro)
    return clusters.sort((a, b) => b.weight - a.weight);
  }

  /**
   * Analisa consenso e divergências entre clusters
   */
  analyzeConsensus(clusters) {
    const totalResponses = clusters.reduce((sum, c) => sum + c.responses.length, 0);
    const consensusThreshold = totalResponses * this.minConsensusThreshold;
    
    const consensus = [];
    const divergences = [];
    
    clusters.forEach(cluster => {
      if (cluster.responses.length >= consensusThreshold) {
        consensus.push({
          theme: cluster.theme,
          support: cluster.weight,
          agents: cluster.agents
        });
      } else if (cluster.weight > 0.1) { // Mais de 10% mas menos que consenso
        divergences.push({
          theme: cluster.theme,
          support: cluster.weight,
          agents: cluster.agents
        });
      }
    });
    
    const consensusLevel = consensus.length > 0 
      ? consensus[0].support 
      : 0;
    
    return {
      consensus,
      divergences,
      consensusLevel
    };
  }

  /**
   * Extrai os principais trade-offs das opções
   */
  extractTradeoffs(clusters, analysis) {
    const tradeoffs = [];
    
    // Se houver consenso forte, primeiro trade-off é seguir ou não o consenso
    if (analysis.consensusLevel > 0.7) {
      tradeoffs.push({
        id: 'consensus_vs_innovation',
        option1: {
          name: 'Seguir Consenso',
          pros: ['Menor risco', 'Validado pela maioria', 'Implementação mais rápida'],
          cons: ['Pode ser convencional', 'Menor potencial de inovação'],
          supportLevel: analysis.consensusLevel
        },
        option2: {
          name: 'Explorar Alternativas',
          pros: ['Potencial inovador', 'Diferenciação', 'Pode descobrir solução superior'],
          cons: ['Maior risco', 'Menos validação', 'Implementação mais complexa'],
          supportLevel: 1 - analysis.consensusLevel
        }
      });
    }
    
    // Analisa divergências principais para outros trade-offs
    if (analysis.divergences.length >= 2) {
      const top2 = analysis.divergences.slice(0, 2);
      tradeoffs.push({
        id: 'divergence_tradeoff',
        option1: {
          name: this.simplifyTheme(top2[0].theme),
          pros: this.extractPros(top2[0]),
          cons: this.extractCons(top2[0]),
          supportLevel: top2[0].support
        },
        option2: {
          name: this.simplifyTheme(top2[1].theme),
          pros: this.extractPros(top2[1]),
          cons: this.extractCons(top2[1]),
          supportLevel: top2[1].support
        }
      });
    }
    
    return tradeoffs;
  }

  /**
   * Gera síntese executiva final
   */
  generateSynthesis(analysis, tradeoffs) {
    let synthesis = {
      executive_summary: '',
      key_recommendation: '',
      critical_considerations: [],
      confidence_level: ''
    };
    
    // Resumo executivo
    if (analysis.consensusLevel > 0.8) {
      synthesis.executive_summary = `Há um forte consenso (${Math.round(analysis.consensusLevel * 100)}%) entre os especialistas sobre a melhor abordagem. ${analysis.consensus[0].theme}`;
      synthesis.confidence_level = 'Alta';
    } else if (analysis.consensusLevel > 0.5) {
      synthesis.executive_summary = `Existe um consenso moderado (${Math.round(analysis.consensusLevel * 100)}%) com algumas perspectivas divergentes importantes a considerar.`;
      synthesis.confidence_level = 'Moderada';
    } else {
      synthesis.executive_summary = 'Não há consenso claro. Os especialistas apresentam múltiplas abordagens válidas com trade-offs significativos.';
      synthesis.confidence_level = 'Baixa';
    }
    
    // Recomendação principal
    if (analysis.consensus.length > 0) {
      synthesis.key_recommendation = analysis.consensus[0].theme;
    } else {
      synthesis.key_recommendation = 'Avaliar cuidadosamente os trade-offs apresentados antes de decidir.';
    }
    
    // Considerações críticas
    analysis.divergences.slice(0, 3).forEach(div => {
      synthesis.critical_considerations.push(div.theme);
    });
    
    return synthesis;
  }

  /**
   * Calcula similaridade entre dois textos (simplificado)
   */
  calculateSimilarity(text1, text2) {
    // Implementação simplificada - em produção usaria embeddings
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Extrai tema principal de um texto
   */
  extractTheme(text) {
    // Simplificado - pega primeira sentença significativa
    const sentences = text.split(/[.!?]+/);
    return sentences[0]?.trim() || text.substring(0, 100) + '...';
  }

  /**
   * Simplifica tema para nome de opção
   */
  simplifyTheme(theme) {
    // Remove detalhes e mantém essência
    return theme.split(',')[0].substring(0, 50);
  }

  /**
   * Extrai prós de uma perspectiva
   */
  extractPros(perspective) {
    // Simplificado - em produção usaria NLP
    return [
      `Apoiado por ${Math.round(perspective.support * 100)}% dos especialistas`,
      'Abordagem validada',
      'Implementação conhecida'
    ];
  }

  /**
   * Extrai contras de uma perspectiva
   */
  extractCons(perspective) {
    return [
      `Apenas ${Math.round(perspective.support * 100)}% de suporte`,
      'Pode ter limitações não exploradas',
      'Requer análise adicional'
    ];
  }

  /**
   * Calcula nível de confiança geral
   */
  calculateConfidence(clusters, analysis) {
    const factors = {
      consensus: analysis.consensusLevel * 0.5,
      coverage: Math.min(clusters.length / 10, 1) * 0.3,
      clarity: (1 - (analysis.divergences.length / 10)) * 0.2
    };
    
    const overall = Object.values(factors).reduce((sum, val) => sum + val, 0);
    
    return {
      overall: Math.round(overall * 100),
      factors,
      interpretation: overall > 0.7 ? 'Alta' : overall > 0.4 ? 'Moderada' : 'Baixa'
    };
  }

  /**
   * Resposta vazia quando não há dados
   */
  getEmptyResponse() {
    return {
      synthesis: {
        executive_summary: 'Nenhuma resposta recebida dos agentes.',
        key_recommendation: 'Aguardando análise dos especialistas.',
        critical_considerations: [],
        confidence_level: 'N/A'
      },
      tradeoffs: [],
      consensus: [],
      divergences: [],
      confidence: {
        overall: 0,
        factors: {},
        interpretation: 'N/A'
      },
      clusters: [],
      metadata: {
        totalResponses: 0,
        clustersFound: 0,
        processingTime: new Date().toISOString(),
        consensusLevel: 0
      }
    };
  }
}

export default ConsensusService;