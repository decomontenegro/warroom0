import WebSocket from 'ws';

console.log('🧪 Testando War Room Simples...\n');

const ws = new WebSocket('ws://localhost:3005/warroom-ws');

ws.on('open', () => {
  console.log('✅ Conectado ao War Room\n');
  
  // Simular pergunta de vibe code
  const request = {
    type: 'agent-request',
    agent: { name: 'CodeAssistant', role: 'Vibe Code Helper' },
    task: 'como melhorar a performance de uma query SQL lenta?',
    capabilities: ['Code Review', 'Debugging', 'Performance', 'Testing']
  };
  
  console.log('📤 Perguntando:', request.task);
  ws.send(JSON.stringify(request));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.type === 'agent-response') {
    console.log('\n📥 Resposta do', msg.agent + ':');
    console.log('─'.repeat(50));
    console.log(msg.content);
    console.log('─'.repeat(50));
    console.log('\n✅ War Room funcionando perfeitamente!');
    
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 1000);
  }
});

ws.on('error', (error) => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('\n⏱️ Timeout');
  process.exit(1);
}, 10000);