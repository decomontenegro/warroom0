/**
 * Console test script for language system
 * Paste this in browser console to test
 */

// Test 1: Check current language state
console.log('=== LANGUAGE STATE TEST ===');
console.log('localStorage language:', localStorage.getItem('warroom-language'));
console.log('i18n language:', window.i18n?.getLanguage?.());
console.log('selectedLanguage state:', document.querySelector('[data-language]')?.getAttribute('data-language'));

// Test 2: Test i18n translations
console.log('\n=== I18N TRANSLATION TEST ===');
const testLanguages = ['pt-BR', 'en-US', 'es-ES'];
testLanguages.forEach(lang => {
  window.i18n?.setLanguage(lang);
  console.log(`\n${lang}:`);
  console.log('- workflow.started:', window.i18n?.t('workflow.started'));
  console.log('- agent.welcome:', window.i18n?.t('agent.welcome', { name: 'Test', role: 'Tester' }));
  console.log('- chief.intro:', window.i18n?.t('chief.intro', { query: 'test' }));
});

// Test 3: Check WebSocket messages
console.log('\n=== WEBSOCKET TEST ===');
console.log('Instructions:');
console.log('1. Open Network tab in DevTools');
console.log('2. Filter by WS (WebSocket)');
console.log('3. Click on warroom-ws connection');
console.log('4. Go to Messages tab');
console.log('5. Send a message and check if "language" field is present');

// Test 4: Force language change
console.log('\n=== FORCE LANGUAGE CHANGE ===');
function forceLanguageChange(lang) {
  console.log(`Forcing language to: ${lang}`);
  
  // Update localStorage
  localStorage.setItem('warroom-language', lang);
  
  // Update i18n
  if (window.i18n) {
    window.i18n.setLanguage(lang);
  }
  
  // Update UltraThink
  if (window.ultrathinkWorkflow) {
    window.ultrathinkWorkflow.setLanguage(lang);
  }
  
  // Trigger React re-render
  const event = new Event('languagechange');
  window.dispatchEvent(event);
  
  console.log('Language forced to:', lang);
  console.log('Reload the page to fully apply changes');
}

// Export to window for easy access
window.forceLanguageChange = forceLanguageChange;
window.debugLanguage = () => {
  console.log('Current language configuration:', {
    localStorage: localStorage.getItem('warroom-language'),
    i18n: window.i18n?.getLanguage?.(),
    ultrathink: window.ultrathinkWorkflow?.getLanguage?.(),
    languageManager: window.languageManager?.getLanguage?.()
  });
};

console.log('\n✅ Language debug script loaded!');
console.log('Use window.debugLanguage() to check current state');
console.log('Use window.forceLanguageChange("en-US") to force a language');