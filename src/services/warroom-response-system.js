/**
 * War Room Response System
 * Sistema unificado e melhorado para gerar respostas dos agentes
 */

import agentProfileManager from './agent-profile-manager.js';
import deepContextAnalyzer from './deep-context-analyzer.js';
import agents100Data from '../../warroom-agents-100.json' with { type: 'json' };

class WarRoomResponseSystem {
  constructor() {
    this.allAgents = agents100Data.warRoomTechInnovationRoles.agents;
    this.agentProfiles = new Map();
    this.responseCache = new Map();
  }

  /**
   * Gera resposta personalizada para um agente
   */
  async generateAgentResponse(agentData, query, options = {}) {
    const { language = 'pt-BR', context = {}, useAI = false } = options;
    
    // DEBUG: Log input original
    console.log('🔍 [WarRoomResponseSystem] Input recebido:', {
      query,
      agentId: agentData.id || agentData.name,
      language
    });
    
    // Encontrar agente completo nos dados
    const agent = this.findAgentById(agentData.id || agentData.name);
    if (!agent) {
      console.error(`Agent not found: ${agentData.id || agentData.name}`);
      return this.generateFallbackResponse(agentData, query, language);
    }

    // Obter ou criar perfil do agente
    const profile = this.getOrCreateProfile(agent);
    
    // Analisar contexto da query
    const queryContext = deepContextAnalyzer.analyzeInput(query);
    
    // DEBUG: Log contexto detectado
    console.log('🔍 [WarRoomResponseSystem] Contexto detectado:', {
      domain: queryContext?.domain,
      intent: queryContext?.intent,
      concepts: queryContext?.concepts
    });
    
    // Construir contexto de personalidade
    const personalityContext = agentProfileManager.buildPersonalityContext(agent, profile);
    
    // Gerar resposta baseada no domínio
    if (queryContext && queryContext.domain === 'gaming') {
      console.log('🎮 [WarRoomResponseSystem] Domínio gaming detectado via queryContext');
      return this.generateGamingResponse(agent, query, profile, personalityContext, language);
    }
    
    // Verificar se é query sobre jogos mesmo sem contexto
    if (this.isGamingQuery(query)) {
      console.log('🎮 [WarRoomResponseSystem] Gaming query detectada via isGamingQuery()');
      return this.generateGamingResponse(agent, query, profile, personalityContext, language);
    }
    
    // DEBUG: Log de resposta contextualizada sendo chamada
    console.log('📝 [WarRoomResponseSystem] Gerando resposta contextualizada genérica');
    
    // Gerar resposta contextualizada
    return this.generateContextualizedResponse(agent, query, profile, personalityContext, queryContext, language);
  }

  /**
   * Encontra agente por ID ou nome
   */
  findAgentById(identifier) {
    // Converter para string se for número
    const searchId = String(identifier);
    
    return this.allAgents.find(a => 
      String(a.id) === searchId || 
      a.name === searchId ||
      a.name.toLowerCase() === searchId.toLowerCase() ||
      String(a.id) === searchId.toLowerCase().replace(/\s+/g, '-')
    );
  }

  /**
   * Obtém ou cria perfil do agente
   */
  getOrCreateProfile(agent) {
    if (this.agentProfiles.has(agent.id)) {
      return this.agentProfiles.get(agent.id);
    }
    
    const profile = agentProfileManager.getAgentProfile(agent.id);
    this.agentProfiles.set(agent.id, profile);
    return profile;
  }

  /**
   * Verifica se é query sobre jogos
   */
  isGamingQuery(query) {
    // Ser mais específico sobre o que é uma query de gaming
    const gamingKeywords = ['jogo', 'game', 'mario', 'platformer', 'gameplay', 'gamedev', 'unity', 'phaser'];
    const lowerQuery = query.toLowerCase();
    
    // Verificar se realmente é sobre desenvolvimento de jogos
    const hasGamingKeyword = gamingKeywords.some(keyword => lowerQuery.includes(keyword));
    const hasGameContext = lowerQuery.includes('desenvolver') && (lowerQuery.includes('jogo') || lowerQuery.includes('game'));
    
    return hasGamingKeyword || hasGameContext;
  }

  /**
   * Gera resposta para domínio de jogos
   */
  generateGamingResponse(agent, query, profile, personalityContext, language) {
    const isWallyGame = query.toLowerCase().includes('wally') || query.toLowerCase().includes('onde está');
    
    if (isWallyGame) {
      return this.generateWallyGameResponse(agent, query, profile, personalityContext, language);
    }
    
    // Analisar contexto e usar resposta contextualizada
    const queryContext = deepContextAnalyzer.analyzeInput(query);
    return this.generateContextualizedResponse(agent, query, profile, personalityContext, queryContext, language);
  }

  /**
   * Gera resposta específica para jogo Where's Wally
   */
  generateWallyGameResponse(agent, query, profile, personalityContext, language) {
    const responses = {
      'pt-BR': {
        'game-developer': `${personalityContext}

**🎮 Análise Técnica - Jogo "Onde Está o Wally"**

Como ${agent.name}, vejo excelente potencial neste conceito de busca visual!

**🔍 Mecânicas Core do Jogo:**
• **Sistema de Detecção**: Implementar zonas clicáveis precisas com hitboxes
• **Zoom Inteligente**: Pinch-to-zoom em mobile, scroll wheel no desktop
• **Níveis Progressivos**: ${profile.expertise.primary} aplicada para dificuldade adaptativa
• **Sistema de Dicas**: Hints visuais sutis após tempo sem encontrar

**🛠️ Stack Técnica Recomendada:**
• **Frontend**: Phaser 3 com TypeScript para máxima performance
• **Imagens**: Sprites de alta resolução com lazy loading
• **Backend**: Node.js + Redis para leaderboards em tempo real
• **Deploy**: PWA para funcionar offline após primeira carga

**✨ Features Diferenciais:**
1. **Modo Multiplayer**: Competição simultânea para encontrar primeiro
2. **Geração Procedural**: Algoritmos para randomizar posições dos objetos
3. **Temas Customizados**: Upload de imagens próprias para criar níveis
4. **Achievements System**: Conquistas para aumentar retenção

**💡 Insights de ${profile.personality.traits[0]}:**
Com minha visão ${profile.personality.traits[1]}, sugiro começar com um protótipo focado na mecânica de busca. A ${profile.expertise.secondary} será crucial para criar uma experiência fluida.

**📊 Métricas de Sucesso:**
- Tempo médio por nível: 30-90 segundos
- Taxa de conclusão: > 80% no tutorial
- Retenção D1: > 40%
- Virality factor: > 1.2

Pronto para detalhar qualquer aspecto técnico!`,

        'ui-ux-designer': `${personalityContext}

**🎨 Design de Experiência - Jogo "Onde Está o Wally"**

Como ${agent.name}, foco na criação de uma experiência visual envolvente!

**👁️ Interface & Interação:**
• **Zoom Suave**: Animações fluidas com easing para navegação natural
• **Visual Feedback**: Highlight sutil ao hover + celebração ao encontrar
• **HUD Adaptativo**: UI que se esconde durante busca, aparece quando necessário
• **Onboarding Visual**: Tutorial sem texto, apenas indicações visuais

**🎯 Fluxo de Usuário Otimizado:**
1. **Splash Screen Cativante**: Primeira impressão memorável
2. **Seleção de Níveis**: Grid visual estilo Netflix
3. **Gameplay Imersivo**: Tela cheia sem distrações
4. **Celebração de Vitória**: Dopamina através de micro-interações

**🌈 Direção de Arte:**
• **Paleta Vibrante**: Cores que não cansam após longas sessões
• **Contraste Calculado**: Wally visível mas desafiador
• **Temas Diversos**: Praia, cidade, espaço, fantasia medieval
• **Modo Noturno**: Preservar visão em ambientes escuros

**✨ Micro-interações Mágicas:**
- Parallax sutil ao mover dispositivo (giroscópio)
- Partículas ao encontrar objetos especiais
- Sons satisfatórios sincronizados com ações
- Haptic feedback calibrado para cada descoberta

Com minha abordagem ${profile.personality.traits[0]} e visão ${profile.personality.traits[1]}, criaremos uma experiência que os jogadores vão adorar compartilhar!

**🎮 Gamification Elements:**
- Streaks por encontrar rápido
- Badges colecionáveis
- Ranking social integrado
- Daily challenges

Vamos criar algo incrível?`,

        'backend-architect': `${personalityContext}

**⚙️ Arquitetura Backend - Jogo "Onde Está o Wally"**

Como ${agent.name}, projeto uma infraestrutura robusta e escalável!

**🏗️ Arquitetura de Sistema:**
• **API Gateway**: Kong/Express para roteamento inteligente
• **Microserviços**: Separação por domínio (Game, User, Analytics)
• **Cache Layer**: Redis para rankings e sessões ativas
• **Message Queue**: RabbitMQ para processamento assíncrono

**📊 Modelagem de Dados:**
\`\`\`typescript
interface GameSession {
  id: string;
  userId: string;
  levelId: string;
  startTime: Date;
  clicks: ClickEvent[];
  foundObjects: FoundObject[];
  score: number;
  completed: boolean;
}

interface ClickEvent {
  x: number;
  y: number;
  timestamp: number;
  hit: boolean;
}
\`\`\`

**🔧 APIs Essenciais:**
• \`POST /api/game/start\` - Inicia sessão com seed único
• \`POST /api/game/click\` - Registra tentativa (validação server-side)
• \`GET /api/leaderboard/:level\` - Rankings com cache de 60s
• \`WS /game/multiplayer\` - WebSocket para modo competitivo

**🛡️ Segurança & Performance:**
- Rate limiting por IP (100 req/min)
- Validação de clicks no servidor (anti-cheat)
- CDN para assets estáticos (CloudFlare)
- Compressão Brotli para imagens grandes

**📈 Escalabilidade:**
Com ${profile.expertise.primary}, implemento auto-scaling baseado em:
- CPU usage > 70%
- Concurrent players > 1000
- Response time > 200ms

Minha visão ${profile.personality.traits[0]} garante que o sistema suporte milhões de jogadores simultâneos!`,

        'mobile-architect': `${personalityContext}

**📱 Arquitetura Mobile - Jogo "Onde Está o Wally"**

Como ${agent.name}, otimizo para a melhor experiência mobile!

**📲 Estratégia Multiplataforma:**
• **React Native**: Code sharing 90% entre iOS/Android
• **Native Modules**: Performance crítica em módulos nativos
• **Offline First**: SQLite para jogar sem internet
• **Progressive Web App**: Alternativa para alcance máximo

**🎮 Otimizações Mobile:**
• **Gesture Recognition**: Pinch, pan, double-tap nativo
• **Memory Management**: Unload de sprites fora da viewport
• **Battery Efficiency**: Throttling inteligente de animações
• **Adaptive Quality**: Resolução baseada no dispositivo

**💾 Gerenciamento de Assets:**
\`\`\`javascript
// Sistema de loading otimizado
class AssetManager {
  async loadLevel(levelId) {
    // Carrega apenas tiles visíveis
    const visibleTiles = this.calculateVisibleTiles();
    // Pre-fetch próximos tiles prováveis
    this.prefetchAdjacentTiles(visibleTiles);
  }
}
\`\`\`

**🔔 Engajamento Mobile:**
• **Push Notifications**: Daily challenges e eventos
• **Deep Linking**: Compartilhar níveis específicos
• **Social Integration**: Game Center/Google Play Games
• **AR Mode**: Usando ARCore/ARKit para esconder no mundo real

Com minha expertise em ${profile.expertise.primary} e visão ${profile.personality.traits[1]}, garantimos 60 FPS mesmo em dispositivos medianos!

**📊 Analytics Mobile:**
- Heatmaps de toques
- Session length tracking
- Crash reporting (Sentry)
- A/B testing framework

Pronto para revolucionar mobile gaming!`
      },
      
      'en-US': {
        'game-developer': `${personalityContext}

**🎮 Technical Analysis - "Where's Wally" Game**

As ${agent.name}, I see excellent potential in this visual search concept!

**🔍 Core Game Mechanics:**
• **Detection System**: Implement precise clickable zones with hitboxes
• **Smart Zoom**: Pinch-to-zoom on mobile, scroll wheel on desktop
• **Progressive Levels**: ${profile.expertise.primary} applied for adaptive difficulty
• **Hint System**: Subtle visual hints after time without finding

**🛠️ Recommended Tech Stack:**
• **Frontend**: Phaser 3 with TypeScript for maximum performance
• **Images**: High-resolution sprites with lazy loading
• **Backend**: Node.js + Redis for real-time leaderboards
• **Deploy**: PWA to work offline after first load

**✨ Differentiating Features:**
1. **Multiplayer Mode**: Simultaneous competition to find first
2. **Procedural Generation**: Algorithms to randomize object positions
3. **Custom Themes**: Upload own images to create levels
4. **Achievement System**: Achievements to increase retention

Ready to detail any technical aspect!`
      }
    };

    const langResponses = responses[language] || responses['pt-BR'];
    const agentResponse = langResponses[agent.id];
    
    if (agentResponse) {
      return agentResponse;
    }
    
    // Fallback para agentes não específicos
    return this.generateGenericWallyResponse(agent, query, profile, personalityContext, language);
  }

  /**
   * Gera resposta genérica para Where's Wally
   */
  generateGenericWallyResponse(agent, query, profile, personalityContext, language) {
    const templates = {
      'pt-BR': `${personalityContext}

**🎯 Análise para Jogo "Onde Está o Wally"**

Como ${agent.name} (${agent.role}), trago minha perspectiva única:

**🔍 Minha Contribuição Específica:**
Aplicando ${profile.expertise.primary} ao conceito do jogo, posso ajudar com:
• Otimização na área de ${agent.capabilities[0]}
• Implementação de ${agent.capabilities[1]}
• Garantia de qualidade em ${agent.capabilities[2]}

**💡 Insights da Minha Área:**
Com minha experiência em ${profile.expertise.secondary}, sugiro:
1. Foco em ${this.getRelevantFocus(agent)}
2. Atenção especial para ${this.getRelevantConcern(agent)}
3. Implementação de ${this.getRelevantFeature(agent)}

**🚀 Recomendações:**
Sendo ${profile.personality.traits[0]} e ${profile.personality.traits[1]}, recomendo:
- Começar com protótipo focado
- Validar com usuários reais cedo
- Iterar baseado em métricas

Pronto para colaborar e trazer resultados excepcionais!`,

      'en-US': `${personalityContext}

**🎯 Analysis for "Where's Wally" Game**

As ${agent.name} (${agent.role}), I bring my unique perspective:

**🔍 My Specific Contribution:**
Applying ${profile.expertise.primary} to the game concept, I can help with:
• Optimization in ${agent.capabilities[0]}
• Implementation of ${agent.capabilities[1]}
• Quality assurance in ${agent.capabilities[2]}

Ready to collaborate and deliver exceptional results!`
    };

    return templates[language] || templates['pt-BR'];
  }

  /**
   * Gera resposta contextualizada genérica
   */
  generateContextualizedResponse(agent, query, profile, personalityContext, queryContext, language) {
    const intro = language === 'pt-BR' 
      ? `Como ${agent.name}, especialista em ${agent.role}, analiso sua solicitação:`
      : `As ${agent.name}, specialist in ${agent.role}, I analyze your request:`;

    return `${personalityContext}

**${intro}**

${this.generateContextContent(agent, query, profile, queryContext, language)}

${this.generateSpecificInsights(agent, profile, queryContext, language)}

${this.generateActionItems(agent, profile, language)}
`;
  }

  /**
   * Gera conteúdo contextual
   */
  generateContextContent(agent, query, profile, context, language) {
    const content = [];
    
    if (context.concepts.technical.length > 0) {
      const techConcepts = context.concepts.technical.join(', ');
      content.push(language === 'pt-BR' 
        ? `**Conceitos Técnicos Identificados:** ${techConcepts}`
        : `**Technical Concepts Identified:** ${techConcepts}`
      );
    }
    
    if (profile && profile.expertise) {
      content.push(language === 'pt-BR'
        ? `**Minha Expertise Aplicável:**\n• ${profile.expertise.primary || agent.capabilities[0] || 'Expertise técnica'}\n• ${profile.expertise.secondary || agent.capabilities[1] || 'Análise avançada'}\n• ${profile.expertise.emergent || agent.capabilities[2] || 'Soluções inovadoras'}`
        : `**My Applicable Expertise:**\n• ${profile.expertise.primary || agent.capabilities[0] || 'Technical expertise'}\n• ${profile.expertise.secondary || agent.capabilities[1] || 'Advanced analysis'}\n• ${profile.expertise.emergent || agent.capabilities[2] || 'Innovative solutions'}`
      );
    } else {
      // Fallback para capabilities do agente
      const caps = agent.capabilities || ['Expertise técnica', 'Análise avançada', 'Soluções inovadoras'];
      content.push(language === 'pt-BR'
        ? `**Minha Expertise Aplicável:**\n• ${caps[0] || 'Expertise técnica'}\n• ${caps[1] || 'Análise avançada'}\n• ${caps[2] || 'Soluções inovadoras'}`
        : `**My Applicable Expertise:**\n• ${caps[0] || 'Technical expertise'}\n• ${caps[1] || 'Advanced analysis'}\n• ${caps[2] || 'Innovative solutions'}`
      );
    }
    
    return content.join('\n\n');
  }

  /**
   * Gera insights específicos
   */
  generateSpecificInsights(agent, profile, context, language) {
    const insights = [];
    
    // Baseado no tipo de agente
    const agentType = this.detectAgentType(agent);
    
    switch (agentType) {
      case 'architect':
        insights.push(language === 'pt-BR'
          ? '🏗️ **Perspectiva Arquitetural:**\n- Estrutura modular e escalável\n- Padrões de design apropriados\n- Integração com sistemas existentes'
          : '🏗️ **Architectural Perspective:**\n- Modular and scalable structure\n- Appropriate design patterns\n- Integration with existing systems'
        );
        break;
      
      case 'developer':
        insights.push(language === 'pt-BR'
          ? '💻 **Perspectiva de Desenvolvimento:**\n- Implementação eficiente\n- Código limpo e testável\n- Performance otimizada'
          : '💻 **Development Perspective:**\n- Efficient implementation\n- Clean and testable code\n- Optimized performance'
        );
        break;
      
      case 'designer':
        insights.push(language === 'pt-BR'
          ? '🎨 **Perspectiva de Design:**\n- Experiência do usuário intuitiva\n- Interface visualmente atraente\n- Acessibilidade garantida'
          : '🎨 **Design Perspective:**\n- Intuitive user experience\n- Visually appealing interface\n- Guaranteed accessibility'
        );
        break;
      
      default:
        insights.push(language === 'pt-BR'
          ? `📊 **Perspectiva de ${agent.role}:**\n- Análise especializada\n- Recomendações práticas\n- Soluções inovadoras`
          : `📊 **${agent.role} Perspective:**\n- Specialized analysis\n- Practical recommendations\n- Innovative solutions`
        );
    }
    
    // Adicionar traços de personalidade
    if (profile && profile.personality && profile.personality.traits && profile.personality.traits.length >= 2) {
      insights.push(language === 'pt-BR'
        ? `\n💭 **Abordagem ${profile.personality.traits[0]}:**\nCom minha visão ${profile.personality.traits[1]}, foco em resultados práticos e mensuráveis.`
        : `\n💭 **${profile.personality.traits[0]} Approach:**\nWith my ${profile.personality.traits[1]} vision, I focus on practical and measurable results.`
      );
    } else {
      // Fallback se não houver perfil completo
      insights.push(language === 'pt-BR'
        ? `\n💭 **Abordagem Especializada:**\nCom minha expertise em ${agent.role}, foco em resultados práticos e mensuráveis.`
        : `\n💭 **Specialized Approach:**\nWith my expertise in ${agent.role}, I focus on practical and measurable results.`
      );
    }
    
    return insights.join('\n\n');
  }

  /**
   * Gera itens de ação
   */
  generateActionItems(agent, profile, language) {
    const actions = language === 'pt-BR'
      ? '**🎯 Próximos Passos Recomendados:**'
      : '**🎯 Recommended Next Steps:**';
    
    const primaryExpertise = (profile && profile.expertise && profile.expertise.primary) 
      ? profile.expertise.primary 
      : (agent.capabilities && agent.capabilities[0]) || agent.role;
      
    const items = language === 'pt-BR' ? [
      `1. Aplicar ${primaryExpertise} ao problema`,
      `2. Colaborar com especialistas complementares`,
      `3. Validar solução com métricas claras`,
      `4. Iterar baseado em feedback`
    ] : [
      `1. Apply ${primaryExpertise} to the problem`,
      `2. Collaborate with complementary specialists`,
      `3. Validate solution with clear metrics`,
      `4. Iterate based on feedback`
    ];
    
    return `${actions}\n${items.join('\n')}`;
  }

  /**
   * Detecta tipo de agente
   */
  detectAgentType(agent) {
    const role = agent.role.toLowerCase();
    if (role.includes('architect')) return 'architect';
    if (role.includes('developer') || role.includes('engineer')) return 'developer';
    if (role.includes('designer') || role.includes('ux')) return 'designer';
    if (role.includes('analyst')) return 'analyst';
    if (role.includes('manager')) return 'manager';
    return 'specialist';
  }

  /**
   * Helpers para respostas genéricas
   */
  getRelevantFocus(agent) {
    const focuses = {
      'architect': 'arquitetura escalável e manutenível',
      'developer': 'código limpo e performático',
      'designer': 'experiência do usuário excepcional',
      'analyst': 'dados e métricas acionáveis',
      'manager': 'entrega de valor ao negócio'
    };
    
    const type = this.detectAgentType(agent);
    return focuses[type] || 'excelência técnica';
  }

  getRelevantConcern(agent) {
    const concerns = {
      'architect': 'escalabilidade futura',
      'developer': 'manutenibilidade do código',
      'designer': 'usabilidade intuitiva',
      'analyst': 'qualidade dos dados',
      'manager': 'alinhamento com objetivos'
    };
    
    const type = this.detectAgentType(agent);
    return concerns[type] || 'qualidade geral';
  }

  getRelevantFeature(agent) {
    const features = {
      'architect': 'monitoramento e observabilidade',
      'developer': 'testes automatizados',
      'designer': 'sistema de design consistente',
      'analyst': 'dashboards em tempo real',
      'manager': 'métricas de sucesso'
    };
    
    const type = this.detectAgentType(agent);
    return features[type] || 'melhores práticas';
  }

  /**
   * Gera resposta de fallback
   */
  generateFallbackResponse(agentData, query, language) {
    return language === 'pt-BR'
      ? `Como ${agentData.name || 'Especialista'}, analiso "${query}" e recomendo uma abordagem cuidadosa com foco em qualidade e resultados.`
      : `As ${agentData.name || 'Specialist'}, I analyze "${query}" and recommend a careful approach focused on quality and results.`;
  }
}

export default new WarRoomResponseSystem();