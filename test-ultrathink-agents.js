// Script para testar quantos agentes o Ultrathink está processando

const WebSocket = require('ws');

async function testUltraThink() {
  console.log('🧪 Testando Ultrathink com múltiplos agentes...\n');
  
  const ws = new WebSocket('ws://localhost:3005/warroom-ws');
  
  let agentCount = 0;
  let messageCount = 0;
  const startTime = Date.now();
  
  ws.on('open', () => {
    console.log('✅ Conectado ao WebSocket\n');
    
    // Registrar sessão
    ws.send(JSON.stringify({
      type: 'register',
      sessionId: `test-ultrathink-${Date.now()}`
    }));
    
    // Aguardar um pouco e enviar requisição Ultrathink
    setTimeout(() => {
      console.log('📤 Enviando requisição Ultrathink...\n');
      
      // Enviar requisição simulando o frontend
      ws.send(JSON.stringify({
        type: 'agent-request',
        agent: { 
          name: 'WebSocket Expert (UltraThink)',
          role: 'Full-Stack Developer'
        },
        task: 'Como criar um sistema de chat em tempo real com WebSocket?',
        phase: 'ultrathink',
        capabilities: ['WebSocket', 'Real-time', 'Chat Systems'],
        context: []
      }));
    }, 1000);
  });
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    messageCount++;
    
    if (message.type === 'agent-response' || message.type === 'agent-processing') {
      agentCount++;
      console.log(`🤖 Agente ${agentCount}: ${message.agent || 'Unknown'}`);
      
      if (message.type === 'agent-response') {
        const preview = message.content ? 
          message.content.substring(0, 60) + '...' : 
          '(sem conteúdo)';
        console.log(`   📝 Resposta: ${preview}\n`);
      }
    }
    
    if (message.type === 'multi-agent-complete') {
      const duration = Date.now() - startTime;
      console.log('\n📊 RESULTADO DO TESTE:');
      console.log(`   - Total de agentes processados: ${message.totalAgents || agentCount}`);
      console.log(`   - Respostas bem-sucedidas: ${message.successfulResponses || 'N/A'}`);
      console.log(`   - Falhas: ${message.failedResponses || 'N/A'}`);
      console.log(`   - Tempo total: ${(duration/1000).toFixed(1)}s`);
      console.log(`   - Total de mensagens: ${messageCount}`);
      
      ws.close();
      process.exit(0);
    }
  });
  
  ws.on('error', (error) => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
  
  ws.on('close', () => {
    console.log('\n🔌 Conexão fechada');
    
    if (agentCount === 0) {
      console.log('⚠️  Nenhum agente processado - verifique se o servidor está rodando');
    }
  });
  
  // Timeout de segurança
  setTimeout(() => {
    console.log('\n⏱️  Timeout - encerrando teste após 30 segundos');
    console.log(`   Agentes processados até agora: ${agentCount}`);
    ws.close();
    process.exit(0);
  }, 30000);
}

// Executar teste
testUltraThink().catch(console.error);