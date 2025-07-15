# 🚀 Configurar Claude Opus 3 no WarRoom

## 🎯 Por que Claude Opus 3?

- **Mais inteligente** - Respostas muito mais sofisticadas e contextuais
- **Melhor compreensão** - Entende nuances e contextos complexos
- **Respostas mais longas** - Pode gerar análises mais detalhadas
- **Multimodal** - Pode analisar imagens (futuro recurso)

## 📋 Modelos Disponíveis no OpenRouter

### Claude 3 Family:
- `anthropic/claude-3-opus` - O mais poderoso (recomendado)
- `anthropic/claude-3-sonnet` - Balanceado
- `anthropic/claude-3-haiku` - Mais rápido e barato (atual)

### Alternativas Premium:
- `openai/gpt-4-turbo` - GPT-4 Turbo
- `google/gemini-pro` - Google Gemini Pro

## 🔧 Como Configurar

### 1. Obter API Key do OpenRouter
```bash
# Acesse https://openrouter.ai/
# Crie uma conta ou faça login
# Vá em API Keys > Create New Key
# Copie a chave (sk-or-v1-...)
```

### 2. Atualizar Configuração
Edite o arquivo `.env`:

```env
# AI Provider Configuration
OPENROUTER_API_KEY=sk-or-v1-sua-nova-chave-aqui
OPENROUTER_MODEL=anthropic/claude-3-opus
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Feature flags
ENABLE_AI=true
ENABLE_AI_INSIGHTS=true
```

### 3. Script de Atualização Rápida
```bash
# Use o script para atualizar
./UPDATE-API-KEY.sh sk-or-v1-sua-nova-chave-aqui

# Ou manualmente
nano .env
# Altere OPENROUTER_MODEL para anthropic/claude-3-opus
```

## 💰 Custos Estimados

### Claude 3 Opus:
- **Input**: $15 por milhão de tokens
- **Output**: $75 por milhão de tokens
- **Média**: ~$0.10-0.20 por análise completa do UltraThink

### Claude 3 Haiku (atual):
- **Input**: $0.25 por milhão de tokens
- **Output**: $1.25 por milhão de tokens
- **Média**: ~$0.01-0.02 por análise

## 🎨 Configuração Otimizada para WarRoom

Para o melhor custo-benefício, você pode usar diferentes modelos para diferentes agentes:

```javascript
// Em server/services/ai.js
const modelByAgentType = {
  'Lead Architect': 'anthropic/claude-3-opus',      // Análises complexas
  'Chief Strategy Officer': 'anthropic/claude-3-opus', // Estratégia
  'Frontend Developer': 'anthropic/claude-3-haiku',    // Tarefas simples
  'Backend Developer': 'anthropic/claude-3-sonnet',    // Balanceado
  // ... outros agentes
};
```

## 📝 Exemplo de Configuração Premium

```env
# Configuração para máxima qualidade
OPENROUTER_API_KEY=sk-or-v1-sua-chave-premium
OPENROUTER_MODEL=anthropic/claude-3-opus
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Ajustes de performance
AI_MAX_TOKENS=4000        # Respostas mais longas
AI_TEMPERATURE=0.8        # Mais criatividade
AI_TIMEOUT=30000         # 30 segundos de timeout

# Feature flags
ENABLE_AI=true
ENABLE_AI_INSIGHTS=true
ENABLE_MULTI_MODEL=true  # Usar diferentes modelos por agente
```

## 🔍 Testar Nova Configuração

```bash
# Testar se está funcionando
node fix-ai-responses.js

# Reiniciar servidor
npm run dev

# Testar no WarRoom
# Faça uma pergunta complexa para ver a diferença!
```

## 💡 Dicas

1. **Comece com créditos grátis** - OpenRouter oferece $1-5 grátis para testar
2. **Monitor de gastos** - Acompanhe em https://openrouter.ai/activity
3. **Fallback inteligente** - Configure Haiku como fallback se Opus falhar
4. **Cache de respostas** - Implemente cache para economizar

## 🚨 Importante

- Claude Opus é significativamente mais caro
- Ideal para demonstrações e análises importantes
- Para uso contínuo, considere um mix de modelos
- Configure limites de gastos no OpenRouter