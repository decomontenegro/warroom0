// Configuração de internacionalização para UltraThink
export const SUPPORTED_LANGUAGES = {
  'pt-BR': {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    flag: '🇧🇷',
    default: true
  },
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    flag: '🇺🇸'
  },
  'es-ES': {
    code: 'es-ES',
    name: 'Español',
    flag: '🇪🇸'
  },
  'fr-FR': {
    code: 'fr-FR',
    name: 'Français',
    flag: '🇫🇷'
  },
  'de-DE': {
    code: 'de-DE',
    name: 'Deutsch',
    flag: '🇩🇪'
  },
  'it-IT': {
    code: 'it-IT',
    name: 'Italiano',
    flag: '🇮🇹'
  },
  'ja-JP': {
    code: 'ja-JP',
    name: '日本語',
    flag: '🇯🇵'
  },
  'zh-CN': {
    code: 'zh-CN',
    name: '中文 (简体)',
    flag: '🇨🇳'
  }
};

// Traduções para o sistema UltraThink
export const translations = {
  'pt-BR': {
    // Mensagens do sistema
    system: {
      analyzing: 'Analisando documento...',
      selectingAgents: 'Selecionando especialistas...',
      processing: 'Processando com {agentName}...',
      consultingSpecialists: 'Consultando especialistas...',
      synthesizing: 'Sintetizando resultados...',
      complete: 'Análise completa!',
      error: 'Erro durante análise: {error}',
      adjustingStrategy: '🔄 Ajustando estratégia baseado nas análises iniciais...'
    },
    
    // Workflow UltraThink
    workflow: {
      started: '🤖 **UltraThink Workflow iniciado**',
      analyzingRequest: '📊 Analisando sua solicitação em profundidade...',
      completeAnalysis: '🔍 **Análise Completa:**',
      mainObjective: '📌 **Objetivo Principal:** {objective}',
      identifiedComponents: '🎯 **Componentes Identificados:**',
      selectedSpecialists: '👥 **Especialistas Selecionados:** {count} agentes',
      estimatedComplexity: '📈 **Complexidade Estimada:** {level}/5',
      estimatedTime: '⏱️ **Tempo Estimado:** {time}',
      phase1Core: '👥 **Fase 1: Consulta aos especialistas principais (Core Team)...**',
      phase2Support: '🔄 **Fase 2: Consulta aos especialistas de suporte (Support Team)...**',
      phase3Analysis: '⚡ **Fase 3: Análise de Padrões e Convergência**',
      identifyingConsensus: '🔍 Identificando pontos de consenso entre os especialistas...',
      phase4Review: '🧠 **Fase 4: Revisando para Consenso...**',
      orchestratorAnalyzing: '🎯 O Orquestrador Inteligente está analisando todas as respostas dos especialistas',
      identifyingPatterns: '📊 Identificando padrões, divergências e oportunidades de síntese...',
      phase5Synthesis: '✨ **Fase 5: Síntese e Consenso Final**',
      invokingChief: '🔍 Invocando Chief Strategy Officer para análise holística...',
      finalConsolidation: '📊 **Consolidação Final do Consenso**',
      participation: '👥 **Participação:** {responded}/{total} especialistas responderam',
      consensusConfidence: '📈 **Confiança no Consenso:** {percent}%',
      status: '✅ **Status:** Análise concluída com sucesso',
      phase6PromptBuilder: '🎨 **Fase 6: Construtor de Prompt Detalhado**',
      consolidatingKnowledge: '📝 Consolidando todo conhecimento da sessão em um prompt estruturado...',
      analysisComplete: '✅ **Análise UltraThink Completa!**',
      allPhasesExecuted: '📊 Todas as {count} fases foram executadas com sucesso',
      promptAvailable: '📋 Prompt detalhado disponível para uso',
      copyOrDownload: '💡 Você pode copiar ou baixar o prompt estruturado acima'
    },
    
    // Fases do UltraThink
    phases: {
      initialization: 'Inicialização',
      documentAnalysis: 'Análise do Documento',
      agentSelection: 'Seleção de Especialistas',
      agentProcessing: 'Processamento por Especialistas',
      coordination: 'Coordenação',
      synthesis: 'Síntese Final',
      analysis: '🔍 Fase de Análise',
      design: '📐 Fase de Design', 
      implementation: '🛠️ Fase de Implementação',
      validation: '✅ Fase de Validação'
    },
    
    // Métricas
    metrics: {
      confidence: 'Confiança',
      consensus: 'Consenso',
      responseTime: 'Tempo de Resposta',
      successRate: 'Taxa de Sucesso',
      depth: 'Profundidade',
      complexity: 'Complexidade'
    },
    
    // Sumário Executivo
    executive: {
      title: 'Sumário Executivo',
      basedOn: 'Com base na análise de {count} especialistas',
      mainFindings: 'Principais Descobertas',
      recommendations: 'Recomendações',
      risks: 'Riscos Identificados',
      opportunities: 'Oportunidades'
    },
    
    // Chief Strategy Officer
    chief: {
      intro: 'Como Chief Strategy Officer, observo que ainda estamos aguardando as respostas dos especialistas sobre "{query}".',
      introWithResponses: 'Como Chief Strategy Officer, após analisar profundamente as {count} respostas dos especialistas sobre "{query}", identifico os seguintes padrões estratégicos:',
      status: '⏳ **Status:** Coletando análises dos especialistas...',
      nextSteps: '💡 **Próximos Passos:**',
      waitingAnalysis: '• Aguardar conclusão das análises individuais',
      compileInsights: '• Compilar insights após receber respostas',
      generateConsensus: '• Gerar consenso estratégico baseado nos dados',
      recommendation: '🔄 **Recomendação:** Aguarde alguns segundos para a análise completa.',
      convergenceAnalysis: '📊 **Análise de Convergência Temática:**',
      strategicConsensus: '🎯 **Consenso Estratégico Identificado:**',
      strategicDivergences: '⚡ **Divergências Estratégicas e Mitigações:**',
      strategicRecommendations: '🔮 **Recomendações Estratégicas:**',
      strategicInsight: '💡 **Insight Estratégico Final:**',
      themes: {
        technical: 'Aspectos Técnicos',
        timeline: 'Cronograma e Prazos',
        security: 'Segurança',
        scalability: 'Escalabilidade',
        userExperience: 'Experiência do Usuário',
        implementation: 'Estratégia de Implementação',
        testing: 'Testes e Validação',
        architecture: 'Arquitetura do Sistema'
      },
      phases: {
        immediate: 'Fase Imediata (Semanas 1-2):',
        development: 'Fase de Desenvolvimento (Meses 1-3):',
        scale: 'Fase de Escala (Mês 4+):'
      }
    },
    
    // Mensagens dos agentes
    agent: {
      thinking: '🔍 Analisando com {agent}...',
      response: 'Resposta de {agent}',
      confidence: 'Confiança: {level}%',
      specialty: 'Especialidade: {specialty}',
      perspective: 'Como {agent}, minha perspectiva sobre {topic} seria a seguinte:',
      considerationsTitle: '**Considerações de {specialty}**',
      recommendationsTitle: '**Recomendações de {specialty}**',
      welcome: 'Olá! Eu sou {name}, {role}. Como posso ajudar?',
      analyzing: '🔄 {agent} está analisando... ({current}/{total})'
    },
    
    // Room names and messages
    rooms: {
      allSpecialists: 'Todos os Especialistas',
      allWelcome: 'Bem-vindo à sala com todos os especialistas! Faça sua pergunta e múltiplos especialistas responderão.',
      ultrathinkWelcome: 'Sala do UltraThink - Sistema avançado de análise com 100 agentes especializados.',
      builderWelcome: 'Use o Prompt Builder para criar perguntas complexas selecionando tópicos e especialistas.',
      summaryWelcome: 'Aqui você recebe resumos inteligentes das discussões. Use o controle para ajustar o nível de detalhe.',
      defaultWelcome: 'Bem-vindo!'
    },
    
    // Analysis messages
    analysis: {
      completeAnalysis: 'Análise UltraThink Enhanced Completa',
      documentAnalysis: 'Análise do Documento',
      technicalAnalysis: 'Análise Técnica Detalhada',
      projectPhases: 'Fases do Projeto',
      specialistTeam: 'Equipe de Especialistas',
      analysisMetrics: 'Métricas da Análise',
      generalAnalysis: 'Análise geral do problema',
      waitingStart: 'Aguardando início...',
      phase1Initial: 'Fase 1: Consulta Inicial',
      phase2Cross: 'Fase 2: Análise Cruzada',
      phase3Patterns: 'Fase 3: Análise de Padrões',
      phase4Orchestration: 'Fase 4: Orquestração',
      phase5Final: 'Fase 5: Síntese Final'
    }
  },
  
  'en-US': {
    system: {
      analyzing: 'Analyzing document...',
      selectingAgents: 'Selecting specialists...',
      processing: 'Processing with {agentName}...',
      consultingSpecialists: 'Consulting specialists...',
      synthesizing: 'Synthesizing results...',
      complete: 'Analysis complete!',
      error: 'Error during analysis: {error}',
      adjustingStrategy: '🔄 Adjusting strategy based on initial analyses...'
    },
    
    workflow: {
      started: '🤖 **UltraThink Workflow started**',
      analyzingRequest: '📊 Analyzing your request in depth...',
      completeAnalysis: '🔍 **Complete Analysis:**',
      mainObjective: '📌 **Main Objective:** {objective}',
      identifiedComponents: '🎯 **Identified Components:**',
      selectedSpecialists: '👥 **Selected Specialists:** {count} agents',
      estimatedComplexity: '📈 **Estimated Complexity:** {level}/5',
      estimatedTime: '⏱️ **Estimated Time:** {time}',
      phase1Core: '👥 **Phase 1: Consulting main specialists (Core Team)...**',
      phase2Support: '🔄 **Phase 2: Consulting support specialists (Support Team)...**',
      phase3Analysis: '⚡ **Phase 3: Pattern Analysis and Convergence**',
      identifyingConsensus: '🔍 Identifying consensus points among specialists...',
      phase4Review: '🧠 **Phase 4: Reviewing for Consensus...**',
      orchestratorAnalyzing: '🎯 The Intelligent Orchestrator is analyzing all specialist responses',
      identifyingPatterns: '📊 Identifying patterns, divergences and synthesis opportunities...',
      phase5Synthesis: '✨ **Phase 5: Final Synthesis and Consensus**',
      invokingChief: '🔍 Invoking Chief Strategy Officer for holistic analysis...',
      finalConsolidation: '📊 **Final Consensus Consolidation**',
      participation: '👥 **Participation:** {responded}/{total} specialists responded',
      consensusConfidence: '📈 **Consensus Confidence:** {percent}%',
      status: '✅ **Status:** Analysis completed successfully',
      phase6PromptBuilder: '🎨 **Phase 6: Detailed Prompt Builder**',
      consolidatingKnowledge: '📝 Consolidating all session knowledge into a structured prompt...',
      analysisComplete: '✅ **UltraThink Analysis Complete!**',
      allPhasesExecuted: '📊 All {count} phases executed successfully',
      promptAvailable: '📋 Detailed prompt available for use',
      copyOrDownload: '💡 You can copy or download the structured prompt above'
    },
    
    phases: {
      initialization: 'Initialization',
      documentAnalysis: 'Document Analysis',
      agentSelection: 'Agent Selection',
      agentProcessing: 'Agent Processing',
      coordination: 'Coordination',
      synthesis: 'Final Synthesis',
      analysis: '🔍 Analysis Phase',
      design: '📐 Design Phase',
      implementation: '🛠️ Implementation Phase',
      validation: '✅ Validation Phase'
    },
    
    metrics: {
      confidence: 'Confidence',
      consensus: 'Consensus',
      responseTime: 'Response Time',
      successRate: 'Success Rate',
      depth: 'Depth',
      complexity: 'Complexity'
    },
    
    executive: {
      title: 'Executive Summary',
      basedOn: 'Based on analysis from {count} specialists',
      mainFindings: 'Key Findings',
      recommendations: 'Recommendations',
      risks: 'Identified Risks',
      opportunities: 'Opportunities'
    },
    
    // Chief Strategy Officer
    chief: {
      intro: 'As Chief Strategy Officer, I observe that we are still awaiting specialist responses about "{query}".',
      introWithResponses: 'As Chief Strategy Officer, after deeply analyzing {count} specialist responses about "{query}", I identify the following strategic patterns:',
      status: '⏳ **Status:** Collecting specialist analyses...',
      nextSteps: '💡 **Next Steps:**',
      waitingAnalysis: '• Wait for individual analyses to complete',
      compileInsights: '• Compile insights after receiving responses',
      generateConsensus: '• Generate strategic consensus based on data',
      recommendation: '🔄 **Recommendation:** Wait a few seconds for complete analysis.',
      convergenceAnalysis: '📊 **Thematic Convergence Analysis:**',
      strategicConsensus: '🎯 **Identified Strategic Consensus:**',
      strategicDivergences: '⚡ **Strategic Divergences and Mitigations:**',
      strategicRecommendations: '🔮 **Strategic Recommendations:**',
      strategicInsight: '💡 **Final Strategic Insight:**',
      themes: {
        technical: 'Technical Aspects',
        timeline: 'Timeline and Deadlines',
        security: 'Security',
        scalability: 'Scalability',
        userExperience: 'User Experience',
        implementation: 'Implementation Strategy',
        testing: 'Testing and Validation',
        architecture: 'System Architecture'
      },
      phases: {
        immediate: 'Immediate Phase (Weeks 1-2):',
        development: 'Development Phase (Months 1-3):',
        scale: 'Scale Phase (Month 4+):'
      }
    },
    
    agent: {
      thinking: '🔍 Analyzing with {agent}...',
      response: 'Response from {agent}',
      confidence: 'Confidence: {level}%',
      specialty: 'Specialty: {specialty}',
      perspective: 'As {agent}, my perspective on {topic} would be:',
      considerationsTitle: '**{specialty} Considerations**',
      recommendationsTitle: '**{specialty} Recommendations**',
      welcome: 'Hello! I am {name}, {role}. How can I help?',
      analyzing: '🔄 {agent} is analyzing... ({current}/{total})'
    },
    
    // Room names and messages
    rooms: {
      allSpecialists: 'All Specialists',
      allWelcome: 'Welcome to the room with all specialists! Ask your question and multiple specialists will respond.',
      ultrathinkWelcome: 'UltraThink Room - Advanced analysis system with 100 specialized agents.',
      builderWelcome: 'Use the Prompt Builder to create complex questions by selecting topics and specialists.',
      summaryWelcome: 'Here you receive intelligent summaries of discussions. Use the control to adjust the level of detail.',
      defaultWelcome: 'Welcome!'
    },
    
    // Analysis messages
    analysis: {
      completeAnalysis: 'Complete UltraThink Enhanced Analysis',
      documentAnalysis: 'Document Analysis',
      technicalAnalysis: 'Detailed Technical Analysis',
      projectPhases: 'Project Phases',
      specialistTeam: 'Specialist Team',
      analysisMetrics: 'Analysis Metrics',
      generalAnalysis: 'General problem analysis',
      waitingStart: 'Waiting to start...',
      phase1Initial: 'Phase 1: Initial Consultation',
      phase2Cross: 'Phase 2: Cross Analysis',
      phase3Patterns: 'Phase 3: Pattern Analysis',
      phase4Orchestration: 'Phase 4: Orchestration',
      phase5Final: 'Phase 5: Final Synthesis'
    }
  },
  
  'es-ES': {
    system: {
      analyzing: 'Analizando documento...',
      selectingAgents: 'Seleccionando especialistas...',
      processing: 'Procesando con {agentName}...',
      consultingSpecialists: 'Consultando especialistas...',
      synthesizing: 'Sintetizando resultados...',
      complete: '¡Análisis completo!',
      error: 'Error durante el análisis: {error}',
      adjustingStrategy: '🔄 Ajustando estrategia basada en análisis iniciales...'
    },
    
    workflow: {
      started: '🤖 **Flujo de trabajo UltraThink iniciado**',
      analyzingRequest: '📊 Analizando su solicitud en profundidad...',
      completeAnalysis: '🔍 **Análisis Completo:**',
      mainObjective: '📌 **Objetivo Principal:** {objective}',
      identifiedComponents: '🎯 **Componentes Identificados:**',
      selectedSpecialists: '👥 **Especialistas Seleccionados:** {count} agentes',
      estimatedComplexity: '📈 **Complejidad Estimada:** {level}/5',
      estimatedTime: '⏱️ **Tiempo Estimado:** {time}',
      phase1Core: '👥 **Fase 1: Consultando especialistas principales (Equipo Central)...**',
      phase2Support: '🔄 **Fase 2: Consultando especialistas de apoyo (Equipo de Soporte)...**',
      phase3Analysis: '⚡ **Fase 3: Análisis de Patrones y Convergencia**',
      identifyingConsensus: '🔍 Identificando puntos de consenso entre especialistas...',
      phase4Review: '🧠 **Fase 4: Revisando para Consenso...**',
      orchestratorAnalyzing: '🎯 El Orquestador Inteligente está analizando todas las respuestas de los especialistas',
      identifyingPatterns: '📊 Identificando patrones, divergencias y oportunidades de síntesis...',
      phase5Synthesis: '✨ **Fase 5: Síntesis Final y Consenso**',
      invokingChief: '🔍 Invocando al Director de Estrategia para análisis holístico...',
      finalConsolidation: '📊 **Consolidación Final del Consenso**',
      participation: '👥 **Participación:** {responded}/{total} especialistas respondieron',
      consensusConfidence: '📈 **Confianza en el Consenso:** {percent}%',
      status: '✅ **Estado:** Análisis completado con éxito',
      phase6PromptBuilder: '🎨 **Fase 6: Constructor de Prompts Detallado**',
      consolidatingKnowledge: '📝 Consolidando todo el conocimiento de la sesión en un prompt estructurado...',
      analysisComplete: '✅ **¡Análisis UltraThink Completo!**',
      allPhasesExecuted: '📊 Todas las {count} fases ejecutadas con éxito',
      promptAvailable: '📋 Prompt detallado disponible para uso',
      copyOrDownload: '💡 Puede copiar o descargar el prompt estructurado arriba'
    },
    
    phases: {
      initialization: 'Inicialización',
      documentAnalysis: 'Análisis del Documento',
      agentSelection: 'Selección de Especialistas',
      agentProcessing: 'Procesamiento por Especialistas',
      coordination: 'Coordinación',
      synthesis: 'Síntesis Final',
      analysis: '🔍 Fase de Análisis',
      design: '📐 Fase de Diseño',
      implementation: '🛠️ Fase de Implementación',
      validation: '✅ Fase de Validación'
    },
    
    metrics: {
      confidence: 'Confianza',
      consensus: 'Consenso',
      responseTime: 'Tiempo de Respuesta',
      successRate: 'Tasa de Éxito',
      depth: 'Profundidad',
      complexity: 'Complejidad'
    },
    
    executive: {
      title: 'Resumen Ejecutivo',
      basedOn: 'Basado en el análisis de {count} especialistas',
      mainFindings: 'Hallazgos Principales',
      recommendations: 'Recomendaciones',
      risks: 'Riesgos Identificados',
      opportunities: 'Oportunidades'
    },
    
    // Chief Strategy Officer
    chief: {
      intro: 'Como Director de Estrategia, observo que todavía estamos esperando las respuestas de los especialistas sobre "{query}".',
      introWithResponses: 'Como Director de Estrategia, después de analizar profundamente las {count} respuestas de los especialistas sobre "{query}", identifico los siguientes patrones estratégicos:',
      status: '⏳ **Estado:** Recopilando análisis de especialistas...',
      nextSteps: '💡 **Próximos Pasos:**',
      waitingAnalysis: '• Esperar conclusión de análisis individuales',
      compileInsights: '• Compilar insights después de recibir respuestas',
      generateConsensus: '• Generar consenso estratégico basado en datos',
      recommendation: '🔄 **Recomendación:** Espere unos segundos para el análisis completo.',
      convergenceAnalysis: '📊 **Análisis de Convergencia Temática:**',
      strategicConsensus: '🎯 **Consenso Estratégico Identificado:**',
      strategicDivergences: '⚡ **Divergencias Estratégicas y Mitigaciones:**',
      strategicRecommendations: '🔮 **Recomendaciones Estratégicas:**',
      strategicInsight: '💡 **Insight Estratégico Final:**',
      themes: {
        technical: 'Aspectos Técnicos',
        timeline: 'Cronograma y Plazos',
        security: 'Seguridad',
        scalability: 'Escalabilidad',
        userExperience: 'Experiencia del Usuario',
        implementation: 'Estrategia de Implementación',
        testing: 'Pruebas y Validación',
        architecture: 'Arquitectura del Sistema'
      },
      phases: {
        immediate: 'Fase Inmediata (Semanas 1-2):',
        development: 'Fase de Desarrollo (Meses 1-3):',
        scale: 'Fase de Escala (Mes 4+):'
      }
    },
    
    agent: {
      thinking: '🔍 Analizando con {agent}...',
      response: 'Respuesta de {agent}',
      confidence: 'Confianza: {level}%',
      specialty: 'Especialidad: {specialty}',
      perspective: 'Como {agent}, mi perspectiva sobre {topic} sería:',
      considerationsTitle: '**Consideraciones de {specialty}**',
      recommendationsTitle: '**Recomendaciones de {specialty}**',
      welcome: '¡Hola! Soy {name}, {role}. ¿Cómo puedo ayudar?',
      analyzing: '🔄 {agent} está analizando... ({current}/{total})'
    },
    
    // Room names and messages
    rooms: {
      allSpecialists: 'Todos los Especialistas',
      allWelcome: '¡Bienvenido a la sala con todos los especialistas! Haz tu pregunta y múltiples especialistas responderán.',
      ultrathinkWelcome: 'Sala UltraThink - Sistema avanzado de análisis con 100 agentes especializados.',
      builderWelcome: 'Usa el Constructor de Prompts para crear preguntas complejas seleccionando temas y especialistas.',
      summaryWelcome: 'Aquí recibes resúmenes inteligentes de las discusiones. Usa el control para ajustar el nivel de detalle.',
      defaultWelcome: '¡Bienvenido!'
    },
    
    // Analysis messages
    analysis: {
      completeAnalysis: 'Análisis UltraThink Enhanced Completo',
      documentAnalysis: 'Análisis del Documento',
      technicalAnalysis: 'Análisis Técnico Detallado',
      projectPhases: 'Fases del Proyecto',
      specialistTeam: 'Equipo de Especialistas',
      analysisMetrics: 'Métricas del Análisis',
      generalAnalysis: 'Análisis general del problema',
      waitingStart: 'Esperando inicio...',
      phase1Initial: 'Fase 1: Consulta Inicial',
      phase2Cross: 'Fase 2: Análisis Cruzado',
      phase3Patterns: 'Fase 3: Análisis de Patrones',
      phase4Orchestration: 'Fase 4: Orquestación',
      phase5Final: 'Fase 5: Síntesis Final'
    }
  }
};

// Classe para gerenciar traduções
export class I18nManager {
  constructor(language = 'pt-BR') {
    this.currentLanguage = language;
    this.translations = translations;
  }
  
  setLanguage(language) {
    if (SUPPORTED_LANGUAGES[language]) {
      this.currentLanguage = language;
      return true;
    }
    return false;
  }
  
  getLanguage() {
    return this.currentLanguage;
  }
  
  t(key, params = {}) {
    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];
    
    // Navegar pela estrutura de tradução
    for (const k of keys) {
      translation = translation?.[k];
      if (!translation) {
        console.warn(`Translation missing for key: ${key} in language: ${this.currentLanguage}`);
        return key;
      }
    }
    
    // Substituir parâmetros
    if (typeof translation === 'string') {
      return translation.replace(/{(\w+)}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }
    
    return translation;
  }
  
  // Obter todas as traduções de uma categoria
  getCategory(category) {
    return this.translations[this.currentLanguage]?.[category] || {};
  }
  
  // Verificar se um idioma é suportado
  isSupported(language) {
    return !!SUPPORTED_LANGUAGES[language];
  }
  
  // Obter lista de idiomas suportados
  getSupportedLanguages() {
    return Object.values(SUPPORTED_LANGUAGES);
  }
}

// Instância global
export const i18n = new I18nManager();