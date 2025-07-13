# 🤖 War Room - Interface Inteligente tipo Claude CLI

## 🎯 Visão Geral

A interface inteligente do War Room oferece uma experiência similar ao Claude CLI, com recursos avançados de autocompletar, contexto persistente e sugestões inteligentes.

## 🚀 Como Ativar

### 1. Instalar Dependências

```bash
cd warroom-cli
npm install inquirer-autocomplete-prompt ora boxen gradient-string
```

### 2. Executar Interface Inteligente

```bash
# Comando básico
warroom smart

# Com alias
warroom s

# Com contexto inicial
warroom smart -c src/app.js src/utils.js -t "Refatorar aplicação"
```

## ✨ Recursos Principais

### 1. **Autocompletar Inteligente**
- Sugestões contextuais baseadas no que você está digitando
- Histórico de comandos anteriores
- Comandos slash como `/add`, `/analyze`, `/help`
- Syntax highlighting em tempo real

### 2. **Contexto Persistente**
- Adicione arquivos ao contexto com `/add <arquivo>`
- Defina tarefas com `/task <descrição>`
- O contexto é mantido durante toda a sessão
- Indicadores visuais mostram o estado atual

### 3. **Comandos Slash** (Similar ao Claude)

| Comando | Descrição |
|---------|-----------|
| `/add <file>` | Adiciona arquivo ao contexto |
| `/clear` | Limpa todo o contexto |
| `/task <desc>` | Define a tarefa atual |
| `/analyze` | Analisa o contexto atual |
| `/suggest` | Obtém sugestões de IA |
| `/review` | Revisão de código |
| `/refactor` | Sugestões de refatoração |
| `/test` | Gera testes |
| `/docs` | Gera documentação |
| `/help` | Mostra ajuda |
| `/exit` | Sai da interface |

### 4. **Linguagem Natural**
- Digite perguntas e comandos em linguagem natural
- A IA entende contexto e intenção
- Respostas personalizadas baseadas nos arquivos carregados

## 📝 Exemplos de Uso

### Exemplo 1: Análise de Código

```bash
warroom smart

# Na interface:
/add src/server.js
/add src/routes/api.js
/task Melhorar performance da API

Quais endpoints estão lentos?
Como posso otimizar as queries?
Sugira melhorias de cache
```

### Exemplo 2: Refatoração

```bash
warroom smart -c src/components/

# Na interface:
/task Refatorar componentes para hooks

Quais componentes ainda usam classes?
Como converter para functional components?
Gere um plano de refatoração
```

### Exemplo 3: Geração de Testes

```bash
warroom smart

# Na interface:
/add src/utils/validation.js
/test

Gere testes unitários para as funções de validação
Adicione casos edge
Use Jest como framework
```

## 🎨 Interface Visual

### Prompt Contextual
```
warroom » [📎 2 files | 🎯 Refatorar API | 💬 Turn 3]
```

### Indicadores:
- 📎 **Files**: Número de arquivos no contexto
- 🎯 **Task**: Tarefa atual definida
- 💬 **Turn**: Número do turno da conversa

### Cores e Destaques:
- **Magenta**: Comandos slash
- **Amarelo**: Palavras-chave importantes
- **Ciano**: Prompts e títulos
- **Verde**: Sucessos e confirmações
- **Vermelho**: Erros e avisos

## 🔧 Configuração Avançada

### Arquivo de Configuração
Crie `~/.warroom/config.json`:

```json
{
  "interface": {
    "theme": "dark",
    "autocomplete": true,
    "historySize": 1000,
    "contextLimit": 20
  },
  "ai": {
    "defaultModel": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

## 💡 Dicas de Produtividade

1. **Use Tab** para autocompletar comandos
2. **Setas ↑/↓** navegam no histórico
3. **Ctrl+R** busca no histórico (como no terminal)
4. **Ctrl+L** limpa a tela
5. **Ctrl+C** cancela o comando atual

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
```bash
cd warroom-cli
npm install
```

### Interface não inicia
```bash
# Verificar se as dependências estão instaladas
npm list inquirer-autocomplete-prompt
```

### Autocompletar não funciona
Certifique-se de que o terminal suporta recursos interativos.

## 🔗 Integração com DAG Visualizer

A interface inteligente se integra perfeitamente com o DAG visualizer:

```bash
# Na interface smart:
/add src/
/analyze
/task Visualizar dependências

# Automaticamente abre o DAG visualizer
Mostre o grafo de dependências
```

## 🚀 Próximas Funcionalidades

- [ ] Integração com GPT-4 real
- [ ] Salvamento de sessões
- [ ] Compartilhamento de contexto entre equipes
- [ ] Plugins personalizados
- [ ] Temas customizáveis

---

**War Room Smart Interface** - Desenvolvimento assistido por IA, direto no seu terminal! 🎯