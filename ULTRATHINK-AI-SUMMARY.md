# 🤖 UltraThink - Resumo do Sistema de AI

## 🎯 O que é usado e quando

### **AI Principal: Claude 3 Haiku (via OpenRouter)**
- **Quando**: Para todas as respostas dos agentes quando AI está habilitada
- **Modelo**: `anthropic/claude-3-haiku`
- **Custo**: ~$0.01 por análise completa (50 agentes)

### **Fluxo Simplificado**
```
1. Usuário faz pergunta
   ↓
2. Sistema seleciona 50 agentes (25 core + 25 support)
   ↓
3. Fase 1 (1.5s): Envia 25 core agents → Claude 3 Haiku
   ↓
4. Fase 2 (12s): Envia 25 support agents → Claude 3 Haiku
   ↓
5. Respostas aparecem em tempo real no chat
```

## ⏱️ Timing

| Momento | O que acontece | AI usada |
|---------|---------------|----------|
| 0s | Query do usuário | - |
| 0.5s | Seleção de agentes | - |
| 1.5s | Início Fase 1 (25 core) | Claude 3 Haiku |
| 12s | Início Fase 2 (25 support) | Claude 3 Haiku |
| 15s | Análise de padrões | - |
| 20s | Orquestração | - |
| 30s+ | Chief Strategy Officer | - |

## 🔧 Configuração

### **Para habilitar AI real:**
```env
ENABLE_AI=true
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

### **Para usar apenas mocks:**
```env
ENABLE_AI=false
```

## 💰 Custos

- **Por agente**: ~$0.0002 (500 tokens)
- **Por análise completa**: ~$0.01 (50 agentes)
- **Por 100 análises**: ~$1.00

## 🚀 Performance

- **Requisições paralelas**: Sim
- **Delay entre agentes**: 100ms
- **Timeout por agente**: 30s
- **Retry**: 3x com backoff exponencial

## 🔍 Como identificar respostas mock

**Resposta Real (Claude 3):**
```
"Como Frontend Architect, analisando o sistema de pagamento:
• Implementar checkout em etapas progressivas
• Usar React Hook Form para validação
• Integrar com Stripe/PayPal SDK..."
```

**Resposta Mock:**
```
"This is a mock AI response..."
```

## 📊 Estatísticas por execução

- **Total de chamadas AI**: 50
- **Tokens usados**: ~25,000
- **Tempo médio de resposta**: 2-3s por agente
- **Taxa de sucesso**: 95%+ com AI habilitada