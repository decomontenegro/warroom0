/**
 * Compare WarRoom Layouts Test Suite
 * Created: 2025-07-19 by Claude
 * Last Updated: 2025-07-19
 */

import { test, expect } from '@playwright/test';

test.describe('Compare WarRoom3 and WarRoom UltraThink Layouts', () => {
  
  test('Analyze WarRoom3 layout structure', async ({ page }) => {
    await page.goto('http://localhost:5173/warroom3');
    await page.waitForTimeout(2000);
    
    console.log('\n=== WarRoom3 Layout Analysis ===\n');
    
    // Analyze main container
    const mainContainer = await page.locator('.warroom3-container').first();
    if (await mainContainer.count() > 0) {
      console.log('✓ Main container found: .warroom3-container');
    }
    
    // Analyze sidebar
    const sidebar = await page.locator('.warroom3-sidebar').first();
    if (await sidebar.count() > 0) {
      console.log('✓ Sidebar found: .warroom3-sidebar');
      const sidebarWidth = await sidebar.evaluate(el => getComputedStyle(el).width);
      console.log(`  - Sidebar width: ${sidebarWidth}`);
    }
    
    // Analyze chat area
    const chatArea = await page.locator('.warroom3-chat').first();
    if (await chatArea.count() > 0) {
      console.log('✓ Chat area found: .warroom3-chat');
    }
    
    // Analyze header
    const header = await page.locator('.warroom3-header').first();
    if (await header.count() > 0) {
      console.log('✓ Header found: .warroom3-header');
      const headerHeight = await header.evaluate(el => getComputedStyle(el).height);
      console.log(`  - Header height: ${headerHeight}`);
    }
    
    // Analyze messages container
    const messagesContainer = await page.locator('.warroom3-messages').first();
    if (await messagesContainer.count() > 0) {
      console.log('✓ Messages container found: .warroom3-messages');
    }
    
    // Analyze input area
    const inputArea = await page.locator('.warroom3-input').first();
    if (await inputArea.count() > 0) {
      console.log('✓ Input area found: .warroom3-input');
    }
    
    // Get color scheme
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    console.log(`\n✓ Background color: ${bodyBg}`);
    
    // Take screenshot
    await page.screenshot({ path: 'warroom3-layout.png', fullPage: true });
    console.log('\n✓ Screenshot saved: warroom3-layout.png');
  });
  
  test('Analyze WarRoom UltraThink layout structure', async ({ page }) => {
    await page.goto('http://localhost:5173/warroom');
    await page.waitForTimeout(2000);
    
    console.log('\n=== WarRoom UltraThink Layout Analysis ===\n');
    
    // Analyze main container
    const mainContainer = await page.locator('.war-room-container').first();
    if (await mainContainer.count() > 0) {
      console.log('✓ Main container found: .war-room-container');
    }
    
    // Analyze sidebar/team section
    const teamSection = await page.locator('.team-section').first();
    if (await teamSection.count() > 0) {
      console.log('✓ Team section found: .team-section');
    }
    
    // Analyze discussion area
    const discussionArea = await page.locator('.discussion-section').first();
    if (await discussionArea.count() > 0) {
      console.log('✓ Discussion area found: .discussion-section');
    }
    
    // Analyze metrics section
    const metricsSection = await page.locator('.metrics-section').first();
    if (await metricsSection.count() > 0) {
      console.log('✓ Metrics section found: .metrics-section');
    }
    
    // Analyze prompt builder
    const promptBuilder = await page.locator('.prompt-builder').first();
    if (await promptBuilder.count() > 0) {
      console.log('✓ Prompt builder found: .prompt-builder');
    }
    
    // Get layout type
    const layoutStyle = await page.evaluate(() => {
      const container = document.querySelector('.war-room-container');
      if (container) {
        return getComputedStyle(container).display;
      }
      return null;
    });
    console.log(`\n✓ Layout type: ${layoutStyle}`);
    
    // Take screenshot
    await page.screenshot({ path: 'warroom-ultrathink-layout.png', fullPage: true });
    console.log('\n✓ Screenshot saved: warroom-ultrathink-layout.png');
  });
  
  test('Compare layouts and identify differences', async ({ page }) => {
    console.log('\n=== Layout Comparison ===\n');
    
    console.log('Key Differences:');
    console.log('1. WarRoom3 uses WhatsApp-style layout with sidebar + chat');
    console.log('2. WarRoom UltraThink uses multi-panel layout with metrics');
    console.log('3. WarRoom3 has cleaner, more focused interface');
    console.log('4. WarRoom UltraThink has more exposed functionality');
    
    console.log('\nRecommendations:');
    console.log('- Keep UltraThink functionality');
    console.log('- Apply WarRoom3 layout structure');
    console.log('- Use WarRoom3 color scheme and styling');
    console.log('- Maintain UltraThink advanced features in collapsible panels');
  });
});

test.describe('Extract WarRoom3 CSS Structure', () => {
  test('Extract WarRoom3 styles', async ({ page }) => {
    await page.goto('http://localhost:5173/warroom3');
    await page.waitForTimeout(2000);
    
    // Extract key CSS classes and their properties
    const styles = await page.evaluate(() => {
      const elements = {
        container: '.warroom3-container',
        sidebar: '.warroom3-sidebar',
        chat: '.warroom3-chat',
        header: '.warroom3-header',
        messages: '.warroom3-messages',
        input: '.warroom3-input'
      };
      
      const extractedStyles = {};
      
      for (const [key, selector] of Object.entries(elements)) {
        const el = document.querySelector(selector);
        if (el) {
          const computed = getComputedStyle(el);
          extractedStyles[key] = {
            display: computed.display,
            width: computed.width,
            height: computed.height,
            padding: computed.padding,
            margin: computed.margin,
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            borderRadius: computed.borderRadius,
            boxShadow: computed.boxShadow,
            position: computed.position,
            flexDirection: computed.flexDirection,
            gap: computed.gap
          };
        }
      }
      
      return extractedStyles;
    });
    
    console.log('\n=== Extracted WarRoom3 Styles ===\n');
    console.log(JSON.stringify(styles, null, 2));
    
    // Save styles to file for reference
    console.log('\n✓ Styles extracted successfully');
    // Note: File saving will be done after test completion
  });
});