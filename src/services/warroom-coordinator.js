/**
 * WarRoom Coordinator
 * Created: 2025-07-19
 * 
 * Coordena o fluxo de execução dos agentes no WarRoom
 */

export class WarRoomCoordinator {
  constructor() {
    this.name = '🎯 Coordenador UltraThink';
    this.role = 'Orquestrador do Sistema';
    this.phases = [
      { id: 'analysis', name: 'Análise', emoji: '🔍' },
      { id: 'brainstorm', name: 'Brainstorm', emoji: '💡' },
      { id: 'development', name: 'Desenvolvimento', emoji: '🛠️' },
      { id: 'design', name: 'Design', emoji: '🎨' },
      { id: 'security', name: 'Segurança', emoji: '🔒' },
      { id: 'testing', name: 'Validação', emoji: '✅' },
      { id: 'synthesis', name: 'Síntese', emoji: '🧠' }
    ];
  }
  
  /**
   * Mensagem inicial do coordenador
   */
  getIntroMessage(prompt) {
    return {
      sender: 'coordinator',
      name: this.name,
      role: this.role,
      text: `🎯 **Coordenador UltraThink iniciando análise**\n\nRecebido: "${prompt}"\n\nVou organizar nossos especialistas para fornecer uma análise completa. Iniciando processo multi-agente...`,
      phase: 'initialization'
    };
  }
  
  /**
   * Mensagem de seleção de agentes
   */
  getSelectionMessage(agentCount) {
    return {
      sender: 'coordinator',
      name: this.name,
      role: this.role,
      text: `📋 **Selecionando especialistas relevantes**\n\n${agentCount} agentes identificados como relevantes para esta análise. Convocando o Lead Architect para iniciar...`,
      phase: 'selection'
    };
  }
  
  /**
   * Mensagem de início de fase
   */
  getPhaseStartMessage(phase, agentCount) {
    const phaseInfo = this.phases.find(p => p.id === phase);
    return {
      sender: 'coordinator',
      name: this.name,
      role: this.role,
      text: `${phaseInfo.emoji} **Iniciando Fase: ${phaseInfo.name}**\n\n${agentCount} especialistas selecionados para contribuir nesta fase.`,
      phase: phase
    };
  }
  
  /**
   * Mensagem de coordenação entre agentes
   */
  getCoordinationMessage(fromAgent, toAgent) {
    return {
      sender: 'coordinator',
      name: this.name,
      role: this.role,
      text: `🔄 Passando análise de ${fromAgent} para ${toAgent}...`,
      phase: 'coordination'
    };
  }
  
  /**
   * Mensagem antes da síntese
   */
  getPreSynthesisMessage(totalAgents) {
    return {
      sender: 'coordinator',
      name: this.name,
      role: this.role,
      text: `📊 **Coletando insights de ${totalAgents} especialistas**\n\nTodas as perspectivas foram analisadas. Iniciando processo de síntese com o Meta-Agent...`,
      phase: 'pre-synthesis'
    };
  }
  
  /**
   * Mensagem de conclusão
   */
  getConclusionMessage(confidence) {
    return {
      sender: 'coordinator',
      name: this.name,
      role: this.role,
      text: `✅ **Análise Concluída**\n\nTodas as perspectivas foram consideradas e sintetizadas.\nNível de confiança: ${confidence}%\n\nObrigado por usar o UltraThink War Room!`,
      phase: 'conclusion'
    };
  }
  
  /**
   * Organiza o fluxo de agentes
   */
  organizeAgentFlow(selectedAgents, phases) {
    const flow = [];
    
    // Lead Architect sempre primeiro
    const leadArchitect = selectedAgents.find(a => a.id === 1);
    if (leadArchitect) {
      flow.push({
        agent: leadArchitect,
        phase: 'analysis',
        priority: 1
      });
    }
    
    // Organizar outros agentes por fase
    for (const phase of Object.keys(phases)) {
      const phaseAgents = selectedAgents.filter(agent => 
        agent.phase && agent.phase.includes(phase) && agent.id !== 1
      );
      
      phaseAgents.forEach((agent, index) => {
        flow.push({
          agent: agent,
          phase: phase,
          priority: index + 2
        });
      });
    }
    
    return flow;
  }
  
  /**
   * Determina se deve mostrar mensagem de coordenação
   */
  shouldShowCoordination(currentIndex, totalAgents) {
    // Mostra coordenação a cada 3 agentes ou em mudanças de fase
    return currentIndex > 0 && (currentIndex % 3 === 0 || currentIndex === totalAgents - 1);
  }
}

export default new WarRoomCoordinator();