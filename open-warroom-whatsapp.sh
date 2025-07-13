#!/bin/bash

echo "🚀 Abrindo War Room WhatsApp..."
echo ""
echo "✅ Servidores rodando em:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend: http://localhost:3005"
echo "   - WebSocket: ws://localhost:3005/warroom-ws"
echo ""

# Abrir no navegador padrão
if command -v open &> /dev/null; then
    # macOS
    open "http://localhost:5173/warroom"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:5173/warroom"
elif command -v start &> /dev/null; then
    # Windows
    start "http://localhost:5173/warroom"
else
    echo "⚠️  Não foi possível abrir automaticamente."
    echo "   Acesse manualmente: http://localhost:5173/warroom"
fi

echo ""
echo "💡 Dicas:"
echo "   - Use Cmd+Shift+R (Mac) para limpar cache se necessário"
echo "   - Verifique o console (F12) se houver problemas"
echo "   - A interface está no estilo WhatsApp com 100+ especialistas!"