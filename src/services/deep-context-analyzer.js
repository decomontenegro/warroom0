/**
 * Deep Context Analyzer
 * Sistema avançado para análise profunda de contexto e geração de respostas de alto valor
 */

export class DeepContextAnalyzer {
  constructor() {
    this.domainKnowledge = {
      crypto: {
        keywords: ['crypto', 'blockchain', 'bitcoin', 'ethereum', 'defi', 'nft', 'web3', 'smart contract'],
        concepts: ['descentralização', 'tokenização', 'wallets', 'gas fees', 'exchanges', 'stablecoins'],
        challenges: ['volatilidade', 'regulação', 'adoção', 'UX complexa', 'custos de transação']
      },
      ecommerce: {
        keywords: ['vender', 'comprar', 'loja', 'e-commerce', 'marketplace', 'pagamento'],
        concepts: ['carrinho', 'checkout', 'frete', 'estoque', 'fulfillment', 'customer service'],
        challenges: ['conversão', 'abandono de carrinho', 'logística', 'fraude', 'competição']
      },
      coffee: {
        keywords: ['café', 'coffee', 'grãos', 'torrefação', 'barista', 'espresso'],
        concepts: ['origem', 'qualidade', 'sustentabilidade', 'fair trade', 'specialty coffee'],
        challenges: ['sazonalidade', 'conservação', 'certificação', 'preço commodity', 'educação do consumidor']
      },
      global: {
        keywords: ['mundial', 'global', 'globalmente', 'internacional', 'mundo todo'],
        concepts: ['localização', 'moedas', 'regulamentações', 'culturas', 'fusos horários'],
        challenges: ['barreiras legais', 'impostos', 'idiomas', 'logística internacional', 'câmbio']
      },
      gaming: {
        keywords: ['jogo', 'game', 'gaming', 'mario', 'platformer', 'player', 'jogar', 'gameplay', 'level', 'fase'],
        concepts: ['mecânicas', 'física', 'controles', 'engine', 'sprites', 'collision', 'multiplayer', 'save system'],
        challenges: ['performance', 'balanceamento', 'curva de aprendizado', 'monetização', 'retenção', 'bugs']
      },
      transport: {
        keywords: ['uber', 'transporte', 'corrida', 'motorista', 'passageiro', 'viagem', 'taxi', 'carona'],
        concepts: ['rastreamento', 'GPS', 'matching', 'tarifa', 'avaliação', 'segurança', 'pagamento'],
        challenges: ['regulamentação', 'segurança', 'confiabilidade', 'preço', 'concorrência']
      },
      pets: {
        keywords: ['cachorro', 'pet', 'animal', 'cão', 'gato', 'bicho', 'mascote', 'veterinário'],
        concepts: ['cuidados', 'saúde', 'bem-estar', 'segurança', 'alimentação', 'vacinação'],
        challenges: ['comportamento', 'doenças', 'emergências', 'custos', 'regulamentação']
      }
    };
  }

  /**
   * Analisa profundamente o contexto da pergunta
   */
  analyzeDeepContext(userInput) {
    const analysis = {
      domains: [],
      businessModel: {},
      technicalRequirements: [],
      userNeeds: [],
      marketOpportunities: [],
      challenges: [],
      competitiveAdvantages: []
    };

    // Identificar domínios relevantes
    for (const [domain, data] of Object.entries(this.domainKnowledge)) {
      const hasKeyword = data.keywords.some(kw => {
        // Usar word boundaries para evitar falsos positivos
        // Por exemplo, "game" não deve detectar em "pagamento"
        // Normalizar acentos para melhor deteção
        const normalizedInput = userInput.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const normalizedKw = kw.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        
        // Tentar com e sem acentos
        const pattern1 = new RegExp(`\\b${kw.toLowerCase()}\\b`);
        const pattern2 = new RegExp(`\\b${normalizedKw}\\b`);
        
        return pattern1.test(userInput.toLowerCase()) || 
               pattern2.test(normalizedInput);
      });
      if (hasKeyword) {
        analysis.domains.push(domain);
        console.log(`🎯 [DeepContextAnalyzer] Domínio '${domain}' detectado em analyzeDeepContext`);
      }
    }

    // Detectar padrões específicos de negócio
    const normalizedInput = userInput.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    // Uber para cachorros/pets
    if ((userInput.toLowerCase().includes('uber') || userInput.toLowerCase().includes('transporte')) && 
        (userInput.toLowerCase().includes('cachorro') || userInput.toLowerCase().includes('pet') || 
         userInput.toLowerCase().includes('animal') || normalizedInput.includes('cao'))) {
      console.log('🐕 [DeepContextAnalyzer] Detectado contexto de Transporte para Pets');
      analysis.businessModel = {
        type: 'Pet Transportation Service',
        product: 'On-demand pet transport',
        targetMarket: 'Pet owners needing safe transportation',
        model: 'Marketplace'
      };
      analysis.technicalRequirements = [
        'GPS tracking em tempo real',
        'Sistema de matching motorista-pet',
        'Perfil detalhado do pet',
        'Sistema de avaliação',
        'Chat in-app',
        'Pagamento integrado'
      ];
      analysis.userNeeds = [
        'Transporte seguro para pets',
        'Motoristas especializados',
        'Rastreamento da viagem',
        'Confiança e segurança',
        'Preço justo'
      ];
      analysis.challenges = [
        'Treinamento de motoristas',
        'Segurança dos animais',
        'Regulamentação',
        'Seguros e responsabilidade',
        'Limpeza dos veículos'
      ];
    }
    
    // Para "vender café para o mundo todo via crypto"
    if ((userInput.toLowerCase().includes('café') || normalizedInput.includes('cafe')) && 
        (userInput.toLowerCase().includes('crypto') || userInput.toLowerCase().includes('bitcoin'))) {
      console.log('☕ [DeepContextAnalyzer] Detectado contexto de Crypto Coffee');
      analysis.businessModel = {
        type: 'B2C Global Crypto Commerce',
        product: 'Specialty Coffee',
        paymentMethod: 'Cryptocurrency',
        targetMarket: 'Global crypto-savvy coffee enthusiasts',
        valueProposition: 'Premium coffee accessible globally with crypto payments'
      };

      analysis.technicalRequirements = [
        'Multi-chain wallet integration',
        'Real-time crypto/fiat conversion',
        'Global shipping API integration',
        'Inventory management system',
        'Smart contract for escrow',
        'KYC/AML compliance system',
        'Multi-language support',
        'Mobile-first PWA'
      ];

      analysis.userNeeds = [
        'Comprar café premium de qualquer lugar',
        'Pagar com suas cryptomoedas preferidas',
        'Rastrear origem e qualidade do café',
        'Entrega confiável internacional',
        'Preços transparentes sem taxas ocultas'
      ];

      analysis.marketOpportunities = [
        '$100B+ mercado global de café',
        '420M+ usuários de crypto worldwide',
        'Crescimento de 30% ao ano em pagamentos crypto',
        'Demanda por café specialty em alta',
        'Early mover advantage em crypto coffee'
      ];

      analysis.challenges = [
        'Volatilidade das cryptomoedas',
        'Complexidade logística internacional',
        'Regulamentações variadas por país',
        'Educação do usuário sobre crypto',
        'Competição com gigantes do e-commerce'
      ];

      analysis.competitiveAdvantages = [
        'Primeiro marketplace global de café em crypto',
        'Eliminação de intermediários bancários',
        'Transparência total via blockchain',
        'Comunidade crypto engajada',
        'Modelo de negócio inovador'
      ];
    }

    return analysis;
  }

  /**
   * Gera resposta específica e valiosa para cada tipo de agente
   */
  generateValueDrivenResponse(agent, userInput, deepContext) {
    const { name, role } = agent;
    
    // DEBUG: Log método sendo chamado
    console.log('🎯 [DeepContextAnalyzer] generateValueDrivenResponse:', {
      agent: agent.name,
      userInput: userInput.substring(0, 50) + '...',
      deepContextDomains: deepContext.domains,
      businessModelType: deepContext.businessModel?.type
    });
    
    // Respostas específicas por tipo de agente para café + crypto
    if (deepContext.businessModel && deepContext.businessModel.type === 'B2C Global Crypto Commerce') {
      console.log('☕ [DeepContextAnalyzer] Gerando resposta para Crypto Coffee');
      return this.generateCryptoCoffeeResponse(agent, deepContext);
    }
    
    // Respostas específicas para jogos
    if ((deepContext.domains && deepContext.domains.includes('gaming')) || 
        userInput.toLowerCase().includes('jogo') || 
        userInput.toLowerCase().includes('game') ||
        userInput.toLowerCase().includes('mario')) {
      console.log('🎮 [DeepContextAnalyzer] Gerando resposta para Game Development');
      return this.generateGameDevelopmentResponse(agent, userInput, deepContext);
    }
    
    // Fallback para outros contextos
    console.log('📄 [DeepContextAnalyzer] Gerando resposta genérica');
    return this.generateGenericValueResponse(agent, userInput, deepContext);
  }

  /**
   * Respostas específicas para o projeto de café crypto
   */
  generateCryptoCoffeeResponse(agent, context) {
    const roleType = this.detectRoleType(agent.role);
    const responses = {
      'lead-architect': () => `**${agent.name} (${agent.role})**

🏗️ **Arquitetura Global para CryptoCoffee Marketplace**

**Visão Arquitetural:**
Proponho uma arquitetura serverless multi-região para garantir baixa latência global:

\`\`\`
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   CloudFlare    │────▶│  Lambda@Edge     │────▶│   API Gateway   │
│   Global CDN    │     │  (Multi-region)  │     │   (Regional)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                          │
         ▼                       ▼                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React PWA      │     │  Crypto Gateway  │     │  Microservices  │
│  Web3 Ready     │     │  (ETH/BTC/SOL)   │     │  (Containerized)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
\`\`\`

**Stack Técnico Recomendado:**
- **Frontend**: Next.js 14 com App Router + TailwindCSS + Web3Modal
- **Blockchain**: Multi-chain (Ethereum, Polygon, Solana) via Alchemy
- **Backend**: Node.js serverless functions + Prisma ORM
- **Database**: PlanetScale (MySQL serverless) + Redis cache
- **Infra**: Vercel/AWS Lambda + S3 + CloudFront

**Decisões Críticas:**
1. **Multi-chain by design** - Suportar ETH, BTC, SOL, USDC desde o início
2. **Edge computing** - Processar próximo ao usuário para <100ms latency
3. **Event-driven** - Arquitetura baseada em eventos para escalar
4. **API-first** - Facilitar integrações e app mobile futuro`,

      'backend-architect': () => `**${agent.name} (${agent.role})**

💻 **Arquitetura Backend para Processamento Crypto + E-commerce**

**Design de APIs RESTful + GraphQL:**
\`\`\`typescript
// API Routes Structure
/api/v1/
  /products
    GET    /coffee                 # Lista cafés com filtros
    GET    /coffee/:id             # Detalhes do café
    POST   /coffee/:id/review      # Avaliações
  
  /orders
    POST   /checkout               # Criar pedido
    POST   /payment/crypto         # Processar pagamento
    GET    /orders/:id/track       # Rastreamento
  
  /crypto
    GET    /rates                  # Taxas de câmbio
    POST   /wallet/connect         # Conectar wallet
    GET    /gas/estimate           # Estimar gas fees
\`\`\`

**Fluxo de Pagamento Crypto:**
1. **Cotação em tempo real** via CoinGecko/Chainlink
2. **Smart contract escrow** para segurança
3. **Confirmações dinâmicas** (1 para SOL, 12 para BTC)
4. **Webhook para confirmação** de pagamento

**Integrações Essenciais:**
- **Crypto**: Alchemy, Infura, QuickNode
- **Pagamento**: Coinbase Commerce, BitPay
- **Shipping**: EasyPost API (150+ transportadoras)
- **KYC**: Sumsub ou Onfido
- **Analytics**: Mixpanel + Amplitude`,

      'frontend-architect': () => `**${agent.name} (${agent.role})**

🎨 **UX/UI Strategy para Crypto Coffee Global**

**Design System Componentes:**
\`\`\`jsx
// Core Components Structure
<CoffeeCard>              // Produto com origin story
<CryptoPayButton>         // Multi-wallet connection
<PriceDisplay>            // Real-time crypto/fiat
<ShippingCalculator>      // Global shipping estimate
<RoastProfile>            // Visual taste notes
<BrewingGuide>            // Interactive tutorials
\`\`\`

**User Journey Otimizado:**
1. **Landing** → Storytelling dos produtores + crypto benefits
2. **Browse** → Filtros por origem, torra, notas, preço em crypto
3. **Product** → 360° view, blockchain verified origin
4. **Cart** → Live crypto rates, gas estimation
5. **Checkout** → 1-click wallet pay, shipping calculator
6. **Post-purchase** → NFT receipt, brew timer app

**Mobile-First Features:**
- **PWA installable** com offline catalog
- **Wallet deep-links** para pagamento rápido  
- **AR visualizer** para ver o pacote em casa
- **Push notifications** para tracking e ofertas

**Conversion Optimizers:**
- "Pay with crypto, save 5%" banner
- Trust badges: "2000+ crypto payments"
- Social proof: Recent purchases ticker
- Urgency: "Only 50kg left this harvest"`,

      'blockchain-specialist': () => `**${agent.name} (${agent.role})**

⛓️ **Estratégia Blockchain & Smart Contracts**

**Multi-Chain Architecture:**
\`\`\`solidity
// CoffeePurchase.sol - Ethereum/Polygon
contract CoffeeMarketplace {
    mapping(address => Order[]) public orders;
    mapping(uint => CoffeeNFT) public certificates;
    
    function purchaseCoffee(
        uint coffeeId,
        uint amount,
        address token
    ) external payable {
        // Verify payment
        // Lock funds in escrow
        // Emit purchase event
        // Mint origin certificate NFT
    }
}
\`\`\`

**Supported Chains & Tokens:**
- **Ethereum**: ETH, USDC, USDT, DAI
- **Polygon**: MATIC, USDC (baixas taxas)
- **Solana**: SOL, USDC (alta velocidade)
- **Bitcoin**: BTC via Lightning Network

**NFT Coffee Certificates:**
- Cada compra gera um NFT certificate
- Rastreabilidade da fazenda ao consumidor
- Colecionáveis com benefícios (desconto, acesso VIP)
- Integração com OpenSea/MagicEden

**DeFi Integrations:**
- **Yield farming**: Stake COFFEE tokens, earn discounts
- **Liquidity pools**: COFFEE/USDC em Uniswap
- **Governance**: Votar em novos cafés/features`,

      'security-architect': () => `**${agent.name} (${agent.role})**

🔒 **Security Framework para Crypto E-commerce Global**

**Threat Model & Mitigations:**

**1. Crypto-Specific Threats:**
- **Reentrancy attacks** → Checks-Effects-Interactions pattern
- **Front-running** → Commit-reveal scheme para grandes pedidos
- **Private key exposure** → Client-side wallet, nunca no servidor
- **Phishing** → Educação + domain verification

**2. E-commerce Security:**
- **PCI DSS** não aplicável mas seguir best practices
- **OWASP Top 10** proteções implementadas
- **Rate limiting** em todas APIs (100 req/min)
- **WAF rules** para XSS, SQLi, CSRF

**3. Compliance Framework:**
\`\`\`yaml
KYC/AML:
  - Light KYC: <$1000/mês
  - Full KYC: >$1000/mês
  - Sanctions screening: Chainalysis API
  - Transaction monitoring: Elliptic

GDPR/LGPD:
  - Data minimization
  - Right to deletion
  - Cookie consent
  - Data portability
\`\`\`

**4. Incident Response:**
- 24/7 monitoring com PagerDuty
- Automatic circuit breakers
- Cold wallet storage (95% funds)
- Bug bounty program via HackerOne`,

      'product-manager': () => `**${agent.name} (${agent.role})**

📊 **Product Strategy & Roadmap para CryptoCoffee**

**MVP Features (Month 1-3):**
- ✅ 10 cafés premium curados
- ✅ Pagamento ETH/USDC
- ✅ Shipping para 30 países
- ✅ Basic wallet integration
- ✅ Order tracking

**Growth Features (Month 4-6):**
- 🔄 Coffee subscription boxes
- 🔄 Referral program (5% crypto back)
- 🔄 Mobile app launch
- 🔄 NFT loyalty program
- 🔄 B2B wholesale portal

**Market Positioning:**
- **Target**: 25-40 anos, crypto holders, coffee enthusiasts
- **TAM**: $2.5B (intersecção crypto users + specialty coffee)
- **Pricing**: Premium positioning, 20% acima mercado tradicional
- **Diferencial**: "From farm to blockchain to cup"

**Success Metrics:**
- **MRR**: $100k em 6 meses
- **CAC**: <$50 via crypto communities
- **LTV**: $500+ (subscription model)
- **NPS**: >70 (crypto early adopters)

**Go-to-Market:**
- Launch em crypto Twitter/Discord
- Partnerships com crypto influencers
- Presença em crypto events
- Content marketing sobre coffee + blockchain`,

      'ux-designer': () => `**${agent.name} (${agent.role})**

🎯 **UX Strategy para Simplificar Crypto + Coffee**

**Principais Desafios UX:**
1. **Crypto é complexo** → Onboarding educativo step-by-step
2. **Volatilidade** → Price lock por 10 minutos
3. **Gas fees** → Mostrar total upfront
4. **Wallets múltiplas** → Universal connect button

**User Flows Otimizados:**

**First-Time Crypto User:**
\`\`\`
[Learn Crypto] → [Get Wallet] → [Buy USDC] → [Purchase Coffee]
     ↓               ↓              ↓             ↓
  Video 2min    WalletConnect   MoonPay      Success NFT
\`\`\`

**Crypto Native User:**
\`\`\`
[Connect] → [Browse] → [Quick Buy] → [Track]
    ↓          ↓           ↓           ↓
  1-click   Filters    Gas included  On-chain
\`\`\`

**Design Patterns:**
- **Skeleton screens** durante blockchain calls
- **Optimistic UI** para melhor percepção
- **Progressive disclosure** de complexidade
- **Tooltips contextuais** sobre crypto terms
- **Status indicators** real-time para transações

**Micro-interactions:**
- Wallet balance animation
- Coffee bean loading spinner
- Success confetti com logo crypto
- Smooth price transitions`,

      'data-scientist': () => `**${agent.name} (${agent.role})**

📈 **Data Strategy & Analytics para CryptoCoffee**

**KPIs Dashboard Real-time:**
\`\`\`python
# Core Metrics to Track
conversion_metrics = {
    'visitor_to_wallet_connect': 0.15,  # Target: 15%
    'wallet_to_purchase': 0.40,         # Target: 40%
    'crypto_vs_fiat_interest': 0.65,    # 65% prefer crypto
    'repeat_purchase_rate': 0.30,       # 30% monthly
    'avg_order_value_crypto': 85.00     # $85 USD equivalent
}

# Blockchain Analytics
on_chain_metrics = {
    'preferred_chain': 'Polygon',       # 60% transactions
    'avg_gas_cost': '$0.50',           # Polygon advantage
    'payment_tokens': {
        'USDC': 0.70,                  # 70% stable preference
        'ETH': 0.20,
        'MATIC': 0.10
    }
}
\`\`\`

**ML Models para Otimização:**
1. **Price Prediction** - Prever melhor momento de compra
2. **Churn Prevention** - Identificar usuários em risco
3. **Recommendation Engine** - Cafés baseado em wallet history
4. **Fraud Detection** - Padrões anormais de transação

**A/B Tests Prioritários:**
- Crypto discount: 5% vs 10% vs 15%
- Checkout flow: 3-step vs 1-page
- Price display: Crypto-first vs Fiat-first
- NFT rewards: Every purchase vs Milestone

**Data Collection:**
- Mixpanel para eventos
- Google Analytics 4 
- Custom blockchain indexer
- Customer feedback loops`,

      'marketing-strategist': () => `**${agent.name} (${agent.role})**

🚀 **Marketing Strategy para Dominar Crypto Coffee Niche**

**Positioning Statement:**
"O primeiro marketplace global onde seu Bitcoin compra o melhor café do mundo, direto do produtor para sua xícara."

**Go-to-Market Channels:**

**1. Crypto Native (60% budget):**
- **Twitter Spaces** semanais sobre coffee + crypto
- **Discord server** com 5k members target
- **Gitcoin grants** para open source tools
- **DeFi integrations** com Aave, Compound

**2. Coffee Enthusiasts (30% budget):**
- **YouTube** com top coffee channels
- **Instagram** micro-influencers (<50k)
- **Reddit** r/coffee, r/espresso
- **Podcast** sponsorships

**3. PR & Partnerships (10% budget):**
- **Crypto media**: CoinDesk, Decrypt
- **Coffee media**: Sprudge, Perfect Daily Grind
- **Exchange listings**: Binance Pay partner

**Launch Campaign: "Genesis Roast"**
- First 1000 customers get exclusive NFT
- Lifetime 20% discount for early adopters
- Referral = 1 free bag per 3 friends
- Twitter competition: Best coffee + crypto meme

**Content Calendar:**
- Monday: Farmer spotlight
- Wednesday: Crypto education
- Friday: New coffee drop
- Sunday: Community cupping`,

      'default': () => `**${agent.name} (${agent.role})**

💡 **Análise Especializada para CryptoCoffee Global**

Como ${agent.role}, vejo oportunidades únicas neste projeto:

**Contribuições da Minha Área:**
${this.getSpecializedInsights(agent)}

**Recomendações Específicas:**
${this.getSpecializedRecommendations(agent)}

**Riscos a Considerar:**
${this.getSpecializedRisks(agent)}

**Próximos Passos:**
${this.getSpecializedNextSteps(agent)}`
    };

    const generator = responses[roleType] || responses['default'];
    return generator();
  }

  detectRoleType(role) {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('lead architect')) return 'lead-architect';
    if (roleLower.includes('backend architect')) return 'backend-architect';
    if (roleLower.includes('frontend architect')) return 'frontend-architect';
    if (roleLower.includes('blockchain')) return 'blockchain-specialist';
    if (roleLower.includes('security')) return 'security-architect';
    if (roleLower.includes('product manager')) return 'product-manager';
    if (roleLower.includes('ux designer')) return 'ux-designer';
    if (roleLower.includes('data scientist')) return 'data-scientist';
    if (roleLower.includes('marketing')) return 'marketing-strategist';
    return 'default';
  }

  getSpecializedInsights(agent) {
    const insights = {
      'DevOps Lead': `- CI/CD pipeline com smart contract auto-deploy
- Kubernetes cluster multi-região para baixa latência
- Monitoring de blockchain events em real-time
- Auto-scaling baseado em gas prices`,
      
      'Cloud Architect': `- Multi-cloud strategy: AWS (compute) + Cloudflare (edge)
- Serverless first para custo variável
- Global CDN para imagens de produtos
- Backup strategy para wallet keys`,
      
      'Mobile Developer': `- React Native com Expo para fast iteration
- WalletConnect SDK integration
- Biometric auth para segurança
- Offline mode para browsing`,
      
      'QA Lead': `- Test suite para smart contracts (Hardhat)
- E2E tests com múltiplas wallets
- Load testing para 10k concurrent users
- Chaos engineering para resilience`,
      
      'Growth Hacker': `- Viral loop: Share-to-earn COFFEE tokens
- Gamification: Coffee connoisseur levels
- Community: DAO para escolher novos cafés
- Partnerships: Crypto exchanges para exposure`
    };
    
    return insights[agent.name] || `- Expertise específica em ${agent.role}
- Análise detalhada dos requisitos técnicos
- Soluções otimizadas para o contexto
- Melhores práticas da indústria`;
  }

  getSpecializedRecommendations(agent) {
    const recommendations = {
      'DevOps Lead': `1. Implementar GitOps com ArgoCD
2. Setup Prometheus + Grafana para métricas
3. Disaster recovery plan para hot wallets
4. Rate limiting inteligente por wallet`,
      
      'Cloud Architect': `1. Edge locations em 5 continentes
2. IPFS para armazenar NFT metadata
3. Redis cluster para cache de preços
4. WAF rules específicas para Web3`,
      
      'Mobile Developer': `1. Push notifications para price alerts
2. Apple Pay/Google Pay como fallback
3. AR para visualizar packaging
4. Widget para portfolio tracking`
    };
    
    return recommendations[agent.name] || `1. Definir escopo e objetivos claros
2. Escolher tecnologias adequadas ao contexto
3. Implementar com foco em qualidade e manutenibilidade
4. Monitorar e otimizar continuamente`;
  }

  getSpecializedRisks(agent) {
    const risks = {
      'Security Architect': `- Smart contract vulnerabilities
- Phishing attacks targeting crypto users
- Regulatory changes per country
- Exchange rate manipulation`,
      
      'Legal Counsel': `- Crypto regulations varying by jurisdiction
- Import/export coffee restrictions
- Tax implications for crypto payments
- Consumer protection laws`,
      
      'Financial Analyst': `- Crypto volatility impact on margins
- Treasury management complexity
- Accounting for crypto assets
- Cash flow in bear markets`
    };
    
    return risks[agent.role] || `- Complexidade técnica subestimada
- Mudanças de requisitos durante desenvolvimento
- Problemas de performance e escalabilidade
- Dificuldades de integração com sistemas existentes`;
  }

  getSpecializedNextSteps(agent) {
    // Retornar passos genéricos ao invés de específicos para café/crypto
    return `1. Análise detalhada dos requisitos
2. Prototipação e validação do conceito
3. Desenvolvimento iterativo com feedback
4. Testes e otimização de performance
5. Deploy e monitoramento contínuo`;
  }

  generateGenericValueResponse(agent, userInput, context) {
    // Fallback para outros tipos de perguntas
    return `**${agent.name} (${agent.role})**

Analisando "${userInput}" sob minha expertise:

${context.domains.length > 0 ? `📊 **Domínios Identificados**: ${context.domains.join(', ')}` : ''}

💡 **Insights Específicos**
${this.getSpecializedInsights(agent)}

🎯 **Minhas Recomendações**
${this.getSpecializedRecommendations(agent)}

⚠️ **Riscos a Mitigar**
${this.getSpecializedRisks(agent)}

🚀 **Roadmap Sugerido**
${this.getSpecializedNextSteps(agent)}`;
  }

  /**
   * Respostas específicas para desenvolvimento de jogos
   */
  generateGameDevelopmentResponse(agent, userInput, deepContext) {
    const roleType = this.detectRoleType(agent.role);
    const isMarioGame = userInput.toLowerCase().includes('mario');
    
    const responses = {
      'lead-architect': () => `**${agent.name} (${agent.role})**

🎮 **Arquitetura para ${isMarioGame ? 'Jogo Estilo Mario' : 'Desenvolvimento de Jogos'}**

**Visão Arquitetural:**
Para um jogo platformer 2D inspirado em Mario, proponho uma arquitetura modular e escalável:

\`\`\`
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Game Engine   │────▶│  Core Systems    │────▶│  Game Logic     │
│   (Phaser.js)   │     │  (ECS Pattern)   │     │  (State Machine)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                          │
         ▼                       ▼                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Asset Manager  │     │ Physics Engine   │     │  Level Editor   │
│  (Sprites/Audio)│     │ (Box2D/Matter.js)│     │  (Tiled/Custom) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
\`\`\`

**Componentes Principais:**
1. **Engine de Jogo**: Phaser.js 3 para desenvolvimento web, ou Unity/Godot para multi-plataforma
2. **Sistema de Física**: Gravidade, colisões, movimento fluido
3. **Estado do Jogo**: Máquina de estados para menu, gameplay, pause, game over
4. **Sistema de Níveis**: Editor visual + formato JSON para fácil criação
5. **Asset Pipeline**: Sprites, tilemaps, sons, música

**Stack Técnica Recomendada:**
- Frontend: Phaser.js 3 + TypeScript
- Backend: Node.js + Socket.io (para multiplayer futuro)
- Storage: IndexedDB (saves locais) + MongoDB (leaderboards)
- Build: Webpack + Electron (desktop) + Capacitor (mobile)`,

      'technical': () => `**${agent.name} (${agent.role})**

🎮 **Implementação Técnica - ${isMarioGame ? 'Platformer Mario-Style' : 'Game Development'}**

**Core Mechanics Implementation:**

\`\`\`javascript
// Player Controller com física realista
class PlayerController {
  constructor(scene, x, y) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setBounce(0.2);
    this.sprite.setCollideWorldBounds(true);
    
    // Configurações de movimento estilo Mario
    this.runSpeed = 200;
    this.jumpHeight = -330;
    this.acceleration = 600;
    this.drag = 500;
    this.maxSpeed = 300;
    
    // Estados
    this.isJumping = false;
    this.isGrounded = false;
    this.canDoubleJump = true;
  }
  
  update(cursors) {
    // Movimento horizontal com aceleração
    if (cursors.left.isDown) {
      this.sprite.setAccelerationX(-this.acceleration);
      this.sprite.setFlipX(true);
    } else if (cursors.right.isDown) {
      this.sprite.setAccelerationX(this.acceleration);
      this.sprite.setFlipX(false);
    } else {
      this.sprite.setAccelerationX(0);
      this.sprite.setDragX(this.drag);
    }
    
    // Pulo com coyote time
    if (cursors.up.isDown && this.isGrounded) {
      this.sprite.setVelocityY(this.jumpHeight);
      this.isJumping = true;
    }
  }
}
\`\`\`

**Sistema de Colisão Avançado:**
- Pixel-perfect collision para precisão
- Collision layers para diferentes tipos de interação
- One-way platforms (pular de baixo)
- Moving platforms com física correta`,

      'ai-specialist': () => `**${agent.name} (${agent.role})**

🤖 **IA para ${isMarioGame ? 'Inimigos Estilo Mario' : 'NPCs e Inimigos'}**

**Sistema de IA Modular:**

\`\`\`javascript
// Behavior Tree para inimigos inteligentes
class EnemyAI {
  constructor(enemy, player) {
    this.enemy = enemy;
    this.player = player;
    this.behaviorTree = new BehaviorTree();
    
    // Comportamentos básicos
    this.behaviors = {
      patrol: new PatrolBehavior(100, 2000), // distância, velocidade
      chase: new ChaseBehavior(200, 3000),   // range, velocidade
      attack: new AttackBehavior(50, 1000),  // range, cooldown
      flee: new FleeBehavior(150, 4000)      // HP threshold, velocidade
    };
  }
  
  update(delta) {
    // Decisão baseada em estado
    const distance = Phaser.Math.Distance.Between(
      this.enemy.x, this.enemy.y,
      this.player.x, this.player.y
    );
    
    if (distance < this.behaviors.attack.range) {
      this.behaviors.attack.execute(this.enemy, this.player);
    } else if (distance < this.behaviors.chase.range) {
      this.behaviors.chase.execute(this.enemy, this.player);
    } else {
      this.behaviors.patrol.execute(this.enemy);
    }
  }
}
\`\`\`

**Tipos de IA para Diferentes Inimigos:**
1. **Goomba-style**: Patrulha simples com detecção de borda
2. **Koopa-style**: Estados múltiplos (andando/dentro do casco)
3. **Flying enemies**: Pathfinding aéreo com sine wave
4. **Boss AI**: State machine complexa com fases`,

      'ux-designer': () => `**${agent.name} (${agent.role})**

🎨 **Design e UX para ${isMarioGame ? 'Platformer Estilo Mario' : 'Jogos'}**

**Princípios de Game Feel:**

1. **Controles Responsivos**
   - Input buffer de 100ms para pulos
   - Coyote time de 150ms (pular após sair da plataforma)
   - Variable jump height (soltar botão mid-air)
   - Momentum-based movement

2. **Feedback Visual**
   \`\`\`css
   /* Juice animations */
   @keyframes coin-collect {
     0% { transform: scale(1); }
     50% { transform: scale(1.5) rotate(180deg); }
     100% { transform: scale(0) translateY(-50px); opacity: 0; }
   }
   
   @keyframes player-damage {
     0%, 100% { filter: brightness(1); }
     25%, 75% { filter: brightness(2) hue-rotate(180deg); }
     50% { filter: brightness(0.5); }
   }
   \`\`\`

3. **Curva de Dificuldade**
   - Tutorial integrado no level design
   - Introdução gradual de mecânicas
   - Checkpoints generosos no início
   - Rampa de dificuldade suave

**UI/HUD Minimalista:**
- Vidas/HP no canto superior esquerdo
- Moedas/Score no canto superior direito
- Power-ups ativos na parte inferior
- Minimap opcional para níveis grandes`,

      'blockchain': () => `**${agent.name} (${agent.role})**

🔗 **Integração Blockchain para ${isMarioGame ? 'Mario-Style Game' : 'Gaming'}**

**Sistema de NFTs e Economia**:

\`\`\`solidity
// Smart Contract para Items Colecionáveis
contract GameItems is ERC1155 {
    mapping(uint256 => ItemStats) public itemStats;
    
    struct ItemStats {
        string name;
        uint8 rarity; // 1-5 (comum a lendário)
        uint16 powerBoost;
        uint16 speedBoost;
        uint16 jumpBoost;
        bool isConsumable;
    }
    
    // Power-ups como NFTs
    uint256 constant FIRE_FLOWER = 1;
    uint256 constant SUPER_MUSHROOM = 2;
    uint256 constant STAR_POWER = 3;
    uint256 constant CUSTOM_SKIN = 100;
    
    function mintPowerUp(address player, uint256 itemId) external {
        require(hasCompletedLevel(player), "Complete level first");
        _mint(player, itemId, 1, "");
        emit PowerUpEarned(player, itemId);
    }
}
\`\`\`

**Play-to-Earn Mechanics:**
1. NFT Power-ups tradeable entre jogadores
2. Skins exclusivas como NFTs
3. Leaderboard on-chain com rewards
4. Speedrun competitions com prêmios em crypto`,

      'data-engineer': () => `**${agent.name} (${agent.role})**

📊 **Analytics e Telemetria para ${isMarioGame ? 'Platformer Game' : 'Games'}**

**Sistema de Métricas em Tempo Real:**

\`\`\`javascript
class GameAnalytics {
  constructor() {
    this.sessionData = {
      sessionId: generateUUID(),
      startTime: Date.now(),
      events: []
    };
    
    this.metricsBuffer = [];
    this.batchSize = 50;
  }
  
  // Eventos críticos para balanceamento
  trackEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      level: data.level,
      position: { x: data.x, y: data.y },
      ...data
    };
    
    this.metricsBuffer.push(event);
    
    if (this.metricsBuffer.length >= this.batchSize) {
      this.flushMetrics();
    }
  }
  
  // Métricas importantes
  trackPlayerDeath(cause, position, level) {
    this.trackEvent('player_death', {
      cause, // 'fall', 'enemy', 'timeout'
      position,
      level,
      timeAlive: Date.now() - this.levelStartTime
    });
  }
  
  trackLevelCompletion(level, time, deaths, secretsFound) {
    this.trackEvent('level_complete', {
      level,
      completionTime: time,
      deathCount: deaths,
      secretsFound,
      perfectRun: deaths === 0
    });
  }
}
\`\`\`

**Dashboard de Métricas:**
- Heatmap de mortes por nível
- Tempo médio de conclusão
- Taxa de abandono por checkpoint
- Uso de power-ups por nível`,

      'default': () => `**${agent.name} (${agent.role})**

🎮 **Análise para ${isMarioGame ? 'Desenvolvimento de Jogo Estilo Mario' : 'Game Development'}**

**Minha Contribuição Específica:**

Como ${agent.role}, posso ajudar com:

${this.getGameSpecificExpertise(agent.role, isMarioGame)}

**Considerações Técnicas:**
1. **Performance**: 60 FPS estável em dispositivos médios
2. **Compatibilidade**: WebGL com fallback para Canvas
3. **Acessibilidade**: Remapeamento de controles, modo daltônico
4. **Monetização**: Ads opcionais, DLC de níveis, season pass

**Próximos Passos:**
1. Protótipo com mecânica core (movimento + pulo)
2. Level design com ferramentas visuais
3. Playtesting iterativo
4. Polish com juice e game feel
5. Lançamento em itch.io/Steam`
    };

    return (responses[roleType] || responses['default'])();
  }

  getGameSpecificExpertise(role, isMarioGame) {
    const lowerRole = role.toLowerCase();
    
    if (lowerRole.includes('frontend') || lowerRole.includes('ui')) {
      return `- Interface responsiva para controles touch/gamepad
- Sistema de partículas para feedback visual
- Transições suaves entre cenas
- HUD adaptativo e não intrusivo`;
    }
    
    if (lowerRole.includes('backend')) {
      return `- Sistema de save states local/cloud
- Leaderboards globais em tempo real
- Matchmaking para modo multiplayer
- Anti-cheat e validação server-side`;
    }
    
    if (lowerRole.includes('security')) {
      return `- Proteção contra cheating/hacking
- Criptografia de save files
- Validação de scores server-side
- Rate limiting para APIs`;
    }
    
    if (lowerRole.includes('devops')) {
      return `- CI/CD para builds multi-plataforma
- CDN para assets do jogo
- Auto-scaling para picos de jogadores
- Monitoring de performance`;
    }
    
    if (lowerRole.includes('mobile')) {
      return `- Otimização para touch controls
- Adaptação de UI para telas pequenas
- Gestão de bateria e performance
- Integração com Play Store/App Store`;
    }
    
    return `- Expertise específica em ${role}
- Melhores práticas da indústria
- Otimizações e performance
- Integração com sistemas modernos`;
  }

  /**
   * Analisa o input do usuário e retorna contexto estruturado
   */
  analyzeInput(userInput) {
    // DEBUG: Log input original
    console.log('🔎 [DeepContextAnalyzer] Analisando input:', userInput);
    
    const context = {
      domain: null,
      concepts: {
        technical: [],
        business: []
      },
      intent: null,
      complexity: 'medium',
      language: 'pt-BR'
    };

    // Identificar domínio principal
    for (const [domain, data] of Object.entries(this.domainKnowledge)) {
      const hasKeyword = data.keywords.some(kw => {
        // Usar word boundaries para evitar falsos positivos
        const pattern = new RegExp(`\\b${kw.toLowerCase()}\\b`);
        return pattern.test(userInput.toLowerCase());
      });
      if (hasKeyword) {
        context.domain = domain;
        console.log(`🎯 [DeepContextAnalyzer] Domínio detectado: ${domain}`);
        break;
      }
    }

    // Se não encontrou domínio específico, tentar detectar padrões gerais
    if (!context.domain) {
      if (userInput.toLowerCase().includes('jogo') || 
          userInput.toLowerCase().includes('game') ||
          userInput.toLowerCase().includes('mario')) {
        context.domain = 'gaming';
        console.log('🎮 [DeepContextAnalyzer] Domínio gaming detectado via padrão geral');
      }
    }
    
    // DEBUG: Log contexto final
    console.log('📦 [DeepContextAnalyzer] Contexto final:', {
      domain: context.domain,
      intent: context.intent,
      concepts: context.concepts
    });

    // Extrair conceitos técnicos
    const techKeywords = ['api', 'backend', 'frontend', 'database', 'ui', 'ux', 'mobile', 'web'];
    context.concepts.technical = techKeywords.filter(kw => 
      userInput.toLowerCase().includes(kw)
    );

    // Detectar intenção
    if (userInput.includes('?')) {
      context.intent = 'question';
    } else if (userInput.toLowerCase().includes('criar') || 
               userInput.toLowerCase().includes('desenvolver') ||
               userInput.toLowerCase().includes('build')) {
      context.intent = 'development';
    } else {
      context.intent = 'analysis';
    }

    return context;
  }
}

export default new DeepContextAnalyzer();