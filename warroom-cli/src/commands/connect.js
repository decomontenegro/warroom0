import chalk from 'chalk';
import ora from 'ora';
import WebSocket from 'ws';
import inquirer from 'inquirer';

export async function connectToServer(options) {
  const url = `ws://${options.host}:${options.port}/warroom-ws`;
  const spinner = ora(`Connecting to War Room server at ${url}...`).start();
  
  try {
    const ws = new WebSocket(url);
    
    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        spinner.succeed('Connected to War Room server!');
        resolve();
      });
      
      ws.on('error', (error) => {
        reject(error);
      });
      
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
    });
    
    console.log(chalk.green('\n✓ Connection established'));
    console.log(chalk.gray(`  Server: ${options.host}:${options.port}`));
    console.log(chalk.gray(`  Status: Connected`));
    
    // Handle incoming messages
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      handleServerMessage(message);
    });
    
    ws.on('close', () => {
      console.log(chalk.yellow('\n⚠ Connection closed'));
      process.exit(0);
    });
    
    // Start interactive mode
    await remoteInteractiveMode(ws);
    
  } catch (error) {
    spinner.fail('Failed to connect to War Room server');
    
    if (error.message === 'Connection timeout') {
      console.error(chalk.red('\n✗ Connection timeout'));
      console.log(chalk.gray('The server did not respond in time.'));
    } else if (error.code === 'ECONNREFUSED') {
      console.error(chalk.red('\n✗ Connection refused'));
      console.log(chalk.gray('Make sure the War Room server is running:'));
      console.log(chalk.cyan('  npm run dev'));
    } else {
      throw error;
    }
  }
}

function handleServerMessage(message) {
  switch (message.type) {
    case 'session-update':
      console.log(chalk.blue('\n[Session Update]'), message.data);
      break;
      
    case 'agent-message':
      console.log(chalk.yellow(`\n[${message.agent}]`), message.message);
      break;
      
    case 'analysis-result':
      console.log(chalk.green('\n[Analysis Result]'));
      console.log(message.data);
      break;
      
    case 'error':
      console.log(chalk.red('\n[Error]'), message.message);
      break;
      
    case 'notification':
      console.log(chalk.cyan('\n[Notification]'), message.message);
      break;
      
    default:
      console.log(chalk.gray('\n[Server]'), message);
  }
}

async function remoteInteractiveMode(ws) {
  console.log(chalk.cyan('\n→ Remote control mode'));
  console.log(chalk.gray('Type "help" for commands, "exit" to disconnect\n'));
  
  let running = true;
  while (running) {
    const { command } = await inquirer.prompt([
      {
        type: 'input',
        name: 'command',
        message: 'warroom-remote>',
        prefix: ''
      }
    ]);
    
    const [cmd, ...args] = command.trim().split(' ');
    
    switch (cmd) {
      case 'help':
        console.log(chalk.cyan('\nRemote Commands:'));
        console.log('  sessions   - List active sessions');
        console.log('  join <id>  - Join a session');
        console.log('  create     - Create new session');
        console.log('  status     - Server status');
        console.log('  agents     - List active agents');
        console.log('  exit       - Disconnect\n');
        break;
        
      case 'sessions':
        ws.send(JSON.stringify({ type: 'list-sessions' }));
        break;
        
      case 'join':
        if (args[0]) {
          ws.send(JSON.stringify({ type: 'join-session', sessionId: args[0] }));
        } else {
          console.log(chalk.red('Please specify a session ID'));
        }
        break;
        
      case 'create':
        const { task } = await inquirer.prompt([
          {
            type: 'input',
            name: 'task',
            message: 'Task description:'
          }
        ]);
        ws.send(JSON.stringify({ type: 'create-session', task }));
        break;
        
      case 'status':
        ws.send(JSON.stringify({ type: 'server-status' }));
        break;
        
      case 'agents':
        ws.send(JSON.stringify({ type: 'list-agents' }));
        break;
        
      case 'exit':
        running = false;
        ws.close();
        console.log(chalk.yellow('\n→ Disconnecting...'));
        break;
        
      default:
        if (cmd) {
          console.log(chalk.red(`Unknown command: ${cmd}. Type "help" for available commands.`));
        }
    }
  }
}