#!/bin/bash

echo "🔧 Iniciando WarRoom com configurações corrigidas..."

# Limpar processos
pkill -f "node|npm|vite" 2>/dev/null || true
sleep 2

# Exportar variáveis de ambiente
export HOST=0.0.0.0
export NODE_ENV=development

# Ir para o diretório
cd /Users/andremontenegro/teste\ cursor\ gemini\ e\ claude/organic-code-studio-unified

# Iniciar backend primeiro
echo "📡 Iniciando backend..."
node server/index.js &
BACKEND_PID=$!
sleep 3

# Iniciar frontend com host específico
echo "🌐 Iniciando frontend..."
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
sleep 5

# Mostrar informações
echo ""
echo "✅ WarRoom iniciado com sucesso!"
echo ""
echo "🌐 Acesse em:"
echo "   http://127.0.0.1:5173/warroom"
echo "   http://192.168.1.85:5173/warroom"
echo ""
echo "📱 Backend WebSocket em:"
echo "   ws://127.0.0.1:3005/warroom-ws"
echo ""
echo "🛑 Para parar: Ctrl+C"
echo ""

# Abrir no navegador
open http://127.0.0.1:5173/warroom

# Manter rodando
wait $BACKEND_PID $FRONTEND_PID