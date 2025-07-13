import WebSocket from 'ws';
import axios from 'axios';

console.log('🧠 ULTRATHINK - Análise 360° do War Room\n');
console.log('=' .repeat(60));

const results = {
  passed: [],
  failed: [],
  warnings: []
};

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Servidor Backend
async function testBackend() {
  console.log('\n📋 TESTE 1: Servidor Backend (porta 3005)');
  try {
    await axios.get('http://localhost:3005/api/warroom/sessions', { timeout: 2000 });
    results.passed.push('✅ Backend API respondendo');
  } catch (e) {
    if (e.response) {
      results.passed.push('✅ Backend rodando (status: ' + e.response.status + ')');
    } else {
      results.failed.push('❌ Backend não está acessível');
    }
  }
}

// Test 2: Frontend Vite
async function testFrontend() {
  console.log('\n📋 TESTE 2: Frontend (porta 5173)');
  try {
    const response = await axios.get('http://localhost:5173/', { timeout: 2000 });
    results.passed.push('✅ Frontend Vite rodando');
  } catch (e) {
    results.failed.push('❌ Frontend não está acessível');
  }
}

// Test 3: WebSocket
async function testWebSocket() {
  console.log('\n📋 TESTE 3: Conexão WebSocket');
  
  return new Promise((resolve) => {
    const ws = new WebSocket('ws://localhost:3005/warroom-ws');
    let connected = false;
    
    ws.on('open', () => {
      connected = true;
      results.passed.push('✅ WebSocket conectado');
      ws.close();
      resolve();
    });
    
    ws.on('error', (err) => {
      results.failed.push('❌ WebSocket erro: ' + err.message);
      resolve();
    });
    
    setTimeout(() => {
      if (!connected) {
        results.failed.push('❌ WebSocket timeout');
        ws.close();
        resolve();
      }
    }, 3000);
  });
}

// Test 4: AI Integration
async function testAI() {
  console.log('\n📋 TESTE 4: Integração com AI');
  
  return new Promise((resolve) => {
    const ws = new WebSocket('ws://localhost:3005/warroom-ws');
    let gotResponse = false;
    
    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'agent-request',
        agent: { name: 'TestBot', role: 'Tester' },
        task: 'diga olá',
        capabilities: ['Testing']
      }));
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'agent-response') {
        gotResponse = true;
        results.passed.push('✅ AI respondendo corretamente');
        ws.close();
        resolve();
      }
    });
    
    setTimeout(() => {
      if (!gotResponse) {
        results.warnings.push('⚠️  AI usando respostas mock (OpenRouter não configurado?)');
      }
      ws.close();
      resolve();
    }, 5000);
  });
}

// Test 5: User Experience
async function testUX() {
  console.log('\n📋 TESTE 5: Experiência do Usuário');
  
  // Simular casos de uso reais
  const testCases = [
    { test: 'debugar erro undefined', expectKeyword: 'undefined' },
    { test: 'revisar código', expectKeyword: 'código' },
    { test: 'melhorar performance', expectKeyword: 'performance' }
  ];
  
  for (const testCase of testCases) {
    await new Promise((resolve) => {
      const ws = new WebSocket('ws://localhost:3005/warroom-ws');
      let received = false;
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'agent-request',
          agent: { name: 'Assistant', role: 'Helper' },
          task: testCase.test,
          capabilities: ['All']
        }));
      });
      
      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'agent-response') {
          received = true;
          const content = msg.content.toLowerCase();
          
          if (content.includes(testCase.expectKeyword)) {
            results.passed.push(`✅ Caso "${testCase.test}": resposta contextual`);
          } else {
            results.warnings.push(`⚠️  Caso "${testCase.test}": resposta genérica`);
          }
          
          ws.close();
          resolve();
        }
      });
      
      setTimeout(() => {
        if (!received) {
          results.failed.push(`❌ Caso "${testCase.test}": sem resposta`);
        }
        ws.close();
        resolve();
      }, 3000);
    });
    
    await wait(1000); // Evitar sobrecarga
  }
}

// Test 6: Performance
async function testPerformance() {
  console.log('\n📋 TESTE 6: Performance');
  
  const startTime = Date.now();
  const ws = new WebSocket('ws://localhost:3005/warroom-ws');
  
  return new Promise((resolve) => {
    ws.on('open', () => {
      const connectTime = Date.now() - startTime;
      
      if (connectTime < 100) {
        results.passed.push(`✅ Conexão rápida: ${connectTime}ms`);
      } else if (connectTime < 500) {
        results.warnings.push(`⚠️  Conexão moderada: ${connectTime}ms`);
      } else {
        results.failed.push(`❌ Conexão lenta: ${connectTime}ms`);
      }
      
      ws.close();
      resolve();
    });
    
    setTimeout(() => {
      ws.close();
      resolve();
    }, 2000);
  });
}

// Análise Final
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL - ANÁLISE 360°');
  console.log('='.repeat(60));
  
  console.log('\n✅ SUCESSOS (' + results.passed.length + '):');
  results.passed.forEach(r => console.log('   ' + r));
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  AVISOS (' + results.warnings.length + '):');
    results.warnings.forEach(r => console.log('   ' + r));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FALHAS (' + results.failed.length + '):');
    results.failed.forEach(r => console.log('   ' + r));
  }
  
  const total = results.passed.length + results.failed.length;
  const successRate = total > 0 ? (results.passed.length / total * 100).toFixed(0) : 0;
  
  console.log('\n' + '='.repeat(60));
  console.log(`SCORE: ${successRate}% (${results.passed.length}/${total})`);
  
  console.log('\n🎯 AVALIAÇÃO ULTRATHINK:');
  
  if (successRate >= 80 && results.failed.length === 0) {
    console.log('✅ EXCELENTE - War Room está pronto para uso!');
    console.log('   Sistema funcionando perfeitamente para vibe code.');
  } else if (successRate >= 60) {
    console.log('⚠️  BOM - War Room funcional com pequenos ajustes.');
    console.log('   Revisar avisos para melhor experiência.');
  } else {
    console.log('❌ CRÍTICO - War Room precisa correções.');
    console.log('   Resolver falhas antes de usar.');
  }
  
  console.log('\n💡 INSIGHTS:');
  
  // Análise específica
  if (results.failed.some(f => f.includes('Backend'))) {
    console.log('• Backend não está rodando - use: npm run dev');
  }
  if (results.failed.some(f => f.includes('Frontend'))) {
    console.log('• Frontend não está rodando - verifique Vite');
  }
  if (results.warnings.some(w => w.includes('mock'))) {
    console.log('• AI usando respostas mock - configure OpenRouter para respostas reais');
  }
  
  console.log('\n🚀 RECOMENDAÇÕES PARA VIBE CODE:');
  console.log('1. Use o CLI para fluxo natural: npm run warroom');
  console.log('2. Web interface em: http://localhost:5173/warroom');
  console.log('3. Comandos diretos: "debugar X", "revisar Y", "melhorar Z"');
  console.log('4. Sem complicações - foque no seu código!');
}

// Executar todos os testes
async function runTests() {
  try {
    await testBackend();
    await wait(500);
    
    await testFrontend();
    await wait(500);
    
    await testWebSocket();
    await wait(500);
    
    await testAI();
    await wait(500);
    
    await testUX();
    await wait(500);
    
    await testPerformance();
    
    generateReport();
    
  } catch (error) {
    console.error('\n❌ Erro crítico:', error.message);
    generateReport();
  }
  
  process.exit(0);
}

// Iniciar
console.log('Iniciando análise completa...\n');
runTests();