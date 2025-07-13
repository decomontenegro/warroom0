/**
 * WarRoom API Service
 * Handles communication with the server including language preferences
 */

export class WarRoomAPI {
  constructor() {
    this.wsUrl = null;
    this.ws = null;
    this.currentLanguage = 'pt-BR';
  }

  /**
   * Set the current language for API requests
   */
  setLanguage(language) {
    this.currentLanguage = language;
  }

  /**
   * Connect to WebSocket with language preference
   */
  connect(url, options = {}) {
    this.wsUrl = url;
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      // Send language preference on connection
      this.sendMessage({
        type: 'set-language',
        language: this.currentLanguage
      });
      
      if (options.onOpen) {
        options.onOpen();
      }
    };
    
    if (options.onMessage) {
      this.ws.onmessage = options.onMessage;
    }
    
    if (options.onError) {
      this.ws.onerror = options.onError;
    }
    
    if (options.onClose) {
      this.ws.onclose = options.onClose;
    }
    
    return this.ws;
  }

  /**
   * Send message with language preference
   */
  sendMessage(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Always include language in messages
      const messageWithLang = {
        ...data,
        language: this.currentLanguage
      };
      this.ws.send(JSON.stringify(messageWithLang));
    }
  }

  /**
   * Send agent request with language
   */
  sendAgentRequest(agent, task, context = []) {
    this.sendMessage({
      type: 'agent-request',
      agent,
      task,
      context,
      language: this.currentLanguage
    });
  }

  /**
   * Send multi-agent request with language
   */
  sendMultiAgentRequest(agents, task, context = [], requestId, chatId) {
    this.sendMessage({
      type: 'multi-agent-request',
      agents,
      task,
      context,
      requestId,
      chatId,
      language: this.currentLanguage
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export singleton instance
export const warRoomAPI = new WarRoomAPI();