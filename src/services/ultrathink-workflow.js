import agents100Data from '../../warroom-agents-100.json' with { type: 'json' };

/**
 * ULTRATHINK Workflow System
 * Multi-phase agent orchestration with auto-learning capabilities
 */
export class UltrathinkWorkflow {
  constructor() {
    this.agents = agents100Data.warRoomTechInnovationRoles.agents;
    this.phases = agents100Data.warRoomTechInnovationRoles.phases;
    this.learningHistory = [];
    this.currentPhase = null;
    this.activeAgents = new Set();
    this.phaseResults = {};
    this.iterations = 0;
  }

  /**
   * Get language instruction for AI prompts
   */
  getLanguageInstruction(language) {
    const instructions = {
      'pt-BR': 'Responda em português.',
      'en-US': 'Respond in English.',
      'es-ES': 'Responde en español.',
      'fr-FR': 'Répondez en français.',
      'de-DE': 'Antworten Sie auf Deutsch.',
      'it-IT': 'Rispondi in italiano.',
      'ja-JP': '日本語で返信してください。',
      'zh-CN': '请用中文回复。'
    };
    
    return instructions[language] || instructions['pt-BR'];
  }

  /**
   * Main workflow execution with auto-learning loop
   */
  async executeWorkflow(task, context = {}) {
    console.log('🚀 Starting ULTRATHINK Workflow for:', task);
    
    // Initialize workflow state
    this.iterations++;
    const workflowId = `workflow-${Date.now()}`;
    const startTime = Date.now();
    
    // Check if we have previous learning for similar tasks
    const previousLearning = this.findRelevantLearning(task);
    if (previousLearning) {
      console.log('📚 Applying previous learning from', previousLearning.iterations, 'iterations');
      context.previousLearning = previousLearning;
    }

    // Execute phases in sequence
    const phaseOrder = [
      'brainstorm',
      'development', 
      'product',
      'ux',
      'design',
      'marketing',
      'security',
      'testing'
    ];

    const results = {
      workflowId,
      task,
      startTime,
      phases: {},
      totalAgentsActivated: 0,
      learningOutcomes: [],
      recommendations: []
    };

    for (const phaseName of phaseOrder) {
      console.log(`\n📋 Phase: ${phaseName.toUpperCase()}`);
      
      // Execute phase with selected agents
      const phaseResult = await this.executePhase(
        phaseName, 
        task, 
        context,
        results.phases
      );
      
      results.phases[phaseName] = phaseResult;
      results.totalAgentsActivated += phaseResult.agentsUsed.length;
      
      // Check if we need to iterate based on phase results
      if (phaseResult.requiresIteration) {
        console.log('🔄 Phase requires iteration, restarting with new learning...');
        break;
      }
    }

    // Apply learning and store for future use
    const learning = await this.extractLearning(results);
    this.learningHistory.push({
      task,
      workflowId,
      iterations: this.iterations,
      learning,
      timestamp: Date.now()
    });

    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    
    // Check if we need another iteration
    if (this.shouldIterate(results)) {
      console.log('🔁 Starting new iteration with accumulated learning...');
      return this.executeWorkflow(task, {
        ...context,
        previousResults: results,
        iterationCount: (context.iterationCount || 0) + 1
      });
    }

    return this.generateFinalReport(results);
  }

  /**
   * Execute a single phase with dynamic agent selection
   */
  async executePhase(phaseName, task, context, previousPhases) {
    const phase = this.phases[phaseName];
    const phaseAgents = this.selectAgentsForPhase(phaseName, task, context);
    
    console.log(`👥 Activating ${phaseAgents.length} agents for ${phaseName}`);
    
    const phaseResult = {
      phase: phaseName,
      description: phase.description,
      agentsUsed: [],
      insights: [],
      decisions: [],
      blockers: [],
      requiresIteration: false,
      confidence: 0
    };

    // Parallel execution of agent tasks
    const agentPromises = phaseAgents.map(agentId => 
      this.runAgent(agentId, task, phaseName, context, previousPhases)
    );
    
    const agentResults = await Promise.all(agentPromises);
    
    // Aggregate results
    for (const result of agentResults) {
      phaseResult.agentsUsed.push(result.agentId);
      phaseResult.insights.push(...result.insights);
      phaseResult.decisions.push(...result.decisions);
      phaseResult.blockers.push(...result.blockers);
      phaseResult.confidence += result.confidence;
    }
    
    phaseResult.confidence = phaseResult.confidence / agentResults.length;
    
    // Check if phase needs iteration
    if (phaseResult.blockers.length > 0 || phaseResult.confidence < 0.7) {
      phaseResult.requiresIteration = true;
    }
    
    return phaseResult;
  }

  /**
   * Select optimal agents for a phase based on task and context
   */
  selectAgentsForPhase(phaseName, task, context) {
    const phaseAgentIds = this.phases[phaseName].agents;
    
    // If we have previous learning, prioritize agents that performed well
    if (context.previousLearning) {
      const successfulAgents = context.previousLearning.learning.successfulAgents || [];
      const prioritizedAgents = phaseAgentIds.filter(id => 
        successfulAgents.includes(id)
      );
      
      if (prioritizedAgents.length > 0) {
        // Use successful agents plus some new ones for diversity
        const additionalAgents = phaseAgentIds
          .filter(id => !prioritizedAgents.includes(id))
          .slice(0, 3);
        
        return [...prioritizedAgents, ...additionalAgents];
      }
    }
    
    // Dynamic selection based on task keywords
    const taskKeywords = this.extractKeywords(task);
    const relevantAgents = phaseAgentIds.filter(agentId => {
      const agent = this.agents.find(a => a.id === agentId);
      return this.isAgentRelevant(agent, taskKeywords);
    });
    
    // Return relevant agents or default to phase agents
    return relevantAgents.length > 0 
      ? relevantAgents 
      : phaseAgentIds.slice(0, Math.min(8, phaseAgentIds.length));
  }

  /**
   * Run a single agent and return results
   */
  async runAgent(agentId, task, phase, context, previousPhases) {
    const agent = this.agents.find(a => a.id === agentId);
    
    // Check if we have AI service available
    let insights, decisions, blockers;
    let confidence = 0.8;
    
    // Send progress update if callback is available
    if (context.progressCallback) {
      const progressMessage = context.language === 'en-US' ? `${agent.name} is analyzing the project...` :
                             context.language === 'es-ES' ? `${agent.name} está analizando el proyecto...` :
                             `${agent.name} está analisando o projeto...`;
      context.progressCallback(phase, agent, progressMessage);
    }
    
    // Check if we're in Node.js environment (server-side)
    if (typeof window === 'undefined') {
      try {
        // Try to use AI service on server
        const aiService = await import('../../server/services/ai.js');
        const languageInstruction = this.getLanguageInstruction(context.language || 'pt-BR');
        const messages = [
          {
            role: 'system',
            content: `You are ${agent.name}, a ${agent.role}. Your expertise includes: ${agent.capabilities.join(', ')}. 
            You are part of the ${phase} phase in a collaborative development workflow.
            Provide specific, actionable insights for the given task.
            ${languageInstruction}`
          },
          {
            role: 'user',
            content: `Task: ${task}\n\nProvide your expert analysis and recommendations.`
          }
        ];
        
        const response = await aiService.default.chat(messages);
        
        // Parse AI response into structured format
        insights = [{
          type: agent.capabilities[0],
          content: response,
          importance: 0.9
        }];
        decisions = [];
        blockers = [];
        
        // Send the actual AI response
        if (context.progressCallback) {
          context.progressCallback(phase, agent, response);
        }
      } catch (error) {
        console.warn('AI service error, using simulation:', error);
        // Fallback to simulation
        insights = this.generateAgentInsights(agent, task, phase, context);
        decisions = this.generateAgentDecisions(agent, task, phase, previousPhases);
        blockers = this.identifyBlockers(agent, task, phase);
      }
    } else {
      // Client-side simulation
      await this.simulateProcessing(100);
      insights = this.generateAgentInsights(agent, task, phase, context);
      decisions = this.generateAgentDecisions(agent, task, phase, previousPhases);
      blockers = this.identifyBlockers(agent, task, phase);
    }
    
    return {
      agentId,
      agentName: agent.name,
      insights,
      decisions,
      blockers,
      confidence
    };
  }

  /**
   * Generate insights based on agent expertise
   */
  generateAgentInsights(agent, task, phase, context) {
    const insights = [];
    
    // Base insights on agent capabilities
    agent.capabilities.forEach(capability => {
      if (Math.random() > 0.5) { // 50% chance to generate insight per capability
        insights.push({
          type: capability,
          content: `${agent.name}: Based on ${capability} analysis, ${this.generateInsightContent(capability, task)}`,
          importance: Math.random() * 0.4 + 0.6
        });
      }
    });
    
    return insights;
  }

  /**
   * Generate agent decisions
   */
  generateAgentDecisions(agent, task, phase, previousPhases) {
    const decisions = [];
    
    // Generate phase-specific decisions
    switch (phase) {
      case 'brainstorm':
        decisions.push({
          agent: agent.name,
          decision: `Recommend ${this.generateTechStack(agent.role)} approach`,
          rationale: 'Based on current market trends and team expertise'
        });
        break;
        
      case 'development':
        decisions.push({
          agent: agent.name,
          decision: `Implement ${this.generateArchitecturePattern(agent.role)}`,
          rationale: 'Optimal for scalability and maintainability'
        });
        break;
        
      case 'security':
        decisions.push({
          agent: agent.name,
          decision: `Apply ${this.generateSecurityMeasure(agent.role)}`,
          rationale: 'Critical for protecting user data and system integrity'
        });
        break;
        
      default:
        decisions.push({
          agent: agent.name,
          decision: `Focus on ${agent.capabilities[0]} optimization`,
          rationale: `Aligns with ${phase} phase objectives`
        });
    }
    
    return decisions;
  }

  /**
   * Identify potential blockers
   */
  identifyBlockers(agent, task, phase) {
    const blockers = [];
    
    // 20% chance to identify a blocker
    if (Math.random() < 0.2) {
      blockers.push({
        agent: agent.name,
        blocker: `${phase} constraint: ${this.generateBlocker(phase)}`,
        severity: Math.random() < 0.5 ? 'high' : 'medium',
        mitigation: 'Requires cross-functional collaboration'
      });
    }
    
    return blockers;
  }

  /**
   * Extract learning from workflow execution
   */
  async extractLearning(results) {
    const learning = {
      successfulAgents: [],
      patterns: [],
      optimizations: [],
      warnings: []
    };
    
    // Identify successful agents (high confidence, no blockers)
    Object.values(results.phases).forEach(phase => {
      phase.agentsUsed.forEach((agentId, index) => {
        if (phase.confidence > 0.8 && phase.blockers.length === 0) {
          learning.successfulAgents.push(agentId);
        }
      });
      
      // Extract patterns from insights
      if (phase.insights.length > 3) {
        learning.patterns.push({
          phase: phase.phase,
          pattern: 'High collaboration required',
          confidence: phase.confidence
        });
      }
    });
    
    // Generate optimizations
    if (results.totalAgentsActivated > 50) {
      learning.optimizations.push('Consider reducing agent count for efficiency');
    }
    
    if (results.duration > 10000) {
      learning.optimizations.push('Parallelize phase execution where possible');
    }
    
    return learning;
  }

  /**
   * Determine if another iteration is needed
   */
  shouldIterate(results) {
    // Check for high-severity blockers
    const hasHighSeverityBlockers = Object.values(results.phases).some(phase =>
      phase.blockers.some(b => b.severity === 'high')
    );
    
    // Check overall confidence
    const avgConfidence = Object.values(results.phases).reduce(
      (sum, phase) => sum + phase.confidence, 0
    ) / Object.keys(results.phases).length;
    
    // Iterate if blockers exist or confidence is low, but limit iterations
    return (hasHighSeverityBlockers || avgConfidence < 0.75) && 
           this.iterations < 3;
  }

  /**
   * Generate final comprehensive report
   */
  generateFinalReport(results) {
    const report = {
      ...results,
      summary: {
        totalPhases: Object.keys(results.phases).length,
        totalAgentsActivated: results.totalAgentsActivated,
        avgConfidence: Object.values(results.phases).reduce(
          (sum, p) => sum + p.confidence, 0
        ) / Object.keys(results.phases).length,
        totalInsights: Object.values(results.phases).reduce(
          (sum, p) => sum + p.insights.length, 0
        ),
        totalDecisions: Object.values(results.phases).reduce(
          (sum, p) => sum + p.decisions.length, 0
        ),
        totalBlockers: Object.values(results.phases).reduce(
          (sum, p) => sum + p.blockers.length, 0
        )
      },
      recommendations: this.generateRecommendations(results),
      nextSteps: this.generateNextSteps(results),
      learningApplied: this.iterations > 1
    };
    
    return report;
  }

  /**
   * Find relevant learning from history
   */
  findRelevantLearning(task) {
    // Simple keyword matching for now
    const taskKeywords = this.extractKeywords(task);
    
    return this.learningHistory.find(entry => {
      const entryKeywords = this.extractKeywords(entry.task);
      const overlap = taskKeywords.filter(k => entryKeywords.includes(k));
      return overlap.length > taskKeywords.length * 0.5;
    });
  }

  /**
   * Helper methods
   */
  extractKeywords(text) {
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['with', 'from', 'that', 'this', 'will'].includes(word));
  }

  isAgentRelevant(agent, keywords) {
    const agentText = [
      agent.name,
      agent.role,
      ...agent.capabilities
    ].join(' ').toLowerCase();
    
    return keywords.some(keyword => agentText.includes(keyword));
  }

  generateInsightContent(capability, task) {
    const insights = {
      'System design': 'consider microservices architecture for better scalability',
      'Security analysis': 'implement zero-trust security model',
      'Performance optimization': 'use caching layers to reduce latency',
      'User research': 'conduct A/B testing for feature validation',
      'API design': 'follow RESTful principles with versioning',
      'Database design': 'consider sharding for horizontal scaling'
    };
    
    return insights[capability] || 'requires further analysis';
  }

  generateTechStack(role) {
    const stacks = {
      'Frontend': 'React + TypeScript + Next.js',
      'Backend': 'Node.js + Express + PostgreSQL',
      'Mobile': 'React Native + Redux',
      'Cloud': 'AWS + Kubernetes + Terraform'
    };
    
    return stacks[role.split(' ')[0]] || 'modern tech stack';
  }

  generateArchitecturePattern(role) {
    const patterns = {
      'System': 'event-driven microservices',
      'Frontend': 'component-based architecture',
      'Backend': 'hexagonal architecture',
      'Data': 'CQRS with event sourcing'
    };
    
    return patterns[role.split(' ')[0]] || 'modular architecture';
  }

  generateSecurityMeasure(role) {
    const measures = {
      'Security': 'multi-factor authentication',
      'Cloud': 'encryption at rest and in transit',
      'Network': 'Web Application Firewall',
      'DevSecOps': 'automated security scanning'
    };
    
    return measures[role.split(' ')[0]] || 'defense in depth strategy';
  }

  generateBlocker(phase) {
    const blockers = {
      'brainstorm': 'Unclear requirements need stakeholder clarification',
      'development': 'Technical debt in legacy systems',
      'security': 'Compliance requirements not fully defined',
      'testing': 'Test environment not matching production'
    };
    
    return blockers[phase] || 'Resource constraints';
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    // Based on confidence levels
    const lowConfidencePhases = Object.values(results.phases)
      .filter(p => p.confidence < 0.7)
      .map(p => p.phase);
    
    if (lowConfidencePhases.length > 0) {
      recommendations.push({
        priority: 'high',
        recommendation: `Focus on improving ${lowConfidencePhases.join(', ')} phases`,
        action: 'Conduct detailed review with domain experts'
      });
    }
    
    // Based on blockers
    const criticalBlockers = Object.values(results.phases)
      .flatMap(p => p.blockers)
      .filter(b => b.severity === 'high');
    
    if (criticalBlockers.length > 0) {
      recommendations.push({
        priority: 'critical',
        recommendation: 'Address high-severity blockers immediately',
        action: 'Form task force to resolve blockers'
      });
    }
    
    return recommendations;
  }

  generateNextSteps(results) {
    return [
      'Review and prioritize all decisions made',
      'Create implementation roadmap based on phases',
      'Assign team leads for each phase',
      'Set up monitoring for key metrics',
      'Schedule regular review cycles'
    ];
  }

  async simulateProcessing(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export default new UltrathinkWorkflow();