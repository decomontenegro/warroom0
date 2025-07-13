#!/usr/bin/env node

import WebSocket from 'ws';
import chalk from 'chalk';

console.log(chalk.cyan('🧪 Testando War Room Multi-Agente v2...\n'));

const ws = new WebSocket('ws://localhost:3005/warroom-ws');
let agentResponses = [];
let responseCount = 0;

ws.on('open', () => {
  console.log(chalk.green('✓ Conectado ao servidor\n'));
  
  // Enviar query multi-agente
  const testQuery = "como melhorar performance de uma aplicação React?";
  console.log(chalk.yellow('📤 Enviando query multi-agente:'), testQuery, '\n');
  
  // Simular seleção de agentes relevantes
  const selectedAgents = [
    {
      name: 'Frontend Architect',
      role: 'Frontend Architecture & Standards',
      capabilities: ['UI frameworks', 'Component design', 'Performance optimization', 'Accessibility']
    },
    {
      name: 'Performance Engineer',
      role: 'Performance Testing & Optimization',
      capabilities: ['Load testing', 'Performance profiling', 'Optimization', 'Capacity planning']
    },
    {
      name: 'React Developer',
      role: 'React Development Specialist',
      capabilities: ['React', 'State management', 'Hooks', 'Component optimization']
    }
  ];
  
  ws.send(JSON.stringify({
    type: 'multi-agent-request',
    agents: selectedAgents,
    task: testQuery,
    context: []
  }));
  
  // Timeout para esperar todas as respostas
  setTimeout(() => {
    console.log(chalk.cyan('\n📊 Resultados do teste:\n'));
    
    if (responseCount === 0) {
      console.log(chalk.red('❌ Nenhuma resposta recebida'));
    } else if (responseCount === 1) {
      console.log(chalk.yellow('⚠️  Apenas 1 agente respondeu (comportamento de agente único)'));
    } else {
      console.log(chalk.green(`✅ ${responseCount} agentes diferentes responderam!`));
      console.log(chalk.gray('\nAgentes que participaram:'));
      agentResponses.forEach((agent, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${agent}`));
      });
    }
    
    ws.close();
    process.exit(0);
  }, 15000); // Esperar 15 segundos por respostas
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  
  if (msg.type === 'agent-response') {
    responseCount++;
    if (!agentResponses.includes(msg.agent)) {
      agentResponses.push(msg.agent);
    }
    
    console.log(chalk.magenta(`\n[${msg.agentNumber}/${msg.totalAgents}] ${msg.agent} (${msg.role}):`));
    console.log(chalk.gray(msg.content?.substring(0, 200) + '...'));
  }
  
  if (msg.type === 'multi-agent-complete') {
    console.log(chalk.green(`\n✓ Discussão multi-agente concluída! Total: ${msg.totalAgents} agentes`));
  }
});

ws.on('error', (err) => {
  console.log(chalk.red('❌ Erro:'), err.message);
  console.log(chalk.gray('Certifique-se que o servidor está rodando: npm run dev'));
  process.exit(1);
});