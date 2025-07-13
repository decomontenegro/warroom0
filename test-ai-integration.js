import WebSocket from 'ws';

console.log('🧪 Testing War Room AI Integration...\n');

const ws = new WebSocket('ws://localhost:3005/warroom-ws');

ws.on('open', () => {
  console.log('✅ Connected to War Room server\n');
  
  // Test agent request with AI
  const agentRequest = {
    type: 'agent-request',
    agent: {
      name: 'Lead Architect',
      role: 'System Architecture Expert'
    },
    task: 'Criar um sistema de e-commerce escalável com microserviços',
    phase: 'development',
    capabilities: [
      'Microservices Architecture',
      'Cloud Infrastructure', 
      'API Design',
      'Scalability Patterns'
    ]
  };
  
  console.log('📤 Sending agent request for:', agentRequest.agent.name);
  console.log('   Task:', agentRequest.task);
  console.log('   Waiting for AI response...\n');
  
  ws.send(JSON.stringify(agentRequest));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  
  if (message.type === 'agent-response') {
    console.log('📥 Received AI Response from', message.agent + ':');
    console.log('─'.repeat(60));
    console.log(message.content);
    console.log('─'.repeat(60));
    console.log('\n✅ AI Integration is working correctly!');
    
    // Close after receiving response
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 1000);
  } else {
    console.log('📥 Other message:', message.type);
  }
});

ws.on('error', (error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

ws.on('close', () => {
  console.log('\n🔌 Connection closed');
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('\n⏱️ Test timed out');
  ws.close();
  process.exit(1);
}, 30000);