/**
 * Test script para debugar o sistema War Room
 */

import UltrathinkWorkflowEnhanced from './src/services/ultrathink-workflow-enhanced.js';
import warRoomResponseSystem from './src/services/warroom-response-system.js';
import deepContextAnalyzer from './src/services/deep-context-analyzer.js';

console.log('🔍 Iniciando teste de debug do War Room\n');

// Teste 1: Query simples não relacionada a jogos
console.log('=== TESTE 1: Query sobre APIs REST ===');
const query1 = 'Como criar uma API REST em Node.js?';

// Analisar contexto
const context1 = deepContextAnalyzer.analyzeInput(query1);
console.log('Contexto detectado:', context1);

// Testar resposta de um agente
const testAgent = {
  id: 'backend-architect',
  name: 'Backend Architect',
  role: 'Backend System Architect'
};

const response1 = await warRoomResponseSystem.generateAgentResponse(testAgent, query1);
console.log('\nResposta gerada (primeiros 200 chars):', response1.substring(0, 200) + '...\n');

// Teste 2: Query sobre desenvolvimento web
console.log('\n=== TESTE 2: Query sobre React ===');
const query2 = 'Qual a melhor forma de gerenciar estado em React?';

const context2 = deepContextAnalyzer.analyzeInput(query2);
console.log('Contexto detectado:', context2);

// Teste 3: Query sobre jogos (deve detectar gaming)
console.log('\n=== TESTE 3: Query sobre desenvolvimento de jogos ===');
const query3 = 'Como desenvolver um jogo de plataforma 2D?';

const context3 = deepContextAnalyzer.analyzeInput(query3);
console.log('Contexto detectado:', context3);

// Teste 4: Análise profunda de contexto
console.log('\n=== TESTE 4: Análise profunda ===');
const deepContext = deepContextAnalyzer.analyzeDeepContext(query2);
console.log('Deep Context:', deepContext);

// Teste 5: UltraThink Workflow completo
console.log('\n=== TESTE 5: UltraThink Workflow ===');
const workflow = new UltrathinkWorkflowEnhanced();

try {
  // Callback para ver o progresso
  const progressCallback = (phase, agent, message) => {
    if (agent) {
      console.log(`[${phase}] ${agent.name}: ${message.substring(0, 100)}...`);
    } else {
      console.log(`[${phase}] ${message}`);
    }
  };

  const result = await workflow.executeAdvancedWorkflow(query2, {
    maxAgents: 3,
    progressCallback
  });

  console.log('\n✅ Workflow concluído!');
  console.log('Tipo de síntese:', result.synthesis?.summary ? 'Síntese gerada' : 'Sem síntese');
} catch (error) {
  console.error('❌ Erro no workflow:', error.message);
}

console.log('\n🏁 Teste de debug concluído!');