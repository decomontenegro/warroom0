#!/usr/bin/env node

import { createInterface } from 'readline';
import chalk from 'chalk';
import WebSocket from 'ws';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// War Room Multi-Agent CLI
class WarRoomMultiAgent {
  constructor() {
    this.ws = null;
    this.wsUrl = 'ws://localhost:3005/warroom-ws';
    this.connected = false;
    this.agents = null;
    this.activeAgents = new Set();
    this.conversationContext = [];
  }
  
  async init() {
    console.clear();
    
    // Carregar agentes
    await this.loadAgents();
    
    this.showWelcome();
    
    // Conectar WebSocket
    await this.connectWebSocket();
    
    // Criar interface
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.cyan('war-room> ')
    });
    
    this.setupInterface();
    this.rl.prompt();
  }
  
  async loadAgents() {
    const agentsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf8')
    );
    this.agents = agentsData.warRoomTechInnovationRoles;
  }
  
  showWelcome() {
    console.log(chalk.bold.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      ${chalk.yellow('🧠 WAR ROOM')} - ${chalk.green('100+ Especialistas em Tech')}             ║
║                                                              ║
║      Discussão multi-agente para resolver seus problemas     ║
║      Cada especialista traz sua perspectiva única            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `));
    
    console.log(chalk.gray('\nComandos: /help, /agents, /clear, /exit'));
    console.log(chalk.gray('Ou faça sua pergunta para ativar os especialistas!\n'));
  }
  
  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      console.log(chalk.yellow('Conectando aos especialistas...'));
      
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.on('open', () => {
        console.log(chalk.green('✓ Conectado! 100+ especialistas prontos.\n'));
        this.connected = true;
        resolve();
      });
      
      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'agent-response' || msg.type === 'agent-message') {
          const agent = this.findAgentByName(msg.agent);
          const color = this.getAgentColor(msg.agent);
          
          console.log('\n' + chalk[color](`${msg.agent}${agent ? ' (' + agent.role + ')' : ''}:`));
          console.log(msg.content || msg.message);
          
          this.activeAgents.add(msg.agent);
          this.updateActiveAgentsDisplay();
          
          this.rl.prompt();
        }
      });
      
      this.ws.on('error', (err) => {
        console.log(chalk.red('\n❌ Erro: Servidor não encontrado.'));
        console.log(chalk.gray('Execute: npm run dev (em outro terminal)\n'));
        reject(err);
      });
    });
  }
  
  setupInterface() {
    this.rl.on('line', async (input) => {
      const trimmed = input.trim();
      
      if (!trimmed) {
        this.rl.prompt();
        return;
      }
      
      if (trimmed === '/help') {
        this.showHelp();
      } else if (trimmed === '/agents') {
        this.showAgents();
      } else if (trimmed === '/active') {
        this.showActiveAgents();
      } else if (trimmed === '/clear') {
        console.clear();
        this.showWelcome();
        this.rl.prompt();
      } else if (trimmed === '/exit') {
        this.exit();
      } else if (trimmed.startsWith('/')) {
        console.log(chalk.red('Comando não reconhecido. Use /help'));
        this.rl.prompt();
      } else {
        // Processar pergunta com múltiplos agentes
        await this.processMultiAgentQuery(trimmed);
      }
    });
    
    this.rl.on('SIGINT', () => this.exit());
  }
  
  async processMultiAgentQuery(query) {
    console.log(chalk.gray('\n🧠 Analisando sua pergunta...\n'));
    
    // Selecionar agentes relevantes baseado na query
    const selectedAgents = this.selectRelevantAgents(query);
    
    console.log(chalk.cyan(`Convocando ${selectedAgents.length} especialistas:\n`));
    selectedAgents.forEach(agent => {
      console.log(chalk.gray(`  • ${agent.name} - ${agent.role}`));
    });
    console.log('');
    
    // Adicionar contexto
    this.conversationContext.push({ type: 'user', content: query });
    
    // Enviar requisição multi-agente única
    this.ws.send(JSON.stringify({
      type: 'multi-agent-request',
      agents: selectedAgents,
      task: query,
      context: this.conversationContext.slice(-3) // Últimas 3 mensagens
    }));
  }
  
  selectRelevantAgents(query) {
    const keywords = query.toLowerCase().split(' ');
    const scoreMap = new Map();
    
    // Calcular relevância de cada agente
    this.agents.agents.forEach(agent => {
      let score = 0;
      
      // Verificar capabilities
      agent.capabilities.forEach(cap => {
        keywords.forEach(keyword => {
          if (cap.toLowerCase().includes(keyword)) score += 2;
        });
      });
      
      // Verificar role
      keywords.forEach(keyword => {
        if (agent.role.toLowerCase().includes(keyword)) score += 1;
      });
      
      // Palavras-chave específicas
      if (query.includes('debug') && agent.name.includes('Debug')) score += 5;
      if (query.includes('performance') && agent.name.includes('Performance')) score += 5;
      if (query.includes('security') && agent.name.includes('Security')) score += 5;
      if (query.includes('test') && agent.name.includes('Test')) score += 5;
      if (query.includes('design') && agent.name.includes('Design')) score += 5;
      if (query.includes('database') && agent.name.includes('Database')) score += 5;
      if (query.includes('frontend') && agent.name.includes('Frontend')) score += 5;
      if (query.includes('backend') && agent.name.includes('Backend')) score += 5;
      
      if (score > 0) {
        scoreMap.set(agent, score);
      }
    });
    
    // Ordenar por score e pegar top 5-7
    const sorted = Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([agent]) => agent);
    
    // Se não encontrou agentes específicos, usar agentes gerais
    if (sorted.length === 0) {
      return [
        this.agents.agents.find(a => a.name === 'Lead Architect'),
        this.agents.agents.find(a => a.name === 'Senior Developer'),
        this.agents.agents.find(a => a.name === 'Tech Lead')
      ].filter(Boolean);
    }
    
    return sorted;
  }
  
  
  findAgentByName(name) {
    return this.agents.agents.find(a => a.name === name);
  }
  
  getAgentColor(agentName) {
    const colors = ['cyan', 'magenta', 'yellow', 'green', 'blue', 'white'];
    let hash = 0;
    for (let i = 0; i < agentName.length; i++) {
      hash = agentName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
  
  updateActiveAgentsDisplay() {
    // Mostrar contador de agentes ativos
    const count = this.activeAgents.size;
    if (count > 0) {
      process.stdout.write(`\r${chalk.green(`[${count} agentes ativos]`)} `);
    }
  }
  
  showHelp() {
    console.log(chalk.cyan('\n📚 Comandos disponíveis:'));
    console.log(chalk.gray('  /help    - Mostra esta ajuda'));
    console.log(chalk.gray('  /agents  - Lista todos os 100+ agentes'));
    console.log(chalk.gray('  /active  - Mostra agentes ativos na conversa'));
    console.log(chalk.gray('  /clear   - Limpa a tela'));
    console.log(chalk.gray('  /exit    - Sair'));
    console.log(chalk.gray('\n💡 Dicas:'));
    console.log(chalk.gray('  • Seja específico para ativar especialistas relevantes'));
    console.log(chalk.gray('  • Mencione tecnologias para chamar experts'));
    console.log(chalk.gray('  • Use termos como: debug, performance, security, test\n'));
    this.rl.prompt();
  }
  
  showAgents() {
    console.log(chalk.cyan('\n👥 Especialistas disponíveis:\n'));
    
    Object.entries(this.agents.phases).forEach(([phase, data]) => {
      console.log(chalk.yellow(`${phase.toUpperCase()} (${data.agents.length} agentes):`));
      console.log(chalk.gray(data.description));
      
      const phaseAgents = data.agents.slice(0, 5).map(id => 
        this.agents.agents.find(a => a.id === id)
      ).filter(Boolean);
      
      phaseAgents.forEach(agent => {
        console.log(chalk.gray(`  • ${agent.name} - ${agent.role}`));
      });
      
      if (data.agents.length > 5) {
        console.log(chalk.gray(`  ... e mais ${data.agents.length - 5} agentes`));
      }
      console.log('');
    });
    
    this.rl.prompt();
  }
  
  showActiveAgents() {
    if (this.activeAgents.size === 0) {
      console.log(chalk.gray('\nNenhum agente ativo ainda.\n'));
    } else {
      console.log(chalk.cyan(`\n🟢 Agentes ativos (${this.activeAgents.size}):\n`));
      this.activeAgents.forEach(name => {
        const agent = this.findAgentByName(name);
        if (agent) {
          console.log(chalk.green(`  • ${name} - ${agent.role}`));
        }
      });
      console.log('');
    }
    this.rl.prompt();
  }
  
  exit() {
    console.log(chalk.yellow('\n👋 War Room encerrado!'));
    if (this.ws) this.ws.close();
    process.exit(0);
  }
}

// Iniciar
const warRoom = new WarRoomMultiAgent();
warRoom.init().catch(err => {
  console.error(chalk.red('Erro:'), err.message);
  process.exit(1);
});