#!/usr/bin/env node

/**
 * Script de teste para verificar o AI Service
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Importar AI service
import aiService from './server/services/ai.js';

console.log('🧪 Testando AI Service...\n');

// Verificar configuração
console.log('📋 Configuração:');
console.log('- ENABLE_AI:', process.env.ENABLE_AI);
console.log('- API Key configurada:', !!process.env.OPENROUTER_API_KEY);
console.log('- Model:', process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku');
console.log('- Base URL:', process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1');

// Testar chat simples
async function testChat() {
  console.log('\n📤 Enviando requisição de teste...');
  
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant. Answer in Portuguese.'
    },
    {
      role: 'user',
      content: 'Diga apenas "Teste bem-sucedido!" em uma linha.'
    }
  ];
  
  try {
    const startTime = Date.now();
    const response = await aiService.chat(messages, { timeout: 10000 });
    const responseTime = Date.now() - startTime;
    
    console.log('\n✅ Resposta recebida em', responseTime, 'ms:');
    console.log('Tipo:', typeof response);
    console.log('Conteúdo:', response);
    
    if (response.error) {
      console.log('⚠️  Resposta contém erro:', response.errorType);
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ Erro ao testar AI:');
    console.error('Tipo:', error.code || 'Unknown');
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack?.split('\n')[0]);
    return false;
  }
}

// Executar teste
testChat().then(success => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('✅ AI Service está funcionando!');
  } else {
    console.log('❌ AI Service com problemas.');
    console.log('\nVerifique:');
    console.log('1. Se ENABLE_AI=true no .env');
    console.log('2. Se OPENROUTER_API_KEY está configurada');
    console.log('3. Se há conectividade com a API');
  }
  process.exit(success ? 0 : 1);
});