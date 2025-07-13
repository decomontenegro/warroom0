#!/bin/bash

echo "🌐 Abrindo War Room no navegador..."
echo ""
echo "URL: http://localhost:5173/warroom"
echo ""

# Tentar abrir no navegador padrão
if command -v open &> /dev/null; then
    # macOS
    open http://localhost:5173/warroom
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:5173/warroom
elif command -v start &> /dev/null; then
    # Windows
    start http://localhost:5173/warroom
else
    echo "⚠️  Não foi possível abrir automaticamente."
    echo "Por favor, abra manualmente: http://localhost:5173/warroom"
fi

echo ""
echo "✅ War Room Multi-Agente está pronto!"
echo ""
echo "Características da nova interface:"
echo "  • Design dark moderno e profissional"
echo "  • Avatars temáticos para cada especialista"
echo "  • Indicadores de progresso [1/5], [2/5]"
echo "  • Animações suaves"
echo "  • 100+ especialistas disponíveis"
echo ""
echo "💡 Experimente perguntar:"
echo "  - Como melhorar performance de React?"
echo "  - Como implementar autenticação JWT?"
echo "  - Como debugar memory leaks?"