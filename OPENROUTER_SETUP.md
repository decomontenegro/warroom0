# 🤖 OpenRouter Setup Guide for War Room AI

## Status Atual

❌ **API Key Inválida**: A chave atual (`sk-or-v1-f8a8cdbb65c...`) não está funcionando.

O War Room está usando **respostas simuladas (mock)** que são muito boas para desenvolvimento, mas para ter AI real você precisa configurar o OpenRouter.

## Como Obter uma API Key Válida

### 1. Criar Conta no OpenRouter

1. Acesse https://openrouter.ai/
2. Clique em "Sign Up" ou "Log In"
3. Você pode usar Google, GitHub ou email

### 2. Adicionar Créditos

1. Após login, vá para https://openrouter.ai/credits
2. Adicione créditos (mínimo $5)
3. OpenRouter usa sistema pré-pago

### 3. Criar API Key

1. Vá para https://openrouter.ai/keys
2. Clique em "Create Key"
3. Dê um nome (ex: "War Room")
4. Copie a chave gerada (começa com `sk-or-v1-`)

### 4. Configurar no Projeto

1. Abra o arquivo `.env`
2. Substitua a linha:
   ```
   OPENROUTER_API_KEY=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
   ```
   Por:
   ```
   OPENROUTER_API_KEY=sua-nova-chave-aqui
   ```

### 5. Reiniciar o Servidor

```bash
# Parar o servidor atual (Ctrl+C)
# Reiniciar
npm run dev:server
```

## Modelos Recomendados

O projeto está configurado para usar `anthropic/claude-3-haiku` que é:
- ✅ Rápido e barato ($0.25 por milhão de tokens)
- ✅ Excelente para respostas técnicas
- ✅ Ideal para o War Room

### Outros Modelos Disponíveis

Se quiser experimentar outros modelos, edite o `.env`:

```env
# Modelos mais baratos
OPENROUTER_MODEL=openai/gpt-3.5-turbo          # $0.50/M tokens
OPENROUTER_MODEL=mistralai/mistral-7b-instruct # $0.10/M tokens

# Modelos mais poderosos
OPENROUTER_MODEL=anthropic/claude-3-sonnet     # $3.00/M tokens
OPENROUTER_MODEL=openai/gpt-4-turbo           # $10.00/M tokens
OPENROUTER_MODEL=anthropic/claude-3-opus       # $15.00/M tokens
```

## Custos Estimados

Para o War Room com 8 agentes:
- Cada sessão usa ~2000 tokens
- Com Claude Haiku: ~$0.0005 por sessão
- Com $5 de crédito: ~10,000 sessões

## Testando a Configuração

Após configurar, execute:

```bash
node test-openrouter.js
```

Você deve ver:
```
✅ API Key is valid!
✅ Successfully used model: anthropic/claude-3-haiku
```

## Monitoramento

- Veja seu uso em: https://openrouter.ai/activity
- Configure limites em: https://openrouter.ai/limits
- Receba alertas de uso

## Fallback para Mock

Se a API falhar, o sistema automaticamente usa respostas mock, então seu desenvolvimento nunca para! 

## Troubleshooting

### "No auth credentials found"
- API key inválida ou expirada
- Verifique se copiou a chave completa

### "Insufficient credits"
- Adicione mais créditos em https://openrouter.ai/credits

### "Model not found"
- Verifique o nome do modelo no .env
- Use a lista em https://openrouter.ai/models

## Benefícios do AI Real vs Mock

**Mock (atual)**:
- ✅ Grátis e instantâneo
- ✅ Respostas consistentes
- ❌ Respostas genéricas
- ❌ Não entende contexto específico

**AI Real (com OpenRouter)**:
- ✅ Respostas contextualizadas
- ✅ Entende código específico
- ✅ Sugestões mais criativas
- ✅ Análise profunda
- ❌ Custa dinheiro (mas muito pouco)

## Próximos Passos

1. Configure a API key válida
2. Teste com `node test-openrouter.js`
3. Reinicie o servidor
4. Crie uma sessão no War Room
5. Veja as respostas AI reais dos 8 agentes!

---

💡 **Dica**: Mesmo sem API key, o sistema funciona perfeitamente com mock responses para desenvolvimento!