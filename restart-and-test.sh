#!/bin/bash

echo "🔄 Reiniciando servidor War Room..."

# Encontrar e matar processo na porta 3005
lsof -ti:3005 | xargs kill -9 2>/dev/null

# Aguardar um momento
sleep 2

# Iniciar servidor em background
echo "🚀 Iniciando servidor..."
npm run dev > server.log 2>&1 &
SERVER_PID=$!

# Aguardar servidor iniciar
echo "⏳ Aguardando servidor iniciar..."
sleep 5

# Executar teste
echo "🧪 Executando teste multi-agente..."
node test-multiagent-v2.js

# Opcional: matar servidor após teste
# kill $SERVER_PID