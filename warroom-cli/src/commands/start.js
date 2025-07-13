import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import open from 'open';
import { createWarRoomSession } from '../utils/session.js';
import { connectWebSocket } from '../utils/websocket.js';

export async function startSession(options) {
  let task = options.task;
  
  // If no task provided, prompt for it
  if (!task) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'task',
        message: 'What would you like to work on?',
        validate: (input) => input.trim() !== '' || 'Please enter a task description'
      }
    ]);
    task = answers.task;
  }

  const spinner = ora('Starting War Room session...').start();

  try {
    // Create session
    const session = await createWarRoomSession({
      task,
      agents: options.agents,
      timestamp: new Date().toISOString()
    });

    spinner.succeed('War Room session started!');
    
    console.log(chalk.green('\n✓ Session Details:'));
    console.log(chalk.gray('  ID:'), session.id);
    console.log(chalk.gray('  Task:'), task);
    console.log(chalk.gray('  Agents:'), session.agents.join(', '));
    
    // Open web interface if requested
    if (options.web) {
      console.log(chalk.cyan('\n→ Opening web interface...'));
      await open('http://localhost:5173/warroom');
      
      // Connect via WebSocket for real-time updates
      const ws = await connectWebSocket(session.id);
      console.log(chalk.green('✓ Connected to War Room server'));
      
      // Handle WebSocket messages
      ws.on('message', (data) => {
        const message = JSON.parse(data);
        switch (message.type) {
          case 'agent-update':
            console.log(chalk.yellow(`[${message.agent}]`), message.message);
            break;
          case 'session-complete':
            console.log(chalk.green('\n✓ Session completed successfully!'));
            process.exit(0);
            break;
          case 'error':
            console.log(chalk.red('✗ Error:'), message.message);
            break;
        }
      });
    } else {
      console.log(chalk.gray('\nTip: Use --web flag to open the web interface'));
    }
    
    // Interactive mode
    if (!options.web) {
      await interactiveMode(session);
    }
    
  } catch (error) {
    spinner.fail('Failed to start War Room session');
    throw error;
  }
}

async function interactiveMode(session) {
  console.log(chalk.cyan('\n→ Entering interactive mode...'));
  console.log(chalk.gray('Type "help" for available commands, "exit" to quit\n'));

  let running = true;
  while (running) {
    const { command } = await inquirer.prompt([
      {
        type: 'input',
        name: 'command',
        message: 'warroom>',
        prefix: ''
      }
    ]);

    const [cmd, ...args] = command.trim().split(' ');

    switch (cmd) {
      case 'help':
        console.log(chalk.cyan('\nAvailable commands:'));
        console.log('  status    - Show session status');
        console.log('  agents    - List active agents');
        console.log('  log       - Show session log');
        console.log('  web       - Open web interface');
        console.log('  exit      - End session and quit\n');
        break;
        
      case 'status':
        console.log(chalk.green('\nSession Status:'));
        console.log(chalk.gray('  ID:'), session.id);
        console.log(chalk.gray('  Task:'), session.task);
        console.log(chalk.gray('  Status:'), session.status);
        console.log(chalk.gray('  Duration:'), getSessionDuration(session.startTime));
        break;
        
      case 'agents':
        console.log(chalk.green('\nActive Agents:'));
        session.agents.forEach(agent => {
          console.log(chalk.gray(`  - ${agent.name}: ${agent.status}`));
        });
        break;
        
      case 'log':
        console.log(chalk.green('\nSession Log:'));
        session.log.forEach(entry => {
          console.log(chalk.gray(`  [${entry.time}] ${entry.message}`));
        });
        break;
        
      case 'web':
        await open('http://localhost:5173/warroom');
        console.log(chalk.cyan('→ Web interface opened in browser'));
        break;
        
      case 'exit':
        running = false;
        console.log(chalk.yellow('\n→ Ending War Room session...'));
        break;
        
      default:
        if (cmd) {
          console.log(chalk.red(`Unknown command: ${cmd}. Type "help" for available commands.`));
        }
    }
  }
}

function getSessionDuration(startTime) {
  const duration = Date.now() - new Date(startTime).getTime();
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}