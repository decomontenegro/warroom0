#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import gradient from 'gradient-string';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Interface similar ao Claude CLI
export class ClaudeLikeInterface {
  constructor() {
    this.conversationHistory = [];
    this.context = {
      files: [],
      currentTask: null,
      preferences: {}
    };
    this.setupPrompts();
  }

  setupPrompts() {
    // Configurar autocomplete personalizado
    inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
  }

  async start() {
    console.clear();
    await this.showSmartWelcome();
    await this.runConversationLoop();
  }

  async showSmartWelcome() {
    const title = gradient.pastel('War Room - Claude-like Interface');
    
    const welcomeBox = boxen(
      `${title}\n\n` +
      chalk.dim('Intelligent features:\n') +
      chalk.green('•') + ' Natural language understanding\n' +
      chalk.green('•') + ' Context-aware suggestions\n' +
      chalk.green('•') + ' Smart code analysis\n' +
      chalk.green('•') + ' Multi-turn conversations\n' +
      chalk.green('•') + ' File and project awareness\n\n' +
      chalk.gray('Type your request or use /commands'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'magenta',
        title: '🤖 AI Development Assistant',
        titleAlignment: 'center'
      }
    );
    
    console.log(welcomeBox);
  }

  async runConversationLoop() {
    while (true) {
      const input = await this.getSmartInput();
      
      if (input === '/exit' || input === '/quit') {
        await this.goodbye();
        break;
      }
      
      await this.processSmartCommand(input);
    }
  }

  async getSmartInput() {
    // Construir prompt contextual como Claude CLI
    const contextIndicator = this.buildContextIndicator();
    const suggestions = await this.getContextualSuggestions();
    
    const response = await inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'command',
        message: contextIndicator,
        suggestOnly: true,
        searchText: 'Type your request...',
        emptyText: 'No suggestions',
        source: async (answers, input) => {
          if (!input) return suggestions;
          return this.searchSuggestions(input, suggestions);
        },
        pageSize: 10,
        prefix: chalk.cyan('warroom') + chalk.gray(' »'),
        transformer: (input) => {
          // Syntax highlighting em tempo real
          return this.highlightSyntax(input);
        }
      }
    ]);
    
    return response.command;
  }

  buildContextIndicator() {
    const parts = [];
    
    // Mostrar arquivos no contexto
    if (this.context.files.length > 0) {
      parts.push(chalk.blue(`📎 ${this.context.files.length} files`));
    }
    
    // Mostrar tarefa atual
    if (this.context.currentTask) {
      parts.push(chalk.yellow(`🎯 ${this.context.currentTask}`));
    }
    
    // Mostrar modo
    if (this.conversationHistory.length > 0) {
      parts.push(chalk.green(`💬 Turn ${this.conversationHistory.length + 1}`));
    }
    
    return parts.length > 0 ? chalk.gray(`[${parts.join(' | ')}] `) : '';
  }

  async getContextualSuggestions() {
    const suggestions = [];
    
    // Comandos slash como Claude
    suggestions.push(
      '/add <file> - Add file to context',
      '/clear - Clear context',
      '/task <description> - Set current task',
      '/analyze - Analyze current context',
      '/suggest - Get AI suggestions',
      '/refactor - Suggest refactoring',
      '/test - Generate tests',
      '/docs - Generate documentation',
      '/review - Code review',
      '/help - Show all commands'
    );
    
    // Sugestões baseadas no contexto
    if (this.context.files.length > 0) {
      suggestions.push(
        'What does this code do?',
        'Find potential bugs',
        'Suggest improvements',
        'Explain the architecture',
        'Generate unit tests'
      );
    }
    
    // Histórico recente
    const recentCommands = this.conversationHistory
      .slice(-5)
      .map(h => h.input)
      .filter(cmd => !cmd.startsWith('/'));
    
    suggestions.push(...recentCommands);
    
    return suggestions;
  }

  async searchSuggestions(input, suggestions) {
    const filtered = suggestions.filter(s => 
      s.toLowerCase().includes(input.toLowerCase())
    );
    
    // Adicionar sugestões inteligentes baseadas em partial match
    if (input.length > 2) {
      const smartSuggestions = this.generateSmartSuggestions(input);
      filtered.push(...smartSuggestions);
    }
    
    return filtered;
  }

  highlightSyntax(input) {
    // Destacar comandos slash
    if (input.startsWith('/')) {
      const [cmd, ...args] = input.split(' ');
      return chalk.magenta(cmd) + ' ' + chalk.white(args.join(' '));
    }
    
    // Destacar palavras-chave
    const keywords = ['analyze', 'refactor', 'test', 'fix', 'improve', 'explain'];
    let highlighted = input;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlighted = highlighted.replace(regex, chalk.yellow(keyword));
    });
    
    return highlighted;
  }

  generateSmartSuggestions(input) {
    const suggestions = [];
    
    // Sugestões baseadas em padrões comuns
    if (input.includes('fix')) {
      suggestions.push('Fix the bug in line X', 'Fix all linting errors');
    }
    
    if (input.includes('add')) {
      suggestions.push('Add error handling', 'Add unit tests', 'Add documentation');
    }
    
    if (input.includes('improve')) {
      suggestions.push('Improve performance', 'Improve code readability');
    }
    
    return suggestions;
  }

  async processSmartCommand(input) {
    // Adicionar ao histórico
    this.conversationHistory.push({
      input,
      timestamp: new Date(),
      context: {...this.context}
    });
    
    // Processar comandos slash
    if (input.startsWith('/')) {
      await this.handleSlashCommand(input);
      return;
    }
    
    // Processar linguagem natural
    await this.handleNaturalLanguage(input);
  }

  async handleSlashCommand(input) {
    const [command, ...args] = input.split(' ');
    
    switch (command) {
      case '/add':
        await this.addFileToContext(args.join(' '));
        break;
      case '/clear':
        await this.clearContext();
        break;
      case '/task':
        await this.setTask(args.join(' '));
        break;
      case '/analyze':
        await this.analyzeContext();
        break;
      case '/help':
        await this.showHelp();
        break;
      default:
        console.log(chalk.red(`Unknown command: ${command}`));
    }
  }

  async handleNaturalLanguage(input) {
    const spinner = ora({
      text: 'AI team is thinking...',
      spinner: 'dots12',
      color: 'cyan'
    }).start();
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    spinner.succeed('AI team ready');
    
    // Resposta inteligente baseada no contexto
    const response = this.generateIntelligentResponse(input);
    
    console.log('\n' + boxen(response, {
      padding: 1,
      borderStyle: 'single',
      borderColor: 'cyan',
      title: '🤖 AI Response',
      titleAlignment: 'left'
    }));
  }

  generateIntelligentResponse(input) {
    // Simular resposta inteligente baseada no contexto
    if (this.context.files.length === 0) {
      return chalk.yellow('💡 Tip: ') + 'Add files to context first using ' + 
             chalk.cyan('/add <file>') + ' for more specific analysis.';
    }
    
    // Respostas contextuais
    if (input.toLowerCase().includes('explain')) {
      return `Based on the ${this.context.files.length} files in context:\n\n` +
             `• Main purpose: ${chalk.green('Code analysis and visualization')}\n` +
             `• Architecture: ${chalk.blue('Modular with DAG-based dependencies')}\n` +
             `• Key patterns: ${chalk.yellow('Observer, Strategy, Factory')}\n\n` +
             `Would you like me to go deeper into any specific area?`;
    }
    
    if (input.toLowerCase().includes('improve')) {
      return `Suggestions for improvement:\n\n` +
             `1. ${chalk.green('Performance')}: Consider lazy loading for large graphs\n` +
             `2. ${chalk.blue('Architecture')}: Extract interfaces for better testability\n` +
             `3. ${chalk.yellow('Code Quality')}: Add TypeScript for type safety\n` +
             `4. ${chalk.magenta('Testing')}: Increase coverage to 80%+`;
    }
    
    return `I understand you want to: "${input}"\n\n` +
           `Based on the current context, I suggest:\n` +
           `• Running ${chalk.cyan('warroom analyze')} for detailed insights\n` +
           `• Using ${chalk.cyan('/task')} to set a specific goal\n` +
           `• Adding more files with ${chalk.cyan('/add')} for better analysis`;
  }

  async addFileToContext(file) {
    if (!file) {
      console.log(chalk.red('Please specify a file to add'));
      return;
    }
    
    this.context.files.push(file);
    console.log(chalk.green('✓') + ` Added ${chalk.cyan(file)} to context`);
  }

  async clearContext() {
    this.context = {
      files: [],
      currentTask: null,
      preferences: {}
    };
    this.conversationHistory = [];
    console.log(chalk.green('✓') + ' Context cleared');
  }

  async setTask(task) {
    this.context.currentTask = task;
    console.log(chalk.green('✓') + ` Task set: ${chalk.yellow(task)}`);
  }

  async analyzeContext() {
    if (this.context.files.length === 0) {
      console.log(chalk.yellow('No files in context to analyze'));
      return;
    }
    
    const spinner = ora('Analyzing context...').start();
    await new Promise(resolve => setTimeout(resolve, 2000));
    spinner.succeed('Analysis complete');
    
    console.log(boxen(
      `📊 Context Analysis\n\n` +
      `Files: ${this.context.files.length}\n` +
      `Task: ${this.context.currentTask || 'Not set'}\n` +
      `Conversation turns: ${this.conversationHistory.length}\n\n` +
      `Recommendations:\n` +
      `• Focus on ${chalk.green('modular design')}\n` +
      `• Consider ${chalk.blue('dependency injection')}\n` +
      `• Add ${chalk.yellow('comprehensive tests')}`,
      {
        padding: 1,
        borderStyle: 'double',
        borderColor: 'green'
      }
    ));
  }

  async showHelp() {
    console.log(boxen(
      chalk.cyan('Available Commands:\n\n') +
      chalk.gray('Context Management:\n') +
      '  /add <file>     - Add file to context\n' +
      '  /clear          - Clear all context\n' +
      '  /task <desc>    - Set current task\n\n' +
      chalk.gray('Analysis:\n') +
      '  /analyze        - Analyze current context\n' +
      '  /suggest        - Get AI suggestions\n' +
      '  /review         - Code review\n\n' +
      chalk.gray('Other:\n') +
      '  /help           - Show this help\n' +
      '  /exit           - Exit War Room',
      {
        padding: 1,
        borderStyle: 'single',
        title: '📚 Help',
        titleAlignment: 'center'
      }
    ));
  }

  async goodbye() {
    console.log('\n' + boxen(
      chalk.yellow('Thanks for using War Room!') + '\n\n' +
      `Session summary:\n` +
      `• Commands: ${this.conversationHistory.length}\n` +
      `• Files analyzed: ${this.context.files.length}\n` +
      `• Task: ${this.context.currentTask || 'None'}\n\n` +
      chalk.gray('See you next time! 👋'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'yellow'
      }
    ));
  }
}

// Exportar para uso no War Room CLI
export default ClaudeLikeInterface;