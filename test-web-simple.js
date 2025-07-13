#!/usr/bin/env node

import chalk from 'chalk'

console.log(chalk.cyan('🌐 Verificando War Room Web...\n'))

async function checkWeb() {
  try {
    const response = await fetch('http://localhost:5173/')
    if (response.ok) {
      console.log(chalk.green('✅ Frontend está rodando!'))
      console.log(chalk.cyan('\n🌐 Para testar o War Room Multi-Agente:'))
      console.log(chalk.white('   http://localhost:5173/warroom'))
      console.log(chalk.gray('\n   A interface agora usa múltiplos especialistas!'))
      console.log(chalk.gray('   Cada pergunta ativa vários agentes relevantes.'))
    } else {
      console.log(chalk.red(`❌ Frontend retornou status: ${response.status}`))
    }
  } catch (error) {
    console.log(chalk.red('❌ Frontend não está acessível'))
    console.log(chalk.yellow('\nExecute: npm run dev'))
  }
}

checkWeb()