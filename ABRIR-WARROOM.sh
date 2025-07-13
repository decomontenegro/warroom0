#!/bin/bash

echo "🚀 Abrindo WarRoom..."
echo ""

# Verificar se o servidor está rodando
if lsof -i :5173 > /dev/null 2>&1; then
    echo "✅ Servidor já está rodando na porta 5173"
else
    echo "⚠️  Servidor não está rodando. Execute primeiro:"
    echo "    npm run dev"
    echo ""
    echo "Em outro terminal."
    exit 1
fi

echo ""
echo "🌐 Abrindo no navegador..."
echo ""

# Tentar diferentes URLs
echo "Tentando abrir em:"
echo "  1. http://localhost:5173/warroom"
open "http://localhost:5173/warroom" 2>/dev/null || true

sleep 2

echo "  2. http://127.0.0.1:5173/warroom"  
open "http://127.0.0.1:5173/warroom" 2>/dev/null || true

echo ""
echo "✅ Se nenhuma janela abriu, copie e cole um dos links acima no seu navegador."
echo ""
echo "🎨 Você verá:"
echo "   - Interface estilo WhatsApp"
echo "   - 100+ agentes especialistas"
echo "   - UltraThink no topo"
echo "   - Tema Liqi (roxo, azul, laranja, amarelo)"
echo ""