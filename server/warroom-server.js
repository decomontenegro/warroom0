import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import aiService from './services/ai.js';
import WarRoomEnhancedHandlers from './services/warroom-handlers-enhanced.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ 
  server,
  path: '/warroom-ws'
});

// Instanciar o handler enhanced
const handlers = new WarRoomEnhancedHandlers();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    ai: aiService.enabled ? 'enabled' : 'disabled',
    model: aiService.model
  });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New War Room client connected');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data.type);
      
      
      // Handler para mensagens do usuário
      if (data.type === 'user_message') {
        handlers.handleUserMessage(ws, data);
        return;
      }
      
      // Handler para queries do ultrathink
      if (data.type === 'ultrathink_query') {
        handlers.handleUltraThinkQuery(ws, data);
        return;
      }

      if (data.type === 'agent-request') {
        const { agent, task, phase, capabilities, language = 'pt-BR' } = data;
        
        // Language instructions based on selected language
        const languageInstructions = {
          'pt-BR': 'Responda em português brasileiro com recomendações concretas.',
          'en-US': 'Respond in English with concrete recommendations.',
          'es-ES': 'Responde en español con recomendaciones concretas.',
          'fr-FR': 'Répondez en français avec des recommandations concrètes.',
          'de-DE': 'Antworten Sie auf Deutsch mit konkreten Empfehlungen.',
          'it-IT': 'Rispondi in italiano con raccomandazioni concrete.',
          'ja-JP': '日本語で具体的な推奨事項を返信してください。',
          'zh-CN': '请用中文回复具体建议。'
        };
        
        const langInstruction = languageInstructions[language] || languageInstructions['pt-BR'];
        
        // Prepare AI prompt
        const messages = [
          {
            role: 'system',
            content: `You are ${agent.name}, a ${agent.role} expert. Your expertise includes: ${capabilities.join(', ')}. 
            You are part of a collaborative War Room discussion. Provide specific, actionable insights for the given task.
            ${langInstruction}`
          },
          {
            role: 'user',
            content: `Task: ${task}\n\nPhase: ${phase}\n\nProvide your expert analysis with specific recommendations.`
          }
        ];
        
        try {
          // Get AI response
          const aiResponse = await aiService.chat(messages, {
            temperature: 0.8,
            maxTokens: 500
          });
          
          // Send response back to client
          ws.send(JSON.stringify({
            type: 'agent-response',
            agent: agent.name,
            role: 'agent',
            content: aiResponse
          }));
        } catch (error) {
          console.error('AI service error:', error);
          
          // Fallback responses by language
          const fallbackResponses = {
            'pt-BR': `Como ${agent.role}, analisando "${task}":
• ${capabilities[0]}: Recomendo uma abordagem iterativa
• ${capabilities[1]}: Importante considerar as melhores práticas
• Sugiro começar com um MVP focado nas funcionalidades essenciais`,
            'en-US': `As ${agent.role}, analyzing "${task}":
• ${capabilities[0]}: I recommend an iterative approach
• ${capabilities[1]}: Important to consider best practices
• I suggest starting with an MVP focused on essential features`,
            'es-ES': `Como ${agent.role}, analizando "${task}":
• ${capabilities[0]}: Recomiendo un enfoque iterativo
• ${capabilities[1]}: Importante considerar las mejores prácticas
• Sugiero comenzar con un MVP centrado en las funcionalidades esenciales`
          };
          
          // Fallback response
          ws.send(JSON.stringify({
            type: 'agent-response',
            agent: agent.name,
            role: 'agent',
            content: fallbackResponses[language] || fallbackResponses['pt-BR']
          }));
        }
      }
    } catch (error) {
      console.error('Message processing error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('War Room client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 3005;

server.listen(PORT, () => {
  console.log(`🚀 War Room server running on port ${PORT}`);
  console.log(`🤖 AI Service: ${aiService.enabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/warroom-ws`);
  
  if (!aiService.enabled) {
    console.log('\n⚠️  AI responses are currently using mock data.');
    console.log('To enable real AI responses:');
    console.log('1. Ensure OPENROUTER_API_KEY is set in .env file');
    console.log('2. Set ENABLE_AI=true in .env file');
    console.log('3. Restart the server\n');
  }
});