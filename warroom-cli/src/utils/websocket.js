import WebSocket from 'ws';

export async function connectWebSocket(sessionId) {
  const ws = new WebSocket(`ws://localhost:3001/warroom-ws`);
  
  return new Promise((resolve, reject) => {
    ws.on('open', () => {
      // Register session
      ws.send(JSON.stringify({
        type: 'register',
        sessionId
      }));
      resolve(ws);
    });
    
    ws.on('error', (error) => {
      reject(error);
    });
    
    setTimeout(() => {
      reject(new Error('WebSocket connection timeout'));
    }, 5000);
  });
}

export function createWebSocketClient(url = 'ws://localhost:3001/warroom-ws') {
  const ws = new WebSocket(url);
  const handlers = new Map();
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      const handler = handlers.get(message.type);
      if (handler) {
        handler(message);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  });
  
  return {
    ws,
    
    on(type, handler) {
      handlers.set(type, handler);
      return this;
    },
    
    send(type, data) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, ...data }));
      }
    },
    
    close() {
      ws.close();
    }
  };
}