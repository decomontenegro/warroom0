# 🚀 Sistema Multi-LLM - Guia Rápido

## ⚡ Instalação Rápida (5 minutos)

```bash
# 1. Executar instalador
./install-multi-llm.sh

# 2. Configurar Gemini CLI (GRÁTIS - 1000 req/dia!)
gemini-cli auth

# 3. Reiniciar servidor
npm run dev
```

## 🎯 Por que Multi-LLM?

| Provider | Custo | Melhor Para | Requests/Dia |
|----------|-------|-------------|--------------|
| **Gemini CLI** | **GRÁTIS** | Desenvolvimento, Design | 1000 |
| **Claude Code** | $$$$ | Arquitetura Crítica | Pago |
| **OpenRouter** | $$ | Fallback, QA | Pago |

## 🔧 Configuração Visual

1. Abra o WarRoom
2. Clique em ⚙️ → "Configuração Multi-LLM"
3. Configure cada provider
4. Teste com o botão "🧪 Testar"

## 📊 Como Funciona

```
100 Agentes IA
      ↓
LLM Manager (Orquestrador)
      ↓
┌─────────┬──────────┬────────────┐
│ Claude  │ Gemini   │ OpenRouter │
│ (15%)   │ (30%)    │ (55%)      │
└─────────┴──────────┴────────────┘
```

## 💡 Economia Máxima

Com Gemini CLI gratuito:
- **Antes**: ~$50/dia (tudo OpenRouter)
- **Agora**: ~$10/dia (70% grátis via Gemini)
- **Economia**: 80%! 🎉

## 🚀 Começar Agora

```bash
# Testar sistema
node test-multi-llm.js

# Ver estatísticas
curl http://localhost:3005/api/llm/stats
```

## 🆘 Problemas?

**Gemini não funciona?**
```bash
curl -sSL https://cli.gemini.dev/install.sh | bash
gemini-cli auth
```

**Claude muito caro?**
- Use apenas para Lead Architect
- Aumente uso do Gemini (grátis!)

**Tudo falhando?**
- OpenRouter é o fallback automático
- Configure no .env

---

**🎁 Dica**: Comece só com Gemini - é grátis e resolve 80% dos casos!