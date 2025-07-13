#!/bin/bash

# Script para iniciar o servidor de desenvolvimento

echo "🚀 Iniciando Organic Code Studio..."
echo "=================================="

# Navegar para o diretório do projeto
cd "$(dirname "$0")"

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se as dependências 3D estão instaladas
if ! npm list three >/dev/null 2>&1; then
    echo ""
    echo "⚠️  Aviso: Dependências 3D não instaladas"
    echo "Para habilitar visualização 3D, execute:"
    echo "npm install three @react-three/fiber @react-three/drei"
    echo ""
fi

# Iniciar o servidor
echo "🔧 Iniciando servidores..."
echo ""
echo "📍 URLs disponíveis:"
echo "   - Frontend: http://localhost:5173"
echo "   - War Room: http://localhost:8000"
echo "   - DAG View: http://localhost:5173/dag"
echo ""
echo "Pressione Ctrl+C para parar"
echo "=================================="

npm run dev