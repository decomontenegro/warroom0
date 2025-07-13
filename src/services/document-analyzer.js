/**
 * Document Analyzer - Sistema avançado de análise de documentos técnicos
 * Analisa estrutura, extrai conceitos e prepara contexto para agentes especializados
 */

export class DocumentAnalyzer {
  constructor() {
    this.documentTypes = {
      'whitepaper': {
        indicators: ['abstract', 'introduction', 'conclusion', 'references', 'whitepaper', 'paper'],
        sections: ['abstract', 'introduction', 'overview', 'architecture', 'implementation', 'results', 'conclusion'],
        analysis: 'deep_technical'
      },
      'technical_spec': {
        indicators: ['specification', 'requirements', 'api', 'interface', 'protocol'],
        sections: ['overview', 'requirements', 'architecture', 'api', 'data_models', 'security'],
        analysis: 'specification'
      },
      'code_documentation': {
        indicators: ['function', 'class', 'method', 'parameter', 'return', 'example'],
        sections: ['overview', 'installation', 'usage', 'api_reference', 'examples'],
        analysis: 'code_focused'
      },
      'architecture_doc': {
        indicators: ['architecture', 'design', 'component', 'system', 'diagram'],
        sections: ['overview', 'components', 'interactions', 'deployment', 'scalability'],
        analysis: 'architectural'
      }
    };

    this.technicalPatterns = {
      blockchain: {
        keywords: ['blockchain', 'smart contract', 'defi', 'token', 'decentralized', 'web3', 'ethereum', 'solidity'],
        concepts: ['consensus', 'transactions', 'wallets', 'gas', 'mining', 'staking']
      },
      ai_ml: {
        keywords: ['machine learning', 'neural network', 'model', 'training', 'dataset', 'algorithm'],
        concepts: ['accuracy', 'loss', 'optimization', 'features', 'prediction']
      },
      distributed_systems: {
        keywords: ['distributed', 'scalability', 'consensus', 'replication', 'fault tolerance'],
        concepts: ['cap theorem', 'eventual consistency', 'partitioning', 'load balancing']
      },
      security: {
        keywords: ['security', 'encryption', 'authentication', 'authorization', 'vulnerability'],
        concepts: ['threat model', 'attack vector', 'mitigation', 'compliance']
      }
    };
  }

  /**
   * Analisa um documento e extrai informações estruturadas
   */
  async analyzeDocument(content, metadata = {}) {
    console.log('📄 Starting advanced document analysis...');
    
    const analysis = {
      type: this.identifyDocumentType(content),
      structure: this.extractStructure(content),
      concepts: this.extractConcepts(content),
      technicalDomain: this.identifyTechnicalDomain(content),
      complexity: this.assessComplexity(content),
      keyElements: this.extractKeyElements(content),
      metadata: this.enrichMetadata(content, metadata),
      recommendations: []
    };

    // Análise específica por tipo de documento
    if (analysis.type === 'whitepaper') {
      analysis.whitepaperAnalysis = this.analyzeWhitepaper(content);
    }

    // Gerar recomendações de especialistas
    analysis.recommendations = this.generateSpecialistRecommendations(analysis);

    return analysis;
  }

  /**
   * Identifica o tipo de documento
   */
  identifyDocumentType(content) {
    const lowerContent = content.toLowerCase();
    let bestMatch = { type: 'general', score: 0 };

    for (const [type, config] of Object.entries(this.documentTypes)) {
      let score = 0;
      
      // Check indicators
      config.indicators.forEach(indicator => {
        if (lowerContent.includes(indicator)) score += 2;
      });

      // Check sections
      config.sections.forEach(section => {
        const sectionRegex = new RegExp(`\\b${section}\\b`, 'i');
        if (sectionRegex.test(content)) score += 1;
      });

      if (score > bestMatch.score) {
        bestMatch = { type, score };
      }
    }

    return bestMatch.type;
  }

  /**
   * Extrai a estrutura do documento
   */
  extractStructure(content) {
    const structure = {
      sections: [],
      hierarchy: [],
      totalSections: 0,
      hasTableOfContents: false,
      hasMathFormulas: false,
      hasCodeBlocks: false,
      hasDiagrams: false
    };

    // Detectar seções (headers)
    const headerRegex = /^#+\s+(.+)$|^(.+)\n[=-]+$/gm;
    let match;
    
    while ((match = headerRegex.exec(content)) !== null) {
      const title = match[1] || match[2];
      const level = match[0].startsWith('#') ? match[0].match(/^#+/)[0].length : 1;
      
      structure.sections.push({
        title: title.trim(),
        level,
        position: match.index
      });
    }

    structure.totalSections = structure.sections.length;

    // Detectar table of contents
    structure.hasTableOfContents = /table\s+of\s+contents|contents|índice/i.test(content);

    // Detectar fórmulas matemáticas
    structure.hasMathFormulas = /\$[^$]+\$|\\\[[\s\S]+?\\\]|\\begin\{equation\}/g.test(content);

    // Detectar blocos de código
    structure.hasCodeBlocks = /```[\s\S]*?```|~~~[\s\S]*?~~~/g.test(content);

    // Detectar referências a diagramas
    structure.hasDiagrams = /diagram|figure|chart|graph|architecture/i.test(content);

    // Construir hierarquia
    structure.hierarchy = this.buildHierarchy(structure.sections);

    return structure;
  }

  /**
   * Extrai conceitos técnicos do documento
   */
  extractConcepts(content) {
    const concepts = {
      technical: [],
      business: [],
      mathematical: [],
      architectural: []
    };

    // Extrair conceitos técnicos
    const technicalRegex = /\b([A-Z][a-zA-Z]*(?:[A-Z][a-zA-Z]*)+)\b/g;
    const technicalMatches = content.match(technicalRegex) || [];
    concepts.technical = [...new Set(technicalMatches)].slice(0, 20);

    // Extrair conceitos matemáticos
    const mathRegex = /(?:formula|equation|algorithm|calculation|compute)/gi;
    const mathMatches = content.match(mathRegex) || [];
    concepts.mathematical = [...new Set(mathMatches)].slice(0, 10);

    // Extrair conceitos arquiteturais
    const archRegex = /(?:component|module|service|contract|interface|system|layer)/gi;
    const archMatches = content.match(archRegex) || [];
    concepts.architectural = [...new Set(archMatches)].slice(0, 15);

    // Extrair conceitos de negócio (palavras importantes em contexto)
    const sentences = content.split(/[.!?]/);
    const importantWords = new Set();
    
    sentences.forEach(sentence => {
      if (sentence.includes('objective') || sentence.includes('goal') || sentence.includes('purpose')) {
        const words = sentence.match(/\b[A-Z][a-z]+\b/g) || [];
        words.forEach(word => importantWords.add(word));
      }
    });
    
    concepts.business = Array.from(importantWords).slice(0, 10);

    return concepts;
  }

  /**
   * Identifica o domínio técnico principal
   */
  identifyTechnicalDomain(content) {
    const domains = [];
    const lowerContent = content.toLowerCase();

    for (const [domain, config] of Object.entries(this.technicalPatterns)) {
      let score = 0;
      
      config.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = content.match(regex) || [];
        score += matches.length * 2;
      });

      config.concepts.forEach(concept => {
        if (lowerContent.includes(concept)) score += 1;
      });

      if (score > 5) {
        domains.push({ domain, score });
      }
    }

    domains.sort((a, b) => b.score - a.score);
    return domains.slice(0, 3);
  }

  /**
   * Avalia a complexidade do documento
   */
  assessComplexity(content) {
    const metrics = {
      length: content.length,
      wordCount: content.split(/\s+/).length,
      avgWordLength: 0,
      technicalDensity: 0,
      readabilityScore: 0,
      complexity: 'medium'
    };

    // Calcular comprimento médio das palavras
    const words = content.match(/\b\w+\b/g) || [];
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    metrics.avgWordLength = totalLength / words.length;

    // Calcular densidade técnica
    const technicalWords = words.filter(word => word.length > 8).length;
    metrics.technicalDensity = technicalWords / words.length;

    // Calcular score de complexidade
    if (metrics.wordCount > 5000 && metrics.technicalDensity > 0.15) {
      metrics.complexity = 'high';
    } else if (metrics.wordCount < 1000 && metrics.technicalDensity < 0.05) {
      metrics.complexity = 'low';
    }

    // Flesch Reading Ease approximation
    const sentences = content.split(/[.!?]+/).length;
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
    metrics.readabilityScore = 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length);

    return metrics;
  }

  /**
   * Extrai elementos-chave específicos
   */
  extractKeyElements(content) {
    const elements = {
      definitions: [],
      examples: [],
      formulas: [],
      codeSnippets: [],
      references: [],
      urls: []
    };

    // Extrair definições
    const defRegex = /(?:define|definition|means|refers to|is a|is an)\s+([^.]+)/gi;
    let match;
    while ((match = defRegex.exec(content)) !== null) {
      elements.definitions.push(match[1].trim());
    }

    // Extrair exemplos
    const exampleRegex = /(?:for example|e\.g\.|example:|such as)\s+([^.]+)/gi;
    while ((match = exampleRegex.exec(content)) !== null) {
      elements.examples.push(match[1].trim());
    }

    // Extrair fórmulas
    const formulaRegex = /\$([^$]+)\$|\\\[([^\]]+)\\\]/g;
    while ((match = formulaRegex.exec(content)) !== null) {
      elements.formulas.push(match[1] || match[2]);
    }

    // Extrair snippets de código
    const codeRegex = /```([\s\S]*?)```/g;
    while ((match = codeRegex.exec(content)) !== null) {
      elements.codeSnippets.push(match[1].trim());
    }

    // Extrair URLs
    const urlRegex = /https?:\/\/[^\s]+/g;
    elements.urls = content.match(urlRegex) || [];

    return elements;
  }

  /**
   * Análise específica para whitepapers
   */
  analyzeWhitepaper(content) {
    const analysis = {
      abstract: this.extractSection(content, 'abstract'),
      problem: this.extractProblemStatement(content),
      solution: this.extractSolutionStatement(content),
      methodology: this.extractMethodology(content),
      results: this.extractResults(content),
      innovations: this.extractInnovations(content)
    };

    return analysis;
  }

  /**
   * Extrai uma seção específica
   */
  extractSection(content, sectionName) {
    const regex = new RegExp(`\\b${sectionName}\\b[\\s\\S]*?(?=\\n\\s*\\n|\\b(?:introduction|overview|conclusion|references)\\b)`, 'i');
    const match = content.match(regex);
    return match ? match[0].substring(0, 1000) : null;
  }

  /**
   * Extrai o problema apresentado
   */
  extractProblemStatement(content) {
    const problemIndicators = ['problem', 'challenge', 'issue', 'limitation', 'difficulty'];
    const sentences = content.split(/[.!?]/);
    
    const problemSentences = sentences.filter(sentence => 
      problemIndicators.some(indicator => sentence.toLowerCase().includes(indicator))
    );

    return problemSentences.slice(0, 3).join('. ');
  }

  /**
   * Extrai a solução proposta
   */
  extractSolutionStatement(content) {
    const solutionIndicators = ['solution', 'approach', 'method', 'propose', 'introduce'];
    const sentences = content.split(/[.!?]/);
    
    const solutionSentences = sentences.filter(sentence => 
      solutionIndicators.some(indicator => sentence.toLowerCase().includes(indicator))
    );

    return solutionSentences.slice(0, 3).join('. ');
  }

  /**
   * Extrai metodologia
   */
  extractMethodology(content) {
    const methodIndicators = ['methodology', 'method', 'approach', 'technique', 'algorithm'];
    const sections = content.split(/\n\s*\n/);
    
    const methodSections = sections.filter(section => 
      methodIndicators.some(indicator => section.toLowerCase().includes(indicator))
    );

    return methodSections.slice(0, 2).join('\n\n').substring(0, 500);
  }

  /**
   * Extrai resultados
   */
  extractResults(content) {
    const resultIndicators = ['result', 'finding', 'outcome', 'performance', 'evaluation'];
    const sections = content.split(/\n\s*\n/);
    
    const resultSections = sections.filter(section => 
      resultIndicators.some(indicator => section.toLowerCase().includes(indicator))
    );

    return resultSections.slice(0, 2).join('\n\n').substring(0, 500);
  }

  /**
   * Extrai inovações
   */
  extractInnovations(content) {
    const innovationIndicators = ['novel', 'new', 'innovative', 'unique', 'first', 'introduce'];
    const sentences = content.split(/[.!?]/);
    
    const innovations = sentences.filter(sentence => 
      innovationIndicators.some(indicator => sentence.toLowerCase().includes(indicator))
    );

    return innovations.slice(0, 5);
  }

  /**
   * Enriquece metadata
   */
  enrichMetadata(content, existingMetadata) {
    return {
      ...existingMetadata,
      analysisDate: new Date().toISOString(),
      contentHash: this.generateHash(content),
      language: this.detectLanguage(content),
      estimatedReadingTime: Math.ceil(content.split(/\s+/).length / 200), // minutes
      requiresSpecialists: true
    };
  }

  /**
   * Gera recomendações de especialistas
   */
  generateSpecialistRecommendations(analysis) {
    const recommendations = [];

    // Baseado no tipo de documento
    if (analysis.type === 'whitepaper') {
      recommendations.push(
        { specialist: 'research-lead', reason: 'Analyze research methodology' },
        { specialist: 'technical-writer', reason: 'Validate technical documentation' }
      );
    }

    // Baseado no domínio técnico
    analysis.technicalDomain.forEach(domain => {
      switch (domain.domain) {
        case 'blockchain':
          recommendations.push(
            { specialist: 'blockchain-specialist', reason: 'Analyze blockchain architecture' },
            { specialist: 'security-architect', reason: 'Assess security implications' },
            { specialist: 'smart-contract-developer', reason: 'Evaluate smart contract design' }
          );
          break;
        case 'ai_ml':
          recommendations.push(
            { specialist: 'ai-ml-engineer', reason: 'Validate ML approach' },
            { specialist: 'data-scientist', reason: 'Assess data methodology' }
          );
          break;
        case 'distributed_systems':
          recommendations.push(
            { specialist: 'system-architect', reason: 'Analyze system design' },
            { specialist: 'performance-engineer', reason: 'Evaluate scalability' }
          );
          break;
      }
    });

    // Baseado na complexidade
    if (analysis.complexity.complexity === 'high') {
      recommendations.push(
        { specialist: 'chief-architect', reason: 'High-level architectural review' },
        { specialist: 'technical-lead', reason: 'Technical feasibility assessment' }
      );
    }

    // Remover duplicatas
    const uniqueRecommendations = [];
    const seen = new Set();
    
    recommendations.forEach(rec => {
      if (!seen.has(rec.specialist)) {
        seen.add(rec.specialist);
        uniqueRecommendations.push(rec);
      }
    });

    return uniqueRecommendations;
  }

  /**
   * Helpers
   */
  buildHierarchy(sections) {
    const hierarchy = [];
    const stack = [];

    sections.forEach(section => {
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }

      const node = {
        ...section,
        children: []
      };

      if (stack.length === 0) {
        hierarchy.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    });

    return hierarchy;
  }

  countSyllables(word) {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = /[aeiou]/.test(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    return Math.max(1, count);
  }

  generateHash(content) {
    // Simple hash for demo
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  detectLanguage(content) {
    // Simple language detection
    const portugueseWords = /\b(para|com|que|não|uma|por|mais|muito|seu|pode)\b/gi;
    const englishWords = /\b(the|and|for|with|that|this|from|have|will|can)\b/gi;
    
    const ptMatches = (content.match(portugueseWords) || []).length;
    const enMatches = (content.match(englishWords) || []).length;
    
    return ptMatches > enMatches ? 'pt-BR' : 'en-US';
  }
}

export default new DocumentAnalyzer();