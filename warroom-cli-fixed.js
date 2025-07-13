#!/usr/bin/env node

import { createInterface } from 'readline';
import chalk from 'chalk';
import WebSocket from 'ws';

// War Room CLI Simplificado
class WarRoomCLI {
  constructor() {
    this.ws = null;
    this.wsUrl = 'ws://localhost:3005/warroom-ws';
    this.connected = false;
  }
  
  async init() {
    console.clear();
    this.showWelcome();
    
    // Conectar WebSocket
    await this.connectWebSocket();
    
    // Criar interface readline DEPOIS da conexão
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.cyan('war-room> ')
    });
    
    // Configurar handlers
    this.setupInterface();
    
    // Mostrar prompt inicial
    this.rl.prompt();
  }
  
  showWelcome() {
    console.log(chalk.bold.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      ${chalk.yellow('🧠 WAR ROOM CLI')} - Vibe Code Assistant                ║
║                                                              ║
║      Seu assistente inteligente para programação            ║
║      Pergunte qualquer coisa sobre código!                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `));
    
    console.log(chalk.gray('\nComandos: /help, /clear, /exit'));
    console.log(chalk.gray('Ou digite sua pergunta diretamente\n'));
  }
  
  async connectWebSocket() {
    return new Promise((resolve) => {
      console.log(chalk.yellow('Conectando...'));
      
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.on('open', () => {
        console.log(chalk.green('✓ Conectado ao War Room!\n'));
        this.connected = true;
        resolve();
      });
      
      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'agent-response' || msg.type === 'agent-message') {
          console.log('\n' + chalk.magenta(msg.agent + ':'));
          console.log(msg.content || msg.message);
          console.log('');
          this.rl.prompt();
        }
      });
      
      this.ws.on('error', (err) => {
        console.log(chalk.red('\n❌ Erro de conexão. Certifique-se que o servidor está rodando.'));
        console.log(chalk.gray('Use: npm run dev (em outro terminal)\n'));
        process.exit(1);
      });
      
      this.ws.on('close', () => {
        console.log(chalk.red('\n❌ Conexão perdida.'));
        process.exit(1);
      });
    });
  }
  
  setupInterface() {
    // Handler principal
    this.rl.on('line', async (input) => {
      const trimmed = input.trim();
      
      if (!trimmed) {
        this.rl.prompt();
        return;
      }
      
      // Comandos especiais
      if (trimmed === '/help') {
        this.showHelp();
      } else if (trimmed === '/clear') {
        console.clear();
        this.showWelcome();
        this.rl.prompt();
      } else if (trimmed === '/exit' || trimmed === 'exit') {
        this.exit();
      } else if (trimmed.startsWith('/')) {
        console.log(chalk.red('Comando não reconhecido. Use /help'));
        this.rl.prompt();
      } else {
        // Enviar pergunta para AI
        this.sendMessage(trimmed);
      }
    });
    
    // Ctrl+C para sair
    this.rl.on('SIGINT', () => {
      this.exit();
    });
  }
  
  showHelp() {
    console.log(chalk.cyan('\n📚 Comandos disponíveis:'));
    console.log(chalk.gray('  /help   - Mostra esta ajuda'));
    console.log(chalk.gray('  /clear  - Limpa a tela'));
    console.log(chalk.gray('  /exit   - Sair do War Room'));
    console.log(chalk.gray('\nExemplos de uso:'));
    console.log(chalk.gray('  debugar erro undefined'));
    console.log(chalk.gray('  revisar função de login'));
    console.log(chalk.gray('  melhorar performance de query'));
    console.log(chalk.gray('  criar testes para UserService\n'));
    this.rl.prompt();
  }
  
  sendMessage(message) {
    if (!this.connected) {
      console.log(chalk.red('Não conectado ao servidor.'));
      this.rl.prompt();
      return;
    }
    
    console.log(chalk.gray('\n⏳ Processando...\n'));
    
    this.ws.send(JSON.stringify({
      type: 'agent-request',
      agent: { name: 'CodeAssistant', role: 'Helper' },
      task: message,
      capabilities: ['Debugging', 'Code Review', 'Performance', 'Testing', 'General']
    }));
  }
  
  exit() {
    console.log(chalk.yellow('\n👋 Até mais!'));
    if (this.ws) this.ws.close();
    process.exit(0);
  }
}

// Iniciar CLI
const cli = new WarRoomCLI();
cli.init().catch(err => {
  console.error(chalk.red('Erro ao inicializar:'), err.message);
  process.exit(1);
});