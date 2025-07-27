/**
 * Teste de geração de respostas após correções
 */

import warRoomResponseSystem from './src/services/warroom-response-system.js';
import deepContextAnalyzer from './src/services/deep-context-analyzer.js';
import enhancedMetaAgent from './src/services/enhanced-meta-agent.js';

console.log('🔍 Teste de Geração de Respostas\n');

// Agentes de teste
const testAgents = [
  {
    id: 'backend-architect',
    name: 'Backend Architect',
    role: 'Backend System Architect',
    capabilities: ['API Design', 'Microservices', 'Cloud Architecture']
  },
  {
    id: 'game-developer',
    name: 'Game Developer',
    role: 'Game Development Specialist',
    capabilities: ['Game Engines', 'Gameplay Programming', 'Physics']
  },
  {
    id: 'blockchain-architect',
    name: 'Blockchain Architect', 
    role: 'Blockchain & DLT Architect',
    capabilities: ['Smart Contracts', 'DeFi', 'Web3']
  }
];

// Queries de teste
const testQueries = [
  {
    query: 'Como criar uma API REST em Node.js?',
    expectedType: 'genérico',
    agent: testAgents[0]
  },
  {
    query: 'Como desenvolver um jogo de plataforma 2D?',
    expectedType: 'gaming',
    agent: testAgents[1]
  },
  {
    query: 'Vender café premium globalmente com pagamento em Bitcoin',
    expectedType: 'crypto-coffee',
    agent: testAgents[2]
  }
];

console.log('=== Teste de Respostas dos Agentes ===\n');

for (const { query, expectedType, agent } of testQueries) {
  console.log(`📝 Query: "${query}"`);
  console.log(`   Agente: ${agent.name}`);
  console.log(`   Tipo esperado: ${expectedType}`);
  
  // Gerar resposta
  const response = await warRoomResponseSystem.generateAgentResponse(agent, query);
  
  // Verificar tipo de resposta
  let actualType = 'genérico';
  if (response.includes('Crypto') && response.includes('Coffee')) {
    actualType = 'crypto-coffee';
  } else if (response.includes('jogo') || response.includes('game') || response.includes('Game')) {
    actualType = 'gaming';
  }
  
  console.log(`   Tipo detectado: ${actualType}`);
  console.log(`   ${actualType === expectedType ? '✅' : '❌'} ${actualType === expectedType ? 'Correto!' : 'Incorreto!'}`);
  console.log(`   Preview: ${response.substring(0, 150)}...`);
  console.log('\n');
}

console.log('=== Teste de Síntese ===\n');

// Simular respostas de múltiplos agentes
const mockResponses = testAgents.map(agent => ({
  agent,
  content: `Resposta do ${agent.name} sobre o assunto...`,
  phase: 'analysis'
}));

const synthesisTests = [
  {
    query: 'Como criar um jogo multiplayer online?',
    expectedSynthesisType: 'game'
  },
  {
    query: 'Vender café para o mundo todo via crypto',
    expectedSynthesisType: 'crypto-coffee'
  },
  {
    query: 'Como implementar microserviços?',
    expectedSynthesisType: 'generic'
  }
];

for (const { query, expectedSynthesisType } of synthesisTests) {
  console.log(`📋 Síntese para: "${query}"`);
  
  const deepContext = deepContextAnalyzer.analyzeDeepContext(query);
  const synthesis = enhancedMetaAgent.synthesizeResponses(mockResponses, query, deepContext);
  
  // Detectar tipo de síntese
  let actualSynthesisType = 'generic';
  if (synthesis.summary && synthesis.summary.includes('CryptoCoffee')) {
    actualSynthesisType = 'crypto-coffee';
  } else if (synthesis.summary && (synthesis.summary.includes('Game Development') || synthesis.summary.includes('Jogo'))) {
    actualSynthesisType = 'game';
  }
  
  console.log(`   Tipo esperado: ${expectedSynthesisType}`);
  console.log(`   Tipo gerado: ${actualSynthesisType}`);
  console.log(`   ${actualSynthesisType === expectedSynthesisType ? '✅' : '❌'} ${actualSynthesisType === expectedSynthesisType ? 'Correto!' : 'Incorreto!'}`);
  
  if (synthesis.summary) {
    console.log(`   Preview: ${synthesis.summary.substring(0, 150)}...`);
  }
  console.log('\n');
}

console.log('🏁 Teste concluído!');
console.log('\n📊 Resumo:');
console.log('- A detecção de domínios foi corrigida (não detecta mais "game" em "pagamento")');
console.log('- As respostas devem agora ser específicas para cada contexto');
console.log('- A síntese deve refletir o tipo correto de projeto');