import WebSocket from 'ws';

console.log('Testing WebSocket connection to War Room server...');

const ws = new WebSocket('ws://localhost:3005/warroom-ws');

ws.on('open', () => {
  console.log('✅ Connected to War Room WebSocket server');
  
  // Test sending a message
  const testMessage = {
    type: 'test',
    data: 'Hello from test client'
  };
  
  console.log('📤 Sending test message:', testMessage);
  ws.send(JSON.stringify(testMessage));
  
  // Test agent request
  setTimeout(() => {
    const agentRequest = {
      type: 'agent-request',
      agent: { name: 'Test Agent', role: 'Tester' },
      task: 'Test task',
      phase: 'testing',
      capabilities: ['Testing', 'Debugging']
    };
    
    console.log('📤 Sending agent request:', agentRequest);
    ws.send(JSON.stringify(agentRequest));
  }, 1000);
});

ws.on('message', (data) => {
  console.log('📥 Received message:', data.toString());
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('🔌 WebSocket connection closed');
});

// Close connection after 5 seconds
setTimeout(() => {
  console.log('Closing test connection...');
  ws.close();
  process.exit(0);
}, 5000);