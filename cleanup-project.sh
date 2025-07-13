#!/bin/bash

# Script de Limpeza do Projeto Organic Code Studio
# Este script remove arquivos desnecessários mantendo apenas a versão mais moderna

echo "🧹 Iniciando limpeza do projeto..."
echo "⚠️  Este script irá remover arquivos permanentemente!"
echo ""

# Perguntar confirmação
read -p "Deseja fazer um backup antes? (s/n): " backup_choice
if [ "$backup_choice" = "s" ]; then
    echo "📦 Criando backup..."
    tar -czf backup-warroom-$(date +%Y%m%d-%H%M%S).tar.gz . --exclude='node_modules' --exclude='.git'
    echo "✅ Backup criado!"
fi

echo ""
read -p "Confirma a remoção dos arquivos listados em CLEANUP-PROJECT-PLAN.md? (s/n): " confirm
if [ "$confirm" != "s" ]; then
    echo "❌ Operação cancelada"
    exit 0
fi

echo ""
echo "🗑️  Removendo arquivos..."

# 1. Remover arquivos de teste
echo "📝 Removendo arquivos de teste..."
rm -f test-*.js demo-*.js

# 2. Remover versões antigas do WarRoom
echo "📦 Removendo versões antigas do WarRoom..."
rm -f src/components/warroom/WarRoom.jsx src/components/warroom/WarRoom.css
rm -f src/components/warroom/WarRoomChat.jsx src/components/warroom/WarRoomChat.css
rm -f src/components/warroom/WarRoomIntegrated.jsx
rm -f src/components/warroom/WarRoomMultiAgent.jsx src/components/warroom/WarRoomMultiAgent.css
rm -f src/components/warroom/WarRoomSimple.jsx
rm -f src/components/warroom/WarRoomSmart.jsx
rm -f src/components/warroom/WarRoomUnified.jsx

# 3. Remover CLI antigo
echo "💻 Removendo CLI antigo..."
rm -f warroom-cli.js warroom-cli-fixed.js
rm -rf warroom-cli/

# 4. Remover documentação antiga
echo "📚 Removendo documentação antiga..."
rm -f warroom-ai-setup.md

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📊 Resumo do que foi mantido:"
echo "- WarRoomWhatsApp (versão principal)"
echo "- Componentes de suporte (Progress, Builder, Evolution, etc.)"
echo "- Backend essencial (server/)"
echo "- Documentação atualizada (ULTRATHINK-*.md, FIX-*.md)"
echo ""
echo "💡 Próximos passos:"
echo "1. Verifique se o projeto ainda funciona corretamente"
echo "2. Faça um commit das mudanças"
echo "3. Teste o UltraThink Workflow"