import chalk from 'chalk';
import { getAvailableAgents } from '../utils/agents.js';

export async function listAgents(options) {
  console.log(chalk.cyan('\n🤖 Available War Room Agents:\n'));
  
  const agents = getAvailableAgents();
  
  agents.forEach((agent, index) => {
    console.log(chalk.green(`${index + 1}. ${agent.name}`));
    console.log(chalk.gray(`   ID: ${agent.id}`));
    
    if (options.capabilities) {
      console.log(chalk.gray(`   Capability: ${agent.capability}`));
      console.log(chalk.gray(`   Type: ${agent.type}`));
      console.log(chalk.gray(`   Priority: ${agent.priority}`));
      
      if (agent.skills && agent.skills.length > 0) {
        console.log(chalk.gray(`   Skills: ${agent.skills.join(', ')}`));
      }
      
      if (agent.dependencies && agent.dependencies.length > 0) {
        console.log(chalk.gray(`   Works well with: ${agent.dependencies.join(', ')}`));
      }
    }
    
    console.log('');
  });
  
  console.log(chalk.cyan('→ Agent Types:'));
  console.log(chalk.gray('  • Orchestrator: Manages session flow and team composition'));
  console.log(chalk.gray('  • Analyzer: Performs code and requirement analysis'));
  console.log(chalk.gray('  • Generator: Creates code, tests, and documentation'));
  console.log(chalk.gray('  • Validator: Ensures quality and correctness'));
  console.log(chalk.gray('  • Moderator: Facilitates communication and resolves conflicts'));
  
  console.log(chalk.cyan('\n→ Usage:'));
  console.log(chalk.gray('  warroom start --agents CodeAnalyzer TestGenerator'));
  console.log(chalk.gray('  warroom start -a "SessionOrchestrator,AIDialogModerator"'));
}