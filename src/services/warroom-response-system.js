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
    // Variação de intros baseada no tipo de agente
    const agentType = this.detectAgentType(agent);
    const intros = this.getVariedIntros(agent, agentType, language);
    const intro = intros[Math.floor(Math.random() * intros.length)];

    // Estruturas variadas de resposta
    const structures = [
      // Estrutura 1: Clássica
      () => `${personalityContext}

**${intro}**

${this.generateContextContent(agent, query, profile, queryContext, language)}

${this.generateSpecificInsights(agent, profile, queryContext, query, language)}

${this.generateActionItems(agent, profile, queryContext, query, language)}`,
      
      // Estrutura 2: Insights primeiro
      () => `${personalityContext}

**${intro}**

${this.generateSpecificInsights(agent, profile, queryContext, query, language)}

${this.generateContextContent(agent, query, profile, queryContext, language)}

${this.generateActionItems(agent, profile, queryContext, query, language)}`,
      
      // Estrutura 3: Direto ao ponto
      () => `${personalityContext}

**${intro}**

${this.generateSpecificInsights(agent, profile, queryContext, query, language)}

${this.generateActionItems(agent, profile, queryContext, query, language)}`,
      
      // Estrutura 4: Começa com ação
      () => `${personalityContext}

**${intro}**

${this.generateActionItems(agent, profile, queryContext, query, language)}

${this.generateSpecificInsights(agent, profile, queryContext, query, language)}`
    ];
    
    // Escolher estrutura aleatoriamente mas consistente por agente
    const structureIndex = agent.id % structures.length;
    return structures[structureIndex]();
  }

  /**
   * Gera conteúdo contextual
   */
  generateContextContent(agent, query, profile, context, language) {
    const content = [];
    
    // DEBUG: Log do que está sendo analisado
    console.log('📝 [generateContextContent] Analisando query:', query);
    console.log('📝 [generateContextContent] Contexto:', context);
    
    // Análise específica baseada na query real
    const lowerQuery = query.toLowerCase();
    
    // Detectar tipo de aplicação sendo solicitada
    if (lowerQuery.includes('uber') && (lowerQuery.includes('cachorro') || lowerQuery.includes('pet') || lowerQuery.includes('animal'))) {
      // Uber para cachorros - análise específica
      if (language === 'pt-BR') {
        content.push(`**🐕 Análise: Aplicativo de Transporte para Pets**`);
        content.push(`\n**Conceitos-Chave Identificados:**`);
        content.push(`• Sistema de transporte sob demanda`);
        content.push(`• Segurança e bem-estar animal`);
        content.push(`• Rastreamento GPS em tempo real`);
        content.push(`• Motoristas especializados em pets`);
        content.push(`• Integração de pagamentos`);
      }
    } else if (lowerQuery.includes('crypto') || lowerQuery.includes('pagamento')) {
      // Aplicação com pagamento crypto
      if (language === 'pt-BR') {
        content.push(`**💰 Análise: Sistema com Pagamento em Criptomoedas**`);
        content.push(`\n**Conceitos-Chave Identificados:**`);
        content.push(`• Integração com blockchain`);
        content.push(`• Carteiras digitais`);
        content.push(`• Processamento de transações crypto`);
        content.push(`• Segurança e compliance`);
      }
    } else if (lowerQuery.includes('venda') || lowerQuery.includes('produto') || lowerQuery.includes('ecommerce')) {
      // E-commerce
      if (language === 'pt-BR') {
        content.push(`**🛒 Análise: Plataforma de E-commerce**`);
        content.push(`\n**Conceitos-Chave Identificados:**`);
        content.push(`• Catálogo de produtos`);
        content.push(`• Carrinho de compras`);
        content.push(`• Sistema de pagamentos`);
        content.push(`• Gestão de pedidos`);
      }
    }
    
    // Adicionar expertise do agente contextualizada
    if (profile && profile.expertise) {
      content.push(language === 'pt-BR'
        ? `\n**Como ${agent.role}, posso contribuir com:**\n• ${profile.expertise.primary || agent.capabilities[0]}\n• ${profile.expertise.secondary || agent.capabilities[1]}\n• ${profile.expertise.emergent || agent.capabilities[2]}`
        : `\n**As ${agent.role}, I can contribute with:**\n• ${profile.expertise.primary || agent.capabilities[0]}\n• ${profile.expertise.secondary || agent.capabilities[1]}\n• ${profile.expertise.emergent || agent.capabilities[2]}`
      );
    }
    
    // Se tiver conceitos técnicos detectados, incluí-los
    if (context.concepts && context.concepts.technical && context.concepts.technical.length > 0) {
      const techConcepts = context.concepts.technical.join(', ');
      content.push(language === 'pt-BR' 
        ? `\n**Tecnologias Relevantes:** ${techConcepts}`
        : `\n**Relevant Technologies:** ${techConcepts}`
      );
    }
        : `**My Applicable Expertise:**\n• ${caps[0] || 'Technical expertise'}\n• ${caps[1] || 'Advanced analysis'}\n• ${caps[2] || 'Innovative solutions'}`
      );
    }
    
    return content.join('\n\n');
  }

  /**
   * Gera insights específicos
   */
  generateSpecificInsights(agent, profile, context, query, language) {
    const insights = [];
    
    // DEBUG: Log do que está sendo analisado
    console.log('🔍 [generateSpecificInsights] Gerando insights para:', agent.name);
    console.log('🔍 [generateSpecificInsights] Contexto:', context);
    
    // Baseado no tipo de agente e no contexto da query
    const agentType = this.detectAgentType(agent);
    // Usar a query diretamente, não context.originalInput
    const lowerQuery = query ? query.toLowerCase() : '';
    
    // Gerar insights específicos baseados na query real
    if (lowerQuery.includes('uber') && (lowerQuery.includes('cachorro') || lowerQuery.includes('pet'))) {
      // Insights específicos para Uber de cachorros
      switch (agentType) {
        case 'architect':
          insights.push(language === 'pt-BR'
            ? '🏗️ **Arquitetura para App de Transporte Pet:**\n- Microserviços para matching motorista-pet\n- Sistema de rastreamento GPS em tempo real\n- API Gateway para app mobile/web\n- Fila de mensagens para notificações push\n- Banco de dados NoSQL para flexibilidade'
            : '🏗️ **Architecture for Pet Transport App:**\n- Microservices for driver-pet matching\n- Real-time GPS tracking system\n- API Gateway for mobile/web app\n- Message queue for push notifications\n- NoSQL database for flexibility'
          );
          break;
        
        case 'developer':
          insights.push(language === 'pt-BR'
            ? '💻 **Desenvolvimento do App Uber Pet:**\n- React Native para app cross-platform\n- WebSocket para tracking em tempo real\n- Integração com Google Maps API\n- Sistema de avaliação motorista/dono\n- Upload de fotos e informações do pet'
            : '💻 **Pet Uber App Development:**\n- React Native for cross-platform app\n- WebSocket for real-time tracking\n- Google Maps API integration\n- Driver/owner rating system\n- Pet photo and info upload'
          );
          break;
          
        case 'security':
          insights.push(language === 'pt-BR'
            ? '🔒 **Segurança para Transporte de Pets:**\n- Verificação de antecedentes dos motoristas\n- Criptografia de dados sensíveis\n- Sistema de emergência com botão de pânico\n- Histórico completo de viagens\n- Compliance com LGPD/GDPR'
            : '🔒 **Security for Pet Transport:**\n- Driver background verification\n- Sensitive data encryption\n- Emergency system with panic button\n- Complete trip history\n- LGPD/GDPR compliance'
          );
          break;
          
        case 'ux':
          insights.push(language === 'pt-BR'
            ? '🎨 **UX/UI para App de Transporte Pet:**\n- Interface intuitiva para donos de pets\n- Perfil detalhado do pet (tamanho, temperamento)\n- Fotos e avaliações dos motoristas\n- Acompanhamento visual da viagem\n- Chat in-app para comunicação'
            : '🎨 **UX/UI for Pet Transport App:**\n- Intuitive interface for pet owners\n- Detailed pet profile (size, temperament)\n- Driver photos and ratings\n- Visual trip tracking\n- In-app chat for communication'
          );
          break;
          
        default:
          // Insights genéricos mas contextualizados
          insights.push(language === 'pt-BR'
            ? `💡 **Insights para ${agent.role}:**\n- Análise das necessidades específicas de transporte pet\n- Considerações sobre bem-estar animal\n- Oportunidades de diferenciação no mercado\n- Integração com clínicas veterinárias`
            : `💡 **Insights as ${agent.role}:**\n- Analysis of specific pet transport needs\n- Animal welfare considerations\n- Market differentiation opportunities\n- Veterinary clinic integration`
          );
      }
    } else {
      // Para outras queries, gerar insights mais genéricos mas ainda contextualizados
      switch (agentType) {
        case 'architect':
          insights.push(language === 'pt-BR'
            ? '🏗️ **Perspectiva Arquitetural:**\n- Estrutura modular e escalável para o projeto\n- Padrões de design adequados ao domínio\n- Integração com APIs e serviços externos\n- Considerações de performance e segurança'
            : '🏗️ **Architectural Perspective:**\n- Modular and scalable structure for the project\n- Domain-appropriate design patterns\n- Integration with APIs and external services\n- Performance and security considerations'
          );
          break;
        
        case 'developer':
          insights.push(language === 'pt-BR'
            ? '💻 **Perspectiva de Desenvolvimento:**\n- Escolha de stack tecnológica apropriada\n- Implementação de features core\n- Testes automatizados e CI/CD\n- Otimização de performance'
            : '💻 **Development Perspective:**\n- Appropriate technology stack selection\n- Core feature implementation\n- Automated testing and CI/CD\n- Performance optimization'
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
  generateActionItems(agent, profile, context, query, language) {
    const actions = language === 'pt-BR'
      ? '**🎯 Próximos Passos Recomendados:**'
      : '**🎯 Recommended Next Steps:**';
    
    // DEBUG: Log do contexto
    console.log('🎯 [generateActionItems] Gerando ações para query:', query);
    
    const lowerQuery = query.toLowerCase();
    const agentType = this.detectAgentType(agent);
    let items = [];
    
    // Ações específicas baseadas na query
    if (lowerQuery.includes('uber') && (lowerQuery.includes('cachorro') || lowerQuery.includes('pet'))) {
      // Ações para Uber de cachorros
      if (language === 'pt-BR') {
        switch (agentType) {
          case 'architect':
            items = [
              '1. Definir arquitetura de microserviços para o sistema',
              '2. Projetar sistema de matching motorista-pet em tempo real',
              '3. Implementar arquitetura de rastreamento GPS',
              '4. Planejar integração com gateways de pagamento'
            ];
            break;
          case 'developer':
            items = [
              '1. Criar MVP com funcionalidades core (cadastro, busca, tracking)',
              '2. Implementar sistema de notificações push',
              '3. Desenvolver algoritmo de matching por proximidade',
              '4. Integrar APIs de mapas e pagamento'
            ];
            break;
          case 'ux':
          case 'designer':
            items = [
              '1. Criar wireframes das telas principais',
              '2. Definir fluxo de usuário para solicitação de corrida',
              '3. Design de interface para perfil do pet',
              '4. Prototipar sistema de avaliação pós-corrida'
            ];
            break;
          default:
            items = [
              '1. Pesquisar mercado de transporte pet existente',
              '2. Definir requisitos de segurança para pets',
              '3. Estabelecer parcerias com motoristas especializados',
              '4. Criar plano de validação com donos de pets'
            ];
        }
      }
    } else if (lowerQuery.includes('crypto') || lowerQuery.includes('pagamento')) {
      // Ações para sistema com crypto
      if (language === 'pt-BR') {
        items = [
          '1. Integrar API de pagamento crypto (commerce.gotas.com)',
          '2. Implementar carteira digital segura',
          '3. Criar sistema de conversão de moedas',
          '4. Garantir compliance com regulamentações'
        ];
      }
    } else if (lowerQuery.includes('venda') || lowerQuery.includes('produto')) {
      // Ações para e-commerce
      if (language === 'pt-BR') {
        items = [
          '1. Desenvolver catálogo de produtos',
          '2. Implementar carrinho de compras',
          '3. Integrar sistema de pagamento',
          '4. Criar painel administrativo'
        ];
      }
    } else {
      // Ações genéricas mas ainda relevantes
      const primaryExpertise = (profile && profile.expertise && profile.expertise.primary) 
        ? profile.expertise.primary 
        : agent.role;
        
      items = language === 'pt-BR' ? [
        `1. Analisar requisitos específicos do projeto`,
        `2. Aplicar ${primaryExpertise} na solução`,
        `3. Definir métricas de sucesso`,
        `4. Criar roadmap de implementação`
      ] : [
        `1. Analyze specific project requirements`,
        `2. Apply ${primaryExpertise} to the solution`,
        `3. Define success metrics`,
        `4. Create implementation roadmap`
      ];
    }
    
    return `${actions}\n${items.join('\n')}`;
  }

  /**
   * Detecta tipo de agente
   */
  detectAgentType(agent) {
    const role = agent.role.toLowerCase();
    if (role.includes('architect')) return 'architect';
    if (role.includes('developer') || role.includes('engineer')) return 'developer';
    if (role.includes('designer') || role.includes('ux')) return 'ux';
    if (role.includes('security') || role.includes('cyber')) return 'security';
    if (role.includes('analyst')) return 'analyst';
    if (role.includes('manager')) return 'manager';
    return 'specialist';
  }

  /**
   * Gera intros variadas para evitar duplicação
   */
  getVariedIntros(agent, agentType, language) {
    if (language === 'pt-BR') {
      const baseIntros = {
        'architect': [
          `🏗️ Como ${agent.name}, arquiteto de sistemas, vejo oportunidades únicas aqui:`,
          `Analisando com minha expertise em ${agent.role}:`,
          `${agent.name} aqui. Minha visão arquitetural sobre o projeto:`,
          `Perspectiva de ${agent.role} sobre sua ideia:`
        ],
        'developer': [
          `💻 ${agent.name} respondendo! Vamos codar essa solução:`,
          `Como ${agent.role}, já estou visualizando a implementação:`,
          `Desenvolvedor ${agent.name} analisando os requisitos técnicos:`,
          `Hora de transformar essa ideia em código! ${agent.name} aqui:`
        ],
        'ux': [
          `🎨 ${agent.name}, focado em experiência do usuário:`,
          `Design e UX são minha paixão! Análise de ${agent.name}:`,
          `Como ${agent.role}, priorizo sempre o usuário:`,
          `${agent.name} trazendo perspectiva de design centrado no humano:`
        ],
        'security': [
          `🔒 ${agent.name}, especialista em segurança, alertando:`,
          `Segurança primeiro! ${agent.role} analisando:`,
          `Como ${agent.name}, vejo aspectos críticos de segurança:`,
          `Protegendo seu projeto - ${agent.name} em ação:`
        ],
        'manager': [
          `📊 ${agent.name} com visão estratégica do projeto:`,
          `Gerenciamento eficaz é crucial. ${agent.role} analisando:`,
          `Como ${agent.name}, foco no sucesso do projeto:`,
          `Visão executiva de ${agent.name} sobre a proposta:`
        ],
        'default': [
          `${agent.name}, ${agent.role}, contribuindo com expertise:`,
          `Especialista ${agent.name} analisando sua solicitação:`,
          `Como ${agent.role}, trago insights valiosos:`,
          `${agent.name} aqui para ajudar com minha expertise:`
        ]
      };
      return baseIntros[agentType] || baseIntros['default'];
    } else {
      // English intros
      return [
        `As ${agent.name}, ${agent.role}, I bring unique insights:`,
        `${agent.name} here, analyzing from my ${agent.role} perspective:`,
        `Expert analysis from ${agent.name}:`,
        `${agent.role} ${agent.name} contributing specialized knowledge:`
      ];
    }
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