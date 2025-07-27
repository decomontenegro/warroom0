import WebSocket from 'ws';
import http from 'http';

console.log('Testando conexão direta ao WebSocket...\n');

// Teste 1: Conexão direta
console.log('1. Tentando ws://localhost:3005/warroom-ws');
const ws1 = new WebSocket('ws://localhost:3005/warroom-ws');

ws1.on('open', () => {
    console.log('✅ Conectado com sucesso!');
    ws1.send(JSON.stringify({ type: 'ping' }));
});

ws1.on('error', (error) => {
    console.log('❌ Erro:', error.code, error.message);
});

ws1.on('close', (code, reason) => {
    console.log('🔌 Fechado:', code, reason.toString());
});

// Teste 2: Conexão sem path
setTimeout(() => {
    console.log('\n2. Tentando ws://localhost:3005/');
    const ws2 = new WebSocket('ws://localhost:3005/');
    
    ws2.on('open', () => {
        console.log('✅ Conectado sem path!');
    });
    
    ws2.on('error', (error) => {
        console.log('❌ Erro sem path:', error.code);
    });
}, 2000);

// Teste 3: HTTP request
setTimeout(() => {
    console.log('\n3. Testando HTTP...');
    
    http.get('http://localhost:3005/', (res) => {
        console.log('✅ HTTP Status:', res.statusCode);
    }).on('error', (err) => {
        console.log('❌ HTTP Erro:', err.message);
    });
}, 4000);

setTimeout(() => {
    process.exit();
}, 6000);