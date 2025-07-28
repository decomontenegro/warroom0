/**
 * WarRoom API Client
 * Cliente para comunicação com o servidor WarRoom via WebSocket e HTTP
 */

class WarRoomAPIClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3005';
    this.wsURL = process.env.REACT_APP_WS_URL || 'ws://localhost:3005/warroom-ws';
    this.ws = null;
    this.wsReady = false;
    this.messageQueue = [];
    this.responseHandlers = new Map();
    this.messageCounter = 0;
  }

  // Conectar ao WebSocket
  connect() {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      try {
        this.ws = new WebSocket(this.wsURL);
        
        this.ws.onopen = () => {
          console.log('✅ [WarRoomAPI] WebSocket conectado');
          this.wsReady = true;
          
          // Processar fila de mensagens
          while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            this.ws.send(JSON.stringify(msg));
          }
          
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('❌ [WarRoomAPI] Erro ao processar mensagem:', error);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('❌ [WarRoomAPI] WebSocket erro:', error);
          reject(error);
        };
        
        this.ws.onclose = () => {
          console.log('🔌 [WarRoomAPI] WebSocket desconectado');
          this.wsReady = false;
          // Tentar reconectar após 3 segundos
          setTimeout(() => this.connect(), 3000);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Enviar mensagem via WebSocket
  sendMessage(type, data) {
    const message = {
      type,
      ...data,
      messageId: ++this.messageCounter,
      timestamp: Date.now()
    };

    if (this.wsReady && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
      // Tentar conectar se não estiver conectado
      this.connect().catch(console.error);
    }
    
    return message.messageId;
  }

  // Processar mensagens recebidas
  handleMessage(data) {
    // Notificar handlers registrados
    if (data.messageId && this.responseHandlers.has(data.messageId)) {
      const handler = this.responseHandlers.get(data.messageId);
      handler(data);
      this.responseHandlers.delete(data.messageId);
    }
    
    // Emitir evento global para outros componentes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('warroom-message', { detail: data }));
    }
  }

  // Executar requisição de agente com AI real
  async requestAgentResponse(agent, task, options = {}) {
    const { language = 'pt-BR', context = [], phase = 'analysis' } = options;
    
    return new Promise((resolve, reject) => {
      const messageId = this.sendMessage('agent-request', {
        agent,
        task,
        phase,
        capabilities: agent.capabilities || [],
        context,
        language
      });
      
      const timeout = setTimeout(() => {
        this.responseHandlers.delete(messageId);
        reject(new Error(`Timeout esperando resposta de ${agent.name}`));
      }, 30000); // 30 segundos timeout
      
      // Registrar handler para resposta
      this.responseHandlers.set(messageId, (response) => {
        clearTimeout(timeout);
        
        if (response.type === 'agent-response') {
          resolve({
            agent: response.agent,
            content: response.content,
            error: response.error,
            errorType: response.errorType,
            responseTime: response.responseTime
          });
        } else if (response.type === 'error') {
          reject(new Error(response.message || 'Erro na requisição'));
        }
      });
    });
  }

  // Executar requisição multi-agente
  async requestMultiAgentResponses(agents, task, options = {}) {
    const { language = 'pt-BR', context = [], requestId, chatId } = options;
    
    return new Promise((resolve, reject) => {
      const responses = [];
      let expectedResponses = agents.length;
      let receivedResponses = 0;
      
      // Registrar listeners para respostas
      const messageHandler = (event) => {
        const data = event.detail;
        
        if (data.requestId === requestId) {
          if (data.type === 'agent-response') {
            responses.push({
              agent: { name: data.agent, role: data.role },
              content: data.content,
              error: data.error,
              errorType: data.errorType
            });
            receivedResponses++;
            
            // Se recebeu todas as respostas
            if (receivedResponses >= expectedResponses) {
              window.removeEventListener('warroom-message', messageHandler);
              resolve(responses);
            }
          } else if (data.type === 'multi-agent-complete') {
            window.removeEventListener('warroom-message', messageHandler);
            resolve(responses);
          } else if (data.type === 'error') {
            window.removeEventListener('warroom-message', messageHandler);
            reject(new Error(data.message));
          }
        }
      };
      
      window.addEventListener('warroom-message', messageHandler);
      
      // Enviar requisição
      this.sendMessage('multi-agent-request', {
        agents,
        task,
        context,
        language,
        requestId: requestId || `multi-${Date.now()}`,
        chatId: chatId || 'all'
      });
      
      // Timeout geral
      setTimeout(() => {
        window.removeEventListener('warroom-message', messageHandler);
        if (responses.length > 0) {
          resolve(responses); // Resolver com respostas parciais
        } else {
          reject(new Error('Timeout na requisição multi-agente'));
        }
      }, 120000); // 2 minutos timeout total
    });
  }

  // Fazer requisição HTTP para endpoints REST
  async httpRequest(endpoint, method = 'GET', data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ [WarRoomAPI] HTTP request error:', error);
      throw error;
    }
  }

  // Métodos convenientes para endpoints específicos
  async analyzeCode(code, language = 'javascript') {
    return this.httpRequest('/warroom/ai/analyze', 'POST', { code, language });
  }

  async chatWithAI(messages) {
    return this.httpRequest('/warroom/ai/chat', 'POST', { messages });
  }

  async generateTests(code, framework = 'jest') {
    return this.httpRequest('/warroom/ai/generate-tests', 'POST', { code, framework });
  }

  // Desconectar
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.wsReady = false;
    }
  }
}

// Singleton instance
const warRoomAPIClient = new WarRoomAPIClient();

// Auto-conectar se no browser
if (typeof window !== 'undefined') {
  warRoomAPIClient.connect().catch(console.error);
}

export default warRoomAPIClient;