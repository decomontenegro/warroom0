import express from 'express';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import aiService from '../services/ai.js';
import UltrathinkWorkflow from '../../src/services/ultrathink-workflow.js';
import IntelligentOrchestrator from '../../src/services/intelligent-orchestrator.js';
import MetaAgent from '../services/consensus/MetaAgent.js';
import WarRoomEnhancedHandlers from '../services/warroom-handlers-enhanced.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const handlers = new WarRoomEnhancedHandlers();

// Language instruction helper
function getLanguageInstruction(language) {
  const instructions = {
    'pt-BR': 'Responda em português.',
    'en-US': 'Respond in English.',
    'es-ES': 'Responde en español.',
    'fr-FR': 'Répondez en français.',
    'de-DE': 'Antworten Sie auf Deutsch.',
    'it-IT': 'Rispondi in italiano.',
    'ja-JP': '日本語で返信してください。',
    'zh-CN': '请用中文回复。'
  };
  
  return instructions[language] || instructions['pt-BR'];
}

// In-memory session storage
const sessions = new Map();
const wsClients = new Map();

// Create WebSocket server
export function createWarRoomWebSocket(server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/warroom-ws'
  });
  
  wss.on('connection', (ws) => {
    console.log('New War Room WebSocket connection');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleWebSocketMessage(ws, data);
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });
    
    ws.on('close', () => {
      // Remove client from all sessions
      for (const [sessionId, clients] of wsClients.entries()) {
        const index = clients.indexOf(ws);
        if (index > -1) {
          clients.splice(index, 1);
          if (clients.length === 0) {
            wsClients.delete(sessionId);
          }
        }
      }
    });
  });
  
  return wss;
}

function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'ultrathink_query':
      handlers.handleUltraThinkQuery(ws, data);
      break;
      
    case 'user_message':
      handlers.handleUserMessage(ws, data);
      break;
      
    case 'explore_detail':
      if (handlers.handleExploreDetail) {
        handlers.handleExploreDetail(ws, data);
      }
      break;
      
    case 'register':
      if (data.sessionId) {
        if (!wsClients.has(data.sessionId)) {
          wsClients.set(data.sessionId, []);
        }
        wsClients.get(data.sessionId).push(ws);
        ws.send(JSON.stringify({
          type: 'registered',
          sessionId: data.sessionId
        }));
      }
      break;
      
    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${data.type}`
      }));
  }
}

// REST API endpoints (mantendo compatibilidade)
router.post('/sessions', (req, res) => {
  const { task, agents } = req.body;
  const session = createSession(task);
  res.json(session);
});

router.get('/sessions', (req, res) => {
  res.json(Array.from(sessions.values()));
});

router.get('/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (session) {
    res.json(session);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

function createSession(task) {
  const session = {
    id: `session-${Date.now()}`,
    task,
    status: 'active',
    startTime: new Date().toISOString(),
    agents: [],
    log: [{
      time: new Date().toLocaleTimeString(),
      message: `Session created: ${task}`
    }]
  };
  
  sessions.set(session.id, session);
  return session;
}

export default router;