#!/bin/bash

# Ir para o diretório do projeto
cd /Users/andremontenegro/teste\ cursor\ gemini\ e\ claude/organic-code-studio-unified

# Limpar processos antigos
echo "🧹 Limpando processos antigos..."
pkill -f "node|npm|vite" 2>/dev/null || true
sleep 2

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Iniciar o servidor
echo "🚀 Iniciando o WarRoom..."
npm run dev &

# Aguardar servidor iniciar
echo "⏳ Aguardando servidor iniciar..."
sleep 8

# Tentar abrir em diferentes URLs
echo "🌐 Abrindo navegador..."

# Tentar localhost primeiro
if curl -s http://localhost:5173 > /dev/null; then
    open http://localhost:5173/warroom
    echo "✅ Aberto em: http://localhost:5173/warroom"
# Tentar 127.0.0.1
elif curl -s http://127.0.0.1:5173 > /dev/null; then
    open http://127.0.0.1:5173/warroom
    echo "✅ Aberto em: http://127.0.0.1:5173/warroom"
else
    echo "❌ Servidor não respondeu. Verifique o terminal para erros."
fi

echo ""
echo "📋 Se não abrir automaticamente, tente manualmente:"
echo "   http://localhost:5173/warroom"
echo "   http://127.0.0.1:5173/warroom"
echo ""
echo "🛑 Para parar: Pressione Ctrl+C"

# Manter terminal aberto
wait