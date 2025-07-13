#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { startSession } from './commands/start.js';
import { analyzeCode } from './commands/analyze.js';
import { openDAG } from './commands/dag.js';
import { listAgents } from './commands/agents.js';
import { connectToServer } from './commands/connect.js';
import { analyzeFolder } from './commands/folder.js';

const program = new Command();

program
  .name('warroom')
  .description('War Room CLI - AI-powered collaborative development')
  .version('1.0.0');

// Start a new War Room session
program
  .command('start')
  .description('Start a new War Room session')
  .option('-t, --task <description>', 'Task description')
  .option('-a, --agents <agents...>', 'Specific agents to use')
  .option('-w, --web', 'Open web interface')
  .action(startSession);

// Analyze code
program
  .command('analyze <path>')
  .description('Analyze code file or directory')
  .option('-d, --depth <number>', 'Analysis depth', '2')
  .option('-v, --visualize', 'Open DAG visualization')
  .option('-o, --output <file>', 'Output results to file')
  .action(analyzeCode);

// Analyze entire folder structure
program
  .command('folder <path>')
  .description('Analyze entire folder structure and dependencies')
  .option('-i, --ignore <patterns...>', 'Patterns to ignore', ['node_modules', '.git', 'dist', 'build'])
  .option('-d, --depth <number>', 'Maximum depth to analyze', '5')
  .option('-v, --visualize', 'Open DAG visualization')
  .action(analyzeFolder);

// Open DAG visualizer
program
  .command('dag [file]')
  .description('Open DAG visualizer for code analysis')
  .option('-p, --port <number>', 'Port to use', '5173')
  .option('-a, --analyze', 'Analyze before opening')
  .action(openDAG);

// List available agents
program
  .command('agents')
  .description('List available War Room agents')
  .option('-c, --capabilities', 'Show agent capabilities')
  .action(listAgents);

// Connect to running War Room server
program
  .command('connect')
  .description('Connect to running War Room server')
  .option('-h, --host <host>', 'Server host', 'localhost')
  .option('-p, --port <port>', 'Server port', '3001')
  .action(connectToServer);

// Smart interface similar to Claude CLI
program
  .command('smart')
  .alias('s')
  .description('Start Claude-like intelligent interface')
  .option('-c, --context <files...>', 'Add files to initial context')
  .option('-t, --task <task>', 'Set initial task')
  .action(async (options) => {
    try {
      const { ClaudeLikeInterface } = await import('./modes/claude-like-interface.js');
      const smartInterface = new ClaudeLikeInterface();
      
      // Setup initial context if provided
      if (options.context) {
        options.context.forEach(file => {
          smartInterface.context.files.push(file);
        });
      }
      
      if (options.task) {
        smartInterface.context.currentTask = options.task;
      }
      
      await smartInterface.start();
    } catch (error) {
      console.error(chalk.red('Error starting smart interface:'), error.message);
      console.log(chalk.yellow('\nTry installing dependencies:'));
      console.log(chalk.gray('  cd warroom-cli && npm install inquirer-autocomplete-prompt ora boxen gradient-string'));
    }
  });

// Global error handling
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
});

// Show header
console.log(chalk.cyan.bold(`
╔══════════════════════════════════════╗
║        War Room CLI v1.0.0           ║
║  AI-Powered Development Assistant    ║
╚══════════════════════════════════════╝
`));

program.parse(process.argv);