#!/bin/bash

echo "🧪 Testando War Room WhatsApp Interface..."
echo ""

# Verificar se os servidores estão rodando
if lsof -i :5173 > /dev/null && lsof -i :3005 > /dev/null; then
    echo "✅ Servidores rodando nas portas 5173 e 3005"
else
    echo "❌ Servidores não estão rodando"
    echo "   Execute: npm run dev"
    exit 1
fi

echo ""
echo "📱 Interface WhatsApp disponível em:"
echo ""
echo "   🏠 Página inicial: http://localhost:5173/"
echo "   💬 War Room: http://localhost:5173/warroom"
echo ""
echo "✨ Funcionalidades implementadas:"
echo "   • Chat individual com cada especialista"
echo "   • Sala com todos os especialistas"
echo "   • Resumo inteligente com níveis ajustáveis"
echo "   • Prompt Builder com sugestões automáticas"
echo "   • Busca de especialistas"
echo "   • Design idêntico ao WhatsApp"
echo ""
echo "🎯 Teste rápido:"
echo "   1. Acesse http://localhost:5173/warroom"
echo "   2. Clique em '👥 Todos os Especialistas'"
echo "   3. Digite: 'como melhorar performance?'"
echo "   4. Veja múltiplos especialistas respondendo"
echo ""
echo "💡 Ou experimente o Prompt Builder:"
echo "   1. Clique em '🔧 Prompt Builder'"
echo "   2. Selecione tópicos"
echo "   3. Veja as sugestões automáticas"
echo ""

# Tentar abrir no navegador
if command -v open &> /dev/null; then
    read -p "Deseja abrir no navegador? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        open http://localhost:5173/warroom
    fi
fi