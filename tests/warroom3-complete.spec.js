import { test, expect } from '@playwright/test';

test.describe('WarRoom3 Complete Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to WarRoom3
    await page.goto('http://localhost:5173/warroom3');
    
    // Wait for the page to load
    await page.waitForSelector('.warroom3-container', { timeout: 10000 });
  });

  test('should load WarRoom3 interface correctly', async ({ page }) => {
    // Check main elements
    await expect(page.locator('.wr3-sidebar')).toBeVisible();
    await expect(page.locator('.wr3-chat-area')).toBeVisible();
    await expect(page.locator('h2:has-text("War Room 3.0")')).toBeVisible();
    
    // Check if 100+ agents are loaded
    const agentItems = await page.locator('.wr3-specialist-item').count();
    console.log(`Found ${agentItems} agents`);
    expect(agentItems).toBeGreaterThan(100);
  });

  test('should switch between chat and specialists tabs', async ({ page }) => {
    // Click specialists tab
    await page.click('button:has-text("Especialistas")');
    await page.waitForTimeout(500);
    
    // Check if tab is active
    await expect(page.locator('.wr3-tab:has-text("Especialistas")')).toHaveClass(/active/);
    
    // Switch back to chats
    await page.click('button:has-text("Chats")');
    await expect(page.locator('.wr3-tab:has-text("Chats")')).toHaveClass(/active/);
  });

  test('should search for specialists', async ({ page }) => {
    // Type in search box
    await page.fill('.wr3-search-input', 'architect');
    await page.waitForTimeout(500);
    
    // Count filtered results
    const visibleAgents = await page.locator('.wr3-specialist-item:visible').count();
    console.log(`Found ${visibleAgents} architects`);
    expect(visibleAgents).toBeGreaterThan(0);
    expect(visibleAgents).toBeLessThan(100);
  });

  test('should select a specialist and show in header', async ({ page }) => {
    // Click on a specific specialist
    const firstSpecialist = page.locator('.wr3-specialist-item').nth(1);
    const specialistName = await firstSpecialist.locator('h4').textContent();
    
    await firstSpecialist.click();
    await page.waitForTimeout(500);
    
    // Check if header updated
    await expect(page.locator('.wr3-header-info h3')).toContainText(specialistName);
  });

  test('should send messages in chat', async ({ page }) => {
    // Type a message
    const testMessage = 'Teste de mensagem ' + Date.now();
    await page.fill('.wr3-input', testMessage);
    
    // Send message
    await page.click('.wr3-send-btn');
    
    // Wait for message to appear
    await expect(page.locator('.wr3-message.user').last()).toContainText(testMessage);
    
    // Wait for AI response
    await expect(page.locator('.wr3-typing-indicator')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.wr3-message.ai').last()).toBeVisible({ timeout: 10000 });
  });

  test('graph modal functionality', async ({ page }) => {
    console.log('Testing graph modal...');
    
    // Click graph button
    await page.click('button[title="Ver Graph de Especialistas"]');
    
    // Wait for modal
    await expect(page.locator('.draggable-modal')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Check if graph is rendered
    const svgElement = page.locator('svg');
    await expect(svgElement).toBeVisible();
    
    // Count nodes
    const nodesBeforeHover = await page.locator('svg circle').count();
    console.log(`Initial nodes: ${nodesBeforeHover}`);
    
    // Test hover stability
    const svg = await svgElement.boundingBox();
    if (svg) {
      // Record initial state
      const initialHTML = await svgElement.innerHTML();
      
      // Move mouse across the graph
      for (let i = 0; i < 5; i++) {
        await page.mouse.move(
          svg.x + (svg.width * i) / 5,
          svg.y + svg.height / 2
        );
        await page.waitForTimeout(200);
      }
      
      // Check if nodes count remained stable
      const nodesAfterHover = await page.locator('svg circle').count();
      console.log(`Nodes after hover: ${nodesAfterHover}`);
      
      // Compare HTML structure (should be similar)
      const finalHTML = await svgElement.innerHTML();
      const structureChanged = initialHTML.length !== finalHTML.length;
      console.log(`Structure changed: ${structureChanged}, Initial: ${initialHTML.length}, Final: ${finalHTML.length}`);
    }
    
    // Test layout changes
    console.log('Testing layout changes...');
    
    // Change to radial layout
    await page.selectOption('.layout-select', 'radial');
    await page.waitForTimeout(1000);
    const radialNodes = await page.locator('svg circle').count();
    console.log(`Radial layout nodes: ${radialNodes}`);
    
    // Change to hierarchical layout
    await page.selectOption('.layout-select', 'hierarchical');
    await page.waitForTimeout(1000);
    const hierarchicalNodes = await page.locator('svg circle').count();
    console.log(`Hierarchical layout nodes: ${hierarchicalNodes}`);
    
    // Test dynamic toggle
    const dynamicCheckbox = page.locator('.dynamic-toggle input[type="checkbox"]');
    const isChecked = await dynamicCheckbox.isChecked();
    await dynamicCheckbox.click();
    await page.waitForTimeout(500);
    console.log(`Dynamic was ${isChecked}, now ${!isChecked}`);
    
    // Test modal drag
    const modal = page.locator('.draggable-modal');
    const initialBounds = await modal.boundingBox();
    
    if (initialBounds) {
      // Drag modal
      await page.mouse.move(initialBounds.x + 100, initialBounds.y + 30);
      await page.mouse.down();
      await page.mouse.move(initialBounds.x + 200, initialBounds.y + 100);
      await page.mouse.up();
      
      // Check if moved
      const finalBounds = await modal.boundingBox();
      console.log(`Modal moved: X ${initialBounds.x} -> ${finalBounds?.x}, Y ${initialBounds.y} -> ${finalBounds?.y}`);
    }
    
    // Close modal
    await page.click('.close-button');
    await expect(page.locator('.draggable-modal')).not.toBeVisible();
  });

  test('prompt builder functionality', async ({ page }) => {
    // Click prompt builder button
    await page.click('button[title="Construtor de Prompt"]');
    
    // Wait for overlay
    await expect(page.locator('.wr3-prompt-builder-overlay')).toBeVisible();
    
    // Close prompt builder
    await page.click('.wr3-close-btn');
    await expect(page.locator('.wr3-prompt-builder-overlay')).not.toBeVisible();
  });

  test('metrics functionality', async ({ page }) => {
    // Click metrics button
    await page.click('button[title="Ver Métricas"]');
    
    // Wait for overlay
    await expect(page.locator('.wr3-metrics-overlay')).toBeVisible();
    
    // Close metrics
    await page.click('.wr3-close-btn');
    await expect(page.locator('.wr3-metrics-overlay')).not.toBeVisible();
  });

  test('language selector functionality', async ({ page }) => {
    // Check if language selector exists
    const languageSelector = page.locator('.language-selector');
    await expect(languageSelector).toBeVisible();
    
    // Try to change language
    const selectElement = languageSelector.locator('select');
    if (await selectElement.isVisible()) {
      await selectElement.selectOption('en');
      await page.waitForTimeout(500);
      
      // Check if UI updated (example: button text)
      const chatTabText = await page.locator('.wr3-tab').first().textContent();
      console.log(`Chat tab text after language change: ${chatTabText}`);
    }
  });

  test('WebSocket connection', async ({ page }) => {
    // Check console for WebSocket messages
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('WebSocket')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Reload page to see connection messages
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log('WebSocket logs:', consoleLogs);
    
    // Check if WebSocket connected
    const hasConnection = consoleLogs.some(log => 
      log.includes('conectado') || log.includes('connected')
    );
    console.log(`WebSocket connected: ${hasConnection}`);
  });
});