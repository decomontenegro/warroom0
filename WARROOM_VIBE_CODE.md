# 🧠 War Room para Vibe Code

## O que é?

War Room é seu assistente inteligente para programação. Simples assim.

## Como usar?

### 1. CLI (Recomendado para fluxo natural)

```bash
npm run warroom
```

Depois é só conversar:
- "revisar server.js"
- "debugar erro no login"
- "melhorar performance da query"
- "criar testes para UserService"

### 2. Web (Para visualizar melhor)

Acesse: http://localhost:5173/warroom

É a mesma coisa, mas visual.

## Por que usar?

**Situação:** Você está codando e encontra um bug estranho.

**Sem War Room:**
1. Abrir ChatGPT/Claude/Cursor
2. Copiar código
3. Explicar contexto
4. Esperar resposta
5. Voltar ao código

**Com War Room:**
1. Digite: "debugar erro no login"
2. War Room já entende seu contexto
3. Resposta focada no seu problema

## Comandos úteis no CLI

- `/analyze arquivo.js` - Análise profunda
- `/review` - Code review do que mudou
- `/debug "erro estranho"` - Debug assistido
- `/test componente.js` - Gera testes
- `/perf` - Analisa performance

## Filosofia

War Room não é mais uma ferramenta complicada. É como ter um dev senior do seu lado enquanto você programa.

- **Simples**: Um comando, uma resposta
- **Contextual**: Entende seu projeto
- **Focado**: Resolve seu problema atual
- **Natural**: Conversa normal, sem prompts complexos

## Exemplo real

```bash
war-room> estou com problema de performance no dashboard

[Architect]: Vejo que você está usando múltiplas queries no getDashboardData(). 
Sugiro implementar cache Redis e query única com joins.

[Performance]: O gargalo principal está nas 15 chamadas sequenciais ao banco.
Posso mostrar como paralelizar com Promise.all().

war-room> mostra o código

[CodeAssistant]: Aqui está a refatoração:
```

É isso. Simples e efetivo para quem quer codar, não configurar ferramentas.