import express from 'express';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import aiService from '../services/ai.js';
import UltrathinkWorkflow from '../../src/services/ultrathink-workflow.js';
import IntelligentOrchestrator from '../../src/services/intelligent-orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

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

// Agent question helper
function getAgentQuestion(agentName, language) {
  const questions = {
    'pt-BR': `Qual é sua perspectiva especializada como ${agentName}?`,
    'en-US': `What is your expert perspective as ${agentName}?`,
    'es-ES': `¿Cuál es tu perspectiva especializada como ${agentName}?`,
    'fr-FR': `Quelle est votre perspective spécialisée en tant que ${agentName}?`,
    'de-DE': `Was ist Ihre Expertenperspektive als ${agentName}?`,
    'it-IT': `Qual è la tua prospettiva specializzata come ${agentName}?`,
    'ja-JP': `${agentName}としての専門的な視点は何ですか？`,
    'zh-CN': `作为${agentName}，您的专业观点是什么？`
  };
  
  return questions[language] || questions['pt-BR'];
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
      
    case 'list-sessions':
      ws.send(JSON.stringify({
        type: 'sessions-list',
        sessions: Array.from(sessions.values())
      }));
      break;
      
    case 'join-session':
      if (sessions.has(data.sessionId)) {
        if (!wsClients.has(data.sessionId)) {
          wsClients.set(data.sessionId, []);
        }
        wsClients.get(data.sessionId).push(ws);
        ws.send(JSON.stringify({
          type: 'joined-session',
          session: sessions.get(data.sessionId)
        }));
      } else {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Session not found'
        }));
      }
      break;
      
    case 'create-session':
      const newSession = createSession(data.task);
      ws.send(JSON.stringify({
        type: 'session-created',
        session: newSession
      }));
      break;
      
    case 'server-status':
      ws.send(JSON.stringify({
        type: 'status',
        activeSessions: sessions.size,
        connectedClients: wsClients.size,
        uptime: process.uptime()
      }));
      break;
      
    case 'list-agents':
      ws.send(JSON.stringify({
        type: 'agents-list',
        agents: getActiveAgents()
      }));
      break;
      
    case 'ultrathink-workflow':
      // Handle ULTRATHINK workflow execution
      handleUltrathinkWorkflow(data.workflow, ws);
      break;
      
    case 'agent-request':
      // Handle individual agent requests
      handleAgentRequest(data, ws);
      break;
      
    case 'multi-agent-request':
      // Handle multi-agent requests
      handleMultiAgentRequest(data, ws);
      break;
      
    case 'orchestrated-discussion':
      // Handle intelligent orchestration
      handleOrchestratedDiscussion(data, ws);
      break;
  }
}

function createSession(task) {
  const session = {
    id: `session-${Date.now()}`,
    task,
    status: 'active',
    startTime: new Date().toISOString(),
    agents: ['SessionOrchestrator', 'CodeAnalyzer', 'ValidationPipeline'],
    log: [{
      time: new Date().toLocaleTimeString(),
      message: `Session created: ${task}`
    }]
  };
  
  sessions.set(session.id, session);
  
  // Broadcast to all clients in this session
  broadcastToSession(session.id, {
    type: 'session-update',
    data: session
  });
  
  return session;
}

function broadcastToSession(sessionId, message) {
  const clients = wsClients.get(sessionId);
  console.log(`Broadcasting to session ${sessionId}, clients found: ${clients ? clients.length : 0}`);
  
  if (clients && clients.length > 0) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client, index) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        console.log(`Sending to client ${index + 1}/${clients.length}`);
        client.send(messageStr);
      } else {
        console.log(`Client ${index + 1} not ready, state: ${client.readyState}`);
      }
    });
  } else {
    console.log(`No clients registered for session ${sessionId}`);
    console.log('Current sessions:', Array.from(wsClients.keys()));
  }
}

function getActiveAgents() {
  // This would connect to actual agent system
  return [
    { name: 'SessionOrchestrator', status: 'active', sessions: 2 },
    { name: 'CodeAnalyzer', status: 'active', sessions: 3 },
    { name: 'ValidationPipeline', status: 'idle', sessions: 0 },
    { name: 'TestGenerator', status: 'active', sessions: 1 }
  ];
}

async function handleAgentRequest(data, ws) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  console.log(`[${requestId}] Starting agent request for: ${data.agent?.name || 'Unknown Agent'}`);
  console.log(`[${requestId}] Language requested: ${data.language || 'not specified'}`);
  
  try {
    const { agent, task, phase, capabilities, context, language } = data;
    
    // Build context from previous messages
    let contextString = '';
    if (context && context.length > 0) {
      contextString = '\n\nContexto da conversa:\n' + 
        context.map(c => `${c.type}: ${c.content}`).join('\n');
    }
    
    // Create a persona-specific prompt for the AI
    const messages = [
      {
        role: 'system',
        content: `You are ${agent.name}, an AI expert with the role: ${agent.role || 'Specialist'}. 
Your capabilities include: ${capabilities ? capabilities.join(', ') : 'general expertise'}.

You are participating in a multi-agent discussion. Provide your UNIQUE perspective based on your specific expertise.
Be concise but insightful. Focus on what only YOU as ${agent.name} would contribute.
${getLanguageInstruction(language || 'pt-BR')}

Important: 
- Don't repeat what other agents might say
- Focus on your specific domain expertise
- Be direct and actionable
- Maximum 3-4 paragraphs`
      },
      {
        role: 'user',
        content: `Task: ${task}${contextString}\n\n${getAgentQuestion(agent.name, language || 'pt-BR')}`
      }
    ];
    
    console.log(`[${requestId}] Sending to AI service...`);
    
    // Get AI response
    const response = await aiService.chat(messages);
    
    const responseTime = Date.now() - startTime;
    console.log(`[${requestId}] AI response received in ${responseTime}ms`);
    
    // Send response back through WebSocket
    ws.send(JSON.stringify({
      type: 'agent-response',
      agent: agent.name,
      role: agent.role || 'agent',
      content: response,
      phase: phase,
      responseTime: responseTime
    }));
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`[${requestId}] Agent request failed after ${errorTime}ms:`, error.message);
    
    // Fallback to mock response specific to agent
    const mockResponse = generateMockResponse(data.agent, data.task, language || 'pt-BR');
    
    ws.send(JSON.stringify({
      type: 'agent-response',
      agent: data.agent?.name || 'System',
      role: data.agent?.role || 'system',
      content: mockResponse,
      error: true,
      errorType: 'request_failed',
      responseTime: errorTime
    }));
  }
}

function generateMockResponse(agent, task, language = 'pt-BR') {
  const agentName = agent?.name || 'Assistant';
  const agentRole = agent?.role || 'Helper';
  
  const responses = {
    'pt-BR': {
      'Lead Architect': `Como Arquiteto Líder, vejo que ${task} requer uma abordagem estruturada. Sugiro começar com uma análise de requisitos clara e depois definir a arquitetura base.`,
      'Security Specialist': `Do ponto de vista de segurança, ${task} precisa considerar autenticação, autorização e proteção de dados desde o início.`,
      'Performance Engineer': `Para otimizar ${task}, recomendo implementar cache, lazy loading e monitoramento de métricas desde o MVP.`,
      'Frontend Architect': `No frontend de ${task}, sugiro usar component-based architecture com state management centralizado.`,
      'Backend Architect': `Para o backend de ${task}, recomendo microserviços com API RESTful e message queuing.`,
      'Database Architect': `A modelagem de dados para ${task} deve considerar escalabilidade e performance desde o design inicial.`,
      'DevOps Lead': `Para ${task}, implemente CI/CD desde o início com testes automatizados e deploy containerizado.`,
      'QA Engineer': `Qualidade em ${task} requer testes unitários, integração e E2E com no mínimo 80% de cobertura.`,
      'default': `Como ${agentName} (${agentRole}), acredito que ${task} requer análise cuidadosa e implementação iterativa.`
    },
    'en-US': {
      'Lead Architect': `As Lead Architect, I see that ${task} requires a structured approach. I suggest starting with clear requirements analysis and then defining the base architecture.`,
      'Security Specialist': `From a security perspective, ${task} needs to consider authentication, authorization, and data protection from the start.`,
      'Performance Engineer': `To optimize ${task}, I recommend implementing caching, lazy loading, and metrics monitoring from the MVP.`,
      'Frontend Architect': `For the frontend of ${task}, I suggest using component-based architecture with centralized state management.`,
      'Backend Architect': `For the backend of ${task}, I recommend microservices with RESTful API and message queuing.`,
      'Database Architect': `Data modeling for ${task} should consider scalability and performance from the initial design.`,
      'DevOps Lead': `For ${task}, implement CI/CD from the start with automated tests and containerized deployment.`,
      'QA Engineer': `Quality in ${task} requires unit, integration, and E2E tests with at least 80% coverage.`,
      'default': `As ${agentName} (${agentRole}), I believe ${task} requires careful analysis and iterative implementation.`
    },
    'es-ES': {
      'Lead Architect': `Como Arquitecto Principal, veo que ${task} requiere un enfoque estructurado. Sugiero comenzar con un análisis claro de requisitos y luego definir la arquitectura base.`,
      'Security Specialist': `Desde la perspectiva de seguridad, ${task} necesita considerar autenticación, autorización y protección de datos desde el inicio.`,
      'Performance Engineer': `Para optimizar ${task}, recomiendo implementar caché, carga diferida y monitoreo de métricas desde el MVP.`,
      'Frontend Architect': `Para el frontend de ${task}, sugiero usar arquitectura basada en componentes con gestión de estado centralizada.`,
      'Backend Architect': `Para el backend de ${task}, recomiendo microservicios con API RESTful y cola de mensajes.`,
      'Database Architect': `El modelado de datos para ${task} debe considerar escalabilidad y rendimiento desde el diseño inicial.`,
      'DevOps Lead': `Para ${task}, implemente CI/CD desde el inicio con pruebas automatizadas y despliegue en contenedores.`,
      'QA Engineer': `La calidad en ${task} requiere pruebas unitarias, de integración y E2E con al menos 80% de cobertura.`,
      'default': `Como ${agentName} (${agentRole}), creo que ${task} requiere análisis cuidadoso e implementación iterativa.`
    }
  };
  
  const langResponses = responses[language] || responses['pt-BR'];
  return langResponses[agentName] || langResponses['default'];
}

async function handleMultiAgentRequest(data, ws) {
  const requestLogId = Date.now();
  console.log(`\n========== MULTI-AGENT REQUEST START [${requestLogId}] ==========`);
  console.log('Total agents requested:', data.agents?.length || 0);
  console.log('Task:', data.task);
  console.log('RequestId:', data.requestId);
  console.log('ChatId:', data.chatId);
  console.log('Language:', data.language || 'not specified');
  
  try {
    const { agents, task, context } = data;
    let successfulResponses = 0;
    let failedResponses = 0;
    const startTime = Date.now();
    
    // Verificar se devemos usar processamento especial para muitos agentes
    const isLargeRequest = agents.length > 20;
    const BATCH_SIZE = isLargeRequest ? 15 : 10; // Lotes maiores para muitos agentes
    
    // Log detalhado dos agentes solicitados
    console.log('\nAgentes selecionados:');
    agents.forEach((agent, i) => {
      console.log(`  ${i + 1}. ${agent.name} (${agent.role})`);
    });
    
    // Extrair requestId e chatId se fornecidos
    const requestId = data.requestId || `req-${Date.now()}`;
    const chatId = data.chatId || 'all';
    
    // Notificar início do processamento
    ws.send(JSON.stringify({
      type: 'multi-agent-start',
      requestId: requestId,
      chatId: chatId,
      totalAgents: agents.length,
      task: task
    }));
    
    // Processar agentes em lotes paralelos para melhor performance
    // BATCH_SIZE já definido acima baseado na quantidade de agentes
    const batches = [];
    
    // Dividir agentes em lotes
    for (let i = 0; i < agents.length; i += BATCH_SIZE) {
      batches.push(agents.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`\nProcessando ${agents.length} agentes em ${batches.length} lotes de até ${BATCH_SIZE} agentes cada`);
    
    let processedCount = 0;
    
    // Processar cada lote
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`\n--- Processando lote ${batchIndex + 1}/${batches.length} com ${batch.length} agentes ---`);
      
      // Pequeno delay entre lotes para não sobrecarregar
      if (batchIndex > 0) {
        console.log(`Aguardando 200ms antes do próximo lote...`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Processar agentes do lote em paralelo
      const batchPromises = batch.map(async (agent, indexInBatch) => {
        const agentIndex = processedCount + indexInBatch;
        const agentStartTime = Date.now();
        
        console.log(`Processando agente ${agentIndex + 1}/${agents.length}: ${agent.name}`);
        
        // Notificar que o agente está processando
        ws.send(JSON.stringify({
          type: 'agent-processing',
          requestId: requestId,
          chatId: chatId,
          agent: agent.name,
          agentNumber: agentIndex + 1,
          totalAgents: agents.length
        }));
        
        // Criar contexto único para cada agente
        const agentContext = context ? 
          `\n\nContexto: ${context.map(c => `${c.type}: ${c.content}`).join('\n')}` : '';
        
        // Criar prompt específico do agente
        const messages = [
        {
          role: 'system',
          content: `You are ${agent.name}, a specialist in ${agent.role}.
Your capabilities include: ${agent.capabilities?.join(', ') || 'general expertise'}.

You are participating in a multi-agent discussion about: "${task}"
Provide your UNIQUE perspective based on your specific expertise.
Be concise but insightful. Focus on what only YOU as ${agent.name} would contribute.
${getLanguageInstruction(data.language || 'pt-BR')}

IMPORTANT:
- Don't repeat what other agents would say
- Focus on your area of specialization
- Be direct and actionable
- Maximum 3-4 paragraphs`
        },
        {
          role: 'user',
          content: `${task}${agentContext}\n\n${getAgentQuestion(agent.name, data.language || 'pt-BR')}`
        }
      ];
        
        try {
          console.log(`Enviando requisição AI para ${agent.name}...`);
          
          // Obter resposta da AI com timeout específico
          const response = await aiService.chat(messages, { 
            timeout: 20000, // 20 segundos por agente
            maxRetries: 1   // Menos retries para processamento em lote
          });
        
        const responseTime = Date.now() - agentStartTime;
        const responsePreview = typeof response === 'string' ? 
          response.substring(0, 100) + '...' : 
          JSON.stringify(response).substring(0, 100) + '...';
        console.log(`${agent.name} responded successfully in ${responseTime}ms`);
        console.log(`Response preview: ${responsePreview}`);
        successfulResponses++;
        
        // Verificar se a resposta contém informação de erro
        const hasError = typeof response === 'object' && response.error;
          
          // Enviar resposta
          ws.send(JSON.stringify({
            type: 'agent-response',
            requestId: requestId,
            chatId: chatId,
            agent: agent.name,
            role: agent.role,
            content: hasError ? response.content || response : response,
            error: hasError,
            errorType: hasError ? response.errorType : undefined,
            agentNumber: agentIndex + 1,
            totalAgents: agents.length,
            responseTime: responseTime
          }));
        
        if (hasError) {
          failedResponses++;
          successfulResponses--;
        }
          
        } catch (error) {
          failedResponses++;
          const responseTime = Date.now() - agentStartTime;
          console.error(`\n!!! ERRO com agente ${agent.name} após ${responseTime}ms:`);
          console.error('Tipo de erro:', error.code || 'Desconhecido');
          console.error('Mensagem:', error.message);
          
          // Determinar tipo de erro
          const errorType = error.code === 'ECONNABORTED' ? 'timeout' :
                           error.message.includes('timeout') ? 'timeout' :
                           'api_error';
          
          // Notificar falha específica
          ws.send(JSON.stringify({
            type: 'agent-error',
            requestId: requestId,
            chatId: chatId,
            agent: agent.name,
            role: agent.role,
            error: true,
            errorType: errorType,
            errorMessage: error.message,
            agentNumber: agentIndex + 1,
            totalAgents: agents.length,
            responseTime: responseTime
          }));
          
          // Enviar mock response como fallback
          const mockResponse = generateMockResponse(agent, task, data.language);
          ws.send(JSON.stringify({
            type: 'agent-response',
            requestId: requestId,
            chatId: chatId,
            agent: agent.name,
            role: agent.role,
            content: mockResponse,
            error: true,
            errorType: errorType,
            agentNumber: agentIndex + 1,
            totalAgents: agents.length,
            responseTime: responseTime
          }));
        }
      });
      
      // Aguardar conclusão de todos os agentes do lote
      await Promise.all(batchPromises);
      processedCount += batch.length;
      
      console.log(`Lote ${batchIndex + 1} concluído. Total processado: ${processedCount}/${agents.length}`);
    }
    
    const totalTime = Date.now() - startTime;
    
    // Enviar sinal de conclusão com estatísticas
    ws.send(JSON.stringify({
      type: 'multi-agent-complete',
      requestId: requestId,
      chatId: chatId,
      totalAgents: agents.length,
      successfulResponses: successfulResponses,
      failedResponses: failedResponses,
      task: task,
      totalTime: totalTime
    }));
    
    console.log(`\n========== MULTI-AGENT REQUEST COMPLETE [${requestLogId}] ==========`);
    console.log(`Request ID: ${requestId}`);
    console.log(`Chat ID: ${chatId}`);
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Successful responses: ${successfulResponses}/${agents.length}`);
    console.log(`Failed responses: ${failedResponses}/${agents.length}`);
    console.log('================================================\n');
    
  } catch (error) {
    console.error(`\n!!! MULTI-AGENT REQUEST ERROR [${requestLogId}] !!!`);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Erro ao processar requisição multi-agente',
      error: error.message
    }));
  }
}

async function handleOrchestratedDiscussion(data, ws) {
  const requestId = `orch-${Date.now()}`;
  console.log(`\n🎯 ORCHESTRATED DISCUSSION START [${requestId}] ==========`);
  console.log('Task:', data.task);
  console.log('Initial agents:', data.agents?.length || 0);
  
  try {
    const { task, agents: allAgents, initialResponses, context } = data;
    
    // Notify start
    ws.send(JSON.stringify({
      type: 'orchestration-start',
      requestId,
      task,
      message: '🎯 Iniciando orquestração inteligente com análise multi-rodada...'
    }));
    
    // Phase 1: Use existing responses or collect new ones
    console.log('\n--- Phase 1: Processing existing responses ---');
    let responsesToAnalyze = [];
    
    if (initialResponses && initialResponses.length > 0) {
      // Use existing responses from Ultrathink phases
      console.log(`Using ${initialResponses.length} existing responses from Ultrathink`);
      responsesToAnalyze = initialResponses;
    } else {
      // Fallback: collect new responses if needed
      console.log('No initial responses provided, collecting new ones...');
      for (let i = 0; i < Math.min(allAgents.length, 10); i++) {
        const agent = allAgents[i];
        
        try {
          const response = await aiService.chat([
            {
              role: 'system',
              content: `Você é ${agent.name}, ${agent.role}. Analise a tarefa e forneça sua perspectiva especializada.`
            },
            {
              role: 'user',
              content: task
            }
          ]);
          
          responsesToAnalyze.push({
            agent: agent.name,
            role: agent.role,
            content: response,
            timestamp: new Date()
          });
        } catch (error) {
          console.error(`Error with agent ${agent.name}:`, error);
        }
      }
    }
    
    // Phase 2: Orchestrator analysis
    console.log('\n--- Phase 2: Orchestrator Analysis ---');
    ws.send(JSON.stringify({
      type: 'orchestration-update',
      requestId,
      phase: 2,
      message: '🧠 Analisando consensos e divergências...'
    }));
    
    // Use the intelligent orchestrator
    const orchestrationResult = await IntelligentOrchestrator.orchestrateDiscussion(
      task,
      responsesToAnalyze,
      { context }
    );
    
    // Send orchestration insights
    ws.send(JSON.stringify({
      type: 'orchestration-analysis',
      requestId,
      analysis: {
        consensusPoints: orchestrationResult.summary.strongAgreements,
        divergences: orchestrationResult.summary.unresolvedDebates,
        criticalFindings: orchestrationResult.summary.criticalFindings,
        confidenceLevel: orchestrationResult.confidenceLevel
      }
    }));
    
    // Final Phase: Send consolidated recommendations
    const totalRounds = context.currentRound || 1;
    console.log(`\n--- Final Phase after ${totalRounds} rounds ---`);
    
    ws.send(JSON.stringify({
      type: 'orchestration-complete',
      requestId,
      result: {
        ...orchestrationResult,
        totalRounds,
        totalAgentsInvolved: responsesToAnalyze.length,
        consensusAchieved: orchestrationResult.confidenceLevel > 0.8
      },
      message: `✅ Orquestração concluída após ${totalRounds} rodada${totalRounds > 1 ? 's' : ''}!`
    }));
    
  } catch (error) {
    console.error('Orchestration error:', error);
    ws.send(JSON.stringify({
      type: 'orchestration-error',
      requestId,
      error: error.message
    }));
  }
}

async function handleUltrathinkWorkflow(workflow, ws) {
  console.log('Starting ULTRATHINK workflow:', workflow.task);
  console.log('Language:', workflow.language || 'not specified');
  
  try {
    // Send initial acknowledgment
    ws.send(JSON.stringify({
      type: 'ultrathink-update',
      data: {
        workflowId: workflow.id,
        status: 'started',
        message: 'ULTRATHINK workflow initiated with 100 specialized agents'
      }
    }));
    
    // Create custom progress callback to send real-time updates
    const progressCallback = (phase, agent, message) => {
      ws.send(JSON.stringify({
        type: 'agent-message',
        agent: agent.name,
        agentId: agent.id,
        content: message,
        phase: phase
      }));
    };
    
    // Execute the workflow with progress callback
    const result = await UltrathinkWorkflow.executeWorkflow(
      workflow.task, 
      {
        config: workflow.config,
        sessionId: workflow.id,
        progressCallback,
        language: workflow.language || 'pt-BR'
      }
    );
    
    // Send progress updates for each phase
    for (const [phaseName, phaseData] of Object.entries(result.phases)) {
      ws.send(JSON.stringify({
        type: 'ultrathink-update',
        data: {
          workflowId: workflow.id,
          phase: phaseName,
          status: 'completed',
          insights: phaseData.insights.length,
          decisions: phaseData.decisions.length,
          agentsUsed: phaseData.agentsUsed.length,
          confidence: phaseData.confidence
        }
      }));
    }
    
    // Send final report
    ws.send(JSON.stringify({
      type: 'ultrathink-update',
      data: {
        workflowId: workflow.id,
        status: 'completed',
        result: result.summary,
        recommendations: result.recommendations,
        nextSteps: result.nextSteps,
        totalAgentsActivated: result.totalAgentsActivated,
        duration: result.duration
      }
    }));
    
  } catch (error) {
    console.error('ULTRATHINK workflow error:', error);
    ws.send(JSON.stringify({
      type: 'ultrathink-update',
      data: {
        workflowId: workflow.id,
        status: 'error',
        error: error.message
      }
    }));
  }
}

// REST API endpoints
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

router.post('/sessions/:id/end', (req, res) => {
  const session = sessions.get(req.params.id);
  if (session) {
    session.status = 'completed';
    session.endTime = new Date().toISOString();
    
    broadcastToSession(session.id, {
      type: 'session-complete',
      session
    });
    
    // Clean up after a delay
    setTimeout(() => {
      sessions.delete(req.params.id);
      wsClients.delete(req.params.id);
    }, 60000); // Keep for 1 minute
    
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

router.post('/sessions/:id/message', (req, res) => {
  const { agent, message } = req.body;
  const session = sessions.get(req.params.id);
  
  if (session) {
    session.log.push({
      time: new Date().toLocaleTimeString(),
      agent,
      message
    });
    
    broadcastToSession(req.params.id, {
      type: 'agent-message',
      agent,
      message
    });
    
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// AI-powered endpoints
router.post('/ai/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;
    const analysis = await aiService.analyzeCode(code, language);
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/chat', async (req, res) => {
  try {
    const { messages, sessionId } = req.body;
    const response = await aiService.chat(messages);
    
    // Broadcast to session if provided
    if (sessionId) {
      broadcastToSession(sessionId, {
        type: 'ai-response',
        message: response
      });
    }
    
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/discuss', async (req, res) => {
  try {
    const { task, context, sessionId } = req.body;
    const discussion = await aiService.warRoomDiscussion(task, context);
    
    // Broadcast discussion to session
    if (sessionId) {
      console.log(`Broadcasting discussion for session ${sessionId} with ${discussion.length} messages`);
      discussion.forEach((entry, index) => {
        setTimeout(() => {
          const message = {
            type: 'agent-message',
            agent: entry.persona,
            message: entry.perspective
          };
          console.log(`Sending message from ${entry.persona} to session ${sessionId}`);
          broadcastToSession(sessionId, message);
        }, index * 2000); // Stagger messages with 2 second delay
      });
      
      // Send session complete after all messages
      setTimeout(() => {
        console.log(`Completing session ${sessionId}`);
        broadcastToSession(sessionId, {
          type: 'session-complete',
          session: { id: sessionId }
        });
      }, discussion.length * 2000 + 1000);
    }
    
    res.json({ success: true, discussion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/generate-tests', async (req, res) => {
  try {
    const { code, framework } = req.body;
    const tests = await aiService.generateTests(code, framework);
    res.json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/refactor', async (req, res) => {
  try {
    const { code } = req.body;
    const suggestions = await aiService.refactorSuggestions(code);
    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/explain', async (req, res) => {
  try {
    const { code } = req.body;
    const explanation = await aiService.explainCode(code);
    res.json({ success: true, explanation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ULTRATHINK workflow endpoint
router.post('/ultrathink/workflow', async (req, res) => {
  try {
    const { task, config } = req.body;
    
    console.log('Starting ULTRATHINK workflow via REST:', task);
    
    const result = await UltrathinkWorkflow.executeWorkflow(task, {
      config: config || {
        enableAutoLearning: true,
        maxIterations: 3,
        selectedPhases: ['brainstorm', 'development', 'product', 'ux', 'design', 'marketing', 'security', 'testing']
      }
    });
    
    res.json({ 
      success: true, 
      result: {
        workflowId: result.workflowId,
        summary: result.summary,
        recommendations: result.recommendations,
        nextSteps: result.nextSteps,
        phasesCompleted: Object.keys(result.phases).length,
        totalDuration: result.duration,
        learningApplied: result.learningApplied
      }
    });
  } catch (error) {
    console.error('ULTRATHINK workflow error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/ultrathink/agents', (req, res) => {
  try {
    const agentsPath = join(__dirname, '../../warroom-agents-100.json');
    const agents100Data = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
    res.json({ 
      success: true, 
      totalAgents: agents100Data.warRoomTechInnovationRoles.totalAgents,
      phases: agents100Data.warRoomTechInnovationRoles.phases,
      agentCount: agents100Data.warRoomTechInnovationRoles.agents.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;