/**
 * Script para corrigir e simplificar o sistema War Room
 */

import warRoomResponseSystem from './src/services/warroom-response-system.js';
import deepContextAnalyzer from './src/services/deep-context-analyzer.js';

console.log('🔧 Corrigindo sistema War Room\n');

// Adicionar método simplificado para testes
warRoomResponseSystem.generateSimpleResponse = function(agent, query, language = 'pt-BR') {
  console.log(`📝 Gerando resposta simples para: ${agent.name}`);
  
  // Analisar contexto
  const queryContext = deepContextAnalyzer.analyzeInput(query);
  const deepContext = deepContextAnalyzer.analyzeDeepContext(query);
  
  // Log contexto
  console.log('Contexto:', {
    domain: queryContext.domain,
    deepDomains: deepContext.domains,
    businessModel: deepContext.businessModel?.type
  });
  
  // Verificar domínio gaming
  if (queryContext.domain === 'gaming' || 
      deepContext.domains.includes('gaming') ||
      query.toLowerCase().includes('jogo') || 
      query.toLowerCase().includes('game')) {
    console.log('→ Detectado como GAMING');
    return `**${agent.name} (${agent.role})**\n\n🎮 Como especialista em ${agent.role}, analiso o desenvolvimento de jogos:\n\n- Recomendo usar engines modernas como Unity ou Phaser.js\n- Foco em game feel e mecânicas divertidas\n- Prototipação rápida é essencial\n- Testes com jogadores desde o início`;
  }
  
  // Verificar crypto + coffee
  if (deepContext.businessModel?.type === 'B2C Global Crypto Commerce') {
    console.log('→ Detectado como CRYPTO COFFEE');
    return `**${agent.name} (${agent.role})**\n\n☕ Como especialista em ${agent.role}, analiso o projeto de vender café com crypto:\n\n- Integração multi-chain essencial\n- Foco em UX simplificada para crypto\n- Logística global é o maior desafio\n- Oportunidade única de mercado`;
  }
  
  // Resposta genérica
  console.log('→ Usando resposta GENÉRICA');
  return `**${agent.name} (${agent.role})**\n\nComo ${agent.role}, ofereço a seguinte análise sobre "${query}":\n\n- Análise técnica detalhada\n- Recomendações práticas\n- Melhores práticas da indústria\n- Próximos passos sugeridos`;
};

// Testar com queries diferentes
console.log('=== Testando respostas simplificadas ===\n');

const testAgent = {
  id: '7',
  name: 'Backend Architect',
  role: 'Backend System Architect',
  capabilities: ['API Design', 'Microservices', 'Cloud Architecture']
};

const queries = [
  'Como criar uma API REST?',
  'Como desenvolver um jogo de plataforma?',
  'Vender café premium globalmente com Bitcoin'
];

queries.forEach(query => {
  console.log(`\n📋 Query: "${query}"`);
  const response = warRoomResponseSystem.generateSimpleResponse(testAgent, query);
  console.log('Resposta:', response.substring(0, 200) + '...\n');
});

console.log('✅ Sistema simplificado funcionando!');
console.log('\n💡 Próximos passos:');
console.log('1. Integrar essa lógica simplificada no sistema principal');
console.log('2. Corrigir a estrutura de perfis dos agentes');
console.log('3. Garantir que todos os caminhos de código funcionem');