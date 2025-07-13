#!/bin/bash

echo "🚀 Iniciando WarRoom..."

# Limpar processos antigos
pkill -f "node|npm|vite" 2>/dev/null || true
sleep 2

# Ir para o diretório
cd /Users/andremontenegro/teste\ cursor\ gemini\ e\ claude/organic-code-studio-unified

# Iniciar backend
echo "📡 Iniciando backend..."
node server/index.js &
BACKEND_PID=$!
sleep 3

# Iniciar frontend
echo "🌐 Iniciando frontend..."
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
sleep 5

# Mostrar URLs
echo ""
echo "✅ WarRoom está rodando!"
echo ""
echo "🌐 Acesse uma destas URLs:"
echo "   http://127.0.0.1:5173/warroom"
echo "   http://localhost:5173/warroom"
echo "   http://0.0.0.0:5173/warroom"
echo ""
echo "📱 Para acessar de outro dispositivo na rede:"
echo "   http://$(ipconfig getifaddr en0):5173/warroom"
echo ""
echo "🛑 Para parar: Ctrl+C"

# Manter rodando
wait $BACKEND_PID $FRONTEND_PID