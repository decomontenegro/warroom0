#\!/bin/bash

echo "🚀 Iniciando servidor de desenvolvimento..."
echo "📍 Diretório: $(pwd)"

# Mata processos antigos
echo "🧹 Limpando processos antigos..."
pkill -f "node.*vite" || true
pkill -f "node.*server" || true
sleep 2

# Inicia o Vite
echo "🔧 Iniciando Vite..."
npx vite --host --open &

echo ""
echo "✅ Servidor iniciado\!"
echo "🌐 Acesse: http://localhost:5173/warroom3"
echo ""
echo "📝 Páginas disponíveis:"
echo "   - http://localhost:5173/ (HomePage)"
echo "   - http://localhost:5173/warroom3 (WarRoom3 Complete)"
echo "   - http://localhost:5173/warroom (WarRoom Classic)"
echo "   - http://localhost:5173/warroom-v2 (WarRoom Redesigned)"
echo ""
echo "🛑 Para parar: Ctrl+C"

# Mantém o script rodando
wait
EOF < /dev/null