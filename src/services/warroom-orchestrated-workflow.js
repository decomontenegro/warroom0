/**
 * WarRoom Orchestrated Workflow
 * Created: 2025-07-19
 * 
 * Fluxo orquestrado com Coordenador e hierarquia de agentes
 */

import warRoomCoordinator from './warroom-coordinator.js';
import SmartAgentSelector from './smart-agent-selector.js';
import { generateAgentResponse } from './agent-response-templates.js';

export class OrchestratedWorkflow {
  constructor() {
    this.coordinator = warRoomCoordinator;
    this.agentSelector = SmartAgentSelector;
    this.agentCount = 0;
    this.currentPhase = null;
  }
  
  /**
   * Executa o workflow orquestrado completo
   */
  async executeOrchestratedWorkflow(prompt, options = {}) {
    const {
      workflowInstance,
      progressCallback,
      maxAgents = 15
    } = options;
    
    this.agentCount = 0;
    const messages = [];
    
    try {
      // 1. Coordenador inicia
      await this.sendCoordinatorMessage(
        this.coordinator.getIntroMessage(prompt),
        progressCallback
      );
      
      // 2. Análise do documento
      const documentAnalysis = await this.analyzeDocument(prompt, workflowInstance);
      
      // 3. Seleção de agentes
      const selectedAgents = await this.selectAgents(documentAnalysis, maxAgents);
      
      await this.sendCoordinatorMessage(
        this.coordinator.getSelectionMessage(selectedAgents.selectedAgents.length),
        progressCallback
      );
      
      // 4. Organizar fluxo com Lead Architect primeiro
      const agentFlow = this.organizeAgentFlow(selectedAgents.selectedAgents);
      
      // 5. Executar agentes na ordem correta
      const agentResponses = await this.executeAgentFlow(
        prompt,
        agentFlow,
        documentAnalysis,
        workflowInstance,
        progressCallback
      );
      
      // 6. Meta-Agent sintetiza
      await this.sendCoordinatorMessage(
        this.coordinator.getPreSynthesisMessage(this.agentCount),
        progressCallback
      );
      
      const synthesis = await this.performSynthesis(
        prompt,
        agentResponses,
        workflowInstance,
        progressCallback
      );
      
      // 7. Coordenador conclui
      const confidence = synthesis?.metrics?.confidence || 85;
      await this.sendCoordinatorMessage(
        this.coordinator.getConclusionMessage(confidence),
        progressCallback
      );
      
      return {
        success: true,
        synthesis,
        agentCount: this.agentCount,
        messages
      };
      
    } catch (error) {
      console.error('Erro no workflow orquestrado:', error);
      throw error;
    }
  }
  
  /**
   * Analisa o documento
   */
  async analyzeDocument(prompt, workflowInstance) {
    if (workflowInstance && workflowInstance.documentAnalyzer) {
      return await workflowInstance.documentAnalyzer.analyzeText(prompt);
    }
    // Fallback para análise simples
    return {
      type: 'query',
      complexity: { complexity: 'medium' },
      technicalDomain: [],
      concepts: { technical: [], architectural: [] },
      keyElements: {}
    };
  }
  
  /**
   * Seleciona agentes relevantes
   */
  async selectAgents(documentAnalysis, maxAgents) {
    return await this.agentSelector.selectAgents(documentAnalysis, {
      maxAgents,
      requireLeadership: true,
      balanceExpertise: true
    });
  }
  
  /**
   * Organiza o fluxo garantindo Lead Architect primeiro
   */
  organizeAgentFlow(selectedAgents) {
    const flow = [];
    
    // Lead Architect SEMPRE primeiro
    const leadArchitect = selectedAgents.find(a => a.agent.id === 1);
    if (!leadArchitect) {
      // Se não foi selecionado, adicionar manualmente
      const leadData = {
        agent: {
          id: 1,
          name: "Lead Architect",
          role: "System Architecture & Vision",
          capabilities: ["System design", "Architecture patterns", "Technology selection", "Scalability planning"],
          phase: ["brainstorm", "development"]
        },
        score: { totalScore: 100 }
      };
      flow.push({ ...leadData, order: 1, phase: 'analysis' });
    } else {
      flow.push({ ...leadArchitect, order: 1, phase: 'analysis' });
    }
    
    // Organizar outros agentes por fase
    const phases = ['brainstorm', 'development', 'design', 'security', 'testing'];
    let order = 2;
    
    phases.forEach(phase => {
      const phaseAgents = selectedAgents.filter(a => 
        a.agent.id !== 1 && 
        a.agent.phase && 
        a.agent.phase.includes(phase)
      );
      
      phaseAgents.forEach(agentData => {
        flow.push({ ...agentData, order: order++, phase });
      });
    });
    
    return flow;
  }
  
  /**
   * Executa o fluxo de agentes
   */
  async executeAgentFlow(prompt, agentFlow, documentAnalysis, workflowInstance, progressCallback) {
    const responses = [];
    let lastPhase = null;
    
    for (const flowItem of agentFlow) {
      const { agent, phase } = flowItem;
      
      // Anuncia mudança de fase
      if (phase !== lastPhase) {
        const phaseAgents = agentFlow.filter(f => f.phase === phase).length;
        await this.sendCoordinatorMessage(
          this.coordinator.getPhaseStartMessage(phase, phaseAgents),
          progressCallback
        );
        lastPhase = phase;
      }
      
      // Executar agente
      const response = await this.executeAgent(
        agent,
        prompt,
        phase,
        documentAnalysis,
        workflowInstance,
        progressCallback
      );
      
      if (response) {
        responses.push(response);
        this.agentCount++;
      }
      
      // Pequena pausa entre agentes
      await this.delay(1000);
    }
    
    return responses;
  }
  
  /**
   * Executa um agente individual
   */
  async executeAgent(agent, prompt, phase, documentAnalysis, workflowInstance, progressCallback) {
    try {
      // Notificar que o agente está analisando
      if (progressCallback) {
        progressCallback(phase, agent, `🔍 Analisando com ${agent.name}...`);
      }
      
      await this.delay(500);
      
      // Gerar resposta do agente
      let response;
      if (workflowInstance && workflowInstance.promptBuilder) {
        // Usar o sistema real se disponível
        const agentPrompt = workflowInstance.promptBuilder.buildPrompt(
          prompt,
          agent,
          documentAnalysis,
          { format: 'detailed', targetSystem: 'warroom' }
        );
        response = generateAgentResponse(agent, agentPrompt, 'warroom');
      } else {
        // Fallback para resposta template
        response = generateAgentResponse(agent, prompt, 'warroom');
      }
      
      // Enviar resposta do agente
      if (progressCallback) {
        progressCallback(phase, agent, response);
      }
      
      return {
        agent,
        phase,
        response,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Erro ao executar agente ${agent.name}:`, error);
      return null;
    }
  }
  
  /**
   * Realiza a síntese final
   */
  async performSynthesis(prompt, agentResponses, workflowInstance, progressCallback) {
    if (workflowInstance && workflowInstance.synthesizer) {
      // Usar o sintetizador real
      const synthesis = await workflowInstance.synthesizer.synthesize(agentResponses, {
        query: prompt,
        synthesisLevel: 'executive'
      });
      
      if (progressCallback) {
        progressCallback('synthesis', null, 'Sintetizando resultados...');
      }
      
      return synthesis;
    }
    
    // Fallback para síntese simples
    return {
      synthesis: 'Análise completa realizada com sucesso.',
      recommendations: ['Implementar solução proposta', 'Revisar com equipe técnica'],
      metrics: {
        totalAgents: this.agentCount,
        consensusScore: 85,
        confidence: 'Alta'
      }
    };
  }
  
  /**
   * Envia mensagem do coordenador
   */
  async sendCoordinatorMessage(message, progressCallback) {
    if (progressCallback) {
      progressCallback('coordination', null, message);
    }
    await this.delay(800);
  }
  
  /**
   * Helper para delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new OrchestratedWorkflow();