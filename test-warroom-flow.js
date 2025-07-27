/**
 * Teste completo do fluxo War Room
 */

import warRoomResponseSystem from './src/services/warroom-response-system.js';
import deepContextAnalyzer from './src/services/deep-context-analyzer.js';

console.log('🔍 Teste completo do fluxo War Room\n');

// Primeiro, vamos verificar se conseguimos encontrar agentes
console.log('=== Verificando agentes disponíveis ===');
const system = warRoomResponseSystem;
console.log(`Total de agentes carregados: ${system.allAgents.length}`);

// Mostrar alguns agentes
console.log('\nPrimeiros 5 agentes:');
system.allAgents.slice(0, 5).forEach(agent => {
  console.log(`- ${agent.id}: ${agent.name} (${agent.role})`);
});

// Testar busca de agentes
console.log('\n=== Testando busca de agentes ===');
const testIds = ['backend-architect', 'game-developer', 'lead-architect'];

testIds.forEach(id => {
  const found = system.findAgentById(id);
  if (found) {
    console.log(`✅ Encontrado: ${id} -> ${found.name}`);
  } else {
    console.log(`❌ Não encontrado: ${id}`);
    // Procurar por nome similar
    const similar = system.allAgents.find(a => 
      a.role.toLowerCase().includes(id.replace('-', ' '))
    );
    if (similar) {
      console.log(`   Sugestão: usar id="${similar.id}" para ${similar.name}`);
    }
  }
});

// Agora testar com agentes reais
console.log('\n\n=== Testando respostas com agentes reais ===');

// Pegar agentes reais do sistema
const backendAgent = system.allAgents.find(a => a.role.toLowerCase().includes('backend'));
const gameAgent = system.allAgents.find(a => a.role.toLowerCase().includes('game'));
const blockchainAgent = system.allAgents.find(a => a.role.toLowerCase().includes('blockchain'));

const testCases = [
  {
    query: 'Como criar uma API REST?',
    agent: backendAgent,
    expectedContext: 'genérico'
  },
  {
    query: 'Como desenvolver um jogo de plataforma?',
    agent: gameAgent,
    expectedContext: 'gaming'
  },
  {
    query: 'Vender café premium com Bitcoin',
    agent: blockchainAgent,
    expectedContext: 'crypto'
  }
];

for (const { query, agent, expectedContext } of testCases) {
  if (!agent) {
    console.log(`\n⚠️ Agente não encontrado para contexto ${expectedContext}`);
    continue;
  }
  
  console.log(`\n📝 Query: "${query}"`);
  console.log(`   Agente: ${agent.name} (${agent.id})`);
  console.log(`   Contexto esperado: ${expectedContext}`);
  
  // Analisar contexto
  const context = deepContextAnalyzer.analyzeInput(query);
  console.log(`   Domínio detectado: ${context.domain || 'nenhum'}`);
  
  // Gerar resposta
  const response = await warRoomResponseSystem.generateAgentResponse(agent, query);
  
  // Verificar tipo de resposta
  console.log(`   Tamanho da resposta: ${response.length} caracteres`);
  console.log(`   Preview: ${response.substring(0, 100)}...`);
  
  // Verificar se está usando o caminho correto
  if (response.includes('analiso') && response.includes('recomendo uma abordagem cuidadosa')) {
    console.log('   ⚠️ Usando resposta fallback genérica');
  } else {
    console.log('   ✅ Usando resposta contextualizada');
  }
}

console.log('\n\n🏁 Teste concluído!');
console.log('\n📌 Próximos passos:');
console.log('1. Verificar por que agentes não estão sendo encontrados');
console.log('2. Garantir que o contexto está sendo passado corretamente');
console.log('3. Verificar se o cache está interferindo');