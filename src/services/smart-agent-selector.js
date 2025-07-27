/**
 * Smart Agent Selector - Sistema inteligente de seleção de agentes especializados
 * Seleciona os melhores agentes baseado em análise semântica e contexto
 */

import agents100Data from '../../warroom-agents-100.json' with { type: 'json' };

export class SmartAgentSelector {
  constructor() {
    this.allAgents = agents100Data.warRoomTechInnovationRoles.agents;
    
    // Mapeamento de especialidades por domínio
    this.domainSpecialists = {
      blockchain: [
        'blockchain-specialist',
        'smart-contract-developer',
        'defi-expert',
        'web3-architect',
        'crypto-economist',
        'security-architect'
      ],
      ai_ml: [
        'ai-ml-engineer',
        'data-scientist',
        'ml-ops-engineer',
        'ai-researcher',
        'neural-network-specialist'
      ],
      security: [
        'security-architect',
        'penetration-tester',
        'security-analyst',
        'compliance-officer',
        'cryptography-expert'
      ],
      architecture: [
        'system-architect',
        'solution-architect',
        'enterprise-architect',
        'cloud-architect',
        'technical-architect'
      ],
      frontend: [
        'frontend-architect',
        'ui-ux-designer',
        'react-developer',
        'mobile-developer',
        'design-system-architect'
      ],
      backend: [
        'backend-architect',
        'api-designer',
        'database-architect',
        'microservices-expert',
        'devops-engineer'
      ],
      data: [
        'data-architect',
        'database-administrator',
        'data-engineer',
        'analytics-lead',
        'business-intelligence-analyst'
      ],
      business: [
        'business-analyst',
        'product-manager',
        'project-manager',
        'chief-strategy-officer',
        'innovation-strategist'
      ]
    };

    // Scoring weights
    this.weights = {
      domainMatch: 10,
      capabilityMatch: 5,
      roleMatch: 3,
      experienceMatch: 2,
      contextMatch: 4
    };
  }

  /**
   * Seleciona agentes otimizados para o documento analisado
   */
  async selectAgents(documentAnalysis, options = {}) {
    console.log('🎯 Starting intelligent agent selection...');
    
    const {
      maxAgents = 10,
      minScore = 5,
      requireLeadership = true,
      balanceExpertise = true
    } = options;

    // Calcular scores para todos os agentes
    const agentScores = this.calculateAgentScores(documentAnalysis);
    
    // Ordenar por score
    const rankedAgents = Array.from(agentScores.entries())
      .sort((a, b) => b[1].totalScore - a[1].totalScore);

    // Selecionar agentes
    let selectedAgents = [];
    
    if (requireLeadership) {
      // Garantir que temos líderes
      selectedAgents = this.ensureLeadership(rankedAgents);
    }

    if (balanceExpertise) {
      // Balancear diferentes áreas de expertise
      selectedAgents = this.balanceExpertise(rankedAgents, selectedAgents, maxAgents);
    } else {
      // Selecionar top N
      selectedAgents = rankedAgents
        .filter(([_, score]) => score.totalScore >= minScore)
        .slice(0, maxAgents)
        .map(([agent, score]) => ({ agent, score }));
    }

    // Formar equipes por fase
    const teams = this.formTeams(selectedAgents, documentAnalysis);

    return {
      selectedAgents,
      teams,
      totalSelected: selectedAgents.length,
      averageScore: this.calculateAverageScore(selectedAgents),
      coverage: this.calculateCoverage(selectedAgents, documentAnalysis)
    };
  }

  /**
   * Calcula scores para cada agente
   */
  calculateAgentScores(documentAnalysis) {
    const scores = new Map();

    this.allAgents.forEach(agent => {
      const score = {
        domainScore: this.calculateDomainScore(agent, documentAnalysis),
        capabilityScore: this.calculateCapabilityScore(agent, documentAnalysis),
        roleScore: this.calculateRoleScore(agent, documentAnalysis),
        contextScore: this.calculateContextScore(agent, documentAnalysis),
        totalScore: 0
      };

      score.totalScore = 
        score.domainScore * this.weights.domainMatch +
        score.capabilityScore * this.weights.capabilityMatch +
        score.roleScore * this.weights.roleMatch +
        score.contextScore * this.weights.contextMatch;

      scores.set(agent, score);
    });

    return scores;
  }

  /**
   * Calcula score de domínio
   */
  calculateDomainScore(agent, analysis) {
    let score = 0;

    // Verificar match com domínios técnicos identificados
    analysis.technicalDomain.forEach(domain => {
      const specialists = this.domainSpecialists[domain.domain] || [];
      if (specialists.includes(agent.id)) {
        score += 1.0;
      }
    });

    // Verificar keywords do domínio nas capabilities
    const domainKeywords = analysis.technicalDomain
      .flatMap(d => this.getDomainKeywords(d.domain));
    
    agent.capabilities.forEach(capability => {
      const capLower = capability.toLowerCase();
      domainKeywords.forEach(keyword => {
        if (capLower.includes(keyword)) {
          score += 0.2;
        }
      });
    });

    return Math.min(score, 1.0);
  }

  /**
   * Calcula score de capacidades
   */
  calculateCapabilityScore(agent, analysis) {
    let score = 0;
    const concepts = [
      ...analysis.concepts.technical,
      ...analysis.concepts.architectural,
      ...analysis.concepts.mathematical
    ];

    agent.capabilities.forEach(capability => {
      const capLower = capability.toLowerCase();
      
      concepts.forEach(concept => {
        if (capLower.includes(concept.toLowerCase())) {
          score += 0.3;
        }
      });

      // Bonus para capacidades específicas
      if (analysis.structure.hasCodeBlocks && capLower.includes('code')) {
        score += 0.2;
      }
      if (analysis.structure.hasMathFormulas && capLower.includes('math')) {
        score += 0.2;
      }
      if (analysis.structure.hasDiagrams && capLower.includes('architect')) {
        score += 0.2;
      }
    });

    return Math.min(score, 1.0);
  }

  /**
   * Calcula score do papel/role
   */
  calculateRoleScore(agent, analysis) {
    let score = 0;
    const roleLower = agent.role.toLowerCase();

    // Match com tipo de documento
    if (analysis.type === 'whitepaper' && roleLower.includes('research')) {
      score += 0.5;
    }
    if (analysis.type === 'technical_spec' && roleLower.includes('architect')) {
      score += 0.5;
    }
    if (analysis.type === 'architecture_doc' && roleLower.includes('architect')) {
      score += 0.5;
    }

    // Match com complexidade
    if (analysis.complexity.complexity === 'high') {
      if (roleLower.includes('lead') || roleLower.includes('chief') || roleLower.includes('senior')) {
        score += 0.3;
      }
    }

    // Match com elementos específicos (com verificação de segurança)
    if (analysis.keyElements) {
      if (analysis.keyElements.formulas && analysis.keyElements.formulas.length > 0 && roleLower.includes('scientist')) {
        score += 0.2;
      }
      if (analysis.keyElements.codeSnippets && analysis.keyElements.codeSnippets.length > 0 && roleLower.includes('developer')) {
        score += 0.2;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calcula score de contexto
   */
  calculateContextScore(agent, analysis) {
    let score = 0;

    // Análise específica para whitepapers
    if (analysis.whitepaperAnalysis) {
      const wp = analysis.whitepaperAnalysis;
      
      if (wp.innovations.length > 0 && agent.role.includes('Innovation')) {
        score += 0.4;
      }
      if (wp.methodology && agent.capabilities.some(c => c.includes('methodology'))) {
        score += 0.3;
      }
      if (wp.results && agent.capabilities.some(c => c.includes('analysis'))) {
        score += 0.3;
      }
    }

    // Match com problema/solução
    const problemSolution = (analysis.whitepaperAnalysis?.problem || '') + 
                          (analysis.whitepaperAnalysis?.solution || '');
    
    if (problemSolution) {
      agent.capabilities.forEach(cap => {
        if (problemSolution.toLowerCase().includes(cap.toLowerCase())) {
          score += 0.1;
        }
      });
    }

    return Math.min(score, 1.0);
  }

  /**
   * Garante presença de liderança
   */
  ensureLeadership(rankedAgents) {
    const leaders = [];
    const leaderRoles = ['Chief', 'Lead', 'Principal', 'Head', 'Director'];
    
    rankedAgents.forEach(([agent, score]) => {
      if (leaderRoles.some(role => agent.role.includes(role))) {
        leaders.push({ agent, score });
      }
    });

    // Pegar pelo menos 2 líderes
    return leaders.slice(0, 2);
  }

  /**
   * Balanceia expertise entre diferentes áreas
   */
  balanceExpertise(rankedAgents, preSelected, maxAgents) {
    const selected = [...preSelected];
    const expertiseAreas = new Map();

    // Categorizar agentes por área
    rankedAgents.forEach(([agent, score]) => {
      const area = this.categorizeExpertise(agent);
      if (!expertiseAreas.has(area)) {
        expertiseAreas.set(area, []);
      }
      expertiseAreas.get(area).push({ agent, score });
    });

    // Selecionar de cada área
    const areasToSelect = Math.min(expertiseAreas.size, maxAgents - selected.length);
    const perArea = Math.floor((maxAgents - selected.length) / areasToSelect);

    expertiseAreas.forEach((agents, area) => {
      const toSelect = agents
        .filter(({ agent }) => !selected.some(s => s.agent.id === agent.id))
        .slice(0, perArea);
      
      selected.push(...toSelect);
    });

    // Preencher com top scores se ainda houver espaço
    if (selected.length < maxAgents) {
      const remaining = rankedAgents
        .filter(([agent]) => !selected.some(s => s.agent.id === agent.id))
        .slice(0, maxAgents - selected.length)
        .map(([agent, score]) => ({ agent, score }));
      
      selected.push(...remaining);
    }

    return selected.slice(0, maxAgents);
  }

  /**
   * Forma equipes por fase do projeto
   */
  formTeams(selectedAgents, analysis) {
    const teams = {
      analysis: [],
      design: [],
      implementation: [],
      validation: [],
      optimization: []
    };

    selectedAgents.forEach(({ agent }) => {
      // Fase de análise
      if (agent.role.includes('Analyst') || agent.role.includes('Research') || 
          agent.role.includes('Architect')) {
        teams.analysis.push(agent);
      }

      // Fase de design
      if (agent.role.includes('Architect') || agent.role.includes('Designer') ||
          agent.role.includes('Lead')) {
        teams.design.push(agent);
      }

      // Fase de implementação
      if (agent.role.includes('Developer') || agent.role.includes('Engineer') ||
          agent.role.includes('Specialist')) {
        teams.implementation.push(agent);
      }

      // Fase de validação
      if (agent.role.includes('Tester') || agent.role.includes('Security') ||
          agent.role.includes('Quality')) {
        teams.validation.push(agent);
      }

      // Fase de otimização
      if (agent.role.includes('Performance') || agent.role.includes('Optimization') ||
          agent.role.includes('DevOps')) {
        teams.optimization.push(agent);
      }
    });

    // Garantir que cada equipe tenha pelo menos um membro
    Object.keys(teams).forEach(phase => {
      if (teams[phase].length === 0 && selectedAgents.length > 0) {
        teams[phase].push(selectedAgents[0].agent);
      }
    });

    return teams;
  }

  /**
   * Helpers
   */
  getDomainKeywords(domain) {
    const keywords = {
      blockchain: ['blockchain', 'smart contract', 'defi', 'crypto', 'web3', 'ethereum'],
      ai_ml: ['machine learning', 'ai', 'neural', 'model', 'data science', 'algorithm'],
      security: ['security', 'encryption', 'authentication', 'vulnerability', 'pentest'],
      distributed_systems: ['distributed', 'scalability', 'microservice', 'cluster', 'cloud']
    };
    return keywords[domain] || [];
  }

  categorizeExpertise(agent) {
    const role = agent.role.toLowerCase();
    
    if (role.includes('frontend') || role.includes('ui') || role.includes('ux')) {
      return 'frontend';
    }
    if (role.includes('backend') || role.includes('api') || role.includes('server')) {
      return 'backend';
    }
    if (role.includes('data') || role.includes('database') || role.includes('analytics')) {
      return 'data';
    }
    if (role.includes('security') || role.includes('penetration')) {
      return 'security';
    }
    if (role.includes('architect') || role.includes('design')) {
      return 'architecture';
    }
    if (role.includes('business') || role.includes('product') || role.includes('strategy')) {
      return 'business';
    }
    if (role.includes('devops') || role.includes('cloud') || role.includes('infrastructure')) {
      return 'infrastructure';
    }
    
    return 'general';
  }

  calculateAverageScore(selectedAgents) {
    if (selectedAgents.length === 0) return 0;
    
    const totalScore = selectedAgents.reduce((sum, { score }) => sum + score.totalScore, 0);
    return totalScore / selectedAgents.length;
  }

  calculateCoverage(selectedAgents, analysis) {
    const coverage = {
      domains: new Set(),
      capabilities: new Set(),
      phases: new Set()
    };

    selectedAgents.forEach(({ agent }) => {
      // Domínios cobertos
      const expertise = this.categorizeExpertise(agent);
      coverage.domains.add(expertise);

      // Capacidades cobertas
      agent.capabilities.forEach(cap => coverage.capabilities.add(cap));

      // Fases cobertas
      if (agent.role.includes('Analyst')) coverage.phases.add('analysis');
      if (agent.role.includes('Architect')) coverage.phases.add('design');
      if (agent.role.includes('Developer')) coverage.phases.add('implementation');
      if (agent.role.includes('Tester')) coverage.phases.add('testing');
    });

    return {
      domainCoverage: coverage.domains.size / 8, // 8 main domains
      capabilityCoverage: coverage.capabilities.size / 50, // estimate
      phaseCoverage: coverage.phases.size / 5, // 5 main phases
      overallCoverage: (coverage.domains.size + coverage.capabilities.size + coverage.phases.size) / 63
    };
  }
}

export default new SmartAgentSelector();