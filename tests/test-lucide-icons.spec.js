/**
 * Test Lucide Icons Integration
 * Created: 2025-07-19
 * Purpose: Verify Lucide icons are working in WarRoom
 */

import { test, expect } from '@playwright/test';

test.describe('Lucide Icons in WarRoom', () => {
  
  test('Icons should render correctly', async ({ page }) => {
    // Navigate to warroom
    await page.goto('http://localhost:5173/warroom');
    await page.waitForTimeout(2000);
    
    console.log('\n=== Testing Lucide Icons ===\n');
    
    // Check header icons
    const trashIcon = await page.locator('button[title="Limpar conversa"] svg').first();
    await expect(trashIcon).toBeVisible();
    console.log('✓ Trash icon visible');
    
    const downloadIcon = await page.locator('button[title="Exportar análise"] svg').first();
    await expect(downloadIcon).toBeVisible();
    console.log('✓ Download icon visible');
    
    // Check feature card icons
    const usersIcon = await page.locator('.wr3-feature-card svg').first();
    await expect(usersIcon).toBeVisible();
    console.log('✓ Users icon in feature card visible');
    
    // Check send button icon
    const sendButton = await page.locator('.wr3-send-button svg');
    await expect(sendButton).toBeVisible();
    console.log('✓ Send button icon visible');
    
    // Type message and check loading icon
    const messageInput = await page.locator('.wr3-message-input');
    await messageInput.fill('test icons');
    
    await page.locator('.wr3-send-button').click();
    
    // Check if loading icon appears
    await page.waitForTimeout(500);
    const loadingIcon = await page.locator('.wr3-spin');
    if (await loadingIcon.count() > 0) {
      console.log('✓ Loading icon animation working');
    }
    
    // Check sidebar control buttons
    const networkBtn = await page.locator('button[title="Agent Network Map"] svg');
    await expect(networkBtn).toBeVisible();
    console.log('✓ Network icon visible');
    
    const editBtn = await page.locator('button[title="Prompt Builder"] svg');
    await expect(editBtn).toBeVisible();
    console.log('✓ Edit icon visible');
    
    const chartBtn = await page.locator('button[title="Analysis Metrics"] svg');
    await expect(chartBtn).toBeVisible();
    console.log('✓ BarChart icon visible');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'warroom-lucide-icons.png', 
      fullPage: false 
    });
    console.log('\n✓ Screenshot saved: warroom-lucide-icons.png');
    
    console.log('\n🎉 All Lucide icons are working correctly!');
  });
});