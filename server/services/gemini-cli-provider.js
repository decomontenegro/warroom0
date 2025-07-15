import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Gemini CLI Provider
 * Integração com Google Gemini CLI (gemini-2.5-pro)
 * Oferece 1000 requests/dia grátis com contexto de 1M tokens
 */
export class GeminiCLIProvider {
  constructor(config = {}) {
    this.cliPath = config.cliPath || process.env.GEMINI_CLI_PATH || 'gemini-cli';
    this.model = 'gemini-2.5-pro';
    this.enabled = process.env.ENABLE_GEMINI_CLI === 'true';
    this.tempDir = path.join(os.tmpdir(), 'gemini-cli-temp');
    
    // Limites do plano gratuito
    this.limits = {
      requestsPerMinute: 60,
      requestsPerDay: 1000,
      contextTokens: 1000000
    };
    
    // Controle de rate limiting
    this.requestCounts = {
      minute: { count: 0, resetTime: Date.now() + 60000 },
      day: { count: 0, resetTime: Date.now() + 86400000 }
    };
    
    this.initializeTempDir();
    
    if (!this.enabled) {
      console.warn('⚠️  Gemini CLI Provider desabilitado');
    } else {
      this.checkCLIAvailability();
    }
  }
  
  async initializeTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Erro ao criar diretório temporário:', error);
    }
  }
  
  async checkCLIAvailability() {
    try {
      const { stdout } = await execAsync(`${this.cliPath} --version`);
      console.log(`✅ Gemini CLI disponível: ${stdout.trim()}`);
      this.enabled = true;
    } catch (error) {
      console.error('❌ Gemini CLI não encontrado. Instale com: curl -sSL https://cli.gemini.dev/install.sh | bash');
      this.enabled = false;
    }
  }
  
  /**
   * Consulta o Gemini CLI com um agente específico
   */
  async query(agent, task, context = {}) {
    if (!this.enabled) {
      throw new Error('Gemini CLI não está disponível');
    }
    
    // Verificar rate limits
    await this.checkRateLimits();
    
    const prompt = this.buildPrompt(agent, task, context);
    
    try {
      // Opção 1: Usar modo não-interativo com prompt direto
      const response = await this.executeDirectPrompt(prompt, context);
      
      // Incrementar contadores
      this.incrementRequestCount();
      
      return this.parseResponse(response, agent);
      
    } catch (error) {
      console.error('Erro ao consultar Gemini CLI:', error);
      
      // Tentar método alternativo via arquivo
      if (error.message.includes('argument list too long')) {
        return await this.executeViaFile(prompt, context, agent);
      }
      
      throw error;
    }
  }
  
  /**
   * Executa prompt direto via CLI
   */
  async executeDirectPrompt(prompt, context) {
    const language = context.language || 'pt-BR';
    const systemContext = context.systemPrompt || '';
    
    // Construir comando com flags apropriadas
    const flags = [
      '--model', this.model,
      '--json', // Retornar resposta em JSON
      '--non-interactive', // Modo não-interativo
      '--temperature', '0.7'
    ];
    
    // Se houver contexto de sistema, adicionar
    if (systemContext) {
      flags.push('--system', `"${systemContext}"`);
    }
    
    // Escapar prompt para shell
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    
    const command = `${this.cliPath} prompt "${escapedPrompt}" ${flags.join(' ')}`;
    
    console.log(`🤖 Executando Gemini CLI para análise...`);
    
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 30000 // 30 segundos
    });
    
    if (stderr) {
      console.warn('Gemini CLI stderr:', stderr);
    }
    
    return stdout;
  }
  
  /**
   * Executa via arquivo para prompts grandes
   */
  async executeViaFile(prompt, context, agent) {
    const promptFile = path.join(this.tempDir, `prompt-${Date.now()}.txt`);
    
    try {
      // Escrever prompt em arquivo
      await fs.writeFile(promptFile, prompt, 'utf8');
      
      // Executar com arquivo
      const flags = [
        '--model', this.model,
        '--json',
        '--non-interactive',
        '--file', promptFile
      ];
      
      const command = `${this.cliPath} ${flags.join(' ')}`;
      
      const { stdout } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000
      });
      
      return stdout;
      
    } finally {
      // Limpar arquivo temporário
      try {
        await fs.unlink(promptFile);
      } catch (e) {
        // Ignorar erro de limpeza
      }
    }
  }
  
  /**
   * Constrói o prompt para o Gemini
   */
  buildPrompt(agent, task, context) {
    const language = this.getLanguageInstruction(context.language || 'pt-BR');
    const previousContext = context.previousPhases 
      ? `\n\nContexto das fases anteriores:\n${this.summarizePreviousPhases(context.previousPhases)}`
      : '';
    
    return `${language}

Você é ${agent.name}, um ${agent.role} especializado.

Suas capacidades principais incluem:
${agent.capabilities.map((cap, i) => `${i + 1}. ${cap}`).join('\n')}

TAREFA: ${task}

Analise esta tarefa considerando sua expertise e forneça:

1. **Análise Técnica Detalhada**
   - Avalie os aspectos técnicos relevantes
   - Identifique componentes e dependências
   - Considere arquitetura e design

2. **Recomendações Práticas**
   - Sugira abordagens concretas
   - Proponha ferramentas e tecnologias
   - Defina métricas de sucesso

3. **Riscos e Mitigações**
   - Liste potenciais problemas
   - Sugira estratégias de mitigação
   - Identifique dependências críticas

4. **Plano de Ação**
   - Defina próximos passos claros
   - Estabeleça prioridades
   - Sugira timeline realista${previousContext}

Forneça uma análise profunda e acionável baseada em sua experiência.`;
  }
  
  /**
   * Resume fases anteriores para não exceder limite de contexto
   */
  summarizePreviousPhases(phases) {
    const summary = [];
    
    for (const [phaseName, phaseData] of Object.entries(phases)) {
      if (phaseData.insights && phaseData.insights.length > 0) {
        summary.push(`${phaseName}: ${phaseData.insights[0].content}`);
      }
    }
    
    return summary.slice(-5).join('\n'); // Últimas 5 fases
  }
  
  /**
   * Processa a resposta do Gemini CLI
   */
  parseResponse(response, agent) {
    try {
      // Tentar parsear como JSON primeiro
      const jsonResponse = JSON.parse(response);
      
      return {
        content: jsonResponse.response || jsonResponse.text || jsonResponse.content,
        reasoning: jsonResponse.reasoning || this.extractReasoning(jsonResponse.response),
        insights: this.extractInsights(jsonResponse.response || jsonResponse.text),
        decisions: this.extractDecisions(jsonResponse.response || jsonResponse.text),
        blockers: this.extractBlockers(jsonResponse.response || jsonResponse.text),
        confidence: jsonResponse.confidence || this.calculateConfidence(jsonResponse.response),
        provider: 'gemini',
        model: this.model,
        usage: jsonResponse.usage || null
      };
      
    } catch (error) {
      // Se não for JSON, processar como texto
      console.log('Processando resposta Gemini como texto');
      
      return {
        content: response,
        reasoning: this.extractReasoning(response),
        insights: this.extractInsights(response),
        decisions: this.extractDecisions(response),
        blockers: this.extractBlockers(response),
        confidence: this.calculateConfidence(response),
        provider: 'gemini',
        model: this.model
      };
    }
  }
  
  /**
   * Extrai insights da resposta
   */
  extractInsights(content) {
    if (!content) return [];
    
    const insights = [];
    const lines = content.split('\n');
    
    // Procurar por padrões de recomendações
    const insightPatterns = [
      /^\s*[-•]\s*(.+(?:recomend|suger|importante|crucial|essencial).+)/i,
      /^\s*\d+\.\s*(.+(?:deve|precisa|necessário).+)/i,
      /\*\*(.+?)\*\*:\s*(.+)/g // Formato markdown
    ];
    
    for (const line of lines) {
      for (const pattern of insightPatterns) {
        const match = line.match(pattern);
        if (match) {
          insights.push({
            type: 'recommendation',
            content: match[1] || match[2],
            importance: 0.8
          });
        }
      }
    }
    
    // Se não encontrar padrões, extrair seções importantes
    if (insights.length === 0 && content.includes('Recomend')) {
      const recSection = content.split(/Recomend[^:]*:/i)[1];
      if (recSection) {
        insights.push({
          type: 'general',
          content: recSection.split('\n')[0].trim(),
          importance: 0.7
        });
      }
    }
    
    return insights.slice(0, 5); // Limitar a 5 insights principais
  }
  
  /**
   * Extrai decisões da resposta
   */
  extractDecisions(content) {
    if (!content) return [];
    
    const decisions = [];
    const decisionKeywords = [
      'escolher', 'optar', 'selecionar', 'decidir',
      'choose', 'select', 'decide', 'opt'
    ];
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (decisionKeywords.some(keyword => lowerLine.includes(keyword))) {
        decisions.push({
          type: 'technical',
          content: line.trim(),
          rationale: 'Baseado na análise do Gemini'
        });
      }
    }
    
    return decisions.slice(0, 3);
  }
  
  /**
   * Extrai blockers da resposta
   */
  extractBlockers(content) {
    if (!content) return [];
    
    const blockers = [];
    const riskKeywords = [
      'risco', 'problema', 'desafio', 'bloqueio', 'impedimento',
      'risk', 'problem', 'challenge', 'blocker', 'issue'
    ];
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (riskKeywords.some(keyword => lowerLine.includes(keyword))) {
        blockers.push({
          type: 'technical',
          description: line.trim(),
          severity: this.assessSeverity(line)
        });
      }
    }
    
    return blockers.slice(0, 5);
  }
  
  /**
   * Extrai raciocínio da resposta
   */
  extractReasoning(content) {
    if (!content) return '';
    
    // Procurar seção de análise
    const analysisSection = content.match(/(?:Análise|Analysis|Reasoning)[^:]*:\s*([^.]+(?:\.[^.]+){0,2})/i);
    
    if (analysisSection) {
      return analysisSection[1].trim();
    }
    
    // Pegar primeiro parágrafo substancial
    const paragraphs = content.split('\n\n').filter(p => p.length > 50);
    return paragraphs[0] || '';
  }
  
  /**
   * Calcula confiança baseada na resposta
   */
  calculateConfidence(content) {
    if (!content) return 0.5;
    
    let confidence = 0.7; // Base para Gemini
    
    // Fatores positivos
    if (content.match(/definitivamente|certamente|comprovado|clearly|definitely/i)) {
      confidence += 0.1;
    }
    
    if (content.match(/melhor prática|best practice|padrão da indústria|industry standard/i)) {
      confidence += 0.1;
    }
    
    // Fatores negativos
    if (content.match(/talvez|possivelmente|depende|maybe|possibly|depends/i)) {
      confidence -= 0.1;
    }
    
    if (content.match(/risco|incerteza|unknown|uncertainty/i)) {
      confidence -= 0.05;
    }
    
    // Ajustar baseado no comprimento da resposta
    if (content.length > 1000) confidence += 0.05;
    if (content.length < 200) confidence -= 0.1;
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }
  
  /**
   * Avalia severidade de um blocker
   */
  assessSeverity(text) {
    const lowercased = text.toLowerCase();
    
    if (lowercased.match(/crítico|critical|bloqueio total|showstopper/)) {
      return 'high';
    }
    
    if (lowercased.match(/importante|significant|considerável|major/)) {
      return 'medium';
    }
    
    return 'low';
  }
  
  /**
   * Instrução de idioma
   */
  getLanguageInstruction(language) {
    const instructions = {
      'pt-BR': 'Por favor, responda em português brasileiro.',
      'en-US': 'Please respond in English.',
      'es-ES': 'Por favor, responde en español.',
      'fr-FR': 'Veuillez répondre en français.',
      'de-DE': 'Bitte antworten Sie auf Deutsch.',
      'it-IT': 'Si prega di rispondere in italiano.',
      'ja-JP': '日本語でお答えください。',
      'zh-CN': '请用中文回答。'
    };
    
    return instructions[language] || instructions['pt-BR'];
  }
  
  /**
   * Verifica e aplica rate limits
   */
  async checkRateLimits() {
    const now = Date.now();
    
    // Reset contadores se necessário
    if (now > this.requestCounts.minute.resetTime) {
      this.requestCounts.minute = { count: 0, resetTime: now + 60000 };
    }
    
    if (now > this.requestCounts.day.resetTime) {
      this.requestCounts.day = { count: 0, resetTime: now + 86400000 };
    }
    
    // Verificar limites
    if (this.requestCounts.minute.count >= this.limits.requestsPerMinute) {
      const waitTime = this.requestCounts.minute.resetTime - now;
      console.log(`⏳ Rate limit por minuto atingido. Aguardando ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    if (this.requestCounts.day.count >= this.limits.requestsPerDay) {
      throw new Error('Limite diário do Gemini CLI atingido (1000 requests)');
    }
  }
  
  /**
   * Incrementa contadores de request
   */
  incrementRequestCount() {
    this.requestCounts.minute.count++;
    this.requestCounts.day.count++;
  }
  
  /**
   * Consulta em lote otimizada
   */
  async batchQuery(agents, task, context) {
    console.log(`🚀 Gemini CLI: Processando ${agents.length} agentes`);
    
    // Gemini tem contexto de 1M tokens, podemos processar múltiplos agentes
    if (agents.length <= 5) {
      // Para poucos agentes, fazer uma consulta combinada
      return await this.combinedQuery(agents, task, context);
    } else {
      // Para muitos agentes, processar em paralelo com controle de rate
      return await this.parallelQuery(agents, task, context);
    }
  }
  
  /**
   * Consulta combinada para poucos agentes
   */
  async combinedQuery(agents, task, context) {
    const combinedPrompt = this.buildCombinedPrompt(agents, task, context);
    
    try {
      const response = await this.executeDirectPrompt(combinedPrompt, context);
      return this.splitCombinedResponse(response, agents);
    } catch (error) {
      // Fallback para consultas individuais
      return await this.parallelQuery(agents, task, context);
    }
  }
  
  /**
   * Constrói prompt combinado para múltiplos agentes
   */
  buildCombinedPrompt(agents, task, context) {
    const language = this.getLanguageInstruction(context.language || 'pt-BR');
    
    return `${language}

Analise a tarefa "${task}" sob as perspectivas dos seguintes especialistas:

${agents.map((agent, i) => `
${i + 1}. ${agent.name} (${agent.role})
   Capacidades: ${agent.capabilities.join(', ')}
`).join('\n')}

Para CADA especialista listado acima, forneça:
- Análise específica baseada em suas capacidades
- Recomendações práticas
- Potenciais riscos ou blockers
- Próximos passos

Estruture a resposta com seções claras para cada especialista.`;
  }
  
  /**
   * Divide resposta combinada entre agentes
   */
  splitCombinedResponse(response, agents) {
    // Implementar lógica para dividir a resposta
    // Por enquanto, distribuir igualmente
    return agents.map(agent => ({
      content: response,
      provider: 'gemini',
      model: this.model,
      agentId: agent.id,
      agentName: agent.name,
      combined: true
    }));
  }
  
  /**
   * Consulta paralela com controle de rate
   */
  async parallelQuery(agents, task, context) {
    const results = [];
    const batchSize = 5; // Processar 5 por vez
    
    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);
      const batchPromises = batch.map(agent => this.query(agent, task, context));
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Pequena pausa entre batches para respeitar rate limits
      if (i + batchSize < agents.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
  
  /**
   * Atualiza configuração do provider
   */
  async updateConfig(config) {
    if (config.cliPath) {
      this.cliPath = config.cliPath;
      await this.checkCLIAvailability();
    }
    
    if (config.enabled !== undefined) {
      this.enabled = config.enabled;
    }
    
    console.log('✅ Configuração do Gemini CLI Provider atualizada');
  }
  
  /**
   * Health check do provider
   */
  async healthCheck() {
    if (!this.enabled) {
      return {
        status: 'disabled',
        message: 'Gemini CLI não habilitado'
      };
    }
    
    try {
      const { stdout } = await execAsync(`${this.cliPath} --version`, { timeout: 5000 });
      
      return {
        status: 'healthy',
        message: 'Gemini CLI operacional',
        version: stdout.trim(),
        model: this.model,
        limits: this.limits,
        usage: {
          minute: this.requestCounts.minute.count,
          day: this.requestCounts.day.count
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Gemini CLI não disponível',
        error: error.message
      };
    }
  }
  
  /**
   * Obtém estatísticas de uso
   */
  getUsageStats() {
    return {
      requestsToday: this.requestCounts.day.count,
      requestsThisMinute: this.requestCounts.minute.count,
      remainingToday: this.limits.requestsPerDay - this.requestCounts.day.count,
      remainingThisMinute: this.limits.requestsPerMinute - this.requestCounts.minute.count,
      resetTimes: {
        minute: new Date(this.requestCounts.minute.resetTime).toISOString(),
        day: new Date(this.requestCounts.day.resetTime).toISOString()
      }
    };
  }
}

export default GeminiCLIProvider;