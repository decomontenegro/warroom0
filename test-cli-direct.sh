#!/bin/bash

echo "🧠 Testando War Room CLI diretamente..."
echo ""

# Criar arquivo de teste
cat > test-code.js << 'EOF'
function calculateTotal(items) {
  let total = 0;
  for (let item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

// BUG: TypeError quando items é undefined
console.log(calculateTotal());
EOF

echo "📝 Arquivo de teste criado: test-code.js"
echo ""
echo "Iniciando War Room CLI..."
echo ""

# Testar comandos no CLI
echo -e "/help\nexit" | timeout 10s node warroom-cli.js

echo ""
echo "✅ Teste CLI concluído!"