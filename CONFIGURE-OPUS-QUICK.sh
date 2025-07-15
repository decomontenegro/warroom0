#!/bin/bash

echo "🚀 Configuração Rápida do Claude Opus 3"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar API key atual
CURRENT_KEY=$(grep OPENROUTER_API_KEY .env | cut -d'=' -f2)
CURRENT_MODEL=$(grep OPENROUTER_MODEL .env | cut -d'=' -f2)

echo "📊 Configuração Atual:"
echo "   Modelo: ${YELLOW}$CURRENT_MODEL${NC}"
echo "   API Key: ${YELLOW}${CURRENT_KEY:0:20}...${NC}"
echo ""

# Menu de opções
echo "🎯 O que você deseja fazer?"
echo ""
echo "1) Usar Claude Opus 3 (mais poderoso, mais caro)"
echo "2) Usar Claude Sonnet 3 (balanceado)"
echo "3) Usar Claude Haiku 3 (rápido e barato)"
echo "4) Usar GPT-4 Turbo"
echo "5) Apenas atualizar a API Key"
echo ""

read -p "Escolha uma opção (1-5): " choice

case $choice in
    1)
        MODEL="anthropic/claude-3-opus"
        echo -e "${GREEN}✅ Configurando Claude Opus 3${NC}"
        ;;
    2)
        MODEL="anthropic/claude-3-sonnet"
        echo -e "${GREEN}✅ Configurando Claude Sonnet 3${NC}"
        ;;
    3)
        MODEL="anthropic/claude-3-haiku"
        echo -e "${GREEN}✅ Configurando Claude Haiku 3${NC}"
        ;;
    4)
        MODEL="openai/gpt-4-turbo"
        echo -e "${GREEN}✅ Configurando GPT-4 Turbo${NC}"
        ;;
    5)
        MODEL=$CURRENT_MODEL
        echo -e "${GREEN}✅ Mantendo modelo atual: $MODEL${NC}"
        ;;
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo "📝 Agora você precisa de uma API Key válida do OpenRouter"
echo ""
echo "Para obter uma chave:"
echo "1. Acesse ${YELLOW}https://openrouter.ai/${NC}"
echo "2. Crie uma conta ou faça login"
echo "3. Vá em ${YELLOW}API Keys${NC}"
echo "4. Clique em ${YELLOW}Create API Key${NC}"
echo "5. Copie a chave (começa com sk-or-v1-)"
echo ""

read -p "Cole sua API Key aqui (ou Enter para manter atual): " NEW_KEY

if [ ! -z "$NEW_KEY" ]; then
    # Validar formato da chave
    if [[ ! $NEW_KEY =~ ^sk-or-v1- ]]; then
        echo -e "${RED}❌ Formato inválido. A chave deve começar com 'sk-or-v1-'${NC}"
        exit 1
    fi
    
    # Fazer backup
    cp .env .env.backup
    echo -e "${GREEN}✅ Backup criado: .env.backup${NC}"
    
    # Atualizar API key
    sed -i '' "s/^OPENROUTER_API_KEY=.*/OPENROUTER_API_KEY=$NEW_KEY/" .env
    echo -e "${GREEN}✅ API Key atualizada${NC}"
fi

# Atualizar modelo
sed -i '' "s/^OPENROUTER_MODEL=.*/OPENROUTER_MODEL=$MODEL/" .env
echo -e "${GREEN}✅ Modelo configurado: $MODEL${NC}"

# Mostrar custos estimados
echo ""
echo "💰 Custos Estimados por Análise UltraThink:"
case $MODEL in
    "anthropic/claude-3-opus")
        echo "   ~$0.10-0.20 por análise completa"
        echo "   ${YELLOW}⚠️  Este é o modelo mais caro${NC}"
        ;;
    "anthropic/claude-3-sonnet")
        echo "   ~$0.03-0.06 por análise completa"
        ;;
    "anthropic/claude-3-haiku")
        echo "   ~$0.01-0.02 por análise completa"
        echo "   ${GREEN}✅ Melhor custo-benefício${NC}"
        ;;
    "openai/gpt-4-turbo")
        echo "   ~$0.05-0.10 por análise completa"
        ;;
esac

# Testar configuração
echo ""
echo "🧪 Testando nova configuração..."
echo ""

node fix-ai-responses.js

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📌 Próximos passos:"
echo "1. ${YELLOW}Reinicie o servidor${NC} (Ctrl+C e npm run dev)"
echo "2. Acesse o WarRoom"
echo "3. Faça uma pergunta para testar"
echo ""
echo "💡 Dica: Pergunte algo complexo como:"
echo "   'Como implementar um sistema de microserviços com event sourcing?'"