import aiService from './ai.js';

/**
 * OpenRouter Provider
 * Wrapper para o serviço AI existente (OpenRouter)
 * Serve como fallback e para agentes auxiliares
 */
export class OpenRouterProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;
    this.model = config.model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';
    this.baseURL = config.baseURL || process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    this.enabled = !!this.apiKey;
    
    // Cache de respostas para economizar
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutos
    
    if (!this.enabled) {
      console.warn('⚠️  OpenRouter Provider desabilitado - API key não configurada');
    }
  }
  
  /**
   * Consulta usando o serviço AI existente
   */
  async query(agent, task, context = {}) {
    if (!this.enabled) {
      throw new Error('OpenRouter Provider não está configurado');
    }
    
    // Verificar cache
    const cacheKey = this.getCacheKey(agent, task);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`📦 Resposta do cache para ${agent.name} (OpenRouter)`);
      return cached;
    }
    
    const messages = this.buildMessages(agent, task, context);
    
    try {
      console.log(`🤖 Consultando ${agent.name} via OpenRouter (${this.model})`);
      
      // Usar o serviço AI existente
      const response = await aiService.chat(messages, {
        temperature: 0.7,
        maxTokens: 2000,
        maxRetries: 2
      });
      
      const result = this.parseResponse(response, agent);
      
      // Cachear resposta
      this.cacheResponse(cacheKey, result);
      
      return result;
      
    } catch (error) {
      console.error(`Erro OpenRouter para ${agent.name}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Constrói mensagens para o chat
   */
  buildMessages(agent, task, context) {
    const language = this.getLanguageInstruction(context.language || 'pt-BR');
    const systemMessage = {
      role: 'system',
      content: `${language}

Você é ${agent.name}, um ${agent.role} especializado.

Suas principais capacidades incluem:
${agent.capabilities.map(cap => `- ${cap}`).join('\n')}

Você faz parte da fase "${context.phase || 'analysis'}" em um workflow colaborativo chamado UltraThink, trabalhando com outros 99 agentes especializados.

Diretrizes:
- Foque em sua área de expertise
- Seja específico e prático em suas recomendações
- Identifique potenciais problemas ou riscos
- Sugira soluções implementáveis
- Considere o trabalho de outras fases quando relevante`
    };
    
    const userMessage = {
      role: 'user',
      content: this.buildPrompt(agent, task, context)
    };
    
    return [systemMessage, userMessage];
  }
  
  /**
   * Constrói o prompt do usuário
   */
  buildPrompt(agent, task, context) {
    let prompt = `Analise a seguinte tarefa: "${task}"`;
    
    if (context.previousPhases && Object.keys(context.previousPhases).length > 0) {
      prompt += `\n\nResumo das fases anteriores:`;
      for (const [phase, data] of Object.entries(context.previousPhases)) {
        if (data.insights && data.insights.length > 0) {
          prompt += `\n- ${phase}: ${data.insights[0].content}`;
        }
      }
    }
    
    prompt += `\n\nForneça sua análise especializada incluindo:
1. Avaliação inicial da tarefa
2. Recomendações específicas baseadas em sua expertise
3. Potenciais desafios ou riscos
4. Próximos passos concretos

Seja direto e focado em resultados práticos.`;
    
    return prompt;
  }
  
  /**
   * Processa a resposta do OpenRouter
   */
  parseResponse(response, agent) {
    // Se a resposta já for um objeto (do mock), usar diretamente
    if (typeof response === 'object' && response.insights) {
      return {
        ...response,
        provider: 'openrouter',
        model: this.model,
        agentId: agent.id,
        agentName: agent.name
      };
    }
    
    // Processar resposta de texto
    const content = typeof response === 'string' ? response : response.content || response.text || '';
    
    return {
      content,
      reasoning: this.extractReasoning(content),
      insights: this.extractInsights(content),
      decisions: this.extractDecisions(content),
      blockers: this.extractBlockers(content),
      confidence: this.calculateConfidence(content),
      provider: 'openrouter',
      model: this.model,
      agentId: agent.id,
      agentName: agent.name
    };
  }
  
  /**
   * Extrai insights da resposta
   */
  extractInsights(content) {
    const insights = [];
    const lines = content.split('\n');
    
    // Procurar por padrões de recomendações
    for (const line of lines) {
      if (line.match(/recomend|suger|importante|deve|precisa/i)) {
        // Limpar marcadores de lista
        const cleanedLine = line.replace(/^[\s\-\*\d\.]+/, '').trim();
        if (cleanedLine.length > 20) {
          insights.push({
            type: 'recommendation',
            content: cleanedLine,
            importance: 0.7
          });
        }
      }
    }
    
    // Se não encontrar insights específicos, pegar pontos principais
    if (insights.length === 0) {
      const numbered = content.match(/\d\.\s*([^.]+)/g);
      if (numbered) {
        numbered.slice(0, 3).forEach(item => {
          insights.push({
            type: 'general',
            content: item.replace(/^\d\.\s*/, ''),
            importance: 0.6
          });
        });
      }
    }
    
    return insights.slice(0, 5);
  }
  
  /**
   * Extrai decisões da resposta
   */
  extractDecisions(content) {
    const decisions = [];
    
    // Procurar menções a escolhas ou decisões
    const decisionPatterns = [
      /(?:escolher|optar|selecionar|decidir|melhor opção):\s*([^.]+)/gi,
      /(?:recomendo usar|sugiro implementar):\s*([^.]+)/gi
    ];
    
    for (const pattern of decisionPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        decisions.push({
          type: 'technical',
          content: match[1].trim(),
          rationale: 'Baseado na análise técnica'
        });
      }
    }
    
    return decisions.slice(0, 3);
  }
  
  /**
   * Extrai blockers da resposta
   */
  extractBlockers(content) {
    const blockers = [];
    
    // Procurar menções a riscos ou problemas
    const lines = content.split('\n');
    const riskKeywords = ['risco', 'problema', 'desafio', 'atenção', 'cuidado', 'bloqueio'];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (riskKeywords.some(keyword => lowerLine.includes(keyword))) {
        blockers.push({
          type: 'identified',
          description: line.trim(),
          severity: this.assessSeverity(line)
        });
      }
    }
    
    return blockers.slice(0, 3);
  }
  
  /**
   * Extrai raciocínio da resposta
   */
  extractReasoning(content) {
    // Procurar primeira frase substancial
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30);
    return sentences[0] || 'Análise baseada nas capacidades do agente';
  }
  
  /**
   * Calcula confiança baseada na resposta
   */
  calculateConfidence(content) {
    let confidence = 0.65; // Base para OpenRouter
    
    // Ajustar baseado no conteúdo
    if (content.length > 500) confidence += 0.1;
    if (content.match(/certeza|definitivamente|claramente/i)) confidence += 0.1;
    if (content.match(/talvez|possivelmente|depende/i)) confidence -= 0.1;
    if (content.includes('risco') || content.includes('problema')) confidence -= 0.05;
    
    return Math.max(0.4, Math.min(0.9, confidence));
  }
  
  /**
   * Avalia severidade de um risco
   */
  assessSeverity(text) {
    if (text.match(/crítico|grave|urgente|bloqueio/i)) return 'high';
    if (text.match(/importante|significativo|atenção/i)) return 'medium';
    return 'low';
  }
  
  /**
   * Instrução de idioma
   */
  getLanguageInstruction(language) {
    const instructions = {
      'pt-BR': 'Responda sempre em português brasileiro.',
      'en-US': 'Always respond in English.',
      'es-ES': 'Responda siempre en español.',
      'fr-FR': 'Répondez toujours en français.',
      'de-DE': 'Antworten Sie immer auf Deutsch.',
      'it-IT': 'Rispondi sempre in italiano.',
      'ja-JP': '常に日本語で返信してください。',
      'zh-CN': '请始终用中文回复。'
    };
    
    return instructions[language] || instructions['pt-BR'];
  }
  
  /**
   * Cache
   */
  getCacheKey(agent, task) {
    return `${this.model}-${agent.id}-${task}`.substring(0, 100);
  }
  
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }
  
  cacheResponse(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Limpar cache antigo
    if (this.cache.size > 50) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
  
  /**
   * Consulta em lote
   */
  async batchQuery(agents, task, context) {
    console.log(`🚀 OpenRouter: Processando ${agents.length} agentes`);
    
    // OpenRouter não tem otimização especial para batch
    // Processar em paralelo com limite
    const batchSize = 3;
    const results = [];
    
    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);
      const promises = batch.map(agent => this.query(agent, task, context));
      
      try {
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
      } catch (error) {
        console.error('Erro no batch:', error);
        // Tentar individualmente em caso de erro
        for (const agent of batch) {
          try {
            const result = await this.query(agent, task, context);
            results.push(result);
          } catch (e) {
            results.push(this.getErrorResponse(agent, e));
          }
        }
      }
      
      // Pausa entre batches
      if (i + batchSize < agents.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }
  
  /**
   * Resposta de erro
   */
  getErrorResponse(agent, error) {
    return {
      content: `Erro ao processar ${agent.name}: ${error.message}`,
      error: true,
      provider: 'openrouter',
      model: this.model,
      agentId: agent.id,
      agentName: agent.name
    };
  }
  
  /**
   * Atualiza configuração
   */
  async updateConfig(config) {
    if (config.apiKey) {
      this.apiKey = config.apiKey;
      this.enabled = true;
      
      // Atualizar no serviço AI também
      process.env.OPENROUTER_API_KEY = config.apiKey;
    }
    
    if (config.model) {
      this.model = config.model;
      process.env.OPENROUTER_MODEL = config.model;
    }
    
    // Limpar cache ao mudar configuração
    this.cache.clear();
    
    console.log('✅ Configuração do OpenRouter Provider atualizada');
  }
  
  /**
   * Health check
   */
  async healthCheck() {
    if (!this.enabled) {
      return {
        status: 'disabled',
        message: 'API key não configurada'
      };
    }
    
    try {
      // Fazer uma consulta simples para verificar
      const testMessages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "OK" if you are working.' }
      ];
      
      const response = await aiService.chat(testMessages, {
        maxTokens: 10,
        temperature: 0
      });
      
      if (response) {
        return {
          status: 'healthy',
          message: 'OpenRouter operacional',
          model: this.model,
          features: ['fallback', 'multi-model', 'caching']
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        model: this.model
      };
    }
  }
  
  /**
   * Estatísticas do cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout,
      entries: Array.from(this.cache.keys())
    };
  }
}

export default OpenRouterProvider;