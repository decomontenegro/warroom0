/**
 * Intelligent Orchestrator System
 * Analisa respostas, identifica consensos/divergências, e orquestra múltiplas rodadas
 */

import agents100Data from '../../warroom-agents-100.json' with { type: 'json' };

export class IntelligentOrchestrator {
  constructor() {
    this.allAgents = agents100Data.warRoomTechInnovationRoles.agents;
    this.activeRounds = new Map(); // Track active orchestration rounds
    this.learningBank = new Map(); // Store patterns and insights
    this.consensusThreshold = 0.7; // 70% agreement needed for consensus
  }

  /**
   * Main orchestration method - Analyzes responses and orchestrates multiple rounds
   */
  async orchestrateDiscussion(task, initialResponses, options = {}) {
    console.log('🎯 Intelligent Orchestrator activated');
    
    const orchestrationId = `orch-${Date.now()}`;
    const round = {
      id: orchestrationId,
      task,
      rounds: [],
      consensusPoints: [],
      divergencePoints: [],
      unresolvedIssues: [],
      finalRecommendations: []
    };

    // Round 1: Analyze initial responses
    const round1Analysis = await this.analyzeResponses(initialResponses);
    round.rounds.push({
      number: 1,
      type: 'initial',
      agentCount: initialResponses.length,
      analysis: round1Analysis
    });

    // Identify what needs validation or deeper exploration
    const validationNeeds = this.identifyValidationNeeds(round1Analysis);
    
    // Round 2: Targeted validation with selected agents
    if (validationNeeds.length > 0) {
      const round2Responses = await this.executeValidationRound(
        task, 
        validationNeeds, 
        round1Analysis
      );
      
      const round2Analysis = await this.analyzeResponses(round2Responses);
      round.rounds.push({
        number: 2,
        type: 'validation',
        agentCount: round2Responses.length,
        analysis: round2Analysis,
        validationFocus: validationNeeds
      });
    }

    // Round 3: Bring in new specialists based on discovered gaps
    const gaps = this.identifyGaps(round);
    if (gaps.length > 0) {
      const specialistResponses = await this.executeSpecialistRound(
        task,
        gaps,
        round
      );
      
      const round3Analysis = await this.analyzeResponses(specialistResponses);
      round.rounds.push({
        number: 3,
        type: 'specialist',
        agentCount: specialistResponses.length,
        analysis: round3Analysis,
        gaps: gaps
      });
    }

    // Consolidate all findings
    const consolidation = await this.consolidateFindings(round);
    
    // Final round: Get consensus on consolidated findings
    const finalValidation = await this.executeFinalConsensusRound(
      task,
      consolidation
    );
    
    round.finalRecommendations = finalValidation.recommendations;
    round.consensusLevel = finalValidation.consensusLevel;
    
    // Store learning for future use
    this.updateLearningBank(task, round);
    
    return this.generateOrchestrationReport(round);
  }

  /**
   * Analyze responses to find consensus and divergences
   */
  async analyzeResponses(responses) {
    const analysis = {
      totalResponses: responses.length,
      themes: new Map(),
      consensusPoints: [],
      divergencePoints: [],
      sentimentDistribution: {},
      keyInsights: [],
      concerns: []
    };

    // Extract themes and patterns
    responses.forEach(response => {
      const themes = this.extractThemes(response.content);
      themes.forEach(theme => {
        if (!analysis.themes.has(theme)) {
          analysis.themes.set(theme, {
            count: 0,
            agents: [],
            sentiment: [],
            details: []
          });
        }
        const themeData = analysis.themes.get(theme);
        themeData.count++;
        themeData.agents.push(response.agent);
        themeData.sentiment.push(this.analyzeSentiment(response.content, theme));
        themeData.details.push(this.extractThemeDetails(response.content, theme));
      });
    });

    // Identify consensus (>70% agreement)
    analysis.themes.forEach((data, theme) => {
      const agreementRate = data.count / responses.length;
      if (agreementRate >= this.consensusThreshold) {
        analysis.consensusPoints.push({
          theme,
          agreementRate,
          agents: data.agents,
          strength: this.calculateConsensusStrength(data.sentiment)
        });
      } else if (agreementRate < 0.3 && data.count > 1) {
        // Identify divergences (mentioned by few but strongly)
        const divergenceStrength = this.calculateDivergenceStrength(data);
        if (divergenceStrength > 0.5) {
          analysis.divergencePoints.push({
            theme,
            mentionRate: agreementRate,
            agents: data.agents,
            divergenceStrength,
            viewpoints: this.extractViewpoints(data.details)
          });
        }
      }
    });

    // Extract key insights and concerns
    analysis.keyInsights = this.extractKeyInsights(responses);
    analysis.concerns = this.extractConcerns(responses);

    return analysis;
  }

  /**
   * Identify what needs validation based on analysis
   */
  identifyValidationNeeds(analysis) {
    const validationNeeds = [];

    // 1. Validate divergence points
    analysis.divergencePoints.forEach(divergence => {
      validationNeeds.push({
        type: 'divergence_resolution',
        topic: divergence.theme,
        viewpoints: divergence.viewpoints,
        originalAgents: divergence.agents,
        requiredExpertise: this.identifyRequiredExpertise(divergence.theme)
      });
    });

    // 2. Validate concerns
    analysis.concerns.forEach(concern => {
      if (concern.severity === 'high') {
        validationNeeds.push({
          type: 'concern_validation',
          topic: concern.issue,
          raisedBy: concern.agents,
          requiredExpertise: concern.relatedExpertise
        });
      }
    });

    // 3. Validate weak consensus points
    analysis.consensusPoints
      .filter(cp => cp.strength < 0.6)
      .forEach(weakConsensus => {
        validationNeeds.push({
          type: 'consensus_strengthening',
          topic: weakConsensus.theme,
          currentStrength: weakConsensus.strength,
          requiredExpertise: ['Senior Architects', 'Domain Experts']
        });
      });

    return validationNeeds;
  }

  /**
   * Execute validation round with carefully selected agents
   */
  async executeValidationRound(task, validationNeeds, previousAnalysis) {
    console.log(`🔍 Executing validation round for ${validationNeeds.length} topics`);
    
    const selectedAgents = new Set();
    const validationContext = {
      task,
      previousFindings: this.summarizePreviousFindings(previousAnalysis),
      validationFocus: []
    };

    // Select agents for each validation need
    validationNeeds.forEach(need => {
      const agents = this.selectAgentsForValidation(need);
      agents.forEach(agent => selectedAgents.add(agent));
      validationContext.validationFocus.push({
        topic: need.topic,
        type: need.type,
        specificQuestions: this.generateValidationQuestions(need)
      });
    });

    // Execute parallel validation requests
    const responses = await this.executeAgentRequests(
      Array.from(selectedAgents),
      task,
      'validation',
      validationContext
    );

    return responses;
  }

  /**
   * Select optimal agents for validation
   */
  selectAgentsForValidation(validationNeed) {
    const selectedAgents = [];
    
    // 1. Get domain experts
    const domainExperts = this.allAgents.filter(agent => 
      validationNeed.requiredExpertise.some(expertise => 
        agent.capabilities.includes(expertise) || 
        agent.role.includes(expertise)
      )
    );

    // 2. Add senior/lead agents for authority
    const seniorAgents = this.allAgents.filter(agent =>
      agent.role.includes('Lead') || 
      agent.role.includes('Principal') ||
      agent.role.includes('Senior')
    );

    // 3. Add agents with opposing viewpoints for divergence resolution
    if (validationNeed.type === 'divergence_resolution') {
      const opposingAgents = this.allAgents.filter(agent =>
        !validationNeed.originalAgents.includes(agent.name) &&
        this.hasOpposingPerspective(agent, validationNeed.topic)
      );
      selectedAgents.push(...opposingAgents.slice(0, 2));
    }

    // Combine and limit
    selectedAgents.push(...domainExperts.slice(0, 3));
    selectedAgents.push(...seniorAgents.slice(0, 2));

    return [...new Set(selectedAgents)]; // Remove duplicates
  }

  /**
   * Identify gaps that require specialist input
   */
  identifyGaps(orchestrationRound) {
    const gaps = [];
    const coveredTopics = new Set();
    
    // Analyze all rounds to find what's been covered
    orchestrationRound.rounds.forEach(round => {
      round.analysis.themes.forEach((data, theme) => {
        coveredTopics.add(theme.toLowerCase());
      });
    });

    // Common technical areas that should be covered
    const requiredAreas = [
      { area: 'security', keywords: ['security', 'authentication', 'encryption'] },
      { area: 'performance', keywords: ['performance', 'optimization', 'speed'] },
      { area: 'scalability', keywords: ['scale', 'growth', 'capacity'] },
      { area: 'testing', keywords: ['test', 'qa', 'quality'] },
      { area: 'monitoring', keywords: ['monitor', 'observability', 'metrics'] },
      { area: 'cost', keywords: ['cost', 'budget', 'roi'] },
      { area: 'user_experience', keywords: ['ux', 'usability', 'interface'] },
      { area: 'data_privacy', keywords: ['privacy', 'gdpr', 'compliance'] }
    ];

    requiredAreas.forEach(({ area, keywords }) => {
      const isCovered = keywords.some(keyword => 
        Array.from(coveredTopics).some(topic => topic.includes(keyword))
      );
      
      if (!isCovered) {
        gaps.push({
          area,
          importance: this.calculateGapImportance(area, orchestrationRound.task),
          suggestedSpecialists: this.identifySpecialistsForGap(area)
        });
      }
    });

    return gaps.filter(gap => gap.importance > 0.5);
  }

  /**
   * Execute specialist round for identified gaps
   */
  async executeSpecialistRound(task, gaps, previousRounds) {
    console.log(`👨‍🔬 Bringing in ${gaps.length} specialist areas`);
    
    const specialists = new Set();
    const specialistContext = {
      task,
      previousFindings: this.summarizeAllRounds(previousRounds),
      focusAreas: gaps.map(g => g.area),
      specificQuestions: []
    };

    // Select specialists for each gap
    gaps.forEach(gap => {
      const gapSpecialists = this.selectSpecialistsForGap(gap);
      gapSpecialists.forEach(s => specialists.add(s));
      specialistContext.specificQuestions.push(...this.generateGapQuestions(gap, task));
    });

    const responses = await this.executeAgentRequests(
      Array.from(specialists),
      task,
      'specialist',
      specialistContext
    );

    return responses;
  }

  /**
   * Consolidate all findings from all rounds
   */
  async consolidateFindings(orchestrationRound) {
    const consolidation = {
      unanimousAgreements: [],
      strongConsensus: [],
      unresolvedDebates: [],
      criticalInsights: [],
      riskFactors: [],
      opportunities: [],
      recommendedApproach: null
    };

    // Analyze consensus evolution across rounds
    const consensusEvolution = this.analyzeConsensusEvolution(orchestrationRound.rounds);
    
    // Extract unanimous agreements (100% consensus)
    consolidation.unanimousAgreements = consensusEvolution
      .filter(item => item.finalAgreement === 1.0)
      .map(item => ({
        point: item.theme,
        confidence: 'absolute',
        supportedBy: item.supporters
      }));

    // Extract strong consensus (>85%)
    consolidation.strongConsensus = consensusEvolution
      .filter(item => item.finalAgreement >= 0.85 && item.finalAgreement < 1.0)
      .map(item => ({
        point: item.theme,
        agreementLevel: item.finalAgreement,
        confidence: 'high',
        minorityView: item.dissenters
      }));

    // Identify unresolved debates
    consolidation.unresolvedDebates = this.identifyUnresolvedDebates(orchestrationRound);

    // Extract critical insights and patterns
    consolidation.criticalInsights = this.extractCriticalInsights(orchestrationRound);
    consolidation.riskFactors = this.identifyRiskFactors(orchestrationRound);
    consolidation.opportunities = this.identifyOpportunities(orchestrationRound);

    // Generate recommended approach
    consolidation.recommendedApproach = this.synthesizeRecommendedApproach(consolidation);

    return consolidation;
  }

  /**
   * Execute final consensus round with key decision makers
   */
  async executeFinalConsensusRound(task, consolidation) {
    console.log('🏁 Final consensus round with decision makers');
    
    // Select key decision-making agents
    const decisionMakers = this.selectDecisionMakers();
    
    const finalContext = {
      task,
      consolidatedFindings: consolidation,
      requiresDecision: true,
      decisionPoints: this.extractDecisionPoints(consolidation)
    };

    const responses = await this.executeAgentRequests(
      decisionMakers,
      task,
      'final_consensus',
      finalContext
    );

    // Analyze final consensus
    const finalAnalysis = await this.analyzeResponses(responses);
    
    return {
      recommendations: this.extractFinalRecommendations(finalAnalysis, consolidation),
      consensusLevel: this.calculateFinalConsensusLevel(finalAnalysis),
      implementation: this.generateImplementationPlan(finalAnalysis, consolidation)
    };
  }

  /**
   * Helper Methods
   */
  
  extractThemes(content) {
    // Simplified theme extraction - in production would use NLP
    const themes = [];
    const themeKeywords = {
      'architecture': ['architecture', 'design', 'structure', 'pattern'],
      'security': ['security', 'authentication', 'encryption', 'protection'],
      'performance': ['performance', 'speed', 'optimization', 'efficiency'],
      'scalability': ['scale', 'scalability', 'growth', 'expansion'],
      'user_experience': ['ux', 'user experience', 'interface', 'usability'],
      'data_management': ['database', 'data', 'storage', 'persistence'],
      'integration': ['integration', 'api', 'connection', 'interface'],
      'testing': ['test', 'testing', 'qa', 'quality'],
      'deployment': ['deploy', 'deployment', 'devops', 'ci/cd'],
      'cost': ['cost', 'budget', 'expense', 'pricing']
    };

    const lowerContent = content.toLowerCase();
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        themes.push(theme);
      }
    });

    return themes;
  }

  analyzeSentiment(content, theme) {
    // Simplified sentiment analysis
    const positiveWords = ['excellent', 'great', 'recommend', 'optimal', 'best'];
    const negativeWords = ['concern', 'risk', 'problem', 'issue', 'difficult'];
    const neutralWords = ['consider', 'option', 'possible', 'alternative'];

    const lowerContent = content.toLowerCase();
    let sentiment = 0;
    
    positiveWords.forEach(word => {
      if (lowerContent.includes(word)) sentiment += 0.2;
    });
    
    negativeWords.forEach(word => {
      if (lowerContent.includes(word)) sentiment -= 0.2;
    });

    return Math.max(-1, Math.min(1, sentiment)); // Clamp between -1 and 1
  }

  calculateConsensusStrength(sentiments) {
    if (sentiments.length === 0) return 0;
    
    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - avgSentiment, 2), 0) / sentiments.length;
    
    // High consensus = high average sentiment + low variance
    return Math.max(0, avgSentiment) * (1 - Math.min(1, variance));
  }

  async executeAgentRequests(agents, task, phase, context) {
    // Simulate agent responses - in production would call actual AI service
    console.log(`Executing ${agents.length} agent requests for ${phase} phase`);
    
    const responses = [];
    for (const agent of agents) {
      responses.push({
        agent: agent.name,
        role: agent.role,
        content: this.generateAgentResponse(agent, task, phase, context),
        timestamp: new Date()
      });
    }
    
    return responses;
  }

  generateAgentResponse(agent, task, phase, context) {
    // Simulate intelligent responses based on agent role and context
    const responseTemplates = {
      validation: `As ${agent.name}, validating the ${context.validationFocus?.[0]?.topic || 'topic'}: I ${Math.random() > 0.5 ? 'agree' : 'have concerns'} with the current approach...`,
      specialist: `From my expertise in ${agent.capabilities[0]}, regarding ${task}: The ${context.focusAreas?.[0] || 'area'} aspect requires...`,
      final_consensus: `Based on all findings, as ${agent.role}, I recommend...`
    };

    return responseTemplates[phase] || `${agent.name} analysis for ${task}`;
  }

  selectDecisionMakers() {
    // Select senior leadership and key architects
    return this.allAgents.filter(agent => 
      agent.role.includes('Chief') || 
      agent.role.includes('Lead Architect') ||
      agent.role.includes('Principal') ||
      agent.name.includes('CTO') ||
      agent.name.includes('VP')
    ).slice(0, 5);
  }

  generateOrchestrationReport(round) {
    return {
      orchestrationId: round.id,
      task: round.task,
      totalRounds: round.rounds.length,
      totalAgentsInvolved: new Set(
        round.rounds.flatMap(r => r.analysis.themes.values())
          .flatMap(t => t.agents)
      ).size,
      consensusAchieved: round.consensusLevel > 0.8,
      summary: {
        unanimousPoints: round.finalRecommendations.filter(r => r.consensus === 1.0).length,
        strongAgreements: round.consensusPoints.length,
        unresolvedDebates: round.unresolvedIssues.length,
        criticalFindings: round.finalRecommendations.filter(r => r.priority === 'critical').length
      },
      recommendations: round.finalRecommendations,
      nextSteps: this.generateNextSteps(round),
      confidenceLevel: this.calculateOverallConfidence(round)
    };
  }

  // Additional helper methods would go here...
  extractThemeDetails(content, theme) {
    return { theme, detail: content.substring(0, 100) };
  }

  calculateDivergenceStrength(data) {
    return Math.random() * 0.8 + 0.2; // Simplified
  }

  extractViewpoints(details) {
    return details.map(d => d.detail);
  }

  extractKeyInsights(responses) {
    return responses.slice(0, 3).map(r => ({
      insight: `Key insight from ${r.agent}`,
      importance: Math.random()
    }));
  }

  extractConcerns(responses) {
    return responses
      .filter(() => Math.random() > 0.7)
      .map(r => ({
        issue: `Concern from ${r.agent}`,
        severity: Math.random() > 0.5 ? 'high' : 'medium',
        agents: [r.agent]
      }));
  }

  updateLearningBank(task, round) {
    this.learningBank.set(task, {
      patterns: round.consensusPoints,
      effectiveAgents: this.identifyEffectiveAgents(round),
      timestamp: Date.now()
    });
  }

  identifyEffectiveAgents(round) {
    // Identify agents who contributed most to consensus
    return round.rounds
      .flatMap(r => r.analysis.consensusPoints)
      .flatMap(cp => cp.agents)
      .slice(0, 10);
  }

  generateNextSteps(round) {
    return [
      'Implement unanimous agreements immediately',
      'Form working groups for unresolved debates',
      'Schedule follow-up reviews for critical decisions',
      'Monitor implementation metrics'
    ];
  }

  calculateOverallConfidence(round) {
    const factors = [
      round.consensusLevel * 0.4,
      (round.unanimousAgreements?.length > 0 ? 0.2 : 0),
      (round.unresolvedIssues?.length < 3 ? 0.2 : 0),
      (round.rounds.length >= 3 ? 0.2 : 0.1)
    ];
    
    return factors.reduce((a, b) => a + b, 0);
  }
}

// Export singleton instance
export default new IntelligentOrchestrator();