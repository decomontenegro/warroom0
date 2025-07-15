#!/bin/bash

echo "🔧 Atualizador de API Key do OpenRouter"
echo ""

# Verificar se foi passada uma API key como argumento
if [ $# -eq 0 ]; then
    echo "❓ Por favor, forneça sua nova API key:"
    echo "   Uso: ./UPDATE-API-KEY.sh sk-or-v1-sua-nova-chave-aqui"
    echo ""
    echo "📝 Para obter uma nova chave:"
    echo "   1. Acesse https://openrouter.ai/"
    echo "   2. Faça login ou crie uma conta"
    echo "   3. Vá em API Keys"
    echo "   4. Crie uma nova chave"
    exit 1
fi

NEW_KEY=$1

# Verificar se a chave tem o formato correto
if [[ ! $NEW_KEY =~ ^sk-or-v1- ]]; then
    echo "❌ Formato inválido. A chave deve começar com 'sk-or-v1-'"
    exit 1
fi

# Fazer backup do .env atual
cp .env .env.backup
echo "✅ Backup criado: .env.backup"

# Atualizar a chave no .env
sed -i '' "s/^OPENROUTER_API_KEY=.*/OPENROUTER_API_KEY=$NEW_KEY/" .env
echo "✅ API key atualizada no .env"

# Testar a nova chave
echo ""
echo "🧪 Testando nova API key..."
node fix-ai-responses.js

echo ""
echo "🔄 Para aplicar as mudanças, reinicie o servidor:"
echo "   1. Pare o servidor atual (Ctrl+C)"
echo "   2. Execute: npm run dev"