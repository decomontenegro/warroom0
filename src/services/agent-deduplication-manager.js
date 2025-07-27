/**
 * Agent Deduplication Manager
 * Garante que agentes não sejam duplicados durante a execução
 */

export class AgentDeduplicationManager {
  constructor() {
    this.sessionAgents = new Map(); // Agentes por sessão
    this.phaseAgents = new Map();   // Agentes por fase
    this.responseTracker = new Map(); // Rastrear respostas únicas
  }

  /**
   * Inicia nova sessão de análise
   */
  startNewSession(sessionId) {
    this.sessionAgents.set(sessionId, new Set());
    this.phaseAgents.set(sessionId, new Map());
    this.responseTracker.set(sessionId, new Map());
  }

  /**
   * Finaliza sessão e limpa dados
   */
  endSession(sessionId) {
    this.sessionAgents.delete(sessionId);
    this.phaseAgents.delete(sessionId);
    this.responseTracker.delete(sessionId);
  }

  /**
   * Verifica se agente já foi usado na sessão
   */
  isAgentUsed(sessionId, agentId) {
    const sessionSet = this.sessionAgents.get(sessionId);
    return sessionSet ? sessionSet.has(agentId) : false;
  }

  /**
   * Marca agente como usado
   */
  markAgentUsed(sessionId, agentId) {
    const sessionSet = this.sessionAgents.get(sessionId) || new Set();
    sessionSet.add(agentId);
    this.sessionAgents.set(sessionId, sessionSet);
  }

  /**
   * Filtra agentes para evitar duplicação
   */
  filterUniqueAgents(sessionId, agents) {
    if (!this.sessionAgents.has(sessionId)) {
      this.startNewSession(sessionId);
    }

    const usedAgents = this.sessionAgents.get(sessionId);
    const uniqueAgents = [];

    for (const agent of agents) {
      if (!usedAgents.has(agent.id)) {
        uniqueAgents.push(agent);
        this.markAgentUsed(sessionId, agent.id);
      }
    }

    return uniqueAgents;
  }

  /**
   * Distribui agentes por fases evitando duplicação
   */
  distributeAgentsAcrossPhases(sessionId, selectedAgents, phases) {
    const distribution = new Map();
    const agentPhaseCount = new Map();
    
    // Inicializar fases
    phases.forEach(phase => distribution.set(phase, []));
    
    // Contar quantas fases cada agente pode participar
    selectedAgents.forEach(({ agent }) => {
      let phaseCount = 0;
      
      if (this.canParticipateInPhase(agent, 'analysis')) phaseCount++;
      if (this.canParticipateInPhase(agent, 'design')) phaseCount++;
      if (this.canParticipateInPhase(agent, 'implementation')) phaseCount++;
      if (this.canParticipateInPhase(agent, 'validation')) phaseCount++;
      
      agentPhaseCount.set(agent.id, phaseCount);
    });
    
    // Alocar agentes prioritariamente onde têm menos opções
    const sortedAgents = selectedAgents.sort((a, b) => 
      agentPhaseCount.get(a.agent.id) - agentPhaseCount.get(b.agent.id)
    );
    
    // Distribuir agentes
    const assignedAgents = new Set();
    
    sortedAgents.forEach(({ agent }) => {
      // Encontrar melhor fase para este agente
      const bestPhase = this.findBestPhaseForAgent(agent, distribution, assignedAgents);
      
      if (bestPhase && !assignedAgents.has(agent.id)) {
        distribution.get(bestPhase).push(agent);
        assignedAgents.add(agent.id);
      }
    });
    
    // Segunda passada para agentes que podem trabalhar em múltiplas fases
    sortedAgents.forEach(({ agent }) => {
      phases.forEach(phase => {
        if (this.canParticipateInPhase(agent, phase) && 
            !this.isAgentInPhase(agent, phase, distribution) &&
            distribution.get(phase).length < 5) { // Limite por fase
          distribution.get(phase).push(agent);
        }
      });
    });
    
    return distribution;
  }

  /**
   * Verifica se agente pode participar de uma fase
   */
  canParticipateInPhase(agent, phase) {
    const role = agent.role.toLowerCase();
    
    switch(phase) {
      case 'analysis':
        return role.includes('analyst') || role.includes('research') || 
               role.includes('architect') || role.includes('lead');
               
      case 'design':
        return role.includes('architect') || role.includes('designer') ||
               role.includes('lead') || role.includes('ux');
               
      case 'implementation':
        return role.includes('developer') || role.includes('engineer') ||
               role.includes('specialist') || role.includes('backend') ||
               role.includes('frontend');
               
      case 'validation':
        return role.includes('tester') || role.includes('security') ||
               role.includes('quality') || role.includes('performance');
               
      default:
        return false;
    }
  }

  /**
   * Encontra melhor fase para um agente
   */
  findBestPhaseForAgent(agent, distribution, assignedAgents) {
    const possiblePhases = ['analysis', 'design', 'implementation', 'validation']
      .filter(phase => this.canParticipateInPhase(agent, phase));
    
    // Ordenar por menor número de agentes na fase
    possiblePhases.sort((a, b) => 
      distribution.get(a).length - distribution.get(b).length
    );
    
    return possiblePhases[0];
  }

  /**
   * Verifica se agente já está em uma fase
   */
  isAgentInPhase(agent, phase, distribution) {
    const phaseAgents = distribution.get(phase) || [];
    return phaseAgents.some(a => a.id === agent.id);
  }

  /**
   * Rastreia resposta única do agente
   */
  trackAgentResponse(sessionId, agentId, response) {
    const sessionTracker = this.responseTracker.get(sessionId) || new Map();
    
    // Verificar se resposta é similar a alguma anterior
    for (const [otherId, otherResponse] of sessionTracker) {
      if (otherId !== agentId && this.areSimilarResponses(response, otherResponse)) {
        console.warn(`Agent ${agentId} response too similar to ${otherId}`);
        return false;
      }
    }
    
    sessionTracker.set(agentId, response);
    this.responseTracker.set(sessionId, sessionTracker);
    return true;
  }

  /**
   * Verifica similaridade entre respostas
   */
  areSimilarResponses(response1, response2) {
    // Verificação simples de similaridade
    if (response1 === response2) return true;
    
    // Verificar se têm mais de 80% de palavras em comum
    const words1 = response1.toLowerCase().split(/\s+/);
    const words2 = response2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));
    
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    return similarity > 0.8;
  }

  /**
   * Gera estatísticas de distribuição
   */
  getDistributionStats(sessionId) {
    const usedAgents = this.sessionAgents.get(sessionId) || new Set();
    const phaseDistribution = this.phaseAgents.get(sessionId) || new Map();
    
    return {
      totalAgentsUsed: usedAgents.size,
      agentsPerPhase: Array.from(phaseDistribution.entries()).map(([phase, agents]) => ({
        phase,
        count: agents.length,
        agents: agents.map(a => ({ id: a.id, name: a.name, role: a.role }))
      })),
      uniqueResponses: this.responseTracker.get(sessionId)?.size || 0
    };
  }
}

export default new AgentDeduplicationManager();