#!/bin/bash

# Script para iniciar o projeto unificado

echo "🚀 Iniciando Organic Code Studio Unificado..."

# Matar processos anteriores
echo "🔄 Limpando processos anteriores..."
lsof -ti:3005 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Iniciar backend
echo "📡 Iniciando servidor backend na porta 3005..."
cd server && node index.js &
BACKEND_PID=$!

# Aguardar backend iniciar
sleep 2

# Iniciar frontend
echo "🎨 Iniciando frontend na porta 5173..."
npm run dev:client &
FRONTEND_PID=$!

echo "✅ Projeto iniciado!"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3005"
echo ""
echo "Para parar, use Ctrl+C"

# Aguardar interrupção
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '👋 Projeto parado!'" EXIT
wait