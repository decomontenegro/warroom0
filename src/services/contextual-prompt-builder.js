/**
 * Contextual Prompt Builder - Sistema avançado de construção de prompts contextualizados
 * Gera prompts especializados baseados no tipo de documento, agente e contexto
 */

export class ContextualPromptBuilder {
  constructor() {
    // Templates base por tipo de análise
    this.analysisTemplates = {
      whitepaper: {
        system: `You are {agentName}, a {agentRole}. You are analyzing a technical whitepaper about {domain}.
Your expertise includes: {capabilities}.
Focus on providing deep technical insights, identifying innovations, and evaluating feasibility.
Be specific, technical, and critical in your analysis.`,
        
        user: `Please analyze this whitepaper section:

Title: {documentTitle}
Type: Technical Whitepaper
Domain: {technicalDomain}
Complexity: {complexity}

Key Concepts Identified:
{concepts}

Document Extract:
{content}

Specific Analysis Required:
{specificTasks}

Please provide:
1. Technical assessment from your expertise perspective
2. Potential issues or concerns
3. Innovations and novel approaches identified
4. Recommendations for implementation
5. Risk factors from your domain perspective`
      },

      technical_spec: {
        system: `You are {agentName}, a {agentRole} specializing in technical specifications.
Your capabilities: {capabilities}.
Analyze specifications for completeness, feasibility, and best practices.`,
        
        user: `Analyze this technical specification:

Document: {documentTitle}
Technical Stack: {technicalDomain}

Specification Extract:
{content}

Focus Areas:
{specificTasks}

Evaluate:
1. Specification completeness
2. Technical feasibility
3. Implementation challenges
4. Security considerations
5. Performance implications`
      },

      architecture_doc: {
        system: `You are {agentName}, a {agentRole} with expertise in system architecture.
Your skills: {capabilities}.
Focus on architectural patterns, scalability, and system design principles.`,
        
        user: `Review this architecture document:

System: {documentTitle}
Architecture Type: {architectureType}

Document Section:
{content}

Analysis Required:
{specificTasks}

Assess:
1. Architectural soundness
2. Scalability potential
3. Integration points
4. Technology choices
5. Potential bottlenecks`
      },

      code_review: {
        system: `You are {agentName}, a {agentRole} conducting code review.
Expertise: {capabilities}.
Focus on code quality, security, performance, and best practices.`,
        
        user: `Review this code implementation:

Project: {documentTitle}
Language/Framework: {technicalDomain}

Code Section:
{content}

Review Focus:
{specificTasks}

Evaluate:
1. Code quality and maintainability
2. Security vulnerabilities
3. Performance optimizations
4. Best practices adherence
5. Suggested improvements`
      }
    };

    // Specific task templates by agent role
    this.roleSpecificTasks = {
      'architect': [
        'Evaluate the overall system architecture',
        'Identify architectural patterns and anti-patterns',
        'Assess scalability and maintainability',
        'Recommend architectural improvements'
      ],
      'developer': [
        'Review implementation feasibility',
        'Identify coding best practices',
        'Suggest implementation approaches',
        'Evaluate technical debt implications'
      ],
      'security': [
        'Identify security vulnerabilities',
        'Assess threat vectors',
        'Recommend security controls',
        'Evaluate compliance requirements'
      ],
      'analyst': [
        'Analyze business requirements alignment',
        'Identify gaps in specifications',
        'Evaluate user impact',
        'Assess implementation complexity'
      ],
      'researcher': [
        'Evaluate novelty and innovation',
        'Compare with existing solutions',
        'Assess theoretical soundness',
        'Identify research contributions'
      ]
    };

    // Domain-specific context enhancers
    this.domainContexts = {
      blockchain: {
        keywords: ['consensus', 'smart contracts', 'gas optimization', 'decentralization'],
        focus: 'Pay special attention to decentralization, security, and gas efficiency.',
        questions: [
          'How does this compare to existing blockchain solutions?',
          'What are the gas optimization strategies?',
          'How is decentralization maintained?'
        ]
      },
      ai_ml: {
        keywords: ['model architecture', 'training data', 'accuracy', 'bias'],
        focus: 'Focus on model performance, data quality, and ethical considerations.',
        questions: [
          'What is the model architecture and why?',
          'How is bias addressed?',
          'What are the performance metrics?'
        ]
      },
      security: {
        keywords: ['threat model', 'encryption', 'authentication', 'zero-trust'],
        focus: 'Emphasize security vulnerabilities, threat modeling, and mitigation strategies.',
        questions: [
          'What is the threat model?',
          'How are common vulnerabilities addressed?',
          'What security controls are implemented?'
        ]
      }
    };
  }

  /**
   * Constrói prompt contextualizado para um agente específico
   */
  buildPrompt(agent, documentAnalysis, task, options = {}) {
    console.log(`🎯 Building contextual prompt for ${agent.name}`);

    const {
      phase = 'analysis',
      previousContext = null,
      specificFocus = null,
      outputFormat = 'detailed'
    } = options;

    // Selecionar template apropriado
    const template = this.selectTemplate(documentAnalysis.type);
    
    // Construir contexto
    const context = this.buildContext(agent, documentAnalysis, task, phase);
    
    // Adicionar tarefas específicas
    const specificTasks = this.generateSpecificTasks(agent, documentAnalysis, specificFocus);
    
    // Adicionar contexto de domínio
    const domainEnhancements = this.addDomainContext(documentAnalysis.technicalDomain);
    
    // Construir prompt final
    const systemPrompt = this.fillTemplate(template.system, {
      agentName: agent.name,
      agentRole: agent.role,
      capabilities: agent.capabilities.join(', '),
      domain: this.formatDomains(documentAnalysis.technicalDomain)
    });

    const userPrompt = this.fillTemplate(template.user, {
      documentTitle: documentAnalysis.metadata.title || 'Technical Document',
      technicalDomain: this.formatDomains(documentAnalysis.technicalDomain),
      complexity: documentAnalysis.complexity.complexity,
      concepts: this.formatConcepts(documentAnalysis.concepts),
      content: this.extractRelevantContent(documentAnalysis, agent),
      specificTasks: specificTasks.join('\n'),
      architectureType: documentAnalysis.structure.type || 'System Architecture'
    });

    // Adicionar formatação de output
    const outputInstructions = this.generateOutputInstructions(outputFormat, agent.role);

    // Adicionar contexto anterior se disponível
    const fullPrompt = this.assembleFullPrompt({
      systemPrompt,
      userPrompt,
      domainEnhancements,
      outputInstructions,
      previousContext,
      phase
    });

    return fullPrompt;
  }

  /**
   * Constrói prompt para síntese de múltiplas respostas
   */
  buildSynthesisPrompt(responses, documentAnalysis, options = {}) {
    const {
      synthesisLevel = 'executive',
      focusAreas = [],
      targetAudience = 'technical'
    } = options;

    const systemPrompt = `You are an expert synthesizer analyzing multiple expert opinions on a technical document.
Your role is to consolidate insights, identify consensus and disagreements, and provide actionable recommendations.
Target audience: ${targetAudience}
Synthesis level: ${synthesisLevel}`;

    const userPrompt = `Synthesize the following expert analyses:

Document: ${documentAnalysis.metadata.title || 'Technical Document'}
Type: ${documentAnalysis.type}
Domain: ${this.formatDomains(documentAnalysis.technicalDomain)}

Expert Responses:
${this.formatResponses(responses)}

${focusAreas.length > 0 ? `Focus Areas:\n${focusAreas.join('\n')}\n` : ''}

Please provide:
1. **Executive Summary** (2-3 paragraphs)
2. **Key Consensus Points** (what experts agree on)
3. **Points of Divergence** (where experts disagree and why)
4. **Critical Insights** (most important findings)
5. **Risk Assessment** (major risks identified)
6. **Recommended Actions** (prioritized next steps)
7. **Implementation Roadmap** (if applicable)

Format the output in a clear, structured manner suitable for ${targetAudience} audience.`;

    return {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };
  }

  /**
   * Constrói prompt específico para análise de white papers técnicos
   */
  buildWhitepaperAnalysisPrompt(agent, whitepaperContent, analysis) {
    const { whitepaperAnalysis } = analysis;
    
    const specificPrompt = `As ${agent.name}, analyze this technical whitepaper section:

**Problem Statement:**
${whitepaperAnalysis.problem || 'Not clearly stated'}

**Proposed Solution:**
${whitepaperAnalysis.solution || 'Not clearly stated'}

**Key Innovations:**
${whitepaperAnalysis.innovations.join('\n') || 'None identified'}

**Your Task:**
From your perspective as a ${agent.role}, evaluate:

1. **Technical Validity**: Is the proposed solution technically sound?
2. **Innovation Assessment**: How novel is this approach?
3. **Implementation Feasibility**: Can this be realistically implemented?
4. **Potential Challenges**: What obstacles might arise?
5. **Comparison**: How does this compare to existing solutions?
6. **Recommendations**: What would you recommend to improve this proposal?

Provide specific, actionable insights based on your expertise in ${agent.capabilities.join(', ')}.`;

    return specificPrompt;
  }

  /**
   * Helpers
   */
  selectTemplate(documentType) {
    return this.analysisTemplates[documentType] || this.analysisTemplates.whitepaper;
  }

  buildContext(agent, analysis, task, phase) {
    return {
      agent: {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        capabilities: agent.capabilities
      },
      document: {
        type: analysis.type,
        complexity: analysis.complexity,
        structure: analysis.structure,
        domains: analysis.technicalDomain
      },
      task: {
        original: task,
        phase: phase,
        timestamp: new Date().toISOString()
      }
    };
  }

  generateSpecificTasks(agent, analysis, specificFocus) {
    const tasks = [];
    
    // Role-based tasks
    const roleKey = this.getRoleKey(agent.role);
    if (this.roleSpecificTasks[roleKey]) {
      tasks.push(...this.roleSpecificTasks[roleKey]);
    }

    // Document-specific tasks
    if (analysis.type === 'whitepaper' && analysis.whitepaperAnalysis) {
      tasks.push('Evaluate the methodology presented');
      tasks.push('Assess the validity of results claimed');
    }

    // Domain-specific tasks
    analysis.technicalDomain.forEach(domain => {
      const domainContext = this.domainContexts[domain.domain];
      if (domainContext && domainContext.questions) {
        tasks.push(...domainContext.questions.slice(0, 2));
      }
    });

    // Custom focus
    if (specificFocus) {
      tasks.push(`Specifically focus on: ${specificFocus}`);
    }

    return tasks;
  }

  addDomainContext(technicalDomains) {
    const contexts = [];
    
    technicalDomains.forEach(domain => {
      const domainContext = this.domainContexts[domain.domain];
      if (domainContext) {
        contexts.push({
          domain: domain.domain,
          focus: domainContext.focus,
          keywords: domainContext.keywords
        });
      }
    });

    return contexts;
  }

  fillTemplate(template, values) {
    let filled = template;
    
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      filled = filled.replace(regex, value);
    });
    
    return filled;
  }

  formatDomains(domains) {
    return domains.map(d => d.domain).join(', ');
  }

  formatConcepts(concepts) {
    const allConcepts = [
      ...concepts.technical.slice(0, 5),
      ...concepts.architectural.slice(0, 3)
    ];
    return allConcepts.join(', ');
  }

  extractRelevantContent(analysis, agent) {
    // Extract content relevant to the agent's expertise
    let content = '';
    
    // Add abstract for researchers
    if (agent.role.includes('Research') && analysis.whitepaperAnalysis?.abstract) {
      content += analysis.whitepaperAnalysis.abstract + '\n\n';
    }
    
    // Add technical sections
    if (analysis.keyElements.codeSnippets.length > 0 && 
        (agent.role.includes('Developer') || agent.role.includes('Engineer'))) {
      content += 'Code Examples:\n' + analysis.keyElements.codeSnippets[0] + '\n\n';
    }
    
    // Add formulas for scientists
    if (analysis.keyElements.formulas.length > 0 && 
        agent.role.includes('Scientist')) {
      content += 'Mathematical Formulations:\n' + analysis.keyElements.formulas.join('\n') + '\n\n';
    }
    
    // Default to first 1000 chars if no specific content
    if (!content && analysis.content) {
      content = analysis.content.substring(0, 1000) + '...';
    }
    
    return content;
  }

  generateOutputInstructions(format, role) {
    const instructions = {
      detailed: `Provide a comprehensive analysis with:
- Executive summary (2-3 paragraphs)
- Detailed findings (bullet points)
- Specific recommendations
- Risk assessment
- Next steps`,
      
      concise: `Provide a concise analysis with:
- Brief summary (1 paragraph)
- Key findings (3-5 bullet points)
- Top recommendation`,
      
      technical: `Provide a technical analysis with:
- Technical assessment
- Implementation details
- Code examples (if applicable)
- Architecture recommendations
- Performance considerations`,
      
      strategic: `Provide a strategic analysis with:
- Business impact assessment
- Strategic recommendations
- Risk/opportunity analysis
- Roadmap suggestions`
    };

    return instructions[format] || instructions.detailed;
  }

  assembleFullPrompt(components) {
    const messages = [
      { role: 'system', content: components.systemPrompt }
    ];

    // Add previous context if available
    if (components.previousContext) {
      messages.push({
        role: 'system',
        content: `Previous context from ${components.phase} phase:\n${JSON.stringify(components.previousContext, null, 2)}`
      });
    }

    // Add domain enhancements
    if (components.domainEnhancements.length > 0) {
      const domainContext = components.domainEnhancements
        .map(d => d.focus)
        .join('\n');
      
      messages.push({
        role: 'system',
        content: `Domain-specific focus:\n${domainContext}`
      });
    }

    // Add main user prompt
    messages.push({
      role: 'user',
      content: components.userPrompt + '\n\n' + components.outputInstructions
    });

    return { messages };
  }

  getRoleKey(role) {
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes('architect')) return 'architect';
    if (roleLower.includes('developer')) return 'developer';
    if (roleLower.includes('security')) return 'security';
    if (roleLower.includes('analyst')) return 'analyst';
    if (roleLower.includes('research')) return 'researcher';
    
    return 'analyst'; // default
  }

  formatResponses(responses) {
    return responses.map((response, index) => {
      return `**${response.agent.name} (${response.agent.role}):**
${response.content}

---`;
    }).join('\n\n');
  }
}

export default new ContextualPromptBuilder();