#!/usr/bin/env node

import WebSocket from 'ws';
import chalk from 'chalk';

console.log(chalk.cyan('🧪 Testando War Room Multi-Agente...\n'));

const ws = new WebSocket('ws://localhost:3005/warroom-ws');
let agentResponses = [];
let responseCount = 0;

ws.on('open', () => {
  console.log(chalk.green('✓ Conectado ao servidor\n'));
  
  // Enviar query de teste
  const testQuery = "como melhorar performance de uma aplicação React?";
  console.log(chalk.yellow('📤 Enviando query:'), testQuery, '\n');
  
  ws.send(JSON.stringify({
    type: 'agent-request',
    agent: { name: 'Test Client', role: 'Tester' },
    task: testQuery,
    capabilities: ['Testing']
  }));
  
  // Timeout para esperar respostas
  setTimeout(() => {
    console.log(chalk.cyan('\n📊 Resultados do teste:\n'));
    
    if (responseCount === 0) {
      console.log(chalk.red('❌ Nenhuma resposta recebida'));
    } else if (responseCount === 1) {
      console.log(chalk.yellow('⚠️  Apenas 1 agente respondeu (comportamento de agente único)'));
    } else {
      console.log(chalk.green(`✅ ${responseCount} agentes diferentes responderam!`));
      console.log(chalk.gray('\nAgentes que participaram:'));
      agentResponses.forEach(agent => {
        console.log(chalk.gray(`  • ${agent}`));
      });
    }
    
    ws.close();
    process.exit(0);
  }, 10000); // Esperar 10 segundos por respostas
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.type === 'agent-response' || msg.type === 'agent-message') {
    responseCount++;
    if (!agentResponses.includes(msg.agent)) {
      agentResponses.push(msg.agent);
    }
    console.log(chalk.magenta(`\n${msg.agent}:`));
    console.log(chalk.gray(msg.content || msg.message));
  }
});

ws.on('error', (err) => {
  console.log(chalk.red('❌ Erro:'), err.message);
  process.exit(1);
});