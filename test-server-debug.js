#!/usr/bin/env node

import WebSocket from 'ws';
import chalk from 'chalk';

console.log(chalk.cyan('🔍 Debug do servidor War Room...\n'));

const ws = new WebSocket('ws://localhost:3005/warroom-ws');

ws.on('open', () => {
  console.log(chalk.green('✓ WebSocket conectado\n'));
  
  // Teste 1: Mensagem simples
  console.log(chalk.yellow('Teste 1: agent-request simples'));
  ws.send(JSON.stringify({
    type: 'agent-request',
    agent: { name: 'Test Agent', role: 'Tester' },
    task: 'teste simples',
    capabilities: ['Testing']
  }));
  
  // Teste 2: Multi-agent request após 2 segundos
  setTimeout(() => {
    console.log(chalk.yellow('\nTeste 2: multi-agent-request'));
    ws.send(JSON.stringify({
      type: 'multi-agent-request',
      agents: [
        { name: 'Agent 1', role: 'Role 1', capabilities: ['Cap1'] },
        { name: 'Agent 2', role: 'Role 2', capabilities: ['Cap2'] }
      ],
      task: 'teste multi-agente',
      context: []
    }));
  }, 2000);
  
  // Fechar após 10 segundos
  setTimeout(() => {
    console.log(chalk.gray('\n📊 Teste concluído'));
    ws.close();
    process.exit(0);
  }, 10000);
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log(chalk.blue('\n📨 Mensagem recebida:'));
  console.log(chalk.gray(JSON.stringify(msg, null, 2).substring(0, 300)));
});

ws.on('error', (err) => {
  console.log(chalk.red('❌ Erro WebSocket:'), err.message);
});