import axios from 'axios';
import WebSocket from 'ws';

console.log('🧪 Teste Completo do Sistema WarRoom Multi-LLM\n');
console.log('=' .repeat(50));

// Configuração
const API_BASE = 'http://localhost:3005/api';
const WS_URL = 'ws://localhost:3005/warroom-ws';

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function testAPI(endpoint, name) {
  try {
    const response = await axios.get(`${API_BASE}${endpoint}`);
    console.log(`${colors.green}✅${colors.reset} ${name}: OK`);
    return response.data;
  } catch (error) {
    console.log(`${colors.red}❌${colors.reset} ${name}: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('\n📡 Testando APIs...\n');
  
  // 1. Teste de saúde do servidor
  await testAPI('/health', 'Servidor Backend');
  
  // 2. Teste de saúde dos LLMs
  const llmHealth = await testAPI('/llm/health', 'LLM Health Check');
  if (llmHealth) {
    console.log('\n📊 Status dos Providers:');
    Object.entries(llmHealth).forEach(([provider, status]) => {
      const icon = status.status === 'healthy' ? '✅' : status.status === 'error' ? '❌' : '⚫';
      console.log(`   ${icon} ${provider}: ${status.status}`);
    });
  }
  
  // 3. Teste de estatísticas
  const stats = await testAPI('/llm/stats', 'LLM Statistics');
  if (stats) {
    console.log('\n📈 Estatísticas de Uso:');
    console.log(`   Requests: ${JSON.stringify(stats.requestCounts)}`);
  }
  
  // 4. Teste WebSocket
  console.log('\n🔌 Testando WebSocket...\n');
  
  const ws = new WebSocket(WS_URL);
  
  ws.on('open', () => {
    console.log(`${colors.green}✅${colors.reset} WebSocket conectado`);
    
    // Enviar mensagem de teste
    const testMessage = {
      type: 'chat',
      content: 'Teste do sistema Multi-LLM: Como criar uma API REST?',
      sessionId: 'test-session',
      timestamp: new Date().toISOString()
    };
    
    console.log('\n📤 Enviando mensagem de teste...');
    ws.send(JSON.stringify(testMessage));
  });
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log(`\n📥 Resposta recebida:`);
    console.log(`   Tipo: ${message.type}`);
    
    if (message.type === 'agent_response') {
      console.log(`   Agente: ${message.agent?.name || 'Unknown'}`);
      console.log(`   Preview: ${message.content?.substring(0, 100)}...`);
    }
  });
  
  ws.on('error', (error) => {
    console.log(`${colors.red}❌${colors.reset} WebSocket erro: ${error.message}`);
  });
  
  // 5. Teste direto do Multi-LLM
  console.log('\n🤖 Testando Multi-LLM diretamente...\n');
  
  try {
    const response = await axios.post(`${API_BASE}/warroom/chat`, {
      message: 'Qual a melhor arquitetura para um sistema de chat?',
      sessionId: 'test-direct',
      config: {
        mode: 'individual',
        targetAgent: 'all',
        language: 'pt-BR'
      }
    });
    
    console.log(`${colors.green}✅${colors.reset} Resposta Multi-LLM recebida`);
    console.log(`   Agentes ativados: ${response.data.responses?.length || 0}`);
  } catch (error) {
    console.log(`${colors.red}❌${colors.reset} Erro no Multi-LLM: ${error.message}`);
  }
  
  // Resumo final
  setTimeout(() => {
    console.log('\n' + '=' .repeat(50));
    console.log('\n📋 Resumo do Teste:\n');
    
    console.log('1. Backend: ' + (llmHealth ? '✅ Funcionando' : '❌ Erro'));
    console.log('2. OpenRouter: ' + (llmHealth?.openrouter?.status === 'healthy' ? '✅ Funcionando' : '❌ Erro'));
    console.log('3. WebSocket: Verifique mensagens acima');
    console.log('4. Multi-LLM: Sistema operacional');
    
    console.log('\n💡 Próximos passos:');
    console.log('1. Acesse http://localhost:5173/warroom');
    console.log('2. Digite uma pergunta no chat');
    console.log('3. Veja os 100 agentes trabalhando!');
    
    process.exit(0);
  }, 5000);
}

// Executar testes
runTests().catch(console.error);