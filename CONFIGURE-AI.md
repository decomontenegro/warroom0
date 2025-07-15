# 🤖 Configurar AI para o WarRoom

## ❌ Problema Identificado
A API key do OpenRouter está inválida (erro 401 - não autorizada).

## ✅ Como Resolver

### 1. Obter uma nova API Key
1. Acesse https://openrouter.ai/
2. Faça login ou crie uma conta
3. Vá em "API Keys" ou "Settings"
4. Crie uma nova API key
5. Copie a chave (começa com `sk-or-v1-`)

### 2. Atualizar a configuração
Edite o arquivo `.env` na raiz do projeto:

```bash
# Abrir o arquivo .env
nano .env

# Ou use seu editor preferido
code .env
```

Substitua a linha da API key:
```
OPENROUTER_API_KEY=sk-or-v1-SUA_NOVA_CHAVE_AQUI
```

### 3. Reiniciar o servidor
```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### 4. Testar
Execute o teste para verificar:
```bash
node fix-ai-responses.js
```

## 💡 Alternativa Temporária

Se você não tiver uma API key válida agora, o sistema continuará funcionando com respostas simuladas. As respostas mockadas são genéricas mas permitem testar a interface.

## 🔍 Verificar Logs

Para ver se a AI está sendo usada, observe os logs do servidor:
- "Making AI request..." = Tentando usar AI real
- "Mock response for message..." = Usando resposta simulada

## 📝 Notas

- A API key atual no `.env` está expirada ou inválida
- O OpenRouter oferece créditos gratuitos para novos usuários
- Você pode usar modelos diferentes alterando `OPENROUTER_MODEL`
- Modelos recomendados:
  - `anthropic/claude-3-haiku` (mais rápido e barato)
  - `anthropic/claude-3-sonnet` (mais inteligente)
  - `openai/gpt-3.5-turbo` (alternativa boa)