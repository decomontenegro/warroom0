import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  
  try {
    console.log('1. Navigating to WarRoom3...');
    await page.goto('http://localhost:5173/warroom3');
    await page.waitForSelector('.warroom3-container', { timeout: 10000 });
    console.log('✓ Page loaded');
    
    console.log('2. Opening graph modal...');
    await page.click('button[title="Ver Graph de Especialistas"]');
    await page.waitForSelector('.draggable-modal', { timeout: 5000 });
    console.log('✓ Modal opened');
    
    // Wait for graph to render
    await page.waitForTimeout(2000);
    
    console.log('3. Checking initial graph state...');
    const initialNodes = await page.evaluate(() => {
      const circles = document.querySelectorAll('svg circle');
      return circles.length;
    });
    console.log(`✓ Initial nodes: ${initialNodes}`);
    
    // Monitor for DOM changes
    await page.evaluate(() => {
      window.mutationCount = 0;
      const observer = new MutationObserver((mutations) => {
        window.mutationCount += mutations.length;
        console.log(`DOM mutations detected: ${mutations.length}`);
      });
      
      const svg = document.querySelector('svg');
      if (svg) {
        observer.observe(svg, { 
          childList: true, 
          subtree: true,
          attributes: true 
        });
      }
    });
    
    console.log('4. Testing hover interactions...');
    
    // Get SVG bounds
    const svgBounds = await page.locator('svg').boundingBox();
    
    // Move mouse around
    for (let i = 0; i < 5; i++) {
      const x = svgBounds.x + (svgBounds.width * (i + 1)) / 6;
      const y = svgBounds.y + svgBounds.height / 2;
      console.log(`Moving mouse to (${x}, ${y})`);
      await page.mouse.move(x, y);
      await page.waitForTimeout(500);
      
      // Check mutations
      const mutations = await page.evaluate(() => window.mutationCount);
      console.log(`Total mutations so far: ${mutations}`);
    }
    
    console.log('5. Checking final state...');
    const finalNodes = await page.evaluate(() => {
      const circles = document.querySelectorAll('svg circle');
      return circles.length;
    });
    console.log(`✓ Final nodes: ${finalNodes}`);
    
    const totalMutations = await page.evaluate(() => window.mutationCount);
    console.log(`\nTotal DOM mutations during hover: ${totalMutations}`);
    
    if (totalMutations > 100) {
      console.log('⚠️  WARNING: Too many DOM mutations! Graph is likely re-rendering on hover.');
    }
    
    console.log('\n6. Testing layout change...');
    await page.selectOption('.layout-select', 'radial');
    await page.waitForTimeout(1000);
    
    const radialNodes = await page.evaluate(() => {
      const circles = document.querySelectorAll('svg circle');
      return circles.length;
    });
    console.log(`✓ Radial layout nodes: ${radialNodes}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  console.log('\nPress Ctrl+C to close...');
  // Keep browser open for manual inspection
  await new Promise(() => {});
})();