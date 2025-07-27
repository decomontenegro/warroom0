/**
 * Analyze WarRoom Components Test Suite
 * Created: 2025-07-19 by Claude
 * Last Updated: 2025-07-19
 */

import { test, expect } from '@playwright/test';

test.describe('Analyze WarRoom Components Structure', () => {
  
  test('Extract WarRoom3 component structure and styles', async ({ page }) => {
    await page.goto('http://localhost:5173/warroom3');
    await page.waitForTimeout(3000);
    
    console.log('\n=== WarRoom3 Component Analysis ===\n');
    
    // Extract all relevant classes and structure
    const structure = await page.evaluate(() => {
      const container = document.querySelector('.warroom3-container');
      if (!container) return null;
      
      const extractStructure = (element) => {
        const classes = Array.from(element.classList);
        const tag = element.tagName.toLowerCase();
        const children = Array.from(element.children).map(child => extractStructure(child));
        
        return {
          tag,
          classes,
          children: children.filter(c => c !== null)
        };
      };
      
      return extractStructure(container);
    });
    
    console.log('Component Structure:');
    console.log(JSON.stringify(structure, null, 2));
    
    // Extract key measurements
    const measurements = await page.evaluate(() => {
      const sidebar = document.querySelector('.wr3-sidebar');
      const chatArea = document.querySelector('.wr3-chat-area');
      const header = document.querySelector('.wr3-chat-header');
      
      const getMeasurements = (el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const styles = getComputedStyle(el);
        return {
          width: rect.width + 'px',
          height: rect.height + 'px',
          padding: styles.padding,
          margin: styles.margin,
          background: styles.background
        };
      };
      
      return {
        sidebar: getMeasurements(sidebar),
        chatArea: getMeasurements(chatArea),
        header: getMeasurements(header)
      };
    });
    
    console.log('\nKey Measurements:');
    console.log(JSON.stringify(measurements, null, 2));
  });
  
  test('Extract WarRoom (UltraThink) component structure', async ({ page }) => {
    await page.goto('http://localhost:5173/warroom');
    await page.waitForTimeout(3000);
    
    console.log('\n=== WarRoom (UltraThink) Component Analysis ===\n');
    
    // Extract all relevant classes and structure
    const structure = await page.evaluate(() => {
      // Look for main container - could be different class names
      const possibleContainers = [
        '.war-room-container',
        '.warroom-whatsapp',
        '.warroom-container',
        '[class*="warroom"]',
        '#root > div'
      ];
      
      let container = null;
      for (const selector of possibleContainers) {
        container = document.querySelector(selector);
        if (container) break;
      }
      
      if (!container) return { error: 'No container found' };
      
      const extractStructure = (element) => {
        const classes = Array.from(element.classList);
        const tag = element.tagName.toLowerCase();
        const id = element.id;
        const children = Array.from(element.children).slice(0, 3).map(child => extractStructure(child));
        
        return {
          tag,
          id,
          classes,
          childrenCount: element.children.length,
          children: children
        };
      };
      
      return extractStructure(container);
    });
    
    console.log('Component Structure:');
    console.log(JSON.stringify(structure, null, 2));
    
    // Find UltraThink specific elements
    const ultrathinkElements = await page.evaluate(() => {
      const elements = {};
      
      // Look for UltraThink related elements
      const selectors = {
        promptBuilder: '.prompt-builder',
        agentProgress: '.agent-progress',
        networkMap: '.agent-network-map',
        metrics: '.analysis-metrics',
        phases: '[class*="phase"]',
        consensus: '[class*="consensus"]'
      };
      
      for (const [key, selector] of Object.entries(selectors)) {
        const el = document.querySelector(selector);
        elements[key] = el ? { 
          exists: true, 
          classes: Array.from(el.classList),
          visible: el.offsetWidth > 0 && el.offsetHeight > 0
        } : { exists: false };
      }
      
      return elements;
    });
    
    console.log('\nUltraThink Elements:');
    console.log(JSON.stringify(ultrathinkElements, null, 2));
  });
  
  test('Generate migration plan', async ({ page }) => {
    console.log('\n=== Migration Plan ===\n');
    
    console.log('1. Layout Structure:');
    console.log('   - Apply WarRoom3 flex container structure');
    console.log('   - Implement sidebar (400px) + chat area layout');
    console.log('   - Use WarRoom3 color scheme (#0D1117 background)');
    
    console.log('\n2. Component Organization:');
    console.log('   - Move agent list to sidebar');
    console.log('   - Keep UltraThink features in chat area');
    console.log('   - Add collapsible panels for advanced features');
    
    console.log('\n3. Style Migration:');
    console.log('   - Import WarRoom3.css structure');
    console.log('   - Adapt existing UltraThink components');
    console.log('   - Maintain functionality while updating appearance');
    
    console.log('\n4. Features to Preserve:');
    console.log('   - UltraThink workflow');
    console.log('   - Agent network visualization');
    console.log('   - Metrics and analysis');
    console.log('   - Prompt builder');
    console.log('   - Consensus system');
  });
});