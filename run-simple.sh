#!/bin/bash

echo "🚀 Iniciando UltraThink de forma simples..."

# Mata processos antigos
pkill -f "node" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Inicia backend primeiro
echo "📡 Iniciando backend..."
node server/index.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Espera backend iniciar
sleep 3

# Verifica se backend está rodando
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend rodando!"
else
    echo "❌ Backend falhou ao iniciar"
    exit 1
fi

# Tenta com Vite
echo "⚡ Iniciando frontend com Vite..."
npm run dev:client &
VITE_PID=$!

# Espera e verifica
sleep 5

echo ""
echo "======================================"
echo "✅ SERVIDORES INICIADOS!"
echo "======================================"
echo ""
echo "🌐 Tente acessar:"
echo "   http://localhost:5173"
echo "   http://localhost:8090"
echo "   http://192.168.1.85:5173"
echo ""
echo "📡 Backend: http://localhost:3005"
echo ""
echo "🛑 Para parar: Ctrl+C ou feche o terminal"
echo "======================================"
echo ""
echo "Logs do servidor:"
echo ""

# Mantém rodando e mostra logs
wait