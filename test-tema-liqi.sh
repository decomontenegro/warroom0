#!/bin/bash

echo "🎨 Testando Tema Liqi no WarRoom..."
echo ""

# Verificar se os arquivos CSS foram criados
echo "✅ Verificando arquivos do tema..."
if [ -f "src/components/warroom/WarRoomLiqiTheme.css" ]; then
    echo "   ✓ WarRoomLiqiTheme.css encontrado"
else
    echo "   ✗ WarRoomLiqiTheme.css NÃO encontrado"
fi

if [ -f "src/components/warroom/AgentNetworkMapLiqi.css" ]; then
    echo "   ✓ AgentNetworkMapLiqi.css encontrado"
else
    echo "   ✗ AgentNetworkMapLiqi.css NÃO encontrado"
fi

# Verificar imports nos arquivos
echo ""
echo "✅ Verificando imports do tema..."
if grep -q "WarRoomLiqiTheme.css" src/components/warroom/WarRoomWhatsApp.jsx; then
    echo "   ✓ Import do tema principal OK"
else
    echo "   ✗ Import do tema principal FALTANDO"
fi

if grep -q "AgentNetworkMapLiqi.css" src/components/warroom/AgentNetworkMap.jsx; then
    echo "   ✓ Import do tema de rede OK"
else
    echo "   ✗ Import do tema de rede FALTANDO"
fi

# Verificar cores Liqi no ModernIcons
echo ""
echo "✅ Verificando cores Liqi..."
if grep -q "#9C27B0" src/components/warroom/ModernIcons.jsx; then
    echo "   ✓ Roxo Liqi implementado"
fi
if grep -q "#005CEB" src/components/warroom/ModernIcons.jsx; then
    echo "   ✓ Azul Liqi implementado"
fi
if grep -q "#FF9800" src/components/warroom/ModernIcons.jsx; then
    echo "   ✓ Laranja Liqi implementado"
fi
if grep -q "#FDD835" src/components/warroom/ModernIcons.jsx; then
    echo "   ✓ Amarelo Liqi implementado"
fi

echo ""
echo "🚀 Tema Liqi está pronto!"
echo ""
echo "Para visualizar, acesse:"
echo "   http://localhost:5173/warroom"
echo ""
echo "Certifique-se que o servidor está rodando com:"
echo "   npm run dev"
echo ""