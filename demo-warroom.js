#!/usr/bin/env node

import WebSocket from 'ws';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.clear();
console.log(chalk.bold.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      🧠 WAR ROOM - Demonstração Multi-Agente                 ║
║                                                              ║
║      Mostrando como múltiplos especialistas colaboram        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`));

const ws = new WebSocket('ws://localhost:3005/warroom-ws');

ws.on('open', async () => {
  console.log(chalk.green('✓ Conectado ao War Room com 100+ especialistas\n'));
  
  // Query de demonstração
  const query = "como criar um sistema de autenticação seguro com JWT em Node.js?";
  
  console.log(chalk.yellow('🎯 Pergunta:'), query);
  console.log(chalk.gray('\nO War Room está selecionando os especialistas mais relevantes...\n'));
  
  // Carregar e selecionar agentes
  const agentsData = JSON.parse(
    await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf8')
  );
  
  // Selecionar agentes relevantes
  const selectedAgents = [
    agentsData.warRoomTechInnovationRoles.agents.find(a => a.name === 'Security Architect'),
    agentsData.warRoomTechInnovationRoles.agents.find(a => a.name === 'Backend Architect'),
    agentsData.warRoomTechInnovationRoles.agents.find(a => a.name === 'DevSecOps Engineer'),
    agentsData.warRoomTechInnovationRoles.agents.find(a => a.name === 'API Developer'),
    agentsData.warRoomTechInnovationRoles.agents.find(a => a.name === 'Cloud Security Engineer')
  ].filter(Boolean);
  
  console.log(chalk.cyan(`🤝 ${selectedAgents.length} especialistas convocados:\n`));
  selectedAgents.forEach((agent, i) => {
    console.log(chalk.gray(`  ${i + 1}. ${agent.name} - ${agent.role}`));
  });
  
  console.log(chalk.gray('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  
  // Enviar requisição
  ws.send(JSON.stringify({
    type: 'multi-agent-request',
    agents: selectedAgents,
    task: query,
    context: []
  }));
  
  // Timeout para fechar
  setTimeout(() => {
    console.log(chalk.gray('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.green('\n✅ Demonstração concluída!'));
    console.log(chalk.cyan('\nO War Room agora utiliza múltiplos especialistas!'));
    console.log(chalk.gray('Cada um traz sua perspectiva única para resolver seu problema.\n'));
    ws.close();
    process.exit(0);
  }, 20000);
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  
  if (msg.type === 'agent-response') {
    console.log(chalk.bold.magenta(`\n💡 ${msg.agent} responde:`));
    console.log(chalk.white(`   "${msg.role}"\n`));
    
    // Mostrar apenas primeiras linhas para manter demo limpa
    const lines = msg.content.split('\n').slice(0, 4);
    lines.forEach(line => {
      if (line.trim()) {
        console.log(chalk.gray(`   ${line}`));
      }
    });
    console.log(chalk.gray('   ...\n'));
  }
  
  if (msg.type === 'multi-agent-complete') {
    console.log(chalk.green(`\n🎯 Discussão concluída! ${msg.totalAgents} especialistas contribuíram.`));
  }
});

ws.on('error', (err) => {
  console.log(chalk.red('❌ Erro:'), err.message);
  process.exit(1);
});