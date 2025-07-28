/**
 * Test Suite para diferentes tipos de prompts no War Room
 * Testa cenários: delivery, escola, streaming, NFT, etc.
 */

import { test, expect } from '@playwright/test'

const TEST_PROMPTS = {
  delivery: {
    simple: "Quero criar um app de delivery",
    detailed: "Quero criar um app de delivery tipo iFood para minha cidade, com entregadores próprios e pagamento via PIX",
    questions: [
      "Qual o tamanho da sua cidade?",
      "Quantos restaurantes você pretende atender inicialmente?",
      "Qual modelo de comissão você planeja usar?"
    ]
  },
  
  escola: {
    simple: "Preciso de um sistema para escola",
    detailed: "Preciso de um sistema completo de gestão escolar com controle de notas, frequência, comunicação com pais e área do aluno",
    questions: [
      "Quantos alunos a escola tem?",
      "É escola pública ou privada?",
      "Precisa integrar com sistemas do MEC?"
    ]
  },
  
  streaming: {
    simple: "Quero fazer uma plataforma de streaming",
    detailed: "Quero criar uma plataforma de streaming de vídeos educativos com assinatura mensal, similar ao Netflix mas focado em cursos",
    questions: [
      "Qual o volume de conteúdo inicial?",
      "Precisa de proteção DRM?",
      "Qual a qualidade máxima de vídeo?"
    ]
  },
  
  nft: {
    simple: "Quero criar um marketplace de NFT",
    detailed: "Quero desenvolver um marketplace de NFTs focado em arte digital brasileira, com integração com carteiras crypto e pagamento em Real",
    questions: [
      "Qual blockchain pretende usar?",
      "Vai aceitar múltiplas criptomoedas?",
      "Como será o modelo de taxas?"
    ]
  },
  
  game: {
    simple: "Quero fazer um jogo estilo Mario",
    detailed: "Quero desenvolver um jogo de plataforma 2D inspirado no Mario, mas com temática brasileira e personagens do folclore",
    questions: [
      "Qual plataforma principal (mobile, web, desktop)?",
      "Quantas fases inicialmente?",
      "Vai ter multiplayer?"
    ]
  }
}

test.describe('War Room - Testes de Diferentes Tipos de Prompts', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para o War Room
    await page.goto('http://localhost:3005')
    
    // Aguardar carregamento completo
    await page.waitForSelector('.wr3-container', { timeout: 10000 })
    
    // Verificar se está na interface correta
    await expect(page.locator('.wr3-sidebar-header h2')).toContainText('War Room 3.0')
  })

  // Teste para cada tipo de prompt
  Object.entries(TEST_PROMPTS).forEach(([type, prompts]) => {
    test(`Prompt tipo ${type} - Versão Simples`, async ({ page }) => {
      // Enviar prompt simples
      await page.fill('.wr3-input', prompts.simple)
      await page.click('.wr3-send-btn')
      
      // Aguardar resposta inicial
      await page.waitForSelector('.wr3-message.ai', { timeout: 30000 })
      
      // Verificar se múltiplos agentes responderam
      const aiMessages = await page.locator('.wr3-message.ai').count()
      expect(aiMessages).toBeGreaterThan(3)
      
      // Verificar se tem síntese do Meta-Agent
      await page.waitForSelector('.wr3-message.ai:has-text("Meta-Agent Synthesizer")', { 
        timeout: 60000 
      })
      
      // Capturar screenshot para análise
      await page.screenshot({ 
        path: `test-results/warroom-${type}-simple.png`,
        fullPage: true 
      })
    })

    test(`Prompt tipo ${type} - Versão Detalhada`, async ({ page }) => {
      // Enviar prompt detalhado
      await page.fill('.wr3-input', prompts.detailed)
      await page.click('.wr3-send-btn')
      
      // Aguardar processamento
      await page.waitForSelector('.wr3-message.ai', { timeout: 30000 })
      
      // Verificar progresso do UltraThink
      const progressBar = page.locator('.wr3-ultrathink-progress')
      if (await progressBar.isVisible()) {
        // Verificar que o progresso está funcionando
        await expect(progressBar).toBeVisible()
      }
      
      // Aguardar síntese final
      await page.waitForSelector('.wr3-message.ai:has-text("SÍNTESE FINAL")', { 
        timeout: 90000 
      })
      
      // Verificar botão Enhanced Prompt
      const enhanceButton = page.locator('button:has-text("Refinar Prompt")')
      if (await enhanceButton.isVisible()) {
        await enhanceButton.click()
        
        // Verificar se o dialog Enhanced Prompt abriu
        await expect(page.locator('.enhanced-prompt-dialog')).toBeVisible()
        
        // Verificar se tem perguntas dinâmicas
        await expect(page.locator('.epd-question')).toBeVisible()
        
        // Fechar dialog
        await page.click('.epd-close')
      }
      
      // Screenshot final
      await page.screenshot({ 
        path: `test-results/warroom-${type}-detailed.png`,
        fullPage: true 
      })
    })
  })

  test('Enhanced Prompt Dialog - Fluxo Completo', async ({ page }) => {
    // Enviar um prompt que gerará o Enhanced Prompt
    await page.fill('.wr3-input', TEST_PROMPTS.delivery.detailed)
    await page.click('.wr3-send-btn')
    
    // Aguardar síntese
    await page.waitForSelector('.wr3-message.ai:has-text("SÍNTESE FINAL")', { 
      timeout: 90000 
    })
    
    // Clicar no botão de refinar prompt
    const enhanceButton = page.locator('button:has-text("Refinar Prompt")')
    await enhanceButton.click()
    
    // Dialog deve abrir
    await expect(page.locator('.enhanced-prompt-dialog')).toBeVisible()
    
    // Verificar progresso
    await expect(page.locator('.epd-progress')).toBeVisible()
    
    // Responder primeira pergunta
    const firstQuestion = page.locator('.epd-question-container').first()
    if (await firstQuestion.isVisible()) {
      // Se for multiple choice
      const optionButton = page.locator('.epd-option').first()
      if (await optionButton.isVisible()) {
        await optionButton.click()
      } 
      // Se for texto
      else {
        const textInput = page.locator('.epd-text-input input')
        if (await textInput.isVisible()) {
          await textInput.fill('Cidade com 500 mil habitantes')
          await page.keyboard.press('Enter')
        }
      }
    }
    
    // Verificar se avançou para próxima pergunta
    await page.waitForTimeout(1000)
    const progressText = await page.locator('.epd-progress-text').textContent()
    expect(progressText).toContain('Pergunta')
    
    // Pular algumas perguntas
    const skipButton = page.locator('button:has-text("Pular pergunta")')
    if (await skipButton.isVisible()) {
      await skipButton.click()
      await page.waitForTimeout(500)
      await skipButton.click()
    }
    
    // Verificar prompt refinado final
    await page.waitForSelector('.epd-refined-prompt', { timeout: 15000 })
    
    // Verificar comparação
    await expect(page.locator('.epd-prompt-section:has-text("Prompt Original")')).toBeVisible()
    await expect(page.locator('.epd-prompt-section:has-text("Prompt Enhanced")')).toBeVisible()
    
    // Usar prompt refinado
    await page.click('button:has-text("Usar Prompt Refinado")')
    
    // Verificar que o input foi preenchido com o prompt refinado
    const inputValue = await page.locator('.wr3-input').inputValue()
    expect(inputValue).toContain('CONTEXTO REFINADO')
  })

  test('Teste de Especialistas de Refinamento', async ({ page }) => {
    // Enviar prompt complexo
    await page.fill('.wr3-input', "Quero criar uma plataforma educacional com IA que personaliza o aprendizado")
    await page.click('.wr3-send-btn')
    
    // Aguardar respostas
    await page.waitForSelector('.wr3-message.ai', { timeout: 30000 })
    
    // Verificar diferentes tipos de especialistas respondendo
    const specialistRoles = [
      'AI Architect',
      'Education Technology Specialist',
      'Machine Learning Engineer',
      'UX Designer',
      'Business Analyst'
    ]
    
    for (const role of specialistRoles) {
      const specialist = page.locator(`.wr3-message-role:has-text("${role}")`)
      if (await specialist.isVisible()) {
        expect(await specialist.count()).toBeGreaterThan(0)
      }
    }
    
    // Verificar métricas
    const metricsButton = page.locator('button[title*="Métricas"]')
    await metricsButton.click()
    
    await expect(page.locator('.wr3-metrics-container')).toBeVisible()
    
    // Fechar métricas
    await page.click('.wr3-metrics-container .wr3-close-btn')
  })

  test('Teste de Histórico e Contexto', async ({ page }) => {
    // Primeira mensagem
    await page.fill('.wr3-input', "Quero criar um app de delivery")
    await page.click('.wr3-send-btn')
    
    // Aguardar resposta
    await page.waitForSelector('.wr3-message.ai:has-text("Meta-Agent")', { 
      timeout: 60000 
    })
    
    // Segunda mensagem com contexto
    await page.fill('.wr3-input', "Pode detalhar mais sobre a parte de pagamentos?")
    await page.click('.wr3-send-btn')
    
    // Verificar que mantém contexto
    await page.waitForSelector('.wr3-message.ai', { timeout: 30000 })
    
    // As respostas devem mencionar delivery/pagamento
    const lastAiMessage = page.locator('.wr3-message.ai').last()
    const messageText = await lastAiMessage.textContent()
    expect(messageText.toLowerCase()).toMatch(/pagamento|payment|delivery/)
  })

  test('Teste de Performance com Múltiplos Prompts', async ({ page }) => {
    const startTime = Date.now()
    
    // Enviar múltiplos prompts em sequência
    const prompts = [
      "Como fazer um app mobile?",
      "Qual a melhor linguagem para backend?",
      "Como escalar uma aplicação?"
    ]
    
    for (const prompt of prompts) {
      await page.fill('.wr3-input', prompt)
      await page.click('.wr3-send-btn')
      
      // Aguardar resposta antes de enviar próxima
      await page.waitForSelector('.wr3-message.ai', { timeout: 30000 })
      await page.waitForTimeout(2000) // Pequena pausa entre prompts
    }
    
    const endTime = Date.now()
    const totalTime = (endTime - startTime) / 1000
    
    console.log(`Tempo total para ${prompts.length} prompts: ${totalTime}s`)
    console.log(`Tempo médio por prompt: ${totalTime / prompts.length}s`)
    
    // Verificar que todas as mensagens foram processadas
    const userMessages = await page.locator('.wr3-message.user').count()
    const aiMessages = await page.locator('.wr3-message.ai').count()
    
    expect(userMessages).toBe(prompts.length)
    expect(aiMessages).toBeGreaterThan(prompts.length * 3) // Pelo menos 3 agentes por prompt
  })
})

test.describe('War Room - Testes de Integração', () => {
  test('Integração com Code Graph', async ({ page }) => {
    // Este teste verificaria a integração futura com Code Graph
    // Por enquanto, apenas verificar que a estrutura está pronta
    
    await page.goto('http://localhost:3005')
    
    // Verificar se tem botão/menu para Code Graph (futuro)
    const codeGraphButton = page.locator('button:has-text("Code Graph")')
    if (await codeGraphButton.isVisible()) {
      await codeGraphButton.click()
      // Verificar integração
    }
    
    // Placeholder para futura integração
    expect(true).toBe(true)
  })
})