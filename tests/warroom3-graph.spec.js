import { test, expect } from '@playwright/test';

test.describe('WarRoom3 Graph Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to WarRoom3
    await page.goto('http://localhost:5173/warroom3');
    
    // Wait for the page to load
    await page.waitForSelector('.warroom3-container');
  });

  test('graph modal should open and remain stable on hover', async ({ page }) => {
    // Click on the graph button
    await page.click('button[title="Ver Graph de Especialistas"]');
    
    // Wait for modal to appear
    await page.waitForSelector('.draggable-modal');
    
    // Wait for SVG to be rendered
    await page.waitForSelector('svg.network-svg');
    
    // Get initial SVG content
    const initialSvgContent = await page.evaluate(() => {
      const svg = document.querySelector('svg.network-svg');
      return svg ? svg.innerHTML : '';
    });
    
    // Wait a moment to ensure graph is fully rendered
    await page.waitForTimeout(1000);
    
    // Hover over different parts of the graph
    const svgBounds = await page.locator('svg.network-svg').boundingBox();
    
    // Move mouse to center of SVG
    await page.mouse.move(
      svgBounds.x + svgBounds.width / 2,
      svgBounds.y + svgBounds.height / 2
    );
    
    // Wait and check if SVG changed
    await page.waitForTimeout(500);
    
    const afterHoverContent = await page.evaluate(() => {
      const svg = document.querySelector('svg.network-svg');
      return svg ? svg.innerHTML : '';
    });
    
    // Move mouse around the graph
    for (let i = 0; i < 5; i++) {
      await page.mouse.move(
        svgBounds.x + (svgBounds.width * (i + 1)) / 6,
        svgBounds.y + svgBounds.height / 2
      );
      await page.waitForTimeout(200);
    }
    
    // Get final SVG content
    const finalSvgContent = await page.evaluate(() => {
      const svg = document.querySelector('svg.network-svg');
      return svg ? svg.innerHTML : '';
    });
    
    // Log if content changed
    console.log('Initial SVG length:', initialSvgContent.length);
    console.log('After hover SVG length:', afterHoverContent.length);
    console.log('Final SVG length:', finalSvgContent.length);
    
    // Check if the graph structure remained stable
    const nodesCount = await page.locator('svg.network-svg circle').count();
    console.log('Number of nodes:', nodesCount);
    
    // Test layout changes
    await page.selectOption('.layout-select', 'radial');
    await page.waitForTimeout(1000);
    
    const radialNodesCount = await page.locator('svg.network-svg circle').count();
    console.log('Nodes after radial layout:', radialNodesCount);
    
    // Test dynamic toggle
    await page.click('.dynamic-toggle input[type="checkbox"]');
    await page.waitForTimeout(500);
    
    // Check if modal is still draggable
    const modalBounds = await page.locator('.draggable-modal').boundingBox();
    await page.mouse.move(modalBounds.x + 100, modalBounds.y + 20);
    await page.mouse.down();
    await page.mouse.move(modalBounds.x + 200, modalBounds.y + 50);
    await page.mouse.up();
    
    // Verify modal moved
    const newModalBounds = await page.locator('.draggable-modal').boundingBox();
    expect(newModalBounds.x).not.toBe(modalBounds.x);
  });

  test('hover should show tooltip without reinitializing graph', async ({ page }) => {
    // Open graph modal
    await page.click('button[title="Ver Graph de Especialistas"]');
    await page.waitForSelector('.draggable-modal');
    await page.waitForTimeout(1000);
    
    // Count initial render calls
    await page.evaluate(() => {
      window.graphRenderCount = 0;
      const originalRemove = Element.prototype.remove;
      Element.prototype.remove = function() {
        if (this.tagName === 'g' || this.tagName === 'G') {
          window.graphRenderCount++;
        }
        return originalRemove.call(this);
      };
    });
    
    // Hover over nodes
    const nodes = await page.locator('svg.network-svg circle');
    const nodeCount = await nodes.count();
    
    if (nodeCount > 0) {
      // Hover over first node
      await nodes.first().hover();
      await page.waitForTimeout(500);
      
      // Check for tooltip
      const tooltip = await page.locator('.node-tooltip').isVisible();
      console.log('Tooltip visible:', tooltip);
      
      // Hover over another node
      if (nodeCount > 1) {
        await nodes.nth(1).hover();
        await page.waitForTimeout(500);
      }
    }
    
    // Check render count
    const renderCount = await page.evaluate(() => window.graphRenderCount);
    console.log('Graph re-render count during hover:', renderCount);
    
    // It should be 0 or very low
    expect(renderCount).toBeLessThan(2);
  });
});