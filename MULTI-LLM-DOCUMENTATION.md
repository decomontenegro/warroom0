# 🚀 Sistema Multi-LLM para WarRoom UltraThink

## 📋 Visão Geral

O Sistema Multi-LLM permite que o WarRoom UltraThink use múltiplos provedores de LLM simultaneamente, otimizando custo, performance e confiabilidade. Cada um dos 100 agentes é automaticamente direcionado para o LLM mais adequado.

## 🎯 Benefícios

1. **Custo Otimizado**: Usa Gemini CLI gratuito (1000 req/dia) para a maioria das tarefas
2. **Melhor Performance**: Claude Opus 4 para tarefas críticas
3. **Alta Disponibilidade**: Sistema de fallback automático
4. **Especialização**: Cada LLM usado onde tem melhor desempenho

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude Code   │     │   Gemini CLI   │     │   OpenRouter    │
│   (Opus 4)      │     │   (2.5 Pro)    │     │   (Fallback)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   LLM Manager   │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │ UltraThink      │
                        │ Workflow        │
                        └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │    100 Agentes IA      │
                    └─────────────────────────┘
```

## 📦 Componentes

### 1. **LLM Manager** (`server/services/llm-manager.js`)
- Orquestra múltiplos provedores
- Gerencia fallback e balanceamento
- Coleta estatísticas de uso
- Cache inteligente de respostas

### 2. **Providers**

#### Claude Code Provider
- **Modelo**: Claude Opus 4 (72.5% SWE-bench)
- **Contexto**: 200k tokens
- **Uso**: Arquitetura, estratégia, decisões críticas
- **Agentes**: Lead Architect, Chief Strategy Officer, etc.

#### Gemini CLI Provider
- **Modelo**: Gemini 2.5 Pro
- **Contexto**: 1M tokens
- **Uso**: Desenvolvimento, design, implementação
- **Agentes**: Developers, Designers, DevOps
- **💰 GRÁTIS**: 1000 requests/dia!

#### OpenRouter Provider
- **Modelos**: Claude, GPT-4, Gemini Pro
- **Uso**: Fallback, QA, testes, suporte
- **Agentes**: QA Engineers, Test Engineers, Support

### 3. **UltraThink Workflow Multi-LLM**
- Versão aprimorada do workflow original
- Distribui agentes por provider automaticamente
- Execução em batch otimizada
- Estatísticas em tempo real

### 4. **Interface de Configuração**
- Configuração visual no frontend
- Teste de providers
- Monitoramento de uso
- Ajuste de distribuição

## 🔧 Instalação

### 1. Executar Script de Instalação
```bash
./install-multi-llm.sh
```

### 2. Configurar API Keys

#### Claude Code
1. Obtenha API key em https://console.anthropic.com/
2. Adicione ao `.env`:
   ```env
   ENABLE_CLAUDE_CODE=true
   CLAUDE_CODE_API_KEY=sk-ant-...
   ```

#### Gemini CLI
1. Instale o CLI (se não instalado):
   ```bash
   curl -sSL https://cli.gemini.dev/install.sh | bash
   ```
2. Autentique:
   ```bash
   gemini-cli auth
   ```
3. Ative no `.env`:
   ```env
   ENABLE_GEMINI_CLI=true
   ```

#### OpenRouter (Já Configurado)
```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-opus-4
```

### 3. Reiniciar Servidor
```bash
npm run dev
```

## 🎮 Uso

### Interface Visual
1. Acesse o WarRoom
2. Clique em ⚙️ (canto superior direito)
3. Selecione "Configuração Multi-LLM"
4. Configure e teste cada provider

### Teste via CLI
```bash
node test-multi-llm.js
```

## 📊 Distribuição de Agentes

### Claude Code (15 agentes)
- Lead Architect
- Chief Strategy Officer
- Innovation Strategist
- System Architects
- Principal Engineers

### Gemini CLI (30 agentes)
- Frontend/Backend Developers
- Full Stack Developers
- Mobile Developers
- UX/UI Designers
- DevOps Engineers
- Data Engineers

### OpenRouter (55 agentes)
- QA Engineers
- Test Engineers
- Security Analysts
- Performance Engineers
- Support Specialists
- Marketing/Sales
- Project Managers

## 💰 Estimativa de Custos

### Cenário Típico (100 análises/dia)
- **Gemini CLI**: $0 (usando tier gratuito)
- **Claude Code**: ~$5-10 (15% das requisições)
- **OpenRouter**: ~$2-5 (fallback e auxiliar)
- **Total**: ~$7-15/dia

### Otimizações
1. Cache de respostas (5-10 min)
2. Batch queries quando possível
3. Fallback inteligente
4. Distribuição dinâmica baseada em performance

## 🔍 Monitoramento

### Estatísticas em Tempo Real
```javascript
GET /api/llm/stats

{
  "requestCounts": {
    "claude": 45,
    "gemini": 320,
    "openrouter": 125
  },
  "avgResponseTimes": {
    "claude": 2.3,
    "gemini": 1.8,
    "openrouter": 2.1
  }
}
```

### Health Check
```javascript
GET /api/llm/health

{
  "claude": { "status": "healthy" },
  "gemini": { "status": "healthy" },
  "openrouter": { "status": "healthy" }
}
```

## 🚨 Troubleshooting

### Gemini CLI não funciona
```bash
# Verificar instalação
gemini-cli --version

# Re-autenticar
gemini-cli auth

# Verificar PATH
echo $PATH | grep gemini
```

### Claude Code erro 401
- Verifique a API key
- Confirme créditos disponíveis
- Teste em https://console.anthropic.com/

### OpenRouter timeout
- Verifique conexão internet
- Tente modelo mais leve (Haiku)
- Aumente timeout no código

## 🔄 Sistema de Fallback

```
Tentativa 1: Provider primário (baseado no agente)
     ↓ (falha)
Tentativa 2: Provider secundário
     ↓ (falha)
Tentativa 3: OpenRouter (fallback universal)
     ↓ (falha)
Resposta Mock Inteligente (offline)
```

## 🎯 Melhores Práticas

1. **Configure Gemini primeiro** - É grátis!
2. **Use Claude apenas para crítico** - Mais caro
3. **Monitor uso diário** - Evite surpresas
4. **Configure limites** - No OpenRouter
5. **Teste regularmente** - Health checks

## 🔮 Roadmap

- [ ] Suporte para Anthropic API direta
- [ ] Integração com AWS Bedrock
- [ ] Google Vertex AI
- [ ] Azure OpenAI
- [ ] Mistral AI
- [ ] Llama via Ollama (local)
- [ ] A/B testing automático
- [ ] ML para otimização de distribuição

## 📚 Recursos

- [Claude Code SDK](https://docs.anthropic.com/en/docs/claude-code)
- [Gemini CLI](https://cli.gemini.dev)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [UltraThink Workflow](./ULTRATHINK_WORKFLOW.md)

## 🤝 Contribuindo

1. Adicione novo provider em `server/services/`
2. Implemente interface `query()` e `healthCheck()`
3. Adicione ao LLM Manager
4. Atualize distribuição de agentes
5. Teste e documente

---

**💡 Dica Final**: Comece com Gemini CLI para máximo custo-benefício. Adicione outros providers conforme necessidade!