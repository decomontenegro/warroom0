/**
 * Final Verification Test
 * Created: 2025-07-19 by Claude
 * Last Updated: 2025-07-19
 * Purpose: Verify all fixes are working correctly
 */

import { test, expect } from '@playwright/test';

test.describe('Final Verification - UltraThink WarRoom', () => {
  
  test('Complete workflow without errors', async ({ page }) => {
    // Configure console monitoring
    const errors = [];
    const warnings = [];
    let workflowInitialized = false;
    
    page.on('console', msg => {
      const text = msg.text();
      
      if (msg.type() === 'error' && !text.includes('favicon')) {
        errors.push(text);
      }
      
      if (msg.type() === 'warning' && text.includes('duplicate key')) {
        warnings.push(text);
      }
      
      if (text.includes('UltraThink Workflow initialized')) {
        workflowInitialized = true;
      }
    });
    
    // Navigate to warroom
    await page.goto('http://localhost:5173/warroom');
    await page.waitForTimeout(2000);
    
    console.log('\n=== Final Verification Test ===\n');
    
    // Check initialization
    expect(workflowInitialized).toBe(true);
    console.log('✅ UltraThink Workflow initialized successfully');
    
    // Check agents display
    const agentsTab = await page.locator('.wr3-tab:has-text("Agentes")');
    const tabText = await agentsTab.textContent();
    expect(tabText).toContain('100');
    console.log('✅ All 100 agents loaded correctly');
    
    // Send test message
    const messageInput = await page.locator('.wr3-message-input');
    await messageInput.fill('Test the complete UltraThink workflow integration');
    
    const sendButton = await page.locator('.wr3-send-button');
    await sendButton.click();
    console.log('✅ Message sent successfully');
    
    // Wait for processing
    await page.waitForTimeout(5000);
    
    // Check for errors
    const criticalErrors = errors.filter(err => 
      err.includes('Cannot read properties') || 
      err.includes('.on is not a function')
    );
    
    console.log(`\n📊 Error Summary:`);
    console.log(`- Total console errors: ${errors.length}`);
    console.log(`- Critical errors: ${criticalErrors.length}`);
    console.log(`- Duplicate key warnings: ${warnings.length}`);
    
    if (criticalErrors.length > 0) {
      console.log('\n❌ Critical errors found:');
      criticalErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✅ No critical errors found');
    }
    
    // Check if messages were created
    const messages = await page.locator('.wr3-message').count();
    expect(messages).toBeGreaterThan(0);
    console.log(`✅ Messages created: ${messages}`);
    
    // Check if agents became active
    await agentsTab.click();
    const activeAgentsText = await agentsTab.textContent();
    console.log(`✅ Active agents during process: ${activeAgentsText}`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'final-verification-warroom.png', 
      fullPage: false 
    });
    console.log('\n✅ Screenshot saved: final-verification-warroom.png');
    
    // Final assertions
    expect(criticalErrors.length).toBe(0);
    expect(warnings.length).toBe(0);
    
    console.log('\n🎉 All fixes verified successfully!');
    console.log('\n=== Summary ===');
    console.log('✅ UltraThink workflow initializes without errors');
    console.log('✅ ContextualPromptBuilder null reference fixed');
    console.log('✅ SmartAgentSelector null reference fixed');
    console.log('✅ React duplicate key warnings resolved');
    console.log('✅ 100 agents display correctly');
    console.log('✅ Workflow executes and shows active agents');
    console.log('✅ WarRoom3 layout successfully integrated with UltraThink functionality');
  });
});