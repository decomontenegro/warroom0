#!/usr/bin/env node

/**
 * Script de teste para verificar o funcionamento do War Room
 * Testa: conexão WebSocket, requisição multi-agente, e recebimento de respostas
 */

import WebSocket from 'ws';

const WS_URL = 'ws://localhost:3005/warroom-ws';

console.log('🧪 Iniciando teste do War Room...\n');

const ws = new WebSocket(WS_URL);

let responsesReceived = 0;
let startTime = Date.now();

ws.on('open', () => {
  console.log('✅ Conectado ao War Room WebSocket\n');
  
  // Enviar requisição de teste
  const testRequest = {
    type: 'multi-agent-request',
    agents: [
      { name: 'Frontend Architect', role: 'Frontend Architecture', capabilities: ['React', 'UI/UX'] },
      { name: 'Backend Architect', role: 'Backend Architecture', capabilities: ['Node.js', 'APIs'] },
      { name: 'DevOps Lead', role: 'DevOps', capabilities: ['CI/CD', 'Docker'] },
      { name: 'Security Specialist', role: 'Security', capabilities: ['Auth', 'Encryption'] },
      { name: 'Database Architect', role: 'Database', capabilities: ['SQL', 'NoSQL'] }
    ],
    task: 'Criar sistema de integração entre War Room e Claude Code CLI',
    context: []
  };
  
  console.log('📤 Enviando requisição para 5 agentes...\n');
  ws.send(JSON.stringify(testRequest));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  
  switch (message.type) {
    case 'multi-agent-start':
      console.log(`🚀 Iniciando processamento com ${message.totalAgents} agentes\n`);
      break;
      
    case 'agent-processing':
      console.log(`⏳ ${message.agent} processando... (${message.agentNumber}/${message.totalAgents})`);
      break;
      
    case 'agent-response':
      responsesReceived++;
      const icon = message.error ? '❌' : '✅';
      const time = message.responseTime ? ` [${(message.responseTime/1000).toFixed(1)}s]` : '';
      console.log(`${icon} ${message.agent}${time}`);
      if (message.error) {
        console.log(`   Erro: ${message.errorType}`);
      }
      break;
      
    case 'agent-error':
      console.log(`❌ ${message.agent} falhou: ${message.errorType} [${(message.responseTime/1000).toFixed(1)}s]`);
      break;
      
    case 'multi-agent-complete':
      const totalTime = Date.now() - startTime;
      console.log('\n📊 === RESULTADO DO TESTE ===');
      console.log(`✅ Respostas bem-sucedidas: ${message.successfulResponses}/${message.totalAgents}`);
      console.log(`❌ Falhas: ${message.failedResponses}/${message.totalAgents}`);
      console.log(`⏱️  Tempo total: ${(totalTime/1000).toFixed(1)}s`);
      console.log(`📨 Mensagens recebidas: ${responsesReceived}`);
      
      if (message.successfulResponses === message.totalAgents) {
        console.log('\n🎉 TESTE PASSOU! Todos os agentes responderam com sucesso.');
      } else {
        console.log('\n⚠️  TESTE PARCIAL: Alguns agentes falharam.');
      }
      
      ws.close();
      process.exit(message.successfulResponses === message.totalAgents ? 0 : 1);
      break;
      
    case 'error':
      console.error('❌ Erro:', message.message);
      ws.close();
      process.exit(1);
      break;
  }
});

ws.on('error', (error) => {
  console.error('❌ Erro de conexão:', error.message);
  console.log('\n💡 Certifique-se de que o servidor está rodando em http://localhost:3005');
  process.exit(1);
});

ws.on('close', () => {
  console.log('\n🔌 Conexão fechada');
});

// Timeout de segurança
setTimeout(() => {
  console.error('\n⏱️  TIMEOUT: Teste demorou mais de 60 segundos');
  ws.close();
  process.exit(1);
}, 60000);