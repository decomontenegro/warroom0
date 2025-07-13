# 🧹 Plano de Limpeza do Projeto

## 📋 Resumo
Este documento lista todos os arquivos que podem ser removidos do projeto para manter apenas a versão mais moderna e funcional.

## ✅ Arquivos para MANTER

### 1. **Versão Atual do WarRoom (WhatsApp Style)**
- `src/components/warroom/WarRoomWhatsApp.jsx` ✨ (Versão principal)
- `src/components/warroom/WarRoomWhatsApp.css`

### 2. **Componentes de Suporte Ativos**
- `src/components/warroom/AgentProgress.jsx` e `.css`
- `src/components/warroom/PromptBuilder.jsx` e `.css`
- `src/components/warroom/EvolutionAnalysis.jsx` e `.css`
- `src/components/warroom/OrchestrationView.jsx` e `.css`
- `src/components/warroom/UltrathinkPanel.jsx` e `.css`
- `src/components/warroom/UltrathinkResults.jsx` e `.css`

### 3. **Backend Essencial**
- `server/warroom-server.js`
- `server/services/ai.js`
- `server/routes/warroom.js`

### 4. **Arquivos de Configuração**
- `warroom-agents-100.json`
- `.env` (configurações)

### 5. **Documentação Recente**
- `ULTRATHINK-*.md` (documentação do UltraThink)
- `FIX-*.md` (documentação de correções)

## ❌ Arquivos para REMOVER

### 1. **Arquivos de Teste (pasta raiz)**
```bash
test-360-simple.js
test-360-warroom.js
test-ai-integration.js
test-ai-service.js
test-code.js
test-multiagent.js
test-multiagent-v2.js
test-openrouter.js
test-server-debug.js
test-server.js
test-ultrathink-agents.js
test-warroom-agents.js
test-warroom-final.js
test-warroom-simple.js
test-web-multiagent.js
test-web-simple.js
test-websocket.js
demo-warroom.js
```

### 2. **Versões Antigas do WarRoom**
```bash
src/components/warroom/WarRoom.jsx
src/components/warroom/WarRoom.css
src/components/warroom/WarRoomChat.jsx
src/components/warroom/WarRoomChat.css
src/components/warroom/WarRoomIntegrated.jsx
src/components/warroom/WarRoomMultiAgent.jsx
src/components/warroom/WarRoomMultiAgent.css
src/components/warroom/WarRoomSimple.jsx
src/components/warroom/WarRoomSmart.jsx
src/components/warroom/WarRoomUnified.jsx
```

### 3. **Arquivos CLI Antigos**
```bash
warroom-cli.js
warroom-cli-fixed.js
warroom-cli/ (pasta inteira com node_modules)
```

### 4. **Documentação Antiga**
```bash
warroom-ai-setup.md (substituída por documentação mais recente)
```

## 🚀 Script de Limpeza

Para executar a limpeza, use o seguinte comando:

```bash
# 1. Primeiro, fazer backup (opcional)
tar -czf backup-warroom-$(date +%Y%m%d).tar.gz .

# 2. Remover arquivos de teste
rm -f test-*.js demo-*.js

# 3. Remover versões antigas do WarRoom
rm -f src/components/warroom/WarRoom.jsx src/components/warroom/WarRoom.css
rm -f src/components/warroom/WarRoomChat.jsx src/components/warroom/WarRoomChat.css
rm -f src/components/warroom/WarRoomIntegrated.jsx
rm -f src/components/warroom/WarRoomMultiAgent.jsx src/components/warroom/WarRoomMultiAgent.css
rm -f src/components/warroom/WarRoomSimple.jsx
rm -f src/components/warroom/WarRoomSmart.jsx
rm -f src/components/warroom/WarRoomUnified.jsx

# 4. Remover CLI antigo
rm -f warroom-cli.js warroom-cli-fixed.js
rm -rf warroom-cli/

# 5. Remover documentação antiga
rm -f warroom-ai-setup.md
```

## 📊 Resultado Esperado

Após a limpeza, o projeto terá:
- **1 versão principal**: WarRoomWhatsApp (a mais moderna)
- **6 componentes de suporte**: Progress, Builder, Evolution, Orchestration, UltraThink (Panel/Results)
- **Backend limpo**: Apenas arquivos essenciais
- **Documentação atualizada**: Apenas docs recentes do UltraThink

## ⚠️ Importante

Antes de executar a limpeza:
1. Faça um commit do estado atual
2. Considere fazer um backup
3. Verifique se não há dependências nos arquivos a serem removidos