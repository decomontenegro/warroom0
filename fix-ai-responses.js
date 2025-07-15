// Script para testar e garantir que a AI está funcionando

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Verificando configuração da AI...\n');

// 1. Verificar variáveis de ambiente
console.log('1️⃣ Variáveis de ambiente:');
console.log('   OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✅ Configurada' : '❌ Não configurada');
console.log('   ENABLE_AI:', process.env.ENABLE_AI || '❌ Não definida');
console.log('   OPENROUTER_MODEL:', process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku');
console.log('');

// 2. Testar conexão com a API
console.log('2️⃣ Testando conexão com OpenRouter...');

async function testAI() {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "AI is working!" in Portuguese.' }
        ],
        temperature: 0.7,
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3005',
          'X-Title': 'War Room Test'
        },
        timeout: 10000
      }
    );

    console.log('   ✅ Conexão bem-sucedida!');
    console.log('   Resposta:', response.data.choices[0].message.content);
    return true;
  } catch (error) {
    console.log('   ❌ Erro na conexão:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Erro:', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.log('   Timeout - a requisição demorou muito');
    } else {
      console.log('   Erro:', error.message);
    }
    return false;
  }
}

// 3. Verificar se o servidor está usando AI real
console.log('\n3️⃣ Verificando servidor...');
console.log('   Para garantir que o servidor use AI real:');
console.log('   1. Certifique-se que ENABLE_AI=true no .env');
console.log('   2. Reinicie o servidor (Ctrl+C e npm run dev)');
console.log('   3. Verifique os logs do servidor para erros');

// Executar teste
testAI().then(success => {
  if (success) {
    console.log('\n✅ AI está funcionando corretamente!');
    console.log('Se ainda estiver vendo respostas mockadas, reinicie o servidor.');
  } else {
    console.log('\n❌ Problemas detectados com a AI.');
    console.log('\nPossíveis soluções:');
    console.log('1. Verifique se a API key está válida');
    console.log('2. Verifique sua conexão com a internet');
    console.log('3. Tente novamente em alguns segundos');
    console.log('4. Verifique o saldo em https://openrouter.ai/');
  }
});