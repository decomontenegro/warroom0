# 🚀 UltraThink - Como Iniciar

## Solução Rápida

Se o `npm run dev` não funcionar, criamos uma solução alternativa:

### Opção 1: Script Automático
```bash
./start.sh
```

### Opção 2: Manualmente

1. **Backend** (em um terminal):
```bash
node server/index.js
```

2. **Frontend** (em outro terminal):
```bash
npx serve dist -p 8090
```

3. **Acesse**: http://localhost:8090

## 🎯 O que está disponível:

- **Frontend**: http://localhost:8090 (ou :5173 se Vite funcionar)
- **Backend**: http://localhost:3005
- **WebSocket**: ws://localhost:3005/warroom-ws

## 🔥 UltraThink Workflow

1. Acesse o site
2. Clique em "War Room"
3. UltraThink já estará selecionado (primeiro da lista)
4. Digite sua pergunta
5. Veja a mágica acontecer com 100 especialistas!

## 🛠️ Se ainda tiver problemas:

1. Verifique se as portas 8090 e 3005 estão livres
2. Desative temporariamente firewall/antivírus
3. Use Chrome ou Firefox em modo incógnito
4. Execute: `npm install` para garantir que todas as dependências estão instaladas

## 📦 Build manual (se necessário):
```bash
npm run build
```