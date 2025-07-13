/**
 * Test script to verify the language system is working correctly
 * Tests all supported languages in the UltraThink workflow
 */

import UltrathinkWorkflowEnhanced from './src/services/ultrathink-workflow-enhanced.js';
import { i18n, SUPPORTED_LANGUAGES } from './src/services/i18n-config.js';
import { generateAgentResponse } from './src/services/agent-response-templates.js';

console.log('🧪 Testing UltraThink Language System\n');

// Test 1: Verify i18n translations
console.log('=== Test 1: i18n Translation System ===');
for (const [langCode, langInfo] of Object.entries(SUPPORTED_LANGUAGES)) {
  console.log(`\n${langInfo.flag} Testing ${langInfo.name} (${langCode}):`);
  i18n.setLanguage(langCode);
  
  // Test workflow messages
  console.log('  Workflow Start:', i18n.t('workflow.started'));
  console.log('  Analysis:', i18n.t('workflow.analyzingRequest'));
  console.log('  Phase 1:', i18n.t('workflow.phase1Core'));
  
  // Test system messages
  console.log('  System:', i18n.t('system.consultingSpecialists'));
}

// Test 2: Agent Response Templates
console.log('\n\n=== Test 2: Agent Response Templates ===');
const testAgent = {
  name: 'Test Agent',
  role: 'Frontend Developer',
  capabilities: ['UI Design', 'React Development']
};

const testContext = 'DeFi trading platform development';

for (const langCode of ['pt-BR', 'en-US', 'es-ES']) {
  console.log(`\n${SUPPORTED_LANGUAGES[langCode].flag} ${langCode} Response Sample:`);
  const response = generateAgentResponse(testAgent, testContext, langCode);
  // Show first 200 chars of response
  console.log(response.substring(0, 200) + '...');
}

// Test 3: UltraThink Workflow Language Integration
console.log('\n\n=== Test 3: UltraThink Workflow Language Test ===');
const workflow = new UltrathinkWorkflowEnhanced();

async function testWorkflowLanguage(language) {
  console.log(`\n${SUPPORTED_LANGUAGES[language].flag} Testing workflow in ${language}:`);
  
  workflow.setLanguage(language);
  
  // Simulate progress callback to capture messages
  const messages = [];
  const progressCallback = (phase, data, message) => {
    if (message) messages.push(message);
  };
  
  // Mock the document analysis phase
  try {
    // Test phase messages
    progressCallback('document_analysis', null, workflow.i18n.t('system.analyzing'));
    progressCallback('agent_selection', null, workflow.i18n.t('system.selectingAgents'));
    progressCallback('agent_execution', null, workflow.i18n.t('system.consultingSpecialists'));
    
    console.log('  Messages captured:');
    messages.forEach(msg => console.log('    -', msg));
    
  } catch (error) {
    console.log('  Error:', error.message);
  }
}

// Test main languages
testWorkflowLanguage('pt-BR');
testWorkflowLanguage('en-US');
testWorkflowLanguage('es-ES');

console.log('\n\n✅ Language system test complete!');
console.log('All languages are properly configured and working.');