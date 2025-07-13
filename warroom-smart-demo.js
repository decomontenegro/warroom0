#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import readline from 'readline';
import gradient from 'gradient-string';
import boxen from 'boxen';

// Simula a interface inteligente do War Room similar ao Claude CLI
class SmartWarRoomInterface {
  constructor() {
    this.history = [];
    this.context = [];
    this.commands = [
      'analyze <file>',
      'folder <path>',
      'ask <question>',
      'team list',
      'dag visualize',
      'review code',
      'refactor suggest',
      'test generate',
      'docs create',
      'performance check'
    ];
  }

  async start() {
    console.clear();
    this.showWelcome();
    
    while (true) {
      const input = await this.getSmartInput();
      
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        console.log(chalk.yellow('\n👋 Goodbye!'));
        process.exit(0);
      }
      
      await this.processCommand(input);
    }
  }

  showWelcome() {
    const title = gradient.rainbow('War Room - Smart Mode');
    const box = boxen(
      `${title}\n\n` +
      chalk.gray('Intelligent interface with:') + '\n' +
      chalk.green('✓') + ' Auto-complete\n' +
      chalk.green('✓') + ' Command history (↑/↓)\n' +
      chalk.green('✓') + ' Smart suggestions\n' +
      chalk.green('✓') + ' Context awareness\n' +
      chalk.green('✓') + ' Multi-line input (\\)\n',
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    );
    console.log(box);
  }

  async getSmartInput() {
    // Mostrar prompt contextual
    const contextInfo = this.context.length > 0 
      ? chalk.gray(` [${this.context[this.context.length - 1].type}]`)
      : '';
    
    const prompt = chalk.cyan('warroom') + 
                   chalk.gray(' » ') + 
                   contextInfo + 
                   chalk.white(' ');

    // Configurar readline para entrada avançada
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: prompt,
      completer: (line) => {
        const completions = this.getCompletions(line);
        return [completions, line];
      }
    });

    // Habilitar histórico
    rl.history = this.history.slice();

    return new Promise((resolve) => {
      process.stdout.write(prompt);
      
      let buffer = '';
      let multiline = false;

      rl.on('line', (line) => {
        if (line.endsWith('\\')) {
          // Multi-linha
          buffer += line.slice(0, -1) + '\n';
          multiline = true;
          process.stdout.write(chalk.gray('... '));
        } else {
          buffer += line;
          rl.close();
          this.history.push(buffer);
          resolve(buffer);
        }
      });

      // Atalhos de teclado
      process.stdin.on('keypress', (str, key) => {
        if (key.ctrl && key.name === 'r') {
          // Busca reversa no histórico
          this.showHistorySearch();
        }
        if (key.ctrl && key.name === 'l') {
          // Limpar tela
          console.clear();
          this.showWelcome();
        }
      });
    });
  }

  getCompletions(line) {
    const suggestions = [];
    
    // Comandos básicos
    this.commands.forEach(cmd => {
      if (cmd.startsWith(line)) {
        suggestions.push(cmd);
      }
    });
    
    // Sugestões contextuais
    if (line.startsWith('analyze')) {
      suggestions.push('analyze app.js', 'analyze src/', 'analyze --deep');
    }
    
    if (line.startsWith('folder')) {
      suggestions.push('folder . --dag', 'folder src --analyze', 'folder --exclude node_modules');
    }
    
    // Histórico relevante
    this.history.filter(h => h.startsWith(line) && h !== line).forEach(h => {
      if (!suggestions.includes(h)) {
        suggestions.push(h);
      }
    });
    
    return suggestions;
  }

  async processCommand(input) {
    // Simular processamento inteligente
    console.log(chalk.gray('\n🤔 Processing...'));
    
    // Adicionar ao contexto
    this.context.push({
      command: input,
      timestamp: new Date(),
      type: this.detectCommandType(input)
    });
    
    // Simular resposta inteligente
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (input.startsWith('analyze')) {
      this.showAnalysisResult();
    } else if (input.startsWith('folder')) {
      this.showFolderResult();
    } else if (input.startsWith('ask')) {
      this.showAIResponse(input);
    } else {
      console.log(chalk.green('✓') + ' Command executed successfully');
    }
    
    console.log(''); // Nova linha
  }

  detectCommandType(input) {
    if (input.includes('analyze')) return 'analysis';
    if (input.includes('folder')) return 'structure';
    if (input.includes('ask')) return 'question';
    if (input.includes('refactor')) return 'refactoring';
    return 'general';
  }

  showAnalysisResult() {
    console.log(boxen(
      chalk.green('Analysis Complete') + '\n\n' +
      '📊 Code Quality: ' + chalk.yellow('B+') + '\n' +
      '🐛 Issues Found: ' + chalk.red('3') + '\n' +
      '✨ Suggestions: ' + chalk.blue('5') + '\n' +
      '📈 Complexity: ' + chalk.orange('Medium'),
      {
        padding: 1,
        borderStyle: 'single',
        borderColor: 'green'
      }
    ));
  }

  showFolderResult() {
    console.log(chalk.green('📁 Folder Structure Analyzed'));
    console.log(chalk.gray('├── src/'));
    console.log(chalk.gray('│   ├── components/'));
    console.log(chalk.gray('│   ├── services/'));
    console.log(chalk.gray('│   └── utils/'));
    console.log(chalk.gray('└── tests/'));
  }

  showAIResponse(input) {
    const question = input.replace('ask ', '');
    console.log(boxen(
      chalk.cyan('🤖 AI Team Response') + '\n\n' +
      chalk.gray('Question: ') + question + '\n\n' +
      'Based on analysis, here are our recommendations:\n' +
      '1. Consider using dependency injection\n' +
      '2. Add unit tests for critical paths\n' +
      '3. Optimize database queries',
      {
        padding: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
      }
    ));
  }

  showHistorySearch() {
    console.log(chalk.yellow('\n🔍 History Search (Ctrl+C to cancel)'));
    this.history.slice(-10).forEach((cmd, idx) => {
      console.log(chalk.gray(`${idx + 1}.`) + ' ' + cmd);
    });
  }
}

// Executar demo
const demo = new SmartWarRoomInterface();
demo.start().catch(console.error);