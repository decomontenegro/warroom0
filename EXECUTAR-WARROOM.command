#!/bin/bash

# Script que abre um novo terminal e mantém o servidor rodando

osascript <<END
tell application "Terminal"
    activate
    do script "cd '/Users/andremontenegro/teste cursor gemini e claude/organic-code-studio-unified' && npm run dev"
end tell
END

echo "⏳ Aguardando servidor iniciar..."
sleep 10

# Abrir o WarRoom no navegador
open http://localhost:5173/warroom

echo ""
echo "✅ WarRoom deve estar aberto no navegador!"
echo ""
echo "Se não abriu, tente:"
echo "   http://localhost:5173/warroom"
echo "   http://127.0.0.1:5173/warroom"
echo ""