import { test, expect } from '@playwright/test';

test.describe('WarRoom3 Complete', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página do WarRoom3
    await page.goto('http://localhost:5174/warroom3');
    
    // Aguardar a página carregar completamente
    await page.waitForSelector('.warroom3-container');
  });

  test('deve carregar a página corretamente', async ({ page }) => {
    // Verificar se o título está presente
    await expect(page.locator('.wr3-sidebar-header h2')).toContainText('War Room 3.0');
    
    // Verificar se a sidebar está visível
    await expect(page.locator('.wr3-sidebar')).toBeVisible();
    
    // Verificar se a área de chat está visível
    await expect(page.locator('.wr3-chat-area')).toBeVisible();
  });

  test('deve alternar entre idiomas', async ({ page }) => {
    // Selecionar o dropdown de idiomas
    const languageSelect = page.locator('.wr3-language-select');
    
    // Mudar para inglês
    await languageSelect.selectOption('en-US');
    await expect(page.locator('.wr3-control-btn').first()).toContainText('Network View');
    
    // Mudar para espanhol
    await languageSelect.selectOption('es-ES');
    await expect(page.locator('.wr3-control-btn').first()).toContainText('Ver Red');
    
    // Voltar para português
    await languageSelect.selectOption('pt-BR');
    await expect(page.locator('.wr3-control-btn').first()).toContainText('Ver Rede');
  });

  test('deve abrir e fechar o painel de rede', async ({ page }) => {
    // Clicar no botão Ver Rede
    await page.locator('.wr3-control-btn').first().click();
    
    // Verificar se o overlay apareceu
    await expect(page.locator('.wr3-network-overlay')).toBeVisible();
    
    // Verificar se o painel de rede está visível
    await expect(page.locator('.wr3-network-panel')).toBeVisible();
    
    // Verificar se o graph está centralizado
    const networkPanel = page.locator('.wr3-network-panel');
    const box = await networkPanel.boundingBox();
    const viewport = page.viewportSize();
    
    // Verificar se está aproximadamente centralizado
    expect(Math.abs(box.x + box.width/2 - viewport.width/2)).toBeLessThan(50);
    expect(Math.abs(box.y + box.height/2 - viewport.height/2)).toBeLessThan(50);
    
    // Fechar clicando no X (force click para evitar interceptação)
    await page.locator('.wr3-close-panel').click({ force: true });
    await expect(page.locator('.wr3-network-overlay')).not.toBeVisible();
  });

  test('deve mostrar/ocultar métricas', async ({ page }) => {
    // Clicar no botão Métricas
    await page.locator('.wr3-control-btn').nth(1).click();
    
    // Verificar se o painel de métricas apareceu
    await expect(page.locator('.wr3-metrics-panel')).toBeVisible();
    
    // Verificar se as métricas estão corretas
    await expect(page.locator('.wr3-metric-value').first()).toContainText('100');
    
    // Clicar novamente para ocultar
    await page.locator('.wr3-control-btn').nth(1).click();
    await expect(page.locator('.wr3-metrics-panel')).not.toBeVisible();
  });

  test('deve enviar mensagem no chat', async ({ page }) => {
    // Digitar mensagem
    const input = page.locator('.wr3-input');
    await input.fill('Olá, esta é uma mensagem de teste!');
    
    // Enviar mensagem
    await page.locator('.wr3-send-btn').click();
    
    // Verificar se a mensagem do usuário apareceu
    await expect(page.locator('.wr3-message.user').last()).toContainText('Olá, esta é uma mensagem de teste!');
    
    // Aguardar resposta do AI (simulada)
    await page.waitForSelector('.wr3-message.ai', { timeout: 3000 });
    
    // Verificar se a resposta apareceu
    await expect(page.locator('.wr3-message.ai').last()).toBeVisible();
  });

  test('deve filtrar especialistas', async ({ page }) => {
    // Digitar no campo de busca
    const searchInput = page.locator('.wr3-search-input');
    await searchInput.fill('Chief');
    
    // Aguardar filtro ser aplicado
    await page.waitForTimeout(500);
    
    // Verificar se apenas especialistas com "Chief" aparecem
    const specialists = page.locator('.wr3-specialist-item');
    const count = await specialists.count();
    
    // Deve ter menos especialistas após filtrar
    expect(count).toBeLessThan(20);
    
    // Verificar se todos contêm "Chief"
    for (let i = 1; i < count; i++) { // Pular o primeiro que é "Todos"
      const text = await specialists.nth(i).textContent();
      expect(text.toLowerCase()).toContain('chief');
    }
  });

  test('deve ser responsivo em mobile', async ({ page }) => {
    // Redimensionar para tamanho mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Aguardar um pouco para aplicar estilos responsivos
    await page.waitForTimeout(500);
    
    // Verificar se a sidebar está empilhada
    const viewportSize = page.viewportSize();
    const sidebarBox = await page.locator('.wr3-sidebar').boundingBox();
    
    // Em mobile, sidebar deve ocupar toda largura da viewport (com tolerância)
    expect(Math.abs(sidebarBox.width - viewportSize.width)).toBeLessThan(50);
    
    // Verificar se o painel de rede em mobile aparece na parte inferior
    await page.locator('.wr3-control-btn').first().click();
    await page.waitForSelector('.wr3-network-panel');
    const networkPanel = page.locator('.wr3-network-panel');
    const networkBox = await networkPanel.boundingBox();
    
    // Verificar se o painel está visível e ocupando espaço significativo
    expect(networkBox.height).toBeGreaterThan(200); // Altura mínima razoável
    expect(Math.abs(networkBox.width - viewportSize.width)).toBeLessThan(80); // Largura aproximada
    expect(networkBox.y).toBeGreaterThan(100); // Não deve estar no topo
  });

  test('deve manter o graph interativo', async ({ page }) => {
    // Abrir o painel de rede
    await page.locator('.wr3-control-btn').first().click();
    await page.waitForSelector('.wr3-network-panel');
    
    // Verificar se o SVG do graph está presente
    await expect(page.locator('.wr3-network-content svg')).toBeVisible();
    
    // Verificar se o cursor muda para grab
    const svg = page.locator('.wr3-network-content svg');
    const cursor = await svg.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('grab');
    
    // Simular drag no graph
    const svgBox = await svg.boundingBox();
    await page.mouse.move(svgBox.x + svgBox.width/2, svgBox.y + svgBox.height/2);
    await page.mouse.down();
    await page.mouse.move(svgBox.x + svgBox.width/2 + 50, svgBox.y + svgBox.height/2 + 50);
    await page.mouse.up();
    
    // Graph ainda deve estar visível após interação
    await expect(svg).toBeVisible();
  });
});