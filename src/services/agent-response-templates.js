/**
 * Templates de resposta dos agentes em múltiplos idiomas
 * Sistema para gerar respostas especializadas respeitando o idioma configurado
 */

export const agentResponseTemplates = {
  'pt-BR': {
    frontend: {
      intro: "Como {name}, avalio os aspectos de UX/UI da plataforma:",
      sections: {
        design: "**Design System Necessário**",
        challenges: "**Desafios de UX**",
        dashboard: "**Dashboard Principal**",
        workflow: "**Fluxo de Apostas**",
        mobile: "**Mobile First**",
        education: "**Elementos Educacionais**"
      }
    },
    backend: {
      intro: "Como {name}, analiso a arquitetura backend e infraestrutura:",
      sections: {
        architecture: "**Arquitetura Proposta**",
        smartContracts: "**Smart Contracts Essenciais**",
        scalability: "**Escalabilidade**",
        performance: "**Otimizações de Performance**",
        integration: "**Integrações Necessárias**"
      }
    },
    security: {
      intro: "Como {name}, identifico as considerações de segurança críticas:",
      sections: {
        vulnerabilities: "**Vulnerabilidades Potenciais**",
        mitigation: "**Estratégias de Mitigação**",
        auditing: "**Auditoria e Compliance**",
        bestPractices: "**Melhores Práticas**"
      }
    },
    blockchain: {
      intro: "Como {name}, analiso os aspectos blockchain do projeto:",
      sections: {
        consensus: "**Mecanismo de Consenso**",
        tokenomics: "**Tokenomics**",
        gasOptimization: "**Otimização de Gas**",
        interoperability: "**Interoperabilidade**"
      }
    }
  },
  
  'en-US': {
    frontend: {
      intro: "As {name}, I evaluate the UX/UI aspects of the platform:",
      sections: {
        design: "**Required Design System**",
        challenges: "**UX Challenges**",
        dashboard: "**Main Dashboard**",
        workflow: "**Betting Flow**",
        mobile: "**Mobile First**",
        education: "**Educational Elements**"
      }
    },
    backend: {
      intro: "As {name}, I analyze the backend architecture and infrastructure:",
      sections: {
        architecture: "**Proposed Architecture**",
        smartContracts: "**Essential Smart Contracts**",
        scalability: "**Scalability**",
        performance: "**Performance Optimizations**",
        integration: "**Required Integrations**"
      }
    },
    security: {
      intro: "As {name}, I identify critical security considerations:",
      sections: {
        vulnerabilities: "**Potential Vulnerabilities**",
        mitigation: "**Mitigation Strategies**",
        auditing: "**Auditing and Compliance**",
        bestPractices: "**Best Practices**"
      }
    },
    blockchain: {
      intro: "As {name}, I analyze the blockchain aspects of the project:",
      sections: {
        consensus: "**Consensus Mechanism**",
        tokenomics: "**Tokenomics**",
        gasOptimization: "**Gas Optimization**",
        interoperability: "**Interoperability**"
      }
    }
  },
  
  'es-ES': {
    frontend: {
      intro: "Como {name}, evalúo los aspectos de UX/UI de la plataforma:",
      sections: {
        design: "**Sistema de Diseño Necesario**",
        challenges: "**Desafíos de UX**",
        dashboard: "**Panel Principal**",
        workflow: "**Flujo de Apuestas**",
        mobile: "**Mobile First**",
        education: "**Elementos Educativos**"
      }
    },
    backend: {
      intro: "Como {name}, analizo la arquitectura backend e infraestructura:",
      sections: {
        architecture: "**Arquitectura Propuesta**",
        smartContracts: "**Smart Contracts Esenciales**",
        scalability: "**Escalabilidad**",
        performance: "**Optimizaciones de Rendimiento**",
        integration: "**Integraciones Necesarias**"
      }
    },
    security: {
      intro: "Como {name}, identifico las consideraciones de seguridad críticas:",
      sections: {
        vulnerabilities: "**Vulnerabilidades Potenciales**",
        mitigation: "**Estrategias de Mitigación**",
        auditing: "**Auditoría y Cumplimiento**",
        bestPractices: "**Mejores Prácticas**"
      }
    },
    blockchain: {
      intro: "Como {name}, analizo los aspectos blockchain del proyecto:",
      sections: {
        consensus: "**Mecanismo de Consenso**",
        tokenomics: "**Tokenomics**",
        gasOptimization: "**Optimización de Gas**",
        interoperability: "**Interoperabilidad**"
      }
    }
  }
};

/**
 * Gera uma resposta especializada baseada no tipo de agente e idioma
 */
export function generateAgentResponse(agent, context, language = 'pt-BR') {
  const templates = agentResponseTemplates[language] || agentResponseTemplates['en-US'];
  const agentType = detectAgentType(agent);
  const template = templates[agentType] || templates.backend;
  
  // Substituir placeholders
  let response = template.intro.replace('{name}', agent.name) + '\n\n';
  
  // Adicionar seções relevantes baseadas no contexto
  Object.entries(template.sections).forEach(([key, title]) => {
    response += title + '\n';
    response += generateSectionContent(agentType, key, context, language) + '\n\n';
  });
  
  return response;
}

/**
 * Detecta o tipo de agente baseado em suas capacidades
 */
function detectAgentType(agent) {
  const { role, capabilities } = agent;
  const roleText = role.toLowerCase();
  const capsText = capabilities.join(' ').toLowerCase();
  
  if (roleText.includes('frontend') || capsText.includes('ui') || capsText.includes('ux')) {
    return 'frontend';
  }
  if (roleText.includes('security') || capsText.includes('security')) {
    return 'security';
  }
  if (roleText.includes('blockchain') || capsText.includes('smart contract')) {
    return 'blockchain';
  }
  return 'backend';
}

/**
 * Gera conteúdo específico para cada seção baseado no contexto
 */
function generateSectionContent(agentType, section, context, language) {
  // Detectar se é contexto DeFi/Blockchain
  const isDefi = context.toLowerCase().includes('defi') || context.toLowerCase().includes('blockchain');
  
  // Conteúdo expandido baseado no tipo e seção
  const contentMap = {
    'pt-BR': {
      frontend: {
        design: isDefi ? 
          '- Dashboard para visualização de posições DeFi em tempo real\n- Componentes para exibição de TVL, APY e métricas\n- Sistema de notificações para mudanças de mercado\n- Dark mode otimizado para trading' :
          '- Componentes reutilizáveis\n- Sistema de cores e tipografia\n- Guidelines de acessibilidade',
        challenges: isDefi ?
          '- Complexidade de conceitos DeFi para novos usuários\n- Atualização em tempo real de preços e yields\n- Gestão de múltiplas wallets e chains\n- UX para aprovações de transações' :
          '- Complexidade técnica para usuários iniciantes\n- Visualização de dados em tempo real\n- Responsividade cross-platform',
        dashboard: isDefi ?
          '- Painel unificado de todas as posições DeFi\n- Gráficos interativos de performance\n- Calculadora de impermanent loss\n- Histórico detalhado de transações' :
          '- Interface principal intuitiva\n- Métricas chave em destaque\n- Navegação simplificada',
        workflow: isDefi ?
          '- Fluxo simplificado para swap de tokens\n- Wizard para adicionar liquidez\n- Interface de staking com APY em destaque\n- Confirmações claras de gas fees' :
          '- Jornada do usuário otimizada\n- Processos passo-a-passo\n- Feedback visual claro',
        mobile: '- PWA para acesso rápido\n- Gestos touch otimizados\n- Notificações push para alertas\n- Modo offline para consultas',
        education: isDefi ?
          '- Tooltips explicando TVL, APY, IL\n- Tutoriais interativos para iniciantes\n- Simulador de transações\n- Glossário DeFi integrado' :
          '- Onboarding progressivo\n- Documentação contextual\n- Vídeos tutoriais'
      },
      backend: {
        architecture: isDefi ?
          '- Agregador de protocolos DeFi (1inch, 0x)\n- Cache distribuído para dados on-chain\n- WebSocket para atualizações real-time\n- Multi-chain RPC management' :
          '- Microserviços escaláveis\n- APIs RESTful e GraphQL\n- Message queuing system',
        smartContracts: isDefi ?
          '- Proxy pattern para upgradability\n- Multicall para otimização de gas\n- Emergency pause mechanisms\n- Time-locked admin functions' :
          '- Contratos modulares e upgradeable\n- Gas optimization strategies\n- Security best practices',
        scalability: isDefi ?
          '- Layer 2 integration (Arbitrum, Optimism)\n- Batch processing de transações\n- IPFS para armazenamento descentralizado\n- Graph Protocol para indexação' :
          '- Horizontal scaling strategies\n- Load balancing\n- Caching layers',
        performance: isDefi ?
          '- Otimização de chamadas RPC\n- Mempool monitoring\n- MEV protection strategies\n- Gas price optimization' :
          '- Query optimization\n- CDN integration\n- Response compression',
        integration: isDefi ?
          '- Chainlink price feeds\n- WalletConnect v2\n- Gnosis Safe integration\n- ENS resolution' :
          '- Third-party APIs\n- Payment gateways\n- Analytics tools'
      },
      security: {
        vulnerabilities: isDefi ?
          '- Reentrancy em contratos\n- Front-running attacks\n- Flash loan exploits\n- Private key management' :
          '- SQL injection\n- XSS attacks\n- CSRF vulnerabilities\n- API security',
        mitigation: isDefi ?
          '- Slippage protection\n- Commit-reveal schemes\n- Multi-sig wallets\n- Hardware wallet support' :
          '- Input validation\n- Rate limiting\n- HTTPS enforcement\n- 2FA implementation',
        auditing: isDefi ?
          '- Smart contract audits (CertiK, Trail of Bits)\n- Formal verification\n- Bug bounty programs\n- On-chain monitoring' :
          '- Security audits\n- Penetration testing\n- Compliance checks\n- Log monitoring',
        bestPractices: isDefi ?
          '- Non-custodial architecture\n- Minimal proxy implementation\n- Circuit breakers\n- Gradual rollouts' :
          '- Security headers\n- Encryption standards\n- Access controls\n- Regular updates'
      },
      blockchain: {
        consensus: isDefi ?
          '- EVM compatibility requirements\n- Gas optimization strategies\n- Block confirmation times\n- Finality considerations' :
          '- Consensus mechanisms\n- Network architecture\n- Node requirements',
        tokenomics: isDefi ?
          '- Liquidity mining incentives\n- Governance token distribution\n- Fee structure design\n- Treasury management' :
          '- Token economics\n- Distribution model\n- Utility design',
        gasOptimization: isDefi ?
          '- Batch operations\n- Storage packing\n- Function selectors optimization\n- Event emission strategies' :
          '- Transaction optimization\n- Cost reduction strategies\n- Efficiency improvements',
        interoperability: isDefi ?
          '- Cross-chain bridges\n- Wrapped token standards\n- LayerZero integration\n- Multichain deployment' :
          '- Cross-chain communication\n- Standards compliance\n- Protocol compatibility'
      }
    },
    'en-US': {
      frontend: {
        design: isDefi ? 
          '- Real-time DeFi positions dashboard\n- Components for TVL, APY metrics display\n- Market change notification system\n- Trading-optimized dark mode' :
          '- Reusable components\n- Color system and typography\n- Accessibility guidelines',
        challenges: isDefi ?
          '- DeFi concept complexity for new users\n- Real-time price and yield updates\n- Multi-wallet and chain management\n- Transaction approval UX' :
          '- Technical complexity for beginners\n- Real-time data visualization\n- Cross-platform responsiveness',
        dashboard: isDefi ?
          '- Unified DeFi positions panel\n- Interactive performance charts\n- Impermanent loss calculator\n- Detailed transaction history' :
          '- Intuitive main interface\n- Key metrics highlight\n- Simplified navigation',
        workflow: isDefi ?
          '- Simplified token swap flow\n- Liquidity addition wizard\n- Staking interface with highlighted APY\n- Clear gas fee confirmations' :
          '- Optimized user journey\n- Step-by-step processes\n- Clear visual feedback',
        mobile: '- Fast access PWA\n- Optimized touch gestures\n- Push notifications for alerts\n- Offline mode for queries',
        education: isDefi ?
          '- Tooltips explaining TVL, APY, IL\n- Interactive tutorials for beginners\n- Transaction simulator\n- Integrated DeFi glossary' :
          '- Progressive onboarding\n- Contextual documentation\n- Tutorial videos'
      },
      backend: {
        architecture: isDefi ?
          '- DeFi protocol aggregator (1inch, 0x)\n- Distributed cache for on-chain data\n- WebSocket for real-time updates\n- Multi-chain RPC management' :
          '- Scalable microservices\n- RESTful and GraphQL APIs\n- Message queuing system',
        smartContracts: isDefi ?
          '- Proxy pattern for upgradability\n- Multicall for gas optimization\n- Emergency pause mechanisms\n- Time-locked admin functions' :
          '- Modular and upgradeable contracts\n- Gas optimization strategies\n- Security best practices',
        scalability: isDefi ?
          '- Layer 2 integration (Arbitrum, Optimism)\n- Transaction batch processing\n- IPFS for decentralized storage\n- Graph Protocol for indexing' :
          '- Horizontal scaling strategies\n- Load balancing\n- Caching layers',
        performance: isDefi ?
          '- RPC call optimization\n- Mempool monitoring\n- MEV protection strategies\n- Gas price optimization' :
          '- Query optimization\n- CDN integration\n- Response compression',
        integration: isDefi ?
          '- Chainlink price feeds\n- WalletConnect v2\n- Gnosis Safe integration\n- ENS resolution' :
          '- Third-party APIs\n- Payment gateways\n- Analytics tools'
      },
      security: {
        vulnerabilities: isDefi ?
          '- Contract reentrancy\n- Front-running attacks\n- Flash loan exploits\n- Private key management' :
          '- SQL injection\n- XSS attacks\n- CSRF vulnerabilities\n- API security',
        mitigation: isDefi ?
          '- Slippage protection\n- Commit-reveal schemes\n- Multi-sig wallets\n- Hardware wallet support' :
          '- Input validation\n- Rate limiting\n- HTTPS enforcement\n- 2FA implementation',
        auditing: isDefi ?
          '- Smart contract audits (CertiK, Trail of Bits)\n- Formal verification\n- Bug bounty programs\n- On-chain monitoring' :
          '- Security audits\n- Penetration testing\n- Compliance checks\n- Log monitoring',
        bestPractices: isDefi ?
          '- Non-custodial architecture\n- Minimal proxy implementation\n- Circuit breakers\n- Gradual rollouts' :
          '- Security headers\n- Encryption standards\n- Access controls\n- Regular updates'
      },
      blockchain: {
        consensus: isDefi ?
          '- EVM compatibility requirements\n- Gas optimization strategies\n- Block confirmation times\n- Finality considerations' :
          '- Consensus mechanisms\n- Network architecture\n- Node requirements',
        tokenomics: isDefi ?
          '- Liquidity mining incentives\n- Governance token distribution\n- Fee structure design\n- Treasury management' :
          '- Token economics\n- Distribution model\n- Utility design',
        gasOptimization: isDefi ?
          '- Batch operations\n- Storage packing\n- Function selectors optimization\n- Event emission strategies' :
          '- Transaction optimization\n- Cost reduction strategies\n- Efficiency improvements',
        interoperability: isDefi ?
          '- Cross-chain bridges\n- Wrapped token standards\n- LayerZero integration\n- Multichain deployment' :
          '- Cross-chain communication\n- Standards compliance\n- Protocol compatibility'
      }
    },
    'es-ES': {
      frontend: {
        design: isDefi ? 
          '- Dashboard para visualización de posiciones DeFi en tiempo real\n- Componentes para mostrar TVL, APY y métricas\n- Sistema de notificaciones para cambios del mercado\n- Modo oscuro optimizado para trading' :
          '- Componentes reutilizables\n- Sistema de colores y tipografía\n- Directrices de accesibilidad',
        challenges: isDefi ?
          '- Complejidad de conceptos DeFi para nuevos usuarios\n- Actualización en tiempo real de precios y yields\n- Gestión de múltiples wallets y chains\n- UX para aprobaciones de transacciones' :
          '- Complejidad técnica para principiantes\n- Visualización de datos en tiempo real\n- Responsividad multiplataforma',
        dashboard: isDefi ?
          '- Panel unificado de todas las posiciones DeFi\n- Gráficos interactivos de rendimiento\n- Calculadora de pérdida impermanente\n- Historial detallado de transacciones' :
          '- Interfaz principal intuitiva\n- Métricas clave destacadas\n- Navegación simplificada',
        workflow: isDefi ?
          '- Flujo simplificado para intercambio de tokens\n- Asistente para añadir liquidez\n- Interfaz de staking con APY destacado\n- Confirmaciones claras de gas fees' :
          '- Viaje del usuario optimizado\n- Procesos paso a paso\n- Retroalimentación visual clara',
        mobile: '- PWA para acceso rápido\n- Gestos táctiles optimizados\n- Notificaciones push para alertas\n- Modo sin conexión para consultas',
        education: isDefi ?
          '- Tooltips explicando TVL, APY, IL\n- Tutoriales interactivos para principiantes\n- Simulador de transacciones\n- Glosario DeFi integrado' :
          '- Incorporación progresiva\n- Documentación contextual\n- Videos tutoriales'
      },
      backend: {
        architecture: isDefi ?
          '- Agregador de protocolos DeFi (1inch, 0x)\n- Caché distribuido para datos on-chain\n- WebSocket para actualizaciones en tiempo real\n- Gestión multi-chain RPC' :
          '- Microservicios escalables\n- APIs RESTful y GraphQL\n- Sistema de colas de mensajes',
        smartContracts: isDefi ?
          '- Patrón proxy para actualizabilidad\n- Multicall para optimización de gas\n- Mecanismos de pausa de emergencia\n- Funciones admin con time-lock' :
          '- Contratos modulares y actualizables\n- Estrategias de optimización de gas\n- Mejores prácticas de seguridad',
        scalability: isDefi ?
          '- Integración Layer 2 (Arbitrum, Optimism)\n- Procesamiento por lotes de transacciones\n- IPFS para almacenamiento descentralizado\n- Graph Protocol para indexación' :
          '- Estrategias de escalado horizontal\n- Balanceo de carga\n- Capas de caché',
        performance: isDefi ?
          '- Optimización de llamadas RPC\n- Monitoreo de mempool\n- Estrategias de protección MEV\n- Optimización de precio de gas' :
          '- Optimización de consultas\n- Integración CDN\n- Compresión de respuestas',
        integration: isDefi ?
          '- Feeds de precios Chainlink\n- WalletConnect v2\n- Integración Gnosis Safe\n- Resolución ENS' :
          '- APIs de terceros\n- Pasarelas de pago\n- Herramientas de análisis'
      },
      security: {
        vulnerabilities: isDefi ?
          '- Reentrancy en contratos\n- Ataques de front-running\n- Exploits de flash loans\n- Gestión de claves privadas' :
          '- Inyección SQL\n- Ataques XSS\n- Vulnerabilidades CSRF\n- Seguridad de API',
        mitigation: isDefi ?
          '- Protección contra deslizamiento\n- Esquemas commit-reveal\n- Carteras multi-firma\n- Soporte para hardware wallets' :
          '- Validación de entrada\n- Limitación de tasa\n- Aplicación de HTTPS\n- Implementación 2FA',
        auditing: isDefi ?
          '- Auditorías de contratos (CertiK, Trail of Bits)\n- Verificación formal\n- Programas de recompensas por bugs\n- Monitoreo on-chain' :
          '- Auditorías de seguridad\n- Pruebas de penetración\n- Verificaciones de cumplimiento\n- Monitoreo de logs',
        bestPractices: isDefi ?
          '- Arquitectura no custodial\n- Implementación minimal proxy\n- Disyuntores de circuito\n- Despliegues graduales' :
          '- Encabezados de seguridad\n- Estándares de cifrado\n- Controles de acceso\n- Actualizaciones regulares'
      },
      blockchain: {
        consensus: isDefi ?
          '- Requisitos de compatibilidad EVM\n- Estrategias de optimización de gas\n- Tiempos de confirmación de bloques\n- Consideraciones de finalidad' :
          '- Mecanismos de consenso\n- Arquitectura de red\n- Requisitos de nodos',
        tokenomics: isDefi ?
          '- Incentivos de minería de liquidez\n- Distribución de token de gobernanza\n- Diseño de estructura de tarifas\n- Gestión de tesorería' :
          '- Economía del token\n- Modelo de distribución\n- Diseño de utilidad',
        gasOptimization: isDefi ?
          '- Operaciones por lotes\n- Empaquetado de almacenamiento\n- Optimización de selectores de función\n- Estrategias de emisión de eventos' :
          '- Optimización de transacciones\n- Estrategias de reducción de costos\n- Mejoras de eficiencia',
        interoperability: isDefi ?
          '- Puentes cross-chain\n- Estándares de tokens envueltos\n- Integración LayerZero\n- Despliegue multicadena' :
          '- Comunicación entre cadenas\n- Cumplimiento de estándares\n- Compatibilidad de protocolos'
      }
    }
  };
  
  const langContent = contentMap[language] || contentMap['en-US'];
  const typeContent = langContent[agentType] || langContent.backend;
  return typeContent[section] || (language === 'pt-BR' ? '- Análise em desenvolvimento...' : '- Analysis in progress...');
}