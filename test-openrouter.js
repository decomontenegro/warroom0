import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

console.log('🔍 Testing OpenRouter Configuration...\n');
console.log(`API Key: ${OPENROUTER_API_KEY ? OPENROUTER_API_KEY.substring(0, 20) + '...' : 'NOT SET'}`);
console.log(`Base URL: ${OPENROUTER_BASE_URL}\n`);

// Test 1: Check API key validity
async function testAPIKey() {
  console.log('📋 Test 1: Checking API key validity...');
  try {
    const response = await axios.get(`${OPENROUTER_BASE_URL}/auth/key`, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      }
    });
    console.log('✅ API Key is valid!');
    console.log('Key info:', response.data);
    return true;
  } catch (error) {
    console.log('❌ API Key is invalid or expired');
    console.log('Error:', error.response?.data?.error || error.message);
    return false;
  }
}

// Test 2: List available models
async function testListModels() {
  console.log('\n📋 Test 2: Listing available models...');
  try {
    const response = await axios.get(`${OPENROUTER_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      }
    });
    
    const models = response.data.data || [];
    console.log(`✅ Found ${models.length} models available`);
    
    // Show some popular models
    const popularModels = models.filter(m => 
      m.id.includes('claude') || 
      m.id.includes('gpt') || 
      m.id.includes('mistral')
    ).slice(0, 10);
    
    console.log('\nPopular models:');
    popularModels.forEach(model => {
      console.log(`  - ${model.id}: $${model.pricing?.prompt || 0}/1K tokens`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ Failed to list models');
    console.log('Error:', error.response?.data?.error || error.message);
    return false;
  }
}

// Test 3: Make a simple chat completion
async function testChatCompletion() {
  console.log('\n📋 Test 3: Testing chat completion...');
  
  const testModels = [
    'anthropic/claude-3-haiku',
    'anthropic/claude-3-haiku-20240307',
    'openai/gpt-3.5-turbo',
    'mistralai/mistral-7b-instruct',
    'meta-llama/llama-3-8b-instruct'
  ];
  
  for (const model of testModels) {
    console.log(`\nTesting model: ${model}`);
    try {
      const response = await axios.post(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Say "Hello from OpenRouter!" in exactly 5 words.'
            }
          ],
          max_tokens: 20,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3005',
            'X-Title': 'War Room Test'
          }
        }
      );
      
      console.log(`✅ Success! Response: "${response.data.choices[0].message.content}"`);
      return { success: true, model, response: response.data };
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  return { success: false };
}

// Test 4: Check account limits
async function testAccountLimits() {
  console.log('\n📋 Test 4: Checking account limits...');
  try {
    const response = await axios.get(`${OPENROUTER_BASE_URL}/generation`, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      },
      params: {
        limit: 1
      }
    });
    
    console.log('✅ Account status retrieved');
    console.log('Recent usage:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Could not retrieve account status');
    console.log('Error:', error.response?.data?.error || error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting OpenRouter API Tests\n');
  console.log('================================\n');
  
  const keyValid = await testAPIKey();
  
  if (!keyValid) {
    console.log('\n⚠️  API Key is invalid. Please check your OpenRouter API key.');
    console.log('\n📝 To get a valid API key:');
    console.log('1. Go to https://openrouter.ai/');
    console.log('2. Sign up or log in');
    console.log('3. Go to https://openrouter.ai/keys');
    console.log('4. Create a new API key');
    console.log('5. Update your .env file with: OPENROUTER_API_KEY=your-new-key');
    console.log('6. Restart the server\n');
    return;
  }
  
  await testListModels();
  const chatResult = await testChatCompletion();
  await testAccountLimits();
  
  console.log('\n================================');
  console.log('🏁 Test Summary\n');
  
  if (chatResult.success) {
    console.log('✅ OpenRouter is working correctly!');
    console.log(`✅ Successfully used model: ${chatResult.model}`);
    console.log('\n🎯 Next steps:');
    console.log('1. Your War Room AI will now use real AI responses');
    console.log('2. Each request will consume API credits');
    console.log('3. Monitor your usage at https://openrouter.ai/activity');
  } else {
    console.log('⚠️  API key is valid but no models are working');
    console.log('This might be due to:');
    console.log('- Insufficient credits in your account');
    console.log('- Rate limiting');
    console.log('- Model availability issues');
  }
}

// Run the tests
runAllTests().catch(console.error);