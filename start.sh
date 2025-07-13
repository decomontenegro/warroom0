#!/bin/bash

# Script para iniciar o projeto Organic Code Studio

echo "🚀 Iniciando Organic Code Studio..."

# Mata processos antigos
echo "🔄 Limpando processos antigos..."
pkill -f "node server" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "serve dist" 2>/dev/null
sleep 2

# Inicia o backend
echo "📡 Iniciando servidor backend..."
node server/index.js &
BACKEND_PID=$!

# Espera o backend iniciar
sleep 3

# Tenta iniciar com Vite primeiro
echo "⚡ Tentando iniciar com Vite..."
npm run dev:client &
VITE_PID=$!

# Espera 5 segundos para ver se o Vite inicia
sleep 5

# Verifica se o Vite está rodando
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "⚠️  Vite não iniciou, usando servidor alternativo..."
    kill $VITE_PID 2>/dev/null
    
    # Faz build se necessário
    if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
        echo "🔨 Fazendo build..."
        npm run build
    fi
    
    # Inicia servidor alternativo
    echo "🌐 Iniciando servidor na porta 8090..."
    npx serve dist -p 8090 &
    SERVE_PID=$!
    
    echo ""
    echo "✅ Projeto rodando!"
    echo "🌐 Frontend: http://localhost:8090"
    echo "📡 Backend: http://localhost:3005"
    echo ""
    echo "🛑 Para parar, pressione Ctrl+C"
    
    # Abre o navegador
    sleep 2
    open http://localhost:8090
else
    echo ""
    echo "✅ Projeto rodando com Vite!"
    echo "🌐 Frontend: http://localhost:5173"
    echo "📡 Backend: http://localhost:3005"
    echo ""
    echo "🛑 Para parar, pressione Ctrl+C"
    
    # Abre o navegador
    open http://localhost:5173
fi

# Mantém o script rodando
wait