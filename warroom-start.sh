#!/bin/bash

echo "🧠 Iniciando War Room..."
echo ""

# Iniciar servidor em background
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!

# Aguardar servidor iniciar
sleep 3

# Abrir War Room CLI
echo "✅ War Room pronto!"
echo ""
echo "Opções:"
echo "1. CLI: npm run warroom"
echo "2. Web: http://localhost:5173/warroom"
echo ""
echo "Escolha (1 ou 2):"
read choice

if [ "$choice" = "2" ]; then
  open http://localhost:5173/warroom
else
  npm run warroom
fi

# Limpar ao sair
trap "kill $SERVER_PID 2>/dev/null" EXIT