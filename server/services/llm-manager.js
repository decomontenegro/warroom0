import ClaudeCodeProvider from './claude-code-provider.js';
import GeminiCLIProvider from './gemini-cli-provider.js';
import OpenRouterProvider from './openrouter-provider.js';

/**
 * LLM Manager - Orquestrador central para múltiplos provedores de LLM
 * Gerencia Claude Code, Gemini CLI e OpenRouter para o sistema UltraThink
 */
export class LLMManager {
  constructor() {
    this.providers = {
      claude: null,
      gemini: null,
      openrouter: null
    };
    
    this.initializeProviders();
    
    // Mapeamento de agentes para provedores otimizados
    this.agentModelMapping = {
      // Agentes críticos de arquitetura e estratégia - Claude Opus 4
      'Lead Architect': 'claude',
      'Chief Strategy Officer': 'claude',
      'Innovation Strategist': 'claude',
      'System Architect': 'claude',
      'Solution Architect': 'claude',
      
      // Agentes de desenvolvimento técnico - Gemini 2.5 Pro
      'Frontend Developer': 'gemini',
      'Backend Developer': 'gemini',
      'Full Stack Developer': 'gemini',
      'Mobile Developer': 'gemini',
      'DevOps Engineer': 'gemini',
      'Cloud Architect': 'gemini',
      'Data Engineer': 'gemini',
      'Machine Learning Engineer': 'gemini',
      
      // Agentes de design e UX - Gemini 2.5 Pro (multimodal)
      'UX Designer': 'gemini',
      'UI Designer': 'gemini',
      'Product Designer': 'gemini',
      'Visual Designer': 'gemini',
      
      // Agentes de testes e qualidade - OpenRouter (custo-benefício)
      'QA Engineer': 'openrouter',
      'Test Automation Engineer': 'openrouter',
      'Performance Engineer': 'openrouter',
      'Security Analyst': 'openrouter',
      
      // Default para agentes não mapeados
      'default': 'openrouter'
    };
    
    // Estatísticas de uso
    this.stats = {
      requestCounts: { claude: 0, gemini: 0, openrouter: 0 },
      errorCounts: { claude: 0, gemini: 0, openrouter: 0 },
      avgResponseTimes: { claude: [], gemini: [], openrouter: [] }
    };
    
    // Cache de respostas
    this.responseCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }
  
  async initializeProviders() {
    try {
      // Inicializar Claude Code Provider
      if (process.env.CLAUDE_CODE_API_KEY) {
        this.providers.claude = new ClaudeCodeProvider({
          apiKey: process.env.CLAUDE_CODE_API_KEY
        });
        console.log('✅ Claude Code Provider inicializado');
      }
      
      // Inicializar Gemini CLI Provider
      if (process.env.ENABLE_GEMINI_CLI === 'true') {
        this.providers.gemini = new GeminiCLIProvider({
          cliPath: process.env.GEMINI_CLI_PATH || 'gemini-cli'
        });
        console.log('✅ Gemini CLI Provider inicializado');
      }
      
      // Inicializar OpenRouter Provider (fallback)
      if (process.env.OPENROUTER_API_KEY) {
        this.providers.openrouter = new OpenRouterProvider({
          apiKey: process.env.OPENROUTER_API_KEY,
          model: process.env.OPENROUTER_MODEL
        });
        console.log('✅ OpenRouter Provider inicializado');
      }
    } catch (error) {
      console.error('Erro ao inicializar providers:', error);
    }
  }
  
  /**
   * Consulta um agente usando o provedor otimizado
   */
  async queryAgent(agent, task, context = {}) {
    const startTime = Date.now();
    
    // Verificar cache
    const cacheKey = this.getCacheKey(agent, task, context);
    const cachedResponse = this.getFromCache(cacheKey);
    if (cachedResponse) {
      console.log(`📦 Resposta do cache para ${agent.name}`);
      return cachedResponse;
    }
    
    // Determinar provedor ideal
    const primaryProvider = this.getProviderForAgent(agent);
    
    try {
      // Tentar com o provedor principal
      const response = await this.queryWithProvider(primaryProvider, agent, task, context);
      
      // Atualizar estatísticas
      this.updateStats(primaryProvider, startTime, true);
      
      // Cachear resposta
      this.cacheResponse(cacheKey, response);
      
      return response;
    } catch (error) {
      console.error(`Erro com ${primaryProvider} para ${agent.name}:`, error.message);
      this.updateStats(primaryProvider, startTime, false);
      
      // Tentar fallback
      return await this.fallbackQuery(agent, task, context, primaryProvider);
    }
  }
  
  /**
   * Consulta com um provedor específico
   */
  async queryWithProvider(providerName, agent, task, context) {
    const provider = this.providers[providerName];
    
    if (!provider) {
      throw new Error(`Provider ${providerName} não está disponível`);
    }
    
    console.log(`🤖 Consultando ${agent.name} via ${providerName}`);
    
    return await provider.query(agent, task, context);
  }
  
  /**
   * Sistema de fallback quando o provedor principal falha
   */
  async fallbackQuery(agent, task, context, failedProvider) {
    const fallbackOrder = this.getFallbackOrder(failedProvider);
    
    for (const providerName of fallbackOrder) {
      if (this.providers[providerName]) {
        try {
          console.log(`🔄 Tentando fallback com ${providerName}`);
          const response = await this.queryWithProvider(providerName, agent, task, context);
          this.stats.requestCounts[providerName]++;
          return response;
        } catch (error) {
          console.error(`Fallback ${providerName} falhou:`, error.message);
          this.stats.errorCounts[providerName]++;
        }
      }
    }
    
    // Se todos falharem, usar resposta mock inteligente
    return this.getMockResponse(agent, task, context);
  }
  
  /**
   * Determina o provedor ideal para um agente
   */
  getProviderForAgent(agent) {
    // Verificar mapeamento específico
    const mapping = this.agentModelMapping[agent.name] || 
                   this.agentModelMapping[agent.role] || 
                   this.agentModelMapping.default;
    
    // Verificar disponibilidade do provedor
    if (this.providers[mapping]) {
      return mapping;
    }
    
    // Fallback para OpenRouter
    return 'openrouter';
  }
  
  /**
   * Ordem de fallback baseada no provedor que falhou
   */
  getFallbackOrder(failedProvider) {
    const orders = {
      claude: ['gemini', 'openrouter'],
      gemini: ['claude', 'openrouter'],
      openrouter: ['claude', 'gemini']
    };
    
    return orders[failedProvider] || ['openrouter'];
  }
  
  /**
   * Execução em lote para múltiplos agentes
   */
  async batchQuery(agents, task, context) {
    // Agrupar agentes por provedor
    const agentsByProvider = {};
    
    for (const agent of agents) {
      const provider = this.getProviderForAgent(agent);
      if (!agentsByProvider[provider]) {
        agentsByProvider[provider] = [];
      }
      agentsByProvider[provider].push(agent);
    }
    
    // Executar em paralelo por provedor
    const promises = [];
    
    for (const [provider, providerAgents] of Object.entries(agentsByProvider)) {
      if (this.providers[provider] && this.providers[provider].batchQuery) {
        // Se o provedor suporta batch
        promises.push(this.providers[provider].batchQuery(providerAgents, task, context));
      } else {
        // Caso contrário, executar individualmente em paralelo
        for (const agent of providerAgents) {
          promises.push(this.queryAgent(agent, task, context));
        }
      }
    }
    
    return await Promise.all(promises);
  }
  
  /**
   * Cache de respostas
   */
  getCacheKey(agent, task, context) {
    return `${agent.id}-${task}-${JSON.stringify(context)}`.substring(0, 100);
  }
  
  getFromCache(key) {
    const cached = this.responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.response;
    }
    return null;
  }
  
  cacheResponse(key, response) {
    this.responseCache.set(key, {
      response,
      timestamp: Date.now()
    });
    
    // Limpar cache antigo
    if (this.responseCache.size > 100) {
      const oldestKey = this.responseCache.keys().next().value;
      this.responseCache.delete(oldestKey);
    }
  }
  
  /**
   * Estatísticas e monitoramento
   */
  updateStats(provider, startTime, success) {
    const responseTime = Date.now() - startTime;
    
    if (success) {
      this.stats.requestCounts[provider]++;
      this.stats.avgResponseTimes[provider].push(responseTime);
      
      // Manter apenas últimas 100 medições
      if (this.stats.avgResponseTimes[provider].length > 100) {
        this.stats.avgResponseTimes[provider].shift();
      }
    } else {
      this.stats.errorCounts[provider]++;
    }
  }
  
  getStats() {
    const stats = { ...this.stats };
    
    // Calcular médias
    for (const provider of Object.keys(stats.avgResponseTimes)) {
      const times = stats.avgResponseTimes[provider];
      stats.avgResponseTimes[provider] = times.length > 0 
        ? times.reduce((a, b) => a + b, 0) / times.length 
        : 0;
    }
    
    return stats;
  }
  
  /**
   * Resposta mock inteligente quando todos os provedores falham
   */
  getMockResponse(agent, task, context) {
    const language = context.language || 'pt-BR';
    const responses = {
      'pt-BR': `Como ${agent.name}, analisando "${task}", recomendo uma abordagem estruturada focada em ${agent.capabilities[0]}. [Modo offline - resposta gerada localmente]`,
      'en-US': `As ${agent.name}, analyzing "${task}", I recommend a structured approach focused on ${agent.capabilities[0]}. [Offline mode - locally generated response]`
    };
    
    return {
      content: responses[language] || responses['pt-BR'],
      agent: agent.name,
      provider: 'mock',
      offline: true
    };
  }
  
  /**
   * Configuração dinâmica de providers
   */
  async updateProviderConfig(providerName, config) {
    if (this.providers[providerName]) {
      await this.providers[providerName].updateConfig(config);
      console.log(`✅ Configuração do ${providerName} atualizada`);
    }
  }
  
  /**
   * Health check dos providers
   */
  async healthCheck() {
    const health = {};
    
    for (const [name, provider] of Object.entries(this.providers)) {
      if (provider && provider.healthCheck) {
        try {
          health[name] = await provider.healthCheck();
        } catch (error) {
          health[name] = { status: 'error', message: error.message };
        }
      } else {
        health[name] = { status: 'not_initialized' };
      }
    }
    
    return health;
  }
}

export default LLMManager;