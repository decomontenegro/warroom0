import WebSocket from 'ws';

console.log('🚀 Teste UltraThink via Node.js\n');

const ws = new WebSocket('ws://localhost:3005/warroom-ws');

ws.on('open', () => {
    console.log('✅ Conectado ao WebSocket!');
    
    // Enviar requisição UltraThink
    const request = {
        type: 'ultrathink-workflow',
        workflow: {
            id: 'test-' + Date.now(),
            task: 'Como criar um sistema de autenticação seguro?',
            language: 'pt-BR',
            config: {
                maxAgents: 10,
                timeout: 30000
            }
        }
    };
    
    console.log('📤 Enviando requisição UltraThink...');
    ws.send(JSON.stringify(request));
});

ws.on('message', (data) => {
    try {
        const message = JSON.parse(data.toString());
        console.log(`\n📥 Tipo: ${message.type}`);
        
        switch(message.type) {
            case 'ultrathink-update':
                console.log(`   Status: ${message.data.status}`);
                console.log(`   Mensagem: ${message.data.message}`);
                break;
                
            case 'agent-message':
                console.log(`   👤 Agente: ${message.agent}`);
                console.log(`   💬 ${message.content}`);
                break;
                
            case 'workflow-complete':
                console.log('   ✅ Workflow completo!');
                console.log(`   Tempo total: ${message.data.executionTime}ms`);
                process.exit(0);
                break;
                
            default:
                console.log('   Dados:', JSON.stringify(message, null, 2));
        }
    } catch (error) {
        console.log('📥 Mensagem raw:', data.toString());
    }
});

ws.on('error', (error) => {
    console.error('❌ Erro:', error.message);
});

ws.on('close', () => {
    console.log('\n🔌 Conexão fechada');
    process.exit(1);
});

// Timeout de segurança
setTimeout(() => {
    console.log('\n⏱️ Timeout - fechando conexão');
    ws.close();
    process.exit(1);
}, 60000);