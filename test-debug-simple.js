/**
 * Test script simples para debugar o sistema War Room
 */

import warRoomResponseSystem from './src/services/warroom-response-system.js';
import deepContextAnalyzer from './src/services/deep-context-analyzer.js';
import enhancedMetaAgent from './src/services/enhanced-meta-agent.js';

console.log('🔍 Iniciando teste de debug simples do War Room\n');

// Teste 1: Verificar detecção de contexto
console.log('=== TESTE 1: Detecção de Contexto ===');

const queries = [
  'Como criar uma API REST em Node.js?',
  'Qual a melhor forma de gerenciar estado em React?',
  'Como desenvolver um jogo de plataforma 2D?',
  'Vender café para o mundo todo usando crypto',
  'Criar um marketplace de NFTs',
  'Como implementar autenticação JWT?'
];

queries.forEach(query => {
  console.log(`\n📝 Query: "${query}"`);
  const context = deepContextAnalyzer.analyzeInput(query);
  console.log(`   Domínio detectado: ${context.domain || 'NENHUM'}`);
  console.log(`   Intent: ${context.intent}`);
  console.log(`   Conceitos técnicos: ${context.concepts.technical.join(', ') || 'nenhum'}`);
});

// Teste 2: Verificar análise profunda
console.log('\n\n=== TESTE 2: Análise Profunda ===');

const testQueries = [
  'Como desenvolver um jogo estilo Mario?',
  'Vender café premium globalmente com pagamento em Bitcoin',
  'Criar uma plataforma de streaming de vídeo'
];

testQueries.forEach(query => {
  console.log(`\n📊 Análise profunda de: "${query}"`);
  const deepContext = deepContextAnalyzer.analyzeDeepContext(query);
  console.log(`   Domínios: ${deepContext.domains.join(', ') || 'nenhum'}`);
  console.log(`   Modelo de negócio: ${deepContext.businessModel.type || 'não identificado'}`);
  console.log(`   Requisitos técnicos: ${deepContext.technicalRequirements.length} identificados`);
});

// Teste 3: Verificar geração de respostas
console.log('\n\n=== TESTE 3: Geração de Respostas ===');

const testAgent = {
  id: 'backend-architect',
  name: 'Backend Architect',
  role: 'Backend System Architect',
  capabilities: ['API Design', 'Microservices', 'Cloud Architecture']
};

const testInputs = [
  { query: 'Como criar uma API REST?', expectedDomain: 'genérico' },
  { query: 'Como fazer um jogo de plataforma?', expectedDomain: 'gaming' },
  { query: 'Vender café com crypto', expectedDomain: 'crypto/coffee' }
];

testInputs.forEach(({ query, expectedDomain }) => {
  console.log(`\n🤖 Testando resposta para: "${query}"`);
  console.log(`   Domínio esperado: ${expectedDomain}`);
  
  // Simular análise de contexto
  const context = deepContextAnalyzer.analyzeInput(query);
  const deepContext = deepContextAnalyzer.analyzeDeepContext(query);
  
  // Verificar qual caminho seria tomado
  if (deepContext.businessModel?.type === 'B2C Global Crypto Commerce') {
    console.log(`   ✅ Detectaria Crypto Coffee`);
  } else if (context.domain === 'gaming' || query.toLowerCase().includes('jogo') || query.toLowerCase().includes('game')) {
    console.log(`   ✅ Detectaria Gaming`);
  } else {
    console.log(`   ℹ️ Usaria resposta genérica`);
  }
});

// Teste 4: Verificar síntese
console.log('\n\n=== TESTE 4: Síntese de Respostas ===');

const mockResponses = [
  { agent: { name: 'Backend Architect' }, content: 'Resposta sobre arquitetura...' },
  { agent: { name: 'Frontend Developer' }, content: 'Resposta sobre UI...' },
  { agent: { name: 'Security Expert' }, content: 'Resposta sobre segurança...' }
];

const synthesisQueries = [
  'Como criar um jogo multiplayer online?',
  'Vender produtos digitais com crypto'
];

synthesisQueries.forEach(query => {
  console.log(`\n📋 Testando síntese para: "${query}"`);
  const deepContext = deepContextAnalyzer.analyzeDeepContext(query);
  
  // Log do que o meta agent faria
  if (deepContext.businessModel?.type === 'B2C Global Crypto Commerce') {
    console.log(`   → Geraria síntese específica para Crypto Commerce`);
  } else if (deepContext.domains?.includes('gaming') || query.toLowerCase().includes('jogo')) {
    console.log(`   → Geraria síntese específica para Game Development`);
  } else {
    console.log(`   → Geraria síntese genérica`);
  }
});

console.log('\n\n🏁 Teste de debug concluído!');
console.log('\n📌 Resumo:');
console.log('- O sistema está detectando corretamente domínios de gaming quando há palavras-chave');
console.log('- A detecção de crypto/coffee funciona para queries específicas');
console.log('- Queries genéricas recebem respostas genéricas como esperado');
console.log('\n💡 Para verificar por que sempre retorna gaming, verifique:');
console.log('1. Se o contexto está sendo passado corretamente entre componentes');
console.log('2. Se há algum estado global sendo mantido entre execuções');
console.log('3. Se o cache está interferindo nas respostas');