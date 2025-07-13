#!/usr/bin/env node

import { createInterface } from 'readline';
import { spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import axios from 'axios';
import WebSocket from 'ws';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// War Room CLI - Solução integrada para problemas tech e projetos
class WarRoomCLI {
  constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.cyan('war-room> ')
    });
    
    this.serverUrl = 'http://localhost:3005';
    this.wsUrl = 'ws://localhost:3005/warroom-ws';
    this.ws = null;
    this.currentMode = 'interactive';
    this.currentProject = null;
    this.history = [];
    this.activeAgents = [];
    
    // Modos disponíveis
    this.modes = {
      'interactive': 'Discussão interativa com agentes',
      'analysis': 'Análise profunda de código/arquitetura',
      'debug': 'Debug assistido por IA',
      'planning': 'Planejamento de projetos',
      'review': 'Code review inteligente',
      'security': 'Auditoria de segurança',
      'performance': 'Otimização de performance',
      'architecture': 'Design de arquitetura',
      'testing': 'Estratégia de testes',
      'deployment': 'CI/CD e deployment'
    };
    
    // Comandos disponíveis
    this.commands = {
      '/help': this.showHelp.bind(this),
      '/mode': this.changeMode.bind(this),
      '/agents': this.listAgents.bind(this),
      '/project': this.setProject.bind(this),
      '/analyze': this.analyzeProject.bind(this),
      '/plan': this.createPlan.bind(this),
      '/review': this.reviewCode.bind(this),
      '/debug': this.debugIssue.bind(this),
      '/test': this.generateTests.bind(this),
      '/security': this.securityAudit.bind(this),
      '/perf': this.performanceAnalysis.bind(this),
      '/deploy': this.deploymentStrategy.bind(this),
      '/history': this.showHistory.bind(this),
      '/export': this.exportSession.bind(this),
      '/clear': this.clearScreen.bind(this),
      '/exit': this.exit.bind(this)
    };
  }
  
  async init() {
    console.clear();
    this.showWelcome();
    
    // Verificar servidor
    const spinner = ora('Conectando ao War Room Server...').start();
    const serverRunning = await this.checkServer();
    
    if (!serverRunning) {
      spinner.fail('Servidor não encontrado. Iniciando servidor local...');
      await this.startLocalServer();
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      spinner.succeed('Conectado ao War Room Server');
    }
    
    // Conectar WebSocket
    await this.connectWebSocket();
    
    // Iniciar interface
    this.startInterface();
  }
  
  showWelcome() {
    console.log(chalk.bold.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      ${chalk.yellow('🧠 WAR ROOM CLI')} - Tech & Project Intelligence          ║
║                                                              ║
║      Solução integrada para todos os problemas em tech      ║
║      100+ agentes especializados prontos para ajudar        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `));
    
    console.log(chalk.gray('Digite /help para ver todos os comandos disponíveis\n'));
  }
  
  async checkServer() {
    try {
      const response = await axios.get(`${this.serverUrl}/health`);
      return response.data.status === 'ok';
    } catch (error) {
      return false;
    }
  }
  
  async startLocalServer() {
    const serverProcess = spawn('node', [
      path.join(__dirname, 'server', 'warroom-server.js')
    ], {
      detached: true,
      stdio: 'ignore'
    });
    
    serverProcess.unref();
  }
  
  async connectWebSocket() {
    return new Promise((resolve) => {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.on('open', () => {
        console.log(chalk.green('✓ WebSocket conectado'));
        resolve();
      });
      
      this.ws.on('message', (data) => {
        const message = JSON.parse(data);
        this.handleServerMessage(message);
      });
      
      this.ws.on('error', (error) => {
        console.error(chalk.red('WebSocket error:'), error);
      });
      
      this.ws.on('close', () => {
        console.log(chalk.yellow('WebSocket desconectado. Tentando reconectar...'));
        setTimeout(() => this.connectWebSocket(), 5000);
      });
    });
  }
  
  handleServerMessage(message) {
    if (message.type === 'agent-response') {
      console.log(chalk.bold.magenta(`\n${message.agent}:`));
      console.log(chalk.white(message.content));
      console.log();
      this.rl.prompt();
    }
  }
  
  startInterface() {
    this.rl.prompt();
    
    this.rl.on('line', async (line) => {
      const input = line.trim();
      
      if (!input) {
        this.rl.prompt();
        return;
      }
      
      // Adicionar ao histórico
      this.history.push(input);
      
      // Processar comando ou mensagem
      if (input.startsWith('/')) {
        await this.processCommand(input);
      } else {
        await this.processMessage(input);
      }
    });
    
    this.rl.on('close', () => {
      this.exit();
    });
  }
  
  async processCommand(input) {
    const [command, ...args] = input.split(' ');
    const handler = this.commands[command];
    
    if (handler) {
      await handler(args.join(' '));
    } else {
      console.log(chalk.red(`Comando desconhecido: ${command}`));
      console.log(chalk.gray('Use /help para ver comandos disponíveis'));
    }
    
    this.rl.prompt();
  }
  
  async processMessage(message) {
    console.log(chalk.gray('\nProcessando sua solicitação...\n'));
    
    // Enviar mensagem baseada no modo atual
    switch (this.currentMode) {
      case 'interactive':
        await this.sendInteractiveMessage(message);
        break;
      case 'analysis':
        await this.sendAnalysisRequest(message);
        break;
      case 'debug':
        await this.sendDebugRequest(message);
        break;
      case 'planning':
        await this.sendPlanningRequest(message);
        break;
      default:
        await this.sendInteractiveMessage(message);
    }
  }
  
  async sendInteractiveMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Selecionar agentes relevantes
      const relevantAgents = await this.selectRelevantAgents(message);
      
      console.log(chalk.cyan(`Convocando ${relevantAgents.length} especialistas...\n`));
      
      // Enviar para cada agente
      for (const agent of relevantAgents) {
        this.ws.send(JSON.stringify({
          type: 'agent-request',
          agent: agent,
          task: message,
          phase: 'analysis',
          capabilities: agent.capabilities
        }));
        
        // Pequeno delay entre agentes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  async selectRelevantAgents(message) {
    // Carregar dados dos agentes
    const agentsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf-8')
    );
    
    const allAgents = agentsData.warRoomTechInnovationRoles.agents;
    const keywords = message.toLowerCase().split(' ');
    
    // Scoring de agentes
    const scoredAgents = allAgents.map(agent => {
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
      
      return { agent, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 agentes
    
    // Se não encontrar agentes relevantes, usar alguns padrão
    if (scoredAgents.length === 0) {
      return [
        allAgents.find(a => a.name.includes('Architect')),
        allAgents.find(a => a.name.includes('Lead')),
        allAgents.find(a => a.name.includes('Security'))
      ].filter(Boolean);
    }
    
    return scoredAgents.map(item => item.agent);
  }
  
  // Comandos
  async showHelp() {
    console.log(chalk.bold.yellow('\n📚 Comandos Disponíveis:\n'));
    
    const commands = [
      ['/help', 'Mostra esta ajuda'],
      ['/mode [modo]', 'Altera o modo de operação'],
      ['/agents', 'Lista agentes disponíveis'],
      ['/project [path]', 'Define o projeto atual'],
      ['/analyze [arquivo]', 'Analisa código/arquitetura'],
      ['/plan [descrição]', 'Cria plano de projeto'],
      ['/review [arquivo]', 'Code review com IA'],
      ['/debug [erro]', 'Debug assistido'],
      ['/test [arquivo]', 'Gera testes automaticamente'],
      ['/security', 'Auditoria de segurança'],
      ['/perf', 'Análise de performance'],
      ['/deploy', 'Estratégia de deployment'],
      ['/history', 'Histórico de comandos'],
      ['/export [arquivo]', 'Exporta sessão'],
      ['/clear', 'Limpa a tela'],
      ['/exit', 'Sair do War Room']
    ];
    
    commands.forEach(([cmd, desc]) => {
      console.log(chalk.cyan(cmd.padEnd(20)) + chalk.gray(desc));
    });
    
    console.log(chalk.bold.yellow('\n🎯 Modos Disponíveis:\n'));
    
    Object.entries(this.modes).forEach(([mode, desc]) => {
      const current = mode === this.currentMode ? chalk.green(' (atual)') : '';
      console.log(chalk.cyan(mode.padEnd(15)) + chalk.gray(desc) + current);
    });
  }
  
  async changeMode(modeName) {
    if (!modeName) {
      console.log(chalk.yellow(`Modo atual: ${this.currentMode}`));
      console.log(chalk.gray('Use /mode [nome] para mudar'));
      return;
    }
    
    if (this.modes[modeName]) {
      this.currentMode = modeName;
      console.log(chalk.green(`✓ Modo alterado para: ${modeName}`));
      console.log(chalk.gray(this.modes[modeName]));
    } else {
      console.log(chalk.red('Modo inválido'));
      console.log(chalk.gray('Modos disponíveis: ' + Object.keys(this.modes).join(', ')));
    }
  }
  
  async listAgents() {
    const agentsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf-8')
    );
    
    const agents = agentsData.warRoomTechInnovationRoles.agents;
    const phases = agentsData.warRoomTechInnovationRoles.phases;
    
    console.log(chalk.bold.yellow('\n👥 Agentes Disponíveis por Fase:\n'));
    
    Object.entries(phases).forEach(([phaseName, phaseData]) => {
      console.log(chalk.bold.cyan(`\n${phaseName.toUpperCase()}: ${phaseData.description}`));
      console.log(chalk.gray('─'.repeat(60)));
      
      phaseData.agents.slice(0, 5).forEach(agentId => {
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
          console.log(chalk.white(`• ${agent.name} - ${agent.role}`));
          console.log(chalk.gray(`  ${agent.capabilities.slice(0, 2).join(', ')}`));
        }
      });
      
      if (phaseData.agents.length > 5) {
        console.log(chalk.gray(`  ... e mais ${phaseData.agents.length - 5} agentes`));
      }
    });
    
    console.log(chalk.yellow(`\nTotal: ${agents.length} agentes especializados`));
  }
  
  async setProject(projectPath) {
    if (!projectPath) {
      if (this.currentProject) {
        console.log(chalk.yellow(`Projeto atual: ${this.currentProject}`));
      } else {
        console.log(chalk.gray('Nenhum projeto definido. Use /project [caminho]'));
      }
      return;
    }
    
    // Resolver caminho
    const resolvedPath = path.resolve(projectPath);
    
    try {
      const stats = await fs.stat(resolvedPath);
      if (stats.isDirectory()) {
        this.currentProject = resolvedPath;
        console.log(chalk.green(`✓ Projeto definido: ${resolvedPath}`));
        
        // Análise rápida do projeto
        await this.quickProjectAnalysis();
      } else {
        console.log(chalk.red('Erro: O caminho deve ser um diretório'));
      }
    } catch (error) {
      console.log(chalk.red(`Erro: Caminho não encontrado: ${projectPath}`));
    }
  }
  
  async quickProjectAnalysis() {
    const spinner = ora('Analisando projeto...').start();
    
    try {
      // Detectar tipo de projeto
      const files = await fs.readdir(this.currentProject);
      const projectType = await this.detectProjectType(files);
      
      spinner.succeed(`Projeto ${projectType} detectado`);
      
      // Sugerir agentes relevantes
      console.log(chalk.cyan('\nAgentes recomendados para este projeto:'));
      const recommendations = this.getProjectRecommendations(projectType);
      recommendations.forEach(rec => {
        console.log(chalk.gray(`• ${rec}`));
      });
    } catch (error) {
      spinner.fail('Erro ao analisar projeto');
    }
  }
  
  async detectProjectType(files) {
    if (files.includes('package.json')) {
      const pkg = JSON.parse(
        await fs.readFile(path.join(this.currentProject, 'package.json'), 'utf-8')
      );
      
      if (pkg.dependencies?.react || pkg.dependencies?.['react-dom']) return 'React';
      if (pkg.dependencies?.vue) return 'Vue';
      if (pkg.dependencies?.angular) return 'Angular';
      if (pkg.dependencies?.express) return 'Node.js Backend';
      return 'JavaScript/Node.js';
    }
    
    if (files.includes('requirements.txt') || files.includes('setup.py')) return 'Python';
    if (files.includes('Cargo.toml')) return 'Rust';
    if (files.includes('go.mod')) return 'Go';
    if (files.includes('pom.xml')) return 'Java/Maven';
    if (files.includes('build.gradle')) return 'Java/Gradle';
    
    return 'Generic';
  }
  
  getProjectRecommendations(projectType) {
    const recommendations = {
      'React': [
        'Frontend Architect para estrutura de componentes',
        'UX Engineer para otimização de interface',
        'Performance Engineer para bundle optimization',
        'Testing Specialist para testes de componentes'
      ],
      'Node.js Backend': [
        'Backend Architect para design de APIs',
        'Security Specialist para autenticação',
        'Database Architect para modelagem',
        'DevOps Engineer para deployment'
      ],
      'Python': [
        'Python Lead para best practices',
        'Data Engineer se for projeto de dados',
        'ML Engineer se houver machine learning',
        'Testing Engineer para pytest strategies'
      ]
    };
    
    return recommendations[projectType] || [
      'System Architect para visão geral',
      'Security Specialist para análise',
      'Quality Engineer para padrões',
      'DevOps Engineer para CI/CD'
    ];
  }
  
  async analyzeProject(filePath) {
    if (!filePath && !this.currentProject) {
      console.log(chalk.red('Erro: Defina um projeto primeiro com /project [caminho]'));
      return;
    }
    
    const targetPath = filePath 
      ? path.resolve(filePath)
      : this.currentProject;
    
    console.log(chalk.cyan('\n🔍 Iniciando análise profunda...\n'));
    
    // Enviar para análise
    await this.sendAnalysisRequest(`Analyze the project architecture and code quality at ${targetPath}`);
  }
  
  async sendAnalysisRequest(request) {
    // Selecionar agentes especializados em análise
    const analysisAgents = await this.selectAnalysisAgents();
    
    for (const agent of analysisAgents) {
      this.ws.send(JSON.stringify({
        type: 'agent-request',
        agent: agent,
        task: request,
        phase: 'analysis',
        capabilities: agent.capabilities,
        context: {
          mode: 'deep-analysis',
          project: this.currentProject
        }
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  async selectAnalysisAgents() {
    const agentsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf-8')
    );
    
    const agents = agentsData.warRoomTechInnovationRoles.agents;
    
    // Agentes específicos para análise
    return [
      agents.find(a => a.name.includes('System Architect')),
      agents.find(a => a.name.includes('Code Quality')),
      agents.find(a => a.name.includes('Security')),
      agents.find(a => a.name.includes('Performance')),
      agents.find(a => a.name.includes('Testing'))
    ].filter(Boolean);
  }
  
  async createPlan(description) {
    if (!description) {
      console.log(chalk.yellow('Uso: /plan [descrição do projeto]'));
      return;
    }
    
    console.log(chalk.cyan('\n📋 Criando plano de projeto...\n'));
    
    await this.sendPlanningRequest(description);
  }
  
  async sendPlanningRequest(description) {
    const planningAgents = await this.selectPlanningAgents();
    
    console.log(chalk.gray('Convocando especialistas em planejamento...\n'));
    
    for (const agent of planningAgents) {
      this.ws.send(JSON.stringify({
        type: 'agent-request',
        agent: agent,
        task: `Create a detailed project plan for: ${description}`,
        phase: 'planning',
        capabilities: agent.capabilities
      }));
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }
  
  async selectPlanningAgents() {
    const agentsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf-8')
    );
    
    const agents = agentsData.warRoomTechInnovationRoles.agents;
    
    return [
      agents.find(a => a.name.includes('Product Manager')),
      agents.find(a => a.name.includes('Project Manager')),
      agents.find(a => a.name.includes('System Architect')),
      agents.find(a => a.name.includes('Tech Lead')),
      agents.find(a => a.name.includes('UX'))
    ].filter(Boolean).slice(0, 4);
  }
  
  async reviewCode(filePath) {
    if (!filePath) {
      console.log(chalk.yellow('Uso: /review [caminho do arquivo]'));
      return;
    }
    
    const resolvedPath = path.resolve(filePath);
    
    try {
      const code = await fs.readFile(resolvedPath, 'utf-8');
      const fileExt = path.extname(resolvedPath);
      
      console.log(chalk.cyan('\n👀 Iniciando code review...\n'));
      
      await this.sendCodeReviewRequest(code, fileExt);
    } catch (error) {
      console.log(chalk.red(`Erro ao ler arquivo: ${filePath}`));
    }
  }
  
  async sendCodeReviewRequest(code, fileType) {
    const reviewAgents = await this.selectCodeReviewAgents();
    
    for (const agent of reviewAgents) {
      this.ws.send(JSON.stringify({
        type: 'agent-request',
        agent: agent,
        task: `Review this ${fileType} code:\n\`\`\`\n${code.substring(0, 1000)}...\n\`\`\``,
        phase: 'review',
        capabilities: agent.capabilities
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  async selectCodeReviewAgents() {
    const agentsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf-8')
    );
    
    const agents = agentsData.warRoomTechInnovationRoles.agents;
    
    return [
      agents.find(a => a.name.includes('Code Quality')),
      agents.find(a => a.name.includes('Security')),
      agents.find(a => a.name.includes('Senior Developer')),
      agents.find(a => a.name.includes('Architect'))
    ].filter(Boolean).slice(0, 3);
  }
  
  async debugIssue(errorDescription) {
    if (!errorDescription) {
      console.log(chalk.yellow('Uso: /debug [descrição do erro]'));
      return;
    }
    
    console.log(chalk.cyan('\n🐛 Iniciando sessão de debug...\n'));
    
    await this.sendDebugRequest(errorDescription);
  }
  
  async sendDebugRequest(error) {
    const debugAgents = await this.selectDebugAgents();
    
    for (const agent of debugAgents) {
      this.ws.send(JSON.stringify({
        type: 'agent-request',
        agent: agent,
        task: `Debug this issue: ${error}`,
        phase: 'debugging',
        capabilities: agent.capabilities
      }));
      
      await new Promise(resolve => setTimeout(resolve, 700));
    }
  }
  
  async selectDebugAgents() {
    const agentsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf-8')
    );
    
    const agents = agentsData.warRoomTechInnovationRoles.agents;
    
    return [
      agents.find(a => a.name.includes('Debug')),
      agents.find(a => a.name.includes('Senior Developer')),
      agents.find(a => a.name.includes('System')),
      agents.find(a => a.name.includes('DevOps'))
    ].filter(Boolean).slice(0, 4);
  }
  
  async generateTests(filePath) {
    if (!filePath) {
      console.log(chalk.yellow('Uso: /test [caminho do arquivo]'));
      return;
    }
    
    console.log(chalk.cyan('\n🧪 Gerando testes...\n'));
    
    try {
      const code = await fs.readFile(path.resolve(filePath), 'utf-8');
      await this.sendTestGenerationRequest(code, filePath);
    } catch (error) {
      console.log(chalk.red(`Erro ao ler arquivo: ${filePath}`));
    }
  }
  
  async sendTestGenerationRequest(code, filePath) {
    const testAgents = await this.selectTestAgents();
    
    for (const agent of testAgents) {
      this.ws.send(JSON.stringify({
        type: 'agent-request',
        agent: agent,
        task: `Generate comprehensive tests for ${filePath}:\n\`\`\`\n${code.substring(0, 800)}...\n\`\`\``,
        phase: 'testing',
        capabilities: agent.capabilities
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  async selectTestAgents() {
    const agentsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf-8')
    );
    
    const agents = agentsData.warRoomTechInnovationRoles.agents;
    
    return [
      agents.find(a => a.name.includes('Test') && a.name.includes('Engineer')),
      agents.find(a => a.name.includes('QA')),
      agents.find(a => a.name.includes('Quality'))
    ].filter(Boolean);
  }
  
  async securityAudit() {
    if (!this.currentProject) {
      console.log(chalk.red('Erro: Defina um projeto primeiro com /project [caminho]'));
      return;
    }
    
    console.log(chalk.cyan('\n🔒 Iniciando auditoria de segurança...\n'));
    
    const securityAgents = await this.selectSecurityAgents();
    
    for (const agent of securityAgents) {
      this.ws.send(JSON.stringify({
        type: 'agent-request',
        agent: agent,
        task: `Perform security audit on project at ${this.currentProject}`,
        phase: 'security',
        capabilities: agent.capabilities
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
  }
  
  async selectSecurityAgents() {
    const agentsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf-8')
    );
    
    const agents = agentsData.warRoomTechInnovationRoles.agents;
    
    return agents.filter(a => 
      a.name.includes('Security') || 
      a.capabilities.some(c => c.toLowerCase().includes('security'))
    ).slice(0, 4);
  }
  
  async performanceAnalysis() {
    console.log(chalk.cyan('\n⚡ Iniciando análise de performance...\n'));
    
    const perfAgents = await this.selectPerformanceAgents();
    
    for (const agent of perfAgents) {
      this.ws.send(JSON.stringify({
        type: 'agent-request',
        agent: agent,
        task: 'Analyze performance bottlenecks and optimization opportunities',
        phase: 'performance',
        capabilities: agent.capabilities,
        context: {
          project: this.currentProject
        }
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  async selectPerformanceAgents() {
    const agentsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf-8')
    );
    
    const agents = agentsData.warRoomTechInnovationRoles.agents;
    
    return agents.filter(a => 
      a.name.includes('Performance') || 
      a.capabilities.some(c => c.toLowerCase().includes('performance') || c.toLowerCase().includes('optimization'))
    ).slice(0, 3);
  }
  
  async deploymentStrategy() {
    console.log(chalk.cyan('\n🚀 Planejando estratégia de deployment...\n'));
    
    const deployAgents = await this.selectDeploymentAgents();
    
    for (const agent of deployAgents) {
      this.ws.send(JSON.stringify({
        type: 'agent-request',
        agent: agent,
        task: 'Create deployment strategy with CI/CD pipeline recommendations',
        phase: 'deployment',
        capabilities: agent.capabilities
      }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  async selectDeploymentAgents() {
    const agentsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'warroom-agents-100.json'), 'utf-8')
    );
    
    const agents = agentsData.warRoomTechInnovationRoles.agents;
    
    return [
      agents.find(a => a.name.includes('DevOps')),
      agents.find(a => a.name.includes('Cloud')),
      agents.find(a => a.name.includes('Infrastructure')),
      agents.find(a => a.name.includes('SRE'))
    ].filter(Boolean).slice(0, 3);
  }
  
  async showHistory() {
    console.log(chalk.bold.yellow('\n📜 Histórico de Comandos:\n'));
    
    this.history.slice(-20).forEach((cmd, index) => {
      console.log(chalk.gray(`${index + 1}.`) + ' ' + chalk.white(cmd));
    });
    
    if (this.history.length > 20) {
      console.log(chalk.gray(`\n... e mais ${this.history.length - 20} comandos`));
    }
  }
  
  async exportSession(fileName) {
    if (!fileName) {
      fileName = `warroom-session-${new Date().toISOString().split('T')[0]}.json`;
    }
    
    const sessionData = {
      date: new Date().toISOString(),
      mode: this.currentMode,
      project: this.currentProject,
      history: this.history,
      duration: process.uptime()
    };
    
    try {
      await fs.writeFile(fileName, JSON.stringify(sessionData, null, 2));
      console.log(chalk.green(`✓ Sessão exportada para: ${fileName}`));
    } catch (error) {
      console.log(chalk.red('Erro ao exportar sessão'));
    }
  }
  
  clearScreen() {
    console.clear();
    this.showWelcome();
  }
  
  exit() {
    console.log(chalk.yellow('\n👋 Encerrando War Room CLI...'));
    
    if (this.ws) {
      this.ws.close();
    }
    
    process.exit(0);
  }
}

// Iniciar CLI
const cli = new WarRoomCLI();
cli.init().catch(error => {
  console.error(chalk.red('Erro ao inicializar War Room CLI:'), error);
  process.exit(1);
});