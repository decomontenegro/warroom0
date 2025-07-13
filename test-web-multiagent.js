#!/usr/bin/env node

import puppeteer from 'puppeteer'
import chalk from 'chalk'

console.log(chalk.cyan('🌐 Testando War Room Multi-Agente Web...\n'))

async function testWebInterface() {
  try {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    
    // Navegar para a página
    await page.goto('http://localhost:5173/warroom', { waitUntil: 'networkidle2' })
    
    // Verificar título
    const title = await page.title()
    console.log(chalk.green('✓ Página carregada'))
    console.log(chalk.gray(`  Título: ${title}`))
    
    // Verificar se existe o header
    const headerText = await page.$eval('h1', el => el.textContent)
    console.log(chalk.gray(`  Header: ${headerText}`))
    
    // Tirar screenshot
    await page.screenshot({ path: 'warroom-web-test.png' })
    console.log(chalk.green('✓ Screenshot salvo: warroom-web-test.png'))
    
    await browser.close()
    console.log(chalk.green('\n✅ Interface web está funcionando!'))
    
  } catch (error) {
    console.log(chalk.red('❌ Erro ao testar interface web:'), error.message)
    console.log(chalk.yellow('\nVerifique se:'))
    console.log(chalk.gray('  1. O servidor está rodando: npm run dev'))
    console.log(chalk.gray('  2. A porta 5173 está disponível'))
  }
}

// Teste alternativo sem puppeteer
async function simpleTest() {
  console.log(chalk.yellow('\nTeste simples (sem puppeteer):\n'))
  
  try {
    const response = await fetch('http://localhost:5173/')
    if (response.ok) {
      console.log(chalk.green('✅ Frontend está respondendo na porta 5173'))
      console.log(chalk.cyan('\n🌐 Acesse: http://localhost:5173/warroom'))
      console.log(chalk.gray('   Para testar a interface multi-agente'))
    } else {
      console.log(chalk.red('❌ Frontend não está respondendo'))
    }
  } catch (error) {
    console.log(chalk.red('❌ Erro ao conectar no frontend:'), error.message)
  }
}

// Tentar com puppeteer primeiro, fallback para teste simples
import('puppeteer').then(() => {
  testWebInterface()
}).catch(() => {
  console.log(chalk.yellow('Puppeteer não instalado, executando teste simples...'))
  simpleTest()
})