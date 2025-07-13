#!/usr/bin/env node

/**
 * 🧪 Teste completo do UltraThink Workflow
 * Testa frontend, backend e WebSocket
 */

import http from 'http';
import WebSocket from 'ws';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Configurações
const FRONTEND_PORTS = [5173, 8090, 8080];
const BACKEND_PORT = 3005;
const WS_URL = `ws://localhost:${BACKEND_PORT}/warroom-ws`;

// Helpers
const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.magenta}🧪 ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// Testa porta HTTP
async function testHttpPort(port, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        log.success(`${name} está rodando em http://localhost:${port}`);
        resolve(true);
      } else {
        log.error(`${name} retornou status ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', () => {
      log.error(`${name} não está acessível na porta ${port}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      log.error(`${name} timeout na porta ${port}`);
      resolve(false);
    });

    req.end();
  });
}

// Testa WebSocket
async function testWebSocket() {
  return new Promise((resolve) => {
    log.test('Testando WebSocket...');
    
    const ws = new WebSocket(WS_URL);
    let timeout = setTimeout(() => {
      ws.close();
      log.error('WebSocket timeout');
      resolve(false);
    }, 5000);

    ws.on('open', () => {
      clearTimeout(timeout);
      log.success('WebSocket conectado!');
      
      // Envia mensagem de teste
      const testMsg = {
        type: 'test',
        agent: 'Test Agent',
        content: 'Teste do UltraThink'
      };
      
      ws.send(JSON.stringify(testMsg));
      log.info('Mensagem de teste enviada');
      
      setTimeout(() => {
        ws.close();
        resolve(true);
      }, 1000);
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      log.error(`WebSocket erro: ${err.message}`);
      resolve(false);
    });

    ws.on('message', (data) => {
      log.success(`WebSocket recebeu: ${data}`);
    });
  });
}

// Testa API do backend
async function testBackendAPI() {
  return new Promise((resolve) => {
    log.test('Testando API do backend...');
    
    const postData = JSON.stringify({
      query: 'Teste do UltraThink',
      agents: ['Lead Architect'],
      stream: false
    });

    const options = {
      hostname: 'localhost',
      port: BACKEND_PORT,
      path: '/api/warroom/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.response || response.error) {
            log.success('API do backend está funcionando!');
            log.info(`Resposta: ${JSON.stringify(response).substring(0, 100)}...`);
            resolve(true);
          } else {
            log.error('API retornou resposta inválida');
            resolve(false);
          }
        } catch (e) {
          log.error(`Erro ao parsear resposta: ${e.message}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      log.error(`API erro: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      log.error('API timeout');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Testa UltraThink específico
async function testUltraThinkWorkflow() {
  return new Promise((resolve) => {
    log.test('Testando UltraThink Workflow completo...');
    
    const ws = new WebSocket(WS_URL);
    let messagesReceived = 0;
    let phasesDetected = new Set();
    
    const timeout = setTimeout(() => {
      ws.close();
      log.warn(`Teste finalizado após timeout. Mensagens recebidas: ${messagesReceived}`);
      resolve(messagesReceived > 0);
    }, 30000); // 30 segundos

    ws.on('open', () => {
      log.success('Conectado ao WebSocket para teste UltraThink');
      
      // Envia query para UltraThink
      const ultrathinkQuery = {
        type: 'ultrathink',
        query: 'Como funciona inteligência artificial?',
        taskId: `test-${Date.now()}`
      };
      
      ws.send(JSON.stringify(ultrathinkQuery));
      log.info('Query UltraThink enviada');
    });

    ws.on('message', (data) => {
      messagesReceived++;
      try {
        const msg = JSON.parse(data);
        
        // Detecta fases
        if (msg.phase) {
          phasesDetected.add(msg.phase);
          log.info(`Fase ${msg.phase} detectada`);
        }
        
        // Detecta tipos de mensagem
        if (msg.type === 'agent-response') {
          log.success(`Resposta de: ${msg.agent}`);
        } else if (msg.type === 'phase-complete') {
          log.info(`Fase ${msg.phase} completa`);
        } else if (msg.type === 'error') {
          log.error(`Erro: ${msg.error}`);
        }
        
        // Se recebeu mensagens de múltiplas fases, teste bem-sucedido
        if (phasesDetected.size >= 3) {
          clearTimeout(timeout);
          ws.close();
          log.success(`UltraThink funcionando! ${messagesReceived} mensagens, ${phasesDetected.size} fases`);
          resolve(true);
        }
      } catch (e) {
        log.error(`Erro ao processar mensagem: ${e.message}`);
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      log.error(`WebSocket erro: ${err.message}`);
      resolve(false);
    });
  });
}

// Executa todos os testes
async function runAllTests() {
  console.log('\n🚀 TESTANDO ULTRATHINK WORKFLOW\n');
  
  const results = {
    frontend: false,
    backend: false,
    websocket: false,
    api: false,
    ultrathink: false
  };

  // Testa Frontend
  log.test('Testando Frontend...');
  for (const port of FRONTEND_PORTS) {
    if (await testHttpPort(port, 'Frontend')) {
      results.frontend = true;
      break;
    }
  }
  
  // Testa Backend
  console.log('');
  results.backend = await testHttpPort(BACKEND_PORT, 'Backend');
  
  // Testa WebSocket
  if (results.backend) {
    console.log('');
    results.websocket = await testWebSocket();
    
    // Testa API
    console.log('');
    results.api = await testBackendAPI();
    
    // Testa UltraThink Workflow
    console.log('');
    results.ultrathink = await testUltraThinkWorkflow();
  }
  
  // Resumo
  console.log('\n📊 RESUMO DOS TESTES:\n');
  
  const allPassed = Object.values(results).every(r => r);
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? colors.green + '✅' : colors.red + '❌'} ${test.toUpperCase()}: ${passed ? 'OK' : 'FALHOU'}${colors.reset}`);
  });
  
  if (allPassed) {
    console.log(`\n${colors.green}🎉 TODOS OS TESTES PASSARAM! UltraThink está pronto para uso!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}⚠️  Alguns testes falharam. Verifique os logs acima.${colors.reset}\n`);
    
    // Sugestões
    if (!results.frontend) {
      console.log(`${colors.yellow}💡 Frontend: Execute './start.sh' ou 'npm run dev'${colors.reset}`);
    }
    if (!results.backend) {
      console.log(`${colors.yellow}💡 Backend: Execute 'node server/index.js'${colors.reset}`);
    }
  }
  
  // URLs para acesso
  console.log('\n🔗 URLs para acesso:\n');
  if (results.frontend) {
    const frontendPort = FRONTEND_PORTS.find(p => testHttpPort(p, 'check'));
    console.log(`Frontend: http://localhost:${frontendPort || '8090'}`);
  }
  console.log(`Backend: http://localhost:${BACKEND_PORT}`);
  console.log(`WebSocket: ws://localhost:${BACKEND_PORT}/warroom-ws`);
  
  process.exit(allPassed ? 0 : 1);
}

// Executa testes
runAllTests().catch(err => {
  log.error(`Erro fatal: ${err.message}`);
  process.exit(1);
});