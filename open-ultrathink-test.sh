#!/bin/bash

echo "🧠 Abrindo War Room - ULTRATHINK Test"
echo ""
echo "✅ Correções Aplicadas:"
echo "   - Mínimo de 20 agentes garantidos"
echo "   - 50+ agentes selecionados por categoria"
echo "   - Processamento em fases paralelas"
echo ""
echo "🎯 Como Testar:"
echo "   1. Vá para '🔬 UltraThink' na lista"
echo "   2. Digite qualquer pergunta técnica"
echo "   3. Observe 50+ agentes respondendo!"
echo ""
echo "📊 Ou acesse 'Todos os Especialistas' para comparar"
echo ""

# Abrir no navegador
if command -v open &> /dev/null; then
    open "http://localhost:5173/warroom"
else
    echo "Acesse: http://localhost:5173/warroom"
fi

echo ""
echo "💡 Exemplo de pergunta para testar:"
echo "   'Como criar um sistema de e-commerce completo com alta disponibilidade?'"