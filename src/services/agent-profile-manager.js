/**
 * Agent Profile Manager
 * Gerencia perfis únicos de agentes e garante respostas contextualizadas
 */

import agents100Data from '../../warroom-agents-100.json' with { type: 'json' };

export class AgentProfileManager {
  constructor() {
    this.agents = agents100Data.warRoomTechInnovationRoles.agents;
    this.agentProfiles = this.buildAgentProfiles();
    this.usedAgents = new Set();
  }

  /**
   * Constrói perfis detalhados para cada agente
   */
  buildAgentProfiles() {
    const profiles = new Map();
    
    this.agents.forEach(agent => {
      profiles.set(agent.id, {
        ...agent,
        personality: this.generatePersonality(agent),
        expertise: this.generateExpertise(agent),
        communicationStyle: this.generateCommunicationStyle(agent),
        uniqueTraits: this.generateUniqueTraits(agent)
      });
    });
    
    return profiles;
  }

  /**
   * Gera personalidade baseada no papel do agente
   */
  generatePersonality(agent) {
    const role = agent.role.toLowerCase();
    
    if (role.includes('lead') || role.includes('chief')) {
      return {
        leadership: 'visionary',
        approach: 'strategic',
        decisionMaking: 'decisive',
        communication: 'inspiring'
      };
    } else if (role.includes('architect')) {
      return {
        leadership: 'technical',
        approach: 'systematic',
        decisionMaking: 'analytical',
        communication: 'precise'
      };
    } else if (role.includes('designer')) {
      return {
        leadership: 'creative',
        approach: 'user-centric',
        decisionMaking: 'intuitive',
        communication: 'visual'
      };
    } else if (role.includes('engineer')) {
      return {
        leadership: 'collaborative',
        approach: 'pragmatic',
        decisionMaking: 'data-driven',
        communication: 'technical'
      };
    } else if (role.includes('analyst')) {
      return {
        leadership: 'supportive',
        approach: 'investigative',
        decisionMaking: 'evidence-based',
        communication: 'detailed'
      };
    }
    
    return {
      leadership: 'adaptive',
      approach: 'balanced',
      decisionMaking: 'consultative',
      communication: 'clear'
    };
  }

  /**
   * Gera expertise específica baseada nas capacidades
   */
  generateExpertise(agent) {
    const expertise = {
      primary: [],
      secondary: [],
      emerging: []
    };
    
    // Primárias são as capacidades listadas
    expertise.primary = agent.capabilities.slice(0, 2);
    expertise.secondary = agent.capabilities.slice(2, 4);
    
    // Adicionar expertise emergente baseada em tendências
    const role = agent.role.toLowerCase();
    if (role.includes('ai') || role.includes('ml')) {
      expertise.emerging.push('Generative AI', 'LLM Integration');
    } else if (role.includes('cloud')) {
      expertise.emerging.push('Edge Computing', 'Serverless Architecture');
    } else if (role.includes('security')) {
      expertise.emerging.push('Zero Trust', 'AI Security');
    } else if (role.includes('blockchain')) {
      expertise.emerging.push('DeFi Protocols', 'Cross-chain Integration');
    }
    
    return expertise;
  }

  /**
   * Gera estilo de comunicação único
   */
  generateCommunicationStyle(agent) {
    const styles = [
      {
        type: 'analytical',
        tone: 'formal',
        structure: 'systematic',
        examples: 'data-driven',
        vocabulary: 'technical'
      },
      {
        type: 'consultative',
        tone: 'professional',
        structure: 'problem-solution',
        examples: 'case-based',
        vocabulary: 'balanced'
      },
      {
        type: 'innovative',
        tone: 'enthusiastic',
        structure: 'exploratory',
        examples: 'creative',
        vocabulary: 'forward-thinking'
      },
      {
        type: 'pragmatic',
        tone: 'direct',
        structure: 'action-oriented',
        examples: 'practical',
        vocabulary: 'straightforward'
      },
      {
        type: 'strategic',
        tone: 'authoritative',
        structure: 'big-picture',
        examples: 'industry-wide',
        vocabulary: 'executive'
      }
    ];
    
    // Selecionar estilo baseado no ID do agente para consistência
    const styleIndex = agent.id % styles.length;
    return styles[styleIndex];
  }

  /**
   * Gera características únicas para evitar repetição
   */
  generateUniqueTraits(agent) {
    const traits = [];
    
    // Baseado no ID, adicionar traits únicos
    if (agent.id % 2 === 0) {
      traits.push('detail-oriented');
    } else {
      traits.push('big-picture thinker');
    }
    
    if (agent.id % 3 === 0) {
      traits.push('cross-functional collaborator');
    } else if (agent.id % 3 === 1) {
      traits.push('deep specialist');
    } else {
      traits.push('bridge builder');
    }
    
    if (agent.id % 5 === 0) {
      traits.push('early adopter');
    } else if (agent.id % 5 === 1) {
      traits.push('best practices advocate');
    } else if (agent.id % 5 === 2) {
      traits.push('innovation catalyst');
    } else if (agent.id % 5 === 3) {
      traits.push('quality guardian');
    } else {
      traits.push('efficiency optimizer');
    }
    
    return traits;
  }

  /**
   * Obter agente único que ainda não foi usado
   */
  getUniqueAgent(agentId) {
    if (this.usedAgents.has(agentId)) {
      console.warn(`Agent ${agentId} already used, finding alternative`);
      // Encontrar agente similar não usado
      const originalAgent = this.agentProfiles.get(agentId);
      for (const [id, profile] of this.agentProfiles) {
        if (!this.usedAgents.has(id) && 
            profile.role === originalAgent.role) {
          return this.getAgentProfile(id);
        }
      }
    }
    
    this.usedAgents.add(agentId);
    return this.getAgentProfile(agentId);
  }

  /**
   * Obter perfil completo do agente
   */
  getAgentProfile(agentId) {
    return this.agentProfiles.get(agentId);
  }

  /**
   * Resetar agentes usados para nova sessão
   */
  resetUsedAgents() {
    this.usedAgents.clear();
  }

  /**
   * Construir contexto de personalidade para o prompt
   */
  buildPersonalityContext(agent) {
    const profile = this.getAgentProfile(agent.id);
    
    return `You are ${agent.name}, a ${agent.role} with the following profile:

PERSONALITY:
- Leadership Style: ${profile.personality.leadership}
- Approach: ${profile.personality.approach}
- Decision Making: ${profile.personality.decisionMaking}
- Communication: ${profile.personality.communication}

EXPERTISE:
- Primary: ${profile.expertise.primary.join(', ')}
- Secondary: ${profile.expertise.secondary.join(', ')}
- Emerging: ${profile.expertise.emerging.join(', ')}

COMMUNICATION STYLE:
- Type: ${profile.communicationStyle.type}
- Tone: ${profile.communicationStyle.tone}
- Structure: ${profile.communicationStyle.structure}
- Examples: ${profile.communicationStyle.examples}
- Vocabulary: ${profile.communicationStyle.vocabulary}

UNIQUE TRAITS:
${profile.uniqueTraits.map(trait => `- ${trait}`).join('\n')}

CAPABILITIES:
${agent.capabilities.map(cap => `- ${cap}`).join('\n')}

Remember to:
1. Maintain your unique personality throughout the response
2. Draw from your specific expertise areas
3. Use your characteristic communication style
4. Avoid generic responses - be specific to your role
5. Reference your unique traits when relevant
6. Provide insights that only someone with your background would offer`;
  }

  /**
   * Garantir resposta única baseada no perfil
   */
  validateResponseUniqueness(response, agent) {
    const profile = this.getAgentProfile(agent.id);
    
    // Verificar se a resposta reflete o perfil único
    const hasPersonality = this.checkPersonalityMarkers(response, profile.personality);
    const hasExpertise = this.checkExpertiseMarkers(response, profile.expertise);
    const hasStyle = this.checkStyleMarkers(response, profile.communicationStyle);
    
    return {
      isUnique: hasPersonality && hasExpertise && hasStyle,
      score: (hasPersonality ? 0.33 : 0) + (hasExpertise ? 0.33 : 0) + (hasStyle ? 0.34 : 0),
      feedback: {
        personality: hasPersonality ? 'Good' : 'Needs more personality',
        expertise: hasExpertise ? 'Good' : 'Needs more expertise focus',
        style: hasStyle ? 'Good' : 'Needs style adjustment'
      }
    };
  }

  checkPersonalityMarkers(response, personality) {
    const markers = {
      visionary: ['envision', 'future', 'transform', 'revolutionary'],
      strategic: ['strategy', 'long-term', 'roadmap', 'objectives'],
      analytical: ['analysis', 'data shows', 'evidence', 'metrics'],
      creative: ['innovative', 'creative', 'unique approach', 'reimagine'],
      pragmatic: ['practical', 'actionable', 'implement', 'hands-on']
    };
    
    const relevantMarkers = markers[personality.leadership] || [];
    return relevantMarkers.some(marker => 
      response.toLowerCase().includes(marker.toLowerCase())
    );
  }

  checkExpertiseMarkers(response, expertise) {
    const allExpertise = [
      ...expertise.primary,
      ...expertise.secondary,
      ...expertise.emerging
    ];
    
    return allExpertise.some(exp => 
      response.toLowerCase().includes(exp.toLowerCase())
    );
  }

  checkStyleMarkers(response, style) {
    const styleMarkers = {
      analytical: response.includes('data') || response.includes('analysis'),
      consultative: response.includes('recommend') || response.includes('suggest'),
      innovative: response.includes('new') || response.includes('innovative'),
      pragmatic: response.includes('step') || response.includes('action'),
      strategic: response.includes('strategy') || response.includes('vision')
    };
    
    return styleMarkers[style.type] || false;
  }
}

export default new AgentProfileManager();