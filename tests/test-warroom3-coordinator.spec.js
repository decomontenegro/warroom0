/**
 * Test WarRoom3 with Coordinator
 * Created: 2025-07-19
 * Purpose: Verify coordinator and hierarchy are working
 */

import { test, expect } from '@playwright/test';

test.describe('WarRoom3 Coordinator Integration', () => {
  
  test('Coordinator should orchestrate the workflow', async ({ page }) => {
    // Navigate to warroom
    await page.goto('http://localhost:5173/warroom');
    await page.waitForTimeout(2000);
    
    console.log('\n=== Testing WarRoom3 Coordinator ===\n');
    
    // Type a test message
    const messageInput = await page.locator('.wr3-message-input');
    await messageInput.fill('teste do sistema coordenado');
    
    // Send message
    const sendButton = await page.locator('.wr3-send-button');
    await sendButton.click();
    
    // Wait for processing
    await page.waitForTimeout(3000);
    
    // Check for coordinator messages
    const coordinatorMessages = await page.locator('.wr3-message-coordinator').count();
    console.log(`✓ Coordinator messages found: ${coordinatorMessages}`);
    expect(coordinatorMessages).toBeGreaterThan(0);
    
    // Check if first coordinator message exists
    const firstCoordMessage = await page.locator('.wr3-coordinator-name').first();
    if (await firstCoordMessage.count() > 0) {
      const coordName = await firstCoordMessage.textContent();
      console.log(`✓ Coordinator identified: ${coordName}`);
      expect(coordName).toContain('Coordenador');
    }
    
    // Check for Lead Architect
    const agentMessages = await page.locator('.wr3-agent-name');
    const firstAgentName = await agentMessages.first().textContent();
    console.log(`✓ First agent to speak: ${firstAgentName}`);
    expect(firstAgentName).toBe('Lead Architect');
    
    // Check message persistence (scroll)
    const messagesArea = await page.locator('.wr3-messages-area');
    const hasOverflow = await messagesArea.evaluate(el => {
      return el.scrollHeight > el.clientHeight;
    });
    console.log(`✓ Messages area scrollable: ${hasOverflow}`);
    
    // Count total messages
    const totalMessages = await page.locator('.wr3-message').count();
    console.log(`✓ Total messages in chat: ${totalMessages}`);
    expect(totalMessages).toBeGreaterThan(5);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'warroom3-coordinator-test.png', 
      fullPage: false 
    });
    console.log('\n✓ Screenshot saved: warroom3-coordinator-test.png');
    
    console.log('\n🎉 WarRoom3 Coordinator is working correctly!');
  });
  
  test('Messages should persist and not disappear', async ({ page }) => {
    await page.goto('http://localhost:5173/warroom');
    await page.waitForTimeout(2000);
    
    console.log('\n=== Testing Message Persistence ===\n');
    
    // Send multiple messages
    const messageInput = await page.locator('.wr3-message-input');
    const sendButton = await page.locator('.wr3-send-button');
    
    // First message
    await messageInput.fill('primeira mensagem');
    await sendButton.click();
    await page.waitForTimeout(2000);
    
    const firstCount = await page.locator('.wr3-message').count();
    console.log(`✓ Messages after first prompt: ${firstCount}`);
    
    // Second message
    await messageInput.fill('segunda mensagem');
    await sendButton.click();
    await page.waitForTimeout(5000);
    
    const secondCount = await page.locator('.wr3-message').count();
    console.log(`✓ Messages after second prompt: ${secondCount}`);
    
    // Verify messages increased (not replaced)
    expect(secondCount).toBeGreaterThan(firstCount);
    console.log('✅ Messages are persisting correctly!');
  });
});