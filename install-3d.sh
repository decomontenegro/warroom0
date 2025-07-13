#!/bin/bash

echo "Instalando dependências para visualização 3D..."

# Navegar para o diretório do projeto
cd "$(dirname "$0")"

# Instalar as dependências
npm install three@0.158.0
npm install @react-three/fiber@8.15.0
npm install @react-three/drei@9.88.0

echo "Dependências instaladas com sucesso!"
echo "Por favor, reinicie o servidor de desenvolvimento com 'npm run dev'"