import dotenv from 'dotenv';
import axios from 'axios';

// Recarregar variáveis de ambiente
dotenv.config();

console.log('🔑 Testando nova API key do OpenRouter...\n');

const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-opus-4';

console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NÃO CONFIGURADA');
console.log('Modelo:', model);
console.log('');

async function testOpenRouter() {
  try {
    console.log('📡 Fazendo requisição de teste...');
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello! OpenRouter is working!" if you can read this.'
          }
        ],
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3005',
          'X-Title': 'WarRoom Multi-LLM Test'
        }
      }
    );
    
    console.log('\n✅ SUCESSO! OpenRouter está funcionando!');
    console.log('Resposta:', response.data.choices[0].message.content);
    console.log('\n📊 Detalhes:');
    console.log('- Modelo usado:', response.data.model);
    console.log('- Tokens usados:', response.data.usage?.total_tokens || 'N/A');
    
  } catch (error) {
    console.error('\n❌ ERRO ao testar OpenRouter:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Mensagem:', error.response.data?.error?.message || error.response.data);
      
      if (error.response.status === 401) {
        console.error('\n⚠️  API Key inválida ou expirada!');
        console.error('Por favor, obtenha uma nova em: https://openrouter.ai/');
      }
    } else {
      console.error('Erro:', error.message);
    }
  }
}

testOpenRouter();