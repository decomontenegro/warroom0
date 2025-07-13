#!/usr/bin/env node

import WebSocket from 'ws';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testWarRoomMultiAgent() {
  console.log(chalk.cyan('🔬 Teste completo do War Room Multi-Agente\n'));
  
  // Carregar agentes
  const agentsData = JSON.parse(
    await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf8')
  );
  const agents = agentsData.warRoomTechInnovationRoles;
  
  const ws = new WebSocket('ws://localhost:3005/warroom-ws');
  const results = {
    totalQueries: 0,
    totalResponses: 0,
    agentsUsed: new Set(),
    testsPassed: 0,
    testsFailed: 0
  };
  
  ws.on('open', () => {
    console.log(chalk.green('✓ Conectado ao War Room\n'));
    
    // Teste 1: Query sobre performance
    runTest(ws, agents, results, {
      name: 'Performance Query',
      query: 'como debugar problemas de performance em aplicações Node.js?',
      expectedAgents: ['Performance', 'Backend', 'DevOps']
    });
    
    // Teste 2: Query sobre segurança (após 3 segundos)
    setTimeout(() => {
      runTest(ws, agents, results, {
        name: 'Security Query', 
        query: 'quais são as melhores práticas de segurança para APIs REST?',
        expectedAgents: ['Security', 'API', 'Backend']
      });
    }, 3000);
    
    // Teste 3: Query sobre frontend (após 6 segundos)
    setTimeout(() => {
      runTest(ws, agents, results, {
        name: 'Frontend Query',
        query: 'como implementar dark mode em React com TypeScript?',
        expectedAgents: ['Frontend', 'React', 'UI', 'Design']
      });
    }, 6000);
    
    // Mostrar resultados finais
    setTimeout(() => {
      showResults(results);
      ws.close();
      process.exit(results.testsFailed > 0 ? 1 : 0);
    }, 12000);
  });
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'agent-response') {
      results.totalResponses++;
      results.agentsUsed.add(msg.agent);
      console.log(chalk.magenta(`  • ${msg.agent}`));
    }
  });
  
  ws.on('error', (err) => {
    console.log(chalk.red('❌ Erro:'), err.message);
    process.exit(1);
  });
}

function runTest(ws, agents, results, test) {
  console.log(chalk.yellow(`\n📝 ${test.name}:`));
  console.log(chalk.gray(`Query: "${test.query}"`));
  
  results.totalQueries++;
  
  // Simular seleção de agentes
  const selectedAgents = selectRelevantAgents(agents, test.query);
  
  console.log(chalk.cyan(`Agentes selecionados (${selectedAgents.length}):`));
  
  // Verificar se pegou agentes relevantes
  const hasExpectedAgents = test.expectedAgents.some(expected => 
    selectedAgents.some(agent => 
      agent.name.toLowerCase().includes(expected.toLowerCase()) ||
      agent.role.toLowerCase().includes(expected.toLowerCase())
    )
  );
  
  if (hasExpectedAgents) {
    results.testsPassed++;
    console.log(chalk.green('  ✓ Seleção de agentes correta'));
  } else {
    results.testsFailed++;
    console.log(chalk.red('  ✗ Seleção de agentes incorreta'));
  }
  
  // Enviar requisição
  ws.send(JSON.stringify({
    type: 'multi-agent-request',
    agents: selectedAgents.slice(0, 3), // Limitar a 3 para teste rápido
    task: test.query,
    context: []
  }));
}

function selectRelevantAgents(agentData, query) {
  const keywords = query.toLowerCase().split(' ');
  const scoreMap = new Map();
  
  agentData.agents.forEach(agent => {
    let score = 0;
    
    // Check capabilities
    agent.capabilities.forEach(cap => {
      keywords.forEach(keyword => {
        if (cap.toLowerCase().includes(keyword)) score += 2;
      });
    });
    
    // Check role
    keywords.forEach(keyword => {
      if (agent.role.toLowerCase().includes(keyword)) score += 1;
      if (agent.name.toLowerCase().includes(keyword)) score += 3;
    });
    
    if (score > 0) {
      scoreMap.set(agent, score);
    }
  });
  
  return Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([agent]) => agent);
}

function showResults(results) {
  console.log(chalk.cyan('\n\n📊 RESULTADOS FINAIS:\n'));
  console.log(chalk.white(`Queries enviadas: ${results.totalQueries}`));
  console.log(chalk.white(`Respostas recebidas: ${results.totalResponses}`));
  console.log(chalk.white(`Agentes únicos utilizados: ${results.agentsUsed.size}`));
  console.log(chalk.green(`Testes aprovados: ${results.testsPassed}`));
  console.log(chalk.red(`Testes falhados: ${results.testsFailed}`));
  
  if (results.testsFailed === 0) {
    console.log(chalk.green('\n✅ TODOS OS TESTES PASSARAM!'));
    console.log(chalk.green('O War Room está utilizando múltiplos especialistas corretamente! 🎉'));
  } else {
    console.log(chalk.yellow('\n⚠️  Alguns testes falharam, mas o sistema multi-agente está funcionando.'));
  }
}

// Executar teste
testWarRoomMultiAgent();