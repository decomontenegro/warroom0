import LLMManager from './server/services/llm-manager.js';

console.log('🧪 Testando Sistema Multi-LLM...\n');

const testMultiLLM = async () => {
  const manager = new LLMManager();
  
  // Verificar saúde dos providers
  console.log('📊 Verificando status dos providers...');
  const health = await manager.healthCheck();
  
  console.log('\nStatus:');
  console.log('- Claude Code:', health.claude?.status || 'não configurado');
  console.log('- Gemini CLI:', health.gemini?.status || 'não configurado');
  console.log('- OpenRouter:', health.openrouter?.status || 'não configurado');
  
  // Testar um agente
  const testAgent = {
    id: 1,
    name: 'Test Architect',
    role: 'System Architect',
    capabilities: ['System design', 'Architecture patterns']
  };
  
  console.log('\n🤖 Testando consulta com agente...');
  
  try {
    const response = await manager.queryAgent(
      testAgent, 
      'Sugira uma arquitetura para um sistema de chat em tempo real',
      { language: 'pt-BR' }
    );
    
    console.log('\n✅ Resposta recebida:');
    console.log('Provider:', response.provider);
    console.log('Conteúdo:', response.content.substring(0, 200) + '...');
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
  
  // Mostrar estatísticas
  const stats = manager.getStats();
  console.log('\n📈 Estatísticas:');
  console.log(JSON.stringify(stats, null, 2));
};

testMultiLLM().catch(console.error);
