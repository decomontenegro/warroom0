/**
 * Integração do Meta-Agente com o UltraThink Workflow
 */

import MetaAgent from './MetaAgent.js';

class UltraThinkConsensusIntegration {
  constructor() {
    this.metaAgent = new MetaAgent();
    this.responseBuffer = new Map(); // Buffer de respostas por sessão
  }

  /**
   * Intercepta e processa respostas do UltraThink
   */
  async interceptResponses(sessionId, responses) {
    // Adiciona respostas ao buffer da sessão
    if (!this.responseBuffer.has(sessionId)) {
      this.responseBuffer.set(sessionId, []);
    }
    
    const sessionBuffer = this.responseBuffer.get(sessionId);
    
    // Adiciona novas respostas
    if (Array.isArray(responses)) {
      sessionBuffer.push(...responses);
    } else {
      sessionBuffer.push(responses);
    }
    
    // Se temos respostas suficientes, processa com Meta-Agente
    if (this.shouldProcess(sessionBuffer)) {
      return await this.processWithMetaAgent(sessionId, sessionBuffer);
    }
    
    return null;
  }

  /**
   * Determina se deve processar as respostas
   */
  shouldProcess(buffer) {
    // Processa quando:
    // 1. Temos pelo menos 10 respostas
    // 2. Ou passou 5 segundos desde a primeira resposta
    // 3. Ou recebemos sinal de fim de fase
    
    if (buffer.length >= 10) return true;
    
    if (buffer.length > 0) {
      const firstResponseTime = buffer[0].timestamp;
      const elapsed = Date.now() - new Date(firstResponseTime).getTime();
      if (elapsed > 5000) return true;
    }
    
    return false;
  }

  /**
   * Processa respostas com o Meta-Agente
   */
  async processWithMetaAgent(sessionId, responses) {
    try {
      // Formata respostas para o Meta-Agente
      const formattedResponses = responses.map(r => ({
        agent: r.agent || r.name,
        content: r.response || r.content,
        timestamp: r.timestamp,
        confidence: r.confidence || 0.8
      }));
      
      // Obtém síntese do Meta-Agente
      const synthesis = await this.metaAgent.synthesize(
        responses[0]?.query || 'Análise geral',
        formattedResponses
      );
      
      // Limpa buffer após processamento
      this.responseBuffer.set(sessionId, []);
      
      return synthesis;
    } catch (error) {
      console.error('[Integration] Erro ao processar com Meta-Agente:', error);
      return null;
    }
  }

  /**
   * Finaliza sessão e retorna análise completa
   */
  async finalizeSession(sessionId, allResponses) {
    try {
      // Processa todas as respostas finais
      const finalSynthesis = await this.metaAgent.synthesize(
        'Análise completa',
        allResponses
      );
      
      // Limpa buffer da sessão
      this.responseBuffer.delete(sessionId);
      
      return {
        ...finalSynthesis,
        sessionComplete: true
      };
    } catch (error) {
      console.error('[Integration] Erro ao finalizar sessão:', error);
      return null;
    }
  }

  /**
   * Stream de atualizações em tempo real
   */
  async *streamUpdates(sessionId, responseStream) {
    const buffer = [];
    
    for await (const response of responseStream) {
      buffer.push(response);
      
      // Atualização parcial a cada 5 respostas
      if (buffer.length % 5 === 0) {
        const partialSynthesis = await this.metaAgent.synthesize(
          'Análise parcial',
          buffer
        );
        
        yield {
          type: 'partial',
          sessionId,
          synthesis: partialSynthesis,
          processedCount: buffer.length
        };
      }
    }
    
    // Síntese final
    const finalSynthesis = await this.metaAgent.synthesize(
      'Análise final',
      buffer
    );
    
    yield {
      type: 'final',
      sessionId,
      synthesis: finalSynthesis,
      totalProcessed: buffer.length
    };
  }

  /**
   * Middleware para Express
   */
  middleware() {
    return async (req, res, next) => {
      // Adiciona integração ao request
      req.ultrathinkConsensus = this;
      
      // Intercepta respostas se for rota do UltraThink
      if (req.path.includes('/ultrathink') || req.path.includes('/api/ai')) {
        const originalJson = res.json.bind(res);
        
        res.json = async (data) => {
          // Se tem respostas de agentes, processa
          if (data.responses && Array.isArray(data.responses)) {
            const sessionId = req.sessionID || 'default';
            const synthesis = await this.interceptResponses(sessionId, data.responses);
            
            if (synthesis) {
              data.synthesis = synthesis;
              data.hasMetaAnalysis = true;
            }
          }
          
          return originalJson(data);
        };
      }
      
      next();
    };
  }
}

export default UltraThinkConsensusIntegration;