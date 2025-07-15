#!/bin/bash

echo "🚀 Iniciando WarRoom com Multi-LLM..."
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Matar processos anteriores
echo "🔄 Limpando processos anteriores..."
pkill -f "node.*server/index.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Iniciar servidor
echo -e "${BLUE}📡 Iniciando servidor backend (porta 3005)...${NC}"
cd "$(dirname "$0")"
npm run dev &

# Aguardar servidores iniciarem
echo ""
echo "⏳ Aguardando servidores iniciarem..."
sleep 5

# Verificar se está rodando
if curl -s http://localhost:3005/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend rodando em http://localhost:3005${NC}"
else
    echo "⚠️  Backend pode estar demorando para iniciar..."
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend rodando em http://localhost:5173${NC}"
else
    echo "⚠️  Frontend pode estar demorando para iniciar..."
fi

echo ""
echo -e "${GREEN}🎉 WarRoom Multi-LLM está pronto!${NC}"
echo ""
echo "📍 Acesse em:"
echo -e "${BLUE}   http://localhost:5173/warroom${NC}"
echo ""
echo "⚙️  Para configurar Multi-LLM:"
echo "   1. Clique no ícone ⚙️ no canto superior direito"
echo "   2. Selecione 'Configuração Multi-LLM'"
echo ""
echo "📊 API Status:"
echo -e "   Backend: ${BLUE}http://localhost:3005/api/health${NC}"
echo -e "   LLM Stats: ${BLUE}http://localhost:3005/api/llm/stats${NC}"
echo ""
echo "Para parar: Ctrl+C"